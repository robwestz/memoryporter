# Drift report: SIE-X master vs Bacowr-v6.3

## Summary
- SIE-X files total: 62 unique (the repo contains a mirrored duplicate tree at `sie_x/sie_x/`; all root-level files are byte-for-byte identical to the nested copies — 0 diff lines)
- Bacowr files total: 13 (5 core + 8 tests)
- Bacowr direct imports of sie_x: **0 files** (zero live imports from master)
- Bacowr copies (same basename): **3 files** — `engine.py`, `models.py`, `pipeline.py`
  - IDENTICAL: 0
  - MINOR: 0
  - MAJOR: 0
  - DIVERGED: 0
  - FORK: 3
- Bacowr compositions (new files using SIE-X pieces across modules): **1 file** (`pipeline.py`)
- Bacowr-original files (no SIE-X equivalent): 2 (`article_validator.py`, `smoke_test.py`) + 8 test files

---

## Per-file classification (table)

| Master file | Bacowr file | Same-name? | SIE-X lines | Bacowr lines | Diff lines (changed) | Classification | Notes |
|---|---|---|---|---|---|---|---|
| `core/engine.py` | `engine.py` | YES | 669 | 3160 | 3830 | **FORK** | Zero shared class names. SIE-X: `SemanticIntelligenceEngine` (NLP/embeddings). Bacowr: `ArticleOrchestrator`, `BridgeGravityEngine`, `ThesisForge` etc. — entirely different domain and architecture. Header says "adapted from Entity & Cluster Intelligence Engine v3.0", not current SIE-X. |
| `core/models.py` | `models.py` | YES | 343 | 363 | 706 | **FORK** | Zero shared class names. SIE-X: Pydantic `Keyword`, `ExtractionRequest`, `ExtractionResponse`. Bacowr: dataclass `JobSpec`, `Preflight`, `SemanticBridge`, `GoogleIntelligence` etc. — SEO article pipeline domain, not keyword extraction. |
| `streaming/pipeline.py` | `pipeline.py` | YES | 251 | 1122 | 1367 | **FORK** | SIE-X `StreamingPipeline` is a Kafka/Redis real-time consumer. Bacowr `Pipeline` is a CSV-driven async HTTP batch runner for article generation. Same name, completely different purpose. SIE-X version actually imports `from sie_x.core.engine import SemanticIntelligenceEngine` — Bacowr's version imports `from models import (JobSpec, Preflight, ...)` locally. |
| `core/extractors.py` | — | no | 238 | — | — | NOT COPIED | No match in Bacowr |
| `core/multilang.py` | — | no | — | — | — | NOT COPIED | No match in Bacowr |
| `core/resilience.py` | — | no | — | — | — | NOT COPIED | No match in Bacowr |
| `core/simple_engine.py` | — | no | — | — | — | NOT COPIED | No match in Bacowr |
| `core/streaming.py` | — | no | — | — | — | NOT COPIED | No match in Bacowr |
| `api/server.py` | — | no | — | — | — | NOT COPIED | No match in Bacowr |
| `transformers/seo_transformer.py` | — | no | — | — | — | NOT COPIED | No match in Bacowr |
| *(all other SIE-X files)* | — | no | — | — | — | NOT COPIED | 59 remaining SIE-X files have no basename or near-name match in Bacowr |
| — | `article_validator.py` | n/a | — | 406 | — | BACOWR-ORIGINAL | No SIE-X equivalent. Implements 11 QA checks (word count, anchor position, forbidden phrases, SERP entities). Pure Bacowr logic. |
| — | `smoke_test.py` | n/a | — | 106 | — | BACOWR-ORIGINAL | Startup integrity check. Imports from `pipeline`, `engine`, `models` locally. |

---

## Direct-import list

Files in Bacowr that still import from sie_x (not copies):

**None.** Zero files in Bacowr-v6.3 contain `from sie_x`, `import sie_x`, or `sie_x.` references.

The only trace is a comment in `pipeline.py` line 5:
```
- v4_siex_batch/batch_runner.py (batch orchestration)
```
This references a now-deleted intermediate version (`v4_siex_batch`), not SIE-X master.

---

## Compositions

New Bacowr files that combine SIE-X-named pieces into new workflows:

### `pipeline.py` — primary composition hub
Imports from both local `models.py` and relies on `engine.py` for domain classes:
```python
from models import (
    JobSpec, Preflight, PublisherProfile, TargetFingerprint,
    SemanticBridge, BridgeSuggestion, SourceVerificationResult,
    VerifiedSource, SemanticDistance, BridgeConfidence, RiskLevel,
    GoogleIntelligence, IntentType, BRIDGE_CONCEPTS
)
```
Also references `SentenceTransformer` (same dep as SIE-X) but loaded independently.

### `engine.py` — secondary composition
Imports `BRIDGE_PATTERNS` from local `models.py`:
```python
from models import BRIDGE_PATTERNS as _SHARED_BRIDGE_PATTERNS
```
`models.py` serves as a shared data layer between `engine.py` and `pipeline.py` — functioning as a local "mini-master" that both consume.

---

## Implications

### Consolidation hotspots (most drift)
1. **`engine.py`** — largest absolute drift (3830 changed lines). The name collision is misleading: SIE-X `engine.py` is a semantic NLP engine; Bacowr `engine.py` is an article intelligence orchestrator. Different problem, different architecture, different dependencies.
2. **`pipeline.py`** — 1367 changed lines. SIE-X's version was a Kafka real-time pipeline; Bacowr's is a CSV batch runner. The pipeline abstraction was reused in name only.
3. **`models.py`** — 706 changed lines. Smallest absolute drift but also zero structural overlap. Both define core domain objects but for entirely different domains (keyword extraction vs SEO article job specs).

### Pattern observations
- **Bacowr never forks auth, cache, monitoring, or API** — none of SIE-X's infrastructure layer was copied. Only the three highest-level "conceptual" filenames were reused.
- **Bacowr always forks the core** — `engine`, `models`, `pipeline` are the three files Bacowr appropriated names from. These happen to be the three SIE-X files with the most "generic" names.
- **The copy happened early** — `pipeline.py`'s header explicitly traces lineage through `v3-round2`, `v4_siex_batch`, and earlier versions, suggesting the split occurred multiple major versions ago.
- **No shared class names** across any of the three matched files. This is beyond drift — the problem domains diverged completely.
- **`models.py` is Bacowr's internal coupling point** — both `engine.py` and `pipeline.py` import from it, making it the true integration seam of Bacowr's local architecture.
- **SIE-X's own `streaming/pipeline.py` still imports `from sie_x.core.engine`**, meaning that SIE-X file was never cleanly extracted — its copy in Bacowr became independent precisely because the import couldn't travel with it.

### Consumer vs Fork verdict

**FORK.**

Bacowr-v6.3 is a fully autonomous application. It shares three filenames with SIE-X but zero live code connections, zero class reuse, and zero import dependencies on the master. The name overlap is archaeological — a naming convention inherited from an earlier extraction that has since been completely rewritten. Bacowr operates its own data models, its own orchestration logic, and its own domain semantics (SEO article generation vs semantic keyword extraction). Reuniting these would require a ground-up redesign, not a merge.
