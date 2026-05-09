"""Caddy lifecycle wrapper: start, stop, reload, status, config_dump.

Two interfaces:

    1. Admin API (HTTP) — preferred for status and config_dump because
       it never spawns a subprocess.
    2. Binary CLI — preferred for start/stop/reload because Caddy's own
       client handles daemonisation, signal forwarding, and atomic
       reload-with-rollback for us.

Reload strategy:
    `caddy reload --config <Caddyfile>` is the documented way. Internally
    it talks to the Admin API and rolls back on failure. POST /load would
    require running `caddy adapt` first (Caddyfile → JSON), which is just
    more moving parts. Reload via binary is the primary path.

Windows: `caddy start` itself daemonises, so we never need DETACHED_PROCESS
flags here. The Caddy CLI handles that internally.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

import httpx

from wapt.error_library import AdminAPIError, CaddyNotFound, ReloadFailed


class CaddyWrapper:
    def __init__(
        self,
        caddyfile: Path,
        admin_url: str = "http://localhost:2019",
        binary_path: str = "auto",
    ) -> None:
        self.caddyfile = caddyfile
        self.admin_url = admin_url.rstrip("/")
        self._binary_path = binary_path

    # ------------------------------------------------------------------
    # Binary discovery
    # ------------------------------------------------------------------

    @property
    def binary(self) -> str:
        """Resolve the Caddy binary, raising CaddyNotFound if absent."""
        if self._binary_path != "auto":
            return self._binary_path
        found = shutil.which("caddy")
        if not found:
            raise CaddyNotFound(
                "Caddy binary not found in PATH. Install with: scoop install caddy"
            )
        return found

    # ------------------------------------------------------------------
    # Lifecycle commands (subprocess via binary)
    # ------------------------------------------------------------------

    def start(self, *, watch: bool = False) -> None:
        """Start Caddy in the background via `caddy start --config <path>`."""
        cmd = [self.binary, "start", "--config", str(self.caddyfile)]
        if watch:
            cmd.append("--watch")
        self._run(cmd, timeout=30, op="start")

    def stop(self) -> None:
        """Stop the running Caddy daemon via `caddy stop`."""
        self._run([self.binary, "stop"], timeout=15, op="stop")

    def reload(self) -> None:
        """Reload via `caddy reload --config <path>` (atomic, rolls back on failure)."""
        self._run(
            [self.binary, "reload", "--config", str(self.caddyfile)],
            timeout=30,
            op="reload",
        )

    def validate(self) -> None:
        """Validate the current Caddyfile without reloading."""
        self._run(
            [self.binary, "validate", "--config", str(self.caddyfile)],
            timeout=15,
            op="validate",
        )

    def _run(self, cmd: list[str], *, timeout: int, op: str) -> None:
        """Run a Caddy CLI command and raise ReloadFailed on non-zero exit."""
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout, encoding="utf-8"
        )
        if result.returncode != 0:
            raise ReloadFailed(
                f"caddy {op} failed (exit {result.returncode}): "
                f"{result.stderr.strip() or result.stdout.strip()}"
            )

    # ------------------------------------------------------------------
    # Read-only Admin API queries
    # ------------------------------------------------------------------

    def status(self, timeout: float = 2.0) -> dict:
        """Return Caddy's running state without raising on connection error.

        Keys: running (bool), admin_url (str), version (str | None), error (str | None).
        """
        try:
            resp = httpx.get(f"{self.admin_url}/config/", timeout=timeout)
        except httpx.RequestError as exc:
            return {
                "running": False,
                "admin_url": self.admin_url,
                "version": None,
                "error": str(exc),
            }
        version = self._extract_version(resp.headers.get("server"))
        return {
            "running": resp.status_code == 200,
            "admin_url": self.admin_url,
            "version": version,
            "error": None if resp.status_code == 200 else f"HTTP {resp.status_code}",
        }

    def config_dump(self, timeout: float = 5.0) -> dict:
        """Return the current Caddy config. Raises AdminAPIError on failure."""
        try:
            resp = httpx.get(f"{self.admin_url}/config/", timeout=timeout)
        except httpx.RequestError as exc:
            raise AdminAPIError(
                f"Cannot reach Caddy admin at {self.admin_url}: {exc}"
            ) from exc
        if resp.status_code != 200:
            raise AdminAPIError(
                f"GET /config/ returned HTTP {resp.status_code}: {resp.text[:200]}"
            )
        try:
            return resp.json() or {}
        except ValueError as exc:
            raise AdminAPIError(f"Admin API returned non-JSON: {exc}") from exc

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_version(server_header: str | None) -> str | None:
        """Pull the version string out of `Server: Caddy/2.11.2 windows amd64`."""
        if not server_header or "/" not in server_header:
            return None
        head = server_header.split("/", 1)[1]
        return head.split(" ", 1)[0].strip() or None


def caddy_available() -> bool:
    """True if a `caddy` binary is on PATH."""
    return shutil.which("caddy") is not None


__all__ = ["CaddyWrapper", "caddy_available"]
