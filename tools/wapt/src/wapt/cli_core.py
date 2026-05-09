"""wapt CLI — Typer application.

Wave F: stubs replaced with real wiring through registry / stamper /
caddy_wrapper / mkcert_integration. Every command:
    1. Loads (or creates) `~/.wapt/config.toml`
    2. Translates config → resolved runtime paths
    3. Calls the relevant module
    4. Handles WaptError → formatted message + non-zero exit
    5. Optionally renders output as JSON if `--json` was passed
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Annotated, Optional

import typer

from wapt.caddy_wrapper import CaddyWrapper
from wapt.caddyfile_stamper import CaddyfileStamper
from wapt.config_validation import (
    SiteEntry,
    WaptConfig,
    default_config,
    load_config,
    utc_now_iso,
    write_config,
)
from wapt.error_library import (
    DomainInvalid,
    InvalidConfig,
    PathNotAbsolute,
    WaptError,
)
from wapt.mkcert_integration import ensure_cert
from wapt.site_registry import SiteRegistry

app = typer.Typer(
    name="wapt",
    help="Caddy + mkcert wrapper for local HTTPS development.",
    no_args_is_help=True,
    rich_markup_mode="rich",
)

DEFAULT_CONFIG_PATH = Path.home() / ".wapt" / "config.toml"

_CTX_KEY = "json_output"


# ---------------------------------------------------------------------------
# Root callback / error helpers
# ---------------------------------------------------------------------------


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
    return bool((ctx.obj or {}).get(_CTX_KEY, False))


def _handle_wapt_error(err: WaptError) -> None:
    typer.echo(f"Error: {err}", err=True)
    raise typer.Exit(code=err.code)


# ---------------------------------------------------------------------------
# Runtime path resolution
# ---------------------------------------------------------------------------


@dataclass
class RuntimePaths:
    config_path: Path
    caddyfile: Path
    sites_enabled: Path
    registry: Path
    certs_dir: Path
    logs_dir: Path
    templates_dir: Path


def _expand(s: str) -> Path:
    return Path(s).expanduser()


def _templates_dir() -> Path:
    """Locate the bundled templates directory.

    Order:
      1. Sibling `templates` next to the package (installed wheel via
         hatch force-include).
      2. Repo-relative `tools/wapt/templates` (editable / dev).
    """
    pkg = Path(__file__).resolve().parent
    candidate1 = pkg / "templates"
    if candidate1.is_dir():
        return candidate1
    # editable: src/wapt/cli_core.py → ../../templates
    candidate2 = pkg.parent.parent / "templates"
    if candidate2.is_dir():
        return candidate2
    raise InvalidConfig(
        f"Cannot locate templates directory (tried {candidate1}, {candidate2})"
    )


def _resolve_paths(config: WaptConfig, config_path: Path) -> RuntimePaths:
    caddyfile = _expand(config.paths.caddyfile)
    sites_enabled = _expand(config.paths.sites_enabled)
    registry = _expand(config.paths.registry)
    return RuntimePaths(
        config_path=config_path,
        caddyfile=caddyfile,
        sites_enabled=sites_enabled,
        registry=registry,
        certs_dir=caddyfile.parent / "certs",
        logs_dir=Path.home() / ".wapt" / "logs",
        templates_dir=_templates_dir(),
    )


def _load_or_die(config_path: Path) -> WaptConfig:
    if not config_path.exists():
        raise InvalidConfig(
            f"No config at {config_path}. Run 'wapt init' first."
        )
    return load_config(config_path)


# ---------------------------------------------------------------------------
# init
# ---------------------------------------------------------------------------


@app.command()
def init(
    ctx: typer.Context,
    force: Annotated[
        bool, typer.Option("--force", help="Overwrite existing config.")
    ] = False,
) -> None:
    """Initialise wapt: create ~/.wapt/config.toml with defaults."""
    use_json = _use_json(ctx)
    path = DEFAULT_CONFIG_PATH
    try:
        if path.exists() and not force:
            msg = f"Config already exists at {path}. Use --force to overwrite."
            if use_json:
                typer.echo(json.dumps({"status": "skipped", "path": str(path), "message": msg}))
            else:
                typer.echo(msg)
            raise typer.Exit(code=0)
        cfg = default_config()
        write_config(cfg, path)
    except WaptError as err:
        _handle_wapt_error(err)

    if use_json:
        typer.echo(json.dumps({"status": "ok", "path": str(path)}))
    else:
        typer.echo(f"wapt: wrote default config to {path}")


# ---------------------------------------------------------------------------
# add
# ---------------------------------------------------------------------------


@app.command()
def add(
    ctx: typer.Context,
    name: Annotated[str, typer.Argument(help="Short slug, e.g. myapp.")],
    path: Annotated[str, typer.Argument(help="Absolute path to the site root directory.")],
    domain: Annotated[
        Optional[str],
        typer.Option("--domain", "-d", help="Custom domain (default: <name>.localhost)."),
    ] = None,
    template: Annotated[
        str, typer.Option("--template", "-t", help="Caddyfile template name.")
    ] = "site",
    no_reload: Annotated[
        bool, typer.Option("--no-reload", help="Skip Caddy reload (offline use).")
    ] = False,
) -> None:
    """Add a local site: validate → cert → registry → stamp → reload."""
    use_json = _use_json(ctx)
    try:
        site_path = Path(path).expanduser()
        if not site_path.is_absolute():
            raise PathNotAbsolute(f"Site path must be absolute: {path}")
        if not site_path.exists():
            raise InvalidConfig(f"Site root does not exist: {site_path}")

        resolved_domain = (domain or f"{name}.localhost").lower()
        if not _looks_like_domain(resolved_domain):
            raise DomainInvalid(f"Invalid domain: {resolved_domain}")

        cfg = _load_or_die(DEFAULT_CONFIG_PATH)
        paths = _resolve_paths(cfg, DEFAULT_CONFIG_PATH)

        entry = SiteEntry(
            name=name,
            domain=resolved_domain,
            root=str(site_path),
            template=template,
            tls="mkcert",
            created_at=utc_now_iso(),
        )

        # 1. Cert
        ensure_cert(resolved_domain, paths.certs_dir)
        # 2. Registry
        registry = SiteRegistry(paths.registry)
        registry.add_site(entry)
        # 3. Stamp Caddyfile
        stamper = CaddyfileStamper(
            templates_dir=paths.templates_dir,
            sites_enabled_dir=paths.sites_enabled,
            certs_dir=paths.certs_dir,
            logs_dir=paths.logs_dir,
        )
        caddy_path = stamper.write_site_caddyfile(entry)
        # 4. Reload
        reloaded = False
        reload_msg = "skipped"
        if not no_reload:
            wrapper = CaddyWrapper(
                caddyfile=paths.caddyfile,
                admin_url=cfg.caddy.admin_url,
                binary_path=cfg.caddy.binary_path,
            )
            status = wrapper.status()
            if status["running"]:
                wrapper.reload()
                reloaded = True
                reload_msg = "reloaded"
            else:
                reload_msg = "caddy not running — start it manually"
    except WaptError as err:
        _handle_wapt_error(err)

    if use_json:
        typer.echo(
            json.dumps(
                {
                    "status": "ok",
                    "name": name,
                    "domain": resolved_domain,
                    "caddyfile": str(caddy_path),
                    "reloaded": reloaded,
                }
            )
        )
    else:
        typer.echo(f"wapt: added '{name}' → https://{resolved_domain} ({reload_msg})")


# ---------------------------------------------------------------------------
# remove
# ---------------------------------------------------------------------------


@app.command()
def remove(
    ctx: typer.Context,
    name: Annotated[str, typer.Argument(help="Site slug to remove.")],
    no_reload: Annotated[
        bool, typer.Option("--no-reload", help="Skip Caddy reload.")
    ] = False,
) -> None:
    """Remove a site: delete Caddyfile + registry entry + reload."""
    use_json = _use_json(ctx)
    try:
        cfg = _load_or_die(DEFAULT_CONFIG_PATH)
        paths = _resolve_paths(cfg, DEFAULT_CONFIG_PATH)
        registry = SiteRegistry(paths.registry)
        removed = registry.remove_site(name)
        stamper = CaddyfileStamper(
            templates_dir=paths.templates_dir,
            sites_enabled_dir=paths.sites_enabled,
            certs_dir=paths.certs_dir,
            logs_dir=paths.logs_dir,
        )
        stamper.remove_site_caddyfile(name)

        reloaded = False
        if not no_reload:
            wrapper = CaddyWrapper(
                caddyfile=paths.caddyfile,
                admin_url=cfg.caddy.admin_url,
                binary_path=cfg.caddy.binary_path,
            )
            if wrapper.status()["running"]:
                wrapper.reload()
                reloaded = True
    except WaptError as err:
        _handle_wapt_error(err)

    if use_json:
        typer.echo(
            json.dumps(
                {
                    "status": "ok",
                    "name": removed.name,
                    "domain": removed.domain,
                    "reloaded": reloaded,
                }
            )
        )
    else:
        typer.echo(f"wapt: removed '{name}'")


# ---------------------------------------------------------------------------
# list
# ---------------------------------------------------------------------------


@app.command(name="list")
def list_sites(ctx: typer.Context) -> None:
    """List all registered sites."""
    use_json = _use_json(ctx)
    try:
        cfg = _load_or_die(DEFAULT_CONFIG_PATH)
        paths = _resolve_paths(cfg, DEFAULT_CONFIG_PATH)
        registry = SiteRegistry(paths.registry)
        entries = registry.list_sites()
    except WaptError as err:
        _handle_wapt_error(err)

    if use_json:
        typer.echo(
            json.dumps({"sites": [e.model_dump() for e in entries]}, default=str)
        )
        return
    if not entries:
        typer.echo("No sites registered. Use 'wapt add <name> <path>' to add one.")
        return
    width = max(len(e.name) for e in entries)
    for e in entries:
        typer.echo(f"  {e.name.ljust(width)}  https://{e.domain}  →  {e.root}")


# ---------------------------------------------------------------------------
# health
# ---------------------------------------------------------------------------


@app.command()
def health(ctx: typer.Context) -> None:
    """Check whether Caddy is reachable via the Admin API."""
    use_json = _use_json(ctx)
    try:
        cfg = _load_or_die(DEFAULT_CONFIG_PATH)
        paths = _resolve_paths(cfg, DEFAULT_CONFIG_PATH)
        wrapper = CaddyWrapper(
            caddyfile=paths.caddyfile,
            admin_url=cfg.caddy.admin_url,
            binary_path=cfg.caddy.binary_path,
        )
        status = wrapper.status()
    except WaptError as err:
        _handle_wapt_error(err)

    if use_json:
        typer.echo(json.dumps(status))
    else:
        if status["running"]:
            ver = status.get("version") or "unknown"
            typer.echo(f"caddy: running ({ver}) at {status['admin_url']}")
        else:
            typer.echo(f"caddy: NOT running ({status.get('error', 'unknown')})")


# ---------------------------------------------------------------------------
# doctor (Phase 3 stub)
# ---------------------------------------------------------------------------


@app.command()
def doctor(ctx: typer.Context) -> None:
    """Run system health checks: caddy, mkcert, registry, config."""
    use_json = _use_json(ctx)
    checks = {"caddy": "skip", "mkcert": "skip", "registry": "skip"}
    if use_json:
        typer.echo(json.dumps({"status": "stub", "checks": checks}))
    else:
        typer.echo("wapt doctor: stub (Phase 3)")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _looks_like_domain(value: str) -> bool:
    if not value or " " in value or "/" in value or "\\" in value:
        return False
    if not all(c.isalnum() or c in ".-" for c in value):
        return False
    return "." in value
