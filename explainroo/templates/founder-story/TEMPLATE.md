# founder-story: rules for making a video with this template

For a coding agent (Claude Code and others) or a person. Read `AGENTS.md` in the explainroo folder for the general rules and
`README.md` here for the steps and the kit. This file holds the rules that make a founder or biography video work.

## What this template is

A documentary short (60 to 90 seconds, vertical) about one founder, told with **real photographs** (no stickers, no drawings, no
AI pictures of real people), a calm narrator, an inspiring piano-and-strings music bed that builds, and a few plain overlays:
a name or year plate, one big number, one quote, and word-lit captions. The photographs come from Wikimedia Commons, only the ones
that may be reused (public domain, CC0, CC BY, CC BY-SA), and the credits are written for you.

## How popular biography videos are written (research, and how this template uses it)

Honest note first: the sources are creator guides and storytelling articles, not studies of one channel's scripts. I could not
find a first-hand description of how channels such as Biographics write. Treat this as a consistent practitioner consensus, not as
measured fact. The sources: videotoblog.ai (script structure and re-hooks), thevisualcommunicationguy.com (four chapters for a
biography), doc.appstate.edu (three acts for documentaries), ottopohl.com and Fast Company (founder story: ordinary world,
disruption, struggle, win; the "why" before the timeline; an outer and an inner journey), Tory Burch Foundation (hero's journey for
a founder), Dan Harmon's story circle (you, need, go, search, find, take, return, change), overseeros.com and outlierkit.com (hooks
and open loops), shoots.video and masterclass.com (Ken Burns moves on archival photos), and stock-music listings
(shockwave-sound.com, motionarray.com) for the sound of "inspiring documentary" music.

What they agree on:

1. **Start at the most interesting moment, not at the birth.** Open with the surprising or dramatic fact (a firing, a rejection,
   a near collapse) and prove it within seconds. No greeting, no "in this video", no channel intro. Backstory comes after the hook.
2. **Four chapters** carry a biography: the early formation, the breakthrough, the conflict or reinvention, the legacy. They give
   the narration and the pictures a map, so the video does not wander into side stories.
3. **Lead with the "why"**: what the founder was frustrated by, wanted or feared. A list of milestones is not a story.
4. **Show the cost.** The story only moves people if there is a real failure, a loss or a doubt in the middle, and the way back.
   The story-circle version: a comfortable start, a need, a leap into the unknown, a hard search, a find, a price paid, a return,
   and a changed person.
5. **Open loops and re-hooks.** Raise a question early and answer it late; at each chapter turn remind the viewer of the question
   ("But in 1985..."). Something should change about every 6 to 20 seconds: a new fact, a new emotion, a new picture.
6. **A measured tone.** For real people, sensational wording and music lose trust. State facts plainly and let them carry the weight.
7. **Pay off the hook**, then end on one plain sentence that sums up what the story means.

### The beats for 60 to 90 seconds (about 130 to 200 words)

| Beat | Seconds | What it does |
|---|---|---|
| Hook | 0 to 5 | The dramatic moment in one sentence ("At thirty, Steve Jobs was fired from the company he started."). The question the video will answer. |
| Origin | 5 to 20 | Who, where, what they wanted, in one or two concrete facts. The first picture of the person or the first product. |
| Breakthrough | 20 to 35 | The idea that worked, with one number or date. |
| Conflict | 35 to 55 | The failure, the fight or the fall. Re-hook at the start ("But..."). The cost, said plainly. |
| Reinvention | 55 to 75 | What they did next, and the turn that brought them back or made them. |
| Legacy and payoff | 75 to 90 | What it became (one number or product), the founder's own words if you have them word for word, the closing sentence. |

Write the hook and the ending first, then fill the middle so the video keeps its promise.

## The look

- **Real photographs only.** One photograph per beat, 3 to 5 seconds each, a slow Ken Burns move (about 9% at most; the kit does it),
  a soft dissolve into the next. Faces: give `focus: [x, y]` so the crop keeps the face. Wide photos and objects: `fit: 'fit'`.
  A panorama: `sweep`.
- **The photo must show what the line says.** If no free photo of that moment exists (this is common for the 1980s to 2000s), show
  an object, a place or a document from the story, or the person at another time with the year on a plate. **Never pass a later
  photo of a person off as the moment itself.** Never use an AI picture of a real person.
- **Few overlays.** A plate (year, role, place) when a new name or year appears; at most one big number (`STATS`); at most one quote
  (`QUOTES`), only word for word from a reliable source, with who and when. No emoji, no icons, no stickers.
- **Captions** show the narration 3 or 4 words at a time with the spoken word lit in gold. Keep everything important above `y: 0.78`.
- **Credits.** `find-photos.mjs` writes `credits.md`; paste it into the video description. The end card names the photographers.

## The sound

- Music is the `inspiring` style: a sparse piano arpeggio that grows, legato strings, a warm bass, then glockenspiel and a soft beat
  at the climax (about 96 bpm, major key). It builds across the video the way the story does. `music.volume` 0.4 sits under the voice;
  lower it if `verify` says the narration is understood under 95%.
- No sound effects (`"sfx": false`). A documentary does not click.
- Voice: a warm, steady voice (`bm_george` here). Use `[loud]...[/loud]` on the hook words, the key number and the closing line.

## Steps

1. **Research the founder.** Use WebSearch. Collect 12 to 16 verified facts with dates. Never invent numbers or quotes. Leave out what
   sources disagree on (a price, a headcount), or say "about". Quotes must be word for word from a transcript.
2. **Copy the template:** `scripts/new-video.sh founder-story <name>`.
3. **Write `script.md`** using the beats above. A `[#s1]`, `[#s2]` ... marker at every picture change. Put the facts you used in a `>` note.
4. **Write `shots.js`:** one shot per marker with a `query` (the NAME of the person, place or object, plus one or two facts), `LABELS`,
   one `STATS`, one `QUOTES` if you have a verified quote, and `HOOK`.
5. **Voice:** `node bin/explainroo.js voice videos/<name>`. Fix `{shown|spoken}` names the check cannot confirm.
6. **Photos:** `node videos/<name>/scripts/find-photos.mjs videos/<name>`. Then **open every photo** and check it shows what its line says,
   that it is the right person, and that it is not a duplicate. Fix with `--only 6 --pick 6=2`, `--only 6 --redo`, a better `query`,
   an `alt` list, `avoid: ['wrong name']`, or `--search "words"` to look first.
7. **Check and look:** `check`, then `sheet --every 4`. Is each photo sharp, is the face in the crop, does a plate or caption cover a face,
   is the bottom third free? Fix and look again.
8. **Render and verify:** `render --workers 2`, `verify`. Report the files, paste `credits.md` into the description, and say that you
   could not hear the audio.

## Mistakes to avoid

- Starting at the birth. Start at the dramatic moment.
- A story of only wins. Show the failure and what it cost.
- A photo of the wrong person: searches match words in a title (a photo of someone else "at" the founder's event). Look at every photo.
- The same photo twice in a row, or a stack of near-identical object photos. Change the subject or the distance.
- A photo of a different year used as the moment. See the rule above.
- Long quotes on screen. One short quote, a few lines at most.
- Inventing a quote or a number because it sounds right. Leave it out.
- A figure that sources disagree on, stated as fact.
- Too many plates. A plate for every shot is noise; use them where a new name or year needs it.
