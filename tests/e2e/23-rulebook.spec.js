const { test, expect } = require('@playwright/test');
const { SAVE_KEY, boot, newGame, skipCutscene, advanceDialogue, waitState, dbg } = require('./_helpers');

test('rulebook opens from the header, shows illustrated chapters, and preserves title progress', async ({ page }) => {
  const savedProgress = JSON.stringify({ version: 1, currentMap: 'forest', playerPosition: { x: 224, y: 288 }, symbols: ['clef_g'], flags: { tower_door_open: true }, playTime: 123 });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: SAVE_KEY, value: savedProgress });
  await boot(page, '', { clearSave: false });

  await page.locator('#rulebook-open').click();
  const dialog = page.locator('#rulebook-dialog');
  await expect(dialog).toBeVisible();
  for (const id of ['start', 'controls', 'village', 'tower', 'forest', 'bird', 'rock', 'staff', 'save']) {
    await expect(dialog.locator(`#rulebook-${id}`)).toHaveCount(1);
  }
  const images = dialog.locator('img');
  expect(await images.count()).toBeGreaterThanOrEqual(8);
  for (let i = 0; i < await images.count(); i += 1) {
    const image = images.nth(i);
    await image.scrollIntoViewIfNeeded(); // Lazy images load as a reader reaches each chapter.
    await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
    expect((await image.getAttribute('alt')).trim()).not.toBe('');
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(savedProgress);
});

test('rulebook blocks movement while open and returns to the same game state', async ({ page }) => {
  await boot(page);
  await newGame(page);
  await skipCutscene(page);
  await advanceDialogue(page);
  await waitState(page, 'Explore');
  await page.locator('#rulebook-open').click();
  await expect(page.locator('#rulebook-dialog')).toBeVisible();
  const before = await dbg(page, d => ({ state: document.body.dataset.gameState, x: d.ENTITIES.player.x, y: d.ENTITIES.player.y }));
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(400);
  await page.keyboard.up('KeyD');
  const during = await dbg(page, d => ({ state: document.body.dataset.gameState, x: d.ENTITIES.player.x, y: d.ENTITIES.player.y }));
  expect(during).toEqual(before);
  await page.locator('#rulebook-close').click();
  await expect(page.locator('#rulebook-dialog')).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute('data-game-state', 'Explore');
});
