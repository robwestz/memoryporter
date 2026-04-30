# Startup Prompt Template

> Output template for Session Launcher. Fixed zones are always present.
> Variable zones are filled from the INTAKE/MATCH/GAP/COMPOSE steps.

---

## Template

```markdown
---
session: {{SUMMARY}}
category: {{CATEGORY}}
generated: {{ISO_DATE}}
skills: {{SKILL_COUNT}}
gaps: {{GAP_COUNT}}
---
```

```
{{IDENTITY_BLOCK}}

Read first:
{{#FILES_TO_READ}}
- {{FILE_PATH}}
{{/FILES_TO_READ}}

Load skills:
{{#MATCHED_SKILLS}}
- /{{SKILL_NAME}}
{{/MATCHED_SKILLS}}

{{#IF ARCHON_WORKFLOWS}}
Workflows:
{{#ARCHON_WORKFLOWS}}
- archon run {{WORKFLOW_NAME}}
{{/ARCHON_WORKFLOWS}}
{{/IF}}

{{#IF FORGE_PROMPTS}}
Forge first:
{{#FORGE_PROMPTS}}
- {{FORGE_DESCRIPTION}}
  Use /200k-pipeline with intent: "{{FORGE_INTENT}}"
{{/FORGE_PROMPTS}}
{{/IF}}

{{#IF MEMORY_LOADS}}
Load context:
{{#MEMORY_LOADS}}
- {{MEMORY_COMMAND}}
{{/MEMORY_LOADS}}
{{/IF}}

Quality gates:
{{#QUALITY_GATES}}
- [ ] {{GATE_DESCRIPTION}}
{{/QUALITY_GATES}}

{{#IF GAPS}}
Gaps: {{GAP_SUMMARY}}
{{/IF}}
{{#IF NO_GAPS}}
No capability gaps identified.
{{/IF}}
```

---

## Zone Reference

### Fixed Zones (always present)

| Zone | Content | Max size |
|------|---------|----------|
| **Frontmatter** | Session metadata (YAML) | 6 lines |
| **Identity block** | One sentence: what this session is for | 1 sentence |
| **Files to read** | Ordered list of files to read before starting | 3-8 files |
| **Skills to load** | Exact /skill-name invocations | 1-6 skills |
| **Quality gates** | Verifiable done-criteria | 2-5 items |

### Variable Zones (present only when applicable)

| Zone | When present | Content |
|------|-------------|---------|
| **Archon workflows** | .archon/workflows/ has matching workflow | Workflow run commands |
| **Forge prompts** | GAP step found forgeable gaps | Forge instructions with intent |
| **Memory loads** | MemPalace or previous session notes exist | Search/read commands |
| **Gap summary** | Any gaps found in Step 4 | One-line summary per gap |

---

## Composition Rules

1. **Total prompt body must be under 500 words** — cut explanations, keep imperatives
2. **Imperative mood only** — "Read X", "Load Y", "Run Z" — never "You might want to..."
3. **Skills by invocation name** — `/repo-rescue`, not "the repo rescue skill"
4. **Files by exact path** — `src/lib/auth/index.ts`, not "the auth module"
5. **No rationale in the prompt** — the session doesn't need to know WHY these skills were chosen
6. **Quality gates must be verifiable** — a command that passes, a file that exists, or a test that runs
