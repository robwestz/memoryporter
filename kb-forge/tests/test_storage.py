"""Tests for storage module."""

import pytest
from pathlib import Path
from kb_forge.storage import StorageManager
from kb_forge.backends.markdown import MarkdownBackend
from kb_forge.backends.obsidian import ObsidianBackend
from kb_forge.backends.chroma import ChromaBackend
from kb_forge.backends.hybrid import HybridBackend


class TestStorageManager:
    """Test StorageManager class."""

    def test_storage_manager_initialization(self, tmp_path):
        """Test storage manager can be initialized with path."""
        manager = StorageManager(base_path=tmp_path)
        assert manager is not None
        assert manager.base_path == tmp_path
        assert manager.base_path.exists()

    def test_storage_manager_default_path(self):
        """Test storage manager uses default path."""
        manager = StorageManager()
        assert manager.base_path == Path.home() / ".kb-forge"

    def test_get_backend_markdown(self, tmp_path):
        """Test getting markdown backend."""
        manager = StorageManager(base_path=tmp_path)
        backend = manager.get_backend("markdown")
        assert isinstance(backend, MarkdownBackend)

    def test_get_backend_obsidian(self, tmp_path):
        """Test getting obsidian backend."""
        manager = StorageManager(base_path=tmp_path)
        backend = manager.get_backend("obsidian")
        assert isinstance(backend, ObsidianBackend)

    def test_get_backend_chroma(self, tmp_path):
        """Test getting chroma backend."""
        manager = StorageManager(base_path=tmp_path)
        backend = manager.get_backend("chroma")
        assert isinstance(backend, ChromaBackend)

    def test_get_backend_hybrid(self, tmp_path):
        """Test getting hybrid backend."""
        manager = StorageManager(base_path=tmp_path)
        backend = manager.get_backend("hybrid")
        assert isinstance(backend, HybridBackend)

    def test_get_backend_unknown(self, tmp_path):
        """Test getting unknown backend raises error."""
        manager = StorageManager(base_path=tmp_path)
        with pytest.raises(ValueError, match="Unknown backend"):
            manager.get_backend("unknown")

    def test_create_kb_temp(self, tmp_path):
        """Test creating temporary KB."""
        manager = StorageManager(base_path=tmp_path)
        kb_path = manager.create_kb(name="test-docs", lifecycle="temp", storage_backend="markdown")

        assert kb_path.exists()
        assert (kb_path / "docs").exists()
        assert (kb_path / "index").exists()
        assert (kb_path / "index" / "metadata.json").exists()

    def test_create_kb_permanent(self, tmp_path):
        """Test creating permanent KB."""
        manager = StorageManager(base_path=tmp_path)
        kb_path = manager.create_kb(name="prod-docs", lifecycle="permanent", storage_backend="markdown")

        assert "kb" in str(kb_path)
        assert kb_path.exists()

    def test_list_kbs_empty(self, tmp_path):
        """Test listing KBs when empty."""
        manager = StorageManager(base_path=tmp_path)
        kbs = manager.list_kbs()
        assert kbs == {}

    def test_list_kbs_with_entries(self, tmp_path):
        """Test listing KBs with entries."""
        manager = StorageManager(base_path=tmp_path)
        manager.create_kb("kb1", lifecycle="temp")
        manager.create_kb("kb2", lifecycle="permanent")

        kbs = manager.list_kbs()
        assert "kb1" in kbs
        assert "kb2" in kbs


class TestMarkdownBackend:
    """Test MarkdownBackend class."""

    def test_create_kb(self, tmp_path):
        """Test creating KB with markdown backend."""
        backend = MarkdownBackend(tmp_path)
        kb_path = backend.create_kb("my-kb", lifecycle="temp")

        assert kb_path.exists()
        assert (kb_path / "docs").exists()
        assert (kb_path / "index" / "metadata.json").exists()

    def test_save_and_get_document(self, tmp_path):
        """Test saving and retrieving document."""
        backend = MarkdownBackend(tmp_path)
        kb_path = backend.create_kb("my-kb", lifecycle="temp")

        # Save document
        content = "# Test Document\n\nThis is test content."
        file_path = backend.save_document(kb_path, "doc1", content)

        assert file_path.exists()
        assert file_path.read_text() == content

        # Retrieve document
        retrieved = backend.get_document(kb_path, "doc1")
        assert retrieved == content

    def test_get_document_not_found(self, tmp_path):
        """Test retrieving non-existent document."""
        backend = MarkdownBackend(tmp_path)
        kb_path = backend.create_kb("my-kb", lifecycle="temp")

        result = backend.get_document(kb_path, "nonexistent")
        assert result is None

    def test_save_document_with_metadata(self, tmp_path):
        """Test saving document with metadata."""
        backend = MarkdownBackend(tmp_path)
        kb_path = backend.create_kb("my-kb", lifecycle="temp")

        content = "# Doc with meta"
        metadata = {"source": "test", "author": "tester"}
        backend.save_document(kb_path, "doc2", content, metadata)

        # Check metadata file created
        meta_path = kb_path / "docs" / "doc2.json"
        assert meta_path.exists()
