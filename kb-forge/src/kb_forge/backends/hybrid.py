"""Hybrid storage backend (SQLite + files + vectors)."""

from pathlib import Path
import json


class HybridBackend:
    """Store KB with hybrid approach.

    This backend combines multiple storage mechanisms:
    - SQLite for structured metadata and relationships
    - Files for document content
    - Vector indices for semantic search

    Attributes:
        base_path: Root directory for this backend's storage.
    """

    def __init__(self, base_path: Path):
        """Initialize hybrid backend.

        Args:
            base_path: Root directory for hybrid storage.
        """
        self.base_path = Path(base_path)

    def create_kb(self, name: str, lifecycle: str = "temp") -> Path:
        """Create a new hybrid knowledge base.

        Args:
            name: Name of the knowledge base.
            lifecycle: Lifecycle type (affects storage location).

        Returns:
            Path to the created KB directory.
        """
        kb_path = self.base_path / "kb" / name
        kb_path.mkdir(parents=True, exist_ok=True)

        # Create subdirectories
        (kb_path / "docs").mkdir(exist_ok=True)
        (kb_path / "vectors").mkdir(exist_ok=True)
        (kb_path / "metadata").mkdir(exist_ok=True)

        config = {"name": name, "lifecycle": lifecycle, "backend": "hybrid"}
        (kb_path / "kb-config.json").write_text(
            json.dumps(config, indent=2), encoding="utf-8"
        )

        return kb_path
