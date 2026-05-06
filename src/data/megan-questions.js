// ─────────────────────────────────────────────────────────────
// Megan's Remaining Questions — Post-Call Follow-up
// From: Tyler & Megan call April 10, 2026
// Purpose: Questions Megan needs to answer for CTU governance
// ─────────────────────────────────────────────────────────────

export const MEGAN_STORAGE_KEY = 'ctu-megan-responses';

export const meganQuestions = [
  {
    id: "gdap",
    category: "GDAP & Admin Access",
    icon: "🔑",
    why: "We're implementing deny-by-default cross-tenant policies (Phase 3). We need to know exactly what access to preserve so nothing breaks.",
    questions: [
      {
        id: "gdap-roles",
        question: "What specific Entra admin roles does PAX8 / Sui Generis hold in each tenant (HTT, BCC, FN, TLL, DCE)?",
        context: "We can't see GDAP role details from the customer side — only you can see this in Partner Center.",
        priority: "critical",
        inputType: "textarea",
        placeholder: "e.g., Global Reader, Helpdesk Administrator, User Administrator — per tenant if they differ",
        apr13Answer: "Will send Partner Center screenshots showing GDAP role list per tenant.",
      },
      {
        id: "gdap-duration",
        question: "Are the GDAP roles time-limited (e.g., 90-day expiration with renewal) or permanent?",
        context: "Best practice is 90-day max with renewal approval. Permanent GDAP is a security risk per Riverside's compliance requirements.",
        priority: "high",
        inputType: "textarea",
        placeholder: "e.g., 180-day duration, auto-renews, or permanent",
        apr13Answer: "**2-year default** in Partner Center. No per-policy override available, even at acceptance. Roles can be removed manually before the 2-year mark, but they do not auto-reauthorize every 90 days.",
      },
      {
        id: "gdap-approval",
        question: "Is there a GDAP approval workflow, or do your engineers have standing access?",
        context: "Approval workflows require customer admin to approve each session. Without it, MSP has always-on access.",
        priority: "high",
        inputType: "select",
        options: ["Standing access (no approval needed)", "Approval required per session", "Not sure — need to check"],
        apr13Answer: "Not sure — need to check",
      },
      {
        id: "gdap-engineers",
        question: "Beyond you and Colton, who else at Sui Generis has access to our tenants?",
        context: "We need a full list of named engineers for our access review process. Any guest accounts we find that aren't on this list will be flagged.",
        priority: "high",
        inputType: "textarea",
        placeholder: "Names and email addresses of anyone with access",
        apr13Answer: "All Sui Generis team members are in the **'SGI Techs'** security group on each tenant — gated by a Conditional Access policy. **Tenure:** everyone except Genesis (Tier 1 support) has been with Sui Generis 2+ years.",
      },
    ],
  },
  {
    id: "licensing",
    category: "Licensing & Billing",
    icon: "💳",
    why: "We're consolidating all billing to PAX8 and need to understand what's CSP-managed vs. direct so we don't accidentally cancel active services.",
    questions: [
      {
        id: "csp-vs-direct",
        question: "Which licenses in each tenant are CSP-managed (billed through PAX8) vs. direct Microsoft (EA/MCA)?",
        context: "We can see the licenses but not the billing channel. This affects who manages adds/removes and where cancellations need to happen.",
        priority: "high",
        inputType: "textarea",
        placeholder: "e.g., HTT: Business Premium = PAX8, E1 = direct MOSA. BCC: all direct MOSA (migration in progress).",
        apr13Answer: "**Policy: all licensing must go through Pax8. No direct bill.** Any current direct-bill subscription must be cancelled and repurchased on Pax8.",
      },
      {
        id: "bcc-migration-timeline",
        question: "What's the timeline for completing BCC's migration from MOSA/direct to PAX8?",
        context: "You mentioned most BCC licenses end July/August. Want to make sure we're aligned on the cutover plan.",
        priority: "medium",
        inputType: "textarea",
        placeholder: "e.g., July licenses: will purchase PAX8 replacements by June 15. August licenses: same approach.",
        apr13Answer: "Re-checked: **Business Basic licenses expire October 2026** (not July/August as initially thought). Any future Business Basic purchases will be made on Pax8.",
      },
      {
        id: "extra-p2-cancellation",
        question: "Can you confirm the extra P2 licenses on BCC (5 total, need only 1) and FN are ready to be canceled on your end?",
        context: "We identified these were purchased by Eric Canfield. Tyler can cancel from admin portal but want to make sure PAX8 billing is clean too.",
        priority: "medium",
        inputType: "select",
        options: ["Yes, cancel the extras — I'll handle PAX8 side", "Let me check first", "Those are needed — don't cancel"],
        apr13Answer: "Yes, cancel the extras — I'll handle PAX8 side",
      },
    ],
  },
  {
    id: "security",
    category: "Security & Compliance",
    icon: "🛡️",
    why: "Tyler has a July 2026 Riverside compliance deadline. These are the gaps we need your help documenting.",
    questions: [
      {
        id: "edr-solution",
        question: "Does Atera include EDR (Endpoint Detection & Response), or is there a separate EDR solution in place?",
        context: "Cyber insurance requires EDR on all endpoints. We confirmed Atera as RMM but need to know if EDR is bundled or separate (Defender for Endpoint, SentinelOne, CrowdStrike, etc.).",
        priority: "critical",
        inputType: "textarea",
        placeholder: "e.g., Atera includes Bitdefender EDR, or we use Defender for Endpoint separately, or no EDR currently",
        apr13Answer: "**ThreatDown** — separate from Atera. Currently missing on Tyler and Dustin's machines. Plus a short list of users on personal (non-company-owned) computers who never responded — they likely have neither Atera nor ThreatDown.",
      },
      {
        id: "m365-backup",
        question: "Is there any M365 backup solution in place for Exchange, SharePoint, OneDrive, or Teams?",
        context: "Cyber insurance and Riverside compliance both require backup of cloud data. We found no backup solution configured.",
        priority: "critical",
        inputType: "textarea",
        placeholder: "e.g., We use Datto SaaS Protection, or Veeam Backup for M365, or no backup currently in place",
        apr13Answer: "**No paid M365 backup currently** — only the standard tenant-level versioning. Megan owes pricing for a backup solution per tenant.",
      },
      {
        id: "security-training",
        question: "Is there any security awareness training or phishing simulation active for any of the brands?",
        context: "HTT had KnowBe4 under Logically — it was dropped when you took over. Can you provide this, or should Tyler self-manage?",
        priority: "high",
        inputType: "textarea",
        placeholder: "e.g., We offer KnowBe4 through PAX8 for $X/user/mo, or no training currently — Tyler should self-manage",
        apr13Answer: "Discussed early on with Kristin — **available if you want it**. Megan owes pricing.",
      },
      {
        id: "msp-mfa",
        question: "Do Sui Generis engineers use MFA when accessing HTT tenants? Is it enforced via your own Conditional Access?",
        context: "We trust external MFA (isMfaAccepted=true in our policies), but we need to confirm your side actually enforces it.",
        priority: "critical",
        inputType: "select",
        options: ["Yes — MFA enforced via our own CA policies", "Yes — MFA enforced but not via CA (e.g., per-user MFA)", "No MFA enforcement currently", "Not sure — need to check"],
        apr13Answer: "Yes — MFA enforced via our own CA policies",
      },
      {
        id: "shared-accounts",
        question: "Do your engineers use dedicated individual admin accounts, or are there any shared/generic accounts?",
        context: "Shared accounts = no audit trail. Riverside compliance requires individual accountability for admin actions.",
        priority: "high",
        inputType: "select",
        options: ["All individual accounts — no shared accounts", "Mix of individual and shared", "Primarily shared accounts", "Not sure"],
        apr13Answer: "All individual accounts — no shared accounts",
      },
      {
        id: "bcc-never-expire",
        question: "Are the 7 BCC accounts with 'Password Never Expires' service accounts managed by Sui Generis?",
        context: "We found 7 user accounts in Bishops with password never expires set. Need to know if these are service accounts or regular users.",
        priority: "medium",
        inputType: "textarea",
        placeholder: "e.g., Yes, those are service accounts for X, Y, Z — or no, those are regular users that need to be fixed",
        apr13Answer: "**Need the list of 7 users from Tyler.** The SGI Breakglass account should never expire — that's a backdoor account with strict CA policies (only accessible from our offices). The other 6 need triage to confirm whether they're service accounts or regular users.",
      },
    ],
  },
  {
    id: "vendors",
    category: "Other Vendors in Our Tenants",
    icon: "🏢",
    why: "We found service principals and partner policies from vendors we can't fully identify. Need your help confirming what's legitimate.",
    questions: [
      {
        id: "ingram-micro",
        question: "Is Ingram Micro actively managing any licenses in TLL? We found an 'Ingram-Micro-LicenseManager' SP from 2023.",
        context: "This could be from a previous licensing arrangement before Sui Generis. If it's no longer active, we should disable it.",
        priority: "medium",
        inputType: "select",
        options: ["Still active — don't remove", "Legacy — safe to disable", "Not sure — need to check"],
        apr13Answer: "Legacy — safe to disable",
      },
      {
        id: "office365-support",
        question: "Do you recognize 'office365support.com' (tenant b4c546a4)? There's an 'O365Support-MSP-Connector' SP in TLL from 2022.",
        context: "This is a suspicious-looking tenant name. Could be a legitimate support vendor or could be leftover from a compromised setup.",
        priority: "high",
        inputType: "textarea",
        placeholder: "e.g., That's from when we used X vendor for support, or I don't recognize it — safe to remove",
        apr13Answer: "Likely from when Ben or Garrett (Lash Lounge internal IT) opened a Microsoft support case. **Safe to remove the connector.**",
      },
    ],
  },
  {
    id: "phase3-coordination",
    category: "Deny-by-Default Coordination",
    icon: "🚧",
    why: "When we flip to deny-by-default (Phase 3), we need to whitelist your access explicitly. Without this info, your team gets locked out.",
    questions: [
      {
        id: "pax8-apps-needed",
        question: "When we block all cross-tenant B2B access by default, what specific apps/services does PAX8 or Sui Generis need whitelisted?",
        context: "We'll create explicit partner override policies for your tenant. Need to know which Microsoft cloud apps you need access to (e.g., Exchange Online, SharePoint, Azure Portal, etc.).",
        priority: "critical",
        inputType: "textarea",
        placeholder: "e.g., Exchange Admin Center, Azure Portal, SharePoint Admin, Entra Admin Center, etc.",
        apr13Answer: "**Required GDAP roles:** Global Reader · Directory Reader · Service Support Admin. **Required platform/data access:** Pax8 Storefront/Platform · API & Integration access · billing & licensing data access. These are the minimum delegated administrative privileges needed to manage cloud subscriptions, licenses, and security settings for B2B clients.",
      },
      {
        id: "access-method",
        question: "When your team accesses our tenants, do you go through GDAP (Partner Center) or via direct guest account sign-in, or both?",
        context: "GDAP access is separate from B2B guest access. If you only use GDAP, the guest accounts (Megan in HTT + TLL) could potentially be removed. If you use both, we need to preserve both paths.",
        priority: "high",
        inputType: "select",
        options: ["GDAP only (Partner Center)", "Guest account sign-in only", "Both GDAP and guest accounts", "Depends on the task — both used for different things"],
        apr13Answer: "Depends on the task — both used for different things",
      },
      {
        id: "atera-connectivity",
        question: "Does Atera require any specific service principal, API connection, or network access to our tenants that we should whitelist?",
        context: "We want to make sure the RMM platform doesn't get blocked when deny-by-default goes live.",
        priority: "high",
        inputType: "textarea",
        placeholder: "e.g., Atera uses agent-based (no tenant API needed), or Atera connects via Graph API with app ID X",
        apr13Answer: "**No tenant API connection needed.** The Atera remote tool is installed on each machine — there is no integration to O365 products. **Won't be blocked by deny-by-default.**",
      },
    ],
  },
  {
    id: "onboarding",
    category: "New User Onboarding Process",
    icon: "👤",
    why: "You offered to follow any group/property checklist when creating new users. We want to define that process so identity governance works from day one.",
    questions: [
      {
        id: "current-onboarding",
        question: "What's your current process when you create a new user? (e.g., what groups do you add them to, what properties do you set?)",
        context: "We're building dynamic security groups driven by user properties. If you can set properties like department, job title, and brand at creation time, users will automatically get the right access.",
        priority: "medium",
        inputType: "textarea",
        placeholder: "e.g., Create user, assign license, add to MFA group, add to Teams groups. Department and title usually set. No custom attributes currently.",
        apr13Answer: "**TLL today:** create user → add to Everyone group → add to MFA Security Group (if specified). Other brands' processes still to formalize.",
      },
      {
        id: "onboarding-checklist-willing",
        question: "If we provide a checklist of user properties and groups to set during onboarding, can you incorporate that into your process?",
        context: "This is what you offered on the call — 'if there's a list of when you create a new user, add to these groups, tell me.' We're building that list.",
        priority: "medium",
        inputType: "select",
        options: ["Yes — send me the checklist and I'll follow it", "Yes, but I'd need it integrated into our provisioning tool", "Let's discuss — depends on complexity"],
        apr13Answer: "Yes — send me the checklist and I'll follow it",
      },
    ],
  },
];

// ── Helper: count total questions ───────────────────────────
export const totalQuestions = meganQuestions.reduce(
  (sum, cat) => sum + cat.questions.length, 0
);

// ── Helper: count by priority ───────────────────────────────
export const questionsByPriority = meganQuestions.reduce((acc, cat) => {
  for (const q of cat.questions) {
    acc[q.priority] = (acc[q.priority] || 0) + 1;
  }
  return acc;
}, {});
