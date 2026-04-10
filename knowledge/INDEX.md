# Knowledge Index

Komplett katalog over allt innehall i kunskapsbasen och relaterade resurser.

---

## Metadata-filer

| Fil | Beskrivning |
|-----|-------------|
| `knowledge/INDEX.md` | Denna fil — katalog over allt innehall |
| `knowledge/ONBOARDING.md` | Snabbstart: hur man anvander kitet (las forst) |
| `knowledge/GAPS.md` | Kanda luckor i kitet och byggordning for att fylla dem |

---

## Gamechangers (VARFOR — arkitekturinsikter)

15 filer i `knowledge/gamechangers/`. Varje beskriver ett monster som fundamentalt forandrar agentarkitektur.

| # | Fil | Beskrivning |
|---|-----|-------------|
| 1 | `gc_generic_runtime.md` | Byt vilken komponent som helst utan att rora karnan |
| 2 | `gc_auto_compaction.md` | Oandliga konversationer utan att forlora kontext |
| 3 | `gc_multi_transport_mcp.md` | Anslut till ALLA verktygservrar med ett interface |
| 4 | `gc_shell_hooks.md` | Utoka agentbeteende i valfritt sprak utan omkompilering |
| 5 | `gc_permission_escalation.md` | Graduerat fortroende med per-verktyg-granularitet |
| 6 | `gc_scoped_config.md` | Ratt konfiguration pa ratt niva, alltid sparbar |
| 7 | `gc_session_snapshot.md` | En fil = komplett konversationstillstand + kostnad |
| 8 | `gc_subagent_spawning.md` | Parallella agenter med exakt de verktyg de behover |
| 9 | `gc_staged_boot.md` | Agenten har situationsmedvetenhet fore forsta prompten |
| 10 | `gc_doctor_pattern.md` | Vet vad som ar trasigt innan anvandaren gor det |
| 11 | `gc_pre_turn_budget.md` | Stoppa FORE overforbrukning, inte efter |
| 12 | `gc_tool_pool_assembly.md` | Ratt verktyg, ratt kontext, ratt behorigheter |
| 13 | `gc_memory_system.md` | Minne utan harkomst ar ackumulerad hallucination |
| 14 | `gc_markdown_streaming.md` | Bryt aldrig ett kodblock mitt i renderingen |
| 15 | `gc_sse_incremental.md` | Hantera vilken chunk-storlek som helst utan tappade frames |

---

## Skills (HUR — implementationsrecept)

15 filer i `knowledge/skills/`. Varje ar ett steg-for-steg-recept for att bygga en specifik agentkapacitet.

| # | Fil | Beskrivning |
|---|-----|-------------|
| 1 | `skill_build_agentic_loop.md` | Bygg en trait-generisk multi-turn loop med verktygskoring och kompaktering |
| 2 | `skill_tool_permission_system.md` | Graduerad behorighetsmodell dar varje verktyg deklarerar sin lagsta atkomstniva |
| 3 | `skill_mcp_client.md` | MCP-klient som upptacker och kor verktyg fran externa servrar via flera transporter |
| 4 | `skill_session_management.md` | Sessionsserialisering med inbaddad anvandningstracking och resume-funktionalitet |
| 5 | `skill_hook_system.md` | Pre/post-verktygs-hooks via shellkommandon med JSON-payload och flodeskonroll |
| 6 | `skill_sub_agent_spawning.md` | Spawna bakgrundsagenter med begransade verktyg och isolerade konversationskontexter |
| 7 | `skill_config_hierarchy.md` | Flernivaers konfiguration med deep merge, scope-tracking och MCP-deduplicering |
| 8 | `skill_doctor_pattern.md` | Enhetligt /doctor-kommando som validerar API-nycklar, anslutningar, config och verktyg |
| 9 | `skill_token_budget.md` | Tokenanvandning med pre-turn-budgetkontroll — stoppa fore overforbrukning |
| 10 | `skill_tool_pool_assembly.md` | Per-session-verktygset via 3-lagers filtrering: mode, feature flags, deny-listor |
| 11 | `skill_memory_system.md` | 8-moduls minnesystem med relevanspoang, aldring och harkomstsparing |
| 12 | `skill_staged_boot.md` | 7-stegs boot-pipeline med trust-gating fore forsta prompten |
| 13 | `skill_streaming_renderer.md` | Terminalmjukvara for streaming-markdown med fence-medveten buffring |
| 14 | `skill_system_event_logging.md` | Strukturerad handelslogg — skiljer "vad systemet gjorde" fran "vad vi sa" |
| 15 | `skill_workflow_state.md` | Workflow-tillstand med idempotensnycklar och crash-sakra checkpoints |

---

## Agentritningar (VEM — spawnbara roller)

5 filer i `knowledge/agents/`. Varje definierar en agent med specifik roll, behorighet och verktyg.

| Agent | Fil | Behorighet | Beskrivning |
|-------|-----|-----------|-------------|
| Deep Code Analyst | `agent_deep_analyst.md` | ReadOnly | Analyserar kodbaser, extraherar arkitekturmonster och designbeslut |
| Skill Synthesizer | `agent_skill_synthesizer.md` | WorkspaceWrite | Transformerar extraherad kunskap till konkreta skills |
| Gamechanger Scout | `agent_gamechanger_scout.md` | ReadOnly | Hittar de 10% av monsterna som ger 90% av vardet |
| Snowball Orchestrator | `agent_snowball_orchestrator.md` | DangerFullAccess | Koordinerar hela kunskapsextraktionspipelinen |
| Pattern Combinator | `agent_pattern_combinator.md` | WorkspaceWrite | Hittar nya kombinationer av befintliga monster |

---

## Protokoll

3 filer i `protocols/`. Kvalitetssystem och koordineringsmallar.

| Protokoll | Fil | Beskrivning |
|-----------|-----|-------------|
| Small Model Premium | `protocols/small-model-premium.md` | 5-fas kvalitetsprotokoll for att fa enklare modeller att leverera djupare svar |
| Agent Orchestration | `protocols/agent-orchestration.md` | Koordineringsmonster for multi-agent-arbete (fan-out, pipeline, supervisor) |
| Architecture Audit | `protocols/architecture-audit.md` | 12-primitiv intervjuprompt for pre-produktion-granskning av agentarkitektur |

---

## Scaffolds (projektmallar)

3 filer i `scaffolds/`. Klara startstrukturer for agentprojekt i olika sprak.

| Sprak | Fil | Vad du far |
|-------|-----|-----------|
| Rust | `scaffolds/rust-agent.md` | Cargo workspace, trait-baserad runtime, 3 crates |
| TypeScript | `scaffolds/typescript-agent.md` | Node.js CLI, interface-baserad runtime, MCP-klient |
| Python | `scaffolds/python-agent.md` | Click CLI, ABC-baserad runtime, async verktygskoring |

---

## Sammanfattning

| Kategori | Antal | Plats |
|----------|-------|-------|
| Gamechangers | 15 | `knowledge/gamechangers/` |
| Skills | 15 | `knowledge/skills/` |
| Agentritningar | 5 | `knowledge/agents/` |
| Protokoll | 3 | `protocols/` |
| Scaffolds | 3 | `scaffolds/` |
| Metadata-filer | 3 | `knowledge/` |
| **Totalt** | **44** | |
