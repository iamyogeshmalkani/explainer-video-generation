// एकादशी कथा, 9:16, "pauranik" look (look.json): deep maroon night, gold and
// saffron. The deities are shown only through symbols: a lotus, Vishnu's chakra,
// a glowing cave. Captions run low on the frame, so the narration is never
// repeated as on-screen text.
const TAU = Math.PI * 2;
const SCENES = 6;
const text = (s, str, x, y, size, o = {}) => s.text(str, { x, y, size, sfx: false, ...o });

// Faint twinkling stars, and a row of dots for the six parts of the story.
function frame(s, n) {
  const t = s.safe.top;
  s.draw({ at: -1, sfx: false, enter: 'none' }, (c) => {
    const a0 = c.globalAlpha;
    for (let i = 0; i < 40; i++) {
      const tw = 0.5 + 0.5 * Math.sin(s.t * 1.5 + i * 3.1);
      c.globalAlpha = a0 * (0.1 + 0.35 * tw);
      c.fillStyle = i % 5 === 0 ? s.color('yellow') : s.color('ink');
      c.beginPath();
      c.arc(s.rand(i * 2) * s.W, s.rand(i * 2 + 1) * s.H, 1.5 + (i % 3), 0, TAU);
      c.fill();
    }
    c.globalAlpha = a0;
    for (let i = 0; i < SCENES; i++) {
      const x = s.cx + (i - (SCENES - 1) / 2) * 60;
      c.beginPath();
      c.arc(x, t + 20, i === n ? 13 : 8, 0, TAU);
      c.lineWidth = 3;
      c.strokeStyle = s.color(i === n ? 'orange' : 'muted');
      if (i === n) { c.fillStyle = s.color('orange'); c.fill(); } else c.stroke();
    }
  });
}

// A side-view lotus: three fans of pointed petals around a glowing centre.
function lotus(s, x, y, R, at, o = {}) {
  s.draw({ at, sfx: false, enter: 'fade', ...o }, (c, life) => {
    const a0 = c.globalAlpha;
    const breathe = 1 + Math.sin(life.local * 1.6) * 0.015;
    c.save();
    c.translate(x, y);
    c.scale(breathe, breathe);
    const layers = [
      { n: 7, spread: 1.55, len: 1.0, w: 0.2, col: s.color('pink'), a: 0.35 },
      { n: 5, spread: 1.15, len: 0.88, w: 0.22, col: s.color('yellow'), a: 0.5 },
      { n: 3, spread: 0.6, len: 0.7, w: 0.24, col: s.color('orange'), a: 0.75 },
    ];
    for (const L of layers) {
      for (let i = 0; i < L.n; i++) {
        const k = L.n === 1 ? 0 : i / (L.n - 1) - 0.5;
        const ang = -Math.PI / 2 + k * L.spread * 1.6;
        c.save();
        c.rotate(ang + Math.PI / 2);
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(R * L.w * 2.1, -R * L.len * 0.3, R * L.w * 1.2, -R * L.len * 0.85, 0, -R * L.len);
        c.bezierCurveTo(-R * L.w * 1.2, -R * L.len * 0.85, -R * L.w * 2.1, -R * L.len * 0.3, 0, 0);
        c.globalAlpha = a0 * L.a;
        c.fillStyle = L.col;
        c.fill();
        c.globalAlpha = a0;
        c.lineWidth = 2.5;
        c.strokeStyle = s.color('yellow');
        c.stroke();
        c.restore();
      }
    }
    const g = c.createRadialGradient(0, -R * 0.1, 0, 0, -R * 0.1, R * 0.35);
    g.addColorStop(0, 'rgba(255,240,190,0.9)');
    g.addColorStop(1, 'rgba(255,166,43,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, -R * 0.1, R * 0.35, 0, TAU);
    c.fill();
    c.restore();
  });
}

// Vishnu's discus: a turning ring with spokes and teeth.
function chakra(s, x, y, r, at) {
  s.draw({ at, sfx: false, enter: 'fade' }, (c, life) => {
    const a0 = c.globalAlpha;
    const rot = life.local * 0.9;
    const glow = c.createRadialGradient(x, y, r * 0.2, x, y, r * 1.7);
    glow.addColorStop(0, 'rgba(111,155,255,0.35)');
    glow.addColorStop(1, 'rgba(111,155,255,0)');
    c.fillStyle = glow;
    c.beginPath();
    c.arc(x, y, r * 1.7, 0, TAU);
    c.fill();
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.strokeStyle = s.color('yellow');
    c.lineWidth = 5;
    c.beginPath();
    c.arc(0, 0, r, 0, TAU);
    c.stroke();
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 0, r * 0.72, 0, TAU);
    c.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      c.beginPath();
      c.moveTo(Math.cos(a) * r * 0.18, Math.sin(a) * r * 0.18);
      c.lineTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72);
      c.stroke();
    }
    c.fillStyle = s.color('yellow');
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      c.beginPath();
      c.moveTo(Math.cos(a - 0.08) * r, Math.sin(a - 0.08) * r);
      c.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2);
      c.lineTo(Math.cos(a + 0.08) * r, Math.sin(a + 0.08) * r);
      c.closePath();
      c.fill();
    }
    c.beginPath();
    c.arc(0, 0, r * 0.14, 0, TAU);
    c.fillStyle = s.color('blue');
    c.fill();
    c.restore();
    c.globalAlpha = a0;
  });
}

// The demon Mura: a dark, spiked orb with two burning eyes.
function mura(c, s, x, y, r, a0, wobble) {
  c.save();
  c.translate(x, y);
  c.beginPath();
  const n = 18;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * TAU + wobble * 0.05;
    const rr = i % 2 ? r * 1.0 : r * 1.38;
    if (i === 0) c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath();
  c.globalAlpha = a0;
  c.fillStyle = '#12040a';
  c.fill();
  c.lineWidth = 4;
  c.strokeStyle = s.color('red');
  c.stroke();
  c.fillStyle = s.color('red');
  for (const dx of [-0.34, 0.34]) {
    c.beginPath();
    c.ellipse(dx * r, -r * 0.1, r * 0.17, r * 0.1, dx > 0 ? -0.35 : 0.35, 0, TAU);
    c.fill();
  }
  c.restore();
}

function murAt(s, x, y, r, at, out) {
  s.draw({ at, out, sfx: false, enter: 'fade' }, (c, life) => {
    mura(c, s, x, y, r, c.globalAlpha, life.local);
  });
}

// A cave mouth. `glow` is how brightly the light inside burns, 0 to 1.
function cave(s, x, y, w, h, at, glowAt) {
  s.draw({ at, sfx: false, enter: 'fade' }, (c, life) => {
    const a0 = c.globalAlpha;
    const g = s.clamp((s.t - s.time(glowAt)) / 0.8, 0, 1);
    c.beginPath();
    c.moveTo(x - w / 2, y + h / 2);
    c.lineTo(x - w / 2, y);
    c.bezierCurveTo(x - w / 2, y - h * 0.62, x + w / 2, y - h * 0.62, x + w / 2, y);
    c.lineTo(x + w / 2, y + h / 2);
    c.closePath();
    c.fillStyle = '#0d0307';
    c.fill();
    const inner = c.createRadialGradient(x, y + h * 0.15, 0, x, y + h * 0.15, w * 0.5);
    inner.addColorStop(0, `rgba(111,155,255,${0.55 + 0.25 * Math.sin(life.local * 2)})`);
    inner.addColorStop(1, 'rgba(111,155,255,0)');
    c.fillStyle = inner;
    c.fill();
    if (g > 0) {
      const warm = c.createRadialGradient(x, y, 0, x, y, w * 0.75);
      warm.addColorStop(0, `rgba(255,214,120,${0.7 * g})`);
      warm.addColorStop(1, 'rgba(255,166,43,0)');
      c.fillStyle = warm;
      c.fillRect(x - w, y - h, w * 2, h * 2);
    }
    c.globalAlpha = a0;
    c.lineWidth = 6;
    c.strokeStyle = s.color('muted');
    c.stroke();
  });
}

// Rays of light spreading from a point.
function rays(s, x, y, len, at) {
  s.draw({ at, sfx: false, enter: 'fade' }, (c, life) => {
    const a0 = c.globalAlpha;
    const p = s.clamp(life.local / 0.9, 0, 1);
    c.strokeStyle = s.color('yellow');
    c.lineWidth = 4;
    c.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU + life.local * 0.12;
      const r0 = len * 0.25;
      const r1 = r0 + len * p * (i % 2 ? 0.7 : 1);
      c.globalAlpha = a0 * (0.9 - 0.4 * (i % 2));
      c.beginPath();
      c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
      c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      c.stroke();
    }
  });
}

// The demon breaking apart into sparks.
function shatter(s, x, y, r, at) {
  s.draw({ at, sfx: false, enter: 'none' }, (c, life) => {
    const a0 = c.globalAlpha;
    const p = s.clamp(life.local / 1.4, 0, 1);
    c.fillStyle = s.color('red');
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * TAU + s.rand(i) * 0.6;
      const d = r * (0.3 + 2.2 * p * (0.4 + s.rand(i + 50)));
      c.globalAlpha = a0 * (1 - p);
      c.beginPath();
      c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 3 + 5 * s.rand(i + 100) * (1 - p), 0, TAU);
      c.fill();
    }
  });
}

// A moon: waxing opens to the left, waning to the right.
function moon(s, x, y, r, waxing, at) {
  s.draw({ at, sfx: false, enter: 'fade' }, (c) => {
    const a0 = c.globalAlpha;
    const off = r * 0.55 * (waxing ? -1 : 1);
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.arc(x + off, y - r * 0.08, r * 0.86, 0, TAU);
    c.fillStyle = s.color(waxing ? 'yellow' : 'muted');
    c.globalAlpha = a0;
    c.fill('evenodd');
    c.lineWidth = 3;
    c.strokeStyle = s.color('yellow');
    c.globalAlpha = a0 * 0.5;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.stroke();
  });
}

export default {
  intro(s) {
    const t = s.safe.top;
    frame(s, 0);
    text(s, 'एकादशी कथा', s.cx, t + 160, 150, { font: 'display', color: 'yellow', at: 0, enter: 'none' });
    lotus(s, s.cx, t + 640, 250, 0, { enter: 'none' });
    text(s, 'जन्म की कथा', s.cx, t + 720, 58, { color: 'muted', at: 0.8 });
    s.box('पुराणों के अनुसार', { id: 'src', x: s.cx, y: t + 900, size: 52, w: 620, color: 'orange', at: '#source' });
    s.box('असुर मुर', { id: 'asur', x: s.cx, y: t + 1060, size: 52, w: 460, color: 'red', at: '#asur' });
    s.arrow('src', 'asur', { at: '#asur' });
  },

  mura(s) {
    const t = s.safe.top;
    frame(s, 1);
    murAt(s, s.cx, t + 330, 150, 0.4);
    text(s, 'असुर मुर', s.cx, t + 600, 96, { font: 'display', color: 'red', at: 0.6 });
    s.box('स्वर्ग', { id: 'heaven', x: s.cx, y: t + 790, size: 62, w: 440, icon: 'cloud', color: 'yellow', at: '#heaven' });
    s.arrow([s.cx + 120, t + 520], 'heaven', { color: 'red', at: '#heaven' });
    s.box('देवता', { id: 'gods', x: s.cx - 200, y: t + 1060, size: 54, w: 330, at: '#gods' });
    s.box('भगवान विष्णु', { id: 'vishnu', x: s.cx + 210, y: t + 1060, size: 50, w: 400, color: 'blue', at: '#gods' });
    s.arrow('gods', 'vishnu', { at: '#gods' });
  },

  vishnu(s) {
    const t = s.safe.top;
    frame(s, 2);
    chakra(s, s.cx, t + 330, 150, 0.4);
    text(s, 'भगवान विष्णु', s.cx, t + 610, 88, { font: 'display', color: 'blue', at: 0.6 });
    text(s, 'मुर से युद्ध', s.cx, t + 730, 64, { color: 'red', at: 1.2 });
    cave(s, s.cx, t + 960, 380, 300, '#cave', '#cave');
    text(s, 'बद्रिकाश्रम की गुफा', s.cx, t + 1180, 54, { color: 'muted', at: '#cave' });
  },

  devi(s) {
    const t = s.safe.top;
    frame(s, 3);
    const tSlay = s.time('#slay');
    cave(s, s.cx, t + 640, 480, 400, 0.3, '#devi');
    murAt(s, s.cx + 360, t + 800, 100, 0.8, tSlay);
    rays(s, s.cx, t + 640, 300, '#devi');
    lotus(s, s.cx, t + 700, 150, '#devi');
    text(s, 'देवी एकादशी', s.cx, t + 190, 100, { font: 'display', color: 'yellow', at: '#devi' });
    shatter(s, s.cx + 120, t + 780, 100, '#slay');
    text(s, 'मुर का वध', s.cx, t + 1120, 76, { font: 'display', color: 'red', at: '#slay' });
  },

  boon(s) {
    const t = s.safe.top;
    frame(s, 4);
    text(s, 'एकादशी', s.cx, t + 150, 150, { font: 'display', color: 'yellow', at: 0.4 });
    lotus(s, s.cx, t + 560, 210, 0.4);
    s.box('वरदान', { id: 'boon', x: s.cx, y: t + 780, size: 58, w: 420, color: 'orange', at: '#boon' });
    s.box('पाप मिटेंगे', { id: 'sins', x: s.cx - 200, y: t + 1000, size: 52, w: 380, color: 'pink', at: '#sins' });
    s.box('मोक्ष', { id: 'moksha', x: s.cx + 220, y: t + 1000, size: 56, w: 340, color: 'yellow', at: '#moksha' });
    s.arrow('boon', 'sins', { at: '#sins' });
    s.arrow('boon', 'moksha', { at: '#moksha' });
  },

  outro(s) {
    const t = s.safe.top;
    frame(s, 5);
    text(s, 'एकादशी', s.cx, t + 150, 150, { font: 'display', color: 'yellow', at: -1, enter: 'none' });
    moon(s, s.cx - 220, t + 470, 120, true, '#moon');
    moon(s, s.cx + 220, t + 470, 120, false, '#moon');
    text(s, 'शुक्ल पक्ष', s.cx - 220, t + 650, 50, { color: 'muted', at: '#moon' });
    text(s, 'कृष्ण पक्ष', s.cx + 220, t + 650, 50, { color: 'muted', at: '#moon' });
    text(s, '11', s.cx, t + 850, 190, { font: 'display', color: 'orange', at: '#eleven' });
    text(s, 'ग्यारहवीं तिथि', s.cx, t + 1000, 64, { at: '#eleven' });
    lotus(s, s.cx, t + 1180, 90, '#eleven');
  },
};
