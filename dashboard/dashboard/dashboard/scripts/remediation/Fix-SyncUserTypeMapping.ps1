<#
.SYNOPSIS
    Fix the userType attribute mapping in cross-tenant sync jobs to provision
    users as Members instead of Guests.
.DESCRIPTION
    Phase 3 Remediation script. Addresses the common issue where cross-tenant
    sync provisions HTT corporate users as Guests in brand tenants, causing
    reduced access to Teams channels, SharePoint sites, and other M365 resources.
    
    This script:
      1. Finds cross-tenant sync service principals in each tenant
      2. Reads the current userType attribute mapping from sync job schemas
      3. Updates the mapping from Constant "Guest" to Constant "Member"
      4. Optionally triggers on-demand provisioning for specific users
    
    CONTEXT: This was originally identified when Noelle Peter (noelle.peter@httbrands.com)
    was synced to TLL as a Guest, preventing proper access to Teams and SharePoint.
.PARAMETER TenantFilter
    Optional. Limit to specific tenant aliases.
.PARAMETER WhatIf
    Preview changes without applying them.
.PARAMETER ProvisionOnDemandUpn
    Optional. After updating the mapping, trigger on-demand provisioning for a
    specific user by their UPN in the SOURCE tenant.
.EXAMPLE
    .\Fix-SyncUserTypeMapping.ps1 -WhatIf
.EXAMPLE
    .\Fix-SyncUserTypeMapping.ps1 -TenantFilter "TLL"
.EXAMPLE
    .\Fix-SyncUserTypeMapping.ps1 -TenantFilter "TLL" -ProvisionOnDemandUpn "noelle.peter@httbrands.com"
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [string[]]$TenantFilter,
    [string]$ProvisionOnDemandUpn
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

$config = Get-CTUConfig

$CrossTenantSyncAppId = "7f3e5c40-7943-44c0-a67c-d9aefc8c5fc9"

Write-Host @"

  ╔═══════════════════════════════════════════════════════════════════════╗
  ║   HTT Brands — Fix Cross-Tenant Sync userType Mapping              ║
  ║   Phase 3: Remediation                                             ║
  ║   Target: Change synced userType from Guest → Member               ║
  ╚═══════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $(if ($WhatIfPreference) { "Yellow" } else { "Red" })

$auditResults = Connect-CTUAllTenants -TenantFilter $TenantFilter -Config $config -ScriptBlock {
    param($Tenant)

    $result = [ordered]@{
        TenantAlias = $Tenant.Key
        TenantId    = $Tenant.tenantId
        SyncJobs    = @()
        Changes     = @()
    }

    Write-CTUSection "Finding Sync Service Principals"

    try {
        $syncSPs = @()
        $syncSPs += Get-MgServicePrincipal -Filter "appId eq '$CrossTenantSyncAppId'" -All -ErrorAction SilentlyContinue
        $syncSPs += Get-MgServicePrincipal -Filter "startsWith(displayName,'MTO_Sync')" -All -ErrorAction SilentlyContinue

        if ($syncSPs.Count -eq 0) {
            Write-CTUFinding -Severity "INFO" -Message "No sync service principals found — skipping"
            return [PSCustomObject]$result
        }

        foreach ($sp in $syncSPs) {
            $jobs = Get-MgServicePrincipalSynchronizationJob -ServicePrincipalId $sp.Id -All

            foreach ($job in $jobs) {
                Write-CTUFinding -Severity "INFO" -Message "Processing job: $($job.Id) on SP: $($sp.DisplayName)"

                $schema = Get-MgServicePrincipalSynchronizationJobSchema `
                    -ServicePrincipalId $sp.Id `
                    -SynchronizationJobId $job.Id

                $modified = $false

                foreach ($rule in $schema.SynchronizationRules) {
                    $userMapping = $rule.ObjectMappings | Where-Object { $_.SourceObjectName -eq "User" }
                    if (-not $userMapping) { continue }

                    $userTypeMapping = $userMapping.AttributeMappings | Where-Object { $_.TargetAttributeName -eq "userType" }

                    if ($userTypeMapping) {
                        $currentType = $userTypeMapping.MappingType
                        $currentValue = switch ($currentType) {
                            "Constant" { $userTypeMapping.DefaultValue }
                            "Direct"   { "Direct: $($userTypeMapping.Source.Name)" }
                            default    { $userTypeMapping.Source.Expression ?? "Unknown" }
                        }

                        Write-CTUFinding -Severity "INFO" -Message "  Current userType mapping: $currentType = '$currentValue'"

                        if ($currentType -eq "Constant" -and $userTypeMapping.DefaultValue -eq "Guest") {
                            if ($WhatIfPreference) {
                                Write-CTUFinding -Severity "INFO" -Message "  WOULD CHANGE: userType mapping from Guest → Member"
                            }
                            else {
                                # Update the mapping in the schema object
                                $userTypeMapping.DefaultValue = "Member"
                                $modified = $true
                                Write-CTUFinding -Severity "OK" -Message "  Updated schema: userType mapping → Constant 'Member'"
                                $result.Changes += "Job $($job.Id): userType changed from Guest to Member"
                            }
                        }
                        elseif ($currentType -eq "Constant" -and $userTypeMapping.DefaultValue -eq "Member") {
                            Write-CTUFinding -Severity "OK" -Message "  userType is already set to Member — no change needed"
                        }
                        else {
                            Write-CTUFinding -Severity "MEDIUM" -Message "  userType uses $currentType mapping — manual review recommended"
                        }
                    }
                    else {
                        Write-CTUFinding -Severity "MEDIUM" -Message "  No explicit userType mapping found — defaults apply (Guest)"
                    }
                }

                if ($modified -and -not $WhatIfPreference) {
                    # Push updated schema back to Graph
                    try {
                        $schemaJson = $schema | ConvertTo-Json -Depth 30
                        Invoke-MgGraphRequest -Method PUT `
                            -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$($sp.Id)/synchronization/jobs/$($job.Id)/schema" `
                            -Body $schemaJson `
                            -ContentType "application/json"
                        Write-CTUFinding -Severity "OK" -Message "  Schema saved successfully"

                        # Restart the job to apply changes
                        Start-MgServicePrincipalSynchronizationJob `
                            -ServicePrincipalId $sp.Id `
                            -SynchronizationJobId $job.Id
                        Write-CTUFinding -Severity "OK" -Message "  Sync job restarted"
                    }
                    catch {
                        Write-CTUFinding -Severity "HIGH" -Message "  Failed to save schema: $_"
                    }
                }

                $result.SyncJobs += [ordered]@{
                    SPId    = $sp.Id
                    SPName  = $sp.DisplayName
                    JobId   = $job.Id
                    Status  = $job.Status.Code
                    Changed = $modified
                }
            }
        }

        # ── On-demand provisioning for specific user ────────────────────────

        if ($ProvisionOnDemandUpn -and -not $WhatIfPreference -and $syncSPs.Count -gt 0) {
            Write-CTUSection "On-Demand Provisioning: $ProvisionOnDemandUpn"

            # We need the user's object ID from the SOURCE tenant
            # This requires connecting to the source tenant first
            Write-CTUFinding -Severity "INFO" -Message "On-demand provisioning requested for $ProvisionOnDemandUpn"
            Write-CTUFinding -Severity "INFO" -Message "Note: You need the user's object ID from the SOURCE tenant"
            Write-CTUFinding -Severity "INFO" -Message "Run manually:"
            Write-CTUFinding -Severity "INFO" -Message '  $params = @{ subjects = @(@{ objectId = "USER_OBJ_ID"; objectTypeName = "User" }) }'
            Write-CTUFinding -Severity "INFO" -Message "  Invoke-MgGraphRequest -Method POST -Uri `"...provisionOnDemand`" -Body (`$params | ConvertTo-Json)"
        }
    }
    catch {
        Write-CTUFinding -Severity "CRITICAL" -Message "Sync remediation failed: $_"
    }

    return [PSCustomObject]$result
}

Export-CTUReport -ReportName "RemediationLog_SyncUserType" -Data $auditResults
Write-Host "`nSync userType remediation complete.`n" -ForegroundColor Magenta
