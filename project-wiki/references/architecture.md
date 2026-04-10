# Architecture

> **When to read this:** when you need to understand how the generator becomes a single HTML file, or when you're adding a new pipeline stage.

## The pipeline in one diagram

```
   repo
    │
    ▼
┌──────────────────┐
│  walker.py       │  prunes ignored dirs/files, yields (rel, abs, size)
└──────────────────┘
    │
    ▼
┌──────────────────┐
│  9 analyzers     │  each returns a dict slice → merged into data{}
│  (analyzers/*.py)│
└──────────────────┘
    │
    ▼
┌──────────────────┐
│  render.py       │  picks single mode or folder mode
│                  │
│  single mode:    │  reads template, inlines all CSS, bundles all JS
│  bundle_single_  │  modules into one IIFE, base64 fonts, inlines
│  file()          │  sprite + data, writes one .html
│                  │
│  folder mode:    │  copies template tree, inlines data + sprite
│  render()        │  into index.html
└──────────────────┘
    │
    ▼
   output
```

## Why everything is inlined

Browsers block `fetch('./data.json')` from `file://` due to CORS. The only way to make a static site work via `file://` is to inline everything that would normally be fetched. We inline:

| Resource | Mechanism |
|----------|-----------|
| The data payload | `<script id="wiki-data" type="application/json">…</script>` |
| The icon sprite | `<svg id="lucide-sprite" style="display:none;">…</svg>` directly in `<body>` |
| All CSS | `<style data-source="…">…</style>` blocks (one per source file) |
| All JS modules | One IIFE-wrapped `<script>` block with imports/exports stripped |
| Fonts | `data:font/woff2;base64,…` URLs inside the inlined CSS |

## The JS bundler

The bundler is ~120 LOC of pure Python in `render.py:bundle_js()`. It works because we keep the source code under tight constraints:

1. **Only relative imports** (no npm package names)
2. **Imports at the top of the file only** (no dynamic `await import()`)
3. **Only `import { … } from "./x.js"` form** — no defaults, no `import * as`
4. **Only `export function`, `export const`, `export class`** — no `export default`, no aggregator `export { … }` blocks at the bottom

Given those constraints:
- Topo-sort modules by their static imports (DFS, dependencies first)
- Strip `import { … } from "./x.js"` lines (becomes same-scope refs)
- Strip the `export` keyword (bindings become module-scope inside the IIFE)
- Concatenate everything into `(() => { … })();`

This is the smallest viable bundler. Any real bundler (esbuild, rollup, etc) would force a build dependency, killing the "open the file and it works" promise.

## Why no JS framework

A framework forces a build step. A build step forces `npm install`. `npm install` kills the experience. Vanilla JS at this scope (~2.5k LOC across the source) is totally manageable, and the IIFE bundle stays under 200 KB.

## File responsibilities

| File | Owns |
|------|------|
| `scripts/generate.py` | Argument parsing, mode selection, top-level orchestration |
| `scripts/walker.py` | Single source of truth for ignore patterns + the file iterator |
| `scripts/render.py` | Both rendering modes + the JS bundler + font inlining |
| `scripts/analyzers/<name>.py` | One analyzer each. Same shape: `def run(repo_root: Path) -> dict` |
| `scripts/verify.py` | Post-generation sanity check, works for both modes |
| `assets/wiki-template/index.html` | The shell — links/scripts replaced at build time |
| `assets/wiki-template/css/*` | Design tokens + layout + components + chart styles + theme overrides |
| `assets/wiki-template/js/app.js` | Bootstrap entry — reads inlined data, mounts shell |
| `assets/wiki-template/js/store.js` | Pub/sub state with localStorage persistence |
| `assets/wiki-template/js/router.js` | Hash-based router with static page imports |
| `assets/wiki-template/js/utils.js` | Shared helpers (escapeHtml, formatBytes, etc.) — single source of truth |
| `assets/wiki-template/js/charts/<name>.js` | One chart each. Same shape: `draw<Name>(container, data, opts)` |
| `assets/wiki-template/js/pages/<name>.js` | One page each. Same shape: `render(main, state)` |
