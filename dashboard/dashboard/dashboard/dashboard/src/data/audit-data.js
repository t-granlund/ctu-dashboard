// ─────────────────────────────────────────────────────────────
// CTU Phase 1 Audit Data — Embedded snapshot (no API dependency)
// Generated from 7-domain audit across 5 tenants
// ─────────────────────────────────────────────────────────────

export const findingsByLevel = {
  critical: 7, high: 42, medium: 32, low: 5, info: 20, total: 106,
};

export const findingsByTenant = {
  HTT: { critical: 1, high: 10, medium: 8, low: 1, info: 5, total: 25 },
  BCC: { critical: 1, high: 6, medium: 6, low: 1, info: 4, total: 18 },
  FN:  { critical: 2, high: 8, medium: 6, low: 1, info: 3, total: 20 },
  TLL: { critical: 2, high: 14, medium: 7, low: 1, info: 3, total: 27 },
  DCE: { critical: 1, high: 8, medium: 6, low: 1, info: 9, total: 25 },
};

export const findingsByDomain = {
  'Cross-Tenant Sync':   { critical: 0, high: 14, medium: 0, low: 0, info: 10, total: 24 },
  'B2B Collaboration':   { critical: 5, high: 10, medium: 15, low: 0, info: 0, total: 30 },
  'B2B Direct Connect':  { critical: 0, high: 3, medium: 0, low: 0, info: 2, total: 5 },
  'Guest Inventory':     { critical: 0, high: 0, medium: 5, low: 0, info: 5, total: 10 },
  'Conditional Access':  { critical: 2, high: 7, medium: 5, low: 0, info: 3, total: 17 },
  'Teams Federation':    { critical: 0, high: 5, medium: 7, low: 5, info: 0, total: 17 },
  'Identity Governance': { critical: 0, high: 3, medium: 5, low: 0, info: 5, total: 13 },
};

export const guestInventory = {
  HTT: { total: 151, neverSignedIn: 61, stale90d: 27, pending: 49, privilegedRoles: 0 },
  BCC: { total: 2, neverSignedIn: 1, stale90d: 0, pending: 0, privilegedRoles: 0 },
  FN:  { total: 33, neverSignedIn: 29, stale90d: 3, pending: 29, privilegedRoles: 0 },
  TLL: { total: 534, neverSignedIn: 399, stale90d: 102, pending: 386, privilegedRoles: 0 },
  DCE: { total: 2, neverSignedIn: 1, stale90d: 0, pending: 0, privilegedRoles: 0 },
  totals: { total: 722, neverSignedIn: 491, stale90d: 132, pending: 464, privilegedRoles: 0 },
};

export const unknownTenants = [
  { id: '3de67d67-88e8-42c0-88ea-13bfc2fc2f55', resolvedName: 'PAX8 US', resolvedDomain: 'pax8us.onmicrosoft.com', gdapStatus: 'Active (1)', foundIn: ['HTT','FN','TLL','DCE'], flags: ['isServiceProvider: true (DCE)'], priority: 'critical', description: 'MSP/cloud distributor — managed service provider with GDAP in DCE. Present in 4 tenants.', category: 'MSP/Distributor' },
  { id: '248c9920-7745-4f81-8e18-1a5de9935bbd', resolvedName: 'Franworth', resolvedDomain: 'franworth.com', gdapStatus: 'Active (1)', foundIn: ['TLL'], flags: ['Full DC: AllUsers/AllApps both directions','NO MFA trust'], priority: 'critical', description: 'Franchise consulting firm. Full Direct Connect access to TLL with NO MFA trust — invisible access path. IMMEDIATE ACTION REQUIRED.', category: 'Business Partner' },
  { id: 'd5e2dca7-948b-4e7c-9d9e-af97e9ca0f92', resolvedName: 'AppRiver', resolvedDomain: 'appriver4us.onmicrosoft.com', gdapStatus: 'Active (1)', foundIn: ['HTT','FN','TLL'], flags: [], priority: 'high', description: 'Email security/management service provider. Present in 3 tenants.', category: 'MSP/Service Provider' },
  { id: 'ff1b2576-d461-4916-97dc-7ada1cd798dc', resolvedName: 'TD SYNNEX US (Stellr)', resolvedDomain: 'synnex365.com', gdapStatus: 'Active (1)', foundIn: ['HTT'], flags: [], priority: 'medium', description: 'IT distribution/cloud marketplace (Stellr platform).', category: 'MSP/Distributor' },
  { id: '5d9ef8ec-bf67-442a-8855-7e9f7c7199c7', resolvedName: 'The Riverside Company', resolvedDomain: 'riversidecompany.onmicrosoft.com', gdapStatus: 'Active (1)', foundIn: ['BCC'], flags: [], priority: 'medium', description: 'Private equity firm — likely historical investment relationship with BCC.', category: 'Business Partner' },
  { id: 'a27ac673-9a4c-446c-bd28-280c0bf7cf71', resolvedName: 'Ingram Micro Inc', resolvedDomain: 'IMdemo.onmicrosoft.com', gdapStatus: 'Active (1)', foundIn: ['TLL'], flags: [], priority: 'medium', description: 'IT distribution/cloud services provider.', category: 'MSP/Distributor' },
  { id: 'd5c77776-8b4c-4ceb-81da-566aba9c59c5', resolvedName: 'TD SYNNEX US (SCM)', resolvedDomain: 'tdmsft.com', gdapStatus: 'Active (1)', foundIn: ['TLL'], flags: [], priority: 'medium', description: 'IT distribution — second SYNNEX tenant (Supply Chain Management).', category: 'MSP/Distributor' },
  { id: 'daee2992-bedc-4b96-840d-3cb1ffa89d10', resolvedName: 'Sui Generis Incorporated', resolvedDomain: 'suigenerisinc.com', gdapStatus: 'Active (1)', foundIn: ['TLL'], flags: [], priority: 'medium', description: 'IT consulting/managed services firm.', category: 'MSP/Service Provider' },
  { id: 'b4c546a4-7dac-46a6-a7dd-ed822a11efd3', resolvedName: 'Office 365', resolvedDomain: 'office365support.com', gdapStatus: 'Active (1)', foundIn: ['TLL'], flags: [], priority: 'medium', description: 'Microsoft Office 365 support/licensing tenant.', category: 'Microsoft/Vendor' },
];

export const tllGuestAnalysis = {
  totalGuests: 534,
  uniqueDomains: 43,
  staleGuests: 490,
  stalePct: 91.8,
  neverSignedIn: 399,
  neverSignedInPct: 74.7,
  pendingInvitations: 386,
  cleanupCandidates: 388,
  cleanupPct: 72.7,
  topDomains: [
    { domain: 'gmail.com', count: 310, pct: 58.1 },
    { domain: 'yahoo.com', count: 60, pct: 11.2 },
    { domain: 'httbrands.com', count: 22, pct: 4.1 },
    { domain: 'icloud.com', count: 21, pct: 3.9 },
    { domain: 'franworth.com', count: 14, pct: 2.6 },
    { domain: 'outlook.com', count: 13, pct: 2.4 },
    { domain: 'hotmail.com', count: 10, pct: 1.9 },
    { domain: 'aol.com', count: 9, pct: 1.7 },
    { domain: 'cybermark.com', count: 8, pct: 1.5 },
    { domain: 'ymail.com', count: 6, pct: 1.1 },
  ],
  pendingAgeBuckets: {
    under30d: 0,
    d30to90: 0,
    d90to365: 11,
    over365d: 21,
    over1000d: 354,
  },
  recommendations: [
    'Revoke 354 pending invitations older than 1,000 days (3+ years) — zero chance of acceptance',
    'Disable 388 cleanup candidates (stale + never signed in) — no impact expected',
    'Review 22 httbrands.com guests in TLL — may be legitimate cross-tenant identities',
    'Review 14 franworth.com guests — Franworth also has CRITICAL Direct Connect access',
    'Establish quarterly guest review cadence to prevent future accumulation',
  ],
};

export const phase2WhatIf = {
  totalChecks: 26,
  wouldChange: 23,
  noChange: 3,
  quickWins: [
    { id: 'QW1', name: 'Guest invitation restriction', target: 'adminsAndGuestInviters',
      tenants: [
        { key: 'HTT', current: 'everyone', status: 'WOULD_CHANGE' },
        { key: 'BCC', current: 'adminsGuestInvitersAndAllMembers', status: 'WOULD_CHANGE' },
        { key: 'FN', current: 'adminsGuestInvitersAndAllMembers', status: 'WOULD_CHANGE' },
        { key: 'TLL', current: 'everyone', status: 'WOULD_CHANGE' },
        { key: 'DCE', current: 'everyone', status: 'WOULD_CHANGE' },
      ]},
    { id: 'QW2', name: 'Guest role hardening', target: 'Restricted Guest User (2af84b1e-...)',
      tenants: [
        { key: 'HTT', current: 'Guest User (a0b1b346)', status: 'WOULD_CHANGE' },
        { key: 'TLL', current: 'Guest User (a0b1b346)', status: 'WOULD_CHANGE' },
        { key: 'DCE', current: 'Default (10dae51f)', status: 'WOULD_CHANGE' },
      ]},
    { id: 'QW3', name: 'Email-verified join disabled', target: 'false',
      tenants: [
        { key: 'HTT', current: 'true', status: 'WOULD_CHANGE' },
        { key: 'BCC', current: 'true', status: 'WOULD_CHANGE' },
        { key: 'FN', current: 'true', status: 'WOULD_CHANGE' },
        { key: 'TLL', current: 'true', status: 'WOULD_CHANGE' },
        { key: 'DCE', current: 'true', status: 'WOULD_CHANGE' },
      ]},
    { id: 'QW4', name: 'Teams consumer access disabled', target: 'false',
      tenants: [
        { key: 'HTT', current: 'true', status: 'WOULD_CHANGE' },
        { key: 'BCC', current: 'true', status: 'WOULD_CHANGE' },
        { key: 'FN', current: 'true', status: 'WOULD_CHANGE' },
        { key: 'TLL', current: 'true', status: 'WOULD_CHANGE' },
        { key: 'DCE', current: 'true', status: 'WOULD_CHANGE' },
      ]},
    { id: 'QW5', name: 'Teams trial federation disabled', target: 'Blocked',
      tenants: [
        { key: 'HTT', current: 'Allowed', status: 'WOULD_CHANGE' },
        { key: 'BCC', current: 'Allowed', status: 'WOULD_CHANGE' },
        { key: 'FN', current: 'Blocked', status: 'NO_CHANGE' },
        { key: 'TLL', current: 'Blocked', status: 'NO_CHANGE' },
        { key: 'DCE', current: 'Blocked', status: 'NO_CHANGE' },
      ]},
    { id: 'QW6', name: 'MFA CA policy (report-only)', target: 'enabledForReportingButNotEnforced',
      tenants: [
        { key: 'FN', current: 'No policy', status: 'WOULD_CHANGE' },
        { key: 'TLL', current: 'No policy', status: 'WOULD_CHANGE' },
        { key: 'DCE', current: 'No policy', status: 'WOULD_CHANGE' },
      ]},
  ],
};

export const tenants = [
  { key: 'HTT', name: 'Head to Toe Brands',        role: 'Hub (MTO Owner)',    domain: 'httbrands.com',      color: '#500711', locations: 'HQ',         risk: 'high' },
  { key: 'BCC', name: 'Bishops Cuts/Color',         role: 'Spoke (MTO Member)', domain: 'bishopsbs.com',     color: '#E87722', locations: '40',         risk: 'low' },
  { key: 'FN',  name: 'Frenchies Modern Nail Care', role: 'Spoke',             domain: 'frenchiesnails.com', color: '#1B3A5C', locations: '20',         risk: 'high' },
  { key: 'TLL', name: 'The Lash Lounge',            role: 'Spoke',             domain: 'thelashlounge.com',  color: '#6B3FA0', locations: '140',        risk: 'critical' },
  { key: 'DCE', name: 'Delta Crown Extensions',     role: 'Spoke',             domain: 'deltacrown.com',     color: '#C4A265', locations: 'Pre-launch', risk: 'medium' },
];

export const complianceControls = [
  { control: 'Default B2B Inbound = BLOCK',           HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 3 },
  { control: 'Default DC Inbound = BLOCK',             HTT: false, BCC: true,  FN: false, TLL: false, DCE: true,  phase: 3 },
  { control: 'Guest invitation restricted',            HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 2 },
  { control: 'Guest role = Restricted',                HTT: false, BCC: true,  FN: true,  TLL: false, DCE: false, phase: 2 },
  { control: 'Email-verified join disabled',            HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 2 },
  { control: 'MFA for external users',                 HTT: true,  BCC: true,  FN: false, TLL: false, DCE: true,  phase: 2 },
  { control: 'Legacy auth blocked (externals)',         HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 3 },
  { control: 'Sign-in frequency enforced',              HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 3 },
  { control: 'Teams = allowlist federation',            HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 3 },
  { control: 'Teams consumer access disabled',          HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 2 },
  { control: 'Self-service sign-up disabled',           HTT: true,  BCC: true,  FN: true,  TLL: true,  DCE: true,  phase: 'done' },
  { control: 'Zero guests in priv roles',               HTT: true,  BCC: true,  FN: true,  TLL: true,  DCE: true,  phase: 'done' },
  { control: 'MFA trust for known partners',            HTT: true,  BCC: true,  FN: true,  TLL: true,  DCE: true,  phase: 'done' },
  { control: 'PIM available',                           HTT: false, BCC: true,  FN: true,  TLL: false, DCE: true,  phase: 4 },
  { control: 'All GAs PIM-eligible (max 2 permanent)', HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 4 },
  { control: 'Access reviews (quarterly)',              HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 4 },
  { control: 'Guest lifecycle workflows',               HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 4 },
  { control: 'KQL monitoring alerts',                   HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 5 },
  { control: 'Unknown partner tenants removed',         HTT: false, BCC: false, FN: false, TLL: false, DCE: false, phase: 3 },
  { control: 'Auto-redeem configured',                  HTT: true,  BCC: true,  FN: true,  TLL: true,  DCE: true,  phase: 'done' },
];

export const phases = [
  {
    id: 1, name: 'Discovery', weeks: '1–3', status: 'complete',
    description: 'Read-only audit of all 7 domains across 5 tenants',
    gate: 'G1', gateApprover: 'Tyler + Dustin',
    deliverables: ['106 findings across 7 domains', '722 guest inventory', '9 unknown tenant IDs identified', 'Baseline compliance: 5%'],
    signOffItems: [
      { id: 'G1-1', text: 'Identify unknown tenant 3de67d67 → PAX8 US (MSP/cloud distributor, GDAP active)', status: 'complete', priority: 'critical' },
      { id: 'G1-2', text: 'Identify unknown tenant 248c9920 → Franworth (franchise consulting, full DC to TLL, NO MFA trust)', status: 'complete', priority: 'critical' },
      { id: 'G1-3', text: 'Confirm Entra P2 licensing timeline for HTT + TLL', status: 'pending', priority: 'high' },
      { id: 'G1-4', text: 'Approve Phase 2 Quick Wins (6 items, ~1.5 hours)', status: 'pending', priority: 'high' },
      { id: 'G1-5', text: 'Confirm TLL guest cleanup scope — analysis shows 388/534 cleanup candidates (72.7%), 354 pending >1000d', status: 'pending', priority: 'medium' },
      { id: 'G1-6', text: 'Acknowledge guest role correction: BCC/FN show Limited Access, not Restricted', status: 'pending', priority: 'low' },
    ],
  },
  {
    id: 2, name: 'Quick Wins', weeks: '3–5', status: 'upcoming',
    description: 'Low-risk, high-impact remediation — single-setting toggles',
    gate: 'G2', gateApprover: 'Tyler',
    deliverables: ['Guest invitation lockdown (5 tenants)', 'Guest role hardened (3 tenants)', 'Email-verified join disabled (5 tenants)', 'Teams consumer access disabled (5 tenants)', 'MFA CA policy deployed report-only (3 tenants)'],
    signOffItems: [
      { id: 'G2-1', text: 'Review WhatIf output for all 6 quick wins', status: 'locked', priority: 'high' },
      { id: 'G2-2', text: 'Approve live execution after WhatIf review', status: 'locked', priority: 'high' },
      { id: 'G2-3', text: 'Verify post-change state matches baseline targets', status: 'locked', priority: 'medium' },
    ],
  },
  {
    id: 3, name: 'Policy Hardening', weeks: '5–10', status: 'locked',
    description: 'Deny-by-default cross-tenant access + per-partner overrides',
    gate: 'G3/G4', gateApprover: 'Tyler',
    deliverables: ['Deny-by-default on HTT hub', '4 partner override policies', 'Brand security groups', 'Legacy auth blocked', 'Teams allowlist', 'Unknown tenants removed'],
    signOffItems: [
      { id: 'G3-1', text: 'Approve DCE pilot results (deny-by-default)', status: 'locked', priority: 'critical' },
      { id: 'G3-2', text: 'Approve rollout to BCC, FN, TLL', status: 'locked', priority: 'critical' },
      { id: 'G3-3', text: 'Verify snapshot/rollback capability tested', status: 'locked', priority: 'high' },
      { id: 'G3-4', text: 'Confirm spoke-side partner overrides for HTT hub', status: 'locked', priority: 'high' },
    ],
  },
  {
    id: 4, name: 'Governance', weeks: '10–16', status: 'locked',
    description: 'Access reviews, PIM, lifecycle workflows',
    gate: 'G5', gateApprover: 'Tyler + Kristin',
    deliverables: ['Quarterly access reviews', 'PIM enrollment', 'Guest lifecycle automation', 'Entitlement packages'],
    signOffItems: [
      { id: 'G5-1', text: 'Approve governance workflow deployment', status: 'locked', priority: 'high' },
      { id: 'G5-2', text: 'Review dry-run results (5 pilot guests)', status: 'locked', priority: 'medium' },
    ],
  },
  {
    id: 5, name: 'Monitoring', weeks: '16+', status: 'locked',
    description: 'KQL alerts, recurring audits, dashboards',
    gate: 'G6', gateApprover: 'Tyler + Dustin',
    deliverables: ['7 KQL alert queries', 'Weekly/monthly/quarterly audit schedule', 'Alert ownership matrix', 'Operational runbooks'],
    signOffItems: [
      { id: 'G6-1', text: 'Approve alert routing and ownership', status: 'locked', priority: 'medium' },
      { id: 'G6-2', text: 'Approve recurring audit schedule', status: 'locked', priority: 'medium' },
    ],
  },
];

export const topFindings = [
  { rank: 1,  title: 'FN + TLL: ZERO MFA for external users',                     tenants: ['FN','TLL'],                  domain: 'Conditional Access',  phase: 'Phase 2 → 3', severity: 'critical', description: 'External users access resources without MFA. Combined with open B2B = full unauthenticated lateral access path.', remediation: 'Deploy CA policy targeting all guestOrExternalUserTypes, report-only mode first, then enforce.' },
  { rank: 2,  title: 'TLL: Unknown tenant 248c9920 has full Direct Connect',       tenants: ['TLL'],                       domain: 'B2B Direct Connect',  phase: 'Phase 2 (investigate)', severity: 'critical', description: 'Unidentified org has AllUsers/AllApps DC both inbound AND outbound — no guest object created, no audit trail. Effectively invisible access.', remediation: 'Identify tenant. If unknown: remove immediately. Run: Invoke-MgGraphRequest findTenantInformationByTenantId.' },
  { rank: 3,  title: 'ALL 5: Default B2B inbound = AllUsers/AllApplications',      tenants: ['HTT','BCC','FN','TLL','DCE'], domain: 'B2B Collaboration',   phase: 'Phase 3', severity: 'critical', description: 'Any external organization can collaborate into any tenant. Must switch to deny-by-default.', remediation: 'Set-DenyByDefault.ps1 with per-partner overrides.' },
  { rank: 4,  title: 'Unknown tenant 3de67d67 in ALL tenants',                     tenants: ['HTT','FN','TLL','DCE'],      domain: 'Cross-Tenant Sync',   phase: 'Phase 2 (investigate)', severity: 'critical', description: 'Configured as service provider in DCE. Present everywhere. Likely managed services vendor.', remediation: 'Run tenant info lookup. Verify against vendor contracts.' },
  { rank: 5,  title: 'ALL 5: No legacy auth block for external users',             tenants: ['HTT','BCC','FN','TLL','DCE'], domain: 'Conditional Access',  phase: 'Phase 3', severity: 'high', description: 'POP3, SMTP, IMAP, ActiveSync for external users = complete MFA bypass.', remediation: 'Deploy CA policy blocking legacy auth for all external user types.' },
  { rank: 6,  title: 'HTT + TLL + DCE: Guest invitation = everyone',              tenants: ['HTT','TLL','DCE'],           domain: 'B2B Collaboration',   phase: 'Phase 2', severity: 'high', description: 'Any user including existing guests can invite more guests. Viral guest sprawl risk.', remediation: 'Update-MgPolicyAuthorizationPolicy -AllowInvitesFrom adminsAndGuestInviters' },
  { rank: 7,  title: 'ALL 5: Email-verified self-service join enabled',            tenants: ['HTT','BCC','FN','TLL','DCE'], domain: 'B2B Collaboration',   phase: 'Phase 2', severity: 'high', description: 'External users can self-join directory by email verification.', remediation: 'Disable AllowEmailVerifiedUsersToJoinOrganization.' },
  { rank: 8,  title: 'DCE: 5 permanent Global Admins (target ≤2)',                tenants: ['DCE'],                       domain: 'Identity Governance', phase: 'Phase 4', severity: 'high', description: '3 excess permanent GAs with standing access.', remediation: 'Convert to PIM-eligible with approval + MFA.' },
  { rank: 9,  title: 'HTT + TLL: PIM not available (no Entra P2)',                tenants: ['HTT','TLL'],                 domain: 'Identity Governance', phase: 'Licensing', severity: 'high', description: 'Hub tenant cannot enforce privileged role governance. All GA access is permanent and unauditable.', remediation: 'Procure Entra ID P2 licensing.' },
  { rank: 10, title: 'ALL 5: Teams open federation (AllowAllKnownDomains)',        tenants: ['HTT','BCC','FN','TLL','DCE'], domain: 'Teams Federation',    phase: 'Phase 3', severity: 'high', description: 'Any external org can initiate Teams chat/calls.', remediation: 'Set-TeamsFederationAllowlist.ps1 — switch to allowlist model.' },
];

export const positiveFindings = [
  { title: 'Zero guests in privileged roles',       detail: 'Across all 722 guests, zero hold any admin directory role',      icon: 'shield' },
  { title: 'BCC + DCE Direct Connect blocked',      detail: 'Already deny-by-default for DC inbound and outbound',           icon: 'lock' },
  { title: 'BCC + FN guest role = Restricted',      detail: 'Guests cannot enumerate directory users',                       icon: 'users' },
  { title: 'MFA trust configured for known partners', detail: 'HTT↔BCC, HTT↔TLL, HTT↔FN, HTT↔DCE all trust external MFA', icon: 'key' },
  { title: 'Auto-redeem configured',                detail: 'BCC↔HTT bidirectional, TLL/DCE/FN→HTT inbound',                icon: 'check' },
  { title: 'Self-service sign-up disabled',          detail: 'All 5 tenants — no external user self-service flows active',   icon: 'check' },
  { title: 'PIM available in BCC, FN, DCE',         detail: 'BCC: 36, FN: 28, DCE: 8 PIM assignments',                     icon: 'key' },
  { title: 'HTT has report-only CA policy',          detail: 'B2B External Franchisee Access ready to enforce',              icon: 'eye' },
  { title: 'BCC has best-in-class external MFA',    detail: 'Incoming Merger Users policy covers guest types',                icon: 'shield' },
  { title: 'Entitlement management present',         detail: 'HTT, TLL, DCE have connected orgs or access packages',        icon: 'database' },
];

// ── Derived helpers ──────────────────────────────────────────
export const SEVERITY_COLORS = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#3b82f6',
  info:     '#6b7280',
};

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'];

export const TENANT_KEYS = ['HTT', 'BCC', 'FN', 'TLL', 'DCE'];

export const RISK_COLORS = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#22c55e',
};

export const tenantColor = (key) =>
  tenants.find((t) => t.key === key)?.color ?? '#64748b';
