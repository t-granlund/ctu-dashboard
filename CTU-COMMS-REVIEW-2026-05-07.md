# CTU Project Communications Review

**Reviewer:** Ops Comms Collie 🐕‍🦺  
**Date:** 2026-05-07  
**Scope:** All stakeholder-facing communication artifacts for the Cross-Tenant Utility project  
**Evaluated against:** 6 criteria requested by author (stakeholder language, action clarity, risk framing, insurance readiness, MSP communication, franchisee impact) + 10 Collie review checks  

---

## Overall Verdict: TIGHTEN BEFORE SENDING 🔄

The project has **impressive technical depth** and **exceptional MSP relationship management**. The audit findings are real, the remediation roadmap is structured, and the MSP collaboration model is well-designed. But the communication artifacts are built for the *identity governance engineer who wrote them*, not for the COO, PE partner, or insurance reviewer who needs to act on them. The gap isn't effort — it's translation.

**If a Riverside Capital partner opened `HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md` today, they would not finish the executive summary.** Not because it's wrong, but because it speaks a language they don't speak and doesn't answer the only question they have: *"How does this affect the portfolio's risk profile and what do I need to do about it?"*

---

## Criterion 1: STAKEHOLDER LANGUAGE ⚠️ Needs Significant Work

### What's Working
- The dashboard's top findings are the best-written items in the project: **"FN + TLL: ZERO MFA for external users"** is clear, alarming, and immediately understandable. The description — "External users access resources without MFA. Combined with open B2B = full unauthenticated lateral access path" — is the rare technical-to-business translation that actually lands.
- The Megan Overview Guide is the most accessible document: plain-English framing, operating-model language, "Tyler defines the standard, Megan helps make it repeatable."
- The DCE runbook uses conversational, clear language: "No more 'remember to add them to seven things by hand' nonsense."

### What Needs Fixing

**🔴 The main analysis document (31.7 KB) is written for you, not for your audience.**

Examples of untranslated jargon that a COO or PE partner would have to google:

| Current language | Who it's for | What a COO hears |
|---|---|---|
| "B2B Collab Inbound = All Apps / All Users" | Entra admin | "???" |
| "isSyncAllowed: true" | Graph API consumer | "???" |
| "userType mapping (Guest vs Member)" | Identity engineer | "???" |
| "Service Principal" | Azure developer | "A back-door app account?" |
| "Dynamic security groups" | IT pro | "Groups that change... somehow?" |
| "Entra ID P2 blanket entitlement" | Licensing specialist | "???" |
| "Cross-tenant auto-redemption" | M365 architect | "???" |
| "MTO membership" | Microsoft specialist | "???" |

**The executive summary is 3 paragraphs of narrative before the reader learns anything actionable.** The first line is: "HTT Brands operates a multi-tenant Microsoft 365 environment spanning five brands and 200+ franchise locations." This is context, not conclusion. A PE partner reading this wants the answer first: *"Your front door is unlocked. Any external organization can currently create accounts in your system without restriction. We have a plan to fix it in 5 phases, starting immediately."*

**The dashboard compliance matrix is labeled in engineer-speak:** "Default B2B Inbound = BLOCK", "Default DC Inbound = BLOCK", "Guest role = Restricted", "Email-verified join disabled". These are *your* internal baseline names, not the controls an insurance reviewer or COO recognizes.

### Recommended Fixes

1. **Write a 1-page "Board-Level Summary" document** (separate from the 31 KB analysis) that frames findings in portfolio-risk language. Structure:
   - **Headline (1 sentence):** The security posture of our Microsoft 365 environment has significant gaps that would fail a cyber insurance audit and expose the portfolio to preventable breach risk.
   - **3-5 findings in business language** (see table below)
   - **Ask:** "We need [X] decisions by [Y] date to proceed with Phase 2 remediation."

2. **Translate the top 5 findings into business language for every audience:**

| Technical finding | Business translation (COO/PE) | Business translation (Insurance) |
|---|---|---|
| Default B2B Inbound = All Users / All Apps | Any external organization can currently create user accounts in our system without restriction — equivalent to leaving the front door unlocked | No access control on external identities — fails basic hygiene requirements |
| TLL has 534 guest accounts, 399 never signed in, 354 pending >3 years | 72% of external accounts at our largest brand (140 locations) are stale or abandoned — these are dormant attack surfaces | Excessive privileged access surface — 722 unmanaged external accounts across portfolio |
| Franworth has full Direct Connect to TLL with no MFA trust | A third-party consulting firm had invisible, unrestricted access to our largest brand's systems with no audit trail and no second-factor authentication | Unrestricted third-party access without MFA — critical finding |
| FN + TLL: no MFA enforcement for external users | At 2 of 5 brands, external users can access company resources without verifying their identity with a second factor | MFA not enforced for external users — non-compliant with carrier requirements |
| No M365 backup across any tenant | If email, SharePoint, or Teams data is deleted or encrypted by ransomware, it cannot be recovered from a separate backup | No SaaS backup — single point of data loss for all M365 data |

3. **Rename compliance controls in the dashboard** to use insurance/audit-standard language:
   - "Default B2B Inbound = BLOCK" → "External identity access control (deny-by-default)"
   - "Guest role = Restricted" → "External user directory access restricted"
   - "MFA for external users" → "Multi-factor authentication enforced for external access" (this one is already OK)
   - "Email-verified join disabled" → "Self-service external account creation disabled"

---

## Criterion 2: ACTION CLARITY ✅ Strong — With One Gap

### What's Working
- The Megan Call Brief is **exceptional** on action clarity. Every item has an explicit owner and a specific date (May 14, May 21, May 27). The decision log template is ready for live capture. The closing script reads back owners and dates.
- The RACI matrix in §9 of the call brief is clear and balanced.
- The DCE runbook is crystal clear on who does what: "Owner of schema: Tyler / HTT. Executor on new-user creation: Megan / Sui Generis."
- The dashboard phases have gate approvers named.

### What Needs Fixing

**🟡 The remediation roadmap (PHASED-REMEDIATION.md) lacks consequence framing.**

The roadmap says "Phase 3 is the highest-risk phase" and lists actions per phase, but it doesn't say:
- What happens if we skip Phase 2 and go straight to Phase 3? (Answer: MFA isn't enforced before you lock down access, which means you could lock out legitimate users)
- What happens if Phase 3 doesn't complete by Week 10? (Answer: the open-door posture persists)
- What is the business consequence of inaction? What changes between "current state" and "post-remediation" from a risk perspective?

**🟡 Some action items in the dashboard data are stale.**

The `callActionItems` in `msp-data.js` lists items like "Re-run CA/MFA audit on DCE and FN" with note "✅ Done — DCE has 3 CA policies, FN has 2" but still shows `status: "ready"` instead of `"complete"`. Stale action items undermine credibility.

**🟡 The insurance attestation letter has no draft.**

The project asks Megan for a "written attestation covering EDR, patching, firewall posture, and backup posture" but doesn't provide a template. This is the #1 deliverable for CFO/compliance — a draft would dramatically increase the chance Megan returns something usable.

### Recommended Fixes

1. **Add a "consequence if delayed" column** to the phased roadmap for each phase:
   - Phase 2: "If delayed beyond Week 5, guest accounts continue to accumulate unchecked, and the MFA enforcement gap at FN/TLL persists through Q2."
   - Phase 3: "If delayed beyond Week 10, the open-door B2B posture remains — any organization worldwide can initiate collaboration. A breach during this window would be materially harder to contain."
   - Phase 4: "If delayed beyond Week 16, no automated lifecycle management exists — stale accounts accumulate indefinitely."

2. **Draft a 1-page attestation letter template** for Megan to complete. Structure:
   > "This letter confirms that Sui Generis Inc, as the managed services provider for HTT Brands, provides the following security controls across all five Microsoft 365 tenants: [EDR: ThreatDown, coverage %], [Patching: Atera RMM, cadence], [Firewall: posture description], [Backup: vendor, frequency, last test date]. Signed: _____ Date: _____"
   
   Give Megan a fill-in-the-blanks, not a blank page.

3. **Update stale action items** in `msp-data.js` — mark completed items as complete.

---

## Criterion 3: RISK FRAMING ⚠️ Needs Significant Work

### What's Working
- The Franworth finding is the gold standard in this project: "Full Direct Connect access to TLL with NO MFA trust — invisible access path. IMMEDIATE ACTION REQUIRED." This is unambiguous, business-oriented, and appropriately urgent.
- The GDAP analysis does an excellent job of explaining the escalation path: "Any SGI Techs member could reset an admin password → sign in as that admin → have Global Admin access." This is threat-model language that a COO can follow.
- The finding severity ratings (Critical/High/Medium/Low) are technically accurate.

### What Needs Fixing

**🔴 Technical severity ≠ business risk. A "Critical" finding means something different to an identity engineer than to a PE partner.**

The current framing is: "GAP-1: Default policy allows inbound B2B from any tenant worldwide — Severity: Critical."

The business framing should be: *"Anyone on the internet can currently create an account in our corporate Microsoft environment. This is the identity equivalent of leaving your building's front door open — not a theoretical risk, a present, exploitable condition that exists today across all five brands."*

**🔴 No financial quantification anywhere.**

For a PE-owned portfolio, risk without financial context is noise. The project doesn't need to produce a full actuarial model, but it should frame magnitude:
- Average cost of a ransomware incident for a franchise portfolio: $X (industry data is available)
- Insurance coverage gap: "Our current policy likely excludes coverage for incidents exploiting unpatched MFA gaps"
- PE diligence risk: "A Riverside Capital deal-team review of these findings would flag them as remediation prerequisites"

**🟡 The 534 TLL guest accounts finding is undersold.**

The data says 534 guest accounts, 399 never signed in, 354 pending invitations over 3 years old, 72.7% cleanup candidates. This is framed as a "cleanup opportunity." It should be framed as: **"Our largest brand (140 locations) has over 500 external accounts, 3 out of 4 of which are dormant. Each dormant account is an unused key that could be copied. This is not a janitorial task — it's an attack-surface reduction that should be completed before the next insurance renewal."**

### Recommended Fixes

1. **Add a "Business Risk Statement" to each Critical and High finding** — one sentence that a COO can repeat in a board meeting:
   - GAP-1: "Our Microsoft environment currently allows any external organization to create accounts in our system — this would be flagged as a material deficiency in any cyber insurance audit or PE diligence review."
   - GAP-2: "Our largest brand (140 locations, $X revenue) has the most permissive external access policy — the opposite of what risk management requires."
   - GAP-3: "External MFA enforcement exists in policy but is set to 'report-only' — meaning it logs violations but doesn't block them. This is a camera without a lock."

2. **Add a "portfolio risk heat map"** to the dashboard — not just technical severity, but business risk axes: (likelihood × financial impact), with each finding plotted. A PE partner thinks in portfolio terms, not in "7 critical, 42 high" severity counts.

3. **Frame the guest inventory in attack-surface language, not cleanup language:**
   - Current: "388/534 cleanup candidates (72.7%)"
   - Better: "534 external keys exist at TLL. 399 have never been used. 354 have been waiting over 3 years. Each is a potential entry point. Removing them cuts the attack surface by 72%."

---

## Criterion 4: INSURANCE READINESS ⚠️ Partially Ready — Gaps That a Reviewer Would Catch

### What's Working
- The cyber insurance gaps component in the dashboard is structured well: per-control, per-tenant pass/fail/verify status.
- The insurance gap assessment covers the right controls: MFA, EDR, device management, backup, security awareness, password policy.
- The request for a written attestation from Sui Generis is the right move.

### What Needs Fixing

**🔴 The cyber insurance gap data is stale and contradicts known answers.**

The `cyberInsuranceGaps` data in `msp-data.js` still asks:
- "Does Atera include EDR?" — **ThreatDown was confirmed as the EDR on April 13.** This question has been answered for 24 days.
- "Does Sui Generis provide M365 backup?" — **Megan already confirmed no paid backup exists** on April 13. This is marked "fail" but the `needFromMSP` still asks the question instead of stating the gap.
- "Can Sui Generis provide phishing simulation?" — **Megan already said yes, needs pricing.** Still shows as "fail" with no progress note.

An insurance reviewer who looked at this dashboard would see **incomplete and outdated information**. The dashboard doesn't reflect what's been learned — it reflects what was known in March.

**🔴 No evidence of enforcement, only evidence of policy existence.**

Insurance reviewers don't accept "we have a Conditional Access policy" as MFA evidence. They ask:
- "Show me the sign-in logs proving MFA challenges are happening."
- "What percentage of users have completed MFA registration?"
- "When was the last MFA bypass attempt, and how was it handled?"

The dashboard shows policies exist but not that they're working.

**🟡 No insurance-specific summary page.**

If an insurance reviewer opens the dashboard, they land on the Executive Overview (106 findings, 722 guest accounts, 9 unknown tenants, 5% baseline compliance). This is an audit summary, not an insurance submission. They'd need to click through to the "Cyber Insurance Controls" section buried under "Reference Material" in the MSP walkthrough — which is behind a collapsible accordion.

### What an Insurance Reviewer Would Ask Next

1. "You say MFA is enforced at HTT, FN, and DCE — can you show me the enforcement rate (successful MFA challenges / total sign-ins) for the last 30 days?"
2. "You say ThreatDown is the EDR — what percentage of endpoints across all 5 tenants have it installed? You note Tyler and Dustin are missing — that's the IT Director and another admin. How is that acceptable?"
3. "You have no M365 backup. What is your ransomware recovery plan for Exchange, SharePoint, OneDrive, and Teams data?"
4. "The Franworth finding shows unrestricted access without MFA. Is this remediated? When was it remediated? Can you show me the before/after?"
5. "Who is the named individual responsible for maintaining these controls? If Sui Generis leaves, what happens?"

### Recommended Fixes

1. **Create a standalone "Insurance Readiness" page in the dashboard** — not buried under MSP reference material. It should show:
   - Per-control status with dates (last verified, last tested, last incident)
   - Evidence links (sign-in logs, EDR coverage reports, backup test results)
   - Named responsible party per control
   - Gap remediation timeline with concrete dates

2. **Update the `cyberInsuranceGaps` data** to reflect April 13 answers:
   - EDR: PASS (ThreatDown) with note: "Coverage gap: IT Director + 1 admin + personal-computer list"
   - M365 Backup: FAIL with note: "No paid backup. Pricing requested from Sui Generis. Expected by May 14."
   - Security Awareness: IN PROGRESS with note: "Sui Generis can provide; pricing requested. Expected by May 21."

3. **Draft the attestation letter template** (see Criterion 2 above).

4. **Add enforcement evidence**, not just policy existence. Even a manually-entered "last verified" date and coverage percentage per control would help.

---

## Criterion 5: MSP COMMUNICATION ✅ Strong — With One Important Caveat

### What's Working
This is the project's **strongest communication area**. The MSP relationship management is genuinely well-handled:

- **The Megan Overview Guide** is the best artifact in the project for a non-technical audience. It opens with: "This is not a blame document. It is the map so HTT and Sui Generis can line up, make decisions, and work from the same source of truth." This is exactly right.
- **The RACI is balanced.** Tyler owns architecture/policy/standards; Megan owns execution/licensing/devices. Neither side is being asked to own the other's domain.
- **The escalation view** is constructive: it gives Megan better tools (Freshdesk queue visibility, metrics, self-serve status) rather than demanding she change her workflow.
- **The "if challenged" talk tracks** are smart and respectful: "I'm not trying to relitigate Apr 13 — your answers are already captured. I'm only confirming what changed and what still needs an owner/date."
- **The closing read-back script** is excellent practice — it prevents post-call misunderstanding.
- **The DCE runbook** positions Megan as the executor, not the audience: "Megan validates + Tyler iterates."
- **The "do not re-ask" table** (§4 of the call brief) is a sign of respect for Megan's time.

### What Needs Fixing

**🟡 The call brief is 33 KB — it's an internal weapon, not a shareable document.**

If Megan saw the full call brief, she would see:
- An exhaustive 22-item open-question list with severity labels (🔴🟠🟡)
- A detailed accounting of every item she "owes" with dates
- A "what changed since April 10" section that reads like a prosecution exhibit
- 13 source documents cross-referenced

None of this is wrong. But the *density* of obligation-tracking, combined with the excellent collaborative language, creates a tension: the words say "partner" but the artifact says "auditor." If Tyler shares any part of this with Megan, it should be the Overview Guide — never the raw call brief.

**🟡 The "Megan owes" / "Tyler owes" framing is transactional.**

The decision log has separate "Megan owes" and "Tyler owes" tables. This is functionally correct but emotionally one-dimensional. It reduces a strategic partnership to a deliverables tracker. Consider reframing as "Next steps — joint" vs "Next steps — Sui Generis action" vs "Next steps — HTT action," which positions them as shared objectives rather than owed debts.

### Recommended Fixes

1. **Never share the full call brief with Megan.** The Overview Guide is the shareable version. The call brief is Tyler's internal prep doc — treat it as such.
2. **Reframe "owes" language** in the decision log from "Megan owes / Tyler owes" to "Sui Generis actions / HTT actions / Joint actions."
3. **Add a "partnership wins" section** to the dashboard MSP portal — things that have gone well since April 10 (Megan returned 20/20 answers, cleaned 68 TLL mailboxes, confirmed EDR, deployed CA on 3 tenants). The current framing is 100% gap-focused, which is exhausting for a partner who has been delivering.

---

## Criterion 6: FRANCHISEE IMPACT ❌ Critical Gap — No Franchisee Communication Exists

### What's Working
- The DCE runbook mentions "Require MFA registration on first sign-in" — this implicitly acknowledges franchisee experience.
- The architecture document's §7 ("Why This Matters Beyond Security") is the only place that mentions franchisee experience explicitly: "A TLL franchise owner who needs Power BI access, FAC collaboration, convention site access, and eventually brand-specific SharePoint content is touched by four separate identity pipelines."
- The People Support Hub and Groups Hub designs are franchisee-friendly in concept (self-service, role-based, contextual).

### What Needs Fixing

**🔴 There is zero franchisee-facing communication about the security changes coming.**

The project will:
1. **Require MFA at BCC, FN, and (fully enforced) TLL** — franchisees and store managers will need to set up authenticator apps on their phones. This is a behavior change for ~200 locations.
2. **Potentially disable stale guest accounts** — 388 cleanup candidates at TLL alone. If a franchisee's guest account is disabled, they lose access to whatever that account granted.
3. **Lock down cross-tenant access** (deny-by-default) — this changes how franchisees experience access to corporate resources. Some may see consent prompts for the first time.
4. **Enforce MFA for external users** — this changes the login experience for any external collaborator.
5. **Change the onboarding experience** — new hires will be created via a runbook, not ad hoc. Franchisee hiring managers may need to provide different information.

None of these changes have a franchisee communication plan. Not even a draft.

**🔴 No "what changes for me" document exists for any audience.**

A franchisee reading the project artifacts would have no idea:
- Will my store managers need to do something? (Yes: set up MFA)
- Will anything break when deny-by-default goes live? (Maybe: if they use guest accounts, they might see access changes)
- Do I need to provide anything? (Yes: location IDs, role information for new hires)
- Who do I call if something breaks? (Freshdesk, via the new routing model)

**🟡 The TLL guest cleanup has no impact assessment.**

Disabling 388 accounts at TLL is described as "no impact expected" in the audit data. But 22 of those accounts are `@httbrands.com` (corporate) and 14 are `@franworth.com` (a known business partner). "No impact expected" is a technical assessment — it means no access will break that we know about. A franchisee would ask: "What happens if I lose access to my Power BI dashboard on Monday morning?"

### Recommended Fixes

1. **Create a "Franchisee Impact Brief" — 1 page per brand** — that answers:
   - "What is changing?" (1-2 sentences in plain English)
   - "What do I need to do?" (concrete steps: "Download Microsoft Authenticator. When you next sign in, you'll be prompted to set it up. This takes about 2 minutes.")
   - "Will anything break?" (specific: "Your Power BI access will continue. Your convention site access will continue. If you had a guest account you haven't used in 90+ days, it may be reviewed — contact [support] if you're unsure.")
   - "Who do I call?" (Freshdesk link + phone)

2. **Create a "Franchise Business Coach cheat sheet"** — one page for the FBCs who will field franchisee questions. They need to know what's happening before franchisees ask.

3. **Add a "franchisee impact" column** to the remediation roadmap:
   - Phase 2 Quick Wins: "Low franchisee impact — most changes are backend policy settings. MFA report-only mode means no visible change yet."
   - Phase 3 Deny-by-Default: "Medium franchisee impact — MFA enforcement may prompt franchisees for first-time setup. Some guest accounts may require re-authorization. Coordinate with franchise ops before enabling."
   - Phase 4 Governance: "Low visible impact — quarterly access reviews are IT-internal. Franchisees may see access expiration notices."

4. **Do NOT describe the TLL guest cleanup as "no impact expected."** Say: "388 dormant accounts will be disabled. We believe none are actively used, but we will provide a 7-day review window before disabling and a self-service reactivation path for any affected franchisee."

---

## Checklist Coverage (Ten Review Checks Applied to the Project Communication Suite)

| # | Check | Status | Notes |
|---|---|---|---|
| 1 | Jargon Leak Detection | ❌ | The main analysis doc is 90%+ jargon. Dashboard controls use internal technical names. |
| 2 | Lead With The Answer | ❌ | The 31 KB analysis doc buries the conclusion. No artifact opens with "your front door is unlocked." |
| 3 | Defensiveness / Over-Apology | ✅ | No defensiveness detected. The project is appropriately direct about gaps. Good. |
| 4 | Business Translation for Findings | ❌ | Technical findings exist without business translation in most artifacts. The dashboard top-10 is the exception, not the rule. |
| 5 | Concrete Ask / Next Action | ⚠️ | Call brief is excellent. Dashboard and analysis doc lack concrete external asks. |
| 6 | Hedge Calibration | ⚠️ | "No impact expected" on TLL cleanup is under-hedged (should say "we believe but haven't verified"). Some severity ratings may be over-hedged (GAP-3 is "High" but functionally is Critical since report-only MFA doesn't block anything). |
| 7 | Tone Matches Audience | ❌ | Most artifacts are written for the author, not for the stated audience (COO, PE partner, insurance reviewer, franchisees). |
| 8 | Short / Ops Summary Shape | ❌ | No artifact follows the "Headline → Evidence → Ask" shape. The analysis doc is 8,000+ tokens. No 1-page executive brief exists. |
| 9 | Business Literacy (definitions) | ⚠️ | The project correctly identifies that different reports can show different numbers for legitimate reasons (different filters, different grain). But it doesn't apply this literacy to its own communication — i.e., "106 findings" and "5% baseline compliance" sound alarming but may be misleading without context (many findings are low/info, many controls are future-phase items). |
| 10 | Hidden-Problem Check | ⚠️ | The project is honest about problems. But the **Franworth finding** (full Direct Connect, no MFA trust, invisible access) was a real security incident that is now marked "✅ REMOVED" in the data — the tone of resolution doesn't match the severity of what was found. Also, the E5 expiration (May 3) without a confirmed Pax8 replacement is a **material coverage gap** that the call brief flags but doesn't escalate with proportional urgency. |

---

## Priority Action Items

### Before the May 7 Call
1. ✅ Update `cyberInsuranceGaps` data to reflect April 13 answers (ThreatDown confirmed, no backup confirmed, phishing pricing in progress)
2. ✅ Mark completed action items as complete in `msp-data.js`
3. ⚠️ Consider whether to share the Overview Guide (good) or the Call Brief (do NOT share) with Megan

### Before Insurance Submission (by May 14)
4. 🔴 Draft a 1-page attestation letter template for Megan
5. 🔴 Create a standalone "Insurance Readiness" dashboard page
6. 🔴 Add enforcement evidence (even manual-entry coverage percentages)

### Before Phase 2 Execution (by Week 5)
7. 🔴 Write a 1-page "Board-Level Summary" that leads with the answer, not the architecture
8. 🔴 Write franchisee impact briefs (1 page per brand)
9. 🔴 Add "consequence if delayed" framing to the phased roadmap

### Before Phase 3 Execution (by Week 10)
10. 🔴 Create franchisee MFA rollout communication plan
11. 🔴 Create FBC (Franchise Business Coach) cheat sheet
12. 🟡 Translate compliance matrix controls into insurance-standard language

### Ongoing
13. 🟡 Add "partnership wins" section to MSP portal
14. 🟡 Reframe "owes" language to "actions" language
15. 🟡 Add business risk statements to Critical/High findings

---

## Summary Assessment by Criterion

| Criterion | Rating | One-Line |
|---|---|---|
| 1. Stakeholder Language | ⚠️ Needs Significant Work | Written for the identity engineer, not the COO |
| 2. Action Clarity | ✅ Strong | Call brief is best-in-class; roadmap and dashboard need consequence framing |
| 3. Risk Framing | ⚠️ Needs Significant Work | Technical severity without business-impact translation |
| 4. Insurance Readiness | ⚠️ Partially Ready | Right structure, stale data, no evidence of enforcement |
| 5. MSP Communication | ✅ Strong | Genuinely collaborative; one caveat about the 33 KB call brief |
| 6. Franchisee Impact | ❌ Critical Gap | Zero franchisee-facing communication exists |

**The project knows what's wrong. It doesn't yet know how to tell the people who need to hear it.**

---

*Review by Ops Comms Collie 🐕‍🦺 — 2026-05-07*
