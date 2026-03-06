<#
.SYNOPSIS
    Apply deny-by-default cross-tenant access + partner overrides for MTO tenants.
.DESCRIPTION
    Phase 3. Sets DEFAULT policy to block all B2B collab/direct connect, then
    creates partner-specific overrides with full access + MFA trust for HTT tenants.
    Use -WhatIf to preview. Requires: Policy.ReadWrite.CrossTenantAccess
.PARAMETER TenantFilter
    Limit to specific tenant aliases.
.EXAMPLE
    .\Set-DenyByDefault.ps1 -WhatIf
#>
[CmdletBinding(SupportsShouldProcess)] param([string[]]$TenantFilter, [switch]$SkipDefaultPolicy, [switch]$SkipPartnerConfigs)
$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "HTT.CrossTenant.Core.psm1") -Force
$config = Get-HTTConfig

Write-Host "`n=== Set Deny-by-Default [$(if($WhatIfPreference){'PREVIEW'}else{'LIVE'})] ===" -ForegroundColor $(if($WhatIfPreference){"Yellow"}else{"Red"})
if (-not $WhatIfPreference) { Write-Host "  Press ENTER to continue or Ctrl+C to abort" -ForegroundColor Yellow; Read-Host }

$auditResults = Connect-HTTAllTenants -TenantFilter $TenantFilter -ScriptBlock {
    param($Tenant)
    $changes = @()

    if (-not $SkipDefaultPolicy) {
        Write-HTTSection "Default Policy -> Deny All"
        $body = @{ b2bCollaborationInbound=@{usersAndGroups=@{accessType="blocked";targets=@(@{target="AllUsers";targetType="user"})};applications=@{accessType="blocked";targets=@(@{target="AllApplications";targetType="application"})}}; b2bCollaborationOutbound=@{usersAndGroups=@{accessType="blocked";targets=@(@{target="AllUsers";targetType="user"})};applications=@{accessType="blocked";targets=@(@{target="AllApplications";targetType="application"})}}; b2bDirectConnectInbound=@{usersAndGroups=@{accessType="blocked";targets=@(@{target="AllUsers";targetType="user"})};applications=@{accessType="blocked";targets=@(@{target="AllApplications";targetType="application"})}}; b2bDirectConnectOutbound=@{usersAndGroups=@{accessType="blocked";targets=@(@{target="AllUsers";targetType="user"})};applications=@{accessType="blocked";targets=@(@{target="AllApplications";targetType="application"})}}; inboundTrust=@{isMfaAccepted=$false;isCompliantDeviceAccepted=$false;isHybridAzureADJoinedDeviceAccepted=$false} }
        if ($WhatIfPreference) { Write-HTTFinding -Severity INFO -Message "WOULD block all default inbound/outbound" }
        else { try { Invoke-MgGraphRequest -Method PATCH -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/default" -Body ($body|ConvertTo-Json -Depth 10) -ContentType "application/json"; Write-HTTFinding -Severity OK -Message "Default set to deny"; $changes += "Default deny applied" } catch { Write-HTTFinding -Severity CRITICAL -Message "Failed: $_" } }
    }

    if (-not $SkipPartnerConfigs) {
        Write-HTTSection "Partner Overrides (MTO)"
        foreach ($pid in ($config.allTenantIds | Where-Object { $_ -ne $Tenant.TenantId })) {
            $pa = ($config.spokes | Where-Object { $_.tenantId -eq $pid }).alias ?? $(if($pid -eq $config.hub.tenantId){"HTT"}else{$pid})
            $body = @{ tenantId=$pid; b2bCollaborationInbound=@{usersAndGroups=@{accessType="allowed";targets=@(@{target="AllUsers";targetType="user"})};applications=@{accessType="allowed";targets=@(@{target="AllApplications";targetType="application"})}}; b2bCollaborationOutbound=@{usersAndGroups=@{accessType="allowed";targets=@(@{target="AllUsers";targetType="user"})};applications=@{accessType="allowed";targets=@(@{target="AllApplications";targetType="application"})}}; b2bDirectConnectInbound=@{usersAndGroups=@{accessType="allowed";targets=@(@{target="AllUsers";targetType="user"})};applications=@{accessType="allowed";targets=@(@{target="Office365";targetType="application"})}}; b2bDirectConnectOutbound=@{usersAndGroups=@{accessType="allowed";targets=@(@{target="AllUsers";targetType="user"})};applications=@{accessType="allowed";targets=@(@{target="Office365";targetType="application"})}}; inboundTrust=@{isMfaAccepted=$true;isCompliantDeviceAccepted=$true;isHybridAzureADJoinedDeviceAccepted=$true}; automaticUserConsentSettings=@{inboundAllowed=$true;outboundAllowed=$true} }
            if ($WhatIfPreference) { Write-HTTFinding -Severity INFO -Message "WOULD configure $pa with full MTO access" }
            else {
                try { Invoke-MgGraphRequest -Method PATCH -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners/$pid" -Body ($body|ConvertTo-Json -Depth 10) -ContentType "application/json"; Write-HTTFinding -Severity OK -Message "Updated $pa" }
                catch { if ($_.Exception.Message -match "404|NotFound") { try { Invoke-MgGraphRequest -Method POST -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners" -Body ($body|ConvertTo-Json -Depth 10) -ContentType "application/json"; Write-HTTFinding -Severity OK -Message "Created $pa" } catch { Write-HTTFinding -Severity HIGH -Message "Create failed for $pa : $_" } } else { Write-HTTFinding -Severity HIGH -Message "Update failed for $pa : $_" } }
                try { Invoke-MgGraphRequest -Method PUT -Uri "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners/$pid/identitySynchronization" -Body '{"userSyncInbound":{"isSyncAllowed":true}}' -ContentType "application/json" } catch {}
                $changes += "Partner $pa configured"
            }
        }
    }
    return [PSCustomObject]@{ TenantAlias=$Tenant.Alias; Changes=$changes; Mode=if($WhatIfPreference){"Preview"}else{"Applied"} }
}
Export-HTTReport -ReportName "Remediation_DenyByDefault" -Data $auditResults
