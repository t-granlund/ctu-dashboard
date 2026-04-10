<#
.SYNOPSIS
    Capture a full cross-tenant access policy snapshot for rollback safety.

.DESCRIPTION
    ADR-001 Finding ARCH-04 — Pre-remediation snapshot tool.

    Connects to one or more tenants and GETs the current cross-tenant access
    policy state (default policy + all partner-specific override policies),
    saving the result as a timestamped JSON file under reports/snapshots/.

    This snapshot serves as the authoritative "before" state for emergency
    rollback via Restore-CTUPolicySnapshot.ps1. Every remediation script
    in the CTU toolkit should either call this script or use the inline
    Save-PolicySnapshot helper before any PATCH/POST/PUT call.

    The snapshot JSON includes:
      - Full default cross-tenant access policy
      - All partner-specific override policies (array)
      - Metadata: timestamp, tenant info, operator (from Get-MgContext),
        script version, and the Graph API URIs that were queried

    Output path: reports/snapshots/{TenantAlias}_full-snapshot_{timestamp}.json

.PARAMETER TenantFilter
    Optional. One or more tenant aliases (HTT, BCC, FN, TLL, DCE) to snapshot.
    Defaults to all tenants in tenants.json.

.PARAMETER AuthMode
    Authentication mode. Interactive (default) uses delegated browser sign-in.
    AppOnly uses certificate-based app-only auth.

.PARAMETER ClientId
    Required for AppOnly auth. The CTU service principal application (client) ID.

.PARAMETER CertificateThumbprint
    Required for AppOnly auth. The certificate thumbprint for app-only token.

.PARAMETER OutputDirectory
    Optional. Override the default snapshot output directory.
    Defaults to reports/snapshots/ relative to the repository root.

.EXAMPLE
    .\Save-CTUPolicySnapshot.ps1
    Snapshot all 5 tenants interactively.

.EXAMPLE
    .\Save-CTUPolicySnapshot.ps1 -TenantFilter HTT -AuthMode Interactive
    Snapshot only the HTT hub tenant.

.EXAMPLE
    .\Save-CTUPolicySnapshot.ps1 -TenantFilter HTT,BCC -AuthMode AppOnly `
        -ClientId $env:CTU_CLIENT_ID -CertificateThumbprint $env:CTU_CERT_THUMBPRINT
    Snapshot HTT and BCC using certificate-based app-only auth.

.EXAMPLE
    .\Save-CTUPolicySnapshot.ps1 -TenantFilter DCE -OutputDirectory "C:\Backups\CTU"
    Snapshot Delta Crown to a custom directory (pilot rollback safety).

.NOTES
    Implements: CTU-121 (ADR-001 ARCH-04)
    Test Case:  TC-121
    Version:    1.0.0
    Author:     CTU Governance Engine
#>
[CmdletBinding()]
param(
    [ValidateSet('HTT','BCC','FN','TLL','DCE')]
    [string[]]$TenantFilter,

    [ValidateSet('Interactive','AppOnly')]
    [string]$AuthMode = 'Interactive',

    [string]$ClientId,
    [string]$CertificateThumbprint,
    [string]$OutputDirectory
)

$ErrorActionPreference = "Stop"
$ScriptVersion = "1.0.0"

Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

# ── Configuration ───────────────────────────────────────────────────────────

$config = Get-CTUConfig

$GraphBase = "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy"

if (-not $OutputDirectory) {
    $OutputDirectory = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "reports" "snapshots"
}

if (-not (Test-Path $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
}

# ── Build auth params for Connect-CTUTenant ─────────────────────────────────

$authParams = @{ AuthMode = $AuthMode }
if ($AuthMode -eq 'AppOnly') {
    if (-not $ClientId) {
        throw "ClientId is required for AppOnly authentication. Pass -ClientId or set `$env:CTU_CLIENT_ID."
    }
    if (-not $CertificateThumbprint) {
        throw "CertificateThumbprint is required for AppOnly authentication. Pass -CertificateThumbprint or set `$env:CTU_CERT_THUMBPRINT."
    }
    $authParams['ClientId'] = $ClientId
    $authParams['CertificateThumbprint'] = $CertificateThumbprint
}

# ── Banner ──────────────────────────────────────────────────────────────────

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Cross-Tenant Policy Snapshot                        ║
  ║   ADR-001 ARCH-04: Pre-Remediation State Capture                   ║
  ║   Version: $($ScriptVersion.PadRight(56))║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# ── Resolve Target Tenants ──────────────────────────────────────────────────

$targetTenants = Get-CTUTenantList -Config $config
if ($TenantFilter) {
    $targetTenants = $targetTenants | Where-Object { $_.Key -in $TenantFilter }
}

if (-not $targetTenants -or @($targetTenants).Count -eq 0) {
    Write-Warning "No tenants matched the specified filters. Nothing to snapshot."
    return
}

Write-Host "  Target tenants: $(($targetTenants | ForEach-Object { $_.Key }) -join ', ')" -ForegroundColor Cyan
Write-Host "  Output dir:     $OutputDirectory" -ForegroundColor DarkGray
Write-Host ""

# ── Snapshot Loop ───────────────────────────────────────────────────────────

$snapshotPaths = @()
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"

foreach ($tenant in $targetTenants) {
    Write-Host "`n== $($tenant.displayName) ($($tenant.Key)) | $($tenant.tenantId) ==" -ForegroundColor Yellow

    try {
        Connect-CTUTenant -TenantKey $tenant.Key -Config $config @authParams | Out-Null

        # ── Capture operator info ───────────────────────────────────────
        $ctx = Get-MgContext
        $operator = if ($ctx.Account) { $ctx.Account } else { "AppOnly ($($ctx.AppName))" }

        Write-CTUSection "Capturing Default Policy"

        $defaultPolicy = Invoke-CTUGraphRequest -Uri "$GraphBase/default"
        if ($defaultPolicy) {
            Write-CTUFinding -Severity "OK" -Message "Default policy captured"
        }
        else {
            Write-CTUFinding -Severity "HIGH" -Message "Default policy returned empty — snapshot may be incomplete"
        }

        Write-CTUSection "Capturing Partner Policies"

        $partnerPolicies = @()
        try {
            $partnerPolicies = @(Invoke-CTUGraphRequest -Uri "$GraphBase/partners" -AllPages)
            Write-CTUFinding -Severity "OK" -Message "Captured $($partnerPolicies.Count) partner policies"
        }
        catch {
            if ($_.Exception.Message -match "404|NotFound") {
                Write-CTUFinding -Severity "INFO" -Message "No partner policies found (empty)"
            }
            else {
                Write-CTUFinding -Severity "HIGH" -Message "Failed to read partner policies: $_"
            }
        }

        # ── Assemble snapshot object ────────────────────────────────────

        $snapshot = [ordered]@{
            '_metadata' = [ordered]@{
                schemaVersion = "1.0"
                scriptVersion = $ScriptVersion
                capturedAt    = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
                operator      = $operator
                tenantAlias   = $tenant.Key
                tenantId      = $tenant.tenantId
                displayName   = $tenant.displayName
                primaryDomain = $tenant.primaryDomain
                role          = $tenant.roleNormalized
                graphUris     = @(
                    "$GraphBase/default",
                    "$GraphBase/partners"
                )
                purpose       = "ADR-001 ARCH-04 — Pre-remediation rollback snapshot"
            }
            defaultPolicy   = $defaultPolicy
            partnerPolicies = $partnerPolicies
        }

        # ── Compute SHA256 integrity hash over data portion ───────────
        #    F-02: Hash covers defaultPolicy + partnerPolicies only.
        #    _metadata is excluded so the hash doesn't reference itself.

        $dataForHash = [ordered]@{
            defaultPolicy   = $snapshot.defaultPolicy
            partnerPolicies = $snapshot.partnerPolicies
        }
        $dataJson    = $dataForHash | ConvertTo-Json -Depth 20
        $sha256      = [System.Security.Cryptography.SHA256]::Create()
        $hashBytes   = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($dataJson))
        $contentHash = [BitConverter]::ToString($hashBytes) -replace '-', ''
        $sha256.Dispose()

        $snapshot._metadata['contentHash'] = $contentHash
        Write-CTUFinding -Severity "OK" -Message "Integrity hash (SHA256): $contentHash"

        # ── Write to disk ───────────────────────────────────────────────

        $fileName = "$($tenant.Key)_full-snapshot_${timestamp}.json"
        $filePath = Join-Path $OutputDirectory $fileName

        $snapshot | ConvertTo-Json -Depth 20 | Out-File $filePath -Encoding utf8

        Write-CTUFinding -Severity "OK" -Message "Snapshot saved: $filePath"
        $snapshotPaths += $filePath
    }
    catch {
        Write-CTUFinding -Severity "CRITICAL" -Message "Failed to snapshot $($tenant.Key): $_"
    }
    finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }
}

# ── Summary ─────────────────────────────────────────────────────────────────

Write-Host "`n========================================" -ForegroundColor White
Write-Host "  SNAPSHOT COMPLETE" -ForegroundColor Green
Write-Host "  Snapshots saved: $($snapshotPaths.Count) / $(@($targetTenants).Count)" -ForegroundColor White
foreach ($path in $snapshotPaths) {
    Write-Host "    $path" -ForegroundColor DarkGray
}
Write-Host "========================================`n" -ForegroundColor White

# Return paths for scripted consumption (pipe-friendly)
return $snapshotPaths
