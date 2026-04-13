# CTU Project Recommendations

> **Based on**: M365 Cross-Tenant Hub-and-Spoke Best Practices Research  
> **For**: Tyler Granlund, Dustin Boyd — HTT Brands  
> **Date**: 2026-04-09  
> **Priority Scale**: P0 (Critical/Immediate) → P1 (High) → P2 (Medium) → P3 (Low/Future)

---

## Prioritized Action Items

### P0 — Critical (Must Address Before Phase 3)

#### P0-1: Fix userType Conversion for Existing Guest Users
**Finding**: Cross-tenant sync defaults to Member userType for NEW users, but existing Guest users remain Guest unless the attribute mapping is set to `Apply this mapping = Always`.

**Impact on CTU**: FN and DCE users already exist as Guest in HTT tenant. TLL users synced via bi-support-agent may also be Guest. Convention site guests (327 users across all brands) are all Guest userType.

**Action**:
1. Audit current userType for all cross-tenant synced users in HTT (`Get-MgUser -Filter "userType eq 'Guest'" | Where-Object {$_.CreationType -eq 'Invitation'}`)
2. For each active cross-tenant sync job, verify the userType attribute mapping
3. Set `Apply this mapping` to `Always` for the userType attribute on FN, DCE, and TLL sync configurations
4. Run sync cycle and verify conversion
5. **Test**: Confirm converted users can still access SharePoint, Teams, Power BI

**Risk**: Converting Guest→Member grants broader default permissions. Review site-level permissions before conversion.

**Owner**: Tyler (sync configuration changes)

---

#### P0-2: Configure Partner Overrides BEFORE Default Deny
**Finding**: Microsoft explicitly warns that changing default settings to Block will break existing access. Partner overrides must be created and tested first.

**Action**:
1. Add all 4 partner tenant IDs to HTT's Organizational settings:
   - BCC: `b5380912-79ec-452d-a6ca-6d897b19b294`
   - FN: `98723287-044b-4bbb-9294-19857d4128a0`
   - TLL: `3c7d2bf3-b597-4766-b5cb-2b489c2904d6`
   - DCE: `ce62e17d-2feb-4e67-a115-8ea4af68da30`
2. Configure each partner's inbound B2B Collaboration override:
   - Applications: SharePoint Online (scoped, not all apps)
   - Users/Groups: Brand-specific security group
   - Auto-redeem: Enabled
   - MFA Trust: Enabled
   - Identity Sync: Enabled (userType = Member)
3. **Test each override individually** before proceeding to default deny
4. Only after ALL overrides verified: Change default inbound B2B Collaboration to Block

**Owner**: Tyler (partner override configuration), Dustin (testing verification)

---

#### P0-3: Allow OME App ID in Outbound Settings
**Finding**: If outbound access defaults are changed to Block all applications, users cannot read emails encrypted with Office 365 Message Encryption (OME).

**Action**:
1. When implementing deny-by-default, ensure outbound settings allow access to app ID: `00000012-0000-0000-c000-000000000000` (Microsoft Rights Management Service)
2. Add this to the CTU remediation script (`03-remediate-policy-hardening.ps1`)
3. Test encrypted email reading after outbound policy change

**Risk**: If missed, encrypted emails from partner tenants will be unreadable.

**Owner**: Tyler (add to Phase 3 script)

---

### P1 — High (Should Address in Phase 3)

#### P1-1: Correct B2B Collaboration Default Understanding
**Finding**: Microsoft's default cross-tenant access settings differ by capability type:
- B2B Collaboration inbound: **All Allowed** (this is what HTT needs to change)
- B2B Direct Connect inbound: **All Blocked** (already deny-by-default — no change needed)

**Impact on CTU**: The CTU baseline targets deny-by-default for BOTH B2B Collaboration AND Direct Connect. Direct Connect is already compliant by Microsoft default. Only B2B Collaboration needs explicit remediation.

**Action**:
1. Update `baseline.json` to note that B2B Direct Connect default is already Block
2. Focus Phase 3 remediation on B2B Collaboration inbound default change
3. Validate current B2B Direct Connect default is indeed Block on all 5 tenants (confirm no one changed it)

**Owner**: CTU audit (Phase 1 should validate this)

---

#### P1-2: Scope Application in Partner Policies to SharePoint Online
**Finding**: Microsoft supports scoping B2B Collaboration to specific applications in partner policies. This provides defense-in-depth even when the partner override allows access.

**Action**:
1. For each partner override, scope inbound B2B Collaboration to:
   - **Application**: SharePoint Online (app ID: `00000003-0000-0ff1-ce00-000000000000`)
   - **Users/Groups**: Brand security group (e.g., `Bishops-Brand-Users`)
2. If Teams access is also needed, add Microsoft Teams app to allowed applications
3. Document the application IDs in `data/partner-overrides.json`

**Owner**: Tyler (partner policy configuration)

---

#### P1-3: Plan TLL Inbound Policy Remediation (Urgent)
**Finding**: TLL tenant has UNSCOPED inbound B2B policy (All Applications / All Users) — non-compliant and highest risk among all spoke tenants.

**Impact**: Any external user from any tenant can collaborate with TLL resources. This is the most urgent remediation item outside the HTT hub.

**Action**:
1. CTU Phase 1 audit should flag TLL inbound as Critical severity
2. Phase 3 pilot should consider TLL as a high-priority target (not just DCE)
3. Recommend to Tyler: TLL inbound policy should be scoped to HTT hub tenant only (or deny-by-default + HTT override)
4. **Requires TLL tenant admin consent** — coordinate with Tyler

**Owner**: Tyler (cross-tenant coordination)

---

#### P1-4: Evaluate Power BI Member userType Impact
**Finding**: "Support for UserType Member in Power BI is currently in preview." This directly affects the bi-support-agent project where ~210 TLL franchise owners need Fabric access.

**Impact**: If TLL users are converted from Guest to Member (per P0-1), their Power BI/Fabric access behavior may change. Preview features may have bugs or limitations.

**Action**:
1. Test Power BI/Fabric access with Member userType on a small group of TLL users
2. Monitor Microsoft documentation for Power BI Member userType GA announcement
3. Coordinate with bi-support-agent project to adjust if needed
4. Document any behavioral differences in bi-support-agent README

**Owner**: Tyler + Dustin (testing), bi-support-agent project owner (integration)

---

### P2 — Medium (Phase 3-4 Timeframe)

#### P2-1: Enroll All Tenants in MTO
**Finding**: MTO provides tangible UX benefits (Teams collaboration, People card, Viva Engage) but requires all tenants to join AND reciprocal B2B Member provisioning.

**Current state**: Only BCC is MTO member. FN, TLL, DCE are not joined.

**Action**:
1. After Phase 3 policy hardening is complete, initiate MTO enrollment for FN, TLL, DCE
2. Each spoke tenant admin must accept the MTO join request
3. Verify tenant state transitions from Pending → Active
4. Configure MTO policy templates for consistent access settings

**Dependencies**: 
- Phase 3 partner overrides must be in place first
- Each spoke tenant admin must consent
- New Teams deployment (classic Teams won't benefit)

**Owner**: Tyler (MTO enrollment coordination)

---

#### P2-2: Evaluate Hub→Spoke Sync for Corporate Users
**Finding**: For full MTO Teams benefits, Microsoft recommends reciprocal provisioning (bidirectional sync). Currently HTT only has spoke→hub sync.

**Question for Tyler**: Do corporate users (HTT employees) need regular access to brand-specific resources in spoke tenants?

**Action** (if yes):
1. Identify which HTT corporate users need spoke tenant access
2. Create scoping group (e.g., `HTT-Corporate-CrossTenant`)
3. Configure cross-tenant sync jobs: HTT → BCC, HTT → FN, HTT → TLL, HTT → DCE
4. Map userType = Member, include htt_brand and htt_role attributes
5. Configure outbound auto-redeem on HTT, inbound auto-redeem on each spoke

**Action** (if no):
1. Document that hub→spoke sync is not needed for current operations
2. Revisit when MTO is fully enrolled and Teams collaboration patterns emerge

**Owner**: Tyler (decision), CTU (implementation if approved)

---

#### P2-3: Configure B2B Direct Connect for Shared Channels (Optional)
**Finding**: B2B Direct Connect enables Teams shared channels without creating directory objects. This is separate from and complementary to B2B Collaboration.

**Use case**: Project-specific collaboration across brands where full team membership isn't needed.

**Action**:
1. Assess whether any current or planned cross-brand projects would benefit from shared channels
2. If yes, configure B2B Direct Connect partner policies (mutual trust required)
3. Configure Teams channel policies to allow shared channel creation
4. Train team owners on shared channel creation and external participant management

**Owner**: Tyler (assessment), Dustin (Teams admin configuration)

---

#### P2-4: Address Convention Site Guest→Member Transition
**Finding**: The Homecoming 2026 convention site has 327 B2B guests across all brands. If cross-tenant sync is configured with Member userType, these users may exist in both states (convention Guest + sync Member) or the Guest identity may block the Member sync.

**Action**:
1. Post-convention (after April 28, 2026): Audit which convention guests overlap with cross-tenant sync users
2. For overlapping users: Ensure sync mapping `Apply = Always` converts them to Member
3. For non-overlapping guests: Evaluate whether they should be converted or removed via access review
4. Update Convention-Page-Build deprovisioning script to check for cross-tenant sync membership before deleting

**Owner**: Tyler (post-convention coordination), Convention project owner

---

### P3 — Low (Phase 4-5 / Future)

#### P3-1: Implement MTO Policy Templates
**Finding**: MTO supports optional cross-tenant access policy templates that can pre-configure settings for new partner tenants joining the MTO.

**Action**:
1. After MTO enrollment is complete, configure MTO policy templates with HTT's standard partner policy settings
2. Templates should include: SharePoint Online scoping, brand group membership, auto-redeem, MFA trust
3. This simplifies onboarding if HTT acquires new brands or tenants

**Owner**: Tyler (template configuration)

---

#### P3-2: Calendar and Free/Busy Cross-Tenant Enhancement
**Finding**: Calendar free/busy visibility across tenants is not explicitly documented in the MTO context. This may require Exchange Online organization relationships or hybrid configuration.

**Action**:
1. Research Exchange Online organization relationships for cross-tenant calendar sharing
2. Test whether MTO + B2B Member provides automatic calendar free/busy visibility
3. If not automatic, configure Exchange organization relationships for each partner tenant pair

**Owner**: Dustin (Exchange Online configuration)

---

#### P3-3: Develop Deny-by-Default Rollback Runbook
**Finding**: Microsoft warns about blocking business-critical access but doesn't provide a detailed rollback playbook.

**Action**:
1. Create a runbook for emergency rollback of deny-by-default policy
2. Include: Steps to change default back to Allow, verification procedures, notification templates
3. Store in `docs/runbooks/deny-by-default-rollback.md`
4. Test rollback procedure in a non-production scenario

**Owner**: Dustin (runbook creation), Tyler (approval)

---

## Decision Matrix for Tyler

| Decision | Options | Recommendation | Urgency |
|---|---|---|---|
| MTO enrollment timing | Now vs After Phase 3 | After Phase 3 (policy hardening first) | Medium |
| Hub→Spoke sync | Yes vs No | Evaluate — depends on corporate user needs | Medium |
| B2B Direct Connect | Enable vs Skip | Skip for now; evaluate shared channel demand | Low |
| TLL urgent remediation | Phase 3 pilot vs Immediate | Flag as Critical in Phase 1 audit, prioritize in Phase 3 | High |
| userType conversion | Gradual vs All-at-once | Pilot with DCE (smallest), then expand | High |
| Shared channels | Enable vs Defer | Defer until after Phase 3 | Low |
| Convention guest cleanup | Pre-convention vs Post | Post-convention (don't disrupt live event) | Medium |

---

## Updates to CTU Scripts

Based on this research, the following CTU scripts need updates:

### `03-remediate-policy-hardening.ps1`
- Add OME app ID (`00000012-0000-0000-c000-000000000000`) to outbound allowed apps
- Add partner org creation step BEFORE default deny change
- Add verification step after each partner override
- Add B2B Direct Connect default verification (should already be Block)

### `baseline.json`
- Note that B2B Direct Connect default is already Block (Microsoft default)
- Add OME app ID requirement for outbound settings
- Add userType conversion guidance (Apply = Always)

### `modules/CTU.CrossTenantSync.psm1`
- Add userType attribute mapping validation check
- Add "Apply this mapping" setting verification
- Flag existing Guest users that should be Member

### `data/partner-overrides.json`
- Add SharePoint Online app ID for application scoping
- Add OME app ID for outbound exception
- Document the sequencing order (overrides before default deny)

### New Files Needed
- `docs/runbooks/deny-by-default-rollback.md` — Emergency rollback procedure
- `docs/mto-enrollment-checklist.md` — Per-tenant MTO enrollment steps
- `data/application-ids.json` — Centralized list of app IDs used in policies
