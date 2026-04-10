# Portable Agent Kit

Du har ett komplett toolkit för autonom utveckling. Denna fil är din operationsmanual.
Läs den vid sessionsstart. Följ den.

---

## Sessionsstart

```
1. Läs denna fil (du gör det nu)
2. Läs AGENTS.md i projektroten (verify-kommandon, stack, regler)
3. Anropa mempalace_status (MCP) — laddar palace-översikt + AAAK-spec + minnesprotokoll
4. Skanna knowledge/INDEX.md för tillgängliga mönster
5. Kolla .skills/ för projektlokala anpassade skills
6. Om en pågående uppgift finns → fortsätt den
7. Annars → fråga vad som ska göras
```

---

## Uppgiftsrouting

När du får en uppgift, följ denna beslutskedja:

### 1. Trivial uppgift (matchar en skill exakt, priority >= 9)
→ Använd skillen direkt. Ingen pipeline.

### 2. Komplex uppgift (rätt tillvägagångssätt är inte uppenbart)
→ Kör skill-engine pipeline (5 steg):

```
INTAKE → RESOLVE → EVAL → ADAPT → VERIFY
```

1. **Intake**: Fånga intent som testbar YAML (mål, anti-mål, framgångskriterier)
2. **Resolve**: Sök bland 38 short skills + knowledge/skills/, poängräkna och välj bästa kandidat
3. **Eval**: Dubbelriktad analys — framåtkontroll + bakåtprofil → förbättringskarta
4. **Adapt**: Kopiera skill till `.skills/`, applicera förbättringar, injicera projektkontext
5. **Verify**: Exekvera och verifiera output mot ursprungliga framgångskriterier

Fullständig specifikation: `skill-engine/PROTOCOL.md`

Om eval ger coverage < 70: loopa tillbaka till Resolve (max 2 loopar).
Om constraint violation: automatisk fail.

### 3. Ny förmåga behövs (ingen befintlig skill passar)
→ Använd skill-creator för att bygga en ny skill:
1. Fånga intent och intervjua
2. Skriv skill-utkast + testfall
3. Kör parallella tester (with-skill vs baseline)
4. Betygsätt, analysera, iterera

Fullständig specifikation: `skill-creator/SKILL.md`

### 4. Parallellt/multi-agent-arbete
→ Följ orkestreringsprotokolllet:
- Fan-out/fan-in (parallella ReadOnly-agenter → syntes → implementation)
- Pipeline (sekventiell beroendekedja)
- Supervisor + workers (checkpoint-baserad)

Fullständig specifikation: `protocols/agent-orchestration.md`

---

## Kvalitetsprotokoll

För allt substantiellt arbete (implementation, debugging, arkitektur, kodgranskning), följ small-model premium protocol:

**Fas 0 — Kontrakt (tyst):** Omformulera mål, lista begränsningar
**Fas 1 — Dekomponera:** 3-7 verifierbara steg
**Fas 2 — Exekvera:** Huvudsvar med konkreta artefakter
**Fas 3 — Motståndspass (OBLIGATORISKT):** Mest troliga felmode? Antaganden utan bevis? Skipade kantfall?
**Fas 4 — Deltasammanfattning (ALLTID SYNLIG):**
```
- Antaganden: ...
- Risker / kantfall: ...
- Vad jag INTE verifierade: ...
```

Fullständig specifikation: `protocols/small-model-premium.md`

---

## Mappstruktur

```
portable-kit/
├── CLAUDE.md                    ← DU LÄSER DENNA
├── AGENTS.md                    ← Projektspecifika regler + verify-kommandon
├── bootstrap.sh                 ← Ett kommando: bygg allt, validera, "redo"
│
├── knowledge/                   ← KUNSKAPSBAS
│   ├── INDEX.md                 ← Katalog över allt innehåll
│   ├── ONBOARDING.md            ← Snabbstart: hur man använder kitet
│   ├── GAPS.md                  ← Kända luckor + byggordning
│   ├── gamechangers/            ← 15 arkitekturinsikter (VARFÖR)
│   │   gc_generic_runtime.md       Byt komponent utan att röra kärnan
│   │   gc_auto_compaction.md       Oändliga konversationer
│   │   gc_permission_escalation.md Graduerat förtroende per verktyg
│   │   gc_session_snapshot.md      En fil = komplett tillstånd
│   │   gc_pre_turn_budget.md       Stoppa FÖRE överförbrukning
│   │   gc_staged_boot.md           Kontext före första prompten
│   │   gc_doctor_pattern.md        Vet vad som är trasigt
│   │   gc_memory_system.md         Minne med härstamning
│   │   gc_subagent_spawning.md     Parallella agenter med rätt verktyg
│   │   gc_tool_pool_assembly.md    Rätt verktyg, rätt kontext
│   │   gc_multi_transport_mcp.md   Anslut till ALLA verktygsservrar
│   │   gc_shell_hooks.md           Utöka beteende utan omkompilering
│   │   gc_scoped_config.md         Rätt config på rätt nivå
│   │   gc_markdown_streaming.md    Bryt aldrig kodblock mid-render
│   │   gc_sse_incremental.md       Hantera alla chunk-storlekar
│   │
│   ├── skills/                  ← 15 implementationsrecept (HUR)
│   │   skill_build_agentic_loop.md
│   │   skill_tool_permission_system.md
│   │   skill_session_management.md
│   │   skill_mcp_client.md
│   │   skill_hook_system.md
│   │   skill_sub_agent_spawning.md
│   │   skill_config_hierarchy.md
│   │   skill_doctor_pattern.md
│   │   skill_token_budget.md
│   │   skill_tool_pool_assembly.md
│   │   skill_memory_system.md
│   │   skill_staged_boot.md
│   │   skill_streaming_renderer.md
│   │   skill_system_event_logging.md
│   │   skill_workflow_state.md
│   │
│   └── agents/                  ← 5 spawnbara agentritningar (VEM)
│       agent_deep_analyst.md       ReadOnly — analysera kodbaser
│       agent_skill_synthesizer.md  WorkspaceWrite — transformera kunskap till skills
│       agent_gamechanger_scout.md  ReadOnly — hitta transformativa mönster
│       agent_snowball_orchestrator.md DangerFullAccess — orkestrera pipeline
│       agent_pattern_combinator.md WorkspaceWrite — kombinera mönster
│
├── skill-engine/                ← BESLUTSMOTOR (5-stegs pipeline)
│   ├── PROTOCOL.md              ← Tillståndsmaskin + gates (kärnläsningen)
│   ├── intake.md                ← Steg 1: Fånga intent som YAML
│   ├── resolver.md              ← Steg 2: Hitta/skapa bästa skill
│   ├── eval-engine.md           ← Steg 3: Dubbelriktad utvärdering
│   ├── adapter.md               ← Steg 4-5: Anpassa + verifiera
│   ├── skill-spec.md            ← YAML-format för skills
│   ├── explicit-skills.md       ← 19 capability-skills
│   ├── implicit-skills.md       ← 19 arkitektur-skills
│   └── loader-blueprint.md      ← Urval och ranking av skills
│
├── skill-creator/               ← SKILL-FABRIK
│   ├── SKILL.md                 ← Huvudspec: skapa + iterera skills
│   ├── agents/
│   │   ├── grader.md            ← Betygsätt assertions mot output
│   │   ├── comparator.md        ← Blind A/B-jämförelse
│   │   └── analyzer.md          ← Mönsterdetektion + förbättringar
│   ├── references/              ← Best practices, schemas, workflows
│   ├── scripts/                 ← Python-verktyg (eval, benchmark, package)
│   └── eval-viewer/             ← Interaktiv HTML-granskare
│
├── protocols/                   ← KVALITET + ORKESTRERING
│   ├── small-model-premium.md   ← 5-fas kvalitetsprotokoll
│   ├── agent-orchestration.md   ← Fan-out/pipeline/supervisor
│   └── architecture-audit.md    ← 12-primitiv produktionsaudit
│
├── conventions/                 ← REGLER + STANDARDER
│   ├── FOR_AGENTS.md            ← Kanonisk agentmanifest
│   ├── PRINCIPLES.md            ← Arkitekturstandard
│   └── MANIFEST.json            ← Maskinläsbart resursindex
│
├── scaffolds/                   ← PROJEKTMALLAR
│   ├── rust-agent.md            ← Rust: Cargo workspace, trait-baserad runtime
│   ├── typescript-agent.md      ← TypeScript: Node.js CLI, interface-baserad
│   └── python-agent.md          ← Python: Click CLI, ABC-baserad
│
├── runtime/                     ← RUST-RUNTIME (4 crates)
│   ├── Cargo.toml               ← Workspace-rot
│   ├── Cargo.lock
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── crates/
│       ├── ob1-runtime/         ← 18 primitives, full agentic CLI
│       ├── mini-runtime/        ← Lättvikt agentic CLI
│       ├── snowball-agent/      ← Kunskapsextrahering
│       └── claw-gateway/        ← HTTP API gateway
│
├── mempalace/                   ← MINNESSYSTEM (MemPalace v3.1.0)
│   ├── mempalace/               ← Python-paket (CLI + MCP-server med 19 verktyg)
│   └── hooks/                   ← Auto-save hooks (Stop + PreCompact)
│
├── .skills/                     ← PROJEKTLOKALA SKILLS (skapas under arbete)
│
└── .cursor/                     ← IDE-INTEGRATION (Cursor)
    ├── skills/
    │   └── small-model-premium-protocol/
    └── rules/
        └── agentic-starter-defaults.mdc
```

---

## Runtime-binärer

Efter `./bootstrap.sh` finns dessa i `runtime/target/release/`:

| Binär | Kommando | Vad den gör |
|-------|----------|-------------|
| **ob1** | `ob1 -p "prompt"` | Full agentic runtime (18 primitives, sessions, budget, permissions) |
| **claw-mini** | `claw-mini -p "prompt"` | Lättvikt runtime (snabbare, enklare) |
| **snowball** | `snowball <sökkatalog> <utdata>` | Analyserar kodbaser, extraherar kunskap |
| **claw-gateway** | `claw-gateway -p 8080` | HTTP API som bridgar agent-runtimes |

Alla kräver `ANTHROPIC_API_KEY` i miljövariabler.

### Använda runtime som bibliotek

I ett Rust-projekt:
```toml
[dependencies]
ob1-runtime = { path = "portable-kit/runtime/crates/ob1-runtime" }
```

### Använda runtime som subprocess

Från Node.js/Python:
```javascript
const { execFile } = require('child_process');
execFile('./portable-kit/runtime/target/release/ob1', ['-p', 'Sammanfatta README.md']);
```

---

## Snabbreferens — Vad löser vad

| Problem | Gamechanger (VARFÖR) | Skill (HUR) |
|---------|---------------------|-------------|
| Behöver multi-turn agent-loop | Generic Runtime | Build Agentic Loop |
| Kontextfönster fylls | Auto-Compaction | (inbyggd i agentic loop) |
| Behöver åtkomstkontroll för verktyg | Permission Escalation | Tool Permission System |
| Vill ha pluggbara verktyg | Multi-Transport MCP | Build MCP Client |
| Behöver spara/återuppta konversationer | Session Snapshot | Session Persistence |
| Vill ha utökningsbarhet utan omkompilering | Shell Hooks | Hook System |
| Behöver kostnadskontroll | Pre-Turn Budget | Token Budget |
| Behöver hälsoövervakning | Doctor Pattern | Doctor Health Check |
| Agent behöver kontext före första prompten | Staged Boot | Staged Boot Sequence |
| Behöver rätt verktyg per kontext | Tool Pool Assembly | Tool Pool Assembly |
| Behöver beständigt minne | Memory System | **MemPalace** (installerat, MCP-server aktiv) |
| Multi-nivå konfiguration | Scoped Config | Config Hierarchy |
| Parallellt agentarbete | Sub-Agent Spawning | Sub-Agent Spawning |

---

## Skill-engine: När använda pipelinen vs direkt

| Situation | Gör detta |
|-----------|-----------|
| Enkel filredigering, enradig fix | Gör det direkt |
| Fråga som matchar en skill exakt (priority >= 9) | Använd skillen direkt |
| Komplex uppgift, rätt approach ej uppenbar | Kör Intake → Resolve → Eval → Adapt → Verify |
| Utforskning utan leverabel | Spawna explore-agent |
| Nöd-debugging | Använd `stuck` eller `debug` skill direkt |
| Helt ny förmåga behövs | Skill-creator workflow |

---

## Skill-promotion (virtuös cykel)

När en projektlokal skill i `.skills/` används framgångsrikt:
- **1:a användning:** Behåll som working skill
- **2:a användning:** Förfinera triggers och formulering
- **3:e användning:** Promotera till permanent korpus i `skill-engine/explicit-skills.md`

---

## Agenttyper och behörighetsnivå

| Agenttyp | Behörighet | Verktyg | Användning |
|----------|-----------|---------|------------|
| Analyst / Scout | ReadOnly | read, glob, grep, web | Analys utan risk |
| Implementer | WorkspaceWrite | + write, edit, todo | Skriver till projektfiler |
| Orchestrator | WorkspaceWrite | + plan, state | Hanterar planer och tillstånd |
| Full-access | DangerFullAccess | + bash, agent, REPL | Shell, nätverk, git |

Spawna sub-agenter med **lägsta möjliga behörighet**. Se `protocols/agent-orchestration.md`.

---

## Konventioner

1. **AGENTS.md är enda källan för verify-kommandon** — CI ska spegla samma kommandon
2. **Alla skills är agnostiska** — inga projektspecifika sökvägar, API:er, beroenden
3. **Originala skills modifieras aldrig** — kopieras till `.skills/` för anpassning
4. **Fas 4 (Deltasammanfattning) är alltid synlig** för användaren
5. **Påstå aldrig "klar" utan bevis** — visa kommandoutput eller filbevis
6. **Säg vad du INTE verifierade** — ärlig om luckor
7. **Smala diffar** — föredra små, granskningsbara ändringar

---

## När något går fel

```
1. Läs hela felmeddelandet
2. Fixa koden/verktyget
3. Testa tills det fungerar
4. Om mönstret upprepas → skapa en discovery-anteckning
5. Om det är en ny typ av misstag → lägg till i guardrails nedan
```

## Guardrails

- Kolla alltid `skill-engine/explicit-skills.md` innan du skapar en ny skill
- Verifiera output-format från ett verktyg innan du kedjar det till nästa
- Anta inte att API:er stödjer batch — kolla först
- Om ett arbetsflöde misslyckas mitt i, spara mellanresultat innan retry
- Läs hela skillen/protokollet innan du börjar — skumma inte
- Fråga om oklarheter istället för att anta
- Skills i `.skills/` är projektspecifika; skills i `skill-engine/` är agnostiska
- Rör aldrig originalkopior i `knowledge/` eller `skill-engine/` — kopiera och anpassa

*(Lägg till nya guardrails när misstag händer. Max 15 stycken.)*

---

## Minnesprotokoll (MemPalace)

MemPalace är installerat som MCP-server med 19 verktyg. Palace: `~/.mempalace/palace/` (3327+ drawers).

### Minneslager

| Lager | Vad | Storlek | När |
|-------|-----|---------|-----|
| **L0** | Identitet | ~50 tokens | Alltid laddad |
| **L1** | Kritiska fakta | ~120 tokens | Alltid laddad |
| **L2** | Room recall | On demand | När ämne dyker upp |
| **L3** | Djupsökning | Obegränsad | Vid explicit fråga |

### Arbetsflöde

1. **Vid sessionsstart:** Anropa `mempalace_status` → palace-översikt + minnesprotokoll
2. **Före svar om person/projekt/händelse:** Sök först med `mempalace_search` — gissa aldrig
3. **Vid osäkerhet:** "Låt mig kolla" → sök i palace
4. **Vid nya fakta:** `mempalace_kg_add` (lägg till) / `mempalace_kg_invalidate` (upphäv gammal)
5. **Vid sessionsslut:** `mempalace_diary_write` för att logga lärdomar

### Auto-save (hooks)

- **Stop-hook:** Var 15:e meddelande → sparar ämnen, beslut, citat till palace
- **PreCompact-hook:** Före kontextkomprimering → nödsparning av allt

### MCP-verktyg (snabbreferens)

| Verktyg | Funktion |
|---------|----------|
| `mempalace_search` | Semantisk sökning med wing/room-filter |
| `mempalace_add_drawer` | Spara verbatim innehåll |
| `mempalace_kg_query` | Fråga kunskapsgraf med tidsfilter |
| `mempalace_kg_add` | Lägg till fakta |
| `mempalace_kg_timeline` | Kronologisk berättelse om en entitet |
| `mempalace_diary_write` | Skriv agentdagbok |
| `mempalace_traverse` | Navigera graf från rum till rum |

---

## Din roll i en mening

Läs AGENTS.md. Följ uppgiftsroutingen. Använd rätt lager för rätt problem. Fixa det som går fel. Gör kitet bättre för varje körning.
