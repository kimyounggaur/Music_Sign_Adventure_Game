'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../artifacts/full-rollout');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch();const results={browser:browser.version(),scope:'Headless Windows Chromium on this host, 390x844 DPR 2; not a physical phone benchmark',maps:[]};
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 await page.goto((process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:4180')+'/index.html?test=1&seed=42');await page.waitForFunction(()=>document.body.dataset.gameState==='Title');
 await page.evaluate(()=>{const d=MelodiaDebug;d.SCENES.startNewGame();d.UI.closeCutscene(true);while(d.state==='Dialogue')d.DIALOGUE.advance();});
 for(const map of ['village','tower','forest']){
  await page.evaluate(map=>{const d=MelodiaDebug;d.DATA.currentMap=map;d.ENTITIES.player.x=map==='tower'?214:500;d.ENTITIES.player.y=map==='tower'?200:350;},map);await page.waitForTimeout(600);
  const timing=await page.evaluate(()=>new Promise(resolve=>{let prev;const intervals=[];function tick(t){if(prev)intervals.push(t-prev);prev=t;if(intervals.length<240)requestAnimationFrame(tick);else{const sorted=[...intervals].sort((a,b)=>a-b);resolve({samples:intervals.length,meanFps:1000/(intervals.reduce((a,b)=>a+b)/intervals.length),p95FrameMs:sorted[Math.floor(intervals.length*.95)],maxFrameMs:Math.max(...intervals)});}}requestAnimationFrame(tick);}));
  results.maps.push({map,...timing});
 }
 results.assets=await page.evaluate(()=>{const a=MelodiaDebug.preview.assets.state;return{loadMs:a.loadMs,decodedBytes:a.decodedBytes,pages:a.pageCount,frames:a.frameCount,missing:a.missing,transferredBytes:performance.getEntriesByType('resource').reduce((n,r)=>n+(r.transferSize||0),0)}});
 results.staticTerrainDecodedBytes=(960*640+448*384+1280*800)*4*4;
 results.totalAtlasAndTerrainMiB=(results.assets.decodedBytes+results.staticTerrainDecodedBytes)/1048576;
 fs.writeFileSync(path.join(out,'performance.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
