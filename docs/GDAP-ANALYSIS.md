# GDAP Role Analysis — PAX8 / Sui Generis → HTT Brands

**Date:** 2026-04-13  
**Source:** Screenshots provided by Megan Myrand (Sui Generis IT Systems Engineer)  
**Context:** Follow-up to CTU Phase 1 audit — resolves the GDAP role visibility blocker

---

## Partner Information

| Field | Value |
|-------|-------|
| **Partner Name** | PAX8. |
| **Address** | 6363 S Fiddlers Green Cir, 11th Floor, Greenwood Village, CO 80111-5011, US |
| **MPN ID** | 2036105314 |
| **Authorization Type** | GDAP (Granular Delegated Admin Privileges) |
| **Auto-extend Relationship** | OFF |
| **Duration** | 2 years (per Megan — cannot be changed via Partner Center UI) |

---

## GDAP Roles Granted

| # | Role | Access Level | Description | Risk Assessment |
|---|------|-------------|-------------|-----------------|
| 1 | **Global Reader** | Limited | Can view all administrative features and settings in all admin centers | ✅ Appropriate — standard MSP visibility |
| 2 | **Directory Readers** | Limited | Can read basic directory information. Commonly used to grant directory read access to applications and guests | ✅ Appropriate — standard directory operations |
| 3 | **Directory Writers** | Limited | Can read and write basic directory information. For granting access to applications, not intended for users | 🟡 Acceptable — enables app-related directory writes |
| 4 | **Service Support Administrator** | Limited | Creates service requests for Azure, Microsoft 365, and Microsoft 365 services, and monitors service health | ✅ Appropriate — support ticket management |
| 5 | **Privileged Authentication Administrator** | Limited | Resets passwords, updates non-password credentials, forces users to sign out, monitors service health, and manages service requests | 🔴 **ELEVATED** — can reset passwords for ALL users including Global Admins |
| 6 | **Privileged Role Administrator** | Limited | Manages role assignments and manages all access control features of Privileged Identity Management | 🔴 **ELEVATED** — can assign Global Admin to any user, modify PIM policies |

---

## Security Assessment

### Roles 1–4: Appropriate for MSP Operations ✅

These roles provide the access Sui Generis needs for day-to-day managed services:
- Viewing tenant configuration and health
- Reading directory information for troubleshooting
- Opening and managing Microsoft support tickets
- Writing application-level directory entries

### Roles 5–6: Elevated Access ⚠️

**Privileged Authentication Administrator** combined with **Privileged Role Administrator** creates a potential escalation path:

1. **Password Reset Capability**: Privileged Auth Admin can reset the password of any user account, including `tyler.granlund-admin@httbrands.com` and `dustin.boyd-admin@httbrands.com` (Global Administrators)
2. **Role Assignment Capability**: Privileged Role Admin can assign any Entra ID role (including Global Administrator) to any user — including SGI Techs group members
3. **PIM Override**: Privileged Role Admin can modify PIM policies (activation requirements, approval chains, eligible vs. permanent assignments)

**Combined Impact**: Any member of the "SGI Techs" security group in any tenant could theoretically:
- Reset an admin password → sign in as that admin → have Global Admin access
- Or directly assign themselves Global Admin via Privileged Role Admin

### Mitigating Factors

- Sui Generis enforces MFA via their own Conditional Access policies
- All engineers use individual accounts (no shared accounts)
- The SGI Techs security group is governed by Sui Generis CA policies restricting access to their office locations
- "Genesis" (Tier 1 support tech) is the only newer team member; all others have 2+ years tenure
- Megan is actively helping with account remediation issues requiring these elevated roles
- Auto-extend is OFF — the GDAP relationship will expire

### Current Decision

**Acknowledged and accepted temporarily.** Megan is currently assisting with account-level issues (password resets, user management) that require these elevated roles. Once current remediation work completes, the plan is to:
1. Reduce Privileged Authentication Administrator → **Helpdesk Administrator** (can reset passwords for non-admin users only)
2. Remove Privileged Role Administrator entirely (or scope to specific operations)
3. Review remaining roles annually

### Recommended Future State

| Role | Current | Target | Rationale |
|------|---------|--------|-----------|
| Global Reader | ✅ Keep | ✅ Keep | Needed for admin center visibility |
| Directory Readers | ✅ Keep | ✅ Keep | Standard directory operations |
| Directory Writers | ✅ Keep | 🟡 Review | May not be needed after initial setup |
| Service Support Admin | ✅ Keep | ✅ Keep | Support ticket management |
| Privileged Auth Admin | 🔴 Elevated | ➡️ Helpdesk Admin | Reduces scope to non-admin password resets |
| Privileged Role Admin | 🔴 Elevated | ❌ Remove | Should not be needed for ongoing operations |

---

## Impact on Deny-by-Default (Phase 3)

**GDAP access is NOT affected by B2B cross-tenant access policies.**

GDAP routes through Microsoft Partner Center infrastructure, which is a separate access channel from B2B Collaboration and B2B Direct Connect. When the deny-by-default policy is applied to the HTT hub tenant:

- ✅ PAX8/Sui Generis GDAP access will **continue to work** without any partner override
- ⚠️ Megan's B2B guest accounts (in HTT and TLL) **will need an explicit partner override** for the Sui Generis tenant (`daee2992-bedc-4b96-840d-3cb1ffa89d10`)
- The partner override should scope B2B Collab inbound to Azure Portal + Entra Admin Center + Exchange Admin Center

### Partner Override Policy Required

```
Tenant: Sui Generis Inc
Tenant ID: daee2992-bedc-4b96-840d-3cb1ffa89d10
B2B Collab Inbound: ALLOW — scoped to admin portal applications
Auto-Redeem: false
MFA Trust: true (Sui Generis enforces MFA via their own CA)
Identity Sync: Not applicable (no sync needed)
```

**Note:** PAX8 US (`3de67d67-88e8-42c0-88ea-13bfc2fc2f55`) does NOT need a B2B partner override — their access is purely GDAP.

---

## Tenants Where This GDAP Exists

Per the Phase 1 audit, the PAX8 US tenant (`3de67d67`) was found in cross-tenant access partner policies for:

| Tenant | PAX8 Policy Found | Sui Generis Policy Found |
|--------|-------------------|-------------------------|
| HTT | ✅ | Not in partner policies (guest account exists) |
| BCC | Unknown (not in audit data) | Unknown |
| FN | ✅ | Not found |
| TLL | ✅ | ✅ (tenant `daee2992`) |
| DCE | ✅ (`isServiceProvider: true`) | Not found |

**Action Item**: Confirm with Megan whether the same 6-role GDAP is applied identically to all 5 tenants, or if some tenants have different role sets.

---

## SGI Techs Security Group

Per Megan's response, a security group called **"SGI Techs"** exists in each tenant containing all Sui Generis team members with GDAP access. This group has Conditional Access policies applied.

**Action Item**: Audit the membership of the SGI Techs group in each tenant to maintain a named list of engineers with access for compliance purposes.

---

*Analysis performed: 2026-04-13*  
*Source: GDAP screenshots from Megan Myrand*  
*Related: `msp-responses-megan-2026-04-13.md`, `reports/unknown-tenant-investigation.json`*
