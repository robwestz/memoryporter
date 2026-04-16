# Depth Verification — Phase 1

Summary:
- Modules [ELEVATE-NOW]: 4 (audit, testing, monitoring, cache)
- Modules [ELEVATE-LATER]: 3 (automl, explainability, chunking)
- Modules [ARCHIVE]: 2 (federated, agents)
- Modules [KEEP-AS-IS]: 1 (plugins)

---

## D:/sie_x/automl/

- **Files:**
  - `__init__.py` — 0 LOC (empty)
  - `optimizer.py` — 291 LOC

- **Implemented capability:** `AutoMLOptimizer` is genuinely real: uses Optuna TPE sampler + MedianPruner, samples a meaningful 9-parameter space (embedding model, graph algorithm, damping, semantic threshold, clustering eps, batch size, chunk size, keyword length, mode), evaluates with per-sample F1 calculation, logs every 10 trials, and returns `study.best_params`. The Optuna loop, objective function, and engine instantiation are all complete.

  `NeuralArchitectureSearch` is partially real: Optuna loop with HyperbandPruner is structurally complete, but `_simulate_performance` is an explicit placeholder that returns a deterministic score from architecture heuristics + random noise (comment in file: "This is a placeholder — in production, would actually train and evaluate"). No actual model training occurs.

- **Not implemented:** `NeuralArchitectureSearch._simulate_performance` — hardcoded heuristic scores, not real model training. No model selection (no sklearn model comparison, no transformer swapping). NAS is a search shell with fake evaluation.

- **External dependencies:** `optuna`, `numpy`, `sklearn`, `..core.engine.SemanticIntelligenceEngine`, `..core.models.ModelMode`

- **Production wiring status:** [UNREACHABLE] — only imported lazily inside `agents/autonomous.py:431` (`OptimizerAgent._tune_hyperparameters`), which is itself unreachable (see agents card). No direct import from API or engine startup.

- **Elevation pool recommendation:** [ELEVATE-LATER] — `AutoMLOptimizer` is real and functional but needs a production entrypoint. NAS is half-baked; don't include it in the pairing.

- **Suggested pairing for elevation:** `automl/optimizer.py` + `testing/ab_framework.py` → automated parameter optimization pipeline that selects and validates winning configs via A/B test, closing the loop from trial to production

- **Commercial angle:** MLOps teams paying for hyperparameter services (SageMaker tuning, Azure HyperDrive) would pay for a self-contained optimizer that auto-tunes and validates changes before shipping them.

---

## D:/sie_x/audit/

- **Files:**
  - `__init__.py` — 0 LOC (empty)
  - `lineage.py` — 596 LOC

- **Implemented capability:** This is the most complete infrastructure module in the audit. `AuditManager` uses SQLAlchemy async ORM with three real DB models (AuditLog, DataLineage, LineageEdge), composite indexes, and a background `_audit_worker` that batches writes in groups of 100 or flushes every 5 seconds — a real production pattern. `track_lineage` creates SHA-256 hashes of input/output data and persists parent-child edges. `get_lineage_trace` walks upstream/downstream via recursive async SQL queries. `generate_compliance_report` queries `ComplianceLog` by regulation (GDPR/CCPA/HIPAA) and produces structured summary. `log_compliance_event` writes compliance records directly. Graph viz returns nodes/edges dict for D3 or similar.

  One SQL bug: `query_audit_logs` mixes SQLAlchemy 1.x sync `.query()` with `async_session`, but the surrounding structure is correct; the fix is a one-liner (`select(AuditLog)` + `scalars()`).

- **Not implemented:** No data retention/purge logic. No read access control on audit log (anyone can query). SQL raw strings in `_trace_upstream`/`_trace_downstream` bypass ORM, which works but is fragile. Compliance report does not aggregate across multiple regulations.

- **External dependencies:** `sqlalchemy[asyncio]`, `aiosqlite` or `asyncpg`, `networkx`, `uuid`, `hashlib`

- **Production wiring status:** [UNREACHABLE] — nothing imports `AuditManager`. Not wired into `core/engine.py`, API routes, or middleware. Complete isolation.

- **Elevation pool recommendation:** [ELEVATE-NOW] — solid, commercially distinct capability. The async batch-write worker + lineage graph + compliance report is a real product.

- **Suggested pairing for elevation:** `audit/lineage.py` + `api/routes.py` (or `api/server.py`) → expose `/audit/lineage/{node_id}` and `/audit/compliance-report` endpoints; combine with monitoring's `ObservabilityManager` for end-to-end traceability

- **Commercial angle:** GDPR/HIPAA compliance buyers (healthcare, finance) need audit trails as a table-stakes requirement; this module ships 80% of what they need out of the box.

---

## D:/sie_x/testing/

- **Files:**
  - `__init__.py` — 0 LOC (empty)
  - `ab_framework.py` — 451 LOC

- **Implemented capability:** `ABTestingFramework` is a genuine A/B testing implementation. Split assignment has two real strategies: random (weighted draw) and deterministic (MD5 hash of `experiment_id:user_id` mod 100, ensuring sticky assignment across requests). Adaptive allocation implements Thompson sampling with real Beta distribution sampling via `numpy.random.beta`. Metric tracking (`track_metric`) stores values per-variant in memory. `analyze_experiment` computes mean/std/median/min/max, runs Welch's t-test via `scipy.stats.ttest_ind`, calculates Cohen's d effect size, and builds a confidence interval via `stats.t.interval`. Auto-stopping checks minimum sample size (default 1000), p-value thresholds (< 0.001 or > 0.999 for early stop), and 30-day time limit. `get_winning_variant` and `apply_winner` close the loop by writing the winning config back to the engine. `ExperimentLibrary` provides two concrete example experiments.

  Notable gap: `logger` is used at lines 130 and 147 but is never defined in the file (missing `import logging; logger = logging.getLogger(__name__)`). The file will crash at runtime on `start_experiment` or `stop_experiment`.

- **Not implemented:** No persistence — experiments live in memory only, lost on restart. No multi-metric winner selection (only primary metric used). The `storage_backend` parameter is accepted but never used. `apply_winner` does naive `setattr` which is fragile for complex config keys.

- **External dependencies:** `numpy`, `scipy`, `hashlib`, `random`, `asyncio`

- **Production wiring status:** [UNREACHABLE] — `ABTestingFramework` is never imported outside its own file. No reference in API, engine, or any orchestration layer.

- **Elevation pool recommendation:** [ELEVATE-NOW] — deterministic hash assignment + Thompson sampling + scipy statistics is a complete, commercially defensible experimentation framework. The logger bug is a 2-line fix.

- **Suggested pairing for elevation:** `testing/ab_framework.py` + `api/routes.py` → REST endpoints for experiment CRUD (`POST /experiments`, `GET /experiments/{id}/results`) with persistence via `audit/lineage.py` as the write-through store

- **Commercial angle:** Growth and ML teams at SaaS companies pay specifically for feature flag + experiment platforms (LaunchDarkly, Statsig); embedding this in the extraction API lets them A/B test extraction configs without external tooling.

---

## D:/sie_x/federated/

- **Files:**
  - `__init__.py` — 0 LOC (empty)
  - `learning.py` — 280 LOC

- **Implemented capability:** `FederatedLearningPipeline` registers clients, dispatches local training with async executor, and aggregates weights via FedAvg (weighted average by sample count). The actual PyTorch training loop in `_train_client_sync` is real: zero grad → forward → CrossEntropyLoss → backward → optimizer step. `_aggregate_weights` correctly computes weighted parameter tensors. `evaluate_global_model` handles DataLoader iteration.

  However the module is fatally broken in two independent ways:

  1. `import syft as sy` — PySyft's API used here (`sy.TorchHook`, `sy.VirtualWorker`) is from PySyft 0.2.x (pre-2021). Modern PySyft (0.8+) removed these entirely. This will `ImportError` on any current environment.

  2. `_train_client_sync` contains an explicit fallback that, when `data_ptr` is not iterable (which it won't be after a PySyft pointer send), runs 10 fake `optimizer.step()` calls with no forward pass and estimates `total_samples = 320`. This simulated training produces garbage weights.

  Even if PySyft were pinned to 0.2.x, the `data.send(client_worker)` call on line 49 requires `data` to be a PySyft-wrapped tensor, but `register_client` receives `List[Any]` — Python list send is not valid PySyft syntax.

- **Not implemented:** Differential privacy (no noise injection). Secure aggregation. Any gradient compression. The aggregation strategy is hardcoded to `fedavg` (the `else: raise ValueError` on line 214 means any other strategy immediately fails).

- **External dependencies:** `syft` (stale 0.2.x), `torch`, `asyncio`

- **Production wiring status:** [UNREACHABLE] — zero imports anywhere outside the file.

- **Elevation pool recommendation:** [ARCHIVE] — the PySyft API is irrecoverably stale. The PyTorch training logic has substance (FedAvg aggregation is correct) but it is inseparable from the broken PySyft scaffolding. Rewriting from scratch around a current FL framework (Flower, OpenFL) would be faster than patching this.

- **Suggested pairing for elevation:** N/A

- **Commercial angle:** N/A

---

## D:/sie_x/plugins/

- **Files:**
  - `__init__.py` — 0 LOC (empty)
  - `system.py` — 446 LOC

- **Implemented capability:** `PluginManager` is a complete lifecycle manager: `discover_plugins` walks a directory glob, parses YAML metadata from docstrings via `ast`, validates required fields (`name`, `version`, `type`, `author`), loads the module with `importlib.util.spec_from_file_location`, inspects for `PluginInterface` subclasses, and registers them. `register_hook` + `execute_hook` implement a real event bus with async-aware dispatch (checks `asyncio.iscoroutinefunction`). `initialize_all` / `cleanup_all` iterate plugins with exception isolation. Two concrete plugin implementations (domain extractor, citation processor) demonstrate the interface pattern. `PLUGIN_CONFIG_SCHEMA` provides JSON Schema validation spec.

  Notable: `get_plugin` version resolution is naïve (returns last match, no semver sort). Discovery is filesystem-only; no package registry or entrypoint-based discovery.

- **Not implemented:** No sandboxing or security isolation for loaded plugins. No versioned dependency resolution. No plugin disable/enable at runtime. `_is_domain_relevant` always returns `True` (stub). `_extract_domain_terms` always returns `[]` (stub).

- **External dependencies:** `importlib`, `inspect`, `pathlib`, `yaml`, `ast` — all stdlib/PyYAML. No heavy external deps.

- **Production wiring status:** [UNCLEAR] — `PluginManager` is defined but never imported from any engine, API, or orchestration layer in the searched codebase. The plugin infrastructure exists but is not connected.

- **Elevation pool recommendation:** [KEEP-AS-IS] — the infrastructure is sound and self-contained. It doesn't need elevation; it needs to be wired to `core/engine.py` as an optional extensibility layer. Not a Phase 3 challenge candidate on its own.

- **Suggested pairing for elevation:** `plugins/system.py` + `core/engine.py` → inject `PluginManager` into engine init; call `execute_hook("post_extract", keywords)` after each extraction. Low-effort wiring that unlocks third-party extensibility.

- **Commercial angle:** Enterprise customers who want to inject domain-specific keyword logic without forking the core engine.

---

## D:/sie_x/monitoring/

- **Files:**
  - `__init__.py` — 7 LOC (exports `MetricsCollector`)
  - `metrics.py` — 104 LOC
  - `observability.py` — 267 LOC

- **Implemented capability:** This module has two layers, and they differ significantly in quality.

  `metrics.py` defines 6 real Prometheus metric objects at module level (`REQUESTS_TOTAL` Counter, `REQUEST_LATENCY` Histogram, `ERRORS_TOTAL` Counter, `ACTIVE_REQUESTS` Gauge, `KEYWORDS_EXTRACTED` Counter, `MODEL_INFO` Gauge) and a `get_metrics_app()` that returns a real `make_asgi_app()` Prometheus scrape endpoint. These are **directly wired**: `api/minimal_server.py` imports `REQUESTS_TOTAL` and calls `.labels(...).inc()` on every request with 429 and 200 status codes. `core/engine.py` instantiates `MetricsCollector`. The `MetricsCollector` wrapper has `increment`/`record` methods that are no-ops (pass), but the Prometheus counters themselves fire from the API layer.

  `observability.py` is more complete: `ObservabilityManager.track_operation` is an async context manager that increments `active_operations`, observes `extraction_duration`, increments `extraction_counter` on success/failure, and emits structured JSON logs via `structlog`. OpenTelemetry tracing is initialized with `OTLPSpanExporter` pointing to `localhost:4317` (hardcoded, would need config injection for prod). `PerformanceMonitor.measure_latency` wraps any async callable and records result.

  The Prometheus metrics in `observability.py` duplicate some from `metrics.py` (`extraction_counter` vs. `REQUESTS_TOTAL`) — parallel definitions that would cause a Prometheus duplicate registration error if both files are imported in the same process.

- **Not implemented:** `MetricsCollector.increment` and `MetricsCollector.record` are no-ops. No alerting rules or threshold logic. OpenTelemetry endpoint is hardcoded, not configurable. Duplicate counter names between `metrics.py` and `observability.py` is a runtime collision.

- **External dependencies:** `prometheus_client`, `structlog`, `opentelemetry-sdk`, `opentelemetry-exporter-otlp-proto-grpc`

- **Production wiring status:** [REACHABLE] — `REQUESTS_TOTAL` and `MetricsCollector` are imported and called from live API paths in `api/minimal_server.py` and `core/engine.py`. `ObservabilityManager` is defined but not yet instantiated in any entrypoint.

- **Elevation pool recommendation:** [ELEVATE-NOW] — the metrics are already partially wired. Fix the duplicate counter collision, inject `ObservabilityManager` into engine, and the module becomes a shippable observability stack.

- **Suggested pairing for elevation:** `monitoring/observability.py` + `monitoring/metrics.py` + `core/engine.py` → deduplicate counters, wrap `engine.extract()` in `track_operation`, expose `/metrics` via `get_metrics_app()` → a complete Prometheus + OpenTelemetry observability layer

- **Commercial angle:** Enterprises with SRE teams need Prometheus-compatible metrics as a non-negotiable for SLA monitoring; this is already 70% wired.

---

## D:/sie_x/agents/

- **Files:**
  - `__init__.py` — 0 LOC (empty)
  - `autonomous.py` — 789 LOC

- **Implemented capability:** Wave 1's SCAFFOLD verdict was correct but incomplete. The file has more substance than a pure stub: `BaseAgent` provides a real async run loop with message queue, `MonitorAgent` collects 5 metric types and threshold-checks them, `AnalyzerAgent` does trend analysis (comparing 10-sample sliding windows) and root-cause heuristics, `OptimizerAgent` has a priority queue and dispatches to real actions, `ValidatorAgent` includes an embedded test suite with latency, accuracy, and memory checks that call the actual engine. The `CoordinatorAgent` routes messages between agents and manages their lifecycle.

  However the entire system is irrecoverably broken as a unit:

  1. `import ray` and `from ray import serve` at the top of the file — Ray must be installed and a Ray cluster must be running for `CoordinatorAgent` (decorated `@ray.remote`) and `SIEXOrchestrator` (decorated `@serve.deployment`) to instantiate. Without Ray, the entire module fails at import time.

  2. `agent.send_message` is defined as an empty `pass` in `BaseAgent`. The coordinator patches it at `start_all_agents` via `agent.send_message = self.route_message`, but this only works after `start_all_agents` is called — any message sent before that silently disappears.

  3. `MonitorAgent._get_avg_latency`, `_get_error_rate`, `_get_throughput` all return hardcoded simulated values (`100.0`, `0.01`, `10.0`) when the cache lacks the methods. Real metric integration is absent.

  4. `OptimizerAgent._increase_cache_size` calls `self.engine.cache.resize(new_size)` — `CacheManager` has no `resize` method.

  5. `OptimizerAgent._run_automl` is a logged sleep: `await asyncio.sleep(1)` (explicit placeholder comment on line 469).

  **Salvageable pattern:** The `ValidatorAgent._load_validation_suite` + `_run_health_checks` pattern (inline async test closures that exercise the real engine) is the most commercially interesting piece. It is a self-contained health-check framework that could be extracted independently of the Ray/agent scaffolding.

- **Not implemented:** Real metric collection (all simulated). `_run_automl` (sleeps). `_rollback_model_version` (logs only). `OptimizerAgent._optimize_cache_strategy` calls `engine.cache.set_strategy('predictive')` — method does not exist on `CacheManager`.

- **External dependencies:** `ray`, `ray[serve]`, `asyncio`, `numpy`, `psutil`

- **Production wiring status:** [UNREACHABLE] — `SIEXOrchestrator` is a Ray Serve deployment that must be explicitly `serve.run()`'d. Nothing in the API or entrypoints does this.

- **Elevation pool recommendation:** [ARCHIVE] — the Ray dependency and the Ray Serve deployment model make this incompatible with the rest of the stack unless Ray is explicitly adopted. The multi-agent loop design is architecturally sound but the implementation is too entangled with Ray to salvage without a rewrite. Extract `ValidatorAgent`'s health-check suite separately if needed.

- **Suggested pairing for elevation:** N/A (for archive). Optional salvage: extract inline validation test closures from `ValidatorAgent._load_validation_suite` (lines 568–615) → standalone health-check module, pair with `monitoring/observability.py`

- **Commercial angle:** N/A

---

## D:/sie_x/chunking/

- **Files:**
  - `__init__.py` — 3 LOC (exports `DocumentChunker`)
  - `chunker.py` — 131 LOC

- **Implemented capability:** `DocumentChunker` and `SlidingWindowChunker` are genuinely different implementations, not copy-pastes. `DocumentChunker.chunk` uses a fixed `max_tokens` window with configurable `overlap_ratio`, optionally snapping chunk boundaries to sentence-end punctuation tokens (`.`, `!`, `?`). The boundary-snapping logic finds the nearest sentence-boundary token at or before the hard cutoff.

  `SlidingWindowChunker` extends this with a real algorithmic difference: `_calculate_token_densities` computes per-token information density as inverse normalized frequency (rare tokens = high density), then `chunk` scales the window size dynamically between 70%-100% of `max_tokens` based on local 50-token density average (`chunk_size = int(max_tokens * (0.7 + 0.3 * local_density))`). This is a substantive distinction: dense regions get smaller chunks, sparse regions get larger ones.

  Known limitation: `DocumentChunker._find_sentence_boundaries` comment says "Simple implementation — would use spaCy in production." The current implementation decodes each token individually (O(n) decode calls), which is slow. Production would batch-decode or use spaCy sentence segmentation.

- **Not implemented:** No semantic boundary detection (no embedding-based coherence check at boundaries). No minimum chunk size enforcement (a very sparse region could produce a chunk of `max_tokens * 0.7` = 358 tokens which is fine, but there's no floor for abnormal cases). `DocumentChunker` requires a tokenizer to be passed — no default tokenizer provided, so instantiation without a tokenizer raises `AttributeError` on first call.

- **External dependencies:** `transformers.PreTrainedTokenizer` (must be passed in), `numpy`

- **Production wiring status:** [REACHABLE] — `from ..chunking import DocumentChunker` is imported directly in `core/engine.py:26`. This is the only confirmed module that is both real and wired to the production core.

- **Elevation pool recommendation:** [ELEVATE-LATER] — already wired; the elevation angle is demonstrating the `SlidingWindowChunker` tradeoff empirically. Needs the A/B framework to do it properly (the `ExperimentLibrary.chunking_strategy_experiment` in `testing/ab_framework.py` already defines this exact experiment).

- **Suggested pairing for elevation:** `chunking/chunker.py` + `testing/ab_framework.py` → run the pre-built `chunking_strategy_experiment` to generate empirical data on whether adaptive sizing improves extraction quality

- **Commercial angle:** RAG pipeline vendors and document AI platforms pay for chunking quality improvements that measurably improve retrieval precision.

---

## D:/sie_x/explainability/

- **Files:**
  - `xai.py` — 784 LOC (only file; no `__init__.py`)

- **Implemented capability:** Wave 1 confirmed real SHAP + LIME. Full re-read confirms this is the most feature-complete module in the repo. `ExplainableExtractor` generates 6 explanation components per keyword: linguistic (NER type, POS tags, term frequency), semantic (cosine coherence with document, semantic neighbor similarity), graph centrality (degree, betweenness, closeness, PageRank — all via NetworkX on a freshly-built semantic graph), contextual (position ratio, co-occurrences, syntactic role via spaCy dependency parse), LIME (real `LimeTextExplainer.explain_instance` with 100 samples), and counterfactual (keyword-removal impact on other keyword scores, context perturbation sensitivity). `_trace_decision_path` generates a human-readable decision narrative. `ExplanationVisualizer` builds Plotly bar charts, sunburst evidence hierarchies, decision path diagrams, and a full HTML report with embedded Plotly.

  There is **no `__init__.py`** in this directory — the module must be imported as `from sie_x.explainability.xai import ExplainableExtractor`, not `from sie_x.explainability import ExplainableExtractor`.

  One code bug at line 496: `[kw.text for kw in self.engine.extract(keyword.text)]` — this calls `extract` on the keyword text (a single word), not the original document, producing a nonsensical ranking. This would raise `IndexError` if the keyword is not in the single-word extraction result.

- **Not implemented:** `shap` is imported but `self.shap_explainer` is set to `None` in `_initialize_explainers` (SHAP explainer is defined but never initialized or used). No model attribution SHAP — only LIME is active. No caching of explanations (each call rebuilds the semantic graph and recomputes embeddings). HTML report path writing is not async-safe.

- **External dependencies:** `shap`, `lime`, `sklearn`, `plotly`, `networkx`, `numpy`, spaCy (via `self.engine.nlp`)

- **Production wiring status:** [UNREACHABLE] — `ExplainableExtractor` is never imported from any entrypoint, API route, or engine initialization. The missing `__init__.py` also blocks standard package imports.

- **Elevation pool recommendation:** [ELEVATE-LATER] — this is the most novel capability in the codebase (keyword extraction explainability with graph + LIME + counterfactuals is rare), but it needs: (1) `__init__.py` added, (2) SHAP wired or removed, (3) the line 496 bug fixed, (4) an API endpoint.

- **Suggested pairing for elevation:** `explainability/xai.py` + `api/routes.py` → `GET /extract/{keyword}/explain` endpoint; pair with `monitoring/observability.py` to trace explanation latency

- **Commercial angle:** Legal, healthcare, and compliance buyers explicitly require "why was this keyword flagged" — explainability is a procurement requirement, not a nice-to-have.

---

## D:/sie_x/cache/

- **Files:**
  - `__init__.py` — 8 LOC (exports `CacheManager`, `RedisCache`)
  - `manager.py` — 30 LOC
  - `redis_cache.py` — 635 LOC

- **Implemented capability:** The cache module has a real two-tier architecture.

  `manager.py` is a minimal but correct LRU cache: `OrderedDict`-based, `get` moves accessed key to end, `set` evicts LRU entry when `max_size` exceeded. Zero dependencies, works in-process. This is the fallback for environments without Redis/Memcached and is directly wired to `core/engine.py`.

  `redis_cache.py` implements a full three-class hierarchy: `CacheBackend` (ABC with 7 abstract methods), `RedisCache` (async aioredis, MD5 key generation, TTL via `setex`, stats via `INFO` command), `MemcachedCache` (aiomcache, bytes-encoded keys, `flush_all` for clear), and `FallbackCache` (the orchestration layer). `FallbackCache.connect()` iterates backends in order, picks the first that connects successfully, logs which backend was chosen, and all subsequent operations route through `active_backend` with per-operation fallback to secondary backends on exception. The fallback is genuinely graceful: if Redis fails mid-operation, `get` and `set` both iterate remaining backends. `delete` is broadcast to all available backends (important for consistency). Both optional deps are guarded by `try/except ImportError` at module level, so the module is safe to import without Redis or aiomcache installed.

  `api/middleware.py` imports `FallbackCache` directly and uses it for JWT session caching in `AuthenticationMiddleware`. This is live production wiring.

  Gap: `CacheManager` (the LRU in-memory version) is what `core/engine.py` uses, not `FallbackCache`. The production API uses `FallbackCache` for auth tokens. The keyword extraction path uses only in-memory LRU — no Redis for extraction results.

- **Not implemented:** No serialization/deserialization of complex types beyond JSON (embeddings stored as numpy arrays would need `.tolist()` conversion). `MemcachedCache.incr` and `expire` return `None`/`False` explicitly (documented limitation). `CacheManager` has no `get_statistics`, `resize`, or `set_strategy` methods that `agents/autonomous.py` calls — those calls would fail at runtime.

- **External dependencies:** `redis`/`redis.asyncio` (optional), `aiomcache` (optional), `json`, `hashlib`

- **Production wiring status:** [REACHABLE] — `CacheManager` wired to `core/engine.py`; `FallbackCache` wired to `api/middleware.py` for auth token caching. Both paths are active.

- **Elevation pool recommendation:** [ELEVATE-NOW] — already partially in production. The elevation play is wiring `FallbackCache` to the extraction path (replacing in-memory `CacheManager` with `FallbackCache` that degrades gracefully), and exposing cache stats via the `/metrics` endpoint.

- **Suggested pairing for elevation:** `cache/redis_cache.py` + `core/engine.py` + `monitoring/metrics.py` → replace `CacheManager` with `FallbackCache` in engine init, emit cache hit/miss to Prometheus `KEYWORDS_EXTRACTED` and a new `sie_x_cache_hit_rate` gauge

- **Commercial angle:** Multi-tenant SaaS deployments need distributed caching to avoid redundant embedding computation; Redis-backed extraction cache directly reduces inference cost, a selling point for usage-based pricing.
