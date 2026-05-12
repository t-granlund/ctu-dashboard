# CTU — Phase 3 Readiness Checklist

**Purpose:** This document lists all blockers that must be cleared before Phase 3 (deny-by-default) can be deployed.  
**Source:** Release Gate Arbiter verdict (2026-05-12), Comprehensive End-to-End Audit (2026-04-20), Strategic Audit (2026-05-08)  
**Rule:** ALL items must show ✅ before Phase 3 execution begins on any tenant.

---

## Hard Preconditions (must exist before gate)

| # | Precondition | Status | Evidence Required | Owner |
|---|-------------|--------|-------------------|-------|
| 1 | Traceability matrix with ≥50% closure | ⬜ | RTM shows ✅ for all Phase 2 items; validation evidence column populated | Tyler |
| 2 | Pre-Phase-3 policy snapshot for all 5 tenants | ⬜ | `reports/snapshots/HTT_full-snapshot_*.json` + 4 spoke equivalents exist and committed | Tyler |
| 3 | Environment delta spec (current → target per tenant) | ⬜ | `docs/env-delta.yaml` or equivalent, each row linked to RTM requirement | Tyler |
| 4 | CAB-equivalent change ticket with Tyler + Dustin sign-off | ⬜ | Written approval with scheduled cutover window, named go/no-go authority | Tyler + Dustin |
| 5 | Rollback runbook rehearsed on DCE with timing documented | ⬜ | Test log showing Option A recovery <15 minutes against DCE | Tyler + Dustin |

---

## Pillar Gate Findings

### Pillar 1 — Identity & Access

| ID | Finding | Status | Pass Criteria | Stale After |
|----|---------|--------|---------------|-------------|
| P1-1 | BCC has no all-user MFA (admin-only) | ⬜ | CA policy targeting all users exists and is enabled | 2026-05-26 |
| P1-2 | FN MFA is admin-only despite Megan's claim | ⬜ | CA policy targeting all users exists AND MFA registration ≥95% (B10) | 2026-05-26 |
| P1-3 | TLL MFA is group-scoped, group coverage unproven | ⬜ | `Get-MgReportCredentialUserRegistrationDetail` shows ≥95% registration | 2026-05-26 |
| P1-4 | HTT B2B External Franchisee Access policy still report-only | ⬜ | Policy state = `enabled` (not `enabledForReportingButNotEnforced`) | Phase 3 |
| P1-5 | Break-glass is MSP-owned, not customer-owned | ⬜ | Customer-owned FIDO2-key break-glass exists; MFA/CA exemptions removed | 2026-06-16 |

### Pillar 2 — Endpoint

| ID | Finding | Status | Pass Criteria | Stale After |
|----|---------|--------|---------------|-------------|
| P2-1 | Tyler + Dustin (GAs) have NO EDR | ⬜ | EDR deployed on IT director + ops lead devices, OR documented compensating control | 2026-05-26 |
| P2-2 | Personal-device EDR gap unenumerated | ⬜ | Megan provides device count with exclusions list | 2026-05-26 |

### Pillar 3 — Data

| ID | Finding | Status | Pass Criteria | Stale After |
|----|---------|--------|---------------|-------------|
| P3-1 | No M365 backup exists | ⬜ | Paid backup subscription active for Exchange, SharePoint, OneDrive, Teams | 2026-05-26 |
| P3-2 | No recovery testing performed | ⬜ | At least one restore-from-backup test completed and documented | 2026-06-16 |

### Pillar 4 — Network

| ID | Finding | Status | Pass Criteria | Stale After |
|----|---------|--------|---------------|-------------|
| P4-1 | No legacy auth block for external users in any tenant | ⬜ | CA policy blocks POP3/SMTP/IMAP/EAS for guestOrExternalUserTypes in all 5 tenants | 2026-05-26 |
| P4-2 | 5 stale partner policies still exist (Ingram, 2× TD SYNNEX, AppRiver, O365Support) | ⬜ | All 5 removed via `Remove-MgPolicyCrossTenantAccessPolicyPartner` | Phase 3 |
| P4-3 | O365Support-MSP-Connector in TLL uninvestigated | ⬜ | Investigation complete; SP disabled if not confirmed legitimate | 2026-05-19 |

### Pillar 5 — Application

| ID | Finding | Status | Pass Criteria | Stale After |
|----|---------|--------|---------------|-------------|
| P5-1 | Email-verified self-service join still enabled in all 5 tenants | ⬜ | `AllowEmailVerifiedUsersToJoinOrganization = false` in all 5 | Phase 2 |
| P5-2 | AppRiver SPs — disabled in dashboard, unverified in live tenants | ⬜ | Graph API confirms all 9 SPs disabled | 2026-05-19 |

### Pillar 6 — Governance

| ID | Finding | Status | Pass Criteria | Stale After |
|----|---------|--------|---------------|-------------|
| P6-1 | PAX8 holds Privileged Role Admin across all 5 tenants | ⬜ | Role removed from GDAP relationship | 2026-05-26 |
| P6-2 | PAX8 holds Privileged Authentication Admin across all 5 tenants | ⬜ | Reduced to Helpdesk Administrator | 2026-05-26 |
| P6-3 | No access reviews for guest/external users | ⬜ | Quarterly access review configured in at least HTT and TLL | 2026-06-16 |
| P6-4 | TLL has 534 guests (399 never signed in, 386 pending) | ⬜ | Stale guests disabled; pending >365d invitations revoked | 2026-06-16 |

### Pillar 7 — Monitoring

| ID | Finding | Status | Pass Criteria | Stale After |
|----|---------|--------|---------------|-------------|
| P7-1 | No Log Analytics workspace deployed | ⬜ | Entra audit logs routed to Log Analytics in at least HTT | 2026-05-26 |
| P7-2 | KQL queries exist on disk, fire nowhere | ⬜ | At least 3 KQL alerts deployed as scheduled queries | 2026-05-26 |
| P7-3 | Runbook references phantom alert `unexpected-crosstenancy-alert` | ⬜ | Alert exists in Log Analytics and fires end-to-end (verified via benign DCE change) | 2026-05-26 |
| P7-4 | No paging/notification integration | ⬜ | At least 1 alert wired to email/SMS for Tyler + Dustin | 2026-05-26 |

### Pillar 8 — Evidence

| ID | Finding | Status | Pass Criteria | Stale After |
|----|---------|--------|---------------|-------------|
| P8-1 | Insurance form overstates MFA ("all five tenants") | ⬜ | Corrected to "admin MFA in BCC/FN; all-user roadmap in progress" with target date | 2026-05-19 |
| P8-2 | Insurance form overstates EDR ("all company-owned endpoints") | ⬜ | Corrected to "N of M devices; exclusions attached" | 2026-05-19 |
| P8-3 | All evidence is self-produced (no third-party attestation) | ⬜ | SGI provides signed EDR/backup attestation; OR external auditor engaged | 2026-05-26 |
| P8-4 | Dashboard shows stale data (audit-data.js Franworth still critical) | ✅ | Fixed in A3.2 — marked resolved | Done |

---

## Cross-Cutting Blockers (must clear regardless of pillar)

| ID | Blocker | Detail | Clear Action |
|----|---------|--------|-------------|
| RG-001 | Phase 2 has never been executed | 24 of 27 operations at `WOULD_CHANGE`, zero `APPLIED` | Run `Invoke-Phase2QuickWins.ps1 -Execute` across all 5 tenants |
| RG-002 | Set-DenyByDefault ARCH-01 fix unproven | No fault-injection test for Phase B→C abort | Write Pester test; prove Phase C aborts on Phase B failure |
| RG-003 | Rollback snapshots don't exist | Option A requires `HTT_full-snapshot_*.json` | Run `Save-CTUPolicySnapshot.ps1` for all 5 tenants |
| RG-004 | MSP GDAP Privileged Role Admin | Phase 3 doesn't address GDAP; single MSP compromise = full portfolio takeover | Remove role from PAX8 GDAP before Phase 3 |
| RG-005 | Monitoring is decorative | 7 KQL queries on disk, 0 deployed; runbook references phantom alert | Deploy Log Analytics + alerts |

---

## Fastest Path to CONDITIONAL_PASS

Three items, <1 day of work:

1. **Execute Phase 2** — `Invoke-Phase2QuickWins.ps1 -Execute` across all 5 tenants (~1.5 hours)
2. **Save snapshots** — `Save-CTUPolicySnapshot.ps1` for all 5 tenants (~30 minutes)
3. **Remove PAX8 elevated roles** — Remove Privileged Role Admin; reduce Privileged Auth Admin to Helpdesk (~30 min + Megan conversation)

Complete these three and the gate moves from FAIL → CONDITIONAL_PASS (with remaining items as conditions to close during Phase 3 rollout).
