# Phase 2 — L0 Core: Progress

## Status: complete (functional) — Phase 3 next

## Wave Log

### Wave A — error_library + cli_core skeleton ✅
- 15 named exceptions with codes 1-15 + action strings
- Typer app with `--json` global flag, subcommand stubs
- Fixes: `CliRunner(mix_stderr=False)` removed (Click 8.2+); `no_args_is_help=True` test now accepts exit code 0 or 2
- 46 tests green

### Wave B — config_validation + site_registry ✅
- Pydantic v2 schemas: WaptConfig, SiteEntry, FeatureFlags, CaddyConfig, MkcertConfig, PathsConfig
- `default_config`, `load_config`, `write_config` (atomic via tempfile + os.replace)
- `utc_now_iso()` for ISO-8601 UTC timestamps
- SiteRegistry with versioned schema, atomic JSON writes, migration hook
- 33 tests green

### Wave C — caddyfile_stamper ✅
- Jinja2 environment with autoescape disabled (Caddyfile is not HTML) + custom path/domain sanitisers
- `stamp`, `write_site_caddyfile`, `remove_site_caddyfile`
- Forward-slash paths via `Path.as_posix()` for Windows safety
- StrictUndefined catches missing template vars early
- 13 tests green

### Wave D — caddy_wrapper ✅
- `CaddyWrapper`: start/stop/reload/validate (subprocess), status/config_dump (httpx Admin API)
- `caddy reload --config <Caddyfile>` is primary reload path (atomic, rolls back on failure)
- Version extraction from `Server: Caddy/X.Y.Z` header
- `caddy_available()` helper for doctor checks
- 23 tests green (subprocess + httpx mocked)

### Wave E — mkcert_integration ✅
- `mkcert_binary`, `caroot`, `install_ca_check`, `ensure_cert(domain, dir)`, `check_expiry`, `is_near_expiry`
- Idempotent: `ensure_cert` returns existing PEMs without re-shelling
- OpenSSL fallback for cert expiry parsing; sentinel `999 days` if openssl absent
- 16 tests green

### Wave F — CLI integration + e2e ✅
- `cli_core.py` Wave F: full implementations of init/add/remove/list/health
- Path resolution: `_resolve_paths(config)` derives certs_dir, logs_dir, templates_dir
- `_templates_dir()` resolves both installed-wheel and editable-dev layouts
- WaptError → formatted error + exit code mapping
- 12 integration tests covering full init → add → list → remove flow
- **Total Phase 2: 145 tests green**

## Acceptance criteria
- [x] `wapt init` creates `~/.wapt/config.toml`
- [x] `wapt add <name> <path>` → cert + registry + stamped Caddyfile + (optional) reload
- [x] `wapt remove <name>` → delete Caddyfile + registry entry + (optional) reload
- [x] `wapt list --json` returns valid JSON
- [x] `wapt --help` and per-command help informative
- [x] Unit tests green for all 7 L0 modules
- [ ] Branch coverage ≥80% — final gate is Phase 4

## LOC tracker
- error_library: ~155
- cli_core: ~330 (Wave F full implementation)
- config_validation: ~165
- site_registry: ~140
- caddyfile_stamper: ~135
- caddy_wrapper: ~165
- mkcert_integration: ~145
- **L0 prod total: ~1235 LOC** (budget 1280 — within)
- **Tests: ~715 LOC** across 7 unit + 1 integration file

## Known followups for Phase 3
- `wapt doctor` is still a Wave A stub — Phase 3 lights it up
- `health_check` for individual sites (HEAD requests) is Phase 3
- Coverage report not run yet — Phase 4 gate
- python-reviewer subagent not run on diff — defer to Phase 4 hardening
