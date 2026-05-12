import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PASSWORD = 'CrossTenant!';
const THEME_KEY = 'ctu-dashboard-theme';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag2aaa'];
const MSP_SECTIONS = ['#msp-review', '#msp-action-register', '#msp-decisions'];

async function loginWithTheme(page, theme) {
  await page.goto('/');
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
    window.location.reload();
  }, { key: THEME_KEY, value: theme });
  await page.waitForLoadState('domcontentloaded');
  await page.getByPlaceholder('Enter passphrase to continue').fill(PASSWORD);
  await page.getByRole('button', { name: /enter dashboard/i }).click();
  await page.waitForSelector('nav', { timeout: 5000 });
}

async function expectNoAxeViolations(page, include) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .include(include)
    .analyze();

  expect(violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))).toEqual([]);
}

test.describe('MSP full portal dark/light accessibility sweep', () => {
  for (const theme of ['dark', 'light']) {
    test(`${theme} theme has no WCAG 2.2 AA / automated AAA violations across MSP portal sections`, async ({ page }) => {
      await loginWithTheme(page, theme);
      const vw = page.viewportSize()?.width ?? 1440;
      if (vw < 1024) await page.getByLabel('Toggle menu').click();
      await page.locator('nav').getByText('MSP Portal').click();
      await page.waitForTimeout(300);

      for (const selector of MSP_SECTIONS) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        await expectNoAxeViolations(page, selector);
      }
    });
  }
});
