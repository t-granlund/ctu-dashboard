# Claude Co-Work Session Guide — CTU Directory Sense-Check

**Date prepared:** 2026-05-06  
**Repo:** `/Users/tygranlund/dev/03-personal/Cross-Tenant-Utility`  
**Prepared for:** Tyler Granlund  
**Purpose:** Give Claude a complete, bounded, end-to-end guide for reviewing this directory and validating that the repo structure, dashboard, call-prep artifacts, audit docs, and follow-up flow all make sense.

---

## 0. Copy/paste prompt for Claude

Use this first if you want a clean Claude co-work kickoff:

```text
You are helping me review the Cross-Tenant-Utility repo at:
/Users/tygranlund/dev/03-personal/Cross-Tenant-Utility

Your job is NOT to rewrite everything. Your job is to inspect the directory, understand what is active vs stale, and tell me whether the repo makes sense after the May 7 Megan-call prep work.

Primary goals:
1. Confirm the active dashboard source is the repo root (`src/`, root `package.json`, root `vite.config.js`) and NOT the nested `dashboard/` copies.
2. Confirm the May 7 call package is coherent:
   - `MEGAN-CALL-BRIEF-2026-05-07.md`
   - `DCE-NEW-USER-RUNBOOK-V0.1-2026-05-07.md`
   - `MEGAN-CALL-DECISION-LOG-2026-05-07.md`
   - `docs/audits/2026-05-06-may7-call-readiness/`
3. Confirm the dashboard reflects the same story as the markdown docs:
   - May 7 top status panel
   - Megan Apr 13 answers inline
   - Delta Crown as model tenant / reference implementation
   - BCC Business Basic October 2026 anchor
   - Web Direct → Pax8 CSP migration status
4. Identify contradictions, stale files, naming confusion, security/process risks, and docs that could mislead Tyler or Megan.
5. Produce a concise review with: PASS / CONCERN / RECOMMENDATION for each finding.

Hard constraints:
- Do not run remediation scripts.
- Do not modify files unless I explicitly ask.
- Do not touch nested duplicate `dashboard/dashboard/...` trees except to identify them as stale artifacts.
- Treat `bd` as currently broken/stranded on legacy SQLite; do not attempt migration unless I explicitly ask.
- Treat the GitHub Pages dashboard as a public-ish visual aid, not real secure auth.

Expected output:
1. Repo map: active areas vs stale/duplicate areas.
2. Call package coherence review.
3. Dashboard/data consistency review.
4. Risk register: security, process, stale data, duplicate source trees.
5. Specific recommended cleanup tasks, ordered by priority.
6. Any questions you need Tyler to answer before cleanup.
```

---

## 1. Why this review matters

This repo just had a fast, high-impact prep cycle for Tyler's May 7, 2026 call with Megan Myrand at Sui Generis.

The work produced:

- an updated GitHub Pages dashboard,
- a May 7 call brief,
- a DCE new-user runbook v0.1,
- a live decision log,
- an audit folder with second opinions and quality gates,
- and a bunch of context about billing, cross-tenant readiness, and Delta Crown as the reference implementation.

The repo now needs a calm second pass to answer:

> Does the directory still make sense, or did we create a well-intentioned raccoon nest?

---

## 2. Current known-good state

### Git state at guide creation

Latest commits:

```text
08b6358 feat: add DCE runbook and decision log for Megan call
b90c245 chore: audit May 7 call package and tighten dashboard readiness
eb3f919 feat(dashboard): surface Megan's Apr 13 written responses inline
1c99af3 feat: refresh state for May 7 Megan call (brief + dashboard update)
895dc49 feat: add CA export script for insurance verification
```

Working tree was clean before creating this guide.

### Dashboard

Live URL:

```text
https://t-granlund.github.io/ctu-dashboard/
```

Important security/process note:

- The dashboard uses a client-side password gate.
- The repo is effectively public-facing via GitHub Pages.
- Treat the dashboard as a visual aid / shared reference, **not** real secure access control.

### Quality gates from last prep cycle

Before this guide was created:

```text
npm run build              # passed
npm test -- --reporter=list # 52/52 passed
```

Latest verified live dashboard bundle at the time:

```text
main-BoRju-Af.js
```

---

## 3. High-level repo map

### Active root-level dashboard app

These are the active dashboard sources:

```text
package.json
package-lock.json
vite.config.js
index.html
architecture.html
src/
public/
tests/
playwright.config.js
```

Key active source files:

```text
src/App.jsx
src/components/MSPWalkthrough.jsx
src/components/msp/MaySevenUpdate.jsx
src/components/msp/MeganResponseForm.jsx
src/components/msp/ConfirmedContext.jsx
src/components/msp/PostCallSummary.jsx
src/components/msp/BillingLandscape.jsx
src/data/msp-data.js
src/data/may-seven-update.js
src/data/megan-questions.js
src/data/audit-data.js
```

### Active May 7 call artifacts

```text
MEGAN-CALL-BRIEF-2026-05-07.md
DCE-NEW-USER-RUNBOOK-V0.1-2026-05-07.md
MEGAN-CALL-DECISION-LOG-2026-05-07.md
```

### Active review/audit folder

```text
docs/audits/2026-05-06-may7-call-readiness/
  QUALITY-GATES.md
  READINESS-AUDIT.md
  SECOND-OPINIONS.md
```

### Core historical/analysis context

```text
HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md
msp-responses-megan-2026-04-13.md
megan-tyler-transcript-4-10
reports/MEGAN-CALL-PREP.md
reports/MSP-CALL-BRIEFING.md
reports/POST-CALL-SUMMARY-2026-04-10.md
reports/PHASE-1-CONSOLIDATED-ANALYSIS.md
reports/COMPREHENSIVE-END-TO-END-AUDIT-2026-04-20.md
reports/MFA-VERIFY-2026-04-23.md
reports/CFO-Cyber-Insurance-Response-2026-04-23.md
```

### PowerShell audit/remediation tooling

Read-only audit scripts:

```text
scripts/Test-Configuration.ps1
scripts/Invoke-FullAudit.ps1
scripts/Invoke-DomainAudit.ps1
```

Important warning:

- Do **not** run remediation scripts during a directory review.
- The review is structural and documentary, not a tenant-changing operation.

---

## 4. Known confusing areas Claude should inspect carefully

### 4.1 The nested `dashboard/` folder is stale / duplicate

There is a `dashboard/` folder that itself contains what looks like another full copy of the project:

```text
dashboard/package.json
dashboard/src/
dashboard/dashboard/
dashboard/dashboard/dashboard/...
```

This is believed to be an artifact of a previous recursion/copy bug.

Claude should verify and report:

- whether root `package.json` + root `vite.config.js` are the active build/deploy path,
- whether `dashboard/` is stale,
- whether any active import references `dashboard/`,
- whether cleanup should be filed as follow-up rather than done immediately.

Current evidence strongly suggests:

- active app = repo root,
- active deploy = root `npm run deploy`,
- `dashboard/` should be ignored until a deliberate cleanup task.

### 4.2 `bd` issue tracking is stranded

`.beads/` exists, but current `bd` CLI reports no usable database because the workspace appears to be on the legacy SQLite backend while current bd expects Dolt.

Known state:

```text
.beads/beads.db
.beads/issues.jsonl
```

Do not attempt migration during a review unless Tyler explicitly asks.

The follow-up list currently lives in markdown:

```text
MEGAN-CALL-BRIEF-2026-05-07.md
MEGAN-CALL-DECISION-LOG-2026-05-07.md
```

### 4.3 The dashboard password is not real security

Claude should not treat the dashboard passphrase as secure. It is client-side and should be considered convenience gating only.

Review should recommend one of:

- live-share only,
- privatize repo / rotate passphrase / move to real auth,
- accept dashboard as public-ish and avoid sensitive content.

### 4.4 Audit freshness is intentionally deferred

Fresh full audit was not rerun for the May 7 call. The brief is anchored on:

```text
reports/COMPREHENSIVE-END-TO-END-AUDIT-2026-04-20.md
reports/Audit_ConditionalAccess_2026-04-23_VERIFY/
reports/MFA-VERIFY-2026-04-23.md
```

Claude should verify the docs state that clearly and do not pretend the audit is from May 7.

---

## 5. What changed recently and why

### Commit `1c99af3`

Added May 7 call brief and dashboard top update.

Key outcomes:

- May 7 brief created at repo root.
- Dashboard got `MaySevenUpdate` top section.
- Billing migration state added.
- Delta Crown positioned as model/reference tenant.

### Commit `eb3f919`

Integrated Megan's Apr 13 answers into the dashboard.

Key outcomes:

- All 20 questions in `megan-questions.js` got `apr13Answer` fields.
- `MeganResponseForm.jsx` displays those answers inline.
- The form still allows updates/corrections.

### Commit `b90c245`

Full readiness audit + polish.

Key outcomes:

- Added audit folder.
- Added live call run sheet to the brief.
- Changed Megan-facing wording from “golden child” to “model tenant/reference implementation.”
- Standardized BCC timing.
- Improved accessibility.
- Fixed Playwright tests.

### Commit `08b6358`

Added the strongest call artifacts.

Key outcomes:

- Added `DCE-NEW-USER-RUNBOOK-V0.1-2026-05-07.md`.
- Added `MEGAN-CALL-DECISION-LOG-2026-05-07.md`.
- Wired both into brief/dashboard/audit.

---

## 6. What Claude should review in detail

### 6.1 Markdown call package coherence

Review these together:

```text
MEGAN-CALL-BRIEF-2026-05-07.md
DCE-NEW-USER-RUNBOOK-V0.1-2026-05-07.md
MEGAN-CALL-DECISION-LOG-2026-05-07.md
docs/audits/2026-05-06-may7-call-readiness/READINESS-AUDIT.md
```

Questions to answer:

1. Does the brief lead with a usable live run sheet?
2. Does the DCE runbook match the architecture described in the brief?
3. Does the decision log capture the same owners/dates as the brief follow-up table?
4. Are there conflicting claims between the audit doc and the brief?
5. Is anything too technical for a vendor call with Megan?
6. Are repo/tooling details clearly separated from live-call content?

### 6.2 Dashboard / markdown consistency

Review these dashboard files:

```text
src/data/may-seven-update.js
src/data/megan-questions.js
src/data/msp-data.js
src/components/msp/MaySevenUpdate.jsx
src/components/msp/MeganResponseForm.jsx
src/components/msp/ConfirmedContext.jsx
src/components/msp/PostCallSummary.jsx
```

Compare against:

```text
MEGAN-CALL-BRIEF-2026-05-07.md
DCE-NEW-USER-RUNBOOK-V0.1-2026-05-07.md
MEGAN-CALL-DECISION-LOG-2026-05-07.md
```

Questions to answer:

1. Does the dashboard tell the same story as the brief?
2. Are Megan's Apr 13 answers accurately reflected and not over-interpreted?
3. Is BCC timing consistent everywhere?
4. Is Delta Crown described consistently as model/reference tenant?
5. Does the dashboard still contain older April 10 action items that might confuse Megan?
6. Should any old content be collapsed, renamed, or labelled historical?

### 6.3 Tests and quality gates

Review:

```text
tests/dashboard.spec.js
tests/visual-audit.spec.js
playwright.config.js
```

Expected current behavior:

- Password gate tests pass.
- MSP Portal tests pass.
- Questions form starts at 20/20 answered because Apr 13 answers are embedded.
- Reference Material tests use role-based locators where possible.
- Visual sanity tests pass.

Recommended commands:

```bash
npm run build
npm test -- --reporter=list
```

### 6.4 Deployment path

Review:

```text
package.json
vite.config.js
```

Expected deploy flow:

```bash
npm run deploy
```

Which runs:

```text
predeploy -> npm run build
deploy    -> gh-pages -d dist
```

Expected Vite base:

```js
base: '/ctu-dashboard/'
```

Claude should verify that active deployment is root-level and not `dashboard/`.

---

## 7. Key factual anchors Claude should preserve

### Call

- Tyler/Megan Review Tenants call moved to **May 7, 2026 at 1:15 PM CT**.

### Billing

- Microsoft case: `TrackingID#2604020040000719`
- Web Direct → CSP requires cancel + repurchase.
- Pax8→AppRiver transfer ID: `acd7573e-a487-41d9-83ce-560dea432e95`
- Transfer expires: **2026-05-27**
- HTT M365 E5 (no Teams) expired: **2026-05-03**
- Office 365 Extra File Storage expired: **2026-05-04**
- Teams Premium 25 seats lapsed around Apr 2 and needs SKU/term decision.
- BCC Business Basic expires **October 2026**; other renewals may still need confirmation.

### Megan Apr 13 answers

- 20/20 questions answered.
- ThreatDown is EDR, separate from Atera.
- No paid M365 backup currently; Megan owes pricing.
- Sui Generis MFA enforced via its own CA policies.
- Admin accounts are individual, not shared.
- Atera requires no tenant API.
- Ingram Micro and O365Support connector in TLL are safe to disable.
- Megan will follow a new-user checklist if Tyler provides it.

### Delta Crown / DCE

- DCE is the model tenant / reference implementation.
- Tenant security hardened live Apr 29.
- Phase 2 and Phase 3 SharePoint/Teams/DLP work deployed.
- Dynamic security groups exist and are waiting for attribute-driven population.
- ABM/MDM is blocked on DUNS.
- Spoke-side auto-redeem still needs Sui Generis action.
- New-user runbook v0.1 now exists.

---

## 8. Recommended review output format

Claude should produce a report like this:

```md
# CTU Directory Sense-Check Report

## Executive summary
- Overall verdict: PASS / PASS WITH CONCERNS / FAIL
- Most important finding:
- Most important cleanup:

## Repo map
| Area | Active? | Notes |
|---|---:|---|

## Call package review
| Artifact | Verdict | Notes |
|---|---:|---|

## Dashboard consistency review
| Claim | Brief | Dashboard | Verdict |
|---|---|---|---|

## Risks
| Risk | Severity | Recommendation |
|---|---:|---|

## Cleanup backlog
| Priority | Task | Why | Suggested owner |
|---|---|---|---|

## Questions for Tyler
1.
2.
3.
```

---

## 9. Suggested cleanup backlog Claude will probably find

Claude should validate these rather than assume them:

| Priority | Task | Why |
|---|---|---|
| P0 | Decide dashboard sharing posture: live-share vs send URL vs real auth | Public repo + client-side password gate |
| P0 | Migrate bd SQLite-era workspace to Dolt | Follow-up tracking currently stranded |
| P1 | Clean up nested `dashboard/dashboard/...` duplicate folders | Avoid future source-of-truth confusion |
| P1 | Run fresh CTU full audit post-call | Current anchor is Apr 20/23 |
| P1 | Convert decision log outcomes into bd issues after call | Durable follow-up |
| P1 | Finalize DCE runbook after Megan validation | Main lifecycle artifact |
| P2 | Add a proper repo architecture README section | Make active vs stale paths obvious |
| P2 | Move dashboard hosting to real auth if it remains externally shared | Security posture |

---

## 10. Important warnings for Claude

Do not modify these unless Tyler explicitly asks:

```text
AGENT.md
AGENTS.md
SKILL.md
```

Do not run tenant-changing scripts.

Do not clean nested dashboard folders during the review unless Tyler explicitly says cleanup is in scope.

Do not treat the current bd setup as healthy.

Do not assume the dashboard is confidential just because it asks for a passphrase.

Do not reintroduce “golden child” in Megan-facing copy. Use:

```text
model tenant
reference implementation
first clean implementation
```

---

## 11. End-state desired from the Claude session

By the end of the co-work session, Tyler should know:

1. Which folders/files are active.
2. Which folders/files are stale or duplicate.
3. Whether the brief, dashboard, runbook, decision log, and audit docs agree.
4. What risks are real vs theoretical.
5. What cleanup should happen after the Megan call.
6. What should **not** be touched before the call.

The goal is not perfection. The goal is coherence, confidence, and not accidentally stepping on a rake at 1:15 PM tomorrow.
