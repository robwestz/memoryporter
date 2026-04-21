# pytest Coverage — Reference
> Last updated: 2026-04-21

## Overview

Denna fil dokumenterar pytest 8.x/9.x best practices för wapt — med fokus på
branch coverage, CLI-testning med monkeypatch, async-tester med pytest-asyncio,
testseparation via marks och Windows-specifika gotchas.

**Stack:**
- `pytest` 8.4.2 (stabil) / 9.0.2 (senaste, apr 2026)
- `pytest-cov` 7.1.0 (senaste, jan 2026)
- `pytest-asyncio` 1.3.0 (nov 2025; kräver pytest >= 8.4.0)
- `syrupy` 4.x (snapshot-testning för Caddyfile-output)

---

## Version Pins

```toml
# pyproject.toml
[project.optional-dependencies]
testing = [
    "pytest>=8.4.0",           # 8.4.2 senaste stabila; 9.0.2 finns (apr 2026)
    "pytest-cov>=7.1.0",       # pytest-cov 7.1.0 senaste (jan 2026)
    "pytest-asyncio>=1.3.0",   # 1.3.0 (nov 2025); kräver pytest>=8.4.0
    "syrupy>=4.7.0",           # snapshot-testning; Windows-kompatibel
    "httpx>=0.28.1",           # async http för health_check-tester
]
```

> `pytest-asyncio` 1.0+ (maj 2025): `event_loop` fixture borttagen, `asyncio_mode`
> är nu det primära konfigurationsalternativet. Sätt `asyncio_mode = "auto"` i
> `pyproject.toml` för att slippa dekorera varje async-test.

---

## Best Practices

### 1. pyproject.toml — Komplett konfiguration

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"                 # pytest-asyncio 1.0+: auto-detect async tests
addopts = [
    "--cov=wapt",
    "--cov-branch",
    "--cov-report=term-missing",
    "--cov-report=html:htmlcov",
    "--cov-config=pyproject.toml",    # explicit path — pytest-cov hittar annars inte pyproject
    "-ra",                            # summera alla non-passing tests
    "--strict-markers",               # fail om okänd mark används
]
testpaths = ["tests"]
markers = [
    "integration: kräver extern tjänst (Caddy, nätverk)",
    "e2e: full end-to-end mot riktig miljö",
    "slow: körtid >1s",
]

[tool.coverage.run]
source = ["wapt"]
branch = true                         # branch coverage — se nedan varför
omit = [
    "wapt/__main__.py",               # entry-point-boilerplate
    "wapt/vendor/*",
    "tests/*",
]
parallel = false

[tool.coverage.report]
show_missing = true
skip_covered = false
fail_under = 80                       # CI failar under 80%
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
    "\\.\\.\\.",                       # ellipsis i Protocol-definitioner
    "if __name__ == .__main__.:",
]

[tool.coverage.html]
directory = "htmlcov"
```

### 2. Varför branch coverage för wapt

Statement coverage mäter om en rad kördes. Branch coverage mäter om BÅDA grenarna
av en `if`-sats testades. För wapt är detta kritiskt:

```python
# Med enbart statement coverage — 100% om happy path testas
async def _check_one(client, url, retries=3):
    attempt = 0
    while True:                           # branch: loop fortsätter vs avslutar
        try:
            resp = await client.head(url)
            if resp.status_code in RETRY_CODES and attempt < retries:  # 4 branches
                pass
            elif 200 <= resp.status_code < 300:                         # 2 branches
                ...
        except httpx.TimeoutException:    # branch: exception vs no exception
            ...
```

En suite som bara testar 200 OK ger ~70% statement coverage men kanske 30% branch
coverage. Branch coverage tvingar fram tester för timeout-fall, retry-logik etc.

### 3. Nå 80% branch coverage utan att testa trivial kod

Strategier:
- **Testa gränsvärden**: `status_code = 299` (OK), `300` (DEGRADED), `500` (DOWN)
- **Testa exception-paths**: `httpx.TimeoutException`, `httpx.ConnectError`
- **Parametrize**: enda test, många fall
- **Exkludera boilerplate**: `# pragma: no cover` på `if __name__ == "__main__":`
- **Exkludera Protocol-stubs**: `...` i abstract-metoder

---

## conftest.py — Struktur för unit/integration/e2e

```
tests/
├── conftest.py              # Globala fixtures + marks-logik
├── unit/
│   ├── conftest.py          # L0-fixtures (inga externa beroenden)
│   └── test_health.py
├── integration/
│   ├── conftest.py          # Fixtures som kräver Caddy/nätverk
│   └── test_caddy_live.py
└── fixtures/
    └── caddy/
        └── config_response.json
```

```python
# tests/conftest.py
import pytest


def pytest_configure(config):
    """Registrera custom marks för att undvika warnings."""
    config.addinivalue_line("markers", "integration: kräver extern tjänst")
    config.addinivalue_line("markers", "e2e: full end-to-end-test")
    config.addinivalue_line("markers", "slow: körtid >1s")


@pytest.fixture(autouse=True)
def _no_real_network(monkeypatch, request):
    """
    Blockera riktiga nätverksanrop i unit-tester.
    Integrationstester är undantagna via mark.
    """
    if request.node.get_closest_marker("integration"):
        return
    if request.node.get_closest_marker("e2e"):
        return

    import httpx

    def _raise(*args, **kwargs):
        raise RuntimeError("Riktigt nätverksanrop i unit-test! Använd monkeypatch.")

    monkeypatch.setattr(httpx.AsyncClient, "head", _raise)
    monkeypatch.setattr(httpx.AsyncClient, "get", _raise)
```

---

## Code Examples

### Exempel 1 — Mocka subprocess för Caddy CLI

```python
"""tests/unit/test_caddy_process.py — Mockar subprocess.run för Caddy-kontroll."""
from __future__ import annotations

import subprocess
from unittest.mock import MagicMock

import pytest

from wapt.caddy.process import start_caddy, CaddyError


class TestStartCaddy:
    def test_start_success(self, monkeypatch, tmp_path):
        """Caddy startar korrekt — subprocess returnerar 0."""
        caddyfile = tmp_path / "Caddyfile"
        caddyfile.write_text("localhost {\n  respond 'ok'\n}\n", encoding="utf-8")

        mock_result = MagicMock(spec=subprocess.CompletedProcess)
        mock_result.returncode = 0
        mock_result.stdout = ""
        mock_result.stderr = ""

        monkeypatch.setattr(
            subprocess,
            "run",
            lambda *args, **kwargs: mock_result,
        )

        # Ska inte kasta undantag
        start_caddy(caddyfile=caddyfile)

    def test_start_failure_raises(self, monkeypatch, tmp_path):
        """Caddy misslyckas starta — CaddyError ska kastas."""
        caddyfile = tmp_path / "Caddyfile"
        caddyfile.write_text("", encoding="utf-8")

        mock_result = MagicMock(spec=subprocess.CompletedProcess)
        mock_result.returncode = 1
        mock_result.stderr = "config error: invalid directive"

        monkeypatch.setattr(subprocess, "run", lambda *args, **kwargs: mock_result)

        with pytest.raises(CaddyError, match="config error"):
            start_caddy(caddyfile=caddyfile)

    def test_caddy_not_found_raises(self, monkeypatch):
        """Caddy-binär inte installerad — FileNotFoundError wrappas som CaddyError."""
        def _raise(*args, **kwargs):
            raise FileNotFoundError("caddy")

        monkeypatch.setattr(subprocess, "run", _raise)

        with pytest.raises(CaddyError, match="caddy not found"):
            start_caddy(caddyfile=None)

    def test_validate_only_does_not_start(self, monkeypatch, tmp_path, capfd):
        """validate_only=True kör 'caddy validate', inte 'caddy run'."""
        caddyfile = tmp_path / "Caddyfile"
        caddyfile.write_text("localhost { respond 'ok' }\n", encoding="utf-8")

        calls: list[list[str]] = []

        def _mock_run(cmd, **kwargs):
            calls.append(cmd)
            result = MagicMock()
            result.returncode = 0
            result.stdout = "Valid configuration"
            result.stderr = ""
            return result

        monkeypatch.setattr(subprocess, "run", _mock_run)
        start_caddy(caddyfile=caddyfile, validate_only=True)

        assert len(calls) == 1
        assert "validate" in calls[0]
        assert "run" not in calls[0]
```

### Exempel 2 — Parametrize för health_check + async med pytest-asyncio

```python
"""tests/unit/test_health.py — Async health_check med parametrize."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest

from wapt.health import SiteStatus, _check_one, check_all


def make_mock_response(status_code: int) -> MagicMock:
    """Bygger en mock httpx.Response för givet statuskod."""
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = status_code
    return mock


@pytest.mark.parametrize(
    "status_code, expected_status",
    [
        (200, SiteStatus.OK),
        (201, SiteStatus.OK),
        (299, SiteStatus.OK),
        (301, SiteStatus.DEGRADED),
        (302, SiteStatus.DEGRADED),
        (400, SiteStatus.DOWN),
        (401, SiteStatus.DOWN),
        (403, SiteStatus.DOWN),
        (404, SiteStatus.DOWN),
        (500, SiteStatus.DOWN),
        (502, SiteStatus.DOWN),   # retry-kandidat men DOWN efter max retries
        (503, SiteStatus.DOWN),
    ],
)
async def test_check_one_status_codes(
    monkeypatch, status_code: int, expected_status: SiteStatus
):
    """_check_one mappas korrekt för alla relevanta statuskoder."""
    mock_resp = make_mock_response(status_code)

    async def mock_head(self, url, **kwargs):
        return mock_resp

    monkeypatch.setattr(httpx.AsyncClient, "head", mock_head)

    async with httpx.AsyncClient() as client:
        # retries=0 för att undvika backoff-sleep i test
        result = await _check_one(client, "http://example.com", retries=0)

    assert result.status == expected_status


async def test_check_one_timeout_returns_down(monkeypatch):
    """TimeoutException → SiteStatus.DOWN."""
    async def mock_head(self, url, **kwargs):
        raise httpx.ConnectTimeout("timed out")

    monkeypatch.setattr(httpx.AsyncClient, "head", mock_head)

    async with httpx.AsyncClient() as client:
        result = await _check_one(client, "http://slow.example.com", retries=0)

    assert result.status == SiteStatus.DOWN
    assert "timeout" in (result.error or "")


async def test_check_all_parallel(monkeypatch):
    """check_all returnerar ett resultat per URL — även vid exceptions."""
    async def mock_head(self, url, **kwargs):
        if "down" in url:
            raise httpx.ConnectError("refused")
        return make_mock_response(200)

    monkeypatch.setattr(httpx.AsyncClient, "head", mock_head)

    urls = ["http://ok.example.com", "http://down.example.com"]
    results = await check_all(urls)

    assert len(results) == 2
    assert results[0].status == SiteStatus.OK
    assert results[1].status == SiteStatus.DOWN


### Exempel 3 — Snapshot-testning av Caddyfile-output med syrupy

```python
"""tests/unit/test_caddyfile_template.py — Snapshot-test för Caddyfile-generering."""
from __future__ import annotations

import pytest
from syrupy.assertion import SnapshotAssertion

from wapt.caddy.template import render_caddyfile, SiteConfig


@pytest.mark.parametrize(
    "config",
    [
        pytest.param(
            SiteConfig(domain="example.com", port=443, tls=True),
            id="https-site",
        ),
        pytest.param(
            SiteConfig(domain="localhost", port=80, tls=False),
            id="local-http",
        ),
        pytest.param(
            SiteConfig(
                domain="api.example.com",
                port=443,
                tls=True,
                upstream="localhost:8080",
            ),
            id="reverse-proxy",
        ),
    ],
)
def test_caddyfile_output_matches_snapshot(
    config: SiteConfig, snapshot: SnapshotAssertion
):
    """
    Caddyfile-output ska matcha lagrad snapshot.
    Kör med --snapshot-update för att uppdatera snapshots.
    """
    output = render_caddyfile(config)
    assert output == snapshot


def test_caddyfile_contains_domain(tmp_path):
    """Utan snapshot-lib: kontrollera nyckelinnehåll."""
    config = SiteConfig(domain="mysite.com", port=443, tls=True)
    output = render_caddyfile(config)

    assert "mysite.com" in output
    assert "tls" in output.lower()
    assert not output.startswith(" ")  # Caddyfile ska inte ha leading whitespace
```

---

## Köra tester — Vanliga kommandon

```bash
# Bara unit-tester (snabb, ingen Caddy krävs)
pytest -m "not integration and not e2e"

# Med coverage
pytest -m "not integration" --cov=wapt --cov-branch --cov-report=term-missing

# Alla tester inklusive integration (kräver Caddy på localhost:2019)
pytest --cov=wapt --cov-branch

# Uppdatera syrupy-snapshots
pytest --snapshot-update

# Fail under täckningsmål
pytest --cov-fail-under=80

# Visa bara rader utan coverage (tyst läge)
pytest --cov=wapt --cov-report=term-missing --no-header -q
```

---

## Windows-specifika Gotchas

- **`tmp_path` på Windows**: Returnerar `pathlib.WindowsPath`. Fungerar korrekt med
  `open()` och `Path.write_text()`, men använd alltid `str(tmp_path / "file")` när
  du skickar sökvägar till subprocess — backslash-escaping kan annars orsaka problem.

  ```python
  # Säkert: använd Path-objekt direkt där möjligt
  caddyfile = tmp_path / "Caddyfile"
  caddyfile.write_text(content, encoding="utf-8")
  subprocess.run(["caddy", "run", "--config", str(caddyfile)], ...)
  ```

- **Filbehörigheter i tester**: `tmp_path` på Windows ger i regel skrivbehörighet,
  men om tester misslyckas med `PermissionError`: kör pytest med
  `--basetemp=C:/tmp/pytest` utanför OneDrive-synkade mappar.

- **asyncio event loop på Windows**: Med `pytest-asyncio 1.3.0` och
  `asyncio_mode = "auto"` hanteras event loop automatiskt. Behövs inte:
  ```python
  # INTE nödvändigt med pytest-asyncio >= 1.0
  # asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
  ```

- **Syrupy snapshots CRLF**: Syrupy lagrar snapshots med LF. Lägg till
  `.gitattributes` för att undvika CRLF-konvertering på Windows:
  ```
  tests/__snapshots__/**  text eol=lf
  ```

- **`.coverage`-fil i Git Bash**: Coverage-databasen skapas i CWD. Säkerställ att
  `.gitignore` inkluderar `.coverage`, `.coverage.*` och `htmlcov/`.

---

## Testtäckning — Strategi för 80% branch coverage

| Modul | Kritiska branches att testa |
|-------|----------------------------|
| `wapt/health.py` | 2xx/3xx/4xx/5xx, timeout, ConnectError, retry exhausted |
| `wapt/caddy/process.py` | returncode 0/1, FileNotFoundError, validate_only True/False |
| `wapt/caddy/template.py` | tls=True/False, upstream=None/set, varje templategren |
| `wapt/registry.py` | site exists/not, add/remove/list operations |
| `wapt/config.py` | default values, overrides, file not found |

**Exkludera från coverage** (via `# pragma: no cover`):
- `if __name__ == "__main__":` i `__main__.py`
- `...` (ellipsis) i Protocol/ABC-metoder
- `raise NotImplementedError` i abstrakta basklasser
- `if TYPE_CHECKING:` block

---

## Gotchas (Generella)

- **pytest-cov hittar inte pyproject.toml**: Lägg alltid till `--cov-config=pyproject.toml`
  i addopts. Utan detta letar pytest-cov efter `.coveragerc` och missar inställningar.
- **pytest-asyncio 1.0+: `event_loop` fixture borttagen**: Använd inte `@pytest.fixture`
  för `event_loop` — det är borttaget i 1.0. Använd `asyncio_mode = "auto"` istället.
- **`--cov-branch` utan `branch = true` i config**: Kommandorads-flaggan fungerar men
  är inte persistent. Sätt `branch = true` i `[tool.coverage.run]` för konsistens.
- **Parallell testning med `pytest-xdist`**: Om du lägger till `-n auto`, lägg till
  `parallel = true` i coverage-config och kör `coverage combine` efter körning.
- **Snapshot-tester och CI**: Kör `--snapshot-update` lokalt, commit:a snapshots.
  CI ska ALDRIG köra med `--snapshot-update` — det maskerar regressioner.
- **`capfd` vs `capsys`**: `capfd` fångar på file descriptor-nivå (inkl. subprocess-output).
  `capsys` fångar Python-nivå `sys.stdout/stderr`. För Typer CLI-tester: använd
  `typer.testing.CliRunner` istället för båda — det är den korrekta abstraktionen.
- **`monkeypatch.setattr` scope**: Monkeypatch återställer automatiskt efter varje test.
  Använd `monkeypatch` (function scope) för de flesta fall; `monkeypatch` är inte
  tillgänglig i session-scoped fixtures — använd då `unittest.mock.patch` som context manager.

---

## External Links

- [pytest 8.4 changelog](https://docs.pytest.org/en/stable/announce/release-8.4.0.html)
- [pytest-asyncio 1.3.0 documentation](https://pytest-asyncio.readthedocs.io/en/stable/)
- [pytest-asyncio 1.0 migration guide](https://thinhdanggroup.github.io/pytest-asyncio-v1-migrate/)
- [pytest-cov 7.1.0 documentation](https://pytest-cov.readthedocs.io/en/latest/config.html)
- [coverage.py branch coverage](https://coverage.readthedocs.io/en/latest/branch.html)
- [syrupy snapshot testing](https://syrupy-project.github.io/syrupy/)
- [pytest tmp_path documentation](https://docs.pytest.org/en/stable/how-to/tmp_path.html)
- [pytest monkeypatch documentation](https://docs.pytest.org/en/stable/how-to/monkeypatch.html)
- [pytest parametrize documentation](https://docs.pytest.org/en/stable/how-to/parametrize.html)
