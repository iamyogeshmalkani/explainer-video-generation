// Motivation kit for explainroo: a black screen, a kinetic quote with glowing key words, then
// classical paintings that open from a slit while the narration appears one word at a time.
//
//   quoteCard(s, { tokens: ['In', 'the', 'MORNING', 'when', 'thou', 'risest', 'UNWILLINGLY!red'], at: '#q1', out: '#q2' });
//   band(s, SHOTS, { aspect: 1.5, from: '#s1' });   // the paintings
//   wordCaptions(s, { from: '#s1' });                // the narration, one word at a time
//
// Quote tokens: lowercase words are small and sit in a loose row; CAPITAL words are big and
// each gets its own line. Add !red, !gold or !white to a token for its color (CAPITALS default to white).
// Frame: everything is centered at about the middle of the screen; the bottom third stays free.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const outCubic = (p) => 1 - Math.pow(1 - p, 3);
const inCubic = (p) => p * p * p;
const FONT = '"Playfair Display", "Instrument Serif", Georgia, serif';
const COLORS = { white: '#ffffff', red: '#ff1f1f', gold: '#ffc61a' };

function parseToken(tok) {
  const [text, mark] = String(tok).split('!');
  // a CAPITAL word is a key word; a single letter (I, A) stays small unless it is marked
  const caps = text === text.toUpperCase() && /[A-Z]/.test(text) && (text.length > 1 || COLORS[mark]);
  return { text: caps ? text : text, caps, color: COLORS[mark] ? mark : 'white', key: !!COLORS[mark] && mark !== 'white' };
}

// A glowing word: a soft colored halo, then the word.
function glowText(ctx, text, x, y, size, color, weight, alpha = 1) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha *= alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = size * 0.1;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.globalAlpha /= alpha || 1;
}

// A kinetic quote card. The words appear one after another between `at` and about 80% of the
// way to `out`, then the whole card fades. o: { tokens, at, out, lead (0.25 s early), y (center, 0.36), size (0.05) }
export function quoteCard(s, o) {
  // a card starts a little before its marker, so the screen is not black while the voice begins
  const at = Math.max(0, s.time(o.at) - (o.lead ?? 0.25));
  const out = o.out === undefined ? s.dur : s.time(o.out);
  const tokens = o.tokens.map(parseToken);
  s.draw({ at, out, enter: 'none', outDur: 0.35, sfx: false }, (ctx) => {
    const W = s.W;
    const small = (o.size ?? 0.05) * W;
    // rows: consecutive lowercase tokens share a row; every CAPITAL token is its own row
    const rows = [];
    tokens.forEach((t, i) => {
      if (t.caps) rows.push({ caps: true, items: [{ ...t, i }] });
      else if (rows.length && !rows[rows.length - 1].caps) rows[rows.length - 1].items.push({ ...t, i });
      else rows.push({ caps: false, items: [{ ...t, i }] });
    });
    const sizes = rows.map((r) => (r.caps ? (r.items[0].key ? 0.135 : 0.105) * W : small));
    const gap = small * 0.55;
    const total = sizes.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);
    let y = s.H * (o.y ?? 0.36) - total / 2;
    const span = Math.max(0.4, (out - at) * 0.8);
    const per = span / tokens.length;
    rows.forEach((r, ri) => {
      const size = sizes[ri];
      const cy = y + size / 2;
      // a loose row: the small words sit on a gentle zigzag, shifted a little off-center
      let widths = r.items.map((it) => {
        ctx.font = `${it.caps ? 700 : 400} ${size}px ${FONT}`;
        return ctx.measureText(it.text).width;
      });
      const space = size * 0.32;
      const rowW = widths.reduce((a, b) => a + b, 0) + space * (r.items.length - 1);
      const shift = r.caps ? 0 : (ri % 2 ? 0.05 : -0.05) * W;
      let x = s.cx + shift - rowW / 2;
      r.items.forEach((it, k) => {
        const appear = clamp((s.t - at - it.i * per) / 0.28);
        if (appear > 0) {
          const rise = (1 - outCubic(appear)) * size * 0.35;
          const zig = r.caps ? 0 : (k % 2 ? 1 : -1) * size * 0.14;
          const color = COLORS[it.color];
          glowText(ctx, it.text, x + widths[k] / 2, cy + rise + zig, size, color, it.caps ? 700 : 400, appear);
        }
        x += widths[k] + space;
      });
      y += size + gap;
    });
  });
}

function findImage(s, base) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${base}.${ext}`)) return `assets/${base}.${ext}`;
  return null;
}

// Deterministic drifting dust inside the band.
function dust(s, ctx, x0, y0, w, h, count = 60) {
  const t = s.t;
  const u = s.W / 100;
  for (let i = 0; i < count; i++) {
    const r = (k) => s.rand(i * 11 + k);
    const speed = 6 + r(3) * 16;
    const px = ((r(1) * w + t * (r(2) * 10 - 5) + Math.sin(t * 0.6 + r(4) * 6.28) * u * 1.2) % w + w) % w;
    const py = (((r(5) * h - t * speed * (s.H / 1280)) % h) + h) % h;
    const a = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * (1 + r(6) * 2) + i));
    ctx.fillStyle = `rgba(255,244,225,${a * 0.55})`;
    ctx.beginPath();
    ctx.arc(x0 + px, y0 + py, u * (0.12 + r(7) * 0.28), 0, Math.PI * 2);
    ctx.fill();
  }
}

// The paintings: a full-width band that opens from a thin slit, pushes in slowly, and closes
// before the next one. shots: [{ n, at, file, prompt }]. o: { aspect (1.5), from (first shot start), y (0.46) }
export function band(s, shots, o = {}) {
  const aspect = o.aspect ?? 1.5;
  shots.forEach((shot, i) => {
    const t0 = s.time(shot.at);
    const t1 = i + 1 < shots.length ? s.time(shots[i + 1].at) : s.dur;
    s.draw({ at: t0, out: t1 + 0.05, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const W = s.W;
      const fullH = W / aspect;
      const cy = s.H * (o.y ?? 0.46);
      const open = outCubic(clamp((s.t - t0) / 0.55));
      const close = inCubic(clamp((s.t - (t1 - 0.4)) / 0.4));
      const h = Math.max(2, fullH * open * (1 - close));
      const top = cy - h / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top, W, h);
      ctx.clip();
      const p = clamp((s.t - t0) / Math.max(0.5, t1 - t0));
      const src = findImage(s, shot.file);
      if (src) {
        const img = s.engine.image(src);
        const z = lerp(1.0, 1.1, p);
        const sc = Math.max(W / img.naturalWidth, fullH / img.naturalHeight) * z;
        const iw = img.naturalWidth * sc;
        const ih = img.naturalHeight * sc;
        ctx.drawImage(img, s.cx - iw / 2, cy - ih / 2, iw, ih);
      } else {
        const g = ctx.createLinearGradient(0, cy - fullH / 2, W, cy + fullH / 2);
        g.addColorStop(0, '#3a2418');
        g.addColorStop(1, '#14100d');
        ctx.fillStyle = g;
        ctx.fillRect(0, cy - fullH / 2, W, fullH);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${W * 0.06}px ${FONT}`;
        ctx.fillText(`SHOT ${String(shot.n ?? i + 1).padStart(2, '0')}`, s.cx, cy - fullH * 0.28);
        ctx.font = `400 ${W * 0.03}px ${FONT}`;
        const words = String(shot.prompt || '').split(' ');
        let line = ''; let yy = cy - fullH * 0.1;
        for (const w of words) {
          if (ctx.measureText(`${line} ${w}`).width > W * 0.8 && line) { ctx.fillText(line, s.cx, yy); yy += W * 0.045; line = w; } else line = line ? `${line} ${w}` : w;
        }
        ctx.fillText(line, s.cx, yy);
      }
      dust(s, ctx, 0, cy - fullH / 2, W, fullH);
      // a soft shade at the edges of the band
      const sh = ctx.createLinearGradient(0, cy - fullH / 2, 0, cy + fullH / 2);
      sh.addColorStop(0, 'rgba(0,0,0,0.35)');
      sh.addColorStop(0.25, 'rgba(0,0,0,0)');
      sh.addColorStop(0.75, 'rgba(0,0,0,0)');
      sh.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = sh;
      ctx.fillRect(0, cy - fullH / 2, W, fullH);
      ctx.restore();
    });
  });
}

// The narration one word at a time, centered, white with a soft glow.
// o: { from (seconds or marker: no words before this), y (0.48), size (0.085 of the width) }
export function wordCaptions(s, o = {}) {
  const from = o.from === undefined ? 0 : s.time(o.from);
  const words = (s.words || []).filter((w) => w.start >= from - 0.05);
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const t = s.t;
    let cur = null;
    for (let i = 0; i < words.length; i++) {
      const next = words[i + 1];
      const end = next ? Math.min(words[i].end + 0.25, next.start) : words[i].end + 0.4;
      if (t >= words[i].start - 0.03 && t < end) { cur = words[i]; break; }
    }
    if (!cur) return;
    const text = cur.text.replace(/[.,;:!?"“”()]+$/g, '').replace(/^["“”(]+/g, '');
    const size = (o.size ?? 0.085) * s.W;
    const a = clamp((t - cur.start + 0.03) / 0.1);
    ctx.font = `400 ${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const y = s.H * (o.y ?? 0.48);
    // a dark halo keeps the word readable on bright paintings, then the white glow
    ctx.globalAlpha = a;
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = size * 0.35;
    ctx.fillStyle = '#000';
    ctx.fillText(text, s.cx, y);
    ctx.shadowColor = 'rgba(255,255,255,0.95)';
    ctx.shadowBlur = size * 0.22;
    ctx.fillStyle = '#fff';
    ctx.fillText(text, s.cx, y);
    ctx.shadowBlur = 0;
    ctx.fillText(text, s.cx, y);
    ctx.globalAlpha = 1;
  });
}
