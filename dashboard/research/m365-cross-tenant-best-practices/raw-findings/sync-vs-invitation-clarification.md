# Clarification: Cross-Tenant Sync vs B2B Invitation — How User Objects Get Created

> **Date**: 2026-04-09  
> **Source**: Microsoft Learn (Tier 1) — Cross-tenant sync overview, Cross-tenant access overview, SharePoint external sharing, B2B collaboration overview  
> **Confidence**: Very High — multiple official sources cross-validated

---

## The Fundamental Rule

**A user MUST have a B2B user object in the resource tenant to access that tenant's resources (SharePoint, Teams standard channels, Power BI, etc.).**

The ONLY exception is B2B Direct Connect, which allows access to Teams shared channels without a directory object.

The partner policy (cross-tenant access settings) PERMITS or BLOCKS the creation of B2B objects — but does NOT create them itself.

---

## How B2B Objects Get Created — Two Separate Mechanisms

### Mechanism 1: Cross-Tenant Sync (Proactive)
- **Trigger**: Automated schedule (sync engine runs continuously)
- **Who initiates**: Source tenant admin configures sync scope
- **When objects are created**: Before the user needs access (proactive)
- **Default userType**: Member (External Member)
- **Attribute mapping**: Full control — custom attributes like htt_brand, htt_role, fac_cohort_id
- **Lifecycle management**: Automated — create, update, delete as source changes
- **Address list visibility**: Yes (with Member userType + showInAddressList)
- **Scale**: Bulk (all in-scope users synced automatically)
- **Partner policy role**: Target tenant enables "Allow user synchronization into this tenant" in Cross-tenant sync tab
- **Direction**: Push from source tenant to target tenant

### Mechanism 2: B2B Invitation / SharePoint Sharing (Reactive)
- **Trigger**: Manual action — admin invites, user shares a site/file, user added to Team
- **Who initiates**: Resource tenant user (site owner, team owner, admin)
- **When objects are created**: When someone shares or invites (reactive/JIT)
- **Default userType**: Guest (External Guest)
- **Attribute mapping**: None — basic profile only (name, email)
- **Lifecycle management**: None — no auto-delete, requires manual cleanup or access reviews
- **Address list visibility**: No by default (Guest users hidden in people picker unless ShowPeoplePickerSuggestionsForGuestUsers = On)
- **Scale**: Individual (one user at a time)
- **Partner policy role**: B2B Collaboration inbound must be allowed for the source tenant
- **Direction**: Pull — resource tenant user initiates

### Auto-Redeem (Applies to BOTH Mechanisms)
- **What it does**: Suppresses the consent prompt when a B2B object IS created
- **What it does NOT do**: Does NOT create B2B objects. It's not a provisioning mechanism.
- **Requirement**: Both source (outbound) and target (inbound) must enable auto-redeem
- **Microsoft quote**: "The automatic redemption setting is an inbound and outbound organizational trust setting to automatically redeem invitations so users don't have to accept the consent prompt the first time they access the resource/target tenant."

### Key Microsoft Quote
> "The cross-tenant synchronization settings are an inbound only organizational settings to allow the administrator of a source tenant to synchronize users and groups into a target tenant. **These settings don't impact B2B invitations created through other processes such as manual invitation or Microsoft Entra entitlement management.**"

---

## Answering the Specific Questions

### Q1: Does the sync need to go BOTH directions?

**It depends on the desired experience.**

For **spoke→hub** (brand users accessing hub resources): YES, sync is needed. This is already configured for BCC and TLL.

For **hub→spoke** (corporate users accessing brand resources): Sync is **not strictly required** but provides a significantly better experience.

**Without HTT→BCC sync**: Tyler can still access BCC SharePoint IF:
- A BCC user shares a site/file with tyler.granlund@httbrands.com → creates a Guest object in BCC
- A BCC admin manually invites Tyler → creates a Guest object in BCC
- Someone adds Tyler to a BCC Team → creates a Guest object in BCC

These all work because the BCC partner policy allows B2B Collaboration inbound from HTT. The Guest object is created reactively.

**With HTT→BCC sync**: Tyler is proactively provisioned as a Member in BCC with:
- Member userType (better permissions, address list visibility)
- Custom attributes (htt_role, htt_brand)
- Automated lifecycle (removed when he leaves HTT)
- No manual action needed from BCC side

### Q2: Can partner policies handle the "corporate user accessing spoke resources" direction WITHOUT a separate sync job?

**YES — but the partner policy enables OTHER provisioning mechanisms, not direct access.**

When HTT has a partner policy with BCC that allows B2B Collaboration outbound, and BCC allows B2B Collaboration inbound from HTT, this means:
- A BCC user CAN share a SharePoint site with Tyler → creates Guest object in BCC
- A BCC admin CAN invite Tyler → creates Guest object in BCC
- Tyler CANNOT just navigate to a BCC SharePoint URL and magically get access

The partner policy opens the door, but someone still has to walk through it (by sharing, inviting, or syncing).

### Q3: If Tyler needs to access a BCC SharePoint site, does he need to be synced INTO BCC?

**No — sync is not the only way. But it is the BEST way for the HTT scenario.**

Tyler needs a B2B object in BCC. There are three ways to create it:

| Method | userType | Automated? | Lifecycle? | Custom Attrs? | Action Required |
|---|---|---|---|---|---|
| Cross-tenant sync (HTT→BCC) | **Member** | ✅ Yes | ✅ Yes | ✅ Yes | Configure sync job once |
| SharePoint sharing | Guest | ❌ No | ❌ No | ❌ No | BCC user shares site with Tyler |
| Manual admin invitation | Guest | ❌ No | ❌ No | ❌ No | BCC admin invites Tyler |

**For a few corporate users occasionally accessing BCC**: SharePoint sharing or manual invitation is fine. Creates Guest objects ad-hoc.

**For regular corporate access across all brands**: Cross-tenant sync HTT→spoke is the right answer. Automated, Member userType, managed lifecycle.

### Q4: What's the difference between "cross-tenant sync" and "B2B guest auto-invite via partner policy"?

**They are fundamentally different things.**

"B2B guest auto-invite" is not a real mechanism — it's a combination of:
1. Partner policy allowing B2B Collaboration inbound
2. Auto-redeem suppressing consent prompts
3. Some action (sharing, invitation, sync) that creates the B2B object

The correct comparison is:

| | Cross-Tenant Sync | SharePoint/Teams Sharing |
|---|---|---|
| **Creates B2B objects** | Yes (proactively, in bulk) | Yes (reactively, one at a time) |
| **User sees consent prompt** | No (with auto-redeem) | No (with auto-redeem) |
| **User receives invitation email** | No | Yes (unless auto-redeem configured) |
| **userType** | Member (default) | Guest |
| **Address list / People card** | Visible | Hidden by default |
| **Lifecycle** | Automated (create/update/delete) | Manual cleanup needed |
| **Custom attributes** | Yes (htt_brand, htt_role, etc.) | No |
| **Requires action from resource tenant** | Enable "Allow user sync" once | Each share/invite individually |
| **Partner policy dependency** | Inbound cross-tenant sync enabled | Inbound B2B Collaboration enabled |

**End-user experience difference**:
- **Sync'd Member**: Tyler opens BCC SharePoint, he's already there as a Member. Can search for BCC users. Appears in BCC address lists. No friction.
- **Shared Guest**: Tyler receives a share link, clicks it, gets redirected to HTT sign-in, comes back as a Guest. Can access only what was shared. Not in BCC address lists. Friction on first access.
