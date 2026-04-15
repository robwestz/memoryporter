# Capabilities — repo-strategy-orchestrator

> Point an agent at this file first. It lists what this skill does, when
> to trigger it, and what it does NOT do. The systematic contract is
> in SKILL.md; this file is the front door.

## What this skill gives you

**One tight core capability**: systematic intake of an existing system
(repo, product, incident, codebase) with mandatory 6-artifact sequence,
evidence-tagged bullets, anti-simplification review, and a forced
stop-for-options point before any recommendation. Then branch
continuation with four more artifacts. Everything audited mechanically.

You cannot bluff this skill. Empty sections fail. Missing evidence
tags fail. Skipping the user choice fails. That is the point.

## When to trigger (seven categories)

| Category | Trigger phrases | Example case slug |
|----------|----------------|-------------------|
| **A. Understand unknown codebase** | "analyze this repo", "what does this code do", "is this worth investing in", "take over this repo" | `repo-audit-2026-04-15` |
| **B. Pick next path for existing system** | "should we refactor or rewrite", "pivot vs deepen", "what path forward", "upgrade or extract" | `product-X-next-step` |
| **C. Post-mortem / debug** | "why did this fail", "prevent recurrence", "what went wrong", "retrospective" | `2026-04-15-incident` |
| **D. Third-party decision** | "build vs buy", "should we use library X", "migrate from Y to Z", "integrate with vendor" | `lib-eval-Y-to-Z` |
| **E. Strategic choice** | "tech debt triage", "which to fix first", "strategic options", "pivot point" | `debt-q2-triage` |
| **F. Meta-work on systems** | "audit my skills", "review catalog", "system health check", "consolidate or retire" | `skills-audit-2026` |
| **G. Handoff preparation** | "brief next session", "pause state", "handoff to another agent", "context capture" | `handoff-repo-X` |

## When NOT to use (hand to another skill)

| Situation | Use instead |
|-----------|-------------|
| Single bug to patch | `repo-rescue` |
| Build a new skill from scratch | `skill-forge` |
| SEO / content audit | `seo-article-audit` |
| Design a product from zero | `200k-blueprint` |
| Present existing artifacts to stakeholders | `showcase-presenter` (but run `scripts/present_case.py` first to prep) |
| Launch a new autonomous project | `project-launcher` |

## How to start

```bash
# Step 1 — bootstrap a case in YOUR project workspace (not in ~/.claude/)
python ~/.claude/skills/repo-strategy-orchestrator/scripts/bootstrap_case.py \
  <case-slug> "<one-line goal>" \
  --repo <path-or-url-or-hint> \
  --workspace /path/to/your/project/workspace

# Step 2 — fill the six core artifacts (tag bullets with [OBSERVED] etc)

# Step 3 — strict audit; on pass it advances stage to awaiting-user-choice
python ~/.claude/skills/repo-strategy-orchestrator/scripts/mechanical_audit.py \
  <workspace>/<case-slug> --strict

# Step 4 — present options to user, wait for choice

# Step 5 — scaffold the chosen branch
python ~/.claude/skills/repo-strategy-orchestrator/scripts/scaffold_branch.py \
  <workspace>/<case-slug> <branch-key> --name <branch-name>

# Step 6 — fill branch artifacts, re-run strict audit

# Step 7 — generate showcase-presenter brief
python ~/.claude/skills/repo-strategy-orchestrator/scripts/present_case.py \
  <workspace>/<case-slug>
```

## Advanced — 10 domain remaps

The same systematics apply to non-repo domains. `USAGE-PATTERNS.md`
catalogues 10 patterns (product strategy, architecture migration,
incident post-mortem, third-party integration, documentation rescue,
team reorg, tech-debt triage, etc.) — each reuses the same 6 core +
4 branch artifacts, only the domain content changes.

Start there if your case isn't a codebase but the shape fits
("intake → constraints → options → user choice → branch").

## Guarantees

- No output without six filled core artifacts
- No branch scaffolding without user choice (state-machine enforced)
- Every claim tagged as `[OBSERVED]` / `[DERIVED]` / `[ASSUMED]` / `[OPEN-RISK]`
- Every option has an anti-simplification review filled in
- Every case is resumable (cases.jsonl index + case.json state)
- Every case is presentable (present_case.py → showcase-presenter)
