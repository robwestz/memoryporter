"""Tests for context engine."""

import pytest
from kb_forge.context_engine import ContextEngine, ChunkStrategy


class TestContextEngine:
    """Test ContextEngine class."""

    def test_context_engine_initialization(self):
        """Test context engine can be initialized."""
        engine = ContextEngine()
        assert engine is not None
        assert engine.embedding_model == "all-MiniLM-L6-v2"
        assert engine.default_chunk_size == 500

    def test_context_engine_custom_settings(self):
        """Test context engine with custom settings."""
        engine = ContextEngine(embedding_model="custom-model", default_chunk_size=300)
        assert engine.embedding_model == "custom-model"
        assert engine.default_chunk_size == 300

    def test_chunk_semantic_simple(self):
        """Test semantic chunking with simple content."""
        engine = ContextEngine()
        content = "# Title\n\nParagraph one.\n\nParagraph two."
        chunks = engine.chunk(content, strategy=ChunkStrategy.SEMANTIC)

        assert len(chunks) > 0
        assert all("text" in chunk for chunk in chunks)
        assert all("metadata" in chunk for chunk in chunks)

    def test_chunk_semantic_with_headings(self):
        """Test semantic chunking with multiple headings."""
        engine = ContextEngine()
        content = """# Main Title

Introduction paragraph.

## Section 1

Content for section 1.

## Section 2

Content for section 2."""

        chunks = engine.chunk(content, strategy=ChunkStrategy.SEMANTIC)

        # Should create chunks for each section
        assert len(chunks) >= 2
        # Check metadata has headings
        headings = [c["metadata"].get("heading", "") for c in chunks]
        assert any("Section 1" in h for h in headings)
        assert any("Section 2" in h for h in headings)

    def test_chunk_fixed_size(self):
        """Test fixed-size chunking."""
        engine = ContextEngine()
        content = "Word " * 200  # 200 words
        chunks = engine.chunk(content, strategy=ChunkStrategy.FIXED, chunk_size=50, overlap=10)

        # Should create multiple chunks
        assert len(chunks) > 1
        # Each chunk (except last) should be ~50 words
        for chunk in chunks[:-1]:
            word_count = len(chunk["text"].split())
            assert 40 <= word_count <= 60  # Allow some variance

    def test_chunk_fixed_overlap(self):
        """Test fixed-size chunking with overlap."""
        engine = ContextEngine()
        content = "Word " * 100
        chunks = engine.chunk(content, strategy=ChunkStrategy.FIXED, chunk_size=30, overlap=5)

        # Check overlap by examining consecutive chunks
        if len(chunks) > 1:
            first_chunk_words = chunks[0]["text"].split()
            second_chunk_words = chunks[1]["text"].split()
            # Some words should be shared
            shared = set(first_chunk_words) & set(second_chunk_words)
            assert len(shared) > 0

    def test_chunk_fixed_metadata(self):
        """Test fixed chunking includes metadata."""
        engine = ContextEngine()
        content = "Word " * 100
        chunks = engine.chunk(content, strategy=ChunkStrategy.FIXED, chunk_size=30)

        for chunk in chunks:
            assert "start_word" in chunk["metadata"]
            assert "end_word" in chunk["metadata"]
            assert "type" in chunk["metadata"]
            assert chunk["metadata"]["type"] == "fixed"

    def test_prepare_for_embedding_semantic(self):
        """Test preparing semantic chunks for embedding."""
        engine = ContextEngine()
        chunks = [
            {"text": "Content", "metadata": {"heading": "## Section", "type": "section"}}
        ]
        prepared = engine.prepare_for_embedding(chunks)

        assert len(prepared) == 1
        assert "embedding_text" in prepared[0]
        assert "Context: Section" in prepared[0]["embedding_text"]

    def test_prepare_for_embedding_no_heading(self):
        """Test preparing chunks without headings."""
        engine = ContextEngine()
        chunks = [
            {"text": "Just content", "metadata": {"type": "fixed"}}
        ]
        prepared = engine.prepare_for_embedding(chunks)

        assert prepared[0]["embedding_text"] == "Just content"

    def test_prepare_for_embedding_disabled_context(self):
        """Test preparing chunks with context disabled."""
        engine = ContextEngine()
        chunks = [
            {"text": "Content", "metadata": {"heading": "## Section", "type": "section"}}
        ]
        prepared = engine.prepare_for_embedding(chunks, add_context=False)

        assert prepared[0]["embedding_text"] == "Content"

    def test_chunk_empty_content(self):
        """Test chunking empty content."""
        engine = ContextEngine()
        chunks = engine.chunk("", strategy=ChunkStrategy.SEMANTIC)
        assert chunks == []

    def test_chunk_whitespace_content(self):
        """Test chunking whitespace-only content."""
        engine = ContextEngine()
        chunks = engine.chunk("   \n\n   ", strategy=ChunkStrategy.SEMANTIC)
        assert chunks == []

    def test_chunk_very_long_content(self):
        """Test chunking very long content."""
        engine = ContextEngine()
        content = "Word " * 10000  # 10,000 words
        chunks = engine.chunk(content, strategy=ChunkStrategy.FIXED, chunk_size=100, overlap=10)

        # Should handle large content without issues
        assert len(chunks) > 50
        total_words = sum(len(c["text"].split()) for c in chunks)
        # Total should be close to original (accounting for overlap)
        # With 10k words, chunk_size=100, overlap=10:
        # ~112 chunks, each 100 words, with 10-word overlap
        # Expected total ~ 10000 + (111 * 10) = ~11110 words
        assert 9000 <= total_words <= 12000
