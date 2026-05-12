# Franchisee Impact Brief — The Lash Lounge (TLL)

**To:** The Lash Lounge Franchise Operations  
**From:** HTT Brands IT  
**Date:** May 2026  
**Subject:** Upcoming Security Changes Affecting Your M365 Environment

---

## What's Changing

HTT Brands is strengthening identity security across all tenants. The Lash Lounge is the **largest spoke tenant** (~140 locations, 534 guest accounts) — so these changes will have the most impact here.

### 1. Multi-Factor Authentication (MFA) — Verification Needed
TLL currently has group-based MFA (MFA Security group, 270 members). We need to verify this covers **all active users**, not just a subset.

**Action needed:** Confirm all TLL users are in the MFA Security group.

### 2. Guest Account Cleanup — Major Impact 🔴
TLL has **534 guest accounts**:
- **399** never signed in (75%)
- **386** pending invitations still outstanding
- **354** pending invitations older than 1,000 days (3+ years)

We will be cleaning up these stale accounts. **Most are likely from the initial franchise launch and are no longer needed.**

**Timeline:**
- Pending invitations >1,000 days: **Revoke immediately**
- Guests never signed in: **Disable after 30-day notice**
- Active guests: **Retain** — but will need MFA enrollment

### 3. External User MFA — Critical Change
All guest/external users accessing TLL will be required to use MFA. This is the biggest behavioral change for TLL franchisees.

### 4. Suspicious Service Principal Investigation
We've identified a service principal called "O365Support-MSP-Connector" created in 2022 by a tenant called "Office 365" at office365support.com. We are investigating whether this is legitimate. **No action needed from you** — but if you recognize this vendor, please let IT know.

### 5. Legacy Email Protocols Blocked
POP3, SMTP, and IMAP for external users will be blocked. Modern email clients are **not affected**.

---

## What You Need To Do

| Action | When | How |
|--------|------|-----|
| Verify all TLL users are in MFA Security group | Before July 2026 | Work with Sui Generis to audit group membership |
| Identify which of 534 guests are still needed | Before guest cleanup | Review the guest list we'll provide — flag any that should be retained |
| Notify franchisees about MFA enrollment | Before Q3 2026 | Distribute MFA enrollment instructions from Sui Generis |
| Identify any POP3/IMAP users | Before Q3 2026 | Contact IT if any staff use non-Outlook email clients |
| Report any access issues | Immediately | Contact Sui Generis or HTT IT |

---

## What Happens If You Don't Act

- 354 pending invitations >3 years old **will be revoked** (no impact — they were never accepted)
- Guests never signed in **will be disabled** after 30-day notice period
- Staff without MFA **will not be able to sign in**
- External partners without MFA **will lose access** to TLL resources
- The suspicious O365Support-MSP-Connector **will be disabled** unless confirmed legitimate

---

## Who To Contact

- **Tyler Granlund**, HTT IT Director — tyler.granlund@httbrands.com
- **Dustin Boyd**, IT Operations & Support Lead — dustin.boyd@httbrands.com
- **Megan Myrand**, Sui Generis — for MFA enrollment support and guest list review

---

*This brief is part of the HTT Brands Cross-Tenant Utility (CTU) security program. TLL is the largest spoke tenant (~140 locations) — proactive communication with franchisees is critical to minimize disruption.*
