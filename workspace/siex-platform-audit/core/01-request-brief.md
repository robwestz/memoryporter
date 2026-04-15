# Request brief - siex-platform-audit

## Objective
Map SIE-X end-to-end, identify missing core/engine/pipeline files, name
the gamechanger gaps, and produce a platform blueprint that multiple
consumers (Bacowr today; writer-tool and future verticals tomorrow) can
depend on without the fragment-import pattern Bacowr currently uses.

## Repo target
- Repo hint: D:/sie_x/ (22 directories, 38 Python files, ~8500 LOC per FULL_SYSTEM_ARCHITECTURE.txt v2.1.0, last architecture review 2026-02-07)
- Branch or revision: current working directory, no git tracking observed yet
- Primary user outcome: Robin has a structured understanding of what SIE-X IS (including its edge files and gamechanger potentials), what it is MISSING (engine/pipeline-level cores), and which specific consolidation path leaves him with a platform he can extend with LLM-assistance without re-explaining the system each time.

## Known facts
- [OBSERVED] Per Robin 2026-04-15: SIE-X is his own engine, foundation built ~6 months ago while already 3-4 months into Bacowr, Bacowr has been main priority throughout.
- [OBSERVED] Per Robin: "sparade in en kvarts miljon i arbetstid let alone seo-kvaliteten på texterna, första kvartalet i år" — SIE-X (via Bacowr consumption) has produced 250,000 SEK in labor savings in Q1 2026 alone.
- [OBSERVED] Per Robin: 120 backlink articles in 3 days ≈ 2x a full content-team's monthly output. Volume proof of capability.
- [OBSERVED] Per Robin: "ingen jag vet i sverige som ens är i närheten av ett sånt avancerat system för just seo" — competitive moat exists on Swedish SEO axis.
- [OBSERVED] Bacowr integrates SIE-X via fragment-import (Bacowr has files "sammanslagna från SIE-X").
- [OBSERVED] Arch doc inventories: 5 domain transformers (seo/medical/legal/financial/creative), 14 FastAPI endpoints, 100+ language multilingual engine (LaBSE/XLM-RoBERTa), LangChain integration, streaming pipeline (Kafka/WebSocket), Redis/Memcached caching, enterprise auth (OIDC/SAML/LDAP), plugin system, observability stack, AutoML, Active Learning, Federated Learning, A/B testing.
- [OBSERVED] Edge-asset example confirmed: `D:/sie_x/explainability/xai.py` = 784 LOC, real SHAP + LIME + plotly integration, not stub.
- [OBSERVED] Per Robin: "flera olika versioner" of SIE-X exist — multi-version drift is active.
- [OBSERVED] Arch doc names 8 remaining known issues: two competing servers, two competing multilingual systems, two competing auth systems, no real database, no configuration management, no test suite, no CLI, no container/deployment story.
- [OBSERVED] Per Robin: "några saker i pipeline som inte används fastän det görs preflight så att det finns" — dead pipeline branches that are still preflight-loaded (observability/perf cost without benefit).
- [OBSERVED] Per Robin: "vissa nyckeldelar i tex 5 probe-delen saknas" — named gap in the "5 probe" subsystem.
- [OBSERVED] Per Robin: "komplicerat att ändra minsta lilla utan att det går sönder" — fragility under change.
- [OBSERVED] Per Robin's self-description: he built SIE-X "utan att förstå det som inte är seo-relaterat, så all kod i princip" — the author does not fully understand the non-SEO parts of the codebase. This is the #1 practical blocker, not the 8 architectural issues.
- [OBSERVED] Per Robin's vision statement: "core + specialisering + LLM" → "rad lösningar i olika sammansättningar eller enskilda filer, därtill hela alltet som motor för hela plattformslösningar" — the stated end-state is a PLATFORM, not a single product.

## Open questions
- [OPEN-RISK] Which of the 5 domain transformers (medical, legal, financial, creative) actually works end-to-end vs is scaffolded only? Bacowr proves the SEO transformer works; others unverified.
- [OPEN-RISK] Which "several versions" of SIE-X is the canonical one? A consolidation task without this answered will create a seventh version.
- [OPEN-RISK] What exactly is the "5 probe-delen" and which key parts are missing? Robin named it; needs surfacing as a concrete file list.
- [ASSUMED] The explainability/xai.py, multilingual/engine.py, federated/*, and automl/* modules have depth comparable to what their file sizes suggest (not scaffold files). xai.py confirmed; others extrapolated.
- [ASSUMED] Robin's Python capacity is sufficient to act on the audit output without needing a separate implementation partner. Self-described as "färsk" developer.
- [OPEN-RISK] The non-code documentation (prompts/, systems/, README files) may be out-of-date relative to code and silently misleading.

## Done criteria
- Six core artifacts filled with evidence-tagged bullets
- Options matrix with at least three standard options + user slot + anti-simplification review, reflecting the tradeoff between "consolidate first" / "document first" / "extract minimum core" / "adapter-expansion first"
- A branch chosen and scaffolded with branch-charter, evidence plan, validation plan, and subskill opportunities — specifically addressing Robin's self-declared #1 pain (LLM cannot get deep into the system)
- The writer-tool-commit case (currently awaiting-user-choice) remains suspended until this audit's output is available as input to its decision.
