// Jack Ma biography. Editorial look: a kicker, a serif headline and a fine rule
// on every scene, with the content underneath.
const L = 170;

function text(s, str, x, y, size, o = {}) {
  return s.text(str, { x, y, size, sfx: false, ...o });
}

// Shared page furniture. The kicker and the rule are there from the first frame.
function frame(s, kicker, title, at = 0.3) {
  text(s, kicker, L, 120, 32, { align: 'left', color: 'muted', at: -1, enter: 'none' });
  text(s, title, L, 222, 104, { align: 'left', font: 'display', at, enter: 'rise' });
  s.line([[L, 308], [1750, 308]], { color: 'ink', width: 1, at: -1, enter: 'none', opacity: 0.3, sfx: false });
}

export default {
  intro(s) {
    text(s, 'A BIOGRAPHY', L, 180, 34, { align: 'left', color: 'muted', at: 0, enter: 'none' });
    text(s, 'Jack Ma', L, 430, 200, { align: 'left', font: 'display', at: 0, enter: 'none' });
    s.line([[L, 590], [820, 590]], { color: 'ink', width: 1, at: '#name', sfx: false });
    text(s, 'Born Ma Yun', L, 665, 54, { align: 'left', at: '#name', enter: 'fade' });
    text(s, 'Hangzhou, China', L, 745, 40, { align: 'left', color: 'muted', at: '#name', enter: 'fade' });
    text(s, '1964', 1370, 440, 230, { font: 'display', color: 'accent', at: 0, enter: 'none' });
    s.box('English teacher', { id: 'teacher', x: 1180, y: 760, size: 42, icon: 'graduation-cap', at: '#teacher' });
    s.box('Alibaba founder', { id: 'founder', x: 1620, y: 760, size: 42, icon: 'store', color: 'accent', at: 'found' });
    s.arrow('teacher', 'founder', { at: 'found' });
  },

  english(s) {
    frame(s, 'JACK MA  ·  BEFORE UNIVERSITY', 'Learning English');
    s.number(9, { x: 560, y: 560, size: 230, suffix: ' years', font: 'display', at: '#tour' });
    text(s, 'guiding foreign visitors', 560, 740, 48, { color: 'muted', at: '#tour' });
    s.icon('bike', { x: 1300, y: 560, size: 190, color: 'ink', at: '#tour' });
    s.icon('languages', { x: 1600, y: 560, size: 190, color: 'accent', at: '#english' });
    text(s, 'by bike', 1300, 740, 44, { color: 'muted', at: '#tour' });
    text(s, 'to practice English', 1600, 740, 44, { color: 'muted', at: '#english' });
  },

  exams(s) {
    frame(s, 'JACK MA  ·  1982 TO 1984', 'Three tries');
    const rows = [
      { year: '1982', note: 'Failed the entrance exam', icon: 'x', color: 'muted', at: '#first' },
      { year: '1983', note: 'Failed again', icon: 'x', color: 'muted', at: '#second' },
      { year: '1984', note: 'Hangzhou Normal University', sub: 'English department', icon: 'check', color: 'accent', at: '#third' },
    ];
    rows.forEach((r, i) => {
      const y = 480 + i * 170;
      text(s, r.year, L, y, 100, { align: 'left', font: 'display', color: r.color === 'accent' ? 'accent' : 'ink', at: r.at });
      text(s, r.note, 640, y, 54, { align: 'left', at: r.at });
      if (r.sub) text(s, r.sub, 640, y + 62, 36, { align: 'left', color: 'muted', at: r.at });
      s.icon(r.icon, { x: 1640, y, size: 90, color: r.color === 'accent' ? 'green' : 'red', at: r.at });
      if (i < 2) s.line([[L, y + 85], [1750, y + 85]], { color: 'ink', width: 1, opacity: 0.2, at: r.at, sfx: false });
    });
  },

  rejected(s) {
    frame(s, 'JACK MA  ·  1988', 'After graduation');
    s.number(31, { x: 560, y: 560, size: 260, font: 'display', color: 'accent', at: '#number' });
    text(s, 'job applications', 560, 740, 50, { color: 'muted', at: '#number' });
    s.box('KFC said no', { id: 'kfc', x: 1250, y: 470, size: 46, icon: 'ban', color: 'red', at: '#kfc' });
    const lecturer = s.box('English lecturer', { id: 'lecturer', x: 1250, y: 740, size: 46, icon: 'graduation-cap', color: 'accent', at: '#lecturer' });
    text(s, 'Hangzhou Dianzi University', 1250, lecturer.bottom + 40, 34, { color: 'muted', at: '#lecturer' });
    s.arrow('kfc', 'lecturer', { at: '#lecturer' });
  },

  internet(s) {
    frame(s, 'JACK MA  ·  1995', 'The first search');
    const xs = s.row(3, { width: 1200 });
    s.box('Searches for\nChinese beer', { id: 'search', x: xs[0], y: 470, size: 40, icon: 'search', at: '#search' });
    s.box('Builds a\nweb page', { id: 'site', x: xs[1], y: 470, size: 40, icon: 'globe', at: '#site' });
    s.box('Inquiries\nwithin hours', { id: 'replies', x: xs[2], y: 470, size: 40, icon: 'mail', color: 'green', at: '#replies' });
    s.arrow('search', 'site', { at: '#site' });
    s.arrow('site', 'replies', { at: '#replies' });
    text(s, 'Nothing found online', xs[0], 640, 36, { color: 'muted', at: s.cue('nothing') });
    s.box('China Pages', { id: 'pages', x: s.cx, y: 800, size: 54, icon: 'book-open', color: 'accent', at: '#pages' });
    text(s, 'an online yellow pages', s.cx + 440, 800, 38, { align: 'left', color: 'muted', at: '#pages' });
    s.arrow('replies', 'pages', { at: '#pages', bend: -0.3 });
  },

  alibaba(s) {
    frame(s, 'JACK MA  ·  1999', 'Alibaba begins');
    const xs = s.row(3, { width: 1250 });
    s.box('His apartment', { id: 'home', x: xs[0], y: 470, size: 42, icon: 'house', at: 0.5 });
    s.box('Alibaba', { id: 'ali', x: xs[1], y: 470, size: 56, icon: 'store', color: 'accent', at: '#site' });
    s.box('Goldman Sachs\nSoftBank', { id: 'investors', x: xs[2], y: 470, size: 38, icon: 'landmark', at: '#money' });
    s.arrow('home', 'ali', { at: '#site' });
    s.arrow('investors', 'ali', { at: '#money' });
    text(s, 'Hangzhou', xs[0], 640, 36, { color: 'muted', at: 0.5 });
    text(s, 'A website for businesses\nto trade with each other', xs[1], 665, 36, { color: 'muted', lineHeight: 1.3, at: '#site' });
    s.number(25, { x: xs[2], y: 665, size: 110, prefix: '$', suffix: ' million', font: 'display', color: 'accent', at: '#money' });
    text(s, 'combined, by early 2000', xs[2], 770, 34, { color: 'muted', at: '#money' });
    s.annotate({ x: xs[2], y: 672, w: 430, h: 130 }, { type: 'underline', color: 'accent', at: s.time('#money') + 2.4 });
  },

  growth(s) {
    frame(s, 'JACK MA  ·  FROM 2003', 'More than a marketplace');
    const xs = s.row(3, { width: 1250 });
    s.box('Taobao', { id: 'taobao', x: xs[0], y: 520, size: 56, icon: 'shopping-bag', color: 'accent', at: '#taobao' });
    text(s, 'a shopping site', xs[0], 650, 38, { color: 'muted', at: '#taobao' });
    s.box('Alipay', { id: 'alipay', x: xs[1], y: 520, size: 56, icon: 'wallet', color: 'blue', at: '#alipay' });
    text(s, 'a payment service', xs[1], 650, 38, { color: 'muted', at: '#alipay' });
    s.box('eBay offer', { id: 'ebay', x: xs[2], y: 520, size: 56, icon: 'handshake', at: '#ebay' });
    s.annotate('ebay', { type: 'cross', color: 'red', at: 'said no' });
    text(s, 'He said no', xs[2], 650, 38, { color: 'red', at: 'said no' });
  },

  ipo(s) {
    frame(s, 'JACK MA  ·  2014', 'Going public');
    s.icon('landmark', { x: 520, y: 560, size: 230, color: 'ink', at: 0.5 });
    text(s, 'New York Stock Exchange', 520, 740, 44, { color: 'muted', at: 0.5 });
    s.number(25, { x: 1250, y: 520, size: 230, prefix: '$', suffix: ' billion', font: 'display', color: 'accent', at: '#number' });
    text(s, 'raised, a record at the time', 1250, 710, 48, { at: '#record' });
    s.annotate({ x: 1250, y: 510, w: 860, h: 250 }, { type: 'underline', color: 'accent', at: '#record' });
  },

  later(s) {
    frame(s, 'JACK MA  ·  2019 AND AFTER', 'Stepping back');
    const lx = 520;
    const rx = 1340;
    text(s, '2019', lx, 480, 150, { font: 'display', color: 'accent', at: 0.5 });
    text(s, 'Hands the chairman role\nto Daniel Zhang', lx, 680, 46, { lineHeight: 1.3, at: 0.5 });
    s.line([[930, 400], [930, 840]], { color: 'ink', width: 1, opacity: 0.25, at: '#tokyo', sfx: false });
    s.icon('graduation-cap', { x: rx, y: 470, size: 190, at: '#tokyo' });
    text(s, 'Invited professor\nUniversity of Tokyo', rx, 680, 46, { id: 'prof', lineHeight: 1.3, maxWidth: 780, at: '#tokyo' });
    s.annotate('prof', { type: 'underline', color: 'accent', at: 'University' });
  },

  outro(s) {
    frame(s, 'JACK MA  ·  IN SHORT', 'The short version');
    const xs = s.row(3, { width: 1300 });
    s.box('Failed exams', { id: 'exams', x: xs[0], y: 560, size: 46, icon: 'x', color: 'red', at: 0.6 });
    s.box('Turned down\nfor jobs', { id: 'jobs', x: xs[1], y: 560, size: 46, icon: 'ban', color: 'red', at: '#jobs' });
    s.box('Built Alibaba', { id: 'built', x: xs[2], y: 560, size: 50, icon: 'store', color: 'accent', at: '#build' });
    s.arrow('exams', 'jobs', { at: '#jobs' });
    s.arrow('jobs', 'built', { at: '#build' });
    s.annotate('built', { type: 'circle', color: 'accent', at: 'biggest' });
  },
};
