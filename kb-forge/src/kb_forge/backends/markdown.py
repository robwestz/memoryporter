"""Markdown file storage backend."""

from pathlib import Path
from typing import Dict, Optional
import json


class MarkdownBackend:
    """Store KB as flat markdown files.

    This backend stores knowledge base documents as individual markdown files
    with optional JSON metadata sidecars. It provides simple, portable storage
    that works with any file system.

    Attributes:
        base_path: Root directory for this backend's storage.

    Example:
        >>> backend = MarkdownBackend(Path("/data/kb"))
        >>> kb_path = backend.create_kb("docs", lifecycle="temp")
        >>> backend.save_document(kb_path, "readme", "# Hello")
    """

    def __init__(self, base_path: Path):
        """Initialize markdown backend.

        Args:
            base_path: Root directory for KB storage.
        """
        self.base_path = Path(base_path)

    def create_kb(self, name: str, lifecycle: str = "temp") -> Path:
        """Create a new knowledge base.

        Args:
            name: Name of the knowledge base.
            lifecycle: Lifecycle type - "temp" or "permanent".
                Temp KBs are stored in temp/ and may be auto-cleaned.
                Permanent KBs are stored in kb/ for long-term retention.

        Returns:
            Path to the created KB directory.

        Example:
            >>> kb_path = backend.create_kb("my-docs", lifecycle="permanent")
            >>> assert (kb_path / "docs").exists()
            >>> assert (kb_path / "index" / "metadata.json").exists()
        """
        if lifecycle == "temp":
            kb_path = self.base_path / "temp" / name
        else:
            kb_path = self.base_path / "kb" / name

        kb_path.mkdir(parents=True, exist_ok=True)
        (kb_path / "docs").mkdir(exist_ok=True)
        (kb_path / "index").mkdir(exist_ok=True)

        metadata = {
            "name": name,
            "lifecycle": lifecycle,
            "backend": "markdown",
            "version": "1.0.0"
        }
        (kb_path / "index" / "metadata.json").write_text(
            json.dumps(metadata, indent=2), encoding="utf-8"
        )
        return kb_path

    def save_document(self, kb_path: Path, doc_id: str, content: str, metadata: Optional[Dict] = None) -> Path:
        """Save a document to the knowledge base.

        Args:
            kb_path: Path to the knowledge base directory.
            doc_id: Unique identifier for the document.
            content: Markdown content to save.
            metadata: Optional metadata dictionary to save alongside.

        Returns:
            Path to the saved document file.

        Example:
            >>> file_path = backend.save_document(kb_path, "readme", "# Title")
            >>> assert file_path.exists()
            >>> assert file_path.suffix == ".md"
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
        """Retrieve a document from the knowledge base.

        Args:
            kb_path: Path to the knowledge base directory.
            doc_id: Unique identifier for the document.

        Returns:
            Document content as string, or None if not found.

        Example:
            >>> content = backend.get_document(kb_path, "readme")
            >>> if content:
            ...     print(content)
        """
        file_path = kb_path / "docs" / f"{doc_id}.md"
        if file_path.exists():
            return file_path.read_text(encoding="utf-8")
        return None
