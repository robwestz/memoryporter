# Rich tables — Reference
> Last updated: 2026-04-21

## Overview

Rich is a Python library for rich text and beautiful formatting in the terminal. Latest stable version as of 2026-04-21: **Rich 14.1.0**.

For `wapt`, Rich is an **opt-in extra** (`wapt[ui]`). All output code must handle the case where Rich is not installed and fall back to plain JSON on stdout. The canonical pattern: import Rich at module level inside a `try/except ImportError` block, set a `HAS_RICH` flag, and branch on it in every render function.

Key design constraints for wapt:
- `--json` flag → always plain JSON to stdout, regardless of Rich availability
- errors/warnings → `Console(stderr=True)` so stdout stays pipe-safe
- CI/server contexts → Rich auto-detects no TTY and disables color; no special handling needed

---

## Best Practices

- Use `Console(highlight=False)` when printing structured data (JSON, paths, URLs) — prevents Rich's auto-highlighter from mangling output
- Use `Console(stderr=True)` for all error and warning output — keeps stdout clean for `--json` consumers
- Never call `print()` directly in output modules — always route through the `Console` instance
- Test Rich output with `Console(record=True)` + `console.export_text()` — do not rely on `capsys` for Rich-rendered output
- Use `no_wrap=True` on columns that must not break (status codes, hostnames, timestamps)
- Prefer `justify="right"` for numeric columns (latency, count, size)
- For one-shot spinner feedback during async ops, use `console.status()` context manager rather than `Progress`
- Check `console.is_terminal` before expensive rendering logic if needed

---

## Version Pins

```
rich >= 14.0        # minimum for wapt[ui]
rich >= 14.1.0      # latest stable, recommended pin for development
```

---

## Core Classes

### Console
```python
from rich.console import Console

# Standard output — used for normal command results
console = Console(stderr=False, highlight=False)

# Error output — used for warnings, errors, debug info
err_console = Console(stderr=True, highlight=False)

# Recording — used in tests only
test_console = Console(record=True, width=120)
```

`Console` constructor options relevant to wapt:

| Parameter | Default | Use for wapt |
|-----------|---------|--------------|
| `stderr` | `False` | `True` for error/warning output |
| `highlight` | `True` | `False` for structured data output |
| `record` | `False` | `True` in tests only |
| `width` | auto | Set fixed width in tests for deterministic output |
| `color_system` | `"auto"` | Leave as auto — Rich detects Windows correctly |

### Table
```python
from rich.table import Table

table = Table(title="My Table", show_header=True, header_style="bold")
table.add_column("Name",    style="cyan",  no_wrap=True)
table.add_column("Status",  justify="center", no_wrap=True)
table.add_column("Detail")
table.add_column("Latency", justify="right", style="dim")

table.add_row("api.example.com", "[green]OK[/]",   "HTTP 200", "42ms")
table.add_row("db.example.com",  "[red]DOWN[/]",   "timeout",  "—")

console.print(table)
```

Table constructor options:

| Parameter | Effect |
|-----------|--------|
| `title` | Text above the table |
| `show_header` | Show column headers (default True) |
| `header_style` | Style string for header row |
| `box` | Border style — import from `rich.box` |
| `show_lines` | Horizontal lines between rows |
| `padding` | Cell padding tuple, default `(0, 1)` |

### Panel
```python
from rich.panel import Panel
from rich.text import Text

# Simple string panel
console.print(Panel("All checks passed", title="wapt doctor", style="green"))

# Panel with styled Text object
summary = Text()
summary.append("5 OK  ",      style="green")
summary.append("1 DEGRADED ", style="yellow")
summary.append("0 DOWN",      style="red")

console.print(Panel(summary, title="Summary", border_style="bold"))
```

### Status spinner (short operations)
```python
with console.status("[bold green]Checking services...", spinner="dots"):
    results = run_health_checks()   # blocking call

console.print("[green]Done.[/]")
```

### Progress (long operations with multiple tasks)
```python
from rich.progress import Progress, SpinnerColumn, TimeElapsedColumn

with Progress(
    SpinnerColumn(),
    *Progress.get_default_columns(),
    TimeElapsedColumn(),
    console=console,
) as progress:
    task = progress.add_task("Deploying...", total=len(services))
    for svc in services:
        deploy(svc)
        progress.advance(task)
```

---

## Status Indicators

Rich markup for standard wapt status values:

```python
STATUS_STYLE: dict[str, str] = {
    "ok":       "[green]OK[/]",
    "degraded": "[yellow]DEGRADED[/]",
    "down":     "[red]DOWN[/]",
    "unknown":  "[dim]UNKNOWN[/]",
    "skip":     "[blue]SKIP[/]",
}
```

These render correctly in Windows Terminal (true color), standard cmd.exe (16 colors), and CI environments (no color — auto-stripped by Rich when not a TTY).

---

## `--json` / Rich conditional pattern

```python
# src/wapt/output.py
from __future__ import annotations
import json
from typing import Any

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    _out = Console(stderr=False, highlight=False)
    _err = Console(stderr=True,  highlight=False)
    HAS_RICH = True
except ImportError:
    HAS_RICH = False


def render_or_json(data: Any, *, json_mode: bool, render_fn: Any) -> None:
    """Route to Rich renderer or JSON fallback."""
    if json_mode or not HAS_RICH:
        print(json.dumps(data, indent=2, default=str))
    else:
        render_fn(data)
```

---

## Windows-specific: terminal color support

Rich uses `color_system="auto"` by default, which correctly detects:
- **Windows Terminal** — full true color (24-bit)
- **cmd.exe on Windows 10+** — ANSI escape codes supported since 2018 update
- **cmd.exe legacy / CI without TTY** — Rich disables color automatically
- **ConEmu / cmder** — detected as true color

Force behavior when needed:
```python
# Force no color (e.g. testing plain output)
console = Console(color_system=None)

# Force true color (e.g. known capable terminal)
console = Console(color_system="truecolor")
```

`COLORTERM` env var: Rich reads it automatically. If `COLORTERM=truecolor` or `COLORTERM=24bit` is set, Rich enables 24-bit color.

`NO_COLOR` env var (https://no-color.org): Rich respects it — set `NO_COLOR=1` to strip all color output entirely.

---

## Testing Rich output

### With `Console(record=True)` + `export_text()` — recommended for Rich paths
```python
# tests/test_output.py
import json
from rich.console import Console
from wapt.output import print_health_table, HealthResult


def test_health_table_rich(monkeypatch):
    console = Console(record=True, width=120, highlight=False)
    monkeypatch.setattr("wapt.output._out", console)

    results = [
        HealthResult(name="api", status="ok",   detail="HTTP 200", latency_ms=42.0),
        HealthResult(name="db",  status="down", detail="timeout",  latency_ms=None),
    ]
    print_health_table(results, json_mode=False)

    text = console.export_text()
    assert "api" in text
    assert "OK" in text
    assert "DOWN" in text
    assert "timeout" in text


def test_health_table_json_fallback(capsys):
    results = [HealthResult(name="api", status="ok", detail="HTTP 200")]
    print_health_table(results, json_mode=True)

    captured = capsys.readouterr()
    data = json.loads(captured.out)
    assert data[0]["status"] == "ok"
    assert data[0]["name"] == "api"
```

### Notes on `capsys` vs `Console(record=True)`
- `capsys` works for `print()` calls and the JSON fallback path
- `capsys` does **not** capture Rich's console output when writing to a real stdout handle
- Always use `Console(record=True)` + `export_text()` for the Rich rendering path

---

## `@dataclass` + Rich table pattern

```python
# src/wapt/health.py
from __future__ import annotations
from dataclasses import dataclass


@dataclass
class ServiceCheck:
    name: str
    url: str
    status: str = "unknown"
    detail: str = ""
    latency_ms: float | None = None

    @property
    def is_healthy(self) -> bool:
        return self.status == "ok"


# src/wapt/output.py  (continued)
STATUS_STYLE = {
    "ok":       "[green]OK[/]",
    "degraded": "[yellow]DEGRADED[/]",
    "down":     "[red]DOWN[/]",
    "unknown":  "[dim]UNKNOWN[/]",
}


def render_service_table(checks: list[ServiceCheck]) -> None:
    """Render a Rich table from a list of ServiceCheck dataclasses."""
    table = Table(title="Service Health", show_header=True, header_style="bold")
    table.add_column("Service", style="cyan",    no_wrap=True)
    table.add_column("URL",     style="dim",     no_wrap=True)
    table.add_column("Status",  justify="center", no_wrap=True)
    table.add_column("Detail")
    table.add_column("Latency", justify="right",  style="dim")

    for c in checks:
        label = STATUS_STYLE.get(c.status, c.status)
        lat   = f"{c.latency_ms:.0f}ms" if c.latency_ms is not None else "—"
        table.add_row(c.name, c.url, label, c.detail, lat)

    _out.print(table)
```

---

## `wapt doctor` full output with Panel summary

```python
# src/wapt/commands/doctor.py
from __future__ import annotations
import json
from wapt.health import ServiceCheck, run_all_checks
from wapt.output import HAS_RICH, _out, render_service_table


def cmd_doctor(json_mode: bool = False) -> int:
    """Run all health checks and display results. Returns exit code."""
    checks = run_all_checks()

    if json_mode or not HAS_RICH:
        print(json.dumps(
            [
                {
                    "name": c.name,
                    "status": c.status,
                    "detail": c.detail,
                    "latency_ms": c.latency_ms,
                }
                for c in checks
            ],
            indent=2,
        ))
        return 0 if all(c.is_healthy for c in checks) else 1

    # Rich rendering path
    render_service_table(checks)

    ok       = sum(1 for c in checks if c.status == "ok")
    degraded = sum(1 for c in checks if c.status == "degraded")
    down     = sum(1 for c in checks if c.status == "down")

    from rich.panel import Panel
    from rich.text import Text

    summary = Text()
    summary.append(f"{ok} OK",        style="green")
    summary.append("  ")
    summary.append(f"{degraded} DEGRADED", style="yellow")
    summary.append("  ")
    summary.append(f"{down} DOWN",    style="red bold" if down else "red")

    border = "green" if down == 0 and degraded == 0 else ("yellow" if down == 0 else "red")
    _out.print(Panel(summary, title="wapt doctor", border_style=border))

    return 0 if down == 0 else 1
```

---

## Gotchas

- **`record=True` must be set at construction** — you cannot enable recording on an existing `Console` instance after the fact.
- **`export_text()` clears the buffer by default** (`clear=True`). Pass `clear=False` if you need to call it multiple times, or call it only once at the end.
- **`Console(highlight=False)` is critical for JSON output** — without it, Rich highlights numbers and strings inside JSON-like text with color markup, which breaks downstream `json.loads()`.
- **`Progress` and `Status` cannot be nested** — using both simultaneously causes rendering conflicts. Pick one per operation.
- **`NO_COLOR` env var is respected automatically** — do not implement your own `--no-color` flag unless you also disable programmatically via `Console(color_system=None)`.
- **`capsys` does not capture Rich output** on the Rich render path — always use `Console(record=True)` + `export_text()` for those tests.
- **`Panel` title is center-aligned** by default. Use `title_align="left"` for left-aligned titles.
- **Windows: tool executables are copied, not symlinked** — if wapt is installed as a `uv tool` and `rich` is absent from the venv (because `wapt[ui]` was not requested), the `ImportError` at runtime is the correct and expected failure mode. Do not catch it silently.

---

## External Links

- [Rich documentation — Introduction](https://rich.readthedocs.io/en/stable/introduction.html)
- [Rich — Console API](https://rich.readthedocs.io/en/stable/console.html)
- [Rich — Tables](https://rich.readthedocs.io/en/stable/tables.html)
- [Rich — Panel](https://rich.readthedocs.io/en/stable/panel.html)
- [Rich — Progress](https://rich.readthedocs.io/en/stable/progress.html)
- [Rich — Console Protocol (dataclass integration)](https://rich.readthedocs.io/en/stable/protocol.html)
- [Rich — Standard Colors reference](https://rich.readthedocs.io/en/stable/appendix/colors.html)
- [Rich on PyPI](https://pypi.org/project/rich/)
- [NO_COLOR standard](https://no-color.org)
- [Real Python — The Python Rich Package](https://realpython.com/python-rich-package/)
