# Quality Gate — Full Verification Checklist

> **When to read this:** During VERIFY, or when auditing an existing skill for quality.

---

## How to Use This Checklist

Every skill package must pass through this gate before PACKAGE. Items are
categorized by severity:

| Severity | Meaning | Action on failure |
|----------|---------|-------------------|
| **MUST** | Structural requirement. Without it, the skill is broken. | Rewrite the failing component. Do not ship. |
| **SHOULD** | Content quality. Without it, the skill works but underperforms. | Improve before shipping. Flag if skipped with reason. |
| **CHECK** | Conditional requirement. Only applies if the condition is met. | Verify the condition. If it applies, treat as SHOULD. |

**Pass criteria:**
- All MUST items pass (0 exceptions)
- At least 80% of applicable SHOULD items pass
- All applicable CHECK items are evaluated (pass or documented skip)

---

## Category 1: Structural Integrity

These verify the package is well-formed and machine-parseable.

| # | Severity | Check | How to verify |
|---|----------|-------|---------------|
| 1.1 | MUST | SKILL.md exists at package root | File presence |
| 1.2 | MUST | SKILL.md has valid YAML frontmatter | Parse YAML between `---` markers |
| 1.3 | MUST | Frontmatter contains `name` field | Key exists and is non-empty |
| 1.4 | MUST | Frontmatter contains `description` field | Key exists and is non-empty |
| 1.5 | MUST | Frontmatter contains `author` field | Key exists and is non-empty |
| 1.6 | MUST | Frontmatter contains `version` field | Key exists, matches SemVer pattern |
| 1.7 | MUST | `name` is lowercase-kebab-case | Regex: `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` |
| 1.8 | MUST | `description` is >= 50 characters | Character count |
| 1.9 | MUST | SKILL.md body is < 500 lines | Line count (excluding frontmatter) |
| 1.10 | MUST | Every file referenced in SKILL.md exists in the package | Cross-reference check |
| 1.11 | MUST | No hardcoded absolute paths | Search for `/Users/`, `C:\`, `/home/` |
| 1.12 | MUST | No API keys, tokens, or secrets | Search for patterns: `sk-`, `Bearer`, `password=` |
| 1.13 | MUST | Directory structure matches declared shape | Compare actual files to shape manifest |
| 1.14 | CHECK | If metadata.json exists: valid JSON | JSON parse succeeds |
| 1.15 | CHECK | If metadata.json exists: `name` matches SKILL.md `name` | String comparison |
| 1.16 | CHECK | If templates/ exist: at least one .md file inside | Directory listing |
| 1.17 | CHECK | If examples/ exist: at least one complete example | Directory contains non-empty files |
| 1.18 | CHECK | If scripts/ exist: each script is executable and has usage comment | Read first 10 lines for usage pattern |
| 1.19 | CHECK | If evals/ exists: evals.json is valid JSON with >= 3 test cases | Parse and count |

---

## Category 2: Content Quality

These verify the skill delivers actionable, well-structured guidance.

| # | Severity | Check | How to verify |
|---|----------|-------|---------------|
| 2.1 | SHOULD | First section delivers standalone value | Read only the first section: can you act on it? |
| 2.2 | SHOULD | Tables used where 3+ parallel items share attributes | Scan for bullet lists that should be tables |
| 2.3 | SHOULD | At least one anti-pattern per major process section | Search for "do NOT", "avoid", "never", or anti-pattern tables |
| 2.4 | SHOULD | Every decision point has a decision table | Search for If/Then/Because or decision-tree formatting |
| 2.5 | SHOULD | Imperative form used throughout | Scan for "you should", "one might", passive voice |
| 2.6 | SHOULD | Examples provided for ambiguous rules | Any rule that could be interpreted two ways has a concrete example |
| 2.7 | SHOULD | No "be smart" or "think carefully" rules | Search for vague directives |
| 2.8 | SHOULD | Key insight is in the first paragraph of each section | Read first paragraph: is the core point there? |
| 2.9 | SHOULD | Verification steps are testable (not "looks good") | Each verification item has a concrete pass/fail criterion |
| 2.10 | SHOULD | Code examples are syntactically valid | Parse or lint code blocks |
| 2.11 | SHOULD | Templates have Fixed/Variable zone annotations | Search for `[FIXED]` and `[VARIABLE]` markers |
| 2.12 | SHOULD | Worked examples are real, not placeholder stubs | Examples produce complete, usable output |
| 2.13 | SHOULD | No orphan references (file mentions something not explained) | Cross-reference terms to definitions |
| 2.14 | SHOULD | Consistent terminology (same concept = same word) | Scan for synonyms used for the same thing |

---

## Category 3: Progressive Disclosure

These verify the skill reveals information at the right depth.

| # | Severity | Check | How to verify |
|---|----------|-------|---------------|
| 3.1 | SHOULD | Frontmatter `description` is approximately 50-150 words | Word count |
| 3.2 | SHOULD | SKILL.md body is self-contained for the core workflow | Can an agent execute the skill reading only SKILL.md? |
| 3.3 | SHOULD | References are used for depth, not required for basic execution | Remove references/: does the core workflow still work? |
| 3.4 | SHOULD | Every reference file starts with "When to read this:" | Read first line after the title |
| 3.5 | SHOULD | Templates provide enough structure to generate output without reading SKILL.md | Read a template in isolation: is it usable? |
| 3.6 | SHOULD | README.md can be read without reading SKILL.md | README explains what the skill does and how to trigger it |
| 3.7 | CHECK | If the package has 4+ reference files: SKILL.md includes a reference index | Table or list mapping reference files to topics |
| 3.8 | SHOULD | Sections are ordered by frequency of use (most common first) | The most-used workflow appears before edge cases |
| 3.9 | SHOULD | Long sections (> 40 lines) have sub-headings | Scan for unbroken blocks without `##` or `###` |
| 3.10 | SHOULD | No information duplication between SKILL.md and references/ | Same content should not appear in both places |

---

## Category 4: Compatibility

These verify the skill works within the skill-engine ecosystem.

| # | Severity | Check | How to verify |
|---|----------|-------|---------------|
| 4.1 | MUST | `name` is unique across the skill corpus | Search existing skills for name collision |
| 4.2 | SHOULD | `description` includes trigger phrases ("Use when...", "Trigger on...") | String search in description |
| 4.3 | SHOULD | Trigger phrases are concrete and specific (not "when needed") | Review each trigger: is it a clear user action? |
| 4.4 | MUST | No hardcoded tool paths (use `[TOOL_NAME]` placeholders) | Search for tool-specific absolute paths |
| 4.5 | MUST | No dependency on specific project structure | Search for project-specific paths or filenames |
| 4.6 | SHOULD | Dependencies declared in metadata.json `requires` field | Cross-reference imports/tool calls with declared deps |
| 4.7 | SHOULD | Compatible with skill-engine INTAKE -> RESOLVE -> EVAL -> ADAPT -> VERIFY | Read SKILL.md: does it have clear inputs, outputs, and verification? |
| 4.8 | CHECK | If the skill wraps an external service: graceful failure when unavailable | Error handling described or implemented |
| 4.9 | CHECK | If the skill spawns sub-agents: permission level declared | Check for permission annotations |
| 4.10 | SHOULD | Skill can be loaded by the loader-blueprint ranking model | Has triggers, has priority (or defaults apply), has clear intent |
| 4.11 | SHOULD | Version follows SemVer conventions | Parse version string |
| 4.12 | CHECK | If the skill modifies files: declares which directories it writes to | Output paths are documented |

---

## Category 5: Marketplace Readiness

These verify the skill is discoverable and installable by others.

| # | Severity | Check | How to verify |
|---|----------|-------|---------------|
| 5.1 | CHECK | README.md exists (required for Standard+ shapes) | File presence |
| 5.2 | CHECK | README.md has all 9 required sections | Section headings check |
| 5.3 | CHECK | metadata.json exists (required for Standard+ shapes) | File presence |
| 5.4 | CHECK | metadata.json has all required fields | Schema validation |
| 5.5 | SHOULD | Tags are lowercase, kebab-case, and searchable | Review tags for relevance and format |
| 5.6 | SHOULD | Tags include at least one domain tag and one function tag | e.g., "legal" + "drafting" or "data" + "pipeline" |
| 5.7 | SHOULD | Category is one of the recognized categories | Check against known category list |
| 5.8 | CHECK | If Full+ shape: at least one worked example in examples/ | Directory check |
| 5.9 | SHOULD | README Files table matches actual directory contents | Cross-reference |
| 5.10 | SHOULD | Display name in metadata.json is human-readable | Not kebab-case: "Deal Memo Drafting" not "deal-memo-drafting" |
| 5.11 | CHECK | If the skill has prerequisites: they are listed in README | Section presence and completeness |
| 5.12 | SHOULD | Troubleshooting section has at least 2 entries | Count entries |
| 5.13 | SHOULD | Installation instructions are copy-pasteable | Commands are complete, not abbreviated |

---

## Quick Audit Workflow

For agents running a fast quality check (not a full forge cycle):

```
1. Parse SKILL.md frontmatter → verify 1.1-1.8
2. Count SKILL.md lines → verify 1.9
3. List all files → verify 1.10, 1.13
4. Search for secrets/hardcoded paths → verify 1.11, 1.12
5. Read first section → verify 2.1, 2.8
6. Scan for tables vs prose → verify 2.2
7. Search for anti-patterns → verify 2.3
8. Check imperative form → verify 2.5
9. If Standard+: validate README and metadata.json → verify 5.1-5.4
10. Report: X/Y MUST passed, X/Y SHOULD passed, X/Y CHECK evaluated
```

---

## Checklist Summary Table

| Category | MUST | SHOULD | CHECK | Total |
|----------|------|--------|-------|-------|
| 1. Structural Integrity | 13 | 0 | 6 | 19 |
| 2. Content Quality | 0 | 14 | 0 | 14 |
| 3. Progressive Disclosure | 0 | 9 | 1 | 10 |
| 4. Compatibility | 3 | 6 | 3 | 12 |
| 5. Marketplace Readiness | 0 | 6 | 5 | 11 |
| **Total** | **16** | **35** | **15** | **66** |

**Pass threshold:** 16/16 MUST + 28/35 SHOULD (80%) + all applicable CHECK evaluated.
