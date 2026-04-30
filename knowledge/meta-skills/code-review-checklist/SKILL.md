---
name: code-review-checklist
description: |
  Structured pull request review producing a severity-ranked checklist across
  correctness, security, performance, style, testing, and documentation.
  Use when: "review this PR", "code review", "check this pull request",
  "PR review", "review the diff", "go through this PR", "what's wrong with
  this PR", or any request to evaluate a pull request or diff. Trigger on
  any PR URL, diff output, or branch comparison. Input: a PR reference
  (URL, number, or branch name) or a raw diff.
author: Robin Westerlund
version: 1.0.0
---

# Code Review Checklist

> Produces a severity-ranked, category-structured review of any pull request — blockers first, nitpicks last.

## Purpose

Without a structured procedure, PR reviews drift toward style nitpicks while
missing logic errors and security issues. Large PRs get rubber-stamped. Severity
is unstated, so authors cannot prioritize fixes. This skill enforces a consistent
pass through every risk category and produces output the author can act on.

## Audience

- Primary: Agents reviewing PRs autonomously or assisting a human reviewer
- Secondary: Developers wanting a second-pass review before merging

## When to Use

- A user shares a PR URL, number, or branch and asks for review
- A user pastes a diff and asks what is wrong
- Before merging a feature branch into main
- As a second-pass check after human review

## When Not to Use

| If the situation is... | Use instead | Why |
|------------------------|-------------|-----|
| Reviewing architecture or system design (no PR) | Architecture audit / design review | This skill reviews diffs, not designs |
| Checking only code style or formatting | A linter (`eslint`, `ruff`, `clippy`) | Automated tools are faster and exhaustive for style-only checks |
| Reviewing a commit already merged to production | Post-mortem / incident analysis | The goal is different: learn from impact, not gate a merge |

## Required Context

Gather or confirm before starting:

| Context | What | How to get |
|---------|------|-----------|
| **PR reference** | URL, PR number, branch name, or raw diff | User provides; also `gh pr list` |
| **Repository access** | Ability to read diff, file contents, PR metadata | `gh` CLI or Read tool |
| **Codebase context** | Language, framework, and conventions | Read AGENTS.md, README, or similar |

## Process

| Step | Action | Outputs |
|------|--------|---------|
| **1. Scope** | Read PR metadata, determine review depth | PR overview, depth decision |
| **2. Context** | Read description, linked issues, conversation | Intent and approach |
| **3. Walk diff** | Check each file against category checklist | Findings list |
| **4. Verdict** | Compile findings, apply verdict rules | Complete review |

### Step 1: Scope the Review

**Action:** Read PR metadata and determine review depth.
**Inputs:** PR reference or raw diff.
**Outputs:** PR overview (title, author, file count, diff size) and review-depth decision.

Run `gh pr view <ref> --json title,author,files,additions,deletions` or read the
diff directly. Count files changed and total lines added/removed.

| If... | Then... | Because... |
|-------|---------|------------|
| Diff <= 50 lines, only docs/config | Quick scan — check hygiene + correctness only | Low risk, fast turnaround |
| Diff 51-300 lines | Standard review — all categories | Normal PR size |
| Diff > 300 lines or touches shared utilities | Deep review — all categories + commit-by-commit walkthrough | High blast radius, cognitive overload risk |

**Do NOT:** Skip reading the PR description. Context determines whether code is correct — a rename looks wrong without knowing the intent.

### Step 2: Read Context Before Code

**Action:** Read the PR description, linked issues, and any conversation.
**Inputs:** PR metadata from Step 1.
**Outputs:** Understanding of intent (what problem this PR solves, what approach was chosen).

If a linked issue exists, read it. If the PR description is empty, flag this as
a hygiene finding (warning severity).

**Do NOT:** Jump straight into the diff. Reviewing code without understanding intent produces false positives ("this looks wrong" when it is intentionally different).

### Step 3: Walk the Diff

**Action:** Review every changed file against the category checklist below.
**Inputs:** Intent from Step 2, diff from Step 1.
**Outputs:** Findings list — one entry per issue found.

For each changed file, check every applicable category:

| Category | What to check |
|----------|--------------|
| **Correctness** | Logic errors, edge cases, off-by-one, null/undefined handling, type mismatches, wrong return values |
| **Security** | Injection (SQL, XSS, command), auth bypass, secrets in code, unsafe deserialization, OWASP top 10 |
| **Performance** | N+1 queries, unbounded loops/allocations, missing indexes, blocking I/O in async context, unnecessary re-renders |
| **Style** | Naming consistency, dead code, unnecessary complexity, deviation from codebase conventions |
| **Testing** | Missing tests for new logic, edge case coverage, test quality, mocking correctness, flaky patterns |
| **Documentation** | API docs updated for public changes, breaking changes noted, migration steps if needed |
| **PR Hygiene** | Commit messages descriptive, PR size reasonable, no unrelated changes, no scope creep |

Also check what is **missing** from the diff:
- New public function with no test?
- Database schema change with no migration?
- Error path with no handling?
- Config change with no documentation?

Classify each finding by severity:

| Severity | Meaning | Reviewer action |
|----------|---------|-----------------|
| **Blocker** | Breaks correctness, security, or data integrity. Must fix before merge. | Request changes |
| **Warning** | Likely bug, performance issue, or significant maintainability concern. Should fix. | Request changes (or comment if borderline) |
| **Nitpick** | Style preference, minor improvement, optional cleanup. Fine to merge without fixing. | Comment only |

**Do NOT:**
- Review the entire diff as one blob — go file by file.
- Report only style issues while skipping correctness and security.
- Flag something as a blocker unless it actually breaks correctness, security, or data integrity.

### Step 4: Produce the Verdict

**Action:** Compile findings into the structured output format and determine the verdict.
**Inputs:** Findings from Step 3.
**Outputs:** Complete review checklist (see Output section).

| If... | Then... | Because... |
|-------|---------|------------|
| Zero blockers and zero warnings | **Approve** | Nothing requires changes |
| Zero blockers but 1+ warnings | **Approve with comments** or **Request changes** (use judgment) | Warnings are significant but may not block |
| 1+ blockers | **Request changes** | Blockers must be fixed before merge |
| Only nitpicks | **Approve** with inline comments | Nitpicks never block a merge |

**Do NOT:** Approve a PR with unresolved blockers. If unsure whether something is a blocker, mark it as a warning and explain your uncertainty.

## Output

Default output:

| Output | Contents | When |
|--------|----------|------|
| **PR Overview** | Title, author, files changed, additions/deletions, review depth | Always |
| **Findings Table** | Category, severity, file:line, description | Always |
| **Verdict** | Approve / Approve with comments / Request changes | Always |
| **Summary Comment** | Copy-pasteable markdown for posting as a PR review comment | If user requests |

### Output Template

```markdown
## PR Overview

| Field | Value |
|-------|-------|
| Title | [PR title] |
| Author | [author] |
| Files changed | [count] |
| Diff size | +[additions] / -[deletions] |
| Review depth | Quick scan / Standard / Deep |

## Findings

| # | Category | Severity | File | Finding |
|---|----------|----------|------|---------|
| 1 | [category] | [blocker/warning/nitpick] | [file:line] | [description] |

## Verdict: [Approve / Request changes]

[1-3 sentence summary: what is good, what must change, overall assessment]
```

## Example

**Input:** `gh pr view 42`

A 120-line PR adding a new `/api/users/:id` endpoint.

**Step 1:** 120 lines, 4 files changed → Standard review.
**Step 2:** PR description says "Add user detail endpoint for profile page." Linked to issue #38.
**Step 3 findings:**

| # | Category | Severity | File | Finding |
|---|----------|----------|------|---------|
| 1 | Security | Blocker | `routes/users.ts:24` | User ID from URL param passed directly to SQL query without parameterization |
| 2 | Testing | Warning | — | No test file for the new endpoint |
| 3 | Correctness | Warning | `routes/users.ts:31` | Returns 200 with `null` body when user not found; should return 404 |
| 4 | Style | Nitpick | `routes/users.ts:15` | Unused import `AuthMiddleware` |

**Step 4 verdict:** **Request changes** — 1 blocker (SQL injection), 2 warnings.

## Works Well With

- `small-model-premium` — Apply the 5-phase quality protocol to the review itself for thorough analysis
- `architecture-audit` — When the PR touches system boundaries and needs broader design evaluation

## Notes

- This skill reviews diffs and PRs, not entire codebases or architectural decisions
- For PRs over 500 lines, recommend the author split into smaller PRs before reviewing
- Language-specific checks (e.g., Rust borrow-checker patterns, React hook rules) are applied based on file extensions — the category checklist is language-agnostic by design
- If `gh` CLI is unavailable, the skill works on raw diffs pasted by the user — adjust Step 1 to parse the diff directly
