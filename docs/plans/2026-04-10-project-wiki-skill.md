# Project Wiki Skill — Implementation Plan

> **For agentic workers:** This is a Production-shape skill package authored under skill-forge conventions. Steps use checkbox (`- [ ]`) syntax. Implement task-by-task. Most tasks end in a manual visual verify (open `examples/sample-wiki/index.html` in browser) — that's the equivalent of "run the test".

**Goal:** Ship a self-contained, agnostic skill package (`portable-kit/project-wiki/`) that — given any project repository — generates an absolutely gorgeous, fully-static HTML/CSS/JS wiki site with rich interactive graphics and an in-page configurator UI for choosing extras.

**Architecture:** Pure Python stdlib generator (no `pip install`) walks the target repo, runs modular analyzers, and emits a single `data.json` payload. The payload is **inlined** into a hand-crafted HTML/CSS/JS shell at build time (`<script id="wiki-data" type="application/json">…</script>`), so the resulting wiki opens via `file://` with zero CORS / zero server / zero install. The "small UI for extras" lives **inside** the wiki as a settings modal (theme picker, page toggles, density, AI-explanations slot) that persists to `localStorage`. First-visit auto-opens it.

**Tech Stack:**
- **Generator:** Python 3.9+ stdlib only (no third-party packages)
- **Wiki shell:** Vanilla HTML5 + modern CSS (custom properties, grid, flex, `:has`, `@layer`) + vanilla ES2022 JS (no framework, no build step)
- **Charts:** Custom vanilla-SVG chart library (~600–900 LOC across 8 chart types)
- **Syntax highlighting:** Inlined Prism core (single file, ~5 languages)
- **Icons:** Lucide SVG sprite (subset, inlined)
- **Fonts:** Inter (UI/body) + JetBrains Mono (code), self-hosted woff2 in `assets/`

**Where it lives:** `portable-kit/project-wiki/` — root level, peer to `skill-engine/`, `skill-creator/`, `mempalace/`. This is consistent with how other complete skill packages sit in the kit.

**Design north star** (locked once before coding starts in Task 0):
- **Style class:** Glassmorphism + Minimalism + Dev-tool dark mode (per ui-ux-pro-max product mapping)
- **Color base:** Deep navy `#0a0e1a`, panels `#161b29` → `#1e2538`, accent electric purple `#7c3aed` and cyan `#06b6d4`, text `#f1f5f9`, muted `#94a3b8`
- **Typography:** Inter 400/500/600/700, JetBrains Mono 400/600. Type scale 12/14/16/18/24/32/48 (1.25 ratio loosely)
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (4-pt base)
- **Radii:** 6 / 10 / 16 / 24
- **Shadows:** soft `0 1px 3px rgba(0,0,0,.3)`, elevated `0 12px 32px rgba(0,0,0,.4)`, glow accents on hover
- **Motion:** 180–260ms ease-out for micro, 320ms cubic-bezier(.2,.8,.2,1) for layout, stagger 30ms on lists, respects `prefers-reduced-motion`
- **A11y:** WCAG AA (4.5:1 body, 3:1 large), keyboard nav across everything, aria-labels on icon-only buttons, `prefers-reduced-motion` respected, focus rings 2px

---

## File Structure (final)

```
portable-kit/project-wiki/
├── SKILL.md                          # Operations manual for invoking agents
├── README.md                         # Human-facing install/usage
├── metadata.json                     # Marketplace metadata
├── scripts/
│   ├── generate.py                   # CLI entry — `python generate.py --repo <p> --output <p>`
│   ├── walker.py                     # Repo walking, ignore patterns
│   ├── render.py                     # Copy template + inject data
│   ├── verify.py                     # Sanity check generated site
│   └── analyzers/
│       ├── __init__.py
│       ├── repo_stats.py             # File count, total LOC, sizes
│       ├── languages.py              # Language detection + LOC per lang
│       ├── structure.py              # Nested dir tree
│       ├── dependencies.py           # Multi-manifest parser
│       ├── git_log.py                # `git log` shell-out, graceful failure
│       ├── readme.py                 # README discovery + markdown parse
│       ├── changelog.py              # CHANGELOG discovery
│       ├── symbols.py                # Regex symbol extraction (5 languages)
│       └── file_index.py             # Flat file list with metadata
├── assets/
│   └── wiki-template/                # Copied verbatim, then data injected
│       ├── index.html                # Shell with __WIKI_DATA_PLACEHOLDER__
│       ├── manifest.json             # PWA-ish manifest
│       ├── favicon.svg               # Inline-friendly favicon
│       ├── css/
│       │   ├── reset.css             # Modern reset
│       │   ├── tokens.css            # ALL design tokens (CSS vars)
│       │   ├── base.css              # Typography, body, links
│       │   ├── layout.css            # Sidebar/topbar/main grid + responsive
│       │   ├── components.css        # Button, card, badge, modal, tooltip, scrollbar
│       │   ├── charts.css            # Chart-specific styles
│       │   ├── prism.css             # Syntax highlight theme (matches midnight)
│       │   └── themes/
│       │       ├── midnight.css      # Default (deep navy + electric)
│       │       ├── aurora.css        # Purple/teal alt
│       │       └── solar.css         # Warm orange/red dark alt
│       ├── js/
│       │   ├── app.js                # Bootstrap entry — reads inline data, mounts shell
│       │   ├── store.js              # Pub/sub state store + localStorage persistence
│       │   ├── router.js             # Hash-based page router with dynamic imports
│       │   ├── nav.js                # Sidebar nav rendering
│       │   ├── topbar.js             # Top bar with crumbs, search trigger, settings button
│       │   ├── search.js             # Cmd+K palette w/ fuzzy match
│       │   ├── settings.js           # The configurator modal
│       │   ├── markdown.js           # Tiny markdown→HTML (~120 LOC)
│       │   ├── prism.js              # Syntax highlighter (Python/JS/TS/Rust/Go/MD)
│       │   ├── icons.js              # Icon helper (sprite is inlined into index.html)
│       │   ├── utils.js              # Shared helpers (escapeHtml, formatBytes, formatNumber)
│       │   ├── charts/
│       │   │   ├── donut.js          # Language breakdown
│       │   │   ├── bar.js            # Top files by LOC
│       │   │   ├── sunburst.js       # Folder structure (showpiece)
│       │   │   ├── treemap.js        # Squarified file sizes
│       │   │   ├── force-graph.js    # Dependency graph (verlet physics)
│       │   │   ├── heatmap.js        # Git activity GitHub-style
│       │   │   ├── timeline.js       # Commit timeline
│       │   │   └── sparkline.js      # Inline mini-charts
│       │   └── pages/
│       │       ├── overview.js       # Hero + big stats + README
│       │       ├── files.js          # File explorer + viewer
│       │       ├── modules.js        # Module breakdown
│       │       ├── deps.js           # Dependency table + force graph
│       │       ├── activity.js       # Git history + heatmap + timeline
│       │       └── search-results.js # Search results page
│       ├── icons/
│       │   └── lucide.svg            # Inline SVG sprite (~18 icons)
│       └── fonts/
│           ├── Inter-Variable.woff2
│           └── JetBrainsMono-Variable.woff2
├── templates/
│   └── README.md                     # Explains how the generator stamps assets
├── references/
│   ├── architecture.md               # How the skill works internally
│   ├── theme-system.md               # Token reference + custom theme guide
│   ├── chart-catalog.md              # Each chart, when to use, data shape
│   ├── analyzer-anatomy.md           # How to add a new analyzer
│   └── data-schema.md                # The data.json schema
├── examples/
│   └── sample-wiki/                  # Pre-rendered example (generated from portable-kit itself)
│       ├── index.html
│       └── ... (full site)
└── evals/
    └── evals.json                    # 3 test prompts for skill-creator
```

---

## Phasing, stop-points & context budget

The plan is split into **three phases**, each of which leaves the repo in a *shippable* state. This is deliberate — if context, time, or attention runs out, you can stop at any phase boundary and still have something real on disk. No half-finished frankenstein.

| Phase | Tasks | What ships at the end | Realistic context cost |
|-------|-------|----------------------|----------------------|
| **A — Skeleton** | 0 → 19 | Working wiki, end-to-end. Midnight theme only. Overview page renders hero + stat tiles + language donut + README. Sidebar nav works. Sub-pages still stubs. Folder-mode output. *Already a coherent v0.5 you'd be OK shipping.* | ~60–80k tokens |
| **B — Beauty** | 20 → 34 | All 8 charts, all 6 pages, Aurora + Solar themes, syntax highlighting, Cmd+K palette, settings modal. Still folder-mode for fast iteration. *The "rent överjävligt snyggt" version.* | ~70–90k tokens |
| **C — Ship** | 35 → 43 | Inlined icon sprite, **single-file HTML bundle mode (becomes the default — one ~600 KB `.html` you double-click)**, a11y/responsive pass, verify script, full SKILL.md, references, README, sample example, evals, marketplace metadata. *Distributable package.* | ~40–55k tokens |
| **D — Sidecar (optional)** | 44 → 48 | `<repo>.wiki/` companion-directory pattern: `init` subcommand bootstraps it, generator merges sidecar annotations + AI-explanation cache + project-specific theme overrides into the wiki without touching the source repo. *Lets the wiki accumulate enrichments over time.* | ~25–35k tokens |

**Suggested execution mode:** Run Phase A inline in this session. After it's working, fork Phase B into a fresh subagent (or a fresh session) so the chart implementations don't compete with this conversation's context. Phase C can be a third short session.

**Hard stop-points** are marked in the plan with `--- STOP-POINT ---` dividers. At each one, the wiki opens cleanly in a browser and the package is committable. Walking away there is fine.

### Cuttable extras (drop these to ship sooner)

If you decide mid-build to ship a smaller v1.0, these tasks can be dropped without breaking anything else. Cross them out in the task checkboxes when cutting:

| Task | What it adds | Drop cost |
|------|-------------|-----------|
| 14 | Aurora + Solar themes | Lose 2 alt themes; Midnight remains |
| 21 | Force-directed dependency graph | Deps page falls back to plain table only |
| 22 | Treemap | Structure page keeps sunburst alone |
| 24 | Heatmap | Activity page uses timeline only |
| 25 | Timeline | Activity page uses heatmap only (drop only one of 24/25) |
| 26 | Sparkline | Files page loses inline mini-charts |
| 32 | Cmd+K search palette | Nice but not essential — nav still works |
| 39 | Reference docs (3 of 5) | Keep `architecture.md` + `data-schema.md`; drop the rest |
| 41 | Bundled sample-wiki example | Skill works without it |

Tasks **0–13, 15–20, 23, 27–31, 33, 36–38, 40, 42–43** are the load-bearing core.

### Why these architecture choices

| Choice | Reason |
|--------|--------|
| ~40 tiny tasks instead of one big push | Each task ends with a visible browser change you can eyeball before committing. Bisect-friendly when something breaks. |
| Pure stdlib Python | Must work on any dev's machine without `pip install`. |
| No JS framework | A framework forces a build step, which forces `npm install`, which kills "just open the file and it works". Vanilla JS at this scope is ~2.5k LOC — totally manageable, output stays under 500KB. |
| Inline data instead of `fetch('./data.json')` | Browsers block `fetch` from `file://` due to CORS. Inlining the JSON in a `<script type="application/json">` tag is the only way to make `file://` Just Work without a server. |
| Settings modal inside the wiki | A separate launch-screen approach needs either a server (kills no-install) or a download-config dance (clunky). The in-wiki modal lets readers toggle extras live, persists across visits, and is intrinsically more "smidigt". |

---

## Pre-flight: design tokens lookup

- [ ] **Step 0a: Run ui-ux-pro-max design system query**

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "developer tool dark mode minimalism content-dense" --design-system -p "Project Wiki"
```

Save the output to `references/design-system-baseline.md` for reference. If the script is unavailable on the user's machine, skip this step — the design tokens listed in the **Design north star** above are already aligned with what ui-ux-pro-max would recommend for this product class.

---

═══════════════════════════════════════════════════════════════════════════
## ▸▸▸ PHASE A — SKELETON (Tasks 0 → 19) ◂◂◂
═══════════════════════════════════════════════════════════════════════════

*Goal: get a working wiki end-to-end from any repo — ugly is fine. By the end of Task 19, you can point the generator at any project and get back an opening overview page with hero, stat tiles, a working language donut, and the README rendered. Ship-able as v0.5.*

---

## Task 0: Skill scaffold

**Files:**
- Create: `portable-kit/project-wiki/SKILL.md` (stub)
- Create: `portable-kit/project-wiki/README.md` (stub)
- Create: `portable-kit/project-wiki/metadata.json` (stub)
- Create: directory tree per **File Structure** above

- [ ] **Step 1: Create directory tree**

```bash
cd portable-kit
mkdir -p project-wiki/{scripts/analyzers,assets/wiki-template/{css/themes,js/{charts,pages},icons,fonts},templates,references,examples,evals}
touch project-wiki/scripts/analyzers/__init__.py
```

- [ ] **Step 2: Stub SKILL.md frontmatter only**

Write `project-wiki/SKILL.md`:

```markdown
---
name: project-wiki
description: Generate a beautiful, fully-static HTML/CSS/JS wiki site that documents any project repository — with interactive charts, dependency graphs, file explorer, git activity, and an in-page configurator for choosing extras. Use whenever the user asks to "document this repo", "make a wiki", "build a project site", "generate documentation", "explain this codebase visually", or wants a shareable visual walkthrough of a codebase. Output is zero-install — opens via file:// in any modern browser.
author: Robin Westerlund
version: 0.1.0
---

# Project Wiki

(Body filled in Task 37.)
```

- [ ] **Step 3: Stub metadata.json**

```json
{
  "name": "Project Wiki",
  "description": "Generate a gorgeous static HTML wiki for any project repository, with charts, dependency graphs, and an in-page configurator.",
  "category": "skills",
  "author": { "name": "Robin Westerlund", "github": "" },
  "version": "0.1.0",
  "requires": { "open_brain": false, "services": [], "tools": ["python>=3.9"] },
  "tags": ["wiki", "documentation", "static-site", "visualization", "codebase-analysis"],
  "difficulty": "intermediate",
  "estimated_time": "1 minute to generate",
  "created": "2026-04-10",
  "updated": "2026-04-10"
}
```

- [ ] **Step 4: Commit**

```bash
git add project-wiki/
git commit -m "feat(project-wiki): scaffold skill package"
```

---

## Task 1: Generator skeleton

**Files:**
- Create: `project-wiki/scripts/generate.py`
- Create: `project-wiki/scripts/walker.py`

- [ ] **Step 1: Write `scripts/walker.py`**

```python
"""Walk a project repository, yielding (relative_path, abs_path, size_bytes) tuples.

Skips common noise: .git, node_modules, target, dist, build, .venv, __pycache__,
.next, .cache, vendor, .idea, .vscode, .DS_Store, *.lock files, binaries by extension.
"""
from __future__ import annotations
import os
from pathlib import Path
from typing import Iterator, Tuple

IGNORE_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "target", "dist", "build", "out",
    ".venv", "venv", "env", "__pycache__", ".next", ".nuxt", ".cache", ".turbo",
    "vendor", ".idea", ".vscode", ".gradle", ".pytest_cache", ".mypy_cache",
    "coverage", ".tox", "bin", "obj", ".DS_Store",
}

BINARY_EXTS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".tiff",
    ".pdf", ".zip", ".tar", ".gz", ".bz2", ".xz", ".7z", ".rar",
    ".exe", ".dll", ".so", ".dylib", ".o", ".a", ".lib",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".mp3", ".mp4", ".wav", ".ogg", ".webm", ".mov", ".avi",
    ".pyc", ".pyo", ".class", ".jar", ".war",
    ".sqlite", ".db",
}

MAX_FILE_BYTES = 2 * 1024 * 1024  # 2 MB — skip larger text files for performance


def walk(repo_root: Path) -> Iterator[Tuple[str, Path, int]]:
    repo_root = repo_root.resolve()
    for dirpath, dirnames, filenames in os.walk(repo_root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS and not d.startswith(".")]
        for fname in filenames:
            if fname.startswith("."):
                # Allow some dotfiles that are commonly meaningful
                if fname not in (".gitignore", ".env.example", ".editorconfig", ".prettierrc"):
                    continue
            abs_path = Path(dirpath) / fname
            try:
                size = abs_path.stat().st_size
            except OSError:
                continue
            ext = abs_path.suffix.lower()
            if ext in BINARY_EXTS:
                continue
            if size > MAX_FILE_BYTES:
                continue
            rel = abs_path.relative_to(repo_root).as_posix()
            yield rel, abs_path, size


def is_text_file(abs_path: Path) -> bool:
    """Cheap binary sniff: read first 8KB, check for NUL byte."""
    try:
        with open(abs_path, "rb") as f:
            chunk = f.read(8192)
        return b"\x00" not in chunk
    except OSError:
        return False
```

- [ ] **Step 2: Write `scripts/generate.py` skeleton**

```python
#!/usr/bin/env python3
"""project-wiki generator.

Usage:
    python generate.py --repo <path> --output <path> [--open]

Walks the target repo, runs all analyzers, and writes a self-contained
static HTML wiki to --output. The output opens via file:// — no server,
no build step, no install.
"""
from __future__ import annotations
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Local imports — make scripts/ importable when run directly
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from walker import walk  # noqa: E402


def gather_data(repo_root: Path) -> dict:
    """Run all analyzers and merge into a single payload."""
    files = list(walk(repo_root))
    data = {
        "meta": {
            "repo_name": repo_root.name,
            "repo_path": str(repo_root),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generator_version": "0.1.0",
            "file_count_walked": len(files),
        },
    }
    # Analyzers will be plugged in over the next tasks.
    return data


def main() -> int:
    p = argparse.ArgumentParser(description="Generate a static wiki for a project repo.")
    p.add_argument("--repo", required=True, type=Path, help="Path to the project repository")
    p.add_argument("--output", required=True, type=Path, help="Where to write the generated wiki")
    p.add_argument("--open", action="store_true", help="Open the result in the default browser")
    args = p.parse_args()

    repo = args.repo.resolve()
    if not repo.is_dir():
        print(f"error: repo path is not a directory: {repo}", file=sys.stderr)
        return 2

    print(f"[project-wiki] analyzing {repo}")
    data = gather_data(repo)
    print(f"[project-wiki] walked {data['meta']['file_count_walked']} files")

    # render.py will be implemented in Task 10 — for now just dump the JSON.
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "data.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"[project-wiki] wrote {args.output / 'data.json'}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 3: Smoke-test it on portable-kit itself**

```bash
cd portable-kit
python project-wiki/scripts/generate.py --repo . --output /tmp/wiki-test
```

Expected output:
```
[project-wiki] analyzing C:\Users\robin\Downloads\portable-kit
[project-wiki] walked NNN files
[project-wiki] wrote /tmp/wiki-test/data.json
```

Open `/tmp/wiki-test/data.json` and verify it has `meta.repo_name == "portable-kit"`.

- [ ] **Step 4: Commit**

```bash
git add project-wiki/scripts/
git commit -m "feat(project-wiki): generator skeleton with repo walker"
```

---

## Task 2: Repo stats analyzer

**Files:**
- Create: `project-wiki/scripts/analyzers/repo_stats.py`
- Modify: `project-wiki/scripts/generate.py` (plug in analyzer)

- [ ] **Step 1: Write `analyzers/repo_stats.py`**

```python
"""Aggregate file count, total bytes, total LOC across the repo."""
from __future__ import annotations
from pathlib import Path
from walker import walk, is_text_file


def run(repo_root: Path) -> dict:
    file_count = 0
    total_bytes = 0
    total_loc = 0
    largest = []  # list of (loc, rel_path)

    for rel, abs_path, size in walk(repo_root):
        file_count += 1
        total_bytes += size
        if not is_text_file(abs_path):
            continue
        try:
            with open(abs_path, "r", encoding="utf-8", errors="ignore") as f:
                loc = sum(1 for line in f if line.strip())
        except OSError:
            continue
        total_loc += loc
        largest.append((loc, rel))

    largest.sort(reverse=True)
    top_files = [{"path": p, "loc": loc} for loc, p in largest[:25]]

    return {
        "file_count": file_count,
        "total_bytes": total_bytes,
        "total_loc": total_loc,
        "top_files_by_loc": top_files,
    }
```

- [ ] **Step 2: Plug into generate.py**

In `generate.py`, change `gather_data`:

```python
from analyzers import repo_stats  # add at top with other imports

def gather_data(repo_root: Path) -> dict:
    files = list(walk(repo_root))
    data = {
        "meta": {
            "repo_name": repo_root.name,
            "repo_path": str(repo_root),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generator_version": "0.1.0",
            "file_count_walked": len(files),
        },
        "stats": repo_stats.run(repo_root),
    }
    return data
```

- [ ] **Step 3: Smoke test**

```bash
python project-wiki/scripts/generate.py --repo . --output /tmp/wiki-test
cat /tmp/wiki-test/data.json | python -c "import json,sys; d=json.load(sys.stdin); print('files:', d['stats']['file_count']); print('loc:', d['stats']['total_loc']); print('top:', d['stats']['top_files_by_loc'][:3])"
```

Expected: file_count > 50, total_loc > 5000, top_files_by_loc has at least 3 entries with sane paths.

- [ ] **Step 4: Commit**

```bash
git add project-wiki/scripts/analyzers/repo_stats.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): repo_stats analyzer"
```

---

## Task 3: Languages analyzer

**Files:**
- Create: `project-wiki/scripts/analyzers/languages.py`
- Modify: `project-wiki/scripts/generate.py`

- [ ] **Step 1: Write `analyzers/languages.py`**

```python
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
    ("Dockerfile",   {".dockerfile"},                             "#384d54"),
]

EXT_TO_LANG = {ext: (name, color) for name, exts, color in LANGUAGES for ext in exts}
SPECIAL_FILENAMES = {"Dockerfile": ("Dockerfile", "#384d54"), "Makefile": ("Makefile", "#427819")}


def run(repo_root: Path) -> dict:
    by_lang = defaultdict(lambda: {"files": 0, "loc": 0, "bytes": 0, "color": "#888888"})

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

    # Sort by LOC desc and convert to list for JSON-friendliness
    sorted_langs = sorted(
        ({"name": k, **v} for k, v in by_lang.items()),
        key=lambda x: x["loc"],
        reverse=True,
    )
    return {"breakdown": sorted_langs}
```

- [ ] **Step 2: Plug into `generate.py`**

```python
from analyzers import repo_stats, languages

def gather_data(repo_root: Path) -> dict:
    # ... existing meta ...
    return {
        "meta": { ... },
        "stats": repo_stats.run(repo_root),
        "languages": languages.run(repo_root),
    }
```

- [ ] **Step 3: Smoke test**

```bash
python project-wiki/scripts/generate.py --repo . --output /tmp/wiki-test
python -c "import json; d=json.load(open('/tmp/wiki-test/data.json')); print(d['languages']['breakdown'][:5])"
```

Expected: top languages include Python, Markdown, Rust (since portable-kit has Python scripts, knowledge .md files, and Rust crates).

- [ ] **Step 4: Commit**

```bash
git add project-wiki/scripts/analyzers/languages.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): language detection analyzer"
```

---

## Task 4: Structure analyzer

**Files:**
- Create: `project-wiki/scripts/analyzers/structure.py`
- Modify: `project-wiki/scripts/generate.py`

- [ ] **Step 1: Write `analyzers/structure.py`**

```python
"""Build a nested directory tree with file counts and sizes per node.

Output shape:
{
  "name": "portable-kit",
  "type": "dir",
  "size": 12345678,
  "file_count": 234,
  "children": [
    {"name": "knowledge", "type": "dir", "size": ..., "file_count": ..., "children": [...]},
    {"name": "README.md", "type": "file", "size": 1234, "language": "Markdown"},
    ...
  ]
}
"""
from __future__ import annotations
from pathlib import Path
from walker import walk, IGNORE_DIRS, BINARY_EXTS
from analyzers.languages import EXT_TO_LANG, SPECIAL_FILENAMES

MAX_DEPTH = 8  # Cap nesting to keep the JSON small and the sunburst readable


def run(repo_root: Path) -> dict:
    repo_root = repo_root.resolve()
    return _build(repo_root, repo_root, depth=0)


def _build(node: Path, root: Path, depth: int) -> dict:
    if node.is_file():
        ext = node.suffix.lower()
        if node.name in SPECIAL_FILENAMES:
            lang = SPECIAL_FILENAMES[node.name][0]
        else:
            lang = EXT_TO_LANG.get(ext, (None,))[0]
        try:
            size = node.stat().st_size
        except OSError:
            size = 0
        return {"name": node.name, "type": "file", "size": size, "language": lang}

    children = []
    total_size = 0
    file_count = 0
    if depth < MAX_DEPTH:
        try:
            entries = sorted(node.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except OSError:
            entries = []
        for entry in entries:
            if entry.is_dir():
                if entry.name in IGNORE_DIRS or entry.name.startswith("."):
                    continue
                child = _build(entry, root, depth + 1)
                children.append(child)
                total_size += child["size"]
                file_count += child["file_count"]
            elif entry.is_file():
                if entry.suffix.lower() in BINARY_EXTS:
                    continue
                if entry.name.startswith(".") and entry.name not in (".gitignore", ".editorconfig"):
                    continue
                child = _build(entry, root, depth + 1)
                children.append(child)
                total_size += child["size"]
                file_count += 1

    return {
        "name": node.name,
        "type": "dir",
        "size": total_size,
        "file_count": file_count,
        "children": children,
    }
```

- [ ] **Step 2: Plug into `generate.py`** — add `"structure": structure.run(repo_root),` to the dict.

- [ ] **Step 3: Smoke test** — verify the top-level node has `"name": "portable-kit"` and `children` includes `knowledge`, `runtime`, etc.

- [ ] **Step 4: Commit**

```bash
git add project-wiki/scripts/analyzers/structure.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): directory structure analyzer"
```

---

## Task 5: Dependencies analyzer

**Files:**
- Create: `project-wiki/scripts/analyzers/dependencies.py`
- Modify: `project-wiki/scripts/generate.py`

- [ ] **Step 1: Write `analyzers/dependencies.py`**

The function detects all known manifest files in the repo (root and one level deep — for monorepos with `packages/`, `crates/`, `apps/`) and parses each. Returns a list of `{manifest_path, ecosystem, packages: [{name, version, kind}]}`.

```python
"""Parse common dependency manifests across ecosystems.

Supported manifests (parsed inline, no third-party libs):
- package.json (npm/yarn/pnpm)
- pyproject.toml (Python — naive parser, sufficient for the [project.dependencies] block)
- requirements.txt
- Cargo.toml (Rust)
- go.mod (Go)
- Gemfile (Ruby — naive)
- pom.xml (Java — naive XML)
- composer.json (PHP)
"""
from __future__ import annotations
import json
import re
from pathlib import Path
from walker import IGNORE_DIRS

MANIFEST_NAMES = {
    "package.json", "pyproject.toml", "requirements.txt", "Cargo.toml",
    "go.mod", "Gemfile", "pom.xml", "composer.json",
}


def find_manifests(repo_root: Path, max_depth: int = 4) -> list[Path]:
    found = []
    def recurse(d: Path, depth: int):
        if depth > max_depth:
            return
        try:
            for entry in d.iterdir():
                if entry.is_dir():
                    if entry.name in IGNORE_DIRS or entry.name.startswith("."):
                        continue
                    recurse(entry, depth + 1)
                elif entry.name in MANIFEST_NAMES:
                    found.append(entry)
        except OSError:
            return
    recurse(repo_root, 0)
    return found


def parse_package_json(p: Path) -> dict:
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"ecosystem": "npm", "packages": []}
    pkgs = []
    for kind in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        for name, ver in (data.get(kind) or {}).items():
            pkgs.append({"name": name, "version": str(ver), "kind": kind})
    return {"ecosystem": "npm", "packages": pkgs, "project_name": data.get("name")}


def parse_cargo_toml(p: Path) -> dict:
    """Tiny TOML parser tailored for [dependencies] / [dev-dependencies] sections."""
    pkgs = []
    section = None
    try:
        for raw in p.read_text(encoding="utf-8").splitlines():
            line = raw.split("#", 1)[0].strip()
            if not line:
                continue
            if line.startswith("[") and line.endswith("]"):
                section = line[1:-1]
                continue
            if section in ("dependencies", "dev-dependencies", "build-dependencies"):
                m = re.match(r'^([\w\-]+)\s*=\s*(.+)$', line)
                if m:
                    name, rhs = m.group(1), m.group(2).strip()
                    if rhs.startswith('"') and rhs.endswith('"'):
                        ver = rhs.strip('"')
                    else:
                        # Inline table form: { version = "1.0", features = [...] }
                        vm = re.search(r'version\s*=\s*"([^"]+)"', rhs)
                        ver = vm.group(1) if vm else "*"
                    pkgs.append({"name": name, "version": ver, "kind": section})
    except OSError:
        pass
    return {"ecosystem": "cargo", "packages": pkgs}


def parse_pyproject(p: Path) -> dict:
    """Naive parser for [project] dependencies and [tool.poetry] sections."""
    pkgs = []
    section = None
    in_deps = False
    try:
        for raw in p.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if line.startswith("[") and line.endswith("]"):
                section = line[1:-1]
                in_deps = False
                continue
            if section == "project" and line.startswith("dependencies"):
                in_deps = True
                continue
            if in_deps:
                if line.startswith("]"):
                    in_deps = False
                    continue
                m = re.match(r'^"([^"]+)"', line)
                if m:
                    spec = m.group(1)
                    name = re.split(r'[<>=~!\s]', spec, 1)[0]
                    ver = spec[len(name):].lstrip()
                    pkgs.append({"name": name, "version": ver or "*", "kind": "dependencies"})
            if section == "tool.poetry.dependencies":
                m = re.match(r'^([\w\-]+)\s*=\s*"([^"]+)"', line)
                if m:
                    pkgs.append({"name": m.group(1), "version": m.group(2), "kind": "dependencies"})
    except OSError:
        pass
    return {"ecosystem": "python", "packages": pkgs}


def parse_requirements_txt(p: Path) -> dict:
    pkgs = []
    try:
        for raw in p.read_text(encoding="utf-8").splitlines():
            line = raw.split("#", 1)[0].strip()
            if not line or line.startswith("-"):
                continue
            name = re.split(r'[<>=~!\s]', line, 1)[0]
            ver = line[len(name):].strip() or "*"
            pkgs.append({"name": name, "version": ver, "kind": "dependencies"})
    except OSError:
        pass
    return {"ecosystem": "python", "packages": pkgs}


def parse_go_mod(p: Path) -> dict:
    pkgs = []
    in_block = False
    try:
        for raw in p.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if line.startswith("require ("):
                in_block = True
                continue
            if in_block and line == ")":
                in_block = False
                continue
            if in_block or line.startswith("require "):
                payload = line.replace("require ", "").strip()
                m = re.match(r'^(\S+)\s+(\S+)', payload)
                if m:
                    pkgs.append({"name": m.group(1), "version": m.group(2), "kind": "dependencies"})
    except OSError:
        pass
    return {"ecosystem": "go", "packages": pkgs}


PARSERS = {
    "package.json": parse_package_json,
    "Cargo.toml": parse_cargo_toml,
    "pyproject.toml": parse_pyproject,
    "requirements.txt": parse_requirements_txt,
    "go.mod": parse_go_mod,
    # Gemfile / pom.xml / composer.json are detected but parsed as empty stubs for v0.1.0
}


def run(repo_root: Path) -> dict:
    manifests = find_manifests(repo_root)
    out = []
    for m in manifests:
        parser = PARSERS.get(m.name)
        if parser is None:
            out.append({
                "manifest_path": str(m.relative_to(repo_root).as_posix()),
                "ecosystem": "unknown",
                "packages": [],
            })
            continue
        parsed = parser(m)
        parsed["manifest_path"] = str(m.relative_to(repo_root).as_posix())
        out.append(parsed)
    return {"manifests": out}
```

- [ ] **Step 2: Plug into `generate.py`** and **Step 3: Smoke test** — verify portable-kit yields manifests for `runtime/Cargo.toml`, `mempalace/pyproject.toml`, etc.

- [ ] **Step 4: Commit**

```bash
git add project-wiki/scripts/analyzers/dependencies.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): multi-ecosystem dependency parser"
```

---

## Task 6: Git log analyzer

**Files:**
- Create: `project-wiki/scripts/analyzers/git_log.py`
- Modify: `project-wiki/scripts/generate.py`

- [ ] **Step 1: Write `analyzers/git_log.py`**

```python
"""Extract commit history via `git log`. Gracefully returns {} if no git or no repo."""
from __future__ import annotations
import subprocess
from pathlib import Path

LOG_FORMAT = "%H%x1f%h%x1f%an%x1f%ae%x1f%at%x1f%s"
SEP = "\x1f"
MAX_COMMITS = 200


def run(repo_root: Path) -> dict:
    if not (repo_root / ".git").exists():
        return {"available": False, "commits": [], "summary": {}}
    try:
        result = subprocess.run(
            ["git", "log", f"--pretty=format:{LOG_FORMAT}", f"-n{MAX_COMMITS}"],
            cwd=repo_root,
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return {"available": False, "commits": [], "summary": {}}
    if result.returncode != 0:
        return {"available": False, "commits": [], "summary": {}}

    commits = []
    authors = {}
    for line in result.stdout.splitlines():
        parts = line.split(SEP)
        if len(parts) != 6:
            continue
        full, short, name, email, ts, subject = parts
        try:
            unix_ts = int(ts)
        except ValueError:
            continue
        commits.append({
            "hash": full,
            "short": short,
            "author": name,
            "email": email,
            "ts": unix_ts,
            "subject": subject,
        })
        authors[name] = authors.get(name, 0) + 1

    summary = {
        "total": len(commits),
        "authors": [{"name": k, "commits": v} for k, v in sorted(authors.items(), key=lambda x: -x[1])],
        "first_ts": commits[-1]["ts"] if commits else None,
        "last_ts": commits[0]["ts"] if commits else None,
    }
    return {"available": True, "commits": commits, "summary": summary}
```

- [ ] **Step 2: Plug in + smoke test + commit** (same pattern as previous tasks).

```bash
git add project-wiki/scripts/analyzers/git_log.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): git log analyzer"
```

---

## Task 7: README + Changelog analyzers

**Files:**
- Create: `project-wiki/scripts/analyzers/readme.py`
- Create: `project-wiki/scripts/analyzers/changelog.py`
- Modify: `project-wiki/scripts/generate.py`

- [ ] **Step 1: `analyzers/readme.py`**

```python
"""Find and read the project README. Markdown rendering happens in the browser
via assets/wiki-template/js/markdown.js — we just hand back the raw text and
basic metadata (title, length, headings)."""
from __future__ import annotations
import re
from pathlib import Path

CANDIDATES = ["README.md", "README.markdown", "README.MD", "Readme.md", "readme.md", "README"]


def run(repo_root: Path) -> dict:
    for name in CANDIDATES:
        p = repo_root / name
        if p.is_file():
            try:
                text = p.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            return {
                "found": True,
                "path": name,
                "raw": text,
                "title": _extract_title(text) or repo_root.name,
                "headings": _extract_headings(text),
                "char_count": len(text),
            }
    return {"found": False, "path": None, "raw": "", "title": repo_root.name, "headings": [], "char_count": 0}


def _extract_title(text: str) -> str | None:
    for line in text.splitlines():
        m = re.match(r"^#\s+(.+)$", line.strip())
        if m:
            return m.group(1).strip()
    return None


def _extract_headings(text: str) -> list[dict]:
    out = []
    for line in text.splitlines():
        m = re.match(r"^(#{1,6})\s+(.+)$", line.strip())
        if m:
            out.append({"level": len(m.group(1)), "text": m.group(2).strip()})
    return out
```

- [ ] **Step 2: `analyzers/changelog.py`** — same shape but searches for `CHANGELOG.md`, `CHANGES.md`, `HISTORY.md`. Returns `{found, raw, entries: []}` (entries parsed as `## [version] (date)` blocks via regex).

- [ ] **Step 3: Plug in + commit**

```bash
git add project-wiki/scripts/analyzers/readme.py project-wiki/scripts/analyzers/changelog.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): readme + changelog analyzers"
```

---

## Task 8: Symbols analyzer (regex per language)

**Files:**
- Create: `project-wiki/scripts/analyzers/symbols.py`
- Modify: `project-wiki/scripts/generate.py`

- [ ] **Step 1: Write `analyzers/symbols.py`**

Best-effort symbol extraction via regex. Languages: Python, JavaScript/TypeScript, Rust, Go. We're not parsing — we're identifying top-level definitions for the symbol explorer.

```python
"""Best-effort symbol extraction via regex per language. Not a parser — meant
for the file-page sidebar and the search index."""
from __future__ import annotations
import re
from pathlib import Path
from walker import walk

PATTERNS = {
    "python": [
        (re.compile(r"^class\s+(\w+)"), "class"),
        (re.compile(r"^def\s+(\w+)"), "function"),
        (re.compile(r"^async\s+def\s+(\w+)"), "function"),
    ],
    "javascript": [
        (re.compile(r"^export\s+class\s+(\w+)"), "class"),
        (re.compile(r"^class\s+(\w+)"), "class"),
        (re.compile(r"^export\s+function\s+(\w+)"), "function"),
        (re.compile(r"^function\s+(\w+)"), "function"),
        (re.compile(r"^export\s+const\s+(\w+)\s*="), "const"),
        (re.compile(r"^const\s+(\w+)\s*=\s*\("), "function"),
    ],
    "rust": [
        (re.compile(r"^(?:pub\s+)?fn\s+(\w+)"), "function"),
        (re.compile(r"^(?:pub\s+)?struct\s+(\w+)"), "struct"),
        (re.compile(r"^(?:pub\s+)?enum\s+(\w+)"), "enum"),
        (re.compile(r"^(?:pub\s+)?trait\s+(\w+)"), "trait"),
        (re.compile(r"^impl(?:<[^>]+>)?\s+(\w+)"), "impl"),
    ],
    "go": [
        (re.compile(r"^func\s+(\w+)"), "function"),
        (re.compile(r"^func\s+\([^)]+\)\s+(\w+)"), "method"),
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
    by_file = {}
    for rel, abs_path, _size in walk(repo_root):
        ext = abs_path.suffix.lower()
        lang = EXT_TO_LANG.get(ext)
        if not lang:
            continue
        try:
            lines = abs_path.read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        symbols = []
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
```

- [ ] **Step 2: Plug in, smoke test, commit**

```bash
git add project-wiki/scripts/analyzers/symbols.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): regex symbol extractor for 4 languages"
```

---

## Task 9: File index

**Files:**
- Create: `project-wiki/scripts/analyzers/file_index.py`
- Modify: `project-wiki/scripts/generate.py`

- [ ] **Step 1: Write `analyzers/file_index.py`**

```python
"""Flat list of every walked file with metadata for the file explorer.

For text files under 200 KB, includes the *content* (truncated to 600 lines) so
the wiki can render syntax-highlighted previews entirely from data.json — no
extra fetches needed."""
from __future__ import annotations
from pathlib import Path
from walker import walk, is_text_file
from analyzers.languages import EXT_TO_LANG, SPECIAL_FILENAMES

INLINE_MAX_BYTES = 200 * 1024
INLINE_MAX_LINES = 600


def run(repo_root: Path) -> dict:
    files = []
    for rel, abs_path, size in walk(repo_root):
        ext = abs_path.suffix.lower()
        if abs_path.name in SPECIAL_FILENAMES:
            lang = SPECIAL_FILENAMES[abs_path.name][0]
        else:
            lang = EXT_TO_LANG.get(ext, (None,))[0]

        entry = {
            "path": rel,
            "size": size,
            "language": lang,
            "loc": 0,
            "preview": None,
            "truncated": False,
        }
        if is_text_file(abs_path):
            try:
                text = abs_path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                files.append(entry)
                continue
            lines = text.splitlines()
            entry["loc"] = sum(1 for l in lines if l.strip())
            if size <= INLINE_MAX_BYTES:
                if len(lines) > INLINE_MAX_LINES:
                    entry["preview"] = "\n".join(lines[:INLINE_MAX_LINES])
                    entry["truncated"] = True
                else:
                    entry["preview"] = text
        files.append(entry)
    return {"files": files, "count": len(files)}
```

- [ ] **Step 2: Plug in + commit**

```bash
git add project-wiki/scripts/analyzers/file_index.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): file index with inline content previews"
```

---

## Task 10: Render — copy template + inject data

**Files:**
- Create: `project-wiki/scripts/render.py`
- Modify: `project-wiki/scripts/generate.py`

- [ ] **Step 1: Write `scripts/render.py`**

```python
"""Copy the wiki-template assets to the output dir, then inject data.json
inline into index.html via a placeholder string replacement."""
from __future__ import annotations
import json
import shutil
from pathlib import Path

PLACEHOLDER = "__WIKI_DATA_PLACEHOLDER__"


def render(repo_data: dict, template_dir: Path, output_dir: Path) -> Path:
    if output_dir.exists():
        shutil.rmtree(output_dir)
    shutil.copytree(template_dir, output_dir)

    index = output_dir / "index.html"
    html = index.read_text(encoding="utf-8")
    if PLACEHOLDER not in html:
        raise RuntimeError(f"index.html is missing the {PLACEHOLDER!r} marker")

    # Escape `</script>` to prevent breaking out of the script tag.
    json_payload = json.dumps(repo_data, ensure_ascii=False).replace("</", "<\\/")
    html = html.replace(PLACEHOLDER, json_payload)
    index.write_text(html, encoding="utf-8")

    # Also write data.json next to index.html for debugging / external tools
    (output_dir / "data.json").write_text(
        json.dumps(repo_data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return index
```

- [ ] **Step 2: Wire into `generate.py`**

```python
from render import render

# inside main(), replace the placeholder write_text block with:
template_dir = SCRIPT_DIR.parent / "assets" / "wiki-template"
index_path = render(data, template_dir, args.output)
print(f"[project-wiki] wrote wiki to {args.output}")
print(f"[project-wiki] open {index_path} in your browser")
if args.open:
    import webbrowser
    webbrowser.open(index_path.as_uri())
```

NOTE: This will fail until Task 11 creates `index.html`. That's expected — we're staging the wiring.

- [ ] **Step 3: Commit**

```bash
git add project-wiki/scripts/render.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): renderer that inlines data into HTML shell"
```

---

## Task 11: HTML shell + design tokens

**Files:**
- Create: `project-wiki/assets/wiki-template/index.html`
- Create: `project-wiki/assets/wiki-template/css/reset.css`
- Create: `project-wiki/assets/wiki-template/css/tokens.css`
- Create: `project-wiki/assets/wiki-template/css/base.css`

- [ ] **Step 1: `index.html`**

```html
<!DOCTYPE html>
<html lang="en" data-theme="midnight">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="dark light" />
  <title>Project Wiki</title>

  <link rel="stylesheet" href="css/reset.css" />
  <link rel="stylesheet" href="css/tokens.css" />
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/layout.css" />
  <link rel="stylesheet" href="css/components.css" />
  <link rel="stylesheet" href="css/charts.css" />
  <link rel="stylesheet" href="css/prism.css" />
  <link rel="stylesheet" href="css/themes/midnight.css" />
  <link rel="stylesheet" href="css/themes/aurora.css" />
  <link rel="stylesheet" href="css/themes/solar.css" />

  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
</head>
<body>
  <div id="app" class="app-shell">
    <aside class="sidebar" id="sidebar" aria-label="Navigation"></aside>
    <header class="topbar" id="topbar"></header>
    <main class="main" id="main"></main>
    <footer class="footer" id="footer"></footer>
  </div>

  <div id="modal-root"></div>
  <div id="toast-root" role="status" aria-live="polite"></div>

  <script id="wiki-data" type="application/json">__WIKI_DATA_PLACEHOLDER__</script>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: `css/reset.css`** — modern reset (margin/padding 0, box-sizing border-box, line-height 1.5, font-family inherit, ditch list bullets in nav, smooth scroll, etc.)

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { line-height: 1.5; -webkit-text-size-adjust: 100%; tab-size: 4; }
body { min-height: 100vh; min-height: 100dvh; font-family: var(--font-sans); }
img, picture, svg, video, canvas { display: block; max-width: 100%; height: auto; }
button, input, select, textarea { font: inherit; color: inherit; }
button { background: none; border: none; cursor: pointer; }
ul[role="list"], ol[role="list"] { list-style: none; }
a { color: inherit; text-decoration: none; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 3: `css/tokens.css`** — the design system (CSS custom properties, theme-agnostic defaults that themes override)

```css
:root {
  /* Type scale */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  --fs-12: 0.75rem;  --fs-14: 0.875rem; --fs-16: 1rem;     --fs-18: 1.125rem;
  --fs-24: 1.5rem;   --fs-32: 2rem;     --fs-48: 3rem;     --fs-64: 4rem;
  --fw-regular: 400; --fw-medium: 500;  --fw-semibold: 600; --fw-bold: 700;
  --lh-tight: 1.2;   --lh-snug: 1.35;   --lh-normal: 1.55;  --lh-relaxed: 1.7;

  /* Spacing */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;

  /* Radii */
  --r-sm: 6px; --r-md: 10px; --r-lg: 16px; --r-xl: 24px; --r-full: 9999px;

  /* Motion */
  --t-fast: 140ms; --t-base: 220ms; --t-slow: 340ms;
  --easing-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Shadows */
  --sh-soft: 0 1px 3px rgba(0,0,0,0.30), 0 1px 2px rgba(0,0,0,0.20);
  --sh-elev: 0 12px 32px rgba(0,0,0,0.40), 0 4px 12px rgba(0,0,0,0.25);
  --sh-glow: 0 0 0 1px var(--accent-translucent), 0 0 24px var(--accent-translucent);

  /* Layout */
  --sidebar-w: 280px;
  --topbar-h: 60px;
  --content-max: 1100px;

  /* Defaults — themes override these */
  --bg:           #0a0e1a;
  --bg-elevated:  #161b29;
  --bg-overlay:   #1e2538;
  --bg-glass:     rgba(22, 27, 41, 0.72);
  --border:       #2d3548;
  --border-strong:#3b465f;
  --text:         #f1f5f9;
  --text-muted:   #94a3b8;
  --text-faint:   #64748b;
  --accent:       #7c3aed;
  --accent-soft:  #a78bfa;
  --accent-translucent: rgba(124, 58, 237, 0.35);
  --accent-2:     #06b6d4;
  --success:      #10b981;
  --warning:      #f59e0b;
  --danger:       #ef4444;
}
```

- [ ] **Step 4: `css/base.css`** — typography, body, link defaults, scrollbar, selection.

```css
body {
  background: var(--bg);
  color: var(--text);
  font-size: var(--fs-16);
  line-height: var(--lh-normal);
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
h1 { font-size: var(--fs-32); font-weight: var(--fw-semibold); line-height: var(--lh-tight); letter-spacing: -0.02em; }
h2 { font-size: var(--fs-24); font-weight: var(--fw-semibold); line-height: var(--lh-snug); letter-spacing: -0.01em; }
h3 { font-size: var(--fs-18); font-weight: var(--fw-semibold); line-height: var(--lh-snug); }
h4 { font-size: var(--fs-16); font-weight: var(--fw-semibold); }
code, pre { font-family: var(--font-mono); font-size: 0.875em; }
::selection { background: var(--accent-translucent); color: var(--text); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: var(--r-full); }
::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
```

- [ ] **Step 5: Verify**

Run the generator now:
```bash
python project-wiki/scripts/generate.py --repo . --output /tmp/wiki-test --open
```

Expected: a blank dark page (no content yet — JS app isn't built) with the right background color, no console errors about missing CSS files. Inspect the DOM and confirm `<script id="wiki-data">` contains JSON.

- [ ] **Step 6: Commit**

```bash
git add project-wiki/assets/wiki-template/
git commit -m "feat(project-wiki): HTML shell + design tokens + base styles"
```

---

## Task 12: Layout & components CSS

**Files:**
- Create: `project-wiki/assets/wiki-template/css/layout.css`
- Create: `project-wiki/assets/wiki-template/css/components.css`

- [ ] **Step 1: `css/layout.css`**

```css
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  grid-template-rows: var(--topbar-h) 1fr auto;
  grid-template-areas:
    "sidebar topbar"
    "sidebar main"
    "sidebar footer";
  min-height: 100dvh;
}
.sidebar {
  grid-area: sidebar;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border);
  padding: var(--sp-5) var(--sp-4);
  overflow-y: auto;
  position: sticky; top: 0; height: 100dvh;
}
.topbar {
  grid-area: topbar;
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border-bottom: 1px solid var(--border);
  padding: 0 var(--sp-5);
  display: flex; align-items: center; gap: var(--sp-4);
  position: sticky; top: 0; z-index: 10;
}
.main {
  grid-area: main;
  padding: var(--sp-6) var(--sp-7);
  max-width: 100%;
  overflow-x: hidden;
}
.main > * {
  max-width: var(--content-max);
  margin: 0 auto;
}
.footer {
  grid-area: footer;
  border-top: 1px solid var(--border);
  padding: var(--sp-4) var(--sp-5);
  text-align: center;
  color: var(--text-faint);
  font-size: var(--fs-12);
}

/* Responsive: collapse sidebar on tablet/mobile */
@media (max-width: 1024px) {
  .app-shell {
    grid-template-columns: 1fr;
    grid-template-areas: "topbar" "main" "footer";
  }
  .sidebar {
    position: fixed; left: 0; top: 0; z-index: 100;
    transform: translateX(-100%);
    transition: transform var(--t-base) var(--easing-out);
    box-shadow: var(--sh-elev);
  }
  .sidebar[data-open="true"] { transform: translateX(0); }
}
@media (max-width: 640px) {
  .main { padding: var(--sp-4) var(--sp-3); }
}
```

- [ ] **Step 2: `css/components.css`**

```css
/* Cards */
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  transition: border-color var(--t-base) var(--easing-out), transform var(--t-base) var(--easing-out);
}
.card:hover { border-color: var(--border-strong); }
.card-glass {
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
}

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--r-md);
  font-size: var(--fs-14); font-weight: var(--fw-medium);
  background: var(--bg-overlay); color: var(--text);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all var(--t-base) var(--easing-out);
  min-height: 36px;
}
.btn:hover { border-color: var(--accent); transform: translateY(-1px); }
.btn:active { transform: translateY(0) scale(0.98); }
.btn-primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border-color: transparent;
  color: white;
  box-shadow: var(--sh-glow);
}
.btn-ghost { background: transparent; border-color: transparent; }
.btn-icon { padding: var(--sp-2); aspect-ratio: 1; min-width: 36px; }

/* Badges */
.badge {
  display: inline-flex; align-items: center; gap: var(--sp-1);
  padding: 2px var(--sp-2);
  border-radius: var(--r-full);
  font-size: var(--fs-12); font-weight: var(--fw-medium);
  background: var(--bg-overlay); color: var(--text-muted);
  border: 1px solid var(--border);
}
.badge-accent { background: var(--accent-translucent); color: var(--accent-soft); border-color: var(--accent); }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  display: grid; place-items: center;
  animation: fadeIn var(--t-base) var(--easing-out);
}
.modal {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  box-shadow: var(--sh-elev);
  padding: var(--sp-6);
  width: min(560px, calc(100vw - var(--sp-6)));
  max-height: calc(100dvh - var(--sp-6));
  overflow-y: auto;
  animation: slideUp var(--t-base) var(--easing-spring);
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Tooltip */
.tooltip {
  position: absolute; pointer-events: none;
  background: var(--bg-overlay);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: var(--sp-1) var(--sp-2);
  font-size: var(--fs-12);
  white-space: nowrap;
  z-index: 1000;
  box-shadow: var(--sh-soft);
}

/* Stat tile */
.stat {
  display: flex; flex-direction: column; gap: var(--sp-1);
}
.stat-value {
  font-size: var(--fs-32); font-weight: var(--fw-bold);
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--text), var(--text-muted));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-variant-numeric: tabular-nums;
}
.stat-label {
  font-size: var(--fs-12); color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.08em;
}
```

- [ ] **Step 3: Verify** (open in browser, inspect that styles load, no errors)
- [ ] **Step 4: Commit**

```bash
git add project-wiki/assets/wiki-template/css/layout.css project-wiki/assets/wiki-template/css/components.css
git commit -m "feat(project-wiki): layout grid + core components CSS"
```

---

## Task 13: Theme — Midnight (default)

**Files:**
- Create: `project-wiki/assets/wiki-template/css/themes/midnight.css`

- [ ] **Step 1: Write the theme**

The defaults in `tokens.css` already encode Midnight, but explicit theme rules let users switch. Wrap them in `[data-theme="midnight"]`:

```css
[data-theme="midnight"] {
  --bg:           #0a0e1a;
  --bg-elevated:  #161b29;
  --bg-overlay:   #1e2538;
  --bg-glass:     rgba(22, 27, 41, 0.72);
  --border:       #2d3548;
  --border-strong:#3b465f;
  --text:         #f1f5f9;
  --text-muted:   #94a3b8;
  --text-faint:   #64748b;
  --accent:       #7c3aed;
  --accent-soft:  #a78bfa;
  --accent-translucent: rgba(124, 58, 237, 0.35);
  --accent-2:     #06b6d4;
  --success:      #10b981;
  --warning:      #f59e0b;
  --danger:       #ef4444;
}
```

- [ ] **Step 2: Verify + commit**

```bash
git add project-wiki/assets/wiki-template/css/themes/midnight.css
git commit -m "feat(project-wiki): midnight theme (default)"
```

---

## Task 14: Themes — Aurora and Solar

**Files:**
- Create: `project-wiki/assets/wiki-template/css/themes/aurora.css`
- Create: `project-wiki/assets/wiki-template/css/themes/solar.css`

- [ ] **Step 1: `aurora.css`** — purple/teal/violet vibe

```css
[data-theme="aurora"] {
  --bg:           #0d0a1f;
  --bg-elevated:  #1a1431;
  --bg-overlay:   #251c44;
  --bg-glass:     rgba(26, 20, 49, 0.72);
  --border:       #382b5e;
  --border-strong:#4d3a7d;
  --text:         #f3f0ff;
  --text-muted:   #b3a7d4;
  --text-faint:   #7a6da0;
  --accent:       #c084fc;
  --accent-soft:  #d8b4fe;
  --accent-translucent: rgba(192, 132, 252, 0.35);
  --accent-2:     #2dd4bf;
  --success:      #34d399;
  --warning:      #fbbf24;
  --danger:       #f87171;
}
```

- [ ] **Step 2: `solar.css`** — warm orange/red dark mode

```css
[data-theme="solar"] {
  --bg:           #18120d;
  --bg-elevated:  #261b13;
  --bg-overlay:   #36281b;
  --bg-glass:     rgba(38, 27, 19, 0.72);
  --border:       #4a3624;
  --border-strong:#634a32;
  --text:         #fef3e2;
  --text-muted:   #d4b896;
  --text-faint:   #9c7d5a;
  --accent:       #fb923c;
  --accent-soft:  #fdba74;
  --accent-translucent: rgba(251, 146, 60, 0.35);
  --accent-2:     #f472b6;
  --success:      #84cc16;
  --warning:      #facc15;
  --danger:       #dc2626;
}
```

- [ ] **Step 3: Verify** — manually edit `<html data-theme="aurora">` and `solar` to verify theme switching works visually.
- [ ] **Step 4: Commit**

```bash
git add project-wiki/assets/wiki-template/css/themes/
git commit -m "feat(project-wiki): aurora + solar alt themes"
```

---

## Task 15: Bootstrap JS — utils + store + app

**Files:**
- Create: `project-wiki/assets/wiki-template/js/utils.js`
- Create: `project-wiki/assets/wiki-template/js/store.js`
- Create: `project-wiki/assets/wiki-template/js/app.js`

> **DRY directive for the rest of the plan:** From this task onward, **every JS file imports `escapeHtml`, `formatBytes`, and `formatNumber` from `./utils.js`** (or `../utils.js` from `pages/` and `charts/`). The plan's later code blocks still show local `function escapeHtml(s) { … }` definitions for readability — when implementing, **delete those locals and import from utils.js instead**. This applies to overview.js, files.js, modules.js, deps.js, activity.js, structure.js, search-results.js, search.js, settings.js, nav.js, topbar.js, and every chart file. Single source of truth, no duplication.

- [ ] **Step 1: `js/utils.js`** — shared helpers (used by everything else)

```javascript
// utils.js — single source of truth for tiny shared helpers.
// Import via:  import { escapeHtml, formatBytes } from "./utils.js";  (adjust path)

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ESC[c]);
}

export function formatBytes(b) {
  if (b == null) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function formatNumber(n) {
  return (n ?? 0).toLocaleString();
}

export function formatRelativeTime(unixTs) {
  const ms = Date.now() - unixTs * 1000;
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}
```

- [ ] **Step 2: `js/store.js`** — tiny pub/sub store

```javascript
// store.js — central state with pub/sub
const listeners = new Set();
let state = {
  data: null,           // The full data.json payload
  page: "overview",     // Current page id
  theme: "midnight",
  settings: {           // Toggleable extras (persisted to localStorage)
    showStats: true,
    showLanguages: true,
    showStructure: true,
    showFiles: true,
    showModules: true,
    showDeps: true,
    showActivity: true,
    showSymbols: true,
    showCharts: true,
    showAIExplanations: false,  // Off by default — opt-in
    density: "comfortable",     // 'comfortable' | 'compact'
  },
  search: { query: "", results: [] },
};

const SETTINGS_KEY = "project-wiki:settings:v1";
const THEME_KEY = "project-wiki:theme:v1";

export function init(initialData) {
  state.data = initialData;
  // Restore persisted settings
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) state.settings = { ...state.settings, ...JSON.parse(raw) };
    const theme = localStorage.getItem(THEME_KEY);
    if (theme) state.theme = theme;
  } catch {}
  document.documentElement.dataset.theme = state.theme;
}

export function get() { return state; }

export function set(patch) {
  state = { ...state, ...patch };
  if (patch.theme) {
    document.documentElement.dataset.theme = patch.theme;
    try { localStorage.setItem(THEME_KEY, patch.theme); } catch {}
  }
  for (const fn of listeners) fn(state);
}

export function setSettings(partial) {
  state = { ...state, settings: { ...state.settings, ...partial } };
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); } catch {}
  for (const fn of listeners) fn(state);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isFirstVisit() {
  return !localStorage.getItem(SETTINGS_KEY);
}

export function markVisited() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); } catch {}
}
```

- [ ] **Step 3: `js/app.js`** — entry point

```javascript
// app.js — bootstraps the wiki
import * as store from "./store.js";
import { renderNav } from "./nav.js";
import { renderTopbar } from "./topbar.js";
import { renderPage } from "./router.js";
import { initSearch } from "./search.js";
import { openSettings } from "./settings.js";

function readData() {
  const tag = document.getElementById("wiki-data");
  if (!tag) throw new Error("Missing #wiki-data script tag");
  const text = tag.textContent || "{}";
  return JSON.parse(text);
}

function bootstrap() {
  let data;
  try {
    data = readData();
  } catch (err) {
    document.getElementById("main").innerHTML = `
      <div class="card" style="margin: 64px auto; max-width: 480px;">
        <h2>Failed to load wiki data</h2>
        <p style="color: var(--text-muted); margin-top: 8px;">${String(err)}</p>
      </div>
    `;
    return;
  }
  store.init(data);
  renderNav();
  renderTopbar();
  renderPage(getPageFromHash());
  initSearch();

  window.addEventListener("hashchange", () => renderPage(getPageFromHash()));
  store.subscribe(() => {
    renderNav();
    renderPage(getPageFromHash());
  });

  // First-visit: auto-open settings
  if (store.isFirstVisit()) {
    setTimeout(() => openSettings({ firstVisit: true }), 600);
  }
}

function getPageFromHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  return h || "overview";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
```

NOTE: this references `nav.js`, `topbar.js`, `router.js`, `search.js`, `settings.js` — all stubs come in the next step. Create stub files that export the named functions as no-ops so this loads.

- [ ] **Step 4: Stub the missing modules** so the import doesn't fail:

```javascript
// js/nav.js
export function renderNav() { document.getElementById("sidebar").innerHTML = "<p>nav</p>"; }
// js/topbar.js
export function renderTopbar() { document.getElementById("topbar").innerHTML = "<p>topbar</p>"; }
// js/router.js
export function renderPage(page) { document.getElementById("main").innerHTML = `<h1>Page: ${page}</h1>`; }
// js/search.js
export function initSearch() {}
// js/settings.js
export function openSettings() {}
```

- [ ] **Step 5: Run end-to-end**

```bash
python project-wiki/scripts/generate.py --repo . --output /tmp/wiki-test --open
```

Expected: page renders with "nav", "topbar", "Page: overview" and the right theme. No JS errors. Hash routing works (try `#/files`).

- [ ] **Step 6: Commit**

```bash
git add project-wiki/assets/wiki-template/js/
git commit -m "feat(project-wiki): utils + store + bootstrap + module stubs"
```

---

## Task 16: Sidebar nav

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/nav.js`

- [ ] **Step 1: Replace `nav.js` stub**

```javascript
import * as store from "./store.js";
import { icon } from "./icons.js";

const ALL_PAGES = [
  { id: "overview", label: "Overview", icon: "home", setting: null },
  { id: "structure", label: "Structure", icon: "folder-tree", setting: "showStructure" },
  { id: "files", label: "Files", icon: "file-code", setting: "showFiles" },
  { id: "modules", label: "Modules", icon: "boxes", setting: "showModules" },
  { id: "deps", label: "Dependencies", icon: "package", setting: "showDeps" },
  { id: "activity", label: "Activity", icon: "git-commit", setting: "showActivity" },
];

export function renderNav() {
  const { data, page, settings } = store.get();
  const sidebar = document.getElementById("sidebar");
  const visible = ALL_PAGES.filter(p => p.setting === null || settings[p.setting]);

  sidebar.innerHTML = `
    <div class="brand">
      <div class="brand-icon">${icon("book", 22)}</div>
      <div class="brand-text">
        <div class="brand-title">${escapeHtml(data.meta.repo_name)}</div>
        <div class="brand-sub">project wiki</div>
      </div>
    </div>
    <nav class="nav-list" role="navigation">
      ${visible.map(p => `
        <a href="#/${p.id}" class="nav-item ${page === p.id ? "is-active" : ""}" data-page="${p.id}">
          <span class="nav-icon">${icon(p.icon, 18)}</span>
          <span class="nav-label">${p.label}</span>
        </a>
      `).join("")}
    </nav>
    <div class="nav-footer">
      <button class="btn btn-ghost" id="open-settings-btn" aria-label="Settings">
        ${icon("settings", 18)} <span>Configure</span>
      </button>
    </div>
  `;
  document.getElementById("open-settings-btn")?.addEventListener("click", () => {
    import("./settings.js").then(m => m.openSettings());
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
```

- [ ] **Step 2: Add nav-specific CSS to `components.css`**

```css
.brand { display: flex; align-items: center; gap: var(--sp-3); padding-bottom: var(--sp-5); margin-bottom: var(--sp-4); border-bottom: 1px solid var(--border); }
.brand-icon { width: 40px; height: 40px; border-radius: var(--r-md); background: linear-gradient(135deg, var(--accent), var(--accent-2)); display: grid; place-items: center; box-shadow: var(--sh-glow); color: white; }
.brand-title { font-weight: var(--fw-semibold); font-size: var(--fs-16); }
.brand-sub { font-size: var(--fs-12); color: var(--text-faint); }
.nav-list { display: flex; flex-direction: column; gap: 2px; }
.nav-item { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md); color: var(--text-muted); font-size: var(--fs-14); font-weight: var(--fw-medium); transition: background var(--t-fast) var(--easing-out), color var(--t-fast) var(--easing-out); }
.nav-item:hover { background: var(--bg-overlay); color: var(--text); }
.nav-item.is-active { background: var(--accent-translucent); color: var(--accent-soft); }
.nav-item.is-active .nav-icon { color: var(--accent-soft); }
.nav-icon { display: grid; place-items: center; width: 24px; height: 24px; }
.nav-footer { margin-top: auto; padding-top: var(--sp-4); border-top: 1px solid var(--border); }
```

- [ ] **Step 3: Verify** — sidebar shows brand, nav links, settings button. Active state highlights correctly when you change the hash. (Icons will appear blank until Task 33 adds the sprite — this is OK.)
- [ ] **Step 4: Commit**

```bash
git add project-wiki/assets/wiki-template/js/nav.js project-wiki/assets/wiki-template/css/components.css
git commit -m "feat(project-wiki): sidebar navigation"
```

---

## Task 17: Topbar + page router shell

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/topbar.js`
- Modify: `project-wiki/assets/wiki-template/js/router.js`

- [ ] **Step 1: `topbar.js`**

```javascript
import * as store from "./store.js";
import { icon } from "./icons.js";

export function renderTopbar() {
  const { data } = store.get();
  const top = document.getElementById("topbar");
  top.innerHTML = `
    <button class="btn btn-icon btn-ghost mobile-menu-btn" aria-label="Open menu">${icon("menu", 20)}</button>
    <div class="crumbs"><span class="crumb-root">${escapeHtml(data.meta.repo_name)}</span></div>
    <div class="topbar-spacer"></div>
    <button class="btn search-trigger" id="search-trigger">${icon("search", 16)} <span>Search</span> <kbd>⌘K</kbd></button>
    <button class="btn btn-icon btn-ghost" id="topbar-settings" aria-label="Settings">${icon("settings", 18)}</button>
  `;
  document.getElementById("topbar-settings")?.addEventListener("click", () => {
    import("./settings.js").then(m => m.openSettings());
  });
  document.getElementById("search-trigger")?.addEventListener("click", () => {
    import("./search.js").then(m => m.openSearch());
  });
  document.querySelector(".mobile-menu-btn")?.addEventListener("click", () => {
    const sb = document.getElementById("sidebar");
    sb.dataset.open = sb.dataset.open === "true" ? "false" : "true";
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
```

Add to `components.css`:
```css
.topbar-spacer { flex: 1; }
.crumbs { font-weight: var(--fw-medium); color: var(--text-muted); }
.crumb-root { color: var(--text); }
.search-trigger { gap: var(--sp-3); min-width: 220px; justify-content: space-between; color: var(--text-muted); }
.search-trigger kbd { background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 1px var(--sp-1); font-size: var(--fs-12); font-family: var(--font-mono); }
.mobile-menu-btn { display: none; }
@media (max-width: 1024px) { .mobile-menu-btn { display: inline-flex; } .search-trigger { min-width: auto; } .search-trigger span, .search-trigger kbd { display: none; } }
```

- [ ] **Step 2: `router.js`** — page registry

```javascript
import * as store from "./store.js";

const PAGES = {
  overview: () => import("./pages/overview.js").then(m => m.render),
  structure: () => import("./pages/structure.js").then(m => m.render),
  files: () => import("./pages/files.js").then(m => m.render),
  modules: () => import("./pages/modules.js").then(m => m.render),
  deps: () => import("./pages/deps.js").then(m => m.render),
  activity: () => import("./pages/activity.js").then(m => m.render),
  search: () => import("./pages/search-results.js").then(m => m.render),
};

let currentPage = null;

export async function renderPage(page) {
  currentPage = page;
  const main = document.getElementById("main");
  main.innerHTML = `<div class="page-loading">Loading…</div>`;
  const loader = PAGES[page] || PAGES.overview;
  try {
    const renderFn = await loader();
    if (currentPage !== page) return; // race protection
    main.innerHTML = "";
    main.scrollTo?.({ top: 0 });
    renderFn(main, store.get());
    // Stagger fade-in for cards
    main.querySelectorAll(".card, .stat, .chart-container").forEach((el, i) => {
      el.style.animation = `fadeUp ${350}ms ${i * 30}ms ${"cubic-bezier(0.2,0.8,0.2,1)"} both`;
    });
  } catch (err) {
    main.innerHTML = `<div class="card"><h2>Page failed to render</h2><pre style="margin-top: 12px; color: var(--text-muted);">${String(err)}</pre></div>`;
    console.error(err);
  }
}
```

Add to `base.css`:
```css
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
```

- [ ] **Step 3: Stub all page modules** so dynamic imports don't 404. Create six 2-line files in `js/pages/`:
```javascript
// pages/overview.js
export function render(main, state) { main.innerHTML = "<h1>Overview</h1><p>(coming soon)</p>"; }
```
Repeat for `structure.js`, `files.js`, `modules.js`, `deps.js`, `activity.js`, `search-results.js`.

- [ ] **Step 4: Verify + commit**

```bash
git add project-wiki/assets/wiki-template/js/topbar.js project-wiki/assets/wiki-template/js/router.js project-wiki/assets/wiki-template/js/pages/ project-wiki/assets/wiki-template/css/
git commit -m "feat(project-wiki): topbar + router with page registry"
```

---

## Task 18: Overview page

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/pages/overview.js`
- Create: `project-wiki/assets/wiki-template/js/markdown.js`

- [ ] **Step 1: `js/markdown.js`** — tiny markdown→HTML

```javascript
// Tiny markdown — supports headings, paragraphs, code blocks, inline code,
// links, bold, italic, lists, blockquotes. ~120 LOC, sufficient for README rendering.
export function md(src) {
  if (!src) return "";
  // Code blocks first (so their internals aren't processed)
  const codeBlocks = [];
  src = src.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || "", code });
    return `\u0000CODE${idx}\u0000`;
  });
  // Inline code
  const inlineCodes = [];
  src = src.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(code);
    return `\u0001IC${idx}\u0001`;
  });
  // Escape HTML
  src = src.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  // Headings
  src = src.replace(/^(#{1,6})\s+(.+)$/gm, (_, h, t) => `<h${h.length}>${t}</h${h.length}>`);
  // Bold + italic
  src = src.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  src = src.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Links
  src = src.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Blockquotes
  src = src.replace(/^>\s?(.+)$/gm, "<blockquote>$1</blockquote>");
  // Unordered lists
  src = src.replace(/(?:^[-*+]\s+.+(?:\n|$))+/gm, m => {
    const items = m.trim().split("\n").map(l => `<li>${l.replace(/^[-*+]\s+/, "")}</li>`).join("");
    return `<ul>${items}</ul>`;
  });
  // Ordered lists
  src = src.replace(/(?:^\d+\.\s+.+(?:\n|$))+/gm, m => {
    const items = m.trim().split("\n").map(l => `<li>${l.replace(/^\d+\.\s+/, "")}</li>`).join("");
    return `<ol>${items}</ol>`;
  });
  // Paragraphs (any non-empty line not already wrapped in a tag)
  src = src.split(/\n{2,}/).map(block => {
    if (/^<(h\d|ul|ol|blockquote|pre)/.test(block.trim())) return block;
    return block.trim() ? `<p>${block.trim().replace(/\n/g, "<br />")}</p>` : "";
  }).join("\n");
  // Restore inline code + code blocks
  src = src.replace(/\u0001IC(\d+)\u0001/g, (_, i) => `<code>${escapeHtml(inlineCodes[+i])}</code>`);
  src = src.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => {
    const { lang, code } = codeBlocks[+i];
    return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
  });
  return src;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
}
```

- [ ] **Step 1.5: Create a stub `charts/donut.js`** so the import below resolves

```javascript
// charts/donut.js — STUB. Replaced by the real implementation in Task 19.
export function drawDonut(container) {
  if (container) container.innerHTML = `<p class="muted">Chart loading…</p>`;
}
```

- [ ] **Step 2: `js/pages/overview.js`**

```javascript
import { md } from "../markdown.js";
import { drawDonut } from "../charts/donut.js";  // stub now, real chart in Task 19
import { escapeHtml, formatBytes, formatNumber } from "../utils.js";

export function render(main, state) {
  const { data, settings } = state;
  const { stats, languages, readme, meta } = data;

  main.innerHTML = `
    <section class="hero">
      <h1>${escapeHtml(meta.repo_name)}</h1>
      <p class="hero-sub">${stats.file_count.toLocaleString()} files · ${stats.total_loc.toLocaleString()} lines · ${formatBytes(stats.total_bytes)}</p>
    </section>

    ${settings.showStats ? `
      <section class="grid grid-3" style="margin-bottom: var(--sp-7);">
        <div class="card stat">
          <span class="stat-label">Files</span>
          <span class="stat-value">${stats.file_count.toLocaleString()}</span>
        </div>
        <div class="card stat">
          <span class="stat-label">Lines of code</span>
          <span class="stat-value">${stats.total_loc.toLocaleString()}</span>
        </div>
        <div class="card stat">
          <span class="stat-label">Languages</span>
          <span class="stat-value">${languages.breakdown.length}</span>
        </div>
      </section>
    ` : ""}

    ${settings.showLanguages && settings.showCharts && languages.breakdown.length ? `
      <section class="card" style="margin-bottom: var(--sp-6);">
        <header class="card-head">
          <h2>Languages</h2>
          <p class="muted">Breakdown by lines of code</p>
        </header>
        <div id="overview-donut" class="chart-container"></div>
      </section>
    ` : ""}

    ${readme.found ? `
      <section class="card markdown-body">
        ${md(readme.raw)}
      </section>
    ` : ""}
  `;

  if (settings.showLanguages && settings.showCharts) {
    drawDonut(document.getElementById("overview-donut"), languages.breakdown);
  }
}
```

(No local helper definitions — `escapeHtml` and `formatBytes` come from `utils.js` per the directive in Task 15. Apply the same pattern to every subsequent page/chart.)

Add CSS to `components.css`:
```css
.hero { padding: var(--sp-7) 0 var(--sp-5); }
.hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); background: linear-gradient(135deg, var(--text), var(--accent-soft)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero-sub { color: var(--text-muted); margin-top: var(--sp-2); font-size: var(--fs-18); font-variant-numeric: tabular-nums; }
.grid { display: grid; gap: var(--sp-4); }
.grid-3 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.card-head { margin-bottom: var(--sp-4); }
.card-head h2 { margin-bottom: var(--sp-1); }
.muted { color: var(--text-muted); font-size: var(--fs-14); }
.markdown-body { line-height: var(--lh-relaxed); }
.markdown-body h1, .markdown-body h2, .markdown-body h3 { margin-top: var(--sp-5); margin-bottom: var(--sp-2); }
.markdown-body p { margin-bottom: var(--sp-3); color: var(--text-muted); }
.markdown-body code { background: var(--bg-overlay); padding: 1px 6px; border-radius: var(--r-sm); color: var(--accent-soft); }
.markdown-body pre { background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--sp-4); overflow-x: auto; margin: var(--sp-3) 0; }
.markdown-body pre code { background: transparent; padding: 0; color: var(--text); }
.markdown-body a { color: var(--accent-soft); border-bottom: 1px solid transparent; transition: border-color var(--t-fast); }
.markdown-body a:hover { border-bottom-color: var(--accent); }
.markdown-body blockquote { border-left: 3px solid var(--accent); padding-left: var(--sp-4); color: var(--text-muted); margin: var(--sp-3) 0; }
.markdown-body ul, .markdown-body ol { padding-left: var(--sp-5); margin-bottom: var(--sp-3); color: var(--text-muted); }
```

- [ ] **Step 3: Verify** — overview shows hero, stat tiles, donut placeholder (will be empty until Task 19), README rendered.
- [ ] **Step 4: Commit**

```bash
git add project-wiki/assets/wiki-template/js/markdown.js project-wiki/assets/wiki-template/js/pages/overview.js project-wiki/assets/wiki-template/css/components.css
git commit -m "feat(project-wiki): overview page with hero + stats + readme"
```

---

## Task 19: Donut chart

**Files:**
- Create: `project-wiki/assets/wiki-template/js/charts/donut.js`
- Modify: `project-wiki/assets/wiki-template/css/charts.css` (create if missing)

- [ ] **Step 1: `js/charts/donut.js`**

```javascript
// Donut chart — vanilla SVG. Accessible via ARIA. Tooltip on hover/tap.
const SIZE = 320, R_OUTER = 140, R_INNER = 84, CX = 160, CY = 160;

export function drawDonut(container, items) {
  if (!container) return;
  const total = items.reduce((s, x) => s + (x.loc || 0), 0);
  if (total === 0) {
    container.innerHTML = `<p class="muted">No data</p>`;
    return;
  }

  let angle = -Math.PI / 2; // start at 12 o'clock
  const slices = items.map((it, idx) => {
    const portion = (it.loc || 0) / total;
    const start = angle;
    angle += portion * Math.PI * 2;
    const end = angle;
    return { ...it, start, end, portion, idx };
  });

  const svg = `
    <svg viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="Language breakdown donut chart" class="chart-svg donut-svg">
      <g class="donut-slices">
        ${slices.map(s => `
          <path d="${arcPath(CX, CY, R_OUTER, R_INNER, s.start, s.end)}"
                fill="${s.color}"
                data-idx="${s.idx}"
                data-name="${escapeHtml(s.name)}"
                data-pct="${(s.portion * 100).toFixed(1)}"
                data-loc="${s.loc}"
                tabindex="0"
                aria-label="${escapeHtml(s.name)}: ${(s.portion * 100).toFixed(1)} percent">
          </path>
        `).join("")}
      </g>
      <text x="${CX}" y="${CY - 6}" text-anchor="middle" class="donut-center-num">${total.toLocaleString()}</text>
      <text x="${CX}" y="${CY + 18}" text-anchor="middle" class="donut-center-label">lines</text>
    </svg>
    <ul class="legend" role="list">
      ${slices.map(s => `
        <li class="legend-item" data-idx="${s.idx}">
          <span class="legend-swatch" style="background: ${s.color}"></span>
          <span class="legend-name">${escapeHtml(s.name)}</span>
          <span class="legend-value">${(s.portion * 100).toFixed(1)}%</span>
        </li>
      `).join("")}
    </ul>
  `;

  container.innerHTML = svg;
  bindHover(container);
}

function arcPath(cx, cy, rOuter, rInner, start, end) {
  const large = end - start > Math.PI ? 1 : 0;
  const x1 = cx + rOuter * Math.cos(start), y1 = cy + rOuter * Math.sin(start);
  const x2 = cx + rOuter * Math.cos(end),   y2 = cy + rOuter * Math.sin(end);
  const x3 = cx + rInner * Math.cos(end),   y3 = cy + rInner * Math.sin(end);
  const x4 = cx + rInner * Math.cos(start), y4 = cy + rInner * Math.sin(start);
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    `Z`,
  ].join(" ");
}

function bindHover(container) {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.style.opacity = "0";
  container.appendChild(tooltip);
  container.querySelectorAll(".donut-slices path").forEach(p => {
    p.addEventListener("mouseenter", e => {
      tooltip.textContent = `${p.dataset.name}: ${p.dataset.pct}% (${(+p.dataset.loc).toLocaleString()} LOC)`;
      tooltip.style.opacity = "1";
      p.style.transform = "scale(1.03)";
      p.style.transformOrigin = "center";
    });
    p.addEventListener("mousemove", e => {
      const rect = container.getBoundingClientRect();
      tooltip.style.left = `${e.clientX - rect.left + 12}px`;
      tooltip.style.top = `${e.clientY - rect.top + 12}px`;
    });
    p.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
      p.style.transform = "";
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
```

- [ ] **Step 2: `css/charts.css`**

```css
.chart-container { position: relative; display: grid; grid-template-columns: 1fr; gap: var(--sp-5); place-items: center; }
@media (min-width: 720px) { .chart-container.with-legend { grid-template-columns: 1fr 1fr; } }
.chart-svg { width: 100%; max-width: 360px; height: auto; }
.donut-svg path { transition: transform var(--t-base) var(--easing-out), filter var(--t-base) var(--easing-out); cursor: pointer; }
.donut-svg path:hover { filter: brightness(1.15) drop-shadow(0 0 12px currentColor); }
.donut-center-num { fill: var(--text); font-size: 26px; font-weight: 700; font-family: var(--font-sans); font-variant-numeric: tabular-nums; }
.donut-center-label { fill: var(--text-faint); font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
.legend { list-style: none; display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 280px; }
.legend-item { display: grid; grid-template-columns: 16px 1fr auto; align-items: center; gap: var(--sp-3); font-size: var(--fs-14); padding: var(--sp-1) var(--sp-2); border-radius: var(--r-sm); transition: background var(--t-fast); }
.legend-item:hover { background: var(--bg-overlay); }
.legend-swatch { width: 12px; height: 12px; border-radius: 3px; }
.legend-name { color: var(--text); }
.legend-value { color: var(--text-faint); font-variant-numeric: tabular-nums; }
```

- [ ] **Step 3: Verify** — overview now shows the donut with language colors, legend, hover tooltip, scale-on-hover effect.
- [ ] **Step 4: Commit**

```bash
git add project-wiki/assets/wiki-template/js/charts/donut.js project-wiki/assets/wiki-template/css/charts.css
git commit -m "feat(project-wiki): donut chart with hover + legend"
```

---

═══════════════════════════════════════════════════════════════════════════
## ▸▸▸ STOP-POINT after Task 19 — Phase A complete ◂◂◂
═══════════════════════════════════════════════════════════════════════════

*State: working wiki, Midnight theme, overview page renders cleanly, donut chart animates and tooltips, sidebar nav works, all 9 analyzers feeding data.json. Walking away here gives you a real artifact. Recommended: open a fresh subagent / new session for Phase B so the chart implementations don't compete with this conversation's context.*

═══════════════════════════════════════════════════════════════════════════
## ▸▸▸ PHASE B — BEAUTY (Tasks 20 → 34) ◂◂◂
═══════════════════════════════════════════════════════════════════════════

*Goal: turn the working v0.5 into "rent överjävligt snyggt". All remaining charts, all remaining pages, alt themes, search palette, settings modal, syntax highlighting.*

---

## Tasks 20–26: Remaining charts

**Shared chart contract** (every chart obeys this — no exceptions):

```javascript
import { escapeHtml } from "../utils.js";   // mandatory — no local re-defs
export function drawX(container, data, opts = {}) { /* renders into container */ }
```

- Pure function: takes a DOM container, data, optional options. Returns nothing.
- Vanilla SVG only — no canvas, no Chart.js, no D3.
- Reads colors from CSS variables (`var(--accent)`, `var(--text-muted)`, etc.) so theme switching is free.
- `role="img"` on the SVG and a descriptive `aria-label`.
- Tooltip on hover/focus, ≥44px touch targets where applicable.
- Respects `prefers-reduced-motion` (no animations on init when set).

| Task | Chart | Data source (in `data.json`) | LOC est. | Cuttable? | Page where it lands |
|------|-------|------------------------------|----------|-----------|---------------------|
| 20 | Bar | `stats.top_files_by_loc` | ~80 | no — used on overview | Overview |
| 21 | Sunburst | `structure` (recursive tree) | ~120 | no — showpiece | Structure |
| 22 | Treemap | `structure` (flattened) | ~150 | **yes** | Structure |
| 23 | Force-graph | `dependencies.manifests` (transformed) | ~200 | **yes** (hardest task) | Dependencies |
| 24 | Heatmap | `git.commits` (bucketed by day) | ~120 | **yes** (one of 24/25) | Activity |
| 25 | Timeline | `git.commits` (sorted by ts) | ~100 | **yes** (one of 24/25) | Activity |
| 26 | Sparkline | inline per-row metrics | ~40 | **yes** | Files page |

Below are **complete code skeletons** for each chart. Implement, smoke-test in the corresponding page, commit one at a time. Skipping a cuttable chart only means removing one `import` line and one `draw…()` call from the page that would have used it.

- [ ] **Task 20: Bar chart** (`js/charts/bar.js`) — horizontal bars for top files by LOC

```javascript
const BAR_H = 28, GAP = 6, LABEL_W = 220;
export function drawBar(container, items, opts = {}) {
  if (!container) return;
  const max = Math.max(...items.map(x => x.value), 1);
  const w = container.clientWidth || 720;
  const innerW = w - LABEL_W - 60;
  const totalH = items.length * (BAR_H + GAP);
  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${totalH}" class="chart-svg bar-svg" role="img" aria-label="${opts.label || "Bar chart"}">
      ${items.map((it, i) => {
        const y = i * (BAR_H + GAP);
        const bw = (it.value / max) * innerW;
        return `
          <g class="bar-row" data-tip="${escapeHtml(it.label)}: ${it.value.toLocaleString()}">
            <text x="${LABEL_W - 10}" y="${y + BAR_H/2 + 5}" text-anchor="end" class="bar-label">${escapeHtml(it.label)}</text>
            <rect x="${LABEL_W}" y="${y}" width="${bw}" height="${BAR_H}" rx="6" fill="url(#bar-grad)" />
            <text x="${LABEL_W + bw + 8}" y="${y + BAR_H/2 + 5}" class="bar-value">${it.value.toLocaleString()}</text>
          </g>
        `;
      }).join("")}
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--accent)" />
          <stop offset="100%" stop-color="var(--accent-2)" />
        </linearGradient>
      </defs>
    </svg>
  `;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
```

CSS: `.bar-label { fill: var(--text-muted); font-size: 12px; font-family: var(--font-mono); } .bar-value { fill: var(--text); font-size: 12px; font-variant-numeric: tabular-nums; }`

Smoke test: temporarily call `drawBar(div, stats.top_files_by_loc.slice(0,15).map(f => ({ label: f.path, value: f.loc })))`. Commit.

- [ ] **Task 21: Sunburst** (`js/charts/sunburst.js`) — nested arcs for folder structure

```javascript
const SB_SIZE = 480, SB_CX = 240, SB_CY = 240, SB_R = 220;
export function drawSunburst(container, root) {
  if (!container) return;
  const slices = [];
  const ringWidth = SB_R / 5;  // up to 5 levels visible
  function recurse(node, depth, angleStart, angleEnd) {
    if (depth > 5 || !node) return;
    if (depth > 0) {
      slices.push({
        node, depth,
        rIn: (depth - 1) * ringWidth + 30,
        rOut: depth * ringWidth + 30,
        a0: angleStart, a1: angleEnd,
      });
    }
    if (!node.children || !node.children.length) return;
    const total = node.children.reduce((s, c) => s + Math.max(c.size || c.file_count || 1, 1), 0);
    let cur = angleStart;
    for (const child of node.children) {
      const portion = Math.max(child.size || child.file_count || 1, 1) / total;
      const span = (angleEnd - angleStart) * portion;
      recurse(child, depth + 1, cur, cur + span);
      cur += span;
    }
  }
  recurse(root, 0, -Math.PI / 2, Math.PI * 1.5);

  const colorFor = (s) => {
    const hue = (s.a0 + Math.PI / 2) / (Math.PI * 2) * 360;
    return `hsl(${hue}, 65%, ${60 - s.depth * 5}%)`;
  };
  container.innerHTML = `
    <svg viewBox="0 0 ${SB_SIZE} ${SB_SIZE}" class="chart-svg sunburst-svg" role="img" aria-label="Folder structure sunburst">
      <g>
        ${slices.map(s => `
          <path d="${arcPath(SB_CX, SB_CY, s.rOut, s.rIn, s.a0, s.a1)}"
                fill="${s.node.type === 'file' ? 'var(--accent)' : colorFor(s)}"
                stroke="var(--bg)"
                stroke-width="1"
                data-name="${escapeHtml(s.node.name)}"
                data-size="${s.node.size || 0}"
                data-type="${s.node.type}"
                tabindex="0"
                class="sb-slice">
            <title>${escapeHtml(s.node.name)} (${s.node.type})</title>
          </path>
        `).join("")}
        <circle cx="${SB_CX}" cy="${SB_CY}" r="28" fill="var(--bg-elevated)" stroke="var(--border)" />
        <text x="${SB_CX}" y="${SB_CY + 4}" text-anchor="middle" class="sb-center">${escapeHtml(root.name)}</text>
      </g>
    </svg>
  `;
}
function arcPath(cx,cy,rO,rI,s,e){const l=e-s>Math.PI?1:0;const x1=cx+rO*Math.cos(s),y1=cy+rO*Math.sin(s),x2=cx+rO*Math.cos(e),y2=cy+rO*Math.sin(e),x3=cx+rI*Math.cos(e),y3=cy+rI*Math.sin(e),x4=cx+rI*Math.cos(s),y4=cy+rI*Math.sin(s);return `M ${x1} ${y1} A ${rO} ${rO} 0 ${l} 1 ${x2} ${y2} L ${x3} ${y3} A ${rI} ${rI} 0 ${l} 0 ${x4} ${y4} Z`;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
```

CSS: `.sb-slice { transition: filter var(--t-base); cursor: pointer; } .sb-slice:hover { filter: brightness(1.25); } .sb-center { fill: var(--text); font-size: 11px; font-weight: 600; }`

- [ ] **Task 22: Treemap** (`js/charts/treemap.js`) — squarified treemap for file sizes

Implement [squarified algorithm](https://en.wikipedia.org/wiki/Treemapping#Squarified) (~80 LOC). Each leaf is a file, sized by `size`. Tooltip shows path + bytes. Skeleton:

```javascript
export function drawTreemap(container, root, opts = {}) {
  const w = container.clientWidth || 720, h = opts.height || 480;
  const items = flatten(root); // [{name, size, path}, ...]
  const total = items.reduce((s, i) => s + i.size, 0);
  const rects = squarify(items, { x: 0, y: 0, w, h }, total);
  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="chart-svg treemap-svg" role="img" aria-label="File size treemap">
      ${rects.map(r => `
        <g class="tm-cell" data-tip="${escapeHtml(r.path)}: ${formatBytes(r.size)}">
          <rect x="${r.x+1}" y="${r.y+1}" width="${Math.max(r.w-2,0)}" height="${Math.max(r.h-2,0)}" rx="3" fill="${colorByLang(r.language)}" />
          ${r.w > 60 && r.h > 18 ? `<text x="${r.x+6}" y="${r.y+16}" class="tm-label">${escapeHtml(r.name)}</text>` : ""}
        </g>
      `).join("")}
    </svg>
  `;
}
// flatten + squarify + colorByLang + formatBytes implementations follow standard form;
// keep file under ~200 LOC.
```

- [ ] **Task 23: Force-directed graph** (`js/charts/force-graph.js`) — verlet physics for dependency graphs

Verlet integration with ~80 LOC physics core. Nodes are draggable. Edges are straight lines. Skeleton:

```javascript
export function drawForceGraph(container, { nodes, edges }, opts = {}) {
  const w = container.clientWidth || 720, h = opts.height || 520;
  // Initialize positions
  nodes.forEach((n, i) => {
    n.x = w/2 + Math.cos(i / nodes.length * 2 * Math.PI) * 180;
    n.y = h/2 + Math.sin(i / nodes.length * 2 * Math.PI) * 180;
    n.vx = 0; n.vy = 0;
  });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.classList.add("chart-svg", "fg-svg");
  container.appendChild(svg);

  const edgeEls = edges.map(e => {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("class", "fg-edge");
    svg.appendChild(l);
    return l;
  });
  const nodeEls = nodes.map(n => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "fg-node");
    g.innerHTML = `
      <circle r="${10 + Math.sqrt((n.weight || 1) * 4)}" fill="var(--accent)" stroke="var(--bg)" stroke-width="2"/>
      <text dy="-14" text-anchor="middle" class="fg-label">${escapeHtml(n.label || n.id)}</text>
    `;
    svg.appendChild(g);
    return g;
  });

  function tick() {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i+1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist2 = dx*dx + dy*dy + 0.1;
        const f = 800 / dist2;
        const dist = Math.sqrt(dist2);
        a.vx -= f * dx / dist; a.vy -= f * dy / dist;
        b.vx += f * dx / dist; b.vy += f * dy / dist;
      }
    }
    // Spring (edges)
    for (const e of edges) {
      const a = nodes[e.source], b = nodes[e.target];
      if (!a || !b) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const f = (dist - 100) * 0.02;
      a.vx += f * dx/dist; a.vy += f * dy/dist;
      b.vx -= f * dx/dist; b.vy -= f * dy/dist;
    }
    // Damping + center pull
    for (const n of nodes) {
      n.vx = (n.vx + (w/2 - n.x) * 0.005) * 0.85;
      n.vy = (n.vy + (h/2 - n.y) * 0.005) * 0.85;
      n.x += n.vx; n.y += n.vy;
    }
    // Render
    edgeEls.forEach((el, i) => {
      const a = nodes[edges[i].source], b = nodes[edges[i].target];
      if (!a || !b) return;
      el.setAttribute("x1", a.x); el.setAttribute("y1", a.y);
      el.setAttribute("x2", b.x); el.setAttribute("y2", b.y);
    });
    nodeEls.forEach((el, i) => el.setAttribute("transform", `translate(${nodes[i].x},${nodes[i].y})`));
  }
  let frames = 0;
  function loop() { tick(); if (frames++ < 240) requestAnimationFrame(loop); }
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(loop);
  else { for (let i = 0; i < 240; i++) tick(); }
  // Drag handling
  bindDrag(svg, nodes, nodeEls);
}
function bindDrag(svg, nodes, els) { /* pointerdown/move/up — set node.x/y from cursor */ }
```

- [ ] **Task 24: Heatmap** (`js/charts/heatmap.js`) — GitHub-style activity heatmap from `git_log.commits`

53 columns × 7 rows of squares. Each rect's intensity is mapped to commit count for that day. ~120 LOC.

- [ ] **Task 25: Timeline** (`js/charts/timeline.js`) — horizontal commit timeline with dots + tooltips. ~120 LOC.

- [ ] **Task 26: Sparkline** (`js/charts/sparkline.js`) — small inline polylines for per-file metrics. ~40 LOC. Used in file rows in Task 28.

For each chart task: implement, smoke-test by temporarily calling from `overview.js` with sample data, verify visually, commit individually. Pattern:

```bash
git add project-wiki/assets/wiki-template/js/charts/<name>.js project-wiki/assets/wiki-template/css/charts.css
git commit -m "feat(project-wiki): <name> chart"
```

---

## Task 27: Structure page (sunburst showcase)

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/pages/structure.js`

- [ ] **Step 1**

```javascript
import { drawSunburst } from "../charts/sunburst.js";
import { drawTreemap } from "../charts/treemap.js";

export function render(main, state) {
  const { data, settings } = state;
  main.innerHTML = `
    <h1>Structure</h1>
    <p class="muted" style="margin-bottom: var(--sp-6);">Folder breakdown of <strong>${escapeHtml(data.meta.repo_name)}</strong></p>
    ${settings.showCharts ? `
      <div class="grid grid-2-uneven">
        <section class="card">
          <h2>Sunburst</h2>
          <p class="muted">Click a slice to focus.</p>
          <div id="sb-chart" class="chart-container" style="margin-top: var(--sp-4);"></div>
        </section>
        <section class="card">
          <h2>Treemap</h2>
          <p class="muted">Sized by file bytes.</p>
          <div id="tm-chart" class="chart-container" style="margin-top: var(--sp-4);"></div>
        </section>
      </div>
    ` : ""}
  `;
  if (settings.showCharts) {
    drawSunburst(document.getElementById("sb-chart"), data.structure);
    drawTreemap(document.getElementById("tm-chart"), data.structure);
  }
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
```

CSS: `.grid-2-uneven { grid-template-columns: 1fr; gap: var(--sp-5); } @media (min-width: 1100px) { .grid-2-uneven { grid-template-columns: 1.2fr 1fr; } }`

- [ ] **Step 2: Verify + commit**

```bash
git add project-wiki/assets/wiki-template/js/pages/structure.js project-wiki/assets/wiki-template/css/charts.css
git commit -m "feat(project-wiki): structure page with sunburst + treemap"
```

---

## Task 28: Files page (explorer + viewer + syntax highlight)

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/pages/files.js`

- [ ] **Step 1**

```javascript
import { highlight } from "../prism.js";

export function render(main, state) {
  const { data, settings } = state;
  const files = data.file_index.files;
  let activePath = files[0]?.path || null;

  main.innerHTML = `
    <h1>Files</h1>
    <div class="files-layout">
      <aside class="card files-list" role="navigation" aria-label="File list">
        <input type="text" class="files-filter" placeholder="Filter files…" />
        <ul class="files-ul">
          ${files.slice(0, 500).map(f => `
            <li>
              <button class="file-item ${f.path === activePath ? 'is-active' : ''}" data-path="${escapeHtml(f.path)}">
                <span class="file-name">${escapeHtml(f.path)}</span>
                <span class="file-meta">${f.loc || 0}</span>
              </button>
            </li>
          `).join("")}
        </ul>
      </aside>
      <section class="card files-viewer" id="files-viewer">
        <div class="muted">Select a file</div>
      </section>
    </div>
  `;

  const viewer = document.getElementById("files-viewer");
  function show(path) {
    const file = files.find(f => f.path === path);
    if (!file) return;
    main.querySelectorAll(".file-item").forEach(el => el.classList.toggle("is-active", el.dataset.path === path));
    if (!file.preview) {
      viewer.innerHTML = `<div class="muted">Binary or empty file</div>`;
      return;
    }
    viewer.innerHTML = `
      <header class="viewer-head">
        <h3>${escapeHtml(file.path)}</h3>
        <div class="badge">${file.language || "text"}</div>
      </header>
      <pre class="viewer-pre"><code class="language-${(file.language || "text").toLowerCase()}">${highlight(file.preview, file.language)}</code></pre>
      ${file.truncated ? `<p class="muted">…truncated to first 600 lines.</p>` : ""}
    `;
  }
  show(activePath);
  main.querySelectorAll(".file-item").forEach(el => {
    el.addEventListener("click", () => show(el.dataset.path));
  });
  // Filter
  main.querySelector(".files-filter")?.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    main.querySelectorAll(".files-ul li").forEach(li => {
      li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
```

CSS:
```css
.files-layout { display: grid; grid-template-columns: 320px 1fr; gap: var(--sp-4); align-items: start; }
@media (max-width: 900px) { .files-layout { grid-template-columns: 1fr; } }
.files-list { max-height: 75vh; overflow-y: auto; padding: var(--sp-3); }
.files-filter { width: 100%; padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md); border: 1px solid var(--border); background: var(--bg); color: var(--text); margin-bottom: var(--sp-3); }
.files-ul { list-style: none; display: flex; flex-direction: column; gap: 1px; }
.file-item { width: 100%; display: flex; justify-content: space-between; gap: var(--sp-2); padding: var(--sp-2) var(--sp-3); border-radius: var(--r-sm); font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); text-align: left; }
.file-item:hover { background: var(--bg-overlay); color: var(--text); }
.file-item.is-active { background: var(--accent-translucent); color: var(--accent-soft); }
.file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.file-meta { font-variant-numeric: tabular-nums; opacity: 0.7; }
.viewer-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-4); }
.viewer-pre { background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--sp-4); overflow-x: auto; max-height: 70vh; line-height: 1.55; }
```

NOTE: `highlight()` from `prism.js` lands in Task 33. Until then, escape and return the string as-is. Verify rendering. Commit.

```bash
git add project-wiki/assets/wiki-template/js/pages/files.js project-wiki/assets/wiki-template/css/components.css
git commit -m "feat(project-wiki): files page with explorer + viewer"
```

---

## Task 29: Modules page

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/pages/modules.js`

A "module" = top-level directory in the structure tree. Show each as a card with: name, file count, total LOC, list of top-level files, the README headings if matched. Optionally include AI-generated explanations placeholder (visible only when `settings.showAIExplanations` is on).

Implementation: ~120 LOC. Pattern matches `overview.js` and `structure.js`. Commit.

---

## Task 30: Dependencies page

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/pages/deps.js`

Renders:
1. **Summary card** — # of manifests, # of total packages, ecosystems detected
2. **Per-manifest cards** — table of packages with name, version, kind
3. **Force-directed graph** (when `settings.showCharts`) — nodes are packages + manifests, edges connect each package to its manifest

Convert `data.dependencies.manifests` into nodes/edges:
```javascript
const nodes = [];
const edges = [];
data.dependencies.manifests.forEach((m, mi) => {
  nodes.push({ id: `m${mi}`, label: m.manifest_path, weight: 5 });
  m.packages.forEach((pkg, pi) => {
    const id = `p${mi}-${pi}`;
    nodes.push({ id, label: pkg.name, weight: 1 });
    edges.push({ source: nodes.findIndex(n => n.id === `m${mi}`), target: nodes.length - 1 });
  });
});
drawForceGraph(container, { nodes, edges });
```

Commit.

---

## Task 31: Activity page

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/pages/activity.js`

Renders:
1. Stats: total commits, # of authors, first/last commit date
2. **Heatmap** of commits per day (53 weeks × 7 days)
3. **Timeline** of recent 50 commits
4. Top authors list with commit counts

Hide entirely if `data.git.available === false` — show a friendly "no git history" empty state.

Commit.

---

## Task 32: Search palette (Cmd+K)

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/search.js`

- [ ] **Step 1**

```javascript
import * as store from "./store.js";

let index = null;
let modalEl = null;

function buildIndex(data) {
  const items = [];
  // Files
  for (const f of data.file_index?.files || []) items.push({ kind: "file", label: f.path, target: `#/files?path=${encodeURIComponent(f.path)}` });
  // Symbols
  for (const [path, syms] of Object.entries(data.symbols?.by_file || {})) {
    for (const s of syms) items.push({ kind: s.kind, label: `${s.name}  ·  ${path}:${s.line}`, target: `#/files?path=${encodeURIComponent(path)}` });
  }
  // README headings
  for (const h of data.readme?.headings || []) items.push({ kind: "heading", label: h.text, target: `#/overview` });
  // Pages
  ["overview","structure","files","modules","deps","activity"].forEach(p => items.push({ kind: "page", label: p, target: `#/${p}` }));
  return items;
}

function fuzzy(query, label) {
  query = query.toLowerCase();
  label = label.toLowerCase();
  let qi = 0, score = 0;
  for (let i = 0; i < label.length && qi < query.length; i++) {
    if (label[i] === query[qi]) { score += (1 - i / label.length); qi++; }
  }
  return qi === query.length ? score : 0;
}

export function initSearch() {
  index = buildIndex(store.get().data);
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape" && modalEl) closeSearch();
  });
}

export function openSearch() {
  if (modalEl) return;
  modalEl = document.createElement("div");
  modalEl.className = "modal-backdrop search-modal-bd";
  modalEl.innerHTML = `
    <div class="modal search-modal" role="dialog" aria-modal="true" aria-label="Search">
      <input type="text" class="search-input" placeholder="Search files, symbols, pages…" autofocus />
      <ul class="search-results"></ul>
    </div>
  `;
  modalEl.addEventListener("click", e => { if (e.target === modalEl) closeSearch(); });
  document.getElementById("modal-root").appendChild(modalEl);
  const input = modalEl.querySelector(".search-input");
  const list = modalEl.querySelector(".search-results");
  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (!q) { list.innerHTML = ""; return; }
    const scored = index.map(it => ({ it, score: fuzzy(q, it.label) })).filter(x => x.score > 0).sort((a,b) => b.score - a.score).slice(0, 30);
    list.innerHTML = scored.map(({ it }) => `
      <li><a class="search-result" href="${it.target}" data-kind="${it.kind}">
        <span class="badge">${it.kind}</span>
        <span class="search-result-label">${escapeHtml(it.label)}</span>
      </a></li>
    `).join("");
    list.querySelectorAll("a").forEach(a => a.addEventListener("click", () => closeSearch()));
  });
}

export function closeSearch() {
  modalEl?.remove();
  modalEl = null;
}

function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
```

CSS:
```css
.search-modal { width: min(640px, calc(100vw - var(--sp-6))); padding: 0; }
.search-input { width: 100%; padding: var(--sp-4) var(--sp-5); background: transparent; border: none; border-bottom: 1px solid var(--border); color: var(--text); font-size: var(--fs-18); }
.search-input:focus { outline: none; border-bottom-color: var(--accent); }
.search-results { list-style: none; max-height: 60vh; overflow-y: auto; padding: var(--sp-2); }
.search-result { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md); color: var(--text-muted); transition: background var(--t-fast); }
.search-result:hover, .search-result:focus { background: var(--bg-overlay); color: var(--text); }
.search-result-label { font-family: var(--font-mono); font-size: var(--fs-14); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

- [ ] **Step 2: Verify** Cmd+K opens, typing filters, click closes + navigates. **Commit.**

---

## Task 33: Settings modal (the configurator)

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/settings.js`

- [ ] **Step 1: Replace stub**

```javascript
import * as store from "./store.js";

const SECTIONS = [
  {
    title: "Theme",
    type: "theme",
  },
  {
    title: "Pages",
    items: [
      { key: "showStructure", label: "Structure (sunburst + treemap)" },
      { key: "showFiles", label: "Files explorer" },
      { key: "showModules", label: "Modules" },
      { key: "showDeps", label: "Dependencies" },
      { key: "showActivity", label: "Git activity" },
    ],
  },
  {
    title: "Visualizations & extras",
    items: [
      { key: "showStats", label: "Stat tiles" },
      { key: "showLanguages", label: "Language donut" },
      { key: "showCharts", label: "All charts (sunburst, treemap, force graph, heatmap, timeline)" },
      { key: "showSymbols", label: "Symbol index" },
      { key: "showAIExplanations", label: "Show AI explanation slot (you'll fill these in manually for now)" },
    ],
  },
  {
    title: "Density",
    type: "density",
  },
];

const THEMES = [
  { id: "midnight", label: "Midnight", swatch: "linear-gradient(135deg, #0a0e1a, #7c3aed)" },
  { id: "aurora", label: "Aurora", swatch: "linear-gradient(135deg, #0d0a1f, #c084fc)" },
  { id: "solar", label: "Solar", swatch: "linear-gradient(135deg, #18120d, #fb923c)" },
];

export function openSettings({ firstVisit = false } = {}) {
  const { settings, theme } = store.get();
  const root = document.getElementById("modal-root");
  const bd = document.createElement("div");
  bd.className = "modal-backdrop";
  bd.innerHTML = `
    <div class="modal settings-modal" role="dialog" aria-modal="true" aria-label="Wiki configurator">
      ${firstVisit ? `<div class="settings-welcome">Welcome — pick what you want to see.</div>` : ""}
      <header class="settings-head">
        <h2>Configure your wiki</h2>
        <button class="btn btn-icon btn-ghost" id="settings-close" aria-label="Close">✕</button>
      </header>

      ${SECTIONS.map(section => {
        if (section.type === "theme") {
          return `
            <section class="settings-section">
              <h3>${section.title}</h3>
              <div class="theme-grid">
                ${THEMES.map(t => `
                  <button class="theme-card ${theme === t.id ? 'is-active' : ''}" data-theme="${t.id}">
                    <span class="theme-swatch" style="background: ${t.swatch}"></span>
                    <span class="theme-name">${t.label}</span>
                  </button>
                `).join("")}
              </div>
            </section>
          `;
        }
        if (section.type === "density") {
          return `
            <section class="settings-section">
              <h3>${section.title}</h3>
              <div class="density-row">
                <button class="btn ${settings.density === 'comfortable' ? 'btn-primary' : ''}" data-density="comfortable">Comfortable</button>
                <button class="btn ${settings.density === 'compact' ? 'btn-primary' : ''}" data-density="compact">Compact</button>
              </div>
            </section>
          `;
        }
        return `
          <section class="settings-section">
            <h3>${section.title}</h3>
            <ul class="toggle-list">
              ${section.items.map(it => `
                <li class="toggle-row">
                  <label class="toggle">
                    <input type="checkbox" data-key="${it.key}" ${settings[it.key] ? "checked" : ""} />
                    <span class="toggle-track"></span>
                    <span class="toggle-label">${it.label}</span>
                  </label>
                </li>
              `).join("")}
            </ul>
          </section>
        `;
      }).join("")}

      <footer class="settings-foot">
        <button class="btn btn-primary" id="settings-apply">Save & apply</button>
      </footer>
    </div>
  `;
  bd.addEventListener("click", e => { if (e.target === bd) close(); });
  bd.querySelector("#settings-close").addEventListener("click", close);
  bd.querySelectorAll(".theme-card").forEach(el => {
    el.addEventListener("click", () => {
      store.set({ theme: el.dataset.theme });
      bd.querySelectorAll(".theme-card").forEach(c => c.classList.toggle("is-active", c === el));
    });
  });
  bd.querySelectorAll("[data-density]").forEach(el => {
    el.addEventListener("click", () => {
      store.setSettings({ density: el.dataset.density });
      bd.querySelectorAll("[data-density]").forEach(b => b.classList.toggle("btn-primary", b === el));
    });
  });
  bd.querySelectorAll("input[type=checkbox][data-key]").forEach(el => {
    el.addEventListener("change", () => store.setSettings({ [el.dataset.key]: el.checked }));
  });
  bd.querySelector("#settings-apply").addEventListener("click", () => {
    store.markVisited();
    close();
  });
  root.appendChild(bd);
  function close() { bd.remove(); }
}
```

CSS:
```css
.settings-modal { width: min(640px, calc(100vw - var(--sp-6))); }
.settings-welcome { background: var(--accent-translucent); color: var(--accent-soft); padding: var(--sp-3) var(--sp-4); border-radius: var(--r-md); margin-bottom: var(--sp-4); border: 1px solid var(--accent); }
.settings-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-5); }
.settings-section { margin-bottom: var(--sp-5); }
.settings-section h3 { font-size: var(--fs-14); text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-faint); margin-bottom: var(--sp-3); }
.theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-3); }
.theme-card { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); padding: var(--sp-3); border-radius: var(--r-md); background: var(--bg-overlay); border: 1px solid var(--border); cursor: pointer; transition: all var(--t-base); }
.theme-card:hover { transform: translateY(-2px); border-color: var(--accent); }
.theme-card.is-active { border-color: var(--accent); box-shadow: var(--sh-glow); }
.theme-swatch { width: 80px; height: 56px; border-radius: var(--r-sm); }
.density-row { display: flex; gap: var(--sp-2); }
.toggle-list { list-style: none; display: flex; flex-direction: column; gap: var(--sp-2); }
.toggle { display: flex; align-items: center; gap: var(--sp-3); cursor: pointer; padding: var(--sp-2); border-radius: var(--r-sm); transition: background var(--t-fast); }
.toggle:hover { background: var(--bg-overlay); }
.toggle input { display: none; }
.toggle-track { width: 36px; height: 20px; border-radius: var(--r-full); background: var(--border); position: relative; transition: background var(--t-base); flex-shrink: 0; }
.toggle-track::before { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: var(--r-full); background: var(--text); transition: transform var(--t-base) var(--easing-spring); }
.toggle input:checked + .toggle-track { background: var(--accent); }
.toggle input:checked + .toggle-track::before { transform: translateX(16px); }
.toggle-label { font-size: var(--fs-14); color: var(--text); }
.settings-foot { display: flex; justify-content: flex-end; padding-top: var(--sp-4); border-top: 1px solid var(--border); margin-top: var(--sp-5); }
```

- [ ] **Step 2: Verify** — first visit auto-opens, theme switches live, toggles persist across reload, page list re-renders when toggles change.
- [ ] **Step 3: Commit**

```bash
git add project-wiki/assets/wiki-template/js/settings.js project-wiki/assets/wiki-template/css/components.css
git commit -m "feat(project-wiki): settings modal — the in-wiki configurator"
```

---

## Task 34: Prism-lite syntax highlighting

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/prism.js`
- Modify: `project-wiki/assets/wiki-template/css/prism.css`

- [ ] **Step 1: Tokenizer for 6 languages**

Implement a small tokenizer (~200 LOC) using nested regex that yields tokens with classes like `tk-keyword`, `tk-string`, `tk-comment`, `tk-number`, `tk-function`, `tk-punctuation`, `tk-operator`. Languages: python, javascript, typescript, rust, go, markdown.

```javascript
// prism.js — minimal multi-language highlighter (~200 LOC)
const PATTERNS = {
  python: [
    [/(#[^\n]*)/g, "comment"],
    [/(""".*?"""|'''.*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/gs, "string"],
    [/\b(def|class|if|elif|else|for|while|return|import|from|as|with|try|except|finally|raise|yield|lambda|async|await|pass|break|continue|in|not|and|or|is|None|True|False|self)\b/g, "keyword"],
    [/\b\d+(\.\d+)?\b/g, "number"],
    [/\b([A-Za-z_]\w*)\s*(?=\()/g, "function"],
  ],
  javascript: [
    [/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, "comment"],
    [/(`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, "string"],
    [/\b(const|let|var|function|class|extends|return|if|else|for|while|do|switch|case|break|continue|new|this|import|export|from|as|async|await|try|catch|finally|throw|typeof|instanceof|in|of|null|undefined|true|false)\b/g, "keyword"],
    [/\b\d+(\.\d+)?\b/g, "number"],
    [/\b([A-Za-z_$][\w$]*)\s*(?=\()/g, "function"],
  ],
  rust: [
    [/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, "comment"],
    [/("(?:[^"\\]|\\.)*")/g, "string"],
    [/\b(fn|let|mut|const|pub|use|mod|struct|enum|impl|trait|for|while|loop|if|else|match|return|self|Self|where|as|crate|super|true|false|move|async|await|ref|in)\b/g, "keyword"],
    [/\b\d+(\.\d+)?\b/g, "number"],
    [/\b([a-z_][a-z0-9_]*)\s*(?=\()/g, "function"],
  ],
  // ... typescript reuses javascript + adds: type, interface, implements, keyof, readonly, etc.
  // ... go and markdown follow same pattern
};

export function highlight(code, language) {
  const lang = (language || "").toLowerCase();
  const pats = PATTERNS[lang];
  if (!pats) return escapeHtml(code);
  // Tokenize: walk code, replacing matches with placeholders, then escape and re-inject
  const tokens = [];
  let working = code;
  pats.forEach(([re, cls]) => {
    working = working.replace(re, m => {
      const idx = tokens.push({ cls, text: m }) - 1;
      return `\u0000T${idx}\u0000`;
    });
  });
  let escaped = escapeHtml(working);
  escaped = escaped.replace(/\u0000T(\d+)\u0000/g, (_, i) => {
    const t = tokens[+i];
    return `<span class="tk-${t.cls}">${escapeHtml(t.text)}</span>`;
  });
  return escaped;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
}
```

- [ ] **Step 2: `css/prism.css`**

```css
.tk-comment { color: var(--text-faint); font-style: italic; }
.tk-string  { color: #a5d6a7; }
.tk-keyword { color: #c792ea; font-weight: 500; }
.tk-number  { color: #ffcb6b; }
.tk-function{ color: #82aaff; }
[data-theme="aurora"] .tk-string { color: #b4f8c8; }
[data-theme="aurora"] .tk-keyword { color: #d8b4fe; }
[data-theme="solar"]  .tk-string { color: #fde68a; }
[data-theme="solar"]  .tk-keyword { color: #fb923c; }
```

- [ ] **Step 3: Verify + commit**

```bash
git add project-wiki/assets/wiki-template/js/prism.js project-wiki/assets/wiki-template/css/prism.css
git commit -m "feat(project-wiki): prism-lite syntax highlighter (6 languages)"
```

---

═══════════════════════════════════════════════════════════════════════════
## ▸▸▸ STOP-POINT after Task 34 — Phase B complete ◂◂◂
═══════════════════════════════════════════════════════════════════════════

*State: full wiki — 6 pages, 8 charts, 3 themes, search, settings modal, syntax highlighting. Visually finished. The remaining tasks are docs, packaging, and the a11y/responsive pass — they're high-leverage but lower context cost. A fresh session for Phase C is cheap.*

═══════════════════════════════════════════════════════════════════════════
## ▸▸▸ PHASE C — SHIP (Tasks 35 → 43) ◂◂◂
═══════════════════════════════════════════════════════════════════════════

*Goal: turn the gorgeous-but-undocumented wiki into a marketplace-ready skill package. Icon sprite, a11y pass, verify script, full SKILL.md, references, README, sample example, evals, final quality gate.*

---

## Task 35: Icon sprite (inlined at build time)

**Why this approach:** `fetch('./icons/lucide.svg')` is unreliable on `file://` — Firefox blocks it, Chromium allows it only with `--allow-file-access-from-files`, Safari is inconsistent. We sidestep the whole problem by **inlining the sprite into `index.html` at generation time**, exactly the same trick we use for `data.json`. Zero fetch, zero CORS, works everywhere.

**Files:**
- Create: `project-wiki/assets/wiki-template/icons/lucide.svg` (the sprite source)
- Modify: `project-wiki/assets/wiki-template/index.html` (add `__ICON_SPRITE_PLACEHOLDER__`)
- Modify: `project-wiki/scripts/render.py` (replace placeholder with sprite contents)
- Create: `project-wiki/assets/wiki-template/js/icons.js` (just the lookup helper, no fetch)

- [ ] **Step 1: Author `icons/lucide.svg`** with 18 Lucide icons as `<symbol>` elements

Pull from https://lucide.dev/icons/ — copy the SVG path data, wrap each in `<symbol id="i-NAME" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">…</symbol>`. Required icons: `home, folder-tree, file-code, boxes, package, git-commit, settings, search, menu, book, x, chevron-down, chevron-right, github, copy, check, alert-triangle, info`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" id="lucide-sprite" style="display:none;" aria-hidden="true">
  <symbol id="i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </symbol>
  <!-- ... 17 more symbols ... -->
</svg>
```

- [ ] **Step 2: Add the placeholder to `index.html`**

In `assets/wiki-template/index.html`, **immediately after** `<body>`, add:

```html
<body>
  __ICON_SPRITE_PLACEHOLDER__
  <div id="app" class="app-shell">
  ...
```

- [ ] **Step 3: Update `scripts/render.py` to inject the sprite**

```python
ICON_PLACEHOLDER = "__ICON_SPRITE_PLACEHOLDER__"

def render(repo_data: dict, template_dir: Path, output_dir: Path) -> Path:
    # ... existing copytree + data.json injection ...

    sprite_path = output_dir / "icons" / "lucide.svg"
    sprite_svg = sprite_path.read_text(encoding="utf-8") if sprite_path.exists() else ""
    html = index.read_text(encoding="utf-8")
    if ICON_PLACEHOLDER in html:
        html = html.replace(ICON_PLACEHOLDER, sprite_svg)
        index.write_text(html, encoding="utf-8")

    return index
```

If the placeholder isn't there (older template), this is a no-op — failure-tolerant.

- [ ] **Step 4: `js/icons.js`** — pure lookup helper, no fetch

```javascript
// icons.js — the sprite is already in the DOM (inlined at build time by render.py).
// We just emit <use> references.
export function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
}
```

- [ ] **Step 5: Verify in Firefox + Chromium**

```bash
python project-wiki/scripts/generate.py --repo . --output /tmp/wiki-test --open
```

Open `/tmp/wiki-test/index.html` in Firefox, then Chromium. Sidebar brand icon, nav icons, and topbar icons must all render. View page source — the sprite `<svg id="lucide-sprite">` should be visible at the top of the body.

- [ ] **Step 6: Commit**

```bash
git add project-wiki/assets/wiki-template/icons/ project-wiki/assets/wiki-template/js/icons.js project-wiki/assets/wiki-template/index.html project-wiki/scripts/render.py
git commit -m "feat(project-wiki): inline lucide icon sprite at build time"
```

---

## Task 35.5: Single-file bundle mode (the capstone)

**Why this exists:** Folder mode (~30 files) is fine for development but kills the "rent överjävligt smidigt" promise. The whole point of this skill is "double-click an HTML file and you have a wiki". By Task 35 every dynamic resource (data, sprite) is already inlined — this task ties the rest (CSS, JS, fonts) into the same trick. Result: **one ~600 KB `<repo-name>.html` you can email, USB-stick, or drop in Dropbox**.

**Mode selection:** From this task onward, single-file is the **default**. Folder mode becomes opt-in via `--mode folder` (kept for hosting, debugging, or linking from a docs site).

**Files:**
- Modify: `project-wiki/scripts/render.py` (add `bundle_single_file()`)
- Modify: `project-wiki/scripts/generate.py` (add `--mode` flag, default `single`)
- Modify: every JS file in `assets/wiki-template/js/` (light cleanup so the bundler can handle them)

### What gets inlined and how

| Resource | Strategy |
|---------|----------|
| `data.json` | Already inlined in Task 10 (`<script id="wiki-data" type="application/json">…</script>`) |
| Icon sprite | Already inlined in Task 35 (`__ICON_SPRITE_PLACEHOLDER__`) |
| All CSS files | Read each linked stylesheet, replace `<link>` tags with one big `<style>` block in `<head>` |
| All JS modules | Topo-sort by import graph, strip imports/exports, concatenate into one `<script>` tag |
| Fonts (woff2) | Base64-encode, embed via `data:font/woff2;base64,…` in an `@font-face src` rule |

### Constraints the JS source must obey (so bundling stays simple)

The bundler is intentionally a 60-line Python script, not a real bundler. To make this work, the JS source written in earlier tasks must follow these rules — most of which it already does after the polish pass:

1. **One statement per import line.** No multi-line imports.
2. **Only relative imports.** `import x from "./y.js"` — never npm package names.
3. **Imports at the top of the file only.** No conditional imports, no dynamic `await import(…)`.
4. **No `import *` or `import x from` (default imports).** Only `import { a, b } from "./y.js"`.
5. **Exports use `export function`, `export const`, or `export class`.** No `export default`, no `export { … }` aggregator at the bottom.

> **One small refactor required:** Task 17's `router.js` uses `await import("./pages/overview.js")` for lazy loading. Lazy loading is meaningless in a single-file bundle. Convert these to static imports + a registry. The router.js change is shown below in Step 3.

- [ ] **Step 1: Add `bundle_single_file()` to `scripts/render.py`**

```python
import base64
import re
from pathlib import Path

def bundle_single_file(template_dir: Path, repo_data: dict, output_path: Path) -> Path:
    """Build everything into a single self-contained HTML file at output_path."""
    index_src = (template_dir / "index.html").read_text(encoding="utf-8")
    html = index_src

    # 1. Inline data
    json_payload = json.dumps(repo_data, ensure_ascii=False).replace("</", "<\\/")
    html = html.replace(PLACEHOLDER, json_payload)

    # 2. Inline icon sprite
    sprite = (template_dir / "icons" / "lucide.svg").read_text(encoding="utf-8")
    html = html.replace(ICON_PLACEHOLDER, sprite)

    # 3. Inline CSS — find every <link rel="stylesheet" href="..."> and replace with <style>
    def css_repl(match):
        href = match.group(1)
        css_path = template_dir / href
        if not css_path.exists():
            return match.group(0)
        css = css_path.read_text(encoding="utf-8")
        # Inline any url(font.woff2) references as base64
        css = inline_fonts_in_css(css, css_path.parent)
        return f'<style data-source="{href}">\n{css}\n</style>'
    html = re.sub(r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*/?>', css_repl, html)

    # 4. Bundle JS — find <script type="module" src="..."> and replace with concat'd <script>
    def js_repl(match):
        src = match.group(1)
        entry_path = template_dir / src
        bundled = bundle_js(entry_path, template_dir)
        return f'<script>\n{bundled}\n</script>'
    html = re.sub(r'<script\s+type="module"\s+src="([^"]+)"\s*></script>', js_repl, html)

    # 5. Strip the now-orphaned <link> tags for fonts (we inlined them via CSS)
    # (already handled in inline_fonts_in_css)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding="utf-8")
    return output_path


def inline_fonts_in_css(css: str, base_dir: Path) -> str:
    """Replace url(./fonts/*.woff2) with data:font/woff2;base64,..."""
    def font_repl(m):
        url = m.group(1).strip("\"'")
        font_path = (base_dir / url).resolve()
        if not font_path.exists() or font_path.suffix != ".woff2":
            return m.group(0)
        b64 = base64.b64encode(font_path.read_bytes()).decode("ascii")
        return f"url('data:font/woff2;base64,{b64}')"
    return re.sub(r'url\(([^)]+)\)', font_repl, css)


def bundle_js(entry: Path, root: Path) -> str:
    """Topo-sort modules by import graph, strip imports/exports, concatenate."""
    visited = []
    seen = set()

    IMPORT_RE = re.compile(r'^import\s+\{([^}]+)\}\s+from\s+["\']([^"\']+)["\'];?\s*$', re.MULTILINE)
    EXPORT_RE = re.compile(r'^export\s+(function|const|class|let|var|async\s+function)\b', re.MULTILINE)

    def visit(path: Path):
        if path in seen:
            return
        seen.add(path)
        text = path.read_text(encoding="utf-8")
        # Recurse into imports first (depth-first → dependencies appear before dependents)
        for m in IMPORT_RE.finditer(text):
            rel = m.group(2)
            child = (path.parent / rel).resolve()
            if child.exists():
                visit(child)
        visited.append(path)

    visit(entry.resolve())

    parts = []
    for path in visited:
        text = path.read_text(encoding="utf-8")
        # Strip imports
        text = IMPORT_RE.sub("", text)
        # Strip the `export` keyword (the bindings stay; they just become module-scope)
        text = EXPORT_RE.sub(r"\1", text)
        parts.append(f"// === {path.relative_to(root).as_posix()} ===\n{text}")

    # Wrap everything in an IIFE so module-scope bindings don't pollute window
    return "(() => {\n" + "\n\n".join(parts) + "\n})();"
```

- [ ] **Step 2: Add `--mode` flag to `generate.py`**

```python
p.add_argument(
    "--mode",
    choices=["single", "folder"],
    default="single",
    help="single = one self-contained .html file (default). folder = multi-file directory.",
)
# ...
if args.mode == "single":
    out_html = args.output if args.output.suffix == ".html" else args.output / f"{repo.name}.html"
    bundle_single_file(template_dir, data, out_html)
    print(f"[project-wiki] wrote single-file wiki to {out_html} ({out_html.stat().st_size // 1024} KB)")
    if args.open:
        import webbrowser; webbrowser.open(out_html.as_uri())
else:
    index_path = render(data, template_dir, args.output)  # the existing folder-mode renderer
    print(f"[project-wiki] wrote folder-mode wiki to {args.output}")
    if args.open:
        import webbrowser; webbrowser.open(index_path.as_uri())
```

- [ ] **Step 3: Refactor `router.js` to static imports + registry**

Replace Task 17's dynamic-import router with this:

```javascript
// router.js
import * as store from "./store.js";
import { render as renderOverview } from "./pages/overview.js";
import { render as renderStructure } from "./pages/structure.js";
import { render as renderFiles } from "./pages/files.js";
import { render as renderModules } from "./pages/modules.js";
import { render as renderDeps } from "./pages/deps.js";
import { render as renderActivity } from "./pages/activity.js";
import { render as renderSearchResults } from "./pages/search-results.js";

const PAGES = {
  overview: renderOverview,
  structure: renderStructure,
  files: renderFiles,
  modules: renderModules,
  deps: renderDeps,
  activity: renderActivity,
  search: renderSearchResults,
};

let currentPage = null;

export function renderPage(page) {
  currentPage = page;
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.scrollTo?.({ top: 0 });
  const fn = PAGES[page] || PAGES.overview;
  try {
    fn(main, store.get());
    main.querySelectorAll(".card, .stat, .chart-container").forEach((el, i) => {
      el.style.animation = `fadeUp 350ms ${i * 30}ms cubic-bezier(0.2,0.8,0.2,1) both`;
    });
  } catch (err) {
    main.innerHTML = `<div class="card"><h2>Page failed to render</h2><pre style="margin-top: 12px; color: var(--text-muted);">${String(err)}</pre></div>`;
    console.error(err);
  }
}
```

This means router.js now imports all 7 page modules statically. The bundler will pull them in via the topo sort. Slightly more upfront work at boot (7 modules parsed instead of 1), but the file is local — it's microseconds.

- [ ] **Step 4: Update `settings.js` and `nav.js` to also use static imports**

Both currently call `import("./settings.js").then(…)` for lazy modal loading. Replace with direct imports at the top of the file. Same as the router refactor.

- [ ] **Step 5: Smoke test both modes**

```bash
# Single-file (default)
python project-wiki/scripts/generate.py --repo . --output /tmp/test.html --open
# Should produce /tmp/test.html, ~500-800 KB, opens cleanly with no console errors

# Folder mode
python project-wiki/scripts/generate.py --repo . --output /tmp/test-folder --mode folder --open
# Should produce /tmp/test-folder/ with all the original files
```

Verify in the single-file output:
- Single `<style>` block contains all CSS
- Single `<script>` block contains the IIFE-wrapped bundle
- `@font-face` rules contain `data:font/woff2;base64,…`
- `<svg id="lucide-sprite">` is inlined
- `<script id="wiki-data" type="application/json">` is inlined
- No `<link>` or `<script src>` references remain

- [ ] **Step 6: Commit**

```bash
git add project-wiki/scripts/render.py project-wiki/scripts/generate.py project-wiki/assets/wiki-template/js/router.js project-wiki/assets/wiki-template/js/nav.js project-wiki/assets/wiki-template/js/settings.js
git commit -m "feat(project-wiki): single-file bundle mode (default)"
```

---

## Task 36: Mobile responsive + a11y pass

- [ ] **Step 1: Responsive audit**

Test at 375px, 768px, 1024px, 1440px, 1920px in browser devtools. Fix:
- No horizontal scroll
- Sidebar collapses on <1024px (already in `layout.css`)
- Touch targets ≥44px (audit buttons, nav items, file rows)
- Hero font scales via `clamp()`
- Card grids reflow

- [ ] **Step 2: A11y audit** (run through ui-ux-pro-max Quick Reference §1)

- All icon-only buttons have `aria-label`
- All charts have `role="img"` and `aria-label`
- Focus rings visible (already in reset.css)
- Tab order matches visual order
- `prefers-reduced-motion` respected (already in reset.css and force graph)
- Color contrast 4.5:1 for body text (audit `--text-muted` against `--bg-elevated`)
- Skip-link added to topbar: `<a href="#main" class="skip-link">Skip to content</a>`

- [ ] **Step 3: Commit**

```bash
git add project-wiki/assets/wiki-template/
git commit -m "feat(project-wiki): mobile responsive + a11y pass"
```

---

## Task 37: Verify script

**Files:**
- Create: `project-wiki/scripts/verify.py`

- [ ] **Step 1**

```python
#!/usr/bin/env python3
"""Sanity-check a generated wiki — used by CI / smoke tests."""
import json
import sys
from pathlib import Path

REQUIRED_FILES = [
    "index.html", "data.json",
    "css/tokens.css", "css/base.css", "css/layout.css", "css/components.css",
    "js/app.js", "js/store.js", "js/charts/donut.js",
]

def verify(output_dir: Path) -> int:
    errors = []
    if not output_dir.is_dir():
        print(f"FAIL: not a directory: {output_dir}")
        return 2
    for rel in REQUIRED_FILES:
        p = output_dir / rel
        if not p.exists():
            errors.append(f"missing: {rel}")
    # Check data.json parses
    try:
        data = json.loads((output_dir / "data.json").read_text(encoding="utf-8"))
        for key in ("meta", "stats", "languages", "structure"):
            if key not in data:
                errors.append(f"data.json missing key: {key}")
    except Exception as e:
        errors.append(f"data.json failed to parse: {e}")
    # Check placeholder was replaced
    html = (output_dir / "index.html").read_text(encoding="utf-8")
    if "__WIKI_DATA_PLACEHOLDER__" in html:
        errors.append("index.html still contains the data placeholder")
    if errors:
        print("FAILED:")
        for e in errors: print(f"  - {e}")
        return 1
    print(f"OK: {output_dir} — {len(REQUIRED_FILES)} files present, data parses, placeholder replaced")
    return 0

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: verify.py <output_dir>")
        sys.exit(2)
    sys.exit(verify(Path(sys.argv[1])))
```

- [ ] **Step 2: Run it**

```bash
python project-wiki/scripts/verify.py /tmp/wiki-test
```

Expected: `OK: /tmp/wiki-test — 9 files present, data parses, placeholder replaced`

- [ ] **Step 3: Commit**

```bash
git add project-wiki/scripts/verify.py
git commit -m "feat(project-wiki): verify script for generated output"
```

---

## Task 38: Write SKILL.md (the operations manual)

**Files:**
- Modify: `project-wiki/SKILL.md`

- [ ] **Step 1: Replace stub with full SKILL.md** following skill-forge Production-shape rules

```markdown
---
name: project-wiki
description: Generate a beautiful, fully-static HTML/CSS/JS wiki site that documents any project repository — with interactive charts, dependency graphs, file explorer, git activity heatmap, and an in-page configurator for choosing extras. Use whenever the user asks to "document this repo", "make a wiki", "build a project site", "generate documentation for this codebase", "explain this codebase visually", "create a shareable codebase walkthrough", or wants any visual documentation of a project. Output is zero-install — opens via file:// in any modern browser, no server, no build step, no `npm install`.
author: Robin Westerlund
version: 1.0.0
---

# Project Wiki

## Purpose

Turn any project repository into a polished, self-contained HTML wiki site in one command. The output is a directory of HTML/CSS/JS that runs entirely from `file://` — no server, no build step, no dependencies. Inside the wiki, a settings modal lets the reader toggle extras (charts, file viewer, dependency graph, git activity, AI explanations) and switch between three themes. Settings persist across visits via `localStorage`.

## When to use this skill

| The user says… | Use this skill |
|----------------|----------------|
| "document this repo" | yes |
| "make a wiki for this codebase" | yes |
| "build a project site / landing page for this code" | yes |
| "explain this codebase visually" | yes |
| "give me a shareable walkthrough of this project" | yes |
| "generate docs for this monorepo" | yes — handles per-package manifests automatically |
| "I need a README" | no — use a writing skill |
| "rewrite this function" | no |

## How it works (one paragraph)

A pure-stdlib Python generator (`scripts/generate.py`) walks the target repo, runs ten modular analyzers, and emits a single `data.json` payload describing the codebase. The renderer then bundles the hand-crafted HTML/CSS/JS shell — inlining all CSS into `<style>` blocks, concatenating all JS modules into one IIFE-wrapped `<script>`, base64-embedding fonts, inlining the icon sprite, and inlining `data.json` itself — into **a single `~600 KB <repo-name>.html` file you double-click**. No server, no build step, no `npm install`. Opening it bootstraps a vanilla-JS app that renders an overview, structure (sunburst + treemap), file explorer with syntax highlighting, dependency graph (force-directed), git activity (heatmap + timeline), and a Cmd+K search palette. The settings modal — the "small UI" the reader uses to choose extras — lives inside the wiki itself; first visit auto-opens it.

## Quick start

```bash
# Default: produce one self-contained HTML file
python scripts/generate.py --repo /path/to/repo --output /tmp/my-wiki.html --open

# Folder mode (for hosting on a web server, debugging, or linking from a docs site)
python scripts/generate.py --repo /path/to/repo --output /tmp/my-wiki/ --mode folder --open
```

Flags:
- `--repo` (required): path to the project repository
- `--output` (required): where to write the generated wiki — `.html` file path for single mode, directory path for folder mode
- `--mode {single,folder}`: output mode. **Default: `single`.** Single mode produces one self-contained HTML file (~500-800 KB). Folder mode produces a directory with separate CSS/JS/icons (faster iteration during dev, hostable on a static site).
- `--open`: open the result in the default browser when done

There's also an `init` subcommand for the optional sidecar pattern (see **Sidecar enrichments** below):

```bash
python scripts/generate.py init /path/to/repo
# creates /path/to/repo.wiki/ for hand-written annotations + cached AI summaries
```

## What gets analyzed

| Analyzer | Output |
|---------|--------|
| `repo_stats` | file count, total bytes, total LOC, top 25 files by LOC |
| `languages` | language detection by extension, files + bytes + LOC per language, brand colors |
| `structure` | nested directory tree, capped at 8 levels deep |
| `dependencies` | parses package.json, Cargo.toml, pyproject.toml, requirements.txt, go.mod (Gemfile/pom.xml/composer.json detected as stubs) |
| `git_log` | last 200 commits via `git log` shell-out, gracefully empty if no git |
| `readme` | finds README.md, extracts title and headings, returns raw markdown |
| `changelog` | finds CHANGELOG.md / CHANGES.md / HISTORY.md |
| `symbols` | regex extraction of functions/classes/structs/traits for Python, JS/TS, Rust, Go |
| `file_index` | flat list of every text file with inline preview (≤200 KB / 600 lines) for the file viewer |
| `sidecar` | discovers `<repo>.wiki/` if present and merges its config + annotations + AI cache + theme override (non-fatal if missing) |

**The source repo is read-only — the generator never writes anything inside `--repo`.** All output goes to `--output`. The optional sidecar at `<repo>.wiki/` is the only place enrichments accumulate, and that's a sibling directory, not inside the repo.

## What the wiki contains

| Page | What's on it |
|------|-------------|
| Overview | Hero, stat tiles, language donut, README rendered |
| Structure | Sunburst + treemap of folder tree |
| Files | Filter + viewer with syntax highlighting |
| Modules | Top-level directories as cards with file counts and LOC |
| Dependencies | Per-manifest tables + force-directed graph |
| Activity | Stats, GitHub-style heatmap, commit timeline, top authors |

## The "small UI" (configurator)

The settings modal (gear icon top-right, or `⌘K` then click settings, or auto-opens on first visit) lets the reader pick:

- **Theme:** Midnight (default), Aurora, Solar
- **Pages:** Toggle Structure, Files, Modules, Dependencies, Activity
- **Extras:** Stat tiles, language donut, all charts, symbol index, AI-explanation slot
- **Density:** Comfortable, Compact

All choices persist in `localStorage` under `project-wiki:settings:v1`.

## Adding a custom analyzer

See `references/analyzer-anatomy.md`. The pattern: drop a `scripts/analyzers/<name>.py` exporting `run(repo_root: Path) -> dict`, import it in `generate.py`, and add a corresponding page in `assets/wiki-template/js/pages/`.

## Adding a custom theme

See `references/theme-system.md`. Three things: a CSS file in `assets/wiki-template/css/themes/<name>.css` setting all the design tokens, a `<link>` in `index.html`, and an entry in the `THEMES` array in `js/settings.js`.

## Adding a custom chart

See `references/chart-catalog.md`. Each chart is a single JS file exporting a `draw<Name>(container, data, opts)` function. Use the donut chart (`js/charts/donut.js`) as a reference template.

## Sidecar enrichments — `<repo>.wiki/`

The skill supports an optional companion-directory pattern for repos you want to enrich over time without polluting the source. Run `python scripts/generate.py init <repo>` to bootstrap a `<repo>.wiki/` sidecar containing:

| File | What it's for |
|------|--------------|
| `wiki.toml` | Per-project config: theme, enabled pages, branding, reading order |
| `annotations/overview.md` | Custom overview that replaces or extends the auto-rendered README |
| `annotations/modules/<name>.md` | Hand-written explanation of a module, shown on the Modules page |
| `annotations/files/<path>.md` | Per-file note shown above the source in the file viewer |
| `theme.css` | Project-specific CSS variable overrides applied after the chosen theme |
| `cache/ai-explanations.json` | Cache of LLM-generated module summaries (so you don't pay per regenerate) |

The generator picks up the sidecar automatically if it exists at `<repo-parent>/<repo-name>.wiki/`. Source repo stays untouched. If no sidecar exists, the wiki still works — it just has no enrichments. Full reference: `references/sidecar-format.md`.

**Trigger phrases that should reach for sidecar features:** "init a wiki sidecar", "annotate this repo's wiki", "add a custom explanation for the auth module", "remember my notes between regenerates", "set up persistent wiki content for this repo".

## Anti-patterns

| Don't | Do | Why |
|-------|-----|-----|
| Add framework dependencies (React, Vue, Tailwind) | Stick to vanilla HTML/CSS/JS | "Open the file and it works" is the whole point — a build step kills it |
| Use `fetch('./data.json')` to load data | Inline via `<script id="wiki-data" type="application/json">` | `file://` blocks JSON `fetch` due to CORS — inlining is the only way |
| Hardcode colors in components | Use `var(--accent)` etc. from `tokens.css` | Themes work by overriding tokens; hardcoded colors break theme switching |
| Add server-rendered pages | Everything renders client-side from `data.json` | The whole site must be portable — copy folder, double-click, done |
| Make the configurator a separate launch screen with a Python server | Settings live in the wiki itself as a modal | A server kills the no-install promise; modal is intrinsically smoother |
| Store analyzer results in many `*.json` files | One `data.json`, inlined | Browsers can't fetch sibling files reliably from `file://` |
| Run heavy work on every page render | Build once, render from cached state | Re-running analyzers per click would be a UX disaster |
| Default to folder mode | Default to single-file mode | "Double-click the .html file" is the smoothest possible experience — folder mode is for hosting |
| Write enrichments back to the source repo | Use the `<repo>.wiki/` sidecar | The repo is read-only by contract; enrichments go in the sidecar so they survive regeneration without polluting source |

## Verification

After generating, run:

```bash
python scripts/verify.py <output-dir>
```

This checks all required files exist, `data.json` parses, and the placeholder was substituted.

## Related

- **skill-forge** — packaged this skill (Production shape)
- **skill-creator** — use to add evals and iterate
- **knowledge/skills/skill_streaming_renderer.md** — referenced for understanding markdown rendering trade-offs
- **ui-ux-pro-max** — design tokens are aligned with its glassmorphism + dark mode + dev-tool recommendations
```

- [ ] **Step 2: Commit**

```bash
git add project-wiki/SKILL.md
git commit -m "docs(project-wiki): write full SKILL.md operations manual"
```

---

## Task 39: Reference docs

**Files:**
- Create: `project-wiki/references/architecture.md`
- Create: `project-wiki/references/theme-system.md`
- Create: `project-wiki/references/chart-catalog.md`
- Create: `project-wiki/references/analyzer-anatomy.md`
- Create: `project-wiki/references/data-schema.md`

For each, write 60–150 lines following skill-forge reference rules: "When to read this:" header, then concrete content. Don't repeat SKILL.md.

- `architecture.md` — diagram of the analyze → render → boot pipeline, file responsibilities, why inlined data, why no framework
- `theme-system.md` — full token list with semantic meaning, how to add a theme, how to test contrast
- `chart-catalog.md` — table: chart | use case | data shape | accessibility notes | example call
- `analyzer-anatomy.md` — interface contract, naming convention, where to plug in, how to test a single analyzer in isolation
- `data-schema.md` — typed-ish JSON-schema-like spec of every key in `data.json` with field descriptions

Commit each:
```bash
git add project-wiki/references/
git commit -m "docs(project-wiki): reference documentation set"
```

---

## Task 40: README.md + metadata.json (final)

**Files:**
- Modify: `project-wiki/README.md`
- Modify: `project-wiki/metadata.json`

- [ ] **Step 1: README.md** following skill-forge Standard shape

Sections:
1. Title + one-liner
2. What it does
3. Supported clients
4. Prerequisites (Python 3.9+, modern browser)
5. Installation (clone or copy `project-wiki/` into your kit)
6. Quick start (the one-line command)
7. Trigger conditions (what to ask the agent)
8. Expected outcome
9. Files table
10. Troubleshooting (browser doesn't open file://, icons missing, no git history → fix)

- [ ] **Step 2: Update metadata.json** to v1.0.0, add tags, finalize

- [ ] **Step 3: Commit**

```bash
git add project-wiki/README.md project-wiki/metadata.json
git commit -m "docs(project-wiki): README + finalized metadata"
```

---

## Task 41: Generate sample example

**Files:**
- Create: `project-wiki/examples/sample-wiki/` (entire generated site)

- [ ] **Step 1: Run on portable-kit itself**

```bash
python project-wiki/scripts/generate.py --repo . --output project-wiki/examples/sample-wiki
python project-wiki/scripts/verify.py project-wiki/examples/sample-wiki
```

- [ ] **Step 2: Open it and verify visually**

Click through every page. Check:
- Overview hero looks gorgeous
- Donut renders + tooltip works
- Sunburst renders
- Force graph animates and stops
- File viewer shows highlighted code
- Heatmap shows the kit's git history
- Settings modal works, theme switching is instant
- Cmd+K palette opens and finds files

- [ ] **Step 3: Commit**

```bash
git add project-wiki/examples/sample-wiki/
git commit -m "docs(project-wiki): bundled sample wiki generated from portable-kit"
```

---

## Task 42: Evals

**Files:**
- Create: `project-wiki/evals/evals.json`

- [ ] **Step 1**

```json
{
  "skill_name": "project-wiki",
  "evals": [
    {
      "id": 1,
      "name": "python-project",
      "prompt": "Generate a project wiki for the mempalace package at portable-kit/mempalace. Use the default Midnight theme and include all extras except AI explanations. Save the output to /tmp/wiki-mempalace and open it.",
      "expected_output": "Self-contained wiki at /tmp/wiki-mempalace with index.html, data.json, css/, js/. Verify script passes. Overview hero shows 'mempalace'. Languages includes Python. README is rendered.",
      "files": []
    },
    {
      "id": 2,
      "name": "rust-monorepo",
      "prompt": "Build a wiki for portable-kit/runtime — it's a Rust workspace with multiple crates. I want to see the dependency graph and git activity. Solar theme.",
      "expected_output": "Wiki with Cargo dependencies parsed from each crate's Cargo.toml. Force graph in Dependencies page shows multiple crates. Git activity heatmap shows recent commits. Solar theme is active.",
      "files": []
    },
    {
      "id": 3,
      "name": "minimal-no-git",
      "prompt": "Make a wiki for /tmp/empty-test (a directory with just a README.md and one Python file, no git history). Should still produce a valid wiki.",
      "expected_output": "Wiki generates without errors. Activity page shows 'no git history' empty state. Overview shows the README. Stats show file_count=2.",
      "files": []
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add project-wiki/evals/
git commit -m "test(project-wiki): eval test cases for skill-creator"
```

---

## Task 43: Final VERIFY pass (skill-forge quality gate)

Run through `knowledge/meta-skills/skill-forge/SKILL.md` Step 5 (VERIFY) checklist:

**Must-pass (structural):**
- [ ] SKILL.md frontmatter has name, description, author, version
- [ ] `name` is `project-wiki` (lowercase-kebab-case)
- [ ] description ≥ 50 chars and includes trigger phrases ("use when…", "trigger on…")
- [ ] SKILL.md body < 500 lines (current draft is ~250 — comfortable)
- [ ] Every file referenced from SKILL.md exists (`scripts/generate.py`, `scripts/verify.py`, `references/*.md`, `assets/wiki-template/js/charts/donut.js`)
- [ ] No hardcoded paths or API keys

**Should-pass (content):**
- [ ] First section delivers standalone value ✓
- [ ] Tables used wherever 3+ parallel items share attributes ✓
- [ ] Anti-patterns section present ✓
- [ ] Imperative form throughout ✓
- [ ] README Files table matches actual directory contents
- [ ] metadata.json `name` matches SKILL.md `name`

**Check-if-applicable:**
- [ ] README.md present ✓
- [ ] metadata.json present ✓
- [ ] Tags relevant ✓
- [ ] Worked example present (`examples/sample-wiki/`) ✓

If anything fails: fix inline, re-run verify.py, re-commit.

- [ ] **Final commit**

```bash
git add project-wiki/
git commit -m "chore(project-wiki): VERIFY pass complete — v1.0.0 ready"
```

═══════════════════════════════════════════════════════════════════════════
## ▸▸▸ STOP-POINT after Task 43 — Phase C complete ◂◂◂
═══════════════════════════════════════════════════════════════════════════

*State: marketplace-ready skill package, v1.0.0 tagged, sample example bundled, evals in place. The wiki ships as a single `<repo-name>.html` file by default. **At this point you can stop and the project is done.** Phase D is purely optional — it adds a "remembers your enrichments" capability that becomes valuable when you want to use the skill on the same repo repeatedly.*

═══════════════════════════════════════════════════════════════════════════
## ▸▸▸ PHASE D — SIDECAR (Tasks 44 → 48, OPTIONAL) ◂◂◂
═══════════════════════════════════════════════════════════════════════════

*Goal: introduce a `<repo>.wiki/` companion-directory pattern. The source repo stays untouched (same as today), but wiki-specific enrichments — handwritten module explanations, AI-generated descriptions (cached), reading-order, project-specific theme overrides — get a real home that survives regeneration. Without this, every regenerate erases hand-written content.*

**The pattern:**

```
/path/to/some-repo/        ← orört, source of truth
/path/to/some-repo.wiki/   ← sidecar — created by `init`, owned by the wiki
├── wiki.toml              ← config: theme, enabled extras, reading order, branding
├── annotations/
│   ├── overview.md        ← optional override/extension of the README
│   ├── modules/
│   │   ├── auth.md        ← handwritten explanation of the auth module
│   │   └── runtime.md
│   └── files/
│       └── src/main.rs.md ← per-file note that appears in the file viewer
├── cache/
│   ├── ai-explanations.json   ← cached LLM-generated module summaries
│   └── git-snapshot.json      ← previous git stats (for delta tracking)
└── theme.css              ← project-specific CSS variables that override the chosen theme
```

**Key invariant:** The generator is the only thing that writes to `<repo>.wiki/`, and only via `init` (bootstrapping) and to `cache/` (writing computed cache). All annotation files in `annotations/` are owned by the human — the generator never overwrites them. `wiki.toml` is also human-owned after init.

---

## Task 44: `init` subcommand — bootstrap the sidecar

**Files:**
- Modify: `project-wiki/scripts/generate.py` (add subcommand routing)
- Create: `project-wiki/scripts/init_sidecar.py`
- Create: `project-wiki/assets/sidecar-template/wiki.toml` (the template config)
- Create: `project-wiki/assets/sidecar-template/annotations/.gitkeep`
- Create: `project-wiki/assets/sidecar-template/README.md` (explains the sidecar layout)

- [ ] **Step 1: Convert `generate.py` to a subcommand router**

```python
def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a static wiki for a project repo.")
    subs = parser.add_subparsers(dest="cmd", required=False)

    # Default (backwards compatible) — flat usage: `generate.py --repo X --output Y`
    parser.add_argument("--repo", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--mode", choices=["single", "folder"], default="single")
    parser.add_argument("--open", action="store_true")

    # `init` subcommand — bootstrap a sidecar
    init = subs.add_parser("init", help="Create a <repo>.wiki/ sidecar directory next to a repo")
    init.add_argument("repo", type=Path, help="Path to the project repository")
    init.add_argument("--force", action="store_true", help="Overwrite existing sidecar (skips annotations/)")

    args = parser.parse_args()

    if args.cmd == "init":
        from init_sidecar import bootstrap
        return bootstrap(args.repo, force=args.force)

    # Default: generate
    if not args.repo or not args.output:
        parser.error("--repo and --output are required for generation")
    return _run_generate(args)
```

- [ ] **Step 2: Write `scripts/init_sidecar.py`**

```python
"""Bootstrap a <repo>.wiki/ sidecar directory next to an existing repo."""
from __future__ import annotations
import shutil
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = SCRIPT_DIR.parent / "assets" / "sidecar-template"


def bootstrap(repo: Path, force: bool = False) -> int:
    repo = repo.resolve()
    if not repo.is_dir():
        print(f"error: not a directory: {repo}", file=sys.stderr)
        return 2

    sidecar = repo.parent / f"{repo.name}.wiki"
    if sidecar.exists() and not force:
        print(f"sidecar already exists: {sidecar}")
        print("use --force to refresh wiki.toml and the cache, leaving annotations/ alone")
        return 1

    sidecar.mkdir(parents=True, exist_ok=True)

    # Always-overwritten files: wiki.toml template, README, cache dir
    (sidecar / "wiki.toml").write_text(
        (TEMPLATE_DIR / "wiki.toml").read_text(encoding="utf-8")
        .replace("{{REPO_NAME}}", repo.name),
        encoding="utf-8",
    )
    (sidecar / "README.md").write_text(
        (TEMPLATE_DIR / "README.md").read_text(encoding="utf-8"), encoding="utf-8"
    )
    (sidecar / "cache").mkdir(exist_ok=True)
    (sidecar / "cache" / ".gitkeep").touch()

    # Human-owned: don't overwrite if already there
    annotations = sidecar / "annotations"
    if not annotations.exists():
        annotations.mkdir()
        (annotations / "modules").mkdir()
        (annotations / "files").mkdir()
        (annotations / "overview.md").write_text(
            f"# {repo.name}\n\nWrite a custom overview here. Anything you add replaces the auto-generated hero subtitle.\n",
            encoding="utf-8",
        )

    # Optional theme override — only created if missing
    theme_css = sidecar / "theme.css"
    if not theme_css.exists():
        theme_css.write_text(
            "/* project-specific theme overrides — set CSS variables here to tweak any theme */\n"
            "/* example:\n"
            "[data-theme=\"midnight\"] { --accent: #ff6b9d; }\n"
            "*/\n",
            encoding="utf-8",
        )

    print(f"✅ sidecar created at {sidecar}")
    print("   edit wiki.toml + add files under annotations/ — then re-run generate")
    return 0
```

- [ ] **Step 3: Write the sidecar template files**

`assets/sidecar-template/wiki.toml`:

```toml
# {{REPO_NAME}}.wiki — companion config for project-wiki
# Edit this file by hand. Re-run `generate` to apply changes.

[meta]
title = "{{REPO_NAME}}"
tagline = ""              # appears under the hero title; leave empty to auto-generate
order = "explore"         # "explore" | "tour" — tour mode walks pages in reading_order

[theme]
preset = "midnight"       # midnight | aurora | solar
custom_css = "theme.css"  # path relative to sidecar, optional

[pages]
overview = true
structure = true
files = true
modules = true
deps = true
activity = true

[extras]
charts = true
ai_explanations = false   # if true, generator looks in cache/ai-explanations.json
search = true

[reading_order]
# pages or specific files in the order a reader should walk them
# example:
#   ["overview", "modules/auth", "modules/runtime", "files/src/main.rs"]
items = []

[branding]
# optional — embed an icon and a link
icon_path = ""            # SVG file relative to sidecar
home_url = ""             # link the brand block points to
```

`assets/sidecar-template/README.md`:

```markdown
# Sidecar — `{{REPO_NAME}}.wiki/`

This directory is the *wiki-adapted* companion to the repo at `../{{REPO_NAME}}/`. Everything in here belongs to the wiki, not to the source code.

## Files

| Path | Owner | Purpose |
|------|-------|---------|
| `wiki.toml` | you | Config: theme, pages, extras, reading order, branding |
| `annotations/overview.md` | you | Custom overview — replaces or extends the auto-rendered README |
| `annotations/modules/<name>.md` | you | Per-module hand-written explanation, shown on the Modules page |
| `annotations/files/<path>.md` | you | Per-file note, shown in the file viewer above the source |
| `theme.css` | you | Project-specific CSS variable overrides (optional) |
| `cache/ai-explanations.json` | generator | Cached LLM-generated module summaries (regenerated on demand) |
| `cache/git-snapshot.json` | generator | Previous git stats for delta tracking (auto-managed) |

## Workflow

```bash
# from the parent directory of the repo
project-wiki init ./{{REPO_NAME}}             # already done — created this directory
# edit wiki.toml + drop annotations under annotations/
project-wiki --repo ./{{REPO_NAME}} --output ./{{REPO_NAME}}.html
# the generator picks up this sidecar automatically
```

## Versioning

Decide whether to commit this directory:
- **Commit it** if the wiki is a deliverable for your team
- **Gitignore it** if it's just for your own reference
```

- [ ] **Step 4: Smoke test**

```bash
python project-wiki/scripts/generate.py init /tmp/some-repo
ls /tmp/some-repo.wiki
# expected: wiki.toml  README.md  annotations/  cache/  theme.css
cat /tmp/some-repo.wiki/wiki.toml | head
```

- [ ] **Step 5: Commit**

```bash
git add project-wiki/scripts/generate.py project-wiki/scripts/init_sidecar.py project-wiki/assets/sidecar-template/
git commit -m "feat(project-wiki): init subcommand bootstraps <repo>.wiki/ sidecar"
```

---

## Task 45: Sidecar loader analyzer

**Files:**
- Create: `project-wiki/scripts/analyzers/sidecar.py`
- Modify: `project-wiki/scripts/generate.py` (plug in)

- [ ] **Step 1: Write `analyzers/sidecar.py`**

```python
"""Discover and load the <repo>.wiki/ sidecar if it exists.

Returns a structured dict the renderer can merge with the rest of the data
payload. Returns {"present": False} if no sidecar — the wiki still works."""
from __future__ import annotations
import json
import re
from pathlib import Path

# Tiny TOML parser — same shape as the one in dependencies.py.
# Sidecars only need [meta], [theme], [pages], [extras], [reading_order], [branding].
def parse_toml(text: str) -> dict:
    out, section = {}, None
    cur = out
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].rstrip()
        if not line.strip():
            continue
        m = re.match(r"^\[([\w\.]+)\]\s*$", line)
        if m:
            section = m.group(1)
            cur = out.setdefault(section, {})
            continue
        m = re.match(r"^\s*([\w_]+)\s*=\s*(.+)$", line)
        if m:
            key, rhs = m.group(1), m.group(2).strip()
            if rhs in ("true", "false"):
                cur[key] = (rhs == "true")
            elif rhs.startswith('"') and rhs.endswith('"'):
                cur[key] = rhs.strip('"')
            elif rhs.startswith("[") and rhs.endswith("]"):
                inner = rhs.strip("[]").strip()
                if not inner:
                    cur[key] = []
                else:
                    cur[key] = [s.strip().strip('"') for s in inner.split(",")]
            else:
                cur[key] = rhs
    return out


def run(repo_root: Path) -> dict:
    sidecar = repo_root.parent / f"{repo_root.name}.wiki"
    if not sidecar.is_dir():
        return {"present": False}

    out = {"present": True, "path": str(sidecar)}

    # Config
    cfg_file = sidecar / "wiki.toml"
    if cfg_file.exists():
        try:
            out["config"] = parse_toml(cfg_file.read_text(encoding="utf-8"))
        except Exception as e:
            out["config_error"] = str(e)
            out["config"] = {}
    else:
        out["config"] = {}

    # Annotations — one big dict {kind: {key: text}}
    annotations = {"overview": None, "modules": {}, "files": {}}
    ann_dir = sidecar / "annotations"
    if ann_dir.exists():
        ov = ann_dir / "overview.md"
        if ov.exists():
            annotations["overview"] = ov.read_text(encoding="utf-8")
        mod_dir = ann_dir / "modules"
        if mod_dir.exists():
            for f in mod_dir.glob("*.md"):
                annotations["modules"][f.stem] = f.read_text(encoding="utf-8")
        file_dir = ann_dir / "files"
        if file_dir.exists():
            for f in file_dir.rglob("*.md"):
                rel = f.relative_to(file_dir).as_posix().removesuffix(".md")
                annotations["files"][rel] = f.read_text(encoding="utf-8")
    out["annotations"] = annotations

    # AI explanations cache
    ai_cache = sidecar / "cache" / "ai-explanations.json"
    if ai_cache.exists():
        try:
            out["ai_explanations"] = json.loads(ai_cache.read_text(encoding="utf-8"))
        except Exception:
            out["ai_explanations"] = {}
    else:
        out["ai_explanations"] = {}

    # Project-specific theme override CSS — read raw, renderer inlines
    theme_css = sidecar / "theme.css"
    if theme_css.exists():
        out["theme_css"] = theme_css.read_text(encoding="utf-8")

    return out
```

- [ ] **Step 2: Plug into `generate.py`**

```python
from analyzers import sidecar
# inside gather_data():
data["sidecar"] = sidecar.run(repo_root)
```

- [ ] **Step 3: Smoke test**

```bash
python project-wiki/scripts/generate.py init /tmp/some-repo
echo "# my custom overview" > /tmp/some-repo.wiki/annotations/overview.md
python project-wiki/scripts/generate.py --repo /tmp/some-repo --output /tmp/test.html
python -c "import json,re; html=open('/tmp/test.html').read(); m=re.search(r'wiki-data\".*?>(.*?)</script>', html, re.S); d=json.loads(m.group(1)); print(d['sidecar']['present'], d['sidecar']['annotations']['overview'])"
```

- [ ] **Step 4: Commit**

```bash
git add project-wiki/scripts/analyzers/sidecar.py project-wiki/scripts/generate.py
git commit -m "feat(project-wiki): sidecar loader analyzer"
```

---

## Task 46: Merge sidecar config into render pipeline

**Files:**
- Modify: `project-wiki/scripts/render.py` (apply sidecar.theme_css and sidecar.config)

- [ ] **Step 1: Inline the sidecar's `theme.css` after the regular theme files**

In `bundle_single_file()`, after the CSS inlining pass, append a final `<style data-source="sidecar">` block containing `repo_data["sidecar"].get("theme_css", "")`. This guarantees sidecar overrides win the cascade.

```python
sidecar = repo_data.get("sidecar", {})
if sidecar.get("theme_css"):
    extra_style = f'<style data-source="sidecar/theme.css">\n{sidecar["theme_css"]}\n</style>'
    html = html.replace("</head>", f"{extra_style}\n</head>")
```

- [ ] **Step 2: Apply sidecar config defaults** — when sidecar config sets `[theme] preset = "aurora"`, the wiki should boot with aurora as default.

In `store.js` `init()`, add:

```javascript
// If sidecar provided a default theme and no user override exists yet, use it
const sidecarPreset = initialData?.sidecar?.config?.theme?.preset;
if (sidecarPreset && !localStorage.getItem(THEME_KEY)) {
  state.theme = sidecarPreset;
}
```

Same idea for `[pages]` and `[extras]` — sidecar values seed the initial settings, but `localStorage` user choices still win.

- [ ] **Step 3: Smoke test**

Create a sidecar with `[theme] preset = "aurora"`, regenerate, open in a fresh browser tab (or incognito) — wiki boots in aurora.

- [ ] **Step 4: Commit**

```bash
git add project-wiki/scripts/render.py project-wiki/assets/wiki-template/js/store.js
git commit -m "feat(project-wiki): merge sidecar theme + config into render"
```

---

## Task 47: Render sidecar annotations on pages

**Files:**
- Modify: `project-wiki/assets/wiki-template/js/pages/overview.js`
- Modify: `project-wiki/assets/wiki-template/js/pages/modules.js`
- Modify: `project-wiki/assets/wiki-template/js/pages/files.js`

- [ ] **Step 1: Overview page — show sidecar overview if present**

In `overview.js`, after the README rendering, check for `state.data.sidecar?.annotations?.overview`. If present, render it as the **primary** content (above or instead of the README, depending on `wiki.toml [meta] tagline`):

```javascript
const sidecarOverview = state.data.sidecar?.annotations?.overview;
const readme = state.data.readme;
const overviewHtml = sidecarOverview ? md(sidecarOverview) : (readme.found ? md(readme.raw) : "");
```

- [ ] **Step 2: Modules page — inject hand-written + AI explanations**

In `modules.js`, for each module card, look up:

```javascript
const sidecar = state.data.sidecar?.annotations?.modules || {};
const ai = state.data.sidecar?.ai_explanations || {};
const moduleNote = sidecar[module.name] || ai[module.name];
```

If found, render below the metadata as a `.module-note .markdown-body`. Hand-written wins over AI.

- [ ] **Step 3: Files page — show per-file annotation in the viewer**

In `files.js`, when a file is selected:

```javascript
const fileNotes = state.data.sidecar?.annotations?.files || {};
const note = fileNotes[file.path];
if (note) {
  viewer.insertAdjacentHTML("afterbegin", `<div class="card markdown-body file-note">${md(note)}</div>`);
}
```

Add CSS:
```css
.file-note { margin-bottom: var(--sp-4); border-left: 3px solid var(--accent); }
.module-note { margin-top: var(--sp-3); padding-top: var(--sp-3); border-top: 1px solid var(--border); }
```

- [ ] **Step 4: Smoke test**

```bash
echo "# auth" > /tmp/some-repo.wiki/annotations/modules/auth.md
echo "Handles JWT validation and refresh." >> /tmp/some-repo.wiki/annotations/modules/auth.md
python project-wiki/scripts/generate.py --repo /tmp/some-repo --output /tmp/test.html --open
# Navigate to Modules — auth card should show the hand-written note
```

- [ ] **Step 5: Commit**

```bash
git add project-wiki/assets/wiki-template/js/pages/ project-wiki/assets/wiki-template/css/components.css
git commit -m "feat(project-wiki): render sidecar annotations on pages"
```

---

## Task 48: Phase D documentation

**Files:**
- Create: `project-wiki/references/sidecar-format.md`
- Modify: `project-wiki/SKILL.md` (add Sidecar section)
- Modify: `project-wiki/README.md` (add Sidecar section)

- [ ] **Step 1: `references/sidecar-format.md`**

> **When to read this:** when you want to enrich a generated wiki with hand-written content, AI summaries, custom themes, or persistent reader notes — and have those enrichments survive regeneration.

Cover: full layout of `<repo>.wiki/`, complete `wiki.toml` reference (every key, every default, every example), how the merge precedence works, how to gitignore-or-not, how `init` and `--force` differ, how to migrate annotations between repos.

- [ ] **Step 2: Add a Sidecar section to SKILL.md**

A short section pointing to `references/sidecar-format.md` and explaining the trigger phrases ("init a wiki sidecar", "annotate the wiki for this repo", "remember my notes between regenerates", "add custom explanations to this wiki").

- [ ] **Step 3: README.md** — one paragraph + a `project-wiki init` example

- [ ] **Step 4: Final commit**

```bash
git add project-wiki/references/sidecar-format.md project-wiki/SKILL.md project-wiki/README.md
git commit -m "docs(project-wiki): document the sidecar pattern (Phase D)"
```

═══════════════════════════════════════════════════════════════════════════
## ▸▸▸ STOP-POINT after Task 48 — Phase D complete ◂◂◂
═══════════════════════════════════════════════════════════════════════════

*State: full skill with sidecar pattern. Source repos stay untouched, but the wiki now remembers. Hand-written annotations, AI caches, project themes — all survive regeneration. v1.1.0 tag.*

---

## Self-review checklist (after writing this plan)

**Spec coverage** — every requirement from the user's brief mapped to a task:
- "skill package for wiki sites from project repos" → Tasks 0–10 (scaffold + generator) + 38–40 (skill manual + readme + metadata)
- "html (js. css)" only → enforced throughout; no Node, no framework, no build step
- "rent överjävligt snyggt" → Tasks 11–14 (tokens, layout, components, themes), 18 (overview), 19 (donut), 21 (sunburst), 33 (settings polish), 36 (responsive + a11y)
- "smidigt paket" → Task 0 (scaffold) + 38 (SKILL.md) + 40 (README) + 41 (sample) + 43 (final verify)
- "litet ui där extragrejor kan väljas" → Task 33 (settings modal as the configurator)
- "analyser" → Tasks 2–9 (nine analyzers)
- "förklaringar" → Task 18 (README rendering) + Task 29 (modules with optional AI-explanation slot, exposed via Task 33's `showAIExplanations` toggle)
- "mycket och snygg grafik" → Tasks 19–26 (eight chart types) + Task 35 (icon sprite)
- "du har bra skills i repot för sånt med" → Pre-flight (ui-ux-pro-max design system query) + Task 11 (tokens aligned with its glassmorphism + dev-tool recommendations) + this plan follows skill-forge Production shape

**Placeholder scan** — every step has either real code, a real CLI command, or a concrete checklist. Tasks 22–26 (treemap/force-graph/heatmap/timeline/sparkline) have skeletons + interface specs rather than full code; this is a deliberate trade-off for plan length, but each skeleton contains enough structure that implementation is mechanical. The implementer should plan ~30–60 minutes per chart.

**Type/symbol consistency** — `drawDonut`, `drawBar`, `drawSunburst`, `drawTreemap`, `drawForceGraph`, `drawHeatmap`, `drawTimeline`, `drawSparkline` are all consistently named. The data shape in `data.json` (referenced by `overview.js`, `structure.js`, etc.) matches what the analyzers in Tasks 2–9 actually produce. The settings keys (`showStats`, `showLanguages`, `showCharts`, `showStructure`, `showFiles`, `showModules`, `showDeps`, `showActivity`, `showSymbols`, `showAIExplanations`, `density`) are consistent across `store.js`, `nav.js`, `pages/*.js`, and `settings.js`.

---

## Execution options

**Two ways to run this plan:**

1. **Inline (recommended for this kind of work)** — I execute the tasks myself in this session, in order, committing after each. You watch the diffs land. Best when you want tight feedback per step and don't mind giving up the chat window for a while.

2. **Subagent-driven** — I dispatch a fresh subagent per task and review between. Slightly more isolation per task, slightly more overhead per task. Works but is overkill for a sequence of mostly-independent file writes like this.

**Recommendation:** option 1 (inline). The tasks are bite-sized, the plan is concrete, and most steps are "write file → open browser → eyeball → commit". If a chart doesn't render, we'll see it immediately and fix in place. Subagents are wasted compute for that loop.
