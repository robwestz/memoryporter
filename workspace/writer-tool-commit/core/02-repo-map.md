# Repo map - writer-tool-commit

Mapping existing artifacts this decision builds on, not a codebase.

## Entry points
- [OBSERVED] docs/night-projects/a/blueprint-writer-tool.md — primary source (17k)
- [OBSERVED] docs/night-projects/a/skill-map.md — which portable-kit skills writer-tool needs (3.4k)
- [OBSERVED] docs/night-projects/a/showcase.md — presentation of the concept (19k)
- [OBSERVED] docs/night-projects/c/repobrain-launch-package/ — 7 reusable launch-asset templates proven on RepoBrain
- [OBSERVED] D:/sie_x/ — Robin's own Semantic Intelligence Engine (38 Python files, ~8500 LOC, 22 dirs) — UNFINISHED. Has architecturally: 5 domain transformers (seo/medical/legal/financial/creative), writer_prompt.md + bacowr_adapter.py, FastAPI server (14 endpoints), LangChain integration, 100+ language support, streaming, caching, enterprise auth, plugins, observability.
- [OBSERVED] Per Robin: "SIE-X är min semantiska motor som jag har svårt att få färdig men har använt med stor framgång i Bacowr. Bacowr har flera filer som är sammanslagna från SIE-X."
- [DERIVED] SIE-X's `transformers/` + `prompts/` + `smart_constraints`-JSON-contract is structurally identical to writer-tool's blueprinted "skill-template" concept — the architecture already exists but the engine is unfinished.
- [OBSERVED] Arch doc lists 8 remaining known issues: two competing servers, two competing multilingual systems, two competing auth systems, no real database, no configuration management, no test suite, no CLI, no container/deployment story.
- [DERIVED] Bacowr currently bypasses SIE-X-incompleteness by importing fragments into its own codebase. This works for one consumer but creates drift and cannot cleanly serve a second consumer (writer-tool) without either: (a) repeating the fragment-import pattern, or (b) finishing SIE-X first.

## Key modules
- [OBSERVED] skill-forge (portable-kit) — authors the prompt-architecture "skill-templates" that are the product core IP
- [OBSERVED] 200k-blueprint — already produced this blueprint
- [OBSERVED] launch-package — produced PH/email/demo assets, tested on RepoBrain
- [OBSERVED] source-grounding — existing anti-hallucination pattern available
- [OBSERVED] seo-article-audit — validates generated output against niche quality bar

## Interfaces and dependencies
- [OBSERVED] Claude API Sonnet 4.6 for generation (specified in blueprint)
- [OBSERVED] Supabase for auth + multi-tenant data (blueprint stack)
- [OBSERVED] Vercel Edge for SSE streaming (blueprint stack)
- [ASSUMED] Bacowr repo contains reusable genre-convention code for the first skill-template

## Build and runtime cues
- [OBSERVED] Blueprint sizes first iteration at 3 skill-templates in 30 days
- [DERIVED] Given Robin's capacity pattern, 6-8 weeks is more realistic than 30 days
- [ASSUMED] One senior dev (Robin) + Claude Code agents can author 1 solid skill-template in that window

## Unknowns
- [OPEN-RISK] How much of the code already exists in Bacowr vs must be written fresh
- [OPEN-RISK] Whether skill-template authoring becomes a bottleneck (Robin as single author)
- [OPEN-RISK] Whether RepoBrain launch assets retarget cleanly to writer-tool or need ground-up remake
