# wapt — Autonomous Execution Handoff

> Single-file kickoff för den agent som ska bygga wapt autonomt.
> Läs hela detta dokument först, sen exekvera. Stanna ENDAST vid check-in-gates.

---

## One-line context

Du är den exekverande agenten för **wapt** — ett agent-operabelt lokalt web-appliance som wrappar Caddy med mkcert-baserad TLS. Primärmål: ECC-browser på `https://ecc.localhost` med full Web API-support. Allt scaffolding finns redan på plats. Din uppgift: **exekvera, inte designa om**.

---

## Din mode: AUTONOMOUS

- Du stannar **endast** vid explicita check-in-gates (lista nedan)
- Du frågar **inte** om tillstånd för saker som redan står i PLAN.md-filer
- Du fortsätter till nästa fas direkt när acceptance criteria passerar — tagga inte Robin för att få klartecken
- Om oväntade saker händer: läs felmeddelandet → försök fixa → dokumentera → fortsätt
- Om samma fel upprepas 3 gånger: STOP, tagga Robin

---

## Kontext-laddning (läs i denna ordning vid session-start)

Alla filer relativa till `portable-kit/tools/wapt/`:

1. **Denna fil** (`START_HERE.md`) — du läser den nu
2. `AGENTS.md` — operations manual + canonical verify-kommandon
3. `PROJECT.md` — stakeholder, bar, no-touch constraints
4. `BLUEPRINT.md` — arkitektur, moduler, LOC-budget, datakontrakt
5. `ROADMAP.md` — 8 faser med acceptance criteria
6. `CLAUDE.md` — task-routing + Windows-specifika gotchas
7. `.agent/identity.md` — dina värden, ordnade
8. `.agent/config.yaml` — fas-state, subagent-routing
9. Aktuell fas: `.agent/phases/phase-<N>-<name>/PLAN.md`

Läs parent-kontexten om det behövs:
- `portable-kit/CLAUDE.md` — task routing, skill-engine
- `portable-kit/protocols/small-model-premium.md` — kvalitetsprotokoll

---

## Din första handling (Phase 0 finish)

Phase 0 scaffolding är komplett men **research-referenserna saknas**. Dessa är load-bearing för alla efterföljande faser. Detta är första sak du gör:

### Command att köra:

```
/compound-engineering:deepen-plan

Target: portable-kit/tools/wapt/ROADMAP.md

Producera references/*.md för varje fas:s listade research questions.
Läs PROJECT.md och BLUEPRINT.md för constraints och stack-kontext.

Varje research-fil ska innehålla:
- Current 2026 best-practices
- Version-pins (lib-versioner som fungerar tillsammans)
- Windows-specifika gotchas
- Python 3.12+ kod-exempel
- Externa doc-länkar

Filer att producera (en per topic):
- references/caddy-windows-install.md
- references/mkcert-windows-gotchas.md
- references/localhost-rfc-behavior.md
- references/typer-patterns.md
- references/pydantic-v2-patterns.md
- references/jinja2-caddyfile.md
- references/caddy-admin-api.md
- references/windows-subprocess.md
- references/health-check-patterns.md
- references/contract-testing-light.md
- references/pytest-coverage.md
- references/uv-tool-install.md
- references/heroku-cli-auth.md
- references/sentry-js-sdk.md
- references/jetbrains-external-tools.md
- references/github-pages-patterns.md
- references/rich-tables.md
- references/pyproject-extras.md
- references/playwright-python.md
- references/pack-spec-conformance.md
- references/devcontainer-patterns.md
```

När deepen-plan är klar: **kör omedelbart `/agent:execute-phase 1`**. Stanna inte.

---

## Exekveringssekvens (hands-off förutom check-ins)

```
[NU]  Phase 0 finish     /compound-engineering:deepen-plan
       ↓
      Phase 1             /agent:execute-phase 1
                          ECC-browser på https://ecc.localhost
       ↓ [CHECK-IN #1]   ← tagga Robin: "primary value delivered, fortsätta?"
       ↓
      Phase 2             /agent:execute-phase 2
                          L0 Core: CLI + caddy_wrapper + registry + stamper + mkcert
       ↓ (hands-off)
      Phase 3             /agent:execute-phase 3
                          L0 Operational: health_check + doctor + contract_tests
       ↓ (hands-off)
      Phase 4             /agent:execute-phase 4
                          L0 Harden: coverage ≥80% + v0.1.0rc1 tag
       ↓ [CHECK-IN #2]   ← tagga Robin: "human review krävs innan externa tjänster"
       ↓
      Phase 5             /agent:execute-phase 5
                          L1 Adapters: ghpages + heroku + jetbrains + sentry
       ↓ [CHECK-IN #3]   ← tagga Robin: "Heroku deploy verifierad publikt?"
       ↓
      Phase 6             /agent:execute-phase 6
                          L3 + Packaging: Rich output + uv tool install
       ↓ (hands-off)
      Phase 7             /compound-engineering:test-browser
                          /agent:execute-phase 7
                          Playwright + PACK_SPEC + docs + v0.1.0 release
       ↓ [CHECK-IN #4]   ← tagga Robin: "raise-the-bar resultat + UAT"
       ↓
      DONE               git tag v0.1.0
```

---

## Check-in-gates (de ENDA platserna du stannar)

1. **Efter Phase 1** — primärvärde levererat. Robin kan välja att stoppa här.
2. **Efter Phase 4** — L0 feature-complete. Robin granskar koden manuellt innan L1 rör externa tjänster.
3. **Efter Phase 5 Heroku-deploy** — verifiera publikt URL med Robin.
4. **Efter Phase 7 raise-the-bar + UAT** — final shipping-beslut.

**Förutom dessa fyra: ingen paus.** Inte efter varje wave, inte efter varje fas-slut. Kör på.

---

## Stop-protokoll (när du MÅSTE stanna)

Utöver check-in-gates — stoppa och tagga Robin om:

- Samma fel upprepas 3 gånger trots research i `references/` + context7 MCP
- En modul överskrider LOC-budget med >30%
- Acceptance criteria misslyckas efter 3 fix-försök
- Ett no-touch-constraint skulle behöva brytas för att gå vidare
- Caddy/mkcert/Heroku/Sentry ger oväntade fel (Windows-specifikt, auth-flow, schema-drift)
- Du tappar kontext om vad du ska bygga (läs om AGENTS.md + PLAN.md, annars stoppa)

---

## Arbetsflöde per wave (standard)

```
1. Läs phase-N/PLAN.md wave-beskrivning helt
2. Om ny kodyta: spawna Explore subagent (medium thoroughness)
3. TDD-guide subagent: skriv tester FÖRST (rött)
4. Implementera minimal kod tills tester passerar (grönt)
5. python-reviewer subagent på diff
6. Adressera review-kommentarer
7. Commit: feat(phase-<N>-<wave>): <specifik ändring>
8. Uppdatera BLUEPRINT.md LOC-tracker
9. Uppdatera phase-N/progress.md med wave-status
10. Nästa wave
```

---

## Verify-kommandon (canonical)

```bash
# Unit tests
pytest tests/unit -v

# Integration tests
pytest tests/integration -v

# E2E tests
pytest tests/e2e -v

# Full coverage
pytest --cov=wapt --cov-report=term-missing

# Lint
ruff check src/wapt tests/

# Doctor
wapt doctor

# Contract check
wapt doctor --contract-check

# Install editable
uv tool install --editable .
```

---

## Subagent-routing

| Situation | Subagent |
|-----------|----------|
| Ny kodyta, ny fas | `Explore` (medium thoroughness) |
| Sök befintliga lösningar | `search-first` |
| Skriva tester | `tdd-guide` (enforcer) |
| Python-diff >50 LOC | `python-reviewer` (obligatorisk) |
| Security-känslig kod | `security-reviewer` |
| Lib-dokumentation | `documentation-lookup` + `context7` MCP |
| Live-site test | `e2e-runner` eller direkt Playwright |

Parallel-spawning: ja när waves är oberoende (wave A+B+C i samma fas), nej annars.

---

## Slash-commands du använder

| Command | När |
|---------|-----|
| `/compound-engineering:deepen-plan` | **FÖRSTA HANDLINGEN** — Phase 0 finish |
| `/agent:execute-phase <N>` | Starta fas N |
| `/compound-engineering:resolve_todo_parallel` | Phase 4 TODO-sweep |
| `/compound-engineering:test-browser` | Phase 7 Playwright |
| `/agent:status` | Progress-check (sällan behövs) |
| `/agent:pause-work` | Endast vid check-in-gate |

---

## Fact-Forcing Gate (Windows-specifik)

Denna session har en Claude Code hook som blockerar `Write`-kall utan att du presenterar fakta först. Mönstret:

**Före VARJE Write-kall, inline i samma meddelande:**

```
Facts for <filename>:
1. Readers/callers: <vem/vad som läser filen>
2. No existing file: confirmed via Glob <pattern> → <result>
3. Data files: <None / schema med synthetic values>
4. User instruction verbatim: "<Robins senaste message>"
```

Sen Write-kall. Om du skippar detta: hook blockerar och du måste retry. Det är rutin — bara presentera faktan och kör vidare.

---

## Miljö: Windows 11

- Bash-shell (Git Bash)
- Forward slashes i Caddyfile-innehåll; `pathlib.PurePosixPath` i stampern
- `mkcert` via Scoop om saknas: `scoop install mkcert`
- `caddy` via Scoop om saknas: `scoop install caddy`
- `uv` antagligen redan installerat
- Windows Defender kan prompta vid Caddy första körning — normalt
- Port 443 kan kollidera med Skype/IIS — planera port-mapping om så

---

## Student-tjänster (status 2026-04-21)

| Tjänst | Status | Användning |
|--------|--------|-----------|
| Polypane | Aktiverat | Phase 7 multi-viewport testing |
| Sentry | Aktiverat | Phase 5 sentry_hook JS injection |
| Heroku | Existerande konto | Phase 5 target_heroku deploy |
| Name.com .dev | Ej aktiverat | Phase 7 nice-to-have, inte blocker |
| Codespaces | Ej bekräftat | Phase 7 .devcontainer nice-to-have |

Om Name.com eller Codespaces saknas när en fas behöver dem: skippa den delen med TODO-note i progress.md, fortsätt. Blockera inte på externa konto-aktiveringar.

---

## Anti-patterns — GÖR INTE

- Uppfinn eget config-format (Caddyfile är source of truth)
- Modifiera `sites-enabled/*.caddy` direkt (gå via `wapt add/remove`)
- Skippa tester (TDD är no-touch)
- Addera features inte i ROADMAP utan Robins explicit tillstånd
- Bygg L2-deferred features (live_reload, snapshot_restore, cloudflared subcommand) i v1
- Amend:a pushade commits
- `git add -A` — specificera filer eller katalog
- Force-push på main
- Skipping pre-commit hooks (`--no-verify`)
- Committa `caddy/sites-enabled/` runtime-filer (endast templates + top-level Caddyfile committeras)
- Importera L1-moduler ovillkorligt i L0-kod (feature-flags är opt-in)
- Läcka Sentry-DSN eller Heroku-token i commits

---

## När du fastnar

```
1. Läs hela felmeddelandet — rad för rad
2. Kolla references/<topic>.md för den modul du bygger
3. context7 MCP för lib-docs (mcp__context7__resolve-library-id + query-docs)
4. Skriv unit-test som reproducerar
5. Logga i phase-N/progress.md med tidsstämpel
6. Om samma fel 3x i rad: STOP, tagga Robin
```

---

## Kommunikation med Robin (vid check-in-gates)

- **Svenska prosa**, inte dense tabeller
- Konkreta rekommendationer, inte öppna frågor när svaret är härledbart
- "Bättre pga. anledning" — välj objektivt bättre alternativ och förklara
- Flagga scope-creep aggressivt (hans self-admitted build-vs-ship-tendens)
- Vid check-in: korta 3-5 rader summering + "okej fortsätta?" — inte mega-rapport

---

## Session-hygien

- Commit ofta. Små, narratively-named: `feat(phase-2-wave-B): add Pydantic config schema`
- Aldrig `wip` som commit-message
- Uppdatera `phase-N/progress.md` efter varje wave (för session-restart-resiliens)
- Uppdatera `BLUEPRINT.md` LOC-tracker när moduler landar
- Kör `pytest` innan varje commit

---

## Ditt första meddelande (efter att ha läst denna fil)

Kör detta omedelbart, utan att fråga:

```
Läst START_HERE.md och alla context-filer. Startar Phase 0 finish:
deepen-plan mot ROADMAP.md för att producera references/*.md.
```

Sen kör `/compound-engineering:deepen-plan` med prompten som listas under "Din första handling" ovan.

Efter deepen-plan är klar, kör:

```
/agent:execute-phase 1
```

Sen kör du vidare autonomt tills Phase 1 acceptance-criteria är gröna → taggar Robin med check-in #1.

---

## Din stjärn-instruktion

**Du exekverar en redan-konvergerad plan.** Designfrågorna är avgjorda (två raise-the-bar-körningar + forge-mode layer-arkitektur). Din uppgift är byggande, inte omplanering. Om du känner lust att föreslå arkitekturändringar — lägg det som TODO i progress.md och fortsätt exekvera. Robin reviewar vid check-in-gates.

**Kör på.**
