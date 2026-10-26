// Tech-explainer kit for explainroo: neon outlines on charcoal in one accent color, one idea at a time.
//
//   const k = kit(s);                              // or kit(s, { palette: 'orange' }): green, cyan, blue, purple, pink, orange, yellow, red
//   k.title('API', { y: 0.2, wave: true });        // big title, letters bounce in
//   k.tag('[API] menu', { id: 'api', x: .5, y: .4, at: '#s2', icon: 'db' });
//   k.phone({ id: 'app', x: .5, y: .2, app: 'Weather[App]', rows: [{ text: 'Oslo: 18°C', at: '#s1' }] });
//   k.code(['"status": 200'], { x: .5, y: .5, at: '#s8' });
//   k.link('app', 'api', { pair: true, at: '#s2' });  // dashed request and response lines
//   k.tap({ x: .5, y: .3, at: 'press' });
//   k.pic('server', { id: 'srv', x: .5, y: .3, w: .4, at: '#s2', label: 'Server' });   // a real picture pops in (assets/server.jpg)
//   k.link('app', 'srv', { pair: true, label: 'API', block: true, at: '#s2' });         // the code draws the connection
//   k.sticker('rocket', { x: .85, y: .1, at: '#s2', color: 'yellow', rotate: 8 });   // a die-cut sticker pops in
//   k.sticker('bug', { label: 'BUG!', x: .15, y: .6, shape: 'burst', from: 'slap' });
//
// Positions x and y are fractions: x of the safe width, y of the content band
// (the top part of the safe area; the bottom third stays free for app buttons).
// Every call takes `at` (seconds, a spoken word or a '#marker') and `out`.
// Text markup: [text] is a solid accent-colored block with dark text, *text* is accent-colored text.
// Call the kit's functions in the order you want them stacked (later is on top).

import { pictureFor } from './pic.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const inOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const backOut = (p) => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };

// One accent color does all the work: strokes, icons, highlight blocks and *accent text*. `key` is the second
// color, used only for the keys in code cards, so pick one that contrasts with the accent.
export const PALETTES = {
  green: { accent: '#00ef5d', key: '#e0185f' },
  cyan: { accent: '#00d4ff', key: '#ff4d8d' },
  blue: { accent: '#3d8bff', key: '#ffc247' },
  purple: { accent: '#a970ff', key: '#ffd166' },
  pink: { accent: '#ff3d9a', key: '#3de0c8' },
  orange: { accent: '#ff8a1f', key: '#4cc9ff' },
  yellow: { accent: '#ffd60a', key: '#ff5d8f' },
  red: { accent: '#ff4d4d', key: '#ffd166' },
};
export const COLORS = { bg: '#1a1a1a', accent: '#00ef5d', key: '#e0185f', ink: '#ffffff', muted: '#9aa39d', dark: '#101010' };

const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgba = (hex, a) => { const [r, g, b] = rgb(hex); return `rgba(${r},${g},${b},${a})`; };
const mixHex = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(lerp(v, rgb(b)[i], t)).toString(16).padStart(2, '0')).join('');
function setPalette(p = 'green') {
  const pal = typeof p === 'string' ? PALETTES[p] : p;
  if (!pal || !/^#[0-9a-f]{6}$/i.test(pal.accent || '')) throw new Error(`palette must be one of ${Object.keys(PALETTES).join(', ')} or { accent: '#rrggbb', key: '#rrggbb' }`);
  COLORS.accent = pal.accent;
  COLORS.key = pal.key || PALETTES.green.key;
}
const FONT = '"Outfit", "Plus Jakarta Sans", sans-serif';
const MONO = '"JetBrains Mono", monospace';

// ---------- text with markup ----------

function parse(str) {
  return String(str).split(/(\[[^\]]+\]|\*[^*]+\*)/).filter(Boolean).map((t) => {
    if (t[0] === '[' && t.endsWith(']')) return { t: t.slice(1, -1), kind: 'block' };
    if (t[0] === '*' && t.endsWith('*') && t.length > 2) return { t: t.slice(1, -1), kind: 'accent' };
    return { t, kind: 'plain' };
  });
}

function richWidth(ctx, str, size) {
  return parse(str).reduce((w, seg) => w + ctx.measureText(seg.t).width + (seg.kind === 'block' ? size * 0.36 : 0), 0);
}

// Draws marked-up text on one line. align: 'left' (x is the left edge) or 'center'.
function rich(ctx, str, x, y, size, o = {}) {
  ctx.font = `${o.weight ?? 800} ${size}px ${o.font ?? FONT}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const total = richWidth(ctx, str, size);
  let cx = o.align === 'center' ? x - total / 2 : x;
  for (const seg of parse(str)) {
    const w = ctx.measureText(seg.t).width;
    if (seg.kind === 'block') {
      const pad = size * 0.18;
      ctx.fillStyle = COLORS.accent;
      ctx.beginPath();
      ctx.roundRect(cx, y - size * 0.62, w + pad * 2, size * 1.24, size * 0.16);
      ctx.fill();
      ctx.fillStyle = COLORS.dark;
      ctx.fillText(seg.t, cx + pad, y + size * 0.03);
      cx += w + pad * 2;
    } else {
      ctx.fillStyle = seg.kind === 'accent' ? COLORS.accent : (o.color ?? COLORS.ink);
      ctx.fillText(seg.t, cx, y + size * 0.03);
      cx += w;
    }
  }
  return total;
}

function wrap(ctx, str, maxW, size) {
  const out = [];
  let line = '';
  for (const word of String(str).split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (richWidth(ctx, test, size) > maxW && line) { out.push(line); line = word; } else line = test;
  }
  if (line) out.push(line);
  return out;
}

// ---------- shapes and icons ----------

function roundBox(ctx, x, y, w, h, r, o = {}) {
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw ?? 4; ctx.stroke(); }
}

const ICONS = {
  // stacked disks
  db(ctx, x, y, s) {
    ctx.fillStyle = COLORS.accent;
    for (let k = 0; k < 3; k++) {
      const cy = y - s * 0.3 + k * s * 0.3;
      ctx.beginPath();
      ctx.ellipse(x, cy, s * 0.46, s * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.bg;
      ctx.lineWidth = s * 0.05;
      ctx.stroke();
    }
    ctx.fillRect(x - s * 0.46, y - s * 0.3, s * 0.92, s * 0.6);
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.ellipse(x, y - s * 0.3 + k * s * 0.3, s * 0.46, s * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.bg;
      ctx.lineWidth = s * 0.05;
      ctx.stroke();
    }
  },
  // two server units with lights
  server(ctx, x, y, s) {
    for (let k = 0; k < 2; k++) {
      const cy = y + (k - 0.5) * s * 0.52;
      roundBox(ctx, x, cy, s * 0.95, s * 0.42, s * 0.08, { stroke: COLORS.accent, lw: s * 0.07 });
      ctx.fillStyle = COLORS.accent;
      ctx.beginPath(); ctx.arc(x - s * 0.33, cy, s * 0.045, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - s * 0.18, cy - s * 0.03, s * 0.42, s * 0.06);
    }
  },
  cloud(ctx, x, y, s) {
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.arc(x - s * 0.22, y + s * 0.05, s * 0.2, 0, Math.PI * 2);
    ctx.arc(x + s * 0.02, y - s * 0.12, s * 0.27, 0, Math.PI * 2);
    ctx.arc(x + s * 0.27, y + s * 0.06, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - s * 0.22, y + s * 0.05, s * 0.49, s * 0.2);
  },
  user(ctx, x, y, s) {
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y + s * 0.5, s * 0.42, Math.PI, 0); ctx.fill();
  },
  lock(ctx, x, y, s) {
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = s * 0.1;
    ctx.beginPath(); ctx.arc(x, y - s * 0.12, s * 0.22, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath(); ctx.roundRect(x - s * 0.34, y - s * 0.12, s * 0.68, s * 0.5, s * 0.08); ctx.fill();
    ctx.fillStyle = COLORS.bg;
    ctx.beginPath(); ctx.arc(x, y + s * 0.1, s * 0.07, 0, Math.PI * 2); ctx.fill();
  },
  bolt(ctx, x, y, s) {
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.1, y - s * 0.5); ctx.lineTo(x - s * 0.3, y + s * 0.08); ctx.lineTo(x - s * 0.03, y + s * 0.08);
    ctx.lineTo(x - s * 0.12, y + s * 0.5); ctx.lineTo(x + s * 0.3, y - s * 0.12); ctx.lineTo(x + s * 0.03, y - s * 0.12);
    ctx.closePath(); ctx.fill();
  },
  check(ctx, x, y, s) {
    ctx.strokeStyle = COLORS.accent; ctx.lineWidth = s * 0.14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x - s * 0.3, y); ctx.lineTo(x - s * 0.08, y + s * 0.24); ctx.lineTo(x + s * 0.32, y - s * 0.22); ctx.stroke();
  },
  phone(ctx, x, y, s) {
    roundBox(ctx, x, y, s * 0.55, s * 0.95, s * 0.1, { stroke: COLORS.accent, lw: s * 0.08 });
    ctx.fillStyle = COLORS.accent; ctx.fillRect(x - s * 0.1, y - s * 0.36, s * 0.2, s * 0.05);
  },
  // an arrow trending up, the app logo in the reference
  trend(ctx, x, y, s) {
    ctx.strokeStyle = COLORS.accent; ctx.lineWidth = s * 0.1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x - s * 0.4, y + s * 0.25); ctx.lineTo(x - s * 0.1, y - s * 0.05); ctx.lineTo(x + s * 0.08, y + s * 0.12); ctx.lineTo(x + s * 0.4, y - s * 0.25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + s * 0.18, y - s * 0.25); ctx.lineTo(x + s * 0.4, y - s * 0.25); ctx.lineTo(x + s * 0.4, y - s * 0.03); ctx.stroke();
  },
};


// ---------- stickers: die-cut vector badges with a white edge ----------

// Colors a sticker can use. 'accent' and 'key' follow the palette; any '#rrggbb' also works.
const STICKER_COLORS = {
  yellow: '#ffd60a', pink: '#ff4fa3', cyan: '#27d3ff', orange: '#ff8a1f', purple: '#a970ff', red: '#ff4d4d', blue: '#3d8bff', white: '#ffffff',
};
function stickerColor(c = 'accent') {
  if (c === 'accent') return COLORS.accent;
  if (c === 'key') return COLORS.key;
  if (STICKER_COLORS[c]) return STICKER_COLORS[c];
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  throw new Error(`sticker color "${c}" must be accent, key, ${Object.keys(STICKER_COLORS).join(', ')} or '#rrggbb'`);
}
const luminance = (hex) => { const [r, g, b] = rgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

// The outline of a sticker shape, centered on 0,0, as a path on ctx. r is the radius (half the width).
function stickerShape(ctx, shape, r, w = r * 2) {
  ctx.beginPath();
  if (shape === 'square') ctx.roundRect(-r, -r, r * 2, r * 2, r * 0.34);
  else if (shape === 'pill') ctx.roundRect(-w / 2, -r, w, r * 2, r);
  else if (shape === 'burst') {
    const n = 14;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      const rad = i % 2 ? r * 0.8 : r;
      ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
  } else ctx.arc(0, 0, r, 0, Math.PI * 2);
}

// ---------- the kit ----------

export function kit(s, opts = {}) {
  setPalette(opts.palette ?? 'green'); // a name from PALETTES or { accent, key }
  const u = s.W / 100; // one unit: 1% of the frame width
  const band = opts.band ?? 0.72; // share of the safe height used for content
  const reg = new Map(); // id -> box, filled while drawing, read by link()
  const T = (v, d = 0) => s.time(v) + d;
  const X = (f) => s.safe.x + f * s.safe.w;
  const Y = (f) => s.safe.y + f * s.safe.h * band;

  // Where an element is now: its x, y and any scheduled moves [{ at, x, y, dur }].
  function place(o) {
    let x = o.x ?? 0.5;
    let y = o.y ?? 0.3;
    for (const m of o.move || []) {
      const p = inOut(clamp((s.t - s.time(m.at)) / (m.dur ?? 0.8)));
      const fx = x; const fy = y;
      x = lerp(fx, m.x ?? fx, p);
      y = lerp(fy, m.y ?? fy, p);
    }
    return { x: X(x), y: Y(y) };
  }

  // Wraps s.draw: timing, a quick fade, a pop and a sound. fn(ctx, { p, pop, x, y, alpha }).
  function item(o, fn) {
    const at = T(o.at ?? 0);
    const out = o.out === undefined ? undefined : T(o.out);
    const first = at <= 0.05; // already there at frame 0, so the cover frame is not empty
    s.draw({ at, out, enter: first ? 'none' : 'fade', dur: o.dur ?? 0.22, outDur: 0.25, sfx: o.sfx === false ? null : (o.sfx ?? 'pop') }, (ctx, life) => {
      const pos = place(o);
      const pop = o.pop === false || first ? 1 : lerp(0.88, 1, clamp(backOut(life.p), 0, 1.15));
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.scale(pop, pop);
      fn(ctx, { life, p: life.p, x: pos.x, y: pos.y });
      ctx.restore();
    });
  }

  const api = {
    u, T, X, Y,

    // A rounded outline box with a label. o: { id, x, y, at, out, size, icon, w, color, white, caps, move }
    tag(label, o = {}) {
      item(o, (ctx, { x, y }) => {
        let size = (o.size ?? 8) * u;
        const text = o.caps === false ? label : label.toUpperCase();
        ctx.font = `800 ${size}px ${FONT}`;
        // a label wider than the safe area shrinks until it fits
        const natural = richWidth(ctx, text, size) + (o.icon ? size * 1.25 : 0) + size * 1.24;
        if (!o.w && natural > s.safe.w * 0.96) size *= (s.safe.w * 0.96) / natural;
        ctx.font = `800 ${size}px ${FONT}`;
        const textW = richWidth(ctx, text, size);
        const iconW = o.icon ? size * 1.25 : 0;
        const padX = size * 0.62;
        const w = o.w ? o.w * s.safe.w : textW + iconW + padX * 2;
        const h = size * 1.0 + size * 0.84;
        roundBox(ctx, 0, 0, w, h, size * 0.34, { stroke: o.color ?? COLORS.accent, lw: Math.max(3, u * 0.45), fill: o.fill });
        const startX = -w / 2 + (w - textW - iconW) / 2;
        rich(ctx, text, startX, 0, size, { color: o.white ? COLORS.ink : COLORS.accent });
        if (o.icon && ICONS[o.icon]) ICONS[o.icon](ctx, startX + textW + size * 0.7, 0, size * 0.95);
        if (o.id) reg.set(o.id, { x, y, w, h });
      });
    },

    // A big title. wave: letters bounce in one after another.
    title(text, o = {}) {
      item({ ...o, sfx: o.sfx ?? false }, (ctx, { life }) => {
        const size = (o.size ?? 24) * u;
        ctx.font = `800 ${size}px ${FONT}`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        const str = o.caps === false ? text : text.toUpperCase();
        const widths = [...str].map((ch) => ctx.measureText(ch).width);
        const total = widths.reduce((a, b) => a + b, 0);
        let cx = -total / 2;
        const head = T(o.at ?? 0) <= 0.05 ? 0.7 : 0; // already shown at frame 0 (the cover): start the bounce a little in
        [...str].forEach((ch, i) => {
          const local = life.local + head - i * 0.07;
          const drop = o.wave === false ? 0 : (1 - backOut(clamp(local / 0.45))) * -size * 0.5;
          const bounce = o.wave === false ? 0 : Math.sin(life.local * 5 - i * 0.9) * size * 0.04 * clamp(1 - (life.local - 1.2) / 1.5);
          ctx.globalAlpha = clamp(local / 0.2);
          ctx.fillStyle = o.color ?? COLORS.accent;
          ctx.fillText(ch, cx, drop + bounce);
          cx += widths[i];
        });
        ctx.globalAlpha = 1;
      });
    },

    // Lines of text that blur in one after another. Use [x] and *x* inside.
    lines(list, o = {}) {
      list.forEach((line, i) => {
        item({ ...o, at: T(o.at ?? 0, i * (o.stagger ?? 0.45)), y: (o.y ?? 0.3) + i * (o.gap ?? 0.07), sfx: o.sfx ?? false, pop: false }, (ctx, { p }) => {
          const size = (o.size ?? 8.5) * u;
          if (p < 1) ctx.filter = `blur(${(1 - p) * 9}px)`;
          rich(ctx, line, o.left ? -s.safe.w * 0.4 : 0, 0, size, { align: o.left ? 'left' : 'center', weight: o.weight ?? 700 });
          ctx.filter = 'none';
        });
      });
    },

    // The app card from the reference: a notch, a logo with the app name, rows of text.
    // rows: [{ text, meta, at }]  picture: true or an assets/ path
    phone(o = {}) {
      item(o, (ctx, { x, y }) => {
        const w = (o.w ?? 0.8) * s.safe.w;
        const h = (o.h ?? 0.4) * s.safe.w * 1.5;
        roundBox(ctx, 0, 0, w, h, u * 2.2, { stroke: COLORS.accent, lw: Math.max(3, u * 0.36), fill: COLORS.bg });
        // notch
        ctx.fillStyle = COLORS.accent;
        ctx.beginPath(); ctx.roundRect(-w * 0.09, -h / 2 - 1, w * 0.18, u * 1.9, [0, 0, u, u]); ctx.fill();
        ctx.fillStyle = COLORS.bg; ctx.beginPath(); ctx.arc(0, -h / 2 + u * 0.8, u * 0.4, 0, Math.PI * 2); ctx.fill();
        // header
        const hy = -h / 2 + u * 8.6;
        const hs = u * 5.2;
        ctx.font = `800 ${hs}px ${FONT}`;
        const nameW = richWidth(ctx, o.app ?? 'App', hs);
        const iconS = hs * 1.15;
        const left = -(nameW + iconS * 1.1) / 2;
        ICONS.trend(ctx, left + iconS / 2, hy, iconS);
        rich(ctx, o.app ?? 'App', left + iconS * 1.1, hy, hs);
        // rows
        let ry = hy + u * 8.2;
        for (const r of o.rows || []) {
          const rat = T(r.at ?? o.at ?? 0);
          const a = clamp((s.t - rat) / 0.25);
          if (a <= 0) continue;
          ctx.globalAlpha = a;
          const size = (r.size ?? 4.8) * u;
          ctx.font = `800 ${size}px ${FONT}`;
          const lines = r.text ? wrap(ctx, r.text, w * 0.84, size) : [];
          const lx = -w * 0.42;
          lines.forEach((ln, i) => rich(ctx, ln, lx, ry + i * size * 1.28, size, { align: 'left' }));
          if (r.meta) rich(ctx, `*${r.meta}*`, lx, ry + lines.length * size * 1.28 + (lines.length ? 0 : 0), size * 0.78, { align: 'left', weight: 700 });
          ry += Math.max(1, lines.length) * size * 1.28 + (r.meta ? size * 1.1 : size * 0.3);
          ctx.globalAlpha = 1;
        }
        if (o.picture) {
          const pat = T(o.pictureAt ?? o.at ?? 0);
          const a = clamp((s.t - pat) / 0.3);
          if (a > 0) {
            ctx.globalAlpha = a;
            const pw = w * 0.84;
            const px = -pw / 2; const py = h / 2 - u * 3 - u * 16;
            ctx.save();
            ctx.beginPath(); ctx.roundRect(px, py, pw, u * 16, u * 1.2); ctx.clip();
            const src = typeof o.picture === 'string' ? o.picture : null;
            if (src && s.engine.images.has(src)) {
              const img = s.engine.image(src);
              const sc = Math.max(pw / img.naturalWidth, (u * 16) / img.naturalHeight);
              ctx.drawImage(img, px + pw / 2 - (img.naturalWidth * sc) / 2, py + u * 8 - (img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc);
            } else {
              const g = ctx.createLinearGradient(px, py, px + pw, py + u * 16);
              g.addColorStop(0, mixHex(COLORS.accent, COLORS.bg, 0.72)); g.addColorStop(1, mixHex(COLORS.accent, COLORS.bg, 0.9));
              ctx.fillStyle = g; ctx.fillRect(px, py, pw, u * 16);
              ICONS.cloud(ctx, px + pw / 2, py + u * 8, u * 11);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
          }
        }
        if (o.id) reg.set(o.id, { x, y, w, h });
      });
    },

    // A card of code or JSON. lines: strings or { text, at }. "key": value lines get a key in the second palette color.
    code(lines, o = {}) {
      item(o, (ctx, { x, y }) => {
        let size = (o.size ?? 4.3) * u;
        const w = (o.w ?? 0.92) * s.safe.w;
        const rows = lines.map((l) => (typeof l === 'string' ? { text: l } : l));
        // shrink the text until the longest line fits inside the card
        ctx.font = `500 ${size}px ${MONO}`;
        const longest = Math.max(...rows.map((r) => ctx.measureText(r.text).width));
        if (longest > w - size * 2) size *= (w - size * 2) / longest;
        const lh = size * 1.55;
        const h = rows.length * lh + size * 2.4 + (o.title ? size * 1.8 : 0);
        roundBox(ctx, 0, 0, w, h, u * 1.6, { stroke: COLORS.accent, lw: Math.max(3, u * 0.3), fill: COLORS.bg });
        let ry = -h / 2 + size * 1.5 + (o.title ? size * 1.8 : 0);
        if (o.title) rich(ctx, `*${o.title.toUpperCase()}*`, -w / 2 + size, -h / 2 + size * 1.6, size * 0.95, { align: 'left' });
        for (const r of rows) {
          const a = clamp((s.t - T(r.at ?? o.at ?? 0)) / 0.2);
          if (a > 0) {
            ctx.globalAlpha = a;
            ctx.font = `500 ${size}px ${MONO}`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            const m = /^(\s*)("[^"]+")(\s*:\s*)(.*)$/.exec(r.text);
            let cx = -w / 2 + size;
            if (m) {
              ctx.fillStyle = COLORS.ink; ctx.fillText(m[1], cx, ry); cx += ctx.measureText(m[1]).width;
              ctx.fillStyle = COLORS.key; ctx.fillText(m[2], cx, ry); cx += ctx.measureText(m[2]).width;
              ctx.fillStyle = COLORS.ink; ctx.fillText(m[3] + m[4], cx, ry);
            } else { ctx.fillStyle = COLORS.ink; ctx.fillText(r.text, cx, ry); }
            ctx.globalAlpha = 1;
          }
          ry += lh;
        }
        if (o.id) reg.set(o.id, { x, y, w, h });
      });
    },

    // Dashed lines between two boxes (by id) that flow. pair: two lines, one each way. label: small text.
    link(a, b, o = {}) {
      const at = T(o.at ?? 0);
      const out = o.out === undefined ? undefined : T(o.out);
      s.draw({ at, out, enter: 'fade', dur: 0.2, outDur: 0.25, sfx: o.sfx === false ? null : (o.sfx ?? 'whoosh') }, (ctx, life) => {
        const A = reg.get(a); const B = reg.get(b);
        if (!A || !B) return;
        const dx = B.x - A.x; const dy = B.y - A.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len; const uy = dy / len;
        // leave each box at its edge, along the line between the centers
        const edge = (box, sx, sy) => {
          const tx = Math.abs(sx) < 1e-6 ? Infinity : box.w / 2 / Math.abs(sx);
          const ty = Math.abs(sy) < 1e-6 ? Infinity : box.h / 2 / Math.abs(sy);
          return Math.min(tx, ty);
        };
        const gap = u * 1.1;
        const s0 = edge(A, ux, uy) + gap;
        const s1 = len - edge(B, ux, uy) - gap;
        if (s1 <= s0) return;
        const grow = inOut(clamp(life.local / (o.dur ?? 0.55)));
        const nx = -uy; const ny = ux;
        const offs = o.pair ? [-u * 2.6, u * 2.6] : [0];
        ctx.strokeStyle = o.color ?? COLORS.accent;
        ctx.fillStyle = o.color ?? COLORS.accent;
        ctx.lineWidth = Math.max(4, u * 0.55);
        ctx.lineCap = 'round';
        offs.forEach((off, i) => {
          // the second line runs the other way
          const from = i === 1 ? s1 : s0; const to = i === 1 ? s0 : s1;
          const px = (d) => A.x + ux * d + nx * off;
          const py = (d) => A.y + uy * d + ny * off;
          const end = lerp(from, to, grow);
          ctx.setLineDash([u * 2, u * 1.5]);
          ctx.lineDashOffset = -life.local * u * 9 * (i === 1 ? -1 : 1);
          ctx.beginPath(); ctx.moveTo(px(from), py(from)); ctx.lineTo(px(end), py(end)); ctx.stroke();
          ctx.setLineDash([]);
          if (grow > 0.98 && (o.pair || o.head !== false)) {
            const dir = to > from ? 1 : -1;
            const hx = px(to); const hy = py(to); const hs = u * 2.1;
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(hx - dir * ux * hs + nx * hs * 0.7, hy - dir * uy * hs + ny * hs * 0.7);
            ctx.lineTo(hx - dir * ux * hs - nx * hs * 0.7, hy - dir * uy * hs - ny * hs * 0.7);
            ctx.closePath(); ctx.fill();
          }
        });
        if (o.label) {
          const mx = A.x + ux * (s0 + s1) / 2; const my = A.y + uy * (s0 + s1) / 2;
          const ls = (o.labelSize ?? 4.2) * u;
          const txt = o.block ? `[${o.label.toUpperCase()}]` : `*${o.label.toUpperCase()}*`;
          ctx.font = `800 ${ls}px ${FONT}`;
          const lw = richWidth(ctx, txt, ls) + ls;
          ctx.fillStyle = COLORS.bg; ctx.fillRect(mx - lw / 2, my - ls * 0.8, lw, ls * 1.6);
          rich(ctx, txt, mx, my, ls, { align: 'center' });
        }
      });
    },

    // A real picture (assets/<name>.png|jpg|webp, made on a plain white background) cut out and given a white die-cut edge.
    // It pops in on its cue. Its id lets k.link() draw connections between pictures. No box is drawn around it.
    // o: { id, x, y, at, out, w (fraction of the safe width, .36), label, labelSize, rotate, from, move }
    //   label: text under the picture, with [block] and *accent* markup
    //   from:  'pop' (default, overshoots) | 'slap' | 'bottom' | 'top' | 'left' | 'right'
    // A missing file shows a labelled placeholder, so the layout can be checked before the pictures exist.
    pic(name, o = {}) {
      const tilt = ((o.rotate ?? 0) * Math.PI) / 180;
      const from = o.from ?? 'pop';
      item({ ...o, pop: false }, (ctx, { life, x, y }) => {
        const st = pictureFor(s, name);
        // w is the width of the box the picture must fit in; a tall picture (a phone) is limited to 1.15 times that in height
        const box = (o.w ?? 0.36) * s.safe.w;
        const fit = st ? Math.min(box / st.w, (box * 1.15) / st.h) : 1;
        const pw = st ? st.w * fit : box;
        const ph = st ? st.h * fit : box;
        const ls = (o.labelSize ?? 6.4) * u;
        const lh = o.label ? ls * 1.5 : 0;
        const H = ph + lh;
        const local = life.local + (T(o.at ?? 0) <= 0.05 ? 0.7 : 0); // already shown at frame 0 (the cover): start the pop a little in
        let sc = 1; let dx = 0; let dy = 0; let rot = tilt;
        if (from === 'slap') {
          const q = clamp(local / 0.22);
          sc = lerp(1.6, 1, q * q * (3 - 2 * q));
          ctx.globalAlpha = clamp(local / 0.08);
        } else if (from === 'pop') {
          const q = clamp(local / 0.5);
          sc = Math.max(0.001, backOut(q));
          rot = tilt + (1 - clamp(backOut(q), 0, 1)) * -0.35;
        } else {
          const e = backOut(clamp(local / 0.6));
          if (from === 'bottom') dy = (1 - e) * s.H * 0.5;
          else if (from === 'top') dy = -(1 - e) * s.H * 0.5;
          else if (from === 'left') dx = -(1 - e) * s.W * 0.8;
          else dx = (1 - e) * s.W * 0.8;
        }
        const idle = clamp(local - 0.5);
        dy += Math.sin(local * 2.4 + pw) * u * 0.4 * idle;
        rot += Math.sin(local * 2 + pw) * 0.02 * idle;
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(rot);
        ctx.scale(sc, sc);
        ctx.save();
        ctx.translate(0, -lh / 2);
        if (st) {
          ctx.shadowColor = 'rgba(0,0,0,0.55)';
          ctx.shadowBlur = u * 1.6;
          ctx.shadowOffsetY = u * 0.6;
          ctx.drawImage(st.cv, -pw / 2, -ph / 2, pw, ph);
        } else {
          roundBox(ctx, 0, 0, pw, ph, u * 2, { stroke: COLORS.accent, lw: Math.max(3, u * 0.4), fill: mixHex(COLORS.accent, COLORS.bg, 0.85) });
          ctx.fillStyle = COLORS.accent; ctx.font = `800 ${u * 3.4}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(`assets/${name}`, 0, 0);
        }
        ctx.restore();
        if (o.label) rich(ctx, o.caps === false ? o.label : o.label.toUpperCase(), 0, ph / 2 + ls * 0.55 - lh / 2 + ls * 0.3, ls, { align: 'center' });
        ctx.restore();
        ctx.globalAlpha = 1;
        if (o.id) reg.set(o.id, { x, y, w: pw * 0.9, h: H }); // the box includes the label, so links start below it
      });
    },

    // A die-cut sticker that pops in with a white edge, a soft shadow and a little shine, like one slapped on the screen.
    // icon: any icon name (explainroo icons <word>), or null for a text-only sticker. label: text on the sticker.
    // o: { x, y, at, out, size (circle width, in % of the frame), color, ink, shape, rotate, from, label, id, move }
    //   shape: 'circle' (default) | 'square' | 'burst' (a starburst, good for BUG! or NEW) | 'pill' (text only)
    //   from:  'pop' (default, overshoots) | 'slap' (lands from big, fast)
    // Use one or two per screen, in the gaps or at the corners, and keep them off the words.
    sticker(icon, o = {}) {
      const color = stickerColor(o.color);
      const ink = o.ink ?? (luminance(color) > 0.45 ? COLORS.dark : '#ffffff');
      const label = o.label ? String(o.label).toUpperCase() : '';
      if (!icon && !label) throw new Error('sticker needs an icon name, a label, or both');
      if (icon && !s.engine.icons?.[icon]) throw new Error(`sticker icon "${icon}" does not exist. Search with: explainroo icons <word>`);
      const shape = o.shape ?? (icon ? 'circle' : 'pill');
      const tilt = ((o.rotate ?? -6) * Math.PI) / 180;
      const from = o.from ?? 'pop';
      item({ ...o, pop: false }, (ctx, { life, x, y }) => {
        const r = ((o.size ?? 17) * u) / 2;
        const border = Math.max(5, r * 0.13);
        const ls = icon ? r * 0.5 : r * 0.78;
        ctx.font = `800 ${ls}px ${FONT}`;
        const textW = label ? ctx.measureText(label).width : 0;
        // the icon disc keeps its size; a label under it is a pill that overlaps the bottom edge
        const parts = [];
        if (icon) parts.push({ shape, r, cx: 0, cy: 0, w: r * 2, main: true });
        if (label && icon) parts.push({ shape: 'pill', r: ls * 0.78, cx: 0, cy: r * 0.95, w: textW + ls * 1.3, color: o.labelColor ? stickerColor(o.labelColor) : COLORS.dark, ink: '#ffffff' });
        if (label && !icon) parts.push({ shape, r: ls * 0.95, cx: 0, cy: 0, w: shape === 'pill' ? textW + ls * 1.5 : Math.max(textW + ls * 1.4, ls * 3), main: true });
        const wid = Math.max(...parts.map((q) => q.w));
        const hei = icon && label ? r + parts[1].cy + parts[1].r : parts[0].r * 2;
        const local = life.local + (T(o.at ?? 0) <= 0.05 ? 0.7 : 0);
        let sc; let dy = 0; let rot = tilt;
        if (from === 'slap') {
          const q = clamp(local / 0.22);
          sc = lerp(1.7, 1, q * q * (3 - 2 * q));
          rot = tilt + (1 - q) * 0.35;
          ctx.globalAlpha = clamp(local / 0.08);
        } else {
          const q = clamp(local / 0.5);
          sc = Math.max(0.001, backOut(q));
          rot = tilt + (1 - clamp(backOut(q), 0, 1)) * -0.5;
        }
        const idle = clamp(local - 0.5);
        dy = Math.sin(local * 2.6) * u * 0.45 * idle;
        rot += Math.sin(local * 2.1) * 0.025 * idle;
        ctx.save();
        ctx.translate(0, dy);
        ctx.rotate(rot);
        ctx.scale(sc, sc);
        // white die-cut edge for the whole sticker first (with the shadow), then the colored shapes
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = u * 1.4;
        ctx.shadowOffsetY = u * 0.55;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineJoin = 'round';
        ctx.lineWidth = border * 2 + (shape === 'burst' ? r * 0.1 : 0);
        for (const q of parts) { ctx.save(); ctx.translate(q.cx, q.cy); stickerShape(ctx, q.shape, q.r, q.w); ctx.stroke(); ctx.fill(); ctx.restore(); }
        ctx.shadowColor = 'transparent';
        for (const q of parts) {
          ctx.save(); ctx.translate(q.cx, q.cy);
          stickerShape(ctx, q.shape, q.r, q.w);
          ctx.fillStyle = q.color ?? color; ctx.strokeStyle = q.color ?? color;
          ctx.lineWidth = q.shape === 'burst' ? r * 0.1 : 1;
          ctx.fill(); ctx.stroke();
          if (q.main && local > 0.35 && local < 1.0) { // one shine sweeping across, once
            ctx.clip();
            const sx = lerp(-q.w, q.w, clamp((local - 0.35) / 0.6));
            const g = ctx.createLinearGradient(sx - q.r * 0.5, -q.r, sx + q.r * 0.5, q.r);
            g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g; ctx.fillRect(-q.w, -q.r * 1.2, q.w * 2, q.r * 2.4);
          }
          ctx.restore();
        }
        // the icon (a stroked 24 x 24 drawing) and the label
        if (icon) {
          const is = r * (label ? 1.15 : 1.2);
          ctx.save();
          ctx.translate(-is / 2, -is / 2 - (label ? r * 0.02 : 0));
          ctx.scale(is / 24, is / 24);
          ctx.strokeStyle = ink; ctx.lineWidth = 2.3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          for (const d of s.engine.icons[icon]) ctx.stroke(new Path2D(d));
          ctx.restore();
        }
        if (label) {
          const q = parts[parts.length - 1];
          ctx.font = `800 ${ls}px ${FONT}`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = q.ink ?? ink;
          ctx.fillText(label, q.cx, q.cy + ls * 0.04);
        }
        ctx.restore();
        ctx.globalAlpha = 1;
        if (o.id) reg.set(o.id, { x, y, w: wid, h: hei });
      });
    },

    // A finger tapping a spot: it rises from the bottom, presses, and leaves a ripple.
    tap(o = {}) {
      item({ ...o, sfx: o.sfx ?? 'click', pop: false, dur: 0.1 }, (ctx, { life }) => {
        const rise = inOut(clamp(life.local / 0.4));
        const press = clamp((life.local - 0.4) / 0.12) * (1 - clamp((life.local - 0.62) / 0.2));
        const w = u * 7.5;
        const tipY = lerp(s.H * 0.5, 0, rise) + press * u * 1.2;
        const g = ctx.createLinearGradient(0, tipY, 0, tipY + u * 30);
        g.addColorStop(0, COLORS.accent); g.addColorStop(1, rgba(COLORS.accent, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.roundRect(-w / 2, tipY, w, u * 40, [w / 2, w / 2, 0, 0]); ctx.fill();
        const rp = clamp((life.local - 0.45) / 0.6);
        if (rp > 0 && rp < 1) {
          ctx.strokeStyle = rgba(COLORS.accent, 1 - rp); ctx.lineWidth = u * 0.5;
          ctx.beginPath(); ctx.arc(0, 0, u * (2 + rp * 7), 0, Math.PI * 2); ctx.stroke();
        }
      });
    },
  };
  return api;
}
