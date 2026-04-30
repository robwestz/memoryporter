# Phase 6 — L3 Presentation + Packaging

**Goal:** Rich-based colored output + `pyproject.toml` finalized + `uv tool install` via git subdirectory works.
**LOC budget:** ~180 prod (colored_output) + ~80 test + packaging config.
**Timeline:** D9 (1 dag).

## Prerequisites
- Phase 5 complete, check-in passed: Heroku deploy verified publicly by Robin

## Waves

### Wave A — colored_output (D9 morning)
- `src/wapt/colored_output.py` (180 LOC)
  - Rich Console singleton
  - Table formatters for:
    - `wapt list` — columns: name, domain, root, targets, status
    - `wapt health` — columns: name, status, latency, last-check
    - `wapt doctor` — rows per check with symbols + colored status
  - Opt-in via `[features] colored_output = true` (default true)
  - Fallback to plain text when `--json` flag or non-TTY

### Wave B — pyproject.toml finalize (D9 morning)
- Entry-point: `wapt = "wapt.cli_core:app"`
- Core deps: typer, pydantic, jinja2, rich, httpx (for Admin API)
- Optional deps:
  - `[ops]`: adds fastapi, log_tail utilities
  - `[ui]`: adds rich (moved here as optional)
  - `[jetbrains]`: no extra deps, just enables feature
- `[tool.uv]` section for editable install
- Python version requirement: >=3.12

### Wave C — wapt.sh shim (D9 afternoon)
- `wapt.sh` (30 LOC)
  - Resolve Python interpreter (`uv tool which wapt` or fallback to PATH)
  - Forward all args to `wapt` Python command
  - Source line for `.bashrc`: `source ~/portable-kit/tools/wapt/wapt.sh`
  - Windows Git Bash compatibility

### Wave D — Install validation (D9 afternoon)
- Test 1: `uv tool install --editable .` from portable-kit root
- Test 2: `uv tool install git+<repo>#subdirectory=tools/wapt` from fresh clone
- Test 3: `source wapt.sh` + `wapt doctor` in clean bash session
- Document install path in AGENTS.md

## Acceptance criteria
- `wapt list` shows formatted Rich table
- `wapt health` shows colored status indicators (green/yellow/red)
- `wapt doctor` shows per-check with color
- `wapt --json list` falls back to plain JSON (no Rich)
- `uv tool install --editable .` works from empty venv
- `uv tool install git+<repo>#subdirectory=tools/wapt` works
- `source wapt.sh; wapt doctor` works in clean bash

## Research questions (for deepen-plan)
- Rich Table API 2026: best pattern for conditional color per-cell?
- uv tool install `--editable`: fully supported or still experimental?
- uv tool install `git+` URL with `#subdirectory=...`: syntax + caveats
- Python 3.12 vs 3.13 vs 3.11 — minimum version for Typer + Pydantic v2 + Rich combo?
- Rich output with `--json` flag: disable patterns that don't pollute stdout

## Dependencies
- `references/rich-tables.md`
- `references/uv-tool-install.md`
- `references/pyproject-extras.md`

## Risks / gotchas
- Rich can pollute stdout when piped; use `Console(file=sys.stderr)` for human-messages, stdout for data
- uv git+subdirectory might not cache properly — test re-install after upstream change
- Windows Git Bash may not have Rich terminal capabilities; test fallback gracefully

## Stop signals
- `uv tool install --editable` fails on Windows: fallback to `pip install -e .` + warn Robin
- Rich Table breaks in ConEmu/Windows Terminal: provide `--no-color` flag fallback

## Exit artifacts
- `src/wapt/colored_output.py`
- `pyproject.toml` v0.1.0
- `wapt.sh` shim
- `tests/unit/test_colored_output.py`
- Installation sections in AGENTS.md updated
- BLUEPRINT.md LOC tracker updated for L3
