/* Original Melodia artwork extending the approved Harmonia palette.
 * Map geometry, note pitches, object bounds and puzzle state belong to Game.
 * Static scenery is cached by the caller; interactive props draw from live state.
 */
'use strict';
window.createAdventureArt = function createAdventureArt(g) {
  const { ctx, CONFIG, assetRenderer: assets, UI } = g;
  let c = ctx;
  const ink = '#244c43', gold = '#d9b768', cream = '#fff8e8';
  const time = () => CONFIG.REDUCED_MOTION ? 0 : performance.now() / 1000;
  function box(x,y,w,h,r,fill,stroke) { c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();} }
  function oval(x,y,rx,ry,fill) { c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill(); }
  function line(x,y,x2,y2,color,width=1) { c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke(); }
  function path(d,fill,stroke,width=1) {const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);} }
  function text(s,x,y,size=11,color=ink,align='center') {c.font=`600 ${size}px "Malgun Gothic",system-ui,sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(s,x,y);}
  function grad(x,y,w,h,a,b) {const v=c.createLinearGradient(x,y,x+w,y+h);v.addColorStop(0,a);v.addColorStop(1,b);return v;}
  function shadow(x,y,w) {oval(x+3,y+3,w,w*.23,'rgba(20,49,43,.19)');}
  function sprite(id,x,y,options={}) {assets.draw(id,x,y,{ctx:c,...options});}
  const hash=(x,y)=>((Math.sin(x*127.1+y*311.7)*43758.5453)%1+1)%1;

  function terrain(map) {
    const canvas=document.createElement('canvas');canvas.width=map.w*64;canvas.height=map.h*64;
    c=canvas.getContext('2d');c.scale(2,2);
    const scenery=[];
    if(map.id==='tower') {
      c.fillStyle='#243f3c';c.fillRect(0,0,map.w*32,map.h*32);
      for(let y=1;y<map.h-1;y++)for(let x=1;x<map.w-1;x++) {
        box(x*32,y*32,32,32,2,(x+y)%2?'#d4c5a4':'#ddcfb0','#bbaf92');
        line(x*32+4,y*32+3,x*32+26,y*32+3,'rgba(255,248,217,.35)');
      }
      box(127,64,194,225,5,'#315f56','#c0aa71');box(133,69,182,214,3,'#42786b','#d0b976');
      for(let y=82;y<273;y+=18){line(138,y,143,y+5,gold);line(305,y,310,y+5,gold);}
      for(let x=0;x<map.w*32;x+=32){box(x,0,32,38,2,'#b5aa8d','#8d8976');line(x+3,6,x+29,6,'#e6d8b7');}
      for(const x of [50,352]) {
        box(x,29,46,61,[22,22,2,2],'#28473f','#b7a476');box(x+5,35,36,50,[18,18,1,1],grad(x,35,36,50,'#a8cfbb','#638c7c'));
        line(x+23,37,x+23,81,'#e7d1a3',2);line(x+7,61,x+39,61,'#e7d1a3',2);
        c.fillStyle=grad(x,70,100,170,'rgba(255,230,158,.24)','rgba(255,230,158,0)');path(`M${x+5} 76 L${x+41} 76 L${x+126} 264 L${x+30} 264Z`,c.fillStyle);
      }
      for(const x of [38,382])for(const y of [130,240])scenery.push({id:'props_lantern',x,y,scale:.75});
      for(const x of [36,380])for(const y of [106,214,336]) {box(x, y,30,10,3,'#9a947e');box(x+5,y-57,20,58,3,grad(x,y-50,20,20,'#e7dab9','#b8ad91'));box(x+1,y-60,28,9,3,'#eee0bf');}
      for(const x of [104,326])sprite('cluster_3',x,334,{scale:.8});
    } else {
      const road=(x,y)=>[2,4].includes(map.ground[y]?.[x]);
      for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++) {
        sprite(`grass_${1+Math.floor(hash(x,y)*3)}`,x*32,y*32);
        if(road(x,y)) {
          sprite(`path_center_${1+Math.floor(hash(y,x)*2)}`,x*32,y*32);
          for(const [side,dx,dy] of [['n',0,-1],['e',1,0],['s',0,1],['w',-1,0]])if(!road(x+dx,y+dy))sprite(`path_edge_${side}`,x*32,y*32);
        }
      }
      // River banks are grounded in the original blocked water tiles.
      c.fillStyle=grad(864,0,96,800,'#3d7f84','#214e61');c.fillRect(864,0,96,800);
      for(const x of [857,960]) {box(x,0,7,800,2,'#697d65');for(let y=0;y<800;y+=30)sprite('stone_1',x+3,y+14,{scale:.55});}
      for(let y=16;y<800;y+=22)for(let x=873;x<952;x+=22)line(x,y,x+10,y-2,'rgba(187,225,209,.28)',1.2);
      // Five real staff lines; ledger-below / first / second line stay distinct.
      for(let i=0;i<5;i++)line(848,377+i*5,976,377+i*5,'#dbe5c9',1.3);
      box(980,63,236,160,10,'#617a68','#425b50');
      for(let x=997;x<1200;x+=27) {box(x,68,21,124,8,grad(x,68,21,124,'#93b49a','#546d65'));line(x+3,76,x+3,175,'#b1c4a2');}
      box(1056,84,118,125,5,grad(1056,84,0,125,'#bad9ce','#78a9aa'));
      for(let x=1064;x<1170;x+=15)line(x,91,x-4,196,'rgba(238,250,223,.65)',2);
      oval(1116,212,69,14,'#9fcac3');oval(1116,212,53,7,'#689c9a');
      const blocked=(x,y)=>map.collision[Math.floor(y/32)]?.[Math.floor(x/32)];
      for(let x=16;x<map.w*32;x+=48)for(const y of [28,map.h*32+9])scenery.push({id:`tree_${1+Math.floor(hash(x,y)*3)}`,x,y,scale:1.1});
      for(let y=88;y<map.h*32-50;y+=64)for(const x of [12,map.w*32-9])if(blocked(x,y))scenery.push({id:`tree_${1+Math.floor(hash(x,y)*3)}`,x,y,scale:1.15});
      // Canopies frame existing clearings, never hide the playable river crossing.
      for(const [xx,yy] of [[250,210],[390,178],[500,194],[650,206],[765,230],[402,515],[612,585],[740,560],[1080,580],[1190,450]]) {
        scenery.push({id:'tree_2',x:xx,y:yy,scale:1+hash(xx,yy)*.3});
        for(let i=0;i<3;i++)sprite(`cluster_${i+1}`,xx-30+i*24,yy+14,{scale:.8});
      }
      for(let i=0;i<210;i++){const x=40+hash(i,2)*1200,y=60+hash(i,4)*680;if(map.ground[Math.floor(y/32)]?.[Math.floor(x/32)]===0)sprite(`cluster_${1+i%4}`,x,y,{scale:.55+hash(i,8)*.3});}
      for(const [x,y] of [[198,365],[427,335],[635,390],[820,415],[1000,415]])scenery.push({id:'props_lantern',x,y,scale:.7});
      c.fillStyle=grad(0,0,700,600,'rgba(27,66,54,.18)','rgba(27,66,54,0)');c.fillRect(0,0,1280,800);
    }
    c=ctx;return {canvas,scenery};
  }

  function musicalNote(id,x,y,w,h,color=ink) {
    // Pitched notes use one quarter-note shape: pitch is staff position, not flag count.
    const s=g.SYMBOLS[id];if(!s?.pitch)return g.symbolArt(id,x,y,w,h,color);
    c.save();c.translate(x,y);c.scale(w/40,h/52);
    for(let i=0;i<5;i++)line(2,12+i*6,38,12+i*6,'#94a28a',.9);
    const ny={ledger_below:42,line1:36,line2:30}[s.staffSlot];
    if(s.staffSlot==='ledger_below')line(10,ny,29,ny,color,1.3);
    c.save();c.translate(20,ny);c.rotate(-.3);oval(0,0,5,3.5,color);c.restore();line(24,ny-1,24,ny-23,color,1.8);
    c.restore();return true;
  }

  function object(o) {
    c=ctx;const r=g.objectRect(o),x=r.x+r.w/2,y=r.y+r.h;
    const f=g.data().flags;
    if(['forestGate','staffDoor'].includes(o.type)) {
      const open=o.type==='forestGate'?f.forest_gate_open:f.staff_door_open;
      shadow(x,y,30);for(const dx of [-20,14]){box(x+dx,y-76,7,78,3,'#a9a488','#626f5c');box(x+dx-3,y-79,13,8,3,'#e7d6ac');}
      path(`M${x-23} ${y-72} Q${x} ${y-105} ${x+23} ${y-72} L${x+23} ${y-62} Q${x} ${y-86} ${x-23} ${y-62}Z`,ink,'#bdac79');
      if(!open){for(let i=-12;i<=12;i+=8)line(x+i,y-65,x+i,y-3,'#8c815b',3);box(x-12,y-51,24,29,5,'#315f52','#d2b96d');g.symbolArt('clef_g',x-7,y-49,14,25,gold);}
      else {path(`M${x-12} ${y-15} L${x} ${y-22} L${x+12} ${y-15}`,null,'#f5df9b',2);}
    } else if(o.type==='worldScore') {
      shadow(x,y+3,80);box(r.x-6,r.y+44,r.w+12,24,7,'#9d947a','#6e7866');box(r.x-9,r.y+39,r.w+18,10,3,'#e6d5b1');
      path(`M${r.x} ${r.y+6} Q${x-26} ${r.y-6} ${x} ${r.y+8} Q${x+26} ${r.y-6} ${r.x+r.w} ${r.y+6} L${r.x+r.w} ${r.y+50} Q${x+26} ${r.y+41} ${x} ${r.y+54} Q${x-26} ${r.y+41} ${r.x} ${r.y+50}Z`,cream,'#b49d6f',1.4);
      line(x,r.y+8,x,r.y+51,'#cdbb93');
      for(let i=0;i<5;i++){line(r.x+9,r.y+19+i*5,x-8,r.y+19+i*5,'#829781');line(x+8,r.y+19+i*5,r.x+r.w-9,r.y+19+i*5,'#829781');}
      if(g.data().scoreParts.melody){g.symbolArt('clef_g',r.x+10,r.y+13,13,28,ink);musicalNote('note_g',x+20,r.y+8,30,38);}
      else path(`M${x-7} ${r.y+5} l-7 12 12 8 -13 10 7 16`,null,'#a7785d',2);
      sprite('ui_note',x,y-7,{scale:.7});
    } else if(o.type==='portal') {
      box(r.x+1,r.y+4,r.w-2,r.h-8,5,'rgba(220,220,166,.5)');
      for(let i=0;i<3;i++)path(`M${x-7} ${y-22+i*6} l7 -4 7 4`,null,ink,1.4);
    } else if(o.type==='bell') {
      shadow(x,y+3,22);box(x-21,y-6,42,10,5,'#a3a382');
      for(const dx of [-17,13])box(x+dx,y-43,4,39,2,'#716f50');box(x-22,y-47,44,6,3,'#a49162','#625f45');
      if(o.glow>0)oval(x,y-24,23,27,'rgba(242,215,130,.27)');
      path(`M${x-4} ${y-39} Q${x-13} ${y-35} ${x-12} ${y-20} l-5 5 q17 8 34 0 l-5 -5 Q${x+13} ${y-35} ${x+4} ${y-39}Z`,grad(x-17,y-40,34,25,'#f2d897','#b58b4c'),'#81663f');
      line(x-6,y-35,x-8,y-22,'#fff0bd',2);oval(x,y-11,3,3,'#80633b');box(x-14,y+1,28,16,5,cream);text(o.solfege,x,y+13,11);
    } else if(o.type==='crow') {
      sprite('tree_3',x,y,{scale:.85});shadow(x,y,24);
      oval(x+8,y-68,12,8,'#283e3d');oval(x+15,y-75,7,7,'#384d48');
      path(`M${x-2} ${y-69} l-14 -5 7 12Z`,'#263e3c');path(`M${x+20} ${y-76} l8 4 -8 2Z`,gold);
      oval(x+17,y-77,1.5,1.5,cream);line(x+8,y-61,x+7,y-56,'#b59e6a',1.5);
      sprite('ui_note',x+5,y-96,{scale:.65,alpha:f.got_note_e?.5:1});
    } else if(o.type==='rock') {
      shadow(x,y,21);path(`M${x-16} ${y-1} l-3 -13 10 -15 17 -1 11 13 -5 16Z`,'#8a9b89','#61776a');path(`M${x-18} ${y-14} l10 -15 17 -1 -4 12Z`,'#b6bea0');line(x-5,y-17,x+9,y-12,'#d2d1b0');sprite('cluster_1',x-10,y+1,{scale:.45});
    } else if(o.type==='chest') {
      shadow(x,y,22);box(x-20,y-24,40,24,5,'#8f7850','#5e6349');box(x-21,y-33,42,15,[9,9,2,2],'#bd9d66','#806a45');
      for(const dx of [-13,10])box(x+dx,y-31,4,29,1,'#c7b576');box(x-4,y-21,8,10,2,'#e4c97b');oval(x,y-17,1,2,'#6e6948');
    } else if(o.type==='staffSlot') {
      box(r.x+1,r.y+3,30,28,5,o.placed?'#eddaa0':'#d4d9ba',o.placed?'#98783d':'#5e8c82');
      if(o.placedSymbol)musicalNote(o.placedSymbol,x-12,r.y-11,24,42);
      else {text({ledger_below:'덧줄',line1:'1선',line2:'2선'}[o.staffSlot],x,r.y+22,9);}
    } else if(o.type==='golden') {
      shadow(x,y,20);oval(x,y-22,22,22,'rgba(244,222,148,.18)');sprite('ui_note',x,y-23+Math.sin(time()*2)*2,{scale:1.6,tint:'#b49143'});
    } else if(o.type==='pickup' && o.symbol!=='clef_g') {
      shadow(x,y,21);box(x-19,y-43,38,42,8,cream,'#b59f66');musicalNote(o.symbol,x-15,y-42,30,38);sprite('cluster_2',x-17,y+4,{scale:.5});
    } else return false;
    if(UI.interactTarget===o&&g.state()==='Explore') {const w=Math.min(116,o.label.length*11+18);box(x-w/2,y-106,w,21,8,cream);text(o.label,x,y-91,11);}
    return true;
  }

  function title() {
    c=ctx;c.fillStyle=grad(0,0,0,CONFIG.H,'#173e37','#7c9a79');c.fillRect(0,0,360,CONFIG.H);
    oval(273,94,62,62,'rgba(246,225,167,.14)');
    for(let i=0;i<3;i++)path(`M-30 ${230+i*35} Q80 ${100+i*45} 190 ${230+i*20} Q300 ${140+i*35} 400 ${255+i*30} L400 660 L-30 660Z`,['#416d5b','#63876b','#8ba584'][i]);
    for(const [x,y,s] of [[18,325,1.3],[325,320,1.4],[64,285,.8],[300,275,.8]])sprite('tree_2',x,y,{scale:s});
    for(const id of ['tower_body','tower_roof','tower_foreground_trim'])assets.drawRect(id,119,160,123,143,{ctx:c});
    sprite('tower_door_closed',180,310,{scale:.7});sprite('sol.idle.down.0',228,325,{scale:1.2});
    c.fillStyle=grad(0,300,0,340,'rgba(245,237,216,0)','#f4edd8');c.fillRect(0,300,360,CONFIG.H-300);
    text('MELODIA',180,48,12,'#e5cf96');text('멜로디아',180,94,36,cream);text('끝나지 않는 노래',180,123,17,'#e4e8cf');
    text('기호를 찾고, 잃어버린 노래를 이어 주세요.',180,579,12,ink);
    text('WASD / 방향키 이동 · E 대화 · Q 기호 · Esc 가방',180,607,10,'#506c5c');
  }
  return {terrain,object,musicalNote,title};
};
