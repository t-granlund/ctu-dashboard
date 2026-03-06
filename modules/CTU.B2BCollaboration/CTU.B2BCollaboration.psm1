<#
.SYNOPSIS
    CTU.B2BCollaboration - Audits B2B collaboration settings including guest invitation
    policies, authorization policy, and cross-tenant B2B collaboration inbound/outbound.
#>

function Invoke-CTUB2BCollaborationAudit {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$TenantKey,
        [Parameter(Mandatory)][PSCustomObject]$ReportContext,
        [Parameter()][PSCustomObject]$Config
    )

    if (-not $Config) { $Config = Get-CTUConfig }
    $domain = "B2BCollaboration"

    Write-Host "`n--- B2B Collaboration Audit: $TenantKey ---" -ForegroundColor Magenta

    $auditData = [PSCustomObject]@{
        TenantKey             = $TenantKey
        AuthorizationPolicy   = $null
        DefaultB2BInbound     = $null
        DefaultB2BOutbound    = $null
        PartnerB2BSettings    = @()
        AuthFlowsPolicy       = $null
    }

    # 1. Authorization policy - guest invitation settings
    try {
        $authPolicy = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies/authorizationPolicy"
        $auditData.AuthorizationPolicy = $authPolicy

        # Check who can invite guests
        $inviteFrom = $authPolicy.allowInvitesFrom
        switch ($inviteFrom) {
            'everyone' {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'High' -Title "Anyone can invite guests" `
                    -Description "allowInvitesFrom is set to 'everyone' - all users including existing guests can send B2B invitations." `
                    -Recommendation "Restrict to 'adminsAndGuestInviters' to control who can add external users." `
                    -RemediationPhase "Phase 2"
            }
            'adminsGuestInvitersAndAllMembers' {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Medium' -Title "All members can invite guests" `
                    -Description "allowInvitesFrom is set to 'adminsGuestInvitersAndAllMembers' - all internal users (but not guests) can send invitations." `
                    -Recommendation "Consider restricting to 'adminsAndGuestInviters' for tighter control." `
                    -RemediationPhase "Phase 2"
            }
            'adminsAndGuestInviters' {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Info' -Title "Guest invitations restricted to admins and Guest Inviters" `
                    -Description "allowInvitesFrom is set to 'adminsAndGuestInviters'. This is the recommended setting."
            }
            'none' {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Info' -Title "Guest invitations disabled" `
                    -Description "allowInvitesFrom is set to 'none'. No one can invite external guests."
            }
        }

        # Check guest role permissions
        $guestRole = $authPolicy.guestUserRoleId
        switch ($guestRole) {
            'a0b1b346-4d3e-4e8b-98f8-753987be4970' {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'High' -Title "Guests have Member-level directory access" `
                    -Description "guestUserRoleId grants Member-equivalent permissions. Guests can enumerate all users, groups, and applications." `
                    -Recommendation "Set to Restricted Guest (2af84b1e-32a8-4917-b604-6c0b5e32f4e7) for least-privilege." `
                    -RemediationPhase "Phase 2"
            }
            '10dae51f-b6af-4016-8d66-8c2a99b929b3' {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Medium' -Title "Guests have default Guest User permissions" `
                    -Description "guestUserRoleId is default Guest User. Guests can read their own profile and limited directory info." `
                    -Recommendation "Consider Restricted Guest (2af84b1e-...) for maximum restriction." `
                    -RemediationPhase "Phase 2"
            }
            '2af84b1e-32a8-4917-b604-6c0b5e32f4e7' {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Info' -Title "Guests have Restricted Guest permissions" `
                    -Description "guestUserRoleId is set to Restricted Guest. This is the most restrictive setting."
            }
        }

        # Self-service sign-up
        if ($authPolicy.allowEmailVerifiedUsersToJoinOrganization) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'High' -Title "Email-verified self-service join enabled" `
                -Description "allowEmailVerifiedUsersToJoinOrganization is true. External users can self-join the directory by verifying their email." `
                -Recommendation "Disable this unless you have a specific self-service onboarding flow." `
                -RemediationPhase "Phase 2"
        }

        # Guest app creation permissions
        $defaultPerms = $authPolicy.defaultUserRolePermissions
        if ($defaultPerms.allowedToCreateApps) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Medium' -Title "Default users can create app registrations" `
                -Description "defaultUserRolePermissions.allowedToCreateApps is true. This applies to guests with Member-level access too." `
                -Recommendation "Set to false and delegate app registration to specific roles." `
                -RemediationPhase "Phase 2"
        }
    }
    catch {
        Write-Warning "[CTU] Failed to read authorization policy for $TenantKey : $_"
        $null = $ReportContext.Errors.Add("[$TenantKey] Authorization policy read failed: $_")
    }

    # 2. Default B2B collaboration settings from cross-tenant access policy
    try {
        $default = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/default"
        $auditData.DefaultB2BInbound = $default.b2bCollaborationInbound
        $auditData.DefaultB2BOutbound = $default.b2bCollaborationOutbound

        # Check default inbound - is it open to all?
        $inbound = $default.b2bCollaborationInbound
        if ($inbound -and $inbound.usersAndGroups.accessType -eq 'allowed') {
            $targets = $inbound.usersAndGroups.targets
            $allUsers = $targets | Where-Object { $_.target -eq 'AllUsers' }
            if ($allUsers) {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'High' -Title "Default B2B inbound allows ALL external users" `
                    -Description "The default cross-tenant access policy allows B2B collaboration inbound from ALL external tenants for ALL users. Any organization can send guest invitations to your users." `
                    -Recommendation "Set default B2B inbound to 'blocked'. Create partner-specific policies for MTO tenants." `
                    -RemediationPhase "Phase 3"
            }
        }

        # Check default outbound
        $outbound = $default.b2bCollaborationOutbound
        if ($outbound -and $outbound.usersAndGroups.accessType -eq 'allowed') {
            $targets = $outbound.usersAndGroups.targets
            $allUsers = $targets | Where-Object { $_.target -eq 'AllUsers' }
            if ($allUsers) {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Medium' -Title "Default B2B outbound allows ALL users to external tenants" `
                    -Description "Any user in this tenant can accept B2B invitations from ANY external organization." `
                    -Recommendation "Restrict default outbound. Scope to MTO partner tenants via partner-specific policies." `
                    -RemediationPhase "Phase 3"
            }
        }
    }
    catch {
        Write-Warning "[CTU] Failed to read default B2B settings for $TenantKey : $_"
    }

    # 3. Partner-specific B2B collaboration overrides
    try {
        $partners = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners" -AllPages
        $knownTenantIds = ($Config.tenants.PSObject.Properties.Value | ForEach-Object { $_.tenantId })

        foreach ($partner in $partners) {
            $isKnown = $partner.tenantId -in $knownTenantIds
            $label = if ($isKnown) {
                ($Config.tenants.PSObject.Properties.Value | Where-Object { $_.tenantId -eq $partner.tenantId }).displayName
            } else { $partner.tenantId }

            $partnerInfo = [PSCustomObject]@{
                TenantId             = $partner.tenantId
                Label                = $label
                IsKnown              = $isKnown
                B2BInbound           = $partner.b2bCollaborationInbound
                B2BOutbound          = $partner.b2bCollaborationOutbound
                B2BInboundInherited  = ($null -eq $partner.b2bCollaborationInbound)
                B2BOutboundInherited = ($null -eq $partner.b2bCollaborationOutbound)
            }
            $auditData.PartnerB2BSettings += $partnerInfo

            # Flag inherited settings (null = uses default)
            if ($partnerInfo.B2BInboundInherited -and $isKnown) {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Low' -Title "B2B inbound inherited from default for $label" `
                    -Description "Partner $label has no explicit B2B inbound override; it inherits the tenant default policy. If the default is permissive, this partner gets permissive access." `
                    -Recommendation "Set explicit B2B inbound rules for each MTO partner tenant."
            }
        }
    }
    catch {
        Write-Warning "[CTU] Failed to read partner B2B settings for $TenantKey : $_"
    }

    # 4. Authentication flows policy (self-service sign-up flows)
    try {
        $authFlows = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies/authenticationFlowsPolicy"
        $auditData.AuthFlowsPolicy = $authFlows

        if ($authFlows.selfServiceSignUp.isEnabled) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Medium' -Title "Self-service sign-up flows enabled" `
                -Description "authenticationFlowsPolicy.selfServiceSignUp.isEnabled is true. External users may be able to sign up via user flows without an invitation." `
                -Recommendation "Disable unless you have specific user flows configured with approval gates." `
                -RemediationPhase "Phase 2"
        }
    }
    catch {
        Write-Verbose "[CTU] Authentication flows policy not available for $TenantKey"
    }

    Save-CTUTenantData -ReportContext $ReportContext -TenantKey $TenantKey -Domain $domain -Data $auditData
    return $auditData
}

Export-ModuleMember -Function 'Invoke-CTUB2BCollaborationAudit'
