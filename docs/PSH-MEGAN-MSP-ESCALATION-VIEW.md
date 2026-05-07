# Megan / MSP — Proposed Escalation View

**Status:** Discussion draft for alignment call
**Owner:** Tyler Granlund
**Last updated:** 2026-05-07
**Pattern source:** `people-support-hub-plan.md` §3.2 — Escalation Center
**Template parallel:** Mindbody (MBO) Escalation — §3.2.1

---

## 🎯 What this is

A dedicated, filtered view of Freshdesk tickets that Megan's MSP team is responsible for — **same architecture as the MBO escalation view**, just different field conditions. No new platform work, configuration only.

> *"Provide external and internal support teams with a dedicated view of escalated tickets relevant to them, using ticket field conditions to route visibility."*
> — People Support Hub Plan, §3.2

---

## ✅ The non-negotiable: Freshdesk is the front door

| Today (some of the time) | Going forward (all of the time) |
|---|---|
| Direct emails / Teams pings to Megan | **Every request enters as a Freshdesk ticket** |
| Megan triaged in her inbox | Megan triaged from her queue view |
| Visibility = "ask Tyler / Dustin" | Visibility = real-time, self-serve |

If a franchisee emails Megan directly, the response is: *"please open a ticket at [support email] — that's how we keep your stuff from getting lost."*

---

## 🧩 Proposed routing field conditions (v1)

A ticket lands in Megan's queue when **status = "Waiting on Third Party" (`7`)** AND **any one** of the following topic conditions matches:

| # | Field | Condition | Rationale |
|---|---|---|---|
| 1 | Topic / Category | `Computer Hardware Issue` (flat) | Generic hardware bucket already exists |
| 2 | Topic / Category | `Hardware` → `POS Devices` / `Payment Setup` / `Scanners` / `Printers` | Per-brand hardware subcategories |
| 3 | Topic / Category | `Frenchies Hardware` | Brand-specific bucket already exists |
| 4 | Topic / Category | `Microsoft Application` (any) | M365 licensing & app issues |
| 5 | Topic / Category | contains `Network` or `Internet` | In-store networking |
| 6 | Tag | `msp` (new) | Manual override / catch-all for edge cases |

**Open question for Megan:** confirm or tighten this list. Is there anything she handles that's *not* in here? Anything in here she does *not* want?

---

## 🪪 Identity & access — three-stage rollout

Mirroring the same staircase MBO is climbing.

### Stage 0 — Today, day-of-call (zero engineering)

- Megan added as a **Freshdesk collaborator** on the relevant agent group(s).
- Tyler / Dustin loop her in via `@mention` or assignment.
- KB update: add MSP row to `support-center-app/docs/kb-articles/ESCALATION-MATRIX.md` so every internal agent knows when to pull her in.

### Stage 1 — Hub queue view (post-MBO ship, pre-Entra)

- Reuse the existing `/api/escalation/*` endpoints (already shipped, see `support-center-app/hub/api/src/functions/escalation.ts`).
- Add a second escalation profile: `msp` alongside `mbo`, with the field conditions above.
- Megan logs in via guest/collaborator auth path; sees only MSP-tagged tickets.

### Stage 2 — Full RBAC + SSO (post-Entra audit)

- Megan provisioned through Microsoft Entra (External ID / B2B guest).
- `escalation.read` scope assigned via Entra group, no env-var role assignment.
- Same view, but identity is clean and auditable.

> **Blocker reminder:** Stage 2 depends on the Entra User Audit (Plan §3.3 — "the critical blocker"). Stage 0 and Stage 1 do **not**.

---

## 📊 What Megan gets out of it

The same data the MBO view already returns — repointed at her conditions. From `/api/escalation/summary`:

| Metric | Why she'll care |
|---|---|
| **Total open in her queue** | At-a-glance "how big is my pile" |
| **Average age (days)** | Are things slipping? |
| **Oldest ticket age** | Catches the one nobody touched in 3 weeks |
| **Breakdown by status** | Which are blocked on her vs. blocked on franchisee response |

From `/api/escalation/tickets` (paginated list): subject, location, requester, age, last update — all filterable.

**This is the "compelling info" hook.** It's not a promise — it's already shipping for MBO.

---

## 🛠️ Engineering shape (so you can speak to scope)

| Work item | Effort | Notes |
|---|---|---|
| KB Escalation Matrix update | ~10 min | Doc-only |
| Add `msp` profile to escalation filter | ~half day | Parameterize `buildEscalationBase()` in `escalation.ts` |
| Collaborator auth path for Megan | TBD | Coordinate with FBC pilot RBAC work (`freshdesk-oracle-aam`) |
| Full Entra integration | Blocked on §3.3 | Not on Megan's critical path |

No new infra. No new endpoints. No new schemas. Configuration + a `WHERE` clause variant.

---

## ❓ Decisions to capture on the call

- [ ] Confirm field-condition list (table above) — add / remove / tighten
- [ ] Agree on the "Freshdesk is the front door" rule + comms plan to franchisees
- [ ] Decide who keeps the MSP entry in `ESCALATION-MATRIX.md` current (suggest: Tyler, reviewed quarterly with Megan)
- [ ] Confirm Stage 0 collaborator add is OK as the immediate next step
- [ ] Megan's appetite for Stage 1 hub view — nice-to-have or actively wanted?

---

## 🔗 Reference anchors

- People Support Hub Plan: `people-support-hub-plan.md` §3.2 (Escalation Center), §3.2.1 (MBO template), §3.3 (Entra blocker)
- Live escalation API: `support-center-app/hub/api/src/functions/escalation.ts`
- Existing escalation matrix KB: `support-center-app/docs/kb-articles/ESCALATION-MATRIX.md`
- Field taxonomy reference: `support-center-app/specs/freshdesk-field-mapping.md`
