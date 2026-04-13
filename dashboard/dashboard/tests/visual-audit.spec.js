import { test } from '@playwright/test';

const PASSWORD = 'CrossTenant!';

async function login(page) {
  await page.goto('/');
  await page.getByPlaceholder('Enter passphrase to continue').fill(PASSWORD);
  await page.getByRole('button', { name: /enter dashboard/i }).click();
  await page.waitForSelector('nav', { timeout: 5000 });
}

async function openSidebar(page) {
  const vw = page.viewportSize()?.width ?? 1440;
  if (vw < 1024) {
    await page.getByLabel('Toggle menu').click();
    await page.waitForTimeout(300);
  }
}

test('Visual Audit — Full Page Screenshots', async ({ page }) => {
  // 1. Login screen
  await page.goto('/');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/01-login.png', fullPage: true });

  // 2. Login and go to MSP Portal
  await login(page);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/02-executive-overview.png', fullPage: true });

  // 3. Navigate to MSP Portal
  await openSidebar(page);
  await page.locator('nav').getByText('MSP Portal').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/03-msp-portal-top.png', fullPage: false });

  // 4. Scroll through MSP Portal sections
  // Call Recap
  const callRecap = page.getByText('Call Recap').first();
  if (await callRecap.isVisible()) {
    await callRecap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/04-call-recap.png', fullPage: false });
  }

  // Confirmed Context
  const confirmed = page.getByText('What We Confirmed').first();
  if (await confirmed.isVisible()) {
    await confirmed.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/05-confirmed-context.png', fullPage: false });
  }

  // Services section
  const services = page.getByText('Licensing & Provisioning').first();
  if (await services.isVisible()) {
    await services.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/06-services-grouped.png', fullPage: false });
  }

  // Device Management
  const devices = page.getByRole('heading', { name: 'Device Management' }).first();
  if (await devices.isVisible()) {
    await devices.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/07-device-management.png', fullPage: false });
  }

  // In Progress
  const inProgress = page.getByRole('heading', { name: 'In Progress' }).first();
  if (await inProgress.isVisible()) {
    await inProgress.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/08-in-progress.png', fullPage: false });
  }

  // Questions section
  const questions = page.getByText('Follow-Up Questions').first();
  if (await questions.isVisible()) {
    await questions.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/09-questions.png', fullPage: false });
  }

  // Reference material
  const reference = page.getByText('Reference Material').first();
  if (await reference.isVisible()) {
    await reference.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/10-reference-material.png', fullPage: false });
  }

  // 5. Full MSP portal page (long screenshot)
  await openSidebar(page);
  await page.locator('nav').getByText('MSP Portal').click();
  await page.waitForTimeout(500);
  // Scroll to top of MSP section
  await page.evaluate(() => {
    const el = document.getElementById('msp-review');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/11-msp-full-page.png', fullPage: true });
});
