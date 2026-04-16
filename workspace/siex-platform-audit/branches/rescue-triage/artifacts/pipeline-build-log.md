# Pipeline Build Log — SIE-X `core/pipeline.py`

**Date:** 2026-04-15
**Status:** COMPLETE — import OK, example runs

---

## Files created

| File | LOC | Purpose |
|---|---|---|
| `D:/sie_x/core/pipeline.py` | ~590 | Pipeline engine (all classes) |
| `D:/sie_x/core/pipeline_example.py` | ~130 | Three runnable examples |

---

## Classes in pipeline.py

| Class | Type | Description |
|---|---|---|
| `PipelineContext` | dataclass | Data bus between steps: text, language, keywords, metadata, explanations, audit_id, errors, timings |
| `PipelineStep` | ABC | Base for all steps: name, execute(context), validate() |
| `PipelineResult` | dataclass | Final output: keywords, metadata, explanations, audit_id, timings, errors, pipeline_name, steps_executed, to_dict() |
| `Pipeline` | class | Orchestrator: add_step(), remove_step(), run() (async), run_sync(), validate_all(), describe() |
| `ExtractStep` | PipelineStep | Wraps any engine with .extract() or .extract_async(); async-aware |
| `TransformStep` | PipelineStep | Wraps any BaseTransformer via transform_extraction() |
| `ExplainStep` | PipelineStep | Wraps ExplainableExtractor; skips if shap/lime missing |
| `AuditStep` | PipelineStep | Wraps AuditManager.log_event(); skips if no manager or sqlalchemy absent |
| `TelemetryStep` | PipelineStep | Increments Prometheus counters; skips if prometheus_client absent |
| `ExportStep` | PipelineStep | Serialises keywords to context.metadata["export"]; always runs |

---

## Import verification

```
cd /d/ && python -c "from sie_x.core.pipeline import Pipeline, ExtractStep, PipelineContext; print('pipeline import OK')"
# → pipeline import OK
```

**Note:** `sie_x` must be imported from `D:/` (parent of the package), not from `D:/sie_x/`.

---

## Example output

```
=== Example 1: Minimal pipeline ===
Steps executed : ['ExtractStep']
Keywords found : 5
  machine learning                     score=0.920  type=CONCEPT
  artificial intelligence              score=0.880  type=CONCEPT
  Python                               score=0.800  type=ORG
  data science                         score=0.750  type=CONCEPT
  Rust                                 score=0.700  type=ORG

=== Example 2: Full pipeline (optional steps skip gracefully) ===
Steps executed : ['ExtractStep', 'ExportStep']
Keywords found : 6
Audit ID       : None
Timings        : {'ExtractStep': '0.0007s', 'ExportStep': '0.0005s'}
Non-fatal notes:
  - ExplainStep skipped: validate() returned False
  - AuditStep skipped: validate() returned False
  - TelemetryStep skipped: validate() returned False

=== Example 3: pipeline.describe() ===
Pipeline: 'described-pipeline'  (5 steps)
   1. ExtractStep                       [OK]
   2. ExplainStep                       [INVALID]
   3. AuditStep                         [INVALID]
   4. TelemetryStep                     [INVALID]
   5. ExportStep                        [OK]
```

---

## What composes (no extra deps)

- `Pipeline`, `PipelineContext`, `PipelineResult`, `PipelineStep` — pure stdlib + pydantic (already installed)
- `ExtractStep` — works with any engine; adapts to sync or async via `asyncio.iscoroutinefunction`
- `TransformStep` — works with any `BaseTransformer` subclass
- `ExportStep` — stdlib only, always valid

## What needs optional deps

| Step | Required dep | Status on this machine | Behaviour when absent |
|---|---|---|---|
| `ExplainStep` | `shap`, `lime` | MISSING | validate()=False, note added to errors |
| `AuditStep` | `sqlalchemy` (+ aiosqlite) | Not checked (needs AuditManager instance too) | validate()=False |
| `TelemetryStep` | `prometheus_client` | MISSING | validate()=False, note added to errors |

## Environment note

spaCy is not installed on this machine, so `SimpleSemanticEngine` cannot be instantiated. The example uses a `_MockEngine` to verify the pipeline mechanics. Swap in `SimpleSemanticEngine` once spaCy is installed:

```python
from sie_x.core.simple_engine import SimpleSemanticEngine
engine = SimpleSemanticEngine()
result = Pipeline("prod").add_step(ExtractStep(engine, top_k=20)).run_sync(text)
```
