# Pack Spec Conformance — Reference

> Last updated: 2026-04-21

---

## Overview

A **knowledge pack** is a structured documentation bundle that AI agents can load autonomously to answer questions about a tool without reading its entire source. For wapt Phase 7, the deliverable is `portable-kit/knowledge/packs/wapt/` — a five-file pack that covers the full tool surface and passes the agent-operability test: an agent that loads only the pack can correctly answer operational questions like "how do I add a site?" or "why is health check failing?".

This document specifies the required structure, file-level contracts, frontmatter schema, and verification procedure for the wapt knowledge pack.

---

## What Is PACK_SPEC in This Context?

The term comes from the wapt ROADMAP (Phase 7 deliverable: "portable-kit/knowledge/packs/wapt/ enligt PACK_SPEC-format"). It maps to the **Full** shape in portable-kit's skill-forge package taxonomy:

- `INDEX.md` — machine-readable catalogue with frontmatter triggers
- `OVERVIEW.md` — what wapt is and why it exists
- `USAGE.md` — command reference with flags and exit codes
- `RECIPES.md` — common multi-step workflows
- `TROUBLESHOOTING.md` — symptom → cause → fix table

This is distinct from skill packages (SKILL.md + metadata.json). A knowledge pack describes a *tool*, not an *agent capability*. Its primary consumer is an agent reading the pack to answer a user's operational question, not an agent executing a workflow.

---

## Version Pins

| Concept | Value |
|---------|-------|
| Pack version | Mirrors wapt version: `v0.1.0` at Phase 7 |
| Frontmatter schema | Defined below (this document) |
| Target directory | `portable-kit/knowledge/packs/wapt/` |
| Naming convention | `SCREAMING_SNAKE.md` for index, `TITLE_CASE.md` for content |

---

## Pack Structure

```
portable-kit/knowledge/packs/wapt/
├── INDEX.md            # Catalogue, triggers, version — machine-readable entry point
├── OVERVIEW.md         # What is wapt, why does it exist, architecture summary
├── USAGE.md            # wapt add / remove / list / health / doctor / deploy
├── RECIPES.md          # Common multi-step workflows (add + edit + deploy etc.)
└── TROUBLESHOOTING.md  # Symptom → cause → fix table
```

Five files. No subdirectories. Total size target: under 800 lines across all five files combined. Agents load the full pack in a single context injection.

---

## Best Practices

### Write for agent consumption first

An agent reading this pack has no other context. Every file must be self-contained enough that the agent can answer a user question after reading only the pack. Concretely:

- No "see also the source code" references without quoting the relevant excerpt
- All command flags documented with types and defaults
- All exit codes documented
- Error messages quoted verbatim where they appear in the tool's output

### Write for humans second

A developer reading RECIPES.md should be able to follow it without an agent. Use numbered steps, code blocks, and concrete values — not abstract descriptions.

### Agent-operability test

After writing the pack, verify by prompting an agent (with only the pack loaded, no source access) to answer these three questions:

1. "How do I add a site called `foo` pointing to `/path/to/project`?"
2. "`wapt health` shows `DEGRADED` for `ecc`. What do I check?"
3. "How do I deploy `ecc` to GitHub Pages?"

If the agent answers correctly and completely, the pack passes. If it hedges or hallucinates flags, the pack is incomplete.

### Triggers are discovery anchors

The `triggers` list in INDEX.md frontmatter determines when agents load this pack automatically. Use specific, natural-language phrases that match real user questions. Include common related terms (e.g. "caddy localhost", "trusted cert local") not just the bare tool name.

### Pack version matches tool version

When wapt ships `v0.1.1`, the pack must be updated and its version field bumped to match. Stale packs mislead agents about current command signatures.

---

## Code Examples

### Example 1 — INDEX.md (complete file)

```markdown
---
skill: wapt-knowledge-pack
version: v0.1.0
last_verified: 2026-04-21
triggers:
  - wapt
  - local site
  - local dev server
  - caddy localhost
  - mkcert localhost
  - serve local project
  - wapt add
  - wapt health
  - wapt doctor
  - wapt deploy
  - ecc.localhost
  - local https
  - trusted cert local
---

# wapt — Knowledge Pack Index

wapt is a Python CLI that manages locally-trusted HTTPS sites on a developer machine
using Caddy as the web server and mkcert for certificate management.

## Files in this pack

| File | Contents |
|------|----------|
| `OVERVIEW.md` | Architecture, design principles, dependency versions |
| `USAGE.md` | Full command reference with flags, examples, exit codes |
| `RECIPES.md` | Multi-step workflows for common tasks |
| `TROUBLESHOOTING.md` | Symptom → cause → fix for known failure modes |

## Quick answers

**Add a site:** `wapt add <name> <path>` — see USAGE.md#add
**List sites:** `wapt list [--json]` — see USAGE.md#list
**Check health:** `wapt health` — see USAGE.md#health
**Run prerequisites check:** `wapt doctor` — see USAGE.md#doctor
**Remove a site:** `wapt remove <name>` — see USAGE.md#remove
**Deploy to target:** `wapt deploy <name> --target=<target>` — see USAGE.md#deploy

## Version

Pack version: v0.1.0
Tool version: v0.1.0
Verified against: Caddy v2.8+, mkcert v1.4+, Python 3.12
```

### Example 2 — USAGE.md excerpt (the `add` subcommand)

````markdown
## add

Register a local directory as a named HTTPS site served by Caddy.

```bash
wapt add <name> <path> [--port PORT] [--no-cert]
```

| Argument/Flag | Type | Default | Description |
|---------------|------|---------|-------------|
| `name` | str | required | Site identifier (hostname: `<name>.localhost`) |
| `path` | path | required | Absolute or relative path to the site root |
| `--port` | int | 443 | HTTPS port Caddy listens on for this site |
| `--no-cert` | flag | false | Skip mkcert cert generation (HTTP only) |

**What it does:**
1. Validates that `path` exists and is readable
2. Generates `~/.wapt/<name>/cert.pem` + `key.pem` via mkcert (unless `--no-cert`)
3. Writes `caddy/sites-enabled/<name>.caddy` from the Jinja2 template
4. Reloads Caddy via Admin API (`POST /load`) or binary restart as fallback
5. Appends entry to `~/.wapt/registry.json`

**Exit codes:**

| Code | Meaning |
|------|---------|
| `0` | Site added and Caddy reloaded successfully |
| `1` | `path` does not exist |
| `2` | Site `name` already registered (use `wapt remove` first) |
| `3` | Caddy reload failed (site registered but not yet serving) |

**Example:**
```bash
wapt add ecc ~/projects/ecc-browser
# → https://ecc.localhost now serves ~/projects/ecc-browser
```
````

---

## Frontmatter Schema (INDEX.md)

Every pack INDEX.md must include this YAML frontmatter block. All fields are required.

```yaml
---
skill: <tool-name>-knowledge-pack          # e.g. wapt-knowledge-pack
version: v<semver>                          # matches tool release tag exactly
last_verified: YYYY-MM-DD                   # ISO date pack was last reviewed against the tool
triggers:                                   # array of strings; at least 5, at most 20
  - <natural language phrase>               # what a user would type to invoke this tool
---
```

**Trigger writing rules:**
- Use lowercase
- Include the bare tool name as the first trigger
- Include common user-intent phrases ("serve local project", not "execute wapt add")
- Include at least one error-symptom trigger ("caddy localhost", "trusted cert local")
- Do not include generic words ("help", "docs") — these match too broadly and load the pack unnecessarily

---

## File-Level Contracts

### OVERVIEW.md

Must answer:
- What is this tool? (one paragraph)
- What problem does it solve that alternatives do not?
- What are the dependencies and their minimum versions?
- What is the directory structure of installed state?

Must NOT contain:
- Command flags (belongs in USAGE.md)
- Step-by-step workflows (belongs in RECIPES.md)
- Error messages (belongs in TROUBLESHOOTING.md)

### USAGE.md

Must contain one section per subcommand. Each section must have:
- Synopsis line in a bash code block
- Argument/flag table with types, defaults, descriptions
- "What it does" numbered list
- Exit codes table
- At least one complete example with expected output as a comment

### RECIPES.md

Must contain at least:
- Add a new site end-to-end (including mkcert step)
- Edit a site's root path and reload
- Remove a site cleanly (registry + cert + Caddyfile)
- Deploy to a target (GitHub Pages or Heroku)

Each recipe is a numbered list of commands with expected terminal output shown as `# comments`.

### TROUBLESHOOTING.md

Structure: three-column table `| Symptom | Cause | Fix |` at the top for quick scanning, followed by detailed sections for complex causes.

Must cover at minimum:
- Caddy not running / not responding on :2019
- mkcert CA not installed (browser shows red lock)
- Port 2019 conflict with another process
- Certificate expired or not trusted
- Site registered in registry but not serving (Caddy reload failed)

---

## Extracting the Pack from AGENTS.md

AGENTS.md is the canonical source of truth for wapt's command surface. Use it as the primary input when writing USAGE.md. The extraction transform is:

```
AGENTS.md verify-commands section  →  USAGE.md command entries
AGENTS.md guardrails               →  TROUBLESHOOTING.md causes
AGENTS.md subagent-routing table   →  (skip — agent-internal, not user-facing)
BLUEPRINT.md module list           →  OVERVIEW.md architecture summary
ROADMAP.md acceptance criteria     →  RECIPES.md (each criterion maps to a recipe)
```

After writing the pack, delete or comment out any content that is implementation-internal (e.g. Jinja2 template paths, Python module names) unless it appears in error messages the user will see.

---

## Release-Tagging Convention

Pack version tracks tool version exactly:

```
wapt v0.1.0  →  knowledge/packs/wapt/INDEX.md  version: v0.1.0
wapt v0.1.1  →  knowledge/packs/wapt/INDEX.md  version: v0.1.1
                                                last_verified: <release date>
```

When the tool changes a command signature or exit code, the pack must be updated in the same commit. Include "update knowledge pack" in the CHANGELOG entry for every wapt release.

---

## Gotchas

**1. Triggers too broad cause false positives.**
"localhost" as a trigger loads the wapt pack for any local-dev question. Use "caddy localhost" or "wapt add" instead.

**2. USAGE.md that omits exit codes.**
Agents answering "why did wapt exit 3?" need the exit code table. Always include it, even if only codes 0 and 1 are currently used.

**3. RECIPES.md with abstract commands.**
"Run the add command with your path" is useless to an agent. Write `wapt add ecc ~/projects/ecc-browser`. Agents need concrete tokens.

**4. Pack version not bumped after tool changes.**
An agent loading a `v0.1.0` pack against a `v0.1.2` binary may cite removed flags. Add pack update to the release checklist in ROADMAP.md Phase 7.

**5. Pack exceeds 800 lines total.**
At over 800 lines the pack may not fit cleanly in a single context injection. If it grows, split TROUBLESHOOTING.md into an extended reference linked from the pack, keeping the three-column summary table in the main file.

**6. Internal module names leaking into user-facing docs.**
Users do not care that the site registry is backed by `site_registry.py`. USAGE.md should describe observable behaviour (flags, output, exit codes), not internals. Only reference internals if they appear in error messages the user sees.

---

## External Links

- [portable-kit knowledge/INDEX.md](../../../knowledge/INDEX.md) — parent knowledge base catalogue
- [portable-kit skill-forge SKILL.md](../../../knowledge/meta-skills/skill-forge/SKILL.md) — skill package shape taxonomy
- [portable-kit skill-forge references/package-shapes.md](../../../knowledge/meta-skills/skill-forge/references/package-shapes.md) — Full vs Standard vs Production shapes
- [wapt ROADMAP.md Phase 7](../ROADMAP.md) — pack as Phase 7 deliverable
- [wapt AGENTS.md](../AGENTS.md) — canonical source for command surface extraction
