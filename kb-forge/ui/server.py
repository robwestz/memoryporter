"""FastAPI server for KB-Forge UI."""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Optional
import sys

# Add parent to path to import kb_forge
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from kb_forge.storage import StorageManager
from kb_forge.scraper import Scraper, ScrapeScope
from kb_forge.context_engine import ContextEngine, ChunkStrategy
from kb_forge.kb_index import KBIndex

app = FastAPI(title="KB-Forge API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory job store (replace with Redis/DB in production)
jobs = {}


@app.get("/", response_class=HTMLResponse)
def index():
    """Serve main HTML."""
    html_path = Path(__file__).parent / "templates" / "index.html"
    if html_path.exists():
        return html_path.read_text(encoding="utf-8")
    return "<h1>KB-Forge</h1><p>UI not built yet. Create templates/index.html</p>"


@app.post("/api/scrape")
def api_scrape(
    url: str,
    mode: str = "temp",
    storage: str = "markdown",
    depth: str = "single",
    name: Optional[str] = None
):
    """Scrape documentation from URL."""
    try:
        storage_mgr = StorageManager()
        kb_name = name or url.replace("https://", "").replace("http://", "").replace("/", "_")[:50]
        kb_path = storage_mgr.create_kb(kb_name, lifecycle=mode, storage_backend=storage)
        
        scraper = Scraper()
        scope = ScrapeScope(depth)
        result = scraper.scrape(url, scope=scope, output_dir=kb_path / "raw")
        
        engine = ContextEngine()
        chunks = engine.chunk(result["content"], strategy=ChunkStrategy.SEMANTIC)
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/list")
def api_list(lifecycle: Optional[str] = None):
    """List all knowledge bases."""
    storage_mgr = StorageManager()
    
    filter_map = {"temp": "temp", "permanent": "kb"}
    lc_filter = filter_map.get(lifecycle)
    
    kbs = storage_mgr.list_kbs(lifecycle=lc_filter)
    
    return {
        "knowledge_bases": {name: str(path) for name, path in kbs.items()},
        "count": len(kbs)
    }


@app.post("/api/query")
def api_query(kb_name: str, question: str, top_k: int = 5):
    """Query a knowledge base."""
    storage_mgr = StorageManager()
    kbs = storage_mgr.list_kbs()
    
    if kb_name not in kbs:
        raise HTTPException(status_code=404, detail=f"KB '{kb_name}' not found")
    
    kb_path = kbs[kb_name]
    index = KBIndex(kb_path)
    
    results = index.query(question, top_k=top_k)
    
    return {
        "status": "success",
        "kb_name": kb_name,
        "question": question,
        "results": results
    }


@app.post("/api/build")
def api_build(spec: str, autonomous: bool = False):
    """Build knowledge base from spec."""
    if autonomous:
        return {
            "status": "not_implemented",
            "message": "Autonomous GAN harness not yet implemented. Use scrape instead."
        }
    
    # Parse simple spec format: "KB name from URL"
    parts = spec.split(" from ")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Spec format: 'kb-name from https://url'")
    
    kb_name = parts[0].strip()
    url = parts[1].strip()
    
    # Delegate to scrape
    return api_scrape(url, mode="permanent", storage="hybrid", depth="full", name=kb_name)


@app.get("/api/status/{job_id}")
def api_status(job_id: str):
    """Get job status."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")
    
    return jobs[job_id]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
