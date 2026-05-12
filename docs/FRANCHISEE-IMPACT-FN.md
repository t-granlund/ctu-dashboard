# Franchisee Impact Brief — Frenchies Modern Nail Care (FN)

**To:** Frenchies Franchise Operations  
**From:** HTT Brands IT  
**Date:** May 2026  
**Subject:** Upcoming Security Changes Affecting Your M365 Environment

---

## What's Changing

HTT Brands is strengthening identity security across all tenants. Here's what's changing for Frenchies.

### 1. Multi-Factor Authentication (MFA) — Expanding Coverage
MFA is currently enforced for admin accounts. It will be expanded to **all FN users** in the coming weeks.

**Your MSP (Sui Generis/Megan) has already deployed the CA/MFA infrastructure.** The expansion to all users requires MFA registration first.

### 2. External User MFA — Critical Change
External/guest users accessing FN resources will be required to use MFA. Guests who haven't registered MFA will need to enroll or lose access.

**This is the highest-impact change for Frenchies** — if you have franchisees or partners who access FN SharePoint or Teams, they need to enroll MFA.

### 3. Legacy Email Protocols Blocked
POP3, SMTP, and IMAP access for external users will be blocked. Modern email clients are **not affected**.

---

## What You Need To Do

| Action | When | How |
|--------|------|-----|
| Ensure all staff have MFA registered | Before enforcement date | Authenticator app — Sui Generis will provide instructions |
| Notify franchisees/partners who access FN resources | Before Q3 2026 | Share this brief or contact IT for a partner-facing version |
| Identify any POP3/IMAP users | Before Q3 2026 | Contact IT if any staff use non-Outlook email clients |
| Report any access issues | Immediately | Contact Sui Generis or HTT IT |

---

## What Happens If You Don't Act

- Staff without MFA **will not be able to sign in**
- External partners/guests without MFA **will lose access** to FN resources
- POP3/IMAP connections for external users **will stop working**

---

## Who To Contact

- **Tyler Granlund**, HTT IT Director — tyler.granlund@httbrands.com
- **Megan Myrand**, Sui Generis — for MFA enrollment support and deployment coordination

---

*This brief is part of the HTT Brands Cross-Tenant Utility (CTU) security program. Frenchies is the third-largest spoke tenant with ~20 locations — early communication is critical.*
