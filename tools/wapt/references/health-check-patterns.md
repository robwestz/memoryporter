# Health Check Patterns — Reference
> Last updated: 2026-04-21

## Overview

wapt registrerar sajter och behöver kunna pollsa deras hälsostatus effektivt. Denna fil
dokumenterar mönster för HTTP-hälsokontroller mot registrerade sajter — med fokus på
async polling, timeout-hantering, statuskategorier och Rich-output.

**Primärt val: `httpx` med `asyncio`** — inte `requests` (synkron, en sajt i taget).

---

## httpx vs requests — Valet

| Egenskap | `httpx` | `requests` |
|----------|---------|-----------|
| Async-stöd | Inbyggt (`AsyncClient`) | Nej (kräver `requests-futures`) |
| HTTP/2 | Ja (med `[http2]` extra) | Nej |
| Timeout-granularitet | `connect` + `read` separat | Enda `timeout`-arg |
| HEAD-requests | Ja | Ja |
| Typ-hints | Fullständiga | Partiella |
| Parallell polling | `asyncio.gather()` native | Kräver threading |

För wapt: välj `httpx.AsyncClient` + `asyncio.gather()`. Sync-klienten (`httpx.Client`)
är OK för enstaka one-shot-anrop men skalar inte för batch-polling.

---

## Best Practices

### 1. Separata timeout-värden

Sätt alltid `connect_timeout` och `read_timeout` separat. Ett site kan acceptera
TCP-anslutningen omedelbart men hänga på att skicka svar (nginx upstream timeout).

```python
import httpx

TIMEOUT = httpx.Timeout(
    connect=3.0,   # max tid för TCP-handshake
    read=10.0,     # max tid för att läsa response body
    write=5.0,     # max tid för att skriva request
    pool=5.0,      # max tid för att hämta connection från pool
)
```

### 2. Använd HEAD, inte GET

HEAD-request returnerar headers utan body — snabbare, lägre bandbredd. Acceptabelt
för hälsokontroller om servern inte blockerar HEAD (vissa Nginx-konfigurationer gör det).
Fallback: GET med `stream=True` + omedelbar stängning.

### 3. Statuskategorier

```
2xx → OK          (200–299)
3xx → DEGRADED    (redirect — kan indikera felkonfiguration)
slow (>2s) → DEGRADED
4xx → DOWN        (klientfel — sajten lever men returnerar fel)
5xx → DOWN        (serverfel)
timeout → DOWN    (connect eller read timeout)
conn error → DOWN (DNS-fel, refused, SSL-fel)
```

### 4. TLS-verifiering — `verify=False` för mkcert lokalt

mkcert installerar ett lokalt CA i systemets trust store. Om `verify=True` (default)
och certifikatet är signerat av det lokala CA:t fungerar verifieringen korrekt på
den maskin där mkcert kördes.

**Rätt approach för wapt:**
- Produktion: `verify=True` alltid
- Lokala sajter med mkcert: `verify=True` om CA är installerat, annars `verify=False`
  med explicit logg-varning
- Aldrig: `verify=False` i tyst produktion utan att varna användaren

```python
import ssl, certifi

# Lägg till mkcert root CA om den finns
def make_ssl_context(extra_ca: str | None = None) -> ssl.SSLContext:
    ctx = ssl.create_default_context(cafile=certifi.where())
    if extra_ca:
        ctx.load_verify_locations(extra_ca)
    return ctx
```

### 5. Parallell polling med `asyncio.gather()`

`asyncio.gather()` med `return_exceptions=True` — ett fejlat site ska inte avbryta
resten av pollingen.

### 6. Exponential backoff för transienta fel

Använd `tenacity` (eller manuell loop) för retry. Backoff-formel:
`wait = min(base * 2^attempt + jitter, cap)` där `jitter = random.uniform(0, 1)`.

Retry-värdiga statuskoder: 429, 502, 503, 504. Inte: 404, 401, 403 (permanenta fel).

---

## Version Pins

```toml
# pyproject.toml
[project.optional-dependencies]
health = [
    "httpx>=0.28.1",        # senaste stabil (jan 2026); 1.0 dev pågår
    "rich>=14.1.0",         # Rich table + Live display
    "tenacity>=9.0.0",      # retry med exponential backoff
]
```

> httpx 0.28.x: `proxies`-argumentet borttaget, `zstd`-stöd tillagt.
> httpx 1.0 är under aktiv dev (1.0.dev3, sep 2025) — undvik i produktion än så länge.

---

## Code Examples

### Exempel 1 — Komplett `health_check`-funktion

```python
"""wapt/health.py — Async health checker för registrerade sajter."""
from __future__ import annotations

import asyncio
import time
import random
from dataclasses import dataclass
from enum import Enum

import httpx


class SiteStatus(str, Enum):
    OK = "OK"
    DEGRADED = "DEGRADED"
    DOWN = "DOWN"


SLOW_THRESHOLD_S = 2.0   # sekunder — gräns för DEGRADED
RETRY_CODES = {429, 502, 503, 504}
MAX_RETRIES = 3
BASE_BACKOFF = 1.0        # sekunder
BACKOFF_CAP = 30.0        # sekunder


@dataclass
class HealthResult:
    site: str
    status: SiteStatus
    status_code: int | None
    latency_ms: float | None
    error: str | None


async def _check_one(
    client: httpx.AsyncClient,
    url: str,
    *,
    retries: int = MAX_RETRIES,
) -> HealthResult:
    """Kolla en enskild URL med retry + backoff."""
    attempt = 0
    while True:
        t0 = time.monotonic()
        try:
            resp = await client.head(url, follow_redirects=False)
            latency = (time.monotonic() - t0) * 1000  # ms

            if resp.status_code in RETRY_CODES and attempt < retries:
                # Transient server error — retry
                pass
            elif 200 <= resp.status_code < 300:
                if latency > SLOW_THRESHOLD_S * 1000:
                    status = SiteStatus.DEGRADED
                else:
                    status = SiteStatus.OK
                return HealthResult(url, status, resp.status_code, latency, None)
            elif 300 <= resp.status_code < 400:
                # Redirect utan follow — markera DEGRADED för manuell granskning
                return HealthResult(
                    url, SiteStatus.DEGRADED, resp.status_code, latency, "redirect"
                )
            else:
                # 4xx / 5xx
                if attempt >= retries or resp.status_code not in RETRY_CODES:
                    return HealthResult(
                        url,
                        SiteStatus.DOWN,
                        resp.status_code,
                        latency,
                        f"HTTP {resp.status_code}",
                    )

        except httpx.TimeoutException as exc:
            if attempt >= retries:
                return HealthResult(url, SiteStatus.DOWN, None, None, f"timeout: {exc}")
        except httpx.RequestError as exc:
            # ConnectError, DNS-fel, SSL-fel etc.
            return HealthResult(url, SiteStatus.DOWN, None, None, str(exc))

        # Exponential backoff med jitter
        wait = min(BASE_BACKOFF * (2**attempt) + random.uniform(0, 1), BACKOFF_CAP)
        await asyncio.sleep(wait)
        attempt += 1


async def check_all(urls: list[str], verify: bool = True) -> list[HealthResult]:
    """Kolla alla URL:er parallellt. Returnerar alltid ett resultat per URL."""
    timeout = httpx.Timeout(connect=3.0, read=10.0, write=5.0, pool=5.0)
    async with httpx.AsyncClient(timeout=timeout, verify=verify) as client:
        tasks = [_check_one(client, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    output: list[HealthResult] = []
    for url, result in zip(urls, results):
        if isinstance(result, Exception):
            output.append(HealthResult(url, SiteStatus.DOWN, None, None, str(result)))
        else:
            output.append(result)  # type: ignore[arg-type]
    return output
```

### Exempel 2 — Rich Table output + exit-koder

```python
"""wapt/commands/status.py — CLI-kommando för hälsokontroll."""
from __future__ import annotations

import asyncio
import sys

import typer
from rich.console import Console
from rich.table import Table
from rich import box

from wapt.health import SiteStatus, check_all

console = Console()

STATUS_COLOR = {
    SiteStatus.OK: "green",
    SiteStatus.DEGRADED: "yellow",
    SiteStatus.DOWN: "red",
}

STATUS_ICON = {
    SiteStatus.OK: "●",
    SiteStatus.DEGRADED: "◑",
    SiteStatus.DOWN: "○",
}


def cmd_status(urls: list[str], verify: bool = True) -> None:
    """Kör hälsokontroll och skriv ut Rich-tabell. Avslutar med rätt exit-kod."""
    results = asyncio.run(check_all(urls, verify=verify))

    table = Table(
        title="wapt — Site Health",
        box=box.ROUNDED,
        show_lines=True,
    )
    table.add_column("Site", style="cyan", no_wrap=True)
    table.add_column("Status", justify="center")
    table.add_column("Code", justify="right")
    table.add_column("Latency", justify="right")
    table.add_column("Error", style="dim")

    for r in results:
        color = STATUS_COLOR[r.status]
        icon = STATUS_ICON[r.status]
        code_str = str(r.status_code) if r.status_code else "—"
        lat_str = f"{r.latency_ms:.0f} ms" if r.latency_ms else "—"

        table.add_row(
            r.site,
            f"[{color}]{icon} {r.status.value}[/{color}]",
            code_str,
            lat_str,
            r.error or "",
        )

    console.print(table)

    # Exit-koder
    statuses = {r.status for r in results}
    if all(r.status == SiteStatus.DOWN for r in results):
        raise SystemExit(2)   # Allt DOWN
    elif SiteStatus.DOWN in statuses or SiteStatus.DEGRADED in statuses:
        raise SystemExit(1)   # Något degraderat eller nere
    else:
        raise SystemExit(0)   # Allt OK
```

---

## Gotchas

- **HEAD blockeras**: Vissa servrar svarar med `405 Method Not Allowed` på HEAD. Fallback:
  `GET` med `stream=True` + `resp.aclose()` direkt efter headers är mottagna.
- **Follow redirects**: `follow_redirects=True` kan maskera felkonfigurationer. Bättre att
  rapportera redirects som DEGRADED.
- **asyncio.gather + return_exceptions**: Utan `return_exceptions=True` avbryter ett
  undantag hela gather-anropet.
- **Windows event loop**: På Windows 3.10+ används `ProactorEventLoop` som standard — httpx
  fungerar med båda men `WindowsSelectorEventLoopPolicy` kan behövas i vissa edge cases:
  ```python
  if sys.platform == "win32":
      asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
  ```
- **Latency vs response time**: `time.monotonic()` mäts runt `await client.head(...)` —
  inkluderar connect + TLS-handshake + server processing + headers-transfer. Det är rätt
  mått för hälsokontroll.
- **mkcert CA-sökväg Windows**: `%LOCALAPPDATA%\mkcert\rootCA.pem` eller kör
  `mkcert -CAROOT` för att hitta sökvägen.

---

## External Links

- [httpx async documentation](https://www.python-httpx.org/async/)
- [httpx Timeout class](https://www.python-httpx.org/api/#timeout)
- [Rich Table documentation](https://rich.readthedocs.io/en/latest/tables.html)
- [tenacity retry library](https://tenacity.readthedocs.io/en/latest/)
- [asyncio.gather docs](https://docs.python.org/3/library/asyncio-task.html#asyncio.gather)
- [httpx releases — PyPI](https://pypi.org/project/httpx/)
