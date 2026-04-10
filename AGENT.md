# AGENT.md — Cross-Tenant Utility Project Context

> This file is the authoritative context document for the agentic coding assistant working on
> the **Cross-Tenant Utility (CTU)** initiative. Read this fully before acting on any prompt
> in this project.

---

## Who You Are Working For

**Tyler Granlund** — IT Director, HTT Brands  
**Dustin Boyd** — IT Operations & Support Lead, HTT Brands  

You are operating as a technical implementation partner for enterprise identity governance
across a complex multi-tenant Microsoft 365 environment. All work must be production-safe,
auditable, repeatable, and thoroughly documented. Accuracy and compliance are paramount.

---

## What This Project Is

**Cross-Tenant Utility (CTU)** is the enterprise identity governance toolkit for HTT Brands'
multi-tenant Microsoft 365 environment. It covers:

1. **PowerShell-based 7-domain audit framework** covering Cross-Tenant Sync, B2B Collaboration,
   B2B Direct Connect, Guest Inventory, Conditional Access, Teams Federation, and Identity
   Governance — read-only comprehensive assessment across all 5 tenants

2. **5-phase remediation roadmap**: Discovery → Quick Wins → Policy Hardening → Governance →
   Monitoring — spanning 16 weeks from audit through sustained operations

3. **Deny-by-default cross-tenant access policy** replacing open-by-default HTT hub policy,
   with explicit per-partner overrides for BCC, Frenchies, TLL, and Delta Crown

4. **Persistent brand-level dynamic security groups** (replacing ad-hoc per-project groups)
   driven by unified custom attributes across all tenants

5. **Unified custom attribute strategy** extending the TLL FAC-Cohort-Dev attributes
   (htt_role, htt_brand, fac_cohort_id, etc.) to all brands for consistent role-based access

6. **Monitoring via Azure Monitor KQL alert queries** — recurring stale guest detection,
   privileged role changes, sync failures, cross-tenant redeem anomalies

7. **Cross-project consolidation** touching Convention-Page-Build, bi-support-agent,
   FAC-Cohort-Dev (Wiggum), and sharepointagent — unified governance preventing
   per-project security drift

---

## Tenant & Environment Context

| Parameter | Value |
|-----------|-------|
| **HTT Tenant ID (Hub)** | `0c0e35dc-188a-4eb3-b8ba-61752154b407` |
| **HTT Primary Domain** | `httbrands.com` |
| **BCC Tenant ID** | `b5380912-79ec-452d-a6ca-6d897b19b294` |
| **BCC Primary Domain** | `bishops.co` |
| **FN Tenant ID** | `98723287-044b-4bbb-9294-19857d4128a0` |
| **FN Primary Domain** | `frenchiesnails.com` |
| **TLL Tenant ID** | `3c7d2bf3-b597-4766-b5cb-2b489c2904d6` |
| **TLL Primary Domain** | `thelashlounge.com` |
| **DCE Tenant ID** | `ce62e17d-2feb-4e67-a115-8ea4af68da30` |
| **DCE Primary Domain** | `deltacrown.com` |
| **Primary Admin UPN** | `tyler.granlund-admin@httbrands.com` |
| **Secondary Admin UPN** | `dustin.boyd-admin@httbrands.com` |
| **MTO Owner** | HTT Brands |
| **MTO Members (Current)** | Bishops only |
| **MTO Not Joined (Targets for remediation)** | Frenchies, TLL, Delta Crown |

> **CRITICAL**: The CTU audit targets **ALL 5 tenants**. Remediation scripts primarily target
> HTT hub tenant default policy and partner-specific overrides. Some operations (Teams
> federation allowlist, sync troubleshooting) require per-tenant interactive authentication.
> Never blindly apply HTT remediations to non-HTT tenants without explicit approval per tenant.

---

## Current Cross-Tenant Configuration (As-Found)

This is the **baseline state** before remediation — the CTU audit documents this state
and subsequent phases move it toward the target.

### HTT Hub (Tenant: 0c0e35dc-188a-4eb3-b8ba-61752154b407)

- **Default B2B Inbound Policy**: B2B Collaboration + Direct Connect = `AllApplications` /
  `AllUsers` (OPEN — non-compliant)
- **Default B2B Outbound Policy**: Not restricted
- **Default Direct Connect Inbound**: Not explicitly scoped (inherits AllApplications)
- **Guest Invitation Settings**: Not locked down (not restricted to admins)
- **Guest User Role**: Not enforced to Restricted
- **Email Verified Join**: Not disabled
- **Teams Federation**: Open (consumer access enabled)

### BCC Tenant (Bishops — b5380912-79ec-452d-a6ca-6d897b19b294)

- **B2B Inbound**: Scoped to SharePoint Online + brand security group
- **Auto-redeem**: Both inbound and outbound enabled
- **MFA Trust**: Enabled
- **Identity Sync (B2B sync)**: Enabled (syncs to HTT as Member userType)
- **MTO Status**: Member of HTT MTO (full trust)
- **Notes**: Currently compliant baseline

### FN Tenant (Frenchies — 98723287-044b-4bbb-9294-19857d4128a0)

- **B2B Inbound**: Scoped to SharePoint Online + brand security group
- **Auto-redeem**: Hub-to-spoke only (no outbound)
- **MFA Trust**: Enabled
- **Identity Sync (B2B sync)**: Not configured (syncs as Guest userType)
- **MTO Status**: Not a member
- **Notes**: Scope and MFA good; userType and MTO are remediation targets

### TLL Tenant (The Lash Lounge — 3c7d2bf3-b597-4766-b5cb-2b489c2904d6)

- **B2B Inbound**: UNSCOPED (All Applications / All Users — non-compliant)
- **Auto-redeem**: Both inbound and outbound enabled
- **MFA Trust**: Enabled
- **Identity Sync (B2B sync)**: Enabled (syncs to HTT)
- **MTO Status**: Not a member (remediation target)
- **Notes**: Urgent remediation needed — policy overly open despite strong sync relationship

### DCE Tenant (Delta Crown — ce62e17d-2feb-4e67-a115-8ea4af68da30)

- **B2B Inbound**: Scoped to SharePoint Online + brand security group
- **Auto-redeem**: Hub-to-spoke only
- **MFA Trust**: Enabled
- **Identity Sync (B2B sync)**: Not configured (syncs as Guest userType)
- **MTO Status**: Not a member
- **Notes**: Similar to FN — scope/MFA good; userType and MTO are targets

---

## Baseline Security Targets (from baseline.json)

These targets drive all remediation work. They represent HTT Brands' target security posture.

### Default Policy (HTT Hub)
- B2B Inbound: **BLOCK** all applications and all users
- Direct Connect Inbound: **BLOCK** all (no guest object created)

### Per-Partner Policy Overrides
Each partner receives an explicit override to allow:
- **Scoped to**: SharePoint Online + brand-specific security group (e.g., `Bishops-Brand-Users`)
- **Auto-redeem**: Enabled for both inbound and outbound (trust relationship)
- **MFA Trust**: Required (external MFA satisfies internal MFA requirement)
- **Identity Sync**: Enabled where applicable with `userType = "Member"` (not Guest)

### Guest Invitation Settings
- **Who can invite**: `adminsAndGuestInviters` only (not everyone)
- **Guest role**: Restricted Guest User (object ID: `2af84b1e-...`)
- **Email verified join**: Disabled
- **Default guest link scope**: Internal-only

### Guest Lifecycle
- **Stale threshold**: 90 days (guests with no sign-in >90d flagged for review)
- **Automatic cleanup**: Pending implementation in Phase 4

### Access Reviews
- **Frequency**: Quarterly
- **Scope**: All external identities (guests + B2B partners)
- **Auto-apply deny**: Enabled (remediation of approvers denying removes access)
- **Owner notification**: Required before quarterly cycle

### Teams Configuration
- **Federation model**: Allowlist mode (only approved partner tenants can federate)
- **Consumer access**: Disabled (personal Microsoft accounts cannot authenticate)
- **Trial tenant federation**: Disabled (no temporary test tenants)

### Conditional Access (External Users)
- **MFA coverage**: All external users must satisfy MFA
- **App coverage**: All cloud applications (no legacy protocol bypass)
- **Sign-in frequency**: 4 hours for guests
- **Legacy auth**: Blocked for all external
- **Device compliance**: Mobile apps required

### Identity Governance
- **Access reviews**: Quarterly (per guest cohort)
- **PIM eligible vs. permanent**: All Global Admins must be eligible (never permanent)
- **Permanent Global Admin count**: Maximum 2 (primary + backup)
- **Lifecycle workflows**: New guest = auto-sponsor assignment; no sign-in >90d = auto-disable

---

## 7 Audit Domains

Each domain scans all 5 tenants and reports findings by severity.

### Domain 1: Cross-Tenant Sync

**Purpose**: Health of B2B Sync jobs (HTT hub syncing identities from partner tenants)

**Critical Checks**:
- Sync job status (running, quarantined, failed)
- Sync errors per job (must be 0)
- Last successful sync timestamp (must be <24h)

**High Checks**:
- UserType mapping (must be "Member" for synced identities, not "Guest")
- Provisioning failures (block assignment failures, attribute mapping errors)
- On-premises AD sync integration (if applicable)

**Medium Checks**:
- Sync rule evaluation (attribute filters, transformation rules)
- Sync delay (if >30 min, investigate)

**Audit Output**: JSON report per tenant listing sync job health and per-identity sync status

---

### Domain 2: B2B Collaboration

**Purpose**: Guest invitation, role, and email-verified-join controls

**Critical Checks**:
- Guest invitation restriction (must be `adminsAndGuestInviters`, not "everyone")
- Guest user role (must be "Restricted Guest User", not "Guest" or "Member")
- Email verified join (must be disabled)

**High Checks**:
- Default B2B inbound policy (must be block-by-default, not AllApplications)
- Guest consent required for apps (must be enabled)
- MFA requirement for guest first login (must be enforced via CA)

**Medium Checks**:
- Guest lifecycle settings (auto-review after X days)
- Guest data retention policy (deleted guests soft-deleted vs. hard-deleted)

**Audit Output**: CSV of tenant policies + JSON of guest role and invitation settings

---

### Domain 3: B2B Direct Connect

**Purpose**: Direct connect authorization and MFA trust for peer tenants

**Critical Checks**:
- Default direct connect inbound (must be block, not AllApplications)
- Partners with direct connect enabled (must have MFA trust configured)
- Direct connect scope (must not be AllApplications if enabled)

**High Checks**:
- MFA trust configuration (external MFA satisfies internal MFA requirement)
- Application scope (must be scoped, not all apps)
- User scope (must be scoped, not all users)

**Medium Checks**:
- Outbound direct connect settings (HTT → partner direct connect)

**Audit Output**: JSON listing default DC policy + per-partner DC settings and MFA trust

---

### Domain 4: Guest Inventory

**Purpose**: Guest account discovery and risk assessment

**Critical Checks**:
- Guests in privileged roles (any guest in Global Admin, Intune Admin, etc. = critical)
- Guest count by domain (untrusted domains = high risk)
- Guest with never-signed-in status >90 days (stale guest = high risk)

**High Checks**:
- Guest creation date (new guests <7 days = check for accidents)
- Guest last sign-in (>90 days = flag for cleanup)
- Guest source (invited by whom, from which domain)
- Guest MFA registration status (not enrolled = medium-high risk)

**Medium Checks**:
- Guest redeem method (direct link vs. invitation email)
- Guest device compliance

**Audit Output**: CSV of all guests with flags (privileged, stale, untrusted domain, no MFA)

---

### Domain 5: Conditional Access

**Purpose**: MFA, device, and application controls for external users

**Critical Checks**:
- MFA coverage for external users (must apply to all cloud apps)
- Legacy auth block for external (must block POP3, SMTP, IMAP for guests)
- App protection (required for unmanaged devices from external)

**High Checks**:
- Sign-in frequency for guests (must be <1 day, target 4 hours)
- Trusted location scope (HTT IP ranges or corporate VPN)
- High-risk user flow (must prompt MFA or block)

**Medium Checks**:
- Session duration (timeout frequency)
- Device compliance or management requirement

**Audit Output**: JSON of all CA policies targeting external users + coverage gaps

---

### Domain 6: Teams Federation

**Purpose**: Federation allowlist and consumer access control

**Critical Checks**:
- Federation allowlist enabled (must be allowlist mode, not open)
- Consumer access (must be disabled — no personal Microsoft account federation)
- Trial tenant federation (must be disabled)

**High Checks**:
- Allowed partner list (must match approved cross-tenant partners)
- Federation mode (allowlist vs. blockist)
- Guest conferencing (must not bypass org-wide settings)

**Medium Checks**:
- Anonymous meeting join (must require PIN or organizational access)
- Recording retention policy

**Audit Output**: JSON listing federation settings + allowed/blocked tenant list

---

### Domain 7: Identity Governance

**Purpose**: Access reviews, PIM, and entitlement lifecycle controls

**Critical Checks**:
- Global Admin permanent vs. eligible (all should be eligible, max 2 permanent)
- Privileged role PIM enrollment (all Tier-1 roles must be eligible with approval)
- Access reviews scheduled (none scheduled = gap)

**High Checks**:
- Access review frequency (must be quarterly for guests)
- Application role assignment review (unused app roles)
- Service principal privilege (number of service principals with admin roles)

**Medium Checks**:
- Lifecycle workflow configuration (guest invite → sponsor assignment)
- Auto-disable for stale identities (missing = governance gap)

**Audit Output**: JSON of PIM roles + eligibility status, access review schedule, workflow rules

---

## Cross-Project Dependencies

CTU touches and consolidates identity controls across 4 related projects. Understanding
these dependencies prevents remediation conflicts.

### Convention-Page-Build

**What CTU touches**:
- 5 domain-based dynamic groups in HTT (used for event site access)
- Cross-tenant auto-redemption settings (B2B guests from partner tenants)
- B2B guest provisioning workflow

**Overlap & Risk**:
- Convention groups are ephemeral (sunset post-event)
- CTU moves to persistent brand-level groups (Bishops-Brand-Users, etc.)
- Post-event, convention groups should be deprovisioned and replaced by CTU brand groups
- Risk: Overlapping temporary + permanent groups cause permission confusion

**Coordination Required**:
- After each convention, CTU remediates convention group dependencies
- Confirm with Tyler before sunsetting convention groups

---

### bi-support-agent

**What CTU touches**:
- TLL → HTT B2B sync configuration and health
- TLL-Franchisee-Dynamic group (mail distribution for TLL staff @thelashlounge.com)
- Fabric Free license assignment (to TLL synced identities in HTT)
- Custom attributes on TLL identities (salon_ids for Lash Dash RLS)

**Overlap & Risk**:
- TLL-Franchisee-Dynamic is a specific per-project group (not brand-level)
- CTU creates broader TLL-Brand-Users group for all TLL synced identities
- Overlapping groups cause ambiguity in role definition
- Risk: bi-support-agent script may not know which group to use for licensing

**Coordination Required**:
- Confirm with Tyler before consolidating TLL-Franchisee-Dynamic into TLL-Brand-Users
- Update bi-support-agent script to reference brand group (if consolidated)

---

### FAC-Cohort-Dev (Wiggum)

**What CTU touches**:
- Custom extension attributes: htt_role, htt_brand, fac_cohort_id, fac_is_rep, salon_ids
- Dynamic groups driven by these attributes (TLL-FAC-Cohort-1..5, TLL-FAC-Reps, TLL-FAC-AllOwners)
- Wiggum-FAC-Extensions service principal (manages group membership)
- SharePoint hub/spoke permissions (governed by dynamic groups)

**Overlap & Risk**:
- Wiggum creates TLL-specific cohort groups + corporate FAC groups
- CTU creates brand-level groups (TLL-Brand-Users + TLL-Corporate-FAC + partner groups)
- Both use same custom attributes — high dependency
- Risk: CTU and Wiggum dynamic rules compete for same attributes

**Coordination Required**:
- Wiggum attributes are **source of truth** — CTU reuses them, does not override
- CTU extends attribute schema to all brands (htt_role + htt_brand on BCC, FN, DCE users)
- Wiggum SharePoint groups remain; CTU brand groups are *additional* governance layer
- Before attribute updates, check Wiggum impact (run Wiggum validation)

---

### sharepointagent

**What CTU touches**:
- Role-based group architecture (replacing ad-hoc SharePoint permission assignments)
- 16/17 broken inheritance folders in HTT HQ SharePoint site
- 15+ unknown system accounts with unexplained permissions
- Consolidated permission matrix (who sees what, by role and brand)

**Overlap & Risk**:
- sharepointagent audit found permission chaos — no role-based groups
- CTU creates role-based brand + partner groups (e.g., Bishops-Brand-Users, FAC-Reps)
- sharepointagent remediation blocked waiting for CTU group architecture
- Risk: If CTU is delayed, sharepointagent can't complete permission redesign

**Coordination Required**:
- CTU brand groups are prerequisite for sharepointagent permissions redesign
- After CTU phase 3 (Policy Hardening), sharepointagent can proceed with re-permissioning
- Confirm group structure with Tyler before sharepointagent commits to SharePoint changes

---

## Service Principal Inventory

### Existing Service Principals (in use across projects)

| SP Name | Tenant(s) | Purpose | Permissions | Status |
|---------|-----------|---------|-------------|--------|
| `Wiggum-FAC-Extensions` | TLL | Manages dynamic group membership for FAC cohorts | Graph: Group.ReadWrite.All | Active |
| `Convention-Page-Build-Provisioner` | HTT | Creates/destroys convention site groups | Graph: Group.ReadWrite.All, Sites.FullControl.All | Active (seasonal) |
| `bi-support-agent-bot` | TLL, HTT | Syncs TLL identities, assigns Fabric Free licenses | Graph: User.ReadWrite.All, AppRoleAssignment.ReadWrite.All | Active |
| `sharepointagent-auditor` | HTT | Read-only SharePoint audit (permissions, items) | Graph: Sites.Read.All, User.Read.All | Active (read-only) |

### New Service Principal (CTU)

**Name**: `CTU-Governance-Engine` (create during Phase 1)

**Tenants**: HTT (hub), BCC, FN, TLL, DCE (all 5 tenants)

**Required Permissions** (per tenant):
- `Directory.Read.All` — read tenant config, users, groups, roles
- `Group.ReadWrite.All` — create/manage brand-level dynamic groups + assignment groups
- `Policy.ReadWrite.CrossTenantAccess` — read/write cross-tenant access policies
- `RoleManagement.ReadWrite.Directory` — read role assignments for privileged role audit
- `SecurityEvents.Read.All` — read audit log, sign-in logs, risk detections
- `CrossTenantUserProfileSharing.ReadWrite.All` — manage B2B sync configuration (hub tenant only)

**Authentication Method**:
- Certificate-based (provided by Tyler) + app-only token (no interactive login)
- Client ID + Cert Thumbprint stored in `.env` (in `.gitignore`)

**Responsibilities**:
- Read-only audit across all 7 domains
- Create brand security groups + partner assignment groups
- Apply cross-tenant access policy changes (deny-by-default + overrides)
- Trigger KQL alert queries (monitor signup)

---

## Remediation Phases

The 5-phase roadmap spans 16 weeks from initial discovery through sustained operations.

### Phase 1: Discovery (Weeks 1–3) — Read-Only Audit

**Deliverable**: Comprehensive CTU audit report (7 domains across 5 tenants)

**Activities**:
- Deploy CTU audit PowerShell modules to each tenant
- Run `Audit-CrossTenantSync`, `Audit-B2BCollaboration`, etc. (read-only)
- Consolidate findings into master JSON + CSV reports
- Identify critical, high, and medium findings per domain
- Calculate remediation priority (critical=P0, high=P1, medium=P2)

**Sign-Off Gate**: G1 — Tyler + Dustin review Phase 1 audit findings, approve remediation plan

**No changes to production in Phase 1**

---

### Phase 2: Quick Wins (Weeks 3–5) — Low-Risk, High-Impact Remediation

**Deliverable**: Remediation of 6 quick-win controls (no policy changes)

**Activities**:
1. **Guest invitation restriction** — lock to `adminsAndGuestInviters` (not "everyone")
2. **Guest user role** — set to Restricted Guest User across all tenants
3. **Email verified join** — disable in all tenants
4. **Teams consumer access** — disable (block personal Microsoft accounts)
5. **Teams trial tenant federation** — disable
6. **MFA Conditional Access (report-only mode)** — deploy CA policy targeting all guests (no enforcement yet)

**Testing**: WhatIf on each policy change (show what would change, ask for approval)

**Sign-Off Gate**: G2 — Tyler approves Phase 2 changes (demo WhatIf output, verify low risk)

**Side Effects**: Guests may not receive email invitations (they get invitation link instead); personal Microsoft account users cannot federate with Teams

---

### Phase 3: Policy Hardening (Weeks 5–10) — Default Deny + Per-Partner Overrides

**Deliverable**: Deny-by-default cross-tenant access policy + 4 partner override policies

**Pilot Approach**: Roll out to **Delta Crown first** (lowest risk — smallest partner, least integration)

**Activities**:

1. **HTT Hub Default Policy** (all tenants):
   - B2B Inbound: BLOCK (AllApplications, AllUsers)
   - Direct Connect Inbound: BLOCK (AllApplications, AllUsers)
   - B2B Outbound: Unrestricted (HTT → any tenant)

2. **Per-Partner Override Policies** (BCC, FN, TLL, DCE):
   - Create partner-specific allow policy overriding default deny
   - Scope: SharePoint Online + brand security group (e.g., `Bishops-Brand-Users`)
   - Auto-redeem: Enabled (both directions for full-trust partners, hub→spoke for limited-trust)
   - MFA Trust: Required
   - Identity Sync: Enabled with userType=Member (for BCC + TLL)

3. **Brand Security Groups** (create dynamic groups):
   - `Bishops-Brand-Users` — all BCC identities synced to HTT (dynamic: `htt_brand="bishops"`)
   - `Frenchies-Brand-Users` — all FN identities synced to HTT (dynamic: `htt_brand="frenchies"`)
   - `TLL-Brand-Users` — all TLL identities synced to HTT (dynamic: `htt_brand="tll"`)
   - `DeltaCrown-Brand-Users` — all DCE identities synced to HTT (dynamic: `htt_brand="deltacrown"`)
   - Each group mail-enabled for distribution purposes

4. **B2B Sync Configuration Fix** (TLL + FN + DCE):
   - Ensure identity sync rules map to userType="Member" (not Guest)
   - Confirm sync job health + no provisioning errors
   - Test cross-tenant access (redeem + sign-in)

5. **Conditional Access Enforcement** (from report-only → enforce):
   - MFA for all external users (all cloud apps)
   - Legacy auth block for guests
   - Sign-in frequency 4 hours for guests
   - High-risk user flow enforcement

6. **MTO Membership** (for BCC, FN, TLL, DCE):
   - Initiate partner tenant joins to HTT Multi-Tenant Organization
   - Requires partner consent (separate process)

**WhatIf & Testing**:
- Pilot on Delta Crown first (show impact before broader rollout)
- Test guest redeem + sign-in on pilot (confirm no breakage)
- Confirm B2B apps still accessible (SharePoint, Teams, etc.)

**Sign-Off Gate**: G3 — Tyler approves per-partner override configuration + pilot results

**Side Effects**: Guests from non-approved tenants will be blocked; existing guests grandfathered in (access reviews in Phase 4)

---

### Phase 4: Governance (Weeks 10–16) — Access Reviews + Lifecycle Workflows

**Deliverable**: Quarterly access reviews + auto-disable stale guests

**Activities**:

1. **Access Reviews** (all external identities):
   - Create quarterly review schedule (every 90 days)
   - Scope: All guests in HTT tenant
   - Auto-apply deny (if reviewer denies, access removed immediately)
   - Notification to owner 2 weeks before review
   - Post-review report (who was removed, why)

2. **Guest Lifecycle Workflows** (Entra ID Lifecycle Workflows):
   - **New guest** → auto-assign sponsor (approver for questions)
   - **No sign-in >90d** → send email warning (day 90), auto-disable (day 100)
   - **Stale guest removal** → auto-delete after 120 days of no sign-in (configurable per cohort)

3. **PIM Configuration**:
   - All Global Admins: Change from permanent to eligible (require approval + MFA to activate)
   - All Tier-1 roles (e.g., Intune Admin, Exchange Admin): Eligible with approval
   - Eligible activation: 2-hour duration (auto-expire)
   - Approval chain: Tyler → Global Admin (dual approval)

4. **Entitlement Packages** (Entra ID Governance):
   - Package 1: "SharePoint Guest" (SharePoint Online access + 90d lifecycle)
   - Package 2: "Teams Guest" (Teams Online access + 90d lifecycle)
   - Package 3: "Partner Full Access" (all apps + sync to Member + 120d lifecycle)
   - Each package maps to a brand security group for auto-assignment

**Testing**: Dry-run on 5 pilot guests (test auto-disable, sponsor notification, etc.)

**Sign-Off Gate**: G5 — Tyler + Kristin (leadership) approve governance workflow deployment

**Side Effects**: Stale guests will be disabled (may break dormant integrations); manual approvals required for PIM elevation (may delay urgent admin access)

---

### Phase 5: Monitoring (Weeks 16+ ongoing) — KQL Alerts + Recurring Audit

**Deliverable**: Azure Monitor dashboard + automated alert rules

**Activities**:

1. **KQL Alert Queries** (deployed to Log Analytics):
   - **Stale Guest Alert**: Alert if guest has >90d no sign-in (check weekly)
   - **Privileged Guest Alert**: Alert if guest added to admin role (immediate)
   - **B2B Sync Failure Alert**: Alert if sync job quarantined (immediate)
   - **Unexpected Cross-Tenant Access Alert**: Alert on sign-in from unapproved tenant (check daily)
   - **MFA Bypass Attempt Alert**: Alert if external user skips MFA challenge (check hourly)
   - **Teams Federation Breach Alert**: Alert if non-approved tenant federation detected (immediate)
   - **High-Risk User Alert**: Alert if external user flagged as high-risk (check hourly)

2. **Automated Response Actions**:
   - Stale guest >120d: Auto-disable + email Tyler (manual review)
   - Privileged guest: Immediate email to Tyler + disable (ask forgive)
   - Sync failure: Slack alert to #it-ops-alerts (page on-call)
   - Unexpected cross-tenant: Email investigation team (check for breach)

3. **Recurring Audit Schedule**:
   - Weekly: Guest inventory + stale detection
   - Monthly: B2B sync health + CA coverage gaps
   - Quarterly: Full 7-domain audit (compare to baseline)
   - Annual: Partner policy review + MTO enrollment status

4. **Reporting**:
   - Weekly metrics dashboard (stale guests, sync jobs, CA gaps)
   - Monthly executive summary (findings + remediation actions)
   - Quarterly deep-dive (full audit findings + trend analysis)

**Operationalization**:
- Assign alert ownership (Tyler for policy changes, Dustin for daily monitoring)
- Create runbook for each alert (escalation, remediation, communication)
- Monthly review of alert false-positive rate

---

## Stakeholder Sign-Off Gates

| Gate | Deliverable | Approver | Timing |
|------|-------------|----------|--------|
| **G1** | Phase 1 audit report (7 domains, 5 tenants, findings + severity) | Tyler + Dustin | End of Week 3 |
| **G2** | Phase 2 quick-win changes (guest restrictions, MFA CA draft) | Tyler | End of Week 5 |
| **G3** | Phase 3 deny-by-default policy + pilot results (Delta Crown) | Tyler | End of Week 10 |
| **G4** | Phase 3 expansion (roll out to BCC, FN, TLL after pilot) | Tyler | Mid Week 10 |
| **G5** | Phase 4 governance workflows (access reviews, PIM, lifecycle) | Tyler + Kristin (leadership) | End of Week 16 |
| **G6** | Phase 5 monitoring dashboard + alert rules (ongoing) | Tyler + Dustin | Ongoing (monthly review) |

---

## Code Standards

- **Language**: PowerShell 7+ (primary); Python 3.10+ for data analysis (audit consolidation, trend reports)
- **Structure**: Modular `.psm1` files in `modules/` directory (one domain per module)
- **No hardcoded secrets**: All credentials via environment variables or `.env` file (in `.gitignore`)
- **Idempotent remediation**: Every script supports `-WhatIf` (show intended changes without execution)
- **Error handling**: Per-tenant failures logged to CSV; never abort full audit on single tenant failure
- **Audit is read-only**: All audit scripts use `-ReadOnly` flag (explicit Graph permission check)
- **Output formats**: JSON (structured findings), CSV (tabular data), Markdown (executive reports)
- **Testing**: Each phase has validation script comparing actual state to expected baseline
- **Documentation**: Every script has comment-based help (Get-Help script.ps1 -Full)

---

## Files in This Repository

```
Cross-Tenant-Utility/
├── AGENT.md                     ← You are here
├── baseline.json                ← Target security posture (7 domains, all controls)
├── ctu-roadmap.md               ← Full phased implementation timeline (16 weeks)
├── audit-findings-phase-1.json  ← Phase 1 audit output (post-Phase-1)
│
├── modules/                     ← PowerShell .psm1 modules (8 total)
│   ├── CTU.CrossTenantSync.psm1
│   ├── CTU.B2BCollaboration.psm1
│   ├── CTU.B2BDirectConnect.psm1
│   ├── CTU.GuestInventory.psm1
│   ├── CTU.ConditionalAccess.psm1
│   ├── CTU.TeamsFederation.psm1
│   ├── CTU.IdentityGovernance.psm1
│   └── CTU.Remediation.psm1
│
├── scripts/                     ← Main entry points
│   ├── 01-audit-phase-1.ps1     ← Run all 7 domain audits (read-only)
│   ├── 02-remediate-quickwins.ps1
│   ├── 03-remediate-policy-hardening.ps1
│   ├── 04-deploy-governance.ps1
│   ├── 05-deploy-monitoring.ps1
│   └── validate-baseline.ps1    ← Compare actual state to baseline.json
│
├── data/                        ← Input/output data
│   ├── tenant-config.json       ← Tenant IDs, domains, admin accounts
│   ├── partner-overrides.json   ← Per-partner B2B policy config
│   ├── brand-groups.json        ← Brand security group definitions
│   ├── kql-queries/             ← Azure Monitor KQL alert queries
│   │   ├── stale-guest-alert.kql
│   │   ├── privileged-guest-alert.kql
│   │   ├── sync-failure-alert.kql
│   │   ├── unexpected-crosstenancy-alert.kql
│   │   ├── mfa-bypass-alert.kql
│   │   ├── teams-federation-breach-alert.kql
│   │   └── high-risk-user-alert.kql
│   └── mappings/                ← Supporting mappings
│       ├── tenant-to-admin.json
│       └── brand-to-securitygroup.json
│
├── outputs/                     ← Reports (generated during execution)
│   ├── phase-1-audit-report.json
│   ├── phase-1-audit-report.md  (executive summary)
│   ├── phase-2-whatif-report.csv
│   ├── phase-3-pilot-delta-crown-results.json
│   ├── phase-4-governance-dry-run.csv
│   └── phase-5-monitoring-dashboard-config.json
│
├── tests/                       ← Validation scripts per phase
│   ├── test-phase-1-audit.ps1
│   ├── test-phase-2-quickwins.ps1
│   ├── test-phase-3-policy-hardening.ps1
│   ├── test-phase-4-governance.ps1
│   └── test-phase-5-monitoring.ps1
│
├── docs/                        ← Supplementary documentation
│   ├── architecture-overview.md
│   ├── cross-project-dependencies.md
│   ├── service-principal-setup.md
│   ├── tenant-onboarding-checklist.md (per-tenant setup for new tenants)
│   └── runbooks/                ← Operational runbooks
│       ├── stale-guest-response.md
│       ├── sync-failure-investigation.md
│       ├── unplanned-cross-tenant-access.md
│       └── pim-elevation-emergency.md
│
├── examples/                    ← Example usage
│   ├── run-full-audit.sh
│   ├── run-whatif-phase2.sh
│   └── run-remediate-with-logging.sh
│
├── .env.example                 ← Template for environment variables
├── .gitignore                   ← Excludes .env, outputs/, logs/
└── README.md                    ← Quick start guide

# Environment Variables (.env file)

CTU_CLIENT_ID="<service principal app ID>"
CTU_CERT_THUMBPRINT="<cert thumbprint>"
CTU_HTT_TENANT_ID="0c0e35dc-188a-4eb3-b8ba-61752154b407"
CTU_BCC_TENANT_ID="b5380912-79ec-452d-a6ca-6d897b19b294"
CTU_FN_TENANT_ID="98723287-044b-4bbb-9294-19857d4128a0"
CTU_TLL_TENANT_ID="3c7d2bf3-b597-4766-b5cb-2b489c2904d6"
CTU_DCE_TENANT_ID="ce62e17d-2feb-4e67-a115-8ea4af68da30"
CTU_PRIMARY_ADMIN="tyler.granlund-admin@httbrands.com"
CTU_SECONDARY_ADMIN="dustin.boyd-admin@httbrands.com"
CTU_LOG_LEVEL="Info"  # Info, Warning, Error
CTU_DRY_RUN="true"    # true for WhatIf mode, false for live
```

---

## Tools & Permissions Required

The agent will need the following available in the environment:

```powershell
# Required CLIs
pwsh              # PowerShell 7+
az                # Azure CLI (authenticated to all 5 tenants)
python3           # Python 3.10+ (for data analysis)

# Required PowerShell Modules
Install-Module -Name "Microsoft.Graph" -Scope AllUsers
Install-Module -Name "ExchangeOnlineManagement" -Scope AllUsers
Install-Module -Name "AzureAD" -Scope AllUsers (legacy, for some policies)
Install-Module -Name "Microsoft.Graph.Authentication" -Scope AllUsers
Install-Module -Name "PnP.PowerShell" -Scope AllUsers (for SharePoint)

# Required Python Packages
pip install pandas openpyxl tabulate requests --break-system-packages

# Required authentication
az login  # Interactive, will prompt for all 5 tenants
# CTU scripts use app-only token via $CTU_CLIENT_ID + $CTU_CERT_THUMBPRINT
```

**Microsoft Graph API Permissions** (on CTU Service Principal):
- `Directory.Read.All` — read tenant config, users, groups, roles
- `Group.ReadWrite.All` — create/manage brand dynamic groups
- `Policy.ReadWrite.CrossTenantAccess` — read/write B2B policies
- `RoleManagement.ReadWrite.Directory` — read/write role assignments + PIM
- `SecurityEvents.Read.All` — audit log, sign-in logs, risk detections
- `CrossTenantUserProfileSharing.ReadWrite.All` — B2B sync config (HTT hub only)
- `ConditionalAccessPolicy.ReadWrite.All` — read/write Conditional Access policies
- `IdentityGovernance.ReadWrite.All` — access reviews, lifecycle workflows

**Exchange Online Permissions**:
- `Organization.ReadWrite.All` — guest restrictions, email settings
- `Team.ReadWrite.All` — Teams federation settings

> Tyler will provision the CTU Service Principal and provide `CLIENT_ID` + `CERT_THUMBPRINT`
> as environment variables before Phase 1 begins.

---

## Related Documentation

- **ctu-roadmap.md** — Detailed week-by-week implementation timeline
- **baseline.json** — Complete target security posture (all 7 domains, all controls)
- **Convention-Page-Build** — Dynamic groups for event sites (post-event sunset/consolidation)
- **bi-support-agent** — TLL B2B sync + Fabric licensing (attribute + group consolidation)
- **FAC-Cohort-Dev (Wiggum)** — TLL custom attributes + dynamic groups (source of truth for attributes)
- **sharepointagent** — SharePoint permission redesign (blocked waiting for CTU brand groups)

---

**Last Updated**: 2026-04-09  
**Audience**: Agentic coding assistant + Tyler Granlund / Dustin Boyd  
**Revision**: 1.0 (Initial baseline context)
