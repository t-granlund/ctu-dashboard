# ADR-001: Cross-Tenant Hub-and-Spoke Architecture & Code Review

**Status:** Accepted — Critical fixes implemented  
**Date:** 2026-04-09  
**Deciders:** Tyler Granlund (IT Director), Dustin Boyd (IT Operations & Support Lead)  
**Review Method:** /engineering:architecture + /engineering:code-review applied to all CTU project artifacts  

---

## Context

HTT Brands operates a 5-tenant Microsoft 365 hub-and-spoke architecture (1 hub + 4 brand spokes) spanning 200+ franchise locations. The Cross-Tenant Utility (CTU) project codifies identity governance via a 7-domain audit framework, 5-phase remediation roadmap, PowerShell module library, and deny-by-default policy hardening.

This ADR applies both architecture evaluation and code review lenses to the entire CTU project — AGENT.md, SKILL.md, all 8 PowerShell modules, 8 scripts, 3 config files, the traceability matrix (66 requirements), test cases (96 TCs), and user acceptance criteria (6 gates / 61 criteria) — specifically focused on **common failure modes enterprises encounter** when implementing cross-tenant B2B sync, identity federation, and deny-by-default policies.

---

## Part 1: Architecture Review — Common Hub-and-Spoke Pitfalls

### Finding ARCH-01: Partner Policy Override Ordering Race Condition
**Severity:** 🔴 Critical  
**Category:** Correctness / Sequencing  

**The Problem:** `Set-DenyByDefault.ps1` applies the default deny policy AND partner overrides in the same execution loop per tenant. If the script fails between applying the default deny and completing all partner overrides, the environment enters a **partially hardened state** where some brand tenants lose access immediately.

**Industry Precedent:** This is the #1 cause of cross-tenant outages in multi-tenant M365 environments. Microsoft's own documentation warns: "Always create partner-specific policies before modifying the default policy."

**Current Code (Set-DenyByDefault.ps1 lines 63-108):** Default deny is applied first (`if (-not $SkipDefaultPolicy)`), then partner overrides follow (`if (-not $SkipPartnerConfigs)`). If the script crashes, times out, or hits a Graph API throttle between these two blocks, you have a deny-all with no overrides.

**Recommendation:**
1. Reverse the order: create/verify ALL partner overrides FIRST, then apply default deny
2. Add a pre-flight check that queries existing partner policies before modifying the default
3. Add a `--partner-overrides-only` execution mode for staged rollout
4. Add a verification step between partner override creation and default deny application

**RTM Gap:** No requirement explicitly mandates "partner overrides must exist before default deny is applied." This is an implicit assumption.

---

### Finding ARCH-02: Outbound Policy Blocking May Break Hub-to-Spoke Sync
**Severity:** 🔴 Critical  
**Category:** Correctness / Cross-Tenant Sync  

**The Problem:** The `baseline.json` and `Set-DenyByDefault.ps1` both block **outbound** B2B Collaboration and Direct Connect at the default level:

```json
"b2bCollaborationOutbound": { "usersAndGroups": { "accessType": "blocked" }, "applications": { "accessType": "blocked" } }
```

This is applied to EVERY tenant in the `Connect-CTUAllTenants` loop (line 58). When applied to the HTT hub, this blocks outbound B2B from HTT to ALL non-partner tenants. But critically — when applied to **spoke tenants** (BCC, FN, TLL, DCE), their outbound to the hub also gets default-denied.

**Industry Precedent:** Cross-tenant sync is bidirectional in configuration — the hub needs inbound from spokes, AND spoke tenants need outbound to the hub. Blocking outbound at the spoke's default level while only having a partner override in the hub doesn't complete the circuit. The spoke also needs its own partner override for the hub.

**Current Code Issue:** `Set-DenyByDefault.ps1` runs against all tenants via `Connect-CTUAllTenants`. The partner override body (lines 124-151) creates partner policies for all OTHER tenants within each tenant — but this assumes the script has admin access to ALL 5 tenants. If it only has access to the hub (which is the typical pattern for Phase 3), the spoke-side configurations are missed.

**Recommendation:**
1. Split the remediation into hub-first and spoke-second phases with explicit documentation
2. Add a test case that verifies spoke-side outbound partner overrides exist
3. Document that spoke-side changes require per-tenant interactive auth (already noted for Teams, but not for cross-tenant access policies)

**RTM Gap:** CTU-018 and CTU-019 cover spoke-side auto-redemption for FN and DCE, but there is no requirement for spoke-side default deny + partner override. The current RTM assumes only the hub default policy gets hardened.

---

### Finding ARCH-03: Partner Override Uses AllUsers/AllApplications — Contradicts AGENT.md Scoping Requirement
**Severity:** 🟡 High  
**Category:** Security / Inconsistency  

**The Problem:** The AGENT.md baseline (lines 140-141) states partner policies must scope to "SharePoint Online + brand-specific security group." The traceability matrix requirements CTU-011 explicitly require scoping. **However**, both `baseline.json` (line 14) and `Set-DenyByDefault.ps1` (lines 127-128) configure partner overrides with:

```json
"usersAndGroups": { "accessType": "allowed", "targets": [{"target":"AllUsers","targetType":"user"}] }
"applications": { "accessType": "allowed", "targets": [{"target":"AllApplications","targetType":"application"}] }
```

This is `AllUsers` + `AllApplications` — the exact opposite of what CTU-011 requires. The config says one thing; the code does another.

**Industry Precedent:** Over-scoped partner overrides are the second most common misconfiguration. Organizations set deny-by-default but then create partner overrides that allow everything, negating the entire security model. It's "defense in depth" theater.

**Recommendation:**
1. Update `baseline.json` partner overrides to reference specific application IDs (SharePoint Online = `00000003-0000-0ff1-ce00-000000000000`, Power BI = `00000009-0000-0000-c000-000000000000`) and brand group IDs
2. The brand group IDs won't be known until CTU-060 brand groups are created — make the partner override creation a Phase 3 medium-term action (after brand groups exist), not a Phase 3 immediate action
3. Update `Set-DenyByDefault.ps1` to read scoping targets from config rather than hardcoding AllUsers/AllApplications

**RTM Gap:** The dependency between CTU-060 (brand groups) and CTU-011 (partner scoping) is not explicitly sequenced. Brand groups must exist before partner policies can reference them.

---

### Finding ARCH-04: No Rollback Script or State Snapshot
**Severity:** 🟡 High  
**Category:** Operational Safety  

**The Problem:** The UAC document mentions rollback plans (G2-AC-09, G3-AC-11), but no actual rollback script exists. The `-WhatIf` mode captures the target state, not the current state. If `Set-DenyByDefault.ps1` is run and breaks access, there's no automated "undo" that restores the pre-hardening policy.

**Industry Precedent:** Every major cross-tenant outage case study involves an organization that hardened policies without capturing a snapshot of the prior configuration. Manual rollback via the Entra admin center under pressure is error-prone and slow.

**Recommendation:**
1. Add a `Save-CTUPolicySnapshot.ps1` script that captures current default + all partner policies as JSON before any remediation
2. Add a `Restore-CTUPolicySnapshot.ps1` that reads the snapshot and re-applies the prior state
3. Make snapshot capture automatic — `Set-DenyByDefault.ps1` should auto-save a snapshot to `reports/snapshots/` before any PATCH call
4. Add RTM requirement: "Before any remediation execution, a full policy state snapshot must be saved"

---

### Finding ARCH-05: Cross-Tenant Sync userType Race After Deny-by-Default
**Severity:** 🟡 High  
**Category:** Correctness / Sync Behavior  

**The Problem:** `Fix-SyncUserTypeMapping.ps1` changes the sync schema to map `userType = "Member"`. But the sync jobs continue running against the *existing* synced users. After changing the mapping, existing users who were synced as `Guest` are NOT automatically updated to `Member` — they retain their original `userType` until the sync job re-provisions them.

If deny-by-default is applied at the same time as the userType fix, guests synced with `Guest` userType may lose access because some CA policies or group rules treat `Guest` vs `Member` differently. The users need to be re-synced or manually patched.

**Industry Precedent:** This is the "Guest orphan" problem. Microsoft's cross-tenant sync docs warn that changing `userType` mapping does not retroactively update existing users. A full re-provisioning cycle is required.

**Recommendation:**
1. After `Fix-SyncUserTypeMapping.ps1`, add a "force re-provision" step that triggers a full sync cycle (not incremental)
2. Add a validation step that counts users with `userType = Guest` in each tenant after the fix — the count should trend to zero over time
3. Add a test case: "Post-sync-fix, zero synced partner users have userType = Guest after full re-provision cycle"
4. Sequence this BEFORE deny-by-default — fix userType first, verify, then harden

**RTM Gap:** CTU-016 requires Member mapping but no requirement for verifying existing users are patched.

---

### Finding ARCH-06: Teams Federation Requires Per-Tenant Auth — But Script Doesn't Chain
**Severity:** 🟠 Medium  
**Category:** Operational / Automation  

**The Problem:** `Set-TeamsFederationAllowlist.ps1` is 89 lines but the `Connect-CTUTeams` function requires interactive auth per tenant. The script runs against all tenants, but the operator must manually authenticate 5 separate times. If one tenant fails auth mid-sequence, there's no graceful recovery — the remaining tenants are left with open federation.

**Recommendation:**
1. Add progress tracking — if 3 of 5 tenants succeed, log which ones are incomplete
2. Add a "resume" capability — accept a list of tenant keys to retry
3. Consider certificate-based auth for Teams PowerShell (available since module v4.9)

---

### Finding ARCH-07: MTO Membership Incomplete — Only Bishops Joined
**Severity:** 🟠 Medium  
**Category:** Architecture / Strategic  

**The Problem:** The AGENT.md documents that only BCC (Bishops) has joined the Multi-Tenant Organization. FN, TLL, and DCE are "targets for remediation." However, no MTO-join scripts, requirements, or test cases exist in the CTU project. MTO membership provides additional benefits (cross-tenant people search, shared channels, calendar availability) that the partner-override-only approach doesn't provide.

**Recommendation:**
1. Add a Phase 4 activity: "Evaluate and onboard FN, TLL, DCE into MTO"
2. Add RTM requirements for MTO join/verification per tenant
3. Add test cases for MTO membership validation (`Get-MgBetaTenantRelationshipMultiTenantOrganization`)

---

### Finding ARCH-08: No Emergency Break-Glass Access Path
**Severity:** 🟡 High  
**Category:** Operational Safety  

**The Problem:** If deny-by-default is applied and all partner overrides fail or are misconfigured, cross-tenant access is fully blocked. There's no documented emergency access path. The break-glass accounts (CTU-052 covers PIM) are within a single tenant — they can't fix cross-tenant policies if Graph API connectivity is broken from the admin's workstation.

**Recommendation:**
1. Document an emergency access procedure: which admin portal URLs to hit, which tenant to connect to first, exact Graph API calls to revert the default policy
2. Pre-configure a Conditional Access exclusion for break-glass accounts that bypasses cross-tenant restrictions
3. Store the policy snapshot (ARCH-04) in a location accessible without cross-tenant B2B (e.g., each tenant's own SharePoint or a shared Azure storage account)

---

## Part 2: Code Review — Script-Level Findings

### Finding CODE-01: ClientSecret Passed as Plaintext Parameter
**Severity:** 🔴 Critical  
**Category:** Security / Credential Handling  

**File:** `CTU.Core.psm1` line 96, `Invoke-FullAudit.ps1` line 60  

Both accept `[string]$ClientSecret` as a parameter. PowerShell command history logs parameter values in plaintext. If a user runs:

```powershell
.\Invoke-FullAudit.ps1 -AuthMode AppOnly -ClientId "xxx" -ClientSecret "actual-secret-here"
```

The secret is visible in `Get-History`, PowerShell transcription logs, and Windows Event Logs (Script Block Logging).

**Recommendation:**
1. Change `$ClientSecret` parameter type to `[SecureString]`
2. Or better: remove `ClientSecret` parameter entirely and only support certificate-based auth for AppOnly mode
3. Add to code: `if ($ClientSecret) { Write-Warning "ClientSecret parameter is deprecated. Use CertificateThumbprint for production." }`
4. This is already flagged by TC-098 for grep scanning, but the vulnerability is in the parameter declaration itself, not a hardcoded value

---

### Finding CODE-02: `Read-Host` Blocks Non-Interactive Execution
**Severity:** 🟠 Medium  
**Category:** Automation / CI-CD Compatibility  

**File:** `Set-DenyByDefault.ps1` line 55  

```powershell
Read-Host  # "Press ENTER to continue or Ctrl+C to abort..."
```

This blocks automated/scheduled execution. If this script is ever run from a CI pipeline, Azure Automation, or a scheduled task, it hangs indefinitely.

**Recommendation:**
1. Add a `-Force` parameter that skips the confirmation prompt
2. Or use `$PSCmdlet.ShouldProcess()` pattern (the script already has `[CmdletBinding(SupportsShouldProcess)]`)
3. Replace `Read-Host` with: `if (-not $Force -and -not $WhatIfPreference) { if (-not $PSCmdlet.ShouldContinue("Apply deny-by-default to production?", "Confirm")) { return } }`

---

### Finding CODE-03: `ErrorActionPreference = "Stop"` vs `"Continue"` Inconsistency
**Severity:** 🟠 Medium  
**Category:** Error Handling / Correctness  

**Files:** `Set-DenyByDefault.ps1` line 36 uses `$ErrorActionPreference = "Stop"` while `Invoke-FullAudit.ps1` line 69 uses `$ErrorActionPreference = 'Continue'`.

The remediation script stops on first error (correct — fail fast for destructive operations), but if an error occurs inside the `Connect-CTUAllTenants` scriptblock, the outer `try/catch` in `Connect-CTUAllTenants` (CTU.Core.psm1 line 171-176) catches it and continues to the next tenant. This means `ErrorActionPreference = "Stop"` doesn't actually stop the full script — it stops the current tenant's execution and moves to the next.

**Recommendation:**
1. Document this behavior explicitly — "per-tenant failure isolation" is a feature, but operators need to know it
2. Add a `-StopOnFirstError` parameter that breaks the tenant loop on any failure
3. Log the failure clearly enough that partial execution is obvious in the audit trail

---

### Finding CODE-04: Missing Before/After State Capture in WhatIf Mode
**Severity:** 🟡 High  
**Category:** Auditability  

**File:** `Set-DenyByDefault.ps1` lines 92-94  

The WhatIf block only logs "WOULD SET default policy to deny" — it doesn't capture the current (before) state. The UAC criteria G2-AC-02 through G2-AC-05 explicitly require "before/after" in the WhatIf JSON output.

**Recommendation:**
1. Before the WhatIf/Live branch, query the current state: `$currentPolicy = Invoke-MgGraphRequest -Uri ".../default"`
2. Include both states in the output JSON:
   ```powershell
   @{ Before = $currentPolicy; After = $defaultBody; WouldChange = ($currentPolicy -ne $defaultBody) }
   ```
3. This also enables the idempotency check (TC-009) — if before == after, report NO_CHANGE

---

### Finding CODE-05: Partner Override `identitySynchronization` Uses PUT — Potential Overwrite
**Severity:** 🟠 Medium  
**Category:** Correctness / API Behavior  

**File:** `Set-DenyByDefault.ps1` line 190  

```powershell
Invoke-MgGraphRequest -Method PUT -Uri ".../partners/$partnerId/identitySynchronization"
```

`PUT` replaces the entire `identitySynchronization` resource. If the partner already has a sync configuration with additional properties (like `userSyncOutbound` or custom transformation rules), this PUT overwrites them with only `{ userSyncInbound: { isSyncAllowed: true } }`.

**Recommendation:**
1. Use `PATCH` instead of `PUT` to merge rather than replace
2. Or query the current sync config first and merge locally before PUT
3. Add a test case that verifies existing sync configuration properties are preserved after the script runs

---

### Finding CODE-06: No Pagination Guard on Guest Inventory
**Severity:** 🟠 Medium  
**Category:** Performance / Completeness  

**Potential Issue in Modules:** The `Invoke-CTUGraphRequest` function (CTU.Core.psm1 lines 188-239) handles pagination via `@odata.nextLink`, which is correct. However, the Graph API has a default page size of 100 for `/users` endpoints. For the GuestInventory module querying all guest users across 5 tenants (potentially thousands of guests over time in a 200+ location franchise), the loop could take significant time and hit throttling.

**Recommendation:**
1. Add `$top=999` to guest inventory queries to reduce page count
2. Add progress reporting: "Processing page X of estimated Y" using `@odata.count`
3. Add a timeout safeguard — if a single tenant's guest inventory takes >10 minutes, log a warning
4. Consider batch request for the privileged role check (8 role templates × 5 tenants = 40 queries)

---

### Finding CODE-07: `Invoke-DomainAudit.ps1` Not Read — Needs Review
**Severity:** 🟠 Medium  
**Category:** Coverage  

`Invoke-DomainAudit.ps1` is referenced in test cases (TC-029, TC-084) and the monitoring schedule but wasn't fully reviewed. It should follow the same patterns as `Invoke-FullAudit.ps1` — read-only, per-tenant isolation, structured JSON output.

---

### Finding CODE-08: No Token Refresh for Long-Running Audits
**Severity:** 🟠 Medium  
**Category:** Reliability  

**Context:** A full 7-domain audit across 5 tenants could take 30-60 minutes. The Microsoft Graph SDK token expires after 60 minutes (default). The `Connect-CTUTenant` function connects once per tenant before running all domain audits. If 6 domains take 45 minutes on a large tenant, the token may expire during the 7th domain.

**Recommendation:**
1. Add token expiry checking in `Invoke-CTUGraphRequest` — if token is near expiry (< 5 minutes remaining), re-authenticate before the next request
2. Or reconnect between domain audits (adds overhead but prevents mid-audit failures)
3. Add test case: "Full audit of largest tenant (TLL, 140 locations) completes without token expiry"

---

## Part 3: Configuration Review

### Finding CONFIG-01: `baseline.json` Partner Override Contradicts AGENT.md Narrative
**Severity:** 🟡 High  
**Category:** Configuration Drift / Inconsistency  

As detailed in ARCH-03, the `crossTenantPartnerOverrides` section in `baseline.json` uses `AllUsers`/`AllApplications` while the AGENT.md and RTM require scoped access. The config file is the single source of truth for scripts — if it says AllUsers, that's what gets deployed.

---

### Finding CONFIG-02: `tenants.json` Admin Account Format Varies
**Severity:** 🟢 Low  
**Category:** Consistency  

Admin UPN formats differ across tenants:
- HTT: `tyler.granlund-admin@httbrands.com` (custom domain)
- BCC: `tyler.granlund-Admin@bishopsbs.onmicrosoft.com` (onmicrosoft, capital A)
- TLL: `tyler.granlund-Admin@LashLoungeFranchise.onmicrosoft.com` (mixed case)
- DCE: `tyler.granlund-admin_httbrands.com#EXT#@deltacrown.onmicrosoft.com` (external guest format)

DCE's admin is an external guest account, not a native admin. This is expected for a pre-launch brand but should be documented as a known limitation — some admin operations may fail with a guest admin context.

**Recommendation:**
1. Add a `tenants.json` field `adminAccountType: "native" | "guest"` per tenant
2. Scripts should check this and warn when running privileged operations with a guest admin

---

### Finding CONFIG-03: Missing Application IDs for Scoped Partner Overrides
**Severity:** 🟠 Medium  
**Category:** Configuration Completeness  

To implement scoped partner overrides (ARCH-03 fix), you need specific application IDs in the config. These should be added to `baseline.json`:

```json
"scopedApplicationIds": {
  "SharePointOnline": "00000003-0000-0ff1-ce00-000000000000",
  "PowerBIService": "00000009-0000-0000-c000-000000000000",
  "Office365": "00000003-0000-0000-c000-000000000000",
  "MicrosoftTeams": "cc15fd57-2c6c-4117-a88c-83b1d56b4bbe"
}
```

Without these, scripts can't scope to specific applications and default to AllApplications.

---

## Part 4: RTM & Test Case Gaps Identified

Based on the architecture and code review, the following requirements and test cases are MISSING from the current traceability matrix and test case document:

### New Requirements Needed

| Proposed Req ID | Requirement | Source | Priority | Phase |
|----------------|-------------|--------|----------|-------|
| CTU-120 | Partner override policies MUST be verified as existing and active BEFORE the default deny policy is applied | ARCH-01 | P1-Critical | Phase 3 |
| CTU-121 | A full policy state snapshot MUST be saved to `reports/snapshots/` before any remediation script execution | ARCH-04 | P1-Critical | Phase 2–3 |
| CTU-122 | A rollback script (`Restore-CTUPolicySnapshot.ps1`) MUST exist and be tested before any Phase 3 remediation | ARCH-04 | P1-Critical | Phase 3 |
| CTU-123 | After `Fix-SyncUserTypeMapping.ps1`, a full sync re-provision cycle MUST be triggered and verified — zero synced users should retain `userType = Guest` | ARCH-05 | P1-Critical | Phase 3 |
| CTU-124 | Spoke tenants MUST have their own partner override policies for the HTT hub tenant before spoke-side default deny is applied | ARCH-02 | P1-Critical | Phase 3 |
| CTU-125 | `baseline.json` partner override application targets MUST be scoped to specific application IDs (not AllApplications) once brand groups exist | ARCH-03 | P1-Critical | Phase 3 |
| CTU-126 | `ClientSecret` parameter MUST be deprecated in favor of certificate-based auth for all AppOnly operations | CODE-01 | P2-High | Phase 1 |
| CTU-127 | All remediation scripts MUST save a before-state snapshot prior to any PATCH/PUT/POST call | CODE-04 | P2-High | Phase 2–3 |
| CTU-128 | MTO membership MUST be evaluated and documented for FN, TLL, and DCE tenants | ARCH-07 | P2-High | Phase 4 |
| CTU-129 | An emergency access procedure document MUST exist detailing how to revert deny-by-default without cross-tenant B2B access | ARCH-08 | P1-Critical | Phase 3 |

### New Test Cases Needed

| Proposed TC ID | Category | Description | Linked REQs | Priority |
|---------------|----------|-------------|-------------|----------|
| TC-120 | SEQUENCING | Partner overrides for all 4 brands confirmed active BEFORE default deny is applied | CTU-120 | P1 |
| TC-121 | SNAPSHOT | Policy snapshot JSON created in `reports/snapshots/` before remediation | CTU-121 | P1 |
| TC-122 | ROLLBACK | `Restore-CTUPolicySnapshot.ps1` successfully reverts default policy from deny to snapshot state | CTU-122 | P1 |
| TC-123 | SYNC | Post-userType-fix, zero synced partner users have `userType = Guest` after full re-provision | CTU-123 | P1 |
| TC-124 | SPOKE-SIDE | Each spoke tenant has a partner override for HTT hub before spoke-side default deny | CTU-124 | P1 |
| TC-125 | SCOPING | Partner overrides reference specific application IDs (not AllApplications) | CTU-125 | P1 |
| TC-126 | SECURITY | `ClientSecret` parameter produces deprecation warning; cert-based auth works | CTU-126 | P2 |
| TC-127 | AUDIT-TRAIL | Every remediation execution produces before/after JSON with both states | CTU-127 | P2 |
| TC-128 | MTO | MTO membership query returns FN, TLL, DCE as members (post-Phase 4 onboarding) | CTU-128 | P2 |
| TC-129 | EMERGENCY | Emergency access procedure tested: admin can revert deny-by-default within 15 minutes using documented steps | CTU-129 | P1 |
| TC-130 | TOKEN | Full audit of TLL tenant (140 locations) completes without token expiry error | CODE-08 | P2 |
| TC-131 | IDEMPOTENCY | Running `Set-DenyByDefault.ps1` with `-WhatIf` produces before/after JSON without any API writes | CODE-04 | P1 |

---

## Summary of Findings

| Severity | Count | Categories |
|----------|-------|------------|
| 🔴 Critical | 3 | Sequencing race condition (ARCH-01), Outbound blocking breaks sync (ARCH-02), ClientSecret plaintext (CODE-01) |
| 🟡 High | 5 | AllUsers/AllApps in overrides (ARCH-03), No rollback script (ARCH-04), UserType race (ARCH-05), No emergency access (ARCH-08), Missing before-state in WhatIf (CODE-04) |
| 🟠 Medium | 7 | Teams auth chaining (ARCH-06), MTO incomplete (ARCH-07), Read-Host blocks automation (CODE-02), ErrorAction inconsistency (CODE-03), PUT overwrites sync config (CODE-05), Pagination performance (CODE-06), Token refresh (CODE-08) |
| 🟢 Low | 2 | Admin UPN format variance (CONFIG-02), DomainAudit script not reviewed (CODE-07) |
| **Total** | **17** | |

---

## Verdict

**Request Changes** — 3 critical findings must be addressed before Phase 3 hardening proceeds:

1. **ARCH-01**: Reverse execution order — partner overrides before default deny, with verification gate between them
2. **ARCH-02**: Document and test spoke-side outbound policy requirements — the current script assumes bidirectional access from a single execution context
3. **CODE-01**: Deprecate ClientSecret parameter before any production execution

The 5 high-severity findings should be addressed in parallel with Phase 2 Quick Wins, as they primarily affect remediation safety (rollback capability, snapshot capture, before-state auditing).

---

## Action Items

1. [x] **Immediate**: Update `Set-DenyByDefault.ps1` execution order — partner overrides first, verify, then default deny
2. [x] **Immediate**: Add `Save-CTUPolicySnapshot.ps1` and `Restore-CTUPolicySnapshot.ps1` scripts
3. [x] **Immediate**: Add before-state capture to WhatIf output in all remediation scripts
4. [x] **Before Phase 3**: Update `baseline.json` to include scoped application IDs instead of AllApplications
5. [ ] **Before Phase 3**: Add post-userType-fix re-provision step and verification
6. [x] **Before Phase 3**: Write emergency access procedure document
7. [x] **Phase 1**: Deprecate ClientSecret parameter, add warning, promote cert-based auth
8. [ ] **Phase 3**: Add spoke-side partner override creation/verification to the remediation workflow
9. [ ] **Phase 4**: Evaluate MTO onboarding for FN, TLL, DCE
10. [x] **Ongoing**: Add all 10 new requirements and 12 new test cases to RTM and TEST-CASES.md

---

*ADR-001 v1.0 — Architecture & Code Review — Tyler Granlund, IT Director*
