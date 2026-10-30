// Illustrated-explainer kit for explainroo: a storyboard of illustrations (or stock clips and
// archive photos) with slow camera moves and soft crossfades, a title card, a date/place tag,
// a big-number callout, and a short caption pill with the spoken word lit.
//
//   shots(s, SHOTS);             // first: the pictures and clips
//   grade(s);                    // a warm vignette, so text reads on any picture
//   titleCard(s, HOOK);          // kicker, title, one-line subtitle
//   tag(s, {...});               // small date / place chip, top left
//   stat(s, {...});              // one big number with a label (drawn, never asked of a picture model)
//   captions(s);                 // last: on top of everything
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = (p) => p * p * (3 - 2 * p);
const SANS = '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
const SERIF = '"Instrument Serif", "Noto Sans Devanagari", serif';
const GOLD = '#e8b95a';
const PAPER = '#fff8ec';
const FADE = 0.4; // crossfade between shots, in seconds

// zoom, pan x (fraction of the width), pan y (fraction of the height): start -> end
const MOTIONS = {
  push: { z: [1.0, 1.12], x: [0, 0], y: [0, 0] },
  pull: { z: [1.12, 1.0], x: [0, 0], y: [0, 0] },
  panLeft: { z: [1.12, 1.12], x: [0.04, -0.04], y: [0, 0] },
  panRight: { z: [1.12, 1.12], x: [-0.04, 0.04], y: [0, 0] },
  rise: { z: [1.12, 1.12], x: [0, 0], y: [0.03, -0.03] },
  still: { z: [1, 1], x: [0, 0], y: [0, 0] },
};

function wrap(ctx, text, maxWidth) {
  const lines = [''];
  for (const w of text.split(' ')) {
    const t = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t;
  }
  return lines;
}

// Finds the file for a shot: assets/<base>.mp4|mov|webm|m4v (a clip) or .png|jpg|jpeg|webp (a picture).
function find(s, base) {
  for (const ext of ['mp4', 'mov', 'webm', 'm4v']) if (s.engine.clips.has(`assets/${base}.${ext}`)) return { kind: 'clip', src: `assets/${base}.${ext}` };
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${base}.${ext}`)) return { kind: 'image', src: `assets/${base}.${ext}` };
  return null;
}

function still(s, src, motion, t0, t1, first) {
  const m = MOTIONS[motion] || MOTIONS.push;
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: FADE, outDur: FADE, sfx: false }, (ctx) => {
    const img = s.engine.image(src);
    const p = ease(clamp((s.t - t0) / Math.max(0.1, t1 - t0)));
    const sc = Math.max(s.W / img.naturalWidth, s.H / img.naturalHeight) * lerp(m.z[0], m.z[1], p);
    const w = img.naturalWidth * sc;
    const h = img.naturalHeight * sc;
    ctx.drawImage(img, s.cx - w / 2 + lerp(m.x[0], m.x[1], p) * s.W, s.cy - h / 2 + lerp(m.y[0], m.y[1], p) * s.H, w, h);
  });
}

// ---- Image depth: parallax camera moves --------------------------------------------------------
// A picture with a depth map (assets/shot01.depth.png, made by scripts/depth.mjs; white is near) moves in
// 3D: near things shift and grow more than far things. Without a depth map the move falls back to a flat one.
//   dz = extra zoom (dolly), t = sideways travel from -1 to 1 (both start -> end)
const PARALLAX = {
  parallax: { dz: [0, 0.05], t: [-0.6, 0.6], flat: 'push' },
  parallaxLeft: { dz: [0.03, 0.03], t: [1, -1], flat: 'panLeft' },
  parallaxRight: { dz: [0.03, 0.03], t: [-1, 1], flat: 'panRight' },
  parallaxIn: { dz: [0, 0.1], t: [-0.3, 0.3], flat: 'push' },
  parallaxOut: { dz: [0.1, 0], t: [0.3, -0.3], flat: 'pull' },
};
const PX_W = 540; // working width of the warp; the height follows the frame, then it is scaled up
const PX_BASE = 1.08; // always zoomed in a little, so the edges are never shown
const PX_SHIFT = 0.03; // sideways travel at full depth, as a fraction of the width
const pixelCache = new Map();

// The picture and its depth map, cover-fitted into the working size, as plain arrays.
function warpData(s, src, depthSrc, w, h) {
  const key = `${src}@${w}x${h}`;
  if (pixelCache.has(key)) return pixelCache.get(key);
  const read = (name) => {
    const img = s.engine.image(name);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    g.drawImage(img, (w - img.naturalWidth * k) / 2, (h - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
    return g.getImageData(0, 0, w, h).data;
  };
  const rgba = read(src);
  const dep = new Float32Array(w * h);
  const dd = read(depthSrc);
  for (let i = 0; i < w * h; i++) dep[i] = dd[i * 4] / 255;
  const data = { rgba, dep };
  pixelCache.set(key, data);
  return data;
}

function parallax(s, src, depthSrc, motion, t0, t1, first) {
  const m = PARALLAX[motion];
  const w = PX_W;
  const h = Math.round((PX_W * s.H) / s.W);
  const { rgba, dep } = warpData(s, src, depthSrc, w, h);
  const buf = document.createElement('canvas');
  buf.width = w;
  buf.height = h;
  const bg = buf.getContext('2d');
  const out = bg.createImageData(w, h);
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: FADE, outDur: FADE, sfx: false }, (ctx) => {
    const p = ease(clamp((s.t - t0) / Math.max(0.1, t1 - t0)));
    const dz = lerp(m.dz[0], m.dz[1], p);
    const travel = lerp(m.t[0], m.t[1], p) * PX_SHIFT * w;
    const cx = w / 2;
    const cy = h / 2;
    const o = out.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const d = dep[i];
        const zl = PX_BASE + dz * (0.3 + 1.4 * d); // near things grow more
        let sx = cx + (x - cx) / zl + travel * (d - 0.5) * 2; // near things shift more
        let sy = cy + (y - cy) / zl;
        sx = sx < 0 ? 0 : sx > w - 1.001 ? w - 1.001 : sx;
        sy = sy < 0 ? 0 : sy > h - 1.001 ? h - 1.001 : sy;
        const x0 = sx | 0;
        const y0 = sy | 0;
        const fx = sx - x0;
        const fy = sy - y0;
        const a = (y0 * w + x0) * 4;
        const b = a + 4;
        const c = a + w * 4;
        const e = c + 4;
        const w00 = (1 - fx) * (1 - fy);
        const w10 = fx * (1 - fy);
        const w01 = (1 - fx) * fy;
        const w11 = fx * fy;
        const k = i * 4;
        o[k] = rgba[a] * w00 + rgba[b] * w10 + rgba[c] * w01 + rgba[e] * w11;
        o[k + 1] = rgba[a + 1] * w00 + rgba[b + 1] * w10 + rgba[c + 1] * w01 + rgba[e + 1] * w11;
        o[k + 2] = rgba[a + 2] * w00 + rgba[b + 2] * w10 + rgba[c + 2] * w01 + rgba[e + 2] * w11;
        o[k + 3] = 255;
      }
    }
    bg.putImageData(out, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(buf, 0, 0, s.W, s.H);
  });
}

// What shows while a picture is missing: the scene number, its visual direction and its prompt.
function placeholder(s, shot, i, t0, t1, first) {
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.2, outDur: 0.2, sfx: false }, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, s.H);
    g.addColorStop(0, `hsl(${28 + (i * 9) % 20},38%,24%)`);
    g.addColorStop(1, 'hsl(24,45%,8%)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PAPER;
    ctx.font = `400 130px ${SERIF}`;
    ctx.fillText(`Scene ${String(shot.n ?? i + 1).padStart(2, '0')}`, s.cx, s.H * 0.5);
    ctx.font = `600 38px ${SANS}`;
    ctx.fillStyle = 'rgba(255,248,236,0.75)';
    wrap(ctx, shot.dir || shot.prompt || '', s.W * 0.78).slice(0, 9).forEach((l, k) => ctx.fillText(l, s.cx, s.H * 0.58 + k * 54));
    ctx.fillStyle = GOLD;
    ctx.font = `700 34px ${SANS}`;
    ctx.fillText(`placeholder: add assets/${shot.file} (.png or .mp4)`, s.cx, s.H * 0.9);
  });
}

// shots: [{ n, at: '#s1' or seconds, file: 'shot01', motion, prompt, dir, text }]. motion also takes the parallax moves (picture + depth map). Each shot runs until the next one starts.
export function shots(s, list) {
  list.forEach((shot, i) => {
    const first = i === 0;
    const t0 = first ? 0 : s.time(shot.at); // the first shot starts at frame 0, so the cover is a picture
    const t1 = i + 1 < list.length ? s.time(list[i + 1].at) + FADE : s.dur;
    const found = find(s, shot.file);
    if (!found) placeholder(s, shot, i, t0, t1, first);
    else if (found.kind === 'clip') {
      s.clip(found.src, { x: s.cx, y: s.cy, w: s.W, h: s.H, fit: 'cover', frame: 'none', shadow: false, radius: 0, at: t0, out: t1, enter: first ? 'none' : 'fade', dur: FADE, outDur: FADE, sfx: false, speed: shot.speed ?? 1, from: shot.from ?? 0 });
    } else if (PARALLAX[shot.motion]) {
      const depth = `assets/${shot.file}.depth.png`;
      if (s.engine.images.has(depth)) parallax(s, found.src, depth, shot.motion, t0, t1, first);
      else still(s, found.src, PARALLAX[shot.motion].flat, t0, t1, first); // no depth map yet: a flat move
    } else still(s, found.src, shot.motion, t0, t1, first);
  });
}

// A warm shade at the top and bottom keeps text readable on any picture.
export function grade(s) {
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const top = ctx.createLinearGradient(0, 0, 0, s.H * 0.34);
    top.addColorStop(0, 'rgba(18,10,4,0.55)');
    top.addColorStop(1, 'rgba(18,10,4,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, s.W, s.H * 0.34);
    const bot = ctx.createLinearGradient(0, s.H * 0.55, 0, s.H);
    bot.addColorStop(0, 'rgba(18,10,4,0)');
    bot.addColorStop(1, 'rgba(18,10,4,0.65)');
    ctx.fillStyle = bot;
    ctx.fillRect(0, s.H * 0.55, s.W, s.H * 0.45);
  });
}

function shadowed(ctx, text, x, y) {
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 4;
  ctx.fillText(text, x, y);
  ctx.shadowColor = 'transparent';
}

// Title card: a small gold kicker (date and place), a big serif title, a gold rule, a one-line subtitle.
// o: { kicker, title, sub, at, out, y, size }
export function titleCard(s, o) {
  s.draw({ at: o.at ?? 0.2, out: o.out, enter: 'fade', dur: 0.5, outDur: 0.4, sfx: false }, (ctx, life) => {
    const rise = (1 - ease(clamp(life.local / 0.8))) * 24;
    const size = o.size ?? 112;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let y = s.H * (o.y ?? 0.2) + rise;
    if (o.kicker) {
      ctx.font = `700 38px ${SANS}`;
      ctx.fillStyle = GOLD;
      shadowed(ctx, o.kicker.toUpperCase().split('').join(' '), s.cx, y);
      y += 86;
    }
    ctx.font = `400 ${size}px ${SERIF}`;
    ctx.fillStyle = PAPER;
    const lines = wrap(ctx, o.title, s.W * 0.84);
    for (const l of lines) { shadowed(ctx, l, s.cx, y); y += size * 1.02; }
    y += 14;
    ctx.fillStyle = GOLD;
    ctx.fillRect(s.cx - 70, y, 140 * ease(clamp(life.local / 0.9)), 5);
    if (o.sub) {
      y += 62;
      ctx.font = `600 40px ${SANS}`;
      ctx.fillStyle = 'rgba(255,248,236,0.88)';
      shadowed(ctx, o.sub, s.cx, y);
    }
  });
}

// A small chip, top left: a gold dot and a short text, for a date or a place.
// o: { text, at, out, y }
export function tag(s, o) {
  s.draw({ at: o.at, out: o.out, enter: 'fade', dur: 0.35, outDur: 0.3, sfx: false }, (ctx, life) => {
    const slide = (1 - ease(clamp(life.local / 0.45))) * -50;
    ctx.font = `700 38px ${SANS}`;
    const text = o.text.toUpperCase();
    const w = ctx.measureText(text).width + 100;
    const h = 78;
    const x = s.W * 0.06 + slide;
    const y = s.H * (o.y ?? 0.075);
    ctx.fillStyle = 'rgba(18,10,4,0.78)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 39);
    ctx.fill();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(x + 38, y + h / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAPER;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 66, y + h / 2 + 2);
  });
}

// One big number with a label under it. The value is counted up when it is a plain number
// (set count: false to show it as written). o: { value, label, at, out, y, count }
export function stat(s, o) {
  const plain = /^\d[\d,]*$/.test(o.value) && o.count !== false;
  const target = plain ? Number(o.value.replace(/,/g, '')) : 0;
  s.draw({ at: o.at, out: o.out, enter: 'fade', dur: 0.35, outDur: 0.3, sfx: false }, (ctx, life) => {
    const pop = 0.92 + 0.08 * ease(clamp(life.local / 0.4));
    const w = s.W * 0.8;
    const h = 430;
    ctx.save();
    ctx.translate(s.cx, s.H * (o.y ?? 0.4));
    ctx.scale(pop, pop);
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = 'rgba(18,10,4,0.94)';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 30);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(232,185,90,0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let value = o.value;
    if (plain) value = Math.round(target * ease(clamp(life.local / 1.1))).toLocaleString('en-US');
    let size = 190;
    ctx.font = `400 ${size}px ${SERIF}`;
    while (size > 80 && ctx.measureText(o.value).width > w - 80) { size -= 6; ctx.font = `400 ${size}px ${SERIF}`; }
    ctx.fillStyle = GOLD;
    ctx.fillText(value, 0, -45);
    ctx.fillStyle = PAPER;
    ctx.font = `600 44px ${SANS}`;
    wrap(ctx, o.label, w - 100).slice(0, 2).forEach((l, k) => ctx.fillText(l, 0, 95 + k * 58));
    ctx.restore();
  });
}

// The narration a short phrase at a time in a dark pill near the bottom; the word being spoken is gold.
export function captions(s, o = {}) {
  const maxChars = o.maxChars ?? 26;
  const maxWords = o.maxWords ?? 5;
  const chunks = [];
  let cur = null;
  for (const w of s.words || []) {
    const shown = o.keepPunctuation ? w.text : w.text.replace(/[.,;:!?"“”]+$/g, '').replace(/^["“”]+/g, '');
    if (cur && (cur.len + 1 + shown.length > maxChars || cur.w.length >= maxWords || /[.!?]$/.test(cur.raw))) { chunks.push(cur); cur = null; }
    if (!cur) cur = { w: [], len: 0, raw: '' };
    cur.w.push({ text: shown, start: w.start, end: w.end });
    cur.len += (cur.len ? 1 : 0) + shown.length;
    cur.raw = w.text;
  }
  if (cur) chunks.push(cur);
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const t = s.t;
    let c = null;
    for (let i = 0; i < chunks.length; i++) {
      const next = chunks[i + 1];
      const last = chunks[i].w[chunks[i].w.length - 1].end;
      if (t >= chunks[i].w[0].start - 0.04 && t < (next ? next.w[0].start - 0.04 : last + 0.5)) { c = chunks[i]; break; }
    }
    if (!c) return;
    let size = o.size ?? 54;
    ctx.font = `700 ${size}px ${SANS}`;
    while (size > 34 && ctx.measureText(c.w.map((w) => w.text).join(' ')).width > s.W * 0.86) { size -= 2; ctx.font = `700 ${size}px ${SANS}`; }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const space = ctx.measureText(' ').width;
    const widths = c.w.map((w) => ctx.measureText(w.text).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (c.w.length - 1);
    const y = s.H * (o.y ?? 0.8);
    const padX = 40;
    const h = size * 1.7;
    ctx.fillStyle = 'rgba(18,10,4,0.74)';
    ctx.beginPath();
    ctx.roundRect(s.cx - total / 2 - padX, y - h / 2, total + padX * 2, h, h / 2);
    ctx.fill();
    let x = s.cx - total / 2;
    c.w.forEach((w, i) => {
      ctx.fillStyle = t >= w.start - 0.02 && t < w.end + 0.1 ? GOLD : PAPER;
      ctx.fillText(w.text, x, y + 2);
      x += widths[i] + space;
    });
  });
}
