# Security Fix Log — SIE-X
Date: 2026-04-15

## Issue 1: Hardcoded SECRET_KEY

**File changed:** `D:/sie_x/core/config.py`

- Added `environment: str = "development"` field with `_validate_environment` validator (allowed: development / staging / production).
- Added `secret_key: str = ""` field.
- Added `_apply_security_defaults()` function called from `get_config()` singleton:
  - Development + empty key → auto-generates `secrets.token_hex(32)`, emits WARNING log.
  - Non-development + empty key → raises `ValueError` immediately at startup.
- Added `import secrets` at top of file.
- Updated `_load_from_env()` fallback to include both new fields with safe defaults.

**File changed:** `D:/sie_x/api/auth.py`

- Removed `SECRET_KEY = os.getenv("SIE_X_SECRET_KEY", "dev_secret_key_change_in_production")`.
- Added `_get_secret_key()` function that reads from `get_config().secret_key` at call time.
- Replaced bare `SECRET_KEY` references in `create_access_token()` and `get_current_user()` with `_get_secret_key()`.

## Issue 2: FAKE_USERS_DB with admin/admin

**File changed:** `D:/sie_x/api/auth.py`

- Kept `FAKE_USERS_DB` intact for local development convenience.
- Added `_DEFAULT_USERNAMES` frozenset to track default credential set.
- Added `check_fake_users_db_safety()` function: no-op in development; emits `logger.critical(...)` in staging/production if default usernames are still present.
- Added explanatory comment: "DEV ONLY — Replace with real user store in Phase 4".

## Issue 3: Wildcard CORS

**File changed:** `D:/sie_x/core/config.py`

- Changed `api_cors_origins: List[str]` default from `["*"]` to `[]`.
- In `_apply_security_defaults()`:
  - Development + empty list → auto-sets `["http://localhost:3000", "http://localhost:8000"]`, emits INFO log.
  - Non-development + empty list → emits WARNING log (empty = all cross-origin requests blocked; operator must set `SIEX_API_CORS_ORIGINS` explicitly).
- Updated `_load_from_env()` fallback default from `["*"]` to `[]`.

**File changed:** `D:/sie_x/.env.example`

- Added `SIEX_ENVIRONMENT` and `SIEX_SECRET_KEY` sections with documentation.
- Updated `SIEX_API_CORS_ORIGINS` comment: explained dev auto-default vs production explicit requirement.

---

## Verification Results

### Test suite
```
32 passed, 6 warnings in 0.58s   (core/test_core.py)
```
Zero regressions.

### Dev defaults
```
env=development, cors=['http://localhost:3000', 'http://localhost:8000'], secret_set=True
```
Auto-generated key, localhost CORS, no friction.

### Production without SIEX_SECRET_KEY
```
ValueError: SIEX_SECRET_KEY must be set explicitly in 'production' environment.
```
Hard fail at startup. Deployment cannot silently proceed with empty key.

---

## Dev vs Prod Behavior Summary

| Concern | Development | Staging / Production |
|---------|-------------|----------------------|
| SECRET_KEY | Auto-generated, WARNING log | ValueError at startup if empty |
| CORS | Auto: localhost:3000+8000 | WARNING if empty; must set explicitly |
| FAKE_USERS_DB | Silently allowed | CRITICAL log at startup via `check_fake_users_db_safety()` |
