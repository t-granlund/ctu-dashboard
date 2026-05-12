# HTT Brands — Identity Security: Board-Level Summary

**Date:** May 2026  
**From:** Tyler Granlund, IT Director  
**To:** Riverside Capital / HTT Brands Leadership  
**Classification:** Confidential

---

## Are We Safe?

**No. Not yet.** Your front door is unlocked — any external organization can create accounts in your system without restriction. We have a plan to fix it in 5 phases, and we're partway through.

---

## What's the Risk?

HTT Brands operates 5 Microsoft Entra ID tenants (corporate + 4 franchise brands). Our audit found **106 security findings** across 7 domains, including **7 critical** and **42 high-severity** issues.

**The three biggest risks right now:**

| Risk | Impact | Current State |
|------|--------|---------------|
| **Open cross-tenant access** | Any external org can collaborate into any tenant without approval | Default policy = "allow all" across all 5 tenants |
| **MSP has unchecked admin power** | A single compromised MSP credential gives full control of all 5 tenants | PAX8 holds Privileged Role Administrator for 2 years |
| **No backup exists** | Ransomware or accidental deletion = permanent data loss | Zero paid M365 backup for Exchange, SharePoint, OneDrive, Teams |

---

## What Have We Done?

| Milestone | Status | Date |
|-----------|--------|------|
| Phase 1: Full security audit across 5 tenants | ✅ Complete | Apr 2026 |
| Comprehensive end-to-end audit | ✅ Complete | Apr 20, 2026 |
| Franworth partnership removed (critical risk eliminated) | ✅ Complete | Apr 10, 2026 |
| AppRiver service principals disabled (9 SPs, 3 tenants) | ✅ Complete | Apr 10, 2026 |
| MSP relationship fully documented | ✅ Complete | Apr 13, 2026 |
| Dashboard + MSP portal deployed | ✅ Live | Apr 2026 |
| Phase 2 scripts validated (WhatIf mode) | ✅ Validated | Apr 10, 2026 |
| **Phase 2 scripts executed against live tenants** | ❌ **Not done** | **33 days stale** |
| Insurance evidence package drafted | 🔄 Drafted | Apr 23, 2026 |

---

## What Will It Cost and When?

### Phase 2 — Quick Wins (1-2 weeks, minimal cost)
- Execute validated scripts against live tenants (~1.5 hours of work)
- Deploy legacy authentication blocks (zero licensing cost)
- Remove stale partner policies (zero cost)
- **Blocker:** Needs Tyler to authenticate per tenant (browser-based)

### Phase 3 — Policy Hardening (4-8 weeks, zero new licensing)
- Switch from "allow all" to "deny by default" with per-partner overrides
- Roll out tenant-by-tenant: DCE → BCC → FN → TLL → HTT
- **Prerequisite:** Phase 2 complete, monitoring deployed, MSP GDAP reduced
- **Risk:** Misconfiguration could lock out franchisee access — we have a rollback plan

### Phase 4 — Governance (8-16 weeks, Entra P2 already licensed)
- Quarterly access reviews for 722 guest accounts
- Privileged Identity Management (PIM) for all admin roles
- Guest lifecycle management (90-day stale → disable, 120-day → delete)
- **Licensing cost:** $0 — Entra ID P2 already purchased

### Phase 5 — Monitoring (Week 16+, Azure Log Analytics)
- KQL alert queries already written (7 queries ready)
- Needs Log Analytics workspace deployment
- **Estimated cost:** ~$50-100/month for log ingestion

### Insurance Gaps — Must Close Before Renewal
| Gap | Fix | Cost | Timeline |
|-----|-----|------|----------|
| No M365 backup | Procure backup solution (Datto/Veeam/AvePoint) | ~$2-5/seat/month | 2-4 weeks |
| No security awareness training | Deploy via Sui Generis (willing to provide) | ~$1-3/seat/month | 2-4 weeks |
| MFA not enforced for all users in BCC/FN/TLL | Deploy CA policies (Megan ready) | $0 | 1-2 weeks |
| EDR excludes IT Director + Ops Lead | Deploy ThreatDown on excluded devices | $0 (existing license) | 1 day |
| No third-party security attestation | Get signed letter from Sui Generis | $0 | 1 week |

---

## What We Need From You

1. **Authorization to execute Phase 2** — The scripts are validated and ready. We need Tyler to run them against live tenants. ~1.5 hours of focused work.

2. **Mandate to reduce MSP admin access** — PAX8 currently holds Privileged Role Administrator across all 5 tenants. This must be reduced before Phase 3. Requires a conversation with Megan.

3. **Budget for backup + training** — Two insurance-critical gaps that require procurement decisions. Without backup, any ransomware event = permanent data loss.

4. **Patience for Phase 3 rollout** — We'll go tenant-by-tenant with 5-day monitoring windows between each. Total rollout: 4-8 weeks. Rushing this risks locking out franchisees.

---

## Bottom Line

We've completed a world-class security diagnostic. The audit found 106 issues across 7 domains. We've already resolved the two most critical attack paths (Franworth, AppRiver). The scripts to close the next batch of findings are written, tested in dry-run mode, and ready to execute.

**What we haven't done is press the button.** Phase 2 is 33 days stale. The path from "diagnosed" to "fixed" requires execution, not more documentation.

The fastest path to a defensible security posture: execute Phase 2 this week, reduce MSP access next week, and deploy deny-by-default over the following month. Total effort: ~2 days of focused work + 4-8 weeks of monitored rollout.

---

*Full technical details: docs/ACTION-PLAN-2026-05-12.md, docs/PHASE3-READINESS-CHECKLIST.md*  
*Questions: Tyler Granlund (tyler.granlund@httbrands.com)*
