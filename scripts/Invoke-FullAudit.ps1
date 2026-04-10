<#
.SYNOPSIS
    Invoke-FullAudit.ps1 - Runs the complete cross-tenant identity audit
    across all HTT Brands tenants and all 7 security domains.
.DESCRIPTION
    Orchestrates authentication and audit execution for each tenant:
      1. Cross-Tenant Synchronization
      2. B2B Collaboration
      3. B2B Direct Connect
      4. Guest User Inventory
      5. Conditional Access
      6. Teams Federation (requires interactive auth)
      7. Identity Governance

    Produces JSON, CSV, and Markdown reports in the /reports directory.
.PARAMETER TenantKeys
    Specific tenant(s) to audit. Default: all tenants.
.PARAMETER Domains
    Specific domain(s) to audit. Default: all domains.
.PARAMETER AuthMode
    Interactive (delegated) or AppOnly (client credentials). Default: Interactive.
.PARAMETER SkipTeams
    Skip Teams federation audit (requires separate interactive auth per tenant).
.EXAMPLE
    # Full audit - all tenants, all domains
    .\Invoke-FullAudit.ps1

    # Audit only the TLL tenant
    .\Invoke-FullAudit.ps1 -TenantKeys TLL

    # Audit only guest inventory across all tenants
    .\Invoke-FullAudit.ps1 -Domains GuestInventory

    # App-only auth (requires multi-tenant app registration)
    .\Invoke-FullAudit.ps1 -AuthMode AppOnly -ClientId "YOUR-APP-ID" -CertificateThumbprint "YOUR-CERT-THUMB"
#>

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('HTT', 'BCC', 'FN', 'TLL', 'DCE')]
    [string[]]$TenantKeys,

    [Parameter()]
    [ValidateSet('CrossTenantSync', 'B2BCollaboration', 'B2BDirectConnect',
                 'GuestInventory', 'ConditionalAccess', 'TeamsFederation', 'IdentityGovernance')]
    [string[]]$Domains,

    [Parameter()]
    [ValidateSet('Interactive', 'AppOnly')]
    [string]$AuthMode = 'Interactive',

    [Parameter()]
    [string]$ClientId,

    [Parameter()]
    [string]$CertificateThumbprint,

    [Parameter()]
    [SecureString]$ClientSecret,

    [Parameter()]
    [switch]$SkipTeams,

    [Parameter()]
    [string]$ConfigPath
)

$ErrorActionPreference = 'Continue'
$scriptRoot = $PSScriptRoot
$repoRoot = Split-Path $scriptRoot -Parent

# --- Import Modules ---
Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "  HTT Brands Cross-Tenant Identity Audit"      -ForegroundColor Cyan
Write-Host "=============================================`n" -ForegroundColor Cyan

$modulePaths = @(
    "$repoRoot\modules\CTU.Core\CTU.Core.psm1",
    "$repoRoot\modules\CTU.CrossTenantSync\CTU.CrossTenantSync.psm1",
    "$repoRoot\modules\CTU.B2BCollaboration\CTU.B2BCollaboration.psm1",
    "$repoRoot\modules\CTU.B2BDirectConnect\CTU.B2BDirectConnect.psm1",
    "$repoRoot\modules\CTU.GuestInventory\CTU.GuestInventory.psm1",
    "$repoRoot\modules\CTU.ConditionalAccess\CTU.ConditionalAccess.psm1",
    "$repoRoot\modules\CTU.TeamsFederation\CTU.TeamsFederation.psm1",
    "$repoRoot\modules\CTU.IdentityGovernance\CTU.IdentityGovernance.psm1"
)

foreach ($modPath in $modulePaths) {
    if (Test-Path $modPath) {
        Import-Module $modPath -Force -DisableNameChecking
        Write-Verbose "Loaded: $modPath"
    }
    else {
        throw "Module not found: $modPath. Run from the repo root."
    }
}

# --- Load Configuration ---
$configParams = @{}
if ($ConfigPath) { $configParams['ConfigPath'] = $ConfigPath }
$config = Get-CTUConfig @configParams

# --- Determine scope ---
if (-not $TenantKeys) {
    $allTenants = Get-CTUTenantList -Config $config
    $TenantKeys = $allTenants | Select-Object -ExpandProperty Key
}

$allDomains = @('CrossTenantSync', 'B2BCollaboration', 'B2BDirectConnect',
                'GuestInventory', 'ConditionalAccess', 'TeamsFederation', 'IdentityGovernance')
if (-not $Domains) {
    $Domains = $allDomains
}
if ($SkipTeams) {
    $Domains = $Domains | Where-Object { $_ -ne 'TeamsFederation' }
}

Write-Host "Tenants: $($TenantKeys -join ', ')" -ForegroundColor White
Write-Host "Domains: $($Domains -join ', ')" -ForegroundColor White
Write-Host "Auth:    $AuthMode" -ForegroundColor White

# --- Initialize Report ---
$auditName = "FullAudit"
if ($TenantKeys.Count -eq 1) { $auditName = "Audit_$($TenantKeys[0])" }
if ($Domains.Count -eq 1) { $auditName = "Audit_$($Domains[0])" }

$report = New-CTUAuditReport -AuditName $auditName -Config $config

# --- Auth parameters ---
$authParams = @{ AuthMode = $AuthMode; Config = $config }
if ($ClientId) { $authParams['ClientId'] = $ClientId }
if ($CertificateThumbprint) { $authParams['CertificateThumbprint'] = $CertificateThumbprint }
if ($ClientSecret) {
    Write-Warning "[CTU] ClientSecret auth is deprecated for production. Use -CertificateThumbprint for app-only authentication."
    $authParams['ClientSecret'] = $ClientSecret
}

# --- Audit Loop ---
# Graph-based domains (use Connect-MgGraph)
$graphDomains = $Domains | Where-Object { $_ -ne 'TeamsFederation' }
$teamsDomains = $Domains | Where-Object { $_ -eq 'TeamsFederation' }

foreach ($tenantKey in $TenantKeys) {
    Write-Host "`n========================================" -ForegroundColor White
    Write-Host "  AUDITING: $tenantKey" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor White

    # Connect to Graph for this tenant
    if ($graphDomains.Count -gt 0) {
        try {
            Connect-CTUTenant -TenantKey $tenantKey @authParams
        }
        catch {
            Write-Warning "Failed to connect to $tenantKey : $_"
            $null = $report.Errors.Add("[$tenantKey] Connection failed: $_")
            Add-CTUFinding -ReportContext $report -Domain 'Authentication' -TenantKey $tenantKey `
                -Severity 'Critical' -Title "Failed to authenticate to tenant" `
                -Description "Could not connect to $tenantKey. Error: $_"
            continue
        }

        # Run each Graph-based domain audit
        foreach ($domainName in $graphDomains) {
            try {
                switch ($domainName) {
                    'CrossTenantSync'   { Invoke-CTUCrossTenantSyncAudit -TenantKey $tenantKey -ReportContext $report -Config $config }
                    'B2BCollaboration'  { Invoke-CTUB2BCollaborationAudit -TenantKey $tenantKey -ReportContext $report -Config $config }
                    'B2BDirectConnect'  { Invoke-CTUB2BDirectConnectAudit -TenantKey $tenantKey -ReportContext $report -Config $config }
                    'GuestInventory'    { Invoke-CTUGuestInventoryAudit -TenantKey $tenantKey -ReportContext $report -Config $config }
                    'ConditionalAccess' { Invoke-CTUConditionalAccessAudit -TenantKey $tenantKey -ReportContext $report -Config $config }
                    'IdentityGovernance'{ Invoke-CTUIdentityGovernanceAudit -TenantKey $tenantKey -ReportContext $report -Config $config }
                }
            }
            catch {
                Write-Warning "[$tenantKey] $domainName audit failed: $_"
                $null = $report.Errors.Add("[$tenantKey] $domainName failed: $_")
            }
        }

        # Disconnect Graph
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }

    # Teams federation (separate auth)
    if ($teamsDomains.Count -gt 0) {
        try {
            Connect-CTUTeams -TenantKey $tenantKey -Config $config
            Invoke-CTUTeamsFederationAudit -TenantKey $tenantKey -ReportContext $report -Config $config
            try { Disconnect-MicrosoftTeams -ErrorAction SilentlyContinue } catch {}
        }
        catch {
            Write-Warning "[$tenantKey] Teams federation audit failed: $_"
            $null = $report.Errors.Add("[$tenantKey] TeamsFederation failed: $_")
        }
    }
}

# --- Export Report ---
Export-CTUReport -ReportContext $report

Write-Host "`nAudit complete. Reports saved to: $($report.ReportDir)`n" -ForegroundColor Green
