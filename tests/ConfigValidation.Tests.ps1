#Requires -Modules Pester

Describe "Config File Validation" {
    Context "tenants.json" {
        BeforeAll {
            $ConfigPath = Join-Path $PSScriptRoot ".." "config" "tenants.json"
            $ConfigRaw = Get-Content $ConfigPath -Raw
            $script:Config = $ConfigRaw | ConvertFrom-Json
        }
        
        It "Is valid JSON" {
            { $ConfigRaw | ConvertFrom-Json } | Should -Not -Throw
        }
        
        It "Has organization section" {
            $Config.organization | Should -Not -BeNullOrEmpty
            $Config.organization.name | Should -Be "Head to Toe Brands"
        }
        
        It "Has hub with required properties" {
            $Config.hub | Should -Not -BeNullOrEmpty
            $Config.hub.alias | Should -Be "HTT"
            $Config.hub.tenantId | Should -Match "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        }
        
        It "Has 4 spokes" {
            $Config.spokes.Count | Should -Be 4
        }
        
        It "Each spoke has required properties" {
            foreach ($spoke in $Config.spokes) {
                $spoke.alias | Should -Not -BeNullOrEmpty
                $spoke.tenantId | Should -Match "^[0-9a-f-]{36}$"
                $spoke.displayName | Should -Not -BeNullOrEmpty
            }
        }
        
        It "Has domainAllowlist with 5 domains" {
            $Config.domainAllowlist.Count | Should -Be 5
            $Config.domainAllowlist | Should -Contain "httbrands.com"
        }
        
        It "Has trustedDomains (alias for domainAllowlist)" {
            $Config.trustedDomains | Should -Not -BeNullOrEmpty
            $Config.trustedDomains.Count | Should -Be 5
        }
        
        It "Has auditSettings" {
            $Config.auditSettings | Should -Not -BeNullOrEmpty
            $Config.auditSettings.staleGuestThresholdDays | Should -Be 90
        }
        
        It "Has allTenantIds matching hub + spokes" {
            $Config.allTenantIds.Count | Should -Be 5
            $Config.allTenantIds | Should -Contain $Config.hub.tenantId
        }
    }
    
    Context "baseline.json" {
        BeforeAll {
            $BaselinePath = Join-Path $PSScriptRoot ".." "config" "baseline.json"
            $BaselineRaw = Get-Content $BaselinePath -Raw
            $script:Baseline = $BaselineRaw | ConvertFrom-Json
        }
        
        It "Is valid JSON" {
            { $BaselineRaw | ConvertFrom-Json } | Should -Not -Throw
        }
        
        It "Has crossTenantAccessDefaults" {
            $Baseline.crossTenantAccessDefaults | Should -Not -BeNullOrEmpty
        }
        
        It "Has crossTenantPartnerOverrides" {
            $Baseline.crossTenantPartnerOverrides | Should -Not -BeNullOrEmpty
        }
    }
    
    Context "permissions.json" {
        BeforeAll {
            $PermsPath = Join-Path $PSScriptRoot ".." "config" "permissions.json"
            $PermsRaw = Get-Content $PermsPath -Raw
            $script:Perms = $PermsRaw | ConvertFrom-Json
        }
        
        It "Is valid JSON" {
            { $PermsRaw | ConvertFrom-Json } | Should -Not -Throw
        }
        
        It "Has minimumReadOnly permissions" {
            $Perms.minimumReadOnly | Should -Not -BeNullOrEmpty
            $Perms.minimumReadOnly.applicationPermissions.Count | Should -BeGreaterThan 5
        }
        
        It "Has perModule permissions" {
            $Perms.perModule | Should -Not -BeNullOrEmpty
        }
    }
}
