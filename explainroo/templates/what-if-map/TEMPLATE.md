# what-if-map: rules for making a video with this template

For a coding agent or a person. Read `AGENTS.md` and `README.md` here first.

## The style (measured from the reference, "What if all Spanish countries united?")

52 seconds, 9:16, 30 fps, about 2.7 words a second (this template runs about 3 words a second), one narrator, no silence between sentences.

- **One continuous camera** over a dark satellite Earth. It never stops: a new view about every 2 to 4 seconds,
  slow pushes and drifts, a few zoom-ins on one country. No hard cuts, except one cut to a white paper scene.
- **Hook as a question** in the first 3 seconds: "What if [group of countries] became one nation?"
- **Order of beats:** hook, count and name the members (flags appear as named) → the combined size (superpower,
  continents, people) → one big number with a rolling counter → a ranking against the biggest economies, with a
  podium → culture (one emoji or fact per country) → pins for "many traditions" → **"However"** turn: differences
  (income, systems, dialects) with two colours side by side and RICH / POOR style tags → closing question
  "Would this ever work?".
- **Captions:** 1 to 3 words, bold white with a thick black outline, low in the frame (about 86% down), small.
- **Overlays are few and exact:** a flag fill per named country, pins, emoji (faces, a rose), a counter, bars. No
  paragraphs on screen.
- **Colours:** members in gold/orange or flags; the "red glow" for what the nation would span; blue vs red for a
  comparison; green for money and "rich"; red for "poor".
- **Pace:** fast but clear. English only. `pace` 1.15, `speed` 1.05, `am_michael`, sentences of 6 to 12 words, a new
  view about every 2 seconds, captions of 1 or 2 words. Do not go above `pace` 1.3 or the numbers stop being understood.
- **Sound:** voice up front (about -20 LUFS in the reference), a very quiet bed, a whoosh on each flight.

## What keeps people watching (built into the kit; use all of it)

Short-form map videos hold viewers with a cut or a change every 2 seconds, a question they wait to see answered,
one number that lands, and a turn. The kit has a device for each. The sample and the Bharat videos use them all.

| Device | Call | Why |
|---|---|---|
| **Hook on screen** | `k.hook('What if *X* vanished?')` | the first 3 seconds decide the swipe; big text, key words yellow, a thud |
| **Zoom punch on every beat** | `fly(s, keys, { beats: MARKS })` | a 4% punch and a tiny shake on each marker reads as an edit cut |
| **Camera never freezes** | `fly()` drifts by default (`drift: 0` to stop) | a still frame feels like a pause |
| **Glow, ripple, pop** | `fill`, `pin`, `emoji` do it on arrival | the eye finds the new thing without a label |
| **Yellow numbers in captions** | `whatIfCaptions()` lights digits and `lit: [...]` | the fact is what people remember |
| **One big number** | `k.stat(500000000, { label: 'people' })` | the "wow" moment, with a riser and a ding |
| **The turn** | `k.twist(t('#however'))` | riser, red flash, thud: the viewer feels the story change |
| **Film grade** | `k.grade()` | warmer middle, cool edges: cinematic, not a web map |
| **Progress bar** | `k.progress()` | people stay when they can see the end is close |
| **Follow pill** | `k.follow('Follow for more')` | the ask, in the last 3 seconds, after the payoff |
| **Sound on everything** | automatic (`sound: false` to mute one) | silence under a pop feels broken |

Keep it to one hook, one stat, one twist per video. Two twists is noise. The hook leaves after about 3 seconds.

## Steps

1. **Research** the facts (member list, population, GDP with the year and source, one culture fact per country).
   Never invent a number. Say "about" where sources differ. Count members exactly (20 official Spanish countries is
   not 21; Puerto Rico is a territory).
2. `scripts/new-video.sh what-if-map <name>`.
3. **Write `script.md`**: one scene `story` (`{transition=cut hold=1.5}`), 130 to 170 words (for 40 to 55 seconds at this pace), a `[#marker]` at every
   idea change (about every 2 to 3 seconds). `[loud]` on the hook and the key number. Use `{shown|spoken}` for
   names the voice misreads. Put sources in a `>` note.
4. **Write `scenes.js`** following the numbered sections of the sample: `fly` keys on the markers, `basemap`, fills,
   labels, pins, emoji, counter, ranking, then `credit`, `vignette`, `whatIfCaptions` last, then sounds.
   Put every marker time into `beats`, the hook first, the twist at the "But" sentence, `stat` on the key number,
   `grade`, `progress` and `follow` with the screen layers. **Every overlay gets an `out`.** Never put two flights within 1.5 seconds of each other (the later one wins and
   the camera ends up somewhere else).
5. `voice`, `check` (fix everything), `sheet --every 2.5`, look at it, `still` at the busy moments, `render`, `verify`.
6. Tell the user the files, the sources of the numbers, and that you could not hear the audio.

## Rules for the map

- Today's borders only; label them "today's" if you tell a history story. Disputed places stay neutral.
- `setParallel(20)` for Atlantic or Spanish-world videos; 45 Europe/US; 0 Africa; -30 for South America only.
- Spans: world 130, an ocean 100, a continent 60, a country 12 to 20. Soft past span 8.
- The main subject sits at the middle of the frame (focusY 0.46); captions use the bottom, so keep labels
  within 180 px of the middle.
- Emoji and labels: at most one idea per marker.

## Mistakes to avoid

- Flags or fills left on after the narration moves on. Always `out`.
- A ranking or counter that sits under a flag fill and cannot be read: end the flags first.
- Wrong numbers. A stat with no source is cut.
- Captions bigger than 70 px or inside the top third.
- Two camera flights at once.
