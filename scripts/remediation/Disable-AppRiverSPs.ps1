<#
.SYNOPSIS
    Disables the 3 AppRiver service principals across HTT, FN, and TLL tenants.

.DESCRIPTION
    Post-call action item #1 from Tyler × Megan call (April 10, 2026).
    Megan confirmed: "100% migrated, no account with AppRiver any longer."
    Approved for immediate removal.

    These 3 SPs had broad delegated permissions including:
      - Policy.ReadWrite.ConditionalAccess
      - DelegatedAdminRelationship.ReadWrite.All
      - RoleManagement.ReadWrite.Directory
      - User.ReadWrite.All

    This script DISABLES (accountEnabled = false) rather than deletes,
    so the action is reversible if something unexpected breaks.

    Default mode is WhatIf — shows what would be disabled without touching anything.
    Pass -Execute to actually disable the service principals.

.PARAMETER Execute
    Opt-in switch to apply live changes. Without this, the script only
    reports what it would do (dry-run / WhatIf).

.PARAMETER TenantKeys
    Which tenants to target. Defaults to HTT, FN, TLL (the 3 where AppRiver SPs exist).

.PARAMETER Force
    Skip the interactive confirmation prompt when -Execute is specified.

.PARAMETER Delete
    Instead of disabling (soft), fully remove the service principals.
    Use with caution — this is NOT reversible.

.EXAMPLE
    ./Disable-AppRiverSPs.ps1
    # Dry run — shows which SPs would be disabled in which tenants.

.EXAMPLE
    ./Disable-AppRiverSPs.ps1 -Execute
    # Disables all 3 AppRiver SPs in HTT, FN, TLL (with confirmation prompt).

.EXAMPLE
    ./Disable-AppRiverSPs.ps1 -Execute -Force
    # Disables without confirmation prompt.

.NOTES
    Author      : Tyler Granlund / CTU Automation
    Version     : 1.0.0
    Requires    : Microsoft.Graph PowerShell SDK
    Call Ref    : Tyler × Megan, April 10 2026 — Action Item #1
    Reversible  : Yes (re-enable via Update-MgServicePrincipal -AccountEnabled $true)
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [switch]$Execute,

    [ValidateSet('HTT', 'FN', 'TLL')]
    [string[]]$TenantKeys = @('HTT', 'FN', 'TLL'),

    [switch]$Force,
    [switch]$Delete
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot '..' '..' 'modules' 'CTU.Core' 'CTU.Core.psm1') -Force

# ── Constants ────────────────────────────────────────────────────────────────

$AppRiverSPs = @(
    @{
        AppId = '7aecb184-3fb1-437b-abc5-a995e972fe1f'
        Name  = 'Office 365 Security Audit App'
    }
    @{
        AppId = 'bee5026c-2493-4557-bc21-ccef515d9e61'
        Name  = 'Office365 Integration'
    }
    @{
        AppId = 'cc695ec2-07c4-454b-95bc-418f5a8047fc'
        Name  = 'PshellTools'
    }
)

$AppRiverTenantId = 'd5e2dca7-948b-4e7c-9d9e-af97e9ca0f92'
$config           = Get-CTUConfig
$isWhatIf         = -not $Execute -or $WhatIfPreference
$runStamp         = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$reportsDir       = Join-Path $PSScriptRoot '..' '..' 'reports'
$snapshotDir      = Join-Path $reportsDir 'snapshots' $runStamp

if (-not (Test-Path $reportsDir)) { New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null }

# ── Results ──────────────────────────────────────────────────────────────────

$results = [System.Collections.ArrayList]::new()

function Add-Result {
    param(
        [string]$Tenant, [string]$SPName, [string]$AppId,
        [string]$Status,  # FOUND_WOULD_DISABLE | DISABLED | NOT_FOUND | ERROR | DELETED
        [string]$Detail
    )
    $null = $script:results.Add([PSCustomObject]@{
        TenantKey = $Tenant
        SPName    = $SPName
        AppId     = $AppId
        Status    = $Status
        Detail    = $Detail
        Timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    })
}

# ── Pre-change Snapshot ──────────────────────────────────────────────────────

function Save-Snapshot {
    param([string]$Tenant, [string]$AppId, [object]$Data)
    if (-not (Test-Path $snapshotDir)) { New-Item -ItemType Directory -Path $snapshotDir -Force | Out-Null }
    $path = Join-Path $snapshotDir "AppRiver_${Tenant}_${AppId}_before.json"
    $Data | ConvertTo-Json -Depth 10 | Out-File $path -Encoding utf8
    Write-Verbose "[Snapshot] Saved $path"
}

# ── Banner ───────────────────────────────────────────────────────────────────

$mode = if ($isWhatIf) { 'DRY RUN (WhatIf)' } else { 'LIVE EXECUTION' }
$action = if ($Delete) { 'DELETE' } else { 'DISABLE' }

Write-Host ''
Write-Host '  ╔══════════════════════════════════════════════════════════════╗' -ForegroundColor DarkRed
Write-Host '  ║         AppRiver Service Principal Removal                  ║' -ForegroundColor DarkRed
Write-Host '  ║         Post-Call Action Item #1                            ║' -ForegroundColor DarkRed
Write-Host "  ║         Mode: $($mode.PadRight(40))║" -ForegroundColor $(if ($isWhatIf) { 'Yellow' } else { 'Red' })
Write-Host "  ║         Action: $($action.PadRight(38))║" -ForegroundColor $(if ($Delete) { 'Red' } else { 'Yellow' })
Write-Host '  ╚══════════════════════════════════════════════════════════════╝' -ForegroundColor DarkRed
Write-Host ''
Write-Host "  Targets: $($TenantKeys -join ', ')" -ForegroundColor Cyan
Write-Host "  SPs:     $($AppRiverSPs.Count) AppRiver service principals" -ForegroundColor Cyan
Write-Host "  Source:  AppRiver tenant $AppRiverTenantId" -ForegroundColor DarkGray
Write-Host ''

# ── Confirmation ─────────────────────────────────────────────────────────────

if (-not $isWhatIf -and -not $Force) {
    Write-Host '  ⚠️  This will DISABLE AppRiver service principals in production.' -ForegroundColor Red
    Write-Host '     Megan confirmed migration is 100% complete (April 10 call).' -ForegroundColor DarkGray
    Write-Host ''
    $confirm = Read-Host '  Type YES to proceed'
    if ($confirm -ne 'YES') {
        Write-Host '  Aborted.' -ForegroundColor Yellow
        return
    }
    Write-Host ''
}

# ── Main Loop ────────────────────────────────────────────────────────────────

foreach ($tenantKey in $TenantKeys) {
    $tenantId = $config.Tenants[$tenantKey].TenantId
    Write-Host "  ── $tenantKey ($tenantId) ──" -ForegroundColor Cyan

    try {
        Connect-CTUTenant -TenantKey $tenantKey -ErrorAction Stop
    }
    catch {
        Write-Host "    ✗ Failed to connect to $tenantKey : $_" -ForegroundColor Red
        foreach ($sp in $AppRiverSPs) {
            Add-Result -Tenant $tenantKey -SPName $sp.Name -AppId $sp.AppId `
                       -Status 'ERROR' -Detail "Connection failed: $_"
        }
        continue
    }

    foreach ($sp in $AppRiverSPs) {
        Write-Host "    Checking: $($sp.Name) ($($sp.AppId))..." -NoNewline

        try {
            # Find the service principal by AppId
            $found = Get-MgServicePrincipal -Filter "appId eq '$($sp.AppId)'" -ErrorAction Stop

            if (-not $found) {
                Write-Host ' NOT FOUND (already removed or never existed)' -ForegroundColor DarkGray
                Add-Result -Tenant $tenantKey -SPName $sp.Name -AppId $sp.AppId `
                           -Status 'NOT_FOUND' -Detail 'Service principal not found in this tenant'
                continue
            }

            $spId = $found.Id
            $isEnabled = $found.AccountEnabled

            # Save pre-change snapshot
            Save-Snapshot -Tenant $tenantKey -AppId $sp.AppId -Data @{
                Id             = $spId
                AppId          = $sp.AppId
                DisplayName    = $found.DisplayName
                AccountEnabled = $isEnabled
                AppOwnerOrganizationId = $found.AppOwnerOrganizationId
                CreatedDateTime = $found.AdditionalProperties.createdDateTime
                Permissions    = (Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $spId -ErrorAction SilentlyContinue |
                                  Select-Object ResourceDisplayName, AppRoleId)
            }

            if (-not $isEnabled) {
                Write-Host ' ALREADY DISABLED ✓' -ForegroundColor Green
                Add-Result -Tenant $tenantKey -SPName $sp.Name -AppId $sp.AppId `
                           -Status 'ALREADY_DISABLED' -Detail "SP $spId already disabled"
                continue
            }

            if ($isWhatIf) {
                Write-Host ' WOULD DISABLE' -ForegroundColor Yellow
                Add-Result -Tenant $tenantKey -SPName $sp.Name -AppId $sp.AppId `
                           -Status 'FOUND_WOULD_DISABLE' -Detail "SP $spId is enabled — would set AccountEnabled=false"
            }
            else {
                if ($Delete) {
                    Remove-MgServicePrincipal -ServicePrincipalId $spId -ErrorAction Stop
                    Write-Host ' DELETED ✗' -ForegroundColor Red
                    Add-Result -Tenant $tenantKey -SPName $sp.Name -AppId $sp.AppId `
                               -Status 'DELETED' -Detail "SP $spId permanently removed"
                }
                else {
                    Update-MgServicePrincipal -ServicePrincipalId $spId `
                        -BodyParameter @{ accountEnabled = $false } -ErrorAction Stop
                    Write-Host ' DISABLED ✓' -ForegroundColor Green
                    Add-Result -Tenant $tenantKey -SPName $sp.Name -AppId $sp.AppId `
                               -Status 'DISABLED' -Detail "SP $spId set AccountEnabled=false"
                }
            }
        }
        catch {
            Write-Host " ERROR: $_" -ForegroundColor Red
            Add-Result -Tenant $tenantKey -SPName $sp.Name -AppId $sp.AppId `
                       -Status 'ERROR' -Detail "$_"
        }
    }

    Write-Host ''
}

# ── Report ───────────────────────────────────────────────────────────────────

$reportPath = Join-Path $reportsDir "appriver-disable_${runStamp}.json"
$report = @{
    RunTimestamp = $runStamp
    Mode        = if ($isWhatIf) { 'WhatIf' } else { 'Execute' }
    Action      = if ($Delete) { 'Delete' } else { 'Disable' }
    Tenants     = $TenantKeys
    Results     = $results
    Summary     = @{
        Total           = $results.Count
        WouldDisable    = ($results | Where-Object Status -eq 'FOUND_WOULD_DISABLE').Count
        Disabled        = ($results | Where-Object Status -eq 'DISABLED').Count
        Deleted         = ($results | Where-Object Status -eq 'DELETED').Count
        AlreadyDisabled = ($results | Where-Object Status -eq 'ALREADY_DISABLED').Count
        NotFound        = ($results | Where-Object Status -eq 'NOT_FOUND').Count
        Errors          = ($results | Where-Object Status -eq 'ERROR').Count
    }
}

$report | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding utf8

# ── Summary Table ────────────────────────────────────────────────────────────

Write-Host '  ── Summary ──' -ForegroundColor Cyan
Write-Host ''
$results | Format-Table TenantKey, SPName, Status, Detail -AutoSize
Write-Host ''
Write-Host "  Report saved: $reportPath" -ForegroundColor DarkGray

if ($isWhatIf) {
    Write-Host ''
    Write-Host '  ℹ️  This was a DRY RUN. No changes were made.' -ForegroundColor Yellow
    Write-Host '     To execute: ./Disable-AppRiverSPs.ps1 -Execute' -ForegroundColor Yellow
    Write-Host ''
}
else {
    Write-Host ''
    Write-Host '  ✅ AppRiver service principals disabled.' -ForegroundColor Green
    Write-Host '     To re-enable if needed:' -ForegroundColor DarkGray
    Write-Host '     Update-MgServicePrincipal -ServicePrincipalId <id> -BodyParameter @{accountEnabled=$true}' -ForegroundColor DarkGray
    Write-Host ''
}
