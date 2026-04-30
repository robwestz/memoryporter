# Phase 4 — L0 Harden

**Goal:** Full test suite green, coverage ≥80% for L0, v0.1.0-rc.
**LOC budget:** no new prod code; +200 test LOC to fill coverage gap.
**Timeline:** D7 (1 dag).

## Prerequisites
- Phase 2 + 3 complete
- L0 modules all have unit tests (even if coverage not yet 80%)

## Waves

### Wave A — TODO sweep (D7 förmiddag)
- Run `/compound-engineering:resolve_todo_parallel` — spawns parallel agents for each TODO marker in code
- Address or explicitly defer each TODO (add to L2-deferred in PROJECT.md or fix now)

### Wave B — Coverage finish (D7 förmiddag)
- Run `pytest --cov=wapt --cov-report=html`
- Identify modules <80% branch coverage
- Write tests for uncovered paths (error cases, edge cases, error_library integration)

### Wave C — Integration test sweep (D7 eftermiddag)
- Full e2e: empty Windows env → wapt init → add 2 sites → list → health → doctor → remove
- Test against Caddy restart (Admin API + binary fallback)
- Test against registry corruption (manually write broken JSON, verify error message)

### Wave D — Release prep (D7 kväll)
- `pyproject.toml` finalize: version 0.1.0rc1, classifiers, readme ref
- `uv tool install --editable .` from repo root — validate smooth install
- `wapt.sh` shim written, source line in documentation
- CHANGELOG.md initial version with v0.1.0rc1 entry

## Acceptance criteria
- `pytest --cov=wapt` reports ≥80% branch coverage for L0 modules
- All unit + integration + e2e tests pass
- `uv tool install --editable .` works from empty venv
- `wapt doctor` returns all green on dev machine
- CHANGELOG.md first entry written
- Git tag `v0.1.0rc1` created

## **HUMAN CHECK-IN REQUIRED**
Robin reviews L0 code manually before Phase 5 starts touching external services (Heroku, Sentry).
Check-in checklist:
- [ ] Read through src/wapt/ top-to-bottom — quality acceptable?
- [ ] Run `wapt` your own way for 30 min — find any paper cuts?
- [ ] Check BLUEPRINT.md LOC tracker — any module over budget?
- [ ] Okay to continue to L1 (external services)?

## Research questions (for deepen-plan)
- pytest-cov configuration: which report format makes gaps easiest to find?
- uv tool install vs pipx on Windows — differences, gotchas?
- Semantic versioning for pre-1.0: 0.1.0rc1 vs 0.0.1 conventions?

## Dependencies
- `references/pytest-coverage.md`
- `references/uv-tool-install.md`

## Risks / gotchas
- Coverage can be hard to reach for Windows-specific paths if tests run in CI without DETACHED_PROCESS support
- `uv tool install --editable` may require explicit `[tool.uv]` section in pyproject.toml
- CHANGELOG format: Keep a Changelog (recommended) vs simple reverse-chronological

## Stop signals
- **Natural shipping point** after Wave D. If Robin wants to stop here, wapt is L0-feature-complete.
- Coverage <80% after Wave B: stop, write more tests, deprioritize against jumping to Phase 5

## Exit artifacts
- Coverage report in `htmlcov/` (gitignored)
- `pyproject.toml` v0.1.0rc1
- `CHANGELOG.md`
- `wapt.sh` shim
- Git tag `v0.1.0rc1`
- BLUEPRINT.md LOC tracker complete for L0
