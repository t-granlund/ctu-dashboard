<#
.SYNOPSIS
    Invoke-DomainAudit.ps1 — Targeted audit of one or more security domains
    against one or more HTT Brands tenants.

.DESCRIPTION
    A focused entry point for running a subset of the 7 CTU audit domains
    without the full orchestration overhead of Invoke-FullAudit.ps1.

    Delegates all actual audit work to Invoke-FullAudit.ps1 — this script
    exists purely as a convenience wrapper for spot-checks, scheduled tasks,
    and runbook-driven investigations. No audit logic is duplicated here.

    Supports the same authentication modes as Invoke-FullAudit.ps1:
      - Interactive (delegated) — default, prompts for credentials
      - AppOnly (client credentials) — certificate-based, no interactive prompt

    All output goes to the standard /reports directory via CTU.Core reporting.

.PARAMETER Domain
    One or more audit domains to run. Accepts multiple values.
    Valid values: CrossTenantSync, B2BCollaboration, B2BDirectConnect,
    GuestInventory, ConditionalAccess, TeamsFederation, IdentityGovernance.

.PARAMETER TenantKey
    One or more tenant keys to audit. If omitted, all 5 tenants are audited.
    Valid values: HTT, BCC, FN, TLL, DCE.

.PARAMETER AuthMode
    Authentication mode. 'Interactive' for delegated auth (default),
    'AppOnly' for certificate-based client credentials.

.PARAMETER ClientId
    Application (client) ID for the CTU service principal.
    Required when AuthMode is 'AppOnly'.

.PARAMETER CertificateThumbprint
    Certificate thumbprint for app-only authentication.
    Required when AuthMode is 'AppOnly'.

.PARAMETER SkipTeams
    Skip the Teams Federation domain even if it is included in -Domain.
    Teams federation audit requires separate interactive auth per tenant,
    which may not be available in automated/scheduled contexts.

.PARAMETER ConfigPath
    Optional path to a custom tenant configuration file.
    Defaults to the standard config location resolved by CTU.Core.

.EXAMPLE
    # Quick guest inventory check on TLL only
    .\Invoke-DomainAudit.ps1 -Domain GuestInventory -TenantKey TLL

.EXAMPLE
    # Cross-tenant sync health across all tenants
    .\Invoke-DomainAudit.ps1 -Domain CrossTenantSync

.EXAMPLE
    # Multiple domains, single tenant — investigate B2B posture for Bishops
    .\Invoke-DomainAudit.ps1 -Domain B2BCollaboration, B2BDirectConnect -TenantKey BCC

.EXAMPLE
    # Identity governance spot-check (runbook: pim-elevation-emergency.md)
    .\Invoke-DomainAudit.ps1 -Domain IdentityGovernance

.EXAMPLE
    # App-only auth for scheduled weekly guest spot-check (Phase 5 monitoring)
    .\Invoke-DomainAudit.ps1 -Domain GuestInventory `
        -AuthMode AppOnly `
        -ClientId $env:CTU_CLIENT_ID `
        -CertificateThumbprint $env:CTU_CERT_THUMBPRINT

.EXAMPLE
    # All domains except Teams on FN and DCE (skip Teams interactive auth)
    .\Invoke-DomainAudit.ps1 -Domain CrossTenantSync, B2BCollaboration, B2BDirectConnect, `
        GuestInventory, ConditionalAccess, TeamsFederation, IdentityGovernance `
        -TenantKey FN, DCE -SkipTeams

.NOTES
    Author:  CTU Governance Engine
    Requires: PowerShell 7+, Microsoft.Graph module
    See also: Invoke-FullAudit.ps1 (full 7-domain orchestration)

    Referenced by:
      - TC-029, TC-084 (test cases)
      - pim-elevation-emergency.md (runbook)
      - sync-failure-investigation.md (runbook)
      - Phase 5 weekly guest spot-check schedule

    ADR-001 Finding CODE-07: Rewritten as proper entry point with full
    param parity, comment-based help, and auth passthrough.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory, Position = 0,
        HelpMessage = 'Audit domain(s) to run. Accepts one or more values.')]
    [ValidateSet('CrossTenantSync', 'B2BCollaboration', 'B2BDirectConnect',
                 'GuestInventory', 'ConditionalAccess', 'TeamsFederation', 'IdentityGovernance')]
    [string[]]$Domain,

    [Parameter(Position = 1,
        HelpMessage = 'Tenant key(s) to audit. Omit to audit all tenants.')]
    [ValidateSet('HTT', 'BCC', 'FN', 'TLL', 'DCE')]
    [string[]]$TenantKey,

    [Parameter(HelpMessage = 'Authentication mode: Interactive (delegated) or AppOnly (certificate).')]
    [ValidateSet('Interactive', 'AppOnly')]
    [string]$AuthMode = 'Interactive',

    [Parameter(HelpMessage = 'App registration client ID for AppOnly auth.')]
    [string]$ClientId,

    [Parameter(HelpMessage = 'Certificate thumbprint for AppOnly auth.')]
    [string]$CertificateThumbprint,

    [Parameter(HelpMessage = 'Skip Teams Federation audit (requires separate interactive auth).')]
    [switch]$SkipTeams,

    [Parameter(HelpMessage = 'Path to custom tenant configuration file.')]
    [string]$ConfigPath
)

# --- Build splat for Invoke-FullAudit.ps1 ---
$fullAuditParams = @{
    Domains  = $Domain
    AuthMode = $AuthMode
}

if ($TenantKey)              { $fullAuditParams['TenantKeys']            = $TenantKey }
if ($ClientId)               { $fullAuditParams['ClientId']              = $ClientId }
if ($CertificateThumbprint)  { $fullAuditParams['CertificateThumbprint'] = $CertificateThumbprint }
if ($ConfigPath)             { $fullAuditParams['ConfigPath']            = $ConfigPath }
if ($SkipTeams)              { $fullAuditParams['SkipTeams']             = $true }

# --- Tell the user what's about to happen ---
$tenantLabel  = if ($TenantKey) { $TenantKey -join ', ' } else { 'ALL' }
$domainLabel  = $Domain -join ', '
$repoRoot     = Split-Path $PSScriptRoot -Parent
$reportsDir   = Join-Path $repoRoot 'reports'

Write-Host "`n---------------------------------------------" -ForegroundColor Cyan
Write-Host "  CTU Domain Audit" -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Cyan
Write-Host "  Domains : $domainLabel" -ForegroundColor White
Write-Host "  Tenants : $tenantLabel" -ForegroundColor White
Write-Host "  Auth    : $AuthMode" -ForegroundColor White
if ($SkipTeams) {
    Write-Host "  Teams   : SKIPPED" -ForegroundColor Yellow
}
Write-Host "  Reports : $reportsDir" -ForegroundColor White
Write-Host "---------------------------------------------`n" -ForegroundColor Cyan

# --- Delegate to Invoke-FullAudit.ps1 ---
& "$PSScriptRoot\Invoke-FullAudit.ps1" @fullAuditParams
