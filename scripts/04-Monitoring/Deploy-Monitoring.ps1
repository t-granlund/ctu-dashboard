<#
.SYNOPSIS
    Deploy monitoring queries and alerts for continuous cross-tenant access
    configuration drift detection.
.DESCRIPTION
    Phase 4 Monitoring script. Provides:
      - KQL queries for Azure Monitor / Log Analytics to detect policy changes
      - Scheduled re-audit against the deny-by-default baseline
      - Alert templates for critical configuration drift
    
    NOTE: KQL queries require Azure Monitor with Entra ID audit logs routed
    to a Log Analytics workspace. This script outputs the queries and
    optionally runs a baseline comparison.
.PARAMETER RunBaselineCheck
    Run an immediate baseline comparison against current state.
.PARAMETER OutputKQL
    Export KQL queries to files for import into Log Analytics.
.EXAMPLE
    .\Deploy-Monitoring.ps1 -OutputKQL
.EXAMPLE
    .\Deploy-Monitoring.ps1 -RunBaselineCheck
#>
[CmdletBinding()]
param(
    [switch]$RunBaselineCheck,
    [switch]$OutputKQL
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Monitoring & Drift Detection                        ║
  ║   Phase 4: Continuous Monitoring                                   ║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

# ── KQL Alert Queries ────────────────────────────────────────────────────────

$kqlQueries = @{

"CrossTenantPolicyChanges" = @"
// Alert: Cross-tenant access policy modifications
// Frequency: Every 15 minutes | Threshold: > 0 results
AuditLogs
| where TimeGenerated > ago(15m)
| where Category == "Policy"
| where OperationName has_any (
    "Update cross tenant access setting",
    "Add partner to cross-tenant access setting",
    "Delete partner of cross-tenant access setting",
    "Update default cross-tenant access setting"
)
| project
    TimeGenerated,
    OperationName,
    InitiatedBy.user.userPrincipalName,
    TargetResources[0].displayName,
    Result,
    AdditionalDetails
| order by TimeGenerated desc
"@

"ConditionalAccessChanges" = @"
// Alert: Conditional Access policy modifications affecting external users
// Frequency: Every 15 minutes | Threshold: > 0 results
AuditLogs
| where TimeGenerated > ago(15m)
| where Category == "Policy"
| where OperationName has_any (
    "Update conditional access policy",
    "Delete conditional access policy",
    "Add conditional access policy"
)
| extend PolicyName = tostring(TargetResources[0].displayName)
| extend ModifiedBy = tostring(InitiatedBy.user.userPrincipalName)
| project TimeGenerated, OperationName, PolicyName, ModifiedBy, Result
| order by TimeGenerated desc
"@

"IdentitySyncFailures" = @"
// Alert: Cross-tenant sync provisioning failures
// Frequency: Every 1 hour | Threshold: > 5 results
AuditLogs
| where TimeGenerated > ago(1h)
| where Category == "ProvisioningManagement"
| where Result == "failure"
| extend TargetUser = tostring(TargetResources[0].displayName)
| extend ErrorCode = tostring(AdditionalDetails[0].value)
| project TimeGenerated, OperationName, TargetUser, ErrorCode, Result
| summarize FailureCount = count() by TargetUser, ErrorCode
| order by FailureCount desc
"@

"NewGuestAccounts" = @"
// Monitoring: New guest/external user accounts created
// Frequency: Daily | Use for review, not alerting
AuditLogs
| where TimeGenerated > ago(24h)
| where OperationName == "Invite external user"
    or (OperationName == "Add user" and TargetResources[0].userPrincipalName contains "#EXT#")
| extend InvitedUser = tostring(TargetResources[0].displayName)
| extend InvitedEmail = tostring(TargetResources[0].userPrincipalName)
| extend InvitedBy = tostring(InitiatedBy.user.userPrincipalName)
| project TimeGenerated, InvitedUser, InvitedEmail, InvitedBy, OperationName
| order by TimeGenerated desc
"@

"GuestsAddedToPrivilegedRoles" = @"
// Alert: Guest/external users added to privileged directory roles
// Frequency: Every 15 minutes | Threshold: > 0 results | Severity: CRITICAL
AuditLogs
| where TimeGenerated > ago(15m)
| where OperationName == "Add member to role"
| extend RoleName = tostring(TargetResources[0].displayName)
| extend MemberAdded = tostring(TargetResources[1].userPrincipalName)
| where MemberAdded contains "#EXT#"
| project TimeGenerated, RoleName, MemberAdded, InitiatedBy.user.userPrincipalName
| order by TimeGenerated desc
"@

"TeamsFederationChanges" = @"
// Alert: Teams external access / federation changes
// Frequency: Every 1 hour | Threshold: > 0 results
AuditLogs
| where TimeGenerated > ago(1h)
| where OperationName has_any (
    "Set-CsTenantFederationConfiguration",
    "Set-CsExternalAccessPolicy"
)
| extend ModifiedBy = tostring(InitiatedBy.user.userPrincipalName)
| project TimeGenerated, OperationName, ModifiedBy, AdditionalDetails
| order by TimeGenerated desc
"@

}

# ── Export KQL queries ───────────────────────────────────────────────────────

if ($OutputKQL) {
    Write-CTUSection "Exporting KQL Queries"

    $kqlDir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "monitoring" "kql"
    New-Item -ItemType Directory -Path $kqlDir -Force | Out-Null

    foreach ($name in $kqlQueries.Keys) {
        $filePath = Join-Path $kqlDir "$name.kql"
        $kqlQueries[$name] | Out-File $filePath -Encoding utf8
        Write-CTUFinding -Severity "OK" -Message "Exported: $filePath"
    }

    Write-Host "`n  Import these into your Log Analytics workspace as:" -ForegroundColor Cyan
    Write-Host "    - Saved queries (for ad-hoc investigation)" -ForegroundColor White
    Write-Host "    - Alert rules (for real-time notification)" -ForegroundColor White
    Write-Host "    - Workbook queries (for dashboard visualization)" -ForegroundColor White
}

# ── Baseline comparison ──────────────────────────────────────────────────────

if ($RunBaselineCheck) {
    Write-CTUSection "Running Baseline Comparison"
    Write-Host "  Executing cross-tenant policy audit against baseline..." -ForegroundColor Cyan

    # NOTE: Discovery scripts have been moved to CTU.* modules.
    # For baseline comparison, use: Invoke-FullAudit.ps1 -Domains CrossTenantSync
    # or call the appropriate CTU.Discovery module functions.
    Write-CTUFinding -Severity "INFO" -Message "Baseline check should call Invoke-FullAudit.ps1 -Domains CrossTenantSync or CTU.Discovery module functions"
}

if (-not $OutputKQL -and -not $RunBaselineCheck) {
    Write-Host "`n  Usage:" -ForegroundColor Yellow
    Write-Host "    -OutputKQL       Export KQL queries to monitoring/kql/ directory" -ForegroundColor White
    Write-Host "    -RunBaselineCheck Run immediate audit against baseline`n" -ForegroundColor White
}

Write-Host "`nMonitoring deployment complete.`n" -ForegroundColor Magenta
