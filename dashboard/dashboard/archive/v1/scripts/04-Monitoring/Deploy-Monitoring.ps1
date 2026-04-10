<#
.SYNOPSIS
    Export KQL alert queries for continuous cross-tenant drift detection.
.PARAMETER OutputKQL
    Export KQL queries to monitoring/kql/ directory.
.PARAMETER RunBaselineCheck
    Run immediate baseline comparison.
#>
[CmdletBinding()] param([switch]$RunBaselineCheck, [switch]$OutputKQL)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force

Write-Host "`n=== HTT Brands: Monitoring & Drift Detection ===" -ForegroundColor Magenta

$kql = @{
"CrossTenantPolicyChanges" = @'
// Cross-tenant access policy changes (every 15min, alert on >0)
AuditLogs | where TimeGenerated > ago(15m)
| where Category == "Policy"
| where OperationName has_any ("Update cross tenant access setting","Add partner to cross-tenant access setting","Delete partner of cross-tenant access setting")
| project TimeGenerated, OperationName, InitiatedBy.user.userPrincipalName, Result
'@
"ConditionalAccessChanges" = @'
// CA policy changes (every 15min, alert on >0)
AuditLogs | where TimeGenerated > ago(15m) | where Category == "Policy"
| where OperationName has_any ("Update conditional access policy","Delete conditional access policy","Add conditional access policy")
| project TimeGenerated, OperationName, TargetResources[0].displayName, InitiatedBy.user.userPrincipalName
'@
"SyncProvisioningFailures" = @'
// Sync failures (hourly, alert on >5)
AuditLogs | where TimeGenerated > ago(1h) | where Category == "ProvisioningManagement" | where Result == "failure"
| summarize FailureCount=count() by tostring(TargetResources[0].displayName)
'@
"NewGuestAccounts" = @'
// New guests (daily monitoring)
AuditLogs | where TimeGenerated > ago(24h)
| where OperationName == "Invite external user" or (OperationName == "Add user" and TargetResources[0].userPrincipalName contains "#EXT#")
| project TimeGenerated, TargetResources[0].displayName, InitiatedBy.user.userPrincipalName
'@
"GuestsInPrivilegedRoles" = @'
// CRITICAL: Guest added to priv role (every 15min)
AuditLogs | where TimeGenerated > ago(15m) | where OperationName == "Add member to role"
| extend Member = tostring(TargetResources[1].userPrincipalName)
| where Member contains "#EXT#"
| project TimeGenerated, tostring(TargetResources[0].displayName), Member
'@
}

if ($OutputKQL) {
    $dir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "monitoring" "kql"
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    foreach ($name in $kql.Keys) {
        $kql[$name] | Out-File (Join-Path $dir "$name.kql") -Encoding utf8
        Write-HTTFinding -Severity OK -Message "Exported: $name.kql"
    }
    Write-Host "`n  Import into Log Analytics as alert rules or workbook queries`n" -ForegroundColor Cyan
}

if ($RunBaselineCheck) {
    Write-HTTSection "Running Baseline Check"
    $s = Join-Path $PSScriptRoot ".." "01-Discovery" "Invoke-CrossTenantPolicyAudit.ps1"
    if (Test-Path $s) { & $s } else { Write-Warning "Discovery script not found" }
}

if (-not $OutputKQL -and -not $RunBaselineCheck) { Write-Host "  Usage: -OutputKQL or -RunBaselineCheck`n" -ForegroundColor Yellow }
