# CTU — User Acceptance Criteria (UAC)
**Project:** HTT Brands Cross-Tenant Identity Audit & Remediation  
**Codename:** CTU (Cross-Tenant Utility)  
**QA Owner:** Tyler Granlund, IT Director  
**Version:** 1.0  
**Last Updated:** 2026-04-09  

---

> **How to use this document:**  
> Each Gate (G1–G6) contains specific, binary pass/fail criteria. Every criterion must be evaluated — partial sign-off is not acceptable. Approvers review the listed artifacts before work proceeds to the next phase. A single FAIL blocks the gate.

---

## GATE G1 — Audit Findings Review

**Purpose:** Confirm the full 7-domain read-only audit has been executed across all 5 tenants and the findings are reviewed, understood, and prioritized before any remediation begins.  
**Approvers:** Tyler Granlund + Dustin Boyd  
**Blocking:** Phase 2 (Quick Wins) CANNOT begin until G1 is PASS  
**Artifacts to Review:**
- `reports/{AuditName}_{timestamp}/AUDIT-SUMMARY.md`
- `reports/{AuditName}_{timestamp}/findings.csv`
- `reports/{AuditName}_{timestamp}/audit-results.json`

---

### G1 Acceptance Criteria

| Criterion ID | Criterion | Pass Condition | Fail Condition | Status |
|--------------|-----------|----------------|----------------|--------|
| G1-AC-01 | Audit completed against all 5 tenants | AUDIT-SUMMARY.md lists findings for HTT, BCC, FN, TLL, and DCE — all 5 tenants represented | Any tenant missing from audit output | ⬜ |
| G1-AC-02 | All 7 audit domains executed | Summary covers: CrossTenantSync, B2BCollaboration, B2BDirectConnect, GuestInventory, ConditionalAccess, TeamsFederation, IdentityGovernance | Any domain missing or showing "SKIPPED" without documented justification | ⬜ |
| G1-AC-03 | Audit was read-only — zero writes confirmed | Script log or network trace confirms only GET requests issued; no POST/PATCH/DELETE calls to any tenant | Any write operation detected during audit | ⬜ |
| G1-AC-04 | Critical findings are identified and counted | AUDIT-SUMMARY.md lists all "Critical" severity findings with a total count | No severity classification on findings | ⬜ |
| G1-AC-05 | Each finding has an assigned severity | findings.csv contains a `severity` column with value for every row: Critical, High, Medium, Low, or Info | Any finding without a severity level | ⬜ |
| G1-AC-06 | Findings align with known gaps from analysis document | Critical/High findings correspond to known gaps (GAP-1 through GAP-8 from HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md) | Major gap not surfaced by audit, or unexpected critical finding with no prior analysis | ⬜ |
| G1-AC-07 | HTT hub default policy state documented | Audit confirms current default B2B Collab + Direct Connect state (expected: AllApplications/AllUsers = OPEN) | Default policy state not captured or unclear | ⬜ |
| G1-AC-08 | TLL partner policy over-scoping documented | Audit flags TLL partner policy as non-compliant (All Apps / All Users for B2B Collab inbound) | TLL gap not identified | ⬜ |
| G1-AC-09 | Guest inventory produced for all tenants | `guests_{tenant}.csv` files exist for all 5 tenants; each contains guest user records with sign-in and domain data | Any tenant's guest inventory missing | ⬜ |
| G1-AC-10 | Remediation priority order agreed | Tyler and Dustin agree on which findings to address in Phase 2 (Quick Wins) vs Phase 3 (Hardening) vs Phase 4 (Governance) | No agreed prioritization; findings left unclassified by phase | ⬜ |
| G1-AC-11 | No unauthorized changes made during audit | Tyler confirms zero production changes occurred; audit was observation-only | Any unintended configuration changes | ⬜ |

**G1 Sign-off:**  
- [ ] Tyler Granlund confirms: `I have reviewed AUDIT-SUMMARY.md and findings.csv for all 5 tenants. Findings are understood and prioritized. G1 criteria pass. Date: ___`  
- [ ] Dustin Boyd confirms: `I have reviewed the audit findings and agree with the prioritization. G1 criteria pass. Date: ___`  

**➡️ G1 PASS unlocks: Phase 2 (Quick Wins) — guest invitation lockdown, authorization policy hardening, spoke-side auto-redemption fixes.**

---

## GATE G2 — Deny-by-Default WhatIf Review

**Purpose:** Confirm the deny-by-default policy change has been previewed via `-WhatIf` and the before/after delta is understood and acceptable before live execution.  
**Approver:** Tyler Granlund  
**Blocking:** Live execution of `Set-DenyByDefault.ps1` CANNOT proceed until G2 is PASS  
**Artifacts to Review:**
- `reports/deny-by-default-whatif_{timestamp}.json`
- Current policy state query output

---

### G2 Acceptance Criteria

| Criterion ID | Criterion | Pass Condition | Fail Condition | Status |
|--------------|-----------|----------------|----------------|--------|
| G2-AC-01 | WhatIf output produced successfully | `deny-by-default-whatif_{timestamp}.json` exists with valid JSON structure | File missing, empty, or invalid JSON | ⬜ |
| G2-AC-02 | WhatIf shows before/after for B2B Collaboration inbound | JSON shows `b2bCollaborationInbound` changing from `AllApplications/AllUsers` → `blocked/AllUsers` | Change not shown or incorrect direction | ⬜ |
| G2-AC-03 | WhatIf shows before/after for B2B Direct Connect inbound | JSON shows `b2bDirectConnectInbound` transitioning to blocked state | Direct Connect change missing | ⬜ |
| G2-AC-04 | WhatIf shows auto-redemption being disabled at default level | JSON shows `automaticUserConsentSettings.inboundAllowed` → `false` | Auto-redemption change not documented | ⬜ |
| G2-AC-05 | WhatIf shows MFA trust being disabled at default level | JSON shows `inboundTrust.isMfaAccepted` → `false` | MFA trust change not documented | ⬜ |
| G2-AC-06 | Zero API writes during WhatIf | Re-query of default policy after WhatIf confirms no changes applied | Policy state changed during WhatIf run | ⬜ |
| G2-AC-07 | Impact on partner overrides understood | Tyler confirms that deny-by-default will be overridden by existing per-partner policies (BCC, FN, TLL, DCE) — no net access loss for known partners | Uncertainty about whether partner access will survive default change | ⬜ |
| G2-AC-08 | Cross-project impact assessed | Tyler confirms Convention-Page-Build, bi-support-agent, and FAC-Cohort-Dev access chains have been evaluated against the proposed change | No cross-project impact review performed | ⬜ |
| G2-AC-09 | Rollback plan documented | A rollback procedure exists to revert default policy to current (open) state if issues arise post-hardening | No rollback plan | ⬜ |

**G2 Sign-off:**  
- [ ] Tyler Granlund confirms: `I have reviewed the WhatIf output and understand the before/after changes. Cross-project impact assessed. Rollback plan confirmed. G2 criteria pass. Date: ___`  

**➡️ G2 PASS unlocks: Live execution of `Set-DenyByDefault.ps1` against HTT hub tenant.**

---

## GATE G3 — Per-Partner Override Policies Review

**Purpose:** Confirm each of the 4 brand tenant partner policies is correctly scoped before live application. Each partner is reviewed and approved independently.  
**Approver:** Tyler Granlund  
**Blocking:** Live per-partner policy changes CANNOT be applied until G3 is PASS for that partner. DCE (lowest-impact) must be piloted first.  
**Artifacts to Review:**
- WhatIf output per partner: `reports/partner-policy-{tenant}_{timestamp}.json`
- Partner policy definitions in config
- Cross-project dependency check results

---

### G3 Acceptance Criteria

| Criterion ID | Criterion | Pass Condition | Fail Condition | Status |
|--------------|-----------|----------------|----------------|--------|
| G3-AC-01 | All 4 partner policy WhatIf outputs produced | JSON files exist for BCC, FN, TLL, DCE — each with valid before/after state | Any partner WhatIf missing | ⬜ |
| G3-AC-02 | Each partner scopes B2B Collab inbound to SharePoint Online (not AllApplications) | WhatIf target shows `applications.targets` = SPO app ID for all 4 partners | Any partner still targeting AllApplications | ⬜ |
| G3-AC-03 | Each partner scopes B2B Collab inbound to brand-specific security group (not AllUsers) | WhatIf target shows `usersAndGroups.targets` = specific group ID for all 4 partners | Any partner still targeting AllUsers | ⬜ |
| G3-AC-04 | TLL partner policy specifically remediates GAP-2 (All Apps/All Users → scoped) | TLL WhatIf clearly shows transition from open to scoped state | TLL change not visible or incorrect | ⬜ |
| G3-AC-05 | TLL partner policy includes Fabric/Power BI access in application targets | TLL scoping includes Power BI Service or Fabric app IDs needed by bi-support-agent | BI access would be broken by TLL scoping | ⬜ |
| G3-AC-06 | Auto-redemption enabled bidirectionally for all 4 partners | WhatIf confirms `inboundAllowed = true` and `outboundAllowed = true` for each | Any partner missing bidirectional auto-redemption | ⬜ |
| G3-AC-07 | MFA trust enabled for all 4 partners | WhatIf confirms `inboundTrust.isMfaAccepted = true` for each | Any partner missing MFA trust | ⬜ |
| G3-AC-08 | Identity sync enabled for all 4 partners | WhatIf confirms sync inbound allowed for each; FN and DCE (previously missing) now configured | FN or DCE still missing sync configuration | ⬜ |
| G3-AC-09 | DCE piloted first (lowest-impact tenant) | DCE partner policy change scheduled/executed before BCC, FN, or TLL | Another tenant modified before DCE validated | ⬜ |
| G3-AC-10 | DCE validation passed before other tenants modified | Post-DCE-hardening validation (spot-test access, sync check) confirms zero issues | DCE validation not run or showing failures before other tenants changed | ⬜ |
| G3-AC-11 | Rollback plan exists per partner | Each partner has documented rollback to revert to pre-hardening state independently | Rollback would require reverting all partners at once | ⬜ |

**G3 Sign-off (per partner — sign each independently):**  
- [ ] Tyler — DCE (Delta Crown): `Partner policy reviewed and validated. G3 criteria pass for DCE. Date: ___`  
- [ ] Tyler — BCC (Bishops): `Partner policy reviewed and validated. G3 criteria pass for BCC. Date: ___`  
- [ ] Tyler — FN (Frenchies): `Partner policy reviewed and validated. G3 criteria pass for FN. Date: ___`  
- [ ] Tyler — TLL (The Lash Lounge): `Partner policy reviewed and validated. G3 criteria pass for TLL. Date: ___`  

**➡️ G3 PASS (all 4 partners) unlocks: Phase 3 policy hardening is complete. Proceed to Gate G4 for Teams + CA hardening, then G5 for E2E validation.**

---

## GATE G4 — Conditional Access & Teams Federation Review

**Purpose:** Confirm CA policy changes and Teams federation lockdown have been reviewed in report-only mode and are ready for enforcement.  
**Approver:** Tyler Granlund  
**Blocking:** CA policy enforcement (switching from report-only to enabled) and Teams federation changes CANNOT proceed until G4 is PASS  
**Artifacts to Review:**
- CA Insights workbook data (7+ days of report-only telemetry)
- `Set-TeamsFederationAllowlist.ps1 -WhatIf` output
- Current Teams federation configuration per tenant

---

### G4 Acceptance Criteria

| Criterion ID | Criterion | Pass Condition | Fail Condition | Status |
|--------------|-----------|----------------|----------------|--------|
| G4-AC-01 | MFA-for-externals CA policy deployed in report-only for ≥7 days | Policy `state = "enabledForReportingButNotEnforced"` with creation date ≥7 days before gate review | Policy deployed < 7 days ago or never deployed in report-only | ⬜ |
| G4-AC-02 | Report-only telemetry reviewed — no unexpected blocks | CA Insights workbook shows MFA policy would have enforced MFA (not blocked) for legitimate cross-tenant users | Telemetry shows legitimate users would be blocked by the policy | ⬜ |
| G4-AC-03 | Legacy auth block policy deployed in report-only for ≥7 days | Legacy auth block policy in report-only state with sufficient telemetry | Insufficient observation period | ⬜ |
| G4-AC-04 | Sign-in frequency policy reviewed | Session control policy for external users reviewed; ≤24 hour frequency confirmed appropriate | Frequency too restrictive for operational needs or not reviewed | ⬜ |
| G4-AC-05 | "B2B External Franchisee Access" policy ready to enforce (GAP-3) | Report-only data confirms no false positives; Tyler approves move to enforced | False positives detected or insufficient data | ⬜ |
| G4-AC-06 | Teams federation WhatIf output reviewed for all 5 tenants | WhatIf shows transition from open federation to AllowList with 5 brand domains per tenant | WhatIf missing for any tenant | ⬜ |
| G4-AC-07 | Teams consumer access disable reviewed | WhatIf confirms `AllowTeamsConsumer → $false`; Tyler confirms no business need for consumer Teams federation | Business need identified for consumer access (requires re-evaluation) | ⬜ |
| G4-AC-08 | Trial tenant access disable reviewed | WhatIf confirms `ExternalAccessWithTrialTenants → "Blocked"` | Business need for trial tenant access (requires re-evaluation) | ⬜ |
| G4-AC-09 | No legitimate external domains would be blocked by allowlist | Tyler confirms the 5-domain allowlist covers all necessary business federation partners | A needed partner domain would be excluded by the allowlist | ⬜ |

**G4 Sign-off:**  
- [ ] Tyler Granlund confirms: `I have reviewed CA Insights for all policies (≥7 days report-only), Teams federation WhatIf for all 5 tenants, and confirm no legitimate access would be disrupted. G4 criteria pass. Date: ___`  

**➡️ G4 PASS unlocks: CA policies switched to enforced mode. Teams federation allowlist applied to all 5 tenants.**

---

## GATE G5 — End-to-End Cross-Project Validation

**Purpose:** Confirm zero regression across Convention-Page-Build, bi-support-agent, FAC-Cohort-Dev, and sharepointagent after Phase 3 hardening is complete.  
**Approver:** Tyler Granlund  
**Blocking:** Phase 4 (Governance) CANNOT begin until G5 is PASS  
**Artifacts to Review:**
- Convention-Page-Build: `verify-access-chain.ps1` output
- bi-support-agent: `check-onboarding-status.py` output
- FAC-Cohort-Dev: `03-validate-groups.py` output
- Per-brand spot-test access results

---

### G5 Acceptance Criteria

| Criterion ID | Criterion | Pass Condition | Fail Condition | Status |
|--------------|-----------|----------------|----------------|--------|
| G5-AC-01 | Convention site access chain intact | `verify-access-chain.ps1` reports all 6 SP Visitors group bindings active | Any binding broken or inaccessible | ⬜ |
| G5-AC-02 | Convention site accessible by spot-test users (1 per brand) | 5 test users (one from each brand tenant) can authenticate and access the Homecoming 2026 SP site | Any test user blocked | ⬜ |
| G5-AC-03 | BI/Fabric pipeline operational | `check-onboarding-status.py` confirms TLL→HTT B2B sync running; sync count matches pre-hardening baseline | Sync failed or member count dropped | ⬜ |
| G5-AC-04 | TLL-Franchisee-Dynamic group member count unchanged | Group member count in HTT tenant matches pre-hardening snapshot | Member count decreased (indicates sync disruption) | ⬜ |
| G5-AC-05 | Fabric workspace accessible by sample TLL franchise user | A TLL franchise account can access the Fabric workspace via B2B | Access denied to Fabric workspace | ⬜ |
| G5-AC-06 | FAC dynamic groups in TLL tenant unaffected | `03-validate-groups.py` passes clean — all 8 FAC groups exist with correct rules and expected member counts | Any FAC group validation failure | ⬜ |
| G5-AC-07 | Teams federation working between all brand tenants | Test Teams chat/call between HTT hub and at least 2 brand tenants succeeds | Federation blocked between any brand pair | ⬜ |
| G5-AC-08 | No new guest accounts with privileged roles | Re-run privileged guest check from GuestInventory module — zero guests in privileged roles | Guest found in a privileged role | ⬜ |
| G5-AC-09 | Auto-redemption working for all 4 brand tenants | B2B guest from each brand can access HTT resources without manual consent prompt | Manual consent prompt encountered from any brand | ⬜ |
| G5-AC-10 | No unexpected CA policy blocks in production | Review CA sign-in logs for 48 hours post-enforcement — zero false-positive blocks on legitimate cross-tenant users | False-positive blocks detected | ⬜ |

**G5 Sign-off:**  
- [ ] Tyler Granlund confirms: `All cross-project validation scripts pass. Spot-test access confirmed for all brands. Zero regression after Phase 3 hardening. G5 criteria pass. Date: ___`  

**➡️ G5 PASS unlocks: Phase 4 (Identity Governance) — access reviews, PIM configuration, entitlement management. Also unlocks brand group creation (Phase 3 medium-term).**

---

## GATE G6 — Monitoring & Steady-State Readiness

**Purpose:** Confirm all monitoring, alerting, and recurring audit schedules are operational before declaring CTU project complete and entering steady-state operations.  
**Approver:** Tyler Granlund + Dustin Boyd  
**Blocking:** CTU project CANNOT be declared "complete" until G6 is PASS  
**Artifacts to Review:**
- Azure Monitor alert rule inventory
- KQL query validation results
- Recurring audit schedule documentation
- Steady-state runbook

---

### G6 Acceptance Criteria

| Criterion ID | Criterion | Pass Condition | Fail Condition | Status |
|--------------|-----------|----------------|----------------|--------|
| G6-AC-01 | All 6 KQL alert rules deployed and enabled | Azure Monitor shows 6 active alert rules matching the required set | Any alert rule missing or disabled | ⬜ |
| G6-AC-02 | CrossTenantPolicyChanges alert tested and fires correctly | Test policy modification triggers alert within 15 minutes | Alert does not fire or fires > 15 minutes late | ⬜ |
| G6-AC-03 | GuestsAddedToPrivilegedRoles alert tested and fires correctly | Test guest role assignment triggers alert within 15 minutes | Alert does not fire | ⬜ |
| G6-AC-04 | Weekly guest spot-check schedule is active | Automation or scheduled task runs `Invoke-DomainAudit.ps1 -Domain GuestInventory` weekly | Schedule not configured or not recurring | ⬜ |
| G6-AC-05 | Monthly full guest inventory schedule is active | Monthly automation produces `guests_{tenant}.csv` for all 5 tenants with stale/abandoned flags | Schedule missing or output incomplete | ⬜ |
| G6-AC-06 | Quarterly full 7-domain audit schedule is active | Quarterly `Invoke-FullAudit.ps1` scheduled and tested | Quarterly audit not scheduled | ⬜ |
| G6-AC-07 | Steady-state runbook exists and is complete | Runbook documents: alert triage procedures, quarterly audit review checklist, guest cleanup workflow, policy change process, escalation paths | Runbook missing or incomplete | ⬜ |
| G6-AC-08 | Alert notification targets configured | Alerts route to Tyler + Dustin via email/Teams; not sent to a generic unmonitored inbox | Alerts go to unmonitored destination | ⬜ |
| G6-AC-09 | First quarterly audit delta comparison is baselined | Initial AUDIT-SUMMARY.md saved as baseline for future quarter-over-quarter comparison | No baseline established | ⬜ |
| G6-AC-10 | PIM and access reviews confirmed operational | At least one PIM activation tested (activate/deactivate cycle); guest access review triggered and reviewable | PIM activation fails or access review not functioning | ⬜ |
| G6-AC-11 | Dustin is trained on alert triage and audit execution | Dustin confirms familiarity with runbook and ability to independently run `Invoke-FullAudit.ps1` and triage alerts | Dustin cannot independently execute the steady-state procedures | ⬜ |

**G6 Sign-off:**  
- [ ] Tyler Granlund confirms: `All monitoring, alerting, and recurring schedules are operational. Runbook is complete. G6 criteria pass. CTU enters steady-state. Date: ___`  
- [ ] Dustin Boyd confirms: `I can independently triage alerts, run audits, and follow the runbook. G6 criteria pass. Date: ___`  

**➡️ G6 PASS: CTU project is COMPLETE. Identity governance enters steady-state operations with quarterly audit cadence.**

---

## Gate Dependency Chain

```
Phase 1 (Audit) ──→ G1 ──→ Phase 2 (Quick Wins) ──→ G2 ──→ Phase 3 (Hardening)
                                                              │
                                                     G3 (per-partner, DCE first)
                                                              │
                                                     G4 (CA + Teams)
                                                              │
                                                     G5 (E2E Validation) ──→ Phase 4 (Governance) ──→ G6 ──→ Steady State
```

| Gate | Blocks | Approver(s) | Criteria Count |
|------|--------|-------------|---------------|
| G1 | Phase 2 start | Tyler + Dustin | 11 |
| G2 | Live deny-by-default | Tyler | 9 |
| G3 | Live per-partner policies | Tyler (per tenant) | 11 |
| G4 | CA enforcement + Teams lockdown | Tyler | 9 |
| G5 | Phase 4 start | Tyler | 10 |
| G6 | Project completion | Tyler + Dustin | 11 |
| **Total** | | | **61 acceptance criteria** |

---

*UAC Version 1.0 — CTU Project — Tyler Granlund, IT Director*
