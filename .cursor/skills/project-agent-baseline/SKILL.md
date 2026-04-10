---
name: project-agent-baseline
description: >-
  Establishes stack-agnostic agent hygiene for any repository: ensure or create
  AGENTS.md with real verify commands, document where skills and prompts live,
  prefer evidence-backed claims, and merge starter-kit resources without
  clobbering project files. Use when bootstrapping agent support, onboarding
  a new repo, reconciling Cursor skills with team docs, or when the user asks
  for agent-ready structure, FOR_AGENTS, or MANIFEST.json in docs.
---

# Project agent baseline

## When this skill applies

Use when:

- The repo **lacks** or has **stale** `AGENTS.md` / agent instructions  
- Merging **agentic-starter-kit** (or similar) into an existing tree  
- Standardizing **where** agents should look first (`FOR_AGENTS.md`, `MANIFEST.json`)  
- Preventing duplicate or conflicting **Cursor skills**

## First reads (order)

1. Repo root **`AGENTS.md`** (or `CLAUDE.md` / `CONTRIBUTING.md` if those replace it)  
2. **`conventions/FOR_AGENTS.md`** if present (starter kit manifest)  
3. **`conventions/MANIFEST.json`** if present — machine-readable resource list  
4. **`conventions/PRINCIPLES.md`** — default harness stance  

## Rules

1. **Single source of verify commands** — They must appear in `AGENTS.md` (or linked doc). CI should mirror the same commands when possible.  
2. **No silent overwrite** — When merging `.cursor/skills/`, **merge** directories; rename on conflict instead of deleting.  
3. **Paths are project-relative** — Fix template paths in skills after moving the kit (e.g. `templates/` vs `docs/agentic-starter-kit/templates/`).  
4. **Declare gaps** — If secrets policy, eval suite, or MCP docs are missing, say so and add a stub file or issue reference.  
5. **Combine with quality protocol** — For substantive edits, also follow `small-model-premium-protocol` (delta summary).

## Merge checklist (agent-executable)

- [ ] Copy or merge `.cursor/skills/`  
- [ ] Copy or merge `.cursor/rules/` (e.g. `agentic-starter-defaults.mdc`); set `alwaysApply: false` if the rule is too noisy for the repo  
- [ ] Verify `conventions/`, `protocols/`, `scaffolds/` are in place  
- [ ] Instantiate **`AGENTS.md`** from `AGENTS.template.md` and fill placeholders  
- [ ] Add one line to **`README.md`** pointing to `CLAUDE.md` or `AGENTS.md`  
- [ ] Update **`conventions/MANIFEST.json`** `version` if resources are added/removed  

## Anti-patterns

- Skills that reference **non-existent** paths after a merge  
- Multiple conflicting “verify” sections across files without a canonical pointer  
- Claiming the repo is “agent-ready” with empty `[PLACEHOLDER]` in `AGENTS.md`

## References

See `references/architecture.md` in this skill folder.
