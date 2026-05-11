# AOS Report — svar till den parallella sessionen

> **Format:** Direkt svar på den andra Claude-sessionens senaste turn (cleanup + agentic-OS-strategi).
> **Underlag:** YouTube-digest (Chase AI, "Stop Using Claude Code Without an Agentic OS") + locked `systematic-research`-pipeline (16 källor, 5 typer, 4 A-rated, 0 loop-backs).
> **Audience:** Robin + den parallella Claude-sessionen som föreslog Sprint 0–3.
> **TL;DR:** Grönt på alla tre confirmation-frågor, med tre konkreta tillägg från min research som jag rekommenderar bakas in innan Sprint 0 körs.

---

## 0. Alignment-svar — tre frågor, tre svar

| Fråga från andra sessionen | Mitt svar | Kort skäl |
|---------------------------|-----------|-----------|
| (a) Är `portable-leftovers/` rätt mönster? | **Grönt.** | Utanför git, reversibelt, ingen clone-blot. Bättre än `archive/` inuti. Jag lägger till ett 4:e bucket nedan (§2). |
| (b) Matchar "Linux för agenter"-modellen din intuition? | **Grönt — med två tillägg.** | Definitionen är rätt. Men listan saknar **integration-plane (webhooks/MCP-push)** och **capability-plane (kod-inventarium för repo-mashups)** — båda är load-bearing för Robins faktiska mål, inte nice-to-have. Se §3. |
| (c) Hybrid-split (claw-os sibling + portable-kit ekosystem + produkt-siblings)? | **Grönt — med naming-tweak.** | Splitten är rätt. Namnet `claw-os` krockar mjukt med `claw-mini`/`claw-gateway`. Kandidater i §4. |

**Inga filändringar behövs i denna turn — bara alignment + en uppdaterad sprintplan.**

---

## 1. Varför denna rapport finns

Den parallella sessionen har gjort tunga lyft på cleanup-strategi och OS-arkitektur. Jag jobbade parallellt med en YouTube-digest + research-pipeline på Chase AI:s "Agentic OS"-video. Resultaten överlappar 60% och kompletterar 40%. Den här rapporten:

1. Bekräftar de tre confirmation-frågorna.
2. Lägger till tre saker den andra sessionen inte hade i scope.
3. Visar hur tilläggen passar in i Sprint 0–3 utan att riva ner planen.

---

## 2. Tillägg till `portable-leftovers/`-mönstret

Den andra sessionen har tre kategorier: **Dead / Active / Leftovers**. Jag föreslår en fjärde:

| Kategori | Action | Exempel |
|----------|--------|---------|
| Dead | radera | tomma placeholder-dotfolders, verifierade dubbletter |
| Active | behåll | core kit, knowledge-base, skill-engine, runtime |
| Leftovers | flytta till `~/Downloads/portable-leftovers/` | historiska skill-utkast, gamla day-reports, night-projects |
| **Quarantine** *(ny)* | flytta till `portable-leftovers/_quarantine/` med 30-dagars TTL | filer som *kan* vara aktiva men ingen vet säkert; om inget refererat dem på 30d → leftovers; om något bröt → tillbaka |

**Varför:** under cleanup hittar man alltid grejer där "jag vet inte" är ärligaste svaret. Quarantine ger ett mellanläge så Sprint 0 inte fastnar på 20 maybe-filer.

**Mappstruktur:**
```
C:/Users/robin/Downloads/portable-leftovers/
├── README.md              ← varför detta finns + indexet
├── _index.md              ← vad ligger var, datum, ursprungspath
├── _quarantine/           ← 30d-TTL-zonen, inkl. _quarantine/INDEX.md med datum
├── docs/                  ← historiska planer, day-reports, pitches
├── workspace/             ← gamla workspace-prototyper
└── research/              ← gamla research-snapshots
```

**Regel:** filer i `portable-leftovers/` får referera till varandra men *inte* till `portable-kit/`-paths utan en "may-be-stale"-stämpel i frontmatter. Annars skapar man en osynlig länk-spaghetti.

---

## 3. Två plank som saknas i "Linux för agenter"-listan

Den andra sessionens definition är rätt riktning. Men 16 källor + transcripten från videon visar två saker som faller utanför de 5 critical gaps som listas:

### 3.1 Integration-plane (webhooks + MCP-push)

Videon själv är vag på det här ("local vs remote automations — let Claude decide"). Källorna är skarpare:

- **MCP är 2026-standarden för agent-tool-integration** (Calmops; modelcontextprotocol; >500 publika MCP-servrar; Anthropic + OpenAI + Google + MSFT + Salesforce stödjer).
- **Webhooks-i-MCP** är på väg — GitHub MCP server pushar PR-events istället för polling.
- **Obsidian Local REST API + MCP server** finns redan färdig (coddingtonbear's plugin); PATCH-ops på heading/block/frontmatter utan att rewrite hela filen.

För Robins aOS betyder det: **integrationsbussen är inte en sub-feature av "kernel"** — det är ett eget plank som vetter utåt. Sprint-mässigt landar det rimligast i Sprint 2 tillsammans med shellen, för shellen ska kunna trigga på externa events, inte bara på "användaren skriver i terminalen".

**Konkret för Sprint 2:**
- `config/webhook-routes.yaml` — mappar GitHub/Stripe/generic-events till skill-namn
- `any_webhook`-fallback → varje okänd payload droppas som timestamped JSON i `vault/_raw/webhook-inbox/`, periodisk Claude-run triagear
- Outbound webhooks i `config/outbound-webhooks.yaml` — URL:er aldrig hårdkodade i skill-källan

### 3.2 Capability-plane (kod-inventarium för repo-mashups)

Det här är **Robins faktiska epiphany från sessionen** och det den andra sessionen inte direkt namnger. Den listar `MANIFEST.json` (170 entries) under "Package-metadata" — det är rätt nivå för *skills*, men *fel nivå* för repos.

**Skill-registry ≠ kod-inventarium:**

| Axel | Skill-registry (MANIFEST.json idag) | Kod-inventarium (saknas) |
|------|-------------------------------------|--------------------------|
| Atom | Workflow (`.md` SKILL) | Repo (sie-x, graphify, sokordsanalys, ...) |
| Verkar på | Prompts + tool calls | Källkod + bibliotek + CLI + datasets |
| Fråga | "Har jag en skill för X?" | "Vilka repos kan ge mig capability X? Vilka *två* går att komponera till Y?" |
| Lifecycle | Mänskligt författat | Discoverat via scan, refreshat vid commit |
| Schema | YAML frontmatter | Capability manifest (`inputs/outputs/surface/quality`) |

**Det är detta som låter en agent svara på frågan "vad kan vi skapa genom att kombinera sie-x och graphify?".** Inte free association — en strukturerad join över capability-IDs:

```
1. Läs sie-x.capability.yaml och graphify.capability.yaml
2. För varje (cap_A in sie-x.outputs) × (cap_B in graphify.inputs):
     om type-kompatibel(cap_A.output, cap_B.input) →
       kandidat: sie-x.cap_A ▷ graphify.cap_B
3. Scora: quality_floor, surface_compat, novelty, market_fit
4. Top N → inventory/compose/proposals/<datum>-sie-x__graphify.md
```

**Exempelutfall (illustrativt — graphify-manifestet behöver byggas på riktigt först):**

| Komposition | Produkt | Surface fit |
|-------------|---------|-------------|
| `sie-x.cluster_entities` ▷ `graphify.render_force_layout` | Visual topical authority map (SVG embeddable) | lib→lib ✓ |
| `sie-x.topical_authority` ▷ `graphify.diff_two_graphs` | Competitor topical-gap visualizer | lib→lib ✓ |

**Capability manifest-skiss** (skarp version finns i §6 i forskningsutkastet — sammanfattning här):

```yaml
repo: sie-x
status: feature-complete
one_liner: "Semantic engine; entity clustering + topical authority"
capabilities:
  - id: cap.semantic.cluster_entities
    surface: library
    inputs: [text-corpus]
    outputs: [entity-graph]
    quality: production
interfaces:
  - kind: python_module
    import: "from sie_x import SemanticEngine"
composes_well_with: [graphify, sokordsanalys]
```

**Var detta hamnar i sprint-planen:** detta är *Sprint 2.5* eller en parallell mini-sprint. Det behöver inte vänta på Sprint 3 (process table) men det bör inte krångla till Sprint 0 (cleanup). Mest pragmatiska: bygg `sie-x.capability.yaml` + `graphify.capability.yaml` *manuellt* (2h) under Sprint 0 som side-quest så schemat valideras innan automation.

---

## 4. Naming-tweak för kernel-sibling

`claw-os` krockar mjukt med `claw-mini`/`claw-gateway` namnspaceringen. Kandidater:

| Namn | För | Mot |
|------|-----|-----|
| `claw-os` | Konsistent med claw-prefix | Tvetydigt: vad är claw-mini då, en distro? |
| `ob1-os` | Återanvänder existerande ob1-runtime-namn | Bundar OS-en till en specifik runtime |
| **`agentkernel`** | Beskriver vad det är | Längre |
| `aos-kernel` | Tydligt | Generiskt |

**Min rekommendation:** `agentkernel/` som sibling-repo. Lägger inte till naming-skuld, gör tydligt vad biten är. ob1/claw-mini/claw-gateway flyttar in under `agentkernel/binaries/`.

(Men det här är ett 5-min-beslut — kör vad som känns rätt; det viktiga är *splitten*, inte *namnet*.)

---

## 5. Hur min research plugar in i Sprint 0–3

Den andra sessionens sprintplan behöver inte rivas. Jag hänger på utan att förlänga:

| Sprint | Andra sessionens scope | Mina tillägg | Tidsåtgång-delta |
|--------|------------------------|--------------|-------------------|
| **Sprint 0** | Cleanup + leftovers-flytt | + lägg till `_quarantine/`-bucket (§2). + skriv `sie-x.capability.yaml` + `graphify.capability.yaml` manuellt som side-quest (2h). | +2h |
| **Sprint 1** | Meta-skills dedup + extrahera `agentkernel/` sibling | Inget nytt — kör som planerat. | 0 |
| **Sprint 2** | Bundle-katalog + `tools/launch.py` shell | + `config/webhook-routes.yaml` + `any_webhook`-fallback till `vault/_raw/webhook-inbox/`. + bestäm Obsidian-wiring: filesystem vs Local REST API vs MCP-server (§6 nedan). | +0.5d |
| **Sprint 2.5** | *(ny)* | `compose-query.py` v0 mot de två manuella manifesten från Sprint 0. Validera att joinen producerar vettiga produktförslag *innan* vi automatiserar manifest-generering. | +1d |
| **Sprint 3** | Process table + structured logs + supervisord | + `build-inventory.py` (statisk pass över alla repos) blir en daemon-uppgift under supervisord. + capability-refresh som post-commit hook per repo. | +0.5d |

**Totalt:** ~4 dagars tillägg på en plan som redan var ~6 dagar. Ger Robin det han egentligen frågade efter (compose-mashups) utan att riva sprint-strukturen.

---

## 6. Obsidian-wiring — välj en, inte alla tre

Den andra sessionen behandlar `knowledge-base` som "Filsystem-semantik". Det är rätt — men för aOS:n som ska *integrera mot Robins Obsidian-vault* behövs ett konkret transport-val:

| Pattern | När | Hur |
|---------|-----|-----|
| **A. Direct filesystem** | Claude körs *i* vault-mappen | `CLAUDE.md` deklarerar schema; native Read/Write/Glob/Grep |
| **B. Obsidian Local REST API** | Claude behöver PATCH:a heading/block medan Obsidian är öppen | `coddingtonbear/obsidian-local-rest-api` plugin → HTTPS + API-key på localhost |
| **C. MCP server framför vault** | Flera agenter delar vault, vill ha search/Dataview-DQL/periodic-notes som tools | Kör Local REST API:s MCP server (playbooks.com); registrera i `.claude/mcp.json` |

**Default-rekommendation:** A för bulk, B för surgical edits medan Obsidian är öppen, C när flera agenter delar vault.

**`CLAUDE.md`-kontraktet i vault-roten är det enskilt mest hävstångsstarka artefakten** — den dikterar var data routas. Mall:

```markdown
# Vault: <namn>
## Schema
- _raw/   : ostrukturerade captures
- wiki/   : kurerade, LLM-underhållna artiklar med backlinks
- output/ : deliverables (deck, rapporter, scripts)
## Memory routing
- Research → wiki/<topic>.md, källor länkade från _raw/
- Deliverable → output/<projekt>/<artifact>.md
- Skriv aldrig i _raw/ utom vid capture
```

---

## 7. Vad mitt underlag *verifierade* mot 16 källor

Validerad epiphany-tabell (full version i § 7 i föregående utkast):

| # | Epiphany | Status | Källor |
|---|----------|--------|--------|
| E1 | Domain→Task→Skill→Automation är rätt ladder | **Verified** | S1, S5, S6, S7 |
| E2 | Markdown-vault > vector DB vid personal/SMB-skala | **Verified** | S1, S2, S3, S4 |
| E3 | Headless `claude -p` är "button-runtime" | **Verified** | S1, S5, S6 |
| E4 | Obsidian Local REST API duger när vault är öppen | **Verified** | S10, S11 |
| E5 | MCP + webhook = 2026-integrationsbussen | **Verified** | S8, S9 |
| E6 | Kod-inventarium ≠ skill-registry; separat primitiv | **Supported** | S12, S13, S15 (analog) |
| E7 | Capability manifest med `inputs/outputs/surface/quality` | **Supported** | S12, S14, S15 |
| E8 | Tre ortogonala plan (workflow/data/capability) | **Supported (syntes)** | S6 har 4-lagers-version |
| E9 | `any_webhook`-fallback (okända payloads → `_raw/webhook-inbox/`) | **Unverified** | Designval, ingen källa motbevisar |

**Disputer som flaggades:**
- *Vector DB-onödan* — Karpathy/Obsidian-pattern dominerar vid personal/SMB-skala, men >10k docs eller sub-sec query kräver fortfarande vector store. Generalisera inte "no RAG needed" förbi personal scope.
- *Skill-granularitet* — Många små vs få orchestrator-skills är genuint disputed; rekommendation: båda, vilket är vad skill-engine redan gör.
- *Local vs remote automations* — videon säger "let Claude decide"; produktionsmönster pushar mot explicit policy. För aOS-on-Windows: default local, promote vid resurs/latens/SLA-trigger.

**Verdict från pipeline:** `sufficient` (coverage 95, confidence 0.82, 0 kritiska ospårade claims, 0 loop-backs).

---

## 8. Concrete next-step — vad jag rekommenderar Robin svarar

Till den andra sessionen, kopiera-bart:

> Grönt på alla tre. Tre tillägg innan vi rullar Sprint 0:
>
> 1. **Quarantine-bucket** i `portable-leftovers/_quarantine/` med 30d TTL — för "vet inte säkert"-filerna. Annars fastnar Sprint 0.
> 2. **Två plank till** i din OS-lista: integration-plane (webhooks + MCP-push) och capability-plane (kod-inventarium). Det andra är hela poängen med min "kombinera sie-x och graphify"-fråga; det är inte samma sak som MANIFEST.json.
> 3. **Side-quest under Sprint 0:** skriv `sie-x.capability.yaml` + `graphify.capability.yaml` manuellt (~2h) så vi validerar capability-schemat innan vi automatiserar. Schema-skiss finns i AOS_report.md §3.2.
>
> Naming-tweak: överväg `agentkernel/` istället för `claw-os/` (krockar inte med claw-mini/claw-gateway). Inte hill-to-die-on.
>
> Föreslår att vi kör 200k-blueprint för `agentkernel`-extraktionen *innan* Sprint 1 — du flaggade själv att det kunde vara värt timmen.

---

## 9. Risk + delta

- **Antagande:** Robins "agentic OS"-intent är `Linux för agenter` (resurslager + komponering), inte `en stor agent som gör allt`. Båda sessionerna konvergerar på den tolkningen — om den är fel: stop everything and re-align.
- **Risk:** capability-manifest-vokabulären (`cap.<domain>.<verb>_<noun>`) driftar utan en ägare. Föreslår: en ensam markdown-fil `inventory/CAPABILITY_VOCAB.md` som *enda* källan; ändringar går via PR.
- **Risk:** den andra sessionens 5 OS-gaps + mina 2 plank = totalt 7 gaps. Det är många. Sprint-planen håller bara om vi disciplinerar oss att Sprint 2 *bara* gör shell + integration-plane v0, inte capability-plane samtidigt. Capability får sin egen halv-sprint (2.5).
- **Inte verifierat:** graphify-repots faktiska kod-yta (jag inferred från namnet); existerande wapt-/kb-forge-state vs portable-kit-state under cleanup; portable-leftovers-mappens nuvarande innehåll.

---

## 10. Källor (full registry)

| # | Titel | URL | Typ | Kvalitet |
|---|-------|-----|-----|----------|
| S1 | "Stop Using Claude Code Without an Agentic OS" — Chase AI | https://www.youtube.com/watch?v=Bgxsx8slDEA | video | B |
| S2 | Karpathy LLM Wiki gist (canonical) | https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f | authority | A |
| S3 | "Karpathy shares LLM Knowledge Base…" — VentureBeat | https://venturebeat.com/data/karpathy-shares-llm-knowledge-base-architecture-that-bypasses-rag-with-an | article | B |
| S4 | "Karpathy's Obsidian RAG Killed My Vector Database" — Mejba | https://www.mejba.me/blog/karpathy-obsidian-rag-knowledge-base | article | B |
| S5 | "What Is Claude Code Headless Mode?" — MindStudio | https://www.mindstudio.ai/blog/claude-code-headless-mode-autonomous-agents | article | B |
| S6 | "Claude Code Agentic OS Framework" — GrowwStacks | https://growwstacks.com/blog/claude-code-agentic-os-framework | article | B |
| S7 | "How to Build Agentic OS Inside Claude Code" — MindStudio | https://www.mindstudio.ai/blog/agentic-operating-system-claude-code | article | B |
| S8 | "MCP Complete Guide 2026" — Calmops | https://calmops.com/ai/model-context-protocol-mcp-complete-guide/ | article | B |
| S9 | Model Context Protocol — GitHub org | https://github.com/modelcontextprotocol | docs | A |
| S10 | Obsidian Local REST API plugin | https://github.com/coddingtonbear/obsidian-local-rest-api | docs | A |
| S11 | Obsidian Local REST API MCP server | https://playbooks.com/mcp/obsidian-local-rest-api | docs | B |
| S12 | Copilot semantic code search — GitHub Changelog | https://github.blog/changelog/2026-03-17-copilot-coding-agent-works-faster-with-semantic-code-search/ | docs | A |
| S13 | Copilot repo indexing — GitHub Docs | https://docs.github.com/en/copilot/concepts/context/repository-indexing | docs | A |
| S14 | Metadata Management för Agentic AI — Xenonstack | https://www.xenonstack.com/blog/metadata-management | article | C |
| S15 | SBOM — CISA | https://www.cisa.gov/sbom | authority | A |
| S16 | SBOM — NIST | https://www.nist.gov/itl/executive-order-14028-improving-nations-cybersecurity/software-security-supply-chains-software-1 | authority | A |

---

*Genererat via `youtube-video-digest` (transcript via youtube-transcript-api med SSL-workaround pga lokalt cert-problem) → `systematic-research` v1.0.0. 16 källor, 5 typer, 4 A-rated, 0 loop-backs. Verdict: sufficient.*
