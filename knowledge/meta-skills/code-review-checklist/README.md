# code-review-checklist

Structured, severity-ranked pull request review across 7 categories — correctness, security, performance, style, testing, documentation, and PR hygiene.

## What It Does

Takes a PR reference (URL, number, branch name, or raw diff) and walks through every changed file against a 7-category checklist. Each finding is classified as Blocker, Warning, or Nitpick. The output is a structured findings table with file:line references and a verdict (Approve / Approve with comments / Request changes). Large PRs (>300 lines) get a commit-by-commit deep review; PRs >500 lines receive a split recommendation.

## Supported Clients

- Claude Code (primary)
- Any Claude agent with `gh` CLI access or ability to read raw diffs
- Cursor, Codex, or similar agents with file-read capability

## Prerequisites

- `gh` CLI installed and authenticated (preferred), OR user-provided raw diff
- Repository access (read diff, file contents, PR metadata)
- No third-party packages or scripts required

## Installation

Drop the `code-review-checklist/` folder into `.skills/` in your project, or reference it from `skill-engine/explicit-skills.md`.

```
cp -r code-review-checklist/ /your-project/.skills/
```

## Trigger Conditions

- "review this PR"
- "code review"
- "check this pull request"
- "PR review"
- "review the diff"
- "go through this PR"
- "what's wrong with this PR"
- Any PR URL, diff output, or branch comparison shared by user

## Expected Outcome

A structured review containing:
- PR Overview (title, author, files changed, diff size, review depth)
- Findings Table (category, severity, file:line, description) — sorted by severity
- Verdict: Approve / Approve with comments / Request changes
- Optional summary comment in copy-pasteable markdown format

Typical completion time: 3-10 minutes depending on PR size and review depth.

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main agent instruction — 4-step process (Scope, Context, Walk diff, Verdict) |
| `README.md` | This file — installation and usage |
| `metadata.json` | Package metadata |

## Troubleshooting

**The review only reports style nitpicks and misses logic errors.**
The skill processes categories in risk order: correctness and security first, then performance, then style. If only nitpicks appear, re-read Step 3 — check that every changed file was reviewed against the full 7-category checklist, not just the familiar categories.

**The `gh` CLI is not available or authenticated.**
The skill works on raw diffs pasted by the user. Adjust Step 1 to parse the diff directly instead of calling `gh pr view`. PR metadata (title, author, linked issues) will be limited to what the user provides.

**Review of a >500-line PR takes too long or produces too many findings.**
Recommend the author split the PR. If splitting is not possible, prioritize the commit-by-commit walkthrough (Deep review mode) and focus findings on the highest-severity categories first.
