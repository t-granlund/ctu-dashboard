# CTU Round-Table Action Plan

**Date:** 2026-05-12  
**Owner:** Tyler Granlund, IT Director — HTT Brands  
**Source:** Round-table audit by Epistemic Architect, Solutions Architect, Experience Architect, Ops Comms Collie, Release Gate Arbiter  
**Status:** In Progress — Phase 1 (Data Integrity) complete

---

## Executive Summary

Five specialist reviewers unanimously concluded: **the project has correctly diagnosed the disease but has not administered the cure.** Phase 2 quick wins have never been executed (33 days stale), MFA/EDR evidence is overstated on the insurance form, MSP GDAP governance is the biggest unmitigated risk, and no monitoring or backup exists.

This plan consolidates all findings into a prioritized execution track.

---

## Phase 1 — Data Integrity ✅ COMPLETE

| Item | Status | Detail |
|------|--------|--------|
| A3.1 — Reconcile AppRiver SP data | ✅ | All 9 SPs updated to `enabled: false` in msp-data.js with disabled dates and evidence links. `verificationNote` added pending Graph API confirmation. |
| A3.2 — Fix Franworth source-of-truth conflict | ✅ | audit-data.js Franworth entry marked `resolved: true`, `priority: 'resolved'`, with resolution date and evidence link. AppRiver also resolved. |
| A3.3 — Update stale auditDate | ✅ | `cyberInsuranceGaps.auditDate` updated from 2026-03-10 to 2026-05-12. EDR/backup/training entries already correct. |
| A3.4 — Update sidebar/header/footer text | ✅ | Updated from "Phase 1 Audit · v1.1" to "Round-Table Review · v1.2". |

---

## Phase 2 — Documents

| Item | Owner | Status | Detail |
|------|-------|--------|--------|
| A1 — Master action plan (this document) | Tyler | ✅ | You're reading it |
| A8 — Phase 3 readiness checklist | Tyler | 🔄 | 9 Release Gate blockers with pass/fail criteria |
| A6 — Insurance attestation letter template | Tyler | 🔄 | Fill-in-the-blanks for Megan |
| A5 — Franchisee impact briefs (HTT, BCC, FN, TLL) | Tyler | 📋 | After A8 scope is defined |

---

## Phase 3 — Dashboard Changes

| Item | Owner | Status | Detail | Depends On |
|------|-------|--------|--------|------------|
| A7 — Insurance Evidence section | Tyler | 📋 | Top-level section before Executive Overview | A3 (done) |
| A10a — Fix severity colors in light mode | Tyler | 📋 | Bounded fix: restore red/green/amber encoding | None |
| A9 — Update traceability matrix | Tyler | 📋 | Backfill AppRiver + Franworth; add evidence column | None |

---

## Phase 4 — Tracking

| Item | Owner | Status | Detail |
|------|-------|--------|--------|
| A2 — File bd issues for all Track B items | Tyler | 📋 | Each with priority, acceptance criteria, dependencies, stale-after date |
| A4 — Board-level summary | Tyler | 📋 | 1-page exec brief |

---

## Track B — Requires Live Access / Human Conversations

These items are deferred from this session. Each will be filed as a bd issue with acceptance criteria and a stale-after date.

| ID | Item | Needs | Priority | Stale After |
|----|------|-------|----------|-------------|
| B1 | Execute Phase 2 quick wins against live tenants | Tyler browser auth per tenant | 🔴 P0 | 2026-05-19 |
| B2 | Verify AppRiver SP disabled status in live tenants | Graph API Directory.Read | 🔴 P0 | 2026-05-19 |
| B3 | Investigate O365Support-MSP-Connector in TLL | Graph API read | 🔴 P0 | 2026-05-19 |
| B4 | Remove Privileged Role Admin from PAX8 GDAP | Megan conversation + GDAP admin | 🔴 P0 | 2026-05-26 |
| B5 | Deploy legacy auth block CA policy | Graph API Policy.ReadWrite | 🟠 P1 | 2026-05-26 |
| B6 | Save pre-Phase-3 policy snapshots | Graph API read per tenant | 🟠 P1 | 2026-05-26 |
| B7 | Deploy monitoring (Log Analytics + KQL alerts) | Azure infrastructure | 🟠 P1 | 2026-06-02 |
| B8 | Procure M365 backup solution | Vendor evaluation + budget | 🔴 P0 | 2026-05-26 |
| B9 | Get written EDR/backup/DR attestation from SGI | Megan signed statement | 🟠 P1 | 2026-05-26 |
| B10 | Demonstrate MFA registration ≥95% in FN/TLL | Graph API read | 🟠 P1 | 2026-05-26 |
| B11 | Fix break-glass pattern (FIDO2 keys) | Physical hardware procurement | 🟡 P2 | 2026-06-16 |
| B12 | Enforce MFA CA policy for external users | Graph API + Phase 2 + B10 | 🟠 P1 | 2026-06-02 |
| B13 | Reduce DCE permanent GAs from 5 to 2 | Graph API + PIM configuration | 🟡 P2 | 2026-06-16 |
| B14 | Correct CFO insurance response | Tyler/Megan review: MFA should say "admin MFA in BCC/FN; all-user roadmap in progress" not "all five tenants." EDR should say "N of M devices; exclusions attached." | 🔴 P0 | 2026-05-19 |
| B15 | Tabletop exercise for emergency cross-tenant revert | Tyler + Dustin session on DCE | 🟡 P2 | 2026-06-16 |

---

## Critical Path to Phase 3

The Release Gate Arbiter gave Phase 3 a **FAIL** verdict (0 of 8 pillars pass). The fastest path to CONDITIONAL_PASS:

1. **Execute Phase 2 quick wins** (~1.5 hours of live-tenant work)
2. **Save pre-Phase-3 policy snapshots** for all 5 tenants
3. **Remove PAX8 elevated GDAP roles** (Privileged Role Admin → removed; Privileged Auth Admin → Helpdesk Admin)
4. **Deploy monitoring** (Log Analytics + at least 1 alert verified end-to-end)
5. **Demonstrate MFA registration ≥95% in FN and TLL**

Items 1–3 are achievable in <1 day of focused work. Items 4–5 take ~1 week each.

---

## Tenant Rollout Order (when Phase 3 is cleared)

Per the Release Gate Arbiter and Comprehensive Audit §10.4:

1. **DCE** first — pre-launch, lowest blast radius, 0 franchisees
2. **BCC** second — smallest spoke, 2 guests, mostly compliant
3. **FN** third — ONLY after external-user MFA is enforced (P-9 closure)
4. **TLL** fourth — ONLY after P-9 closure + stale-guest pruning
5. **HTT** (hub) last — flip default with all 4 spoke partner overrides verified

Between each tenant: minimum 5 business days monitoring, CA insights review, written go/no-go from Tyler + Dustin.

---

## How We Got Here

This plan was produced by a round-table audit of the CTU project using 5 specialist reviewers:

1. **Epistemic Architect** — found data freshness issues, insurance gap analysis, and closure verification problems
2. **Solutions Architect** — identified O365Support-MSP-Connector as 🔴 CRITICAL, ranked remediations by effort/impact
3. **Experience Architect** — found insurance gaps buried 5 clicks deep, no PE-partner-ready view
4. **Ops Comms Collie** — found zero franchisee-facing communication exists
5. **Release Gate Arbiter** — gave Phase 3 a FAIL verdict with 9 blocking findings, 0 of 8 pillars passing

All five independently reached the same conclusion: the project has world-class diagnostic capability but execution has stalled. This plan is designed to break that stall.
