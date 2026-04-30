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

    def test_initialize_creates_directories(self, tmp_path):
        """Test initialize creates index directories."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        assert (tmp_path / "kb" / "index").exists()
        assert (tmp_path / "kb" / "index" / "chroma").exists()

    def test_initialize_creates_manifest(self, tmp_path):
        """Test initialize creates manifest file."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        manifest_path = tmp_path / "kb" / "index" / "manifest.yaml"
        assert manifest_path.exists()

        # Check content
        content = manifest_path.read_text()
        assert "name: kb" in content
        assert "version: 1.0.0" in content

    def test_add_document_without_embedding(self, tmp_path):
        """Test adding document without computing embeddings."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        chunks = [
            {"text": "First chunk", "metadata": {"doc_id": "doc1"}},
            {"text": "Second chunk", "metadata": {"doc_id": "doc1"}}
        ]

        index.add_document("doc1", chunks, embed=False)

        # Check manifest updated
        assert index.has_document("doc1")
        manifest = index._load_manifest()
        assert manifest["documents"]["doc1"]["chunks"] == 2

    def test_add_document_with_source_url(self, tmp_path):
        """Test adding document with source URL."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        chunks = [{"text": "Content", "metadata": {}}]
        index.add_document("doc2", chunks, source_url="https://example.com", embed=False)

        manifest = index._load_manifest()
        assert manifest["documents"]["doc2"]["source_url"] == "https://example.com"

    def test_has_document_false(self, tmp_path):
        """Test has_document returns False for missing doc."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        assert not index.has_document("nonexistent")

    def test_embedding_model_default(self, tmp_path):
        """Test default embedding model."""
        index = KBIndex(kb_path=tmp_path / "kb")
        assert index.embedding_model == "all-MiniLM-L6-v2"

    def test_add_multiple_documents(self, tmp_path):
        """Test adding multiple documents."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        # Add first document
        chunks1 = [{"text": "Doc 1 content", "metadata": {}}]
        index.add_document("doc1", chunks1, embed=False)

        # Add second document
        chunks2 = [{"text": "Doc 2 content", "metadata": {}}]
        index.add_document("doc2", chunks2, embed=False)

        # Both should exist
        assert index.has_document("doc1")
        assert index.has_document("doc2")

        # Check manifest
        manifest = index._load_manifest()
        assert len(manifest["documents"]) == 2

    def test_add_document_missing_text_field(self, tmp_path):
        """Test adding document with invalid chunk raises ValueError."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        chunks = [{"metadata": {"page": 1}}]  # Missing "text" field

        with pytest.raises(ValueError, match="missing required 'text' field"):
            index.add_document("doc1", chunks, embed=False)

    def test_collection_name_custom(self, tmp_path):
        """Test custom collection name."""
        index = KBIndex(kb_path=tmp_path / "kb", collection_name="my-collection")
        assert index.collection_name == "my-collection"

    def test_manifest_persistence(self, tmp_path):
        """Test manifest persists between instances."""
        # First instance creates and adds document
        index1 = KBIndex(kb_path=tmp_path / "kb")
        index1.initialize()
        chunks = [{"text": "Content", "metadata": {}}]
        index1.add_document("doc1", chunks, embed=False)

        # Second instance should see the document
        index2 = KBIndex(kb_path=tmp_path / "kb")
        assert index2.has_document("doc1")

    def test_query_returns_empty_when_chroma_unavailable(self, tmp_path):
        """Test query returns empty list when ChromaDB unavailable."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        # Without initializing ChromaDB, query should return empty list
        results = index.query("test query")
        assert results == []

    def test_chunk_ids_in_manifest(self, tmp_path):
        """Test chunk IDs are stored in manifest."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        chunks = [
            {"text": "Chunk 1", "metadata": {}},
            {"text": "Chunk 2", "metadata": {}},
            {"text": "Chunk 3", "metadata": {}}
        ]
        index.add_document("doc1", chunks, embed=False)

        manifest = index._load_manifest()
        chunk_ids = manifest["documents"]["doc1"]["chunk_ids"]
        assert len(chunk_ids) == 3
        assert chunk_ids[0] == "doc1_chunk_0"
        assert chunk_ids[1] == "doc1_chunk_1"
        assert chunk_ids[2] == "doc1_chunk_2"

    def test_add_document_with_metadata(self, tmp_path):
        """Test adding document with rich metadata."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        chunks = [
            {
                "text": "Content",
                "metadata": {
                    "page": 1,
                    "section": "intro",
                    "author": "test"
                }
            }
        ]
        index.add_document("doc1", chunks, embed=False)

        manifest = index._load_manifest()
        # Metadata is stored in ChromaDB, not manifest
        assert manifest["documents"]["doc1"]["chunks"] == 1

    def test_manifest_version(self, tmp_path):
        """Test manifest contains version info."""
        index = KBIndex(kb_path=tmp_path / "kb")
        index.initialize()

        manifest = index._load_manifest()
        assert manifest["version"] == "1.0.0"
