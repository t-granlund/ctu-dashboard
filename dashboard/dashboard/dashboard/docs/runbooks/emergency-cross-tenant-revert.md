# Emergency Cross-Tenant Policy Revert

> **Severity**: 🔴 CRITICAL — Break-glass procedure  
> **Estimated Recovery Time**: < 15 minutes  
> **Last Updated**: 2025-05-31  
> **Owner**: Tyler Granlund / Dustin Boyd

---

## When to Use This Runbook

Use this procedure **immediately** when:

- All or multiple brand tenants have lost cross-tenant access to HTT resources
- Partner override policies are missing, broken, or misconfigured after a remediation
- Users from BCC, FN, TLL, or DCE cannot authenticate to HTT SharePoint, Teams, or other M365 services
- A `Set-DenyByDefault.ps1` execution completed Phase C (default deny applied) but partner overrides from Phase A failed silently
- Azure Monitor fires the `unexpected-crosstenancy-alert` KQL query showing mass access failures

**Do NOT use this runbook for**:

- Single-user access issues (troubleshoot per-user first)
- Conditional Access blocks (see CA troubleshooting instead)
- Sync failures without access loss (see `sync-failure-investigation.md`)
- Planned policy changes (use `Set-DenyByDefault.ps1 -WhatIf` workflow)

---

## Prerequisites

| Requirement | Details |
|---|---|
| **Admin Account** | `tyler.granlund-admin@httbrands.com` (primary) or `dustin.boyd-admin@httbrands.com` (secondary) |
| **Role Required** | Global Administrator on HTT hub tenant (`0c0e35dc-188a-4eb3-b8ba-61752154b407`) |
| **PowerShell** | PowerShell 7+ with `Microsoft.Graph` module installed |
| **Network** | Internet access to `graph.microsoft.com` and `login.microsoftonline.com` |
| **Snapshot File** | A saved policy snapshot from `Save-CTUPolicySnapshot.ps1` (if using Option A) |

> ⚠️ **Always connect to the HTT hub tenant first.** The default cross-tenant access policy
> lives on the hub. Partner overrides also live on the hub. Reverting the hub restores
> inbound access for all brand tenants.

---

## Option A: Restore from Saved Snapshot (Preferred)

This is the fastest and safest option if a pre-remediation snapshot exists.

### Step 1 — Locate the Snapshot

Snapshots are saved by `Save-CTUPolicySnapshot.ps1` (or auto-saved by `Set-DenyByDefault.ps1`)
to `reports/snapshots/`.

```powershell
# List available snapshots (most recent first)
Get-ChildItem -Path "reports/snapshots/" -Filter "HTT_full-snapshot_*.json" |
    Sort-Object LastWriteTime -Descending |
    Select-Object Name, LastWriteTime, Length -First 10
```

### Step 2 — Preview the Restore (WhatIf)

```powershell
./scripts/remediation/Restore-CTUPolicySnapshot.ps1 `
    -SnapshotPath "reports/snapshots/HTT_full-snapshot_<timestamp>.json" `
    -WhatIf
```

Review the diff output. Confirm the snapshot state is the desired "known-good" configuration.

### Step 3 — Execute the Restore

```powershell
./scripts/remediation/Restore-CTUPolicySnapshot.ps1 `
    -SnapshotPath "reports/snapshots/HTT_full-snapshot_<timestamp>.json" `
    -Force
```

The `-Force` flag skips interactive confirmation. Use it only in genuine emergencies.

### Step 4 — Verify Access Restored

```powershell
# Re-query the default policy to confirm it's reverted
Connect-MgGraph -TenantId "0c0e35dc-188a-4eb3-b8ba-61752154b407" -Scopes "Policy.Read.All"
$defaultPolicy = Invoke-MgGraphRequest -Method GET `
    -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/default"
$defaultPolicy | ConvertTo-Json -Depth 10
```

Confirm `b2bCollaborationInbound.applications.accessType` is `"allowed"` (or whatever
the pre-remediation state was).

---

## Option B: Manual Revert via Graph API (No Snapshot Available)

Use this when no snapshot file exists. This resets the default policy to **allow all** —
the original open-by-default state.

### Step 1 — Connect to HTT Hub Tenant

```powershell
Connect-MgGraph -TenantId "0c0e35dc-188a-4eb3-b8ba-61752154b407" `
    -Scopes "Policy.ReadWrite.CrossTenantAccess"
```

### Step 2 — Save Current (Broken) State First

Even in an emergency, capture what's there now for post-incident analysis:

```powershell
$currentDefault = Invoke-MgGraphRequest -Method GET `
    -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/default"
$currentDefault | ConvertTo-Json -Depth 10 |
    Out-File "reports/snapshots/HTT_emergency-before-revert_$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
```

### Step 3 — PATCH Default Policy to Allow All

```powershell
$revertBody = @{
    b2bCollaborationInbound = @{
        usersAndGroups = @{
            accessType = "allowed"
            targets     = @(@{ target = "AllUsers"; targetType = "user" })
        }
        applications = @{
            accessType = "allowed"
            targets     = @(@{ target = "AllApplications"; targetType = "application" })
        }
    }
    b2bCollaborationOutbound = @{
        usersAndGroups = @{
            accessType = "allowed"
            targets     = @(@{ target = "AllUsers"; targetType = "user" })
        }
        applications = @{
            accessType = "allowed"
            targets     = @(@{ target = "AllApplications"; targetType = "application" })
        }
    }
    b2bDirectConnectInbound = @{
        usersAndGroups = @{
            accessType = "allowed"
            targets     = @(@{ target = "AllUsers"; targetType = "user" })
        }
        applications = @{
            accessType = "allowed"
            targets     = @(@{ target = "AllApplications"; targetType = "application" })
        }
    }
    b2bDirectConnectOutbound = @{
        usersAndGroups = @{
            accessType = "allowed"
            targets     = @(@{ target = "AllUsers"; targetType = "user" })
        }
        applications = @{
            accessType = "allowed"
            targets     = @(@{ target = "AllApplications"; targetType = "application" })
        }
    }
    inboundTrust = @{
        isMfaAccepted                       = $true
        isCompliantDeviceAccepted           = $false
        isHybridAzureADJoinedDeviceAccepted = $false
    }
} | ConvertTo-Json -Depth 10

Invoke-MgGraphRequest -Method PATCH `
    -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/default" `
    -Body $revertBody `
    -ContentType "application/json"
```

### Step 4 — Verify the PATCH Applied

```powershell
$verifyPolicy = Invoke-MgGraphRequest -Method GET `
    -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/default"

# Quick sanity check
$inboundAccess = $verifyPolicy.b2bCollaborationInbound.applications.accessType
if ($inboundAccess -eq "allowed") {
    Write-Host "✅ Default policy reverted to ALLOW — cross-tenant access restored" -ForegroundColor Green
} else {
    Write-Host "❌ Revert may have failed — accessType is: $inboundAccess" -ForegroundColor Red
    Write-Host "Escalate immediately to Tyler Granlund" -ForegroundColor Red
}
```

### Step 5 — Verify Partner Override Policies Still Exist

```powershell
$partners = Invoke-MgGraphRequest -Method GET `
    -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners"

Write-Host "Partner override count: $($partners.value.Count)"
$partners.value | ForEach-Object {
    Write-Host "  Tenant: $($_.tenantId) — Inbound B2B: $($_.b2bCollaborationInbound.applications.accessType)"
}
```

Expected partners (4):

| Alias | Tenant ID |
|---|---|
| BCC | `b5380912-79ec-452d-a6ca-6d897b19b294` |
| FN  | `98723287-044b-4bbb-9294-19857d4128a0` |
| TLL | `3c7d2bf3-b597-4766-b5cb-2b489c2904d6` |
| DCE | `ce62e17d-2feb-4e67-a115-8ea4af68da30` |

---

## Option C: Manual Revert via Entra Admin Center (Portal)

Use this as a last resort if PowerShell/Graph is unavailable (e.g., token issues, module
broken, network restrictions).

### Direct URLs

| Tenant | Entra Admin Center URL |
|---|---|
| **HTT (Hub)** | <https://entra.microsoft.com/0c0e35dc-188a-4eb3-b8ba-61752154b407/#view/Microsoft_AAD_IAM/CompanyRelationshipsMenuBlade/~/CrossTenantAccessSettings> |
| **BCC** | <https://entra.microsoft.com/b5380912-79ec-452d-a6ca-6d897b19b294/#view/Microsoft_AAD_IAM/CompanyRelationshipsMenuBlade/~/CrossTenantAccessSettings> |
| **FN** | <https://entra.microsoft.com/98723287-044b-4bbb-9294-19857d4128a0/#view/Microsoft_AAD_IAM/CompanyRelationshipsMenuBlade/~/CrossTenantAccessSettings> |
| **TLL** | <https://entra.microsoft.com/3c7d2bf3-b597-4766-b5cb-2b489c2904d6/#view/Microsoft_AAD_IAM/CompanyRelationshipsMenuBlade/~/CrossTenantAccessSettings> |
| **DCE** | <https://entra.microsoft.com/ce62e17d-2feb-4e67-a115-8ea4af68da30/#view/Microsoft_AAD_IAM/CompanyRelationshipsMenuBlade/~/CrossTenantAccessSettings> |

### Portal Steps

1. Open the **HTT (Hub)** URL above
2. Sign in as `tyler.granlund-admin@httbrands.com`
3. Navigate to **External Identities** → **Cross-tenant access settings**
4. Click **Default settings** (the pencil/edit icon)
5. Under **Inbound access — B2B collaboration**:
   - Set **Users and groups** → **Allow access** → **All users**
   - Set **Applications** → **Allow access** → **All applications**
6. Under **Inbound access — B2B direct connect**: repeat the same
7. Click **Save**
8. Verify partner-specific policies still appear in the list below the default

---

## Post-Incident Procedure

After access is restored, **do not just walk away**. Complete these steps:

### 1. Document the Incident

Create an incident record with:

- **Timestamp**: When was the outage detected?
- **Duration**: How long were users affected?
- **Blast radius**: Which tenants/users were impacted?
- **Root cause**: What change triggered the outage?
- **Recovery method**: Which option (A/B/C) was used?
- **Snapshot used**: If Option A, which snapshot file?

### 2. Re-Run the Audit

```powershell
./scripts/Invoke-FullAudit.ps1 -TenantFilter "HTT"
```

Compare the post-revert state to `config/baseline.json` to understand current posture.

### 3. Root-Cause Analysis

Common root causes:

- `Set-DenyByDefault.ps1` Phase A (partner overrides) failed but Phase C (default deny) ran anyway
  - **Fix**: This should not happen — the script has a verification gate. Check script logs.
- Partner override was created with wrong tenant ID
  - **Fix**: Verify tenant IDs in `config/tenants.json` match override policies
- Graph API permissions revoked on CTU service principal
  - **Fix**: Re-grant `Policy.ReadWrite.CrossTenantAccess` on the SP
- Snapshot restore applied a stale snapshot that didn't include recent partner additions
  - **Fix**: Always use the most recent snapshot; save new snapshots before every remediation

### 4. Re-Apply Deny-by-Default (When Ready)

Once root cause is fixed, re-apply with the full safety workflow:

```powershell
# Save a fresh snapshot first
./scripts/remediation/Save-CTUPolicySnapshot.ps1 -TenantFilter "HTT"

# Preview the deny-by-default changes
./scripts/remediation/Set-DenyByDefault.ps1 -WhatIf

# Apply after review and Tyler's approval
./scripts/remediation/Set-DenyByDefault.ps1
```

---

## Contacts

| Role | Name | Contact |
|---|---|---|
| **Primary Approver** | Tyler Granlund | `tyler.granlund-admin@httbrands.com` |
| **Secondary / On-Call** | Dustin Boyd | `dustin.boyd-admin@httbrands.com` |

**Escalation**: If neither Tyler nor Dustin is reachable within 15 minutes and users are
actively blocked, the on-call IT staff should execute **Option C** (portal revert) using
the break-glass admin account. Document everything and notify Tyler/Dustin ASAP.
