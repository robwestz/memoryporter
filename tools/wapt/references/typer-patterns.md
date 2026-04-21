# Typer Patterns — Reference
> Last updated: 2026-04-21

## Version Pins

```toml
# pyproject.toml (verified April 2026)
typer = ">=0.24.1"      # latest as of 2026-02-21; requires Python >=3.10
rich = ">=13.7.0"       # bundled dep; provides panels, spinners, markup
click = ">=8.1.7"       # typer's underlying engine
shellingham = ">=1.5.0" # shell detection for completions

# Python requirement
python = ">=3.12"
```

> Since Typer 0.22.0 the `typer-slim` variant is identical to `typer` — install
> only `typer`. Disable Rich globally with `TYPER_USE_RICH=0` (env var).

---

## Best Practices

### App structure — single entry point

```python
# wapt/cli.py
from typing import Annotated
import typer

app = typer.Typer(
    name="wapt",
    help="Caddy + mkcert wrapper for local HTTPS dev.",
    no_args_is_help=True,   # print help when called with no args
    rich_markup_mode="rich",  # enables [bold], [green], etc. in help strings
)

if __name__ == "__main__":
    app()
```

### Subcommands with `app.add_typer()`

```python
# wapt/commands/site.py
import typer

site_app = typer.Typer(help="Manage local sites.")

@site_app.command("add")
def site_add(
    domain: Annotated[str, typer.Argument(help="Local domain, e.g. myapp.local")],
    port: Annotated[int, typer.Option("--port", "-p", help="Backend port")] = 3000,
) -> None:
    """Register a new local site and generate TLS cert."""
    typer.echo(f"Adding site {domain} → port {port}")

@site_app.command("remove")
def site_remove(
    domain: Annotated[str, typer.Argument(help="Domain to remove.")],
) -> None:
    """Remove a local site and revoke its cert."""
    typer.echo(f"Removing {domain}")
```

```python
# wapt/cli.py  (continued)
from wapt.commands.site import site_app

app.add_typer(site_app, name="site")
```

```
$ wapt site add myapp.local --port 8080
$ wapt site remove myapp.local
```

### Global `--json` flag via callback + context

The callback pattern lets a flag set state on the context object, which
subcommands read back without coupling.

```python
import json
import typer
from typing import Annotated

app = typer.Typer()

def json_callback(ctx: typer.Context, param: typer.CallbackParam, value: bool) -> bool:
    """Store --json flag on ctx.obj so all subcommands can read it."""
    if ctx.resilient_parsing:  # shell completion probe — return early
        return value
    ctx.ensure_object(dict)
    ctx.obj["json_output"] = value
    return value

@app.callback()
def main_callback(
    ctx: typer.Context,
    json_out: Annotated[
        bool,
        typer.Option(
            "--json",
            help="Output as JSON instead of human-readable text.",
            callback=json_callback,
            is_eager=True,
        ),
    ] = False,
) -> None:
    """wapt — local HTTPS dev proxy."""
    ctx.ensure_object(dict)

@app.command()
def status(ctx: typer.Context) -> None:
    """Show Caddy status."""
    use_json = ctx.obj.get("json_output", False)
    data = {"running": True, "pid": 12345}
    if use_json:
        import json
        typer.echo(json.dumps(data))
    else:
        typer.echo(f"Caddy running (PID {data['pid']})")
```

### Predictable exit codes

Always use `raise typer.Exit(code=N)` — never `sys.exit()`. Typer catches the
exception cleanly, flushes Rich output, and lets CliRunner capture it in tests.

```python
import typer

def require_caddy() -> None:
    import shutil
    if shutil.which("caddy") is None:
        typer.echo("ERROR: caddy not found in PATH. Install from caddyserver.com.", err=True)
        raise typer.Exit(code=1)

# Standard exit codes for wapt:
#   0 — success
#   1 — user/config error (missing file, bad argument)
#   2 — system error (caddy crashed, port in use)
#   3 — already running / not running (state mismatch)
```

### Progress bars and spinners with Rich

```python
import time
import typer
from rich.progress import Progress, SpinnerColumn, TextColumn, track

@app.command()
def generate_certs(
    domains: Annotated[list[str], typer.Argument(help="Domains to certify.")],
) -> None:
    """Generate mkcert TLS certificates for one or more domains."""
    # Determinate progress — known number of items
    for domain in track(domains, description="Generating certs..."):
        time.sleep(0.5)  # replace with actual mkcert call
        typer.echo(f"  [green]✓[/green] {domain}")

@app.command()
def start() -> None:
    """Start Caddy in the background."""
    # Indeterminate spinner — duration unknown
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,  # spinner disappears on completion
    ) as progress:
        progress.add_task("Starting Caddy...", total=None)
        time.sleep(2)   # replace with actual subprocess wait
    typer.echo("[green]Caddy started.[/green]")
```

### Help text best practices

```python
@app.command()
def add(
    domain: Annotated[
        str,
        typer.Argument(
            help="Local domain name, e.g. [bold]myapp.local[/bold]. "
                 "Must end in .local or .test.",
            metavar="DOMAIN",
        ),
    ],
    port: Annotated[
        int,
        typer.Option(
            "--port", "-p",
            help="Backend port that Caddy will reverse-proxy to.",
            min=1,
            max=65535,
        ),
    ] = 3000,
    tls: Annotated[
        bool,
        typer.Option("--tls/--no-tls", help="Generate mkcert certificate."),
    ] = True,
) -> None:
    """Add a new local site to the Caddy configuration.

    [bold]Example:[/bold]

        wapt add myapp.local --port 8080
    """
```

### Error handling — informative messages with remediation text

```python
import typer

def handle_config_error(path: str, detail: str) -> None:
    """Print structured error and exit 1."""
    typer.echo(f"\n[bold red]Configuration error[/bold red]", err=True)
    typer.echo(f"  File : {path}", err=True)
    typer.echo(f"  Error: {detail}", err=True)
    typer.echo(f"\n[dim]Run [bold]wapt init[/bold] to create a default config.[/dim]", err=True)
    raise typer.Exit(code=1)
```

---

## Python 3.12 Examples

### Annotated type hints (canonical form since Typer 0.9+)

```python
# Python 3.12 — use Annotated everywhere, no bare defaults
from typing import Annotated
import typer

@app.command()
def deploy(
    env: Annotated[str, typer.Option(help="Target environment.")] = "dev",
    dry_run: Annotated[bool, typer.Option("--dry-run", help="Preview changes.")] = False,
    targets: Annotated[list[str], typer.Argument(help="Domains to deploy.")] = [],
) -> None: ...

# Python 3.12 type alias (PEP 695) — can be used in type hints passed to Annotated
type DomainList = list[str]
```

### `typer.Option` with `show_default` and `envvar`

```python
@app.command()
def start(
    config: Annotated[
        str,
        typer.Option(
            "--config", "-c",
            help="Path to wapt.toml.",
            envvar="WAPT_CONFIG",      # reads from env if not passed
            show_default=True,
        ),
    ] = "wapt.toml",
) -> None: ...
```

---

## Testing Typer Apps — `CliRunner`

```python
# tests/test_cli.py
import pytest
from typer.testing import CliRunner
from wapt.cli import app

runner = CliRunner()

def test_status_success():
    result = runner.invoke(app, ["status"])
    assert result.exit_code == 0
    assert "running" in result.output.lower()

def test_status_json():
    result = runner.invoke(app, ["--json", "status"])
    import json
    data = json.loads(result.output)
    assert "running" in data

def test_add_missing_caddy(monkeypatch):
    """Simulate caddy not in PATH — expect exit code 1."""
    import shutil
    monkeypatch.setattr(shutil, "which", lambda _: None)
    result = runner.invoke(app, ["site", "add", "myapp.local"])
    assert result.exit_code == 1
    assert "caddy" in result.output.lower()

def test_add_prompts(tmp_path):
    """Test interactive prompt with simulated input."""
    result = runner.invoke(app, ["site", "add"], input="myapp.local\n3000\n")
    assert result.exit_code == 0

def test_mix_stderr():
    """Capture stderr separately (CliRunner default: mix_stderr=True)."""
    runner_sep = CliRunner(mix_stderr=False)
    result = runner_sep.invoke(app, ["bad-command"])
    # result.stdout and result.stderr are now separate streams
    assert result.exit_code != 0
```

> `CliRunner` does **not** spawn a subprocess — it runs Typer in-process, so
> tests are fast and importable without side effects.

---

## Windows Gotchas

- **Shell completion on Windows**: Typer + Shellingham works on PowerShell and
  CMD. For `uv tool install` installations, completion must be set up separately
  via `wapt --install-completion`.
- **Rich on Windows**: Rich uses `ANSI` sequences; Windows Terminal (WT) and
  modern conhost support them. For legacy CMD, Rich auto-detects and falls back
  to plain text.
- **TYPER_USE_RICH=0**: Set this env var to disable all Rich output in
  non-interactive contexts (CI, scripts that parse stdout).
- **`typer.echo()` vs `print()`**: Prefer `typer.echo()` — it handles
  encoding correctly on Windows (`cp1252` vs `utf-8`). Use `err=True` to
  write to stderr.
- **Exit codes**: Windows treats any non-zero return as an error. Be explicit —
  never let exceptions bubble up to the top level; catch and `raise typer.Exit(1)`.

---

## External Links

- [Typer docs — typer.tiangolo.com](https://typer.tiangolo.com/)
- [Typer release notes](https://typer.tiangolo.com/release-notes/)
- [Typer on PyPI](https://pypi.org/project/typer/)
- [Click docs (Typer's foundation)](https://click.palletsprojects.com/)
- [Rich docs — progress display](https://rich.readthedocs.io/en/stable/progress.html)
- [Testing — typer.tiangolo.com/tutorial/testing/](https://typer.tiangolo.com/tutorial/testing/)
