# Explainer video generation: notes for Claude

This repository is shared on GitHub. The publisher, and users who ask for it, push new and updated templates and tools to `origin/main`.
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
   Pushing your own work (for example a new template) to `origin/main` is allowed when the user asks for it. Always sync first (steps 1 to 4), commit only the files that belong to the change, never `videos/` or other local output, and never force-push.

6. **Finish the job.**
   - If `package.json`, `package-lock.json` or `setup.sh` changed, run `sh setup.sh` (it is safe to repeat).
   - If anything under `ui/` changed, tell the user to stop and start Studio (`node ui/server.mjs`).
   - Run `git status` to confirm the tree is in a good state.
   - Report in plain language: which templates are new (`explainroo/templates/<name>`), which were updated, any
     tool or setup changes, and any of the user's files you kept or moved aside. Mention the backup branch name and
     how to go back to it if something looks wrong.

## Things that stay on this computer

- Rendered videos (`explainroo/videos/*/out/`) and `build/` folders are git-ignored and never synced.
- The user's own videos under `explainroo/videos/` are theirs. Sync only changes them if the publisher also
  shipped a folder with the same name, which is the overlap case above.
- Keys live in `explainroo/.env` only. Cloudflare and Pollinations keys are optional; nothing else is needed.
