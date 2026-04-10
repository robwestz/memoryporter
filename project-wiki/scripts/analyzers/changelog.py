"""Find and parse a CHANGELOG-style file if present. Returns the raw text plus
a best-effort parse into entries by version heading."""
from __future__ import annotations
import re
from pathlib import Path

CANDIDATES = [
    "CHANGELOG.md", "CHANGELOG.markdown", "CHANGELOG",
    "CHANGES.md", "CHANGES",
    "HISTORY.md", "HISTORY",
    "RELEASES.md",
]

# Match Keep-a-Changelog style: ## [1.2.3] - 2024-01-15
ENTRY_RE = re.compile(
    r"^##\s+\[?([\w\.\-+]+)\]?(?:\s*[-–—]\s*(\d{4}-\d{2}-\d{2}))?\s*$"
)


def run(repo_root: Path) -> dict:
    for name in CANDIDATES:
        p = repo_root / name
        if p.is_file():
            try:
                text = p.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            entries = _parse_entries(text)
            return {
                "found": True,
                "path": name,
                "raw": text,
                "entries": entries,
                "char_count": len(text),
            }
    return {"found": False, "path": None, "raw": "", "entries": [], "char_count": 0}


def _parse_entries(text: str) -> list[dict]:
    entries: list[dict] = []
    current: dict | None = None
    for raw_line in text.splitlines():
        m = ENTRY_RE.match(raw_line.strip())
        if m:
            if current is not None:
                current["body"] = current["body"].rstrip()
                entries.append(current)
            current = {"version": m.group(1), "date": m.group(2), "body": ""}
        elif current is not None:
            current["body"] += raw_line + "\n"
    if current is not None:
        current["body"] = current["body"].rstrip()
        entries.append(current)
    return entries
