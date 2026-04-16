# SIE-X Deploy Build Log
**Date:** 2026-04-15
**Task:** CLI entry point + containerization

---

## Files Created

| File | Lines | Purpose |
|---|---|---|
| `D:/sie_x/cli.py` | 440 | Click-based CLI with 7 commands |
| `D:/sie_x/__main__.py` | 9 | `python -m sie_x` entry point |
| `D:/sie_x/requirements.txt` | 42 | Core deps only (API, audit, auth, A/B, CLI) |
| `D:/sie_x/requirements-ml.txt` | 55 | Optional ML deps (spacy, sentence-transformers, torch, etc.) |
| `D:/sie_x/Dockerfile` | 66 | Multi-stage build (builder + runtime) |
| `D:/sie_x/docker-compose.yml` | 60 | siex-api + Redis with health checks |

---

## CLI Verification Results

```
python cli.py --help        -> OK (7 commands shown)
python cli.py version       -> OK: SIE-X v2.0.0 (engine_mode=BALANCED, port=8000)
python cli.py health        -> OK: 3/3 validators PASS (mock engine, no spacy needed)
python cli.py status        -> OK: config, dep status, API server probe
python cli.py config        -> OK: all settings with secret masking
python cli.py extract "..." -> Expected FAIL: clear "install spacy" message, exit 1
```

---

## Commands Without ML Deps

These work with zero ML dependencies:
- `siex version`
- `siex health` (uses mock engine internally)
- `siex status` (dep checks + config probe)
- `siex config [--show-secrets]`
- `siex serve` (starts uvicorn — requires fastapi/uvicorn in requirements.txt)

These require spacy + sentence-transformers:
- `siex extract TEXT` — hard dependency; clear install instructions given on failure
- `siex pipeline TEXT` — same

---

## Requirements Split

### requirements.txt (core — 14 packages)
fastapi, uvicorn, pydantic, pydantic-settings, python-jose, passlib, httpx,
sqlalchemy[asyncio], aiosqlite, scipy, numpy, backoff, circuitbreaker,
slowapi, beautifulsoup4, click, structlog

### requirements-ml.txt (optional ML)
spacy, sentence-transformers, torch, faiss-cpu, transformers, networkx,
scikit-learn, shap, lime, psutil, plotly, prometheus_client,
opentelemetry-sdk, opentelemetry-exporter-otlp-proto-grpc, redis[asyncio],
aiomcache, optuna, kafka-python

---

## Dockerfile Approach

- **Multi-stage build**: `builder` stage installs all deps; `runtime` stage is lean
- Base: `python:3.11-slim`
- System deps: `build-essential` + `libstdc++6` (required for spaCy, numpy)
- spaCy model `en_core_web_sm` downloaded during build
- `PYTHONPATH=/app` so `import sie_x` resolves correctly
- SQLite audit DB volume-mounted at `/data/siex_audit.db`
- HEALTHCHECK polls `/health` endpoint every 30s

---

## Docker Compose

- `siex-api` service: build from Dockerfile, env_file `.env`, volume `siex_data:/data`
- `redis:7-alpine`: with `appendonly yes`, 256mb maxmemory, allkeys-lru eviction
- Both services have healthchecks; `siex-api` depends_on redis healthy
- Volumes: `siex_data` (SQLite persistence), `redis_data` (Redis AOF)

---

## Known Constraints

- `cli.py` is 440 lines (spec said ~250; the extra lines are complete error handling,
  the ASCII table renderer, and full option declarations — functionality not gold-plating)
- `SimpleSemanticEngine` requires spacy at import time (hardcoded `import spacy` at top
  of `core/simple_engine.py`) — CLI cannot lazy-import around this; exit-with-message is
  the correct behavior
- Docker build will fail if spaCy model download fails (no network); add `--network=host`
  or pre-bake the model layer if building offline
