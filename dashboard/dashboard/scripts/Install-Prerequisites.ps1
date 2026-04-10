<#
.SYNOPSIS
    Install-Prerequisites.ps1 - Installs all required PowerShell modules for the
    HTT Brands Cross-Tenant Audit Utility.
.DESCRIPTION
    Installs Microsoft.Graph sub-modules (v2.x), MicrosoftTeams module,
    and validates PowerShell version compatibility.
.NOTES
    Run this script ONCE before first audit. Requires internet access and
    admin elevation for AllUsers scope (or use CurrentUser).
#>

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('CurrentUser', 'AllUsers')]
    [string]$Scope = 'CurrentUser',

    [Parameter()]
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "  HTT Brands Cross-Tenant Audit Utility"      -ForegroundColor Cyan
Write-Host "  Prerequisite Installation"                    -ForegroundColor Cyan
Write-Host "=============================================`n" -ForegroundColor Cyan

# --- PowerShell version check ---
$psVersion = $PSVersionTable.PSVersion
Write-Host "[1/4] PowerShell version: $psVersion" -ForegroundColor White
if ($psVersion.Major -lt 7) {
    Write-Warning "PowerShell 7+ is recommended. You're running $psVersion."
    Write-Warning "Install from: https://aka.ms/powershell-release?tag=stable"
    Write-Warning "Continuing with current version..."
}

# --- Microsoft.Graph SDK sub-modules ---
Write-Host "`n[2/4] Installing Microsoft Graph PowerShell SDK modules..." -ForegroundColor White

$graphModules = @(
    'Microsoft.Graph.Authentication',
    'Microsoft.Graph.Identity.SignIns',
    'Microsoft.Graph.Identity.Governance',
    'Microsoft.Graph.Identity.DirectoryManagement',
    'Microsoft.Graph.Users',
    'Microsoft.Graph.Applications',
    'Microsoft.Graph.Reports'
)

$betaModules = @(
    'Microsoft.Graph.Beta.Identity.SignIns'
)

foreach ($module in ($graphModules + $betaModules)) {
    $installed = Get-Module -ListAvailable -Name $module | Sort-Object Version -Descending | Select-Object -First 1

    if ($installed -and -not $Force) {
        Write-Host "  [OK] $module v$($installed.Version) already installed" -ForegroundColor Green
    }
    else {
        Write-Host "  [..] Installing $module..." -ForegroundColor Yellow
        try {
            Install-Module -Name $module -Scope $Scope -AllowClobber -Force -ErrorAction Stop
            Write-Host "  [OK] $module installed" -ForegroundColor Green
        }
        catch {
            Write-Warning "  [!!] Failed to install $module : $_"
        }
    }
}

# --- MicrosoftTeams module ---
Write-Host "`n[3/4] Installing MicrosoftTeams module..." -ForegroundColor White

$teamsInstalled = Get-Module -ListAvailable -Name MicrosoftTeams | Sort-Object Version -Descending | Select-Object -First 1
if ($teamsInstalled -and -not $Force) {
    Write-Host "  [OK] MicrosoftTeams v$($teamsInstalled.Version) already installed" -ForegroundColor Green
}
else {
    Write-Host "  [..] Installing MicrosoftTeams..." -ForegroundColor Yellow
    try {
        Install-Module -Name MicrosoftTeams -Scope $Scope -AllowClobber -Force -ErrorAction Stop
        Write-Host "  [OK] MicrosoftTeams installed" -ForegroundColor Green
    }
    catch {
        Write-Warning "  [!!] Failed to install MicrosoftTeams: $_"
    }
}

# --- Verify all modules load ---
Write-Host "`n[4/4] Verifying module imports..." -ForegroundColor White

$allModules = $graphModules + $betaModules + @('MicrosoftTeams')
$loadErrors = @()

foreach ($module in $allModules) {
    try {
        Import-Module $module -ErrorAction Stop
        Write-Host "  [OK] $module loads successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "  [!!] $module failed to load: $_" -ForegroundColor Red
        $loadErrors += $module
    }
}

# --- Summary ---
Write-Host "`n=============================================" -ForegroundColor Cyan
if ($loadErrors.Count -eq 0) {
    Write-Host "  All prerequisites installed successfully!" -ForegroundColor Green
    Write-Host "  You can now run Invoke-FullAudit.ps1" -ForegroundColor Green
}
else {
    Write-Host "  Installation completed with $($loadErrors.Count) errors:" -ForegroundColor Yellow
    $loadErrors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
    Write-Host "  Try: Install-Module $($loadErrors[0]) -Force" -ForegroundColor Yellow
}
Write-Host "=============================================`n" -ForegroundColor Cyan
