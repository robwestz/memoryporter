"""KB-Forge — Knowledge Base Forge for multi-agent documentation processing."""

__version__ = "0.1.0"


class Scraper:
    """Content scraper with pluggable backends."""

    def __init__(self) -> None:
        pass


class StorageManager:
    """Vector storage management via ChromaDB."""

    def __init__(self) -> None:
        pass


class ContextEngine:
    """Query processing and context ranking engine."""

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
    "StorageManager",
    "ContextEngine",
    "KBIndex",
    "main",
]
