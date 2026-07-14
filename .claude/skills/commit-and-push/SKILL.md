---
name: commit-and-push
description: Use whenever the user asks to "commit and push", "save my changes to git", "push this to the repo", "check in my changes", or similar - i.e. they want the current working-tree changes committed and pushed to origin in one go, without manually running each git step themselves.
---

# Commit and Push Workflow

Goal: show the user exactly what changed, get a single yes/no go-ahead, then finish the whole
commit + push in one uninterrupted pass - no follow-up questions once the user says yes.

## Project-specific commit identity

For this project, every commit must be authored as:

- Name: `amitajitgandhi`
- Email: `ag241290@gmail.com`

Do not use `git config --global` to set this. Pass it per-command instead, so it never leaks into
other repos:

```bash
git -c user.name="amitajitgandhi" -c user.email="ag241290@gmail.com" commit -m "..."
```

If commit-tree is used directly (see lock-file workaround below), set it via environment variables
instead:

```bash
GIT_AUTHOR_NAME="amitajitgandhi" GIT_AUTHOR_EMAIL="ag241290@gmail.com" \
GIT_COMMITTER_NAME="amitajitgandhi" GIT_COMMITTER_EMAIL="ag241290@gmail.com" \
git commit-tree <tree> -p HEAD -m "..."
```

## Step 0 (mandatory, before trusting anything): refresh the stat cache

This working copy is a mounted/synced folder, and it has a confirmed caching bug: git can report
`nothing to commit, working tree clean` even when a file was genuinely edited, because git skips
re-reading a file's content when its cached mtime/size still matches the index (a normal
performance shortcut) - and this mount can serve a stale mtime for a file that was actually changed.
That makes a bare `git status` untrustworthy here.

Before every `git status`/`git diff` check, force a fresh mtime on all tracked files so git is
forced to actually compare content instead of trusting stale stat data:

```bash
git ls-files -z | xargs -0 touch
```

Only after this should `git status` be treated as ground truth.

## Steps

1. **Show git status first, unconditionally** (after Step 0's refresh). Run `git status` and paste
   its output back to the user verbatim (or near-verbatim) before doing anything else. Also run
   `git diff --stat` so the size of the change is visible.

2. **Filter out noise before it ever reaches the user.** This repo now has a `.gitattributes` that
   normalizes line endings to LF, so CRLF/LF drift should no longer appear. If a file nonetheless
   shows as modified with every line flipped and no real content difference, check with
   `git diff --ignore-space-at-eol --stat <file>` - if that's empty, it's noise, not a real change.
   Leave noise files out of the status summary shown to the user and out of anything staged.

3. **Ask exactly one yes/no question**, after showing status: something like "Commit and push
   these changes? (yes/no)". Do not ask anything else at this stage (no commit message bikeshedding,
   no per-file confirmation) - the whole point is one gate, then full automation.

4. **If the answer is no:** stop. Don't stage or touch anything.

5. **If the answer is yes, do the rest with no further prompts:**
   - Stage exactly the genuinely-changed files (never a blanket `git add -A`/`git add .` without
     having already reviewed status in step 1).
   - Write a commit message summarizing the *why* in 1-2 sentences, matching the tone of
     `git log --oneline -5`. Use a heredoc for multi-line messages.
   - Commit using the project identity above.
   - Push with a plain `git push` (`git push -u origin <branch>` if there's no upstream yet). Never
     use `--force`/`--force-with-lease` unless the user explicitly asked for a force-push in this
     conversation.
   - Report back concisely: files committed, one-line message, and push result.

## Handling `.git/index.lock` / `.git/HEAD.lock` / `.git/refs/heads/<branch>.lock`

This mount also has a confirmed caching bug on lock-file paths: git reports
`Unable to create '.git/index.lock': File exists` (or `HEAD.lock`, or a ref lock) even when there
is no other process and the file does not actually exist on the user's real filesystem. Do **not**
ask the user to close other git tools or manually delete the lock file for this project - that's
already been ruled out. Instead, go straight to the workaround:

1. **For staging (`git add`):**
   ```bash
   cp .git/index /tmp/gitindex
   GIT_INDEX_FILE=/tmp/gitindex git add <files>
   # renormalize instead of add, if relevant:
   GIT_INDEX_FILE=/tmp/gitindex git add --renormalize .
   cp /tmp/gitindex .git/index
   ```

2. **For committing (`git commit`):** if a plain `-c user.name=... commit` still hits the lock bug,
   build the commit manually and skip ref-locking entirely:
   ```bash
   TREE=$(GIT_INDEX_FILE=/tmp/gitindex git write-tree)
   COMMIT=$(GIT_AUTHOR_NAME="amitajitgandhi" GIT_AUTHOR_EMAIL="ag241290@gmail.com" \
            GIT_COMMITTER_NAME="amitajitgandhi" GIT_COMMITTER_EMAIL="ag241290@gmail.com" \
            git commit-tree "$TREE" -p HEAD -m "<message>")
   ```
   Then update the branch ref directly by editing `.git/refs/heads/<branch>` (e.g. with a file
   edit tool) to replace the old commit hash with `$COMMIT` - this bypasses the cached lock path
   entirely. Finally `cp /tmp/gitindex .git/index` so the working index matches.

3. **Push as normal** once the ref points at the new commit - `git push` doesn't touch
   `index.lock`/`HEAD.lock` so it's usually unaffected by this bug.

4. Warnings like `unable to unlink '.git/objects/xx/tmp_obj_XXXXXX': Operation not permitted` during
   `add`/`commit`/`commit-tree` are the same mount quirk and are harmless as long as the surrounding
   command still reports success (or you verify the resulting object/commit exists with
   `git cat-file -t <hash>`) - don't treat those warnings alone as failures.

## Credentials

A repo-local credential helper is already configured (`credential.helper = store --file
.git/.git-credentials`) so `git push` should not need interactive auth. If push ever fails with a
403 or auth error, stop and tell the user rather than trying to silently reconfigure credentials.
