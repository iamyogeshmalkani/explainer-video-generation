// Book-summary kit for explainroo: a cover card and numbered takeaways, drawn over the shot pictures.
// The pictures, camera moves and (optional) captions come from lib/shots.js.
//
//   cover(s, { author, title, subtitle, at: 0, out: '#s2' });
//   takeaway(s, { numeral: 'I', text: 'A short line.', at: '#t1', out: '#t2' });
//
// Text sizes are fractions of the frame width, so they work for any size. Devanagari and
// other scripts work too; letter spacing is only applied to Latin text, because spacing
// breaks the joined letters of Devanagari.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const SERIF = '"Instrument Serif", "Noto Sans Devanagari", serif';
const SANS = '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
const RED = '#e8392f';
const latin = (str) => /^[\u0000-ɏ -⁯]*$/.test(str);

function outlined(ctx, text, x, y, fill, width) {
  ctx.lineJoin = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function wrapAt(ctx, text, maxW) {
  const lines = [''];
  for (const w of String(text).split(' ')) {
    const t = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
    if (ctx.measureText(t).width > maxW && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t;
  }
  return lines;
}

// Breaks text into lines no wider than maxW, then narrows the width as far as the line count
// allows, so the lines are about equal and no single word is left alone on the last line.
function wrap(ctx, text, maxW) {
  const count = wrapAt(ctx, text, maxW).length;
  if (count < 2) return wrapAt(ctx, text, maxW);
  let lo = maxW * 0.4; let hi = maxW;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    if (wrapAt(ctx, text, mid).length <= count) hi = mid; else lo = mid;
  }
  return wrapAt(ctx, text, hi);
}

// The opening title card: the author in small red capitals between two thin lines,
// the title large and white below, an optional subtitle. It darkens the picture under it.
// o: { author, title ('\n' starts a new line), subtitle, at (0), out, y (0.3), size (title size, 0.3 of the width, shrunk to fit) }
export function cover(s, o) {
  s.draw({ at: o.at ?? 0, out: o.out, enter: 'none', outDur: 0.5, sfx: false }, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, s.H);
    g.addColorStop(0, 'rgba(0,0,0,0.72)');
    g.addColorStop(0.5, 'rgba(0,0,0,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0.78)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let y = s.H * (o.y ?? 0.3);
    // author between thin rules
    if (o.author) {
      const size = s.W * 0.062;
      ctx.font = `700 ${size}px ${SANS}`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = latin(o.author) ? `${size * 0.22}px` : '0px';
      const text = latin(o.author) ? o.author.toUpperCase() : o.author;
      const w = Math.max(ctx.measureText(text).width, s.W * 0.3);
      ctx.fillStyle = RED;
      ctx.fillText(text, s.cx, y);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = Math.max(2, s.W * 0.003);
      for (const dy of [-size * 0.95, size * 0.95]) {
        ctx.beginPath(); ctx.moveTo(s.cx - w / 2, y + dy); ctx.lineTo(s.cx + w / 2, y + dy); ctx.stroke();
      }
      y += size * 2.6;
    }
    // title: large, shrunk so the longest line fits inside 86% of the width
    let tsize = (o.size ?? 0.3) * s.W;
    ctx.font = `700 ${tsize}px ${SERIF}`;
    const widest = Math.max(...String(o.title).split('\n').map((l) => ctx.measureText(l).width));
    if (widest > s.W * 0.86) tsize *= (s.W * 0.86) / widest;
    ctx.font = `700 ${tsize}px ${SERIF}`;
    for (const line of String(o.title).split('\n')) {
      outlined(ctx, line, s.cx, y + tsize * 0.45, '#ffffff', tsize * 0.06);
      y += tsize * 1.1;
    }
    if (o.subtitle) {
      const size = s.W * 0.06;
      ctx.font = `600 ${size}px ${SANS}`;
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.fillText(o.subtitle, s.cx, y + size * 0.9);
    }
  });
}

// A numbered takeaway: the numeral first, the line a moment later, over the picture.
// o: { numeral ('I', '1', '१'), text, at, out, y (0.36), size (0.058 of the width) }
export function takeaway(s, o) {
  s.draw({ at: o.at, out: o.out, enter: 'fade', dur: 0.45, outDur: 0.4, sfx: false }, (ctx, life) => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const y = s.H * (o.y ?? 0.36);
    const nsize = s.W * 0.13;
    const tsize = s.W * (o.size ?? 0.058);
    ctx.font = `700 ${tsize}px ${SANS}`;
    const lines = wrap(ctx, o.text, s.W * 0.8);
    const lh = tsize * 1.38;
    // a soft dark band behind the text so it reads on any picture
    const bandH = nsize * 2.2 + lines.length * lh;
    const band = ctx.createLinearGradient(0, y - nsize * 1.6, 0, y - nsize * 1.6 + bandH);
    band.addColorStop(0, 'rgba(0,0,0,0)');
    band.addColorStop(0.25, 'rgba(0,0,0,0.5)');
    band.addColorStop(0.75, 'rgba(0,0,0,0.5)');
    band.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = band;
    ctx.fillRect(0, y - nsize * 1.6, s.W, bandH);
    ctx.font = `700 ${nsize}px ${SERIF}`;
    outlined(ctx, o.numeral, s.cx, y, '#ffffff', nsize * 0.08);
    const a = clamp((life.local - 0.9) / 0.5);
    if (a > 0) {
      ctx.globalAlpha *= a;
      ctx.font = `700 ${tsize}px ${SANS}`;
      lines.forEach((ln, i) => outlined(ctx, ln, s.cx, y + nsize * 1.15 + i * lh, '#ffffff', tsize * 0.16));
    }
  });
}
