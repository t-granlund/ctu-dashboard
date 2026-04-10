<#
.SYNOPSIS
    Audit MSP/CSP/partner relationships across all HTT Brands tenants.

.DESCRIPTION
    READ-ONLY audit that pulls GDAP relationships, MSP service principals,
    partner policies, admin role assignments, org info, and subscribed SKUs
    from each of the 5 HTT Brands tenants (HTT, BCC, FN, TLL, DCE).

    Results are saved to reports/msp-relationship-audit.json for use in
    the CTU Dashboard MSP Walkthrough component.

.PARAMETER TenantFilter
    Optional array of tenant aliases to audit. Defaults to all 5 tenants.

.PARAMETER OutputPath
    Path for the JSON output file. Defaults to reports/msp-relationship-audit.json.

.EXAMPLE
    ./Audit-MSPRelationships.ps1
    # Audits all 5 tenants interactively

.EXAMPLE
    ./Audit-MSPRelationships.ps1 -TenantFilter HTT, BCC
    # Audits only HTT and BCC

.NOTES
    Author : Richard (code-puppy-cc63da, updated by code-puppy-aded1f)
    Created: 2025-05
    Updated: 2025-05 - Fixed StrictMode property access bugs
    Requires: Microsoft.Graph PowerShell SDK, CTU.Core module
    This is a READ-ONLY audit — no changes are made to any tenant.
#>

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('HTT','BCC','FN','TLL','DCE')]
    [string[]]$TenantFilter,

    [Parameter()]
    [string]$OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

# ── Bootstrap ────────────────────────────────────────────────
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Import-Module (Join-Path $repoRoot 'modules' 'CTU.Core' 'CTU.Core.psm1') -Force

$config = Get-CTUConfig
$tenants = Get-CTUTenantList -Config $config

if ($TenantFilter) {
    $tenants = $tenants | Where-Object { $_.Key -in $TenantFilter }
}

if (-not $OutputPath) {
    $OutputPath = Join-Path $repoRoot 'reports' 'msp-relationship-audit.json'
}

# Known MSP/distributor tenant IDs for service principal filtering
$knownMSPTenantIds = @{
    '3de67d67-88e8-42c0-88ea-13bfc2fc2f55' = 'PAX8 US'
    'd5e2dca7-948b-4e7c-9d9e-af97e9ca0f92' = 'AppRiver'
    'ff1b2576-d461-4916-97dc-7ada1cd798dc' = 'TD SYNNEX US (Stellr)'
    'd5c77776-8b4c-4ceb-81da-566aba9c59c5' = 'TD SYNNEX US (SCM)'
    '5d9ef8ec-bf67-442a-8855-7e9f7c7199c7' = 'The Riverside Company'
    'a27ac673-9a4c-446c-bd28-280c0bf7cf71' = 'Ingram Micro Inc'
    'daee2992-bedc-4b96-840d-3cb1ffa89d10' = 'Sui Generis Incorporated'
    'b4c546a4-7dac-46a6-a7dd-ed822a11efd3' = 'Office 365'
    '248c9920-7745-4f81-8e18-1a5de9935bbd' = 'Franworth'
}

# MSP-related keywords for service principal name matching
$mspKeywords = @(
    'pax8', 'appriver', 'datto', 'autotask', 'connectwise',
    'n-able', 'kaseya', 'ninja', 'synnex', 'ingram', 'td synnex',
    'franworth', 'riverside', 'sui generis'
)

# ── Per-Tenant Audit Function ────────────────────────────────

function Invoke-MSPAudit {
    param([PSCustomObject]$Tenant)

    $result = [ordered]@{
        tenantKey       = $Tenant.Key
        displayName     = $Tenant.displayName
        tenantId        = $Tenant.tenantId
        auditTimestamp  = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
        gdapRelationships    = @()
        gdapCustomers        = @()
        mspServicePrincipals = @()
        partnerPolicies      = @()
        mspRoleAssignments   = @()
        subscribedSkus       = @()
        organizationInfo     = $null
        errors               = @()
    }

    # ── 1. GDAP Relationships ────────────────────────────────
    Write-CTUSection "GDAP Relationships"
    try {
        $gdap = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/tenantRelationships/delegatedAdminRelationships' `
            -AllPages
        if ($gdap) {
            # Filter out OData wrappers — only process items that have an 'id'
            $gdapItems = @($gdap | Where-Object {
                $_ -is [hashtable] -or ($_.PSObject.Properties.Name -contains 'id')
            })
            $result.gdapRelationships = @($gdapItems | ForEach-Object {
                $item = $_
                [ordered]@{
                    id                = if ($item -is [hashtable]) { $item['id'] } else { $item.id }
                    displayName       = if ($item -is [hashtable]) { $item['displayName'] } else { $item.displayName }
                    partner           = if ($item -is [hashtable]) { $item['partner'] } else { $item.partner }
                    status            = if ($item -is [hashtable]) { $item['status'] } else { $item.status }
                    createdDateTime   = if ($item -is [hashtable]) { $item['createdDateTime'] } else { $item.createdDateTime }
                    endDateTime       = if ($item -is [hashtable]) { $item['endDateTime'] } else { $item.endDateTime }
                    duration          = if ($item -is [hashtable]) { $item['duration'] } else { $item.duration }
                    autoExtendDuration = if ($item -is [hashtable]) { $item['autoExtendDuration'] } else { $item.autoExtendDuration }
                    accessDetails     = if ($item -is [hashtable]) { $item['accessDetails'] } else { $item.accessDetails }
                    customer          = if ($item -is [hashtable]) { $item['customer'] } else { $item.customer }
                }
            })
            Write-CTUFinding -Severity INFO -Message "Found $($result.gdapRelationships.Count) GDAP relationship(s)"
        } else {
            Write-CTUFinding -Severity INFO -Message "No GDAP relationships found"
        }
    } catch {
        $msg = "GDAP query failed: $($_.Exception.Message)"
        Write-CTUFinding -Severity MEDIUM -Message $msg
        $result.errors += $msg
    }

    # ── 1b. GDAP Customers ───────────────────────────────────
    try {
        $gdapCustomers = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/tenantRelationships/delegatedAdminCustomers' `
            -AllPages -ErrorAction SilentlyContinue
        if ($gdapCustomers) {
            $result.gdapCustomers = @($gdapCustomers)
            Write-CTUFinding -Severity INFO -Message "Found $($gdapCustomers.Count) GDAP customer(s)"
        }
    } catch {
        # This endpoint often requires specific permissions — not critical
        $result.errors += "GDAP customers query failed (may require DelegatedAdminRelationship.Read.All)"
    }

    # ── 2. Service Principals from MSP Tenants ───────────────
    Write-CTUSection "MSP Service Principals"
    try {
        $allSPs = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/servicePrincipals?$top=999&$select=displayName,appId,appOwnerOrganizationId,servicePrincipalType,accountEnabled,createdDateTime' `
            -AllPages

        if ($allSPs) {
            # Filter by known MSP tenant IDs
            $mspByTenantId = @($allSPs | Where-Object {
                $_.appOwnerOrganizationId -and
                $knownMSPTenantIds.ContainsKey($_.appOwnerOrganizationId)
            })

            # Filter by MSP keywords in display name
            $mspByName = @($allSPs | Where-Object {
                $name = $_.displayName
                if (-not $name) { return $false }
                foreach ($kw in $mspKeywords) {
                    if ($name -match [regex]::Escape($kw)) { return $true }
                }
                return $false
            })

            # Merge unique results
            $allMSPSPs = @($mspByTenantId + $mspByName | Sort-Object -Property appId -Unique)

            $result.mspServicePrincipals = @($allMSPSPs | ForEach-Object {
                $ownerName = if ($_.appOwnerOrganizationId -and $knownMSPTenantIds.ContainsKey($_.appOwnerOrganizationId)) {
                    $knownMSPTenantIds[$_.appOwnerOrganizationId]
                } else { 'Unknown' }

                [ordered]@{
                    displayName              = $_.displayName
                    appId                    = $_.appId
                    appOwnerOrganizationId   = $_.appOwnerOrganizationId
                    appOwnerName             = $ownerName
                    servicePrincipalType     = $_.servicePrincipalType
                    accountEnabled           = $_.accountEnabled
                    createdDateTime          = $_.createdDateTime
                }
            })
            Write-CTUFinding -Severity INFO -Message "Found $($result.mspServicePrincipals.Count) MSP-related service principal(s) (from $($allSPs.Count) total)"
        }
    } catch {
        $msg = "Service principal query failed: $($_.Exception.Message)"
        Write-CTUFinding -Severity MEDIUM -Message $msg
        $result.errors += $msg
    }

    # ── 3. Partner Policies (Cross-Tenant Access) ────────────
    Write-CTUSection "Partner Policies"
    try {
        $partners = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners' `
            -AllPages
        if ($partners) {
            $result.partnerPolicies = @($partners | ForEach-Object {
                $partnerId = $_.tenantId
                $partnerName = if ($knownMSPTenantIds.ContainsKey($partnerId)) {
                    $knownMSPTenantIds[$partnerId]
                } else { 'Unknown' }

                # Safely access properties that may not exist under StrictMode
                $p = $_
                $safeGet = { param($obj, $prop) if ($obj -is [hashtable]) { $obj[$prop] } elseif ($obj.PSObject.Properties.Name -contains $prop) { $obj.$prop } else { $null } }
                [ordered]@{
                    tenantId                           = $partnerId
                    partnerName                        = $partnerName
                    isServiceProvider                  = & $safeGet $p 'isServiceProvider'
                    isInMultiTenantOrganization        = & $safeGet $p 'isInMultiTenantOrganization'
                    b2bCollaborationInbound            = & $safeGet $p 'b2bCollaborationInbound'
                    b2bCollaborationOutbound           = & $safeGet $p 'b2bCollaborationOutbound'
                    b2bDirectConnectInbound            = & $safeGet $p 'b2bDirectConnectInbound'
                    b2bDirectConnectOutbound           = & $safeGet $p 'b2bDirectConnectOutbound'
                    inboundTrust                       = & $safeGet $p 'inboundTrust'
                    automaticUserConsentSettings       = & $safeGet $p 'automaticUserConsentSettings'
                    identitySynchronization            = & $safeGet $p 'identitySynchronization'
                    tenantRestrictions                 = & $safeGet $p 'tenantRestrictions'
                }
            })
            Write-CTUFinding -Severity INFO -Message "Found $($result.partnerPolicies.Count) partner policy/policies"
        } else {
            Write-CTUFinding -Severity INFO -Message "No partner policies found"
        }
    } catch {
        $msg = "Partner policies query failed: $($_.Exception.Message)"
        Write-CTUFinding -Severity MEDIUM -Message $msg
        $result.errors += $msg
    }

    # ── 4. Admin Role Assignments to MSP Principals ──────────
    Write-CTUSection "MSP Role Assignments"
    try {
        # Get role definitions first
        $roleDefs = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/roleManagement/directory/roleDefinitions?$select=id,displayName' `
            -AllPages
        $roleMap = @{}
        foreach ($rd in $roleDefs) { $roleMap[$rd.id] = $rd.displayName }

        # Get all role assignments
        $roleAssignments = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignments' `
            -AllPages

        if ($roleAssignments -and $result.mspServicePrincipals.Count -gt 0) {
            $mspAppIds = @($result.mspServicePrincipals | ForEach-Object { $_.appId })
            $mspSPObjectIds = @()

            # Resolve MSP SP object IDs
            foreach ($sp in $result.mspServicePrincipals) {
                try {
                    $spObj = Invoke-CTUGraphRequest `
                        -Uri "https://graph.microsoft.com/v1.0/servicePrincipals(appId='$($sp.appId)')?`$select=id"
                    if ($spObj.id) { $mspSPObjectIds += $spObj.id }
                } catch { <# Skip if not resolvable #> }
            }

            $mspAssignments = @($roleAssignments | Where-Object {
                $_.principalId -in $mspSPObjectIds
            })

            $result.mspRoleAssignments = @($mspAssignments | ForEach-Object {
                [ordered]@{
                    roleDefinitionId = $_.roleDefinitionId
                    roleName         = $roleMap[$_.roleDefinitionId]
                    principalId      = $_.principalId
                    directoryScopeId = $_.directoryScopeId
                }
            })
            Write-CTUFinding -Severity INFO -Message "Found $($result.mspRoleAssignments.Count) role assignment(s) to MSP principals"
        } else {
            Write-CTUFinding -Severity INFO -Message "No MSP role assignments found (or no MSP SPs to match)"
        }
    } catch {
        $msg = "Role assignments query failed: $($_.Exception.Message)"
        Write-CTUFinding -Severity MEDIUM -Message $msg
        $result.errors += $msg
    }

    # ── 5. Organization Info ─────────────────────────────────
    Write-CTUSection "Organization Info"
    try {
        $orgInfo = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/organization?$select=id,displayName,verifiedDomains,tenantType,assignedPlans,companyLastDirSyncTime,onPremisesLastSyncDateTime,partnerTenantType'
        if ($orgInfo) {
            $org = if ($orgInfo -is [array]) { $orgInfo[0] } else { $orgInfo }
            # Safely access properties — some may be absent under StrictMode
            $safeOrg = { param($prop) if ($org -is [hashtable]) { $org[$prop] } elseif ($org.PSObject.Properties.Name -contains $prop) { $org.$prop } else { $null } }
            $result.organizationInfo = [ordered]@{
                id                  = & $safeOrg 'id'
                displayName         = & $safeOrg 'displayName'
                tenantType          = & $safeOrg 'tenantType'
                partnerTenantType   = & $safeOrg 'partnerTenantType'
                verifiedDomains     = & $safeOrg 'verifiedDomains'
                companyLastDirSync  = & $safeOrg 'companyLastDirSyncTime'
            }
            Write-CTUFinding -Severity INFO -Message "Org: $($org.displayName) ($($org.tenantType))"
        }
    } catch {
        $msg = "Organization query failed: $($_.Exception.Message)"
        Write-CTUFinding -Severity LOW -Message $msg
        $result.errors += $msg
    }

    # ── 6. Subscribed SKUs (Licenses) ────────────────────────
    Write-CTUSection "Subscribed SKUs"
    try {
        $skus = Invoke-CTUGraphRequest `
            -Uri 'https://graph.microsoft.com/v1.0/subscribedSkus' `
            -AllPages
        if ($skus) {
            $result.subscribedSkus = @($skus | ForEach-Object {
                [ordered]@{
                    skuPartNumber  = $_.skuPartNumber
                    skuId          = $_.skuId
                    appliesTo      = $_.appliesTo
                    capabilityStatus = $_.capabilityStatus
                    consumedUnits  = $_.consumedUnits
                    prepaidUnits   = $_.prepaidUnits
                }
            })
            $totalLicenses = ($skus | Measure-Object -Property { $_.prepaidUnits.enabled } -Sum).Sum
            $totalConsumed = ($skus | Measure-Object -Property consumedUnits -Sum).Sum
            Write-CTUFinding -Severity INFO -Message "Found $($skus.Count) SKU(s) — ~$totalConsumed consumed"
        }
    } catch {
        $msg = "Subscribed SKUs query failed: $($_.Exception.Message)"
        Write-CTUFinding -Severity LOW -Message $msg
        $result.errors += $msg
    }

    return [PSCustomObject]$result
}

# ── Main Execution ───────────────────────────────────────────
Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   MSP/CSP Relationship Audit — HTT Brands (READ-ONLY)  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Tenants : $($tenants.Count)" -ForegroundColor White
Write-Host "  Output  : $OutputPath" -ForegroundColor White
Write-Host ""

$auditResults = [ordered]@{
    auditDate   = (Get-Date -Format 'yyyy-MM-dd')
    auditTime   = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
    generatedBy = 'Audit-MSPRelationships.ps1'
    tenantCount = $tenants.Count
    tenants     = [ordered]@{}
}

$totalStart = Get-Date

foreach ($tenant in $tenants) {
    $tenantStart = Get-Date
    Write-Host "`n" -NoNewline
    Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  $($tenant.displayName) ($($tenant.Key)) — $($tenant.tenantId)" -ForegroundColor Yellow
    Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Yellow

    try {
        Connect-CTUTenant -TenantKey $tenant.Key -Config $config | Out-Null
        $tenantData = Invoke-MSPAudit -Tenant $tenant
        $auditResults.tenants[$tenant.Key] = $tenantData
    } catch {
        Write-Warning "Failed to audit $($tenant.Key): $($_.Exception.Message)"
        $auditResults.tenants[$tenant.Key] = [ordered]@{
            tenantKey  = $tenant.Key
            error      = $true
            message    = $_.Exception.Message
        }
    } finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
    }

    $elapsed = (Get-Date) - $tenantStart
    Write-Host "`n  ✓ $($tenant.Key) completed in $([math]::Round($elapsed.TotalSeconds, 1))s" -ForegroundColor Green
}

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
Write-Host "║   MSP AUDIT COMPLETE                                    ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Tenants audited : $($tenants.Count)" -ForegroundColor White
Write-Host "  Duration        : $([math]::Round($totalElapsed.TotalMinutes, 1)) minutes" -ForegroundColor White
Write-Host "  Output          : $OutputPath" -ForegroundColor White
Write-Host ""

# ── Quick Summary ────────────────────────────────────────────
foreach ($key in $auditResults.tenants.Keys) {
    $t = $auditResults.tenants[$key]
    $hasError = ($t -is [hashtable] -and $t.ContainsKey('error')) -or ($t.PSObject.Properties.Name -contains 'error' -and $t.error)
    if ($hasError) {
        $errMsg = if ($t -is [hashtable]) { $t['message'] } else { $t.message }
        Write-Host "  ❌ $key — ERROR: $errMsg" -ForegroundColor Red
    } else {
        $gdapCount    = @($t.gdapRelationships).Count
        $spCount      = @($t.mspServicePrincipals).Count
        $partnerCount = @($t.partnerPolicies).Count
        $roleCount    = @($t.mspRoleAssignments).Count
        $skuCount     = @($t.subscribedSkus).Count
        Write-Host "  ✓ $key — GDAP:$gdapCount  SPs:$spCount  Partners:$partnerCount  Roles:$roleCount  SKUs:$skuCount" -ForegroundColor Cyan
    }
}

Write-Host ""
