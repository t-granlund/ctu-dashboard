<#
.SYNOPSIS
    Invoke-DomainAudit.ps1 - Quick single-domain audit against one or all tenants.
.DESCRIPTION
    Lighter-weight entry point for running a single audit domain without the
    full orchestration overhead. Useful for spot-checking a specific area.
.EXAMPLE
    # Quick guest inventory check on TLL only
    .\Invoke-DomainAudit.ps1 -Domain GuestInventory -TenantKey TLL

    # Cross-tenant sync check across all tenants
    .\Invoke-DomainAudit.ps1 -Domain CrossTenantSync
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('CrossTenantSync', 'B2BCollaboration', 'B2BDirectConnect',
                 'GuestInventory', 'ConditionalAccess', 'TeamsFederation', 'IdentityGovernance')]
    [string]$Domain,

    [Parameter()]
    [ValidateSet('HTT', 'BCC', 'FN', 'TLL', 'DCE')]
    [string[]]$TenantKey
)

# Delegate to the full audit script with domain filter
$params = @{ Domains = $Domain }
if ($TenantKey) { $params['TenantKeys'] = $TenantKey }
if ($Domain -eq 'TeamsFederation') { } else { }

& "$PSScriptRoot\Invoke-FullAudit.ps1" @params
