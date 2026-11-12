'use strict';
/* The guide is independent of save data and does not change game state. */
window.createRulebook = function createRulebook({canvas, onOpen, onClose}) {
  const sections = [
    {id:'start',title:'모험의 시작',lead:'흩어진 음악기호를 모아 멜로디아의 노래를 되찾아요.',body:`<p>멈춰 버린 세계악보를 되살리기 위해 마을과 숲을 탐험하는 음악 모험이에요. 사람들의 이야기를 듣고, 기호를 찾고, 소리와 오선을 이용해 길을 열어 보세요.</p><div class="rb-tip">현재 게임은 하모니아 마을과 도레미 숲을 탐험하는 <strong>v0.1 프롤로그</strong>까지 플레이할 수 있어요.</div>`},
    {id:'controls',title:'이동과 상호작용',lead:'가까이 다가가 살펴보고, 대화를 끝까지 들어요.',body:`<ol><li><strong>이동</strong> 화면 아래 조이스틱을 끌거나 방향키 또는 WASD를 눌러요.</li><li><strong>상호작용</strong> 사람이나 사물 가까이에서 오른쪽 버튼을 누르거나 E를 눌러요. 대상에 따라 말하기·조사·줍기 등이 나타나요.</li><li><strong>대화 진행</strong> 화면을 누르거나 Enter/스페이스를 눌러 이어 읽어요.</li><li><strong>기호 가방</strong> 아래의 기호 가방을 누르거나 Q를 눌러 발견한 기호를 골라요.</li></ol><figure><img src="assets/rulebook/05-symbol-palette.svg" alt="기호 가방에서 음악기호를 선택하는 모습" loading="lazy"><figcaption>기호 가방에서 발견한 기호를 골라 필요한 곳에 사용해요.</figcaption></figure><p>상단의 현재 목표를 누르면 다음 단서를 볼 수 있어요.</p>`},
    {id:'village',title:'마을에서 단서 찾기',lead:'클레프와 피치의 말을 따라 첫 기호를 찾아요.',body:`<ol><li>마을의 <strong>클레프</strong>와 대화하고 오르골 탑 문을 조사해요.</li><li><strong>피치</strong>에게 말을 걸어 우물 뒤의 반짝이는 수풀에 대한 힌트를 들어요.</li><li>수풀을 조사해 <strong>높은음자리표</strong>를 얻어요.</li></ol><div class="rb-tip">수풀이 보이지 않으면 탑 문을 먼저 조사하고 피치의 대화를 끝까지 들어 보세요.</div>`},
    {id:'tower',title:'오르골 탑 열기',lead:'높은음자리표를 탑 문의 같은 모양 자리에 붙여요.',body:`<ol><li>기호 가방을 열고 <strong>높은음자리표</strong>를 선택해요.</li><li>빛나는 <strong>탑 문</strong>을 눌러 기호를 붙여요. 문이 열릴 때까지 잠시 기다려요.</li><li>탑 안으로 들어가 <strong>찢어진 세계악보</strong>를 조사하고 이야기를 끝까지 읽어요.</li><li>열린 숲 관문을 지나 도레미 숲으로 향해요.</li></ol><p>높은음자리표의 소용돌이는 오선의 둘째 줄, 솔을 감싸요.</p>`},
    {id:'forest',title:'숲의 세 음표',lead:'도·미·솔을 모아 오선 다리를 완성해요.',body:`<ul><li><strong>도</strong> 숲길에서 빛나는 도 음표를 주워요.</li><li><strong>미</strong> 까마귀가 들려주는 세 음을 듣고 종을 같은 순서로 밟아요.</li><li><strong>솔</strong> 바위를 밀어 그루터기 상자에 다가가 열어요.</li></ul><p>라라의 말과 주변 표지판도 확인해 보세요. 숲에는 찾아볼 수 있는 황금 음표도 있어요.</p>`},
    {id:'bird',title:'까마귀의 노래',lead:'세 음의 순서를 듣고 종을 같은 순서로 밟아요.',body:`<ol><li>까마귀에게 가까이 가서 상호작용하고 대화를 끝까지 읽어요. 대화가 끝나면 노래가 시작돼요.</li><li>까마귀가 들려주는 세 음과 빛나는 종을 살펴봐요. 소리를 켜면 음도 들을 수 있어요.</li><li>연주가 끝나면 <strong>도·미·솔 종을 들은 순서대로</strong> 캐릭터가 지나가며 밟아요.</li><li>성공하면 미 음표를 얻어요. 틀리면 노래가 다시 재생되니 다시 들어 보세요.</li></ol><div class="rb-tip">매번 같은 순서는 아니에요. 종의 빛과 화면의 음 이름도 단서가 됩니다.</div>`},
    {id:'rock',title:'바위를 밀고 상자 열기',lead:'바위 쪽으로 계속 움직이면 한 칸씩 밀려요.',body:`<ol><li>숲의 바위에 가까이 다가가요.</li><li>바위 방향으로 이동을 잠시 계속하면 바위가 한 칸 밀려요. 뒤쪽이 막혀 있다면 다른 방향에서 시도해요.</li><li>길이 열리면 그루터기 상자에 다가가 상호작용해 <strong>솔 음표</strong>를 얻어요.</li></ol>`},
    {id:'staff',title:'오선 다리 건너기',lead:'음표를 제자리에 놓고 낮은 음부터 높은 음으로 밟아요.',body:`<ol><li>오선의 빈 자리에 다가가 상호작용하고 기호 가방에서 알맞은 음표를 선택해요.</li><li><strong>도는 아래 첫째 덧줄, 미는 첫째 줄, 솔은 둘째 줄</strong>에 놓아요.</li><li>세 자리를 모두 채운 후 캐릭터로 <strong>도 → 미 → 솔</strong> 순서로 밟아요.</li><li>틀리면 낮은 도부터 다시 밟아요. 성공하면 멜로디가 복원되고 프롤로그 엔딩이 이어져요.</li></ol><figure><img src="assets/rulebook/10-bridge.svg" alt="도 미 솔 순서로 오선 다리를 밟는 모습" loading="lazy"><figcaption>음표를 제자리에 놓은 뒤 도에서 미, 솔 순서로 건너요.</figcaption></figure><div class="rb-tip">이 순서는 까마귀 노래 퍼즐과 달리 낮은 음에서 높은 음으로 고정돼 있어요.</div>`},
    {id:'save',title:'저장과 도감',lead:'발견한 기호는 도감에서 다시 살펴볼 수 있어요.',body:`<p>모험 중 주요 진행과 위치는 자동 저장돼요. 상단 일시정지 메뉴에서 도감과 대화 기록, 저장 관리를 확인할 수 있어요. 타이틀의 <strong>이어하기</strong>로 저장한 모험을 이어 가세요.</p><figure><img src="assets/rulebook/11-codex.svg" alt="발견한 음악기호를 도감에서 살펴보는 모습" loading="lazy"><figcaption>발견한 기호의 이름과 설명을 도감에서 다시 살펴봐요.</figcaption></figure><p>소리 버튼으로 소리를 켜고 끌 수 있어요. <strong>새로 시작</strong>이나 저장 초기화는 기존 진행을 지울 수 있으니 확인 문구를 읽어 주세요.</p><p>엔딩을 본 뒤 타이틀로 돌아가며, 현재 플레이 가능한 이야기는 프롤로그까지예요.</p>`}
  ];
  const button=document.createElement('button');
  button.type='button';button.id='rulebook-open';button.textContent='📖 룰북';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','rulebook-dialog');
  const dialog=document.createElement('dialog');dialog.id='rulebook-dialog';dialog.setAttribute('aria-labelledby','rulebook-title');
  dialog.innerHTML=`<div class="rb-shell"><header class="rb-header"><div><span class="rb-kicker">MELODIA ADVENTURE GUIDE</span><h1 id="rulebook-title">멜로디아 모험 룰북</h1><p>그림과 함께 떠나는 작은 음악 여행</p></div><button type="button" id="rulebook-close" aria-label="룰북 닫기">✕</button></header><nav class="rb-nav" aria-label="룰북 목차">${sections.map((s,i)=>`<a href="#rulebook-${s.id}">${String(i+1).padStart(2,'0')} ${s.title}</a>`).join('')}</nav><main class="rb-content">${sections.map((s,i)=>`<section id="rulebook-${s.id}" tabindex="-1"><div class="rb-section-heading"><span>${String(i+1).padStart(2,'0')}</span><div><h2>${s.title}</h2><p>${s.lead}</p></div></div><figure><img src="assets/rulebook/${s.id}.svg" alt="${s.title} 설명 그림" loading="lazy"><figcaption>${s.lead}</figcaption></figure><div class="rb-copy">${s.body}</div></section>`).join('')}<div class="rb-end">♪ 즐거운 모험 되세요 ♪</div></main></div>`;
  document.body.append(button,dialog);
  const close=dialog.querySelector('#rulebook-close');
  function place(){const r=canvas.getBoundingClientRect();button.style.left=`${r.left+r.width*0.47}px`;button.style.top=`${r.top+Math.max(5,r.width*0.018)}px`;}
  window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place);place();
  button.addEventListener('click',()=>{onOpen();dialog.showModal();close.focus();});
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{onClose();button.focus({preventScroll:true});});
  // Keep keyboard actions inside the guide; the game listens on window.
  window.addEventListener('keydown',e=>{if(dialog.open)e.stopImmediatePropagation();},true);
  window.addEventListener('keyup',e=>{if(dialog.open)e.stopImmediatePropagation();},true);
  dialog.querySelectorAll('.rb-nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();dialog.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'smooth',block:'start'});}));
  return {isOpen:()=>dialog.open};
};
