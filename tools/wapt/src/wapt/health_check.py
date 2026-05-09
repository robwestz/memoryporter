"""Per-site health polling.

`wapt health` walks the registry and issues a HEAD request to each
registered site, classifying the result as OK / DEGRADED / DOWN.

Classification:
    OK         — 2xx response, latency < threshold (default 500ms)
    DEGRADED   — 2xx response, latency >= threshold; or 3xx redirect
    DOWN       — 4xx, 5xx, connection error, timeout

TLS verification is OFF by default. mkcert-issued certificates are valid
once the user-store CA is installed, but `verify=True` would fail any
test environment where the CA hasn't been trusted yet. Local-only
service: trusting the loopback we just talked to is acceptable.
"""
from __future__ import annotations

import time
from dataclasses import asdict, dataclass
from enum import Enum

import httpx

from wapt.config_validation import SiteEntry
from wapt.site_registry import SiteRegistry

DEFAULT_TIMEOUT = 5.0
DEGRADED_LATENCY_MS = 500.0


class HealthStatus(str, Enum):
    OK = "OK"
    DEGRADED = "DEGRADED"
    DOWN = "DOWN"


@dataclass
class HealthResult:
    name: str
    domain: str
    status: HealthStatus
    http_status: int | None
    latency_ms: float | None
    error: str | None

    def to_dict(self) -> dict:
        d = asdict(self)
        d["status"] = self.status.value
        return d


def check_site(
    entry: SiteEntry,
    *,
    timeout: float = DEFAULT_TIMEOUT,
    degraded_ms: float = DEGRADED_LATENCY_MS,
) -> HealthResult:
    """HEAD `https://<domain>/` and classify the response.

    No exception escapes this function — connection errors become
    HealthStatus.DOWN with the error message captured.
    """
    url = f"https://{entry.domain}/"
    start = time.perf_counter()
    try:
        resp = httpx.head(url, timeout=timeout, verify=False, follow_redirects=False)
    except httpx.TimeoutException as exc:
        return HealthResult(
            name=entry.name,
            domain=entry.domain,
            status=HealthStatus.DOWN,
            http_status=None,
            latency_ms=None,
            error=f"timeout: {exc}",
        )
    except httpx.RequestError as exc:
        return HealthResult(
            name=entry.name,
            domain=entry.domain,
            status=HealthStatus.DOWN,
            http_status=None,
            latency_ms=None,
            error=str(exc),
        )

    latency_ms = (time.perf_counter() - start) * 1000.0
    status = _classify(resp.status_code, latency_ms, degraded_ms)
    return HealthResult(
        name=entry.name,
        domain=entry.domain,
        status=status,
        http_status=resp.status_code,
        latency_ms=round(latency_ms, 1),
        error=None if resp.status_code < 400 else f"HTTP {resp.status_code}",
    )


def check_all_sites(
    registry: SiteRegistry,
    *,
    timeout: float = DEFAULT_TIMEOUT,
    degraded_ms: float = DEGRADED_LATENCY_MS,
) -> list[HealthResult]:
    """Poll every site in the registry sequentially, sorted by name."""
    return [
        check_site(entry, timeout=timeout, degraded_ms=degraded_ms)
        for entry in registry.list_sites()
    ]


def overall_exit_code(results: list[HealthResult]) -> int:
    """Aggregate exit code: 0 all OK, 1 any non-OK, 2 all DOWN."""
    if not results:
        return 0
    statuses = {r.status for r in results}
    if statuses == {HealthStatus.DOWN}:
        return 2
    if HealthStatus.DOWN in statuses or HealthStatus.DEGRADED in statuses:
        return 1
    return 0


def _classify(
    http_status: int, latency_ms: float, degraded_ms: float
) -> HealthStatus:
    if 200 <= http_status < 300:
        return HealthStatus.OK if latency_ms < degraded_ms else HealthStatus.DEGRADED
    if 300 <= http_status < 400:
        return HealthStatus.DEGRADED
    return HealthStatus.DOWN


__all__ = [
    "DEFAULT_TIMEOUT",
    "DEGRADED_LATENCY_MS",
    "HealthResult",
    "HealthStatus",
    "check_all_sites",
    "check_site",
    "overall_exit_code",
]
