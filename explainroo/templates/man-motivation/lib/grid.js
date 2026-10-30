// Man-motivation kit for explainroo: a black screen, a 2 x 2 grid of warm sepia portraits that fade in one
// after another, a thin line of text on the seam in the middle, dust floating over it all.
// Studied from a 12 second "the body / the wealth / the mindset a man can reach ... and yet you choose this" short.
//
//   grid(s, GRIDS, SHOTS);     // the portrait grids, each with its line of text
//   center(s, CENTERS);        // one gold line alone on black ("And yet")
//
// Frame: the grid is the middle two thirds of the screen; the bottom sixth stays free for app buttons.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const outCubic = (p) => 1 - Math.pow(1 - p, 3);
const FONT = '"Inter", "Helvetica Neue", Arial, sans-serif';
// the warm grade: black and white, then amber. Same look on every photo, so a mixed set still reads as one video.
const GRADE = 'grayscale(1) sepia(1) saturate(1.5) hue-rotate(-8deg) brightness(0.95) contrast(1.12)';
const INK = '#f6e6c4';
const GOLD = '#ffd24a';

function findImage(s, base) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${base}.${ext}`)) return `assets/${base}.${ext}`;
  return null;
}

// Drifting dust over the grid, deterministic so every render is the same.
function dust(s, ctx, y0, h, count = 70) {
  const t = s.t;
  const u = s.W / 100;
  for (let i = 0; i < count; i++) {
    const r = (k) => s.rand(i * 13 + k);
    const px = (((r(1) * s.W + t * (r(2) * 12 - 6) + Math.sin(t * 0.7 + r(4) * 6.28) * u * 1.4) % s.W) + s.W) % s.W;
    const py = (((r(5) * h - t * (5 + r(3) * 14) * (s.H / 1280)) % h) + h) % h;
    const a = 0.15 + 0.5 * (0.5 + 0.5 * Math.sin(t * (1 + r(6) * 2) + i));
    ctx.fillStyle = `rgba(255,236,200,${a * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, y0 + py, u * (0.12 + r(7) * 0.26), 0, Math.PI * 2);
    ctx.fill();
  }
}

// The graded copy of each photo, made once: shrunk to what a cell can show (twice the cell, for the push-in) and turned
// amber. Grading a 5000 pixel photo on every frame is what makes a render crawl. Same input, same output, so renders match.
const graded = new Map();
function gradedPhoto(img, src, maxW) {
  if (graded.has(src)) return graded.get(src);
  const k = Math.min(1, maxW / img.naturalWidth);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(img.naturalWidth * k));
  c.height = Math.max(1, Math.round(img.naturalHeight * k));
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.filter = GRADE;
  g.drawImage(img, 0, 0, c.width, c.height);
  graded.set(src, c);
  return c;
}

// A cell: the photo covers it, keeps the subject (focus) in view and pushes in very slowly. No photo yet: a placeholder.
function cell(s, ctx, x, y, w, h, shot, p) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const src = shot && findImage(s, shot.file);
  if (src) {
    const img = gradedPhoto(s.engine.image(src), src, w * 2.4);
    const z = lerp(1.0, 1.08, p);
    const sc = Math.max(w / img.width, h / img.height) * z;
    const iw = img.width * sc;
    const ih = img.height * sc;
    const [fx, fy] = shot.focus || [0.5, 0.3];
    // keep the focus point where it would be without the crop, as far as the picture allows
    const ox = clamp(x + w / 2 - fx * iw, x + w - iw, x);
    const oy = clamp(y + h / 2 - fy * ih, y + h - ih, y);
    ctx.drawImage(img, ox, oy, iw, ih);
  } else {
    ctx.fillStyle = '#1d140a';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(246,230,196,0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${s.W * 0.045}px ${FONT}`;
    ctx.fillText(`PHOTO ${String(shot?.n ?? '?').padStart(2, '0')}`, x + w / 2, y + h * 0.4);
    ctx.font = `400 ${s.W * 0.026}px ${FONT}`;
    const words = String(shot?.query || '').split(' ');
    let line = ''; let yy = y + h * 0.5;
    for (const wd of words) {
      if (ctx.measureText(`${line} ${wd}`).width > w * 0.86 && line) { ctx.fillText(line, x + w / 2, yy); yy += s.W * 0.036; line = wd; } else line = line ? `${line} ${wd}` : wd;
    }
    ctx.fillText(line, x + w / 2, yy);
  }
  ctx.restore();
}

// The portrait grids. grids: [{ at, out, photos: [n, n, n, n], line }]  (photos are shot numbers from SHOTS: top left,
// top right, bottom left, bottom right). Each photo fades in `stagger` seconds after the one before, from dark; the whole
// grid fades out at `out`. The line fades in on the seam once the second photo is up.
// o: { top (0.156, of the height), stagger (0.3), sfx (true) }
export function grid(s, grids, shots, o = {}) {
  const byN = Object.fromEntries(shots.map((x) => [x.n, x]));
  const stagger = o.stagger ?? 0.3;
  grids.forEach((g, gi) => {
    const t0 = s.time(g.at);
    const t1 = g.out === undefined ? s.dur : s.time(g.out);
    if (o.sfx !== false) s.sfx('thud', Math.max(0, t0), { gain: 0.9 });
    s.draw({ at: t0, out: t1 + 0.05, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const W = s.W;
      const top = s.H * (o.top ?? 0.156);
      const ch = s.H * 0.336;
      const cw = W / 2;
      const fadeOut = 1 - clamp((s.t - (t1 - 0.35)) / 0.35);
      const p = clamp((s.t - t0) / Math.max(0.5, t1 - t0));
      g.photos.slice(0, 4).forEach((n, i) => {
        if (n === null || n === undefined) return;
        const a = clamp((s.t - t0 - i * stagger) / 0.55) * fadeOut;
        if (a <= 0) return;
        ctx.globalAlpha = outCubic(a);
        cell(s, ctx, (i % 2) * cw, top + Math.floor(i / 2) * ch, cw, ch, byN[n], p);
      });
      ctx.globalAlpha = 1;
      dust(s, ctx, top, ch * 2);
      // a soft shade so the line stays readable where it crosses a bright photo
      const seam = top + ch;
      const sh = ctx.createLinearGradient(0, seam - ch * 0.16, 0, seam + ch * 0.16);
      sh.addColorStop(0, 'rgba(0,0,0,0)');
      sh.addColorStop(0.5, `rgba(0,0,0,${0.32 * fadeOut})`);
      sh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sh;
      ctx.fillRect(0, seam - ch * 0.16, W, ch * 0.32);
      // the line, thin and warm white, on the seam
      if (g.line) {
        const la = clamp((s.t - t0 - stagger * 1.5) / 0.45) * fadeOut;
        if (la > 0) {
          const size = (o.size ?? 0.05) * W;
          ctx.font = `400 ${size}px ${FONT}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = la;
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = size * 0.4;
          ctx.fillStyle = g.color === 'gold' ? GOLD : INK;
          ctx.fillText(g.line, s.cx, seam);
          ctx.shadowBlur = 0;
          ctx.fillText(g.line, s.cx, seam);
          ctx.globalAlpha = 1;
        }
      }
    });
  });
}

// One line alone on black, centered, with a soft glow: the turn ("And yet") or the last words.
// centers: [{ at, out, text, color ('gold' | 'white'), size (0.075 of the width), y (0.5), sub, subAt }]
// `sub` is a smaller white line under it ("Follow for more"); it fades in at the marker `subAt` (default 1 s after the main line).
export function center(s, centers) {
  centers.forEach((c) => {
    const t0 = s.time(c.at);
    const t1 = c.out === undefined ? s.dur : s.time(c.out);
    s.sfx('thud', Math.max(0, t0), { gain: 1.4 });
    s.draw({ at: t0, out: t1 + 0.05, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const a = clamp((s.t - t0) / 0.5) * (1 - clamp((s.t - (t1 - 0.3)) / 0.3));
      if (a <= 0) return;
      const size = (c.size ?? 0.075) * s.W;
      const color = c.color === 'white' ? INK : GOLD;
      ctx.font = `400 ${size}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const y = s.H * (c.y ?? 0.5) + (1 - outCubic(clamp((s.t - t0) / 0.5))) * size * 0.3;
      ctx.globalAlpha = a;
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 0.45;
      ctx.fillStyle = color;
      ctx.fillText(c.text, s.cx, y);
      ctx.shadowBlur = 0;
      ctx.fillText(c.text, s.cx, y);
      ctx.globalAlpha = 1;
      if (c.sub) {
        const st = c.subAt ? s.time(c.subAt) : t0 + 1;
        const sa = clamp((s.t - st) / 0.5) * (1 - clamp((s.t - (t1 - 0.3)) / 0.3));
        if (sa > 0) {
          const ss = size * 0.72;
          ctx.font = `400 ${ss}px ${FONT}`;
          ctx.globalAlpha = sa;
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = ss * 0.4;
          ctx.fillStyle = INK;
          ctx.fillText(c.sub, s.cx, y + size * 1.35 + (1 - outCubic(clamp((s.t - st) / 0.5))) * ss * 0.3);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }
      dust(s, ctx, s.H * 0.3, s.H * 0.4, 30);
    });
  });
}
