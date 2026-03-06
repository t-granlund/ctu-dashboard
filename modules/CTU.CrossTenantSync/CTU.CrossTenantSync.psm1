<#
.SYNOPSIS
    CTU.CrossTenantSync - Audits cross-tenant synchronization configurations,
    sync jobs, attribute mappings (including userType), and provisioning status.
#>

function Invoke-CTUCrossTenantSyncAudit {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$TenantKey,
        [Parameter(Mandatory)][PSCustomObject]$ReportContext,
        [Parameter()][PSCustomObject]$Config
    )

    if (-not $Config) { $Config = Get-CTUConfig }
    $domain = "CrossTenantSync"

    Write-Host "`n--- Cross-Tenant Sync Audit: $TenantKey ---" -ForegroundColor Magenta

    $auditData = [PSCustomObject]@{
        TenantKey = $TenantKey; DefaultPolicy = $null; PartnerConfigs = @()
        SyncJobs = @(); UserTypeMappings = @(); ProvisioningLogSample = @()
    }

    # 1. Default cross-tenant access policy
    try {
        $default = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/default"
        $auditData.DefaultPolicy = $default

        if ($default.automaticUserConsentSettings.inboundAllowed) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Medium' -Title "Default inbound auto-consent enabled" `
                -Description "automaticUserConsentSettings.inboundAllowed = true applies to ALL external tenants unless overridden." `
                -Recommendation "Set default inboundAllowed to false. Enable only for specific MTO partner tenants." `
                -RemediationPhase "Phase 3"
        }
    } catch {
        Write-Warning "[CTU] Failed to read default policy for $TenantKey : $_"
        $null = $ReportContext.Errors.Add("[$TenantKey] Default policy read failed: $_")
    }

    # 2. Partner-specific configurations with identity sync
    try {
        $partners = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners" -AllPages
        $auditData.PartnerConfigs = $partners
        $knownTenantIds = ($Config.tenants.PSObject.Properties.Value | ForEach-Object { $_.tenantId })

        foreach ($partner in $partners) {
            $partnerTenantId = $partner.tenantId
            $isKnown = $partnerTenantId -in $knownTenantIds
            $partnerLabel = if ($isKnown) {
                ($Config.tenants.PSObject.Properties.Value | Where-Object { $_.tenantId -eq $partnerTenantId }).displayName
            } else { "UNKNOWN ($partnerTenantId)" }

            if (-not $isKnown) {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'High' -Title "Unknown partner tenant configured" `
                    -Description "Cross-tenant access partner policy exists for tenant $partnerTenantId which is NOT in the HTT Brands organization." `
                    -Recommendation "Investigate. If not trusted, remove the partner configuration." `
                    -RemediationPhase "Phase 2"
            }

            # Identity sync settings
            try {
                $identitySync = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners/$partnerTenantId/identitySynchronization"
                if ($identitySync.userSyncInbound.isSyncAllowed) {
                    Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                        -Severity 'Info' -Title "Inbound sync enabled from $partnerLabel" `
                        -Description "Cross-tenant identity sync is enabled inbound from $partnerLabel ($partnerTenantId)."
                }
            } catch { Write-Verbose "[CTU] No identity sync config for partner $partnerTenantId" }

            # Inbound trust
            if ($partner.inboundTrust) {
                $trust = $partner.inboundTrust
                $trustFlags = @()
                if ($trust.isMfaAccepted) { $trustFlags += "MFA" }
                if ($trust.isCompliantDeviceAccepted) { $trustFlags += "CompliantDevice" }
                if ($trust.isHybridAzureADJoinedDeviceAccepted) { $trustFlags += "HybridJoin" }

                if ($trustFlags.Count -gt 0) {
                    Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                        -Severity 'Info' -Title "Inbound trust from $partnerLabel" `
                        -Description "Trusting $($trustFlags -join ', ') claims from $partnerLabel."
                } elseif ($isKnown) {
                    Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                        -Severity 'Medium' -Title "No inbound trust from $partnerLabel" `
                        -Description "MFA trust NOT enabled for known partner. Users may face double MFA or CA blocks." `
                        -Recommendation "Enable isMfaAccepted for all MTO partner tenants." `
                        -RemediationPhase "Phase 3"
                }
            }

            # Automatic consent
            if ($partner.automaticUserConsentSettings) {
                $consent = $partner.automaticUserConsentSettings
                if ($consent.inboundAllowed -or $consent.outboundAllowed) {
                    Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                        -Severity 'Info' -Title "Auto-consent enabled for $partnerLabel" `
                        -Description "Automatic invitation redemption: Inbound=$($consent.inboundAllowed), Outbound=$($consent.outboundAllowed)."
                }
            }
        }
    } catch {
        Write-Warning "[CTU] Failed to read partner configurations for $TenantKey : $_"
        $null = $ReportContext.Errors.Add("[$TenantKey] Partner config read failed: $_")
    }

    # 3. Sync jobs and attribute mappings (especially userType)
    try {
        $syncAppId = "7f3e5c40-7943-44c0-a67c-d9aefc8c5fc9"  # Well-known Cross-Tenant Sync app ID
        $sps = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/servicePrincipals?`$filter=appId eq '$syncAppId'" -AllPages

        if (-not $sps -or $sps.Count -eq 0) {
            $sps = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/servicePrincipals?`$filter=startswith(displayName,'MTO_Sync')" -AllPages
        }

        foreach ($sp in $sps) {
            try {
                $jobs = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$($sp.id)/synchronization/jobs" -AllPages

                foreach ($job in $jobs) {
                    $jobInfo = [PSCustomObject]@{
                        ServicePrincipalId = $sp.id; ServicePrincipalName = $sp.displayName
                        JobId = $job.id; Status = $job.status.code
                        LastExecution = $job.status.lastExecution; Schedule = $job.schedule
                    }
                    $auditData.SyncJobs += $jobInfo

                    # Attribute mappings - focus on userType
                    try {
                        $schema = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$($sp.id)/synchronization/jobs/$($job.id)/schema"
                        foreach ($rule in $schema.synchronizationRules) {
                            $userMapping = $rule.objectMappings | Where-Object { $_.sourceObjectName -eq "User" }
                            if ($userMapping) {
                                $userTypeAttr = $userMapping.attributeMappings | Where-Object { $_.targetAttributeName -eq "userType" }
                                if ($userTypeAttr) {
                                    $mappingInfo = [PSCustomObject]@{
                                        JobId = $job.id; SyncRuleName = $rule.name
                                        FlowType = $userTypeAttr.flowType; MappingType = $userTypeAttr.source.type
                                        Expression = $userTypeAttr.source.expression
                                        ConstantValue = if ($userTypeAttr.source.type -eq 'Constant') { $userTypeAttr.defaultValue } else { $null }
                                        SourceAttribute = $userTypeAttr.source.name
                                    }
                                    $auditData.UserTypeMappings += $mappingInfo

                                    $isGuestMapping = ($mappingInfo.ConstantValue -eq 'Guest') -or
                                        ($mappingInfo.Expression -and $mappingInfo.Expression -match 'Guest')

                                    if ($isGuestMapping) {
                                        Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                                            -Severity 'Medium' -Title "Sync job maps userType to Guest" `
                                            -Description "Sync job $($job.id) maps userType to 'Guest'. Synced users get restricted access. Manual userType changes WILL BE OVERWRITTEN on next sync cycle (~40 min)." `
                                            -Recommendation "Update userType attribute mapping to 'Member' for corporate staff, or use a conditional expression (IIF) for mixed populations." `
                                            -RemediationPhase "Phase 3"
                                    }
                                }
                            }
                        }
                    } catch { Write-Warning "[CTU] Failed to read sync schema for job $($job.id): $_" }

                    # Sync job health
                    if ($job.status.code -eq 'Quarantine') {
                        Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                            -Severity 'Critical' -Title "Sync job in QUARANTINE" `
                            -Description "Sync job $($job.id) on '$($sp.displayName)' is quarantined. Provisioning has stopped." `
                            -Recommendation "Investigate quarantine reason immediately. Check provisioning logs." `
                            -RemediationPhase "Phase 1"
                    }
                }
            } catch { Write-Verbose "[CTU] No sync jobs on SP $($sp.id): $_" }
        }
    } catch { Write-Warning "[CTU] Failed to enumerate sync service principals for $TenantKey : $_" }

    # 4. Sample provisioning logs
    try {
        $provLogs = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/auditLogs/provisioning?`$top=50&`$orderby=activityDateTime desc"
        $auditData.ProvisioningLogSample = $provLogs
        $failures = $provLogs | Where-Object { $_.provisioningStatusInfo.status -eq 'failure' }
        if ($failures.Count -gt 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'High' -Title "$($failures.Count) provisioning failures in recent logs" `
                -Description "Found $($failures.Count) failed provisioning events. Affected users may not have correct access." `
                -Recommendation "Review provisioning logs in Entra admin center." -RemediationPhase "Phase 1"
        }
    } catch { Write-Verbose "[CTU] Provisioning logs not available for $TenantKey" }

    Save-CTUTenantData -ReportContext $ReportContext -TenantKey $TenantKey -Domain $domain -Data $auditData
    return $auditData
}

Export-ModuleMember -Function 'Invoke-CTUCrossTenantSyncAudit'
