// Founder-story kit for explainroo: a documentary-style video made of REAL photographs. Slow Ken Burns moves
// with soft cross-dissolves, a name and date plate, a stat callout, a quote card, clean word-lit captions and an
// end card that credits the photographers. No stickers, no drawings, no AI pictures of real people.
//
//   photos(s, SHOTS);                 // first: the photographs (they dissolve into each other)
//   grade(s);                         // a soft vignette and a dark foot for the captions
//   hook(s, 'He was fired at thirty', { out: '#s2' });
//   labels(s, LABELS);                // name, year and place plates, chapter titles
//   stats(s, STATS);                  // a big number with a short line under it
//   quotes(s, QUOTES);                // the founder's own words, with who and when
//   captions(s);                      // the narration, 3 or 4 words at a time, the spoken word lit in gold
//   creditsCard(s, CREDITS);          // last: "Photos: ..." for the licences that ask for credit
//
// A shot: { n, at: '#s1', file: 'shot01', query, motion, focus: [x, y], fit }.
//   motion: push | pull | panLeft | panRight | rise | still   (slow: the picture never moves more than about 9%)
//   focus:  [0..1, 0..1] where the face or the subject is in the photo; the crop of a landscape photo follows it
//   fit:    'cover' (default: fill the frame) | 'fit' (the whole photo, on a blurred copy of itself)
//   sweep:  'right' | 'left': for a very wide photo (a panorama), a slow pan across it instead of the usual move
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = (p) => p * p * (3 - 2 * p);
const SANS = '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
const SERIF = '"Playfair Display", Georgia, serif';
const GOLD = '#f0c978';
const XFADE = 0.45; // seconds one photograph takes to dissolve into the next
const MAX_SHOT = 4; // seconds: no photograph stays on screen longer than this (the viewer gets bored); photos(s, list, { maxShot }) changes it
const CREDITS_SECONDS = 3.4; // the credits card covers the end of the last photograph (see creditsCard)

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

// A heavily blurred, darkened copy of a photo for the bars around a 'fit' photo. Made once per picture
// (drawing a tiny copy and scaling it up is a cheap blur), then reused for every frame.
const blurred = new Map();
function blurredCopy(img, key, W, H) {
  if (blurred.has(key)) return blurred.get(key);
  const w = 48;
  const h = Math.max(8, Math.round((w * H) / W));
  const small = document.createElement('canvas');
  small.width = w; small.height = h;
  const g = small.getContext('2d');
  const sc = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  g.drawImage(img, (w - img.naturalWidth * sc) / 2, (h - img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc);
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.fillRect(0, 0, w, h);
  blurred.set(key, small);
  return small;
}

function placeholder(s, shot, i, t0, t1, first) {
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: XFADE, outDur: XFADE, sfx: false }, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, s.H);
    g.addColorStop(0, `hsl(${(i * 29 + 200) % 360},18%,17%)`);
    g.addColorStop(1, 'hsl(30,20%,6%)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `700 ${s.W * 0.1}px ${SERIF}`;
    ctx.fillText(`PHOTO ${String(shot.n ?? i + 1).padStart(2, '0')}`, s.cx, s.H * 0.22);
    ctx.font = `600 ${s.W * 0.036}px ${SANS}`;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    wrap(ctx, shot.query || shot.note || '', s.W * 0.78).slice(0, 8).forEach((l, k) => ctx.fillText(l, s.cx, s.H * 0.32 + k * s.W * 0.052));
    ctx.fillStyle = GOLD;
    ctx.fillText(`run scripts/find-photos.mjs to add assets/${shot.file}.jpg`, s.cx, s.H * 0.88);
  });
}

// Every photograph runs until the next one starts (and dissolves into it); the first starts at frame 0.
// A photograph may not stay longer than 4 seconds (o.maxShot): when one does, this stops with a list of the shots to
// split, so put another [#marker] and another shot in the middle of that stretch of narration (a new photo, or the
// same subject from another side). Video clips (.mp4) are not limited.
export function photos(s, list, o = {}) {
  const maxShot = o.maxShot ?? MAX_SHOT;
  const tooLong = [];
  list.forEach((shot, i) => {
    const first = i === 0;
    const t0 = first ? 0 : s.time(shot.at);
    const t1 = i + 1 < list.length ? s.time(list[i + 1].at) + XFADE : s.dur;
    const found = findAsset(s, shot.file);
    if (found?.kind !== 'clip') {
      const shown = (i + 1 < list.length ? s.time(list[i + 1].at) : s.dur - CREDITS_SECONDS) - t0;
      if (shown > maxShot + 0.05) tooLong.push(`shot ${shot.n ?? i + 1} (${shot.at}) is on screen ${shown.toFixed(1)} s`);
    }
    if (!found) { placeholder(s, shot, i, t0, t1, first); return; }
    if (found.kind === 'clip') {
      s.clip(found.src, { x: s.cx, y: s.cy, w: s.W, h: s.H, fit: 'cover', frame: 'none', shadow: false, radius: 0, at: t0, out: t1, enter: first ? 'none' : 'fade', dur: XFADE, outDur: XFADE, sfx: false, speed: shot.speed ?? 1, from: shot.from ?? 0 });
      return;
    }
    const m = MOTIONS[shot.motion] || MOTIONS.push;
    const [fx, fy] = shot.focus || [0.5, 0.4];
    s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: XFADE, outDur: XFADE, sfx: false }, (ctx) => {
      const img = s.engine.image(found.src);
      const p = ease(clamp((s.t - t0) / Math.max(0.1, t1 - t0)));
      const z = lerp(m.z[0], m.z[1], p);
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (shot.fit === 'fit') {
        ctx.drawImage(blurredCopy(img, found.src, s.W, s.H), 0, 0, s.W, s.H);
        const sc = (s.W / iw) * (1 + (z - 1) * 0.6);
        const w = iw * sc;
        const h = ih * sc;
        ctx.drawImage(img, (s.W - w) / 2 + lerp(m.x[0], m.x[1], p) * s.W * 0.5, s.H * 0.44 - h / 2, w, h);
        return;
      }
      const sw = shot.sweep ? 1 : 0;
      const sc = Math.max(s.W / iw, s.H / ih) * (sw ? 1.02 : z);
      const w = iw * sc;
      const h = ih * sc;
      if (sw) {
        // a panorama: travel about one frame width across it, around the focus point, never faster than that
        const reach = Math.max(0, w - s.W);
        const travel = Math.min(reach, s.W * 0.9);
        const start = clamp(fx * w - s.W / 2 - travel / 2, 0, reach - travel);
        const left0 = shot.sweep === 'left' ? start + travel : start;
        const left = left0 + (shot.sweep === 'left' ? -travel : travel) * p;
        ctx.drawImage(img, -left, -clamp(fy * h - s.H * 0.42, 0, Math.max(0, h - s.H)), w, h);
        return;
      }
      // crop around the subject: put the focus point near the middle (a little above it for faces), then add the slow move
      const left = clamp(fx * w - s.W / 2 - lerp(m.x[0], m.x[1], p) * s.W, 0, Math.max(0, w - s.W));
      const top = clamp(fy * h - s.H * 0.42 - lerp(m.y[0], m.y[1], p) * s.H, 0, Math.max(0, h - s.H));
      ctx.drawImage(img, -left, -top, w, h);
    });
  });
  if (tooLong.length) throw new Error(`founder-story: a photograph may stay on screen ${maxShot} seconds at most, but ${tooLong.join('; ')}. Add a [#marker] about every ${maxShot} seconds in script.md (roughly every 9 to 10 words) and a shot for it in shots.js.`);
}

// Dark edges, and a dark foot where the captions sit.
export function grade(s) {
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const v = ctx.createRadialGradient(s.cx, s.cy, s.W * 0.4, s.cx, s.cy, s.H * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, s.W, s.H);
    const top = ctx.createLinearGradient(0, 0, 0, s.H * 0.28);
    top.addColorStop(0, 'rgba(0,0,0,0.38)');
    top.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, s.W, s.H * 0.28);
    const bot = ctx.createLinearGradient(0, s.H * 0.5, 0, s.H);
    bot.addColorStop(0, 'rgba(0,0,0,0)');
    bot.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = bot;
    ctx.fillRect(0, s.H * 0.5, s.W, s.H * 0.5);
  });
}

// The opening line near the top, in the serif: sentence case, a soft shadow. It fades at `out`.
// o: { at (0.15), out, y (0.2), size (0.072 of the width) }
export function hook(s, text, o = {}) {
  const t0 = o.at ?? 0.15;
  const t1 = o.out === undefined ? t0 + 3.2 : s.time(o.out);
  s.draw({ at: t0, out: t1 + 0.5, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
    const a = clamp((s.t - t0) / 0.5) * (1 - clamp((s.t - t1) / 0.45));
    if (a <= 0) return;
    const size = (o.size ?? 0.072) * s.W;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `700 ${size}px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrap(ctx, text, s.W * 0.84);
    const y0 = s.H * (o.y ?? 0.2) - ((lines.length - 1) * size * 1.2) / 2 + (1 - ease(clamp((s.t - t0) / 0.6))) * size * 0.25;
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = size * 0.4;
    ctx.fillStyle = '#ffffff';
    lines.forEach((ln, i) => ctx.fillText(ln, s.cx, y0 + i * size * 1.2));
    ctx.restore();
  });
}

// A plate at the top left: a small gold kicker (a year, a chapter number, a place) over a name or a title in the serif.
// list items: { at, out, kicker: '1976', text: 'Los Altos, California' }
export function labels(s, list) {
  list.forEach((l) => {
    const t0 = s.time(l.at);
    const t1 = l.out === undefined ? t0 + 3 : s.time(l.out);
    s.draw({ at: t0, out: t1 + 0.5, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const a = ease(clamp((s.t - t0) / 0.45)) * (1 - ease(clamp((s.t - t1) / 0.4)));
      if (a <= 0) return;
      const x = s.W * 0.075;
      const y = s.H * 0.105 + (1 - ease(clamp((s.t - t0) / 0.5))) * s.W * 0.018;
      const kick = s.W * 0.03;
      const size = s.W * 0.066;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = size * 0.35;
      ctx.fillStyle = GOLD;
      ctx.fillRect(x, y - kick * 1.9, s.W * 0.1 * ease(clamp((s.t - t0) / 0.6)), Math.max(2, s.W * 0.003));
      ctx.font = `600 ${kick}px ${SANS}`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${kick * 0.14}px`;
      ctx.fillText(String(l.kicker || '').toUpperCase(), x, y);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${size}px ${SERIF}`;
      wrap(ctx, l.text || '', s.W * 0.82).forEach((ln, i) => ctx.fillText(ln, x, y + size * 1.15 + i * size * 1.12));
      ctx.restore();
    });
  });
}

// A big number over the dimmed photograph, with a short line under it. list items: { at, out, value: '$429 million', label: 'Apple buys NeXT' }
export function stats(s, list) {
  list.forEach((st) => {
    const t0 = s.time(st.at);
    const t1 = st.out === undefined ? t0 + 3 : s.time(st.out);
    s.draw({ at: t0, out: t1 + 0.5, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const a = ease(clamp((s.t - t0) / 0.5)) * (1 - ease(clamp((s.t - t1) / 0.4)));
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, s.W, s.H);
      let size = s.W * 0.17;
      ctx.font = `800 ${size}px ${SERIF}`;
      const widest = ctx.measureText(st.value).width;
      if (widest > s.W * 0.86) { size *= (s.W * 0.86) / widest; ctx.font = `800 ${size}px ${SERIF}`; }
      const pop = 0.94 + 0.06 * ease(clamp((s.t - t0) / 0.6));
      ctx.translate(s.cx, s.H * 0.4);
      ctx.scale(pop, pop);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = size * 0.3;
      ctx.fillStyle = GOLD;
      ctx.fillText(st.value, 0, 0);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${s.W * 0.045}px ${SANS}`;
      wrap(ctx, st.label || '', s.W * 0.78).forEach((ln, i) => ctx.fillText(ln, 0, size * 0.78 + i * s.W * 0.06));
      ctx.restore();
    });
  });
}

// The founder's own words, set in the serif over the dimmed photograph. list items: { at, out, text, by: 'Steve Jobs, Stanford, 2005' }
export function quotes(s, list) {
  list.forEach((q) => {
    const t0 = s.time(q.at);
    const t1 = q.out === undefined ? t0 + 5 : s.time(q.out);
    s.draw({ at: t0, out: t1 + 0.6, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const a = ease(clamp((s.t - t0) / 0.6)) * (1 - ease(clamp((s.t - t1) / 0.5)));
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(0, 0, s.W, s.H);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = GOLD;
      ctx.font = `700 ${s.W * 0.22}px ${SERIF}`;
      ctx.fillText('“', s.cx, s.H * 0.215);
      const size = s.W * 0.055;
      ctx.font = `italic 600 ${size}px ${SERIF}`;
      ctx.fillStyle = '#ffffff';
      const lines = wrap(ctx, q.text, s.W * 0.8);
      const y0 = s.H * 0.4 - ((lines.length - 1) * size * 1.4) / 2;
      lines.forEach((ln, i) => ctx.fillText(ln, s.cx, y0 + i * size * 1.4));
      ctx.fillStyle = GOLD;
      ctx.font = `600 ${s.W * 0.03}px ${SANS}`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${s.W * 0.004}px`;
      ctx.fillText(String(q.by || '').toUpperCase(), s.cx, y0 + lines.length * size * 1.4 + size * 0.5);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.restore();
    });
  });
}

// The narration three or four words at a time, sentence case; the word being spoken is lit in gold.
// o: { y (0.7), size (0.064 of the width), maxChars (22), maxWords (4), from, until }
export function captions(s, o = {}) {
  const maxChars = o.maxChars ?? 22;
  const maxWords = o.maxWords ?? 4;
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
    const shown = w.text.replace(/[.,;:!?"“”]+$/g, '').replace(/^["“”]+/g, '');
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
    const size = (o.size ?? 0.064) * s.W;
    ctx.font = `600 ${size}px ${SANS}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const space = ctx.measureText(' ').width;
    const widths = c.w.map((w) => ctx.measureText(w.text).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (c.w.length - 1);
    let x = s.cx - total / 2;
    const y = s.H * (o.y ?? 0.7);
    c.w.forEach((w, i) => {
      const lit = t >= w.start - 0.02 && t < w.end + 0.1;
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = size * 0.35;
      ctx.lineWidth = size * 0.14;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(w.text, x, y);
      ctx.shadowBlur = 0;
      ctx.fillStyle = lit ? GOLD : '#ffffff';
      ctx.fillText(w.text, x, y);
      x += widths[i] + space;
    });
  });
}

// The last seconds: the photographs' credits on black. `credits` is the list that scripts/find-photos.mjs writes to
// credits.js ({ author, license, ... }). o: { at (3.4 seconds before the end), heading ('Photos') }
export function creditsCard(s, credits, o = {}) {
  const t0 = o.at === undefined ? Math.max(0, s.dur - 3.4) : s.time(o.at);
  const seen = new Set();
  const names = [];
  for (const c of credits || []) {
    const line = c.credit === false ? null : `${c.author || 'Unknown'}${c.license && !/^public domain|^cc0/i.test(c.license) ? ` (${c.license})` : ''}`;
    if (line && !seen.has(line)) { seen.add(line); names.push(line); }
  }
  s.draw({ at: t0, out: s.dur, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
    const a = ease(clamp((s.t - t0) / 0.7));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,0,0,0.86)';
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = GOLD;
    ctx.font = `600 ${s.W * 0.034}px ${SANS}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${s.W * 0.006}px`;
    ctx.fillText(String(o.heading ?? 'Photos').toUpperCase(), s.cx, s.H * 0.3);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${s.W * 0.034}px ${SANS}`;
    const shown = names.slice(0, 9);
    shown.forEach((n, i) => ctx.fillText(n.length > 44 ? `${n.slice(0, 43)}…` : n, s.cx, s.H * 0.37 + i * s.W * 0.052));
    if (names.length > shown.length) ctx.fillText(`and ${names.length - shown.length} more, listed in the description`, s.cx, s.H * 0.37 + shown.length * s.W * 0.052);
    ctx.restore();
  });
}
