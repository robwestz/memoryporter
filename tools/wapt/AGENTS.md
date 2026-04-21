# wapt — Agents Manual

> Operationsmanual för agenter som bygger, underhåller eller använder wapt.
> Canonical source för verify-kommandon per portable-kit konvention.

---

## Identitet

Du är en exekverande agent i wapt-projektet. Du har följande kontext-dokument att läsa vid sessionsstart:

1. Denna fil (`AGENTS.md`)
2. `PROJECT.md` — constraints, stakeholder, bar, no-touch
3. `BLUEPRINT.md` — arkitektur, moduler, datakontrakt
4. `ROADMAP.md` — fas-ordning + acceptance criteria
5. Aktuell fas: `.agent/phases/phase-<N>-<name>/PLAN.md`

Om något av ovan saknas eller är ofullständigt: läs `portable-kit/CLAUDE.md` (parent) för fallback-beteende, stoppa sen och be Robin om riktning.

---

## Verify-kommandon (canonical)

```bash
# Unit tests
pytest tests/unit -v

# Integration tests (kräver Caddy-binär installerad)
pytest tests/integration -v

# E2E tests (kräver wapt installerat + mkcert CA)
pytest tests/e2e -v

# Full test-suite med coverage
pytest --cov=wapt --cov-report=term-missing

# Lint
ruff check src/wapt tests/

# Type check (om mypy konfigurerat)
mypy src/wapt

# Doctor på dev-maskinen
wapt doctor

# Contract check mot installerad Caddy
wapt doctor --contract-check

# Install från lokal wheel (Phase 4+)
uv tool install --editable .

# Install från portable-kit subdirectory (Phase 6+)
uv tool install git+<PORTABLE_KIT_REPO>#subdirectory=tools/wapt
```

---

## Arbetsflöde per fas

### 1. Sessionsstart
```
1. Läs AGENTS.md, PROJECT.md, BLUEPRINT.md, ROADMAP.md
2. Identifiera aktiv fas från .agent/config.yaml eller användare
3. Läs phase-<N>/PLAN.md komplett
4. Läs referenser nämnda i PLAN.md (references/*.md)
5. Kör föregående fas:s verify-kommandon — alla gröna?
6. Om ja: starta wave 1 i phase-<N>
7. Om nej: logga problemet, stoppa
```

### 2. Per wave
```
1. Läs wave-beskrivning i PLAN.md
2. Kör `Explore` subagent om kodyta är okänd
3. Skriv tester FÖRST (tdd-guide subagent enforcer)
4. Implementera till tester passerar
5. Kör `python-reviewer` subagent på diff
6. Adressera review-kommentarer
7. Commit med fas-prefix: `feat(phase-<N>-<wave>): ...`
8. Uppdatera LOC-tracker i BLUEPRINT.md
9. Markera wave complete i phase-<N>/progress.md
```

### 3. Per fas-slut
```
1. Kör alla verify-kommandon
2. Uppdatera BLUEPRINT.md LOC-tracker
3. Uppdatera AGENTS.md om nya kommandon/flaggor tillkommit
4. Commit: `phase(<N>): complete`
5. Om check-in krävs: tagga Robin och vänta
6. Annars: initiera nästa fas
```

### 4. Vid fel
```
1. Läs hela felmeddelandet
2. Sök references/ och kodbas — finns kända lösningar?
3. Om nej: använd context7 MCP för aktuell lib-docs
4. Testa fix, verifiera med unit-test
5. Logga i .agent/phases/phase-<N>/progress.md
6. Om samma fel upprepats 3 gånger: stoppa, tagga Robin
```

---

## Subagent-routing

| Situation | Subagent |
|-----------|----------|
| Okänd kodyta, ny fas | `Explore` (medium thoroughness) |
| Ny modul, sök befintliga lösningar | `search-first` |
| Skriva tester | `tdd-guide` (enforcer) |
| Python-kod reviewed | `python-reviewer` (obligatorisk efter diff) |
| Security-känslig (sentry_hook, cert-handling) | `security-reviewer` |
| Oklar feature-scope | `raise-the-bar` light mode |
| Docs-uppdatering | `doc-updater` |
| Lib-dokumentation behövs | `documentation-lookup` + context7 MCP |
| Integration-test mot live site | `e2e-runner` |
| Performance-problem | `performance-optimizer` |

---

## Slash-commands som används

| Command | När |
|---------|-----|
| `/agent:status` | Progress-check under fas |
| `/agent:execute-phase <N>` | Starta fas N |
| `/agent:execute-plan` | Kör specifik PLAN.md direkt |
| `/agent:pause-work` | Context handoff mid-fas |
| `/agent:resume-work` | Fortsätt efter pause |
| `/compound-engineering:deepen-plan` | Phase 0 enrichment av ROADMAP |
| `/compound-engineering:resolve_todo_parallel` | Phase 4 TODO-sweep |
| `/compound-engineering:test-browser` | Phase 7 Playwright |
| `/raise-the-bar` | Phase 0 charter-review, Phase 7 final-review |
| `/planning-with-files:status` | Överblick progress per fas |
| `/simplify` | Post-diff review |
| `/polish` | Phase 7 final pass |

---

## Guardrails (inlärda misstag)

1. **Aldrig modifiera `sites-enabled/*.caddy` direkt.** Gå via `wapt add/remove` eller regenerera från template.
2. **Caddy Admin API schema-ändringar.** Vid ny Caddy-version: kör `wapt doctor --contract-check` innan andra operationer.
3. **mkcert CA måste vara installerad FÖRE cert-gen.** `mkcert -install` en gång per maskin. Utan detta fungerar inte cert trust i browser.
4. **Port 2019 är Caddy Admin default.** Kolla port-konflikter via `wapt doctor` innan start.
5. **Aldrig commit:a `caddy/sites-enabled/` runtime-filer.** Lägg i .gitignore. Bara `templates/*.caddy` + `caddy/Caddyfile` committeras.
6. **Feature-flags är opt-in.** Default är false för L1/L3-features. Aldrig importera L1-moduler ovillkorligt i L0-kod.
7. **Windows path separators.** Caddyfile fungerar med forward slashes även på Windows. Använd `pathlib.PurePosixPath` i stampern.
8. **Jinja2 autoescape.** Slå PÅ för säkerhet även om Caddyfile inte är HTML. Osanerade path-värden kan bryta config.
9. **Heroku git remote.** Kolla att `heroku` remote inte kolliderar med existerande remotes.
10. **Sentry DSN läcker inte.** Om Robin committar wapt.toml med DSN: varna. Föreslå `1Password op run` eller miljö-variabel.

---

## Kommunikation med Robin

- **Prefererar:** konkreta rekommendationer, prosa över täta tabeller, svenska.
- **Undviker:** öppna frågor när svaret är härledbart från kontext, dense beslutstabeller mid-session.
- **"Bättre pga. anledning"**-regeln: när ett alternativ är objektivt bättre, välj det och förklara. Be inte om tillstånd.
- **Build-vs-ship-medvetenhet:** flagga scope-creep-risk aktivt. Stop-signaler är lika viktiga som fortskridning.
- **Check-in-punkter:** efter Phase 1, 4, 5 (explicit). Andra bara vid blocker eller scope-fråga.

---

## Externa kontrakt

- `portable-kit/CLAUDE.md` — parent-level instruktioner (task routing, skill-engine, etc.). Ärv konventioner därifrån om wapt-specifikt saknas.
- `portable-kit/AGENTS.md` — parent-level verify. wapt:s AGENTS.md är wapt-specifik.
- `~/.claude/ecc-browser/index.html` — ECC-browser host. Phase 1 flyttar denna till `sites-enabled/ecc.caddy` backed serving.
- `~/.wapt/registry.json` — runtime state. Skapas av `wapt add` första gången.
- `~/.wapt/config.toml` — global config. Skapas av `wapt init` första gången.

---

## ECC Bridge Setup (Phase 1 — replikera på ny maskin)

```bash
# 1. Prerequisites
scoop install caddy
scoop bucket add extras && scoop install mkcert

# 2. Installera mkcert CA (Windows visar dialog — klicka Ja)
mkcert -install
# Fallback utan admin:
certutil -user -addstore "Root" "$env:LOCALAPPDATA\mkcert\rootCA.pem"

# 3. Skapa logs-katalog
mkdir -p ~/.wapt/logs

# 4. Generera cert för ecc.localhost
cd portable-kit/tools/wapt/caddy/certs
mkcert ecc.localhost

# 5. Starta Caddy
cd portable-kit/tools/wapt/caddy
caddy start --config Caddyfile

# 6. Verifiera
curl -sk https://ecc.localhost/ -o /dev/null -w "%{http_code}"  # → 200
# Chrome/Edge: öppna https://ecc.localhost/probe.html → 5/5 grönt
```

Gotchas: `curl` utan `-k` kan misslyckas i Git Bash (SChannel); Chrome/Edge fungerar.
Firefox behöver `mkcert -install` med Firefox öppet (separat NSS store).
Port 443: Caddy hanterar utan admin-rättigheter via WinCap.

---

## Stopp-protokoll

Om något av nedan inträffar: **stoppa, rapportera, vänta på Robin.**

- Budget-violation (modul >30% över LOC-budget)
- Acceptance criterion misslyckas efter 3 fix-försök
- Check-in-gate (efter Phase 1, 4, 5)
- No-touch-violation föreslagen
- Caddy/mkcert på dev-maskinen beter sig oväntat (potentiell Windows-specifik gotcha)
- Heroku/Sentry externa tjänster ger 401/403 (auth-flow brustit)
