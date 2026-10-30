// Clay-stopmotion kit for explainroo: AI clay pictures that move like claymation, for free.
//
// Two kinds of picture:
//   backdrops  full-frame clay scenes (assets/shot01.png ...), moved by a camera that steps and "boils"
//   puppets    clay characters and props on a flat green background (assets/yeast.png ...),
//              cut out when the video is drawn, then squashed, stretched and hopped around
//
// The trick that makes it look like stop-motion: everything moves in steps (10 pictures a second by
// default, each held for 3 video frames), a backdrop trembles a little between steps (the "boil" of
// clay under a fingertip), and puppets squash and stretch instead of just fading in.
//
//   backdrops(s, SHOTS, { fps, boil });   // first: the full-frame scenes
//   grain(s, { fps });                    // tiny flickering specks and light, over the scenes
//   puppets(s, CAST, { fps });            // clay characters and props, with entrances and idle wobble
//   title(s, 'WHY DOES *BREAD* RISE?');   // title card, letters wobble in steps
//   board(s, {...});                      // a clay plaque for a number or a short list (drawn, never AI text)
//   captions(s);                          // last: on top of everything
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const FONT = '"Kalam", "Noto Sans Devanagari", sans-serif';
const CREAM = '#fff3d6';
const BROWN = '#4a2c17';
const ORANGE = '#ff9a2e';
const TEAL = '#35c2b0';

// A number from 0 to 1 that depends only on n, so every render is the same.
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const centered = (n) => hash(n) * 2 - 1; // -1 to 1

// The step a time falls in: stop-motion holds one pose for several frames.
const stepOf = (t, fps) => Math.floor(t * fps + 1e-6);

// ---------- backdrops ----------

// zoom, pan x (fraction of the width), pan y (fraction of the height), from the start of the shot to its end
const MOTIONS = {
  push: { z: [1.0, 1.12], x: [0, 0], y: [0, 0] },
  pull: { z: [1.12, 1.0], x: [0, 0], y: [0, 0] },
  panLeft: { z: [1.12, 1.12], x: [0.04, -0.04], y: [0, 0] },
  panRight: { z: [1.12, 1.12], x: [-0.04, 0.04], y: [0, 0] },
  rise: { z: [1.12, 1.12], x: [0, 0], y: [0.03, -0.03] },
  still: { z: [1, 1], x: [0, 0], y: [0, 0] },
};

// Finds the file for a shot: a clip (assets/<base>.mp4 ...) or a picture (assets/<base>.png ...).
function find(s, base) {
  for (const ext of ['mp4', 'mov', 'webm', 'm4v']) if (s.engine.clips.has(`assets/${base}.${ext}`)) return { kind: 'clip', src: `assets/${base}.${ext}` };
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${base}.${ext}`)) return { kind: 'image', src: `assets/${base}.${ext}` };
  return null;
}

function textLines(ctx, text, maxWidth) {
  const lines = [''];
  for (const w of text.split(' ')) {
    const t = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t;
  }
  return lines;
}

function backdrop(s, src, shot, t0, t1, first, o) {
  const m = MOTIONS[shot.motion] || MOTIONS.push;
  const seed = (shot.n ?? 1) * 1000;
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.25, outDur: 0.25, sfx: false }, (ctx) => {
    const img = s.engine.image(src);
    const step = stepOf(s.t, o.fps);
    const p = clamp((step / o.fps - t0) / Math.max(0.1, t1 - t0)); // the camera moves in steps too
    const z = lerp(m.z[0], m.z[1], p) * (1 + 0.012 * o.boil); // a little extra so the trembling never shows an edge
    const sc = Math.max(s.W / img.naturalWidth, s.H / img.naturalHeight) * z;
    const w = img.naturalWidth * sc;
    const h = img.naturalHeight * sc;
    const k = seed + step;
    const dx = centered(k * 3 + 1) * 0.0035 * s.W * o.boil;
    const dy = centered(k * 3 + 2) * 0.0035 * s.H * o.boil;
    const rot = centered(k * 3 + 3) * 0.0035 * o.boil; // radians, about 0.2 degrees
    ctx.save();
    ctx.translate(s.cx + lerp(m.x[0], m.x[1], p) * s.W + dx, s.cy + lerp(m.y[0], m.y[1], p) * s.H + dy);
    ctx.rotate(rot);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  });
}

// What shows while a backdrop is missing: a clay-colored card with the shot number and its prompt.
function placeholder(s, shot, i, t0, t1, first) {
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.2, outDur: 0.2, sfx: false }, (ctx) => {
    const hue = (i * 41 + 18) % 360;
    const g = ctx.createLinearGradient(0, 0, 0, s.H);
    g.addColorStop(0, `hsl(${hue},45%,62%)`);
    g.addColorStop(1, `hsl(${(hue + 25) % 360},40%,38%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `700 110px ${FONT}`;
    ctx.fillText(`SHOT ${String(shot.n ?? i + 1).padStart(2, '0')}`, s.cx, s.H * 0.2);
    ctx.font = `700 38px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    textLines(ctx, shot.prompt || '', s.W * 0.78).slice(0, 8).forEach((l, k) => ctx.fillText(l, s.cx, s.H * 0.3 + k * 52));
    ctx.fillStyle = CREAM;
    ctx.font = `700 34px ${FONT}`;
    ctx.fillText(`placeholder: add assets/${shot.file} (.png or .mp4)`, s.cx, s.H * 0.92);
  });
}

// list: [{ n, at: '#s1' or seconds, file: 'shot01', motion, prompt }]. Each shot runs until the next one starts.
// o: { fps: 10 (steps a second), boil: 1 (0 = still, 2 = jittery) }
export function backdrops(s, list, o = {}) {
  const opt = { fps: o.fps ?? 10, boil: o.boil ?? 1 };
  list.forEach((shot, i) => {
    const first = i === 0;
    const t0 = first ? 0 : s.time(shot.at);
    const t1 = i + 1 < list.length ? s.time(list[i + 1].at) + 0.25 : s.dur;
    const found = find(s, shot.file);
    if (!found) placeholder(s, shot, i, t0, t1, first);
    else if (found.kind === 'clip') {
      // a hero clip from an image-to-video tool plays as it is
      s.clip(found.src, { x: s.cx, y: s.cy, w: s.W, h: s.H, fit: 'cover', frame: 'none', shadow: false, radius: 0, at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.25, outDur: 0.25, sfx: false, speed: shot.speed ?? 1, from: shot.from ?? 0 });
    } else backdrop(s, found.src, shot, t0, t1, first, opt);
  });
}

// Specks and a light that flickers a little, in steps, over the backdrops (like a lamp over a tabletop set).
export function grain(s, o = {}) {
  const fps = o.fps ?? 10;
  const amount = o.amount ?? 1;
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const step = stepOf(s.t, fps);
    ctx.save();
    ctx.fillStyle = `rgba(255,236,190,${0.025 * Math.max(0, centered(step * 7 + 5)) * amount})`; // light flicker
    ctx.fillRect(0, 0, s.W, s.H);
    const n = Math.round(260 * amount);
    for (let i = 0; i < n; i++) {
      const k = step * 997 + i * 3;
      const light = hash(k + 2) > 0.5;
      ctx.fillStyle = light ? 'rgba(255,255,255,0.10)' : 'rgba(40,20,5,0.10)';
      const size = 1.5 + hash(k + 3) * 2.5;
      ctx.fillRect(hash(k) * s.W, hash(k + 1) * s.H, size, size);
    }
    ctx.restore();
  });
}

// ---------- puppets: clay pictures cut out of a plain background ----------

const MAX_SIDE = 760;

// Cuts a COLORED flat background (a green screen) out of RGBA pixels `d`, in place.
// The model paints that background with a gradient, a soft floor shadow and a reflection, so one color cannot name it.
// Instead it grows in from the border, one neighbor at a time: a pixel joins the background when it is clearly the
// background's color family (its strongest channel leads the other two) and is almost the same as the neighbor it was
// reached from. Gradients and soft shadows change slowly, so the growth follows them; the clay's edge is a sharp
// step, so the growth stops there, even when the clay has a green tint from bounce light.
export function keyColored(d, w, h) {
  const hiOf = (i) => Math.max(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
  const seeds = [];
  for (let x = 0; x < w; x++) seeds.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) seeds.push(y * w, y * w + w - 1);
  // the background's strongest channel, from the border
  const sum = [0, 0, 0];
  for (const i of seeds) { sum[0] += d[i * 4]; sum[1] += d[i * 4 + 1]; sum[2] += d[i * 4 + 2]; }
  const dom = sum[0] >= sum[1] && sum[0] >= sum[2] ? 0 : sum[1] >= sum[2] ? 1 : 2;
  const lead = (i) => d[i * 4 + dom] - Math.max(d[i * 4 + (dom + 1) % 3], d[i * 4 + (dom + 2) % 3]); // how far the key color leads
  const greenness = (i) => lead(i) / (d[i * 4 + dom] || 1);
  // the background's typical greenness, from the middle value along the border; the clay is never as green as that,
  // even with a green tint from bounce light, so "clearly the background's color" means most of that greenness
  const border = seeds.map(greenness).sort((a, b) => a - b);
  const gb = border[Math.floor(border.length / 2)] || 0.4;
  const step = (i, j) => Math.max(Math.abs(d[i * 4] - d[j * 4]), Math.abs(d[i * 4 + 1] - d[j * 4 + 1]), Math.abs(d[i * 4 + 2] - d[j * 4 + 2]));
  const neighbors = (i) => { const x = i % w; return [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < w * (h - 1) ? i + w : -1]; };

  // One try: `minGreen` is how much of the background's greenness a pixel needs, `maxStep` how much it may differ
  // from the neighbor it was reached from. Returns the background mask and whether the result looks right.
  const grow = (minGreen, maxStep) => {
    const MIN = gb * minGreen;
    const bgish = (i) => hiOf(i) >= 30 && lead(i) >= 12 && greenness(i) >= MIN;
    const bg = new Uint8Array(w * h);
    const stack = [];
    for (const i of seeds) if (!bg[i] && bgish(i)) { bg[i] = 1; stack.push(i); }
    while (stack.length) {
      const i = stack.pop();
      for (const j of neighbors(i)) if (j >= 0 && !bg[j] && bgish(j) && step(i, j) <= maxStep) { bg[j] = 1; stack.push(j); }
    }
    // What is left is the puppet plus patches of background the growth could not reach (where the green gets paler
    // or lighter). Keep the biggest piece (the puppet); drop crumbs; drop every other piece that touches the
    // picture's edge, because the puppet itself never does.
    const comp = new Int32Array(w * h);
    const sizes = [0];
    const onEdge = [false];
    for (let s0 = 0; s0 < w * h; s0++) {
      if (bg[s0] || comp[s0]) continue;
      const id = sizes.length;
      sizes.push(0);
      onEdge.push(false);
      comp[s0] = id;
      stack.push(s0);
      while (stack.length) {
        const i = stack.pop();
        sizes[id]++;
        const x = i % w;
        if (x === 0 || x === w - 1 || i < w || i >= w * (h - 1)) onEdge[id] = true;
        for (const j of neighbors(i)) if (j >= 0 && !bg[j] && !comp[j]) { comp[j] = id; stack.push(j); }
      }
    }
    const biggest = Math.max(...sizes);
    const main = sizes.indexOf(biggest);
    for (let i = 0; i < w * h; i++) {
      if (bg[i]) continue;
      const id = comp[i];
      if (sizes[id] < biggest * 0.02 || (id !== main && onEdge[id])) bg[i] = 1;
    }
    // If the biggest piece still touches the edge, background leftovers have fused with the puppet: not usable.
    return { bg, ok: !onEdge[main] };
  };
  // Strict first: it keeps pale or shaded clay whole (so it needs no step limit: the clay is never that green). If
  // background is left fused to the puppet, grow looser, with a step limit so the growth stays out of the clay.
  let result = null;
  for (const [minGreen, maxStep] of [[0.9, 255], [0.75, 18], [0.6, 24]]) {
    result = grow(minGreen, maxStep);
    if (result.ok) break;
  }
  const bg = result.bg;
  const touches = (i) => { const x = i % w; return (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < w * (h - 1) && bg[i + w]); };
  for (let i = 0; i < w * h; i++) {
    if (bg[i]) { d[i * 4 + 3] = 0; continue; }
    if (!touches(i)) continue;
    // the edge pixel is partly background: see-through by how green it still is, and without the green rim
    d[i * 4 + 3] = Math.round(255 * clamp((gb - greenness(i)) / (gb * 0.5)));
    const other = Math.max(d[i * 4 + (dom + 1) % 3], d[i * 4 + (dom + 2) % 3]);
    if (d[i * 4 + dom] > other) d[i * 4 + dom] = other;
  }
}

// Cuts a WHITE or GREY background out of RGBA pixels `d`, in place: the corners give its color, and it is flooded in
// from the border so a white eye or a highlight inside the clay stays. A pale puppet cannot be told from a white
// background, which is why a green background is the default (see keyColored).
function keyPlain(d, w, h, r, gg, b) {
  const dist = (i) => Math.max(Math.abs(d[i * 4] - r), Math.abs(d[i * 4 + 1] - gg), Math.abs(d[i * 4 + 2] - b));
  const TOL = 40;
  const bg = new Uint8Array(w * h);
  const stack = [];
  const take = (i) => { if (!bg[i] && dist(i) <= TOL) { bg[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { take(x); take((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { take(y * w); take(y * w + w - 1); }
  const flood = (ok) => {
    while (stack.length) {
      const i = stack.pop();
      const x = i % w;
      const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < w * (h - 1) ? i + w : -1];
      for (const j of nb) if (j >= 0 && !bg[j] && ok(j)) { bg[j] = 1; stack.push(j); }
    }
  };
  flood((j) => dist(j) <= TOL);
  const touches = (i) => { const x = i % w; return (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < w * (h - 1) && bg[i + w]); };
  // A floor shadow is light and only faintly colored (the clay tints it pink or warm); the clay is more saturated.
  // The strict rule runs everywhere, so a pale highlight on the clay's edge is kept; only the bottom fifth of what is
  // left, where the shadow under the feet sits, gets the loose rule.
  const lowSat = (i, max, min) => {
    const hi = Math.max(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
    return hi >= min && (hi - Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2])) / hi <= max;
  };
  const spread = (ok) => {
    for (let i = 0; i < w * h; i++) if (!bg[i] && ok(i) && touches(i)) { bg[i] = 1; stack.push(i); }
    flood(ok);
  };
  spread((i) => lowSat(i, 0.16, 120));
  let top = h; let bottom = -1;
  for (let i = 0; i < w * h; i++) if (!bg[i]) { const y = Math.floor(i / w); if (y < top) top = y; if (y > bottom) bottom = y; }
  const floor = top + (bottom - top) * 0.8;
  spread((i) => Math.floor(i / w) >= floor && lowSat(i, 0.25, 140));
  for (let i = 0; i < w * h; i++) {
    if (bg[i]) { d[i * 4 + 3] = 0; continue; }
    if (touches(i)) d[i * 4 + 3] = Math.round(255 * clamp((dist(i) - TOL * 0.4) / TOL)); // soft edge
  }
}

// Takes the flat background away (see keyColored and keyPlain), then crops to what is left.
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
    let r = 0; let gg = 0; let b = 0;
    for (const i of corners) { r += d[i * 4]; gg += d[i * 4 + 1]; b += d[i * 4 + 2]; }
    r /= 4; gg /= 4; b /= 4;
    const hi = Math.max(r, gg, b);
    if ((hi - Math.min(r, gg, b)) / hi > 0.3) keyColored(d, w, h); else keyPlain(d, w, h, r, gg, b);
    g.putImageData(id, 0, 0);
  }
  let x0 = w; let y0 = h; let x1 = -1; let y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const out = document.createElement('canvas');
  out.width = cw; out.height = ch;
  out.getContext('2d').drawImage(c, x0, y0, cw, ch, 0, 0, cw, ch);
  return { cv: out, w: cw, h: ch };
}

function puppetFor(s, name) {
  const store = (s.engine.__clayPuppets ||= new Map());
  if (store.has(name)) return store.get(name);
  let found = null;
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${name}.${ext}`)) { found = `assets/${name}.${ext}`; break; }
  const v = found ? cutout(s.engine.image(found)) : null;
  store.set(name, v);
  return v;
}

// Pose keys: [seconds, scaleX, scaleY]. Between keys the pose is blended; the stepped clock makes it jerky.
const POP = [[0, 0, 0], [0.1, 1.3, 0.7], [0.2, 0.82, 1.2], [0.3, 1.1, 0.94], [0.4, 0.97, 1.03], [0.5, 1, 1]];
const LAND = [[0, 1.3, 0.7], [0.1, 0.9, 1.12], [0.2, 1.04, 0.97], [0.3, 1, 1]]; // after a drop or a hop
function keys(list, t) {
  if (t <= list[0][0]) return [list[0][1], list[0][2]];
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i][0]) {
      const p = (t - list[i - 1][0]) / (list[i][0] - list[i - 1][0]);
      return [lerp(list[i - 1][1], list[i][1], p), lerp(list[i - 1][2], list[i][2], p)];
    }
  }
  const last = list[list.length - 1];
  return [last[1], last[2]];
}

// The pose of a puppet `t` seconds after it arrived. dx, dy in picture heights/widths (fractions of the frame).
// Returns { sx, sy, dx, dy, rot }.
function entrance(kind, t, fromX) {
  if (kind === 'none') return { sx: 1, sy: 1, dx: 0, dy: 0, rot: 0 };
  if (kind === 'slide') {
    // hops in from the side: three hops that get smaller, a lean into the direction of travel
    const T = 0.9;
    if (t < T) {
      const p = t / T;
      const hop = Math.abs(Math.sin(p * Math.PI * 3)) * 0.035 * (1 - p);
      const air = Math.sin(p * Math.PI * 3) > 0;
      return { sx: air ? 0.95 : 1.06, sy: air ? 1.06 : 0.94, dx: fromX * (1 - p) * (1 - p), dy: -hop, rot: Math.sign(-fromX) * 0.07 * (1 - p) };
    }
    const [sx, sy] = keys(LAND, t - T);
    return { sx, sy, dx: 0, dy: 0, rot: 0 };
  }
  if (kind === 'drop') {
    const T = 0.3;
    if (t < T) { const p = t / T; return { sx: 0.92, sy: 1.1, dx: 0, dy: -0.7 * (1 - p * p), rot: 0 }; }
    const [sx, sy] = keys(LAND, t - T);
    return { sx, sy, dx: 0, dy: 0, rot: 0 };
  }
  if (kind === 'rise') {
    const T = 0.45;
    if (t < T) { const p = t / T; return { sx: 1 - 0.1 * (1 - p), sy: 1 + 0.12 * (1 - p), dx: 0, dy: 0.45 * (1 - p) * (1 - p), rot: 0 }; }
    const [sx, sy] = keys(LAND, t - T);
    return { sx, sy, dx: 0, dy: 0, rot: 0 };
  }
  const [sx, sy] = keys(POP, t); // 'pop'
  return { sx, sy, dx: 0, dy: 0, rot: 0 };
}

// What shows while a puppet picture is missing: a lumpy clay blob with its name.
function blob(ctx, name, w, h, hue) {
  ctx.fillStyle = `hsl(${hue},55%,62%)`;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h, w, h, Math.min(w, h) * 0.4);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(-w * 0.16, -h * 0.62, w * 0.07, 0, Math.PI * 2); ctx.arc(w * 0.16, -h * 0.62, w * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = BROWN;
  ctx.beginPath(); ctx.arc(-w * 0.16, -h * 0.62, w * 0.03, 0, Math.PI * 2); ctx.arc(w * 0.16, -h * 0.62, w * 0.03, 0, Math.PI * 2); ctx.fill();
  ctx.font = `700 ${Math.round(w * 0.14)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 0, -h * 0.25);
}

// cast: [{ file, at, delay, out, x, y, w, enter, idle, flip, sound }]
//   file   the puppet picture in assets/ (without .png)
//   at     a marker like '#s2' or seconds; delay adds seconds
//   out    when it leaves (a marker or seconds); it shrinks away. Leave it out to keep it until the video ends
//   x, y   where its FEET are, as a fraction of the frame (x 0.5 = middle, y 0.8 = near the bottom)
//   w      its width as a fraction of the frame width
//   enter  pop | slide (from the side the x is closer to, or from: 'left'/'right') | drop | rise | none
//   idle   breathe (default) | hop | none: what it does while it waits
//   flip   true mirrors it
//   sound  false silences the pop
// o: { fps: 10, sound: true }
export function puppets(s, cast, o = {}) {
  const fps = o.fps ?? 10;
  let lastSound = -9;
  cast.forEach((c, idx) => {
    const t0 = s.time(c.at) + (c.delay ?? 0);
    const t1 = c.out === undefined ? s.dur : s.time(c.out);
    const enter = c.enter || 'pop';
    const idle = c.idle || 'breathe';
    const fromX = c.from === 'left' ? -0.7 : c.from === 'right' ? 0.7 : (c.x ?? 0.5) < 0.5 ? -0.7 : 0.7;
    const seed = 5000 + idx * 131;
    if (o.sound !== false && c.sound !== false && enter !== 'none' && t0 - lastSound > 0.6) {
      s.sfx(enter === 'drop' ? 'thud' : 'pop', t0 + (enter === 'drop' ? 0.3 : 0.05), { gain: 0.3 });
      lastSound = t0;
    }
    s.draw({ at: t0, out: t1, enter: 'none', sfx: false }, (ctx) => {
      const v = puppetFor(s, c.file);
      const step = stepOf(s.t, fps); // the same steps as the backdrop: everything changes on the same frames
      const tl = Math.max(0, step / fps - t0); // stepped time since the puppet arrived
      const e = entrance(enter, tl, fromX);
      let { sx, sy, dx, dy, rot } = e;
      // idle: breathing or hopping while it waits (starts when the entrance is over)
      const wait = tl - 1.0;
      if (wait > 0 && idle !== 'none') {
        if (idle === 'hop') {
          const cycle = wait % 1.4;
          if (cycle < 0.5) { const q = cycle / 0.5; dy -= Math.sin(q * Math.PI) * 0.025; sx *= 1 - 0.04 * Math.sin(q * Math.PI); sy *= 1 + 0.06 * Math.sin(q * Math.PI); }
          else { const [lx, ly] = keys(LAND, cycle - 0.5); sx *= lx; sy *= ly; }
        } else {
          const br = Math.sin(wait * Math.PI * 1.6);
          sx *= 1 - 0.018 * br;
          sy *= 1 + 0.03 * br;
        }
        rot += centered(seed + step) * 0.012; // a fingertip nudges it a little each step
      }
      // leaving: a stretch up, then it shrinks to nothing
      const left = (t1 - s.t);
      if (c.out !== undefined && left < 0.3) {
        const q = clamp(left / 0.3);
        sx *= q; sy *= q * (1 + 0.15 * (1 - q));
      }
      if (sx <= 0.001 || sy <= 0.001) return;
      const pw = c.w * s.W;
      const ph = v ? pw * (v.h / v.w) : pw * 1.1;
      ctx.save();
      ctx.translate(((c.x ?? 0.5) + dx) * s.W, ((c.y ?? 0.8) + dy * (s.H / s.W)) * s.H);
      // contact shadow on the table: flatter and fainter when the puppet is up in the air
      const lift = clamp(-dy / 0.05);
      ctx.fillStyle = `rgba(30,15,5,${0.28 * (1 - 0.6 * lift)})`;
      ctx.beginPath();
      ctx.ellipse(0, -pw * 0.01, pw * 0.42 * sx * (1 - 0.25 * lift), pw * 0.07 * (1 - 0.3 * lift), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(rot);
      ctx.scale(sx * (c.flip ? -1 : 1), sy);
      if (v) ctx.drawImage(v.cv, -pw / 2, -ph, pw, ph);
      else blob(ctx, c.file, pw, ph, (idx * 67 + 20) % 360);
      ctx.restore();
    });
  });
}

// ---------- text ----------

function outlined(ctx, text, x, y, size, fill, edge = BROWN) {
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.2;
  ctx.strokeStyle = edge;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

// Title card near the top: cream capitals on brown; *starred* words are orange. Each letter group tilts a
// little in steps, like letters made of clay.
export function title(s, text, o = {}) {
  const fps = o.fps ?? 10;
  s.draw({ at: o.at ?? 0.2, out: o.out, enter: 'fade', dur: 0.3, sfx: false }, (ctx) => {
    const step = stepOf(s.t, fps);
    const size = o.size ?? 74;
    ctx.font = `700 ${size}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const raw = text.toUpperCase().split(' ');
    let on = false;
    const words = raw.map((r) => {
      if (r.startsWith('*')) on = true;
      const w = { t: r.replace(/\*/g, ''), hl: on };
      if (/\*[,.;:!?]*$/.test(r)) on = false;
      return w;
    });
    const space = ctx.measureText(' ').width;
    const maxW = s.W * 0.86;
    const lines = [[]];
    let lw = 0;
    for (const w of words) {
      const ww = ctx.measureText(w.t).width;
      if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push({ ...w, w: ww });
      lw += ww + space;
    }
    const y0 = s.H * (o.y ?? 0.16);
    let wi = 0;
    lines.forEach((l, li) => {
      const total = l.reduce((a, w) => a + w.w, 0) + space * (l.length - 1);
      let x = s.cx - total / 2;
      for (const w of l) {
        const k = step * 31 + wi * 7;
        ctx.save();
        ctx.translate(x + w.w / 2, y0 + li * size * 1.2 + centered(k) * 3);
        ctx.rotate(centered(k + 1) * 0.025);
        ctx.textAlign = 'center';
        outlined(ctx, w.t, 0, 0, size, w.hl ? ORANGE : CREAM);
        ctx.restore();
        x += w.w + space;
        wi++;
      }
    });
  });
}

// A clay plaque with a title and rows of label + value. Drawn, because picture models spell and count badly.
// o: { at, out, y, title, rows: [{ label, value, hot }], fps }   hot: true lights that value orange
export function board(s, o) {
  const fps = o.fps ?? 10;
  s.draw({ at: o.at, out: o.out, enter: 'none', sfx: false }, (ctx) => {
    const step = stepOf(s.t, fps);
    const [bx, by] = keys(POP, Math.max(0, step / fps - s.time(o.at)));
    const w = s.W * 0.8;
    const rowH = 150;
    const h = 150 + rowH * o.rows.length;
    ctx.save();
    ctx.translate(s.cx + centered(step * 5) * 3, s.H * (o.y ?? 0.4) + h / 2);
    ctx.rotate(centered(step * 5 + 1) * 0.012);
    ctx.scale(bx, by);
    ctx.translate(0, -h / 2);
    ctx.fillStyle = 'rgba(30,15,5,0.3)';
    ctx.beginPath(); ctx.roundRect(-w / 2 + 10, 20, w, h, 56); ctx.fill();
    ctx.fillStyle = CREAM;
    ctx.beginPath(); ctx.roundRect(-w / 2, 0, w, h, 56); ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = BROWN;
    ctx.stroke();
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = BROWN;
    ctx.font = `700 52px ${FONT}`;
    ctx.fillText((o.title || '').toUpperCase(), 0, 80);
    o.rows.forEach((r, i) => {
      const y = 150 + rowH * i + rowH / 2;
      ctx.textAlign = 'left';
      ctx.font = `700 48px ${FONT}`;
      ctx.fillStyle = BROWN;
      ctx.fillText(r.label, -w / 2 + 56, y);
      let size = 90;
      ctx.font = `700 ${size}px ${FONT}`;
      const room = w - 112 - ctx.measureText(r.label).width - 30;
      while (size > 40 && ctx.measureText(r.value).width > room) { size -= 4; ctx.font = `700 ${size}px ${FONT}`; }
      ctx.textAlign = 'right';
      ctx.fillStyle = r.hot ? '#e0661a' : BROWN;
      ctx.fillText(r.value, w / 2 - 56, y);
    });
    ctx.restore();
  });
}

// ---------- captions ----------

// The narration a few words at a time, lower middle; the word being spoken is orange, and each new group
// pops in with a small squash.
export function captions(s, o = {}) {
  const fps = o.fps ?? 10;
  const maxChars = o.maxChars ?? 17;
  const maxWords = o.maxWords ?? 3;
  const chunks = [];
  let cur = null;
  for (const w of s.words || []) {
    const shown = o.keepPunctuation ? w.text : w.text.replace(/[.,;:!?"“”]+$/g, '').replace(/^["“”]+/g, '');
    if (cur && (cur.len + 1 + shown.length > maxChars || cur.w.length >= maxWords || /[.!?]$/.test(cur.raw))) { chunks.push(cur); cur = null; }
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
      if (t >= chunks[i].w[0].start - 0.04 && t < (next ? next.w[0].start - 0.04 : last + 0.5)) { c = chunks[i]; break; }
    }
    if (!c) return;
    const size = o.size ?? 72;
    ctx.font = `700 ${size}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const space = ctx.measureText(' ').width;
    const widths = c.w.map((w) => ctx.measureText(w.text).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (c.w.length - 1);
    const [px, py] = keys([[0, 0.8, 1.2], [0.1, 1.12, 0.9], [0.2, 0.97, 1.03], [0.3, 1, 1]], Math.max(0, stepOf(t, fps) / fps - (c.w[0].start - 0.04)));
    ctx.save();
    ctx.translate(s.cx, s.H * (o.y ?? 0.85));
    ctx.scale(px, py);
    let x = -total / 2;
    c.w.forEach((w, i) => {
      const lit = t >= w.start - 0.02 && t < w.end + 0.1;
      outlined(ctx, w.text, x, 0, size, lit ? ORANGE : CREAM);
      x += widths[i] + space;
    });
    ctx.restore();
  });
}
