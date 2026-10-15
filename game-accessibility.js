/* Semantic companions to the Canvas UI. Pointer gameplay remains on Canvas;
 * Tab/Enter exposes the same actions, music descriptions and dialogue to AT.
 */
'use strict';
window.createGameAccessibility = function createGameAccessibility(g) {
  const {canvas,CONFIG,UI,SYMBOLS}=g;
  const style=document.createElement('style');
  style.textContent=`.game-sr{position:fixed;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
    #game-actions{position:fixed;pointer-events:none;z-index:3}
    #game-actions button{position:absolute;pointer-events:none;opacity:0;border:0;border-radius:10px;font:600 12px system-ui}
    #game-actions button:focus-visible{opacity:1;outline:3px solid #b78f3c;outline-offset:2px;background:#fff8e8;color:#244c43}
    #game:focus-visible{outline:3px solid #b78f3c;outline-offset:-3px}`;
  document.head.append(style);
  const help=document.createElement('p');help.id='game-help';help.className='game-sr';
  help.textContent='방향키 또는 WASD로 이동, E로 상호작용, Q로 기호 가방, Escape로 메뉴. Tab으로 버튼을 선택하고 Enter로 실행합니다. 음악 퍼즐은 종의 글자와 화면 피드백으로도 풀 수 있습니다.';
  const status=document.createElement('div');status.id='game-status';status.className='game-sr';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  const controls=document.createElement('div');controls.id='game-actions';controls.setAttribute('role','group');controls.setAttribute('aria-label','게임 조작');
  document.body.append(help,status,controls);canvas.tabIndex=0;canvas.setAttribute('aria-describedby','game-help game-status');
  const buttons=new Map();let lastSync=0,lastMessage='',lastState='';
  function sync() {
    if(performance.now()-lastSync<100)return;lastSync=performance.now();
    const state=g.state(),data=g.data(),r=canvas.getBoundingClientRect(),sx=r.width/CONFIG.W,sy=r.height/CONFIG.H;
    Object.assign(controls.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
    const list=UI.buttons.map(b=>({...b,action:()=>g.activate(b.x+b.w/2,b.y+b.h/2)}));
    if(state==='SymbolSelect') {
      const menu=UI.symbolMenu;
      if(menu.mode==='pick')(menu.filter||data.symbols).forEach((id,i)=>list.push({id:'symbol-'+id,label:SYMBOLS[id].name+' — '+SYMBOLS[id].theory,x:56,y:128+i*64,w:248,h:56,enabled:true,action:()=>g.activate(180,156+i*64)}));
      if(menu.mode==='target')g.map().objects.filter(o=>o.attachTargets?.includes(menu.selected)).forEach(o=>list.push({id:'attach-'+o.id,label:o.label+'에 '+SYMBOLS[menu.selected].name+' 붙이기',x:90,y:CONFIG.H-220,w:180,h:48,enabled:true,action:()=>g.target(o)}));
    }
    if(state==='Dialogue'||(state==='Cutscene'&&!UI.codexList))list.push({id:'advance',label:state==='Dialogue'?'대화 계속':'이야기 또는 악전 카드 계속',x:90,y:CONFIG.H-70,w:180,h:48,enabled:true,action:()=>g.advance()});
    if(state==='Boot'&&document.body.dataset.assetStatus==='error')list.push({id:'reload',label:'게임 다시 불러오기',x:90,y:CONFIG.H/2+45,w:180,h:48,enabled:true,action:()=>location.reload()});
    const keep=new Set(list.map(b=>b.id));const hadFocus=controls.contains(document.activeElement);
    for(const [id,b] of buttons)if(!keep.has(id)){b.remove();buttons.delete(id);}
    for(const item of list) {
      let b=buttons.get(item.id);if(!b){b=document.createElement('button');b.type='button';b.dataset.action=item.id;controls.append(b);buttons.set(item.id,b);}
      const label=item.id.startsWith('codexCard_')?SYMBOLS[item.id.slice(10)]?.name||item.label:item.label;
      b.textContent=label;b.setAttribute('aria-label',label);b.disabled=!item.enabled;b.onclick=item.action;
      const w=Math.max(44,item.w*sx),h=Math.max(44,item.h*sy);
      Object.assign(b.style,{left:Math.max(0,Math.min(r.width-w,item.x*sx+(item.w*sx-w)/2))+'px',top:Math.max(0,Math.min(r.height-h,item.y*sy+(item.h*sy-h)/2))+'px',width:w+'px',height:h+'px'});
    }
    if(hadFocus&&document.activeElement===document.body)controls.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
    let message='';
    if(state==='Dialogue')message=g.DIALOGUE.active?.speaker+': '+(g.DIALOGUE.active?.lines[g.DIALOGUE.index]||'');
    else if(state==='Cutscene') {
      const id=UI.itemGet?.id||UI.codex?.id||UI.codexList?.items[UI.codexList.index];const s=SYMBOLS[id];
      message=s?`${s.name}. ${s.theory} ${s.effect}`:UI.cutscene?.cards[UI.cutscene.index]||'';
    } else if(state==='Explore')message=[g.map()?.name,g.quest()?.[1].objective,UI.interactTarget?.label,g.cue(),UI.toastTimer>0?UI.toastText:''].filter(Boolean).join('. ');
    else if(state==='Title')message='멜로디아. 끝나지 않는 노래. 새로 시작하거나 저장된 모험을 이어 하세요.';
    else if(state==='Pause')message=UI.codexDetail?`${SYMBOLS[UI.codexDetail].name}. ${SYMBOLS[UI.codexDetail].theory} ${SYMBOLS[UI.codexDetail].effect}`:UI.pauseView==='log'?g.DIALOGUE.log.map(x=>x.speaker+': '+x.line).join('. '):'가방과 악전. '+UI.pauseView;
    else if(document.body.dataset.assetStatus==='error')message='그림을 불러오지 못했습니다. 게임 다시 불러오기 버튼을 사용해 주세요.';
    if(message!==lastMessage){status.textContent=message;lastMessage=message;}
    if(lastState!==state){controls.setAttribute('aria-label',state==='Title'?'시작 메뉴':state==='Pause'?'가방과 악전 메뉴':'게임 조작');lastState=state;}
  }
  return {sync};
};
