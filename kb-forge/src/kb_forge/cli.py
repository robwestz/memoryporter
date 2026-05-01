"""CLI for KB-Forge."""

from pathlib import Path
from typing import Optional
import typer

from .scraper import Scraper, ScrapeScope
from .storage import StorageManager
from .context_engine import ContextEngine, ChunkStrategy
from .kb_index import KBIndex

app = typer.Typer(help="KB-Forge: Knowledge Base Forge")


@app.command()
def scrape(
    url: str = typer.Argument(..., help="URL to scrape"),
    mode: str = typer.Option("temp", "--mode", help="temp or permanent"),
    storage: str = typer.Option("markdown", "--storage", help="markdown, obsidian, chroma, or hybrid"),
    depth: str = typer.Option("single", "--depth", help="single, section, or full"),
    name: Optional[str] = typer.Option(None, "--name", help="KB name (default: auto from URL)"),
):
    """Scrape documentation from URL."""
    typer.echo(f"Scraping {url}...")
    
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
    kb_index.add_document(kb_name, chunks, source_url=url, embed=False)  # Skip embeddings for speed
    
    typer.echo(f"✓ KB created: {kb_path}")
    typer.echo(f"✓ Chunks indexed: {len(chunks)}")


@app.command()
def list_kbs(
    lifecycle: Optional[str] = typer.Option(None, "--lifecycle", help="Filter: temp, permanent, or all"),
):
    """List all knowledge bases."""
    storage_mgr = StorageManager()
    
    filter_map = {"temp": "temp", "permanent": "kb", "all": None}
    lc_filter = filter_map.get(lifecycle)
    
    kbs = storage_mgr.list_kbs(lifecycle=lc_filter)
    
    if not kbs:
        typer.echo("No knowledge bases found.")
        return
    
    typer.echo("\nKnowledge Bases:")
    typer.echo("-" * 60)
    for name, path in sorted(kbs.items()):
        typer.echo(f"  {name:<30} {path}")


@app.command()
def query(
    question: str = typer.Argument(..., help="Question to ask"),
    kb: str = typer.Option(..., "--kb", help="KB name to query"),
    top_k: int = typer.Option(5, "--top-k", help="Number of results"),
):
    """Query a knowledge base."""
    storage_mgr = StorageManager()
    kbs = storage_mgr.list_kbs()
    
    if kb not in kbs:
        typer.echo(f"Error: KB '{kb}' not found.")
        raise typer.Exit(1)
    
    kb_path = kbs[kb]
    index = KBIndex(kb_path)
    
    results = index.query(question, top_k=top_k)
    
    if not results:
        typer.echo("No results found (ChromaDB may not be available).")
        return
    
    typer.echo(f"\nResults for: {question}\n")
    for i, result in enumerate(results, 1):
        typer.echo(f"{i}. Score: {result['score']:.3f}")
        typer.echo(f"   {result['text'][:200]}...")
        typer.echo()


@app.command()
def build(
    request: str = typer.Argument(..., help="What to build (e.g., 'Devin docs from https://docs.devin.ai')"),
    max_iter: int = typer.Option(10, "--max-iter", help="Maximum iterations"),
    threshold: float = typer.Option(7.0, "--threshold", help="Pass threshold (0-10)"),
):
    """Build KB autonomously using GAN-style harness."""
    from .agents.kb_builder_harness.harness import KBBuilderHarness
    
    typer.echo(f"Starting autonomous KB build...")
    typer.echo(f"Request: {request}")
    typer.echo(f"Max iterations: {max_iter}, Pass threshold: {threshold}")
    typer.echo()
    
    harness = KBBuilderHarness()
    result = harness.run(request, max_iterations=max_iter)
    
    typer.echo()
    typer.echo("=" * 60)
    if result.status == "success":
        typer.echo(f"✓ SUCCESS! Score: {result.score:.1f} >= {threshold}")
    elif result.status == "max_iterations":
        typer.echo(f"⚠ Max iterations reached. Score: {result.score:.1f}")
    else:
        typer.echo(f"✗ Failed")
    
    typer.echo(f"  KB Path: {result.kb_path}")
    typer.echo(f"  Iterations: {result.iterations}")
    typer.echo("=" * 60)


# This is needed for the entry point
def main():
    """Entry point for CLI."""
    app()
