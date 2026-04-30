"""KB-Forge — Knowledge Base Forge for multi-agent documentation processing."""

__version__ = "0.1.0"


from .scraper import Scraper, ScrapeScope
from .context_engine import ContextEngine, ChunkStrategy


class StorageManager:
    """Vector storage management via ChromaDB."""

    def __init__(self) -> None:
        pass


class KBIndex:
    """Unified knowledge base index interface."""

    def __init__(self) -> None:
        pass


from .cli import main


__all__ = [
    "__version__",
    "Scraper",
    "ScrapeScope",
    "StorageManager",
    "ContextEngine",
    "ChunkStrategy",
    "KBIndex",
    "main",
]
