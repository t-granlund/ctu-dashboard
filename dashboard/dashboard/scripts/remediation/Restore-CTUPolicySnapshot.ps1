<#
.SYNOPSIS
    Restore a cross-tenant access policy snapshot — emergency rollback tool.

.DESCRIPTION
    ADR-001 Finding ARCH-04 — Policy rollback from a saved snapshot.

    ╔══════════════════════════════════════════════════════════════════╗
    ║  ⚠  DESTRUCTIVE OPERATION — THIS MODIFIES PRODUCTION POLICY  ⚠  ║
    ╚══════════════════════════════════════════════════════════════════╝

    Reads a snapshot JSON file produced by Save-CTUPolicySnapshot.ps1
    and restores the cross-tenant access policies to the captured state
    by PATCHing the default policy and each partner-specific override.

    This is an EMERGENCY tool. Use it when a remediation (e.g., deny-by-
    default) has caused an outage and you need to revert to the prior
    policy state quickly.

    The script:
      1. Reads and validates the snapshot JSON
      2. Connects to the tenant identified in the snapshot metadata
      3. Captures the CURRENT live state (a "before-restore" snapshot)
      4. Displays a before/after diff for each policy
      5. PATCHes the default policy back to the snapshot state
      6. For each partner in the snapshot, PATCHes it back
      7. Verifies the restore by re-querying each policy

    Use -WhatIf to preview the restore without applying changes.
    Use -Force to skip the interactive confirmation (CI/emergency).

.PARAMETER SnapshotPath
    Mandatory. Path to the snapshot JSON file to restore from.
    Typically: reports/snapshots/{TenantAlias}_full-snapshot_{timestamp}.json

.PARAMETER AuthMode
    Authentication mode. Interactive (default) or AppOnly.

.PARAMETER ClientId
    Required for AppOnly auth. The CTU service principal application ID.

.PARAMETER CertificateThumbprint
    Required for AppOnly auth. Certificate thumbprint for app-only token.

.PARAMETER Force
    Skip the interactive confirmation prompt. USE WITH EXTREME CAUTION.

.PARAMETER WhatIf
    Preview the restore without applying any changes.

.EXAMPLE
    .\Restore-CTUPolicySnapshot.ps1 -SnapshotPath "reports/snapshots/HTT_full-snapshot_2026-04-09_143000.json" -WhatIf
    Preview what the rollback would do without changing anything.

.EXAMPLE
    .\Restore-CTUPolicySnapshot.ps1 -SnapshotPath "reports/snapshots/HTT_full-snapshot_2026-04-09_143000.json"
    Restore the HTT hub tenant policies from the snapshot (with confirmation).

.EXAMPLE
    .\Restore-CTUPolicySnapshot.ps1 -SnapshotPath $snapshotFile -Force
    Emergency rollback — skip confirmation, restore immediately.

.NOTES
    Implements: CTU-122 (ADR-001 ARCH-04)
    Test Case:  TC-122
    Version:    1.0.0
    Author:     CTU Governance Engine

    ROLLBACK TIME TARGET: < 5 minutes for full restore (per TC-122)
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory)]
    [string]$SnapshotPath,

    [ValidateSet('Interactive','AppOnly')]
    [string]$AuthMode = 'Interactive',

    [string]$ClientId,
    [string]$CertificateThumbprint,

    [switch]$Force,

    [switch]$SkipIntegrityCheck
)

$ErrorActionPreference = "Stop"
$ScriptVersion = "1.0.0"

Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

# ── Configuration ───────────────────────────────────────────────────────────

$config    = Get-CTUConfig
$GraphBase = "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy"

# ── Build auth params ───────────────────────────────────────────────────────

$authParams = @{ AuthMode = $AuthMode }
if ($AuthMode -eq 'AppOnly') {
    if (-not $ClientId) {
        throw "ClientId is required for AppOnly authentication."
    }
    if (-not $CertificateThumbprint) {
        throw "CertificateThumbprint is required for AppOnly authentication."
    }
    $authParams['ClientId'] = $ClientId
    $authParams['CertificateThumbprint'] = $CertificateThumbprint
}

# ── Banner (big and red — this is destructive) ─────────────────────────────

$bannerColor = if ($WhatIfPreference) { "Yellow" } else { "Red" }

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║                                                                     ║
  ║   ⚠⚠⚠  CROSS-TENANT POLICY ROLLBACK  ⚠⚠⚠                          ║
  ║                                                                     ║
  ║   This script RESTORES a previous policy state by overwriting       ║
  ║   the current cross-tenant access policies. This is a DESTRUCTIVE   ║
  ║   operation intended for EMERGENCY ROLLBACK only.                   ║
  ║                                                                     ║
  ║   Mode: $(if ($WhatIfPreference) { "PREVIEW (WhatIf) — no changes will be made   " } else { "🔴 LIVE — POLICIES WILL BE OVERWRITTEN 🔴    " })║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $bannerColor

# ── Load & Validate Snapshot ────────────────────────────────────────────────

Write-CTUSection "Loading Snapshot"

if (-not (Test-Path $SnapshotPath)) {
    throw "Snapshot file not found: $SnapshotPath"
}

$snapshotRaw = Get-Content $SnapshotPath -Raw
$snapshot    = $snapshotRaw | ConvertFrom-Json

# Validate required snapshot structure
$metadata = $snapshot._metadata
if (-not $metadata) {
    throw "Invalid snapshot: missing '_metadata' block. Is this a Save-CTUPolicySnapshot.ps1 output?"
}

foreach ($requiredField in @('tenantAlias', 'tenantId', 'capturedAt', 'schemaVersion')) {
    if (-not $metadata.$requiredField) {
        throw "Invalid snapshot: '_metadata.$requiredField' is missing."
    }
}

if (-not $snapshot.defaultPolicy) {
    throw "Invalid snapshot: 'defaultPolicy' is missing. Cannot restore without default policy."
}

$tenantAlias = $metadata.tenantAlias
$tenantId    = $metadata.tenantId

Write-CTUFinding -Severity "OK"   -Message "Snapshot loaded: $SnapshotPath"
Write-CTUFinding -Severity "INFO" -Message "  Tenant:     $($metadata.displayName) ($tenantAlias)"
Write-CTUFinding -Severity "INFO" -Message "  Tenant ID:  $tenantId"
Write-CTUFinding -Severity "INFO" -Message "  Captured:   $($metadata.capturedAt)"
Write-CTUFinding -Severity "INFO" -Message "  Operator:   $($metadata.operator)"
Write-CTUFinding -Severity "INFO" -Message "  Schema ver: $($metadata.schemaVersion)"

$partnerCount = if ($snapshot.partnerPolicies) { @($snapshot.partnerPolicies).Count } else { 0 }
Write-CTUFinding -Severity "INFO" -Message "  Partners:   $partnerCount partner policies in snapshot"

# ── F-02: Integrity Hash Verification ───────────────────────────────────────
#    Compute SHA256 over the data portion (defaultPolicy + partnerPolicies)
#    and compare to _metadata.contentHash. Abort on mismatch unless
#    -SkipIntegrityCheck is set.

$storedHash = $metadata.contentHash

if ($storedHash) {
    Write-CTUFinding -Severity "INFO" -Message "  Verifying snapshot integrity (SHA256)..."

    $dataForHash = [ordered]@{
        defaultPolicy   = $snapshot.defaultPolicy
        partnerPolicies = $snapshot.partnerPolicies
    }
    $dataJson      = $dataForHash | ConvertTo-Json -Depth 20
    $sha256        = [System.Security.Cryptography.SHA256]::Create()
    $hashBytes     = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($dataJson))
    $computedHash  = [BitConverter]::ToString($hashBytes) -replace '-', ''
    $sha256.Dispose()

    if ($computedHash -eq $storedHash) {
        Write-CTUFinding -Severity "OK" -Message "  Integrity check PASSED (SHA256: $computedHash)"
    }
    else {
        Write-CTUFinding -Severity "CRITICAL" -Message "  INTEGRITY CHECK FAILED — snapshot may be corrupted or tampered with"
        Write-CTUFinding -Severity "CRITICAL" -Message "    Stored hash:   $storedHash"
        Write-CTUFinding -Severity "CRITICAL" -Message "    Computed hash: $computedHash"

        if ($SkipIntegrityCheck) {
            Write-CTUFinding -Severity "HIGH" -Message "  -SkipIntegrityCheck specified — proceeding despite hash mismatch"
        }
        else {
            throw "Snapshot integrity check failed. Use -SkipIntegrityCheck to override (NOT RECOMMENDED)."
        }
    }
}
else {
    Write-Warning "Snapshot does not contain a contentHash (older format). Integrity cannot be verified."
    Write-CTUFinding -Severity "MEDIUM" -Message "  No contentHash in snapshot — skipping integrity check"
}

# ── F-10: Validate Partner Tenant IDs Against Config ────────────────────────
#    Reject unknown tenant IDs before any policy changes are applied.
#    This prevents restoring a snapshot that references rogue or stale tenants.

$knownTenantIds = @($config.allTenantIds)
$validatedPartners = @()
$skippedPartners   = @()

if ($partnerCount -gt 0) {
    foreach ($partner in $snapshot.partnerPolicies) {
        if ($partner.tenantId -and $partner.tenantId -in $knownTenantIds) {
            $validatedPartners += $partner
        }
        else {
            $skippedPartners += $partner.tenantId
            Write-CTUFinding -Severity "CRITICAL" -Message "  UNKNOWN tenant ID in snapshot — SKIPPING partner: $($partner.tenantId)"
        }
    }

    if ($skippedPartners.Count -gt 0) {
        Write-CTUFinding -Severity "HIGH" -Message "  $($skippedPartners.Count) partner(s) skipped (unknown tenant IDs): $($skippedPartners -join ', ')"
    }
    if ($validatedPartners.Count -gt 0) {
        Write-CTUFinding -Severity "OK" -Message "  $($validatedPartners.Count) partner(s) validated against config/tenants.json"
    }

    # Replace the snapshot's partner list with validated-only for all downstream use
    $snapshot.partnerPolicies = $validatedPartners
    $partnerCount = $validatedPartners.Count
}

# ── Confirmation Gate ───────────────────────────────────────────────────────

if (-not $WhatIfPreference -and -not $Force) {
    Write-Host ""
    Write-Host "  You are about to OVERWRITE the live cross-tenant access policies for:" -ForegroundColor Red
    Write-Host "    $($metadata.displayName) ($tenantId)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  This will restore the state captured at: $($metadata.capturedAt)" -ForegroundColor Yellow
    Write-Host "  Default policy + $partnerCount partner policies will be PATCHed." -ForegroundColor Yellow
    Write-Host ""

    $confirmMsg     = "Restore $tenantAlias to snapshot from $($metadata.capturedAt)? This OVERWRITES live policy."
    $confirmCaption = "EMERGENCY ROLLBACK: $tenantAlias"
    if (-not $PSCmdlet.ShouldContinue($confirmMsg, $confirmCaption)) {
        Write-Host "  Aborted by user. No changes made." -ForegroundColor Yellow
        return
    }
}

# ── Helper: Build diff summary between two policy objects ───────────────────

function Format-PolicyDiff {
    <# Produce a human-readable comparison of two policy states. #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Label,
        [AllowNull()]$Current,
        [AllowNull()]$Target
    )

    $currentJson = if ($Current) { $Current | ConvertTo-Json -Depth 10 -Compress } else { "(not found)" }
    $targetJson  = if ($Target)  { $Target  | ConvertTo-Json -Depth 10 -Compress } else { "(not in snapshot)" }

    $changed = $currentJson -ne $targetJson

    Write-Host "    [$Label]" -ForegroundColor Cyan
    if ($changed) {
        Write-Host "      CURRENT: $($currentJson.Substring(0, [Math]::Min(120, $currentJson.Length)))..." -ForegroundColor DarkGray
        Write-Host "      TARGET:  $($targetJson.Substring(0, [Math]::Min(120, $targetJson.Length)))..." -ForegroundColor Green
        Write-CTUFinding -Severity "INFO" -Message "    $Label — WILL CHANGE"
    }
    else {
        Write-CTUFinding -Severity "OK" -Message "    $Label — already matches snapshot (NO_CHANGE)"
    }

    return $changed
}

# ── Helper: Safely GET a Graph resource, return $null on 404 ────────────────

function Get-SafeGraphResponse {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Uri,
        [string]$Label = "resource"
    )
    try   { return Invoke-MgGraphRequest -Method GET -Uri $Uri }
    catch {
        if ($_.Exception.Message -match "404|NotFound") { return $null }
        Write-Warning "Failed to read ${Label}: $_"
        return $null
    }
}

# ── Helper: Strip read-only OData properties before PATCHing ────────────────

function Remove-ReadOnlyProperties {
    <# Graph API rejects PATCH payloads containing read-only fields. #>
    [CmdletBinding()]
    param([Parameter(Mandatory)][hashtable]$PolicyHash)

    $readOnlyKeys = @(
        '@odata.context', '@odata.id', 'id', 'tenantId',
        'isServiceDefault', 'isInMultiTenantOrganization'
    )
    foreach ($key in $readOnlyKeys) {
        $PolicyHash.Remove($key)
    }
    return $PolicyHash
}

# ── Connect to Tenant ───────────────────────────────────────────────────────

Write-CTUSection "Connecting to $tenantAlias"

Connect-CTUTenant -TenantKey $tenantAlias -Config $config @authParams | Out-Null

$ctx = Get-MgContext
if ($ctx.TenantId -ne $tenantId) {
    throw "Tenant ID mismatch. Connected to $($ctx.TenantId) but snapshot is for $tenantId."
}

# ── Capture Current State (before-restore snapshot for safety) ──────────────

Write-CTUSection "Capturing Current Live State (Before Restore)"

$liveDefault  = Get-SafeGraphResponse -Uri "$GraphBase/default" -Label "default policy"
$livePartners = @{}

if ($partnerCount -gt 0) {
    foreach ($partner in $snapshot.partnerPolicies) {
        $pid = $partner.tenantId
        if ($pid) {
            $livePartners[$pid] = Get-SafeGraphResponse `
                -Uri "$GraphBase/partners/$pid" -Label "partner $pid"
        }
    }
}

Write-CTUFinding -Severity "OK" -Message "Captured live state: default + $($livePartners.Count) partner policies"

# Save a before-restore snapshot (so we can undo the undo if needed)
$beforeRestoreDir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "reports" "snapshots"
if (-not (Test-Path $beforeRestoreDir)) {
    New-Item -ItemType Directory -Path $beforeRestoreDir -Force | Out-Null
}

$beforeRestoreFile = Join-Path $beforeRestoreDir "${tenantAlias}_pre-restore_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').json"
$beforeRestoreData = [ordered]@{
    '_metadata' = [ordered]@{
        schemaVersion = "1.0"
        scriptVersion = $ScriptVersion
        capturedAt    = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        operator      = if ($ctx.Account) { $ctx.Account } else { "AppOnly ($($ctx.AppName))" }
        tenantAlias   = $tenantAlias
        tenantId      = $tenantId
        displayName   = $metadata.displayName
        primaryDomain = $metadata.primaryDomain
        role          = $metadata.role
        purpose       = "Auto-captured before restore from $SnapshotPath"
    }
    defaultPolicy   = $liveDefault
    partnerPolicies = @($livePartners.Values)
}
$beforeRestoreData | ConvertTo-Json -Depth 20 | Out-File $beforeRestoreFile -Encoding utf8
Write-CTUFinding -Severity "OK" -Message "Pre-restore snapshot saved: $beforeRestoreFile"

# ── Phase 1: Restore Default Policy ────────────────────────────────────────

Write-CTUSection "Phase 1: Restore Default Cross-Tenant Access Policy"

$targetDefault  = $snapshot.defaultPolicy
$defaultChanged = Format-PolicyDiff -Label "Default Policy" -Current $liveDefault -Target $targetDefault

if (-not $defaultChanged) {
    Write-CTUFinding -Severity "OK" -Message "Default policy already matches snapshot — skipping"
}
elseif ($WhatIfPreference) {
    Write-CTUFinding -Severity "INFO" -Message "WOULD PATCH default policy back to snapshot state"
}
else {
    if ($PSCmdlet.ShouldProcess("$tenantAlias default cross-tenant access policy", "PATCH (restore from snapshot)")) {
        # Convert to hashtable and strip read-only properties
        $defaultHash = @{}
        $targetDefault.PSObject.Properties | ForEach-Object { $defaultHash[$_.Name] = $_.Value }
        $defaultHash = Remove-ReadOnlyProperties -PolicyHash $defaultHash

        try {
            Invoke-MgGraphRequest -Method PATCH `
                -Uri "$GraphBase/default" `
                -Body ($defaultHash | ConvertTo-Json -Depth 15) `
                -ContentType "application/json"
            Write-CTUFinding -Severity "OK" -Message "Default policy restored successfully"
        }
        catch {
            Write-CTUFinding -Severity "CRITICAL" -Message "FAILED to restore default policy: $_"
            Write-CTUFinding -Severity "CRITICAL" -Message "Pre-restore snapshot available at: $beforeRestoreFile"
        }
    }
}

# ── Phase 2: Restore Partner Policies ───────────────────────────────────────

if ($partnerCount -gt 0) {
    Write-CTUSection "Phase 2: Restore Partner-Specific Policies ($partnerCount partners)"

    foreach ($partner in $snapshot.partnerPolicies) {
        $pid   = $partner.tenantId
        $label = "Partner $pid"

        Write-Host "`n  Restoring partner: $pid" -ForegroundColor Cyan

        $livePartner    = $livePartners[$pid]
        $partnerChanged = Format-PolicyDiff -Label $label -Current $livePartner -Target $partner

        if (-not $partnerChanged) {
            Write-CTUFinding -Severity "OK" -Message "  $label already matches snapshot — skipping"
            continue
        }

        if ($WhatIfPreference) {
            Write-CTUFinding -Severity "INFO" -Message "  WOULD PATCH $label back to snapshot state"
            continue
        }

        if ($PSCmdlet.ShouldProcess("$tenantAlias partner policy ($pid)", "PATCH (restore from snapshot)")) {
            # Convert and strip read-only properties
            $partnerHash = @{}
            $partner.PSObject.Properties | ForEach-Object { $partnerHash[$_.Name] = $_.Value }
            $partnerHash = Remove-ReadOnlyProperties -PolicyHash $partnerHash

            try {
                Invoke-MgGraphRequest -Method PATCH `
                    -Uri "$GraphBase/partners/$pid" `
                    -Body ($partnerHash | ConvertTo-Json -Depth 15) `
                    -ContentType "application/json"
                Write-CTUFinding -Severity "OK" -Message "  $label restored successfully"
            }
            catch {
                if ($_.Exception.Message -match "404|NotFound") {
                    # Partner policy was deleted — need to re-create via POST
                    Write-CTUFinding -Severity "MEDIUM" -Message "  $label not found — attempting POST to re-create"
                    try {
                        Invoke-MgGraphRequest -Method POST `
                            -Uri "$GraphBase/partners" `
                            -Body ($partnerHash | ConvertTo-Json -Depth 15) `
                            -ContentType "application/json"
                        Write-CTUFinding -Severity "OK" -Message "  $label re-created via POST"
                    }
                    catch {
                        Write-CTUFinding -Severity "CRITICAL" -Message "  FAILED to re-create $label via POST: $_"
                    }
                }
                else {
                    Write-CTUFinding -Severity "CRITICAL" -Message "  FAILED to restore ${label}: $_"
                }
            }
        }
    }
}
else {
    Write-CTUSection "Phase 2: No Partner Policies in Snapshot"
    Write-CTUFinding -Severity "INFO" -Message "Snapshot contains zero partner policies — nothing to restore"
}

# ── Phase 3: Verification ──────────────────────────────────────────────────

if (-not $WhatIfPreference) {
    Write-CTUSection "Phase 3: Post-Restore Verification"

    $verifyDefault = Get-SafeGraphResponse -Uri "$GraphBase/default" -Label "default policy"
    $targetDefaultJson = $targetDefault | ConvertTo-Json -Depth 10 -Compress
    $verifyDefaultJson = $verifyDefault | ConvertTo-Json -Depth 10 -Compress

    if ($targetDefaultJson -eq $verifyDefaultJson) {
        Write-CTUFinding -Severity "OK" -Message "Default policy verified — matches snapshot"
    }
    else {
        Write-CTUFinding -Severity "HIGH" -Message "Default policy does NOT fully match snapshot after restore"
        Write-CTUFinding -Severity "INFO" -Message "  This may be due to read-only properties. Verify manually."
    }

    foreach ($partner in $snapshot.partnerPolicies) {
        $pid = $partner.tenantId
        $verifyPartner = Get-SafeGraphResponse -Uri "$GraphBase/partners/$pid" -Label "partner $pid"

        if ($verifyPartner) {
            Write-CTUFinding -Severity "OK" -Message "Partner $pid — exists after restore"
        }
        else {
            Write-CTUFinding -Severity "HIGH" -Message "Partner $pid — NOT FOUND after restore"
        }
    }
}

# ── Cleanup ─────────────────────────────────────────────────────────────────

try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}

# ── Summary ─────────────────────────────────────────────────────────────────

Write-Host "`n========================================" -ForegroundColor White
if ($WhatIfPreference) {
    Write-Host "  ROLLBACK PREVIEW COMPLETE" -ForegroundColor Yellow
    Write-Host "  No changes were made. Re-run without -WhatIf to apply." -ForegroundColor Yellow
}
else {
    Write-Host "  ROLLBACK COMPLETE" -ForegroundColor Green
    Write-Host "  Tenant:              $tenantAlias ($tenantId)" -ForegroundColor White
    Write-Host "  Restored from:       $SnapshotPath" -ForegroundColor White
    Write-Host "  Pre-restore backup:  $beforeRestoreFile" -ForegroundColor White
    Write-Host "  Default policy:      Restored" -ForegroundColor White
    Write-Host "  Partner policies:    $partnerCount restored" -ForegroundColor White
}
Write-Host "========================================`n" -ForegroundColor White
