# 멜로디아 — 하모니아 대표 장면 비교본

## 범위와 기준

- 저장소: `kimyounggaur/Music_Sign_Adventure_Game`
- 기준 커밋: `42f53f518b969fa40178c4fcd8fda1000b756f93`
- 로컬 브랜치: `codex/representative-scene-remaster`
- 장면: 높은음자리표를 획득한 뒤, 하모니아 마을의 오르골 탑 문을 여는 순간.
- 기존 체크아웃을 변경하지 않고 빈 작업 폴더에 새로 복제했다. push, main 병합, Vercel 배포는 수행하지 않았다.
- 운영 사이트 HTML과 기준 커밋의 HTML을 줄바꿈 정규화 후 SHA-256으로 대조했다. 일치 여부 및 캡처 환경은 `artifacts/capture-report.json`에 기록된다.

## 실행

```powershell
npm ci
npx playwright install chromium
npm run build
npm run serve
```

`http://127.0.0.1:4173/comparison.html`을 연다.

- 기존 장면: `/index.html?preview=harmonia&art=original&seed=42`
- 개선 장면: `/index.html?preview=harmonia&art=remaster&seed=42`
- 기존 전체 게임: `/index.html`

데스크톱 비교는 두 게임을 나란히 표시하고, 모바일 비교 페이지는 전후 탭으로 전환한다. 각 게임 화면을 눌러 키보드 포커스를 준다. WASD/방향키 이동, Q 기호 가방, E 상호작용, Esc 일시정지. 모바일은 왼쪽 드래그로 이동하고 오른쪽 행동 버튼을 누른다.

탑 문 열기: 기호 가방 → 높은음자리표 → 빛나는 탑 문 → 열기. 원래 학습 문장, 퍼즐 판정, 기호 데이터, 퀘스트와 탑 내부 전환을 그대로 사용한다.

비교본은 매번 같은 상태로 시작하며, 원래 게임의 세이브와 설정 키를 읽거나 쓰지 않는다. 전후 비교본끼리도 키를 나눈다. 비교본에서는 서비스 워커를 등록하지 않는다.

## 구현

- Canvas 2D, 위에서 내려다보는 2D 시점, 32px 타일 및 기존 충돌 좌표를 유지한다.
- `scene-remaster.js`는 선택형 그리기 계층이다. 청록 기와·석재·황동 재질, 오선 창과 음악 장식, 원근감 있는 투영 그림자, 겹쳐진 나무와 수풀, 부드러운 햇빛을 코드로 그린다.
- 솔의 스카프·악보 가방·음표 머리핀, NPC의 의상과 실루엣을 같은 아트 방향으로 정리했다. 타사 에셋이나 캐릭터를 복제하지 않았다.
- 지면은 2배 해상도 오프스크린 Canvas에 한 번 캐시한다. 캐릭터·문·입자·UI만 매 프레임 갱신한다. 네트워크 이미지, 신규 폰트, 런타임 패키지는 추가하지 않았다.
- HUD에 현재 목표와 상호작용 대상을 표시한다. 버튼은 최소 44 논리 픽셀이다. 실제 기호 설명을 선택창 안에서 읽을 수 있다.
- 기존 카메라에 120 논리 픽셀의 표시 여백을 적용하며 화면→월드 좌표와 기호 부착 강조에도 같은 보정을 적용한다. 충돌·상호작용 거리·이동 속도는 그대로다.
- 긴 모바일 세로 화면은 그림을 늘이지 않고 논리 높이를 최대 800까지 확장한다. 조작판은 하단에 따라가고, 다른 맵으로 이동하면 기존 높이 640으로 돌아간다.
- 걷기, 호흡, 작은 빛 입자, 문 열림 반응을 사용한다. 동작 줄이기 설정에서는 이 장면의 장식 모션을 멈춘다.

## 변경 파일

| 파일 | 역할 |
|---|---|
| `index.html` | 선택형 렌더 연결, 동일 장면 시작 상태, 저장 키 분리, 대응 좌표와 모바일 크기 |
| `scene-remaster.js` | 원본 Canvas 아트, 마을 장면, HUD, 기호창, 대화창 |
| `comparison.html`, `comparison.css`, `comparison.js` | 반응형 전후 비교 페이지와 초기화 |
| `scripts/build.js`, `package.json` | 정적 JS·참조 검증 및 `dist/` 패키징 |
| `scripts/capture-comparison.js` | 재현 가능한 실제 브라우저 캡처와 프레임 계측 |
| `tests/e2e/20-harmonia-preview.spec.js` | 대표 장면 관련 브라우저 테스트 8개 |
| `sw.js` | 새 렌더 스크립트 포함 및 캐시 버전 갱신 |
| `.gitignore` | 재생성 가능한 빌드와 캡처 결과 제외 |

## 검증과 근거

```powershell
npm run build
npm test -- --workers=2
node scripts/capture-comparison.js --production
git diff --check
```

이 환경에서는 이미 설치된 Chromium에 맞춰 다음 환경 변수를 사용했다.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='C:\Users\USER\AppData\Local\ms-playwright'
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:4173'
```

- 빌드: 통과. 정적 웹 파일 7개와 기존 이미지 14개를 `dist/`에 생성.
- Playwright Chromium: 기존 16개 + 추가 8개, 총 24개 통과.
- 대표 장면 검증: 실제 터치 기호 선택·문 부착·탑 진입, 키보드 이동·충돌·입력 해제, 드래그 이동, 소리·일시정지, 기존 저장 보존, reduced motion, 320×568 및 390×844 화면, 모바일 비교 탭·재시작.
- 데스크톱 1440×1000 / DPR 2, 모바일 390×844 / DPR 2 및 터치 테스트 DPR 3. 오류 수와 프레임 시간은 캡처 JSON에 기록.
- 전용 Chromium 149 브라우저에서 수행했다. 사용자의 열린 탭은 조작하지 않았다. Codex 내장 브라우저는 Windows 실행 구성 오류로 시작되지 않아 사용하지 못했다.
- 성능 표본은 독립 Chromium의 180프레임에서 약 60fps, p95 약 16.8ms였다. 실제 휴대폰 GPU·Safari·저사양 장치의 성능을 의미하지 않는다.

## 스크린샷

모든 이미지는 실제 브라우저 캡처다. 모바일 비교 이미지는 원본 캡처 두 장을 나란히 배치한 것으로, 게임 픽셀을 생성형 이미지로 수정하지 않았다. 정지 비교를 위해 reduced motion을 사용했다.

- `artifacts/desktop-comparison.png`: 데스크톱 전후 비교 전체
- `artifacts/desktop-before.png`, `artifacts/desktop-after.png`: 동일 장면 개별 이미지
- `artifacts/mobile-comparison.png`: 390×844 모바일 전후 비교
- `artifacts/mobile-before.png`, `artifacts/mobile-after.png`: 모바일 개별 이미지
- `artifacts/mobile-symbol-palette.png`: 실제 학습 문장이 표시된 기호창
- `artifacts/mobile-comparison-page.png`: 모바일 비교 페이지
- `artifacts/production-same-scene.png`: 운영 사이트의 동일 상태 장면
- `artifacts/capture-report.json`: 브라우저·화면 크기·오류·성능·운영 기준 일치 근거

최종 캡처는 `http://127.0.0.1:4173/dist`의 빌드 산출물에서 수행했다. 요청된 이미지 9장의 Library 저장이 모두 성공했다. 정확한 파일명·`library_file_id`·버전·로컬 경로 매핑은 `artifacts/library-files.json`에 있다. Windows Python이 파일 확장 속성 기록을 지원하지 않아 공식 메타데이터 도우미의 로컬 연동 기록 단계만 실패했으며, 반환된 정보는 이 JSON에 보존했다. 이미지 업로드와 Library 파일 생성은 성공 상태로 확인했다.

## 한계와 다음 아트 제작 단계

이번 결과는 대표 장면을 판단하는 코드 기반 아트 비교본이다. 숲·탑 내부·타이틀·일시정지·획득 연출 전체를 새로 만들지 않았다. 세계 전체의 아트 일관성은 후속 적용 범위다. 모바일 실기기, iOS Safari, 장시간 배터리·발열, 완전한 스크린리더 접근성은 검증하지 않았다.

상용 게임의 풍부한 애니메이션 수준을 보장하지 않는다. 기존 엔진에서도 레이어 구성, 소재 대비, 그림자, 목표·조작 UI, 간단한 반응 애니메이션은 구현할 수 있다. 손으로 다듬은 표정, squash/stretch, 방향별 옷자락·머리카락, 특수 연출과 다양한 배경에는 별도의 고품질 에셋 제작과 반복 검수가 필요하다.

최소 아트 팩 제안:

| 에셋 | 최소 제작 범위 | 런타임 포맷 |
|---|---|---|
| 솔 | 4방향 대기·걷기, 상호작용·기호 획득 포즈 | 투명 PNG/WebP 스프라이트 시트 + 프레임 JSON |
| 클레프 | 대기·말하기·반응 | 투명 PNG/WebP 시트 |
| 탑 | 몸체·지붕·전경 장식·문 닫힘/반열림/열림 | 분리된 PNG/WebP 또는 SVG를 Canvas용 이미지로 캐시 |
| 지형 | 잔디, 길 중앙·경계·모서리, 석재 | 타일 아틀라스 |
| 식생 | 나무 3종, 수풀 3종, 꽃·풀 군집, 그림자 | 투명 아틀라스 |
| UI·효과 | 일관된 아이콘, 기호 부착 빛·작은 반응 효과 | SVG 아이콘 및 PNG/WebP 효과 시트 |

레이어 원본과 제작 규칙은 별도 보관하고, 내보낼 때 발 위치·원점·스케일·충돌용 발자국을 통일한다. 게임의 기호 표기와 학습 문장은 기존 데이터에서 공급한다.
