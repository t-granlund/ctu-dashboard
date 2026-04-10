<#
.SYNOPSIS
    Deep analysis of TLL tenant guest accounts from a local CSV export.
.DESCRIPTION
    Reads the guests_TLL.csv file produced by a prior full audit and performs
    offline analysis — no Graph authentication required.

    Analyses performed:
      - Domain breakdown (top 20 source domains by guest count)
      - Creation timeline (guests grouped by year/quarter)
      - Invitation state distribution (Accepted, PendingAcceptance, etc.)
      - Stale guest identification (IsStale, NeverSignedIn)
      - Pending invitation age bucketing
      - Cleanup candidate identification

    Outputs a Markdown report and a cleanup-candidates CSV.
.PARAMETER GuestCsvPath
    Path to the TLL guests CSV file. Defaults to the FullAudit export.
.PARAMETER OutputDir
    Directory for generated reports. Defaults to the repo reports/ folder.
.EXAMPLE
    .\Analyze-TLLGuests.ps1
.EXAMPLE
    .\Analyze-TLLGuests.ps1 -GuestCsvPath "C:\exports\guests_TLL.csv" -OutputDir "C:\reports"
.NOTES
    Author : HTT Brands — Cross-Tenant Utility
    Prereqs: PowerShell 7+, CTU.Core module (for console helpers only)
#>
[CmdletBinding()]
param(
    [string]$GuestCsvPath = (Join-Path $PSScriptRoot ".." ".." "reports" "FullAudit_2026-04-10_092748" "guests_TLL.csv"),
    [string]$OutputDir    = (Join-Path $PSScriptRoot ".." ".." "reports")
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

# ─── Banner ──────────────────────────────────────────────────────────────────

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   TLL Guest Account Deep Analysis                                   ║
  ║   Offline analysis — no Graph auth required                         ║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

# ─── Load CSV ────────────────────────────────────────────────────────────────

if (-not (Test-Path $GuestCsvPath)) {
    Write-Error "CSV not found at: $GuestCsvPath — run the full audit first or pass -GuestCsvPath."
}

$guests = Import-Csv -Path $GuestCsvPath
$totalGuests = $guests.Count

if ($totalGuests -eq 0) {
    Write-Warning "CSV contains no guest records — nothing to analyze. Verify the file: $GuestCsvPath"
    return
}

Write-Host "  Loaded $totalGuests guest records from:" -ForegroundColor Green
Write-Host "  $GuestCsvPath`n" -ForegroundColor DarkGray

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$now = Get-Date

# ─── Helpers ─────────────────────────────────────────────────────────────────

function ConvertTo-BoolSafe {
    <# Handles "True"/"False"/empty strings from CSV. #>
    param([string]$Value)
    return ($Value -eq "True" -or $Value -eq "TRUE" -or $Value -eq "true")
}

function Get-YearQuarter {
    <# Returns "2024-Q3" style string from a datetime. #>
    param([datetime]$Date)
    $q = [math]::Ceiling($Date.Month / 3)
    return "$($Date.Year)-Q$q"
}

function New-CleanupCandidate {
    <# Builds a uniform cleanup-candidate object — DRY across all cleanup rules. #>
    param([PSCustomObject]$Guest, [string]$Reason)
    [PSCustomObject]@{
        Id              = $Guest.Id
        DisplayName     = $Guest.DisplayName
        Mail            = $Guest.Mail
        SourceDomain    = $Guest.SourceDomain
        CreatedDateTime = $Guest.CreatedDateTime
        InvitationState = $Guest.InvitationState
        LastSignIn      = $Guest.LastSignIn
        DaysSinceSignIn = $Guest.DaysSinceSignIn
        NeverSignedIn   = $Guest.NeverSignedIn
        CleanupReason   = $Reason
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION A — Domain Breakdown
# ═══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Domain Breakdown"

$domainGroups = $guests | Group-Object -Property SourceDomain |
    Sort-Object Count -Descending

$top20Domains = $domainGroups | Select-Object -First 20

$cumulativeCount = 0
$domainTable = foreach ($dg in $top20Domains) {
    $cumulativeCount += $dg.Count
    [PSCustomObject]@{
        Domain        = $dg.Name
        Count         = $dg.Count
        Percent       = [math]::Round(($dg.Count / $totalGuests) * 100, 1)
        CumulativePct = [math]::Round(($cumulativeCount / $totalGuests) * 100, 1)
    }
}

$uniqueDomains = $domainGroups.Count
Write-CTUFinding -Severity "INFO" -Message "$uniqueDomains unique source domains across $totalGuests guests"
foreach ($row in $domainTable | Select-Object -First 5) {
    Write-CTUFinding -Severity "INFO" -Message "$($row.Domain): $($row.Count) ($($row.Percent)%)"
}
if ($uniqueDomains -gt 5) {
    Write-CTUFinding -Severity "INFO" -Message "... and $($uniqueDomains - 5) more domains"
}

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION B — Creation Timeline
# ═══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Creation Timeline"

$timelineData = foreach ($g in $guests) {
    if ($g.CreatedDateTime) {
        try {
            $created = [datetime]::Parse($g.CreatedDateTime)
            [PSCustomObject]@{ YearQuarter = Get-YearQuarter -Date $created }
        } catch {
            Write-Verbose "Skipping unparseable CreatedDateTime: '$($g.CreatedDateTime)' for guest $($g.DisplayName)"
        }
    }
}

$timelineGroups = $timelineData | Group-Object -Property YearQuarter |
    Sort-Object Name

$timelineTable = foreach ($tg in $timelineGroups) {
    [PSCustomObject]@{
        YearQuarter = $tg.Name
        Count       = $tg.Count
        Percent     = [math]::Round(($tg.Count / $totalGuests) * 100, 1)
    }
}

foreach ($row in $timelineTable) {
    $bar = "#" * [math]::Min([math]::Round($row.Count / 5), 40)
    Write-CTUFinding -Severity "INFO" -Message "$($row.YearQuarter): $($row.Count.ToString().PadLeft(4)) $bar"
}

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION C — Invitation State Distribution
# ═══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Invitation State Distribution"

$stateGroups = $guests | Group-Object -Property InvitationState |
    Sort-Object Count -Descending

$stateTable = foreach ($sg in $stateGroups) {
    [PSCustomObject]@{
        State   = if ($sg.Name) { $sg.Name } else { "(blank)" }
        Count   = $sg.Count
        Percent = [math]::Round(($sg.Count / $totalGuests) * 100, 1)
    }
}

foreach ($row in $stateTable) {
    $sev = if ($row.State -eq "PendingAcceptance") { "MEDIUM" } else { "INFO" }
    Write-CTUFinding -Severity $sev -Message "$($row.State): $($row.Count) ($($row.Percent)%)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION D — Stale Guest Analysis
# ═══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Stale Guest Analysis"

$staleGuests      = $guests | Where-Object { ConvertTo-BoolSafe $_.IsStale }
$neverSignedIn    = $guests | Where-Object { ConvertTo-BoolSafe $_.NeverSignedIn }
$staleAndNever    = $guests | Where-Object {
    (ConvertTo-BoolSafe $_.IsStale) -and (ConvertTo-BoolSafe $_.NeverSignedIn)
}

$stalePct      = [math]::Round(($staleGuests.Count / $totalGuests) * 100, 1)
$neverPct      = [math]::Round(($neverSignedIn.Count / $totalGuests) * 100, 1)
$staleNeverPct = [math]::Round(($staleAndNever.Count / $totalGuests) * 100, 1)

$staleSev = if ($stalePct -gt 50) { "HIGH" } elseif ($stalePct -gt 25) { "MEDIUM" } else { "LOW" }
Write-CTUFinding -Severity $staleSev  -Message "Stale guests: $($staleGuests.Count) / $totalGuests ($stalePct%)"
Write-CTUFinding -Severity "MEDIUM"   -Message "Never signed in: $($neverSignedIn.Count) / $totalGuests ($neverPct%)"
Write-CTUFinding -Severity "HIGH"     -Message "Stale + never signed in: $($staleAndNever.Count) / $totalGuests ($staleNeverPct%)"

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION E — Pending Invitation Age
# ═══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Pending Invitation Age"

$pendingGuests = $guests | Where-Object { $_.InvitationState -eq "PendingAcceptance" }

$ageBuckets = [ordered]@{
    "< 30 days"   = 0
    "30-90 days"  = 0
    "90-365 days" = 0
    "> 365 days"  = 0
    "> 1000 days" = 0
}

$pendingDetails = foreach ($pg in $pendingGuests) {
    if ($pg.CreatedDateTime) {
        try {
            $created = [datetime]::Parse($pg.CreatedDateTime)
            $ageDays = ($now - $created).Days

            # Bucket (most specific first — >1000 is a subset of >365)
            if     ($ageDays -gt 1000) { $ageBuckets["> 1000 days"]++ }
            elseif ($ageDays -gt 365)  { $ageBuckets["> 365 days"]++  }
            elseif ($ageDays -gt 90)   { $ageBuckets["90-365 days"]++ }
            elseif ($ageDays -gt 30)   { $ageBuckets["30-90 days"]++  }
            else                       { $ageBuckets["< 30 days"]++   }

            [PSCustomObject]@{ Guest = $pg; AgeDays = $ageDays }
        } catch {
            Write-Verbose "Skipping unparseable CreatedDateTime: '$($pg.CreatedDateTime)' for guest $($pg.DisplayName)"
        }
    }
}

Write-CTUFinding -Severity "INFO" -Message "Pending invitations: $($pendingGuests.Count)"
foreach ($bucket in $ageBuckets.GetEnumerator()) {
    $sev = if ($bucket.Key -match "1000|365") { "HIGH" } elseif ($bucket.Key -eq "90-365 days") { "MEDIUM" } else { "LOW" }
    Write-CTUFinding -Severity $sev -Message "  $($bucket.Key): $($bucket.Value)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION F — Cleanup Candidates
# ═══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Cleanup Candidates"

# Rule 1: Stale + never signed in
$cleanupStaleNever = foreach ($g in $staleAndNever) {
    New-CleanupCandidate -Guest $g -Reason "Stale + NeverSignedIn"
}

# Rule 2: Pending invitation > 90 days
$pendingOver90 = $pendingDetails | Where-Object { $_.AgeDays -gt 90 }
$cleanupPendingOld = foreach ($pd in $pendingOver90) {
    $g = $pd.Guest
    # Avoid duplicates — skip if already captured by rule 1
    if ((ConvertTo-BoolSafe $g.IsStale) -and (ConvertTo-BoolSafe $g.NeverSignedIn)) { continue }
    New-CleanupCandidate -Guest $g -Reason "PendingAcceptance > 90 days"
}

$cleanupCandidates = @($cleanupStaleNever) + @($cleanupPendingOld)

$cleanupPct = [math]::Round(($cleanupCandidates.Count / $totalGuests) * 100, 1)
Write-CTUFinding -Severity "HIGH" -Message "Total cleanup candidates: $($cleanupCandidates.Count) / $totalGuests ($cleanupPct%)"
Write-CTUFinding -Severity "INFO" -Message "  Stale + never signed in: $($cleanupStaleNever.Count)"
Write-CTUFinding -Severity "INFO" -Message "  Pending > 90 days (additional): $($cleanupPendingOld.Count)"

# ═══════════════════════════════════════════════════════════════════════════════
# OUTPUT — Markdown Report
# ═══════════════════════════════════════════════════════════════════════════════

Write-CTUSection "Generating Reports"

$mdPath  = Join-Path $OutputDir "tll-guest-analysis.md"
$csvPath = Join-Path $OutputDir "tll-guest-cleanup-candidates.csv"

$md = [System.Text.StringBuilder]::new()

# ── Executive Summary ────────────────────────────────────────────────────────

$null = $md.AppendLine("# TLL Guest Account Analysis")
$null = $md.AppendLine("")
$null = $md.AppendLine("**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$null = $md.AppendLine("**Source:** ``$($GuestCsvPath | Split-Path -Leaf)``")
$null = $md.AppendLine("")
$null = $md.AppendLine("## Executive Summary")
$null = $md.AppendLine("")
$null = $md.AppendLine("| Metric | Value |")
$null = $md.AppendLine("|--------|-------|")
$null = $md.AppendLine("| Total guests | $totalGuests |")
$null = $md.AppendLine("| Unique source domains | $uniqueDomains |")
$null = $md.AppendLine("| Stale guests | $($staleGuests.Count) ($stalePct%) |")
$null = $md.AppendLine("| Never signed in | $($neverSignedIn.Count) ($neverPct%) |")
$null = $md.AppendLine("| Pending invitations | $($pendingGuests.Count) |")
$null = $md.AppendLine("| **Cleanup candidates** | **$($cleanupCandidates.Count) ($cleanupPct%)** |")
$null = $md.AppendLine("")

# ── Domain Breakdown ─────────────────────────────────────────────────────────

$null = $md.AppendLine("## Domain Breakdown (Top 20)")
$null = $md.AppendLine("")
$null = $md.AppendLine("| # | Domain | Count | % | Cumulative % |")
$null = $md.AppendLine("|---|--------|------:|--:|-------------:|")

$rank = 0
foreach ($row in $domainTable) {
    $rank++
    $null = $md.AppendLine("| $rank | $($row.Domain) | $($row.Count) | $($row.Percent)% | $($row.CumulativePct)% |")
}

$remainingDomains = $domainGroups.Count - 20
if ($remainingDomains -gt 0) {
    $remainingCount = ($domainGroups | Select-Object -Skip 20 | Measure-Object -Property Count -Sum).Sum
    $null = $md.AppendLine("| | *($remainingDomains other domains)* | $remainingCount | $([math]::Round(($remainingCount / $totalGuests) * 100, 1))% | 100.0% |")
}
$null = $md.AppendLine("")

# ── Creation Timeline ────────────────────────────────────────────────────────

$null = $md.AppendLine("## Creation Timeline")
$null = $md.AppendLine("")
$null = $md.AppendLine("| Year/Quarter | Count | % |")
$null = $md.AppendLine("|--------------|------:|--:|")

foreach ($row in $timelineTable) {
    $null = $md.AppendLine("| $($row.YearQuarter) | $($row.Count) | $($row.Percent)% |")
}
$null = $md.AppendLine("")

# ── Invitation State ─────────────────────────────────────────────────────────

$null = $md.AppendLine("## Invitation State Distribution")
$null = $md.AppendLine("")
$null = $md.AppendLine("| State | Count | % |")
$null = $md.AppendLine("|-------|------:|--:|")

foreach ($row in $stateTable) {
    $null = $md.AppendLine("| $($row.State) | $($row.Count) | $($row.Percent)% |")
}
$null = $md.AppendLine("")

# ── Pending Invitation Age ───────────────────────────────────────────────────

$null = $md.AppendLine("## Pending Invitation Age Analysis")
$null = $md.AppendLine("")
$null = $md.AppendLine("| Age Bucket | Count |")
$null = $md.AppendLine("|------------|------:|")

foreach ($bucket in $ageBuckets.GetEnumerator()) {
    $null = $md.AppendLine("| $($bucket.Key) | $($bucket.Value) |")
}
$null = $md.AppendLine("")

# ── Stale Analysis ───────────────────────────────────────────────────────────

$null = $md.AppendLine("## Stale Guest Analysis")
$null = $md.AppendLine("")
$null = $md.AppendLine("| Category | Count | % of Total |")
$null = $md.AppendLine("|----------|------:|-----------:|")
$null = $md.AppendLine("| Stale (no recent sign-in) | $($staleGuests.Count) | $stalePct% |")
$null = $md.AppendLine("| Never signed in | $($neverSignedIn.Count) | $neverPct% |")
$null = $md.AppendLine("| Stale **and** never signed in | $($staleAndNever.Count) | $staleNeverPct% |")
$null = $md.AppendLine("")

# ── Cleanup Recommendations ──────────────────────────────────────────────────

$null = $md.AppendLine("## Recommended Cleanup Actions")
$null = $md.AppendLine("")
$null = $md.AppendLine("| Action | Guests | Description |")
$null = $md.AppendLine("|--------|-------:|-------------|")
$null = $md.AppendLine("| Remove stale + never signed in | $($cleanupStaleNever.Count) | Guests that are stale and have never completed a sign-in. Safe to remove. |")
$null = $md.AppendLine("| Revoke pending invitations > 90 days | $($cleanupPendingOld.Count) | Pending invitations older than 90 days that were never accepted. |")
$null = $md.AppendLine("| **Total cleanup candidates** | **$($cleanupCandidates.Count)** | **$cleanupPct% of all TLL guests** |")
$null = $md.AppendLine("")
$null = $md.AppendLine("> Cleanup candidate details exported to ``tll-guest-cleanup-candidates.csv``.")
$null = $md.AppendLine("")
$null = $md.AppendLine("---")
$null = $md.AppendLine("*Report generated by Analyze-TLLGuests.ps1 — Cross-Tenant Utility*")

$md.ToString() | Out-File -FilePath $mdPath -Encoding utf8
Write-CTUFinding -Severity "OK" -Message "Markdown report: $mdPath"

# ═══════════════════════════════════════════════════════════════════════════════
# OUTPUT — Cleanup Candidates CSV
# ═══════════════════════════════════════════════════════════════════════════════

if ($cleanupCandidates.Count -gt 0) {
    $cleanupCandidates | Export-Csv -Path $csvPath -NoTypeInformation -Encoding utf8
} else {
    # Write header-only CSV so downstream tools don't break
    "Id,DisplayName,Mail,SourceDomain,CreatedDateTime,InvitationState,LastSignIn,DaysSinceSignIn,NeverSignedIn,CleanupReason" |
        Out-File -FilePath $csvPath -Encoding utf8
}
Write-CTUFinding -Severity "OK" -Message "Cleanup CSV:     $csvPath"

# ─── Done ────────────────────────────────────────────────────────────────────

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   Analysis Complete                                                 ║
  ║   Guests analysed:    $($totalGuests.ToString().PadRight(46))║
  ║   Cleanup candidates: $($cleanupCandidates.Count.ToString().PadRight(46))║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green
