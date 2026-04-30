"""Context engineering for optimal agent retrieval."""

from enum import Enum
from typing import Dict, List, Optional
import re


class ChunkStrategy(str, Enum):
    """Chunking strategy options."""
    SEMANTIC = "semantic"
    FIXED = "fixed"


class ContextEngine:
    """Transform content into agent-optimized format."""

    def __init__(
        self,
        embedding_model: Optional[str] = None,
        default_chunk_size: int = 500
    ):
        """Initialize ContextEngine.

        Args:
            embedding_model: Name of the embedding model to use.
            default_chunk_size: Default chunk size for fixed chunking.
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
            content: Markdown content to chunk.
            strategy: SEMANTIC or FIXED chunking strategy.
            chunk_size: Target chunk size in words for FIXED strategy.
            overlap: Number of words to overlap between chunks for FIXED strategy.

        Returns:
            List of chunk dictionaries with 'text' and 'metadata' keys.
        """
        if not content or not content.strip():
            return []

        if strategy == ChunkStrategy.SEMANTIC:
            return self._chunk_semantic(content)
        else:
            return self._chunk_fixed(content, chunk_size or self.default_chunk_size, overlap)

    def _chunk_semantic(self, content: str) -> List[Dict]:
        """Chunk by semantic boundaries (headings, paragraphs).

        Args:
            content: Markdown content to chunk.

        Returns:
            List of chunk dictionaries with heading metadata.
        """
        chunks = []
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
                            "metadata": {"heading": current_heading, "type": "section"}
                        })
                current_heading = section.strip()
                current_content = [section]
            else:
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
                    "metadata": {"heading": current_heading, "type": "section"}
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
            content: Content to chunk.
            chunk_size: Number of words per chunk.
            overlap: Number of words to overlap between chunks.

        Returns:
            List of chunk dictionaries with position metadata.
        """
        words = content.split()
        chunks = []

        # Ensure overlap doesn't exceed chunk_size to prevent infinite loops
        effective_overlap = min(overlap, chunk_size - 1) if chunk_size > 1 else 0
        step = chunk_size - effective_overlap

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

            # Move forward by step size
            start += step

        return chunks

    def prepare_for_embedding(
        self,
        chunks: List[Dict],
        add_context: bool = True
    ) -> List[Dict]:
        """Prepare chunks for embedding.

        Args:
            chunks: List of chunk dictionaries with 'text' and 'metadata'.
            add_context: Whether to add heading context to the embedding text.

        Returns:
            List of prepared chunks with 'embedding_text' added.
        """
        prepared = []

        for chunk in chunks:
            text = chunk["text"]

            if add_context and chunk["metadata"].get("heading"):
                heading = chunk["metadata"]["heading"].lstrip('#').strip()
                text = f"Context: {heading}\n\n{text}"

            prepared.append({**chunk, "embedding_text": text})

        return prepared
