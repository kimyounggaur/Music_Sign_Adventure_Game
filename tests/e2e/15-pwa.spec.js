const { test, expect } = require('@playwright/test');

test('PW-01 manifest responds with required fields', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.status()).toBe(200);
  const manifest = await response.json();
  expect(manifest.name).toBe('멜로디아: 끝나지 않는 노래');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons).toHaveLength(2);
});

test('PW-02 service worker precaches game shell and assets', async ({ request }) => {
  const response = await request.get('/sw.js');
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toContain('./index.html');
  expect(text).toContain('./01 Source/G Clef/G Clef.png');
  expect(text).toContain('./01 Source/1st&2nd Ending.jpg');
});

test('PW-03 test mode skips service worker registration', async ({ page }) => {
  await page.goto('/index.html?test=1');
  await page.waitForFunction(() => document.body.dataset.gameState === 'Title');
  const hasController = await page.evaluate(() => Boolean(navigator.serviceWorker?.controller));
  expect(hasController).toBe(false);
});
