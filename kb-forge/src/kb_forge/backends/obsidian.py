"""Obsidian vault storage backend."""

from pathlib import Path


class ObsidianBackend:
    """Store KB as Obsidian vault."""

    def __init__(self, base_path: Path):
        self.base_path = Path(base_path)
