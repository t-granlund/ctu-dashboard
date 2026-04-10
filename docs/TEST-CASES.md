# CTU — Complete Test Cases
**Project:** HTT Brands Cross-Tenant Identity Audit & Remediation  
**Codename:** CTU (Cross-Tenant Utility)  
**QA Owner:** Tyler Granlund, IT Director  
**Version:** 1.0  
**Last Updated:** 2026-04-09  

---

> **Test Execution Notes:**  
> - All tests requiring live Entra ID / Graph API state assume Phase 0 auth is established  
> - Graph API calls target **HTT hub tenant** `0c0e35dc-188a-4eb3-b8ba-61752154b407` unless otherwise noted  
> - Remediation scripts support `-WhatIf` — all WhatIf tests MUST be run before live execution  
> - Per-tenant tests (Teams federation, sync validation) require interactive auth per tenant  
> - Dynamic group membership tests have a **30–45 minute propagation window** — build this into scheduling  
> - Test accounts for negative/boundary tests should be dedicated service accounts  
> - **ALL live remediation tests require Tyler's gate approval before execution**  

---

## Category Key

| Category | Description |
|----------|-------------|
| **DEFAULT-POLICY** | HTT hub default cross-tenant access policy tests |
| **PARTNER-POLICY** | Per-partner (BCC, FN, TLL, DCE) cross-tenant access policy tests |
| **GUEST-B2B** | Guest invitation settings, authorization policy, guest inventory tests |
| **CONDITIONAL-ACCESS** | CA policy MFA enforcement, legacy auth blocking, session controls |
| **TEAMS-FED** | Teams federation mode, allowlist, consumer access tests |
| **ID-GOVERNANCE** | Access reviews, PIM, entitlement management tests |
| **BRAND-GROUPS** | Persistent brand-level dynamic security group tests |
| **ATTRIBUTES** | Unified custom attribute deployment tests |
| **MONITORING** | KQL alert deployment and firing tests |
| **AUDIT-FRAMEWORK** | Script functionality, idempotency, WhatIf, credential safety tests |
| **CROSS-PROJECT** | Non-regression tests across Convention, BI, FAC, SharePoint projects |
| **GATES** | Stakeholder sign-off gate validation tests |

---

## DEFAULT-POLICY Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-001 | DEFAULT-POLICY | HTT hub default cross-tenant access policy exists and is queryable | Phase 0 complete; Graph API token acquired for HTT hub tenant | 1. Run `GET /policies/crossTenantAccessPolicy/default` against HTT hub. 2. Parse response JSON. 3. Verify all expected policy sections present | Response returns HTTP 200 with `b2bCollaborationInbound`, `b2bDirectConnectInbound`, `automaticUserConsentSettings`, and `inboundTrust` sections | CTU-001–005 | P1 | Automated |
| TC-002 | DEFAULT-POLICY | Default B2B Collaboration inbound is blocked (deny-by-default) after remediation | Phase 3 remediation complete for default policy | 1. Run `GET /policies/crossTenantAccessPolicy/default`. 2. Assert `b2bCollaborationInbound.usersAndGroups.accessType`. 3. Assert target is `AllUsers` | `b2bCollaborationInbound.usersAndGroups.accessType = "blocked"` with target `AllUsers` — no unscoped inbound B2B collab | CTU-001 | P1 | Automated |
| TC-003 | DEFAULT-POLICY | Default B2B Direct Connect inbound is blocked after remediation | Phase 3 remediation complete | 1. Run `GET /policies/crossTenantAccessPolicy/default`. 2. Assert `b2bDirectConnectInbound.usersAndGroups.accessType` | `b2bDirectConnectInbound.usersAndGroups.accessType = "blocked"` with target `AllUsers` | CTU-002 | P1 | Automated |
| TC-004 | DEFAULT-POLICY | Default auto-redemption inbound is disabled | Phase 3 remediation complete | 1. Query default policy. 2. Assert `automaticUserConsentSettings.inboundAllowed` | `automaticUserConsentSettings.inboundAllowed = false` — auto-redemption only enabled per-partner | CTU-003 | P2 | Automated |
| TC-005 | DEFAULT-POLICY | Default MFA trust is disabled | Phase 3 remediation complete | 1. Query default policy. 2. Assert `inboundTrust.isMfaAccepted` | `inboundTrust.isMfaAccepted = false` — MFA trust only per-partner | CTU-004 | P2 | Automated |
| TC-006 | DEFAULT-POLICY | Default device compliance trust is disabled | Phase 3 remediation complete | 1. Query default policy. 2. Assert `inboundTrust.isCompliantDeviceAccepted` | `inboundTrust.isCompliantDeviceAccepted = false` | CTU-005 | P3 | Automated |
| TC-007 | DEFAULT-POLICY | `Set-DenyByDefault.ps1 -WhatIf` produces preview report without making changes | Current default policy is open (pre-remediation) | 1. Run `Set-DenyByDefault.ps1 -WhatIf`. 2. Capture output JSON. 3. Re-query default policy. 4. Compare pre/post | WhatIf output shows all intended changes (current → target); re-query confirms zero actual changes applied | CTU-006 | P1 | Automated |
| TC-008 | DEFAULT-POLICY | `Set-DenyByDefault.ps1 -WhatIf` JSON output contains before/after state for every policy setting | Pre-remediation state | 1. Run `-WhatIf`. 2. Parse output JSON. 3. Verify `before` and `after` keys for each setting | JSON contains `b2bCollaborationInbound`, `b2bDirectConnectInbound`, `automaticUserConsentSettings`, `inboundTrust` — each with `before` and `after` values | CTU-006 | P1 | Automated |
| TC-009 | DEFAULT-POLICY | `Set-DenyByDefault.ps1` is idempotent — second run produces no changes | Phase 3 remediation already applied | 1. Run `Set-DenyByDefault.ps1` (live). 2. Capture output. 3. Run again. 4. Capture second output | Second run reports `NO_CHANGE` for all settings; zero Graph API PATCH calls on second execution | CTU-007 | P1 | Automated |

---

## PARTNER-POLICY Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-010 | PARTNER-POLICY | All 4 partner-specific policies exist in HTT hub | Phase 3 partner overrides created | 1. Run `GET /policies/crossTenantAccessPolicy/partners`. 2. Assert 4 entries returned. 3. Match tenant IDs: `b5380912-...` (BCC), `98723287-...` (FN), `3c7d2bf3-...` (TLL), `ce62e17d-...` (DCE) | All 4 partner entries present with correct tenant IDs; no extra unexpected partners | CTU-010 | P1 | Automated |
| TC-011 | PARTNER-POLICY | Each partner policy has a unique tenant ID — no duplicates | Partner policies queryable | 1. Query all partners. 2. Extract tenant IDs. 3. Assert uniqueness | 4 unique tenant IDs; no duplicates; all match config/tenants.json | CTU-010 | P1 | Automated |
| TC-012 | PARTNER-POLICY | BCC partner policy scopes B2B Collab inbound to SharePoint Online + brand security group | BCC partner policy exists | 1. Query BCC partner entry. 2. Assert `b2bCollaborationInbound.applications.targets` contains SharePoint Online app ID. 3. Assert `usersAndGroups.targets` references a specific group ID (not `AllUsers`) | Applications scoped to SPO; users scoped to brand group; neither shows `AllApplications` or `AllUsers` | CTU-011 | P1 | Automated |
| TC-013 | PARTNER-POLICY | FN, TLL, and DCE partner policies also scope to SPO + brand group (same pattern as BCC) | All 4 partner policies configured | 1. Query each of FN, TLL, DCE partner entries. 2. Assert same scoping pattern as TC-012 | All 3 follow BCC pattern: SPO app target + brand group user target | CTU-011 | P1 | Automated |
| TC-014 | PARTNER-POLICY | TLL partner policy is no longer open at All Apps / All Users (GAP-2 remediated) | CTU-012 remediation applied | 1. Query TLL partner entry (`3c7d2bf3-...`). 2. Assert `b2bCollaborationInbound.applications.targets` is NOT `AllApplications`. 3. Assert `usersAndGroups.targets` is NOT `AllUsers` | TLL scoped to specific app + group; matches BCC/FN/DCE pattern — GAP-2 closed | CTU-012 | P1 | Automated |
| TC-015 | PARTNER-POLICY | All 4 partners have auto-redemption enabled bidirectionally | Partner policies configured | 1. Query each partner. 2. Assert `automaticUserConsentSettings.inboundAllowed = true`. 3. Assert `automaticUserConsentSettings.outboundAllowed = true` | All 4 partners show `true/true` for auto-redemption; no manual consent prompts | CTU-013 | P1 | Automated |
| TC-016 | PARTNER-POLICY | All 4 partners trust partner MFA | Partner policies configured | 1. Query each partner. 2. Assert `inboundTrust.isMfaAccepted = true` | All 4 show MFA trust enabled — prevents double-MFA prompts for cross-tenant users | CTU-014 | P1 | Automated |
| TC-017 | PARTNER-POLICY | All 4 partners have identity sync inbound enabled | Partner policies configured | 1. Query each partner. 2. Assert `identitySynchronization.userSyncInbound.isSyncAllowed = true` | All 4 show sync enabled; FN and DCE (previously missing) now configured | CTU-015 | P2 | Automated |
| TC-018 | PARTNER-POLICY | All active sync jobs map `userType` to constant `"Member"` (not `"Guest"`) | Sync jobs running | 1. Query sync job schemas for all active cross-tenant sync configurations. 2. Find `userType` mapping. 3. Assert target value | All sync job schemas show `targetAttributeName = 'userType'` mapped to constant `"Member"` | CTU-016 | P2 | Automated |
| TC-019 | PARTNER-POLICY | B2B Direct Connect inbound scoped to Office365 app only for all partners | Partner policies configured | 1. Query each partner. 2. Assert `b2bDirectConnectInbound.applications.targets` contains only Office365 app ID | No partner has `AllApplications` for Direct Connect; all scoped to O365 only | CTU-017 | P2 | Automated |
| TC-020 | PARTNER-POLICY | Frenchies spoke tenant has auto-redemption configured spoke→hub | FN tenant auth available | 1. Auth to FN tenant (`98723287-...`). 2. Query partner policy for HTT hub. 3. Assert `automaticUserConsentSettings.outboundAllowed = true` | FN spoke-side auto-redemption enabled for HTT direction — previously missing | CTU-018 | P2 | Manual |
| TC-021 | PARTNER-POLICY | Delta Crown spoke tenant has auto-redemption configured spoke→hub | DCE tenant auth available | 1. Auth to DCE tenant (`ce62e17d-...`). 2. Query partner policy for HTT hub. 3. Assert `automaticUserConsentSettings.outboundAllowed = true` | DCE spoke-side auto-redemption enabled — previously missing | CTU-019 | P2 | Manual |

---

## GUEST-B2B Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-022 | GUEST-B2B | Guest invitation restricted to admins and guest inviters | Phase 2 quick wins applied | 1. Run `GET /policies/authorizationPolicy`. 2. Assert `allowInvitesFrom` | `allowInvitesFrom = "adminsAndGuestInviters"` — end users cannot invite guests arbitrarily | CTU-020 | P1 | Automated |
| TC-023 | GUEST-B2B | Guest user role is Restricted Guest User | Phase 2 applied | 1. Query authorization policy. 2. Assert `guestUserRoleId` | `guestUserRoleId = "2af84b1e-32c8-444d-8dfa-801d234f85e3"` (Restricted Guest User) | CTU-021 | P1 | Automated |
| TC-024 | GUEST-B2B | Email-verified self-service join is disabled | Phase 2 applied | 1. Query authorization policy. 2. Assert `allowEmailVerifiedUsersToJoinOrganization` | `allowEmailVerifiedUsersToJoinOrganization = false` | CTU-022 | P2 | Automated |
| TC-025 | GUEST-B2B | Default user app creation rights disabled | Phase 2 applied | 1. Query authorization policy. 2. Assert `defaultUserRolePermissions.allowedToCreateApps` | `allowedToCreateApps = false` | CTU-023 | P2 | Automated |
| TC-026 | GUEST-B2B | Self-service sign-up flows disabled | Phase 2 applied | 1. Run `GET /policies/authenticationFlowsPolicy`. 2. Assert `selfServiceSignUp.isEnabled` | `selfServiceSignUp.isEnabled = false` | CTU-024 | P2 | Automated |
| TC-027 | GUEST-B2B | No guest accounts hold privileged directory roles — initial check | Audit phase | 1. Query members of 8 privileged role templates (Global Admin, Security Admin, SharePoint Admin, Exchange Admin, User Admin, Billing Admin, Application Admin, Privileged Role Admin). 2. For each member, check `userType`. 3. Flag any `Guest` | Zero guest accounts found in any of the 8 privileged roles | CTU-025 | P1 | Automated |
| TC-028 | GUEST-B2B | Privileged guest check covers all 8 critical role templates | Script code review | 1. Review `GuestInventory.psm1` privileged role check function. 2. Verify all 8 role template IDs are queried | Code references all 8 template IDs; no privileged roles omitted from the check | CTU-025 | P1 | Automated |
| TC-029 | GUEST-B2B | Untrusted domain guests are flagged in inventory report | Guest inventory run complete | 1. Run `Invoke-DomainAudit.ps1 -Domain GuestInventory`. 2. Parse `guests_{tenant}.csv`. 3. Check `isTrustedDomain` column for guests not matching `config/tenants.json` trusted domains | All guests from non-trusted domains flagged with `isTrustedDomain = false`; trusted brand domains show `true` | CTU-026 | P2 | Automated |
| TC-030 | GUEST-B2B | Stale guests (>90 days no sign-in) flagged in inventory | Guest inventory with sign-in data | 1. Run guest inventory. 2. Parse CSV. 3. Check `isStale` column for guests with `lastSignInDateTime` > 90 days ago | All guests exceeding 90-day threshold have `isStale = true`; active guests show `false` | CTU-027 | P2 | Automated |
| TC-031 | GUEST-B2B | Stale threshold is configurable via baseline.json | baseline.json contains `staleGuestThresholdDays` | 1. Read `config/baseline.json`. 2. Verify `staleGuestThresholdDays` key exists. 3. Modify to 60 days. 4. Re-run guest inventory. 5. Confirm threshold change reflected | Changing threshold from 90 to 60 flags additional guests; module respects config value | CTU-027 | P2 | Automated |
| TC-032 | GUEST-B2B | Abandoned guests (never signed in + created >90 days) flagged separately | Guest inventory run | 1. Run guest inventory. 2. Parse CSV. 3. Check for guests where `lastSignInDateTime` is null AND `createdDateTime` > 90 days ago | Abandoned guests have `status = "abandoned"`; distinct from stale (which had prior sign-ins) | CTU-028 | P2 | Automated |

---

## CONDITIONAL-ACCESS Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-033 | CONDITIONAL-ACCESS | At least one enabled CA policy requires MFA for external/guest users | CA policies configured | 1. Run `GET /identity/conditionalAccess/policies`. 2. Filter for `state = "enabled"`. 3. Check for policies targeting guest/external users with `grantControls.builtInControls` containing `"mfa"` | At least one qualifying policy found; MFA enforced for external users | CTU-030 | P1 | Automated |
| TC-034 | CONDITIONAL-ACCESS | MFA CA policy targets correct user types (not just "All Users" which would double-hit internals) | MFA CA policy exists | 1. Query the MFA-for-externals policy. 2. Assert `conditions.users.includeGuestsOrExternalUsers` is configured. 3. Verify it does NOT use `includeUsers: ["All"]` without exclusions | Policy specifically targets guest/external user types; not an overly broad "All Users" rule | CTU-030 | P1 | Automated |
| TC-035 | CONDITIONAL-ACCESS | "B2B External Franchisee Access" CA policy is enforced (not report-only) | Policy exists from GAP-3 finding | 1. Query the specific policy by display name or ID. 2. Assert `state` | `state = "enabled"` (not `"enabledForReportingButNotEnforced"`) — GAP-3 resolved | CTU-031 | P1 | Automated |
| TC-036 | CONDITIONAL-ACCESS | MFA CA policy covers all 3 external user types | MFA CA policy configured | 1. Query policy. 2. Assert `conditions.users.includeGuestsOrExternalUsers.guestOrExternalUserTypes` | Types include: `b2bCollaborationGuest`, `b2bCollaborationMember`, `b2bDirectConnectUser` — all 3 present | CTU-032 | P1 | Automated |
| TC-037 | CONDITIONAL-ACCESS | Legacy authentication blocked for external users | CA policy for legacy auth block exists | 1. Query CA policies for block grants targeting `exchangeActiveSync` and `other` client app types. 2. Verify targets external users | Policy with `grantControls.builtInControls = "block"` found covering `clientAppTypes` including `"exchangeActiveSync"` and `"other"` for external users | CTU-033 | P2 | Automated |
| TC-038 | CONDITIONAL-ACCESS | Sign-in frequency ≤24 hours enforced for external users | Session control CA policy exists | 1. Query CA policies with session controls. 2. Find policy targeting external users. 3. Assert `sessionControls.signInFrequency` | `signInFrequency.isEnabled = true` and `value ≤ 24` (hours) for external user scope | CTU-034 | P2 | Automated |
| TC-039 | CONDITIONAL-ACCESS | New CA policies deployed in report-only mode first (process verification) | Policy deployment logs available | 1. Review CA policy change log / audit trail. 2. For each new or modified policy, verify it was in `enabledForReportingButNotEnforced` state for ≥7 days before switching to `enabled` | Audit trail confirms report-only period ≥7 days for each policy before enforcement | CTU-035 | P2 | Manual |

---

## TEAMS-FED Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-040 | TEAMS-FED | HTT hub Teams federation is in AllowList mode | Phase 3 Teams hardening complete | 1. Run `Get-CsTenantFederationConfiguration` against HTT hub. 2. Assert `AllowedDomains` is a typed list (not `AllowAllKnownDomains`) | `AllowedDomains` returns a domain list object; `AllowFederatedUsers = $true`; not open federation | CTU-040 | P1 | Automated |
| TC-041 | TEAMS-FED | Federation is NOT set to AllowAllKnownDomains (explicit negative check) | HTT hub auth | 1. Run `Get-CsTenantFederationConfiguration`. 2. Assert `AllowedDomains.AllowAllKnownDomains` is NOT present or is `$false` | Open federation mode is NOT active; only explicit allowlist entries permitted | CTU-040 | P1 | Automated |
| TC-042 | TEAMS-FED | Allowlist contains all 5 HTT brand domains and nothing else | Phase 3 complete | 1. Run `Get-CsTenantFederationConfiguration`. 2. Extract `AllowedDomains` list. 3. Assert exactly 5 entries: `httbrands.com`, `bishopsbs.com`, `thelashlounge.com`, `frenchiesnails.com`, `deltacrown.com` | All 5 domains present; zero unexpected extra domains in the list | CTU-041 | P1 | Automated |
| TC-043 | TEAMS-FED | Teams consumer access is disabled | Phase 3 complete | 1. Run `Get-CsTenantFederationConfiguration`. 2. Assert `AllowTeamsConsumer` | `AllowTeamsConsumer = $false` — no consumer (personal) Teams federation | CTU-042 | P2 | Automated |
| TC-044 | TEAMS-FED | External access with trial tenants is blocked | Phase 3 complete | 1. Run `Get-CsTenantFederationConfiguration`. 2. Assert `ExternalAccessWithTrialTenants` | `ExternalAccessWithTrialTenants = "Blocked"` | CTU-043 | P2 | Automated |
| TC-045 | TEAMS-FED | All 5 tenants have Teams federation allowlist applied (not just HTT hub) | Per-tenant auth for all 5 tenants | 1. Auth to each of 5 tenants in sequence. 2. Run `Get-CsTenantFederationConfiguration` on each. 3. Assert AllowList mode with 5 domains on each | All 5 tenants in AllowList mode; all 5 contain the same domain set | CTU-044 | P2 | Manual |

---

## ID-GOVERNANCE Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-050 | ID-GOVERNANCE | Quarterly access review definition exists for guest users | Phase 4 governance deployed | 1. Run `GET /identityGovernance/accessReviews/definitions`. 2. Filter for definitions scoped to guest users. 3. Assert recurrence | At least one definition with `scope` targeting guest users and `recurrence.pattern.type` = quarterly (or interval equivalent) | CTU-050 | P1 | Automated |
| TC-051 | ID-GOVERNANCE | Access review scopes to all M365 groups (not a subset) | Access review definition exists | 1. Query the review definition. 2. Check `instanceEnumerationScope` or `scope`. 3. Verify it covers all M365 groups or uses `allM365Groups` scope | Review covers all M365 groups in tenant; not limited to specific group IDs | CTU-050 | P1 | Automated |
| TC-052 | ID-GOVERNANCE | Access review auto-apply with default Deny | Review definition exists | 1. Query review definition settings. 2. Assert `autoApplyDecisionsEnabled` and `defaultDecision` | `autoApplyDecisionsEnabled = true`; `defaultDecision = "Deny"` — unreviewed guests auto-removed | CTU-051 | P2 | Automated |
| TC-053 | ID-GOVERNANCE | Permanent GA role assignments limited to ≤2 break-glass accounts | PIM configured | 1. Query `GET /roleManagement/directory/roleAssignmentScheduleInstances`. 2. Filter for Global Admin role template. 3. Count permanent (not time-limited) assignments | Count ≤ 2 permanent GA assignments; all others are PIM-eligible only | CTU-052 | P1 | Automated |
| TC-054 | ID-GOVERNANCE | All other privileged roles have zero permanent assignments (all PIM-eligible) | PIM configured | 1. Query role assignment schedule instances for Security Admin, SharePoint Admin, Exchange Admin, User Admin, etc. 2. Count permanent assignments per role | Zero permanent assignments for non-GA privileged roles; all are eligible-only | CTU-052 | P1 | Automated |
| TC-055 | ID-GOVERNANCE | PIM activation requires MFA and justification | PIM role settings configured | 1. Query PIM role settings for each privileged role. 2. Check `activationRules` for MFA requirement. 3. Check for justification requirement | All privileged roles require both MFA and written justification for activation | CTU-053 | P2 | Automated |
| TC-056 | ID-GOVERNANCE | PIM activation duration does not exceed 8 hours | PIM configured | 1. Query PIM eligible role assignment policies. 2. Check `maximumGrantPeriodInMinutes` or equivalent | Maximum activation ≤ 480 minutes (8 hours) for all privileged roles | CTU-054 | P2 | Automated |
| TC-057 | ID-GOVERNANCE | At least one entitlement management access package exists for cross-tenant access | Phase 4 complete | 1. Run `GET /identityGovernance/entitlementManagement/accessPackages`. 2. Count results | At least 1 access package returned; package has catalog, policies, and resource roles defined | CTU-055 | P2 | Automated |
| TC-058 | ID-GOVERNANCE | Connected organizations limited to HTT MTO partner tenants | Entitlement management configured | 1. Run `GET /identityGovernance/entitlementManagement/connectedOrganizations`. 2. Extract `identitySources.tenantId` from each. 3. Compare against known brand tenant IDs | All connected org tenant IDs match one of: BCC `b5380912-...`, FN `98723287-...`, TLL `3c7d2bf3-...`, DCE `ce62e17d-...`; no unknown tenants | CTU-056 | P2 | Automated |

---

## BRAND-GROUPS Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-060 | BRAND-GROUPS | All 5 persistent brand groups exist in HTT tenant | Phase 3 brand group creation complete | 1. Query `GET /groups?$filter=mailNickname eq 'SG-Brand-HTT-Dynamic'` (repeat for all 5). 2. Assert each returns exactly 1 group | 5 groups found: SG-Brand-HTT-Dynamic, SG-Brand-BCC-Dynamic, SG-Brand-FN-Dynamic, SG-Brand-TLL-Dynamic, SG-Brand-DCE-Dynamic | CTU-060 | P1 | Automated |
| TC-061 | BRAND-GROUPS | All 5 brand groups are dynamic membership with processing enabled | Groups exist | 1. Query each group. 2. Assert `groupTypes` contains `"DynamicMembership"`. 3. Assert `membershipRuleProcessingState = "On"` | All 5 pass both assertions; membership is auto-evaluated | CTU-060 | P1 | Automated |
| TC-062 | BRAND-GROUPS | Each brand group has correct domain-based membership rule | Groups exist | 1. Query each brand group. 2. Assert `membershipRule` matches expected domain pattern. Example for BCC: `(user.mail -contains "@bishops.co") -or (user.mail -contains "@bishops.com") -or (user.mail -contains "@bishopsbs.onmicrosoft.com")` | Each group's rule references all known email domains for that brand; no cross-brand domains in any rule | CTU-061 | P1 | Automated |
| TC-063 | BRAND-GROUPS | Post-Homecoming 2026 convention groups evaluated for sunset | After April 28 2026 event | 1. Query for convention groups `SG-Homecoming2026-Visitors-*`. 2. Document current member counts. 3. Verify persistent brand groups have ≥ same coverage | Convention groups either deleted, or documented transition plan exists; no duplicate brand coverage | CTU-062 | P2 | Manual |
| TC-064 | BRAND-GROUPS | TLL-Franchisee-Dynamic group consolidation evaluated | Brand groups and BI pipeline operational | 1. Query both `TLL-Franchisee-Dynamic` and `SG-Brand-TLL-Dynamic` in HTT tenant. 2. Compare member lists. 3. Check Fabric workspace binding | Either TLL-Franchisee-Dynamic retired with Fabric updated to SG-Brand-TLL-Dynamic, OR justification documented for maintaining both | CTU-063 | P2 | Manual |
| TC-065 | BRAND-GROUPS | Persistent brand groups used in per-partner B2B Collab policy scoping | Partner policies and brand groups both configured | 1. Query each partner policy `b2bCollaborationInbound.usersAndGroups.targets`. 2. Extract group IDs. 3. Match against persistent brand group IDs | Each partner policy references its corresponding brand group ID (not a convention-specific or ad-hoc group) | CTU-064 | P2 | Automated |

---

## ATTRIBUTES Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-070 | ATTRIBUTES | `htt_role` and `htt_brand` extension attributes exist in HTT hub tenant | Phase 3 attribute deployment to HTT | 1. Query `GET /applications/{id}/extensionProperties` on HTT hub tenant. 2. Check for `*_htt_role` and `*_htt_brand` | Both attributes present with `dataType: String` and `targetObjects: ["User"]` | CTU-070 | P2 | Automated |
| TC-071 | ATTRIBUTES | Attributes in HTT hub follow same naming convention as TLL tenant | Both tenants queryable | 1. Query HTT hub extension properties. 2. Query TLL extension properties. 3. Compare naming patterns | Both use `extension_{appId}_htt_role` and `extension_{appId}_htt_brand` pattern (app IDs differ per tenant, attribute base names match) | CTU-070 | P2 | Automated |
| TC-072 | ATTRIBUTES | HTT corporate accounts have correct attribute values set | Attributes deployed and populated | 1. Query HTT corporate user accounts. 2. Assert `htt_role = "corporate"` and `htt_brand = "htt"` for each | 100% of targeted corporate accounts have correct values; count matches expected headcount | CTU-071 | P2 | Automated |
| TC-073 | ATTRIBUTES | No duplicate or conflicting attribute names across tenants | Attribute discovery run on all tenants | 1. Run attribute discovery against each of 5 tenants. 2. Collect all `htt_*` extension attribute names. 3. Assert each resolves to exactly one app registration per tenant | Zero naming collisions; each tenant's attributes trace to a single app registration | CTU-072 | P1 | Automated |
| TC-074 | ATTRIBUTES | Existing FAC extension attributes in TLL tenant are unchanged post-CTU | Pre-CTU snapshot of TLL attributes available | 1. Snapshot TLL tenant extension properties before CTU deployment. 2. After CTU deployment, re-query. 3. Diff the two snapshots for Wiggum-FAC-Extensions app `037c2451-...` | Zero changes to FAC attributes; same count, names, types, and app registration binding | CTU-073 | P1 | Automated |
| TC-075 | ATTRIBUTES | Future BCC/FN tenant attribute deployment follows discovery → plan → dry-run → gate → live pattern | Deployment initiated for BCC or FN | 1. Verify `attribute-mapping-plan.json` produced for target tenant. 2. Verify `--dry-run` output reviewed. 3. Verify gate approval documented before live execution | All 4 steps documented in deployment log; no attribute written without prior dry-run + approval | CTU-074 | P2 | Manual |

---

## MONITORING Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-080 | MONITORING | All 6 KQL alert rules are deployed and active in Azure Monitor | Phase 5 monitoring deployed | 1. Query Azure Monitor alert rules. 2. Assert 6 rules exist: CrossTenantPolicyChanges, NewGuestAccounts, GuestsAddedToPrivilegedRoles, IdentitySyncFailures, ConditionalAccessChanges, TeamsFederationChanges. 3. Assert each is enabled | All 6 alert rules present and `isEnabled = true` | CTU-080 | P2 | Automated |
| TC-081 | MONITORING | Each alert rule references valid Log Analytics workspace | Alert rules exist | 1. For each alert rule, verify `dataSource` or `scopes` references a valid Log Analytics workspace ID. 2. Verify workspace ingests Azure AD logs | All 6 rules connected to active workspace; no orphaned or misconfigured data sources | CTU-080 | P2 | Automated |
| TC-082 | MONITORING | CrossTenantPolicyChanges alert fires within 15 minutes of policy modification | Alert deployed; test policy change possible | 1. Make a minor test modification to a non-production partner policy setting. 2. Monitor Azure Monitor for alert firing. 3. Check within 15-minute window | Alert fires with actor UPN, target policy, and change details in alert payload | CTU-081 | P2 | Manual |
| TC-083 | MONITORING | GuestsAddedToPrivilegedRoles alert fires on guest role assignment | Alert deployed; test guest + test role | 1. Assign a test guest account to a non-production privileged role (or use report-only monitoring). 2. Monitor for alert. 3. Verify payload | Alert fires within 15 minutes; payload includes guest UPN, role name, and assigner | CTU-082 | P1 | Manual |
| TC-084 | MONITORING | Weekly guest spot-check scheduled and producing output | Phase 5 schedule active | 1. Check automation schedule for `Invoke-DomainAudit.ps1 -Domain GuestInventory`. 2. Verify last run produced output CSV. 3. Verify schedule recurrence = weekly | Weekly schedule active; last run produced `guests_{tenant}.csv` for all 5 tenants | CTU-083 | P2 | Manual |
| TC-085 | MONITORING | Monthly full guest inventory runs with stale detection | Phase 5 schedule active | 1. Check monthly automation run. 2. Verify output CSVs include `isStale` and `status` columns. 3. Verify all 5 tenants covered | Monthly CSV output exists for all 5 tenants; stale and abandoned flags populated | CTU-084 | P2 | Manual |
| TC-086 | MONITORING | Quarterly full 7-domain audit produces AUDIT-SUMMARY.md | Phase 5 quarterly schedule active | 1. Check quarterly run log. 2. Verify `AUDIT-SUMMARY.md` produced. 3. Compare findings against previous quarter's summary | Summary document produced; findings tracked with severity; delta from prior quarter noted | CTU-085 | P2 | Manual |

---

## AUDIT-FRAMEWORK Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-090 | AUDIT-FRAMEWORK | `Invoke-FullAudit.ps1` completes all 7 domains without manual intervention | Phase 0 auth complete; modules installed | 1. Run `Invoke-FullAudit.ps1 -TenantId $HTT_TENANT_ID`. 2. Monitor console for domain completion messages. 3. Verify output directory created | Script completes all 7 domains: CrossTenantSync, B2BCollaboration, B2BDirectConnect, GuestInventory, ConditionalAccess, TeamsFederation, IdentityGovernance; `reports/{AuditName}_{timestamp}/` directory created | CTU-090 | P1 | Automated |
| TC-091 | AUDIT-FRAMEWORK | Full audit produces 3 required output files | Audit run complete | 1. Check `reports/{AuditName}_{timestamp}/` directory. 2. Assert presence of `AUDIT-SUMMARY.md`, `findings.csv`, and `audit-results.json` | All 3 files present; AUDIT-SUMMARY.md is human-readable; findings.csv has headers; audit-results.json is valid JSON | CTU-090 | P1 | Automated |
| TC-092 | AUDIT-FRAMEWORK | Audit is read-only — zero writes to Graph API | Audit running with network logging | 1. Run audit with verbose logging or network trace. 2. Filter HTTP methods in log. 3. Assert only GET requests | Zero POST, PATCH, PUT, or DELETE calls in trace; all interactions are read-only | CTU-091 | P1 | Automated |
| TC-093 | AUDIT-FRAMEWORK | `Test-Configuration.ps1` validates all configs and modules | Prerequisites installed | 1. Run `Test-Configuration.ps1`. 2. Capture exit code. 3. Review output | Exit code 0; output confirms: 8 modules loaded, 3 config files (baseline.json, tenants.json, permissions.json) valid, all exported functions available | CTU-092 | P1 | Automated |
| TC-094 | AUDIT-FRAMEWORK | Audit findings have severity levels assigned | Audit run complete | 1. Open `AUDIT-SUMMARY.md`. 2. Check each finding for severity label. 3. Cross-reference with `findings.csv` severity column | Every finding has severity: Critical, High, Medium, Low, or Info; grouped by severity in summary | CTU-093 | P2 | Automated |
| TC-095 | AUDIT-FRAMEWORK | Single tenant auth failure does not abort multi-tenant audit | 5-tenant audit run; one tenant deliberately misconfigured | 1. Invalidate auth token for one tenant (e.g., FN). 2. Run `Invoke-FullAudit.ps1` against all 5 tenants. 3. Check output | Reports produced for 4 healthy tenants; FN shows error details; script exits with partial-success code (not crash) | CTU-094 | P2 | Automated |
| TC-096 | AUDIT-FRAMEWORK | `Set-DenyByDefault.ps1 -WhatIf` produces preview without writes | Pre-remediation state | 1. Run with `-WhatIf`. 2. Verify JSON preview output. 3. Re-query policy to confirm no changes | Preview JSON produced; policy unchanged after WhatIf run | CTU-095 | P1 | Automated |
| TC-097 | AUDIT-FRAMEWORK | `Fix-SyncUserTypeMapping.ps1 -WhatIf` and `Set-TeamsFederationAllowlist.ps1 -WhatIf` both produce previews | Scripts available | 1. Run each with `-WhatIf`. 2. Verify preview output. 3. Confirm no writes | Both scripts produce structured preview; zero API modifications | CTU-095 | P1 | Automated |
| TC-098 | AUDIT-FRAMEWORK | Zero hardcoded secrets in any script file | All scripts committed | 1. Run `grep -rn "CLIENT_SECRET\s*=" scripts/ --include="*.ps1" --include="*.py"`. 2. Run `grep -rn "password\s*=" scripts/`. 3. Check for hardcoded tenant IDs used for auth (not validation) | Zero literal credential values; all auth uses `$env:CLIENT_SECRET`, `$env:TENANT_ID`, or `.env` loading; tenant IDs in validation constants are acceptable | CTU-096 | P1 | Automated |
| TC-099 | AUDIT-FRAMEWORK | Remediation scripts produce timestamped JSON audit trail | Any remediation script run (live or WhatIf) | 1. Run remediation script. 2. Check `reports/` directory for new JSON file. 3. Parse JSON | JSON file present with `timestamp`, `scriptName`, `mode` (live/whatif), and per-setting `before`/`after` entries | CTU-097 | P2 | Automated |
| TC-100 | AUDIT-FRAMEWORK | `Install-Prerequisites.ps1` installs required PowerShell modules | Clean environment | 1. Run `Install-Prerequisites.ps1`. 2. Check exit code. 3. Verify `Microsoft.Graph` and `MicrosoftTeams` modules available | Exit code 0; both modules importable via `Import-Module`; version meets minimum requirements | CTU-098 | P2 | Automated |

---

## CROSS-PROJECT Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-101 | CROSS-PROJECT | Deny-by-default does NOT break Homecoming 2026 convention site access | Phase 3 default policy hardened; Homecoming site live | 1. Run `verify-access-chain.ps1` from Convention-Page-Build project. 2. Verify all 6 SP Visitors group bindings active. 3. Spot-test 1 user per brand accessing convention SP site | All 6 group bindings intact; spot-test users can access convention site; zero access failures from policy change | CTU-100 | P1 | Automated |
| TC-102 | CROSS-PROJECT | Convention site users (327 across 5 tenants) maintain access post-hardening | Hardening applied; user inventory available | 1. Sample 5 users (1 per brand) from convention user list. 2. Verify each can authenticate to HTT hub via B2B. 3. Verify SP site access | All 5 sample users successfully access convention site; auto-redemption works seamlessly | CTU-100 | P1 | Manual |
| TC-103 | CROSS-PROJECT | BI/Fabric franchise access pipeline unaffected by policy hardening | Phase 3 hardened; BI pipeline active | 1. Run `check-onboarding-status.py` from bi-support-agent project. 2. Verify TLL→HTT B2B sync operational. 3. Verify `TLL-Franchisee-Dynamic` member count unchanged. 4. Verify Fabric workspace access for sample TLL user | Sync healthy; member count matches pre-hardening baseline; Fabric access works | CTU-101 | P1 | Automated |
| TC-104 | CROSS-PROJECT | FAC dynamic groups in TLL tenant unaffected by HTT hub policy changes | Phase 3 hardened; FAC groups deployed | 1. Run `03-validate-groups.py` from FAC-Cohort-Dev project against TLL tenant. 2. Verify all 8 FAC groups exist with correct rules and member counts | All 8 FAC groups pass validation; member counts match expected; CTU changes to HTT hub have zero impact on TLL-internal groups | CTU-102 | P1 | Automated |
| TC-105 | CROSS-PROJECT | TLL partner policy scoping includes Fabric/Power BI access | TLL partner policy scoped (CTU-012 remediated) | 1. Query TLL partner policy application targets. 2. Verify SharePoint Online AND Power BI Service (or required Fabric apps) are included. 3. Have BI team confirm Fabric access unaffected | TLL partner policy allows necessary Fabric/BI applications; BI team confirms zero access disruption | CTU-103 | P1 | Manual |
| TC-106 | CROSS-PROJECT | SharePoint HQ permission redesign blocked until brand groups exist | Brand groups not yet created (or recently created) | 1. Verify no SP HQ permission changes have been made without brand groups in place. 2. Cross-reference sharepointagent project timeline against brand group deployment | Either brand groups exist and SP changes follow, OR no SP permission changes made prematurely | CTU-104 | P2 | Manual |
| TC-107 | CROSS-PROJECT | Convention groups not deleted before persistent brand groups operational | Post-Homecoming 2026 | 1. Verify persistent brand groups exist and SP Visitors bindings migrated. 2. Only then verify convention groups deleted or scheduled for deletion | Transition sequence confirmed: create brand groups → bind to SP → validate → unbind convention groups → delete; no premature deletion | CTU-105 | P1 | Manual |

---

## GATES Tests

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-110 | GATES | Gate G1 (audit findings review) signed off before remediation starts | Audit complete; AUDIT-SUMMARY.md produced | 1. Verify AUDIT-SUMMARY.md reviewed by Tyler + Dustin. 2. Check for documented approval with date. 3. Confirm no Phase 2 remediation scripts run before sign-off date | Sign-off documented; Phase 2 script executions all post-date the G1 approval | CTU-110 | P1 | Manual |
| TC-111 | GATES | Gate G2 (deny-by-default WhatIf) signed off before live policy changes | WhatIf output produced | 1. Verify `-WhatIf` output from `Set-DenyByDefault.ps1` reviewed by Tyler. 2. Check for documented approval. 3. Confirm live execution post-dates approval | Tyler's approval documented; live `Set-DenyByDefault.ps1` run timestamp is after G2 sign-off | CTU-111 | P1 | Manual |
| TC-112 | GATES | Gate G3 (per-partner overrides) signed off per tenant | Partner override WhatIf outputs produced | 1. Verify all 4 partner policy WhatIf outputs reviewed. 2. Check for per-tenant documented approval from Tyler. 3. Verify each partner's live change post-dates its approval | 4 separate approvals documented (BCC, FN, TLL, DCE); each live change follows its approval | CTU-112 | P1 | Manual |
| TC-113 | GATES | Gate G5 (E2E validation post-hardening) confirms zero regression | Phase 3 hardening complete; cross-project scripts available | 1. Run all cross-project validation scripts (Convention verify-access-chain, BI check-onboarding, FAC validate-groups). 2. All pass. 3. Tyler signs off E2E | All validation scripts pass; Tyler signs E2E gate with date; Phase 4 work begins only after | CTU-113 | P1 | Manual |
| TC-114 | GATES | Phase 3 hardening piloted on Delta Crown first | DCE is lowest-impact tenant | 1. Verify DCE partner policy hardened and validated before BCC/FN/TLL. 2. Check execution timestamps. 3. Verify DCE validation passed before other tenants modified | DCE hardened first; validation passed; other tenants modified only after DCE success confirmed | CTU-114 | P2 | Manual |

---

## Test Execution Summary

| Category | Total TCs | P1 | P2 | P3 | Automated | Manual |
|----------|-----------|-----|-----|-----|-----------|--------|
| DEFAULT-POLICY | 9 | 6 | 2 | 1 | 9 | 0 |
| PARTNER-POLICY | 12 | 6 | 6 | 0 | 10 | 2 |
| GUEST-B2B | 11 | 3 | 8 | 0 | 11 | 0 |
| CONDITIONAL-ACCESS | 7 | 4 | 2 | 0 | 6 | 1 |
| TEAMS-FED | 6 | 3 | 3 | 0 | 5 | 1 |
| ID-GOVERNANCE | 9 | 3 | 6 | 0 | 9 | 0 |
| BRAND-GROUPS | 6 | 3 | 3 | 0 | 4 | 2 |
| ATTRIBUTES | 6 | 2 | 4 | 0 | 5 | 1 |
| MONITORING | 7 | 1 | 6 | 0 | 2 | 5 |
| AUDIT-FRAMEWORK | 11 | 5 | 6 | 0 | 10 | 1 |
| CROSS-PROJECT | 7 | 5 | 2 | 0 | 3 | 4 |
| GATES | 5 | 4 | 1 | 0 | 0 | 5 |
| **TOTAL** | **96** | **45** | **49** | **1** | **74** | **22** |

**Automation Rate: 77%** (target: >75% — PASS)  
**P1 Test Coverage: 45 critical tests** covering deny-by-default, partner scoping, MFA, privileged guests, cross-project non-regression, audit read-only, and stakeholder gates  
**Manual Tests: 22** — concentrated in monitoring validation, cross-project E2E, spoke-side configs, and gate sign-offs (require human judgment or per-tenant interactive auth)  

---

## ADR-001 ARCHITECTURE & CODE REVIEW Tests

> **Source:** These test cases address common hub-and-spoke cross-tenant failure modes identified by ADR-001. They cover execution sequencing, rollback safety, sync re-provisioning, spoke-side policies, credential handling, and emergency access — the areas where enterprises most commonly make mistakes in multi-tenant M365 deployments.

| TC ID | Category | Description | Preconditions | Test Steps | Expected Result | Linked REQs | Priority | Automation |
|-------|----------|-------------|---------------|------------|-----------------|-------------|----------|------------|
| TC-120 | SEQUENCING | Partner overrides confirmed active BEFORE default deny is applied | `Set-DenyByDefault.ps1` ready to run | 1. Run `Set-DenyByDefault.ps1 -WhatIf`. 2. Review execution log order. 3. Verify partner override creation/verification steps appear BEFORE default deny PATCH. 4. Intentionally simulate partner override failure (disconnect mid-script). 5. Verify default deny was NOT applied when partner setup failed | Execution log shows: partner overrides verified → default deny applied (in that order). When partner override fails, default deny is NOT applied; script exits with error | CTU-120 | P1 | Automated |
| TC-121 | SNAPSHOT | Policy snapshot saved before remediation | Pre-remediation state; `reports/snapshots/` directory exists | 1. Run any remediation script (e.g., `Set-DenyByDefault.ps1`). 2. Check `reports/snapshots/` for new JSON file. 3. Parse JSON. 4. Verify it contains complete default policy + all partner policies | Snapshot file `{timestamp}_pre-remediation.json` exists; contains `defaultPolicy`, `partnerPolicies` (array of 4), `capturedAt` timestamp; all are valid JSON matching current Graph API state | CTU-121 | P1 | Automated |
| TC-122 | ROLLBACK | `Restore-CTUPolicySnapshot.ps1` successfully reverts deny-by-default | Deny-by-default has been applied; snapshot from pre-hardening exists | 1. Run `Restore-CTUPolicySnapshot.ps1 -SnapshotPath reports/snapshots/{file}.json -WhatIf`. 2. Review preview. 3. Run live. 4. Query default policy. 5. Query all partner policies | Default policy reverts to pre-hardening state (AllApplications/AllUsers allowed); all partner policies match snapshot; full restoration completed within 5 minutes | CTU-122 | P1 | Automated |
| TC-123 | SYNC | Zero synced partner users retain `userType = Guest` after full re-provision | `Fix-SyncUserTypeMapping.ps1` has been run; sync jobs restarted | 1. Trigger full sync cycle (restart provisioning, not incremental). 2. Wait for sync cycle to complete (up to 40 minutes for large tenants). 3. Query all synced users across all tenants. 4. Filter for `userType = Guest` AND `creationType = Invitation` (B2B sync pattern) | Count of synced partner users with `userType = Guest` = 0; all now show `userType = Member` | CTU-123 | P1 | Automated |
| TC-124 | SPOKE-SIDE | Each spoke tenant has partner override for HTT hub before spoke-side default deny | Per-tenant auth available for all 4 spoke tenants | 1. Auth to BCC tenant. 2. Query `GET /policies/crossTenantAccessPolicy/partners`. 3. Assert entry for HTT hub (`0c0e35dc-...`) exists with outbound B2B collab allowed. 4. Repeat for FN, TLL, DCE | All 4 spoke tenants have a partner policy entry for HTT hub with `b2bCollaborationOutbound.usersAndGroups.accessType = "allowed"` | CTU-124 | P1 | Manual |
| TC-125 | SCOPING | Partner overrides reference specific application IDs (not AllApplications) | Brand groups (CTU-060) exist; `baseline.json` updated with scoped app IDs | 1. Read `baseline.json`. 2. Assert `crossTenantPartnerOverrides.b2bCollaborationInbound.applications.targets` contains specific app IDs (SPO `00000003-0000-0ff1-ce00-000000000000`, Power BI `00000009-...`). 3. Assert no `AllApplications` target | Config references specific application IDs; `AllApplications` not present in partner override section | CTU-125 | P1 | Automated |
| TC-126 | SECURITY | `ClientSecret` parameter produces deprecation warning | Scripts with `-ClientSecret` parameter available | 1. Run `Invoke-FullAudit.ps1 -AuthMode AppOnly -ClientId "test" -ClientSecret "test-value"`. 2. Check console output for deprecation warning. 3. Run with `-CertificateThumbprint` instead. 4. Verify cert-based auth works | Warning message: "ClientSecret parameter is deprecated. Use CertificateThumbprint for production."; cert-based auth succeeds without warning | CTU-126 | P2 | Automated |
| TC-127 | AUDIT-TRAIL | Remediation WhatIf output contains before AND after state | Pre-remediation state; script ready | 1. Run `Set-DenyByDefault.ps1 -WhatIf`. 2. Parse output JSON. 3. Verify each policy section has `before` key (current state from Graph API) and `after` key (target state). 4. Verify `before` values match current live policy | JSON contains `before` and `after` for: `b2bCollaborationInbound`, `b2bDirectConnectInbound`, `automaticUserConsentSettings`, `inboundTrust`; `before` values match live query | CTU-127 | P1 | Automated |
| TC-128 | MTO | MTO membership evaluated for FN, TLL, DCE | Phase 4 governance; MTO evaluation document produced | 1. Run `Get-MgBetaTenantRelationshipMultiTenantOrganization` from HTT hub. 2. Check `tenants` array. 3. Verify BCC is member. 4. Check for FN, TLL, DCE membership or documented justification | BCC confirmed as MTO member; FN, TLL, DCE either show as members or have documented evaluation with decision rationale | CTU-128 | P2 | Manual |
| TC-129 | EMERGENCY | Emergency access procedure tested in tabletop exercise | Emergency access document exists; break-glass account available | 1. Simulate scenario: deny-by-default applied, all partner overrides accidentally deleted. 2. Follow emergency procedure document step-by-step. 3. Time the recovery. 4. Verify policy reverted | Admin successfully reverts default policy to allow-all within 15 minutes using only the documented procedure; no dependency on cross-tenant B2B access for the recovery | CTU-129 | P1 | Manual |
| TC-130 | TOKEN | Full audit of TLL tenant completes without token expiry | TLL tenant auth; all 7 domains enabled | 1. Run `Invoke-FullAudit.ps1 -TenantKeys TLL` (TLL is largest tenant, 140 locations). 2. Monitor for token expiry errors. 3. Verify all 7 domain audits complete | Zero `401 Unauthorized` or token expiry errors during audit; all 7 domains produce findings | CODE-08 | P2 | Automated |
| TC-131 | IDEMPOTENCY | WhatIf produces complete output with zero API writes (verified via before-state comparison) | Pre-remediation state | 1. Query current default policy (save as reference). 2. Run `Set-DenyByDefault.ps1 -WhatIf`. 3. Query default policy again. 4. Diff reference vs post-WhatIf query | Zero differences between pre-WhatIf and post-WhatIf policy state; WhatIf output JSON is valid and contains both states | CTU-127 | P1 | Automated |

---

## Updated Test Execution Summary

| Category | Total TCs | P1 | P2 | P3 | Automated | Manual |
|----------|-----------|-----|-----|-----|-----------|--------|
| DEFAULT-POLICY | 9 | 6 | 2 | 1 | 9 | 0 |
| PARTNER-POLICY | 12 | 6 | 6 | 0 | 10 | 2 |
| GUEST-B2B | 11 | 3 | 8 | 0 | 11 | 0 |
| CONDITIONAL-ACCESS | 7 | 4 | 2 | 0 | 6 | 1 |
| TEAMS-FED | 6 | 3 | 3 | 0 | 5 | 1 |
| ID-GOVERNANCE | 9 | 3 | 6 | 0 | 9 | 0 |
| BRAND-GROUPS | 6 | 3 | 3 | 0 | 4 | 2 |
| ATTRIBUTES | 6 | 2 | 4 | 0 | 5 | 1 |
| MONITORING | 7 | 1 | 6 | 0 | 2 | 5 |
| AUDIT-FRAMEWORK | 11 | 5 | 6 | 0 | 10 | 1 |
| CROSS-PROJECT | 7 | 5 | 2 | 0 | 3 | 4 |
| GATES | 5 | 4 | 1 | 0 | 0 | 5 |
| **ADR-001** | **12** | **8** | **4** | **0** | **8** | **4** |
| **TOTAL** | **108** | **53** | **53** | **1** | **82** | **26** |

**Automation Rate: 76%** (target: >75% — PASS)  
**P1 Test Coverage: 53 critical tests** (+8 from ADR-001 findings covering sequencing, rollback, sync, emergency access)  

---

## Test Execution Prerequisites

| Prerequisite | Required For | How to Verify |
|-------------|-------------|---------------|
| Phase 0 auth to HTT hub | All automated tests | `Test-Configuration.ps1` exits code 0 |
| Per-tenant interactive auth (5 tenants) | TC-020, TC-021, TC-045, TC-124, TC-128 | `Connect-MicrosoftTeams` succeeds per tenant |
| Convention-Page-Build `verify-access-chain.ps1` | TC-101 | Script exists and is executable |
| bi-support-agent `check-onboarding-status.py` | TC-103 | Script exists; Python deps installed |
| FAC-Cohort-Dev `03-validate-groups.py` | TC-104 | Script exists; auth to TLL tenant working |
| Azure Monitor workspace with AAD logs | TC-080–086 | Log Analytics workspace ID in config |
| Test guest account for negative tests | TC-027, TC-083 | Dedicated test guest provisioned |
| Pre-CTU TLL attribute snapshot | TC-074 | Snapshot JSON saved before CTU begins |
| `Restore-CTUPolicySnapshot.ps1` script | TC-122 | Script exists and is executable |
| `Save-CTUPolicySnapshot.ps1` script | TC-121 | Script exists; creates valid JSON snapshots |
| Emergency access procedure document | TC-129 | Document exists in `docs/` directory |
| Break-glass admin account | TC-129 | Account can authenticate to HTT hub directly |
| Certificate-based auth configured | TC-126, TC-130 | Cert thumbprint available; app registration configured |

---

*Test Cases v1.1 — Updated with ADR-001 findings — Tyler Granlund, IT Director*
