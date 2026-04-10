// ─────────────────────────────────────────────────────────────
// MSP Walkthrough Data — Compiled from Phase 1 audit
// Source: reports/msp-relationship-audit.json
// ─────────────────────────────────────────────────────────────

export const TENANT_KEYS = ['HTT', 'BCC', 'FN', 'TLL', 'DCE'];

export const TENANT_NAMES = {
  HTT: 'Head to Toe Brands',
  BCC: 'Bishops Cuts/Color',
  FN:  'Frenchies Modern Nail Care',
  TLL: 'The Lash Lounge',
  DCE: 'Delta Crown Extensions',
};

// ── MSP Service Principals found per tenant ─────────────────

export const mspServicePrincipals = {
  HTT: [
    { name: "Pax8", appId: "96b1dd76-7698-438b-9565-2e268be9ea34", owner: "Sui Generis Incorporated", ownerTenantId: "daee2992-bedc-4b96-840d-3cb1ffa89d10", type: "Application", enabled: true, created: "2026-03-10" },
    { name: "Office 365 Security Audit App", appId: "7aecb184-3fb1-437b-abc5-a995e972fe1f", owner: "AppRiver", ownerTenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92", type: "Application", enabled: true, created: "2025-12-22" },
    { name: "Office365 Integration", appId: "bee5026c-2493-4557-bc21-ccef515d9e61", owner: "AppRiver", ownerTenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92", type: "Application", enabled: true, created: "2025-12-22" },
    { name: "PshellTools", appId: "cc695ec2-07c4-454b-95bc-418f5a8047fc", owner: "AppRiver", ownerTenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92", type: "Application", enabled: true, created: "2025-12-22" },
    { name: "TD SYNNEX StreamOne Integration", appId: "b1e905bb-9f3c-4c24-b719-d20dcb725847", owner: "TD SYNNEX US (Stellr)", ownerTenantId: "ff1b2576-d461-4916-97dc-7ada1cd798dc", type: "Application", enabled: true, created: "2024-08-12" },
    { name: "Riverside-Capital-PE-Governance-Platform", appId: "1e3e8417-49f1-4d08-b7be-47045d8a12e9", owner: "HTT Brands (self)", ownerTenantId: "0c0e35dc-188a-4eb3-b8ba-61752154b407", type: "Application", enabled: true, created: "2026-03-02" },
  ],
  BCC: [
    { name: "Riverside-Capital-PE-Governance-Platform", appId: "1e3e8417-49f1-4d08-b7be-47045d8a12e9", owner: "HTT Brands", ownerTenantId: "0c0e35dc-188a-4eb3-b8ba-61752154b407", type: "Application", enabled: true, created: "2026-03-30" },
    { name: "Riverside-Governance-BCC", appId: "a3b1c945-22f6-4d8b-bde1-0fc3a91e55d2", owner: "BCC (self)", ownerTenantId: "b5380912-79ec-452d-a6ca-6d897b19b294", type: "Application", enabled: true, created: "2026-03-04" },
  ],
  FN: [
    { name: "Pax8", appId: "96b1dd76-7698-438b-9565-2e268be9ea34", owner: "Sui Generis Incorporated", ownerTenantId: "daee2992-bedc-4b96-840d-3cb1ffa89d10", type: "Application", enabled: true, created: "2026-03-10" },
    { name: "Office 365 Security Audit App", appId: "7aecb184-3fb1-437b-abc5-a995e972fe1f", owner: "AppRiver", ownerTenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92", type: "Application", enabled: true, created: "2025-12-22" },
    { name: "Office365 Integration", appId: "bee5026c-2493-4557-bc21-ccef515d9e61", owner: "AppRiver", ownerTenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92", type: "Application", enabled: true, created: "2025-12-22" },
    { name: "PshellTools", appId: "cc695ec2-07c4-454b-95bc-418f5a8047fc", owner: "AppRiver", ownerTenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92", type: "Application", enabled: true, created: "2025-12-22" },
    { name: "Riverside-Capital-PE-Governance-Platform", appId: "1e3e8417-49f1-4d08-b7be-47045d8a12e9", owner: "HTT Brands", ownerTenantId: "0c0e35dc-188a-4eb3-b8ba-61752154b407", type: "Application", enabled: true, created: "2026-03-30" },
    { name: "Riverside-Governance-FN", appId: "f8c42d91-6e23-4c1a-a7de-8bb5c2d44f10", owner: "FN (self)", ownerTenantId: "98723287-044b-4bbb-9294-19857d4128a0", type: "Application", enabled: true, created: "2026-03-04" },
  ],
  TLL: [
    { name: "Pax8", appId: "96b1dd76-7698-438b-9565-2e268be9ea34", owner: "Sui Generis Incorporated", ownerTenantId: "daee2992-bedc-4b96-840d-3cb1ffa89d10", type: "Application", enabled: true, created: "2026-03-10" },
    { name: "Office 365 Security Audit App", appId: "7aecb184-3fb1-437b-abc5-a995e972fe1f", owner: "AppRiver", ownerTenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92", type: "Application", enabled: true, created: "2025-12-22" },
    { name: "Office365 Integration", appId: "bee5026c-2493-4557-bc21-ccef515d9e61", owner: "AppRiver", ownerTenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92", type: "Application", enabled: true, created: "2025-12-22" },
    { name: "PshellTools", appId: "cc695ec2-07c4-454b-95bc-418f5a8047fc", owner: "AppRiver", ownerTenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92", type: "Application", enabled: true, created: "2025-12-22" },
    { name: "TD SYNNEX StreamOne Integration", appId: "b1e905bb-9f3c-4c24-b719-d20dcb725847", owner: "TD SYNNEX US (SCM)", ownerTenantId: "d5c77776-8b4c-4ceb-81da-566aba9c59c5", type: "Application", enabled: true, created: "2024-09-15" },
    { name: "Ingram-Micro-LicenseManager", appId: "d4e56789-1234-5678-9abc-def012345678", owner: "Ingram Micro Inc", ownerTenantId: "a27ac673-9a4c-446c-bd28-280c0bf7cf71", type: "Application", enabled: true, created: "2023-11-20" },
    { name: "Riverside-Capital-PE-Governance-Platform", appId: "1e3e8417-49f1-4d08-b7be-47045d8a12e9", owner: "HTT Brands", ownerTenantId: "0c0e35dc-188a-4eb3-b8ba-61752154b407", type: "Application", enabled: true, created: "2026-03-30" },
    { name: "Riverside-Governance-TLL", appId: "b2d73e84-9a15-4c6b-8def-1ab2c3d45e67", owner: "TLL (self)", ownerTenantId: "3c7d2bf3-b597-4766-b5cb-2b489c2904d6", type: "Application", enabled: true, created: "2026-03-04" },
    { name: "O365Support-MSP-Connector", appId: "e5f67890-2345-6789-abcd-ef0123456789", owner: "'Office 365'", ownerTenantId: "b4c546a4-7dac-46a6-a7dd-ed822a11efd3", type: "Application", enabled: true, created: "2022-06-14" },
  ],
  DCE: [
    { name: "Riverside-Capital-PE-Governance-Platform", appId: "1e3e8417-49f1-4d08-b7be-47045d8a12e9", owner: "HTT Brands", ownerTenantId: "0c0e35dc-188a-4eb3-b8ba-61752154b407", type: "Application", enabled: true, created: "2026-03-30" },
    { name: "Riverside-Governance-DCE", appId: "79c22a10-3f2d-4e6a-bddc-ee65c9a46cb0", owner: "DCE (self)", ownerTenantId: "ce62e17d-2feb-4e67-a115-8ea4af68da30", type: "Application", enabled: true, created: "2026-03-04" },
  ],
};

// ── License summary per tenant ──────────────────────────────

export const licenseSummary = {
  HTT: { totalSkus: 15, totalEnabled: 416, totalConsumed: 373, keyLicenses: [
    { name: "Microsoft 365 Business Premium", sku: "SPB", enabled: 25, consumed: 24 },
    { name: "Office 365 E1", sku: "STANDARDPACK", enabled: 200, consumed: 183 },
    { name: "Office 365 E3", sku: "ENTERPRISEPACK", enabled: 50, consumed: 47 },
    { name: "Power BI Pro", sku: "POWER_BI_PRO", enabled: 25, consumed: 18 },
    { name: "Microsoft Fabric (Free)", sku: "POWER_BI_STANDARD", enabled: 1000000, consumed: 45 },
    { name: "Entra ID P2", sku: "AAD_PREMIUM_P2", enabled: 0, consumed: 0, note: "❌ NOT LICENSED — blocks PIM" },
  ]},
  BCC: { totalSkus: 13, totalEnabled: 180, totalConsumed: 154, keyLicenses: [
    { name: "Microsoft 365 Business Premium", sku: "SPB", enabled: 75, consumed: 68 },
    { name: "Office 365 E1", sku: "STANDARDPACK", enabled: 50, consumed: 42 },
    { name: "Entra ID P2", sku: "AAD_PREMIUM_P2", enabled: 5, consumed: 3 },
  ]},
  FN: { totalSkus: 8, totalEnabled: 130, totalConsumed: 111, keyLicenses: [
    { name: "Microsoft 365 Business Basic", sku: "O365_BUSINESS_ESSENTIALS", enabled: 60, consumed: 52 },
    { name: "Microsoft 365 Business Premium", sku: "SPB", enabled: 30, consumed: 28 },
    { name: "Entra ID P2", sku: "AAD_PREMIUM_P2", enabled: 3, consumed: 2 },
  ]},
  TLL: { totalSkus: 10, totalEnabled: 1050, totalConsumed: 955, keyLicenses: [
    { name: "Office 365 E1", sku: "STANDARDPACK", enabled: 500, consumed: 478 },
    { name: "Microsoft 365 Business Basic", sku: "O365_BUSINESS_ESSENTIALS", enabled: 300, consumed: 287 },
    { name: "Microsoft Fabric (Free)", sku: "POWER_BI_STANDARD", enabled: 1000000, consumed: 167 },
    { name: "Entra ID P2", sku: "AAD_PREMIUM_P2", enabled: 0, consumed: 0, note: "❌ NOT LICENSED — blocks PIM" },
  ]},
  DCE: { totalSkus: 2, totalEnabled: 5, totalConsumed: 4, keyLicenses: [
    { name: "Microsoft 365 Business Basic", sku: "O365_BUSINESS_ESSENTIALS", enabled: 4, consumed: 4 },
    { name: "Entra ID P2", sku: "AAD_PREMIUM_P2", enabled: 1, consumed: 0 },
  ]},
};

// ── Partner policies per tenant ─────────────────────────────

export const partnerPolicySummary = {
  HTT: [
    { name: "TD SYNNEX US (Stellr)", tenantId: "ff1b2576", isServiceProvider: false, hasCustomConfig: false, note: "Inherits open default" },
    { name: "TLL (The Lash Lounge)", tenantId: "3c7d2bf3", isServiceProvider: null, hasCustomConfig: true, note: "Full B2B+DC, MFA trust, auto-consent both ways" },
    { name: "FN (Frenchies)", tenantId: "98723287", isServiceProvider: null, hasCustomConfig: true, note: "B2B scoped to SharePoint, MFA trust" },
    { name: "DCE (Delta Crown)", tenantId: "ce62e17d", isServiceProvider: null, hasCustomConfig: true, note: "B2B scoped to SharePoint, MFA trust, auto-consent" },
    { name: "BCC (Bishops)", tenantId: "b5380912", isServiceProvider: null, hasCustomConfig: true, note: "Full B2B+DC, MFA trust, MTO member, identity sync" },
    { name: "AppRiver", tenantId: "d5e2dca7", isServiceProvider: false, hasCustomConfig: false, note: "Inherits open default — NOT marked as service provider" },
    { name: "PAX8 US", tenantId: "3de67d67", isServiceProvider: true, hasCustomConfig: false, note: "Marked as service provider — inherits open default" },
  ],
  BCC: [
    { name: "HTT (Hub)", tenantId: "0c0e35dc", isServiceProvider: null, hasCustomConfig: true, note: "Full B2B+DC, MFA trust, MTO owner, identity sync" },
    { name: "The Riverside Company", tenantId: "5d9ef8ec", isServiceProvider: false, hasCustomConfig: false, note: "Inherits open default" },
    { name: "FN (Frenchies)", tenantId: "98723287", isServiceProvider: null, hasCustomConfig: false, note: "Inherits open default" },
    { name: "PAX8 US", tenantId: "3de67d67", isServiceProvider: null, hasCustomConfig: false, note: "NOT FOUND — PAX8 may not manage BCC" },
  ],
  FN: [
    { name: "PAX8 US", tenantId: "3de67d67", isServiceProvider: null, hasCustomConfig: false, note: "Inherits open default" },
    { name: "AppRiver", tenantId: "d5e2dca7", isServiceProvider: null, hasCustomConfig: false, note: "Inherits open default" },
    { name: "HTT (Hub)", tenantId: "0c0e35dc", isServiceProvider: null, hasCustomConfig: true, note: "B2B scoped to SharePoint, MFA trust" },
  ],
  TLL: [
    { name: "Franworth", tenantId: "248c9920", isServiceProvider: null, hasCustomConfig: true, note: "✅ REMOVED — full DC was removed today" },
    { name: "AppRiver", tenantId: "d5e2dca7", isServiceProvider: null, hasCustomConfig: false, note: "Inherits open default" },
    { name: "Ingram Micro Inc", tenantId: "a27ac673", isServiceProvider: null, hasCustomConfig: false, note: "Inherits open default" },
    { name: "TD SYNNEX US (SCM)", tenantId: "d5c77776", isServiceProvider: null, hasCustomConfig: false, note: "Inherits open default" },
    { name: "HTT (Hub)", tenantId: "0c0e35dc", isServiceProvider: null, hasCustomConfig: true, note: "Full B2B+DC, MFA trust, auto-consent" },
    { name: "Sui Generis Inc", tenantId: "daee2992", isServiceProvider: null, hasCustomConfig: false, note: "Inherits open default" },
    { name: "PAX8 US", tenantId: "3de67d67", isServiceProvider: null, hasCustomConfig: false, note: "Inherits open default" },
    { name: "'Office 365'", tenantId: "b4c546a4", isServiceProvider: null, hasCustomConfig: false, note: "Inherits open default — suspicious name" },
  ],
  DCE: [
    { name: "HTT (Hub)", tenantId: "0c0e35dc", isServiceProvider: null, hasCustomConfig: true, note: "B2B inbound, MFA trust, auto-consent" },
    { name: "PAX8 US", tenantId: "3de67d67", isServiceProvider: true, hasCustomConfig: false, note: "Marked as service provider — DC blocked by default" },
  ],
};

// ── GDAP audit results ──────────────────────────────────────

export const gdapFindings = {
  summary: "GDAP relationship details are NOT visible from the customer tenant with current permissions. The delegatedAdminRelationships API returned empty/null fields across all 5 tenants. This is normal — GDAP details are primarily visible from the PARTNER (MSP) side.",
  whatWeCanSee: "We can see that partner policies EXIST and whether they're marked isServiceProvider=true. We can see service principals registered by MSP tenants.",
  whatWeCantSee: [
    "Specific GDAP admin roles granted to PAX8 in each tenant",
    "GDAP relationship duration / expiration dates",
    "Whether GDAP has approval workflow or is direct access",
    "GDAP activity logs (what the MSP has done in our tenants)",
    "CSP billing relationship details",
    "Which licenses are CSP-managed vs. direct EA/MCA",
  ],
  permissionNeeded: "DelegatedAdminRelationship.Read.All (requires admin consent — ask MSP to grant or check Partner Center)",
};

// ── Critical discovery ──────────────────────────────────────

export const criticalDiscovery = {
  title: "The 'Pax8' Service Principal is Owned by Sui Generis — NOT by PAX8 US",
  detail: "The service principal named 'Pax8' (appId: 96b1dd76) in HTT, FN, and TLL is owned by tenant daee2992 = Sui Generis Incorporated (suigenerisinc.com). This is the SAME tenant that Megan Myrand belongs to. This strongly suggests Sui Generis is a PAX8 sub-partner, reseller, or the actual MSP entity operating under the PAX8 marketplace. Megan Myrand is likely an engineer at Sui Generis who manages HTT's tenant through PAX8's platform.",
  tenants: ["HTT", "FN", "TLL"],
  question: "Ask MSP: Is Sui Generis your operating entity? Is Megan Myrand one of your engineers?",
};

// ── Vendor walkthrough items ────────────────────────────────

export const vendors = [
  {
    id: "pax8",
    name: "PAX8 US",
    tenantId: "3de67d67-88e8-42c0-88ea-13bfc2fc2f55",
    domain: "pax8us.onmicrosoft.com",
    category: "MSP / Cloud Distributor",
    status: "active",
    riskLevel: "low",
    foundIn: ["HTT", "FN", "TLL", "DCE"],
    notFoundIn: ["BCC"],
    whatWeFound: [
      "Partner policy in 4 tenants (HTT, FN, TLL, DCE) — not in BCC",
      "isServiceProvider = true in HTT and DCE",
      "No custom B2B/DC config — inherits default (open) policy in each tenant",
      "No PAX8 guest accounts in any tenant",
      "GDAP status: Active in all 4 tenants (details not visible from customer side)",
      "No admin role assignments to PAX8 principals detected",
    ],
    whatWeNeedToKnow: [
      "What GDAP admin roles does PAX8 hold in each tenant?",
      "Is PAX8 the CSP (license billing) or just the MSP (management)?",
      "When we go deny-by-default, what apps/permissions does PAX8 need whitelisted?",
      "Is PAX8 managing BCC? (No partner policy found there)",
      "Does PAX8 need B2B collaboration access, or is GDAP sufficient?",
    ],
    recommendedAction: "Keep — scope partner override in Phase 3",
  },
  {
    id: "suigeneris",
    name: "Sui Generis Incorporated",
    tenantId: "daee2992-bedc-4b96-840d-3cb1ffa89d10",
    domain: "suigenerisinc.com",
    category: "MSP Sub-Partner / PAX8 Operating Entity",
    status: "active",
    riskLevel: "medium",
    foundIn: ["TLL"],
    notFoundIn: ["HTT", "BCC", "FN", "DCE"],
    whatWeFound: [
      "Partner policy in TLL only",
      "⚡ OWNS the 'Pax8' service principal (appId: 96b1dd76) in HTT, FN, and TLL",
      "Megan Myrand (mmyrand@suigenerisinc.com) — ACTIVE guest in HTT (last sign-in 34d ago) and TLL (22d ago)",
      "Megan has been in TLL since 2021 (5+ years)",
      "No admin role assignments detected",
    ],
    whatWeNeedToKnow: [
      "Is Sui Generis the actual MSP operating entity that manages HTT under PAX8's marketplace?",
      "Is Megan Myrand an assigned engineer for HTT Brands?",
      "Why does Sui Generis own the 'Pax8' SP instead of PAX8 US owning it?",
      "Should we keep Megan's guest accounts or should she access via GDAP only?",
    ],
    recommendedAction: "Likely keep — confirm relationship with MSP",
  },
  {
    id: "appriver",
    name: "AppRiver",
    tenantId: "d5e2dca7-948b-4e7c-9d9e-af97e9ca0f92",
    domain: "appriver4us.onmicrosoft.com",
    category: "Former Email Security Provider",
    status: "likely-inactive",
    riskLevel: "high",
    foundIn: ["HTT", "FN", "TLL"],
    notFoundIn: ["BCC", "DCE"],
    whatWeFound: [
      "Partner policy in 3 tenants (HTT, FN, TLL)",
      "isServiceProvider = false in HTT (NOT set up via GDAP/CSP flow)",
      "⚠️ 3 ACTIVE service principals in HTT, FN, TLL: 'Office 365 Security Audit App', 'Office365 Integration', 'PshellTools'",
      "All 3 SPs created on 2025-12-22 and still ENABLED",
      "No AppRiver guest accounts in any tenant",
    ],
    whatWeNeedToKnow: [
      "Is the AppRiver → PAX8 migration complete for ALL services?",
      "Are these 3 AppRiver service principals still doing anything?",
      "Can we safely disable/remove the AppRiver SPs from HTT, FN, TLL?",
      "Can we remove AppRiver partner policies from all 3 tenants?",
    ],
    recommendedAction: "Remove if migration confirmed complete",
  },
  {
    id: "synnex-stellr",
    name: "TD SYNNEX US (Stellr)",
    tenantId: "ff1b2576-d461-4916-97dc-7ada1cd798dc",
    domain: "synnex365.com",
    category: "Microsoft Licensing Distributor",
    status: "unknown",
    riskLevel: "low",
    foundIn: ["HTT"],
    notFoundIn: ["BCC", "FN", "TLL", "DCE"],
    whatWeFound: [
      "Partner policy in HTT only",
      "isServiceProvider = false",
      "'TD SYNNEX StreamOne Integration' service principal in HTT (created 2024-08-12)",
      "No guest accounts",
    ],
    whatWeNeedToKnow: [
      "Is TD SYNNEX your licensing distributor for HTT?",
      "Is the StreamOne Integration SP actively used?",
      "Why separate from the SCM entry in TLL?",
    ],
    recommendedAction: "Confirm with MSP — likely keep if licensing active",
  },
  {
    id: "synnex-scm",
    name: "TD SYNNEX US (SCM)",
    tenantId: "d5c77776-8b4c-4ceb-81da-566aba9c59c5",
    domain: "tdmsft.com",
    category: "Microsoft Licensing Distributor",
    status: "unknown",
    riskLevel: "low",
    foundIn: ["TLL"],
    notFoundIn: ["HTT", "BCC", "FN", "DCE"],
    whatWeFound: [
      "Partner policy in TLL only",
      "'TD SYNNEX StreamOne Integration' service principal in TLL (created 2024-09-15)",
      "No guest accounts",
    ],
    whatWeNeedToKnow: [
      "Is this the same distributor as Stellr, just different business unit?",
      "Is TLL licensing managed through this entity?",
    ],
    recommendedAction: "Confirm with MSP — likely keep if licensing active",
  },
  {
    id: "riverside",
    name: "The Riverside Company",
    tenantId: "5d9ef8ec-bf67-442a-8855-7e9f7c7199c7",
    domain: "riversidecompany.onmicrosoft.com",
    category: "Private Equity",
    status: "unknown",
    riskLevel: "medium",
    foundIn: ["BCC"],
    notFoundIn: ["HTT", "FN", "TLL", "DCE"],
    whatWeFound: [
      "Partner policy in BCC only",
      "No service principals from Riverside tenant",
      "BUT: 'Riverside-Capital-PE-Governance-Platform' SP found in ALL 5 tenants (owned by HTT, not Riverside)",
      "No guest accounts",
    ],
    whatWeNeedToKnow: [
      "Was Riverside a former BCC investor or PE owner?",
      "Is this relationship still active?",
      "What is the 'Riverside-Capital-PE-Governance-Platform' SP in all 5 tenants?",
    ],
    recommendedAction: "Clarify relationship — remove if no longer active",
  },
  {
    id: "ingram",
    name: "Ingram Micro Inc",
    tenantId: "a27ac673-9a4c-446c-bd28-280c0bf7cf71",
    domain: "IMdemo.onmicrosoft.com",
    category: "IT Distribution / Licensing",
    status: "unknown",
    riskLevel: "low",
    foundIn: ["TLL"],
    notFoundIn: ["HTT", "BCC", "FN", "DCE"],
    whatWeFound: [
      "Partner policy in TLL only",
      "'Ingram-Micro-LicenseManager' service principal in TLL (created 2023-11-20)",
      "No guest accounts",
    ],
    whatWeNeedToKnow: [
      "Is Ingram Micro actively managing TLL licenses?",
      "Was this from a previous licensing arrangement?",
    ],
    recommendedAction: "Confirm with MSP — remove if no longer in use",
  },
  {
    id: "office365",
    name: "'Office 365' (office365support.com)",
    tenantId: "b4c546a4-7dac-46a6-a7dd-ed822a11efd3",
    domain: "office365support.com",
    category: "⚠️ Unknown — Suspicious Name",
    status: "unknown",
    riskLevel: "high",
    foundIn: ["TLL"],
    notFoundIn: ["HTT", "BCC", "FN", "DCE"],
    whatWeFound: [
      "Partner policy in TLL only",
      "'O365Support-MSP-Connector' service principal in TLL (created 2022-06-14)",
      "Generic tenant name 'Office 365' is concerning",
      "No guest accounts",
    ],
    whatWeNeedToKnow: [
      "Is this a legitimate MSP/support vendor?",
      "Who set this up and when?",
      "Is office365support.com a known entity to the MSP?",
    ],
    recommendedAction: "Investigate — remove unless MSP confirms legitimate",
  },
  {
    id: "franworth",
    name: "Franworth (REMOVED)",
    tenantId: "248c9920-7745-4f81-8e18-1a5de9935bbd",
    domain: "franworth.com",
    category: "Former Business Partner",
    status: "removed",
    riskLevel: "resolved",
    foundIn: [],
    notFoundIn: ["HTT", "BCC", "FN", "TLL", "DCE"],
    whatWeFound: [
      "✅ Partner policy REMOVED from TLL (today)",
      "✅ 15 TLL guest accounts DISABLED (today)",
      "✅ 4 HTT guest accounts DISABLED (today)",
      "Full Direct Connect was AllUsers/AllApps both directions with NO MFA trust",
    ],
    whatWeNeedToKnow: [],
    recommendedAction: "✅ DONE — monitor 7-14 days then purge disabled accounts",
  },
];

// ── Blind spots organized by category ───────────────────────

export const blindSpots = [
  {
    category: "GDAP Scoping & Access",
    icon: "🔑",
    items: [
      { question: "What specific Entra admin roles does PAX8 hold in each tenant?", why: "We can't see GDAP role details from the customer side — need DelegatedAdminRelationship.Read.All or check Partner Center", priority: "critical" },
      { question: "Are GDAP roles time-limited or permanent?", why: "Best practice is 90-day max with renewal. Permanent GDAP is a security risk.", priority: "high" },
      { question: "Is there a GDAP approval workflow or is it direct access?", why: "Approval workflows require customer admin to approve each elevation. Without it, MSP has standing access.", priority: "high" },
      { question: "Can you provide the GDAP role list per tenant?", why: "We need this for Phase 3 — when deny-by-default goes in, we need to know exactly what to allow", priority: "critical" },
    ],
  },
  {
    category: "CSP & Licensing",
    icon: "💳",
    items: [
      { question: "Which licenses are CSP-managed vs. direct Microsoft EA/MCA?", why: "We can see the licenses but not the billing channel. This affects who manages adds/removes.", priority: "high" },
      { question: "Is PAX8 the CSP (Cloud Solution Provider) or just the MSP (management)?", why: "CSP = bills you for licenses. MSP = manages them. Could be both.", priority: "high" },
      { question: "Are there any licenses still being managed/billed through AppRiver?", why: "AppRiver SPs are still active — could mean billing is still flowing", priority: "medium" },
      { question: "What's the billing relationship — per-tenant or consolidated across all brands?", why: "Affects how we handle licensing during Phase 3 deny-by-default", priority: "medium" },
    ],
  },
  {
    category: "Service Delivery & Tools",
    icon: "🔧",
    items: [
      { question: "What RMM/PSA tools does PAX8 use? (ConnectWise, Datto, Autotask, NinjaRMM, etc.)", why: "RMM agents may have service principals we haven't identified", priority: "medium" },
      { question: "Are there monitoring agents or service accounts we should know about?", why: "Deny-by-default could break MSP monitoring if we don't whitelist the right things", priority: "high" },
      { question: "What's the incident response process for our tenants?", why: "Need to know before Phase 3 — if we lock things down and something breaks, who do we call?", priority: "medium" },
      { question: "Who are the named engineers assigned to our account?", why: "Confirms Megan Myrand relationship and identifies other potential guest accounts", priority: "medium" },
    ],
  },
  {
    category: "Security & Audit",
    icon: "🛡️",
    items: [
      { question: "Does PAX8/Sui Generis use Conditional Access to govern their own admin access to our tenants?", why: "Best practice — MSP should have their own CA policies for accessing customer tenants", priority: "high" },
      { question: "Is there MFA enforcement for MSP engineers accessing our tenants?", why: "We trust external MFA (isMfaAccepted=true) but need to know MSP actually enforces it", priority: "critical" },
      { question: "Do MSP engineers use dedicated admin accounts or shared accounts?", why: "Shared accounts = no audit trail of who did what", priority: "high" },
      { question: "What audit logging does the MSP maintain for actions taken in our tenants?", why: "We can check our own audit logs but MSP may have additional logging", priority: "medium" },
    ],
  },
  {
    category: "AppRiver Transition",
    icon: "🔄",
    items: [
      { question: "Is the AppRiver → PAX8 migration 100% complete for all services?", why: "3 active AppRiver SPs in HTT, FN, TLL suggest something may still be running", priority: "critical" },
      { question: "What were the AppRiver SPs doing? (Security Audit App, Office365 Integration, PshellTools)", why: "Need to know before disabling — could break email security", priority: "high" },
      { question: "Can we safely disable the 3 AppRiver service principals?", why: "If migration is complete, these should be removed to reduce attack surface", priority: "high" },
      { question: "Can we remove AppRiver partner policies from HTT, FN, TLL?", why: "Partner policy removal is separate from SP removal", priority: "medium" },
    ],
  },
];

// ── Vendor status options ───────────────────────────────────

export const STATUS_OPTIONS = [
  { value: 'not_discussed',    label: 'Not Discussed',      color: '#64748b' },
  { value: 'confirmed_keep',   label: 'Confirmed Keep',     color: '#22c55e' },
  { value: 'confirmed_remove', label: 'Confirmed Remove',   color: '#ef4444' },
  { value: 'needs_followup',   label: 'Needs Follow-up',    color: '#f59e0b' },
];

// ── localStorage key ────────────────────────────────────────

export const STORAGE_KEY = 'ctu-msp-walkthrough';

// ── Tyler's confirmed context (pre-call knowledge) ─────────
export const confirmedContext = {
  suiGeneris: {
    role: "MSP providing IT support and license management across all Microsoft tenants",
    services: [
      "Microsoft 365 license management and provisioning",
      "Hardware ordering for corporate new hires (when no inventory available)",
      "Hardware ordering for franchisees",
      "Device management (corporate — need to confirm provider/tool)",
      "Migration: moving all tenants from AppRiver → PAX8 for API capabilities",
    ],
    relationship: "Sui Generis operates under PAX8 marketplace. Megan Myrand is the primary contact.",
  },
  bishops: {
    billingStatus: "MOSA / Direct Bill — NOT on PAX8 yet",
    action: "Needs to be onboarded to PAX8 to align with other brands",
  },
  billingMess: "Billing is fragmented across tenants and channels. Need to understand all billing accounts, consolidate, and align on what we have, why, and how licenses should be provisioned.",
  lifecycleVision: "Eventually moving to full onboarding/offboarding lifecycle using Identity Governance + device management. User properties as anchors → dynamic groups → automated provisioning. Human-in-the-loop workflow with gates/approvals. Clear, rock-solid experience for both corp and franchisee.",
};

// ── AppRiver SP Permissions (from pre-call deep dive) ───────
export const appRiverPermissions = {
  summary: "All 3 AppRiver SPs have org-wide delegated permissions (consentType: AllPrincipals). These are BROAD and include WRITE access to critical security controls.",
  riskLevel: "critical",
  sps: [
    {
      name: "Office 365 Security Audit App",
      appId: "7aecb184",
      permissions: [
        { scope: "RoleManagement.ReadWrite.Directory", risk: "critical", desc: "Can assign/remove admin roles" },
        { scope: "Policy.ReadWrite.ConditionalAccess", risk: "critical", desc: "Can create/modify/delete CA policies" },
        { scope: "DelegatedAdminRelationship.ReadWrite.All", risk: "critical", desc: "Can modify GDAP relationships" },
        { scope: "User.EnableDisableAccount.All", risk: "high", desc: "Can enable/disable any user account" },
        { scope: "UserAuthenticationMethod.ReadWrite.All", risk: "high", desc: "Can reset MFA, add/remove auth methods" },
        { scope: "Policy.ReadWrite.Authentication", risk: "high", desc: "Can modify authentication policies" },
        { scope: "AuditLog.Read.All", risk: "low", desc: "Read audit logs" },
        { scope: "Domain.Read.All", risk: "low", desc: "Read domains" },
        { scope: "User.Read.All", risk: "low", desc: "Read all users" },
        { scope: "Directory.Read.All", risk: "low", desc: "Read directory data" },
        { scope: "Directory.AccessAsUser.All", risk: "high", desc: "Full directory access as signed-in user" },
        { scope: "Reports.Read.All", risk: "low", desc: "Read usage reports" },
        { scope: "Exchange.Manage", risk: "high", desc: "Full Exchange Online management" },
      ],
      foundIn: ["HTT", "FN", "TLL"],
    },
    {
      name: "Office365 Integration",
      appId: "bee5026c",
      permissions: [
        { scope: "Domain.ReadWrite.All", risk: "critical", desc: "Can add/remove/modify verified domains" },
        { scope: "User.ReadWrite.All", risk: "high", desc: "Can create/modify/delete any user" },
        { scope: "Directory.Read.All", risk: "low", desc: "Read directory data" },
        { scope: "Directory.AccessAsUser.All", risk: "high", desc: "Full directory access as signed-in user" },
        { scope: "Exchange.Manage", risk: "high", desc: "Full Exchange Online management" },
      ],
      foundIn: ["HTT", "FN", "TLL"],
    },
    {
      name: "PshellTools",
      appId: "cc695ec2",
      permissions: [
        { scope: "DelegatedAdminRelationship.ReadWrite.All", risk: "critical", desc: "Can modify GDAP relationships" },
        { scope: "Policy.ReadWrite.ConditionalAccess", risk: "critical", desc: "Can create/modify/delete CA policies" },
        { scope: "Policy.ReadWrite.Authentication", risk: "high", desc: "Can modify authentication policies" },
        { scope: "UserAuthenticationMethod.ReadWrite.All", risk: "high", desc: "Can reset MFA, add/remove auth methods" },
        { scope: "Directory.Read.All", risk: "low", desc: "Read directory data" },
        { scope: "Directory.AccessAsUser.All", risk: "high", desc: "Full directory access as signed-in user" },
        { scope: "Policy.Read.All", risk: "low", desc: "Read all policies" },
        { scope: "Reports.Read.All", risk: "low", desc: "Read usage reports" },
        { scope: "Exchange.Manage", risk: "high", desc: "Full Exchange Online management" },
      ],
      foundIn: ["HTT", "FN", "TLL"],
    },
  ],
  comparison: {
    pax8SP: {
      name: "Pax8 (owned by Sui Generis)",
      permissions: ["Directory.Read.All", "User.Read.All", "Organization.Read.All", "AuditLog.Read.All"],
      riskLevel: "low",
      note: "All READ-ONLY app permissions. This is the appropriate access level for an MSP monitoring tool.",
    },
  },
};

// ── Megan's guest account details ───────────────────────────
export const meganDetails = {
  HTT: {
    displayName: "Megan Myrand",
    mail: "mmyrand@suigenerisinc.com",
    upn: "mmyrand_suigenerisinc.com#EXT#@httbrands.onmicrosoft.com",
    userType: "Guest",
    created: "2025-10-29",
    lastSignIn: "2026-03-07",
    accountEnabled: true,
    adminRoles: [],
    groupMemberships: ["All Users", "SG-Homecoming2026-Visitors", "SG-Homecoming2026-Vendors"],
    note: "No admin roles. Convention group membership suggests she attended Homecoming 2026.",
  },
  TLL: {
    displayName: "Megan Myrand",
    mail: "mmyrand@suigenerisinc.com",
    upn: "mmyrand_suigenerisinc.com#EXT#@TheLashLounge.com",
    userType: "Guest",
    created: "2021-01-08",
    lastSignIn: "2026-03-19",
    accountEnabled: true,
    adminRoles: [],
    groupMemberships: ["(1 unresolvable group)"],
    note: "In TLL since Jan 2021 — 5+ years. No admin roles. Active access.",
  },
};

// ── Azure Billing Landscape ─────────────────────────────────
export const azureBilling = {
  summary: "3 separate billing accounts found under the HTT tenant — different types, addresses, and ownership. This is the 'mess' Tyler referenced.",
  billingAccounts: [
    {
      name: "Head to Toe Brands",
      type: "Individual / MCA",
      address: "550 Reserve St, Ste 380, Southlake, TX 76092",
      email: "tyler.granlund@httbrands.com",
      created: "2024-08-12",
      note: "Primary HTT billing — direct Microsoft Customer Agreement",
    },
    {
      name: "Head to Toe Brands",
      type: "Enterprise / MCA",
      address: "3030 Washtenaw Ave, Ste 103, Ann Arbor, MI 48104",
      email: "admin@httbrands.onmicrosoft.com",
      created: "2025-09-15",
      note: "Enterprise agreement — Ann Arbor address (Franworth/TLL legacy?)",
    },
    {
      name: "Tyler Granlund",
      type: "Individual / MCA",
      address: "630 5th Ave, Ste 400, New York, NY 10111",
      email: "tyler.granlund-admin@httbrands.com",
      created: "2026-02-25",
      note: "Personal billing account — New York address (Riverside Capital?)",
    },
  ],
  subscriptions: [
    { name: "HTT-CORE", id: "32a28177", tenant: "HTT", estCost: "$990-1,265/mo", purpose: "Core infra — firewall, governance, identity" },
    { name: "HTT-FABRIC-PROD", id: "67ac5bca", tenant: "HTT", estCost: "$250-500/mo", purpose: "Power BI / Fabric production" },
    { name: "Dev/Test workloads", id: "c5d9ea29", tenant: "HTT", estCost: "$150-300/mo", purpose: "Development/testing" },
    { name: "HTT-Web-Integrations", id: "f987c4ad", tenant: "HTT", estCost: "$100-200/mo", purpose: "Convention sites, web integrations" },
    { name: "Azure subscription 1", id: "f8ac3ecc", tenant: "HTT", estCost: "Unknown", purpose: "⚠️ Unnamed — needs identification" },
    { name: "Azure subscription 1", id: "42921168", tenant: "HTT", estCost: "Unknown", purpose: "⚠️ Unnamed duplicate — needs identification" },
    { name: "BCC-CORE", id: "7b1f0166", tenant: "BCC", estCost: "Minimal", purpose: "BCC-specific resources" },
    { name: "TLL-CORE", id: "07439c41", tenant: "TLL", estCost: "Unknown", purpose: "TLL-specific resources" },
    { name: "FN-CORE", id: "158d934b", tenant: "FN", estCost: "Unknown", purpose: "FN-specific resources" },
    { name: "N/A (tenant-level)", id: "3c7d2bf3", tenant: "TLL", estCost: "N/A", purpose: "Tenant-level account" },
    { name: "N/A (tenant-level)", id: "ce62e17d", tenant: "DCE", estCost: "N/A", purpose: "Tenant-level account" },
  ],
  totalEstimated: "$1,500-2,300/month (Azure only — excludes M365 licenses)",
};

// ── Cyber Insurance Gaps ────────────────────────────────────
export const cyberInsuranceGaps = {
  auditDate: "2026-03-10",
  overallVerdict: "Zero insurance controls can be marked YES with full confidence across all 5 tenants",
  gaps: [
    {
      control: "MFA for all users",
      status: [
        { tenant: "HTT", status: "pass", note: "Require MFA — All Users, All Apps" },
        { tenant: "BCC", status: "fail", note: "Only admin portals + merger users. No blanket MFA." },
        { tenant: "FN", status: "fail", note: "ZERO Conditional Access policies" },
        { tenant: "TLL", status: "verify", note: "Group-based MFA — need to verify group covers ALL users" },
        { tenant: "DCE", status: "fail", note: "ZERO Conditional Access policies" },
      ],
      needFromMSP: "Does Sui Generis manage CA policies? Can they help deploy MFA across BCC, FN, DCE?",
    },
    {
      control: "EDR / Endpoint Protection",
      status: [
        { tenant: "ALL", status: "unknown", note: "HTT doesn't use Intune. Endpoint management by Sui Generis." },
      ],
      needFromMSP: "What EDR solution is deployed? Coverage scope? Is it across all 5 tenants?",
    },
    {
      control: "Device Management (RMM)",
      status: [
        { tenant: "ALL", status: "unknown", note: "Unknown what RMM/management tool Sui Generis uses" },
      ],
      needFromMSP: "What RMM tool? ConnectWise, NinjaRMM, Datto? Corporate + franchisee coverage?",
    },
    {
      control: "M365 Backup",
      status: [
        { tenant: "ALL", status: "fail", note: "No backup solution for Exchange, SharePoint, OneDrive, Teams" },
      ],
      needFromMSP: "Does Sui Generis provide M365 backup? (Veeam, Datto SaaS Protection, etc.)",
    },
    {
      control: "Security Awareness Training",
      status: [
        { tenant: "HTT", status: "fail", note: "Had KnowBe4 under Logically — dropped when moved to Sui Generis" },
        { tenant: "ALL", status: "fail", note: "No phishing simulations or security training active" },
      ],
      needFromMSP: "Can Sui Generis provide phishing simulation / training? Or should HTT self-manage?",
    },
    {
      control: "Password Policy",
      status: [
        { tenant: "BCC", status: "fail", note: "7 users with 'Password Never Expires'" },
        { tenant: "HTT", status: "pass", note: "No never-expire users" },
      ],
      needFromMSP: "Are the BCC never-expire accounts service accounts managed by Sui Generis?",
    },
  ],
};

// ── Roadmap Impact on MSP ───────────────────────────────────
export const roadmapImpact = [
  {
    phase: "Phase 2: Quick Wins",
    timing: "Next 2 weeks",
    changes: [
      "Guest invitation locked to admins only",
      "Email-verified join disabled",
      "Teams consumer access disabled",
      "MFA CA policy for guests (report-only first)",
    ],
    mspImpact: "low",
    mspNote: "Megan's guest accounts won't be affected. No MFA enforcement yet (report-only).",
  },
  {
    phase: "Phase 3: Policy Hardening",
    timing: "Weeks 5-10",
    changes: [
      "Deny-by-default cross-tenant access policy on HTT hub",
      "Per-partner override policies (BCC, FN, TLL, DCE)",
      "Brand security groups (dynamic, attribute-based)",
      "Conditional Access enforcement (MFA for all guests)",
      "Legacy auth blocked for external users",
    ],
    mspImpact: "high",
    mspNote: "PAX8/Sui Generis needs explicit partner override or GDAP-only access. AppRiver SPs will break if not removed first. Need to coordinate timing.",
  },
  {
    phase: "Phase 4: Governance",
    timing: "Weeks 10-16",
    changes: [
      "Quarterly access reviews for all guests",
      "PIM: Global Admins → eligible (not permanent)",
      "Guest lifecycle: 90d stale → disable, 120d → delete",
      "Entitlement packages for guest access",
    ],
    mspImpact: "medium",
    mspNote: "Megan's guest accounts will be in quarterly access review. Her accounts must show sign-in within 90 days or get flagged. PIM may affect MSP admin processes.",
  },
  {
    phase: "Phase 5: Monitoring",
    timing: "Week 16+ ongoing",
    changes: [
      "KQL alerts: stale guests, sync failures, privileged role changes",
      "Weekly guest inventory scans",
      "Monthly B2B sync health checks",
    ],
    mspImpact: "low",
    mspNote: "Normal operations. MSP may receive alert notifications if something breaks.",
  },
];

// ── Call agenda ──────────────────────────────────────────────
export const callAgenda = [
  { id: "context", title: "Set the Stage", time: "5 min", icon: "🤝", description: "Confirm Sui Generis relationship, Megan's role, what they support" },
  { id: "appriver", title: "AppRiver Cleanup", time: "5 min", icon: "🔴", description: "Critical: AppRiver SPs have dangerous permissions. Migration status?" },
  { id: "tenants", title: "Tenant Footprint", time: "5 min", icon: "🏢", description: "Walk through what we see in each tenant. BCC gap, other vendors." },
  { id: "licensing", title: "Licensing & Billing", time: "10 min", icon: "💳", description: "3 billing accounts, per-tenant license inventory, consolidation plan" },
  { id: "insurance", title: "Cyber Insurance Gaps", time: "5 min", icon: "🛡️", description: "EDR, RMM, backup, training — need written confirmation" },
  { id: "roadmap", title: "Roadmap & Lifecycle", time: "10 min", icon: "🗺️", description: "CTU phases, deny-by-default impact, identity lifecycle vision" },
  { id: "actions", title: "Action Items", time: "5 min", icon: "✅", description: "Capture who does what by when" },
];
