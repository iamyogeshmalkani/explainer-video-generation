// Hinduism in one minute, 9:16. Everything sits inside s.safe (the part Shorts,
// TikTok and Reels leave free); the captions run below it, so the narration is
// never repeated as on-screen text.
const text = (s, str, x, y, size, o = {}) => s.text(str, { x, y, size, sfx: false, ...o });

export default {
  intro(s) {
    const t = s.safe.y;
    text(s, 'Hinduism', s.cx, t + 95, 140, { font: 'display', at: 0, enter: 'none' });
    s.line([[s.cx - 230, t + 190], [s.cx + 230, t + 190]], { color: 'ink', width: 1, opacity: 0.3, at: 0, enter: 'none', sfx: false });
    s.number(1.2, { x: s.cx, y: t + 330, size: 120, decimals: 1, suffix: ' billion', font: 'display', at: '#people' });
    text(s, 'followers', s.cx, t + 425, 44, { color: 'muted', at: '#people' });
    s.number(95, { x: s.cx, y: t + 540, size: 120, suffix: '%', font: 'display', color: 'accent', at: '#india' });
    text(s, 'live in India', s.cx, t + 635, 44, { color: 'muted', at: '#india' });
  },

  roots(s) {
    const t = s.safe.y;
    s.icon('hourglass', { x: s.cx, y: t + 70, size: 100, at: 0.3 });
    text(s, 'Thousands\nof years', s.cx, t + 220, 104, { font: 'display', lineHeight: 1.05, at: 0.3, enter: 'rise' });
    s.box('No single founder', { id: 'founder', x: s.cx, y: t + 430, size: 46, at: '#founder' });
    s.box('No single holy book', { id: 'book', x: s.cx, y: t + 570, size: 46, at: '#book' });
  },

  brahman(s) {
    const t = s.safe.y;
    s.box('Brahman', { id: 'hub', x: s.cx, y: t + 150, size: 74, color: 'accent', at: 0.4 });
    text(s, 'one ultimate reality', s.cx, t + 265, 42, { color: 'muted', at: 0.9 });
    const xs = s.row(2, { width: s.safe.w * 0.6 });
    s.box('Vishnu', { id: 'vishnu', x: xs[0], y: t + 520, size: 48, at: '#vishnu' });
    s.box('Shiva', { id: 'shiva', x: xs[1], y: t + 520, size: 48, at: '#shiva' });
    s.arrow([s.cx, t + 300], 'vishnu', { at: '#vishnu' });
    s.arrow([s.cx, t + 300], 'shiva', { at: '#shiva' });
    text(s, 'many forms', s.cx, t + 640, 42, { color: 'muted', at: '#forms' });
  },

  ideas(s) {
    const rows = [
      { term: 'Dharma', note: 'duty', icon: 'scale', at: '#dharma' },
      { term: 'Karma', note: 'actions have consequences', icon: 'sprout', at: '#karma' },
      { term: 'Samsara', note: 'the cycle of rebirth', icon: 'refresh-cw', at: '#samsara' },
      { term: 'Moksha', note: 'freedom from the cycle', icon: 'bird', at: '#moksha', color: 'accent' },
    ];
    const ys = s.col(4, { height: s.safe.h * 0.76 });
    rows.forEach((r, i) => {
      const y = ys[i];
      s.icon(r.icon, { x: s.safe.x + 60, y, size: 84, color: r.color || 'ink', at: r.at });
      text(s, r.term, s.safe.x + 150, y - 24, 70, { align: 'left', font: 'display', color: r.color || 'ink', at: r.at });
      text(s, r.note, s.safe.x + 150, y + 38, 36, { align: 'left', color: 'muted', maxWidth: s.safe.w - 160, at: r.at });
    });
  },

  practice(s) {
    const t = s.safe.y;
    s.icon('flame', { x: s.cx, y: t + 110, size: 130, color: 'accent', at: '#puja' });
    text(s, 'Puja', s.cx, t + 235, 84, { font: 'display', at: '#puja' });
    text(s, 'at home and in temples', s.cx, t + 310, 40, { color: 'muted', at: '#puja' });
    s.line([[s.cx - 230, t + 380], [s.cx + 230, t + 380]], { color: 'ink', width: 1, opacity: 0.3, at: '#festivals', sfx: false });
    s.icon('sparkles', { x: s.cx, y: t + 470, size: 130, color: 'accent', at: '#festivals' });
    text(s, 'Diwali  ·  Holi', s.cx, t + 590, 70, { font: 'display', at: '#festivals' });
    text(s, 'major festivals', s.cx, t + 655, 40, { color: 'muted', at: '#festivals' });
  },

  outro(s) {
    const t = s.safe.y;
    text(s, 'Hinduism', s.cx, t + 120, 120, { font: 'display', at: -1, enter: 'none' });
    s.line([[s.cx - 230, t + 205], [s.cx + 230, t + 205]], { color: 'ink', width: 1, opacity: 0.3, at: -1, enter: 'none', sfx: false });
    text(s, 'A diverse\ntradition', s.cx, t + 380, 104, { font: 'display', color: 'accent', lineHeight: 1.05, at: 0.3, enter: 'rise' });
    s.icon('hourglass', { x: s.cx, y: t + 560, size: 100, at: '#end' });
    text(s, 'thousands of years', s.cx, t + 650, 42, { color: 'muted', at: '#end' });
  },
};
