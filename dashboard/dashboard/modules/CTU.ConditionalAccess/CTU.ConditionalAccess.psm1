<#
.SYNOPSIS
    CTU.ConditionalAccess - Audits CA policies targeting external/guest users,
    identifies coverage gaps, and checks for best practice compliance.
#>

function Invoke-CTUConditionalAccessAudit {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$TenantKey,
        [Parameter(Mandatory)][PSCustomObject]$ReportContext,
        [Parameter()][PSCustomObject]$Config
    )

    if (-not $Config) { $Config = Get-CTUConfig }
    $domain = "ConditionalAccess"

    Write-Host "`n--- Conditional Access Audit: $TenantKey ---" -ForegroundColor Magenta

    $auditData = [PSCustomObject]@{
        TenantKey               = $TenantKey
        TotalPolicies           = 0
        EnabledPolicies         = 0
        ExternalUserPolicies    = @()
        MFACoverage             = $false
        LegacyAuthBlocked       = $false
        SignInFrequencySet      = $false
        PolicySummary           = @()
    }

    try {
        $policies = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies" -AllPages

        $auditData.TotalPolicies = $policies.Count
        $auditData.EnabledPolicies = ($policies | Where-Object { $_.state -eq 'enabled' }).Count

        Write-Host "  Found $($policies.Count) CA policies ($($auditData.EnabledPolicies) enabled)" -ForegroundColor DarkGray

        foreach ($policy in $policies) {
            $inc = $policy.conditions.users.includeGuestsOrExternalUsers
            $exc = $policy.conditions.users.excludeGuestsOrExternalUsers
            $includesAllUsers = 'All' -in $policy.conditions.users.includeUsers
            $includesGuests = $null -ne $inc

            # Track policies that affect external users
            if ($includesGuests -or $includesAllUsers) {
                $policySummary = [PSCustomObject]@{
                    PolicyId               = $policy.id
                    DisplayName            = $policy.displayName
                    State                  = $policy.state
                    IncludeGuestTypes      = $inc.guestOrExternalUserTypes
                    IncludeTenantScope     = $inc.externalTenants.membershipKind
                    IncludeTenantMembers   = $inc.externalTenants.members
                    ExcludeGuestTypes      = $exc.guestOrExternalUserTypes
                    GrantControls          = ($policy.grantControls.builtInControls -join ', ')
                    AuthStrength           = $policy.grantControls.authenticationStrength.displayName
                    SessionControls        = @{
                        SignInFrequency    = $policy.sessionControls.signInFrequency
                        PersistentBrowser  = $policy.sessionControls.persistentBrowser
                    }
                    ClientAppTypes         = $policy.conditions.clientAppTypes
                    TargetsAllApps         = 'All' -in $policy.conditions.applications.includeApplications
                }
                $auditData.ExternalUserPolicies += $policySummary

                # Check for MFA requirement
                if ($policy.state -eq 'enabled') {
                    $grantControls = $policy.grantControls.builtInControls
                    $hasMFA = 'mfa' -in $grantControls -or $policy.grantControls.authenticationStrength
                    $blocksLegacy = $policy.conditions.clientAppTypes -contains 'exchangeActiveSync' -or
                        $policy.conditions.clientAppTypes -contains 'other'

                    if ($hasMFA -and ($includesGuests -or $includesAllUsers)) {
                        $auditData.MFACoverage = $true
                    }

                    if ($grantControls -contains 'block' -and $blocksLegacy) {
                        $auditData.LegacyAuthBlocked = $true
                    }

                    if ($policy.sessionControls.signInFrequency.isEnabled) {
                        $auditData.SignInFrequencySet = $true
                    }
                }
            }

            $auditData.PolicySummary += [PSCustomObject]@{
                PolicyId     = $policy.id
                DisplayName  = $policy.displayName
                State        = $policy.state
                TargetsGuest = ($includesGuests -or $includesAllUsers)
            }
        }

        # --- Gap Analysis ---

        # MFA coverage
        if (-not $auditData.MFACoverage) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Critical' -Title "No MFA policy for external users" `
                -Description "No enabled CA policy requires MFA (or authentication strength) for guest or external users. This is the single most important security control for external access." `
                -Recommendation "Deploy a CA policy: Include all guest/external user types, all cloud apps, require MFA. Configure cross-tenant inbound MFA trust for MTO partners." `
                -RemediationPhase "Phase 2"
        }
        else {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "MFA policy exists for external users" `
                -Description "At least one enabled CA policy requires MFA for guest/external users."
        }

        # External user type coverage check
        $requiredTypes = @('b2bCollaborationGuest', 'b2bCollaborationMember', 'b2bDirectConnectUser')
        $coveredTypes = $auditData.ExternalUserPolicies |
            Where-Object { $_.State -eq 'enabled' -and $_.GrantControls -match 'mfa' } |
            ForEach-Object { $_.IncludeGuestTypes -split ',' } |
            Sort-Object -Unique

        $missingTypes = $requiredTypes | Where-Object { $_ -notin $coveredTypes }
        if ($missingTypes.Count -gt 0 -and $auditData.MFACoverage) {
            # MFA exists but doesn't cover all types (unless using "All users" scope)
            $allUsersPolicy = $auditData.ExternalUserPolicies |
                Where-Object { $_.State -eq 'enabled' -and 'All' -in $_.IncludeGuestTypes }
            if (-not $allUsersPolicy) {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'High' -Title "MFA policy doesn't cover all external user types" `
                    -Description "Missing coverage for: $($missingTypes -join ', '). B2B direct connect users are particularly important since they can't perform MFA in the resource tenant." `
                    -Recommendation "Update the MFA CA policy to include all guestOrExternalUserTypes: b2bCollaborationGuest, b2bCollaborationMember, b2bDirectConnectUser, otherExternalUser." `
                    -RemediationPhase "Phase 3"
            }
        }

        # Legacy auth blocking
        if (-not $auditData.LegacyAuthBlocked) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'High' -Title "No legacy auth block for external users" `
                -Description "No CA policy blocks legacy authentication (Exchange ActiveSync, other clients) for external users. Legacy auth bypasses MFA." `
                -Recommendation "Deploy a CA policy blocking legacy auth for all external user types." `
                -RemediationPhase "Phase 3"
        }

        # Sign-in frequency
        if (-not $auditData.SignInFrequencySet) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Medium' -Title "No sign-in frequency enforcement for guests" `
                -Description "No CA policy enforces sign-in frequency for external users. Guests may maintain long-lived sessions." `
                -Recommendation "Set sign-in frequency to 24 hours maximum for all external user sessions." `
                -RemediationPhase "Phase 3"
        }

        # Report-only policies
        $reportOnly = $policies | Where-Object { $_.state -eq 'enabledForReportingButNotEnforced' }
        if ($reportOnly.Count -gt 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Low' -Title "$($reportOnly.Count) CA policies in report-only mode" `
                -Description "Policies in report-only: $(($reportOnly | ForEach-Object { $_.displayName }) -join ', ')" `
                -Recommendation "Review report-only impact in CA insights workbook, then enable if appropriate."
        }
    }
    catch {
        Write-Warning "[CTU] Failed to read CA policies for $TenantKey : $_"
        $null = $ReportContext.Errors.Add("[$TenantKey] CA policy read failed: $_")
    }

    Save-CTUTenantData -ReportContext $ReportContext -TenantKey $TenantKey -Domain $domain -Data $auditData
    return $auditData
}

Export-ModuleMember -Function 'Invoke-CTUConditionalAccessAudit'
