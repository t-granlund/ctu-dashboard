// ── May 7, 2026 status update (since the Apr 10 call) ───────
// This is the "what's happened, what's still owed, what's new" snapshot
// surfaced at the top of the MSP walkthrough portal for the May 7 call.
export const maySevenUpdate = {
  callDate: '2026-05-07',
  callTime: '1:15 PM CT',
  briefRefreshed: '2026-05-06 13:35 CT',
  briefPath: 'MEGAN-CALL-BRIEF-2026-05-07.md',
  runbookPath: 'DCE-NEW-USER-RUNBOOK-V0.1-2026-05-07.md',
  decisionLogPath: 'MEGAN-CALL-DECISION-LOG-2026-05-07.md',
  resolvedSinceApr10: [
    { date: '2026-04-13', text: 'Megan returned 20/20 questions in writing — partner-override scope, EDR (ThreatDown), Atera no-tenant-API, GDAP timeboxing, BCC October cutover, onboarding-checklist offer, SP removal authorizations.' },
    { date: '2026-04-10—13', text: 'AppRiver SPs disabled across HTT, FN, TLL.' },
    { date: '2026-04-20', text: 'Comprehensive end-to-end audit (Phase 1) completed.' },
    { date: '2026-04-22', text: 'Megan cleaned 68 shared mailboxes on TLL.' },
    { date: '2026-04-23', text: 'CA verify + MFA verify audits + CFO cyber-insurance response drafted.' },
    { date: '2026-04-27', text: 'Pax8 US submitted Pax8→AppRiver billing-ownership transfer (Transfer ID acd7573e-…, expires 2026-05-27).' },
    { date: '2026-04-29', text: 'Delta Crown tenant security hardened LIVE — sharing narrowed, external resharing off, legacy auth off, all 4 dynamic security groups verified.' },
    { date: '2026-05-03', text: 'HTT M365 E5 (no Teams) expired on schedule.' },
    { date: '2026-05-04', text: 'HTT Office 365 Extra File Storage expired on schedule.' },
  ],
  stillOwedByMegan: [
    { severity: 'high', text: 'M365 backup pricing (Apr 13 commitment).' },
    { severity: 'high', text: 'Insurance attestation letter — EDR/patch/firewall/backup, in writing.' },
    { severity: 'high', text: 'Teams Premium 25 seats — repurchase SKU + term via Pax8.' },
    { severity: 'medium', text: 'Spoke-side auto-redeem on DCE + FN tenants.' },
    { severity: 'medium', text: 'Phishing simulation pricing.' },
    { severity: 'medium', text: 'Atera customer-specific API answer (Apr 10 check).' },
    { severity: 'low', text: 'GDAP approval workflow — confirm whether one exists.' },
  ],
  stillOwedByTyler: [
    { severity: 'high', text: 'DCE new-user runbook v0.1 is drafted — validate with Megan and iterate into final SOP.' },
    { severity: 'high', text: 'DUNS for Delta Crown Apple Business Manager.' },
    { severity: 'medium', text: 'HTT-ANCHOR Azure payment method verification (Apr 25 reminder).' },
    { severity: 'medium', text: 'Disable Ingram-Micro-LicenseManager + O365Support-MSP-Connector SPs in TLL (Apr 13 authorized).' },
    { severity: 'medium', text: 'Share the 7 BCC pwd-never-expires account list with Megan for triage.' },
    { severity: 'low', text: "TLL CNAME for Colton's CallView analytics subdomain (today's ask)." },
  ],
  newAgendaTopics: [
    'Pax8→AppRiver Apr 27 transfer (Transfer ID acd7573e-…) — confirm scope before May 27 expiration',
    'Web Direct → CSP migration status — E5 + Extra Storage expired, Pax8 replacement order?',
    'BCC MOSA → Pax8 CSP — start now or ride to October Business Basic expiration',
    'Delta Crown current-state walkthrough — model-tenant architecture for hub-and-spoke',
    'DCE new-user runbook v0.1 validation (this is the unblock)',
  ],
  deltaCrownStatus: {
    summary: 'DCE is the deliberate first-greenfield instance of the hub-and-spoke architecture. Tenant security hardened live Apr 29; Phase 2 + Phase 3 SharePoint deployed; CA active tenant-wide; dynamic groups built and waiting for attribute-driven population.',
    live: [
      'Conditional Access enforced tenant-wide (Megan, late Apr)',
      'P2 blanket entitlement (1 license, no per-user assignment needed)',
      'Tenant security hardening live (Apr 29) — sharingCapability narrowed, external resharing off, legacy auth off',
      'SharePoint Phase 2: Corp-Hub + DCE-Hub + 4 service sites (HR, IT, Finance, Training)',
      'SharePoint Phase 3: 4 brand sites (Operations, ClientServices, Marketing, Docs) + Teams workspace + DLP policies',
      'Dynamic security groups: AllStaff (6), Managers (0), Marketing (0), Stylists (0) — empty by design, waiting on attribute population',
      '3 shared mailboxes (operations@, bookings@, info@) and 3 dynamic distribution groups',
    ],
    blocked: [
      'Apple Business Manager → MDM (DUNS)',
      'Spoke-side auto-redeem',
      'Internal access controls (break inheritance + role matrix) — pending PnP run',
    ],
  },
};

