# Melodia Test Guide

## Local

1. Run `npm install`.
2. Run `npx playwright install chromium`.
3. Run `npm test`.

## Useful Commands

- `npm run test:smoke`: boot and selftest smoke checks.
- `npm run test:full`: full non-visual suite.
- `npm run test:visual`: visual regression suite when visual specs are added.
- `npm run test:update-visual`: update approved visual snapshots.

## Production Smoke

Set `PLAYWRIGHT_BASE_URL` to a deployed URL to run the same checks against production.
