<#
.SYNOPSIS
    CTU.GuestInventory - Enumerates all guest/external users, detects stale accounts,
    maps group memberships, identifies guests in privileged roles.
#>

function Invoke-CTUGuestInventoryAudit {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$TenantKey,
        [Parameter(Mandatory)][PSCustomObject]$ReportContext,
        [Parameter()][PSCustomObject]$Config
    )

    if (-not $Config) { $Config = Get-CTUConfig }
    $domain = "GuestInventory"

    Write-Host "`n--- Guest User Inventory Audit: $TenantKey ---" -ForegroundColor Magenta

    $staleThreshold = $Config.auditSettings.staleGuestThresholdDays
    $thresholdDate = (Get-Date).AddDays(-$staleThreshold)

    $auditData = [PSCustomObject]@{
        TenantKey          = $TenantKey
        TotalGuests        = 0
        GuestsByDomain     = @{}
        StaleGuests        = @()
        NeverSignedIn      = @()
        PendingInvitations = @()
        GuestsInPrivRoles  = @()
        GuestSummary       = @()
    }

    # 1. Enumerate all guest users
    try {
        Write-Host "  Enumerating guest users..." -ForegroundColor DarkGray
        $selectProps = "id,displayName,mail,userPrincipalName,userType,externalUserState,externalUserStateChangeDateTime,createdDateTime,creationType,signInActivity,identities,jobTitle,department,companyName"

        $guests = Invoke-CTUGraphRequest `
            -Uri "https://graph.microsoft.com/v1.0/users?`$filter=userType eq 'Guest'&`$select=$selectProps&`$top=999" `
            -AllPages

        $auditData.TotalGuests = $guests.Count
        Write-Host "  Found $($guests.Count) guest users" -ForegroundColor DarkGray

        # Categorize by source domain
        foreach ($guest in $guests) {
            $sourceDomain = "unknown"
            if ($guest.mail) {
                $sourceDomain = ($guest.mail -split '@')[1]
            }
            elseif ($guest.identities) {
                $extId = $guest.identities | Where-Object { $_.signInType -eq 'federated' -or $_.issuer }
                if ($extId) { $sourceDomain = $extId[0].issuer }
            }

            if (-not $auditData.GuestsByDomain.ContainsKey($sourceDomain)) {
                $auditData.GuestsByDomain[$sourceDomain] = 0
            }
            $auditData.GuestsByDomain[$sourceDomain]++

            # Build summary record — resolve best-available sign-in timestamp.
            # signInActivity or any of its DateTime properties can be null
            # (user never signed in, or Graph didn't return the property).
            $lastSignIn = $null
            $signInActivity = $guest.signInActivity
            if ($signInActivity) {
                $lastSignIn = $signInActivity.lastSuccessfulSignInDateTime
                if (-not $lastSignIn) { $lastSignIn = $signInActivity.lastSignInDateTime }
                if (-not $lastSignIn) { $lastSignIn = $signInActivity.lastNonInteractiveSignInDateTime }
            }
            $summary = [PSCustomObject]@{
                Id              = $guest.id
                DisplayName     = $guest.displayName
                Mail            = $guest.mail
                UPN             = $guest.userPrincipalName
                SourceDomain    = $sourceDomain
                CreatedDateTime = $guest.createdDateTime
                CreationType    = $guest.creationType
                InvitationState = $guest.externalUserState
                LastSignIn      = $lastSignIn
                DaysSinceSignIn = if ($lastSignIn) { [math]::Round(((Get-Date) - [datetime]$lastSignIn).TotalDays, 0) } else { $null }
                IsStale         = $false
                NeverSignedIn   = ($null -eq $lastSignIn)
                JobTitle        = $guest.jobTitle
                Department      = $guest.department
                CompanyName     = $guest.companyName
            }

            # Stale detection — guard every [datetime] cast against nulls.
            if ($null -eq $lastSignIn) {
                $createdDate = $guest.createdDateTime
                if ($createdDate -and ([datetime]$createdDate -lt $thresholdDate)) {
                    $summary.IsStale = $true
                }
                # Always bucket as NeverSignedIn regardless of staleness
                $auditData.NeverSignedIn += $summary
            }
            elseif ([datetime]$lastSignIn -lt $thresholdDate) {
                $summary.IsStale = $true
                $auditData.StaleGuests += $summary
            }

            # Pending invitations
            if ($guest.externalUserState -eq 'PendingAcceptance') {
                $auditData.PendingInvitations += $summary
            }

            $auditData.GuestSummary += $summary
        }

        # Report findings
        Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
            -Severity 'Info' -Title "Total guest users: $($guests.Count)" `
            -Description "Domains: $(($auditData.GuestsByDomain.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object { "$($_.Key): $($_.Value)" }) -join ', ')"

        # Check for untrusted domains
        $trustedDomains = $Config.trustedDomains
        $untrustedGuests = $auditData.GuestSummary | Where-Object { $_.SourceDomain -notin $trustedDomains -and $_.SourceDomain -ne 'unknown' }
        if ($untrustedGuests.Count -gt 0) {
            $untrustedDomains = ($untrustedGuests | Group-Object SourceDomain |
                ForEach-Object { "$($_.Name) ($($_.Count))" }) -join ', '
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'High' -Title "$($untrustedGuests.Count) guests from untrusted domains" `
                -Description "Guest users exist from domains not in the HTT Brands trusted list: $untrustedDomains" `
                -Recommendation "Review these guests. If they're vendor/partner accounts, consider adding the domain to trustedDomains or implementing access reviews." `
                -RemediationPhase "Phase 2"
        }

        if ($auditData.StaleGuests.Count -gt 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Medium' -Title "$($auditData.StaleGuests.Count) stale guests (>$staleThreshold days)" `
                -Description "Guests who haven't signed in for over $staleThreshold days. These represent unnecessary attack surface." `
                -Recommendation "Deploy access reviews to automatically remove stale guests, or disable/delete manually." `
                -RemediationPhase "Phase 4"
        }

        if ($auditData.NeverSignedIn.Count -gt 0) {
            $staleNeverSignedInCount = ($auditData.NeverSignedIn | Where-Object { $_.IsStale }).Count
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Medium' -Title "$($auditData.NeverSignedIn.Count) guests never signed in ($staleNeverSignedInCount stale >$staleThreshold days)" `
                -Description "These guests were invited but never completed sign-in. $staleNeverSignedInCount were created over $staleThreshold days ago and are likely abandoned." `
                -Recommendation "Remove unused guest accounts. Consider setting invitation expiration policies." `
                -RemediationPhase "Phase 2"
        }

        if ($auditData.PendingInvitations.Count -gt 0) {
            Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                -Severity 'Low' -Title "$($auditData.PendingInvitations.Count) pending invitations" `
                -Description "Guest invitations that haven't been accepted yet." `
                -Recommendation "Resend or revoke stale invitations."
        }
    }
    catch {
        Write-Warning "[CTU] Failed to enumerate guests for $TenantKey : $_"
        $null = $ReportContext.Errors.Add("[$TenantKey] Guest enumeration failed: $_")
    }

    # 2. Check for guests in privileged directory roles
    try {
        Write-Host "  Checking privileged role assignments..." -ForegroundColor DarkGray
        $privilegedRoles = @(
            "62e90394-69f5-4237-9190-012177145e10"  # Global Administrator
            "e8611ab8-c189-46e8-94e1-60213ab1f814"  # Privileged Role Administrator
            "194ae4cb-b126-40b2-bd5b-6091b380977d"  # Security Administrator
            "f28a1f94-e44e-46e7-92d9-4d7c1148c0f7"  # SharePoint Administrator
            "29232cdf-9323-42fd-ade2-1d097af3e4de"  # Exchange Administrator
            "fe930be7-5e62-47db-91af-98c3a49a38b1"  # User Administrator
            "b0f54661-2d74-4c50-afa3-1ec803f12efe"  # Billing Administrator
            "9b895d92-2cd3-44c7-9d02-a6ac2d5ea5c3"  # Application Administrator
        )

        foreach ($roleId in $privilegedRoles) {
            try {
                $members = Invoke-CTUGraphRequest `
                    -Uri "https://graph.microsoft.com/v1.0/directoryRoles(roleTemplateId='$roleId')/members" -AllPages

                $guestMembers = $members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.user' -and $_.userType -eq 'Guest' }

                foreach ($gm in $guestMembers) {
                    $roleDef = Invoke-CTUGraphRequest -Uri "https://graph.microsoft.com/v1.0/directoryRoles(roleTemplateId='$roleId')"

                    $auditData.GuestsInPrivRoles += [PSCustomObject]@{
                        GuestId     = $gm.id
                        DisplayName = $gm.displayName
                        UPN         = $gm.userPrincipalName
                        RoleName    = $roleDef.displayName
                        RoleId      = $roleId
                    }

                    Add-CTUFinding -ReportContext $ReportContext -Domain $domain -TenantKey $TenantKey `
                        -Severity 'Critical' -Title "Guest in privileged role: $($roleDef.displayName)" `
                        -Description "Guest '$($gm.displayName)' ($($gm.userPrincipalName)) has the '$($roleDef.displayName)' role." `
                        -Recommendation "IMMEDIATELY remove guest from this privileged role. If cross-tenant admin access is needed, use PIM eligible assignments with MFA + justification." `
                        -RemediationPhase "Phase 2"
                }
            }
            catch {
                # Role may not be activated in tenant - skip silently
            }
        }
    }
    catch {
        Write-Warning "[CTU] Failed to check privileged roles for $TenantKey : $_"
    }

    # Export guest inventory CSV
    if ($auditData.GuestSummary.Count -gt 0) {
        $guestCsvPath = Join-Path $ReportContext.ReportDir "guests_$TenantKey.csv"
        $auditData.GuestSummary | Export-Csv $guestCsvPath -NoTypeInformation -Encoding utf8
        Write-Host "  Guest inventory exported: $guestCsvPath" -ForegroundColor DarkGray
    }

    Save-CTUTenantData -ReportContext $ReportContext -TenantKey $TenantKey -Domain $domain -Data $auditData
    return $auditData
}

Export-ModuleMember -Function 'Invoke-CTUGuestInventoryAudit'
