<#
.SYNOPSIS
    CTU.IdentityGovernance - Audits access reviews, entitlement management,
    PIM configuration, and lifecycle workflows for governance baseline.
#>

function Invoke-CTUIdentityGovernanceAudit {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$TenantKey,
        [Parameter(Mandatory)][PSCustomObject]$ReportContext,
        [Parameter()][PSCustomObject]$Config
    )

    if (-not $Config) { $Config = Get-CTUConfig }
    $domain = "IdentityGovernance"

    Write-Host "`n--- Identity Governance Audit: $TenantKey ---" -ForegroundColor Magenta

    $auditData = [PSCustomObject]@{
        TenantKey              = $TenantKey
        AccessReviews          = @()
        GuestAccessReviews     = @()
        AccessPackages         = @()
        ConnectedOrgs          = @()
        PIMRoleEligibility     = @()
        PIMRoleAssignments     = @()
        LifecycleWorkflows     = @()
        HasGuestAccessReview   = $false
        HasEntitlementMgmt     = $false
        HasPIM                 = $false
        HasLifecycleWorkflows  = $false
    }

    # 1. Access Reviews
    try {
        Write-Host "  Checking access reviews..." -ForegroundColor DarkGray
        $reviews = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/identityGovernance/accessReviews/definitions" -AllPages
        $auditData.AccessReviews = $reviews

        if ($reviews.Count -eq 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'High' -Title "No access reviews configured" `
                -Description "No access review definitions exist. Guest and external user access is not being periodically reviewed." `
                -Recommendation "Deploy quarterly access reviews for all M365 groups containing guest members with auto-apply deny decisions." `
                -RemediationPhase "Phase 4"
        }
        else {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "$($reviews.Count) access review definitions found" `
                -Description "Review definitions: $(($reviews | ForEach-Object { $_.displayName }) -join ', ')"

            # Check for guest-specific reviews
            foreach ($review in $reviews) {
                $scopeJson = $review.scope | ConvertTo-Json -Depth 5
                if ($scopeJson -match 'Guest' -or $scopeJson -match 'externalUser') {
                    $auditData.GuestAccessReviews += $review
                    $auditData.HasGuestAccessReview = $true
                }

                # Check review settings
                if ($review.settings) {
                    if (-not $review.settings.autoApplyDecisionsEnabled) {
                        Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                            -Severity 'Low' -Title "Access review '$($review.displayName)' does not auto-apply" `
                            -Description "autoApplyDecisionsEnabled is false. Review decisions must be manually applied, increasing the risk of stale access." `
                            -Recommendation "Enable auto-apply with defaultDecision=Deny for guest reviews."
                    }
                }
            }

            if (-not $auditData.HasGuestAccessReview) {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Medium' -Title "No guest-specific access reviews" `
                    -Description "Access reviews exist but none specifically target guest/external users." `
                    -Recommendation "Create a quarterly review scoped to Guest users across all M365 groups." `
                    -RemediationPhase "Phase 4"
            }
        }
    }
    catch {
        if ($_ -match '403' -or $_ -match 'Authorization_RequestDenied') {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "Access Reviews API not accessible" `
                -Description "AccessReview.Read.All permission may not be consented, or Entra ID Governance license may be required."
        }
        else {
            Write-Warning "[CTU] Access reviews check failed for $TenantKey : $_"
        }
    }

    # 2. Entitlement Management
    try {
        Write-Host "  Checking entitlement management..." -ForegroundColor DarkGray
        $packages = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/identityGovernance/entitlementManagement/accessPackages" -AllPages
        $auditData.AccessPackages = $packages
        $auditData.HasEntitlementMgmt = ($packages.Count -gt 0)

        if ($packages.Count -eq 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Medium' -Title "No access packages configured" `
                -Description "Entitlement management has no access packages. Cross-tenant resource access is not using structured request/approval flows." `
                -Recommendation "Create access packages for cross-tenant resources with approval workflows, expiration (90-180 days), and connected organizations for MTO partners." `
                -RemediationPhase "Phase 4"
        }
        else {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "$($packages.Count) access packages configured" `
                -Description "Access packages: $(($packages | ForEach-Object { $_.displayName }) -join ', ')"
        }

        # Connected organizations (external orgs that can request access)
        $connOrgs = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/identityGovernance/entitlementManagement/connectedOrganizations" -AllPages
        $auditData.ConnectedOrgs = $connOrgs

        if ($connOrgs.Count -gt 0) {
            $knownTenantIds = ($Config.tenants.PSObject.Properties.Value | ForEach-Object { $_.tenantId })
            $unknownOrgs = $connOrgs | Where-Object {
                $orgTenantId = $_.identitySources | ForEach-Object { $_.tenantId }
                $orgTenantId -and ($orgTenantId | Where-Object { $_ -notin $knownTenantIds })
            }

            if ($unknownOrgs.Count -gt 0) {
                Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                    -Severity 'Medium' -Title "$($unknownOrgs.Count) connected orgs outside HTT Brands" `
                    -Description "Connected organizations exist for tenants not in the HTT family: $(($unknownOrgs | ForEach-Object { $_.displayName }) -join ', ')" `
                    -Recommendation "Review whether these external organizations should still have access to request packages."
            }
        }
    }
    catch {
        if ($_ -match '403') {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "Entitlement Management API not accessible" `
                -Description "EntitlementManagement.Read.All permission may not be consented, or Entra ID Governance license may be required."
        }
        else {
            Write-Warning "[CTU] Entitlement management check failed for $TenantKey : $_"
        }
    }

    # 3. PIM - Privileged Identity Management
    try {
        Write-Host "  Checking PIM configuration..." -ForegroundColor DarkGray

        # Active role assignments (permanent)
        $activeAssignments = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignmentScheduleInstances" -AllPages
        $auditData.PIMRoleAssignments = $activeAssignments
        $auditData.HasPIM = $true

        # Eligible role assignments (PIM eligible)
        $eligibleAssignments = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/roleManagement/directory/roleEligibilityScheduleInstances" -AllPages
        $auditData.PIMRoleEligibility = $eligibleAssignments

        # Count permanent vs eligible
        $permanentCount = $activeAssignments.Count
        $eligibleCount = $eligibleAssignments.Count

        if ($eligibleCount -eq 0 -and $permanentCount -gt 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'High' -Title "No PIM eligible assignments - all roles are permanent" `
                -Description "$permanentCount permanent role assignments and 0 eligible (JIT) assignments. All privileged access is always-on." `
                -Recommendation "Convert permanent assignments to PIM eligible with MFA + justification required for activation. Keep only break-glass accounts as permanent Global Admins." `
                -RemediationPhase "Phase 4"
        }
        elseif ($eligibleCount -gt 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "PIM in use: $permanentCount permanent, $eligibleCount eligible assignments" `
                -Description "PIM is configured with eligible role assignments."
        }

        # Check for multiple Global Admins
        $gaRoleTemplateId = "62e90394-69f5-4237-9190-012177145e10"
        $permanentGAs = $activeAssignments | Where-Object { $_.roleDefinitionId -eq $gaRoleTemplateId }
        if ($permanentGAs.Count -gt 2) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'High' -Title "$($permanentGAs.Count) permanent Global Administrators" `
                -Description "More than 2 permanent Global Admin assignments. Microsoft recommends a maximum of 2 permanent GAs (break-glass accounts)." `
                -Recommendation "Convert excess Global Admin assignments to PIM eligible." `
                -RemediationPhase "Phase 4"
        }
    }
    catch {
        if ($_ -match '403') {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "PIM API not accessible" `
                -Description "RoleManagement.Read.Directory permission may not be consented, or Entra ID P2/Governance license may be required."
        }
        else {
            Write-Warning "[CTU] PIM check failed for $TenantKey : $_"
        }
    }

    # 4. Lifecycle Workflows
    try {
        Write-Host "  Checking lifecycle workflows..." -ForegroundColor DarkGray
        $workflows = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/identityGovernance/lifecycleWorkflows/workflows" -AllPages
        $auditData.LifecycleWorkflows = $workflows
        $auditData.HasLifecycleWorkflows = ($workflows.Count -gt 0)

        if ($workflows.Count -eq 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Low' -Title "No lifecycle workflows configured" `
                -Description "Lifecycle workflows automate user onboarding/offboarding. No workflows exist for joiner, mover, or leaver scenarios." `
                -Recommendation "Consider lifecycle workflows for automated onboarding/offboarding of cross-tenant synced users." `
                -RemediationPhase "Phase 4"
        }
        else {
            $enabled = ($workflows | Where-Object { $_.isEnabled }).Count
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "$($workflows.Count) lifecycle workflows ($enabled enabled)" `
                -Description "Workflows: $(($workflows | ForEach-Object { "$($_.displayName) [$($_.category)]" }) -join ', ')"
        }
    }
    catch {
        if ($_ -match '403') {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Info' -Title "Lifecycle Workflows API not accessible" `
                -Description "LifecycleWorkflows.Read.All permission may not be consented, or Entra ID Governance license may be required."
        }
        else {
            Write-Warning "[CTU] Lifecycle workflows check failed for $TenantKey : $_"
        }
    }

    Save-CTUTenantData -ReportContext $ReportContext -TenantKey $TenantKey -Domain $domain -Data $auditData
    return $auditData
}

Export-ModuleMember -Function 'Invoke-CTUIdentityGovernanceAudit'
