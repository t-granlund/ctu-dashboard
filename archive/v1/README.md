# Cross-Tenant-Utility

Microsoft Entra ID multi-tenant identity audit, analysis, and remediation toolkit for **Head to Toe Brands** — a hub-and-spoke architecture spanning 5 tenants across 4 franchise brands with 200+ locations.

## Architecture

```
                    ┌─────────────────────────┐
                    │   HTT Brands (Hub)      │
                    │   httbrands.com         │
                    │   MTO Owner             │
                    └────────┬────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                  │
    ┌──────┴──────┐  ┌──────┴──────┐  ┌───────┴──────┐  ┌──────────────┐
    │ Bishops C/C │  │ Frenchies   │  │ Lash Lounge  │  │ Delta Crown  │
    │ ~40 locs    │  │ ~20 locs    │  │ ~140 locs    │  │ Pre-launch   │
    │ MTO Member  │  │ MTO Member  │  │ MTO Member   │  │ MTO Member   │
    └─────────────┘  └─────────────┘  └──────────────┘  └──────────────┘
```

## Tenants

| Alias | Brand | Tenant ID | Primary Domain |
|-------|-------|-----------|----------------|
| HTT | Head to Toe Brands (Hub) | `0c0e35dc-...` | httbrands.com |
| BCC | Bishops Cuts/Color | `b5380912-...` | bishopsbs.com |
| FN | Frenchies Modern Nail Care | `98723287-...` | frenchiesnails.com |
| TLL | The Lash Lounge | `3c7d2bf3-...` | thelashlounge.com |
| DCE | Delta Crown Extensions | `ce62e17d-...` | deltacrown.com |

## 7 Audit Domains

1. **Cross-Tenant Synchronization** — sync jobs, attribute mappings (userType), provisioning logs
2. **B2B Collaboration** — inbound/outbound settings, guest invitation policies
3. **B2B Direct Connect** — shared channels, inbound trust (MFA/device compliance)
4. **Guest User Inventory** — enumeration, stale detection, privileged role check
5. **Conditional Access** — external user targeting, MFA enforcement, legacy auth block
6. **Teams Federation** — allowed/blocked domains, consumer access, per-user overrides
7. **Identity Governance** — access reviews, entitlement management, PIM, lifecycle workflows

## Repository Structure

```
Cross-Tenant-Utility/
├── config/
│   ├── tenants.json          # Tenant definitions (hub + 4 spokes)
│   ├── baseline.json         # Deny-by-default security targets
│   └── permissions.json      # Required permissions per module
├── modules/
│   └── HTT.CrossTenant.Core.psm1    # Shared auth, config, output functions
├── scripts/
│   ├── Invoke-FullDiscovery.ps1      # Master orchestrator
│   ├── 01-Discovery/
│   │   ├── Invoke-CrossTenantPolicyAudit.ps1
│   │   ├── Invoke-GuestUserInventory.ps1
│   │   ├── Invoke-SyncJobAudit.ps1
│   │   ├── Invoke-ConditionalAccessAudit.ps1
│   │   ├── Invoke-TeamsFederationAudit.ps1
│   │   └── Invoke-IdentityGovernanceAudit.ps1
│   ├── 02-Analysis/
│   │   └── Export-AuditReport.ps1    # Consolidated markdown report
│   ├── 03-Remediation/
│   │   ├── Set-DenyByDefault.ps1     # Deny-by-default + partner overrides
│   │   ├── Fix-SyncUserTypeMapping.ps1   # Fix Guest→Member in sync
│   │   └── Set-TeamsFederationAllowlist.ps1
│   └── 04-Monitoring/
│       └── Deploy-Monitoring.ps1     # KQL queries + drift detection
├── monitoring/kql/                   # Exported KQL alert queries
├── reports/                          # Generated reports (gitignored)
└── tests/
```

## Prerequisites

```powershell
# Required modules
Install-Module Microsoft.Graph.Authentication -Scope CurrentUser
Install-Module Microsoft.Graph.Identity.SignIns -Scope CurrentUser
Install-Module Microsoft.Graph.Identity.Governance -Scope CurrentUser
Install-Module Microsoft.Graph.Users -Scope CurrentUser
Install-Module Microsoft.Graph.Applications -Scope CurrentUser
Install-Module Microsoft.Graph.Reports -Scope CurrentUser
Install-Module Microsoft.Graph.Groups -Scope CurrentUser

# Optional
Install-Module MicrosoftTeams -Scope CurrentUser           # Teams federation
Install-Module Microsoft.Graph.Beta.Identity.SignIns -Scope CurrentUser  # Beta APIs

# Or use the built-in check:
Import-Module ./modules/HTT.CrossTenant.Core.psm1
Test-HTTPrerequisites -InstallMissing
```

### Minimum Permissions (Read-Only Audit)

`Policy.Read.All` · `User.Read.All` · `Directory.Read.All` · `AuditLog.Read.All` · `Synchronization.Read.All` · `GroupMember.Read.All` · `AccessReview.Read.All` · `EntitlementManagement.Read.All` · `RoleManagement.Read.Directory`

### Licenses

- **Entra ID P1/P2** — signInActivity on guest users
- **Entra ID Governance / Entra Suite** — access reviews, entitlement mgmt, lifecycle workflows

## Quick Start

```powershell
# 1. Run full discovery (all 5 tenants, all 6 audit scripts)
./scripts/Invoke-FullDiscovery.ps1

# 2. Or run individual audits
./scripts/01-Discovery/Invoke-CrossTenantPolicyAudit.ps1
./scripts/01-Discovery/Invoke-GuestUserInventory.ps1 -StaleThresholdDays 60
./scripts/01-Discovery/Invoke-SyncJobAudit.ps1 -TenantFilter "TLL"

# 3. Generate consolidated report
./scripts/02-Analysis/Export-AuditReport.ps1

# 4. Preview remediation (always WhatIf first)
./scripts/03-Remediation/Set-DenyByDefault.ps1 -WhatIf
./scripts/03-Remediation/Fix-SyncUserTypeMapping.ps1 -WhatIf
./scripts/03-Remediation/Set-TeamsFederationAllowlist.ps1 -WhatIf

# 5. Apply (after review)
./scripts/03-Remediation/Set-DenyByDefault.ps1
./scripts/03-Remediation/Fix-SyncUserTypeMapping.ps1

# 6. Deploy monitoring KQL queries
./scripts/04-Monitoring/Deploy-Monitoring.ps1 -OutputKQL
```

## Phased Remediation

| Phase | Scope | Timeline | Risk |
|-------|-------|----------|------|
| **1** | Discovery & Assessment | Weeks 1–3 | None (read-only) |
| **2** | Quick Wins (guest restrictions, MFA) | Weeks 3–5 | Low |
| **3** | Policy Hardening (deny-by-default) | Weeks 5–10 | Medium |
| **4** | Governance (reviews, PIM, lifecycle) | Weeks 10–16 | Low |
| **5** | Continuous Monitoring | Ongoing | None |

## Security Model

**Deny-by-default** with explicit partner-level overrides:

- Default cross-tenant access: **Block all** B2B collab + direct connect
- Partner overrides: **Allow** only between HTT MTO tenants with MFA/device trust
- Guest invitation: **Admins and Guest Inviters only**
- Guest role: **Restricted Guest User**
- Teams federation: **Explicit allowlist** (HTT domains only)
- Sync userType: **Member** (not Guest) for corporate users

## Maintainers

- **Tyler Granlund** — IT Director, Head to Toe Brands
- **Dustin Boyd** — IT Operations & Support Lead
