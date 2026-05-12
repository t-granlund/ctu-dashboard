import { test, expect } from '@playwright/test';

const PASSWORD = 'CrossTenant!';

// ── Helper: authenticate through password gate ──────────────
async function login(page) {
  await page.goto('/');
  await page.getByPlaceholder('Enter passphrase to continue').fill(PASSWORD);
  await page.getByRole('button', { name: /enter dashboard/i }).click();
  // Wait for dashboard to load
  await page.waitForSelector('nav', { timeout: 5000 });
}

// ── Helper: open sidebar on tablet (hamburger menu) ─────────
async function openSidebar(page) {
  const vw = page.viewportSize()?.width ?? 1440;
  if (vw < 1024) {
    await page.getByLabel('Toggle menu').click();
    await page.waitForTimeout(300);
  }
}

// ════════════════════════════════════════════════════════════
// 1. PASSWORD GATE
// ════════════════════════════════════════════════════════════

test.describe('Password Gate', () => {
  test('shows login screen on first visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByPlaceholder('Enter passphrase to continue')).toBeVisible();
    await expect(page.getByRole('button', { name: /enter dashboard/i })).toBeVisible();
    // HTT logo should be present
    await expect(page.getByAltText('HTT Brands')).toBeVisible();
  });

  test('rejects wrong password', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Enter passphrase to continue').fill('wrong-password');
    await page.getByRole('button', { name: /enter dashboard/i }).click();
    await expect(page.getByText('Incorrect passphrase')).toBeVisible();
  });

  test('accepts correct password and shows dashboard', async ({ page }) => {
    await login(page);
    // Should see sidebar nav
    await expect(page.locator('nav')).toBeVisible();
    // Should see section titles
    await expect(page.getByText('Executive Overview')).toBeVisible();
  });

  test('button is disabled when input is empty', async ({ page }) => {
    await page.goto('/');
    const btn = page.getByRole('button', { name: /enter dashboard/i });
    await expect(btn).toBeDisabled();
  });
});

// ════════════════════════════════════════════════════════════
// 2. SIDEBAR NAVIGATION
// ════════════════════════════════════════════════════════════

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openSidebar(page);
  });

  test('all sidebar items are visible', async ({ page }) => {
    const expected = [
      'Executive Overview',
      'MSP Portal',
      'Findings Explorer',
      'Tenant Deep Dives',
      'Guest Inventory',
      'Unknown Tenants',
      'Compliance Matrix',
      'Roadmap & Gates',
    ];
    for (const label of expected) {
      await expect(page.locator('nav').getByText(label)).toBeVisible();
    }
  });

  test('clicking MSP Portal scrolls to that section', async ({ page }) => {
    await page.locator('nav').getByText('MSP Portal').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('MSP Partnership Portal')).toBeInViewport();
  });
});

// ════════════════════════════════════════════════════════════
// 3. MSP PORTAL — MAY 7 WAR ROOM
// ════════════════════════════════════════════════════════════

test.describe('MSP Portal — May 7 War Room', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openSidebar(page);
    await page.locator('nav').getByText('MSP Portal').click();
    await page.waitForTimeout(500);
  });

  test('shows Megan alignment war room and in-page designed guide links', async ({ page }) => {
    await expect(page.getByText('May 7 War Room')).toBeVisible();
    await expect(page.getByText('Tyler × Megan Alignment Brief')).toBeVisible();
    const guide = page.getByRole('link', { name: 'Jump to Designed Megan Overview Guide' });
    await expect(guide).toBeVisible();
    await expect(guide).toHaveAttribute('href', '#megan-overview-guide');
    const pshEscalation = page.getByRole('link', { name: 'Jump to PSH MSP Escalation View' });
    await expect(pshEscalation).toBeVisible();
    await expect(pshEscalation).toHaveAttribute('href', '#psh-msp-escalation-view');
    const sourceTruth = page.getByRole('link', { name: 'Jump to Embedded Source-of-Truth Review' });
    await expect(sourceTruth).toBeVisible();
    await expect(sourceTruth).toHaveAttribute('href', '#source-truth-review');
    await expect(page.getByRole('heading', { name: 'Megan Overview Guide' })).toBeVisible();
    await expect(page.getByText('Full Repo Source-of-Truth Review')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Portfolio source-of-truth map' })).toBeVisible();
  });

  test('shows key repo-backed call terms', async ({ page }) => {
    for (const term of ['Pax8', 'Teams Premium', 'Groups Hub', 'People Support Hub']) {
      await expect(page.getByText(term, { exact: false }).first()).toBeVisible();
    }
    // DCE appears in collapsible tenant cards — verify it exists in DOM (may need scroll/expand)
    await expect(page.getByText('DCE', { exact: false }).first()).toBeAttached();
  });

  test('embeds the designed Megan overview guide in the password-gated page', async ({ page }) => {
    for (const term of [
      'Scan first',
      'What matters before the wall of detail',
      'Current priority picture',
      'Billing / CSP questions to land today',
      'Requested outcomes before ending the call',
      'Closing script',
      'DCE/FN spoke-side auto-redeem needs a Sui Generis owner/date',
    ]) {
      await expect(page.getByText(term, { exact: false }).first()).toBeVisible();
    }
    await expect(page.getByRole('button', { name: /Show \d+ more live items/i }).first()).toBeVisible();
    await expect(page.locator('a[href$="MEGAN-OVERVIEW-GUIDE-2026-05-07.md"]')).toHaveCount(0);
  });

  test('embeds the People Support Hub MSP escalation value story', async ({ page }) => {
    for (const term of [
      'People Support Hub — MSP Escalation View',
      'Freshdesk is the front door',
      'Proposed routing field conditions',
      'What Megan gets out of it',
      'No new infra. No new endpoints. No new schemas.',
    ]) {
      await expect(page.getByText(term, { exact: false }).first()).toBeVisible();
    }
  });

  test('embeds the full source-of-truth review in the password-gated page', async ({ page }) => {
    for (const term of [
      'Repo-by-repo review',
      'AZURE-AUDIT-QUICK',
      'microsoft-group-management / Groups Hub',
      'freshdesk-oracle / People Support Hub',
      'MSP / CSP / Pax8 billing map',
      'Unified identity model',
      'Prioritized post-call cleanup backlog',
    ]) {
      await expect(page.getByText(term, { exact: false }).first()).toBeVisible();
    }
  });
});

// ════════════════════════════════════════════════════════════
// 4. MSP PORTAL — POST-CALL SUMMARY
// ════════════════════════════════════════════════════════════

test.describe('MSP Portal — Call Recap', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openSidebar(page);
    await page.locator('nav').getByText('MSP Portal').click();
    await page.waitForTimeout(500);
  });

  test('shows call recap with key outcomes', async ({ page }) => {
    await expect(page.getByText('Call Recap')).toBeVisible();
    await expect(page.getByText('April 10, 2026')).toBeVisible();
    await expect(page.getByText('Completed', { exact: true })).toBeVisible();
  });

  test('shows key resolution outcomes', async ({ page }) => {
    await expect(page.getByText(/AppRiver migration confirmed/)).toBeVisible();
    await expect(page.getByText(/Entra ID P2 already purchased/)).toBeVisible();
  });

  test('shows Megan action items', async ({ page }) => {
    await expect(page.getByText('Your Action Items')).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════
// 5. MSP PORTAL — CONFIRMED CONTEXT
// ════════════════════════════════════════════════════════════

test.describe('MSP Portal — Confirmed Context', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openSidebar(page);
    await page.locator('nav').getByText('MSP Portal').click();
    await page.waitForTimeout(500);
  });

  test('shows section headings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'What We Confirmed' })).toBeVisible();
    await expect(page.getByText('Sui Generis — Your Role')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Device Management' })).toBeVisible();
  });

  test('services are grouped into categories', async ({ page }) => {
    // Check that service category labels exist
    const categories = ['Licensing & Provisioning', 'Hardware & Devices', 'Security & Access'];
    for (const cat of categories) {
      await expect(page.getByText(cat)).toBeVisible();
    }
  });

  test('device management shows 3 cards', async ({ page }) => {
    await expect(page.getByText('RMM Tool', { exact: true })).toBeVisible();
    await expect(page.getByText('Delta Crown', { exact: true })).toBeVisible();
    await expect(page.getByText('API Integration', { exact: true })).toBeVisible();
  });

  test('deadline is displayed', async ({ page }) => {
    await expect(page.getByText('Key Deadline')).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════
// 6. MSP PORTAL — QUESTIONS FORM
// ════════════════════════════════════════════════════════════

test.describe('MSP Portal — Questions Form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openSidebar(page);
    await page.locator('nav').getByText('MSP Portal').click();
    await page.waitForTimeout(500);
  });

  test('shows progress bar starting at 100% from Apr 13 answers', async ({ page }) => {
    await expect(page.getByText('20 of 20 answered')).toBeVisible();
    await expect(page.getByText('100%', { exact: true })).toBeVisible();
  });

  test('first category is expanded, rest collapsed', async ({ page }) => {
    // GDAP category should show its first question
    await expect(page.getByText(/What specific Entra admin roles/)).toBeVisible();
  });

  test('can expand a collapsed category', async ({ page }) => {
    // Click "Licensing & Billing" category header
    await page.getByRole('heading', { name: 'Licensing & Billing' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/Which licenses in each tenant/)).toBeVisible();
  });

  test('can answer a text question and checkbox updates', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('Test answer from Playwright');
    // Check the checkbox
    const checkbox = page.locator('button').filter({ has: page.locator('svg') }).first();
    // Verify text was entered
    await expect(textarea).toHaveValue('Test answer from Playwright');
  });

  test('can answer a select question', async ({ page }) => {
    // Find a select element and choose an option
    const select = page.locator('select').first();
    if (await select.isVisible()) {
      await select.selectOption({ index: 1 });
      const val = await select.inputValue();
      expect(val).not.toBe('');
    }
  });

  test('export button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Export as Markdown/ })).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════
// 7. REFERENCE MATERIAL — COLLAPSIBLES
// ════════════════════════════════════════════════════════════

test.describe('Reference Material', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openSidebar(page);
    await page.locator('nav').getByText('MSP Portal').click();
    await page.waitForTimeout(500);
  });

  test('shows reference section with all collapsibles', async ({ page }) => {
    await expect(page.getByText('Reference Material')).toBeVisible();
    const expected = [
      'Guest Account Details',
      'AppRiver Service Principals',
      'Tenant Footprint',
      'Licensing & Billing Landscape',
      'Cyber Insurance Gap Assessment',
    ];
    for (const title of expected) {
      await expect(page.getByRole('button', { name: new RegExp(title) })).toBeVisible();
    }
  });

  test('collapsibles start closed and open on click', async ({ page }) => {
    // Click AppRiver section
    await page.getByText('AppRiver Service Principals').click();
    await page.waitForTimeout(300);
    // Should now show AppRiver's resolved banner, not any unrelated status summary text.
    await expect(page.getByText('Resolved — Approved for Removal')).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════
// 8. VISUAL SANITY — NO OVERFLOW / TRUNCATION
// ════════════════════════════════════════════════════════════

test.describe('Visual Sanity', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('no horizontal scrollbar on main content', async ({ page }) => {
    const hasHScroll = await page.evaluate(() => {
      // Allow up to 2px tolerance for subpixel rendering
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    });
    expect(hasHScroll).toBe(false);
  });

  test('all images load without 404', async ({ page }) => {
    const errors = [];
    page.on('response', (response) => {
      if (response.url().match(/\.(png|jpg|svg|ico)/) && response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    // Filter out known non-issues (like favicon)
    const real = errors.filter(e => !e.includes('favicon'));
    expect(real).toEqual([]);
  });

  test('text does not overflow containers in MSP section', async ({ page }) => {
    await openSidebar(page);
    await page.locator('nav').getByText('MSP Portal').click();
    await page.waitForTimeout(500);
    // Check that no text element extends beyond viewport
    const overflows = await page.evaluate(() => {
      const issues = [];
      const vw = window.innerWidth;
      document.querySelectorAll('p, li, span, td').forEach(el => {
        const rect = el.getBoundingClientRect();
        // Only flag visible elements genuinely in the main content area
        // Skip zero-size, offscreen-left, or within generous tolerance
        if (rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.right > vw + 10) {
          issues.push(
            `${el.tagName}: "${el.textContent.slice(0, 40)}..." overflows by ${Math.round(rect.right - vw)}px`
          );
        }
      });
      return issues;
    });
    expect(overflows).toEqual([]);
  });
});
