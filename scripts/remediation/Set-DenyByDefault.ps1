<#
.SYNOPSIS
    Apply the deny-by-default cross-tenant access baseline and configure
    partner-specific overrides for HTT MTO member tenants.
.DESCRIPTION
    Phase 3 Remediation script. For each target tenant:
      1. Sets the DEFAULT cross-tenant access policy to block all inbound/outbound
         B2B collaboration and B2B direct connect
      2. Creates or updates PARTNER-SPECIFIC policies for each fellow HTT tenant
         with: B2B collab allowed, B2B direct connect allowed, MFA trust,
         device trust, automatic invitation redemption, identity sync enabled
    
    IMPORTANT: This script makes CHANGES to production configuration.
    Always run Phase 1 Discovery first to understand current state.
    Use -WhatIf to preview changes without applying them.
.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases.
.PARAMETER WhatIf
    Preview changes without applying them.
.PARAMETER SkipDefaultPolicy
    Skip updating the default policy (only update partner configs).
.PARAMETER SkipPartnerConfigs
    Skip updating partner configs (only update default policy).
.EXAMPLE
    .\Set-DenyByDefault.ps1 -WhatIf
.EXAMPLE
    .\Set-DenyByDefault.ps1 -TenantFilter "TLL"
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [string[]]$TenantFilter,
    [switch]$SkipDefaultPolicy,
    [switch]$SkipPartnerConfigs
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

$config   = Get-CTUConfig
$baseline = Get-CTUBaseline

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Cross-Tenant Access Remediation                     ║
  ║   Phase 3: Deny-by-Default + Partner Overrides                     ║
  ║   Mode: $(if ($WhatIfPreference) { "PREVIEW (WhatIf)".PadRight(56) } else { "LIVE — CHANGES WILL BE APPLIED".PadRight(56) })║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $(if ($WhatIfPreference) { "Yellow" } else { "Red" })

if (-not $WhatIfPreference) {
    Write-Host "  WARNING: This script will modify cross-tenant access policies." -ForegroundColor Red
    Write-Host "  Press ENTER to continue or Ctrl+C to abort..." -ForegroundColor Yellow
    Read-Host
}

$auditResults = Connect-CTUAllTenants -TenantFilter $TenantFilter -Config $config -ScriptBlock {
    param($Tenant)

    $changes = @()

    # ── 1. Set default cross-tenant access to deny ──────────────────────────

    if (-not $SkipDefaultPolicy) {
        Write-CTUSection "Default Cross-Tenant Access Policy → Deny-by-Default"

        $defaultBody = @{
            b2bCollaborationInbound = @{
                usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
                applications   = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
            }
            b2bCollaborationOutbound = @{
                usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
                applications   = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
            }
            b2bDirectConnectInbound = @{
                usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
                applications   = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
            }
            b2bDirectConnectOutbound = @{
                usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
                applications   = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
            }
            inboundTrust = @{
                isMfaAccepted                      = $false
                isCompliantDeviceAccepted          = $false
                isHybridAzureADJoinedDeviceAccepted = $false
            }
        }

        if ($WhatIfPreference) {
            Write-CTUFinding -Severity "INFO" -Message "WOULD SET default policy to deny all inbound/outbound B2B collab + direct connect"
        }
        else {
            try {
                Invoke-MgGraphRequest -Method PATCH `
                    -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/default" `
                    -Body ($defaultBody | ConvertTo-Json -Depth 10) `
                    -ContentType "application/json"
                Write-CTUFinding -Severity "OK" -Message "Default policy updated to deny-by-default"
                $changes += "Default policy set to deny-by-default"
            }
            catch {
                Write-CTUFinding -Severity "CRITICAL" -Message "Failed to update default policy: $_"
            }
        }
    }

    # ── 2. Configure partner-specific overrides ─────────────────────────────

    if (-not $SkipPartnerConfigs) {
        Write-CTUSection "Partner-Specific Overrides (MTO Members)"

        $currentTenantId = $Tenant.tenantId
        $partnerTenants = $config.allTenantIds | Where-Object { $_ -ne $currentTenantId }

        foreach ($partnerId in $partnerTenants) {
            $partnerAlias = ($config.spokes | Where-Object { $_.tenantId -eq $partnerId }).alias ??
                $(if ($partnerId -eq $config.hub.tenantId) { "HTT" } else { $partnerId })

            Write-Host "  Configuring partner: $partnerAlias ($partnerId)" -ForegroundColor Cyan

            $partnerBody = @{
                tenantId = $partnerId
                b2bCollaborationInbound = @{
                    usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
                    applications   = @{ accessType = "allowed"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
                }
                b2bCollaborationOutbound = @{
                    usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
                    applications   = @{ accessType = "allowed"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
                }
                b2bDirectConnectInbound = @{
                    usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
                    applications   = @{ accessType = "allowed"; targets = @(@{ target = "Office365"; targetType = "application" }) }
                }
                b2bDirectConnectOutbound = @{
                    usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
                    applications   = @{ accessType = "allowed"; targets = @(@{ target = "Office365"; targetType = "application" }) }
                }
                inboundTrust = @{
                    isMfaAccepted                      = $true
                    isCompliantDeviceAccepted          = $true
                    isHybridAzureADJoinedDeviceAccepted = $true
                }
                automaticUserConsentSettings = @{
                    inboundAllowed  = $true
                    outboundAllowed = $true
                }
            }

            if ($WhatIfPreference) {
                Write-CTUFinding -Severity "INFO" -Message "  WOULD CREATE/UPDATE partner config for $partnerAlias"
                Write-CTUFinding -Severity "INFO" -Message "  → B2B collab: allowed | Direct connect: allowed | MFA trust: enabled"
            }
            else {
                try {
                    # Try PATCH first (update existing)
                    Invoke-MgGraphRequest -Method PATCH `
                        -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners/$partnerId" `
                        -Body ($partnerBody | ConvertTo-Json -Depth 10) `
                        -ContentType "application/json"
                    Write-CTUFinding -Severity "OK" -Message "  Updated existing partner config for $partnerAlias"
                }
                catch {
                    if ($_.Exception.Message -match "404|NotFound") {
                        # Create new
                        try {
                            Invoke-MgGraphRequest -Method POST `
                                -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners" `
                                -Body ($partnerBody | ConvertTo-Json -Depth 10) `
                                -ContentType "application/json"
                            Write-CTUFinding -Severity "OK" -Message "  Created new partner config for $partnerAlias"
                        }
                        catch {
                            Write-CTUFinding -Severity "HIGH" -Message "  Failed to create partner config for $partnerAlias : $_"
                        }
                    }
                    else {
                        Write-CTUFinding -Severity "HIGH" -Message "  Failed to update partner config for $partnerAlias : $_"
                    }
                }

                # Enable identity sync for this partner
                try {
                    $syncBody = @{
                        userSyncInbound = @{ isSyncAllowed = $true }
                    }
                    Invoke-MgGraphRequest -Method PUT `
                        -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners/$partnerId/identitySynchronization" `
                        -Body ($syncBody | ConvertTo-Json -Depth 5) `
                        -ContentType "application/json"
                    Write-CTUFinding -Severity "OK" -Message "  Identity sync enabled for $partnerAlias"
                }
                catch {
                    Write-Verbose "  Could not set identity sync for $partnerAlias (may already be configured): $_"
                }

                $changes += "Partner $partnerAlias configured with full MTO access"
            }
        }
    }

    return [PSCustomObject]@{
        TenantAlias = $Tenant.Key
        Changes     = $changes
        Mode        = if ($WhatIfPreference) { "WhatIf" } else { "Applied" }
    }
}

Export-CTUReport -ReportName "RemediationLog_DenyByDefault" -Data $auditResults
Write-Host "`nRemediation $(if ($WhatIfPreference) { 'preview' } else { 'execution' }) complete.`n" -ForegroundColor Magenta
