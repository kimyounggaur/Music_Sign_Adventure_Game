'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),webRoot=process.argv.includes('--built')?path.join(root,'dist'):root;
const out=path.join(root,'artifacts');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let f;try{f=path.resolve(webRoot,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!f.startsWith(webRoot+path.sep)){res.writeHead(403).end();return;}const data=fs.readFileSync(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404).end('Missing');}});
const options=process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--disable-gpu','--no-zygote']}:{};
async function settle(page,assets=false){await page.waitForFunction(()=>document.body.dataset.gameState==='Explore');if(assets)await page.waitForFunction(()=>document.body.dataset.assetStatus==='ready');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(160);}
async function tap(page,x,y){const box=await page.locator('#game').boundingBox(),H=await page.evaluate(()=>MelodiaDebug.CONFIG.H);await page.mouse.click(box.x+x*box.width/360,box.y+y*box.height/H);}
async function button(page,id){await page.waitForFunction(id=>MelodiaDebug.UI.buttons.some(b=>b.id===id&&b.enabled),id);const b=await page.evaluate(id=>MelodiaDebug.UI.buttons.find(b=>b.id===id),id);await tap(page,b.x+b.w/2,b.y+b.h/2);}
async function main(){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;const browser=await chromium.launch(options);const report={capturedAt:new Date().toISOString(),browser:browser.version(),source:process.argv.includes('--built')?'dist':'working-tree',errors:[],screenshots:[]};
 const errors=report.errors;const page=await browser.newPage({viewport:{width:1440,height:1020},deviceScaleFactor:1,reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/style-sheet.html');await page.evaluate(()=>document.fonts.ready);await page.locator('img').last().waitFor();await page.waitForTimeout(150);
 await page.locator('#style-board').screenshot({path:path.join(out,'harmonia-style-sheet.png')});report.screenshots.push('harmonia-style-sheet.png');
 if(process.argv.includes('--style-only')){await browser.close();server.close();console.log('Style sheet captured');return;}
 await page.goto(base+'/asset-review.html');for(const f of page.frames().filter(f=>f.url().includes('preview=')))await settle(f,f.url().includes('art=assets'));
 await page.screenshot({path:path.join(out,'harmonia-desktop-comparison.png'),fullPage:true});report.screenshots.push('harmonia-desktop-comparison.png');
 const phone=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce'});phone.on('pageerror',e=>errors.push(e.message));
 for(const art of ['original','remaster','assets']){await phone.goto(base+`/index.html?preview=harmonia&art=${art}&seed=42&test=1`);await settle(phone,art==='assets');await phone.screenshot({path:path.join(out,`harmonia-mobile-${art}.png`)});report.screenshots.push(`harmonia-mobile-${art}.png`);}
 await button(phone,'palette');await phone.waitForFunction(()=>document.body.dataset.gameState==='SymbolSelect');await phone.waitForTimeout(100);await phone.screenshot({path:path.join(out,'harmonia-music-symbol.png')});report.screenshots.push('harmonia-music-symbol.png');
 await tap(phone,180,156);await phone.waitForFunction(()=>MelodiaDebug.UI.symbolMenu.mode==='target');await tap(phone,180,328);await phone.waitForFunction(()=>MelodiaDebug.DATA.flags.tower_door_open);await phone.waitForTimeout(150);await phone.screenshot({path:path.join(out,'harmonia-door-open.png')});report.screenshots.push('harmonia-door-open.png');
 report.assetMetrics=await phone.evaluate(()=>MelodiaDebug.preview.assets.state);
 await button(phone,'interact');await phone.waitForFunction(()=>MelodiaDebug.DATA.currentMap==='tower');report.doorFlow={opened:true,enteredTower:true,heightAfter:await phone.evaluate(()=>MelodiaDebug.CONFIG.H)};
 const compact=await browser.newPage({viewport:{width:360,height:640},deviceScaleFactor:2,reducedMotion:'reduce'});compact.on('pageerror',e=>errors.push(e.message));await compact.goto(base+'/index.html?preview=harmonia&art=assets&seed=42&test=1');await settle(compact,true);await compact.screenshot({path:path.join(out,'harmonia-360x640.png')});report.screenshots.push('harmonia-360x640.png');
 await page.close();await phone.close();await compact.close();
 const p=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await p.goto(base+'/index.html?preview=harmonia&art=assets&seed=42&test=1');await settle(p,true);
 report.frameTiming=await p.evaluate(()=>new Promise(resolve=>{let prev;const times=[];function next(t){if(prev)times.push(t-prev);prev=t;if(times.length<180)requestAnimationFrame(next);else{const sorted=[...times].sort((a,b)=>a-b);resolve({samples:times.length,meanFps:1000/(times.reduce((a,b)=>a+b)/times.length),p95FrameMs:sorted[Math.floor(times.length*.95)],maxFrameMs:Math.max(...times),scope:'headless desktop Chromium; not a physical phone benchmark'});}}requestAnimationFrame(next);}));
 const sharp=require('sharp');const pair=[];for(const [i,name] of ['remaster','assets'].entries())pair.push({input:await sharp(path.join(out,`harmonia-mobile-${name}.png`)).resize(390,844).toBuffer(),left:24+i*410,top:64});
 const banner=Buffer.from('<svg width="848" height="920"><rect width="848" height="920" fill="#f5f1e6"/><text x="24" y="36" font-family="Noto Sans KR,sans-serif" font-size="17" fill="#24594e">첨부 비교본 → 에셋 적용 · 실제 게임 화면</text></svg>');await sharp(banner).composite(pair).png().toFile(path.join(out,'harmonia-mobile-comparison.png'));report.screenshots.push('harmonia-mobile-comparison.png');
 fs.writeFileSync(path.join(out,'asset-capture-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser.close();server.close();
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
