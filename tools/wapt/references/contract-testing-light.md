# Contract Testing Light — Reference
> Last updated: 2026-04-21

## Overview

"Contract testing light" är ett pragmatiskt alternativ till full Pact/Consumer-Driven
Contract Testing. Ansatsen: spela in ett riktigt API-svar en gång, spara det som
JSON-fixture, validera sedan schema (inte exakt innehåll) vid varje testkörning.

**Mål för wapt:** verifiera att Caddy Admin API (port 2019) returnerar förväntat schema
utan att kräva att Caddy körs i CI. Verklig Caddy körs bara i integrationstester.

---

## Caddy Admin API — Bakgrund

Caddy exponerar ett REST-API på `http://localhost:2019` (konfigurerbart).

| Endpoint | Metod | Beskrivning |
|----------|-------|-------------|
| `/config/` | GET | Hela aktiva konfigurationen som JSON |
| `/config/` | POST | Ersätt hela konfigurationen |
| `/config/{path}` | GET/PUT/PATCH/DELETE | Enskilda config-noder |
| `/reverse_proxy/upstreams` | GET | Upstream health-status |
| `/id/{id}` | GET | Hämta config-nod via `@id`-tagg |

**Etag-header:** Caddy returnerar `Etag: "{path} {hash}"` på GET /config/ — använd
detta för optimistisk concurrency och för att detektera config-drift.

**Version-detektering:** Caddy returnerar `Server: Caddy/{version}` i response headers.
Varna om versionen driftar mot vad wapt byggdes mot.

---

## Best Practices

### 1. Spela in fixtures en gång — validera schema alltid

Spela in med riktig Caddy körandes lokalt, commit:a fixture-filerna. I CI: validera
enbart mot schema (inga nätverksanrop). I integration-test-läge: kör mot riktig Caddy.

### 2. Schema-first — inte snapshot-equality

Jämför inte exakt JSON-innehåll (instabil — IP-adresser, timestamps). Validera istället
strukturen: vilka nycklar finns, vilka typer har de, vilka är required.

### 3. Versionsskydd

Extrahera Caddy-versionen ur `Server`-headern och jämför mot en PIN i `pyproject.toml`.
Varna (inte fail) om versionen driftar — breaking changes är ovanliga i Caddy men
sker mellan minor-versioner.

### 4. Tydlig L0 vs integration-gräns

```
L0 (unit):        mock Caddy-svaret med recorded fixture → validera schema → snabb CI
Integration:      riktig Caddy körandes → anropa /config/ → validera live-svar
E2E:              full wapt-kommando mot lokal Caddy → verifiera beteende
```

Använd `@pytest.mark.integration` och skippa med `-m "not integration"` i CI.

---

## Version Pins

```toml
# pyproject.toml
[project.optional-dependencies]
testing = [
    "jsonschema>=4.23.0",   # 4.26.0 senaste (jan 2026); 4.23+ för Draft 7 + 2020-12
    "pytest>=8.4.0",        # 8.4.2 senaste stabila (sep 2025); 9.0.2 finns
    "pytest-cov>=6.0.0",    # kompatibel med pytest 8.4+
    "httpx>=0.28.1",        # för att ropa mot riktig Caddy i integrationstester
]
```

> `jsonschema` 4.26.0 stödjer Draft 3, 4, 6, 7, 2019-09, 2020-12.
> `Draft7Validator` är stabilt API — ingen breaking change planerad.

---

## Code Examples

### Exempel 1 — Schema-validator för Caddy /config/ response

```python
"""wapt/caddy/schema.py — Schema-validering av Caddy Admin API-svar."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jsonschema import Draft7Validator, ValidationError


# Minsta schema för Caddy /config/ — Caddy returnerar null om ingen config är laddad
CADDY_CONFIG_SCHEMA: dict[str, Any] = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "CaddyConfig",
    "oneOf": [
        {"type": "null"},  # Tom config — Caddy returnerar null
        {
            "type": "object",
            "properties": {
                "apps": {
                    "type": "object",
                    "description": "Caddy app-moduler (http, tls, etc.)",
                },
                "admin": {
                    "type": "object",
                    "properties": {
                        "listen": {"type": "string"},
                        "disabled": {"type": "boolean"},
                    },
                },
                "logging": {"type": "object"},
                "storage": {"type": "object"},
            },
            # Caddy tillåter okända nycklar — additionalProperties: true
            "additionalProperties": True,
        },
    ],
}

# Schema för http.servers-noden
CADDY_HTTP_SERVER_SCHEMA: dict[str, Any] = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "patternProperties": {
        ".*": {  # Server-namn är godtyckliga strängar
            "type": "object",
            "required": ["listen"],
            "properties": {
                "listen": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 1,
                },
                "routes": {
                    "type": "array",
                    "items": {"type": "object"},
                },
                "tls_connection_policies": {
                    "type": "array",
                    "items": {"type": "object"},
                },
            },
            "additionalProperties": True,
        }
    },
}

PINNED_CADDY_VERSION = "2.9"  # Major.minor — varna om det driftar


def validate_caddy_config(data: Any) -> list[str]:
    """
    Validera Caddy /config/ response mot schema.

    Returns:
        Tom lista om valid. Lista med felmeddelanden annars.
    """
    validator = Draft7Validator(CADDY_CONFIG_SCHEMA)
    errors = sorted(validator.iter_errors(data), key=lambda e: str(e.path))
    return [f"{'.'.join(str(p) for p in e.path) or 'root'}: {e.message}" for e in errors]


def load_fixture(name: str) -> Any:
    """Läs en recorded fixture från tests/fixtures/caddy/."""
    fixture_path = (
        Path(__file__).parent.parent.parent / "tests" / "fixtures" / "caddy" / name
    )
    return json.loads(fixture_path.read_text(encoding="utf-8"))


def extract_caddy_version(headers: dict[str, str]) -> str | None:
    """Extrahera Caddy-version ur Server-header. Returnerar t.ex. '2.9.1'."""
    server = headers.get("server", headers.get("Server", ""))
    if server.startswith("Caddy/"):
        return server.split("/", 1)[1].split()[0]
    return None
```

### Exempel 2 — pytest fixtures + L0 vs integration-tester

```python
# tests/conftest.py (utdrag)
import json
from pathlib import Path
from typing import Any
import pytest
import httpx


FIXTURES_DIR = Path(__file__).parent / "fixtures" / "caddy"
CADDY_ADMIN_URL = "http://localhost:2019"


@pytest.fixture
def caddy_config_fixture() -> Any:
    """Recorded Caddy /config/ response för L0-tester (ingen riktig Caddy krävs)."""
    return json.loads((FIXTURES_DIR / "config_response.json").read_text(encoding="utf-8"))


@pytest.fixture
def caddy_empty_fixture() -> None:
    """Caddy /config/ response när ingen config är laddad (returnerar null)."""
    return None


@pytest.fixture(scope="session")
def live_caddy_config():
    """
    Hämtar riktig Caddy /config/ — kräver att Caddy körs på localhost:2019.
    Används bara i integrationstester.
    """
    try:
        resp = httpx.get(f"{CADDY_ADMIN_URL}/config/", timeout=5.0)
        resp.raise_for_status()
        return resp.json(), dict(resp.headers)
    except (httpx.ConnectError, httpx.TimeoutException) as exc:
        pytest.skip(f"Caddy inte tillgänglig på {CADDY_ADMIN_URL}: {exc}")


# tests/test_caddy_schema.py
import pytest
from wapt.caddy.schema import (
    validate_caddy_config,
    extract_caddy_version,
    PINNED_CADDY_VERSION,
)


class TestCaddyConfigSchemaL0:
    """L0-tester: ingen riktig Caddy — använder recorded fixtures."""

    def test_empty_config_is_valid(self, caddy_empty_fixture):
        """Caddy returnerar null före första config-laddning."""
        errors = validate_caddy_config(caddy_empty_fixture)
        assert errors == [], f"Oväntat schema-fel: {errors}"

    def test_recorded_fixture_is_valid(self, caddy_config_fixture):
        """Recorded fixture ska passera schema-validering."""
        errors = validate_caddy_config(caddy_config_fixture)
        assert errors == [], f"Schema-fel i fixture: {errors}"

    def test_missing_apps_key_still_valid(self):
        """apps är inte required — tom objekt-config är valid."""
        errors = validate_caddy_config({})
        assert errors == []

    def test_wrong_type_raises_error(self):
        """En lista är inte ett giltigt Caddy-config-objekt."""
        errors = validate_caddy_config([1, 2, 3])
        assert len(errors) > 0


class TestVersionDetection:
    def test_extracts_version_from_server_header(self):
        version = extract_caddy_version({"Server": "Caddy/2.9.1 linux amd64"})
        assert version == "2.9.1"

    def test_returns_none_for_missing_header(self):
        version = extract_caddy_version({})
        assert version is None

    def test_version_drift_warning(self):
        """Varna om Caddy-versionen driftar från PIN."""
        import warnings
        headers = {"Server": "Caddy/3.0.0"}
        version = extract_caddy_version(headers)
        major_minor = ".".join(version.split(".")[:2]) if version else ""
        if major_minor != PINNED_CADDY_VERSION:
            with warnings.catch_warnings(record=True) as w:
                warnings.warn(
                    f"Caddy version {version} skiljer sig från PIN {PINNED_CADDY_VERSION}",
                    stacklevel=1,
                )
                assert len(w) == 1


@pytest.mark.integration
class TestCaddyLiveIntegration:
    """Integrationstester — kräver Caddy på localhost:2019."""

    def test_live_config_matches_schema(self, live_caddy_config):
        data, headers = live_caddy_config
        errors = validate_caddy_config(data)
        assert errors == [], f"Live Caddy-config bryter schema: {errors}"

    def test_live_version_header_present(self, live_caddy_config):
        _, headers = live_caddy_config
        version = extract_caddy_version(headers)
        assert version is not None, "Server-header saknar Caddy-version"

    def test_etag_header_present(self, live_caddy_config):
        _, headers = live_caddy_config
        assert "etag" in {k.lower() for k in headers}, "Etag-header saknas"
```

---

## Hur man spelar in fixtures

```bash
# Kör med Caddy igång lokalt:
mkdir -p tests/fixtures/caddy
curl -s http://localhost:2019/config/ | python -m json.tool > tests/fixtures/caddy/config_response.json
curl -s http://localhost:2019/reverse_proxy/upstreams | python -m json.tool > tests/fixtures/caddy/upstreams_response.json
```

Commit:a dessa filer. De är stabila — Caddy förändrar inte schema-strukturen i patch-versioner.

---

## Gotchas

- **jsonschema `additionalProperties`**: Caddy tillåter extra nycklar (moduler,
  extensions). Sätt alltid `"additionalProperties": True` i schema — annars failar
  validering när Caddy lägger till nya fält.
- **null vs tom objekt**: GET /config/ returnerar `null` (JSON) om ingen config är
  laddad, inte `{}`. Schema måste hantera båda via `oneOf`.
- **Draft7Validator vs validate()**: `validate()` kastar vid första fel.
  `Draft7Validator.iter_errors()` samlar alla fel — bättre för diagnostik.
- **Etag-format**: `Etag: "/config/ abc123ef"` — värdet inkluderar citattecken och
  path-prefix. Parsa med `header.strip('"').split()[-1]` för hash-delen.
- **Windows-lineterminator i fixtures**: Skriv fixtures med `encoding="utf-8"` och
  `ensure_ascii=False` för att undvika BOM och CRLF-problem i Git.
- **Port 2019 i CI**: Caddy Admin API lyssnar lokalt. I GitHub Actions: starta Caddy
  som service eller skippa integrationstester med `-m "not integration"`.

---

## External Links

- [Caddy Admin API documentation](https://caddyserver.com/docs/api)
- [Caddy API Tutorial](https://caddyserver.com/docs/api-tutorial)
- [jsonschema Python documentation](https://python-jsonschema.readthedocs.io/)
- [jsonschema releases — PyPI](https://pypi.org/project/jsonschema/)
- [Draft7Validator API reference](https://python-jsonschema.readthedocs.io/en/latest/api/jsonschema/validators/)
- [Caddy Admin API — DeepWiki](https://deepwiki.com/caddyserver/caddy/2.3-admin-api)
