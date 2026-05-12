<#
.SYNOPSIS
    Read-only security audit for B2 (AppRiver verification) and B3 (O365Support investigation).
    Also performs B1 pre-flight checks on all 5 tenants.
.DESCRIPTION
    Connects to each tenant using device code flow, then performs READ-ONLY queries:
    
    For all tenants:
    - List enabled Application-type service principals
    - Check authorization policy (guest invites, email-verified join)
    - Check Conditional Access policies for external-user MFA
    
    For HTT, FN, TLL specifically:
    - Verify AppRiver SP disabled status (B2)
    
    For TLL specifically:
    - Investigate O365Support-MSP-Connector (B3)
    
    This script makes ZERO write operations. All Graph API calls are GET only.
.PARAMETER TenantKeys
    Which tenants to audit. Defaults to all 5.
.NOTES
    Author: Richard (code-puppy) / CTU Automation
    Version: 1.0.0
    Safety: READ-ONLY — no mutations, no risk to user experience
#>
[CmdletBinding()]
param(
    [ValidateSet('HTT','BCC','FN','TLL','DCE')]
    [string[]]$TenantKeys = @('HTT','BCC','FN','TLL','DCE')
)

$ErrorActionPreference = "Continue"

# ── Tenant map ────────────────────────────────────────────────────────────────
$tenants = @{
    HTT = @{ Id = '0c0e35dc-188a-4eb3-b8ba-61752154b407'; Name = 'Head to Toe Brands (Corporate)' }
    BCC = @{ Id = 'b5380912-79ec-452d-a6ca-6d897b19b294'; Name = 'Bishops Cuts/Color' }
    FN  = @{ Id = '98723287-044b-4bbb-9294-19857d4128a0'; Name = 'Frenchies Modern Nail Care' }
    TLL = @{ Id = '3c7d2bf3-b597-4766-b5cb-2b489c2904d6'; Name = 'The Lash Lounge' }
    DCE = @{ Id = 'ce62e17d-2feb-4e67-a115-8ea4af68da30'; Name = 'Delta Crown Extensions' }
}

# ── AppRiver SP AppIds (for B2 verification) ──────────────────────────────────
$AppRiverSPs = @(
    @{ AppId = '7aecb184-3fb1-437b-abc5-a995e972fe1f'; Name = 'Office 365 Security Audit App' }
    @{ AppId = 'bee5026c-2493-4557-bc21-ccef515d9e61'; Name = 'Office365 Integration' }
    @{ AppId = 'cc695ec2-07c4-454b-95bc-418f5a8047fc'; Name = 'PshellTools' }
)

# ── O365Support-MSP-Connector AppId (for B3 investigation) ───────────────────
$O365SupportAppId = 'e5f67890-2345-6789-abcd-ef0123456789'

# ── Results accumulator ───────────────────────────────────────────────────────
$allResults = @()

foreach ($key in $TenantKeys) {
    $tenantInfo = $tenants[$key]
    Write-Host "`n$('='*70)" -ForegroundColor Cyan
    Write-Host "  AUDITING: $($tenantInfo.Name) ($key)" -ForegroundColor Cyan  
    Write-Host "  Tenant ID: $($tenantInfo.Id)" -ForegroundColor Cyan
    Write-Host "$('='*70)" -ForegroundColor Cyan

    # ── Connect ───────────────────────────────────────────────────────────────
    try {
        Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
    } catch {}

    Write-Host "`n[Auth] Connecting to $key via device code..." -ForegroundColor Yellow
    Write-Host "[Auth] Open https://login.microsoft.com/device and enter the code shown below" -ForegroundColor Yellow
    
    try {
        Connect-MgGraph -TenantId $tenantInfo.Id -Scopes 'Policy.Read.All','User.Read.All','Directory.Read.All','AuditLog.Read.All','RoleManagement.Read.Directory','Synchronization.Read.All','Application.Read.All' -UseDeviceCode -NoWelcome -ErrorAction Stop
    } catch {
        Write-Host "[ERROR] Failed to connect to ${key}: $_" -ForegroundColor Red
        continue
    }

    $ctx = Get-MgContext
    if (-not $ctx -or $ctx.TenantId -ne $tenantInfo.Id) {
        Write-Host "[ERROR] Connected to wrong tenant or no context for ${key}" -ForegroundColor Red
        continue
    }
    Write-Host "[Auth] ✅ Connected to $($tenantInfo.Name)" -ForegroundColor Green

    # ── 1. Service Principals ─────────────────────────────────────────────────
    Write-Host "`n--- Service Principals (Application type, enabled) ---" -ForegroundColor White
    try {
        $sps = Get-MgServicePrincipal -All -Filter "accountEnabled eq true" -Property displayName,appId,appOwnerOrganizationId,servicePrincipalType,accountEnabled |
            Where-Object { $_.servicePrincipalType -eq 'Application' } |
            Select-Object displayName,appId,appOwnerOrganizationId |
            Sort-Object displayName
        
        foreach ($sp in $sps) {
            Write-Host "  SP: $($sp.displayName) | appId=$($sp.appId) | ownerTenant=$($sp.appOwnerOrganizationId)" -ForegroundColor Gray
        }
        Write-Host "  Total enabled Application SPs: $($sps.Count)" -ForegroundColor White
    } catch {
        Write-Host "  [ERROR] Could not read SPs: $_" -ForegroundColor Red
    }

    # ── 2. AppRiver verification (B2) — HTT, FN, TLL only ────────────────────
    if ($key -in @('HTT','FN','TLL')) {
        Write-Host "`n--- B2: AppRiver SP Verification ---" -ForegroundColor Yellow
        foreach ($appriver in $AppRiverSPs) {
            try {
                $sp = Get-MgServicePrincipal -Filter "appId eq '$($appriver.AppId)'" -Property displayName,appId,accountEnabled,appOwnerOrganizationId -ErrorAction Stop
                if ($sp) {
                    $status = if ($sp.accountEnabled) { "🔴 ENABLED (should be disabled!)" } else { "✅ DISABLED" }
                    Write-Host "  $($appriver.Name): $status | accountEnabled=$($sp.accountEnabled) | ownerTenant=$($sp.appOwnerOrganizationId)" -ForegroundColor $(if ($sp.accountEnabled) { 'Red' } else { 'Green' })
                    $allResults += [PSCustomObject]@{
                        Check = 'B2-AppRiver'
                        Tenant = $key
                        SP = $appriver.Name
                        AppId = $appriver.AppId
                        AccountEnabled = $sp.accountEnabled
                        Status = if ($sp.accountEnabled) { 'MISMATCH' } else { 'VERIFIED' }
                    }
                } else {
                    Write-Host "  $($appriver.Name): ⚠️ NOT FOUND (may have been deleted)" -ForegroundColor Yellow
                    $allResults += [PSCustomObject]@{
                        Check = 'B2-AppRiver'
                        Tenant = $key
                        SP = $appriver.Name
                        AppId = $appriver.AppId
                        AccountEnabled = 'N/A'
                        Status = 'NOT_FOUND'
                    }
                }
            } catch {
                Write-Host "  $($appriver.Name): [ERROR] $_" -ForegroundColor Red
            }
        }
    }

    # ── 3. O365Support-MSP-Connector investigation (B3) — TLL only ───────────
    if ($key -eq 'TLL') {
        Write-Host "`n--- B3: O365Support-MSP-Connector Investigation ---" -ForegroundColor Yellow
        try {
            $o365sp = Get-MgServicePrincipal -Filter "appId eq '$O365SupportAppId'" -Property displayName,appId,accountEnabled,appOwnerOrganizationId,createdDateTime -ErrorAction Stop
            if ($o365sp) {
                Write-Host "  Name: $($o365sp.displayName)" -ForegroundColor White
                Write-Host "  AppId: $($o365sp.appId)" -ForegroundColor White
                Write-Host "  AccountEnabled: $($o365sp.accountEnabled)" -ForegroundColor $(if ($o365sp.accountEnabled) { 'Red' } else { 'Green' })
                Write-Host "  OwnerTenantId: $($o365sp.appOwnerOrganizationId)" -ForegroundColor White
                Write-Host "  Created: $($o365sp.createdDateTime)" -ForegroundColor White
                
                # Get app role assignments
                Write-Host "`n  App Role Assignments:" -ForegroundColor White
                $assignments = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $o365sp.Id -All -ErrorAction SilentlyContinue
                if ($assignments) {
                    foreach ($a in $assignments) {
                        Write-Host "    Resource: $($a.resourceDisplayName) | Role: $($a.appRoleId) | Created: $($a.creationTimestamp)" -ForegroundColor Gray
                    }
                } else {
                    Write-Host "    No app role assignments found" -ForegroundColor Gray
                }
                
                # Get OAuth2 permission grants
                Write-Host "`n  OAuth2 Permission Grants:" -ForegroundColor White
                $grants = Get-MgServicePrincipalOAuth2PermissionGrant -ServicePrincipalId $o365sp.Id -All -ErrorAction SilentlyContinue
                if ($grants) {
                    foreach ($g in $grants) {
                        Write-Host "    ClientId: $($g.clientId) | Scope: $($g.scope) | ConsentType: $($g.consentType)" -ForegroundColor Gray
                    }
                } else {
                    Write-Host "    No OAuth2 permission grants found" -ForegroundColor Gray
                }

                $allResults += [PSCustomObject]@{
                    Check = 'B3-O365Support'
                    Tenant = 'TLL'
                    SP = $o365sp.displayName
                    AccountEnabled = $o365sp.accountEnabled
                    OwnerTenantId = $o365sp.appOwnerOrganizationId
                    Created = $o365sp.createdDateTime
                    HasAppRoles = ($assignments -and $assignments.Count -gt 0)
                    HasOAuthGrants = ($grants -and $grants.Count -gt 0)
                }
            } else {
                Write-Host "  ⚠️ O365Support-MSP-Connector NOT FOUND — may have been deleted or AppId changed" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  [ERROR] B3 investigation failed: $_" -ForegroundColor Red
        }
    }

    # ── 4. Authorization policy (pre-flight for B1) ──────────────────────────
    Write-Host "`n--- B1 Pre-Flight: Authorization Policy ---" -ForegroundColor Yellow
    try {
        $authPolicy = Invoke-MgGraphRequest -Uri 'https://graph.microsoft.com/v1.0/policies/authorizationPolicy' -ErrorAction Stop
        $guestInvite = $authPolicy.allowInvitesFrom
        $emailVerified = $authPolicy.allowEmailVerifiedUsersToJoinOrganization
        Write-Host "  allowInvitesFrom: $guestInvite" -ForegroundColor $(if ($guestInvite -eq 'everyone') { 'Red' } else { 'Green' })
        Write-Host "  allowEmailVerifiedUsersToJoinOrganization: $emailVerified" -ForegroundColor $(if ($emailVerified -eq $true) { 'Red' } else { 'Green' })
        
        $allResults += [PSCustomObject]@{
            Check = 'B1-Preflight'
            Tenant = $key
            AllowInvitesFrom = $guestInvite
            EmailVerifiedJoin = $emailVerified
        }
    } catch {
        Write-Host "  [ERROR] Could not read authorization policy: $_" -ForegroundColor Red
    }

    # ── 5. CA policies for external users (pre-flight for B1 QW6) ─────────────
    Write-Host "`n--- B1 Pre-Flight: CA Policies (external user MFA) ---" -ForegroundColor Yellow
    try {
        $caPolicies = Invoke-MgGraphRequest -Uri 'https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies' -ErrorAction Stop
        $externalMfaPolicies = $caPolicies.value | Where-Object {
            $_.conditions.users.includeGuestsOrExternalUsers -or
            $_.displayName -like '*External*' -or 
            $_.displayName -like '*B2B*' -or
            $_.displayName -like '*CTU*'
        }
        if ($externalMfaPolicies) {
            foreach ($p in $externalMfaPolicies) {
                Write-Host "  Policy: $($p.displayName) | State: $($p.state)" -ForegroundColor $(if ($p.state -eq 'enabled') { 'Green' } elseif ($p.state -eq 'enabledForReportingButNotEnforced') { 'Yellow' } else { 'Gray' })
            }
        } else {
            Write-Host "  No CA policies targeting external users found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [ERROR] Could not read CA policies: $_" -ForegroundColor Red
    }

    # ── Disconnect ────────────────────────────────────────────────────────────
    try { Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null } catch {}
    Write-Host "`n[Auth] Disconnected from $key" -ForegroundColor Gray
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "`n$('='*70)" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "$('='*70)" -ForegroundColor Cyan

Write-Host "`n--- B2: AppRiver SP Status Summary ---" -ForegroundColor Yellow
$appriverResults = $allResults | Where-Object { $_.Check -eq 'B2-AppRiver' }
if ($appriverResults) {
    $appriverResults | Format-Table Tenant,SP,AccountEnabled,Status -AutoSize
} else {
    Write-Host "  No AppRiver SPs checked (HTT/FN/TLL not in scope)" -ForegroundColor Gray
}

Write-Host "`n--- B3: O365Support-MSP-Connector Summary ---" -ForegroundColor Yellow
$o365Results = $allResults | Where-Object { $_.Check -eq 'B3-O365Support' }
if ($o365Results) {
    $o365Results | Format-Table Tenant,SP,AccountEnabled,OwnerTenantId,Created -AutoSize
} else {
    Write-Host "  TLL not in scope" -ForegroundColor Gray
}

Write-Host "`n--- B1 Pre-Flight: Auth Policy Summary ---" -ForegroundColor Yellow
$preflightResults = $allResults | Where-Object { $_.Check -eq 'B1-Preflight' }
if ($preflightResults) {
    $preflightResults | Format-Table Tenant,AllowInvitesFrom,EmailVerifiedJoin -AutoSize
}

Write-Host "`nAudit complete. ZERO write operations performed." -ForegroundColor Green
