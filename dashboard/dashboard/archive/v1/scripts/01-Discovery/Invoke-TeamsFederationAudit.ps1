<#
.SYNOPSIS
    Audit Teams external access (federation) settings across all HTT tenants.
.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases.
.NOTES
    Requires: MicrosoftTeams module, Teams Admin or Global Admin role
#>
[CmdletBinding()] param([string[]]$TenantFilter)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force
$config = Get-HTTConfig

Write-Host "`n=== HTT Brands: Teams Federation Audit ===" -ForegroundColor Magenta

if (-not (Get-Module -ListAvailable -Name MicrosoftTeams)) {
    Write-HTTFinding -Severity CRITICAL -Message "MicrosoftTeams module not installed"; exit 1
}

$allTenants = Get-HTTAllTenants -Config $config
if ($TenantFilter) { $allTenants = $allTenants | Where-Object { $_.Alias -in $TenantFilter } }
$auditResults = @{}

foreach ($t in $allTenants) {
    Write-Host "`n== $($t.DisplayName) ($($t.Alias)) ==" -ForegroundColor Yellow
    $result = [ordered]@{ TenantAlias=$t.Alias; TenantId=$t.TenantId; AuditTime=(Get-Date -Format "o"); Federation=$null; Findings=@() }
    try {
        Connect-MicrosoftTeams -TenantId $t.TenantId | Out-Null
        $fed = Get-CsTenantFederationConfiguration
        $result.Federation = [ordered]@{
            AllowFederatedUsers=$fed.AllowFederatedUsers; AllowTeamsConsumer=$fed.AllowTeamsConsumer
            AllowTeamsConsumerInbound=$fed.AllowTeamsConsumerInbound; AllowedDomains=$null; BlockedDomains=@(); Mode="Unknown"
        }
        $ad = $fed.AllowedDomains
        if ($ad -is [string] -and $ad -eq "AllowAllKnownDomains") {
            $result.Federation.Mode = "OpenFederation"; $result.Federation.AllowedDomains = "AllowAllKnownDomains"
            Write-HTTFinding -Severity HIGH -Message "OPEN federation (should use allowlist)"
            $result.Findings += @{Severity="HIGH";Detail="Open federation mode"}
        } elseif ($ad) {
            $dl = @(); if ($ad.AllowedDomain) { $dl = $ad.AllowedDomain | ForEach-Object { $_.Domain } }
            $result.Federation.Mode = "AllowList"; $result.Federation.AllowedDomains = $dl
            Write-HTTFinding -Severity OK -Message "Allowlist mode ($($dl.Count) domains)"
            foreach ($d in $config.domainAllowlist) { if ($d -notin $dl) { Write-HTTFinding -Severity MEDIUM -Message "  HTT domain '$d' missing"; $result.Findings += @{Severity="MEDIUM";Detail="$d missing from allowlist"} } }
            foreach ($d in $dl) { if ($d -notin $config.domainAllowlist) { Write-HTTFinding -Severity MEDIUM -Message "  Non-HTT domain: $d"; $result.Findings += @{Severity="MEDIUM";Detail="Non-HTT domain in allowlist: $d"} } }
        }
        if ($fed.AllowTeamsConsumer) { Write-HTTFinding -Severity MEDIUM -Message "Teams consumer access ENABLED"; $result.Findings += @{Severity="MEDIUM";Detail="Consumer access enabled"} }
        else { Write-HTTFinding -Severity OK -Message "Teams consumer access disabled" }
        Disconnect-MicrosoftTeams -EA SilentlyContinue | Out-Null
    } catch { Write-HTTFinding -Severity CRITICAL -Message "Teams audit failed: $_"; $result.Findings += @{Severity="CRITICAL";Detail="$_"} }
    $auditResults[$t.Alias] = [PSCustomObject]$result
}

Export-HTTReport -ReportName "TeamsFederationAudit" -Data $auditResults
Write-Host "`nTeams federation audit complete.`n" -ForegroundColor Magenta
