<#
.SYNOPSIS
    Master orchestrator — runs all Phase 1 Discovery audit scripts.
.PARAMETER TenantFilter
    Limit all audits to specific tenant aliases.
.PARAMETER SkipTeams
    Skip Teams federation audit (requires separate module/auth).
.PARAMETER SkipGovernance
    Skip identity governance audit (requires Entra ID Governance license).
.EXAMPLE
    .\Invoke-FullDiscovery.ps1
.EXAMPLE
    .\Invoke-FullDiscovery.ps1 -TenantFilter "HTT","TLL" -SkipTeams
#>
[CmdletBinding()] param([string[]]$TenantFilter, [switch]$SkipTeams, [switch]$SkipGovernance)
$ErrorActionPreference = "Stop"
$startTime = Get-Date
Import-Module (Join-Path $PSScriptRoot ".." "modules" "HTT.CrossTenant.Core.psm1") -Force

Write-Host @"

  =========================================================================
  HTT Brands — Cross-Tenant Identity Audit | Full Phase 1 Discovery
  Scope: $(if ($TenantFilter) { $TenantFilter -join ", " } else { "All tenants" })
  =========================================================================

"@ -ForegroundColor Magenta

Test-HTTPrerequisites | Out-Null

$discoveryDir = Join-Path $PSScriptRoot "01-Discovery"
$scripts = @(
    @{Name="Cross-Tenant Policy Audit"; File="Invoke-CrossTenantPolicyAudit.ps1"},
    @{Name="Guest User Inventory";      File="Invoke-GuestUserInventory.ps1"},
    @{Name="Sync Job Audit";            File="Invoke-SyncJobAudit.ps1"},
    @{Name="Conditional Access Audit";  File="Invoke-ConditionalAccessAudit.ps1"}
)
if (-not $SkipTeams)      { $scripts += @{Name="Teams Federation Audit";     File="Invoke-TeamsFederationAudit.ps1"} }
if (-not $SkipGovernance) { $scripts += @{Name="Identity Governance Audit";  File="Invoke-IdentityGovernanceAudit.ps1"} }

$results = @{}; $i = 0
foreach ($s in $scripts) {
    $i++; $path = Join-Path $discoveryDir $s.File
    Write-Host "`n[$i/$($scripts.Count)] $($s.Name)" -ForegroundColor White
    if (-not (Test-Path $path)) { Write-Warning "  Not found: $path"; $results[$s.Name]="SKIPPED"; continue }
    try { $params = @{}; if ($TenantFilter) { $params.TenantFilter = $TenantFilter }; & $path @params; $results[$s.Name]="OK" }
    catch { Write-Warning "  Failed: $_"; $results[$s.Name]="FAILED" }
}

$dur = (Get-Date) - $startTime
Write-Host "`n  Discovery complete in $($dur.ToString('hh\:mm\:ss'))" -ForegroundColor Green
foreach ($n in $results.Keys) { Write-Host "  $($n.PadRight(40)) $($results[$n])" -ForegroundColor $(if($results[$n] -eq "OK"){"Green"}elseif($results[$n] -eq "SKIPPED"){"Yellow"}else{"Red"}) }
Export-HTTReport -ReportName "DiscoverySummary" -Data @{Duration=$dur.ToString();Results=$results}

Write-Host "`n  Next: Review reports/ then run scripts/02-Analysis/Export-AuditReport.ps1`n" -ForegroundColor Cyan
