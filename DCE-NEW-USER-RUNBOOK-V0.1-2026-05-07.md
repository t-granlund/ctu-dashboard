# Delta Crown Extensions — New-User Runbook v0.1

**Purpose:** Give Sui Generis a repeatable checklist for creating DCE users so identity, access, licensing, Teams, SharePoint, CA, and DLP all line up from day one.

**Status:** Draft for Megan validation on 2026-05-07 call.  
**Owner of schema:** Tyler / HTT  
**Executor on new-user creation:** Megan / Sui Generis  
**Model tenant:** Delta Crown Extensions (`deltacrown.onmicrosoft.com`)

---

## 1. The operating principle

DCE is the reference implementation for the HTT hub-and-spoke model:

1. HTT defines canonical user attributes.
2. Megan sets those attributes when creating the user.
3. Dynamic groups evaluate automatically.
4. Group-based access grants the right SharePoint / Teams / mailbox / licensing / CA scope.
5. Offboarding reverses access by disabling the account and clearing access tier.

No more "remember to add them to seven things by hand" nonsense. Computers are supposed to do boring repeatable work. Revolutionary, I know.

---

## 2. Required data before creating the user

| Field | Required? | Source | Example |
|---|---:|---|---|
| Legal first/last name | Yes | HR / hiring manager | Jane Doe |
| Preferred display name | Yes | HR / manager | Jane Doe |
| Work email / UPN | Yes | Naming convention | `jane.doe@deltacrown.com` |
| Brand | Yes | HTT | `DCE` |
| Role | Yes | Manager / HR | `Stylist`, `Manager`, `OwnerOperator`, `CorpStaff`, `Marketing`, `Finance`, `IT` |
| Region | Yes if known | Ops | `Central`, `Southeast`, etc. |
| Location / salon / studio IDs | Yes for field users | Zenoti / Ops | `DCE-001`, `DCE-002` |
| Access tier | Yes | Tyler / manager | `Standard`, `Elevated`, `Privileged` |
| Device type | Yes | Manager / IT | `Mac`, `Windows`, `BYOD` |
| Start date | Yes | HR | `2026-05-15` |
| Manager | Yes | HR | `manager@deltacrown.com` |

---

## 3. Canonical attributes to set

Use these names as the stable business schema. Exact Entra extension-attribute mapping can be finalized after Megan confirms what Sui Generis can set during provisioning.

| Canonical attribute | Example | Purpose |
|---|---|---|
| `htt_brand` | `DCE` | Brand-level dynamic groups and license assignment |
| `htt_role` | `Stylist` | Role-based SharePoint/Teams/security access |
| `htt_region` | `Central` | Regional targeting and reporting |
| `htt_location_ids` | `DCE-001;DCE-002` | Salon/studio-scoped access, future Zenoti alignment |
| `htt_access_tier` | `Standard` | Controls elevated access / privileged workflows |

### Proposed Entra implementation mapping for v0.1

| Canonical field | Initial Entra field | Notes |
|---|---|---|
| `htt_brand` | `companyName` or extension attribute | Prefer extension if available; `companyName = Delta Crown Extensions` acceptable short-term |
| `htt_role` | `jobTitle` + extension attribute | `jobTitle` is human-readable; extension value should be normalized |
| `htt_region` | `state` / `officeLocation` / extension attribute | Use extension long-term |
| `htt_location_ids` | extension attribute | Multi-value string; semicolon-delimited for v0.1 |
| `htt_access_tier` | extension attribute | Never infer from job title alone |

---

## 4. DCE role → group → access matrix v0.1

| Role | HTT-side dynamic group | DCE-side dynamic group | Access outcome |
|---|---|---|---|
| Any DCE employee | `DCE-AllStaff` | `AllStaff` | Read/access to DCE hub, employee resources, all-staff DDG |
| Stylist | `DCE-Stylists` | `Stylists` | DCE Operations, schedule/bookings resources, stylists DDG |
| Manager / Director / OwnerOperator | `DCE-Managers` | `Managers` | Manager-level SharePoint permissions, Leadership private channel |
| Marketing | `DCE-Marketing` | `Marketing` | DCE Marketing site, Brand Assets, Marketing Calendar |
| Finance | `DCE-Finance` | TBD | Corp-Finance resources if approved |
| IT | `DCE-IT` | TBD | Corp-IT resources if approved |
| Privileged admin | `DCE-Privileged` | TBD | PIM/eligible admin path only; no standing admin by default |

---

## 5. New-user checklist for Megan

### Step A — create the user

- [ ] Create user in the correct tenant / workflow agreed with Tyler.
- [ ] Set display name, UPN, manager, job title, department/company fields.
- [ ] Assign temporary password / onboarding auth flow per Sui Generis standard.
- [ ] Require MFA registration on first sign-in.

### Step B — set HTT canonical attributes

- [ ] `htt_brand = DCE`
- [ ] `htt_role = <normalized role>`
- [ ] `htt_region = <region>`
- [ ] `htt_location_ids = <semicolon-delimited location IDs>`
- [ ] `htt_access_tier = Standard` unless Tyler explicitly approves another tier.

### Step C — groups and licensing

Until dynamic-group automation is validated end-to-end, use this manual safety net:

- [ ] Add to DCE all-staff group.
- [ ] Add to MFA / CA scope group if required by Sui Generis workflow.
- [ ] Add to role group (`Stylists`, `Managers`, `Marketing`) only if role requires it.
- [ ] Assign baseline Microsoft 365 license via group-based licensing where available.
- [ ] Do **not** assign elevated admin roles directly; use PIM/eligible model when available.

### Step D — device onboarding

- [ ] Confirm device type.
- [ ] For Mac users: ABM/MDM path is pending DUNS; capture serial and interim management plan.
- [ ] Install / validate Atera if applicable.
- [ ] Install / validate ThreatDown EDR if company-owned device.
- [ ] If personal/BYOD, flag for Tyler/Megan decision — do not assume compliant coverage.

### Step E — validation

- [ ] User can sign in with MFA.
- [ ] User appears in expected DCE dynamic groups within expected sync window.
- [ ] User can access only expected SharePoint / Teams resources.
- [ ] User cannot access manager/private resources unless role requires it.
- [ ] User is included in correct DDGs / mailboxes if applicable.

---

## 6. Offboarding checklist v0.1

When a DCE user leaves:

- [ ] Disable sign-in immediately.
- [ ] Set `htt_access_tier = Disabled` or clear active access attributes.
- [ ] Remove from manual exception groups.
- [ ] Revoke sessions / refresh tokens.
- [ ] Convert mailbox / delegate access per HR/legal request.
- [ ] Preserve OneDrive / SharePoint content per retention policy.
- [ ] Remove device from active inventory or mark reclaimed.
- [ ] Confirm user drops from DCE dynamic groups after sync.
- [ ] Confirm access to Teams / SharePoint / DDGs is removed.

---

## 7. Questions for Megan on May 7

1. Which Entra fields can Sui Generis reliably set during user creation today?
2. Can Sui Generis set extension attributes, or should v0.1 use standard fields first?
3. Who on the Sui Generis side can flip DCE spoke-side auto-redeem?
4. What is the realistic sync/validation window after user creation?
5. Where should this checklist live for Megan's team — Freshdesk, Sui Generis SOP, or shared HTT doc?
6. For BYOD/personal devices, what is Sui Generis willing to support and attest to?
7. Can we test this on the next DCE user as the first validation event?

---

## 8. Success criteria

This runbook is working when:

- A new DCE user can be created from this checklist without Tyler manually chasing group membership.
- Dynamic groups populate from attributes.
- SharePoint/Teams/DLP/CA access follows group membership.
- Offboarding removes access by disabling/clearing the identity state, not by hunting through individual apps.
- Megan can execute the checklist repeatably and train another Sui Generis engineer to do the same.

---

*Drafted 2026-05-06 for Tyler/Megan May 7 call. This is v0.1 by design: enough to validate the operating model, not pretend every edge case is already solved.*
