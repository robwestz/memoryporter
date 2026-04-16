# Elevation pool — SIE-X post-rescue

Candidates for Phase 3 elevation challenges.
Source: R3 depth-verification + Phase 2 completion.

## ELEVATE-NOW (proven depth, ready for challenge immediately)

| Module | Suggested pairing | Challenge name | Commercial angle | Fix needed first |
|--------|-------------------|---------------|-----------------|------------------|
| `explainability/xai.py` (784 LOC) | + `multilingual/engine.py` | Cross-Lingual Attribution Engine | EU AI Act explainability + multilingual content agencies | multilingual needs build-out (4 langs → 100+) |
| `audit/lineage.py` | + `api/routes.py` | Compliance Audit Trail | GDPR/CCPA/HIPAA for regulated industries | 1 SQLAlchemy async bug |
| `testing/ab_framework.py` | + `api/routes.py` | Embedded A/B Platform | Replace LaunchDarkly/Statsig for ML config | 1 missing logger (2-line fix) |
| `monitoring/observability.py` + `monitoring/metrics.py` | + `core/engine.py` | Production Telemetry | SRE teams (Prometheus-compatible) | Deduplicate counter names |

## ELEVATE-LATER (needs work before challenge)

| Module | Issue | Estimated fix |
|--------|-------|---------------|
| `automl/*` | Not fully depth-verified; likely [WORKING-ISOLATED] | Need spot-check run |
| `chunking/chunker.py` | Verified real (inverse-frequency density scoring); could pair with xai for "explainable chunking" | No fix needed, just a pairing idea |
| `cache/redis_cache.py` (635 LOC) | Already LIVE in production (via middleware); not really "pool" | Reclassify as KEEP-AS-IS |

## ARCHIVED (preservation-bias exceptions)

| Module | Reason | Salvageable? |
|--------|--------|--------------|
| `agents/autonomous.py` | 789 LOC of silent failure + Ray dependency; validation closures extracted to `health/validators.py` | Extracted: 3 validators now standalone |
| `federated/learning.py` | PySyft 0.2.x (removed 2021); PRESERVED with TODO for Flower/OpenFL rewrite | Future elevation: + multilingual + xai → privacy-preserving cross-lingual |

## Challenge queue

| Priority | Challenge | Status |
|----------|-----------|--------|
| **1** | xai + multilingual → Cross-Lingual Attribution | NEXT (Phase 3A) |
| **2** | audit/lineage + routes → Compliance Audit Trail | Queued |
| **3** | testing/ab + routes → Embedded A/B | Queued |
| **4** | monitoring → Production Telemetry | Queued |
| **5** | chunking + xai → Explainable Chunking | Idea stage |
