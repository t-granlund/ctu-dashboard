# Readiness Audit — May 7 Megan Call Package

**Prepared by:** Richard (`code-puppy-b3f2eb`)  
**Audit date:** 2026-05-06  
**Call:** Tyler Granlund × Megan Myrand, May 7 2026, 1:15 PM CT  
**Dashboard:** https://t-granlund.github.io/ctu-dashboard/  
**Brief:** `MEGAN-CALL-BRIEF-2026-05-07.md`

## Executive verdict

**Status: GO for call use, with one operating constraint.**

Use the dashboard as a **live reference / shared visual aid**, not as a secure document portal. The repo is public and the password gate is client-side, so the URL+passphrase should not be treated as confidential security. The brief is the call-control source of truth; the dashboard is the supporting visual.

## What changed during this audit

| Area | Change |
|---|---|
| Brief | Added section 0 live call run sheet: goal, five decisions, owner read-back, talk tracks |
| Brief | Changed Megan-facing “golden child” wording to “model tenant / reference implementation” |
| Brief/dashboard | Standardized BCC timing: Business Basic expires October 2026; other renewals may need confirmation |
| Brief | Removed passphrase from Sources; says shared separately |
| Dashboard | Split May 7 update data into `src/data/may-seven-update.js` for cleaner ownership |
| Dashboard | Changed “tomorrow’s session” → “this session” |
| Dashboard | Added accessibility labels to Megan response form controls |
| Dashboard tests | Updated brittle strict-text tests to role-based/reference-specific locators |
| Dashboard tests | Updated progress expectation to 20/20 answered due Apr 13 inline answers |

## Current artifacts

| Artifact | Purpose | Status |
|---|---|---|
| `MEGAN-CALL-BRIEF-2026-05-07.md` | Tyler live-call source of truth | ✅ Ready |
| `src/components/msp/MaySevenUpdate.jsx` | Top dashboard status section | ✅ Ready |
| `src/data/may-seven-update.js` | May 7 call status data | ✅ Ready |
| `src/data/megan-questions.js` | Apr 13 answers embedded inline | ✅ Ready |
| `src/components/msp/MeganResponseForm.jsx` | Displays Apr 13 answers + optional updates | ✅ Ready |
| `tests/dashboard.spec.js` | Playwright regression checks | ✅ Updated and green |

## Quality gate summary

See `QUALITY-GATES.md` for command output summary.

- ✅ `npm run build` passed
- ✅ `npm test -- --reporter=list` passed — 52/52
- ✅ No remediation scripts were run
- ✅ Fresh audit remains deferred and documented

## Material risks still open

| Risk | Severity | Call impact | Recommendation |
|---|---:|---|---|
| Public repo + client-side password gate | High | URL is not truly confidential | Prefer live-share; if sending URL, treat as effectively public |
| bd workspace migration | Medium | Follow-up issues cannot be filed yet | Use brief table as temporary source; migrate bd post-call |
| Full CTU audit not rerun | Medium | Data is 14–17 days old | State audit anchor clearly if asked; rerun post-call |
| DCE new-user runbook not yet drafted | Medium | Main collaboration ask is still conceptual | Draft v0.1 before call if time permits |
| Dashboard content density | Low/Medium | Megan may scroll into older sections | Use top May 7 update and brief run sheet as canonical live path |

## Recommended call-day operating mode

1. Open `MEGAN-CALL-BRIEF-2026-05-07.md` and use **Section 0** as the call run sheet.
2. Open the dashboard only as visual support for the May 7 status panel and Megan's Apr 13 answers.
3. Do not start with repo/tooling/bd details unless asked.
4. Read back owners/dates in the final five minutes.
5. Immediately after the call, update the follow-up table, then migrate bd and convert rows into issues.

## Final checklist before call

- [ ] Decide whether dashboard URL will be sent or only live-shared.
- [ ] If sent externally, accept that it is effectively public unless repo visibility/auth changes first.
- [ ] Optional but high-value: draft DCE new-user runbook v0.1.
- [ ] Keep DUNS, Teams Premium SKU, E5 replacement, backup pricing, and insurance letter at the top of the call.
