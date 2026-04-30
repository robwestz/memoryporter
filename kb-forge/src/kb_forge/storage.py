"""Storage manager for KB-Forge."""

from pathlib import Path
from typing import Dict, Optional

from .backends.markdown import MarkdownBackend
from .backends.obsidian import ObsidianBackend
from .backends.chroma import ChromaBackend
from .backends.hybrid import HybridBackend


class StorageManager:
    """Manage KB storage backends.

    This class provides a unified interface for managing different storage
    backends for knowledge bases. It handles backend registration, KB creation,
    and lifecycle management.

    Attributes:
        base_path: Root directory for all KB storage.
        BACKENDS: Registry of available backend classes.

    Example:
        >>> manager = StorageManager(base_path=Path("/data/kb"))
        >>> kb_path = manager.create_kb("my-docs", lifecycle="temp")
        >>> backend = manager.get_backend("markdown")
    """

    BACKENDS = {
        "markdown": MarkdownBackend,
        "obsidian": ObsidianBackend,
        "chroma": ChromaBackend,
        "hybrid": HybridBackend
    }

    def __init__(self, base_path: Optional[Path] = None):
        """Initialize storage manager.

        Args:
            base_path: Root directory for KB storage. Defaults to ~/.kb-forge.

        Raises:
            OSError: If base_path cannot be created.
        """
        if base_path is None:
            base_path = Path.home() / ".kb-forge"
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def get_backend(self, backend_name: str):
        """Get a backend instance by name.

        Args:
            backend_name: Name of the backend (markdown, obsidian, chroma, hybrid).

        Returns:
            Backend instance configured with base_path.

        Raises:
            ValueError: If backend_name is not registered.

        Example:
            >>> backend = manager.get_backend("markdown")
            >>> kb_path = backend.create_kb("docs")
        """
        backend_class = self.BACKENDS.get(backend_name)
        if not backend_class:
            raise ValueError(f"Unknown backend: {backend_name}")
        return backend_class(self.base_path)

    def create_kb(self, name: str, lifecycle: str = "temp", storage_backend: str = "markdown") -> Path:
        """Create a new knowledge base.

        Args:
            name: Name of the knowledge base.
            lifecycle: Lifecycle type - "temp" or "permanent".
            storage_backend: Backend type to use (default: markdown).

        Returns:
            Path to the created KB directory.

        Raises:
            ValueError: If storage_backend is unknown.

        Example:
            >>> kb_path = manager.create_kb("my-docs", lifecycle="permanent")
            >>> print(kb_path)
            /home/user/.kb-forge/kb/my-docs
        """
        backend = self.get_backend(storage_backend)
        return backend.create_kb(name, lifecycle)

    def list_kbs(self, lifecycle: Optional[str] = None) -> Dict[str, Path]:
        """List all knowledge bases.

        Args:
            lifecycle: Filter by lifecycle type ("temp", "kb", or None for all).

        Returns:
            Dictionary mapping KB names to their paths.

        Example:
            >>> kbs = manager.list_kbs()
            >>> print(kbs)
            {'my-docs': Path('/home/user/.kb-forge/temp/my-docs')}
        """
        kbs = {}
        for lc in ([lifecycle] if lifecycle else ["temp", "kb"]):
            lc_path = self.base_path / lc
            if lc_path.exists():
                for kb_dir in lc_path.iterdir():
                    if kb_dir.is_dir():
                        kbs[kb_dir.name] = kb_dir
        return kbs
