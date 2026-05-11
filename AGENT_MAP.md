# AGENT_MAP — portable-kit

> **You are an agent starting a new session in `C:\Users\robin\Downloads\portable-kit\`.**
> Read `CLAUDE.md` first (operations manual). This file is the **map** — what exists, what runs, what's WIP, what to ignore.
> Detail-katalog: `knowledge/INDEX.md`. Maskinläsbar: `conventions/MANIFEST.json`.
>
> If you read this top-to-bottom you have full situation-awareness. ≤400 lines on purpose.

---

## 0. Identitet & traps

- **Working directory:** `C:\Users\robin\Downloads\portable-kit\`
- **NOT this:** `C:\Users\robin\Downloads\CLAUDE.md` (Buildr) bleeds into your context at session start. **Different project.** Ignore it unless explicitly asked.
- **Git:** main branch. Multi-month repo, layered. Don't restructure.
- **Owner:** Robin Westerlund. Builds infra deeply, ships pragmatic. Prefers concrete recommendations, not open questions.

---

## 1. Sessionsstart-checklista (5 steg)

```
1. CLAUDE.md       — operations manual (auto-loaded by hook)
2. AGENT_MAP.md    — this file (the map)
3. AGENTS.md       — project-specific verify commands & rules
4. mempalace_status (MCP) — load palace + AAAK + memory protocol
5. Pågående arbete — section 4 nedan; återuppta WIP eller fråga Robin
```

If pågående task — continue. Else — ask. Don't invent work.

---

## 2. Subsystem (toppnivå)

Status: **LIVE** = aktivt utvecklat | **STABLE** = fungerar, rörs sällan | **WIP** = pågår | **STUB** = tom/path-anchor | **ARCHIVED** = experiment, rör inte

| Mapp | Roll | Ingång | Verify | Status |
|------|------|--------|--------|--------|
| `knowledge/` | Kunskapsbas: gamechangers, skills, agents, meta-skills (47+ filer) | `knowledge/INDEX.md` | — (text) | STABLE |
| `knowledge-base/` | **Separat 3-lagers KB** (Domain / Methods / Components) — operativ infrastruktur, ej dokumentation. Egen CLAUDE.md, templates, schema. | `knowledge-base/CLAUDE.md` → `VISION.md` → `ARCHITECTURE.md` → `INDEX.md` | `python knowledge-base/scripts/validate_kb_frontmatter.py` (+ `kb_doctor.py`) | LIVE |
| `skill-engine/` | 5-stegs beslutspipeline (Intake→Resolve→Eval→Adapt→Verify), 38 short skills | `skill-engine/PROTOCOL.md` | — | STABLE |
| `skill-creator/` | Skill-fabrik: skapa, testa, iterera, paketera | `skill-creator/SKILL.md` | `python skill-creator/scripts/quick_validate.py` | STABLE |
| `protocols/` | small-model-premium, agent-orchestration, architecture-audit | `protocols/small-model-premium.md` | — | STABLE |
| `conventions/` | FOR_AGENTS, PRINCIPLES, MANIFEST.json (maskinläsbar) | `conventions/MANIFEST.json` | `python -c "import json; json.load(open('conventions/MANIFEST.json'))"` | STABLE |
| `scaffolds/` | Projektmallar: Rust / TypeScript / Python | `scaffolds/{rust,typescript,python}-agent.md` | — | STABLE |
| `runtime/` | Rust workspace, 4 crates → 4 binärer | `runtime/Cargo.toml` | `cargo build --release` (i runtime/) | STABLE |
| `mempalace/` | AI memory: ChromaDB + KG + AAAK. CLI + MCP-server (19 tools) + hooks. v3.1.0 | `mempalace/README.md` | `pytest mempalace/tests/` | LIVE (installed) |
| `kb-forge/` | KB-builder: scrape→chunk→store→query. CLI + MCP (5 tools) + GAN-harness | `kb-forge/README.md` | `cd kb-forge && pytest -v` (77 tests) | LIVE (UI WIP) |
| `tools/wapt/` | Lokal TLS web appliance (Caddy + mkcert) → `https://ecc.localhost`. AUTONOMOUS BUILD | `tools/wapt/START_HERE.md` | `cd tools/wapt && pytest tests/{unit,integration,e2e} && wapt doctor` | WIP (Phase 2 pågår) |
| `skills/` | KB-Forge skill-paket: `skill-kb-{scrape,context,query}` | `skills/skill-kb-*/SKILL.md` | — | LIVE |
| `project-wiki/` | Genererar 2.5 MB självstående HTML-wiki för valfritt repo | `project-wiki/SKILL.md` | `python project-wiki/scripts/generate.py --repo .` | LIVE |
| `agents/` | `kb_builder_harness/` är **TOM** — riktig kod i `kb-forge/src/kb_forge/agents/` | (tom) | — | STUB |
| `workspace/` | Buildr-stil arbetsytor: siex-platform-audit, workspace-buildr-proto, writer-tool-commit | `workspace/*/README.md` | — | ARCHIVED (experiment) |
| `docs/` | Output: forge-artifacts, showcases, plans, night-projects, superpowers | `docs/` (browse) | — | LIVE (skill-fabrik output) |
| `research/` | 2 day-1 reports (agentic-platform) | `research/*.md` | — | STABLE (snapshot) |
| `portable-kit/` | **Stale duplicate**: `portable-kit/tools/wapt/src/wapt/` är tom. Path-anchor från reorg. | — | — | DEAD — flytta inte hit |

**Hela tools/-träd:** `tools/wapt/` (det levande), `tools/` (rooten kan innehålla repo-tools — kolla vid behov).

### Top-level filer

| Fil | Roll |
|-----|------|
| `CLAUDE.md` | Operationsmanual (auto-loaded vid sessionsstart) |
| `AGENT_MAP.md` | **DENNA FIL** — kartan |
| `AGENTS.md` | Projektspecifika regler + verify (template-state, behöver fyllas av Robin per projekt) |
| `AGENTS.template.md` | Källan för AGENTS.md |
| `README.md` | Människo-overview |
| `HANDOFF-UI-BUILD.md` | WIP-handoff för KB-Forge UI (se §4) |
| `bootstrap.sh` | Ett kommando: bygger Rust runtime + validerar |
| `mempalace.yaml` | MemPalace-config |

---

## 3. Capabilities — vad kan jag göra här?

### 3a. Runtime-binärer (efter `./bootstrap.sh` → `runtime/target/release/`)

| Binär | Användning | När |
|-------|-----------|-----|
| `ob1` | `ob1 -p "prompt"` | Full agentic loop (18 primitives, sessions, budget, permissions) |
| `claw-mini` | `claw-mini -p "prompt"` | Lättviktsversion |
| `snowball` | `snowball <dir> <out>` | Analysera kodbas, extrahera kunskap |
| `claw-gateway` | `claw-gateway -p 8080` | HTTP API som bridgar agent-runtimes |

Alla kräver `ANTHROPIC_API_KEY`.

### 3b. MCP-servrar

| Server | Tools | Status | Setup |
|--------|-------|--------|-------|
| **mempalace** | 19 (palace, KG, navigation, diary) | LIVE — auto-loaded i Claude Code | `mempalace_status` för full lista |
| **kb-forge** | 5 (kb_scrape, kb_build, kb_list, kb_query, +1) | OPT-IN | `python -m kb_forge.mcp_server` via Claude Desktop config |

MemPalace-tools-prefix: `mcp__mempalace__mempalace_*`. Använd vid: minne, person, projekt, historik.

### 3c. Skills att åberopa (3 källor)

1. **Globala / installerade skills** (visas i din skill-lista) — t.ex. `200k-blueprint`, `archon`, `raise-the-bar`, `planning-with-files`, `oh-my-claudecode:*`. Kalla via `Skill`-verktyget.
2. **Repo-interna skills** — `skill-engine/explicit-skills.md` (19 caps) + `implicit-skills.md` (19 arkitektur). Resolver-pipeline väljer rätt åt dig.
3. **Projektlokala skills** — `.skills/` (skapas av skill-engine adapter när uppgift kräver det). Tom just nu.

Plus 25 meta-skills i `knowledge/meta-skills/*/SKILL.md` (200k-blueprint, skill-forge, kb-document-factory, harness-engineering, repo-rescue, project-launcher, session-launcher, systematic-research, youtube-video-digest, legitimacy-block, m.fl.).

### 3d. Agentritningar att spawna (knowledge/agents/)

| Agent | Behörighet | Använd för |
|-------|-----------|-----------|
| `agent_deep_analyst.md` | ReadOnly | Analysera kodbas, extrahera mönster |
| `agent_skill_synthesizer.md` | WorkspaceWrite | Förvandla kunskap → konkreta skills |
| `agent_gamechanger_scout.md` | ReadOnly | Hitta de 10% mönster som ger 90% värde |
| `agent_snowball_orchestrator.md` | DangerFullAccess | Koordinera hel kunskapsextraktionspipeline |
| `agent_pattern_combinator.md` | WorkspaceWrite | Hitta nya kombinationer av befintliga mönster |

Plus inbyggda subagents (Agent-tool): `Explore`, `Plan`, `general-purpose` + plugin-agenter (`oh-my-claudecode:*`, `everything-claude-code:*`).

### 3e. Pipelines

| Pipeline | Spec | När |
|----------|------|-----|
| **Skill-engine 5-stegs** | `skill-engine/PROTOCOL.md` | Komplex uppgift, rätt tillvägagångssätt ej uppenbart |
| **Skill-creator** | `skill-creator/SKILL.md` | Helt ny förmåga behövs |
| **GAN-harness** | `kb-forge/src/kb_forge/agents/kb_builder_harness/` | Bygg KB autonomt (Planner→Generator→Evaluator→loop) |
| **wapt 8-fas autonom build** | `tools/wapt/ROADMAP.md` + `START_HERE.md` | Bara om du explicit jobbar inuti `tools/wapt/` |
| **Archon workflows** (10 yaml) | `.archon/workflows/*.yaml` | Förfärdiga: blueprint-product, forge-skill, market-intel, seo-audit, showcase, youtube-skill, night-a-writer-tool, night-c-launch-package, repo-rescue |

---

## 4. Pågående arbete & WIP

### 4a. tools/wapt/ — autonom build pågår
- 7 fasmappar i `tools/wapt/.agent/phases/` (Phase 1=ecc-bridge → Phase 7=integration-docs)
- Aktivitet i Phase 1 + 2 enligt senaste session
- **Wapt har egen agent-mode (AUTONOMOUS, 4 check-in-gates).** Om du jobbar inuti `tools/wapt/`, läs `tools/wapt/START_HERE.md` istället för portable-kit/CLAUDE.md som primär guide. Wapt har egen CLAUDE.md, AGENTS.md, BLUEPRINT.md, ROADMAP.md, PROJECT.md.

### 4b. KB-Forge UI — `HANDOFF-UI-BUILD.md`
- Core klar (77 tester). UI-filer skapade i `kb-forge/ui/` men behöver testas.
- Nästa steg specat i HANDOFF-filen: testa `from server import app`, fixa import-paths, starta `uvicorn`.

### 4c. Övrigt
- `docs/night-projects/{a,b,c}/` — tre parallella nattjobb. Kolla `progress.md` om du ska fortsätta.
- `workspace/*` — historik, **inte** aktiva uppgifter.

---

## 5. Verify- & drift-kommandon

### Repo-wide
```bash
./bootstrap.sh                    # Bygger runtime, validerar, rapporterar "redo"
```

### Per subsystem
```bash
# kb-forge
cd kb-forge && pytest -v && ruff check src/ tests/

# tools/wapt
cd tools/wapt && pytest tests/unit -v && pytest tests/integration -v && wapt doctor && ruff check src/wapt

# mempalace
cd mempalace && pytest tests/

# runtime (Rust)
cd runtime && cargo build --release && cargo test

# skill-creator
python skill-creator/scripts/quick_validate.py <skill-path>

# knowledge-base (frontmatter + doctor)
pip install -r knowledge-base/scripts/requirements-kb.txt
python knowledge-base/scripts/validate_kb_frontmatter.py
python knowledge-base/scripts/kb_doctor.py
```

### MANIFEST validering
```bash
python -c "import json; json.load(open('conventions/MANIFEST.json'))"
```

---

## 6. Tysta zoner & kända luckor

| Plats | Vad | Action |
|-------|-----|--------|
| `agents/kb_builder_harness/` | TOM mapp | Riktig kod: `kb-forge/src/kb_forge/agents/kb_builder_harness/` |
| `portable-kit/` (submapp) | `portable-kit/tools/wapt/src/wapt/` är **tom**. Path-anchor från reorg. | DEAD. Skriv inte hit. Levande versionen: `tools/wapt/` |
| `.skills/` | Tom — fylls av skill-engine adapter | OK |
| `.codeboarding/` | Bara `.codeboardingignore` | Ignorera |
| `.archon/commands/` | Tom | OK — workflows ligger i `.archon/workflows/` |
| `AGENTS.md` | Template-state (placeholder-fält) | Robin fyller per projekt |
| `C:\Users\robin\Downloads\CLAUDE.md` | Buildr-system, **annat projekt** | Bleeds in via Claude Code root-CLAUDE. Ignorera. |

### Dotfolders — agent-relevans

| Dotfolder | Roll | Rör? |
|-----------|------|------|
| `.archon/workflows/` | 10 yaml-workflows | Använd via `archon`-skill |
| `.omc/state/` | oh-my-claudecode runtime state | Läs ej manuellt |
| `.cursor/` | Cursor IDE skills + rules | Aktiv om du kör Cursor |
| `.claude/` | Claude Code hooks-config | Aktiv vid varje session |
| `.skills/` | Projektlokala skapade skills | Skapas dynamiskt |
| `.codeboarding/` | Codeboarding-config | Ignorera |

### Empty placeholder dirs (Robin-intent, not yet populated)

`.benchmarks/`, `.experiments/`, `.sort-or-delete/`, `.we-want-new-purpose/`, `archived/` — alla tomma. Robins egna intent-mappar (sortera, experimentera, eventuellt radera). **Skriv inte hit utan att fråga först.** Validator-skriptet ignorerar dem aktivt; om en av dem fylls med innehåll: lyft upp den i §2 eller flytta innehållet till rätt subsystem.

---

## 7. Snabbreferens — "I need..."

| Behov | Läs / kör |
|-------|----------|
| Bygga multi-turn agent | `knowledge/skills/skill_build_agentic_loop.md` |
| Spara/återuppta sessions | `knowledge/skills/skill_session_management.md` |
| Tool permissions | `knowledge/skills/skill_tool_permission_system.md` |
| MCP-klient | `knowledge/skills/skill_mcp_client.md` |
| Hooks-system | `knowledge/skills/skill_hook_system.md` |
| Token budget | `knowledge/skills/skill_token_budget.md` |
| Persistent minne | mempalace MCP — `mempalace_status` först |
| Bygg ny skill | `skill-creator/SKILL.md` |
| Komplex uppgift router | `skill-engine/PROTOCOL.md` |
| Multi-agent koordinering | `protocols/agent-orchestration.md` |
| Kvalitet på output | `protocols/small-model-premium.md` (5 faser) |
| Pre-prod arkitekturaudit | `protocols/architecture-audit.md` |
| Nytt Rust/TS/Python-projekt | `scaffolds/{rust,typescript,python}-agent.md` |
| Bygg KB från en doc-sajt | `kb-forge/README.md` |
| Genererera HTML-wiki för valfritt repo | `project-wiki/SKILL.md` |
| Lokal HTTPS web appliance | `tools/wapt/START_HERE.md` |
| Pressure-testa artefakt | Skill `raise-the-bar` |
| Blueprinta ny produkt | Skill `200k-blueprint` |
| Plan komplex uppgift med filer | Skill `planning-with-files` |

---

## 8. Hold the map honest

**Drift-detektor:** `tools/validate_agent_map.py` (Phase 5 deliverable — uppdatera denna fil när nya subsystem läggs till).

**Regel:** När du lägger till en top-level mapp med egen README/CLAUDE.md/SKILL.md:
1. Lägg till rad i §2 (Subsystem)
2. Lägg till entry i `conventions/MANIFEST.json`
3. Kör validatorn → ska vara grön

**Den här filens målstorlek:** ≤ 400 rader. Allt över → länka till källfil.

---

*Senaste uppdatering: 2026-05-09. Designat för rooting test: en agent ska efter denna fil + nivå-1-länkar kunna svara på (a) vilka körbara subsystem finns, (b) verify per subsystem, (c) MCP-tools, (d) skills/agents, (e) pågående WIP.*
