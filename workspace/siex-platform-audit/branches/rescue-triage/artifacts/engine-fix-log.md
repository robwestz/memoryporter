# engine-fix-log — SIE-X `_cross_document_ranking` silent crash

**Date:** 2026-04-15
**File:** `D:/sie_x/core/engine.py`
**Bug:** `AttributeError` on any `extract_async(texts)` call with `len(texts) > 1`

---

## Root Cause

`_cross_document_ranking` (line 603) called two methods that did not exist on
`SemanticIntelligenceEngine`:
- `_build_doc_keyword_matrix(keywords)`
- `_calculate_tfidf(doc_keyword_matrix)`

The crash was silent because the batch path is only triggered when 2+ documents
are passed; single-document extractions worked fine.

---

## Fix — Two Methods Added

### `_build_doc_keyword_matrix(self, doc_keywords: list) -> np.ndarray`

Accepts the flat merged `List[Keyword]` produced by the batch loop in
`extract_async`. Deduplicates keywords by lowercased text. If the keywords carry
`context_windows`, each window is treated as a pseudo-document row; otherwise
falls back to a single-row matrix using `keyword.count` as the frequency.
Returns a float64 matrix of shape `(n_docs, n_terms)` with a `_keyword_index`
side-channel attribute (`dict[int, Keyword]`) so the TF-IDF step can map columns
back to `Keyword` objects.

### `_calculate_tfidf(self, matrix: np.ndarray) -> Dict[Keyword, float]`

Consumes the matrix from `_build_doc_keyword_matrix` (reads `_keyword_index`).
Computes TF (row-normalised frequencies) and IDF using the sklearn smooth
variant `log((1+n_docs)/(1+df)) + 1`. Multiplies to get TF-IDF, averages across
pseudo-documents per term, normalises to [0, 1], and returns
`Dict[Keyword, float]` — which is exactly what the loop
`for keyword, tfidf in tfidf_scores.items()` in `_cross_document_ranking` expects.

---

## Test Results

### Regression suite

```
cd /d/sie_x && python -m pytest core/test_core.py -v --tb=short
32 passed, 6 warnings in 4.64s
```

All 32 tests pass. No regressions.

### Smoke test (AST parse — spacy/faiss not installed in this env)

```python
import ast
tree = ast.parse(open('D:/sie_x/core/engine.py').read())
methods = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
print('_build_doc_keyword_matrix' in methods, '_calculate_tfidf' in methods)
# True True
```

Both methods confirmed present on the class.

---

## LOC Budget

| Method | LOC |
|---|---|
| `_build_doc_keyword_matrix` | 28 |
| `_calculate_tfidf` | 25 |

Both within the 30-LOC limit.
