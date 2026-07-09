const { expect } = require('@playwright/test');

const SAVE_KEY = 'melodia_v01_save';

function withParams(params = '') {
  const clean = params.replace(/^\?/, '').replace(/^&/, '');
  return `/index.html?test=1&seed=42${clean ? `&${clean}` : ''}`;
}

async function dbg(page, fn, arg) {
  return page.evaluate(({ source, argValue }) => {
    const run = new Function('debug', 'arg', `return (${source})(debug, arg);`);
    return run(window.MelodiaDebug, argValue);
  }, { source: fn.toString(), argValue: arg });
}

async function gameState(page) {
  return page.locator('body').getAttribute('data-game-state');
}

async function waitState(page, state, timeout = 8000) {
  await page.waitForFunction((target) => document.body.dataset.gameState === target, state, { timeout });
}

async function boot(page, params = '', options = {}) {
  const { clearSave = true } = options;
  await page.goto(withParams(params));
  if (clearSave) {
    await page.evaluate((key) => localStorage.removeItem(key), SAVE_KEY);
    await page.reload();
  }
  await waitState(page, 'Title');
}

async function tapCanvas(page, x, y) {
  await page.mouse.click(x, y);
}

async function newGame(page) {
  await tapCanvas(page, 180, 376);
  if (await gameState(page) === 'Title') {
    const confirmOpen = await dbg(page, (d) => d.UI.resetConfirm?.type === 'new');
    if (confirmOpen) await tapCanvas(page, 116, 360);
  }
  await waitState(page, 'Cutscene');
}

async function skipCutscene(page) {
  if (await gameState(page) !== 'Cutscene') return;
  await tapCanvas(page, 313, 40);
  await page.waitForFunction(() => document.body.dataset.gameState !== 'Cutscene');
}

async function advanceDialogue(page) {
  for (let i = 0; i < 20 && await gameState(page) === 'Dialogue'; i += 1) {
    await tapCanvas(page, 180, 320);
    await page.waitForTimeout(50);
  }
}

async function teleport(page, tx, ty) {
  await dbg(page, (d, pos) => {
    d.ENTITIES.player.x = pos.tx * d.CONFIG.TILE + d.CONFIG.TILE / 2 - d.CONFIG.PLAYER_W / 2;
    d.ENTITIES.player.y = pos.ty * d.CONFIG.TILE + d.CONFIG.TILE / 2 - d.CONFIG.PLAYER_H / 2;
    d.INPUT.lastTile = { x: -1, y: -1 };
  }, { tx, ty });
  await page.waitForTimeout(50);
}

async function walkTo(page, tx, ty, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const tile = await dbg(page, (d) => {
      const c = d.ENTITIES.playerCenter();
      return { x: Math.floor(c.x / d.CONFIG.TILE), y: Math.floor(c.y / d.CONFIG.TILE) };
    });
    if (tile.x === tx && tile.y === ty) return;
    const key = Math.abs(tx - tile.x) > Math.abs(ty - tile.y)
      ? (tx > tile.x ? 'KeyD' : 'KeyA')
      : (ty > tile.y ? 'KeyS' : 'KeyW');
    await page.keyboard.down(key);
    await page.waitForTimeout(100);
    await page.keyboard.up(key);
  }
  throw new Error(`walkTo timeout: ${tx},${ty}`);
}

async function pressE(page) { await page.keyboard.press('KeyE'); }
async function pressQ(page) { await page.keyboard.press('KeyQ'); }
async function pressEsc(page) { await page.keyboard.press('Escape'); }

async function interactTargetId(page) {
  return dbg(page, (d) => d.UI.getInteractTarget()?.id || null);
}

async function pickPaletteIndex(page, index) {
  await tapCanvas(page, 180, 156 + index * 64);
}

async function paletteList(page) {
  return dbg(page, (d) => d.UI.symbolMenu.filter || d.DATA.symbols);
}

async function lastToast(page) {
  return dbg(page, (d) => d.UI.toastLog.at(-1)?.text || '');
}

async function flags(page) { return dbg(page, (d) => ({ ...d.DATA.flags })); }
async function symbols(page) { return dbg(page, (d) => d.DATA.symbols.slice()); }
async function quests(page) { return dbg(page, (d) => JSON.parse(JSON.stringify(d.DATA.quests))); }
async function saveRaw(page) { return page.evaluate((key) => localStorage.getItem(key), SAVE_KEY); }

module.exports = {
  SAVE_KEY,
  expect,
  dbg,
  gameState,
  waitState,
  boot,
  newGame,
  tapCanvas,
  skipCutscene,
  advanceDialogue,
  teleport,
  walkTo,
  pressE,
  pressQ,
  pressEsc,
  interactTargetId,
  pickPaletteIndex,
  paletteList,
  lastToast,
  flags,
  symbols,
  quests,
  saveRaw
};
