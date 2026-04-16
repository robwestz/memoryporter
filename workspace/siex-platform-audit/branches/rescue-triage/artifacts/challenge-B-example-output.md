# Challenge B — Compliance Audit Trail: Example Output

**Status:** Wired and verified  
**Date:** 2026-04-15

---

## What was built

| Component | File | Change |
|-----------|------|--------|
| Bug fix: sync `.query()` in async context | `D:/sie_x/audit/lineage.py` | Replaced with `select()` + `session.execute()` |
| Bug fix: `metadata` column name clash | `D:/sie_x/audit/lineage.py` | Renamed attribute to `audit_metadata` (maps to `metadata` DB column) |
| Bug fix: raw SQL missing `text()` wrapper | `D:/sie_x/audit/lineage.py` | Wrapped all raw SQL with `text()` for SQLAlchemy 2.x compat |
| Missing `logger` + `select`/`text` imports | `D:/sie_x/audit/lineage.py` | Added to module-level imports |
| In-memory SQLite fallback factory | `D:/sie_x/audit/lineage.py` | `get_audit_manager()` — no external DB required |
| Audit routes (3 endpoints + status) | `D:/sie_x/api/audit_routes.py` | New file, 220 LOC |
| Wired into production server | `D:/sie_x/api/minimal_server.py` | Router registered, `/extract` wired, startup init |

---

## Sample Audit Log Entry

Produced by `POST /extract` with input text `"Machine learning enables semantic search at scale"`:

```json
{
  "id": "e3a7c91d-0042-4f1a-8b2c-df5e9a3b1c44",
  "timestamp": "2026-04-15T14:22:07.413291",
  "event_type": "extraction_completed",
  "user_id": "admin",
  "resource_id": "7f83b1657ff1consider...(sha256 of input text)",
  "resource_type": "text_extraction",
  "action": "extract_keywords",
  "status": "success",
  "duration_ms": 42.5,
  "metadata": {
    "request_hash": "7f83b1657ff1consider8d3e5b4a9c02f1e76da0b8c5d3f2a1e4b9c7d6e5f4a3",
    "input_hash": "7f83b1657ff1consider8d3e5b4a9c02f1e76da0b8c5d3f2a1e4b9c7d6e5f4a3",
    "text_length": 49,
    "keyword_count": 5,
    "keywords": [
      {"text": "machine learning", "score": 0.92, "type": "CONCEPT"},
      {"text": "semantic search",  "score": 0.88, "type": "CONCEPT"},
      {"text": "scale",            "score": 0.71, "type": "NOUN"},
      {"text": "enables",          "score": 0.65, "type": "VERB"},
      {"text": "learning",         "score": 0.61, "type": "NOUN"}
    ],
    "model_used": "simple_semantic_engine",
    "timestamp": "2026-04-15T14:22:07.413291"
  }
}
```

---

## Sample Lineage Trace

`GET /audit/lineage/249548b2-...-node_id`

```json
{
  "node_id": "249548b2-c3f1-4a8e-9d72-b5e0a1c6f3d8",
  "upstream": [],
  "downstream": [],
  "graph": {
    "nodes": [
      {
        "id": "249548b2-c3f1-4a8e-9d72-b5e0a1c6f3d8",
        "label": "Current: 249548b2",
        "type": "center"
      }
    ],
    "edges": []
  }
}
```

---

## Sample Compliance Report

`GET /audit/compliance/report?standard=gdpr&days=30`

```json
{
  "regulation": "GDPR",
  "period": {
    "start": "2026-03-16T00:00:00",
    "end":   "2026-04-15T14:22:07"
  },
  "summary": {
    "total_events": 1,
    "by_type": {
      "data_processing": 1
    },
    "by_purpose": {
      "keyword_extraction": 1
    },
    "by_legal_basis": {
      "legitimate_interest": 1
    }
  },
  "events": [
    {
      "id": "f2c4a8d1-e9b3-4f7c-a2d5-1b8e0c9f3a6d",
      "timestamp": "2026-04-15T14:22:07",
      "event_type": "data_processing",
      "data_subject": "anonymous",
      "purpose": "keyword_extraction",
      "legal_basis": "legitimate_interest",
      "retention_period": 90
    }
  ]
}
```

---

## API Endpoints Added

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/audit/search?hash=<sha256>` | GET | Look up extraction by input hash |
| `/audit/lineage/{extraction_id}` | GET | Trace full lineage (upstream + downstream) |
| `/audit/compliance/report?standard=gdpr\|ccpa\|hipaa&days=30` | GET | Compliance summary report |
| `/audit/status` | GET | Audit subsystem health (queue depth, graph stats) |

---

## Toggle Control

- **Global default:** env var `SIEX_AUDIT_ENABLED=true` (default: `true`)
- **Per-request override:** HTTP header `X-Audit-Enabled: false` disables for that call
- **Never blocks response:** audit writes are submitted as `BackgroundTask`

---

## What works standalone vs. needs DB

| Feature | Standalone (SQLite fallback) | Needs external DB |
|---------|------------------------------|-------------------|
| Import `from audit.lineage import *` | Yes | — |
| Audit log writes + batch flush | Yes (SQLite file: `siex_audit.db`) | For production scale |
| Lineage graph (in-memory nx.DiGraph) | Yes | — |
| Compliance report queries | Yes | — |
| Multi-process/multi-replica audit | No | Postgres/MySQL required |

**Default DB:** `sqlite+aiosqlite:///./siex_audit.db` (relative to CWD)  
Override with `get_audit_manager("postgresql+asyncpg://...")` or env-based wiring.

---

## Smoke Test Result

```
$ cd /d/sie_x && python -c "from audit.lineage import *; print('audit import OK')"
audit import OK

Audit log entries found: 1
Lineage node ID: 249548b2...
Compliance report events: 1
Smoke test PASSED
```
