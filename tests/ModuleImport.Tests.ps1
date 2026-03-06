#Requires -Modules Pester

Describe "Module Import Tests" {
    Context "All CTU modules load successfully" {
        $ModulePath = Join-Path $PSScriptRoot ".." "modules"
        
        It "CTU.Core loads" {
            { Import-Module (Join-Path $ModulePath "CTU.Core" "CTU.Core.psm1") -Force } | Should -Not -Throw
        }
        
        It "CTU.CrossTenantSync loads" {
            { Import-Module (Join-Path $ModulePath "CTU.CrossTenantSync" "CTU.CrossTenantSync.psm1") -Force } | Should -Not -Throw
        }
        
        It "CTU.B2BCollaboration loads" {
            { Import-Module (Join-Path $ModulePath "CTU.B2BCollaboration" "CTU.B2BCollaboration.psm1") -Force } | Should -Not -Throw
        }
        
        It "CTU.B2BDirectConnect loads" {
            { Import-Module (Join-Path $ModulePath "CTU.B2BDirectConnect" "CTU.B2BDirectConnect.psm1") -Force } | Should -Not -Throw
        }
        
        It "CTU.GuestInventory loads" {
            { Import-Module (Join-Path $ModulePath "CTU.GuestInventory" "CTU.GuestInventory.psm1") -Force } | Should -Not -Throw
        }
        
        It "CTU.ConditionalAccess loads" {
            { Import-Module (Join-Path $ModulePath "CTU.ConditionalAccess" "CTU.ConditionalAccess.psm1") -Force } | Should -Not -Throw
        }
        
        It "CTU.TeamsFederation loads" {
            { Import-Module (Join-Path $ModulePath "CTU.TeamsFederation" "CTU.TeamsFederation.psm1") -Force } | Should -Not -Throw
        }
        
        It "CTU.IdentityGovernance loads" {
            { Import-Module (Join-Path $ModulePath "CTU.IdentityGovernance" "CTU.IdentityGovernance.psm1") -Force } | Should -Not -Throw
        }
    }
    
    AfterAll {
        Get-Module CTU.* | Remove-Module -Force -ErrorAction SilentlyContinue
    }
}
