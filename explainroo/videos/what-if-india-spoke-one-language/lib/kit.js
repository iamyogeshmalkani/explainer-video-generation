// History-map kit for explainroo: a satellite map of the world with a camera
// that flies between places, countries filled with colours or flags, round
// portrait medallions, dashed callouts, big year tags, a flash transition and
// the "few words at a time" captions. See ../README.md for how to use it.
//
//   const cam = fly(s, [...]);   // call first in the scene
//   const k = kit(s, cam);       // helpers bound to this frame's camera
//   basemap(s); k.fill([...]); k.label(...); k.medallion(...);
//   k.vignette(); k.title(...); k.year(...); k.captions();   // last: they sit on top
import COUNTRIES from '../data/countries.js';
import INDIA_STATES from '../data/india-states.js';
import { drawFlag } from './flags.js';

const TAU = Math.PI * 2;
export const PPD = 14; // world pixels per degree of latitude at zoom 1
let K = Math.cos((45 * Math.PI) / 180);

// The map is a plain lon/lat map squeezed sideways so shapes look right near
// the "standard parallel" (45 is good for Europe and the US; use 0 for Africa).
export function setParallel(deg) { K = Math.cos((deg * Math.PI) / 180); }
export const X = (lon) => lon * K * PPD;
export const Y = (lat) => -lat * PPD;

const ALIAS = {
  USA: 'United States of America', US: 'United States of America', America: 'United States of America',
  UK: 'United Kingdom', Britain: 'United Kingdom', 'Czech Republic': 'Czechia',
  'Dominican Republic': 'Dominican Rep.', 'Ivory Coast': "Côte d'Ivoire", Burma: 'Myanmar',
  Bosnia: 'Bosnia and Herz.', 'Equatorial Guinea': 'Eq. Guinea', Macedonia: 'North Macedonia', Congo: 'Dem. Rep. Congo',
};
// Countries, then India's states and union territories by their own names ('Kerala', 'Uttar Pradesh').
const BY_NAME = new Map([...COUNTRIES, ...INDIA_STATES].map((c) => [c.name, c]));
// 'India' is always the official Survey of India outline (all states together), never the world-atlas one.
BY_NAME.set('India', { name: 'India', rings: INDIA_STATES.flatMap((c) => c.rings) });

// Handy groups (names as the data uses them).
export const REGIONS = {
  southAmerica: ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'],
  northAmerica: ['Canada', 'United States of America', 'Mexico', 'Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Haiti', 'Dominican Rep.', 'Jamaica', 'Bahamas'],
  spanishAmerica: ['Mexico', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Dominican Rep.', 'Colombia', 'Venezuela', 'Ecuador', 'Peru', 'Bolivia', 'Chile', 'Argentina', 'Paraguay', 'Uruguay'],
  indiaStates: INDIA_STATES.map((c) => c.name),
  india28: INDIA_STATES.map((c) => c.name).filter((n) => !['Jammu and Kashmir', 'Andaman and Nicobar', 'Lakshadweep', 'Delhi', 'Chandigarh', 'Puducherry', 'Dadra and Nagar Haveli', 'Daman and Diu'].includes(n)),
  europe: ['France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Belgium', 'Netherlands', 'Switzerland', 'Austria', 'Poland', 'Czechia', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Serbia', 'Denmark', 'Norway', 'Sweden', 'Finland', 'Ireland', 'United Kingdom'],
};

const ringCache = new Map();
// Adds your own region by name from [lon, lat] points (a city, a district), so k.fill(name), f.swarm(name) and friends work on it.
export function addRegion(name, pts) { BY_NAME.set(name, { name, rings: [pts.flatMap((p) => p)] }); ringCache.clear(); }
export function geometry(name, mainland, within) {
  const key = `${name}|${mainland}|${within ? within.join(',') : ''}`;   // mainland: true (12 degrees around the biggest piece), a number of degrees, or false for every piece
  if (ringCache.has(key)) return ringCache.get(key);
  const c = BY_NAME.get(ALIAS[name] || name);
  if (!c) {
    const near = [...BY_NAME.keys()].filter((n) => n[0] === name[0]).slice(0, 8).join(', ');
    throw new Error(`map kit: no country called "${name}". Names starting with ${name[0]}: ${near || 'none'}`);
  }
  let rings = c.rings;
  if (within) {
    // keep only the pieces whose middle lies in [lonMin, latMin, lonMax, latMax], e.g. Alaska out of the USA
    const mid = (r) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < r.length; i += 2) { x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]); y0 = Math.min(y0, r[i + 1]); y1 = Math.max(y1, r[i + 1]); } return [(x0 + x1) / 2, (y0 + y1) / 2]; };
    rings = rings.filter((r) => { const [mx, my] = mid(r); return mx >= within[0] && mx <= within[2] && my >= within[1] && my <= within[3]; });
    if (!rings.length) throw new Error(`map kit: nothing of "${name}" lies inside ${within.join(', ')}`);
    mainland = false;
  }
  const radius = name === 'India' ? 0 : mainland === true ? 12 : mainland;   // India is every piece: the north-east and the islands are India too
  if (radius && rings.length > 1) {
    const info = rings.map((r) => {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let i = 0; i < r.length; i += 2) { x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]); y0 = Math.min(y0, r[i + 1]); y1 = Math.max(y1, r[i + 1]); }
      return { r, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, area: (x1 - x0) * (y1 - y0) };
    });
    const big = info.reduce((a, b) => (b.area > a.area ? b : a));
    rings = info.filter((i) => Math.hypot(i.cx - big.cx, i.cy - big.cy) < radius).map((i) => i.r);
  }
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const r of rings) {
    for (let i = 0; i < r.length; i += 2) {
      const x = X(r[i]); const y = Y(r[i + 1]);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  const g = { rings, box: { x0, y0, x1, y1 }, K };
  ringCache.set(key, g);
  return g;
}

export function trace(ctx, rings) {
  ctx.beginPath();
  for (const r of rings) {
    ctx.moveTo(X(r[0]), Y(r[1]));
    for (let i = 2; i < r.length; i += 2) ctx.lineTo(X(r[i]), Y(r[i + 1]));
    ctx.closePath();
  }
}

// Moves the camera. keys: [{ at, lon, lat, span, dur }]. `span` is how many
// degrees of latitude fit the frame height (Europe is about 35, the whole
// Atlantic about 130). The first key is the opening shot and is in place from
// the very first frame; each next key is a flight that starts at `at` and
// lasts `dur` seconds. To continue from the previous scene, give the first key
// that scene's last view. Call this first in the scene.
//
// This is the engine's s.camera() with one change: the opening view really is
// where the camera is at t = 0 (s.camera starts from the frame centre).
export function fly(s, keys, o = {}) {
  // focusY: how far down the frame the camera's point of interest sits (0.46 leaves the top for the
  // title and the year, and the bottom for the captions)
  const fx = s.cx;
  const fy = s.H * (o.focusY ?? 0.46);
  const list = keys.map((k, i) => ({
    at: i === 0 ? 0 : k.at ?? 0,
    dur: k.dur ?? 1.8,
    x: X(k.lon), y: Y(k.lat), zoom: s.H / (PPD * k.span),
  })).sort((a, b) => a.at - b.at);
  if (s.engine.planning) s.engine.manualCamera = true; // no automatic camera in this scene
  let cur = { x: list[0].x, y: list[0].y, zoom: list[0].zoom, rotate: 0 };
  for (let i = 1; i < list.length; i++) {
    const k = list[i];
    if (s.t < k.at) break;
    const raw = (s.t - k.at) / Math.max(0.001, k.dur / s.pace);
    if (raw > 0 && raw < 1) s.engine.moving = true; // lets the render add motion blur
    const q = Math.min(1, Math.max(0, raw));
    const p = q * q * q * (q * (q * 6 - 15) + 10); // smooth start and stop
    cur = { x: cur.x + (k.x - cur.x) * p, y: cur.y + (k.y - cur.y) * p, zoom: cur.zoom + (k.zoom - cur.zoom) * p, rotate: 0 };
  }
  // The picture never freezes: a slow push-in over the scene and a tiny sway (drift: 0 turns it off).
  const d = o.drift ?? 1;
  if (d) cur = { ...cur, zoom: cur.zoom * (1 + 0.05 * d * (s.t / Math.max(1, s.dur))), x: cur.x + (Math.sin(s.t * 0.35) * 5 * d) / cur.zoom, y: cur.y + (Math.cos(s.t * 0.27) * 4 * d) / cur.zoom };
  // beats: a quick 4% zoom punch with a small shake at each time, like an edit cut on the beat (pass the marker times).
  for (const b of o.beats || []) {
    const q = (s.t - b) / 0.3;
    if (q > 0 && q < 1) {
      const k = Math.sin(q * Math.PI);
      cur = { ...cur, zoom: cur.zoom * (1 + (o.punch ?? 0.04) * k), x: cur.x + (Math.sin(s.t * 91) * 5 * (1 - q)) / cur.zoom, y: cur.y + (Math.cos(s.t * 83) * 5 * (1 - q)) / cur.zoom };
    }
  }
  s._camMoved = true;
  const ctx = s.ctx;
  ctx.translate(fx, fy);
  ctx.scale(cur.zoom, cur.zoom);
  ctx.translate(-cur.x, -cur.y);
  return { ...cur, fx, fy };
}

// The satellite picture. Put it first after fly().
export function basemap(s) {
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(s.engine.image('assets/basemap.jpg'), X(-180), Y(90), 360 * K * PPD, 180 * PPD);
  });
}

export function shadowText(ctx, text, x, y, size, o = {}) {
  ctx.save();
  ctx.font = `${o.weight ?? 800} ${size}px ${o.family ?? '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif'}`;
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = o.shadowColor ?? 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = size * 0.28;
  ctx.shadowOffsetY = size * 0.06;
  ctx.fillStyle = o.color ?? '#ffffff';
  if (o.spacing) ctx.letterSpacing = `${o.spacing}px`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function pentagon(ctx, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * TAU) / 5;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// Splits the spoken words into short caption chunks (1 to 3 words).
function chunks(words, maxChars, maxWords = 3) {
  const out = [];
  let cur = null;
  for (const w of words) {
    const t = w.text;
    if (cur && (cur.text.length + 1 + t.length > maxChars || cur.n >= maxWords || /[.,;:!?]$/.test(cur.text))) { out.push(cur); cur = null; }
    if (!cur) cur = { text: t, start: w.start, end: w.end, n: 1 };
    else { cur.text += ` ${t}`; cur.end = w.end; cur.n += 1; }
  }
  if (cur) out.push(cur);
  return out;
}

// Helpers bound to this frame's camera, so labels and badges keep the same
// size on screen however far the camera has zoomed.
export function kit(s, cam) {
  const z = cam.zoom;
  const U = (inv) => (inv ? 1 / z : 1);

  // Draws `fn` in screen coordinates (the camera is undone).
  const screenLayer = (o, fn) => {
    s.draw({ at: o.at ?? -1, out: o.out, enter: o.enter ?? 'none', sfx: false }, (ctx, life) => {
      ctx.save();
      ctx.translate(cam.x, cam.y);
      if (cam.rotate) ctx.rotate((-cam.rotate * Math.PI) / 180);
      ctx.scale(1 / z, 1 / z);
      ctx.translate(-cam.fx, -cam.fy);
      fn(ctx, life);
      ctx.restore();
    });
  };

  return {
    // Fills countries with a colour or their flag.
    // names: 'France' or ['France', 'Germany'] or a REGIONS list.
    fill(names, o = {}) {
      const list = [].concat(names);
      if (o.sound !== false) s.sfx(o.flag ? 'click' : 'pop', o.at ?? 0, { gain: o.flag ? 0.14 : 0.1 });
      // within: [lonMin, latMin, lonMax, latMax] fills only part of a country; flagOf: use another country's flag
      const { color = '#d7282f', alpha = 0.86, flag = false, border = '#f2c14e', mainland = true, within = null, flagOf = null } = o;
      s.draw({ at: o.at ?? 0, out: o.out, enter: o.enter ?? 'fade', sfx: false }, (ctx) => {
        const a0 = ctx.globalAlpha;
        for (const name of list) {
          const g = geometry(name, mainland, within);
          let done = false;
          if (flag) {
            ctx.save();
            trace(ctx, g.rings);
            ctx.clip();
            done = drawFlag(ctx, flagOf ?? name, g.box);
            ctx.restore();
          }
          if (!done) {
            trace(ctx, g.rings);
            ctx.globalAlpha = a0 * alpha;
            ctx.fillStyle = o.colors?.[name] ?? color;
            ctx.fill();
            ctx.globalAlpha = a0;
          }
          trace(ctx, g.rings);
          ctx.lineJoin = 'round';
          ctx.lineWidth = 2.4 * U(true);
          ctx.strokeStyle = border;
          ctx.stroke();
          // a glow on the outline for the first 0.8 s, so the eye goes to the country that just lit up
          const glow = o.pulse === false ? 0 : Math.max(0, 1 - (s.t - s.time(o.at ?? 0)) / 0.8);
          if (glow > 0) {
            ctx.save();
            ctx.shadowColor = border; ctx.shadowBlur = 40 * glow;
            ctx.lineWidth = (2.4 + 10 * glow) * U(true); ctx.strokeStyle = border; ctx.globalAlpha = a0 * glow;
            trace(ctx, g.rings); ctx.stroke();
            ctx.restore();
          }
        }
      });
    },

    // A text label with a dashed line to a place. dx, dy are screen pixels.
    label(text, o) {
      // plate: true puts a dark translucent plate behind the text. Or use color '#1b1308' and
      // shadowColor 'rgba(255,255,255,0.7)' for dark text on a light fill
      const { lon, lat, dx = 0, size = 46, color = '#ffffff', dash = true } = o;
      if (o.sound !== false) { if (/^[?？]+$/.test(text)) { s.sfx('sparkle', (o.at ?? 0) + 0.05, { gain: 0.22 }); s.sfx('blip', o.at ?? 0, { gain: 0.25 }); } else s.sfx('blip', o.at ?? 0, { gain: 0.14 }); }
      const dy = o.dy ?? (dash ? -150 : 0); // a label with no leader line sits right on the place
      s.draw({ at: o.at ?? 0, out: o.out, enter: 'fade', sfx: false }, (ctx) => {
        const px = X(lon);
        const py = Y(lat);
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1 / z, 1 / z);
        if (dash) {
          ctx.setLineDash([14, 10]);
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(255,255,255,0.92)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(dx, dy + (dy < 0 ? size * 0.7 : -size * 0.7));
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, TAU);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(0,0,0,0.6)';
          ctx.stroke();
        }
        if (o.plate) {
          // a dark translucent plate behind the text, for labels that sit on a busy fill
          ctx.save();
          ctx.font = `800 ${size}px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif`;
          const w = ctx.measureText(text).width + size * 0.9;
          const h = size * 1.5;
          ctx.fillStyle = 'rgba(8,14,24,0.62)';
          ctx.beginPath();
          ctx.roundRect(dx - w / 2, dy - h / 2, w, h, h / 2);
          ctx.fill();
          ctx.restore();
        }
        shadowText(ctx, text, dx, dy, size, { color, align: o.align, shadowColor: o.shadowColor });
        ctx.restore();
      });
    },

    // A round badge. Give it `image` (a file in assets/) or `text` (a monogram).
    medallion(o) {
      const { lon, lat, r = 68, text = '', image = null } = o;
      s.draw({ at: o.at ?? 0, out: o.out, enter: 'fade', sfx: false }, (ctx, life) => {
        ctx.save();
        ctx.translate(X(lon), Y(lat));
        const pop = 0.6 + 0.4 * (life.p ?? 1);
        ctx.scale(pop / z, pop / z);
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;
        pentagon(ctx, r * 1.12);
        ctx.fillStyle = '#f4ecd8';
        ctx.fill();
        ctx.shadowColor = 'transparent';
        if (image) {
          const img = s.engine.image(`assets/${image}`);
          ctx.save();
          pentagon(ctx, r * 1.04);
          ctx.clip();
          const sc = (r * 2.2) / Math.min(img.naturalWidth, img.naturalHeight);
          ctx.drawImage(img, -(img.naturalWidth * sc) / 2, -(img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc);
          ctx.restore();
        } else {
          ctx.fillStyle = o.color ?? '#2b2118';
          ctx.font = `700 ${r * 1.05}px "Instrument Serif", "Noto Sans Devanagari", serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, 0, r * 0.1);
        }
        pentagon(ctx, r * 1.12);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#e3b341';
        ctx.stroke();
        ctx.restore();
      });
    },

    // Title in the top left, like "World War I".
    title(text, o = {}) {
      screenLayer({ at: o.at ?? 0.1, out: o.out, enter: 'fade' }, (ctx) => {
        shadowText(ctx, text, s.safe.left + 10, s.safe.top + 70, o.size ?? 66, { align: 'left' });
      });
    },

    // A big year in the middle near the top.
    year(text, o = {}) {
      if (o.sound !== false) s.sfx('chime', o.at ?? 0, { gain: 0.2 });
      screenLayer({ at: o.at ?? 0, out: o.out, enter: 'fade' }, (ctx, life) => {
        const pop = 0.82 + 0.18 * (life.p ?? 1);
        ctx.save();
        ctx.translate(s.cx, s.safe.top + (o.y ?? 250));
        ctx.scale(pop, pop);
        shadowText(ctx, text, 0, 0, o.size ?? 150, { weight: 900, color: o.color ?? '#ffffff' });
        ctx.restore();
      });
    },

    // A small paper card that pops up (a book, a map, a newspaper).
    card(o) {
      screenLayer({ at: o.at ?? 0, out: o.out, enter: 'fade' }, (ctx, life) => {
        const w = o.w ?? 500;
        const h = o.h ?? 330;
        const pop = 0.8 + 0.2 * (life.p ?? 1);
        ctx.save();
        ctx.translate(s.cx + (o.dx ?? 0), s.safe.top + (o.y ?? 560));
        ctx.rotate(((o.tilt ?? -3) * Math.PI) / 180);
        ctx.scale(pop, pop);
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = '#f4ecd8';
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#8a6d3b';
        ctx.lineWidth = 4;
        ctx.strokeRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24);
        ctx.fillStyle = '#2b2118';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${o.titleSize ?? 66}px "Instrument Serif", "Noto Sans Devanagari", serif`;
        ctx.fillText(o.title ?? '', 0, -h * 0.12);
        ctx.font = `600 ${o.subSize ?? 36}px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif`;
        ctx.fillStyle = '#6b5a3c';
        ctx.fillText(o.sub ?? '', 0, h * 0.2);
        ctx.restore();
      });
    },

    // A warm flash across the whole frame, peaking at `at`.
    flash(at, dur = 0.9) {
      s.sfx('thud', at, { gain: 0.3 });
      screenLayer({ at: at - dur / 2 }, (ctx, life) => {
        const a = Math.max(0, 1 - Math.abs(life.local - dur / 2) / (dur / 2));
        if (a <= 0) return;
        const g = ctx.createRadialGradient(s.cx, s.cy + s.H * 0.25, 0, s.cx, s.cy, s.H * 0.8);
        g.addColorStop(0, `rgba(255,255,235,${a})`);
        g.addColorStop(0.5, `rgba(255,196,80,${a * 0.9})`);
        g.addColorStop(1, `rgba(255,120,40,${a * 0.8})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s.W, s.H);
      });
    },

    // Darkens the top and the bottom a little so text stays readable.
    vignette() {
      screenLayer({ at: -1 }, (ctx) => {
        const top = ctx.createLinearGradient(0, 0, 0, s.H * 0.3);
        top.addColorStop(0, 'rgba(0,0,0,0.55)');
        top.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, s.W, s.H * 0.3);
        const bot = ctx.createLinearGradient(0, s.H * 0.55, 0, s.H);
        bot.addColorStop(0, 'rgba(0,0,0,0)');
        bot.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = bot;
        ctx.fillRect(0, s.H * 0.55, s.W, s.H * 0.45);
      });
    },

    // The narration, a few words at a time, white with a shadow.
    // Set "captions": false in video.json when you use this.
    captions(o = {}) {
      const list = chunks(s.words || [], o.maxChars ?? 16);
      screenLayer({ at: -1 }, (ctx) => {
        const t = s.t;
        let cur = null;
        for (let i = 0; i < list.length; i++) {
          const next = list[i + 1];
          if (t >= list[i].start - 0.05 && t < (next ? next.start - 0.05 : list[i].end + 0.4)) { cur = list[i]; break; }
        }
        if (!cur) return;
        const k = Math.min(1, (t - cur.start + 0.05) / 0.12);
        ctx.save();
        ctx.globalAlpha *= Math.max(0, k);
        shadowText(ctx, cur.text, s.cx, s.H * (o.y ?? 0.6) + (1 - k) * 10, o.size ?? 62, { weight: 800 });
        ctx.restore();
      });
    },

    // ---- what-if additions -------------------------------------------------

    // A red map pin standing on a place (screen-sized, so it stays the same on any zoom).
    pin(o) {
      const { lon, lat, at = 0, r = 15 } = o;
      if (o.sound !== false) s.sfx('pop', at + 0.2, { gain: 0.2 });
      s.draw({ at, out: o.out, enter: 'none', sfx: false }, (ctx, life) => {
        const drop = Math.min(1, (s.t - at) / 0.25);
        ctx.save();
        ctx.translate(X(lon), Y(lat));
        ctx.scale(1 / z, 1 / z);
        ctx.globalAlpha *= Math.max(0, drop);
        ctx.translate(0, -(1 - Math.max(0, drop)) * 60);
        const age = s.t - at;
        if (age < 0.9) { const q = age / 0.9; ctx.beginPath(); ctx.arc(0, 0, 10 + 80 * q, 0, TAU); ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - q)})`; ctx.lineWidth = 4; ctx.stroke(); }
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
        ctx.strokeStyle = '#d8d8d8'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 3.4); ctx.stroke();
        ctx.fillStyle = o.color ?? '#d7282f';
        ctx.beginPath(); ctx.arc(0, -r * 3.9, r, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath(); ctx.arc(-r * 0.3, -r * 4.2, r * 0.35, 0, TAU); ctx.fill();
        ctx.restore();
      });
    },

    // A big emoji (a face, a flexed arm, a rose) that pops in on a place.
    emoji(char, o) {
      const { lon, lat, size = 120, at = 0 } = o;
      if (o.sound !== false) s.sfx('pop', at, { gain: 0.24 });
      s.draw({ at, out: o.out, enter: 'none', sfx: false }, (ctx) => {
        const p = Math.min(1, Math.max(0, (s.t - at) / 0.3));
        const pop = p < 1 ? 1 + 0.25 * Math.sin(p * Math.PI) : 1;
        ctx.save();
        ctx.translate(X(lon), Y(lat));
        ctx.scale(1 / z, 1 / z);
        ctx.translate(o.dx ?? 0, o.dy ?? 0);
        const age = s.t - at;
        if (age < 0.8) { const q = age / 0.8; ctx.beginPath(); ctx.arc(0, 0, size * 0.3 + size * 0.9 * q, 0, TAU); ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - q)})`; ctx.lineWidth = 4; ctx.stroke(); }
        ctx.scale(p * pop, p * pop);
        ctx.font = `${size}px "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
        ctx.fillText(char, 0, 0);
        ctx.restore();
      });
    },

    // Small serif tag on the map, like RICH (green) or POOR (red). Drawn in map units so it stays with the place.
    tag(text, o) {
      const { lon, lat, at = 0, color = '#3ddc6a', size = 34 } = o;
      if (o.sound !== false) s.sfx('ding', at, { gain: 0.16 });
      s.draw({ at, out: o.out, enter: 'fade', sfx: false }, (ctx) => {
        ctx.save();
        ctx.translate(X(lon), Y(lat));
        ctx.scale(1 / z, 1 / z);
        ctx.font = `400 ${size}px "Instrument Serif", serif`;
        ctx.letterSpacing = '2px';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = color; ctx.shadowBlur = 14;
        ctx.fillStyle = color;
        ctx.fillText(text, 0, 0);
        ctx.restore();
      });
    },

    // A glowing counter that rolls up to a number (money, people), on the map. Screen-fixed.
    counter(to, o = {}) {
      const { at = 0, dur = 2.2, prefix = '', suffix = '', color = '#7CFF6B' } = o;
      if (o.sound !== false) { s.sfx('rise', at, { gain: 0.16, dur: dur / s.pace }); s.sfx('ding', at + dur / s.pace, { gain: 0.22 }); }
      screenLayer({ at, out: o.out, enter: 'fade' }, (ctx) => {
        const p = Math.min(1, Math.max(0, (s.t - at) / (dur / s.pace)));
        const v = Math.round(to * (1 - Math.pow(1 - p, 3)));
        const txt = prefix + v.toLocaleString('en-US') + suffix;
        ctx.font = `400 ${o.size ?? 64}px "Instrument Serif", serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = color; ctx.shadowBlur = 22;
        ctx.fillStyle = color;
        ctx.fillText(txt, s.cx, s.H * (o.y ?? 0.5));
      });
    },

    // Horizontal ranking bars on a translucent panel (country, value). Bars grow in turn.
    ranking(rows, o = {}) {
      const { at = 0, max = Math.max(...rows.map((r) => r.value)) } = o;
      if (o.sound !== false) { rows.forEach((_, i) => s.sfx('click', at + i * 0.18, { gain: 0.16 })); s.sfx('chime', at + rows.length * 0.18 + 0.4, { gain: 0.2 }); }
      screenLayer({ at, out: o.out, enter: 'fade' }, (ctx) => {
        const w = s.W * 0.78, x0 = s.cx - w / 2, rowH = o.rowH ?? 74, y0 = s.H * (o.y ?? 0.42) - (rows.length * rowH) / 2;
        ctx.fillStyle = 'rgba(10,18,30,0.55)';
        ctx.beginPath(); ctx.roundRect(x0 - 24, y0 - 30, w + 48, rows.length * rowH + 80, 22); ctx.fill();
        rows.forEach((r, i) => {
          const p = Math.min(1, Math.max(0, (s.t - at - i * 0.18) / (0.9 / s.pace)));
          const e = 1 - Math.pow(1 - p, 3);
          const y = y0 + i * rowH;
          ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e6eef7';
          ctx.fillText(r.label, x0, y + 12);
          ctx.fillStyle = r.color ?? '#7b8cff';
          ctx.fillRect(x0 + 230, y, (w - 230) * (r.value / max) * e, 38);
        });
      });
    },

    // A white "paper" scene that covers the map: relief-patterned background, with your own drawing on top.
    // `fn(ctx, p)` draws in screen coordinates; p is the 0..1 entrance progress. Use it for silhouettes and podiums.
    paper(o, fn) {
      if (o.sound !== false) s.sfx('swipe', o.at ?? 0, { gain: 0.25 });
      screenLayer({ at: o.at ?? 0, out: o.out, enter: 'none' }, (ctx) => {
        const p = Math.min(1, Math.max(0, (s.t - (o.at ?? 0)) / 0.25));
        ctx.save();
        ctx.globalAlpha *= p;
        ctx.fillStyle = '#eef1f5';
        ctx.fillRect(0, 0, s.W, s.H);
        ctx.strokeStyle = 'rgba(190,198,210,0.55)'; ctx.lineWidth = 6;
        for (let i = 1; i < 9; i++) {           // nested diamonds, the embossed look of the reference
          const d = i * s.W * 0.13;
          ctx.beginPath(); ctx.moveTo(s.cx, s.cy - d); ctx.lineTo(s.cx + d, s.cy); ctx.lineTo(s.cx, s.cy + d); ctx.lineTo(s.cx - d, s.cy); ctx.closePath(); ctx.stroke();
        }
        fn?.(ctx, p);
        ctx.restore();
      });
    },

    // A slow moving background: drifting specks (like dust or stars) and a soft light that sweeps across the sea.
    // Screen-fixed, subtle, drawn above the map and below the text. Call it before vignette().
    ambient(o = {}) {
      const n = o.count ?? 38;
      screenLayer({ at: -1 }, (ctx) => {
        ctx.save();
        for (let i = 0; i < n; i++) {
          const sp = 8 + s.rand(i * 3 + 1) * 22;                         // px per second
          const x = (s.rand(i * 3) * s.W + s.T * sp * 0.6) % s.W;
          const y = (s.rand(i * 3 + 2) * s.H - s.T * sp + s.H * 4) % s.H;
          const r = 1.2 + s.rand(i * 7 + 5) * 2.4;
          ctx.globalAlpha = (o.alpha ?? 0.35) * (0.4 + 0.6 * Math.abs(Math.sin(s.T * 0.8 + i)));
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        }
        const sweep = ((s.T * 0.06) % 1.4) - 0.2;                           // a slow diagonal glow
        const g = ctx.createLinearGradient(s.W * (sweep - 0.25), 0, s.W * (sweep + 0.25), s.H * 0.5);
        g.addColorStop(0, 'rgba(120,180,255,0)'); g.addColorStop(0.5, `rgba(120,180,255,${o.glow ?? 0.07})`); g.addColorStop(1, 'rgba(120,180,255,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, s.W, s.H);
        ctx.restore();
      });
    },

    // Your own background video (a file in assets/, e.g. a looping globe, a data grid, a news bar) laid over the map at
    // low opacity. Keep it dark and plain so the captions stay readable. Call it before vignette().
    backgroundClip(src, o = {}) {
      s.clip(src, { x: s.cx, y: s.cy, w: s.W, h: s.H, fit: 'cover', at: -1, enter: 'none', exit: 'none', loop: true, opacity: o.opacity ?? 0.25, sfx: false });
    },

    // Outlined captions like the reference: small, bold white with a black outline, 1 to 3 words, low in the frame.
    whatIfCaptions(o = {}) {
      const list = chunks(s.words || [], o.maxChars ?? 12, o.maxWords ?? 2);
      const typing = o.typing ?? 0.09;
      if (typing) list.forEach((c) => s.sfx('type', c.start, { gain: typing, dur: Math.min(0.35, c.end - c.start) }));
      screenLayer({ at: -1 }, (ctx) => {
        const t = s.t;
        let cur = null;
        for (let i = 0; i < list.length; i++) {
          const next = list[i + 1];
          if (t >= list[i].start - 0.05 && t < (next ? next.start - 0.05 : list[i].end + 0.4)) { cur = list[i]; break; }
        }
        if (!cur) return;
        const k = Math.min(1, Math.max(0, (t - cur.start + 0.05) / 0.12));
        const pop = 1 + 0.16 * (1 - k);                                   // each chunk lands with a small punch
        // numbers, amounts and the words in `lit` are yellow, so the key fact stands out
        const hot = /\d|%|million|billion|trillion|crore|lakh/i.test(cur.text) || (o.lit || []).some((w) => cur.text.toLowerCase().includes(w.toLowerCase()));
        ctx.save();
        ctx.translate(s.cx, s.H * (o.y ?? 0.86)); ctx.scale(pop, pop);
        ctx.font = `800 ${o.size ?? 60}px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        ctx.lineWidth = 10; ctx.strokeStyle = '#000';
        ctx.strokeText(cur.text, 0, 0);
        ctx.fillStyle = hot ? (o.hotColor ?? '#ffd84a') : '#fff';
        ctx.fillText(cur.text, 0, 0);
        ctx.restore();
      });
    },

    // ---- India / nature additions: shapes in lon/lat, drawn at screen-sized widths ------------------------------

    // A polygon from [lon, lat] points: a desert, a forest, a plain. Fades in at `at`.
    region(pts, o = {}) {
      const { at = 0, color = '#e0b050', alpha = 0.6, border = 'rgba(255,255,255,0.7)' } = o;
      s.draw({ at, out: o.out, enter: 'fade', sfx: false }, (ctx) => {
        const a0 = ctx.globalAlpha;
        ctx.beginPath();
        pts.forEach(([lon, lat], i) => (i ? ctx.lineTo(X(lon), Y(lat)) : ctx.moveTo(X(lon), Y(lat))));
        ctx.closePath();
        ctx.globalAlpha = a0 * alpha; ctx.fillStyle = color; ctx.fill();
        ctx.globalAlpha = a0; ctx.lineJoin = 'round'; ctx.lineWidth = 2.4 / z; ctx.strokeStyle = border; ctx.stroke();
      });
    },

    // A circle on the map (a lake, a reservoir) whose radius in degrees goes from r0 to r1 over `dur` seconds.
    disc(lon, lat, o = {}) {
      const { at = 0, r0 = 0.1, r1 = r0, dur = 3, color = '#3b9bff', alpha = 0.75 } = o;
      s.draw({ at, out: o.out, enter: 'fade', sfx: false }, (ctx) => {
        const p = Math.min(1, Math.max(0, (s.t - (o.shrinkAt ?? at)) / (dur / s.pace)));
        const r = r0 + (r1 - r0) * p;
        ctx.save(); ctx.globalAlpha *= alpha;
        ctx.beginPath(); ctx.ellipse(X(lon), Y(lat), Math.max(0.0001, r * K * PPD), Math.max(0.0001, r * PPD), 0, 0, TAU);
        ctx.fillStyle = r < 0.02 ? '#7a5a34' : color; ctx.fill();
        ctx.lineWidth = 2 / z; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
        ctx.restore();
      });
    },

    // A river that flows in from its source over `grow` seconds, with moving highlights.
    // dryAt: from then on it fades to a dry brown dashed bed. fadeAt: it fades away completely instead.
    river(pts, o = {}) {
      const { at = 0, grow = 2.2, color = '#5ec8ff', width = 9 } = o;
      if (o.sound !== false) s.sfx('whoosh', at, { gain: 0.12 });
      s.draw({ at, out: o.out, enter: 'none', sfx: false }, (ctx) => {
        const P = pts.map(([lon, lat]) => [X(lon), Y(lat)]);
        const seg = []; let total = 0;
        for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(d); total += d; }
        const p = Math.min(1, Math.max(0, (s.t - at) / (grow / s.pace)));
        const dry = o.dryAt == null ? 0 : Math.min(1, Math.max(0, (s.t - o.dryAt) / 1.4));
        const gone = o.fadeAt == null ? 0 : Math.min(1, Math.max(0, (s.t - o.fadeAt) / 0.8));
        let want = total * p;
        const trace = () => {
          ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
          let w = want;
          for (let i = 1; i < P.length && w > 0; i++) {
            if (seg[i - 1] <= w) { ctx.lineTo(P[i][0], P[i][1]); w -= seg[i - 1]; }
            else { const f = w / seg[i - 1]; ctx.lineTo(P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f); w = 0; }
          }
        };
        ctx.save(); ctx.globalAlpha *= 1 - gone; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        trace(); ctx.lineWidth = (width + 4) / z; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke();
        trace(); ctx.lineWidth = width / z; ctx.strokeStyle = dry > 0 ? `rgb(${Math.round(94 + 44 * dry)},${Math.round(200 - 94 * dry)},${Math.round(255 - 196 * dry)})` : color;
        ctx.setLineDash(dry > 0.5 ? [10 / z, 14 / z] : []); ctx.stroke(); ctx.setLineDash([]);
        if (dry < 0.5) { trace(); ctx.lineWidth = (width * 0.45) / z; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.setLineDash([6 / z, 26 / z]); ctx.lineDashOffset = -s.T * 70 / z; ctx.stroke(); }
        ctx.restore();
      });
    },

    // A mountain ridge: a pale thick line with little peaks along it.
    ridge(pts, o = {}) {
      const { at = 0, color = '#e9e3d3', width = 12, peak = 22 } = o;
      s.draw({ at, out: o.out, enter: 'fade', sfx: false }, (ctx) => {
        const P = pts.map(([lon, lat]) => [X(lon), Y(lat)]);
        ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.lineWidth = width / z; ctx.strokeStyle = 'rgba(70,55,40,0.75)'; ctx.stroke();
        ctx.lineWidth = (width * 0.5) / z; ctx.strokeStyle = color; ctx.stroke();
        const step = (o.step ?? 46) / z; let carry = 0, n = 0;
        for (let i = 1; i < P.length; i++) {
          const dx = P[i][0] - P[i - 1][0], dy = P[i][1] - P[i - 1][1], d = Math.hypot(dx, dy);
          for (let t0 = step - carry; t0 <= d; t0 += step) {
            const f = t0 / d, x = P[i - 1][0] + dx * f, y = P[i - 1][1] + dy * f, h = (peak * (0.7 + 0.5 * ((n++ * 37) % 5) / 5)) / z;
            ctx.beginPath(); ctx.moveTo(x - h * 0.7, y + h * 0.3); ctx.lineTo(x, y - h); ctx.lineTo(x + h * 0.7, y + h * 0.3); ctx.closePath();
            ctx.fillStyle = '#f4f1e8'; ctx.fill(); ctx.lineWidth = 2 / z; ctx.strokeStyle = 'rgba(60,45,30,0.8)'; ctx.stroke();
          }
          carry = (carry + d) % step;
        }
        ctx.restore();
      });
    },

    // Moving arrows along a path (wind, monsoon clouds, people leaving). path: [[lon, lat], ...]
    flow(path, o = {}) {
      const { at = 0, color = '#9fd8ff', width = 9, grow = 1.6 } = o;
      if (o.sound !== false) s.sfx('whoosh', at, { gain: 0.14 });
      s.draw({ at, out: o.out, enter: 'fade', sfx: false }, (ctx) => {
        const P = path.map(([lon, lat]) => [X(lon), Y(lat)]);
        const p = Math.min(1, Math.max(0, (s.t - at) / (grow / s.pace)));
        let total = 0; const seg = [];
        for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(d); total += d; }
        let w = total * p, last = P[0], prev = P[0];
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const trace = () => {
          ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); let ww = w;
          for (let i = 1; i < P.length && ww > 0; i++) {
            prev = P[i - 1];
            if (seg[i - 1] <= ww) { ctx.lineTo(P[i][0], P[i][1]); ww -= seg[i - 1]; last = P[i]; }
            else { const f = ww / seg[i - 1]; last = [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f]; ctx.lineTo(last[0], last[1]); ww = 0; }
          }
        };
        trace(); ctx.lineWidth = (width + 5) / z; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke();
        trace(); ctx.lineWidth = width / z; ctx.strokeStyle = color; ctx.setLineDash([22 / z, 14 / z]); ctx.lineDashOffset = -s.T * 90 / z; ctx.stroke(); ctx.setLineDash([]);
        const a = Math.atan2(last[1] - prev[1], last[0] - prev[0]), h = (width * 2.6) / z;
        ctx.translate(last[0], last[1]); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(h, 0); ctx.lineTo(-h * 0.6, h * 0.8); ctx.lineTo(-h * 0.6, -h * 0.8); ctx.closePath();
        ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 2 / z; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.stroke();
        ctx.restore();
      });
    },

    // Seawater creeping inland along a country's coast (the band is clipped to the land).
    coastFlood(name, o = {}) {
      const { at = 0, grow = 2.5, reach = 90, color = '#2f8bff' } = o;
      if (o.sound !== false) s.sfx('rise', at, { gain: 0.16, dur: grow / s.pace });
      s.draw({ at, out: o.out, enter: 'none', sfx: false }, (ctx) => {
        const g = geometry(name, o.mainland ?? true);
        const p = Math.min(1, Math.max(0, (s.t - at) / (grow / s.pace)));
        const e = 1 - Math.pow(1 - p, 2);
        ctx.save(); trace(ctx, g.rings); ctx.clip();
        trace(ctx, g.rings); ctx.lineJoin = 'round'; ctx.lineWidth = (reach * e * 2) / z; ctx.strokeStyle = color; ctx.globalAlpha *= 0.55; ctx.stroke();
        ctx.restore();
      });
    },

    // Falling rain over the whole frame. density 0..1.
    rain(o = {}) {
      const n = Math.round(90 * (o.density ?? 1));
      screenLayer({ at: o.at ?? 0, out: o.out, enter: 'fade' }, (ctx) => {
        ctx.save(); ctx.strokeStyle = 'rgba(190,225,255,0.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = 0; i < n; i++) {
          const sp = 900 + s.rand(i * 5 + 1) * 700, x = s.rand(i * 5) * (s.W + 200) - 100, y = (s.rand(i * 5 + 2) * s.H + s.T * sp) % (s.H + 80) - 40, l = 22 + s.rand(i * 5 + 3) * 26;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - l * 0.25, y + l); ctx.stroke();
        }
        ctx.restore();
      });
    },

    // A colour wash over the whole frame (heat, drought, cold, dusk) that fades in and out.
    tint(color, o = {}) {
      screenLayer({ at: o.at ?? 0, out: o.out, enter: 'fade' }, (ctx) => {
        const k0 = Math.min(1, Math.max(0, (s.t - (o.at ?? 0)) / (o.fade ?? 1.2)));
        ctx.save(); ctx.globalAlpha *= (o.alpha ?? 0.35) * k0; ctx.fillStyle = color; ctx.fillRect(0, 0, s.W, s.H); ctx.restore();
      });
    },

    // A thermometer on the right that rises by `to` degrees, with the number.
    thermo(o = {}) {
      const { at = 0, to = 5, dur = 3 } = o;
      if (o.sound !== false) s.sfx('rise', at, { gain: 0.18, dur: dur / s.pace });
      screenLayer({ at, out: o.out, enter: 'fade' }, (ctx) => {
        const p = Math.min(1, Math.max(0, (s.t - at) / (dur / s.pace))), e = 1 - Math.pow(1 - p, 2);
        const x = s.W * 0.86, y0 = s.H * 0.18, h = s.H * 0.3;
        ctx.save();
        ctx.fillStyle = 'rgba(10,18,30,0.6)'; ctx.beginPath(); ctx.roundRect(x - 26, y0 - 20, 52, h + 80, 26); ctx.fill();
        ctx.fillStyle = '#ff3d2e'; ctx.fillRect(x - 9, y0 + h * (1 - e), 18, h * e + 20);
        ctx.beginPath(); ctx.arc(x, y0 + h + 28, 24, 0, TAU); ctx.fill();
        ctx.font = '800 54px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000'; ctx.lineWidth = 8; ctx.lineJoin = 'round';
        const txt = `+${(to * e).toFixed(0)}°C`; ctx.strokeText(txt, x - 44, y0 + h * (1 - e)); ctx.fillStyle = '#fff'; ctx.fillText(txt, x - 44, y0 + h * (1 - e));
        ctx.restore();
      });
    },

    // ---- engagement layer ---------------------------------------------------------------------------------------

    // The hook: the question as big bold text in the top third for the first seconds, punched in with a thud.
    // *stars* mark the words in yellow. It leaves at `out` (3.2 s after `at` by default) so the map gets the frame.
    hook(text, o = {}) {
      const at = o.at ?? 0.1;
      if (o.sound !== false) s.sfx('thud', at, { gain: 0.35 });
      screenLayer({ at, out: o.out ?? at + 3.2, enter: 'none' }, (ctx) => {
        const p = Math.min(1, Math.max(0, (s.t - at) / 0.3)), e = 1 - Math.pow(1 - p, 3);
        const size = o.size ?? 84;
        ctx.save();
        ctx.font = `800 ${size}px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif`;
        const words = text.toUpperCase().split(/\s+/);
        const plain = (w) => w.replace(/\*/g, '');
        const lines = []; let line = [];
        for (const w of words) { if (line.length && ctx.measureText([...line, w].map(plain).join(' ')).width > s.W * 0.86) { lines.push(line); line = []; } line.push(w); }
        if (line.length) lines.push(line);
        const lh = size * 1.12, y0 = s.H * (o.y ?? 0.2) - ((lines.length - 1) * lh) / 2;
        ctx.translate(s.cx, y0); ctx.scale(1.3 - 0.3 * e, 1.3 - 0.3 * e); ctx.globalAlpha *= e;
        ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#000';
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
        const sp = ctx.measureText(' ').width;
        let lit = false;
        lines.forEach((ws, i) => {
          let x = -ctx.measureText(ws.map(plain).join(' ')).width / 2;
          for (const w of ws) {
            if (w.startsWith('*')) lit = true;
            const txt = plain(w);
            ctx.strokeText(txt, x, i * lh);
            ctx.fillStyle = lit ? (o.color ?? '#ffd84a') : '#ffffff';
            ctx.fillText(txt, x, i * lh);
            if (w.endsWith('*')) lit = false;
            x += ctx.measureText(txt).width + sp;
          }
        });
        ctx.restore();
      });
    },

    // The turn of the story ("But...", "However..."): a riser into a red flash and a thud. Add the same time to
    // fly()'s `beats` for the punch.
    twist(at, o = {}) {
      if (o.sound !== false) { s.sfx('rise', at - 1.1, { gain: 0.2, dur: 1.1 }); s.sfx('thud', at, { gain: 0.4 }); }
      screenLayer({ at: at - 0.05 }, (ctx) => {
        const q = (s.t - at) / 0.5;
        if (q < 0 || q > 1) return;
        const a = (1 - q) * (o.alpha ?? 0.6);
        const g = ctx.createRadialGradient(s.cx, s.cy, s.H * 0.15, s.cx, s.cy, s.H * 0.75);
        g.addColorStop(0, `rgba(255,40,30,${a * 0.25})`); g.addColorStop(1, `rgba(255,40,30,${a})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, s.W, s.H);
      });
    },

    // One big number in the middle of the frame: counts up with a riser, a label under it, on a dark pill. For the
    // key figure of the video (a population, a sum of money). value: a number, or a string shown as is.
    stat(value, o = {}) {
      const { at = 0, dur = 1.6, label = '', prefix = '', suffix = '', size = 120 } = o;
      if (o.sound !== false) { s.sfx('rise', at, { gain: 0.18, dur: dur / s.pace }); s.sfx('ding', at + dur / s.pace, { gain: 0.25 }); }
      screenLayer({ at, out: o.out, enter: 'fade' }, (ctx) => {
        const p = Math.min(1, Math.max(0, (s.t - at) / (dur / s.pace))), e = 1 - Math.pow(1 - p, 3);
        const txt = prefix + (typeof value === 'number' ? Math.round(value * e).toLocaleString('en-US') : value) + suffix;
        ctx.save();
        ctx.translate(s.cx, s.H * (o.y ?? 0.5));
        const pop = 1 + 0.08 * Math.sin(Math.min(1, p * 1.5) * Math.PI); ctx.scale(pop, pop);
        ctx.font = `800 ${size}px "Plus Jakarta Sans", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const w = Math.max(ctx.measureText(txt).width, ctx.measureText(label).width * 0.5) + 90;
        ctx.fillStyle = 'rgba(8,14,24,0.62)'; ctx.beginPath(); ctx.roundRect(-w / 2, -size * 0.8, w, size * 1.6 + (label ? 64 : 0), 36); ctx.fill();
        ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = '#000'; ctx.strokeText(txt, 0, 0);
        ctx.fillStyle = o.color ?? '#ffd84a'; ctx.fillText(txt, 0, 0);
        if (label) {
          ctx.font = '700 44px "Plus Jakarta Sans", sans-serif'; ctx.lineWidth = 8;
          ctx.strokeText(label.toUpperCase(), 0, size * 0.75 + 12); ctx.fillStyle = '#fff'; ctx.fillText(label.toUpperCase(), 0, size * 0.75 + 12);
        }
        ctx.restore();
      });
    },

    // A thin bar along the top that fills over the video, so the viewer feels the end is close and stays.
    progress(o = {}) {
      screenLayer({ at: -1 }, (ctx) => {
        const p = s.video?.duration ? s.T / s.video.duration : s.t / s.dur;
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, 0, s.W, 7);
        ctx.fillStyle = o.color ?? '#ffd84a'; ctx.fillRect(0, 0, s.W * Math.min(1, p), 7);
      });
    },

    // A film look: a warm light in the middle and a cool blue cast at the edges, so the satellite map reads as
    // cinematic rather than as a web map. Call it before vignette().
    grade(o = {}) {
      screenLayer({ at: -1 }, (ctx) => {
        ctx.save();
        const warm = ctx.createRadialGradient(s.cx, s.cy * 0.95, s.H * 0.08, s.cx, s.cy, s.H * 0.7);
        warm.addColorStop(0, `rgba(255,200,140,${o.warm ?? 0.12})`); warm.addColorStop(1, 'rgba(255,200,140,0)');
        ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = warm; ctx.fillRect(0, 0, s.W, s.H);
        const cool = ctx.createRadialGradient(s.cx, s.cy, s.H * 0.2, s.cx, s.cy, s.H * 0.85);
        cool.addColorStop(0, 'rgba(10,30,70,0)'); cool.addColorStop(1, `rgba(10,30,70,${o.cool ?? 0.55})`);
        ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = cool; ctx.fillRect(0, 0, s.W, s.H);
        ctx.restore();
      });
    },

    // A pill with a call to action ("Follow for more", or "Follow @handle") that pops in and bobs for the last
    // seconds (3 s before the end by default). The text is shown in capitals.
    follow(text = 'Follow for more', o = {}) {
      const at = o.at ?? Math.max(0, s.dur - 3);
      if (o.sound !== false) s.sfx('pop', at, { gain: 0.2 });
      screenLayer({ at, enter: 'none' }, (ctx) => {
        const p = Math.min(1, Math.max(0, (s.t - at) / 0.3)), e = 1 - Math.pow(1 - p, 3);
        const txt = text.toUpperCase();
        ctx.save();
        ctx.translate(s.cx, s.H * (o.y ?? 0.11) + Math.sin(s.t * 4) * 6); ctx.scale(e, e);
        ctx.font = '800 40px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const w = ctx.measureText(txt).width + 80;
        ctx.fillStyle = o.color ?? '#ffd84a'; ctx.beginPath(); ctx.roundRect(-w / 2, -40, w, 80, 40); ctx.fill();
        ctx.fillStyle = '#111'; ctx.fillText(txt, 0, 2);
        ctx.restore();
      });
    },

    // The faint source line the reference keeps in the corners (e.g. "Tiles ©; Esri; Source..."). Optional.
    credit(text = '@YourChannel', o = {}) {
      screenLayer({ at: -1 }, (ctx) => {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.fillText(text, s.cx, s.H * (o.y ?? 0.012) + 26);
        ctx.restore();
      });
    },
  };
}
