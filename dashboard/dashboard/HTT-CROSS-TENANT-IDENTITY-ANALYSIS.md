# HTT Brands — Cross-Tenant Identity & Access Architecture Analysis

> **Version:** 1.0  
> **Date:** 2026-04-09  
> **Author:** Tyler Granlund, IT Director — HTT Brands  
> **Classification:** Internal — IT Leadership  
> **Scope:** All 5 tenants, all cross-tenant implementations, all identity patterns

---

## Executive Summary

HTT Brands operates a multi-tenant Microsoft 365 environment spanning five brands and 200+ franchise locations. Over the past 18 months, the IT team has built four distinct cross-tenant implementations — each solving a real business need, each making pragmatic tradeoffs given the constraints at the time. This document is the first unified analysis of the entire cross-tenant identity landscape: what's been built, where the gaps are, what's redundant, and how to consolidate it all into a coherent, secure, and scalable identity architecture.

The analysis covers five active project areas: the Cross-Tenant Utility audit toolkit (CTU), the Homecoming 2026 convention site, the Power BI/Fabric franchise access pipeline, the FAC Cohort dynamic group infrastructure, and the HTT HQ SharePoint remediation effort. Together, these projects touch every major identity primitive in the Microsoft ecosystem — B2B collaboration, cross-tenant sync, dynamic groups, custom Entra ID attributes, MTO membership, conditional access, and SharePoint permissions.

**The core finding:** The individual implementations are well-built, but the default cross-tenant posture is too permissive, the identity patterns diverge unnecessarily across projects, and there's no unified attribute strategy that spans all brands. Fixing this isn't just a security exercise — it directly improves the user experience for 200+ franchise owners, simplifies ongoing administration for a lean IT team, and creates the foundation for role-based, brand-aware, location-scoped access across every platform in the portfolio.

---

## Table of Contents

1. [Tenant Landscape](#1-tenant-landscape)
2. [Implementation Inventory](#2-implementation-inventory)
3. [Cross-Tenant Configuration — Current State](#3-cross-tenant-configuration--current-state)
4. [Identity Pattern Divergence Analysis](#4-identity-pattern-divergence-analysis)
5. [Security Gap Analysis](#5-security-gap-analysis)
6. [Redundancy & Consolidation Opportunities](#6-redundancy--consolidation-opportunities)
7. [The Case for Unified Identity](#7-the-case-for-unified-identity)
8. [Unified Identity Architecture — Target State](#8-unified-identity-architecture--target-state)
9. [Prioritized Roadmap](#9-prioritized-roadmap)
10. [Appendix A: Service Principal Inventory](#appendix-a-service-principal-inventory)
11. [Appendix B: Dynamic Group Inventory](#appendix-b-dynamic-group-inventory)
12. [Appendix C: Cross-Tenant Policy Detail](#appendix-c-cross-tenant-policy-detail)

---

## 1. Tenant Landscape

HTT Brands operates a hub-and-spoke tenant model with one anchor tenant and four brand tenants.

| Role | Brand | Tenant ID | Primary Domain | Locations | CRM | MTO Status |
|------|-------|-----------|---------------|-----------|-----|------------|
| **Hub** | HTT Brands (Corporate) | `0c0e35dc-188a-4eb3-b8ba-61752154b407` | httbrands.com | HQ | — | Owner |
| Spoke | Bishops Cuts/Color | `b5380912-79ec-452d-a6ca-6d897b19b294` | bishops.co | ~40 | Zenoti | Member |
| Spoke | Frenchies Modern Nail Care | `98723287-044b-4bbb-9294-19857d4128a0` | frenchiesnails.com | ~20 | Zenoti | **Not a member** |
| Spoke | The Lash Lounge | `3c7d2bf3-b597-4766-b5cb-2b489c2904d6` | thelashlounge.com | ~140 | MindBody | **Not a member** |
| Spoke | Delta Crown Enterprises | `ce62e17d-2feb-4e67-a115-8ea4af68da30` | deltacrown.com | Pre-launch | — | **Not a member** |

**Key observation:** Only Bishops is a full MTO member. TLL — the largest brand by far — is not in the MTO, which means cross-tenant sync and seamless identity features available to Bishops aren't available to TLL or the other brands. This creates an asymmetric experience.

---

## 2. Implementation Inventory

Five active projects touch cross-tenant identity. Here's what each one does and the patterns it uses.

### 2.1 Cross-Tenant Utility (CTU)

**Purpose:** Audit toolkit for cross-tenant identity governance across all 5 tenants.

**Status:** Toolkit built and tested; Phase 1 discovery audit not yet executed.

**What it provides:** 7-domain audit (B2B Collab, Direct Connect, Guest Inventory, Conditional Access, Cross-Tenant Sync, Teams Federation, Identity Governance), remediation scripts (deny-by-default, userType fix, Teams allowlist), monitoring KQL queries, and a 5-phase remediation roadmap.

**Key baseline target:** Deny-by-default cross-tenant policy with explicit per-partner overrides.

### 2.2 Homecoming 2026 Convention Site

**Purpose:** Cross-brand SharePoint Communication Site for ~327 employees across all 5 tenants.

**Status:** Production live. 327 users verified. Event is April 26–28, 2026.

**Identity patterns used:** B2B guest provisioning via JotForm → GitHub Actions pipeline, 5 domain-based dynamic security groups in HTT tenant, cross-tenant auto-redemption, MFA trust, SharePoint claim-based permission model.

**Key architecture:** Hub-and-spoke where HTT hosts the site, brand users arrive as B2B guests, dynamic groups auto-sort them by email domain, SP Visitors group grants Read access.

### 2.3 Power BI / Fabric Franchise Access (bi-support-agent)

**Purpose:** Give ~210 TLL franchise owners access to Power BI reports in HTT's Fabric workspace.

**Status:** Production live. Automated onboarding pipeline operational.

**Identity patterns used:** TLL-side mail-enabled security group → cross-tenant B2B sync (15–30 min) → domain-based dynamic group in HTT (`TLL-Franchisee-Dynamic`, mail contains `@thelashlounge.com`) → automatic Fabric Free license → RLS via SQL `pro.PowerBIAccess` table.

**Key architecture:** TLL group membership triggers B2B sync to HTT; dynamic group in HTT catches synced users by email domain; Fabric workspace uses group for access gating.

### 2.4 FAC Cohort Infrastructure (Wiggum / FAC-Cohort-Dev)

**Purpose:** Dynamic group infrastructure for TLL Franchisee Advisory Council — 5 cohort groups, reps group, all-owners group, corporate group.

**Status:** Phases 0–4 complete. 8 dynamic groups live with 99 cohort members. SharePoint hub-and-spoke deferred.

**Identity patterns used:** Custom Entra ID extension attributes (`htt_role`, `htt_brand`, `fac_cohort_id`, `fac_is_rep`, `salon_ids`) on TLL tenant, attribute-based dynamic group membership rules, dedicated service principal (`Wiggum-FAC-Extensions`).

**Key architecture:** Custom attributes on user accounts drive dynamic group membership. This is the only project using attribute-based (not domain-based) dynamic groups — and the only one with custom extension attributes.

### 2.5 HTT HQ SharePoint Remediation (sharepointagent)

**Purpose:** Audit and fix the HTT Headquarters SharePoint site's document library permissions.

**Status:** Audit complete — 16/17 folders have broken inheritance, 15+ unknown system accounts, no documented permission strategy. Remediation tools built but bulk automation pending.

**Identity patterns used:** Service principal for Graph/REST API access, per-folder permission analysis, brand-aware page management system.

**Key finding:** The HQ site's permission mess is a symptom of the same problem — no unified identity model means ad-hoc permissions accumulate over time.

---

## 3. Cross-Tenant Configuration — Current State

### 3.1 Default Cross-Tenant Access Policy (HTT Hub)

This is the policy that applies to **every tenant in the world** that isn't explicitly listed as a partner.

| Setting | Current Value | CTU Baseline Target | Gap? |
|---------|--------------|-------------------|------|
| B2B Collab Inbound | **All Apps / All Users** | **Blocked** | **CRITICAL** |
| B2B Direct Connect Inbound | **All Apps / All Users** | **Blocked** | **CRITICAL** |
| Auto-Redeem Inbound | `false` | `false` | ✅ OK |
| MFA Trust | `true` | Per-partner only | ⚠️ Minor |
| Device Compliance Trust | `true` | Per-partner only | ⚠️ Minor |

**Impact:** Any Microsoft 365 tenant in the world can currently initiate B2B collaboration with HTT Brands. This means any external user could be invited as a guest (by anyone with invite permissions) without any partner-level policy check. The CTU toolkit was built specifically to remediate this.

### 3.2 Per-Partner Policies (Brand Tenants)

| Setting | Bishops | Frenchies | Lash Lounge | Delta Crown |
|---------|---------|-----------|-------------|-------------|
| B2B Collab Inbound | **Scoped** (SP Online + SG) | **Scoped** (SP Online + SG) | **All Apps / All Users** | **Scoped** (SP Online + SG) |
| B2B Direct Connect | Open (via default) | Null (inherits default) | Open | Null (inherits default) |
| Auto-Redeem | ✅ Both directions | ✅ Hub→Spoke only | ✅ Both directions | ✅ Hub→Spoke only |
| MFA Trust | ✅ | ✅ | ✅ | ✅ |
| Identity Sync | ✅ Enabled | ❌ Not configured | ✅ Enabled | ❌ Not configured |
| MTO Member | ✅ Yes | ❌ No | ❌ No | ❌ No |

**Key inconsistencies:**

- **TLL is wide open.** Bishops, Frenchies, and Delta Crown all have scoped B2B Collab (limited to SharePoint Online + a specific security group). TLL — your largest brand with ~218 guest accounts in HTT — has **All Apps / All Users**. This is the most permissive partner policy and it's on the biggest spoke.

- **Spoke-side auto-redemption incomplete.** Frenchies and Delta Crown haven't configured their side of auto-redemption, meaning users from those brands may still see consent prompts.

- **MTO is lopsided.** Bishops gets full MTO benefits (seamless identity, People card sync, cross-tenant search) while TLL — which arguably needs it more given its 140 locations and complex franchise identity needs — doesn't.

- **Identity sync is inconsistent.** Enabled for Bishops and TLL but not for Frenchies or Delta Crown. Yet the BI Support Agent uses a separate sync mechanism for TLL that bypasses the formal cross-tenant sync entirely.

---

## 4. Identity Pattern Divergence Analysis

Four different projects have independently solved the "get users from one tenant into another" problem using four different approaches. This table maps the divergence.

| Pattern | Convention (Homecoming) | BI / Fabric Access | FAC Cohorts (Wiggum) | CTU Baseline |
|---------|------------------------|-------------------|---------------------|-------------|
| **How users arrive** | B2B invite via script | B2B sync via group membership | N/A (TLL-only) | Governed by partner policy |
| **How users are grouped** | Domain-based dynamic SGs | Domain-based dynamic SG | Attribute-based dynamic SGs | N/A |
| **Dynamic group attribute** | `user.mail -contains @domain` | `mail -contains @thelashlounge.com` | `extension_...fac_cohort_id -eq "fac-cohort-X"` | N/A |
| **Tenant where groups live** | HTT (hub) | HTT (hub) | TLL (spoke) | Both |
| **Service principal** | Homecoming 2026 Landing Page | HTT BI Support Agent | Wiggum-FAC-Extensions | CTU audit app |
| **Custom attributes** | None | None | 5 extension attributes | N/A |
| **Licensing** | None needed | Fabric Free (auto) | None needed | N/A |
| **SharePoint model** | Claim-based via SP Visitors | N/A | Planned hub-and-spoke | N/A |
| **Automation** | GitHub Actions (daily sync) | GitHub Actions (on-demand) | Python scripts (manual) | PowerShell (manual) |

**What this tells us:**

The domain-based dynamic group pattern (Convention + BI Support) works well for "give all users from brand X access to resource Y." But it can't distinguish roles within a brand — every `@thelashlounge.com` user gets the same access. The attribute-based pattern (FAC) solves this by tagging users with role, brand, and cohort — but it only exists in TLL today.

The bigger identity initiative Tyler described needs to bring these together: domain-based groups for broad brand-level gating, attribute-based groups for role- and location-scoped access within brands.

---

## 5. Security Gap Analysis

### 5.1 Critical Gaps

**GAP-1: Default policy allows inbound B2B from any tenant worldwide**

- **Severity:** Critical
- **Location:** HTT hub tenant default cross-tenant access policy
- **Current:** B2B Collab + Direct Connect Inbound = All Apps / All Users
- **Target:** Blocked (deny-by-default), with explicit overrides for BCC, FN, TLL, DCE
- **Remediation:** `Cross-Tenant-Utility/scripts/remediation/Set-DenyByDefault.ps1`
- **Risk:** Any external tenant can invite/be invited for collaboration. Combined with the current guest invitation setting ("everyone"), this creates an uncontrolled guest account surface.

**GAP-2: TLL partner policy is unscoped**

- **Severity:** High
- **Location:** HTT hub tenant → TLL partner policy
- **Current:** B2B Collab Inbound = All Apps / All Users
- **Target:** Scoped to SharePoint Online + specific security groups (matching BCC/FN/DCE pattern)
- **Risk:** TLL B2B guests have implicit access to all applications in HTT tenant, not just SharePoint and Fabric.

**GAP-3: No Conditional Access enforcement for external users**

- **Severity:** High
- **Location:** HTT hub tenant CA policies
- **Current:** "B2B External Franchisee Access" policy exists but is **report-only**
- **Target:** Enforce MFA for all B2B guests via CA policy (not just relying on per-partner MFA trust)
- **Risk:** If a partner tenant has weak MFA enforcement, the trust-based model inherits that weakness.

### 5.2 Medium Gaps

**GAP-4: Spoke-side auto-redemption incomplete for Frenchies and Delta Crown**

- **Severity:** Medium
- **Location:** Frenchies (`98723287-...`) and Delta Crown (`ce62e17d-...`) tenant policies
- **Current:** Auto-redemption configured hub→spoke but not spoke→hub
- **Impact:** Users from these brands may see consent prompts, degrading the seamless experience
- **Remediation:** Admin request templates already created in Convention-Page-Build docs

**GAP-5: Guest account lifecycle not governed**

- **Severity:** Medium
- **Location:** All tenants
- **Current:** No access reviews, no stale guest detection active (CTU has the tooling, not yet deployed)
- **Target:** Quarterly access reviews, 90-day stale guest threshold
- **Remediation:** CTU Phase 4 (Identity Governance)

**GAP-6: 15+ unknown system accounts in HTT HQ SharePoint**

- **Severity:** Medium
- **Location:** HTT HQ SharePoint Document Library
- **Current:** Unidentified accounts with read/write/owner access across folders
- **Remediation:** sharepointagent audit + manual review

**GAP-7: UserType mapping issue for synced users**

- **Severity:** Medium
- **Location:** TLL → HTT cross-tenant sync
- **Current:** At least one user (Noelle Peter) synced as Guest instead of Member
- **Impact:** Guest userType limits access to some M365 features and shows as "External" in directory
- **Remediation:** `Cross-Tenant-Utility/scripts/remediation/Fix-SyncUserTypeMapping.ps1`

### 5.3 Low Gaps

**GAP-8: Teams federation is likely open**

- **Severity:** Low
- **Current:** Suspected open federation (CTU audit will confirm)
- **Target:** Allowlist mode — only HTT brand domains

**GAP-9: No device compliance trust enforced per-partner**

- **Severity:** Low
- **Current:** `false` for all partners (but `true` in default policy — inconsistent)
- **Impact:** Minimal unless Intune MDM is deployed across brand tenants

---

## 6. Redundancy & Consolidation Opportunities

### 6.1 Service Principal Sprawl

Four separate app registrations have been created across three projects:

| App Registration | Tenant | Client ID | Purpose | Permissions |
|-----------------|--------|-----------|---------|-------------|
| Homecoming 2026 Landing Page | HTT | (Convention app) | B2B invites, SP provisioning | Sites, Groups, User |
| HTT BI Support Agent | HTT | `017adf38-cc8b-4c60-afdf-c8b9d07034ee` | Fabric refresh, SQL, VM ops | Contributor (sub), PBI API |
| Wiggum-FAC-Extensions | TLL | `037c2451-af8b-4461-82cc-afaa666a56b7` | Custom attributes, groups | Directory.RW, Group.RW, User.RW |
| SharePoint Agent | HTT | `e4846a2a-c399-4d3a-bcb5-c66ac214ec23` | SP audit, page management | Sites.FullControl |

**Recommendation:** These serve legitimately different purposes across different tenants, so full consolidation isn't appropriate. However, when the unified identity initiative matures, consider:

- Merging the Convention and SharePoint Agent apps into a single "HTT Identity & SharePoint Automation" SP in the HTT tenant
- Keeping the BI Support Agent separate (it has Fabric/SQL/VM scope that shouldn't bleed into identity ops)
- Expanding the Wiggum app (or creating an equivalent) in other brand tenants if custom attributes go multi-tenant

### 6.2 Dynamic Group Pattern Duplication

Two domain-based dynamic groups serve overlapping populations:

| Group | Tenant | Rule | Members | Purpose |
|-------|--------|------|---------|---------|
| `SG-Homecoming2026-Visitors-LashLounge-Dynamic` | HTT | `mail -contains @thelashlounge.com` | 218 | Convention site access |
| `TLL-Franchisee-Dynamic` | HTT | `mail -contains @thelashlounge.com` | ~210 | Fabric workspace access |

These are nearly identical groups in the same tenant with the same rule. The ~8 member difference is likely timing/sync lag.

**Recommendation:** After Homecoming 2026 concludes, sunset the convention-specific groups and establish **persistent brand-level dynamic groups** (one per brand) that can be reused across all cross-tenant access scenarios — convention sites, Fabric workspaces, SharePoint sites, Teams, etc. Name them something enduring: `SG-Brand-TLL-Dynamic`, `SG-Brand-BCC-Dynamic`, etc.

### 6.3 Two Separate Cross-Tenant Sync Mechanisms for TLL

TLL users reach the HTT tenant via two different paths:

- **Path A (Formal):** Cross-tenant identity sync (`isSyncAllowed: true` in partner policy) — this is the MTO/infrastructure-level sync
- **Path B (BI-specific):** TLL PBI Franchise Access group → B2B sync → `TLL-Franchisee-Dynamic` group

These overlap but aren't identical. Path A syncs all users covered by the sync scope. Path B syncs only users added to a specific group. The BI Support Agent was built before the formal sync was configured, and both now coexist.

**Recommendation:** Audit whether Path A (formal sync) now covers the same population as Path B. If so, the BI-specific group sync is redundant for getting users into HTT — though the `TLL-Franchisee-Dynamic` group and Fabric licensing chain would still be needed.

---

## 7. The Case for Unified Identity

### 7.1 Why This Matters Beyond Security

The analysis above focuses on gaps and redundancies, but the strategic value of unified cross-tenant identity goes far beyond closing security holes. For a multi-brand franchise portfolio, identity is the foundational layer that everything else builds on.

**User Experience:** Today, a TLL franchise owner who needs Power BI access, FAC collaboration, convention site access, and eventually brand-specific SharePoint content is touched by four separate identity pipelines. Each one works, but none of them know about each other. A unified identity model means one set of attributes on a user's account drives access everywhere — no separate onboarding workflows per system, no "wait 30 minutes for sync" for each service independently.

**Administrative Efficiency:** Tyler's team is small. Every cross-tenant implementation that requires its own scripts, its own service principal, its own monitoring, and its own troubleshooting runbook is a multiplier on operational load. Consolidating to shared patterns — persistent brand groups, consistent attribute schemas, common automation — reduces that multiplier.

**Franchise Lifecycle Management:** Franchise ownership changes constantly. Owners sell locations, buy new ones, join advisory councils, rotate off committees. Today, each of those changes requires touching multiple systems. With unified attributes (role, brand, locations, cohort), a single attribute update on a user's account can cascade through dynamic groups to update access across Power BI, SharePoint, Teams, and any future platform.

**Multi-Brand Scalability:** Delta Crown is pre-launch. What happens when it grows to 50 locations? What about the next acquisition? A unified model means onboarding a new brand is a configuration exercise (add tenant to MTO, create partner policy, deploy brand group, extend attribute schema) rather than a greenfield engineering effort.

### 7.2 The Attribute-First Model

The FAC Cohort project (Wiggum) proved that custom Entra ID extension attributes work at scale for driving dynamic group membership. The five attributes created in TLL (`htt_role`, `htt_brand`, `fac_cohort_id`, `fac_is_rep`, `salon_ids`) are the seed of a broader attribute strategy.

**What exists today (TLL only):**

| Attribute | Values | Drives |
|-----------|--------|--------|
| `htt_role` | `franchisee`, `corporate` | FAC All Owners group, FAC Corporate group |
| `htt_brand` | `tll` | Brand-level group membership |
| `fac_cohort_id` | `fac-cohort-1` through `5` | Cohort-specific groups |
| `fac_is_rep` | `true` / `false` | FAC Reps group |
| `salon_ids` | CSV of MindBody IDs | Future: RLS, location-scoped access |

**What the unified model adds (all tenants):**

| Attribute | Scope | Values | Drives |
|-----------|-------|--------|--------|
| `htt_role` | All tenants | `franchisee`, `corporate`, `field_support`, `vendor` | Role-based access across all platforms |
| `htt_brand` | All tenants | `tll`, `bishops`, `frenchies`, `deltacrown`, `htt` | Brand-level group membership and content targeting |
| `htt_region` | Franchisee tenants | `northeast`, `central`, `southeast`, `texas`, `west` | Regional reporting, location-scoped access |
| `htt_location_ids` | Franchisee tenants | CSV of CRM IDs (MindBody for TLL, Zenoti for BCC/FN) | RLS, location-scoped dashboards |
| `htt_access_tier` | All tenants | `standard`, `advisory`, `leadership`, `admin` | Graduated access to sensitive resources |
| `fac_cohort_id` | TLL only | `fac-cohort-1` through `5` | FAC-specific (keep as-is) |
| `fac_is_rep` | TLL only | `true` / `false` | FAC-specific (keep as-is) |

**This enables a new class of dynamic groups:**

| Group Pattern | Rule Example | Use Case |
|--------------|-------------|----------|
| All TLL Franchisees | `htt_brand -eq "tll" AND htt_role -eq "franchisee"` | Brand-wide comms, SharePoint access |
| All Corporate across brands | `htt_role -eq "corporate"` | Corporate dashboards, admin tools |
| Southeast Region TLL | `htt_brand -eq "tll" AND htt_region -eq "southeast"` | Regional reporting, local event comms |
| Advisory-tier access | `htt_access_tier -eq "advisory"` | FAC, vendor advisory boards |
| All franchise owners (cross-brand) | `htt_role -eq "franchisee"` | Convention access, portfolio-wide comms |

---

## 8. Unified Identity Architecture — Target State

### 8.1 Cross-Tenant Policy Model

```
DEFAULT POLICY:
  Inbound B2B Collab:      BLOCKED
  Inbound Direct Connect:  BLOCKED
  Outbound:                BLOCKED
  Auto-Redeem:             false
  MFA Trust:               false

PER-PARTNER OVERRIDES (BCC, FN, TLL, DCE):
  Inbound B2B Collab:      Scoped → SharePoint Online + brand-specific SG
  Inbound Direct Connect:  Scoped → Teams (shared channels only)
  Outbound B2B Collab:     Scoped → SharePoint Online
  Auto-Redeem:             true (both directions)
  MFA Trust:               true
  Identity Sync:           true (all partners, not just BCC/TLL)
  userType Mapping:        Member (not Guest)
```

### 8.2 Group Architecture

```
PERSISTENT BRAND GROUPS (HTT tenant — domain-based dynamic):
  SG-Brand-HTT-Dynamic        → @httbrands.com
  SG-Brand-BCC-Dynamic        → @bishops.co / @bishops.com / @bishopsbs.onmicrosoft.com
  SG-Brand-FN-Dynamic         → @frenchiesnails.com / @ftgfrenchiesoutlook.onmicrosoft.com
  SG-Brand-TLL-Dynamic        → @thelashlounge.com / @lashloungefranchise.onmicrosoft.com
  SG-Brand-DCE-Dynamic        → @deltacrown.com

ROLE-BASED GROUPS (per tenant — attribute-based dynamic):
  SG-Role-Franchisee-{brand}  → htt_role = "franchisee" AND htt_brand = "{brand}"
  SG-Role-Corporate-{brand}   → htt_role = "corporate" AND htt_brand = "{brand}"
  SG-Role-Corporate-All       → htt_role = "corporate"

PURPOSE-SPECIFIC GROUPS (as needed — attribute or static):
  FAC cohort groups            → Keep existing (TLL tenant)
  Fabric access group          → Migrate to SG-Brand-TLL-Dynamic (retire TLL-Franchisee-Dynamic)
  Convention groups             → Sunset after event; reuse brand groups for next event
  SP HQ groups                  → Redesign around role-based groups after permissions audit
```

### 8.3 Attribute Deployment Strategy

| Phase | Scope | Attributes | Effort |
|-------|-------|-----------|--------|
| **Phase 0 (Done)** | TLL tenant | `htt_role`, `htt_brand`, `fac_cohort_id`, `fac_is_rep`, `salon_ids` | Complete |
| **Phase 1** | HTT tenant | `htt_role`, `htt_brand` | Low — corporate users only (~50 accounts) |
| **Phase 2** | BCC, FN tenants | `htt_role`, `htt_brand`, `htt_location_ids` | Medium — requires franchise owner mapping per brand |
| **Phase 3** | All tenants | `htt_region`, `htt_access_tier` | Medium — requires regional classification |
| **Phase 4** | DCE tenant | Full attribute set | Low — small user count, greenfield |

---

## 9. Prioritized Roadmap

### Immediate (Weeks 1–2): Security Hardening

| # | Action | Tool / Script | Risk | Approver |
|---|--------|--------------|------|----------|
| 1 | Run CTU Phase 1 full discovery audit | `Invoke-FullAudit.ps1` | None (read-only) | Tyler |
| 2 | Review audit findings with stakeholders | AUDIT-SUMMARY.md | None | Tyler + Dustin |
| 3 | Scope TLL partner B2B Collab (match BCC/FN/DCE) | Manual in Entra admin | Low | Tyler |
| 4 | Apply deny-by-default to default policy | `Set-DenyByDefault.ps1 -WhatIf` then live | Medium | Tyler |
| 5 | Enforce B2B Conditional Access policy (from report-only) | Entra CA admin | Medium | Tyler |

### Short-Term (Weeks 3–6): Spoke Completion & Cleanup

| # | Action | Notes |
|---|--------|-------|
| 6 | Complete Frenchies spoke-side auto-redemption | Admin request template exists |
| 7 | Complete Delta Crown spoke-side auto-redemption | Admin request template exists |
| 8 | Fix Noelle Peter userType mapping | `Fix-SyncUserTypeMapping.ps1` |
| 9 | Audit and resolve HTT HQ SP unknown system accounts | sharepointagent tools |
| 10 | Deploy CTU monitoring KQL queries to Log Analytics | `Deploy-Monitoring.ps1` |
| 11 | Set Teams federation to allowlist mode | `Set-TeamsFederationAllowlist.ps1` |

### Medium-Term (Weeks 7–12): Identity Consolidation

| # | Action | Notes |
|---|--------|-------|
| 12 | Create persistent brand-level dynamic groups in HTT | Replace convention-specific groups |
| 13 | Migrate Fabric access to persistent TLL brand group | Retire `TLL-Franchisee-Dynamic` separately |
| 14 | Deploy `htt_role` and `htt_brand` attributes to HTT tenant | Corporate users first |
| 15 | Evaluate MTO expansion for TLL, FN, DCE | Analyze feature benefits vs. licensing cost |
| 16 | Configure identity sync for FN and DCE | Match BCC/TLL pattern |
| 17 | Post-Homecoming: sunset convention-specific groups | After April 28 |

### Long-Term (Weeks 13–24): Unified Identity Initiative

| # | Action | Notes |
|---|--------|-------|
| 18 | Full user property audit across all tenants | Map current state of all user attributes |
| 19 | Deploy custom attributes to BCC and FN tenants | Franchise owner mapping per brand |
| 20 | Build role-based dynamic groups across all tenants | Replaces ad-hoc per-project groups |
| 21 | Redesign HTT HQ SharePoint permissions around role-based groups | Fixes the broken inheritance problem properly |
| 22 | Implement quarterly access reviews via CTU governance | Phase 4 of CTU remediation roadmap |
| 23 | Deploy to Delta Crown as greenfield brand | Validate the unified model on a new brand |
| 24 | Document and publish the HTT Identity Architecture standard | Living reference for all future projects |

---

## Appendix A: Service Principal Inventory

| Name | Tenant | Client ID | Purpose | Key Permissions |
|------|--------|-----------|---------|----------------|
| Homecoming 2026 Landing Page | HTT | (convention) | B2B invites, SP pages | Sites, Groups, User |
| HTT BI Support Agent | HTT | `017adf38-cc8b-4c60-afdf-c8b9d07034ee` | Fabric refresh, SQL, VM | Azure Contributor, PBI API |
| Wiggum-FAC-Extensions | TLL | `037c2451-af8b-4461-82cc-afaa666a56b7` | Custom attributes, groups | Directory.RW, Group.RW, User.RW |
| SharePoint Agent | HTT | `e4846a2a-c399-4d3a-bcb5-c66ac214ec23` | SP audit, page management | Sites.FullControl |
| CTU Audit App | HTT | (to be provisioned) | Cross-tenant audit | Read-only scopes (10 permissions) |

## Appendix B: Dynamic Group Inventory

### HTT Tenant (Hub)

| Group | Type | Rule Attribute | Members | Project | Persistent? |
|-------|------|---------------|---------|---------|------------|
| SG-Homecoming2026-Visitors-HTT-Dynamic | Dynamic | mail domain | 75 | Convention | No — sunset post-event |
| SG-Homecoming2026-Visitors-Bishops-Dynamic | Dynamic | mail domain | 12 | Convention | No |
| SG-Homecoming2026-Visitors-Frenchies-Dynamic | Dynamic | mail domain | 21 | Convention | No |
| SG-Homecoming2026-Visitors-LashLounge-Dynamic | Dynamic | mail domain | 218 | Convention | No |
| SG-Homecoming2026-Visitors-Delta-Dynamic | Dynamic | mail domain | 1 | Convention | No |
| SG-Homecoming2026-Vendors | Static | Manual | 14 | Convention | No |
| TLL-Franchisee-Dynamic | Dynamic | mail domain | ~210 | BI Support | Yes (Fabric access) |

### TLL Tenant (Spoke)

| Group | Type | Rule Attribute | Members | Project | Persistent? |
|-------|------|---------------|---------|---------|------------|
| FAC-Group-1 (FAC – Landry) | Dynamic | fac_cohort_id | 20 | Wiggum | Yes |
| FAC-Group-2 (FAC – Larson) | Dynamic | fac_cohort_id | 20 | Wiggum | Yes |
| FAC-Group-3 (FAC – Otero) | Dynamic | fac_cohort_id | 20 | Wiggum | Yes |
| FAC-Group-4 (FAC – Jania) | Dynamic | fac_cohort_id | 21 | Wiggum | Yes |
| FAC-Group-5 (FAC – Lewis-Lodhi) | Dynamic | fac_cohort_id | 18 | Wiggum | Yes |
| FAC-Reps | Dynamic | fac_is_rep | 5 | Wiggum | Yes |
| FAC-AllOwners | Dynamic | htt_role + htt_brand | 101 | Wiggum | Yes |
| FAC-Corporate | Dynamic | htt_role + htt_brand | 0 | Wiggum | Yes (pending corporate tagging) |
| TLL PBI Franchise Access | Mail-enabled Security | Manual membership | ~200 | BI Support | Yes (source group for sync) |

## Appendix C: Cross-Tenant Policy Detail

### Current Default Policy (HTT Hub)

```json
{
  "b2bCollaborationInbound": {
    "usersAndGroups": { "accessType": "allowed", "targets": [{"target": "AllUsers"}] },
    "applications": { "accessType": "allowed", "targets": [{"target": "AllApplications"}] }
  },
  "b2bDirectConnectInbound": {
    "usersAndGroups": { "accessType": "allowed", "targets": [{"target": "AllUsers"}] },
    "applications": { "accessType": "allowed", "targets": [{"target": "AllApplications"}] }
  },
  "automaticUserConsentSettings": { "inboundAllowed": false, "outboundAllowed": false },
  "inboundTrust": { "isMfaAccepted": true, "isCompliantDeviceAccepted": true }
}
```

### Target Default Policy (Deny-by-Default)

```json
{
  "b2bCollaborationInbound": {
    "usersAndGroups": { "accessType": "blocked", "targets": [{"target": "AllUsers"}] },
    "applications": { "accessType": "blocked", "targets": [{"target": "AllApplications"}] }
  },
  "b2bDirectConnectInbound": {
    "usersAndGroups": { "accessType": "blocked", "targets": [{"target": "AllUsers"}] },
    "applications": { "accessType": "blocked", "targets": [{"target": "AllApplications"}] }
  },
  "automaticUserConsentSettings": { "inboundAllowed": false, "outboundAllowed": false },
  "inboundTrust": { "isMfaAccepted": false, "isCompliantDeviceAccepted": false }
}
```

---

> **This document is a living reference.** As the unified identity initiative progresses, sections should be updated to reflect current state. The next revision should follow the CTU Phase 1 audit completion.
