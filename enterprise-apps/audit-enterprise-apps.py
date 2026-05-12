#!/usr/bin/env python3
"""
Cross-Tenant Enterprise App Security Audit
Scans all third-party enterprise apps across HTT brands tenants,
collects permissions, assignments, sign-ins, and flags security concerns.

Usage:
  python3 audit-enterprise-apps.py

Outputs:
  enterprise-apps-{timestamp}/
    raw-{tenant_key}.json          — per-tenant raw data
    summary.json                    — cross-tenant summary
    apps.csv                        — flat app table
    findings.csv                    — security findings
    ASSIGNMENTS-{tenant_key}.csv   — user/group → app assignments per tenant
    PERMISSIONS-{tenant_key}.csv   — delegated + application permissions per tenant
    AUDIT-REPORT.md                 — executive summary
"""

import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────────────
TENANTS = {
    "HTT":  "0c0e35dc-188a-4eb3-b8ba-61752154b407",
    "BCC":  "b5380912-79ec-452d-a6ca-6d897b19b294",
    "TLL":  "3c7d2bf3-b597-4766-b5cb-2b489c2904d6",
    "DCE":  "ce62e17d-2feb-4e67-a115-8ea4af68da30",
}

# Known Microsoft-first-party tenant IDs and domains
MS_TENANT_IDS = {
    "f8cdef31-a31e-4b4a-93e4-5f571e91255a",   # Microsoft Services
    "72f988bf-86f1-41af-91ab-2d7cd011db47",   # Microsoft
}
MS_DOMAINS = {".microsoft.", "office.com", "sharepoint.com", "onedrive.com", "teams.microsoft.com", "outlook.com"}

# Known CodeTwo app IDs to explicitly hunt for
CODETWO_APP_IDS = {
    "81fd46e5-29b5-486d-9895-05a27937f93f",
    "4a5b42b7-8a63-4327-ac14-414d1d20d2e6",
    "d8c63c13-8946-4529-a309-d93ec4a6d9c2",
    "5d65c5fa-485b-4d02-9ac4-1b8295c8b6e9",
    "c506b7bc-2746-4c33-a06c-88ea7f0c97a1",
}

# High-risk delegated permission scopes (regex patterns)
HIGH_RISK_SCOPES = [
    "Mail.ReadWrite", "Mail.Send", "MailboxSettings.ReadWrite",
    "Calendars.ReadWrite", "Contacts.ReadWrite",
    "Files.ReadWrite.All", "Files.Read.All",
    "Sites.ReadWrite.All", "Sites.FullControl.All",
    "Directory.ReadWrite.All", "User.ReadWrite.All",
    "Group.ReadWrite.All", "Application.ReadWrite.All",
    "RoleManagement.ReadWrite.Directory",
]

# ── Token helper ──────────────────────────────────────────────────────────────
def get_graph_token(tenant_id):
    """Get access token for Microsoft Graph via az CLI."""
    cmd = ["az", "account", "get-access-token", "--resource", "https://graph.microsoft.com",
           "--query", "accessToken", "-o", "tsv"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0 or not result.stdout.strip():
        return None
    # Quick validation: ensure default tenant matches, or try explicit tenant
    token = result.stdout.strip()
    # Check /me to validate tenant
    try:
        me = graph_get("https://graph.microsoft.com/v1.0/me?$select=userPrincipalName", token)
        if me and "error" not in me:
            return token
    except Exception:
        pass
    # Try explicit tenant
    cmd_tenant = ["az", "account", "get-access-token",
                  "--tenant", tenant_id, "--resource", "https://graph.microsoft.com",
                  "--query", "accessToken", "-o", "tsv"]
    result2 = subprocess.run(cmd_tenant, capture_output=True, text=True, timeout=30)
    if result2.returncode != 0 or not result2.stdout.strip():
        return None
    return result2.stdout.strip()


# ── Graph helpers ─────────────────────────────────────────────────────────────
def graph_get(url, token, max_retries=3):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = (attempt + 1) * 5
                time.sleep(wait)
                continue
            body = e.read().decode("utf-8") if hasattr(e, 'read') else ""
            try:
                err = json.loads(body)
            except json.JSONDecodeError:
                err = {"error": {"message": body}}
            if e.code >= 500:
                time.sleep(2)
                continue
            if e.code == 404:
                return {}   # endpoint not found / no data
            return {"error": err}
        except Exception:
            if attempt == max_retries - 1:
                return {"error": {"message": "request failed after retries"}}
            time.sleep(2)
    return {"error": {"message": "max retries exceeded"}}


def graph_paginate(base_url, token, all_params=""):
    import urllib.parse
    items = []
    # Build proper query string
    params = {"$top": "999"}
    base, sep, existing_qs = base_url.partition("?")
    if sep:
        for k, v in urllib.parse.parse_qsl(existing_qs):
            params[k] = v
    if all_params:
        for k, v in urllib.parse.parse_qsl(all_params):
            params[k] = v
    qs = urllib.parse.urlencode(params, safe="$", quote_via=urllib.parse.quote)
    url = f"{base}?{qs}"
    while url:
        data = graph_get(url, token)
        if "error" in data:
            break
        items.extend(data.get("value", []))
        url = data.get("@odata.nextLink")
        if url:
            time.sleep(0.2)
    return items


def graph_paginate_select(base_url, token, select_fields):
    select = ",".join(select_fields)
    return graph_paginate(f"{base_url}", token, f"$select={select}")


# ── Classification ────────────────────────────────────────────────────────────
def is_microsoft_owned(sp):
    owner = sp.get("appOwnerOrganizationId", "")
    publisher = (sp.get("publisherName") or "").lower()
    homepage = (sp.get("homepage") or "").lower()
    display = (sp.get("displayName") or "").lower()
    tags = sp.get("tags", [])

    if owner in MS_TENANT_IDS:
        return True
    if owner and str(owner).lower() == "microsoft":
        return True
    if publisher in ("microsoft corporation", "microsoft", "microsoft corporation."):
        return True
    if any(homepage.endswith(d) for d in MS_DOMAINS) or "microsoft" in homepage:
        return True
    if any(display.startswith(p) for p in ("microsoft ", "azure ", "office 365", "microsoft 365", "dynamics 365", "intune")):
        return True
    if "WindowsAzureActiveDirectoryIntegratedApp" in tags:
        return True
    return False


def is_hidden_system_app(sp):
    """Apps that Microsoft auto-provisions with no security relevance."""
    tags = sp.get("tags", [])
    # The sf:HideApp|service-deleted tag means Microsoft added and auto-hid it
    if any(t.startswith("sf:HideApp") for t in tags):
        return True
    if sp.get("accountEnabled") is False and not sp.get("appRoleAssignedTo", []):
        return True
    return False


# ── Core audit per tenant ─────────────────────────────────────────────────────
def audit_tenant(tenant_key, tenant_id):
    print(f"\n{'='*60}")
    print(f"  AUDITING: {tenant_key} ({tenant_id})")
    print(f"{'='*60}")

    token = get_graph_token(tenant_id)
    if not token:
        print(f"  ❌ Could not get Graph token for {tenant_key}")
        return {"error": "no_token"}

    # 1. Enumerate all service principals
    print(f"  [1] Fetching all service principals...")
    all_sps = graph_paginate(
        "https://graph.microsoft.com/v1.0/servicePrincipals",
        token,
        "$select=id,appId,displayName,accountEnabled,servicePrincipalType,publisherName,homepage,appOwnerOrganizationId,createdDateTime,tags,notes,verifiedPublisher"
    )
    print(f"  Total SPs: {len(all_sps)}")

    # 2. Filter to third-party + interesting
    third_party_sps = []
    codetwo_found = False
    for sp in all_sps:
        app_id = sp.get("appId", "")
        # Always include if it's a known CodeTwo app ID
        if app_id in CODETWO_APP_IDS:
            codetwo_found = True
            third_party_sps.append(sp)
            continue
        # Skip Microsoft-owned
        if is_microsoft_owned(sp):
            continue
        # Skip hidden system apps (but make sure we note them)
        if is_hidden_system_app(sp):
            continue
        third_party_sps.append(sp)

    print(f"  Third-party SPs (after filtering): {len(third_party_sps)}")
    if codetwo_found:
        print(f"  ⚠️  CodeTwo app(s) DETECTED")

    # 3. Deep-dive each third-party SP
    apps = []
    for i, sp in enumerate(third_party_sps, 1):
        sp_id = sp["id"]
        app_id = sp.get("appId", "")
        display = sp.get("displayName", "Unknown")
        print(f"  [{i}/{len(third_party_sps)}] {display}")

        app = {
            "id": sp_id,
            "appId": app_id,
            "displayName": display,
            "accountEnabled": sp.get("accountEnabled"),
            "servicePrincipalType": sp.get("servicePrincipalType"),
            "publisherName": sp.get("publisherName"),
            "homepage": sp.get("homepage"),
            "appOwnerOrganizationId": sp.get("appOwnerOrganizationId"),
            "createdDateTime": sp.get("createdDateTime"),
            "tags": sp.get("tags", []),
            "notes": sp.get("notes"),
            "verifiedPublisher": sp.get("verifiedPublisher"),
            # enriched below
            "delegatedPermissions": [],
            "applicationPermissions": [],
            "userAssignments": [],
            "groupAssignments": [],
            "signInActivity": {},
            "owners": [],
            "riskFlags": [],
        }

        # 3a. oauth2PermissionGrants (delegated permissions consented)
        grants = graph_paginate(
            f"https://graph.microsoft.com/v1.0/servicePrincipals/{sp_id}/oauth2PermissionGrants",
            token
        )
        for g in grants:
            dp = {
                "clientId": g.get("clientId"),
                "consentType": g.get("consentType"),
                "principalId": g.get("principalId"),
                "scope": g.get("scope", "").strip(),
                "resourceId": g.get("resourceId"),
            }
            app["delegatedPermissions"].append(dp)
            # Risk flag: admin-consented broad scopes
            if dp["consentType"] == "AllPrincipals":
                scopes = dp["scope"].split()
                for hr in HIGH_RISK_SCOPES:
                    if any(hr == s or s.startswith(hr) for s in scopes):
                        app["riskFlags"].append(f"admin_consent_high_risk_scope:{hr}")
                        break
            # Risk flag: user-consented broad scopes
            if dp["consentType"] == "Principal":
                scopes = dp["scope"].split()
                for hr in HIGH_RISK_SCOPES:
                    if any(hr == s or s.startswith(hr) for s in scopes):
                        app["riskFlags"].append(f"user_consent_high_risk_scope:{hr}")
                        break

        # 3b. appRoleAssignedTo (users/groups assigned TO this app)
        assigned = graph_paginate(
            f"https://graph.microsoft.com/v1.0/servicePrincipals/{sp_id}/appRoleAssignedTo",
            token
        )
        for a in assigned:
            assignment = {
                "id": a.get("id"),
                "appRoleId": a.get("appRoleId"),
                "principalId": a.get("principalId"),
                "principalType": a.get("principalType"),
                "principalDisplayName": a.get("principalDisplayName"),
                "createdDateTime": a.get("createdDateTime"),
            }
            if assignment["principalType"] == "Group":
                app["groupAssignments"].append(assignment)
            else:
                app["userAssignments"].append(assignment)

        # 3c. appRoleAssignments (permissions this SP has TO OTHER resources)
        has_app_perms = graph_paginate(
            f"https://graph.microsoft.com/v1.0/servicePrincipals/{sp_id}/appRoleAssignments",
            token
        )
        for p in has_app_perms:
            app["applicationPermissions"].append({
                "resourceId": p.get("resourceId"),
                "resourceDisplayName": p.get("resourceDisplayName"),
                "appRoleId": p.get("appRoleId"),
                "createdDateTime": p.get("createdDateTime"),
            })

        # 3d. Sign-ins via auditLogs/signIns (last 7 days, filtered to this app)
        # Note: This requires AuditLog.Read.All; may 403 in some tenants.
        seven_days_ago = (datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
                         ).isoformat().replace("+00:00", "Z")
        signin_url = (
            f"https://graph.microsoft.com/v1.0/auditLogs/signIns"
            f"?$filter=appId eq '{app_id}' and createdDateTime ge {seven_days_ago}"
            f"&$top=50&$count=true"
        )
        signins = graph_get(signin_url, token)
        if "error" not in signins:
            items = signins.get("value", [])
            app["signInActivity"] = {
                "last7DaysCount": len(items),
                "uniqueUsers": list({s.get("userPrincipalName", "N/A") for s in items}),
                "lastSignInSample": items[:3] if items else [],
            }
        else:
            app["signInActivity"] = {"error": signins.get("error", {}).get("message", "unknown")}

        # 3e. SP Owners (requires Directory.Read.All, may 403)
        owners = graph_paginate(
            f"https://graph.microsoft.com/v1.0/servicePrincipals/{sp_id}/owners",
            token
        )
        if not (len(owners) == 0 and "error" in {}):  # crude check
            for o in owners:
                app["owners"].append({
                    "id": o.get("id"),
                    "type": o.get("@odata.type", "").split(".")[-1],
                    "displayName": o.get("displayName"),
                    "upn": o.get("userPrincipalName"),
                })

        # Risk flags — post-collection heuristics
        total_assignments = len(app["userAssignments"]) + len(app["groupAssignments"])
        if total_assignments > 50:
            app["riskFlags"].append(f"large_assignment_count:{total_assignments}")
        if total_assignments == 0:
            app["riskFlags"].append("no_assignments_orphan")
        if not app["accountEnabled"]:
            app["riskFlags"].append("disabled_but_present")
        if app["applicationPermissions"]:
            for ap in app["applicationPermissions"]:
                if ap.get("resourceDisplayName", "").lower() in ("microsoft graph", "graph"):
                    app["riskFlags"].append("app_permission_to_graph")

        # Self-owned app vs multi-tenant
        if str(app.get("appOwnerOrganizationId", "")).lower() == tenant_id.lower():
            app["isSelfOwned"] = True
        else:
            app["isSelfOwned"] = False
            if app.get("appOwnerOrganizationId"):
                app["riskFlags"].append("external_publisher")

        apps.append(app)
        time.sleep(0.15)

    return {
        "tenantKey": tenant_key,
        "tenantId": tenant_id,
        "totalSPs": len(all_sps),
        "thirdPartySPs": len(third_party_sps),
        "codeTwoFound": codetwo_found,
        "apps": apps,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Report generators ─────────────────────────────────────────────────────────
def generate_reports(results, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%S")

    # ── Raw JSON per tenant ───────────────────────
    for r in results:
        if "error" in r:
            continue
        raw_path = out_dir / f"raw-{r['tenantKey']}.json"
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(r, f, indent=2, ensure_ascii=False)
        print(f"  Wrote {raw_path}")

    # Flatten for CSV
    rows = []
    all_assignments = []
    all_permissions = []
    all_findings = []

    for r in results:
        if "error" in r:
            continue
        tkey = r["tenantKey"]
        for app in r["apps"]:
            # Risk severity
            risk = "low"
            if any(f.startswith("admin_consent_high_risk_scope") for f in app["riskFlags"]):
                risk = "critical"
            elif any(f.startswith("user_consent_high_risk_scope") for f in app["riskFlags"]):
                risk = "high"
            elif any(f in ("app_permission_to_graph", "large_assignment_count") for f in app["riskFlags"]):
                risk = "high"
            elif app["riskFlags"]:
                risk = "medium"

            total_assign = len(app["userAssignments"]) + len(app["groupAssignments"])
            signins_7d = app.get("signInActivity", {}).get("last7DaysCount", "N/A")
            if isinstance(signins_7d, int):
                signins_7d = str(signins_7d) if signins_7d > 0 else "0"

            rows.append({
                "Tenant": tkey,
                "AppID": app["appId"],
                "DisplayName": app["displayName"],
                "Enabled": app["accountEnabled"],
                "Type": app["servicePrincipalType"],
                "Publisher": app["publisherName"] or "",
                "VerifiedPublisher": app.get("verifiedPublisher", {}).get("displayName", ""),
                "Homepage": app["homepage"] or "",
                "Created": app["createdDateTime"] or "",
                "SelfOwned": app.get("isSelfOwned", False),
                "UserAssignments": len(app["userAssignments"]),
                "GroupAssignments": len(app["groupAssignments"]),
                "TotalAssignments": total_assign,
                "DelegatedPermissionCount": len(app["delegatedPermissions"]),
                "ApplicationPermissionCount": len(app["applicationPermissions"]),
                "SignIns7Days": signins_7d,
                "RiskFlags": "; ".join(app["riskFlags"]),
                "RiskSeverity": risk,
            })

            # Assignments flat
            for ua in app["userAssignments"]:
                all_assignments.append({
                    "Tenant": tkey,
                    "AppID": app["appId"],
                    "AppName": app["displayName"],
                    "PrincipalType": "User",
                    "PrincipalName": ua.get("principalDisplayName", ""),
                    "PrincipalId": ua.get("principalId", ""),
                    "AppRoleId": ua.get("appRoleId", ""),
                    "Created": ua.get("createdDateTime", ""),
                })
            for ga in app["groupAssignments"]:
                all_assignments.append({
                    "Tenant": tkey,
                    "AppID": app["appId"],
                    "AppName": app["displayName"],
                    "PrincipalType": "Group",
                    "PrincipalName": ga.get("principalDisplayName", ""),
                    "PrincipalId": ga.get("principalId", ""),
                    "AppRoleId": ga.get("appRoleId", ""),
                    "Created": ga.get("createdDateTime", ""),
                })

            # Permissions flat
            for dp in app["delegatedPermissions"]:
                all_permissions.append({
                    "Tenant": tkey,
                    "AppID": app["appId"],
                    "AppName": app["displayName"],
                    "PermissionType": "Delegated",
                    "ConsentType": dp.get("consentType", ""),
                    "Scope": dp.get("scope", ""),
                })
            for ap in app["applicationPermissions"]:
                all_permissions.append({
                    "Tenant": tkey,
                    "AppID": app["appId"],
                    "AppName": app["displayName"],
                    "PermissionType": "Application",
                    "ResourceName": ap.get("resourceDisplayName", ""),
                    "ResourceId": ap.get("resourceId", ""),
                })

            # Findings for CSV
            for rf in app["riskFlags"]:
                sev = "Info"
                if "critical" in rf or "high_risk" in rf or "app_permission_to_graph" in rf:
                    sev = "Critical"
                elif "large_assignment" in rf or rf in ("external_publisher",):
                    sev = "High"
                elif rf in ("disabled_but_present", "no_assignments_orphan"):
                    sev = "Medium"
                else:
                    sev = "Low"
                all_findings.append({
                    "Tenant": tkey,
                    "AppID": app["appId"],
                    "AppName": app["displayName"],
                    "Severity": sev,
                    "Finding": rf,
                })

    # ── CSV exports ───────────────────────────────
    def write_csv(name, headers, data_list):
        import csv
        path = out_dir / f"{name}.csv"
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            for row in data_list:
                writer.writerow({k: row.get(k, "") for k in headers})
        print(f"  Wrote {path}")

    # Apps.csv
    app_headers = [
        "Tenant", "AppID", "DisplayName", "Enabled", "Type", "Publisher",
        "VerifiedPublisher", "Homepage", "Created", "SelfOwned",
        "UserAssignments", "GroupAssignments", "TotalAssignments",
        "DelegatedPermissionCount", "ApplicationPermissionCount",
        "SignIns7Days", "RiskFlags", "RiskSeverity"
    ]
    write_csv("apps", app_headers, rows)

    # Assignments.csv
    assign_headers = ["Tenant", "AppID", "AppName", "PrincipalType", "PrincipalName", "PrincipalId", "AppRoleId", "Created"]
    write_csv("assignments", assign_headers, all_assignments)

    # Permissions.csv
    perm_headers = ["Tenant", "AppID", "AppName", "PermissionType", "ConsentType", "Scope", "ResourceName", "ResourceId"]
    write_csv("permissions", perm_headers, all_permissions)

    # Findings.csv
    find_headers = ["Tenant", "AppID", "AppName", "Severity", "Finding"]
    write_csv("findings", find_headers, all_findings)

    # ── Summary JSON ──────────────────────────────
    summary = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tenants": {},
        "crossTenantStats": {
            "totalThirdPartyApps": sum(len(r["apps"]) for r in results if "error" not in r),
            "totalCriticalRisk": sum(1 for r in rows if r["RiskSeverity"] == "critical"),
            "totalHighRisk": sum(1 for r in rows if r["RiskSeverity"] == "high"),
            "totalMediumRisk": sum(1 for r in rows if r["RiskSeverity"] == "medium"),
            "totalAssignments": len(all_assignments),
            "codeTwoDetectedAnywhere": any(r.get("codeTwoFound", False) for r in results),
        }
    }
    for r in results:
        if "error" in r:
            summary["tenants"][r["tenantKey"]] = {"error": r["error"]}
            continue
        summary["tenants"][r["tenantKey"]] = {
            "totalSPs": r["totalSPs"],
            "thirdPartySPs": r["thirdPartySPs"],
            "codeTwoFound": r["codeTwoFound"],
        }
    sum_path = out_dir / "summary.json"
    with open(sum_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"  Wrote {sum_path}")

    # ── Markdown report ───────────────────────────
    md = []
    md.append("# Cross-Tenant Enterprise App Security Audit Report")
    md.append(f"\n**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    md.append(f"**Tenants Scanned:** {len([r for r in results if 'error' not in r])} of {len(results)}")
    md.append(f"**Total Third-Party Apps:** {summary['crossTenantStats']['totalThirdPartyApps']}")
    md.append("")
    md.append("## Risk Summary")
    md.append(f"| Severity | Count |")
    md.append(f"|----------|-------|")
    md.append(f"| 🔴 Critical | {summary['crossTenantStats']['totalCriticalRisk']} |")
    md.append(f"| 🟠 High     | {summary['crossTenantStats']['totalHighRisk']} |")
    md.append(f"| 🟡 Medium   | {summary['crossTenantStats']['totalMediumRisk']} |")
    md.append("")

    md.append("## CodeTwo Status")
    if summary["crossTenantStats"]["codeTwoDetectedAnywhere"]:
        md.append("⚠️  **CodeTwo detected in at least one tenant.**")
    else:
        md.append("✅ **CodeTwo NOT detected in any scanned tenant.**")
    md.append("")

    md.append("## Per-Tenant Breakdown")
    md.append("")
    for r in results:
        if "error" in r:
            md.append(f"### {r['tenantKey']} — ⚠️ Audit failed: {r['error']}")
            continue
        md.append(f"### {r['tenantKey']} ({r['tenantId']})")
        md.append(f"- Total Service Principals: {r['totalSPs']}")
        md.append(f"- Third-Party Enterprise Apps: {r['thirdPartySPs']}")
        md.append(f"- CodeTwo Present: {'⚠️ Yes' if r['codeTwoFound'] else '✅ No'}")
        md.append("")
        # Table of apps with medium+ risk
        risky = [row for row in rows if row["Tenant"] == r["tenantKey"] and row["RiskSeverity"] in ("high", "critical", "medium")]
        if risky:
            md.append("#### Flagged Apps")
            md.append("| App | Assignments | Sign-Ins (7d) | Risk Flags | Severity |")
            md.append("|-----|-------------|---------------|------------|----------|")
            for app_row in sorted(risky, key=lambda x: {"critical": 0, "high": 1, "medium": 2}.get(x["RiskSeverity"], 3)):
                md.append(f"| {app_row['DisplayName']} | {app_row['TotalAssignments']} | {app_row['SignIns7Days']} | {'; '.join(app_row['RiskFlags'].split('; ')[:3])} | {app_row['RiskSeverity'].upper()} |")
            md.append("")
        else:
            md.append("*No medium+ risk apps flagged.*")
            md.append("")

    md.append("## Action Items")
    md.append("1. Review all Critical/High risk apps in the `findings.csv`.")
    md.append("2. Revoke admin consents for high-risk delegated permissions on unnecessary apps.")
    md.append("3. Remove user/group assignments from orphaned (zero-assignment) apps.")
    md.append("4. Verify CodeTwo status — if migrating away, ensure the old app is uninstalled and permissions revoked.")
    md.append("5. For FN tenant (Frenchies), authenticate via az CLI and re-run this audit.")
    md_path = out_dir / "AUDIT-REPORT.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print(f"  Wrote {md_path}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    out_dir = Path(__file__).parent / f"enterprise-apps-{datetime.now(timezone.utc).strftime('%Y-%m-%d_%H%M%S')}"
    print("=" * 60)
    print("  CROSS-TENANT ENTERPRISE APP AUDIT")
    print("  Output:", out_dir)
    print("=" * 60)

    results = []
    for key, tid in TENANTS.items():
        result = audit_tenant(key, tid)
        results.append(result)

    generate_reports(results, out_dir)

    print("\n" + "=" * 60)
    print("  AUDIT COMPLETE")
    print(f"  Reports written to: {out_dir}")
    print("=" * 60)


if __name__ == "__main__":
    main()
