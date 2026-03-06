<#
.SYNOPSIS
    Fix cross-tenant sync userType mapping from Guest to Member.
.DESCRIPTION
    Addresses the issue where sync provisions HTT corporate users as Guests in
    brand tenants (e.g., Noelle Peter synced to TLL as Guest, blocking Teams/SP access).
    Requires: Synchronization.ReadWrite.All
.PARAMETER TenantFilter
    Limit to specific tenant aliases.
.EXAMPLE
    .\Fix-SyncUserTypeMapping.ps1 -WhatIf
    .\Fix-SyncUserTypeMapping.ps1 -TenantFilter "TLL"
#>
[CmdletBinding(SupportsShouldProcess)] param([string[]]$TenantFilter)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force
$SyncAppId = "7f3e5c40-7943-44c0-a67c-d9aefc8c5fc9"

Write-Host "`n=== Fix Sync userType Mapping: Guest -> Member [$(if($WhatIfPreference){'PREVIEW'}else{'LIVE'})] ===" -ForegroundColor $(if($WhatIfPreference){"Yellow"}else{"Red"})

$auditResults = Connect-HTTAllTenants -TenantFilter $TenantFilter -ScriptBlock {
    param($Tenant)
    $result = [ordered]@{ TenantAlias=$Tenant.Alias; Changes=@() }
    try {
        $sps = @(); $sps += Get-MgServicePrincipal -Filter "appId eq '$SyncAppId'" -All -EA SilentlyContinue; $sps += Get-MgServicePrincipal -Filter "startsWith(displayName,'MTO_Sync')" -All -EA SilentlyContinue
        if ($sps.Count -eq 0) { Write-HTTFinding -Severity INFO -Message "No sync SPs"; return [PSCustomObject]$result }
        foreach ($sp in $sps) {
            $jobs = Get-MgServicePrincipalSynchronizationJob -ServicePrincipalId $sp.Id -All
            foreach ($job in $jobs) {
                $schema = Get-MgServicePrincipalSynchronizationJobSchema -ServicePrincipalId $sp.Id -SynchronizationJobId $job.Id
                $modified = $false
                foreach ($rule in $schema.SynchronizationRules) {
                    $uMap = $rule.ObjectMappings | Where-Object { $_.SourceObjectName -eq "User" }; if (-not $uMap) { continue }
                    $ut = $uMap.AttributeMappings | Where-Object { $_.TargetAttributeName -eq "userType" }
                    if ($ut -and $ut.MappingType -eq "Constant" -and $ut.DefaultValue -eq "Guest") {
                        if ($WhatIfPreference) { Write-HTTFinding -Severity INFO -Message "WOULD change userType: Guest -> Member (job $($job.Id))" }
                        else { $ut.DefaultValue = "Member"; $modified = $true; Write-HTTFinding -Severity OK -Message "Updated userType -> Member (job $($job.Id))" }
                    } elseif ($ut -and $ut.MappingType -eq "Constant" -and $ut.DefaultValue -eq "Member") {
                        Write-HTTFinding -Severity OK -Message "Already Member (job $($job.Id))"
                    } else { Write-HTTFinding -Severity INFO -Message "userType mapping: $($ut.MappingType) (job $($job.Id))" }
                }
                if ($modified -and -not $WhatIfPreference) {
                    try {
                        Invoke-MgGraphRequest -Method PUT -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$($sp.Id)/synchronization/jobs/$($job.Id)/schema" -Body ($schema | ConvertTo-Json -Depth 30) -ContentType "application/json"
                        Start-MgServicePrincipalSynchronizationJob -ServicePrincipalId $sp.Id -SynchronizationJobId $job.Id
                        Write-HTTFinding -Severity OK -Message "Schema saved & job restarted"
                        $result.Changes += "Job $($job.Id): Guest -> Member"
                    } catch { Write-HTTFinding -Severity HIGH -Message "Schema save failed: $_" }
                }
            }
        }
    } catch { Write-HTTFinding -Severity CRITICAL -Message "Failed: $_" }
    return [PSCustomObject]$result
}
Export-HTTReport -ReportName "Remediation_SyncUserType" -Data $auditResults
