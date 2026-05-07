# Megan Overview Guide — May 7, 2026

**Call:** Tyler Granlund × Megan Myrand, Sui Generis  
**Time:** 1:15 PM CT  
**Purpose:** Give both teams the same current operating picture across Microsoft tenants, Pax8/CSP billing, Delta Crown, group governance, Azure/direct-bill visibility, and support routing.

This is not a blame document. It is the map so HTT and Sui Generis can line up, make decisions, and work from the same source of truth.

---

## 1. The operating model Tyler wants aligned

HTT owns the infrastructure architecture and source-of-truth model:

- tenant relationships and cross-tenant policy;
- canonical Entra attributes for brand, role, region, location, and access tier;
- group/access design;
- dashboard/reporting expectations for finance and operations;
- support-routing patterns and internal front ends.

Sui Generis helps operationalize it:

- Pax8/CSP licensing and renewal alignment;
- GDAP, partner, API, and billing-access alignment;
- device support, Atera RMM, ThreatDown EDR, patching, and written attestation;
- backup/phishing options and pricing;
- new-user execution using a runbook HTT provides.

The goal is collaboration: Tyler defines the standard, Megan helps make it repeatable.

---

## 2. Current priority picture

| Area | Where we are today | What we need from Megan |
|---|---|---|
| Pax8 / CSP billing | AppRiver is being removed; Logically is gone; some Microsoft/Azure spend remains direct-bill | Confirm transfer scope, replacement SKUs, invoice/API export options |
| Delta Crown Extensions | Model tenant is live, hardened, and ready for lifecycle validation | Validate the DCE runbook and assign an owner/date for the auto-redeem setup on the related tenant side |
| Cross-tenant policy | HTT wants deny-by-default with explicit partner override | Confirm GDAP + Platform/API/billing access scope |
| Backup / insurance | ThreatDown and Atera confirmed; no paid M365 backup currently | Backup pricing, phishing pricing, written EDR/patch/firewall/backup attestation |
| Groups / distribution lists | Narrow distro audit is production-tested; comprehensive collector built | Use audit outputs to rationalize group ownership, membership, and governance |
| Support routing | Freshdesk remains source of record; HTT hubs add context and routing | Confirm how Sui Generis wants to receive/copilot ticket context |

---

## 3. Repo-backed source map

| Repo | Local path | What it proves / supplies | Relevance for Megan |
|---|---|---|---|
| Cross-Tenant Utility | `/Users/tygranlund/dev/03-personal/Cross-Tenant-Utility` | Published dashboard, May 7 brief, DCE runbook, decision log, cross-tenant audit posture | The live conversation hub for this call |
| DeltaSetup | `/Users/tygranlund/dev/04-other-orgs/DeltaSetup` | DCE tenant design, SharePoint/Teams/DLP buildout, Master DCE resource map | Shows DCE as the reference implementation |
| Groups-Audit | `/Users/tygranlund/dev/Groups-Audit` | Distribution group and Microsoft 365 group audit collectors | Helps rationalize DLs, owners, restrictions, DDGs, and group governance |
| AZURE-AUDIT-QUICK | `/Users/tygranlund/dev/01-htt-brands/AZURE-AUDIT-QUICK` | Azure estate, subscriptions, cost visibility gaps, insurance evidence | Shows direct-bill Azure posture and why finance needs a cleaner view |
| Groups Hub | `/Users/tygranlund/dev/01-htt-brands/microsoft-group-management` | Production group management/access request app with Freshdesk ticket creation | Gives access requests a controlled workflow and ticket trail |
| People Support Hub | `/Users/tygranlund/dev/01-htt-brands/freshdesk-oracle` | Azure + SSO hub over Freshdesk data for FBC/escalation visibility | Gives support teams context without replacing Freshdesk |

---

## 4. Delta Crown Extensions — current state in plain English

Delta Crown is the model tenant because it is small, greenfield, and already hardened.

### Live today

- Microsoft tenant is live at `deltacrown.onmicrosoft.com`.
- Conditional Access is active tenant-wide.
- Entra ID P2 is purchased through Pax8 as the blanket entitlement.
- Tenant security was hardened April 29:
  - external sharing narrowed;
  - external resharing off;
  - legacy auth off.
- SharePoint Phase 2 and Phase 3 are deployed:
  - Corp-Hub;
  - DCE-Hub;
  - HR, IT, Finance, Training service sites;
  - Operations, Client Services, Marketing, Docs brand sites.
- Teams workspace exists with operational channels.
- DLP policies are deployed, including external-sharing block enforcement.
- Shared mailboxes and dynamic distribution groups exist.
- Dynamic security groups exist and are waiting for user attributes to populate them.

### Still blocked / open

- DCE/FN spoke-side auto-redeem needs a Sui Generis owner/date.
- Apple Business Manager / MDM is blocked on DUNS from Tyler.
- DCE new-user runbook v0.1 needs Megan validation.
- Internal access controls / role matrix still need final execution.
- HTT deny-by-default partner override needs Megan confirmation before policy flip.

### The ask

Use DCE as the first validation event for onboarding/offboarding:

1. Tyler provides the canonical fields and runbook.
2. Megan confirms which Entra fields Sui Generis can set during user creation.
3. A new DCE user is created from the runbook.
4. Dynamic groups populate automatically.
5. SharePoint, Teams, DLP, mailbox, and licensing access follows group membership.
6. Offboarding disables the identity and access drops cleanly.

---

## 5. Billing / CSP questions to land today

| Topic | Question |
|---|---|
| Pax8→AppRiver transfer | Is Transfer ID `acd7573e-a487-41d9-83ce-560dea432e95` intentional, what exactly does it cover, and what action is due before May 27? |
| HTT E5 replacement | Since HTT M365 E5 expired May 3 intentionally, is the Pax8 replacement active and is there any feature coverage gap? |
| Extra File Storage | Since Office 365 Extra Storage expired May 4 intentionally, is the Pax8 replacement active? |
| Teams Premium | Which 25-seat Teams Premium SKU/term should be purchased through Pax8, and who is placing the order? |
| Azure direct-bill | Azure subscriptions remain direct-billed today; can Sui Generis/Pax8 help produce a finance-ready current + projected spend view? |
| Pax8 API/export | Does Megan have Pax8 API access, invoice export, or reporting access we can use for finance reconciliation? |
| BCC MOSA | Do we ride Business Basic to October 2026 or start CSP cutover earlier now that convention is over? |

Finance end goal: one clear per-tenant view of current spend, renewal dates, and projected run-rate.

---

## 6. Security, backup, and insurance asks

Megan already confirmed several key items in writing on April 13:

- ThreatDown is the EDR.
- Atera is separate from ThreatDown.
- Atera does not require tenant API access.
- Sui Generis uses individual admin accounts, not shared admin accounts.
- Sui Generis enforces MFA through its own Conditional Access policies.
- There is no paid M365 backup currently.
- Backup pricing is still needed.
- Phishing simulation pricing is still needed.
- Direct bill should be cancelled and repurchased through Pax8.

Open asks:

1. Written cyber-insurance attestation covering EDR, patching, firewall posture, and backup posture.
2. M365 backup pricing/options: Datto, Veeam, AvePoint, or Sui Generis-preferred option.
3. Phishing/security-awareness simulation pricing.
4. ThreatDown coverage gap list and remediation plan for Tyler/Dustin/personal-computer edge cases.

---

## 7. Distribution groups and group governance

Recent Groups-Audit work gives HTT a better way to inventory Microsoft 365 groups across tenants.

Current state:

- Phase 0 narrow store-manager distribution-list collector is production-tested.
- Phase 1 comprehensive collector is built; smoke run pending.
- The collector is designed to output:
  - run manifest;
  - groups summary;
  - members;
  - owners;
  - sender/moderation/join restrictions;
  - tenant governance;
  - dynamic distribution group filters;
  - unclassified objects.

Why Megan should care:

- It helps explain what groups exist, who owns them, who receives what, and where group cleanup is needed.
- It creates evidence before changes, so cleanup decisions are based on a shared inventory instead of ad hoc review.
- It supports the same model as DCE: attributes and groups should drive access and communication, not tribal memory.

---

## 8. Groups Hub and People Support Hub

### Groups Hub

Production URL:

```text
https://groups-hub.httbrands.com
```

What it does:

- provides controlled group/access request workflows;
- creates Freshdesk tickets automatically;
- routes requests to HTT IT Support L1;
- captures requester, email, brand, requested role, comments, and audit trail;
- uses role/persona access and Microsoft Graph integration.

### People Support Hub / Freshdesk Oracle

What it does:

- pulls Freshdesk ticket/contact data into an Azure-hosted visibility layer;
- uses SSO and role-based views;
- gives Franchise Business Coaches ticket visibility by location/brand;
- supports future escalation views like Mindbody Online queues;
- keeps Freshdesk as the system of record.

How this helps Sui Generis:

- Megan can still receive direct Freshdesk emails/tickets.
- The hub adds context: who the person is, what brand/location they belong to, and why the request matters.
- It reduces ticket bouncing and makes franchisee support more consistent.
- It depends on the same Entra attribute cleanup as DCE onboarding.

---

## 9. Requested outcomes before ending the call

| Outcome | Owner | Target |
|---|---|---|
| Confirm Pax8→AppRiver transfer scope/action | Megan/Tyler | Before May 27 |
| Confirm E5, Extra Storage, Teams Premium replacement plan | Megan | May 14 |
| Confirm Pax8 invoice/API/export path for finance | Megan | May 21 |
| Validate DCE new-user runbook v0.1 | Megan + Tyler | May 14 |
| Assign DCE/FN spoke-side auto-redeem owner/date | Megan | May 21 |
| Provide backup and phishing pricing | Megan | May 14/21 |
| Provide written insurance attestation | Megan | May 14 |
| Send DUNS for DCE ABM/MDM | Tyler | May 14 |
| Share BCC password-never-expires list for triage | Tyler | May 14 |

---

## 10. Closing script

> “Before we drop, I want to read back owners and dates so I don’t misrepresent anything. Megan, I have you for licensing replacement status, Pax8 export/API answer, backup/phishing pricing, attestation letter, and auto-redeem owner/date. I have myself for DUNS, the BCC account list, Azure payment-method verification, and runbook iteration. Did I miss or misstate anything?”

---

*Prepared May 7, 2026 for the Tyler/Megan Sui Generis alignment call. This guide intentionally avoids secrets and tenant-changing commands.*
