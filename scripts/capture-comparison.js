'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
const baselineRef = '42f53f518b969fa40178c4fcd8fda1000b756f93';
const out = path.resolve(__dirname, '../artifacts');
fs.mkdirSync(out, { recursive: true });
const errors = [];
const report = { capturedAt: new Date().toISOString(), baseUrl: base, baseCommit: baselineRef, screenshots: [] };
const hash = s => crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
async function settle(page) {
  await page.waitForFunction(() => document.body.dataset.gameState === 'Explore');
  await page.waitForTimeout(250);
}
async function save(target, name, options = {}) { await target.screenshot({ path: path.join(out,name), ...options }); report.screenshots.push(name); }
(async()=>{
  const browser = await chromium.launch();report.browser=await browser.version();
  const desktop = await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'});
  const page=await desktop.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/comparison.html`);await page.waitForTimeout(600);
  for(const frame of page.frames().filter(f=>f.url().includes('preview='))) await settle(frame);
  await save(page,'desktop-comparison.png',{fullPage:true});
  await save(page.locator('.before iframe'),'desktop-before.png');
  await save(page.locator('.after iframe'),'desktop-after.png');
  report.desktop={width:1440,height:1000,dpr:2};await desktop.close();
  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
  for(const [art,name] of [['original','mobile-before.png'],['remaster','mobile-after.png']]){
    await phone.goto(`${base}/index.html?preview=harmonia&art=${art}&test=1&seed=42`);await settle(phone);await save(phone,name,{fullPage:true});
  }
  // Capture the actual educational palette as supporting evidence.
  await phone.keyboard.press('KeyQ');await phone.waitForFunction(()=>document.body.dataset.gameState==='SymbolSelect');await save(phone,'mobile-symbol-palette.png');
  await phone.goto(`${base}/comparison.html`);await phone.waitForTimeout(600);await save(phone,'mobile-comparison-page.png',{fullPage:true});
  report.mobile={width:390,height:844,dpr:2,hasTouch:true};await mobile.close();
  // Pair actual mobile screenshots without altering the captured pixels.
  const board=await browser.newPage({viewport:{width:846,height:960},deviceScaleFactor:1});
  const imageData=name=>`data:image/png;base64,${fs.readFileSync(path.join(out,name)).toString('base64')}`;
  await board.setContent(`<html lang="ko"><style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#f3f0e5;color:#29473f;font-family:system-ui}h1{margin:0 0 8px;font-size:21px}p{font-size:11px;color:#788971;margin:0 0 17px}.row{display:flex;gap:18px}figure{margin:0}figcaption{font-size:11px;margin-bottom:8px;letter-spacing:1px}img{width:390px;height:844px;display:block;border-radius:9px}</style><h1>하모니아 마을 · 모바일 전후 비교</h1><p>동일한 퀘스트와 위치 · Chromium 390 × 844 / DPR 2 / 터치 모드</p><div class="row"><figure><figcaption>BEFORE — 기존 화면</figcaption><img src="${imageData('mobile-before.png')}"></figure><figure><figcaption>AFTER — 개선 화면</figcaption><img src="${imageData('mobile-after.png')}"></figure></div></html>`);
  await board.locator('img').last().waitFor();await save(board,'mobile-comparison.png',{fullPage:true});await board.close();
  // Sample animation cadence on an otherwise idle desktop Chromium, not real phone hardware.
  const perf=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await perf.goto(`${base}/index.html?preview=harmonia&art=remaster&test=1&seed=42`);await settle(perf);
  report.frameTiming=await perf.evaluate(()=>new Promise(resolve=>{let previous;const deltas=[];function frame(t){if(previous)deltas.push(t-previous);previous=t;if(deltas.length<180)requestAnimationFrame(frame);else{const sorted=[...deltas].sort((a,b)=>a-b);resolve({samples:deltas.length,meanFps:1000/(deltas.reduce((a,b)=>a+b)/deltas.length),p95FrameMs:sorted[Math.floor(sorted.length*.95)],maxFrameMs:Math.max(...deltas)});}}requestAnimationFrame(frame);}));await perf.close();
  if(process.argv.includes('--production')){
    const prod=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce'});
    const response=await prod.goto('https://music-sign-adventure-game.vercel.app/?test=1&seed=42');
    const body=await response.text();const baseline=execFileSync('git',['show',`${baselineRef}:index.html`],{encoding:'utf8'});
    report.production={url:'https://music-sign-adventure-game.vercel.app/',matchesBaseCommit:hash(body)===hash(baseline),htmlSha256:hash(body)};
    await prod.waitForFunction(()=>document.body.dataset.gameState==='Title');
    // Only this fresh browser context receives a deterministic game save.
    await prod.evaluate(()=>{const d=MelodiaDebug;d.DATA.symbols=['clef_g'];d.DATA.codex=['clef_g'];d.DATA.flags={tower_examined:true,pitch_hint:true,got_clef_g:true};d.DATA.quests.MQ01={state:'active',objective:'높은음자리표를 탑 문에 붙여보자'};d.DATA.soundOn=false;d.AUDIO.muted=true;d.ENTITIES.player.x=502;d.ENTITIES.player.y=226;d.SAVE.write('test');d.SCENES.continueGame();d.ENTITIES.player.faceY=1;d.SCENES.camera.x=332;d.UI.regionBannerTimer=0;d.UI.toastTimer=0;});
    await settle(prod);await save(prod,'production-same-scene.png',{fullPage:true});await prod.close();
  }
  report.errors=errors;fs.writeFileSync(path.join(out,'capture-report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exit(1);});
