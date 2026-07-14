---
name: commit-and-push
description: Use whenever the user asks to "commit and push", "save my changes to git", "push this to the repo", "check in my changes", or similar - i.e. they want the current working-tree changes committed and pushed to origin in one go, without manually running each git step themselves.
---

# Commit and Push Workflow

Goal: take whatever is currently changed in the working tree and get it committed and pushed to
`origin` in one request, the way a careful developer would do it by hand - not by blindly running
`git add -A && git commit && git push`.

## Steps

1. **Look before touching anything.** Run `git status` and `git diff` (and `git diff --stat` for a
   quick overview) to see exactly what changed. Run `git log --oneline -5` to match this repo's
   existing commit message style.

2. **Filter out noise, don't stage it blindly.** This repo (and this kind of Windows/sandbox checkout
   generally) is prone to line-ending drift - a file can show as "modified" with hundreds of
   changed lines when nothing meaningful actually changed, just CRLF vs LF. Before staging a file:
   - If `git diff --stat <file>` shows a huge change but `git diff <file>` shows every line flipping
     with no real content difference, normalize it to LF first (`sed -i 's/\r$//' <file>` or
     equivalent) and re-check the diff so only genuine changes remain.
   - Never run `git add -A` or `git add .` in this repo without first reviewing `git status` - it is
     easy to accidentally sweep in dozens of unrelated pre-existing "modified" files that have nothing
     to do with the current task.
   - Only stage the files that are actually part of what the user asked for in this session. If
     `git status` shows unrelated modified files you did not touch and don't recognize, leave them
     unstaged and mention them rather than silently including them.

3. **Stage exactly the intended files** with `git add <specific paths>`, never a blanket flag, unless
   the user explicitly confirms they want everything included.

4. **Write a real commit message.** Summarize the *why*, not just the *what*, in 1-2 sentences,
   matching the tone of recent commits (`git log`). Use a heredoc so multi-line messages format
   correctly:

   ```bash
   git commit -m "$(cat <<'EOF'
   <summary line>

   <optional body>
   EOF
   )"
   ```

5. **Push normally.** `git push` (or `git push -u origin <branch>` if the branch has no upstream yet).
   Never use `--force` or `--force-with-lease` unless the user explicitly asks for it - if a normal
   push is rejected (non-fast-forward), stop and tell the user rather than forcing.

6. **Report back concisely.** State what was committed (file list + one-line message) and confirm the
   push succeeded, or explain clearly if it didn't (e.g. auth prompt needed, no upstream, merge
   conflict, or a stuck `.git/index.lock`).

## Handling a stuck `.git/index.lock`

`git add`/`git commit` failing with `Unable to create '.../.git/index.lock': File exists` means a
previous git process didn't clean up after itself. Don't just repeat "delete the lock file" forever
if the first attempt didn't fix it - dig one level deeper:

1. First attempt: ask the user to close any other git tool (VS Code Source Control, GitHub Desktop,
   another terminal) and delete the lock file themselves from their own OS (not from inside this
   session, which may not have permission to touch it).
2. **If they report the file doesn't exist on their end at all** (e.g. `del` / `rm` says "path not
   found") while it still reliably reproduces from inside this session - that's an important signal,
   not a dead end. It means this session's working copy of the repo and the user's local working copy
   have diverged (they aren't necessarily the same live filesystem), and the lock is specific to
   *this session's* checkout, which the user has no way to reach or delete since it isn't a file on
   their machine.
   - Don't keep asking them to delete a file that isn't theirs to delete.
   - Instead, pivot immediately: give the user the exact `git add` / `git commit -m "..."` / `git push`
     commands for the files in question, and ask them to run those directly in their own terminal,
     since their local copy has no lock problem. Confirm afterwards (e.g. `git log --oneline -3`) that
     the commit shows up.
   - Mention this plainly rather than re-explaining the same "close other tools and delete it" advice
     a second time - if it didn't work once, repeating it isn't going to help.

## Guardrails

- Follow this project's `CLAUDE.md`: confirm before "heavy usage of tokens" or destructive changes.
  A normal commit + push of reviewed, intentional changes is routine and does not need extra
  confirmation; force-pushing, rewriting history, or deleting branches does.
- If `git status` is unexpectedly enormous (e.g. nearly every file in the repo shows as modified),
  that is almost always line-ending drift, not real work - do not commit that wholesale. Investigate
  and narrow down to real changes first.
