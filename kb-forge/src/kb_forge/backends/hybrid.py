"""Hybrid storage backend (SQLite + files + vectors)."""

from pathlib import Path
from typing import Dict, List, Optional, Any
import json
import sqlite3


class HybridBackend:
    """Store KB with hybrid approach: SQLite metadata, files for content, Chroma vectors."""

    def __init__(self, base_path: Path):
        """Initialize hybrid backend.

        Args:
            base_path: Root directory for hybrid storage.
        """
        self.base_path = Path(base_path)

    def _get_db_path(self, kb_path: Path) -> Path:
        """Get SQLite database path."""
        return kb_path / "metadata" / "kb.db"

    def _init_database(self, kb_path: Path) -> None:
        """Initialize SQLite database with tables."""
        db_path = self._get_db_path(kb_path)
        db_path.parent.mkdir(parents=True, exist_ok=True)

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Documents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                source_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                chunk_count INTEGER DEFAULT 0
            )
        ''')

        # Chunks table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chunks (
                id TEXT PRIMARY KEY,
                doc_id TEXT,
                chunk_index INTEGER,
                start_word INTEGER,
                end_word INTEGER,
                FOREIGN KEY (doc_id) REFERENCES documents(id)
            )
        ''')

        # Metadata table for KB settings
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS kb_metadata (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        ''')

        conn.commit()
        conn.close()

    def create_kb(self, name: str, lifecycle: str = "temp") -> Path:
        """Create hybrid storage structure.

        Args:
            name: KB name
            lifecycle: temp or permanent

        Returns:
            Path to KB directory
        """
        kb_path = self.base_path / "kb" / name
        kb_path.mkdir(parents=True, exist_ok=True)

        # Create subdirectories
        (kb_path / "docs").mkdir(exist_ok=True)
        (kb_path / "vectors").mkdir(exist_ok=True)
        (kb_path / "metadata").mkdir(exist_ok=True)

        # Initialize database
        self._init_database(kb_path)

        # Save config
        config = {
            "name": name,
            "lifecycle": lifecycle,
            "backend": "hybrid",
            "version": "1.0.0"
        }
        (kb_path / "kb-config.json").write_text(
            json.dumps(config, indent=2), encoding="utf-8"
        )

        # Store in database
        db_path = self._get_db_path(kb_path)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO kb_metadata (key, value) VALUES (?, ?)",
            ("config", json.dumps(config))
        )
        conn.commit()
        conn.close()

        return kb_path

    def save_document(
        self,
        kb_path: Path,
        doc_id: str,
        content: str,
        metadata: Optional[Dict] = None,
        chunks: Optional[List[Dict]] = None
    ) -> Path:
        """Save document to all three layers.

        Args:
            kb_path: Path to KB
            doc_id: Document ID
            content: Markdown content
            metadata: Document metadata
            chunks: Chunk information

        Returns:
            Path to saved file
        """
        # Layer 1: Raw file
        docs_dir = kb_path / "docs"
        docs_dir.mkdir(parents=True, exist_ok=True)

        file_path = docs_dir / f"{doc_id}.md"
        file_path.write_text(content, encoding="utf-8")

        # Layer 2: SQLite metadata
        db_path = self._get_db_path(kb_path)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        source_url = metadata.get("source_url") if metadata else None
        chunk_count = len(chunks) if chunks else 0

        cursor.execute('''
            INSERT OR REPLACE INTO documents
            (id, source_url, chunk_count)
            VALUES (?, ?, ?)
        ''', (doc_id, source_url, chunk_count))

        # Store chunk info
        if chunks:
            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc_id}_chunk_{i}"
                meta = chunk.get("metadata", {})
                cursor.execute('''
                    INSERT OR REPLACE INTO chunks
                    (id, doc_id, chunk_index, start_word, end_word)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    chunk_id,
                    doc_id,
                    i,
                    meta.get("start_word", 0),
                    meta.get("end_word", 0)
                ))

        conn.commit()
        conn.close()

        return file_path

    def get_document(self, kb_path: Path, doc_id: str) -> Optional[str]:
        """Retrieve document content from file layer.

        Args:
            kb_path: Path to KB
            doc_id: Document ID

        Returns:
            Document content or None
        """
        file_path = kb_path / "docs" / f"{doc_id}.md"

        if file_path.exists():
            return file_path.read_text(encoding="utf-8")

        # Check if exists in metadata
        db_path = self._get_db_path(kb_path)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM documents WHERE id = ?", (doc_id,))
        result = cursor.fetchone()
        conn.close()

        if result:
            return ""  # Document exists but file is missing

        return None

    def get_metadata(self, kb_path: Path, doc_id: str) -> Optional[Dict]:
        """Get document metadata from SQLite.

        Args:
            kb_path: Path to KB
            doc_id: Document ID

        Returns:
            Metadata dictionary or None
        """
        db_path = self._get_db_path(kb_path)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT source_url, chunk_count, created_at
            FROM documents
            WHERE id = ?
        ''', (doc_id,))

        result = cursor.fetchone()
        conn.close()

        if result:
            return {
                "source_url": result[0],
                "chunk_count": result[1],
                "created_at": result[2]
            }

        return None

    def list_documents(self, kb_path: Path) -> List[str]:
        """List all document IDs from SQLite.

        Args:
            kb_path: Path to KB

        Returns:
            List of document IDs
        """
        db_path = self._get_db_path(kb_path)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM documents ORDER BY created_at DESC")
        results = cursor.fetchall()
        conn.close()

        return [r[0] for r in results]
