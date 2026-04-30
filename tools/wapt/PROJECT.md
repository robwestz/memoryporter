# wapt — Project Charter

> Agent-operabel lokal web-appliance för Claude-integrerad utveckling.
> Tight-scoped, evidence-backed, 10-dagars timebox med explicita stop-signaler.

---

## Varför detta finns

ECC-browser (`file:///C:/Users/robin/.claude/ecc-browser/index.html`) är en skill/command-navigator som Robin använder dagligen för att orientera sig i sitt 200+-skills-landskap. `file://`-protokollet kastrerar den:

- `fetch()` blockeras av CORS för lokala JSON-filer
- Service Workers tillåts inte alls
- `localStorage`/`IndexedDB` delar origin med varje annan `file://`-sida (kaos-scope)
- ES modules blockeras av CORS
- `navigator.clipboard`, `Notifications` och andra Web APIs är degraderade

Flyttar ECC-browser till `https://ecc.localhost` via wapt och alla dessa låser upp. Det är inte "minskad friktion" — det är **feature-unlock**. Basket-funktionen persisteras mellan sessioner, skill-katalogen cache:as offline via SW, fetch-baserad metadata-laddning fungerar.

wapt är samtidigt en generell lokal web-appliance för de 3 aktiva produkterna (SIE-X, sokordsanalys, Bacowr) och för snabb live-testning av Claude Design-komponenter under pågående iterationer.

---

## Stakeholder

**Robin** — solo dev, Windows 11, bash shell.
- 3 aktiva produkter i olika stadier (SIE-X, sokordsanalys, Bacowr)
- Daglig ECC-browser-användare
- JetBrains IDE-ekosystem (WebStorm/PyCharm/PHPStorm)
- Python + Rust + bash bilingual; mindre Go
- Självdiagnostiserad "build-vs-ship"-tendens: bygger infra djupt, fryser på första konkreta produkt
- Prefererar konkreta rekommendationer över öppna frågor
- Täta beslutstabeller är svåra att läsa — prosa med strukturerade callouts
- "Bättre pga. anledning" — när ett alternativ är objektivt bättre, välj det och förklara varför

---

## Bar

Flawless = Robin använder wapt vecka 8 utan paper cuts.
Varje feature:
- Har automatiserade tester (unit + integration där meningsfullt)
- Ger informativa fel med åtgärdstext, inte tysta failures
- Dokumenteras i AGENTS.md med användningsexempel
- Är agent-operabel (CLI + `--json` flagga, predictable exit codes)

---

## No-touch (konvergensresultat från två raise-the-bar-körningar)

1. **Caddy** som webserver — inte nginx, inte Express, inte custom
2. **mkcert** för lokal TLS — inte Caddy's self-signed, inte manuell cert-hantering
3. **`*.localhost`-konvention** — RFC 6761 + RFC 2606, ingen `/etc/hosts`-hackning
4. **ECC-browser som D1 primärt use case** — allt annat byggs därefter
5. **Lever i `portable-kit/tools/wapt/`** — inte separat repo
6. **Inga containers i v1** — DDEV-på-Windows-lärdomen
7. **wapt wraps Caddy / genererar Caddyfiles** — uppfinner inget eget config-format
8. **wapt.sh bash-shim som entrypoint** — Python-paketet är implementation
9. **5-dagars-cap är officiellt borttagen** — 10 dagar med explicita stop-signaler
10. **`sites-enabled/*.caddy` statisk mall per sajt** — Lando-sprawl undviks

---

## Scope — tre lager

Arkitekturen är **layered**: opt-in-lager ger Robin valfrihet mellan lean-core (~2530 LOC) och full install (~3530 LOC).

### L0 — Necessary core (~2530 LOC, alltid laddad)
Primärt mål: ECC-browser fungerar perfekt på `https://ecc.localhost` + minimal agent-operabel CLI mot Caddy.

Moduler:
- `cli_core` (280 LOC) — Typer app, subcommand routing, `--json`, help
- `caddy_wrapper` (180) — start/stop/reload/status via Caddy Admin API + binary fallback
- `site_registry` (220) — JSON-backed CRUD över sajter
- `caddyfile_stamper` (150) — Jinja2 → `sites-enabled/<name>.caddy`
- `mkcert_integration` (120) — install-check, gen, rotation-varning
- `health_check` (240) — pollar registrerade sajter, status-tabell
- `doctor_command` (160) + `contract_tests` (50) — Caddy Admin API schema-validering
- `config_validation` (90) — Pydantic för wapt.toml + registry
- `error_library` (80) — namngivna undantag + exit-koder + åtgärdstext
- `test_suite` (960) — unit + integration + e2e mot ecc.localhost

### L1 — Target adapters (~1320 LOC, opt-in per adapter)
Opt-in via `[features]` i wapt.toml. Varje adapter är en isolerad enhet.

- `target_ghpages` (180) — git push till gh-pages
- `target_heroku` (220) — Heroku CLI wrapper
- `jetbrains_ext` (110) — External Tools XML + installationsskript
- `sentry_hook` (100) — JS-injection i stampern
- `log_tail` (160) — `wapt logs <site>` från Caddy access-log
- `status_json_api` (150) — lokal FastAPI på `localhost:6789/status`
- `vhost_codegen` (400) — avancerad template-expansion (reverse-proxy, FastCGI)

**Not:** totala L1-budgeten är ~1320 LOC, men få kommer aktivera allt. Faktisk install för Robins 3 produkter förväntas ~400-600 LOC från L1.

### L2 — Deferred (noll LOC i v1, reserverade platser)
Byggs endast vid bevis inom 30 dagar:
- `live_reload` (420) — om Robin rapporterar weekly manual-refresh pain
- `snapshot_restore` (280) — om Robin faktiskt tappar state
- `cloudflared` subcommand (0) — dokumenterat som recept, inte subcommand

### L3 — Presentation (~180 LOC, opt-in)
- `colored_output` (180) — Rich-baserad tabellformatering (INTE Textual TUI)

**Total v1 bygge: ~3530 LOC prod + tester.** Reserverad kapacitet inkl. L2-aktivering: ~4230 LOC.

---

## Explicit out-of-scope i v1

- Dashboard-UI (även web-dashboard)
- Textual/Bubble Tea full TUI
- Databas per projekt
- Container-orkestrering (static hosting; dev-servers körs i terminal, Caddy proxy:ar)
- Autonoma agent-loopar inuti wapt (CLI är agent-operabel men inget loopar självt)
- PHP-switcher (Robin har noll PHP-projekt: SIE-X Python/Rust, sokordsanalys Python, Bacowr Python/Node)
- Cloudflared tunnel som subcommand (dokumenterat recept räcker)
- Plugin system / tredjepartsbidrag
- Self-update

---

## Externa tjänster (via GitHub Student Developer Pack)

**Aktiveras under Phase 0:**
- **Polypane** (1 år) — multi-viewport dev-browser; öppna `https://ecc.localhost` där
- **GitHub Codespaces** (free Pro) — cloud wapt via `.devcontainer/`
- **Name.com** (.dev domain gratis 1 år) — `ecc.robin.dev` eller liknande för publikt staging
- **Heroku** ($13/mån × 24 mån) — `target_heroku` deploy-mål
- **Sentry** (50k errors/mån) — `sentry_hook` injection target

**Recept i docs (Phase 7):**
- Requestly (mock/modify HTTP)
- 1Password Developer Tools eller Doppler (secrets)
- SimpleAnalytics (privacy-friendly pageviews)
- Termius (SSH sync för multi-device)

---

## Timeline — 10 dagar med stop-signaler

| Dag | Fas | Primär deliverable | Stop-signal |
|-----|-----|--------------------|-------------|
| D0 | Phase 0 — Bootstrap | PROJECT/BLUEPRINT/ROADMAP + deepened PLAN.md | — |
| D1 | Phase 1 — ECC Bridge | ECC-browser på https://ecc.localhost | Primärvärde levererat |
| D2-4 | Phase 2 — L0 Core | CLI + caddy_wrapper + registry + stamper + mkcert | Minimum viable wapt |
| D5-6 | Phase 3 — L0 Operational | health_check + doctor + contract_tests | — |
| D7 | Phase 4 — L0 Harden | Full test-suite grön, coverage ≥80% | Naturlig shipping-punkt (2530 LOC) |
| D8 | Phase 5 — L1 Adapters | ghpages + heroku + jetbrains + sentry | Check-in krävs |
| D9 | Phase 6 — L3 + Packaging | Rich output + uv tool install + wapt.sh | — |
| D10 | Phase 7 — Integration + Docs | 3-sajter-test, PACK_SPEC knowledge pack, v0.1.0 | Release |

---

## Quality gates mellan faser

**Före varje fas börjar:**
- Föregående fas:s acceptance tests gröna
- Ingen ökning av Known Issues-listan
- Phase PLAN.md genomläst av exekverande agent

**Efter Phase 2, 4, 5, 7:**
- `pytest` på hela test-suiten
- `ruff check` (om konfigurerat) passerar
- Kör `wapt doctor --contract-check` (från Phase 3 och framåt)

**Efter Phase 4 (den enda load-bearing human-review-punkten):**
- Robin granskar L0-koden manuellt innan L1 börjar röra externa tjänster

---

## Stack

- **Python** 3.12+ (distribuerat via `uv tool install`)
- **Typer** (CLI framework)
- **Pydantic v2** (config-schema)
- **Jinja2** (Caddyfile-templating)
- **Rich** (L3 colored output)
- **FastAPI** (L1 status_json_api endast, valfritt)
- **pytest** (testing)
- **Caddy** v2.8+ (lokal binär)
- **mkcert** v1.4+ (lokal cert-authority)

---

## Konvergensens signaler

Detta charter är resultatet av:
- 1 Refine-körning av raise-the-bar som först landade på minimalism (~80 LOC shell library)
- 1 Forge-körning efter stakeholder-flip till 4000 LOC — producerade layered-arkitekturen
- 2 Phase 2 cross-pollinations som reviderade Phase 1-positioner baserat på bevis
- Genomgång av GitHub Student Developer Pack — extraherade 8 av 100+ tjänster som faktiskt fittar

Signal density: HIGH. Re-run förväntas inte producera nya strategiförändringar — bara exekveringsdetaljer.

---

## Referenser

- `BLUEPRINT.md` — arkitektur + stack + directory-struktur
- `ROADMAP.md` — 8 faser med acceptance criteria
- `AGENTS.md` — operationsmanual för exekverande agent
- `CLAUDE.md` — Claude-specifika rutiner
- `.agent/phases/phase-*/PLAN.md` — per-fas planer (deepened med research)
- `references/` — research-output från compound-engineering:deepen-plan
