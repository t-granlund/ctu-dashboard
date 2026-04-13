# Setup Guide

## Prerequisites

### PowerShell Version

PowerShell 7+ is recommended for cross-platform compatibility and improved Graph SDK performance. Windows PowerShell 5.1 works but may have module loading issues with large Graph SDK installs.

```powershell
# Check your version
$PSVersionTable.PSVersion

# Install PowerShell 7 if needed
winget install Microsoft.PowerShell
```

### Module Installation

Run the included installer:

```powershell
cd Cross-Tenant-Utility
.\scripts\Install-Prerequisites.ps1
```

This installs:
- `Microsoft.Graph.Authentication`
- `Microsoft.Graph.Identity.SignIns` (cross-tenant access, CA, auth methods)
- `Microsoft.Graph.Identity.Governance` (access reviews, PIM, lifecycle)
- `Microsoft.Graph.Identity.DirectoryManagement` (domains, roles, admin units)
- `Microsoft.Graph.Users` (user enumeration)
- `Microsoft.Graph.Applications` (service principals, app registrations)
- `Microsoft.Graph.Reports` (audit logs, usage)
- `Microsoft.Graph.Beta.Identity.SignIns` (external identities policy - beta only)
- `MicrosoftTeams` (federation config - no Graph equivalent)

### Required Permissions

For **interactive (delegated) auth**, your admin account needs:
- Global Administrator or a combination of: Security Reader, Global Reader, and Teams Administrator
- The delegated permission consent will be prompted on first connection

For **app-only auth**, see the App Registration section below.

## Authentication Options

### Option 1: Interactive (Recommended for First Audit)

The simplest approach — authenticate with your admin account for each tenant:

```powershell
.\scripts\Invoke-FullAudit.ps1
```

You'll get a browser prompt for each tenant. Use the admin UPN from `config/tenants.json`.

**Note:** Teams federation audit requires a separate interactive login per tenant (Teams PowerShell doesn't support app-only auth for `Get-CsTenantFederationConfiguration`). Use `-SkipTeams` to avoid extra prompts.

### Option 2: App-Only with Certificate (Recommended for Recurring Audits)

#### Step 1: Create a Self-Signed Certificate

```powershell
$cert = New-SelfSignedCertificate `
    -Subject "CN=HTT Cross-Tenant Audit" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -KeyExportPolicy Exportable `
    -KeySpec Signature `
    -KeyLength 2048 `
    -NotAfter (Get-Date).AddMonths(6)

# Export public key for app registration
Export-Certificate -Cert $cert -FilePath ".\config\ctu-audit.cer"

# Note the thumbprint
$cert.Thumbprint
```

#### Step 2: Register Multi-Tenant App in HTT

1. Go to Azure Portal → Microsoft Entra ID → App registrations → New registration
2. Name: `HTT Cross-Tenant Audit Utility`
3. Supported account types: **Accounts in any organizational directory (Multitenant)**
4. Register
5. Note the **Application (client) ID**
6. Go to Certificates & secrets → Certificates → Upload the `.cer` file
7. Go to API permissions → Add permissions → Microsoft Graph → Application permissions
8. Add all permissions from `config/permissions.json` → `readOnly.applicationPermissions`
9. Click **Grant admin consent for HTT Brands**

#### Step 3: Admin Consent in Each Spoke Tenant

Visit each consent URL (replace `{APP_CLIENT_ID}` with your app's client ID):

```
https://login.microsoftonline.com/b5380912-79ec-452d-a6ca-6d897b19b294/adminconsent?client_id={APP_CLIENT_ID}
https://login.microsoftonline.com/98723287-044b-4bbb-9294-19857d4128a0/adminconsent?client_id={APP_CLIENT_ID}
https://login.microsoftonline.com/3c7d2bf3-b597-4766-b5cb-2b489c2904d6/adminconsent?client_id={APP_CLIENT_ID}
https://login.microsoftonline.com/ce62e17d-2feb-4e67-a115-8ea4af68da30/adminconsent?client_id={APP_CLIENT_ID}
```

Sign in as Global Admin for each spoke tenant and accept the permissions.

#### Step 4: Run with App-Only Auth

```powershell
.\scripts\Invoke-FullAudit.ps1 `
    -AuthMode AppOnly `
    -ClientId "YOUR-APP-CLIENT-ID" `
    -CertificateThumbprint "YOUR-CERT-THUMBPRINT" `
    -SkipTeams
```

**Note:** Teams federation audit still requires interactive auth even with app registration.

### Option 3: Az CLI (for ad-hoc queries)

You can also use `az rest` for quick one-off checks without PowerShell modules:

```bash
# Login to a specific tenant
az login --tenant 0c0e35dc-188a-4eb3-b8ba-61752154b407

# Quick cross-tenant access check
az rest --method GET --url "https://graph.microsoft.com/v1.0/policies/crossTenantAccessPolicy/partners"

# Guest count
az rest --method GET --url "https://graph.microsoft.com/v1.0/users/\$count" \
  --headers "ConsistencyLevel=eventual" \
  --url-parameters "\$filter=userType eq 'Guest'"
```

## Configuration

### tenants.json

The `config/tenants.json` file contains all tenant definitions with a `hub`/`spokes` structure:

- `hub` — The central HTT tenant configuration
  - `tenantId` — The Entra ID (Azure AD) tenant GUID
  - `adminUPN` — Your Global Admin UPN for that tenant (lowercase in JSON)
  - `domains` — Primary domains for the hub tenant
- `spokes` — Array of brand tenant configurations
  - `tenantId` — The Entra ID (Azure AD) tenant GUID
  - `adminUPN` — Your Global Admin UPN for that tenant (lowercase in JSON)
  - `domains` — Domains associated with this spoke tenant
- `domainAllowlist` — Domains considered "internal" across all HTT Brands (shared between hub and spokes)
- `auditSettings` — Global audit configuration
  - `staleGuestThresholdDays` — Days without sign-in before a guest is flagged stale
  - `outputFormat` — Report formats to generate (JSON, CSV, Markdown)
  - `includeSignInActivity` — Include lastSignIn data (requires Entra ID P1/P2)

**To add a new tenant:** Add a new entry under `spokes` with the same structure, and add its domains to `domainAllowlist` if they should be considered internal.

## Troubleshooting

**"Insufficient privileges" errors:** Ensure your account has Global Admin or the required role, and that delegated permissions have been consented.

**"Beta endpoint not available":** Some features (like `externalIdentitiesPolicy`) are beta-only. The audit will note these as informational findings.

**Teams PowerShell hangs:** The MicrosoftTeams module can be slow to connect. Wait up to 60 seconds. If it hangs, Ctrl+C and retry.

**"Module not found" errors:** Run `.\scripts\Install-Prerequisites.ps1 -Force` to reinstall all modules.

**Rate limiting (429 errors):** The CTU.Core module handles retries automatically with exponential backoff. For very large tenants (1000+ guests), the audit may take 5-10 minutes per tenant.
