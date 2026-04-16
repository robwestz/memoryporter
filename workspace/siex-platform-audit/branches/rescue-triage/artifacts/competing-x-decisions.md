# Competing-X resolutions

---

## Pair 1: servers — `api/minimal_server.py` vs `api/server.py`

| File | LOC | Endpoints | Importers | Last modified | Decision |
|---|---|---|---|---|---|
| `api/minimal_server.py` | 883 | 14 (/, /token, /knowledge/maps-routing-pack, /knowledge/maps-routing-pack/page, /extract, /extract/batch, /extract/stream, /extract/multilang, /languages, /health, /models, /stats, +middleware, +startup/shutdown) | 3 files (api/routes.py x3 imports, examples/backlink_workflow.py) | 2026-01-23 | **KEEP** |
| `api/server.py` | 130 | 5 (/extract, /extract/batch, /extract/stream, /analyze/multi, /health) | 0 files (no external importers found) | 2026-01-23 | **PROPOSED ARCHIVE** (see rationale) |

**Rationale:** `minimal_server.py` is the production server. It has 883 LOC vs 130, implements full auth (JWT + API key), Prometheus metrics, rate limiting, streaming SSE, multilingual endpoint, maps-routing knowledge pack endpoints, Pydantic response models, and proper startup/shutdown lifecycle. It is wired by `api/routes.py` (3 import sites) and `examples/backlink_workflow.py`. `api/server.py` wraps the heavy `SemanticIntelligenceEngine` (GPU-required), has no importers, no auth, no metrics, and is a thinner prototype superseded by `minimal_server.py`. The name "minimal" is misleading — it is the production-complete server; `server.py` is the prototype. **PROPOSED ACTION:** archive `api/server.py` to `.archive/2026-04-15-removed/api/server.py`. No wiring changes needed.

---

## Pair 2: multilingual — `core/multilang.py` vs `multilingual/engine.py`

| File | LOC | Role | Status | Decision |
|---|---|---|---|---|
| `core/multilang.py` | 560 | FastText + pattern hybrid language detector; 11 spaCy models; powers `/extract/multilang` in production server | PRODUCTION — wired to `api/minimal_server.py` | **KEEP, rename to `core/language_detector.py`** (PROPOSED) |
| `multilingual/engine.py` | 175 | LaBSE/XLM-RoBERTa embedder + 4-language stub + "# Add 96 more..." scaffold; Phase 3 Challenge A target | [SCAFFOLD] — wired to nothing currently | **KEEP as-is, do not archive** |

**Rationale:** These serve different purposes and are both needed. `core/multilang.py` is the working 11-language FastText-based detector used by the production server today. `multilingual/engine.py` is the scaffold for the Phase 3 100-language LaBSE-backed engine — it intentionally has 4 entries and the "Add 96 more" comment. Archiving either would break current production or destroy the Phase 3 target. The confusion is purely naming: both use "multilang" and "engine" loosely. **PROPOSED ACTION (no archive):** rename `core/multilang.py` → `core/language_detector.py` and update the single import site in `api/minimal_server.py` (`from sie_x.core.multilang import MultiLangEngine` → `from sie_x.core.language_detector import MultiLangEngine`). Leave `multilingual/engine.py` untouched — its scaffold state is accepted, and Phase 3 will fill it out.

> **DO NOT archive `multilingual/engine.py`.** Its scaffold state is the Phase 3 starting point.

---

## Pair 3: auth — `api/auth.py` vs `auth/enterprise.py`

| File | LOC | Mechanism | Wired to | Decision |
|---|---|---|---|---|
| `api/auth.py` | 196 | JWT (HS256) + bcrypt password hashing + API key header; dual-scheme dependency (token OR api-key) | `api/minimal_server.py` (6 imports: Token, User, create_access_token, get_current_active_user, verify_password, FAKE_USERS_DB, ACCESS_TOKEN_EXPIRE_MINUTES) | **KEEP** |
| `auth/enterprise.py` | 348 | OIDC/SAML/LDAP + Redis token store (authlib, python3-saml, ldap3) | Nothing — zero importers found | **PROPOSED ARCHIVE** |

**Rationale:** `api/auth.py` is the active auth layer. It is imported in 7 places from `api/minimal_server.py`, provides the `get_current_active_user` FastAPI dependency used on all protected endpoints, and has a `FAKE_USERS_DB` placeholder explicitly noted for Phase 4 replacement. `auth/enterprise.py` implements OIDC/SAML/LDAP and is architecturally appropriate for a future enterprise tier, but it is **wired to nothing** — zero importers, and its `get_current_user` dependency calls an undefined `get_token_manager` function (line 319), making it unrunnable as-is. It also requires `authlib`, `python3-saml`, `ldap3`, and `redis.asyncio` — none of which are in the current dependency set. Archiving it removes a false signal without losing anything operational. **PROPOSED ACTION:** archive `auth/enterprise.py` to `.archive/2026-04-15-removed/auth/enterprise.py`. When enterprise auth is needed (Phase 4+), restore from archive or rewrite against the real user store.

---

## Summary of actions taken

| Item | Status | Path |
|---|---|---|
| `transformers/base.py` created | **EXECUTED** | `D:/sie_x/transformers/base.py` |
| `transformers/loader.py` rewritten | **EXECUTED** | `D:/sie_x/transformers/loader.py` |
| Original loader preserved | **EXECUTED** | `D:/sie_x/.archive/2026-04-15-removed/transformers/loader.py.original` |
| Pair 1 — archive `api/server.py` | **PROPOSED** (awaiting Robin review) | Would go to `D:/sie_x/.archive/2026-04-15-removed/api/server.py` |
| Pair 2 — rename `core/multilang.py` → `core/language_detector.py` | **PROPOSED** (awaiting Robin review) | Update 1 import in `api/minimal_server.py` |
| Pair 2 — `multilingual/engine.py` | **NO ACTION** (scaffold accepted) | `D:/sie_x/multilingual/engine.py` stays |
| Pair 3 — archive `auth/enterprise.py` | **PROPOSED** (awaiting Robin review) | Would go to `D:/sie_x/.archive/2026-04-15-removed/auth/enterprise.py` |
