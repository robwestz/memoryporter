"""Build a nested directory tree with file counts and sizes per node.

Output shape:
{
  "name": "portable-kit",
  "type": "dir",
  "size": 12345678,
  "file_count": 234,
  "children": [
    {"name": "knowledge", "type": "dir", "size": ..., "file_count": ..., "children": [...]},
    {"name": "README.md", "type": "file", "size": 1234, "language": "Markdown"},
    ...
  ]
}
"""
from __future__ import annotations
from pathlib import Path

from walker import IGNORE_DIRS, BINARY_EXTS, ALLOWED_DOTFILES
from analyzers.languages import EXT_TO_LANG, SPECIAL_FILENAMES

MAX_DEPTH = 8  # Cap nesting to keep the JSON small and the sunburst readable


def run(repo_root: Path) -> dict:
    repo_root = repo_root.resolve()
    return _build(repo_root, depth=0)


def _build(node: Path, depth: int) -> dict:
    if node.is_file():
        ext = node.suffix.lower()
        if node.name in SPECIAL_FILENAMES:
            lang = SPECIAL_FILENAMES[node.name][0]
        else:
            lang = EXT_TO_LANG.get(ext, (None,))[0]
        try:
            size = node.stat().st_size
        except OSError:
            size = 0
        return {
            "name": node.name,
            "type": "file",
            "size": size,
            "file_count": 1,
            "language": lang,
        }

    children: list[dict] = []
    total_size = 0
    file_count = 0

    if depth < MAX_DEPTH:
        try:
            entries = sorted(node.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except OSError:
            entries = []
        for entry in entries:
            if entry.is_dir():
                if entry.name in IGNORE_DIRS or entry.name.startswith("."):
                    continue
                child = _build(entry, depth + 1)
                # Skip empty dirs
                if child["file_count"] == 0:
                    continue
                children.append(child)
                total_size += child["size"]
                file_count += child["file_count"]
            elif entry.is_file():
                if entry.suffix.lower() in BINARY_EXTS:
                    continue
                if entry.name.startswith(".") and entry.name not in ALLOWED_DOTFILES:
                    continue
                child = _build(entry, depth + 1)
                children.append(child)
                total_size += child["size"]
                file_count += 1

    return {
        "name": node.name,
        "type": "dir",
        "size": total_size,
        "file_count": file_count,
        "children": children,
    }
