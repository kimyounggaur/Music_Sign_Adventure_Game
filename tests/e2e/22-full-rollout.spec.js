const {test,expect}=require('@playwright/test');

async function ready(page,url='/index.html?test=1&seed=42') {
  await page.goto(url);await expect(page.locator('body')).toHaveAttribute('data-game-state','Title');
  await expect(page.locator('body')).toHaveAttribute('data-asset-status','ready');
}
async function tap(page,x,y,touch=false){const b=await page.locator('#game').boundingBox();const H=await page.evaluate(()=>MelodiaDebug.CONFIG.H);const p={x:b.x+x*b.width/360,y:b.y+y*b.height/H};if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);}
async function button(page,id,touch=false){await page.waitForFunction(id=>MelodiaDebug.UI.buttons.some(b=>b.id===id&&b.enabled),id);const b=await page.evaluate(id=>MelodiaDebug.UI.buttons.find(b=>b.id===id),id);await tap(page,b.x+b.w/2,b.y+b.h/2,touch);}
async function finishCards(page,touch=false,expected='Explore'){for(let i=0;i<25;i++){const state=await page.locator('body').getAttribute('data-game-state');if(!['Dialogue','Cutscene'].includes(state))break;await tap(page,180,420,touch);await page.waitForTimeout(70);}await expect(page.locator('body')).toHaveAttribute('data-game-state',expected);}
async function near(page,id,side='below'){
  await page.evaluate(({id,side})=>{const d=MelodiaDebug,o=d.MAPS[d.DATA.currentMap].objects.find(o=>o.id===id),p=d.ENTITIES.player;const x=(o.x+(o.w||1)/2)*32,y=(o.y+(o.h||1)/2)*32;
    p.x=x-10+(side==='left'?-26:0);p.y=y-12+(side==='below'?34:0);p.faceX=side==='left'?1:0;p.faceY=side==='below'?-1:0;d.INPUT.lastTile={x:-1,y:-1};}, {id,side});
  await expect.poll(()=>page.evaluate(()=>MelodiaDebug.UI.getInteractTarget()?.id)).toBe(id);
  await page.waitForTimeout(750); // Settle eased camera after test-only travel.
}
async function step(page,id){await page.evaluate(id=>{const d=MelodiaDebug,o=d.MAPS[d.DATA.currentMap].objects.find(o=>o.id===id);d.ENTITIES.player.x=o.x*32+6;d.ENTITIES.player.y=o.y*32+4;d.INPUT.lastTile={x:-1,y:-1};},id);await page.waitForTimeout(90);}

for(const touch of [false,true])test(`FR-01 complete existing prologue and act one with ${touch?'mobile touch':'desktop controls'} @smoke`,async({browser},testInfo)=>{
  test.setTimeout(90000);
  const context=await browser.newContext({viewport:touch?{width:390,height:844}:{width:1440,height:1000},deviceScaleFactor:1,hasTouch:touch,isMobile:touch});
  const page=await context.newPage(),errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(!r.ok()&&!r.url().endsWith('favicon.ico'))bad.push(r.status()+' '+r.url());});
  await ready(page);await button(page,'new',touch);await finishCards(page,touch);
  await near(page,'clef');await button(page,'interact',touch);await finishCards(page,touch);
  await near(page,'tower_door');await button(page,'interact',touch);await finishCards(page,touch);
  await near(page,'pitch');await button(page,'interact',touch);await finishCards(page,touch);
  await near(page,'clef_bush','left');await button(page,'interact',touch);await finishCards(page,touch);
  expect(await page.evaluate(()=>MelodiaDebug.DATA.symbols)).toContain('clef_g');
  await near(page,'tower_door');await button(page,'palette',touch);await tap(page,180,156,touch);
  const target=await page.evaluate(()=>{const d=MelodiaDebug;return{x:512-d.SCENES.camera.x,y:208+120-d.SCENES.camera.y};});await tap(page,target.x,target.y,touch);
  await expect.poll(()=>page.evaluate(()=>Boolean(MelodiaDebug.DATA.flags.tower_door_open))).toBe(true);
  await button(page,'interact',touch);await expect.poll(()=>page.evaluate(()=>MelodiaDebug.DATA.currentMap)).toBe('tower');await page.waitForTimeout(250);
  await near(page,'world_score');await button(page,'interact',touch);await finishCards(page,touch);
  expect(await page.evaluate(()=>MelodiaDebug.DATA.flags.forest_gate_open)).toBe(true);
  await step(page,'tower_exit');await expect.poll(()=>page.evaluate(()=>MelodiaDebug.DATA.currentMap)).toBe('village');await page.waitForTimeout(200);
  await near(page,'forest_gate','left');await button(page,'interact',touch);await expect.poll(()=>page.evaluate(()=>MelodiaDebug.DATA.currentMap)).toBe('forest');await page.waitForTimeout(200);
  await near(page,'lala');await button(page,'interact',touch);await finishCards(page,touch);
  await near(page,'note_c_pickup');await button(page,'interact',touch);await finishCards(page,touch);
  await near(page,'crow');await button(page,'interact',touch);await finishCards(page,touch);
  await expect.poll(()=>page.evaluate(()=>MelodiaDebug.PUZZLES.bird.playback)).toBe(false);
  const sequence=await page.evaluate(()=>MelodiaDebug.PUZZLES.bird.sequence.slice());
  for(const note of sequence)await step(page,'bell_'+note.toLowerCase());await finishCards(page,touch);
  expect(await page.evaluate(()=>MelodiaDebug.DATA.symbols)).toContain('note_e');
  await near(page,'push_rock','left');const before=await page.evaluate(()=>MelodiaDebug.MAPS.forest.objects.find(o=>o.id==='push_rock').x);
  await page.keyboard.down('KeyD');await page.waitForTimeout(560);await page.keyboard.up('KeyD');
  expect(await page.evaluate(()=>MelodiaDebug.MAPS.forest.objects.find(o=>o.id==='push_rock').x)).toBeGreaterThan(before);
  await near(page,'stump_chest');await button(page,'interact',touch);await finishCards(page,touch);
  // A wrong staff position must stay rejected after the visual upgrade.
  await near(page,'slot_c','left');await button(page,'interact',touch);await tap(page,180,220,touch);
  expect(await page.evaluate(()=>Boolean(MelodiaDebug.DATA.flags.bridge_ledger_below))).toBe(false);
  for(const [slot,note] of [['slot_c','note_c'],['slot_e','note_e'],['slot_g','note_g']]){
    await near(page,slot,'left');await button(page,'interact',touch);
    const i=await page.evaluate(note=>(MelodiaDebug.UI.symbolMenu.filter||MelodiaDebug.DATA.symbols).indexOf(note),note);
    await tap(page,180,156+i*64,touch);await expect(page.locator('body')).toHaveAttribute('data-game-state','Explore');
  }
  // Correct notes in the wrong order still fail, then recover in ascending order.
  await step(page,'slot_g');expect(await page.evaluate(()=>MelodiaDebug.PUZZLES.bridge.hadMistake)).toBe(true);
  for(const id of ['slot_c','slot_e','slot_g'])await step(page,id);
  await expect.poll(()=>page.evaluate(()=>Boolean(MelodiaDebug.DATA.flags.ending_seen))).toBe(true);
  await finishCards(page,touch,'Title');
  const result=await page.evaluate(()=>({flags:MelodiaDebug.DATA.flags,quests:MelodiaDebug.DATA.quests,symbols:MelodiaDebug.DATA.symbols,missing:MelodiaDebug.preview.assets.state.missing}));
  expect(result.flags.part_melody).toBe(true);expect(result.quests.MQ02.state).toBe('rewarded');expect(result.missing).toEqual([]);expect(errors).toEqual([]);expect(bad).toEqual([]);
  await page.reload();await expect(page.locator('body')).toHaveAttribute('data-game-state','Title');await button(page,'continue',touch);
  expect(await page.evaluate(()=>MelodiaDebug.DATA.flags.part_melody)).toBe(true);
  await near(page,'forest_gate','left');await button(page,'interact',touch);await expect.poll(()=>page.evaluate(()=>MelodiaDebug.DATA.currentMap)).toBe('forest');await page.waitForTimeout(200);
  await step(page,'slot_c');await page.keyboard.down('KeyD');await page.waitForTimeout(1100);await page.keyboard.up('KeyD');
  expect(await page.evaluate(()=>MelodiaDebug.ENTITIES.player.x)).toBeGreaterThan(960);
  await near(page,'golden_note_01');await button(page,'interact',touch);
  expect(await page.evaluate(()=>MelodiaDebug.DATA.goldenNotes)).toEqual(['golden_note_01']);
  await page.reload();await expect(page.locator('body')).toHaveAttribute('data-game-state','Title');await button(page,'continue',touch);
  expect(await page.evaluate(()=>MelodiaDebug.DATA.goldenNotes)).toEqual(['golden_note_01']);
  await testInfo.attach('complete-story',{body:Buffer.from(JSON.stringify({touch,sequence,result,errors,bad},null,2)),contentType:'application/json'});await context.close();
});

test('FR-02 keyboard menu, dialogue and symbol controls expose semantic labels and live content',async({page})=>{
  await ready(page);const start=page.getByRole('button',{name:'새로 시작',exact:true});await start.focus();await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-game-state','Cutscene');await finishCards(page);
  await near(page,'clef');await page.keyboard.press('KeyE');await expect(page.getByRole('status')).toContainText('세계악보가 찢겨버렸다');await finishCards(page);
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'계속',exact:true})).toHaveCount(1);
  expect(await page.locator('#game-actions button').evaluateAll(xs=>xs.every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.height>=44;}))).toBe(true);
  await page.getByRole('button',{name:'계속',exact:true}).focus();await page.keyboard.press('Space');await expect(page.locator('body')).toHaveAttribute('data-game-state','Explore');
});

test('FR-03 all maps fit 320px and tall phones, retain collisions and freeze ambient motion',async({browser},testInfo)=>{
  const report=[];
  for(const viewport of [{width:320,height:568},{width:390,height:844}]){
    const context=await browser.newContext({viewport,hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();await ready(page);await button(page,'new',true);await finishCards(page,true);
    for(const map of ['village','tower','forest']){
      await page.evaluate(map=>{const d=MelodiaDebug;d.DATA.currentMap=map;d.ENTITIES.player.x=68;d.ENTITIES.player.y=100;d.HINT.seen={prologue_find_clef:2,prologue_attach:2,forest_bridge:2,crow_song:2};d.UI.toastTimer=0;d.UI.regionBannerTimer=0;},map);
      await page.keyboard.down('KeyA');await page.waitForTimeout(500);await page.keyboard.up('KeyA');await page.waitForTimeout(600);
      expect(await page.evaluate(()=>MelodiaDebug.ENTITIES.player.x)).toBeGreaterThanOrEqual(32);
      const bounds=await page.evaluate(()=>{const d=MelodiaDebug;return{map:d.DATA.currentMap,H:d.CONFIG.H,overflow:document.documentElement.scrollWidth>innerWidth,targets:[...document.querySelectorAll('#game-actions button')].map(b=>{const r=b.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}),missing:d.preview.assets.state.missing};});
      expect(bounds.overflow).toBe(false);expect(bounds.missing).toEqual([]);
      for(const r of bounds.targets){expect(r.w).toBeGreaterThanOrEqual(44);expect(r.h).toBeGreaterThanOrEqual(44);expect(r.x+r.w).toBeLessThanOrEqual(viewport.width+.1);expect(r.y+r.h).toBeLessThanOrEqual(viewport.height+.1);}
      // Settle camera before comparing reduced-motion pixels.
      await page.waitForTimeout(800);const a=await page.locator('#game').screenshot();await page.waitForTimeout(200);const b=await page.locator('#game').screenshot();expect(a.equals(b),map).toBe(true);report.push(bounds);
    }
    await context.close();
  }
  await testInfo.attach('all-map-mobile-layout',{body:Buffer.from(JSON.stringify(report)),contentType:'application/json'});
});

test('FR-04 production remains playable offline with the complete new atlas',async({browser})=>{
  const context=await browser.newContext({hasTouch:false});const page=await context.newPage();await ready(page,'/index.html');
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);await page.reload();await expect(page.locator('body')).toHaveAttribute('data-asset-status','ready');await expect(page.locator('body')).toHaveAttribute('data-game-state','Title');
  await button(page,'new');await finishCards(page);expect(await page.evaluate(()=>MelodiaDebug.preview.assets.state.missing)).toEqual([]);await context.close();
});

test('FR-05 pitched notes retain theory, staff positions, frequencies and original source assets',async({page,request})=>{
  await ready(page);const values=await page.evaluate(()=>({symbols:MelodiaDebug.SYMBOLS,frequencies:['C4','E4','G4'].map(n=>MelodiaDebug.noteToFreq(n))}));
  expect(['note_c','note_e','note_g'].map(id=>values.symbols[id].staffSlot)).toEqual(['ledger_below','line1','line2']);
  expect(values.frequencies[0]).toBeCloseTo(261.6256,3);expect(values.frequencies[1]).toBeCloseTo(329.6276,3);expect(values.frequencies[2]).toBeCloseTo(391.9954,3);
  expect(values.symbols.clef_g.theory).toBe('소용돌이가 감는 둘째 줄이 [솔]이에요.');
  expect((await request.get('/01%20Source/G%20Clef/G%20Clef.png')).ok()).toBe(true);
});
