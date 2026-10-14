/* Original layered Harmonia character vectors. No external art or fonts.
 * Shapes are authored in 64 logical pixels and exported at 4x.
 * Asymmetry is painted per direction; no horizontal mirroring is used.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const C={ink:'#233D38',hair:'#584532',hairDark:'#42392D',hairLight:'#857052',skin:'#F0C99C',skinShade:'#D8AC80',skinLight:'#FFE0B6',coat:'#397777',coatLight:'#619995',coatDark:'#285853',gold:'#E9BD63',goldShade:'#BA8E46',boot:'#454C40',bag:'#AB8150',bagLight:'#C69C61',cream:'#FFF8E8',sage:'#829578',sageLight:'#A6B493',sageDark:'#586F59',silver:'#D9DACE',silverLight:'#F2F0DF',silverShade:'#AAAF9D'};
const P=(d,fill,stroke=null,width=.8)=>`<path d="${d}" fill="${fill||'none'}"${stroke?` stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`:''}/>`;
const E=(x,y,rx,ry,fill)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const R=(x,y,w,h,r,fill,stroke=null)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width=".75"`:''}/>`;
const G=(id,body,transform='')=>`<g id="${id}"${transform?` transform="${transform}"`:''}>${body}</g>`;
// An eighth note: filled tilted head, straight right-side stem and ONE flag.
// Path geometry is fixed in every visible view; it is never mirrored or font-substituted.
const note=(x,y,s=1)=>`<g id="hairpin-eighth-note" transform="translate(${x} ${y}) scale(${s})" fill="${C.gold}"><ellipse cx="1.75" cy="7.5" rx="2.1" ry="1.35" transform="rotate(-22 1.75 7.5)"/><path d="M3.1 7.25V0H4V7.25Z M3.85 0C4.6 1.65 7.5 1.75 7.1 4.15C6.9 5 6.15 5.6 5.5 5.9C6.6 4.2 5.15 3.4 3.85 2.85Z"/></g>`;
function doc(id,body){return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 64 64" role="img" aria-labelledby="title"><title id="title">${id}: Harmonia original character</title><metadata>logicalSize=64,64; pivot=32,56; light=upper-left; groundShadow=separate runtime layer</metadata>${body}</svg>\n`;}
function boots(direction,phase=0,extension=0){
 const a=Math.max(0,phase)*1.5,b=Math.max(0,-phase)*1.5;
 if(direction==='left'||direction==='right'){
   const center=direction==='left'?31:33;
   return G('boots',R(center-6-phase*2,49-a-extension*.7,6+extension*.5,7+extension*.7,2,C.boot)+R(center+phase*2,49-b+extension*.7,6-extension*.5,7-extension*.7,2,C.boot)+P(`M${center-5-phase*2} ${50-a}h3 M${center+1+phase*2} ${50-b}h3`,null,'#71806A',.7));
 }
 return G('boots',R(23-phase*.8,49-a-extension*.7,7+extension*.5,7+extension*.7,2,C.boot)+R(34+phase*.8,49-b+extension*.7,7-extension*.5,7-extension*.7,2,C.boot)+P(`M24 ${50-a}h4 M35 ${50-b}h4`,null,'#71806A',.8));
}
function bag(x,y,small=false){const w=small?6:10;return G('score-bag',R(x,y,w,10,2,C.bag,C.hairDark)+P(`M${x+.5} ${y+1}H${x+w-.5}V${y+4}Q${x+w/2} ${y+6} ${x+.5} ${y+4}Z`,C.bagLight)+R(x+w/2-.7,y+3.5,1.5,2.5,.4,C.gold)+P(`M${x+2} ${y-1}v-2h${w-4}v2`,C.cream,C.hairDark,.45));}
function downHead(blink=false){return G('hair-back',E(32,22,12,12,C.hairDark))+G('face',E(21.3,28.5,2,3,C.skinShade)+E(42.6,28.5,2,3,C.skinShade)+P('M21 22Q21 13 32 13Q43 13 43 24V28Q42 37 32 38Q22 36 21 28Z',C.skin)+P('M22 26Q22 33 28 35',null,C.skinLight,1.4)+E(25.2,31.5,2.2,.95,'#E4AA83')+E(38.8,31.5,2.2,.95,'#E4AA83')+(blink?P('M25 28.4h2.5 M37 28.4h2.5',null,C.ink,1.2):E(26.3,28.5,1.15,1.5,C.ink)+E(38,28.5,1.15,1.5,C.ink))+P('M30 33Q32 34.5 34 32.7',null,'#B57F5C',.85))+G('hair-front',P('M20 25Q18 17 24 12Q30 8 36 11Q44 12 44 24L40 26Q36 23 34 18Q31 25 23 25Z',C.hair)+P('M23 19Q24 13 30 12 M25 21Q30 20 32 16',null,C.hairLight,1.2)+P('M36 13Q42 16 42 21',null,'#68543B',1))+note(20,16,.67);}
function upHead(){return G('hair-back',P('M20 25Q18 15 26 11Q34 7 41 14Q47 20 42 32L37 36H26L22 32Z',C.hairDark))+G('hair-front',P('M20 24Q19 16 26 12Q34 8 40 14Q45 18 43 27L40 33L35 34L32 32L29 35L23 32Z',C.hair)+P('M23 22Q23 15 29 13 M28 24Q27 17 33 14',null,C.hairLight,1.3)+P('M37 17Q41 24 37 31',null,'#6B553A',1.1))+note(39,17,.57);}
function sol(direction,animation,frame){
 const walk=animation==='walk',phase=walk?[0,.866,.866,0,-.866,-.866][frame]:0;
 const bob=walk?[0,-.6,-.3,0,-.6,-.3][frame]:(animation==='idle'&&frame===1?-.35:0);
 const action=animation==='interact'?frame:animation==='acquire'?[1,5,9,8][frame]:0;
 let body='';
 if(direction==='down'){
  body=G('arms-back',action?P(`M25 36L20 ${35-action}L16 ${35-action}Q16 ${41-action} 21 43L26 40Z`,C.coat)+P(`M39 36L44 ${35-action}L48 ${35-action}Q48 ${41-action} 43 43L38 40Z`,C.coatDark):P(`M22 37Q18 ${39-phase} 19 ${45-phase}L23 ${46-phase}L26 39Z`,C.coatDark)+P(`M41 37Q46 ${39+phase} 45 ${46+phase}L41 ${47+phase}L38 39Z`,C.coatDark));
  body+=G('coat',P('M24 35Q32 32 40 35L44 51Q33 55 20 51Z',C.coat,C.ink)+P('M25 36Q29 34 31 35L29 51L22 50Z',C.coatLight)+P('M33 37L35 52',null,C.coatDark,1)+P('M25 49Q33 52 41 49',null,'#78A498',.7)+E(34.3,43,1,1,C.gold)+E(35,48,1,1,C.gold));
  body+=G('scarf-tail',P('M37 38L45 44L42 48L35 39Z',C.goldShade)+P('M37 38L44 44L42 45L36 39Z',C.gold));
  body+=G('bag-strap',P('M24 36L42 47',null,C.hairDark,2.4)+P('M24 36L42 47',null,C.bagLight,.85))+bag(39,43);
  body+=G('hands',action?P(`M21 40Q17 ${39-action*2} 18 ${36-action*2}Q21 ${33-action*2} 23 ${37-action*2}L24 40Z`,C.skin,C.skinShade,.5)+P(`M43 40Q48 ${39-action*2} 47 ${36-action*2}Q44 ${33-action*2} 42 ${37-action*2}L41 40Z`,C.skin,C.skinShade,.5):E(20.4,45-phase,2.7,3.4,C.skin)+E(44,45+phase,2.7,3.4,C.skin));
  body+=G('scarf-collar',P('M23 33Q32 36 41 33L41 37Q32 41 23 36Z',C.gold,C.goldShade,.65)+P('M24 34Q32 37 39 34',null,'#FFDB8C',1));
  body+=downHead(false);
 }else if(direction==='up'){
  body=G('arms-back',P(`M24 37L20 ${46+phase}Q17 ${47+phase} 18 ${43+phase}L20 37Z`,C.coatDark)+P(`M40 37L44 ${46-phase}Q47 ${47-phase} 46 ${43-phase}L44 37Z`,C.coat));
  body+=G('hands',E(19.8,45+phase,2.5,3.2,C.skinShade)+E(44.2,45-phase,2.5,3.2,C.skin));
  body+=G('coat',P('M24 34Q32 31 40 34L44 51Q32 55 20 51Z',C.coat,C.ink)+P('M25 35L23 49Q27 51 30 51L31 35Z',C.coatLight)+P('M32 39V52',null,C.coatDark,.8)+P('M22 49Q32 52 42 49',null,'#78A498',.8));
  body+=G('scarf-tail',P('M31 35L29 45L33 46L35 36Z',C.goldShade)+P('M33 35L36 43L39 42L36 35Z',C.gold));
  body+=G('bag-strap',P('M40 35L23 47',null,C.hairDark,2.4)+P('M40 35L23 47',null,C.bagLight,.85))+bag(17,43);
  body+=G('scarf-collar',P('M23 33Q32 35 41 33L40 37Q32 39 24 37Z',C.gold,C.goldShade,.65));
  body+=upHead();
 }else { body=sideSol(direction,phase,false); }
 return doc(`sol.${animation}.${direction}.${frame}`,boots(direction,phase,walk?[1,.5,-.5,-1,-.5,.5][frame]:0)+G('body',body,`translate(0 ${bob})`));
}
function sideSol(direction,phase,blink){
 const right=direction==='right'; let body='';
 // Far anatomical left-side bag is visible only as a sliver when facing left.
 if(!right)body+=bag(35,42,true);
 body+=G('far-arm',P(right?'M28 36L24 44L28 46L32 39Z':'M38 36L42 44L38 46L34 39Z',C.coatDark));
 body+=G('coat',P(right?'M26 35Q32 32 38 35L41 51Q32 54 23 51Z':'M26 35Q32 32 38 35L41 51Q32 54 23 51Z',C.coat,C.ink)+P('M27 36L25 50L30 51L32 36Z',C.coatLight)+P('M26 50Q33 52 39 50',null,'#78A498',.8));
 body+=G('scarf-tail',P(right?'M30 35L21 40L22 45L33 38Z':'M34 35L43 40L42 45L31 38Z',C.goldShade));
 body+=G('near-arm',P(right?`M31 37Q28 39 29 ${44-phase*2}L34 ${45-phase*2}L36 39Z`:`M34 37Q37 39 36 ${44+phase*2}L31 ${45+phase*2}L29 39Z`,C.coatLight)+E(right?31.5:33.5,right?45-phase*2:45+phase*2,2.7,3.3,C.skin));
 if(right)body+=G('bag-strap',P('M29 35L37 47',null,C.hairDark,2.4)+P('M29 35L37 47',null,C.bagLight,.85))+bag(33,44);
 body+=G('scarf-collar',P(right?'M24 33Q30 37 39 34L39 37Q31 40 24 36Z':'M25 34Q34 37 40 33L40 36Q31 40 25 37Z',C.gold,C.goldShade,.65));
 body+=G('hair-back',E(right?30:34,22,11.5,12,C.hairDark));
 body+=G('face',P(right?'M27 14Q38 12 41 21L44 27Q43 29 41 29Q40 36 33 37L26 32Z':'M37 14Q26 12 23 21L20 27Q21 29 23 29Q24 36 31 37L38 32Z',C.skin)+E(right?29:35,28.5,2.6,3,C.skinShade)+E(right?28.3:34.3,28,1.5,2,C.skin)+E(right?38.5:25.5,31.5,2,.9,'#E4AA83')+(blink?P(right?'M37 27.7h2':'M24.5 27.7h2',null,C.ink,1.1):E(right?38:26,27.8,1.05,1.4,C.ink))+P(right?'M38 33.5l2-.7':'M24 32.8l2 .7',null,'#B57F5C',.7));
 body+=G('hair-front',P(right?'M20 25Q18 16 26 11Q35 7 41 15L42 22Q38 22 36 18Q34 25 29 27L29 32L24 31Z':'M44 25Q46 16 38 11Q29 7 23 15L22 22Q26 22 28 18Q30 25 35 27L35 32L40 31Z',C.hair)+P(right?'M23 20Q23 14 30 12 M28 20Q31 17 32 13':'M26 17Q30 12 35 13 M38 17Q40 22 39 27',null,C.hairLight,1.2));
 if(!right)body+=note(33,17,.7);
 return body;
}
function clef(animation,frame){
 const talk=animation==='talk',react=animation==='react';
 const lift=react?[0,4,2][frame]:talk?[0,1,2][frame]:0;
 const bob=animation==='idle'&&frame===1?-.3:react&&frame===1?-.6:0;
 let body=G('staff',P('M48 55L47 24Q47 20 50 20Q53 20 53 23Q53 26 50 26',null,C.hairDark,3.2)+P('M47.5 53L46.7 25Q46.5 20.5 49.5 20.5',null,'#B29963',1.1)+P('M48 40L49 40 M48 43L49 43',null,C.goldShade,.7));
 body+=G('robe',P('M24 33Q32 30 40 33L44 52Q32 56 20 52Z',C.sage,C.ink)+P('M25 34Q29 32 32 33L29 52L22 51Z',C.sageLight)+P('M37 36L40 51L35 53L33 41Z',C.sageDark)+P('M24 50Q32 53 40 50',null,'#CBD1AF',.8)+P('M33 36L35 51',null,C.goldShade,1.2));
 body+=G('arms',P(`M24 35Q19 35 19 ${43-lift}L23 ${45-lift}L28 38Z`,C.sageLight)+P('M39 35Q44 35 46 42L43 46L37 39Z',C.sageDark));
 body+=G('hands',E(20,43-lift,2.6,3.8,C.skin)+E(46,43,2.6,3.5,C.skin));
 body+=G('hair-back',P('M20 26Q18 12 28 10Q42 7 44 22L43 33L21 33Z',C.silverShade));
 body+=G('face',E(21,28,2,3,C.skinShade)+E(43,28,2,3,C.skinShade)+P('M22 22Q22 13 32 13Q42 13 42 23L41 32Q36 39 29 36Q22 33 22 22Z',C.skin)+P('M24 24Q23 18 27 16',null,C.skinLight,1.1)+E(26.6,27.7,1.15,1.4,C.ink)+E(37.3,27.7,1.15,1.4,C.ink)+P(react&&frame===1?'M24 23L28 22 M35 22L39 23':'M24 24L28 23.5 M35 23.5L39 24',null,C.silverLight,1.35)+P('M31.5 28L30.5 30L33 30.5',null,'#BA8A62',.65));
 body+=G('hair-front',P('M20 25Q18 15 25 11Q32 7 39 11Q45 15 44 25L40 26L39 19Q34 18 32 14Q28 21 23 23L24 28L21 28Z',C.silver)+P('M23 19Q24 13 30 12',null,C.silverLight,1.8)+P('M39 13Q42 16 42 20',null,'#BBC1B1',1));
 body+=G('beard',P('M23 30Q27 32 31 32Q37 32 41 29Q42 39 33 45Q24 42 23 30Z',C.silver)+P('M24 31Q24 39 31 42Q27 36 29 33Z',C.silverLight)+P('M36 34Q36 39 33 42',null,'#C2C6B7',.85));
 body+=G('moustache',P('M31 31Q28 29 25 33Q28 34 31.5 32.3Q35 34 39 32.5Q35 29 32 31Z',C.silverLight));
 body+=G('mouth',talk&&frame===1?E(32,34.1,1.5,1.25,'#896D55'):talk&&frame===2?P('M30.5 34Q32 35.5 33.5 34',null,'#896D55',.8):react&&frame===1?E(32,34.2,1.15,1.7,'#896D55'):P('M30.5 34Q32 34.7 33.5 33.8',null,'#9B8568',.65));
 return doc(`clef.${animation}.down.${frame}`,boots('down',0)+G('body',body,`translate(0 ${bob})`));
}
function generateCharacters({root=path.resolve(__dirname,'..')}={}){
 const out=path.join(root,'assets/harmonia/source/characters');fs.mkdirSync(out,{recursive:true});const entries=[];
 const write=(role,animation,direction,frame,fps,svg)=>{const id=`${role}.${animation}.${direction}.${frame}`;const rel=`assets/harmonia/source/characters/${id}.svg`;fs.writeFileSync(path.join(root,rel),svg);entries.push({id,file:rel,logicalSize:[64,64],pivot:[32,56],category:'characters',animation,direction,frame,fps});};
 for(const d of ['down','up','left','right'])for(const a of ['idle','walk'])for(let i=0;i<(a==='idle'?2:6);i++)write('sol',a,d,i,a==='idle'?2:8,sol(d,a,i));
 for(const a of ['interact','acquire'])for(let i=0;i<(a==='interact'?3:4);i++)write('sol',a,'down',i,a==='interact'?6:6,sol('down',a,i));
 if(typeof clef==='function')for(const [a,n,fps] of [['idle',2,2],['talk',3,6],['react',3,6]])for(let i=0;i<n;i++)write('clef',a,'down',i,fps,clef(a,i));
 fs.writeFileSync(path.join(out,'characters-spec.json'),JSON.stringify({version:1,authoring:'Original editable layered SVG, no fonts or external artwork',light:'upper-left',pivot:[32,56],groundShadow:'runtime separate layer',horizontalMirroring:false,noteHairpin:'fixed filled-head right-stem single-flag eighth note; same orientation across directions',entries},null,2)+'\n');return entries;
}
module.exports={generateCharacters};
if(require.main===module)console.log(`Generated ${generateCharacters().length} character frames`);
