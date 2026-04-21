# pyproject.toml extras — Reference
> Last updated: 2026-04-21

## Overview

`pyproject.toml` is the single source of truth for modern Python projects (PEP 517/518/621). It replaces `setup.py`, `setup.cfg`, `requirements.txt`, `.flake8`, `mypy.ini`, `pytest.ini`, and `.coveragerc`. For `wapt`, it also controls how `uv tool install` resolves the package and which extras (L1 core vs L3 Rich) get installed.

Relevant PEPs:
- **PEP 517** (2015) — Build system interface (`[build-system]`)
- **PEP 518** (2016) — `pyproject.toml` as the config file
- **PEP 621** (2020) — Standardised `[project]` metadata table
- **PEP 735** (2024) — Dependency groups (dev deps, supported by uv 0.11+)

---

## Best Practices

- Keep `[project]` metadata PEP 621-compliant — portable across all build backends
- Separate runtime extras (`ops`, `ui`) from dev tooling (`[tool.uv]` dev-dependencies or `[dependency-groups]`)
- Use `[dependency-groups]` (PEP 735, uv 0.11+) for dev/test instead of a `dev` extra — dev groups are not installable by end users
- Prefer **hatchling** for new pure-Python projects in 2026: minimal config, fast, actively maintained
- `target-version` in `[tool.ruff]` must match `requires-python` to get correct upgrade suggestions
- `strict = true` in mypy enables the full set of checks; add per-module overrides for stubs-lacking third-party libs
- Run `uv lock` after every dependency change to keep `uv.lock` in sync

---

## Version Pins

```
hatchling  >= 1.27
ruff       >= 0.9.0
mypy       >= 1.13
pytest     >= 8.3
pytest-asyncio >= 0.24
coverage   >= 7.6
```

---

## Build Backend Comparison (2026)

| Backend | Pros | When to use |
|---------|------|-------------|
| **hatchling** | Minimal config, fast, extensible hooks, PEP 621 native | New pure-Python projects (recommended) |
| **setuptools** | Maximum compatibility, C extensions, legacy ecosystem | Migrating from setup.py; C extensions |
| **flit-core** | Absolute minimal for simple pure-Python libs | Single-module libraries only |
| **uv_build** | Built into uv, zero extra deps | uv-first projects; functionally equivalent to hatchling |

For `wapt`: use **hatchling**. It handles the monorepo subdirectory layout without extra config.

---

## Complete pyproject.toml for wapt

```toml
[project]
name = "wapt"
version = "0.1.0"
description = "Web app platform tool"
readme = "README.md"
license = { text = "MIT" }
requires-python = ">=3.12"
authors = [
    { name = "Your Name", email = "you@example.com" },
]
keywords = ["cli", "devops", "heroku", "caddy"]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Environment :: Console",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.12",
    "Programming Language :: Python :: 3.13",
]

# L0 core — always installed
dependencies = [
    "typer>=0.12",
    "httpx>=0.27",
    "pydantic>=2.7",
]

[project.optional-dependencies]
# L1 operational adapters — opt-in per deployment context
ops = [
    "boto3>=1.34",
    "fabric>=3.2",
]
# L3 rich UI — opt-in, never required for scripted/CI use
ui = [
    "rich>=14.0",
]
# Convenience bundle
full = [
    "wapt[ops,ui]",
]

[project.scripts]
wapt = "wapt.cli_core:app"

[project.urls]
Homepage = "https://github.com/user/repo"
Repository = "https://github.com/user/repo"

# ---------------------------------------------------------------------------
# Build system
# ---------------------------------------------------------------------------

[build-system]
requires = ["hatchling>=1.27"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
# Required for non-standard layouts (monorepo: tools/wapt/src/wapt/)
packages = ["src/wapt"]

[tool.hatch.version]
# Dynamic version read from __init__.py by hatchling
# Delete this section if using static "version" in [project] instead
path = "src/wapt/__init__.py"

# ---------------------------------------------------------------------------
# Dev dependencies (uv-specific, not installable as an extra by end users)
# ---------------------------------------------------------------------------

[tool.uv]
dev-dependencies = [
    "mypy>=1.13",
    "ruff>=0.9.0",
    "pytest>=8.3",
    "pytest-asyncio>=0.24",
    "coverage[toml]>=7.6",
    "types-boto3>=1.34",
]

# ---------------------------------------------------------------------------
# Ruff — linter + formatter (replaces black + flake8 + isort)
# ---------------------------------------------------------------------------

[tool.ruff]
line-length = 88
target-version = "py312"
src = ["src", "tests"]

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # Pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "UP",  # pyupgrade — modernise syntax for Python 3.12
    "C90", # mccabe complexity
    "RUF", # Ruff-specific rules
]
ignore = [
    "E501",  # line too long — handled by formatter
]

[tool.ruff.lint.isort]
known-first-party = ["wapt"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"

# ---------------------------------------------------------------------------
# pytest
# ---------------------------------------------------------------------------

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"          # pytest-asyncio: all async tests auto-detected
addopts = [
    "-ra",                     # show short test summary for all non-passing
    "--tb=short",
    "--strict-markers",
]
markers = [
    "integration: marks tests that call real external APIs (deselect with -m 'not integration')",
    "slow: marks tests as slow-running",
]

# ---------------------------------------------------------------------------
# Coverage
# ---------------------------------------------------------------------------

[tool.coverage.run]
source = ["src/wapt"]
branch = true
omit = [
    "tests/*",
    "src/wapt/__main__.py",
]

[tool.coverage.report]
precision = 1
show_missing = true
exclude_lines = [
    "pragma: no cover",
    "raise NotImplementedError",
    "if TYPE_CHECKING:",
    "@overload",
    "def __repr__",
]

# ---------------------------------------------------------------------------
# mypy — strict mode for Python 3.12
# ---------------------------------------------------------------------------

[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_ignores = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
disallow_any_generics = true
check_untyped_defs = true
no_implicit_reexport = true

# Third-party libs without stubs — suppress per module
[[tool.mypy.overrides]]
module = ["boto3.*", "botocore.*", "fabric.*"]
ignore_missing_imports = true
```

---

## Extras Design for L0 / L1 / L3 Architecture

```
wapt              ← L0 core (always: typer, httpx, pydantic)
wapt[ops]         ← L1 adapters (+ boto3, fabric)
wapt[ui]          ← L3 rich output (+ rich)
wapt[full]        ← Everything bundled
```

This means:
- CI/server installs: `uv tool install wapt` — zero UI deps, JSON-clean stdout
- Developer installs: `uv tool install "wapt[ui]"` — colored output enabled
- Ops installs: `uv tool install "wapt[ops,ui]"` — full capability

Detection pattern in code:
```python
# src/wapt/_compat.py
try:
    from rich.console import Console
    HAS_RICH = True
except ImportError:
    HAS_RICH = False
```

---

## Code Examples

### Example 1 — Dynamic version via `importlib.metadata`
```python
# src/wapt/__init__.py
from importlib.metadata import version, PackageNotFoundError

try:
    __version__ = version("wapt")
except PackageNotFoundError:
    # Running from source without install (e.g. during tests)
    __version__ = "0.0.0.dev"
```

```toml
# pyproject.toml — use dynamic version (hatchling reads from __init__.py)
[project]
name = "wapt"
dynamic = ["version"]

[tool.hatch.version]
path = "src/wapt/__init__.py"
```

### Example 2 — Conditional import of a UI extra at runtime
```python
# src/wapt/output.py
"""Output layer: Rich when installed, plain-text JSON fallback."""
from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

try:
    from rich.console import Console
    from rich.table import Table
    _console = Console(stderr=False, highlight=False)
    _err_console = Console(stderr=True, highlight=False)
    HAS_RICH = True
except ImportError:
    HAS_RICH = False


@dataclass
class HealthResult:
    name: str
    status: str          # "ok" | "degraded" | "down"
    detail: str = ""
    latency_ms: float | None = None


def print_health_table(results: list[HealthResult], json_mode: bool = False) -> None:
    """Print health check results as a Rich table or plain JSON."""
    if json_mode or not HAS_RICH:
        payload = [
            {
                "name": r.name,
                "status": r.status,
                "detail": r.detail,
                "latency_ms": r.latency_ms,
            }
            for r in results
        ]
        print(json.dumps(payload, indent=2))
        return

    status_label = {
        "ok": "[green]OK[/]",
        "degraded": "[yellow]DEGRADED[/]",
        "down": "[red]DOWN[/]",
    }

    table = Table(title="wapt doctor", show_header=True, header_style="bold")
    table.add_column("Check", style="cyan", no_wrap=True)
    table.add_column("Status", justify="center", no_wrap=True)
    table.add_column("Detail")
    table.add_column("Latency", justify="right", style="dim")

    for r in results:
        latency = f"{r.latency_ms:.0f}ms" if r.latency_ms is not None else "—"
        table.add_row(r.name, status_label.get(r.status, r.status), r.detail, latency)

    _console.print(table)
```

---

## Gotchas

- **`dynamic = ["version"]` and `version = "..."` are mutually exclusive** in `[project]`. Pick one; hatchling raises an error if both are present.
- **Extras in `[project.optional-dependencies]` are public API** — end users can install them. Dev tooling belongs in `[tool.uv]` dev-dependencies or `[dependency-groups]`, not in an extra.
- **hatchling `packages` must be set** when the layout is non-standard (e.g. `src/wapt/` inside `tools/wapt/`). Without it, hatchling auto-detects and may package the wrong directory.
- **`asyncio_mode = "auto"`** in pytest requires `pytest-asyncio >= 0.21`. Older versions use `@pytest.mark.asyncio` per-test.
- **ruff `select` replaces the default set**. Use `extend-select` to add rules on top of defaults instead of replacing them. `select = ["ALL"]` is not recommended — too noisy.
- **mypy `strict = true`** implies `disallow_untyped_defs`, `disallow_any_generics`, and others. Add `[[tool.mypy.overrides]]` sections for third-party libs that lack stubs rather than disabling strict globally.
- **`[dependency-groups]`** (PEP 735) is the newer alternative to dev extras — supported by uv 0.11+. Not yet supported by all other tools (e.g. older pip versions). Use `[tool.uv]` dev-dependencies for maximum compatibility today.
- **Self-referential extras** (`full = ["wapt[ops,ui]"]`) require the package to be published on PyPI or installed as editable; they do not resolve correctly from a raw git source in all tools.

---

## External Links

- [PEP 621 — Project metadata in pyproject.toml](https://peps.python.org/pep-0621/)
- [Python Packaging User Guide — Writing pyproject.toml](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/)
- [Hatchling build configuration](https://hatch.pypa.io/latest/config/build/)
- [Ruff configuration reference](https://docs.astral.sh/ruff/configuration/)
- [mypy configuration reference](https://mypy.readthedocs.io/en/stable/config_file.html)
- [pytest configuration reference](https://docs.pytest.org/en/stable/reference/customize.html)
- [coverage.py configuration](https://coverage.readthedocs.io/en/latest/config.html)
- [Modern Python code quality setup — uv + ruff + mypy (2025)](https://simone-carolini.medium.com/modern-python-code-quality-setup-uv-ruff-and-mypy-8038c6549dcc)
- [pyproject.toml reference — pydevtools](https://pydevtools.com/handbook/reference/pyproject.toml/)
