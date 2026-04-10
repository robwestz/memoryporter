"""Extract commit history via `git log`. Gracefully returns empty if no git."""
from __future__ import annotations
import subprocess
from pathlib import Path

LOG_FORMAT = "%H%x1f%h%x1f%an%x1f%ae%x1f%at%x1f%s"
SEP = "\x1f"
MAX_COMMITS = 200


def run(repo_root: Path) -> dict:
    if not (repo_root / ".git").exists():
        return {"available": False, "commits": [], "summary": {}}
    try:
        result = subprocess.run(
            ["git", "log", f"--pretty=format:{LOG_FORMAT}", f"-n{MAX_COMMITS}"],
            cwd=repo_root,
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return {"available": False, "commits": [], "summary": {}}
    if result.returncode != 0:
        return {"available": False, "commits": [], "summary": {}}

    commits: list[dict] = []
    authors: dict[str, int] = {}
    for line in result.stdout.splitlines():
        parts = line.split(SEP)
        if len(parts) != 6:
            continue
        full, short, name, email, ts, subject = parts
        try:
            unix_ts = int(ts)
        except ValueError:
            continue
        commits.append({
            "hash": full,
            "short": short,
            "author": name,
            "email": email,
            "ts": unix_ts,
            "subject": subject,
        })
        authors[name] = authors.get(name, 0) + 1

    summary = {
        "total": len(commits),
        "authors": [
            {"name": k, "commits": v}
            for k, v in sorted(authors.items(), key=lambda x: -x[1])
        ],
        "first_ts": commits[-1]["ts"] if commits else None,
        "last_ts": commits[0]["ts"] if commits else None,
    }
    return {"available": True, "commits": commits, "summary": summary}
