# B1 Safe Guest Cleanup — Execution Summary

**Date:** 2026-05-12  
**Scope:** Safe subset of B1 / Phase 2 Quick Wins  
**Executor:** code-puppy-b3f2eb with Tyler device-code authentication  
**Method:** Microsoft Graph authorizationPolicy PATCH, one tenant at a time  

---

## Change Set

Only two authorization policy properties were targeted:

| Property | Target | UX Impact |
|---|---|---|
| `allowInvitesFrom` | `adminsAndGuestInviters` | Restricts who can create future guest invitations. Existing guests/users/access remain unchanged. |
| `allowEmailVerifiedUsersToJoinOrganization` | `false` | Blocks future email-verified self-join. Existing users/guests/access remain unchanged. |

No Conditional Access, MFA enforcement, Teams federation, SharePoint, Exchange, groups, memberships, existing users, or existing guests were modified.

---

## Results

| Tenant | Before `allowInvitesFrom` | After `allowInvitesFrom` | Before self-join | After self-join | Validated | Notes |
|---|---|---|---|---|---|---|
| DCE | `everyone` | `adminsAndGuestInviters` | `True` | `False` | ✅ | Fully remediated |
| FN | `adminsGuestInvitersAndAllMembers` | `adminsAndGuestInviters` | `True` | `False` | ✅ | Fully remediated |
| HTT | `everyone` | `adminsAndGuestInviters` | `True` | `False` | ✅ | Fully remediated |
| TLL | `everyone` | `adminsAndGuestInviters` | `True` | `False` | ✅ | Fully remediated |
| BCC | `adminsGuestInvitersAndAllMembers` | `adminsAndGuestInviters` | `True` | `False` | ✅ | Fully remediated after follow-up auth/run. |

---

## UX Impact Assessment

**Observed impact:** None.

These changes do not affect existing users, existing guest accounts, existing access, sign-in behavior, Teams access, MFA prompts, or resource permissions.

The only behavioral changes are future-facing:

1. Users who are not admins or guest inviters can no longer invite new guest users in remediated tenants.
2. External users can no longer self-join the organization using email verification.

This is security cleanup, not access enforcement.

---

## Evidence Files

| Tenant | Report |
|---|---|
| DCE | `reports/B1SafeGuestCleanup_DCE_2026-05-12_172121.json` |
| FN | `reports/B1SafeGuestCleanup_FN_2026-05-12_172825.json` |
| HTT | `reports/B1SafeGuestCleanup_HTT_2026-05-12_173201.json` |
| TLL | `reports/B1SafeGuestCleanup_TLL_2026-05-12_173533.json` |
| BCC | `reports/B1SafeGuestCleanup_BCC_2026-05-12_173904.json` |

Before/after snapshots were written under `reports/snapshots/2026-05-12_*`.

---

## Follow-Up

The safe B1 subset is now complete across all 5 tenants.

Remaining Phase 2 quick wins were intentionally not executed in this pass because they need separate user-experience and operational impact review:

- QW2 — guest role hardening
- QW4 — Teams consumer access disabled
- QW5 — Teams trial tenant federation disabled
- QW6 — external-user MFA CA policy in report-only

These should be handled in a separate change window with explicit pre/post validation.
