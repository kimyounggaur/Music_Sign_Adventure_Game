'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/harmonia');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const scale=4,padding=2,extrude=2,margin=padding+extrude,pageSize=2048;
async function main(){
  const spec=[...require('./asset-characters').generateCharacters({root}),...require('./asset-environment').generateEnvironment({root}),...require('./asset-ui').generateUI({root})];
  if(new Set(spec.map(s=>s.id)).size!==spec.length)throw new Error('Duplicate asset ids');
  fs.mkdirSync(path.join(out,'png'),{recursive:true});
  const pages=[];let current={items:[],x:0,y:0,row:0};pages.push(current);
  const frames={},animations={};
  // Stable shelf pack, no rotation, no trim: feet pivots retain the source coordinate system.
  for(const a of spec){
    const [lw,lh]=a.logicalSize,w=lw*scale,h=lh*scale;
    if(w+margin*2>pageSize||h+margin*2>pageSize)throw new Error('Asset too large: '+a.id);
    if(current.x+w+margin*2>pageSize){current.x=0;current.y+=current.row;current.row=0;}
    if(current.y+h+margin*2>pageSize){current={items:[],x:0,y:0,row:0};pages.push(current);}
    const source=fs.readFileSync(path.join(root,a.file));
    const png=await sharp(source).resize(w,h).toColourspace('srgb').ensureAlpha().png().toBuffer();
    fs.writeFileSync(path.join(out,'png',a.id+'.png'),png);
    const extended=await sharp(png).extend({top:extrude,bottom:extrude,left:extrude,right:extrude,extendWith:'copy'}).png().toBuffer();
    const x=current.x+margin,y=current.y+margin;
    current.items.push({input:extended,left:x-extrude,top:y-extrude});
    frames[a.id]={...a,frameIndex:a.frame,page:pages.length-1,frame:{x,y,w,h},rotated:false,trimmed:false,pivotOutput:a.pivot.map(n=>n*scale),sourceSha256:hash(source),pngSha256:hash(png)};
    current.x+=w+margin*2;current.row=Math.max(current.row,h+margin*2);
    if(a.animation){
      const who=a.id.startsWith('sol')?'sol':a.id.startsWith('clef')?'clef':'fx';
      const key=[who,a.animation,a.direction].filter(Boolean).join('.');
      if(!animations[key])animations[key]={frames:[],fps:a.fps||8};
      animations[key].frames.push(a.id);
    }
  }
  const pageNames=[];
  for(let i=0;i<pages.length;i++){
    const name=`atlas-${i}.png`;pageNames.push(name);
    await sharp({create:{width:pageSize,height:pageSize,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(pages[i].items).png().toFile(path.join(out,name));
  }
  for(const anim of Object.values(animations))anim.frames.sort((a,b)=>(frames[a].frameIndex??frames[a].frameNumber??Number(a.match(/(\d+)$/)?.[1]||0))-(frames[b].frameIndex??frames[b].frameNumber??Number(b.match(/(\d+)$/)?.[1]||0)));
  const manifest={meta:{name:'Harmonia representative scene asset pack',version:'1.0.0-review',scale,colorSpace:'sRGB',format:'RGBA PNG',padding,extrude,rotation:false,pages:pageNames,pageSize:[pageSize,pageSize],collision:'Existing gameplay geometry is authoritative',defaultEntryUnchanged:true},frames,animations};
  fs.writeFileSync(path.join(out,'atlas.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Exported ${spec.length} assets / ${pages.length} atlas pages`);
}
main().catch(e=>{console.error(e);process.exitCode=1});
