# Action Plan: RepoBrain

> **Generated:** 2026-04-13
> **Source:** Repo Rescue — DIAGNOSE phase output

---

## Quick Wins (< 30 minutes each)

Apply in the order listed — upstream dependencies first.

| # | Action | File / Location | Effort | Verification |
|---|--------|-----------------|--------|--------------|
| 1 | Flag credentials in `src/.env` for rotation — real production secrets present (Postgres, Redis, OpenAI, Anthropic, GitHub OAuth); file is gitignored but credentials are live | `src/.env` | 10 min | Confirm with secret owner that all 5 credentials are rotated |
| 2 | Fix double `src` path in `migration-check.yml` — change `src/src/lib/db/schema*.ts` to `src/lib/db/schema*.ts` | `.github/workflows/migration-check.yml` | 5 min | Path grep returns no `src/src` in workflow file |
| 3 | Add `DEFAULT_LLM_PROVIDER=openai` to `.env.example` — present in production template and used in source but missing from dev template | `src/.env.example` | 5 min | grep finds `DEFAULT_LLM_PROVIDER` in `.env.example` |
| 4 | Add `dist/` to `.gitignore` — pattern missing, flagged by gitignore audit | `src/.gitignore` | 5 min | `check-gitignore.sh` passes |
| 5 | Create `LICENSE` file with MIT text — README says "TODO: add file" | `/LICENSE` | 5 min | `ls LICENSE` returns file |
| 6 | Fix hardcoded absolute path `D:/aktiva-projekt/mix/repobrain` in `build-team.ts` — use `import.meta.url` instead | `build-team.ts:19` | 10 min | Script runs without path errors from any directory |

---

## Day 1 Sprint

Do not start Week 1 items until all Day 1 items are resolved or explicitly deferred.

| # | Action | File / Location | Effort | Blocked by | Verification |
|---|--------|-----------------|--------|------------|--------------|
| 1 | Run `npm audit fix` to patch auto-fixable vulnerabilities — 8 high (incl. Next.js DoS CVE GHSA-q4gf-8mx6-v5v3) and 5 moderate | `src/package.json`, `src/package-lock.json` | 30 min | — | `npm audit` reports 0 high vulnerabilities |
| 2 | Migrate `next lint` to `eslint` CLI — `next lint` deprecated, will be removed in Next.js 16; update `package.json` script and CI | `src/package.json`, `.github/workflows/ci.yml` | 15 min | — | `npm run lint` runs without deprecation warning |

---

## Week 1 Roadmap

These items improve stability, security posture, or developer experience.
Each requires planning; do not start without a clear owner.

| # | Action | Category | Effort | Owner | Notes |
|---|--------|----------|--------|-------|-------|
| 1 | Add test suite — `npm test` currently exits with error; no test runner configured; entire codebase has zero test coverage | Testing | 2–3 days | Dev | Start with unit tests for `modules/retrieval` (pure read-only, easiest to isolate); use Vitest (compatible with Next.js 15) |
| 2 | Add CHANGELOG — no version history document exists | Documentation | 2h | Dev | Use Keep-a-Changelog format; retroactively document the 10 existing commits |
| 3 | Investigate and fix remaining npm vulns that require `--force` (mermaid/langium/chevrotain chain) | Security | 4h | Dev | Run `npm audit` after Day 1 fix to see what remains; may require mermaid major upgrade |

---

## Totals

| Tier | Count | Est. Total Effort |
|------|-------|-------------------|
| Quick Wins | 6 | ~40 min |
| Day 1 | 2 | ~45 min |
| Week 1 | 3 | ~3–4 days |
| **All tiers** | **11** | **~3–4 days** |
