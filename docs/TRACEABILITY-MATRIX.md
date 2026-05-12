# CTU — Requirements Traceability Matrix (RTM)
**Project:** HTT Brands Cross-Tenant Identity Audit & Remediation  
**Codename:** CTU (Cross-Tenant Utility)  
**Owner:** Tyler Granlund, IT Director — HTT Brands  
**Support:** Dustin Boyd, IT Operations & Support Lead  
**Version:** 1.0  
**Last Updated:** 2026-04-09  
**Status Key:** ⬜ Not Started | 🔄 In Progress | ✅ Complete | ❌ Blocked  

---

> **Scope Note:** This RTM covers 5 remediation phases across 7 audit domains, 5 tenants, and 4 cross-project dependencies. Requirements are organized by domain rather than phase — each requirement maps to a specific remediation phase via the Phase column.

---

## Section 1 — Cross-Tenant Default Policy Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-001 | The HTT hub tenant default cross-tenant access policy MUST block all inbound B2B Collaboration | baseline.json — default policy | Phase 3 | P1-Critical | `GET /policies/crossTenantAccessPolicy/default` returns `b2bCollaborationInbound.usersAndGroups.accessType = "blocked"` with target `AllUsers` | TC-001, TC-002 | ⬜ |
| CTU-002 | The HTT hub tenant default cross-tenant access policy MUST block all inbound B2B Direct Connect | baseline.json — default policy | Phase 3 | P1-Critical | `b2bDirectConnectInbound.usersAndGroups.accessType = "blocked"` with target `AllUsers` | TC-001, TC-003 | ⬜ |
| CTU-003 | The HTT hub tenant default policy MUST have auto-redemption inbound set to `false` | baseline.json — default policy | Phase 3 | P2-High | `automaticUserConsentSettings.inboundAllowed = false` | TC-001, TC-004 | ⬜ |
| CTU-004 | The HTT hub tenant default policy MUST have MFA trust set to `false` | baseline.json — default policy | Phase 3 | P2-High | `inboundTrust.isMfaAccepted = false` — MFA trust only enabled per-partner | TC-001, TC-005 | ⬜ |
| CTU-005 | The HTT hub tenant default policy MUST have device compliance trust set to `false` | baseline.json — default policy | Phase 3 | P3-Medium | `inboundTrust.isCompliantDeviceAccepted = false` | TC-001, TC-006 | ⬜ |
| CTU-006 | The `Set-DenyByDefault.ps1` script MUST support `-WhatIf` mode that logs all intended policy changes without executing them | AGENT.md — Code Standards | Phase 3 | P1-Critical | Running with `-WhatIf` produces JSON report of current vs. target state; zero Graph API PATCH calls made | TC-007, TC-008 | ⬜ |
| CTU-007 | `Set-DenyByDefault.ps1` MUST be idempotent — re-running against an already-compliant default policy produces no changes | AGENT.md — Code Standards | Phase 3 | P1-Critical | Second run reports `NO_CHANGE` for all policy settings; no API PATCH calls made | TC-009 | ⬜ |

---

## Section 2 — Per-Partner Policy Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-010 | Each of the 4 brand tenants (BCC, FN, TLL, DCE) MUST have an explicit partner-specific cross-tenant access policy in the HTT hub | baseline.json — partner overrides | Phase 3 | P1-Critical | `GET /policies/crossTenantAccessPolicy/partners` returns 4 partner entries matching tenant IDs: `b5380912-...`, `98723287-...`, `3c7d2bf3-...`, `ce62e17d-...` | TC-010, TC-011 | ⬜ |
| CTU-011 | Each partner policy MUST scope B2B Collaboration inbound to SharePoint Online application + a brand-specific security group | baseline.json — partner overrides; Homecoming architecture | Phase 3 | P1-Critical | `b2bCollaborationInbound.applications.targets` contains SharePoint Online app ID (not `AllApplications`); `usersAndGroups.targets` references a specific group (not `AllUsers`) | TC-012, TC-013 | ⬜ |
| CTU-012 | The TLL partner policy MUST be scoped (currently non-compliant at All Apps / All Users) | HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md — GAP-2 | Phase 1 (immediate) | P1-Critical | TLL partner policy `b2bCollaborationInbound` no longer has `AllApplications` + `AllUsers` targets; matches BCC/FN/DCE scoping pattern | TC-014 | ⬜ |
| CTU-013 | Each partner policy MUST have auto-redemption enabled bidirectionally (`inboundAllowed = true`, `outboundAllowed = true`) | baseline.json — partner overrides | Phase 3 | P1-Critical | All 4 partners show `automaticUserConsentSettings.inboundAllowed = true` AND `outboundAllowed = true` | TC-015 | ⬜ |
| CTU-014 | Each partner policy MUST trust the partner's MFA (`inboundTrust.isMfaAccepted = true`) | baseline.json — partner overrides | Phase 3 | P1-Critical | All 4 partners show `inboundTrust.isMfaAccepted = true` | TC-016 | ⬜ |
| CTU-015 | Each partner policy MUST have identity synchronization enabled (`userSyncInbound.isSyncAllowed = true`) | baseline.json — partner overrides | Phase 3 | P2-High | All 4 partners show `identitySynchronization.userSyncInbound.isSyncAllowed = true`; currently FN and DCE are missing | TC-017 | ⬜ |
| CTU-016 | Cross-tenant sync jobs MUST map `userType` to constant value `"Member"` (not `"Guest"`) | baseline.json — sync userType; Fix-SyncUserTypeMapping.ps1 | Phase 3 | P2-High | All active sync job schemas show `targetAttributeName = 'userType'` mapped to `"Member"`; no Guest mappings | TC-018 | ⬜ |
| CTU-017 | Each partner policy MUST scope B2B Direct Connect inbound to Office365 application only (not AllApplications) | B2BDirectConnect module — application scope check | Phase 3 | P2-High | `b2bDirectConnectInbound.applications.targets` contains only `Office365` app ID for all 4 partners | TC-019 | ⬜ |
| CTU-018 | Frenchies spoke tenant MUST have auto-redemption configured spoke→hub (currently missing) | Homecoming architecture — spoke-side status | Phase 2 | P2-High | Frenchies tenant `98723287-...` has partner policy for HTT with `automaticUserConsentSettings.outboundAllowed = true` | TC-020 | ⬜ |
| CTU-019 | Delta Crown spoke tenant MUST have auto-redemption configured spoke→hub (currently missing) | Homecoming architecture — spoke-side status | Phase 2 | P2-High | DCE tenant `ce62e17d-...` has partner policy for HTT with `automaticUserConsentSettings.outboundAllowed = true` | TC-021 | ⬜ |

---

## Section 3 — B2B Collaboration & Guest Policy Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-020 | Guest invitation setting MUST be restricted to `adminsAndGuestInviters` | baseline.json — authorization policy | Phase 2 | P1-Critical | `GET /policies/authorizationPolicy` returns `allowInvitesFrom = "adminsAndGuestInviters"` | TC-022 | ⬜ |
| CTU-021 | Guest user role MUST be set to Restricted Guest User (`2af84b1e-32c8-444d-8dfa-801d234f85e3`) | baseline.json — guest role | Phase 2 | P1-Critical | `authorizationPolicy.guestUserRoleId = "2af84b1e-32c8-444d-8dfa-801d234f85e3"` | TC-023 | ⬜ |
| CTU-022 | Email-verified self-service join MUST be disabled | baseline.json — email verification | Phase 2 | P2-High | `authorizationPolicy.allowEmailVerifiedUsersToJoinOrganization = false` | TC-024 | ⬜ |
| CTU-023 | Default user app creation rights MUST be disabled | B2BCollaboration module — app creation check | Phase 2 | P2-High | `authorizationPolicy.defaultUserRolePermissions.allowedToCreateApps = false` | TC-025 | ⬜ |
| CTU-024 | Self-service sign-up flows MUST be disabled unless specific approval gates are configured | B2BCollaboration module — sign-up flow check | Phase 2 | P2-High | `authenticationFlowsPolicy.selfServiceSignUp.isEnabled = false` | TC-026 | ⬜ |
| CTU-025 | NO guest accounts MUST hold privileged directory roles (Global Admin, Security Admin, SharePoint Admin, Exchange Admin, User Admin, Billing Admin, Application Admin, Privileged Role Admin) | GuestInventory module — privileged role check | Phase 2 | P1-Critical | Query of 8 privileged role templates returns zero guest members | TC-027, TC-028 | ⬜ |
| CTU-026 | All guest accounts from untrusted domains (not in config.trustedDomains) MUST be reviewed and documented | GuestInventory module — domain trust validation | Phase 2 | P2-High | Guest inventory CSV flags all untrusted-domain guests; each is reviewed and either approved or scheduled for removal | TC-029 | ⬜ |
| CTU-027 | Guest accounts with no sign-in activity for >90 days MUST be flagged for review | baseline.json — stale guest threshold | Phase 4 | P2-High | `guests_{tenant}.csv` output includes `isStale = true` column for guests exceeding 90-day threshold | TC-030, TC-031 | ⬜ |
| CTU-028 | Guest accounts that have never signed in AND were created >90 days ago MUST be flagged as abandoned | GuestInventory module — never-signed-in check | Phase 2 | P2-High | Inventory report flags never-signed-in guests older than threshold with `status = "abandoned"` | TC-032 | ⬜ |
| CTU-029a | AppRiver service principals MUST be disabled across HTT, FN, TLL (3 SPs × 3 tenants = 9 total) — migration to PAX8 complete | AppRiver migration confirmation (Apr 13 call); `reports/appriver-disable_2026-04-10_165012.json` | Phase 2 | P1-Critical | All 9 AppRiver SPs `accountEnabled = false` via Graph API; dashboard data layer updated to `enabled: false` | TC-032a | ✅ |
| CTU-029b | Franworth partner policy and guest accounts MUST be removed from TLL and HTT | `reports/franworth-removal-executed.json`; comprehensive audit G1-2 gate | Phase 2 | P1-Critical | TLL partner policy for `248c9920` removed; 15 TLL + 4 HTT guest accounts disabled; audit-data.js Franworth entry marked `resolved: true` | TC-032b | ✅ |

---

## Section 4 — Conditional Access Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-030 | At least one enabled CA policy MUST require MFA for all external/guest user types | ConditionalAccess module — MFA coverage check | Phase 2–3 | P1-Critical | CA policy query returns at least one `state = "enabled"` policy targeting guest/external users with `grantControls.builtInControls` containing `"mfa"` | TC-033, TC-034 | ⬜ |
| CTU-031 | The "B2B External Franchisee Access" CA policy MUST be moved from report-only to enforced | HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md — GAP-3 | Phase 3 | P1-Critical | Policy `state = "enabled"` (not `"enabledForReportingButNotEnforced"`) | TC-035 | ⬜ |
| CTU-032 | MFA CA policy MUST cover all 3 external user types: b2bCollaborationGuest, b2bCollaborationMember, b2bDirectConnectUser | ConditionalAccess module — user type coverage | Phase 3 | P1-Critical | Policy `conditions.users.includeGuestsOrExternalUsers.guestOrExternalUserTypes` includes all 3 types | TC-036 | ⬜ |
| CTU-033 | At least one enabled CA policy MUST block legacy authentication for external users | ConditionalAccess module — legacy auth check | Phase 3 | P2-High | CA policy with `grantControls.builtInControls = "block"` targeting `clientAppTypes` including `"exchangeActiveSync"` and `"other"` for external users | TC-037 | ⬜ |
| CTU-034 | At least one enabled CA policy MUST enforce sign-in frequency ≤24 hours for external users | ConditionalAccess module — session control check | Phase 3 | P2-High | CA policy with `sessionControls.signInFrequency.isEnabled = true` and `value ≤ 24` (hours) for external users | TC-038 | ⬜ |
| CTU-035 | CA policy changes MUST first be deployed in report-only mode for ≥7 days before enforcement | PHASED-REMEDIATION.md — Phase 3 approach | Phase 3 | P2-High | CA insights workbook reviewed showing report-only impact; no unexpected block patterns; documented sign-off before enabling | TC-039 | ⬜ |

---

## Section 5 — Teams Federation Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-040 | HTT hub tenant Teams federation MUST be set to AllowList mode (not AllowAllKnownDomains) | baseline.json — Teams federation; TeamsFederation module | Phase 3 | P1-Critical | `Get-CsTenantFederationConfiguration` returns `AllowedDomains` as typed list (not `AllowAllKnownDomains`) | TC-040, TC-041 | ⬜ |
| CTU-041 | Teams federation allowlist MUST include all 5 HTT brand domains: httbrands.com, bishopsbs.com, thelashlounge.com, frenchiesnails.com, deltacrown.com | baseline.json — domain allowlist | Phase 3 | P1-Critical | `AllowedDomains` list contains all 5 domains; no extra untrusted domains | TC-042 | ⬜ |
| CTU-042 | Teams consumer access MUST be disabled (`AllowTeamsConsumer = false`) | baseline.json — consumer access | Phase 3 | P2-High | `Get-CsTenantFederationConfiguration` returns `AllowTeamsConsumer = false` | TC-043 | ⬜ |
| CTU-043 | External access with trial tenants MUST be blocked | TeamsFederation module — trial tenant check | Phase 3 | P2-High | `ExternalAccessWithTrialTenants = "Blocked"` | TC-044 | ⬜ |
| CTU-044 | `Set-TeamsFederationAllowlist.ps1` MUST be applied to all 5 tenants (not just HTT hub) | AGENT.md — Teams requires per-tenant auth | Phase 3 | P2-High | Teams federation config on all 5 tenants matches allowlist mode with approved domains | TC-045 | ⬜ |

---

## Section 6 — Identity Governance Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-050 | Quarterly access reviews MUST be configured for guest users across all M365 groups | baseline.json — access review; IdentityGovernance module | Phase 4 | P1-Critical | `GET /identityGovernance/accessReviews/definitions` returns at least one review definition scoped to guest users with `recurrence.pattern.type = "quarterly"` | TC-050, TC-051 | ⬜ |
| CTU-051 | Access reviews MUST have auto-apply decisions enabled with default decision = Deny | baseline.json — access review; IdentityGovernance module | Phase 4 | P2-High | Review definition shows `settings.autoApplyDecisionsEnabled = true` and `settings.defaultDecision = "Deny"` | TC-052 | ⬜ |
| CTU-052 | All permanent privileged directory role assignments (except ≤2 break-glass GA accounts) MUST be converted to PIM-eligible | IdentityGovernance module — PIM check | Phase 4 | P1-Critical | `roleAssignmentScheduleInstances` count ≤ 2 for Global Admin role template; all other privileged roles have zero permanent assignments | TC-053, TC-054 | ⬜ |
| CTU-053 | PIM activation MUST require MFA and justification | IdentityGovernance module — PIM best practices | Phase 4 | P2-High | PIM role settings for all privileged roles show `activationRules` requiring MFA and justification | TC-055 | ⬜ |
| CTU-054 | PIM activation duration MUST NOT exceed 8 hours | IdentityGovernance module — PIM best practices | Phase 4 | P2-High | Maximum activation duration configured to ≤480 minutes for all eligible assignments | TC-056 | ⬜ |
| CTU-055 | At least one entitlement management access package MUST exist for cross-tenant resource access | IdentityGovernance module — entitlement check | Phase 4 | P2-High | `GET /identityGovernance/entitlementManagement/accessPackages` returns ≥1 package | TC-057 | ⬜ |
| CTU-056 | Connected organizations in entitlement management MUST include only HTT MTO partner tenants | IdentityGovernance module — connected org check | Phase 4 | P2-High | All `connectedOrganizations` entries have `identitySources.tenantId` matching one of the 4 brand tenant IDs | TC-058 | ⬜ |

---

## Section 7 — Persistent Brand Group Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-060 | A persistent dynamic security group MUST exist in HTT tenant for each brand: SG-Brand-HTT-Dynamic, SG-Brand-BCC-Dynamic, SG-Brand-FN-Dynamic, SG-Brand-TLL-Dynamic, SG-Brand-DCE-Dynamic | HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md — target group architecture | Phase 3 (medium-term) | P1-Critical | 5 groups returned by mailNickname query in HTT tenant; each has `groupTypes` containing `"DynamicMembership"` and `membershipRuleProcessingState = "On"` | TC-060, TC-061 | ⬜ |
| CTU-061 | Each persistent brand group MUST have a domain-based membership rule matching all known domains for that brand | HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md — membership rules | Phase 3 (medium-term) | P1-Critical | SG-Brand-BCC: `mail -contains @bishops.co -or mail -contains @bishops.com -or mail -contains @bishopsbs.onmicrosoft.com`; SG-Brand-TLL: `mail -contains @thelashlounge.com -or mail -contains @lashloungefranchise.onmicrosoft.com`; etc. | TC-062 | ⬜ |
| CTU-062 | After Homecoming 2026 (post April 28, 2026), the 5 convention-specific dynamic groups (SG-Homecoming2026-Visitors-*) MUST be evaluated for sunset | HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md — consolidation | Post-event | P2-High | Convention groups either deleted or renamed/repurposed as persistent brand groups; no duplicate brand groups exist | TC-063 | ⬜ |
| CTU-063 | The TLL-Franchisee-Dynamic group in HTT tenant MUST be evaluated for consolidation into SG-Brand-TLL-Dynamic | HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md — BI redundancy | Phase 3 (medium-term) | P2-High | Either TLL-Franchisee-Dynamic is retired with Fabric workspace updated to use SG-Brand-TLL-Dynamic, OR documented justification for maintaining both groups | TC-064 | ⬜ |
| CTU-064 | Persistent brand groups MUST be used as the scoping target in per-partner B2B Collaboration policies | baseline.json — partner override scoping | Phase 3 (medium-term) | P2-High | Each partner policy `b2bCollaborationInbound.usersAndGroups.targets` references the corresponding persistent brand group ID | TC-065 | ⬜ |

---

## Section 8 — Unified Attribute Strategy Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-070 | `htt_role` and `htt_brand` extension attributes MUST be deployed to HTT hub tenant for corporate users | HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md — Phase 1 attributes | Phase 3 (medium-term) | P2-High | `GET /applications/{id}/extensionProperties` on HTT tenant returns `*_htt_role` and `*_htt_brand` with `dataType: String` | TC-070, TC-071 | ⬜ |
| CTU-071 | HTT corporate user accounts MUST have `htt_role = "corporate"` and `htt_brand = "htt"` set | HTT-CROSS-TENANT-IDENTITY-ANALYSIS.md — attribute deployment | Phase 3 (medium-term) | P2-High | Query of corporate accounts in HTT tenant shows correct attribute values; count matches expected corporate headcount | TC-072 | ⬜ |
| CTU-072 | The attribute strategy MUST NOT create duplicate or conflicting attribute names across tenants | FAC-Cohort-Dev CLAUDE.md — attribute reuse principle | All | P1-Critical | Attribute discovery script run against each tenant confirms no naming collisions; each `htt_*` attribute resolves to a single app registration per tenant | TC-073 | ⬜ |
| CTU-073 | Existing FAC extension attributes in TLL tenant (registered under app `037c2451-...`) MUST remain unchanged — CTU MUST NOT modify or duplicate them | FAC-Cohort-Dev CLAUDE.md — attribute ownership | All | P1-Critical | Post-CTU-deployment query of TLL tenant shows identical attribute set as pre-deployment; Wiggum-FAC-Extensions app registration untouched | TC-074 | ⬜ |
| CTU-074 | Future attribute deployment to BCC and FN tenants MUST follow the same pattern: discovery → plan → dry-run → approval gate → live write | AGENT.md — Code Standards | Phase 4 (long-term) | P2-High | Each tenant deployment produces `attribute-mapping-plan.json` and `--dry-run` output reviewed before live execution | TC-075 | ⬜ |

---

## Section 9 — Monitoring & Audit Schedule Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-080 | 6 KQL alert queries MUST be deployed to Azure Monitor / Log Analytics | monitoring/kql/ — 6 .kql files | Phase 5 | P2-High | All 6 alert rules active in Azure Monitor: CrossTenantPolicyChanges, NewGuestAccounts, GuestsAddedToPrivilegedRoles, IdentitySyncFailures, ConditionalAccessChanges, TeamsFederationChanges | TC-080, TC-081 | ⬜ |
| CTU-081 | CrossTenantPolicyChanges alert MUST fire within 15 minutes of any partner or default policy modification | monitoring/kql/CrossTenantPolicyChanges.kql | Phase 5 | P2-High | Test modification triggers alert within 15 minutes; alert includes actor, target policy, and change details | TC-082 | ⬜ |
| CTU-082 | GuestsAddedToPrivilegedRoles alert MUST fire within 15 minutes of a guest being added to any of the 8 monitored privileged roles | monitoring/kql/GuestsAddedToPrivilegedRoles.kql | Phase 5 | P1-Critical | Test guest role assignment triggers alert; zero false negatives | TC-083 | ⬜ |
| CTU-083 | Weekly guest spot-check audit MUST be scheduled | PHASED-REMEDIATION.md — Phase 5 schedule | Phase 5 | P2-High | Recurring task or automation runs `Invoke-DomainAudit.ps1 -Domain GuestInventory` weekly against all tenants | TC-084 | ⬜ |
| CTU-084 | Monthly full guest inventory MUST be scheduled with stale detection | PHASED-REMEDIATION.md — Phase 5 schedule | Phase 5 | P2-High | Monthly run produces `guests_{tenant}.csv` for all 5 tenants with stale and abandoned flags | TC-085 | ⬜ |
| CTU-085 | Quarterly full 7-domain audit MUST be scheduled across all 5 tenants | PHASED-REMEDIATION.md — Phase 5 schedule | Phase 5 | P2-High | Quarterly `Invoke-FullAudit.ps1` produces AUDIT-SUMMARY.md with findings tracked against previous quarter | TC-086 | ⬜ |

---

## Section 10 — Audit Framework & Script Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-090 | `Invoke-FullAudit.ps1` MUST execute all 7 audit domains without manual intervention (except Teams interactive auth) | scripts/Invoke-FullAudit.ps1 | Phase 1 | P1-Critical | Script completes against at least 1 tenant producing AUDIT-SUMMARY.md, findings.csv, and audit-results.json in `reports/{AuditName}_{timestamp}/` | TC-090, TC-091 | ⬜ |
| CTU-091 | Audit MUST be read-only — zero Graph API writes during discovery phase | AGENT.md — Phase 1 is read-only | Phase 1 | P1-Critical | Network trace or script logging confirms only GET requests issued; zero POST/PATCH/DELETE calls | TC-092 | ⬜ |
| CTU-092 | `Test-Configuration.ps1` MUST validate all JSON configs and module imports before any audit runs | scripts/Test-Configuration.ps1 | Phase 1 | P1-Critical | Script exits code 0 confirming 8 modules loaded, 3 config files valid, all exported functions available | TC-093 | ⬜ |
| CTU-093 | Audit findings MUST be assigned a severity (Critical, High, Medium, Low, Info) consistent with the module's built-in checks | modules/ — all 8 modules | Phase 1 | P2-High | AUDIT-SUMMARY.md groups findings by severity; each finding has a severity level assigned by the module | TC-094 | ⬜ |
| CTU-094 | Per-tenant audit failures MUST be caught and logged — a single tenant failure MUST NOT abort the full audit | AGENT.md — Code Standards | Phase 1 | P2-High | Intentionally failing one tenant's auth still produces reports for remaining tenants; failed tenant logged with error details | TC-095 | ⬜ |
| CTU-095 | All remediation scripts MUST support the `-WhatIf` parameter | AGENT.md — Code Standards | Phase 2–3 | P1-Critical | `Set-DenyByDefault.ps1 -WhatIf`, `Fix-SyncUserTypeMapping.ps1 -WhatIf`, and `Set-TeamsFederationAllowlist.ps1 -WhatIf` all produce preview output without API writes | TC-096, TC-097 | ⬜ |
| CTU-096 | All scripts MUST load credentials from environment variables or `.env` — zero hardcoded secrets | AGENT.md — Code Standards | All | P1-Critical | Code review of all `.ps1` and `.py` files confirms no hardcoded tenant IDs used for auth, client secrets, or credentials; `.env` is in `.gitignore` | TC-098 | ⬜ |
| CTU-097 | All remediation scripts MUST produce structured JSON output for audit trail | AGENT.md — Code Standards | Phase 2–3 | P2-High | Each script writes a timestamped JSON file to `reports/` with before/after state for each changed setting | TC-099 | ⬜ |
| CTU-098 | `Install-Prerequisites.ps1` MUST install all required PowerShell modules without manual intervention | scripts/Install-Prerequisites.ps1 | Phase 0 | P2-High | Script installs Microsoft.Graph SDK and MicrosoftTeams module; exits code 0 | TC-100 | ⬜ |

---

## Section 11 — Cross-Project Integration Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-100 | Deny-by-default policy MUST NOT break existing Homecoming 2026 convention site access (327 users across 5 tenants) | Convention-Page-Build — access architecture | Phase 3 | P1-Critical | Post-hardening: `verify-access-chain.ps1` from Convention-Page-Build confirms all 6 SP Visitors group bindings active; spot-test of 1 user per brand succeeds | TC-101, TC-102 | ⬜ |
| CTU-101 | Deny-by-default policy MUST NOT break BI/Fabric franchise access pipeline (TLL→HTT B2B sync → TLL-Franchisee-Dynamic → Fabric workspace) | bi-support-agent — architecture | Phase 3 | P1-Critical | Post-hardening: `check-onboarding-status.py` from bi-support-agent confirms TLL→HTT sync still operational; TLL-Franchisee-Dynamic member count unchanged | TC-103 | ⬜ |
| CTU-102 | Deny-by-default policy MUST NOT affect FAC dynamic groups in TLL tenant (8 groups driven by custom attributes) | FAC-Cohort-Dev — group definitions | Phase 3 | P1-Critical | FAC groups are in TLL tenant (not HTT); CTU changes to HTT hub default policy have zero impact on TLL-internal groups; `03-validate-groups.py` from FAC-Cohort-Dev still passes | TC-104 | ⬜ |
| CTU-103 | TLL partner policy scoping (CTU-012) MUST include Fabric workspace access in the allowed applications | bi-support-agent — Fabric access requires B2B collab | Phase 1 (immediate) | P1-Critical | TLL partner policy scopes to SharePoint Online + Power BI Service (or the applications actually needed); BI team confirms Fabric access unaffected | TC-105 | ⬜ |
| CTU-104 | HTT HQ SharePoint permission redesign MUST wait until persistent brand groups (CTU-060) are established | sharepointagent — permissions blocked on role-based groups | Phase 3 (medium-term) | P2-High | No SP HQ permission changes made until brand groups exist and are validated | TC-106 | ⬜ |
| CTU-105 | Convention-specific dynamic groups MUST NOT be deleted before persistent brand groups are operational and SP Visitors bindings migrated | Convention-Page-Build — group lifecycle | Post-event | P1-Critical | Transition plan documents: create brand groups → bind to SP → validate access → unbind convention groups → delete convention groups | TC-107 | ⬜ |

---

## Section 12 — Stakeholder Gate Requirements

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-110 | Gate G1 (audit findings review) MUST be signed off before any remediation begins | AGENT.md — Gates | Phase 1→2 | P1-Critical | Tyler + Dustin review AUDIT-SUMMARY.md and sign off; documented approval with date | TC-110 | ⬜ |
| CTU-111 | Gate G2 (deny-by-default WhatIf) MUST be signed off before live policy changes | AGENT.md — Gates | Phase 2→3 | P1-Critical | Tyler reviews `-WhatIf` output from `Set-DenyByDefault.ps1`; documented approval with date | TC-111 | ⬜ |
| CTU-112 | Gate G3 (per-partner overrides) MUST be signed off confirming each brand's override is correct | AGENT.md — Gates | Phase 3 | P1-Critical | Tyler reviews all 4 partner policies; documented approval per tenant | TC-112 | ⬜ |
| CTU-113 | Gate G5 (E2E validation post-hardening) MUST confirm zero regression across Convention, BI, and FAC systems | AGENT.md — Gates | Phase 3→4 | P1-Critical | Cross-project validation scripts all pass; Tyler signs off | TC-113 | ⬜ |
| CTU-114 | Phase 3 policy hardening MUST be piloted on Delta Crown first (lowest-impact tenant) before rolling to other brands | PHASED-REMEDIATION.md — Phase 3 approach | Phase 3 | P2-High | DCE partner policy hardened and validated before BCC, FN, or TLL policies are modified | TC-114 | ⬜ |

---

## Section 13 — Architecture & Code Review Findings (ADR-001)

> **Source:** ADR-001 Architecture & Code Review conducted 2026-04-09 using /engineering:architecture + /engineering:code-review frameworks. These requirements address common hub-and-spoke cross-tenant failure modes identified through industry pattern analysis and line-by-line code review.

| Req ID | Requirement | Source | Phase | Priority | Acceptance Criteria | Linked Test Cases | Status |
|--------|-------------|--------|-------|----------|--------------------|--------------------|--------|
| CTU-120 | Partner override policies MUST be verified as existing and active BEFORE the default deny policy is applied — `Set-DenyByDefault.ps1` must create/verify overrides first, then apply default deny | ADR-001 ARCH-01 — sequencing race condition | Phase 3 | P1-Critical | Script execution log shows all 4 partner overrides confirmed active before any default policy PATCH call; partial-execution scenario tested | TC-120 | ✅ |
| CTU-121 | A full policy state snapshot MUST be saved to `reports/snapshots/` before any remediation script execution | ADR-001 ARCH-04 — no rollback capability | Phase 2–3 | P1-Critical | `reports/snapshots/{timestamp}_pre-remediation.json` exists with complete default policy + all partner policies captured as valid JSON before first PATCH | TC-121 | ✅ |
| CTU-122 | A rollback script (`Restore-CTUPolicySnapshot.ps1`) MUST exist, be tested, and be documented before any Phase 3 remediation | ADR-001 ARCH-04 — operational safety | Phase 3 | P1-Critical | Script exists; tested by applying deny-by-default, then restoring from snapshot; policy returns to pre-hardening state within 5 minutes | TC-122 | ✅ |
| CTU-123 | After `Fix-SyncUserTypeMapping.ps1`, a full sync re-provision cycle MUST be triggered — zero synced users should retain `userType = Guest` post-cycle | ADR-001 ARCH-05 — Guest orphan problem | Phase 3 | P1-Critical | Count of synced partner users with `userType = Guest` = 0 across all tenants after re-provision cycle completes | TC-123 | ⬜ |
| CTU-124 | Spoke tenants MUST have their own partner override policies for the HTT hub tenant before any spoke-side default deny is applied | ADR-001 ARCH-02 — outbound blocking breaks sync | Phase 3 | P1-Critical | Each spoke tenant has a partner policy entry for HTT hub (`0c0e35dc-...`) with B2B collab outbound allowed before spoke's default policy is hardened | TC-124 | ⬜ |
| CTU-125 | `baseline.json` partner override application targets MUST be scoped to specific application IDs (not AllApplications) once persistent brand groups (CTU-060) exist | ADR-001 ARCH-03 — AllUsers/AllApps contradicts scoping requirement | Phase 3 (medium-term) | P1-Critical | `baseline.json` `crossTenantPartnerOverrides.b2bCollaborationInbound.applications.targets` references specific app IDs (SPO, Power BI); no `AllApplications` target remains | TC-125 | ⬜ |
| CTU-126 | `ClientSecret` parameter MUST be deprecated in favor of certificate-based auth for all AppOnly operations | ADR-001 CODE-01 — credential exposure in command history | Phase 1 | P2-High | `ClientSecret` parameter produces deprecation warning when used; `CertificateThumbprint` is the documented and tested auth path | TC-126 | ✅ |
| CTU-127 | All remediation scripts MUST capture before-state in WhatIf output — JSON must contain both `before` and `after` for every setting | ADR-001 CODE-04 — missing before-state in WhatIf | Phase 2–3 | P2-High | `-WhatIf` JSON output contains `before` (current policy) and `after` (target policy) keys for each modified setting | TC-127, TC-131 | ✅ |
| CTU-128 | MTO membership MUST be evaluated and onboarding documented for FN, TLL, and DCE tenants | ADR-001 ARCH-07 — MTO incomplete | Phase 4 | P2-High | MTO evaluation document produced; each tenant either onboarded or has documented justification for deferral | TC-128 | ⬜ |
| CTU-129 | An emergency access procedure document MUST exist detailing how to revert deny-by-default within 15 minutes without cross-tenant B2B access | ADR-001 ARCH-08 — no break-glass path | Phase 3 | P1-Critical | Document exists with exact portal URLs, Graph API calls, and step-by-step revert procedure; tested in tabletop exercise | TC-129 | ✅ |

---

## RTM Summary

| Priority | Total Requirements | Coverage Areas |
|----------|--------------------|----------------|
| P1-Critical | 42 | Default policy, partner scoping, MFA enforcement, no privileged guests, brand groups, cross-project non-regression, audit read-only, gates, **execution sequencing, rollback capability, emergency access, spoke-side policies, sync re-provision** |
| P2-High | 32 | Identity sync, Teams federation, stale guests, CA controls, attributes, monitoring, script standards, **credential deprecation, before-state capture, MTO evaluation** |
| P3-Medium | 2 | Device compliance trust, minor policy settings |
| | **Total** | **78** | **13 sections across Phases 0–5 + cross-project integration + ADR-001 findings** |

---

## Linked Test Case Index

| TC Range | Domain | Count |
|----------|--------|-------|
| TC-001 — TC-009 | Default Cross-Tenant Policy | 9 |
| TC-010 — TC-021 | Per-Partner Policies | 12 |
| TC-022 — TC-032 | Guest & B2B Collaboration | 11 |
| TC-033 — TC-039 | Conditional Access | 7 |
| TC-040 — TC-045 | Teams Federation | 6 |
| TC-050 — TC-058 | Identity Governance | 9 |
| TC-060 — TC-065 | Persistent Brand Groups | 6 |
| TC-070 — TC-075 | Unified Attributes | 6 |
| TC-080 — TC-086 | Monitoring & Schedules | 7 |
| TC-090 — TC-100 | Audit Framework & Scripts | 11 |
| TC-101 — TC-107 | Cross-Project Integration | 7 |
| TC-110 — TC-114 | Stakeholder Gates | 5 |
| TC-120 — TC-131 | ADR-001 Architecture & Code Review | 12 |
| **Total** | | **110 test cases** |

---

*RTM Version 1.2 — Updated with ADR-001 findings + AppRiver/Franworth completion backfill (2026-05-12) — Tyler Granlund, IT Director*
