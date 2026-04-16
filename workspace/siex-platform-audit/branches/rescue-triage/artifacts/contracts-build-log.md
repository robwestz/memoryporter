# contracts-build-log.md

**Date:** 2026-04-15  
**Output:** `D:/sie_x/core/contracts.py` (~400 LOC)

---

## Protocols defined

| Protocol | Based on | Notes |
|---|---|---|
| `ExtractorProtocol` | `SimpleSemanticEngine.extract` + `SemanticIntelligenceEngine.extract_async` | Sync + async extraction |
| `TransformerProtocol` | `BaseTransformer` (transformers/base.py) | Structural twin of the ABC |
| `CacheProtocol` | `CacheManager` (cache/manager.py) | Sync in-process cache |
| `AsyncCacheProtocol` | `CacheBackend` ABC / `FallbackCache` | Async Redis/Memcached backends |
| `AuditProtocol` | `AuditManager` (audit/lineage.py) | Real method names (not spec's hypothetical ones) |
| `MetricSinkProtocol` | `MetricsCollector` (monitoring/metrics.py) | Exposes gaps vs. desired interface |
| `ExplainerProtocol` | `ExplainableExtractor` (explainability/xai.py) | Async explain_extraction |
| `ExportProtocol` | `ExportManager` (export/formats.py) | to_json + to_csv (static methods) |
| `PipelineStepProtocol` | No current implementor | Future abstraction |

Also provided: `check_compliance()`, `register_implementation()`, `get_implementations()`, `validate_existing()`, `_auto_register()`.

---

## validate_existing() output

```
BaseTransformer:TransformerProtocol:        OK
FallbackCache:AsyncCacheProtocol:           OK
AuditManager:AuditProtocol:                 OK
CacheManager:CacheProtocol:                 GAPS: ['delete']
MetricsCollector:MetricSinkProtocol:        GAPS: ['observe', 'gauge']
SimpleSemanticEngine:ExtractorProtocol:     import failed (spacy not in env)
SemanticIntelligenceEngine:ExtractorProtocol: import failed (spacy not in env)
ExplainableExtractor:ExplainerProtocol:     import failed (shap not in env)
ExportManager:ExportProtocol:               import failed (spacy transitive)
```

Import failures are environment-only (ML deps absent in current shell). The protocol definitions themselves are structurally accurate.

---

## Compliance findings

### Fully compliant
- `BaseTransformer` → `TransformerProtocol` — ABC already enforces all three methods.
- `FallbackCache` → `AsyncCacheProtocol` — all four async methods present.
- `AuditManager` → `AuditProtocol` — real method names aligned.

### Partial / gaps (no modifications made to source modules)

| Class | Protocol | Gap |
|---|---|---|
| `CacheManager` | `CacheProtocol` | Missing `delete()` — LRU only supports get/set/clear |
| `MetricsCollector` | `MetricSinkProtocol` | Missing `observe()` and `gauge()` — legacy wrapper is effectively a no-op; real Prometheus primitives are module-level globals, not injected |

### Spec vs. reality divergences
- `AuditProtocol`: spec requested `log_extraction(request_hash, input_data, output_data, metadata)` and `query_by_hash(hash)` — these names do not exist. Actual API is `log_event(event_type, ...)` and `query_audit_logs(filters, ...)`. Protocol uses real names.
- `ExplainerProtocol`: spec requested sync `explain_keyword(keyword, text)` and `explain_extraction(keywords, text)`. Actual module has `async explain_extraction(text, keyword)` (singular keyword, args reversed). Protocol matches actual.
- `ExportProtocol`: spec requested `export(data, format)` + `supported_formats()`. `ExportManager` has static per-format methods only (`to_json`, `to_csv`, `to_graphml`, `to_embeddings`). Protocol reflects real API.
- `AsyncCacheProtocol` added (not in spec) because the Redis/Memcached layer is fully async — mapping it to a sync `CacheProtocol` would be incorrect.

---

## Verification

```
python -c "from sie_x.core.contracts import ExtractorProtocol, check_compliance; print('contracts OK')"
# → contracts OK

python -c "from sie_x.core.contracts import validate_existing; print(validate_existing())"
# → see output above
```
