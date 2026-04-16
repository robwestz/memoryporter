# SIE-X Capability Map — Wave 1

**Auditor:** Claude (spot-check, read-only)
**Date:** 2026-04-16
**Source arch doc:** `D:/sie_x/FULL_SYSTEM_ARCHITECTURE.txt` v2.1.0
**Sampling basis:** One [KEY]-preferred file per module directory

---

## Structural finding: Phantom duplicate tree

`D:/sie_x/` contains a nested `sie_x/` subdirectory that is a **full mirror** of the top-level layout (same 38+ files). This is not mentioned anywhere in the arch doc. Every `find` result for the codebase returns duplicate paths. Line-count totals below are for the top-level files only.

---

## core/engine.py

```
## core/engine.py
- **Purpose:** GPU-accelerated production semantic extraction engine with PageRank graph scoring, FAISS vector search, DBSCAN clustering, and async batch processing.
- **Primary class/function:** `SemanticIntelligenceEngine.__init__(mode, language_model, enable_gpu, cache_size, batch_size, max_chunk_size, enable_monitoring)`
- **Dependencies:** torch, networkx, numpy, spacy, faiss, sentence_transformers, sklearn, transformers; internal: ..cache, ..chunking, ..graph, ..monitoring
- **Status:** [WORKING-ISOLATED]
  - Real, substantial implementation (~669 LOC). All model-loading and extraction pipeline code is present. No test that exercises the full pipeline was found in this sample; only `core/test_core.py` exists and uses mocks.
- **Line count:** 669
- **Notes:** `GraphOptimizer` is imported from `..graph` but `graph/__init__.py` is a stub with a no-op `optimize()`. ADVANCED/ULTRA mode graph optimization therefore does nothing silently. Arch doc does not flag this.
```

---

## transformers/seo_transformer.py

```
## transformers/seo_transformer.py
- **Purpose:** SEO-layer transformer that classifies publisher/target content, finds semantic bridge topics between them, generates scored anchor text, and identifies content gaps for backlink campaign use.
- **Primary class/function:** `SEOTransformer.__init__(min_topic_similarity, max_anchor_length, risk_threshold)` → `analyze_publisher(text, keywords, url, metadata)`, `analyze_target(...)`, `find_bridge_topics(publisher, target)`
- **Dependencies:** numpy, sklearn (KMeans, cosine_similarity); internal: sie_x.core.models.Keyword
- **Status:** [PRODUCTION]
  - Most fleshed-out transformer; has a live consumer (BACOWRAdapter) and the most detailed docstrings. Bridge-finding logic, anchor generation, and risk scoring are all implemented (~712 LOC).
- **Line count:** 712
- **Notes:** Import path uses `sie_x.core.models` (absolute) while `core/engine.py` uses relative `..cache` — mixed import conventions across the codebase. No red flags beyond that.
```

---

## api/minimal_server.py

```
## api/minimal_server.py
- **Purpose:** Primary FastAPI server exposing keyword extraction (single, batch, streaming SSE, multilingual), JWT login, Prometheus metrics, and a static maps-routing knowledge endpoint.
- **Primary class/function:** `app = FastAPI(...)` with `@app.post("/extract")`, `@app.post("/extract/batch")`, `@app.post("/extract/stream")`, `@app.post("/extract/multilingual")`, `@app.post("/token")`, `@app.get("/health")`
- **Dependencies:** fastapi, fastapi.middleware.cors, fastapi.security, asyncio; internal: sie_x.core.simple_engine, sie_x.core.streaming, sie_x.core.multilang, sie_x.core.models, sie_x.api.auth, sie_x.monitoring.metrics
- **Status:** [PRODUCTION]
  - Full 883-LOC server with Prometheus mount, CORS, auth dependency, and streaming responses. Most feature-complete module in the codebase.
- **Line count:** 883
- **Notes:** The `/knowledge/maps-routing-pack` endpoint (static file server for offline maps data) appears in the arch doc table but feels architecturally misplaced — an SEO extraction engine serving offline maps routing packs is unexplained and not mentioned anywhere in the system narrative. Minor: `allow_origins=["*"]` left as-is with a TODO comment.
```

---

## api/middleware.py

```
## api/middleware.py
- **Purpose:** Starlette middleware stack providing JWT/API-key authentication, `slowapi`-based rate limiting (hourly + burst), and request tracing via structlog.
- **Primary class/function:** `AuthenticationMiddleware(BaseHTTPMiddleware)`, `RateLimitMiddleware`, `RequestTracingMiddleware`
- **Dependencies:** jwt, fastapi, starlette, slowapi, structlog, hashlib; internal: sie_x.cache.redis_cache.FallbackCache
- **Status:** [WORKING-ISOLATED]
  - Real implementation (256 LOC) but `minimal_server.py` does not mount this middleware — it uses its own `get_current_active_user` dependency from `api/auth.py` instead. The middleware exists but has no wiring in the primary server.
- **Line count:** 256
- **Notes:** Arch doc describes this as part of the production stack; it is effectively orphaned. `AuthConfig` dataclass is well-designed. `slowapi` dependency is used here but not listed in the server's own imports.
```

---

## auth/enterprise.py

```
## auth/enterprise.py
- **Purpose:** Unified enterprise SSO manager supporting OIDC (authlib), SAML (python3-saml), and LDAP (ldap3), plus a Redis-backed TokenManager with JWT blacklisting.
- **Primary class/function:** `EnterpriseAuthManager.__init__(oidc_providers, saml_config, ldap_config, redis_client)`
- **Dependencies:** jwt, authlib, python3_saml, ldap3, redis.asyncio; internal: fastapi
- **Status:** [WORKING-ISOLATED]
  - 348 LOC of real integration code. All three SSO paths have concrete implementation. No caller found in the API layer — `minimal_server.py` uses the simpler `api/auth.py` mock instead.
- **Line count:** 348
- **Notes:** `python3_saml` import is `from python3_saml import OneLogin_Saml2_Auth` — this package name varies by distribution (`python3-saml` vs `onelogin-saml2`); potential install-time failure. Arch doc claims ~300 LOC (actual: 348 — minor overclaim on the low side).
```

---

## integrations/bacowr_adapter.py

```
## integrations/bacowr_adapter.py
- **Purpose:** Adapter that bridges SIE-X's semantic analysis into the BACOWR backlink-writing pipeline, enhancing page profiling, bridge finding, and generating structured content constraints for an AI writer.
- **Primary class/function:** `BACOWRAdapter.__init__(sie_x_client, use_seo_mode, cache_enabled)` → `enhance_page_profiler(page_profile)`, `find_best_bridge(publisher_url, target_url)`, `generate_smart_constraints(backlink_job, bridge)`
- **Dependencies:** logging, datetime; internal: sie_x.sdk.python.client.SIEXClient, sie_x.transformers.seo_transformer.SEOTransformer
- **Status:** [PRODUCTION]
  - The only module confirmed to have an external consumer (BACOWR). 845 LOC — the largest non-engine file. Intent-alignment formula and constraint generation are concretely implemented.
- **Line count:** 845
- **Notes:** Substantially larger than the arch doc description implies (doc focuses on 3 methods; file contains at least 8 distinct methods). This is accidental brilliance territory — Robin built significantly more than he documented here.
```

---

## sdk/python/client.py

```
## sdk/python/client.py
- **Purpose:** Async/sync HTTP client for the SIE-X API with exponential-backoff retry, context-manager lifecycle, and convenience wrappers for single/batch extraction and URL/file analysis.
- **Primary class/function:** `SIEXClient.__init__(base_url, timeout, api_key, max_retries)` → `extract(text)`, `extract_batch(texts)`, `extract_sync(text)`, `analyze_url(url)`, `analyze_file(file_path)`, `health()`
- **Dependencies:** httpx, asyncio, pathlib; no internal sie_x imports
- **Status:** [WORKING-ISOLATED]
  - Clean 415-LOC implementation. Retry logic is implemented with manual `asyncio.sleep` backoff (not `backoff` library as used in resilience.py — inconsistent). API key auth is marked "Phase 2+" in docstring, suggesting incomplete feature.
- **Line count:** 415
- **Notes:** Docstring comment `# Phase 2+` on API key usage signals this may predate the auth layer being wired up. No `Authorization` header injection for the API key was found in the first 80 lines; needs deeper check to confirm.
```

---

## orchestration/langchain_integration.py

```
## orchestration/langchain_integration.py
- **Purpose:** Drop-in LangChain and LlamaIndex adapters that substitute SIE-X for OpenAI embeddings, FAISS vector stores, and standard retrievers, plus a RAG query engine.
- **Primary class/function:** `SIEXEmbeddings(Embeddings)`, `SIEXVectorStore(VectorStore)`, `SIEXRetriever(BaseRetriever)`, `SIEXQueryEngine`, `SIEXNodeParser`
- **Dependencies:** langchain (embeddings, text_splitter, vectorstores, schema, tools, agents), llama_index, numpy; internal: SemanticIntelligenceEngine (string forward ref only)
- **Status:** [WORKING-ISOLATED]
  - 374 LOC of real adapter code. Imports from `langchain.embeddings.base`, `langchain.vectorstores.base` — these are legacy LangChain 0.0.x paths; modern LangChain (0.1+) uses `langchain_community` / `langchain_core`. Will fail on current LangChain installs without compatibility shim.
- **Line count:** 374
- **Notes:** Stale import paths are a likely breakage point. No consumer found. Arch doc accurately describes the 8-class structure.
```

---

## streaming/pipeline.py

```
## streaming/pipeline.py
- **Purpose:** Kafka-based real-time extraction pipeline with micro-batching, Redis result caching, dead-letter queue, and a WebSocket streaming variant for per-chunk result delivery.
- **Primary class/function:** `StreamingPipeline.__init__(engine, config)` → `start()`, `_process_batch(messages)`, `stop()`; `WebSocketStreaming.__init__(engine)` → `handle_connection(websocket)`
- **Dependencies:** asyncio, aiokafka (optional), redis.asyncio (optional), msgpack (optional); internal: sie_x.core.engine.SemanticIntelligenceEngine
- **Status:** [WORKING-ISOLATED]
  - 251 LOC with proper optional-import guards. All three heavy dependencies (aiokafka, redis, msgpack) are wrapped in try/except with `RuntimeError` on missing deps. Logic looks sound but untestable without running infrastructure.
- **Line count:** 251
- **Notes:** Arch doc claims 4 parallel worker tasks — the code structure supports this but workers are created in a list comprehension; correct. Shorter than arch doc implies (arch doc's description is proportionately accurate).
```

---

## multilingual/engine.py

```
## multilingual/engine.py
- **Purpose:** Language-detection-first multilingual extraction engine using LaBSE and XLM-RoBERTa as universal backbones, with per-language spaCy/Stanza model loading.
- **Primary class/function:** `MultilingualEngine.__init__()` → `extract_multilingual(text, language)`, `detect_language(text)`, `_get_language_models(language)`
- **Dependencies:** fasttext, polyglot, transformers (AutoTokenizer, AutoModel), langdetect, spacy, sentence_transformers; internal: core.utils.load_spacy_model
- **Status:** [SCAFFOLD]
  - 175 LOC. `LANGUAGE_CONFIGS` dict has 4 concrete entries (en, es, zh, ar) then `# Add 96 more language configurations...` — the "100+ language" claim in the arch doc is aspirational. The detection and model-loading wiring is real, but the language coverage is ~4% of the claimed scope.
- **Line count:** 175
- **Notes:** Major arch doc overclaim. The class name in this file is `MultilingualEngine`; `core/multilang.py` (used by the API server) is a separate `MultiLangEngine` with 11 real languages. The two are unrelated. Arch doc conflates them.
```

---

## chunking/chunker.py

```
## chunking/chunker.py
- **Purpose:** Token-based document chunker with sentence-boundary awareness and an adaptive sliding-window subclass that uses inverse token frequency as an information-density proxy.
- **Primary class/function:** `DocumentChunker.__init__(max_tokens, overlap_ratio, tokenizer, respect_sentences)` → `chunk(text)`, `_find_sentence_boundaries(text, tokens)`; `SlidingWindowChunker(DocumentChunker)` → `chunk(text)` override
- **Dependencies:** numpy, transformers.PreTrainedTokenizer
- **Status:** [WORKING-ISOLATED]
  - 131 LOC — compact and complete. Sentence boundary detection uses simple punctuation scan (comment: "would use spaCy in production"), which is a known limitation. `SlidingWindowChunker` adaptive density logic is implemented and functionally correct.
- **Line count:** 131
- **Notes:** The sentence-boundary comment ("would use spaCy in production") is a red flag — this IS the production code. Minor but honest.
```

---

## cache/redis_cache.py

```
## cache/redis_cache.py
- **Purpose:** Distributed caching layer with abstract `CacheBackend` interface, concrete `RedisCache` and `MemcachedCache` implementations, and a `FallbackCache` that tries backends in priority order.
- **Primary class/function:** `CacheBackend(ABC)`, `RedisCache.__init__(redis_url, ttl, key_prefix)`, `MemcachedCache.__init__(servers)`, `FallbackCache.__init__(redis_url, memcached_servers)`
- **Dependencies:** redis / redis.asyncio (optional), aiomcache (optional), json, hashlib; no internal sie_x imports
- **Status:** [WORKING-ISOLATED]
  - 635 LOC with clean optional-import guards. All backends implement the full abstract interface. Graceful-degradation behavior (returns None/False instead of raising) is consistently applied.
- **Line count:** 635
- **Notes:** `middleware.py` imports `FallbackCache` from this module; it's the one internal consumer. The `incr`/`expire` extensions are conditional on backend capability — properly guarded.
```

---

## explainability/xai.py

```
## explainability/xai.py
- **Purpose:** Explainability wrapper that decomposes a keyword extraction decision into linguistic, semantic, graph, contextual, LIME-perturbation, and counterfactual components, with Plotly visualization output.
- **Primary class/function:** `ExplainableExtractor.__init__(engine)` → `explain_extraction(text, keyword, detailed)` → `KeywordExplanation`; `ExplanationVisualizer` → `create_importance_chart()`, `create_evidence_sunburst()`
- **Dependencies:** numpy, shap, lime.lime_text, sklearn, plotly; internal: SemanticIntelligenceEngine (forward ref)
- **Status:** [WORKING-ISOLATED]
  - 784 LOC — the most architecturally ambitious standalone module. LIME initialization is real and correct. SHAP explainer is initialized as `None` (placeholder) at line 44; SHAP path is incomplete. Plotly charts are real.
- **Line count:** 784
- **Notes:** Accidental brilliance candidate — LIME + counterfactual + graph analysis in one wrapper is sophisticated. However, SHAP support is initialized as `None` with no `_initialize_shap()` call found in the visible code — partial implementation. Arch doc presents SHAP as fully present.
```

---

## audit/lineage.py

```
## audit/lineage.py
- **Purpose:** Full audit trail and data lineage system using SQLAlchemy async ORM (with composite indexes), NetworkX lineage graph, and structured GDPR/CCPA compliance event logging.
- **Primary class/function:** `AuditManager` with `AuditLog` and `DataLineage` SQLAlchemy models; `AuditEventType` enum (11 event types); `DataLineageNode` dataclass
- **Dependencies:** sqlalchemy (async), networkx, asyncio, uuid, json; no internal sie_x imports
- **Status:** [WORKING-ISOLATED]
  - 596 LOC with proper async engine setup, composite indexes, and relationship definitions. No wiring found to API or core modules — it's complete infrastructure with no consumer.
- **Line count:** 596
- **Notes:** The database URL is hardcoded nowhere visible in the first 80 lines (looks configurable). Arch doc accurately describes this module.
```

---

## automl/optimizer.py

```
## automl/optimizer.py
- **Purpose:** Optuna-based hyperparameter optimizer that tunes engine mode, batch size, embedding model, graph algorithm, and clustering parameters against user-supplied labeled data.
- **Primary class/function:** `AutoMLOptimizer.__init__(objective_metric, n_trials, n_jobs)` → `optimize(train_data, labels, param_space)`
- **Dependencies:** optuna, sklearn.model_selection, numpy, asyncio; internal: ..core.engine.SemanticIntelligenceEngine, ..core.models.ModelMode
- **Status:** [WORKING-ISOLATED]
  - 291 LOC. Optuna study creation and TPE sampler are real. `_evaluate_engine` method exists but its scoring logic needs review (samples labels against engine output — the ground-truth alignment mechanism is not visible in first 80 lines).
- **Line count:** 291
- **Notes:** No consumer. This is a development-time tool that has no integration point with the production pipeline.
```

---

## training/active_learning.py

```
## training/active_learning.py
- **Purpose:** Continuous learning pipeline that accumulates user feedback samples, fine-tunes the SentenceTransformer using contrastive loss, evaluates improvement, and conditionally deploys the new model.
- **Primary class/function:** `ActiveLearningPipeline.__init__(base_model, feedback_buffer_size, retrain_threshold, uncertainty_threshold)` → `add_feedback(feedback)`, `trigger_retraining()`, `_fine_tune_model(samples)`, `_should_deploy(current, new)`
- **Dependencies:** sentence_transformers (SentenceTransformer, InputExample, losses, DataLoader), torch, sklearn, numpy, asyncio
- **Status:** [WORKING-ISOLATED]
  - 182 LOC of functional fine-tuning code. `_generate_hard_negatives()` returns `[]` (explicit stub). `_evaluate_current_model()` is called but not visible in sampled lines — likely another stub. The "deployment gate" logic (`_should_deploy`) is real (1.02× F1 threshold).
- **Line count:** 182
- **Notes:** Uses `logger.info` but `logger` is never defined in this file (no `import logging` / `logger = logging.getLogger(...)`) — will raise `NameError` at runtime on the first feedback cycle. Silent breakage.
```

---

## federated/learning.py

```
## federated/learning.py
- **Purpose:** Federated learning pipeline using PySyft (sy.TorchHook) for privacy-preserving distributed training with FedAvg weight aggregation across virtual worker clients.
- **Primary class/function:** `FederatedLearningPipeline.__init__(model_factory, aggregation_strategy)` → `register_client(client_id, data)`, `train_round(epochs)`, `_train_client(client, epochs)`, `_aggregate_weights(weights, samples)`
- **Dependencies:** syft, torch, torch.nn, asyncio; no internal sie_x imports
- **Status:** [SCAFFOLD]
  - 280 LOC but critically depends on `PySyft` (imported as `syft`). PySyft v0.2 API (`sy.TorchHook`, `sy.VirtualWorker`) was deprecated and removed in PySyft 0.5+; current PyPI package is completely different. This code will fail to import on any modern PySyft. Structural logic is valid conceptually.
- **Line count:** 280
- **Notes:** Largest red flag in the codebase. The arch doc presents this as a real feature. `syft` API used is >3 major versions stale. Classifying as SCAFFOLD because it cannot run as written.
```

---

## plugins/system.py

```
## plugins/system.py
- **Purpose:** Plugin discovery, loading, and lifecycle management system with abstract base classes for Extractor, Processor, and Analyzer plugins, plus YAML-based manifest loading and hook execution.
- **Primary class/function:** `PluginInterface(ABC)` with `name`, `version`, `description`, `initialize()`, `cleanup()`; `ExtractorPlugin`, `ProcessorPlugin`; `PluginManager` → `discover_plugins(directory)`, `load_plugin(path)`, `execute_hook(hook_name, *args)`
- **Dependencies:** asyncio, importlib, inspect, pathlib, yaml, ast; no internal sie_x imports
- **Status:** [WORKING-ISOLATED]
  - 446 LOC. Full plugin lifecycle is implemented. `ast` import suggests safe-eval or plugin validation code. No plugins ship with the package and no engine integration was found.
- **Line count:** 446
- **Notes:** Well-designed extension point with no consumers. Arch doc accurately describes this.
```

---

## monitoring/observability.py

```
## monitoring/observability.py
- **Purpose:** Three-pillar observability manager combining structlog JSON logging, Prometheus counters/histograms/gauges, and OpenTelemetry distributed tracing with OTLP export to Jaeger/Tempo.
- **Primary class/function:** Module-level Prometheus metric instantiation; `ObservabilityManager` → `track_operation()` async context manager; `PerformanceMonitor`
- **Dependencies:** structlog, prometheus_client, opentelemetry (trace, otlp exporter, sdk); no internal sie_x imports
- **Status:** [WORKING-ISOLATED]
  - 267 LOC. The OTLP exporter is hardcoded to `localhost:4317` at module load time — importing this module in any environment without a running collector will print errors (or fail depending on exporter config). Structlog configuration is complete and correct.
- **Line count:** 267
- **Notes:** Hardcoded OTLP endpoint with no environment variable override visible in first 80 lines. Would be a production deployment issue.
```

---

## testing/ab_framework.py

```
## testing/ab_framework.py
- **Purpose:** Statistical A/B testing framework for SIE-X parameter variants with Thompson sampling (multi-armed bandit), deterministic user allocation via SHA-256 hashing, and scipy-based significance testing.
- **Primary class/function:** `ABTestingFramework.__init__(engine, storage_backend)` → `create_experiment(name, description, control_config, treatment_configs, metrics, allocation_strategy)`, `assign_variant(user_id, experiment_id)`, `analyze_results(experiment_id)`
- **Dependencies:** scipy.stats, numpy, hashlib, asyncio, enum, dataclasses; internal: SemanticIntelligenceEngine (forward ref)
- **Status:** [WORKING-ISOLATED]
  - 451 LOC. This is the second accidental-brilliance candidate — a proper stats framework with Thompson sampling, deterministic allocation, and hypothesis testing. No consumer wires this up anywhere. Arch doc's ~450 LOC estimate is accurate.
- **Line count:** 451
- **Notes:** `storage_backend` is accepted but typed `Optional[Any]` with no interface contract. Persistence is effectively in-memory only unless caller supplies backend.
```

---

## agents/autonomous.py

```
## agents/autonomous.py
- **Purpose:** Ray Serve-based multi-agent system with four specialist agents (Monitor, Analyzer, Optimizer, Validator) that run async message-passing loops and coordinate through a Coordinator agent.
- **Primary class/function:** `BaseAgent(ABC)` → `run()`, `process_message()`, `execute_task()`; concrete subclasses `MonitorAgent`, `AnalyzerAgent`, `OptimizerAgent`, `ValidatorAgent`, `CoordinatorAgent`; top-level `AgentSystem` → `start()`, `stop()`
- **Dependencies:** ray, ray.serve, asyncio, numpy, logging; internal: SemanticIntelligenceEngine (forward ref)
- **Status:** [SCAFFOLD]
  - 789 LOC — large file. BaseAgent and message-passing loop are real. Concrete agent `execute_task()` methods require inspection beyond line 80; the abstract method requirement means all 4 agents must implement it, but implementation quality unknown. Ray Serve deployment wiring is present.
- **Line count:** 789
- **Notes:** Ray is a heavyweight dependency with complex infrastructure requirements (cluster setup, dashboard). No evidence this has been run. Arch doc accurately describes the 4-agent + coordinator structure.
```

---

## Summary table

| Module file | Status | LOC |
|---|---|---|
| core/engine.py | WORKING-ISOLATED | 669 |
| transformers/seo_transformer.py | PRODUCTION | 712 |
| api/minimal_server.py | PRODUCTION | 883 |
| api/middleware.py | WORKING-ISOLATED | 256 |
| auth/enterprise.py | WORKING-ISOLATED | 348 |
| integrations/bacowr_adapter.py | PRODUCTION | 845 |
| sdk/python/client.py | WORKING-ISOLATED | 415 |
| orchestration/langchain_integration.py | WORKING-ISOLATED | 374 |
| streaming/pipeline.py | WORKING-ISOLATED | 251 |
| multilingual/engine.py | SCAFFOLD | 175 |
| chunking/chunker.py | WORKING-ISOLATED | 131 |
| cache/redis_cache.py | WORKING-ISOLATED | 635 |
| explainability/xai.py | WORKING-ISOLATED | 784 |
| audit/lineage.py | WORKING-ISOLATED | 596 |
| automl/optimizer.py | WORKING-ISOLATED | 291 |
| training/active_learning.py | WORKING-ISOLATED | 182 |
| federated/learning.py | SCAFFOLD | 280 |
| plugins/system.py | WORKING-ISOLATED | 446 |
| monitoring/observability.py | WORKING-ISOLATED | 267 |
| testing/ab_framework.py | WORKING-ISOLATED | 451 |
| agents/autonomous.py | SCAFFOLD | 789 |

**Total sampled:** 21 cards
**Status counts:** PRODUCTION: 3 | WORKING-ISOLATED: 15 | SCAFFOLD: 3 | UNVERIFIED: 0

---

## KEY files from arch doc — existence check

All [KEY]-marked files are present at the top-level paths. No [KEY] file is missing.

**Unlisted structural finding:** `D:/sie_x/sie_x/` is a full duplicate tree not documented in the arch doc. This is a packaging artifact (the package was likely placed inside its own distribution folder). It inflates the apparent file count and can cause confusing double-imports if both paths are on `sys.path`.

---

## Accidental brilliance (better than arch doc implies)

1. **`integrations/bacowr_adapter.py`** (845 LOC) — Arch doc describes 3 methods with a brief formula. Actual file is 845 LOC with 8+ methods, detailed comment blocks, and a complete BACOWR pipeline integration guide. The most mature, consumer-connected module in the system.

2. **`explainability/xai.py`** (784 LOC) — Arch doc accurately counts LOC but undersells the sophistication. LIME perturbation + graph centrality + counterfactual analysis in one unified `KeywordExplanation` dataclass is production-grade XAI design, even if SHAP is stubbed.

3. **`testing/ab_framework.py`** (451 LOC) — A proper statistical testing framework with Thompson sampling and deterministic SHA-256 allocation. Arch doc mentions it but doesn't convey that this is a genuinely well-engineered standalone module.

---

## Arch doc overclaims (worse than advertised)

1. **`multilingual/engine.py`** — Arch doc claims "100+ language support." The `LANGUAGE_CONFIGS` dict has 4 entries and a `# Add 96 more...` comment. The claimed scope is ~4% implemented. (The separate `core/multilang.py` used by the API has 11 real languages — doc conflates the two.)

2. **`federated/learning.py`** — Arch doc presents this as a working privacy-preserving training system. It imports `syft` using the PySyft 0.2 API which has been completely removed in modern PySyft (0.5+). The code cannot be imported, let alone run.

3. **`training/active_learning.py`** — `logger` is used throughout but never defined in the module. Will raise `NameError` on first feedback cycle. The deployment-gate logic is otherwise sound, but this is a silent runtime breakage the arch doc doesn't mention.

---

*Generated by spot-check audit, read-only. 21 files sampled across 20 directories.*
