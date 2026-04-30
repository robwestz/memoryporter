# wapt — Technical Blueprint

> Arkitektur, stack, moduler och datakontrakt.

---

## Arkitekturprinciper

1. **Caddy är sanningskällan.** wapt stampar ut Caddyfiles och pratar med Caddy Admin API. Uppfinner inget eget config-format.
2. **Lager, inte plugins.** L0 är alltid laddat; L1/L3 är opt-in via `wapt.toml [features]`-flaggor. Ingen dynamic discovery — enkla `if features.X: from wapt.X import register`.
3. **Filbaserat state.** Sajter lever som `sites-enabled/<name>.caddy`. Registry är en JSON-fil. Inga databaser.
4. **Agent-operabel.** Varje kommando har `--json`-flagga. Predictable exit codes. `wapt doctor` är maskinläsbar.
5. **Vertikal expansion.** Varje feature är ett djupare lager av Caddy-wrapping. Horisontell expansion (DB, node-switcher) är explicit förbjuden i v1.

---

## Layered architecture

```
L3 — Presentation (~180 LOC, opt-in)
    colored_output.py    Rich tables, colored status indicators

L1 — Target adapters (~1320 LOC, opt-in per adapter)
    target_ghpages.py    git push gh-pages
    target_heroku.py     Heroku CLI wrapper
    jetbrains_ext.py     External Tools XML generator
    sentry_hook.py       JS-injection in stamper
    log_tail.py          wapt logs <site>
    status_json_api.py   FastAPI on :6789/status
    vhost_codegen.py     Advanced Caddyfile templates

L0 — Necessary core (~2530 LOC, always loaded)
    cli_core.py          Typer app, subcommand routing
    caddy_wrapper.py     Admin API + binary fallback
    site_registry.py     JSON-backed CRUD
    caddyfile_stamper.py Jinja2 templates
    mkcert_integration.py Cert lifecycle
    health_check.py      Site health polling
    doctor_command.py    System + contract validation
    config_validation.py Pydantic schemas
    error_library.py     Named exceptions + exit codes

External deps:
    Caddy v2.8+          Local binary + Admin API
    mkcert v1.4+         Cert authority
    Python 3.12+         Runtime
    uv                   Installer + tool manager

Entry point:
    wapt.sh — Bash shim (~30 LOC)
        Sources from ~/.bashrc
        Dispatches to Python package
```

---

## Directory struktur

```
portable-kit/tools/wapt/
├── PROJECT.md               ← charter
├── BLUEPRINT.md             ← this file
├── ROADMAP.md               ← phase breakdown
├── AGENTS.md                ← operations manual
├── CLAUDE.md                ← Claude-specific routing
├── pyproject.toml           ← uv + packaging
├── wapt.sh                  ← bash shim (30 LOC)
├── .agent/
│   ├── config.yaml
│   ├── identity.md
│   └── phases/
│       ├── phase-1-ecc-bridge/PLAN.md
│       ├── phase-2-l0-core/PLAN.md
│       └── ...
├── src/
│   └── wapt/
│       ├── __init__.py
│       ├── __main__.py
│       ├── cli_core.py          # L0
│       ├── caddy_wrapper.py     # L0
│       ├── site_registry.py     # L0
│       ├── caddyfile_stamper.py # L0
│       ├── mkcert_integration.py# L0
│       ├── health_check.py      # L0
│       ├── doctor_command.py    # L0
│       ├── config_validation.py # L0
│       ├── error_library.py     # L0
│       ├── contract_tests.py    # L0
│       ├── colored_output.py    # L3
│       └── features/            # L1 (opt-in)
│           ├── __init__.py
│           ├── target_ghpages.py
│           ├── target_heroku.py
│           ├── jetbrains_ext.py
│           ├── sentry_hook.py
│           ├── log_tail.py
│           ├── status_json_api.py
│           └── vhost_codegen.py
├── templates/
│   ├── site.caddy               # default Caddyfile template
│   ├── site-proxy.caddy         # reverse-proxy variant
│   └── site-fastcgi.caddy       # vhost_codegen
├── caddy/
│   ├── Caddyfile                # top-level, imports sites-enabled/*.caddy
│   └── sites-enabled/           # one file per site (gitignored runtime)
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
└── references/                  # deepen-plan output
    ├── caddy-admin-api.md
    ├── mkcert-windows-gotchas.md
    ├── typer-patterns.md
    ├── pydantic-v2-patterns.md
    ├── heroku-cli-auth.md
    ├── sentry-js-sdk.md
    ├── jetbrains-external-tools.md
    ├── uv-tool-install.md
    └── rich-tables.md
```

---

## Datakontrakt (synthetic examples)

### `wapt.toml` — global config at `~/.wapt/config.toml`

```toml
[paths]
caddyfile = "~/portable-kit/tools/wapt/caddy/Caddyfile"
sites_enabled = "~/portable-kit/tools/wapt/caddy/sites-enabled"
registry = "~/.wapt/registry.json"
snapshots = "~/.wapt/snapshots"  # deferred L2

[features]
target_ghpages = false
target_heroku = false
jetbrains_ext = false
sentry_hook = false
log_tail = false
status_json_api = false
vhost_codegen = false
colored_output = true

[caddy]
admin_url = "http://localhost:2019"
binary_path = "auto"  # resolves via PATH

[mkcert]
ca_root = "auto"  # resolves via mkcert -CAROOT
```

### Registry — `~/.wapt/registry.json` (synthetic entry)

```json
{
  "version": 1,
  "sites": {
    "ecc": {
      "name": "ecc",
      "domain": "ecc.localhost",
      "root": "<PATH_TO_ECC_BROWSER>",
      "template": "site",
      "tls": "mkcert",
      "created_at": "<ISO_8601_UTC>",
      "targets": ["local"],
      "integrations": []
    }
  }
}
```

Fields:
- `version`: integer, schema-version för migration
- `sites.<name>.name`: string, matches slug in `sites-enabled/<name>.caddy`
- `sites.<name>.domain`: string, fully-qualified (`ecc.localhost`)
- `sites.<name>.root`: string, absolute path to site root
- `sites.<name>.template`: string, template filename without `.caddy` extension
- `sites.<name>.tls`: enum `"mkcert" | "internal" | "none"`
- `sites.<name>.created_at`: string, ISO-8601 UTC timestamp
- `sites.<name>.targets`: array, adapter keys (`"local"`, `"ghpages"`, `"heroku"`)
- `sites.<name>.integrations`: array, L1 integration keys (`"sentry"`)

### Site Caddyfile stamp — `sites-enabled/<name>.caddy` (synthetic)

```caddyfile
# Generated by wapt. DO NOT EDIT MANUALLY.
# Source: ~/.wapt/registry.json → site "ecc"
# Template: site.caddy

ecc.localhost {
    tls <MKCERT_CERT_PATH> <MKCERT_KEY_PATH>
    root * <SITE_ROOT>
    file_server browse
    encode gzip
    log {
        output file ~/.wapt/logs/ecc.log
        format json
    }
}
```

### Top-level Caddyfile — `caddy/Caddyfile`

```caddyfile
{
    admin localhost:2019
    auto_https disable_redirects
}

import sites-enabled/*.caddy
```

---

## Integration points

### Caddy Admin API
- Endpoint: `http://localhost:2019`
- Reload: `POST /load` med hela JSON-config ELLER `caddy reload --config <path>` via binary
- Status: `GET /config/` returnerar gällande config
- Risk: schema-ändringar mellan Caddy-versioner. Adresseras av `contract_tests.py` i L0.

### mkcert
- Cert path: `mkcert -CAROOT` ger rot
- Gen: `mkcert -install` (engång), `mkcert ecc.localhost` (per sajt)
- Rotation: kontrollera expiry via `openssl x509 -enddate`; varna vid <30 dagar

### Heroku (L1 target)
- Auth: `heroku auth:token` eller API token i `~/.netrc`
- Deploy: `git push heroku main` efter remote-setup
- App-skapande: `heroku create <name>`

### Sentry (L1 hook)
- DSN per sajt: i `wapt.toml [site.<name>] sentry_dsn = "<DSN>"`
- Injection: `caddyfile_stamper` lägger till `header` directive + `templates` block som injicerar Sentry browser SDK före `</head>`

### JetBrains (L1 ext)
- External Tools XML: `%APPDATA%\JetBrains\<IDE><version>\tools\wapt.xml`
- Commands: `wapt doctor`, `wapt status <current_project>`, `wapt logs <current_project>`

---

## Testing strategy

### Unit (tests/unit/)
- `caddyfile_stamper` — kontrollera Jinja2 output mot snapshots
- `site_registry` — CRUD + konkurrerande writes
- `config_validation` — Pydantic schema errors
- `mkcert_integration` — mocka subprocess, verifiera argument
- `error_library` — exit codes matchar namngivna errors

### Integration (tests/integration/)
- `caddy_wrapper` — mot riktig Caddy-binär i tmp-dir
- `doctor_command` — contract_tests mot faktisk Caddy Admin API
- `health_check` — starta 2 sajter, verifiera status-output

### E2E (tests/e2e/)
- ECC-browser på https://ecc.localhost: curl verifierar 200 + cert trust
- Service Worker registreras lyckat (via Playwright)
- localStorage persisterar mellan sessioner (via Playwright)

### Coverage target
- L0: ≥80% branch coverage
- L1: ≥70% (adapters är svårare att mocka fullständigt)
- L3: ≥60% (presentation, lägre risk)

---

## Quality gates

**Per-commit:**
- `ruff check` (om konfigurerat)
- `pytest tests/unit` passerar lokalt

**Per-phase-end:**
- Full `pytest` passerar
- `wapt doctor` returnerar OK på dev-maskinen
- AGENTS.md uppdaterad med nya kommandon

**Pre-release (Phase 7):**
- `uv tool install .` från wheel fungerar i tom Windows-VM
- Playwright e2e grön på alla 3 test-sajter
- raise-the-bar light mode pressure-test producerar STRICT YES eller DOMINANT YES

---

## Distribution

- `pyproject.toml` med `[project.scripts] wapt = "wapt.cli_core:app"`
- Publicering: inte PyPI i v1; install via `uv tool install git+<PORTABLE_KIT_REPO>#subdirectory=tools/wapt` ELLER local editable via `uv tool install --editable ./tools/wapt`
- `wapt.sh` shim i `portable-kit/tools/wapt/wapt.sh` sourceas från `~/.bashrc`:
  ```bash
  source ~/portable-kit/tools/wapt/wapt.sh
  ```

---

## LOC budget tracker (uppdateras under bygget)

| Modul | Budget | Actual | Status |
|-------|--------|--------|--------|
| cli_core | 280 | — | not started |
| caddy_wrapper | 180 | — | not started |
| site_registry | 220 | — | not started |
| caddyfile_stamper | 150 | — | not started |
| mkcert_integration | 120 | — | not started |
| health_check | 240 | — | not started |
| doctor + contract_tests | 210 | — | not started |
| config_validation | 90 | — | not started |
| error_library | 80 | — | not started |
| L0 test_suite | 960 | — | not started |
| **L0 subtotal** | **2530** | | |
| target_ghpages | 180 | — | not started |
| target_heroku | 220 | — | not started |
| jetbrains_ext | 110 | — | not started |
| sentry_hook | 100 | — | not started |
| log_tail | 160 | — | not started |
| status_json_api | 150 | — | not started |
| vhost_codegen | 400 | — | not started |
| **L1 subtotal** | **1320** | | |
| colored_output | 180 | — | not started |
| **L3 subtotal** | **180** | | |
| **Total reserved** | **4030** | | |

**Hard limit:** om en modul överskrider budget med >30% — stop-signal, subtrahera i PR innan merge.
