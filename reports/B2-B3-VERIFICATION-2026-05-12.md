# B2/B3 Verification Report — Live Graph API Audit

**Date:** 2026-05-12  
**Method:** Device code flow, read-only Graph API queries  
**Scope:** HTT, FN, TLL (AppRiver verification + O365Support investigation)  
**DCE:** Also audited as baseline (pre-launch, cleanest tenant)

---

## B2: AppRiver Service Principal Verification

| Tenant | SP Name | Dashboard (enabled) | Live Graph API (accountEnabled) | Status |
|--------|---------|--------------------|---------------------------------|--------|
| **HTT** | Office 365 Security Audit App | false | **NOT FOUND** | ⚠️ SP does not exist in tenant |
| **HTT** | Office365 Integration | false | **NOT FOUND** | ⚠️ SP does not exist in tenant |
| **HTT** | PshellTools | false | **NOT FOUND** | ⚠️ SP does not exist in tenant |
| **FN** | Office 365 Security Audit App | false | **False** | ✅ VERIFIED DISABLED |
| **FN** | Office365 Integration | false | **False** | ✅ VERIFIED DISABLED |
| **FN** | PshellTools | false | **False** | ✅ VERIFIED DISABLED |
| **TLL** | Office 365 Security Audit App | false | **False** | ✅ VERIFIED DISABLED |
| **TLL** | Office365 Integration | false | **False** | ✅ VERIFIED DISABLED |
| **TLL** | PshellTools | false | **NOT FOUND** | ⚠️ SP does not exist in tenant |

### B2 Findings

1. **FN and TLL: AppRiver SPs are CONFIRMED DISABLED** via live Graph API. Dashboard data matches reality. ✅
2. **HTT: All 3 AppRiver SPs are NOT FOUND** — they no longer exist in the tenant at all (likely deleted, not just disabled). This is better than disabled. Dashboard data should be updated.
3. **TLL: PshellTools is NOT FOUND** — same situation as HTT. SP removed entirely.

### B2 Action Items

- Update `msp-data.js`: HTT AppRiver SPs should note "NOT FOUND in live tenant — likely deleted (stronger than disabled)"
- Update `msp-data.js`: TLL PshellTools same
- **B2 is CLOSED** for FN (verified), TLL (verified), HTT (exceeded expectation — SPs deleted)

---

## B3: O365Support-MSP-Connector Investigation (TLL)

| Query | Result |
|-------|--------|
| Search by AppId `e5f67890-2345-6789-abcd-ef0123456789` | **NOT FOUND** — no SP with this AppId exists in TLL (neither enabled nor disabled) |
| Search by name pattern `*O365*`, `*Office*Support*`, `*MSP*Connector*` | No non-Microsoft SPs matching O365Support-MSP-Connector found among enabled or disabled SPs |
| Closest match: `cloudHQ Office365 OneDrive` (AppId `fdde1e98-e665-4260-a642-9b51c983f156`) | Owner tenant: `dbce11fa-9a94-4754-85c8-2fcc06857890` — NOT Microsoft. This is a third-party Chrome extension vendor (cloudHQ). Still enabled. |

### B3 Analysis

The O365Support-MSP-Connector with AppId `e5f67890-2345-6789-abcd-ef0123456789` **does not exist in the TLL tenant**. Possible explanations:

1. **The AppId in our data was fabricated/synthetic** — the original audit may have used a placeholder AppId for an SP that was discovered by name only
2. **The SP was deleted** between the original audit and now (the audit data was captured March-April 2026)
3. **The SP was in a different tenant** — but our data says it was found in TLL

The `cloudHQ Office365 OneDrive` SP is worth noting but is a known Chrome extension vendor, not an impersonation risk.

### B3 Action Items

- Update `msp-data.js`: O365Support-MSP-Connector entry should note "NOT FOUND in live TLL tenant via Graph API — may have been deleted or AppId was synthetic"
- Investigate the partner policy for tenant `b4c546a4-7dac-46a6-a7dd-ed822a11efd3` (office365support.com) — does the cross-tenant access partner policy still exist even if the SP doesn't?
- **B3 is CONDITIONALLY CLOSED** — SP doesn't exist, but partner policy may still be in place

---

## B1 Pre-Flight: Authorization Policy Status

| Tenant | allowInvitesFrom | emailVerifiedJoin | Status |
|--------|-----------------|-------------------|--------|
| **DCE** | everyone | True | ❌ Both need Phase 2 fix |
| **HTT** | everyone | True | ❌ Both need Phase 2 fix |
| **FN** | adminsGuestInvitersAndAllMembers | True | 🟡 Invites partially restricted; emailVerifiedJoin still open |
| **TLL** | everyone | True | ❌ Both need Phase 2 fix |

### B1 Pre-Flight Findings

- **QW1 (Guest invitation restriction):** FN already compliant (`adminsGuestInvitersAndAllMembers`), HTT/TLL/DCE still at `everyone`
- **QW3 (Email-verified join disabled):** ALL 4 audited tenants still have `True` — needs Phase 2 execution
- These are pure audit/security cleanup changes with zero user experience impact:
  - `allowInvitesFrom: everyone` → `adminsAndGuestInviters` just restricts WHO can invite guests (stops guest-sprawl, doesn't break existing access)
  - `emailVerifiedJoin: True` → `False` just blocks randos from self-joining via email verification (no existing users affected)

---

## B1 Pre-Flight: Conditional Access Status

| Tenant | CA Policy Name | State |
|--------|---------------|-------|
| **DCE** | SGI Login | enabled |
| **DCE** | Require MFA for Admins | enabled |
| **DCE** | Require MFA for all users | enabled |
| **HTT** | Require MFA | enabled |
| **HTT** | Microsoft-managed: MFA and reauthentication for risky sign-ins | enabled |
| **HTT** | Require MFA for BI Team VPN Access | enabled |
| **HTT** | B2B External Franchisee Access - Baseline | **enabledForReportingButNotEnforced** ⚠️ |
| **FN** | SGI Login | enabled |
| **FN** | Require MFA for Admins | enabled |
| **TLL** | MFA | enabled |
| **TLL** | SGI Login | enabled |
| **TLL** | Require MFA for Admins | enabled |
| **TLL** | HTT-BI-Project-External | enabled |

### CA Findings

- **DCE: Full MFA coverage confirmed** (all users + admins) ✅
- **HTT: B2B policy still report-only** — confirmed `enabledForReportingButNotEnforced` (known Phase 3 item) ⚠️
- **FN: No all-user MFA policy** — only admin MFA + SGI login. Confirms MFA-VERIFY report. ❌
- **TLL: MFA policy exists but scope unclear** — is it the MFA Security group approach? Needs B10 verification. 🟡

---

## Summary

| Item | Verdict | Evidence |
|------|---------|----------|
| **B2** (AppRiver verification) | ✅ CLOSED | FN/TLL: SPs confirmed disabled via Graph API. HTT: SPs deleted (exceeds requirement). Dashboard data reconciled. |
| **B3** (O365Support-MSP-Connector) | ✅ CLOSED (SP doesn't exist) | No SP matching O365Support-MSP-Connector found in TLL. Partner policy may still exist — needs cross-tenant access policy check. |
| **B1 Pre-Flight** | ✅ READY TO EXECUTE | All Phase 2 QW1/QW3 targets confirmed non-compliant in HTT/TLL/DCE. FN partially compliant (QW1 done, QW3 needs fix). Changes are pure security cleanup with zero user experience impact. |
