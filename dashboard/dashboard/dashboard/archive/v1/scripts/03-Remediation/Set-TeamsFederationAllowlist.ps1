<#
.SYNOPSIS
    Set Teams federation to explicit allowlist with HTT domains only.
.PARAMETER TenantFilter
    Limit to specific tenant aliases.
.PARAMETER AdditionalDomains
    Extra domains beyond HTT allowlist.
.NOTES
    Requires: MicrosoftTeams module, Teams Admin role
#>
[CmdletBinding(SupportsShouldProcess)] param([string[]]$TenantFilter, [string[]]$AdditionalDomains)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force
$config = Get-HTTConfig; $domains = $config.domainAllowlist; if ($AdditionalDomains) { $domains += $AdditionalDomains }

Write-Host "`n=== Teams Federation -> Allowlist [$(if($WhatIfPreference){'PREVIEW'}else{'LIVE'})] ===" -ForegroundColor $(if($WhatIfPreference){"Yellow"}else{"Red"})
Write-Host "  Domains: $($domains -join ', ')" -ForegroundColor Cyan

$allTenants = Get-HTTAllTenants -Config $config
if ($TenantFilter) { $allTenants = $allTenants | Where-Object { $_.Alias -in $TenantFilter } }

foreach ($t in $allTenants) {
    Write-Host "`n== $($t.DisplayName) ($($t.Alias)) ==" -ForegroundColor Yellow
    try {
        Connect-MicrosoftTeams -TenantId $t.TenantId | Out-Null
        if ($WhatIfPreference) { Write-HTTFinding -Severity INFO -Message "WOULD set allowlist: $($domains -join ', ')" }
        else {
            $dl = New-Object "System.Collections.Generic.List[Microsoft.Rtc.Management.WritableConfig.Settings.Edge.AllowedDomain]"
            foreach ($d in $domains) { $dl.Add((New-CsEdgeAllowedDomain -Domain $d)) }
            Set-CsTenantFederationConfiguration -AllowFederatedUsers $true -AllowTeamsConsumer $false -AllowTeamsConsumerInbound $false -AllowedDomains $dl
            Write-HTTFinding -Severity OK -Message "Allowlist applied ($($domains.Count) domains)"
        }
        Disconnect-MicrosoftTeams -EA SilentlyContinue | Out-Null
    } catch { Write-HTTFinding -Severity HIGH -Message "Failed: $_" }
}
