# KB-Forge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-agent knowledge base system with CLI, MCP server, standalone skills, and GAN-style autonomous agent for scraping docs and making them retrievable.

**Architecture:** Python core library with storage backends (markdown/obsidian/chroma/hybrid), CLI interface, MCP server for Claude/Codex integration, and standalone skills following skill-forge pattern. GAN-harness for autonomous KB building with Planner/Generator/Evaluator agents.

**Tech Stack:** Python 3.11+, ChromaDB, sentence-transformers, Firecrawl MCP, Tavily MCP, Typer (CLI), FastMCP (MCP server)

---

## File Structure Overview

```
kb-forge/
├── pyproject.toml
├── README.md
├── src/
│   └── kb_forge/
│       ├── __init__.py
│       ├── scraper.py
│       ├── storage.py
│       ├── context_engine.py
│       ├── kb_index.py
│       ├── cli.py
│       ├── backends/
│       │   ├── __init__.py
│       │   ├── markdown.py
│       │   ├── obsidian.py
│       │   ├── chroma.py
│       │   └── hybrid.py
│       └── mcp_server.py
├── skills/
│   ├── skill-kb-scrape/
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── metadata.json
│   ├── skill-kb-context/
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── metadata.json
│   └── skill-kb-query/
│       ├── SKILL.md
│       ├── README.md
│       └── metadata.json
├── agents/
│   └── kb-builder-harness/
│       ├── planner_agent.md
│       ├── generator_agent.md
│       ├── evaluator_agent.md
│       ├── harness.py
│       └── config.yaml
└── tests/
    ├── test_scraper.py
    ├── test_storage.py
    ├── test_context_engine.py
    └── test_kb_index.py
```

---

## Phase 1: Project Setup

### Task 1: Initialize Python Project

**Files:**
- Create: `kb-forge/pyproject.toml`
- Create: `kb-forge/README.md`
- Create: `kb-forge/src/kb_forge/__init__.py`

- [ ] **Step 1: Create pyproject.toml**

```toml
[project]
name = "kb-forge"
version = "0.1.0"
description = "Knowledge Base Forge — Multi-agent system for scraping and structuring docs"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "typer>=0.12.0",
    "chromadb>=0.5.0",
    "sentence-transformers>=3.0.0",
    "fastmcp>=0.4.0",
    "pydantic>=2.0.0",
    "pyyaml>=6.0",
    "requests>=2.31.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "black>=24.0.0",
    "ruff>=0.4.0",
]

[project.scripts]
kb-forge = "kb_forge.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

- [ ] **Step 2: Create directory structure**

Run:
```bash
mkdir -p kb-forge/src/kb_forge/backends
mkdir -p kb-forge/skills/skill-kb-scrape
mkdir -p kb-forge/skills/skill-kb-context
mkdir -p kb-forge/skills/skill-kb-query
mkdir -p kb-forge/agents/kb-builder-harness
mkdir -p kb-forge/tests
```

- [ ] **Step 3: Create root __init__.py**

Create: `kb-forge/src/kb_forge/__init__.py`

```python
"""KB-Forge: Knowledge Base Forge."""

__version__ = "0.1.0"

from .scraper import Scraper
from .storage import StorageManager
from .context_engine import ContextEngine
from .kb_index import KBIndex

__all__ = ["Scraper", "StorageManager", "ContextEngine", "KBIndex"]
```

- [ ] **Step 4: Commit**

```bash
git add kb-forge/
git commit -m "feat: initialize kb-forge project structure"
```

---

## Phase 2: Core Components (MVP)

### Task 2: Scraper Module

**Files:**
- Create: `kb-forge/src/kb_forge/scraper.py`
- Create: `kb-forge/tests/test_scraper.py`

- [ ] **Step 1: Write failing test**

Create: `kb-forge/tests/test_scraper.py`

```python
"""Tests for scraper module."""

import pytest
from kb_forge.scraper import Scraper, ScrapeScope


class TestScraper:
    """Test Scraper class."""

    def test_scraper_initialization(self):
        """Test scraper can be initialized."""
        scraper = Scraper()
        assert scraper is not None

    def test_scrape_single_url_mock(self, tmp_path, monkeypatch):
        """Test scraping a single URL with mocked MCP response."""
        scraper = Scraper()
        
        # Mock the MCP call
        def mock_call_mcp(url):
            return "# Test Document\n\nThis is test content."
        
        monkeypatch.setattr(scraper, "_call_firecrawl", mock_call_mcp)
        
        result = scraper.scrape("https://example.com/docs", scope=ScrapeScope.SINGLE)
        
        assert result["url"] == "https://example.com/docs"
        assert result["content"] == "# Test Document\n\nThis is test content."
        assert result["scope"] == "single"
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd kb-forge
pip install -e ".[dev]"
pytest tests/test_scraper.py -v
```
Expected: FAIL with "ModuleNotFoundError: No module named 'kb_forge.scraper'"

- [ ] **Step 3: Write minimal implementation**

Create: `kb-forge/src/kb_forge/scraper.py`

```python
"""Web scraper using Firecrawl/Tavily MCP."""

from enum import Enum
from typing import Dict, List, Optional
from pathlib import Path
import json


class ScrapeScope(str, Enum):
    """Scraping scope options."""
    SINGLE = "single"
    SECTION = "section"
    FULL = "full"


class Scraper:
    """Scrape documentation from URLs."""

    def __init__(self, mcp_tool: str = "firecrawl"):
        """Initialize scraper.
        
        Args:
            mcp_tool: Which MCP tool to use (firecrawl or tavily)
        """
        self.mcp_tool = mcp_tool

    def _call_firecrawl(self, url: str, scope: str = "single") -> str:
        """Call Firecrawl MCP tool.
        
        This is a placeholder - actual implementation uses MCP.
        """
        # TODO: Implement actual MCP call
        raise NotImplementedError("MCP integration not yet implemented")

    def scrape(
        self,
        url: str,
        scope: ScrapeScope = ScrapeScope.SINGLE,
        output_dir: Optional[Path] = None
    ) -> Dict:
        """Scrape content from URL.
        
        Args:
            url: Target URL to scrape
            scope: SINGLE, SECTION, or FULL
            output_dir: Where to save raw content
            
        Returns:
            Dict with url, content, scope, and saved path
        """
        content = self._call_firecrawl(url, scope.value)
        
        result = {
            "url": url,
            "content": content,
            "scope": scope.value,
            "saved_path": None
        }
        
        if output_dir:
            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate filename from URL
            safe_name = url.replace("https://", "").replace("http://", "").replace("/", "_")
            file_path = output_dir / f"{safe_name}.md"
            
            file_path.write_text(content, encoding="utf-8")
            result["saved_path"] = str(file_path)
        
        return result

    def scrape_batch(
        self,
        urls: List[str],
        scope: ScrapeScope = ScrapeScope.SINGLE,
        output_dir: Optional[Path] = None
    ) -> List[Dict]:
        """Scrape multiple URLs.
        
        Args:
            urls: List of URLs to scrape
            scope: SINGLE, SECTION, or FULL
            output_dir: Where to save raw content
            
        Returns:
            List of scrape results
        """
        results = []
        for url in urls:
            result = self.scrape(url, scope, output_dir)
            results.append(result)
        return results
```

- [ ] **Step 4: Run test to verify it passes (partially)**

Run:
```bash
pytest tests/test_scraper.py::TestScraper::test_scraper_initialization -v
```
Expected: PASS

Run:
```bash
pytest tests/test_scraper.py::TestScraper::test_scrape_single_url_mock -v
```
Expected: PASS (with mock)

- [ ] **Step 5: Commit**

```bash
git add kb-forge/src/kb_forge/scraper.py kb-forge/tests/test_scraper.py
git commit -m "feat: add scraper module with Scraper class"
```

---

### Task 3: Storage Backend Base

**Files:**
- Create: `kb-forge/src/kb_forge/backends/__init__.py`
- Create: `kb-forge/src/kb_forge/storage.py`
- Create: `kb-forge/tests/test_storage.py`

- [ ] **Step 1: Write failing test**

Create: `kb-forge/tests/test_storage.py`

```python
"""Tests for storage module."""

import pytest
from pathlib import Path
from kb_forge.storage import StorageManager
from kb_forge.backends.markdown import MarkdownBackend


class TestStorageManager:
    """Test StorageManager class."""

    def test_storage_manager_initialization(self, tmp_path):
        """Test storage manager can be initialized with path."""
        manager = StorageManager(base_path=tmp_path)
        assert manager is not None
        assert manager.base_path == tmp_path

    def test_get_backend_markdown(self, tmp_path):
        """Test getting markdown backend."""
        manager = StorageManager(base_path=tmp_path)
        backend = manager.get_backend("markdown")
        
        assert isinstance(backend, MarkdownBackend)

    def test_create_kb_temp(self, tmp_path):
        """Test creating temporary KB."""
        manager = StorageManager(base_path=tmp_path)
        kb_path = manager.create_kb(
            name="test-docs",
            lifecycle="temp",
            storage_backend="markdown"
        )
        
        assert kb_path.exists()
        assert (kb_path / "raw").exists()
        assert (kb_path / "chunks.json").exists()
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
pytest tests/test_storage.py -v
```
Expected: FAIL with import errors

- [ ] **Step 3: Write implementation**

Create: `kb-forge/src/kb_forge/backends/__init__.py`

```python
"""Storage backends for KB-Forge."""

from .markdown import MarkdownBackend
from .obsidian import ObsidianBackend
from .chroma import ChromaBackend
from .hybrid import HybridBackend

__all__ = [
    "MarkdownBackend",
    "ObsidianBackend", 
    "ChromaBackend",
    "HybridBackend"
]
```

Create: `kb-forge/src/kb_forge/backends/markdown.py`

```python
"""Markdown file storage backend."""

from pathlib import Path
from typing import Dict, List, Optional
import json


class MarkdownBackend:
    """Store KB as flat markdown files."""

    def __init__(self, base_path: Path):
        """Initialize markdown backend.
        
        Args:
            base_path: Root directory for KB storage
        """
        self.base_path = Path(base_path)

    def create_kb(
        self,
        name: str,
        lifecycle: str = "temp"
    ) -> Path:
        """Create a new KB.
        
        Args:
            name: KB name
            lifecycle: temp or permanent
            
        Returns:
            Path to KB root
        """
        if lifecycle == "temp":
            kb_path = self.base_path / "temp" / name
        else:
            kb_path = self.base_path / "kb" / name

        kb_path.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        (kb_path / "docs").mkdir(exist_ok=True)
        (kb_path / "index").mkdir(exist_ok=True)
        
        # Initialize metadata
        metadata = {
            "name": name,
            "lifecycle": lifecycle,
            "backend": "markdown",
            "created": str(Path().stat().st_ctime)
        }
        
        (kb_path / "index" / "metadata.json").write_text(
            json.dumps(metadata, indent=2),
            encoding="utf-8"
        )
        
        return kb_path

    def save_document(
        self,
        kb_path: Path,
        doc_id: str,
        content: str,
        metadata: Optional[Dict] = None
    ) -> Path:
        """Save a document to the KB.
        
        Args:
            kb_path: Path to KB root
            doc_id: Unique document ID
            content: Markdown content
            metadata: Optional metadata dict
            
        Returns:
            Path to saved file
        """
        docs_dir = kb_path / "docs"
        docs_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = docs_dir / f"{doc_id}.md"
        file_path.write_text(content, encoding="utf-8")
        
        if metadata:
            meta_path = docs_dir / f"{doc_id}.json"
            meta_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
        
        return file_path

    def get_document(self, kb_path: Path, doc_id: str) -> Optional[str]:
        """Retrieve a document.
        
        Args:
            kb_path: Path to KB root
            doc_id: Document ID
            
        Returns:
            Document content or None
        """
        file_path = kb_path / "docs" / f"{doc_id}.md"
        if file_path.exists():
            return file_path.read_text(encoding="utf-8")
        return None
```

Create: `kb-forge/src/kb_forge/storage.py`

```python
"""Storage manager for KB-Forge."""

from pathlib import Path
from typing import Dict, Optional, Union

from .backends.markdown import MarkdownBackend
from .backends.obsidian import ObsidianBackend
from .backends.chroma import ChromaBackend
from .backends.hybrid import HybridBackend


class StorageManager:
    """Manage KB storage backends."""

    BACKENDS = {
        "markdown": MarkdownBackend,
        "obsidian": ObsidianBackend,
        "chroma": ChromaBackend,
        "hybrid": HybridBackend
    }

    def __init__(
        self,
        base_path: Optional[Path] = None
    ):
        """Initialize storage manager.
        
        Args:
            base_path: Root path for all KB storage (default: ~/.kb-forge)
        """
        if base_path is None:
            base_path = Path.home() / ".kb-forge"
        
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def get_backend(self, backend_name: str):
        """Get a storage backend instance.
        
        Args:
            backend_name: markdown, obsidian, chroma, or hybrid
            
        Returns:
            Backend instance
        """
        backend_class = self.BACKENDS.get(backend_name)
        if not backend_class:
            raise ValueError(f"Unknown backend: {backend_name}")
        
        return backend_class(self.base_path)

    def create_kb(
        self,
        name: str,
        lifecycle: str = "temp",
        storage_backend: str = "markdown"
    ) -> Path:
        """Create a new knowledge base.
        
        Args:
            name: KB name
            lifecycle: temp or permanent
            storage_backend: Which backend to use
            
        Returns:
            Path to KB root
        """
        backend = self.get_backend(storage_backend)
        return backend.create_kb(name, lifecycle)

    def list_kbs(self, lifecycle: Optional[str] = None) -> Dict[str, Path]:
        """List all knowledge bases.
        
        Args:
            lifecycle: Filter by temp/permanent (None = all)
            
        Returns:
            Dict mapping KB names to paths
        """
        kbs = {}
        
        for lc in ([lifecycle] if lifecycle else ["temp", "kb"]):
            lc_path = self.base_path / lc
            if lc_path.exists():
                for kb_dir in lc_path.iterdir():
                    if kb_dir.is_dir():
                        kbs[kb_dir.name] = kb_dir
        
        return kbs
```

- [ ] **Step 4: Create placeholder backend files**

Create: `kb-forge/src/kb_forge/backends/obsidian.py`

```python
"""Obsidian vault storage backend."""

from pathlib import Path


class ObsidianBackend:
    """Store KB as Obsidian vault."""

    def __init__(self, base_path: Path):
        self.base_path = Path(base_path)

    def create_kb(self, name: str, lifecycle: str = "temp") -> Path:
        """Create Obsidian vault structure."""
        # Placeholder - implement in Task 6
        kb_path = self.base_path / "obsidian" / name
        kb_path.mkdir(parents=True, exist_ok=True)
        return kb_path
```

Create: `kb-forge/src/kb_forge/backends/chroma.py`

```python
"""ChromaDB vector storage backend."""

from pathlib import Path


class ChromaBackend:
    """Store KB as ChromaDB vector index."""

    def __init__(self, base_path: Path):
        self.base_path = Path(base_path)

    def create_kb(self, name: str, lifecycle: str = "temp") -> Path:
        """Create ChromaDB index."""
        # Placeholder - implement in Task 6
        kb_path = self.base_path / "indices" / f"{name}.chroma"
        kb_path.mkdir(parents=True, exist_ok=True)
        return kb_path
```

Create: `kb-forge/src/kb_forge/backends/hybrid.py`

```python
"""Hybrid storage backend (SQLite + files + vectors)."""

from pathlib import Path


class HybridBackend:
    """Store KB with hybrid approach."""

    def __init__(self, base_path: Path):
        self.base_path = Path(base_path)

    def create_kb(self, name: str, lifecycle: str = "temp") -> Path:
        """Create hybrid storage structure."""
        # Placeholder - implement in Task 6
        kb_path = self.base_path / "kb" / name
        kb_path.mkdir(parents=True, exist_ok=True)
        return kb_path
```

- [ ] **Step 5: Run tests**

Run:
```bash
pytest tests/test_storage.py -v
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add kb-forge/src/kb_forge/storage.py kb-forge/src/kb_forge/backends/
git add kb-forge/tests/test_storage.py
git commit -m "feat: add storage manager and markdown backend"
```

---

### Task 4: Context Engine

**Files:**
- Create: `kb-forge/src/kb_forge/context_engine.py`
- Create: `kb-forge/tests/test_context_engine.py`

- [ ] **Step 1: Write failing test**

Create: `kb-forge/tests/test_context_engine.py`

```python
"""Tests for context engine."""

import pytest
from pathlib import Path
from kb_forge.context_engine import ContextEngine, ChunkStrategy


class TestContextEngine:
    """Test ContextEngine class."""

    def test_context_engine_initialization(self):
        """Test context engine can be initialized."""
        engine = ContextEngine()
        assert engine is not None

    def test_chunk_semantic(self):
        """Test semantic chunking."""
        engine = ContextEngine()
        
        content = """# Title

This is the first paragraph with some content.

## Section 1

More content here. This is a longer paragraph that should be processed.

## Section 2

Final section with content."""

        chunks = engine.chunk(content, strategy=ChunkStrategy.SEMANTIC)
        
        assert len(chunks) > 0
        assert all("text" in chunk for chunk in chunks)
        assert all("metadata" in chunk for chunk in chunks)

    def test_chunk_fixed_size(self):
        """Test fixed-size chunking."""
        engine = ContextEngine()
        
        content = "Word " * 1000  # Long content
        chunks = engine.chunk(content, strategy=ChunkStrategy.FIXED, chunk_size=100)
        
        assert len(chunks) > 1
        # Each chunk should be approximately the right size
        for chunk in chunks[:-1]:  # Skip last chunk
            assert len(chunk["text"].split()) <= 110  # Allow small variance
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
pytest tests/test_context_engine.py -v
```
Expected: FAIL

- [ ] **Step 3: Write implementation**

Create: `kb-forge/src/kb_forge/context_engine.py`

```python
"""Context engineering for optimal agent retrieval."""

from enum import Enum
from typing import Dict, List, Optional
import re


class ChunkStrategy(str, Enum):
    """Chunking strategy options."""
    SEMANTIC = "semantic"  # Split by headings/paragraphs
    FIXED = "fixed"        # Fixed token/word count


class ContextEngine:
    """Transform content into agent-optimized format."""

    def __init__(
        self,
        embedding_model: Optional[str] = None,
        default_chunk_size: int = 500
    ):
        """Initialize context engine.
        
        Args:
            embedding_model: Name of sentence-transformers model
            default_chunk_size: Default chunk size in words
        """
        self.embedding_model = embedding_model or "all-MiniLM-L6-v2"
        self.default_chunk_size = default_chunk_size

    def chunk(
        self,
        content: str,
        strategy: ChunkStrategy = ChunkStrategy.SEMANTIC,
        chunk_size: Optional[int] = None,
        overlap: int = 50
    ) -> List[Dict]:
        """Chunk content for optimal retrieval.
        
        Args:
            content: Markdown content to chunk
            strategy: SEMANTIC or FIXED
            chunk_size: Target chunk size (words for FIXED, ignored for SEMANTIC)
            overlap: Word overlap between chunks (for FIXED strategy)
            
        Returns:
            List of chunks with text and metadata
        """
        if strategy == ChunkStrategy.SEMANTIC:
            return self._chunk_semantic(content)
        else:
            return self._chunk_fixed(content, chunk_size or self.default_chunk_size, overlap)

    def _chunk_semantic(self, content: str) -> List[Dict]:
        """Chunk by semantic boundaries (headings, paragraphs).
        
        Args:
            content: Markdown content
            
        Returns:
            List of semantic chunks
        """
        chunks = []
        
        # Split by markdown headings
        heading_pattern = r'^(#{1,6}\s+.+)$'
        sections = re.split(f'(?m)({heading_pattern})', content)
        
        current_heading = ""
        current_content = []
        
        for section in sections:
            if re.match(heading_pattern, section):
                # Save previous section if exists
                if current_content:
                    chunk_text = "\n".join(current_content).strip()
                    if chunk_text:
                        chunks.append({
                            "text": chunk_text,
                            "metadata": {
                                "heading": current_heading,
                                "type": "section"
                            }
                        })
                current_heading = section.strip()
                current_content = [section]
            else:
                # Split section into paragraphs
                paragraphs = section.split('\n\n')
                for para in paragraphs:
                    para = para.strip()
                    if para:
                        current_content.append(para)
        
        # Don't forget last section
        if current_content:
            chunk_text = "\n".join(current_content).strip()
            if chunk_text:
                chunks.append({
                    "text": chunk_text,
                    "metadata": {
                        "heading": current_heading,
                        "type": "section"
                    }
                })
        
        return chunks

    def _chunk_fixed(
        self,
        content: str,
        chunk_size: int,
        overlap: int
    ) -> List[Dict]:
        """Chunk by fixed word count.
        
        Args:
            content: Text content
            chunk_size: Target words per chunk
            overlap: Words to overlap between chunks
            
        Returns:
            List of fixed-size chunks
        """
        words = content.split()
        chunks = []
        
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk_words = words[start:end]
            
            chunks.append({
                "text": " ".join(chunk_words),
                "metadata": {
                    "start_word": start,
                    "end_word": end,
                    "type": "fixed"
                }
            })
            
            start += chunk_size - overlap
        
        return chunks

    def prepare_for_embedding(
        self,
        chunks: List[Dict],
        add_context: bool = True
    ) -> List[Dict]:
        """Prepare chunks for embedding.
        
        Args:
            chunks: List of chunks from chunk()
            add_context: Whether to prepend heading context
            
        Returns:
            Chunks with embedding-ready text
        """
        prepared = []
        
        for chunk in chunks:
            text = chunk["text"]
            
            if add_context and chunk["metadata"].get("heading"):
                # Prepend heading for context
                heading = chunk["metadata"]["heading"].lstrip('#').strip()
                text = f"Context: {heading}\n\n{text}"
            
            prepared.append({
                **chunk,
                "embedding_text": text
            })
        
        return prepared
```

- [ ] **Step 4: Run tests**

Run:
```bash
pytest tests/test_context_engine.py -v
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add kb-forge/src/kb_forge/context_engine.py kb-forge/tests/test_context_engine.py
git commit -m "feat: add context engine with semantic and fixed chunking"
```

---

### Task 5: KB Index (Vector Store)

**Files:**
- Create: `kb-forge/src/kb_forge/kb_index.py`
- Create: `kb-forge/tests/test_kb_index.py`

- [ ] **Step 1: Write failing test**

Create: `kb-forge/tests/test_kb_index.py`

```python
"""Tests for KB index."""

import pytest
from pathlib import Path
from kb_forge.kb_index import KBIndex


class TestKBIndex:
    """Test KBIndex class."""

    def test_kb_index_initialization(self, tmp_path):
        """Test KB index can be initialized."""
        index = KBIndex(kb_path=tmp_path / "test")
        assert index is not None
        assert index.kb_path == tmp_path / "test"

    def test_add_document(self, tmp_path):
        """Test adding document to index."""
        index = KBIndex(kb_path=tmp_path / "test")
        index.initialize()
        
        chunks = [
            {"text": "First chunk", "metadata": {"doc_id": "doc1"}},
            {"text": "Second chunk", "metadata": {"doc_id": "doc1"}}
        ]
        
        # Without embeddings for test
        index.add_document("doc1", chunks, embed=False)
        
        # Verify document added
        assert index.has_document("doc1")
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
pytest tests/test_kb_index.py -v
```
Expected: FAIL

- [ ] **Step 3: Write implementation**

Create: `kb-forge/src/kb_forge/kb_index.py`

```python
"""Knowledge base vector index using ChromaDB."""

from pathlib import Path
from typing import Dict, List, Optional
import json
import hashlib


class KBIndex:
    """Manage vector index for a knowledge base."""

    def __init__(
        self,
        kb_path: Path,
        collection_name: str = "default"
    ):
        """Initialize KB index.
        
        Args:
            kb_path: Path to KB root directory
            collection_name: Name of ChromaDB collection
        """
        self.kb_path = Path(kb_path)
        self.collection_name = collection_name
        self.chroma_path = self.kb_path / "index" / "chroma"
        self.manifest_path = self.kb_path / "index" / "manifest.yaml"
        
        self._chroma_client = None
        self._collection = None

    def initialize(self) -> None:
        """Initialize index directories and ChromaDB."""
        self.chroma_path.mkdir(parents=True, exist_ok=True)
        (self.kb_path / "index").mkdir(parents=True, exist_ok=True)
        
        # Initialize manifest
        if not self.manifest_path.exists():
            manifest = {
                "name": self.kb_path.name,
                "collection": self.collection_name,
                "documents": {},
                "version": "1.0.0"
            }
            self._save_manifest(manifest)

    def _get_chroma_client(self):
        """Lazy initialization of ChromaDB client."""
        if self._chroma_client is None:
            try:
                import chromadb
                self._chroma_client = chromadb.PersistentClient(
                    path=str(self.chroma_path)
                )
            except ImportError:
                raise RuntimeError("ChromaDB not installed. Run: pip install chromadb")
        return self._chroma_client

    def _get_collection(self):
        """Get or create ChromaDB collection."""
        if self._collection is None:
            client = self._get_chroma_client()
            self._collection = client.get_or_create_collection(
                name=self.collection_name
            )
        return self._collection

    def _save_manifest(self, manifest: Dict) -> None:
        """Save manifest to disk."""
        import yaml
        self.manifest_path.write_text(
            yaml.dump(manifest, default_flow_style=False),
            encoding="utf-8"
        )

    def _load_manifest(self) -> Dict:
        """Load manifest from disk."""
        import yaml
        if self.manifest_path.exists():
            content = self.manifest_path.read_text(encoding="utf-8")
            return yaml.safe_load(content)
        return {"documents": {}}

    def add_document(
        self,
        doc_id: str,
        chunks: List[Dict],
        source_url: Optional[str] = None,
        embed: bool = True
    ) -> None:
        """Add document chunks to index.
        
        Args:
            doc_id: Unique document identifier
            chunks: List of chunks with text and metadata
            source_url: Original source URL
            embed: Whether to compute embeddings (set False for testing)
        """
        manifest = self._load_manifest()
        
        # Generate chunk IDs
        chunk_ids = []
        texts = []
        metadatas = []
        
        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_chunk_{i}"
            chunk_ids.append(chunk_id)
            texts.append(chunk["text"])
            
            # Build metadata
            meta = {
                "doc_id": doc_id,
                "chunk_index": i,
                **chunk.get("metadata", {})
            }
            if source_url:
                meta["source_url"] = source_url
            
            metadatas.append(meta)
        
        # Add to ChromaDB if embeddings enabled
        if embed:
            collection = self._get_collection()
            
            # Compute embeddings using sentence-transformers
            embeddings = self._compute_embeddings(texts)
            
            collection.add(
                ids=chunk_ids,
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas
            )
        
        # Update manifest
        manifest["documents"][doc_id] = {
            "chunks": len(chunks),
            "source_url": source_url,
            "chunk_ids": chunk_ids
        }
        self._save_manifest(manifest)

    def _compute_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Compute embeddings for texts."""
        try:
            from sentence_transformers import SentenceTransformer
            
            model = SentenceTransformer(self.embedding_model)
            embeddings = model.encode(texts, show_progress_bar=False)
            return embeddings.tolist()
        except ImportError:
            raise RuntimeError(
                "sentence-transformers not installed. "
                "Run: pip install sentence-transformers"
            )

    def query(
        self,
        query_text: str,
        top_k: int = 5,
        include_metadata: bool = True
    ) -> List[Dict]:
        """Query the index for relevant chunks.
        
        Args:
            query_text: Query string
            top_k: Number of results to return
            include_metadata: Whether to include metadata
            
        Returns:
            List of results with text, score, and metadata
        """
        collection = self._get_collection()
        
        # Compute query embedding
        query_embedding = self._compute_embeddings([query_text])[0]
        
        # Query ChromaDB
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "distances", "metadatas"] if include_metadata else ["documents", "distances"]
        )
        
        # Format results
        formatted = []
        for i in range(len(results["ids"][0])):
            formatted.append({
                "chunk_id": results["ids"][0][i],
                "text": results["documents"][0][i],
                "score": 1.0 - results["distances"][0][i],  # Convert distance to similarity
                "metadata": results["metadatas"][0][i] if include_metadata else {}
            })
        
        return formatted

    def has_document(self, doc_id: str) -> bool:
        """Check if document exists in index."""
        manifest = self._load_manifest()
        return doc_id in manifest.get("documents", {})

    @property
    def embedding_model(self) -> str:
        """Get embedding model name from manifest or default."""
        manifest = self._load_manifest()
        return manifest.get("embedding_model", "all-MiniLM-L6-v2")
```

- [ ] **Step 4: Run tests**

Run:
```bash
pytest tests/test_kb_index.py -v
```
Expected: PASS (with embed=False for test)

- [ ] **Step 5: Commit**

```bash
git add kb-forge/src/kb_forge/kb_index.py kb-forge/tests/test_kb_index.py
git commit -m "feat: add KB index with ChromaDB integration"
```

---

## Phase 3: CLI Interface

### Task 6: CLI Commands

**Files:**
- Create: `kb-forge/src/kb_forge/cli.py`
- Modify: `kb-forge/src/kb_forge/__init__.py`

- [ ] **Step 1: Create CLI module**

Create: `kb-forge/src/kb_forge/cli.py`

```python
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
    
    # Process with context engine
    engine = ContextEngine()
    chunks = engine.chunk(result["content"], strategy=ChunkStrategy.SEMANTIC)
    
    # Index
    kb_index = KBIndex(kb_path)
    kb_index.initialize()
    kb_index.add_document(kb_name, chunks, source_url=url)
    
    typer.echo(f"✓ KB created: {kb_path}")
    typer.echo(f"✓ Chunks indexed: {len(chunks)}")


@app.command()
def list(
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
    
    typer.echo(f"\nResults for: {question}\n")
    for i, result in enumerate(results, 1):
        typer.echo(f"{i}. Score: {result['score']:.3f}")
        typer.echo(f"   {result['text'][:200]}...")
        typer.echo()


def main():
    """Entry point for CLI."""
    app()


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Update __init__.py to export main**

Edit: `kb-forge/src/kb_forge/__init__.py`

```python
"""KB-Forge: Knowledge Base Forge."""

__version__ = "0.1.0"

from .scraper import Scraper
from .storage import StorageManager
from .context_engine import ContextEngine
from .kb_index import KBIndex
from .cli import main

__all__ = ["Scraper", "StorageManager", "ContextEngine", "KBIndex", "main"]
```

- [ ] **Step 3: Test CLI**

Run:
```bash
kb-forge --help
kb-forge list
```

- [ ] **Step 4: Commit**

```bash
git add kb-forge/src/kb_forge/cli.py
git add kb-forge/src/kb_forge/__init__.py
git commit -m "feat: add CLI with scrape, list, query commands"
```

---

## Phase 4: Skills (skill-forge Pattern)

### Task 7: Create skill-kb-scrape

**Files:**
- Create: `kb-forge/skills/skill-kb-scrape/SKILL.md`
- Create: `kb-forge/skills/skill-kb-scrape/README.md`
- Create: `kb-forge/skills/skill-kb-scrape/metadata.json`

- [ ] **Step 1: Create SKILL.md**

Create: `kb-forge/skills/skill-kb-scrape/SKILL.md`

```markdown
---
name: kb-scrape
description: "Scrape documentation from URLs and save to knowledge base. Use when user says 'scrape docs', 'get documentation', 'crawl site', or needs to capture web content for later retrieval."
author: "KB-Forge Team"
version: "1.0.0"
---

# KB-Scrape Skill

Scrape documentation from URLs using Firecrawl/Tavily MCP and save to a structured knowledge base.

## When to Use

- User says: "scrape docs", "get documentation", "crawl site"
- Building a knowledge base from web sources
- Capturing API documentation for a project
- Archiving reference material

## When NOT to Use

- Content is already local (use kb-index instead)
- Only need temporary caching (use browser MCP directly)
- URL requires authentication (not supported yet)

## Trigger Phrases

| Phrase | Example |
|--------|---------|
| "scrape" | "Scrape the React docs" |
| "get documentation" | "Get the documentation from docs.devin.ai" |
| "crawl" | "Crawl the entire API reference" |
| "capture docs" | "Capture these docs for my project" |

## Parameters

| Parameter | Required | Default | Options |
|-----------|----------|---------|---------|
| `url` | Yes | - | Any valid URL |
| `mode` | No | `temp` | `temp`, `permanent` |
| `storage` | No | `markdown` | `markdown`, `obsidian`, `chroma`, `hybrid` |
| `depth` | No | `single` | `single`, `section`, `full` |
| `name` | No | Auto | Custom KB name |

## Usage

### Via CLI

```bash
# Quick temporary scrape
kb-forge scrape https://docs.devin.ai/work-with-devin/devin-session-tools

# Permanent KB with Obsidian storage
kb-forge scrape https://docs.devin.ai --mode=permanent --storage=obsidian --depth=full --name=devin-docs
```

### Via MCP

```json
{
  "tool": "kb_scrape",
  "params": {
    "url": "https://docs.devin.ai",
    "mode": "permanent",
    "storage": "hybrid",
    "depth": "section"
  }
}
```

## Output

- KB created at `~/.kb-forge/kb/<name>/`
- Raw content in `raw/` directory
- Indexed content for retrieval
- Confirmation message with KB path

## Anti-Patterns

1. **Don't scrape without purpose** — Always clarify why the KB is needed
2. **Don't use temp for long-term needs** — Temp KBs auto-expire
3. **Don't ignore storage choice** — Agent should recommend based on use case

## Examples

### Example 1: Quick project reference

User: "I need the Devin session tools docs for my current task"

```bash
kb-forge scrape https://docs.devin.ai/work-with-devin/devin-session-tools --mode=temp
```

### Example 2: Building a reference KB

User: "Build me a permanent KB of the Devin docs in Obsidian format"

```bash
kb-forge scrape https://docs.devin.ai --mode=permanent --storage=obsidian --depth=full --name=devin-official
```
```

- [ ] **Step 2: Create README.md**

Create: `kb-forge/skills/skill-kb-scrape/README.md`

```markdown
# KB-Scrape Skill

Scrape documentation from URLs into a structured knowledge base.

## What It Does

This skill enables AI agents to capture web documentation and make it retrievable for later tasks. It uses Firecrawl or Tavily MCP for scraping, then structures and indexes the content.

## Supported Clients

- Claude Code (via MCP)
- Codex (via MCP)
- Cursor (via skill/rules)

## Prerequisites

- kb-forge CLI installed: `pip install kb-forge`
- Firecrawl or Tavily MCP server configured
- Storage directory writable (default: `~/.kb-forge`)

## Installation

1. Install kb-forge:
   ```bash
   pip install kb-forge
   ```

2. Configure MCP server (if using via Claude/Codex):
   ```json
   {
     "mcpServers": {
       "kb-forge": {
         "command": "python",
         "args": ["-m", "kb_forge.mcp_server"]
       }
     }
   }
   ```

## Trigger Conditions

- "scrape [URL]"
- "get documentation from [URL]"
- "crawl [site]"
- "capture docs"

## Expected Outcome

Knowledge base created at `~/.kb-forge/kb/<name>/` with:
- Raw scraped content
- Structured and chunked documents
- Vector index for retrieval
- Metadata manifest

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill definition and usage |
| `README.md` | Installation and setup |
| `metadata.json` | Package metadata |

## Troubleshooting

### "MCP server not found"

Ensure kb-forge is installed and `kb_forge.mcp_server` module is available.

### "Scraping failed"

Check that Firecrawl or Tavily MCP is configured. Some sites block scrapers.
```

- [ ] **Step 3: Create metadata.json**

Create: `kb-forge/skills/skill-kb-scrape/metadata.json`

```json
{
  "name": "KB-Scrape",
  "description": "Scrape documentation from URLs and save to structured knowledge base",
  "category": "skills",
  "author": {
    "name": "KB-Forge Team",
    "github": "kb-forge"
  },
  "version": "1.0.0",
  "requires": {
    "open_brain": false,
    "services": ["firecrawl-mcp"],
    "tools": ["kb-forge-cli"]
  },
  "tags": ["scraping", "documentation", "knowledge-base", "web-capture"],
  "difficulty": "beginner",
  "estimated_time": "5 minutes",
  "created": "2026-04-30",
  "updated": "2026-04-30"
}
```

- [ ] **Step 4: Commit**

```bash
git add kb-forge/skills/skill-kb-scrape/
git commit -m "feat: add skill-kb-scrape package"
```

---

### Task 8: Create skill-kb-context

**Files:**
- Create: `kb-forge/skills/skill-kb-context/SKILL.md`
- Create: `kb-forge/skills/skill-kb-context/README.md`
- Create: `kb-forge/skills/skill-kb-context/metadata.json`

- [ ] **Step 1: Create SKILL.md**

Create: `kb-forge/skills/skill-kb-context/SKILL.md`

```markdown
---
name: kb-context
description: "Prepare knowledge base content for optimal agent retrieval through chunking and indexing. Use when user says 'prepare context', 'index for RAG', 'make retrievable', or after scraping to optimize for agent use."
author: "KB-Forge Team"
version: "1.0.0"
---

# KB-Context Skill

Transform scraped content into agent-optimized format through semantic chunking and vector indexing.

## When to Use

- After scraping: "prepare this for retrieval"
- Optimizing existing KB: "re-index with better chunks"
- Setting up RAG: "make this retrievable"
- Changing chunk strategy: "use semantic chunking instead"

## When NOT to Use

- Content not yet scraped (use kb-scrape first)
- KB is already indexed and working well
- Just querying existing KB (use kb-query)

## Trigger Phrases

| Phrase | Example |
|--------|---------|
| "prepare" | "Prepare these docs for my agent" |
| "index" | "Index the Devin KB for RAG" |
| "make retrievable" | "Make this content retrievable" |
| "chunk" | "Re-chunk with semantic boundaries" |

## Parameters

| Parameter | Required | Default | Options |
|-----------|----------|---------|---------|
| `kb_name` | Yes | - | Name of existing KB |
| `chunk_strategy` | No | `semantic` | `semantic`, `fixed` |
| `chunk_size` | No | 500 | Words per chunk (fixed only) |
| `embedding_model` | No | `all-MiniLM-L6-v2` | Any sentence-transformers model |

## Usage

### Via CLI

```bash
# Prepare with semantic chunking
kb-forge context prepare --kb=devin-docs

# Re-index with fixed-size chunks
kb-forge context prepare --kb=devin-docs --chunk-strategy=fixed --chunk-size=300
```

## Chunking Strategies

### Semantic (Default)

Splits by markdown headings and paragraphs. Best for:
- Documentation with clear structure
- API references
- Content where context matters

### Fixed

Splits by word count with overlap. Best for:
- Long continuous text
- When consistent chunk size matters
- Simple retrieval needs

## Output

- Chunked documents in KB
- Vector embeddings computed
- Index manifest updated
- Ready for querying

## Anti-Patterns

1. **Don't chunk too small** — Chunks should be semantically complete
2. **Don't ignore overlap** — Fixed chunks need overlap to maintain context
3. **Don't re-index unnecessarily** — Indexing has compute cost

## Examples

### Example 1: After scraping

User: "I scraped the docs, now prepare them for my agent"

```bash
kb-forge context prepare --kb=devin-docs --chunk-strategy=semantic
```

### Example 2: Optimizing retrieval

User: "The chunks are too big, make them smaller"

```bash
kb-forge context prepare --kb=devin-docs --chunk-strategy=fixed --chunk-size=200
```
```

- [ ] **Step 2: Create README.md and metadata.json** (similar pattern)

- [ ] **Step 3: Commit**

```bash
git add kb-forge/skills/skill-kb-context/
git commit -m "feat: add skill-kb-context package"
```

---

### Task 9: Create skill-kb-query

**Files:**
- Create: `kb-forge/skills/skill-kb-query/SKILL.md`
- Create: `kb-forge/skills/skill-kb-query/README.md`
- Create: `kb-forge/skills/skill-kb-query/metadata.json`

- [ ] **Step 1: Create SKILL.md**

Create: `kb-forge/skills/skill-kb-query/SKILL.md`

```markdown
---
name: kb-query
description: "Query a knowledge base using natural language. Use when user says 'ask KB', 'query knowledge base', 'search docs', or needs to retrieve information from a previously built KB."
author: "KB-Forge Team"
version: "1.0.0"
---

# KB-Query Skill

Query a knowledge base using natural language and retrieve relevant chunks with source attribution.

## When to Use

- User asks: "ask KB about...", "query knowledge base"
- Need information from previously scraped docs
- Cross-referencing multiple sources
- Fact-checking against documentation

## When NOT to Use

- KB doesn't exist yet (use kb-scrape first)
- General web search (use web search MCP)
- Asking about current events (KB may be stale)

## Trigger Phrases

| Phrase | Example |
|--------|---------|
| "ask KB" | "Ask the Devin KB about session tools" |
| "query" | "Query my docs for authentication info" |
| "search docs" | "Search the docs for API examples" |
| "what does KB say" | "What does the KB say about deployment?" |

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `kb_name` | Yes | - | Which KB to query |
| `question` | Yes | - | Natural language question |
| `top_k` | No | 5 | Number of results to return |
| `include_metadata` | No | true | Include source URLs, etc. |

## Usage

### Via CLI

```bash
# Simple query
kb-forge query "How do I use session tools?" --kb=devin-docs

# More results
kb-forge query "deployment options" --kb=devin-docs --top-k=10
```

### Via MCP

```json
{
  "tool": "kb_query",
  "params": {
    "kb_name": "devin-docs",
    "question": "How do I use session tools?",
    "top_k": 5
  }
}
```

## Output

Returns list of results:

```json
[
  {
    "chunk_id": "doc1_chunk_0",
    "text": "Session tools allow you to...",
    "score": 0.92,
    "metadata": {
      "doc_id": "devin-session-tools",
      "source_url": "https://docs.devin.ai/work-with-devin/devin-session-tools",
      "heading": "Session Tools Overview"
    }
  }
]
```

## Anti-Patterns

1. **Don't trust stale KBs** — Check crawl dates for time-sensitive info
2. **Don't ignore low scores** — Results below 0.7 may be irrelevant
3. **Don't forget attribution** — Always cite source URLs

## Examples

### Example 1: Simple query

User: "What does my Devin KB say about browser usage?"

```bash
kb-forge query "How to use the browser?" --kb=devin-docs
```

### Example 2: Research question

User: "Find all the authentication methods in the docs"

```bash
kb-forge query "authentication methods login" --kb=devin-docs --top-k=10
```
```

- [ ] **Step 2: Create README.md and metadata.json** (similar pattern)

- [ ] **Step 3: Commit**

```bash
git add kb-forge/skills/skill-kb-query/
git commit -m "feat: add skill-kb-query package"
```

---

## Phase 5: MCP Server

### Task 10: MCP Server Implementation

**Files:**
- Create: `kb-forge/src/kb_forge/mcp_server.py`

- [ ] **Step 1: Create MCP server**

Create: `kb-forge/src/kb_forge/mcp_server.py`

```python
"""MCP server for KB-Forge."""

from fastmcp import FastMCP
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
    name: str | None = None
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
    kb_index.add_document(kb_name, chunks, source_url=url)
    
    return {
        "status": "success",
        "kb_name": kb_name,
        "kb_path": str(kb_path),
        "chunks_indexed": len(chunks),
        "source_url": url
    }


@mcp.tool()
def kb_list(lifecycle: str | None = None) -> dict:
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
        # This would trigger the GAN harness
        # For now, return not-implemented
        return {
            "status": "not_implemented",
            "message": "Autonomous GAN harness not yet implemented. Use kb_scrape instead."
        }
    
    # Parse simple spec format: "KB name from URL"
    # Expected format: "devin-docs from https://docs.devin.ai"
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
    # This would re-scrape all sources in the manifest
    # For now, return not-implemented
    return {
        "status": "not_implemented",
        "message": "KB update not yet implemented. Re-scrape to update."
    }


if __name__ == "__main__":
    mcp.run()
```

- [ ] **Step 2: Commit**

```bash
git add kb-forge/src/kb_forge/mcp_server.py
git commit -m "feat: add MCP server with 5 tools"
```

---

## Phase 6: Advanced Backends (Optional Enhancement)

### Task 11: Complete Obsidian Backend

**Files:**
- Modify: `kb-forge/src/kb_forge/backends/obsidian.py`

- [ ] **Step 1: Full implementation**

Replace placeholder with full Obsidian backend that:
- Creates `.obsidian/` config
- Generates wiki-links between related docs
- Adds frontmatter with metadata
- Supports graph view

- [ ] **Step 2: Commit**

```bash
git add kb-forge/src/kb_forge/backends/obsidian.py
git commit -m "feat: complete obsidian backend implementation"
```

---

### Task 12: Complete Hybrid Backend

**Files:**
- Modify: `kb-forge/src/kb_forge/backends/hybrid.py`

- [ ] **Step 1: Full implementation**

Replace placeholder with hybrid backend that:
- Uses SQLite for metadata
- Stores raw files for inspection
- Chroma vectors for retrieval
- Syncs all three layers

- [ ] **Step 2: Commit**

```bash
git add kb-forge/src/kb_forge/backends/hybrid.py
git commit -m "feat: complete hybrid backend implementation"
```

---

## Phase 7: GAN-Harness (Autonomous Agent)

### Task 13: Create Agent Prompts

**Files:**
- Create: `kb-forge/agents/kb-builder-harness/planner_agent.md`
- Create: `kb-forge/agents/kb-builder-harness/generator_agent.md`
- Create: `kb-forge/agents/kb-builder-harness/evaluator_agent.md`

- [ ] **Step 1: Planner Agent**

Create: `kb-forge/agents/kb-builder-harness/planner_agent.md`

```markdown
# Planner Agent: KB-Builder

You are a Product Planner for knowledge base construction.

## Role

Take a user's request and produce a detailed KB construction specification.

## Input

User request like: "Build me a KB of the Devin docs"

## Output

KB Specification document:

```yaml
kb_name: devin-official
sources:
  - url: https://docs.devin.ai
    scope: full
    priority: high
    estimated_pages: 50
structure:
  sections:
    - name: getting-started
      patterns: ["/getting-started/*", "/quickstart*"]
    - name: core-features
      patterns: ["/features/*", "/work-with-devin/*"]
storage_backend: hybrid
lifecycle: permanent
quality_criteria:
  coverage: 0.9  # 90% of expected content
  retrievability: 0.8  # Top-3 results relevant 80% of time
```

## Questions to Ask

1. What documentation do you need? (provide URLs)
2. How comprehensive? (specific pages, sections, or full site?)
3. Storage preference? (markdown quick, obsidian visual, hybrid complete)
4. Temp or permanent? (one-time project vs long-term reference)

## Constraints

- Don't promise more than Firecrawl/Tavily can scrape
- Estimate page counts conservatively
- Flag JavaScript-heavy sites as risky
```

- [ ] **Step 2: Generator Agent**

Create: `kb-forge/agents/kb-builder-harness/generator_agent.md`

```markdown
# Generator Agent: KB-Builder

You are a Knowledge Base Generator.

## Role

Execute the KB specification: scrape, structure, and index content.

## Tools

- `kb_scrape`: Scrape URLs
- `kb_index`: Index content
- Read/Write: File operations

## Input

KB Specification from Planner

## Output

Built KB with manifest and indexed content

## Process

```
1. Read KB specification
2. For each source URL:
   a. Scrape content (respect scope: single/section/full)
   b. Structure by detected hierarchy
   c. Chunk semantically
   d. Index with embeddings
3. Write KB manifest
4. Return KB path and stats
```

## Iteration Loop

If Evaluator provides feedback:
1. Read feedback-NNN.md
2. Address all issues:
   - Missing content → re-scrape with different scope
   - Poor chunking → re-chunk with different strategy
   - Bad structure → reorganize
3. Re-index
4. Return for re-evaluation
```

- [ ] **Step 3: Evaluator Agent**

Create: `kb-forge/agents/kb-builder-harness/evaluator_agent.md`

```markdown
# Evaluator Agent: KB-Builder

You are a strict Knowledge Base Quality Evaluator.

## Role

Test the KB and provide ruthless, honest feedback.

## BE RUTHLESS

Your job is to find problems. Never say "good job". Always find issues.

## Evaluation Criteria

| Criterion | Weight | What to Check |
|-----------|--------|---------------|
| Coverage | 0.30 | Did we get the important content? Test with sample queries. |
| Structure | 0.25 | Is organization logical? Can you find sections easily? |
| Retrievability | 0.25 | Do queries return relevant results? Test 5-10 queries. |
| Chunk Quality | 0.20 | Are chunks semantically coherent? Not cut mid-sentence? |

## Testing Protocol

```
1. Read KB manifest
2. Sample content coverage:
   - List all documents
   - Check for gaps vs specification
3. Test retrievability:
   - Query 5-10 typical questions
   - Score relevance of top-3 results
4. Examine chunk quality:
   - Review 10 random chunks
   - Check boundaries make sense
5. Calculate weighted score
```

## Output

```yaml
score: 6.5
criteria_scores:
  coverage: 7
  structure: 6
  retrievability: 7
  chunk_quality: 6
issues:
  - "Missing section: API authentication not indexed"
  - "Poor chunking: chunks cut mid-code-block"
  - "Low retrievability: 'deployment' query returns irrelevant results"
recommendations:
  - "Re-scrape with section scope to get API docs"
  - "Use semantic chunking instead of fixed"
  - "Add more context to chunk metadata"
pass: false  # Score >= 7.0 to pass
```

## Rules

1. Score 7+ only if truly good (most first attempts score 4-6)
2. List ALL issues found, no matter how small
3. Give specific, actionable recommendations
4. Never praise, only critique
```

- [ ] **Step 4: Commit**

```bash
git add kb-forge/agents/kb-builder-harness/
git commit -m "feat: add GAN-harness agent prompts"
```

---

### Task 14: Create Harness Orchestrator

**Files:**
- Create: `kb-forge/agents/kb-builder-harness/harness.py`
- Create: `kb-forge/agents/kb-builder-harness/config.yaml`

- [ ] **Step 1: Create config.yaml**

Create: `kb-forge/agents/kb-builder-harness/config.yaml`

```yaml
# GAN Harness Configuration

max_iterations: 10
pass_threshold: 7.0

planner:
  model: opus
  prompt_file: planner_agent.md

generator:
  model: opus
  prompt_file: generator_agent.md

evaluator:
  model: opus
  prompt_file: evaluator_agent.md
  criteria:
    - coverage
    - structure
    - retrievability
    - chunk_quality
  weights:
    coverage: 0.30
    structure: 0.25
    retrievability: 0.25
    chunk_quality: 0.20

output:
  feedback_dir: ./feedback
  manifest_dir: ./manifests
```

- [ ] **Step 2: Create harness.py** (skeleton)

Create: `kb-forge/agents/kb-builder-harness/harness.py`

```python
"""GAN-style harness for autonomous KB building."""

import yaml
from pathlib import Path
from typing import Dict, List
import subprocess


class KBBuilderHarness:
    """Orchestrate Planner-Generator-Evaluator loop."""

    def __init__(self, config_path: Path = None):
        """Initialize harness with config."""
        if config_path is None:
            config_path = Path(__file__).parent / "config.yaml"
        
        self.config = yaml.safe_load(config_path.read_text())
        self.feedback_dir = Path(self.config["output"]["feedback_dir"])
        self.feedback_dir.mkdir(exist_ok=True)

    def run(
        self,
        user_request: str,
        max_iterations: int = None
    ) -> Dict:
        """Run the full harness loop.
        
        Args:
            user_request: What KB to build (e.g., "Devin docs")
            max_iterations: Override config max iterations
            
        Returns:
            Final result with KB path, score, and iteration count
        """
        max_iter = max_iterations or self.config["max_iterations"]
        threshold = self.config["pass_threshold"]
        
        # Phase 1: Planning
        spec = self._run_planner(user_request)
        
        # Phase 2-4: Generate-Evaluate loop
        for iteration in range(1, max_iter + 1):
            print(f"\n=== Iteration {iteration} ===")
            
            # Generate
            kb_result = self._run_generator(spec, iteration)
            
            # Evaluate
            evaluation = self._run_evaluator(kb_result, iteration)
            
            # Check pass
            if evaluation["pass"]:
                print(f"\n✓ PASSED with score {evaluation['score']}")
                return {
                    "status": "success",
                    "kb_path": kb_result["kb_path"],
                    "score": evaluation["score"],
                    "iterations": iteration,
                    "spec": spec
                }
            
            print(f"\n✗ FAILED with score {evaluation['score']}")
            
            # Write feedback for next iteration
            self._write_feedback(iteration, evaluation)
        
        # Max iterations reached
        return {
            "status": "max_iterations",
            "kb_path": kb_result["kb_path"],
            "score": evaluation["score"],
            "iterations": max_iter,
            "spec": spec
        }

    def _run_planner(self, user_request: str) -> Dict:
        """Run planner agent to create spec."""
        # Would invoke LLM with planner prompt
        # For now, placeholder
        return {
            "kb_name": "generated-kb",
            "sources": [],
            "storage_backend": "hybrid",
            "lifecycle": "permanent"
        }

    def _run_generator(self, spec: Dict, iteration: int) -> Dict:
        """Run generator agent to build KB."""
        # Would invoke LLM with generator prompt
        # For now, placeholder
        return {
            "kb_path": "~/.kb-forge/kb/generated-kb",
            "chunks_indexed": 0
        }

    def _run_evaluator(self, kb_result: Dict, iteration: int) -> Dict:
        """Run evaluator agent to test KB."""
        # Would invoke LLM with evaluator prompt
        # For now, placeholder
        return {
            "score": 0.0,
            "pass": False,
            "issues": []
        }

    def _write_feedback(self, iteration: int, evaluation: Dict):
        """Write feedback for generator to read."""
        feedback_path = self.feedback_dir / f"feedback-{iteration:03d}.md"
        
        content = f"""# Evaluator Feedback - Iteration {iteration}

Score: {evaluation['score']}

## Issues

"""
        for issue in evaluation.get("issues", []):
            content += f"- {issue}\n"
        
        content += "\n## Recommendations\n\n"
        for rec in evaluation.get("recommendations", []):
            content += f"- {rec}\n"
        
        feedback_path.write_text(content)


if __name__ == "__main__":
    harness = KBBuilderHarness()
    result = harness.run("Build me a KB of the Devin docs")
    print(result)
```

- [ ] **Step 3: Commit**

```bash
git add kb-forge/agents/kb-builder-harness/harness.py
git add kb-forge/agents/kb-builder-harness/config.yaml
git commit -m "feat: add GAN harness orchestrator"
```

---

## Final Verification

### Task 15: End-to-End Test

- [ ] **Step 1: Install and test CLI**

```bash
cd kb-forge
pip install -e ".[dev]"

# Test commands
kb-forge --help
kb-forge list
```

- [ ] **Step 2: Final commit**

```bash
git add .
git commit -m "release: kb-forge v0.1.0 complete"
```

---

## Summary

| Phase | Tasks | Output |
|-------|-------|--------|
| 1 | 1 | Project structure |
| 2 | 4 | Core modules (scraper, storage, context, index) |
| 3 | 1 | CLI interface |
| 4 | 3 | Three skill packages |
| 5 | 1 | MCP server |
| 6 | 2 | Advanced backends |
| 7 | 2 | GAN harness |

**Total tasks:** 15
**Estimated time:** 4-6 hours with subagent-driven development
