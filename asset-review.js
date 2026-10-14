'use strict';
document.querySelectorAll('[data-baseline]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-baseline]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  document.getElementById('before-frame').src=`index.html?preview=harmonia&art=${b.dataset.baseline}&seed=42&test=1`;
  document.getElementById('baseline-label').textContent=b.dataset.baseline==='original'?'01 / 최초 화면':'01 / 첨부 비교본';
}));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
  document.body.dataset.view=b.dataset.view;
  document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
}));
document.getElementById('reset').addEventListener('click',()=>document.querySelectorAll('iframe').forEach(f=>{f.src=f.getAttribute('src')}));
