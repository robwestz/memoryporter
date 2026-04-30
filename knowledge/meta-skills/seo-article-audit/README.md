# seo-article-audit

Two-layer quality audit for backlink SEO articles against the BACOWR quality standard.

## What It Does

Layer 1 runs 11 deterministic mechanical checks (word count, anchor placement, trustlink validity, forbidden phrases, paragraph count, etc.) — any single failure rejects the article. Layer 2 evaluates 8 editorial quality dimensions (hook, thesis, entity integration, trustlink quality, anchor naturalness, red thread, closing quality, AI smell) using a 0–3 rating scale with quoted evidence and specific rewrite instructions. The output is a structured audit report with a PUBLISH-READY / REVISE-THEN-PUBLISH / REWRITE-REQUIRED verdict and 3 priority actions.

## Supported Clients

- Claude Code (primary)
- Any Claude agent with file-read access
- Layer 1 script: any terminal with Python 3.9+

## Prerequisites

- Python 3.9+ for `scripts/mechanical-audit.py` (no third-party packages required)
- No dependencies for agent-only use

## Installation

Drop the `seo-article-audit/` folder into `.skills/` in your project, or reference it from `skill-engine/explicit-skills.md`.

```
cp -r seo-article-audit/ /your-project/.skills/
```

## Trigger Conditions

- "audit this article"
- "check this backlink article"
- "is this article ready to publish"
- "QA this SEO article"
- "review article quality"
- "why does this article feel off"
- "grade this article against BACOWR standard"

## Expected Outcome

A completed `templates/audit-report.md` containing:
- Layer 1: 11-row pass/fail table with values and notes
- Layer 2: 8 dimensional findings, each with rating + quoted evidence + diagnosis + fix instruction
- Summary: Layer 1/2 scores, verdict, 3 priority actions

Typical completion time: 5–10 minutes per article.

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main agent instruction — read first |
| `README.md` | This file — installation and usage |
| `metadata.json` | Package metadata |
| `templates/audit-report.md` | Output template — copy and fill for every audit |
| `templates/feedback-card.md` | Per-dimension feedback format for writer delivery |
| `references/quality-standard.md` | Full 11-check procedures + 8 editorial rubrics + structural rules |
| `references/forbidden-phrases.md` | 23 forbidden phrases + 10 mediocrity anti-patterns |
| `scripts/mechanical-audit.py` | CLI: runs Layer 1 checks against an article file |

## Running the Script

```bash
python scripts/mechanical-audit.py article.md \
  --anchor "240 mattor i olika material" \
  --target "https://www.rusta.com/se/mattor" \
  --publisher "heminredning.se" \
  --language sv \
  --entities "matta,textiltrend,Formex,Pantone,rumsavdelare"
```

Exits `0` if all applicable checks pass, `1` if any fail.

## Troubleshooting

**Layer 1 passes but the article still feels wrong.**
That is what Layer 2 is for. A mechanical pass does not guarantee editorial quality. Run the full audit — a 11/11 Layer 1 score with Failing ratings in E1 (hook) and E2 (thesis) is a REVISE-THEN-PUBLISH verdict.

**Check 10 always shows SKIP.**
Pass `--entities` to the script, or provide `serp_entities` when invoking the skill. Check 10 only runs when an entity list is supplied. If no SERP probe was run for the job, the check is intentionally skipped.

**Script fails with permission error on Linux/macOS.**
Run with `python scripts/mechanical-audit.py` rather than executing directly, or `chmod +x scripts/mechanical-audit.py` first.

**Language detection is wrong for mixed-language articles.**
The heuristic uses stop-word counts — it can misfire if the article has significant amounts of both Swedish and English. Manually verify Check 9 for these cases.
