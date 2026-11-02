// Cinematic map camera and props for the what-if-map template, studied from "What if India attacks China's Three
// Gorges Dam?" (a map short that dives from a whole country to one dam and back). See ../MOTION.md for the study.
//
//   const cam = cinema(s, [ {lon, lat, span, tilt, rotate}, { at, dur, lon, lat, span, ease: 'dive' }, ... ]);
//   const k = kit(s, cam);          // the usual helpers work on this camera too
//   const c = cine(s, cam);         // the new ones
//   basemap(s); c.closeup(CLOSEUPS.dam); c.fill('China', ...); c.ground('CHINA', ...); c.glowLine(...); ...
//   c.zoomBlur(); c.tilt();         // after everything that lies on the map, before the screen-fixed layers
//   c.chip('Three Gorges Dam', { lon, lat });   // screen-fixed callouts go after c.tilt()
//
// What the reference does that fly() cannot:
//   1. DIVES. It zooms from a country (about 40 degrees across) to a dam (0.05 degrees) in two seconds. A zoom that
//      is a straight blend of the two end values spends 95% of the time already at the end. cinema() blends the zoom
//      as a ratio (every frame zooms by the same percentage) and moves the centre in step, so a dive feels even.
//   2. FOLLOWS A LINE. The camera runs along a river, turning so the river points up the frame ({ follow: [...] }).
//   3. TILTS. The map is seen at an angle: far things small, text lies on the ground (tilt, c.tilt()).
//   4. BLURS the zoom (c.zoomBlur()), and hides the change of picture sharpness at the deepest point (c.swirl()).
import { PPD, X, Y, geometry, trace } from './kit.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const smooth = (q) => { q = clamp(q, 0, 1); return q * q * q * (q * (q * 6 - 15) + 10); };
export const EASE = {
  inOut: smooth,
  linear: (q) => clamp(q, 0, 1),
  out: (q) => 1 - (1 - clamp(q, 0, 1)) ** 3,
  in: (q) => clamp(q, 0, 1) ** 3,
  // slow start, a rush through the middle, a soft landing: for dives
  dive: (q) => { q = clamp(q, 0, 1); return q < 0.5 ? 16 * q ** 5 : 1 - ((-2 * q + 2) ** 5) / 2; },
};
const rand = (seed) => { let a = (seed * 2654435761) >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

// ---- the tilted ground -------------------------------------------------------------------------------------
// A tilt k (0 = flat, 0.25 = gentle, 0.45 = like the reference) makes row v (0 top, 1 bottom) of the flat picture
// k-wider as it goes down. It is drawn flat at a smaller zoom first, then squeezed row by row in tilt().
function tiltGeometry(k, focus) {
  if (k < 0.005) return { k: 0, sc: () => 1, yo: (v) => v, vf: focus, scF: 1 };
  const sc = (v) => (1 - k + k * v) / (1 - k);
  const yo = (v) => ((1 - k) * v + (k * v * v) / 2) / (1 - k / 2);
  const vf = (-(1 - k) + Math.sqrt((1 - k) ** 2 + 2 * k * focus * (1 - k / 2))) / k;   // the row that lands on the focus line
  return { k, sc, yo, vf, scF: sc(vf) };
}

// Keys: [{ lon, lat, span, tilt, rotate }, { at, dur, lon, lat, span, tilt, rotate, ease, follow, sfx }, ...]
//  - the first key is the opening shot; each next key is a flight that starts at `at` and lasts `dur` seconds
//  - span: degrees of latitude that fit the frame height (the whole of China about 40, a city 0.3, a dam 0.05)
//  - tilt: 0 to 0.5. rotate: degrees the map is turned (180 puts north at the bottom)
//  - ease: 'inOut' (default), 'dive', 'out', 'in', 'linear'
//  - follow: [[lon, lat], ...] the camera travels along this line from where it is; with rotate: 'auto' the map turns so the line
//    runs up the frame, and `lon`/`lat` are the last point. span can change on the way.
//  - zoomBy: for a follow flight, the part of the flight (0 to 1, default 0.35) in which the zoom reaches its target; then it holds
//  - sfx: true plays a whoosh; it is on by default for flights that zoom more than 6 times
// Flights must not overlap, and the last one needs at least 1.5 s of its own.
export function cinema(s, keys, o = {}) {
  const W = s.W; const H = s.H;
  const fps = s.video?.fps ?? 30;
  const focus = o.focusY ?? 0.46;
  const list = keys.map((k, i) => {
    const path = k.follow ? k.follow.map(([lo, la]) => [X(lo), Y(la)]) : null;
    const last = path ? path[path.length - 1] : null;
    return {
      at: i === 0 ? 0 : k.at ?? 0, dur: k.dur ?? 2, ease: EASE[k.ease ?? 'inOut'] ?? EASE.inOut, k,
      x: last ? last[0] : X(k.lon), y: last ? last[1] : Y(k.lat), view: H / (PPD * k.span),
      rot: k.rotate === 'auto' ? 'auto' : k.rotate ?? 0, tilt: k.tilt ?? 0, path,
    };
  }).sort((a, b) => a.at - b.at);
  if (s.engine.planning) s.engine.manualCamera = true;

  const state = (t) => {
    let cur = { x: list[0].x, y: list[0].y, view: list[0].view, rot: list[0].rot === 'auto' ? 0 : list[0].rot, tilt: list[0].tilt };
    let moving = false;
    for (let i = 1; i < list.length; i++) {
      const k = list[i];
      if (t < k.at) break;
      const q = (t - k.at) / Math.max(0.001, k.dur / s.pace);
      const p = k.ease(q);
      const from = cur;
      const tgtRot = k.rot === 'auto' ? from.rot : k.rot;
      let x; let y; let rot = lerp(from.rot, tgtRot, p);
      // a flight along a line reaches its cruising zoom early (zoomBy: the part of the flight it takes) and keeps it; other flights zoom all the way
      const zq = k.path ? EASE.out(q / (k.k.zoomBy ?? 0.35)) : p;
      const view = from.view * (k.view / from.view) ** zq;
      if (k.path) {
        const pts = [[from.x, from.y], ...k.path];
        const along = pointAlong(pts, p);
        x = along.x; y = along.y;
        if (k.rot === 'auto') {
          const h = heading(pts, p);
          const target = h + 360 * Math.round((from.rot - h) / 360);
          rot = lerp(from.rot, target, smooth(clamp(q / 0.3, 0, 1)));
          if (q >= 1) rot = heading(pts, 1) + 360 * Math.round((from.rot - heading(pts, 1)) / 360);
        }
      } else {
        const a = 1 / from.view; const b = 1 / k.view;
        const w = Math.abs(b - a) < 1e-12 ? p : (1 / view - a) / (b - a);   // the centre moves as fast on screen as the zoom does
        x = lerp(from.x, k.x, w); y = lerp(from.y, k.y, w);
      }
      const next = { x, y, view, rot, tilt: lerp(from.tilt, k.tilt, p) };
      if (q > 0 && q < 1) { moving = true; }
      if (q < 1) { cur = next; break; }
      cur = { ...next, x: k.x, y: k.y, view: k.view, rot: k.rot === 'auto' ? next.rot : k.rot, tilt: k.tilt };
    }
    return { ...cur, moving };
  };

  let cur = state(s.t);
  const a = state(s.t - 0.5 / fps); const b = state(s.t + 0.5 / fps);
  const speed = Math.abs(Math.log(b.view / a.view)) * fps;          // zoom per second, as a log ratio per second
  if (cur.moving && speed < 2.2) s.engine.moving = true;            // the render adds its own blur; zoomBlur() takes over for fast dives
  // The picture never freezes: a slow push and a small sway.
  const d = o.drift ?? 0.6;
  if (d) cur = { ...cur, view: cur.view * (1 + 0.05 * d * (s.t / Math.max(1, s.dur))), x: cur.x + (Math.sin(s.t * 0.35) * 5 * d) / cur.view, y: cur.y + (Math.cos(s.t * 0.27) * 4 * d) / cur.view };
  for (const bt of o.beats || []) {   // a small punch on each beat, like an edit
    const q = (s.t - bt) / 0.3;
    if (q > 0 && q < 1) { const kk = Math.sin(q * Math.PI); cur = { ...cur, view: cur.view * (1 + (o.punch ?? 0.03) * kk), x: cur.x + (Math.sin(s.t * 91) * 4 * (1 - q)) / cur.view, y: cur.y + (Math.cos(s.t * 83) * 4 * (1 - q)) / cur.view }; }
  }
  const g = tiltGeometry(cur.tilt, focus);
  const zd = cur.view / g.scF;                      // the flat picture is drawn this big; tilt() makes it cur.view at the focus line
  const fx = s.cx; const fy = H * g.vf;
  s._camMoved = true;
  const ctx = s.ctx;
  ctx.translate(fx, fy);
  ctx.scale(zd, zd);
  if (cur.rot) ctx.rotate((cur.rot * Math.PI) / 180);
  ctx.translate(-cur.x, -cur.y);

  // Where does a place land on the screen (after the tilt)?
  const project = (lon, lat) => {
    const dx = X(lon) - cur.x; const dy = Y(lat) - cur.y;
    const ang = (cur.rot * Math.PI) / 180;
    const rx = dx * Math.cos(ang) - dy * Math.sin(ang); const ry = dx * Math.sin(ang) + dy * Math.cos(ang);
    const sx = fx + rx * zd; const sy = fy + ry * zd;
    if (!g.k) return { x: sx, y: sy };
    const v = sy / H;
    return { x: W / 2 + (sx - W / 2) * g.sc(v), y: g.yo(v) * H };
  };
  const cam = { x: cur.x, y: cur.y, zoom: zd, rotate: cur.rot, tilt: g.k, geom: g, fx, fy, view: cur.view, span: H / (PPD * cur.view), speed, project, W, H, fps };

  // A whoosh at every big zoom.
  for (let i = 1; i < list.length; i++) {
    const k = list[i]; const prev = list[i - 1];
    const ratio = Math.max(k.view / prev.view, prev.view / k.view);
    if (k.k.sfx ?? ratio > 6) s.sfx('whoosh', k.at - 0.05, { gain: 0.34, dur: Math.min(1.6, k.dur) });
  }
  return cam;
}

function lengths(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; }
function pointAlong(pts, f) {
  const L = lengths(pts); const total = L[L.length - 1] || 1; const d = clamp(f, 0, 1) * total;
  let i = 1; while (i < pts.length - 1 && L[i] < d) i++;
  const seg = L[i] - L[i - 1] || 1; const u = clamp((d - L[i - 1]) / seg, 0, 1);
  return { x: lerp(pts[i - 1][0], pts[i][0], u), y: lerp(pts[i - 1][1], pts[i][1], u) };
}
// the map turns so that the direction of travel points up the frame (degrees)
function heading(pts, f) {
  const a = pointAlong(pts, clamp(f - 0.08, 0, 1)); const b = pointAlong(pts, clamp(f + 0.08, 0, 1));
  return ((-Math.PI / 2 - Math.atan2(b.y - a.y, b.x - a.x)) * 180) / Math.PI;
}
// the part of a line that is drawn when a fraction f of its length is done (world points)
function partial(pts, f) {
  if (f >= 1) return pts;
  const L = lengths(pts); const total = L[L.length - 1] || 1; const d = clamp(f, 0, 1) * total;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= d) { out.push(pts[i]); continue; }
    const u = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
    out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]);
    break;
  }
  return out;
}
// When the camera passes each point of a { follow } route: [time of point 0, time of point 1, ...]. points[0] is where the flight starts;
// o: { at, dur, ease, pace } as in the key (pace: s.pace). Use it to time a chip or a label to the moment the camera gets there.
export function routeTimes(points, o) {
  const P = points.map(([lo, la]) => [X(lo), Y(la)]); const L = lengths(P); const total = L[L.length - 1] || 1;
  const ease = EASE[o.ease ?? 'inOut'];
  return L.map((d) => {
    let lo = 0; let hi = 1;
    for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (ease(mid) < d / total) lo = mid; else hi = mid; }
    return o.at + (lo * o.dur) / (o.pace ?? 1);
  });
}
const toWorld = (pts) => pts.map(([lo, la]) => [X(lo), Y(la)]);
const tracePts = (ctx, P) => { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };

let scratch = null;
const scratchFor = (w, h) => { if (!scratch || scratch.width !== w || scratch.height !== h) { scratch = document.createElement('canvas'); scratch.width = w; scratch.height = h; } return scratch; };

// Loads the close-up pictures written by scripts/closeup.mjs (top-level await in scenes.js). They live in closeups/, not assets/, and
// are decoded one at a time as bitmaps: the browser cannot hold the NASA map and several big pictures decoded as <img> at once.
//   import RAW from './closeups.js';   const CLOSEUPS = await loadCloseups(RAW);
export async function loadCloseups(table, feather = 0.14) {
  const out = {};
  for (const [name, spec] of Object.entries(table)) {
    const res = await fetch(new URL(`project/${spec.file}`, document.baseURI));
    if (!res.ok) throw new Error(`close-up "${name}": ${spec.file} not found (run scripts/closeup.mjs)`);
    const bmp = await createImageBitmap(await res.blob());
    const tex = document.createElement('canvas'); tex.width = bmp.width; tex.height = bmp.height;
    const t = tex.getContext('2d'); t.drawImage(bmp, 0, 0); bmp.close();
    t.globalCompositeOperation = 'destination-in';   // fade the edges, so the rectangle does not show while it fades in
    for (const [x1, y1] of [[tex.width, 0], [0, tex.height]]) {
      const g = t.createLinearGradient(0, 0, x1, y1);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(feather, 'rgba(0,0,0,1)'); g.addColorStop(1 - feather, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      t.fillStyle = g; t.fillRect(0, 0, tex.width, tex.height);
    }
    out[name] = { ...spec, tex };
  }
  return out;
}

// Helpers bound to this frame's camera.
export function cine(s, cam) {
  const FONT = '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
  const live = () => !s.engine.layoutLog;
  // lod: [fullAt, goneAt] in degrees of span: fully there at the first span, gone at the second (in between it fades)
  const lod = (r) => (r ? smooth((cam.span - r[1]) / (r[0] - r[1])) : 1);
  const at0 = (o) => s.time(o.at ?? 0);
  const world = (o, fn, enter = 'none') => s.draw({ at: o.at ?? 0, out: o.out, enter, sfx: false }, (ctx, life) => { if (live()) fn(ctx, life, s.t - at0(o)); });
  const screen = (o, fn, enter = 'fade') => s.draw({ at: o.at ?? 0, out: o.out, enter, sfx: false }, (ctx, life) => {
    if (!live()) return;
    ctx.save(); ctx.setTransform(s.engine.scale, 0, 0, s.engine.scale, 0, 0); fn(ctx, life, s.t - at0(o)); ctx.restore();
  });
  const px = (n) => n / cam.zoom;   // screen pixels to world units

  return {
    cam,

    // A sharp picture of one place that fades in when the camera is close (made by scripts/closeup.mjs, loaded by loadCloseups()).
    // spec: CLOSEUPS.dam. fade: [fullAt, goneAt] in degrees of span (default: from 6 to 2.6 picture heights).
    closeup(spec, o = {}) {
      const [w, so, e, n] = spec.bounds;
      const h = n - so;
      const fade = o.fade ?? [h * 2.6, h * 6];
      world({ ...o, at: o.at ?? -1 }, (ctx) => {
        const a = lod(fade) * (o.alpha ?? 1);
        if (a <= 0.004) return;
        if (!spec.tex) throw new Error('closeup: call "const CLOSEUPS = await loadCloseups(RAW);" at the top of scenes.js');
        ctx.globalAlpha *= a;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(spec.tex, X(w), Y(n), X(e) - X(w), Y(so) - Y(n));
      });
    },

    // Countries tinted so the satellite picture still shows through. lod: fades the tint as the camera dives.
    fill(names, o = {}) {
      const list = [].concat(names);
      world(o, (ctx) => {
        const a = lod(o.lod) * (o.alpha ?? 0.66);
        if (a <= 0.004) return;
        const a0 = ctx.globalAlpha;
        for (const name of list) {
          const g = geometry(name, o.mainland ?? true, o.within ?? null);
          trace(ctx, g.rings);
          ctx.globalAlpha = a0 * a; ctx.fillStyle = o.colors?.[name] ?? o.color ?? '#d7282f'; ctx.fill();
          ctx.globalAlpha = a0 * Math.min(1, a * 1.5); ctx.lineJoin = 'round'; ctx.lineWidth = px(o.edge ?? 2.5); ctx.strokeStyle = o.border ?? 'rgba(255,255,255,0.75)'; ctx.stroke();
        }
        ctx.globalAlpha = a0;
      }, o.enter ?? 'fade');
    },

    // Big lettering that lies on the ground: it scales with the map and is squeezed with it by the tilt.
    // deg: letter height in degrees of latitude. rotate: degrees on the map.
    ground(text, o = {}) {
      const { lon, lat, deg = 3, rotate = 0, color = '#ffffff', italic = true, spacing = 0.04 } = o;
      world(o, (ctx, life, t) => {
        const a = lod(o.lod) * smooth(t / 0.35);
        if (a <= 0.004) return;
        const size = deg * PPD;
        const pop = 0.88 + 0.12 * smooth(t / 0.4);
        ctx.save();
        ctx.translate(X(lon), Y(lat)); ctx.rotate((rotate * Math.PI) / 180); ctx.scale(pop, pop);
        if (italic) ctx.transform(1, 0, -0.16, 1, 0, 0);
        ctx.font = `800 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = `${size * spacing}px`;
        ctx.globalAlpha *= a;
        for (let i = 6; i >= 1; i--) { ctx.fillStyle = `rgba(20,10,10,${0.09 + 0.02 * (6 - i)})`; ctx.fillText(text, size * 0.012 * i, size * 0.02 * i); }   // thickness
        ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = size * 0.2; ctx.fillStyle = color; ctx.fillText(text, 0, 0);
        ctx.restore();
      });
    },

    // A glowing line that draws itself along a path (a river, a route, a border).
    glowLine(pts, o = {}) {
      const P0 = toWorld(pts);
      world(o, (ctx, life, t) => {
        const f = EASE[o.ease ?? 'inOut'](t / (o.dur ?? 1.6));
        const a = lod(o.lod);
        const P = partial(P0, f);
        if (P.length < 2 || a <= 0.004) return;
        const w = px(o.width ?? 7); const color = o.color ?? '#19f0ff';
        ctx.save();
        ctx.globalAlpha *= a; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = color;
        for (const [m, al] of [[6, 0.1], [3, 0.2], [1.5, 0.5]]) { ctx.lineWidth = w * m; const g0 = ctx.globalAlpha; ctx.globalAlpha = g0 * al * 2; tracePts(ctx, P); ctx.stroke(); ctx.globalAlpha = g0; }
        ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#eaffff'; ctx.lineWidth = w * 0.45; tracePts(ctx, P); ctx.stroke();
        if (f < 1) { const [hx, hy] = P[P.length - 1]; const gr = ctx.createRadialGradient(hx, hy, 0, hx, hy, w * 6); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.3, color); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(hx, hy, w * 6, 0, TAU); ctx.fill(); }
        ctx.restore();
      });
    },

    // A translucent danger zone along a path (a flood plain). deg: its width in degrees of latitude; it scales with the map.
    band(pts, o = {}) {
      const P0 = toWorld(pts);
      world(o, (ctx, life, t) => {
        const f = o.dur === 0 ? 1 : EASE.inOut(t / (o.dur ?? 2));
        const P = partial(P0, f);
        if (P.length < 2) return;
        const color = o.color ?? '215,40,47';
        const w = (typeof o.deg === 'function' ? o.deg(t) : o.deg ?? 0.5) * PPD;          // deg and alpha can be functions of the seconds since `at`: a river that swells and shrinks
        const al = typeof o.alpha === 'function' ? o.alpha(t) : o.alpha ?? 0.5;
        if (w <= 0 || al <= 0.003) return;
        ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.lineWidth = w * 1.25; ctx.strokeStyle = `rgba(${color},${al * 0.45})`; tracePts(ctx, P); ctx.stroke();
        ctx.lineWidth = w; ctx.strokeStyle = `rgba(${color},${al})`; tracePts(ctx, P); ctx.stroke();
        ctx.lineWidth = w * 0.5; ctx.strokeStyle = `rgba(${o.core ?? '255,120,90'},${al * 0.4})`; tracePts(ctx, P); ctx.stroke();
        ctx.restore();
      });
    },

    // A missile that flies in an arc from one place to another, with a smoke trail. size: its length in screen pixels.
    missile(o) {
      const A = [X(o.from[0]), Y(o.from[1])]; const B = [X(o.to[0]), Y(o.to[1])];
      const mx = (A[0] + B[0]) / 2; const my = (A[1] + B[1]) / 2; const dx = B[0] - A[0]; const dy = B[1] - A[1];
      const C = [mx + dy * (o.arc ?? 0.18), my - dx * (o.arc ?? 0.18)];
      const at = (u) => [(1 - u) ** 2 * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1]];
      const dur = o.dur ?? 1.5;
      s.sfx('whoosh', at0(o) - 0.05, { gain: 0.3, dur });
      world(o, (ctx, life, t) => {
        if (t < 0 || t > dur) return;
        const f = EASE.inOut(t / dur);
        const size = px(o.size ?? 170);
        // smoke trail: older points are thinner and fainter
        const N = 26; const span = 0.4;
        for (let i = 0; i < N; i++) {
          const u0 = Math.max(0, f - span * (1 - i / N)); const u1 = Math.max(0, f - span * (1 - (i + 1) / N));
          const p0 = at(u0); const p1 = at(u1); const k = (i + 1) / N;
          ctx.strokeStyle = `rgba(255,${Math.round(200 + 40 * k)},${Math.round(150 + 80 * k)},${0.5 * k})`; ctx.lineWidth = size * 0.17 * k; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
        }
        const [hx, hy] = at(f); const [gx, gy] = at(Math.min(1, f + 0.01));
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.atan2(gy - hy, gx - hx));
        const L = size; const Wd = size * 0.2;
        const fl = ctx.createRadialGradient(-L * 0.5, 0, 0, -L * 0.5, 0, L * 0.5); fl.addColorStop(0, 'rgba(255,255,220,0.95)'); fl.addColorStop(0.4, 'rgba(255,150,40,0.7)'); fl.addColorStop(1, 'rgba(255,60,0,0)');
        ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(-L * 0.5, 0, L * 0.5, 0, TAU); ctx.fill();
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = Wd * 0.8;
        ctx.fillStyle = '#f2f2f0'; ctx.beginPath(); ctx.roundRect(-L / 2, -Wd / 2, L * 0.78, Wd, Wd / 2); ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#d7282f'; ctx.beginPath(); ctx.moveTo(L * 0.28, -Wd / 2); ctx.quadraticCurveTo(L * 0.5, 0, L * 0.28, Wd / 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#9aa0a6'; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-L * 0.5, sg * Wd * 0.5); ctx.lineTo(-L * 0.3, sg * Wd * 1.25); ctx.lineTo(-L * 0.2, sg * Wd * 0.5); ctx.closePath(); ctx.fill(); }
        ctx.restore();
      });
    },

    // An explosion: a flash, a fireball, smoke, a shock ring and sparks. r: its size in screen pixels at the biggest.
    blast(o) {
      const sd = Math.round(Math.abs(o.lon * 131 + o.lat * 71)) + 7;
      s.sfx('thud', at0(o), { gain: 0.5 });
      s.sfx('rise', at0(o) - 0.5, { gain: 0.2, dur: 0.5 });
      world(o, (ctx, life, t) => {
        const dur = o.dur ?? 2.4;
        if (t < 0 || t > dur) return;
        const R = px(o.r ?? 280); const rnd = rand(sd);
        const grow = 1 - Math.exp(-t * 3.4);
        const fire = 1 - clamp((t - 0.45) / 1.3, 0, 1);
        ctx.save(); ctx.translate(X(o.lon), Y(o.lat));
        if (t < 0.4) {   // white flash
          const a = 1 - t / 0.4; const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R * (0.7 + t * 2));
          gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(0.45, `rgba(255,225,150,${a * 0.8})`); gr.addColorStop(1, 'rgba(255,120,30,0)');
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, R * (0.7 + t * 2), 0, TAU); ctx.fill();
        }
        const lobes = 12;
        for (let i = 0; i < lobes; i++) {   // smoke first (behind), then fire on top
          const ang = rnd() * TAU; const dist = (0.2 + rnd() * 0.45) * R * grow; const rad = (0.3 + rnd() * 0.3) * R * (0.4 + 0.6 * grow);
          const sa = clamp((t - 0.5) / 0.7, 0, 1) * (1 - clamp((t - 1.5) / (dur - 1.5), 0, 1)) * 0.55;
          const cx = Math.cos(ang) * dist; const cy = Math.sin(ang) * dist - t * R * 0.12;
          if (sa > 0.01) { const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad); g2.addColorStop(0, `rgba(70,55,48,${sa})`); g2.addColorStop(1, 'rgba(40,30,28,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.fill(); }
        }
        ctx.globalCompositeOperation = 'lighter';
        const rnd2 = rand(sd + 1);
        for (let i = 0; i < lobes; i++) {
          const ang = rnd2() * TAU; const dist = (0.15 + rnd2() * 0.4) * R * grow; const rad = (0.28 + rnd2() * 0.3) * R * (0.4 + 0.6 * grow);
          const cx = Math.cos(ang) * dist; const cy = Math.sin(ang) * dist - t * R * 0.08;
          if (fire > 0.01) { const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad); g2.addColorStop(0, `rgba(255,245,200,${fire})`); g2.addColorStop(0.4, `rgba(255,140,30,${fire * 0.85})`); g2.addColorStop(1, 'rgba(160,30,10,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.fill(); }
        }
        ctx.globalCompositeOperation = 'source-over';
        const ring = t / 0.9;   // the shock ring
        if (ring < 1) { ctx.strokeStyle = `rgba(255,235,200,${(1 - ring) * 0.8})`; ctx.lineWidth = px(5) * (1 - ring) + px(1); ctx.beginPath(); ctx.arc(0, 0, R * (0.3 + 2 * smooth(ring)), 0, TAU); ctx.stroke(); }
        const rnd3 = rand(sd + 2);   // sparks
        for (let i = 0; i < 18; i++) { const ang = rnd3() * TAU; const sp = (0.8 + rnd3()) * R; const d0 = sp * (1 - Math.exp(-t * 3)); const a = 1 - clamp(t / 1.1, 0, 1); if (a > 0.02) { ctx.strokeStyle = `rgba(255,${180 + Math.round(rnd3() * 60)},80,${a})`; ctx.lineWidth = px(3); ctx.beginPath(); ctx.moveTo(Math.cos(ang) * d0 * 0.8, Math.sin(ang) * d0 * 0.8); ctx.lineTo(Math.cos(ang) * d0, Math.sin(ang) * d0); ctx.stroke(); } }
        ctx.restore();
      });
    },

    // A radar-style pulse: a coloured disc that spreads out and fades (r in screen pixels).
    pulse(o) {
      world(o, (ctx, life, t) => {
        const dur = o.dur ?? 1.2;
        if (t < 0 || t > dur) return;
        const f = EASE.out(t / dur); const R = px(o.r ?? 190) * f; const a = 1 - t / dur; const color = o.color ?? '40,255,80';
        ctx.save(); ctx.translate(X(o.lon), Y(o.lat));
        const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, `rgba(${color},${0.1 * a})`); gr.addColorStop(0.85, `rgba(${color},${0.5 * a})`); gr.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
        ctx.strokeStyle = `rgba(${color},${a})`; ctx.lineWidth = px(4); ctx.beginPath(); ctx.arc(0, 0, R * 0.96, 0, TAU); ctx.stroke();
        ctx.restore();
      });
    },

    // Damage on the ground: dark holes that grow, with dust. km: size of the damaged area on the ground.
    breach(o) {
      const sd = Math.round(Math.abs(o.lon * 97 + o.lat * 53)) + 3;
      world(o, (ctx, life, t) => {
        if (t < 0) return;
        const km = o.km ?? 0.4; const R = (km / 111) * PPD;     // 1 degree of latitude is about 111 km
        const grow = smooth(t / (o.grow ?? 1.2));
        const rnd = rand(sd);
        ctx.save(); ctx.translate(X(o.lon), Y(o.lat));
        for (let i = 0; i < 16; i++) {
          const ang = rnd() * TAU; const dist = rnd() * R * 0.9 * grow; const rad = (0.15 + rnd() * 0.3) * R * grow;
          const cx = Math.cos(ang) * dist; const cy = Math.sin(ang) * dist;
          ctx.fillStyle = 'rgba(190,150,110,0.55)'; ctx.beginPath(); ctx.arc(cx, cy, rad * 1.25, 0, TAU); ctx.fill();   // broken edge
          ctx.fillStyle = 'rgba(8,8,10,0.95)'; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.fill();
        }
        const rnd2 = rand(sd + 5);   // dust rising
        for (let i = 0; i < 10; i++) {
          const ang = rnd2() * TAU; const dist = rnd2() * R * 1.1; const rise = t * R * 0.5 * (0.5 + rnd2());
          const a = 0.35 * smooth(t / 0.4) * (1 - clamp((t - 1.2) / 1.5, 0, 1));
          if (a > 0.01) { const gr = ctx.createRadialGradient(Math.cos(ang) * dist, Math.sin(ang) * dist - rise, 0, Math.cos(ang) * dist, Math.sin(ang) * dist - rise, R * 0.5); gr.addColorStop(0, `rgba(190,170,150,${a})`); gr.addColorStop(1, 'rgba(190,170,150,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist - rise, R * 0.5, 0, TAU); ctx.fill(); }
        }
        ctx.restore();
      });
    },

    // Streaming water and cloud that covers the frame and clears again: a bridge between two zoom levels. Peaks halfway.
    swirl(o = {}) {
      const dur = o.dur ?? 1.4;
      screen({ ...o, out: undefined }, (ctx, life, t) => {
        if (t < 0 || t > dur) return;
        const e = Math.sin((t / dur) * Math.PI);
        const color = o.color ?? '200,225,245';
        ctx.fillStyle = `rgba(${o.tint ?? '110,160,200'},${0.4 * e})`; ctx.fillRect(0, 0, s.W, s.H);
        const rnd = rand(11);
        for (let i = 0; i < 34; i++) {
          const y = rnd() * s.H; const sp = (0.4 + rnd()) * s.W * 0.9 * (rnd() < 0.5 ? -1 : 1); const w = (0.5 + rnd()) * s.W * 0.7; const h = (0.04 + rnd() * 0.1) * s.H;
          const x = ((rnd() * s.W * 1.5 + sp * t) % (s.W * 1.6) + s.W * 1.6) % (s.W * 1.6) - s.W * 0.3;
          ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + i) * 30); ctx.scale(w / h, 1);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, h); g.addColorStop(0, `rgba(${color},${0.5 * e})`); g.addColorStop(1, `rgba(${color},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, h, 0, TAU); ctx.fill(); ctx.restore();
        }
      }, 'none');
    },

    // A flash of one colour across the frame (a hard cut).
    cut(at, o = {}) {
      const dur = o.dur ?? 0.35;
      s.sfx('swipe', at - 0.05, { gain: 0.25 });
      screen({ at: at - dur / 2 }, (ctx, life, t) => {
        const a = Math.max(0, 1 - Math.abs(t - dur / 2) / (dur / 2));
        if (a <= 0) return;
        ctx.globalAlpha *= a;
        ctx.fillStyle = o.color ?? '#19f0ff';
        ctx.fillRect(0, 0, s.W, s.H);
      }, 'none');
    },

    // Darkens the satellite picture so lines and lettering glow (a dark schematic map). Call it right after basemap() and the close-ups.
    dim(alpha = 0.5, color = '5,14,24') {
      world({ at: -1 }, (ctx) => { ctx.fillStyle = `rgba(${color},${alpha})`; ctx.fillRect(X(-180), Y(90), 360 * (X(1) - X(0)), 180 * PPD); });
    },

    // A dam icon that pops in on a place and keeps its size on screen: a grey wall with water behind it and a spill in front.
    dam(o) {
      s.sfx('thud', at0(o), { gain: 0.3 });
      world(o, (ctx, life, t) => {
        if (t < 0) return;
        const size = px(o.size ?? 130); const pop = smooth(t / 0.3); const bounce = 1 + 0.18 * Math.sin(clamp(t / 0.35, 0, 1) * Math.PI);
        ctx.save(); ctx.translate(X(o.lon), Y(o.lat)); ctx.rotate((-cam.rotate * Math.PI) / 180); ctx.scale(pop * bounce, pop * bounce);
        ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = size * 0.2; ctx.shadowOffsetY = size * 0.08;
        const w = size; const h = size * 0.62;
        ctx.fillStyle = o.water ?? '#2e8cff'; ctx.beginPath(); ctx.roundRect(-w * 0.95, -h * 0.9, w * 0.95, h * 0.95, size * 0.08); ctx.fill();      // the lake behind
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) { ctx.fillRect(-w * (0.8 - i * 0.2), -h * (0.6 - i * 0.2), w * 0.25, size * 0.025); }
        ctx.fillStyle = '#c9d0d8'; ctx.beginPath(); ctx.moveTo(-w * 0.08, -h); ctx.lineTo(w * 0.08, -h); ctx.lineTo(w * 0.3, h * 0.1); ctx.lineTo(-w * 0.3, h * 0.1); ctx.closePath(); ctx.fill();   // the wall
        ctx.strokeStyle = '#7d8793'; ctx.lineWidth = size * 0.035; ctx.stroke();
        ctx.fillStyle = '#8f99a5'; for (const gx of [-0.12, 0, 0.12]) ctx.fillRect(w * gx - size * 0.025, -h * 0.75, size * 0.05, h * 0.55);   // gates
        ctx.fillStyle = 'rgba(160,215,255,0.9)'; ctx.beginPath(); ctx.moveTo(-w * 0.28, h * 0.1); ctx.lineTo(w * 0.28, h * 0.1); ctx.lineTo(w * 0.5, h * 0.55); ctx.lineTo(-w * 0.5, h * 0.55); ctx.closePath(); ctx.fill();   // the spill
        ctx.restore();
      });
    },

    // Big comparison bars on a dark panel: rows [{ label, value, color, unit }]. The bars grow in turn and the numbers count up. Call it after tilt().
    versus(rows, o = {}) {
      const max = o.max ?? Math.max(...rows.map((r) => r.value));
      rows.forEach((_, i) => s.sfx('click', at0(o) + i * 0.25, { gain: 0.2 }));
      s.sfx('chime', at0(o) + rows.length * 0.25 + 0.6, { gain: 0.2 });
      screen(o, (ctx, life, t) => {
        const w = s.W * 0.86; const x0 = s.cx - w / 2; const rowH = o.rowH ?? 190; const y0 = s.H * (o.y ?? 0.4) - (rows.length * rowH) / 2;
        ctx.fillStyle = 'rgba(8,14,24,0.74)'; ctx.beginPath(); ctx.roundRect(x0 - 36, y0 - 30, w + 72, rows.length * rowH + 40, 34); ctx.fill();
        rows.forEach((r, i) => {
          const p = smooth((t - i * 0.25) / 1.0); const y = y0 + i * rowH;
          ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = `800 ${o.size ?? 46}px ${FONT}`; ctx.fillStyle = '#eef4fb'; ctx.fillText(r.label, x0, y + 34);
          const bw = Math.max(1, w * (r.value / max) * p);
          ctx.shadowColor = r.color; ctx.shadowBlur = 24; ctx.fillStyle = r.color; ctx.beginPath(); ctx.roundRect(x0, y + 76, bw, 62, 16); ctx.fill(); ctx.shadowColor = 'transparent';
          const v = r.value * p; const txt = `${Number.isInteger(r.value) ? Math.round(v) : v.toFixed(1)}${r.unit ?? ''}`;
          ctx.font = `800 ${(o.size ?? 46) + 4}px ${FONT}`; ctx.textAlign = bw > w * 0.35 ? 'right' : 'left'; ctx.fillStyle = bw > w * 0.35 ? '#0b1520' : '#ffffff';
          ctx.fillText(txt, bw > w * 0.35 ? x0 + bw - 18 : x0 + bw + 18, y + 108);
        });
      });
    },

    // A two-way switch with a label on each side (DRY SEASON / MONSOON, BEFORE / AFTER). states: [{ at, on }] where on is 0 (left) or 1 (right).
    // Call it after tilt(). y: fraction of the frame height.
    toggle(o) {
      const labels = o.labels ?? ['DRY SEASON', 'MONSOON'];
      const states = [...o.states].sort((a, b) => s.time(a.at) - s.time(b.at));
      s.sfx('click', s.time(states[0].at), { gain: 0.2 });
      states.slice(1).forEach((st) => s.sfx('click', s.time(st.at), { gain: 0.22 }));
      screen({ at: states[0].at, out: o.out }, (ctx) => {
        let v = states[0].on;
        for (let i = 1; i < states.length; i++) { const t0 = s.time(states[i].at); if (s.t >= t0) v = lerp(states[i - 1].on, states[i].on, smooth((s.t - t0) / 0.4)); }
        const cy = s.H * (o.y ?? 0.27); const size = o.size ?? 38; const pad = size * 0.5;
        ctx.font = `800 ${size}px ${FONT}`;
        const wL = ctx.measureText(labels[0]).width; const wR = ctx.measureText(labels[1]).width; const gap = size * 2.4;
        const total = wL + wR + gap + pad * 4; const x0 = s.cx - total / 2;
        ctx.fillStyle = 'rgba(8,14,24,0.72)'; ctx.beginPath(); ctx.roundRect(x0, cy - size * 1.1, total, size * 2.2, size * 1.1); ctx.fill();
        ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        ctx.fillStyle = `rgba(255,255,255,${0.95 - 0.55 * v})`; ctx.fillText(labels[0], x0 + pad * 1.6, cy + size * 0.04);
        ctx.textAlign = 'right'; ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.55 * v})`; ctx.fillText(labels[1], x0 + total - pad * 1.6, cy + size * 0.04);
        const kx = x0 + pad * 1.6 + wL + gap * 0.25; const kx1 = x0 + total - pad * 1.6 - wR - gap * 0.25;   // the switch between the two labels
        const tw = Math.max(size * 1.8, kx1 - kx); const tx = (kx + kx1) / 2 - tw / 2;
        ctx.fillStyle = v < 0.5 ? (o.colors?.[0] ?? '#d9a441') : (o.colors?.[1] ?? '#3da5ff'); ctx.beginPath(); ctx.roundRect(tx, cy - size * 0.45, tw, size * 0.9, size * 0.45); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tx + size * 0.45 + (tw - size * 0.9) * v, cy, size * 0.36, 0, TAU); ctx.fill();
      });
    },

    // The zoom smears towards the middle when the camera dives fast. Call it after the map, before tilt().
    zoomBlur() {
      s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
        if (!live()) return;
        const dz = cam.speed / cam.fps;                      // zoom change per frame, as a log ratio
        const m = clamp(dz * 0.75, 0, 0.32);
        const cv = ctx.canvas;
        if (m < 0.012 || !cv || cv.nodeName !== 'CANVAS') return;
        const sx = cv.width / s.W;
        const tmp = scratchFor(cv.width, cv.height); const t = tmp.getContext('2d');
        t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, tmp.width, tmp.height); t.drawImage(cv, 0, 0);
        const N = clamp(Math.round(m * 55) + 6, 6, 18);
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
        const cx = (s.W / 2) * sx; const cy = cam.fy * sx;
        for (let i = 0; i < N; i++) {
          const k = 1 + m * (i / (N - 1) - 0.5) * 2;
          ctx.globalAlpha = 1 / (i + 1);
          ctx.setTransform(k, 0, 0, k, cx - cx * k, cy - cy * k);
          ctx.drawImage(tmp, 0, 0);
        }
        ctx.restore();
      });
    },

    // Seen at an angle: squeezes the finished map picture row by row (far rows smaller). Call it once, after everything that
    // lies on the map and before the screen-fixed layers (chips, grade, captions).
    tilt(o = {}) {
      s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
        if (!live() || cam.tilt < 0.005) return;
        const cv = ctx.canvas;
        if (!cv || cv.nodeName !== 'CANVAS') return;
        const g = cam.geom; const Wc = cv.width; const Hc = cv.height;
        const tmp = scratchFor(Wc, Hc); const t = tmp.getContext('2d');
        t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, Wc, Hc); t.drawImage(cv, 0, 0);
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium';
        const step = Math.max(1, Math.round(Hc / 800));
        for (let y = 0; y < Hc; y += step) {
          const v0 = y / Hc; const v1 = Math.min(1, (y + step) / Hc);
          const dw = Wc * g.sc((v0 + v1) / 2); const d0 = g.yo(v0) * Hc; const d1 = g.yo(v1) * Hc;
          ctx.drawImage(tmp, 0, y, Wc, v1 * Hc - y, (Wc - dw) / 2, d0, dw, d1 - d0 + 1);
        }
        const hz = ctx.createLinearGradient(0, 0, 0, Hc * 0.4);   // haze towards the far edge
        const a = clamp((o.haze ?? 1) * (cam.tilt / 0.45) * 0.6, 0, 0.8);
        hz.addColorStop(0, `rgba(5,14,22,${a})`); hz.addColorStop(1, 'rgba(5,14,22,0)');
        ctx.fillStyle = hz; ctx.fillRect(0, 0, Wc, Hc * 0.4);
        ctx.restore();
      });
    },

    // A small white callout with a pointer, upright on the screen whatever the camera does. Call it after tilt().
    chip(text, o) {
      const size = o.size ?? 34;
      screen(o, (ctx, life, t) => {
        const p = cam.project(o.lon, o.lat);
        if (p.x < -200 || p.x > s.W + 200 || p.y < -200 || p.y > s.H + 200) return;
        const rise = (1 - smooth(t / 0.3)) * 14;
        ctx.save(); ctx.translate(p.x + (o.dx ?? 0), p.y + (o.dy ?? 0) + rise);
        ctx.font = `700 ${size}px ${FONT}`;
        const w = ctx.measureText(text).width + size * 1.1; const h = size * 1.6; const gap = size * 0.5;
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = size * 0.5; ctx.shadowOffsetY = size * 0.15;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.roundRect(-w / 2, -h - gap, w, h, size * 0.28); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-size * 0.3, -gap + 0.5); ctx.lineTo(0, 0); ctx.lineTo(size * 0.3, -gap + 0.5); ctx.closePath(); ctx.fill();
        ctx.shadowColor = 'transparent'; ctx.fillStyle = '#0b1520'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, -h / 2 - gap + size * 0.04);
        ctx.restore();
      });
    },
  };
}
