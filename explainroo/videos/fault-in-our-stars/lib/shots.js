// Story-shots kit for explainroo: a storyboard of pictures or short clips,
// each with its own camera move, under a few words of caption at a time with
// the spoken word lit up, a title card, and drawn overlays for facts.
//
//   shots(s, SHOTS);            // first: the pictures
//   vignette(s);                // darkens top and bottom a little
//   hook(s, 'BEFORE THE *X*, ...');   // title card with highlighted words
//   compare(s, {...});          // a number board, drawn (never ask an AI picture for numbers)
//   captions(s);                // last: on top of everything
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const FONT = '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
const YELLOW = '#f6e04a';
const BLUE = '#2f8cff';

// zoom 0 -> 1, pan x (fraction of the width), pan y (fraction of the height)
const MOTIONS = {
  push: { z: [1.0, 1.13], x: [0, 0], y: [0, 0] },
  pull: { z: [1.13, 1.0], x: [0, 0], y: [0, 0] },
  panLeft: { z: [1.13, 1.13], x: [0.04, -0.04], y: [0, 0] },
  panRight: { z: [1.13, 1.13], x: [-0.04, 0.04], y: [0, 0] },
  rise: { z: [1.13, 1.13], x: [0, 0], y: [0.03, -0.03] },
  still: { z: [1, 1], x: [0, 0], y: [0, 0] },
};
const lerp = (a, b, p) => a + (b - a) * p;

function textLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [''];
  for (const w of words) {
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
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.25, outDur: 0.25, sfx: false }, (ctx) => {
    const img = s.engine.image(src);
    const p = clamp((s.t - t0) / Math.max(0.1, t1 - t0));
    const z = lerp(m.z[0], m.z[1], p);
    const sc = Math.max(s.W / img.naturalWidth, s.H / img.naturalHeight) * z;
    const w = img.naturalWidth * sc;
    const h = img.naturalHeight * sc;
    ctx.drawImage(img, s.cx - w / 2 + lerp(m.x[0], m.x[1], p) * s.W, s.cy - h / 2 + lerp(m.y[0], m.y[1], p) * s.H, w, h);
  });
}

// What shows while a picture is missing: the shot number and its prompt.
function placeholder(s, shot, i, t0, t1, first) {
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.2, outDur: 0.2, sfx: false }, (ctx) => {
    const hue = (i * 47) % 360;
    const g = ctx.createLinearGradient(0, 0, 0, s.H);
    g.addColorStop(0, `hsl(${hue},38%,22%)`);
    g.addColorStop(1, `hsl(${(hue + 30) % 360},45%,9%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `800 120px ${FONT}`;
    ctx.fillText(`SHOT ${String(shot.n ?? i + 1).padStart(2, '0')}`, s.cx, s.H * 0.24);
    ctx.font = `600 38px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    const lines = textLines(ctx, shot.prompt || '', s.W * 0.78).slice(0, 9);
    lines.forEach((l, k) => ctx.fillText(l, s.cx, s.H * 0.36 + k * 54));
    ctx.fillStyle = YELLOW;
    ctx.font = `700 34px ${FONT}`;
    ctx.fillText(`placeholder: add assets/${shot.file} (.png or .mp4)`, s.cx, s.H * 0.9);
  });
}

// shots: [{ n, at: '#s1' or seconds, file: 'shot01', motion, prompt }]. Each shot runs until the next one starts.
export function shots(s, list) {
  list.forEach((shot, i) => {
    const first = i === 0;
    const t0 = first ? 0 : s.time(shot.at); // the first shot starts at frame 0, so the cover is a picture
    const t1 = i + 1 < list.length ? s.time(list[i + 1].at) + 0.25 : s.dur;
    const found = find(s, shot.file);
    if (!found) placeholder(s, shot, i, t0, t1, first);
    else if (found.kind === 'clip') {
      s.clip(found.src, { x: s.cx, y: s.cy, w: s.W, h: s.H, fit: 'cover', frame: 'none', shadow: false, radius: 0, at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.25, outDur: 0.25, sfx: false, speed: shot.speed ?? 1, from: shot.from ?? 0 });
    } else still(s, found.src, shot.motion, t0, t1, first);
  });
}

// A little darkness at the top and bottom keeps text readable on any picture.
export function vignette(s) {
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const top = ctx.createLinearGradient(0, 0, 0, s.H * 0.32);
    top.addColorStop(0, 'rgba(0,0,0,0.5)');
    top.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, s.W, s.H * 0.32);
    const bot = ctx.createLinearGradient(0, s.H * 0.5, 0, s.H);
    bot.addColorStop(0, 'rgba(0,0,0,0)');
    bot.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = bot;
    ctx.fillRect(0, s.H * 0.5, s.W, s.H * 0.5);
  });
}

function outlined(ctx, text, x, y, size, fill) {
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.17;
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

// Title card near the top: capitals, white, with *starred* words in blue.
export function hook(s, text, o = {}) {
  s.draw({ at: o.at ?? 0.2, out: o.out, enter: 'fade', dur: 0.4, sfx: false }, (ctx) => {
    const size = o.size ?? 56;
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const words = text.toUpperCase().split(' ').map((w) => ({ t: w.replace(/\*/g, ''), hl: false }));
    let on = false;
    text.toUpperCase().split(' ').forEach((raw, i) => {
      if (raw.startsWith('*')) on = true;
      words[i].hl = on;
      if (/\*[,.;:!?]*$/.test(raw)) on = false; // the closing star, even with punctuation after it
    });
    const space = ctx.measureText(' ').width;
    const maxW = s.W * 0.84;
    const lines = [[]];
    let lw = 0;
    for (const w of words) {
      const ww = ctx.measureText(w.t).width;
      if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push({ ...w, w: ww });
      lw += ww + space;
    }
    const y0 = s.H * (o.y ?? 0.2);
    lines.forEach((l, li) => {
      const total = l.reduce((a, w) => a + w.w, 0) + space * (l.length - 1);
      let x = s.cx - total / 2;
      for (const w of l) { outlined(ctx, w.t, x, y0 + li * size * 1.25, size, w.hl ? BLUE : '#ffffff'); x += w.w + space; }
    });
  });
}

// A board with two numbers side by side: the first struck through (set strike: false when both are true), the second lit.
// o: { title, a: { label, value }, b: { label, value }, at, out, y, strike }
export function compare(s, o) {
  s.draw({ at: o.at, out: o.out, enter: 'fade', dur: 0.35, sfx: false }, (ctx, life) => {
    const pop = 0.9 + 0.1 * (life.p ?? 1);
    const w = s.W * 0.82;
    const h = 560;
    ctx.save();
    ctx.translate(s.cx, s.H * (o.y ?? 0.42));
    ctx.scale(pop, pop);
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = 'rgba(22,18,14,0.93)';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 36);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(246,224,74,0.55)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `700 40px ${FONT}`;
    ctx.fillText((o.title || '').toUpperCase(), 0, -h / 2 + 62);
    const row = (item, y, size, color, strike) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = `600 40px ${FONT}`;
      ctx.fillText(item.label, -w / 2 + 56, y);
      const room = w - 112 - ctx.measureText(item.label).width - 40; // what is left for the number
      ctx.font = `800 ${size}px ${FONT}`;
      while (size > 40 && ctx.measureText(item.value).width > room) { size -= 4; ctx.font = `800 ${size}px ${FONT}`; }
      ctx.textAlign = 'right';
      ctx.fillStyle = color;
      ctx.fillText(item.value, w / 2 - 56, y);
      if (strike) {
        const tw = ctx.measureText(item.value).width;
        const p = clamp((life.local - 0.5) / 0.5);
        ctx.strokeStyle = '#ff5a4f';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 56 - tw - 10, y + 6);
        ctx.lineTo(w / 2 - 56 - tw - 10 + (tw + 20) * p, y + 6 - 14 * p);
        ctx.stroke();
      }
    };
    row(o.a, -40, 110, 'rgba(255,255,255,0.7)', o.strike !== false);
    const bp = clamp((life.local - 1.0) / 0.4);
    ctx.globalAlpha *= bp;
    row(o.b, 140, 120, YELLOW, false);
    ctx.restore();
  });
}

// The narration a few words at a time, lower middle; the word being spoken is yellow.
// o: { until (seconds: no captions from here on), maxChars, maxWords, size, y, keepPunctuation }
export function captions(s, o = {}) {
  const maxChars = o.maxChars ?? 17;
  const maxWords = o.maxWords ?? 3;
  const chunks = [];
  let cur = null;
  for (const w of s.words || []) {
    const shown = (o.keepPunctuation ? w.text : w.text.replace(/[.,;:!?"“”]+$/g, '').replace(/^["“”]+/g, ''));
    if (cur && (cur.len + 1 + shown.length > maxChars || cur.w.length >= maxWords || /[.!?]$/.test(cur.raw))) { chunks.push(cur); cur = null; }
    if (!cur) cur = { w: [], len: 0, raw: '' };
    cur.w.push({ text: shown, start: w.start, end: w.end });
    cur.len += (cur.len ? 1 : 0) + shown.length;
    cur.raw = w.text;
  }
  if (cur) chunks.push(cur);
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const t = s.t;
    if (o.until !== undefined && t >= o.until) return; // stop the captions here (for example where the takeaways start)
    let c = null;
    for (let i = 0; i < chunks.length; i++) {
      const first = chunks[i].w[0].start;
      const next = chunks[i + 1];
      const last = chunks[i].w[chunks[i].w.length - 1].end;
      if (t >= first - 0.04 && t < (next ? next.w[0].start - 0.04 : last + 0.5)) { c = chunks[i]; break; }
    }
    if (!c) return;
    const size = o.size ?? 64;
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const space = ctx.measureText(' ').width;
    const widths = c.w.map((w) => ctx.measureText(w.text).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (c.w.length - 1);
    let x = s.cx - total / 2;
    const y = s.H * (o.y ?? 0.7);
    c.w.forEach((w, i) => {
      const lit = t >= w.start - 0.02 && t < w.end + 0.1;
      outlined(ctx, w.text, x, y, size, lit ? YELLOW : '#ffffff');
      x += widths[i] + space;
    });
  });
}
