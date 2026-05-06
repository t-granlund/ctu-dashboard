# Second Opinions — May 7 Megan Call Readiness

## Agents consulted

- `ops-comms-collie` — business clarity / live-call usability
- `qa-kitten` — dashboard UX / accessibility / regression risk
- `release-gate-arbiter` — adversarial release readiness
- `planning-agent` — agenda sequencing / follow-up completeness

## Ops Comms Collie — key findings

**Verdict:** tighten before sending.

### Accepted fixes

- Added a **Live Call Run Sheet** at the top of `MEGAN-CALL-BRIEF-2026-05-07.md`.
- Reframed Delta Crown from “golden child” to **model tenant / reference implementation** in Megan-facing language.
- Standardized BCC timing: **Business Basic expires October 2026**, other Pax8 renewals may still be July/August and should be confirmed.
- Removed the dashboard passphrase from the brief’s sources section; it now says passphrase is shared separately.
- Elevated E5 replacement status as a risk to confirm, not merely an intentional expiration.

### Deferred / accepted risk

- The brief remains detailed (419 lines after run sheet), but the new section 0 gives Tyler a live-call control surface.
- Repo/tooling details remain in the brief because Tyler asked for complete prep; they should not be foregrounded during the call.

## QA Kitten — key findings

**Verdict:** release acceptable with minor accessibility fixes recommended.

### Accepted fixes

- Added accessible names to answered/check buttons.
- Added `aria-label` to select and textarea controls.
- Progress now reflects Apr 13 inline answers (20/20 answered, 100%).

### Remaining considerations

- Some muted helper text may still be low contrast on mobile.
- Content density is high; best call-day usage is the May 7 top section + brief run sheet, not scrolling every reference section live.

## Release Gate Arbiter — key findings

**Initial verdict:** conditional pass with hard conditions.

### Accepted fixes

- Local duplicate-text fixes were committed into final build/deploy path.
- Playwright was rerun to green (52/52).
- Dashboard copy changed from stale “tomorrow’s session” to “this session.”

### Remaining risk: public repo / client-side password gate

The dashboard is hosted from a public GitHub Pages repo and uses a client-side password gate. That is not real confidentiality. Tenant IDs and vendor metadata are not secrets, but the dashboard should be treated as **shareable-with-context**, not secure. Call-day recommendation: live-share the dashboard or send the URL only if Tyler accepts it as effectively public.

## Planning Agent — key findings

**Verdict:** call-ready, but call control matters.

### Accepted fixes / alignment

- Added a 5-decision run sheet.
- The agenda now prioritizes billing blockers, DCE model-tenant status, and onboarding runbook.
- Follow-up table remains the temporary source of truth until bd is migrated.

### Top remaining action before call

Prepare a v0.1 DCE new-user runbook if time permits. Even a rough version gives Megan something concrete to validate.
