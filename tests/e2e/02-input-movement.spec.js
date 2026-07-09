const { test, expect } = require('@playwright/test');
const { boot, newGame, skipCutscene, advanceDialogue, waitState, tapCanvas, dbg } = require('./_helpers');

async function reachExplore(page) {
  await boot(page);
  await newGame(page);
  await skipCutscene(page);
  await advanceDialogue(page);
  await waitState(page, 'Explore');
}

test('AC-01 expanded pause hit target opens Pause', async ({ page }) => {
  await reachExplore(page);
  await tapCanvas(page, 344, 20);
  await waitState(page, 'Pause');
});

test('AC-02 reduced motion keeps shake at zero', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await reachExplore(page);
  const reduced = await dbg(page, (d) => d.CONFIG.REDUCED_MOTION);
  expect(reduced).toBe(true);
  await dbg(page, (d) => { d.SCENES.shake = 0.22; });
  await page.waitForTimeout(100);
  const shake = await dbg(page, (d) => d.SCENES.shake);
  expect(shake).toBe(0);
});
