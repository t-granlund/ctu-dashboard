<#
.SYNOPSIS
    Enumerate all guest users across HTT tenants with sign-in activity,
    source tenant ID, stale detection, and privileged role membership.
.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases.
.PARAMETER StaleThresholdDays
    Days since last sign-in to flag stale. Default: 90.
.NOTES
    Permissions: User.Read.All, AuditLog.Read.All, Directory.Read.All
    License: Entra ID P1/P2 (for signInActivity)
#>
[CmdletBinding()] param([string[]]$TenantFilter, [int]$StaleThresholdDays = 90)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force
$config = Get-HTTConfig; $staleDate = (Get-Date).AddDays(-$StaleThresholdDays)

Write-Host "`n=== HTT Brands: Guest User Inventory (stale threshold: ${StaleThresholdDays}d) ===" -ForegroundColor Magenta

$auditResults = Connect-HTTAllTenants -TenantFilter $TenantFilter -ScriptBlock {
    param($Tenant)
    $result = [ordered]@{ TenantAlias=$Tenant.Alias; TenantId=$Tenant.TenantId; AuditTime=(Get-Date -Format "o"); GuestCount=0; StaleCount=0; HTTInternal=0; TrueExternal=0; InPrivRoles=0; Guests=@(); Findings=@() }

    Write-HTTSection "Guest Users"
    try {
        $props = "id,displayName,userPrincipalName,mail,userType,externalUserState,createdDateTime,creationType,signInActivity,identities,jobTitle,department,companyName,accountEnabled"
        $guests = Get-MgUser -Filter "userType eq 'Guest'" -All -Property $props -CountVariable gc -ConsistencyLevel eventual
        $result.GuestCount = @($guests).Count
        Write-HTTFinding -Severity INFO -Message "Found $($result.GuestCount) guests"

        foreach ($g in $guests) {
            $domain = ""; if ($g.UserPrincipalName -match "^(.+?)_([^#]+)#EXT#@") { $domain = $Matches[2] } elseif ($g.Mail) { $domain = ($g.Mail -split "@")[1] }
            $isHTT = $domain -in $config.domainAllowlist
            $lastSign = $g.SignInActivity.LastSuccessfulSignInDateTime
            $isStale = if ($null -eq $lastSign) { $g.CreatedDateTime -lt $staleDate } else { $lastSign -lt $staleDate }
            $result.Guests += [PSCustomObject]@{ Id=$g.Id; DisplayName=$g.DisplayName; UPN=$g.UserPrincipalName; Mail=$g.Mail; SourceDomain=$domain; IsHTTInternal=$isHTT; CreationType=$g.CreationType; InvitationState=$g.ExternalUserState; Created=$g.CreatedDateTime; LastSignIn=$lastSign; IsStale=$isStale; Enabled=$g.AccountEnabled; JobTitle=$g.JobTitle; Department=$g.Department }
            if ($isHTT) { $result.HTTInternal++ } else { $result.TrueExternal++ }
            if ($isStale) { $result.StaleCount++ }
        }
        if ($result.StaleCount -gt 0) { Write-HTTFinding -Severity MEDIUM -Message "$($result.StaleCount) stale guests (no sign-in in ${StaleThresholdDays}d)"; $result.Findings += @{Severity="MEDIUM";Detail="$($result.StaleCount) stale guests"} }
        Write-HTTFinding -Severity INFO -Message "HTT-internal: $($result.HTTInternal) | External: $($result.TrueExternal)"
    } catch { Write-HTTFinding -Severity CRITICAL -Message "Guest enum failed: $_"; $result.Findings += @{Severity="CRITICAL";Detail="$_"} }

    # Guests in privileged roles
    Write-HTTSection "Guests in Privileged Roles"
    try {
        foreach ($g in $result.Guests) {
            $roles = Get-MgUserTransitiveMemberOf -UserId $g.Id -EA SilentlyContinue
            $dirRoles = $roles | Where-Object { $_.AdditionalProperties.'@odata.type' -eq '#microsoft.graph.directoryRole' }
            foreach ($r in $dirRoles) {
                $rn = $r.AdditionalProperties.displayName
                Write-HTTFinding -Severity CRITICAL -Message "Guest '$($g.DisplayName)' has role: $rn"
                $result.Findings += @{Severity="CRITICAL"; Detail="Guest $($g.DisplayName) in role: $rn"}
                $result.InPrivRoles++
            }
        }
        if ($result.InPrivRoles -eq 0) { Write-HTTFinding -Severity OK -Message "No guests in privileged roles" }
    } catch { Write-HTTFinding -Severity HIGH -Message "Priv role check failed: $_" }

    return [PSCustomObject]$result
}

Export-HTTReport -ReportName "GuestUserInventory" -Data $auditResults
# Flat CSV of all guests
$all = @(); foreach ($a in $auditResults.Keys) { foreach ($g in $auditResults[$a].Guests) { $g | Add-Member -NotePropertyName HostTenant -NotePropertyValue $a -Force; $all += $g } }
if ($all.Count -gt 0) { Export-HTTReport -ReportName "AllGuests" -Data $all -AlsoExportCsv }
Write-Host "`nGuest inventory complete.`n" -ForegroundColor Magenta
