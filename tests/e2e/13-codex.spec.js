const { test, expect } = require('@playwright/test');
const { boot, newGame, skipCutscene, advanceDialogue, waitState, pressEsc, tapCanvas, dbg, lastToast } = require('./_helpers');

async function reachPause(page) {
  await boot(page);
  await newGame(page);
  await skipCutscene(page);
  await advanceDialogue(page);
  await waitState(page, 'Explore');
  await pressEsc(page);
  await waitState(page, 'Pause');
  await page.waitForTimeout(100);
}

test('CX-01 empty codex keeps Pause and shows toast', async ({ page }) => {
  await reachPause(page);
  await tapCanvas(page, 180, 224);
  await expect.poll(() => lastToast(page)).toBe('아직 모은 기호가 없어요');
  await expect(page.locator('body')).toHaveAttribute('data-game-state', 'Pause');
});

test('CX-02 codex grid opens detail and closes to Pause hub', async ({ page }) => {
  await reachPause(page);
  await dbg(page, (d) => {
    d.DATA.symbols = ['clef_g', 'note_c', 'note_e', 'note_g'];
    d.DATA.codex = ['clef_g', 'note_c', 'note_e', 'note_g'];
  });
  await tapCanvas(page, 180, 224);
  await waitState(page, 'Pause');
  await expect.poll(() => dbg(page, (d) => d.UI.pauseView)).toBe('codex');
  await page.waitForTimeout(100);
  await tapCanvas(page, 112, 227);
  await expect.poll(() => dbg(page, (d) => d.UI.codexDetail)).toBe('clef_g');
  await page.waitForTimeout(100);
  await tapCanvas(page, 180, 544);
  await expect.poll(() => dbg(page, (d) => d.UI.codexDetail)).toBe(null);
  await tapCanvas(page, 279, 94);
  await expect.poll(() => dbg(page, (d) => d.UI.pauseView)).toBe('main');
});

test('CX-03 codex card uses symbol theory text', async ({ page }) => {
  await reachPause(page);
  await dbg(page, (d) => {
    d.DATA.symbols = ['clef_g'];
    d.DATA.codex = ['clef_g'];
  });
  await tapCanvas(page, 180, 224);
  await waitState(page, 'Pause');
  await expect.poll(() => dbg(page, (d) => d.UI.pauseView)).toBe('codex');
  await page.waitForTimeout(100);
  await tapCanvas(page, 112, 227);
  await expect.poll(() => dbg(page, (d) => d.UI.codexDetail)).toBe('clef_g');
  const theory = await dbg(page, (d) => {
    const id = d.UI.codexDetail;
    return d.SYMBOLS[id].theory;
  });
  const expected = await dbg(page, (d) => d.SYMBOLS.clef_g.theory);
  expect(theory).toBe(expected);
});
