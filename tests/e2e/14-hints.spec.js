const { test, expect } = require('@playwright/test');
const { boot, newGame, skipCutscene, advanceDialogue, waitState, dbg, lastToast } = require('./_helpers');

async function reachExplore(page) {
  await boot(page);
  await newGame(page);
  await skipCutscene(page);
  await advanceDialogue(page);
  await waitState(page, 'Explore');
}

test('HN-01 first idle hint appears in test mode', async ({ page }) => {
  await reachExplore(page);
  await dbg(page, (d) => {
    d.DATA.currentMap = 'village';
    d.DATA.flags.tower_examined = true;
    d.HINT.seen = {};
    d.HINT.reset();
  });
  await expect.poll(() => lastToast(page), { timeout: 5000 }).toBe('템포: 피치가 뭔가 봤다던데, 물어볼까?');
});

test('HN-02 second hint appears once', async ({ page }) => {
  await reachExplore(page);
  await dbg(page, (d) => {
    d.DATA.currentMap = 'village';
    d.DATA.flags.tower_examined = true;
    d.HINT.seen = {};
    d.HINT.reset();
  });
  await expect.poll(() => lastToast(page), { timeout: 5000 }).toBe('템포: 피치가 뭔가 봤다던데, 물어볼까?');
  await expect.poll(() => lastToast(page), { timeout: 7000 }).toBe('템포: 우물 뒤 수풀이 반짝이고 있어!');
  const level = await dbg(page, (d) => d.HINT.seen.prologue_find_clef);
  expect(level).toBe(2);
});

test('HN-03 movement resets idle timer', async ({ page }) => {
  await reachExplore(page);
  await dbg(page, (d) => {
    d.DATA.currentMap = 'village';
    d.DATA.flags.tower_examined = true;
    d.HINT.seen = {};
    d.HINT.reset();
  });
  await page.waitForTimeout(1200);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(1800);
  const toast = await lastToast(page);
  expect(toast).not.toContain('피치가 뭔가');
});
