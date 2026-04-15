# Repo map - siex-platform-audit

Inventory from FULL_SYSTEM_ARCHITECTURE.txt v2.1.0 (2026-02-07) +
directory listing of D:/sie_x/ (2026-04-15). Arch-doc claims verified
at folder level. Per-file depth verified for xai.py (784 LOC, real
SHAP/LIME/plotly). All other [KEY]-files' depth is currently [ASSUMED]
until sampled in the chosen branch.

## Entry points
- [OBSERVED] `D:/sie_x/FULL_SYSTEM_ARCHITECTURE.txt` — 1025-line master reference doc, v2.1.0, the only document that surveys the whole system
- [OBSERVED] `D:/sie_x/api/minimal_server.py` [KEY] — main FastAPI server (875 LOC per arch doc), 14 endpoints, auth/rate-limit/tracing middleware, Prometheus metrics, streaming support
- [OBSERVED] `D:/sie_x/api/server.py` — alternate server (competes with minimal_server.py per known-issue #1)
- [OBSERVED] `D:/sie_x/sdk/python/client.py` [KEY] — SIEXClient async/sync HTTP client
- [OBSERVED] `D:/sie_x/sdk/python/sie_x_sdk.py` [KEY] — enterprise SDK with WebSocket streaming, batch processor, OAuth
- [OBSERVED] `D:/sie_x/usecase.py` — runnable use case examples (legal, medical, finance) — possible first read for LLM onboarding

## Key modules
### Level 0: Core (the engine heart)
- [OBSERVED] `core/engine.py` [KEY] — SemanticIntelligenceEngine, production engine, GPU/FAISS/async
- [OBSERVED] `core/simple_engine.py` [KEY] — lightweight CPU engine
- [OBSERVED] `core/models.py` [KEY] — Pydantic data models (Keyword, Request, Response)
- [OBSERVED] `core/extractors.py` [KEY] — CandidateExtractor + TermFilter
- [OBSERVED] `core/resilience.py` [KEY] — IntelligentRetry, circuit breaker, ResourceManager
- [OBSERVED] `core/streaming.py` [KEY] — StreamingExtractor with 3 merge strategies
- [OBSERVED] `core/multilang.py` — 11-language FastText detection (competes with `multilingual/engine.py` per known-issue #2)
- [OBSERVED] `chunking/chunker.py` [KEY] — DocumentChunker + SlidingWindowChunker, semantic boundaries
- [OBSERVED] `cache/manager.py` + `cache/redis_cache.py` [KEY] — in-memory LRU + Redis/Memcached + fallback

### Level 1: Domain transformers (where specialization lives)
- [OBSERVED] `transformers/loader.py` [KEY] — dynamic loading, hybrid multi-transformer support
- [OBSERVED] `transformers/seo_transformer.py` [KEY] — bridge topics, intent alignment, content gaps (BACOWR's proven consumer)
- [OBSERVED] `transformers/medical_transformer.py` [KEY] — diagnosis, drug interactions, SOAP notes (~550 LOC per arch doc)
- [OBSERVED] `transformers/legal_transformer.py` — jurisdiction hierarchy, SFS/EU patterns (~140 LOC)
- [OBSERVED] `transformers/financial_transformer.py` — sentiment, trading signals, risk (~165 LOC)
- [OBSERVED] `transformers/creative_transformer.py` — narrative, character arcs (~200 LOC)
- [ASSUMED] Of the 4 non-SEO transformers, production readiness unverified — only SEO has a proven consumer (Bacowr)

### Level 2: Product surfaces (api + auth + integrations)
- [OBSERVED] `api/minimal_server.py` + `api/server.py` + `api/routes.py` + `api/middleware.py` — competing server surfaces (known-issue #1)
- [OBSERVED] `api/auth.py` (basic JWT) + `auth/enterprise.py` [KEY] (OIDC/SAML/LDAP + Redis) — competing auth systems (known-issue #3)
- [OBSERVED] `integrations/bacowr_adapter.py` [KEY] — BACOWRAdapter generating smart_constraints JSON, working MVP of the "skill-template" pattern
- [OBSERVED] `prompts/writer_prompt.md` — 68-line BACOWR Writer system prompt, paired with bacowr_adapter.py

### Level 3: Extension / orchestration (LLM-era capabilities)
- [OBSERVED] `orchestration/langchain_integration.py` [KEY] — Embeddings, VectorStore, Retriever, Tools, QueryEngine
- [OBSERVED] `streaming/pipeline.py` [KEY] — Kafka StreamingPipeline + WebSocketStreaming
- [OBSERVED] `multilingual/engine.py` [KEY] — MultilingualEngine, LaBSE + XLM-RoBERTa, 100+ languages (competes with core/multilang.py)
- [OBSERVED] `agents/autonomous.py` — autonomous agent support, scope unverified

### Level 0 (infrastructure that survived): Edge / research
- [OBSERVED] `explainability/xai.py` — 784 LOC, real SHAP + LIME + plotly (verified, not stub). Gamechanger candidate per Robin.
- [OBSERVED] `audit/`, `automl/`, `testing/` (A/B), `training/` (active learning), `federated/`, `plugins/`, `monitoring/observability.py` — named as present, depth [ASSUMED]

## Interfaces and dependencies
- [OBSERVED] Python 3, FastAPI, Pydantic, SQLAlchemy (models defined, no session factory), Redis, Memcached, Kafka, LangChain, LaBSE/XLM-RoBERTa models, FAISS, FastText, SHAP, LIME, plotly
- [OBSERVED] Arch doc statistics: 38 Python files, 22 directories, 9 docs, ~8500 LOC total, 6 Prometheus metrics, 4 model modes (FAST/BALANCED/ADVANCED/ULTRA)
- [OBSERVED] No Dockerfile / compose / K8s manifests (known-issue #12)
- [OBSERVED] No .env or unified config (known-issue #9)
- [OBSERVED] No migrations / no DB session factory (known-issue #8)
- [OBSERVED] No test suite outside `core/test_core.py` (known-issue #10)
- [OBSERVED] No CLI (known-issue #11)

## Build and runtime cues
- [DERIVED] The system can run (Bacowr consumes it), so some runnable entry path exists — likely `minimal_server.py` + direct engine imports from Bacowr's merged files
- [OBSERVED] The arch doc describes 4 model modes (FAST/BALANCED/ADVANCED/ULTRA) — actual selection path needs code verification
- [OBSERVED] Per Robin's description, preflight loads pipeline items that are not actually used downstream → wasted startup time + complexity, not a crash path
- [ASSUMED] Non-Bacowr transformers may run in isolation but have never been consumed by a paying use case

## Unknowns
- [OPEN-RISK] Which "several versions" of SIE-X is canonical? Whichever consolidation choice is made, other versions need either merging or explicit archival.
- [OPEN-RISK] What exactly is "5 probe-delen" and what key parts are missing? Robin named this — needs file-path resolution before any fix.
- [OPEN-RISK] How much code is duplicated between SIE-X master and Bacowr's "sammanslagna" files? Fragment-import implies drift; scale of drift unknown.
- [OPEN-RISK] Whether `agents/autonomous.py`, `automl/*`, `federated/*`, `testing/*`, `training/*` are production-shaped or research-scaffolds. Can't tell from arch doc alone.
- [OPEN-RISK] Whether `Ny mapp/` (visible in dir listing) contains accidental work-in-progress or meaningful files.
- [ASSUMED] Bacowr repo contains a reliable import map of WHICH SIE-X files it merged — if not, consolidation requires side-by-side diff.
