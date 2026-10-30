# Explainer video generation: notes for Claude

This repository is shared on GitHub. The publisher pushes new and updated templates and tools to `origin/main`.
Each user has their own clone, with their own videos and keys. The video engine and templates live in
`explainroo/` (read `explainroo/AGENTS.md` before making a video); the Studio web app is in `ui/`.

## When the user asks to sync, update, or "get the latest"

Bring the publisher's changes into this clone **without losing anything the user made**. Follow these steps in
order and stop to ask if a step says so.

1. **Look first, change nothing.**
   - `git status --short` and `git branch --show-current`. Note what the user has changed or added.
   - `git fetch origin`. If this fails because of access or login, tell the user to run `gh auth login` (or sign in
     to GitHub in their usual way) and stop. Do not try to work around it.
   - See what is coming: `git log --oneline HEAD..origin/main` and `git diff --name-status HEAD...origin/main`.
     If nothing is coming, say "already up to date" and stop.

2. **Make a safety net before merging.** Create a backup branch at the current commit:
   `git branch backup/before-sync-$(date +%Y%m%d-%H%M%S)`. If there are uncommitted changes to tracked files,
   save them too, either by committing them on the user's branch (ask first) or with
   `git stash push -m "before sync" -- <those paths>`. Never stash with `-u`/`--include-untracked`: the user's
   video folders can hold gigabytes.

3. **Check for overlap.** Compare the incoming file list with the user's changed files and untracked paths.
   - No overlap: continue.
   - Overlap with a tracked file the user edited (for example a template they customised): tell the user which
     files, and how you plan to keep their edits (see step 4), before merging.
   - An incoming file would overwrite an untracked file or folder of the user's: do not overwrite it. Move the
     user's copy aside (for example to `<name>-mine`) and tell them, or ask which to keep.

4. **Merge safely.**
   - Use `git merge --ff-only origin/main` when the user has no local commits.
   - If they have local commits, use a normal merge (`git merge origin/main`), never a rebase.
   - If there are conflicts, resolve them by reading both sides. Keep the user's changes and also bring in the
     publisher's, and explain each decision in plain language. If you cannot tell which is right, ask. Do not
     pick a side wholesale.
   - Re-apply any stash you made, and resolve its conflicts the same way.

5. **Never do these** unless the user explicitly asks for that exact action:
   `git reset --hard`, `git checkout .`, `git restore .`, `git clean`, `git push --force`, deleting branches or
   stashes, `rm -rf` on `explainroo/videos/`, and anything that edits or prints `explainroo/.env` (it holds the
   user's keys; it is git-ignored and must stay untouched).
   Pushing is allowed when the user asks, but treat it as outward-facing: see "When the user asks to push" below.

6. **Finish the job.**
   - If `package.json`, `package-lock.json` or `setup.sh` changed, run `sh setup.sh` (it is safe to repeat).
   - If anything under `ui/` changed, tell the user to stop and start Studio (`node ui/server.mjs`).
   - Run `git status` to confirm the tree is in a good state.
   - Report in plain language: which templates are new (`explainroo/templates/<name>`), which were updated, any
     tool or setup changes, and any of the user's files you kept or moved aside. Mention the backup branch name and
     how to go back to it if something looks wrong.

## When the user asks to push

Users can both pull and push. Because many people share `origin/main`, merge carefully in both directions.

1. **Pull first.** Run the sync steps above so the user's work sits on top of the latest `origin/main`. Never push
   from a stale clone.
2. **Show what will go out.** `git status --short`, `git log --oneline origin/main..HEAD` and
   `git diff --name-status origin/main...HEAD`. Tell the user in plain language what is being published.
3. **Stage only what the user means.** Add specific paths, never `git add -A`. Never commit `explainroo/.env`,
   `explainroo/videos/*/out/`, `build/` folders or other large rendered files.
4. **Merge, never rewrite.** Use a normal merge to combine histories. No rebase, no `git push --force` (or
   `--force-with-lease`) unless the user explicitly asks for that exact action.
5. **Push with a plain `git push origin <branch>`.** If it is rejected because `origin` has newer commits, do not
   force it: go back to step 1, merge the new changes carefully (keep both sides, ask if unsure), then push again.
6. **Confirm and report** what was pushed and the resulting commit. If the user is not the publisher and is
   pushing to `main`, suggest a branch (and a pull request) instead, and ask which they want.

## Things that stay on this computer

- Rendered videos (`explainroo/videos/*/out/`) and `build/` folders are git-ignored and never synced.
- The user's own videos under `explainroo/videos/` are theirs. Sync only changes them if the publisher also
  shipped a folder with the same name, which is the overlap case above.
- Keys live in `explainroo/.env` only. Cloudflare and Pollinations keys are optional; nothing else is needed.
