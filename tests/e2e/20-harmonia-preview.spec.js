const { test, expect } = require('@playwright/test');

const preview = '/index.html?preview=harmonia&art=remaster&seed=42&test=1';
async function ready(page, url = preview) {
  await page.goto(url);
  await expect(page.locator('body')).toHaveAttribute('data-game-state','Explore');
}
async function tap(page,x,y) {
  const b=await page.locator('#game').boundingBox();
  const height=await page.evaluate(()=>MelodiaDebug.CONFIG.H);
  const point={x:b.x+x*b.width/360,y:b.y+y*b.height/height};
  if(await page.evaluate(()=>navigator.maxTouchPoints>0)) await page.touchscreen.tap(point.x,point.y);
  else await page.mouse.click(point.x,point.y);
}
async function clickButton(page,id){
  // Buttons are rebuilt on the next Canvas render after a state transition.
  await page.waitForFunction(id=>window.MelodiaDebug.UI.buttons.some(b=>b.id===id&&b.enabled),id);
  const b=await page.evaluate(id=>window.MelodiaDebug.UI.buttons.find(b=>b.id===id),id);
  expect(b,`${id} exists`).toBeTruthy();await tap(page,b.x+b.w/2,b.y+b.h/2);
}

test('HP-01 original entry keeps original save keys and renderer',async({page})=>{
  await page.goto('/index.html?test=1');await expect(page.locator('body')).toHaveAttribute('data-game-state','Title');
  expect(await page.evaluate(()=>MelodiaDebug.CONFIG.SAVE_KEY)).toBe('melodia_v01_save');
  expect(await page.locator('body').getAttribute('data-preview-art')).toBeNull();
});

test('HP-02 matching fixture and preview save isolation',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('melodia_v01_save','preserve-existing-progress'));
  await ready(page);
  const before=await page.evaluate(()=>{const d=MelodiaDebug;return {flags:{...d.DATA.flags},symbols:d.DATA.symbols,position:{x:d.ENTITIES.player.x,y:d.ENTITIES.player.y},key:d.CONFIG.SAVE_KEY};});
  await page.keyboard.press('Escape');
  await page.evaluate(()=>MelodiaDebug.SAVE.write('test'));
  expect(await page.evaluate(()=>localStorage.getItem('melodia_v01_save'))).toBe('preserve-existing-progress');
  await ready(page,preview.replace('art=remaster','art=original'));
  const original=await page.evaluate(()=>{const d=MelodiaDebug;return {flags:{...d.DATA.flags},symbols:d.DATA.symbols,position:{x:d.ENTITIES.player.x,y:d.ENTITIES.player.y},key:d.CONFIG.SAVE_KEY};});
  expect(original.flags).toEqual(before.flags);expect(original.symbols).toEqual(before.symbols);expect(original.position).toEqual(before.position);expect(original.key).not.toBe(before.key);
});

test('HP-03 real touch palette selection opens the tower and preserves next map',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
  await clickButton(page,'palette');await expect(page.locator('body')).toHaveAttribute('data-game-state','SymbolSelect');
  expect(await page.evaluate(()=>MelodiaDebug.SYMBOLS.clef_g.theory)).toBe('소용돌이가 감는 둘째 줄이 [솔]이에요.');
  await tap(page,180,156);
  await expect.poll(()=>page.evaluate(()=>MelodiaDebug.UI.symbolMenu.mode)).toBe('target');
  await tap(page,180,328); // Actual door bounds + renderer's documented 120px camera inset.
  await expect.poll(()=>page.evaluate(()=>Boolean(MelodiaDebug.DATA.flags.tower_door_open))).toBe(true);
  await clickButton(page,'interact');
  await expect.poll(()=>page.evaluate(()=>MelodiaDebug.DATA.currentMap)).toBe('tower');
  expect(errors).toEqual([]);await context.close();
});

test('HP-04 keyboard, collision and release remain functional',async({page})=>{
  await ready(page);
  const start=await page.evaluate(()=>MelodiaDebug.ENTITIES.player.x);
  await page.keyboard.down('KeyD');await page.waitForTimeout(230);await page.keyboard.up('KeyD');
  const moved=await page.evaluate(()=>MelodiaDebug.ENTITIES.player.x);expect(moved).toBeGreaterThan(start+10);
  await page.waitForTimeout(150);expect(await page.evaluate(()=>MelodiaDebug.ENTITIES.player.x)).toBe(moved);
  await page.evaluate(()=>{MelodiaDebug.ENTITIES.player.x=502;MelodiaDebug.ENTITIES.player.y=232;});
  await page.keyboard.down('KeyW');await page.waitForTimeout(600);await page.keyboard.up('KeyW');
  // Existing map collision starts at y=192; the original door tile is walkable.
  expect(await page.evaluate(()=>MelodiaDebug.ENTITIES.player.y)).toBeGreaterThanOrEqual(192);
});

test('HP-05 drag movement, pause and sound work at mobile scale',async({page})=>{
  await page.setViewportSize({width:390,height:844});await ready(page);
  const box=await page.locator('#game').boundingBox();const height=await page.evaluate(()=>MelodiaDebug.CONFIG.H);const sx=x=>box.x+x*box.width/360,sy=y=>box.y+y*box.height/height;
  const start=await page.evaluate(()=>MelodiaDebug.ENTITIES.player.x);
  await page.mouse.move(sx(70),sy(height-49));await page.mouse.down();await page.mouse.move(sx(108),sy(height-49));await page.waitForTimeout(200);await page.mouse.up();
  expect(await page.evaluate(()=>MelodiaDebug.ENTITIES.player.x)).toBeGreaterThan(start+8);
  expect(await page.evaluate(()=>MelodiaDebug.INPUT.joy.active)).toBe(false);
  await clickButton(page,'soundHud');expect(await page.evaluate(()=>MelodiaDebug.DATA.soundOn)).toBe(true);
  await clickButton(page,'pause');await expect(page.locator('body')).toHaveAttribute('data-game-state','Pause');
  await page.keyboard.press('Escape');await expect(page.locator('body')).toHaveAttribute('data-game-state','Explore');
});

test('HP-06 reduced motion freezes artwork and all targets meet touch size',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await ready(page);await page.waitForTimeout(250);
  const first=await page.locator('#game').screenshot();await page.waitForTimeout(250);const second=await page.locator('#game').screenshot();expect(first.equals(second)).toBe(true);
  const {targets,height}=await page.evaluate(()=>({height:MelodiaDebug.CONFIG.H,targets:MelodiaDebug.UI.buttons.map(b=>({id:b.id,x:b.x,y:b.y,w:b.w,h:b.h}))}));
  for(const b of targets){expect(b.w,b.id).toBeGreaterThanOrEqual(44);expect(b.h,b.id).toBeGreaterThanOrEqual(44);expect(b.x+b.w).toBeLessThanOrEqual(360);expect(b.y+b.h).toBeLessThanOrEqual(height);}
});

test('HP-07 comparison mobile tabs and reset work without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/comparison.html');
  await expect(page.locator('.after')).toBeVisible();await expect(page.locator('.before')).toBeHidden();
  await page.getByRole('button',{name:'기존 화면',exact:true}).click();await expect(page.locator('.before')).toBeVisible();
  await expect(page.locator('.after')).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('button',{name:/장면 다시 시작/}).click();
  const before=page.frameLocator('iframe[title="기존 하모니아 마을 게임"]');await expect(before.locator('body')).toHaveAttribute('data-game-state','Explore');
});

test('HP-08 scene, palette and dialogue render without errors at small viewport',async({page})=>{
  await page.setViewportSize({width:320,height:568});const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
  await clickButton(page,'interact');await expect(page.locator('body')).toHaveAttribute('data-game-state','Dialogue');
  for(let i=0;i<8&&await page.locator('body').getAttribute('data-game-state')==='Dialogue';i++){await tap(page,180,500);await page.waitForTimeout(80);}
  await expect(page.locator('body')).toHaveAttribute('data-game-state','Explore');await clickButton(page,'palette');await clickButton(page,'closePalette');
  await expect(page.locator('body')).toHaveAttribute('data-game-state','Explore');expect(errors).toEqual([]);
});
