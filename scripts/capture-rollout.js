'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:4180';
const out=path.resolve(__dirname,'../artifacts/full-rollout');fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch();const report={browser:browser.version(),base,errors:[],screenshots:[]};
  for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){
    const page=await browser.newPage({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
    page.on('pageerror',e=>report.errors.push(e.message));
    await page.goto(base+'/index.html?test=1&seed=42');await page.waitForFunction(()=>document.body.dataset.gameState==='Title');
    for(const scene of ['title','village','tower','forest','bridge','codex']) {
      if(scene!=='title')await page.evaluate(scene=>{
        const d=MelodiaDebug;d.SCENES.startNewGame();d.UI.closeCutscene(true);while(d.state==='Dialogue')d.DIALOGUE.advance();
        d.DATA.symbols=['clef_g','note_c','note_e','note_g'];d.DATA.codex=d.DATA.symbols.slice();
        const map=scene==='bridge'?'forest':scene==='codex'?'village':scene;
        d.DATA.currentMap=map;document.body.dataset.mapId=map;
        const pos={village:[502,226],tower:[214,230],forest:[510,345],bridge:[860,365],codex:[502,226]}[scene];
        d.ENTITIES.player.x=pos[0];d.ENTITIES.player.y=pos[1];
        d.DATA.quests.MQ02={state:map==='forest'?'active':'not_started',objective:'도·미·솔을 오선의 제자리에 놓아보자'};
        d.DATA.quests.MQ01={state:map==='forest'?'rewarded':'active',objective:map==='tower'?'탑 안의 세계악보를 조사해보자':'높은음자리표를 탑 문에 붙여보자'};
        d.UI.toastTimer=0;d.UI.regionBannerTimer=0;
        if(scene==='codex'){d.UI.pauseView='codex';d.UI.codexDetail='note_c';Game.setState('Pause');}
      },scene);
      await page.waitForTimeout(600);const name=`${viewport.width===390?'mobile':'desktop'}-${scene}.png`;
      await page.screenshot({path:path.join(out,name)});report.screenshots.push(name);
    }
    report.metrics=await page.evaluate(()=>MelodiaDebug.preview.assets.state);await page.close();
  }
  fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
