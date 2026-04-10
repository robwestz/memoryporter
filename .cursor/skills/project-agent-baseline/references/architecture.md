# Skill architecture — `project-agent-baseline`

## Role

**Orchestration of documentation and layout**, not product logic. Ensures humans and agents share the same entrypoints.

## Typical repo layout after adoption

```text
CLAUDE.md                        # agent operations manual (read first)
AGENTS.md                        # canonical verify + rules
conventions/FOR_AGENTS.md        # kit manifest for agents
conventions/MANIFEST.json        # JSON index
conventions/PRINCIPLES.md        # design defaults
knowledge/GAPS.md                # roadmap for agents
.cursor/skills/*/SKILL.md        # Cursor behaviors
protocols/                       # quality + orchestration protocols
scaffolds/                       # project templates (Rust/TS/Python)
```

## Extension

Add a **third** skill for your domain (e.g. `mycompany-rust-service`) that only contains stack-specific paths and commands, keeping this skill generic.
