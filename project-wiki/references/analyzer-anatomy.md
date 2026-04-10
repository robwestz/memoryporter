# Analyzer Anatomy

> **When to read this:** when you're adding a new analyzer or debugging an existing one.

## Interface contract

Every analyzer is a Python module in `scripts/analyzers/<name>.py` that exports a single function:

```python
from pathlib import Path

def run(repo_root: Path) -> dict:
    """Walk the repo and return a JSON-serializable dict."""
```

Constraints:

- **Pure stdlib only** — no `pip install`. Use `os`, `pathlib`, `re`, `subprocess`, `json`. Anything more exotic is forbidden.
- **JSON-serializable output** — no `Path` objects, no `set`s, no `datetime`s without isoformat.
- **Failure-tolerant** — if something goes wrong, return an empty/sentinel dict, don't crash. The wiki must still render.
- **Don't double-walk** — call `walker.walk(repo_root)` to iterate files, don't write your own filesystem traversal.
- **Read-only** — never write inside `repo_root`.

## Naming conventions

- Module file: `analyzers/<snake_case>.py`
- Function: `run`
- Output dict key (in `generate.py:gather_data()`): same as the module name
- Imports: relative — `from walker import walk` and `from analyzers.languages import EXT_TO_LANG`

## Wiring it in

Add to `scripts/generate.py`:

```python
from analyzers import (
    repo_stats, languages, structure, dependencies,
    git_log, readme, changelog, symbols, file_index,
    your_new_analyzer,  # ← add here
)

def gather_data(repo_root: Path) -> dict:
    return {
        # ... existing ...
        "your_new_analyzer": your_new_analyzer.run(repo_root),
    }
```

That's all the wiring needed. The wiki picks up the new key automatically — write a corresponding page (`js/pages/<name>.js`) if you want to render it visually, or use it in an existing page.

## Testing in isolation

Each analyzer can be smoke-tested standalone:

```bash
python -c "
import sys
sys.path.insert(0, 'project-wiki/scripts')
from pathlib import Path
from analyzers import your_new_analyzer
import json
print(json.dumps(your_new_analyzer.run(Path('.')), indent=2)[:500])
"
```

## Failure modes to handle

| Scenario | What to return |
|----------|---------------|
| Tool not installed (e.g. `git`) | `{"available": False, ...empty_data}` |
| File can't be opened | skip that file, continue with the rest |
| External command times out | return what you have so far |
| Repo has 0 of the thing you're looking for | empty list / dict, not None |

## Reference: the simplest analyzer (`readme.py`)

```python
from pathlib import Path

CANDIDATES = ["README.md", "readme.md", "README"]

def run(repo_root: Path) -> dict:
    for name in CANDIDATES:
        p = repo_root / name
        if p.is_file():
            try:
                return {"found": True, "raw": p.read_text(encoding="utf-8", errors="ignore")}
            except OSError:
                continue
    return {"found": False, "raw": ""}
```

35 lines, single responsibility, gracefully degrades. That's the bar.
