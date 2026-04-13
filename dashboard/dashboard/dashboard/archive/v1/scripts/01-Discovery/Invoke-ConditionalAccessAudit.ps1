<#
.SYNOPSIS
    Audit Conditional Access policies targeting external/guest users.
.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases.
.NOTES
    Permissions: Policy.Read.All
#>
[CmdletBinding()] param([string[]]$TenantFilter)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force

Write-Host "`n=== HTT Brands: Conditional Access Audit (External Users) ===" -ForegroundColor Magenta

$auditResults = Connect-HTTAllTenants -TenantFilter $TenantFilter -ScriptBlock {
    param($Tenant)
    $result = [ordered]@{ TenantAlias=$Tenant.Alias; TenantId=$Tenant.TenantId; AuditTime=(Get-Date -Format "o"); TotalPolicies=0; EnabledPolicies=0; ExternalTargeting=@(); CoverageGaps=@(); Findings=@() }

    Write-HTTSection "Conditional Access Policies"
    try {
        $policies = Get-MgIdentityConditionalAccessPolicy -All
        $result.TotalPolicies = @($policies).Count
        $result.EnabledPolicies = @($policies | Where-Object { $_.State -eq "enabled" }).Count
        Write-HTTFinding -Severity INFO -Message "Total: $($result.TotalPolicies) | Enabled: $($result.EnabledPolicies)"

        $hasMFA = $false; $hasLegacyBlock = $false; $hasSession = $false

        foreach ($p in $policies) {
            $inc = $p.Conditions.Users.IncludeGuestsOrExternalUsers
            $exc = $p.Conditions.Users.ExcludeGuestsOrExternalUsers
            if ($inc -or $exc) {
                $detail = [ordered]@{
                    Name=$p.DisplayName; State=$p.State
                    IncludeTypes=$inc.GuestOrExternalUserTypes; IncludeScope=$inc.ExternalTenants.MembershipKind
                    ExcludeTypes=$exc.GuestOrExternalUserTypes
                    Grants=($p.GrantControls.BuiltInControls -join ","); ClientApps=($p.Conditions.ClientAppTypes -join ",")
                }
                $result.ExternalTargeting += [PSCustomObject]$detail
                Write-HTTFinding -Severity INFO -Message "  [$($p.State)] $($p.DisplayName)"
                if ($inc) { Write-HTTFinding -Severity INFO -Message "    Targets: $($inc.GuestOrExternalUserTypes)" }
                if ($exc) { Write-HTTFinding -Severity MEDIUM -Message "    EXCLUDES: $($exc.GuestOrExternalUserTypes)"; $result.Findings += @{Severity="MEDIUM";Detail="'$($p.DisplayName)' excludes external types"} }

                if ($p.State -eq "enabled" -and $p.GrantControls.BuiltInControls -contains "mfa" -and $inc.GuestOrExternalUserTypes -match "b2bCollaboration") { $hasMFA = $true }
                if ($p.State -eq "enabled" -and $p.GrantControls.BuiltInControls -contains "block" -and ($p.Conditions.ClientAppTypes -contains "exchangeActiveSync" -or $p.Conditions.ClientAppTypes -contains "other")) { $hasLegacyBlock = $true }
                if ($p.State -eq "enabled" -and $p.SessionControls.SignInFrequency.Value) { $hasSession = $true }
            }
        }

        Write-HTTSection "Coverage Gaps"
        if (-not $hasMFA) { Write-HTTFinding -Severity HIGH -Message "NO MFA policy for external users"; $result.Findings += @{Severity="HIGH";Detail="No external user MFA policy"}; $result.CoverageGaps += "MFA" }
        else { Write-HTTFinding -Severity OK -Message "External user MFA policy found" }
        if (-not $hasLegacyBlock) { Write-HTTFinding -Severity HIGH -Message "NO legacy auth block for external users"; $result.Findings += @{Severity="HIGH";Detail="No legacy auth block"}; $result.CoverageGaps += "LegacyAuth" }
        else { Write-HTTFinding -Severity OK -Message "Legacy auth block found" }
        if (-not $hasSession) { Write-HTTFinding -Severity MEDIUM -Message "No session frequency control"; $result.CoverageGaps += "SessionFreq" }
        else { Write-HTTFinding -Severity OK -Message "Session frequency found" }
    } catch { Write-HTTFinding -Severity CRITICAL -Message "CA read failed: $_"; $result.Findings += @{Severity="CRITICAL";Detail="$_"} }
    return [PSCustomObject]$result
}

Export-HTTReport -ReportName "ConditionalAccessAudit" -Data $auditResults
Write-Host "`nConditional Access audit complete.`n" -ForegroundColor Magenta
