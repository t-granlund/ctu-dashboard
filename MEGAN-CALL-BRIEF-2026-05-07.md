# Megan Myrand (Sui Generis) — 1:15 PM CT Call Brief

**Date:** Thu May 7, 2026 · 1:15 PM CT (rescheduled from May 6)
**Subject (per her accept):** "Tyler/Megan – Review Tenants"
**Last formal level-set:** April 10, 2026 — see `reports/POST-CALL-SUMMARY-2026-04-10.md`
**Last written follow-up from Megan:** April 13, 2026 — see `msp-responses-megan-2026-04-13.md` (20/20 questions answered)
**Brief refreshed:** 2026-05-06 13:35 CT
**Audit anchor:** No fresh full audit run for this call — most recent data is `reports/COMPREHENSIVE-END-TO-END-AUDIT-2026-04-20.md` (~17 days old) plus `reports/Audit_ConditionalAccess_2026-04-23_VERIFY/` (~14 days old). A re-run is filed as a bd follow-up, deferred to post-call to avoid burning interactive auth time before the meeting.

---

## 0. Live call run sheet — use this first

**Goal for this call:** confirm billing migration risk, lock the Delta Crown **model-tenant** next steps, and leave with owners/dates for backup, insurance attestation, Teams Premium, E5 replacement, and the new-user runbook.

### Five things to drive to decision

| Priority | Decision needed | Tyler's talk track |
|---|---|---|
| 1 | **Pax8→AppRiver transfer** — is Transfer ID `acd7573e-a487-41d9-83ce-560dea432e95` intentional and safe to proceed before May 27? | "I just need to confirm this transfer is expected, what it covers, and whether there is any action we owe before it expires." |
| 2 | **HTT E5 + Extra Storage replacement** — are Pax8 replacements ordered, and is there any coverage gap? | "The expirations were intentional migration steps; I need to know whether replacement coverage is active or if we're exposed." |
| 3 | **Teams Premium 25 seats** — what SKU/term should be repurchased through Pax8? | "This was direct-billed and lapsed. Let's settle SKU, term, and who orders it." |
| 4 | **DCE model tenant** — who flips DCE/FN spoke-side auto-redeem, and when? | "Delta Crown is the reference implementation. I need your help making the identity handoff repeatable." |
| 5 | **Backup + insurance letter** — when do we get pricing and written attestation? | "For CFO/compliance, I need backup options and a written statement covering EDR, patching, firewall, and backup." |

### Owner read-back before ending the call

| Megan owes | Tyler owes |
|---|---|
| E5 replacement status + Teams Premium SKU/term | DCE new-user runbook v0.1 |
| M365 backup pricing | DUNS for Delta Crown ABM |
| Cyber/insurance attestation letter | Azure payment-method verification |
| DCE/FN auto-redeem owner/date | TLL CNAME action |
| GDAP approval workflow answer | BCC pwd-never-expires list |

### If challenged, use these lines

- "I'm not trying to relitigate Apr 13 — your answers are already captured. I'm only confirming what changed and what still needs an owner/date."
- "Delta Crown is the model tenant because it is greenfield, small, and already hardened. If this works there, we can scale it across the brands."
- "The direct-bill expirations were intentional, but the replacement status and any feature gap are what I need to close today."

---

## 1. Bottom-line answers, in your voice

**Are we in a position to confidently speak to all our M365/Azure billing across HTT and the brands?**
Yes — at the **per-tenant licensing posture and CSP-vs-direct-bill pattern** level. Every tenant is walkable. What we cannot yet show in a single screen is a **consolidated, real-time dollar figure** — that's what Control Tower is being built to answer, and it's not wired to all four brand tenants yet (per-tenant `governance-platform-reader` app registrations are the gating step).

**Are we ready to establish the cross-tenant situation with Delta Crown Extensions as the model tenant / reference implementation?**
**Yes — Delta Crown is the proof.** The DCE tenant is the deliberate first-greenfield instance of the hub-and-spoke model we want every brand on:
- Tenant security **hardened live Apr 29** (sharing narrowed to existing-external-only, external resharing off, legacy auth off, all 4 dynamic security groups verified, 10 sites audited clean).
- SharePoint Phase 2 (Corp-Hub + DCE-Hub + 4 service sites + branding + dynamic security groups) **deployed.**
- SharePoint Phase 3 (4 DCE brand sites + Teams workspace + 5 channels + DLP policies including `External-Sharing-Block` in Enforce + 3 shared mailboxes + dynamic distribution groups) **deployed.**
- CA **active on the entire tenant** (Megan confirmed Apr 10: *"It should only be the one [P2] because I set up the conditional access"*).
- Per-tenant `Riverside-Governance-DCE` SP wired for cross-tenant read/governance.
- HTT-side `Riverside-Capital-PE-Governance-Platform` cross-tenant SP present.

**What Delta Crown still needs from Megan** (the Apr 10 verbal commitments, now made specific):
- Spoke-side auto-redeem on the DCE tenant (so HTT-issued attributes propagate cleanly).
- DUNS-gated Apple Business Manager → MDM enrollment for the all-Mac DCE fleet (Tyler owes the DUNS; Megan executes ABM tie-in).
- Apply the new-user runbook the moment we hand it over — DCE is the **first** brand it lands on, and the Phase 2/3 dynamic groups (`AllStaff`, `Managers`, `Marketing`, `Stylists`) are already built waiting for the attribute-driven population logic.
- Confirm the deny-by-default partner-override scope she answered on Apr 13 (Global Reader / Directory Reader / Service Support Admin + Platform/API/billing) so we can flip the HTT default policy and let DCE inherit the deny-by-default posture cleanly.

---

## 2. Billing posture — what HTT direct-bills vs. what Sui Generis bills

### Direct-billed by HTT (Microsoft Web Direct → in active migration to Pax8 CSP)

Microsoft support case **TrackingID#2604020040000719** (April 7–8) confirms Microsoft does NOT support a direct Web-Direct → CSP transfer; **the Web Direct subscriptions must be cancelled and re-provisioned through Pax8.** Live state:

| Item | Tenant | Status | Date | Source |
|---|---|---|---|---|
| Microsoft 365 E5 (no Teams) | HTT-ANCHOR (`0c0e35dc-…`) | **Expired May 3** (intentional, per migration) | 2026-05-03 | microsoft-noreply |
| Office 365 Extra File Storage | HTT-ANCHOR | **Expired May 4** (intentional) | 2026-05-04 | microsoft-noreply |
| Teams Premium (25 seats) | HTT | Expired ~Apr 2; **NOT yet on Pax8** — was direct on our side | Megan flagged Apr 10 & Apr 21 | Megan email |
| March 2026 direct-bill invoices | HTT | Paid Apr 9–10 | G150806692 ($100.00), G151300582 ($108.26), G151428883 ($0.00), G151934528 ($7.68 1-day Apr 8), G152224961 ($23.04 1-day Apr 9) | Microsoft invoices |
| **Pax8 → AppRiver billing-ownership transfer** | HTT | **Submitted Apr 27** by Pax8 US. Item: "Azure subscriptions, reservations, savings plans, and/or new commerce license-based subscriptions." **Transfer ID: `acd7573e-a487-41d9-83ce-560dea432e95`. Expires May 27 if not actioned.** | 2026-04-27 | microsoft-noreply |
| Azure payment-method verification | HTT | Apr 25 reminder — verify on-file payment method | 2026-04-25 | azure@infoemails.microsoft.com |

### Sui Generis / Pax8 CSP-billed (per Apr 10 + Apr 13)

- **Entra ID P2** is purchased as a **blanket** license on every tenant (HTT, BCC, FN, TLL, DCE) via Pax8 — doesn't have to be assigned per user to unlock CA / PIM / audit.
  - BCC: 5 P2 (3 allocated) — duplicates from Eric Canfield era. **Megan confirmed Apr 13: "cancel the extras — I'll handle PAX8 side."**
  - FN: extras from previous person — same pattern.
  - DCE: correctly 1.
- **Per-user license renewals:** Most current Pax8 SKUs renew **July/August 2026**. Megan plans to align all subscription dates per tenant on a single renewal date (TLL is already aligned to end-of-January).
- **AppRiver:** **100% migrated to Pax8** (Apr 10: "we are 100% migrated over"). The 3 AppRiver service principals (`Office 365 Security Audit App` `7aecb184`, `Office365 Integration` `bee5026c`, `PshellTools` `cc695ec2`) are authorized for removal across HTT, FN, TLL.
- **TD SYNNEX:** GDAP already revoked on Megan's side; partner policy entries are cosmetic (Microsoft can't delete them).
- **BCC MOSA → Pax8 CSP:** **Anchored Apr 13:** Business Basic licenses expire **October 2026**. Future BB purchases on Pax8. Other non-Business-Basic SKUs may still renew July/August — confirm whether any need earlier action. Convention is past — open question: do we wait for October or cut over earlier?
- **All licensing channel policy (Apr 13):** *"All licenses need to be through Pax8 and no direct bill. Any current direct bill needs to be canceled and repurchased on Pax8."* No ambiguity.

### What the call needs to settle on billing

1. **Pax8→AppRiver Apr 27 transfer (`acd7573e-…`)** — Megan-initiated? What SKUs/subs is it actually transferring? Anything we should NOT let auto-process by May 27?
2. **Teams Premium (25 seats)** — Apr 21 Megan asked which SKU/term to repurchase via Pax8. Has she ordered? Are the 25 users back on Premium, or is the Calls/Webinar functionality currently degraded?
3. **HTT E5 (no Teams) + Extra File Storage** — both expired on schedule. What is the Pax8 replacement order status? Coverage gap on E5 features (CA, ATP, etc.) right now?
4. **BCC MOSA → CSP** — start date now that convention is past, or do we ride to October expiration?
5. **Consolidated bill view** — can Megan export per-tenant Pax8 invoice for our Q2 reconciliation against the Microsoft direct-bill invoices we still hold?

---

## 3. Cross-tenant readiness

### What's solid

- **Architecture document is comprehensive** (`HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md`): 5 tenants mapped, 4 cross-tenant implementations inventoried, 9 security gaps catalogued, unified attribute model, 24-week roadmap.
- **CTU audit toolkit is built and tested.** Apr 20 comprehensive end-to-end audit + Apr 23 CA + MFA verifies are the freshest runs. Phase 1 audit reports exist for DCE, TeamsFederation, and the consolidated analysis.
- **Apr 10 confirmations closed several big unknowns** — Atera as RMM, AppRiver fully off, P2 blanket on every tenant, CA/MFA done on HTT/TLL/DCE/FN (BCC pending post-convention).
- **Apr 13 written responses (20/20)** closed many more (see §4).
- **Wiggum/FAC project on TLL** proved attribute-driven dynamic groups work at scale — the seed pattern Delta Crown will inherit.
- **DeltaSetup working tree is restored** (28 entries, on `gh-pages` branch, has `DEPLOYMENT-RUNBOOK.md`, full HTML deliverables, draft brief from May 6 11:03 AM). Golden-child example is demonstrable.
- **AppRiver SP disable script + CA re-audit script** (commits `8a4347b`, `f4d1dca`, `a340c2a`, `cf87f8b`) — completed Apr 10–13.
- **CFO cyber-insurance response drafted** Apr 23 (`reports/CFO-Cyber-Insurance-Response-2026-04-23.md` + `.docx`).

### What's blocking

- **🔴 HTT default cross-tenant policy is still inbound-OPEN** (B2B Collab + Direct Connect = AllUsers / AllApplications). The deny-by-default flip needs Megan's verbal confirmation of the partner-override scope she described in writing on Apr 13. She gave us the role list — we still need to convert it into a policy whitelist and get her sign-off before running `Set-DenyByDefault.ps1`.
- **🟡 Frenchies + DCE spoke-side auto-redeem incomplete** (per architecture doc). Owner question: who at Sui Generis holds the Frenchies/DCE tenant admin creds, and what's the timing.
- **🟡 New-user runbook still owed.** Megan offered Apr 10 *and* re-confirmed Apr 13: *"Yes — send me the checklist and I'll follow it."* We have not delivered it. **This is the single biggest unblock you can hand her on the call.**
- **🟡 Dashboard questionnaire status.** Apr 13 partial responses came via the markdown attachment, not the dashboard form. Apr 22 Megan asked if the dashboard had an export. Worth confirming whether she wants to finish in-app or walk through verbally.
- **🟡 7 BCC accounts with `Password Never Expires`** — Megan asked Apr 13 for the list of 7. We owe her the names; she'll confirm which (besides the SGI Breakglass) are service accounts vs. needing remediation.

---

## 4. What Megan answered in writing on Apr 13 (don't re-ask these)

These are the items the prior brief left open but Megan actually closed. Do not relitigate; just confirm verbally if needed.

| Topic | Apr 13 answer |
|---|---|
| EDR | **ThreatDown** (separate from Atera). Tyler + Dustin missing it. Short list of personal-computer users also missing. Cyber-insurance attestation can cite this. |
| GDAP role timeboxing | 2-year default, no 90-day option in Partner Center. Removable on demand. |
| GDAP approval workflow | "Not sure — need to check" → still open, lower priority. |
| Other Sui Generis personnel with tenant access | All in **SGI Techs** security group, per-tenant. CA policy enforces. Everyone except Genesis (Tier 1) has been with SG 2+ years. |
| Atera tenant API requirement | **None.** Remote tool installs on the machine; no O365 access path. Will not be blocked by deny-by-default. |
| Sui Generis MFA enforcement | Yes — enforced via Sui Generis's own CA policies on their accounts before they touch our tenants. |
| Shared admin accounts | None. All individual accounts. |
| Partner-override scope for deny-by-default | **Pax8 + Sui Generis need:** Global Reader, Directory Reader, Service Support Admin (core GDAP roles), Platform & Storefront Access, API and Integration Access, billing/licensing data access. *This is the policy whitelist input we needed.* |
| GDAP vs B2B guest access | Both used for different tasks. Don't remove guest accounts. |
| Ingram-Micro-LicenseManager SP (TLL) | Legacy — safe to disable. |
| O365Support-MSP-Connector SP (TLL, tenant `b4c546a4`) | Likely from a Ben/Garrett MS support session. Safe to remove the connector. |
| New-user onboarding process today | TLL: create user → add to Everyone + MFA security group (if specified). Per-brand details still to formalize. |
| Will Megan follow our runbook? | **Yes** — explicitly. We owe the runbook. |
| Direct-bill policy | All licensing must go through Pax8. Any direct bill must be cancelled and repurchased on Pax8. |
| BCC MOSA timeline | Business Basic expires October 2026 — natural cutover anchor. |
| AppRiver/MOSA backup pricing | Megan owes pricing for M365 backup (Datto / Veeam / similar) — in flight, not zero-coverage-decided. |
| Phishing simulation | Megan willing — owes pricing. |
| Extra P2 on BCC / FN | Cancel the extras; Megan handles Pax8 side. |

---

## 5. Delta Crown Extensions model tenant — current state & the collaboration ask

### What's live on the DCE tenant today

| Layer | Status | Notes |
|---|---|---|
| M365 tenant (`deltacrown.onmicrosoft.com`) | ✅ Live, Business Premium | Single license (one assigned), 4 user accounts |
| Conditional Access | ✅ **Active on entire tenant** | Megan deployed late Apr; not assigned per-user, gates the whole tenant |
| Entra ID P2 | ✅ Blanket (1 license, no per-user assignment needed) | Pax8-purchased |
| Tenant security hardening | ✅ Live (2026-04-29) | `sharingCapability: existingExternalUserSharingOnly`, external resharing off, legacy auth off |
| Cross-tenant SPs | ✅ `Riverside-Governance-DCE` (self) + `Riverside-Capital-PE-Governance-Platform` (HTT) | Wired for governance read |
| Partner policy with HTT | ✅ Custom config — B2B scoped to SharePoint, MFA trust, auto-consent | Per `partnerPolicySummary.DCE` |
| **SharePoint hub-and-spoke** (Phase 2) | ✅ Corp-Hub + DCE-Hub + 4 service sites (HR, IT, Finance, Training) | Hub-to-hub linked; gold/black branded |
| **Brand sites** (Phase 3) | ✅ DCE-Operations (Team), DCE-ClientServices (Team), DCE-Marketing (Comm), DCE-Docs (Team) | Lists for Bookings, Staff Schedule, Tasks, Inventory, Calendar, Client Records, Marketing Calendar, Brand Assets |
| Teams workspace | ✅ "Delta Crown Operations" — 5 channels (General, Daily Ops, Bookings, Marketing, Leadership) | Leadership = private channel, Managers only |
| DLP policies | ✅ `DCE-Data-Protection` (test 30d), `Corp-Data-Protection` (test 30d), `External-Sharing-Block` (**Enforce**) | |
| Shared mailboxes | ✅ `operations@`, `bookings@`, `info@` (deltacrown.com) | |
| Dynamic distribution groups | ✅ `allstaff@`, `managers@`, `stylists@` (deltacrown.com) | |
| Dynamic security groups | ✅ `AllStaff` (6 members), `Managers` (0), `Marketing` (0), `Stylists` (0) | Empty groups are intentional — waiting on attribute-driven population |
| HTTHQ document migration | ❌ Decided **not** to migrate (2026-04-29) | Phase 4 scripts remain historical tooling only |
| Internal access controls (break inheritance + role matrix) | ⏳ Pending PnP run | Tracked in DeltaSetup repo |
| Apple Business Manager → MDM | ❌ **Blocked on DUNS** | Tyler owes; DCE is all-Mac strategy |
| Spoke-side auto-redeem | ❌ Not yet enabled | Sui Generis tenant admin to flip |

### Why DCE is the model tenant (the architecture pattern in one frame)

```
HTT-ANCHOR (hub) ─── attribute owner: htt_role, htt_brand, htt_region, htt_location_ids, htt_access_tier
      │
      ├── B2B + DC custom policy (MFA trust, scoped to SharePoint, auto-consent)
      │
      ▼
DCE tenant (spoke)
├── Corp-Hub  (shared services: HR, IT, Finance, Training)
└── DCE-Hub   (brand: Operations, ClientServices, Marketing, Docs)
      │
      ├── Dynamic security groups (AllStaff, Managers, Marketing, Stylists)
      │     ▲
      │     └── populated by user attributes set at HTT side
      │
      ├── DLP enforced (External-Sharing-Block)
      ├── CA enforced tenant-wide (P2 unlocked)
      └── Tenant hardened (no external resharing, no legacy auth)
```

This is the pattern we want every brand on: **identity authored centrally at HTT via attributes, propagated to spoke tenants via cross-tenant sync + B2B, populating dynamic groups at the spoke, which gate access to brand-specific SharePoint / Teams / DLP scope. CA + tenant hardening enforced spoke-side. DCE is the only tenant where every layer of this is live today.**

### The Megan collaboration ask for DCE

1. **Flip spoke-side auto-redeem on the DCE tenant** so HTT-issued guest invites land cleanly without per-invite acceptance.
2. **Apply the new-user runbook on DCE first** the moment we hand it over (see §6). The dynamic groups are pre-built; we just need population logic.
3. **ABM → MDM tie-in** once Tyler delivers the DUNS — DCE is all-Mac, no front-desk shared logins, full device management is the goal (Apr 10: *"There will be no 'hey, let me run into your front desk computer.' I want to be able to do everything."*).
4. **Confirm the deny-by-default partner-override scope** (Apr 13 written answer) so we can flip HTT's default cross-tenant policy and let DCE inherit a clean deny-by-default posture instead of inheriting open.

---

## 6. Onboarding / offboarding lifecycle — the architecture & the ask

### What Megan said she wants (Apr 10, verbatim)

> *"The way that I want Delta to be right off the jump is setting the standard for, hey, when someone gets onboarded into Delta Crown, this is the kind of experience that we want them to have... I want to have an easy way for us to onboard them with that right information that gets tied to their Microsoft account, like in all the relevant user properties, that we might need to track, like the IDs of the salon studio, anything from Zenoti, like... So I can dynamically add someone to a group that gives security permissions to this thing or dynamically add someone to a group that then adds them to that conditional access policy because it's about, for me, it's about getting ahead of it up front."*

That is **exactly** the architecture HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md proposes. The collaboration ask is to operationalize it.

### The architecture in one frame

```
NEW HIRE EVENT (HR signal — name, brand, location, role)
   │
   ▼
[Megan in HTT-ANCHOR] sets canonical user properties:
   htt_role           (e.g., Stylist, Manager, OwnerOperator, CorpStaff)
   htt_brand          (HTT | BCC | FN | TLL | DCE)
   htt_region         (geographic region for routing)
   htt_location_ids   (Zenoti / FTG / salon-studio IDs as multi-value)
   htt_access_tier    (Standard | Elevated | Privileged)
   │
   ▼
Dynamic security groups auto-evaluate at HTT-ANCHOR:
   - {brand}-AllStaff       (htt_brand = X)
   - {brand}-{role}         (htt_brand = X AND htt_role = Y)
   - {brand}-Managers       (htt_brand = X AND htt_role IN [Manager, Director, OwnerOperator])
   - {brand}-{location}     (htt_location_ids contains Z)
   │
   ▼
License assignment (group-based licensing — assign to {brand}-AllStaff)
   │
   ▼
Cross-tenant sync propagates user identity to spoke tenant
   │
   ▼
Spoke tenant dynamic groups pick up the attributes:
   - DCE: AllStaff (6 today), Managers (0), Marketing (0), Stylists (0)
   │
   ▼
Access gates fire automatically:
   - SharePoint site permissions (group → role matrix)
   - Teams channel membership
   - CA policy scope (which auth requirements apply)
   - DLP policy scope (which data labels enforce)
   - Mailbox + DDG membership
   - License-driven feature access (Premium / E5 features)

OFFBOARDING
   │
   ▼
[Megan in HTT-ANCHOR] sets:
   accountEnabled = false
   htt_access_tier = Disabled
   │
   ▼
All dynamic groups remove the user automatically.
All downstream access (SharePoint, Teams, mailboxes, license, CA scope) drops in lockstep.
   │
   ▼
30/60/90-day retention timers fire for mailbox / OneDrive / Graph data.
```

### What we need from Megan to operationalize this

| Step | Tyler delivers | Megan executes | Status |
|---|---|---|---|
| 1. Define the canonical attribute schema | ✅ Done in `HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md` | — | Live |
| 2. Author the new-user runbook (per-brand checklist of attributes, groups, license SKUs) | ⏳ **Tyler owes** — single biggest open commitment | — | Open (§10 row 9) |
| 3. Create the per-brand dynamic groups at HTT-ANCHOR | ⏳ Tyler scripts | — | Pending runbook |
| 4. Wire group-based license assignment | ⏳ Tyler | — | Pending runbook |
| 5. Apply runbook on every new user create | — | ⏳ **Megan agreed Apr 10 + Apr 13** | Waiting on (2) |
| 6. Spoke-side auto-redeem on DCE / FN | — | ⏳ Megan / Sui Generis tenant admin | Open (§10 row 8) |
| 7. Document the offboarding playbook | ⏳ Joint | ⏳ Joint | Gap — file as bd follow-up |
| 8. Validate end-to-end on the next DCE hire | — | — | Validation event, not work |

### Why this is the centerpiece of the call

- **Megan is asking for it.** Twice. She wants the runbook so she can run it.
- **The infrastructure is built.** DCE has the dynamic groups, the SharePoint sites, the DLP, the CA, the Teams workspace — all empty and waiting for attribute-driven population.
- **DCE is the lowest-risk validation target** — small user count, no legacy data migration (Apr 29 decision), greenfield posture.
- **Once it works on DCE, the same runbook copies to FN, BCC, TLL** with brand-specific group definitions. That's the scale story.

---

## 7. Other lifecycle capabilities (not Delta-specific)

| Capability | State | Owner |
|---|---|---|
| New-hire device shipping (Win11 Pro corp / Mac for DCE) | Live for Win; DCE Mac blocked on DUNS | Sui Generis |
| Atera RMM enrollment | Live | Sui Generis |
| ThreatDown EDR | Live (Tyler + Dustin gap, plus personal-computer list) | Sui Generis |
| Atera API → Freshdesk / People Support Hub | Pending Apr 10 check | Sui Generis to report |
| Identity attributes in production today | Live in **TLL only** via Wiggum SP. HTT/BCC/FN/DCE not yet | HTT (Tyler) |
| Cross-tenant-sync-driven license provisioning | Live for TLL→HTT (Fabric Free auto-assign via `TLL-Franchisee-Dynamic`) | HTT |
| Apple Business Manager (DCE all-Mac) | Blocked on DUNS | Tyler |

**The single biggest unblock you can hand Megan tomorrow:** the new-user runbook (per §6 step 2). She has explicitly offered to follow it twice (Apr 10 verbal, Apr 13 written *"send me the checklist and I'll follow it"*). It's a 1-page-per-brand artifact, not a project. Even a v0.1 of just the DCE row gets the validation loop turning.

---

## 8. Device management — quick state

- **RMM:** Atera (confirmed Apr 10).
- **EDR:** ThreatDown (confirmed Apr 13). Gap: Tyler + Dustin endpoints + small list of personal computers.
- **Standard hardware:** Always Windows 11 Pro from Sui Generis; never Home.
- **DCE:** All-Mac strategy (ABM + MDM). Blocked on DUNS.
- **Franchisee devices (TLL/Frenchies):** Frenchies still under FTG contracts ($2K/mo equipment rental, 10-year terms) — Sui Generis cannot engage. TLL is in scope.
- **No Intune / no formal MDM on HTT corporate.** Cyber-insurance gap. ThreatDown + Atera coverage may be enough for attestation — confirm what the letter from Sui Generis can claim.

---

## 9. Proposed RACI

| Domain | HTT (Tyler) | Sui Generis (Megan) |
|---|---|---|
| Identity architecture, cross-tenant policy, attribute schema | **R / A** | C / I |
| Pax8 CSP licensing purchase, renewals, term alignment | I | **R / A** |
| Direct-billed Microsoft (Web Direct, Azure under HTT-ANCHOR) — sunsetting | **R / A** | I |
| New-user device provisioning (Win11 Pro, ship, RMM enroll) | I | **R / A** |
| New-user attribute set + dynamic-group adds + license assignment | **R** (define) | **A** (execute per runbook) |
| Conditional Access policy authorship | **R / A** | C |
| CA deployment per tenant | C | **R / A** (HTT/TLL/DCE/FN done; BCC pending) |
| Endpoint protection (Atera + ThreatDown) | I | **R / A** |
| M365 backup (Datto / Veeam / TBD) | C | **R** — pricing in flight (Apr 13) |
| Cyber insurance attestation letter | **R** (collect, deliver to CFO) | **A** (provide letter — EDR/patch/firewall/backup) |
| Franchisee device support (TLL only — Frenchies blocked by FTG) | C | **R / A** |
| Phishing simulation | C | **R** — pricing in flight |

---

## 10. Open questions to ask Megan, in priority order

> **Note on tracking:** bd workspace is currently stranded on the legacy SQLite backend (bd 1.0.2 only supports Dolt). Migration via `bd init --from-jsonl` is documented but deferred so we don't run schema-changing commands the day before the call. **This list IS the source of truth** for follow-ups until bd is migrated. Filed as priority bd-restore task.

**Severity legend:** 🔴 P0 (call/this week) · 🟠 P1 (this sprint) · 🟡 P2 (next sprint)

| # | Item | Severity | Owner | Due |
|---|---|---|---|---|
| 1 | **Pax8→AppRiver Apr 27 billing transfer (`acd7573e-a487-41d9-83ce-560dea432e95`)** — confirm intentional, scope, action by May 27 | 🔴 | Tyler | 2026-05-27 |
| 2 | **Teams Premium 25 seats** — SKU, term, order status; are users back on Premium? | 🟠 | Megan | 2026-05-14 |
| 3 | **HTT E5 (no Teams) Pax8 replacement** — order status + coverage gap | 🔴 | Megan | 2026-05-14 |
| 4 | **HTT-ANCHOR Azure payment method** verification (Apr 25 reminder) | 🟠 | Tyler | 2026-05-14 |
| 5 | **BCC MOSA → Pax8 CSP** — start now or ride to October BB expiration | 🟠 | Megan | 2026-05-21 |
| 6 | **M365 backup pricing** from Sui Generis (Apr 13 owed) | 🔴 | Megan | 2026-05-14 |
| 7 | **Cyber insurance attestation letter** — EDR/patch/firewall/backup, in writing | 🔴 | Megan | 2026-05-14 |
| 8 | **Frenchies + DCE spoke-side auto-redeem** — owner + timing | 🟠 | Sui Generis tenant admin | 2026-05-21 |
| 9 | **New-user runbook** — Tyler authors, hands to Megan | 🔴 | Tyler | 2026-05-14 |
| 10 | **Atera customer-specific API** — outcome of Apr 10 check; Freshdesk ingestion path | 🟠 | Megan | 2026-05-14 |
| 11 | **DUNS for DCE Apple Business Manager** | 🟠 | Tyler | 2026-05-14 |
| 12 | **Dashboard questionnaire** — finish in-app or verbal walkthrough? | 🟡 | Tyler | 2026-05-14 |
| 13 | **Phishing simulation pricing** from Sui Generis (Apr 13 owed) | 🟡 | Megan | 2026-05-21 |
| 14 | **GDAP approval workflow** — Megan to check (Apr 13) | 🟡 | Megan | 2026-05-21 |
| 15 | **Disable Ingram-Micro-LicenseManager + O365Support-MSP-Connector SPs (TLL)** | 🟠 | Tyler | 2026-05-14 |
| 16 | **7 BCC pwd-never-expires accounts** — share list with Megan for triage | 🟠 | Tyler | 2026-05-14 |
| 17 | **TLL CNAME for CallView** (Colton's analytics) — Megan May 6 ask | 🟠 | Tyler | 2026-05-08 |
| 18 | **Consolidated per-tenant Pax8 invoice export** for Q2 recon | 🟡 | Megan | 2026-05-21 |
| 19 | **ThreatDown coverage gap** — install on Tyler + Dustin endpoints; resolve personal-computer list | 🟠 | Megan + Tyler | 2026-05-14 |
| 20 | **Recursive `dashboard/dashboard/` cleanup** — repo hygiene | 🟡 | Agent | 2026-05-21 |
| 21 | **bd workspace migration** — `bd init --from-jsonl` to recover the 7 SQLite-era issues; required before any new bd issues can be filed | 🟠 | Tyler/Agent | 2026-05-14 |
| 22 | **Re-run full CTU audit** post-call (Phase A deferred from this prep) | 🟡 | Agent | 2026-05-14 |

---

## 11. The repos in 30 seconds

- **`control-tower`** (`/Users/tygranlund/dev/01-htt-brands/control-tower`) — Multi-tenant Azure governance platform. Real integrations to Cost Management API, Policy Insights, Resource Manager, Microsoft Graph. ~35,000 LOC, 661 tests passing, 6 phases complete. Multi-tenant credentials via Azure Key Vault (`{tenant-id}-client-id` / `{tenant-id}-client-secret`). **Gating step before live data flows for all 4 brand tenants:** an app registration named `governance-platform-reader` per tenant with Reader / Cost Management Reader / Security Reader / 7 Graph permissions and admin consent (`docs/QUICK_START_CHECKLIST.md`). This is the platform that will eventually answer "what does our M365 + Azure cost across HTT and the brands, in real time."
- **`Cross-Tenant-Utility`** (this repo) — PowerShell-based 7-domain identity audit toolkit (B2B Collab, Direct Connect, Guest Inventory, CA, Cross-Tenant Sync, Teams Federation, Identity Governance). Phase 1 audit reports generated. The dashboard at `https://t-granlund.github.io/ctu-dashboard/` is the published companion (passphrase `CrossTenant!`).
- **`DeltaSetup`** (`/Users/tygranlund/dev/04-other-orgs/DeltaSetup`) — Delta Crown Extensions model-tenant example. **Working tree restored** (28 entries, `gh-pages` branch, deployment runbook, full HTML deliverables). The May 6 brief draft lives here; this May 7 brief supersedes.

---

## 12. What changed since the April 10 call

- ✅ **Apr 13:** Megan returned the 20-question follow-up in writing (`msp-responses-megan-2026-04-13.md`). Closed the partner-override scope, EDR, Atera API, GDAP timeboxing, SGI Techs structure, BCC MOSA timeline, onboarding-checklist offer, and several SP-removal authorizations.
- ✅ **Apr 10–13:** AppRiver SP disable executed; CA re-audit run.
- ✅ **Apr 20:** Comprehensive end-to-end audit (`reports/COMPREHENSIVE-END-TO-END-AUDIT-2026-04-20.md`).
- ✅ **Apr 22:** Megan cleaned 68 shared mailboxes on TLL.
- ✅ **Apr 23:** CA verify + MFA verify audits + CFO cyber-insurance response drafted.
- ✅ **Apr 27:** Pax8 US submitted billing-ownership transfer from AppRiver on HTT's behalf (Transfer ID `acd7573e-…`, expires May 27).
- ✅ **May 3:** HTT M365 E5 (no Teams) expired on schedule.
- ✅ **May 4:** HTT Office 365 Extra File Storage expired on schedule.
- ✅ **May 6:** DeltaSetup working tree restored (was empty when prior brief drafted at 11:03 AM today).
- ⚠️ **Apr 2:** Teams Premium (25 seats) lapsed; repurchase decision still hasn't surfaced.
- ⚠️ **Apr 20–22:** Brand-email spoofing wave on HTT + TLL. DMARC reject proposed and reconsidered (Marketing impact via Kristin). Open thread.
- ⚠️ **Apr 22:** Megan asked whether dashboard has export feature — implies questionnaire not finished in-app.
- ⚠️ **Apr 25:** Azure asked HTT to verify on-file payment method. Open.
- 🆕 **May 6 8:56 AM CT:** Megan's "Lash Lounge DNS changes" — Colton's CallView analytics dashboard needs CNAME on a `thelashlounge.com` subdomain (no MX/TXT/A changes). Tyler to action.
- 🆕 **May 6 (today, after prior brief drafted):** Call rescheduled from May 6 1:00 PM to **May 7 1:15 PM CT**.

---

## 13. Sources

- `msp-responses-megan-2026-04-13.md` — Megan's 20/20 written follow-up
- `megan-tyler-transcript-4-10` — Apr 10 call transcript
- `reports/POST-CALL-SUMMARY-2026-04-10.md`
- `reports/MEGAN-CALL-PREP.md`
- `reports/PHASE-1-CONSOLIDATED-ANALYSIS.md`
- `reports/COMPREHENSIVE-END-TO-END-AUDIT-2026-04-20.md`
- `reports/Audit_ConditionalAccess_2026-04-23_VERIFY/`
- `reports/MFA-VERIFY-2026-04-23.md`
- `reports/CFO-Cyber-Insurance-Response-2026-04-23.md`
- `HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md`
- `/Users/tygranlund/dev/04-other-orgs/DeltaSetup/MEGAN-CALL-BRIEF-2026-05-06.md` (prior draft, superseded by this file)
- Microsoft case `TrackingID#2604020040000719`
- Pax8→AppRiver Transfer ID `acd7573e-a487-41d9-83ce-560dea432e95` (expires 2026-05-27)
- Dashboard: `https://t-granlund.github.io/ctu-dashboard/` (passphrase shared separately; do not forward in the brief)

---

*Generated 2026-05-06 13:35 CT for the May 7, 2026 1:15 PM CT call. No source files outside this brief and the agent prompt were modified during preparation. Audit re-run deferred to post-call (bd issue filed). Dashboard data-layer refresh tracked separately — see Phase B/C/D status in the prompt.*
