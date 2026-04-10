<#
.SYNOPSIS
    Audit identity governance (access reviews, entitlement management, PIM,
    lifecycle workflows) across all HTT tenants.
.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases.
.NOTES
    Requires: Entra ID Governance or Entra Suite license
    Permissions: AccessReview.Read.All, EntitlementManagement.Read.All, RoleManagement.Read.Directory
#>
[CmdletBinding()] param([string[]]$TenantFilter)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force

Write-Host "`n=== HTT Brands: Identity Governance Baseline Audit ===" -ForegroundColor Magenta

$auditResults = Connect-HTTAllTenants -TenantFilter $TenantFilter -ScriptBlock {
    param($Tenant)
    $result = [ordered]@{ TenantAlias=$Tenant.Alias; TenantId=$Tenant.TenantId; AuditTime=(Get-Date -Format "o"); AccessReviews=$null; Entitlements=$null; PIM=$null; LifecycleWorkflows=$null; Findings=@() }

    # Access Reviews
    Write-HTTSection "Access Reviews"
    try {
        $reviews = Get-MgIdentityGovernanceAccessReviewDefinition -All -EA Stop
        $result.AccessReviews = @{ Count=@($reviews).Count; Definitions=@($reviews | ForEach-Object { [ordered]@{Name=$_.DisplayName;Status=$_.Status} }) }
        if (@($reviews).Count -eq 0) { Write-HTTFinding -Severity HIGH -Message "NO access reviews configured"; $result.Findings += @{Severity="HIGH";Detail="No access reviews"} }
        else { Write-HTTFinding -Severity OK -Message "$(@($reviews).Count) review definitions found" }
    } catch {
        if ($_.Exception.Message -match "license|subscription") { Write-HTTFinding -Severity INFO -Message "Access Reviews not licensed" }
        else { Write-HTTFinding -Severity HIGH -Message "AR read failed: $_" }
    }

    # Entitlement Management
    Write-HTTSection "Entitlement Management"
    try {
        $pkgs = Get-MgEntitlementManagementAccessPackage -All -EA Stop
        $orgs = Get-MgEntitlementManagementConnectedOrganization -All -EA SilentlyContinue
        $result.Entitlements = @{ Packages=@($pkgs).Count; ConnectedOrgs=@($orgs).Count }
        Write-HTTFinding -Severity INFO -Message "Packages: $(@($pkgs).Count) | Connected orgs: $(@($orgs).Count)"
        if (@($pkgs).Count -eq 0) { Write-HTTFinding -Severity MEDIUM -Message "No access packages"; $result.Findings += @{Severity="MEDIUM";Detail="No entitlement management packages"} }
    } catch { Write-HTTFinding -Severity INFO -Message "EM not available: $($_.Exception.Message)" }

    # PIM
    Write-HTTSection "Privileged Identity Management"
    try {
        $active = Get-MgRoleManagementDirectoryRoleAssignmentScheduleInstance -All -EA Stop
        $eligible = Get-MgRoleManagementDirectoryRoleEligibilityScheduleInstance -All -EA SilentlyContinue
        $permanent = @($active | Where-Object { $_.AssignmentType -eq "Assigned" -and -not $_.EndDateTime })
        $result.PIM = @{ Active=@($active).Count; Eligible=@($eligible).Count; Permanent=$permanent.Count }
        Write-HTTFinding -Severity INFO -Message "Active: $(@($active).Count) | Eligible: $(@($eligible).Count) | Permanent: $($permanent.Count)"
        if ($permanent.Count -gt 2) { Write-HTTFinding -Severity HIGH -Message "$($permanent.Count) permanent assignments (use PIM)"; $result.Findings += @{Severity="HIGH";Detail="$($permanent.Count) permanent role assignments"} }
        if (@($eligible).Count -eq 0) { Write-HTTFinding -Severity MEDIUM -Message "No PIM eligible assignments"; $result.Findings += @{Severity="MEDIUM";Detail="PIM not configured"} }
    } catch { Write-HTTFinding -Severity INFO -Message "PIM not available: $($_.Exception.Message)" }

    # Lifecycle Workflows
    Write-HTTSection "Lifecycle Workflows"
    try {
        $wfs = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/identityGovernance/lifecycleWorkflows/workflows" -EA Stop
        $result.LifecycleWorkflows = @{ Count=@($wfs.value).Count }
        if (@($wfs.value).Count -eq 0) { Write-HTTFinding -Severity MEDIUM -Message "No lifecycle workflows"; $result.Findings += @{Severity="MEDIUM";Detail="No lifecycle workflows"} }
        else { foreach ($w in $wfs.value) { Write-HTTFinding -Severity INFO -Message "  [$($w.category)] $($w.displayName) (enabled=$($w.isEnabled))" } }
    } catch { Write-HTTFinding -Severity INFO -Message "Lifecycle Workflows not available" }

    return [PSCustomObject]$result
}

Export-HTTReport -ReportName "IdentityGovernanceAudit" -Data $auditResults
Write-Host "`nIdentity governance audit complete.`n" -ForegroundColor Magenta
