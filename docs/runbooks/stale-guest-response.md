# Stale Guest Response Runbook

> **Severity**: 🟡 MEDIUM — Operational hygiene  
> **Trigger**: KQL alert or weekly scheduled audit  
> **Last Updated**: 2025-05-31  
> **Owner**: Dustin Boyd (daily monitoring), Tyler Granlund (escalation)

---

## Alert Source

This runbook is triggered by:

1. **Azure Monitor KQL Alert** — `stale-guest-alert.kql` (runs weekly via Log Analytics)
2. **Scheduled Audit** — `Invoke-FullAudit.ps1` Domain 4 (Guest Inventory) flags guests
   with `lastSignInDateTime` > 90 days or `null` (never signed in)
3. **Manual Review** — quarterly access review cycle (Phase 4 governance)

The KQL query detects guests whose `lastSignInDateTime` exceeds the threshold defined
in `config/baseline.json` → `staleGuestThresholdDays` (currently **90 days**).

---

## Action Matrix

| Days Since Last Sign-In | Status | Action | Automated? |
|---|---|---|---|
| **0–89 days** | Active | No action | — |
| **90–99 days** | ⚠️ Warning | Send email notification to guest + sponsor | Phase 4 lifecycle workflow |
| **100–119 days** | 🔶 Stale | Disable the guest account | Phase 4 lifecycle workflow |
| **120+ days** | 🔴 Expired | Delete the guest account | Manual (requires approval) |
| **Never signed in** + created > 90 days ago | 🔴 Orphaned | Disable immediately, delete after 30 days | Manual |

---

## Triage Steps

When a stale guest alert fires, work through these checks before taking action.

### Step 1 — Identify the Guest

```powershell
Connect-MgGraph -TenantId "0c0e35dc-188a-4eb3-b8ba-61752154b407" `
    -Scopes "User.Read.All", "AuditLog.Read.All"

# Get guest details including sign-in activity
$guest = Get-MgUser -UserId "<guest-object-id>" `
    -Property "id,displayName,mail,userPrincipalName,userType,createdDateTime,signInActivity,accountEnabled" `
    -Select "id,displayName,mail,userPrincipalName,userType,createdDateTime,signInActivity,accountEnabled"

$guest | Format-List
```

### Step 2 — Check if This Is a Service Account

Some guests are used by automated integrations (e.g., Power Automate flows, API
connections). Disabling these breaks integrations silently.

```powershell
# Check for app role assignments — service accounts often have app roles
$appRoles = Get-MgUserAppRoleAssignment -UserId "<guest-object-id>"
if ($appRoles.Count -gt 0) {
    Write-Host "⚠️  Guest has $($appRoles.Count) app role assignment(s) — may be a service account" -ForegroundColor Yellow
    $appRoles | Format-Table ResourceDisplayName, AppRoleId, CreatedDateTime
}
```

If the guest has app role assignments, **escalate to Tyler before disabling**.

### Step 3 — Check the Sponsor / Inviter

```powershell
# Who invited this guest?
$auditLogs = Invoke-MgGraphRequest -Method GET `
    -Uri "https://graph.microsoft.com/v1.0/auditLogs/directoryAudits?`$filter=activityDisplayName eq 'Invite external user' and targetResources/any(t:t/id eq '<guest-object-id>')&`$top=5"

$auditLogs.value | ForEach-Object {
    Write-Host "Invited by: $($_.initiatedBy.user.userPrincipalName) on $($_.activityDateTime)"
}
```

Contact the sponsor/inviter to confirm whether the guest is still needed.

### Step 4 — Check Group Memberships

```powershell
$memberships = Get-MgUserMemberOf -UserId "<guest-object-id>"
$memberships | ForEach-Object {
    $group = Get-MgDirectoryObject -DirectoryObjectId $_.Id
    Write-Host "  Member of: $($group.AdditionalProperties.displayName)"
}
```

If the guest is in a brand security group (e.g., `TLL-Brand-Users`), they may be
a synced identity — **do not delete synced identities** via this runbook. Investigate
the sync job instead (see `sync-failure-investigation.md`).

### Step 5 — Check Domain Trust

```powershell
$domain = ($guest.Mail -split "@")[1]
$trustedDomains = @("httbrands.com", "bishopsbs.com", "thelashlounge.com", "frenchiesnails.com", "deltacrown.com")

if ($domain -in $trustedDomains) {
    Write-Host "✅ Guest is from a trusted brand domain: $domain" -ForegroundColor Green
} else {
    Write-Host "⚠️  Guest is from an external domain: $domain — higher risk" -ForegroundColor Yellow
}
```

Guests from untrusted domains should have a lower tolerance for staleness.

---

## Remediation Actions

### Disable a Stale Guest (100+ days)

```powershell
# Preview — check current state
Get-MgUser -UserId "<guest-object-id>" -Property "accountEnabled,displayName" |
    Format-List displayName, accountEnabled

# Disable the account
Update-MgUser -UserId "<guest-object-id>" -AccountEnabled:$false

# Verify
$updated = Get-MgUser -UserId "<guest-object-id>" -Property "accountEnabled"
Write-Host "Account enabled: $($updated.AccountEnabled)"  # Should be False
```

### Delete a Stale Guest (120+ days)

> ⚠️ **Deletion requires explicit approval from Tyler or Dustin.**
> Deleted guests are soft-deleted for 30 days (recoverable), then permanently removed.

```powershell
# Confirm the guest is already disabled
$guest = Get-MgUser -UserId "<guest-object-id>" -Property "accountEnabled,displayName,mail"
if ($guest.AccountEnabled) {
    Write-Host "❌ Guest is still enabled — disable first, wait 20 days, then delete" -ForegroundColor Red
    return
}

# Delete (soft-delete — recoverable for 30 days)
Remove-MgUser -UserId "<guest-object-id>"

Write-Host "🗑️  Guest $($guest.DisplayName) ($($guest.Mail)) soft-deleted"
```

### Bulk Disable Stale Guests

```powershell
# Get all guests with no sign-in > 100 days
$threshold = (Get-Date).AddDays(-100)
$allGuests = Get-MgUser -Filter "userType eq 'Guest'" -All `
    -Property "id,displayName,mail,signInActivity,accountEnabled,createdDateTime"

$staleGuests = $allGuests | Where-Object {
    $_.AccountEnabled -and
    (
        ($_.SignInActivity.LastSignInDateTime -and $_.SignInActivity.LastSignInDateTime -lt $threshold) -or
        (-not $_.SignInActivity.LastSignInDateTime -and $_.CreatedDateTime -lt $threshold)
    )
}

Write-Host "Found $($staleGuests.Count) stale guests (>100 days)"
$staleGuests | Format-Table DisplayName, Mail, @{
    N = "LastSignIn"
    E = { $_.SignInActivity.LastSignInDateTime ?? "Never" }
}, CreatedDateTime

# Disable after review (uncomment when approved)
# $staleGuests | ForEach-Object {
#     Update-MgUser -UserId $_.Id -AccountEnabled:$false
#     Write-Host "Disabled: $($_.DisplayName) ($($_.Mail))"
# }
```

---

## Escalation Path

| Level | Who | When |
|---|---|---|
| **L1 — Triage** | Dustin Boyd | Alert fires — complete triage steps above |
| **L2 — Approval** | Tyler Granlund | Guest is a service account, in a privileged role, or from a trusted domain |
| **L3 — Exception** | Tyler + Leadership | Business justification to keep a stale guest (create documented exception) |

---

## Post-Action Checklist

- [ ] Guest disabled/deleted in Entra ID
- [ ] Sponsor notified (if identified)
- [ ] Incident logged in IT ops tracker
- [ ] Group memberships reviewed (no orphaned permissions)
- [ ] Re-run Guest Inventory audit to confirm guest no longer flagged
- [ ] If guest was in a privileged role, run `Invoke-FullAudit.ps1` Domain 7 (Identity Governance)

---

## Contacts

| Role | Name | Contact |
|---|---|---|
| **Daily Monitoring** | Dustin Boyd | `dustin.boyd-admin@httbrands.com` |
| **Escalation / Approval** | Tyler Granlund | `tyler.granlund-admin@httbrands.com` |
