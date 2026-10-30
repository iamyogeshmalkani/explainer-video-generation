// Dark-history kit for explainroo: full-frame oil paintings that move like footage, a hit at every cut,
// drifting fog, dust, ash and embers, a flickering fire, film grain, a hook line at the start, and 2 to 3 word
// captions with the spoken word lit yellow. Made from a study of a 40-second "crusade" history short.
//
//   shots(s, SHOTS);        // first: the paintings (eased camera, hand-held shake, depth, a thud and punch at each cut)
//   atmosphere(s, SHOTS);   // drifting fog, dust motes and falling ash, per shot
//   embers(s, SHOTS);       // drifting sparks and a flickering fire glow, per shot
//   flashes(s, SHOTS);      // a bright flash frame on the hardest cuts
//   vignette(s);            // dark edges (they breathe a little) and a dark foot for the captions
//   grain(s);               // film grain (gentle by default: grain makes video files much bigger)
//   hook(s, 'The crusade destroyed by its own arrogance', { out: '#s2' });
//   captions(s);            // last: on top of everything
//
// A shot: { n, at: '#s1', file: 'shot01', motion, prompt, and optionally:
//   embers (0 to 1, 0.5)  sparks and fire flicker          fog (0 to 1, 0.35)   drifting mist
//   dust (0 to 1, 0.25)   floating motes                   ash (0 to 1, 0)      falling ash, for dead battlefields
//   shake (0 to 2, 0.6)   hand-held camera shake           depth (0 to 2, 1)    how much the picture "has depth"
//   ease  ('inOut' | 'out' | 'linear')                     hit (thud strength, 1)   flash (0 to 1, from hit)
// motion: push | pull | panLeft | panRight | rise | still
//
// Depth: with assets/<file>.depth.png (made by scripts/make-depth.py: white = near) the painting is cut into
// layers that slide against each other as the camera moves, a real 2.5D parallax. Without it the kit bends
// the picture like a camera moving forward over a ground plane, which needs no extra files.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const FONT = '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
const YELLOW = '#fff200';

// A number from 0 to 1 that depends only on n, so every render comes out the same.
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
// Smooth wandering noise between -1 and 1: the same value for the same (t, seed), changing slowly with t.
function wander(t, seed) {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  return (hash(i + seed * 17.3) + (hash(i + 1 + seed * 17.3) - hash(i + seed * 17.3)) * u) * 2 - 1;
}
const EASE = {
  linear: (p) => p,
  out: (p) => 1 - (1 - p) ** 3,
  inOut: (p) => 0.5 - 0.5 * Math.cos(Math.PI * p),
};

// zoom, pan x (fraction of the width), pan y (fraction of the height), from the start of the shot to its end
const MOTIONS = {
  push: { z: [1.0, 1.15], x: [0, 0], y: [0, 0] },
  pull: { z: [1.15, 1.0], x: [0, 0], y: [0, 0] },
  panLeft: { z: [1.14, 1.14], x: [0.045, -0.045], y: [0, 0] },
  panRight: { z: [1.14, 1.14], x: [-0.045, 0.045], y: [0, 0] },
  rise: { z: [1.14, 1.14], x: [0, 0], y: [0.035, -0.035] },
  still: { z: [1.02, 1.04], x: [0, 0], y: [0, 0] },
};

function textLines(ctx, text, maxWidth) {
  const lines = [''];
  for (const w of text.split(' ')) {
    const t = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t;
  }
  return lines;
}

function find(s, base) {
  for (const ext of ['mp4', 'mov', 'webm', 'm4v']) if (s.engine.clips.has(`assets/${base}.${ext}`)) return { kind: 'clip', src: `assets/${base}.${ext}` };
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${base}.${ext}`)) return { kind: 'image', src: `assets/${base}.${ext}` };
  return null;
}

function placeholder(s, shot, i, t0, t1, first) {
  s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.12, outDur: 0.12, sfx: false }, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, s.H);
    g.addColorStop(0, `hsl(${(i * 37) % 360},30%,16%)`);
    g.addColorStop(1, 'hsl(25,45%,6%)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `800 ${s.W * 0.11}px ${FONT}`;
    ctx.fillText(`SHOT ${String(shot.n ?? i + 1).padStart(2, '0')}`, s.cx, s.H * 0.22);
    ctx.font = `600 ${s.W * 0.036}px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    textLines(ctx, shot.prompt || '', s.W * 0.78).slice(0, 10).forEach((l, k) => ctx.fillText(l, s.cx, s.H * 0.32 + k * s.W * 0.052));
    ctx.fillStyle = YELLOW;
    ctx.fillText(`placeholder: add assets/${shot.file} (.png or .mp4)`, s.cx, s.H * 0.88);
  });
}

// ---------- depth: layers cut out of the painting by its depth map ----------

const LAYER_CUTS = [0.3, 0.47, 0.63, 0.8]; // a pixel belongs to layer k when its depth is above LAYER_CUTS[k-1]; layer 0 is everything
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

function layersFor(s, src, depthSrc) {
  const store = (s.engine.__epicLayers ||= new Map());
  if (store.has(src)) return store.get(src);
  const img = s.engine.image(src);
  const k = Math.min(1, 1100 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * k);
  const h = Math.round(img.naturalHeight * k);
  const read = (im) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0, w, h);
    return { c, data: g.getImageData(0, 0, w, h).data };
  };
  const color = read(img);
  const depth = read(s.engine.image(depthSrc)).data;
  const layers = [color.c];
  for (const cut of LAYER_CUTS) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    const out = g.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      out.data[i * 4] = color.data[i * 4];
      out.data[i * 4 + 1] = color.data[i * 4 + 1];
      out.data[i * 4 + 2] = color.data[i * 4 + 2];
      out.data[i * 4 + 3] = Math.round(255 * smooth(cut - 0.07, cut + 0.07, depth[i * 4] / 255));
    }
    g.putImageData(out, 0, 0);
    layers.push(c);
  }
  const v = { w, h, layers };
  store.set(src, v);
  return v;
}

// Draws one picture, covering the frame, zoomed by z and moved by (ox, oy) pixels.
function place(ctx, im, W, H, cx, cy, z, ox, oy) {
  const iw = im.naturalWidth || im.width;
  const ih = im.naturalHeight || im.height;
  const sc = Math.max(W / iw, H / ih) * z;
  ctx.drawImage(im, cx - (iw * sc) / 2 + ox, cy - (ih * sc) / 2 + oy, iw * sc, ih * sc);
}

// The same picture bent like a camera moving forward over the ground: the bottom of the frame zooms and slides
// faster than the horizon, so a flat painting gets a feeling of depth without any extra files.
function warped(ctx, img, W, H, cx, cy, z, ox, oy, depth) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const sc = Math.max(W / iw, H / ih);
  const dw = iw * sc;
  const dh = ih * sc;
  const top = cy - dh / 2;
  const HORIZON = 0.42;
  const N = 36;
  const zAt = (Y) => 1 + (z - 1) * (1 + depth * 1.1 * (Y / H - HORIZON)); // the zoom of the row at frame height Y
  let prev = cy + oy + (top - cy) * zAt(top);
  for (let i = 0; i < N; i++) {
    const Y1 = top + ((i + 1) / N) * dh;
    const next = cy + oy + (Y1 - cy) * zAt(Y1);
    const mid = top + ((i + 0.5) / N) * dh;
    const zm = zAt(mid);
    const shift = ox * (1 + depth * 0.8 * (mid / H - HORIZON));
    ctx.drawImage(img, 0, (i / N) * ih, iw, ih / N + 0.5, cx + shift - (dw * zm) / 2, prev, dw * zm, next - prev + 1);
    prev = next;
  }
}

// Every shot runs until the next one starts; the first starts at frame 0. Each cut gets a deep thud (and a short
// rising whoosh just before it) and the picture "punches" in a little. The camera eases, drifts and shakes like a
// hand-held one; with a depth map the painting is cut into layers that slide against each other.
export function shots(s, list, o = {}) {
  list.forEach((shot, i) => {
    const first = i === 0;
    const t0 = first ? 0 : s.time(shot.at);
    const t1 = i + 1 < list.length ? s.time(list[i + 1].at) + 0.12 : s.dur;
    const hit = shot.hit ?? 1;
    if (o.hits !== false && hit > 0) {
      s.sfx('thud', Math.max(0, t0 - 0.01), { gain: (first ? 1.6 : 1.5) * hit });
      if (!first) s.sfx('whoosh', Math.max(0, t0 - 0.16), { gain: 0.35 * hit, dur: 0.2 });
    }
    const found = find(s, shot.file);
    if (!found) { placeholder(s, shot, i, t0, t1, first); return; }
    if (found.kind === 'clip') {
      s.clip(found.src, { x: s.cx, y: s.cy, w: s.W, h: s.H, fit: 'cover', frame: 'none', shadow: false, radius: 0, at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.12, outDur: 0.12, sfx: false, speed: shot.speed ?? 1, from: shot.from ?? 0 });
      return;
    }
    const m = MOTIONS[shot.motion] || MOTIONS.push;
    const ease = EASE[shot.ease] || EASE.inOut;
    const shake = shot.shake ?? 0.6;
    const depth = shot.depth ?? 1;
    const depthSrc = ['png', 'jpg', 'jpeg', 'webp'].map((e) => `assets/${shot.file}.depth.${e}`).find((p) => s.engine.images.has(p));
    const side = i % 2 ? 1 : -1; // pushes and pulls also drift a little sideways, so the parallax has something to show
    s.draw({ at: t0, out: t1, enter: first ? 'none' : 'fade', dur: 0.12, outDur: 0.12, sfx: false }, (ctx) => {
      const lt = s.t - t0;
      const p = ease(clamp(lt / Math.max(0.1, t1 - t0)));
      // a small punch at the cut that settles, then the slow move
      const punch = 1 + (first ? 0 : 0.05) * Math.exp(-lt * 9);
      const z = lerp(m.z[0], m.z[1], p) * punch * 1.035; // 3.5% extra so the shake never shows an edge
      // hand-held: slow wandering, a faster tremor, and a kick at the cut that dies away
      const kick = Math.exp(-lt * 7) * (first ? 0 : 1);
      const amp = s.W * 0.0042 * shake;
      const ox = lerp(m.x[0], m.x[1], p) * s.W + amp * (wander(s.t * 0.9, i * 3 + 1) + 0.35 * wander(s.t * 5.3, i * 3 + 2) + kick * 3 * wander(lt * 16, i + 40));
      const oy = lerp(m.y[0], m.y[1], p) * s.H + amp * (wander(s.t * 0.8, i * 3 + 3) + 0.35 * wander(s.t * 4.7, i * 3 + 4) + kick * 3 * wander(lt * 16, i + 80));
      const roll = shake * 0.0022 * wander(s.t * 0.6, i * 3 + 5) * (1 + kick * 2);
      ctx.save();
      ctx.translate(s.cx, s.cy);
      ctx.rotate(roll);
      ctx.translate(-s.cx, -s.cy);
      if (depthSrc && depth > 0) {
        // layers: the nearer the layer, the more it zooms and slides
        const L = layersFor(s, found.src, depthSrc);
        const lateral = (p - 0.5) * 2 * s.W * 0.024 * depth * (m.x[0] === m.x[1] ? side : 0.5);
        L.layers.forEach((lay, k) => {
          const near = k / L.layers.length;
          const zk = 1 + (z - 1) * (1 + depth * 1.1 * near);
          place(ctx, lay, s.W, s.H, s.cx, s.cy, zk, ox * (1 + depth * 1.4 * near) + lateral * near * 2, oy * (1 + depth * 0.6 * near));
        });
      } else {
        warped(ctx, s.engine.image(found.src), s.W, s.H, s.cx, s.cy, z, ox, oy, depth * 0.55);
      }
      ctx.restore();
    });
  });
}

// Drifting sparks and a slow fire flicker. The strength comes from each shot's `embers` (0 to 1, default 0.5).
export function embers(s, list) {
  const spans = list.map((shot, i) => ({ t0: i === 0 ? 0 : s.time(shot.at), v: shot.embers ?? 0.5 }));
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    let v = 0;
    for (const sp of spans) if (s.t >= sp.t0) v = sp.v;
    if (v <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // the glow of a fire that breathes
    // a fire flickers unevenly: a slow wander plus quick jumps, strongest low in the frame where the light would be
    const fl = clamp(0.5 + 0.4 * wander(s.t * 9, 7) + 0.25 * wander(s.t * 23, 8), 0, 1);
    ctx.fillStyle = `rgba(255,120,30,${(0.03 * v * (0.4 + fl)).toFixed(3)})`;
    ctx.fillRect(0, 0, s.W, s.H);
    const glow = ctx.createRadialGradient(s.cx, s.H * 0.66, 0, s.cx, s.H * 0.66, s.W * 0.95);
    glow.addColorStop(0, `rgba(255,140,50,${(0.11 * v * fl).toFixed(3)})`);
    glow.addColorStop(1, 'rgba(255,140,50,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, s.W, s.H);
    const n = Math.round(46 * v) + 6;
    for (let i = 0; i < n; i++) {
      const speed = 0.05 + s.rand(i + 11) * 0.09;
      const life = (s.t * speed + s.rand(i)) % 1;
      const x = s.rand(i + 5) * s.W + Math.sin(s.t * (0.6 + s.rand(i + 3)) + i) * s.W * 0.03;
      const y = s.H * (1.04 - life * 1.1);
      const a = Math.sin(Math.PI * life) * (0.35 + 0.65 * s.rand(i + 21)) * Math.min(1, v * 1.4);
      const r = s.W * (0.0016 + s.rand(i + 31) * 0.0034);
      ctx.fillStyle = `rgba(255,${150 + Math.round(s.rand(i + 41) * 70)},60,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

// A soft, seamless wisp texture, made once: several scales of smooth noise that wrap around at the edges.
function fogTile(s) {
  const store = (s.engine.__epicFog ||= {});
  if (store.tile) return store.tile;
  const N = 256;
  const c = document.createElement('canvas');
  c.width = N; c.height = N;
  const g = c.getContext('2d');
  const out = g.createImageData(N, N);
  const lattice = (x, y, period, seed) => hash(((x % period) + period) % period * 57 + (((y % period) + period) % period) * 131 + seed);
  const value = (u, v, period, seed) => {
    const x0 = Math.floor(u * period);
    const y0 = Math.floor(v * period);
    const fx = u * period - x0;
    const fy = v * period - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = lattice(x0, y0, period, seed);
    const b = lattice(x0 + 1, y0, period, seed);
    const cc = lattice(x0, y0 + 1, period, seed);
    const d = lattice(x0 + 1, y0 + 1, period, seed);
    return a + (b - a) * sx + (cc - a) * sy + (a - b - cc + d) * sx * sy;
  };
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = x / N;
      const v = y / N;
      const n = 0.5 * value(u, v, 3, 1) + 0.3 * value(u, v, 6, 2) + 0.2 * value(u, v, 12, 3);
      const a = smooth(0.38, 0.8, n);
      const i = (y * N + x) * 4;
      out.data[i] = 206; out.data[i + 1] = 196; out.data[i + 2] = 186;
      out.data[i + 3] = Math.round(255 * a);
    }
  }
  g.putImageData(out, 0, 0);
  store.tile = c;
  return c;
}

// Mist drifting in two layers the opposite way, floating dust that glints, and falling ash, per shot:
// `fog`, `dust` and `ash` (0 to 1) in the shot list. They are what makes a still painting feel like a place with air in it.
export function atmosphere(s, list) {
  const spans = list.map((shot, i) => ({ t0: i === 0 ? 0 : s.time(shot.at), fog: shot.fog ?? 0.35, dust: shot.dust ?? 0.25, ash: shot.ash ?? 0 }));
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    let cur = spans[0];
    for (const sp of spans) if (s.t >= sp.t0) cur = sp;
    const t = s.t;
    ctx.save();
    if (cur.fog > 0.01) {
      const tile = fogTile(s);
      const pat = ctx.createPattern(tile, 'repeat');
      ctx.globalCompositeOperation = 'screen';
      [{ size: 1.5, vx: 0.014, vy: 0.003, a: 0.2, o: 0 }, { size: 0.95, vx: -0.022, vy: -0.004, a: 0.13, o: 0.37 }].forEach((L) => {
        const sc = (s.W * L.size) / tile.width;
        pat.setTransform(new DOMMatrix().translate(s.W * (L.vx * t + L.o), s.H * (L.vy * t + L.o * 0.5) + Math.sin(t * 0.4 + L.o * 9) * s.H * 0.01).scale(sc));
        ctx.globalAlpha = L.a * cur.fog;
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, s.W, s.H);
      });
      ctx.globalAlpha = 1;
    }
    if (cur.dust > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      const n = Math.round(34 * cur.dust) + 4;
      for (let i = 0; i < n; i++) {
        const near = hash(i + 7); // 0 far, 1 near: near motes are bigger, softer and faster
        const x = (((hash(i) + t * (0.006 + 0.02 * near) * (i % 2 ? 1 : -1) + Math.sin(t * 0.5 + i) * 0.015) % 1) + 1) % 1 * s.W;
        const y = (((hash(i + 1) - t * (0.004 + 0.012 * near)) % 1) + 1) % 1 * s.H;
        const glint = 0.35 + 0.65 * Math.max(0, wander(t * 1.6, i)) ;
        if (near > 0.72) {
          const r = s.W * (0.012 + 0.012 * near);
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(255,200,140,${(0.1 * glint).toFixed(3)})`);
          g.addColorStop(1, 'rgba(255,200,140,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        } else {
          ctx.fillStyle = `rgba(255,225,180,${(0.5 * glint * (0.3 + near)).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, s.W * (0.0014 + 0.0035 * near), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    if (cur.ash > 0.01) {
      ctx.globalCompositeOperation = 'source-over';
      const n = Math.round(46 * cur.ash) + 4;
      for (let i = 0; i < n; i++) {
        const near = hash(i + 301);
        const fall = 0.035 + 0.05 * near;
        const x = ((((hash(i + 300) + t * 0.012 * (0.5 + near)) % 1) + 1) % 1) * s.W + Math.sin(t * (0.6 + near) + i * 2) * s.W * 0.03;
        const y = ((((hash(i + 302) + t * fall) % 1) + 1) % 1) * s.H;
        const w = s.W * (0.003 + 0.007 * near);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * (0.8 + near) + i);
        ctx.fillStyle = `rgba(175,170,165,${(0.55 * (0.4 + near * 0.6)).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w, w * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  });
}

// A bright flash on the cut itself, for the hardest hits (`flash`, 0 to 1; by default 0.4 on a hit of 1.3 or more).
export function flashes(s, list) {
  list.forEach((shot, i) => {
    if (i === 0) return;
    const f = shot.flash ?? ((shot.hit ?? 1) >= 1.3 ? 0.4 : 0);
    if (f <= 0) return;
    const t0 = s.time(shot.at);
    s.draw({ at: t0, out: t0 + 0.3, enter: 'none', sfx: false }, (ctx) => {
      const lt = s.t - t0;
      ctx.fillStyle = `rgba(255,236,205,${(f * Math.exp(-lt * 16)).toFixed(3)})`;
      ctx.fillRect(0, 0, s.W, s.H);
    });
  });
}

// Film grain: a fresh speck pattern 12 times a second, so the picture never sits perfectly still. Grain is random, so
// video compression cannot shrink it: at full strength it made a 10 second clip about 4.5 times bigger, which is why
// the defaults are gentle (o.amount 0.4, o.fps 12; amount 0 turns it off).
export function grain(s, o = {}) {
  const amount = o.amount ?? 0.4;
  const fps = o.fps ?? 12;
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const store = (s.engine.__epicGrain ||= {});
    if (!store.tiles) {
      store.tiles = [0, 1, 2, 3].map((k) => {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        const d = g.createImageData(256, 256);
        for (let i = 0; i < 256 * 256; i++) {
          const v = Math.round(128 + (hash(i * 3 + k * 99991) + hash(i * 5 + k * 77777) - 1) * 150);
          d.data[i * 4] = v; d.data[i * 4 + 1] = v; d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255;
        }
        g.putImageData(d, 0, 0);
        return c;
      });
    }
    const f = Math.floor(s.t * fps);
    const pat = ctx.createPattern(store.tiles[f % 4], 'repeat');
    pat.setTransform(new DOMMatrix().translate(hash(f) * 256, hash(f + 9) * 256).scale(2));
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.2 * amount;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.restore();
  });
}

// Dark edges, and a dark foot where the captions sit.
export function vignette(s) {
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const breath = Math.sin(s.t * 0.8); // the dark edges breathe a little, like a lens in a flickering room
    const g = ctx.createRadialGradient(s.cx, s.cy, s.W * (0.35 + 0.02 * breath), s.cx, s.cy, s.H * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${(0.5 + 0.04 * breath).toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.W, s.H);
    const bot = ctx.createLinearGradient(0, s.H * 0.55, 0, s.H);
    bot.addColorStop(0, 'rgba(0,0,0,0)');
    bot.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = bot;
    ctx.fillRect(0, s.H * 0.55, s.W, s.H * 0.45);
  });
}

// The opening line near the top: white, bold, sentence case, a soft black glow. It fades after `out`.
// o: { at (0.1), out, y (0.27), size (0.064 of the width), sfx }
export function hook(s, text, o = {}) {
  s.draw({ at: o.at ?? 0.1, out: o.out, enter: 'fade', dur: 0.3, outDur: 0.35, sfx: false }, (ctx) => {
    const size = (o.size ?? 0.064) * s.W;
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = textLines(ctx, text, s.W * 0.86);
    const y0 = s.H * (o.y ?? 0.27) - ((lines.length - 1) * size * 1.25) / 2;
    const grow = 1 + 0.05 * Math.exp(-(s.t - (o.at ?? 0.1)) * 2.2); // settles in slowly
    ctx.save();
    ctx.translate(s.cx, s.H * (o.y ?? 0.27));
    ctx.scale(grow, grow);
    ctx.translate(-s.cx, -s.H * (o.y ?? 0.27));
    lines.forEach((ln, i) => {
      const y = y0 + i * size * 1.25;
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = size * 0.35;
      ctx.lineWidth = size * 0.16;
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      ctx.strokeText(ln, s.cx, y);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(ln, s.cx, y);
    });
    ctx.restore();
  });
}

// The narration two or three words at a time in bold italics, Title Case; the word being spoken is yellow.
// o: { y (0.69), size (0.062 of the width), maxChars (18), maxWords (3), titleCase (true), from (seconds: no captions before), until }
export function captions(s, o = {}) {
  const maxChars = o.maxChars ?? 18;
  const maxWords = o.maxWords ?? 3;
  const cap = (w) => (o.titleCase === false ? w : w.charAt(0).toUpperCase() + w.slice(1));
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
    const shown = cap(w.text.replace(/[.,;:!?"“”]+$/g, '').replace(/^["“”]+/g, ''));
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
    const size = (o.size ?? 0.062) * s.W;
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const space = ctx.measureText(' ').width;
    const widths = c.w.map((w) => ctx.measureText(w.text).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (c.w.length - 1);
    const y = s.H * (o.y ?? 0.69);
    ctx.save();
    ctx.translate(s.cx, y);
    const age = Math.max(0, t - (c.w[0].start - 0.04));
    const pop = 1 + 0.16 * Math.exp(-age * 16); // each new group lands with a little pop
    ctx.scale(pop, pop);
    ctx.transform(1, 0, -0.2, 1, 0, 0); // italic
    let x = -total / 2;
    c.w.forEach((w, i) => {
      const lit = t >= w.start - 0.02 && t < w.end + 0.1;
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = size * 0.3;
      ctx.lineWidth = size * 0.15;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.strokeText(w.text, x, 0);
      ctx.shadowBlur = 0;
      ctx.fillStyle = lit ? YELLOW : '#ffffff';
      ctx.fillText(w.text, x, 0);
      x += widths[i] + space;
    });
    ctx.restore();
  });
}
