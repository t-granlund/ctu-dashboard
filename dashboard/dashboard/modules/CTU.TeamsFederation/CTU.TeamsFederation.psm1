<#
.SYNOPSIS
    CTU.TeamsFederation - Audits Teams external access and federation settings.
    NOTE: Teams config requires MicrosoftTeams PowerShell module and interactive auth.
    Graph API does not expose these settings.
#>

function Invoke-CTUTeamsFederationAudit {
    <#
    .SYNOPSIS
        Audits Teams external access / federation settings for the currently connected Teams session.
    .NOTES
        Requires prior Connect-CTUTeams call. Cannot use app-only auth.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$TenantKey,
        [Parameter(Mandatory)][PSCustomObject]$ReportContext,
        [Parameter()][PSCustomObject]$Config
    )

    if (-not $Config) { $Config = Get-CTUConfig }
    $domain = "TeamsFederation"

    Write-Host "`n--- Teams Federation Audit: $TenantKey ---" -ForegroundColor Magenta

    $auditData = [PSCustomObject]@{
        TenantKey                  = $TenantKey
        FederationConfig           = $null
        ExternalAccessPolicies     = @()
        FederationModel            = $null  # "OpenFederation", "ExplicitAllowList", "Disabled"
        AllowedDomains             = @()
        BlockedDomains             = @()
        ConsumerAccessEnabled      = $false
        TrialTenantAccessAllowed   = $false
    }

    # 1. Tenant federation configuration
    try {
        $fedConfig = Get-CsTenantFederationConfiguration -ErrorAction Stop
        $auditData.FederationConfig = $fedConfig

        # Determine federation model
        if (-not $fedConfig.AllowFederatedUsers) {
            $auditData.FederationModel = "Disabled"
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "Teams federation is DISABLED" `
                -Description "AllowFederatedUsers is false. No external domains can chat or call into this tenant via Teams."
        }
        else {
            # Check AllowedDomains — MicrosoftTeams v7+ REST-based module
            # no longer loads the legacy .NET type AllowAllKnownDomains,
            # so we detect open federation via type name string or empty object.
            $allowedDomains = $fedConfig.AllowedDomains
            $isOpenFederation = $false
            if ($null -eq $allowedDomains) {
                $isOpenFederation = $true
            } else {
                $typeName = $allowedDomains.GetType().Name
                if ($typeName -match 'AllowAllKnownDomains') {
                    $isOpenFederation = $true
                } elseif (-not ($allowedDomains | Get-Member -Name 'AllowedDomain' -ErrorAction SilentlyContinue)) {
                    # Empty object with no AllowedDomain property = open federation
                    $isOpenFederation = $true
                }
            }

            if ($isOpenFederation) {
                $auditData.FederationModel = "OpenFederation"
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'High' -Title "Teams uses OPEN federation (AllowAllKnownDomains)" `
                    -Description "Any external organization not on the blocked list can initiate Teams chat and calls with users in this tenant. This is the most permissive configuration." `
                    -Recommendation "Switch to an explicit allow-list model with only HTT Brands tenant domains (httbrands.com, bishopsbs.com, frenchiesnails.com, thelashlounge.com, deltacrown.com) plus any required vendor domains." `
                    -RemediationPhase "Phase 3"
            }
            else {
                $auditData.FederationModel = "ExplicitAllowList"
                if ($allowedDomains.AllowedDomain) {
                    $auditData.AllowedDomains = $allowedDomains.AllowedDomain | ForEach-Object { $_.Domain }

                    # Check if all MTO domains are on the allow list
                    $mtoDomainsNeeded = @('httbrands.com', 'bishopsbs.com', 'thelashlounge.com', 'deltacrown.com')
                    # frenchiesnails.com may use ftgfrenchiesoutlook.onmicrosoft.com
                    $missing = $mtoDomainsNeeded | Where-Object { $_ -notin $auditData.AllowedDomains }

                    if ($missing.Count -gt 0) {
                        Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                            -Severity 'Medium' -Title "MTO partner domains missing from Teams allow list" `
                            -Description "Missing domains: $($missing -join ', '). Users from these tenants cannot chat/call into this tenant." `
                            -Recommendation "Add missing MTO partner domains to the Teams federation allow list." `
                            -RemediationPhase "Phase 3"
                    }

                    # Flag non-HTT domains on the allow list
                    $httDomains = $Config.trustedDomains
                    $nonHttDomains = $auditData.AllowedDomains | Where-Object { $_ -notin $httDomains }
                    if ($nonHttDomains.Count -gt 0) {
                        Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                            -Severity 'Low' -Title "Non-HTT domains on Teams allow list" `
                            -Description "External domains: $($nonHttDomains -join ', ')" `
                            -Recommendation "Verify these are legitimate vendor/partner domains that need Teams federation."
                    }
                }

                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Info' -Title "Teams uses explicit allow-list federation" `
                    -Description "Only specifically allowed domains can federate. Allowed: $(($auditData.AllowedDomains -join ', '))"
            }
        }

        # Blocked domains
        if ($fedConfig.BlockedDomains -and $fedConfig.BlockedDomains.Count -gt 0) {
            $auditData.BlockedDomains = $fedConfig.BlockedDomains | ForEach-Object { $_.Domain }
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "$($auditData.BlockedDomains.Count) domains on blocked list" `
                -Description "Blocked: $($auditData.BlockedDomains -join ', ')"
        }

        # Consumer (personal Teams) access
        $auditData.ConsumerAccessEnabled = $fedConfig.AllowTeamsConsumer
        if ($fedConfig.AllowTeamsConsumer) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Medium' -Title "Teams consumer (personal account) access enabled" `
                -Description "AllowTeamsConsumer is true. Users can communicate with personal/unmanaged Teams accounts. AllowTeamsConsumerInbound: $($fedConfig.AllowTeamsConsumerInbound)" `
                -Recommendation "Disable consumer access unless there's a specific business need (e.g., customer communication)." `
                -RemediationPhase "Phase 3"
        }

        # Trial tenant access
        $auditData.TrialTenantAccessAllowed = ($fedConfig.ExternalAccessWithTrialTenants -eq 'Allowed')
        if ($auditData.TrialTenantAccessAllowed) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Medium' -Title "Trial tenant federation allowed" `
                -Description "ExternalAccessWithTrialTenants is 'Allowed'. Users from trial/developer tenants can communicate with this tenant." `
                -Recommendation "Set to 'Blocked' to prevent federation with temporary/untrusted tenants." `
                -RemediationPhase "Phase 3"
        }
    }
    catch {
        if ($_.Exception.Message -match 'not recognized') {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "Teams PowerShell not available" `
                -Description "MicrosoftTeams module not loaded or not connected. Run Connect-CTUTeams first. Teams federation audit requires interactive authentication."
            $null = $ReportContext.Warnings.Add("[$TenantKey] Teams PowerShell not available - federation audit skipped")
        }
        else {
            Write-Warning "[CTU] Teams federation audit failed for $TenantKey : $_"
            $null = $ReportContext.Errors.Add("[$TenantKey] Teams federation failed: $_")
        }
    }

    # 2. Per-user external access policies
    try {
        $externalPolicies = Get-CsExternalAccessPolicy -ErrorAction Stop
        $auditData.ExternalAccessPolicies = $externalPolicies | ForEach-Object {
            [PSCustomObject]@{
                Identity                   = $_.Identity
                EnableFederationAccess     = $_.EnableFederationAccess
                EnableTeamsConsumerAccess   = $_.EnableTeamsConsumerAccess
                EnableAcsFederationAccess  = $_.EnableAcsFederationAccess
            }
        }

        $nonGlobalPolicies = $externalPolicies | Where-Object { $_.Identity -ne 'Global' }
        if ($nonGlobalPolicies.Count -gt 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Low' -Title "$($nonGlobalPolicies.Count) custom external access policies" `
                -Description "Per-user external access policies exist that may override the tenant default: $(($nonGlobalPolicies | ForEach-Object { $_.Identity }) -join ', ')" `
                -Recommendation "Review per-user policy assignments to ensure no users have overly permissive overrides."
        }
    }
    catch {
        Write-Verbose "[CTU] Could not enumerate external access policies for $TenantKey"
    }

    Save-CTUTenantData -ReportContext $ReportContext -TenantKey $TenantKey -Domain $domain -Data $auditData
    return $auditData
}

Export-ModuleMember -Function 'Invoke-CTUTeamsFederationAudit'
