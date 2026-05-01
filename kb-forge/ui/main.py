"""Main entry point for KB-Forge UI."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import sys

# Add paths
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from server import app

# Ensure static and templates directories exist
static_dir = Path(__file__).parent / "static"
templates_dir = Path(__file__).parent / "templates"

if __name__ == "__main__":
    import uvicorn
    print("Starting KB-Forge UI...")
    print("Open http://localhost:8000 in your browser")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
