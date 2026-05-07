import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PASSWORD = 'CrossTenant!';
const THEME_KEY = 'ctu-dashboard-theme';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag2aaa'];

async function startWithTheme(page, theme = 'dark') {
  await page.goto('/');
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
    window.location.reload();
  }, { key: THEME_KEY, value: theme });
  await page.waitForLoadState('domcontentloaded');
}

async function login(page) {
  await page.getByPlaceholder('Enter passphrase to continue').fill(PASSWORD);
  await page.getByRole('button', { name: /enter dashboard/i }).click();
  await page.waitForSelector('nav', { timeout: 5000 });
}

async function expectNoAxeViolations(page, include) {
  const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (include) builder.include(include);
  const { violations } = await builder.analyze();
  expect(violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))).toEqual([]);
}

test.describe('Theme toggle', () => {
  test('is available on the password gate and persists light mode', async ({ page }) => {
    await startWithTheme(page, 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('is available in the dashboard header and can return to dark mode', async ({ page }) => {
    await startWithTheme(page, 'light');
    await login(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('light theme has no automated WCAG 2.2 AA / AAA violations on the portal', async ({ page }) => {
    await startWithTheme(page, 'light');
    await login(page);
    const vw = page.viewportSize()?.width ?? 1440;
    if (vw < 1024) await page.getByLabel('Toggle menu').click();
    await page.locator('nav').getByText('MSP Portal').click();
    await page.waitForTimeout(300);
    await expectNoAxeViolations(page, '#msp-review');
  });
});
