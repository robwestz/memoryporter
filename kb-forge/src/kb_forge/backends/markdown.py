"""Markdown file storage backend."""

from pathlib import Path


class MarkdownBackend:
    """Store KB as flat markdown files."""

    def __init__(self, base_path: Path):
        self.base_path = Path(base_path)
