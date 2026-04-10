"""Best-effort symbol extraction via regex per language. Not a parser — meant
for the file-page sidebar and the search index."""
from __future__ import annotations
import re
from pathlib import Path

from walker import walk

PATTERNS: dict[str, list[tuple[re.Pattern, str]]] = {
    "python": [
        (re.compile(r"^class\s+(\w+)"), "class"),
        (re.compile(r"^async\s+def\s+(\w+)"), "function"),
        (re.compile(r"^def\s+(\w+)"), "function"),
    ],
    "javascript": [
        (re.compile(r"^export\s+class\s+(\w+)"), "class"),
        (re.compile(r"^class\s+(\w+)"), "class"),
        (re.compile(r"^export\s+(?:default\s+)?function\s+(\w+)"), "function"),
        (re.compile(r"^function\s+(\w+)"), "function"),
        (re.compile(r"^export\s+const\s+(\w+)\s*=\s*\("), "function"),
        (re.compile(r"^export\s+const\s+(\w+)"), "const"),
        (re.compile(r"^const\s+(\w+)\s*=\s*\("), "function"),
    ],
    "rust": [
        (re.compile(r"^(?:pub(?:\([\w:]+\))?\s+)?fn\s+(\w+)"), "function"),
        (re.compile(r"^(?:pub(?:\([\w:]+\))?\s+)?struct\s+(\w+)"), "struct"),
        (re.compile(r"^(?:pub(?:\([\w:]+\))?\s+)?enum\s+(\w+)"), "enum"),
        (re.compile(r"^(?:pub(?:\([\w:]+\))?\s+)?trait\s+(\w+)"), "trait"),
        (re.compile(r"^impl(?:<[^>]+>)?\s+(?:[\w:]+\s+for\s+)?(\w+)"), "impl"),
    ],
    "go": [
        (re.compile(r"^func\s+\([^)]+\)\s+(\w+)"), "method"),
        (re.compile(r"^func\s+(\w+)"), "function"),
        (re.compile(r"^type\s+(\w+)\s+struct"), "struct"),
        (re.compile(r"^type\s+(\w+)\s+interface"), "interface"),
    ],
}

EXT_TO_LANG = {
    ".py": "python",
    ".js": "javascript", ".jsx": "javascript", ".mjs": "javascript", ".cjs": "javascript",
    ".ts": "javascript", ".tsx": "javascript",
    ".rs": "rust",
    ".go": "go",
}


def run(repo_root: Path) -> dict:
    by_file: dict[str, list[dict]] = {}
    for rel, abs_path, _size in walk(repo_root):
        ext = abs_path.suffix.lower()
        lang = EXT_TO_LANG.get(ext)
        if not lang:
            continue
        try:
            lines = abs_path.read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        symbols: list[dict] = []
        for i, raw in enumerate(lines, start=1):
            line = raw.strip()
            if not line or line.startswith("//") or line.startswith("#"):
                continue
            for pat, kind in PATTERNS[lang]:
                m = pat.match(line)
                if m:
                    symbols.append({"name": m.group(1), "kind": kind, "line": i})
                    break
        if symbols:
            by_file[rel] = symbols
    return {"by_file": by_file, "total": sum(len(v) for v in by_file.values())}
