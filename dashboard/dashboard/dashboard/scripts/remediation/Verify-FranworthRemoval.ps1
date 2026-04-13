<#
.SYNOPSIS
    Verify Franworth access removal was successful.
.DESCRIPTION
    Post-execution spot check: partner policy removed, guests disabled.
#>
$ErrorActionPreference = "Continue"
Import-Module (Join-Path $PSScriptRoot ".." ".." "modules" "CTU.Core" "CTU.Core.psm1") -Force

$config     = Get-CTUConfig
$GraphBase  = "https://graph.microsoft.com/v1.0"

$verificationResults = @{
    Timestamp       = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    PartnerPolicy   = $null
    TLLGuests       = @()
    HTTGuests       = @()
    AllPassed       = $true
}

# ── TLL Verification ─────────────────────────────────────────────────────
Write-Host "`n=== TLL Verification ===" -ForegroundColor Cyan

Connect-CTUTenant -TenantKey 'TLL' -Config $config | Out-Null

# 1. Partner policy check
Write-Host "`n--- Partner Policy Check ---"
try {
    $response = Invoke-CTUGraphRequest `
        -Uri "$GraphBase/policies/crossTenantAccessPolicy/partners/248c9920-7745-4f81-8e18-1a5de9935bbd"
    Write-Host '❌ FAIL: Franworth partner policy STILL EXISTS in TLL' -ForegroundColor Red
    $verificationResults.PartnerPolicy = 'FAIL — still exists'
    $verificationResults.AllPassed = $false
}
catch {
    if ("$_" -match "404|NotFound") {
        Write-Host '✅ PASS: Franworth partner policy REMOVED from TLL' -ForegroundColor Green
        $verificationResults.PartnerPolicy = 'PASS — removed'
    }
    else {
        Write-Host "⚠️ ERROR checking partner policy: $_" -ForegroundColor Yellow
        $verificationResults.PartnerPolicy = "ERROR: $_"
        $verificationResults.AllPassed = $false
    }
}

# 2. TLL guest spot checks (all 15)
Write-Host "`n--- TLL Guest Verification (all 15) ---"
$TLLGuestIds = [ordered]@{
    '181f9b3e-b4fc-4007-ad8b-5f9221ee710a' = 'Josh Kaminski'
    '32009df7-0e5f-4780-abc7-9a379a6d1ab4' = 'Josh Titler'
    '4b606f89-d19e-4bcd-b080-20dbc7e177e4' = 'Holly Elliott'
    '8bcd8d62-7722-4bea-8bd2-9814f25266d2' = 'Melanie Calender'
    'f7f6b30c-ed54-40de-be7a-82211dc7b824' = 'aaron (pending)'
    'c60c5dff-9341-484a-b0e0-48191624c103' = 'Stephani Mitchell'
    'cfdc78a2-db03-4d9f-a574-2940e9e32ef5' = 'bshelley (pending)'
    '4004c175-a1d9-4da1-880d-1809bc3a0dda' = 'Bryan Farida'
    '7e45e0f8-56a2-4fdd-94ef-135cca509b53' = 'Jonathan Koudelka'
    '6e1f2131-f2f2-41ea-b2a6-3e6b8f887fe8' = 'Jen Ling'
    '59fd60f3-3753-493a-977a-e60e47c8af0e' = 'Karen Meek'
    'bcf552af-c84a-431f-b632-fc39923196c3' = 'Justine C Crispin'
    '22b1a620-af4e-4594-a0c6-0e5c591d3cdc' = 'Shelley Blaszak'
    'd39ea7b2-60f6-442d-a500-e1b6684be54e' = 'Mike Wernel'
    '3d3b52d4-0076-46e9-a687-c84626a63853' = 'JT Singh'
}

foreach ($entry in $TLLGuestIds.GetEnumerator()) {
    try {
        $user = Invoke-CTUGraphRequest `
            -Uri "$GraphBase/users/$($entry.Key)?`$select=displayName,accountEnabled"
        if ($user.accountEnabled -eq $false) {
            Write-Host ("✅ PASS: {0} — disabled" -f $user.displayName) -ForegroundColor Green
            $verificationResults.TLLGuests += @{
                UserId = $entry.Key; DisplayName = $user.displayName
                AccountEnabled = $false; Result = 'PASS'
            }
        }
        else {
            Write-Host ("❌ FAIL: {0} — still enabled!" -f $user.displayName) -ForegroundColor Red
            $verificationResults.TLLGuests += @{
                UserId = $entry.Key; DisplayName = $user.displayName
                AccountEnabled = $true; Result = 'FAIL'
            }
            $verificationResults.AllPassed = $false
        }
    }
    catch {
        Write-Host ("⚠️ ERROR: {0} ({1}): {2}" -f $entry.Value, $entry.Key, $_) -ForegroundColor Yellow
        $verificationResults.TLLGuests += @{
            UserId = $entry.Key; DisplayName = $entry.Value
            AccountEnabled = 'unknown'; Result = "ERROR: $_"
        }
        $verificationResults.AllPassed = $false
    }
}

try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}

# ── HTT Verification ─────────────────────────────────────────────────────
Write-Host "`n=== HTT Verification ===" -ForegroundColor Cyan
Write-Host "`n--- HTT Guest Verification (all 4) ---"

Connect-CTUTenant -TenantKey 'HTT' -Config $config | Out-Null

$HTTGuestIds = [ordered]@{
    '706934eb-94c1-4305-ac36-e5214aafb005' = 'Glenna Schleusener'
    '637da198-e1e2-457e-897e-ac32c3bf6e60' = 'Kristen Sherwood'
    '25401e0a-ff9e-471d-8d8d-8afbe52c4bc2' = 'josh (pending)'
    '59c90b2d-8cbb-4358-b9d2-48d272efd17e' = 'ben (pending)'
}

foreach ($entry in $HTTGuestIds.GetEnumerator()) {
    try {
        $user = Invoke-CTUGraphRequest `
            -Uri "$GraphBase/users/$($entry.Key)?`$select=displayName,accountEnabled"
        if ($user.accountEnabled -eq $false) {
            Write-Host ("✅ PASS: {0} — disabled" -f $user.displayName) -ForegroundColor Green
            $verificationResults.HTTGuests += @{
                UserId = $entry.Key; DisplayName = $user.displayName
                AccountEnabled = $false; Result = 'PASS'
            }
        }
        else {
            Write-Host ("❌ FAIL: {0} — still enabled!" -f $user.displayName) -ForegroundColor Red
            $verificationResults.HTTGuests += @{
                UserId = $entry.Key; DisplayName = $user.displayName
                AccountEnabled = $true; Result = 'FAIL'
            }
            $verificationResults.AllPassed = $false
        }
    }
    catch {
        Write-Host ("⚠️ ERROR: {0} ({1}): {2}" -f $entry.Value, $entry.Key, $_) -ForegroundColor Yellow
        $verificationResults.HTTGuests += @{
            UserId = $entry.Key; DisplayName = $entry.Value
            AccountEnabled = 'unknown'; Result = "ERROR: $_"
        }
        $verificationResults.AllPassed = $false
    }
}

try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}

# ── Summary ──────────────────────────────────────────────────────────────
$tllPass = @($verificationResults.TLLGuests | Where-Object { $_.Result -eq 'PASS' }).Count
$httPass = @($verificationResults.HTTGuests | Where-Object { $_.Result -eq 'PASS' }).Count
$totalChecks = $TLLGuestIds.Count + $HTTGuestIds.Count + 1  # +1 for partner policy
$totalPass   = $tllPass + $httPass + $(if ($verificationResults.PartnerPolicy -match 'PASS') { 1 } else { 0 })

Write-Host @"

  ╔════════════════════════════════════════════════════╗
  ║   Verification Summary                            ║
  ╠════════════════════════════════════════════════════╣
  ║   Partner Policy:  $($verificationResults.PartnerPolicy.PadRight(28))║
  ║   TLL Guests:      $("$tllPass / $($TLLGuestIds.Count) disabled".PadRight(28))║
  ║   HTT Guests:      $("$httPass / $($HTTGuestIds.Count) disabled".PadRight(28))║
  ║   Overall:         $("$totalPass / $totalChecks passed".PadRight(28))║
  ╚════════════════════════════════════════════════════╝

"@ -ForegroundColor $(if ($verificationResults.AllPassed) { 'Green' } else { 'Red' })

# Output results as JSON for capture
$verificationResults | ConvertTo-Json -Depth 5
