# 하모니아 대표 장면 — 에셋 통합 결과

2026-10-14 · 로컬 브랜치 `codex/representative-scene-remaster`

## 적용 결과

검증 ZIP의 실제 에셋 109개를 기존 대표 장면 비교본 `538ffcd` 위에 통합했다. 기본 전체 게임은 기존 렌더링을 유지하며, 새 그림은 `preview=harmonia&art=assets`에서만 로드한다. 전체 게임 일괄 적용, GitHub push, main 병합, 운영 배포는 하지 않았다.

솔의 방향별 대기·걷기와 상호작용, 클레프의 표정, 탑·문·지형·식생·소품·UI·효과가 같은 아틀라스를 사용한다. 캐릭터 발 피벗, 충돌 크기, 이동 속도, 퀘스트, 음악기호 학습 문장은 유지된다. 높은음자리표는 기존 원본 이미지의 알파 윤곽을 합성한다.

## 실행

저장소 폴더에서:

    npm ci
    npm run assets:validate
    npm run build
    npm run serve:dist

`http://127.0.0.1:4173/asset-review.html`을 연다. 이 세션에서 이미 실행 중인 빌드 검토 서버는 `http://127.0.0.1:4174/asset-review.html`이다.

- 비교 페이지: `/asset-review.html` — 최초 화면/이전 비교본 선택, 모바일 탭, 초기화.
- 새 에셋: `/index.html?preview=harmonia&art=assets&seed=42`
- 이전 비교본: `/index.html?preview=harmonia&art=remaster&seed=42`
- 최초 장면: `/index.html?preview=harmonia&art=original&seed=42`
- 전체 기존 게임: `/index.html`
- 에셋 원본 보기: `/style-sheet.html`

WASD/방향키 이동, Q 기호 가방, E 행동, Esc 일시정지. 모바일에서는 왼쪽 조작 영역을 드래그한다. 높은음자리표 선택 → 탑 문 누르기 → 열기 버튼 순서로 기존 탑에 진입할 수 있다.

## 입력 자료와 중복 방지

- 로컬 원본: `C:/Users/USER/Downloads/harmonia-assets-review-20261013.zip`
- 크기: 8,920,933바이트
- ZIP SHA-256: `F3D42340FB4901DE3638B93A745BD9A06B04A943DA132742F71885C1F54FE49D`
- 내부 `FILES-SHA256.json`의 502개 파일 모두 일치.
- 원래 Library 자료: `libfile_75c8ea8109a48191a0425668fd9f52ea`
- 재첨부 Library 자료: `libfile_30ec0c6c434481918e66c1ee51256132` — 정상 도구로 이름과 크기를 확인. 원격 바이트를 다시 내려받지 않았다.
- ZIP의 전체 패치는 `42f53f5` 기준이므로 현재 브랜치에 재적용하지 않았다. 별도 임시 폴더에서 기준 커밋을 재구성해 비교한 뒤 필요한 파일만 통합했다.
- 패치에서 재구성한 에셋과 ZIP 에셋은 내용이 같았다. 113개는 바이트 동일, 텍스트 112개는 Windows 줄바꿈만 달랐다. 검증 ZIP의 바이트를 사용하고 `.gitattributes`로 SVG/JSON의 LF를 고정해 아틀라스 해시가 체크아웃 후에도 유지되게 했다.

## 변경 파일

| 파일 | 목적 |
|---|---|
| `assets/harmonia/` | 109 SVG, 109 PNG, 4개 아틀라스, JSON 및 제작 규격 |
| `harmonia-assets.js` | 아틀라스 로더, 피벗 기반 그리기, 애니메이션, 로딩 오류 처리 |
| `scene-remaster.js` | 대표 장면에 에셋 연결, 발 기준 깊이 정렬, 기존 렌더러 보존 |
| `index.html` | 선택형 assets 모드, 원본 음악기호 합성, 준비 완료 상태, 독립 저장 키 |
| `asset-review.html/css/js`, `style-sheet.html` | 실제 플레이 가능한 전후 비교와 에셋 보기 |
| `scripts/asset-*.js`, `scripts/export-harmonia-assets.js`, `scripts/make-style-sheet.js` | 원본 제작·내보내기 재현 도구 |
| `scripts/validate-harmonia-assets.js`, `scripts/capture-assets.js` | 에셋 검사와 실제 빌드 캡처 |
| `scripts/build.js`, `scripts/serve-static.js`, `package.json`, `package-lock.json` | 빌드 포함, 로컬 검토 서버, 개발 의존성 |
| `tests/e2e/21-harmonia-assets.spec.js` | 에셋 통합 테스트 7개 |
| `.gitattributes` | 에셋 해시를 위한 줄바꿈·바이너리 규칙 |

패키지의 sharp 0.34.5는 설치 검사에서 보안 수정 필요 항목이 확인되어 개발 의존성만 0.35.5로 올렸다. 실행 시 배포되는 에셋 파일은 재생성하지 않았으며, 기존 의존성 버전은 그대로다. 기존 http-server의 전이 개발 의존성 qs에 moderate 항목 1개가 남아 있다. 새 로컬 검토 서버는 Node 내장 모듈을 사용한다.

## 이번 환경에서 수행한 검증

- `npm run assets:validate`: 109개, 솔 39프레임, 클레프 8프레임, 아틀라스 4장. 크기×4, 고정 피벗, 원본/PNG 해시, 표본 픽셀, 투명 경계, 슬롯 겹침 검사 통과.
- `npm run build`: 웹 파일 12개 + 이미지 236개. `git diff --check` 통과.
- 빌드 결과를 대상으로 Chromium 149.0.7827.55에서 Playwright **31/31 통과**, 35.8초, 건너뛰기·실패·flaky 0.
- 기존 24개 + 에셋 패키지 5개 + 검토 화면 전환/초기화·아틀라스 실패 처리 2개.
- 실제 터치 이벤트로 기호 선택 → 문 닫힘/반열림/열림 → 탑 진입 확인.
- 360×640, 390×844, 320×568에서 가독성 영역·44px 터치 타깃·가방·취소·포커스 이탈·동작 줄이기 검사.
- 솔 4방향 걷기 각 6프레임/8fps, 좌우 반전 0, 발 피벗 (32,56), 충돌 20×24, 이동 속도 116 유지.
- 원본 `SYMBOLS` 코드 동일. `01 Source`, `sw.js`, 이전 비교 화면, 기존 대표 장면 테스트 등 37개 파일의 변경 없음.
- 실제 `dist/`에서 데스크톱 1440×1020 DPR1, 모바일 390×844 DPR2, 소형 360×640 DPR2 캡처. 브라우저 오류 0, 누락 프레임 0.
- 단독 페이지 성능 표본: 180프레임 평균 59.0fps, p95 16.7ms. 디코딩된 아틀라스 메모리 64MiB.

사용자의 열린 브라우저 탭과 ChatGPT 프로젝트를 조작하지 않고 별도 헤드리스 Chromium을 사용했다. 실제 휴대폰·Safari 검증이나 전체 게임의 모든 맵 적용을 의미하지 않는다.

## 결과 파일

- `artifacts/harmonia-desktop-comparison.png`: 이전 비교본과 새 에셋의 실제 데스크톱 화면.
- `artifacts/harmonia-mobile-comparison.png`: 같은 장면의 모바일 전후.
- `artifacts/harmonia-mobile-original.png`, `harmonia-mobile-remaster.png`, `harmonia-mobile-assets.png`: 각각의 실제 모바일 캡처.
- `artifacts/harmonia-music-symbol.png`, `harmonia-door-open.png`, `harmonia-360x640.png`, `harmonia-style-sheet.png`: 학습 문장·문 열기·소형 화면·스타일 근거.
- `artifacts/asset-integration-playwright.json`, `asset-validation.json`, `asset-capture-report.json`, `asset-integration-provenance.json`: 이번 환경에서 얻은 검증 근거.

이전 `SCENE-STUDY.md`와 기존 결과 이미지는 앞 단계 기록으로 보존했다.
