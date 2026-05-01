"""MCP server for KB-Forge."""

from fastmcp import FastMCP
from pathlib import Path
from typing import List, Optional

from .scraper import Scraper, ScrapeScope
from .storage import StorageManager
from .context_engine import ContextEngine, ChunkStrategy
from .kb_index import KBIndex

mcp = FastMCP("kb-forge")


@mcp.tool()
def kb_scrape(
    url: str,
    mode: str = "temp",
    storage: str = "markdown",
    depth: str = "single",
    name: Optional[str] = None
) -> dict:
    """Scrape documentation from URL into knowledge base.
    
    Args:
        url: URL to scrape
        mode: "temp" or "permanent"
        storage: "markdown", "obsidian", "chroma", or "hybrid"
        depth: "single", "section", or "full"
        name: Optional KB name (auto-generated from URL if not provided)
        
    Returns:
        Dict with kb_path, chunks_count, and status
    """
    # Create KB
    storage_mgr = StorageManager()
    kb_name = name or url.replace("https://", "").replace("http://", "").replace("/", "_")[:50]
    kb_path = storage_mgr.create_kb(kb_name, lifecycle=mode, storage_backend=storage)
    
    # Scrape
    scraper = Scraper()
    scope = ScrapeScope(depth)
    result = scraper.scrape(url, scope=scope, output_dir=kb_path / "raw")
    
    # Process
    engine = ContextEngine()
    chunks = engine.chunk(result["content"], strategy=ChunkStrategy.SEMANTIC)
    
    # Index
    kb_index = KBIndex(kb_path)
    kb_index.initialize()
    kb_index.add_document(kb_name, chunks, source_url=url, embed=False)
    
    return {
        "status": "success",
        "kb_name": kb_name,
        "kb_path": str(kb_path),
        "chunks_indexed": len(chunks),
        "source_url": url
    }


@mcp.tool()
def kb_list(lifecycle: Optional[str] = None) -> dict:
    """List all knowledge bases.
    
    Args:
        lifecycle: Filter by "temp", "permanent", or None for all
        
    Returns:
        Dict mapping KB names to paths
    """
    storage_mgr = StorageManager()
    
    filter_map = {"temp": "temp", "permanent": "kb"}
    lc_filter = filter_map.get(lifecycle)
    
    kbs = storage_mgr.list_kbs(lifecycle=lc_filter)
    
    return {
        "knowledge_bases": {
            name: str(path) for name, path in kbs.items()
        },
        "count": len(kbs)
    }


@mcp.tool()
def kb_query(
    kb_name: str,
    question: str,
    top_k: int = 5
) -> dict:
    """Query a knowledge base.
    
    Args:
        kb_name: Name of KB to query
        question: Natural language question
        top_k: Number of results (default 5)
        
    Returns:
        Dict with results list
    """
    storage_mgr = StorageManager()
    kbs = storage_mgr.list_kbs()
    
    if kb_name not in kbs:
        return {
            "status": "error",
            "error": f"KB '{kb_name}' not found"
        }
    
    kb_path = kbs[kb_name]
    index = KBIndex(kb_path)
    
    results = index.query(question, top_k=top_k)
    
    return {
        "status": "success",
        "kb_name": kb_name,
        "question": question,
        "results": results
    }


@mcp.tool()
def kb_build(
    spec: str,
    autonomous: bool = False
) -> dict:
    """Build knowledge base from spec (optionally with autonomous GAN harness).
    
    Args:
        spec: Description of what to build (e.g., "Devin docs from docs.devin.ai")
        autonomous: Whether to use autonomous GAN harness (requires agent setup)
        
    Returns:
        Dict with build status
    """
    if autonomous:
        return {
            "status": "not_implemented",
            "message": "Autonomous GAN harness not yet implemented. Use kb_scrape instead."
        }
    
    # Parse simple spec format: "KB name from URL"
    parts = spec.split(" from ")
    if len(parts) != 2:
        return {
            "status": "error",
            "error": "Spec format: 'kb-name from https://url'"
        }
    
    kb_name = parts[0].strip()
    url = parts[1].strip()
    
    # Delegate to kb_scrape
    return kb_scrape(url, mode="permanent", storage="hybrid", depth="full", name=kb_name)


@mcp.tool()
def kb_update(kb_name: str) -> dict:
    """Update knowledge base from its sources.
    
    Args:
        kb_name: Name of KB to update
        
    Returns:
        Dict with update status
    """
    return {
        "status": "not_implemented",
        "message": "KB update not yet implemented. Re-scrape to update."
    }


if __name__ == "__main__":
    mcp.run()
