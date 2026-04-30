"""wapt CLI — Typer application with subcommand stubs.

Wave A: skeleton with init/add/remove/list/doctor/health stubs + --json flag.
Wave F: stubs replaced with full implementations.
"""
from __future__ import annotations

import json
import sys
from typing import Annotated, Optional

import typer

from wapt.error_library import WaptError

app = typer.Typer(
    name="wapt",
    help="Caddy + mkcert wrapper for local HTTPS development.",
    no_args_is_help=True,
    rich_markup_mode="rich",
)

# ---------------------------------------------------------------------------
# Global state container — populated by the root callback
# ---------------------------------------------------------------------------

_CTX_KEY = "json_output"


def _json_callback(
    ctx: typer.Context,
    param: typer.CallbackParam,  # noqa: ARG001
    value: bool,
) -> bool:
    if ctx.resilient_parsing:
        return value
    ctx.ensure_object(dict)
    ctx.obj[_CTX_KEY] = value
    return value


@app.callback()
def main(
    ctx: typer.Context,
    json_out: Annotated[
        bool,
        typer.Option(
            "--json",
            help="Output results as JSON instead of human-readable text.",
            callback=_json_callback,
            is_eager=True,
        ),
    ] = False,
) -> None:
    """wapt — manage local HTTPS sites via Caddy + mkcert."""
    ctx.ensure_object(dict)


def _use_json(ctx: typer.Context) -> bool:
    """Return True if --json was passed at the root level."""
    return bool((ctx.obj or {}).get(_CTX_KEY, False))


def _handle_wapt_error(err: WaptError) -> None:
    """Print a formatted error and exit with the error's code."""
    typer.echo(f"Error: {err}", err=True)
    raise typer.Exit(code=err.code)


# ---------------------------------------------------------------------------
# Subcommands
# ---------------------------------------------------------------------------

@app.command()
def init(
    ctx: typer.Context,
    force: Annotated[bool, typer.Option("--force", help="Overwrite existing config.")] = False,
) -> None:
    """Initialise wapt: create ~/.wapt/config.toml with defaults."""
    use_json = _use_json(ctx)
    result = {"status": "ok", "message": "init stub — not yet implemented"}
    if use_json:
        typer.echo(json.dumps(result))
    else:
        typer.echo("wapt init: stub (Wave F)")


@app.command()
def add(
    ctx: typer.Context,
    name: Annotated[str, typer.Argument(help="Short slug for the site, e.g. myapp")],
    path: Annotated[str, typer.Argument(help="Absolute path to the site root directory.")],
    domain: Annotated[
        Optional[str],
        typer.Option("--domain", "-d", help="Custom domain (default: <name>.localhost)."),
    ] = None,
    template: Annotated[str, typer.Option("--template", "-t", help="Caddyfile template name.")] = "site",
) -> None:
    """Add a new local site: validate -> registry -> mkcert -> stamp -> reload."""
    use_json = _use_json(ctx)
    result = {"status": "stub", "name": name, "path": path}
    if use_json:
        typer.echo(json.dumps(result))
    else:
        typer.echo(f"wapt add: stub — name={name}, path={path} (Wave F)")


@app.command()
def remove(
    ctx: typer.Context,
    name: Annotated[str, typer.Argument(help="Site slug to remove.")],
) -> None:
    """Remove a site: delete Caddyfile + registry entry + reload."""
    use_json = _use_json(ctx)
    result = {"status": "stub", "name": name}
    if use_json:
        typer.echo(json.dumps(result))
    else:
        typer.echo(f"wapt remove: stub — name={name} (Wave F)")


@app.command(name="list")
def list_sites(
    ctx: typer.Context,
) -> None:
    """List all registered sites."""
    use_json = _use_json(ctx)
    result: dict = {"sites": []}
    if use_json:
        typer.echo(json.dumps(result))
    else:
        typer.echo("No sites registered. (stub — Wave F)")


@app.command()
def doctor(
    ctx: typer.Context,
) -> None:
    """Run system health checks: caddy, mkcert, registry, config."""
    use_json = _use_json(ctx)
    checks = {"caddy": "skip", "mkcert": "skip", "registry": "skip"}
    if use_json:
        typer.echo(json.dumps({"status": "stub", "checks": checks}))
    else:
        typer.echo("wapt doctor: stub (Phase 3)")


@app.command()
def health(
    ctx: typer.Context,
) -> None:
    """Check whether Caddy is reachable via the Admin API."""
    use_json = _use_json(ctx)
    result = {"caddy_running": False, "note": "stub — Wave F"}
    if use_json:
        typer.echo(json.dumps(result))
    else:
        typer.echo("wapt health: stub (Wave F)")
