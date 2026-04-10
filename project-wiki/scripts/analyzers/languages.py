"""Detect programming languages by extension and count LOC per language."""
from __future__ import annotations
from collections import defaultdict
from pathlib import Path

from walker import walk, is_text_file

# (language_name, extensions, color_hex_for_visualization)
LANGUAGES = [
    ("Python",       {".py", ".pyi"},                             "#3776ab"),
    ("JavaScript",   {".js", ".mjs", ".cjs"},                     "#f7df1e"),
    ("TypeScript",   {".ts", ".tsx", ".mts", ".cts"},             "#3178c6"),
    ("JSX",          {".jsx"},                                    "#61dafb"),
    ("Rust",         {".rs"},                                     "#dea584"),
    ("Go",           {".go"},                                     "#00add8"),
    ("Java",         {".java"},                                   "#b07219"),
    ("Kotlin",       {".kt", ".kts"},                             "#a97bff"),
    ("Swift",        {".swift"},                                  "#fa7343"),
    ("C",            {".c", ".h"},                                "#555555"),
    ("C++",          {".cpp", ".cxx", ".cc", ".hpp", ".hxx"},     "#f34b7d"),
    ("C#",           {".cs"},                                     "#178600"),
    ("Ruby",         {".rb", ".rake"},                            "#cc342d"),
    ("PHP",          {".php"},                                    "#787cb5"),
    ("Shell",        {".sh", ".bash", ".zsh"},                    "#89e051"),
    ("HTML",         {".html", ".htm"},                           "#e34c26"),
    ("CSS",          {".css", ".scss", ".sass", ".less"},         "#563d7c"),
    ("Vue",          {".vue"},                                    "#41b883"),
    ("Svelte",       {".svelte"},                                 "#ff3e00"),
    ("Markdown",     {".md", ".markdown", ".mdx"},                "#083fa1"),
    ("JSON",         {".json", ".jsonc"},                         "#cbcb41"),
    ("YAML",         {".yaml", ".yml"},                           "#cb171e"),
    ("TOML",         {".toml"},                                   "#9c4221"),
    ("SQL",          {".sql"},                                    "#e38c00"),
    ("XML",          {".xml"},                                    "#0060ac"),
]

EXT_TO_LANG: dict[str, tuple[str, str]] = {
    ext: (name, color) for name, exts, color in LANGUAGES for ext in exts
}

# Filename-based matches for files without extensions
SPECIAL_FILENAMES: dict[str, tuple[str, str]] = {
    "Dockerfile": ("Dockerfile", "#384d54"),
    "Makefile": ("Makefile", "#427819"),
    "Rakefile": ("Ruby", "#cc342d"),
    "Gemfile": ("Ruby", "#cc342d"),
}


def run(repo_root: Path) -> dict:
    by_lang: dict[str, dict] = defaultdict(
        lambda: {"files": 0, "loc": 0, "bytes": 0, "color": "#888888"}
    )

    for rel, abs_path, size in walk(repo_root):
        ext = abs_path.suffix.lower()
        name = abs_path.name
        if name in SPECIAL_FILENAMES:
            lang, color = SPECIAL_FILENAMES[name]
        elif ext in EXT_TO_LANG:
            lang, color = EXT_TO_LANG[ext]
        else:
            continue

        entry = by_lang[lang]
        entry["files"] += 1
        entry["bytes"] += size
        entry["color"] = color
        if is_text_file(abs_path):
            try:
                with open(abs_path, "r", encoding="utf-8", errors="ignore") as f:
                    entry["loc"] += sum(1 for line in f if line.strip())
            except OSError:
                pass

    sorted_langs = sorted(
        ({"name": k, **v} for k, v in by_lang.items()),
        key=lambda x: x["loc"],
        reverse=True,
    )
    return {"breakdown": sorted_langs}
