<#
.SYNOPSIS
    Executes B1 safe subset: QW1 guest invite restriction + QW3 email-verified self-join disable.

.DESCRIPTION
    This is intentionally narrower than Invoke-Phase2QuickWins.ps1. It only patches
    Microsoft Graph authorizationPolicy properties that affect future guest creation
    and self-join behavior. It does not remove users, change existing guest access,
    enforce MFA, alter Teams federation, or modify Conditional Access.

    UX impact: existing users and guests retain access. This only changes who can
    create future guest invites and whether external users can self-join via email
    verification.

.PARAMETER TenantKey
    Tenant to remediate.

.PARAMETER Execute
    Apply changes. Without -Execute, read-only preview.

.NOTES
    Safety: snapshots before write, read-after-write validation, report emitted.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('HTT','BCC','FN','TLL','DCE')]
    [string]$TenantKey,

    [switch]$Execute
)

$ErrorActionPreference = 'Stop'

$Tenants = @{
    HTT = @{ Id = '0c0e35dc-188a-4eb3-b8ba-61752154b407'; Name = 'Head to Toe Brands' }
    BCC = @{ Id = 'b5380912-79ec-452d-a6ca-6d897b19b294'; Name = 'Bishops Cuts/Color' }
    FN  = @{ Id = '98723287-044b-4bbb-9294-19857d4128a0'; Name = 'Frenchies Modern Nail Care' }
    TLL = @{ Id = '3c7d2bf3-b597-4766-b5cb-2b489c2904d6'; Name = 'The Lash Lounge' }
    DCE = @{ Id = 'ce62e17d-2feb-4e67-a115-8ea4af68da30'; Name = 'Delta Crown Extensions' }
}

$Tenant = $Tenants[$TenantKey]
$RunStamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$ReportsDir = Join-Path $PSScriptRoot '..' '..' 'reports'
$SnapshotDir = Join-Path $ReportsDir 'snapshots' $RunStamp
New-Item -ItemType Directory -Path $SnapshotDir -Force | Out-Null

$Scopes = @(
    'Policy.Read.All',
    'Policy.ReadWrite.Authorization',
    'Directory.Read.All'
)

$Target = [ordered]@{
    allowInvitesFrom = 'adminsAndGuestInviters'
    allowEmailVerifiedUsersToJoinOrganization = $false
}

function Write-Step($Message, $Color = 'White') {
    Write-Host $Message -ForegroundColor $Color
}

try {
    Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null

    Write-Step "`n=== B1 SAFE GUEST CLEANUP: $($Tenant.Name) ($TenantKey) ===" Cyan
    Write-Step 'Device auth required. Open https://login.microsoft.com/device and enter the code below.' Yellow
    Connect-MgGraph -TenantId $Tenant.Id -Scopes $Scopes -UseDeviceCode -NoWelcome

    $Context = Get-MgContext
    if (-not $Context -or $Context.TenantId -ne $Tenant.Id) {
        throw "Connected to unexpected tenant '$($Context.TenantId)'; expected '$($Tenant.Id)'."
    }

    $PolicyUri = 'https://graph.microsoft.com/v1.0/policies/authorizationPolicy'
    $Before = Invoke-MgGraphRequest -Uri $PolicyUri -Method GET

    $BeforePath = Join-Path $SnapshotDir "B1_${TenantKey}_authorizationPolicy_before.json"
    $Before | ConvertTo-Json -Depth 20 | Out-File $BeforePath -Encoding utf8

    $Current = [ordered]@{
        allowInvitesFrom = $Before.allowInvitesFrom
        allowEmailVerifiedUsersToJoinOrganization = $Before.allowEmailVerifiedUsersToJoinOrganization
    }

    $Patch = @{}
    foreach ($Key in $Target.Keys) {
        if ("$($Current[$Key])" -ne "$($Target[$Key])") {
            $Patch[$Key] = $Target[$Key]
        }
    }

    Write-Step "`nCurrent state:" White
    Write-Step "  allowInvitesFrom: $($Current.allowInvitesFrom)" $(if ($Current.allowInvitesFrom -eq $Target.allowInvitesFrom) { 'Green' } else { 'Yellow' })
    Write-Step "  allowEmailVerifiedUsersToJoinOrganization: $($Current.allowEmailVerifiedUsersToJoinOrganization)" $(if ($Current.allowEmailVerifiedUsersToJoinOrganization -eq $Target.allowEmailVerifiedUsersToJoinOrganization) { 'Green' } else { 'Yellow' })

    if ($Patch.Count -eq 0) {
        Write-Step "`nNo changes needed. Tenant already matches B1 safe target." Green
        $Status = 'NO_CHANGE'
    }
    elseif (-not $Execute) {
        Write-Step "`nWHATIF only. Would patch:" Yellow
        $Patch.GetEnumerator() | ForEach-Object { Write-Step "  $($_.Key): $($Current[$_.Key]) -> $($_.Value)" Yellow }
        $Status = 'WOULD_CHANGE'
    }
    else {
        Write-Step "`nApplying PATCH to authorizationPolicy..." Red
        $Patch.GetEnumerator() | ForEach-Object { Write-Step "  $($_.Key): $($Current[$_.Key]) -> $($_.Value)" Red }
        Invoke-MgGraphRequest -Uri $PolicyUri -Method PATCH -Body $Patch
        Start-Sleep -Seconds 2
        $Status = 'CHANGED'
    }

    $After = Invoke-MgGraphRequest -Uri $PolicyUri -Method GET
    $AfterPath = Join-Path $SnapshotDir "B1_${TenantKey}_authorizationPolicy_after.json"
    $After | ConvertTo-Json -Depth 20 | Out-File $AfterPath -Encoding utf8

    $Validated = (
        "$($After.allowInvitesFrom)" -eq "$($Target.allowInvitesFrom)" -and
        "$($After.allowEmailVerifiedUsersToJoinOrganization)" -eq "$($Target.allowEmailVerifiedUsersToJoinOrganization)"
    )

    Write-Step "`nAfter state:" White
    Write-Step "  allowInvitesFrom: $($After.allowInvitesFrom)" $(if ($After.allowInvitesFrom -eq $Target.allowInvitesFrom) { 'Green' } else { 'Red' })
    Write-Step "  allowEmailVerifiedUsersToJoinOrganization: $($After.allowEmailVerifiedUsersToJoinOrganization)" $(if ($After.allowEmailVerifiedUsersToJoinOrganization -eq $Target.allowEmailVerifiedUsersToJoinOrganization) { 'Green' } else { 'Red' })

    $Result = [PSCustomObject]@{
        TenantKey = $TenantKey
        TenantName = $Tenant.Name
        TenantId = $Tenant.Id
        Mode = if ($Execute) { 'EXECUTE' } else { 'WHATIF' }
        Status = $Status
        Validated = $Validated
        Before = $Current
        Target = $Target
        After = [ordered]@{
            allowInvitesFrom = $After.allowInvitesFrom
            allowEmailVerifiedUsersToJoinOrganization = $After.allowEmailVerifiedUsersToJoinOrganization
        }
        UxImpact = 'No existing users, guests, memberships, sign-ins, Teams access, Conditional Access policies, or resources changed. Only future guest invitation/self-join behavior affected.'
        SnapshotBefore = $BeforePath
        SnapshotAfter = $AfterPath
        Timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    }

    $ReportPath = Join-Path $ReportsDir "B1SafeGuestCleanup_${TenantKey}_${RunStamp}.json"
    $Result | ConvertTo-Json -Depth 20 | Out-File $ReportPath -Encoding utf8

    if ($Execute -and -not $Validated) {
        throw "Post-change validation failed for $TenantKey. See $ReportPath"
    }

    Write-Step "`nResult: $Status | Validated: $Validated" $(if ($Validated) { 'Green' } else { 'Red' })
    Write-Step "Report: $ReportPath" Gray
}
finally {
    Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
}
