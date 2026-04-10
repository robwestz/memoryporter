# project-wiki

> Generate a gorgeous, fully-static HTML wiki for any project repository. One command. Zero install. Double-click the result.

## What it does

Walks any project repo, runs 9 modular analyzers, and emits **one self-contained `<repo>.html` file** (~2.5 MB) that you can email, drop in Dropbox, or open via `file://` in any modern browser. The wiki includes an overview page, file explorer with syntax highlighting, dependency graph, git activity heatmap, sunburst + treemap structure visualization, Cmd+K search, an in-page settings modal for picking which extras to show, and three themes (Midnight, Aurora, Solar).

## Supported clients

- Claude Code (this skill is invoked via the `Skill` tool)
- Any environment that can run Python 3.9+

## Prerequisites

- Python 3.9 or newer (stdlib only — no `pip install` needed)
- A modern browser (Chrome, Firefox, Safari, Edge)

## Installation

```bash
# Clone or copy project-wiki/ into your kit
cp -r project-wiki/ ~/your-kit/
```

That's it. No build step.

## Quick start

```bash
# Single-file mode (default)
python project-wiki/scripts/generate.py --repo /path/to/repo --output /tmp/my-wiki.html --open

# Folder mode for hosting / debugging
python project-wiki/scripts/generate.py --repo /path/to/repo --output /tmp/my-wiki/ --mode folder --open
```

## Trigger conditions

When the user asks to:
- Document a repo
- Make a wiki for a codebase
- Build a project site / landing page for code
- Explain a codebase visually
- Generate a shareable walkthrough
- Generate docs for a monorepo

## Expected outcome

A single `<repo>.html` file you double-click. The wiki renders end-to-end with no console errors, no broken links, no missing assets. First visit auto-opens the settings modal so the reader picks what they want to see.

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Operations manual for invoking agents |
| `README.md` | This file |
| `metadata.json` | Marketplace metadata |
| `scripts/generate.py` | CLI entry — `python generate.py --repo X --output Y` |
| `scripts/walker.py` | Repo walking with ignore patterns |
| `scripts/render.py` | Folder + single-file rendering |
| `scripts/verify.py` | Sanity-check generated output |
| `scripts/analyzers/*.py` | 9 modular analyzers (repo_stats, languages, structure, etc.) |
| `assets/wiki-template/` | The HTML/CSS/JS source — bundled at build time |
| `references/*.md` | Reference docs (architecture, theme system, chart catalog, analyzer anatomy, data schema) |
| `examples/sample-wiki/` | Pre-rendered example generated from portable-kit itself |
| `evals/evals.json` | Test cases for skill-creator |

## Troubleshooting

**The browser doesn't open after `--open` on Windows**
The `webbrowser` module on Windows sometimes silently fails. Just open the `.html` file manually from File Explorer.

**Icons are missing**
The icon sprite is inlined into the HTML at build time. If they don't show up, regenerate — the sprite SVG might be outdated.

**No git activity page**
The wiki gracefully handles repos without `.git/`. If you want activity, run `git init && git commit -am "initial"` and regenerate.

**The single-file output is too big**
The default is generous on the file index (200 KB / 600 lines per file). If your repo has many large text files, edit `scripts/analyzers/file_index.py` to lower `INLINE_MAX_BYTES` and `INLINE_MAX_LINES`.

**Want to see the source as separate files for debugging?**
Use `--mode folder`.
