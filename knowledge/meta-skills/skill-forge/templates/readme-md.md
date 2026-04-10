<!-- ============================================================
     SKILL FORGE — README.MD TEMPLATE

     FIXED ZONES: Marked with [FIXED]. Do not modify structure.
     VARIABLE ZONES: Marked with [VARIABLE]. Replace with content.

     This file is the external-facing documentation for a skill
     package. It answers: What is this? How do I install it? How
     do I know it is working? What do I do when it breaks?

     Every section header is FIXED. Content within sections is
     VARIABLE. Do not add, remove, or rename sections.
     ============================================================ -->

<!-- [FIXED] Title block — skill name as H1, one-liner as blockquote -->
# [VARIABLE: Skill Display Name]

> [VARIABLE: One sentence describing what this skill package provides. Write for someone scanning a list of 50 skills — they should know in 10 words whether this is relevant.]

<!-- [FIXED] What It Does section — 2-4 sentences -->
## What It Does

[VARIABLE: 2-4 sentences. What capability does this skill give an AI client?
What inputs does it expect? What outputs does it produce? Mention the core
value proposition — why install this instead of prompting manually?

If this skill is part of a larger workflow, mention the upstream/downstream
skills and link to the relevant recipe or workflow doc.]

<!-- [FIXED] Supported Clients section — bullet list -->
## Supported Clients

<!-- [VARIABLE] List every AI client this skill has been tested with or is
     expected to work with. Include the canonical four plus any others. -->
- Claude Code
- Codex
- Cursor
- [VARIABLE: Other clients, or remove this line if only the three above]

<!-- [FIXED] Prerequisites section -->
## Prerequisites

<!-- [VARIABLE] What must be true before installation. Be specific:
     software versions, accounts, API keys, other skills.
     If no prerequisites, write "None — this skill works standalone." -->
- [VARIABLE: Prerequisite 1 — tool, account, or dependency with version if relevant]
- [VARIABLE: Prerequisite 2]
- [VARIABLE: Prerequisite 3, or remove if fewer]

<!-- [FIXED] Installation section — step-by-step with code block -->
## Installation

<!-- [VARIABLE] Numbered steps to install the skill. Must include:
     1. Copy command or action
     2. Reload/restart instruction
     3. Verification prompt to confirm it works
     Include a code block for the Claude Code install path. -->

1. Copy [`SKILL.md`](./SKILL.md) into the reusable-instructions location for your AI client.
2. Restart or reload the client so it picks up the skill.
3. Test with a prompt like: `[VARIABLE: Example trigger prompt]`

For Claude Code, a common install path is:

```bash
mkdir -p ~/.claude/skills/[VARIABLE: skill-name]
cp SKILL.md ~/.claude/skills/[VARIABLE: skill-name]/SKILL.md
```

<!-- [FIXED] Trigger Conditions section — bullet list of example prompts -->
## Trigger Conditions

<!-- [VARIABLE] Natural-language phrases that should activate this skill.
     Minimum 3, maximum 8. These must match the trigger phrases in
     SKILL.md frontmatter description. -->
- "[VARIABLE: Trigger phrase 1]"
- "[VARIABLE: Trigger phrase 2]"
- "[VARIABLE: Trigger phrase 3]"

<!-- [FIXED] Expected Outcome section -->
## Expected Outcome

<!-- [VARIABLE] What the user gets when the skill runs correctly.
     Be specific: file names, output format, quality characteristics.
     This is the acceptance criteria for "it works". -->
When installed and invoked correctly, the skill should produce:

- [VARIABLE: Primary output with format/quality description]
- [VARIABLE: Secondary output or behavioral characteristic]
- [VARIABLE: Quality signal — what makes good output distinguishable from bad]

<!-- [FIXED] Files section — table mapping every file in the package -->
## Files

<!-- [VARIABLE] List every file in the skill package directory.
     This table MUST match the actual directory contents exactly.
     Add or remove rows to match reality. -->

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition — the instructions the AI client reads |
| `README.md` | This file — installation, usage, and troubleshooting |
| `metadata.json` | Machine-readable metadata for indexing and discovery |
| [VARIABLE: additional files] | [VARIABLE: purpose] |

<!-- [FIXED] Troubleshooting section — minimum 2 entries.
     Use the bold-issue / solution pattern consistently.
     Each entry must describe a symptom and a concrete fix. -->
## Troubleshooting

**Issue: [VARIABLE: Observable symptom — what the user sees going wrong]**
Solution: [VARIABLE: Concrete fix — what to do, not "try again". Include
specific actions, file paths, or configuration changes.]

**Issue: [VARIABLE: Second observable symptom]**
Solution: [VARIABLE: Concrete fix]

<!-- [VARIABLE] Add more troubleshooting entries as needed. Two is the minimum.
     Common patterns to cover:
     - Skill not activating (trigger mismatch or installation error)
     - Output quality too low (missing prerequisites or context)
     - Skill conflicts with another skill
     - Client-specific quirks -->

<!-- [FIXED] Notes for Other Clients section -->
## Notes for Other Clients

[VARIABLE: 2-3 sentences. Guidance for adapting this skill to clients other than
Claude Code. What is the core behavior that must be preserved? What tool names
or capabilities might differ across clients?]
