# Test Fix Log — core/test_core.py

**Date:** 2026-04-15
**File fixed:** `D:/sie_x/core/test_core.py`
**Engine code changed:** No

---

## Before / After

| State | Passed | Failed | Total |
|-------|--------|--------|-------|
| Before | 27 | 5 | 32 |
| After | 32 | 0 | 32 |

---

## Root Cause

Three compounding problems in `TestSimpleEngineWithMocks`:

### 1. Wrong mock target path
The `@patch` decorators used `sie_x.core.simple_engine.SentenceTransformer` and `sie_x.core.simple_engine.spacy.load`. When pytest runs from `D:/sie_x/`, the parent directory is added to `sys.path` so `sie_x` is the package root. `unittest.mock.patch` resolves dotted names by traversing module attributes, but `sie_x.core.__init__.py` does not re-export `simple_engine`, so `getattr(core_module, 'simple_engine')` raised `AttributeError`.

### 2. Missing `sys.modules` stubs for uninstalled heavy deps
`simple_engine.py` has `import spacy`, `from sentence_transformers import SentenceTransformer`, and `import networkx` at module level. These packages are not installed in the environment. Without pre-seeding `sys.modules`, any `import sie_x.core.simple_engine` call inside the test methods would raise `ModuleNotFoundError`, regardless of `@patch` decorators (which apply after import).

### 3. Hollow `networkx` stub
The initial stub used `Mock()` for `nx.Graph` and `nx.pagerank`. The engine's `_rank_keywords` calls `nx.pagerank(graph)` to get per-node scores, then uses them as `confidence` values filtered against `min_confidence=0.3`. With `pagerank` returning `{}`, all keywords got `confidence=0.0` and were filtered out, causing `test_extract_returns_keywords` to receive an empty list.

---

## Fix Applied

All changes in `test_core.py` only.

**Added at module level (after imports):**

```python
def _make_stub_modules():
    """Inject minimal stubs for spacy, sentence_transformers, networkx."""
    # spacy stub with no-op load
    # sentence_transformers stub with MockSentenceTransformer placeholder
    # networkx stub with a real _FakeGraph class and a correct _fake_pagerank
    #   that returns uniform scores (1/n per node) so confidence passes the 0.3 threshold
```

**Replaced `@patch` decorator approach with `_make_engine()` helper:**

The 5 test methods were refactored to call `self._make_engine()`, which:
1. Imports `sie_x.core.simple_engine` (succeeds because stubs are pre-seeded)
2. Calls `importlib.reload()` to rebind module-level names against current `sys.modules`
3. Directly assigns `_mod.SentenceTransformer = MockSentenceTransformer` and `_mod.load_spacy_model = MockSpacy`
4. Instantiates and returns `SimpleSemanticEngine()`

The `_FakeGraph` stub correctly implements `add_node`, `add_edge`, `number_of_nodes`, and `number_of_edges` so the full `extract → _generate_candidates → _build_graph → _rank_keywords` pipeline runs to completion.
