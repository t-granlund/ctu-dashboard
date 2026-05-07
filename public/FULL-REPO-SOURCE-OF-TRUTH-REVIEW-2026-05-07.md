# Full Repo Source-of-Truth Review — May 7, 2026

**Prepared for:** Tyler Granlund  
**Purpose:** Repo-by-repo operating map for the Tyler × Megan Sui Generis alignment call and post-call cleanup.  
**Scope:** Six local workspaces: Cross-Tenant Utility, DeltaSetup, Groups-Audit, AZURE-AUDIT-QUICK, microsoft-group-management, freshdesk-oracle.  
**Method:** Read-only local review of authoritative docs, inventories, ADRs, runbooks, current-state summaries, and dashboard source. No tenant-changing scripts were run.

---

## 0. Executive verdict

The repos make sense **if treated as a portfolio**, not as one app. Each repo owns a different slice of the Microsoft/operations ecosystem:

1. **Cross-Tenant Utility** is the live call/dashboard and cross-tenant identity source of truth.
2. **DeltaSetup** is the DCE model-tenant evidence base and lifecycle pilot workspace.
3. **Groups-Audit** is the standalone audit collector for distribution groups and M365 group governance.
4. **AZURE-AUDIT-QUICK** is a non-git evidence pack for Azure estate, cost gaps, and cyber-insurance posture.
5. **microsoft-group-management** is the production Groups Hub/access-request/Freshdesk-ticketing platform.
6. **freshdesk-oracle** is the People Support Hub/Freshdesk visibility and RBAC pilot platform.

The through-line is clear: **standardized Entra identity attributes drive access, support visibility, group governance, billing clarity, and repeatable onboarding/offboarding.**

The biggest risk is not technical impossibility. It is source-of-truth confusion: duplicated CTU folders, multiple historical dashboards, direct-bill vs CSP billing split, and several repos with overlapping “group audit” language.

---

## 1. Portfolio source-of-truth map

| Domain | Source of truth | Supporting repos | What not to use as canonical |
|---|---|---|---|
| May 7 Megan call package | `Cross-Tenant-Utility` root docs and dashboard | DeltaSetup, Groups-Audit, Azure audit, Groups Hub, PSH | Old DeltaSetup May 6 brief except as history |
| Cross-tenant identity architecture | `Cross-Tenant-Utility/HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md` | DCE runbook, DeltaSetup onboarding docs | Nested duplicate `dashboard/` copies |
| DCE current state | `DeltaSetup/docs/delta-crown-tenant-inventory-status.md` and DCE inventory summaries | CTU brief/runbook | Any claim that Teams inventory is complete |
| DCE onboarding/offboarding model | CTU `DCE-NEW-USER-RUNBOOK-V0.1...` plus DeltaSetup onboarding matrix | People Support Hub identity context | Free-text/manual group-add memory |
| Distribution/group audit architecture | `Groups-Audit/docs/adr/0001...` and `docs/architecture/groups-audit-architecture.md` | Groups Hub ADR-012/013 | Static dashboard JSON as final truth |
| Production access request workflow | `microsoft-group-management` | Freshdesk, Groups-Audit | Email-only access approvals |
| People/ticket support visibility | `freshdesk-oracle` | Groups Hub, CTU identity model | Freshdesk alone as context layer |
| Azure direct-bill estate | `AZURE-AUDIT-QUICK` evidence folders | Control Tower concept in CTU brief | Pax8 invoices alone; Azure still direct-bill |
| MSP/CSP billing policy | CTU May 7 brief + Megan Apr 13 answers | Azure audit, finance spreadsheets | Web Direct as future state |
| Security/insurance posture | CTU brief + Azure cyber audit + Megan Apr 13 answers | Freshdesk/Groups Hub security docs | March scorecard without later remediation context |

---

## 2. Dependency graph in plain English

```text
Entra identity attributes
  ├─> Dynamic groups / DLs / M365 groups
  │     ├─> SharePoint + Teams access
  │     ├─> Groups Hub permissions/access requests
  │     └─> Distribution-group governance audits
  ├─> People Support Hub RBAC and FBC location scope
  ├─> Freshdesk context and ticket routing clarity
  ├─> DCE onboarding/offboarding lifecycle
  └─> Finance/operations reporting by brand/location/role

Pax8 / CSP billing alignment
  ├─> Microsoft license consolidation
  ├─> renewal-date visibility
  ├─> Teams Premium / E5 / Extra Storage replacement
  └─> finance projected spend reporting

Azure direct-bill estate
  ├─> remains HTT-owned today
  ├─> needs budgets/tagging/cost export/control tower integration
  └─> should be reconciled separately from Pax8 licensing
```

---

## 3. Repo review — Cross-Tenant Utility

**Path:** `/Users/tygranlund/dev/03-personal/Cross-Tenant-Utility`  
**Role:** Active dashboard, May 7 call package, cross-tenant identity architecture, MSP/CSP working brief.

### Canonical files

- `HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md`
- `MEGAN-CALL-BRIEF-2026-05-07.md`
- `DCE-NEW-USER-RUNBOOK-V0.1-2026-05-07.md`
- `MEGAN-CALL-DECISION-LOG-2026-05-07.md`
- `docs/MEGAN-OVERVIEW-GUIDE-2026-05-07.md`
- `src/data/may-seven-update.js`
- `src/components/msp/MeganWarRoomOverview.jsx`

### What it proves

- HTT has a documented five-tenant hub-and-spoke architecture.
- Current default cross-tenant posture is too permissive and should move toward deny-by-default with explicit partner overrides.
- Megan’s Apr 13 answers close many MSP unknowns: ThreatDown, Atera, GDAP timeboxing, Pax8 policy, onboarding-checklist willingness, and backup/phishing pricing still needed.
- The dashboard is the published, call-ready mirror for Megan.

### Current state

- Active app is root-level Vite/React, not nested `dashboard/` copies.
- GitHub Pages dashboard is live at `https://t-granlund.github.io/ctu-dashboard/`.
- Dashboard uses a client-side passphrase only; treat it as public-ish.
- May 7 war-room panel and overview guide are live.

### Risks / cleanup

| Risk | Severity | Action |
|---|---:|---|
| Recursive `dashboard/dashboard/...` duplicates create source-of-truth confusion | High | Post-call cleanup issue; do not touch before call unless scoped |
| bd command mismatch (`sync` unavailable) | Medium | Decide bd version/workflow; current final tracking can stay in markdown |
| Dashboard security is convenience-only | High | Do not place secrets; consider private/auth hosting if reused externally |
| Audit freshness is Apr 20/23, not May 7 | Medium | Re-run full CTU audit post-call |

---

## 4. Repo review — DeltaSetup

**Path:** `/Users/tygranlund/dev/04-other-orgs/DeltaSetup`  
**Role:** DCE model-tenant evidence base and lifecycle pilot workspace.

### Canonical files

- `docs/delta-crown-tenant-inventory-status.md`
- `docs/delta-crown-identity-inventory-summary.md`
- `docs/delta-crown-sharepoint-inventory-summary.md`
- `docs/delta-crown-sharepoint-pnp-inventory-summary.md`
- `docs/delta-crown-exchange-inventory-summary.md`
- `docs/delta-crown-security-policy-confirmation.md`
- `docs/master-dce-audit-findings.md`
- `docs/master-dce-resource-map.md`
- `docs/onboarding/dce-attribute-group-resource-matrix.md`
- `docs/onboarding/dce-offboarding-deprovisioning-checklist.md`

### What it proves

- DCE is far enough along to be a real reference implementation, not a slideware idea.
- SharePoint, Exchange, security policy, identity, and resource mapping evidence exists.
- Master DCE source folder was audited read-only and mapped into cleaner lanes: Operations, Brand Resources, Marketing, Docs/Training, Leadership/Finance Restricted, Corporate Reference, Archive.
- DCE attribute → group → resource mapping is documented and aligns with the CTU runbook.

### Current state

- DCE inventory is substantially complete for accessible read-only scopes.
- Teams/channel inventory is blocked by current delegated context/license state.
- User metadata is incomplete: `companyName`, `department`, `jobTitle`, `employeeType` gaps are documented.
- Dynamic groups exist, but role-specific groups are mostly empty until attributes are normalized.
- Duplicate `Delta Crown Extensions` M365 groups require Teams dependency review before cleanup.
- Security defaults/admin consent request states are documented; CA/security governance still matters before production-readiness claims.

### Megan-relevant message

DCE is the best place to validate the future operating model:

1. collect canonical new-user fields;
2. set normalized Entra attributes;
3. let dynamic groups populate;
4. have SharePoint/Teams/mailbox/license access follow groups;
5. offboard by disabling identity and clearing access state.

### Risks / cleanup

| Risk | Severity | Action |
|---|---:|---|
| Teams inventory blocked | High | Megan/Sui Generis or Tyler provides licensed Teams-readable context or owner attestation |
| Metadata incomplete | High | Normalize attributes before claiming role groups are operational |
| Duplicate DCE groups | Medium | Review Teams dependencies before rename/delete |
| Broad inherited ClientServices permissions | Medium | Owner-approved cleanup after access matrix finalized |
| DLP/Purview policy detail not fully consolidated | Medium | Post-call gap review |

---

## 5. Repo review — Groups-Audit

**Path:** `/Users/tygranlund/dev/Groups-Audit`  
**Role:** Standalone multi-tenant Microsoft 365 groups/distribution-groups audit collector.

### Canonical files

- `scripts/README.md`
- `docs/adr/0001-comprehensive-multi-tenant-groups-audit.md`
- `docs/architecture/groups-audit-architecture.md`
- `docs/planning/groups-audit-expansion-plan.md`
- `scripts/Get-StoreManagerDistros.ps1`
- `scripts/Get-AllGroupsAudit.ps1`

### What it proves

- Narrow store-manager distribution-list collector is production-tested.
- Comprehensive collector is architected and built for hybrid Graph + Exchange Online coverage.
- ADR-0001 is accepted and STRIDE-reviewed for Phase 1.
- Collector design correctly separates Graph vs EXO source-of-truth fields.

### Current state

- Phase 0: production-tested narrow collector.
- Phase 1: comprehensive collector built; smoke run pending.
- Phase 2: app-only auth, per-tenant certs, scheduled runs, and DCE onboarding not started.
- Phase 3: dashboard API contract / signed bundles not started.

### Why it matters to Megan

Distribution lists and Microsoft 365 groups are not just “email things.” They determine who receives operational messages, who owns communication channels, whether external senders can reach groups, and where stale ownership creates risk.

### Risks / cleanup

| Risk | Severity | Action |
|---|---:|---|
| Phase 1 smoke pending | High | Run after call with correct interactive auth windows |
| DCE blocked until app-only/native admin path | High | Coordinate with Sui Generis if DCE tenant admin help is needed |
| Member-level exports contain PII | High | Keep outputs gitignored/local; share summary only |
| DDG membership is snapshot only | Medium | Label clearly; do not treat as authoritative membership |

---

## 6. Repo review — AZURE-AUDIT-QUICK

**Path:** `/Users/tygranlund/dev/01-htt-brands/AZURE-AUDIT-QUICK`  
**Role:** Non-git Azure estate and cyber-insurance evidence pack.

### Canonical files

- `azure-audit-20260403-145806/audit-report.md`
- `audit-evidence-2026-03-10/FINDINGS_REPORT.md`
- `audit-evidence-2026-03-10/SCORECARD.md`
- `HTT-Brands-Azure-Cyber-Insurance-Audit.md`
- `azure-cost-export.ps1`
- `Run-CyberInsuranceAudit.ps1`

### What it proves

- HTT has multiple Azure subscriptions/resource groups outside Pax8 licensing invoices.
- Azure direct-bill visibility is a separate finance problem from Microsoft 365 CSP licensing.
- Historical insurance posture had major gaps around MFA, backup, EDR attestation, phishing/security training, password-never-expires, and Frenchies/Crown CA.
- Later Megan/CTU evidence supersedes some March findings, especially around DCE/FN CA state.

### Current state

- Folder is not a git repo; treat as evidence/scratch pack.
- Audit found multiple subscriptions including HTT-CORE, HTT-FABRIC-PROD, Dev/Test, HTT-Web-Integrations, BCC-CORE, and other Azure subscription records.
- Cost Management output has gaps; budgets were not configured in several scopes at audit time.
- Cyber-insurance scorecard from March should not be quoted without May context.

### Megan-relevant message

Azure spend is still HTT-owned/direct-bill today. Pax8/Sui Generis licensing invoices will not, by themselves, give finance the full Microsoft run-rate. Tyler needs a clean view that separates:

- Azure direct-bill subscriptions;
- Microsoft Web Direct subscriptions being retired;
- Pax8 CSP licensing;
- backup/phishing/security add-ons.

### Risks / cleanup

| Risk | Severity | Action |
|---|---:|---|
| Non-git evidence pack can drift silently | Medium | Either archive snapshot or move sanitized summaries into CTU/control tower docs |
| Budgets/tag coverage incomplete | High | Add budgets/tags/cost exports for finance forecasting |
| March insurance findings partly stale | Medium | Reconcile with Apr/May CA remediation and Megan attestation |
| Azure payment-method reminder unresolved | Medium | Tyler verifies payment method |

---

## 7. Repo review — microsoft-group-management / Groups Hub

**Path:** `/Users/tygranlund/dev/01-htt-brands/microsoft-group-management`  
**Role:** Production Groups Hub, access request workflow, Freshdesk ticketing, Distribution Access dashboard evolution.

### Canonical files

- `docs/CURRENT-STATE-SUMMARY.md`
- `docs/FRESHDESK-INTEGRATION.md`
- `docs/adr/ADR-012-distribution-access-overview-data-pipeline.md`
- `docs/adr/ADR-013-group-audit-snapshot-store-and-scheduled-collector.md`
- `docs/runbooks/group-audit-collection.md`
- `docs/deployment/ci-cd-pipeline-overview.md`
- `docs/deployment/oidc-identity-status.md`

### What it proves

- Groups Hub is production-grade enough to be part of the operating model.
- Production URL: `https://groups-hub.httbrands.com`.
- Freshdesk ticket creation for access requests is active.
- Access requests route to HTT IT Support L1 group `156000256998`.
- The system has RBAC/persona design, release evidence, CI/CD hardening, and auth split.
- Distribution Access Overview is evolving from static JSON toward scheduled Graph+EXO collector snapshots.

### Current state

- Version/current-state doc reports 7,965 tests, zero TypeScript errors, zero prod npm audit vulnerabilities at that snapshot.
- Production Graph/runtime auth is split from SWA browser auth.
- Runtime Graph app is zero-password; SWA browser-auth credential and SAS/package access remain tracked debt.
- ADR-012/013 define group audit snapshot ingestion and scheduled refresh, but live Graph+EXO collection still runs out-of-band.

### Megan-relevant message

Groups Hub is not asking Megan to use a weird side system instead of Freshdesk. It creates structured requests and pushes them into Freshdesk, preserving the ticket trail while adding identity/access context.

### Risks / cleanup

| Risk | Severity | Action |
|---|---:|---|
| Static snapshot vs live collector distinction can confuse stakeholders | Medium | Label freshness and source clearly |
| Live Graph+EXO collector still out-of-band | Medium | Align Groups-Audit output with Groups Hub snapshot contract |
| SWA credential / SAS package access debt | Medium | Keep tracked; do not claim full zero-secret platform |
| Product ID mapping may need DCE/Freshdesk review | Low/Medium | Confirm support routing taxonomy with ops/Megan |

---

## 8. Repo review — freshdesk-oracle / People Support Hub

**Path:** `/Users/tygranlund/dev/01-htt-brands/freshdesk-oracle`  
**Role:** People Support Hub / Freshdesk Oracle, FBC ticket visibility, escalation routing, identity-context UX.

### Canonical files

- `people-support-hub-plan.md`
- `docs/CURRENT-STATE.md`
- `docs/IDENTITY-CONTEXT-UX-SPEC.md`
- `docs/RBAC-UAT-MATRIX.md`
- `docs/FRESHDESK-PROVENANCE-FRESHNESS-SPEC.md`
- `docs/RUNBOOK-internal-pilot.md`
- `docs/SECURITY-GATES.md`

### What it proves

- People Support Hub is an Azure + SSO visibility layer over Freshdesk data.
- Freshdesk remains the system of record.
- PSH adds role-based views for FBCs and escalation partners.
- Identity context is a first-class UX concept: brand, tenant, location, relationship, permission scope, provenance, freshness.
- Scoped RBAC and stale-sync protections are implemented enough for internal-pilot progression, but final readiness still has blockers.

### Current state

- Live deployment exists at `https://green-beach-0dad91a0f.2.azurestaticapps.net`.
- API health through SWA returns healthy in current-state evidence.
- SQL is serverless/auto-pause; cost posture is intentionally constrained.
- Ticket freshness/provenance and stale-write protection are deployed.
- Final pilot gate blocked on Jennifer FBC/TLL real-session evidence, privacy signoff/waiver, SQL/network posture approval, and CAB/Tyler approval.

### Megan-relevant message

Megan can still be copied on Freshdesk tickets and respond by email/Freshdesk. PSH is the layer that makes those requests richer: who is asking, what brand/location they belong to, whether data is stale, and why a person can see or act on a ticket.

### Risks / cleanup

| Risk | Severity | Action |
|---|---:|---|
| Entra user audit/attribute cleanup is blocker | High | Reuse DCE canonical attributes across PSH identity context |
| Privacy/CPRA signoff pending | High | Do not broaden personas before approval |
| Jennifer FBC live validation pending | High | Complete final pilot receipt |
| SQL/network cost/security tradeoff needs CAB/Tyler decision | Medium | Accept no-cost posture or approve paid private networking |

---

## 9. MSP/CSP/Pax8 billing source-of-truth map

| Billing bucket | Current owner of clarity | Current state | Megan ask |
|---|---|---|---|
| Pax8 CSP licensing | Sui Generis / Megan | Desired future state for all Microsoft licensing | Confirm SKUs, terms, renewal alignment, invoice/export/API options |
| AppRiver | Being removed | AppRiver migration reportedly complete, but Apr 27 transfer needs confirmation | Confirm transfer ID scope and action before May 27 |
| Microsoft Web Direct | HTT/Tyler, being sunset | E5 and Extra Storage expired intentionally; Teams Premium lapsed | Confirm Pax8 replacements and coverage gaps |
| Azure subscriptions | HTT/Tyler direct-bill | Multiple subscriptions/resource groups; not fully folded into Pax8 view | Finance-ready current/projected Azure spend view, or confirm outside Pax8 scope |
| Backup/phishing | Sui Generis pricing needed | No paid M365 backup confirmed; phishing pricing still needed | Pricing/options and timeline |
| Insurance attestation | Sui Generis provides facts; Tyler sends to CFO | ThreatDown/Atera known; written statement still needed | Written EDR/patch/firewall/backup attestation |

Key call question: **Does Megan have Pax8 API access, invoice export, or reporting access that can feed finance reconciliation and projected spend?**

---

## 10. Unified identity source-of-truth model

Use this as the canonical vocabulary across DCE, PSH, Groups Hub, and future brand onboarding.

| Canonical field | Purpose | Primary consumers |
|---|---|---|
| `htt_brand` / brand label | Brand boundary | Dynamic groups, PSH scopes, finance, Freshdesk routing |
| `htt_role` / canonical role | Role-based access | DCE groups, Groups Hub RBAC, PSH persona scope |
| `htt_region` | Regional reporting/scope | FBC views, ops dashboards, location grouping |
| `htt_location_ids` | Location/studio/salon relationship | PSH, Freshdesk context, DCE location access |
| `htt_access_tier` | Standard/elevated/privileged/disabled | onboarding/offboarding, PIM/admin controls |
| `employeeType` | employee/partner/test/service distinction | lifecycle, security policy, pilot safety |
| `manager` | workflow approval/escalation | onboarding/offboarding, support context |

Do not let free-text job titles become the access-control system. That way lies sadness, duplicates, and “why can the intern see finance?” energy.

---

## 11. What Megan should see vs. what stays internal

### Safe to screen-share / discuss

- CTU dashboard war-room panel.
- `MEGAN-OVERVIEW-GUIDE-2026-05-07.md`.
- DCE model-tenant status and runbook concepts.
- High-level repo source map.
- Groups-Audit concept and output categories.
- Groups Hub/People Support Hub purpose.
- Billing questions and owner/date table.

### Keep internal or sanitized

- Raw audit CSV/JSON outputs containing users, permissions, members, owners, or tenant object details.
- Secrets, API keys, cert/thumbprint pairs, tenant admin commands.
- Full local paths if sending externally, unless intentionally using as Tyler’s internal evidence map.
- Live tenant-changing scripts.
- Nested duplicate repo cleanup details unless she asks about tooling hygiene.

---

## 12. Prioritized post-call cleanup backlog

| Priority | Task | Repo | Why |
|---|---|---|---|
| P0 | Capture Megan owner/date decisions in decision log | CTU | Prevent “great call, no owners” syndrome |
| P0 | Confirm Pax8 transfer, replacement SKUs, invoice/API/export | CTU / finance | Billing exposure and finance forecast |
| P0 | Validate DCE runbook v0.1 with Megan | CTU + DeltaSetup | Main lifecycle unblock |
| P0 | Get backup/phishing pricing and insurance attestation | CTU / Azure audit | CFO/compliance requirement |
| P1 | Re-run CTU full audit | CTU | Fresh post-call baseline |
| P1 | Run Groups-Audit Phase 1 smoke | Groups-Audit | Convert built collector into evidence |
| P1 | Resolve DCE Teams-readable context blocker | DeltaSetup | Complete tenant inventory |
| P1 | Normalize DCE user metadata | DeltaSetup | Make dynamic groups operational |
| P1 | Decide Azure budget/tag/cost-export workflow | AZURE-AUDIT-QUICK / future Control Tower | Finance forecast and accountability |
| P1 | Align Groups-Audit output with Groups Hub snapshot contract | Groups-Audit + MGM | One group-governance data path |
| P1 | Complete PSH identity/RBAC pilot blockers | freshdesk-oracle | Safe support visibility rollout |
| P2 | Clean CTU nested dashboard duplicates | CTU | Source-of-truth hygiene |
| P2 | Decide dashboard hosting/auth posture | CTU | Public-ish dashboard risk |
| P2 | Migrate or standardize bd issue tracking | all | Current bd behavior differs across repos |

---

## 13. Final call framing

Use this with Megan:

> “I want us aligned on the operating model. HTT owns the infrastructure architecture and source-of-truth identity model. Sui Generis helps operationalize that through Pax8/CSP licensing, device management, EDR, backup, and support workflows. Delta Crown is the reference tenant where we can validate the lifecycle before scaling it across the brands.”

Then close with:

> “Before we drop, I want to read back owners and dates so I don’t misrepresent anything.”

---

## 14. Review limitations

This was a deep local repo/document review, not a live tenant audit. No Microsoft, Pax8, Freshdesk, Azure, or Sui Generis systems were changed. Claims should be treated as evidence-backed from local docs unless explicitly marked as needing Megan confirmation.

The correct next step after the call is to turn decisions into issues/tasks and refresh the actual tenant/audit evidence.
