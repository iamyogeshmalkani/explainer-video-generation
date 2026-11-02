// what-if-map frames: everything in the "What if ...?" videos that is NOT the plain map. Cartoon cut-away scenes
// (a street and a border post, a balance scale), a little cartoon person, and map props that pop onto a place
// (a flag pole, a rubber stamp, a pile of week cards, a swarm of kingdoms, "NO!" bubbles, a trophy, confetti).
//
//   const f = frames(s, cam);         // after fly() and basemap(), next to kit(s, cam)
//   f.headline('28 STATES.\n28 PASSPORTS.', { at: 0.2, out: t('#well') });
//   f.states(REGIONS.india28, { at: 0.4, out: t('#well'), flags: true });
//   f.borderScene({ at: t('#office'), out: t('#cong') });
//
// Every helper takes `at` and `out` in seconds (use t('#marker')) and plays its own sound. Cut-away scenes cover the whole
// frame, so give them an `out`. Map props are anchored to lon/lat and keep their size on screen at any zoom.
// Call the screen-fixed ones (headline, yearRewind, confetti, cut-away scenes) AFTER the map layers.
import { X, Y, geometry, trace } from './kit.js';
import { addProps } from './props.js';

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const backOut = (p) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const FONT = '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
const OUTLINE = '#2a1a12';

// ---- shared drawing bits ---------------------------------------------------------------------------------------

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// Cartoon lettering: a fat dark outline under a bright fill. `lit` is an optional list of words that stay white.
function toon(ctx, text, x, y, size, o = {}) {
  ctx.save();
  ctx.font = `800 ${size}px ${FONT}`;
  ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (o.spacing) ctx.letterSpacing = `${o.spacing}px`;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = size * 0.3; ctx.shadowOffsetY = size * 0.08;
  ctx.lineWidth = size * (o.stroke ?? 0.2); ctx.strokeStyle = o.outline ?? '#2b1b05';
  ctx.strokeText(text, x, y);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = o.color ?? '#ffd23f';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// A tiny deterministic random generator, so a swarm lands on the same spots in every render worker.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Points inside a named region (a state or 'India'), by rejection sampling. Cached.
const scatterCache = new Map();
function scatter(name, n, seed = 7) {
  const key = `${name}|${n}|${seed}`;
  if (scatterCache.has(key)) return scatterCache.get(key);
  const { rings } = geometry(name, false);
  const boxes = rings.map((r) => { let a = [1e9, 1e9, -1e9, -1e9]; for (let i = 0; i < r.length; i += 2) a = [Math.min(a[0], r[i]), Math.min(a[1], r[i + 1]), Math.max(a[2], r[i]), Math.max(a[3], r[i + 1])]; return a; });
  const inside = (x, y) => {
    let c = false;
    rings.forEach((r, k) => {
      const b = boxes[k]; if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) return;
      for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
        if ((r[i + 1] > y) !== (r[j + 1] > y) && x < ((r[j] - r[i]) * (y - r[i + 1])) / (r[j + 1] - r[i + 1]) + r[i]) c = !c;
      }
    });
    return c;
  };
  const x0 = Math.min(...boxes.map((b) => b[0])), y0 = Math.min(...boxes.map((b) => b[1])), x1 = Math.max(...boxes.map((b) => b[2])), y1 = Math.max(...boxes.map((b) => b[3]));
  const rnd = rng(seed); const pts = [];
  for (let tries = 0; pts.length < n && tries < n * 60; tries++) {
    const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
    if (inside(x, y)) pts.push([x, y]);
  }
  scatterCache.set(key, pts);
  return pts;
}

// A good spot for a flag or a label inside a state: the grid point farthest from the outline of its biggest piece.
const heartCache = new Map();
function heart(name) {
  if (heartCache.has(name)) return heartCache.get(name);
  const { rings } = geometry(name, true);
  let best = rings[0], area = -1;
  for (const r of rings) { let a = [1e9, 1e9, -1e9, -1e9]; for (let i = 0; i < r.length; i += 2) a = [Math.min(a[0], r[i]), Math.min(a[1], r[i + 1]), Math.max(a[2], r[i]), Math.max(a[3], r[i + 1])]; const ar = (a[2] - a[0]) * (a[3] - a[1]); if (ar > area) { area = ar; best = r; } }
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < best.length; i += 2) { x0 = Math.min(x0, best[i]); x1 = Math.max(x1, best[i]); y0 = Math.min(y0, best[i + 1]); y1 = Math.max(y1, best[i + 1]); }
  const inPoly = (x, y) => { let c = false; for (let i = 0, j = best.length - 2; i < best.length; j = i, i += 2) { if ((best[i + 1] > y) !== (best[j + 1] > y) && x < ((best[j] - best[i]) * (y - best[i + 1])) / (best[j + 1] - best[i + 1]) + best[i]) c = !c; } return c; };
  let pick = [(x0 + x1) / 2, (y0 + y1) / 2], far = -1;
  for (let a = 1; a < 14; a++) for (let b = 1; b < 14; b++) {
    const x = x0 + ((x1 - x0) * a) / 14, y = y0 + ((y1 - y0) * b) / 14;
    if (!inPoly(x, y)) continue;
    let d = 1e9; for (let i = 0; i < best.length; i += 2) d = Math.min(d, (best[i] - x) ** 2 + (best[i + 1] - y) ** 2);
    if (d > far) { far = d; pick = [x, y]; }
  }
  heartCache.set(name, pick);
  return pick;
}

// Neighbouring states get different colours: two states are neighbours when they share an outline point.
const PASTELS = ['#7fe3a6', '#c98ee6', '#ef7f78', '#f4c552', '#e9a36f', '#a9d86b', '#6fd0d8', '#ee8fb5'];
function paint(names) {
  const owners = new Map();
  for (const n of names) for (const r of geometry(n, false).rings) for (let i = 0; i < r.length; i += 2) {
    const k = `${Math.round(r[i] * 10)},${Math.round(r[i + 1] * 10)}`;
    if (!owners.has(k)) owners.set(k, new Set());
    owners.get(k).add(n);
  }
  const next = new Map(names.map((n) => [n, new Set()]));
  for (const set of owners.values()) for (const a of set) for (const b of set) if (a !== b) next.get(a).add(b);
  const out = {};
  [...names].sort((a, b) => next.get(b).size - next.get(a).size).forEach((n) => {
    const used = new Set([...next.get(n)].map((m) => out[m]).filter(Boolean));
    out[n] = PASTELS.find((c) => !used.has(c)) ?? PASTELS[0];
  });
  return out;
}

// ---- the cartoon person, an officer and a passport ----------------------------------------------------------------

// Origin = the middle of the feet, 1 unit = size / 10, y grows downwards, so the head is near y = -8.
function drawPassport(ctx, w = 2.3, h = 3.1) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 0.4; ctx.shadowOffsetY = 0.15;
  roundRect(ctx, -w / 2, -h / 2, w, h, 0.18); ctx.fillStyle = '#8d1b2f'; ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 0.1; ctx.strokeStyle = '#3d0a14'; ctx.stroke();
  ctx.strokeStyle = '#e8b84a'; ctx.lineWidth = 0.12; ctx.beginPath(); ctx.arc(0, -0.2, 0.55, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#e8b84a'; ctx.font = `800 0.3px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PASSPORT', 0, 0.95);
  ctx.restore();
}

// What the person holds up in the raised hand. Origin = the middle of the item.
function drawHeld(ctx, kind) {
  ctx.save();
  if (kind === 'passport') drawPassport(ctx);
  else if (kind === 'phone') {
    roundRect(ctx, -0.8, -1.5, 1.6, 3.0, 0.22); ctx.fillStyle = '#1b1f2a'; ctx.fill(); ctx.lineWidth = 0.1; ctx.strokeStyle = OUTLINE; ctx.stroke();
    roundRect(ctx, -0.62, -1.28, 1.24, 2.5, 0.12); ctx.fillStyle = '#7fd0ff'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(-0.4, -0.9, 0.8, 0.16); ctx.fillRect(-0.4, -0.55, 0.55, 0.16);
  } else if (kind === 'can') {
    roundRect(ctx, -1.0, -1.2, 2.0, 2.4, 0.25); ctx.fillStyle = '#d7282f'; ctx.fill(); ctx.lineWidth = 0.12; ctx.strokeStyle = OUTLINE; ctx.stroke();
    ctx.fillStyle = '#b01c22'; ctx.fillRect(-0.7, -0.3, 1.4, 0.18); ctx.fillRect(-0.7, 0.35, 1.4, 0.18);
    ctx.beginPath(); ctx.moveTo(0.3, -1.2); ctx.lineTo(0.9, -1.85); ctx.lineTo(1.25, -1.6); ctx.lineTo(0.75, -1.2); ctx.closePath(); ctx.fillStyle = '#e8b84a'; ctx.fill(); ctx.stroke();
    roundRect(ctx, -0.95, -1.7, 0.9, 0.5, 0.15); ctx.fillStyle = '#e8b84a'; ctx.fill(); ctx.stroke();
  } else if (kind === 'ticket') {
    roundRect(ctx, -1.5, -0.8, 3.0, 1.6, 0.15); ctx.fillStyle = '#fff6d8'; ctx.fill(); ctx.lineWidth = 0.1; ctx.strokeStyle = OUTLINE; ctx.stroke();
    ctx.fillStyle = '#e8590c'; ctx.fillRect(-1.5, -0.8, 3.0, 0.4); ctx.fillStyle = OUTLINE; ctx.fillRect(-1.1, -0.1, 1.5, 0.12); ctx.fillRect(-1.1, 0.25, 2.2, 0.12);
  } else if (kind === 'bat') {
    ctx.rotate(0.35); roundRect(ctx, -0.55, -2.4, 1.1, 3.6, 0.3); ctx.fillStyle = '#e3b46b'; ctx.fill(); ctx.lineWidth = 0.12; ctx.strokeStyle = OUTLINE; ctx.stroke();
    roundRect(ctx, -0.22, 1.1, 0.44, 1.5, 0.15); ctx.fillStyle = '#2a2a2e'; ctx.fill(); ctx.stroke();
  } else if (kind === 'sign') {
    roundRect(ctx, -1.6, -1.1, 3.2, 2.2, 0.2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 0.12; ctx.strokeStyle = OUTLINE; ctx.stroke();
    ctx.fillStyle = '#d7282f'; ctx.font = `800 0.62px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('WHAT', 0, -0.3); ctx.fillText('IF?', 0, 0.4);
  }
  ctx.restore();
}

function drawPerson(ctx, o = {}) {
  const { mood = 'neutral', hold = false, t = 0, walk = 0, look = 0 } = o;
  const limb = (pts, w, fill) => {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = OUTLINE; ctx.lineWidth = w + 0.22; ctx.stroke();
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = fill; ctx.lineWidth = w; ctx.stroke();
  };
  const skin = o.skin ?? '#b8744a', shirt = o.shirt ?? '#fbfbf7', pants = o.pants ?? '#24407a', hair = o.hair ?? '#14110f';
  ctx.save();
  // legs and shoes
  const sw = Math.sin(walk) * 0.35;
  for (const sx of [-1, 1]) {
    const dx = sx * 0.85, lift = Math.max(0, sx * Math.sin(walk)) * 0.3;
    limb([[dx, -3.4], [dx + sx * sw * 0.4, -0.4 - lift]], 1.25, pants);
    ctx.beginPath(); ctx.ellipse(dx + sx * sw * 0.4 + sx * 0.25, -0.22 - lift, 0.95, 0.4, 0, 0, TAU); ctx.fillStyle = '#17181d'; ctx.fill();
  }
  // torso, collar, tie
  roundRect(ctx, -2.0, -6.5, 4.0, 3.5, 0.55); ctx.fillStyle = shirt; ctx.fill(); ctx.lineWidth = 0.14; ctx.strokeStyle = OUTLINE; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.75, -6.5); ctx.lineTo(0, -5.55); ctx.lineTo(0.75, -6.5); ctx.closePath(); ctx.fillStyle = '#dde3ea'; ctx.fill(); ctx.stroke();
  if (o.tie !== null) { ctx.beginPath(); ctx.moveTo(-0.28, -5.9); ctx.lineTo(0.28, -5.9); ctx.lineTo(0.42, -3.9); ctx.lineTo(0, -3.55); ctx.lineTo(-0.42, -3.9); ctx.closePath(); ctx.fillStyle = o.tie ?? '#2358c4'; ctx.fill(); ctx.stroke(); }
  if (o.vest) { ctx.fillStyle = o.vest; ctx.globalAlpha = 0.95; roundRect(ctx, -1.95, -6.4, 3.9, 3.3, 0.5); ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 0.12; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-1.9, -4.7, 3.8, 0.3); }
  // arms
  limb([[-1.95, -6.1], [-2.45, -4.6], [-2.35, -3.4]], 1.0, shirt);
  ctx.beginPath(); ctx.arc(-2.35, -3.2, 0.5, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.lineWidth = 0.12; ctx.strokeStyle = OUTLINE; ctx.stroke();
  if (hold) {
    const wave = Math.sin(t * 5) * 0.12;
    limb([[1.95, -6.1], [3.2, -7.0], [2.9 + wave, -9.0]], 1.0, shirt);
    ctx.save(); ctx.translate(3.0 + wave, -10.6); ctx.rotate(0.12 + wave * 0.3); drawHeld(ctx, hold === true ? 'passport' : hold); ctx.restore();
    ctx.beginPath(); ctx.arc(2.9 + wave, -9.1, 0.5, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.lineWidth = 0.12; ctx.strokeStyle = OUTLINE; ctx.stroke();
  } else {
    limb([[1.95, -6.1], [2.45, -4.6], [2.35, -3.4]], 1.0, shirt);
    ctx.beginPath(); ctx.arc(2.35, -3.2, 0.5, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.lineWidth = 0.12; ctx.strokeStyle = OUTLINE; ctx.stroke();
  }
  // head
  const hy = -7.9 + Math.sin(t * 3) * 0.04;
  ctx.beginPath(); ctx.arc(-1.75, hy + 0.1, 0.36, 0, TAU); ctx.arc(1.75, hy + 0.1, 0.36, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.lineWidth = 0.12; ctx.strokeStyle = OUTLINE; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, hy, 1.75, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.lineWidth = 0.16; ctx.stroke();
  // curly hair on top
  ctx.beginPath(); ctx.arc(0, hy - 0.15, 1.82, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath();
  ctx.fillStyle = hair; ctx.fill();
  if (o.long) { roundRect(ctx, -1.95, hy - 0.4, 0.8, 3.4, 0.35); ctx.fill(); roundRect(ctx, 1.15, hy - 0.4, 0.8, 3.4, 0.35); ctx.fill(); }
  if (o.cap) { ctx.fillStyle = o.cap; ctx.beginPath(); ctx.arc(0, hy - 0.5, 1.75, Math.PI, TAU); ctx.fill(); ctx.lineWidth = 0.14; ctx.stroke(); ctx.fillRect(-0.2, hy - 0.62, 2.6, 0.32); }
  ctx.fillStyle = hair;
  for (let i = 0; i < 6; i++) { const a = Math.PI * (1.08 + i * 0.165); ctx.beginPath(); ctx.arc(Math.cos(a) * 1.7, hy - 0.15 + Math.sin(a) * 1.7, 0.42, 0, TAU); ctx.fill(); }
  // eyes, brows, mouth by mood
  const blink = (t % 3.2) > 3.08 ? 0.12 : 1;
  const wide = mood === 'shock' ? 1.25 : 1;
  for (const sx of [-1, 1]) {
    const ex = sx * 0.68, ey = hy + 0.1;
    ctx.beginPath(); ctx.ellipse(ex, ey, 0.5 * wide, 0.55 * wide * blink, 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 0.1; ctx.strokeStyle = OUTLINE; ctx.stroke();
    ctx.beginPath(); ctx.arc(ex + look * 0.16, ey + 0.03, 0.22 * wide * (mood === 'shock' ? 0.8 : 1), 0, TAU); ctx.fillStyle = '#17120e'; ctx.fill();
    ctx.beginPath(); ctx.lineWidth = 0.16; ctx.strokeStyle = '#14110f'; ctx.lineCap = 'round';
    const by = ey - (mood === 'shock' ? 0.95 : 0.78);
    if (mood === 'angry') { ctx.moveTo(ex - sx * 0.5, by + 0.05); ctx.lineTo(ex + sx * 0.5, by + 0.45); } else { ctx.moveTo(ex - 0.42, by + (mood === 'shock' ? -0.05 : 0.02)); ctx.lineTo(ex + 0.42, by + (mood === 'worried' ? sx * 0.14 : 0)); }
    ctx.stroke();
  }
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.13; ctx.beginPath();
  if (mood === 'shock') { ctx.ellipse(0, hy + 1.05, 0.34, 0.46, 0, 0, TAU); ctx.fillStyle = '#4a1612'; ctx.fill(); }
  else if (mood === 'happy') { ctx.arc(0, hy + 0.65, 0.6, 0.15, Math.PI - 0.15); }
  else if (mood === 'angry') { ctx.arc(0, hy + 1.4, 0.55, Math.PI * 1.15, Math.PI * 1.85); }
  else { ctx.moveTo(-0.4, hy + 1.0); ctx.quadraticCurveTo(0, hy + 1.18, 0.4, hy + 1.0); }
  ctx.stroke();
  if (o.mask) {                                                // a face mask with ear loops
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.1; ctx.beginPath(); ctx.moveTo(-1.45, hy + 0.5); ctx.lineTo(-1.8, hy + 0.15); ctx.moveTo(1.45, hy + 0.5); ctx.lineTo(1.8, hy + 0.15); ctx.stroke();
    roundRect(ctx, -1.45, hy + 0.45, 2.9, 1.25, 0.45); ctx.fillStyle = '#e8f3ff'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-0.9, hy + 0.85); ctx.lineTo(0.9, hy + 0.85); ctx.moveTo(-0.9, hy + 1.15); ctx.lineTo(0.9, hy + 1.15); ctx.lineWidth = 0.06; ctx.stroke();
  }
  ctx.restore();
}

function drawOfficer(ctx, o = {}) {
  const { stampT = 0, t = 0 } = o;
  const skin = '#a96a43', khaki = '#c2a05a';
  ctx.save();
  roundRect(ctx, -2.3, -6.2, 4.6, 5.0, 0.7); ctx.fillStyle = khaki; ctx.fill(); ctx.lineWidth = 0.15; ctx.strokeStyle = OUTLINE; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-2.2, -5.7); ctx.lineTo(1.9, -1.4); ctx.lineWidth = 0.4; ctx.strokeStyle = '#6a4a22'; ctx.stroke();           // belt strap
  // left arm resting, right arm brings the stamp down
  ctx.lineCap = 'round';
  const hand = [2.9, -4.4 - 2.6 * (1 - easeOut(clamp(stampT)))];
  ctx.beginPath(); ctx.moveTo(2.0, -5.6); ctx.lineTo(3.4, hand[1] - 0.8); ctx.lineTo(hand[0], hand[1]); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.2; ctx.stroke(); ctx.strokeStyle = khaki; ctx.lineWidth = 0.95; ctx.stroke();
  ctx.beginPath(); ctx.arc(hand[0], hand[1], 0.5, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.lineWidth = 0.12; ctx.strokeStyle = OUTLINE; ctx.stroke();
  roundRect(ctx, hand[0] - 0.55, hand[1] + 0.3, 1.1, 0.9, 0.12); ctx.fillStyle = '#7a4a22'; ctx.fill(); ctx.stroke();       // the stamp in his hand
  const hy = -7.6 + Math.sin(t * 2) * 0.03;
  ctx.beginPath(); ctx.arc(0, hy, 1.7, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.lineWidth = 0.16; ctx.strokeStyle = OUTLINE; ctx.stroke();
  for (const sx of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(sx * 0.65, hy - 0.05, 0.42, 0.34, 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 0.1; ctx.stroke();
    ctx.beginPath(); ctx.arc(sx * 0.65, hy, 0.17, 0, TAU); ctx.fillStyle = '#17120e'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx * 0.2, hy - 0.62); ctx.lineTo(sx * 1.1, hy - 0.45 - 0.0); ctx.lineWidth = 0.22; ctx.strokeStyle = '#14110f'; ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(-0.55, hy + 0.7, 0.62, 0.25, -0.15, 0, TAU); ctx.ellipse(0.55, hy + 0.7, 0.62, 0.25, 0.15, 0, TAU); ctx.fillStyle = '#14110f'; ctx.fill();   // moustache
  roundRect(ctx, -1.95, hy - 1.15, 3.9, 0.65, 0.25); ctx.fillStyle = '#7b5a2c'; ctx.fill(); ctx.lineWidth = 0.14; ctx.strokeStyle = OUTLINE; ctx.stroke();              // cap band
  ctx.beginPath(); ctx.arc(0, hy - 1.1, 1.6, Math.PI, TAU); ctx.fillStyle = '#9a7a3c'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, hy - 1.45, 0.28, 0, TAU); ctx.fillStyle = '#f1c64a'; ctx.fill();
  ctx.restore();
}

// ---- cut-away backdrops -------------------------------------------------------------------------------------------

function drawSky(ctx, W, H, kind) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (kind === 'street') { g.addColorStop(0, '#6fb8ec'); g.addColorStop(0.55, '#bfe3fa'); g.addColorStop(1, '#e6f4fd'); } else { g.addColorStop(0, '#a9cdee'); g.addColorStop(1, '#d6e8f7'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function drawStreet(ctx, W, H, t) {
  drawSky(ctx, W, H, 'street');
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (const [cx, cy, r] of [[0.2, 0.12, 90], [0.74, 0.2, 120], [0.45, 0.07, 70]]) { const x = ((cx * W + t * 6) % (W + 300)) - 150; ctx.beginPath(); ctx.ellipse(x, cy * H, r * 1.5, r * 0.5, 0, 0, TAU); ctx.ellipse(x + r * 0.8, cy * H - r * 0.2, r * 0.9, r * 0.45, 0, 0, TAU); ctx.fill(); }
  const roadY = H * 0.7, rnd = rng(11);
  let x = -30;
  while (x < W + 30) {
    const bw = 90 + rnd() * 90, bh = H * (0.14 + rnd() * 0.2), tone = ['#7d9fc2', '#6f8fb4', '#8db0d1', '#5f81a8'][Math.floor(rnd() * 4)];
    ctx.fillStyle = tone; ctx.fillRect(x, roadY - bh, bw, bh);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (let wy = roadY - bh + 22; wy < roadY - 30; wy += 34) for (let wx = x + 14; wx < x + bw - 22; wx += 28) ctx.fillRect(wx, wy, 14, 20);
    x += bw + 6;
  }
  ctx.fillStyle = '#c9ccd2'; ctx.fillRect(0, roadY, W, H * 0.03);
  ctx.fillStyle = '#4d5058'; ctx.fillRect(0, roadY + H * 0.03, W, H);
  ctx.strokeStyle = '#f3f3f3'; ctx.lineWidth = 8; ctx.setLineDash([46, 34]); ctx.lineDashOffset = -t * 40;
  ctx.beginPath(); ctx.moveTo(0, H * 0.845); ctx.lineTo(W, H * 0.845); ctx.stroke(); ctx.setLineDash([]);
}

// ---- the helpers ---------------------------------------------------------------------------------------------------

export function frames(s, cam) {
  const z = cam.zoom;
  const W = s.W, H = s.H, S = W / 1080;

  const screenLayer = (o, fn) => {
    s.draw({ at: o.at ?? -1, out: o.out, enter: o.enter ?? 'none', exit: o.exit ?? 'none', sfx: false }, (ctx, life) => {
      ctx.save();
      ctx.translate(cam.x, cam.y);
      if (cam.rotate) ctx.rotate((-cam.rotate * Math.PI) / 180);
      ctx.scale(1 / z, 1 / z);
      ctx.translate(-cam.fx, -cam.fy);
      fn(ctx, life);
      ctx.restore();
    });
  };
  // A prop anchored to a place: origin at the place, drawn at screen size.
  const anchored = (o, fn) => {
    s.draw({ at: o.at ?? 0, out: o.out, enter: 'none', sfx: false }, (ctx, life) => {
      ctx.save();
      ctx.translate(X(o.lon), Y(o.lat));
      ctx.scale(1 / z, 1 / z);
      fn(ctx, life);
      ctx.restore();
    });
  };
  const sfx = (o, name, when, gain, extra) => { if (o.sound !== false) s.sfx(name, when, { gain, ...extra }); };

  const api = {
    paint,
    scatter,

    // Big yellow cartoon lettering at the top ("28 STATES. 28 PASSPORTS."). '\n' starts a new line.
    // colors: one fill per line (default yellow then white). sub: a small line under it ("= TODAY'S KERALA").
    headline(text, o = {}) {
      const at = o.at ?? 0;
      sfx(o, 'pop', at, 0.22);
      const lines = text.split('\n');
      const size = (o.size ?? 62) * S;
      screenLayer({ at, out: o.out, enter: 'none' }, (ctx) => {
        const p = clamp((s.t - at) / 0.28), e = backOut(p);
        ctx.save();
        ctx.globalAlpha *= clamp(p * 2);
        const y0 = H * (o.y ?? 0.075);
        lines.forEach((ln, i) => {
          ctx.save();
          ctx.translate(W / 2, y0 + i * size * 1.08); ctx.scale(0.6 + 0.4 * e, 0.6 + 0.4 * e);
          toon(ctx, ln, 0, 0, size, { color: o.colors?.[i] ?? (i === 0 ? '#ffd23f' : '#ffffff') });
          ctx.restore();
        });
        if (o.sub) toon(ctx, o.sub, W / 2, y0 + lines.length * size * 1.08 + size * 0.12, size * 0.4, { color: '#ffffff', stroke: 0.22 });
        ctx.restore();
      });
    },

    // A year that counts down (or up) in steps, like turning back the clock: 2025 ... 1947.
    yearRewind(from, to, o = {}) {
      const at = o.at ?? 0, dur = o.dur ?? 2.2;
      const steps = Math.min(14, Math.abs(from - to));
      for (let i = 0; i < steps; i++) sfx(o, 'tick', at + (dur * i) / steps, 0.13);
      sfx(o, 'chime', at + dur, 0.2);
      screenLayer({ at, out: o.out, enter: 'none' }, (ctx) => {
        const p = clamp((s.t - at) / dur);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const v = Math.round(from + (to - from) * e);
        const settle = clamp((s.t - at - dur) / 0.25);
        ctx.save();
        ctx.translate(W / 2, H * (o.y ?? 0.075)); const k = 1 + 0.15 * Math.sin(settle * Math.PI) * (settle > 0 && settle < 1 ? 1 : 0); ctx.scale(k, k);
        toon(ctx, String(v), 0, 0, (o.size ?? 96) * S, { color: o.color ?? '#fff4cf', outline: '#4a3414', stroke: 0.18 });
        ctx.restore();
      });
    },

    // States (or any named regions) coloured like a game board: raised edges, a small flag in each, and an optional
    // "crack" where white fault lines flash first and the pieces then drop into colour.
    // names: REGIONS.india28 or a list. colors: { name: '#hex' } (default: neighbours differ). flags: a flag on each.
    states(names, o = {}) {
      const list = [].concat(names);
      const colors = { ...paint(list), ...(o.colors || {}) };
      const at = o.at ?? 0;
      if (o.crack) { sfx(o, 'thud', at, 0.3); for (let i = 0; i < 5; i++) sfx(o, 'click', at + 0.05 + i * 0.07, 0.16); }
      else sfx(o, 'pop', at, 0.12);
      s.draw({ at, out: o.out, enter: 'none', sfx: false }, (ctx) => {
        const age = s.t - at;
        const drop = o.crack ? clamp((age - 0.35) / 0.4) : clamp(age / 0.25);
        const lift = 6.5 / z * (o.crack ? easeOut(drop) : 1);
        ctx.save(); ctx.lineJoin = 'round';
        if (o.crack && age < 0.45) {                       // fault lines first
          ctx.shadowColor = '#fff'; ctx.shadowBlur = 22;
          for (const n of list) { trace(ctx, geometry(n, false).rings); ctx.lineWidth = 4 / z; ctx.strokeStyle = `rgba(255,255,255,${1 - age / 0.5})`; ctx.stroke(); }
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha *= o.crack ? easeOut(drop) : clamp(age / 0.25);
        for (const n of list) {                              // the dark underside, offset down and right
          ctx.save(); ctx.translate(lift, lift * 1.1); trace(ctx, geometry(n, false).rings); ctx.fillStyle = '#17141f'; ctx.fill(); ctx.restore();
        }
        for (const n of list) {
          const g = geometry(n, false);
          trace(ctx, g.rings); ctx.fillStyle = colors[n]; ctx.fill();
          ctx.lineWidth = 2.2 / z; ctx.strokeStyle = '#1b1722'; ctx.stroke();
        }
        if (o.flags) {
          const wave = Math.sin(s.T * 4);
          for (const n of o.flags === true ? list : o.flags) {
            const [lon, lat] = heart(n); const u = 1 / z;
            ctx.save(); ctx.translate(X(lon), Y(lat)); ctx.scale(u, u);
            ctx.strokeStyle = '#2a2330'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-9, 12); ctx.lineTo(-9, -14); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-9, -14); ctx.quadraticCurveTo(0, -17 + wave * 2, 11, -12 + wave); ctx.lineTo(11, -2 + wave); ctx.quadraticCurveTo(0, -6 + wave * 2, -9, -3); ctx.closePath();
            ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill(); ctx.lineWidth = 1.6; ctx.stroke();
            ctx.restore();
          }
        }
        ctx.restore();
      });
    },

    // A flag that rises on a pole at a place and waves. colors: [field, emblem].
    flagPole({ lon, lat, at = 0, out, h = 190, colors = ['#d62d27', '#ffd23f'], tricolor = false, sound }) {
      sfx({ sound }, 'whoosh', at, 0.2); sfx({ sound }, 'blip', at + 0.45, 0.2);
      anchored({ lon, lat, at, out }, (ctx) => {
        const age = s.t - at, rise = easeOut(clamp(age / 0.45)), unfurl = easeOut(clamp((age - 0.35) / 0.4));
        const top = -h * rise;
        ctx.globalAlpha *= clamp(age / 0.12);
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8;
        ctx.strokeStyle = '#d9dde3'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, top); ctx.stroke();
        ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, top - 3, 5, 0, TAU); ctx.fill();
        ctx.shadowColor = 'transparent';
        if (unfurl > 0) {
          const fw = 96 * unfurl, fh = 66, w1 = Math.sin(s.T * 5) * 5;
          ctx.save(); ctx.translate(3, top + 6);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(fw * 0.3, -7 + w1, fw * 0.7, 7 - w1, fw, 0); ctx.lineTo(fw, fh); ctx.bezierCurveTo(fw * 0.7, fh + 7 - w1, fw * 0.3, fh - 7 + w1, 0, fh); ctx.closePath();
          if (tricolor) {                                   // three equal bands and a blue wheel
            ctx.save(); ctx.clip();
            ['#ff9933', '#ffffff', '#138808'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-2, -12 + (i * (fh + 24)) / 3, fw + 4, (fh + 24) / 3 + 1); });
            ctx.restore();
            ctx.lineWidth = 3; ctx.strokeStyle = '#3a3a3a'; ctx.stroke();
            ctx.beginPath(); ctx.arc(fw / 2, fh / 2, 12 * unfurl, 0, TAU); ctx.lineWidth = 2.5; ctx.strokeStyle = '#1f3a93'; ctx.stroke();
          } else {
            ctx.fillStyle = colors[0]; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#5b0f0c'; ctx.stroke();
            ctx.beginPath(); ctx.arc(fw / 2, fh / 2, 17 * unfurl, 0, TAU); ctx.fillStyle = colors[1]; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke();
          }
          ctx.restore();
        }
      });
    },

    // A red rubber stamp that slams down at a place and leaves its word. Add `hold` seconds the word stays.
    stamp(text, { lon, lat, at = 0, out, color = '#d7282f', size = 40, tilt = -9, sound } = {}) {
      sfx({ sound }, 'whoosh', at, 0.15); sfx({ sound }, 'thud', at + 0.28, 0.4); sfx({ sound }, 'click', at + 0.3, 0.2);
      anchored({ lon, lat, at, out }, (ctx) => {
        const age = s.t - at, hit = 0.28;
        ctx.save(); ctx.rotate((tilt * Math.PI) / 180);
        if (age >= hit) {                                  // the inked word
          const q = clamp((age - hit) / 0.12);
          ctx.save(); ctx.globalAlpha *= 0.92; ctx.scale(1 + 0.25 * (1 - q), 1 + 0.25 * (1 - q));
          ctx.font = `800 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const w = ctx.measureText(text).width + size * 0.7;
          ctx.lineWidth = 6; ctx.strokeStyle = color; roundRect(ctx, -w / 2, -size * 0.8, w, size * 1.6, 8); ctx.stroke();
          ctx.lineWidth = 2.5; roundRect(ctx, -w / 2 + 7, -size * 0.8 + 7, w - 14, size * 1.6 - 14, 5); ctx.stroke();
          ctx.fillStyle = color; ctx.fillText(text, 0, 2);
          ctx.restore();
        }
        const sy = age < hit ? -230 * (1 - easeOut(age / hit)) : -4 * Math.max(0, 1 - (age - hit) / 0.2) - clamp((age - hit - 0.5) / 0.4) * 160;
        ctx.globalAlpha *= 1 - clamp((age - hit - 0.5) / 0.4);
        ctx.translate(0, sy - 26);                         // the stamp itself: knob, handle, red base
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#b4672b'; ctx.beginPath(); ctx.arc(0, -78, 20, 0, TAU); ctx.fill();
        ctx.fillRect(-9, -68, 18, 46);
        ctx.fillStyle = '#b8352c'; roundRect(ctx, -42, -24, 84, 22, 6); ctx.fill();
        ctx.fillStyle = '#7a1f18'; ctx.fillRect(-42, -8, 84, 6);
        ctx.restore();
      });
    },

    // Week cards that pile up one after another (WEEK 1 ... WEEK 6) beside a place. `gap` seconds between cards.
    calendar({ lon, lat, at = 0, out, weeks = 6, gap = 0.34, dx = 70, dy = -50, scale = 1.35, sound } = {}) {
      for (let i = 0; i < weeks; i++) sfx({ sound }, 'tick', at + i * gap, 0.2);
      sfx({ sound }, 'ding', at + weeks * gap, 0.2);
      anchored({ lon, lat, at, out }, (ctx) => {
        for (let i = 0; i < weeks; i++) {
          const age = s.t - (at + i * gap); if (age < 0) continue;
          const p = backOut(clamp(age / 0.22)), r = rng(40 + i);
          ctx.save();
          ctx.translate(dx + (r() - 0.5) * 26, dy + (r() - 0.5) * 20 - 22 * i * 0.25); ctx.rotate((r() - 0.5) * 0.55); ctx.scale(p * scale, p * scale);
          ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
          roundRect(ctx, -52, -38, 104, 76, 7); ctx.fillStyle = '#fbf7ec'; ctx.fill(); ctx.shadowColor = 'transparent';
          ctx.lineWidth = 3; ctx.strokeStyle = OUTLINE; ctx.stroke();
          ctx.fillStyle = '#d62d27'; roundRect(ctx, -52, -38, 104, 20, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#17120e'; ctx.font = `800 24px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`WEEK ${i + 1}`, 0, 12);
          ctx.restore();
        }
      });
    },

    // A swarm of small gold crowns scattered over a region, appearing in a rush with a counter on top.
    // final: what the counter ends on ('500+'). It counts to `n` first.
    swarm(region, { n = 500, at = 0, dur = 2.0, out, final, label = '', icon = 'crown', color = '#f5b82e', seed = 5, size = 11, sound } = {}) {
      const pts = scatter(region, n, seed);
      sfx({ sound }, 'rise', at, 0.2); sfx({ sound }, 'sparkle', at + dur, 0.25);
      s.draw({ at, out, enter: 'none', sfx: false }, (ctx) => {
        const p = clamp((s.t - at) / dur), shown = Math.floor(pts.length * easeOut(p)), u = 1 / z, sz = size * u;
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 3;
        for (let i = 0; i < shown; i++) {
          const [lon, lat] = pts[i], born = clamp((p * pts.length - i) / 14), k = backOut(born);
          ctx.save(); ctx.translate(X(lon), Y(lat)); ctx.scale(k * sz, k * sz);
          ctx.fillStyle = color; ctx.strokeStyle = '#6b4308'; ctx.lineWidth = 0.26;
          if (icon === 'crown') { ctx.beginPath(); ctx.moveTo(-1, 0.8); ctx.lineTo(-1.1, -0.7); ctx.lineTo(-0.5, -0.1); ctx.lineTo(0, -1); ctx.lineTo(0.5, -0.1); ctx.lineTo(1.1, -0.7); ctx.lineTo(1, 0.8); ctx.closePath(); ctx.fill(); ctx.stroke(); }
          else { ctx.beginPath(); ctx.arc(0, 0, 0.9, 0, TAU); ctx.fill(); ctx.stroke(); }
          ctx.restore();
        }
        ctx.restore();
      });
      if (label) {
        screenLayer({ at, out, enter: 'none' }, (ctx) => {
          const p = clamp((s.t - at) / dur), v = Math.round(n * easeOut(p));
          toon(ctx, `${p >= 1 && final ? final : v} ${label}`, W / 2, H * 0.075, 62 * S);
        });
      }
    },

    // "NO!" speech bubbles popping up at spots on the map. points: [[lon, lat], ...] (or use f.scatter('India', 24)).
    bubbles(points, { text = 'NO!', color = '#d62d27', at = 0, gap = 0.07, out, size = 24, sound } = {}) {   // text may be an array: one word per bubble (scripts, greetings)
      points.forEach((_, i) => { if (i % 3 === 0) sfx({ sound }, 'pop', at + i * gap, 0.12); });
      s.draw({ at, out, enter: 'none', sfx: false }, (ctx) => {
        points.forEach(([lon, lat], i) => {
          const age = s.t - (at + i * gap); if (age < 0) return;
          const k = backOut(clamp(age / 0.2)), u = 1 / z;
          ctx.save(); ctx.translate(X(lon), Y(lat)); ctx.scale(u * k, u * k);
          ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 4;
          const word = Array.isArray(text) ? text[i % text.length] : text;
          ctx.font = `800 ${size * 1.15}px ${FONT}`;
          const w = Math.max(size * 2.6, ctx.measureText(word).width + size * 0.9), h = size * 1.7;
          ctx.beginPath(); ctx.ellipse(0, -h * 0.75, w / 2, h / 2, 0, 0, TAU); ctx.moveTo(-size * 0.5, -h * 0.35); ctx.lineTo(-size * 0.9, 0); ctx.lineTo(size * 0.1, -h * 0.3); ctx.fillStyle = '#fff'; ctx.fill();
          ctx.shadowColor = 'transparent'; ctx.lineWidth = 2; ctx.strokeStyle = '#17120e'; ctx.stroke();
          ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(word, 0, -h * 0.72);
          ctx.restore();
        });
      });
    },

    // A cartoon speech bubble on the screen (not on the map): f.speech('नमस्ते', { x, y, at, out, tail: 'left' | 'right', color }). Any script the font can draw.
    speech(text, { x = 0.5, y = 0.5, at = 0, out, size = 60, color = '#17120e', fill = '#ffffff', tail = 'left', rot = 0, sound } = {}) {
      sfx({ sound }, 'pop', at, 0.2);
      screenLayer({ at, out, enter: 'none' }, (ctx) => {
        const k = backOut(clamp((s.t - at) / 0.28)), px = size * S;
        ctx.save(); ctx.translate(W * x, H * y); ctx.rotate(rot * Math.PI / 180); ctx.scale(k, k);
        ctx.font = `800 ${px}px ${FONT}`;
        const w = ctx.measureText(text).width + px * 1.1, h = px * 1.7, d = tail === 'left' ? -1 : 1;
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
        ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.45); ctx.moveTo(d * w * 0.25, h * 0.3); ctx.lineTo(d * w * 0.38, h * 0.72); ctx.lineTo(d * w * 0.06, h * 0.4); ctx.fillStyle = fill; ctx.fill();
        ctx.shadowColor = 'transparent'; ctx.lineWidth = px * 0.06; ctx.strokeStyle = '#17120e'; ctx.stroke();
        ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, px * 0.04);
        ctx.restore();
      });
    },

    // A gold trophy that pops on a place.
    trophy({ lon, lat, at = 0, out, size = 120, sound } = {}) {
      sfx({ sound }, 'chime', at, 0.25); sfx({ sound }, 'pop', at, 0.2);
      anchored({ lon, lat, at, out }, (ctx) => {
        const age = s.t - at, k = backOut(clamp(age / 0.35)), u = size / 100;
        ctx.save(); ctx.scale(k * u, k * u); ctx.translate(0, Math.sin(s.T * 3) * -2);
        ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = '#6b4308';
        ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 10;
        for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 38, -78, 18, 22, 0, 0, TAU); ctx.lineWidth = 8; ctx.strokeStyle = '#6b4308'; ctx.stroke(); ctx.lineWidth = 4.5; ctx.strokeStyle = '#f2b51d'; ctx.stroke(); }
        ctx.lineWidth = 4; ctx.strokeStyle = '#6b4308';
        ctx.beginPath(); ctx.moveTo(-36, -108); ctx.lineTo(36, -108); ctx.quadraticCurveTo(34, -52, 8, -40); ctx.lineTo(8, -26); ctx.lineTo(-8, -26); ctx.lineTo(-8, -40); ctx.quadraticCurveTo(-34, -52, -36, -108); ctx.closePath();
        const g = ctx.createLinearGradient(-36, 0, 36, 0); g.addColorStop(0, '#f7c93a'); g.addColorStop(0.5, '#ffe58a'); g.addColorStop(1, '#e0a118');
        ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
        roundRect(ctx, -26, -26, 52, 12, 3); ctx.fillStyle = '#e9a817'; ctx.fill(); ctx.stroke();
        roundRect(ctx, -34, -14, 68, 14, 3); ctx.fillStyle = '#7a4b22'; ctx.fill(); ctx.stroke();
        const sp = (Math.sin(s.T * 4) + 1) / 2;                       // a sparkle that twinkles
        ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * sp})`; ctx.beginPath(); ctx.moveTo(-14, -92); ctx.lineTo(-10, -84); ctx.lineTo(-14, -76); ctx.lineTo(-18, -84); ctx.closePath(); ctx.fill();
        ctx.restore();
      });
    },

    // Confetti shot up from both sides, then falling. Screen-fixed.
    confetti({ at = 0, dur = 2.6, count = 150, out, sound } = {}) {
      sfx({ sound }, 'pop', at, 0.3); sfx({ sound }, 'sparkle', at + 0.1, 0.25);
      const cols = ['#ff4d6d', '#ffd23f', '#4dd2ff', '#7cff6b', '#c77dff', '#ff9f1c'];
      screenLayer({ at, out, enter: 'none' }, (ctx) => {
        const age = s.t - at; if (age < 0 || age > dur + 1) return;
        for (let i = 0; i < count; i++) {
          const r = rng(900 + i), left = i % 2 === 0, delay = r() * 0.25;
          const a = age - delay; if (a < 0) continue;
          const vx = (left ? 1 : -1) * (260 + r() * 520) * S, vy = -(900 + r() * 900) * S, g = 1700 * S;
          const x = (left ? -20 : W + 20) + vx * a * (1 - 0.35 * a), y = H * 0.62 + vy * a + 0.5 * g * a * a;
          if (y > H + 40) continue;
          ctx.save(); ctx.translate(x, y); ctx.rotate(r() * TAU + a * (4 + r() * 8)); ctx.fillStyle = cols[i % cols.length];
          ctx.globalAlpha *= clamp(1 - (age - dur) / 1); ctx.fillRect(-11 * S, -6 * S, 22 * S, 12 * S * Math.abs(Math.cos(a * 9 + i)));
          ctx.restore();
        }
      });
    },

    // The cartoon person on screen. x, y: where the feet are, as fractions of the frame; height: fraction of the frame height.
    // mood: neutral | shock | happy | angry | worried. hold: raise a passport. Slides in from the left when `from` is set.
    person({ x = 0.5, y = 0.8, height = 0.27, at = 0, out, mood = 'neutral', hold = false, from = null, walk = false, flip = false, moods = null, outfit = {} } = {}) {
      screenLayer({ at, out, enter: 'none' }, (ctx) => {
        const age = s.t - at, p = easeOut(clamp(age / 0.5));
        let px = W * x;
        if (from != null) px = W * (from + (x - from) * p);
        const m = moods ? [...moods].reverse().find(([when]) => s.t >= when)?.[1] ?? mood : mood;
        const u = (H * height) / 10, moving = from != null && p < 1;
        ctx.save(); ctx.translate(px, H * y); ctx.scale(flip ? -u : u, u);
        ctx.globalAlpha *= clamp(age / 0.1);
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(0, 0.1, 2.6, 0.5, 0, 0, TAU); ctx.fill();
        drawPerson(ctx, { ...outfit, mood: m, hold, t: s.T, walk: moving || walk ? s.T * 11 : 0 });
        ctx.restore();
      });
    },

    // A full-frame cut-away: a street ('street') or a plain sky ('sky'). Everything else drawn after it sits on top.
    backdrop(kind = 'street', { at = 0, out, sound, ...opts } = {}) {
      sfx({ sound }, 'swipe', at, 0.25);
      s.draw({ at: -1, enter: 'none', sfx: false }, () => {          // the final render blurs frames where something moves: whip in and out
        if ((s.t > at && s.t < at + 0.25) || (out != null && s.t > out - 0.02 && s.t < out + 0.22)) s.engine.moving = true;
      });
      screenLayer({ at, out, enter: 'none', exit: 'none' }, (ctx) => {
        const p = easeOut(clamp((s.t - at) / 0.22));
        ctx.save(); ctx.translate(0, (1 - p) * H * 0.08); ctx.globalAlpha *= p;
        if (kind === 'street') drawStreet(ctx, W, H, s.T);
        else if (api.scenes?.[kind]) api.scenes[kind](ctx, { W, H, S, t: s.t, T: s.T, at, ...opts });
        else drawSky(ctx, W, H, 'sky');
        ctx.restore();
      });
    },

    // The border-post gag: a street, the person walks up, a barrier drops, an officer stamps the passport.
    // Times are absolute seconds (use t('#marker')); the defaults spread the beats over about 4 s after `at`.
    borderScene({ at = 0, out, sign = 'GURUGRAM', sub = '2 km', stampText = 'ENTRY DENIED', officerAt, barrierAt, passportAt, stampAt, sound } = {}) {
      officerAt ??= at + 0.9; barrierAt ??= at + 1.1; passportAt ??= at + 2.3; stampAt ??= at + 3.0;
      api.backdrop('street', { at, out, sound });
      sfx({ sound }, 'whoosh', at + 0.1, 0.2); sfx({ sound }, 'pop', officerAt, 0.25); sfx({ sound }, 'click', barrierAt, 0.3); sfx({ sound }, 'thud', barrierAt + 0.2, 0.25);
      sfx({ sound }, 'whoosh', passportAt, 0.2); sfx({ sound }, 'thud', stampAt + 0.15, 0.45); sfx({ sound }, 'click', stampAt + 0.16, 0.2);
      screenLayer({ at, out, enter: 'none', exit: 'none' }, (ctx) => {
        const T = s.T, t = s.t, roadY = H * 0.7;
        // sign on a pole
        ctx.save(); ctx.translate(W * 0.27, roadY + H * 0.02);
        ctx.fillStyle = '#6b6f78'; ctx.fillRect(-6 * S, -H * 0.3, 12 * S, H * 0.3);
        roundRect(ctx, -W * 0.19, -H * 0.4, W * 0.38, H * 0.105, 10); ctx.fillStyle = '#13894b'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#f5f5f0'; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `800 ${58 * S}px ${FONT}`; ctx.fillText(sign, 0, -H * 0.368); ctx.font = `700 ${36 * S}px ${FONT}`; ctx.fillText(sub, 0, -H * 0.332);
        ctx.restore();
        // the person walks in from the left
        const q = easeOut(clamp((t - at) / 0.6)), px = W * (-0.15 + (0.26 + 0.15) * q), moving = q < 1;
        const hold = t >= passportAt;
        const mood = t >= stampAt ? 'angry' : t >= at + 0.6 ? 'shock' : 'neutral';
        const u = (H * 0.31) / 10;
        ctx.save(); ctx.translate(px, H * 0.83); ctx.scale(u, u);
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0.1, 2.8, 0.5, 0, 0, TAU); ctx.fill();
        drawPerson(ctx, { mood, hold: false, t: T, walk: moving ? T * 11 : 0, look: 0.6 });
        ctx.restore();
        // booth and officer
        const boothX = W * 0.74, boothW = W * 0.32, boothTop = H * 0.65;
        const up = easeOut(clamp((t - officerAt) / 0.35));
        ctx.save(); ctx.beginPath(); ctx.rect(boothX - boothW / 2 - 40, 0, boothW + 80, boothTop + 4); ctx.clip();
        ctx.translate(boothX, boothTop + (1 - up) * H * 0.2 + 6); const ou = (H * 0.24) / 10; ctx.scale(ou, ou); ctx.translate(0, 3.4);
        drawOfficer(ctx, { stampT: clamp((t - stampAt) / 0.18), t: T });
        ctx.restore();
        roundRect(ctx, boothX - boothW / 2, boothTop, boothW, H * 0.12, 8); ctx.fillStyle = '#c98a4b'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#6e421b'; ctx.stroke();
        ctx.fillStyle = '#8a5424'; ctx.fillRect(boothX - boothW / 2 - 12, boothTop - 10, boothW + 24, 20);
        ctx.fillStyle = '#5a3412'; ctx.font = `800 ${44 * S}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BORDER', boothX, boothTop + H * 0.062);
        // passport flies to the booth, then gets the stamp
        if (hold) {
          const pp = easeOut(clamp((t - passportAt) / 0.45)), sx = px + 3 * u + (boothX - 0.0 * boothW - (px + 3 * u)) * pp, sy = H * 0.83 - 9 * u * (1 - pp) + (boothTop - H * 0.01 - H * 0.83 + 9 * u) * pp;
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.25 * (1 - pp)); ctx.scale(u * 0.95, u * 0.95); drawPassport(ctx);
          if (t >= stampAt + 0.16) {
            const sp = clamp((t - stampAt - 0.16) / 0.12);
            ctx.save(); ctx.rotate(-0.28); ctx.scale(1 + 0.4 * (1 - sp), 1 + 0.4 * (1 - sp)); ctx.globalAlpha = 0.95;
            ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 0.14; roundRect(ctx, -1.5, -0.45, 3.0, 0.9, 0.1); ctx.stroke();
            ctx.fillStyle = '#ff3b30'; ctx.font = `800 0.42px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(stampText, 0, 0.03);
            ctx.restore();
          }
          ctx.restore();
        }
        // the barrier arm: up first, then drops across the road
        const drop = easeOut(clamp((t - barrierAt) / 0.28)), ang = (-1.35 * (1 - drop) + 0.05 * Math.sin(drop * Math.PI * 3) * (1 - drop));
        ctx.save(); ctx.translate(W * 0.5, H * 0.79);
        ctx.fillStyle = '#7d818a'; roundRect(ctx, -22, -50, 44, 120, 6); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#3d4047'; ctx.stroke();
        ctx.translate(0, -26); ctx.rotate(ang);
        const L = W * 0.3; roundRect(ctx, -L, -13, L, 26, 7); ctx.save(); ctx.clip();
        for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#f6f6f2' : '#d62d27'; ctx.fillRect(-L + (i * L) / 12, -14, L / 12 + 1, 28); }
        ctx.restore(); roundRect(ctx, -L, -13, L, 26, 7); ctx.lineWidth = 4; ctx.strokeStyle = '#3d4047'; ctx.stroke();
        ctx.restore();
      });
    },

    // A balance scale that tips. left / right: { name: 'Uttar Pradesh', label: 'UTTAR PRADESH', value: '241 MILLION', color, at }
    // (name is a country or state outline drawn on the pan). The heavier side is the one with `heavy: true`; it drops at `tipAt`.
    scale({ left, right, at = 0, out, tipAt, title = '', sound } = {}) {
      tipAt ??= at + 1.6;
      api.backdrop('sky', { at, out, sound });
      sfx({ sound }, 'thud', tipAt, 0.35); sfx({ sound }, 'rise', tipAt - 0.1, 0.12); sfx({ sound }, 'ding', tipAt + 0.55, 0.22);
      [left, right].forEach((it) => { if (it?.at != null) sfx({ sound }, 'pop', it.at + 0.2, 0.22); });
      screenLayer({ at, out, enter: 'none', exit: 'none' }, (ctx) => {
        const t = s.t, px = W / 2, py = H * 0.33, L = W * 0.29, drop = H * 0.2;
        const q = clamp((t - tipAt) / 0.9), tip = q <= 0 ? 0 : (1 - Math.pow(1 - q, 3)) + Math.sin(q * Math.PI * 3) * 0.12 * (1 - q);
        const heavySign = left?.heavy ? -1 : 1;                                         // beam angle: heavier side goes down
        const base = Math.sin(s.T * 1.8) * 0.012 * (1 - clamp(q * 3));
        const ang = base + heavySign * -0.17 * tip * -1;
        const pivot = [px, py], endL = [px - L * Math.cos(ang), py - L * Math.sin(ang)], endR = [px + L * Math.cos(ang), py + L * Math.sin(ang)];
        if (title) toon(ctx, title, W / 2, H * 0.075, 64 * S);
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        // stand
        ctx.fillStyle = '#c98a3a'; ctx.strokeStyle = '#5a3412'; ctx.lineWidth = 6;
        roundRect(ctx, px - 14, py, 28, H * 0.36, 8); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(px, py + H * 0.37, W * 0.16, 28, 0, 0, TAU); ctx.fill(); ctx.stroke();
        // beam
        ctx.beginPath(); ctx.moveTo(endL[0], endL[1]); ctx.lineTo(endR[0], endR[1]); ctx.lineWidth = 20; ctx.strokeStyle = '#5a3412'; ctx.stroke(); ctx.lineWidth = 12; ctx.strokeStyle = '#d29a47'; ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 24, 0, TAU); ctx.fillStyle = '#f3c23e'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#5a3412'; ctx.stroke();
        // pans, items, labels
        [[endL, left], [endR, right]].forEach(([e, it]) => {
          const cx = e[0], cy = e[1] + drop;
          ctx.strokeStyle = '#5a3412'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(cx - W * 0.12, cy); ctx.moveTo(e[0], e[1]); ctx.lineTo(cx + W * 0.12, cy); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(e[0], e[1], 9, 9, 0, 0, TAU); ctx.fillStyle = '#f3c23e'; ctx.fill(); ctx.stroke();
          if (it?.name) {
            const age = t - (it.at ?? at), k = it.at == null ? 1 : clamp(age / 0.4);
            if (k > 0) {
              const g = geometry(it.name, true), bw = g.box.x1 - g.box.x0, bh = g.box.y1 - g.box.y0, fit = Math.min((W * 0.21) / bw, (H * 0.17) / bh) * (it.size ?? 1);
              const fall = it.at == null ? 0 : (1 - backOut(k)) * -H * 0.25;
              ctx.save(); ctx.translate(cx, cy - 4 + fall); ctx.scale(fit, fit); ctx.translate(-(g.box.x0 + g.box.x1) / 2, -g.box.y1);
              trace(ctx, g.rings); ctx.fillStyle = it.color ?? '#e08a1e'; ctx.fill(); ctx.lineWidth = 2 / fit; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.stroke(); ctx.restore();
              ctx.globalAlpha = 1;
            }
          }
          ctx.fillStyle = '#e8a736'; ctx.strokeStyle = '#5a3412'; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(cx - W * 0.14, cy); ctx.quadraticCurveTo(cx, cy + 66, cx + W * 0.14, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
          if (it?.label && t >= (it.at ?? at)) {
            ctx.font = `800 ${32 * S}px ${FONT}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const w = ctx.measureText(it.label).width + 30; roundRect(ctx, cx - w / 2, cy + 62, w, 50 * S, 10); ctx.fillStyle = '#7a4b22'; ctx.fill();
            ctx.fillStyle = '#fff'; ctx.fillText(it.label, cx, cy + 62 + 25 * S);
            if (it.value && t >= tipAt) { const vk = easeOut(clamp((t - tipAt) / 0.3)); ctx.globalAlpha = vk; toon(ctx, it.value, cx, cy + 150 * S, 40 * S, { color: '#ffd23f', stroke: 0.22 }); ctx.globalAlpha = 1; }
          }
        });
        ctx.restore();
      });
    },
  };
  api.layer = screenLayer;
  api.anchored = anchored;
  return addProps(api, { s, cam, W, H, S, screenLayer, anchored, toon, drawPerson, drawPassport, roundRect, clamp, easeOut, backOut, rng, FONT, OUTLINE, sfx, X, Y, geometry, trace });
}
