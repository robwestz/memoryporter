# wapt — Roadmap

> 8 faser, 10 dagar. Phase 0 är denna bootstrap. Phase 1-7 exekveras via `/agent:execute-phase`.

---

## Phase 0 — Bootstrap (D0)

**Mål:** PROJECT/BLUEPRINT/ROADMAP + deepened PLAN.md per fas + aktiverade studentpaket-konton.

**Exekvering:** denna session. Inte hands-off.

**Deliverables:**
- [x] `portable-kit/tools/wapt/` katalogstruktur skapad
- [x] `PROJECT.md`, `BLUEPRINT.md` skrivna
- [ ] `ROADMAP.md` (denna fil)
- [ ] `AGENTS.md`, `CLAUDE.md`
- [ ] `.agent/config.yaml`, `.agent/identity.md`
- [ ] 7 × `phase-*/PLAN.md` skeletons
- [ ] `/compound-engineering:deepen-plan` körd → `references/*.md` producerad
- [ ] Student-konton aktiverade: Polypane, Codespaces, Name.com .dev, Heroku, Sentry

**Acceptance:** Phase 1 kan startas med `/agent:execute-phase 1` utan mer kontext-gathering.

---

## Phase 1 — ECC Bridge (D1)

**Mål:** ECC-browser kör på `https://ecc.localhost`. Alla crippled Web API:er fungerar.

**Stop-signal:** efter denna fas är primärvärdet levererat. Du kan avbryta om Bacowr kallar.

**Waves (kan köras hands-off):**
- Wave A: Caddy-install + mkcert-install på Windows 11
- Wave B: Caddyfile baseline + site-mall för ECC
- Wave C: `mkcert -install` + `mkcert ecc.localhost`
- Wave D: Flytta ECC-browser till `sites-enabled/ecc.caddy`-backed root
- Wave E: E2E-validering: fetch, SW, localStorage, ES modules, Clipboard

**Acceptance criteria:**
- `curl -k https://ecc.localhost` returnerar 200
- Chrome och Edge visar grönt lås (mkcert trust installerad)
- Test-sida under `tests/fixtures/ecc-api-probe.html` validerar 5 API:er, alla passerar
- AGENTS.md innehåller "how this was set up"-sektion för replikering

**Subagents:** `Explore` (Caddy Windows-docs), `documentation-lookup` (mkcert Windows gotchas), `tdd-guide` (skriv api-probe-tester först)

**Research deps från Phase 0 deepen-plan:**
- `references/caddy-windows-install.md`
- `references/mkcert-windows-gotchas.md`
- `references/localhost-rfc-behavior.md`

---

## Phase 2 — L0 Core (D2-4)

**Mål:** wapt-CLI med add/remove/list + caddy_wrapper + registry + stamper + mkcert + config_validation + error_library. ~1280 LOC prod + ~960 LOC test.

**Exekvering:** `/agent:execute-phase 2` med wave-paralleller.

**Waves:**
- Wave A: `error_library` + `cli_core` skeleton (Typer app + error classes)
- Wave B: `caddy_wrapper` + `caddyfile_stamper` (Caddy-operationer + Jinja2 mall)
- Wave C: `site_registry` + `config_validation` (JSON CRUD + Pydantic)
- Wave D: `mkcert_integration` (cert-lifecycle)
- Wave E: Integration — `cli_core` delegerar till alla ovan, e2e-tester

**Acceptance criteria:**
- `wapt add ecc <path>` skapar `sites-enabled/ecc.caddy` + reload:ar Caddy
- `wapt list` returnerar JSON vid `--json` flag
- `wapt remove ecc` raderar Caddyfile + reload:ar
- Unit-tester gröna för alla 6 moduler, ≥80% coverage
- `wapt --help` + `wapt <subcommand> --help` är informativa

**Subagents:** `tdd-guide`, `python-reviewer` (efter varje wave), `search-first` (innan ny modul)

**Research deps:**
- `references/typer-patterns.md`
- `references/pydantic-v2-patterns.md`
- `references/jinja2-caddyfile.md`

---

## Phase 3 — L0 Operational (D5-6)

**Mål:** `health_check` + `doctor` + `contract_tests`. ~450 LOC prod + tester.

**Exekvering:** `/agent:execute-phase 3`.

**Waves:**
- Wave A: `health_check` (HEAD-requests mot registrerade sajter, status-tabell)
- Wave B: `doctor_command` (prereq-checks: Caddy, mkcert, ports, cert-expiry)
- Wave C: `contract_tests` (Caddy Admin API schema-validering mot recorded responses)

**Acceptance criteria:**
- `wapt health` visar status per registrerad sajt (OK/DOWN/DEGRADED)
- `wapt doctor` kör alla prereq-checks, exit 0 på fungerande system
- `wapt doctor --contract-check` verifierar Caddy Admin API schema oförändrad

**Research deps:**
- `references/caddy-admin-api.md` (från Phase 0)
- `references/health-check-patterns.md`

---

## Phase 4 — L0 Harden (D7)

**Mål:** Full test-suite grön, coverage ≥80% för L0, v0.1.0-rc.

**Exekvering:** `/agent:execute-phase 4` + `/compound-engineering:resolve_todo_parallel` för att bränna TODO-backlog.

**Stop-signal:** naturlig shipping-punkt (~2530 LOC L0 complete). Om du vill stanna här är wapt fullt användbart som lokal Caddy-wrapper.

**Deliverables:**
- Alla unit + integration + e2e tester gröna
- Coverage-rapport ≥80% för L0
- `uv tool install .` från lokal wheel validerad
- `wapt.sh` shim fungerar, sourceas från `.bashrc`
- CHANGELOG.md uppdaterad

**Check-in krävs:** Robin granskar L0-koden manuellt innan Phase 5 börjar röra externa tjänster (Heroku, Sentry).

---

## Phase 5 — L1 Target Adapters (D8)

**Mål:** `target_ghpages` + `target_heroku` + `jetbrains_ext` + `sentry_hook`. ~820 LOC + tester.

**Exekvering:** `/agent:execute-phase 5` med waves per adapter.

**Waves:**
- Wave A: `target_ghpages` (git wrapper för gh-pages push)
- Wave B: `target_heroku` (Heroku CLI auth-flow + deploy)
- Wave C: `jetbrains_ext` (External Tools XML-generator + installationsskript)
- Wave D: `sentry_hook` (JS-injection i `caddyfile_stamper`)

**Acceptance criteria:**
- `wapt deploy ecc --target=ghpages` pushar till branch, site live
- `wapt deploy ecc --target=heroku:staging` skapar app + deployar
- `wapt jetbrains-install --ide=WebStorm` genererar External Tools XML
- Sentry-snippet injiceras korrekt när `[site.ecc] sentry_dsn = "<DSN>"` sätts

**Subagents:** `documentation-lookup` (Heroku CLI + Sentry JS SDK via context7 MCP), `security-reviewer` (efter sentry_hook), `tdd-guide`

**Research deps:**
- `references/heroku-cli-auth.md`
- `references/sentry-js-sdk.md`
- `references/jetbrains-external-tools.md`

**Check-in krävs:** verifiera Heroku-deploy publikt innan Phase 6.

---

## Phase 6 — L3 + Packaging (D9)

**Mål:** Rich-based colored output, pyproject.toml finslipad, `uv tool install` via git-subdirectory fungerar.

**Exekvering:** `/agent:execute-phase 6`.

**Deliverables:**
- `colored_output.py` (Rich tables för `wapt list`, `wapt health`, `wapt status`)
- `pyproject.toml` med entry-points, deps, extras (`[ops]`, `[ui]`)
- `wapt.sh` shim med proper source-hooks
- `uv tool install --editable .` från repo-root fungerar
- `uv tool install git+<repo>#subdirectory=tools/wapt` fungerar

**Research deps:**
- `references/uv-tool-install.md`
- `references/rich-tables.md`

---

## Phase 7 — Integration + Docs (D10)

**Mål:** Fungerar mot 3 verkliga sajter, knowledge-pack enligt PACK_SPEC, v0.1.0 release.

**Exekvering:**
1. `/compound-engineering:test-browser` — Playwright mot ECC + 2 andra sajter
2. `/agent:execute-phase 7` — docs + recept
3. `/raise-the-bar` standard mode — final pressure-test
4. Manuell UAT (Robin kör dagliga operationer i 1 timme)

**Deliverables:**
- `portable-kit/knowledge/packs/wapt/` enligt PACK_SPEC-format (från första sessionens diskussion)
- Recept-filer: `recipes/polypane.md`, `recipes/requestly.md`, `recipes/1password.md`, `recipes/cloudflared.md`, `recipes/simpleanalytics.md`
- `CHANGELOG.md` uppdaterad
- Git tag `v0.1.0`
- `.devcontainer/devcontainer.json` för Codespaces

**Acceptance criteria:**
- Playwright e2e grön på alla 3 sajter
- raise-the-bar → STRICT YES eller DOMINANT YES
- Robin kan göra en full workflow-loop: `wapt add foo /path` → editera → `wapt deploy foo --target=heroku:staging` → öppna publik URL → verifiera

---

## Phase-ordning-logik

**Kritisk väg:** Phase 1 → Phase 2 → Phase 4. Allt annat är sekundärt.
- Phase 1 levererar primärvärdet
- Phase 2 gör wapt till ett riktigt CLI
- Phase 4 gör det shippable

**Sidovägar:**
- Phase 3 kan delayas om Phase 2 tar längre än 3 dagar
- Phase 5 kan reduceras till bara `target_ghpages` om tidspress
- Phase 6 kan komprimeras till halvdag om `colored_output` skippa
- Phase 7:s PACK_SPEC kan släppas till en separat session

**Aldrig hoppa:**
- Quality gates mellan faser
- Robin-review efter Phase 4
- Check-in efter Phase 5
