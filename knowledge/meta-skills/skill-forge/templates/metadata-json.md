<!-- ============================================================
     SKILL FORGE — METADATA.JSON TEMPLATE

     FIXED ZONES: Marked with [FIXED]. Do not modify structure.
     VARIABLE ZONES: Marked with [VARIABLE]. Replace with content.

     This file documents the metadata.json schema and provides a
     copy-pasteable template. The JSON structure (field names and
     nesting) is FIXED. All values are VARIABLE.

     metadata.json serves three purposes:
     1. Machine-readable indexing for skill discovery and search
     2. Dependency declaration for install tooling
     3. Display metadata for marketplace or catalog listings
     ============================================================ -->

# metadata.json — Schema and Template

> **When to read this:** Before writing or editing any `metadata.json` file in a skill package.

---

## Template

<!-- [FIXED] JSON structure — field names and nesting never change.
     [VARIABLE] All values — replace every value with skill-specific content. -->

Copy this block into `metadata.json` and replace every `[VARIABLE]` value:

```json
{
  "name": "[VARIABLE: Display Name — title case, human-readable]",
  "description": "[VARIABLE: 2-3 sentences — same as README one-liner expanded slightly]",
  "category": "[VARIABLE: skills|meta-skills|recipes|workflows]",
  "author": {
    "name": "[VARIABLE: Full Name]",
    "github": "[VARIABLE: GitHub handle without @]"
  },
  "version": "[VARIABLE: SemVer — must match SKILL.md frontmatter version]",
  "requires": {
    "open_brain": [VARIABLE: true|false],
    "services": [VARIABLE: ["service-name"] or []],
    "tools": [VARIABLE: ["tool or client requirement"] or []]
  },
  "tags": [VARIABLE: ["lowercase", "kebab-case", "searchable-terms"]],
  "difficulty": "[VARIABLE: beginner|intermediate|advanced]",
  "estimated_time": "[VARIABLE: N minutes — typical wall-clock time for one invocation]",
  "created": "[VARIABLE: YYYY-MM-DD]",
  "updated": "[VARIABLE: YYYY-MM-DD]"
}
```

---

## Field Reference

<!-- [FIXED] Field descriptions — structure is fixed. Guidance content is fixed
     because these definitions govern all skill packages uniformly. -->

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Human-readable display name. Title case. Must match the H1 in SKILL.md (without backticks or formatting). |
| `description` | string | Yes | 2-3 sentences. Expand the README one-liner. Include what the skill does and what it produces. No trigger phrases here (those belong in SKILL.md `description`). |
| `category` | string | Yes | One of: `skills` (standalone capability), `meta-skills` (skill that produces other skills), `recipes` (multi-skill workflow), `workflows` (orchestration pattern). |
| `author.name` | string | Yes | Full name of the primary author. |
| `author.github` | string | Yes | GitHub username without the `@` prefix. Used for attribution and linking. |
| `version` | string | Yes | Semantic versioning (MAJOR.MINOR.PATCH). Must match the `version` field in SKILL.md frontmatter. Start at `1.0.0` for first publication. |
| `requires.open_brain` | boolean | Yes | Whether the skill uses Open Brain memory (search or capture). Set `false` if the skill works without any memory system. |
| `requires.services` | array | Yes | External services the skill depends on (e.g., `["openai-api", "github-api"]`). Empty array `[]` if none. |
| `requires.tools` | array | Yes | Client-side tools or capabilities needed (e.g., `["bash", "file-write", "web-search"]`). Use generic capability names, not client-specific tool names. Empty array `[]` if the skill is pure instruction. |
| `tags` | array | Yes | 3-8 searchable terms. Lowercase, kebab-case. Include: the domain, the output type, and 1-2 synonyms a user might search for. |
| `difficulty` | string | Yes | One of: `beginner` (no specialized knowledge needed), `intermediate` (domain familiarity helps), `advanced` (requires deep expertise or complex toolchain). |
| `estimated_time` | string | Yes | Typical wall-clock time for one complete invocation. Format: `"N minutes"` or `"N hours"`. Measure from trigger to verified output. |
| `created` | string | Yes | ISO date (YYYY-MM-DD) when the skill was first published. Never changes after initial publication. |
| `updated` | string | Yes | ISO date (YYYY-MM-DD) of the most recent edit to any file in the package. Update on every change. |

---

## Validation Rules

<!-- [FIXED] These rules apply to every metadata.json without exception. -->

| Rule | Check |
|------|-------|
| Version sync | `version` must exactly match SKILL.md frontmatter `version` |
| Name match | `name` must match the H1 title in SKILL.md |
| No empty strings | Every string field must have a non-empty value |
| Tags minimum | `tags` array must contain at least 3 entries |
| Tags format | Every tag must be lowercase-kebab-case (`/^[a-z0-9]+(-[a-z0-9]+)*$/`) |
| Date format | `created` and `updated` must be valid ISO dates (YYYY-MM-DD) |
| Category value | `category` must be one of the four allowed values |
| Difficulty value | `difficulty` must be one of the three allowed values |

---

## Completed Example

<!-- [VARIABLE] This example shows a realistic, filled-in metadata.json.
     Replace with an example relevant to the skill being forged. -->

```json
{
  "name": "Deal Memo Drafting",
  "description": "Standalone skill pack for drafting structured deal, IC, partnership, or acquisition memos from existing diligence materials. Turns research findings, model reviews, and meeting outputs into a recommendation-ready document.",
  "category": "skills",
  "author": {
    "name": "Nate B. Jones",
    "github": "NateBJones"
  },
  "version": "1.0.0",
  "requires": {
    "open_brain": true,
    "services": [],
    "tools": ["Claude Code or similar AI coding tool with reusable skills/system prompts"]
  },
  "tags": ["deal-memo", "investment-memo", "diligence", "ic-memo", "decision-doc"],
  "difficulty": "intermediate",
  "estimated_time": "10 minutes",
  "created": "2026-03-31",
  "updated": "2026-03-31"
}
```

---

## Common Mistakes

<!-- [FIXED] Anti-patterns for metadata authoring. -->

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Version in metadata.json drifts from SKILL.md | Tooling reports mismatch; confuses install scripts | Always update both files in the same commit |
| Tags are too broad (`["ai", "tool", "skill"]`) | Skill appears in every search, helps no one | Use domain-specific terms the target user would search for |
| `estimated_time` says "varies" | Useless for planning or ranking | Measure a real invocation; round to nearest 5 minutes |
| `requires.tools` uses client-specific names | Breaks on other clients | Use generic capability names: `bash`, `file-write`, `web-search` |
| `description` duplicates SKILL.md trigger phrases | Redundant and confusing | metadata.json describes WHAT; SKILL.md description says WHEN |
