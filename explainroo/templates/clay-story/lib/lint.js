// Checks for shots.js, shared by scripts/check-shots.mjs and scripts/shot-images.mjs. Nothing here needs the engine.
// lint(mod, { words, language }) -> { errors: [], warnings: [] }
//   mod:   the module shots.js exports (SHOTS, CAST, SETS, promptFor, describe)
//   words: [{ text, start, end }] of the narration (from the timeline), optional; with it the words, the durations and the coverage are checked
export const MIN_SHOT = 2;
export const MAX_SHOT = 3;
// Words that describe a person. A cast member is always written as {key}, so these words may not appear in a scene by hand
// (that is how one character turns from a child into a grown-up between pictures). Set `crowd: true` on a shot to allow them.
const PEOPLE = /\b(young|old|elderly|boy|boys|girl|girls|man|men|woman|women|child|children|kid|kids|baby|teen|teenager|adult|lady|guy|grandfather|grandmother|grandpa|grandma|father|mother)\b/gi;
const STOP = new Set('about after again around because before being could every from have into just like made make more only other over really said some than that their them then there these they this those through very want were what when where which while with would your'.split(' '));

export function lint(mod, { words = null, language = 'en' } = {}) {
  const errors = [];
  const warnings = [];
  const { SHOTS, CAST, SETS, promptFor } = mod;
  const err = (n, m) => errors.push(n ? `shot ${n}: ${m}` : m);
  const warn = (n, m) => warnings.push(n ? `shot ${n}: ${m}` : m);
  if (!Array.isArray(SHOTS) || !SHOTS.length) { err(0, 'SHOTS is empty: run  node scripts/plan-shots.mjs <project>  after `voice`'); return { errors, warnings }; }
  for (const [k, c] of Object.entries(CAST)) {
    for (const f of ['noun', 'short', 'age', 'height', 'build', 'face', 'hair', 'outfit']) if (c[f] === undefined || c[f] === '') err(0, `CAST.${k} has no "${f}"`);
    if (typeof c.height !== 'number' || c.height <= 0 || c.height > 1.05) err(0, `CAST.${k}.height must be a number above 0 and at most 1 (1 = the tallest grown-up)`);
  }
  let prevWord = -1;
  SHOTS.forEach((shot, i) => {
    const n = shot.n ?? i + 1;
    if (shot.n !== i + 1) err(n, `shots must be numbered 1, 2, 3 ... in order (this one is at position ${i + 1})`);
    if (typeof shot.word !== 'number') err(n, 'has no "word" (the index of its first narration word)');
    else {
      if (i === 0 && shot.word !== 0) err(n, 'the first shot must start at word 0');
      if (shot.word <= prevWord) err(n, `starts at word ${shot.word}, not after the previous shot (${prevWord})`);
      prevWord = shot.word;
    }
    if (!shot.says) err(n, 'has no "says" (the narration of this shot)');
    for (const f of ['shot', 'action']) if (!shot[f] || /^TODO/.test(shot[f])) err(n, `"${f}" is not written yet`);
    if (!Array.isArray(shot.who)) err(n, '"who" must be a list of CAST keys (an empty list for a place or an object)');
    for (const k of shot.who || []) if (!CAST[k]) err(n, `"${k}" is in "who" but not in CAST`);
    if ((shot.who || []).length > 3) warn(n, 'more than 3 characters in one picture: the model will mix them up; use 2 if you can');
    if (shot.action && !/^TODO/.test(shot.action)) {
      const used = [...shot.action.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      for (const u of used) if (!CAST[u] && !SETS[u]) err(n, `{${u}} is neither in CAST nor in SETS`);
      for (const k of shot.who || []) if (!used.includes(k)) err(n, `${k} is in "who" but {${k}} is not in the action`);
      for (const u of used) if (CAST[u] && !(shot.who || []).includes(u)) err(n, `{${u}} is in the action but not in "who"`);
      const bare = shot.action.replace(/\{\w+\}/g, ' ');
      const hits = [...new Set((bare.match(PEOPLE) || []).map((w) => w.toLowerCase()))];
      if (hits.length && !shot.crowd) err(n, `the action describes people by hand ("${hits.join('", "')}"). Write a cast member as {key} so the age, height and clothes never change; for a crowd or an extra add  crowd: true  to the shot`);
      const count = bare.trim().split(/\s+/).length;
      if (count > 45) warn(n, `the action has ${count} words; a picture model follows about 40. Show one moment.`);
      try { promptFor(shot); } catch (e) { err(n, e.message); }
    }
    if (shot.motion !== undefined && !['push', 'pushHard', 'pull', 'pullHard', 'slideLeft', 'slideRight', 'rise', 'fall', 'drift', 'still'].includes(shot.motion)) err(n, `motion "${shot.motion}" is not a camera move`);
  });
  if (words) {
    const t = (j) => (j === 0 ? 0 : Math.max(0, words[j].start - 0.06));
    SHOTS.forEach((shot, i) => {
      const n = shot.n ?? i + 1;
      if (typeof shot.word !== 'number') return;
      if (shot.word >= words.length) { err(n, `starts at word ${shot.word} but the narration has only ${words.length} words`); return; }
      const next = SHOTS[i + 1];
      const end = next && typeof next.word === 'number' && next.word < words.length ? next.word : words.length;
      const slice = words.slice(shot.word, end).map((w) => w.text).join(' ');
      if (shot.says && slice !== shot.says) err(n, `its "says" no longer matches the narration (now: "${slice}"). Run  node scripts/plan-shots.mjs <project>`);
      const last = i === SHOTS.length - 1;
      const d = (last ? words[words.length - 1].end + 0.5 : t(end)) - t(shot.word);
      if (!last && (d < MIN_SHOT - 0.12 || d > MAX_SHOT + 0.12)) err(n, `lasts ${d.toFixed(1)} s; a picture must last ${MIN_SHOT} to ${MAX_SHOT} s. Run  node scripts/plan-shots.mjs <project>`);
      if (last && d > MAX_SHOT + 0.12) err(n, `the last picture lasts ${d.toFixed(1)} s of speech; at most ${MAX_SHOT} s`);
      // does the picture show what the words say? (English only: a word of the narration that the picture never mentions)
      if (language === 'en' && shot.action && !/^TODO/.test(shot.action)) {
        const text = `${shot.shot} ${shot.action} ${SETS[shot.set] || shot.set || ''} ${(shot.who || []).map((k) => Object.values(CAST[k] || {}).join(' ')).join(' ')}`.toLowerCase();
        const miss = [...new Set((shot.says.toLowerCase().match(/[a-z]{5,}/g) || []).filter((w) => !STOP.has(w)))].filter((w) => !text.includes(w.slice(0, Math.max(4, w.length - 3))));
        if (miss.length >= 2) warn(n, `the narration says "${shot.says}" but the picture never mentions: ${miss.join(', ')}. Does it show what the words say?`);
      }
    });
  }
  return { errors, warnings };
}
