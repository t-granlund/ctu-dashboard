# MSP Follow-Up Responses — Sui Generis → HTT Brands
**From:** Megan Myrand (IT Systems Engineer, Sui Generis Inc)
**To:** Tyler Granlund (IT Director, HTT Brands)
**Date:** 2026-04-13 at 11:40 AM
**Progress:** 20 of 20 questions answered

---

*These responses follow up on our April 10, 2026 call. Questions are from the CTU (Cross-Tenant Utility) identity governance project.*

## 🔑 GDAP & Admin Access (4/4)

### ✅ 🔴 What specific Entra admin roles does PAX8 / Sui Generis hold in each tenant (HTT, BCC, FN, TLL, DCE)?

> **Context:** We can't see GDAP role details from the customer side — only you can see this in Partner Center.

**Answer:** Will send you pictures for this.

---

### ✅ 🟠 Are the GDAP roles time-limited (e.g., 90-day expiration with renewal) or permanent?

> **Context:** Best practice is 90-day max with renewal approval. Permanent GDAP is a security risk per Riverside's compliance requirements.

**Answer:** 2 years by default. I don't have an option to change this, even when accepting the agreement. If we need to remove the role before the 2-year marker, this is possible, but it doesn't reauthorize every 90 days.

---

### ✅ 🟠 Is there a GDAP approval workflow, or do your engineers have standing access?

> **Context:** Approval workflows require customer admin to approve each session. Without it, MSP has always-on access.

**Answer:** Not sure — need to check

---

### ✅ 🟠 Beyond you and Colton, who else at Sui Generis has access to our tenants?

> **Context:** We need a full list of named engineers for our access review process. Any guest accounts we find that aren't on this list will be flagged.

**Answer:** If you look at each tenant, there is a security group created called "SGI Techs" - all of our team members are a part of this group. I have conditional access policy set for this. With the execaption of Genesis ( our Teir 1 support tech) everyone else on our team has been with us 2+ years.

---

## 💳 Licensing & Billing (3/3)

### ✅ 🟠 Which licenses in each tenant are CSP-managed (billed through PAX8) vs. direct Microsoft (EA/MCA)?

> **Context:** We can see the licenses but not the billing channel. This affects who manages adds/removes and where cancellations need to happen.

**Answer:** All licenses need to be through Pax8 and no direct bill. any current direct bill needs to be canceled and repurchased on Pax8.

---

### ✅ 🟡 What's the timeline for completing BCC's migration from MOSA/direct to PAX8?

> **Context:** You mentioned most BCC licenses end July/August. Want to make sure we're aligned on the cutover plan.

**Answer:** I just double checked and it looks like October is when the Business Basic licenses expire for BCC. If any future Business Basic licenses need to be purchased, I will do so on Pax8.

---

### ✅ 🟡 Can you confirm the extra P2 licenses on BCC (5 total, need only 1) and FN are ready to be canceled on your end?

> **Context:** We identified these were purchased by Eric Canfield. Tyler can cancel from admin portal but want to make sure PAX8 billing is clean too.

**Answer:** Yes, cancel the extras — I'll handle PAX8 side

---

## 🛡️ Security & Compliance (6/6)

### ✅ 🔴 Does Atera include EDR (Endpoint Detection & Response), or is there a separate EDR solution in place?

> **Context:** Cyber insurance requires EDR on all endpoints. We confirmed Atera as RMM but need to know if EDR is bundled or separate (Defender for Endpoint, SentinelOne, CrowdStrike, etc.).

**Answer:** Threatdown is our EDR. It is separate from Atera. So far, only you and Dustin do not have this installed on your machines from what I can tell. I have a short list of other users who never responded to me that do not have either Atera or Threatdown installed. I'm thinking because they have personal computers and not company owned machines.

---

### ✅ 🔴 Is there any M365 backup solution in place for Exchange, SharePoint, OneDrive, or Teams?

> **Context:** Cyber insurance and Riverside compliance both require backup of cloud data. We found no backup solution configured.

**Answer:** Other than the standard versioning already on each tenant, there are no Paid O365 backup subscriptions on the tenants. I'll get pricing together to see what that's going to look like for each tenant.

---

### ✅ 🟠 Is there any security awareness training or phishing simulation active for any of the brands?

> **Context:** HTT had KnowBe4 under Logically — it was dropped when you took over. Can you provide this, or should Tyler self-manage?

**Answer:** We discussed this early on with Kristin, we can do this if you would like - I would need to get together pricing for this.

---

### ✅ 🔴 Do Sui Generis engineers use MFA when accessing HTT tenants? Is it enforced via your own Conditional Access?

> **Context:** We trust external MFA (isMfaAccepted=true in our policies), but we need to confirm your side actually enforces it.

**Answer:** Yes — MFA enforced via our own CA policies

---

### ✅ 🟠 Do your engineers use dedicated individual admin accounts, or are there any shared/generic accounts?

> **Context:** Shared accounts = no audit trail. Riverside compliance requires individual accountability for admin actions.

**Answer:** All individual accounts — no shared accounts

---

### ✅ 🟡 Are the 7 BCC accounts with 'Password Never Expires' service accounts managed by Sui Generis?

> **Context:** We found 7 user accounts in Bishops with password never expires set. Need to know if these are service accounts or regular users.

**Answer:** Can you share with me the list of 7 user accounts you are referring to? The SGI Breakglass account should never expire for sure. This is a backdoor account set with strict CA policies and can only be accessed from our offices.

---

## 🏢 Other Vendors in Our Tenants (2/2)

### ✅ 🟡 Is Ingram Micro actively managing any licenses in TLL? We found an 'Ingram-Micro-LicenseManager' SP from 2023.

> **Context:** This could be from a previous licensing arrangement before Sui Generis. If it's no longer active, we should disable it.

**Answer:** Legacy — safe to disable

---

### ✅ 🟠 Do you recognize 'office365support.com' (tenant b4c546a4)? There's an 'O365Support-MSP-Connector' SP in TLL from 2022.

> **Context:** This is a suspicious-looking tenant name. Could be a legitimate support vendor or could be leftover from a compromised setup.

**Answer:** I'm not sure, this may have been when Ben or Garrett ( Lash Lounge internal IT) was having issues with things on the tenant and opened support with Microsoft. Safe to remove the connector

---

## 🚧 Deny-by-Default Coordination (3/3)

### ✅ 🔴 When we block all cross-tenant B2B access by default, what specific apps/services does PAX8 or Sui Generis need whitelisted?

> **Context:** We'll create explicit partner override policies for your tenant. Need to know which Microsoft cloud apps you need access to (e.g., Exchange Online, SharePoint, Azure Portal, etc.).

**Answer:** Pax8 and Sui Generis require specific delegated administrative privileges (GDAP) to manage cloud subscriptions, licenses, and security settings for B2B clients, primarily focusing on Microsoft 365 environments. Key access includes Global Reader (read-only directory info), Directory Reader (view admin info), and Service Support Admin (manage service requests/health), Platform & Storefront Access, API and Integration Access, and Data Access for billing and licensing provisioning.

---

### ✅ 🟠 When your team accesses our tenants, do you go through GDAP (Partner Center) or via direct guest account sign-in, or both?

> **Context:** GDAP access is separate from B2B guest access. If you only use GDAP, the guest accounts (Megan in HTT + TLL) could potentially be removed. If you use both, we need to preserve both paths.

**Answer:** Depends on the task — both used for different things

---

### ✅ 🟠 Does Atera require any specific service principal, API connection, or network access to our tenants that we should whitelist?

> **Context:** We want to make sure the RMM platform doesn't get blocked when deny-by-default goes live.

**Answer:** No tenant API needed. The remote tool is installed on the machine, there is no access to O365 products

---

## 👤 New User Onboarding Process (2/2)

### ✅ 🟡 What's your current process when you create a new user? (e.g., what groups do you add them to, what properties do you set?)

> **Context:** We're building dynamic security groups driven by user properties. If you can set properties like department, job title, and brand at creation time, users will automatically get the right access.

**Answer:** TLL - Create User, Add to Everyone Group and MFA Security Group - If specified

---

### ✅ 🟡 If we provide a checklist of user properties and groups to set during onboarding, can you incorporate that into your process?

> **Context:** This is what you offered on the call — 'if there's a list of when you create a new user, add to these groups, tell me.' We're building that list.

**Answer:** Yes — send me the checklist and I'll follow it

---

## 📋 Notes

_Add any additional context or questions here:_



---

*Generated from CTU Dashboard · 2026-04-13*
