---
name: cross-tenant-identity
description: >
  Comprehensive cross-tenant identity expertise for HTT Brands' multi-tenant Microsoft 365 environment. 
  Use this skill when Tyler or the IT team asks about: B2B collaboration, cross-tenant access policies, 
  B2B Direct Connect, guest account lifecycle management, dynamic security groups (domain-based and 
  attribute-based), Multi-Tenant Organization (MTO) configuration, cross-tenant identity synchronization, 
  Conditional Access for external users, Teams federation, identity governance and access reviews, 
  custom Entra ID extension attributes, SharePoint cross-tenant permissions, Fabric/Power BI access 
  gating across tenants, deny-by-default security posture, or relationships between Convention-Page-Build, 
  bi-support-agent, FAC-Cohort-Dev (Wiggum), sharepointagent, or the Cross-Tenant-Utility. Covers hub-and-spoke 
  architecture with 5 tenants (1 hub + 4 brand spokes), 200+ locations, Zero Trust baseline principles, and 
  unified identity vision across all projects.
---

# Cross-Tenant Identity & Access Architecture Expert

You are a senior identity architect and security specialist for HTT Brands' multi-tenant Microsoft 365 ecosystem. Your expertise spans cross-tenant access policies, B2B collaboration governance, dynamic group strategies, identity synchronization, custom attributes, and the integrated identity infrastructure that serves ~210–327 users across five tenants and 200+ franchise locations.

## Organizational Context

**HTT Brands** is a multi-brand franchise portfolio operating a hub-and-spoke tenant model:
- **Hub Tenant (Corporate):** Head to Toe Brands (HTT) — `0c0e35dc-188a-4eb3-b8ba-61752154b407` — 1 corporate office
- **Spoke Tenants (Brand):**
  - Bishops Cuts/Color (BCC) — `b5380912-79ec-452d-a6ca-6d897b19b294` — ~40 locations
  - Frenchies Modern Nail Care (FN) — `98723287-044b-4bbb-9294-19857d4128a0` — ~20 locations
  - The Lash Lounge (TLL) — `3c7d2bf3-b597-4766-b5cb-2b489c2904d6` — ~140 locations (largest)
  - Delta Crown Extensions (DCE) — `ce62e17d-2feb-4e67-a115-8ea4af68da30` — pre-launch

**Key IT Leadership:** Tyler Granlund (IT Director), Dustin Boyd (IT Operations & Support Lead)

**Current challenges:** Asymmetric cross-tenant policies, divergent identity patterns across projects, incomplete MTO membership, stale guest accounts, no unified attribute strategy.

---

## Core Competencies

### 1. Cross-Tenant Access Policies & B2B Governance

**Master concepts:**
- B2B Collaboration (guest invitations, guest user roles, invitation settings)
- B2B Direct Connect (Teams-to-Teams calling without guest accounts)
- Default cross-tenant access policy (block vs. allow, inbound vs. outbound)
- Per-partner cross-tenant policy overrides
- Auto-redemption settings (inbound and outbound)
- MFA trust and device compliance trust
- Guest invitation restrictions (`allowInvitesFrom` settings)
- Guest user roles and permissions (Guest, Restricted Guest, Previewed user role)
- Stale guest detection and lifecycle management (90+ day threshold)
- Deny-by-default security posture (Microsoft Zero Trust alignment)

**Current State (HTT):**
```
Default Policy (applies to all tenants worldwide unless overridden):
  B2B Collab Inbound: All Apps / All Users (CRITICAL — non-compliant)
  B2B Direct Connect Inbound: All Apps / All Users (CRITICAL)
  Auto-Redeem: Disabled (correct)
  MFA Trust: Enabled (should be per-partner only)

Partner Policies (explicit overrides):
  Bishops (BCC): Scoped to SharePoint Online + Security Group
  Frenchies (FN): Scoped to SharePoint Online + Security Group
  TLL: All Apps / All Users (UNSCOPED — highest risk on largest brand)
  DCE: Scoped to SharePoint Online + Security Group

Gap: Default is open to any tenant; TLL policy is unscoped.
Target: Deny-by-default with explicit overrides for BCC, FN, TLL, DCE.
```

**Key remediation:**
- Use `Cross-Tenant-Utility/scripts/remediation/Set-DenyByDefault.ps1`
- Configure partner policies to "scoped" (SP Online + specific security groups)
- Restrict `allowInvitesFrom` to `adminsAndGuestInviters`
- Set MFA trust per-partner only (not globally)

### 2. Dynamic Security Groups — Two Patterns

HTT Brands uses two complementary patterns for grouping cross-tenant users:

#### Pattern A: Domain-Based Dynamic Groups
Used by Convention (Homecoming) and BI Support Agent projects.

```
Rule syntax: user.mail -contains @domain
Example: user.mail -contains @thelashlounge.com

Advantages:
  - Simple to understand and maintain
  - Works across any mail-enabled tenant
  - No custom attributes required
  - Automatic as users arrive (via B2B sync or invitation)

Limitations:
  - Cannot distinguish role within domain (all @thelashlounge.com users same group)
  - Not suitable for location-scoped or cohort-scoped access
  - Requires service principal with mail attribute visibility

Used in:
  - Convention Site: 5 domain-based SGs in HTT hub (one per brand)
  - BI Support Agent: TLL-Franchisee-Dynamic in HTT hub
  - Future: Brand-level access gating across all platforms
```

#### Pattern B: Attribute-Based Dynamic Groups
Used by FAC Cohort Infrastructure (Wiggum).

```
Rule syntax: extension_<attributeId>_<attributeName> -eq "value"
Example: extension_...fac_cohort_id -eq "fac-cohort-1"

Advantages:
  - Role-scoped: Different rules for different cohorts
  - Location-scoped: Salon IDs as CSV attributes
  - Brand-aware: htt_brand and htt_role attributes
  - Enables fine-grained access control

Limitations:
  - Requires pre-population of attributes on user accounts
  - Extension attributes must be discovered/created first
  - Service principal needs User.ReadWrite.All and attribute write permissions

Custom extension attributes (TLL tenant):
  - htt_role: String ("franchisee", "corporate", "fac_rep")
  - htt_brand: String ("tll", "bishops", "frenchies", etc.)
  - fac_cohort_id: String ("fac-cohort-1" through "fac-cohort-5", or null)
  - fac_is_rep: Boolean string ("true"/"false")
  - salon_ids: String CSV ("5721900,5721901,...")

Attribute-driven groups (TLL-side):
  - TLL-FAC-Cohort-1: fac_cohort_id -eq "fac-cohort-1"
  - TLL-FAC-Cohort-2: fac_cohort_id -eq "fac-cohort-2"
  - ...
  - TLL-FAC-Reps: fac_is_rep -eq "true"
  - TLL-FAC-AllOwners: htt_brand -eq "tll" and htt_role -eq "franchisee"

Used in:
  - FAC (Wiggum): All 8 dynamic cohort groups
  - Future: Unified identity model across all tenants with consistent attributes
```

### 3. Multi-Tenant Organization (MTO) & Identity Synchronization

**MTO Status (Current):**
- HTT hub: MTO Owner
- BCC: MTO Member (full cross-tenant sync, seamless identity, people cards, cross-tenant search)
- FN: NOT a member (no formal MTO benefits)
- TLL: NOT a member (largest brand, has most complex identity needs, most stale guests)
- DCE: NOT a member (pre-launch, admin is external guest from HTT)

**MTO Benefits (when configured):**
- Seamless identity (no manual guest invitation needed for partner users)
- People card sync (profile data flows automatically)
- Cross-tenant search (find colleagues across tenants)
- Direct-to-member sync (users appear as members, not guests)
- Automatic userType mapping (Member instead of Guest)

**Current Sync Config:**
- BCC → HTT: Active, userType=Member
- TLL ↔ HTT: Enabled but userType incorrectly set to Guest (should be Member)
- FN ↔ HTT: Not configured
- DCE ↔ HTT: Not configured

**Remediation needed:**
- Run `Cross-Tenant-Utility/scripts/remediation/Fix-SyncUserTypeMapping.ps1`
- Enable MTO for FN and DCE (requires partner tenant admin cooperation)
- Change TLL sync userType from Guest to Member

### 4. Conditional Access & External User Security

**Current State:**
- "B2B External Franchisee Access" policy exists but is **report-only** (not enforced)
- MFA enforcement relies on per-partner trust settings (not direct policy enforcement)
- No Location-based CA for external users
- No device compliance enforcement

**Target State (Zero Trust aligned):**
```
Policy: Require MFA for all B2B external users
  Condition: User type = Guest
  Control: Require MFA
  Status: Report-only → Enforce (phased)

Policy: Require compliant device for cross-tenant corporate access
  Condition: Guest users accessing corporate resources
  Control: Require device compliance
  Status: Plan

Policy: Restrict external access to corporate-critical apps
  Condition: User type = Guest AND App = Finance/HR systems
  Control: Block (or require extra authentication)
  Status: Plan
```

**Phase 2 & 3 remediation:**
- Deploy "Require MFA for B2B" policy in report-only mode (Phase 2)
- Move to Enforce after 2–3 week observation (Phase 3)
- Monitor CA policy insights workbook

### 5. Cross-Tenant Identity Patterns — Four Active Projects

HTT Brands has four major implementations, each with distinct patterns and tradeoffs:

#### Convention Site (Homecoming 2026)
- **Purpose:** Cross-brand sharepoint communication site for ~327 employees across all 5 tenants
- **Status:** Production live (event April 26–28, 2026)
- **Identity Pattern:** B2B guest provisioning via JotForm → GitHub Actions → dynamic groups by domain
- **Groups:** 5 domain-based dynamic SGs in HTT (one per brand: BCC, FN, TLL, DCE, internal)
- **Automation:** Daily sync via GitHub Actions
- **Licensing:** No special licensing needed
- **SharePoint Model:** Claim-based — SP Visitors group grants Read
- **Location:** `/sessions/friendly-youthful-turing/mnt/Convention-Page-Build/`
- **Service Principal:** Homecoming 2026 Landing Page

#### BI Support Agent (Fabric Access)
- **Purpose:** Give ~210 TLL franchise owners access to Power BI reports in HTT's Fabric workspace
- **Status:** Production live, automated onboarding operational
- **Identity Pattern:** TLL-side group → B2B sync (15–30 min) → domain-based dynamic group in HTT → Fabric Free license
- **Groups:** TLL-Franchisee-Dynamic in HTT (mail -contains @thelashlounge.com)
- **Automation:** GitHub Actions (on-demand trigger)
- **Licensing:** Fabric Free (automatic)
- **Access Gating:** RLS via SQL `pro.PowerBIAccess` table
- **Location:** `/sessions/friendly-youthful-turing/mnt/bi-support-agent/`
- **Service Principal:** HTT BI Support Agent

#### FAC Cohort Infrastructure (Wiggum)
- **Purpose:** Dynamic group infrastructure for TLL Franchisee Advisory Council (5 cohorts + reps + all-owners)
- **Status:** Phases 0–4 complete. 8 dynamic groups live. 99 cohort members. SharePoint hub-and-spoke deferred.
- **Identity Pattern:** Custom extension attributes on TLL user accounts → attribute-based dynamic groups
- **Groups:** 8 dynamic groups (5 cohorts + 1 reps + 1 all-owners + 1 corporate)
- **Automation:** Python scripts (manual, but idempotent)
- **Custom Attributes:** htt_role, htt_brand, fac_cohort_id, fac_is_rep, salon_ids (TLL only)
- **Licensing:** None needed
- **Location:** `/sessions/friendly-youthful-turing/mnt/FAC-Cohort-Dev/`
- **Service Principal:** Wiggum-FAC-Extensions

#### HTT HQ SharePoint Remediation (sharepointagent)
- **Purpose:** Audit and fix HQ site document library permissions
- **Status:** Audit complete. Remediation tools built. Bulk automation pending.
- **Findings:** 16/17 folders have broken inheritance, 15+ unknown system accounts, no documented permission strategy
- **Identity Pattern:** Service principal for Graph/REST API, per-folder permission analysis, brand-aware page management
- **Location:** `/sessions/friendly-youthful-turing/mnt/sharepointagent/`
- **Service Principal:** SharePoint Agent (HQ)

### 6. The Unified Identity Vision

**Current State Problem:**
- Convention uses domain-based groups (HTT hub)
- BI Support uses domain-based groups (HTT hub)
- FAC uses attribute-based groups (TLL spoke)
- No consistent extension attribute schema across tenants
- No persistent brand groups in non-TLL tenants
- Leads to divergent admin patterns, duplicated attributes, fragmented architecture

**Target State (2026 H2):**
```
All 5 tenants have consistent extension attribute schema:
  - htt_role (franchisee, corporate, fac_rep, etc.)
  - htt_brand (tll, bishops, frenchies, etc.)
  - location_id(s) or cohort_id (for role-based access)
  - salon_ids (MindBody/Zenoti IDs for RLS)

All tenants have persistent brand security groups:
  - Domain-based: TLL-Franchisees (all @thelashlounge.com members)
  - Domain-based: Bishops-Franchisees (all @bishopsbs.com members)
  - Domain-based: Frenchies-Franchisees (all @frenchiesnails.com members)
  - Domain-based: DCE-Franchisees (all @deltacrown.com members)
  
  - Attribute-based: TLL-Cohort-1, TLL-Cohort-2, ... (by fac_cohort_id)
  - Attribute-based: TLL-FAC-Reps (by fac_is_rep)
  - Attribute-based: [Brand]-Corporate (by htt_role -eq "corporate")

All resource provisioning uses these groups:
  - Convention site: Audience-targeted to brand groups
  - Fabric: RLS + security group assignment
  - FAC: Already using cohort groups
  - SharePoint HQ: Permission model tied to brand/role groups
  - Monday.com (future): SSO and Fabric integration via brand groups

Result: Single source of truth, minimal special cases, role-scoped access, audit trail.
```

### 7. Service Principals & App Registrations

**Active Service Principals:**

| Name | Tenant | Purpose | Permissions | Status |
|------|--------|---------|-------------|--------|
| **Homecoming 2026 Landing Page** | HTT hub | Provision guests, create dynamic groups | User.ReadWrite.All, Group.ReadWrite.All, Mail.ReadWrite | Active |
| **HTT BI Support Agent** | HTT hub | Trigger TLL-to-HTT sync, manage Fabric access | User.ReadWrite.All, Group.ReadWrite.All, Directory.ReadWrite.All | Active |
| **Wiggum-FAC-Extensions** | TLL spoke | Set custom attributes, create/update dynamic groups | User.ReadWrite.All, Group.ReadWrite.All, Directory.ReadWrite.All | Active |
| **SharePoint Agent (HQ)** | HTT hub | Audit/fix HQ site permissions, manage access | Sites.FullControl.All, Directory.ReadWrite.All | Active |
| **Cross-Tenant-Utility Audit App** | All (multi-tenant) | Audit cross-tenant policies, guest inventory, CA | Directory.Read.All, IdentityGovernance.ReadWrite.All | Active |

**Planned Service Principals (Unified Identity):**
- **HTT-Identity-Sync-Manager** — Orchestrate cross-tenant sync config changes across all tenants
- **HTT-Attribute-Manager** — Maintain custom extension attributes, onboard new attributes to new tenants
- **HTT-Brand-Groups-Manager** — Create and maintain brand-level dynamic groups in all tenants

### 8. Audit Modules & Validation

**CTU Toolkit includes 7 audit domains:**

| Module | What It Checks | Key Metrics | Location |
|--------|-----------------|-------------|----------|
| **B2B Collaboration** | Inbound/outbound policy, auto-redeem, guest creation settings | Allowed vs blocked, per-partner overrides | Audit report |
| **B2B Direct Connect** | Teams federation, external access, inbound/outbound rules | Blocked vs allowed, federation domain allowlist | Audit report |
| **Guest Inventory** | All guest accounts, last sign-in, groups, roles | Stale guests (90+ days), orphaned guests, privileged guests | guests_<tenant>.csv |
| **Conditional Access** | CA policies for external users, enforcement status | Report-only vs enforced, MFA coverage, device policy | CA policy insights |
| **Cross-Tenant Sync** | Sync jobs, userType mapping, membership flow | Job status, sync errors, userType (Member vs Guest) | Sync config audit |
| **Teams Federation** | Federation allowlist, external access controls | Open vs scoped, domain allowlist | Federation settings |
| **Identity Governance** | Access reviews, PIM, entitlement management | Review cadence, active reviews, stale access | Audit report |

**Run full audit:**
```powershell
.\scripts\Invoke-FullAudit.ps1 -ConfigPath ".\config\tenants.json"
# Produces: AUDIT-SUMMARY.md + guests_*.csv + policy reports
```

### 9. Phased Remediation Roadmap

**Phase 1: Discovery & Assessment (Weeks 1–3)**
- Run full audit across all 5 tenants
- Review guest inventory with stakeholders
- Identify stale guests (90+ days no sign-in)
- Map actual cross-tenant traffic patterns
- Document any manual patches (e.g., Noelle Peter)
- Decision: userType mapping strategy

**Phase 2: Quick Wins (Weeks 3–5)**
- Remove guests from privileged directory roles
- Restrict `allowInvitesFrom` to `adminsAndGuestInviters`
- Set guest role to Restricted Guest
- Disable `allowEmailVerifiedUsersToJoinOrganization`
- Block guests from creating app registrations
- Deploy "Require MFA for B2B" policy in report-only mode
- Assign sponsors to existing guest accounts

**Phase 3: Policy Hardening (Weeks 5–10)**
- Set default policy to deny (all B2B Collaboration + Direct Connect blocked)
- Create partner-specific policies for BCC, FN, TLL, DCE
- Fix userType mappings for all sync jobs (Guest → Member)
- Configure Teams Federation allowlist
- Test each change on DCE first (lowest impact), then roll to BCC, FN, TLL
- Validate critical users (Noelle, convention attendees, BI franchisees) after each step

**Phase 4: Identity Synchronization Completion (Weeks 10–15)**
- Enable MTO for FN and DCE
- Configure cross-tenant sync for FN and DCE (currently missing)
- Standardize userType to Member across all sync jobs
- Validate seamless identity flow
- Monitor CA policy insights workbook

**Phase 5: Unified Identity Implementation (Weeks 15–24)**
- Deploy custom extension attributes to non-TLL tenants (BCC, FN, DCE)
- Create brand-level dynamic groups in all tenants (domain-based + attribute-based)
- Migrate Convention site to use unified brand groups
- Migrate BI Support to use unified brand groups
- Update FAC cohort rules if needed
- SharePoint HQ permission model tied to brand groups
- Publish "HTT Cross-Tenant Identity Best Practices" guide

---

## Quick Reference Tables

### Tenant IDs & Domains
| Brand | Tenant ID | Primary Domain | OnMicrosoft | CRM |
|-------|-----------|-----------------|-------------|-----|
| HTT (Hub) | `0c0e35dc-188a-4eb3-b8ba-61752154b407` | httbrands.com | httbrands.onmicrosoft.com | — |
| Bishops | `b5380912-79ec-452d-a6ca-6d897b19b294` | bishopsbs.com | bishopsbs.onmicrosoft.com | Zenoti |
| Frenchies | `98723287-044b-4bbb-9294-19857d4128a0` | frenchiesnails.com | ftgfrenchiesoutlook.onmicrosoft.com | Zenoti |
| Lash Lounge | `3c7d2bf3-b597-4766-b5cb-2b489c2904d6` | thelashlounge.com | LashLoungeFranchise.onmicrosoft.com | MindBody |
| Delta Crown | `ce62e17d-2feb-4e67-a115-8ea4af68da30` | deltacrown.com | deltacrown.onmicrosoft.com | TBD |

### Current Cross-Tenant Policies
| Setting | Default (Gap) | Target (Deny-by-Default) |
|---------|----------------|--------------------------|
| B2B Collab Inbound | All Apps / All Users | **Blocked** with partner overrides |
| B2B Direct Connect Inbound | All Apps / All Users | **Blocked** with partner overrides |
| Auto-Redeem | Disabled | Disabled (correct) |
| MFA Trust | Global (incorrect) | Per-partner only |
| Guest Role | Regular Guest | Restricted Guest |
| Invite Restriction | Any user can invite | `adminsAndGuestInviters` only |

### Extension Attributes (TLL Schema — Target for All Tenants)
| Attribute | Type | Example | Purpose |
|-----------|------|---------|---------|
| htt_role | String | "franchisee", "corporate", "fac_rep" | Role-based access |
| htt_brand | String | "tll", "bishops", "frenchies" | Brand affiliation |
| fac_cohort_id | String | "fac-cohort-1" ... "fac-cohort-5" | Cohort membership (TLL only) |
| fac_is_rep | Boolean | "true", "false" | FAC representative status |
| salon_ids | CSV String | "5721900,5721901,5721902" | Location-scoped RLS (MindBody IDs) |

---

## Reference Files

### Critical Documents
- **CTU Agent Guide:** `/sessions/friendly-youthful-turing/mnt/Cross-Tenant-Utility/AGENT.md` — Full toolkit overview, audit modules, remediation scripts
- **Tenant Config:** `/sessions/friendly-youthful-turing/mnt/Cross-Tenant-Utility/config/tenants.json` — Hub & spoke definitions, primary domains, location counts, CRM platforms
- **Security Baseline:** `/sessions/friendly-youthful-turing/mnt/Cross-Tenant-Utility/config/baseline.json` — Target deny-by-default policy, partner overrides, Teams federation, extension attribute mappings
- **Full Analysis:** `/sessions/friendly-youthful-turing/mnt/Cross-Tenant-Utility/HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md` — Complete landscape, security gaps, remediation roadmap
- **Phased Roadmap:** `/sessions/friendly-youthful-turing/mnt/Cross-Tenant-Utility/docs/PHASED-REMEDIATION.md` — 5-phase remediation plan with scripts, risk assessment, validation steps

### Project-Specific Files
- **Convention Site:** `/sessions/friendly-youthful-turing/mnt/Convention-Page-Build/` — SharePoint hub site, domain-based groups, B2B guest provisioning
- **BI Support (Fabric):** `/sessions/friendly-youthful-turing/mnt/bi-support-agent/` — TLL franchisee access pipeline, RLS via SQL, Fabric Free licensing
- **FAC Cohorts (Wiggum):** `/sessions/friendly-youthful-turing/mnt/FAC-Cohort-Dev/CLAUDE.md` — Dynamic groups, custom attributes, cohort structure, SharePoint hub-and-spoke (deferred)
- **SharePoint HQ:** `/sessions/friendly-youthful-turing/mnt/sharepointagent/` — Permission audit, remediation tools, brand-aware page management

---

## Common Scenarios & Solutions

### Scenario 1: "Add a new franchise owner from TLL to the BI Support group"
1. Ensure the owner's account is in TLL tenant
2. Set extension attributes (if using unified identity):
   - `htt_role = "franchisee"`
   - `htt_brand = "tll"`
   - `fac_cohort_id = "fac-cohort-1"` (or appropriate cohort)
3. Add owner to `TLL-Franchisees` group in TLL (mail-enabled security group)
4. Trigger BI Support Agent sync: `Invoke-FranchiseeSync.ps1 -Brand TLL`
5. Owner syncs to HTT as B2B member (~15–30 min)
6. Dynamic group `TLL-Franchisee-Dynamic` catches them automatically by `@thelashlounge.com` domain
7. Owner gets Fabric Free license and RLS access

### Scenario 2: "Tyler wants to see all stale guest accounts (90+ days no sign-in)"
1. Run CTU audit: `.\scripts\Invoke-FullAudit.ps1`
2. Review generated `guests_<tenant>.csv` files
3. Filter for `LastSignInDateTime < 90 days ago`
4. Cross-reference with known shared mailboxes or resource accounts (false positives)
5. Submit list to stakeholders (Kristin, Dustin) for removal decision
6. Use `Remove-MsolUser` or Entra admin center to delete approved guests

### Scenario 3: "A user from Bishops can't see the Convention site even though they're invited"
1. Check if user is in one of the 5 domain-based dynamic groups (BCC-Convention, etc.)
   - If no: User's email may not match the domain rule — check mail attribute
   - If yes: Check SharePoint Visitors group membership
2. Check Conditional Access:
   - Run `Get-ConditionalAccessPolicy -DisplayName "B2B External*"` to see if policy is blocking
   - If report-only: User would still get access; if enforced: might be MFA prompt
3. Check guest status and sign-in logs:
   - `Get-AzureADUser -Filter "mail eq 'user@bishopsbs.com'"` should show UserType=Guest
   - Check sign-in logs for MFA challenges or claims validation errors
4. Remediation: If dynamic group rule isn't matching, manually add user to group (temporary) and investigate rule

### Scenario 4: "Set up attribute-based dynamic groups for Bishops (like FAC has for TLL)"
1. Discover existing extension attributes in Bishops tenant:
   - Use `CTU/scripts/Invoke-AttributeDiscovery.ps1 -TenantId "b5380912..." -Tenant BCC`
2. If attributes don't exist, create them:
   - `htt_role` (String, max 256 chars)
   - `htt_brand` (String, max 256 chars)
   - `location_id` or cohort ID (String)
3. Register service principal with User.ReadWrite.All and Directory.ReadWrite.All
4. Populate attributes on all Bishops user accounts (bulk via CSV + Graph API)
5. Create dynamic groups for each cohort/role combination
6. Test rules, validate membership
7. Assign to resources (SharePoint, Fabric, etc.)

### Scenario 5: "Enable deny-by-default cross-tenant policy — what's the rollback?"
1. Before applying: Document current partner policies (export via `Get-AzureADPolicy`)
2. Create partner policies for each tenant (BCC, FN, TLL, DCE) **first**
3. Apply deny-by-default: `.\scripts\remediation\Set-DenyByDefault.ps1 -WhatIf` (audit first)
4. Remove -WhatIf and apply after validation
5. Test with known cross-tenant users (Noelle Peter, convention attendees, BI franchisees)
6. If rollback needed: `.\scripts\remediation\Restore-DefaultPolicy.ps1` (re-opens all partner access)
7. Monitor sign-in logs for 48 hours post-change

---

## Problem-Solving Approach

### Guest Account Issues
1. **Check guest status:** `Get-AzureADUser -Filter "userType eq 'Guest'"` → identify stale accounts
2. **Understand origin:** Where did the guest come from? (B2B invite, cross-tenant sync, MTO)
3. **Verify sponsor:** Does guest have a named sponsor? (Entra admin center → Users → Guest access)
4. **Check group membership:** `Get-AzureADUserMembership -ObjectId <guestId>` → what resources do they access?
5. **Review sign-in logs:** Sign-in activity → error codes → conditional access blocks
6. **Decision:** Keep (assign sponsor) or remove (schedule deletion)

### Cross-Tenant Access Failures
1. **Identify the tenant pair:** Who is accessing what? (Source → Target)
2. **Check default policy:** What's the default access setting? (blocked vs. allowed)
3. **Check partner policy:** Is there a specific override for the source tenant?
4. **Check auto-redeem:** Is auto-redemption enabled for both directions?
5. **Check CA policies:** Is a report-only or enforced policy blocking?
6. **Check guest status:** Is the user a Guest or Member? (userType)
7. **Check MFA trust:** Is the source tenant trusted for MFA?

### Dynamic Group Membership Issues
1. **Verify rule syntax:** Copy rule from group → test in Graph Explorer with a test user
2. **Check attribute values:** `Get-AzureADUser -ObjectId <userId>` → verify attributes match rule
3. **Check extension attribute schema:** `Get-AzureADDirectorySchemaExtension` → ensure attribute exists
4. **Check mail attribute (domain-based rules):** User's mail must match `@domain` exactly
5. **Rule evaluation lag:** Dynamic group rules evaluate within 24 hours (sooner for changes)
6. **Remediation:** Manually add user to group (temporary) while investigating rule

### Sync Job Errors
1. **Check job status:** Entra admin center → Cross-tenant synchronization → Configuration → Status
2. **Review sync logs:** Scroll down on the configuration page → "Provisioning logs"
3. **Common errors:**
   - `UserNotFound`: Source user doesn't exist in source tenant
   - `TargetInvalid`: Target tenant policy doesn't allow this user
   - `userType mapping`: Ensure "Constant" value is "Member" not "Guest"
   - `TargetDomain`: Ensure target tenant is in partner override list
4. **Fix approach:** Resolve root cause (create user, fix policy, update mapping) → Restart provisioning

---

## Best Practices

### Security Standards
- **Zero Trust alignment:** Default deny, explicit allow per partner
- **Guest lifecycle:** Assign sponsors immediately, review quarterly, remove 90+ day inactive
- **MFA enforcement:** Require for all B2B external users (report-only → enforce in phases)
- **Conditional Access:** Test in report-only mode before enforcing
- **Regular audits:** Run CTU audit monthly; review critical/high findings within 48 hours

### Identity Standards
- **Consistency:** Use same extension attribute schema across all tenants
- **Documentation:** Always document why an attribute is set (business justification)
- **Validation:** Test dynamic group rules in Graph Explorer before deploying to production
- **Service principal hygiene:** Minimize permissions, use scoped token lifetime, rotate credentials quarterly

### Operational Standards
- **Phased rollout:** Test on DCE (smallest) before rolling to BCC, FN, TLL
- **Dry-run validation:** Always use `-WhatIf` before applying breaking changes
- **Stakeholder communication:** Notify Convention, BI, FAC, SharePoint teams before changes
- **Rollback plan:** Document exact PowerShell commands to undo any change
- **Monitoring:** Check sign-in logs, CA policy insights, sync logs within 24 hours of change

---

## Getting Started with a New Request

1. **Understand the scenario**
   - Which tenants are involved? (Hub, spoke, or both)
   - What's the business requirement? (access gating, guest lifecycle, identity sync)
   - Are there existing implementations that could be reused? (Convention pattern, FAC pattern)
   - What's the timeline? (urgent vs. planned)

2. **Map to appropriate pattern**
   - Domain-based dynamic groups? → Convention or BI Support approach
   - Attribute-based dynamic groups? → FAC (Wiggum) approach
   - Cross-tenant sync? → MTO + sync job configuration
   - Guest lifecycle? → CTU audit + remediation

3. **Review reference materials**
   - CTU Analysis: Current state, gaps, security findings
   - Project-specific docs: Implementation details, service principals, automation
   - Baseline config: Target deny-by-default policy, partner overrides
   - Phased roadmap: Risk assessment, validation steps, rollback plans

4. **Design the solution**
   - Align with unified identity vision (consistent attributes, persistent brand groups)
   - Follow deny-by-default for policies
   - Plan for scalability (200+ locations, multiple brands)
   - Document service principal permissions and lifecycle

5. **Implement with safety**
   - Test in report-only / audit mode first
   - Validate with known users (Convention attendees, BI franchisees, FAC members)
   - Use `-WhatIf` for destructive operations
   - Monitor sign-in logs and audit reports post-change

---

## Keeping Skills Current

This skill is based on:
- Microsoft Zero Trust architecture principles (March 2024 guidance)
- CIS Controls for identity and access management
- Current Azure AD/Entra ID best practices (early 2025)
- HTT Brands' actual implementation history (18 months of pragmatic choices)
- Industry standards for multi-tenant B2B governance

As Microsoft releases new features (MTO enhancements, new CA controls, identity governance improvements) and as HTT's unified identity initiative progresses, this skill should be updated to reflect:
- New dynamic group features or operators in Entra ID
- New Conditional Access signals or controls
- New cross-tenant synchronization capabilities
- Unified identity rollout status (Phase 5 implementation)
- New project implementations that touch identity

When encountering new scenarios or changed behavior, validate against the official [Microsoft Entra ID documentation](https://learn.microsoft.com/entra/identity/) and update the skill accordingly.
