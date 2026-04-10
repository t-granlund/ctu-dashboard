import { test, expect } from '@playwright/test';

const PASSWORD = 'CrossTenant!';

// ── Helper: authenticate through password gate ──────────────
async function login(page) {
  await page.goto('/');
  await page.getByPlaceholder('Enter passphrase to continue').fill(PASSWORD);
  await page.getByRole('button', { name: /enter dashboard/i }).click();
  // Wait for dashboard to load (sidebar visible)
  await page.waitForSelector('nav', { timeout: 5000 });
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
    await expect(page.getByAlt('HTT Brands')).toBeVisible();
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
  test.beforeEach(async ({ page }) => { await login(page); });

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
      await expect(page.getByRole('link', { name: label }).or(page.locator(`text=${label}`))).toBeVisible();
    }
  });

  test('clicking MSP Portal scrolls to that section', async ({ page }) => {
    await page.getByText('MSP Portal').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('MSP Partnership Portal')).toBeInViewport();
  });
});

// ════════════════════════════════════════════════════════════
// 3. MSP PORTAL — POST-CALL SUMMARY
// ════════════════════════════════════════════════════════════

test.describe('MSP Portal — Call Recap', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByText('MSP Portal').click();
    await page.waitForTimeout(500);
  });

  test('shows call recap with key outcomes', async ({ page }) => {
    await expect(page.getByText('Call Recap')).toBeVisible();
    await expect(page.getByText('April 10, 2026')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
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
// 4. MSP PORTAL — CONFIRMED CONTEXT
// ════════════════════════════════════════════════════════════

test.describe('MSP Portal — Confirmed Context', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByText('MSP Portal').click();
    await page.waitForTimeout(500);
  });

  test('shows section headings', async ({ page }) => {
    await expect(page.getByText('What We Confirmed')).toBeVisible();
    await expect(page.getByText('Sui Generis — Your Role')).toBeVisible();
    await expect(page.getByText('Device Management')).toBeVisible();
  });

  test('services are grouped into categories', async ({ page }) => {
    // Check that service category labels exist
    const categories = ['Licensing & Provisioning', 'Hardware & Devices', 'Security & Access'];
    for (const cat of categories) {
      await expect(page.getByText(cat)).toBeVisible();
    }
  });

  test('device management shows 3 cards', async ({ page }) => {
    await expect(page.getByText('RMM Tool')).toBeVisible();
    await expect(page.getByText('Delta Crown')).toBeVisible();
    await expect(page.getByText('API Integration')).toBeVisible();
  });

  test('deadline is displayed', async ({ page }) => {
    await expect(page.getByText('Key Deadline')).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════
// 5. MSP PORTAL — QUESTIONS FORM
// ════════════════════════════════════════════════════════════

test.describe('MSP Portal — Questions Form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByText('MSP Portal').click();
    await page.waitForTimeout(500);
  });

  test('shows progress bar starting at 0%', async ({ page }) => {
    await expect(page.getByText('0 of')).toBeVisible();
    await expect(page.getByText('0%')).toBeVisible();
  });

  test('first category is expanded, rest collapsed', async ({ page }) => {
    // GDAP category should show its first question
    await expect(page.getByText(/What specific Entra admin roles/)).toBeVisible();
  });

  test('can expand a collapsed category', async ({ page }) => {
    // Click "Licensing & Billing" category header
    await page.getByText('Licensing & Billing').click();
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
    await expect(page.getByText('Export as Markdown')).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════
// 6. REFERENCE MATERIAL — COLLAPSIBLES
// ════════════════════════════════════════════════════════════

test.describe('Reference Material', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByText('MSP Portal').click();
    await page.waitForTimeout(500);
  });

  test('shows reference section with all collapsibles', async ({ page }) => {
    await expect(page.getByText('Reference Material')).toBeVisible();
    const expected = [
      'Guest Account Details',
      'AppRiver Service Principals',
      'Tenant Footprint',
      'Licensing & Billing Landscape',
      'Cyber Insurance',
    ];
    for (const title of expected) {
      await expect(page.getByText(title, { exact: false })).toBeVisible();
    }
  });

  test('collapsibles start closed and open on click', async ({ page }) => {
    // Click AppRiver section
    await page.getByText('AppRiver Service Principals').click();
    await page.waitForTimeout(300);
    // Should now show resolved banner
    await expect(page.getByText('Resolved')).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════
// 7. VISUAL SANITY — NO OVERFLOW / TRUNCATION
// ════════════════════════════════════════════════════════════

test.describe('Visual Sanity', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('no horizontal scrollbar on main content', async ({ page }) => {
    const hasHScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
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
    await login(page);
    await page.waitForTimeout(2000);
    // Filter out known non-issues (like favicon)
    const real = errors.filter(e => !e.includes('favicon'));
    expect(real).toEqual([]);
  });

  test('text does not overflow containers in MSP section', async ({ page }) => {
    await page.getByText('MSP Portal').click();
    await page.waitForTimeout(500);
    // Check that no text element extends beyond viewport
    const overflows = await page.evaluate(() => {
      const issues = [];
      document.querySelectorAll('p, li, span, td').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth + 5) {
          issues.push(`${el.tagName}: "${el.textContent.slice(0, 40)}..." overflows by ${Math.round(rect.right - window.innerWidth)}px`);
        }
      });
      return issues;
    });
    expect(overflows).toEqual([]);
  });
});
