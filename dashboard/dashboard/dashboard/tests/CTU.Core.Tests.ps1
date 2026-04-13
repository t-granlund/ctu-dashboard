#Requires -Modules Pester
#Requires -Version 5.1

BeforeAll {
    $ModulePath = Join-Path $PSScriptRoot ".." "modules" "CTU.Core" "CTU.Core.psm1"
    Import-Module $ModulePath -Force
}

Describe "CTU.Core Module" {
    Context "Config Loading" {
        It "Get-CTUConfig loads the config file" {
            $config = Get-CTUConfig
            $config | Should -Not -BeNullOrEmpty
            $config.organization.name | Should -Be "Head to Toe Brands"
        }
        
        It "Config has required sections" {
            $config = Get-CTUConfig
            $config.hub | Should -Not -BeNullOrEmpty
            $config.spokes | Should -Not -BeNullOrEmpty
            $config.spokes.Count | Should -Be 4
        }
    }
    
    Context "Tenant List" {
        It "Get-CTUTenantList returns all 5 tenants" {
            $tenants = Get-CTUTenantList
            $tenants.Count | Should -Be 5
        }
        
        It "Get-CTUTenantList -Role hub returns only hub" {
            $hub = Get-CTUTenantList -Role hub
            $hub.Count | Should -Be 1
            $hub.Key | Should -Be "HTT"
        }
        
        It "Get-CTUTenantList -Role spoke returns 4 spokes" {
            $spokes = Get-CTUTenantList -Role spoke
            $spokes.Count | Should -Be 4
        }
        
        It "Get-CTUTenantList -TenantKey filters correctly" {
            $bcc = Get-CTUTenantList -TenantKey "BCC"
            $bcc.Key | Should -Be "BCC"
            $bcc.displayName | Should -Be "Bishops Cuts/Color"
        }
    }
    
    Context "Baseline Loading" {
        It "Get-CTUBaseline loads baseline.json" {
            $baseline = Get-CTUBaseline
            $baseline | Should -Not -BeNullOrEmpty
            $baseline.crossTenantAccessDefaults | Should -Not -BeNullOrEmpty
        }
    }
}

AfterAll {
    Remove-Module CTU.Core -Force -ErrorAction SilentlyContinue
}
