# Emergency PIM Elevation Runbook

> **Severity**: 🔴 CRITICAL — Break-glass procedure  
> **Trigger**: Urgent admin access needed, standard PIM approval unavailable  
> **Last Updated**: 2025-05-31  
> **Owner**: Tyler Granlund

---

## When to Use This Runbook

Use this procedure **only** when ALL of the following are true:

1. You need Global Administrator (or another Tier-1 privileged role) **immediately**
2. The standard PIM approval workflow is unavailable (approver unreachable, PIM service
   degraded, or the eligible assignment has expired)
3. The situation is time-critical (active security incident, cross-tenant outage, or
   data loss scenario)

**Do NOT use this runbook for**:

- Routine admin tasks (use standard PIM elevation with approval)
- Tasks that can wait for the next business day
- Testing or development purposes
- "Convenience" — PIM approval delays are a feature, not a bug

---

## Break-Glass Account Overview

HTT Brands maintains **two break-glass accounts** for emergency access. These accounts
bypass PIM and Conditional Access by design.

| Account | Purpose | Storage |
|---|---|---|
| **Break-Glass Account 1** | Primary emergency access | Credentials in physical safe + Azure Key Vault |
| **Break-Glass Account 2** | Secondary (if Account 1 compromised) | Credentials in separate physical safe |

> ⚠️ **Break-glass accounts are permanently assigned Global Admin** — they are the only
> exception to the "all Global Admins must be PIM-eligible" baseline rule (max 2 permanent).
> See `config/baseline.json` → `authorizationPolicy`.

### Break-Glass Account Properties

- **No MFA enforced** (by design — MFA devices may be unavailable during emergencies)
- **No Conditional Access applied** (excluded from all CA policies)
- **Strong, unique passwords** (64+ character, stored offline only)
- **No interactive sign-in expected** (any sign-in triggers an immediate alert)
- **Monitored 24/7** — any authentication event on these accounts fires the
  `privileged-guest-alert.kql` KQL query

---

## Emergency Elevation Procedure

### Option A: Activate PIM Role via Portal (Approver Bypass)

If PIM is functional but the approver (Tyler) is unreachable, and the role is configured
with self-approval or emergency justification:

#### Step 1 — Navigate to PIM

1. Go to <https://entra.microsoft.com/#view/Microsoft_Azure_PIMCommon/ActivationMenuBlade/~/aadmigratedroles>
2. Sign in with your admin account (e.g., `tyler.granlund-admin@httbrands.com` or
   `dustin.boyd-admin@httbrands.com`)

#### Step 2 — Request Activation

1. Find the eligible role (e.g., **Global Administrator**)
2. Click **Activate**
3. Set duration (max 2 hours per baseline)
4. Enter justification: `EMERGENCY: [brief description] — approver unreachable`
5. If approval is required and no approver is available, proceed to **Option B**

#### Step 3 — Verify Activation

```powershell
Connect-MgGraph -TenantId "0c0e35dc-188a-4eb3-b8ba-61752154b407" `
    -Scopes "RoleManagement.Read.Directory"

# Check your active role assignments
$myId = (Get-MgContext).Account
$activeRoles = Get-MgRoleManagementDirectoryRoleAssignmentScheduleInstance `
    -Filter "principalId eq '$myId'"

$activeRoles | ForEach-Object {
    $roleDef = Get-MgRoleManagementDirectoryRoleDefinition -UnifiedRoleDefinitionId $_.RoleDefinitionId
    Write-Host "Active Role: $($roleDef.DisplayName) — Expires: $($_.EndDateTime)"
}
```

---

### Option B: Use Break-Glass Account

When PIM is unavailable or no eligible assignment exists.

#### Step 1 — Retrieve Break-Glass Credentials

1. **Physical safe**: Retrieve the sealed envelope labeled "HTT Break-Glass Account 1"
2. **Azure Key Vault** (if accessible): Retrieve from the designated Key Vault
3. **Never transmit credentials** via email, Teams, Slack, or any messaging platform

#### Step 2 — Sign In

1. Use an **InPrivate/Incognito browser window** (no cached sessions)
2. Navigate to <https://entra.microsoft.com>
3. Sign in with the break-glass account credentials
4. You will have immediate Global Administrator access (permanent assignment)

#### Step 3 — Perform Emergency Actions

Complete only the actions strictly necessary for the emergency. Examples:

- Revert a cross-tenant policy (see `emergency-cross-tenant-revert.md`)
- Restore a deleted critical user or group
- Disable a compromised account
- Fix a broken Conditional Access policy locking out all users

#### Step 4 — Sign Out Immediately

1. Complete the emergency action
2. Sign out of the break-glass account
3. Close all browser windows from that session
4. **Do not leave the break-glass session open**

---

### Option C: Emergency PIM Configuration Change

If you have a secondary Global Admin (e.g., Tyler has access but Dustin doesn't, or vice
versa), the available admin can temporarily reconfigure the PIM role to allow self-approval:

```powershell
# This requires an active Global Admin session
Connect-MgGraph -TenantId "0c0e35dc-188a-4eb3-b8ba-61752154b407" `
    -Scopes "RoleManagement.ReadWrite.Directory"

# Get the role policy assignment for Global Administrator
$globalAdminRoleId = "62e90394-69f5-4237-9190-012177145e10"  # Well-known GA role ID

# Note: Modifying PIM policies is complex and varies by configuration.
# Only use this option if you are confident in the PIM policy structure.
# Prefer Option B (break-glass) over modifying PIM configuration under pressure.
```

> ⚠️ **Reverting PIM changes is critical** — if you modify the approval workflow, you MUST
> restore it to the original configuration after the emergency.

---

## Post-Incident Requirements

Every use of this runbook **must** be followed by complete documentation. No exceptions.

### 1. Incident Report (Required Within 24 Hours)

Document the following:

| Field | Value |
|---|---|
| **Date/Time** | When the emergency started |
| **Duration** | How long the elevated access was active |
| **Account Used** | Which account (PIM eligible, break-glass 1, or break-glass 2) |
| **Actions Taken** | Every action performed with elevated privileges |
| **Justification** | Why standard PIM approval was unavailable |
| **Witnesses** | Who was aware of the elevation (if any) |
| **Resolution** | What was fixed / resolved |

### 2. Audit Log Review

```powershell
# Pull audit logs for the emergency time window
$startTime = "<emergency-start-time>"  # ISO 8601 format
$endTime = "<emergency-end-time>"

$auditLogs = Invoke-MgGraphRequest -Method GET `
    -Uri "https://graph.microsoft.com/v1.0/auditLogs/directoryAudits?`$filter=activityDateTime ge $startTime and activityDateTime le $endTime&`$orderby=activityDateTime desc&`$top=100"

$auditLogs.value | ForEach-Object {
    Write-Host "$($_.activityDateTime) | $($_.activityDisplayName) | $($_.initiatedBy.user.userPrincipalName)"
}
```

### 3. Rotate Break-Glass Credentials (If Used)

If a break-glass account was used:

1. **Immediately rotate the password** (new 64+ character password)
2. Store the new credentials in the physical safe (replace the sealed envelope)
3. Update Azure Key Vault (if applicable)
4. Verify the account still has permanent Global Admin assignment
5. Verify the account is still excluded from Conditional Access policies

### 4. PIM Configuration Review

If PIM settings were modified during the emergency:

1. Restore the original approval workflow configuration
2. Verify all Tier-1 roles still require approval for activation
3. Confirm max activation duration is still 2 hours
4. Run Domain 7 (Identity Governance) audit to validate:
   ```powershell
   ./scripts/Invoke-DomainAudit.ps1 -Domain IdentityGovernance
   ```

### 5. Notify Stakeholders

| Stakeholder | Notification |
|---|---|
| Tyler Granlund | Incident report (within 24 hours) |
| Dustin Boyd | Verbal debrief + incident report |
| Leadership (if break-glass used) | Summary email — break-glass use is a reportable event |

---

## PIM Baseline Configuration Reference

Per `config/baseline.json` and the Phase 4 governance targets:

| Setting | Target Value |
|---|---|
| **Permanent Global Admins** | Maximum 2 (break-glass accounts only) |
| **All other Global Admins** | PIM-eligible (require activation + approval) |
| **Activation Duration** | 2 hours (auto-expire) |
| **Approval Required** | Yes — Tyler Granlund (primary approver) |
| **MFA on Activation** | Required |
| **Justification on Activation** | Required |
| **Tier-1 Roles (Intune Admin, Exchange Admin, etc.)** | PIM-eligible with approval |

---

## Contacts

| Role | Name | Contact |
|---|---|---|
| **Primary Approver / Escalation** | Tyler Granlund | `tyler.granlund-admin@httbrands.com` |
| **Secondary Admin** | Dustin Boyd | `dustin.boyd-admin@httbrands.com` |
| **Microsoft Support** | Premier Support | Open a Sev-A ticket for PIM service outages |
