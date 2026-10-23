// History of India and Pakistan, 16:9, in the custom "atlas" look (look.json).
// No maps on purpose: borders and Kashmir are disputed, so the story is told with
// a timeline strip, city plans and symbols. The captions run along the bottom.
const ERAS = ['Indus', 'Mughals', 'Raj', 'Freedom', '1947', 'Wars', 'Today'];
const text = (s, str, x, y, size, o = {}) => s.text(str, { x, y, size, sfx: false, ...o });

// Title row, the year on the right, and the strip of eras along the bottom.
function frame(s, era, title, year) {
  const c = s.safe;
  text(s, title, c.left, c.top + 70, 96, { align: 'left', font: 'display', at: 0.3, enter: 'rise' });
  if (year) text(s, year, c.right, c.top + 70, 96, { align: 'right', font: 'display', color: 'accent', at: 0.5, enter: 'rise' });
  s.line([[c.left, c.top + 150], [c.right, c.top + 150]], { color: 'ink', width: 1, opacity: 0.3, at: -1, enter: 'none', sfx: false });
  const xs = s.row(ERAS.length, { width: c.w * 0.9 });
  const y = c.bottom - 22;
  s.line([[c.left, y - 38], [c.right, y - 38]], { color: 'ink', width: 1, opacity: 0.2, at: -1, enter: 'none', sfx: false });
  ERAS.forEach((e, i) => text(s, e, xs[i], y, 32, { color: i === era ? 'ink' : 'muted', bold: i === era, at: -1, enter: 'none' }));
  if (era >= 0) s.line([[xs[era] - 62, y - 38], [xs[era] + 62, y - 38]], { color: 'accent', width: 5, at: -1, enter: 'none', sfx: false });
}

// A town plan: brick blocks, streets between them and a drain along one street.
function cityPlan(s, x, y, w, h, at) {
  s.draw({ at, sfx: false, enter: 'fade' }, (ctx, life) => {
    const a0 = ctx.globalAlpha;
    const cols = 6;
    const rows = 4;
    const gap = 14;
    const bw = (w - gap * (cols - 1)) / cols;
    const bh = (h - gap * (rows - 1)) / rows;
    ctx.lineWidth = 2;
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const p = s.clamp((life.local - (r * cols + k) * 0.03) / 0.25, 0, 1);
        ctx.globalAlpha = a0 * p;
        ctx.fillStyle = s.color('orange');
        ctx.strokeStyle = s.color('ink');
        const bx = x - w / 2 + k * (bw + gap);
        const by = y - h / 2 + r * (bh + gap);
        ctx.globalAlpha = a0 * p * 0.35;
        ctx.fillRect(bx, by, bw, bh);
        ctx.globalAlpha = a0 * p;
        ctx.strokeRect(bx, by, bw, bh);
      }
    }
    const dy = y - h / 2 + 2 * bh + 1.5 * gap;
    const p = s.clamp((life.local - 0.5) / 0.8, 0, 1);
    ctx.globalAlpha = a0;
    ctx.strokeStyle = s.color('blue');
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, dy);
    ctx.lineTo(x - w / 2 + w * p, dy);
    ctx.stroke();
  });
}

// A simple line drawing of a domed tomb with four minarets.
function taj(s, x, y, w, at) {
  s.draw({ at, sfx: false, enter: 'fade' }, (ctx) => {
    const u = w / 100;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = s.color('ink');
    ctx.fillStyle = s.color('surface');
    const box = (bx, by, bw, bh) => { ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke(); };
    const cap = (cx, cy, r) => { ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.fill(); ctx.stroke(); };
    box(x - 50 * u, y - 8 * u, 100 * u, 8 * u);
    box(x - 25 * u, y - 48 * u, 50 * u, 40 * u);
    ctx.beginPath();
    ctx.moveTo(x - 8 * u, y - 8 * u);
    ctx.lineTo(x - 8 * u, y - 28 * u);
    ctx.quadraticCurveTo(x, y - 42 * u, x + 8 * u, y - 28 * u);
    ctx.lineTo(x + 8 * u, y - 8 * u);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 16 * u, y - 48 * u);
    ctx.bezierCurveTo(x - 26 * u, y - 80 * u, x + 26 * u, y - 80 * u, x + 16 * u, y - 48 * u);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - 70 * u);
    ctx.lineTo(x, y - 82 * u);
    ctx.stroke();
    for (const dx of [-42, 42]) { box(x + dx * u - 3 * u, y - 58 * u, 6 * u, 50 * u); cap(x + dx * u, y - 58 * u, 4 * u); }
    for (const dx of [-19, 19]) cap(x + dx * u, y - 48 * u, 6 * u);
  });
}

// A river drawn on as a wavy line.
function river(s, x, y, w, at) {
  s.draw({ at, sfx: false, enter: 'none' }, (ctx, life) => {
    const p = s.clamp(life.local / 1.2, 0, 1);
    ctx.strokeStyle = s.color('blue');
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const n = Math.round(80 * p);
    for (let i = 0; i <= n; i++) {
      const t = i / 80;
      const px = x - w / 2 + t * w;
      const py = y + Math.sin(t * Math.PI * 3) * 22;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  });
}

export default {
  intro(s) {
    const c = s.safe;
    text(s, 'HISTORY', s.cx, c.top + 60, 36, { color: 'muted', at: 0, enter: 'none' });
    text(s, 'India & Pakistan', s.cx, c.top + 200, 160, { font: 'display', at: 0, enter: 'none' });
    s.line([[s.cx - 380, c.top + 310], [s.cx + 380, c.top + 310]], { color: 'ink', width: 1, opacity: 0.3, at: 0, enter: 'none', sfx: false });
    s.box('One land', { id: 'one', x: s.cx, y: c.top + 430, size: 52, w: 520, color: 'accent', at: 0.8 });
    s.box('India', { id: 'india', x: s.cx - 420, y: c.top + 660, size: 52, w: 380, at: '#split' });
    s.box('Pakistan', { id: 'pakistan', x: s.cx + 420, y: c.top + 660, size: 52, w: 380, at: '#split' });
    s.arrow('one', 'india', { label: '1947', labelSize: 40, labelFont: 'body', at: '#split' });
    s.arrow('one', 'pakistan', { label: '1947', labelSize: 40, labelFont: 'body', at: '#split' });
  },

  indus(s) {
    frame(s, 0, 'The Indus Valley', '2600 BCE');
    const c = s.safe;
    const xs = [s.cx - 420, s.cx + 420];
    cityPlan(s, xs[0], c.top + 360, 560, 330, '#cities');
    cityPlan(s, xs[1], c.top + 360, 560, 330, '#cities');
    text(s, 'Harappa', xs[0], c.top + 570, 56, { font: 'display', at: '#cities' });
    text(s, 'Mohenjo-daro', xs[1], c.top + 570, 56, { font: 'display', at: '#cities' });
    s.icon('map-pin', { x: s.cx - 250, y: c.top + 650, size: 64, color: 'accent', at: '#modern' });
    text(s, 'Present-day Pakistan', s.cx - 190, c.top + 650, 46, { align: 'left', at: '#modern' });
  },

  mughal(s) {
    frame(s, 1, 'The Mughal Empire', '1526');
    const c = s.safe;
    taj(s, c.left + 330, c.bottom - 130, 560, '#taj');
    const rows = [
      { head: '1526', note: 'Babur founds the empire', at: 0.6 },
      { head: 'Its height', note: 'The Taj Mahal, most of the subcontinent', at: '#taj' },
      { head: '1857', note: 'The empire formally ends', at: '#end' },
    ];
    rows.forEach((r, i) => {
      const y = c.top + 255 + i * 165;
      text(s, r.head, 1010, y, 76, { align: 'left', font: 'display', color: i === 1 ? 'ink' : 'accent', at: r.at });
      text(s, r.note, 1010, y + 66, 38, { align: 'left', color: 'muted', maxWidth: 760, at: r.at });
    });
  },

  british(s) {
    frame(s, 2, 'British rule', '1757');
    const c = s.safe;
    const xs = s.row(2, { width: 900 });
    s.box('East India Company', { id: 'eic', x: xs[0], y: c.top + 360, size: 46, icon: 'ship', w: 520, at: 0.6 });
    text(s, 'from 1757', xs[0], c.top + 480, 40, { color: 'muted', at: 0.6 });
    s.box('British Crown', { id: 'crown', x: xs[1], y: c.top + 360, size: 46, icon: 'crown', color: 'accent', w: 520, at: '#crown' });
    text(s, 'direct rule, 1858', xs[1], c.top + 480, 40, { color: 'muted', at: '#crown' });
    s.arrow('eic', 'crown', { at: '#crown' });
    text(s, 'The British Raj', s.cx, c.top + 640, 96, { id: 'raj', font: 'display', color: 'accent', at: '#raj' });
    s.annotate('raj', { type: 'underline', color: 'accent', at: s.cueEnd('Raj') - 0.2 });
  },

  movements(s) {
    frame(s, 3, 'The freedom movement', '1885');
    const c = s.safe;
    const xs = s.row(2, { width: 980 });
    s.box('Indian National Congress', { id: 'inc', x: xs[0], y: c.top + 380, size: 42, w: 620, at: '#congress' });
    text(s, '1885', xs[0], c.top + 255, 84, { font: 'display', at: '#congress' });
    s.box('All-India Muslim League', { id: 'aiml', x: xs[1], y: c.top + 380, size: 42, w: 620, at: '#league' });
    text(s, '1906', xs[1], c.top + 255, 84, { font: 'display', at: '#league' });
    s.box('A separate country for Muslims', { id: 'demand', x: xs[1], y: c.top + 600, size: 40, w: 700, color: 'accent', at: '#demand' });
    s.arrow('aiml', 'demand', { at: '#demand' });
  },

  partition(s) {
    frame(s, 4, 'Partition', '1947');
    const c = s.safe;
    const lx = c.left + 40;
    s.box('Pakistan', { id: 'pk', x: lx + 190, y: c.top + 290, size: 44, w: 340, at: '#pk' });
    text(s, '14 Aug', lx + 440, c.top + 290, 72, { align: 'left', font: 'display', at: '#pk' });
    s.box('India', { id: 'in', x: lx + 190, y: c.top + 450, size: 44, w: 340, at: '#in' });
    text(s, '15 Aug', lx + 440, c.top + 450, 72, { align: 'left', font: 'display', at: '#in' });
    text(s, 'The border splits Punjab and Bengal', lx, c.top + 600, 40, { align: 'left', color: 'muted', at: '#line' });
    s.line([[1020, c.top + 220], [1020, c.top + 660]], { color: 'ink', width: 1, opacity: 0.3, at: '#people', sfx: false });
    text(s, '12 to 20 million', 1410, c.top + 300, 76, { font: 'display', color: 'accent', at: '#people' });
    text(s, 'people displaced (estimate)', 1410, c.top + 375, 38, { color: 'muted', at: '#people' });
    text(s, '200,000 to 2 million', 1410, c.top + 500, 70, { font: 'display', color: 'accent', at: '#dead' });
    text(s, 'deaths (estimates vary widely)', 1410, c.top + 575, 38, { color: 'muted', at: '#dead' });
  },

  conflicts(s) {
    frame(s, 5, 'The disputes', '1947 to 1999');
    const c = s.safe;
    s.box('Kashmir', { id: 'kashmir', x: s.cx, y: c.top + 260, size: 56, w: 420, color: 'accent', at: 0.6 });
    text(s, 'disputed since 1947', s.cx, c.top + 365, 40, { color: 'muted', at: 0.6 });
    const xs = s.row(4, { width: 1100 });
    const y = c.top + 490;
    s.line([[xs[0] - 90, y], [xs[3] + 90, y]], { color: 'ink', width: 2, at: '#wars' });
    ['1947', '1965', '1971', '1999'].forEach((yr, i) => {
      const at = s.time('#wars') + 0.3 + i * 0.85;
      s.circle({ x: xs[i], y, r: 16, color: 'accent', fill: 'accent', at });
      text(s, yr, xs[i], y + 75, 60, { font: 'display', at });
    });
    text(s, 'Bangladesh is born', xs[2], y + 140, 40, { id: 'bd', color: 'accent', at: '#bangladesh' });
  },

  nuclear(s) {
    frame(s, 6, 'Today', '1998 to 2025');
    const c = s.safe;
    const lx = c.left + 330;
    const rx = c.right - 470;
    s.icon('atom', { x: lx, y: c.top + 300, size: 190, color: 'accent', at: 0.6 });
    text(s, '1998', lx, c.top + 450, 90, { font: 'display', at: 0.6 });
    text(s, 'Both test nuclear weapons', lx, c.top + 525, 38, { color: 'muted', at: 0.6 });
    s.line([[s.cx + 20, c.top + 230], [s.cx + 20, c.top + 700]], { color: 'ink', width: 1, opacity: 0.3, at: '#treaty', sfx: false });
    river(s, rx, c.top + 290, 640, '#treaty');
    text(s, 'Indus Waters Treaty', rx, c.top + 410, 64, { font: 'display', at: '#treaty' });
    text(s, '1960', rx, c.top + 475, 40, { color: 'muted', at: '#treaty' });
    s.box('Suspended, April 2025', { id: 'susp', x: rx, y: c.top + 590, size: 40, icon: 'ban', color: 'red', w: 560, at: '#suspended' });
  },

  outro(s) {
    frame(s, -1, 'Where it stands', null);
    const c = s.safe;
    const xs = s.row(2, { width: 900 });
    s.box('Shared roots', { id: 'roots', x: xs[0], y: c.top + 400, size: 52, icon: 'landmark', w: 500, at: 0.6 });
    text(s, 'thousands of years', xs[0], c.top + 545, 40, { color: 'muted', at: 0.6 });
    s.box('Open disputes', { id: 'open', x: xs[1], y: c.top + 400, size: 52, icon: 'scale', color: 'accent', w: 500, at: '#open' });
    text(s, 'Kashmir and water', xs[1], c.top + 545, 40, { color: 'muted', at: '#open' });
    s.line([[c.left + 300, c.top + 600], [c.right - 300, c.top + 600]], { color: 'accent', width: 3, at: 'disputes' });
    text(s, '1947', s.cx, c.top + 665, 64, { font: 'display', color: 'accent', at: 'began' });
  },
};
