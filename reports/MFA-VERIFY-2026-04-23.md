# MFA / Conditional Access Insurance Verification — 2026-04-23

**Prepared for:** HTT / Riverside cyber-insurance evidence package  
**Prepared by:** CTU analysis pass  
**Source export:** `reports/Audit_ConditionalAccess_2026-04-23_VERIFY/`  
**Export tool:** `Export-CAForInsurance.ps1`  
**Export timestamp:** `2026-04-23T20:10:38.5235120Z`  
**Scope:** HTT, BCC, FN, TLL, DCE Microsoft Entra Conditional Access policies

## Executive summary

The 2026-04-23 Conditional Access export confirms MFA enforcement is present in
all five tenants, but coverage is not uniform.

| Tenant | CA policy count | Enabled | Report-only | MFA posture from export | Insurance answer |
| --- | ---: | ---: | ---: | --- | --- |
| HTT | 4 | 3 | 1 | Tenant-wide MFA for all users/apps, with one named SMTP service account excluded and Azure VPN app handled by a separate MFA policy. | **Mostly yes**; document SMTP exception. |
| BCC | 6 | 5 | 1 | Admin MFA and named-user MFA exist; no tenant-wide all-user MFA policy in export. | **Partial**; do not claim all-user MFA from this export. |
| FN | 2 | 2 | 0 | Admin MFA only; SGI break-glass account blocked from normal login. | **Admins only**; no all-user MFA evidence in export. |
| TLL | 4 | 4 | 0 | MFA enforced for `MFA Security` group and SGI tech/admin groups; not tenant-wide all-user scope. | **Partial**; group-scoped MFA, not all-user evidence. |
| DCE | 3 | 3 | 0 | Tenant-wide all-user MFA enforced with SGI break-glass excluded; admin MFA also enforced. | **Yes**, with break-glass exception. |

**Bottom line:** Use this export as evidence for CA/MFA policy configuration, but
avoid saying “MFA is enforced for every user in every tenant” unless additional
identity/authentication-method evidence is provided for BCC, FN, and TLL.

## Evidence boundaries

This report is based only on Microsoft Entra Conditional Access policy exports.
It does **not** prove endpoint controls, device compliance, actual sign-in MFA
challenge outcomes, or third-party/MSP-side Conditional Access. In particular:

- **EDR is not resolved from CA exports.** Conditional Access does not establish
  whether endpoints have Defender for Endpoint, SentinelOne, CrowdStrike, or any
  other EDR agent deployed.
- **MFA registration/authentication method enrollment is not resolved here.**
  The export proves policy intent and scope, not that every user has completed
  registration or recently satisfied MFA.
- **MSP-side MFA is not resolved here.** If Sui Generis/Pax8/AppRiver users
  access customer tenants through partner workflows, this report does not prove
  their home-tenant CA controls.

## Step 3 matrix — MFA / CA verification

| Tenant | Tenant ID | Tenant-wide all-user MFA policy | Admin MFA policy | Break-glass handling | Report-only policies | Step 3 status |
| --- | --- | --- | --- | --- | --- | --- |
| HTT | `0c0e35dc-188a-4eb3-b8ba-61752154b407` | `Require MFA`, enabled, created `2024-08-15T17:44:05.4233681Z`, modified `2026-02-25T22:46:36.9889966Z`; includes `All`, all apps, excludes Azure VPN app `41b23e61-6c1e-4545-b367-cd054e0ed4b4`. | Covered by tenant-wide MFA; plus `Require MFA for BI Team VPN Access`, enabled, created `2025-02-26T17:41:07.1987803Z`. | Named exclusion: `DEFAULT SMTP USER - shophttbrands.com` / `smtpuser@shophttbrands.com` / `92285652-a22e-40ef-9a97-deb639aaf1a8`. | `B2B External Franchisee Access - Baseline`, report-only, created `2025-06-27T18:45:39.7800257Z`. | **Pass with documented exception.** |
| BCC | `b5380912-79ec-452d-a6ca-6d897b19b294` | None found in export. | `Microsoft-managed: Multifactor authentication for admins accessing Microsoft Admin Portals`, enabled, created `2023-12-06T20:28:44.4364114Z`; `Require MFA for Admins`, enabled, created `2026-03-12T19:19:01.0427663Z`. | SGI-style break-glass/block account appears as unresolved object `77023be8-78cd-4dd9-bc54-8d9a58225b5d`; it is included in `SGI Login` block policy and excluded from `Require MFA for Admins`. | Risky sign-in MFA policy is report-only, created `2025-08-04T22:06:19.4657587Z`. | **Partial.** Admin MFA yes; all-user MFA not evidenced. |
| FN | `98723287-044b-4bbb-9294-19857d4128a0` | None found in export. | `Require MFA for Admins`, enabled, created `2026-03-12T19:01:36.9843379Z`; includes Global Administrator role. | `SGI Breakglass` / `SGI@frenchiesnails.com` / `9ac66b23-a447-4cb6-960a-7230a8d4d5fb` is included in `SGI Login` block policy and excluded from admin MFA. | None. | **Partial.** Admin MFA only. |
| TLL | `3c7d2bf3-b597-4766-b5cb-2b489c2904d6` | `MFA`, enabled, created `2023-02-09T19:59:29.8479643Z`; scoped to group `MFA Security`, not `All`. | `Require MFA for Admins`, enabled, created `2023-07-10T20:44:40.2995997Z`; scoped to `SGI Techs` group. | `SGI` / `SGI@TheLashLounge.com` / `c05e2afe-5692-4125-85d3-9146ae5d64ea` is included in `SGI Login` block policy and excluded from admin MFA. `Lash Lounge Operations` / `Operations@TheLashLounge.com` / `00f8d95d-e84d-4bb6-9918-ab454125527c` is excluded from `MFA`. Deleted/unresolved object `35647db7-aa3e-4e13-8da0-4c3b6886e5fd` is also excluded from admin MFA. | None. | **Partial.** Group-scoped MFA, not all-user evidence. |
| DCE | `ce62e17d-2feb-4e67-a115-8ea4af68da30` | `Require MFA for all users`, enabled, created `2026-03-12T17:58:17.6930396Z`; includes `All`, all apps. | `Require MFA for Admins`, enabled, created `2026-03-12T17:08:04.0086704Z`, modified `2026-03-12T17:16:52.2346165Z`; includes Global Administrator role. | `SGI Breakglass` / `SGI@deltacrown.com` / `fe7ad48b-3b91-4ec0-a691-e9f9a0c9477d` is included in `SGI Login` block policy and excluded from all-user/admin MFA policies. | None. | **Pass with documented break-glass exception.** |

## Discrepancy resolution — 4a through 4d

### 4a — FN all-user MFA claim

**Resolved status:** Not supported by the 2026-04-23 CA export.

FN has two enabled policies:

| Policy | State | Created | Scope | Grant |
| --- | --- | --- | --- | --- |
| `SGI Login` | enabled | `2026-03-12T18:59:49.3453995Z` | User `SGI Breakglass` / `SGI@frenchiesnails.com` | block |
| `Require MFA for Admins` | enabled | `2026-03-12T19:01:36.9843379Z` | Global Administrator role; excludes SGI break-glass | mfa |

There is no exported FN policy equivalent to “Require MFA for all users.” For
insurance language, FN should be described as **admin MFA enforced**, not
all-user MFA enforced, unless later evidence supersedes this export.

### 4b — TLL all-user MFA claim

**Resolved status:** Partially supported, but group-scoped.

TLL has an enabled MFA policy:

| Policy | State | Created | Scope | Grant |
| --- | --- | --- | --- | --- |
| `MFA` | enabled | `2023-02-09T19:59:29.8479643Z` | Group `MFA Security` (`2541fa95-9659-445b-89c9-00e6c374598d`), 270 members | mfa |
| `Require MFA for Admins` | enabled | `2023-07-10T20:44:40.2995997Z` | Group `SGI Techs`, 10 members | mfa |
| `HTT-BI-Project-External` | enabled | `2025-01-13T18:10:39.0344898Z` | Group `HTT-BI-Project-External`, 4 guest members | mfa |

This is good evidence that TLL has broad/group-based MFA coverage, but it is not
an `All` users CA policy. The export cannot prove that every active TLL user is
inside `MFA Security`.

### 4c — DCE all-user MFA claim

**Resolved status:** Supported by the 2026-04-23 CA export.

DCE has an enabled all-user MFA policy:

| Policy | State | Created | Scope | Grant |
| --- | --- | --- | --- | --- |
| `Require MFA for all users` | enabled | `2026-03-12T17:58:17.6930396Z` | `All` users, all apps; excludes SGI break-glass | mfa |

DCE can be represented as **all-user MFA enforced with documented break-glass
exception**.

### 4d — BCC MFA posture / Bishops exception

**Resolved status:** Admin and targeted MFA are supported; tenant-wide all-user
MFA is not supported by this export.

BCC has these MFA-relevant policies:

| Policy | State | Created | Scope | Grant |
| --- | --- | --- | --- | --- |
| `Microsoft-managed: Multifactor authentication for admins accessing Microsoft Admin Portals` | enabled | `2023-12-06T20:28:44.4364114Z` | Admin role templates; Microsoft Admin Portals | mfa |
| `Incoming Merger Users` | enabled | `2024-04-09T21:09:16.6591465Z` | Named users | mfa |
| `Require MFA for Admins` | enabled | `2026-03-12T19:19:01.0427663Z` | Global Administrator role; excludes SGI-style account `77023be8-78cd-4dd9-bc54-8d9a58225b5d` | mfa |
| `Microsoft-managed: Multifactor authentication and reauthentication for risky sign-ins` | report-only | `2025-08-04T22:06:19.4657587Z` | Group `Conditional Access: Risky sign-in multifactor authentication (...)` | mfa |

BCC should be described as **admin MFA enforced plus targeted MFA policies**.
Do not claim tenant-wide MFA from this export.

## Break-glass / exclusion register

| Tenant | Policy | Excluded account/object | Resolved name | Notes |
| --- | --- | --- | --- | --- |
| HTT | `Require MFA` | `92285652-a22e-40ef-9a97-deb639aaf1a8` | `DEFAULT SMTP USER - shophttbrands.com` / `smtpuser@shophttbrands.com` | Service-account style SMTP exception, not a normal user MFA exception. |
| BCC | `Require MFA for Admins` | `77023be8-78cd-4dd9-bc54-8d9a58225b5d` | Unresolved in export | Same object is included in `SGI Login` block policy; likely SGI break-glass/block account. |
| FN | `Require MFA for Admins` | `9ac66b23-a447-4cb6-960a-7230a8d4d5fb` | `SGI Breakglass` / `SGI@frenchiesnails.com` | Same object is included in `SGI Login` block policy. |
| TLL | `MFA` | `00f8d95d-e84d-4bb6-9918-ab454125527c` | `Lash Lounge Operations` / `Operations@TheLashLounge.com` | Named operations account excluded from group-scoped MFA policy. |
| TLL | `Require MFA for Admins` | `c05e2afe-5692-4125-85d3-9146ae5d64ea` | `SGI` / `SGI@TheLashLounge.com` | Same object is included in `SGI Login` block policy. |
| TLL | `Require MFA for Admins` | `35647db7-aa3e-4e13-8da0-4c3b6886e5fd` | Unresolved / NotFound | Likely deleted object or stale exclusion; should be cleaned up. |
| DCE | `Require MFA for all users`; `Require MFA for Admins` | `fe7ad48b-3b91-4ec0-a691-e9f9a0c9477d` | `SGI Breakglass` / `SGI@deltacrown.com` | Same object is included in `SGI Login` block policy. |

## Recommended insurance wording

Use wording like this if the insurer allows a narrative answer:

> Microsoft Entra Conditional Access is deployed across HTT, BCC, FN, TLL, and
> DCE. HTT and DCE have exported all-user MFA policies, with documented service
> or break-glass exceptions. BCC, FN, and TLL have enforced MFA policies for
> administrators and/or scoped MFA security groups. Conditional Access exports
> also show break-glass accounts are separately blocked from normal sign-in via
> SGI Login block policies where present. Endpoint EDR status is outside the
> scope of Conditional Access and must be evidenced separately.

If the form only allows yes/no for “MFA for all users,” answer conservatively:

- **HTT:** Yes, with documented SMTP/service-account exception.
- **DCE:** Yes, with documented break-glass exception.
- **TLL:** Partial / scoped by MFA Security group; needs user membership proof
  before answering yes for every user.
- **BCC:** Partial / admin and targeted MFA only in this export.
- **FN:** Partial / admin MFA only in this export.

## Follow-up items

1. Pull active user inventory and MFA registration/authentication-method status
   for BCC, FN, and TLL to determine whether scoped policies cover all active
   users.
2. Clean stale/unresolved TLL exclusion `35647db7-aa3e-4e13-8da0-4c3b6886e5fd`
   if confirmed deleted.
3. Resolve BCC object `77023be8-78cd-4dd9-bc54-8d9a58225b5d`; if it is a
   break-glass account, document owner, credential custody, and monitoring.
4. Validate whether `Operations@TheLashLounge.com` still requires exclusion from
   TLL MFA.
5. Collect separate EDR evidence. Again, because CA exports are not magic EDR
   pixie dust.
