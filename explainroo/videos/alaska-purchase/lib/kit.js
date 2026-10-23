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
  Bosnia: 'Bosnia and Herz.', Macedonia: 'North Macedonia', Congo: 'Dem. Rep. Congo',
};
const BY_NAME = new Map(COUNTRIES.map((c) => [c.name, c]));

// Handy groups (names as the data uses them).
export const REGIONS = {
  southAmerica: ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'],
  northAmerica: ['Canada', 'United States of America', 'Mexico', 'Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Haiti', 'Dominican Rep.', 'Jamaica', 'Bahamas'],
  europe: ['France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Belgium', 'Netherlands', 'Switzerland', 'Austria', 'Poland', 'Czechia', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Serbia', 'Denmark', 'Norway', 'Sweden', 'Finland', 'Ireland', 'United Kingdom'],
};

const ringCache = new Map();
function geometry(name, mainland, within) {
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
  const radius = mainland === true ? 12 : mainland;
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

function trace(ctx, rings) {
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

function shadowText(ctx, text, x, y, size, o = {}) {
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
function chunks(words, maxChars) {
  const out = [];
  let cur = null;
  for (const w of words) {
    const t = w.text;
    if (cur && (cur.text.length + 1 + t.length > maxChars || cur.n >= 3 || /[.,;:!?]$/.test(cur.text))) { out.push(cur); cur = null; }
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
        }
      });
    },

    // A text label with a dashed line to a place. dx, dy are screen pixels.
    label(text, o) {
      // plate: true puts a dark translucent plate behind the text. Or use color '#1b1308' and
      // shadowColor 'rgba(255,255,255,0.7)' for dark text on a light fill
      const { lon, lat, dx = 0, size = 46, color = '#ffffff', dash = true } = o;
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
  };
}
