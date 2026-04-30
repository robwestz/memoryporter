# Phase 7 — Integration + Docs + Release

**Goal:** Works against 3 real sites, knowledge pack per PACK_SPEC, v0.1.0 release.
**LOC budget:** ~0 new prod; +200 test (Playwright e2e) + docs.
**Timeline:** D10 (1 dag).

## Prerequisites
- Phase 6 complete: install path validated
- All 3 Robin-products accessible for testing (SIE-X, sokordsanalys, Bacowr)

## Waves

### Wave A — Playwright e2e (D10 morning)
- Run `/compound-engineering:test-browser` on:
  - ECC-browser at https://ecc.localhost — validate Service Worker registration, localStorage persistence, fetch to local JSON
  - Second site (sokordsanalys if present): base smoke test
  - Third site (Bacowr if present): base smoke test
- Write Playwright tests in `tests/e2e/test_real_sites.py`

### Wave B — Knowledge pack (D10 morning)
- Per PACK_SPEC from first session: `portable-kit/knowledge/packs/wapt/`
  - `PACK.md` — what this pack is
  - `ACTIVATE.md` — when Claude should activate
  - `REJECT.md` — when Claude should not
  - `USAGE.md` — how
  - `manifest.json` — machine-readable
  - `grammar/tokens.json` — wapt CLI command tokens
  - `skills/use-wapt.md`
  - `references/` — links to official Caddy/mkcert/Heroku docs with version pins
  - `sources.yaml` — citations + version lock

### Wave C — Recipes (D10 afternoon)
- `docs/recipes/polypane.md` — multi-viewport live testing
- `docs/recipes/requestly.md` — HTTP mocking during dev
- `docs/recipes/1password.md` — secrets via op-run
- `docs/recipes/cloudflared.md` — public tunnel
- `docs/recipes/simpleanalytics.md` — privacy analytics injection
- `docs/recipes/codespaces.md` — devcontainer.json for wapt-in-Codespace

### Wave D — Final pressure-test (D10 afternoon)
- Run `/raise-the-bar` standard mode on the whole v0.1.0
- Address any SHIP-blocker findings
- Manual UAT: Robin runs full workflow loop (add → edit → deploy → verify) for 1 hour

### Wave E — Release (D10 kväll)
- CHANGELOG.md: finalize v0.1.0 entry
- Git tag `v0.1.0`
- Push to portable-kit repo
- `.devcontainer/devcontainer.json` for Codespaces

## Acceptance criteria
- Playwright e2e green on all 3 real sites
- Knowledge pack at `portable-kit/knowledge/packs/wapt/` passes PACK_SPEC conformance check
- raise-the-bar verdict: STRICT YES or DOMINANT YES (with named tradeoff OK by Robin)
- Robin completes full workflow loop without paper cuts
- Git tag `v0.1.0` pushed
- `.devcontainer/devcontainer.json` valid (Codespace boots and `wapt doctor` passes)

## Research questions (for deepen-plan)
- Playwright Python: pattern for testing Service Worker registration and localStorage persistence across reloads
- PACK_SPEC conformance (from first session): what's the minimal validator we can run against our pack?
- `.devcontainer/devcontainer.json` schema 2026: best structure for Python + Caddy + mkcert setup
- CHANGELOG entry format: Keep a Changelog sections for v0.1.0

## Dependencies
- `references/playwright-python.md`
- `references/pack-spec-conformance.md`
- `references/devcontainer-patterns.md`

## Risks / gotchas
- Playwright on Windows can be finicky with browser downloads; pre-install in CI
- PACK_SPEC from first-session discussion may need final touches — treat as living doc
- devcontainer.json for wapt needs to install Caddy + mkcert in the container (not just Python)

## Stop signals
- raise-the-bar verdict = NO: don't ship. Iterate on findings.
- Manual UAT finds paper cut that would bite daily use: fix before tag
- Heroku deploy broken during UAT: likely auth token expired, re-verify student pack

## Exit artifacts
- `tests/e2e/test_real_sites.py`
- `portable-kit/knowledge/packs/wapt/*` (full pack per PACK_SPEC)
- `docs/recipes/*.md` (5-6 recipes)
- `.devcontainer/devcontainer.json`
- `CHANGELOG.md` v0.1.0 section
- Git tag `v0.1.0` pushed
- raise-the-bar verdict documented
