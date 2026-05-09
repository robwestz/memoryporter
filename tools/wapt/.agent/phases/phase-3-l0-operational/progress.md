# Phase 3 — L0 Operational: Progress

## Status: complete — Phase 4 (harden) next

## Wave Log

### Wave A — health_check ✅
- `health_check.py`: per-site HEAD polling, OK/DEGRADED/DOWN classifier, latency in ms
- `wapt health` rewired: per-site table when registry has entries, falls back to caddy admin status when empty
- `overall_exit_code`: 0/1/2 aggregation
- 15 tests green
- Eval fix: `error` field no longer reports "HTTP 200" for slow-2xx DEGRADED (semantic correctness)

### Wave B — doctor_command ✅
- 8 prereq checks: caddy/mkcert installed, mkcert CA, caddy running, ports 2019/443, cert expiry, registry integrity
- Severity: info / warning / error; exit code triggers only on errors
- `wapt doctor` fully wired (replaced Phase 2 stub)
- 18 tests green
- Eval fix: narrowed bare `except Exception` to `MkcertNotFound`/`CertExpired`

### Wave C — contract_tests ✅
- `contract_tests.py`: snapshot-based key validation (top_level_keys + apps_keys, value-blind)
- `tests/fixtures/caddy_schema_snapshot.json` committed (Caddy 2.11.2 min-required keys)
- `wapt doctor --contract-check` flag triggers schema validation
- `fetch_schema_snapshot()` helper for updating snapshot when Caddy major-bumps
- 11 tests green
- Eval fix: inverted marker logic in cli_core doctor renderer corrected

### Total
- **189/189 tests green** (105 unit Phase 2 + 60 unit Phase 3 + 12 integration + 12 contract)
- ruff clean
- 5 eval-fixes applied directly (logic bug + narrow excepts + marker logic + 2× ruff)

## Acceptance criteria
- [x] `wapt health` shows per-site OK/DOWN/DEGRADED with latency
- [x] `wapt doctor` runs 8 checks, structured result, exit 0/1
- [x] `wapt doctor --contract-check` validates Admin API schema
- [ ] Coverage ≥80% — Phase 4 hardening will measure

## LOC tracker
- health_check: ~125 (budget 240; under)
- doctor_command: ~165 (budget 160; +3%)
- contract_tests: ~145 (budget 50; spec under-budgeted at 50 — needs load/fetch/validate)
- **Phase 3 prod total: ~435 LOC** (budget 450 — within)
- **Tests: ~445 LOC** across 3 unit files

## Eval-flagged issues (deferred to Phase 4)
- F1: Possibly-unbound vars after `_handle_wapt_error` in cli_core commands — currently safe (helper always raises) but structurally fragile
- F2: `select_autoescape(default=False)` in caddyfile_stamper → simplify to `autoescape=False`
- F3: `ensure_cert` raises `MkcertNotFound` on subprocess failure (semantic mismatch)
- F4: `test_degraded_when_slow` doesn't assert `error is None` (would have caught the Phase 3 logic bug)
