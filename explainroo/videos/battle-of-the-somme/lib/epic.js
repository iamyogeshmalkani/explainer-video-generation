// Dark-history kit for explainroo: full-frame oil paintings with a slow push, a hit at every
// cut, drifting embers, a hook line at the start, and 2 to 3 word captions with the spoken
// word lit yellow. Made from a study of a 40-second "crusade" history short.
//
//   shots(s, SHOTS);        // first: the paintings (each cut has a thud and a small camera punch)
//   embers(s, SHOTS);       // drifting sparks and a fire flicker, per shot
//   vignette(s);            // dark edges and a dark foot for the captions
//   hook(s, 'The crusade destroyed by its own arrogance', { out: '#s2' });
//   captions(s);            // last: on top of everything
//
// A shot: { n, at: '#s1', file: 'shot01', motion, embers (0 to 1), hit (sound strength), prompt }.
// motion: push | pull | panLeft | panRight | rise | still
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const FONT = '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
const YELLOW = '#fff200';

const MOTIONS = {
  push: { z: [1.0, 1.15], x: [0, 0], y: [0, 0] },
  pull: { z: [1.15, 1.0], x: [0, 0], y: [0, 0] },
  panLeft: { z: [1.14, 1.14], x: [0.045, -0.045], y: [0, 0] },
  panRight: { z: [1.14, 1.14], x: [-0.045, 0.045], y: [0, 0] },
  rise: { z: [1.14, 1.14], x: [0, 0], y: [0.035, -0.035] },
  still: { z: [1.02, 1.04], x: [0, 0], y: [0, 0] },
};

function textLines(ctx, text, maxWidth) {
  const lines = [''];
  for (const w of text.split(' ')) {
    const t = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t;
  }
  return lines;
}

function find(s, base) {
  for (const ext of ['mp4', 'mov', 'webm', 'm4v']) if (s.engine.clips.has(`assets/${base}.${ext}`)) return { kind: 'clip', src: `assets/${base}.${ext}` };
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${base}.${ext}`)) return { kind: 'image', src: `assets/${base}.${ext}` };
  return null;
}

function placeholder(s, shot, i, t0, t1, first) {
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.12, outDur: 0.12, sfx: false }, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, s.H);
    g.addColorStop(0, `hsl(${(i * 37) % 360},30%,16%)`);
    g.addColorStop(1, 'hsl(25,45%,6%)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `800 ${s.W * 0.11}px ${FONT}`;
    ctx.fillText(`SHOT ${String(shot.n ?? i + 1).padStart(2, '0')}`, s.cx, s.H * 0.22);
    ctx.font = `600 ${s.W * 0.036}px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    textLines(ctx, shot.prompt || '', s.W * 0.78).slice(0, 10).forEach((l, k) => ctx.fillText(l, s.cx, s.H * 0.32 + k * s.W * 0.052));
    ctx.fillStyle = YELLOW;
    ctx.fillText(`placeholder: add assets/${shot.file} (.png or .mp4)`, s.cx, s.H * 0.88);
  });
}

// Every shot runs until the next one starts; the first starts at frame 0. Each cut gets a deep
// thud (and a short rising whoosh just before it) and the picture "punches" in a little.
export function shots(s, list, o = {}) {
  list.forEach((shot, i) => {
    const first = i === 0;
    const t0 = first ? 0 : s.time(shot.at);
    const t1 = i + 1 < list.length ? s.time(list[i + 1].at) + 0.12 : s.dur;
    const hit = shot.hit ?? 1;
    if (o.hits !== false && hit > 0) {
      s.sfx('thud', Math.max(0, t0 - 0.01), { gain: (first ? 1.6 : 1.5) * hit });
      if (!first) s.sfx('whoosh', Math.max(0, t0 - 0.16), { gain: 0.35 * hit, dur: 0.2 });
    }
    const found = find(s, shot.file);
    if (!found) { placeholder(s, shot, i, t0, t1, first); return; }
    if (found.kind === 'clip') {
      s.clip(found.src, { x: s.cx, y: s.cy, w: s.W, h: s.H, fit: 'cover', frame: 'none', shadow: false, radius: 0, at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.12, outDur: 0.12, sfx: false, speed: shot.speed ?? 1, from: shot.from ?? 0 });
      return;
    }
    const m = MOTIONS[shot.motion] || MOTIONS.push;
    s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.12, outDur: 0.12, sfx: false }, (ctx) => {
      const img = s.engine.image(found.src);
      const lt = s.t - t0;
      const p = clamp(lt / Math.max(0.1, t1 - t0));
      // a small punch at the cut, then the slow move; a hair of hand-held drift
      const punch = 1 + (first ? 0 : 0.05) * Math.exp(-lt * 9);
      const z = lerp(m.z[0], m.z[1], p) * punch;
      const sc = Math.max(s.W / img.naturalWidth, s.H / img.naturalHeight) * z;
      const w = img.naturalWidth * sc;
      const h = img.naturalHeight * sc;
      const dx = Math.sin(s.t * 0.7 + i) * s.W * 0.003;
      const dy = Math.cos(s.t * 0.9 + i * 2) * s.W * 0.003;
      ctx.drawImage(img, s.cx - w / 2 + lerp(m.x[0], m.x[1], p) * s.W + dx, s.cy - h / 2 + lerp(m.y[0], m.y[1], p) * s.H + dy, w, h);
    });
  });
}

// Drifting sparks and a slow fire flicker. The strength comes from each shot's `embers` (0 to 1, default 0.5).
export function embers(s, list) {
  const spans = list.map((shot, i) => ({ t0: i === 0 ? 0 : s.time(shot.at), v: shot.embers ?? 0.5 }));
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    let v = 0;
    for (const sp of spans) if (s.t >= sp.t0) v = sp.v;
    if (v <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // the glow of a fire that breathes
    const fl = 0.5 + 0.5 * Math.sin(s.t * 7.3) * Math.sin(s.t * 3.1 + 1);
    ctx.fillStyle = `rgba(255,120,30,${(0.035 * v * (0.4 + fl)).toFixed(3)})`;
    ctx.fillRect(0, 0, s.W, s.H);
    const n = Math.round(46 * v) + 6;
    for (let i = 0; i < n; i++) {
      const speed = 0.05 + s.rand(i + 11) * 0.09;
      const life = (s.t * speed + s.rand(i)) % 1;
      const x = s.rand(i + 5) * s.W + Math.sin(s.t * (0.6 + s.rand(i + 3)) + i) * s.W * 0.03;
      const y = s.H * (1.04 - life * 1.1);
      const a = Math.sin(Math.PI * life) * (0.35 + 0.65 * s.rand(i + 21)) * Math.min(1, v * 1.4);
      const r = s.W * (0.0016 + s.rand(i + 31) * 0.0034);
      ctx.fillStyle = `rgba(255,${150 + Math.round(s.rand(i + 41) * 70)},60,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

// Dark edges, and a dark foot where the captions sit.
export function vignette(s) {
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const g = ctx.createRadialGradient(s.cx, s.cy, s.W * 0.35, s.cx, s.cy, s.H * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.W, s.H);
    const bot = ctx.createLinearGradient(0, s.H * 0.55, 0, s.H);
    bot.addColorStop(0, 'rgba(0,0,0,0)');
    bot.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = bot;
    ctx.fillRect(0, s.H * 0.55, s.W, s.H * 0.45);
  });
}

// The opening line near the top: white, bold, sentence case, a soft black glow. It fades after `out`.
// o: { at (0.1), out, y (0.27), size (0.064 of the width), sfx }
export function hook(s, text, o = {}) {
  s.draw({ at: o.at ?? 0.1, out: o.out, enter: 'fade', dur: 0.3, outDur: 0.35, sfx: false }, (ctx) => {
    const size = (o.size ?? 0.064) * s.W;
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = textLines(ctx, text, s.W * 0.86);
    const y0 = s.H * (o.y ?? 0.27) - ((lines.length - 1) * size * 1.25) / 2;
    lines.forEach((ln, i) => {
      const y = y0 + i * size * 1.25;
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = size * 0.35;
      ctx.lineWidth = size * 0.16;
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      ctx.strokeText(ln, s.cx, y);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(ln, s.cx, y);
    });
  });
}

// The narration two or three words at a time in bold italics, Title Case; the word being spoken is yellow.
// o: { y (0.69), size (0.062 of the width), maxChars (18), maxWords (3), titleCase (true), from (seconds: no captions before), until }
export function captions(s, o = {}) {
  const maxChars = o.maxChars ?? 18;
  const maxWords = o.maxWords ?? 3;
  const cap = (w) => (o.titleCase === false ? w : w.charAt(0).toUpperCase() + w.slice(1));
  const chunks = [];
  let cur = null;
  for (const w of s.words || []) {
    // the speech check splits "Europe's" into "Europe" and "'s": put them back together
    if (/^['’]/.test(w.text) && cur) {
      const last = cur.w[cur.w.length - 1];
      last.text += w.text.replace(/[.,;:!?"“”]+$/g, '');
      last.end = w.end;
      cur.len += w.text.length;
      cur.raw = w.text;
      continue;
    }
    const shown = cap(w.text.replace(/[.,;:!?"“”]+$/g, '').replace(/^["“”]+/g, ''));
    if (cur && (cur.len + 1 + shown.length > maxChars || cur.w.length >= maxWords || /[.!?]$/.test(cur.raw))) { chunks.push(cur); cur = null; }
    if (!cur) cur = { w: [], len: 0, raw: '' };
    cur.w.push({ text: shown, start: w.start, end: w.end });
    cur.len += (cur.len ? 1 : 0) + shown.length;
    cur.raw = w.text;
  }
  if (cur) chunks.push(cur);
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const t = s.t;
    if (o.until !== undefined && t >= s.time(o.until)) return;
    if (o.from !== undefined && t < s.time(o.from)) return;
    let c = null;
    for (let i = 0; i < chunks.length; i++) {
      const next = chunks[i + 1];
      const last = chunks[i].w[chunks[i].w.length - 1].end;
      if (t >= chunks[i].w[0].start - 0.04 && t < (next ? next.w[0].start - 0.04 : last + 0.5)) { c = chunks[i]; break; }
    }
    if (!c) return;
    const size = (o.size ?? 0.062) * s.W;
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const space = ctx.measureText(' ').width;
    const widths = c.w.map((w) => ctx.measureText(w.text).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (c.w.length - 1);
    const y = s.H * (o.y ?? 0.69);
    ctx.save();
    ctx.translate(s.cx, y);
    ctx.transform(1, 0, -0.2, 1, 0, 0); // italic
    let x = -total / 2;
    c.w.forEach((w, i) => {
      const lit = t >= w.start - 0.02 && t < w.end + 0.1;
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = size * 0.3;
      ctx.lineWidth = size * 0.15;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.strokeText(w.text, x, 0);
      ctx.shadowBlur = 0;
      ctx.fillStyle = lit ? YELLOW : '#ffffff';
      ctx.fillText(w.text, x, 0);
      x += widths[i] + space;
    });
    ctx.restore();
  });
}
