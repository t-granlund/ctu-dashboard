# Microsoft 365 Cross-Tenant Hub-and-Spoke Best Practices (2025–2026)

> **Research Date**: 2026-04-09  
> **Researcher**: web-puppy-1c58e1  
> **Project Context**: HTT Brands Cross-Tenant Utility (CTU)  
> **Source Tier**: All findings from Tier 1 (Official Microsoft Learn documentation)  
> **Confidence Level**: High — all findings cross-referenced across multiple official sources

---

## Executive Summary

This research covers Microsoft's current best practices for multi-tenant hub-and-spoke cross-tenant access configuration, focused on 7 interconnected topics critical to the CTU project. All findings are sourced exclusively from official Microsoft Learn documentation.

### Top-Level Findings

1. **MTO is an organizational boundary, not an access mechanism.** MTO does NOT automatically grant access — cross-tenant access settings are still required for every tenant pair. MTO unlocks enhanced UX in new Teams (chat/calling notifications, seamless tenant switching) and People card visibility, but ONLY when combined with B2B Member userType users provisioned reciprocally.

2. **HTT's hub-and-spoke model maps to Microsoft's "Application Hub" topology.** Spoke tenants sync users TO the hub where applications (SharePoint, Teams, Power BI) live. However, for full MTO Teams benefits, Microsoft recommends **reciprocal provisioning** (bidirectional sync).

3. **B2B Direct Connect is ONLY for Teams shared channels.** It does not provide SharePoint access, directory objects, or any access beyond shared channels. For HTT's needs (SharePoint, standard Teams channels, Power BI), B2B Collaboration via cross-tenant sync is the correct approach.

4. **Shared channels do NOT require MTO.** They require B2B Direct Connect cross-tenant access settings only. Shared channels provide isolated SharePoint sites — not access to broader hub SharePoint.

5. **Deny-by-default sequencing is critical.** Microsoft explicitly warns against changing defaults before setting up partner overrides. The correct order is: audit → add partner orgs → configure overrides → change default to Block.

6. **Existing Guest users won't auto-convert to Member.** When enabling cross-tenant sync with Member userType for tenants where users already exist as Guest (FN, DCE, and convention site guests), the attribute mapping must be set to "Apply = Always" to force the conversion.

7. **Power BI Member userType support is in preview.** This directly impacts the bi-support-agent project's TLL Fabric access scenario.

---

## Key Findings by Topic

### 1. Multi-Tenant Organization (MTO) — What It Actually Provides

| Capability | Partner Policies Only | Partner Policies + MTO |
|---|---|---|
| B2B Collaboration access | ✅ | ✅ |
| B2B Direct Connect (shared channels) | ✅ | ✅ |
| Cross-tenant sync | ✅ | ✅ |
| Auto-redeem invitations | ✅ | ✅ |
| MFA trust | ✅ | ✅ |
| **Differentiate in-org vs out-of-org external users** | ❌ | ✅ |
| **Improved Teams experience (chat/calling/meeting notifications)** | ❌ | ✅ (new Teams only) |
| **Seamless tenant switching in Teams** | ❌ | ✅ (new Teams only) |
| **People card cross-tenant visibility** | ❌ | ✅ (requires B2B Member + reciprocal sync) |
| **Viva Engage cross-tenant** | ❌ | ✅ (requires centralized hub provisioning) |
| **Policy templates for new partners** | ❌ | ✅ (optional preconfiguration) |

**Critical requirement**: MTO Teams benefits require BOTH:
- MTO membership (tenant joins the MTO)
- B2B Member userType users provisioned **reciprocally** across tenants

MTO alone without B2B Member users = no enhanced experience.

**Limitation**: MTO seamless collaboration does NOT work in classic Teams — only in new Microsoft Teams.

### 2. Cross-Tenant Sync — Hub-and-Spoke Configuration

**Microsoft documents two hub-and-spoke patterns:**

| Pattern | Direction | Use Case | HTT Fit |
|---|---|---|---|
| **Application Hub** | Spoke → Hub | Apps centralized in hub; spoke users need hub access | ✅ Primary model |
| **User Hub** | Hub → Spoke | Users centralized in hub; spoke tenants host resources | ❌ Not HTT's model |

**Current HTT sync direction**: Spoke → Hub (BCC, TLL sync to HTT). This is correct for the Application Hub model.

**For MTO Teams benefits**: Microsoft recommends **reciprocal provisioning** — each tenant's users should be provisioned as B2B Members in ALL other tenants. This means:
- Spoke → Hub (brand users access hub resources) — **already in progress**
- Hub → Spoke (corporate users access brand resources) — **not yet configured**

**Recommendation for HTT**: 
- Phase 1: Continue spoke→hub sync (immediate resource access need)
- Phase 2: Add hub→spoke sync for corporate users who need brand tenant access (after MTO enrollment)
- For Viva Engage only: centralized hub provisioning is sufficient (no need for reciprocal)

**userType mapping:**
- Default userType for cross-tenant sync: **Member** (External Member)
- If B2B user already exists as Guest: **remains Guest** unless `Apply this mapping` = `Always`
- To change Guest→Member: source admin amends attribute mappings OR target admin changes userType manually (if not recurringly synced)

### 3. B2B Collaboration vs B2B Direct Connect

| Feature | B2B Collaboration | B2B Direct Connect |
|---|---|---|
| **Directory object created** | ✅ Yes (B2B user) | ❌ No |
| **Supported workloads** | SharePoint, Teams, Power BI, all M365 apps | **Teams shared channels ONLY** |
| **Trust model** | Low-to-mid trust (org-to-org) or High trust (org internal with cross-tenant sync) | Mid trust (org-to-org) |
| **User tracking** | Full audit via directory objects | Less visible (no directory presence) |
| **Default policy** | **All Allowed** (must change to Block for deny-by-default) | **All Blocked** (already deny-by-default) |
| **MFA trust** | Configurable | Configurable |
| **Can scope to specific apps** | ✅ Yes | ✅ Yes (but only shared channels) |
| **Can scope to specific users/groups** | ✅ Yes | ✅ Yes |

**Key insight**: These are **independent capabilities**. You can use both simultaneously:
- B2B Collaboration (via cross-tenant sync) for SharePoint, standard Teams, Power BI
- B2B Direct Connect for Teams shared channels (if needed)

**For HTT**: B2B Collaboration with cross-tenant sync is the primary mechanism. B2B Direct Connect is optional — only needed if HTT wants cross-tenant shared channels without creating guest objects.

### 4. Shared Channels

**Requirements**:
- ✅ B2B Direct Connect cross-tenant access settings (mutual trust)
- ✅ Guest access in Teams must be enabled (even though shared channels don't use guest accounts)
- ❌ MTO is NOT required for shared channels
- ❌ Cross-tenant sync is NOT required for shared channels

**Key behaviors**:
- Shared channel users access from their home tenant Teams instance (no tenant switching)
- Shared channel SharePoint sites are **isolated** — only channel members get access
- Shared channel permissions managed by Teams, NOT independently through SharePoint
- Cannot convert shared channels to/from standard or private channels
- Shared channel inherits sensitivity label from parent team

**For HTT's needs**: Shared channels provide collaboration within the channel scope only. They do NOT provide access to hub SharePoint sites, hub Teams standard channels, or other hub resources. They are a supplement to, not a replacement for, B2B Collaboration.

### 5. Cross-Tenant SharePoint Access

**Best approach**: Cross-tenant sync with **Member userType** (B2B Collaboration).

**Why Member userType matters**:
- B2B Members appear in address lists (Global Address List visibility)
- B2B Members can be made available for collaboration in most M365 applications
- Members have broader default permissions than Guests in SharePoint
- Microsoft explicitly states: "For collaboration in most Microsoft 365 applications, a B2B collaboration user should be shown in address lists as well as be set to user type Member"

**Application scoping**: In the partner policy, scope B2B Collaboration inbound to specific applications (e.g., SharePoint Online) + specific user groups (e.g., `Bishops-Brand-Users`). This prevents broad access while enabling targeted SharePoint access.

**Shared channel SharePoint sites**: These are separate from the main team/hub SharePoint sites. They are managed by Teams and cannot be managed independently through SharePoint. They do NOT provide access to hub SharePoint sites.

### 6. Cross-Tenant Teams Access

| Channel Type | Cross-Tenant Mechanism | User Representation | MTO Required? |
|---|---|---|---|
| **Standard channels** | B2B Collaboration (guest/member) | Directory object in resource tenant | No (but MTO enhances UX) |
| **Shared channels** | B2B Direct Connect | No directory object; access from home tenant | No |
| **Private channels** | Not supported cross-tenant | N/A | N/A |

**Standard channels**: User must be added to the team as a member/guest. With cross-tenant sync (Member userType), users appear as team members. Without MTO, they show as external. With MTO, they get enhanced collaboration UX (notifications, seamless switching).

**Shared channels**: Users access from their home Teams instance. No tenant switching needed. B2B Direct Connect required. Most seamless for targeted collaboration. No directory footprint.

**Private channels**: Cannot be shared across tenants. Strictly within a single tenant.

### 7. Deny-by-Default Implementation Sequencing

**Microsoft's recommended order** (synthesized from official documentation):

#### Step 1: Audit (Pre-Change)
- Use "Identify inbound and outbound sign-ins" tools
- Check sign-in logs to understand which external orgs and apps are in use
- Consult business stakeholders to identify required access

#### Step 2: Add Partner Organizations
- Navigate to Entra ID → External Identities → Cross-tenant access settings → Organizational settings
- Add each partner tenant by domain or tenant ID
- At this point, each partner inherits the current default settings (All Allowed)

#### Step 3: Configure Partner-Specific Overrides
- For each partner: Modify inbound access settings with specific Allow rules
- Scope to specific applications (e.g., SharePoint Online)
- Scope to specific user groups (e.g., `Bishops-Brand-Users`)
- Enable auto-redeem, MFA trust, and identity sync as needed
- **Test thoroughly** — verify partner access still works through the override

#### Step 4: Change Default to Block
- ONLY after all partner overrides are verified working
- Change default B2B Collaboration inbound: Block all users + Block all applications
- Note: B2B Direct Connect is already blocked by default (no change needed)

#### Critical Implementation Notes:
- **User/group settings must match application settings**: If you block all users, you must block all applications (and vice versa)
- **OME encryption**: If you block outbound access to all apps by default, users cannot read encrypted emails. Allow outbound access to app ID `00000012-0000-0000-c000-000000000000` (Microsoft Rights Management Service)
- **Requires Security Administrator role** at minimum
- **Conflicting settings not allowed**: Microsoft will show warning messages for inconsistent configurations

---

## Impact on CTU Project

### Validated Decisions
- ✅ Deny-by-default with partner overrides is the correct approach
- ✅ Cross-tenant sync with Member userType is the right mechanism for brand user access
- ✅ Spoke→Hub sync direction is correct for HTT's Application Hub model
- ✅ Teams federation allowlist approach is appropriate
- ✅ Brand-level dynamic security groups for scoping partner policies

### Required Adjustments
- ⚠️ **userType conversion**: FN and DCE users existing as Guest need "Apply this mapping = Always" to convert to Member
- ⚠️ **MTO enrollment**: Requires reciprocal sync for full Teams benefits — HTT needs hub→spoke sync for corporate users (not just spoke→hub)
- ⚠️ **OME app ID**: Must be allowed in outbound settings when implementing deny-by-default
- ⚠️ **Power BI**: Member userType support in preview — may affect bi-support-agent TLL Fabric access approach
- ⚠️ **Private channels**: Cannot be shared cross-tenant — any cross-tenant private channel scenarios need redesign

### New Considerations
- 🆕 Consider B2B Direct Connect for Teams shared channels (supplement to B2B Collaboration)
- 🆕 Evaluate whether hub→spoke sync is needed for corporate users accessing brand tenant resources
- 🆕 Ensure all users are on new Microsoft Teams for MTO benefits
- 🆕 MTO templates can pre-configure cross-tenant access for new partner tenants (Phase 3+)
