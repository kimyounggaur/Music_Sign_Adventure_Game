'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'assets/harmonia');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
  const a=JSON.parse(fs.readFileSync(path.join(dir,'atlas.json'))),frames=Object.entries(a.frames),m=a.meta;
  assert.equal(m.scale,4);assert.equal(m.colorSpace,'sRGB');assert.equal(m.rotation,false);assert.ok(m.padding>=2);assert.ok(m.extrude>=2);
  const characters=frames.filter(([id])=>id.startsWith('sol.')),clef=frames.filter(([id])=>id.startsWith('clef.'));
  assert.equal(characters.length,39,'Sol frames');assert.equal(clef.length,8,'Clef frames');
  const pages=[];for(const file of m.pages)pages.push(await sharp(path.join(dir,file)).raw().ensureAlpha().toBuffer({resolveWithObject:true}));
  let alphaChecks=0;
  for(const [id,f] of frames){
    assert.equal(f.rotated,false,id);assert.equal(f.trimmed,false,id);
    assert.equal(f.frame.w,f.logicalSize[0]*4,id);assert.equal(f.frame.h,f.logicalSize[1]*4,id);
    assert.equal(f.sourceSha256,sha(fs.readFileSync(path.join(root,f.file))),id);
    assert.equal(f.pngSha256,sha(fs.readFileSync(path.join(dir,'png',id+'.png'))),id);
    assert.equal(f.frame.x>=4&&f.frame.y>=4,true,id);
    if(/^(sol|clef)\./.test(id)){assert.deepEqual(f.logicalSize,[64,64],id);assert.deepEqual(f.pivot,[32,56],id);}
    const p=pages[f.page],F=f.frame;
    assert.ok(F.x+F.w+4<=p.info.width&&F.y+F.h+4<=p.info.height,id);
    const source=await sharp(path.join(dir,'png',id+'.png')).raw().ensureAlpha().toBuffer();
    // Exact source → packed pixels plus 2px extrusion and padding preservation.
    for(const [sx,sy] of [[0,0],[F.w-1,0],[0,F.h-1],[F.w-1,F.h-1],[Math.floor(F.w/2),Math.floor(F.h/2)]]){
      const s=(sy*F.w+sx)*4,d=((F.y+sy)*p.info.width+F.x+sx)*4;
      assert.deepEqual(p.data.subarray(d,d+4),source.subarray(s,s+4),id+' packed pixel');
    }
    const stats=await sharp(source,{raw:{width:F.w,height:F.h,channels:4}}).stats();
    if(!/^(ground|grass|path|stone)/.test(id)){assert.equal(stats.channels[3].min,0,id+' transparent edge');alphaChecks++;}
    // Slots must never overlap, including their extrusion and transparent guard.
    for(const [other,g] of frames){if(other<=id||g.page!==f.page)continue;const G=g.frame;
      assert.ok(F.x+F.w+4<=G.x-4||G.x+G.w+4<=F.x-4||F.y+F.h+4<=G.y-4||G.y+G.h+4<=F.y-4,id+' overlap '+other);
    }
  }
  const report={status:'passed',totalAssets:frames.length,solFrames:characters.length,clefFrames:clef.length,pages:m.pages.length,alphaChecks,padding:m.padding,extrude:m.extrude,colorSpace:m.colorSpace,checks:['source/output hashes','x4 sizes','fixed character foot pivots','source-to-atlas sampled pixels','no rotated or trimmed frames','transparent sprite edges','no slot overlaps']};
  fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/asset-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
