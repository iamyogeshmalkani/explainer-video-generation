# About the explainroo copy in this repository

`explainroo/` is a copy of https://github.com/vincentsch/explainroo (MIT license,
Copyright (c) 2026 Vincent Schmalbach; the license file is in `explainroo/LICENSE`),
taken at upstream commit **e95232c** ("README: news of the 0.4.1 release", explainroo 0.4.1).
It is vendored as plain files so one clone of this repository has everything.

## What we added or changed

- `explainroo/templates/history-map/` and `explainroo/templates/story-shots/`, with
  `explainroo/templates/README.md`
- `explainroo/scripts/new-video.sh` (copies a template into `videos/<name>`)
- `explainroo/.gitignore`: the `videos/` line was removed so our video sources are tracked
- `explainroo/videos/`: the videos made so far (sources only)
- at the repository root: `setup.sh`, `env.sh`, `SETUP.md`, `tools/`

Everything else is upstream's.

## Updating from upstream

```bash
git clone https://github.com/vincentsch/explainroo.git /tmp/explainroo-new
# compare /tmp/explainroo-new with explainroo/, copy over the upstream changes,
# and keep our additions listed above.
```
