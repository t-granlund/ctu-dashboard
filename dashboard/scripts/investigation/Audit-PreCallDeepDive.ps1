<#
.SYNOPSIS
    Pre-call deep dive audit for Tyler's 1pm call with Megan.

.DESCRIPTION
    READ-ONLY targeted audit that grabs:
      1. AppRiver service principal permissions (HTT, FN, TLL)
      2. Sui Generis guest account details + role memberships (HTT, TLL)
      3. Pax8 service principal permissions (HTT, FN, TLL)
      4. Azure billing account info (HTT only)

    Results saved to reports/pre-call-deep-dive.json.

.PARAMETER OutputPath
    Path for the JSON output file. Defaults to reports/pre-call-deep-dive.json.

.EXAMPLE
    ./Audit-PreCallDeepDive.ps1

.NOTES
    Author : Richard (code-puppy-8e9659)
    Created: 2025-05
    Requires: Microsoft.Graph PowerShell SDK, Az CLI, CTU.Core module
    This is a READ-ONLY audit — no changes are made to any tenant.
#>

[CmdletBinding()]
param(
    [Parameter()]
    [string]$OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

# ── Bootstrap ────────────────────────────────────────────────
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Import-Module (Join-Path $repoRoot 'modules' 'CTU.Core' 'CTU.Core.psm1') -Force

$config = Get-CTUConfig

if (-not $OutputPath) {
    $OutputPath = Join-Path $repoRoot 'reports' 'pre-call-deep-dive.json'
}

# ── Constants ────────────────────────────────────────────────
$AppRiverAppIds = @(
    '7aecb184-3fb1-437b-abc5-a995e972fe1f'
    'bee5026c-2493-4557-bc21-ccef515d9e61'
    'cc695ec2-07c4-454b-95bc-418f5a8047fc'
)

$Pax8AppIds = @(
    '96b1dd76-7698-438b-9565-2e268be9ea34'
)

$SPPermissionTenants = @('HTT', 'FN', 'TLL')
$GuestAuditTenants   = @('HTT', 'TLL')
$BillingTenants      = @('HTT')

# ── Helpers ──────────────────────────────────────────────────

function Get-GraphAppRoleMap {
    <#
    .SYNOPSIS
        Builds a lookup table of Microsoft Graph app role ID -> display name.
    #>
    [CmdletBinding()]
    param()

    $map = @{}
    try {
        $graphSP = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/servicePrincipals?`$filter=appId eq '00000003-0000-0000-c000-000000000000'&`$select=appRoles"
        $sp = if ($graphSP -is [array]) { $graphSP[0] } else { $graphSP }
        $roles = if ($sp -is [hashtable]) { $sp['appRoles'] } else { $sp.appRoles }
        if ($roles) {
            foreach ($role in $roles) {
                $id    = if ($role -is [hashtable]) { $role['id'] }    else { $role.id }
                $value = if ($role -is [hashtable]) { $role['value'] } else { $role.value }
                if ($id) { $map[$id] = $value }
            }
        }
        Write-CTUFinding -Severity INFO -Message "Loaded $($map.Count) Graph app role definitions"
    } catch {
        Write-CTUFinding -Severity MEDIUM -Message "Failed to load Graph app roles: $($_.Exception.Message)"
    }
    return $map
}

function Get-SPPermissionDetails {
    <#
    .SYNOPSIS
        For a list of appIds, resolves each SP and pulls app role assignments
        and oauth2 delegated permission grants. Returns structured results.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string[]]$AppIds,
        [Parameter(Mandatory)][string]$ProviderLabel,
        [Parameter(Mandatory)][hashtable]$AppRoleMap
    )

    $results = @()

    foreach ($appId in $AppIds) {
        $spResult = [ordered]@{
            appId                  = $appId
            provider               = $ProviderLabel
            servicePrincipal       = $null
            appRoleAssignments     = @()
            oauth2PermissionGrants = @()
            errors                 = @()
        }

        # Resolve SP object
        try {
            $spResponse = Invoke-CTUGraphRequest `
                -Uri "https://graph.microsoft.com/v1.0/servicePrincipals?`$filter=appId eq '$appId'&`$select=id,displayName,appId"
            $sp = if ($spResponse -is [array] -and $spResponse.Count -gt 0) { $spResponse[0] } else { $spResponse }
            $spId   = if ($sp -is [hashtable]) { $sp['id'] }          else { $sp.id }
            $spName = if ($sp -is [hashtable]) { $sp['displayName'] } else { $sp.displayName }

            if (-not $spId) {
                Write-CTUFinding -Severity INFO -Message "SP not found for appId $appId — skipping"
                $spResult.errors += "Service principal not found for appId $appId"
                $results += [PSCustomObject]$spResult
                continue
            }

            $spResult.servicePrincipal = [ordered]@{
                objectId    = $spId
                displayName = $spName
                appId       = $appId
            }
            Write-CTUFinding -Severity INFO -Message "Found SP: $spName ($spId)"
        } catch {
            $msg = "Failed to resolve SP for appId ${appId}: $($_.Exception.Message)"
            Write-CTUFinding -Severity MEDIUM -Message $msg
            $spResult.errors += $msg
            $results += [PSCustomObject]$spResult
            continue
        }

        # App role assignments (application permissions)
        try {
            $roleAssignments = Invoke-CTUGraphRequest `
                -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$spId/appRoleAssignments" `
                -AllPages
            if ($roleAssignments) {
                $spResult.appRoleAssignments = @($roleAssignments | ForEach-Object {
                    $ra = $_
                    $roleId = if ($ra -is [hashtable]) { $ra['appRoleId'] } else { $ra.appRoleId }
                    [ordered]@{
                        appRoleId        = $roleId
                        appRoleName      = if ($roleId -and $AppRoleMap.ContainsKey($roleId)) { $AppRoleMap[$roleId] } else { '(unknown)' }
                        resourceDisplayName = if ($ra -is [hashtable]) { $ra['resourceDisplayName'] } else { $ra.resourceDisplayName }
                        resourceId       = if ($ra -is [hashtable]) { $ra['resourceId'] } else { $ra.resourceId }
                        createdDateTime  = if ($ra -is [hashtable]) { $ra['createdDateTime'] } else { $ra.createdDateTime }
                    }
                })
                Write-CTUFinding -Severity INFO -Message "  App roles: $($spResult.appRoleAssignments.Count)"
            }
        } catch {
            $msg = "Failed to get appRoleAssignments for ${spName}: $($_.Exception.Message)"
            Write-CTUFinding -Severity MEDIUM -Message $msg
            $spResult.errors += $msg
        }

        # OAuth2 delegated permission grants
        try {
            $grants = Invoke-CTUGraphRequest `
                -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$spId/oauth2PermissionGrants" `
                -AllPages
            if ($grants) {
                $spResult.oauth2PermissionGrants = @($grants | ForEach-Object {
                    $g = $_
                    [ordered]@{
                        id           = if ($g -is [hashtable]) { $g['id'] }           else { $g.id }
                        consentType  = if ($g -is [hashtable]) { $g['consentType'] }  else { $g.consentType }
                        principalId  = if ($g -is [hashtable]) { $g['principalId'] }  else { $g.principalId }
                        resourceId   = if ($g -is [hashtable]) { $g['resourceId'] }   else { $g.resourceId }
                        scope        = if ($g -is [hashtable]) { $g['scope'] }        else { $g.scope }
                    }
                })
                Write-CTUFinding -Severity INFO -Message "  Delegated grants: $($spResult.oauth2PermissionGrants.Count)"
            }
        } catch {
            $msg = "Failed to get oauth2PermissionGrants for ${spName}: $($_.Exception.Message)"
            Write-CTUFinding -Severity MEDIUM -Message $msg
            $spResult.errors += $msg
        }

        $results += [PSCustomObject]$spResult
    }

    return $results
}

function Get-SuiGenerisGuests {
    <#
    .SYNOPSIS
        Finds Sui Generis guest accounts and their directory role memberships.
    #>
    [CmdletBinding()]
    param()

    $guests = @()

    # Primary approach: server-side filter with endsWith
    try {
        $headers = @{ 'ConsistencyLevel' = 'eventual' }
        $filterUri = "https://graph.microsoft.com/v1.0/users?" +
            "`$filter=userType eq 'Guest' and endsWith(mail,'suigenerisinc.com')" +
            "&`$select=displayName,mail,userPrincipalName,userType,createdDateTime,signInActivity,accountEnabled,id" +
            "&`$count=true"
        $guests = @(Invoke-CTUGraphRequest -Uri $filterUri -AllPages -Headers $headers)
        Write-CTUFinding -Severity INFO -Message "Server-side filter returned $($guests.Count) Sui Generis guest(s)"
    } catch {
        Write-CTUFinding -Severity LOW -Message "Server-side endsWith filter failed ($($_.Exception.Message)) — falling back to client-side"

        # Fallback: get all guests, filter client-side
        try {
            $allGuests = Invoke-CTUGraphRequest `
                -Uri ("https://graph.microsoft.com/v1.0/users?" +
                    "`$filter=userType eq 'Guest'" +
                    "&`$select=displayName,mail,userPrincipalName,userType,createdDateTime,signInActivity,accountEnabled,id" +
                    "&`$count=true&`$top=999") `
                -AllPages -Headers @{ 'ConsistencyLevel' = 'eventual' }
            $guests = @($allGuests | Where-Object {
                $mail = if ($_ -is [hashtable]) { $_['mail'] } else { $_.mail }
                $mail -and $mail -like '*suigenerisinc.com'
            })
            Write-CTUFinding -Severity INFO -Message "Client-side filter found $($guests.Count) Sui Generis guest(s) from $($allGuests.Count) total guests"
        } catch {
            Write-CTUFinding -Severity MEDIUM -Message "Guest fallback query also failed: $($_.Exception.Message)"
            return @()
        }
    }

    # Enrich each guest with directory role memberships
    $enriched = @()
    foreach ($guest in $guests) {
        $guestId   = if ($guest -is [hashtable]) { $guest['id'] }          else { $guest.id }
        $guestName = if ($guest -is [hashtable]) { $guest['displayName'] } else { $guest.displayName }

        $guestObj = [ordered]@{
            id               = $guestId
            displayName      = $guestName
            mail             = if ($guest -is [hashtable]) { $guest['mail'] }             else { $guest.mail }
            userPrincipalName = if ($guest -is [hashtable]) { $guest['userPrincipalName'] } else { $guest.userPrincipalName }
            userType         = if ($guest -is [hashtable]) { $guest['userType'] }         else { $guest.userType }
            createdDateTime  = if ($guest -is [hashtable]) { $guest['createdDateTime'] }  else { $guest.createdDateTime }
            accountEnabled   = if ($guest -is [hashtable]) { $guest['accountEnabled'] }   else { $guest.accountEnabled }
            signInActivity   = if ($guest -is [hashtable]) { $guest['signInActivity'] }   else { $guest.signInActivity }
            roleMemberships  = @()
        }

        if ($guestId) {
            try {
                $memberships = Invoke-CTUGraphRequest `
                    -Uri "https://graph.microsoft.com/v1.0/users/$guestId/memberOf?`$select=displayName,roleTemplateId" `
                    -AllPages
                if ($memberships) {
                    $guestObj.roleMemberships = @($memberships | ForEach-Object {
                        $m = $_
                        [ordered]@{
                            displayName    = if ($m -is [hashtable]) { $m['displayName'] }    else { $m.displayName }
                            roleTemplateId = if ($m -is [hashtable]) { $m['roleTemplateId'] } else { $m.roleTemplateId }
                            odataType      = if ($m -is [hashtable]) { $m['@odata.type'] }    else { $_.'@odata.type' }
                        }
                    })
                    Write-CTUFinding -Severity INFO -Message "  $guestName — $($guestObj.roleMemberships.Count) membership(s)"
                }
            } catch {
                Write-CTUFinding -Severity LOW -Message "  Failed to get memberships for ${guestName}: $($_.Exception.Message)"
            }
        }

        $enriched += [PSCustomObject]$guestObj
    }

    return $enriched
}

function Get-AzureBillingInfo {
    <#
    .SYNOPSIS
        Grabs Azure billing account info and subscription details via az CLI.
    #>
    [CmdletBinding()]
    param()

    $billing = [ordered]@{
        billingAccounts   = $null
        defaultBilling    = $null
        subscriptions     = @()
        subscriptionDetails = @()
        errors            = @()
    }

    # billing account list
    try {
        $raw = az billing account list --output json 2>$null
        if ($raw) { $billing.billingAccounts = $raw | ConvertFrom-Json }
        Write-CTUFinding -Severity INFO -Message "billing account list: $(if ($billing.billingAccounts) { 'OK' } else { 'empty/null' })"
    } catch {
        $msg = "az billing account list failed: $($_.Exception.Message)"
        Write-CTUFinding -Severity LOW -Message $msg
        $billing.errors += $msg
    }

    # billing account show --name default
    try {
        $raw = az billing account show --name default --output json 2>$null
        if ($raw) { $billing.defaultBilling = $raw | ConvertFrom-Json }
        Write-CTUFinding -Severity INFO -Message "billing account show default: $(if ($billing.defaultBilling) { 'OK' } else { 'empty/null' })"
    } catch {
        $msg = "az billing account show failed: $($_.Exception.Message)"
        Write-CTUFinding -Severity LOW -Message $msg
        $billing.errors += $msg
    }

    # subscription list
    try {
        $raw = az account list --all --output json 2>$null
        if ($raw) {
            $billing.subscriptions = @($raw | ConvertFrom-Json)
            Write-CTUFinding -Severity INFO -Message "Found $($billing.subscriptions.Count) subscription(s)"

            # Per-subscription details
            foreach ($sub in $billing.subscriptions) {
                $subId = if ($sub -is [hashtable]) { $sub['id'] } else { $sub.id }
                $subName = if ($sub -is [hashtable]) { $sub['name'] } else { $sub.name }
                try {
                    $detail = az account show --subscription $subId --output json 2>$null
                    if ($detail) {
                        $billing.subscriptionDetails += ($detail | ConvertFrom-Json)
                        Write-CTUFinding -Severity INFO -Message "  Sub detail: $subName"
                    }
                } catch {
                    $billing.errors += "Failed to get details for sub ${subName}: $($_.Exception.Message)"
                }
            }
        }
    } catch {
        $msg = "az account list failed: $($_.Exception.Message)"
        Write-CTUFinding -Severity MEDIUM -Message $msg
        $billing.errors += $msg
    }

    return [PSCustomObject]$billing
}

# ── Main Execution ───────────────────────────────────────────
Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Pre-Call Deep Dive Audit (READ-ONLY)                  ║" -ForegroundColor Cyan
Write-Host "║   Tyler's 1pm call with Megan                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Output  : $OutputPath" -ForegroundColor White
Write-Host ""

$auditResults = [ordered]@{
    auditDate   = (Get-Date -Format 'yyyy-MM-dd')
    auditTime   = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
    generatedBy = 'Audit-PreCallDeepDive.ps1'
    sections    = [ordered]@{
        appRiverPermissions   = [ordered]@{}
        suiGenerisGuests      = [ordered]@{}
        pax8Permissions       = [ordered]@{}
        azureBilling          = $null
    }
}

$totalStart = Get-Date

# ═══════════════════════════════════════════════════════════════
# Section 1: AppRiver SP Permissions (HTT, FN, TLL)
# ═══════════════════════════════════════════════════════════════
Write-Host "`n" -NoNewline
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "  SECTION 1: AppRiver Service Principal Permissions" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

foreach ($tenantKey in $SPPermissionTenants) {
    $tenant = Get-CTUTenantList -TenantKey $tenantKey -Config $config
    Write-Host "`n── $($tenant.displayName) ($tenantKey) ──" -ForegroundColor Yellow

    try {
        Connect-CTUTenant -TenantKey $tenantKey -Config $config | Out-Null

        Write-CTUSection "Loading Graph app role map"
        $roleMap = Get-GraphAppRoleMap

        Write-CTUSection "Auditing AppRiver SPs"
        $appRiverData = Get-SPPermissionDetails `
            -AppIds $AppRiverAppIds `
            -ProviderLabel 'AppRiver' `
            -AppRoleMap $roleMap

        $auditResults.sections.appRiverPermissions[$tenantKey] = $appRiverData
    } catch {
        Write-Warning "Section 1 failed for ${tenantKey}: $($_.Exception.Message)"
        $auditResults.sections.appRiverPermissions[$tenantKey] = @{
            error   = $true
            message = $_.Exception.Message
        }
    } finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }

    Write-Host "  ✓ AppRiver audit done for $tenantKey" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════
# Section 2: Sui Generis Guest Account Details (HTT, TLL)
# ═══════════════════════════════════════════════════════════════
Write-Host "`n" -NoNewline
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "  SECTION 2: Sui Generis Guest Accounts" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

foreach ($tenantKey in $GuestAuditTenants) {
    $tenant = Get-CTUTenantList -TenantKey $tenantKey -Config $config
    Write-Host "`n── $($tenant.displayName) ($tenantKey) ──" -ForegroundColor Yellow

    try {
        Connect-CTUTenant -TenantKey $tenantKey -Config $config | Out-Null

        Write-CTUSection "Finding Sui Generis guests"
        $guestData = Get-SuiGenerisGuests

        $auditResults.sections.suiGenerisGuests[$tenantKey] = [ordered]@{
            guestCount = @($guestData).Count
            guests     = $guestData
        }
    } catch {
        Write-Warning "Section 2 failed for ${tenantKey}: $($_.Exception.Message)"
        $auditResults.sections.suiGenerisGuests[$tenantKey] = @{
            error   = $true
            message = $_.Exception.Message
        }
    } finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }

    Write-Host "  ✓ Guest audit done for $tenantKey" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════
# Section 3: Pax8 SP Permissions (HTT, FN, TLL)
# ═══════════════════════════════════════════════════════════════
Write-Host "`n" -NoNewline
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "  SECTION 3: Pax8 Service Principal Permissions" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

foreach ($tenantKey in $SPPermissionTenants) {
    $tenant = Get-CTUTenantList -TenantKey $tenantKey -Config $config
    Write-Host "`n── $($tenant.displayName) ($tenantKey) ──" -ForegroundColor Yellow

    try {
        Connect-CTUTenant -TenantKey $tenantKey -Config $config | Out-Null

        Write-CTUSection "Loading Graph app role map"
        $roleMap = Get-GraphAppRoleMap

        Write-CTUSection "Auditing Pax8 SP"
        $pax8Data = Get-SPPermissionDetails `
            -AppIds $Pax8AppIds `
            -ProviderLabel 'Pax8' `
            -AppRoleMap $roleMap

        $auditResults.sections.pax8Permissions[$tenantKey] = $pax8Data
    } catch {
        Write-Warning "Section 3 failed for ${tenantKey}: $($_.Exception.Message)"
        $auditResults.sections.pax8Permissions[$tenantKey] = @{
            error   = $true
            message = $_.Exception.Message
        }
    } finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }

    Write-Host "  ✓ Pax8 audit done for $tenantKey" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════
# Section 4: Azure Billing Accounts (HTT only)
# ═══════════════════════════════════════════════════════════════
Write-Host "`n" -NoNewline
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "  SECTION 4: Azure Billing Accounts (HTT)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

try {
    Write-CTUSection "Querying Azure billing via az CLI"
    $billingData = Get-AzureBillingInfo
    $auditResults.sections.azureBilling = $billingData
} catch {
    Write-Warning "Section 4 failed: $($_.Exception.Message)"
    $auditResults.sections.azureBilling = @{
        error   = $true
        message = $_.Exception.Message
    }
}

Write-Host "  ✓ Billing audit done" -ForegroundColor Green

# ── Save Results ─────────────────────────────────────────────
$totalElapsed = (Get-Date) - $totalStart
$auditResults['durationSeconds'] = [math]::Round($totalElapsed.TotalSeconds, 1)

$outputDir = Split-Path $OutputPath -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$auditResults | ConvertTo-Json -Depth 20 | Out-File $OutputPath -Encoding utf8

Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   PRE-CALL DEEP DIVE COMPLETE                          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Duration : $([math]::Round($totalElapsed.TotalMinutes, 1)) minutes" -ForegroundColor White
Write-Host "  Output   : $OutputPath" -ForegroundColor White
Write-Host ""

# ── Quick Summary ────────────────────────────────────────────
Write-Host "  Section 1 — AppRiver SPs:" -ForegroundColor Cyan
foreach ($key in $auditResults.sections.appRiverPermissions.Keys) {
    $data = $auditResults.sections.appRiverPermissions[$key]
    if ($data -is [hashtable] -and $data.ContainsKey('error')) {
        Write-Host "    ❌ $key — ERROR" -ForegroundColor Red
    } else {
        $spCount = @($data | Where-Object { $_.servicePrincipal }).Count
        Write-Host "    ✓ $key — $spCount SP(s) found" -ForegroundColor Green
    }
}

Write-Host "  Section 2 — Sui Generis Guests:" -ForegroundColor Cyan
foreach ($key in $auditResults.sections.suiGenerisGuests.Keys) {
    $data = $auditResults.sections.suiGenerisGuests[$key]
    if ($data -is [hashtable] -and $data.ContainsKey('error')) {
        Write-Host "    ❌ $key — ERROR" -ForegroundColor Red
    } else {
        $count = if ($data -is [hashtable]) { $data['guestCount'] } else { $data.guestCount }
        Write-Host "    ✓ $key — $count guest(s)" -ForegroundColor Green
    }
}

Write-Host "  Section 3 — Pax8 SPs:" -ForegroundColor Cyan
foreach ($key in $auditResults.sections.pax8Permissions.Keys) {
    $data = $auditResults.sections.pax8Permissions[$key]
    if ($data -is [hashtable] -and $data.ContainsKey('error')) {
        Write-Host "    ❌ $key — ERROR" -ForegroundColor Red
    } else {
        $spCount = @($data | Where-Object { $_.servicePrincipal }).Count
        Write-Host "    ✓ $key — $spCount SP(s) found" -ForegroundColor Green
    }
}

Write-Host "  Section 4 — Azure Billing:" -ForegroundColor Cyan
$billingResult = $auditResults.sections.azureBilling
if ($billingResult -is [hashtable] -and $billingResult.ContainsKey('error')) {
    Write-Host "    ❌ HTT — ERROR" -ForegroundColor Red
} else {
    $subCount = if ($billingResult -is [hashtable]) { @($billingResult['subscriptions']).Count } else { @($billingResult.subscriptions).Count }
    Write-Host "    ✓ HTT — $subCount subscription(s)" -ForegroundColor Green
}

Write-Host ""
