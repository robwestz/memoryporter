# base.py + loader.py — Design Rationale

## base.py

### What it is
A minimal Python ABC (`BaseTransformer`) defining the four-method contract all
future transformers must satisfy.

### Design decisions

**Minimal surface area.** Four methods only: `inject`, `get_domain`,
`transform_extraction`, `get_explanation_hooks`. No utility helpers, no scoring
logic, no config parsing. Those belong in concrete implementations or a
shared utilities module. The base is a contract skeleton, not a base class with
behaviour.

**`inject()` is concrete, not abstract.** Engine attachment is mechanical and
identical for every transformer. Making it concrete means subclasses get it for
free and authors can't accidentally break the `self.engine` reference by
forgetting to call `super()`. The docstring warns that overriders must call
`super().inject(engine)`.

**Return `self` from `inject()`.** Allows `MyTransformer().inject(engine)` one-
liner. The loader uses this pattern internally.

**`get_explanation_hooks()` is optional with a safe default.** Phase 3 will
call these hooks for XAI. Returning an empty dict by default means existing
transformers don't need to be updated when the XAI layer lands; they simply
produce no explanations until an author opts in.

**`TYPE_CHECKING` guard on engine import.** `SemanticIntelligenceEngine` is a
heavy import (torch, faiss, spaCy at module load). Using `TYPE_CHECKING` keeps
the transformer layer importable without triggering full engine initialisation.
At runtime `engine` is typed as a plain `object`; the type hint is only
resolved by static analysis tools.

**Keyword type is `core.models.Keyword` (Pydantic).** The engine's extraction
pipeline returns Pydantic `Keyword` objects. Using the same type in the base
ensures transformer authors see the correct field set (text, score, type,
count, confidence, positions, metadata) and can rely on `.score` being mutable.

---

## loader.py

### What it changed from
The old loader hard-coded imports of 5 concrete transformers at the top of the
file. Removing any of those files (R1 archiving all 5) would immediately cause
an `ImportError` on any `from transformers.loader import TransformerLoader`
call, crashing the entire module regardless of whether those transformers were
actually used.

Additionally:
- `create_hybrid_system` accessed `self.engine._original_extract` on line 59
  with no guard — `_original_extract` does not exist on `SemanticIntelligenceEngine`,
  causing `AttributeError` on the first line of the method.
- `transform_extraction` was called as `t_instance.transform_extraction(original_extract)`
  (passing a function, not a keyword list) — wrong signature.
- `_combine_insights` and `_find_cross_domain_connections` were called but never
  defined anywhere in the class.

### New design decisions

**Class-level registry.** `TransformerLoader._registry` is a class attribute,
not per-instance. This means transformers registered at import time (e.g. in
a plugin's `__init__.py`) are immediately available to any loader instance
without re-registration. The registry can be inspected and mutated via
`register()`, `unregister()`, `list_registered()`.

**IdentityTransformer sentinel.** When `load("seo")` is called and no `"seo"` is
registered, the loader returns an `IdentityTransformer` (pass-through) and logs
a warning rather than raising. This matches the requirement: "if no transformers
are registered, returns safe empty-behaviour rather than crashing." Callers can
check `isinstance(t, IdentityTransformer)` if they need to detect the fallback.

**HybridTransformer is a proper BaseTransformer.** The old hybrid was an ad-hoc
async closure patched onto `engine.extract_async`. The new `HybridTransformer`
is a first-class transformer subclass that chains `transform_extraction` calls
sequentially. This means it can itself be registered, passed to XAI hooks, and
inspected via `get_domain()` / `get_explanation_hooks()`.

**HybridTransformer handles per-member exceptions.** If one transformer in the
chain raises during `transform_extraction`, the error is logged and execution
continues with the unmodified keyword list. This prevents one bad transformer
from breaking the hybrid for all domains.

**`create_hybrid_system` safe on empty input.** Empty list → empty
`HybridTransformer` → identity behaviour. No crash.

**No async in the loader.** The old loader's hybrid was async only because it
wrapped `engine._original_extract`. The new loader is sync — `transform_extraction`
is sync by design. If async transformation is needed in future, it belongs in
the concrete transformer's async variant method, not in the loader.

### Runnable state
The new `loader.py` imports cleanly against the new `base.py`. No concrete
transformer imports remain. Python syntax is valid. The module will not
`ImportError` due to missing concrete files. Runtime correctness depends on
`sie_x.core.models.Keyword` and `sie_x.core.engine.SemanticIntelligenceEngine`
being importable — both exist and are unchanged.
