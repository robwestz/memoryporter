"""mkcert wrapper: install-check, cert generation, expiry inspection.

mkcert is the source of truth for local TLS. wapt does not roll its own
CA, parse PEM, or shell out to OpenSSL except for the `-enddate` query —
every other operation goes through the `mkcert` binary, which knows
about every platform's trust store.

Cert lifecycle:
    install_ca_check()        — verify mkcert -install was already run
    ensure_cert(domain, dir)  — generate <domain>.pem + <domain>-key.pem if missing
    check_expiry(cert_path)   — parse PEM notAfter; warn at <30 days

Windows note: mkcert is shimmed by Scoop into ~/scoop/shims/mkcert.exe.
`shutil.which` resolves it transparently. If PATH is not set, fail fast
with a clear MkcertNotFound action string.
"""
from __future__ import annotations

import datetime as _dt
import shutil
import subprocess
from pathlib import Path

from wapt.error_library import CertExpired, MkcertNotFound

_CAROOT_SUBPATHS = ("rootCA.pem", "rootCA-key.pem")


def mkcert_binary() -> str:
    """Resolve `mkcert` on PATH or raise MkcertNotFound."""
    found = shutil.which("mkcert")
    if not found:
        raise MkcertNotFound(
            "mkcert binary not found in PATH. Install with: scoop install mkcert"
        )
    return found


def caroot() -> Path:
    """Return mkcert's CAROOT directory (where rootCA.pem lives)."""
    result = subprocess.run(
        [mkcert_binary(), "-CAROOT"],
        capture_output=True,
        text=True,
        timeout=10,
        encoding="utf-8",
    )
    if result.returncode != 0:
        raise MkcertNotFound(
            f"mkcert -CAROOT failed (exit {result.returncode}): "
            f"{result.stderr.strip() or result.stdout.strip()}"
        )
    return Path(result.stdout.strip())


def install_ca_check() -> dict:
    """Verify the mkcert root CA exists on disk.

    Returns a dict: {ok: bool, caroot: Path | None, message: str}.
    Does not run `mkcert -install` — just checks the artifacts.
    """
    try:
        root = caroot()
    except MkcertNotFound as exc:
        return {"ok": False, "caroot": None, "message": str(exc)}

    missing = [name for name in _CAROOT_SUBPATHS if not (root / name).exists()]
    if missing:
        return {
            "ok": False,
            "caroot": root,
            "message": (
                f"Root CA files missing in {root}: {', '.join(missing)}. "
                f"Run: mkcert -install"
            ),
        }
    return {"ok": True, "caroot": root, "message": "Root CA installed"}


def ensure_cert(domain: str, certs_dir: Path) -> tuple[Path, Path]:
    """Return (cert_path, key_path), generating them via mkcert if absent."""
    certs_dir.mkdir(parents=True, exist_ok=True)
    cert_path = certs_dir / f"{domain}.pem"
    key_path = certs_dir / f"{domain}-key.pem"

    if cert_path.exists() and key_path.exists():
        return cert_path, key_path

    cmd = [
        mkcert_binary(),
        "-cert-file",
        str(cert_path),
        "-key-file",
        str(key_path),
        domain,
    ]
    result = subprocess.run(
        cmd, capture_output=True, text=True, timeout=30, encoding="utf-8"
    )
    if result.returncode != 0:
        raise MkcertNotFound(
            f"mkcert failed for '{domain}' (exit {result.returncode}): "
            f"{result.stderr.strip() or result.stdout.strip()}"
        )
    return cert_path, key_path


def check_expiry(cert_path: Path) -> _dt.timedelta:
    """Return how long until the cert expires.

    Uses `openssl x509 -enddate -noout`. If openssl is not available,
    returns a sentinel timedelta of 999 days (caller treats as "skip").
    A negative timedelta indicates the cert is already expired.
    """
    if not cert_path.exists():
        raise CertExpired(f"Certificate file not found: {cert_path}")

    openssl = shutil.which("openssl")
    if openssl is None:
        return _dt.timedelta(days=999)

    result = subprocess.run(
        [openssl, "x509", "-enddate", "-noout", "-in", str(cert_path)],
        capture_output=True,
        text=True,
        timeout=10,
        encoding="utf-8",
    )
    if result.returncode != 0:
        raise CertExpired(
            f"Cannot read cert {cert_path}: {result.stderr.strip()}"
        )
    line = result.stdout.strip()
    if "=" not in line:
        raise CertExpired(f"Unexpected openssl output: {line!r}")
    date_str = line.split("=", 1)[1].strip()
    try:
        not_after = _dt.datetime.strptime(date_str, "%b %d %H:%M:%S %Y %Z")
    except ValueError as exc:
        raise CertExpired(f"Cannot parse cert date {date_str!r}: {exc}") from exc

    not_after = not_after.replace(tzinfo=_dt.timezone.utc)
    return not_after - _dt.datetime.now(_dt.timezone.utc)


def is_near_expiry(cert_path: Path, threshold_days: int = 30) -> bool:
    """True if the cert expires within `threshold_days`."""
    remaining = check_expiry(cert_path)
    return remaining.days < threshold_days


__all__ = [
    "caroot",
    "check_expiry",
    "ensure_cert",
    "install_ca_check",
    "is_near_expiry",
    "mkcert_binary",
]
