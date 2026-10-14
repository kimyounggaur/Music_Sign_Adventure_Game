'use strict';
const fs=require('node:fs');
const path=require('node:path');
// Original 24-unit icon geometry. Musical note is an upright eighth note:
// filled oval head, upward stem on its right and one right-facing flag.
const shapes={
  move:'<path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4"/>',
  symbol_bag:'<path d="M7 7V5a5 3 0 0 1 10 0v2M4 7h16v14H4zM4 11h16M10 11v4h4v-4"/>',
  interact:'<path d="M4 12h15M13 6l6 6-6 6"/>',
  sound:'<path d="M3 9h4l5-5v16l-5-5H3zM16 8q5 4 0 8M19 5q7 7 0 14"/>',
  sound_off:'<path d="M3 9h4l5-5v16l-5-5H3zM17 10l4 4M21 10l-4 4"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  note:'<ellipse cx="8" cy="18" rx="4" ry="2.7" transform="rotate(-22 8 18)" fill="currentColor" stroke="none"/><path d="M11.5 17V3c0 5 9 5 7 11-1-4-5-4-7-6"/>'
};
function generateUI({root}){
  const dir=path.join(root,'assets/harmonia/source/ui');fs.mkdirSync(dir,{recursive:true});const out=[];
  for(const [name,shape] of Object.entries(shapes)){
    const id='ui_'+name,file=`assets/harmonia/source/ui/${id}.svg`;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" color="#e9bd63"><title>${name}</title><g id="icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${shape}</g></svg>`;
    fs.writeFileSync(path.join(root,file),svg+'\n');out.push({id,file,category:'ui',logicalSize:[24,24],pivot:[12,12]});
  }
  // Decorative procedural-style effects, kept separate from the educational glyph.
  const fxDir=path.join(root,'assets/harmonia/source/effects');fs.mkdirSync(fxDir,{recursive:true});
  for(const kind of ['attach_glow','door_response','foot_dust'])for(let n=0;n<5;n++){
    const id=`fx_${kind}_${n}`,file=`assets/harmonia/source/effects/${id}.svg`,a=(1-n/5).toFixed(2),r=8+n*4;
    let shape=kind==='foot_dust'?`<g fill="#e9ddbd" opacity="${a}"><ellipse cx="${25-n*2}" cy="44" rx="${2+n}" ry="${1+n/2}"/><ellipse cx="${40+n*2}" cy="42" rx="${1+n}" ry="${1+n/2}"/></g>`:`<g fill="none" stroke="#e9bd63" opacity="${a}"><ellipse cx="32" cy="32" rx="${r}" ry="${kind==='attach_glow'?r:r*.7}" stroke-width="${2-n*.25}"/><path d="M32 ${30-r}v-4M${34+r} 32h4M32 ${34+r}v4M${30-r} 32h-4" stroke-width="1.5"/></g>`;
    fs.writeFileSync(path.join(root,file),`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 64 64"><g id="effect">${shape}</g></svg>\n`);
    out.push({id,file,category:'effects',logicalSize:[64,64],pivot:[32,32],animation:kind,frame:n,fps:8});
  }
  return out;
}
module.exports={generateUI};
if(require.main===module){const root=path.resolve(__dirname,'..');console.log(generateUI({root}).length+' UI/effect sources');}
