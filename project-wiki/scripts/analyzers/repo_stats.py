"""Aggregate file count, total bytes, total LOC across the repo."""
from __future__ import annotations
from pathlib import Path

from walker import walk, is_text_file


def run(repo_root: Path) -> dict:
    file_count = 0
    total_bytes = 0
    total_loc = 0
    largest: list[tuple[int, str]] = []

    for rel, abs_path, size in walk(repo_root):
        file_count += 1
        total_bytes += size
        if not is_text_file(abs_path):
            continue
        try:
            with open(abs_path, "r", encoding="utf-8", errors="ignore") as f:
                loc = sum(1 for line in f if line.strip())
        except OSError:
            continue
        total_loc += loc
        largest.append((loc, rel))

    largest.sort(reverse=True)
    top_files = [{"path": p, "loc": loc} for loc, p in largest[:25]]

    return {
        "file_count": file_count,
        "total_bytes": total_bytes,
        "total_loc": total_loc,
        "top_files_by_loc": top_files,
    }
