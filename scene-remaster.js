/* Original Canvas artwork for the opt-in Harmonia scene study.
 * No third-party artwork, fonts, or character designs. Gameplay is owned by Game.
 * Static landscape is cached; only characters, light motes and UI redraw.
 */
window.createHarmoniaArt = function createHarmoniaArt(g) {
  'use strict';
  const { ctx, UI, INPUT, ENTITIES, SCENES, CONFIG, SYMBOLS } = g;
  const P = { ink:'#233d38', teal:'#24594e', mint:'#a3c5aa', gold:'#e9bd63', cream:'#fff8e8', paper:'#f3ead5', stone:'#decda7' };
  let c = ctx;
  let terrain, terrainMap;
  const terrainCache = new Map();
  const extended = g.full ? window.createAdventureArt(g) : null;
  const assets = g.assetRenderer || null;
  const scenery = [];
  const animationState = new Map();
  const offset = 120;
  const time = () => CONFIG.REDUCED_MOTION ? 0 : performance.now() / 1000;
  function round(x,y,w,h,r,fill,stroke) {
    c.beginPath(); c.roundRect(x,y,w,h,r); c.fillStyle=fill; c.fill();
    if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}
  }
  function ellipse(x,y,rx,ry,fill) { c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill(); }
  function path(d,fill,stroke,width=1) { const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);} }
  function line(x,y,x2,y2,color,width=1) { c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke(); }
  const secondaryText = new Set(['#78826b','#8b927d','#929a80','#839074','#798875','#7a8c70','#778773','#8b9579','#8a947c','#7b8a6e']);
  function text(s,x,y,size=12,color=P.ink,align='left',weight=600) {c.font=`${weight} ${size}px "Malgun Gothic", system-ui, sans-serif`;c.fillStyle=g.full&&secondaryText.has(color)?'#536b59':color;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(s,x,y);}
  function gradient(x,y,x2,y2,stops){const a=c.createLinearGradient(x,y,x2,y2);stops.forEach(([p,col])=>a.addColorStop(p,col));return a;}
  function shadow(x,y,rx,ry=rx*.28){ellipse(x+5,y+4,rx,ry,'rgba(24,52,40,.18)');ellipse(x,y,rx*.7,ry*.55,'rgba(24,52,40,.16)');}
  function hash(x,y){return ((Math.sin(x*127.1+y*311.7)*43758.5453)%1+1)%1;}
  function sprig(x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);path('M0 2 Q-6 -4 -4 -8 Q1 -7 0 2 M0 2 Q2 -9 6 -8 Q7 -2 0 2', '#648b58');line(0,3,0,-7,'#4f774b',.7);c.restore();}
  function bush(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);shadow(0,4,23,7);ellipse(0,-4,25,13,'#547d56');ellipse(-12,-10,14,11,'#75995e');ellipse(7,-14,18,13,'#8aa765');ellipse(18,-5,12,10,'#658b55');ellipse(2,-19,10,4,'#abc17b');for(let i=0;i<7;i++){ellipse(-17+i*5,-9-hash(i,x)*8,1.3,1.8,i%3?'#b4c67a':'#f2d38a');}c.restore();}
  function tree(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);path('M-9 10 L28 23 L47 12 L7 -13Z','rgba(30,59,43,.14)');shadow(1,6,29,10);path('M-5 6 L-4 -30 L5 -35 L7 5 L16 10 L2 8 L-11 10Z','#716647');path('M0 3 L-1 -29 L3 -30 L4 3Z','#a18b58');ellipse(0,-39,37,28,'#3d6a50');ellipse(20,-45,24,23,'#477c58');ellipse(-20,-47,25,22,'#648d5b');ellipse(-8,-64,27,23,'#78a16a');ellipse(14,-67,23,19,'#92b178');ellipse(-12,-76,15,8,'#b8ca8c');path('M-32 -40 Q-25 -48 -16 -42 M-14 -60 Q-5 -68 6 -62 M12 -48 Q21 -57 30 -51',null,'rgba(220,228,159,.28)',3);c.restore();}
  function drawAsset(id,x,y,options={}) { return assets.draw(id,x,y,{ctx:c,...options}); }
  function symbol(id,x,y,w,h,color=P.gold) { return extended ? extended.musicalNote(id,x,y,w,h,color) : g.symbolArt(id,x,y,w,h,color); }
  function assetTerrainLayer(){
    const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1280;
    const previous=c;c=canvas.getContext('2d');c.scale(2,2);
    const map=g.map();const road=(x,y)=>map.ground[y]?.[x]===1;
    for(let y=0;y<20;y++)for(let x=0;x<30;x++){
      drawAsset(`grass_${1+Math.floor(hash(x,y)*3)}`,x*32,y*32);
      if(!road(x,y))continue;
      drawAsset(`path_center_${1+Math.floor(hash(y,x)*2)}`,x*32,y*32);
      const n=road(x,y-1),e=road(x+1,y),s=road(x,y+1),w=road(x-1,y);
      for(const [side,on] of [['n',n],['e',e],['s',s],['w',w]])if(!on)drawAsset(`path_edge_${side}`,x*32,y*32);
      for(const [corner,a,b,dx,dy] of [['ne',n,e,1,-1],['se',s,e,1,1],['sw',s,w,-1,1],['nw',n,w,-1,-1]]){
        if(!a&&!b)drawAsset(`path_outer_${corner}`,x*32,y*32);
        else if(a&&b&&!road(x+dx,y+dy))drawAsset(`path_inner_${corner}`,x*32,y*32);
      }
    }
    assets.drawRect('tower_ground_shadow',416,-16,192,224,{ctx:c});
    // Every tall sprite joins the same feet-depth sort as gameplay objects.
    scenery.length=0;
    for(const x of [358,389,610,647])for(const y of [93,148,219,404,447])scenery.push({id:`bush_${1+Math.floor(hash(x,y)*3)}`,x:x+(hash(x,y)-.5)*12,y:y+(hash(y,x)-.5)*15,scale:.6+hash(x,y)*.45});
    for(let x=24;x<960;x+=48){scenery.push({id:`tree_${1+Math.floor(hash(x,4)*3)}`,x,y:24,scale:.85+hash(x,4)*.25});scenery.push({id:`tree_${1+Math.floor(hash(x,5)*3)}`,x,y:642,scale:1.1});}
    for(let y=90;y<590;y+=69){scenery.push({id:`tree_${1+Math.floor(hash(y,6)*3)}`,x:14,y,scale:1});scenery.push({id:`tree_${1+Math.floor(hash(y,7)*3)}`,x:951,y,scale:1.2});}
    for(let i=0;i<75;i++){const x=40+hash(i,12)*880,y=45+hash(i,13)*560;if(!road(Math.floor(x/32),Math.floor(y/32)))drawAsset(`cluster_${1+i%4}`,x,y,{scale:.65+hash(i,14)*.3});}
    for(const x of [391,620]){drawAsset('stone_1',x-30,260);drawAsset('stone_2',x,260);drawAsset('cluster_4',x,261);}
    for(const x of [438,586])scenery.push({id:'props_lantern',x,y:204,scale:.65});
    for(const x of [96,672])scenery.push({house:true,x,y:544});
    c=previous;return canvas;
  }
  function assetPerson(x,y,role,faceX,faceY,moving,pose){
    const direction=faceX<0?'left':faceX>0?'right':faceY<0?'up':'down';
    const character=role==='elder'?'clef':'sol';
    const doorReact=role==='elder'&&g.map().objects.some(o=>o.type==='towerDoor'&&o.openAnim);
    let animation=role==='elder'?(doorReact?'react':g.state()==='Dialogue'&&g.dialogue.active?.speaker==='클레프'?'talk':'idle'):pose==='lift'?'acquire':g.state()==='Dialogue'||g.state()==='SymbolSelect'?'interact':moving?'walk':'idle';
    // The acquisition and conversation sprites intentionally face the viewer.
    const facing=animation==='acquire'||animation==='interact'||character==='clef'?'down':direction;
    let name=`${character}.${animation}.${facing}`;
    if(!assets.manifest.animations[name]&&animation==='interact')name=`${character}.interact.down`;
    const key=character;let state=animationState.get(key);
    if(!state||state.name!==name){state={name,start:time()};animationState.set(key,state);}
    const elapsed=animation==='acquire'?(UI.itemGet?.timer||0):time()-state.start;
    shadow(x,y,14,4.5);
    if(moving&&!CONFIG.REDUCED_MOTION&&assets.has('fx_foot_dust_0'))drawAsset(`fx_foot_dust_${Math.floor(elapsed*8)%5}`,x,y,{alpha:.55,pivot:[32,44]});
    const fps=animation==='walk'?8:animation==='idle'?2:character==='clef'?5:6;
    const frameId=assets.animationFrame(name,elapsed,{fps,reducedMotion:CONFIG.REDUCED_MOTION,loop:animation!=='acquire'});
    assets.sceneState[character]={frameId,direction:facing,animation,fps,flipX:false,timeSeconds:CONFIG.REDUCED_MOTION?0:elapsed,feet:[x,y]};
    if(frameId)drawAsset(frameId,x,y);else assets.drawAnimation(name,x,y,elapsed,{fps});
  }
  function assetHouse(x){
    shadow(x+64,545,74,18);round(x,448,128,96,5,'#d8c9a7','#9b9473');
    for(let y=474;y<542;y+=15)line(x+2,y,x+126,y,'#c1b894');
    roof(x-1,428,130,45);round(x+51,503,26,41,[12,12,0,0],'#796d4e');
    for(const dx of [19,87]){round(x+dx,489,22,27,[9,9,1,1],'#467265','#baaa78');line(x+dx+11,491,x+dx+11,515,'#dbca97',2);round(x+dx-4,515,30,5,2,'#ecdbb2');}
  }
  function terrainLayer(){
    const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1280;
    const previous=c;c=canvas.getContext('2d');c.scale(2,2);
    c.fillStyle=gradient(0,0,500,640,[[0,'#bac58d'],[.4,'#9cb77a'],[1,'#729e73']]);c.fillRect(0,0,960,640);
    // Soft lawn islands and a continuous stone path follow the existing tile map.
    for(let i=0;i<130;i++){const x=hash(i,1)*960,y=hash(i,2)*640;ellipse(x,y,18+hash(i,3)*48,9+hash(i,4)*15,i%2?'rgba(217,224,160,.10)':'rgba(56,102,68,.055)');}
    const map=g.map();
    for(let y=0;y<20;y++)for(let x=0;x<30;x++)if(map.ground[y][x]===1){
      const px=x*32,py=y*32;
      round(px-3,py-3,38,38,7,'#82936b');round(px-1,py-1,34,34,5,'#f1e4bc');
    }
    for(let y=0;y<20;y++)for(let x=0;x<30;x++)if(map.ground[y][x]===1){
      const px=x*32,py=y*32;c.fillStyle='#dccc9d';c.fillRect(px,py,32,32);
      for(let j=0;j<2;j++){const xx=px+3+hash(x+j,y)*4,yy=py+3+j*16;round(xx,yy,21-hash(y+j,x)*5,11+hash(x,y+j)*2,4,j%2?'#ded1a7':'#e5d9b4');line(xx+4,yy+1,xx+12,yy+1,'rgba(255,248,209,.25)');}
    }
    for(let i=0;i<1050;i++){const x=hash(i,7)*960,y=hash(i,8)*640;if(map.ground[Math.floor(y/32)]?.[Math.floor(x/32)]===0){if(i%6===0)sprig(x,y,.6+hash(i,2)*.4);else ellipse(x,y,.6+hash(i,3),.65,i%4?'rgba(44,92,55,.16)':'#e8db97');}}
    // Planted borders are low, walk-through vegetation; tall trees stay on boundary cells.
    for(const x of [358,389,610,647])for(const y of [93,148,219,404,447])bush(x+(hash(x,y)-.5)*12,y+(hash(y,x)-.5)*15,.6+hash(x,y)*.45);
    for(let x=24;x<960;x+=48){tree(x,24,.85+hash(x,4)*.25);tree(x,642,1.1);}
    for(let y=90;y<590;y+=69){tree(14,y,1);tree(951,y,1.2);}
    // Low garden walls frame the tower without adding collision geometry.
    for(const xx of [425,585]){round(xx,102,9,112,3,'#899570');round(xx-2,99,13,6,2,'#e4d4ab');for(let yy=112;yy<210;yy+=13)line(xx,yy,xx+9,yy,'#bcc09a');}
    // Stone-set garden beds and cream flowers.
    for(const xx of [391,620]){ellipse(xx,261,27,10,'#8f9e73');for(let i=0;i<8;i++){const x=xx-20+i*6,y=255+hash(i,xx)*8;sprig(x,y,.9);ellipse(x-2,y-6,2,2,'#fcf0bd');ellipse(x+1,y-8,2,2,'#fff6d9');ellipse(x+3,y-5,2,2,'#e8c66e');}}
    // The two existing blocked building footprints remain visible when walking
    // beyond the comparison framing; no new collision or map layout is added.
    for(const x of [96,672]){
      shadow(x+64,545,74,18);round(x,448,128,96,5,'#d8c9a7','#9b9473');
      for(let y=474;y<542;y+=15)line(x+2,y,x+126,y,'#c1b894');
      roof(x-1,428,130,45);round(x+51,503,26,41,[12,12,0,0],'#796d4e');
      for(const dx of [19,87]){round(x+dx,489,22,27,[9,9,1,1],'#467265','#baaa78');line(x+dx+11,491,x+dx+11,515,'#dbca97',2);round(x+dx-4,515,30,5,2,'#ecdbb2');}
    }
    // Sunlight across the clearing, painted once instead of an expensive per-frame blur.
    c.fillStyle=gradient(250,40,650,500,[[0,'rgba(255,242,181,.25)'],[1,'rgba(255,242,181,0)']]);path('M260 20 L340 20 L720 490 L580 490Z',c.fillStyle);
    c=previous;return canvas;
  }
  function roof(x,y,w,h){
    path(`M${x-8} ${y+h} Q${x+8} ${y+h-12} ${x+w/2} ${y} Q${x+w-5} ${y+h-12} ${x+w+8} ${y+h} L${x+w+8} ${y+h+7} Q${x+w/2} ${y+h+15} ${x-8} ${y+h+7}Z`,gradient(x,y,x+w,y+h,[[0,'#548476'],[.45,'#35685b'],[1,'#234e44']]),'#203f36',1.5);
    for(let j=1;j<5;j++){const yy=y+h*j/5,span=w/2*j/5;path(`M${x+w/2-span} ${yy} Q${x+w/2} ${yy+8} ${x+w/2+span} ${yy}`,null,'#71917a',1);for(let k=-j;k<=j;k++)line(x+w/2+k*9,yy+2,x+w/2+k*9-3,yy+8,'rgba(20,50,40,.24)');}
    path(`M${x-8} ${y+h} Q${x+w/2} ${y+h+8} ${x+w+8} ${y+h}`,null,'#d6be7e',3);
  }
  function tower(){
    if(assets){
      for(const id of ['tower_body','tower_roof','tower_foreground_trim'])assets.drawRect(id,416,-16,192,224,{ctx:c});
      drawAsset('ui_note',512,95,{scale:.75});
      text('오르골 탑',512,174,9,'#fff2cc','center',700);
      return;
    }
    c.save();c.translate(448,64);
    path('M-8 126 L45 170 L151 166 L163 146 L128 89Z','rgba(35,63,44,.16)');shadow(66,138,77,20);
    round(-6,123,140,14,5,'#8e997f');round(-9,119,146,11,4,'#ded6b7');round(-5,116,138,7,3,'#f7edcf');
    round(0,14,128,106,7,gradient(0,0,128,130,[[0,'#f5ead0'],[.65,'#decba3'],[1,'#b4a584']]),'#b7aa87');
    round(9,13,110,8,2,'#788576');
    for(let y=33;y<117;y+=17){line(2,y,126,y,'rgba(136,117,81,.24)');for(let x=8+(y%2)*12;x<125;x+=29)line(x,y,x,y+17,'rgba(136,117,81,.15)');}
    for(const x of [1,117]){round(x,31,10,83,2,'#c7bd9e');for(let y=35;y<115;y+=13)round(x-1,y,12,4,1,'#ecdfbb');}
    // Twin arched windows, reflected sky and inset frames.
    for(const x of [20,88]){round(x-3,49,26,43,[13,13,3,3],'#b8a47f');round(x,52,20,36,[10,10,2,2],'#315e57');round(x+2,54,7,29,[5,3,0,0],'#87b7a8');line(x+10,54,x+10,88,'#d5bd80',2);line(x+1,71,x+19,71,'#d5bd80',2);round(x-5,90,30,5,2,'#f6e9c6');}
    roof(-8,-25,144,63);
    // A small music-box lantern turret gives the building a distinct silhouette.
    round(48,-34,32,36,[12,12,2,2],'#ecdfbe','#897c59');round(54,-27,20,21,[9,9,1,1],'#345e51');line(64,-26,64,-8,'#e4cc91',2);roof(45,-55,38,25);line(64,-57,64,-68,'#c2a259',2);ellipse(64,-69,3,3,'#f0d78e');
    // Clock rosette: five staff lines and a musical emblem, not a borrowed logo.
    ellipse(64,33,21,20,'#9a8359');ellipse(64,31,18,18,'#eddbab');ellipse(64,31,14,14,'#385e52');for(let i=0;i<5;i++)line(55,24+i*3.5,73,24+i*3.5,'#849b7b',.65);text('♪',64,41,25,'#efd593','center');
    round(30,101,68,13,3,'#536c53');text('오르골 탑',64,110,9,'#fff2cc','center',700);
    // Brass lanterns and restrained warm pools of light.
    for(const x of [13,114]){ellipse(x,112,16,20,'rgba(255,213,112,.11)');line(x,101,x,110,'#54634b',2);round(x-4,108,8,11,2,'#8c743f');round(x-2.5,109,5,7,1,'#ffe4a3');}
    c.restore();
  }
  function door(obj){const x=obj.x*32,y=obj.y*32;const open=g.data().flags.tower_door_open;
    if(assets){
      const animating=Boolean(obj.openAnim&&!open);
      drawAsset(open?'tower_door_open':animating?'tower_door_half_open':'tower_door_closed',x+32,y+32);
      if(!open&&!animating)symbol('clef_g',x+24,y-1,16,26,'#f0d082');
      if(animating)drawAsset(`fx_door_response_${CONFIG.REDUCED_MOTION?2:Math.min(4,Math.floor(obj.openAnim/.9*5))}`,x+32,y+20);
      if(UI.symbolMenu?.mode==='target'&&g.state()==='SymbolSelect')drawAsset(`fx_attach_glow_${CONFIG.REDUCED_MOTION?2:Math.floor(time()*4)%5}`,x+32,y+13);
      return;
    }
    shadow(x+32,y+31,33,8);round(x-5,y-8,74,42,[17,17,3,3],'#c1b08b');round(x,y-6,64,38,[15,15,2,2],open?'#24483f':'#725e3e','#394d3c');
    if(open){round(x+5,y,54,28,[12,12,0,0],gradient(0,y,0,y+30,[[0,'#152f2d'],[1,'#c9c894']]));line(x+13,y+30,x+51,y+30,'#f0d38b',2);}else{for(let i=1;i<7;i++)line(x+i*9,y+1,x+i*9,y+30,'#554b35');round(x+24,y-1,16,26,5,'#315d53','#bea56b');text('𝄞',x+32,y+22,25,'#f0d082','center');ellipse(x+47,y+16,2,2,'#e6c473');}
    if(obj.openAnim&&!CONFIG.REDUCED_MOTION){const a=Math.min(1,obj.openAnim/.9);ellipse(x+32,y+15,35+a*12,22,'rgba(243,210,129,.15)');}
  }
  function person(x,y,role='sol',faceX=0,faceY=1,moving=false,pose='normal'){
    if(assets&&role!=='child'&&role!=='bard'){assetPerson(x,y,role,faceX,faceY,moving,pose);return;}
    const t=time();const step=moving?Math.sin(t*14)*2:0;const bob=moving?Math.abs(step)*.4:Math.sin(t*2.3)*.45;
    shadow(x,y,14,4.5);c.save();c.translate(x,y+bob);
    const elder=role==='elder',child=role==='child';const coat=elder?'#61765c':child?'#d4ab5c':role==='bard'?'#867398':'#376f72';
    ellipse(-5,-2+step,4,3,'#4a4940');ellipse(5,-2-step,4,3,'#4a4940');
    path('M-8 -23 Q0 -28 8 -23 L11 -5 Q0 0 -11 -5Z',coat,'#355548');
    path('M-7 -22 Q-1 -25 1 -23 L-1 -6 L-9 -7Z',elder?'#8d9e78':'#609698');
    line(2,-20,4,-5,'#c7ac69',1.5);ellipse(5,-11,1,1,'#e7d096');
    const armY=pose==='lift'?-29:-15;ellipse(-10,armY,3,4,'#e9bc8d');ellipse(10,armY,3,4,'#edc69b');
    ellipse(0,-30,12,13,elder?'#b9b7a0':'#554c3c');ellipse(faceX*2,-28,10,10,'#f0cba0');
    if(faceY>=0){path('M-11 -31 Q-12 -44 0 -43 Q12 -43 12 -30 Q6 -32 3 -37 Q-1 -30 -11 -31Z',elder?'#d5d3bb':'#554734');ellipse(-5+faceX*4,-27,1.15,1.4,'#3b473e');if(faceX===0)ellipse(5,-27,1.15,1.4,'#3b473e');ellipse(-7,-24,2,1,'rgba(206,127,100,.4)');path('M-2 -22 Q0 -20 3 -22',null,'#ad775a',.7);}else{ellipse(0,-31,11,12,elder?'#cccbb3':'#554734');path('M-7 -36 Q-2 -40 5 -36',null,'#85704e',2);}
    if(elder){path('M-8 -24 Q0 -19 8 -24 Q7 -11 0 -9 Q-8 -12 -8 -24Z','#e0dcc4');line(14,-29,14,0,'#806c43',2);ellipse(14,-30,3,3,'#bcab73');}
    else if(child){ellipse(-11,-34,5,6,'#6c5037');ellipse(11,-34,5,6,'#6c5037');}
    else{path('M-9 -20 Q-2 -16 9 -21 L9 -17 Q0 -12 -8 -16Z','#e1b968');path('M7 -17 L15 -10 L12 -6 L5 -17Z','#c29b53');line(-7,-18,8,-6,'#463f31',2);round(5,-10,8,8,2,'#a87d4d','#745d3b');text('♪',-8,-35,13,'#efcb70','center',800);}
    if(role==='bard'){ellipse(10,-10,8,10,'#c6a570');ellipse(10,-11,3,4,'#5d6350');line(11,-17,16,-31,'#a38755',4);for(let i=0;i<3;i++)line(9+i,-7,15+i*.4,-28,'#eee0a8',.5);}
    c.restore();
  }
  function object(obj){
    const r=g.objectRect(obj),x=r.x+r.w/2,y=r.y+r.h;
    if(extended?.object(obj))return;
    if(obj.id==='tower_body'){tower();return;}
    if(obj.type==='towerDoor'){door(obj);return;}
    if(obj.type==='npc'){person(x,y-2,obj.role);if(UI.interactTarget===obj&&g.state()==='Explore'){round(x-26,y-67,52,19,8,P.cream);text(obj.label,x,y-54,10,P.teal,'center');}return;}
    if(assets&&obj.id==='well'){drawAsset('props_well',x,y);return;}
    if(assets&&obj.type==='sign'){drawAsset('props_sign',x,y);return;}
    if(assets&&obj.type==='pickup'){drawAsset('bush_3',x,y);symbol(obj.symbol,x-10,y-33,20,28,'#f0d082');return;}
    if(obj.id==='well'){shadow(x,y,36,9);round(r.x+1,r.y+33,62,30,8,'#b5b397','#747d66');ellipse(x,r.y+36,30,12,'#e0d8b6');ellipse(x,r.y+35,23,8,'#365d55');for(const dx of [7,53])round(r.x+dx,r.y+5,4,42,2,'#877951');roof(r.x-2,r.y-7,68,24);line(x,r.y+17,x,r.y+37,'#c7b585',1);return;}
    if(obj.type==='sign'){shadow(x,y,20);round(x-3,r.y+9,6,r.h-5,2,'#82714f');round(r.x+1,r.y+2,r.w-2,24,4,'#d7bd82','#8c805b');text('→',x,r.y+21,19,P.teal,'center');return;}
    g.originalObject(obj);
  }
  function world(){
    const map=g.map();
    if(terrainMap!==map.id){
      let entry=terrainCache.get(map.id);
      if(!entry){
        if(extended&&map.id!=='village')entry=extended.terrain(map);
        else {const canvas=assets?assetTerrainLayer():terrainLayer();entry={canvas,scenery:scenery.slice()};}
        terrainCache.set(map.id,entry);
      }
      terrain=entry.canvas;scenery.length=0;scenery.push(...entry.scenery);terrainMap=map.id;
    }
    c=ctx;c.fillStyle=map.id==='tower'?'#243f3c':'#9cb77a';c.fillRect(0,0,360,CONFIG.H);c.save();c.translate(-Math.round(SCENES.camera.x),offset-Math.round(SCENES.camera.y));
    c.drawImage(terrain,0,0,map.w*32,map.h*32);
    const items=g.map().objects.filter(g.visible).map(obj=>({obj,y:(obj.y+(obj.h||1))*32}));items.push({player:true,y:ENTITIES.player.y+24});if(assets)items.push(...scenery.map(sprite=>({sprite,y:sprite.y})));items.sort((a,b)=>a.y-b.y);
    items.forEach(item=>{if(item.y<SCENES.camera.y-120||item.y>SCENES.camera.y+CONFIG.H)return;if(item.player){const p=ENTITIES.player;person(p.x+10,p.y+24,'sol',p.faceX,p.faceY,p.moving,p.pose);}else if(item.sprite){const s=item.sprite;if(s.house)assetHouse(s.x);else drawAsset(s.id,s.x,s.y,{scale:s.scale});}else object(item.obj);});
    // Tiny drifting pollen; at rest under reduced-motion preference.
    for(let i=0;i<12;i++){const x=330+hash(i,44)*370+Math.sin(time()*.25+i)*4,y=70+hash(i,45)*370+Math.cos(time()*.2+i)*3;ellipse(x,y,1,1,'rgba(255,246,198,.65)');}
    ENTITIES.particles.forEach(p=>{c.globalAlpha=Math.max(0,p.life);if(p.kind==='dot')ellipse(p.x,p.y,p.r||2,p.r||2,p.color);else if(assets&&p.text==='♪')drawAsset('ui_note',p.x,p.y,{scale:.7});else text(p.text,p.x,p.y,18,p.color,'center');});c.globalAlpha=1;c.restore();
    c.fillStyle=gradient(0,CONFIG.H-220,0,CONFIG.H-90,[[0,'rgba(34,66,49,0)'],[1,'rgba(34,66,49,.18)']]);c.fillRect(0,CONFIG.H-220,360,130);
  }
  function icon(kind,x,y,color=P.cream){if(assets){drawAsset({pause:'ui_pause',sound:g.data().soundOn?'ui_sound':'ui_sound_off',book:'ui_symbol_bag',arrow:'ui_interact'}[kind],x,y,{tint:color});return;}c.save();c.translate(x,y);c.lineCap='round';c.lineJoin='round';if(kind==='pause'){line(-3,-5,-3,5,color,2);line(3,-5,3,5,color,2);}else if(kind==='sound'){path('M-7 -3 L-3 -3 L2 -7 L2 7 L-3 3 L-7 3Z',null,color,1.5);path('M5 -4 Q9 0 5 4',null,color,1.5);}else if(kind==='book'){path('M0 -5 Q-6 -9 -10 -6 L-10 8 Q-5 5 0 8 Q5 5 10 8 L10 -6 Q6 -9 0 -5 L0 8',null,color,1.5);}else if(kind==='arrow'){path('M-6 0 L6 0 M1 -5 L6 0 L1 5',null,color,1.8);}c.restore();}
  function panel(x,y,w,h){c.save();c.shadowColor='rgba(32,53,38,.15)';c.shadowBlur=12;c.shadowOffsetY=4;round(x,y,w,h,12,P.cream);c.restore();}
  function hud(){
    const data=g.data(),active=g.quest();c=ctx;
    c.fillStyle=gradient(0,0,0,116,[[0,'rgba(27,55,47,.98)'],[.62,'rgba(27,55,47,.91)'],[1,'rgba(27,55,47,0)']]);c.fillRect(0,0,360,116);
    text('MELODIA',17,22,10,'#d5bd80','left',800);text(g.full?g.map().name:'하모니아 마을',17,43,16,'#fff8e8','left',700);
    if(assets){drawAsset('ui_note',211,29,{scale:.75});text(String(data.goldenNotes.length),231,34,17,'#efd58e','center',700);}else text(`♪ ${data.goldenNotes.length}`,222,34,17,'#efd58e','center',700);
    UI.button('soundHud',248,8,44,44,'소리');UI.button('pause',302,8,44,44,'일시정지');
    round(248,8,44,44,12,'rgba(255,249,225,.08)','rgba(231,222,189,.16)');icon('sound',270,30);if(!assets&&!data.soundOn)line(261,39,279,21,'#deb67d',1.5);
    round(302,8,44,44,12,'rgba(255,249,225,.08)','rgba(231,222,189,.16)');icon('pause',324,30);
    UI.button('objectiveHud',12,62,336,49,'현재 목표');panel(12,62,336,49);round(23,73,26,26,8,'#e4ead5');text(active?.[0]==='MQ02'?'02':'01',36,90,10,P.teal,'center',800);
    text(active?g.questTitle(active[0]):'마을 산책',60,79,10,'#78826b');
    text(active?active[1].objective:'마을 사람들과 이야기해 보세요',60,98,12,P.ink,'left',700);
    if(UI.objectiveBubbleTimer>0){panel(28,121,304,43);c.font='600 11px system-ui';c.fillStyle=P.ink;c.textAlign='left';g.wrap(g.full?(g.hint()||active?.[1].objective||'이야기를 나누고 반짝이는 기호를 찾아보세요.'):'기호 가방에서 높은음자리표를 골라 문에 놓으세요.',42,139,276,17,2);}
    // Context appears next to its target, with an unambiguous action button below.
    const target=UI.interactTarget,enabled=Boolean(target),open=data.flags.tower_door_open;
    if(target?.type==='towerDoor'&&g.state()==='Explore'){const x=target.x*32+32-SCENES.camera.x,y=target.y*32+offset-26-SCENES.camera.y;round(x-42,y,84,21,9,P.teal,'#c6cda3');text(open?'탑 안으로 들어가기':'기호가 잠든 문',x,y+14,10,P.cream,'center');}
    // Bottom dock is anchored to the canvas safe area. Interactive dimensions >=44px.
    const extra=CONFIG.H-640;
    c.save();c.translate(0,extra);
    c.fillStyle=gradient(0,480,0,555,[[0,'rgba(244,237,216,0)'],[.9,'#f4edd8']]);c.fillRect(0,480,360,75);c.fillStyle='#f4edd8';c.fillRect(0,552,360,88);
    line(16,528,344,528,'#d4ceb4');text('이동',70,550,10,'#657563','center');
    const joy=INPUT.joy,baseX=joy.active?joy.baseX:70,baseY=joy.active?joy.baseY-extra:591;
    ellipse(baseX,baseY,35,35,'rgba(46,83,67,.07)');c.strokeStyle='#b9c4a6';c.lineWidth=1;c.beginPath();c.arc(baseX,baseY,35,0,Math.PI*2);c.stroke();
    if(assets)drawAsset('ui_move',baseX,baseY,{scale:2.5,alpha:.5,tint:P.teal});
    for(const [dx,dy] of [[0,-25],[25,0],[0,25],[-25,0]])ellipse(baseX+dx,baseY+dy,1.5,1.5,'#84977c');
    ellipse(joy.active?joy.x:baseX,joy.active?joy.y-extra:baseY+2,17,17,'rgba(35,68,54,.14)');ellipse(joy.active?joy.x:baseX,joy.active?joy.y-extra:baseY,17,17,'#fff9e8');
    text('W A S D',70,637,8,'#8b927d','center');
    UI.button('palette',137,554+extra,90,70,'기호 가방',data.symbols.length>0);panel(137,554,90,70);if(assets)drawAsset('ui_symbol_bag',157,573,{tint:P.teal});else text('♪',157,580,21,'#a78a4a','center');text('Q',211,574,8,'#929a80','center');text('기호 가방',182,597,12,P.teal,'center',700);text(`${data.symbols.length}개 발견`,182,612,9,'#839074','center');
    UI.button('interact',240,554+extra,105,70,'상호작용',enabled);round(240,557,105,70,13,'#bac3a1');round(240,554,105,70,13,enabled?P.teal:'#d8dec9');text('E',330,570,8,enabled?'#b8cbb0':'#798875','center');icon('arrow',291,575,enabled?'#ebd69a':'#81947b');text(enabled?UI.verbFor(target):'둘러보기',292,599,14,enabled?P.cream:'#617560','center',700);text(target?.label||'가까이 다가가세요',292,615,9,enabled?'#b9cbb0':'#7a8c70','center');
    if(CONFIG.DEBUG)text(`${Math.round(g.fps())} FPS`,16,515,9,P.cream);
    c.restore();
  }
  function palette(){
    c=ctx;const menu=UI.symbolMenu;
    if(menu.mode==='target'){
      panel(12,62,336,62);const s=SYMBOLS[menu.selected];if(assets)symbol(menu.selected,24,73,26,38,'#b08e46');else text(s.glyph,37,106,34,'#b08e46','center');text(s.name,62,86,12,P.teal);text('빛나는 문에 기호를 놓아 보세요',62,109,10,'#778773');
      UI.button('cancelAttach',274,72,64,44,'취소');round(274,72,64,44,9,'#e4e8d7');text('취소',306,99,12,P.teal,'center');return;
    }
    c.fillStyle='rgba(22,43,35,.4)';c.fillRect(0,0,360,CONFIG.H);panel(32,66,296,412);text('발견한 음악기호',56,105,19,P.teal);
    UI.button('closePalette',270,80,44,44,'닫기');round(270,80,44,44,10,'#e4e8d7');if(assets)drawAsset('ui_close',292,102,{tint:P.teal});else text('×',292,109,24,P.teal,'center');
    const list=menu.filter||g.data().symbols;
    list.forEach((id,i)=>{const s=SYMBOLS[id],y=128+i*64;round(56,y,248,56,10,'#e7ebd9','#c5d0b6');round(64,y+6,40,44,9,P.teal);if(assets)symbol(id,72,y+10,24,36,'#f0d082');else text(s.glyph,84,y+40,33,'#f0d082','center');text(s.name,116,y+24,14,P.teal);text(g.full&&s.pitch?s.theory:'선택해서 사용하기',116,y+43,10,'#526e59');icon('arrow',284,y+28,'#729171');});
    if(list.length===1){const s=SYMBOLS[list[0]];line(56,220,304,220,'#d5dcc6');text('기호가 들려주는 이야기',56,250,11,'#8b9579');text(s.theory,56,278,12,P.teal);g.wrap(s.effect,56,306,248,20,3);}
    text('빈 곳을 누르면 가방을 닫아요',180,454,11,'#8a947c','center');
  }
  function dialogue(){
    c=ctx;const d=g.dialogue.active;if(!d)return;const content=d.lines[g.dialogue.index]||'';
    c.fillStyle='rgba(23,48,38,.22)';c.fillRect(0,0,360,CONFIG.H);c.save();c.translate(0,CONFIG.H-640);panel(16,446,328,178);round(29,429,96,30,10,P.teal);text(d.speaker,77,449,13,P.cream,'center');
    c.font='600 16px "Malgun Gothic",system-ui,sans-serif';c.fillStyle=P.ink;c.textAlign='left';g.wrap(Array.from(content).slice(0,Math.floor(g.dialogue.chars)).join(''),34,484,292,25,4);
    if(g.dialogue.chars>=content.length){text('눌러서 계속',305,602,10,'#7b8a6e','right');icon('arrow',321,598,'#7b8a6e');}
    c.restore();
  }
  return { offset, world, hud, palette, dialogue, symbol, title:()=>extended?.title(), assetRenderer: assets };
};
