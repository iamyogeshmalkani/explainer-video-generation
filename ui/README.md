# Explainer Studio

A small local web page for making videos: type a topic, pick a template, press **Make video**.

```bash
node ui/server.mjs        # from the repository root, then open http://127.0.0.1:4747
```

It needs the normal setup (`sh setup.sh`, see SETUP.md) and the `claude` command (Claude Code, logged in).
There are no extra packages to install.

## What happens when you press the button

1. The server starts Claude Code in headless mode inside `explainroo/` with a brief: the topic, the template,
   the length, the voice and your style notes. It is told to read `AGENTS.md` and the template's `README.md`
   and `TEMPLATE.md` and follow them.
2. Claude creates `explainroo/videos/<topic-slug>/`, writes `script.md`, `scenes.js` and `shots.js`, makes the
   narration, draws the pictures, runs `check`, looks at the frames, fixes problems, renders and verifies.
3. The page shows the steps and a live activity log. When `out/video.mp4` exists it plays it and offers the MP4,
   subtitles and cover. The **Library** lists every finished video in `explainroo/videos/`.

Jobs run one at a time; others wait in line. **Cancel** stops the agent.

## Options

| Option | Meaning |
|---|---|
| Length | Short is about 30 s, Standard 45 s, Long 75 s (a template's own range wins). |
| Voice | Any English Kokoro voice, run on this computer. |
| Pictures | **Local** draws with mflux on this Mac: free and private, about 2 minutes a picture. **Perchance** drives perchance.org in a Chrome window of its own (no key; about 25 s a picture). **Cloudflare Workers AI** needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in `explainroo/.env` (the option is disabled until both are set). **Pollinations** needs credit and a `POLLINATIONS_API_KEY`. **Local + Perchance** and **All three** run the makers at the same time, each taking the next missing picture (the default is Local + Perchance). Templates that draw everything in code ignore it. |
| Style notes | Free text, for example "muted, mature colors" or "serious tone". |
| Your script, outline or sources | Optional. Paste your own narration and choose **As the script** (kept word for word; it is only split into scenes and marked up, and the length setting is ignored) or **As an outline** (key points, facts or links that the script must cover; links are read for facts). Leave it empty and the script is written for you. |

## Editing a finished video

Every video in the **Library** has an **Edit** button (the player has one too). The editor has four tabs:

| Tab | What you can do |
|---|---|
| Script | Change the words. A live check tells you the word count, about how long it runs, and refuses a script that would break the video (a `[#marker]` that the pictures wait for is missing, a tag is not closed). Only the scenes whose words changed are voiced again. |
| Settings | Title, voice (with a sample button), speed, music style and volume, and how much louder the `[loud]` words are. |
| Pictures | Thumbnails of the video's pictures. **Replace...** swaps one for a picture of your own (JPEG, PNG or WebP, up to 25 MB). **Redo with Claude** jumps to the Ask Claude tab with that picture named. A real photo you replace is taken out of the credits. |
| Ask Claude | Describe a change in your own words ("make the hook stronger", "redo picture shot05 as a sunrise", "add a part about 2008"). Claude edits this video only, keeping the rest, then checks and re-renders it. |

**Save** keeps your changes; **Save and re-render** also rebuilds the video without the agent (voice for changed scenes, check, render, verify), which is quick.
**Undo last change** goes back one step: every save, picture swap and Ask Claude request first keeps a copy of the files it may change in
`build/edit-backups/` (the last 15). The previous render is kept as `out/video.prev.mp4`. A video that is being worked on cannot be edited until it finishes.

## About the Perchance window

Perchance has no API, so explainroo opens a normal Chrome window with its own profile (`~/.cache/explainroo/chrome-perchance`;
your own Chrome tabs and logins are not touched) and fills in the page for you. It is behind a Cloudflare "verify you are
human" check: that is not bypassed. It usually passes by itself; if a box appears, tick it in that window once and the run
continues. Pictures are made one at a time with a pause between them, because the site is free and paid for by its ads.
You can close the window at any time; it reopens when needed. The other candidate from each run is kept in
`build/images/alternatives/`.

## Engaging scripts

Every brief asks for a hook in the first 3 seconds, a new concrete fact in every sentence, a question raised early and answered
late, one turn, a payoff ending, and a read-back as a viewer before the voice is made. The same standard is in
`explainroo/AGENTS.md`.

## Voice emphasis

Every video gets louder narration (about 4 dB) on the focus words: the intro hook, key names, numbers and the
closing point. The agent marks them in `script.md` with `[loud]...[/loud]`; the rule lives in `explainroo/AGENTS.md`
and is repeated in every brief.

## Good to know

- Each video uses your Claude Code plan, and takes roughly 10 to 25 minutes (longer with local pictures).
- The server listens on `127.0.0.1` only and refuses other Host or Origin headers. The agent can run `node`
  commands and edit files under `explainroo/`, so do not expose the port to a network.
- Set `PORT=5000` to change the port, or `CLAUDE_BIN=/path/to/claude` if the command is not on your PATH.
- Quality is the agent's judgement: open the result and check names and facts before you publish. It cannot hear
  the audio.
