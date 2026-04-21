# uv tool install — Reference
> Last updated: 2026-04-21

## Overview

`uv tool install` installs a Python package as a CLI tool into an isolated virtual environment. The installed executables are symlinked (Unix) or copied (Windows) into a dedicated `bin` directory that should be on `PATH`. This is uv's replacement for `pipx`.

Latest stable version as of 2026-04-21: **uv 0.11.7** (released 2026-04-15).

---

## Best Practices

- Always verify `uv tool update-shell` has been run after first install on Windows — PATH is NOT auto-updated in active sessions
- Pin extras explicitly in CI: `uv tool install "wapt[ops,ui]"` rather than bare `wapt`
- Use `--python 3.12` when the project requires a specific minor version
- For local dev, prefer `uv tool install --editable .` in the repo root (or the subdirectory)
- Lock files (`uv.lock`) belong to the *project*, not the tool consumer; tools install from PyPI/git without a lock file by default
- Git installs re-resolve on every `uv tool upgrade`; pin a tag or SHA for reproducibility

---

## Version Pins

```
uv >= 0.11.7
requires-python = ">=3.12"
```

---

## Core Commands

### Install from PyPI
```bash
uv tool install wapt
uv tool install "wapt>=0.2.0"
uv tool install "wapt[ops,ui]"          # install with extras
```

### Install from git (monorepo subdirectory)
```bash
# Full URL with subdirectory fragment
uv tool install "git+https://github.com/user/repo#subdirectory=tools/wapt"

# With extras
uv tool install "wapt[ops,ui] @ git+https://github.com/user/repo#subdirectory=tools/wapt"

# Pin to a tag
uv tool install "git+https://github.com/user/repo@v0.3.0#subdirectory=tools/wapt"

# Pin to a specific commit SHA
uv tool install "git+https://github.com/user/repo@a1b2c3d#subdirectory=tools/wapt"
```

### Local / editable install (dev workflow)
```bash
# From within tools/wapt/
uv tool install --editable .

# From repo root targeting a subdirectory
uv tool install --editable tools/wapt
```

### Upgrade / uninstall / list
```bash
uv tool upgrade wapt          # upgrade to latest
uv tool upgrade --all         # upgrade every installed tool
uv tool uninstall wapt        # remove tool + venv
uv tool list                  # show all installed tools + versions
uv tool dir                   # print the tool venv root
```

### Force a specific Python version
```bash
uv tool install wapt --python 3.12
uv tool upgrade wapt --python 3.12
```

---

## PATH Setup

### Linux / macOS
Tools land in (first match wins):
1. `$XDG_BIN_HOME`
2. `$XDG_DATA_HOME/../bin`
3. `~/.local/bin`

### Windows
Tools land in (first match wins):
1. `%XDG_BIN_HOME%`
2. `%XDG_DATA_HOME%\..\bin`
3. `%USERPROFILE%\.local\bin`

Tool venvs are stored in `%LOCALAPPDATA%\uv\tools\<toolname>\`.
Tool executables are **copied** (not symlinked) on Windows.

### Fix PATH automatically
```bash
uv tool update-shell            # patches shell config files
```

### Fix PATH manually (PowerShell, persistent)
```powershell
[Environment]::SetEnvironmentVariable(
    "Path",
    "$env:USERPROFILE\.local\bin;$([Environment]::GetEnvironmentVariable('Path','User'))",
    "User"
)
```

> **Windows gotcha**: PATH changes only affect *new* sessions. Open a new terminal after running `update-shell` or the manual PowerShell command.

---

## `uv run` vs direct invocation

| Situation | Command |
|-----------|---------|
| Tool is on PATH (normal use) | `wapt doctor` |
| PATH not set up / CI bootstrap | `uv tool run wapt doctor` |
| Running from project venv (not tool install) | `uv run wapt doctor` |
| One-off without installing | `uvx wapt doctor` |

`uv run` uses the *project* venv. `uv tool run` / `uvx` uses the isolated tool venv. They are not the same environment.

---

## pyproject.toml requirements for `uv tool install`

The package **must** declare a build system and at least one script entry point:

```toml
[project]
name = "wapt"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["typer>=0.12"]

[project.scripts]
# The key becomes the CLI command name placed on PATH
wapt = "wapt.cli_core:app"

[build-system]
# hatchling is the recommended default for new projects in 2026
requires = ["hatchling"]
build-backend = "hatchling.build"
```

Without `[project.scripts]` the tool installs but no executable is placed on PATH.
Without `[build-system]` uv cannot build a wheel from a local or git source.

---

## Lock files

`uv.lock` is a project-level artefact. When installing as a tool:
- `uv tool install` does **not** read or create `uv.lock`
- Resolution happens fresh from PyPI / git at install time
- For reproducible CI tool installs, pin versions explicitly in the install command or use a tag/SHA in the git URL

---

## Code Examples

### Example 1 — Minimal pyproject.toml for `uv tool install`
```toml
[project]
name = "wapt"
version = "0.1.0"
description = "Web app platform tool"
requires-python = ">=3.12"
dependencies = [
    "typer>=0.12",
    "httpx>=0.27",
]

[project.optional-dependencies]
ops = ["boto3>=1.34", "fabric>=3.2"]
ui  = ["rich>=14.0"]

[project.scripts]
wapt = "wapt.cli_core:app"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

### Example 2 — Bootstrap script (CI / onboarding)
```bash
#!/usr/bin/env bash
# bootstrap-wapt.sh — idempotent tool install for CI and dev machines
set -euo pipefail

WAPT_REPO="https://github.com/user/repo"
WAPT_REF="v0.3.0"
WAPT_SUBDIR="tools/wapt"

# Check if already installed at correct version
if uv tool list 2>/dev/null | grep -q "wapt ${WAPT_REF#v}"; then
    echo "wapt ${WAPT_REF} already installed"
    exit 0
fi

echo "Installing wapt ${WAPT_REF}..."
uv tool install \
    "git+${WAPT_REPO}@${WAPT_REF}#subdirectory=${WAPT_SUBDIR}" \
    --python 3.12

# Ensure PATH is configured (no-op if already done)
uv tool update-shell || true

echo "Done. Run: wapt --help"
```

---

## Gotchas

- **Windows copies, not symlinks**: upgrading a tool does not automatically replace a running process. Restart any shell or subprocess that cached the old binary path.
- **`--editable` + git installs don't mix**: `--editable` requires a local path. You cannot use `--editable` with a `git+` URL.
- **Extras are not preserved on upgrade**: `uv tool upgrade wapt` installs the base package only. Re-run with extras: `uv tool install "wapt[ops,ui]"` to upgrade and keep extras.
- **`uv_build` backend** (shown in `uv init` output since 0.11.7) is uv's own minimal build backend — equivalent to hatchling for pure-Python projects. Either works; hatchling has broader ecosystem support and documentation.
- **Subdirectory fragment syntax**: the `#subdirectory=` fragment is a uv/pip extension, not a standard URL fragment. It tells uv where inside the repo the `pyproject.toml` lives.
- **Python version discovery for tools**: uv ignores `.python-version` files and `requires-python` from `pyproject.toml` when selecting the Python interpreter for a tool venv. Always pass `--python 3.12` explicitly if it matters.

---

## External Links

- [uv Tools concept docs](https://docs.astral.sh/uv/concepts/tools/)
- [uv Using Tools guide](https://docs.astral.sh/uv/guides/tools/)
- [uv Storage reference — PATH locations](https://docs.astral.sh/uv/reference/storage/)
- [uv CLI reference](https://docs.astral.sh/uv/reference/cli/)
- [uv GitHub releases](https://github.com/astral-sh/uv/releases)
- [Packaging CLI apps with uv — thisDaveJ](https://thisdavej.com/packaging-python-command-line-apps-the-modern-way-with-uv/)
