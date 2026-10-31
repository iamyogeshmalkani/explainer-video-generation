// Documentary Mini Founder Reel kit for explainroo: a premium editorial mini-documentary in 9:16.
// Hard cuts, six compositions, a tiny centred word-by-word caption in a Helvetica-style sans with occasional
// italic serif, red and CAPS emphasis, and no music. No logo, no watermark, no bouncing text.
//
//   shots(s, SHOTS);              // first: the picture track (hard cuts)
//   grade(s, SHOTS);              // a light vignette on footage (never on cards)
//   stats(s, STATS);              // one big italic-serif number over dimmed footage
//   captions(s, SHOTS, EMPHASIS); // the narration, a few words at a time, building up as it is spoken
//   creditsCard(s, CREDITS);      // optional last: photographers' credits on black
//
// A shot: { n, at: '#s1', kind, file, files, query, motion, focus, bg, ink, caps, headline, note, sfx }
//   kind:   'full'    footage or photo fills the frame, slow push/pull/pan       (default)
//           'wide'    landscape footage keeps its shape on black, never stretched (use for archive, concerts, news)
//           'card'    a clean typography card: bg 'white' | 'black' | 'red'; optional `headline`
//           'triptych' three pictures stacked (files: ['a','b','c']), cutting in one after another
//           'paper'   a photo or cut-out (png) on off-white paper with a shadow; optional red-highlight `note` strip
//   motion: push | pull | panLeft | panRight | rise | still   (slow: never more than about 9%)
//   focus:  [x, y] 0..1, where the face or subject is; the crop follows it
//   ink:    caption colour: 'auto' (black on white, white elsewhere) | 'red' | 'black' | 'white'
//   caps:   true sets this shot's caption in bold CAPITALS (names, the turning point)
//   sfx:    'click' | 'type' | 'thud' | 'tick' ... one quiet sound at the cut (only if it fits what is on screen)
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = (p) => p * p * (3 - 2 * p);
const SANS = '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';
const SERIF = '"Instrument Serif", "Playfair Display", Georgia, serif';
const RED = '#e10600';
const PAPER = '#f4f1ec';
const BG = { white: '#fbfbfb', black: '#000000', red: RED, paper: PAPER };
const MAX_STILL = 6; // seconds: a still picture that stays longer than this is flagged
const MOTIONS = {
  push: { z: [1.0, 1.09], x: [0, 0], y: [0, 0] },
  pull: { z: [1.09, 1.0], x: [0, 0], y: [0, 0] },
  panLeft: { z: [1.1, 1.1], x: [0.035, -0.035], y: [0, 0] },
  panRight: { z: [1.1, 1.1], x: [-0.035, 0.035], y: [0, 0] },
  rise: { z: [1.1, 1.1], x: [0, 0], y: [0.03, -0.03] },
  still: { z: [1.02, 1.04], x: [0, 0], y: [0, 0] },
};

function wrap(ctx, text, maxWidth) {
  const lines = [''];
  for (const w of String(text).split(' ')) {
    const t = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t;
  }
  return lines;
}

function findAsset(s, base) {
  for (const ext of ['mp4', 'mov', 'webm', 'm4v']) if (s.engine.clips.has(`assets/${base}.${ext}`)) return { kind: 'clip', src: `assets/${base}.${ext}` };
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) if (s.engine.images.has(`assets/${base}.${ext}`)) return { kind: 'image', src: `assets/${base}.${ext}` };
  return null;
}

// Draws a picture into the box (bx, by, bw, bh): cover-cropped around `focus`, with a slow move p (0..1).
function drawCover(ctx, img, bx, by, bw, bh, shot, p) {
  const m = MOTIONS[shot.motion] || MOTIONS.push;
  const [fx, fy] = shot.focus || [0.5, 0.4];
  const z = lerp(m.z[0], m.z[1], p);
  const sc = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * z;
  const w = img.naturalWidth * sc;
  const h = img.naturalHeight * sc;
  const left = clamp(fx * w - bw / 2 - lerp(m.x[0], m.x[1], p) * bw, 0, Math.max(0, w - bw));
  const top = clamp(fy * h - bh * 0.42 - lerp(m.y[0], m.y[1], p) * bh, 0, Math.max(0, h - bh));
  ctx.save();
  ctx.beginPath();
  ctx.rect(bx, by, bw, bh);
  ctx.clip();
  ctx.drawImage(img, bx - left, by - top, w, h);
  ctx.restore();
}

// Draws a picture whole inside the box: nothing stretched, nothing cropped.
function drawContain(ctx, img, bx, by, bw, bh, shot, p) {
  const m = MOTIONS[shot.motion] || MOTIONS.push;
  const z = 1 + (lerp(m.z[0], m.z[1], p) - 1) * 0.5;
  const sc = Math.min(bw / img.naturalWidth, bh / img.naturalHeight) * z;
  const w = img.naturalWidth * sc;
  const h = img.naturalHeight * sc;
  ctx.drawImage(img, bx + (bw - w) / 2, by + (bh - h) / 2, w, h);
  return { x: bx + (bw - w) / 2, y: by + (bh - h) / 2, w, h };
}

function placeholder(s, shot, ctx, i) {
  ctx.fillStyle = `hsl(${(i * 29 + 210) % 360},12%,14%)`;
  ctx.fillRect(0, 0, s.W, s.H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `800 ${s.W * 0.09}px ${SANS}`;
  ctx.fillText(`SHOT ${String(shot.n ?? i + 1).padStart(2, '0')}`, s.cx, s.H * 0.2);
  ctx.font = `600 ${s.W * 0.036}px ${SANS}`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  wrap(ctx, shot.query || shot.note || '', s.W * 0.78).slice(0, 8).forEach((l, k) => ctx.fillText(l, s.cx, s.H * 0.3 + k * s.W * 0.052));
  ctx.fillStyle = RED;
  ctx.fillText(`add assets/${shot.file || 'shotNN'}.jpg or .mp4`, s.cx, s.H * 0.88);
}

function span(s, list, i) {
  const t0 = i === 0 ? 0 : s.time(list[i].at);
  const t1 = i + 1 < list.length ? s.time(list[i + 1].at) : s.dur;
  return [t0, t1];
}

function shadowPaper(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = h * 0.05;
  ctx.shadowOffsetY = h * 0.02;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// The picture track. Every shot runs until the next marker; the cut is hard.
export function shots(s, list) {
  const tooLong = [];
  list.forEach((shot, i) => {
    const kind = shot.kind || 'full';
    const [t0, t1] = span(s, list, i);
    const opt = { at: t0, out: t1, enter: 'none', exit: 'none', sfx: false };
    if (shot.sfx) s.sfx(shot.sfx, t0, { gain: shot.sfxGain ?? 0.5 });
    if (kind === 'card') {
      s.draw(opt, (ctx) => {
        ctx.fillStyle = BG[shot.bg || 'white'] || BG.white;
        ctx.fillRect(0, 0, s.W, s.H);
        if (!shot.headline) return;
        const dark = (shot.bg || 'white') === 'white';
        const a = ease(clamp((s.t - t0) / 0.35));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = shot.ink === 'red' ? RED : dark ? '#0a0a0a' : '#ffffff';
        const size = s.W * (shot.headlineSize ?? 0.15);
        ctx.font = shot.serif ? `italic 400 ${size * 1.12}px ${SERIF}` : `800 ${size}px ${SANS}`;
        const lines = wrap(ctx, shot.serif ? shot.headline : shot.headline.toUpperCase(), s.W * 0.84);
        const lh = size * (shot.serif ? 1.05 : 0.98);
        lines.forEach((ln, k) => ctx.fillText(ln, s.cx, s.H * 0.4 - ((lines.length - 1) * lh) / 2 + k * lh));
        ctx.restore();
      });
      return;
    }
    const files = kind === 'triptych' ? shot.files || [] : [shot.file];
    const found = files.map((f) => findAsset(s, f));
    const longest = t1 - t0;
    if (kind !== 'wide' && !found.some((f) => f?.kind === 'clip') && longest > MAX_STILL + 0.05) tooLong.push(`shot ${shot.n ?? i + 1} (${shot.at}) is on screen ${longest.toFixed(1)} s`);
    // video clips play as they are
    if (kind !== 'triptych' && kind !== 'paper' && found[0]?.kind === 'clip') {
      const wide = kind === 'wide';
      const h = wide ? s.W * (shot.ratio ?? 9 / 16) : s.H;
      s.draw({ ...opt }, (ctx) => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, s.W, s.H); });
      s.clip(found[0].src, { x: s.cx, y: s.cy, w: s.W, h, fit: 'cover', frame: 'none', shadow: false, radius: 0, ...opt, speed: shot.speed ?? 1, from: shot.from ?? 0 });
      return;
    }
    s.draw(opt, (ctx) => {
      const p = ease(clamp((s.t - t0) / Math.max(0.1, t1 - t0)));
      if (found.some((f) => !f)) { placeholder(s, shot, ctx, i); return; }
      const imgs = found.map((f) => s.engine.image(f.src));
      if (kind === 'full') { drawCover(ctx, imgs[0], 0, 0, s.W, s.H, shot, p); return; }
      if (kind === 'wide') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, s.W, s.H);
        drawContain(ctx, imgs[0], 0, s.H * 0.5 - s.W * 0.5, s.W, s.W, shot, p);
        return;
      }
      if (kind === 'triptych') {
        const th = s.H / 3;
        imgs.slice(0, 3).forEach((img, k) => {
          if (s.t - t0 < k * 0.22) return; // each strip cuts in a beat after the one above
          drawCover(ctx, img, 0, k * th, s.W, th, { ...shot, focus: shot.focuses?.[k] || shot.focus }, p);
        });
        return;
      }
      if (kind === 'paper') {
        ctx.fillStyle = PAPER;
        ctx.fillRect(0, 0, s.W, s.H);
        const img = imgs[0];
        const maxW = s.W * 0.78;
        const maxH = s.H * 0.5;
        const sc = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight) * lerp(1, 1.05, p);
        const w = img.naturalWidth * sc;
        const h = img.naturalHeight * sc;
        const y = s.H * 0.34 - h / 2 + (shot.note ? 0 : s.H * 0.08);
        if (!/\.png$/.test(found[0].src)) shadowPaper(ctx, s.cx - w / 2 - 6, y - 6, w + 12, h + 12);
        ctx.drawImage(img, s.cx - w / 2, y, w, h);
        if (shot.note) {
          const size = s.W * 0.034;
          ctx.font = `500 ${size}px ${SERIF}`;
          const lines = wrap(ctx, shot.note, s.W * 0.7);
          const top = y + h + s.W * 0.05;
          lines.forEach((ln, k) => {
            const w2 = ctx.measureText(ln).width + size * 0.8;
            ctx.fillStyle = RED;
            ctx.fillRect(s.cx - w2 / 2, top + k * size * 1.5, w2, size * 1.4);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ln, s.cx, top + k * size * 1.5 + size * 0.72);
          });
        }
      }
    });
  });
  if (tooLong.length) throw new Error(`documentary-founder-reel: a still may stay on screen ${MAX_STILL} seconds at most, but ${tooLong.join('; ')}. Add a [#marker] and another shot.`);
}

// A very light vignette on footage and photographs; cards and paper stay clean.
export function grade(s, list) {
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const i = activeShot(s, list);
    const kind = list[i]?.kind || 'full';
    if (kind === 'card' || kind === 'paper') return;
    const v = ctx.createRadialGradient(s.cx, s.cy, s.W * 0.5, s.cx, s.cy, s.H * 0.78);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, s.W, s.H);
  });
}

function activeShot(s, list) {
  let k = 0;
  for (let i = 0; i < list.length; i++) if (i === 0 || s.t >= s.time(list[i].at)) k = i;
  return k;
}

// One big italic-serif number over dimmed footage, with a small CAPS unit. items: { at, out, value: '$13.1', unit: 'BILLION', color }
export function stats(s, list) {
  list.forEach((st) => {
    const t0 = s.time(st.at);
    const t1 = st.out === undefined ? t0 + 2.2 : s.time(st.out);
    s.draw({ at: t0, out: t1, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const a = ease(clamp((s.t - t0) / 0.3));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.fillRect(0, 0, s.W, s.H);
      let size = s.W * 0.24;
      ctx.font = `italic 400 ${size}px ${SERIF}`;
      const wv = ctx.measureText(st.value).width;
      if (wv > s.W * 0.8) { size *= (s.W * 0.8) / wv; ctx.font = `italic 400 ${size}px ${SERIF}`; }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = st.color || '#ffffff';
      ctx.fillText(st.value, s.cx, s.H * 0.3 + (1 - a) * size * 0.08);
      if (st.unit) {
        ctx.font = `700 ${s.W * 0.04}px ${SANS}`;
        if ('letterSpacing' in ctx) ctx.letterSpacing = `${s.W * 0.008}px`;
        ctx.fillText(String(st.unit).toUpperCase(), s.cx, s.H * 0.3 + size * 0.62);
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      }
      ctx.restore();
    });
  });
}

// The narration a few words at a time. Words appear as they are spoken and stay until the phrase ends (a sentence end, a
// pause, or `maxWords`). Plain: bold sans, white (black on a white card, white on red). EMPHASIS picks words:
//   { serif: ['Pakistani', 'simple'], red: ['$15,000'], caps: ['Wang'] }   (matched without punctuation, any case)
// o: { y (0.5), size (0.042 of the width), maxChars (24), maxWords (4) }
export function captions(s, list, emphasis = {}, o = {}) {
  const maxChars = o.maxChars ?? 24;
  const maxWords = o.maxWords ?? 4;
  const norm = (w) => w.toLowerCase().replace(/[^a-z0-9$%.-]/g, '');
  const sets = Object.fromEntries(['serif', 'red', 'caps'].map((k) => [k, new Set((emphasis[k] || []).map(norm))]));
  const chunks = [];
  let cur = null;
  for (const w of s.words || []) {
    if (/^['’]/.test(w.text) && cur) {
      const last = cur.w[cur.w.length - 1];
      last.text += w.text.replace(/[.,;:!?"“”]+$/g, '');
      last.end = w.end;
      cur.len += w.text.length;
      cur.raw = w.text;
      continue;
    }
    const shown = w.text.replace(/[.,;:!?"“”]+$/g, '').replace(/^["“”]+/g, '');
    const gap = cur && w.start - cur.w[cur.w.length - 1].end > 0.45;
    if (cur && (cur.len + 1 + shown.length > maxChars || cur.w.length >= maxWords || /[.!?]$/.test(cur.raw) || gap)) { chunks.push(cur); cur = null; }
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
      if (t >= chunks[i].w[0].start - 0.03 && t < (next ? Math.min(next.w[0].start - 0.03, last + 0.6) : last + 0.5)) { c = chunks[i]; break; }
    }
    if (!c) return;
    const shot = list[activeShot(s, list)] || {};
    const bg = shot.kind === 'card' || shot.kind === 'paper' ? shot.bg || (shot.kind === 'paper' ? 'paper' : 'white') : null;
    const onLight = bg === 'white' || bg === 'paper';
    const base = shot.ink === 'red' ? RED : shot.ink === 'black' ? '#0a0a0a' : shot.ink === 'white' ? '#ffffff' : onLight ? '#0a0a0a' : '#ffffff';
    const size = (o.size ?? 0.042) * s.W;
    const shown = c.w.filter((w) => t >= w.start - 0.02);
    if (!shown.length) return;
    const parts = shown.map((w) => {
      const n = norm(w.text);
      const caps = shot.caps || sets.caps.has(n);
      const serif = sets.serif.has(n);
      const red = sets.red.has(n);
      const text = caps ? w.text.toUpperCase() : w.text;
      ctx.font = serif ? `italic 400 ${size * 1.2}px ${SERIF}` : `${caps ? 800 : 700} ${size}px ${SANS}`;
      return { text, serif, caps, red, width: ctx.measureText(text).width };
    });
    // lay out the whole phrase so the line does not shift as words appear
    const full = c.w.map((w) => {
      const n = norm(w.text);
      const serif = sets.serif.has(n);
      const caps = shot.caps || sets.caps.has(n);
      ctx.font = serif ? `italic 400 ${size * 1.2}px ${SERIF}` : `${caps ? 800 : 700} ${size}px ${SANS}`;
      return ctx.measureText(caps ? w.text.toUpperCase() : w.text).width;
    });
    ctx.font = `700 ${size}px ${SANS}`;
    const space = ctx.measureText(' ').width * 0.9;
    const total = full.reduce((a, b) => a + b, 0) + space * (full.length - 1);
    let x = s.cx - total / 2;
    const y = s.H * (shot.captionY ?? o.y ?? 0.5);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    c.w.forEach((w, i) => {
      const p = parts[i];
      if (p) {
        const a = ease(clamp((t - w.start + 0.02) / 0.16));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = p.serif ? `italic 400 ${size * 1.2}px ${SERIF}` : `${p.caps ? 800 : 700} ${size}px ${SANS}`;
        if (!onLight) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = size * 0.4; }
        ctx.fillStyle = p.red ? RED : base;
        ctx.fillText(p.text, x, y + (1 - a) * size * 0.12);
        ctx.restore();
      }
      x += full[i] + space;
    });
  });
}

// Optional last seconds: the photographers' credits on black (only licences that ask for it).
export function creditsCard(s, credits, o = {}) {
  const t0 = o.at === undefined ? Math.max(0, s.dur - 3) : s.time(o.at);
  const seen = new Set();
  const names = [];
  for (const c of credits || []) {
    const line = c.credit === false ? null : `${c.author || 'Unknown'}${c.license && !/^public domain|^cc0/i.test(c.license) ? ` (${c.license})` : ''}`;
    if (line && !seen.has(line)) { seen.add(line); names.push(line); }
  }
  if (!names.length) return;
  s.draw({ at: t0, out: s.dur, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = RED;
    ctx.font = `700 ${s.W * 0.03}px ${SANS}`;
    ctx.fillText('PHOTOS', s.cx, s.H * 0.3);
    ctx.fillStyle = '#fff';
    ctx.font = `600 ${s.W * 0.032}px ${SANS}`;
    names.slice(0, 9).forEach((n, i) => ctx.fillText(n.length > 44 ? `${n.slice(0, 43)}…` : n, s.cx, s.H * 0.37 + i * s.W * 0.05));
  });
}
