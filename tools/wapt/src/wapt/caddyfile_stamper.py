"""Jinja2-based Caddyfile renderer.

The stamper turns a `SiteEntry` plus a template name into a Caddyfile
fragment, then writes it to `sites-enabled/<name>.caddy` so Caddy can
import it.

Caddyfile is not HTML — autoescape is OFF. Instead we sanitise path
and domain inputs ourselves so callers cannot push newlines or
unbalanced braces through the template.

Path handling: every path in rendered output uses forward slashes
(`Path.as_posix()`). Caddy on Windows accepts forward slashes; mixing
backslashes and braces is a recipe for parse errors.
"""
from __future__ import annotations

from pathlib import Path

from jinja2 import (
    ChoiceLoader,
    Environment,
    FileSystemLoader,
    StrictUndefined,
    TemplateNotFound,
    select_autoescape,
)
from jinja2.exceptions import TemplateError as Jinja2TemplateError

from wapt.config_validation import SiteEntry
from wapt.error_library import TemplateError


def _sanitize_path(value: str) -> str:
    """Reject paths with control characters or Caddyfile metacharacters."""
    if not value:
        raise ValueError("path is empty")
    bad = {"\n", "\r", "\t", "{", "}"}
    if any(ch in value for ch in bad):
        raise ValueError(f"path contains forbidden character: {value!r}")
    return value


def _sanitize_domain(value: str) -> str:
    """Allow only lowercase domain characters; reject anything else."""
    if not value:
        raise ValueError("domain is empty")
    allowed = set("abcdefghijklmnopqrstuvwxyz0123456789.-")
    if not set(value) <= allowed:
        raise ValueError(f"domain contains forbidden character: {value!r}")
    return value


class CaddyfileStamper:
    """Render and persist per-site Caddyfile fragments."""

    def __init__(
        self,
        templates_dir: Path,
        sites_enabled_dir: Path,
        certs_dir: Path,
        logs_dir: Path,
    ) -> None:
        self.templates_dir = templates_dir
        self.sites_enabled_dir = sites_enabled_dir
        self.certs_dir = certs_dir
        self.logs_dir = logs_dir
        self.env = Environment(
            loader=ChoiceLoader([FileSystemLoader(str(templates_dir))]),
            autoescape=select_autoescape(default=False),
            undefined=StrictUndefined,
            trim_blocks=True,
            lstrip_blocks=True,
            keep_trailing_newline=True,
        )
        self.env.filters["sanitize_path"] = _sanitize_path
        self.env.filters["sanitize_domain"] = _sanitize_domain

    def stamp(self, entry: SiteEntry, template_name: str | None = None) -> str:
        """Render a Caddyfile fragment for *entry*. Does not touch disk."""
        name = template_name or entry.template
        try:
            template = self.env.get_template(f"{name}.caddy")
        except TemplateNotFound as exc:
            raise TemplateError(
                f"Template '{name}.caddy' not found in {self.templates_dir}"
            ) from exc

        cert_path, key_path = self._cert_paths(entry)
        context = {
            "name": entry.name,
            "domain": _sanitize_domain(entry.domain),
            "root": _sanitize_path(self._as_posix(entry.root)),
            "cert_path": _sanitize_path(self._as_posix(cert_path)),
            "key_path": _sanitize_path(self._as_posix(key_path)),
            "log_path": _sanitize_path(self._as_posix(self._log_path(entry))),
        }

        try:
            return template.render(**context)
        except Jinja2TemplateError as exc:
            raise TemplateError(
                f"Failed to render template '{name}' for site '{entry.name}': {exc}"
            ) from exc

    def write_site_caddyfile(
        self, entry: SiteEntry, template_name: str | None = None
    ) -> Path:
        """Render and write `sites-enabled/<name>.caddy`. Returns the path."""
        rendered = self.stamp(entry, template_name=template_name)
        self.sites_enabled_dir.mkdir(parents=True, exist_ok=True)
        out_path = self.sites_enabled_dir / f"{entry.name}.caddy"
        out_path.write_text(rendered, encoding="utf-8", newline="\n")
        return out_path

    def remove_site_caddyfile(self, name: str) -> bool:
        """Delete `sites-enabled/<name>.caddy`. Returns True if it existed."""
        path = self.sites_enabled_dir / f"{name}.caddy"
        if not path.exists():
            return False
        path.unlink()
        return True

    # ------------------------------------------------------------------
    # Path derivation
    # ------------------------------------------------------------------

    def _cert_paths(self, entry: SiteEntry) -> tuple[Path, Path]:
        return (
            self.certs_dir / f"{entry.domain}.pem",
            self.certs_dir / f"{entry.domain}-key.pem",
        )

    def _log_path(self, entry: SiteEntry) -> Path:
        return self.logs_dir / f"{entry.name}.log"

    @staticmethod
    def _as_posix(value: Path | str) -> str:
        return Path(value).as_posix()


__all__ = ["CaddyfileStamper"]
