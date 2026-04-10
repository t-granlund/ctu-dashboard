<#
.SYNOPSIS
    Set Teams external access (federation) to explicit allowlist mode,
    limited to HTT Brands domains only.
.DESCRIPTION
    Phase 3 Remediation script. Converts Teams federation from open federation
    (AllowAllKnownDomains) to an explicit allowlist of HTT Brands domains.
    Also disables Teams consumer access.
.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases.
.PARAMETER WhatIf
    Preview changes without applying them.
.PARAMETER AdditionalDomains
    Optional. Additional domains to include beyond the HTT domain allowlist.
.EXAMPLE
    .\Set-TeamsFederationAllowlist.ps1 -WhatIf
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [string[]]$TenantFilter,
    [string[]]$AdditionalDomains
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

$config   = Get-CTUConfig
$baseline = Get-CTUBaseline

$allowedDomains = $config.domainAllowlist
if ($AdditionalDomains) { $allowedDomains += $AdditionalDomains }

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Teams Federation Hardening                          ║
  ║   Phase 3: Explicit Allowlist                                      ║
  ║   Allowed domains: $($allowedDomains -join ", ")
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $(if ($WhatIfPreference) { "Yellow" } else { "Red" })

$allTenants = Get-CTUTenantList -Config $config
if ($TenantFilter) {
    $allTenants = $allTenants | Where-Object { $_.Key -in $TenantFilter }
}

foreach ($tenant in $allTenants) {
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  $($tenant.DisplayName) ($($tenant.Key))  " -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow

    try {
        Connect-MicrosoftTeams -TenantId $tenant.tenantId | Out-Null

        $current = Get-CsTenantFederationConfiguration
        Write-CTUFinding -Severity "INFO" -Message "Current mode: $($current.AllowedDomains)"

        if ($WhatIfPreference) {
            Write-CTUFinding -Severity "INFO" -Message "WOULD SET:"
            Write-CTUFinding -Severity "INFO" -Message "  AllowFederatedUsers: True"
            Write-CTUFinding -Severity "INFO" -Message "  AllowTeamsConsumer: False"
            Write-CTUFinding -Severity "INFO" -Message "  AllowedDomains: $($allowedDomains -join ', ')"
        }
        else {
            # Build the allowed domain list
            $domainObjects = New-Object "System.Collections.Generic.List[Microsoft.Rtc.Management.WritableConfig.Settings.Edge.AllowedDomain]"
            foreach ($domain in $allowedDomains) {
                $domainObjects.Add((New-CsEdgeAllowedDomain -Domain $domain))
            }

            Set-CsTenantFederationConfiguration `
                -AllowFederatedUsers $true `
                -AllowTeamsConsumer $false `
                -AllowTeamsConsumerInbound $false `
                -AllowedDomains $domainObjects

            Write-CTUFinding -Severity "OK" -Message "Federation set to allowlist mode with $($allowedDomains.Count) domains"
        }

        Disconnect-MicrosoftTeams -ErrorAction SilentlyContinue | Out-Null
    }
    catch {
        Write-CTUFinding -Severity "HIGH" -Message "Failed: $_"
    }
}

Write-Host "`nTeams federation hardening complete.`n" -ForegroundColor Magenta
