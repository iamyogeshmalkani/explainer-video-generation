// History of India and Pakistan in Hindi, 9:16, chalkboard look. No maps on purpose:
// borders and Kashmir are disputed, so the story is told with a row of dots for
// the era, city plans and symbols. Captions run low on the frame, so everything
// stays inside s.safe.
const ERAS = 7;
const text = (s, str, x, y, size, o = {}) => s.text(str, { x, y, size, sfx: false, ...o });

// Era dots, title, year and a chalk rule.
function frame(s, era, title, year) {
  const t = s.safe.top;
  s.draw({ at: -1, sfx: false, enter: 'none' }, (ctx) => {
    for (let i = 0; i < ERAS; i++) {
      const x = s.cx + (i - (ERAS - 1) / 2) * 64;
      ctx.beginPath();
      ctx.arc(x, t + 20, i === era ? 13 : 8, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = s.color(i === era ? 'accent' : 'muted');
      if (i === era) { ctx.fillStyle = s.color('accent'); ctx.fill(); } else ctx.stroke();
    }
  });
  text(s, title, s.cx, t + 125, title.length > 14 ? 84 : 100, { font: 'display', at: 0.3 });
  if (year) text(s, year, s.cx, t + 225, 76, { font: 'display', color: 'accent', at: 0.5 });
  s.line([[s.safe.left + 100, t + 290], [s.safe.right - 100, t + 290]], { color: 'ink', width: 2, opacity: 0.5, at: -1, enter: 'none', sfx: false });
}

// A town plan: brick blocks, streets between them and a drain along one street.
function cityPlan(s, x, y, w, h, at) {
  s.draw({ at, sfx: false, enter: 'fade' }, (ctx, life) => {
    const a0 = ctx.globalAlpha;
    const cols = 6;
    const rows = 4;
    const gap = 12;
    const bw = (w - gap * (cols - 1)) / cols;
    const bh = (h - gap * (rows - 1)) / rows;
    ctx.lineWidth = 3;
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const p = s.clamp((life.local - (r * cols + k) * 0.03) / 0.25, 0, 1);
        const bx = x - w / 2 + k * (bw + gap);
        const by = y - h / 2 + r * (bh + gap);
        ctx.globalAlpha = a0 * p * 0.35;
        ctx.fillStyle = s.color('orange');
        ctx.fillRect(bx, by, bw, bh);
        ctx.globalAlpha = a0 * p;
        ctx.strokeStyle = s.color('ink');
        ctx.strokeRect(bx, by, bw, bh);
      }
    }
    const dy = y - h / 2 + 2 * bh + 1.5 * gap;
    const p = s.clamp((life.local - 0.5) / 0.8, 0, 1);
    ctx.globalAlpha = a0;
    ctx.strokeStyle = s.color('blue');
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, dy);
    ctx.lineTo(x - w / 2 + w * p, dy);
    ctx.stroke();
  });
}

// A line drawing of a domed tomb with four minarets.
function taj(s, x, y, w, at) {
  s.draw({ at, sfx: false, enter: 'fade' }, (ctx) => {
    const u = w / 100;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = s.color('ink');
    ctx.fillStyle = s.color('bg');
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
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const n = Math.round(80 * p);
    for (let i = 0; i <= n; i++) {
      const t = i / 80;
      const px = x - w / 2 + t * w;
      const py = y + Math.sin(t * Math.PI * 3) * 24;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  });
}

export default {
  intro(s) {
    const t = s.safe.top;
    text(s, 'इतिहास', s.cx, t + 70, 46, { color: 'muted', at: 0, enter: 'none' });
    text(s, 'भारत और\nपाकिस्तान', s.cx, t + 300, 170, { font: 'display', lineHeight: 1.0, at: 0, enter: 'none' });
    s.box('एक भूभाग', { id: 'one', x: s.cx, y: t + 640, size: 62, w: 580, color: 'accent', at: 0.8 });
    s.box('भारत', { id: 'india', x: s.cx - 250, y: t + 960, size: 62, w: 400, at: '#split' });
    s.box('पाकिस्तान', { id: 'pakistan', x: s.cx + 250, y: t + 960, size: 62, w: 400, at: '#split' });
    s.arrow('one', 'india', { label: '1947', labelSize: 48, labelFont: 'body', at: '#split' });
    s.arrow('one', 'pakistan', { label: '1947', labelSize: 48, labelFont: 'body', at: '#split' });
  },

  indus(s) {
    const t = s.safe.top;
    frame(s, 0, 'सिंधु घाटी', '2600 ई.पू.');
    const xs = [s.cx - 240, s.cx + 240];
    cityPlan(s, xs[0], t + 560, 430, 300, '#cities');
    cityPlan(s, xs[1], t + 560, 430, 300, '#cities');
    text(s, 'हड़प्पा', xs[0], t + 770, 56, { at: '#cities' });
    text(s, 'मोहनजोदड़ो', xs[1], t + 770, 56, { at: '#cities' });
    s.icon('map-pin', { x: s.cx - 300, y: t + 910, size: 76, color: 'accent', at: '#modern' });
    text(s, 'आज के पाकिस्तान में', s.cx - 240, t + 910, 54, { align: 'left', at: '#modern' });
  },

  mughal(s) {
    const t = s.safe.top;
    frame(s, 1, 'मुग़ल साम्राज्य', '1526');
    taj(s, s.cx, t + 740, 500, '#taj');
    const rows = [
      { head: '1526', note: 'बाबर ने नींव रखी', at: 0.6 },
      { head: 'चरम', note: 'लगभग पूरा उपमहाद्वीप', at: '#taj' },
      { head: '1857', note: 'साम्राज्य का औपचारिक अंत', at: '#end' },
    ];
    rows.forEach((r, i) => {
      const y = t + 850 + i * 105;
      text(s, r.head, s.safe.left + 20, y, 70, { align: 'left', font: 'display', color: i === 1 ? 'ink' : 'accent', at: r.at });
      text(s, r.note, s.safe.left + 290, y, 44, { align: 'left', color: 'muted', maxWidth: s.safe.w - 300, at: r.at });
    });
  },

  british(s) {
    const t = s.safe.top;
    frame(s, 2, 'ब्रिटिश शासन', '1757');
    s.icon('ship', { x: s.safe.left + 70, y: t + 520, size: 110, at: 0.6 });
    s.box('ईस्ट इंडिया कंपनी\n1757 से', { id: 'eic', x: s.cx + 60, y: t + 520, size: 54, w: 640, at: 0.6 });
    s.icon('crown', { x: s.safe.left + 70, y: t + 840, size: 110, color: 'accent', at: '#crown' });
    s.box('ब्रिटिश ताज\nसीधा शासन, 1858', { id: 'crown', x: s.cx + 60, y: t + 840, size: 54, w: 640, color: 'accent', at: '#crown' });
    s.arrow('eic', 'crown', { at: '#crown' });
    text(s, 'ब्रिटिश राज', s.cx, t + 1060, 104, { id: 'raj', font: 'display', color: 'accent', at: '#raj' });
    s.annotate('raj', { type: 'underline', color: 'accent', at: s.time('#raj') + 2.2 });
  },

  movements(s) {
    const t = s.safe.top;
    frame(s, 3, 'आज़ादी का आंदोलन', null);
    text(s, '1885', s.cx, t + 410, 88, { font: 'display', at: '#congress' });
    s.box('भारतीय राष्ट्रीय कांग्रेस', { id: 'inc', x: s.cx, y: t + 530, size: 50, w: 840, at: '#congress' });
    text(s, '1906', s.cx, t + 690, 88, { font: 'display', at: '#league' });
    s.box('अखिल भारतीय मुस्लिम लीग', { id: 'aiml', x: s.cx, y: t + 810, size: 50, w: 840, at: '#league' });
    s.box('मुसलमानों के लिए\nअलग देश', { id: 'demand', x: s.cx, y: t + 1050, size: 54, w: 760, color: 'accent', at: '#demand' });
    s.arrow('aiml', 'demand', { at: '#demand' });
  },

  partition(s) {
    const t = s.safe.top;
    frame(s, 4, 'विभाजन', '1947');
    s.box('पाकिस्तान', { id: 'pk', x: s.safe.left + 230, y: t + 410, size: 54, w: 400, at: '#pk' });
    text(s, '14 अगस्त', s.safe.left + 490, t + 410, 96, { align: 'left', font: 'display', at: '#pk' });
    s.box('भारत', { id: 'in', x: s.safe.left + 230, y: t + 550, size: 54, w: 400, at: '#in' });
    text(s, '15 अगस्त', s.safe.left + 490, t + 550, 96, { align: 'left', font: 'display', at: '#in' });
    text(s, 'नई सरहद ने पंजाब और बंगाल को बाँटा', s.cx, t + 670, 44, { color: 'muted', maxWidth: s.safe.w, at: '#line' });
    text(s, '1.2 से 2 करोड़', s.cx, t + 800, 100, { font: 'display', color: 'accent', at: '#people' });
    text(s, 'लोग बेघर (अनुमान)', s.cx, t + 880, 44, { color: 'muted', at: '#people' });
    text(s, '2 से 20 लाख', s.cx, t + 1000, 88, { font: 'display', color: 'accent', at: '#dead' });
    text(s, 'मौतें (अनुमान अलग-अलग)', s.cx, t + 1080, 44, { color: 'muted', at: '#dead' });
  },

  conflicts(s) {
    const t = s.safe.top;
    frame(s, 5, 'विवाद', '1947 से 1999');
    s.box('कश्मीर', { id: 'kashmir', x: s.cx, y: t + 430, size: 76, w: 540, color: 'accent', at: 0.6 });
    text(s, '1947 से विवाद', s.cx, t + 545, 48, { color: 'muted', at: 0.6 });
    const xs = s.row(4, { width: 700 });
    const y = t + 780;
    s.line([[xs[0] - 70, y], [xs[3] + 70, y]], { color: 'ink', width: 3, at: '#wars' });
    ['1947', '1965', '1971', '1999'].forEach((yr, i) => {
      const at = s.time('#wars') + 0.3 + i * 0.85;
      s.circle({ x: xs[i], y, r: 20, color: 'accent', fill: 'accent', at });
      text(s, yr, xs[i], y + 85, 60, { font: 'display', at });
    });
    text(s, 'बांग्लादेश का जन्म', xs[2], y + 190, 48, { color: 'accent', at: '#bangladesh' });
    s.annotate({ x: xs[2], y: y + 85, w: 200, h: 90 }, { type: 'circle', color: 'accent', at: '#becoming' });
  },

  nuclear(s) {
    const t = s.safe.top;
    frame(s, 6, 'आज', '1998 से 2025');
    s.icon('atom', { x: s.cx, y: t + 440, size: 170, color: 'accent', at: 0.6 });
    text(s, '1998', s.cx, t + 590, 100, { font: 'display', at: 0.6 });
    text(s, 'दोनों के परमाणु परीक्षण', s.cx, t + 670, 46, { color: 'muted', at: 0.6 });
    s.line([[s.safe.left + 100, t + 730], [s.safe.right - 100, t + 730]], { color: 'ink', width: 2, opacity: 0.4, at: '#treaty', sfx: false });
    river(s, s.cx, t + 785, 760, '#treaty');
    text(s, 'सिंधु जल संधि', s.cx, t + 885, 76, { id: 'treaty', font: 'display', at: '#treaty' });
    s.annotate('treaty', { type: 'underline', color: 'accent', at: '#rivers' });
    text(s, '1960', s.cx, t + 975, 44, { color: 'muted', at: '#treaty' });
    s.box('स्थगित, अप्रैल 2025', { id: 'susp', x: s.cx, y: t + 1135, size: 50, icon: 'ban', color: 'red', w: 760, at: '#suspended' });
  },

  outro(s) {
    const t = s.safe.top;
    frame(s, -1, 'आज की स्थिति', null);
    s.box('साझा जड़ें\nहज़ारों साल', { id: 'roots', x: s.cx, y: t + 470, size: 56, icon: 'landmark', w: 720, at: 0.6 });
    s.box('खुले विवाद\nकश्मीर और पानी', { id: 'open', x: s.cx, y: t + 900, size: 56, icon: 'scale', color: 'accent', w: 720, at: '#open' });
    s.arrow('roots', 'open', { at: '#disputes' });
    s.annotate('open', { type: 'box', color: 'accent', at: '#today' });
    text(s, '1947', s.cx + 140, t + 686, 76, { font: 'display', color: 'accent', at: '#began' });
  },
};
