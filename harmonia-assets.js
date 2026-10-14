/* Atlas reader for the explicitly requested Harmonia asset study.
 * Construction is opt-in; production and previous previews never fetch the atlas.
 */
'use strict';
window.createHarmoniaAssetRenderer = function createHarmoniaAssetRenderer(ctx, url = 'assets/harmonia/atlas.json') {
  const started = performance.now();
  const pages = [];
  const state = { status: 'loading', error: null, pageCount: 0, frameCount: 0, decodedBytes: 0, loadMs: 0, drawCount: 0, mirroredDraws: 0, missing: [], observedFrames: [] };
  let manifest;
  const observed = new Set();
  const tintCache = new Map();
  function fail(error) {
    state.status = 'error'; state.error = String(error?.message || error);
    document.body.dataset.assetStatus = 'error';
    throw error;
  }
  const ready = (async () => {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Atlas request failed: ${response.status}`);
    manifest = await response.json();
    if (!manifest?.meta?.pages?.length || !manifest.frames) throw new Error('Invalid Harmonia atlas manifest');
    const base = new URL(url, document.baseURI);
    await Promise.all(manifest.meta.pages.map((file, index) => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { pages[index] = img; state.decodedBytes += img.naturalWidth * img.naturalHeight * 4; resolve(); };
      img.onerror = () => reject(new Error(`Atlas page failed: ${file}`));
      img.src = new URL(typeof file === 'string' ? file : file.file, base).href;
    })));
    for (const [id, item] of Object.entries(manifest.frames)) {
      const frame = item.frame, page = pages[item.page];
      if (!page || !frame || !item.logicalSize || !item.pivot || frame.w <= 0 || frame.h <= 0 || frame.x < 0 || frame.y < 0 || frame.x + frame.w > page.naturalWidth || frame.y + frame.h > page.naturalHeight) throw new Error(`Invalid atlas frame: ${id}`);
    }
    for (const [name, animation] of Object.entries(manifest.animations || {})) {
      const frames = Array.isArray(animation) ? animation : animation.frames;
      if (!frames?.length || frames.some(id => !manifest.frames[id])) throw new Error(`Invalid animation: ${name}`);
    }
    state.pageCount = pages.length; state.frameCount = Object.keys(manifest.frames).length;
    state.loadMs = Math.round(performance.now() - started); state.status = 'ready';
    document.body.dataset.assetStatus = 'ready';
    return api;
  })().catch(fail);
  // Keep rejection observable through ready without an unhandled-rejection event.
  ready.catch(() => {});
  function draw(id, x, y, options = {}) {
    if (state.status !== 'ready') return false;
    const item = manifest.frames[id];
    if (!item) { if (!state.missing.includes(id)) state.missing.push(id); return false; }
    const target = options.ctx || ctx;
    const frame = item.frame, logical = item.logicalSize;
    const scale = options.scale ?? 1, width = options.width ?? logical[0] * scale, height = options.height ?? logical[1] * scale;
    const pivot = options.pivot || item.pivot;
    target.save();
    if (options.alpha != null) target.globalAlpha *= options.alpha;
    target.imageSmoothingEnabled = true;
    target.translate(x, y);
    if (options.rotation) target.rotate(options.rotation);
    if (options.flipX) target.scale(-1, 1);
    let source=pages[item.page],sx=frame.x,sy=frame.y;
    if(options.tint){
      const key=`${id}:${options.tint}`;
      source=tintCache.get(key);
      if(!source){source=document.createElement('canvas');source.width=frame.w;source.height=frame.h;const paint=source.getContext('2d');paint.drawImage(pages[item.page],frame.x,frame.y,frame.w,frame.h,0,0,frame.w,frame.h);paint.globalCompositeOperation='source-in';paint.fillStyle=options.tint;paint.fillRect(0,0,frame.w,frame.h);tintCache.set(key,source);}
      sx=0;sy=0;
    }
    target.drawImage(source, sx, sy, frame.w, frame.h, -pivot[0] / logical[0] * width, -pivot[1] / logical[1] * height, width, height);
    target.restore();
    state.drawCount++;
    if(options.flipX)state.mirroredDraws++;
    if (!observed.has(id)) { observed.add(id); state.observedFrames.push(id); }
    return true;
  }
  function drawRect(id, x, y, width, height, options = {}) { return draw(id, x, y, { ...options, pivot: [0, 0], width, height }); }
  function animationFrame(name, seconds = 0, options = {}) {
    const animation = manifest?.animations?.[name];
    if (!animation) return null;
    const frames = Array.isArray(animation) ? animation : animation.frames;
    const fps = options.fps ?? animation.fps ?? 2;
    const raw = options.reducedMotion ? 0 : Math.max(0, Math.floor(seconds * fps));
    const index = options.loop === false ? Math.min(raw, frames.length - 1) : raw % frames.length;
    return frames[index];
  }
  function drawAnimation(name, x, y, seconds, options = {}) {
    const id = animationFrame(name, seconds, options);
    if (!id) { if (!state.missing.includes(name)) state.missing.push(name); return false; }
    return draw(id, x, y, options);
  }
  function requireFrames(ids) {
    const missing = ids.filter(id => !manifest?.frames[id]);
    if (missing.length) { state.missing.push(...missing); return fail(new Error(`Required frames missing: ${missing.join(', ')}`)); }
    return true;
  }
  const api = { ready, state, sceneState: {}, draw, drawRect, drawAnimation, animationFrame, requireFrames, get manifest() { return manifest; }, has: id => Boolean(manifest?.frames[id]) };
  return api;
};
