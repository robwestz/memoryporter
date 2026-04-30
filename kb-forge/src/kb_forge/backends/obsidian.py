"""Obsidian vault storage backend."""

from pathlib import Path
import json


class ObsidianBackend:
    """Store KB as Obsidian vault.

    This backend creates Obsidian-compatible vault structures with
    proper directory layout and metadata for use with Obsidian app.

    Attributes:
        base_path: Root directory for this backend's storage.
    """

    def __init__(self, base_path: Path):
        """Initialize Obsidian backend.

        Args:
            base_path: Root directory for vault storage.
        """
        self.base_path = Path(base_path)

    def create_kb(self, name: str, lifecycle: str = "temp") -> Path:
        """Create a new Obsidian vault.

        Args:
            name: Name of the vault/knowledge base.
            lifecycle: Lifecycle type (affects storage location).

        Returns:
            Path to the created vault directory.
        """
        vault_path = self.base_path / "obsidian" / name
        vault_path.mkdir(parents=True, exist_ok=True)

        # Create .obsidian directory
        (vault_path / ".obsidian").mkdir(exist_ok=True)

        # Create minimal config
        config = {"name": name, "lifecycle": lifecycle}
        (vault_path / ".kb-manifest.json").write_text(
            json.dumps(config, indent=2), encoding="utf-8"
        )

        return vault_path
