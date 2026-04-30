"""ChromaDB vector storage backend."""

from pathlib import Path


class ChromaBackend:
    """Store KB as ChromaDB vector index."""

    def __init__(self, base_path: Path):
        self.base_path = Path(base_path)
