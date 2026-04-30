"""ChromaDB vector storage backend."""

from pathlib import Path
import json


class ChromaBackend:
    """Store KB as ChromaDB vector index.

    This backend provides vector storage capabilities for semantic search
    and retrieval. Requires ChromaDB to be installed separately.

    Attributes:
        base_path: Root directory for this backend's storage.
    """

    def __init__(self, base_path: Path):
        """Initialize ChromaDB backend.

        Args:
            base_path: Root directory for vector index storage.
        """
        self.base_path = Path(base_path)

    def create_kb(self, name: str, lifecycle: str = "temp") -> Path:
        """Create a new ChromaDB knowledge base.

        Args:
            name: Name of the knowledge base.
            lifecycle: Lifecycle type (affects storage location).

        Returns:
            Path to the created KB directory.
        """
        kb_path = self.base_path / "indices" / name
        kb_path.mkdir(parents=True, exist_ok=True)

        metadata = {"name": name, "lifecycle": lifecycle, "backend": "chroma"}
        (kb_path / "metadata.json").write_text(
            json.dumps(metadata, indent=2), encoding="utf-8"
        )

        return kb_path
