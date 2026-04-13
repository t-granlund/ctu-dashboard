// ─── Architecture Page Data ─────────────────────────────────────────────────
// Single source of truth for all architecture page content.
// Components are pure renderers — all business data lives here.

export const TENANTS = {
  htt: {
    key: 'htt',
    name: 'HTT Brands',
    shortName: 'HTT',
    role: 'Hub (Anchor)',
    domain: 'httbrands.com',
    color: '#500711',
    locations: 'HQ',
    status: 'hub',
    statusLabel: 'Hub Tenant',
  },
  bcc: {
    key: 'bcc',
    name: 'Bishops Cuts/Color',
    shortName: 'BCC',
    role: 'Spoke',
    domain: 'bishopscuts.com',
    color: '#E87722',
    locations: '~40 locations',
    status: 'green',
    statusLabel: 'Compliant',
    features: { mto: true, identitySync: true, b2bScoped: true, autoRedeem: 'both', mfaTrust: true },
  },
  fn: {
    key: 'fn',
    name: "Frenchies Modern Nail Care",
    shortName: 'FN',
    role: 'Spoke',
    domain: 'frenchiesnails.com',
    color: '#1B3A5C',
    locations: '~20 locations',
    status: 'amber',
    statusLabel: 'Partial',
    features: { mto: false, identitySync: false, b2bScoped: true, autoRedeem: 'hub-only', mfaTrust: true },
  },
  tll: {
    key: 'tll',
    name: 'The Lash Lounge',
    shortName: 'TLL',
    role: 'Spoke',
    domain: 'thelashlounge.com',
    color: '#6B3FA0',
    locations: '~140 locations',
    status: 'red',
    statusLabel: 'At Risk',
    features: { mto: false, identitySync: true, b2bScoped: false, autoRedeem: 'both', mfaTrust: true },
  },
  dce: {
    key: 'dce',
    name: 'Delta Crown Enterprises',
    shortName: 'DCE',
    role: 'Spoke',
    domain: 'deltacrown.com',
    color: '#C4A265',
    locations: 'Pre-launch',
    status: 'amber',
    statusLabel: 'Partial',
    features: { mto: false, identitySync: false, b2bScoped: true, autoRedeem: 'hub-only', mfaTrust: true },
  },
};

export const SPOKE_KEYS = ['bcc', 'fn', 'tll', 'dce'];

export const CONNECTIONS = [
  {
    to: 'bcc',
    status: 'green',
    color: '#22c55e',
    labels: ['MTO Member', 'Identity Sync', 'B2B Scoped'],
  },
  {
    to: 'fn',
    status: 'amber',
    color: '#f59e0b',
    labels: ['B2B Scoped', 'MFA Trust', 'No Sync'],
  },
  {
    to: 'tll',
    status: 'red',
    color: '#ef4444',
    labels: ['Identity Sync', 'B2B Unscoped ⚠', '534 Guests'],
  },
  {
    to: 'dce',
    status: 'amber',
    color: '#f59e0b',
    labels: ['B2B Scoped', 'MFA Trust', 'No Sync'],
  },
];

export const FEATURE_MATRIX = [
  { label: 'MTO Member', key: 'mto' },
  { label: 'Identity Sync', key: 'identitySync' },
  { label: 'B2B Scoped', key: 'b2bScoped' },
  { label: 'Auto-Redeem', key: 'autoRedeem' },
  { label: 'MFA Trust', key: 'mfaTrust' },
];

export const PHASES = [
  {
    number: 1,
    name: 'Discovery & Assessment',
    status: 'complete',
    statusLabel: '✅ COMPLETE',
    percent: 100,
    detail: 'Full 7-domain audit across 5 tenants. 106 findings identified and categorized. All unknown partner tenant IDs resolved.',
  },
  {
    number: 2,
    name: 'Quick Wins',
    status: 'in-progress',
    statusLabel: '🟡 IN PROGRESS',
    percent: 10,
    detail: 'Dry-run validated across all 6 items and 5 tenants. Live execution pending — estimated ~1.5 hours.',
  },
  {
    number: 3,
    name: 'Policy Hardening',
    status: 'not-started',
    statusLabel: '⬜ NOT STARTED',
    percent: 0,
    detail: 'Deny-by-default scripts ready. Awaiting Phase 2 completion before execution. Pilot on DCE first.',
  },
  {
    number: 4,
    name: 'Governance',
    status: 'not-started',
    statusLabel: '⬜ NOT STARTED',
    percent: 0,
    detail: 'PIM configuration, access reviews, lifecycle workflows. Entra P2 licensing confirmed purchased via MSP.',
  },
  {
    number: 5,
    name: 'Monitoring',
    status: 'not-started',
    statusLabel: '⬜ NOT STARTED',
    percent: 0,
    detail: 'KQL alert queries written. Deployment pending Phase 3+ infrastructure. 7 workbook queries ready.',
  },
];

export const COMPLETED_ACTIONS = [
  'Full 7-domain audit across 5 tenants (106 findings identified)',
  'All 9 unknown partner tenant IDs resolved (PAX8, AppRiver, Franworth, TD SYNNEX, Riverside, Ingram Micro, Sui Generis, Office365Support)',
  'Franworth partner policy removed + 19 guest accounts disabled',
  '9 AppRiver service principals disabled (HTT, FN, TLL)',
  'MSP (Sui Generis) coordination call completed + 20/20 follow-up questions answered',
  'GDAP role analysis completed — 6 delegated admin roles documented',
  'Phase 2 Quick Wins dry-run validated (all 6 items across 5 tenants)',
];

export const CRITICAL_PATH = [
  { task: 'Execute Phase 2 Quick Wins live (~1.5 hrs)', owner: 'Tyler', blocker: null },
  { task: 'Scope TLL B2B Collab inbound to match other spokes', owner: 'Tyler', blocker: null },
  { task: 'Disable legacy Ingram Micro SP + Office365Support connector in TLL', owner: 'Tyler', blocker: null },
  { task: 'Build MSP partner override policies for PAX8 + Sui Generis', owner: 'Tyler', blocker: null },
  { task: 'Deploy deny-by-default — pilot on DCE first', owner: 'Tyler', blocker: 'Phase 2 completion' },
  { task: 'BCC MFA deployment', owner: 'Megan', blocker: 'Post-convention April 28' },
  { task: 'Create persistent brand-level dynamic security groups', owner: 'Tyler', blocker: null },
  { task: 'Build new-user onboarding checklist for MSP', owner: 'Tyler → Megan', blocker: null },
];

export const AUDIT_DOMAINS = [
  {
    id: 'cross-tenant-sync',
    title: 'Cross-Tenant Sync',
    icon: '🔄',
    what: 'Automated synchronization of user identities between partner brand tenants and the HTT hub tenant.',
    why: 'Ensures franchise owners from each brand (Bishops, Frenchies, Lash Lounge, Delta Crown) can seamlessly access shared corporate resources (SharePoint, Power BI, Teams) without manual account creation.',
    currentStatus: 'Enabled for Bishops and Lash Lounge, not yet configured for Frenchies and Delta Crown.',
    metric: '14 High findings — driven by the 9 unknown partner tenant IDs (now resolved)',
    severity: 'high',
  },
  {
    id: 'b2b-collaboration',
    title: 'B2B Collaboration',
    icon: '🤝',
    what: 'Controls which external organizations can collaborate with HTT Brands and what applications they can access.',
    why: "This is the \"front door\" policy. Today it's unlocked — any Microsoft 365 organization in the world can initiate collaboration with HTT. The target state is deny-by-default with explicit exceptions only for the 4 brand tenants and trusted partners.",
    currentStatus: "ALL 5 tenants have open default policies (Critical finding). Lash Lounge's partner policy is also unscoped.",
    metric: '30 findings (5 Critical) — the largest finding source',
    severity: 'critical',
  },
  {
    id: 'b2b-direct-connect',
    title: 'B2B Direct Connect',
    icon: '⚡',
    what: 'A higher-trust connection that allows users from partner tenants to access resources (like Teams shared channels) without creating a guest account in the target tenant.',
    why: "Direct Connect access is invisible — no guest object is created, so it doesn't show up in user directories or standard access reviews. This makes uncontrolled DC access especially dangerous.",
    currentStatus: 'Bishops and Delta Crown have blocked DC by default (good). HTT, Frenchies, and Lash Lounge are open.',
    metric: '"Franworth" had FULL Direct Connect access to Lash Lounge with no MFA trust — removed.',
    severity: 'high',
  },
  {
    id: 'guest-inventory',
    title: 'Guest Inventory',
    icon: '👥',
    what: 'Complete census of all external (guest) user accounts across all 5 tenants.',
    why: 'Guest accounts are the primary way external users access HTT resources. Unmanaged guests accumulate over time and create security exposure — especially guests who were invited but never signed in, or guests inactive for 90+ days.',
    currentStatus: '722 total guests across all tenants. 491 have never signed in. 132 are stale (>90 days). Lash Lounge accounts for 74% of all guests.',
    metric: 'ZERO guests in privileged roles (good) — but 464 pending invitations need cleanup',
    severity: 'medium',
  },
  {
    id: 'conditional-access',
    title: 'Conditional Access',
    icon: '🔐',
    what: 'Security policies that control how and when users can access Microsoft 365 resources — requiring MFA, blocking legacy protocols, enforcing sign-in frequency.',
    why: 'Even if B2B policies are properly scoped, without Conditional Access enforcement, external users could access resources without multi-factor authentication or via insecure legacy protocols (POP3, IMAP) that bypass modern security controls.',
    currentStatus: 'HTT has a report-only CA policy for guests (needs enforcement). Bishops has the best external user CA policy. Frenchies and Lash Lounge previously had ZERO policies — MSP has since deployed MFA/CA on both.',
    metric: '2 Critical findings — FN + TLL had zero MFA enforcement (now being addressed by MSP)',
    severity: 'critical',
  },
  {
    id: 'teams-federation',
    title: 'Teams Federation',
    icon: '💬',
    what: 'Controls which external organizations can communicate with HTT Brands users via Microsoft Teams (chat, calls, meetings).',
    why: 'Open federation means anyone with a Microsoft 365 account — including competitors, threat actors, or social engineers — can initiate direct chat with your employees. The target is an allowlist where only approved brand domains can federate.',
    currentStatus: 'ALL 5 tenants use open federation (AllowAllKnownDomains). Consumer access (personal Microsoft accounts) is enabled everywhere.',
    metric: '17 findings — consumer access + trial tenant federation enabled',
    severity: 'high',
  },
  {
    id: 'identity-governance',
    title: 'Identity Governance',
    icon: '🛡️',
    what: 'Advanced identity lifecycle management — Privileged Identity Management (PIM) for admin roles, quarterly access reviews for guest accounts, automated lifecycle workflows.',
    why: "This is the \"autopilot\" layer. Without governance, security configurations drift over time — new guests accumulate, admin roles become permanent, and nobody reviews who has access to what. Governance ensures continuous compliance without manual effort.",
    currentStatus: 'PIM available in Bishops, Frenchies, and Delta Crown (but DCE has 5 permanent Global Admins — target is ≤2). HTT and Lash Lounge need Entra P2 licensing for PIM (now confirmed purchased via MSP).',
    metric: '13 findings — no access reviews scheduled anywhere, PIM not configured on hub tenant',
    severity: 'medium',
  },
];

export const MSP_INFO = {
  partner: 'Sui Generis Inc',
  distributor: 'PAX8',
  accessType: 'GDAP (Granular Delegated Admin Privileges) + B2B guest accounts',
  gdapRoles: [
    'Global Reader',
    'Directory Readers',
    'Directory Writers',
    'Service Support Administrator',
    'Privileged Authentication Administrator',
    'Privileged Role Administrator',
  ],
  duration: '2 years, auto-extend OFF',
  securityGroup: '"SGI Techs" security group in each tenant with Conditional Access policies',
  mfa: "Enforced via Sui Generis's own CA policies",
  elevatedNote: 'Privileged Authentication Admin + Privileged Role Admin roles are elevated; plan to scope down after current account remediation work completes.',
  gdapNote: 'GDAP access routes through Microsoft Partner Center infrastructure (separate from B2B cross-tenant access policies) — deny-by-default will NOT break GDAP. B2B guest access for Megan\'s accounts needs explicit partner override.',
};

export const METRICS = [
  { label: 'Tenants', value: '5', color: 'text-cyan-400' },
  { label: 'Audit Domains', value: '7', color: 'text-cyan-400' },
  { label: 'Total Findings', value: '106', sub: '7 Critical · 42 High · 32 Medium', color: 'text-red-400' },
  { label: 'Guest Accounts', value: '722', color: 'text-amber-400' },
  { label: 'Remediations', value: '3', color: 'text-emerald-400' },
  { label: 'Compliance Deadline', value: 'Jul 2026', sub: 'Riverside', color: 'text-violet-400' },
];

export const NAV_ITEMS = [
  { id: 'diagram', label: 'Diagram' },
  { id: 'progress', label: 'Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'next-steps', label: 'Next Steps' },
  { id: 'domains', label: 'Domains' },
  { id: 'msp', label: 'MSP' },
];

// ─── SVG Layout Constants ───────────────────────────────────────────────────
export const SVG = {
  viewBox: '0 0 960 490',
  hub: { cx: 480, cy: 65, w: 220, h: 100 },
  spokes: {
    bcc: { cx: 120, cy: 375, w: 180, h: 130 },
    fn:  { cx: 330, cy: 405, w: 180, h: 130 },
    tll: { cx: 630, cy: 405, w: 180, h: 130 },
    dce: { cx: 840, cy: 375, w: 180, h: 130 },
  },
};

// Compute derived positions
const hubBottom = SVG.hub.cy + SVG.hub.h / 2;
export const SVG_PATHS = Object.entries(SVG.spokes).map(([key, s]) => {
  const spokeTop = s.cy - s.h / 2;
  const cpY1 = hubBottom + (spokeTop - hubBottom) * 0.45;
  const cpY2 = hubBottom + (spokeTop - hubBottom) * 0.65;
  return {
    key,
    d: `M ${SVG.hub.cx} ${hubBottom} C ${SVG.hub.cx} ${cpY1}, ${s.cx} ${cpY2}, ${s.cx} ${spokeTop}`,
    // Bezier midpoint at t=0.5: B = 0.125*P0 + 0.375*P1 + 0.375*P2 + 0.125*P3
    labelX: 0.125 * SVG.hub.cx + 0.375 * SVG.hub.cx + 0.375 * s.cx + 0.125 * s.cx,
    labelY: 0.125 * hubBottom + 0.375 * cpY1 + 0.375 * cpY2 + 0.125 * spokeTop,
  };
});
