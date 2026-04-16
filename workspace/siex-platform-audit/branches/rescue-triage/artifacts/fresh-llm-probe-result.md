# Fresh-LLM Probe Result

## Onboarding time
~4 minutes. SKILL.md is ~410 lines and loaded two parallel reads (SKILL.md + capability-map). The transformer section is on one page with a copy-paste-ready example. I felt oriented before finishing the read.

## What I proposed
**ReadabilityTransformer** — a domain transformer that re-ranks extracted keywords by plain-language accessibility.

Use case: content teams writing for general audiences (consumer health, public-sector comms, plain-language marketing) need keywords real readers will understand, not just high-relevance technical jargon. The transformer scores each keyword on four axes (character length sweet-spot, average syllables per word, jargon pattern detection, word count) then blends the readability score with the original extraction score at a configurable weight.

This is distinct from all existing capabilities (SEO, medical, legal, financial, creative) — it targets audience accessibility rather than domain classification.

## What I built
- `D:/sie_x/transformers/readability_transformer.py` — the transformer (stdlib only, no new deps)
- `D:/sie_x/tests/test_readability_transformer.py` — 21 tests covering unit + integration + loader

## Import verification
PASS

```
python -c "import sys; sys.path.insert(0,'D:/'); from sie_x.transformers.readability_transformer import ReadabilityTransformer; print(ReadabilityTransformer())"
# ReadabilityTransformer(domain='readability', weight=0.5, top_k=None, min_readability=0.0, engine=unattached)
```

Note: `D:/` (the parent of the `sie_x/` package directory) must be on `sys.path`. This is a packaging artifact — the package lives at `D:/sie_x/` so `import sie_x` requires its parent.

## Test result
21 passed, 0 failed.

```
  PASS  test_syllable_single
  PASS  test_syllable_multi
  PASS  test_syllable_empty
  PASS  test_readability_plain_word
  PASS  test_readability_acronym_lower
  PASS  test_readability_long_jargon
  PASS  test_readability_slash_compound
  PASS  test_readability_bounds
  PASS  test_get_domain
  PASS  test_transform_empty
  PASS  test_transform_preserves_metadata
  PASS  test_transform_scores_in_range
  PASS  test_transform_reranks_readable_higher
  PASS  test_min_readability_filter
  PASS  test_top_k
  PASS  test_weight_zero_identity
  PASS  test_weight_one_pure_readability
  PASS  test_explanation_hooks
  PASS  test_invalid_weight
  PASS  test_loader_registration
  PASS  test_loader_load_without_engine
```

Behavioral verification: with `readability_weight=0.9`, "language tool" (score=0.60) outranks "NLP/ML-pipeline" (score=0.95) because the jargon keyword scores ~0.32 on readability vs ~0.78 for the plain phrase.

## Where SKILL.md helped

**Transformer system section** was the primary value. It gave:
- The exact ABC contract: `get_domain()` + `transform_extraction()` are mandatory; `get_explanation_hooks()` is optional
- The registration call: `TransformerLoader.register("domain", MyClass)` + `loader.load("domain")`
- The `inject()` pattern and that `engine` may be None until inject is called
- The anti-pattern list (which modules to avoid importing) — saved time by eliminating dead ends

**Capability table at the top** made it obvious what *not* to build (SEO, medical, legal, financial, creative, cross-lingual, audit, A/B, telemetry all accounted for).

**Dependencies table** confirmed I could use stdlib only — no new package installs needed.

## Where SKILL.md was insufficient

**Import path was undocumented.** SKILL.md shows `from sie_x.transformers.loader import TransformerLoader` but never states that `D:/` (not `D:/sie_x/`) is the correct `sys.path` root. This caused one import failure. Resolution required reading the directory structure to find `D:/sie_x/__init__.py` and inferring the parent-path convention.

**Keyword model fields were not in SKILL.md.** The example only shows `kw.text` and `kw.score`. To implement the transformer correctly (preserve metadata, use `model_copy`/`copy`, handle Pydantic v1/v2) I had to read `core/models.py`. A one-line field listing in SKILL.md would have prevented this.

**No mention of `loader.py`'s registry being class-level** (shared across instances). This is in the loader docstring, not SKILL.md. It matters because one registration suffices for all loader instances — a subtle but important design detail for production use.

## Verdict

PARTIAL: I could propose and build a working adapter from SKILL.md alone, but needed to read two source files (`core/models.py` for Keyword fields, `transformers/loader.py` for class-level registry behaviour) and had to infer the sys.path root from directory inspection. The transformer section of SKILL.md is genuinely good — it got me 80% of the way without any source reading.
