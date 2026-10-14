/* Original editable Harmonia environment artwork. No generated notation or fonts.
 * Logical coordinates are exported at 4×; deterministic geometry preserves seams.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const P={ink:'#233D38',teal:'#24594E',mint:'#A3C5AA',gold:'#E9BD63',cream:'#FFF8E8',paper:'#F3EAD5',stone:'#DECDA7'};
const el=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const rect=(x,y,w,h,r,fill,stroke='',extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke?` stroke="${stroke}"`:''} ${extra}/>`;
const line=(x1,y1,x2,y2,stroke,width=1,extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const p=(d,fill,stroke='',width=1,extra='')=>`<path d="${d}" fill="${fill||'none'}"${stroke?` stroke="${stroke}" stroke-width="${width}"`:''} ${extra}/>`;
const group=(id,s,extra='')=>`<g id="${id}" ${extra}>${s}</g>`;
const defs=`<defs><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F5EAD0"/><stop offset=".66" stop-color="#DECBA3"/><stop offset="1" stop-color="#B8AA8A"/></linearGradient><linearGradient id="roof" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#578678"/><stop offset=".45" stop-color="#35685B"/><stop offset="1" stop-color="#234E44"/></linearGradient><linearGradient id="door" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#94805A"/><stop offset="1" stop-color="#6E5E40"/></linearGradient><linearGradient id="passage" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#19372F"/><stop offset=".65" stop-color="#315447"/><stop offset="1" stop-color="#9EAE7F"/></linearGradient></defs>`;
function svg(id,w,h,s){return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w*4}" height="${h*4}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${id}</title>${defs}<g stroke-linecap="round" stroke-linejoin="round">${s}</g></svg>\n`;}
function shadow(x,y,rx,ry){return group('contact-shadow',el(x+4,y+2,rx,ry,'#233D38','opacity=".15"')+el(x,y,rx*.68,ry*.55,'#233D38','opacity=".13"'));}
function roof(x,y,w,h){const face=`M${x-8} ${y+h}Q${x+8} ${y+h-12} ${x+w/2} ${y}Q${x+w-5} ${y+h-12} ${x+w+8} ${y+h}L${x+w+8} ${y+h+7}Q${x+w/2} ${y+h+15} ${x-8} ${y+h+7}Z`,clip=`roof-face-${x}-${y}-${w}`;let s=p(face,'url(#roof)',P.ink,1.4),seams='';
 for(let j=1;j<5;j++){const yy=y+h*j/5,span=w/2*j/5;seams+=p(`M${x+w/2-span} ${yy}Q${x+w/2} ${yy+8} ${x+w/2+span} ${yy}`,null,'#86A38B',.85,'opacity=".72"');for(let k=-j;k<=j;k++)seams+=line(x+w/2+k*span/(j+.5),yy+2,x+w/2+k*span/(j+.5)-2,yy+7,'#1A4439',.65,'opacity=".45"');}
 s+=`<defs><clipPath id="${clip}">${p(face,'white')}</clipPath></defs>`+group(`${clip}-tile-seams`,seams,`clip-path="url(#${clip})"`);
 return s+p(`M${x-8} ${y+h}Q${x+w/2} ${y+h+8} ${x+w+8} ${y+h}`,null,'#DEC68A',2.8);}
function towerBody(){let s=rect(0,14,128,106,7,'url(#wall)','#B7AA87')+rect(9,13,110,8,2,'#788576');
 for(let y=33;y<117;y+=17){s+=line(2,y,126,y,'#A59570',.65,'opacity=".5"');for(let x=8+(y%2)*12;x<125;x+=29)s+=line(x,y,x,Math.min(y+17,117),'#A59570',.65,'opacity=".27"');}
 for(const x of [1,117]){s+=rect(x,31,10,83,2,'#C7BD9E');for(let y=35;y<115;y+=13)s+=rect(x-1,y,12,4,1,'#ECDFBB');}
 for(const x of [20,88]){s+=group(`arched-window-${x}`,p(`M${x-3} 92V65A13 16 0 0 1 ${x+23} 65V92Z`,'#B8A47F')+p(`M${x} 88V65A10 13 0 0 1 ${x+20} 65V88Z`,'#315E57')+p(`M${x+2} 87V65Q${x+2} 55 ${x+9} 55V87Z`,'#8BB6A6')+line(x+10,55,x+10,88,'#DBC890',1.7)+line(x+1,71,x+19,71,'#DBC890',1.7)+rect(x-5,90,30,5,2,'#F6E9C6'));}
 s+=rect(30,101,68,13,3,'#526E57');
 return group('stone-body',s,'transform="translate(32 80)"');}
function towerRoof(){let s=roof(-8,-25,144,63)+group('lantern-turret',p('M48 -1V-20Q48 -35 64 -35Q80 -35 80 -20V-1Z','#ECDFBE','#897C59')+p('M54 -8V-19Q54 -28 64 -28Q74 -28 74 -19V-8Z','#345E51')+line(64,-25,64,-10,'#E4CC91',1.8)+roof(45,-55,38,25)+line(64,-57,64,-68,'#C2A259',2)+el(64,-69,3,3,'#F0D78E'));
 s+=group('staff-window',el(64,33,21,20,'#9A8359')+el(64,31,18,18,'#EDDBAB')+el(64,31,14,14,'#385E52')+Array.from({length:5},(_,i)=>line(55,24+i*3.5,73,24+i*3.5,'#A1B292',.7)).join(''));
 return group('teal-roof',s,'transform="translate(32 80)"');}
function towerTrim(){let s=rect(-6,123,140,14,5,'#8E997F')+rect(-9,119,146,11,4,'#DED6B7')+rect(-5,116,138,7,3,'#F7EDCF');
 for(const x of [13,114])s+=group(`brass-lantern-${x}`,el(x,111,12,17,P.gold,'opacity=".06"')+line(x,100,x,109,'#54634B',1.8)+rect(x-4,107,8,12,2,'#8C743F')+rect(x-2.5,109,5,7,1,'#FFE4A3')+line(x-2,108,x+2,108,'#E7CB87',.65));
 return group('steps-and-lanterns',s,'transform="translate(32 80)"');}
function door(state){let s=shadow(40,57,32,4)+p('M3 56V35Q3 16 23 16H57Q77 16 77 35V56Z','#BCAB88')+p('M8 56V35Q8 20 23 20H57Q72 20 72 35V56Z','url(#passage)',P.ink,1);
 const panel=()=>{let v=p('M8 55V35Q8 20 23 20H57Q72 20 72 35V55Z','url(#door)');for(let i=1;i<7;i++)v+=line(8+i*9,30,8+i*9,54,'#584C36',.85);v+=rect(32,23,16,26,5,'#315D53','#C4AB71')+line(35,25,44,25,'#86A188',.65)+el(55,40,2,2,'#E6C473');return v;};
 if(state==='closed')s+=group('door-panel',panel());
 if(state==='half_open')s+=group('door-panel',panel(),'transform="translate(3.4 0) scale(.58 1)"')+p('M45 24L49 27V54L45 55Z','#54472F');
 if(state==='open')s+=group('folded-door-panel',p('M8 27L15 31V54L8 56Z','#8B7850','#5D533C',.8)+line(11,32,11,53,'#B9A46C',.7));
 s+=group('stone-threshold',rect(8,55,64,3,1,'#BCA77A')+line(14,56,66,56,'#EDD69F',1));
 return group(`door-${state}`,s);}
function grass(i){let s=rect(0,0,32,32,0,'#9FB980');s+=el(16,11,13,7,'#B1C68D','opacity=".18"')+el(23,25,8,6,'#729C6D','opacity=".1"');const marks=[[[8,24],[22,10]],[[7,11],[27,27]],[[13,27],[25,14]]][i-1];for(const [x,y]of marks)s+=p(`M${x} ${y}q-3 -6 -4 -5q-1 4 4 5m0 0q0 -6 3 -6q2 3 -3 6`,'#789A65','',1,'opacity=".55"');s+=el(18+i,20-i,1,.6,'#E5D99B','opacity=".65"');return group('lawn',s);}
function paving(i){let s=rect(0,0,32,32,0,'#DCCC9D');const cells=i===1?[[3,3,21,11],[8,19,20,10]]:[[7,3,21,11],[3,19,21,10]];for(const[x,y,w,h]of cells)s+=rect(x,y,w,h,3.8,i===1?'#E5D9B4':'#E2D6B0')+line(x+4,y+1.5,x+w-5,y+1.5,'#F8EDCF',.8,'opacity=".37"');return group('paving-stones',s);}
function edge(side){let s='';let d='M0 0H32V3Q24 2 16 3Q8 2 0 3Z';let t={n:'',e:'rotate(90 16 16)',s:'rotate(180 16 16)',w:'rotate(270 16 16)'}[side];return s+group('grass-edge',p(d,'#8B9C70')+p('M0 3Q8 2 16 3Q24 2 32 3',null,'#F4E8C2',1.6),t?`transform="${t}"`:'');}
function corner(orientation,inner){const deg={ne:0,se:90,sw:180,nw:270}[orientation];let s='';const d=inner?'M24 0H32V8Q29 1 24 0Z':'M0 0H32V32H29V11Q29 3 21 3H0Z';const contour=inner?'M24 0Q30 2 32 8':'M0 3H21Q29 3 29 11V32';return s+group(inner?'inner-corner':'outer-corner',p(d,'#8B9C70')+p(contour,null,'#F4E8C2',1.6),`transform="rotate(${deg} 16 16)"`);}
function stone(i){let s=rect(0,0,32,32,0,'#D3C6A0');if(i===1){s+=rect(2,2,28,12,2,'#E6DABD')+rect(2,17,12,13,2,'#DED1B0')+rect(17,17,13,13,2,'#E8DCBF');}else{s+=rect(2,2,13,28,2,'#E2D5B5')+rect(18,2,12,12,2,'#E8DCBF')+rect(18,17,12,13,2,'#DED1B0');}return group('stone-pavers',s);}
function bush(i){let colors=[['#567D57','#789C67','#92AC74'],['#5D825A','#82A473','#A3BA81'],['#527857','#76976D','#93AD7B']][i-1];let s=shadow(32,39,25,6);s+=el(31,30,25,11,colors[0])+el(18,i===3?27:25,14,i===3?10:12,colors[1])+el(36,i===2?19:22,i===2?16:18,i===2?16:14,colors[2])+el(49,30,12,10,colors[1])+el(32,i===2?10:14,10,4,'#C0CE98','opacity=".6"');for(const[x,y]of [[13,24],[22,28],[30,22],[40,24],[45,30]])s+=el(x,y,1.15,1.8,i===3?'#C7D59C':'#E8D695');return group(`bush-${i}`,s);}
function tree(i){const palettes=[['#3D6A50','#477C58','#648D5B','#78A16A','#92B178'],['#426E54','#568362','#739C6D','#90AF7C','#A6BC88'],['#365F4D','#47745A','#5B8662','#789B71','#8BAF7C']];const a=palettes[i-1];let s=p('M44 97L73 111L95 103L57 82Z','#233D38','',1,'opacity=".11"')+shadow(48,102,30,8);s+=p('M43 99L44 65L53 60L55 99L64 104L50 102L37 104Z','#716647')+p('M48 96L47 66L51 65L52 97Z','#A18B58');if(i===2){s+=el(48,60,32,29,a[0])+el(65,47,23,25,a[1])+el(31,45,24,25,a[2])+el(43,27,25,24,a[3])+el(60,29,22,22,a[4])+el(37,12,14,6,'#C1CFA0','opacity=".75"');}else if(i===3){s+=el(48,67,36,21,a[0])+el(19,59,16,21,a[1])+el(34,46,27,24,a[2])+el(68,48,23,22,a[3])+el(49,30,26,21,a[4])+el(39,15,14,5,'#B8CA8C','opacity=".65"');}else {s+=el(48,61,37,27,a[0])+el(67,54,24,23,a[1])+el(28,54,25,22,a[2])+el(39,36,27,23,a[3])+el(63,34,23,19,a[4])+el(36,24,15,7,'#B8CA8C','opacity=".8"');}s+=p('M16 59Q23 51 32 57M34 40Q43 33 54 39M60 52Q70 44 78 50',null,'#D9E1AC',2.2,'opacity=".22"');return group(`tree-${i}`,s);}
function sprig(x,y,size=1){return group(`sprig-${x}-${y}`,p('M0 2Q-6 -4 -4 -8Q1 -7 0 2M0 2Q2 -9 6 -8Q7 -2 0 2','#648B58')+line(0,3,0,-7,'#4F774B',.7),`transform="translate(${x} ${y}) scale(${size})"`);}
function cluster(i){let s=shadow(16,27,12,2.5);if(i<3){for(const [x,y,sc]of [[6,25,.8],[14,26,1],[23,25,.9]])s+=sprig(x,y,sc);if(i===2)for(const[x,y]of [[7,17],[14,14],[22,17]])s+=el(x-1,y,2,2,P.cream)+el(x+2,y-1,2,2,'#F7E9B4')+el(x,y+2,1.6,1.6,P.gold);}else{for(const[x,y]of [[5,24],[11,23],[18,24],[26,24]]){s+=line(x,y+4,x-1,y-11,'#6C8D59',.8)+p(`M${x} ${y-3}q-6 -4 -4 -7q4 2 4 7m0 -1q5 -6 6 -3q-2 4 -6 3`,'#819E64');s+=el(x-1,y-12,2.5,2.6,i===3?'#FFF4CC':'#E9BD63')+el(x-2,y-13,.8,1,'#FFF8E8');}}return group(`flower-grass-${i}`,s);}
function lantern(){return group('brass-garden-lantern',shadow(24,56,12,4)+rect(21,16,6,40,2,'#697C59')+rect(16,50,16,5,2,'#687656')+p('M15 16L19 7H29L33 16Z','#385F4D',P.ink,.8)+rect(15,17,18,23,3,'#8D7946','#6C693F')+rect(18,20,12,16,2,'#F6DF9E')+line(24,20,24,36,'#9A824C',1)+rect(14,38,20,3,1,'#BDA56B')+line(17,18,30,18,'#F2D18A',.8));}
function sign(){return group('garden-direction-sign',shadow(24,41,19,4)+rect(21,12,6,31,2,'#82714F')+rect(2,5,44,24,4,'#D7BD82','#8C805B')+line(6,8,39,8,'#F0DCAC',.8)+p('M15 17H32M27 12L33 17L27 22',null,P.teal,2));}
function well(){let s=shadow(48,84,37,9)+rect(17,57,62,27,7,'#B5B397','#747D66');for(const yy of[67,77])s+=line(18,yy,78,yy,'#8A9577',.8);for(const [xx,yy]of [[30,58],[51,68],[67,58],[34,78],[66,78]])s+=line(xx,yy,xx,yy+7,'#8A9577',.8);s+=el(48,57,31,12,'#E0D8B6')+el(48,56,23,8,'#365D55')+p('M26 56Q37 51 48 51',null,'#7D9C88',1,'opacity=".6"');for(const xx of[23,69])s+=rect(xx,26,4,38,2,'#877951')+line(xx+1,29,xx+1,56,'#B7A476',.8);s+=roof(14,14,68,24)+line(48,49,48,60,'#C7B585',1)+el(48,47,3,2,'#E4CB8E');return group('village-well',s);}
function generateEnvironment({root=path.resolve(__dirname,'..')}={}){const dir=path.join(root,'assets/harmonia/source/environment');fs.mkdirSync(dir,{recursive:true});const assets=[];function add(id,w,h,pivot,body,extra={}){const file=`assets/harmonia/source/environment/${id}.svg`;fs.writeFileSync(path.join(root,file),svg(id,w,h,body));assets.push({id,file,logicalSize:[w,h],pivot,category:'environment',...extra});}
 const towerMeta={collision:{x:32,y:80,w:128,h:128},origin:[32,80],worldTopLeft:[416,-16]};
 add('tower_body',192,224,[96,208],towerBody(),{...towerMeta,layer:'body'});
 add('tower_roof',192,224,[96,208],towerRoof(),{...towerMeta,layer:'roof',staff:{lineCount:5,linesY:[104,107.5,111,114.5,118],xRange:[87,105],notationComposite:{center:[96,111],source:'existing-game-symbols'}}});
 add('tower_foreground_trim',192,224,[96,208],towerTrim(),{...towerMeta,layer:'foreground'});
 add('tower_ground_shadow',192,224,[96,208],group('tower-shadow',p('M32 189L81 222H184L180 211L154 169Z','#233D38','',1,'opacity=".10"')+shadow(96,212,75,8)),{...towerMeta,layer:'shadow'});
 for(const state of ['closed','half_open','open'])add(`tower_door_${state}`,80,64,[40,56],door(state),{state,collision:{x:8,y:24,w:64,h:32},notationComposite:{center:[40,36],badge:[32,23,16,26],source:'existing-game-symbols'}});
 for(let i=1;i<=3;i++)add(`grass_${i}`,32,32,[0,0],grass(i),{tile:'grass'});
 for(let i=1;i<=2;i++)add(`path_center_${i}`,32,32,[0,0],paving(i),{tile:'path-center'});
 for(const s of ['n','e','s','w'])add(`path_edge_${s}`,32,32,[0,0],edge(s),{tile:'path-edge',orientation:s,overlay:true});
 for(const inner of[false,true])for(const s of['ne','se','sw','nw'])add(`path_${inner?'inner':'outer'}_${s}`,32,32,[0,0],corner(s,inner),{tile:`path-${inner?'inner':'outer'}-corner`,orientation:s,overlay:true});
 for(let i=1;i<=2;i++)add(`stone_${i}`,32,32,[0,0],stone(i),{tile:'stone'});
 for(let i=1;i<=3;i++)add(`tree_${i}`,96,112,[48,100],tree(i),{zSort:'foot',collision:'reuse-existing-boundary'});
 for(let i=1;i<=3;i++)add(`bush_${i}`,64,48,[32,40],bush(i),{zSort:'foot',collision:false});
 for(let i=1;i<=4;i++)add(`cluster_${i}`,32,32,[16,28],cluster(i),{zSort:'ground',collision:false});
 add('props_lantern',48,64,[24,56],lantern(),{zSort:'foot'});add('props_sign',48,48,[24,42],sign(),{zSort:'foot',symbol:'direction-arrow'});add('props_well',96,96,[48,84],well(),{zSort:'foot'});
 fs.writeFileSync(path.join(dir,'environment-spec.json'),JSON.stringify({version:1,license:'Original project artwork',units:'logical pixels',masterScale:4,lightDirection:'upper-left',notationPolicy:'No invented musical glyphs. Original validated game glyphs composed at runtime.',assets},null,2)+'\n');return assets;}
module.exports={generateEnvironment};
if(require.main===module){const assets=generateEnvironment({root:process.argv[2]||path.resolve(__dirname,'..')});console.log(`Environment: ${assets.length} SVG sources written.`);}
