# Worked Example: RepoBrain Rescue

> **Date:** 2026-04-13
> **Repository:** RepoBrain (AI knowledge-base and memory system)
> **Status before:** Build failing, CI broken, secrets in source, multiple stale configs
> **Status after:** Build passing, CI green, all Critical and High findings resolved

This example illustrates the full five-phase repo-rescue workflow on a real codebase.
Details are representative of the actual session; some specifics are generalized to
preserve the illustrative value.

---

## Step 1: DISCOVER

**Architecture brief produced:**

| Field | Value |
|-------|-------|
| Language | Python 3.11 + TypeScript (tooling) |
| Build system | `pip install -e .` + `npm run build` for frontend |
| Entry point | `repobrain/cli.py` |
| CI config | `.github/workflows/ci.yml` — present but referencing undefined secrets |
| Last active | ~4 months prior (most recent commit 2025-12-01) |
| README | Present but describes setup steps from a deprecated virtualenv workflow |

**Key gap identified in DISCOVER:** README references `make setup` which no longer
exists in the Makefile. Deferred to DIAGNOSE findings.

---

## Step 2: DIAGNOSE

**Build command run:** `pip install -e . && python -c "import repobrain"`

**Build output (abbreviated):**
```
Collecting repobrain
  ...
ERROR: Could not find a version that satisfies the requirement torch==1.12.0
ERROR: No matching distribution found for torch==1.12.0
```

**`run-diagnostics.sh` output (abbreviated):**
```
=== Secret Scan ===
[CRITICAL] Pattern: api_key\s*=\s*['"][^'"]{8,}
repobrain/config.py:14: api_key = "sk-prod-xxxxxxxxxxxxxxxxxxxx"

=== Gitignore Audit ===
[WARN] These files are tracked but match .gitignore patterns:
  __pycache__/
  .env

=== Dead Import Scan ===
[WARN] F401: repobrain/indexer.py:3: 'os.path' imported but unused
[WARN] F401: repobrain/indexer.py:7: 'typing.Optional' imported but unused
```

**Findings table:**

| # | Category | Finding | Severity | File | Automated fix? |
|---|----------|---------|----------|------|----------------|
| 1 | Security | Hardcoded API key in source | Critical | `repobrain/config.py:14` | No |
| 2 | Dependencies | `torch==1.12.0` unavailable for Python 3.11 | Critical | `requirements.txt:8` | Partial |
| 3 | Configuration | CI references undefined secret `REPOBRAIN_API_KEY` | High | `.github/workflows/ci.yml:22` | No |
| 4 | Hygiene | `.env` tracked in git (contains real values) | High | `.env` | No |
| 5 | Hygiene | `__pycache__/` tracked in git | Low | `.gitignore` | Yes |
| 6 | Dead code | 2 unused imports in `indexer.py` | Medium | `repobrain/indexer.py` | Yes |
| 7 | Documentation | `make setup` referenced in README but target removed | Low | `README.md` | No |

**Total:** 7 findings | Critical: 2 | High: 2 | Medium: 1 | Low: 2

---

## Step 3: PLAN

**Tier assignment:**

**Quick Wins (< 30 min):**
| # | Action | Effort |
|---|--------|--------|
| QW1 | Move API key from `config.py` to env var; add `REPOBRAIN_API_KEY` to `.env.example` | 10 min |
| QW2 | Remove `.env` from git tracking: `git rm --cached .env`; add to `.gitignore` | 5 min |
| QW3 | Add `__pycache__/` to `.gitignore`; `git rm -r --cached __pycache__/` | 5 min |
| QW4 | Remove 2 dead imports in `indexer.py` with `ruff --fix` | 2 min |

**Day 1:**
| # | Action | Blocked by | Effort |
|---|--------|------------|--------|
| D1 | Upgrade `torch` to `2.1.0` (Python 3.11 compatible); test import | QW1 | 30 min |
| D2 | Add `REPOBRAIN_API_KEY` secret to GitHub repo settings | QW1 | 5 min |
| D3 | Update `README.md`: replace `make setup` with correct `pip install` steps | — | 15 min |

**Week 1:**
| # | Action | Category | Effort |
|---|--------|----------|--------|
| W1 | Audit full `requirements.txt` for Python 3.11 compatibility | Dependencies | 2h |
| W2 | Add `verify` Makefile target: `pip install -e . && pytest` | Hygiene | 30 min |

---

## Step 4: FIX

**Fix-verify loop applied:**

### Fix QW1: Move hardcoded API key to env var

**Before:**
```python
# repobrain/config.py:14
api_key = "sk-prod-xxxxxxxxxxxxxxxxxxxx"
```

**Action:** Replace with `os.environ.get("REPOBRAIN_API_KEY")`. Create `.env.example`:
```
REPOBRAIN_API_KEY=your_key_here
```

**After:** `grep -n "api_key" repobrain/config.py` → `api_key = os.environ.get("REPOBRAIN_API_KEY")`
Build: still failing (torch dep not yet fixed). Expected — QW1 is not build-blocking.

---

### Fix QW2 + QW3: Remove tracked files from git

**Action:**
```bash
echo ".env" >> .gitignore
echo "__pycache__/" >> .gitignore
git rm --cached .env
git rm -r --cached __pycache__/
```

**After:** `git ls-files --ignored --exclude-standard` → no output. Pass.

---

### Fix QW4: Remove dead imports

**Action:** `ruff check --select F401 --fix repobrain/indexer.py`

**After:** `ruff check repobrain/indexer.py` → no findings. Pass.

---

### Fix D1: Upgrade torch

**Action:** In `requirements.txt`, change `torch==1.12.0` → `torch>=2.1.0,<3.0.0`

**After:**
```
Successfully installed torch-2.1.2
...
```
`python -c "import repobrain"` → no output (success). **Build passes.**

---

### Fix D2: Add CI secret

**Action:** Via GitHub UI, added `REPOBRAIN_API_KEY` to repository secrets.

**After:** CI workflow run → green. All steps pass.

---

### Fix D3: Update README

**Action:** Replaced `make setup` section with:
```markdown
## Setup
pip install -e .
cp .env.example .env
# Edit .env with your API key
python -m repobrain --help
```
Added: `> Last verified: 2026-04-13`

---

## Step 5: REPORT

**Audit report summary (as would appear in `RESCUE_REPORT.md`):**

---

### Rescue Audit: RepoBrain

> **Date:** 2026-04-13 | **Build before:** FAILING | **Build after:** PASSING

**Executive Summary:** Found 7 issues across 5 categories. Fixed 6 (all Critical and
High findings resolved; dead imports cleaned; README updated). Build now passes and
CI is green. One Week 1 item remains: a full Python 3.11 compatibility audit of
`requirements.txt` and a `verify` Makefile target.

**Build status:** `pip install -e . && python -c "import repobrain"` → exit 0

**What remains:**
| Tier | Item | Effort |
|------|------|--------|
| Week 1 | Full `requirements.txt` Python 3.11 audit | 2h |
| Week 1 | Add `verify` Makefile target | 30 min |

---

## Key Lessons from This Session

1. **The secret was the first blocker, not the build.** The torch version mismatch
   looked like the root problem but the hardcoded key was a Critical issue that needed
   to be fixed regardless. Security findings always go first.

2. **The CI secret was invisible until DIAGNOSE ran on the workflow file.** The build
   log never mentions it — only a manual read of the CI YAML surfaced it.

3. **Four Quick Wins took < 25 minutes combined.** The 45-minute session estimate for
   repo-rescue held. Day 1 items were the real time cost.

4. **A 4-month-old Python repo needs a full dep audit, not just a torch fix.** The
   Week 1 item is the correct scope for that work — it is not a blocker, and the build
   passes without it.
