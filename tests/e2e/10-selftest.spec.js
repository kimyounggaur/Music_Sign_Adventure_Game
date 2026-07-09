const { test, expect } = require('@playwright/test');

test('TC-00 @smoke selftest passes', async ({ page }) => {
  await page.goto('/index.html?selftest=1&test=1&seed=42');
  await page.waitForFunction(() => window.__MELODIA_SELFTEST__?.done === true, null, { timeout: 8000 });
  const result = await page.evaluate(() => window.__MELODIA_SELFTEST__);
  expect(result.fail, JSON.stringify(result.results.filter((r) => !r.ok), null, 2)).toBe(0);
  expect(result.pass).toBeGreaterThanOrEqual(22);
});
