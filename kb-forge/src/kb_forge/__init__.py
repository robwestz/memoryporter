"""KB-Forge — Knowledge Base Forge for multi-agent documentation processing."""

__version__ = "0.1.0"


from .scraper import Scraper, ScrapeScope
from .context_engine import ContextEngine, ChunkStrategy
from .storage import StorageManager
from .kb_index import KBIndex


from .cli import main


# Optional: GAN-style harness for autonomous building
try:
    from .agents.kb_builder_harness import KBBuilderHarness, HarnessResult
    __all__ = [
        "__version__",
        "Scraper",
        "ScrapeScope",
        "StorageManager",
        "ContextEngine",
        "ChunkStrategy",
        "KBIndex",
        "KBBuilderHarness",
        "HarnessResult",
        "main",
    ]
except ImportError:
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
