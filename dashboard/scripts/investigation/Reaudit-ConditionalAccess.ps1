<#
.SYNOPSIS
    Re-audit Conditional Access policies on DCE and FN tenants.

.DESCRIPTION
    Post-call action item #3 from Tyler × Megan call (April 10, 2026).
    Megan confirmed that Conditional Access policies are already deployed
    on DCE and FN — our Phase 1 audit data was stale.

    This script re-runs Domain 5 (Conditional Access) against DCE and FN
    to capture the current state and update our findings.

    Wrapper around Invoke-DomainAudit.ps1 with pre-configured parameters.

.PARAMETER TenantKeys
    Which tenants to re-audit. Defaults to DCE and FN.

.PARAMETER IncludeB2B
    Also re-audit Domain 2 (B2B Collaboration) and Domain 3 (B2B Direct Connect)
    for a more complete picture.

.EXAMPLE
    ./Reaudit-ConditionalAccess.ps1
    # Re-audits CA on DCE and FN only.

.EXAMPLE
    ./Reaudit-ConditionalAccess.ps1 -IncludeB2B
    # Re-audits CA + B2B Collab + B2B Direct Connect on DCE and FN.

.EXAMPLE
    ./Reaudit-ConditionalAccess.ps1 -TenantKeys DCE
    # Re-audits CA on DCE only.

.NOTES
    Author   : Tyler Granlund / CTU Automation
    Version  : 1.0.0
    Call Ref : Tyler × Megan, April 10 2026 — Action Item #3
    Requires : Microsoft.Graph PowerShell SDK, CTU.Core, CTU.ConditionalAccess modules
#>
[CmdletBinding()]
param(
    [ValidateSet('HTT', 'BCC', 'FN', 'TLL', 'DCE')]
    [string[]]$TenantKeys = @('DCE', 'FN'),

    [switch]$IncludeB2B
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$auditScript = Join-Path $repoRoot 'scripts' 'Invoke-DomainAudit.ps1'

# ── Banner ───────────────────────────────────────────────────────────────────

Write-Host ''
Write-Host '  ╔══════════════════════════════════════════════════════════════╗' -ForegroundColor Cyan
Write-Host '  ║         Conditional Access Re-Audit                         ║' -ForegroundColor Cyan
Write-Host '  ║         Post-Call Action Item #3                            ║' -ForegroundColor Cyan
Write-Host '  ╚══════════════════════════════════════════════════════════════╝' -ForegroundColor Cyan
Write-Host ''
Write-Host "  Tenants: $($TenantKeys -join ', ')" -ForegroundColor Yellow
Write-Host "  Reason:  Megan confirmed CA already deployed on these tenants." -ForegroundColor DarkGray
Write-Host "           Our Phase 1 data was stale — re-auditing to update findings." -ForegroundColor DarkGray
Write-Host ''

# ── Determine domains to audit ───────────────────────────────────────────────

$domains = @('ConditionalAccess')
if ($IncludeB2B) {
    $domains += 'B2BCollaboration'
    $domains += 'B2BDirectConnect'
    Write-Host '  Including B2B domains in re-audit.' -ForegroundColor DarkGray
}

Write-Host "  Domains: $($domains -join ', ')" -ForegroundColor Cyan
Write-Host ''

# ── Run the audit ────────────────────────────────────────────────────────────

$startTime = Get-Date

foreach ($tenant in $TenantKeys) {
    Write-Host "  ── Auditing $tenant ──" -ForegroundColor Cyan
    try {
        & $auditScript -Domain $domains -TenantKey $tenant -ErrorAction Stop
        Write-Host "    ✓ $tenant audit complete" -ForegroundColor Green
    }
    catch {
        Write-Host "    ✗ $tenant audit failed: $_" -ForegroundColor Red
    }
    Write-Host ''
}

$elapsed = (Get-Date) - $startTime

# ── Summary ──────────────────────────────────────────────────────────────────

Write-Host ''
Write-Host "  ✅ Re-audit complete ($([math]::Round($elapsed.TotalSeconds, 1))s)" -ForegroundColor Green
Write-Host ''
Write-Host '  Next steps:' -ForegroundColor DarkGray
Write-Host '    1. Review the updated findings in reports/' -ForegroundColor DarkGray
Write-Host '    2. Compare against Phase 1 baseline — are CA gaps now resolved?' -ForegroundColor DarkGray
Write-Host '    3. Update dashboard data if DCE/FN are now compliant' -ForegroundColor DarkGray
Write-Host '    4. Update Phase 2 QW6 scope (if DCE/FN already have MFA CA, skip them)' -ForegroundColor DarkGray
Write-Host ''
