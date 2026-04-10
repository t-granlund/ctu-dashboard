# Multi-Dimensional Analysis: M365 Cross-Tenant Best Practices

> **Research Topic**: M365 Cross-Tenant Hub-and-Spoke Configuration  
> **Project Context**: HTT Brands CTU (5 tenants, hub-and-spoke, deny-by-default target)  
> **Analysis Date**: 2026-04-09

---

## 1. MTO Membership — Multi-Dimensional Analysis

### Security Lens
- **Positive**: MTO enables differentiating in-org external users from out-of-org external users, allowing more granular Conditional Access policies (e.g., stricter policies for true external guests vs. internal brand users)
- **Positive**: MTO cross-tenant access templates can pre-configure security settings for new partner tenants
- **Neutral**: MTO does NOT change the security posture — cross-tenant access settings remain the enforcement mechanism
- **Risk**: MTO requires reciprocal provisioning, which increases the directory footprint in all tenants (more user objects to manage)

### Cost Lens
- **Cost**: No additional licensing cost for MTO itself (included in Entra ID P1/P2)
- **Cost**: Reciprocal provisioning means more user objects in each tenant — potential licensing implications for M365 features that count per-user
- **Savings**: Reduced admin overhead from policy templates and consistent management

### Implementation Complexity
- **Moderate**: Requires all 5 tenants to join (admin consent in each tenant)
- **Moderate**: Requires reciprocal cross-tenant sync configuration (currently HTT only has spoke→hub)
- **Low**: MTO is an additive configuration — doesn't break existing access patterns
- **Dependency**: FN, TLL, DCE must join MTO (currently only BCC is a member)

### Stability
- **Mature**: MTO is GA (Generally Available) in Microsoft Entra ID
- **Limitation**: Seamless Teams experience only in new Teams (classic Teams unsupported)
- **Risk**: MTO sync configs (`MTO_Sync_<TenantID>`) must not be renamed or edited if using M365 admin center

### Optimization
- **UX Improvement**: Significant for new Teams users — seamless tenant switching, unified notifications
- **People Search**: Cross-tenant people search enhancement requires reciprocal provisioning
- **Viva Engage**: Unified network across brands (useful for corporate communications)

### Compatibility
- **Requires**: Microsoft Entra ID (any edition for basic MTO; P1/P2 for cross-tenant sync)
- **Requires**: New Microsoft Teams (classic Teams gets no MTO benefits)
- **Compatible**: Works alongside existing cross-tenant sync and B2B collaboration configurations

### Maintenance
- **Low**: MTO is a declaration — once set up, requires minimal ongoing maintenance
- **Monitoring**: Need to monitor tenant join status (Pending vs Active)
- **Lifecycle**: Any tenant can leave MTO unilaterally — need governance process

### HTT-Specific Assessment
**Priority: HIGH** — MTO provides tangible UX benefits for brand users collaborating in hub Teams. However, the immediate security remediation (deny-by-default) does NOT depend on MTO. Recommend:
- Phase 3: Enroll all tenants in MTO (after policy hardening)
- Phase 3+: Configure reciprocal sync for corporate users → brand tenants

---

## 2. Cross-Tenant Sync Direction — Multi-Dimensional Analysis

### Security Lens
- **Spoke→Hub (current)**: Brand users synced as Members in HTT — grants access to hub resources. Manageable scope (brand users accessing centralized apps)
- **Hub→Spoke**: Corporate users synced to brand tenants — grants access to brand-specific resources. Requires careful scoping (not all corporate users need access to all brands)
- **Bidirectional risk**: Increases attack surface — if one tenant is compromised, synced users in other tenants may be affected
- **Mitigation**: Scope sync to specific user groups (not all users)

### Cost Lens
- **Spoke→Hub**: Already configured for BCC and TLL — no additional cost
- **Hub→Spoke**: New sync configurations needed (4 new sync jobs: HTT→BCC, HTT→FN, HTT→TLL, HTT→DCE)
- **Storage**: Each synced user creates a B2B object — minimal storage cost

### Implementation Complexity
- **Spoke→Hub**: ✅ Already in progress — BCC and TLL have active sync
- **Hub→Spoke**: Moderate effort — requires:
  1. Outbound cross-tenant access settings on HTT
  2. Inbound cross-tenant access settings on each spoke
  3. Sync job configuration with scoping filters
  4. Attribute mapping (userType=Member, htt_brand, htt_role)
- **userType conversion**: For existing Guest users (FN, DCE), must set `Apply this mapping = Always`

### Stability
- **Cross-tenant sync is GA** and well-established
- **Known issue**: If B2B user already exists as Guest, userType won't change to Member unless explicitly configured
- **Monitoring**: Sync jobs can quarantine — need alerting (covered in CTU Phase 5)

### HTT-Specific Assessment
**Spoke→Hub: Continue (already correct for Application Hub model)**  
**Hub→Spoke: Evaluate in Phase 3** — only needed if:
- Corporate users regularly need access to brand-specific resources in spoke tenants
- MTO Teams benefits for corporate-to-brand collaboration are prioritized
- Tyler confirms need for bidirectional access

---

## 3. B2B Collaboration vs B2B Direct Connect — Multi-Dimensional Analysis

### Security Lens
- **B2B Collaboration**: Creates directory objects — full visibility and auditability. Subject to Conditional Access, access reviews, lifecycle governance
- **B2B Direct Connect**: No directory objects — less trackable. Limited to Teams shared channels. MFA trust required if CA policies enforce MFA
- **Recommendation**: B2B Collaboration for primary access; B2B Direct Connect only for shared channel scenarios

### Implementation Complexity
- **B2B Collaboration**: Already configured (cross-tenant sync handles provisioning)
- **B2B Direct Connect**: Requires mutual trust configuration on both tenants. Additional Teams admin configuration for shared channel policies
- **Can coexist**: Independent capabilities — both can be enabled simultaneously

### Compatibility
- **B2B Collaboration**: Works with SharePoint, Teams (standard + private channels), Power BI, Outlook, all M365 apps
- **B2B Direct Connect**: Works with **Teams shared channels ONLY**
- **No overlap**: Different access patterns for different scenarios

### HTT-Specific Assessment
**B2B Collaboration (via cross-tenant sync) = PRIMARY mechanism**  
**B2B Direct Connect = OPTIONAL supplement** for Teams shared channels

For HTT's needs (hub SharePoint, hub Teams, Power BI/Fabric), B2B Collaboration is the only viable approach. B2B Direct Connect is optional — useful if HTT wants lightweight shared channels without creating directory objects for every participant.

---

## 4. Shared Channels — Multi-Dimensional Analysis

### Security Lens
- **Positive**: No directory objects created — minimal footprint
- **Positive**: Isolated SharePoint sites (only channel members access)
- **Risk**: Less governance visibility (no guest objects to review/audit)
- **Requirement**: B2B Direct Connect must be enabled (mutual trust)

### Implementation Complexity
- **Teams Admin**: Must configure channel policies to allow shared channel creation
- **Entra Admin**: Must configure B2B Direct Connect cross-tenant access settings (mutual)
- **User training**: Users need to understand shared channels behave differently than standard channels

### HTT-Specific Assessment
**Priority: LOW for CTU scope**. Shared channels are a Teams collaboration feature, not a governance mechanism. They don't solve HTT's primary needs (SharePoint access, guest lifecycle management, identity governance). Consider as a future enhancement after CTU Phase 3.

---

## 5. Cross-Tenant SharePoint Access — Multi-Dimensional Analysis

### Security Lens
- **Member userType**: Members have broader default permissions than Guests in SharePoint. Ensure site-level permissions are explicitly managed
- **Guest userType**: More restrictive by default, but less seamless UX. May cause confusion when users can't access expected resources
- **Application scoping**: Partner policy can scope to SharePoint Online specifically — prevents access to other apps through the same B2B relationship

### Implementation Complexity
- **Cross-tenant sync with Member**: Automated provisioning, users appear in address lists, full collaboration experience
- **Manual guest invitation**: Works but doesn't scale (327 users for convention site shows the pain)
- **Application scoping in partner policy**: Already planned in CTU (scope to SharePoint Online + brand security group)

### Optimization
- **Member userType**: Better search experience, GAL visibility, People card
- **Performance**: No significant performance difference between Guest and Member for SharePoint access
- **Caching**: SharePoint caches permissions — changes may take time to propagate

### HTT-Specific Assessment
**Cross-tenant sync with Member userType is the correct approach** for brand users accessing hub SharePoint. Application scoping in the partner policy adds defense-in-depth. The convention site pattern (manual guest provisioning) should transition to cross-tenant sync-based access for long-term operations.

---

## 6. Cross-Tenant Teams Access — Multi-Dimensional Analysis

### Security Lens
- **Standard channels**: Full governance (user in directory, CA policies apply, access reviews possible)
- **Shared channels**: Lightweight governance (no directory object, B2B Direct Connect settings govern)
- **Private channels**: Cannot cross tenant boundaries — security isolation maintained
- **Federation**: Separate from B2B — controls chat/calling with external users (allowlist recommended)

### Implementation Complexity
- **Standard channels**: Add cross-tenant synced users to teams — straightforward
- **Shared channels**: Configure B2B Direct Connect on both sides + Teams channel policies
- **MTO enhancement**: Adds seamless switching and unified notifications — moderate setup

### HTT-Specific Assessment
For HTT's Teams collaboration needs:
1. **Standard channels**: Primary approach — brand users added as Members to hub Teams via cross-tenant sync
2. **Shared channels**: Consider for project-specific collaboration that doesn't need full team membership
3. **Private channels**: Remain tenant-internal (no cross-tenant option)
4. **Federation**: Switch to allowlist mode (already in CTU Phase 2 quick wins)

---

## 7. Deny-by-Default Implementation — Multi-Dimensional Analysis

### Security Lens
- **Critical improvement**: Moves from open-by-default (current) to zero-trust posture
- **Risk**: If partner overrides are missing or misconfigured, business-critical access will break
- **OME risk**: Blocking all outbound apps blocks encrypted email reading — must allow app ID `00000012-0000-0000-c000-000000000000`
- **Mitigation**: Audit sign-ins, set partner overrides first, test thoroughly, have rollback plan

### Implementation Complexity
- **Sequencing is critical**: Partner overrides MUST be created and verified BEFORE changing default
- **Consistency requirement**: User/group settings must match application settings (can't block users but allow apps)
- **Role requirement**: Security Administrator or custom role with cross-tenant access permissions
- **Testing**: Each partner override should be tested individually before default change

### Stability
- **Irreversible in practice**: While technically reversible (change default back to Allow), the purpose is to establish permanent security posture
- **Grandfathering**: Existing guest objects remain — access reviews in Phase 4 handle cleanup
- **Monitoring**: Need alerting for unexpected cross-tenant access attempts after deny-by-default

### HTT-Specific Assessment
**The CTU deny-by-default sequencing should be:**

1. ✅ Phase 1 audit (identify all current cross-tenant sign-ins) — **BEFORE any changes**
2. ✅ Phase 2 quick wins (guest restrictions, Teams consumer disable) — **low-risk changes first**
3. ⚠️ Phase 3 Step 1: Add all 4 partner orgs to Organizational settings (BCC, FN, TLL, DCE)
4. ⚠️ Phase 3 Step 2: Configure and **test** each partner override (scope to SharePoint + brand group)
5. ⚠️ Phase 3 Step 3: Pilot deny-by-default on Delta Crown (smallest tenant, lowest risk)
6. ⚠️ Phase 3 Step 4: Verify DCE partner override works (redeem + sign-in test)
7. ⚠️ Phase 3 Step 5: Change HTT default inbound to Block (affects ALL non-partner tenants)
8. ⚠️ Phase 3 Step 6: Monitor for breakage (24-48h observation window)
9. ✅ Phase 3 Step 7: Roll out remaining partner overrides (BCC, FN, TLL)

**Additional step needed**: Ensure outbound default allows OME app ID for encrypted email functionality.

---

## Cross-Cutting Analysis: Interaction Effects

### MTO × Cross-Tenant Sync
- MTO benefits require cross-tenant sync with Member userType
- MTO recommends reciprocal sync (bidirectional) for full Teams experience
- Cross-tenant sync can operate without MTO (access works, but no enhanced UX)

### B2B Collaboration × B2B Direct Connect
- Independent capabilities — can both be enabled for same partner
- B2B Collaboration provides broad access (SharePoint, Teams, etc.)
- B2B Direct Connect supplements with shared channels (no directory object)
- Both use same cross-tenant access settings framework

### Deny-by-Default × Partner Overrides × MTO
- Deny-by-default blocks ALL external orgs by default
- Partner overrides create explicit exceptions for known tenants
- MTO differentiates in-org partners from true external orgs
- Order: Set overrides → Enable deny-by-default → Enroll in MTO

### Cross-Tenant Sync × userType × Existing Guests
- New sync users: Automatically created as Member (default)
- Existing Guest users: Remain Guest unless `Apply = Always`
- HTT impact: Convention site guests (327 users) may need userType conversion
- bi-support-agent impact: TLL users may need conversion if synced as Guest
