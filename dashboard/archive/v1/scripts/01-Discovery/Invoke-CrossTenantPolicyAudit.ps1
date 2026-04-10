<#
.SYNOPSIS
    Audit cross-tenant access policies, B2B collaboration/direct connect,
    identity sync, and inbound trust across all HTT Brands tenants.
.DESCRIPTION
    Phase 1 Discovery. Compares current state against deny-by-default baseline.
.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases (e.g., "HTT","TLL").
.EXAMPLE
    .\Invoke-CrossTenantPolicyAudit.ps1 -TenantFilter "TLL"
.NOTES
    Permissions: Policy.Read.All, Synchronization.Read.All
#>
[CmdletBinding()] param([string[]]$TenantFilter)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force
$config = Get-HTTConfig; $baseline = Get-HTTBaseline

Write-Host "`n=== HTT Brands: Cross-Tenant Access Policy Audit ===" -ForegroundColor Magenta

$auditResults = Connect-HTTAllTenants -TenantFilter $TenantFilter -ScriptBlock {
    param($Tenant)
    $result = [ordered]@{ TenantAlias=$Tenant.Alias; TenantId=$Tenant.TenantId; AuditTime=(Get-Date -Format "o"); Findings=@(); DefaultPolicy=$null; Partners=@(); AuthPolicy=$null }

    # 1. Default cross-tenant access
    Write-HTTSection "Default Cross-Tenant Access Policy"
    try {
        $default = Get-MgPolicyCrossTenantAccessPolicyDefault
        $result.DefaultPolicy = [ordered]@{
            B2BCollabInbound=$default.B2bCollaborationInbound; B2BCollabOutbound=$default.B2bCollaborationOutbound
            B2BDirectInbound=$default.B2bDirectConnectInbound; B2BDirectOutbound=$default.B2bDirectConnectOutbound
            InboundTrust=$default.InboundTrust; AutoConsent=$default.AutomaticUserConsentSettings
        }
        foreach ($check in @(
            @{Name="B2B collab inbound"; Val=$default.B2bCollaborationInbound.UsersAndGroups.AccessType},
            @{Name="B2B collab outbound"; Val=$default.B2bCollaborationOutbound.UsersAndGroups.AccessType},
            @{Name="B2B direct inbound"; Val=$default.B2bDirectConnectInbound.UsersAndGroups.AccessType},
            @{Name="B2B direct outbound"; Val=$default.B2bDirectConnectOutbound.UsersAndGroups.AccessType}
        )) {
            if ($check.Val -ne "blocked") {
                Write-HTTFinding -Severity HIGH -Message "Default $($check.Name): '$($check.Val)' (should be 'blocked')"
                $result.Findings += @{ Severity="HIGH"; Domain="DefaultPolicy"; Detail="Default $($check.Name) is $($check.Val), not blocked" }
            } else { Write-HTTFinding -Severity OK -Message "Default $($check.Name): blocked" }
        }
        if ($default.InboundTrust.IsMfaAccepted) {
            Write-HTTFinding -Severity MEDIUM -Message "Default MFA trust ENABLED (should be per-partner only)"
            $result.Findings += @{ Severity="MEDIUM"; Domain="InboundTrust"; Detail="Default MFA trust enabled" }
        }
    } catch { Write-HTTFinding -Severity CRITICAL -Message "Failed to read default policy: $_"; $result.Findings += @{Severity="CRITICAL";Detail="$_"} }

    # 2. Partner configurations
    Write-HTTSection "Partner Configurations"
    try {
        $partners = Get-MgPolicyCrossTenantAccessPolicyPartner -All
        $knownIds = $config.allTenantIds
        foreach ($p in $partners) {
            $isKnown = $p.TenantId -in $knownIds
            $alias = if ($isKnown) { ($config.spokes | Where-Object { $_.tenantId -eq $p.TenantId }).alias ?? $(if ($p.TenantId -eq $config.hub.tenantId){"HTT"}else{"?"}) } else { "EXTERNAL" }
            $pInfo = [ordered]@{ TenantId=$p.TenantId; Alias=$alias; IsHTT=$isKnown; B2BCollabIn=$p.B2bCollaborationInbound; B2BDirectIn=$p.B2bDirectConnectInbound; Trust=$p.InboundTrust; AutoConsent=$p.AutomaticUserConsentSettings; IsInMTO=$p.IsInMultiTenantOrganization }
            if (-not $isKnown) {
                Write-HTTFinding -Severity HIGH -Message "UNKNOWN partner: $($p.TenantId)"
                $result.Findings += @{ Severity="HIGH"; Domain="UnknownPartner"; Detail="Partner $($p.TenantId) not in HTT org" }
            } else {
                Write-HTTFinding -Severity INFO -Message "Partner: $alias ($($p.TenantId))"
                if (-not $p.InboundTrust.IsMfaAccepted) {
                    Write-HTTFinding -Severity MEDIUM -Message "  MFA trust NOT enabled for $alias"
                    $result.Findings += @{ Severity="MEDIUM"; Domain="InboundTrust"; Detail="MFA trust not enabled for $alias" }
                }
            }
            # Check identity sync
            try {
                $sync = Get-MgPolicyCrossTenantAccessPolicyPartnerIdentitySynchronization -CrossTenantAccessPolicyConfigurationPartnerTenantId $p.TenantId -EA SilentlyContinue
                if ($sync) { $pInfo.IdentitySync = @{ InboundAllowed=$sync.UserSyncInbound.IsSyncAllowed }; Write-HTTFinding -Severity INFO -Message "  Identity sync: $(if($sync.UserSyncInbound.IsSyncAllowed){'ENABLED'}else{'DISABLED'})" }
            } catch { $pInfo.IdentitySync = @{ Error=$_.Exception.Message } }
            $result.Partners += [PSCustomObject]$pInfo
        }
        # Check for missing HTT partners
        $configuredIds = $partners | ForEach-Object { $_.TenantId }
        foreach ($expected in ($knownIds | Where-Object { $_ -ne $Tenant.TenantId })) {
            if ($expected -notin $configuredIds) {
                $missing = ($config.spokes | Where-Object { $_.tenantId -eq $expected }).alias ?? $(if($expected -eq $config.hub.tenantId){"HTT"}else{$expected})
                Write-HTTFinding -Severity MEDIUM -Message "Missing partner config: $missing"
                $result.Findings += @{ Severity="MEDIUM"; Domain="MissingPartner"; Detail="$missing not configured as partner" }
            }
        }
    } catch { Write-HTTFinding -Severity CRITICAL -Message "Partner enumeration failed: $_" }

    # 3. Authorization policy
    Write-HTTSection "Authorization Policy"
    try {
        $auth = Get-MgPolicyAuthorizationPolicy
        $result.AuthPolicy = [ordered]@{ AllowInvitesFrom=$auth.AllowInvitesFrom; GuestUserRoleId=$auth.GuestUserRoleId; AllowEmailVerifiedJoin=$auth.AllowEmailVerifiedUsersToJoinOrganization }
        $roleNames = @{ "10dae51f-b616-4fe8-8b3a-e4e42bde7b4c"="Guest User (default)"; "2af84b1e-32c8-444d-8dfa-801d234f85e3"="Restricted Guest (recommended)"; "a0b1b346-4d3e-4e8b-98f8-753987be4970"="Member-level (least restrictive)" }
        if ($auth.AllowInvitesFrom -eq "everyone") { Write-HTTFinding -Severity HIGH -Message "Guest invites: EVERYONE"; $result.Findings += @{Severity="HIGH";Detail="AllowInvitesFrom=everyone"} }
        elseif ($auth.AllowInvitesFrom -eq "adminsGuestInvitersAndAllMembers") { Write-HTTFinding -Severity MEDIUM -Message "Guest invites: All members" }
        else { Write-HTTFinding -Severity OK -Message "Guest invites: $($auth.AllowInvitesFrom)" }
        $roleName = $roleNames[$auth.GuestUserRoleId] ?? "Unknown"
        Write-HTTFinding -Severity $(if($auth.GuestUserRoleId -eq "2af84b1e-32c8-444d-8dfa-801d234f85e3"){"OK"}elseif($auth.GuestUserRoleId -eq "a0b1b346-4d3e-4e8b-98f8-753987be4970"){"HIGH"}else{"MEDIUM"}) -Message "Guest role: $roleName"
        if ($auth.AllowEmailVerifiedUsersToJoinOrganization) { Write-HTTFinding -Severity HIGH -Message "Self-service sign-up ENABLED"; $result.Findings += @{Severity="HIGH";Detail="Self-service sign-up enabled"} }
    } catch { Write-HTTFinding -Severity CRITICAL -Message "Auth policy read failed: $_" }

    return [PSCustomObject]$result
}

Write-HTTSection "Summary"
$total = @{CRITICAL=0;HIGH=0;MEDIUM=0}
foreach ($a in $auditResults.Keys) { foreach ($f in $auditResults[$a].Findings) { if ($total.ContainsKey($f.Severity)) { $total[$f.Severity]++ } } }
Write-Host "  Critical: $($total.CRITICAL) | High: $($total.HIGH) | Medium: $($total.MEDIUM)"
Export-HTTReport -ReportName "CrossTenantPolicyAudit" -Data $auditResults
Write-Host "`nCross-tenant policy audit complete.`n" -ForegroundColor Magenta
