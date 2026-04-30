# Prompt Anti-Patterns — The Complete Catalog

> **When to read this:** When reviewing any prompt, SKILL.md, CLAUDE.md, or agent instruction for quality issues.

---

## Structural Anti-Patterns

| # | Pattern | What goes wrong | Detection | Fix |
|---|---------|----------------|-----------|-----|
| 1 | **Prose where tables belong** | Parallel info buried in paragraphs | 3+ items with shared attributes in prose | Convert to table |
| 2 | **"Be smart" rules** | Untestable directives | "think carefully", "use good judgment" | "Produce outline before code" |
| 3 | **Missing anti-patterns** | Agent only knows happy path | Section has do's but no don'ts | Add "Do NOT" table |
| 4 | **Buried key insight** | Agent reads 3 paragraphs before the point | Key info not in first sentence | Front-load every section |
| 5 | **Monolithic file** | 800+ line SKILL.md nobody reads fully | Line count > 500 | Extract to references/ |
| 6 | **No Fixed/Variable zones** | Next user improvises structure | Template without annotations | Mark every zone [FIXED] or [VARIABLE] |
| 7 | **Passive voice** | Adds words without clarity | "It should be noted that" | "Note:" |
| 8 | **Vague triggers** | Skill never activates when needed | "Use when appropriate" | "Trigger on: 'review', 'audit', 'check'" |
| 9 | **No decision tables** | Agent guesses at choice points | If/else logic in prose | If/Then/Because table |
| 10 | **Placeholder examples** | Agent can't judge quality without real output | "example output here", "foo", "bar" | Use real artifacts or mark ILLUSTRATIVE |

## Context Anti-Patterns

| # | Pattern | What goes wrong | Detection | Fix |
|---|---------|----------------|-----------|-----|
| 11 | **Context stuffing** | L3 data loaded at boot wastes tokens | Boot sequence loads everything | Search L2-L3 on demand |
| 12 | **Tool overload** | 50 MCP tools = decision paralysis | Count tools loaded at start | Minimum viable tool pool |
| 13 | **No boot sequence** | Agent improvises session start | No numbered startup steps | Staged boot (L0 → L1 → L2 check → ready) |
| 14 | **Stale memory** | Agent acts on outdated facts | No last_verified or TTL | Add aging/verification to stored facts |
| 15 | **Knowledge orphans** | Reference file exists but nothing points to it | grep for filename across project | Cross-reference in INDEX.md |

## Workflow Anti-Patterns

| # | Pattern | What goes wrong | Detection | Fix |
|---|---------|----------------|-----------|-----|
| 16 | **Mega-node** | One prompt node does everything | Node prompt > 3 paragraphs | Split into focused nodes |
| 17 | **AI for deterministic work** | Prompt node runs `npm run build` | bash-appropriate step in prompt node | Use `bash:` node |
| 18 | **Context pollution** | Loop carries garbage from iteration 3 into iteration 7 | Long loops without fresh_context | `fresh_context: true` |
| 19 | **Infinite loops** | No max_iterations on loop node | Missing cap | Always set max_iterations |
| 20 | **False dependencies** | Sequential nodes that could be parallel | Node A doesn't use Node B's output | Remove dependency, let DAG parallelize |
| 21 | **No verification** | Broken code propagates downstream | Build/write node without test node | Add bash verification between steps |
| 22 | **Surface-only diagnosis** | Scripts run but source code not read | Automated checks only | Add source-code audit step (repo-rescue lesson) |
