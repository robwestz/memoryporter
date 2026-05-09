"""Lightweight contract validation against Caddy Admin API.

Strategy: instead of pinning the full JSON schema, we snapshot the
top-level structural keys of `GET /config/` and verify those keys are
still present on the live Caddy instance. This catches breaking
restructures without producing noise on minor additions.

Snapshot file (committed): `tests/fixtures/caddy_schema_snapshot.json`:
    {
      "caddy_version": "2.11.2",
      "top_level_keys": ["admin", "apps", "logging", "storage"],
      "apps_keys": ["http", "tls"]
    }

`top_level_keys` and `apps_keys` are the contract — those are the names
wapt depends on. Anything else in the live response is fine.
"""
from __future__ import annotations

import json
from pathlib import Path

import httpx

from wapt.doctor_command import CheckResult

DEFAULT_SNAPSHOT_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "tests"
    / "fixtures"
    / "caddy_schema_snapshot.json"
)


def load_snapshot(path: Path = DEFAULT_SNAPSHOT_PATH) -> dict:
    """Read the committed snapshot from disk."""
    if not path.exists():
        raise FileNotFoundError(f"Snapshot file not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def validate_admin_api_schema(
    admin_url: str = "http://localhost:2019",
    snapshot_path: Path = DEFAULT_SNAPSHOT_PATH,
    *,
    timeout: float = 5.0,
) -> CheckResult:
    """Compare structural keys of live `/config/` against the snapshot.

    Severity outcomes:
        info     — all expected keys present
        warning  — Caddy unreachable or non-200 (skip, don't fail)
        error    — keys missing → contract drift
    """
    try:
        snapshot = load_snapshot(snapshot_path)
    except FileNotFoundError as exc:
        return CheckResult(
            name="admin_api_contract",
            ok=False,
            severity="error",
            message=str(exc),
        )

    try:
        resp = httpx.get(f"{admin_url.rstrip('/')}/config/", timeout=timeout)
    except httpx.RequestError as exc:
        return CheckResult(
            name="admin_api_contract",
            ok=False,
            severity="warning",
            message=f"Caddy unreachable at {admin_url}: {exc}",
        )

    if resp.status_code != 200:
        return CheckResult(
            name="admin_api_contract",
            ok=False,
            severity="warning",
            message=f"GET /config/ returned HTTP {resp.status_code}",
        )

    try:
        live = resp.json() or {}
    except ValueError as exc:
        return CheckResult(
            name="admin_api_contract",
            ok=False,
            severity="error",
            message=f"Admin API returned non-JSON: {exc}",
        )

    return _compare(snapshot, live)


def fetch_schema_snapshot(
    admin_url: str = "http://localhost:2019", *, timeout: float = 5.0
) -> dict:
    """Build a fresh snapshot from a live Caddy.

    Used to update `caddy_schema_snapshot.json` when Caddy releases a new
    version that legitimately reshapes the config tree.
    """
    resp = httpx.get(f"{admin_url.rstrip('/')}/config/", timeout=timeout)
    resp.raise_for_status()
    config = resp.json() or {}
    server_header = resp.headers.get("server", "")
    version = (
        server_header.split("/", 1)[1].split(" ", 1)[0]
        if "/" in server_header
        else "unknown"
    )
    return {
        "caddy_version": version,
        "top_level_keys": sorted(config.keys()),
        "apps_keys": sorted((config.get("apps") or {}).keys()),
    }


def _compare(snapshot: dict, live: dict) -> CheckResult:
    """Pure key-set comparison; no value comparison."""
    expected_top = set(snapshot.get("top_level_keys", []))
    live_top = set(live.keys())
    missing_top = expected_top - live_top

    expected_apps = set(snapshot.get("apps_keys", []))
    live_apps = set((live.get("apps") or {}).keys())
    missing_apps = expected_apps - live_apps

    if missing_top or missing_apps:
        parts = []
        if missing_top:
            parts.append(f"top-level missing: {sorted(missing_top)}")
        if missing_apps:
            parts.append(f"apps missing: {sorted(missing_apps)}")
        return CheckResult(
            name="admin_api_contract",
            ok=False,
            severity="error",
            message="Caddy Admin API contract drift — " + "; ".join(parts),
        )

    return CheckResult(
        name="admin_api_contract",
        ok=True,
        severity="info",
        message=(
            f"Contract OK (snapshot v{snapshot.get('caddy_version', '?')}, "
            f"{len(expected_top)} top-level keys)"
        ),
    )


__all__ = [
    "DEFAULT_SNAPSHOT_PATH",
    "fetch_schema_snapshot",
    "load_snapshot",
    "validate_admin_api_schema",
]
