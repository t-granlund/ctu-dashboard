# Cross-Tenant Sync Failure Investigation Runbook

> **Severity**: 🔴 HIGH — Sync failures block identity provisioning  
> **Trigger**: KQL alert (immediate) or scheduled audit  
> **Last Updated**: 2025-05-31  
> **Owner**: Dustin Boyd (first response), Tyler Granlund (escalation)

---

## Alert Source

This runbook is triggered by:

1. **Azure Monitor KQL Alert** — `sync-failure-alert.kql` (fires immediately on sync job quarantine)
2. **Scheduled Audit** — `Invoke-FullAudit.ps1` Domain 1 (Cross-Tenant Sync) checks sync
   job status, error counts, and last successful sync timestamp
3. **Manual Report** — user reports they cannot access cross-tenant resources despite
   being in a brand security group

---

## Impact Assessment

| Sync Direction | Effect of Failure |
|---|---|
| **BCC → HTT** | Bishops staff lose access to HTT SharePoint, Teams, and shared resources |
| **TLL → HTT** | Lash Lounge franchisees lose Fabric Free license assignments and Lash Dash access |
| **FN → HTT** | Frenchies staff lose access to HTT shared resources |
| **DCE → HTT** | Delta Crown staff lose access to HTT shared resources |
| **HTT → any spoke** | HTT corporate users synced to brand tenants lose access |

> **Critical dependency**: `bi-support-agent` relies on TLL → HTT sync for Fabric Free
> license assignment. A TLL sync failure also breaks Lash Dash RLS (row-level security)
> because `salon_ids` attributes won't propagate.

---

## Diagnostic Steps

### Step 1 — Check Sync Job Status

```powershell
Connect-MgGraph -TenantId "0c0e35dc-188a-4eb3-b8ba-61752154b407" `
    -Scopes "Synchronization.Read.All"

# List all sync jobs on the cross-tenant sync service principal
$syncApps = Get-MgServicePrincipal -Filter "tags/any(t:t eq 'WindowsAzureActiveDirectoryIntegratedApp')" `
    -Property "id,displayName,appId" -All |
    Where-Object { $_.DisplayName -match "cross-tenant|b2b sync|tenant to tenant" }

foreach ($app in $syncApps) {
    Write-Host "`n=== $($app.DisplayName) ===" -ForegroundColor Cyan
    $jobs = Get-MgServicePrincipalSynchronizationJob -ServicePrincipalId $app.Id

    foreach ($job in $jobs) {
        Write-Host "  Job ID:     $($job.Id)"
        Write-Host "  Status:     $($job.Status.Code)" -ForegroundColor $(
            if ($job.Status.Code -eq "Active") { "Green" }
            elseif ($job.Status.Code -eq "Quarantine") { "Red" }
            else { "Yellow" }
        )
        Write-Host "  Last Run:   $($job.Status.LastSuccessfulExecutionWithExportActivityTimestamp)"
        Write-Host "  Quarantine: $($job.Status.QuarantineStatus.CurrentBegan)"
    }
}
```

### Step 2 — Check Provisioning Logs

```powershell
# Get recent provisioning errors (last 24 hours)
$since = (Get-Date).AddHours(-24).ToString("yyyy-MM-ddTHH:mm:ssZ")

$provLogs = Invoke-MgGraphRequest -Method GET `
    -Uri "https://graph.microsoft.com/v1.0/auditLogs/provisioning?`$filter=activityDateTime ge $since and statusInfo/status eq 'failure'&`$top=50"

$provLogs.value | ForEach-Object {
    Write-Host "`n--- Provisioning Failure ---" -ForegroundColor Red
    Write-Host "  Time:       $($_.activityDateTime)"
    Write-Host "  Action:     $($_.provisioningAction)"
    Write-Host "  Source:     $($_.sourceIdentity.displayName) ($($_.sourceIdentity.id))"
    Write-Host "  Target:     $($_.targetIdentity.displayName) ($($_.targetIdentity.id))"
    Write-Host "  Error Code: $($_.statusInfo.errorInformation.errorCode)"
    Write-Host "  Error Msg:  $($_.statusInfo.errorInformation.reason)"
}
```

### Step 3 — Check Attribute Mapping Errors

```powershell
# Get the sync schema to review attribute mappings
$schema = Get-MgServicePrincipalSynchronizationJobSchema `
    -ServicePrincipalId "<sync-app-id>" `
    -SynchronizationJobId "<job-id>"

# List attribute mappings for the User object
$userMappings = $schema.SynchronizationRules |
    Where-Object { $_.Name -match "User" } |
    Select-Object -ExpandProperty ObjectMappings |
    Where-Object { $_.SourceObjectName -eq "User" }

$userMappings.AttributeMappings | Format-Table Source, TargetAttributeName, FlowType
```

### Step 4 — Verify Cross-Tenant Access Policy Allows Sync

A common failure mode: the deny-by-default policy blocks sync because the partner
override is missing or misconfigured.

```powershell
# Check partner override for the failing tenant
$partnerTenantId = "<partner-tenant-id>"  # e.g., BCC = b5380912-...

$partnerPolicy = Invoke-MgGraphRequest -Method GET `
    -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners/$partnerTenantId"

# Check identity sync is allowed
Write-Host "Identity Sync Allowed: $($partnerPolicy.identitySynchronization.userSyncInbound.isSyncAllowed)"

# Check B2B collaboration inbound is allowed
Write-Host "B2B Inbound Access: $($partnerPolicy.b2bCollaborationInbound.applications.accessType)"
```

If `isSyncAllowed` is `$false` or `accessType` is `"blocked"`, the partner override
needs to be fixed. See `emergency-cross-tenant-revert.md` if this is causing an outage.

---

## Common Failure Modes

### 1. Sync Job Quarantined

**Symptoms**: Job status = `Quarantine`, users not provisioning

**Root Causes**:
- Graph API permissions revoked on the sync service principal
- Cross-tenant access policy changed (deny-by-default applied without proper override)
- Rate limiting (too many provisioning requests in a short period)

**Resolution**:
```powershell
# Re-grant permissions if revoked (requires admin consent)
# Then restart the quarantined job
Start-MgServicePrincipalSynchronizationJob `
    -ServicePrincipalId "<sync-app-id>" `
    -SynchronizationJobId "<job-id>"

# Monitor for 15 minutes
Start-Sleep -Seconds 900
$job = Get-MgServicePrincipalSynchronizationJob `
    -ServicePrincipalId "<sync-app-id>" `
    -SynchronizationJobId "<job-id>"
Write-Host "Job status after restart: $($job.Status.Code)"
```

### 2. Attribute Conflict (Duplicate userPrincipalName)

**Symptoms**: Provisioning log shows `ObjectConflict` or `AttributeValueMustBeUnique`

**Root Cause**: A user in the target tenant already has the same UPN or proxyAddress

**Resolution**:
```powershell
# Find the conflicting user in the target tenant
$conflictUpn = "<conflicting-upn>"
$existingUser = Get-MgUser -Filter "userPrincipalName eq '$conflictUpn'" `
    -Property "id,displayName,userType,createdDateTime"

if ($existingUser) {
    Write-Host "Conflict: $($existingUser.DisplayName) (Type: $($existingUser.UserType), Created: $($existingUser.CreatedDateTime))"
    # If this is a stale guest, consider removing it
    # If this is a legitimate user, update the source attribute mapping
}
```

### 3. UserType Mapping Wrong (Guest Instead of Member)

**Symptoms**: Synced users appear as `Guest` userType instead of `Member`

**Root Cause**: Attribute mapping for `userType` missing or set to default (Guest)

**Resolution**: Use `Fix-SyncUserTypeMapping.ps1`:
```powershell
./scripts/remediation/Fix-SyncUserTypeMapping.ps1 -TenantFilter "TLL" -WhatIf
```

Per `config/baseline.json`, the target mapping is:
- `mappingType`: `Constant`
- `value`: `Member`

### 4. Quota Exceeded

**Symptoms**: Provisioning log shows `DirectoryQuotaExceeded`

**Root Cause**: Target tenant has hit the directory object limit

**Resolution**:
- Check tenant license tier (M365 E3/E5 allows more objects)
- Delete stale/orphaned guest accounts to free quota
- Contact Microsoft Support if quota needs to be raised

### 5. Service Principal Permissions Revoked

**Symptoms**: Provisioning log shows `Authorization_RequestDenied` or `Forbidden`

**Root Cause**: The sync service principal lost its required Graph permissions

**Resolution**:
```powershell
# Check current permissions on the sync service principal
$sp = Get-MgServicePrincipal -Filter "displayName eq 'Cross-Tenant Sync'"
$appRoles = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id
$appRoles | Format-Table ResourceDisplayName, AppRoleId

# Re-grant required permissions (requires Global Admin)
# Required: Directory.ReadWrite.All, User.ReadWrite.All
```

---

## Escalation Path

| Level | Who | When |
|---|---|---|
| **L1 — Triage** | Dustin Boyd | Alert fires — run diagnostic steps 1–4 |
| **L2 — Fix** | Dustin Boyd | Known failure mode — apply documented resolution |
| **L3 — Escalation** | Tyler Granlund | Unknown failure, permissions issue, or policy change needed |
| **L4 — Microsoft Support** | Tyler Granlund | Quota issues, platform bugs, or persistent quarantine after fix |

---

## Post-Resolution Checklist

- [ ] Sync job status confirmed `Active` (not `Quarantine`)
- [ ] Provisioning log shows `Success` for recent operations
- [ ] Last successful sync < 24 hours ago
- [ ] All synced users have `userType = "Member"` (per baseline)
- [ ] Downstream dependencies verified:
  - [ ] `bi-support-agent` — TLL license assignment working (if TLL sync)
  - [ ] Brand security groups populated correctly
  - [ ] SharePoint access confirmed for synced users
- [ ] Incident documented in IT ops tracker
- [ ] Re-run Domain 1 audit: `./scripts/Invoke-DomainAudit.ps1 -Domain CrossTenantSync`

---

## Contacts

| Role | Name | Contact |
|---|---|---|
| **First Response** | Dustin Boyd | `dustin.boyd-admin@httbrands.com` |
| **Escalation** | Tyler Granlund | `tyler.granlund-admin@httbrands.com` |
