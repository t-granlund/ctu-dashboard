<#
.SYNOPSIS
    Orchestrates all 6 Phase 2 "quick-win" security remediations across
    HTT Brands tenants.

.DESCRIPTION
    Queries current state, compares against the HTT Brands security baseline,
    and optionally remediates 6 quick-win items identified in the Phase 1 audit:

      QW1  Guest invitation restriction        (all 5 tenants)
      QW2  Guest role hardening                (HTT, TLL, DCE)
      QW3  Email-verified join disabled        (all 5 tenants)
      QW4  Teams consumer access disabled      (all 5 tenants)
      QW5  Teams trial tenant federation off   (all 5 tenants)
      QW6  MFA CA policy — report-only         (FN, TLL, DCE)

    By default the script runs in WhatIf mode — it queries current state and
    reports what WOULD change, without touching anything.  Pass -Execute to
    apply live mutations.

.PARAMETER Execute
    Opt-in switch to apply live changes.  Without this flag the script only
    reports what would change (dry-run / WhatIf behaviour).

.PARAMETER QuickWins
    Which quick wins to run.  Accepts one or more of 1-6, or 'all' (default).

.PARAMETER TenantKeys
    Optional filter to limit execution to specific tenants.

.PARAMETER Force
    Skip the interactive confirmation prompt when -Execute is specified.

.EXAMPLE
    .\Invoke-Phase2QuickWins.ps1
    # Dry run — audits all 6 quick wins, shows what would change.

.EXAMPLE
    .\Invoke-Phase2QuickWins.ps1 -QuickWins 1,2,3 -TenantKeys HTT,TLL
    # Dry run for QW1-3, limited to HTT and TLL.

.EXAMPLE
    .\Invoke-Phase2QuickWins.ps1 -Execute -Force
    # Apply ALL 6 quick wins across every target tenant, no confirmation.

.NOTES
    Author  : Tyler Granlund / CTU Automation
    Version : 1.0.0
    Requires: Microsoft.Graph PowerShell SDK, MicrosoftTeams module
    Baseline: config/baseline.json (authorizationPolicy, teamsFederation)
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [switch]$Execute,

    [ValidateSet(1, 2, 3, 4, 5, 6, 'all')]
    [string[]]$QuickWins = @('all'),

    [ValidateSet('HTT', 'BCC', 'FN', 'TLL', 'DCE')]
    [string[]]$TenantKeys,

    [switch]$Force
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

# ── Configuration & State ────────────────────────────────────────────────────

$config     = Get-CTUConfig
$isWhatIf   = -not $Execute -or $WhatIfPreference
$runStamp   = Get-Date -Format "yyyy-MM-dd_HHmmss"
$reportsDir = Join-Path $PSScriptRoot ".." ".." "reports"
if (-not (Test-Path $reportsDir)) { New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null }

$AllKeys               = @('HTT', 'BCC', 'FN', 'TLL', 'DCE')
$RestrictedGuestRoleId = '2af84b1e-32c8-444d-8dfa-801d234f85e3'
$MfaPolicyName         = 'CTU — Require MFA for External Users [Report-Only]'

# ── Quick-Win Definitions ────────────────────────────────────────────────────

$QWDefs = @(
    @{ Id = 1; Name = 'Guest invitation restriction';      Tenants = $AllKeys;             Type = 'Graph' }
    @{ Id = 2; Name = 'Guest role hardening';               Tenants = @('HTT','TLL','DCE'); Type = 'Graph' }
    @{ Id = 3; Name = 'Email-verified join disabled';       Tenants = $AllKeys;             Type = 'Graph' }
    @{ Id = 4; Name = 'Teams consumer access disabled';     Tenants = $AllKeys;             Type = 'Teams' }
    @{ Id = 5; Name = 'Teams trial federation disabled';    Tenants = $AllKeys;             Type = 'Teams' }
    @{ Id = 6; Name = 'MFA CA policy (report-only)';        Tenants = @('FN','TLL','DCE');  Type = 'Graph' }
)

$selectedIds = if ($QuickWins -contains 'all') { 1..6 } else { $QuickWins | ForEach-Object { [int]$_ } }
$selectedQWs = $QWDefs | Where-Object { $_.Id -in $selectedIds }

# ── Results Accumulator ──────────────────────────────────────────────────────

$results = [System.Collections.ArrayList]::new()

function Add-QWResult {
    param(
        [int]$QWId, [string]$QWName, [string]$Tenant,
        [string]$Status,          # NO_CHANGE | WOULD_CHANGE | CHANGED | ERROR
        [string]$CurrentValue, [string]$TargetValue, [string]$Detail
    )
    $null = $script:results.Add([PSCustomObject]@{
        QuickWin     = "QW$QWId"
        Name         = $QWName
        TenantKey    = $Tenant
        Status       = $Status
        CurrentValue = $CurrentValue
        TargetValue  = $TargetValue
        Detail       = $Detail
        Timestamp    = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    })
}

# ── Helper: Pre-change Snapshot ──────────────────────────────────────────────

function Save-PreChangeSnapshot {
    param([int]$QWId, [string]$Tenant, [object]$Data)
    $dir = Join-Path $script:reportsDir "snapshots" $script:runStamp
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $path = Join-Path $dir "QW${QWId}_${Tenant}_before.json"
    $Data | ConvertTo-Json -Depth 10 | Out-File $path -Encoding utf8
    Write-Verbose "[Snapshot] Saved $path"
}

# ══════════════════════════════════════════════════════════════════════════════
#  QW1-3: Authorization-policy single-property patch
# ══════════════════════════════════════════════════════════════════════════════

function Invoke-AuthPolicyRemediation {
    param(
        [int]$QWId, [string]$QWName, [string]$Tenant,
        [string]$Property, [object]$Target
    )
    try {
        Connect-CTUTenant -TenantKey $Tenant -Config $script:config | Out-Null

        $policy  = Invoke-CTUGraphRequest -Uri 'https://graph.microsoft.com/v1.0/policies/authorizationPolicy'
        $current = $policy.$Property

        if ("$current" -eq "$Target") {
            Write-CTUFinding -Severity 'OK' -Message "$Tenant | $Property = '$Target' (already compliant)"
            Add-QWResult $QWId $QWName $Tenant 'NO_CHANGE' "$current" "$Target" 'Already compliant'
            return
        }

        if ($script:isWhatIf) {
            Write-CTUFinding -Severity 'INFO' -Message "$Tenant | WOULD SET $Property : '$current' -> '$Target'"
            Add-QWResult $QWId $QWName $Tenant 'WOULD_CHANGE' "$current" "$Target" 'WhatIf — no change applied'
        }
        else {
            Save-PreChangeSnapshot -QWId $QWId -Tenant $Tenant -Data $policy
            Invoke-CTUGraphRequest -Uri 'https://graph.microsoft.com/v1.0/policies/authorizationPolicy' `
                                   -Method PATCH -Body @{ $Property = $Target }
            Write-CTUFinding -Severity 'OK' -Message "$Tenant | SET $Property : '$current' -> '$Target'"
            Add-QWResult $QWId $QWName $Tenant 'CHANGED' "$current" "$Target" 'Applied successfully'
        }
    }
    catch {
        Write-CTUFinding -Severity 'HIGH' -Message "$Tenant | QW$QWId failed: $_"
        Add-QWResult $QWId $QWName $Tenant 'ERROR' 'N/A' "$Target" "$_"
    }
    finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }
}

# ══════════════════════════════════════════════════════════════════════════════
#  QW4-5: Teams federation configuration
# ══════════════════════════════════════════════════════════════════════════════

function Invoke-TeamsFedRemediation {
    param(
        [int]$QWId, [string]$QWName, [string]$Tenant,
        [hashtable]$TargetSettings
    )
    try {
        Connect-CTUTeams -TenantKey $Tenant -Config $script:config

        $current = Get-CsTenantFederationConfiguration

        # Identify non-compliant settings
        $drift = [ordered]@{}
        foreach ($key in $TargetSettings.Keys) {
            if ("$($current.$key)" -ne "$($TargetSettings[$key])") {
                $drift[$key] = @{ From = "$($current.$key)"; To = "$($TargetSettings[$key])" }
            }
        }

        if ($drift.Count -eq 0) {
            $settingNames = ($TargetSettings.Keys -join ', ')
            Write-CTUFinding -Severity 'OK' -Message "$Tenant | $settingNames already compliant"
            Add-QWResult $QWId $QWName $Tenant 'NO_CHANGE' 'Compliant' 'Compliant' 'All settings at target'
            return
        }

        $fromDesc = ($drift.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value.From)" }) -join '; '
        $toDesc   = ($drift.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value.To)" })   -join '; '

        if ($script:isWhatIf) {
            Write-CTUFinding -Severity 'INFO' -Message "$Tenant | WOULD SET $fromDesc -> $toDesc"
            Add-QWResult $QWId $QWName $Tenant 'WOULD_CHANGE' $fromDesc $toDesc 'WhatIf — no change applied'
        }
        else {
            Save-PreChangeSnapshot -QWId $QWId -Tenant $Tenant `
                -Data ($current | Select-Object AllowTeamsConsumer, AllowTeamsConsumerInbound, ExternalAccessWithTrialTenants)
            Set-CsTenantFederationConfiguration @TargetSettings
            Write-CTUFinding -Severity 'OK' -Message "$Tenant | SET $fromDesc -> $toDesc"
            Add-QWResult $QWId $QWName $Tenant 'CHANGED' $fromDesc $toDesc 'Applied successfully'
        }
    }
    catch {
        Write-CTUFinding -Severity 'HIGH' -Message "$Tenant | QW$QWId failed: $_"
        Add-QWResult $QWId $QWName $Tenant 'ERROR' 'N/A' '' "$_"
    }
    finally {
        try { Disconnect-MicrosoftTeams -ErrorAction SilentlyContinue } catch {}
    }
}

# ══════════════════════════════════════════════════════════════════════════════
#  QW6: Conditional Access — MFA for external users (report-only)
# ══════════════════════════════════════════════════════════════════════════════

function Invoke-MfaCaRemediation {
    param([string]$Tenant)

    $qwId = 6; $qwName = 'MFA CA policy (report-only)'

    try {
        Connect-CTUTenant -TenantKey $Tenant -Config $script:config | Out-Null

        # Check whether the policy already exists
        $policies = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies' -AllPages
        $existing = $policies | Where-Object { $_.displayName -eq $script:MfaPolicyName }

        if ($existing) {
            Write-CTUFinding -Severity 'OK' -Message "$Tenant | CA policy already exists (state: $($existing.state))"
            Add-QWResult $qwId $qwName $Tenant 'NO_CHANGE' `
                "Exists ($($existing.state))" 'Exists' 'Policy already present'
            return
        }

        if ($script:isWhatIf) {
            Write-CTUFinding -Severity 'INFO' -Message "$Tenant | WOULD CREATE policy: $($script:MfaPolicyName)"
            Add-QWResult $qwId $qwName $Tenant 'WOULD_CHANGE' 'Not found' 'Create report-only' 'WhatIf — no change applied'
        }
        else {
            $body = @{
                displayName   = $script:MfaPolicyName
                state         = 'enabledForReportingButNotEnforced'
                conditions    = @{
                    users        = @{
                        includeGuestsOrExternalUsers = @{
                            guestOrExternalUserTypes = 'b2bCollaborationGuest,b2bCollaborationMember,b2bDirectConnectUser,otherExternalUser,internalGuest,serviceProvider'
                            externalTenants          = @{
                                '@odata.type'  = '#microsoft.graph.conditionalAccessAllExternalTenants'
                                membershipKind = 'all'
                            }
                        }
                    }
                    applications = @{ includeApplications = @('All') }
                }
                grantControls = @{
                    operator        = 'OR'
                    builtInControls = @('mfa')
                }
            }

            Invoke-CTUGraphRequest `
                -Uri 'https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies' `
                -Method POST -Body $body
            Write-CTUFinding -Severity 'OK' -Message "$Tenant | Created policy: $($script:MfaPolicyName)"
            Add-QWResult $qwId $qwName $Tenant 'CHANGED' 'Not found' 'Created' 'Report-only MFA policy created'
        }
    }
    catch {
        Write-CTUFinding -Severity 'HIGH' -Message "$Tenant | QW$qwId failed: $_"
        Add-QWResult $qwId $qwName $Tenant 'ERROR' 'N/A' '' "$_"
    }
    finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }
}

# ══════════════════════════════════════════════════════════════════════════════
#  Banner
# ══════════════════════════════════════════════════════════════════════════════

$qwListStr = ($selectedQWs | ForEach-Object { "QW$($_.Id)" }) -join ', '
$modeLabel = if ($isWhatIf) { 'WHATIF — preview only' } else { 'LIVE — changes will be applied' }
$modeColor = if ($isWhatIf) { 'Yellow' } else { 'Red' }

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Phase 2 Quick-Win Remediation                       ║
  ║   Quick wins : $($qwListStr.PadRight(55))║
  ║   Mode       : $($modeLabel.PadRight(55))║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $modeColor

# ══════════════════════════════════════════════════════════════════════════════
#  Confirmation Gate (Execute mode only)
# ══════════════════════════════════════════════════════════════════════════════

if ($Execute -and -not $Force) {
    $caption = 'Phase 2 Quick Wins — LIVE EXECUTION'
    $message = "Apply $($selectedQWs.Count) quick win(s) to production tenants. Continue?"
    if (-not $PSCmdlet.ShouldContinue($message, $caption)) {
        Write-Host "`n  Aborted by user.`n" -ForegroundColor Yellow
        return
    }
}

# ══════════════════════════════════════════════════════════════════════════════
#  Main Orchestration
# ══════════════════════════════════════════════════════════════════════════════

foreach ($qw in $selectedQWs) {
    Write-CTUSection "QW$($qw.Id): $($qw.Name)"

    # Intersect QW target tenants with user-supplied filter
    $targets = $qw.Tenants
    if ($TenantKeys) { $targets = $targets | Where-Object { $_ -in $TenantKeys } }

    if (-not $targets -or @($targets).Count -eq 0) {
        Write-CTUFinding -Severity 'INFO' -Message "(no target tenants after filter — skipped)"
        continue
    }

    Write-CTUFinding -Severity 'INFO' -Message "Targets: $($targets -join ', ')"

    foreach ($key in $targets) {
        switch ($qw.Id) {
            1 { Invoke-AuthPolicyRemediation -QWId 1 -QWName $qw.Name -Tenant $key `
                    -Property 'allowInvitesFrom' -Target 'adminsAndGuestInviters' }
            2 { Invoke-AuthPolicyRemediation -QWId 2 -QWName $qw.Name -Tenant $key `
                    -Property 'guestUserRoleId'  -Target $RestrictedGuestRoleId }
            3 { Invoke-AuthPolicyRemediation -QWId 3 -QWName $qw.Name -Tenant $key `
                    -Property 'allowEmailVerifiedUsersToJoinOrganization' -Target $false }
            4 { Invoke-TeamsFedRemediation   -QWId 4 -QWName $qw.Name -Tenant $key `
                    -TargetSettings @{ AllowTeamsConsumer = $false; AllowTeamsConsumerInbound = $false } }
            5 { Invoke-TeamsFedRemediation   -QWId 5 -QWName $qw.Name -Tenant $key `
                    -TargetSettings @{ ExternalAccessWithTrialTenants = 'Blocked' } }
            6 { Invoke-MfaCaRemediation -Tenant $key }
        }
    }
}

# ══════════════════════════════════════════════════════════════════════════════
#  Report & Summary
# ══════════════════════════════════════════════════════════════════════════════

Export-CTUReport -ReportName 'Phase2QuickWins' -Data $results

Write-Host "`n  ── Phase 2 Quick Wins Summary ──`n" -ForegroundColor White

if ($results.Count -eq 0) {
    Write-Host "  No results recorded.`n" -ForegroundColor DarkGray
}
else {
    $tableOutput = $results |
        Format-Table QuickWin, TenantKey, Status, CurrentValue, TargetValue -AutoSize |
        Out-String
    Write-Host $tableOutput

    # Status totals with colour coding
    $grouped = $results | Group-Object Status
    Write-Host "  Totals:" -ForegroundColor White
    foreach ($g in $grouped) {
        $color = switch ($g.Name) {
            'NO_CHANGE'    { 'Green'  }
            'WOULD_CHANGE' { 'Yellow' }
            'CHANGED'      { 'Cyan'   }
            'ERROR'        { 'Red'    }
            default        { 'Gray'   }
        }
        Write-Host "    $($g.Name): $($g.Count)" -ForegroundColor $color
    }
}

$modeWord = if ($isWhatIf) { 'preview' } else { 'execution' }
Write-Host "`n  Phase 2 quick-win $modeWord complete.`n" -ForegroundColor Magenta
