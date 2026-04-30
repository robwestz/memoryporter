# Skill vs Manual: repo-rescue Comparison

> **Skill run:** 2026-04-13 (this session)
> **Manual sources:**
>   - `docs/morning-report-2026-04-10.md` — strategic triage, Apr 10 (3 days earlier)
>   - `docs/architecture-audit.md` — production-readiness audit, Apr 13 (same day)
> **Fairest comparison:** architecture-audit (same codebase state, same date)

---

## Side-by-Side Table

| Aspect | Manual (architecture-audit, Apr 13) | Skill output (Apr 13) | Match? |
|--------|-------------------------------------|-----------------------|--------|
| **Build state discovered** | Not re-measured; build fix already applied Apr 10. Morning report found intermittent ENOENT from multi-lockfile detection (2/3 runs passed). | PASSING — correctly observed post-fix state | Partial — skill didn't discover the intermittent failure because it ran after the fix was already in |
| **Critical issues found** | 10 critical/P0-P1 issues including DB SSL bypass, OAuth token in clone URL, unsafe-eval CSP, hardcoded DB fallbacks, console.log pollution, worker error corruption | 2 critical issues: credentials in `.env`, npm vulnerabilities | **No** — large gap |
| **Security depth** | Deep source code reads: found `rejectUnauthorized: false` in db/index.ts, token in clone URL, CSP headers in next.config.ts, rate limiter Redis bypass, unauthenticated LLM endpoint | Surface scan only: found `.env` credentials via scan-secrets.sh, npm CVEs via `npm audit` | **No** — fundamentally different depth |
| **CI/CD findings** | Architecture audit incorrectly stated "no CI/CD pipeline" (it already existed). Morning report didn't address CI. | Correctly found CI existed AND found specific bug: migration-check.yml path `src/src/` double prefix | **Skill better** on this dimension |
| **Fixes proposed** | 10 items across P0/P1/P2 tiers with exact file:line and code diffs for every fix | 11 items across Quick Win/Day 1/Week 1 with diffs for applied fixes | Both complete for what they found; manual fixes are deeper |
| **Fixes that would work** | All proposed fixes are correct and targeted (verified by file:line references) | All 8 applied fixes are correct and verified (build passes) | Both valid |
| **Action plan quality** | Precise: specific files, line numbers, exact code diffs, effort estimates, risk-if-skipped column | Clear tier structure; effort estimates accurate; but scoped to surface issues only | Manual higher specificity; skill better tier discipline |
| **Things manual caught that skill missed** | DB SSL disabled, OAuth token in clone URL, unsafe-eval CSP, localhost DB fallbacks, 37 console.* calls, worker empty-string chunk IDs, rate limiter Redis bypass, no error tracking, no file size limit, unauthenticated LLM endpoint | (all of the above) | **Major gap** — 8 code-level security issues completely missed |
| **Things skill caught that manual missed** | — | migration-check.yml path bug; npm audit (13 CVEs including Next.js DoS); `next lint` deprecation; DEFAULT_LLM_PROVIDER missing from .env.example; dist/ in .gitignore; build-team.ts hardcoded path; LICENSE missing | **Skill better** at surface/hygiene |

---

## Scoring

### DISCOVERY — 7/10

The skill correctly identified the language, build system, entry points, directory structure, CI config, and approximate project state. It caught the dual-package-json structure (root orchestrator vs `src/` app) and the presence of live credentials in `.env`.

**Where it fell short:** It did not detect the intermittent ENOENT build failure documented in the morning report (because that was fixed before the skill ran — timing artifact, not a skill flaw). More importantly: DISCOVER stopped at the file tree and config layer. It did not read source files to build a security mental model. A deeper DISCOVER would have read `src/lib/db/index.ts`, `src/modules/github/clone.ts`, and `src/next.config.ts` — all of which contain the critical issues the architecture audit found.

The skill's DISCOVER instruction says "read README, config files, CI config, directory structure." It doesn't say "read key source files for security patterns." This is the root cause of the diagnostic gap.

---

### DIAGNOSIS completeness — 4/10

The skill's automated scripts (`scan-secrets.sh`, `check-gitignore.sh`, `find-dead-imports.sh`) performed as designed and returned real findings. `npm audit` caught 13 CVEs. The CI path bug was caught by manual inspection.

**Where it fell short:** The DIAGNOSE step ran the diagnostics script and checked npm audit, then moved to PLAN. It did not read the source files listed in the diagnostic checklist's "Security" section. The checklist says "Hardcoded secrets → check `.env` committed" — but does not prompt for checking security patterns *inside* application code (SSL validation, token handling, CSP headers, rate limiter bypass).

The architecture audit found 8 high-severity issues by reading source files for 20+ minutes. The skill's DIAGNOSE as executed spent ~5 minutes on automated checks. This is not a process violation — the skill says to "run the build" and "run run-diagnostics.sh" — but the outcome is a diagnosis that catches surface issues and misses code-level vulnerabilities.

**Root cause of gap:** The diagnostic-checklist.md Security section checks for secrets *in files* (scan-secrets.sh) and *in git history*. It does not instruct the rescuer to audit application code for security anti-patterns (disabled SSL, token leakage patterns, CSP misconfiguration). For a production application, this is the most dangerous category of miss.

---

### PLAN quality — 7/10

Within its scope, the plan is well-structured. The tier assignment followed the skill's rules correctly:
- Credentials → Quick Win (security override applied)
- npm vulnerabilities → Day 1 (unblocks security posture)
- Test suite → Week 1 (architectural effort)
- `--force` npm fixes deferred with correct rationale (breaking changes)

**Where it fell short:** The plan does not know what it doesn't know. Because DIAGNOSE missed the DB SSL issue, the OAuth token leak, and the CSP problem, none of them appear in the plan. A plan that tiers "dist/ missing from .gitignore" as a Quick Win alongside items that will actually block production deployment creates a false sense of completeness.

---

### REPORT usefulness — 6/10

The RESCUE_REPORT.md is well-structured, readable, and uses the template correctly. Applied fixes are documented with diffs and build evidence. "What Remains" has rationale for every deferred item.

**Where it fell short:** A developer reading only the report would believe the repo's remaining issues are: credential rotation, 5 npm CVEs, no tests, and some hygiene. They would not know about the database SSL bypass, the OAuth token embedded in clone URLs, the unsafe-eval CSP, or the worker data corruption — all of which are production blockers discovered by the manual audit. The report is accurate for what it covers, but incomplete as a production-readiness picture.

**One strength:** The report correctly identified credentials as the most urgent action, which aligns with the manual audit's prioritization.

---

## What Each Source Found and Missed

### Manual (architecture-audit) found, skill missed:

| Issue | Severity | Why skill missed it |
|-------|----------|---------------------|
| `rejectUnauthorized: false` in db/index.ts, db/migrate.ts | **Critical** | Requires reading source files |
| OAuth token embedded in clone URL string | **Critical** | Requires reading clone.ts |
| `unsafe-eval` + `unsafe-inline` in CSP headers | **Critical** | Requires reading next.config.ts |
| Hardcoded localhost DB fallbacks in drizzle.config.ts | **High** | Requires reading config files |
| 37 console.* calls instead of structured logger | **High** | Requires reading source files |
| Worker empty-string chunk IDs (data corruption) | **High** | Requires reading ingestion/index.ts |
| Rate limiter silently bypassed when Redis is down | **Medium** | Requires reading rate-limit.ts |
| No file size limit on file serving API | **Medium** | Requires reading API route file |
| Unauthenticated LLM providers endpoint | **Low** | Requires reading API route file |
| No error tracking / Sentry | **Medium** | Requires reading architecture holistically |

### Skill found, manual missed:

| Issue | Severity | Significance |
|-------|----------|-------------|
| migration-check.yml path bug (`src/src/`) | **High** | CI migration check never fires — real operational bug |
| 13 npm CVEs including Next.js DoS CVE | **Critical** | Neither manual document ran `npm audit` |
| `next lint` deprecation + fix required | **Low** | Operational hygiene |
| DEFAULT_LLM_PROVIDER missing from .env.example | **Low** | Onboarding friction |
| dist/ missing from .gitignore | **Low** | Hygiene |
| build-team.ts hardcoded absolute path | **High** | Breaks on every machine except author's |
| LICENSE file missing | **Low** | Mentioned as TODO in README, never addressed |

---

## Root Cause of the Gap

The skill and the manual audit are operating at different layers of the codebase:

```
Skill scope:          Config files, CI workflows, package.json, .env, npm audit, gitignore
Architecture audit:   Application source code — lib/, modules/, workers/, next.config.ts
```

The skill's DISCOVER step reads "README, config files, CI config, directory structure." This is correct but insufficient for a security diagnosis of a production application. The architecture audit's value came entirely from reading source files — something the skill's process doesn't explicitly prescribe.

The skill's diagnostic scripts (`scan-secrets.sh`, `check-gitignore.sh`) are designed for surface checks. They do not — and cannot — detect `rejectUnauthorized: false` in a TypeScript function, a token concatenated into a URL, or a CSP header with unsafe-eval.

---

## Overall Verdict: PARTIAL

The skill reliably delivers:
- Hygiene and configuration fixes (CI bugs, gitignore, env templates, package.json scripts)
- Automated security surface scan (secrets in files, git history)
- Dependency vulnerability triage (`npm audit`)
- A clean, structured report with applied-fix evidence

The skill does not deliver:
- Code-level security audit (application source must be read)
- Detection of architectural issues (worker error handling, silent failures)
- Production-readiness assessment (the 8 P0/P1 issues that block shipping)

**The skill is a reliable hygiene scanner. It is not a production security audit.** For a repo that builds and type-checks cleanly, the hygiene issues it finds are real and worth fixing. But if the goal is "is this safe to ship?", the skill's output gives incomplete — and potentially false — confidence.

---

## Recommendations for Skill Improvement

| Priority | Recommendation |
|----------|---------------|
| **High** | Add a "Security Source Audit" step to DIAGNOSE: read key source files for common security patterns (SSL validation, auth bypass, token handling, CSP). The diagnostic-checklist.md should include TS/JS-specific checks: grep for `rejectUnauthorized: false`, `unsafe-eval`, token-in-URL patterns |
| **High** | Add TypeScript dead-import detection to `find-dead-imports.sh` — currently Python-only; `eslint --rule no-unused-vars` or `ts-prune` would catch the TS cases |
| **Medium** | Add a DISCOVER prompt: "Read 3–5 key source files beyond config (lib/db/index.ts, main API route, worker bootstrap, auth handler) to build security mental model before DIAGNOSE" |
| **Medium** | Add to diagnostic-checklist.md Security section: specific grep patterns for common Node.js/TS security anti-patterns |
| **Low** | Document the skill's scope boundary explicitly: "This skill audits configuration, CI, dependencies, and surface hygiene. For a production security audit of application code, follow with `architecture-audit` or `code-review-checklist`." |
