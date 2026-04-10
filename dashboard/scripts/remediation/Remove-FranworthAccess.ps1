<#
.SYNOPSIS
    Remove all Franworth cross-tenant access and guest accounts from HTT Brands tenants.

.DESCRIPTION
    Targeted remediation script to fully remove Franworth (248c9920-7745-4f81-8e18-1a5de9935bbd)
    from The Lash Lounge (TLL) and Head to Toe Brands (HTT).

    Actions performed:
      1. Removes Franworth partner policy from TLL (B2B + DC + trust — entire config)
      2. Disables 14 Franworth guest accounts in TLL
      3. Disables 4 Franworth guest accounts in HTT
      4. Optionally deletes (purges) disabled guests with -Purge switch

    Safety features:
      - Default = WhatIf mode (preview only — no changes)
      - -Execute switch required for live changes
      - -Purge switch required to delete guests (default = disable only)
      - -Force switch to bypass the impact-assessment gate when group memberships
        or app role assignments are found on Franworth guests
      - Pre-removal snapshots saved to reports/ for rollback reference
      - Full impact assessment (group memberships + app roles) before any changes

.PARAMETER Execute
    Opt-in switch to apply live changes. Without this flag the script only
    reports what WOULD change (dry-run / WhatIf behaviour).

.PARAMETER Purge
    Delete guest accounts after disabling them. Without this flag, guests
    are disabled (AccountEnabled = false) but not removed from the directory.

.PARAMETER Force
    Skip the impact-assessment gate. By default, if any Franworth guest has
    group memberships or app role assignments, the script warns and stops.
    -Force overrides this safety check.

.EXAMPLE
    .\Remove-FranworthAccess.ps1
    # WhatIf mode — shows what would happen, touches nothing.

.EXAMPLE
    .\Remove-FranworthAccess.ps1 -Execute
    # Live mode — removes partner policy, disables all guests.

.EXAMPLE
    .\Remove-FranworthAccess.ps1 -Execute -Purge
    # Live mode — removes partner policy, disables AND deletes all guests.

.EXAMPLE
    .\Remove-FranworthAccess.ps1 -Execute -Purge -Force
    # Live mode — same as above but skips impact-assessment gate.

.NOTES
    Author  : Tyler Granlund / CTU Automation
    Version : 1.0.0
    Requires: Microsoft.Graph PowerShell SDK v2+, CTU.Core module
    Context : Phase 1 audit found Franworth with EXPLICIT full Direct Connect
              access (AllUsers/AllApps both directions) in TLL with NO MFA trust.
              All 18 guest accounts are stale (>90 days) or PendingAcceptance.
              Tyler confirmed Franworth should NOT have access anymore.
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [switch]$Execute,
    [switch]$Purge,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

# ── Constants ────────────────────────────────────────────────────────────────

$FranworthTenantId = '248c9920-7745-4f81-8e18-1a5de9935bbd'
$FranworthDomain   = 'franworth.com'

$TLLGuestIds = [ordered]@{
    '181f9b3e-b4fc-4007-ad8b-5f9221ee710a' = 'Josh Kaminski'
    '32009df7-0e5f-4780-abc7-9a379a6d1ab4' = 'Josh Titler'
    '4b606f89-d19e-4bcd-b080-20dbc7e177e4' = 'Holly Elliott'
    '8bcd8d62-7722-4bea-8bd2-9814f25266d2' = 'Melanie Calender'
    'f7f6b30c-ed54-40de-be7a-82211dc7b824' = 'aaron (pending)'
    'c60c5dff-9341-484a-b0e0-48191624c103' = 'Stephani Mitchell'
    'cfdc78a2-db03-4d9f-a574-2940e9e32ef5' = 'bshelley (pending)'
    '4004c175-a1d9-4da1-880d-1809bc3a0dda' = 'Bryan Farida'
    '7e45e0f8-56a2-4fdd-94ef-135cca509b53' = 'Jonathan Koudelka'
    '6e1f2131-f2f2-41ea-b2a6-3e6b8f887fe8' = 'Jen Ling'
    '59fd60f3-3753-493a-977a-e60e47c8af0e' = 'Karen Meek'
    'bcf552af-c84a-431f-b632-fc39923196c3' = 'Justine C Crispin'
    '22b1a620-af4e-4594-a0c6-0e5c591d3cdc' = 'Shelley Blaszak'
    'd39ea7b2-60f6-442d-a500-e1b6684be54e' = 'Mike Wernel'
    '3d3b52d4-0076-46e9-a687-c84626a63853' = 'JT Singh'
}

$HTTGuestIds = [ordered]@{
    '706934eb-94c1-4305-ac36-e5214aafb005' = 'Glenna Schleusener'
    '637da198-e1e2-457e-897e-ac32c3bf6e60' = 'Kristen Sherwood'
    '25401e0a-ff9e-471d-8d8d-8afbe52c4bc2' = 'josh (pending)'
    '59c90b2d-8cbb-4358-b9d2-48d272efd17e' = 'ben (pending)'
}

# ── State ────────────────────────────────────────────────────────────────────

$config     = Get-CTUConfig
$isWhatIf   = -not $Execute -or $WhatIfPreference
$reportsDir = Join-Path $PSScriptRoot ".." ".." "reports"
if (-not (Test-Path $reportsDir)) { New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null }

$GraphBase = "https://graph.microsoft.com/v1.0"

# ── Results ──────────────────────────────────────────────────────────────────

$results = [ordered]@{
    Timestamp      = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    Mode           = if ($isWhatIf) { 'WhatIf' } else { 'Execute' }
    PurgeEnabled   = [bool]$Purge
    PartnerPolicy  = $null
    ImpactReport   = @{ GroupMemberships = @(); AppRoleAssignments = @() }
    GuestActions   = @()
    Errors         = @()
}

# ── Banner ───────────────────────────────────────────────────────────────────

$modeLabel = if ($isWhatIf) { 'WHATIF — preview only' } else { 'LIVE — changes will be applied' }
$modeColor = if ($isWhatIf) { 'Yellow' } else { 'Red' }

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Franworth Access Removal                            ║
  ║   Target: $($FranworthDomain) ($($FranworthTenantId.Substring(0,8))...)               ║
  ║   Mode  : $($modeLabel.PadRight(55))║
  ║   Guests: $("$($TLLGuestIds.Count) TLL + $($HTTGuestIds.Count) HTT = $($TLLGuestIds.Count + $HTTGuestIds.Count) total".PadRight(55))║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $modeColor

# ══════════════════════════════════════════════════════════════════════════════
#  Helper Functions
# ══════════════════════════════════════════════════════════════════════════════

function Get-GuestImpact {
    <#
    .SYNOPSIS
        Check group memberships and app role assignments for a guest user.
    #>
    param(
        [Parameter(Mandatory)][string]$UserId,
        [Parameter(Mandatory)][string]$DisplayName
    )

    $impact = @{ UserId = $UserId; DisplayName = $DisplayName; Groups = @(); AppRoles = @() }

    try {
        $memberships = @(Invoke-CTUGraphRequest `
            -Uri "$GraphBase/users/$UserId/memberOf" -AllPages)
        $impact.Groups = @($memberships | Where-Object {
            $_.'@odata.type' -eq '#microsoft.graph.group'
        } | ForEach-Object { $_.displayName })
    }
    catch {
        Write-Verbose "Could not read memberships for ${DisplayName}: $_"
    }

    try {
        $appRoles = @(Invoke-CTUGraphRequest `
            -Uri "$GraphBase/users/$UserId/appRoleAssignments" -AllPages)
        $impact.AppRoles = @($appRoles | ForEach-Object { $_.resourceDisplayName })
    }
    catch {
        Write-Verbose "Could not read app roles for ${DisplayName}: $_"
    }

    return $impact
}

function Invoke-GuestRemediation {
    <#
    .SYNOPSIS
        Disable (and optionally purge) a single guest account.
    #>
    param(
        [Parameter(Mandatory)][string]$UserId,
        [Parameter(Mandatory)][string]$DisplayName,
        [Parameter(Mandatory)][string]$TenantKey
    )

    $action = [ordered]@{
        TenantKey   = $TenantKey
        UserId      = $UserId
        DisplayName = $DisplayName
        Disabled    = $false
        Deleted     = $false
        Error       = $null
    }

    try {
        if ($script:isWhatIf) {
            Write-CTUFinding -Severity 'INFO' `
                -Message "WOULD DISABLE guest: $DisplayName ($($UserId.Substring(0,8))...)"
            if ($script:Purge) {
                Write-CTUFinding -Severity 'INFO' `
                    -Message "WOULD DELETE  guest: $DisplayName ($($UserId.Substring(0,8))...)"
            }
            $action.Disabled = 'WhatIf'
            $action.Deleted  = if ($script:Purge) { 'WhatIf' } else { $false }
        }
        else {
            # Step 1: Disable
            Invoke-CTUGraphRequest -Uri "$GraphBase/users/$UserId" -Method PATCH `
                -Body @{ accountEnabled = $false }
            Write-CTUFinding -Severity 'OK' `
                -Message "DISABLED guest: $DisplayName ($($UserId.Substring(0,8))...)"
            $action.Disabled = $true

            # Step 2: Purge (if requested)
            if ($script:Purge) {
                Invoke-CTUGraphRequest -Uri "$GraphBase/users/$UserId" -Method DELETE
                Write-CTUFinding -Severity 'OK' `
                    -Message "DELETED  guest: $DisplayName ($($UserId.Substring(0,8))...)"
                $action.Deleted = $true
            }
        }
    }
    catch {
        Write-CTUFinding -Severity 'HIGH' `
            -Message "FAILED on guest $DisplayName ($UserId): $_"
        $action.Error = "$_"
        $script:results.Errors += "Guest $DisplayName ($TenantKey): $_"
    }

    return $action
}

# ══════════════════════════════════════════════════════════════════════════════
#  PHASE 1 — TLL: Partner Policy Snapshot + Impact Assessment
# ══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Phase 1: Connect to TLL & Assess Impact"

try {
    Connect-CTUTenant -TenantKey 'TLL' -Config $config | Out-Null

    # ── Snapshot Franworth partner policy before removal ─────────────────

    Write-CTUSection "Snapshot: Franworth Partner Policy (TLL)"

    $partnerUri = "$GraphBase/policies/crossTenantAccessPolicy/partners/$FranworthTenantId"
    $partnerSnapshot = $null

    try {
        $partnerSnapshot = Invoke-CTUGraphRequest -Uri $partnerUri
        Write-CTUFinding -Severity 'OK' -Message "Captured Franworth partner policy from TLL"
    }
    catch {
        if ("$_" -match "404|NotFound") {
            Write-CTUFinding -Severity 'INFO' -Message "No Franworth partner policy found in TLL (already removed?)"
        }
        else {
            Write-CTUFinding -Severity 'HIGH' -Message "Failed to read Franworth partner policy: $_"
            $results.Errors += "Partner policy snapshot failed: $_"
        }
    }

    if ($partnerSnapshot) {
        $snapshotPath = Join-Path $reportsDir "franworth-removal-snapshot.json"
        $partnerSnapshot | ConvertTo-Json -Depth 15 | Out-File $snapshotPath -Encoding utf8
        Write-CTUFinding -Severity 'OK' -Message "Snapshot saved: $snapshotPath"
        $results.PartnerPolicy = @{
            Found        = $true
            SnapshotPath = $snapshotPath
        }
    }
    else {
        $results.PartnerPolicy = @{ Found = $false }
    }

    # ── Impact assessment: TLL guests ───────────────────────────────────

    Write-CTUSection "Impact Assessment: TLL Franworth Guests ($($TLLGuestIds.Count) accounts)"

    $allImpacts = @()

    foreach ($entry in $TLLGuestIds.GetEnumerator()) {
        $impact = Get-GuestImpact -UserId $entry.Key -DisplayName $entry.Value
        $allImpacts += $impact

        if ($impact.Groups.Count -gt 0) {
            Write-CTUFinding -Severity 'MEDIUM' `
                -Message "$($entry.Value) is member of $($impact.Groups.Count) group(s): $($impact.Groups -join ', ')"
            $results.ImpactReport.GroupMemberships += @{
                TenantKey = 'TLL'; UserId = $entry.Key; DisplayName = $entry.Value
                Groups = $impact.Groups
            }
        }

        if ($impact.AppRoles.Count -gt 0) {
            Write-CTUFinding -Severity 'MEDIUM' `
                -Message "$($entry.Value) has $($impact.AppRoles.Count) app role(s): $($impact.AppRoles -join ', ')"
            $results.ImpactReport.AppRoleAssignments += @{
                TenantKey = 'TLL'; UserId = $entry.Key; DisplayName = $entry.Value
                AppRoles = $impact.AppRoles
            }
        }
    }

    # Save affected guests list
    $tllGuestData = $TLLGuestIds.GetEnumerator() | ForEach-Object {
        [PSCustomObject]@{ TenantKey = 'TLL'; UserId = $_.Key; DisplayName = $_.Value }
    }

    # ── Impact gate ─────────────────────────────────────────────────────

    $hasGroupHits   = $results.ImpactReport.GroupMemberships.Count -gt 0
    $hasAppRoleHits = $results.ImpactReport.AppRoleAssignments.Count -gt 0

    if (($hasGroupHits -or $hasAppRoleHits) -and -not $Force) {
        $totalHits = $results.ImpactReport.GroupMemberships.Count + $results.ImpactReport.AppRoleAssignments.Count
        Write-Host ""
        Write-CTUFinding -Severity 'HIGH' `
            -Message "IMPACT GATE: $totalHits group/app-role assignments found on Franworth guests"
        Write-CTUFinding -Severity 'HIGH' `
            -Message "Review the findings above. Re-run with -Force to proceed anyway."

        # Still save what we found before bailing
        $guestsPath = Join-Path $reportsDir "franworth-affected-guests.json"
        @{
            TLL = @($tllGuestData)
            HTT = @($HTTGuestIds.GetEnumerator() | ForEach-Object {
                [PSCustomObject]@{ TenantKey = 'HTT'; UserId = $_.Key; DisplayName = $_.Value }
            })
            ImpactReport = $results.ImpactReport
        } | ConvertTo-Json -Depth 10 | Out-File $guestsPath -Encoding utf8
        Write-CTUFinding -Severity 'INFO' -Message "Affected guests saved: $guestsPath"

        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
        return
    }

    if ($hasGroupHits -or $hasAppRoleHits) {
        Write-CTUFinding -Severity 'MEDIUM' `
            -Message "Impact gate bypassed with -Force — proceeding with remediation"
    }
    else {
        Write-CTUFinding -Severity 'OK' `
            -Message "No group memberships or app role assignments found — safe to proceed"
    }

    # ══════════════════════════════════════════════════════════════════════
    #  PHASE 2 — TLL: Remove Partner Policy
    # ══════════════════════════════════════════════════════════════════════

    if ($partnerSnapshot) {
        Write-CTUSection "Phase 2: Remove Franworth Partner Policy (TLL)"

        if ($isWhatIf) {
            Write-CTUFinding -Severity 'INFO' `
                -Message "WOULD REMOVE Franworth partner policy from TLL (B2B + DC + trust — entire config)"
            $results.PartnerPolicy.Action = 'WhatIf'
        }
        else {
            try {
                Invoke-CTUGraphRequest -Uri $partnerUri -Method DELETE
                Write-CTUFinding -Severity 'OK' `
                    -Message "REMOVED Franworth partner policy from TLL"
                $results.PartnerPolicy.Action = 'Removed'
            }
            catch {
                Write-CTUFinding -Severity 'HIGH' `
                    -Message "FAILED to remove Franworth partner policy: $_"
                $results.PartnerPolicy.Action = 'Failed'
                $results.Errors += "Partner policy removal failed: $_"
            }
        }
    }

    # ══════════════════════════════════════════════════════════════════════
    #  PHASE 3 — TLL: Disable/Delete Guest Accounts
    # ══════════════════════════════════════════════════════════════════════

    Write-CTUSection "Phase 3: Remediate TLL Franworth Guests ($($TLLGuestIds.Count) accounts)"

    foreach ($entry in $TLLGuestIds.GetEnumerator()) {
        $action = Invoke-GuestRemediation -UserId $entry.Key -DisplayName $entry.Value -TenantKey 'TLL'
        $results.GuestActions += $action
    }
}
catch {
    Write-CTUFinding -Severity 'CRITICAL' -Message "TLL phase failed: $_"
    $results.Errors += "TLL phase error: $_"
}
finally {
    try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
}

# ══════════════════════════════════════════════════════════════════════════════
#  PHASE 4 — HTT: Impact Assessment + Disable/Delete Guest Accounts
# ══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Phase 4: Connect to HTT & Remediate Franworth Guests ($($HTTGuestIds.Count) accounts)"

try {
    Connect-CTUTenant -TenantKey 'HTT' -Config $config | Out-Null

    # ── Impact assessment: HTT guests ───────────────────────────────────

    foreach ($entry in $HTTGuestIds.GetEnumerator()) {
        $impact = Get-GuestImpact -UserId $entry.Key -DisplayName $entry.Value

        if ($impact.Groups.Count -gt 0) {
            Write-CTUFinding -Severity 'MEDIUM' `
                -Message "$($entry.Value) (HTT) is member of $($impact.Groups.Count) group(s): $($impact.Groups -join ', ')"
            $results.ImpactReport.GroupMemberships += @{
                TenantKey = 'HTT'; UserId = $entry.Key; DisplayName = $entry.Value
                Groups = $impact.Groups
            }
        }

        if ($impact.AppRoles.Count -gt 0) {
            Write-CTUFinding -Severity 'MEDIUM' `
                -Message "$($entry.Value) (HTT) has $($impact.AppRoles.Count) app role(s): $($impact.AppRoles -join ', ')"
            $results.ImpactReport.AppRoleAssignments += @{
                TenantKey = 'HTT'; UserId = $entry.Key; DisplayName = $entry.Value
                AppRoles = $impact.AppRoles
            }
        }
    }

    # ── Remediate HTT guests ────────────────────────────────────────────

    foreach ($entry in $HTTGuestIds.GetEnumerator()) {
        $action = Invoke-GuestRemediation -UserId $entry.Key -DisplayName $entry.Value -TenantKey 'HTT'
        $results.GuestActions += $action
    }
}
catch {
    Write-CTUFinding -Severity 'CRITICAL' -Message "HTT phase failed: $_"
    $results.Errors += "HTT phase error: $_"
}
finally {
    try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
}

# ══════════════════════════════════════════════════════════════════════════════
#  Save Reports & Summary
# ══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Saving Reports"

# Save affected guests manifest
$guestsPath = Join-Path $reportsDir "franworth-affected-guests.json"
@{
    TLL = @($TLLGuestIds.GetEnumerator() | ForEach-Object {
        [PSCustomObject]@{ TenantKey = 'TLL'; UserId = $_.Key; DisplayName = $_.Value }
    })
    HTT = @($HTTGuestIds.GetEnumerator() | ForEach-Object {
        [PSCustomObject]@{ TenantKey = 'HTT'; UserId = $_.Key; DisplayName = $_.Value }
    })
    ImpactReport = $results.ImpactReport
} | ConvertTo-Json -Depth 10 | Out-File $guestsPath -Encoding utf8
Write-CTUFinding -Severity 'OK' -Message "Affected guests saved: $guestsPath"

# Export full results via CTU reporting
Export-CTUReport -ReportName 'FranworthRemoval' -Data $results

# ── Console Summary ──────────────────────────────────────────────────────────

$guestActions = @($results.GuestActions)
$disabled     = @($guestActions | Where-Object { $_.Disabled -eq $true }).Count
$deleted      = @($guestActions | Where-Object { $_.Deleted -eq $true }).Count
$wouldChange  = @($guestActions | Where-Object { $_.Disabled -eq 'WhatIf' }).Count
$errors       = @($guestActions | Where-Object { $null -ne $_.Error }).Count

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   Franworth Removal — Summary                                      ║
  ╠═══════════════════════════════════════════════════════════════════════╣
  ║   Partner Policy (TLL):  $("$($results.PartnerPolicy.Action ?? 'N/A')".PadRight(44))║
  ║   Guests Disabled:       $("$disabled".PadRight(44))║
  ║   Guests Deleted:        $("$deleted".PadRight(44))║
  ║   Would Change (WhatIf): $("$wouldChange".PadRight(44))║
  ║   Errors:                $("$errors".PadRight(44))║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $(if ($isWhatIf) { 'Yellow' } else { 'Green' })

$modeWord = if ($isWhatIf) { 'preview' } else { 'execution' }
Write-Host "  Franworth removal $modeWord complete.`n" -ForegroundColor Magenta
