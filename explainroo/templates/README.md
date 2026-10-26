# Templates

Copy one with `scripts/new-video.sh <template> <name>` (it makes `videos/<name>`).

| Template | For | Visuals | Needs from you |
|---|---|---|---|
| `starter` | explainroo's own blank project | drawn shapes and text | nothing |
| `history-map` | places and dates: a satellite map, a flying camera, flags, year tags | drawn from free NASA and Natural Earth data | nothing (today's borders only) |
| `tech-explainer` | how software works: neon-green outlined boxes on charcoal, one idea at a time (a phone app, a server, a database, requests and responses) | drawn by the kit in `lib/kit.js`, no pictures needed | nothing |
| `book-summary` | a book in under a minute: a cover card, pictures with slow moves, optional subtitles, three numbered takeaways | pictures or clips you supply (or Pollinations, local, or OpenRouter pictures) | the pictures or clips |
| `motivation` | stoic and motivational shorts: a quote that appears word by word with glowing key words, then paintings with one-word captions, over a dark cinematic music bed | paintings you supply (or Pollinations, local, OpenRouter) | the paintings |
| `sticker-pop` | popup explainers: flat colored scenes where stickers, paper notes, number chips and bold words pop in one after another with a click, scenes push each other away | AI sticker pictures cut out of a white background (Pollinations, local, OpenRouter), everything else drawn by `lib/pop.js` | the sticker pictures |
| `dark-history` | cinematic history shorts: full-frame dark oil paintings with a slow push, a thud at every cut, embers, a hook line and two or three word italic captions with the spoken word lit yellow, over a dark cinematic music bed | paintings you supply (or Pollinations, local, OpenRouter) | the paintings |
| `dark-history-hindi` | the dark-history look in **Hindi**: Hindi narration, Devanagari captions and hook, `epic` war music; plus `scripts/series.mjs`, which makes **many videos at once** from one series file (`series/*.md`: a title, Hindi narration and an English painting prompt per beat) | paintings made for you by `series.mjs images` (local, Perchance and Cloudflare share one queue) | a series file |
| `founder-story` | founder and biography shorts: real, openly licensed photographs (found on Wikimedia Commons) with slow Ken Burns moves and soft dissolves, a name and year plate, one big number, one quote card, word-lit captions, an end card crediting the photographers, over an inspiring piano-and-strings music bed that builds | photographs found for you by `scripts/find-photos.mjs` (no AI pictures, no stickers) | nothing (you check every photo) |
| `story-shots` | "how it happened" stories: a storyboard of pictures or clips, lit captions, a title card | pictures or clips you supply (or paid AI pictures through OpenRouter) | the pictures or clips |

Each template has a `README.md` (how to use) and a `TEMPLATE.md` (the style rules
for an AI agent).
