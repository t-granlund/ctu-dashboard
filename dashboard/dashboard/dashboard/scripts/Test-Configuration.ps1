<#
.SYNOPSIS
    Test-Configuration.ps1 - Validates the Cross-Tenant Utility configuration
    without connecting to any Microsoft Entra ID tenant.
.DESCRIPTION
    Performs dry-run validation:
      - All CTU modules can be imported
      - Config files are valid JSON with expected structure
      - Tenant list resolves correctly
      - All expected functions are exported
      - Baseline and permissions configs are valid
    
    Safe to run anywhere - makes NO network connections.
.EXAMPLE
    .\Test-Configuration.ps1
    
    Returns exit code 0 if all checks pass, 1 if any fail.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$script:Passed = 0
$script:Failed = 0

function Write-TestResult {
    param([string]$Name, [bool]$Passed, [string]$Message = "")
    if ($Passed) {
        Write-Host "[PASS] $Name" -ForegroundColor Green
        $script:Passed++
    }
    else {
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        if ($Message) { Write-Host "       $Message" -ForegroundColor DarkRed }
        $script:Failed++
    }
}

$RepoRoot = Split-Path $PSScriptRoot -Parent
$ModulesPath = Join-Path $RepoRoot "modules"
$ConfigPath = Join-Path $RepoRoot "config"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CTU Configuration Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test 1: All modules exist
Write-Host "`n[1] Module Files Exist" -ForegroundColor White
$RequiredModules = @(
    "CTU.Core\CTU.Core.psm1",
    "CTU.CrossTenantSync\CTU.CrossTenantSync.psm1",
    "CTU.B2BCollaboration\CTU.B2BCollaboration.psm1",
    "CTU.B2BDirectConnect\CTU.B2BDirectConnect.psm1",
    "CTU.GuestInventory\CTU.GuestInventory.psm1",
    "CTU.ConditionalAccess\CTU.ConditionalAccess.psm1",
    "CTU.TeamsFederation\CTU.TeamsFederation.psm1",
    "CTU.IdentityGovernance\CTU.IdentityGovernance.psm1"
)

foreach ($mod in $RequiredModules) {
    $modFullPath = Join-Path $ModulesPath $mod
    Write-TestResult -Name "$mod exists" -Passed (Test-Path $modFullPath)
}

# Test 2: All modules can be imported
Write-Host "`n[2] Module Import Tests" -ForegroundColor White
foreach ($mod in $RequiredModules) {
    $modFullPath = Join-Path $ModulesPath $mod
    $modName = [System.IO.Path]::GetFileNameWithoutExtension($mod)
    try {
        if (Test-Path $modFullPath) {
            Import-Module $modFullPath -Force -ErrorAction Stop
            Write-TestResult -Name "$modName imports cleanly" -Passed $true
            Remove-Module $modName -Force -ErrorAction SilentlyContinue
        }
        else {
            Write-TestResult -Name "$modName imports cleanly" -Passed $false -Message "File not found"
        }
    }
    catch {
        Write-TestResult -Name "$modName imports cleanly" -Passed $false -Message $_.Exception.Message
    }
}

# Test 3: Config files
Write-Host "`n[3] Config File Tests" -ForegroundColor White
$ConfigFiles = @("tenants.json", "baseline.json", "permissions.json")
foreach ($file in $ConfigFiles) {
    $filePath = Join-Path $ConfigPath $file
    $exists = Test-Path $filePath
    if ($exists) {
        try {
            $content = Get-Content $filePath -Raw
            $parsed = $content | ConvertFrom-Json -ErrorAction Stop
            Write-TestResult -Name "$file is valid JSON" -Passed $true
        }
        catch {
            Write-TestResult -Name "$file is valid JSON" -Passed $false -Message $_.Exception.Message
        }
    }
    else {
        Write-TestResult -Name "$file exists" -Passed $false
    }
}

# Test 4: CTU.Core functionality
Write-Host "`n[4] CTU.Core Functionality" -ForegroundColor White
try {
    Import-Module (Join-Path $ModulesPath "CTU.Core" "CTU.Core.psm1") -Force -ErrorAction Stop
    
    # Test Get-CTUConfig
    $config = Get-CTUConfig
    Write-TestResult -Name "Get-CTUConfig returns config" -Passed ($null -ne $config)
    
    # Test expected properties
    Write-TestResult -Name "Config has .organization" -Passed ($null -ne $config.organization)
    Write-TestResult -Name "Config has .hub" -Passed ($null -ne $config.hub)
    Write-TestResult -Name "Config has .spokes" -Passed ($config.spokes.Count -eq 4)
    Write-TestResult -Name "Config has .auditSettings" -Passed ($null -ne $config.auditSettings)
    Write-TestResult -Name "Config has .domainAllowlist" -Passed ($config.domainAllowlist.Count -eq 5)
    Write-TestResult -Name "Config has .trustedDomains alias" -Passed ($config.trustedDomains.Count -eq 5)
    
    # Test Get-CTUTenantList
    $allTenants = Get-CTUTenantList
    Write-TestResult -Name "Get-CTUTenantList returns 5 tenants" -Passed ($allTenants.Count -eq 5)
    
    $hub = Get-CTUTenantList -Role hub
    Write-TestResult -Name "Get-CTUTenantList -Role hub returns 1" -Passed ($hub.Count -eq 1)
    
    $spokes = Get-CTUTenantList -Role spoke
    Write-TestResult -Name "Get-CTUTenantList -Role spoke returns 4" -Passed ($spokes.Count -eq 4)
    
    $single = Get-CTUTenantList -TenantKey "BCC"
    Write-TestResult -Name "Get-CTUTenantList -TenantKey BCC works" -Passed ($single.Key -eq "BCC")
    
    # Test Get-CTUBaseline
    $baseline = Get-CTUBaseline
    Write-TestResult -Name "Get-CTUBaseline loads baseline.json" -Passed ($null -ne $baseline)
    
    Remove-Module CTU.Core -Force -ErrorAction SilentlyContinue
}
catch {
    Write-TestResult -Name "CTU.Core module tests" -Passed $false -Message $_.Exception.Message
}

# Test 5: Export functions check
Write-Host "`n[5] Exported Function Tests" -ForegroundColor White
try {
    Import-Module (Join-Path $ModulesPath "CTU.Core" "CTU.Core.psm1") -Force -ErrorAction Stop
    
    $ExpectedFunctions = @(
        'Get-CTUConfig', 'Get-CTUTenantList', 'Get-CTUBaseline',
        'Connect-CTUTenant', 'Connect-CTUTeams', 'Connect-CTUAllTenants',
        'Invoke-CTUGraphRequest', 'New-CTUAuditReport', 'Add-CTUFinding',
        'Export-CTUReport', 'Save-CTUTenantData',
        'Write-CTUSection', 'Write-CTUFinding', 'New-CTUReportPath'
    )
    
    $Exported = (Get-Module CTU.Core).ExportedFunctions.Keys
    
    foreach ($func in $ExpectedFunctions) {
        Write-TestResult -Name "$func exported" -Passed ($func -in $Exported)
    }
    
    Remove-Module CTU.Core -Force -ErrorAction SilentlyContinue
}
catch {
    Write-TestResult -Name "Exported function tests" -Passed $false -Message $_.Exception.Message
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Results: $script:Passed passed, $script:Failed failed" -ForegroundColor $(if ($script:Failed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================" -ForegroundColor Cyan

exit $script:Failed
