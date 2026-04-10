# FOR_AGENTS — canonical manifest

**Locale:** Canonical English (this file). Swedish: [`FOR_AGENTS.sv.md`](./FOR_AGENTS.sv.md). Optional English alias for tooling: [`FOR_AGENTS.en.md`](./FOR_AGENTS.en.md).

**Read this file first** when this directory (`agentic-starter-kit`) or its merged copy appears in your context.

## What this package is

A **portable baseline** for agentic software work: Cursor skills, prompt templates, and documentation that apply to **any** project stack. It was assembled from patterns used in a multi-crate agent harness workspace; content here is **generalized** (no dependency on that product’s source code).

## Authority order

1. **User or project instructions** in the active session always win.
2. **This kit** supplies defaults and process when the project has nothing better.
3. **Skills** under `.cursor/skills/` are optional overlays; load them when `description` matches the task.

## Resource index (quick)

| ID | Path | Use |
|----|------|-----|
| `skill-small-model-premium-protocol` | `.cursor/skills/small-model-premium-protocol/SKILL.md` | Enforce phased reasoning + delta summary for substantive work |
| `skill-project-agent-baseline` | `.cursor/skills/project-agent-baseline/SKILL.md` | AGENTS.md, verification, repo hygiene for any stack |
| `template-premium-protocol` | `templates/small-model-premium-protocol.md` | Human-readable protocol notes |
| `prompt-architecture-audit` | `prompts/agent-architecture-audit.md` | Structured agent-architecture interview |
| `doc-principles` | `docs/PRINCIPLES.md` | Default architectural stance |
| `template-agents-md` | `templates/AGENTS.template.md` | Copy to repo root as `AGENTS.md` |
| `doc-usage` | `docs/USAGE_SCENARIOS.md` | How humans merge this kit |
| `doc-gaps` | `docs/GAPS_AND_EXTENSIONS.md` | What is not included; how you extend |
| `doc-skill-loader-hint` | `docs/SKILL_LOADER_HINT.md` | Optional skill-ranking / context control |
| `notice` | `NOTICE.md` | Attribution when redistributing |
| `readme-human` | `README.md` | Human install overview |
| `doc-for-agents-en` | `docs/FOR_AGENTS.en.md` | Pointer to canonical English (`FOR_AGENTS.md`) for `*.en.md` conventions |
| `doc-for-agents-sv` | `docs/FOR_AGENTS.sv.md` | Swedish manifest (same resource map; English canonical for edits) |
| `cursor-rule-starter-defaults` | `.cursor/rules/agentic-starter-defaults.mdc` | `alwaysApply` rule that wires both starter skills |

**Machine-readable duplicate:** `docs/MANIFEST.json` (same resources, JSON).

## How you should use this kit

1. **Onboarding:** If the project lacks `AGENTS.md`, suggest copying `templates/AGENTS.template.md` and filling verify commands.
2. **Quality:** For non-trivial tasks, apply `small-model-premium-protocol` (internal phases + visible delta summary).
3. **Assessment:** When the user asks “are we production-ready?” or “what’s missing?”, run or adapt `prompts/agent-architecture-audit.md`.
4. **Extension:** Implement gaps listed in `GAPS_AND_EXTENSIONS.md` as small PR-sized steps; do not pretend the kit is complete.

## Do not assume

- No MCP servers, API keys, or CI configs are bundled.
- No language-specific harness (Rust/TS/Python) is required; replace verification placeholders with the project’s real commands.

## Provenance

Kit version `1.1.0`. Derived from internal project practices (skills, templates, audit prompt kit concepts); redistributed as **agnostic** starter content.
