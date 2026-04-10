<#
.SYNOPSIS
    HTT Brands Cross-Tenant Utility — Core Functions
.DESCRIPTION
    Shared functions for tenant config loading, multi-tenant auth, output formatting,
    and report generation used across all audit/remediation scripts.
.NOTES
    Organization: Head to Toe Brands | Maintainer: Tyler Granlund, IT Director
#>

#region Configuration Loading

function Get-HTTConfig {
    [CmdletBinding()] param([string]$ConfigPath)
    if (-not $ConfigPath) { $ConfigPath = Join-Path (Split-Path $PSScriptRoot -Parent) "config" "tenants.json" }
    if (-not (Test-Path $ConfigPath)) { throw "Tenant config not found at $ConfigPath" }
    $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    Write-Verbose "Loaded config: $($config.organization.name) ($($config.spokes.Count) spokes)"
    return $config
}

function Get-HTTBaseline {
    [CmdletBinding()] param([string]$BaselinePath)
    if (-not $BaselinePath) { $BaselinePath = Join-Path (Split-Path $PSScriptRoot -Parent) "config" "baseline.json" }
    if (-not (Test-Path $BaselinePath)) { throw "Baseline config not found at $BaselinePath" }
    return Get-Content $BaselinePath -Raw | ConvertFrom-Json
}

function Get-HTTAllTenants {
    [CmdletBinding()] param([PSObject]$Config)
    if (-not $Config) { $Config = Get-HTTConfig }
    $tenants = @()
    $tenants += [PSCustomObject]@{
        Alias = $Config.hub.alias; DisplayName = $Config.hub.displayName
        TenantId = $Config.hub.tenantId; AdminUpn = $Config.hub.adminUpn
        AdminObjId = $Config.hub.adminObjectId; Role = "Hub"; Domain = $Config.hub.primaryDomain
    }
    foreach ($s in $Config.spokes) {
        $tenants += [PSCustomObject]@{
            Alias = $s.alias; DisplayName = $s.displayName; TenantId = $s.tenantId
            AdminUpn = $s.adminUpn; AdminObjId = $s.adminObjectId; Role = "Spoke"; Domain = $s.primaryDomain
        }
    }
    return $tenants
}

#endregion
#region Authentication

function Connect-HTTTenant {
    [CmdletBinding(DefaultParameterSetName = 'Delegated')]
    param(
        [Parameter(Mandatory)][string]$TenantId,
        [Parameter(ParameterSetName='Delegated')][string[]]$Scopes = @(
            "Policy.Read.All","User.Read.All","Directory.Read.All","AuditLog.Read.All",
            "Synchronization.Read.All","GroupMember.Read.All","AccessReview.Read.All",
            "EntitlementManagement.Read.All","RoleManagement.Read.Directory"
        ),
        [Parameter(ParameterSetName='AppOnly')][string]$AppId,
        [Parameter(ParameterSetName='AppOnly')][string]$CertificateThumbprint,
        [Parameter(ParameterSetName='ManagedIdentity')][switch]$UseManagedIdentity
    )
    $ctx = Get-MgContext -ErrorAction SilentlyContinue
    if ($ctx) { Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null }
    try {
        switch ($PSCmdlet.ParameterSetName) {
            'AppOnly'         { Connect-MgGraph -ClientId $AppId -TenantId $TenantId -CertificateThumbprint $CertificateThumbprint -NoWelcome }
            'ManagedIdentity' { Connect-MgGraph -Identity -TenantId $TenantId -NoWelcome }
            default           { Connect-MgGraph -TenantId $TenantId -Scopes $Scopes -NoWelcome }
        }
        $ctx = Get-MgContext
        Write-Host "  Connected: $($ctx.TenantId) as $($ctx.Account ?? 'app-only')" -ForegroundColor Green
        return $ctx
    } catch { Write-Error "Failed to connect to $TenantId : $_"; throw }
}

function Connect-HTTAllTenants {
    [CmdletBinding()] param(
        [Parameter(Mandatory)][scriptblock]$ScriptBlock,
        [string[]]$TenantFilter, [hashtable]$AuthParams = @{}
    )
    $config = Get-HTTConfig; $allTenants = Get-HTTAllTenants -Config $config
    if ($TenantFilter) { $allTenants = $allTenants | Where-Object { $_.Alias -in $TenantFilter } }
    $results = @{}
    foreach ($t in $allTenants) {
        Write-Host "`n== $($t.DisplayName) ($($t.Alias)) | $($t.TenantId) ==" -ForegroundColor Yellow
        try {
            Connect-HTTTenant @(@{TenantId=$t.TenantId} + $AuthParams) | Out-Null
            $results[$t.Alias] = & $ScriptBlock $t
        } catch {
            Write-Warning "Error in $($t.Alias): $_"
            $results[$t.Alias] = [PSCustomObject]@{ Error=$true; Message=$_.Exception.Message }
        } finally { Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null }
    }
    return $results
}

#endregion
#region Output Helpers

function New-HTTReportPath {
    [CmdletBinding()] param([Parameter(Mandatory)][string]$ReportName, [ValidateSet("json","csv","md")][string]$Format="json")
    $dir = Join-Path (Split-Path $PSScriptRoot -Parent) "reports"
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return Join-Path $dir "${ReportName}_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').${Format}"
}

function Export-HTTReport {
    [CmdletBinding()] param([Parameter(Mandatory)][string]$ReportName, [Parameter(Mandatory)]$Data, [switch]$AlsoExportCsv)
    $path = New-HTTReportPath -ReportName $ReportName -Format "json"
    $Data | ConvertTo-Json -Depth 20 | Out-File $path -Encoding utf8
    Write-Host "  Report: $path" -ForegroundColor Green
    if ($AlsoExportCsv) {
        $csv = New-HTTReportPath -ReportName $ReportName -Format "csv"
        @($Data) | Export-Csv -Path $csv -NoTypeInformation -Encoding utf8
        Write-Host "  CSV:    $csv" -ForegroundColor Green
    }
}

function Write-HTTSection { param([string]$Title); Write-Host "`n-- $Title --" -ForegroundColor Cyan }

function Write-HTTFinding {
    param([ValidateSet("CRITICAL","HIGH","MEDIUM","LOW","INFO","OK")][string]$Severity, [string]$Message)
    $colors = @{ CRITICAL="Red"; HIGH="DarkRed"; MEDIUM="Yellow"; LOW="DarkYellow"; INFO="Cyan"; OK="Green" }
    $prefix = @{ CRITICAL="[!!!]"; HIGH="[!!] "; MEDIUM="[!]  "; LOW="[~]  "; INFO="[i]  "; OK="[OK] " }
    Write-Host "  $($prefix[$Severity]) $Message" -ForegroundColor $colors[$Severity]
}

function Test-HTTPrerequisites {
    [CmdletBinding()] param([switch]$InstallMissing)
    Write-HTTSection "Prerequisite Check"
    $ok = $true
    foreach ($m in @("Microsoft.Graph.Authentication","Microsoft.Graph.Identity.SignIns","Microsoft.Graph.Identity.Governance","Microsoft.Graph.Users","Microsoft.Graph.Applications","Microsoft.Graph.Reports","Microsoft.Graph.Groups")) {
        $inst = Get-Module -ListAvailable -Name $m -EA SilentlyContinue
        if ($inst) { Write-HTTFinding -Severity OK -Message "$m v$($inst[0].Version)" }
        elseif ($InstallMissing) { Install-Module $m -Scope CurrentUser -Force -AllowClobber; Write-HTTFinding -Severity OK -Message "$m installed" }
        else { Write-HTTFinding -Severity HIGH -Message "$m NOT FOUND"; $ok = $false }
    }
    foreach ($m in @("MicrosoftTeams","Microsoft.Graph.Beta.Identity.SignIns")) {
        $inst = Get-Module -ListAvailable -Name $m -EA SilentlyContinue
        if ($inst) { Write-HTTFinding -Severity OK -Message "$m (optional)" }
        else { Write-HTTFinding -Severity INFO -Message "$m not installed (optional)" }
    }
    return $ok
}

#endregion

Export-ModuleMember -Function @(
    'Get-HTTConfig','Get-HTTBaseline','Get-HTTAllTenants',
    'Connect-HTTTenant','Connect-HTTAllTenants',
    'New-HTTReportPath','Export-HTTReport',
    'Write-HTTSection','Write-HTTFinding','Test-HTTPrerequisites'
)
