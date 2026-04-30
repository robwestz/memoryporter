# Phase 2 — L0 Core

**Goal:** wapt-CLI med add/remove/list + caddy_wrapper + registry + stamper + mkcert + config_validation + error_library.
**LOC budget:** ~1280 prod + ~560 test.
**Timeline:** D2-4 (3 dagar).

## Prerequisites
- Phase 1 acceptance grön: ECC-browser på https://ecc.localhost
- `caddy/Caddyfile` + `templates/site.caddy` existerar
- `pyproject.toml` initial skapad

## Waves

### Wave A — Foundation (D2 förmiddag)
- `src/wapt/error_library.py` (80 LOC)
  - ~15 namngivna undantag: CaddyNotFound, MkcertNotFound, SiteExists, SiteNotFound, InvalidConfig, AdminAPIError, RegistryCorrupt, PortConflict, CertExpired, ReloadFailed, TemplateError, ValidationError, PathNotAbsolute, DomainInvalid, UnknownTarget
  - Exit-koder 1-15 per undantag
  - `__str__` ger åtgärdstext
- `src/wapt/cli_core.py` skeleton (80/280 LOC)
  - Typer app med subcommand stubs: init, add, remove, list, doctor, health
  - `--json` flag
  - Error handling: catch WaptError, print formatted, sys.exit(code)

### Wave B — Config + Registry (D2 eftermiddag)
- `src/wapt/config_validation.py` (90 LOC)
  - Pydantic v2 models: WaptConfig, SiteEntry, FeatureFlags, CaddyConfig
  - Load from `~/.wapt/config.toml`, write with atomic replace
- `src/wapt/site_registry.py` (220 LOC)
  - JSON-backed CRUD: add_site, remove_site, get_site, list_sites
  - Atomic writes (write tmp, os.replace)
  - Schema migration hook (version field)

### Wave C — Caddyfile stamping (D3 förmiddag)
- `src/wapt/caddyfile_stamper.py` (150 LOC)
  - Jinja2 env with autoescape
  - `stamp(site_entry, template_name) -> str`
  - `write_site_caddyfile(site_entry) -> Path`
  - `remove_site_caddyfile(name)`
  - Path-handling via pathlib.PurePosixPath for Caddyfile content

### Wave D — Caddy wrapper (D3 eftermiddag)
- `src/wapt/caddy_wrapper.py` (180 LOC)
  - Admin API primary: POST /load with JSON config
  - Binary fallback: `caddy reload --config <path>`
  - `start()`, `stop()`, `reload()`, `status()`, `config_dump()`
  - Windows DETACHED_PROCESS for background start

### Wave E — mkcert integration (D4 förmiddag)
- `src/wapt/mkcert_integration.py` (120 LOC)
  - `install_ca_check()` — verify root CA installed
  - `ensure_cert(domain) -> (cert_path, key_path)` — gen if missing
  - `check_expiry(cert_path) -> timedelta`
  - Subprocess with mkcert, verify exit code

### Wave F — CLI integration + e2e (D4 eftermiddag)
- Connect cli_core subcommands with implementation
- `wapt add <name> <path>` full flow: validate → registry → mkcert → stamp → caddy reload
- `wapt remove <name>`
- `wapt list` + `wapt list --json`
- `wapt init` creates `~/.wapt/config.toml` with defaults
- Integration test: build a site from scratch against real Caddy

## Acceptance criteria
- `wapt init` creates valid config file
- `wapt add bacowr ~/projects/bacowr` creates sites-enabled/bacowr.caddy and site responds at https://bacowr.localhost
- `wapt remove bacowr` deletes file + reloads
- `wapt list --json` returns valid JSON with all registered sites
- `wapt --help` and `wapt <subcmd> --help` informative
- Unit tests green for all 6 modules
- Branch coverage ≥80% for L0 (reached gradually; final gate in Phase 4)

## Research questions (for deepen-plan)
- Typer v0.12+ best-practices: subcommand-routing, context objects, --json flag-pattern
- Pydantic v2 validation idioms for nested config
- Jinja2 autoescape for non-HTML (Caddyfile) — necessary or paranoid?
- Caddy Admin API POST /load: full JSON-config requirement or delta-update?
- Python subprocess + DETACHED_PROCESS on Windows: correct flag combination for background start?
- Atomic JSON write on Windows: does `os.replace` work identically to Unix?

## Dependencies
- `references/typer-patterns.md`
- `references/pydantic-v2-patterns.md`
- `references/jinja2-caddyfile.md`
- `references/caddy-admin-api.md`
- `references/windows-subprocess.md`

## Risks / gotchas
- Caddy Admin API may require full JSON-config on POST /load — verify with recorded response
- Jinja2 autoescape can over-escape paths without conscious `| safe` use
- Windows subprocess DETACHED_PROCESS + CREATE_NEW_PROCESS_GROUP required for proper background start
- Pydantic v2 vs v1 API differences during config migration

## Stop signals
- **Minimum viable wapt** after Wave F — pause here if scope-flex
- Module LOC >30% over budget: stop, subtract
- Unit coverage <80% in any L0 module after Wave F: stop, write more tests

## Exit artifacts
- `src/wapt/{error_library,cli_core,config_validation,site_registry,caddyfile_stamper,caddy_wrapper,mkcert_integration}.py`
- `tests/unit/test_*.py` for each
- `tests/integration/test_cli_e2e.py`
- `pyproject.toml` with entry-point `wapt = "wapt.cli_core:app"`
- BLUEPRINT.md LOC tracker updated
