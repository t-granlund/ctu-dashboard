<#
.SYNOPSIS
    CTU.B2BDirectConnect - Audits B2B direct connect configurations
    (shared channels in Teams) for inbound/outbound settings.
#>

function Invoke-CTUB2BDirectConnectAudit {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$TenantKey,
        [Parameter(Mandatory)][PSCustomObject]$ReportContext,
        [Parameter()][PSCustomObject]$Config
    )

    if (-not $Config) { $Config = Get-CTUConfig }
    $domain = "B2BDirectConnect"

    Write-Host "`n--- B2B Direct Connect Audit: $TenantKey ---" -ForegroundColor Magenta

    $auditData = [PSCustomObject]@{
        TenantKey             = $TenantKey
        DefaultInbound        = $null
        DefaultOutbound       = $null
        PartnerDirectConnect  = @()
    }

    try {
        $default = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/default"
        $auditData.DefaultInbound = $default.b2bDirectConnectInbound
        $auditData.DefaultOutbound = $default.b2bDirectConnectOutbound

        # Default direct connect inbound
        $dcInbound = $default.b2bDirectConnectInbound
        if ($dcInbound -and $dcInbound.usersAndGroups.accessType -eq 'allowed') {
            $allUsers = $dcInbound.usersAndGroups.targets | Where-Object { $_.target -eq 'AllUsers' }
            if ($allUsers) {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Critical' -Title "Default B2B Direct Connect inbound allows ALL external users" `
                    -Description "ANY external tenant's users can access shared channels in this tenant via B2B direct connect. Direct connect users have no guest object and are harder to audit." `
                    -Recommendation "Block default direct connect inbound. Enable only for specific MTO partner tenants." `
                    -RemediationPhase "Phase 3"
            }
        }

        # Default direct connect outbound
        $dcOutbound = $default.b2bDirectConnectOutbound
        if ($dcOutbound -and $dcOutbound.usersAndGroups.accessType -eq 'allowed') {
            $allUsers = $dcOutbound.usersAndGroups.targets | Where-Object { $_.target -eq 'AllUsers' }
            if ($allUsers) {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Medium' -Title "Default B2B Direct Connect outbound allows ALL users" `
                    -Description "Any user in this tenant can participate in shared channels hosted by ANY external organization." `
                    -Recommendation "Restrict to MTO partner tenants only." `
                    -RemediationPhase "Phase 3"
            }
        }
    }
    catch {
        Write-Warning "[CTU] Failed to read default direct connect settings for $TenantKey : $_"
    }

    # Partner-specific direct connect
    try {
        $partners = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners" -AllPages
        $allTenants = @($Config.hub) + @($Config.spokes)
        $knownTenantIds = $Config.allTenantIds

        foreach ($partner in $partners) {
            $isKnown = $partner.tenantId -in $knownTenantIds
            $label = if ($isKnown) {
                ($allTenants | Where-Object { $_.tenantId -eq $partner.tenantId }).displayName
            } else { $partner.tenantId }

            $dcInfo = [PSCustomObject]@{
                TenantId  = $partner.tenantId
                Label     = $label
                IsKnown   = $isKnown
                Inbound   = $partner.b2bDirectConnectInbound
                Outbound  = $partner.b2bDirectConnectOutbound
            }
            $auditData.PartnerDirectConnect += $dcInfo

            # Check if MFA trust is enabled (required for direct connect)
            if ($partner.b2bDirectConnectInbound -and
                $partner.b2bDirectConnectInbound.usersAndGroups.accessType -eq 'allowed') {

                $mfaTrust = $partner.inboundTrust.isMfaAccepted
                if (-not $mfaTrust) {
                    Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                        -Severity 'High' -Title "Direct connect enabled without MFA trust for $label" `
                        -Description "B2B direct connect is enabled inbound from $label but MFA trust is NOT configured. Direct connect users CANNOT perform MFA in the resource tenant - they will be blocked by any CA policy requiring MFA." `
                        -Recommendation "Enable inboundTrust.isMfaAccepted for this partner." `
                        -RemediationPhase "Phase 3"
                }

                # Check application scope
                $apps = $partner.b2bDirectConnectInbound.applications.targets
                $allApps = $apps | Where-Object { $_.target -eq 'AllApplications' }
                if ($allApps) {
                    Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                        -Severity 'Medium' -Title "Direct connect from $label scoped to ALL applications" `
                        -Description "B2B direct connect from $label is allowed for all applications. Typically only Office365 (Teams shared channels) is needed." `
                        -Recommendation "Scope direct connect to 'Office365' application only." `
                        -RemediationPhase "Phase 3"
                }
            }
        }
    }
    catch {
        Write-Warning "[CTU] Failed to read partner direct connect settings for $TenantKey : $_"
    }

    Save-CTUTenantData -ReportContext $ReportContext -TenantKey $TenantKey -Domain $domain -Data $auditData
    return $auditData
}

Export-ModuleMember -Function 'Invoke-CTUB2BDirectConnectAudit'
