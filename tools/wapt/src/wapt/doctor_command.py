"""`wapt doctor` — pre-flight system checks.

Each check returns a `CheckResult`. Aggregator returns 0 if every
required check passes, 1 if any error-severity check fails.
Warnings do not affect exit code.

Checks (canonical order):
    caddy_installed         — `caddy` on PATH (error if missing)
    mkcert_installed        — `mkcert` on PATH (error if missing)
    mkcert_ca_installed     — rootCA.pem present (error if missing)
    caddy_running           — admin endpoint reachable (warning if not)
    port_2019_free          — port 2019 available or owned by Caddy (warning)
    port_443_free           — same for 443 (warning)
    cert_expiry             — every site cert has >30 days left (warning)
    registry_integrity      — registry loads cleanly (error if corrupt)
"""
from __future__ import annotations

import socket
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Literal

from wapt.caddy_wrapper import CaddyWrapper, caddy_available
from wapt.config_validation import WaptConfig
from wapt.error_library import CertExpired, MkcertNotFound, RegistryCorrupt
from wapt.mkcert_integration import (
    check_expiry,
    install_ca_check,
    is_near_expiry,
    mkcert_binary,
)
from wapt.site_registry import SiteRegistry

Severity = Literal["info", "warning", "error"]


@dataclass
class CheckResult:
    name: str
    ok: bool
    severity: Severity
    message: str

    def to_dict(self) -> dict:
        return asdict(self)


def _ok(name: str, message: str) -> CheckResult:
    return CheckResult(name=name, ok=True, severity="info", message=message)


def _warn(name: str, message: str) -> CheckResult:
    return CheckResult(name=name, ok=False, severity="warning", message=message)


def _err(name: str, message: str) -> CheckResult:
    return CheckResult(name=name, ok=False, severity="error", message=message)


# ---------------------------------------------------------------------------
# Individual checks
# ---------------------------------------------------------------------------


def check_caddy_installed() -> CheckResult:
    if caddy_available():
        return _ok("caddy_installed", "Caddy binary found in PATH")
    return _err(
        "caddy_installed",
        "Caddy binary not in PATH. Install: scoop install caddy",
    )


def check_mkcert_installed() -> CheckResult:
    try:
        mkcert_binary()
    except MkcertNotFound as exc:
        return _err("mkcert_installed", str(exc))
    return _ok("mkcert_installed", "mkcert binary found in PATH")


def check_mkcert_ca_installed() -> CheckResult:
    info = install_ca_check()
    if info["ok"]:
        return _ok("mkcert_ca_installed", info["message"])
    return _err("mkcert_ca_installed", info["message"])


def check_caddy_running(
    admin_url: str, caddyfile: Path, binary_path: str
) -> CheckResult:
    wrapper = CaddyWrapper(
        caddyfile=caddyfile, admin_url=admin_url, binary_path=binary_path
    )
    status = wrapper.status()
    if status["running"]:
        ver = status.get("version") or "unknown"
        return _ok("caddy_running", f"Caddy {ver} reachable at {admin_url}")
    return _warn(
        "caddy_running",
        f"Caddy not reachable at {admin_url}: {status.get('error', 'unknown')}",
    )


def check_port_free(port: int, *, host: str = "127.0.0.1") -> CheckResult:
    """Try to bind to a port; if it fails, the port is in use."""
    name = f"port_{port}_free"
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind((host, port))
    except OSError as exc:
        # Port in use — informational. Caddy itself uses 443 + 2019.
        return _warn(name, f"Port {port} in use ({exc.strerror or exc}). May be Caddy.")
    return _ok(name, f"Port {port} is free")


def check_cert_expiry(registry: SiteRegistry, certs_dir: Path) -> CheckResult:
    """Warn if any site cert expires within 30 days."""
    near = []
    for entry in registry.list_sites():
        cert = certs_dir / f"{entry.domain}.pem"
        if not cert.exists():
            near.append(f"{entry.name}: cert file missing")
            continue
        try:
            if is_near_expiry(cert, threshold_days=30):
                remaining = check_expiry(cert)
                near.append(f"{entry.name}: {remaining.days}d left")
        except CertExpired as exc:
            near.append(f"{entry.name}: {exc}")
    if not near:
        return _ok("cert_expiry", "All certs valid for >30 days")
    return _warn("cert_expiry", "; ".join(near))


def check_registry_integrity(registry: SiteRegistry) -> CheckResult:
    try:
        sites = registry.list_sites()
    except RegistryCorrupt as exc:
        return _err("registry_integrity", str(exc))
    return _ok("registry_integrity", f"Registry loads cleanly ({len(sites)} sites)")


# ---------------------------------------------------------------------------
# Aggregator
# ---------------------------------------------------------------------------


def run_all_checks(
    config: WaptConfig,
    caddyfile: Path,
    registry_path: Path,
    certs_dir: Path,
) -> list[CheckResult]:
    """Run every check in canonical order."""
    registry = SiteRegistry(registry_path)
    return [
        check_caddy_installed(),
        check_mkcert_installed(),
        check_mkcert_ca_installed(),
        check_caddy_running(
            admin_url=config.caddy.admin_url,
            caddyfile=caddyfile,
            binary_path=config.caddy.binary_path,
        ),
        check_port_free(2019),
        check_port_free(443),
        check_cert_expiry(registry, certs_dir),
        check_registry_integrity(registry),
    ]


def overall_exit_code(results: list[CheckResult]) -> int:
    """0 if no errors, 1 if any error-severity check failed."""
    return 1 if any(r.severity == "error" and not r.ok for r in results) else 0


__all__ = [
    "CheckResult",
    "Severity",
    "check_caddy_installed",
    "check_caddy_running",
    "check_cert_expiry",
    "check_mkcert_ca_installed",
    "check_mkcert_installed",
    "check_port_free",
    "check_registry_integrity",
    "overall_exit_code",
    "run_all_checks",
]
