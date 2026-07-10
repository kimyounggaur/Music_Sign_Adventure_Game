# 《멜로디아: 끝나지 않는 노래》
## 『젤다의 전설: 꿈꾸는 섬』의 디오라마 감성을 재해석한 UI 리마스터 바이브코딩 프롬프트 v1.0

**분석 대상:** https://github.com/kimyounggaur/Music_Sign_Adventure_Game  
**기준 브랜치/커밋:** main / ae1b556e4466b01b92db1d30024139918bfbf924  
**작성일:** 2026-07-10  
**목표:** 현재 게임 로직과 음악교육 콘텐츠를 그대로 보존하면서, 화면 전체를 독창적인 “태엽식 음악상자 디오라마” UI로 단계적으로 리마스터한다.

---

## 0. 먼저 내리는 결론

이 프로젝트에서 필요한 것은 단순한 CSS 테마 변경이 아니다.

현재 앱은 React·Phaser·Unity가 아니라, 3,662줄의 단일 index.html 안에서 Canvas 2D로 타이틀, 월드, 캐릭터, HUD, 대화창, 도감, 퍼즐 피드백을 모두 직접 그린다. 따라서 리마스터의 핵심 수정 지점은 CSS보다 index.html의 draw 계열 함수와 Canvas 렌더링 원시 컴포넌트다.

가장 안전하고 완성도 높은 방향은 다음과 같다.

1. 실제 3D 또는 WebGL 게임으로 갈아엎지 않는다.
2. 기존 360×640 좌표, 충돌, 퍼즐, 저장, 조작을 유지한다.
3. Canvas 2D의 그림자, 높이 측면, 재질, Y 정렬, 부드러운 하이라이트로 2.5D 디오라마 인상을 만든다.
4. 참고작의 캐릭터·로고·아이콘·레이아웃을 복제하지 않는다.
5. “작은 피규어 세계, 최소 HUD, 촉각적인 오브젝트, 짧고 명확한 피드백”이라는 추상 원리만 가져온다.
6. 멜로디아만의 시각 언어인 오르골, 악보 종이, 황동, 펠트, 도자기 음악기호를 사용한다.
7. 전체 재작성 대신 한 화면씩 교체하고, 매 단계마다 기존 테스트와 시각 회귀 테스트를 통과시킨다.

### 권장 사용법

- 새 바이브코딩 세션에서 먼저 “Prompt 0 — 컨텍스트 로드”를 붙여넣는다.
- 그다음 Step 1부터 Step 12까지 한 단계씩 실행한다.
- 한 단계의 테스트가 통과하기 전에는 다음 단계로 넘어가지 않는다.
- AI가 전체 index.html 재작성, 프레임워크 마이그레이션, 실제 3D 전환을 제안하면 중단시키고 이 문서의 불변식을 다시 전달한다.
- 각 Step은 하나의 로컬 커밋으로 남기고, 원격 push와 배포는 사용자가 승인한 뒤 진행한다.

---

# PART 1. 현재 저장소 정밀 분석

## 1.1 기술 구조

| 구분 | 현재 상태 |
|---|---|
| 런타임 | Vanilla JavaScript, Canvas 2D, Web Audio |
| 핵심 파일 | index.html 3,662줄 |
| 논리 화면 | 360×640, 모바일 세로 모드 |
| 타일 | 32px |
| 상태 머신 | Boot, Title, Explore, Dialogue, SymbolSelect, TimelineEdit, Puzzle, Cutscene, Pause |
| 맵 | village, tower, forest |
| 저장 | localStorage, melodia_v01_save, version 1 |
| 입력 | 터치 플로팅 조이스틱, 상호작용·팔레트 버튼, WASD/방향키, E, Q, Esc, Space, Enter |
| 테스트 | Playwright E2E 15개, 인게임 SELFTEST 22개 |
| PWA | manifest.webmanifest, sw.js, 오프라인 프리캐시 |
| 배포 | Vercel 및 GitHub Actions |

## 1.2 index.html 내부 모듈 순서

현재 Game IIFE의 구조를 유지한다.

1. CONFIG
2. AUDIO
3. INPUT
4. MAPS
5. ENTITIES
6. SYMBOLS
7. RHYTHM
8. DIALOGUES / DIALOGUE
9. HINTS / HINT
10. QUEST
11. SAVE
12. UI
13. SCENES
14. PUZZLES
15. SELFTEST
16. RENDER
17. MAIN

## 1.3 화면별 현재 렌더 함수

| 화면/기능 | 현재 함수 |
|---|---|
| 부팅 | drawBoot |
| 타이틀 | drawTitle |
| 버튼/확인창 | drawButton, drawConfirmPanel |
| 월드 | drawWorld, drawTile, drawMapDetails |
| 오브젝트/캐릭터 | drawObject, drawPlayer |
| 탐험 HUD | drawHud, drawJoystick |
| 부착 대상 | drawAttachHighlights |
| 퍼즐 피드백 | drawPuzzleFeedback |
| 대화 | drawDialogue |
| 기호 선택 | drawSymbolSelect |
| 컷신/획득 카드 | drawCutscene |
| 일시정지 | drawPause, drawPauseShell |
| 도감 | drawPauseCodex, drawSymbolArt |
| 대화 기록 | drawPauseLog |
| 저장 관리 | drawPauseSave |
| 알림 | drawToast |

## 1.4 현재 구현에서 반드시 보존할 게임 흐름

### MQ01

1. 오르골 탑 조사
2. 피치와 대화
3. 우물 뒤 수풀에서 높은음자리표 획득
4. 기호 팔레트에서 높은음자리표 선택
5. 탑 문에 부착
6. 탑 내부 진입
7. 세계악보 조사
8. 도레미 숲 관문 개방

### MQ02

1. 도 음표 획득
2. 까마귀의 C/E/G 순서 청음
3. 종을 정답 순서대로 입력
4. 미 음표 획득
5. 바위를 밀고 상자에서 솔 음표 획득
6. 도·미·솔을 알맞은 오선 슬롯에 배치
7. 낮은 음부터 높은 음 순서로 다리 진행
8. 오선 문 개방
9. 세계악보 멜로디 파트 복원
10. 엔딩

## 1.5 최신 코드 기준 주요 UI 문제

| 문제 | 리마스터 대응 |
|---|---|
| 월드가 단색 사각 타일과 단순 도형 중심 | 접촉 그림자, 타일 높이 측면, 고정 장식, 재질 하이라이트 추가 |
| 플레이어가 파란 둥근 사각형, NPC가 글자 들어간 사각형 | 충돌 박스는 유지하고 표시만 독창적 미니어처 캐릭터로 교체 |
| 색·반경·그림자·서체가 draw 함수마다 하드코딩 | DIORAMA_THEME와 공통 렌더 프리미티브 도입 |
| 퀘스트 HUD의 긴 문장이 한 줄로 넘칠 수 있음 | 2행 래핑과 상태별 높이 조절 |
| 토스트, 퍼즐 카드, 부착 안내가 같은 상단 영역에서 충돌 | 상태 기반 UI safe-zone과 notice stack 도입 |
| 조이스틱이 누른 뒤에만 보여 초행 사용자가 발견하기 어려움 | 매우 옅은 휴면 안내 링과 첫 플레이 안내 제공 |
| Canvas 전체에 aria-label만 존재 | 동기화된 의미론적 DOM 접근성 레이어 추가 |
| 테스트가 일부 화면 좌표를 하드코딩 | 버튼 ID로 중심 좌표를 찾는 tapButton 헬퍼 추가 |
| image-rendering이 pixelated이며 스무딩이 대부분 꺼짐 | 디오라마 에셋은 auto/smoothing, 필요 구간만 선택적으로 복원 |
| 시각 회귀 테스트가 없음 | 핵심 화면별 360×640 스냅샷 테스트 추가 |
| 앱 아이콘의 높은음자리표와 배경 대비가 매우 낮음 | 멜로디아 고유 황동·에나멜 문장으로 재설계 |
| 사용하지 않는 381×46 CMYK JPG가 약 672KB인데 선로딩됨 | 에셋 사용성 감사, sRGB 최적화, 초기 로딩 예산 도입 |

---

# PART 2. 참고작에서 가져올 원리와 가져오지 않을 것

## 2.1 공식 자료로 확인된 핵심

Nintendo의 그래픽 디렉터 인터뷰에 따르면, 제작진은 캐릭터를 약 10cm 크기의 피규어로 상정하고 작은 디오라마를 들여다보는 느낌을 목표로 했다. 또한 풍부한 디테일과 미니어처 축척에서 과도하지 않은 디테일 사이의 균형을 강조했다.

- [Nintendo 그래픽 디렉터 인터뷰](https://zelda.nintendo.com/links-awakening/blog/director-yoshiki-haruhana/)
- [Nintendo 공식 게임 소개](https://zelda.nintendo.com/links-awakening/)
- [Nintendo 공식 Gameplay](https://zelda.nintendo.com/links-awakening/gameplay/)

음악 제작에서도 거대한 오케스트라보다 작은 편성과 단순한 선율이 화면의 축척과 어울리도록 설계되었다.

- [Nintendo 음악 작곡가 인터뷰](https://zelda.nintendo.com/links-awakening/blog/music-composer-ryo-nagamatsu/)

## 2.2 멜로디아에 적용할 추상 원리

- 작은 수제 모형을 내려다보는 듯한 공간감
- 화면 중앙의 플레이 공간을 비워두는 최소 HUD
- 아이콘만 보고도 기능을 이해할 수 있는 물리적 형태
- 짧고 탄력적인 버튼·보상 피드백
- 따뜻하고 밝은 색과 부드러운 접지 그림자
- 과도한 디테일보다 축척의 일관성
- 작은 악기 편성처럼 간결하고 명확한 UI 사운드

## 2.3 저작권·브랜드 안전 가드레일

이 문서의 “꿈꾸는 섬 감성”은 디자인 방향을 설명하기 위한 참고 표현이다. 실제 앱 화면과 코드, 에셋 이름에는 Nintendo 또는 Zelda 고유 표현을 사용하지 않는다.

### 절대 금지

- Nintendo, Zelda, Link, Koholint, Triforce 등의 로고·명칭·문장 사용
- 초록 모자 영웅, 원작 캐릭터 비율·의상·얼굴 실루엣 모방
- 하트 컨테이너, 루피, 젤다식 검·방패·열쇠·병 아이콘 복제
- 원작 HUD의 정확한 위치, 메뉴 탭 구조, 패널 비율, 대화창 형태 복제
- Nintendo 전용 서체 또는 유사 복제 서체 사용
- 원작 음악·효과음·짧은 음형 샘플링 또는 재현
- 스크린샷 트레이싱, 게임 파일 추출, 팬 리소스 다운로드
- 생성형 이미지 프롬프트에 원작 캐릭터나 게임명을 넣어 유사 에셋 생성
- 현재 게임에 없는 체력·화폐·전투 UI를 장식 목적으로 추가

### 반드시 지킬 독창성

- 세계는 섬이 아니라 “태엽식 음악상자 극장”으로 정의한다.
- 지형은 펠트, 칠한 목재, 종이 악보, 황동 장치로 표현한다.
- 캐릭터는 멜로디아 고유의 리듬 수리공과 악보 생명체로 만든다.
- 기호 인벤토리는 젤다식 아이템 창이 아니라 “악기 케이스 속 악보 카드”로 만든다.
- 대화창은 원작 박스가 아니라 “콘서트 프로그램 리본”으로 만든다.
- 보상은 머리 위로 들어 올리는 구도가 아니라 악보대 위에서 기호가 조립되는 연출로 만든다.
- 모든 신규 에셋은 ASSET_LICENSES.md에 제작 방식과 권리를 기록한다.

---

# PART 3. 절대 변경하지 않는 기능 계약

다음 항목은 UI 리마스터 범위에서 변경 금지다.

## 3.1 엔진·좌표

- CONFIG.W = 360
- CONFIG.H = 640
- CONFIG.TILE = 32
- 고정 timestep과 update/render 분리
- DPR 대응 resize와 screenToGame 좌표 변환
- 맵 크기, 충돌 배열, 스폰 위치
- 오브젝트의 논리 좌표와 충돌 박스
- Y 정렬과 카메라 이동 규칙

## 3.2 상태·데이터

- 상태 문자열 9개
- setState를 통한 상태 전환
- 맵 ID village, tower, forest
- 오브젝트 ID
- 퀘스트 ID MQ01, MQ02
- 기존 flag 이름과 진행 조건
- SYMBOLS의 pitch, staffSlot, solfege, theory, effect
- C4/E4/G4와 주파수 계산 공식
- 까마귀 정답 생성과 오선 다리 순서
- 대사, 퀘스트 내용, 엔딩 조건

## 3.3 저장

- 진행 저장 키 melodia_v01_save
- 저장 version 1
- 기존 저장 파일의 로드 호환
- 기존 symbols, goldenNotes, quests, flags, codex, scoreParts, playerPosition
- UI 작업만으로 저장 버전을 올리지 않는다.
- 새 UI 설정은 선택적 필드 또는 별도 UI 설정 키로 추가하되 기존 진행 저장을 훼손하지 않는다.

## 3.4 입력·테스트·PWA

- 터치 플로팅 조이스틱의 이동 로직
- WASD/방향키, E, Q, Esc, Space, Enter
- 버튼 ID
- ?test=1, ?seed=42, ?debug=1
- window.MelodiaDebug
- body.dataset.gameState
- body.dataset.mapId
- manifest의 앱 이름, standalone, portrait 기본 동작
- 서비스 워커와 오프라인 실행

### 표시 크기와 충돌 크기 분리 규칙

플레이어의 논리 충돌 박스 20×24는 유지한다. 캐릭터를 28×34 안팎으로 더 크게 그릴 수 있지만, 발 중심과 충돌 좌표는 바꾸지 않는다. NPC와 오브젝트도 같은 원칙을 적용한다.

---

# PART 4. 리마스터 시작 전에 해결할 안전 결함

## 4.1 타이틀 소리 버튼의 기존 저장 덮어쓰기 위험

현재 init은 SAVE.hasSave만 확인하고 SAVE.load로 기존 데이터를 메모리에 불러오지 않는다. 그런데 타이틀 화면에서 소리를 바꾸면 AUDIO.setMuted가 SAVE.write('settings')를 호출한다. 이때 기본 상태의 DATA와 초기 플레이어 좌표가 melodia_v01_save에 기록되어 기존 진행이 덮어써질 수 있다.

이 결함은 타이틀 UI를 수정하기 전에 반드시 고친다.

### 권장 해결 원칙

1. 진행 저장과 UI 설정 쓰기를 분리한다.
2. SETTINGS_KEY 예: melodia_ui_settings_v1을 추가할 수 있다.
3. 타이틀에서 소리·진동 변경 시 진행 스냅샷을 쓰지 않는다.
4. 기존 진행 저장의 soundOn/hapticsOn은 하위 호환으로 읽는다.
5. 별도 UI 설정이 있으면 그 값을 우선 적용한다.
6. 저장이 없는 타이틀에서 소리를 바꿔도 이어하기가 활성화되면 안 된다.
7. 저장 초기화는 진행 데이터와 UI 설정 중 무엇을 지우는지 명시한다. 기본 권장은 진행만 초기화하고 소리·진동 선호는 유지하는 것이다.

### 필수 회귀 테스트

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| SV-01 | 기존 진행 저장 주입 → 타이틀 → 소리 토글 | quests, flags, symbols, codex, scoreParts, playerPosition 불변 |
| SV-02 | 저장 없음 → 타이틀 → 소리 토글 | hasSave는 false, 이어하기 비활성 |
| SV-03 | 저장된 soundOn=false로 부팅 | 첫 프레임부터 무음 표시와 실제 음소거 일치 |
| SV-04 | 이어하기 | 맵, 좌표, 퀘스트, 수집품 정상 복원 |
| SV-05 | 저장 초기화 | 진행은 초기화되고 정책대로 UI 설정은 유지 |

---

# PART 5. 목표 아트 디렉션

## 5.1 콘셉트 이름

**Melodia Music-Box Diorama — 손바닥 위에서 움직이는 음악상자 극장**

## 5.2 재질 언어

| 요소 | 재질 |
|---|---|
| 지면 | 펠트, 종이, 무광 점토 |
| 길 | 비스킷색 칠한 목재 또는 압축 종이 |
| 물 | 청록 유리·에나멜, 얕은 흰 파동 |
| 탑/문 | 짙은 목재, 황동 톱니와 얇은 빛 |
| 음악기호 | 크림 도자기 또는 황동 메달 |
| UI 패널 | 악보 종이, 얇은 목재 프레임, 직물 리본 |
| 포커스 | 청록 음파 링과 작은 박자 점 |
| 성공 | 악보대 위 금빛 화음 입자 |

## 5.3 맵별 방향

| 맵 | 시각 방향 |
|---|---|
| 하모니아 마을 | 크림색 회벽, 비스킷 길, 작은 종꽃, 음표 풍향계, 황동 오르골 탑 |
| 오르골 탑 | 짙은 목재, 황동 톱니, 낡은 악보 종이, 좁고 따뜻한 스포트라이트 |
| 도레미 숲 | 둥근 펠트 나무, 종꽃, 청록 물길, 오선 돌다리, 작은 안개 |

## 5.4 독자 팔레트

아래 값은 참고작에서 추출한 색이 아니라 멜로디아를 위해 새로 정한 권장값이다.

| 토큰 | 값 | 용도 |
|---|---:|---|
| Ink | #27313B | 본문, 아이콘 |
| Ink Muted | #65717A | 보조 문구 |
| Paper | #FFF3D6 | 기본 패널 |
| Paper Raised | #FFF9E8 | 강조 패널 |
| Indigo | #3C4F76 | 주인공·중요 UI |
| Mint | #58B7A0 | 상호작용·성공 보조 |
| Coral | #F06F61 | 위험·오류 |
| Brass | #D9A441 | 보상·수집·테두리 |
| Sky | #74C9D6 | 포커스·청음 |
| Wood | #795238 | 프레임·문 |
| Wood Dark | #4C3324 | 프레임 측면 |
| Felt Green | #6EAE62 | 숲·마을 지면 |
| Water | #54B7C2 | 물 |
| Shadow | rgba(33, 24, 18, 0.26) | 접촉 그림자 |
| Overlay | rgba(27, 34, 40, 0.62) | 모달 뒤 |

금색은 밝은 패널 위 본문색으로 사용하지 않는다. 기본 본문 조합은 Paper + Ink다.

## 5.5 권장 디자인 토큰

~~~js
const DIORAMA_THEME = {
  color: {
    ink: '#27313B',
    inkMuted: '#65717A',
    paper: '#FFF3D6',
    paperRaised: '#FFF9E8',
    indigo: '#3C4F76',
    mint: '#58B7A0',
    coral: '#F06F61',
    brass: '#D9A441',
    sky: '#74C9D6',
    wood: '#795238',
    woodDark: '#4C3324',
    feltGreen: '#6EAE62',
    water: '#54B7C2',
    shadow: 'rgba(33,24,18,.26)',
    overlay: 'rgba(27,34,40,.62)'
  },
  radius: { sm: 8, md: 12, lg: 18, pill: 999 },
  stroke: { hairline: 1, normal: 2, strong: 3 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  type: { caption: 12, label: 14, body: 16, dialogue: 17, heading: 22, title: 30 },
  touch: { minimum: 44, normal: 48, primary: 62 },
  motion: { press: 120, slot: 150, panel: 180, reward: 280, scene: 320 },
  light: { x: -0.55, y: -0.84, shadowX: 3, shadowY: 5 }
};
~~~

## 5.6 공통 Canvas 프리미티브

다음 함수를 추가하고 화면마다 중복된 패널·버튼 코드를 점진적으로 교체한다.

- drawToyPanel
- drawMusicScrollPanel
- drawRaisedButton
- drawInsetSlot
- drawContactShadow
- drawTileElevation
- drawFocusRing
- drawBadge
- drawObjectiveCard
- drawIconButton
- drawProgressPips
- drawPaperTexture
- drawDioramaVignette
- withImageSmoothing

### 프리미티브 규칙

- 그리기 함수 안에서 게임 상태를 바꾸지 않는다.
- 시각 좌표와 UI.button의 히트 좌표는 하나의 레이아웃 정의에서 파생한다.
- 장식용 그림자와 광택은 입력 영역을 바꾸지 않는다.
- 자주 쓰는 gradient, Path2D, 종이 패턴은 캐시한다.
- 매 프레임 Math.random으로 장식을 생성하지 않는다.
- 타일 장식은 mapId, x, y를 이용한 좌표 해시로 고정한다.
- ctx 상태는 save/restore로 복원한다.
- UI 텍스트에는 blur나 저대비 그림자를 적용하지 않는다.

---

# PART 6. 화면별 완성 사양

## 6.1 Boot

- 어두운 빈 화면 대신 작은 오르골 뚜껑이 열리는 0.3~0.5초 인상으로 구성한다.
- 로딩 완료 전에는 실제 기능 버튼을 보이지 않는다.
- reduced motion에서는 위치·스케일 애니메이션 없이 짧은 페이드만 사용한다.
- 로딩 오류가 생기면 음악기호 에셋 실패 경로를 디버그 모드에 표시한다.

## 6.2 Title

- 실제 마을 렌더 일부를 정적인 미니어처 음악상자 무대처럼 보여준다.
- 제목은 Nintendo 로고를 연상시키지 않는 오르골 황동 명판 또는 오선 두루마리로 만든다.
- 새로 시작, 이어하기, 소리 버튼 ID와 기능을 유지한다.
- 이어하기가 없으면 흐린 색만 사용하지 말고 잠금 아이콘과 “저장된 모험 없음”을 함께 표시한다.
- 기존 저장이 있을 때 새로 시작 확인창을 유지한다.
- “자료 기반…”과 같은 개발용 문구는 플레이어 화면에서 제거하거나 정보 화면으로 이동한다.
- 소리 버튼은 PART 4의 저장 안전 결함을 해결한 뒤 연결한다.

## 6.3 탐험 HUD

- 좌상단에는 지역명과 목표를 담은 악보 리본을 둔다.
- 목표는 한글 2행 래핑, 말줄임 또는 축약 규칙을 사용한다.
- 우상단 소리·일시정지 버튼은 최소 44×44를 유지한다.
- 우하단 상호작용 버튼은 말하기, 읽기, 줍기, 열기, 조사, 듣기, 놓기, 밀기, 이동을 표시한다.
- 상호작용 대상명은 버튼 아래 작은 라벨 또는 접근 이름표로 보여준다.
- 기호 팔레트는 악기 케이스 모양의 독자 버튼으로 표현한다.
- 가짜 체력, 하트, 화폐, 전투 아이콘을 추가하지 않는다.

## 6.4 조이스틱

- 현재 누른 위치에 생기는 플로팅 조이스틱 로직을 유지한다.
- 휴면 상태에는 첫 플레이 또는 일정 시간 동안만 아주 옅은 안내 링을 보여준다.
- 바닥 음각 원반과 지휘봉 손잡이 모티프로 만든다.
- 최대 반경 48px과 데드존 8px은 변경하지 않는다.
- 색만으로 방향을 구분하지 않는다.

## 6.5 대화

- 현재 하단 332×150 영역과 4행 가독성을 크게 훼손하지 않는다.
- 악보 종이와 화자 직물 리본을 결합한 프레임을 사용한다.
- 화자명, 화자별 색, 작은 고유 메달을 표시한다.
- 본문은 17px 이상, Ink 계열, 행간 24~26px를 유지한다.
- 첫 탭은 타이핑 즉시 완성, 다음 탭은 진행이라는 기존 동작을 보존한다.
- 마지막 줄의 닫기와 다음 줄의 진행 표시를 다른 형태로 구분한다.
- 스크린리더에는 글자 하나씩이 아니라 완성 문장 한 번만 전달한다.

## 6.6 기호 팔레트와 부착 모드

- SymbolSelect와 symbolMenu.mode의 pick/target 흐름을 유지한다.
- 외형은 “악기 케이스 안의 악보 카드”로 만든다.
- 카드에는 기호 이미지, 이름, 게임 효과를 한눈에 보여준다.
- 이름 앞에 의도치 않은 “/”가 붙는 현재 표시 오류를 수정한다.
- 기호가 늘어날 것을 고려해 스크롤 또는 2열 확장을 준비한다.
- 슬롯 퍼즐에서는 가능한 음표만 보여준다.
- target 모드에서 월드를 가리지 않고, 선택 기호와 취소 버튼을 상단 safe-zone에 고정한다.
- 붙일 수 있는 대상은 청록 음파 링, 점선, 포인터를 함께 사용한다.

## 6.7 퍼즐 피드백

### 까마귀 청음

- 재생 중인 종을 실제 월드에서 발광시킨다.
- 음이름, 진행 점, 현재 재생 위치를 함께 표시한다.
- 소리가 꺼져 있어도 시각적으로 진행을 이해할 수 있어야 한다.
- 정답·오답·재생 중을 색뿐 아니라 아이콘과 모션으로 구분한다.

### 오선 다리

- 도·미·솔의 낮은 음→높은 음 관계를 진행 점과 위치 포인터로 보여준다.
- 오답 시 흔들림에만 의존하지 말고 “낮은 음부터” 문구를 제공한다.
- 퍼즐 정답과 flag 변화는 절대 수정하지 않는다.

## 6.8 획득 카드와 컷신

- 기호 획득 시 악보대가 펼쳐지고 메달이 조립되는 짧은 연출을 사용한다.
- 머리 위로 물건을 들어 올리는 원작식 보상 구도를 사용하지 않는다.
- 기호명, 음악이론 설명, 게임 효과의 정보 계층을 분리한다.
- Cutscene, codex, codexList 흐름을 유지한다.
- Skip 버튼은 최소 44px 높이와 명확한 라벨을 유지한다.

## 6.9 Pause·도감·대화 기록·저장 관리

- “접힌 악보 여행 수첩”을 고유 콘셉트로 사용한다.
- 계속, 악전 도감, 대화 기록, 소리, 진동, 저장 관리, 타이틀 기능을 모두 보존한다.
- 미발견 도감 카드는 잠금+물음표+텍스트로 표시한다.
- 도감 상세에는 기호, 이름, 이론, 게임 효과를 분리한다.
- 대화 기록은 화자 색만으로 구분하지 말고 이름과 메달도 제공한다.
- 저장 초기화는 2단계 확인을 유지한다.
- 모달이 열릴 때 뒤 월드 입력이 발생하지 않아야 한다.

## 6.10 토스트·힌트·확인창

- 상단 퀘스트, 퍼즐 피드백, target 안내와 겹치지 않도록 상태 기반 notice stack을 사용한다.
- 저장, 성공, 경고, 오류를 아이콘+문구로 구분한다.
- 긴 한글 문장을 2행 이상 안전하게 래핑한다.
- 일반 알림은 aria-live polite, 치명 오류만 assertive를 사용한다.
- reduced motion에서는 이동 대신 80~120ms 페이드로 대체한다.

## 6.11 월드의 디오라마 표현

- 실제 blur 필터나 무거운 후처리를 매 프레임 사용하지 않는다.
- 지형의 남쪽·동쪽 가장자리에 3~6px 높이 측면을 그린다.
- 오브젝트 아래 납작한 타원 접촉 그림자를 그린다.
- 빛은 좌측 상단에서 온다는 규칙을 통일한다.
- 캐릭터와 오브젝트는 발 기준 Y 정렬을 유지한다.
- 화면 상·하단에는 아주 약한 비네트와 소프트 포커스 “인상”만 주고 UI는 항상 선명하게 유지한다.
- 꽃, 돌, 잎은 좌표 해시로 고정하여 시각 테스트를 안정화한다.

## 6.12 세로 화면·레터박스

- 모바일 세로 우선을 유지한다.
- 100dvh, visualViewport, safe-area를 함께 고려한다.
- 320×568, 360×640, 390×844, 412×915, 768×1024 세로 화면을 검사한다.
- 태블릿·데스크톱의 남는 영역은 어두운 무대 커튼 또는 추상 악보 패턴으로 처리한다.
- 현재 가로 회전 안내를 유지한다.
- 가로 모드 정식 플레이 지원은 별도 프로젝트로 남긴다.

---

# PART 7. 구현 로드맵

| Step | 작업 | 핵심 게이트 |
|---:|---|---|
| 0 | 컨텍스트 로드 | AI가 구조와 불변식을 정확히 복창 |
| 1 | 안전 준비·저장 결함·기준선 | 저장 무결성 + 기존 테스트 기준 기록 |
| 2 | 디자인 토큰·공통 프리미티브 | 로직 무변경, Boot/Title 일부 적용 |
| 3 | Boot·Title·회전 안내 | 새 게임/이어하기/설정 안전 |
| 4 | 월드 2.5D 디오라마 | 충돌·맵·퍼즐 무변경 |
| 5 | 탐험 HUD·조이스틱·상호작용 | 터치·키보드·긴 목표 통과 |
| 6 | 대화·토스트·확인창 | 4행, 타입라이터, 알림 충돌 없음 |
| 7 | 기호 팔레트·부착 모드 | pick/target/취소/슬롯 회귀 통과 |
| 8 | 컷신·도감·Pause | 모든 빈 상태와 뒤로가기 통과 |
| 9 | 퍼즐 피드백·모션·UI 사운드 | 무음·감소 모션에서도 진행 가능 |
| 10 | 접근성·반응형 | 키보드·aria-live·5개 뷰포트 |
| 11 | 에셋·성능·PWA·아이콘 | 오프라인, 로딩 예산, 캐시 갱신 |
| 12 | 전체 회귀·시각 테스트·출시 | 치명/높음 0, 기능 여정 통과 |

---

# PART 8. 단계별 복사·붙여넣기 프롬프트

## Prompt 0 — 새 세션 컨텍스트 로드

~~~text
[멜로디아 Music-Box Diorama UI 리마스터 — 컨텍스트 로드]

너는 다음 역할을 동시에 수행한다.

1. 시니어 Canvas 2D 게임 UI 엔지니어
2. 모바일 게임 UI/UX 디자이너
3. 수제 미니어처 디오라마 아트 디렉터
4. 웹 접근성·성능·PWA QA 엔지니어
5. 기존 게임 기능을 훼손하지 않는 증분 리팩터링 담당자

분석 대상:
https://github.com/kimyounggaur/Music_Sign_Adventure_Game

기준:
- main
- commit ae1b556e4466b01b92db1d30024139918bfbf924
- index.html 3,662줄
- Vanilla JS + Canvas 2D + Web Audio + localStorage + PWA
- 논리 해상도 360×640, TILE 32, 모바일 세로

목표:
게임 로직과 음악교육 콘텐츠를 그대로 보존하면서 “손으로 만든 태엽식 음악상자 극장”이라는
독창적인 미니어처 디오라마 UI로 단계적으로 리마스터한다.

중요:
이 작업은 Nintendo UI 복제 작업이 아니다. 참고작에서 가져오는 것은 미니어처 축척,
중앙을 비우는 최소 HUD, 촉각적인 오브젝트, 부드러운 접지 그림자, 짧고 명확한 피드백뿐이다.
Nintendo의 로고, 캐릭터, 아이콘, 하트, 루피, 검·방패, 맵, UI 배치, 폰트, 음악,
효과음, 스크린샷, 추출 에셋을 사용하거나 모방하지 않는다.

현재 구조:
CONFIG → AUDIO → INPUT → MAPS → ENTITIES → SYMBOLS → RHYTHM →
DIALOGUES/DIALOGUE → HINTS/HINT → QUEST → SAVE → UI → SCENES →
PUZZLES → SELFTEST → RENDER → MAIN

절대 불변식:
1. CONFIG.W=360, CONFIG.H=640, CONFIG.TILE=32
2. setState를 통한 상태 전환과 상태 문자열 9개
3. 맵·오브젝트 ID, 충돌 배열, 스폰 위치
4. MQ01/MQ02, flags, 대사, 퍼즐 정답, 엔딩
5. C4/E4/G4, pitch, staffSlot, 주파수 공식
6. melodia_v01_save와 version 1
7. 터치 조이스틱, WASD/방향키, E/Q/Esc/Space/Enter
8. window.MelodiaDebug, body.dataset.gameState/mapId, test/seed/debug 파라미터
9. manifest, service worker, 오프라인 실행
10. 전체 index.html 재작성과 프레임워크·WebGL 마이그레이션 금지

표시 캐릭터는 커질 수 있지만 논리 충돌 박스와 발 좌표는 유지한다.
렌더 함수는 상태를 변경하지 않는다.
새 에셋은 직접 제작 또는 권리가 확인된 것만 사용하고 ASSET_LICENSES.md에 기록한다.

작업 규칙:
- 먼저 git status와 현재 파일을 읽고 사용자 변경을 보존한다.
- 수정 전 현재 구조와 예상 변경 파일을 보고한다.
- 한 Step 범위만 수정한다.
- apply_patch 방식의 최소 diff를 선호한다.
- 각 Step 후 테스트 표와 변경 파일을 보고한다.
- 테스트 실패 시 다음 Step으로 넘어가지 않는다.
- 자동 push·배포하지 않는다.

지금은 코드를 수정하지 말고 다음을 보고하라.
1. 저장소 구조 요약
2. 불변식 복창
3. 현재 Step
4. 변경 예정 파일
5. 위험 요소
6. 실행할 테스트
~~~

**Prompt 0 통과 기준:** AI가 “단일 Canvas 2D 증분 리마스터, 로직·저장·퍼즐 보존, IP 에셋 복제 금지”를 명확히 확인해야 한다.

---

## Step 1 — 안전 준비, 저장 결함 수정, 기준선 테스트

~~~text
[멜로디아 UI 리마스터 — Step 1/12: 안전 기준선]

이번 단계의 목적은 시각 변경 전에 저장과 테스트 안전망을 완성하는 것이다.
아직 아트 스타일은 바꾸지 않는다.

1. git status, 현재 branch, HEAD를 보고한다.
2. 사용자 변경을 삭제·덮어쓰기 하지 않는다.
3. 가능하면 ui/melodia-diorama-remaster 로컬 브랜치를 만든다.
4. 기존 npm 스크립트와 Playwright 설정을 확인한다.
5. 기존 15개 E2E와 22개 SELFTEST 목록을 기준선으로 기록한다.

필수 결함 수정:
- 타이틀의 소리·진동 변경이 진행 저장 snapshot을 쓰지 않게 한다.
- 진행 키 melodia_v01_save와 version 1은 유지한다.
- 별도 UI 설정 키를 도입하거나, 기존 진행 JSON을 설정 필드만 안전하게 patch하는 방식 중
  데이터 손상 가능성이 가장 낮은 방식을 선택한다.
- 저장 없음 상태의 소리 토글이 이어하기를 활성화하면 안 된다.
- 기존 save의 soundOn/hapticsOn을 하위 호환으로 읽는다.
- 진행 clear와 설정 clear 정책을 코드와 UI 문구에 일치시킨다.

테스트 구조 개선:
- UI.buttons에서 버튼 ID의 현재 사각형을 읽어 중심을 탭하는 tapButton(page, id) 헬퍼를 추가한다.
- 새 테스트가 화면 magic coordinate에 의존하지 않게 한다.
- 기존 테스트 ID와 의미는 유지한다.

신규 테스트:
SV-01 기존 저장 주입 후 타이틀 sound 토글 시 quests/flags/symbols/codex/
scoreParts/playerPosition 보존
SV-02 저장 없음에서 sound 토글 후 hasSave=false
SV-03 저장된 음소거가 타이틀 첫 프레임부터 반영
SV-04 이어하기 후 맵/좌표/퀘스트 복원
SV-05 저장 초기화 정책 검증

기준 스크린샷 목록:
- 저장 없는 Title
- 저장 있는 Title
- village Explore
- Dialogue
- SymbolSelect pick
- SymbolSelect target
- Pause main
- Codex grid/detail
- Save confirm
- crow puzzle
- staff bridge

금지:
- UI 색, 패널, 월드 스타일 변경
- save version 증가
- 맵·퍼즐·대사 변경
- 전체 index.html 재작성

완료 보고:
1. 발견한 기존 실패와 신규 실패를 구분
2. 수정 파일
3. 저장 무결성 테스트 표
4. 기존 테스트 결과
5. 롤백 방법
6. 모두 통과할 때만 “Step 1 완료”
~~~

---

## Step 2 — DIORAMA_THEME와 공통 Canvas 프리미티브

~~~text
[멜로디아 UI 리마스터 — Step 2/12: 디자인 토큰과 렌더 프리미티브]

목표:
게임 로직을 바꾸지 않고 하드코딩된 UI 스타일을 점진적으로 토큰화한다.

구현:
1. CONFIG 인근에 DIORAMA_THEME를 추가한다.
2. Ink #27313B, Paper #FFF3D6, PaperRaised #FFF9E8, Indigo #3C4F76,
   Mint #58B7A0, Coral #F06F61, Brass #D9A441, Sky #74C9D6를 사용한다.
3. radius, stroke, spacing, typography, touch target, motion 토큰을 추가한다.
4. drawToyPanel, drawMusicScrollPanel, drawRaisedButton, drawInsetSlot,
   drawContactShadow, drawFocusRing, drawBadge, drawIconButton,
   drawObjectiveCard, drawProgressPips, withImageSmoothing을 구현한다.
5. gradient, Path2D, 종이 패턴은 초기화 또는 resize 시 캐시한다.
6. 시각 좌표와 UI.button 히트 좌표를 같은 레이아웃 객체에서 파생한다.
7. 우선 drawBoot와 drawButton 일부에만 적용하여 구조를 검증한다.

규칙:
- 렌더 함수는 DATA, flags, quests, gameState를 변경하지 않는다.
- UI 프리미티브는 ctx.save/restore로 상태를 복원한다.
- 색만으로 disabled/success/error를 구분하지 않는다.
- 외부 CDN 폰트를 추가하지 않는다.
- 본문은 시스템 한글 폴백으로도 정상 표시한다.
- Nintendo UI 프레임이나 아이콘 실루엣을 만들지 않는다.

테스트:
- 기존 기능 테스트 전부
- 버튼 hit rect와 시각 rect 일치
- disabled 버튼 명도·윤곽·아이콘 구분
- 360×640 Boot 스냅샷
- reduced motion에서 장식 위치 변화 없음

완료 보고:
변경 프리미티브 API, 적용 화면, 성능 영향, 테스트 결과를 표로 보고하라.
~~~

---

## Step 3 — Boot, Title, 회전 안내 리마스터

~~~text
[멜로디아 UI 리마스터 — Step 3/12: Boot와 Title]

목표:
첫 화면을 독창적인 “태엽식 음악상자 극장”으로 바꾼다.

Boot:
- Paper/Indigo/Brass를 사용한 간결한 오르골 로딩 인상
- reduced motion은 페이드만 사용
- 로딩 에셋 실패는 DEBUG에서만 표시

Title:
- village의 일부를 논리와 분리된 정적 미니어처 무대로 표현
- 오선 두루마리 또는 황동 명판 형태의 멜로디아 제목
- 새로 시작, 이어하기, sound 버튼 ID와 동작 보존
- 이어하기 없음은 잠금 아이콘+문구로 표시
- 저장 덮어쓰기 확인창 보존
- 개발용 자료 출처 문구는 플레이 화면에서 제거
- Step 1의 안전한 settings 저장 경로만 사용

회전 안내:
- 세로 화면으로 돌려야 하는 이유와 앱 이름을 명확히 표시
- 320px 폭에서도 잘림 없음
- 장식은 원작 문장이나 캐릭터 없이 음악상자 톱니·음표만 사용

CSS:
- #game의 image-rendering은 신규 부드러운 디오라마 에셋에 맞게 auto를 기본 검토한다.
- Canvas 논리 해상도와 DPR 코드는 유지한다.
- body는 100dvh와 safe-area를 보강한다.

검증:
- 저장 없음/있음 Title
- new/continue/sound
- sound 토글 저장 무결성
- 320×568, 360×640, 390×844
- portrait/landscape rotate overlay
- reduced motion
- 콘솔 오류 0

금지:
- 원작 타이틀 로고·섬·산·알·캐릭터 구도 재현
- 기능 없는 하트·화폐 장식
~~~

---

## Step 4 — 월드 렌더를 2.5D 음악상자 디오라마로 변환

~~~text
[멜로디아 UI 리마스터 — Step 4/12: 월드 2.5D 디오라마]

목표:
실제 3D나 WebGL 없이 drawTile, drawMapDetails, drawObject, drawPlayer의
표현만 바꾸어 수제 미니어처 세계의 깊이감을 만든다.

공통:
- 좌측 상단 키라이트
- 남쪽·동쪽 3~6px 타일 측면
- 오브젝트 아래 타원형 접촉 그림자
- 발 기준 Y 정렬
- 월드만 부드럽게, UI는 선명하게
- 화면 가장자리의 매우 약한 비네트
- 매 프레임 blur/filter 금지

결정론:
- mapId+x+y 해시로 꽃·돌·잎 위치를 고정한다.
- 렌더 중 Math.random 사용 금지
- ?test=1&seed=42에서 스크린샷이 반복 가능해야 한다.
- 장식용 시간은 visualNow 같은 렌더 전용 헬퍼로 통제한다.

맵 순서:
1. village: 펠트 지면, 비스킷 길, 종꽃, 황동 탑
2. tower: 짙은 목재, 황동 톱니, 악보 종이, 스포트라이트
3. forest: 둥근 펠트 나무, 청록 유리 물, 오선 다리, 안개 인상

캐릭터:
- 플레이어 충돌 20×24 유지, 표시만 약 28×34로 확대 가능
- 발 중심 고정
- 파란 스카프·기호 가방 등 멜로디아 고유 요소 사용
- NPC는 역할을 색 하나가 아니라 실루엣+소품+라벨로 구분
- 초록 모자 영웅이나 원작 캐릭터 비율 금지

오브젝트:
- 높은음자리표, 음표, 문, 종, 바위, 상자, 오선 슬롯의 기능 가독성을 우선
- 외형이 달라져도 objectRect와 상호작용 거리는 유지
- 접촉 그림자와 선택 하이라이트를 분리

테스트:
- 3개 맵 도달성 SELFTEST
- 플레이어 이동/충돌/포털
- 상호작용 거리
- push rock
- 목표 오브젝트가 장식에 가려지지 않음
- 60fps 목표, 45fps 미만 지속 없음
- village/tower/forest 시각 스냅샷

산출:
맵별 전후 비교, 변경 함수, 논리 좌표 무변경 증거, 성능 수치를 보고하라.
~~~

---

## Step 5 — 탐험 HUD, 조이스틱, 상호작용 UI

~~~text
[멜로디아 UI 리마스터 — Step 5/12: 탐험 HUD와 입력]

목표:
플레이 영역 중앙을 비우고, 음악교육 기능만 남긴 최소 HUD를 만든다.

레이아웃:
- 좌상단: 지역명+현재 목표 악보 리본
- 우상단: soundHud, pause
- 우하단: interact, palette
- 좌하단: 플로팅 joystick
- 상단 임시 알림은 objective 아래 notice stack에 배치

구현:
1. active quest를 최대 2행으로 래핑한다.
2. 목표가 없으면 “자유 탐험”을 표시한다.
3. soundHud/pause 최소 44×44, 기존 ID 유지
4. interact는 동사+대상명 표시
5. palette는 음악기호 가방 모티프
6. 조이스틱 반경 48, 데드존 8과 이동 수학 유지
7. 첫 플레이에는 휴면 안내 링을 제한적으로 표시
8. keyboard/touch의 최근 입력 방식에 따라 E/Q 힌트를 선택적으로 표시
9. 버튼 시각 rect와 hit rect를 단일 layout 값으로 생성

UI 충돌 방지:
- objective, toast, puzzle feedback, target banner의 우선순위를 정의한다.
- 동시에 나타나면 덮지 말고 수직 stack 또는 상태별 숨김을 사용한다.
- transition과 modal의 z-order를 명시한다.

금지:
- 하트, 루피, 체력, 무기 슬롯 추가
- 이동 속도와 상호작용 거리 변경
- UI를 위해 월드 좌표 변경

테스트:
- 모든 verbFor 타입
- pause/sound/palette/interact
- touch target 44×44 이상
- 긴 MQ01/MQ02 objective
- 조이스틱 터치와 WASD
- 5개 세로 뷰포트
- HUD가 주요 퍼즐 목표를 가리지 않음
~~~

---

## Step 6 — 대화, 토스트, 힌트, 확인창

~~~text
[멜로디아 UI 리마스터 — Step 6/12: 대화와 알림]

대화창:
- 콘서트 프로그램 리본+악보 종이 프레임
- 화자명, 고유 메달, 화자 색
- 본문 17px 이상, 최대 4행
- 한글 word-break와 줄바꿈 안정화
- 타입라이터 로직과 탭 진행 보존
- 다음/닫기 상태를 형태+텍스트로 구분

토스트/힌트:
- 길이에 따라 폭과 높이를 계산
- 2행 이상 안전 래핑
- objective/puzzle/target banner와 겹치지 않는 notice stack
- success/save/warning/error에 자체 아이콘+문구
- reduced motion에서는 단순 페이드
- 동일 힌트가 중복 쌓이지 않게 한다.

확인창:
- drawConfirmPanel을 drawToyPanel 기반으로 교체
- 위험 버튼은 Coral+경고 아이콘+명확한 동사
- 취소가 기본 안전 선택
- 배경 입력 차단

접근성 준비:
- 완성 대사를 한 번만 A11Y live region에 보낼 수 있는 hook 추가
- 일반 toast는 polite
- 치명 오류만 assertive

테스트:
- 모든 화자 스타일
- 긴 한글 4행
- 첫 탭 완성/다음 탭 진행
- 대화 로그 저장
- 힌트 HN-01~03
- 저장 확인 취소/실행
- reduced motion
- 360×640 시각 스냅샷
~~~

---

## Step 7 — 기호 팔레트와 부착 대상 모드

~~~text
[멜로디아 UI 리마스터 — Step 7/12: 기호 가방과 부착 모드]

목표:
기호 선택을 “악기 케이스 속 악보 카드”로 재설계하고 월드 부착 가독성을 높인다.

pick 모드:
- 기호 그림, 이름, effect를 카드에 표시
- 현재 이름 앞의 잘못된 “/” 제거
- 카드 터치 영역 48px 이상
- 기호 수 증가에 대비한 scroll 또는 2열 구조
- slot이 주어지면 가능한 note만 표시
- closePalette와 빈 곳 취소 동작 유지

target 모드:
- 월드를 어둡게 덮거나 중앙 카드로 가리지 않는다.
- 선택 기호+설명+취소 버튼을 상단 safe-zone에 표시한다.
- 유효 대상은 청록 음파 링+점선+포인터로 강조한다.
- 화면 밖 대상 방향 포인터를 유지한다.
- 잘못된 대상을 탭하면 상태를 설명하고 안전하게 취소 또는 유지한다.
- tryAttachToObject와 flag 로직은 변경하지 않는다.

도감·기호 이미지:
- 기존 권리 상태를 확인한다.
- 신규 음표 아이콘은 독자 도자기/황동 메달로 제작한다.
- image smoothing은 함수 범위 안에서만 바꾸고 복원한다.

테스트:
- Q/팔레트 버튼
- pick→target→attach
- cancelAttach/closePalette/배경 취소
- 높은음자리표 탑 문 부착
- 오선 slot 필터와 도·미·솔 배치
- invalid target
- 화면 밖 포인터
- 기존 MQ01/MQ02 진행 불변
~~~

---

## Step 8 — 컷신, 획득 카드, Pause, 도감, 기록, 저장

~~~text
[멜로디아 UI 리마스터 — Step 8/12: 서브스크린]

시각 콘셉트:
“접힌 악보 여행 수첩”과 “악보대 위에서 조립되는 기호 메달”

Cutscene:
- cutscene/codex/codexList 분기 유지
- Skip, 이전, 다음, 닫기 ID와 기능 유지
- 메달 조립 보상 연출은 280ms 안팎
- reduced motion에서는 scale/bounce 없이 fade
- 기호명, 이론, effect 정보 계층 분리

Pause:
- resume, codexList, dialogueLog, toggleSound, toggleHaptics,
  saveManage, title 보존
- disabled는 색+잠금+설명으로 표시
- 닫기와 Esc 복귀 보존
- 모달 뒤 월드 입력 차단

도감:
- 빈 도감 toast
- grid의 발견/미발견 상태
- detail에서 이름/theory/effect
- 이미지 smoothing과 비율 유지
- 향후 기호 증가를 고려한 데이터 기반 목록

대화 기록:
- 화자명+메달+색
- drag scroll과 키보드 스크롤
- 빈 기록 상태

저장 관리:
- resetSave 2단계 확인
- Step 1의 진행/설정 초기화 정책과 문구 일치

테스트:
- CX-01~03
- 빈/부분/완성 도감
- 기록 없음/많음
- 모든 Pause 하위 화면의 back
- sound/haptics 유지
- confirm 취소/실행
- 360×640 시각 스냅샷 각각
~~~

---

## Step 9 — 퍼즐 피드백, 마이크로 모션, UI 사운드

~~~text
[멜로디아 UI 리마스터 — Step 9/12: 학습 피드백과 주스]

까마귀 청음:
- 현재 재생 음과 대응 종 발광 동기
- 진행 pip, 계이름, 재생/입력/정답/오답 상태
- 무음에서도 순서와 입력 상태를 확인 가능

오선 다리:
- 도·미·솔 진행 pip와 다음 위치 포인터
- 실패 시 “낮은 음부터” 안내
- 색 외에 아이콘·윤곽·텍스트 사용

상호작용/보상:
- 버튼 press 120ms
- 패널 180ms
- 보상 280ms
- 획득 sparkle 수 상한
- tower door와 staff door의 기능적 상태가 명확해야 함

UI 사운드:
- 현재 Web Audio 구조 안에서 자체 합성한다.
- confirm은 짧은 글로켄/칼림바 인상, cancel은 낮은 우드블록 인상
- error는 불협 2음이되 기존 퍼즐 음높이를 혼동시키지 않는다.
- 원작 효과음이나 유사 멜로디를 사용하지 않는다.
- soundOff에서는 완전 무음

햅틱:
- 기존 hapticsOn과 실패 무해 원칙 유지
- 중요한 성공/오류만 제한적으로 사용

reduced motion:
- 흔들림, bob, pulse, scale spring 제거
- 80~120ms opacity 변화만 허용
- 정보는 모션 없이도 전달

테스트:
- bird 재생/입력/실패/성공
- bridge 배치/순서 실패/성공
- soundOff 완주
- reduced motion 완주
- particle 상한
- 퍼즐 flags와 정답 불변
~~~

---

## Step 10 — 반응형과 접근성 레이어

~~~text
[멜로디아 UI 리마스터 — Step 10/12: 반응형·접근성]

반응형:
- Canvas 논리 360×640 유지
- CSS 스케일과 screenToGame 유지
- 100dvh, visualViewport, safe-area
- 320×568, 360×640, 390×844, 412×915, 768×1024 검사
- 세로 우선과 가로 회전 안내 유지
- user-scalable=no 제거 가능성을 검토하되 좌표·레이아웃 영향 테스트

의미론적 DOM 레이어:
1. canvas wrapper 위에 #a11yControls를 추가한다.
2. UI.buttons를 버튼 ID, label, enabled 상태로 동기화한다.
3. 포인터 입력을 가로채지 않으면서 Tab 포커스가 가능하게 한다.
4. focus-visible일 때 Canvas 버튼 위치에 고대비 포커스 링을 보여준다.
5. Enter/Space가 executeButton과 같은 단일 경로를 사용한다.
6. Pause/Cutscene/Confirm은 role=dialog와 aria-modal 상태를 동기화한다.
7. toast, 완성 대사, 지역, 현재 목표를 각각 적절한 live region에 제공한다.
8. 타입라이터를 한 글자씩 읽지 않는다.
9. 메뉴를 닫으면 이전 포커스로 복귀한다.

가독성:
- 본문 16px 이상 권장, 대화 17px
- 텍스트 WCAG AA 목표
- 비텍스트 UI 3:1 목표
- 색+형태+텍스트로 상태 표현
- 한글 word-break: keep-all을 적절히 사용

입력:
- 기존 WASD/방향키/E/Q/Esc/Space/Enter 유지
- Tab으로 Title/Pause/Confirm/Palette 조작 가능
- 포커스가 조이스틱 이동을 방해하지 않게 한다.

테스트:
- keyboard-only 새 게임→Pause→도감→복귀
- screen reader용 상태 문자열
- focus trap/restore
- 모든 viewport
- 200% 브라우저 확대 검토
- reduced motion와 고대비
~~~

---

## Step 11 — 에셋, 성능, PWA, 앱 아이콘

~~~text
[멜로디아 UI 리마스터 — Step 11/12: 에셋·성능·PWA]

에셋 감사:
- CONFIG.assets, 실제 draw 사용, loadAssets, sw.js precache를 대조한다.
- 사용되지 않는 에셋은 원본 파일을 함부로 삭제하지 말고 런타임 선로딩 대상에서 분리한다.
- 약 672KB CMYK 1st&2nd Ending JPG의 실제 사용 여부를 확인한다.
- 런타임 이미지는 sRGB PNG/WebP로 최적화한다.
- .ai/.psd/.eps를 런타임에서 참조하지 않는다.

권장 폴더:
- assets/ui
- assets/world
- assets/characters
- assets/effects
- assets/fonts

예산:
- 초기 shell과 첫 화면 필수 에셋 합계 2MB 이하 목표
- 전체 리마스터 런타임 에셋 4MB 이하 목표
- 개별 UI 스프라이트 256KB 이하 권장
- 2배 해상도 원본을 사용하되 실제 표시 크기에 맞게 압축
- 외부 네트워크 요청 0

로딩:
- 화면/맵별 asset manifest
- 필수 에셋과 지연 로딩 에셋 분리
- 실패 시 기능 가능한 fallback glyph 유지
- 프레임 중 이미지 디코딩으로 멈추지 않게 한다.

성능:
- 반복 gradient/Path2D/text width/장식 위치 캐시
- 기존 월드 컬링 유지
- 매 프레임 ctx.filter blur 금지
- particle 상한
- 일반 플레이 60fps 목표, 45fps 미만 지속 없음
- 저사양 모드에서 비네트·추가 입자·동적 광택 축소

PWA:
- 신규 런타임 파일을 sw.js에 반영
- CACHE_NAME 갱신
- 이전 캐시 정리
- manifest theme_color/background_color를 새 톤으로 갱신
- name/display/orientation/icons 구조 유지
- 설치 후 오프라인 재실행

앱 아이콘:
- 현재 낮은 대비 아이콘을 독자적인 황동+Indigo 음악 문장으로 교체
- 192/512 모두 실제 축소 크기에서 인식성 검사
- Zelda 문장·방패·하트 실루엣 금지

권리:
- ASSET_LICENSES.md 생성
- 파일명, 제작 방식, 출처, 저작자, 라이선스, 확인일, 비고 기록
- 출처 불명 신규 에셋 0
~~~

---

## Step 12 — 전체 회귀, 시각 테스트, 출시 판정

~~~text
[멜로디아 UI 리마스터 — Step 12/12: 최종 검증과 출시]

기존 자동 테스트:
- npm run test:smoke
- npm run test:full
- npm run test:visual
- 가능하면 PLAYWRIGHT_BROWSER=webkit npm test
- ?selftest=1&test=1&seed=42 결과 pass 22, fail 0 이상

시각 회귀 고정 조건:
- viewport 360×640
- deviceScaleFactor 1
- ?test=1&seed=42
- prefers-reduced-motion: reduce
- 렌더 전용 시간 고정

필수 시각 스냅샷:
VIS-01 Boot
VIS-02 Title no save
VIS-03 Title with save
VIS-04 village Explore
VIS-05 tower Explore
VIS-06 forest Explore
VIS-07 Dialogue
VIS-08 SymbolSelect pick
VIS-09 SymbolSelect target
VIS-10 crow puzzle
VIS-11 staff bridge
VIS-12 Cutscene reward
VIS-13 Pause main
VIS-14 Codex grid
VIS-15 Codex detail
VIS-16 Dialogue log
VIS-17 Save confirm
VIS-18 rotate overlay

전체 사용자 여정:
1. 새 게임
2. 오프닝 컷신 건너뛰기
3. 템포 대화
4. 탑 문 조사
5. 피치 대화
6. 높은음자리표 획득
7. 팔레트 선택
8. 탑 문 부착
9. 탑 진입
10. 세계악보 조사
11. 숲 관문 개방
12. 도 획득
13. 까마귀 청음
14. 종 정답 입력
15. 미 획득
16. 바위 밀기
17. 솔 획득
18. 오선 슬롯 배치
19. 낮은 음→높은 음 진행
20. 오선 문 개방
21. 멜로디 파트 복원
22. 엔딩
23. 이어하기
24. 소리·진동 유지
25. 저장 초기화 취소/실행
26. PWA 오프라인 재실행

정량 완료 기준:
- 기존 E2E 전부 통과
- SELFTEST fail 0
- 콘솔 미처리 오류 0
- 기존 save 정상 로드
- 터치 44×44 이상
- 본문 대비 WCAG AA 목표
- 지정 5개 세로 화면에서 잘림 0
- keyboard-only 핵심 메뉴 조작 가능
- reduced motion에서 흔들림·부유·spring 0
- 출처 불명 신규 에셋 0
- 신규 체력·화폐·전투 시스템 0
- 일반 플레이 60fps 목표, 45fps 미만 지속 없음

최종 보고:
1. 변경 파일
2. 화면별 변경
3. 기능 보존 체크리스트
4. 실제 테스트 결과
5. 전후 스크린샷
6. 성능 측정
7. 접근성 결과
8. 에셋 출처·라이선스
9. 남은 위험
10. git revert 기반 롤백 방법

치명 또는 높음 문제가 1건이라도 있으면 출시 완료를 선언하지 않는다.
자동 push·프로덕션 배포는 사용자 승인 전 금지한다.
~~~

---

# PART 9. 테스트 매트릭스

## 9.1 기존 기능 회귀

| 영역 | 확인 |
|---|---|
| Boot/Title | 상태 진입, 새 게임, 이어하기 |
| 이동 | 터치, WASD, 방향키, 충돌 |
| 상호작용 | E, 상황 버튼, 모든 object type |
| 팔레트 | Q, pick, target, cancel |
| MQ01 | 높은음자리표 획득·부착·탑 진입 |
| MQ02 | 도·미·솔, 청음, 슬롯, 순서 |
| 도감 | 빈 상태, 목록, 상세 |
| 힌트 | 1차·2차, 이동 시 타이머 초기화 |
| 저장 | 자동저장, 이어하기, 설정, 초기화 |
| 오디오 | 언락, 음소거, BGM, UI SFX |
| 생명주기 | blur, visibilitychange, pagehide |
| PWA | manifest, precache, offline |

## 9.2 화면 크기

| 뷰포트 | 기대 |
|---:|---|
| 320×568 | 가장 작은 지원 폭, 텍스트 잘림 없음 |
| 360×640 | 기준 스냅샷 |
| 390×844 | 일반 스마트폰 |
| 412×915 | 대형 Android |
| 768×1024 | 태블릿 세로, 중앙 정렬·무대 배경 |

## 9.3 접근성

| 항목 | 기준 |
|---|---|
| 키보드 | Title/Pause/Confirm/Palette 주요 기능 |
| 포커스 | 보이는 고대비 focus-visible |
| 대화 | 완성 문장 한 번만 읽기 |
| 토스트 | 일반 polite, 오류만 assertive |
| 색 | 색상 외 형태·텍스트 병행 |
| 모션 | prefers-reduced-motion 준수 |
| 대비 | 텍스트 AA, UI 3:1 목표 |

---

# PART 10. 권장 커밋과 롤백

## 10.1 권장 로컬 커밋

~~~text
test(save): protect progress from title settings writes
test(ui): capture pre-remaster baseline
refactor(render): add diorama theme tokens and primitives
feat(title): remaster boot title and rotate guidance
feat(world): add original music-box diorama rendering
feat(hud): remaster exploration controls and objective HUD
feat(dialogue): remaster dialogue notifications and confirms
feat(symbols): remaster symbol case and attach targeting
feat(menu): remaster cutscenes codex pause and logs
feat(feedback): improve puzzle cues motion and ui audio
feat(a11y): add semantic controls and responsive safeguards
perf(canvas): optimize assets caches and decorative rendering
chore(pwa): refresh offline cache metadata and app icons
docs(assets): record asset sources and licenses
test(ui): add visual and end-to-end remaster coverage
~~~

## 10.2 롤백 규칙

- git reset --hard로 사용자 작업을 지우지 않는다.
- 문제가 생긴 Step의 커밋만 git revert한다.
- 사용자 변경과 리마스터 변경이 섞였으면 자동 되돌리기 전에 범위를 보고한다.
- 저장 스키마를 바꾸지 않았으므로 UI 커밋을 되돌려도 기존 진행이 열려야 한다.

---

# PART 11. 빠른 실행 코스

시간이 부족할 때도 Step 1은 생략하지 않는다.

## 최소 UI 리마스터

1. Step 1 저장 안전
2. Step 2 토큰·프리미티브
3. Step 3 Title
4. Step 5 HUD
5. Step 6 대화·알림
6. Step 7 팔레트
7. Step 8 Pause·도감
8. Step 12 회귀

## 완전 리마스터

Step 1부터 Step 12까지 모두 수행한다. 참고작과 비슷한 “디오라마 인상”은 Step 4의 월드 렌더가 포함되어야 충분히 느껴진다.

---

# PART 12. 최종 품질 체크리스트

## 독창성

- [ ] 앱 화면·변수·에셋명에 Nintendo/Zelda 고유 표현이 없다.
- [ ] 원작 캐릭터·아이콘·UI 프레임·음향을 복제하지 않았다.
- [ ] 멜로디아의 오르골·악보·황동·펠트 언어가 일관된다.
- [ ] 가짜 하트·화폐·전투 HUD가 없다.
- [ ] ASSET_LICENSES.md에 신규 에셋이 모두 기록되었다.

## 기능

- [ ] MQ01/MQ02 전체 완주 가능
- [ ] C4/E4/G4, pitch, staffSlot 불변
- [ ] 저장 key/version 불변
- [ ] 기존 저장 정상 복원
- [ ] 타이틀 설정 변경이 진행 저장을 훼손하지 않음
- [ ] 터치와 키보드 모두 정상
- [ ] PWA 오프라인 정상

## UI/UX

- [ ] 주요 터치 영역 44×44 이상
- [ ] 긴 한글 목표·대사 잘림 없음
- [ ] objective/toast/puzzle/target 안내 겹침 없음
- [ ] disabled/success/error가 색 외에도 구분됨
- [ ] 주요 오브젝트가 장식에 묻히지 않음
- [ ] 5개 세로 뷰포트 통과

## 접근성·성능

- [ ] focus-visible
- [ ] aria-live가 한 글자씩 읽지 않음
- [ ] reduced motion 준수
- [ ] 텍스트 AA 대비 목표
- [ ] 매 프레임 blur·Math.random 없음
- [ ] 초기 필수 에셋 2MB 이하 목표
- [ ] 콘솔 오류 0
- [ ] SELFTEST 22/22 이상
- [ ] E2E와 시각 회귀 통과

---

# 참고 링크

- [Music Sign Adventure Game 저장소](https://github.com/kimyounggaur/Music_Sign_Adventure_Game)
- [Nintendo 공식 Link’s Awakening 소개](https://zelda.nintendo.com/links-awakening/)
- [Nintendo 공식 Gameplay](https://zelda.nintendo.com/links-awakening/gameplay/)
- [Nintendo 그래픽 디렉터 인터뷰](https://zelda.nintendo.com/links-awakening/blog/director-yoshiki-haruhana/)
- [Nintendo 음악 작곡가 인터뷰](https://zelda.nintendo.com/links-awakening/blog/music-composer-ryo-nagamatsu/)

> 이 문서는 디자인·개발 위험을 낮추기 위한 제작 가이드이며 법률 의견은 아니다. 상업 배포 전에는 최종 화면, 브랜드명, 폰트, 이미지, 음향의 권리 상태를 별도로 검토한다.
