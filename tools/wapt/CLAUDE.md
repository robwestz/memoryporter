# wapt — CLAUDE.md

> Operationsmanual specifikt för Claude Code när den arbetar inuti `portable-kit/tools/wapt/`.

---

## Vid sessionsstart

```
1. Läs denna fil
2. Läs AGENTS.md (verify-kommandon, subagent-routing)
3. Läs PROJECT.md (constraints, stakeholder, bar, no-touch)
4. Läs BLUEPRINT.md (arkitektur, moduler, datakontrakt)
5. Läs ROADMAP.md (fas-ordning)
6. Identifiera aktiv fas (från git-branch eller .agent/config.yaml)
7. Läs phase-<N>/PLAN.md + progress.md för state
8. Om pågående wave → fortsätt den
9. Annars → fråga Robin vad som ska göras nästa
```

---

## Prioritetsordning vid konflikt

Om instruktioner konfligerar mellan dokument:

1. Robins senaste direktiv (denna session)
2. `PROJECT.md` no-touch
3. `ROADMAP.md` acceptance criteria
4. `BLUEPRINT.md` arkitekturprinciper
5. `AGENTS.md` verify-kommandon
6. Detta dokument
7. `portable-kit/CLAUDE.md` parent-konventioner

---

## Task-routing

| Uppgift | Routing |
|---------|---------|
| Starta ny fas | `/agent:execute-phase <N>` |
| Fortsätta pågående wave | Läs `phase-<N>/progress.md` → fortsätt från senaste punkten |
| Bugfix efter wave-slut | Skriv test som reproducerar → fix → verify → commit |
| Ny feature inte i ROADMAP | Stoppa. Fråga Robin. Föreslå L2-deferred-slot om relevant. |
| Refactoring | Endast om PLAN.md explicit kräver det eller efter Phase 4 |
| Docs-uppdatering | Efter varje wave, direkt i AGENTS.md |
| Extern lib-query | context7 MCP (`mcp__context7`), inte WebSearch |

---

## Subagent-spawning — default regler

- **Explore**: varje ny fas, varje gång kodyta > 5 filer → spawn först, annars direkt
- **tdd-guide**: obligatorisk för varje ny modul i Phase 2, 3, 5
- **python-reviewer**: obligatorisk efter varje diff >50 LOC
- **security-reviewer**: obligatorisk för `mkcert_integration`, `sentry_hook`, auth-flöden
- **raise-the-bar light**: Phase 0 charter-check, Phase 7 final
- **Parallel-spawning**: ja när uppgifterna är oberoende (wave A + wave B + wave C i samma fas), nej annars

---

## Kvalitetsprotokoll

För allt substantiellt arbete i wapt (ny modul, debugging, arkitekturbeslut), följ **small-model premium protocol** från portable-kit:

**Fas 0 — Kontrakt (tyst):** Omformulera mål, lista constraints från PROJECT.md
**Fas 1 — Dekomponera:** 3-7 verifierbara steg per wave
**Fas 2 — Exekvera:** Huvudsvar med konkreta artefakter (diff + tester)
**Fas 3 — Motståndspass:** Mest troliga felmode? Antaganden utan bevis? Skipade kantfall?
**Fas 4 — Deltasammanfattning (ALLTID SYNLIG):**
```
- Antaganden: ...
- Risker / kantfall: ...
- Vad jag INTE verifierade: ...
```

Full spec: `portable-kit/protocols/small-model-premium.md`

---

## Test-driven flow

Detta är no-touch — TDD tillämpas för varje ny modul:

```
1. Läs PLAN.md för modulen → acceptance criteria
2. Skriv testfil i tests/unit/test_<module>.py
3. Implementera tester som MÅSTE passera (röd fas)
4. Kör pytest — verifiera röda
5. Skriv minimal implementation → grön fas
6. Refactor endast om coverage vill ha det
7. python-reviewer subagent
8. Commit wave
```

Skippa aldrig röd-fas-verifieringen. Tester som alltid passerar är värdelösa.

---

## Windows-specifika rutiner

Robin kör Windows 11 bash (Git Bash/WSL). Några gotchas:

1. **Forward slashes i Python-paths.** Använd `pathlib.PurePosixPath` eller `Path.as_posix()` för Caddyfile-innehåll.
2. **Line endings.** Konfigurera `.gitattributes` för `*.caddy text eol=lf` — Caddy på Windows hanterar LF korrekt men inte CRLF.
3. **mkcert PATH.** Windows installerar mkcert via Chocolatey eller Scoop. Fallback: `where mkcert` i `mkcert_integration.py`.
4. **Caddy service vs foreground.** På Windows kör Caddy oftast som foreground-process. Inget systemd. `wapt start` startar Caddy i bakgrunden via `subprocess.Popen` + DETACHED_PROCESS flag.
5. **Port 2019 trust.** Windows Defender kan fråga om nätverksåtkomst första gången. Dokumentera i AGENTS.md.
6. **`%APPDATA%\JetBrains\`** för External Tools XML — inte `~/.JetBrains/`.

---

## Session-hygien

- Commit ofta. Små, narratively-named commits (`feat(caddy-wrapper): add Admin API reload`, inte `wip`)
- Aldrig force-push på main
- Aldrig amend commits som redan pushat
- Aldrig `git add -A` — explicit filer eller `git add src/ tests/`
- Aldrig skipping pre-commit hooks (`--no-verify`) utan Robins explicit tillstånd

---

## När du inte är säker

Säg det. Beskriv:
- Vad du försökte
- Vad som förväntades
- Vad som faktiskt hände
- Vad du misstänker

Gissa aldrig. Hitta inte på förmågor du inte har. Det är bättre att stanna och fråga än att producera fel implementation snabbt.

---

## Referenser i portable-kit parent

- `portable-kit/CLAUDE.md` — parent agent manual
- `portable-kit/protocols/small-model-premium.md` — kvalitetsprotokoll
- `portable-kit/protocols/agent-orchestration.md` — multi-agent patterns
- `portable-kit/skill-engine/` — skill routing + evaluation
- `portable-kit/knowledge/INDEX.md` — kunskapsbas-katalog
