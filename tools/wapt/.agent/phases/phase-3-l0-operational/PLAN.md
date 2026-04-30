# Phase 3 — L0 Operational

**Goal:** health_check + doctor + contract_tests (Caddy Admin API schema validation).
**LOC budget:** ~450 prod + ~200 test.
**Timeline:** D5-6 (2 dagar).

## Prerequisites
- Phase 2 acceptance green: wapt CLI with add/remove/list works
- Integration tests against real Caddy pass

## Waves

### Wave A — health_check (D5 förmiddag)
- `src/wapt/health_check.py` (240 LOC)
  - `check_site(site_entry) -> HealthResult` — HEAD request to site, TLS verify, latency measurement
  - `check_all_sites() -> list[HealthResult]`
  - Status enum: OK, DOWN, DEGRADED (latency > 500ms or non-2xx)
  - CLI: `wapt health` + `wapt health --json`

### Wave B — doctor + prereqs (D5 eftermiddag)
- `src/wapt/doctor_command.py` (160 LOC)
  - `check_caddy_installed() -> CheckResult`
  - `check_mkcert_installed() -> CheckResult`
  - `check_mkcert_ca_installed()`
  - `check_caddy_running()`
  - `check_port_2019()` + `check_port_80_443()`
  - `check_cert_expiry()` — warn at <30 days
  - `check_registry_integrity()`
  - CLI: `wapt doctor` + `wapt doctor --json`
  - Exit 0 if all green, exit 1 if any red

### Wave C — contract_tests (D6)
- `src/wapt/contract_tests.py` (50 LOC)
  - Recorded response for `GET /config/` on known Caddy version
  - `validate_admin_api_schema() -> CheckResult` — pings and compares structural keys
  - `fetch_schema_snapshot()` — for updating on new Caddy
  - CLI: `wapt doctor --contract-check`

## Acceptance criteria
- `wapt health` shows status per registered site: OK/DOWN/DEGRADED with latency numbers
- `wapt doctor` runs all 7 prereq checks, reports structured result
- `wapt doctor --contract-check` validates Caddy Admin API schema against recorded snapshot
- Coverage ≥80% for new modules
- Integration test: intentionally break Caddy config → doctor detects it

## Research questions (for deepen-plan)
- Caddy Admin API `GET /config/`: full response structure, stable vs unstable keys
- HEAD requests to own Caddy: proper way to get latency without downloading full response body
- Health-check patterns for local dev tooling (Valet/Herd/DDEV) — what do they measure?
- Contract testing patterns: pact-light vs snapshot comparison — what fits Caddy API?
- Cert expiry via Python: openssl binary vs cryptography lib — which is more reliable on Windows?

## Dependencies
- `references/caddy-admin-api.md`
- `references/health-check-patterns.md`
- `references/contract-testing-light.md`

## Risks / gotchas
- Caddy Admin API response can be large (full config) — limit schema comparison to top-level keys
- Port checks can false-positive during Windows firewall prompt
- Cert expiry requires reading PEM file; fallback via subprocess if lib missing

## Stop signals
- Coverage drops under 80% for L0 total after this phase: stop, add tests
- Contract check fails against Caddy installed on dev machine: investigate if schema actually changed or if our parsing is brittle

## Exit artifacts
- `src/wapt/{health_check,doctor_command,contract_tests}.py`
- `tests/unit/test_{health_check,doctor_command,contract_tests}.py`
- `tests/integration/test_doctor_e2e.py`
- `tests/fixtures/caddy_schema_snapshot.json`
- BLUEPRINT.md LOC tracker updated
