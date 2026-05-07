import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PASSWORD = 'CrossTenant!';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function login(page) {
  await page.goto('/');
  await page.getByPlaceholder('Enter passphrase to continue').fill(PASSWORD);
  await page.getByRole('button', { name: /enter dashboard/i }).click();
  await page.waitForSelector('nav', { timeout: 5000 });
}

async function openMspPortal(page) {
  await login(page);
  const vw = page.viewportSize()?.width ?? 1440;
  if (vw < 1024) {
    await page.getByLabel('Toggle menu').click();
  }
  await page.locator('nav').getByText('MSP Portal').click();
  await page.waitForTimeout(300);
}

async function expectNoAxeViolations(page, options = {}) {
  const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (options.include) builder.include(options.include);
  const { violations } = await builder.analyze();

  const formatted = violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      summary: node.failureSummary,
    })),
  }));

  expect(formatted).toEqual([]);
}

test.describe('Axe WCAG audit', () => {
  test('password gate has no WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await expectNoAxeViolations(page);
  });

  test('executive overview has no WCAG A/AA violations', async ({ page }) => {
    await login(page);
    await expectNoAxeViolations(page, { include: '#overview' });
  });

  test('MSP portal top has no WCAG A/AA violations', async ({ page }) => {
    await openMspPortal(page);
    await expectNoAxeViolations(page, { include: '#msp-review' });
  });

  test('designed Megan overview guide has no WCAG A/AA violations', async ({ page }) => {
    await openMspPortal(page);
    await page.locator('#megan-overview-guide').scrollIntoViewIfNeeded();
    await expectNoAxeViolations(page, { include: '#megan-overview-guide' });
  });

  test('source-of-truth review has no WCAG A/AA violations', async ({ page }) => {
    await openMspPortal(page);
    await page.locator('#source-truth-review').scrollIntoViewIfNeeded();
    await expectNoAxeViolations(page, { include: '#source-truth-review' });
  });
});
