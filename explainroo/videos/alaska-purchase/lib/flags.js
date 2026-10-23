// Flags drawn in code (no image files, so no licensing worries). A country
// fills with its flag through drawFlag(ctx, name, box), called inside a clip.
// Add a country by adding a line to FLAGS: { h: [...] } is horizontal stripes,
// { v: [...] } vertical stripes, and a stripe can be [color, weight].
// Anything missing falls back to a flat colour chosen by the caller.

export const FLAGS = {
  France: { v: ['#0055a4', '#ffffff', '#ef4135'] },
  Italy: { v: ['#009246', '#ffffff', '#ce2b37'] },
  Ireland: { v: ['#169b62', '#ffffff', '#ff883e'] },
  Belgium: { v: ['#111111', '#fdda24', '#ef3340'] },
  Germany: { h: ['#111111', '#dd0000', '#ffce00'] },
  Russia: { h: ['#ffffff', '#0039a6', '#d52b1e'] },
  Poland: { h: ['#ffffff', '#dc143c'] },
  Ukraine: { h: ['#0057b7', '#ffd700'] },
  Netherlands: { h: ['#ae1c28', '#ffffff', '#21468b'] },
  Austria: { h: ['#ed2939', '#ffffff', '#ed2939'] },
  Hungary: { h: ['#ce2939', '#ffffff', '#477050'] },
  Bulgaria: { h: ['#ffffff', '#00966e', '#d62612'] },
  Spain: { h: [['#aa151b', 1], ['#f1bf00', 2], ['#aa151b', 1]] },
  Portugal: { v: [['#006600', 2], ['#ff0000', 3]] },
  Romania: { v: ['#002b7f', '#fcd116', '#ce1126'] },
  Colombia: { h: [['#fcd116', 2], ['#003893', 1], ['#ce1126', 1]] },
  Venezuela: { h: ['#ffcc00', '#00247d', '#cf142b'] },
  Mexico: { v: ['#006847', '#ffffff', '#ce1126'] },
  Peru: { v: ['#d91023', '#ffffff', '#d91023'] },
  Argentina: { h: ['#74acdf', '#ffffff', '#74acdf'] },
  Brazil: 'br',
  'United States of America': 'us',
  'United Kingdom': 'uk',
  Greece: 'gr',
};

function stripes(ctx, list, vertical, b) {
  const total = list.reduce((a, s) => a + (Array.isArray(s) ? s[1] : 1), 0);
  let pos = vertical ? b.x0 : b.y0;
  const span = vertical ? b.x1 - b.x0 : b.y1 - b.y0;
  for (const st of list) {
    const [col, w] = Array.isArray(st) ? st : [st, 1];
    const len = (span * w) / total;
    ctx.fillStyle = col;
    if (vertical) ctx.fillRect(pos, b.y0, len + 1, b.y1 - b.y0);
    else ctx.fillRect(b.x0, pos, b.x1 - b.x0, len + 1);
    pos += len;
  }
}

function us(ctx, b) {
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  for (let i = 0; i < 13; i++) {
    ctx.fillStyle = i % 2 ? '#ffffff' : '#b22234';
    ctx.fillRect(b.x0, b.y0 + (h * i) / 13, w, h / 13 + 1);
  }
  ctx.fillStyle = '#3c3b6e';
  ctx.fillRect(b.x0, b.y0, w * 0.42, (h * 7) / 13);
  ctx.fillStyle = '#ffffff';
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 6; c++) {
      ctx.beginPath();
      ctx.arc(b.x0 + w * 0.42 * ((c + 0.5) / 6), b.y0 + ((h * 7) / 13) * ((r + 0.5) / 5), Math.max(h, w) * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function uk(ctx, b) {
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  ctx.fillStyle = '#012169';
  ctx.fillRect(b.x0, b.y0, w, h);
  const line = (color, width) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(b.x0, b.y0); ctx.lineTo(b.x1, b.y1);
    ctx.moveTo(b.x1, b.y0); ctx.lineTo(b.x0, b.y1);
    ctx.stroke();
  };
  const m = Math.min(w, h);
  line('#ffffff', m * 0.2);
  line('#c8102e', m * 0.08);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(b.x0 + w / 2 - m * 0.17, b.y0, m * 0.34, h);
  ctx.fillRect(b.x0, b.y0 + h / 2 - m * 0.17, w, m * 0.34);
  ctx.fillStyle = '#c8102e';
  ctx.fillRect(b.x0 + w / 2 - m * 0.1, b.y0, m * 0.2, h);
  ctx.fillRect(b.x0, b.y0 + h / 2 - m * 0.1, w, m * 0.2);
}

function br(ctx, b) {
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  ctx.fillStyle = '#009c3b';
  ctx.fillRect(b.x0, b.y0, w, h);
  ctx.fillStyle = '#ffdf00';
  ctx.beginPath();
  ctx.moveTo(b.x0 + w / 2, b.y0 + h * 0.12);
  ctx.lineTo(b.x0 + w * 0.88, b.y0 + h / 2);
  ctx.lineTo(b.x0 + w / 2, b.y0 + h * 0.88);
  ctx.lineTo(b.x0 + w * 0.12, b.y0 + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#002776';
  ctx.beginPath();
  ctx.arc(b.x0 + w / 2, b.y0 + h / 2, Math.min(w, h) * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function gr(ctx, b) {
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = i % 2 ? '#ffffff' : '#0d5eaf';
    ctx.fillRect(b.x0, b.y0 + (h * i) / 9, w, h / 9 + 1);
  }
  ctx.fillStyle = '#0d5eaf';
  ctx.fillRect(b.x0, b.y0, (h * 5) / 9, (h * 5) / 9);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(b.x0 + (h * 2) / 9 - h * 0.025, b.y0, h * 0.05, (h * 5) / 9);
  ctx.fillRect(b.x0, b.y0 + (h * 2.5) / 9 - h * 0.025, (h * 5) / 9, h * 0.05);
}

// Draws the flag of `name` over `b` ({ x0, y0, x1, y1 }). Returns false when
// there is no flag for that country, so the caller can use a flat colour.
export function drawFlag(ctx, name, b) {
  const f = FLAGS[name];
  if (!f) return false;
  if (f === 'us') us(ctx, b);
  else if (f === 'uk') uk(ctx, b);
  else if (f === 'br') br(ctx, b);
  else if (f === 'gr') gr(ctx, b);
  else if (f.h) stripes(ctx, f.h, false, b);
  else stripes(ctx, f.v, true, b);
  return true;
}
