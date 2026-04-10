"""Copy the wiki-template assets to the output dir, then inject data.json
inline into index.html via a placeholder string replacement.

This is the FOLDER mode. Single-file bundle mode is added in Task 35.5.
"""
from __future__ import annotations
import json
import shutil
from pathlib import Path

PLACEHOLDER = "__WIKI_DATA_PLACEHOLDER__"
ICON_PLACEHOLDER = "__ICON_SPRITE_PLACEHOLDER__"


def render(repo_data: dict, template_dir: Path, output_dir: Path) -> Path:
    """Render in folder mode: copy template tree, inline data + sprite into index.html."""
    if output_dir.exists():
        shutil.rmtree(output_dir)
    shutil.copytree(template_dir, output_dir)

    index = output_dir / "index.html"
    if not index.exists():
        raise RuntimeError(f"template missing index.html at {index}")

    html = index.read_text(encoding="utf-8")
    if PLACEHOLDER not in html:
        raise RuntimeError(f"index.html is missing the {PLACEHOLDER!r} marker")

    # Escape `</script>` to prevent breaking out of the script tag.
    json_payload = json.dumps(repo_data, ensure_ascii=False).replace("</", "<\\/")
    html = html.replace(PLACEHOLDER, json_payload)

    # Inline icon sprite if its placeholder is present and the sprite file exists.
    sprite_path = output_dir / "icons" / "lucide.svg"
    if sprite_path.exists() and ICON_PLACEHOLDER in html:
        sprite_svg = sprite_path.read_text(encoding="utf-8")
        html = html.replace(ICON_PLACEHOLDER, sprite_svg)

    index.write_text(html, encoding="utf-8")

    # Also write data.json next to index.html for debugging / external tools
    (output_dir / "data.json").write_text(
        json.dumps(repo_data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return index
