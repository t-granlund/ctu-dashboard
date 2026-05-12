# Cross-Tenant Enterprise App Security Audit Report

**Generated:** 2026-05-12 16:39 UTC
**Tenants Scanned:** 4 of 4
**Total Third-Party Apps:** 0

## Risk Summary
| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High     | 0 |
| 🟡 Medium   | 0 |

## CodeTwo Status
✅ **CodeTwo NOT detected in any scanned tenant.**

## Per-Tenant Breakdown

### HTT (0c0e35dc-188a-4eb3-b8ba-61752154b407)
- Total Service Principals: 0
- Third-Party Enterprise Apps: 0
- CodeTwo Present: ✅ No

*No medium+ risk apps flagged.*

### BCC (b5380912-79ec-452d-a6ca-6d897b19b294)
- Total Service Principals: 0
- Third-Party Enterprise Apps: 0
- CodeTwo Present: ✅ No

*No medium+ risk apps flagged.*

### TLL (3c7d2bf3-b597-4766-b5cb-2b489c2904d6)
- Total Service Principals: 0
- Third-Party Enterprise Apps: 0
- CodeTwo Present: ✅ No

*No medium+ risk apps flagged.*

### DCE (ce62e17d-2feb-4e67-a115-8ea4af68da30)
- Total Service Principals: 0
- Third-Party Enterprise Apps: 0
- CodeTwo Present: ✅ No

*No medium+ risk apps flagged.*

## Action Items
1. Review all Critical/High risk apps in the `findings.csv`.
2. Revoke admin consents for high-risk delegated permissions on unnecessary apps.
3. Remove user/group assignments from orphaned (zero-assignment) apps.
4. Verify CodeTwo status — if migrating away, ensure the old app is uninstalled and permissions revoked.
5. For FN tenant (Frenchies), authenticate via az CLI and re-run this audit.