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
    
    Context "Config Schema Cross-Reference Validation" {
        BeforeAll {
            $ConfigPath = Join-Path $PSScriptRoot ".." "config" "tenants.json"
            $script:Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
            
            # Scan all audit module files for config property references
            $ModulesDir = Join-Path $PSScriptRoot ".." "modules"
            $script:ModuleFiles = Get-ChildItem $ModulesDir -Filter "*.psm1" -Recurse
        }

        It "No modules reference deprecated Config.tenants property" {
            $violations = @()
            foreach ($file in $ModuleFiles) {
                $content = Get-Content $file.FullName -Raw
                if ($content -match '\$Config\.tenants\b') {
                    $violations += $file.Name
                }
            }
            $violations | Should -BeNullOrEmpty -Because "modules should use `$Config.hub + `$Config.spokes or `$Config.allTenantIds (not the deprecated `$Config.tenants pattern)"
        }

        It "allTenantIds matches hub.tenantId + all spoke tenantIds" {
            $expected = @($Config.hub.tenantId) + ($Config.spokes | ForEach-Object { $_.tenantId })
            $expected.Count | Should -Be 5
            foreach ($tid in $expected) {
                $Config.allTenantIds | Should -Contain $tid
            }
            foreach ($tid in $Config.allTenantIds) {
                $expected | Should -Contain $tid
            }
        }

        It "No module references Config properties that don't exist in tenants.json" {
            $validTopLevelProps = @($Config.PSObject.Properties.Name)
            $violations = @()
            foreach ($file in $ModuleFiles) {
                $content = Get-Content $file.FullName -Raw
                # Find all $Config.XXXX references
                $matches = [regex]::Matches($content, '\$Config\.(\w+)')
                foreach ($m in $matches) {
                    $propName = $m.Groups[1].Value
                    # Skip PSObject (meta), and known nested props
                    if ($propName -notin $validTopLevelProps -and $propName -notin @('PSObject')) {
                        $violations += "$($file.Name): `$Config.$propName"
                    }
                }
            }
            $violations | Should -BeNullOrEmpty -Because "all `$Config.X references should match actual top-level properties in tenants.json"
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
