"""Flat list of every walked file with metadata for the file explorer.

For text files under 200 KB, includes the *content* (truncated to 600 lines) so
the wiki can render syntax-highlighted previews entirely from data.json — no
extra fetches needed."""
from __future__ import annotations
from pathlib import Path

from walker import walk, is_text_file
from analyzers.languages import EXT_TO_LANG, SPECIAL_FILENAMES

INLINE_MAX_BYTES = 200 * 1024
INLINE_MAX_LINES = 600


def run(repo_root: Path) -> dict:
    files: list[dict] = []
    for rel, abs_path, size in walk(repo_root):
        ext = abs_path.suffix.lower()
        if abs_path.name in SPECIAL_FILENAMES:
            lang = SPECIAL_FILENAMES[abs_path.name][0]
        else:
            lang = EXT_TO_LANG.get(ext, (None,))[0]

        entry = {
            "path": rel,
            "size": size,
            "language": lang,
            "loc": 0,
            "preview": None,
            "truncated": False,
        }
        if is_text_file(abs_path):
            try:
                text = abs_path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                files.append(entry)
                continue
            lines = text.splitlines()
            entry["loc"] = sum(1 for line in lines if line.strip())
            if size <= INLINE_MAX_BYTES:
                if len(lines) > INLINE_MAX_LINES:
                    entry["preview"] = "\n".join(lines[:INLINE_MAX_LINES])
                    entry["truncated"] = True
                else:
                    entry["preview"] = text
        files.append(entry)
    return {"files": files, "count": len(files)}
