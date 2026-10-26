// Sticker-pop kit for explainroo: flat colored scenes where cut-out stickers, paper notes,
// number chips and bold words POP in one after another, each with a click, over a push
// transition between scenes. Everything except the sticker pictures is drawn here.
//
//   import { pop } from './lib/pop.js';
//   const k = pop(s);
//   k.scene({ look: 'sun', at: 0, out: '#s2' }, () => {
//     k.title('DYNAMITE?', { y: 0.2, at: 0.1 });
//     k.sticker('dynamite', { x: 0.5, y: 0.55, w: 0.42, from: 'bottom', at: 0.3 });
//     k.sparks({ x: 0.55, y: 0.38, at: 0.8 });
//   });
//
// Every call takes `at` (seconds or a "#marker") and optional `out`; both default to the scene.
// x, y are fractions of the frame (0 to 1), sizes are fractions of the frame width.
// Looks: 'sun' (flat yellow), 'blueprint' (teal with dotted guide lines and rings),
// 'paper' (cream). Add `color: '#rrggbb'` to a scene to change its background.
//
// Calls:
//   scene({ look, at, out, color })      starts a scene; the next scene pushes it off to the left
//   title(text, { x, y, size, at, color, rotate })        bold outlined word (display font)
//   heading(text, { x, y, size, at, align, color })       bold lines, each blurs in with a click ('\n' = new line)
//   line(text, { x, y, size, at, align, color })          a plain sentence in the body font
//   sticker(name, { x, y, w, at, from, rotate, burst })   a cut-out picture from assets/<name>.png
//                                                         from: 'pop' | 'bottom' | 'top' | 'left' | 'right'
//   note(text, { x, y, w, at, rotate })                   a paper tag ("Born in Stockholm, Sweden")
//   chip(text, { x, y, at, size })                        a small rounded label ("1833")
//   banner(text, { y, at, size })                         a torn paper strip across the frame
//   arrow([x0, y0], [x1, y1], { bend, at })               a dotted curved arrow that draws itself
//   eyes({ x, y, size, at })                              two googly eyes that look around
//   thought({ x, y, size, at })                           a thought bubble with "..." dots
//   burst({ x, y, at, kind })                             'stars' | 'rays' pop around a point
//   sparks({ x, y, at, out })                             sparks flying off a point (a fuse)
//   ping({ x, y, r, at, every })                          a ring that pulses (a click target)
//   t(marker, delta)                                      a time in seconds from a marker

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const outCubic = (p) => 1 - Math.pow(1 - p, 3);
const inOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const outBack = (p, k = 2) => 1 + (k + 1) * Math.pow(p - 1, 3) + k * Math.pow(p - 1, 2);
const DISPLAY = '"Lilita One", "Outfit", Impact, sans-serif';
const BODY = '"Outfit", "Plus Jakarta Sans", sans-serif';
const PUSH = 0.4; // seconds a scene takes to push the previous one away

export const LOOKS = {
  sun: { bg: '#fbc531', ink: '#161616', fill: '#ffd84a', head: '#161616', sparkle: 'rgba(255,255,255,0.7)' },
  blueprint: { bg: '#198aa6', ink: '#0d3b4a', fill: '#ffffff', head: '#ffffff', sparkle: 'rgba(255,255,255,0.7)' },
  paper: { bg: '#f1e8d8', ink: '#1c1c1c', fill: '#1c1c1c', head: '#1c1c1c', sparkle: 'rgba(255,255,255,0.95)' },
};

// ---------- pictures: cut out of their plain background, given a white sticker edge ----------

const MAX_SIDE = 720;

function cutout(img) {
  const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * k);
  const h = Math.round(img.naturalHeight * k);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, h);
  const id = g.getImageData(0, 0, w, h);
  const d = id.data;
  const corners = [0, w - 1, (h - 1) * w, h * w - 1];
  const hasAlpha = corners.every((i) => d[i * 4 + 3] < 8);
  if (!hasAlpha) {
    // the background is the color of the corners; flood in from the border so white inside the object stays
    let r = 0; let gg = 0; let b = 0;
    for (const i of corners) { r += d[i * 4]; gg += d[i * 4 + 1]; b += d[i * 4 + 2]; }
    r /= 4; gg /= 4; b /= 4;
    const dist = (i) => Math.max(Math.abs(d[i * 4] - r), Math.abs(d[i * 4 + 1] - gg), Math.abs(d[i * 4 + 2] - b));
    const TOL = 42;
    const bg = new Uint8Array(w * h);
    const stack = [];
    const take = (i) => { if (!bg[i] && dist(i) <= TOL) { bg[i] = 1; stack.push(i); } };
    for (let x = 0; x < w; x++) { take(x); take((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { take(y * w); take(y * w + w - 1); }
    while (stack.length) {
      const i = stack.pop();
      const x = i % w;
      if (x > 0) take(i - 1);
      if (x < w - 1) take(i + 1);
      if (i >= w) take(i - w);
      if (i < w * (h - 1)) take(i + w);
    }
    // a grey drop shadow under the object counts as background too: grow through light, colorless pixels
    const grey = (i) => Math.max(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) - Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) <= 30 && (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3 >= 120;
    const seeds = [];
    for (let i = 0; i < w * h; i++) {
      if (bg[i]) continue;
      const x = i % w;
      if (grey(i) && ((x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < w * (h - 1) && bg[i + w]))) seeds.push(i);
    }
    for (const i of seeds) if (!bg[i]) { bg[i] = 1; stack.push(i); }
    while (stack.length) {
      const i = stack.pop();
      const x = i % w;
      const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < w * (h - 1) ? i + w : -1];
      for (const j of nb) if (j >= 0 && !bg[j] && grey(j)) { bg[j] = 1; stack.push(j); }
    }
    for (let i = 0; i < w * h; i++) {
      if (bg[i]) { d[i * 4 + 3] = 0; continue; }
      const x = i % w;
      const edge = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < w * (h - 1) && bg[i + w]);
      if (edge) d[i * 4 + 3] = Math.round(255 * clamp((dist(i) - TOL * 0.4) / TOL));
    }
    g.putImageData(id, 0, 0);
  }
  // crop to what is left
  let x0 = w; let y0 = h; let x1 = -1; let y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const r = Math.max(4, Math.round(Math.max(cw, ch) * 0.022));
  const W2 = cw + r * 2;
  const H2 = ch + r * 2;
  const sil = document.createElement('canvas');
  sil.width = W2; sil.height = H2;
  const sg = sil.getContext('2d');
  sg.drawImage(c, x0, y0, cw, ch, r, r, cw, ch);
  sg.globalCompositeOperation = 'source-in';
  sg.fillStyle = '#ffffff';
  sg.fillRect(0, 0, W2, H2);
  const out = document.createElement('canvas');
  out.width = W2; out.height = H2;
  const og = out.getContext('2d');
  for (const rad of [r, r * 0.55]) for (let a = 0; a < 28; a++) og.drawImage(sil, Math.cos((a / 28) * Math.PI * 2) * rad, Math.sin((a / 28) * Math.PI * 2) * rad);
  og.drawImage(c, x0, y0, cw, ch, r, r, cw, ch);
  return { cv: out, w: W2, h: H2 };
}

function stickerFor(s, name) {
  const store = (s.engine.__stickers ||= new Map());
  if (store.has(name)) return store.get(name);
  let found = null;
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${name}.${ext}`)) { found = `assets/${name}.${ext}`; break; }
  const v = found ? cutout(s.engine.image(found)) : null;
  store.set(name, v);
  return v;
}

// ---------- small drawing helpers ----------

function star(ctx, x, y, r, points = 4, inner = 0.4) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

function outlinedText(ctx, text, x, y, size, fill, ink, lw) {
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.fillStyle = ink;
  ctx.fillText(text, x + size * 0.04, y + size * 0.06);
  ctx.lineWidth = lw;
  ctx.strokeStyle = ink;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

export function pop(s) {
  const W = s.W;
  const H = s.H;
  const t = (m, d = 0) => s.time(m) + d;
  let cur = null;

  // x offset of the current scene (it pushes in from the right and out to the left)
  const pushX = (sc, tt) => {
    let x = 0;
    if (sc.pushIn && tt < sc.at + PUSH) x = W * (1 - inOut(clamp((tt - sc.at) / PUSH)));
    if (sc.out !== null && tt >= sc.out) x = -W * inOut(clamp((tt - sc.out) / PUSH));
    return x;
  };
  const blurOf = (sc, tt) => {
    let p = 0;
    if (sc.pushIn && tt < sc.at + PUSH) p = (tt - sc.at) / PUSH;
    if (sc.out !== null && tt >= sc.out) p = (tt - sc.out) / PUSH;
    return p > 0 && p < 1 ? Math.sin(Math.PI * p) * W * 0.012 : 0;
  };

  // one drawing that belongs to the current scene; fn(ctx, local seconds, scene)
  function el(o, fn, extra = {}) {
    const sc = cur;
    if (!sc) throw new Error('call k.scene(...) before drawing anything');
    const at = o.at === undefined ? sc.at : s.time(o.at);
    const out = o.out === undefined ? sc.end : s.time(o.out);
    s.draw({ at, out, enter: 'none', exit: 'none', sfx: false, ...extra }, (ctx) => {
      const lt = s.t - at;
      if (lt < 0) return;
      ctx.save();
      try {
        ctx.translate(pushX(sc, s.t), 0);
        const b = blurOf(sc, s.t);
        if (b > 0.5) ctx.filter = `blur(${b.toFixed(1)}px)`;
        fn(ctx, lt, sc);
      } finally { ctx.restore(); }
    });
    return at;
  }

  // ---------- backgrounds ----------

  function background(sc) {
    const look = LOOKS[sc.look] || LOOKS.paper;
    const color = sc.color || look.bg;
    s.draw({ at: sc.at, out: sc.end, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      ctx.save();
      try {
        ctx.translate(pushX(sc, s.t), 0);
        const b = blurOf(sc, s.t);
        if (b > 0.5) ctx.filter = `blur(${b.toFixed(1)}px)`;
        ctx.fillStyle = color;
        ctx.fillRect(-2, 0, W + 4, H);
        const lt = s.t - sc.at;
        if (sc.look === 'blueprint') blueprint(ctx, lt);
        // soft paper grain
        for (let i = 0; i < 170; i++) {
          ctx.fillStyle = `rgba(${sc.look === 'blueprint' ? '255,255,255' : '0,0,0'},${(0.018 + s.rand(i + 600) * 0.03).toFixed(3)})`;
          ctx.fillRect(s.rand(i) * W, s.rand(i + 300) * H, W * (0.002 + s.rand(i + 900) * 0.004), W * (0.002 + s.rand(i + 1200) * 0.004));
        }
        // twinkling four-point sparkles
        for (let i = 0; i < 9; i++) {
          const tw = 0.5 + 0.5 * Math.sin(s.t * (1.2 + s.rand(i + 40)) + i * 2);
          ctx.fillStyle = look.sparkle;
          ctx.globalAlpha = 0.25 + 0.55 * tw;
          star(ctx, W * (0.06 + s.rand(i + 70) * 0.88), H * (0.05 + s.rand(i + 80) * 0.9), W * (0.008 + s.rand(i + 90) * 0.012) * (0.7 + tw * 0.5), 4, 0.25);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } finally { ctx.restore(); }
    });
  }

  function blueprint(ctx, lt) {
    // big drifting rings
    ctx.lineCap = 'round';
    for (const [cx, cy, r, w0, sp] of [[0.95, 0.06, 0.2, 0.05, 0.12], [0.02, 0.86, 0.2, 0.055, -0.1], [0.9, 0.6, 0.06, 0.012, 0.3]]) {
      ctx.strokeStyle = 'rgba(160,225,240,0.32)';
      ctx.lineWidth = W * w0;
      ctx.beginPath();
      const a0 = lt * sp * Math.PI;
      ctx.arc(W * cx, H * cy, W * r, a0, a0 + Math.PI * 1.5);
      ctx.stroke();
    }
    // dotted guide lines
    ctx.strokeStyle = 'rgba(190,235,245,0.6)';
    ctx.lineWidth = W * 0.003;
    ctx.setLineDash([W * 0.004, W * 0.012]);
    ctx.beginPath();
    ctx.moveTo(W * 0.1, H * 0.13); ctx.lineTo(W * 0.4, H * 0.13);
    ctx.moveTo(W * 0.1, H * 0.13); ctx.lineTo(W * 0.1, H * 0.42);
    ctx.moveTo(W * 0.9, H * 0.18); ctx.lineTo(W * 0.9, H * 0.7);
    ctx.moveTo(W * 0.14, H * 0.76); ctx.lineTo(W * 0.14, H * 0.9); ctx.lineTo(W * 0.5, H * 0.9);
    ctx.stroke();
    ctx.setLineDash([]);
    // small rings
    ctx.lineWidth = W * 0.004;
    for (const [x, y, r] of [[0.86, 0.12, 0.012], [0.12, 0.62, 0.018], [0.8, 0.9, 0.01]]) {
      ctx.beginPath(); ctx.arc(W * x, H * y, W * r * (1 + 0.15 * Math.sin(lt * 3 + x * 9)), 0, Math.PI * 2); ctx.stroke();
    }
  }

  // ---------- the calls ----------

  const kit = {
    t,

    scene(o, fn) {
      const at = s.time(o.at ?? 0);
      const out = o.out === undefined ? null : s.time(o.out);
      cur = { look: o.look ?? 'paper', color: o.color, at, out, pushIn: at > 0.01 && o.push !== false, end: out === null ? Infinity : out + PUSH + 0.05 };
      if (cur.pushIn) s.sfx('swipe', Math.max(0, at - 0.04), { dur: 0.42, gain: 1.15 });
      background(cur);
      fn();
    },

    // a bold outlined word that pops in
    title(text, o = {}) {
      const at = s.time(o.at ?? cur.at);
      s.sfx('pop', at, { gain: 1.4 });
      s.sfx('click', at + 0.08, { gain: 1.1 });
      el(o, (ctx, lt, sc) => {
        const look = LOOKS[sc.look] || LOOKS.paper;
        let size = (o.size ?? 0.13) * W;
        ctx.font = `${size}px ${DISPLAY}`;
        const widest = Math.max(...String(text).split('\n').map((l) => ctx.measureText(l).width));
        if (widest > W * 0.88) size *= (W * 0.88) / widest;
        const p = outBack(clamp(lt / 0.45), 2.4);
        const wob = Math.sin(lt * 5) * 0.012 * clamp(lt - 0.4, 0, 1);
        ctx.translate(W * (o.x ?? 0.5), H * (o.y ?? 0.2));
        ctx.rotate(((o.rotate ?? -2) * Math.PI) / 180 + wob);
        ctx.scale(Math.max(0.001, p), Math.max(0.001, p));
        ctx.font = `${size}px ${DISPLAY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = String(text).split('\n');
        lines.forEach((ln, i) => outlinedText(ctx, ln, 0, (i - (lines.length - 1) / 2) * size * 1.05, size, o.color ?? look.fill, look.ink === '#0d3b4a' ? '#0d3b4a' : '#161616', size * 0.2));
      });
    },

    // bold lines that blur in one by one, each with a click
    heading(text, o = {}) {
      const at = s.time(o.at ?? cur.at);
      const lines = String(text).split('\n');
      const gap = o.gap ?? 0.2;
      lines.forEach((_, i) => s.sfx('click', at + i * gap, { gain: 1.2 }));
      el(o, (ctx, lt, sc) => {
        const look = LOOKS[sc.look] || LOOKS.paper;
        const size = (o.size ?? 0.105) * W;
        const align = o.align ?? 'left';
        ctx.font = `800 ${size}px ${BODY}`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        const x = W * (o.x ?? (align === 'left' ? 0.08 : 0.5));
        lines.forEach((ln, i) => {
          const p = clamp((lt - i * gap) / 0.35);
          if (p <= 0) return;
          const prev = ctx.filter;
          ctx.save();
          ctx.globalAlpha *= outCubic(p);
          ctx.filter = `blur(${((1 - p) * size * 0.14).toFixed(1)}px)`;
          ctx.fillStyle = o.color ?? look.head;
          ctx.fillText(ln, x + (1 - outCubic(p)) * size * 0.4, H * (o.y ?? 0.3) + (i - (lines.length - 1) / 2) * size * 1.12);
          ctx.restore();
          ctx.filter = prev;
        });
      });
    },

    // a plain sentence that fades up
    line(text, o = {}) {
      const at = s.time(o.at ?? cur.at);
      s.sfx('click', at, { gain: 1 });
      el(o, (ctx, lt, sc) => {
        const look = LOOKS[sc.look] || LOOKS.paper;
        const size = (o.size ?? 0.055) * W;
        const p = outCubic(clamp(lt / 0.35));
        ctx.globalAlpha *= p;
        ctx.font = `800 ${size}px ${BODY}`;
        ctx.textAlign = o.align ?? 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = o.color ?? look.head;
        const lines = String(text).split('\n');
        lines.forEach((ln, i) => ctx.fillText(ln, W * (o.x ?? 0.5), H * (o.y ?? 0.1) + (1 - p) * size * 0.5 + (i - (lines.length - 1) / 2) * size * 1.2));
      });
    },

    // a cut-out picture with a white sticker edge
    sticker(name, o = {}) {
      const at = s.time(o.at ?? cur.at);
      const from = o.from ?? 'pop';
      s.sfx('pop', at, { gain: 1.5 });
      s.sfx('click', at + 0.28, { gain: 0.9 });
      if (o.burst) kit.burst({ x: (o.x ?? 0.5) + (o.burst.dx ?? 0), y: (o.y ?? 0.5) - (o.burst.dy ?? 0.12), at: at + 0.3, kind: o.burst.kind ?? 'stars' });
      el(o, (ctx, lt) => {
        const st = stickerFor(s, name);
        const w = (o.w ?? 0.4) * W;
        const cx = W * (o.x ?? 0.5);
        const cy = H * (o.y ?? 0.5);
        const dur = from === 'pop' ? 0.45 : 0.62;
        const p = clamp(lt / dur);
        const e = outBack(p, from === 'pop' ? 2.2 : 1.6);
        let dx = 0; let dy = 0; let sc = 1;
        if (from === 'pop') sc = Math.max(0.001, e);
        else if (from === 'bottom') dy = (1 - e) * H * 0.6;
        else if (from === 'top') dy = -(1 - e) * H * 0.7;
        else if (from === 'left') dx = -(1 - e) * W * 0.9;
        else if (from === 'right') dx = (1 - e) * W * 0.9;
        const idle = clamp(lt - dur, 0, 1);
        const breathe = 1 + Math.sin(lt * 3.1 + w) * 0.014 * idle;
        ctx.save();
        ctx.translate(cx + dx, cy + dy);
        ctx.rotate(((o.rotate ?? 0) * Math.PI) / 180 + Math.sin(lt * 2.2 + w) * 0.018 * idle);
        ctx.scale(sc * breathe, sc * breathe);
        ctx.shadowColor = 'rgba(0,0,0,0.28)';
        ctx.shadowBlur = W * 0.014;
        ctx.shadowOffsetY = W * 0.008;
        if (st) {
          const h = (w * st.h) / st.w;
          ctx.drawImage(st.cv, -w / 2, -h / 2, w, h);
        } else {
          // no picture yet: a labelled placeholder so the layout can be checked
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.fillRect(-w / 2, -w / 2, w, w);
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = '#161616';
          ctx.font = `800 ${W * 0.04}px ${BODY}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(name, 0, 0);
        }
        ctx.restore();
      });
    },

    // a paper tag
    note(text, o = {}) {
      const at = s.time(o.at ?? cur.at);
      s.sfx('click', at, { gain: 1.3 });
      s.sfx('tick', at + 0.12, { gain: 0.9 });
      el(o, (ctx, lt) => {
        const p = Math.max(0.001, outBack(clamp(lt / 0.4), 2.2));
        const size = (o.size ?? 0.04) * W;
        const w = (o.w ?? 0.34) * W;
        ctx.font = `800 ${size}px ${BODY}`;
        // wrap
        const lines = [];
        for (const para of String(text).split('\n')) {
          let cur2 = '';
          for (const word of para.split(' ')) {
            const tryLine = cur2 ? `${cur2} ${word}` : word;
            if (ctx.measureText(tryLine).width > w - size * 1.4 && cur2) { lines.push(cur2); cur2 = word; } else cur2 = tryLine;
          }
          lines.push(cur2);
        }
        const h = lines.length * size * 1.25 + size * 1.3;
        ctx.translate(W * (o.x ?? 0.7), H * (o.y ?? 0.3));
        ctx.rotate(((o.rotate ?? 2) * Math.PI) / 180);
        ctx.scale(p, p);
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = W * 0.012;
        ctx.shadowOffsetY = W * 0.007;
        ctx.fillStyle = '#efdcae';
        ctx.beginPath();
        const n = 14;
        for (let i = 0; i <= n; i++) ctx.lineTo(-w / 2 + (w * i) / n, -h / 2 + (s.rand(i + 11) - 0.5) * size * 0.2);
        for (let i = 0; i <= n; i++) ctx.lineTo(w / 2 + (s.rand(i + 31) - 0.5) * size * 0.2, -h / 2 + (h * i) / n);
        for (let i = n; i >= 0; i--) ctx.lineTo(-w / 2 + (w * i) / n, h / 2 + (s.rand(i + 51) - 0.5) * size * 0.2);
        for (let i = n; i >= 0; i--) ctx.lineTo(-w / 2 + (s.rand(i + 71) - 0.5) * size * 0.2, -h / 2 + (h * i) / n);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(150,110,50,0.1)';
        ctx.fill();
        ctx.fillStyle = '#2a2118';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        lines.forEach((ln, i) => ctx.fillText(ln, -w / 2 + size * 0.7, -h / 2 + size * 0.65 + size * 0.62 + i * size * 1.25));
      });
    },

    // a small rounded label, e.g. a year
    chip(text, o = {}) {
      const at = s.time(o.at ?? cur.at);
      s.sfx('click', at, { gain: 1.4 });
      s.sfx('blip', at + 0.05, { gain: 0.8, pitch: o.pitch ?? 3 });
      el(o, (ctx, lt) => {
        const p = Math.max(0.001, outBack(clamp(lt / 0.38), 2.6));
        const size = (o.size ?? 0.065) * W;
        ctx.font = `800 ${size}px ${BODY}`;
        const w = ctx.measureText(text).width + size * 1.1;
        const h = size * 1.5;
        ctx.translate(W * (o.x ?? 0.75), H * (o.y ?? 0.4));
        ctx.rotate(((o.rotate ?? 0) * Math.PI) / 180);
        ctx.scale(p, p);
        ctx.shadowColor = 'rgba(0,0,0,0.22)';
        ctx.shadowBlur = W * 0.01;
        ctx.shadowOffsetY = W * 0.006;
        ctx.fillStyle = o.fill ?? '#f1dfb8';
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, size * 0.22);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = o.color ?? '#2a2118';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, size * 0.04);
      });
    },

    // a torn paper strip with bold capitals, sliding up
    banner(text, o = {}) {
      const at = s.time(o.at ?? cur.at);
      s.sfx('swipe', at - 0.02, { dur: 0.3, gain: 0.8 });
      s.sfx('pop', at + 0.28, { gain: 1.1 });
      el(o, (ctx, lt) => {
        const p = outBack(clamp(lt / 0.5), 1.5);
        const size = (o.size ?? 0.075) * W;
        const lines = String(text).split('\n');
        const h = lines.length * size * 1.08 + size * 1.1;
        const y = H * (o.y ?? 0.72) + (1 - p) * H * 0.4;
        ctx.save();
        ctx.translate(W * 0.5, y);
        ctx.rotate((-1.2 * Math.PI) / 180);
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = W * 0.014;
        ctx.shadowOffsetY = -W * 0.004;
        ctx.fillStyle = '#e9dbc0';
        ctx.beginPath();
        const n = 26;
        const w = W * 1.1;
        for (let i = 0; i <= n; i++) ctx.lineTo(-w / 2 + (w * i) / n, -h / 2 + (s.rand(i + 5) - 0.5) * size * 0.28);
        ctx.lineTo(w / 2, h / 2);
        ctx.lineTo(-w / 2, h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#161616';
        ctx.font = `800 ${size}px ${BODY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        lines.forEach((ln, i) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * size * 1.08 + size * 0.1));
        ctx.restore();
      });
    },

    // a dotted curved arrow that draws itself
    arrow(a, b, o = {}) {
      const at = s.time(o.at ?? cur.at);
      s.sfx('tick', at, { gain: 1 });
      s.sfx('whoosh', at, { dur: 0.3, gain: 0.35 });
      el(o, (ctx, lt, sc) => {
        const look = LOOKS[sc.look] || LOOKS.paper;
        const p = inOut(clamp(lt / (o.dur ?? 0.55)));
        const x0 = W * a[0]; const y0 = H * a[1]; const x1 = W * b[0]; const y1 = H * b[1];
        const mx = (x0 + x1) / 2; const my = (y0 + y1) / 2;
        const len = Math.hypot(x1 - x0, y1 - y0);
        const bend = (o.bend ?? 0.25) * len;
        const cx = mx - ((y1 - y0) / len) * bend;
        const cy = my + ((x1 - x0) / len) * bend;
        const pt = (u) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1];
        ctx.strokeStyle = o.color ?? (sc.look === 'blueprint' ? '#d8f4fa' : '#2a2118');
        ctx.lineWidth = W * 0.004;
        ctx.lineCap = 'round';
        ctx.setLineDash([W * 0.002, W * 0.014]);
        ctx.beginPath();
        const steps = 40;
        for (let i = 0; i <= steps * p; i++) { const [px, py] = pt(i / steps); ctx[i ? 'lineTo' : 'moveTo'](px, py); }
        ctx.stroke();
        ctx.setLineDash([]);
        if (p > 0.97) {
          const [px, py] = pt(1);
          const [qx, qy] = pt(0.94);
          const ang = Math.atan2(py - qy, px - qx);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - Math.cos(ang - 0.5) * W * 0.025, py - Math.sin(ang - 0.5) * W * 0.025);
          ctx.moveTo(px, py);
          ctx.lineTo(px - Math.cos(ang + 0.5) * W * 0.025, py - Math.sin(ang + 0.5) * W * 0.025);
          ctx.stroke();
        }
        void look;
      });
    },

    // two googly eyes that look around and blink
    eyes(o = {}) {
      const at = s.time(o.at ?? cur.at);
      s.sfx('blip', at, { gain: 0.9, pitch: 5 });
      el(o, (ctx, lt) => {
        const size = (o.size ?? 0.07) * W;
        const p = Math.max(0.001, outBack(clamp(lt / 0.3), 2.5));
        ctx.translate(W * (o.x ?? 0.5), H * (o.y ?? 0.3));
        ctx.scale(p, p);
        const blink = (lt % 2.6) > 2.45 ? 0.15 : 1;
        const look = Math.sin(lt * 1.3) * 0.5 + Math.sin(lt * 3.1) * 0.2;
        for (const dx of [-0.3, 0.3]) {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#161616';
          ctx.lineWidth = size * 0.07;
          ctx.beginPath();
          ctx.ellipse(dx * size, 0, size * 0.28, size * 0.36 * blink, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#161616';
          ctx.beginPath();
          ctx.ellipse(dx * size + look * size * 0.1, size * 0.05 * blink, size * 0.12, size * 0.16 * blink, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    },

    // a thought bubble with three dots
    thought(o = {}) {
      const at = s.time(o.at ?? cur.at);
      s.sfx('pop', at, { gain: 0.9 });
      el(o, (ctx, lt) => {
        const size = (o.size ?? 0.1) * W;
        const p = Math.max(0.001, outBack(clamp(lt / 0.35), 2.2));
        ctx.translate(W * (o.x ?? 0.8), H * (o.y ?? 0.2));
        ctx.scale(p, p);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#161616';
        ctx.lineWidth = size * 0.05;
        for (const [x, y, r] of [[0, 0, 0.3], [-0.3, 0.05, 0.2], [0.28, 0.0, 0.22], [-0.05, -0.2, 0.22], [-0.1, 0.18, 0.2]]) {
          ctx.beginPath(); ctx.arc(x * size, y * size, r * size, 0, Math.PI * 2); ctx.fill();
        }
        // draw the outline by a second pass of fills inside (keeps a clean cloud edge)
        for (const [x, y, r] of [[0, 0, 0.3], [-0.3, 0.05, 0.2], [0.28, 0.0, 0.22], [-0.05, -0.2, 0.22], [-0.1, 0.18, 0.2]]) {
          ctx.beginPath(); ctx.arc(x * size, y * size, r * size - size * 0.02, 0, Math.PI * 2); ctx.fill();
        }
        for (const [x, y, r] of [[-0.42, 0.34, 0.07], [-0.52, 0.46, 0.04]]) {
          ctx.beginPath(); ctx.arc(x * size, y * size, r * size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle = '#161616';
        for (let i = 0; i < 3; i++) {
          const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(lt * 5 - i * 1.2));
          ctx.globalAlpha = a;
          ctx.beginPath(); ctx.arc((-0.12 + i * 0.12) * size, 0, size * 0.035, 0, Math.PI * 2); ctx.fill();
        }
      });
    },

    // stars or rays that pop around a point
    burst(o = {}) {
      const at = s.time(o.at ?? cur.at);
      s.sfx('sparkle', at, { gain: o.sfxGain ?? 0.7 });
      el({ ...o, out: o.out ?? at + 1.1 }, (ctx, lt, sc) => {
        const p = clamp(lt / 0.9);
        const cx = W * (o.x ?? 0.5);
        const cy = H * (o.y ?? 0.3);
        const colors = o.colors ?? ['#ffd23f', '#ffffff', '#b58cff', '#ff7a59'];
        const n = o.count ?? 8;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + s.rand(i + 5) * 0.6;
          const dist = W * (0.04 + outCubic(p) * (0.07 + s.rand(i + 9) * 0.07));
          const x = cx + Math.cos(a) * dist;
          const y = cy + Math.sin(a) * dist * 0.85 + p * p * W * 0.02;
          ctx.globalAlpha = 1 - p * p;
          ctx.fillStyle = colors[i % colors.length];
          ctx.strokeStyle = '#161616';
          ctx.lineWidth = W * 0.0025;
          if ((o.kind ?? 'stars') === 'rays') {
            ctx.strokeStyle = colors[i % colors.length];
            ctx.lineWidth = W * 0.006;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * dist * 0.6, cy + Math.sin(a) * dist * 0.6);
            ctx.lineTo(x, y);
            ctx.stroke();
          } else {
            star(ctx, x, y, W * (0.012 + s.rand(i + 3) * 0.012), 5, 0.45);
            ctx.fill();
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
        void sc;
      });
    },

    // sparks flying off a point, like a lit fuse
    sparks(o = {}) {
      const at = s.time(o.at ?? cur.at);
      el(o, (ctx, lt) => {
        const cx = W * (o.x ?? 0.5);
        const cy = H * (o.y ?? 0.3);
        const grow = clamp(lt / 0.3);
        // a bright flare
        ctx.fillStyle = '#fff3b0';
        ctx.globalAlpha = 0.9;
        star(ctx, cx, cy, W * 0.035 * grow * (0.85 + 0.15 * Math.sin(lt * 25)), 8, 0.35);
        ctx.fill();
        ctx.fillStyle = '#ff9d2e';
        star(ctx, cx, cy, W * 0.022 * grow, 8, 0.4);
        ctx.fill();
        ctx.globalAlpha = 1;
        // flying specks, each on a repeating 0.9 s life
        for (let i = 0; i < 16; i++) {
          const life = ((lt * 1.1 + s.rand(i) * 1.0) % 1);
          const a = -Math.PI / 2 + (s.rand(i + 30) - 0.5) * 3.4;
          const v = W * (0.05 + s.rand(i + 60) * 0.1);
          const x = cx + Math.cos(a) * v * life;
          const y = cy + Math.sin(a) * v * life + life * life * W * 0.07;
          ctx.globalAlpha = (1 - life) * grow;
          ctx.fillStyle = i % 3 ? '#ff8a1f' : '#ffe27a';
          ctx.beginPath();
          ctx.arc(x, y, W * (0.003 + s.rand(i + 90) * 0.004), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      });
      void at;
    },

    // a ring that pulses outward, like a click target
    ping(o = {}) {
      const at = s.time(o.at ?? cur.at);
      const every = o.every ?? 0.9;
      const end = o.out === undefined ? cur.out ?? at + 3 : s.time(o.out);
      for (let c = at; c < Math.min(end, at + (o.count ?? 3) * every); c += every) s.sfx('click', c, { gain: 0.8 });
      el(o, (ctx, lt, sc) => {
        const look = LOOKS[sc.look] || LOOKS.paper;
        const cyc = (lt % every) / every;
        const r = W * (o.r ?? 0.08) * (1.25 - 0.35 * outCubic(cyc));
        ctx.translate(W * (o.x ?? 0.5), H * (o.y ?? 0.3));
        ctx.globalAlpha = Math.min(1, cyc * 6) * (1 - Math.max(0, (cyc - 0.65) / 0.35));
        ctx.strokeStyle = o.color ?? look.ink;
        ctx.lineWidth = W * 0.006;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + 0.4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (r + W * 0.012), Math.sin(a) * (r + W * 0.012));
          ctx.lineTo(Math.cos(a) * (r + W * 0.03), Math.sin(a) * (r + W * 0.03));
          ctx.stroke();
        }
      });
    },
  };
  return kit;
}
