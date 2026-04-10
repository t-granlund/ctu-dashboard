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
  { id: '3de67d67-88e8-42c0-88ea-13bfc2fc2f55', foundIn: ['HTT','FN','TLL','DCE'], flags: ['isServiceProvider: true (DCE)'], priority: 'critical', description: 'Present in 4+ tenants, marked as service provider in DCE. Likely MSP/GDAP vendor — needs immediate identification.' },
  { id: '248c9920-7745-4f81-8e18-1a5de9935bbd', foundIn: ['TLL'], flags: ['Full DC: AllUsers/AllApps both directions','NO MFA trust'], priority: 'critical', description: 'Full Direct Connect access to TLL with NO MFA trust. Users from this tenant can access TLL resources without a guest object being created and without MFA. Invisible access.' },
  { id: 'd5e2dca7-948b-4e7c-9d9e-af97e9ca0f92', foundIn: ['HTT','FN','TLL'], flags: [], priority: 'high', description: 'Present in 3 tenants. Inherits default policy. Unknown organization.' },
  { id: 'ff1b2576-d461-4916-97dc-7ada1cd798dc', foundIn: ['HTT'], flags: [], priority: 'medium', description: 'HTT only. Inherits default policy.' },
  { id: '5d9ef8ec-bf67-442a-8855-7e9f7c7199c7', foundIn: ['BCC'], flags: [], priority: 'medium', description: 'BCC only. Inherits default policy.' },
  { id: 'a27ac673-9a4c-446c-bd28-280c0bf7cf71', foundIn: ['TLL'], flags: [], priority: 'medium', description: 'TLL only. Inherits default policy.' },
  { id: 'd5c77776-8b4c-4ceb-81da-566aba9c59c5', foundIn: ['TLL'], flags: [], priority: 'medium', description: 'TLL only. Inherits default policy.' },
  { id: 'daee2992-bedc-4b96-840d-3cb1ffa89d10', foundIn: ['TLL'], flags: [], priority: 'medium', description: 'TLL only. Inherits default policy.' },
  { id: 'b4c546a4-7dac-46a6-a7dd-ed822a11efd3', foundIn: ['TLL'], flags: [], priority: 'medium', description: 'TLL only. Inherits default policy.' },
];

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
      { id: 'G1-1', text: 'Identify unknown tenant 3de67d67 (service provider in DCE, present in 4+ tenants)', status: 'pending', priority: 'critical' },
      { id: 'G1-2', text: 'Identify unknown tenant 248c9920 (full DC access to TLL, no MFA trust)', status: 'pending', priority: 'critical' },
      { id: 'G1-3', text: 'Confirm Entra P2 licensing timeline for HTT + TLL', status: 'pending', priority: 'high' },
      { id: 'G1-4', text: 'Approve Phase 2 Quick Wins (6 items, ~1.5 hours)', status: 'pending', priority: 'high' },
      { id: 'G1-5', text: 'Confirm TLL guest cleanup scope (534 guests, 386 pending)', status: 'pending', priority: 'medium' },
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
