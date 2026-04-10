# Cross-Tenant-Utility

Microsoft Entra ID cross-tenant identity audit, analysis, and optimization toolkit for **HTT Brands** (Head to Toe Brands) and its 4 associated brand tenants: Bishops Cuts/Color, Frenchies Modern Nail Care, The Lash Lounge, and Delta Crown Extensions.

## Architecture

HTT Brands operates a **hub-and-spoke** multi-tenant architecture:

```
                    ┌──────────────────────┐
                    │    HTT Brands (Hub)   │
                    │   httbrands.com       │
                    │   MTO Owner           │
                    └──────────┬───────────┘
                               │
          ┌────────────┬───────┴───────┬────────────┐
          │            │               │            │
   ┌──────┴──────┐ ┌──┴───────┐ ┌─────┴─────┐ ┌────┴──────┐
   │ Bishops C/C │ │ Frenchies│ │ Lash      │ │ Delta     │
   │ ~40 locs    │ │ ~20 locs │ │ Lounge    │ │ Crown     │
   │ BCC spoke   │ │ FN spoke │ │ ~140 locs │ │ Extensions│
   └─────────────┘ └──────────┘ │ TLL spoke │ │ DCE spoke │
                                └───────────┘ └───────────┘
```

## What This Audits

| Domain | Description | API Surface |
|--------|-------------|-------------|
| **Cross-Tenant Sync** | Sync jobs, attribute mappings (userType!), provisioning logs | Graph API |
| **B2B Collaboration** | Guest invitation policy, authorization settings, inbound/outbound rules | Graph API |
| **B2B Direct Connect** | Shared channel access, application scoping, MFA trust | Graph API |
| **Guest Inventory** | Full guest enumeration, stale detection, privileged role check | Graph API |
| **Conditional Access** | External user CA policies, MFA coverage, legacy auth blocking | Graph API |
| **Teams Federation** | Federation model, allowed/blocked domains, consumer access | Teams PowerShell |
| **Identity Governance** | Access reviews, entitlement management, PIM, lifecycle workflows | Graph API |

## Quick Start

### 1. Install Prerequisites

```powershell
.\scripts\Install-Prerequisites.ps1
```

### 2. Validate Configuration

```powershell
.\scripts\Test-Configuration.ps1
```

This pre-flight check validates tenant connectivity, permissions, and module imports. Run this before any audit to catch issues early.

### 3. Run Full Audit (Interactive Auth)

```powershell
.\scripts\Invoke-FullAudit.ps1
```

You'll be prompted to authenticate to each tenant. Use your admin credentials for each:

| Tenant | Admin UPN |
|--------|-----------|
| HTT | `tyler.granlund-admin@httbrands.com` |
| BCC | `tyler.granlund-Admin@bishopsbs.onmicrosoft.com` |
| FN | `tyler.granlund-Admin@ftgfrenchiesoutlook.onmicrosoft.com` |
| TLL | `tyler.granlund-Admin@LashLoungeFranchise.onmicrosoft.com` |
| DCE | `tyler.granlund-admin_httbrands.com#EXT#@deltacrown.onmicrosoft.com` |

### 4. Review Reports

Reports are saved to `reports/<AuditName>_<timestamp>/`:
- `AUDIT-SUMMARY.md` — Human-readable findings with severity and recommendations
- `findings.csv` — All findings in CSV for tracking/filtering
- `audit-results.json` — Complete audit data
- `guests_<tenant>.csv` — Per-tenant guest user inventory

## Usage Examples

```powershell
# Validate configuration before running audits
.\scripts\Test-Configuration.ps1

# Audit a single tenant
.\scripts\Invoke-FullAudit.ps1 -TenantKeys TLL

# Audit a specific domain across all tenants
.\scripts\Invoke-FullAudit.ps1 -Domains GuestInventory

# Quick check: cross-tenant sync on HTT hub
.\scripts\Invoke-DomainAudit.ps1 -Domain CrossTenantSync -TenantKey HTT

# Skip Teams (avoids extra interactive auth prompts)
.\scripts\Invoke-FullAudit.ps1 -SkipTeams

# App-only auth (after multi-tenant app registration)
.\scripts\Invoke-FullAudit.ps1 -AuthMode AppOnly `
    -ClientId "YOUR-APP-CLIENT-ID" `
    -CertificateThumbprint "YOUR-CERT-THUMBPRINT"
```

## App Registration Setup (Optional — For Automated Runs)

For app-only (unattended) execution, register a multi-tenant app in the HTT hub tenant:

1. **Register in HTT**: Azure Portal → App registrations → New → Supported account types: `Accounts in any organizational directory`
2. **Configure Permissions**: Add all permissions listed in `config/permissions.json` → `readOnly.applicationPermissions`
3. **Add Certificate**: Upload a certificate (preferred over client secret)
4. **Admin Consent in Each Spoke**: Visit the consent URL for each spoke tenant (URLs in `config/permissions.json`)

## Project Structure

```
Cross-Tenant-Utility/
├── config/
│   ├── tenants.json           # Tenant IDs, admin UPNs, trusted domains
│   ├── permissions.json       # Required Graph permissions, consent URLs
│   └── baseline.json          # Security baseline configuration
├── modules/
│   ├── CTU.Core/              # Auth, config, Graph helpers, reporting
│   ├── CTU.CrossTenantSync/   # Sync job & attribute mapping audit
│   ├── CTU.B2BCollaboration/  # Guest invitation & B2B policy audit
│   ├── CTU.B2BDirectConnect/  # Shared channel access audit
│   ├── CTU.GuestInventory/    # Guest enumeration & stale detection
│   ├── CTU.ConditionalAccess/ # CA policy coverage analysis
│   ├── CTU.TeamsFederation/   # Teams federation settings audit
│   └── CTU.IdentityGovernance/# Access reviews, PIM, lifecycle audit
├── scripts/
│   ├── Install-Prerequisites.ps1   # Module installation
│   ├── Test-Configuration.ps1      # Pre-flight configuration validation
│   ├── Invoke-FullAudit.ps1        # Full orchestrated audit
│   ├── Invoke-DomainAudit.ps1      # Single-domain quick audit
│   └── remediation/                # Remediation scripts
│       ├── Fix-SyncUserTypeMapping.ps1
│       ├── Set-DenyByDefault.ps1
│       └── Set-TeamsFederationAllowlist.ps1
├── tests/                     # Pester test suite
│   ├── CTU.Core.Tests.ps1
│   ├── ConfigValidation.Tests.ps1
│   └── ModuleImport.Tests.ps1
├── reports/                   # Generated audit reports (gitignored)
└── docs/
    ├── SETUP.md               # Detailed setup instructions
    └── PHASED-REMEDIATION.md  # Remediation roadmap
```

## Testing

This project includes a Pester-based test suite for validating the codebase:

```powershell
# Run all tests
Invoke-Pester tests/

# Run specific test file
Invoke-Pester tests/ConfigValidation.Tests.ps1

# Validate configuration without running an audit
.\scripts\Test-Configuration.ps1
```

| Test File | Purpose |
|-----------|---------|
| `CTU.Core.Tests.ps1` | Tests core module functions and helpers |
| `ConfigValidation.Tests.ps1` | Validates tenant configuration JSON |
| `ModuleImport.Tests.ps1` | Ensures all CTU.* modules import correctly |

## Finding Severity Levels

| Severity | Action Required |
|----------|----------------|
| **Critical** | Immediate action — security exposure (e.g., guest in Global Admin role) |
| **High** | Address within 1 week — significant risk (e.g., no MFA for external users) |
| **Medium** | Address within 30 days — hardening opportunity |
| **Low** | Track for next review cycle |
| **Info** | Informational — current state documentation |

## Requirements

- **PowerShell 7+** (recommended) or Windows PowerShell 5.1
- **Microsoft.Graph PowerShell SDK** v2.x (installed via `Install-Prerequisites.ps1`)
- **MicrosoftTeams** module (for Teams federation audit)
- **Global Administrator** or equivalent permissions in each tenant
- **Entra ID P1/P2** license (for signInActivity data on guest users)
- **Entra ID Governance** license (for access reviews, entitlement management, lifecycle workflows — audit will note if unavailable)

## Security Notes

- **No credentials are stored** in this repo. Authentication is interactive or via certificate.
- **Reports contain sensitive data** (tenant IDs, user lists, policy configs). The `reports/` directory is gitignored.
- **Read-only by default**. The audit scripts only use `GET` operations. No changes are made to any tenant.
- **Config contains tenant IDs** which are not secrets, but the admin UPNs should be treated as internal.
