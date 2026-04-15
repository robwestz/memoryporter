# Usage patterns — repo-strategy-orchestrator

> Point an agent at this file. It will show the user 10 ways to apply the
> skill's systematics, each reusing the same 6 core artifacts + branch
> pattern. Pick one. The agent then runs the skill with the chosen domain
> remap.

## The systematics (don't change — only the content changes)

```
Stage 1: CORE          Stage 2: BRANCH (after user choice)
─────────────────      ────────────────────────────────────
01-request-brief       01-branch-charter
02-repo-map            02-evidence-plan
03-constraint-map      03-validation-plan
04-purpose-chain       04-subskill-opportunities
05-failure-mode-atlas
06-options-matrix  ←── STOP. User chooses one branch.
```

The value is the *sequence*, not the word "repo." Any domain with
artifacts + constraints + valid-but-different paths fits.

## Pick one — 10 ways to use this skill

| # | Pattern | When to use | What the 6 artifacts become |
|---|---------|-------------|------------------------------|
| **1** | **Codebase audit** (default) | Unfamiliar repo, need understanding before change | brief · modules/entry points · hard+soft constraints · why it exists · what breaks · upgrade/extract/adjacent/spike |
| **2** | **Product strategy decision** | Product stalled or pivoting; need structured options not opinions | brief · feature map · market + legal constraints · user outcome chain · churn modes · pivot/deepen/bundle/sunset |
| **3** | **Architecture migration** | "Should we move from X to Y?" with no cheap rollback | brief · current arch · migration-hostile constraints · what X delivers · silent degradation modes · big-bang/strangler-fig/parallel-run/stay |
| **4** | **Dependency / library evaluation** | Replacing a library, vendor, or framework | brief · dep graph · version/license/compat · what the dep guarantees · failure on removal · swap/wrap/fork/keep |
| **5** | **Incident post-mortem** | After a production incident; want prevention options, not just a fix | brief · system at T=0 · invariants violated · intended flow · contributing + latent modes · detect/prevent/reduce-blast/accept |
| **6** | **Skill / agent catalog audit** | Point at `knowledge/meta-skills/`; too many skills, unclear value | brief · skill inventory · taxonomy rules · user-outcome chain · overlap/dead/broken · consolidate/specialize/retire/add |
| **7** | **Third-party integration decision** | Integrating with an external API/vendor/platform | brief · integration surfaces · SLA + compliance · what upstream expects · vendor-lock + outage modes · build/buy/partner/defer |
| **8** | **Documentation rescue** | Docs are sprawling, outdated, or duplicated | brief · doc inventory · reader personas · reader journey · findability + staleness · rewrite/restructure/retire/generate |
| **9** | **Team / ownership reorg** | Reshuffling team boundaries around a system | brief · who owns what module · Conway's law + hiring · business outcomes · silo + handoff modes · split/merge/bridge/keep |
| **10** | **Tech debt triage** | Debt backlog exists but no framework for "which first" | brief · debt inventory · business + compliance · why each debt matters · interest-rate per item · repay/refinance/contain/default |

## How the branch stage maps

Whatever pattern you pick, after you choose a branch in the options
matrix, the same 4 branch artifacts apply — the *domain* changes, the
*shape* doesn't:

| Branch artifact | What it captures in every pattern |
|-----------------|-----------------------------------|
| charter | the one path being pursued, reusing core inputs |
| evidence plan | claims to verify before committing |
| validation plan | success tests + failure triggers + rollback |
| subskill opportunities | if the work is repeatable, name the child skill |

## Kickoff — pick by number and tell the agent

```bash
# Pattern 1 (default — codebase)
python scripts/bootstrap_case.py my-repo "understand X and pick a path" \
  --repo "/path/to/repo" --workspace workspace/

# Pattern 3 (migration)
python scripts/bootstrap_case.py x-to-y "migrate from X to Y" \
  --repo "current system" --workspace workspace/

# Pattern 5 (post-mortem)
python scripts/bootstrap_case.py 2026-04-15-incident \
  "prevent recurrence of 2026-04-15 incident" \
  --repo "system that failed" --workspace workspace/

# Pattern 10 (tech debt)
python scripts/bootstrap_case.py debt-q2 \
  "pick the top 3 debts to repay this quarter" \
  --repo "main codebase" --workspace workspace/
```

The slug changes. The goal statement changes. The systematics don't.

## Why this matters more than 10 separate skills

If these were 10 independent skills, each would drift — different
audits, different artifact names, different stop conditions. By reusing
*this* skill's systematics for all 10, you get:

- One audit contract to improve → 10 patterns benefit
- One stop-for-options rule → every pattern forces user choice
- One evidence standard → every pattern separates observed from assumed
- One subskill discipline → only real specializations get forked off

Pick the pattern. Keep the skill.
