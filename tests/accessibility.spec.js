import { test, expect } from '@playwright/test';

const PASSWORD = 'CrossTenant!';

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

test.describe('Accessibility and design-system guardrails', () => {
  test('password gate exposes landmarks, labels, focus, and alert semantics', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByLabel('Access Passphrase')).toBeVisible();

    const passphrase = page.getByLabel('Access Passphrase');
    await expect(passphrase).toBeFocused();
    const focusedOutline = await passphrase.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });
    const hasOutline = focusedOutline.outlineStyle !== 'none' && parseFloat(focusedOutline.outlineWidth) >= 1;
    const hasRing = focusedOutline.boxShadow !== 'none';
    expect(hasOutline || hasRing).toBe(true);

    await page.getByLabel('Access Passphrase').fill('wrong-password');
    await page.getByRole('button', { name: /enter dashboard/i }).click();
    await expect(page.getByRole('alert')).toContainText('Incorrect passphrase');
  });

  test('dashboard shell has accessible landmarks and active navigation state', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Dashboard sections' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Executive Overview/i })).toHaveAttribute('aria-current', 'page');
  });

  test('MSP portal does not expose raw markdown guide links', async ({ page }) => {
    await openMspPortal(page);
    await expect(page.locator('a[href$=".md"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Jump to Designed Megan Overview Guide' })).toHaveAttribute('href', '#megan-overview-guide');
    await expect(page.getByRole('link', { name: 'Jump to Embedded Source-of-Truth Review' })).toHaveAttribute('href', '#source-truth-review');
  });

  test('interactive controls have accessible names and usable visible target sizes', async ({ page }) => {
    await openMspPortal(page);
    const issues = await page.evaluate(() => {
      const results = [];
      const controls = [...document.querySelectorAll('button, a[href], input, select, textarea')]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        });

      for (const el of controls) {
        const rect = el.getBoundingClientRect();
        const label = el.getAttribute('aria-label')
          || el.getAttribute('title')
          || document.querySelector(`label[for="${el.id}"]`)?.textContent
          || el.closest('label')?.textContent
          || el.textContent;
        if (!label?.trim()) {
          results.push(`${el.tagName} has no accessible name`);
        }
        if ((el.tagName === 'BUTTON' || el.tagName === 'A') && (rect.width < 24 || rect.height < 24)) {
          results.push(`${el.tagName} "${label?.trim().slice(0, 40)}" target is ${Math.round(rect.width)}x${Math.round(rect.height)}`);
        }
      }
      return results;
    });
    expect(issues).toEqual([]);
  });

  test('tables in the designed call content have accessible captions', async ({ page }) => {
    await openMspPortal(page);
    const captionIssues = await page.evaluate(() => {
      const sections = ['megan-overview-guide', 'source-truth-review'];
      return sections.flatMap((id) => [...document.querySelectorAll(`#${id} table`)]
        .map((table, index) => ({ index, caption: table.caption?.textContent?.trim() }))
        .filter((item) => !item.caption)
        .map((item) => `${id} table ${item.index} is missing a caption`));
    });
    expect(captionIssues).toEqual([]);
  });

  test('document structure avoids duplicate IDs and giant heading jumps', async ({ page }) => {
    await login(page);
    const structureIssues = await page.evaluate(() => {
      const issues = [];
      const ids = [...document.querySelectorAll('[id]')].map((el) => el.id).filter(Boolean);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicates.length) issues.push(`Duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);

      const headingLevels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
        .map((el) => Number(el.tagName.slice(1)));
      for (let i = 1; i < headingLevels.length; i += 1) {
        if (headingLevels[i] - headingLevels[i - 1] > 1) {
          issues.push(`Heading jump h${headingLevels[i - 1]} -> h${headingLevels[i]}`);
          break;
        }
      }
      return issues;
    });
    expect(structureIssues).toEqual([]);
  });
});
