const { defineConfig } = require('@playwright/test');

const hasBaseUrl = Boolean(process.env.PLAYWRIGHT_BASE_URL);
const project = process.env.PLAYWRIGHT_BROWSER === 'webkit'
  ? { name: 'webkit', use: { browserName: 'webkit' } }
  : { name: 'chromium', use: { browserName: 'chromium' } };

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173',
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 1
  },
  webServer: hasBaseUrl ? undefined : {
    command: 'npm run serve',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [project]
});
