<!-- [FIXED] Context Design Template — Layer 2 output -->

# Context Design: [VARIABLE: Project Name]

## [FIXED] Memory Tiers

| Tier | Content | Size | When Loaded |
|------|---------|------|-------------|
| **L0** | [VARIABLE: Identity — who is this agent?] | ~50 tokens | Always |
| **L1** | [VARIABLE: Critical facts — project, team, preferences] | ~120 tokens | Always |
| **L2** | [VARIABLE: Topic recall — domain knowledge, skills] | On demand | [VARIABLE: trigger condition] |
| **L3** | [VARIABLE: Deep search — semantic search, web] | On demand | Explicit query |

## [FIXED] Boot Sequence

```
[VARIABLE: Numbered steps, ordered by priority]
1. [VARIABLE: L0 load — CLAUDE.md or identity file]
2. [VARIABLE: L1 load — AGENTS.md, project config]
3. [VARIABLE: L2 scan — knowledge index, skill directory]
4. [VARIABLE: Active task check]
5. Ready
```

## [FIXED] Tool Pool

| Tool | Purpose | Load When |
|------|---------|-----------|
| [VARIABLE] | [VARIABLE] | [VARIABLE: always / on demand / never pre-load] |

## [FIXED] Knowledge Base Map

| Knowledge Area | Location | Tier | Format |
|---------------|----------|------|--------|
| [VARIABLE] | [VARIABLE: file path or service] | [VARIABLE: L0-L3] | [VARIABLE: markdown/json/search] |

<!-- [FIXED] Anti-patterns -->
## Context Anti-patterns

| Do NOT | Instead |
|--------|---------|
| Pre-load all knowledge at boot | Search L2-L3 on demand |
| Connect all MCP servers | Only servers relevant to current task |
| [VARIABLE: project-specific anti-pattern] | [VARIABLE] |
