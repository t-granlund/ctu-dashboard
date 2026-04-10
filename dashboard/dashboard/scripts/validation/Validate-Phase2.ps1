<#
.SYNOPSIS
    Validates that all 6 Phase 2 quick-win remediations took effect across
    HTT Brands tenants.

.DESCRIPTION
    Runs AFTER Invoke-Phase2QuickWins.ps1 -Execute completes. Queries the
    actual state of each tenant and compares to Phase 2 targets, producing a
    pass/fail validation report.

    This script is READ-ONLY — it only queries, never modifies.

    Checks performed:
      QW1  Guest invitation restriction        (all 5 tenants)
      QW2  Guest role hardened                 (HTT, TLL, DCE)
      QW3  Email-verified join disabled        (all 5 tenants)
      QW4  Teams consumer access disabled      (all 5 tenants)
      QW5  Teams trial tenant federation off   (all 5 tenants)
      QW6  MFA CA policy — report-only         (FN, TLL, DCE)

.PARAMETER TenantKeys
    Optional filter — limits validation to specific tenants.
    Defaults to all 5 (HTT, BCC, FN, TLL, DCE).

.PARAMETER OutputDir
    Directory for the JSON validation report.
    Defaults to ../../reports relative to this script.

.EXAMPLE
    .\Validate-Phase2.ps1
    # Validate all quick wins across all tenants.

.EXAMPLE
    .\Validate-Phase2.ps1 -TenantKeys HTT,TLL
    # Validate only HTT and TLL tenants.

.NOTES
    Author  : Tyler Granlund / CTU Automation
    Version : 1.0.0
    Requires: Microsoft.Graph PowerShell SDK, MicrosoftTeams module
#>
[CmdletBinding()]
param(
    [ValidateSet('HTT','BCC','FN','TLL','DCE')]
    [string[]]$TenantKeys,

    [string]$OutputDir = (Join-Path $PSScriptRoot ".." ".." "reports")
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

# ── Configuration ────────────────────────────────────────────────────────────

$config = Get-CTUConfig
$AllKeys = @('HTT','BCC','FN','TLL','DCE')
$selectedKeys = if ($TenantKeys) { $TenantKeys } else { $AllKeys }

if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }

# Tenant display names for pretty output
$TenantDisplayNames = @{
    HTT = 'Head to Toe Brands (HTT)'
    BCC = 'Bishops Cuts/Color (BCC)'
    FN  = 'Frenchies Modern Nail Care (FN)'
    TLL = 'The Lash Lounge (TLL)'
    DCE = 'Delta Crown Extensions (DCE)'
}

# ── Quick-Win Target Definitions ─────────────────────────────────────────────

$RestrictedGuestRoleId = '2af84b1e-32c8-444d-8dfa-801d234f85e3'
$MfaPolicyName         = 'CTU — Require MFA for External Users [Report-Only]'

# Tenants where each QW applies
$QW2Tenants = @('HTT','TLL','DCE')   # BCC + FN already compliant
$QW6Tenants = @('FN','TLL','DCE')    # HTT + BCC already have MFA CA

# ── Results Accumulator ──────────────────────────────────────────────────────

$results = [System.Collections.ArrayList]::new()

function Add-ValidationResult {
    param(
        [string]$Tenant,
        [string]$QuickWin,
        [string]$Control,
        [string]$Expected,
        [string]$Actual,
        [ValidateSet('PASS','FAIL','SKIP','ERROR')]
        [string]$Status
    )
    $null = $script:results.Add([PSCustomObject]@{
        tenant   = $Tenant
        quickWin = $QuickWin
        control  = $Control
        expected = $Expected
        actual   = $Actual
        status   = $Status
    })
}

# ── Validation: QW1-3 (Authorization Policy — single Graph GET) ─────────────

function Test-AuthorizationPolicy {
    param([string]$Key)

    try {
        Connect-CTUTenant -TenantKey $Key -Config $script:config | Out-Null
        $policy = Invoke-CTUGraphRequest -Uri 'https://graph.microsoft.com/v1.0/policies/authorizationPolicy'

        # QW1: Guest invitation restriction (all tenants)
        $actual1 = $policy.allowInvitesFrom
        $expected1 = 'adminsAndGuestInviters'
        if ($actual1 -eq $expected1) {
            Write-Host "  ✅ QW1: allowInvitesFrom = $expected1" -ForegroundColor Green
            Add-ValidationResult $Key 'QW1' 'allowInvitesFrom' $expected1 "$actual1" 'PASS'
        } else {
            Write-Host "  ❌ QW1: allowInvitesFrom = $actual1 (expected: $expected1)" -ForegroundColor Red
            Add-ValidationResult $Key 'QW1' 'allowInvitesFrom' $expected1 "$actual1" 'FAIL'
        }

        # QW2: Guest role hardened (HTT, TLL, DCE only)
        if ($Key -in $script:QW2Tenants) {
            $actual2 = $policy.guestUserRoleId
            $expected2 = $script:RestrictedGuestRoleId
            if ($actual2 -eq $expected2) {
                Write-Host "  ✅ QW2: guestUserRoleId = $($expected2.Substring(0,12))... (Restricted Guest User)" -ForegroundColor Green
                Add-ValidationResult $Key 'QW2' 'guestUserRoleId' $expected2 "$actual2" 'PASS'
            } else {
                Write-Host "  ❌ QW2: guestUserRoleId = $actual2 (expected: $expected2)" -ForegroundColor Red
                Add-ValidationResult $Key 'QW2' 'guestUserRoleId' $expected2 "$actual2" 'FAIL'
            }
        } else {
            Write-Host "  ⏭️  QW2: guestUserRoleId — not applicable ($Key already compliant)" -ForegroundColor DarkGray
            Add-ValidationResult $Key 'QW2' 'guestUserRoleId' 'N/A' 'N/A' 'SKIP'
        }

        # QW3: Email-verified join disabled (all tenants)
        $actual3 = $policy.allowEmailVerifiedUsersToJoinOrganization
        $expected3 = $false
        if ("$actual3" -eq "$expected3") {
            Write-Host "  ✅ QW3: allowEmailVerifiedUsersToJoinOrganization = False" -ForegroundColor Green
            Add-ValidationResult $Key 'QW3' 'allowEmailVerifiedUsersToJoinOrganization' 'False' "$actual3" 'PASS'
        } else {
            Write-Host "  ❌ QW3: allowEmailVerifiedUsersToJoinOrganization = $actual3 (expected: False)" -ForegroundColor Red
            Add-ValidationResult $Key 'QW3' 'allowEmailVerifiedUsersToJoinOrganization' 'False' "$actual3" 'FAIL'
        }
    }
    catch {
        Write-Host "  ❌ QW1-3: Authorization policy check failed: $_" -ForegroundColor Red
        # Record errors for whichever checks didn't complete
        $checked = ($script:results | Where-Object { $_.tenant -eq $Key -and $_.quickWin -in @('QW1','QW2','QW3') }).quickWin
        foreach ($qw in @('QW1','QW2','QW3')) {
            if ($qw -notin $checked) {
                $control = switch ($qw) {
                    'QW1' { 'allowInvitesFrom' }
                    'QW2' { 'guestUserRoleId' }
                    'QW3' { 'allowEmailVerifiedUsersToJoinOrganization' }
                }
                Add-ValidationResult $Key $qw $control 'N/A' "ERROR: $_" 'ERROR'
            }
        }
    }
    finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }
}

# ── Validation: QW4-5 (Teams Federation — single cmdlet) ────────────────────

function Test-TeamsFederation {
    param([string]$Key)

    try {
        Connect-CTUTeams -TenantKey $Key -Config $script:config

        $fed = Get-CsTenantFederationConfiguration |
            Select-Object AllowTeamsConsumer, AllowTeamsConsumerInbound, ExternalAccessWithTrialTenants

        # QW4: Teams consumer access disabled
        $consumer         = $fed.AllowTeamsConsumer
        $consumerInbound  = $fed.AllowTeamsConsumerInbound
        $qw4Pass = ($consumer -eq $false) -and ($consumerInbound -eq $false)

        if ($qw4Pass) {
            Write-Host "  ✅ QW4: AllowTeamsConsumer = False, AllowTeamsConsumerInbound = False" -ForegroundColor Green
            Add-ValidationResult $Key 'QW4' 'AllowTeamsConsumer+Inbound' 'False,False' "$consumer,$consumerInbound" 'PASS'
        } else {
            Write-Host "  ❌ QW4: AllowTeamsConsumer = $consumer, AllowTeamsConsumerInbound = $consumerInbound (expected: False, False)" -ForegroundColor Red
            Add-ValidationResult $Key 'QW4' 'AllowTeamsConsumer+Inbound' 'False,False' "$consumer,$consumerInbound" 'FAIL'
        }

        # QW5: Teams trial tenant federation disabled
        $trialAccess = $fed.ExternalAccessWithTrialTenants
        if ("$trialAccess" -eq 'Blocked') {
            Write-Host "  ✅ QW5: ExternalAccessWithTrialTenants = Blocked" -ForegroundColor Green
            Add-ValidationResult $Key 'QW5' 'ExternalAccessWithTrialTenants' 'Blocked' "$trialAccess" 'PASS'
        } else {
            Write-Host "  ❌ QW5: ExternalAccessWithTrialTenants = $trialAccess (expected: Blocked)" -ForegroundColor Red
            Add-ValidationResult $Key 'QW5' 'ExternalAccessWithTrialTenants' 'Blocked' "$trialAccess" 'FAIL'
        }
    }
    catch {
        Write-Host "  ❌ QW4-5: Teams federation check failed: $_" -ForegroundColor Red
        $checked = ($script:results | Where-Object { $_.tenant -eq $Key -and $_.quickWin -in @('QW4','QW5') }).quickWin
        foreach ($qw in @('QW4','QW5')) {
            if ($qw -notin $checked) {
                $control = switch ($qw) {
                    'QW4' { 'AllowTeamsConsumer+Inbound' }
                    'QW5' { 'ExternalAccessWithTrialTenants' }
                }
                Add-ValidationResult $Key $qw $control 'N/A' "ERROR: $_" 'ERROR'
            }
        }
    }
    finally {
        try { Disconnect-MicrosoftTeams -ErrorAction SilentlyContinue } catch {}
    }
}

# ── Validation: QW6 (MFA CA Policy — Graph GET) ─────────────────────────────

function Test-MfaCaPolicy {
    param([string]$Key)

    if ($Key -notin $script:QW6Tenants) {
        Write-Host "  ⏭️  QW6: MFA CA policy — not applicable ($Key already has MFA CA)" -ForegroundColor DarkGray
        Add-ValidationResult $Key 'QW6' 'MFA CA policy' 'N/A' 'N/A' 'SKIP'
        return
    }

    try {
        Connect-CTUTenant -TenantKey $Key -Config $script:config | Out-Null

        $policies = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies' -AllPages

        $match = $policies | Where-Object { $_.displayName -eq $script:MfaPolicyName }

        if ($match -and $match.state -eq 'enabledForReportingButNotEnforced') {
            Write-Host "  ✅ QW6: MFA CA policy exists (state: enabledForReportingButNotEnforced)" -ForegroundColor Green
            Add-ValidationResult $Key 'QW6' 'MFA CA policy' 'enabledForReportingButNotEnforced' "$($match.state)" 'PASS'
        } elseif ($match) {
            Write-Host "  ❌ QW6: MFA CA policy exists but state = $($match.state) (expected: enabledForReportingButNotEnforced)" -ForegroundColor Red
            Add-ValidationResult $Key 'QW6' 'MFA CA policy' 'enabledForReportingButNotEnforced' "$($match.state)" 'FAIL'
        } else {
            Write-Host "  ❌ QW6: MFA CA policy not found (expected: '$($script:MfaPolicyName)')" -ForegroundColor Red
            Add-ValidationResult $Key 'QW6' 'MFA CA policy' 'enabledForReportingButNotEnforced' 'NOT FOUND' 'FAIL'
        }
    }
    catch {
        Write-Host "  ❌ QW6: MFA CA policy check failed: $_" -ForegroundColor Red
        Add-ValidationResult $Key 'QW6' 'MFA CA policy' 'N/A' "ERROR: $_" 'ERROR'
    }
    finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }
}

# ══════════════════════════════════════════════════════════════════════════════
#  Banner
# ══════════════════════════════════════════════════════════════════════════════

$tenantListStr = ($selectedKeys -join ', ')

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Phase 2 Post-Remediation Validation                 ║
  ║   Tenants : $($tenantListStr.PadRight(57))║
  ║   Mode    : READ-ONLY (query only, no changes)                     ║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# ══════════════════════════════════════════════════════════════════════════════
#  Main Orchestration
# ══════════════════════════════════════════════════════════════════════════════

foreach ($key in $selectedKeys) {
    $displayName = $TenantDisplayNames[$key]
    Write-Host "`n== $displayName ==" -ForegroundColor Yellow

    # QW1-3: Authorization policy (single Graph call)
    Test-AuthorizationPolicy -Key $key

    # QW4-5: Teams federation (single cmdlet call)
    Test-TeamsFederation -Key $key

    # QW6: MFA CA policy
    Test-MfaCaPolicy -Key $key
}

# ══════════════════════════════════════════════════════════════════════════════
#  Console Summary
# ══════════════════════════════════════════════════════════════════════════════

$passed  = ($results | Where-Object { $_.status -eq 'PASS'  }).Count
$failed  = ($results | Where-Object { $_.status -eq 'FAIL'  }).Count
$skipped = ($results | Where-Object { $_.status -eq 'SKIP'  }).Count
$errored = ($results | Where-Object { $_.status -eq 'ERROR' }).Count
$total   = $results.Count

Write-Host "`n== VALIDATION SUMMARY ==" -ForegroundColor White

if ($passed -gt 0) {
    Write-Host "  ✅ $passed of $total controls PASSED" -ForegroundColor Green
}
if ($failed -gt 0) {
    Write-Host "  ❌ $failed controls FAILED — review required" -ForegroundColor Red
}
if ($skipped -gt 0) {
    Write-Host "  ⏭️  $skipped controls SKIPPED (not applicable)" -ForegroundColor DarkGray
}
if ($errored -gt 0) {
    Write-Host "  ⚠️  $errored controls ERROR — could not verify" -ForegroundColor Yellow
}

Write-Host ""

# ══════════════════════════════════════════════════════════════════════════════
#  JSON Report
# ══════════════════════════════════════════════════════════════════════════════

$report = [ordered]@{
    _metadata = [ordered]@{
        generatedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
        script      = 'Validate-Phase2.ps1'
    }
    summary   = [ordered]@{
        passed  = $passed
        failed  = $failed
        skipped = $skipped
        total   = $total
    }
    results   = @($results)
}

$reportPath = Join-Path $OutputDir "phase-2-validation.json"
$report | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding utf8
Write-Host "  Report saved: $reportPath" -ForegroundColor Green
Write-Host ""
