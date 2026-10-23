// Hinduism in one minute, 9:16, in the custom "diwali" look (look.json): night
// indigo, marigold glow, a rotating mandala, a glowing Brahman orb and a diya.
// Text stays inside s.safe; the captions run below it, so the narration is
// never repeated as on-screen text.
const TAU = Math.PI * 2;
const text = (s, str, x, y, size, o = {}) => s.text(str, { x, y, size, sfx: false, ...o });

// Faint twinkling stars behind everything.
function sky(s) {
  s.draw({ at: -1, sfx: false, enter: 'none' }, (c) => {
    const a0 = c.globalAlpha;
    for (let i = 0; i < 40; i++) {
      const tw = 0.5 + 0.5 * Math.sin(s.t * 1.6 + i * 3.1);
      c.globalAlpha = a0 * (0.12 + 0.4 * tw);
      c.fillStyle = i % 5 === 0 ? s.color('yellow') : s.color('ink');
      c.beginPath();
      c.arc(s.rand(i * 2) * s.W, s.rand(i * 2 + 1) * s.H, 1.5 + (i % 3), 0, TAU);
      c.fill();
    }
  });
}

function petals(c, n, r0, r1, w, rot) {
  const mid = (r0 + r1) / 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rot;
    c.beginPath();
    c.ellipse(Math.cos(a) * mid, Math.sin(a) * mid, (r1 - r0) / 2, w, a, 0, TAU);
    c.stroke();
  }
}

// Three turning rings of petals, like a rangoli.
function mandala(s, x, y, R, at, o = {}) {
  s.draw({ at, sfx: false, enter: 'fade', ...o }, (c, life) => {
    const a0 = c.globalAlpha;
    const grow = 0.85 + 0.15 * (life.p ?? 1);
    const rot = life.local * 0.1;
    c.save();
    c.translate(x, y);
    c.scale(grow, grow);
    c.lineWidth = 2;
    c.strokeStyle = s.color('orange');
    c.globalAlpha = a0 * 0.55;
    for (const k of [1, 0.72, 0.46, 0.22]) { c.beginPath(); c.arc(0, 0, R * k, 0, TAU); c.stroke(); }
    c.globalAlpha = a0 * 0.45;
    petals(c, 24, R * 0.72, R, R * 0.06, rot);
    c.strokeStyle = s.color('yellow');
    petals(c, 12, R * 0.46, R * 0.72, R * 0.1, -rot * 1.3);
    c.strokeStyle = s.color('pink');
    petals(c, 8, R * 0.22, R * 0.46, R * 0.08, rot * 1.6);
    c.restore();
  });
}

// A glowing sun with slowly turning rays.
function orb(s, x, y, r, at) {
  s.draw({ at, sfx: false, enter: 'fade' }, (c, life) => {
    const a0 = c.globalAlpha;
    const pulse = 1 + Math.sin(life.local * 2.2) * 0.04;
    c.save();
    c.translate(x, y);
    c.strokeStyle = s.color('yellow');
    c.lineWidth = 3;
    c.lineCap = 'round';
    c.globalAlpha = a0 * 0.7;
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * TAU + life.local * 0.15;
      const r1 = r * (i % 2 ? 1.7 : 2.1);
      c.beginPath();
      c.moveTo(Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35);
      c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      c.stroke();
    }
    c.globalAlpha = a0;
    const g = c.createRadialGradient(0, 0, 0, 0, 0, r * 1.3 * pulse);
    g.addColorStop(0, '#fff6d8');
    g.addColorStop(0.45, s.color('yellow'));
    g.addColorStop(0.8, s.color('orange'));
    g.addColorStop(1, 'rgba(255,166,43,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, r * 1.3 * pulse, 0, TAU);
    c.fill();
    c.restore();
  });
}

// An oil lamp with a flickering flame.
function diya(s, x, y, at) {
  s.draw({ at, sfx: false, enter: 'fade' }, (c, life) => {
    const t = life.local;
    const flick = Math.sin(t * 9) * 0.05 + Math.sin(t * 5.3 + 1) * 0.05;
    const glow = c.createRadialGradient(x, y - 60, 0, x, y - 60, 170);
    glow.addColorStop(0, 'rgba(255,200,90,0.42)');
    glow.addColorStop(1, 'rgba(255,166,43,0)');
    c.fillStyle = glow;
    c.beginPath();
    c.arc(x, y - 60, 170, 0, TAU);
    c.fill();
    const h = 120 * (1 + flick);
    const fg = c.createLinearGradient(x, y - h, x, y);
    fg.addColorStop(0, '#fff3b0');
    fg.addColorStop(0.55, s.color('yellow'));
    fg.addColorStop(1, s.color('orange'));
    c.fillStyle = fg;
    c.beginPath();
    c.moveTo(x, y - 6);
    c.bezierCurveTo(x - 40, y - 40, x - 18, y - h * 0.65, x + flick * 60, y - h);
    c.bezierCurveTo(x + 18, y - h * 0.65, x + 40, y - 40, x, y - 6);
    c.fill();
    c.fillStyle = s.color('orange');
    c.beginPath();
    c.moveTo(x - 100, y);
    c.quadraticCurveTo(x - 90, y + 70, x, y + 72);
    c.quadraticCurveTo(x + 90, y + 70, x + 100, y);
    c.quadraticCurveTo(x, y + 14, x - 100, y);
    c.fill();
  });
}

// Twenty dots, filled one after another. 19 of 20 is 95 percent.
function dots(s, x, y, at, filled = 19, total = 20, gap = 34) {
  s.draw({ at, sfx: false, enter: 'fade' }, (c, life) => {
    const a0 = c.globalAlpha;
    c.lineWidth = 2;
    for (let i = 0; i < total; i++) {
      const p = s.clamp((life.local - 0.2 - i * 0.04) / 0.2, 0, 1);
      c.globalAlpha = a0 * p;
      c.beginPath();
      c.arc(x + (i - (total - 1) / 2) * gap, y, 11, 0, TAU);
      if (i < filled) { c.fillStyle = s.color('orange'); c.fill(); }
      else { c.strokeStyle = s.color('muted'); c.stroke(); }
    }
  });
}

// Rings that spread outward, like time passing.
function ripples(s, x, y, at) {
  s.draw({ at, sfx: false, enter: 'none' }, (c, life) => {
    const a0 = c.globalAlpha;
    c.strokeStyle = s.color('orange');
    c.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const p = (life.local * 0.3 + i / 4) % 1;
      c.globalAlpha = a0 * (1 - p) * 0.35;
      c.beginPath();
      c.arc(x, y, 40 + p * 300, 0, TAU);
      c.stroke();
    }
  });
}

export default {
  intro(s) {
    const t = s.safe.y;
    sky(s);
    text(s, 'Hinduism', s.cx, t + 75, 120, { font: 'display', at: 0, enter: 'none' });
    mandala(s, s.cx, t + 300, 140, 0, { enter: 'none' });
    text(s, 'ॐ', s.cx, t + 300, 110, { font: 'display', color: 'accent', at: 0, enter: 'none' });
    s.number(1.2, { x: s.cx, y: t + 505, size: 86, decimals: 1, suffix: ' billion', font: 'display', at: '#people' });
    text(s, 'followers', s.cx, t + 565, 34, { color: 'muted', at: '#people' });
    s.number(95, { x: s.cx, y: t + 622, size: 56, suffix: '% live in India', font: 'display', color: 'accent', at: '#india' });
    dots(s, s.cx, t + 668, '#india');
  },

  roots(s) {
    const t = s.safe.y;
    sky(s);
    ripples(s, s.cx, t + 75, 0.3);
    s.icon('hourglass', { x: s.cx, y: t + 75, size: 100, color: 'accent', at: 0.3 });
    text(s, 'Thousands\nof years', s.cx, t + 235, 108, { font: 'display', lineHeight: 1.02, at: 0.3, enter: 'rise' });
    s.box('No single founder', { id: 'founder', x: s.cx, y: t + 440, size: 46, color: 'orange', at: '#founder' });
    s.box('No single holy book', { id: 'book', x: s.cx, y: t + 590, size: 46, color: 'pink', at: '#book' });
  },

  brahman(s) {
    const t = s.safe.y;
    sky(s);
    orb(s, s.cx, t + 120, 60, 0.4);
    text(s, 'Brahman', s.cx, t + 290, 86, { font: 'display', at: 0.4 });
    text(s, 'one ultimate reality', s.cx, t + 358, 40, { color: 'muted', at: 0.9 });
    const xs = s.row(2, { width: s.safe.w * 0.6 });
    s.box('Vishnu', { id: 'vishnu', x: xs[0], y: t + 560, size: 50, color: 'blue', at: '#vishnu' });
    s.box('Shiva', { id: 'shiva', x: xs[1], y: t + 560, size: 50, color: 'purple', at: '#shiva' });
    s.arrow([s.cx, t + 405], 'vishnu', { color: 'yellow', at: '#vishnu' });
    s.arrow([s.cx, t + 405], 'shiva', { color: 'yellow', at: '#shiva' });
    text(s, 'many forms', s.cx, t + 662, 40, { color: 'muted', at: '#forms' });
  },

  ideas(s) {
    sky(s);
    const rows = [
      { term: 'Dharma', note: 'duty', icon: 'scale', color: 'yellow', at: '#dharma' },
      { term: 'Karma', note: 'actions have consequences', icon: 'sprout', color: 'teal', at: '#karma' },
      { term: 'Samsara', note: 'the cycle of rebirth', icon: 'refresh-cw', color: 'purple', at: '#samsara' },
      { term: 'Moksha', note: 'freedom from the cycle', icon: 'bird', color: 'accent', at: '#moksha' },
    ];
    const ys = s.col(4, { height: s.safe.h * 0.76 });
    rows.forEach((r, i) => {
      const y = ys[i];
      s.icon(r.icon, { x: s.safe.x + 62, y, size: 64, color: r.color, bg: 'circle', at: r.at });
      text(s, r.term, s.safe.x + 150, y - 24, 70, { align: 'left', font: 'display', color: r.color, at: r.at });
      text(s, r.note, s.safe.x + 150, y + 38, 36, { align: 'left', color: 'muted', maxWidth: s.safe.w - 160, at: r.at });
    });
    s.burst({ x: s.safe.x + 62, y: ys[3], at: '#moksha', count: 26, colors: [s.color('orange'), s.color('yellow'), s.color('pink')] });
  },

  practice(s) {
    const t = s.safe.y;
    sky(s);
    diya(s, s.cx, t + 150, '#puja');
    text(s, 'Puja', s.cx, t + 295, 80, { font: 'display', at: '#puja' });
    text(s, 'at home and in temples', s.cx, t + 362, 40, { color: 'muted', at: '#puja' });
    s.icon('sparkles', { x: s.cx, y: t + 475, size: 110, color: 'yellow', at: '#festivals' });
    s.burst({ x: s.cx, y: t + 475, at: '#festivals', count: 36, colors: [s.color('orange'), s.color('yellow'), s.color('pink'), s.color('teal')] });
    text(s, 'Diwali  ·  Holi', s.cx, t + 592, 70, { font: 'display', at: '#festivals' });
    text(s, 'of light and color', s.cx, t + 655, 40, { color: 'muted', at: '#festivals' });
  },

  outro(s) {
    const t = s.safe.y;
    sky(s);
    text(s, 'Hinduism', s.cx, t + 75, 120, { font: 'display', at: -1, enter: 'none' });
    mandala(s, s.cx, t + 320, 150, 0.2);
    text(s, 'ॐ', s.cx, t + 320, 120, { font: 'display', color: 'accent', at: 0.2 });
    text(s, 'A diverse tradition', s.cx, t + 565, 70, { font: 'display', color: 'accent', at: 0.4 });
    text(s, 'thousands of years', s.cx, t + 635, 40, { color: 'muted', at: '#end' });
  },
};
