<#
.SYNOPSIS
    Apply the deny-by-default cross-tenant access baseline and configure
    partner-specific overrides for HTT MTO member tenants.

.DESCRIPTION
    Phase 3 Remediation script — safety-hardened per ADR-001 findings.

    EXECUTION ORDER (safety-critical — per ADR-001 ARCH-01):
      Phase A: Creates/updates PARTNER-SPECIFIC override policies FIRST
      Phase B: VERIFIES all partner overrides exist via API re-query
      Phase C: Applies DEFAULT deny-by-default policy ONLY after verification

    If any partner override fails to create or verify, the default deny is
    ABORTED to prevent a partially-hardened state where brand tenants lose
    all cross-tenant access with no overrides in place.

    Before any PATCH/POST call, the current policy state is auto-saved to
    reports/snapshots/ for emergency rollback (ARCH-04).

    IMPORTANT: This script makes CHANGES to production configuration.
    Always run Phase 1 Discovery first to understand current state.
    Use -WhatIf to preview changes without applying them.

.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases (e.g., "TLL", "BCC").

.PARAMETER HubOnly
    Only connect to and modify the HTT hub tenant. Mutually exclusive
    with -SpokesOnly. (ARCH-02)

.PARAMETER SpokesOnly
    Only connect to spoke tenants (BCC, FN, TLL, DCE). Mutually exclusive
    with -HubOnly. Emits a warning that spoke tenants also need partner
    overrides for the HTT hub for bidirectional access. (ARCH-02)

.PARAMETER SkipDefaultPolicy
    Skip updating the default policy (only create/update partner overrides).

.PARAMETER SkipPartnerConfigs
    Skip creating/updating partner configs (only update default policy).
    The verification gate (Phase B) still runs — existing partner overrides
    must be present or the default deny is aborted.

.PARAMETER Force
    Skip the interactive confirmation prompt. Required for non-interactive
    execution (CI pipelines, Azure Automation, scheduled tasks). (CODE-02)

.PARAMETER StopOnFirstError
    Break the tenant loop on any failure instead of continuing to the next
    tenant. Default: per-tenant failure isolation (log + continue). (CODE-03)

.PARAMETER WhatIf
    Preview changes without applying them. Captures before/after state
    for each policy change and reports NO_CHANGE when current state
    already matches the target. (CODE-04)

.EXAMPLE
    .\Set-DenyByDefault.ps1 -WhatIf
    Preview all changes across all tenants with before/after diffs.

.EXAMPLE
    .\Set-DenyByDefault.ps1 -HubOnly -Force
    Apply changes to HTT hub tenant only, skip confirmation.

.EXAMPLE
    .\Set-DenyByDefault.ps1 -SpokesOnly -SkipDefaultPolicy -WhatIf
    Preview partner override creation on spoke tenants only.

.EXAMPLE
    .\Set-DenyByDefault.ps1 -TenantFilter "DCE" -Force
    Pilot on Delta Crown only (lowest risk partner per Phase 3 roadmap).

.NOTES
    ADR-001 fixes applied:
      ARCH-01  Reversed execution order (overrides FIRST, default deny SECOND)
      ARCH-02  Added -HubOnly/-SpokesOnly with spoke-side awareness warnings
      ARCH-04  Auto-saves policy snapshot before any mutation
      CODE-02  Replaced Read-Host with ShouldContinue + -Force parameter
      CODE-03  Added -StopOnFirstError for fail-fast across tenant loop
      CODE-04  Before/after state capture with NO_CHANGE idempotency detection
      CODE-05  Changed identity sync PUT to PATCH (preserves existing config)
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [string[]]$TenantFilter,
    [switch]$HubOnly,
    [switch]$SpokesOnly,
    [switch]$SkipDefaultPolicy,
    [switch]$SkipPartnerConfigs,
    [switch]$Force,
    [switch]$StopOnFirstError
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

$config   = Get-CTUConfig
$baseline = Get-CTUBaseline

$GraphBase = "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy"

# ── Helper Functions ────────────────────────────────────────────────────────

function Save-PolicySnapshot {
    <# Save current policy state to reports/snapshots/ before any mutation. #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$TenantAlias,
        [Parameter(Mandatory)][string]$PolicyType,
        [Parameter(Mandatory)]$PolicyData
    )
    $snapshotDir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "reports" "snapshots"
    if (-not (Test-Path $snapshotDir)) {
        New-Item -ItemType Directory -Path $snapshotDir -Force | Out-Null
    }
    $ts       = Get-Date -Format "yyyy-MM-dd_HHmmss"
    $fileName = "${TenantAlias}_${PolicyType}_${ts}.json"
    $filePath = Join-Path $snapshotDir $fileName
    $PolicyData | ConvertTo-Json -Depth 15 | Out-File $filePath -Encoding utf8
    Write-Verbose "[Snapshot] $filePath"
    return $filePath
}

function Get-SafeGraphResponse {
    <# GET a Graph resource, returning $null on 404 instead of throwing. #>
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

function Test-DefaultPolicyDenied {
    <# Returns $true if the default policy already matches deny-by-default. #>
    param($Policy)
    if (-not $Policy) { return $false }
    return (
        $Policy.b2bCollaborationInbound.usersAndGroups.accessType  -eq 'blocked' -and
        $Policy.b2bCollaborationOutbound.usersAndGroups.accessType -eq 'blocked' -and
        $Policy.b2bDirectConnectInbound.usersAndGroups.accessType  -eq 'blocked' -and
        $Policy.b2bDirectConnectOutbound.usersAndGroups.accessType -eq 'blocked' -and
        $Policy.inboundTrust.isMfaAccepted -eq $false
    )
}

function Test-PartnerOverrideActive {
    <# Returns $true if a partner policy exists with allow + MFA trust. #>
    param($Policy)
    if (-not $Policy) { return $false }
    return (
        $Policy.b2bCollaborationInbound.usersAndGroups.accessType -eq 'allowed' -and
        $Policy.inboundTrust.isMfaAccepted -eq $true
    )
}

function Resolve-PartnerAlias {
    <# Resolve a tenant GUID to its human-readable alias from config. #>
    param([Parameter(Mandatory)][string]$TenantId)
    $spoke = $config.spokes | Where-Object { $_.tenantId -eq $TenantId }
    if ($spoke)                                  { return $spoke.alias }
    if ($TenantId -eq $config.hub.tenantId)      { return "HTT" }
    return $TenantId.Substring(0, 8)
}

# ── Validate Parameters ────────────────────────────────────────────────────

if ($HubOnly -and $SpokesOnly) {
    throw "-HubOnly and -SpokesOnly are mutually exclusive. Pick one."
}

# ── Banner ──────────────────────────────────────────────────────────────────

$scopeLabel = if ($HubOnly) { "HUB ONLY" } elseif ($SpokesOnly) { "SPOKES ONLY" } else { "ALL TENANTS" }

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Cross-Tenant Access Remediation                     ║
  ║   Phase 3: Deny-by-Default + Partner Overrides                     ║
  ║   Mode: $(if ($WhatIfPreference) { "PREVIEW (WhatIf)".PadRight(56) } else { "LIVE — CHANGES WILL BE APPLIED".PadRight(56) })║
  ║   Scope: $($scopeLabel.PadRight(55))║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $(if ($WhatIfPreference) { "Yellow" } else { "Red" })

# ── Confirmation (CODE-02: ShouldContinue replaces Read-Host) ───────────────

if (-not $WhatIfPreference -and -not $Force) {
    $confirmMsg     = "This will modify cross-tenant access policies in $scopeLabel mode."
    $confirmCaption = "Phase 3: Deny-by-Default Remediation"
    if (-not $PSCmdlet.ShouldContinue($confirmMsg, $confirmCaption)) {
        Write-Host "  Aborted by user." -ForegroundColor Yellow
        return
    }
}

# ── Resolve Tenant Scope (ARCH-02) ─────────────────────────────────────────

$targetTenants = Get-CTUTenantList -Config $config
if ($HubOnly)      { $targetTenants = $targetTenants | Where-Object { $_.roleNormalized -eq 'hub' } }
if ($SpokesOnly)   { $targetTenants = $targetTenants | Where-Object { $_.roleNormalized -eq 'spoke' } }
if ($TenantFilter) { $targetTenants = $targetTenants | Where-Object { $_.Key -in $TenantFilter } }

if (-not $targetTenants -or @($targetTenants).Count -eq 0) {
    Write-Warning "No tenants matched the specified filters. Nothing to do."
    return
}

Write-Host "  Target tenants: $(($targetTenants | ForEach-Object { $_.Key }) -join ', ')" -ForegroundColor Cyan

# ── Main Execution Loop (CODE-03: custom loop for StopOnFirstError) ─────────

$allResults     = @{}
$abortExecution = $false

foreach ($tenant in $targetTenants) {
    if ($abortExecution) {
        Write-Warning "Execution halted (-StopOnFirstError). Skipping $($tenant.Key)."
        break
    }

    Write-Host "`n== $($tenant.displayName) ($($tenant.Key)) | $($tenant.tenantId) ==" -ForegroundColor Yellow

    $tenantResult = [ordered]@{
        TenantAlias         = $tenant.Key
        TenantId            = $tenant.tenantId
        Role                = $tenant.roleNormalized
        PartnerOverrides    = @()
        DefaultPolicyChange = $null
        Changes             = @()
        Errors              = @()
        Mode                = if ($WhatIfPreference) { "WhatIf" } else { "Applied" }
    }

    try {
        Connect-CTUTenant -TenantKey $tenant.Key -Config $config | Out-Null

        $currentTenantId = $tenant.tenantId
        $isSpoke         = ($tenant.roleNormalized -eq 'spoke')
        $hubTenantId     = $config.hub.tenantId

        # ── Spoke-Side Awareness (ARCH-02) ──────────────────────────────────

        if ($isSpoke) {
            Write-CTUSection "Spoke-Side Awareness: $($tenant.Key)"
            Write-CTUFinding -Severity "INFO" `
                -Message "This is a SPOKE tenant. Bidirectional access requires:"
            Write-CTUFinding -Severity "INFO" `
                -Message "  1. Partner override for HTT hub ($hubTenantId) on THIS tenant"
            Write-CTUFinding -Severity "INFO" `
                -Message "  2. Partner override for THIS tenant on the HTT hub"
            Write-CTUFinding -Severity "INFO" `
                -Message "  Verify hub-side overrides separately with -HubOnly"

            $hubOverride = Get-SafeGraphResponse `
                -Uri "$GraphBase/partners/$hubTenantId" `
                -Label "hub override on $($tenant.Key)"

            if (-not $hubOverride) {
                Write-CTUFinding -Severity "HIGH" `
                    -Message "No partner override for HTT hub exists on $($tenant.Key) — hub access may break after default deny"
            }
            elseif (Test-PartnerOverrideActive $hubOverride) {
                Write-CTUFinding -Severity "OK" `
                    -Message "Hub partner override exists and is active on $($tenant.Key)"
            }
            else {
                Write-CTUFinding -Severity "MEDIUM" `
                    -Message "Hub partner override exists but may not be fully configured on $($tenant.Key)"
            }
        }

        # ── Capture Before State (CODE-04) ──────────────────────────────────

        Write-CTUSection "Capturing Current State (Before)"

        $beforeDefault  = Get-SafeGraphResponse -Uri "$GraphBase/default" -Label "default policy"
        $beforePartners = @{}
        $partnerIds     = $config.allTenantIds | Where-Object { $_ -ne $currentTenantId }

        foreach ($pid in $partnerIds) {
            $beforePartners[$pid] = Get-SafeGraphResponse `
                -Uri "$GraphBase/partners/$pid" -Label "partner $(Resolve-PartnerAlias $pid)"
        }

        Write-CTUFinding -Severity "INFO" `
            -Message "Captured default policy + $($beforePartners.Count) partner policies"

        # ════════════════════════════════════════════════════════════════════
        #  PHASE A — Partner-Specific Overrides  (FIRST per ARCH-01)
        # ════════════════════════════════════════════════════════════════════

        $partnerOverrideFailed = $false

        if (-not $SkipPartnerConfigs) {
            Write-CTUSection "Phase A: Partner-Specific Overrides (FIRST — safety-critical ordering)"

            foreach ($partnerId in $partnerIds) {
                $alias = Resolve-PartnerAlias $partnerId

                Write-Host "  Configuring partner: $alias ($partnerId)" -ForegroundColor Cyan

                $partnerBody = @{
                    tenantId                 = $partnerId
                    b2bCollaborationInbound  = @{
                        usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers";        targetType = "user" }) }
                        applications   = @{ accessType = "allowed"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
                    }
                    b2bCollaborationOutbound = @{
                        usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers";        targetType = "user" }) }
                        applications   = @{ accessType = "allowed"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
                    }
                    b2bDirectConnectInbound  = @{
                        usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers";  targetType = "user" }) }
                        applications   = @{ accessType = "allowed"; targets = @(@{ target = "Office365"; targetType = "application" }) }
                    }
                    b2bDirectConnectOutbound = @{
                        usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers";  targetType = "user" }) }
                        applications   = @{ accessType = "allowed"; targets = @(@{ target = "Office365"; targetType = "application" }) }
                    }
                    inboundTrust             = @{
                        isMfaAccepted                       = $true
                        isCompliantDeviceAccepted           = $true
                        isHybridAzureADJoinedDeviceAccepted = $true
                    }
                    automaticUserConsentSettings = @{
                        inboundAllowed  = $true
                        outboundAllowed = $true
                    }
                }

                $beforePartner = $beforePartners[$partnerId]
                $alreadyActive = Test-PartnerOverrideActive $beforePartner

                # CODE-04: before/after diff object
                $diff = @{
                    PartnerId    = $partnerId
                    PartnerAlias = $alias
                    Before       = $beforePartner
                    After        = $partnerBody
                    WouldChange  = (-not $alreadyActive)
                }

                if ($alreadyActive) {
                    Write-CTUFinding -Severity "OK" `
                        -Message "  Partner $alias already configured — NO_CHANGE"
                    $diff.Action = "NO_CHANGE"
                    $tenantResult.PartnerOverrides += $diff
                    continue
                }

                if ($WhatIfPreference) {
                    Write-CTUFinding -Severity "INFO" `
                        -Message "  WOULD CREATE/UPDATE partner config for $alias"
                    Write-CTUFinding -Severity "INFO" `
                        -Message "  -> B2B collab: allowed | Direct connect: allowed | MFA trust: enabled"
                    $diff.Action = "WOULD_CREATE_OR_UPDATE"
                    $tenantResult.PartnerOverrides += $diff
                    continue
                }

                # ── Live mode: snapshot before mutation (ARCH-04) ───────────

                if ($beforePartner) {
                    Save-PolicySnapshot -TenantAlias $tenant.Key `
                        -PolicyType "partner_${alias}" -PolicyData $beforePartner
                }

                try {
                    # PATCH existing partner policy
                    Invoke-MgGraphRequest -Method PATCH `
                        -Uri "$GraphBase/partners/$partnerId" `
                        -Body ($partnerBody | ConvertTo-Json -Depth 10) `
                        -ContentType "application/json"
                    Write-CTUFinding -Severity "OK" `
                        -Message "  Updated existing partner config for $alias"
                    $diff.Action = "UPDATED"
                }
                catch {
                    if ($_.Exception.Message -match "404|NotFound") {
                        # Partner policy doesn't exist yet — create it
                        try {
                            Invoke-MgGraphRequest -Method POST `
                                -Uri "$GraphBase/partners" `
                                -Body ($partnerBody | ConvertTo-Json -Depth 10) `
                                -ContentType "application/json"
                            Write-CTUFinding -Severity "OK" `
                                -Message "  Created new partner config for $alias"
                            $diff.Action = "CREATED"
                        }
                        catch {
                            Write-CTUFinding -Severity "CRITICAL" `
                                -Message "  FAILED to create partner override for ${alias}: $_"
                            $diff.Action              = "FAILED"
                            $partnerOverrideFailed     = $true
                            $tenantResult.Errors      += "Failed to create partner override: $alias"
                        }
                    }
                    else {
                        Write-CTUFinding -Severity "CRITICAL" `
                            -Message "  FAILED to update partner override for ${alias}: $_"
                        $diff.Action              = "FAILED"
                        $partnerOverrideFailed     = $true
                        $tenantResult.Errors      += "Failed to update partner override: $alias"
                    }
                }

                # ── Identity sync (CODE-05: PATCH not PUT) ──────────────────

                if ($diff.Action -in @("CREATED", "UPDATED")) {
                    $syncBody = @{ userSyncInbound = @{ isSyncAllowed = $true } }
                    try {
                        # PATCH preserves existing sync properties (CODE-05)
                        Invoke-MgGraphRequest -Method PATCH `
                            -Uri "$GraphBase/partners/$partnerId/identitySynchronization" `
                            -Body ($syncBody | ConvertTo-Json -Depth 5) `
                            -ContentType "application/json"
                        Write-CTUFinding -Severity "OK" `
                            -Message "  Identity sync enabled for $alias (PATCH)"
                    }
                    catch {
                        if ($_.Exception.Message -match "404|NotFound") {
                            # First-time creation requires PUT
                            try {
                                Invoke-MgGraphRequest -Method PUT `
                                    -Uri "$GraphBase/partners/$partnerId/identitySynchronization" `
                                    -Body ($syncBody | ConvertTo-Json -Depth 5) `
                                    -ContentType "application/json"
                                Write-CTUFinding -Severity "OK" `
                                    -Message "  Identity sync created for $alias (PUT — initial creation)"
                            }
                            catch {
                                Write-Verbose "  Could not create identity sync for ${alias}: $_"
                            }
                        }
                        else {
                            Write-Verbose "  Could not set identity sync for ${alias}: $_"
                        }
                    }

                    $tenantResult.Changes += "Partner $alias`: $($diff.Action)"
                }

                $tenantResult.PartnerOverrides += $diff
            }
        }

        # ════════════════════════════════════════════════════════════════════
        #  PHASE B — Verify Partner Overrides  (ARCH-01 verification gate)
        # ════════════════════════════════════════════════════════════════════

        $abortDefaultDeny = $false

        if (-not $SkipDefaultPolicy) {
            Write-CTUSection "Phase B: Verifying Partner Overrides Before Default Deny"

            if ($WhatIfPreference) {
                Write-CTUFinding -Severity "INFO" `
                    -Message "In live mode, all partner overrides would be re-queried and verified here"
            }
            else {
                $allVerified = $true

                foreach ($partnerId in $partnerIds) {
                    $alias    = Resolve-PartnerAlias $partnerId
                    $verified = Get-SafeGraphResponse `
                        -Uri "$GraphBase/partners/$partnerId" -Label "verify $alias"

                    if (Test-PartnerOverrideActive $verified) {
                        Write-CTUFinding -Severity "OK" `
                            -Message "  Verified: $alias override is active"
                    }
                    else {
                        Write-CTUFinding -Severity "CRITICAL" `
                            -Message "  FAILED: $alias override missing or inactive"
                        $allVerified = $false
                    }
                }

                if (-not $allVerified -or $partnerOverrideFailed) {
                    Write-CTUFinding -Severity "CRITICAL" `
                        -Message "ABORTING default deny — partner overrides not fully verified"
                    Write-CTUFinding -Severity "CRITICAL" `
                        -Message "Fix partner overrides first, then re-run with -SkipPartnerConfigs"
                    $abortDefaultDeny       = $true
                    $tenantResult.Errors    += "Default deny ABORTED: partner override verification failed"
                }
                else {
                    Write-CTUFinding -Severity "OK" `
                        -Message "All $($partnerIds.Count) partner overrides verified — safe to proceed"
                }
            }
        }

        # ════════════════════════════════════════════════════════════════════
        #  PHASE C — Default Deny  (SECOND — only after overrides verified)
        # ════════════════════════════════════════════════════════════════════

        if (-not $SkipDefaultPolicy -and -not $abortDefaultDeny) {
            Write-CTUSection "Phase C: Default Cross-Tenant Access Policy -> Deny-by-Default"

            $defaultBody = @{
                b2bCollaborationInbound  = @{
                    usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers";        targetType = "user" }) }
                    applications   = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
                }
                b2bCollaborationOutbound = @{
                    usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers";        targetType = "user" }) }
                    applications   = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
                }
                b2bDirectConnectInbound  = @{
                    usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers";        targetType = "user" }) }
                    applications   = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
                }
                b2bDirectConnectOutbound = @{
                    usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers";        targetType = "user" }) }
                    applications   = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
                }
                inboundTrust = @{
                    isMfaAccepted                       = $false
                    isCompliantDeviceAccepted           = $false
                    isHybridAzureADJoinedDeviceAccepted = $false
                }
            }

            # CODE-04: before/after + idempotency
            $alreadyDenied = Test-DefaultPolicyDenied $beforeDefault
            $defaultDiff   = @{
                Before      = $beforeDefault
                After       = $defaultBody
                WouldChange = (-not $alreadyDenied)
            }

            if ($alreadyDenied) {
                Write-CTUFinding -Severity "OK" `
                    -Message "Default policy already deny-by-default — NO_CHANGE"
                $defaultDiff.Action = "NO_CHANGE"
            }
            elseif ($WhatIfPreference) {
                Write-CTUFinding -Severity "INFO" `
                    -Message "WOULD SET default policy to deny all inbound/outbound B2B collab + direct connect"
                $defaultDiff.Action = "WOULD_APPLY"
            }
            else {
                # ARCH-04: snapshot before mutation
                if ($beforeDefault) {
                    Save-PolicySnapshot -TenantAlias $tenant.Key `
                        -PolicyType "default" -PolicyData $beforeDefault
                }

                try {
                    Invoke-MgGraphRequest -Method PATCH `
                        -Uri "$GraphBase/default" `
                        -Body ($defaultBody | ConvertTo-Json -Depth 10) `
                        -ContentType "application/json"
                    Write-CTUFinding -Severity "OK" `
                        -Message "Default policy updated to deny-by-default"
                    $defaultDiff.Action    = "APPLIED"
                    $tenantResult.Changes += "Default policy set to deny-by-default"
                }
                catch {
                    Write-CTUFinding -Severity "CRITICAL" `
                        -Message "Failed to update default policy: $_"
                    $defaultDiff.Action    = "FAILED"
                    $tenantResult.Errors  += "Failed to update default policy: $_"
                }
            }

            $tenantResult.DefaultPolicyChange = $defaultDiff
        }

        $allResults[$tenant.Key] = [PSCustomObject]$tenantResult
    }
    catch {
        Write-Warning "Error processing $($tenant.Key): $_"
        $tenantResult.Errors += $_.Exception.Message
        $allResults[$tenant.Key] = [PSCustomObject]$tenantResult

        if ($StopOnFirstError) {
            Write-CTUFinding -Severity "CRITICAL" `
                -Message "StopOnFirstError: Halting after $($tenant.Key) failure"
            $abortExecution = $true
        }
    }
    finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }
}

# ── Export Results ──────────────────────────────────────────────────────────

Export-CTUReport -ReportName "RemediationLog_DenyByDefault" -Data $allResults
Write-Host "`nRemediation $(if ($WhatIfPreference) { 'preview' } else { 'execution' }) complete.`n" -ForegroundColor Magenta
