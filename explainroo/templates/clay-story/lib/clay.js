// Clay-story kit for explainroo: a story told with AI clay pictures that move a little, like stop-motion. Every shot is
// ONE picture (the clay characters already stand inside the clay set). Taken from founder-story-claymation, with these changes:
//   - a shot starts on a WORD of the narration: { word: 37 } is the 38th word of the scene (scripts/plan-shots.mjs writes them),
//     so no [#markers] are needed and the voice never has to be made again when the shots change;
//   - a picture stays on screen at least 2 and at most 3 seconds (shots(s, list, { minShot, maxShot }) stops with a list);
//   - the letterbox layout (a square picture in a 9:16 frame between black bars), see frame / amount below.
//
//   shots(s, SHOTS);                  // first: the full-frame clay pictures, with camera moves and transitions
//   grade(s);                         // a soft warm vignette and a darker foot for the captions
//   grain(s);                         // tiny flickering specks and a lamp flicker over everything
//   title(s, 'FIRED AT *THIRTY*', { out: '#s3' });     // clay-letter hook near the top
//   plates(s, LABELS);                // a clay tag: a year over a name or a place
//   stats(s, STATS);                  // one big number on a clay plaque
//   quotes(s, QUOTES);                // the founder's own words on a clay plaque
//   captions(s);                      // bold white word-by-word captions, the spoken word lit yellow
//   endCard(s, END);                  // last: a short note ("clay pictures are AI-made")
//
// Letterbox layout (a square picture between black bars, a title above, phrase captions below; the Saudi sheikh video):
//   shots(s, SHOTS, { frame: { x, y, w, h }, amount: 0.55 });   // pictures clipped to the frame; amount < 1 makes every move gentler
//   barTitle(s, { lines: ['Pyaar ka ek', '*khatarnaak* jaal 💀'], y, size, at, out });   // plain bold title in the top bar
//   urlBar(s, { text: 'Visit our website 🔗', url: 'www.example.com', at, out });          // pill + gold line in the top bar
//   captions(s, { y, size, upper: false, maxWords: 6, maxChars: 34, breakOn: /[,.!?]$/, pop: false, edge: 0 });   // phrase captions
//   bigWord(s, { text: 'Join now', at, y, size });                                          // big gold serif word in the caption band
//
// The camera glides smoothly (no vibrating). Cuts are hard, transitions are short, and plaques and captions pop in with
// a squash like clay. For a jerkier hand-made look: shots(s, SHOTS, { smooth: false, boil: 1 }) moves the camera in 10
// poses a second and makes the picture tremble ("clay boil"); WOBBLE at the top of this file does the same for the type.
//
// A shot: { n, at: '#s1', file: 'shot01', motion, focus: [x, y], enter, from, who, scene }
//   motion  how the camera moves over the picture while the shot is on screen (zoom about `focus`, or slide):
//             push       slow zoom in on `focus`               (the default; tension, attention)
//             pushHard   a strong zoom in on `focus`           (the hook, a face, a decision)
//             pull       slow zoom out from `focus`            (a reveal, relief)
//             pullHard   a strong zoom out                     (the big reveal, the ending)
//             slideLeft  the picture slides left, no zoom      (time passing, a long set, a walk)
//             slideRight the picture slides right
//             rise       the camera tilts up                   (success, hope, a tall building)
//             fall       the camera tilts down                 (a drop, a loss)
//             drift      a very small hand-held float          (quiet, thinking, waiting)
//             still      nothing moves except the clay boil
//   focus   [x, y] from 0.25 to 0.75: the point the zoom goes to or comes from (the face; default [0.5, 0.45])
//   enter   how the shot arrives from the one before it:
//             cut (default, a hard stop-motion cut) | slide (pushes the old shot away: a jump in time or place)
//             | zoom (a quick punch-in: a big moment) | fade (a soft dissolve: a memory, the end)
//   from    'right' (default) or 'left': the side a `slide` comes from
//   A clip (assets/shot01.mp4, from any image-to-video tool) replaces the picture and plays as it is (`speed`, `clipFrom` seconds).
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = (p) => p * p * (3 - 2 * p);
const easeOut = (p) => 1 - (1 - p) * (1 - p);
const FONT = '"Kalam", "Noto Sans Devanagari", sans-serif'; // clay lettering: title, plates, plaques
const SANS = '"Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif'; // captions (made heavier by an extra stroke)
const CREAM = '#fff3d6';
const BROWN = '#4a2c17';
const ORANGE = '#ff9a2e';
const YELLOW = '#ffd84a';
const MAX_SHOT = 3; // seconds: no picture stays on screen longer than this (shots(s, list, { maxShot }) changes it)
const MIN_SHOT = 2; // seconds: and none shorter than this
const END_SECONDS_HOLD = 0; // the last picture also covers the pause at the end, so it may run a little over
const END_SECONDS = 3; // the end card covers the end of the last picture

// A number from 0 to 1 that depends only on n, so every render is the same.
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const centered = (n) => hash(n) * 2 - 1; // -1 to 1
const WOBBLE = 0; // 1 = letters and plaques tremble a little in steps (a handmade feel); 0 = they hold still
const stepOf = (t, fps) => Math.floor(t * fps + 1e-6); // the pose a time falls in

// Pose keys: [seconds, scaleX, scaleY]. Between keys the pose is blended; the stepped clock makes it jerky.
const POP = [[0, 0, 0], [0.1, 1.3, 0.7], [0.2, 0.82, 1.2], [0.3, 1.1, 0.94], [0.4, 0.97, 1.03], [0.5, 1, 1]];
function keys(list, t) {
  if (t <= list[0][0]) return [list[0][1], list[0][2]];
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i][0]) {
      const p = (t - list[i - 1][0]) / (list[i][0] - list[i - 1][0]);
      return [lerp(list[i - 1][1], list[i][1], p), lerp(list[i - 1][2], list[i][2], p)];
    }
  }
  const last = list[list.length - 1];
  return [last[1], last[2]];
}

function wrap(ctx, text, maxWidth) {
  const lines = [''];
  for (const w of String(text).split(' ')) {
    const t = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t;
  }
  return lines;
}

function outlined(ctx, text, x, y, size, fill, edge = BROWN) {
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.2;
  ctx.strokeStyle = edge;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

// ---------- the shots ----------

// zoom z, picture shift x and y (fractions of the width and height), from the start of the shot to its end.
// `focus: true` motions zoom about the focus point; the others zoom and move about the middle of the frame.
const MOTIONS = {
  push: { z: [1.0, 1.14], focus: true },
  pushHard: { z: [1.0, 1.28], focus: true },
  pull: { z: [1.14, 1.0], focus: true },
  pullHard: { z: [1.28, 1.0], focus: true },
  slideLeft: { z: [1.14, 1.14], x: [0.045, -0.045] },
  slideRight: { z: [1.14, 1.14], x: [-0.045, 0.045] },
  rise: { z: [1.14, 1.14], y: [0.035, -0.035] },
  fall: { z: [1.14, 1.14], y: [-0.035, 0.035] },
  drift: { z: [1.04, 1.1], x: [-0.012, 0.012], y: [0.006, -0.006] },
  still: { z: [1, 1] },
};
export const MOTION_NAMES = Object.keys(MOTIONS);

// how long a shot takes to arrive, in seconds (the old shot stays underneath until then)
const TRANSITIONS = { cut: 0, fade: 0.3, slide: 0.4, zoom: 0.3 };
export const TRANSITION_NAMES = Object.keys(TRANSITIONS);

// Finds the file for a shot: a clip (assets/<base>.mp4 ...) or a picture (assets/<base>.png ...).
function find(s, base) {
  for (const ext of ['mp4', 'mov', 'webm', 'm4v']) if (s.engine.clips.has(`assets/${base}.${ext}`)) return { kind: 'clip', src: `assets/${base}.${ext}` };
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) if (s.engine.images.has(`assets/${base}.${ext}`)) return { kind: 'image', src: `assets/${base}.${ext}` };
  return null;
}

// What shows while a picture is missing: a clay-colored card with the shot number and what the picture should show.
function placeholder(s, shot, i, t0, t1, first, enterKind, F = { x: 0, y: 0, w: s.W, h: s.H }) {
  s.draw({ at: t0, out: t1, enter: first || enterKind === 'cut' ? 'none' : 'fade', dur: 0.25, exit: 'none', sfx: false }, (ctx) => {
    const hue = (i * 41 + 18) % 360;
    const g = ctx.createLinearGradient(0, 0, 0, s.H);
    g.addColorStop(0, `hsl(${hue},45%,62%)`);
    g.addColorStop(1, `hsl(${(hue + 25) % 360},40%,38%)`);
    ctx.fillStyle = g;
    ctx.fillRect(F.x, F.y, F.w, F.h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `700 ${F.w * 0.1}px ${FONT}`;
    ctx.fillText(`SHOT ${String(shot.n ?? i + 1).padStart(2, '0')}`, F.x + F.w / 2, F.y + F.h * 0.2);
    ctx.font = `700 ${F.w * 0.036}px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    wrap(ctx, shot.scene || shot.prompt || '', F.w * 0.78).slice(0, 8).forEach((l, k) => ctx.fillText(l, F.x + F.w / 2, F.y + F.h * 0.3 + k * F.w * 0.05));
    ctx.fillStyle = CREAM;
    ctx.font = `700 ${F.w * 0.032}px ${FONT}`;
    ctx.fillText(`placeholder: add assets/${shot.file}.png (or .mp4)`, F.x + F.w / 2, F.y + F.h * 0.92);
  });
}

// list: [{ n, at: '#s1' or seconds, file: 'shot01', motion, focus, enter, from }]. Each shot runs until the next one has arrived.
// o: { smooth: true (the camera glides; false = it moves in `fps` poses a second like stop-motion), fps: 10, boil: 0 (1 = the picture
//      trembles a little on every pose, 2 = jittery; it looks like vibrating, so it is off), maxShot: 5 }
export function shots(s, list, o = {}) {
  const opt = { fps: o.fps ?? 10, boil: o.boil ?? 0, smooth: o.smooth ?? true };
  const F = o.frame || { x: 0, y: 0, w: s.W, h: s.H }; // the picture area (default: the whole frame)
  const amount = o.amount ?? 1; // 1 = the moves in MOTIONS; 0.5 = half as strong
  const maxShot = o.maxShot ?? MAX_SHOT;
  const minShot = o.minShot ?? MIN_SHOT;
  const slack = o.slack ?? 0.12; // seconds of rounding the 2 to 3 second rule allows
  const tooLong = [];
  const tooShort = [];
  const words = s.words || [];
  // when a shot starts: on its word (a little before it is said), or at its marker or time
  const startOf = (shot, i) => {
    if (i === 0) return 0;
    if (shot.word !== undefined) {
      const w = words[shot.word];
      if (!w) throw new Error(`shot ${shot.n ?? i + 1}: word ${shot.word} does not exist (the narration has ${words.length} words). Run scripts/plan-shots.mjs again.`);
      return Math.max(0, w.start - 0.06);
    }
    return s.time(shot.at);
  };
  const fileOf = (shot) => shot.file ?? `shot${String(shot.n).padStart(2, '0')}`;
  list.forEach((shot, i) => {
    const first = i === 0;
    const enterKind = first ? 'cut' : (TRANSITIONS[shot.enter] !== undefined ? shot.enter : 'cut');
    if (shot.enter !== undefined && TRANSITIONS[shot.enter] === undefined) throw new Error(`shot ${shot.n ?? i + 1}: enter "${shot.enter}" is not one of ${TRANSITION_NAMES.join(', ')}`);
    if (shot.motion !== undefined && !MOTIONS[shot.motion]) throw new Error(`shot ${shot.n ?? i + 1}: motion "${shot.motion}" is not one of ${MOTION_NAMES.join(', ')}`);
    const t0 = startOf(shot, i);
    const t1 = i + 1 < list.length ? startOf(list[i + 1], i + 1) : s.dur; // when the next shot starts to arrive
    const next = list[i + 1];
    const nextKind = next && TRANSITIONS[next.enter] !== undefined ? next.enter : 'cut';
    const nextDur = next ? TRANSITIONS[nextKind] : 0;
    const nextDir = next?.from === 'left' ? -1 : 1;
    const tEnd = i + 1 < list.length ? t1 + nextDur + 1 / opt.fps : s.dur; // stays until the next shot is fully there
    const found = find(s, fileOf(shot));
    {
      const last = i + 1 >= list.length;
      const shown = (last ? s.dur - END_SECONDS_HOLD : t1) - t0;
      if (shown > maxShot + slack + (last ? 1.6 : 0)) tooLong.push(`shot ${shot.n ?? i + 1} is on screen ${shown.toFixed(1)} s`);
      if (!last && shown < minShot - slack) tooShort.push(`shot ${shot.n ?? i + 1} is on screen ${shown.toFixed(1)} s`);
    }
    // sounds for the arrival (a stop-motion cut needs none)
    if (!first && enterKind === 'slide') s.sfx('whoosh', t0, { gain: 0.22 });
    if (!first && enterKind === 'zoom') s.sfx('thud', t0 + 0.03, { gain: 0.3 });
    if (!found) { placeholder(s, shot, i, t0, tEnd, first, enterKind, F); return; }
    if (found.kind === 'clip') {
      // a clip from an image-to-video tool plays as it is
      s.clip(found.src, { x: F.x + F.w / 2, y: F.y + F.h / 2, w: F.w, h: F.h, fit: 'cover', frame: 'none', shadow: false, radius: 0, at: t0, out: tEnd, enter: enterKind === 'cut' ? 'none' : 'fade', dur: 0.25, outDur: 0.25, sfx: false, speed: shot.speed ?? 1, from: shot.clipFrom ?? 0 });
      return;
    }
    const m0 = MOTIONS[shot.motion] || MOTIONS.push;
    const m = { ...m0, z: m0.z.map((v) => 1 + (v - 1) * amount), x: m0.x?.map((v) => v * amount), y: m0.y?.map((v) => v * amount) };
    const seed = (shot.n ?? i + 1) * 1000;
    const inDur = TRANSITIONS[enterKind];
    const inDir = shot.from === 'left' ? -1 : 1;
    const [fx, fy] = (shot.focus || [0.5, 0.45]).map((v) => clamp(v, 0.25, 0.75));
    s.draw({ at: t0, out: tEnd, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const img = s.engine.image(found.src);
      const step = stepOf(s.t, opt.fps);
      const ts = opt.smooth ? s.t : step / opt.fps; // smooth: real time; otherwise the whole picture changes on the same poses
      const p = ease(clamp((Math.min(ts, t1) - t0) / Math.max(0.1, t1 - t0))); // camera progress; holds while the next shot arrives
      let alpha = 1;
      let ox = 0;
      let extra = 1;
      const a = ts - t0;
      if (!first && a < inDur) { // arriving
        const q = clamp(a / inDur);
        if (enterKind === 'fade') alpha = q;
        else if (enterKind === 'slide') ox = inDir * (1 - easeOut(q)) * F.w;
        else if (enterKind === 'zoom') { alpha = Math.min(1, q * 2.5); extra = 1 + 0.3 * (1 - easeOut(q)); }
      }
      const b = ts - t1;
      if (b > 0 && nextDur > 0) { // being covered by the next shot
        const q = clamp(b / nextDur);
        if (nextKind === 'slide') ox -= nextDir * ease(q) * F.w * 0.3;
        else if (nextKind === 'zoom') extra *= 1 + 0.08 * q;
      }
      const z = lerp(m.z[0], m.z[1], p) * (1 + 0.025 * opt.boil) * extra; // a little extra so the trembling never shows an edge
      const sc = Math.max(F.w / img.naturalWidth, F.h / img.naturalHeight);
      const w = img.naturalWidth * sc;
      const h = img.naturalHeight * sc;
      const k = seed + step;
      const dx = centered(k * 3 + 1) * 0.0035 * F.w * opt.boil;
      const dy = centered(k * 3 + 2) * 0.0035 * F.h * opt.boil;
      const rot = centered(k * 3 + 3) * 0.0035 * opt.boil; // radians, about 0.2 degrees
      const px = F.x + (m.focus ? fx : 0.5) * F.w;
      const py = F.y + (m.focus ? fy : 0.5) * F.h;
      ctx.save();
      ctx.beginPath();
      ctx.rect(F.x, F.y, F.w, F.h);
      ctx.clip();
      ctx.globalAlpha = alpha;
      ctx.translate(px + ox + (m.x ? lerp(m.x[0], m.x[1], p) : 0) * F.w + dx, py + (m.y ? lerp(m.y[0], m.y[1], p) : 0) * F.h + dy);
      ctx.rotate(rot);
      ctx.scale(z, z);
      ctx.translate(-px, -py);
      ctx.drawImage(img, F.x + F.w / 2 - w / 2, F.y + F.h / 2 - h / 2, w, h);
      ctx.restore();
    });
  });
  if (tooLong.length || tooShort.length) {
    throw new Error(`clay-story: every picture must stay on screen ${minShot} to ${maxShot} seconds, but ${[...tooShort, ...tooLong].join('; ')}. The narration or its speed changed since the shots were planned: run  node scripts/plan-shots.mjs <project>  (it keeps the scenes you already wrote for unchanged lines).`);
  }
}

// A soft warm vignette and a darker foot, so the captions stay readable on any picture.
export function grade(s) {
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const v = ctx.createRadialGradient(s.cx, s.cy, s.W * 0.45, s.cx, s.cy, s.H * 0.78);
    v.addColorStop(0, 'rgba(30,15,5,0)');
    v.addColorStop(1, 'rgba(30,15,5,0.3)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, s.W, s.H);
    const bot = ctx.createLinearGradient(0, s.H * 0.55, 0, s.H);
    bot.addColorStop(0, 'rgba(30,15,5,0)');
    bot.addColorStop(1, 'rgba(30,15,5,0.4)');
    ctx.fillStyle = bot;
    ctx.fillRect(0, s.H * 0.55, s.W, s.H * 0.45);
  });
}

// Specks and a light that flickers a little, in steps, over the pictures (like a lamp over a tabletop set).
export function grain(s, o = {}) {
  const fps = o.fps ?? 10;
  const amount = o.amount ?? 1;
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const step = stepOf(s.t, fps);
    ctx.save();
    ctx.fillStyle = `rgba(255,236,190,${0.025 * Math.max(0, centered(step * 7 + 5)) * amount})`; // light flicker
    ctx.fillRect(0, 0, s.W, s.H);
    const n = Math.round(220 * amount);
    for (let i = 0; i < n; i++) {
      const k = step * 997 + i * 3;
      ctx.fillStyle = hash(k + 2) > 0.5 ? 'rgba(255,255,255,0.09)' : 'rgba(40,20,5,0.09)';
      const size = 1.5 + hash(k + 3) * 2.5;
      ctx.fillRect(hash(k) * s.W, hash(k + 1) * s.H, size, size);
    }
    ctx.restore();
  });
}

// ---------- type on top of the pictures ----------

// The hook near the top: cream clay capitals with a brown edge; *starred* words are orange. Each word tilts a little in steps.
// o: { at (0.2), out, y (0.14 of the height), size (0.1 of the width), fps }
export function title(s, text, o = {}) {
  const fps = o.fps ?? 10;
  const t0 = s.time(o.at ?? 0.2);
  const t1 = o.out === undefined ? t0 + 3.2 : s.time(o.out);
  s.draw({ at: t0, out: t1 + 0.1, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
    const step = stepOf(s.t, fps);
    const ts = step / fps;
    const [px, py] = keys(POP, Math.max(0, ts - t0));
    const leave = clamp((t1 - ts) / 0.2);
    if (leave <= 0) return;
    const size = (o.size ?? 0.1) * s.W;
    ctx.font = `700 ${size}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const raw = text.toUpperCase().split(' ');
    let on = false;
    const words = raw.map((r) => {
      if (r.startsWith('*')) on = true;
      const w = { t: r.replace(/\*/g, ''), hl: on };
      if (/\*[,.;:!?]*$/.test(r)) on = false;
      return w;
    });
    const space = ctx.measureText(' ').width;
    const maxW = s.W * 0.86;
    const lines = [[]];
    let lw = 0;
    for (const w of words) {
      const ww = ctx.measureText(w.t).width;
      if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push({ ...w, w: ww });
      lw += ww + space;
    }
    const y0 = s.H * (o.y ?? 0.14);
    ctx.save();
    ctx.translate(s.cx, y0);
    ctx.scale(px * leave, py * leave);
    let wi = 0;
    lines.forEach((l, li) => {
      const total = l.reduce((a, w) => a + w.w, 0) + space * (l.length - 1);
      let x = -total / 2;
      for (const w of l) {
        const k = step * 31 + wi * 7;
        ctx.save();
        ctx.translate(x + w.w / 2, li * size * 1.2 + centered(k) * 3 * WOBBLE);
        ctx.rotate(centered(k + 1) * 0.025 * WOBBLE);
        ctx.textAlign = 'center';
        outlined(ctx, w.t, 0, 0, size, w.hl ? ORANGE : CREAM);
        ctx.restore();
        x += w.w + space;
        wi++;
      }
    });
    ctx.restore();
  });
}

// A clay plaque (cream, brown edge, a soft shadow) drawn around (0, 0) = its top-left corner at x, y, then `fn` draws inside.
function plaque(ctx, w, h, radius) {
  ctx.fillStyle = 'rgba(30,15,5,0.3)';
  ctx.beginPath(); ctx.roundRect(10, 16, w, h, radius); ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, radius); ctx.fill();
  ctx.lineWidth = Math.max(6, w * 0.012);
  ctx.strokeStyle = BROWN;
  ctx.stroke();
}

// The pop-in of a plaque: its squash and stretch, and a quick shrink when it leaves. Returns [sx, sy] (0 when gone).
function popScale(ts, t0, t1) {
  const [sx, sy] = keys(POP, Math.max(0, ts - t0));
  const q = clamp((t1 - ts) / 0.25);
  return [sx * q, sy * q];
}

// A clay tag at the top left: a year or a place in orange over a name or a title in brown.
// list items: { at, out, kicker: '1976', text: 'The garage' }. Keep them few: one where a new year or a new name appears.
export function plates(s, list, o = {}) {
  const fps = o.fps ?? 10;
  list.forEach((l, idx) => {
    const t0 = s.time(l.at);
    const t1 = l.out === undefined ? t0 + 3 : s.time(l.out);
    s.sfx('pop', t0 + 0.05, { gain: 0.25 });
    s.draw({ at: t0, out: t1 + 0.1, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const step = stepOf(s.t, fps);
      const ts = step / fps;
      const [sx, sy] = popScale(ts, t0, t1);
      if (sx <= 0.001 || sy <= 0.001) return;
      const kick = s.W * 0.06;
      const size = s.W * 0.075;
      const pad = s.W * 0.045;
      ctx.font = `700 ${kick}px ${FONT}`;
      const kw = l.kicker ? ctx.measureText(String(l.kicker).toUpperCase()).width : 0;
      ctx.font = `700 ${size}px ${FONT}`;
      const lines = wrap(ctx, l.text || '', s.W * 0.7);
      const tw = Math.max(...lines.map((ln) => ctx.measureText(ln).width), 0);
      const w = Math.max(kw, tw) + pad * 2;
      const h = pad * 2 + (l.kicker ? kick * 1.2 : 0) + lines.length * size * 1.1;
      ctx.save();
      ctx.translate(s.W * 0.07 + centered(step * 5 + idx) * 2 * WOBBLE, s.H * 0.065);
      ctx.rotate(-0.025 + centered(step * 5 + idx + 1) * 0.008 * WOBBLE);
      ctx.scale(sx, sy);
      plaque(ctx, w, h, size * 0.5);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      let y = pad;
      if (l.kicker) {
        ctx.font = `700 ${kick}px ${FONT}`;
        ctx.fillStyle = '#e0661a';
        ctx.fillText(String(l.kicker).toUpperCase(), pad, y + kick * 0.6);
        y += kick * 1.2;
      }
      ctx.font = `700 ${size}px ${FONT}`;
      ctx.fillStyle = BROWN;
      lines.forEach((ln, i) => ctx.fillText(ln, pad, y + size * 0.55 + i * size * 1.1));
      ctx.restore();
    });
  });
}

// One big number on a clay plaque in the middle of the frame, over a dimmed picture.
// list items: { at, out, value: '$429 million', label: 'Apple buys NeXT' }. Drawn, never made by the picture model.
export function stats(s, list, o = {}) {
  const fps = o.fps ?? 10;
  list.forEach((st) => {
    const t0 = s.time(st.at);
    const t1 = st.out === undefined ? t0 + 3 : s.time(st.out);
    s.sfx('thud', t0 + 0.1, { gain: 0.3 });
    s.draw({ at: t0, out: t1 + 0.1, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const step = stepOf(s.t, fps);
      const ts = step / fps;
      const [sx, sy] = popScale(ts, t0, t1);
      if (sx <= 0.001 || sy <= 0.001) return;
      ctx.save();
      ctx.globalAlpha = clamp((ts - t0) / 0.2) * clamp((t1 - ts) / 0.2);
      ctx.fillStyle = 'rgba(30,15,5,0.4)';
      ctx.fillRect(0, 0, s.W, s.H);
      ctx.restore();
      let size = s.W * 0.15;
      ctx.font = `700 ${size}px ${FONT}`;
      const widest = ctx.measureText(st.value).width;
      if (widest > s.W * 0.7) { size *= (s.W * 0.7) / widest; ctx.font = `700 ${size}px ${FONT}`; }
      const labSize = s.W * 0.06;
      ctx.font = `700 ${labSize}px ${FONT}`;
      const lines = wrap(ctx, st.label || '', s.W * 0.68);
      const w = s.W * 0.82;
      const pad = s.W * 0.05;
      const h = pad * 2 + size * 1.15 + (lines.length ? labSize * 0.5 + lines.length * labSize * 1.15 : 0);
      ctx.save();
      ctx.translate(s.cx + centered(step * 5) * 3 * WOBBLE, s.H * 0.42);
      ctx.rotate(centered(step * 5 + 1) * 0.01 * WOBBLE);
      ctx.scale(sx, sy);
      ctx.translate(-w / 2, -h / 2);
      plaque(ctx, w, h, s.W * 0.06);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${size}px ${FONT}`;
      ctx.fillStyle = '#e0661a';
      ctx.fillText(st.value, w / 2, pad + size * 0.58);
      ctx.font = `700 ${labSize}px ${FONT}`;
      ctx.fillStyle = BROWN;
      lines.forEach((ln, i) => ctx.fillText(ln, w / 2, pad + size * 1.15 + labSize * 0.5 + labSize * 0.58 + i * labSize * 1.15));
      ctx.restore();
    });
  });
}

// The founder's own words on a clay plaque. Only word for word from a reliable source, with who and when.
// list items: { at, out, text, by: 'Steve Jobs, Stanford, 2005' }
export function quotes(s, list, o = {}) {
  const fps = o.fps ?? 10;
  list.forEach((q) => {
    const t0 = s.time(q.at);
    const t1 = q.out === undefined ? t0 + 5 : s.time(q.out);
    s.sfx('pop', t0 + 0.05, { gain: 0.25 });
    s.draw({ at: t0, out: t1 + 0.1, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
      const step = stepOf(s.t, fps);
      const ts = step / fps;
      const [sx, sy] = popScale(ts, t0, t1);
      if (sx <= 0.001 || sy <= 0.001) return;
      ctx.save();
      ctx.globalAlpha = clamp((ts - t0) / 0.2) * clamp((t1 - ts) / 0.2);
      ctx.fillStyle = 'rgba(30,15,5,0.45)';
      ctx.fillRect(0, 0, s.W, s.H);
      ctx.restore();
      const size = s.W * 0.058;
      const by = s.W * 0.038;
      ctx.font = `700 ${size}px ${FONT}`;
      const lines = wrap(ctx, q.text || '', s.W * 0.66);
      const w = s.W * 0.84;
      const pad = s.W * 0.06;
      const h = pad * 2 + s.W * 0.1 + lines.length * size * 1.2 + (q.by ? by * 2 : 0);
      ctx.save();
      ctx.translate(s.cx + centered(step * 5) * 3 * WOBBLE, s.H * 0.42);
      ctx.rotate(centered(step * 5 + 1) * 0.008 * WOBBLE);
      ctx.scale(sx, sy);
      ctx.translate(-w / 2, -h / 2);
      plaque(ctx, w, h, s.W * 0.06);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ORANGE;
      ctx.font = `700 ${s.W * 0.2}px ${FONT}`;
      ctx.fillText('“', w / 2, pad + s.W * 0.06);
      ctx.fillStyle = BROWN;
      ctx.font = `700 ${size}px ${FONT}`;
      lines.forEach((ln, i) => ctx.fillText(ln, w / 2, pad + s.W * 0.12 + size * 0.6 + i * size * 1.2));
      if (q.by) {
        ctx.fillStyle = '#e0661a';
        ctx.font = `700 ${by}px ${FONT}`;
        ctx.fillText(String(q.by).toUpperCase(), w / 2, h - pad - by * 0.4);
      }
      ctx.restore();
    });
  });
}

// ---------- captions ----------

// The narration two or three words at a time, in BIG bold white capitals with a thick black edge, in the lower middle
// of the frame; the word being spoken is lit yellow, and each new group pops in with a small squash.
// o: { y (0.66), size (0.09 of the width), maxWords (3), maxChars (16), lit (yellow; null = all white), from, until, fps,
//       upper (true; false keeps the case of the script), breakOn (/[.!?]$/: a word ending like this ends the group), pop (true; false = no squash),
//       edge (0.26: the black edge, as a part of the size; 0 = none), weight (800), lineAt (the pixel y of the text; overrides y) }
export function captions(s, o = {}) {
  const fps = o.fps ?? 10;
  const maxChars = o.maxChars ?? 16;
  const maxWords = o.maxWords ?? 3;
  const lit = o.lit === undefined ? YELLOW : o.lit;
  const upper = o.upper ?? true;
  const breakOn = o.breakOn ?? /[.!?]$/;
  const edge = o.edge ?? 0.26;
  const cased = (t) => (upper ? t.toUpperCase() : t);
  const chunks = [];
  let cur = null;
  for (const w of s.words || []) {
    // the speech check splits "Europe's" into "Europe" and "'s": put them back together
    if (/^['’]/.test(w.text) && cur) {
      const last = cur.w[cur.w.length - 1];
      last.text += cased(w.text.replace(/[.,;:!?"“”]+$/g, ''));
      last.end = w.end;
      cur.len += w.text.length;
      cur.raw = w.text;
      continue;
    }
    const shown = cased(w.text.replace(/[.,;:!?"“”]+$/g, '').replace(/^["“”]+/g, ''));
    if (cur && (cur.len + 1 + shown.length > maxChars || cur.w.length >= maxWords || breakOn.test(cur.raw))) { chunks.push(cur); cur = null; }
    if (!cur) cur = { w: [], len: 0, raw: '' };
    cur.w.push({ text: shown, start: w.start, end: w.end });
    cur.len += (cur.len ? 1 : 0) + shown.length;
    cur.raw = w.text;
  }
  if (cur) chunks.push(cur);
  s.draw({ at: -1, enter: 'none', sfx: false }, (ctx) => {
    const t = s.t;
    if (o.until !== undefined && t >= s.time(o.until)) return;
    if (o.from !== undefined && t < s.time(o.from)) return;
    let c = null;
    for (let i = 0; i < chunks.length; i++) {
      const next = chunks[i + 1];
      const last = chunks[i].w[chunks[i].w.length - 1].end;
      if (t >= chunks[i].w[0].start - 0.04 && t < (next ? next.w[0].start - 0.04 : last + 0.5)) { c = chunks[i]; break; }
    }
    if (!c) return;
    let size = (o.size ?? 0.09) * s.W;
    const fit = () => {
      ctx.font = `${o.weight ?? 800} ${size}px ${SANS}`;
      const space = ctx.measureText(' ').width + size * (edge ? 0.12 : 0.04); // the thick outline eats the gap, so add one
      const widths = c.w.map((w) => ctx.measureText(w.text).width);
      return { space, widths, total: widths.reduce((a, b) => a + b, 0) + space * (c.w.length - 1) };
    };
    let m = fit();
    if (m.total > s.W * 0.9) { size *= (s.W * 0.9) / m.total; m = fit(); }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const [px, py] = o.pop === false ? [1, 1] : keys([[0, 0.8, 1.2], [0.1, 1.12, 0.9], [0.2, 0.97, 1.03], [0.3, 1, 1]], Math.max(0, stepOf(t, fps) / fps - (c.w[0].start - 0.04)));
    ctx.save();
    ctx.translate(s.cx, o.lineAt ?? s.H * (o.y ?? 0.66));
    ctx.scale(px, py);
    ctx.lineJoin = 'round';
    let x = -m.total / 2;
    c.w.forEach((w, i) => {
      const on = lit && t >= w.start - 0.02 && t < w.end + 0.1;
      if (edge) {
        ctx.lineWidth = size * edge;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(w.text, x, 0);
      }
      const fill = on ? lit : '#ffffff';
      ctx.lineWidth = size * (edge ? 0.05 : 0.025); // an extra stroke in the fill color makes the one heavy weight we have heavier
      ctx.strokeStyle = fill;
      ctx.strokeText(w.text, x, 0);
      ctx.fillStyle = fill;
      ctx.fillText(w.text, x, 0);
      x += m.widths[i] + m.space;
    });
    ctx.restore();
  });
}

// ---------- the letterbox layout: a plain title bar above the picture, and a word in the caption band ----------

// A plain bold title in the top bar (white, with `*starred*` words in gold). An emoji may end a line.
// o: { lines: ['Pyaar ka ek', '*khatarnaak* jaal 💀'], y (pixel y of the first line), size (pixel size), gap (line height, 1.3), at (0), out, gold }
export function barTitle(s, o = {}) {
  const t0 = s.time(o.at ?? 0);
  const t1 = o.out === undefined ? s.dur + 1 : s.time(o.out);
  const gold = o.gold ?? '#f0c14b';
  s.draw({ at: t0, out: t1, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
    const size = o.size ?? s.W * 0.065;
    const y0 = o.y ?? s.H * 0.16;
    ctx.font = `800 ${size}px ${SANS}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    (o.lines || []).forEach((line, li) => {
      const words = line.split(' ').map((raw) => ({ t: raw.replace(/\*/g, ''), hl: raw.includes('*') }));
      const space = ctx.measureText(' ').width;
      const widths = words.map((w) => ctx.measureText(w.t).width);
      let x = s.cx - (widths.reduce((a, b) => a + b, 0) + space * (words.length - 1)) / 2;
      words.forEach((w, i) => {
        ctx.fillStyle = w.hl ? gold : '#ffffff';
        ctx.fillText(w.t, x, y0 + li * size * (o.gap ?? 1.3));
        x += widths[i] + space;
      });
    });
  });
}

// A grey pill with a line of text, and a gold URL under it, in the top bar (the end call to action).
// o: { text: 'Visit our website 🔗', url: 'www.example.com', at, out, y (pixel y of the pill), size }
export function urlBar(s, o = {}) {
  const t0 = s.time(o.at ?? 0);
  const t1 = o.out === undefined ? s.dur + 1 : s.time(o.out);
  s.draw({ at: t0, out: t1, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
    const size = o.size ?? s.W * 0.05;
    const y = o.y ?? s.H * 0.135;
    ctx.font = `700 ${size}px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const w = ctx.measureText(o.text || '').width + size * 1.1;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.roundRect(s.cx - w / 2, y - size * 0.8, w, size * 1.6, size * 0.45); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(o.text || '', s.cx, y);
    if (o.url) {
      ctx.font = `700 ${size * 0.72}px ${SANS}`;
      ctx.fillStyle = '#f0c14b';
      ctx.fillText(o.url, s.cx, y + size * 1.45);
    }
  });
}

// A big gold serif word or two in the caption band (for example "Join now" at the very end).
// o: { text, at, out, y (pixel y), size (pixel size) }
export function bigWord(s, o = {}) {
  const t0 = s.time(o.at ?? 0);
  const t1 = o.out === undefined ? s.dur + 1 : s.time(o.out);
  s.draw({ at: t0, out: t1, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
    const a = clamp((s.t - t0) / 0.25);
    const size = o.size ?? s.W * 0.1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `700 ${size}px "Instrument Serif", "Playfair Display", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f0c14b';
    ctx.fillText(o.text || '', s.cx, o.y ?? s.H * 0.8);
    ctx.restore();
  });
}

// The last seconds: a dark card with a clay plaque that says what the pictures are.
// end: { title: 'MADE OF CLAY', lines: ['The pictures are AI-made claymation,', 'not photographs.'] }   (null draws nothing)
export function endCard(s, end, o = {}) {
  if (!end) return;
  const fps = o.fps ?? 10;
  const t0 = o.at === undefined ? Math.max(0, s.dur - END_SECONDS) : s.time(o.at);
  s.draw({ at: t0, out: s.dur, enter: 'none', exit: 'none', sfx: false }, (ctx) => {
    const step = stepOf(s.t, fps);
    const ts = step / fps;
    const a = clamp((ts - t0) / 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a * 0.82;
    ctx.fillStyle = '#1d1208';
    ctx.fillRect(0, 0, s.W, s.H);
    ctx.restore();
    const [sx, sy] = keys(POP, Math.max(0, ts - t0 - 0.15));
    if (sx <= 0.001 || sy <= 0.001) return;
    const tsize = s.W * 0.07;
    const lsize = s.W * 0.05;
    ctx.font = `700 ${lsize}px ${FONT}`;
    const lines = (end.lines || []).flatMap((l) => wrap(ctx, l, s.W * 0.66));
    const w = s.W * 0.8;
    const pad = s.W * 0.06;
    const h = pad * 2 + tsize * 1.2 + lines.length * lsize * 1.25;
    ctx.save();
    ctx.translate(s.cx, s.H * 0.45);
    ctx.scale(sx, sy);
    ctx.translate(-w / 2, -h / 2);
    plaque(ctx, w, h, s.W * 0.06);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${tsize}px ${FONT}`;
    ctx.fillStyle = '#e0661a';
    ctx.fillText(String(end.title || '').toUpperCase(), w / 2, pad + tsize * 0.6);
    ctx.font = `700 ${lsize}px ${FONT}`;
    ctx.fillStyle = BROWN;
    lines.forEach((ln, i) => ctx.fillText(ln, w / 2, pad + tsize * 1.2 + lsize * 0.65 + i * lsize * 1.25));
    ctx.restore();
  });
}
