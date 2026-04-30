# Systematic Research

> Locked 6-step research pipeline with hard gates. Same process every time,
> structured output every time, no shortcuts.

## What It Does

Transforms any question into a graded research report with cross-verified
claims, explicit confidence scores, disagreement documentation, and gap
reporting. The pipeline runs identically regardless of topic — tech
architecture, competitive analysis, regulatory questions, or anything else
where "I think I read somewhere" isn't acceptable.

## Supported Clients

- Claude Code (skill auto-discovery via `knowledge/meta-skills/`)
- Any LLM agent that can read markdown + use web search tools

## Prerequisites

- At least one search tool (WebSearch, or manual search capability)
- At least one source reading tool (WebFetch, or manual reading)
- Optional: Context7 (for library docs), Ahrefs (for SEO/competitive),
  mempalace (for persistent storage of findings)

## Installation

Lives in `knowledge/meta-skills/systematic-research/` within the
portable-kit repo. Invoke via:

```
"Research the best way to set up X"
"Systematic research on Y vs Z"
"Investigate what experts recommend for W"
```

## Trigger Conditions

- User says "research", "investigate", "due diligence", "state of the art"
- User needs to make a technology/architecture decision
- User wants competitive or landscape analysis
- Before a major build (ground decisions in evidence)

## Expected Outcome

A structured research report with:
1. Executive answer (3 sentences)
2. Key findings table (claim | status | confidence | sources)
3. Disagreements section
4. Gaps section
5. Source quality summary
6. Self-grade (coverage %, confidence score, verdict)

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core: 6-step pipeline with hard gates |
| `templates/research-output.md` | Fixed output template for the report |
| `templates/scope-spec.yaml` | SCOPE step output template |
| `references/source-strategy.md` | How to find sources when naive search fails |
| `references/cross-verify-patterns.md` | How to cross-verify and handle disputes |
| `README.md` | This file |
| `metadata.json` | Marketplace metadata |

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Can't find enough sources | Too narrow a question | Widen SCOPE or accept lower coverage |
| All claims are "unverified" | Only one source per claim | Run more comparative/contrarian queries |
| Grade says "inconclusive" | Core question can't be answered from public sources | Honest result — flag for experimentation |
| Research takes too long | High-stakes mode with 8+ source minimum | Lower stakes if appropriate; pipeline is deliberately slow |
| Agent skips GRADE step | Habit from ad-hoc research | GRADE is a hard gate — the report is incomplete without it |
