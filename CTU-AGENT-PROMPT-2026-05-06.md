# CTU Agent Prompt — May 7, 2026 Megan Call (Cross-Tenant Utility)

> **Paste the section below into the CTU repo agent.** It's self-contained — the agent does not need email access; all evidence it can't reach is enumerated under "Outside-repo evidence."

---

## 🔄 RECONCILIATION NOTES (added 2026-05-06 13:30 CT — overrides any conflict below)

This prompt was authored against a stale snapshot of the repo. The following corrections supersede anything downstream that conflicts:

1. **Call rescheduled.** New time: **Wed May 7, 2026 · 1:15 PM CT** (was May 6 1:00 PM). All Phase A/D abort times move +24h accordingly.
2. **Live dashboard tree = REPO ROOT, not `dashboard/`.** Modify `./src/data/*.js` and `./src/components/msp/*.jsx`. The `./dashboard/` subfolder is the recursion-bug artifact the prompt warns about elsewhere — leave it alone. Deploy via `npm run deploy` from repo root (which runs `predeploy: vite build` then `gh-pages -d dist`). Confirmed by inspecting `origin/gh-pages` branch contents matching root `vite.config.js` build outputs.
3. **DeltaSetup is NOT empty.** It has 28 entries, is on the `gh-pages` branch locally, and has `DEPLOYMENT-RUNBOOK.md` + full HTML deliverables. Drop the "golden child blocked" framing. bd issue #14 should NOT be filed.
4. **`msp-responses-megan-2026-04-13.md` answers 20/20 questions.** Treat this file as a Truth Anchor on par with the email evidence. It closes (or materially advances) the following items the prompt treats as open:
   - Partner-override scope for deny-by-default → **answered**: Global Reader + Directory Reader + Service Support Admin + Platform/Storefront + API/Integration + billing data access.
   - EDR → **answered**: ThreatDown (separate from Atera). Tyler + Dustin missing it. Small list of personal-computer users also missing.
   - M365 backup → **in flight**: Megan owes pricing (not "zero coverage open").
   - Atera tenant API → **answered**: none needed; won't be blocked by deny-by-default.
   - BCC MOSA → CSP timeline → **anchored**: October Business Basic expiration; future BB on Pax8.
   - GDAP timeboxing → **answered**: 2-year default, can't shorten. SGI Techs group tracks all engineers. MFA enforced via Sui Generis's own CA.
   - Onboarding checklist → Megan said "send me the checklist and I'll follow it." We owe the doc.
   - Ingram Micro / O365Support SPs → **safe to remove** (Megan confirmed).
   - GDAP approval workflow → **still open** (Megan: "need to check").
5. **Skip the live audit.** Most recent data: Apr 23 CA verify + MFA verify + CFO cyber-insurance response, Apr 20 comprehensive end-to-end audit. Anchor on those + `PHASE-1-CONSOLIDATED-ANALYSIS.md`. File a bd issue to re-run post-call. Interactive 5-tenant auth is not worth the cost given how recent the existing data is.
6. **bd is not initialized in this workspace.** Run `bd init` (or `BEADS_DIR=$(pwd)/.beads bd <cmd>`) before any `bd add`.
7. **Brief location:** repo root `./MEGAN-CALL-BRIEF-2026-05-07.md` (Tyler confirmed). Use the existing `/Users/tygranlund/dev/04-other-orgs/DeltaSetup/MEGAN-CALL-BRIEF-2026-05-06.md` as structural foundation; integrate Apr 13 closures; drop DeltaSetup blocker; update date.
8. **Updated bd issue list:** ~17 issues, but the SHAPE is different — drop #7 (closed by Apr 13) and #14 (closed by DeltaSetup state). Add 5 new ones revealed by Apr 13 (ThreatDown gap, GDAP workflow check, phishing simulation pricing, legacy SP removal in TLL, BCC pwd-never-expires audit).

---

## ROLE

You are the autonomous build agent for the **Cross-Tenant-Utility** (CTU) repo at `/Users/tygranlund/dev/03-personal/Cross-Tenant-Utility`. You follow the workflow defined in `AGENT.md` (bd / beads for issue tracking, "Land the Plane" workflow that mandates `git push` before declaring complete). You also own the published dashboard at `https://t-granlund.github.io/ctu-dashboard/` whose source lives in `dashboard/`.

## MISSION

Tyler Granlund (IT Director, HTT Brands) has a 1:00 PM Central Time call **today, May 6, 2026** with Megan Myrand (mmyrand@suigenerisinc.com — Sui Generis Inc.). The call subject — confirmed by Megan's acceptance at 8:51 AM CT today — is **"Tyler/Megan – Review Tenants."**

Tyler needs to walk Megan through (a) **the complete state of all Microsoft and Azure billing across HTT and the four brand tenants — direct-bill vs. Pax8 CSP — accurate as of today**, and (b) **whether HTT is in a position to flip the cross-tenant identity posture that has been in flight since the April 10 call.**

You must:
1. Run a fresh CTU audit so the data is current.
2. Update the dashboard's data layer + MSP components so the published site reflects today's reality (Pax8→AppRiver billing transfer in flight, HTT M365 E5 expiry, Web-Direct→CSP migration, etc.).
3. Build and deploy the updated dashboard to GitHub Pages.
4. Write a markdown brief at the repo root: `MEGAN-CALL-BRIEF-2026-05-06.md`.
5. File bd issues for every open item the brief surfaces.
6. Land the plane (`git pull --rebase`, `bd sync`, `git push`, verify `git status`).

**The brief and the dashboard must say the same thing.** Treat the dashboard as the source of truth for human consumption and the markdown as the source of truth for follow-up tracking.

---

## TRUTH ANCHORS — Outside-repo evidence (use as-is; do not re-derive)

The following facts come from Tyler's Outlook (last 30 days) and his prior conversation with the brief author. They are the inputs you would otherwise have no way to obtain. Treat them as ground truth.

### A. Today's call

- **When:** Wed May 6, 2026, 1:00 PM CT.
- **Megan accepted:** Today 8:51 AM CT ("Accepted: Tyler/Megan - Review Tenants").
- **Megan also sent today (8:56 AM CT):** "Lash Lounge DNS changes" — Colton's CallView analytics dashboard needs **a CNAME on a `thelashlounge.com` subdomain. No MX, TXT, or A record changes.** This is the dashboard rebuild she previewed on Apr 10.

### B. Microsoft direct-bill activity (HTT-ANCHOR-TENANT, Tenant ID `0c0e35dc-188a-4eb3-b8ba-61752154b407`)

| Date | Event | Source |
|---|---|---|
| Apr 7–8, 2026 | Microsoft support case **TrackingID#2604020040000719** opened: Tyler is migrating from Web Direct billing to Pax8 CSP. **Microsoft does NOT support direct Web-Direct → CSP transfer.** Existing subscription must be cancelled, then re-provisioned through Pax8. | Microsoft Support emails |
| Apr 10, 2026 | Direct-bill invoices issued for March 2026 cycle (HTT): G150806692 ($100.00), G151300582 ($108.26), G151428883 ($0.00), G151934528 ($7.68 — single-day Apr 8), G152224961 ($23.04 — single-day Apr 9). **Total recent direct-bill: ~$239 monthly + ~$30 single-day items.** | microsoft-noreply invoices |
| Apr 25, 2026 | Azure asked HTT to **verify the on-file Azure payment method**. Open. | azure@infoemails.microsoft.com |
| Apr 27, 2026 | **Pax8 US submitted a billing-ownership transfer request from AppRiver on HTT's behalf.** Item: "Azure subscriptions, reservations, savings plans, and/or new commerce license-based subscriptions." **Transfer ID: `acd7573e-a487-41d9-83ce-560dea432e95`.** **Expires May 27, 2026** if not actioned. | microsoft-noreply |
| May 3, 2026 | **HTT subscription "Microsoft 365 E5 (no Teams)" expired** on HTT-ANCHOR-TENANT. (Intentional — first leg of the Web-Direct → CSP migration.) | microsoft-noreply |
| May 4, 2026 | **HTT subscription "Office 365 Extra File Storage" expired** on HTT-ANCHOR-TENANT. (Intentional, same migration.) | microsoft-noreply |

### C. Pax8 CSP licensing posture (confirmed by Megan on April 10 call)

- **Entra ID P2 is purchased as a blanket license on every tenant** (HTT, BCC, FN, TLL, DCE) via Pax8. Doesn't have to be assigned to users to unlock CA / PIM / audit.
  - BCC: 5 P2 (3 allocated) — duplicate from Eric Canfield era; Tyler cancelling extras.
  - FN: extra P2s from previous person — same.
  - DCE: correctly 1.
- **AppRiver is 100% off** — quote Megan: "We are 100% migrated over. We don't have any account with AppRiver any longer." 3 AppRiver service principals approved for removal: `Office 365 Security Audit App` (7aecb184), `Office365 Integration` (bee5026c), `PshellTools` (cc695ec2) — across HTT, FN, TLL.
- **TD SYNNEX** GDAP already revoked by Megan. Partner policy entries cannot be deleted (Microsoft limitation) — cosmetic only.
- **Most current Pax8 licenses renew July/August 2026.** Megan plans to align all subscription dates per tenant on a single renewal date (TLL is already aligned to end-of-January).
- **BCC is MOSA / direct-bill historically** — Megan is migrating it to Pax8 CSP **post-convention** (convention is now past — start-date conversation is open).

### D. Megan's open / in-flight items (from email)

| Date | Item | Status |
|---|---|---|
| Apr 9 (PTO) | Apr 9 invoicing call meeting accepted | Held / superseded |
| Apr 10 | Salon accounts MFA tie to users (Frenchies prep) | Open — Megan asked for help with the mapping |
| Apr 10 | Google Workspace tied to Carla Bravo's 2 TLL salons (Jerrod Braun owns) | Open |
| Apr 10 | **Teams Premium 25 seats expired Apr 2** — Megan flagged Pax8 doesn't have it; was purchased direct on HTT side | Open — Megan asked Apr 21 which SKU and term to repurchase via Pax8. **No reply from Tyler in email.** |
| Apr 13 | Megan sent Pax8 GDAP role screenshots + `msp-responses-megan-2026-04-13.md` attached to "Re: Follow-Up from Our Call — Dashboard…" | Partial dashboard responses received |
| Apr 20–22 | Brand-email spoofing wave on TLL + HTT. Megan proposed DMARC reject; pulled back when Marketing impact surfaced (Kristin loop) | Open thread |
| Apr 22 | "does your website have an export feature since it has all this information or do I need to pull it from the tenant?" (re: dashboard questionnaire) | Implies Megan didn't finish the dashboard form — need to confirm method on call |
| Apr 22 | **Megan cleaned 68 shared mailboxes on TLL tenant.** | Done — informational |
| May 6 (today) | TLL DNS — CNAME for CallView analytics subdomain (Colton) | Today's ask — Tyler to action |

### E. RACI confirmed on April 10 call

- **Sui Generis owns:** Pax8 CSP licensing purchase / renewals / term alignment; new-user device provisioning (Win11 Pro, ship, RMM enroll); Atera RMM; CA/MFA deployment per tenant (HTT/TLL/DCE/FN done; **BCC pending post-convention**); franchisee device support for TLL (Frenchies blocked by FTG 10-yr contracts).
- **HTT (Tyler) owns:** Identity architecture, cross-tenant policy authorship, attribute schema (`htt_role`, `htt_brand`, `htt_region`, `htt_location_ids`, `htt_access_tier`), CA policy authorship, direct-billed Microsoft subs under HTT-ANCHOR.
- **Joint:** New-user attribute set + dynamic-group adds + license assignment — Tyler defines runbook, Megan executes. **Megan offered Apr 10:** *"If there's a list of 'when you create a new user, add to these groups' — tell me."* Tyler has not yet delivered this runbook.
- **Open / no owner today:** M365 backup (zero coverage across all 5 tenants — confirm whether Sui Generis offers Datto SaaS Protection / Veeam / etc.); cyber insurance attestation letter (Tyler needs from Megan covering EDR / patching / firewall / backup).

### F. Hard blocker on the cross-tenant "golden child" example

- The DeltaSetup repo at `/Users/tygranlund/dev/04-other-orgs/DeltaSetup` exists, but the working tree is **empty** — only `.git` is present. The branch `feature/material3-css` exists on origin; nothing is checked out locally. **The canonical Delta Crown Extensions example cannot be demonstrated on the call** until that's resolved. Surface this on the dashboard's "Blockers" / "Open Items" section and in the brief.
- Apple Business Manager for Delta Crown is blocked on Tyler getting the **DUNS number** (Apr 10 action item, still open).

### G. The HTT default cross-tenant access policy is still inbound-OPEN

- B2B Collab + Direct Connect = `AllUsers / AllApplications` — confirmed in `HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md` §3.1.
- The deny-by-default flip is **gated on Megan giving us the exact Pax8 / Sui Generis partner-override scope** (which apps + permissions she needs whitelisted). Until that's defined, `Set-DenyByDefault.ps1` cannot run safely.

---

## PHASE 0 — Prerequisites (resolve before Phase A)

These have to land before the brief is meaningful:

- **DeltaSetup working tree.** From `/Users/tygranlund/dev/04-other-orgs/DeltaSetup`, run `git checkout feature/material3-css` (or `git switch`). If the checkout fails, that becomes a 🔴 blocker in the brief and bd issue #14 stays P0 due today; otherwise downgrade #14 to a closed issue and remove the "golden child blocked" framing from the brief.
- **Voice anchors present.** Confirm `MEGAN-CALL-PREP.md` and `POST-CALL-SUMMARY-2026-04-10.md` exist in the repo. If either is missing, surface before drafting.

## PHASE A — Refresh the audit data

Tyler explicitly asked for a fresh audit before the brief is written.

**Audit abort time: 11:30 AM CT.** If the full audit isn't done by then, fall back immediately to the 4-domain subset (`B2BCollaboration,B2BDirectConnect,GuestInventory,CrossTenantSync`). If even the subset isn't done by 12:00 PM CT, mark the audit deferred and proceed against the existing consolidated analysis.

1. `bd onboard` if not already onboarded for this session.
2. Run the configuration pre-flight: `pwsh -File scripts/Test-Configuration.ps1`. Stop and surface to user if any tenant fails connectivity.
3. Run **`pwsh -File scripts/Invoke-FullAudit.ps1`** — interactive auth, all 5 tenants, all 7 domains. Output goes to `reports/<AuditName>_<timestamp>/`.
   - If interactive auth time is a problem (call is at 1pm CT), fall back to **`-Domains B2BCollaboration,B2BDirectConnect,GuestInventory,CrossTenantSync`** (the four most relevant to the cross-tenant readiness question). Document in the brief which domains were refreshed and which are stale.
4. Capture the new `reports/<AuditName>_<timestamp>/AUDIT-SUMMARY.md` path. This is the single citation source for every Phase B / E claim about current tenant state.
5. **Diff against the prior consolidated state in `reports/PHASE-1-CONSOLIDATED-ANALYSIS.md`** and capture any deltas — these go in the brief's "What changed since April 10" section.

If the audit cannot complete in time, do NOT block Phase B/E. Document "audit refresh deferred" in both deliverables and proceed against the existing `reports/PHASE-1-CONSOLIDATED-ANALYSIS.md` and `reports/Audit_*/AUDIT-SUMMARY.md` files. File a bd issue to re-run the audit post-call.

---

## PHASE B — Update the dashboard data layer

The dashboard is the published artifact Megan can reference. It must be current.

1. **`dashboard/src/data/msp-data.js`** — update with everything in the Truth Anchors above. Specifically:
   - Add a `webDirectToCspMigration` object with: case ID `2604020040000719`, status `in_progress`, milestones (`Apr 7-8 case opened`, `Apr 27 Pax8→AppRiver transfer submitted`, `May 3 E5 no-Teams expired`, `May 4 Extra File Storage expired`), expiry `May 27, 2026` for the transfer.
   - Add a `directBillInvoices` array for HTT with the five April 10 invoices and totals.
   - Update the `appRiver` section to reflect "100% migrated, SPs approved for removal" status from the Apr 10 call.
   - Add a `pax8Licensing` object with the P2 blanket-license confirmation, BCC/FN/DCE allocations, July/August 2026 renewal alignment plan.
   - Add a `bccMosaToCsp` migration entry — status `awaiting_post_convention_kickoff`.
   - Add a `teamsPremium` entry — `expired Apr 2, 2026; repurchase decision pending`.
2. **`dashboard/src/data/audit-data.js`** — refresh from the new audit run output (Phase A). Preserve schema; only update values.
3. **`dashboard/src/data/megan-questions.js`** — mark questions Megan has responded to (per `msp-responses-megan-2026-04-13.md`) as `answered`. Add new questions surfaced by today's brief (full list in Phase E).
4. **Do not create a separate `billing-data.js`.** Extend `msp-data.js` with a top-level `billingState` export of the shape below, and point `BillingLandscape.jsx` at it. One file, one source of billing truth — DRY over neat-sounding filenames.
   ```js
   export const billingState = {
     asOf: '2026-05-06',
     directBilled: { /* HTT Microsoft direct subs, Azure direct, totals */ },
     pax8CspBilled: { /* per-tenant CSP licenses, P2 blanket, renewal dates */ },
     inFlightMigrations: [ /* webDirectToCsp, bccMosaToCsp, pax8AppRiverTransfer */ ],
     openDecisions: [ /* Teams Premium SKU, payment method verify, transfer May 27 deadline */ ]
   };
   ```

**Constraint:** Do not touch the nested duplicate `dashboard/dashboard/dashboard/...` folders — those are an artifact of a prior recursion bug, not active sources. If you have time and bandwidth at the very end, file a bd issue to clean them up; do NOT clean them up now.

---

## PHASE C — Update / add MSP components

The existing components in `dashboard/src/components/msp/` cover most of what's needed:
- `BillingLandscape.jsx` — wire to the new `billing-data.js` (Phase B step 4).
- `ActionItems.jsx` — populate from the bd issues you'll file in Phase F so it's a live mirror.
- `BlindSpots.jsx` — add: DeltaSetup empty working tree; M365 backup zero coverage; cyber-insurance letter not yet received; Teams Premium repurchase decision pending; new-user runbook not yet delivered to Megan.
- `CallAgenda.jsx` — re-order for today's call:
  1. Pax8→AppRiver transfer confirmation (May 27 deadline)
  2. Web-Direct → CSP migration status (E5, Extra Storage replacements)
  3. Teams Premium repurchase decision
  4. BCC MOSA → CSP kickoff date
  5. Cross-tenant readiness — partner-override scope from Megan
  6. New-user runbook handoff
  7. M365 backup gap + cyber insurance attestation
  8. DCE DUNS (Tyler to deliver)
  9. TLL CNAME (today's ask from Megan)
- `PostCallSummary.jsx` — leave unpopulated; you'll fill this after the call from the transcript.

If a `BriefBanner` / "as-of" timestamp component does not exist at the top of the dashboard, add one showing **"Brief refreshed: 2026-05-06 HH:MM CT"** with the audit-run timestamp from Phase A.

---

## PHASE D — Build and deploy the dashboard

**Deploy abort time: 12:30 PM CT.** If the dashboard is not live by 12:30, stop trying, ship the brief without the dashboard refresh, and file a bd issue to deploy post-call. Half-deployed states are worse than stale states.

1. **Discover the deploy mechanism FIRST, before building.** Inspect, in this order: `dashboard/package.json` scripts, `.github/workflows/*.yml`, `dashboard/deploy.sh`, any `gh-pages` branch on the remote. Pick exactly one and write the chosen path into the brief's "Sources" section. If you cannot identify a single canonical path in 5 minutes, **stop and surface to Tyler** — do not guess.
2. From `dashboard/`: `npm install` if needed.
3. Build: `npm run build`. If the build emits warnings that change behavior (Tailwind purge, Vite tree-shake), surface them — do not silently downgrade dependencies.
4. Verify `vite.config.js`'s `base` is set correctly for the `t-granlund.github.io/ctu-dashboard/` path (`base: '/ctu-dashboard/'`).
5. Deploy via the mechanism identified in step 1. Verify the live site renders the updated banner timestamp.
6. **Do not modify the dashboard passphrase.** It hasn't changed; Megan has it from the April 10 email.

If deployment is gated on credentials you don't have, stop and surface the blocker — do not commit a half-deployed state.

---

## PHASE E — Write the markdown brief

**File:** `MEGAN-CALL-BRIEF-2026-05-06.md` at the repo root.

**Structure (mirror the dashboard's section ordering for consistency):**

1. **Header** — date, time, attendees, call subject, "as-of" timestamp.
2. **Bottom-line answers, in Tyler's voice** — two questions:
   a. Can we speak confidently to all M365/Azure billing across HTT and the brands? (Yes per-tenant; consolidated dollar view is what Control Tower will eventually answer.)
   b. Are we ready to establish the cross-tenant situation with Delta Crown Extensions as the golden child? (Architecture yes, Delta example blocked — flag DeltaSetup empty working tree.)
3. **Billing posture** — split into two tables:
   - Direct-billed by HTT (Microsoft Web Direct → in active migration). List the five April invoices with amounts. Call out the May 3 E5 expiry, May 4 Extra Storage expiry, Apr 27 Pax8→AppRiver transfer (with Transfer ID + May 27 expiry), Apr 25 payment-method reminder.
   - Sui Generis / Pax8 CSP-billed. Entra P2 blanket, BCC/FN/DCE P2 allocations, AppRiver 100% off, TD SYNNEX cosmetic, BCC MOSA migration status, July/August 2026 renewal alignment.
   - End with the **5 settle-on-call billing questions** (Pax8→AppRiver transfer scope; Teams Premium SKU + term; HTT E5 replacement order status / coverage gap; BCC MOSA migration start date; consolidated per-tenant Pax8 invoice export for Q2 reconciliation).
4. **Cross-tenant readiness** — split into "what's solid" / "what's blocking." Blockers must include: DeltaSetup empty working tree (🔴), HTT default policy still inbound-OPEN waiting on Megan's partner-override scope (🔴), Megan's outstanding dashboard responses (🟡), Frenchies + DCE spoke-side auto-redeem incomplete (🟡).
5. **Onboarding/offboarding lifecycle** — table of capabilities × state × owner. Highlight that **the new-user runbook is the single biggest unblock Tyler can hand Megan today.**
6. **Device management** — Atera confirmed, Win11 Pro standard, DCE all-Mac (DUNS-blocked), Frenchies FTG-blocked, no formal MDM on HTT corporate (cyber-insurance gap).
7. **Proposed RACI** — full table per "RACI confirmed on April 10 call" above plus today's deltas.
8. **Open questions in priority order** — the 11-question list in priority order:
   1. Pax8→AppRiver Apr 27 billing transfer scope (Transfer ID `acd7573e-a487-41d9-83ce-560dea432e95`) — confirm intentional, what it covers, our action by May 27.
   2. Teams Premium 25 seats — SKU and term repurchased on Pax8?
   3. HTT E5 (no Teams) replacement — Pax8 order placed? Coverage gap window?
   4. BCC MOSA → Pax8 CSP — start date, agreement signed?
   5. Cyber insurance attestation letter (EDR / patching / firewall / backup).
   6. M365 backup — what does Sui Generis offer (Datto SaaS Protection / Veeam)?
   7. Atera customer-specific API — outcome of Apr 10 check; can we ingest device data into Freshdesk?
   8. Dashboard questionnaire — finish in dashboard or walk through verbally?
   9. Pax8 / Sui Generis partner-override scope — exact apps + permissions to whitelist before deny-by-default flip.
   10. Frenchies + DCE spoke-side auto-redeem — owner + timing.
   11. DUNS for DCE Apple Business Manager — Tyler to deliver.
9. **What changed since the April 10 call** — diff per Phase A step 5, plus the email-derived deltas in section D of the Truth Anchors above.
10. **Sources** — link the new audit report path, `PHASE-1-CONSOLIDATED-ANALYSIS.md`, `MEGAN-CALL-PREP.md`, `MSP-CALL-BRIEFING.md`, `POST-CALL-SUMMARY-2026-04-10.md`, `HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md`, the Microsoft case ID, the Pax8 transfer ID, and the dashboard URL.

**Length target:** 300–450 lines. Tight beats long — Tyler is reading this between meetings, not on a beach. Write in Tyler's voice — authoritative, specific, no hedging on facts you have, explicit hedging on facts you don't. Use `MEGAN-CALL-PREP.md` and `POST-CALL-SUMMARY-2026-04-10.md` as the explicit voice anchors; if either is missing, surface that and fall back to a neutral-direct register.

---

## PHASE F — File bd issues for every open follow-up

Use `bd add` for each. Title format: `<area>: <action>`. Always set owner, severity (P0/P1/P2), and a due date relative to the call (use `2026-05-13` for one-week items, `2026-05-27` for the Pax8 transfer deadline, `2026-05-06 + 24h` for "today" items).

**Idempotency:** Before filing, run `bd list --status open --json` (or equivalent) and skip any issue whose title exactly matches one of the rows below. If a matching issue exists but its owner / severity / due date is wrong, `bd update` it instead of filing a duplicate. Re-running this prompt must NOT produce 34 issues.

Required issues (do not skip any net-new ones):

| # | Title | Owner | Severity | Due |
|---|---|---|---|---|
| 1 | billing: Confirm scope of Apr 27 Pax8→AppRiver transfer ID acd7573e-a487-41d9-83ce-560dea432e95 | Tyler | P0 | 2026-05-27 |
| 2 | billing: Repurchase Teams Premium 25 seats via Pax8 — decide SKU + term | Megan | P1 | 2026-05-13 |
| 3 | billing: Order HTT E5 (no Teams) replacement via Pax8 + document coverage gap | Megan | P0 | 2026-05-13 |
| 4 | billing: Verify HTT-ANCHOR Azure payment method (Apr 25 reminder) | Tyler | P1 | 2026-05-13 |
| 5 | billing: Kick off BCC MOSA → Pax8 CSP migration (post-convention) | Megan | P1 | 2026-05-20 |
| 6 | billing: Request consolidated per-tenant Pax8 invoice export for Q2 recon | Tyler | P2 | 2026-05-20 |
| 7 | identity: Get Pax8/Sui Generis partner-override scope for HTT deny-by-default flip | Megan | P0 | 2026-05-13 |
| 8 | identity: Author new-user runbook (attributes + groups + license per brand) and hand to Megan | Tyler | P0 | 2026-05-13 |
| 9 | identity: Complete Frenchies + DCE spoke-side auto-redeem | Sui Generis tenant admin | P1 | 2026-05-20 |
| 10 | governance: Cyber insurance attestation letter from Sui Generis (EDR/patch/firewall/backup) | Megan | P0 | 2026-05-13 |
| 11 | governance: Define M365 backup approach (Datto SaaS Protection / Veeam / other) | Megan | P0 | 2026-05-13 |
| 12 | devices: Atera customer-specific API check + Freshdesk ingestion path | Megan | P1 | 2026-05-13 |
| 13 | devices: Provide DUNS number for Delta Crown Apple Business Manager | Tyler | P1 | 2026-05-13 |
| 14 | repo: DeltaSetup working tree is empty — restore checkout of feature/material3-css | Tyler | P0 | 2026-05-06 | (Skip filing if Phase 0 resolved this; otherwise file as P0.) |
| 15 | dns: TLL CNAME for CallView analytics subdomain (today's ask from Megan/Colton) | Tyler | P1 | 2026-05-06 |
| 16 | dashboard: Confirm with Megan whether to finish questionnaire in-app or capture verbally | Tyler | P2 | 2026-05-13 |
| 17 | repo: Clean up nested recursive dashboard/dashboard/dashboard/ folders | Agent | P2 | 2026-05-20 |

After filing, surface each issue ID in the brief's "Open questions" section so the markdown and bd state cross-reference.

---

## PHASE G — Land the plane

Per `AGENT.md`'s mandatory workflow:
1. `git pull --rebase` (resolve any conflicts; flag if non-trivial).
2. `bd sync`.
3. `git add` only what was changed in Phases B, C, D, E. **Do not** stage modifications in nested duplicate dashboard folders, do not stage incidental edits to other tracked files. If the diff includes anything unexpected, stop and surface to user before continuing.
4. Commit with a single message: `feat: refresh state for May 6 Megan call (brief + dashboard + bd issues)`.
5. `git push`.
6. Verify `git status` shows "up to date with origin."
7. Verify the deployed dashboard at `https://t-granlund.github.io/ctu-dashboard/` reflects the new banner timestamp.

---

## CONSTRAINTS (HARD)

- **Read-only by default.** Do not modify any file outside the explicit Phase B/C/D/E scope without surfacing the change request to the user first. Tyler stated explicitly: *"I don't want anything modified unless it 100% needs to be, then let me know."*
- **Do not run remediation scripts.** `Set-DenyByDefault.ps1`, `Fix-SyncUserTypeMapping.ps1`, `Set-TeamsFederationAllowlist.ps1`, `Remove-FranworthAccess.ps1` — all read/write scripts stay paused. The audit (`Invoke-FullAudit.ps1`) is read-only and is allowed.
- **Do not modify the dashboard passphrase.** It is `CrossTenant!`.
- **Do not edit AGENTS.md / AGENT.md / SKILL.md.** Those are operating instructions for you — not deliverables.
- **No fabricated dollar amounts, dates, IDs, or claims.** If a fact is missing, say "unknown — pending Megan confirmation" in the brief and file a bd issue. Every dollar amount, every date, every ID in the brief must trace to either the Truth Anchors above or to a file in the repo.
- **The April 10 call findings are ground truth** for what Megan has confirmed. If the new audit (Phase A) contradicts an April 10 confirmation, surface the contradiction in the brief — do not silently overwrite Megan's verbal confirmation with stale audit data.

## DEFINITION OF DONE

- [ ] Fresh audit run completed (or deferral documented + bd issue filed).
- [ ] `dashboard/src/data/msp-data.js`, `audit-data.js`, `megan-questions.js`, and (if needed) `billing-data.js` updated.
- [ ] `BillingLandscape.jsx`, `BlindSpots.jsx`, `CallAgenda.jsx`, `ActionItems.jsx` reflect today's state.
- [ ] As-of banner shows "Brief refreshed: 2026-05-06 HH:MM CT" with real audit timestamp.
- [ ] `npm run build` clean. Dashboard deployed to GitHub Pages and visible at the live URL.
- [ ] `MEGAN-CALL-BRIEF-2026-05-06.md` exists at repo root, follows the Phase E spec, all 11 open questions cross-reference their bd issue IDs.
- [ ] All 17 bd issues filed with owners and due dates.
- [ ] `git push` succeeded; `git status` shows clean working tree, "up to date with origin."
- [ ] No file modified outside the explicit scope (Phase B/C/D/E + bd state).

When all checkboxes are true, post a one-paragraph status summary back to Tyler with: dashboard URL, brief path, list of bd issue IDs filed, and any items where you needed to defer or surface a blocker.

---

*Prompt authored 2026-05-06 for Tyler Granlund's 1pm CT call with Megan Myrand. Pasting into the CTU agent does not modify any source file by itself; the agent's first action should be Phase A.*
