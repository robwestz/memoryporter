"""Find and read the project README. Markdown rendering happens in the browser
via assets/wiki-template/js/markdown.js — we just hand back the raw text and
basic metadata (title, length, headings)."""
from __future__ import annotations
import re
from pathlib import Path

CANDIDATES = [
    "README.md", "README.markdown", "README.MD",
    "Readme.md", "readme.md", "README", "README.rst",
]


def run(repo_root: Path) -> dict:
    for name in CANDIDATES:
        p = repo_root / name
        if p.is_file():
            try:
                text = p.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            return {
                "found": True,
                "path": name,
                "raw": text,
                "title": _extract_title(text) or repo_root.name,
                "headings": _extract_headings(text),
                "char_count": len(text),
            }
    return {
        "found": False,
        "path": None,
        "raw": "",
        "title": repo_root.name,
        "headings": [],
        "char_count": 0,
    }


def _extract_title(text: str) -> str | None:
    for line in text.splitlines():
        m = re.match(r"^#\s+(.+)$", line.strip())
        if m:
            return m.group(1).strip()
    return None


def _extract_headings(text: str) -> list[dict]:
    out = []
    in_code_fence = False
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code_fence = not in_code_fence
            continue
        if in_code_fence:
            continue
        m = re.match(r"^(#{1,6})\s+(.+)$", stripped)
        if m:
            out.append({"level": len(m.group(1)), "text": m.group(2).strip()})
    return out
