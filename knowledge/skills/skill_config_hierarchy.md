---
name: Build Scoped Configuration System
description: Implement a multi-tier configuration system with deep merge, scope tracking, and MCP server deduplication.
category: Configuration Hierarchy
trigger: When your tool/agent needs layered config (user defaults, project settings, local overrides).
type: skill
agnostic: true
---

# Build Scoped Configuration System

Implement a multi-tier configuration system with deep merge, scope tracking, and MCP server deduplication.

## When to Use

When your tool/agent needs layered config (user defaults, project settings, local overrides).

## Steps

1. Define ConfigScope enum (User, Project, Local).
2. Define discovery paths per scope.
3. Load JSON files in order, tracking source scope.
4. Deep merge objects: later scopes override earlier.
5. Special handling for MCP servers: deduplicate by name, last scope wins.
6. Parse feature subconfigs from merged object.
7. Provide debugging info: which scope provided which setting.

## Verification

- [ ] Later scope overrides earlier for same key.
- [ ] MCP servers deduplicated correctly.
- [ ] Missing config files don't cause errors.
- [ ] Scope tracking works for debugging.

