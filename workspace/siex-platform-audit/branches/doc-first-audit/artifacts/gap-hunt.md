# SIE-X Gap Hunt — Platform Audit
**Date:** 2026-04-15
**Scope:** `D:/sie_x/` + `FULL_SYSTEM_ARCHITECTURE.txt` v2.1.0
**Method:** Read-only grep + file reads. No writes to target.

---

## TASK A: Locate the "5 probe" Subsystem

### Verdict: NOT LOCATABLE AS A NAMED SUBSYSTEM — but identified as BACOWR Preflight (Section 5) + a broken call chain in `loader.py`

The word "probe" appears **zero times** in any Python, Markdown, or text file in `D:/sie_x/`. There is no class, function, file, or directory named anything close to `probe`, `5_probe`, `five_probe`, `PipelineProbe`, etc.

**Most likely interpretation of Robin's "5 probe-delen":**

There are two strong candidates — and both have real missing parts:

---

### Candidate 1 (Primary): BACOWR Preflight Section 5 — `integrations/bacowr_adapter.py`

The BACOWR spec (`BACOWR_System_Specification.md`) has a structured **Section 5: PREFLIGHT RESEARCH** with 6 sub-probes (5.1 Publisher-analys, 5.2 Target-analys, 5.3 Semantic Intersect, 5.4 Risk Assessment, 5.5 SERP Top-3 Analys, 5.6 Context Booster Selection).

In Swedish product vocabulary, "5 probe-delen" likely refers to this 5-part preflight probe flow. The adapter at `/d/sie_x/integrations/bacowr_adapter.py` covers points 1, 2, 4 of the BACOWR pipeline doc (PageProfiler, IntentAnalyzer, generation_constraints), but:

- **Point 5: Writer** — listed in the adapter docstring, has NO corresponding `enhance_writer()` method. The closest is `generate_bacowr_extensions()` but it does not generate or modify article content.
- **5.5 SERP Top-3** — `_generate_serp_research_extension()` exists but is a thin wrapper. There is no real SERP fetching or actual top-3 analysis — it's a format spec, not a crawler.
- **5.6 Context Booster Selection** — no `select_context_boosters()` method exists anywhere in the codebase.
- **Semantic Intersect (5.3)** — implemented partially in `seo_transformer.py` but the BACOWR spec's "Semantic Triangulator" fallback (trigger when strength < 0.3) is missing.

**Files:**
- `/d/sie_x/integrations/bacowr_adapter.py` (846 LOC) — integration hub, missing Writer enhancement and booster selection
- `/d/sie_x/transformers/seo_transformer.py` (712 LOC) — Semantic Triangulator absent
- `/d/sie_x/BACOWR_System_Specification.md` — defines the full 6-sub-probe spec

---

### Candidate 2 (Secondary): `transformers/loader.py` — Broken Hybrid System (3 missing methods)

`loader.py` is only 83 lines total. `create_hybrid_system()` calls three things that do not exist anywhere in the file or the package:

1. `self.engine._original_extract` — referenced on line 59, but neither `SemanticIntelligenceEngine` nor `SimpleSemanticEngine` defines `_original_extract`. This will crash at runtime.
2. `self._combine_insights(results)` — called on line 76, **never defined** anywhere in `loader.py`.
3. `self._find_cross_domain_connections(results)` — called on line 77, **never defined** anywhere in `loader.py`.

Additionally, `loader.py` calls `transformer.inject(self.engine)` on all transformers, but `SEOTransformer` has **no `inject()` method** (while LegalTransformer, MedicalTransformer, FinancialTransformer, CreativeTransformer all do). So any hybrid system including `seo` will raise `AttributeError`.

This means the multi-transformer "hybrid system" pathway — which is the core of the platform composition story — is **completely non-functional**.

**File:** `/d/sie_x/transformers/loader.py`

---

### Top 5 Candidate Files if Robin Means Something Else

| Rank | File | Why |
|------|------|-----|
| 1 | `/d/sie_x/integrations/bacowr_adapter.py` | BACOWR Section 5 integration points; several missing |
| 2 | `/d/sie_x/transformers/loader.py` | Core hybrid pipeline, 3 methods called but undefined |
| 3 | `/d/sie_x/transformers/seo_transformer.py` | Missing `inject()`, missing Semantic Triangulator |
| 4 | `/d/sie_x/systems/seo-bridges.md` | The 5-6 stage pipeline definition driving the runner |
| 5 | `/d/sie_x/runner.py` | SystemRunner pipeline has stages that silently skip when engine lacks injected methods |

---

## TASK B: Verify 8 Remaining Known Issues

### Issue #1 — Two competing servers
**Claim:** Both `api/minimal_server.py` AND `api/server.py` present.
**Status: [STILL OPEN]**
- `/d/sie_x/api/minimal_server.py` — present, 875 LOC, 14 endpoints, confirmed main server
- `/d/sie_x/api/server.py` — present, alternative using `SemanticIntelligenceEngine`
- No import or deprecation notice cross-referencing them. No wrapper or shared entrypoint.
- Evidence: `ls /d/sie_x/api/` returns both files with no bridge.

---

### Issue #2 — Two competing multilingual systems
**Claim:** Both `core/multilang.py` AND `multilingual/engine.py` present; don't cross-reference.
**Status: [STILL OPEN]**
- `/d/sie_x/core/multilang.py` — `MultiLangEngine`, 11 languages, FastText auto-detect
- `/d/sie_x/multilingual/engine.py` — `MultilingualEngine`, 100+ languages, LaBSE + XLM-RoBERTa
- `api/minimal_server.py` imports **only** `core/multilang.py` (line 27: `from sie_x.core.multilang import MultiLangEngine`)
- No file in the codebase imports from `multilingual/engine.py`. It is defined but unreferenced in any production path.
- Additional: `multilingual/engine.py` line 17 uses `sys.path.insert(0, ...)` — a code smell suggesting it was developed in isolation.
- No factory function bridging the two. Issue fully open.

---

### Issue #3 — Two competing auth systems
**Claim:** Both `api/auth.py` AND `auth/enterprise.py` present; no bridge.
**Status: [STILL OPEN]**
- `/d/sie_x/api/auth.py` — basic JWT + mock user DB (hardcoded `FAKE_USERS_DB`)
- `/d/sie_x/auth/enterprise.py` — `EnterpriseAuthManager` (OIDC/SAML/LDAP), `TokenManager`
- Grep confirms zero files import `EnterpriseAuthManager` outside of `auth/enterprise.py` itself.
- `minimal_server.py` and `middleware.py` import exclusively from `api/auth.py`.
- No delegation, no dev/prod mode flag, no bridge. Issue fully open.

---

### Issue #8 — No real database
**Claim:** Mock dicts for auth, mock keyword search, audit models without session factory.
**Status: [STILL OPEN — PARTIAL for audit only]**
- `api/auth.py` line 67: `FAKE_USERS_DB = { ... }` — hardcoded mock. No change.
- `api/auth.py` line 86: mock API keys dict. No change.
- `api/routes.py` lines 197–214: `/keywords/search` returns hardcoded mock data with note "Phase 1: Mock data. Real search coming in Phase 2."
- `audit/lineage.py`: Has `create_async_engine(database_url)` — takes URL as constructor param, creates real SQLAlchemy session factory. **This part is more complete than the arch doc implied.** However: no Alembic migrations, no `DATABASE_URL` env var wired anywhere, and `AuditManager` is never instantiated in any server. The models are real but the wiring is absent.
- No `.env` file, no `DATABASE_URL` in any config.
- **Verdict:** Auth and keyword search: fully mocked. Audit: models + session factory exist, but no migrations and never wired in. Still OPEN overall.

---

### Issue #9 — No config management
**Claim:** Hardcoded defaults, no unified config, no .env, no Pydantic Settings.
**Status: [STILL OPEN]**
- No `config.py`, no `settings.py`, no `.env` file found anywhere in the tree.
- `api/auth.py` line 24: `SECRET_KEY = os.getenv("SIE_X_SECRET_KEY", "dev_secret_key_change_in_production")` — only one env var hookup found in entire codebase.
- Every other module (cache TTLs, rate limits, Kafka broker URLs, Redis URLs, spaCy model names, embedding model names) uses hardcoded defaults. No central place to override.
- The arch doc's proposed `SIEXConfig` class does not exist yet.

---

### Issue #10 — No test suite
**Claim:** Only `core/test_core.py` exists.
**Status: [STILL OPEN]**
- Confirmed: only `/d/sie_x/core/test_core.py` found. No other `test_*.py` or `*_test.py` files.
- No `pytest.ini`, no `pyproject.toml`, no `setup.cfg`, no `conftest.py`.
- No `tests/` directory.
- No API integration tests, no transformer tests, no runner tests.

---

### Issue #11 — No CLI
**Claim:** `interfaces.md` mentions CLI but it was never built.
**Status: [PARTIALLY FIXED — runner.py has argparse CLI]**
- `/d/sie_x/runner.py` lines 618–663: Full `argparse`-based CLI with `run`, `list`, `stages` subcommands.
- `python runner.py run seo-bridges --input data.csv` is a working entrypoint.
- **However:** This is not a package-level CLI. There is no `__main__.py`, no `console_scripts` entry point in any `pyproject.toml` or `setup.py`, and it only covers the `SystemRunner` pipeline — not `siex extract`, `siex serve`, `siex analyze-url` etc. as the arch doc envisions for U-08.
- The `core/interfaces.md`-referenced CLI is still unbuilt. Runner CLI is a different, narrower thing.
- **Verdict:** [PARTIAL] — runner CLI exists, general-purpose `siex` CLI does not.

---

### Issue #12 — No container/deploy story
**Claim:** No Dockerfile, no docker-compose, no K8s manifests.
**Status: [STILL OPEN]**
- No `Dockerfile`, no `docker-compose.yml`, no `k8s/`, no `helm/` found anywhere in the tree.
- `project_packager.py` references them conceptually but they are not in the actual file tree.
- No GitHub Actions workflow files found.
- Fully open.

---

### Summary Table

| # | Issue | Status |
|---|-------|--------|
| 1 | Two competing servers | STILL OPEN |
| 2 | Two competing multilingual | STILL OPEN |
| 3 | Two competing auth | STILL OPEN |
| 8 | No real DB | STILL OPEN (audit models exist but unwired) |
| 9 | No config mgmt | STILL OPEN |
| 10 | No test suite | STILL OPEN |
| 11 | No CLI | PARTIAL (runner.py argparse CLI exists; package CLI does not) |
| 12 | No container/deploy | STILL OPEN |

**Score: 7 still open, 1 partial, 0 fixed since arch doc.**

---

## TASK C: Gamechanger Missing Core Files

### `transformers/base.py`
- **Expected capability:** Abstract base class (`ABC`) defining the required interface for all domain transformers — `inject(engine)`, `transform_extraction(original_func)`, and metadata properties like `name`, `version`, `supported_modes`.
- **What it would unlock:** Currently `loader.py` calls `transformer.inject(self.engine)` but `SEOTransformer` has no such method, causing a silent `AttributeError` that only surfaces at runtime. A base class enforces the contract at class definition time. It would also make `create_hybrid_system` safe to call with any transformer, and enable type-checked transformer discovery.
- **Priority:** GAMECHANGER
- **Complexity to build:** Small — ~80 LOC of ABC definition + docstrings
- **Evidence this gap is real:**
  - `/d/sie_x/transformers/loader.py` line 41: `transformer.inject(self.engine)` — called on all transformers including SEOTransformer
  - `/d/sie_x/transformers/seo_transformer.py`: `def inject` — does not exist anywhere in file (712 LOC)
  - LegalTransformer has `inject` at line 126, MedicalTransformer at 134, Financial at 152, Creative at 184 — all different signatures. No shared contract forces uniformity.

---

### `core/config.py`
- **Expected capability:** `SIEXConfig(BaseSettings)` with `env_prefix="SIEX_"` and `.env` file support — single source of truth for engine mode, embedding model, cache TTL, Redis URL, API auth secret, rate limits, database URL, spaCy model names.
- **What it would unlock:** Issues #8, #9, and #12 all block on the same root cause: there's no `DATABASE_URL` env var and no way to inject it without editing source files. With `SIEXConfig`, `AuditManager` could pull its URL from config, `api/auth.py` could stop hardcoding `SECRET_KEY`, and a Dockerfile could inject settings via environment. This is the dependency root for U-01 through U-09 per the arch doc's own upgrade graph.
- **Priority:** GAMECHANGER
- **Complexity to build:** Small — ~60 LOC of Pydantic Settings + field definitions
- **Evidence this gap is real:**
  - `/d/sie_x/api/auth.py` line 24: `SECRET_KEY = os.getenv("SIE_X_SECRET_KEY", "dev_secret_key_change_in_production")` — only env hookup in entire codebase
  - `/d/sie_x/audit/lineage.py` line 136: `def __init__(self, database_url: str, ...)` — accepts URL but never called from any wired path; caller would need config to know the value
  - Arch doc section U-01 confirms: "Every module has its own defaults... Single source of truth missing"

---

### `transformers/registry.py` (or `core/contracts.py` — equivalent)
- **Expected capability:** Runtime-queryable registry of all available transformers, their capabilities (which engine methods they inject), their required engine version, and their compatibility matrix (which transformers can co-exist in hybrid mode). Separate from the dict in `loader.py`.
- **What it would unlock:** Currently the `available_transformers` dict in `loader.py` is a hardcoded mapping with no metadata. A `TransformerRegistry` would let the `SystemRunner` validate stage requirements before running (e.g., "stage `differential_diagnosis` requires `medical` transformer loaded"), enable the platform's "compose into any combination" promise, and power a `siex list-transformers` CLI command. This is the contract layer that separates "I have a transformer" from "this transformer does these things."
- **Priority:** GAMECHANGER
- **Complexity to build:** Medium — ~150 LOC including capability declarations for all 5 existing transformers
- **Evidence this gap is real:**
  - `/d/sie_x/runner.py` lines 326–337: `differential_diagnosis` stage checks `hasattr(ctx.engine, "diagnose")` at runtime — no pre-flight validation possible
  - `/d/sie_x/transformers/loader.py` lines 59–81: `create_hybrid_system()` calls `self.engine._original_extract` which doesn't exist — a registry would expose this incompatibility before execution
  - `/d/sie_x/runner.py` line 543: unknown stages silently SKIP with a warning, rather than failing fast with a clear "transformer X not loaded" error

---

### `integrations/bacowr_writer_bridge.py` (bonus — 4th gamechanger)
- **Expected capability:** Implements BACOWR pipeline integration point #5 (Writer enhancement) and #5.6 (Context Booster Selection) — the two integration points listed in `bacowr_adapter.py`'s docstring but missing from its implementation.
- **What it would unlock:** The full BACOWR preflight cycle from intake to writer-constraints is currently broken at the last step before article generation. `generate_smart_constraints()` produces content briefs, but there is no method to (a) select authoritative context boosters per BACOWR section 5.6 rules, or (b) inject the final brief into a writer-compatible format. Without this, SIE-X powers the research but cannot close the loop to the writer.
- **Priority:** GAMECHANGER (for the BACOWR use case specifically)
- **Complexity to build:** Medium — ~200 LOC, depends on `seo_transformer.generate_content_brief()` which does exist
- **Evidence this gap is real:**
  - `/d/sie_x/integrations/bacowr_adapter.py` lines 7–13: Lists 6 integration points; point #5 "Writer" has no corresponding `enhance_writer()` or `inject_to_writer()` method anywhere in the file
  - `/d/sie_x/BACOWR_System_Specification.md` section 5.6: Full spec for context booster selection rules (never-same-as-SERP-top-3, no competitors, no affiliate sites) — none of these rules are encoded anywhere in the adapter
  - `/d/sie_x/transformers/seo_transformer.py` line 706: `# This might not exist yet` — inline comment admitting semantic_themes gap

---

## Cross-cutting Observation

The arch doc describes SIE-X as a platform where "core + specialisering + LLM" compose into solutions. The actual code has the ingredients but the **composition glue is broken**:

1. `loader.py` — the composition engine — calls 3 undefined methods and triggers AttributeError on `SEOTransformer`
2. `runner.py` — the pipeline orchestrator — silently skips stages rather than failing with actionable errors
3. `multilingual/engine.py` — 100+ language capability — is wired to nothing
4. `auth/enterprise.py` — enterprise-grade auth — is wired to nothing

The system is not just incomplete; several of its highest-capability components are currently isolated islands that cannot be reached via any production code path.
