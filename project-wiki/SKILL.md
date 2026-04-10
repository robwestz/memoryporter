---
name: project-wiki
description: Generate a beautiful, fully-static HTML/CSS/JS wiki site that documents any project repository — with interactive charts, dependency graphs, file explorer, git activity heatmap, and an in-page configurator for choosing extras. Use whenever the user asks to "document this repo", "make a wiki", "build a project site", "generate documentation for this codebase", "explain this codebase visually", "create a shareable codebase walkthrough", or wants any visual documentation of a project. Output is zero-install — opens via file:// in any modern browser, no server, no build step, no `npm install`.
author: Robin Westerlund
version: 1.0.0
---

# Project Wiki

## Purpose

Turn any project repository into a polished, self-contained HTML wiki in one command. Default output is **a single `~2.5 MB <repo>.html` file** you double-click. No server, no build step, no dependencies. Inside the wiki, a settings modal lets the reader toggle extras (charts, file viewer, dependency graph, git activity, AI explanations) and switch between three themes. Settings persist across visits via `localStorage`.

## When to use this skill

| The user says… | Use this skill |
|----------------|----------------|
| "document this repo" | yes |
| "make a wiki for this codebase" | yes |
| "build a project site for this code" | yes |
| "explain this codebase visually" | yes |
| "give me a shareable walkthrough of this project" | yes |
| "generate docs for this monorepo" | yes — handles per-package manifests automatically |
| "I need a README" | no — use a writing skill |
| "rewrite this function" | no |

## How it works (one paragraph)

A pure-stdlib Python generator (`scripts/generate.py`) walks the target repo, runs nine modular analyzers, and emits a single `data.json` payload describing the codebase. The renderer then bundles a hand-crafted HTML/CSS/JS shell — inlining all CSS into `<style>` blocks, concatenating all JS modules into one IIFE-wrapped `<script>` (with imports/exports stripped), inlining the icon sprite, and inlining `data.json` itself — into one self-contained HTML file. Opening it bootstraps a vanilla-JS app that renders an overview, structure (sunburst + treemap), file explorer with syntax highlighting, dependency graph (force-directed), git activity (heatmap + timeline), and a Cmd+K search palette. The settings modal — the in-wiki configurator — lives inside the wiki itself; first visit auto-opens it.

## Quick start

```bash
# Default: produce one self-contained .html file
python scripts/generate.py --repo /path/to/repo --output /tmp/my-wiki.html --open

# Folder mode (for hosting on a static site, debugging, or linking from a docs site)
python scripts/generate.py --repo /path/to/repo --output /tmp/my-wiki/ --mode folder --open
```

Flags:
- `--repo` (required): path to the project repository
- `--output` (required): `.html` file path for single mode, directory path for folder mode
- `--mode {single,folder}`: output mode. **Default: `single`.**
- `--open`: open the result in the default browser when done

## What gets analyzed

| Analyzer | Output |
|---------|--------|
| `repo_stats` | file count, total bytes, total LOC, top 25 files by LOC |
| `languages` | language detection by extension, files + bytes + LOC per language, brand colors |
| `structure` | nested directory tree, capped at 8 levels deep |
| `dependencies` | parses package.json, Cargo.toml, pyproject.toml, requirements.txt, go.mod, composer.json |
| `git_log` | last 200 commits via `git log` shell-out, gracefully empty if no git |
| `readme` | finds README, extracts title and headings, returns raw markdown |
| `changelog` | finds CHANGELOG / CHANGES / HISTORY |
| `symbols` | regex extraction of functions/classes/structs/traits for Python, JS/TS, Rust, Go |
| `file_index` | flat list of every text file with inline preview (≤200 KB / 600 lines) for the file viewer |

**The source repo is read-only.** The generator never writes anything inside `--repo`. All output goes to `--output`.

## What the wiki contains

| Page | What's on it |
|------|-------------|
| Overview | Hero, stat tiles, language donut, README rendered |
| Structure | Sunburst + treemap of folder tree + top-level entry list |
| Files | Filterable explorer + viewer with syntax highlighting |
| Modules | Top-level directories as cards with file counts and LOC |
| Dependencies | Stat tiles + per-manifest tables + force-directed graph |
| Activity | Git stats, heatmap, timeline, top authors, recent commits |

## The "small UI" (configurator)

The settings modal — gear icon top-right, or Configure button in the sidebar, or auto-opens on first visit — lets the reader pick:

- **Theme**: Midnight (default), Aurora, Solar
- **Pages**: Toggle Structure, Files, Modules, Dependencies, Activity
- **Extras**: Stat tiles, language donut, all charts, symbol index, AI-explanation slot
- **Density**: Comfortable, Compact

All choices persist in `localStorage` under `project-wiki:settings:v1`.

## Adding a custom analyzer

Drop a `scripts/analyzers/<name>.py` exporting `run(repo_root: Path) -> dict`, then import it in `generate.py:gather_data()` and add the key to the data dict. The wiki picks it up automatically — write a corresponding page if you want to render it visually.

## Adding a custom theme

Add a CSS file in `assets/wiki-template/css/themes/<name>.css` that scopes color tokens under `[data-theme="<name>"]`. Add a `<link>` to it in `index.html` and an entry in the `THEMES` array in `js/settings.js`.

## Adding a custom chart

Create a JS file in `assets/wiki-template/js/charts/<name>.js` exporting `draw<Name>(container, data, opts)`. Use `donut.js` as a reference template. Reads colors from CSS variables for theme awareness.

## Verification

After generating, run:

```bash
python scripts/verify.py <output.html | output_dir>
```

Checks: file exists, data parses, all required keys present, no placeholder leaks, IIFE wrapper intact (single mode), all required template files present (folder mode).

## Anti-patterns

| Don't | Do | Why |
|-------|-----|-----|
| Add framework dependencies (React, Vue, Tailwind) | Stick to vanilla HTML/CSS/JS | "Open the file and it works" is the whole point — a build step kills it |
| Use `fetch('./data.json')` to load data | Inline via `<script id="wiki-data" type="application/json">` | `file://` blocks JSON `fetch` due to CORS — inlining is the only way |
| Hardcode colors in components | Use `var(--accent)` etc. from `tokens.css` | Themes work by overriding tokens; hardcoded colors break theme switching |
| Add a Python server for the configurator | Settings live in the wiki itself as a modal | A server kills the no-install promise; modal is intrinsically smoother |
| Default to folder mode | Default to single-file mode | "Double-click the .html file" is the smoothest possible experience |
| Write enrichments back to the source repo | Use a sibling `<repo>.wiki/` directory (Phase D) | The repo is read-only by contract |
| `export default` or aggregator `export { … }` blocks | `export function`, `export const`, `export class` only | The single-file bundler strips the `export` keyword — defaults and aggregators don't survive |
| Dynamic `await import()` inside JS | Static imports at top of file | The bundler does topo-sort by static imports; dynamic imports become broken references |

## Related

- **skill-forge** — packaged this skill (Production shape)
- **skill-creator** — use to add evals and iterate
- **ui-ux-pro-max** — design tokens are aligned with its glassmorphism + dark mode + dev-tool recommendations
