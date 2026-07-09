const { test, expect } = require('@playwright/test');
const { boot, dbg, newGame, skipCutscene, advanceDialogue, waitState, teleport } = require('./_helpers');

test('H1 @smoke boot reaches Title and exposes MelodiaDebug', async ({ page }) => {
  await boot(page);
  await expect(page.locator('body')).toHaveAttribute('data-game-state', 'Title');
  const hasDebug = await page.evaluate(() => Boolean(window.MelodiaDebug));
  expect(hasDebug).toBe(true);
});

test('H2 newGame reaches Explore after intro flow', async ({ page }) => {
  await boot(page);
  await newGame(page);
  await skipCutscene(page);
  await advanceDialogue(page);
  await waitState(page, 'Explore');
});

test('H3 teleport moves player to requested tile', async ({ page }) => {
  await boot(page);
  await newGame(page);
  await skipCutscene(page);
  await advanceDialogue(page);
  await waitState(page, 'Explore');
  await teleport(page, 20, 10);
  const tile = await dbg(page, (d) => {
    const c = d.ENTITIES.playerCenter();
    return { x: Math.floor(c.x / d.CONFIG.TILE), y: Math.floor(c.y / d.CONFIG.TILE) };
  });
  expect(tile).toEqual({ x: 20, y: 10 });
});
