# Raw Findings — Key Facts Extracted from Microsoft Learn

> **Extraction Date**: 2026-04-09  
> **Format**: Direct quotes and paraphrased findings from official documentation

---

## From: Multitenant organization capabilities overview

**URL**: https://learn.microsoft.com/en-us/entra/identity/multi-tenant-organizations/overview

### MTO Capabilities Listed
1. **Cross-tenant access settings** — Manages how your tenant allows/disallows access from other tenants. Governs B2B collaboration, B2B direct connect, cross-tenant synchronization, and indicates MTO membership.
2. **B2B direct connect** — "Establishes a mutual, two-way trust relationship between two Microsoft Entra tenants for seamless collaboration. B2B direct connect users aren't represented in your directory, but they're visible in Teams for collaboration in Teams shared channels."
3. **B2B collaboration** — "A feature within External ID that lets you invite guest users to collaborate with your organization."
4. **Cross-tenant synchronization** — "A one-way synchronization service in Microsoft Entra ID that automates creating, updating, and deleting B2B collaboration users across tenants in an organization."
5. **Multitenant organization** — "A feature in Microsoft Entra ID and Microsoft 365 that enables you to define a boundary around the Microsoft Entra tenants that your organization owns."
6. **Microsoft 365 admin center for multitenant collaboration** — "Provides an intuitive admin portal experience to create a multitenant organization."

### Key Quote — B2B Direct Connect Scope
> "Currently, B2B direct connect works only with Teams Connect shared channels."

### Key Quote — Cross-Tenant Sync Benefits
> "Automatically create B2B collaboration users within your organization and provide them access to the applications they need, without receiving an invitation email and having to accept a consent prompt in each tenant."

### Key Quote — Cross-Tenant Sync Constraint
> "Synchronized users will have the same cross-tenant Teams and Microsoft 365 experiences available to any other B2B collaboration user."

### Key Quote — Capability Independence
> "B2B direct connect and B2B collaboration are independent capabilities, while cross-tenant synchronization and multitenant organization capabilities are independent of each other, though both rely on underlying B2B collaboration."

### Key Quote — People Search
> "For collaboration in most Microsoft 365 applications, a B2B collaboration user should be shown in address lists as well as be set to user type Member."

### Comparison Table Summary
| | B2B Direct Connect | B2B Collaboration | Cross-Tenant Sync | MTO |
|---|---|---|---|---|
| Scope | Org-to-org external | Org-to-org external | Org internal | Org internal |
| Trust | Mid | Low-to-mid | High (same org) | High (same org) |
| Directory object | No | Yes | Yes (auto) | Uses B2B collab |
| Workloads | Shared channels only | All M365 apps | All M365 apps | Teams, Viva Engage |

---

## From: What is a multitenant organization?

**URL**: https://learn.microsoft.com/en-us/entra/identity/multi-tenant-organizations/multi-tenant-organization-overview

### MTO Goals
1. Define a boundary around the tenants belonging to your organization
2. Collaborate across your tenants in new Microsoft Teams
3. Collaborate across your tenants in Microsoft Viva Engage

### Key Quote — Teams Prerequisite
> "The multitenant organization capability in Microsoft Teams is built on the assumption of reciprocal provisioning of B2B collaboration member users across multitenant organization tenants."

### Key Quote — Viva Engage
> "The multitenant organization capability in Viva Engage is built on the assumption of centralized provisioning of B2B collaboration member users into a hub tenant."

### Key Quote — Cross-Tenant Sync Recommendation
> "the multitenant organization capability is best deployed with the use of a bulk provisioning engine for B2B collaboration users, for example with cross-tenant synchronization."

### MTO Benefits
1. **Differentiate in-org vs out-of-org external users** — enables different CA policies
2. **Improved Teams experience** — "chat, calling, and meeting start notifications from all connected tenants across the multitenant organization. Tenant switching is more seamless and faster."
3. **Improved Viva Engage experience** — unified network for communications

### MTO Lifecycle
- Define → Join → Active
- "The grouping of tenants isn't reciprocal until each listed tenant takes action to join"
- "Each active tenant must have cross-tenant access settings for all active tenants"
- Maximum 100 active tenants per MTO

---

## From: Topologies for cross-tenant synchronization

**URL**: https://learn.microsoft.com/en-us/entra/identity/multi-tenant-organizations/cross-tenant-synchronization-topology

### Hub and Spoke Options
- **Option 1 (Application Hub)**: "integrate commonly used applications into a central hub tenant that users from across the organization can access"
- **Option 2 (User Hub)**: "centralizes all your users in a single tenant and provisions them into spoke tenants where resources are managed"

### Recommendation for Complex Topologies
> "For enterprise organizations with complex identity topologies, consider using cross-tenant synchronization in Microsoft Entra ID. Cross-tenant synchronization is highly configurable and allows the provisioning of any multi-hub multi-spoke identity topology."

---

## From: Configure cross-tenant synchronization

**URL**: https://learn.microsoft.com/en-us/entra/identity/multi-tenant-organizations/cross-tenant-synchronization-configure

### userType Attribute Mapping
- **Member** (default): "Users will be created as external member (B2B collaboration users) in the target tenant."
- **Guest**: "Users will be created as external guests (B2B collaboration users) in the target tenant."

### Key Quote — Existing Guest Conversion
> "If the B2B user already exists in the target tenant, then Member (userType) won't be changed to Member, unless the Apply this mapping setting is set to Always."

### Limitations by Service
- **Power BI**: "Support for UserType Member in Power BI is currently in preview."
- **Microsoft Teams**: "For limitations, see Collaborate with guests from other Microsoft 365 cloud environments."

---

## From: B2B direct connect overview

**URL**: https://learn.microsoft.com/en-us/entra/external-id/b2b-direct-connect-overview

### Key Quote — Scope
> "Currently, B2B direct connect capabilities work with Teams shared channels. When B2B direct connect is established between two organizations, users in one organization can create a shared channel in Teams and invite an external B2B direct connect user to it."

### Key Quote — Mutual Trust
> "B2B direct connect is possible only when both organizations allow access to and from the other organization."

### Key Quote — Default Settings
> "Initially, Microsoft Entra ID blocks all inbound and outbound B2B direct connect capabilities by default for all external Microsoft Entra tenants."

---

## From: Shared channels in Microsoft Teams

**URL**: https://learn.microsoft.com/en-us/microsoftteams/shared-channels

### Key Quote — Guest Accounts
> "While shared channels with external participants don't use guest accounts, guest access in Teams must be enabled to invite them."

### Key Quote — SharePoint Isolation
> "Only people with owner or member permissions in the channel have access to content in the shared channel site. People in the parent team and admins won't have access unless they're also channel members."

### Key Quote — SharePoint Management
> "Membership to the site owner and member groups are kept in sync with the membership of the shared channel. Site permissions for a shared channel site can't be managed independently through SharePoint."

---

## From: Cross-tenant access overview

**URL**: https://learn.microsoft.com/en-us/entra/external-id/cross-tenant-access-overview

### Key Quote — Deny-by-Default Warning
> "Changing the default inbound or outbound settings to block access could block existing business-critical access to apps in your organization or partner organizations. Be sure to use the tools described in this article and consult with your business stakeholders to identify the required access."

### Key Quote — Settings Consistency
> "The access settings you configure for users and groups must match the access settings for applications. Conflicting settings aren't allowed, and warning messages appear if you try to configure them."

### Key Quote — OME Requirement
> "If you block access to all apps by default, users are unable to read emails encrypted with Microsoft Rights Management Service, also known as Office 365 Message Encryption (OME). To avoid this issue, configure your outbound settings to allow your users to access this app ID: 00000012-0000-0000-c000-000000000000."

---

## From: Identity provisioning for Microsoft 365

**URL**: https://learn.microsoft.com/en-us/entra/identity/multi-tenant-organizations/multi-tenant-organization-microsoft-365

### Key Quote — Teams + MTO
> "The new Microsoft Teams experience improves upon Microsoft 365 people search and Teams external access for a unified seamless collaboration experience. For this improved experience to light up, the multitenant organization representation in Microsoft Entra ID is required and collaborating users shall be provisioned as B2B members."

### Key Quote — Reciprocal Provisioning
> "Collaboration in Microsoft 365 is built on the premise of reciprocal provisioning of B2B identities across multitenant organization tenants."

### userType by Sync Method
| Sync Method | Default userType |
|---|---|
| M365 admin center sync | Member (remains Guest if already existed as Guest) |
| Entra cross-tenant sync | Member (remains Guest if already existed as Guest) |

### Key Quote — Changing userType
> "To change the userType from Guest to Member (or vice versa), a source tenant administrator can amend the attribute mappings, or a target tenant administrator can change the userType if the property isn't recurringly synchronized."

---

## From: Limitations in multitenant organizations

**URL**: https://learn.microsoft.com/en-us/entra/identity/multi-tenant-organizations/multi-tenant-organization-known-issues

### Unsupported Scenarios
- Seamless collaboration experience across multitenant organizations in **classic Teams** (only new Teams)
- MTOs larger than 100 tenants (self-service)
- Cross-cloud MTOs (tenants must be in same cloud)
- Education tenants with student scenarios

### Key Quote — Sync Configuration
> "Synchronization jobs created with Microsoft Entra ID won't appear in Microsoft 365 admin center. Microsoft 365 admin center will indicate an Outbound sync status of Not configured."

### Key Quote — Complex Topologies
> "If you're already using Microsoft Entra cross-tenant synchronization, for various multi-hub multi-spoke topologies, you don't need to use the Microsoft 365 admin center share users functionality."
