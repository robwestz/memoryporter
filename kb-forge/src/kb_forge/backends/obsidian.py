"""Obsidian vault storage backend."""

from pathlib import Path
from typing import Dict, List, Optional
import json
import re


class ObsidianBackend:
    """Store KB as Obsidian vault with wiki-links."""

    def __init__(self, base_path: Path):
        """Initialize Obsidian backend.

        Args:
            base_path: Root directory for vault storage.
        """
        self.base_path = Path(base_path)

    def create_kb(self, name: str, lifecycle: str = "temp") -> Path:
        """Create Obsidian vault structure.

        Args:
            name: Vault name
            lifecycle: temp or permanent

        Returns:
            Path to vault directory
        """
        vault_path = self.base_path / "obsidian" / name
        vault_path.mkdir(parents=True, exist_ok=True)

        # Create .obsidian config directory
        obsidian_dir = vault_path / ".obsidian"
        obsidian_dir.mkdir(exist_ok=True)

        # Create app.json for graph view settings
        app_config = {
            "pdfExportSettings": {
                "pageSize": "letter",
                "landscape": False,
                "margin": "0",
                "downscalePercent": 100
            },
            "alwaysUpdateLinks": True
        }
        (obsidian_dir / "app.json").write_text(
            json.dumps(app_config, indent=2), encoding="utf-8"
        )

        # Create manifest
        manifest = {
            "name": name,
            "lifecycle": lifecycle,
            "backend": "obsidian",
            "version": "1.0.0"
        }
        (vault_path / ".kb-manifest.json").write_text(
            json.dumps(manifest, indent=2), encoding="utf-8"
        )

        return vault_path

    def save_document(
        self,
        kb_path: Path,
        doc_id: str,
        content: str,
        metadata: Optional[Dict] = None,
        links: Optional[List[str]] = None
    ) -> Path:
        """Save document with frontmatter and wiki-links.

        Args:
            kb_path: Path to vault
            doc_id: Document ID
            content: Markdown content
            metadata: Frontmatter metadata
            links: Wiki-links to other documents

        Returns:
            Path to saved file
        """
        docs_dir = kb_path
        docs_dir.mkdir(parents=True, exist_ok=True)

        # Build frontmatter
        frontmatter = {"id": doc_id}
        if metadata:
            frontmatter.update(metadata)

        # Generate wiki-link section
        link_section = ""
        if links:
            link_section = "\n\n## Links\n\n" + "\n".join(f"- [[{link}]]" for link in links)

        # Combine: frontmatter + content + links
        note_content = "---\n"
        note_content += json.dumps(frontmatter, indent=2)
        note_content += "\n---\n\n"
        note_content += content
        note_content += link_section

        # Save as .md file
        safe_name = doc_id.replace("/", "_").replace("\\", "_")
        file_path = docs_dir / f"{safe_name}.md"
        file_path.write_text(note_content, encoding="utf-8")

        return file_path

    def get_document(self, kb_path: Path, doc_id: str) -> Optional[str]:
        """Retrieve document content (without frontmatter).

        Args:
            kb_path: Path to vault
            doc_id: Document ID

        Returns:
            Content without frontmatter, or None if not found
        """
        safe_name = doc_id.replace("/", "_").replace("\\", "_")
        file_path = kb_path / f"{safe_name}.md"

        if not file_path.exists():
            return None

        content = file_path.read_text(encoding="utf-8")

        # Remove frontmatter if present
        if content.startswith("---\n"):
            parts = content.split("---\n", 2)
            if len(parts) >= 3:
                return parts[2].strip()

        return content

    def generate_links(self, kb_path: Path) -> Dict[str, List[str]]:
        """Generate link graph for all documents.

        Args:
            kb_path: Path to vault

        Returns:
            Dictionary mapping doc names to their wiki-links
        """
        links = {}

        for md_file in kb_path.glob("*.md"):
            content = md_file.read_text(encoding="utf-8")
            doc_name = md_file.stem

            # Find wiki-links [[target]]
            wiki_links = re.findall(r'\[\[([^\]]+)\]\]', content)
            links[doc_name] = wiki_links

        return links
