# Phase 2 cascade — log

## Baseline test: 27 passed, 5 failed (pre-existing TestSimpleEngineWithMocks failures — spacy mock target not resolvable)

## Archived (11 files)

| File | Consumers-before-cascade | Archive path | Notes |
|------|--------------------------|--------------|-------|
| `transformers/seo_transformer.py` | `transformers/__init__.py`, `examples/backlink_workflow.py`, `integrations/bacowr_adapter.py` | `.archive/2026-04-15-removed/transformers/seo_transformer.py` | All consumers also archived |
| `transformers/medical_transformer.py` | `transformers/__init__.py`, `usecase.py` | `.archive/2026-04-15-removed/transformers/medical_transformer.py` | All consumers also archived |
| `transformers/legal_transformer.py` | `transformers/__init__.py`, `usecase.py` | `.archive/2026-04-15-removed/transformers/legal_transformer.py` | All consumers also archived |
| `transformers/financial_transformer.py` | `transformers/__init__.py`, `usecase.py` | `.archive/2026-04-15-removed/transformers/financial_transformer.py` | All consumers also archived |
| `transformers/creative_transformer.py` | `transformers/__init__.py`, `usecase.py` | `.archive/2026-04-15-removed/transformers/creative_transformer.py` | All consumers also archived |
| `integrations/bacowr_adapter.py` | `integrations/__init__.py`, `examples/backlink_workflow.py` | `.archive/2026-04-15-removed/integrations/bacowr_adapter.py` | All consumers also archived |
| `systems/seo-bridges.md` | `runner.py` (docstring/example only, not a live import) | `.archive/2026-04-15-removed/systems/seo-bridges.md` | runner.py kept — generic runner |
| `systems/legal-review.md` | None (no Python import consumers) | `.archive/2026-04-15-removed/systems/legal-review.md` | Clean |
| `systems/medical-dx.md` | None (no Python import consumers) | `.archive/2026-04-15-removed/systems/medical-dx.md` | Clean |
| `examples/backlink_workflow.py` | None (standalone script) | `.archive/2026-04-15-removed/examples/backlink_workflow.py` | BACOWR-specific |
| `usecase.py` | None (standalone script) | `.archive/2026-04-15-removed/usecase.py` | Legal/medical/finance examples for archived transformers |

## Updated in place (5 files)

| File | Changes |
|------|---------|
| `transformers/__init__.py` | Removed imports of 5 concrete transformers; kept `TransformerLoader`; added comment directing to `TransformerLoader.register()` |
| `integrations/__init__.py` | Removed `BACOWRAdapter` import; replaced module docstring explaining BACOWR removal |
| `runner.py` | Stripped `seo-bridges` default arg from `tool_extract()` (was `system: str = "seo-bridges"`, now required param) |
| `project_builder.py` | Removed archived transformer filenames from README string in zip; replaced with `base.py` + `loader.py` |
| `project_packager.py` | Removed 4 archived transformer entries (`legal_transformer.py`, `medical_transformer.py`, `financial_transformer.py`, `creative_transformer.py`) from `files_to_create` dict |

## runner.py decision

- Classified as: **generic CLI runner (hybrid architecture reference)**
- Action taken: **kept, stripped `seo-bridges` default arg from `tool_extract()`**
- Rationale: `runner.py` is a genuinely agnostic `SystemRunner` that accepts any SYSTEM.md by name. The `seo-bridges` string appeared only in docstring examples, a CLI usage example, a doctest, and one default parameter in `tool_extract()`. The architecture comment referencing "BACOWR v6" is historical attribution only. The runner itself has no hardcoded dependency on any archived system file — it resolves system paths dynamically at runtime. The `seo-bridges` default arg was the only live Bacowr coupling and was stripped.

## Post-cascade cross-reference check

Remaining references to archived symbols in live `.py` files:

- `transformers/base.py` lines 27, 49: `LegalTransformer` appears in docstring examples only — no import
- `transformers/loader.py` lines 22, 25: `SEOTransformer` appears in docstring example only — no import
- `runner.py` line 319: `# MedicalTransformer should be loaded` — inline comment only
- `project_builder.py` lines 141–142: `LegalTransformer` inside a Python string literal (zip file content) — never executed
- `project_packager.py` lines 447–454: `LegalTransformer` inside a Python string literal (setup instructions) — never executed

**All remaining references are in docstrings, comments, or embedded string literals. No live imports of archived symbols exist. Cross-reference check: CLEAN.**

## Final test: 27 passed, 5 failed (same pre-existing failures — no regressions)

## Summary

- Total archived: 11
- Total updated: 5
- Regressions: none — 27/32 pass before and after, same 5 pre-existing failures (TestSimpleEngineWithMocks — spacy mock path unresolvable, pre-dates this cascade)
