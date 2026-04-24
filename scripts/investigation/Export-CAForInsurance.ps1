<#
.SYNOPSIS
    Export raw Conditional Access policies + enrichment metadata for cyber
    insurance verification. READ-ONLY. No tenant state is modified.

.DESCRIPTION
    One-shot spot-check to answer the cyber insurance MFA/CA questions with
    full fidelity. Invoke-CTUConditionalAccessAudit returns a summarized
    shape that drops fields the insurance form hinges on:

      - policy.conditions.users.includeUsers / excludeUsers (named break-glass)
      - policy.conditions.users.includeGroups / excludeGroups (MFA sec groups)
      - policy.conditions.users.includeRoles  / excludeRoles  (Admin MFA)
      - policy.createdDateTime / modifiedDateTime (when did FN actually deploy?)

    This script pulls the RAW /identity/conditionalAccess/policies payload
    per tenant and additionally resolves every referenced group/user/role
    into a human-readable name so downstream analysis does not have to
    guess from GUIDs.

    Output folder:
        reports/Audit_ConditionalAccess_<yyyy-MM-dd>_VERIFY/

    Files per tenant:
        CA_Raw_<TENANT>.json         - Full policy objects from Graph v1.0
        CA_Enrichment_<TENANT>.json  - Resolved groups/users/roles + counts
    Top-level:
        manifest.json                - What was pulled, when, totals per tenant

    Read-only Graph scopes used (all covered by config/permissions.json
    minimumReadOnly):
        Policy.Read.All, Directory.Read.All, GroupMember.Read.All,
        RoleManagement.Read.Directory, User.Read.All

.PARAMETER TenantKey
    Tenant keys to export. Defaults to all 5.

.PARAMETER OutputDir
    Override the output directory. Defaults to
    reports/Audit_ConditionalAccess_<yyyy-MM-dd>_VERIFY.

.EXAMPLE
    ./scripts/investigation/Export-CAForInsurance.ps1
    # Interactive auth, all 5 tenants, default output folder.

.EXAMPLE
    ./scripts/investigation/Export-CAForInsurance.ps1 -TenantKey FN,TLL
    # Only re-verify the two problem children.

.NOTES
    Author   : CTU / cyber-insurance verification 2026-04-23
    Requires : pwsh 7+, Microsoft.Graph.Authentication, CTU.Core module
    Auth     : Interactive (browser/device code) - 1 login per tenant
#>
[CmdletBinding()]
param(
    [ValidateSet('HTT','BCC','FN','TLL','DCE')]
    [string[]]$TenantKey = @('HTT','BCC','FN','TLL','DCE'),

    [string]$OutputDir
)

$ErrorActionPreference = 'Stop'

# --- Resolve paths and load CTU.Core --------------------------------------
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Import-Module (Join-Path $repoRoot 'modules/CTU.Core/CTU.Core.psm1') -Force

if (-not $OutputDir) {
    $stamp     = Get-Date -Format 'yyyy-MM-dd'
    $OutputDir = Join-Path $repoRoot "reports/Audit_ConditionalAccess_${stamp}_VERIFY"
}
if (-not (Test-Path $OutputDir)) {
    $null = New-Item -ItemType Directory -Path $OutputDir -Force
}

$config   = Get-CTUConfig
$manifest = [ordered]@{
    tool        = 'Export-CAForInsurance.ps1'
    purpose     = 'Cyber insurance MFA/CA verification - read-only'
    exportedUtc = (Get-Date).ToUniversalTime().ToString('o')
    outputDir   = $OutputDir
    tenants     = [ordered]@{}
}

# --- Resolver helpers ------------------------------------------------------
# Keep these small and DRY. Each returns a PSCustomObject; on error it still
# returns a shape with .Id and .Error so downstream analysis does not explode.

function Resolve-CAGroup {
    param([Parameter(Mandatory)][string]$GroupId)
    try {
        $select = 'id,displayName,securityEnabled,mailEnabled,groupTypes,' +
                  'membershipRule,membershipRuleProcessingState,createdDateTime'
        $g = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/groups/$GroupId`?`$select=$select"

        $memberCount  = 0
        $guestMembers = 0
        try {
            $members = Invoke-CTUGraphRequest `
                -Uri "https://graph.microsoft.com/v1.0/groups/$GroupId/members?`$select=id,userPrincipalName,userType&`$top=999" `
                -AllPages
            $memberCount  = @($members).Count
            $guestMembers = @($members | Where-Object { $_.userType -eq 'Guest' }).Count
        } catch {
            Write-Warning "[CTU] Group $GroupId member enumeration failed: $_"
        }

        [PSCustomObject]@{
            Id                            = $g.id
            DisplayName                   = $g.displayName
            SecurityEnabled               = $g.securityEnabled
            MailEnabled                   = $g.mailEnabled
            GroupTypes                    = $g.groupTypes
            MembershipRule                = $g.membershipRule
            MembershipRuleProcessingState = $g.membershipRuleProcessingState
            CreatedDateTime               = $g.createdDateTime
            MemberCount                   = $memberCount
            GuestMemberCount              = $guestMembers
        }
    } catch {
        [PSCustomObject]@{ Id = $GroupId; Error = $_.Exception.Message }
    }
}

function Resolve-CAUser {
    param([Parameter(Mandatory)][string]$UserId)
    try {
        $select = 'id,userPrincipalName,displayName,userType,accountEnabled,createdDateTime'
        $u = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/users/$UserId`?`$select=$select"
        [PSCustomObject]@{
            Id                = $u.id
            UserPrincipalName = $u.userPrincipalName
            DisplayName       = $u.displayName
            UserType          = $u.userType
            AccountEnabled    = $u.accountEnabled
            CreatedDateTime   = $u.createdDateTime
        }
    } catch {
        [PSCustomObject]@{ Id = $UserId; Error = $_.Exception.Message }
    }
}

function Resolve-CARole {
    param([Parameter(Mandatory)][string]$RoleTemplateId)
    # CA policies reference directory role TEMPLATE IDs (well-known GUIDs).
    try {
        $r = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/directoryRoleTemplates/$RoleTemplateId`?`$select=id,displayName,description"
        [PSCustomObject]@{
            Id          = $r.id
            DisplayName = $r.displayName
            Description = $r.description
        }
    } catch {
        [PSCustomObject]@{ Id = $RoleTemplateId; Error = $_.Exception.Message }
    }
}

# --- Reserved CA scope tokens that are not real object IDs -----------------
$ReservedScopeTokens = @('All','None','GuestsOrExternalUsers')

function Get-ReferencedIds {
    param(
        [Parameter(Mandatory)][object[]]$Policies,
        [Parameter(Mandatory)][ValidateSet('Groups','Users','Roles')][string]$Kind
    )
    $includeProp = "include$Kind"
    $excludeProp = "exclude$Kind"
    $ids = @()
    foreach ($p in $Policies) {
        $u = $p.conditions.users
        if ($null -eq $u) { continue }
        if ($u.$includeProp) { $ids += @($u.$includeProp) }
        if ($u.$excludeProp) { $ids += @($u.$excludeProp) }
    }
    @($ids | Where-Object { $_ -and ($_ -notin $ReservedScopeTokens) } | Sort-Object -Unique)
}

# --- Main loop -------------------------------------------------------------
foreach ($tk in $TenantKey) {
    Write-Host ""
    Write-Host "========== $tk ==========" -ForegroundColor Cyan

    Connect-CTUTenant -TenantKey $tk -AuthMode Interactive -Config $config | Out-Null

    try {
        $rawPath = Join-Path $OutputDir "CA_Raw_$tk.json"
        Write-Host "  Pulling raw CA policies..." -ForegroundColor DarkGray
        $policies = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies" -AllPages
        $policies | ConvertTo-Json -Depth 25 | Out-File -FilePath $rawPath -Encoding utf8
        Write-Host "  ✓ Wrote $($rawPath | Split-Path -Leaf) ($($policies.Count) policies)" -ForegroundColor Green

        # --- Collect and resolve referenced objects --------------------------
        $groupIds = Get-ReferencedIds -Policies $policies -Kind Groups
        $userIds  = Get-ReferencedIds -Policies $policies -Kind Users
        $roleIds  = Get-ReferencedIds -Policies $policies -Kind Roles

        Write-Host "  Resolving $($groupIds.Count) groups, $($userIds.Count) users, $($roleIds.Count) roles..." -ForegroundColor DarkGray

        $enrichment = [ordered]@{
            tenantKey       = $tk
            tenantId        = (Get-CTUTenantList -TenantKey $tk -Config $config).tenantId
            pulledAtUtc     = (Get-Date).ToUniversalTime().ToString('o')
            policyCount     = $policies.Count
            enabledCount    = @($policies | Where-Object { $_.state -eq 'enabled' }).Count
            reportOnlyCount = @($policies | Where-Object { $_.state -eq 'enabledForReportingButNotEnforced' }).Count
            disabledCount   = @($policies | Where-Object { $_.state -eq 'disabled' }).Count
            groups          = @($groupIds | ForEach-Object { Resolve-CAGroup -GroupId $_ })
            users           = @($userIds  | ForEach-Object { Resolve-CAUser  -UserId  $_ })
            roles           = @($roleIds  | ForEach-Object { Resolve-CARole  -RoleTemplateId $_ })
        }

        $enrichPath = Join-Path $OutputDir "CA_Enrichment_$tk.json"
        $enrichment | ConvertTo-Json -Depth 20 | Out-File -FilePath $enrichPath -Encoding utf8
        Write-Host "  ✓ Wrote $($enrichPath | Split-Path -Leaf)" -ForegroundColor Green

        $manifest.tenants[$tk] = [ordered]@{
            tenantId    = $enrichment.tenantId
            policyCount = $enrichment.policyCount
            enabled     = $enrichment.enabledCount
            reportOnly  = $enrichment.reportOnlyCount
            disabled    = $enrichment.disabledCount
            raw         = ($rawPath    | Split-Path -Leaf)
            enrichment  = ($enrichPath | Split-Path -Leaf)
        }
    } finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null } catch {}
    }
}

# --- Write manifest --------------------------------------------------------
$manifestPath = Join-Path $OutputDir 'manifest.json'
$manifest | ConvertTo-Json -Depth 8 | Out-File -FilePath $manifestPath -Encoding utf8

Write-Host ""
Write-Host "✅ Export complete." -ForegroundColor Green
Write-Host "   Output: $OutputDir" -ForegroundColor Green
Write-Host "   Manifest: $($manifestPath | Split-Path -Leaf)" -ForegroundColor Green
Write-Host ""
