// ─────────────────────────────────────────────────────────────
// Cross-Tenant Program · HTT family
// Reference architecture: Delta Crown Extensions (DCE)
//
// Status scale (ordinal, sequential):
//   golden : matches DCE reference
//   mostly : one or two gaps, on track
//   drift  : regressing, stale, or partially aligned
//   gap    : not started or actively blocking
//   na     : not applicable to this tenant
//
// Per-cell `gap` is a 4–8 word phrase describing the closest
// concrete piece of work, not a sentence. Tooltips use it.
// ─────────────────────────────────────────────────────────────

export const TENANT_ORDER = ['DCE', 'HTT', 'TLL', 'FN', 'BCC'];

export const TENANTS = {
  DCE: {
    code: 'DCE',
    name: 'Delta Crown Extensions',
    role: 'Reference architecture',
    license: 'M365 Business Premium',
    headcount: 89,
    note: 'Hub-and-spoke, hardened, 167 tests passing.',
  },
  HTT: {
    code: 'HTT',
    name: 'HTT-ANCHOR',
    role: 'Brand operating tenant',
    license: 'Mixed: CSP transfer in progress',
    headcount: null,
    note: 'AppRiver removed; CSP transfer expires May 27.',
  },
  TLL: {
    code: 'TLL',
    name: 'The Lash Lounge',
    role: 'Brand operating tenant',
    license: 'CSP / aligned renewal',
    headcount: null,
    note: 'Aligned to end-of-Jan renewal; 91.8% stale guests.',
  },
  FN: {
    code: 'FN',
    name: 'Frenchies',
    role: 'Brand operating tenant',
    license: 'CSP / extra P2s pending cancel',
    headcount: null,
    note: 'Smaller footprint; auto-redeem owner pending.',
  },
  BCC: {
    code: 'BCC',
    name: 'Bishops Cuts & Color',
    role: 'Brand operating tenant',
    license: 'MOSA / CSP migration pending',
    headcount: null,
    note: 'Business Basic expires Oct 2026; cutover decision open.',
  },
};

export const DOMAIN_ORDER = ['identity', 'security', 'devices', 'licenses', 'azure', 'lifecycle'];

export const DOMAINS = {
  identity: { label: 'Identity', summary: 'Entra ID, dynamic groups, guests, attributes.' },
  security: { label: 'Security', summary: 'Tenant hardening, CA, B2B, DLP, attestation.' },
  devices: { label: 'Devices', summary: 'Atera RMM, ABM, MDM, Win11/Mac standardization.' },
  licenses: { label: 'Licenses', summary: 'Pax8 CSP, M365 SKUs, Teams/Fireflies path.' },
  azure: { label: 'Azure', summary: 'Subscriptions, payment method, GDAP, cost.' },
  lifecycle: { label: 'Lifecycle', summary: 'New-user runbook, offboarding evidence.' },
};

// Statuses are derived from real signals where available
// (audit-data.js, may-seven-update.js, MEGAN-DELTASETUP-MSP-BRIEF.md).
export const MATRIX = {
  DCE: {
    identity: { status: 'mostly', gap: 'Metadata gap — 4 of 5 dynamic groups empty.' },
    security: { status: 'golden', gap: 'Hardened; DLP in TestWithNotifications.' },
    devices: { status: 'golden', gap: 'ABM DUNS pending for Mac path.' },
    licenses: { status: 'golden', gap: 'Clean CSP / P2 blanket; no debt.' },
    azure: { status: 'golden', gap: 'Clean tenant; CSP from day one.' },
    lifecycle: { status: 'drift', gap: 'New-user runbook v1 not yet published.' },
  },
  HTT: {
    identity: { status: 'drift', gap: '151 guests; 61 never signed in.' },
    security: { status: 'drift', gap: '25 audit findings (1 critical, 10 high).' },
    devices: { status: 'gap', gap: 'No standardized MDM/RMM model.' },
    licenses: { status: 'drift', gap: 'CSP transfer mid-flight; Fireflies rollout.' },
    azure: { status: 'gap', gap: 'Direct-bill payment unverified; no cost view.' },
    lifecycle: { status: 'gap', gap: 'No DCE-pattern runbook applied.' },
  },
  TLL: {
    identity: { status: 'gap', gap: '534 guests; 91.8% stale; 386 pending invites.' },
    security: { status: 'mostly', gap: '2 critical findings; Franworth Direct Connect.' },
    devices: { status: 'mostly', gap: 'Modern fleet; audit not yet documented.' },
    licenses: { status: 'mostly', gap: 'Renewal aligned end-of-Jan; clean.' },
    azure: { status: 'drift', gap: 'Ingram-Micro / O365Support SPs still present.' },
    lifecycle: { status: 'drift', gap: 'Process exists; not yet attribute-driven.' },
  },
  FN: {
    identity: { status: 'drift', gap: '33 guests; 29 never signed in.' },
    security: { status: 'mostly', gap: '20 findings; 2 critical.' },
    devices: { status: 'gap', gap: 'Device model not yet documented.' },
    licenses: { status: 'mostly', gap: 'Extra P2 licenses pending cancel.' },
    azure: { status: 'na', gap: 'No Azure footprint.' },
    lifecycle: { status: 'gap', gap: 'Auto-redeem owner pending.' },
  },
  BCC: {
    identity: { status: 'gap', gap: '7 password-never-expires accounts to triage.' },
    security: { status: 'drift', gap: '18 findings; B2B settings drift.' },
    devices: { status: 'gap', gap: 'Device model not yet documented.' },
    licenses: { status: 'drift', gap: 'MOSA → CSP cutover decision open.' },
    azure: { status: 'na', gap: 'No Azure footprint.' },
    lifecycle: { status: 'gap', gap: 'No documented onboarding flow.' },
  },
};

// Numeric domain index: golden=4, mostly=3, drift=2, gap=1, na=skipped.
// Returns { score, max, pct, golden, total } per domain.
const SCORE_BY_STATUS = { golden: 4, mostly: 3, drift: 2, gap: 1, na: null };

export function computeDomainIndex(domainKey) {
  let score = 0;
  let max = 0;
  let golden = 0;
  let total = 0;
  for (const tenantKey of TENANT_ORDER) {
    const cell = MATRIX[tenantKey]?.[domainKey];
    if (!cell || cell.status === 'na') continue;
    const value = SCORE_BY_STATUS[cell.status];
    if (value === null || value === undefined) continue;
    score += value;
    max += 4;
    total += 1;
    if (cell.status === 'golden') golden += 1;
  }
  return {
    score,
    max,
    pct: max === 0 ? 0 : Math.round((score / max) * 100),
    golden,
    total,
  };
}

// Pending decisions for the right-rail mini-table.
// Sorted by target date proximity, then severity.
export const DECISIONS_PENDING = [
  { owner: 'Megan',  topic: 'Fireflies.ai Pro tier + bot policy', target: 'May 14', severity: 'high' },
  { owner: 'Tyler',  topic: 'DCE new-user runbook v1',            target: 'May 14', severity: 'high' },
  { owner: 'Megan',  topic: 'M365 backup pricing',                target: 'May 14', severity: 'high' },
  { owner: 'Megan',  topic: 'Insurance attestation letter',       target: 'May 14', severity: 'high' },
  { owner: 'Tyler',  topic: 'Apple Business Manager DUNS',        target: 'May 14', severity: 'high' },
  { owner: 'Megan',  topic: 'DLP enforce flip · DCE',             target: 'May 21', severity: 'medium' },
  { owner: 'Megan',  topic: 'Spoke-side auto-redeem · DCE + FN',  target: 'May 21', severity: 'medium' },
];

// Calendar of structural deadlines (not actions — events).
export const NEXT_HORIZON = [
  { date: 'May 14', label: 'Tyler × Megan sync',         note: 'Land 5 high-severity decisions.' },
  { date: 'May 21', label: 'CSP transfer window',        note: 'Confirm scope before May 27 expiration.' },
  { date: 'May 27', label: 'CSP → AppRiver transfer expires', note: 'Transfer ID acd7573e-…' },
  { date: 'Jul–Aug', label: 'BCC MOSA renewals end',     note: 'CSP cutover ride-or-cut decision.' },
  { date: 'Oct 2026', label: 'BCC Business Basic expires', note: 'Forced migration if not earlier.' },
];

// What "golden" looks like — the DCE reference card.
export const REFERENCE_DCE = {
  tenant: 'Delta Crown Extensions',
  link: 'https://delta-crown-org.github.io/DeltaSetup/',
  pillars: [
    { domain: 'Identity',   value: '89 users · 5 dynamic groups · P2 blanket' },
    { domain: 'Security',   value: 'Tenant hardened · legacy auth off · CA staged' },
    { domain: 'SharePoint', value: 'Corp-Hub + DCE-Hub + 8 spokes · audited clean' },
    { domain: 'Compliance', value: '3 DLP policies · TestWithNotifications → enforce pending' },
    { domain: 'Evidence',   value: '167 tests passing · 4 ADRs · public showcase live' },
  ],
};

// Order of the 5 status states for the legend.
export const STATUS_ORDER = ['golden', 'mostly', 'drift', 'gap', 'na'];

// Display metadata. Colors are deliberately monochrome-sequential
// (green → amber → rose) so they survive grayscale / colorblind users
// and bypass the global accent flatten via inline style.
export const STATUS_META = {
  golden: { glyph: '●', color: '#34d399', label: 'Golden',  description: 'Matches the DCE reference.' },
  mostly: { glyph: '◕', color: '#86efac', label: 'Mostly',  description: 'One or two gaps; on track.' },
  drift:  { glyph: '◐', color: '#fbbf24', label: 'Drift',   description: 'Regressing or partially aligned.' },
  gap:    { glyph: '○', color: '#fb7185', label: 'Gap',     description: 'Not started or actively blocking.' },
  na:     { glyph: '–', color: '#94a3b8', label: 'N/A',     description: 'Not applicable to this tenant.' },
};
