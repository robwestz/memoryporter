"""Render the wiki — folder mode and single-file bundle mode."""
from __future__ import annotations
import base64
import json
import re
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


# ─────────────────────────────────────────────────────────────────────────
# Single-file bundle mode
# ─────────────────────────────────────────────────────────────────────────

LINK_RE = re.compile(r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*/?>')
SCRIPT_RE = re.compile(r'<script\s+type="module"\s+src="([^"]+)"\s*></script>')
JS_IMPORT_RE = re.compile(
    r'^import\s+(?:\*\s+as\s+\w+|\{[^}]+\}|\w+)(?:\s*,\s*(?:\*\s+as\s+\w+|\{[^}]+\}|\w+))?\s+from\s+["\']([^"\']+)["\'];?\s*$',
    re.MULTILINE,
)
JS_EXPORT_RE = re.compile(r'^export\s+(default\s+)?', re.MULTILINE)
URL_FONT_RE = re.compile(r'url\(([^)]+)\)')


def bundle_single_file(repo_data: dict, template_dir: Path, output_path: Path) -> Path:
    """Build a single self-contained .html file at output_path.

    Inlines:
    - all CSS files referenced by <link rel="stylesheet">
    - all JS modules reachable from <script type="module" src="…">
    - all woff2 fonts referenced by url(…) inside CSS
    - the icon sprite (via __ICON_SPRITE_PLACEHOLDER__)
    - the data.json payload (via __WIKI_DATA_PLACEHOLDER__)
    """
    index_src = (template_dir / "index.html").read_text(encoding="utf-8")
    html = index_src

    # 1. Inline CSS — replace each <link> tag with a <style> block
    def css_repl(match):
        href = match.group(1)
        css_path = (template_dir / href).resolve()
        try:
            css = css_path.read_text(encoding="utf-8")
        except OSError:
            return match.group(0)
        css = inline_fonts_in_css(css, css_path.parent)
        return f'<style data-source="{href}">\n{css}\n</style>'

    html = LINK_RE.sub(css_repl, html)

    # 2. Bundle JS — replace the entry script with one inlined script
    def js_repl(match):
        src = match.group(1)
        entry_path = (template_dir / src).resolve()
        bundled = bundle_js(entry_path, template_dir)
        return f'<script>\n{bundled}\n</script>'

    html = SCRIPT_RE.sub(js_repl, html)

    # 3. Inline icon sprite
    sprite_path = template_dir / "icons" / "lucide.svg"
    if sprite_path.exists():
        sprite_svg = sprite_path.read_text(encoding="utf-8")
        html = html.replace(ICON_PLACEHOLDER, sprite_svg)

    # 4. Inline data.json
    json_payload = json.dumps(repo_data, ensure_ascii=False).replace("</", "<\\/")
    html = html.replace(PLACEHOLDER, json_payload)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding="utf-8")
    return output_path


def inline_fonts_in_css(css: str, base_dir: Path) -> str:
    """Replace url(./fonts/*.woff2) with data:font/woff2;base64,…"""
    def font_repl(m):
        url = m.group(1).strip().strip("\"'")
        if url.startswith("data:") or url.startswith("http"):
            return m.group(0)
        font_path = (base_dir / url).resolve()
        if not font_path.exists() or font_path.suffix.lower() != ".woff2":
            return m.group(0)
        try:
            b64 = base64.b64encode(font_path.read_bytes()).decode("ascii")
        except OSError:
            return m.group(0)
        return f"url('data:font/woff2;base64,{b64}')"
    return URL_FONT_RE.sub(font_repl, css)


def bundle_js(entry: Path, root: Path) -> str:
    """Topo-sort modules by import graph, strip imports/exports, concatenate.

    Constraints (from the plan):
    - Only relative imports.
    - Imports at top of file only — no dynamic await import().
    - export function/const/class — no `export default`, no `export { … }` aggregators.
    """
    visited: list[Path] = []
    seen: set[Path] = set()

    def visit(path: Path):
        if path in seen:
            return
        if not path.exists():
            return
        seen.add(path)
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            return
        # Recurse into deps first (dependencies appear before dependents)
        for m in JS_IMPORT_RE.finditer(text):
            rel = m.group(1)
            if not rel.startswith("."):
                continue
            child = (path.parent / rel).resolve()
            visit(child)
        visited.append(path)

    visit(entry.resolve())

    parts = []
    for path in visited:
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        # Strip imports — they become same-scope references after concat
        text = JS_IMPORT_RE.sub("", text)
        # Strip the `export` keyword — bindings become module-scope (which is now IIFE-scope)
        text = JS_EXPORT_RE.sub("", text)
        rel = path.relative_to(root).as_posix() if path.is_relative_to(root) else path.name
        parts.append(f"// === {rel} ===\n{text}")

    # Wrap in an IIFE so module-scope bindings don't leak to window
    return "(() => {\n" + "\n\n".join(parts) + "\n})();"

