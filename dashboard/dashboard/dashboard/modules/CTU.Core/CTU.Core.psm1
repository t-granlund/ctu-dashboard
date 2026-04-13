<#
.SYNOPSIS
    CTU.Core - Core module for HTT Brands Cross-Tenant Utility.
.DESCRIPTION
    Provides authentication, configuration loading, tenant iteration,
    Graph API helpers, and reporting utilities shared across all audit modules.
#>

#region --- Configuration ---

function Get-CTUConfig {
    [CmdletBinding()]
    param([Parameter()][string]$ConfigPath)

    if (-not $ConfigPath) {
        $ConfigPath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "config\tenants.json"
        if (-not (Test-Path $ConfigPath)) {
            $ConfigPath = Join-Path $PSScriptRoot "..\..\config\tenants.json"
        }
    }
    if (-not (Test-Path $ConfigPath)) {
        throw "Configuration file not found at: $ConfigPath. Run from the repo root or pass -ConfigPath."
    }
    $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    $tenantCount = 1  # hub
    if ($config.spokes -and $config.spokes -is [array]) { $tenantCount += $config.spokes.Count }
    Write-Verbose "[CTU.Core] Loaded config with $tenantCount tenants (1 hub + $($config.spokes.Count) spokes)"
    return $config
}

function Get-CTUTenantList {
    [CmdletBinding()]
    param(
        [Parameter()][ValidateSet('hub','spoke','all')][string]$Role = 'all',
        [Parameter()][ValidateSet('HTT','BCC','FN','TLL','DCE')][string]$TenantKey,
        [Parameter()][PSCustomObject]$Config
    )
    if (-not $Config) { $Config = Get-CTUConfig }
    
    $tenants = @()
    
    # Add hub tenant
    if ($Config.hub) {
        $hubTenant = $Config.hub | Select-Object *
        $hubTenant | Add-Member -NotePropertyName 'Key' -NotePropertyValue $Config.hub.alias -Force
        $hubTenant | Add-Member -NotePropertyName 'roleNormalized' -NotePropertyValue 'hub' -Force
        $tenants += $hubTenant
    }
    
    # Add spoke tenants
    if ($Config.spokes -and $Config.spokes -is [array]) {
        foreach ($spoke in $Config.spokes) {
            $spokeTenant = $spoke | Select-Object *
            $spokeTenant | Add-Member -NotePropertyName 'Key' -NotePropertyValue $spoke.alias -Force
            $spokeTenant | Add-Member -NotePropertyName 'roleNormalized' -NotePropertyValue 'spoke' -Force
            $tenants += $spokeTenant
        }
    }
    
    # Filter by TenantKey if specified
    if ($TenantKey) { 
        return $tenants | Where-Object { $_.Key -eq $TenantKey } 
    }
    
    # Filter by Role if specified (using normalized role)
    if ($Role -ne 'all') { 
        return $tenants | Where-Object { $_.roleNormalized -eq $Role } 
    }
    
    return $tenants
}

function Get-CTUBaseline {
    [CmdletBinding()]
    param([Parameter()][string]$BaselinePath)
    if (-not $BaselinePath) {
        $BaselinePath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "config" "baseline.json"
    }
    if (-not (Test-Path $BaselinePath)) {
        throw "Baseline config not found at $BaselinePath"
    }
    return Get-Content $BaselinePath -Raw | ConvertFrom-Json
}

#endregion

#region --- Authentication ---

function Connect-CTUTenant {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][ValidateSet('HTT','BCC','FN','TLL','DCE')][string]$TenantKey,
        [Parameter()][ValidateSet('Interactive','AppOnly')][string]$AuthMode = 'Interactive',
        [Parameter()][string]$ClientId,
        [Parameter()][string]$CertificateThumbprint,
        [Parameter()][SecureString]$ClientSecret,
        [Parameter()][PSCustomObject]$Config
    )
    if (-not $Config) { $Config = Get-CTUConfig }
    $tenant = Get-CTUTenantList -TenantKey $TenantKey -Config $Config
    if (-not $tenant) { throw "Tenant key '$TenantKey' not found in configuration." }

    try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}

    $scopes = @(
        "Policy.Read.All","User.Read.All","AuditLog.Read.All","Directory.Read.All",
        "Synchronization.Read.All","AccessReview.Read.All","EntitlementManagement.Read.All",
        "RoleManagement.Read.Directory","LifecycleWorkflows.Read.All"
    )

    Write-Host "`n[CTU] Connecting to $($tenant.displayName) ($($tenant.tenantId))..." -ForegroundColor Cyan

    switch ($AuthMode) {
        'Interactive' {
            Connect-MgGraph -TenantId $tenant.tenantId -Scopes $scopes -NoWelcome
        }
        'AppOnly' {
            if (-not $ClientId) { throw "ClientId is required for AppOnly authentication." }
            if ($CertificateThumbprint) {
                Connect-MgGraph -ClientId $ClientId -TenantId $tenant.tenantId -CertificateThumbprint $CertificateThumbprint -NoWelcome
            } elseif ($ClientSecret) {
                Write-Warning "[CTU] ClientSecret auth is deprecated for production. Use -CertificateThumbprint for app-only authentication."
                $credential = [System.Management.Automation.PSCredential]::new($ClientId, $ClientSecret)
                Connect-MgGraph -TenantId $tenant.tenantId -ClientSecretCredential $credential -NoWelcome
            } else {
                throw "Either CertificateThumbprint or ClientSecret is required for AppOnly auth."
            }
        }
    }

    $ctx = Get-MgContext
    if ($ctx.TenantId -ne $tenant.tenantId) {
        throw "Connected to unexpected tenant: $($ctx.TenantId). Expected: $($tenant.tenantId)"
    }
    Write-Host "[CTU] Connected as $($ctx.Account) to $($tenant.displayName)" -ForegroundColor Green
    return $ctx
}

function Connect-CTUTeams {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][ValidateSet('HTT','BCC','FN','TLL','DCE')][string]$TenantKey,
        [Parameter()][PSCustomObject]$Config
    )
    if (-not $Config) { $Config = Get-CTUConfig }
    $tenant = Get-CTUTenantList -TenantKey $TenantKey -Config $Config
    Write-Host "`n[CTU] Connecting to Teams for $($tenant.displayName)..." -ForegroundColor Cyan
    try { Disconnect-MicrosoftTeams -ErrorAction SilentlyContinue } catch {}
    Connect-MicrosoftTeams -TenantId $tenant.tenantId
    Write-Host "[CTU] Teams connected to $($tenant.displayName)" -ForegroundColor Green
}

function Connect-CTUAllTenants {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][scriptblock]$ScriptBlock,
        [Parameter()][string[]]$TenantFilter,
        [Parameter()][hashtable]$AuthParams = @{},
        [Parameter()][PSCustomObject]$Config
    )
    if (-not $Config) { $Config = Get-CTUConfig }
    $allTenants = Get-CTUTenantList -Config $Config
    if ($TenantFilter) {
        $allTenants = $allTenants | Where-Object { $_.Key -in $TenantFilter }
    }
    $results = @{}
    foreach ($t in $allTenants) {
        Write-Host "`n== $($t.displayName) ($($t.Key)) | $($t.tenantId) ==" -ForegroundColor Yellow
        try {
            Connect-CTUTenant -TenantKey $t.Key -Config $Config @AuthParams | Out-Null
            $results[$t.Key] = & $ScriptBlock $t
        }
        catch {
            Write-Warning "Error in $($t.Key): $_"
            $results[$t.Key] = [PSCustomObject]@{ Error = $true; Message = $_.Exception.Message }
        }
        finally {
            try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
        }
    }
    return $results
}

#endregion

#region --- Graph API Helpers ---

function Invoke-CTUGraphRequest {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Uri,
        [Parameter()][ValidateSet('GET','POST','PATCH','PUT','DELETE')][string]$Method = 'GET',
        [Parameter()][object]$Body,
        [Parameter()][switch]$AllPages,
        [Parameter()][int]$RetryCount = 3,
        [Parameter()][int]$RetryDelayMs = 1000,
        [Parameter()][hashtable]$Headers
    )

    $allResults = @()
    $currentUri = $Uri

    do {
        $attempt = 0
        $success = $false
        while (-not $success -and $attempt -lt $RetryCount) {
            try {
                $params = @{ Method = $Method; Uri = $currentUri }
                if ($Body) { $params['Body'] = $Body }
                if ($Headers) { $params['Headers'] = $Headers }
                $response = Invoke-MgGraphRequest @params
                $success = $true
            } catch {
                $attempt++
                $statusCode = $_.Exception.Response.StatusCode.value__
                if ($statusCode -eq 429) {
                    $retryAfter = $_.Exception.Response.Headers['Retry-After']
                    $waitSec = if ($retryAfter) { [int]$retryAfter } else { ($attempt * 5) }
                    Write-Warning "[CTU] Throttled (429). Waiting $waitSec seconds..."
                    Start-Sleep -Seconds $waitSec
                } elseif ($statusCode -ge 500) {
                    Write-Warning "[CTU] Server error ($statusCode). Retrying..."
                    Start-Sleep -Milliseconds $RetryDelayMs
                } else { throw $_ }
            }
        }
        if (-not $success) { throw "[CTU] Request failed after $RetryCount attempts: $currentUri" }

        if ($response.value) { $allResults += $response.value }
        else {
            if (-not $AllPages) { return $response }
            $allResults += $response
        }
        $currentUri = $response.'@odata.nextLink'
        if ($currentUri) { Start-Sleep -Milliseconds 200 }
    } while ($AllPages -and $currentUri)

    return $allResults
}

#endregion

#region --- Reporting Utilities ---

function New-CTUAuditReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$AuditName,
        [Parameter()][string]$OutputRoot,
        [Parameter()][PSCustomObject]$Config
    )
    if (-not $Config) { $Config = Get-CTUConfig }
    if (-not $OutputRoot) {
        $OutputRoot = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "reports"
    }
    $timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
    $reportDir = Join-Path $OutputRoot "${AuditName}_${timestamp}"
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

    $context = [PSCustomObject]@{
        AuditName  = $AuditName; Timestamp = $timestamp; StartTime = Get-Date
        ReportDir  = $reportDir
        Findings   = [System.Collections.ArrayList]::new()
        Warnings   = [System.Collections.ArrayList]::new()
        Errors     = [System.Collections.ArrayList]::new()
        TenantData = @{}
    }
    Write-Host "[CTU] Report directory: $reportDir" -ForegroundColor DarkGray
    return $context
}

function Add-CTUFinding {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][PSCustomObject]$ReportContext,
        [Parameter(Mandatory)][string]$Domain,
        [Parameter(Mandatory)][string]$TenantKey,
        [Parameter(Mandatory)][ValidateSet('Critical','High','Medium','Low','Info')][string]$Severity,
        [Parameter(Mandatory)][string]$Title,
        [Parameter(Mandatory)][string]$Description,
        [Parameter()][string]$Recommendation,
        [Parameter()][string]$RemediationPhase
    )
    $finding = [PSCustomObject]@{
        Domain = $Domain; TenantKey = $TenantKey; Severity = $Severity
        Title = $Title; Description = $Description
        Recommendation = $Recommendation; RemediationPhase = $RemediationPhase
        Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    }
    $null = $ReportContext.Findings.Add($finding)
    $color = switch ($Severity) {
        'Critical' { 'Red' } 'High' { 'Yellow' } 'Medium' { 'DarkYellow' }
        'Low' { 'Cyan' } 'Info' { 'Gray' }
    }
    Write-Host "  [$Severity] $TenantKey | $Title" -ForegroundColor $color
}

function Write-CTUSection {
    param([string]$Title)
    Write-Host "`n-- $Title --" -ForegroundColor Cyan
}

function Write-CTUFinding {
    param(
        [ValidateSet("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", "OK")][string]$Severity,
        [string]$Message
    )
    $colors = @{ CRITICAL = "Red"; HIGH = "DarkRed"; MEDIUM = "Yellow"; LOW = "DarkYellow"; INFO = "Cyan"; OK = "Green" }
    $prefix = @{ CRITICAL = "[!!!]"; HIGH = "[!!] "; MEDIUM = "[!]  "; LOW = "[~]  "; INFO = "[i]  "; OK = "[OK] " }
    Write-Host "  $($prefix[$Severity]) $Message" -ForegroundColor $colors[$Severity]
}

function New-CTUReportPath {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$ReportName,
        [ValidateSet("json", "csv", "md")][string]$Format = "json"
    )
    $dir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "reports"
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return Join-Path $dir "${ReportName}_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').${Format}"
}

function Export-CTUReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ParameterSetName = 'ReportContext')][PSCustomObject]$ReportContext,
        [Parameter(Mandatory, ParameterSetName = 'Remediation')][string]$ReportName,
        [Parameter(Mandatory, ParameterSetName = 'Remediation')]$Data,
        [Parameter(ParameterSetName = 'Remediation')][switch]$AlsoExportCsv
    )

    if ($PSCmdlet.ParameterSetName -eq 'Remediation') {
        $path = New-CTUReportPath -ReportName $ReportName -Format "json"
        $Data | ConvertTo-Json -Depth 20 | Out-File $path -Encoding utf8
        Write-Host "  Report: $path" -ForegroundColor Green
        if ($AlsoExportCsv) {
            $csv = New-CTUReportPath -ReportName $ReportName -Format "csv"
            @($Data) | Export-Csv -Path $csv -NoTypeInformation -Encoding utf8
            Write-Host "  CSV:    $csv" -ForegroundColor Green
        }
        return
    }

    $dir = $ReportContext.ReportDir
    $ReportContext | Add-Member -NotePropertyName 'EndTime' -NotePropertyValue (Get-Date) -Force
    $duration = $ReportContext.EndTime - $ReportContext.StartTime

    # JSON
    $jsonPath = Join-Path $dir "audit-results.json"
    $ReportContext | ConvertTo-Json -Depth 10 | Out-File $jsonPath -Encoding utf8
    Write-Host "`n[CTU] JSON report: $jsonPath" -ForegroundColor Green

    # CSV
    if ($ReportContext.Findings.Count -gt 0) {
        $csvPath = Join-Path $dir "findings.csv"
        $ReportContext.Findings | Export-Csv $csvPath -NoTypeInformation -Encoding utf8
        Write-Host "[CTU] CSV findings: $csvPath" -ForegroundColor Green
    }

    # Markdown
    $mdPath = Join-Path $dir "AUDIT-SUMMARY.md"
    $md = [System.Text.StringBuilder]::new()
    $null = $md.AppendLine("# HTT Brands Cross-Tenant Identity Audit")
    $null = $md.AppendLine(""); $null = $md.AppendLine("**Audit:** $($ReportContext.AuditName)")
    $null = $md.AppendLine("**Date:** $($ReportContext.Timestamp)")
    $null = $md.AppendLine("**Duration:** $([math]::Round($duration.TotalMinutes, 1)) minutes")
    $null = $md.AppendLine(""); $null = $md.AppendLine("## Finding Summary"); $null = $md.AppendLine("")

    $grouped = $ReportContext.Findings | Group-Object Severity
    foreach ($g in $grouped | Sort-Object { @('Critical','High','Medium','Low','Info').IndexOf($_.Name) }) {
        $null = $md.AppendLine("- **$($g.Name):** $($g.Count)")
    }
    $null = $md.AppendLine(""); $null = $md.AppendLine("## Findings by Tenant"); $null = $md.AppendLine("")

    $byTenant = $ReportContext.Findings | Group-Object TenantKey
    foreach ($t in $byTenant) {
        $null = $md.AppendLine("### $($t.Name)"); $null = $md.AppendLine("")
        foreach ($f in $t.Group | Sort-Object { @('Critical','High','Medium','Low','Info').IndexOf($_.Severity) }) {
            $null = $md.AppendLine("- **[$($f.Severity)]** $($f.Title)")
            $null = $md.AppendLine("  - $($f.Description)")
            if ($f.Recommendation) { $null = $md.AppendLine("  - *Recommendation:* $($f.Recommendation)") }
            if ($f.RemediationPhase) { $null = $md.AppendLine("  - *Phase:* $($f.RemediationPhase)") }
            $null = $md.AppendLine("")
        }
    }
    $md.ToString() | Out-File $mdPath -Encoding utf8
    Write-Host "[CTU] Markdown summary: $mdPath" -ForegroundColor Green

    # Console summary
    Write-Host "`n========================================" -ForegroundColor White
    Write-Host "  AUDIT COMPLETE: $($ReportContext.Findings.Count) findings" -ForegroundColor White
    $critical = ($ReportContext.Findings | Where-Object Severity -eq 'Critical').Count
    $high = ($ReportContext.Findings | Where-Object Severity -eq 'High').Count
    if ($critical -gt 0) { Write-Host "  CRITICAL: $critical" -ForegroundColor Red }
    if ($high -gt 0) { Write-Host "  HIGH: $high" -ForegroundColor Yellow }
    Write-Host "  Duration: $([math]::Round($duration.TotalMinutes, 1)) minutes" -ForegroundColor White
    Write-Host "========================================`n" -ForegroundColor White
}

function Save-CTUTenantData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][PSCustomObject]$ReportContext,
        [Parameter(Mandatory)][string]$TenantKey,
        [Parameter(Mandatory)][string]$Domain,
        [Parameter(Mandatory)][object]$Data
    )
    $fileName = "$($Domain)_$($TenantKey).json"
    $filePath = Join-Path $ReportContext.ReportDir $fileName
    $Data | ConvertTo-Json -Depth 15 | Out-File $filePath -Encoding utf8
    Write-Verbose "[CTU] Saved: $filePath"
}

#endregion

Export-ModuleMember -Function @(
    'Get-CTUConfig','Get-CTUTenantList','Get-CTUBaseline','Connect-CTUTenant','Connect-CTUTeams','Connect-CTUAllTenants',
    'Invoke-CTUGraphRequest','New-CTUAuditReport','Add-CTUFinding','Export-CTUReport','Save-CTUTenantData',
    'Write-CTUSection','Write-CTUFinding','New-CTUReportPath'
)
