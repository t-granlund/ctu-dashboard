<#
.SYNOPSIS
    Investigate and resolve 9 unknown tenant IDs discovered during Phase 1 audit.

.DESCRIPTION
    Phase 1 Discovery revealed 9 tenant IDs in cross-tenant access policies that
    do not belong to any known HTT Brands MTO member (HTT, BCC, FN, TLL, DCE).

    This script connects to the HTT hub tenant and, for each unknown tenant ID:
      1. Calls findTenantInformationByTenantId to resolve display name, default
         domain, and federation brand name.
      2. Queries GDAP (delegatedAdminRelationships) to check whether any
         delegated admin relationship exists for the unknown tenant.
      3. Correlates results with the Phase 1 audit risk context (which tenants
         the unknown ID was found in, policy types, special flags, priority).

    Output:
      - Colored console table: Tenant ID | Display Name | Default Domain |
        Federation Brand Name | GDAP Status
      - Colored summary: green = resolved, yellow = needs attention,
        red = critical unknowns
      - JSON report saved to reports/unknown-tenant-investigation.json

.PARAMETER ReportPath
    Optional. Override the default JSON output path.
    Defaults to reports/unknown-tenant-investigation.json relative to repo root.

.EXAMPLE
    .\Resolve-UnknownTenants.ps1
    Investigate all 9 unknown tenants and save results to the default path.

.EXAMPLE
    .\Resolve-UnknownTenants.ps1 -ReportPath "C:\Reports\unknowns.json"
    Investigate all 9 unknown tenants and save results to a custom path.

.NOTES
    Issue:   f7q
    Phase:   1.5 — Investigation (between Phase 1 Discovery and Phase 2 Quick Wins)
    Author:  code-puppy-c83a3a
    Version: 1.0.0
    Prereqs: Microsoft.Graph PowerShell SDK, CTU.Core module
#>
[CmdletBinding()]
param(
    [string]$ReportPath
)

$ErrorActionPreference = "Stop"

Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

# ── Configuration ───────────────────────────────────────────────────────────

$GraphBase = "https://graph.microsoft.com/v1.0"

if (-not $ReportPath) {
    $reportsDir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "reports"
    if (-not (Test-Path $reportsDir)) {
        New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null
    }
    $ReportPath = Join-Path $reportsDir "unknown-tenant-investigation.json"
}

# ── Unknown Tenant Registry (from Phase 1 audit) ───────────────────────────
#    Each entry carries the risk context discovered during the audit so we can
#    correlate resolution results with known exposure.

$UnknownTenants = @(
    @{
        TenantId     = "3de67d67-88e8-42c0-88ea-13bfc2fc2f55"
        FoundIn      = @("HTT", "FN", "TLL", "DCE")
        PolicyTypes  = @("B2B", "DirectConnect")
        SpecialFlags = @("isServiceProvider: true (DCE)")
        Priority     = "critical"
    }
    @{
        TenantId     = "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92"
        FoundIn      = @("HTT", "FN", "TLL")
        PolicyTypes  = @("B2B", "DirectConnect")
        SpecialFlags = @()
        Priority     = "high"
    }
    @{
        TenantId     = "248c9920-7745-4f81-8e18-1a5de9935bbd"
        FoundIn      = @("TLL")
        PolicyTypes  = @("DirectConnect")
        SpecialFlags = @("Full DC: AllUsers/AllApps inbound+outbound", "NO MFA trust")
        Priority     = "critical"
    }
    @{
        TenantId     = "ff1b2576-d461-4916-97dc-7ada1cd798dc"
        FoundIn      = @("HTT")
        PolicyTypes  = @("B2B", "DirectConnect")
        SpecialFlags = @()
        Priority     = "medium"
    }
    @{
        TenantId     = "5d9ef8ec-bf67-442a-8855-7e9f7c7199c7"
        FoundIn      = @("BCC")
        PolicyTypes  = @("B2B", "DirectConnect")
        SpecialFlags = @()
        Priority     = "medium"
    }
    @{
        TenantId     = "a27ac673-9a4c-446c-bd28-280c0bf7cf71"
        FoundIn      = @("TLL")
        PolicyTypes  = @("B2B", "DirectConnect")
        SpecialFlags = @()
        Priority     = "medium"
    }
    @{
        TenantId     = "d5c77776-8b4c-4ceb-81da-566aba9c59c5"
        FoundIn      = @("TLL")
        PolicyTypes  = @("B2B", "DirectConnect")
        SpecialFlags = @()
        Priority     = "medium"
    }
    @{
        TenantId     = "daee2992-bedc-4b96-840d-3cb1ffa89d10"
        FoundIn      = @("TLL")
        PolicyTypes  = @("B2B", "DirectConnect")
        SpecialFlags = @()
        Priority     = "medium"
    }
    @{
        TenantId     = "b4c546a4-7dac-46a6-a7dd-ed822a11efd3"
        FoundIn      = @("TLL")
        PolicyTypes  = @("B2B", "DirectConnect")
        SpecialFlags = @()
        Priority     = "medium"
    }
)

# ── Helper: Resolve a single tenant ID via Graph ───────────────────────────

function Resolve-TenantInfo {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$TenantId)

    $uri = "$GraphBase/tenantRelationships/findTenantInformationByTenantId(tenantId='$TenantId')"
    try {
        $info = Invoke-CTUGraphRequest -Uri $uri -Method GET
        return [PSCustomObject]@{
            Resolved            = $true
            DisplayName         = $info.displayName
            DefaultDomainName   = $info.defaultDomainName
            FederationBrandName = $info.federationBrandName
            TenantId            = $info.tenantId
        }
    }
    catch {
        Write-Warning "  Could not resolve tenant $TenantId`: $_"
        return [PSCustomObject]@{
            Resolved            = $false
            DisplayName         = "UNRESOLVABLE"
            DefaultDomainName   = "N/A"
            FederationBrandName = "N/A"
            TenantId            = $TenantId
        }
    }
}

# ── Helper: Check GDAP relationships for a tenant ID ──────────────────────

function Get-GDAPStatus {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$TenantId)

    $uri = "$GraphBase/tenantRelationships/delegatedAdminRelationships?`$filter=customer/tenantId eq '$TenantId'"
    try {
        $relationships = @(Invoke-CTUGraphRequest -Uri $uri -Method GET -AllPages)
        if ($relationships.Count -gt 0) {
            $statuses = ($relationships | ForEach-Object { $_.status }) | Sort-Object -Unique
            return [PSCustomObject]@{
                HasGDAP       = $true
                Count         = $relationships.Count
                Statuses      = $statuses -join ", "
                Relationships = $relationships
            }
        }
        return [PSCustomObject]@{ HasGDAP = $false; Count = 0; Statuses = "None"; Relationships = @() }
    }
    catch {
        Write-Warning "  Could not query GDAP for $TenantId`: $_"
        return [PSCustomObject]@{ HasGDAP = $false; Count = 0; Statuses = "Error"; Relationships = @() }
    }
}

# ── Helper: Format priority as colored string ──────────────────────────────

function Write-PriorityBadge {
    param([Parameter(Mandatory)][string]$Priority)

    $color = switch ($Priority) {
        "critical" { "Red" }
        "high"     { "Yellow" }
        "medium"   { "DarkYellow" }
        default    { "Gray" }
    }
    Write-Host "  [$($Priority.ToUpper())]" -ForegroundColor $color -NoNewline
}

# ── Banner ──────────────────────────────────────────────────────────────────

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Unknown Tenant Investigation                        ║
  ║   Phase 1.5: Resolve 9 Unknown Tenant IDs from Audit               ║
  ║   Version: 1.0.0                                                    ║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# ── Connect to HTT hub tenant ──────────────────────────────────────────────

Write-CTUSection "Connecting to HTT Hub Tenant"
Connect-CTUTenant -TenantKey HTT | Out-Null

# ── Investigate each unknown tenant ────────────────────────────────────────

Write-CTUSection "Resolving $($UnknownTenants.Count) Unknown Tenant IDs"

$results = @()

foreach ($entry in $UnknownTenants) {
    $tid = $entry.TenantId
    Write-Host "`n  Investigating: $tid" -ForegroundColor White
    Write-PriorityBadge -Priority $entry.Priority
    Write-Host " Found in: $($entry.FoundIn -join ', ')" -ForegroundColor DarkGray

    # Resolve tenant identity
    $tenantInfo = Resolve-TenantInfo -TenantId $tid

    if ($tenantInfo.Resolved) {
        Write-CTUFinding -Severity "OK" -Message "Resolved: $($tenantInfo.DisplayName) ($($tenantInfo.DefaultDomainName))"
    }
    else {
        Write-CTUFinding -Severity "HIGH" -Message "Could not resolve tenant identity"
    }

    # Check GDAP relationships
    $gdapStatus = Get-GDAPStatus -TenantId $tid

    if ($gdapStatus.HasGDAP) {
        Write-CTUFinding -Severity "INFO" -Message "GDAP: $($gdapStatus.Count) relationship(s) — $($gdapStatus.Statuses)"
    }
    else {
        Write-CTUFinding -Severity "INFO" -Message "GDAP: No delegated admin relationships found"
    }

    # Show special flags if any
    if ($entry.SpecialFlags.Count -gt 0) {
        foreach ($flag in $entry.SpecialFlags) {
            Write-CTUFinding -Severity "MEDIUM" -Message "Flag: $flag"
        }
    }

    $results += [PSCustomObject]@{
        TenantId            = $tid
        DisplayName         = $tenantInfo.DisplayName
        DefaultDomainName   = $tenantInfo.DefaultDomainName
        FederationBrandName = $tenantInfo.FederationBrandName
        Resolved            = $tenantInfo.Resolved
        GDAPStatus          = if ($gdapStatus.HasGDAP) { "Active ($($gdapStatus.Count))" } else { "None" }
        GDAPStatuses        = $gdapStatus.Statuses
        GDAPRelationships   = $gdapStatus.Relationships
        FoundIn             = $entry.FoundIn
        PolicyTypes         = $entry.PolicyTypes
        SpecialFlags        = $entry.SpecialFlags
        Priority            = $entry.Priority
        InvestigatedAt      = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    }
}

# ── Console Results Table ──────────────────────────────────────────────────

Write-CTUSection "Investigation Results"

$headerFmt = "  {0,-38} {1,-30} {2,-30} {3,-25} {4,-15}"
$rowFmt    = "  {0,-38} {1,-30} {2,-30} {3,-25} {4,-15}"

Write-Host ""
Write-Host ($headerFmt -f "Tenant ID", "Display Name", "Default Domain", "Federation Brand", "GDAP Status") -ForegroundColor White
Write-Host ("  " + ("-" * 138)) -ForegroundColor DarkGray

foreach ($r in $results) {
    $color = switch ($r.Priority) {
        "critical" { "Red" }
        "high"     { "Yellow" }
        "medium"   { "Cyan" }
        default    { "Gray" }
    }

    # Truncate long values to fit the table
    $displayName = if ($r.DisplayName.Length -gt 28) { $r.DisplayName.Substring(0, 25) + "..." } else { $r.DisplayName }
    $domain      = if ($r.DefaultDomainName.Length -gt 28) { $r.DefaultDomainName.Substring(0, 25) + "..." } else { $r.DefaultDomainName }
    $brand       = if ($r.FederationBrandName.Length -gt 23) { $r.FederationBrandName.Substring(0, 20) + "..." } else { $r.FederationBrandName }

    Write-Host ($rowFmt -f $r.TenantId, $displayName, $domain, $brand, $r.GDAPStatus) -ForegroundColor $color
}

Write-Host ""

# ── Save JSON Report ───────────────────────────────────────────────────────

Write-CTUSection "Saving Report"

$report = [ordered]@{
    _metadata = [ordered]@{
        generatedAt   = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        generatedBy   = "Resolve-UnknownTenants.ps1 v1.0.0"
        agentId       = "code-puppy-c83a3a"
        issue         = "f7q"
        source        = "Phase 1 Audit — unknown tenant IDs from cross-tenant access policies"
        totalTenants  = $results.Count
        resolvedCount = ($results | Where-Object { $_.Resolved }).Count
        unresolvedCount = ($results | Where-Object { -not $_.Resolved }).Count
    }
    results = $results
}

$report | ConvertTo-Json -Depth 20 | Out-File $ReportPath -Encoding utf8
Write-CTUFinding -Severity "OK" -Message "Report saved: $ReportPath"

# ── Colored Summary ────────────────────────────────────────────────────────

Write-CTUSection "Summary"

$resolved   = @($results | Where-Object { $_.Resolved })
$unresolved = @($results | Where-Object { -not $_.Resolved })
$critical   = @($results | Where-Object { $_.Priority -eq "critical" })
$withGDAP   = @($results | Where-Object { $_.GDAPStatus -ne "None" })

Write-Host ""
Write-Host "  ========================================" -ForegroundColor White
Write-Host "  UNKNOWN TENANT INVESTIGATION COMPLETE"    -ForegroundColor White
Write-Host "  ========================================" -ForegroundColor White
Write-Host ""

# Green: resolved tenants
if ($resolved.Count -gt 0) {
    Write-Host "  Resolved ($($resolved.Count)/$($results.Count)):" -ForegroundColor Green
    foreach ($r in $resolved) {
        Write-Host "    ✓ $($r.TenantId) → $($r.DisplayName)" -ForegroundColor Green
    }
    Write-Host ""
}

# Red: critical priority tenants
if ($critical.Count -gt 0) {
    Write-Host "  Critical Priority ($($critical.Count)):" -ForegroundColor Red
    foreach ($r in $critical) {
        $flags = if ($r.SpecialFlags.Count -gt 0) { " — $($r.SpecialFlags -join '; ')" } else { "" }
        Write-Host "    ✗ $($r.TenantId) | $($r.DisplayName) | Found in: $($r.FoundIn -join ',')$flags" -ForegroundColor Red
    }
    Write-Host ""
}

# Yellow: needs attention (unresolved or has GDAP)
$needsAttention = @($results | Where-Object { (-not $_.Resolved) -or ($_.GDAPStatus -ne "None") -or ($_.SpecialFlags.Count -gt 0) })
if ($needsAttention.Count -gt 0) {
    Write-Host "  Needs Attention ($($needsAttention.Count)):" -ForegroundColor Yellow
    foreach ($r in $needsAttention) {
        $reasons = @()
        if (-not $r.Resolved)           { $reasons += "unresolved" }
        if ($r.GDAPStatus -ne "None")   { $reasons += "has GDAP" }
        if ($r.SpecialFlags.Count -gt 0) { $reasons += "flagged" }
        Write-Host "    ! $($r.TenantId) | $($r.DisplayName) — $($reasons -join ', ')" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Unresolved (red)
if ($unresolved.Count -gt 0) {
    Write-Host "  Unresolved ($($unresolved.Count)):" -ForegroundColor Red
    foreach ($r in $unresolved) {
        Write-Host "    ✗ $($r.TenantId) — Could not resolve via Graph API" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "  Report: $ReportPath" -ForegroundColor DarkGray
Write-Host "  ========================================" -ForegroundColor White
Write-Host ""

# ── Cleanup ─────────────────────────────────────────────────────────────────

try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
