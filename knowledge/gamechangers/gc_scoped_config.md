# Scoped Configuration Merging

**Right config at the right scope, always traceable**

**Leverage:** 10x Multiplier

## What

5-level config hierarchy: ~/.claude.json (legacy) → ~/.claude/settings.json (user) → .claude.json (project) → .claude/settings.json (project) → .claude/settings.local.json (local). Deep merge with MCP server deduplication. Each entry tagged with its source scope.

## Why It Matters

Teams share project config via git, individuals customize locally without conflicts, user-level settings travel across projects. When something goes wrong, you can trace exactly which scope provided the setting.

## How To Use

Define a ConfigScope enum (User, Project, Local). Load files in order, deep-merge JSON objects. Track provenance per key. Deduplicate MCP servers by name (last scope wins).

## Code Pattern

```rust
// Discovery order:
let sources = [
    ("~/.claude.json", Scope::User),
    ("~/.claude/settings.json", Scope::User),
    (".claude.json", Scope::Project),
    (".claude/settings.json", Scope::Project),
    (".claude/settings.local.json", Scope::Local),
];

// Deep merge with scope tracking
for (path, scope) in sources {
    if let Ok(json) = load_json(path) {
        config.deep_merge(json, scope);
    }
}
```
