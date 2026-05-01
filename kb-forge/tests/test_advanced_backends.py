"""Tests for advanced backends (Obsidian, Hybrid)."""

import pytest
from pathlib import Path
from kb_forge.backends.obsidian import ObsidianBackend
from kb_forge.backends.hybrid import HybridBackend


class TestObsidianBackend:
    """Test ObsidianBackend class."""

    def test_create_kb(self, tmp_path):
        """Test creating Obsidian vault."""
        backend = ObsidianBackend(tmp_path)
        kb_path = backend.create_kb("my-vault", lifecycle="permanent")

        assert kb_path.exists()
        assert (kb_path / ".obsidian").exists()
        assert (kb_path / ".kb-manifest.json").exists()

    def test_create_kb_app_config(self, tmp_path):
        """Test .obsidian/app.json created."""
        backend = ObsidianBackend(tmp_path)
        kb_path = backend.create_kb("my-vault")

        app_config = kb_path / ".obsidian" / "app.json"
        assert app_config.exists()

    def test_save_document_with_frontmatter(self, tmp_path):
        """Test document saved with YAML frontmatter."""
        backend = ObsidianBackend(tmp_path)
        kb_path = backend.create_kb("my-vault")

        content = "# My Note\n\nThis is content."
        metadata = {"source": "test-url", "author": "tester"}

        file_path = backend.save_document(kb_path, "note1", content, metadata)

        assert file_path.exists()
        saved = file_path.read_text()
        assert saved.startswith("---\n")
        assert "source" in saved
        assert "# My Note" in saved

    def test_save_document_with_links(self, tmp_path):
        """Test document with wiki-links."""
        backend = ObsidianBackend(tmp_path)
        kb_path = backend.create_kb("my-vault")

        content = "# Main Note"
        links = ["related-note", "another-note"]

        file_path = backend.save_document(kb_path, "main", content, links=links)
        saved = file_path.read_text()

        assert "[[related-note]]" in saved
        assert "[[another-note]]" in saved

    def test_get_document_strips_frontmatter(self, tmp_path):
        """Test get_document returns content without frontmatter."""
        backend = ObsidianBackend(tmp_path)
        kb_path = backend.create_kb("my-vault")

        content = "# Actual Content\n\nBody text."
        backend.save_document(kb_path, "doc1", content)

        retrieved = backend.get_document(kb_path, "doc1")
        assert "# Actual Content" in retrieved
        assert "---" not in retrieved  # Frontmatter stripped

    def test_generate_links(self, tmp_path):
        """Test link graph generation."""
        backend = ObsidianBackend(tmp_path)
        kb_path = backend.create_kb("my-vault")

        # Create documents with links
        backend.save_document(kb_path, "doc1", "Content", links=["doc2", "doc3"])
        backend.save_document(kb_path, "doc2", "Content2", links=["doc1"])

        links = backend.generate_links(kb_path)

        assert "doc1" in links
        assert "doc2" in links
        assert "doc2" in links["doc1"]
        assert "doc3" in links["doc1"]


class TestHybridBackend:
    """Test HybridBackend class."""

    def test_create_kb_structure(self, tmp_path):
        """Test hybrid KB structure created."""
        backend = HybridBackend(tmp_path)
        kb_path = backend.create_kb("hybrid-kb", lifecycle="permanent")

        assert kb_path.exists()
        assert (kb_path / "docs").exists()
        assert (kb_path / "vectors").exists()
        assert (kb_path / "metadata").exists()

    def test_create_kb_database(self, tmp_path):
        """Test SQLite database initialized."""
        backend = HybridBackend(tmp_path)
        kb_path = backend.create_kb("hybrid-kb")

        db_path = kb_path / "metadata" / "kb.db"
        assert db_path.exists()

    def test_save_document_all_layers(self, tmp_path):
        """Test document saved to all three layers."""
        backend = HybridBackend(tmp_path)
        kb_path = backend.create_kb("hybrid-kb")

        content = "# Hybrid Doc\n\nContent here."
        metadata = {"source_url": "https://example.com"}
        chunks = [
            {"text": "chunk1", "metadata": {"start_word": 0, "end_word": 10}},
            {"text": "chunk2", "metadata": {"start_word": 10, "end_word": 20}}
        ]

        file_path = backend.save_document(kb_path, "doc1", content, metadata, chunks)

        # Layer 1: File
        assert file_path.exists()
        assert file_path.read_text() == content

        # Layer 2: SQLite
        meta = backend.get_metadata(kb_path, "doc1")
        assert meta is not None
        assert meta["source_url"] == "https://example.com"
        assert meta["chunk_count"] == 2

    def test_get_document(self, tmp_path):
        """Test retrieving document."""
        backend = HybridBackend(tmp_path)
        kb_path = backend.create_kb("hybrid-kb")

        content = "# Test Doc"
        backend.save_document(kb_path, "doc1", content)

        retrieved = backend.get_document(kb_path, "doc1")
        assert retrieved == content

    def test_get_document_not_found(self, tmp_path):
        """Test retrieving non-existent document."""
        backend = HybridBackend(tmp_path)
        kb_path = backend.create_kb("hybrid-kb")

        result = backend.get_document(kb_path, "nonexistent")
        assert result is None

    def test_list_documents(self, tmp_path):
        """Test listing all documents."""
        backend = HybridBackend(tmp_path)
        kb_path = backend.create_kb("hybrid-kb")

        backend.save_document(kb_path, "doc1", "Content 1")
        backend.save_document(kb_path, "doc2", "Content 2")
        backend.save_document(kb_path, "doc3", "Content 3")

        docs = backend.list_documents(kb_path)
        assert len(docs) == 3
        assert "doc1" in docs
        assert "doc2" in docs
        assert "doc3" in docs
