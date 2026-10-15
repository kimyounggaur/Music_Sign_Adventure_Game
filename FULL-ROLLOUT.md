# Melodia full artwork rollout

The approved Harmonia art direction now runs by default at `/index.html`.
It covers all three implemented maps (village, tower interior, forest including
the staff bridge and waterfall), the title, dialogue, acquisition, inventory,
codex and ending presentation. The canyon mentioned by the ending is still a
future chapter; this release does not invent additional gameplay.

## Implementation

- `adventure-art.js`: original Canvas terrain and props matching the 109 approved
  atlas assets. The tower has tiled floors, a woven runner, windows, columns and
  a score lectern. The forest has river banks, waterfall, bell stands, crow,
  chest, rock, staff slots and gates. Static terrain is cached per map.
- `scene-remaster.js`: shared characters, feet-based sorting, contextual HUD,
  map names, objectives, palette and dialogue. Existing comparison URLs remain.
- `game-accessibility.js`: semantic keyboard buttons, visible focus, dialogue
  and theory text, live puzzle cues, minimum 44 CSS-pixel controls.
- `index.html`: production startup waits for the atlas; the camera accounts for
  the top HUD and lower controls. A canceled pointer does not activate a button.
- `sw.js`: caches the complete new renderer and atlas for offline use, refreshes
  navigation, and removes only obsolete Melodia caches.
- `vercel.json`: publishes the validated `dist` bundle to the existing project.
  The existing production workflow retains its test gate and uses Vercel 64.0.2.
  Credentials remain in the existing CI environment; none are created or stored.
- Removed the unused `http-server` dependency. The local server uses Node built-ins.

## Gameplay and music invariants

Map collision grids, player speed (116), collider (20 × 24), dialogue, quests,
source symbol artwork, pitches and the original save/settings keys are retained.
The representative comparison uses its own save keys as before. Do, mi and sol
are drawn as equal quarter-note shapes at their actual staff positions: ledger
below, first line and second line. Pitch is not represented by different flag
counts. The source G-clef alpha shape is preserved. The bird's currently sounding
note is also available as text; wrong notes and wrong bridge order remain rejected.

## Run and verify

```sh
npm ci
npm run assets:validate
npm run build
npm run serve:dist
```

Open `http://127.0.0.1:4173/index.html`. Run `npm run test:full` for Chromium.
Set `PLAYWRIGHT_BROWSER=webkit` for the installed Playwright WebKit engine.
`PLAYWRIGHT_BASE_URL` selects an existing local or deployed server.

The suite includes desktop and touch play from the prologue through ending,
post-ending bridge traversal, golden-note collection, save restoration, invalid
staff placement, wrong bridge order, movement/collision, all directional sprite
frames, atlas failures, offline Chromium, small/tall phones and keyboard controls.
Long-distance travel in story tests uses deterministic player positioning;
interactions, puzzles, movement/collision and bridge crossing use actual inputs.

`node scripts/capture-rollout.js` captures desktop and mobile scenes.
`node scripts/measure-rollout.js` samples frame timing for all maps. Both accept
`PLAYWRIGHT_BASE_URL` and save evidence beneath ignored `artifacts/full-rollout`.

## Verification limits

Local release checks on 2026-10-14/15: Chromium 37/37 passed; WebKit desktop
and touch complete-story checks 2/2 passed; the asset validator passed 109
frames, 90 alpha checks and all four atlas pages. The final static build
contains 14 web files and 236 images. Final captures report no page errors
or missing atlas frames.

Two isolated Windows Chromium 149 measurements at 390 × 844, DPR 2, sampled
240 animation-frame intervals per map. Mean rates were 53.9–56.9 FPS in the
village, 60.0 in the tower and 59.8–60.0 in the forest. The village's first run
included one 250 ms pause; the repeat's maximum was 33.4 ms. The repeat's p95
was 33.2 ms in the village and at most 16.8 ms elsewhere. The four decoded
atlas pages use 64 MiB; all cached terrain adds approximately 27.6 MiB.
These are requestAnimationFrame timings, not CPU-only render timings or a
guarantee of low-end mobile performance. Raw results are retained in the
local release evidence.

The Windows Playwright WebKit build passed normal game execution, desktop/touch
story flow, keyboard and small-screen checks. Its forced offline page reload
reported an internal browser error. Offline behavior is confirmed in Chromium;
physical iPhone/Safari offline behavior has not been verified. Desktop headless
frame measurements are not physical-phone benchmarks. Semantic controls improve
accessibility but do not constitute a full WCAG or screen-reader conformance audit.

Previous production deployment for rollback reference:
`dpl_BQWQUQZNQAsVmghdXNbCUmurBm4H` (commit `42f53f5`).
