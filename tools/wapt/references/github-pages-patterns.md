# GitHub Pages Patterns — Reference
> Last updated: 2026-04-21

---

## Overview

`target_ghpages.py` deploys a built site to GitHub Pages by pushing a `dist/` folder to a `gh-pages` branch. Two approaches exist: `git subtree push` (simpler, single command) and `git worktree add` (cleaner, avoids branch switching). The worktree approach is preferred for automation — it never touches the working directory of the main branch.

GitHub Pages serves from either the `gh-pages` branch root, or the `docs/` folder on `main`. For wapt, `gh-pages` branch is the target — it keeps deploy history separate from source history.

---

## Version Pins

| Component | Notes (2026) |
|-----------|-------------|
| GitHub Pages | No versioning — platform feature |
| `gh-pages` branch | Orphan branch (no shared history with main) |
| Deploy latency | 30 seconds – 3 minutes after push |
| Custom domain | CNAME file in gh-pages root |
| Repo requirement | Public repo, or GitHub Pro/Team/Enterprise for private |
| `git worktree` | Git 2.5+ (available everywhere in 2026) |

---

## Approach Comparison

| Method | Pros | Cons |
|--------|------|------|
| `git subtree push --prefix dist origin gh-pages` | One command | Slow on large history; cannot force-push easily |
| `git worktree add` | Fast, no branch switch, force-pushable | Requires one-time orphan branch setup |
| GitHub Actions | Fully managed | Out of scope for wapt v0.1.0 |

Recommended for `target_ghpages.py`: **git worktree approach**.

---

## One-Time Setup: Orphan Branch

Run once per repo to initialize the `gh-pages` branch with no parent commits:

```bash
git checkout --orphan gh-pages
git reset --hard
git commit --allow-empty -m "Initialize gh-pages branch"
git checkout main
git push origin gh-pages
```

`target_ghpages.py` detects if the branch exists remotely and runs this setup automatically on first deploy.

---

## Code Examples

### Example 1: Full deploy via `git worktree` (recommended)
```python
import subprocess
import shutil
import tempfile
from pathlib import Path


def ghpages_deploy(
    dist_dir: Path,
    remote: str = "origin",
    branch: str = "gh-pages",
    commit_message: str = "Deploy via wapt",
    cname: str | None = None,
) -> dict:
    """
    Deploy dist_dir contents to the gh-pages branch using git worktree.

    Steps:
    1. Ensure gh-pages branch exists (create orphan if not)
    2. Add worktree in a temp directory
    3. Sync dist/ into worktree (clean slate)
    4. Commit and force-push
    5. Remove worktree

    Returns dict with branch, remote, commit_sha, status.
    Raises RuntimeError on failure.
    """
    repo_root = _find_git_root()
    dist_dir = dist_dir.resolve()

    if not dist_dir.exists():
        raise RuntimeError(f"dist directory not found: {dist_dir}")

    _ensure_ghpages_branch(branch, remote, repo_root)

    with tempfile.TemporaryDirectory(prefix="wapt-ghpages-") as tmp:
        worktree_path = Path(tmp) / "gh-pages"

        try:
            subprocess.run(
                ["git", "worktree", "add", "--no-checkout", str(worktree_path), branch],
                cwd=repo_root,
                check=True,
                capture_output=True,
                text=True,
            )

            # Clean slate: remove everything tracked in this branch
            subprocess.run(
                ["git", "rm", "-rf", "--quiet", "."],
                cwd=worktree_path,
                check=True,
                capture_output=True,
                text=True,
            )

            # Copy built files from dist/
            for item in dist_dir.iterdir():
                dest = worktree_path / item.name
                if item.is_dir():
                    shutil.copytree(item, dest)
                else:
                    shutil.copy2(item, dest)

            # Write CNAME if custom domain specified
            if cname:
                (worktree_path / "CNAME").write_text(cname.strip(), encoding="utf-8")

            subprocess.run(
                ["git", "add", "--all"],
                cwd=worktree_path,
                check=True,
                capture_output=True,
            )

            commit_result = subprocess.run(
                ["git", "commit", "-m", commit_message],
                cwd=worktree_path,
                capture_output=True,
                text=True,
            )
            if commit_result.returncode != 0:
                if "nothing to commit" in commit_result.stdout:
                    return {"branch": branch, "remote": remote, "status": "no-changes"}
                commit_result.check_returncode()

            push_result = subprocess.run(
                ["git", "push", remote, branch, "--force"],
                cwd=worktree_path,
                capture_output=True,
                text=True,
            )
            _handle_push_error(push_result, remote, branch)

            sha = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=worktree_path,
                capture_output=True,
                text=True,
                check=True,
            ).stdout.strip()

        finally:
            # Always clean up worktree reference even if push fails
            subprocess.run(
                ["git", "worktree", "remove", "--force", str(worktree_path)],
                cwd=repo_root,
                capture_output=True,
            )

    return {
        "branch": branch,
        "remote": remote,
        "commit_sha": sha,
        "status": "deployed",
    }


def _find_git_root() -> Path:
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
        check=True,
    )
    return Path(result.stdout.strip())


def _ensure_ghpages_branch(branch: str, remote: str, repo_root: Path) -> None:
    """Create an orphan gh-pages branch on remote if it does not exist."""
    result = subprocess.run(
        ["git", "ls-remote", "--heads", remote, branch],
        capture_output=True,
        text=True,
        cwd=repo_root,
        check=True,
    )
    if branch in result.stdout:
        return  # Already exists

    # Create orphan locally and push
    subprocess.run(
        ["git", "checkout", "--orphan", branch],
        cwd=repo_root, capture_output=True, check=True,
    )
    subprocess.run(
        ["git", "reset", "--hard"],
        cwd=repo_root, capture_output=True, check=True,
    )
    subprocess.run(
        ["git", "commit", "--allow-empty", "-m", f"Initialize {branch}"],
        cwd=repo_root, capture_output=True, check=True,
    )
    subprocess.run(
        ["git", "push", "-u", remote, branch],
        cwd=repo_root, capture_output=True, check=True,
    )
    subprocess.run(
        ["git", "checkout", "-"],  # Return to previous branch
        cwd=repo_root, capture_output=True, check=True,
    )


def _handle_push_error(result: subprocess.CompletedProcess, remote: str, branch: str) -> None:
    if result.returncode == 0:
        return
    stderr = result.stderr.strip()
    if "Authentication failed" in stderr or "could not read Username" in stderr:
        raise RuntimeError(
            f"Git push auth failed. Configure SSH key or token for remote '{remote}'."
        )
    if "protected branch" in stderr.lower() or "pre-receive hook" in stderr.lower():
        raise RuntimeError(
            f"Branch '{branch}' is protected. Disable branch protection in repo Settings → Branches."
        )
    if "repository not found" in stderr.lower():
        raise RuntimeError(
            f"Remote '{remote}' not found or no access. Check repo visibility and credentials."
        )
    raise RuntimeError(f"git push failed: {stderr}")
```

### Example 2: `git subtree push` approach (simpler alternative)
```python
import subprocess
from pathlib import Path


def ghpages_subtree_push(
    prefix: str = "dist",
    remote: str = "origin",
    branch: str = "gh-pages",
) -> None:
    """
    Deploy via git subtree push.

    Simpler than worktree but has two constraints:
    - dist/ must be committed to the current branch
    - Cannot force-push; fails if gh-pages has diverged from expected history

    Use worktree approach for CI/automation; this for occasional manual deploys.
    """
    repo_root = _find_git_root()

    # Subtree push reads from committed git tree, not the filesystem
    status = subprocess.run(
        ["git", "status", "--porcelain", prefix],
        capture_output=True,
        text=True,
        cwd=repo_root,
        check=True,
    )
    if status.stdout.strip():
        raise RuntimeError(
            f"Uncommitted changes in '{prefix}/'. "
            "Commit or stash before subtree push, or use the worktree approach."
        )

    try:
        subprocess.run(
            ["git", "subtree", "push", f"--prefix={prefix}", remote, branch],
            cwd=repo_root,
            check=True,
            timeout=300,
        )
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(
            "git subtree push failed. "
            "If gh-pages branch has diverged, use the worktree approach with --force."
        ) from exc
```

---

## Best Practices

- **Force-push is safe on `gh-pages`.** The deploy branch contains no source history — only rendered output. Force-pushing is the standard pattern and eliminates merge conflicts from successive deploys.
- **Orphan branch for clean history.** An orphan branch has no parent commits. Each deploy adds one commit; history stays linear and human-readable.
- **Always clean the worktree before copying.** `git rm -rf .` before copying new files ensures deleted source files do not persist on gh-pages across deploys.
- **CNAME file must be in the root of gh-pages.** GitHub reads it from the branch root only. Write it after copying dist/, not before `git rm`.
- **Verify deploy URL after push.** `https://<user>.github.io/<repo>/` takes 30s–3min to update. Do not poll faster than 30s.
- **Use SSH or PAT for auth.** HTTPS pushes require a Personal Access Token stored in git credential manager. SSH is simpler for automation — no interactive prompt.

---

## Error Handling Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `Authentication failed` | No credentials for remote | Configure SSH key or git credential helper with PAT |
| `repository not found` | Private repo without auth, or wrong URL | Check `git remote -v`; verify auth scope includes `repo` |
| `protected branch` | gh-pages has branch protection rules | Repo Settings → Branches → disable protection for gh-pages |
| `nothing to commit` | dist/ unchanged since last deploy | Skip push; return `status: no-changes` |
| `worktree already exists` | Previous deploy crashed without cleanup | Run `git worktree prune` to remove stale refs |
| Deploy URL shows 404 | Branch not yet visible to Pages, or Pages not enabled | Wait 2–3 min; check repo Settings → Pages → Source |
| Custom domain inactive | CNAME file missing or contains wrong value | Verify `CNAME` exists in gh-pages root with exact domain (no `https://`) |

---

## Gotchas

1. **`git worktree` leaves refs on crash.** If the script is killed mid-deploy, the worktree reference persists in `.git/worktrees/`. The `finally` block in Example 1 handles this; also run `git worktree prune` in CI cleanup steps.
2. **`git subtree push` reads committed state.** Uncommitted changes in `dist/` are invisible to subtree push. Commit dist/ before calling, or use the worktree approach which copies directly from the filesystem.
3. **Deploy latency is not instant.** GitHub Pages CDN propagation takes 30s–3min. Do not assert the URL is live immediately after push in automated tests.
4. **Public repo requirement.** GitHub Pages is free for public repos. Private repos require GitHub Pro or higher. Detect early with `gh repo view --json visibility -q .visibility` before attempting deploy.
5. **Conflict with GitHub Actions Pages.** If the repo already uses `actions/deploy-pages` workflow, there may be a conflict with a manual `gh-pages` branch. Check repo Settings → Pages → Source before first deploy.
6. **Windows path separators.** Always pass paths to git subprocess via `str(path)` — `pathlib.Path` on Windows uses backslashes which some git operations reject. Use `str()` for subprocess args; `Path.as_posix()` only for display.
7. **`git checkout --orphan` leaves you on the orphan branch.** `_ensure_ghpages_branch` uses `git checkout -` to return to the previous branch. If the function fails mid-way, the caller may be on the orphan branch — handle with a try/finally around the checkout if needed.
8. **`--force` on gh-pages is intentional, not dangerous.** The gh-pages branch is a deployment artifact, not a collaboration branch. Reviewers and CI systems should understand this distinction — document it in the repo CONTRIBUTING guide if the project has collaborators.

---

## External Links

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Using git worktree for GitHub Pages (Sangsoo Nam, 2019)](http://sangsoonam.github.io/2019/02/08/using-git-worktree-to-deploy-github-pages.html)
- [git subtree push gist (cobyism)](https://gist.github.com/cobyism/4730490)
- [git worktree — official documentation](https://git-scm.com/docs/git-worktree)
- [GitHub Pages: Configuring a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages: Troubleshooting 404 errors](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)
