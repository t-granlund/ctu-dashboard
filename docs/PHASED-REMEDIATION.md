# Phased Remediation Roadmap

This document outlines the recommended remediation approach for findings from the Cross-Tenant Identity Audit. Changes are organized into phases to minimize risk and avoid downtime.

**Critical principle: No changes without a current-state audit first.** Phase 1 must complete before any modifications begin.

---

## Phase 1 — Discovery and Assessment (Weeks 1–3)

**Goal:** Complete picture of current state. Zero changes.

**Actions:**
1. Run the full audit: `.\scripts\Invoke-FullAudit.ps1`
2. Review the `AUDIT-SUMMARY.md` report — prioritize Critical and High findings
3. Export `guests_<tenant>.csv` files for review with stakeholders (Kristin, Dustin)
4. Document any sync jobs in quarantine and investigate root cause
5. Map the actual cross-tenant traffic patterns using the **Cross-tenant access activity workbook** in Azure Monitor (if Log Analytics is configured)
6. Identify any users like Noelle who have been manually patched and need the underlying sync config fixed

**Deliverables:**
- Audit reports for all 5 tenants
- Stakeholder review of guest inventory
- List of quick wins for Phase 2
- Decision on userType mapping strategy (all Member vs. conditional)

---

## Phase 2 — Quick Wins (Weeks 3–5)

**Goal:** Address highest-risk findings with minimal disruption.

**Changes (per tenant):**

| Change | Risk | Downtime | Rollback |
|--------|------|----------|----------|
| Remove guests from privileged directory roles | Low | None | Re-add the guest |
| Restrict `allowInvitesFrom` to `adminsAndGuestInviters` | Low | None | Change back to previous value |
| Set guest role to Restricted Guest (`2af84b1e-...`) | Medium | Guests may lose some directory browsing | Change `guestUserRoleId` back |
| Disable `allowEmailVerifiedUsersToJoinOrganization` | Low | None | Re-enable |
| Block guests from creating app registrations | Low | None | Re-enable |
| Deploy CA policy: Require MFA for all external users (report-only first) | None | None | Delete policy |
| Assign sponsors to existing guest accounts | Low | None | N/A |

**Validation after each change:**
- Confirm Noelle Peter and other known cross-tenant users can still access their resources
- Check the Entra ID sign-in logs for any new failures with error codes related to guest access
- Monitor the CA policy insights workbook if deploying MFA in report-only mode

---

## Phase 3 — Policy Hardening (Weeks 5–10)

**Goal:** Deny-by-default cross-tenant access with explicit partner overrides.

**This is the highest-risk phase. Each change should be:**
1. Tested in report-only / audit mode first where possible
2. Applied to ONE spoke tenant first (suggest DCE as lowest impact — newest/smallest)
3. Validated with real users before rolling to remaining tenants
4. Documented with exact rollback commands

### 3a. Cross-Tenant Access Default → Deny

Use the remediation script for a controlled deployment:

```powershell
# Deploy deny-by-default with partner exceptions defined in tenants.json
.\scripts\remediation\Set-DenyByDefault.ps1 -ConfigPath ".\config\tenants.json" -WhatIf

# Remove -WhatIf to apply changes after validation
.\scripts\remediation\Set-DenyByDefault.ps1 -ConfigPath ".\config\tenants.json"
```

Or manually configure via Microsoft Graph:

```powershell
# Set default to block ALL inbound and outbound B2B collaboration and direct connect
# WARNING: Do this AFTER creating partner-specific policies for MTO tenants
$body = @{
    b2bCollaborationInbound = @{
        usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
        applications = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
    }
    b2bCollaborationOutbound = @{
        usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
        applications = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
    }
    b2bDirectConnectInbound = @{
        usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
        applications = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
    }
    b2bDirectConnectOutbound = @{
        usersAndGroups = @{ accessType = "blocked"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
        applications = @{ accessType = "blocked"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
    }
}
```

### 3b. Partner-Specific Policies for Each MTO Tenant

For each CTU family tenant, create a partner policy that allows collaboration + trusts MFA:

```powershell
# Example: In TLL tenant, create partner policy for CTU hub
$partnerBody = @{
    tenantId = "0c0e35dc-188a-4eb3-b8ba-61752154b407"  # CTU Hub
    b2bCollaborationInbound = @{
        usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
        applications = @{ accessType = "allowed"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
    }
    b2bCollaborationOutbound = @{
        usersAndGroups = @{ accessType = "allowed"; targets = @(@{ target = "AllUsers"; targetType = "user" }) }
        applications = @{ accessType = "allowed"; targets = @(@{ target = "AllApplications"; targetType = "application" }) }
    }
    inboundTrust = @{
        isMfaAccepted = $true
        isCompliantDeviceAccepted = $true
        isHybridAzureADJoinedDeviceAccepted = $true
    }
    automaticUserConsentSettings = @{
        inboundAllowed = $true
        outboundAllowed = $true
    }
}
```

### 3c. Fix userType Attribute Mappings

Use the remediation script for automated fixing:

```powershell
# Fix userType mappings across all sync jobs
.\scripts\remediation\Fix-SyncUserTypeMapping.ps1 -ConfigPath ".\config\tenants.json" -WhatIf

# Remove -WhatIf to apply changes after validation
.\scripts\remediation\Fix-SyncUserTypeMapping.ps1 -ConfigPath ".\config\tenants.json"
```

Or manually update via Entra admin center:

1. Entra admin center → Cross-tenant synchronization → Configurations
2. Select the configuration for the source tenant
3. Provisioning → Mappings → Provision Microsoft Entra ID Users
4. Find `userType` row → Change from Constant "Guest" to Constant "Member"
5. Save → Restart provisioning

### 3d. Teams Federation → Explicit Allow-List

Use the remediation script or manual configuration:

```powershell
# Using the CTU remediation script
.\scripts\remediation\Set-TeamsFederationAllowlist.ps1 -ConfigPath ".\config\tenants.json"
```

Or manually configure:

```powershell
# Switch from open federation to allow-list
$allowList = New-Object Microsoft.Rtc.Management.WritableConfig.Settings.Edge.AllowList
# Add each MTO domain from your tenants.json configuration
$allowList.AllowedDomain.Add((New-CsEdgeAllowedDomain -Domain "contoso.com"))
$allowList.AllowedDomain.Add((New-CsEdgeAllowedDomain -Domain "fabrikam.com"))
# Add additional partner domains as needed

Set-CsTenantFederationConfiguration -AllowedDomains $allowList
```

### 3e. Enable CA Policies (Switch from Report-Only to Enabled)

After validating Phase 2 report-only policies show no unexpected blocks:

```powershell
Update-MgIdentityConditionalAccessPolicy -ConditionalAccessPolicyId $policyId -State "enabled"
```

---

## Phase 4 — Governance Implementation (Weeks 10–16)

**Goal:** Automated lifecycle management for external identities.

### 4a. Access Reviews

Deploy quarterly reviews for guest access:

```powershell
$reviewBody = @{
    displayName = "Quarterly Guest Access Review - All M365 Groups"
    scope = @{
        query = "./members/microsoft.graph.user/?`$count=true&`$filter=(userType eq 'Guest')"
        queryType = "MicrosoftGraph"
    }
    instanceEnumerationScope = @{
        query = "/groups?`$filter=(groupTypes/any(c:c eq 'Unified'))"
        queryType = "MicrosoftGraph"
    }
    reviewers = @(@{
        query = "./manager"
        queryType = "MicrosoftGraph"
    })
    settings = @{
        defaultDecision = "Deny"
        autoApplyDecisionsEnabled = $true
        recurrence = @{
            pattern = @{ type = "absoluteMonthly"; interval = 3 }
            range = @{ type = "noEnd"; startDate = "2026-04-01" }
        }
    }
}
```

### 4b. PIM for Privileged Roles

Convert permanent role assignments to PIM eligible:
1. Identify all permanent assignments from the audit
2. Create PIM eligible assignments with MFA + justification
3. Remove permanent assignments (keep 1-2 break-glass accounts)
4. Set activation duration to 8 hours maximum

### 4c. Entitlement Management Access Packages

Create access packages for cross-tenant resource access:
1. Create a catalog for cross-tenant resources
2. Add connected organizations for each MTO tenant
3. Create packages with approval workflows (manager + IT Director)
4. Set expiration: 90-180 days with renewal option

---

## Phase 5 — Continuous Monitoring (Ongoing)

**Goal:** Detect configuration drift and unauthorized changes.

### 5a. Deploy Monitoring Infrastructure

Use the monitoring deployment script to set up Azure Monitor and alerts:

```powershell
# Deploy monitoring resources and alerts
.\scripts\04-Monitoring\Deploy-Monitoring.ps1 -ConfigPath ".\config\tenants.json" -WhatIf

# Remove -WhatIf to deploy after validation
.\scripts\04-Monitoring\Deploy-Monitoring.ps1 -ConfigPath ".\config\tenants.json"
```

### 5b. Azure Monitor Alerts

```kusto
// Alert on cross-tenant access policy changes
AuditLogs
| where Category contains "CrossTenant" or Category contains "Policy"
| where ActivityDisplayName has_any ("Update cross tenant access", "Add partner", "Delete partner")
| project TimeGenerated, ActivityDisplayName, InitiatedBy, TargetResources

// Alert on new guest accounts
AuditLogs
| where OperationName == "Invite external user"
| project TimeGenerated, InitiatedBy, TargetResources
```

### Recurring Audit Schedule

| Frequency | Audit |
|-----------|-------|
| Weekly | Guest inventory spot-check (new guests this week) |
| Monthly | Full guest inventory + stale detection |
| Quarterly | Complete 7-domain audit across all tenants |
| Annually | Architecture review + policy alignment check |

Run with: `.\scripts\Invoke-FullAudit.ps1` and compare findings against the previous quarter's baseline.
