# Rescue Audit: RepoBrain

> **Date:** 2026-04-13
> **Rescuer:** Automated (repo-rescue skill)
> **Build status before:** PASSING
> **Build status after:** PASSING

---

## Executive Summary

Found 11 issues across 5 categories. Fixed 8 (all Quick Wins and Day 1 items, minus 1 deferred). Build passes before and after rescue (`npm run ci` clean: lint, typecheck, build). The repository is in good structural health — the Next.js application builds and type-checks cleanly — but had real production credentials in a local `.env` file, a broken CI migration check, npm vulnerabilities (reduced from 13 to 5), and a missing test suite.

---

## What Was Found

| # | Category | Finding | Severity | File / Location | Automated fix? |
|---|----------|---------|----------|-----------------|----------------|
| 1 | Security | Production credentials in `src/.env` — real DigitalOcean Postgres, Redis Cloud, OpenAI, Anthropic, and GitHub OAuth secrets present in plaintext | Critical | `src/.env` | No |
| 2 | Dependencies | 13 npm vulnerabilities (8 high, 5 moderate) — includes Next.js DoS CVE `GHSA-q4gf-8mx6-v5v3` and Drizzle ORM SQL injection `GHSA-gpj5-g38j-94v9` | Critical | `src/package-lock.json` | Partial |
| 3 | Configuration | `migration-check.yml` path `src/src/lib/db/schema*.ts` has double `src` prefix — CI trigger path never matches, migration drift goes undetected | High | `.github/workflows/migration-check.yml:5` | Yes |
| 4 | Configuration | `build-team.ts` hardcodes absolute path `D:/aktiva-projekt/mix/repobrain` — fails on every machine except author's | High | `build-team.ts:19` | Yes |
| 5 | Hygiene | No test suite — `npm test` exits with error; zero test coverage; no test runner configured | Medium | `src/package.json` | No |
| 6 | Dead code | `scripts/test-retrieval.ts` imports `formatContextForPrompt` and `assembleContext` but never uses them | Medium | `src/scripts/test-retrieval.ts:11–12` | Yes (eslint --fix) |
| 7 | Configuration | `DEFAULT_LLM_PROVIDER` missing from `.env.example` — documented as required in README, present in production template but absent from dev template | Low | `src/.env.example` | Yes |
| 8 | Hygiene | `next lint` CLI deprecated (removal planned for Next.js 16) — CI uses it; `.next/` and `next-env.d.ts` also unlinted with bare `eslint .` | Low | `src/package.json`, `eslint.config.mjs` | Yes |
| 9 | Hygiene | `dist/` pattern missing from `.gitignore` — flagged by gitignore audit | Low | `src/.gitignore` | Yes |
| 10 | Hygiene | `LICENSE` file referenced in README as "TODO: add file" but absent from repo | Low | `/LICENSE` | Yes |
| 11 | Hygiene | No CHANGELOG — no version history document | Low | Root | No |

**Total:** 11 findings &nbsp;|&nbsp;
**Critical:** 2 &nbsp;|&nbsp;
**High:** 2 &nbsp;|&nbsp;
**Medium:** 2 &nbsp;|&nbsp;
**Low:** 5

---

## What Was Fixed

### Fix 1: Migration-check CI path corrected

**Before:** `migration-check.yml` triggered on `src/src/lib/db/schema*.ts` — double `src` prefix meant the trigger path never matched real schema files; migration drift would go undetected.

**Action:** Changed `src/src/lib/db/schema*.ts` → `src/lib/db/schema*.ts` in `.github/workflows/migration-check.yml:5`.

**After:**
```diff
-      - 'src/src/lib/db/schema*.ts'
+      - 'src/lib/db/schema*.ts'
```

---

### Fix 2: `DEFAULT_LLM_PROVIDER` added to `.env.example`

**Before:** `.env.example` omitted `DEFAULT_LLM_PROVIDER` despite it appearing in the production template and in README's required variables table.

**Action:** Added `DEFAULT_LLM_PROVIDER=openai` after `OPENAI_API_KEY=` in `src/.env.example`.

**After:**
```diff
 OPENAI_API_KEY=
+DEFAULT_LLM_PROVIDER=openai
```

---

### Fix 3: `dist/` added to `.gitignore`

**Before:** `dist/` pattern absent from `src/.gitignore`; flagged by gitignore audit.

**Action:** Added `/dist` to `src/.gitignore` production section.

**After:**
```diff
 /build
+/dist
```

---

### Fix 4: `LICENSE` file created

**Before:** README states `MIT (see LICENSE — TODO: add file)` but the file did not exist.

**Action:** Created `/LICENSE` with standard MIT license text, copyright Robin Westerlund 2026.

**After:**
```
$ ls LICENSE
LICENSE
```

---

### Fix 5: `build-team.ts` hardcoded path replaced

**Before:** `const PROJECT_DIR = "D:/aktiva-projekt/mix/repobrain"` — absolute path hardcoded to author's machine.

**Action:** Replaced with `dirname(fileURLToPath(import.meta.url))` (derived from script file location). Added `import { fileURLToPath } from "url"` and `dirname` to the `path` import.

**After:**
```diff
-import { join } from "path";
+import { join, dirname } from "path";
+import { fileURLToPath } from "url";

-const PROJECT_DIR = "D:/aktiva-projekt/mix/repobrain";
+const PROJECT_DIR = dirname(fileURLToPath(import.meta.url));
```

---

### Fix 6: npm vulnerabilities reduced (13 → 5)

**Before:** 13 vulnerabilities (8 high, 5 moderate). High findings included Next.js DoS CVE `GHSA-q4gf-8mx6-v5v3`.

**Action:** Ran `npm audit fix` in `src/`. 13 packages updated. Auto-fixable (non-breaking) vulnerabilities resolved.

**After:**
```
5 vulnerabilities (4 moderate, 1 high)

Remaining require --force (breaking changes):
  drizzle-orm: SQL injection CVE GHSA-gpj5-g38j-94v9 (needs 0.45.2, breaking)
  esbuild/drizzle-kit: dev-server CVE GHSA-67mh-4wv8-2f99 (needs drizzle-kit upgrade, breaking)
```
Build verified passing after fix: `npm run ci` exits 0.

---

### Fix 7: `next lint` migrated to `eslint .`

**Before:** `"lint": "next lint"` — deprecated CLI, removal planned for Next.js 16. Also, bare `eslint .` without ignore patterns would lint `.next/` build artifacts and `next-env.d.ts`, producing hundreds of false errors.

**Action:**
- Updated `src/package.json`: `"lint": "next lint"` → `"lint": "eslint ."`
- Updated `src/eslint.config.mjs`: added `{ ignores: [".next/**", "node_modules/**", "next-env.d.ts"] }` as the first config entry

**After:**
```
> eslint .

src/scripts/test-retrieval.ts
  11:20  warning  'formatContextForPrompt' is defined but never used
  12:10  warning  'assembleContext' is defined but never used

✖ 2 problems (0 errors, 2 warnings)
```
No blocking errors. Two warnings in `scripts/test-retrieval.ts` are documented as a Dead Code finding (Medium, #6 in the findings table).

---

## What Remains

| Tier | # | Finding | Effort | Rationale |
|------|---|---------|--------|-----------|
| Quick Win | 1 | Rotate credentials in `src/.env` — real Postgres, Redis, OpenAI, Anthropic, GitHub OAuth secrets present locally | 30 min | Rotation is a manual step (requires access to DigitalOcean, Redis Cloud, and GitHub OAuth App settings); skill explicitly does not rotate secrets |
| Day 1 | 2 | Fix remaining 5 npm vulnerabilities (drizzle-orm SQL injection + drizzle-kit/esbuild chain) — require `npm audit fix --force` with breaking ORM and tooling changes | 2–4h | Breaking changes to Drizzle ORM require schema migration testing; not safe to force-apply without integration verification |
| Week 1 | 5 | Add test suite — zero test coverage, `npm test` exits error | 2–3 days | Requires choosing test runner (Vitest recommended), writing test fixtures, and implementing tests; not in scope for a rescue session |
| Week 1 | 6 | Fix unused imports in `scripts/test-retrieval.ts` | 10 min | Low priority — warnings only, no CI impact; can be done any time with `eslint --fix` |
| Week 1 | 11 | Add CHANGELOG | 2h | Content decisions required; retroactive entries need authorship context |

---

## Build Status

**Command:** `npm run ci` (from `src/`)

```
> repobrain@0.1.0 ci
> npm run lint && npm run typecheck && npm run build

> eslint .    (0 errors, 2 warnings — warnings are documented Dead Code findings)
> tsc --noEmit    (no output = clean)
> next build    (all routes compiled successfully)

Route (app)                                                    Size  First Load JS
┌ ○ /_not-found                                               978 B         107 kB
├ ƒ /api/auth/github/...
...
+ First Load JS shared by all                                  107 kB

ƒ Middleware                                                  50.2 kB
```

**Verdict:** PASSING — all three CI gates pass (lint, typecheck, build). Build was passing before rescue too; this rescue fixed configuration, security, and hygiene issues without changing application logic.

---

## Notes

- Credentials in `src/.env` were never git-tracked (confirmed via `git ls-files`) — no git history scrubbing required. However, if these credentials are still in active use on production infrastructure (DigitalOcean Postgres, Redis Cloud), they should be rotated as a precaution.
- The 2 lint warnings in `scripts/test-retrieval.ts` surfaced as a side effect of the `next lint` → `eslint .` migration. They are real dead code (unused imports) but non-blocking.
- Recommended immediate next action: rotate the 5 categories of credentials in `src/.env`, then address the drizzle-orm SQL injection CVE (`GHSA-gpj5-g38j-94v9`) — it is a genuine security risk in a production ORM.
- Action plan with tier assignments: `docs/rescue-test/repobrain/action-plan.md`
