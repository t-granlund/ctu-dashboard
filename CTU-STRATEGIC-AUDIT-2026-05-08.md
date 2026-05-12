# CTU Strategic Audit — Evidence-Based Adversarial Review

**Date:** 2026-05-08  
**Auditor:** Epistemic Architect (epistemic-architect-4749ec)  
**Method:** OODA loop — Observe (full codebase read), Orient (delegated specialist analysis), Decide (synthesis), Act (this document)  
**Scope:** Cross-Tenant Utility mission, 5-tenant Entra architecture, all artifacts, all claims  
**Classification:** Internal — IT Leadership / Security  

---

## Verdict

**The CTU project has produced genuinely valuable audit evidence and identified real, critical security gaps. The architecture analysis is thoughtful and the phased roadmap is sound in theory. However, the project is in a dangerous liminal state: it has done enough discovery to know exactly how exposed the portfolio is, but has executed almost none of the remediation. The compliance matrix shows 5% baseline compliance across 19 controls, with Phase 2 quick wins showing "WOULD_CHANGE" on 23 of 26 checks — meaning not a single quick win has been applied to production. The gap between what the project KNOWS and what it has FIXED is now the single biggest risk.**

Three findings rise to the level of "existential portfolio risk if not addressed within 30 days":

1. **HTT default cross-tenant policy is still OPEN** (B2B Collab + Direct Connect = All Users / All Apps inbound) — 14 days after the Megan call, 37 days after the MFA verify report, and the deny-by-default script exists but hasn't been run.
2. **MSP GDAP escalation chain** — Privileged Auth Admin + Privileged Role Admin across all 5 tenants with 2-year duration and no approval workflow gives a single MSP credential compromise the ability to own the entire portfolio.
3. **TLL B2B is wide open** — the largest spoke (140 locations, 534 guests, 91.8% stale) has All Apps / All Users B2B policy, creating a franchisee→TLL→HTT kill chain.

---

## 1. EVIDENCE QUALITY AUDIT

### 1.1 MFA Verification Report (MFA-VERIFY-2026-04-23.md)

**Grade: B- — Honest about boundaries, but boundaries are wider than presented**

The report is commendably honest about what CA exports can and cannot prove. It correctly states:

> "This report is based only on Microsoft Entra Conditional Access policy exports. It does not prove endpoint controls, device compliance, actual sign-in MFA challenge outcomes, or third-party/MSP-side Conditional Access."

However, the report has a **structural adequacy gap** for the stated mission of cyber-insurance evidence:

| Evidence Claim | What the report proves | What it does NOT prove | Gap Severity |
|---|---|---|---|
| "MFA enforced for all users" (HTT, DCE) | CA policy exists with `All` users scope and MFA grant control | Whether every user has actually registered MFA methods; whether the SMTP/break-glass exceptions are acceptable | Medium |
| "Partial MFA" (TLL, BCC, FN) | MFA policy exists for specific groups/roles | How many active users are NOT in those groups; whether group-scoped = all-active-user-scoped | **High** |
| "EDR evidenced" | **Not claimed** — report correctly says CA can't prove EDR | EDR coverage at all | Critical (insurance requirement) |
| "MFA registration status" | Not checked | Which users have zero MFA methods registered | **Critical** |

**The critical gap:** The MFA report proves **policy intent**, not **policy effectiveness**. An insurance underwriter who asks "do all your users require MFA to sign in?" will get a technically honest answer from this report for HTT and DCE. But for TLL (270 in group, unknown total active users), BCC (admin only), and FN (admin only), the report cannot answer the question.

**Recommendation:** Add a supplementary evidence collection: `GET /credentialUserRegistrationDetails` across all 5 tenants. This endpoint shows which users are registered for which auth methods and whether they can satisfy MFA requirements. Without this, the insurance evidence is incomplete for 3 of 5 tenants.

### 1.2 Conditional Access Raw Exports (Audit_ConditionalAccess_2026-04-23_VERIFY/)

**Grade: B — Authentic primary evidence, but enrichment layer is thin**

The raw JSON exports are legitimate Graph API output with proper structure (policy IDs, conditions, grant controls, state). The manifest proves the export tool was run and covers all 5 tenants. This is the strongest primary evidence in the project.

**Issues:**

1. **Export is 15+ days old** (Apr 23). The Megan call was May 7. The project notes a "re-run deferred to post-call." As of this audit, no re-run evidence exists. CA policies may have changed.
2. **Enrichment JSON files are minimal** — they add display names to object IDs but don't resolve whether excluded objects are active or deleted. The TLL stale exclusion `35647db7-aa3e-4e13-8da0-4c3b6886e5fd` is present in the raw export but the enrichment doesn't flag it as deleted.
3. **No diff capability** — there's no mechanism to compare the Apr 10 export to the Apr 23 export. The project should produce point-in-time diffs showing what changed between audit runs.

**Recommendation:** Re-run the CA export immediately. Add object-ID liveness checks to the enrichment step. Build a diff tool that compares successive exports.

### 1.3 Cross-Tenant Identity Analysis (HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md)

**Grade: A- — The strongest artifact in the project**

This is a genuinely excellent architecture document. It inventories 5 cross-tenant implementations, identifies 9 security gaps with severity ratings, proposes a unified attribute model, and provides a 24-week prioritized roadmap. The attribute-first model (htt_role, htt_brand, htt_region, etc.) is well-designed and the FAC Cohort project proves it works at scale.

**Gaps:**

1. **Written April 9, not updated since.** The analysis predates the Apr 10 call, the Apr 13 MSP responses, the Apr 20 comprehensive audit, and the Apr 23 MFA verify. Key facts have changed (e.g., Franworth was discovered and removed after this doc was written; the GDAP analysis was done separately).
2. **Doesn't address the DCE guest-admin pattern as a security risk.** It documents that DCE's admin is a guest from HTT but treats this as a configuration note rather than the architectural vulnerability it is.
3. **Treats the MSP relationship as a "vendor audit" rather than a systemic attack surface.** The document doesn't analyze the GDAP escalation chain.
4. **The "7-domain audit" claim is aspirational.** The toolkit covers 7 domains but the depth varies dramatically (see §1.4 below).

### 1.4 CTU PowerShell Toolkit — Module Quality

**Grade: C+ overall — Good bones, critical gaps between claims and capabilities**

| Module | What it checks well | Critical gaps | Score |
|---|---|---|---|
| B2BCollaboration | allowInvitesFrom, guestUserRoleId, default/partner B2B, email-verified join, auth flows | No baseline comparison | 7.5/10 |
| B2BDirectConnect | Default DC inbound/outbound, MFA trust, AllApps detection | No device trust check, no tenant restrictions, errors not captured | 6.5/10 |
| ConditionalAccess | External user type granularity (B2B guest/member/DC user), auth strength, report-only detection | **Cloud app coverage not checked for MFA claim**, no exclusion audit, no risk-based policy check | 7/10 |
| GuestInventory | Sign-in activity fallback, stale/never-signed-in detection, privileged role check | **No MFA registration status**, "maps group memberships" is a phantom feature, silent error on role check | 5.5/10 |
| CrossTenantSync | Sync job status, quarantine detection, attribute mapping, userType check | None critical | 8/10 |
| TeamsFederation | Open federation detection, consumer access, trial tenants | Hardcoded domain list (ignores config), missing frenchiesnails.com | 6/10 |
| IdentityGovernance | PIM, access reviews, entitlement management, lifecycle workflows — with 403 license-gating | **No MFA registration check**, PIM settings not audited, review depth is shallow, no baseline comparison | 6/10 |

**The three most dangerous gaps:**

1. **MFA registration status is not checked by ANY module.** The project claims to verify MFA enforcement. It verifies policy existence. These are fundamentally different things. A tenant where every user has zero MFA methods registered would pass the audit as "MFA policy exists" — and then every user would be locked out when the policy is enforced, or fall back to weaker auth if the policy has fallbacks.

2. **The CA module reports `MFACoverage = $true` if ANY enabled CA policy requires MFA for ANY guest user on ANY app.** A policy requiring MFA for guests on SharePoint only would be reported as "MFA coverage: true" while Exchange, Teams, the Azure portal, and every other app is unprotected. The `TargetsAllApps` field is collected but never evaluated. This is the single most misleading output in the toolkit.

3. **No module uses the baseline comparison.** `Get-CTUBaseline` exists in Core. `baseline.json` defines precise target states. No module calls it. Every finding describes what IS, never what SHOULD BE. This makes the toolkit a **state recorder**, not a **compliance verifier**.

### 1.5 Dashboard Data Layer

**Grade: C — Static snapshot, not a live dashboard**

The `audit-data.js` file is a hardcoded JavaScript object, not a live data feed. The findings counts (106 total: 7 critical, 42 high, 32 medium) are frozen at the Phase 1 audit date. The Phase 2 WhatIf data shows all QW items as "WOULD_CHANGE" — confirming Phase 2 has not been executed. The compliance matrix shows 5% baseline compliance (2 of 40 control/tenant cells are "true").

**The Franworth discrepancy:** The `unknownTenants` array in audit-data.js still shows Franworth as a critical finding with `priority: 'critical'` and description "IMMEDIATE ACTION REQUIRED." But `msp-data.js` shows Franworth as `✅ REMOVED — full DC was removed today` and the `CompletedActions.jsx` component lists "Franworth access eliminated." This is a source-of-truth conflict — the audit data layer was not updated after remediation.

**Recommendation:** The dashboard data layer needs a refresh pipeline. Currently it's a manual copy-paste from audit output to JavaScript. Any remediation creates an immediate drift between reality and the dashboard.

---

## 2. MISSION COHERENCE AUDIT

### 2.1 The Phased Approach

**Assessment: Sound in theory, stalled in execution**

The 5-phase structure (Discovery → Quick Wins → Policy Hardening → Governance → Monitoring) is the right approach for a 5-tenant production environment. You don't flip deny-by-default without understanding what you'll break.

**However, the execution is dangerously stuck between Phase 1 and Phase 2:**

| Phase | Status | Weeks Elapsed | Critical Gap |
|---|---|---|---|
| Phase 1 (Discovery) | ✅ Complete | 4+ | Reports exist but aging (Apr 20/23) |
| Phase 2 (Quick Wins) | ❌ NOT EXECUTED | 0 of 2-3 | All 6 quick wins show "WOULD_CHANGE" — none applied |
| Phase 3 (Policy Hardening) | ❌ Not started | 0 | Deny-by-default script exists but not run |
| Phase 4 (Governance) | ❌ Not started | 0 | No access reviews, no PIM, no entitlement management |
| Phase 5 (Monitoring) | ❌ Not started | 0 | KQL queries exist but not deployed |

**The dangerous pattern:** The project has spent its energy on building tools and dashboards rather than running them. The deny-by-default script is 28.8 KB of well-crafted PowerShell with WhatIf support, rollback snapshots, and partner override logic. It hasn't been executed. The Phase 2 quick-win script is 19 KB with dry-run mode. It hasn't been executed. The validation script exists. It hasn't been run because there's nothing to validate.

This is the **"audit paralysis" pattern** — the project keeps discovering new things to audit rather than fixing what it already knows is broken. The Franworth removal is the one exception, and it was done as an emergency response to a critical finding, not as part of the phased plan.

### 2.2 What's Missing from the Mission

**Missing capability: MFA registration verification.** The mission says "MFA/CA verification" but the toolkit can only verify policy configuration, not registration status. This is the difference between "we have a law requiring seatbelts" and "everyone in the car is wearing a seatbelt."

**Missing capability: Sign-in log correlation.** No part of the project correlates CA policy scope with actual sign-in activity to verify that the policies are actually being evaluated and enforced. The KQL queries exist for monitoring but aren't deployed.

**Missing capability: Cross-tenant CA effectiveness testing.** The B2B External Franchisee Access policy is report-only. Nobody has verified what would happen if it were enabled. The project should have a test plan: "For each brand tenant, here are the 3 test accounts we'll use to verify that enabling the B2B CA policy doesn't break legitimate access."

**Missing scope: Spoke-side security posture.** The project audits the HTT hub comprehensively. The spoke-side posture is partially documented (CA exports exist for all tenants, MFA report covers all) but the B2B OUTBOUND policies, the spoke-side default policies, and the spoke-side guest invitation settings are not systematically audited. A spoke with open outbound B2B is just as dangerous as a hub with open inbound.

**Missing scope: Application-level access governance.** The project focuses on identity-level controls (B2B, CA, MFA, guest lifecycle) but doesn't audit which applications guests actually access. A guest with read access to SharePoint is different from a guest with write access to a Finance app. No module checks app role assignments for guest users.

---

## 3. RISK PRIORITIZATION AUDIT

### 3.1 Insurance-Driven Framing Creates Blind Spots

The project's urgency is driven by cyber-insurance evidence requirements (MFA/CA verification for CFO/Riverside). This creates a specific distortion:

| What insurance asks | What the project focuses on | What gets deprioritized |
|---|---|---|
| "Is MFA enforced?" | CA policy exports, MFA verify report | Device compliance, EDR, backup, MFA registration status |
| "Do you have EDR?" | "Not from CA exports" — left as follow-up | EDR deployment gaps (Tyler, Dustin, franchisee PCs) |
| "Do you have backup?" | "Not found" — left for MSP pricing | No M365 backup exists; ransomware resilience is zero |
| "Who has admin access?" | GDAP role analysis (after screenshots) | MSP B2B guest account attack surface, DCE guest-admin |

**The distortion:** Insurance evidence creates a *checklist compliance* mindset rather than a *threat-model* mindset. The project proves that MFA policies exist (checklist ✅) but doesn't prove that MFA is effective (threat model ❌). It identifies EDR as missing (checklist ❌) but doesn't treat the EDR gap on franchisee personal devices as an active attack vector (threat model 🔴).

### 3.2 Are the Right Things Being Worked On First?

**No. The Phase 2 quick wins should have been executed before the Megan call brief was drafted.**

The Phase 2 items are explicitly designed as "minimal disruption, maximum impact" changes:
- QW1: Guest invitation restriction (stops new uncontrolled guests)
- QW2: Guest role hardening (reduces existing guest blast radius)
- QW3: Email-verified join disabled (closes self-service signup)
- QW4: Teams consumer access disabled (closes consumer Teams attack vector)
- QW5: Teams trial federation disabled
- QW6: MFA CA policy in report-only (sets up enforcement)

All 6 are low-risk, reversible, and address findings the project identified weeks ago. None has been applied. The effort that went into the Megan call brief (33 KB document), the DCE runbook, and the dashboard updates would have been better spent executing QW1-QW3.

**The real priority order should be:**

| Priority | Action | Current Status | Days Since Discovery |
|---|---|---|---|
| P0 | Execute QW1 (guest invitation restriction) across all 5 tenants | NOT DONE | 29+ |
| P0 | Execute QW3 (email-verified join disabled) across all 5 tenants | NOT DONE | 29+ |
| P0 | Deploy ThreatDown to Tyler and Dustin endpoints | NOT DONE | 25+ (Apr 13) |
| P0 | Disable Ingram-Micro + O365Support SPs in TLL | NOT DONE | 25+ (Megan authorized Apr 13) |
| P0 | Remove 7 BCC password-never-expires | NOT DONE | 25+ (Megan asked for list Apr 13) |
| P1 | Scope TLL B2B from AllApps → SharePoint + specific SG | NOT DONE | 29+ |
| P1 | Enable B2B Franchisee Access CA in enforce mode | NOT DONE | 29+ (exists as report-only since Jun 2025) |
| P1 | Create native DCE admin; eliminate guest-admin | NOT DONE | Not proposed |
| P2 | Run deny-by-default with partner overrides | NOT DONE | Script exists, not executed |

---

## 4. ASSUMPTION AUDIT

### 4.1 Explicit Assumptions That Are Evidenced

| Assumption | Evidence | Confidence |
|---|---|---|
| HTT has tenant-wide MFA with SMTP exception | CA export confirms `All` users scope, MFA grant, named exclusion | **High** |
| DCE has tenant-wide MFA with break-glass exception | CA export confirms `All` users scope, MFA grant, SGI break-glass exclusion | **High** |
| TLL MFA is group-scoped (not all-user) | CA export confirms `MFA Security` group scope (270 members), not `All` | **High** |
| BCC MFA is admin + targeted only | CA export confirms admin role scope + named-user policies | **High** |
| FN MFA is admin only | CA export confirms Global Admin scope only | **High** |
| HTT default B2B inbound is open (All Users / All Apps) | Cross-tenant access policy JSON in architecture doc | **High** |

### 4.2 Implicit Assumptions That Are NOT Evidenced

| # | Assumption | Who Assumes It | Evidence Gap | Risk If Wrong |
|---|---|---|---|---|
| A1 | **"MSP enforces MFA via their own CA"** | Project, insurance report | Self-attestation only (Megan said "yes" on Apr 13). No tenant-side evidence of SGI CA policies. No proof that SGI Techs CA requires phishing-resistant MFA. | **Critical** — if SGI MFA is SMS-only or has exclusions, the entire MSP access path has weaker auth than assumed |
| A2 | **"MFA registration covers all users in scoped groups"** | Implicit in MFA report's "partial" ratings | `/credentialUserRegistrationDetails` has never been queried. We don't know if 270 TLL MFA Security members have all registered MFA. | **High** — 20% registration gap in a 140-location franchise = 54 users with no MFA methods despite "group-scoped MFA" |
| A3 | **"GDAP is the same 6-role set across all 5 tenants"** | GDAP analysis doc | Only screenshots from one tenant were analyzed. Doc itself says: "Action Item: Confirm with Megan whether the same 6-role GDAP is applied identically to all 5 tenants" | **Critical** — if a spoke has MORE roles (e.g., Global Admin), the escalation risk is worse than documented |
| A4 | **"SGI Techs group membership is stable and known"** | Project, GDAP analysis | Megan said "all our team members are a part of this group" but no membership audit has been performed. Genesis is Tier 1, others 2+ years — but how many is "others"? | **Medium** — unknown headcount with God-tier access |
| A5 | **"No additional unknown tenants exist"** | Based on Phase 1 audit | Audit was Apr 20, not re-run since. New partner policies could have been added by SGI or any admin | **Medium** — Franworth was discovered during this audit; what else was missed? |
| A6 | **"HTT E5 expiration has a Pax8 replacement active"** | Call brief implies migration | E5 expired May 3. Teams Premium lapsed Apr 2. No confirmation of replacement order status. Call brief item #3 is "🔴 P0" | **Critical** — if E5 features (CA, ATP, DLP) are not replaced, the hub tenant has degraded security |
| A7 | **"DCE guest-admin is acceptable"** | Not questioned in any artifact | DCE admin account is `tyler.granlund-admin_httbrands.com#EXT#@deltacrown.onmicrosoft.com` — a guest from HTT with admin access to DCE | **Critical** — if HTT is compromised, DCE admin is automatically compromised (transitive trust) |
| A8 | **"Franworth is fully removed"** | msp-data.js says "✅ REMOVED" | No verification script output is present in the reports directory. The audit-data.js still shows Franworth as critical. | **High** — if removal wasn't verified, TLL may still have invisible Direct Connect access from a third party |
| A9 | **"AppRiver SPs are disabled"** | Call brief says "3 SPs authorized for removal" | No execution evidence. The `Disable-AppRiverSPs.ps1` script exists (12.6 KB) but no output log confirms it ran successfully. | **Medium** — stale SPs with valid credentials are persistence vectors |
| A10 | **"No B2B Direct Connect abuse is occurring"** | Default policy is open | No monitoring of Teams shared channel membership. No KQL alerting deployed. Direct Connect users don't create guest objects — they're invisible to guest inventory. | **High** — an active DC abuse scenario would produce zero evidence in current tooling |

---

## 5. CROSS-TENANT THREAT MODEL

### 5.1 The Portfolio Kill Chain (Achievable Today)

```
STEP 1: Attacker phishes a TLL franchisee on a personal laptop
         (no EDR, no MDM, no device trust signal)
         │
STEP 2: Credential stolen → logs into TLL as guest or member
         (TLL B2B = All Apps / All Users; MFA is group-scoped only;
          91.8% of 534 guests are stale — likely weak credentials)
         │
STEP 3: From TLL, uses B2B relationship to pivot to HTT hub
         (HTT default inbound = ALL users / ALL apps — wide open)
         │
STEP 4: In HTT, the B2B External Franchisee Access CA is
         REPORT-ONLY — no enforcement, no block
         │
STEP 5: Attacker compromises the DCE admin account
         (it's a GUEST from HTT — if HTT is owned, DCE admin
          is transitively owned)
         │
STEP 6: With DCE admin access, creates a high-privilege SP
         for persistence (Wiggum-style: Directory.RW, Group.RW, User.RW)
         │
STEP 7: From HTT, exploits MSP GDAP escalation:
         Privileged Auth Admin → reset a Global Admin password
         Privileged Role Admin → assign themselves Global Admin
         (2-year GDAP duration; no approval workflow; 
          both GDAP and B2B guest accounts for MSP = dual attack surface)
         │
STEP 8: GAME OVER — attacker owns all 5 tenants
         │
STEP 9: No M365 backup → ransomware destroys all M365 data
         (Exchange, SharePoint, OneDrive, Teams)
         │
STEP 10: 2-year GDAP duration → 730 days of guaranteed persistence
          Stale CA exclusions → persistence survives account cleanup
          No EDR on franchisee devices → attack origin is invisible
```

**This kill chain exploits: open B2B defaults → group-scoped MFA → report-only CA → guest-admin pattern → MSP GDAP escalation → no backup → stale exclusions → missing EDR. Every link in this chain is a documented, unremediated finding.**

### 5.2 Attack Paths Not Being Addressed

| # | Attack Path | Current Mitigation | Gap | Priority |
|---|---|---|---|---|
| AP1 | **MSP compromise → GDAP escalation across all 5 tenants** | SGI Techs CA; individual accounts; MFA self-attested | 2-year duration; Privileged Auth + Role Admin combo = God mode; no GDAP audit cadence; no break-glass revocation runbook | 🔴 P0 |
| AP2 | **TLL franchisee credential theft → B2B pivot to HTT** | TLL group-scoped MFA; B2B Franchisee CA (report-only) | TLL B2B = All Apps/All Users; CA not enforced; no device trust; 534 guests, 91.8% stale; HTT inbound open | 🔴 P0 |
| AP3 | **DCE guest-admin → HTT compromise inherits DCE admin** | DCE tenant-wide MFA | Guest admin = transitive trust violation; if HTT is owned, DCE is owned; no native DCE admin exists | 🔴 P0 |
| AP4 | **B2B Direct Connect invisible access** | Default DC = All Users/All Apps (i.e., none) | DC users don't create guest objects; invisible to guest inventory; no Teams shared channel monitoring; home-tenant MFA applies (not resource-tenant) | 🟠 P1 |
| AP5 | **Stale CA exclusions → persistence after cleanup** | Documented in MFA report | TLL `35647db7` deleted object still excluded; BCC `77023be8` unresolved; no automated CA exclusion hygiene | 🟠 P1 |
| AP6 | **SP credential theft → directory-level persistence** | None for workload identities | Wiggum = Directory.RW/Group.RW/User.RW; no Workload Identity CA; no credential rotation cadence documented | 🟠 P1 |
| AP7 | **BCC password-never-expires → credential stuffing** | Admin MFA for some | 7 accounts with no rotation; BCC MFA is admin+targeted only; if any of 7 are non-admin, they have no MFA + no rotation | 🔴 P0 |
| AP8 | **Missing EDR on endpoints → invisible beachhead** | ThreatDown deployed (with gaps) | Tyler + Dustin missing EDR; franchisee personal PCs unmanaged; no Intune/MDM; no device trust signal for CA | 🔴 P0 (known), P1 (franchisee) |
| AP9 | **Supply chain SP persistence** | AppRiver migration in progress; Ingram/O365Support "safe to remove" | Ingram-Micro and O365Support SPs still active in TLL; AppRiver not confirmed disabled; no SP governance process | 🟠 P1 |
| AP10 | **HTT E5 expiration → feature gap** | Intentional migration per call brief | No confirmation that Pax8 replacement is active; CA, ATP, DLP features may be degraded; Teams Premium lapsed Apr 2 | 🔴 P0 |

### 5.3 The Franworth Precedent

The Franworth discovery deserves special attention. A third-party franchise consulting firm had **full B2B Direct Connect access** to TLL — not just B2B Collaboration, but Direct Connect — with **NO MFA trust** configured. This means:

- Franworth users could join TLL Teams shared channels without being guest accounts (invisible to guest inventory)
- No MFA was required from the TLL side (TLL trusted the home-tenant auth, which wasn't configured)
- The access was bidirectional and application-unrestricted

This is the exact attack path AP4, and it was **real, not theoretical**. The question isn't "could this happen?" — it's "has it happened again with another tenant?"

The project's response (Remove-FranworthAccess.ps1, Verify-FranworthRemoval.ps1) was appropriate. But the **systemic lesson** hasn't been learned: the default Direct Connect policy should have been changed to BLOCKED immediately after the Franworth discovery, regardless of the phased plan. Instead, the default remains open 29+ days later.

---

## 6. GOVERNANCE GAPS AUDIT

### 6.1 Access Reviews — Zero Deployment

**Status: Not deployed in any tenant. Phase 4 target.**

The compliance matrix shows "Access reviews (quarterly)" as `false` across all 5 tenants. The Identity Governance module checks for access reviews and correctly identifies them as missing. The Phase 4 remediation plan includes quarterly guest access reviews with auto-apply.

**The gap:** Without access reviews, there is **no governance mechanism to remove access when business relationships change**. The TLL guest inventory shows 534 guests with 91.8% stale and 74.7% never signed in. These are not "potentially stale" — they are functionally abandoned access grants to the tenant. The 354 pending invitations older than 1,000 days (3+ years) represent invitations that will never be accepted but create an attack surface if the email address is later compromised.

**Critical dependency:** Access reviews require Entra ID P2, which is confirmed as "blanket" on every tenant via Pax8. But P2 existence ≠ P2 utilization. The project should verify that P2 is actually assigned to the users who need to participate in reviews (reviewers and review targets).

### 6.2 PIM — Available But Not Configured

**Status: P2 license present; PIM not effectively utilized.**

The compliance matrix shows "All GAs PIM-eligible (max 2 permanent)" as `false` across all 5 tenants. This means every Global Admin has permanent (always-on) role assignment rather than just-in-time elevation.

**The gap:** Combined with the MSP GDAP escalation chain, this creates a situation where:
1. MSP has Privileged Role Admin (can assign Global Admin) — permanent GDAP, 2-year duration
2. Existing Global Admins have permanent assignments — no just-in-time activation
3. No PIM policy settings are audited (activation requirements, approval chains, max duration)

If an attacker gets Global Admin through GDAP escalation, the fact that all GAs are permanently assigned means there's no audit trail of "who activated admin access and when" — the access is always active.

### 6.3 Entitlement Management — Not Deployed

**Status: Not deployed. Phase 4 target.**

The Identity Governance module checks for access packages and connected organizations. None exist. The Phase 4 plan includes creating access packages for cross-tenant resource access with approval workflows and 90-180 day expiration.

**The gap:** Without entitlement management, the project has **no structured way to grant time-limited, approval-gated access** to cross-tenant resources. Every access grant is either manual (add user to group) or automated via sync (cross-tenant sync adds users based on scope). Neither has a built-in expiration or review mechanism.

### 6.4 B2B Direct Connect Governance — Completely Absent

**Status: Not addressed in any artifact.**

The project treats B2B Collaboration (guest accounts) as the primary cross-tenant access pattern. B2B Direct Connect (Teams shared channels) is audited at the policy level but has **zero governance controls**:
- No access reviews for DC users (they're not guests, so guest reviews don't cover them)
- No entitlement management for shared channel membership
- No lifecycle management (DC users don't have guest objects that can be disabled/deleted)
- No visibility into which shared channels have external participants

This is a governance blind spot that the Franworth discovery exposed. DC access is invisible to every governance mechanism the project plans to deploy.

### 6.5 Device Compliance — No Foundation Exists

**Status: No Intune/MDM deployed. No device compliance policies.**

The cross-tenant access policy includes `isCompliantDeviceAccepted: true` for partner overrides (per baseline.json), but there are **no compliant devices to accept** because no MDM is deployed. The device trust signals in CA policies are configured but ineffective:

| Signal | Available? | Deployed? | Usable for CA? |
|---|---|---|---|
| Device compliance (Intune) | No | No | ❌ No |
| Hybrid Azure AD joined | No | No | ❌ No |
| Microsoft Defender for Endpoint risk | Partial (ThreatDown, not Defender) | Gaps | ❌ Not integrated |

The baseline.json sets `isCompliantDeviceAccepted: true` in partner overrides, but this is aspirational — it accepts a trust signal that doesn't exist.

### 6.6 Lifecycle Governance — No Offboarding Exists

**Status: The DCE new-user runbook v0.1 covers onboarding. No offboarding playbook exists.**

The architecture analysis proposes that offboarding should work by:
1. Setting `accountEnabled = false` and `htt_access_tier = "Disabled"`
2. Dynamic groups automatically remove the user
3. All downstream access drops in lockstep

This is elegant in theory but untested. The project has no evidence that:
- Disabling an account actually removes them from all dynamic groups in a timely manner
- Cross-tenant sync propagates the disabled state
- SharePoint/Teams access is actually revoked when the group membership changes
- License reclamation actually occurs (group-based licensing should handle this, but is it configured?)

---

## Consolidated Action Register

### 🔴 P0 — This Week (Existential Portfolio Risk)

| # | Action | Owner | Effort | Depends On |
|---|---|---|---|---|
| 1 | Execute QW1 (guest invitation restriction) across all 5 tenants | Tyler | 1 hour | Nothing — script exists |
| 2 | Execute QW3 (email-verified join disabled) across all 5 tenants | Tyler | 30 min | Nothing — script exists |
| 3 | Scope TLL B2B from AllApps/AllUsers → SharePoint + specific SG | Tyler | 2 hours | Nothing — pattern exists for BCC/FN/DCE |
| 4 | Confirm HTT E5 Pax8 replacement is active; if not, order immediately | Megan + Tyler | 1 hour | Megan response |
| 5 | Deploy ThreatDown to Tyler and Dustin endpoints | Megan | 1 hour | Nothing — known gap |
| 6 | Disable Ingram-Micro + O365Support SPs in TLL | Tyler | 30 min | Nothing — Megan authorized Apr 13 |
| 7 | Create native DCE admin; disable guest-admin account | Tyler | 2 hours | Nothing — straightforward |
| 8 | Share BCC 7-account list with Megan for triage | Tyler | 15 min | Nothing — Tyler has the data |
| 9 | Collect `/credentialUserRegistrationDetails` for all 5 tenants | Tyler / CTU script | 3 hours | New script or manual Graph calls |
| 10 | Verify Franworth removal with `Verify-FranworthRemoval.ps1` | Tyler | 30 min | Script exists; needs to be run |
| 11 | Re-run CA export to get fresh evidence (Apr 23 data is stale) | Tyler | 1 hour | Script exists |

### 🟠 P1 — This Sprint (Critical Security Gaps)

| # | Action | Owner | Effort |
|---|---|---|---|
| 12 | Execute QW2 (guest role → Restricted Guest) on HTT, TLL, DCE | Tyler | 1 hour |
| 13 | Execute QW4 (Teams consumer access disabled) across all 5 | Tyler | 30 min |
| 14 | Execute QW6 (MFA CA report-only) on FN, TLL, DCE | Tyler | 1 hour |
| 15 | Enable B2B Franchisee Access CA in enforce mode | Tyler | 2 hours (with test plan) |
| 16 | Block B2B Direct Connect in default policy | Tyler | 30 min |
| 17 | Reduce GDAP duration (push MSP to 90 days; add quarterly review) | Tyler + Megan | Negotiation |
| 18 | Audit Wiggum-FAC-Extensions permissions; reduce to minimum | Tyler | 4 hours |
| 19 | Confirm AppRiver SPs disabled across all tenants | Tyler | 1 hour |
| 20 | Clean stale CA exclusions (TLL 35647db7, BCC 77023be8) | Tyler | 1 hour |
| 21 | Deploy M365 backup solution | Megan | MSP action |
| 22 | Get written insurance attestation from SGI | Megan | MSP action |

### 🟡 P2 — Next Sprint (Governance & Monitoring)

| # | Action | Owner | Effort |
|---|---|---|---|
| 23 | Run `Set-DenyByDefault.ps1` with partner overrides | Tyler | 4 hours (incl. testing) |
| 24 | Deploy PIM for all Global Admin roles (max 2 permanent) | Tyler | 8 hours |
| 25 | Create quarterly access reviews for guest accounts | Tyler | 8 hours |
| 26 | Deploy KQL monitoring alerts to Log Analytics | Tyler | 4 hours |
| 27 | Implement MAM (Intune app containers) for franchisee BYOD | Tyler + Megan | 2-3 days |
| 28 | Build offboarding playbook (complement to onboarding runbook) | Tyler | 4 hours |
| 29 | Add MFA registration verification module to CTU toolkit | Tyler | 8 hours |
| 30 | Fix CA module cloud-app-coverage check (use TargetsAllApps) | Tyler | 4 hours |
| 31 | Wire baseline comparison into all audit modules | Tyler | 1-2 days |

---

## Closing Assessment

### What the Project Gets Right

1. **The architecture analysis is genuinely excellent.** The 7-domain framework, the unified attribute model, and the hub-spoke target state are well-designed and show deep understanding of the Microsoft identity ecosystem.

2. **The MFA report is honest about its limits.** It doesn't overclaim. It correctly identifies that CA exports prove policy intent, not effectiveness. This integrity is rare in security audit reports.

3. **The Franworth response was decisive.** When a critical finding was discovered (full Direct Connect with no MFA trust), the project built a targeted remediation script and executed it. This shows the team can move fast when needed.

4. **The MSP relationship documentation is thorough.** The GDAP analysis, the 20-question follow-up, and the call brief represent a level of vendor governance documentation that most organizations never achieve.

5. **The phased approach is technically sound.** You don't flip deny-by-default without understanding what you'll break, and the project correctly sequences discovery before remediation.

### What the Project Gets Dangerously Wrong

1. **Execution is stalled while evidence accumulates.** The project has built more tools and dashboards than it has run in production. The single most impactful action — executing the 6 Phase 2 quick wins — remains undone 29+ days after discovery.

2. **The MFA verification claim exceeds the toolkit's capability.** The project claims to verify MFA enforcement. It verifies policy existence. The gap between "MFA policy exists" and "every user can satisfy MFA" is unbridged, and the CA module's cloud-app-coverage bug makes even the policy-existence claim unreliable.

3. **The DCE guest-admin pattern is unchallenged.** A tenant admin that is a guest from another tenant is a fundamental architectural violation. It creates transitive trust dependency that means compromising HTT automatically compromises DCE. This should have been flagged as a Critical finding, not documented as a configuration note.

4. **B2B Direct Connect is a governance blind spot.** The project focuses almost entirely on B2B Collaboration (guest accounts) and treats Direct Connect as a secondary concern. The Franworth discovery proved that Direct Connect is the more dangerous attack vector (invisible to guest inventory, no lifecycle management). The default remains open.

5. **The insurance-driven framing creates a false sense of completion.** Producing a report that says "MFA is enforced with documented exceptions" feels like progress. But if the exceptions are unverified, the registration status is unknown, and the enforcement is report-only, the report is a compliance artifact, not a security improvement.

### The Bottom Line

**The CTU project has correctly diagnosed the disease. It has not yet administered the cure. The diagnosis was completed 29+ days ago. The cure (Phase 2 quick wins) was designed to take 2-3 weeks. It has not started. Every day that passes with the current configuration — open B2B defaults, unenforced CA, group-scoped MFA on the largest spoke, MSP God-mode GDAP, no backup, EDR gaps — is a day the kill chain remains achievable. The most important thing Tyler can do this week is not draft another document or build another dashboard component. It is: run `Invoke-Phase2QuickWins.ps1 -Execute` and scope the TLL B2B policy.**

---

*Audit prepared by Epistemic Architect (epistemic-architect-4749ec) using OODA methodology with delegated specialist analysis from security-auditor and code-reviewer agents.*
