// Pictures for the tech-explainer kit: a real picture (made by an image model on a plain white background)
// is cut out of that background when the video is drawn, and given a white die-cut edge.
// Same method as the sticker-pop template, so no background-removal tool is needed.
// pictureFor(s, 'server') finds assets/server.png|jpg|jpeg|webp and returns { cv, w, h }, or null if it is missing.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const MAX_SIDE = 720;

export function cutout(img) {
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
    // the background is the color of the corners; flood in from the border so white inside the object stays
    let r = 0; let gg = 0; let b = 0;
    for (const i of corners) { r += d[i * 4]; gg += d[i * 4 + 1]; b += d[i * 4 + 2]; }
    r /= 4; gg /= 4; b /= 4;
    const dist = (i) => Math.max(Math.abs(d[i * 4] - r), Math.abs(d[i * 4 + 1] - gg), Math.abs(d[i * 4 + 2] - b));
    const TOL = 42;
    const bg = new Uint8Array(w * h);
    const stack = [];
    const take = (i) => { if (!bg[i] && dist(i) <= TOL) { bg[i] = 1; stack.push(i); } };
    for (let x = 0; x < w; x++) { take(x); take((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { take(y * w); take(y * w + w - 1); }
    while (stack.length) {
      const i = stack.pop();
      const x = i % w;
      if (x > 0) take(i - 1);
      if (x < w - 1) take(i + 1);
      if (i >= w) take(i - w);
      if (i < w * (h - 1)) take(i + w);
    }
    // a grey drop shadow under the object counts as background too: grow through light, colorless pixels
    const grey = (i) => Math.max(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) - Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) <= 30 && (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3 >= 120;
    const seeds = [];
    for (let i = 0; i < w * h; i++) {
      if (bg[i]) continue;
      const x = i % w;
      if (grey(i) && ((x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < w * (h - 1) && bg[i + w]))) seeds.push(i);
    }
    for (const i of seeds) if (!bg[i]) { bg[i] = 1; stack.push(i); }
    while (stack.length) {
      const i = stack.pop();
      const x = i % w;
      const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < w * (h - 1) ? i + w : -1];
      for (const j of nb) if (j >= 0 && !bg[j] && grey(j)) { bg[j] = 1; stack.push(j); }
    }
    for (let i = 0; i < w * h; i++) {
      if (bg[i]) { d[i * 4 + 3] = 0; continue; }
      const x = i % w;
      const edge = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < w * (h - 1) && bg[i + w]);
      if (edge) d[i * 4 + 3] = Math.round(255 * clamp((dist(i) - TOL * 0.4) / TOL));
    }
    g.putImageData(id, 0, 0);
  }
  // crop to what is left
  let x0 = w; let y0 = h; let x1 = -1; let y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const r = Math.max(4, Math.round(Math.max(cw, ch) * 0.022));
  const W2 = cw + r * 2;
  const H2 = ch + r * 2;
  const sil = document.createElement('canvas');
  sil.width = W2; sil.height = H2;
  const sg = sil.getContext('2d');
  sg.drawImage(c, x0, y0, cw, ch, r, r, cw, ch);
  sg.globalCompositeOperation = 'source-in';
  sg.fillStyle = '#ffffff';
  sg.fillRect(0, 0, W2, H2);
  const out = document.createElement('canvas');
  out.width = W2; out.height = H2;
  const og = out.getContext('2d');
  for (const rad of [r, r * 0.55]) for (let a = 0; a < 28; a++) og.drawImage(sil, Math.cos((a / 28) * Math.PI * 2) * rad, Math.sin((a / 28) * Math.PI * 2) * rad);
  og.drawImage(c, x0, y0, cw, ch, r, r, cw, ch);
  return { cv: out, w: W2, h: H2 };
}

export function pictureFor(s, name) {
  const store = (s.engine.__techpics ||= new Map());
  if (store.has(name)) return store.get(name);
  let found = null;
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${name}.${ext}`)) { found = `assets/${name}.${ext}`; break; }
  const v = found ? cutout(s.engine.image(found)) : null;
  store.set(name, v);
  return v;
}

