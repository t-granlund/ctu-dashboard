import { test, expect } from '@playwright/test';

const PASSWORD = 'CrossTenant!';
const MIN_BODY_FONT_SIZE = 12;
const MIN_AAA_CONTRAST = 7;

async function login(page) {
  await page.addInitScript(() => localStorage.setItem('ctu-dashboard-theme', 'dark'));
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

test.describe('WCAG AAA manual guardrail proxies', () => {
  test('all visible body text stays readable and avoids tiny-text traps', async ({ page }) => {
    await openMspPortal(page);
    const issues = await page.evaluate((minBodyFontSize) => {
      const ignoredTags = new Set(['SCRIPT', 'STYLE', 'SVG', 'PATH']);
      return [...document.querySelectorAll('body *')]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return !ignoredTags.has(el.tagName)
            && rect.width > 0
            && rect.height > 0
            && style.visibility !== 'hidden'
            && style.display !== 'none'
            && el.textContent?.trim();
        })
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
          fontSize: Number.parseFloat(getComputedStyle(el).fontSize),
        }))
        .filter((item) => item.fontSize < minBodyFontSize)
        .map((item) => `${item.tag} ${item.fontSize}px: ${item.text}`);
    }, MIN_BODY_FONT_SIZE);

    expect(issues).toEqual([]);
  });

  test('keyboard focus order reaches core MSP jump links and content controls', async ({ page }) => {
    await openMspPortal(page);
    const focusNames = [];
    for (let i = 0; i < 45; i += 1) {
      await page.keyboard.press('Tab');
      const name = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('aria-label') || el?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120) || el?.tagName;
      });
      focusNames.push(name);
    }

    expect(focusNames.some((name) => /Jump to Designed Megan Overview Guide/i.test(name))).toBe(true);
    expect(focusNames.some((name) => /Jump to PSH MSP Escalation View/i.test(name))).toBe(true);
    expect(focusNames.some((name) => /Jump to Embedded Source-of-Truth Review/i.test(name))).toBe(true);
  });

  test('AAA contrast proxy passes for visible normal text in the MSP portal', async ({ page }) => {
    await openMspPortal(page);
    const issues = await page.evaluate((minContrast) => {
      function parseRgb(value) {
        const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) return null;
        return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4] ?? 1)];
      }

      function channel(value) {
        const normalized = value / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      }

      function luminance([r, g, b]) {
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      }

      function contrast(foreground, background) {
        const lighter = Math.max(luminance(foreground), luminance(background));
        const darker = Math.min(luminance(foreground), luminance(background));
        return (lighter + 0.05) / (darker + 0.05);
      }

      function effectiveBackground(el) {
        let current = el;
        while (current && current !== document.documentElement) {
          const bg = parseRgb(getComputedStyle(current).backgroundColor);
          if (bg && bg[3] > 0.95) return bg;
          current = current.parentElement;
        }
        return parseRgb(getComputedStyle(document.body).backgroundColor) || [2, 6, 23, 1];
      }

      return [...document.querySelectorAll('#msp-review *')]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return rect.width > 0
            && rect.height > 0
            && style.visibility !== 'hidden'
            && style.display !== 'none'
            && el.childElementCount === 0
            && el.textContent?.trim()
            && Number.parseFloat(style.fontSize) < 18;
        })
        .map((el) => {
          const fg = parseRgb(getComputedStyle(el).color);
          const bg = effectiveBackground(el);
          return {
            text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
            ratio: fg && bg ? contrast(fg, bg) : 0,
          };
        })
        .filter((item) => item.ratio < minContrast)
        .map((item) => `${item.ratio.toFixed(2)}: ${item.text}`);
    }, MIN_AAA_CONTRAST);

    expect(issues).toEqual([]);
  });
});
