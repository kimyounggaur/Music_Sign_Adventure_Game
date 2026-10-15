const { test, expect } = require('@playwright/test');
const touchPages = new WeakSet();

const preview = '/index.html?preview=harmonia&art=assets&seed=42&test=1';
async function ready(page) {
  await page.goto(preview);
  await page.evaluate(() => MelodiaDebug.preview.ready);
  await expect(page.locator('body')).toHaveAttribute('data-game-state', 'Explore');
  await expect(page.locator('body')).toHaveAttribute('data-asset-status', 'ready');
}
async function point(page, x, y) {
  const b = await page.locator('#game').boundingBox();
  const height = await page.evaluate(() => MelodiaDebug.CONFIG.H);
  return { x: b.x + x * b.width / 360, y: b.y + y * b.height / height };
}
async function tap(page, x, y) {
  const p = await point(page, x, y);
  if (touchPages.has(page)) await page.touchscreen.tap(p.x, p.y);
  else await page.mouse.click(p.x, p.y);
}
async function button(page, id) {
  await page.waitForFunction(id => MelodiaDebug.UI.buttons.some(b => b.id === id && b.enabled), id);
  const b = await page.evaluate(id => MelodiaDebug.UI.buttons.find(b => b.id === id), id);
  await tap(page, b.x + b.w / 2, b.y + b.h / 2);
}
async function evidence(testInfo, name, value) {
  await testInfo.attach(name, { body: Buffer.from(JSON.stringify(value, null, 2)), contentType: 'application/json' });
}

test('HA-01 production atlas is complete and comparisons preserve music data and production storage', async ({ page }, testInfo) => {
  const atlasRequests = [], failures = [];
  page.on('request', r => { if (r.url().includes('/assets/harmonia/')) atlasRequests.push(r.url()); });
  page.on('response', r => { if (r.url().includes('/assets/harmonia/') && !r.ok()) failures.push(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', r => failures.push(r.url()));
  await page.goto('/index.html?test=1');
  await expect(page.locator('body')).toHaveAttribute('data-game-state', 'Title');
  const original = await page.evaluate(() => ({ symbols: MelodiaDebug.SYMBOLS, save: MelodiaDebug.CONFIG.SAVE_KEY, settings: MelodiaDebug.CONFIG.SETTINGS_KEY }));
  expect(atlasRequests.length).toBeGreaterThan(0);
  atlasRequests.length = 0;
  await page.evaluate(() => {
    localStorage.setItem('melodia_v01_save', 'production-progress-sentinel');
    localStorage.setItem('melodia_ui_settings_v1', 'production-settings-sentinel');
  });
  const previewKeys = [];
  for (const art of ['original', 'remaster']) {
    await page.goto(preview.replace('art=assets', `art=${art}`));
    await expect(page.locator('body')).toHaveAttribute('data-game-state', 'Explore');
    previewKeys.push(await page.evaluate(() => MelodiaDebug.CONFIG.SAVE_KEY));
  }
  expect(atlasRequests).toEqual([]);
  await ready(page);
  await button(page, 'soundHud');
  const result = await page.evaluate(() => {
    const d = MelodiaDebug, a = d.preview.assets;
    d.SAVE.write('test');
    return { symbols: d.SYMBOLS, save: d.CONFIG.SAVE_KEY, settings: d.CONFIG.SETTINGS_KEY,
      productionSave: localStorage.getItem('melodia_v01_save'), productionSettings: localStorage.getItem('melodia_ui_settings_v1'),
      state: a.state, manifest: a.manifest.meta, frames: Object.keys(a.manifest.frames).length };
  });
  expect(result.symbols).toEqual(original.symbols);
  expect(result.symbols.clef_g.theory).toBe('소용돌이가 감는 둘째 줄이 [솔]이에요.');
  expect(['note_c', 'note_e', 'note_g'].map(id => [result.symbols[id].pitch, result.symbols[id].staffSlot])).toEqual([
    ['C4', 'ledger_below'], ['E4', 'line1'], ['G4', 'line2']
  ]);
  expect(result.save).toBe('melodia_harmonia_assets_save');
  expect(result.settings).toBe('melodia_harmonia_assets_settings');
  expect([original.save, ...previewKeys]).not.toContain(result.save);
  expect(result.productionSave).toBe('production-progress-sentinel');
  expect(result.productionSettings).toBe('production-settings-sentinel');
  expect(result.state.pageCount).toBe(result.manifest.pages.length);
  expect(result.state.frameCount).toBe(result.frames);
  expect(result.state.missing).toEqual([]);
  expect(result.state.error).toBeNull();
  expect(result.state.drawCount).toBeGreaterThan(0);
  expect(failures).toEqual([]);
  for (const file of result.manifest.pages) expect(atlasRequests.some(url => url.endsWith(typeof file === 'string' ? file : file.file))).toBe(true);
  await evidence(testInfo, 'atlas-load-and-isolation', { requests: atlasRequests, result });
});

test('HA-02 asset scene and palette fit all three review sizes with usable touch targets', async ({ browser }, testInfo) => {
  const report = [];
  for (const [width, height] of [[360, 640], [390, 844], [320, 568]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage(), errors = [];
    touchPages.add(page);
    page.on('pageerror', e => errors.push(e.message));
    await ready(page);
    for (const palette of [false, true]) {
      if (palette) await button(page, 'palette');
      const layout = await page.evaluate(() => ({ width: MelodiaDebug.CONFIG.W, height: MelodiaDebug.CONFIG.H,
        overflow: document.documentElement.scrollWidth > innerWidth,
        buttons: MelodiaDebug.UI.buttons.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })) }));
      expect(layout.overflow).toBe(false);
      for (const b of layout.buttons) {
        expect(b.w, b.id).toBeGreaterThanOrEqual(44); expect(b.h, b.id).toBeGreaterThanOrEqual(44);
        expect(b.x, b.id).toBeGreaterThanOrEqual(0); expect(b.y, b.id).toBeGreaterThanOrEqual(0);
        expect(b.x + b.w, b.id).toBeLessThanOrEqual(layout.width); expect(b.y + b.h, b.id).toBeLessThanOrEqual(layout.height);
      }
      report.push({ viewport: [width, height], palette, ...layout });
    }
    await button(page, 'closePalette');
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => MelodiaDebug.preview.assets.state.missing)).toEqual([]);
    await context.close();
  }
  await evidence(testInfo, 'responsive-targets', report);
});

test('HA-03 real touch uses source clef, renders all door states, and enters original tower', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage(), errors = [];
  touchPages.add(page);
  page.on('pageerror', e => errors.push(e.message));
  await ready(page);
  await button(page, 'palette');
  await tap(page, 180, 156);
  await expect.poll(() => page.evaluate(() => MelodiaDebug.UI.symbolMenu.mode)).toBe('target');
  await tap(page, 180, 328);
  await expect.poll(() => page.evaluate(() => MelodiaDebug.preview.assets.state.observedFrames.includes('tower_door_half_open'))).toBe(true);
  await expect.poll(() => page.evaluate(() => Boolean(MelodiaDebug.DATA.flags.tower_door_open))).toBe(true);
  await expect.poll(() => page.evaluate(() => MelodiaDebug.preview.assets.state.observedFrames.includes('tower_door_open'))).toBe(true);
  const observed = await page.evaluate(() => MelodiaDebug.preview.assets.state.observedFrames);
  expect(observed).toContain('tower_door_closed');
  await button(page, 'interact');
  await expect.poll(() => page.evaluate(() => MelodiaDebug.DATA.currentMap)).toBe('tower');
  expect(await page.evaluate(() => MelodiaDebug.CONFIG.H)).toBe(640);
  expect(errors).toEqual([]);
  await evidence(testInfo, 'touch-door-states', { observed, errors });
  await context.close();
});

test('HA-04 reduced-motion asset scene stays still; pointer cancellation and blur release movement', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await page.waitForTimeout(160);
  const first = await page.locator('#game').screenshot();
  await page.waitForTimeout(220);
  const second = await page.locator('#game').screenshot();
  expect(first.equals(second)).toBe(true);
  const height = await page.evaluate(() => MelodiaDebug.CONFIG.H);
  const start = await point(page, 70, height - 49), end = await point(page, 110, height - 49);
  await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(end.x, end.y);
  await expect.poll(() => page.evaluate(() => MelodiaDebug.INPUT.joy.active)).toBe(true);
  await page.evaluate(() => {
    const id = MelodiaDebug.INPUT.joy.id;
    document.querySelector('#game').dispatchEvent(new PointerEvent('pointercancel', { pointerId: id, bubbles: true }));
  });
  await page.mouse.up();
  expect(await page.evaluate(() => MelodiaDebug.INPUT.joy.active)).toBe(false);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(120);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const stopped = await page.evaluate(() => ({ x: MelodiaDebug.ENTITIES.player.x, keys: MelodiaDebug.INPUT.keys.size, joy: MelodiaDebug.INPUT.joy.active }));
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => MelodiaDebug.ENTITIES.player.x)).toBe(stopped.x);
  expect(stopped.keys).toBe(0); expect(stopped.joy).toBe(false);
  await page.keyboard.up('KeyD');
  await evidence(testInfo, 'reduced-motion-and-cancel', { staticPixels: first.equals(second), stopped });
});

test('HA-05 four directional walk cycles render at 8 fps with fixed feet and no mirrored sprites', async ({ page }, testInfo) => {
  await ready(page);
  const report = [];
  for (const [direction, key] of [['down', 'KeyS'], ['up', 'KeyW'], ['left', 'KeyA'], ['right', 'KeyD']]) {
    await page.evaluate(() => { const p = MelodiaDebug.ENTITIES.player; p.x = 502; p.y = 400; });
    await page.keyboard.down(key);
    await expect.poll(() => page.evaluate(() => MelodiaDebug.preview.assets.sceneState.sol?.animation)).toBe('walk');
    const samples = await page.evaluate(() => new Promise(resolve => {
      const samples = [], start = performance.now();
      function tick() {
        const s = MelodiaDebug.preview.assets.sceneState.sol;
        samples.push({ ...s });
        if (performance.now() - start < 850) requestAnimationFrame(tick); else resolve(samples);
      }
      requestAnimationFrame(tick);
    }));
    await page.keyboard.up(key);
    expect(new Set(samples.map(s => s.frameId)).size).toBe(6);
    for (const s of samples) {
      expect(s.direction).toBe(direction); expect(s.animation).toBe('walk'); expect(s.fps).toBe(8); expect(s.flipX).toBe(false);
      expect(s.frameId).toBe(`sol.walk.${direction}.${Math.floor(s.timeSeconds * 8) % 6}`);
    }
    report.push({ direction, frames: [...new Set(samples.map(s => s.frameId))], samples });
  }
  const invariants = await page.evaluate(() => {
    const d = MelodiaDebug, a = d.preview.assets;
    return { speed: d.CONFIG.PLAYER_SPEED, collision: [d.CONFIG.PLAYER_W, d.CONFIG.PLAYER_H], mirroredDraws: a.state.mirroredDraws,
      frames: Object.values(a.manifest.frames).filter(f => f.id.startsWith('sol.')).map(f => ({ pivot: f.pivot, size: f.logicalSize, rotated: f.rotated })), missing: a.state.missing };
  });
  expect(invariants.speed).toBe(116); expect(invariants.collision).toEqual([20, 24]);
  expect(invariants.mirroredDraws).toBe(0); expect(invariants.missing).toEqual([]);
  for (const f of invariants.frames) { expect(f.pivot).toEqual([32, 56]); expect(f.size).toEqual([64, 64]); expect(f.rotated).toBe(false); }
  await evidence(testInfo, 'directional-animation-and-collision', { report, invariants });
});

test('HA-06 review controls switch baselines, mobile tabs, and reset the playable scene', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1020 });
  await page.goto('/asset-review.html');
  const before = page.frameLocator('#before-frame');
  const after = page.frameLocator('#after-frame');
  await expect(before.locator('body')).toHaveAttribute('data-preview-art', 'remaster');
  await expect(after.locator('body')).toHaveAttribute('data-asset-status', 'ready');
  await page.getByRole('button', { name: '최초 화면', exact: true }).click();
  await expect(before.locator('body')).toHaveAttribute('data-preview-art', 'original');
  const initialX = await after.locator('body').evaluate(() => MelodiaDebug.ENTITIES.player.x);
  await after.locator('body').evaluate(() => { MelodiaDebug.ENTITIES.player.x += 40; });
  await page.getByRole('button', { name: /장면 다시 시작/ }).click();
  await expect(after.locator('body')).toHaveAttribute('data-asset-status', 'ready');
  await expect.poll(() => after.locator('body').evaluate(() => MelodiaDebug.ENTITIES.player.x)).toBe(initialX);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.after')).toBeVisible();
  await expect(page.locator('.before')).toBeHidden();
  await page.getByRole('button', { name: '제작 전', exact: true }).click();
  await expect(page.locator('.before')).toBeVisible();
  await expect(page.locator('.after')).toBeHidden();
  await page.getByRole('button', { name: '에셋 적용', exact: true }).click();
  await expect(page.locator('.after')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('HA-07 missing atlas shows an explicit load error without entering a broken scene', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/assets/harmonia/atlas-0.png', route => route.abort());
  await page.goto(preview);
  await expect(page.locator('body')).toHaveAttribute('data-asset-status', 'error');
  const result = await page.evaluate(async () => {
    const d = MelodiaDebug;
    let rejected = false;
    try { await d.preview.ready; } catch { rejected = true; }
    return { state: d.state, error: d.preview.assets.state.error, rejected };
  });
  expect(result.state).toBe('Boot');
  expect(result.error).toContain('Atlas page failed');
  expect(result.rejected).toBe(true);
  expect(errors).toEqual([]);
  await page.unroute('**/assets/harmonia/atlas-0.png');
  await page.goto('/index.html?test=1');
  await expect(page.locator('body')).toHaveAttribute('data-game-state', 'Title');
});
