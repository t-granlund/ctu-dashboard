<#
.SYNOPSIS
    Audit cross-tenant sync jobs, attribute mappings (especially userType),
    provisioning status, and quarantine state across all HTT tenants.
.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases.
.NOTES
    Permissions: Synchronization.Read.All, AuditLog.Read.All
#>
[CmdletBinding()] param([string[]]$TenantFilter)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force
$SyncAppId = "7f3e5c40-7943-44c0-a67c-d9aefc8c5fc9"

Write-Host "`n=== HTT Brands: Cross-Tenant Sync Job Audit ===" -ForegroundColor Magenta

$auditResults = Connect-HTTAllTenants -TenantFilter $TenantFilter -ScriptBlock {
    param($Tenant)
    $result = [ordered]@{ TenantAlias=$Tenant.Alias; TenantId=$Tenant.TenantId; AuditTime=(Get-Date -Format "o"); SyncApps=@(); Findings=@() }

    Write-HTTSection "Sync Service Principals"
    try {
        $sps = @()
        $sps += Get-MgServicePrincipal -Filter "appId eq '$SyncAppId'" -All -EA SilentlyContinue
        $sps += Get-MgServicePrincipal -Filter "startsWith(displayName,'MTO_Sync')" -All -EA SilentlyContinue
        if ($sps.Count -eq 0) { Write-HTTFinding -Severity INFO -Message "No sync SPs found"; return [PSCustomObject]$result }

        foreach ($sp in $sps) {
            Write-HTTFinding -Severity INFO -Message "SP: $($sp.DisplayName) ($($sp.Id))"
            $spResult = [ordered]@{ SPId=$sp.Id; SPName=$sp.DisplayName; Jobs=@() }
            try {
                $jobs = Get-MgServicePrincipalSynchronizationJob -ServicePrincipalId $sp.Id -All
                foreach ($job in $jobs) {
                    Write-HTTFinding -Severity INFO -Message "  Job $($job.Id): $($job.Status.Code)"
                    $jobResult = [ordered]@{ JobId=$job.Id; Status=$job.Status.Code; UserTypeMappingType=$null; UserTypeMappingValue=$null }

                    if ($job.Status.Code -eq "Quarantine") {
                        Write-HTTFinding -Severity CRITICAL -Message "  QUARANTINED: $($job.Status.QuarantineStatus.Reason)"
                        $result.Findings += @{Severity="CRITICAL";Detail="Job $($job.Id) quarantined"}
                    } elseif ($job.Status.Code -ne "Active") {
                        Write-HTTFinding -Severity MEDIUM -Message "  Status: $($job.Status.Code) (expected Active)"
                        $result.Findings += @{Severity="MEDIUM";Detail="Job $($job.Id) status: $($job.Status.Code)"}
                    }

                    # Extract userType mapping
                    try {
                        $schema = Get-MgServicePrincipalSynchronizationJobSchema -ServicePrincipalId $sp.Id -SynchronizationJobId $job.Id
                        foreach ($rule in $schema.SynchronizationRules) {
                            $uMap = ($rule.ObjectMappings | Where-Object { $_.SourceObjectName -eq "User" })
                            if (-not $uMap) { continue }
                            $utAttr = $uMap.AttributeMappings | Where-Object { $_.TargetAttributeName -eq "userType" }
                            if ($utAttr) {
                                $jobResult.UserTypeMappingType = $utAttr.MappingType
                                switch ($utAttr.MappingType) {
                                    "Constant" {
                                        $jobResult.UserTypeMappingValue = $utAttr.DefaultValue
                                        if ($utAttr.DefaultValue -eq "Guest") {
                                            Write-HTTFinding -Severity HIGH -Message "  userType: Constant 'Guest' — synced users are GUESTS"
                                            Write-HTTFinding -Severity HIGH -Message "  >> FIX: Change to 'Member' via Fix-SyncUserTypeMapping.ps1"
                                            $result.Findings += @{Severity="HIGH";Detail="Job $($job.Id): userType=Guest"}
                                        } elseif ($utAttr.DefaultValue -eq "Member") {
                                            Write-HTTFinding -Severity OK -Message "  userType: Constant 'Member'"
                                        }
                                    }
                                    "Direct" { $jobResult.UserTypeMappingValue = "Direct: $($utAttr.Source.Name)"; Write-HTTFinding -Severity INFO -Message "  userType: Direct from $($utAttr.Source.Name)" }
                                    "Expression" { $jobResult.UserTypeMappingValue = $utAttr.Source.Expression; Write-HTTFinding -Severity INFO -Message "  userType: Expression" }
                                }
                            } else {
                                Write-HTTFinding -Severity MEDIUM -Message "  No explicit userType mapping (defaults to Guest)"
                                $result.Findings += @{Severity="MEDIUM";Detail="Job $($job.Id): no userType mapping"}
                            }
                        }
                    } catch { Write-HTTFinding -Severity HIGH -Message "  Schema read failed: $_" }
                    $spResult.Jobs += [PSCustomObject]$jobResult
                }
            } catch { Write-HTTFinding -Severity HIGH -Message "  Job enum failed: $_" }
            $result.SyncApps += [PSCustomObject]$spResult
        }
    } catch { Write-HTTFinding -Severity CRITICAL -Message "SP query failed: $_" }
    return [PSCustomObject]$result
}

Export-HTTReport -ReportName "SyncJobAudit" -Data $auditResults
Write-Host "`nSync job audit complete.`n" -ForegroundColor Magenta
