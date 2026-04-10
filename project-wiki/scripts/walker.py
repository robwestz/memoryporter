"""Walk a project repository, yielding (relative_path, abs_path, size_bytes) tuples.

Skips common noise: .git, node_modules, target, dist, build, .venv, __pycache__,
.next, .cache, vendor, .idea, .vscode, .DS_Store, *.lock files, binaries by extension.
"""
from __future__ import annotations
import os
from pathlib import Path
from typing import Iterator, Tuple

IGNORE_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "target", "dist", "build", "out",
    ".venv", "venv", "env", "__pycache__", ".next", ".nuxt", ".cache", ".turbo",
    "vendor", ".idea", ".vscode", ".gradle", ".pytest_cache", ".mypy_cache",
    "coverage", ".tox", "bin", "obj", ".DS_Store",
}

BINARY_EXTS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".tiff",
    ".pdf", ".zip", ".tar", ".gz", ".bz2", ".xz", ".7z", ".rar",
    ".exe", ".dll", ".so", ".dylib", ".o", ".a", ".lib",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".mp3", ".mp4", ".wav", ".ogg", ".webm", ".mov", ".avi",
    ".pyc", ".pyo", ".class", ".jar", ".war",
    ".sqlite", ".db",
}

# Allowed dotfiles — meaningful even though they start with "."
ALLOWED_DOTFILES = {".gitignore", ".env.example", ".editorconfig", ".prettierrc", ".dockerignore"}

MAX_FILE_BYTES = 2 * 1024 * 1024  # 2 MB — skip larger text files for performance


def walk(repo_root: Path) -> Iterator[Tuple[str, Path, int]]:
    repo_root = repo_root.resolve()
    for dirpath, dirnames, filenames in os.walk(repo_root):
        # Prune ignored directories in-place so os.walk doesn't descend
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS and not d.startswith(".")]
        for fname in filenames:
            if fname.startswith("."):
                if fname not in ALLOWED_DOTFILES:
                    continue
            abs_path = Path(dirpath) / fname
            try:
                size = abs_path.stat().st_size
            except OSError:
                continue
            ext = abs_path.suffix.lower()
            if ext in BINARY_EXTS:
                continue
            if size > MAX_FILE_BYTES:
                continue
            rel = abs_path.relative_to(repo_root).as_posix()
            yield rel, abs_path, size


def is_text_file(abs_path: Path) -> bool:
    """Cheap binary sniff: read first 8KB, check for NUL byte."""
    try:
        with open(abs_path, "rb") as f:
            chunk = f.read(8192)
        return b"\x00" not in chunk
    except OSError:
        return False
