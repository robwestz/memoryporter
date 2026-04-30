"""Hybrid storage backend (SQLite + files + vectors)."""

from pathlib import Path


class HybridBackend:
    """Store KB with hybrid approach."""

    def __init__(self, base_path: Path):
        self.base_path = Path(base_path)
