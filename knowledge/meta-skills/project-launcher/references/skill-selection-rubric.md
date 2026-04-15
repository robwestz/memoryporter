# Skill Selection Rubric

> Map project type to the skill set needed for an autonomous build.
> Used by project-launcher Step 3. Agent shows the user this list and
> gets approval BEFORE compose.

## Always include (core set)

Every project gets these, regardless of type:

| Skill | Why |
|-------|-----|
| `200k-prompt-engineering` | Agent reads this before writing any instructions or docs |
| `showcase-presenter` | End-phase audit — never optional |
| `code-review-checklist` | Verifies code quality before phase completion |
| `test-driven-development` | Test-first ensures features actually work |

## Core set + project type additions

### Web frontend (landing page, marketing site, SPA)

| Skill | Why |
|-------|-----|
| `ui-ux-pro-max` | Design system, components, styles |
| `spec-to-app` | Turns spec into built app |
| `polish` | Pre-launch quality pass |
| `critique` | UX evaluation |

### Full-stack web app (with backend)

| Skill | Why |
|-------|-----|
| Everything from "Web frontend" | Frontend still exists |
| `supabase-postgres-best-practices` | If Postgres in stack |
| `harness-engineering` | Structures the repo for agent work |

### Backend API / microservice (no UI)

| Skill | Why |
|-------|-----|
| `harness-engineering` | Agent-first repo structure |
| `supabase-postgres-best-practices` | If Postgres in stack |
| `security-review` | API surface attacks |

### CLI tool

| Skill | Why |
|-------|-----|
| `harness-engineering` | Repo structure |
| `tool-design` | Command surface, flags, output format |

### Content / SEO site

| Skill | Why |
|-------|-----|
| `seo-article-audit` | Ship-gate before content goes live |
| `market-intelligence-report` | Competitive landscape per topic |
| `ui-ux-pro-max` | Site shell design |
| `source-grounding` | Claims need citations |

### AI agent / agentic system

| Skill | Why |
|-------|-----|
| `harness-engineering` | Agent repos need specific structure |
| `agent-evaluation` | Agents must be evaluated |
| `memory-systems` | Persistent state |
| `multi-agent-patterns` | Coordination patterns |
| `context-engineering-collection` | Context window design |

### Skill package (producing new skills)

| Skill | Why |
|-------|-----|
| `skill-forge` | Primary |
| `200k-pipeline` | Master skill for pipeline runs |
| `advanced-evaluation` | Skills need evaluation |

### Data pipeline / ETL / ML

| Skill | Why |
|-------|-----|
| `project-development` | LLM project architecture |
| `evaluation` | Quality gates for output |
| `advanced-evaluation` | Rubrics |

### Research / analysis project

| Skill | Why |
|-------|-----|
| `last30days` | Recency research |
| `market-intelligence-report` | Structured competitive analysis |
| `source-grounding` | Every claim cited |

## Conditional additions (driven by project specifics)

| If the project... | Add |
|-------------------|-----|
| Will self-host on a cloud server | `secure-linux-web-hosting` |
| Is self-hosting OpenClaw or similar | `openclaw-secure-linux-cloud` |
| Needs to analyze existing stuck code mid-build | `buildr-rescue` |
| Needs to extract knowledge from docs/URLs | `buildr-scout` |
| Will use Claude API directly | `claude-api` |
| Will build background/hosted agents | `hosted-agents` |
| Needs a status/dashboard view | `ui-ux-pro-max` + specific dashboard subskill |

## Anti-combinations

Skills that fight each other — pick one:

| Skill A | Skill B | Pick based on |
|---------|---------|---------------|
| `buildr-operator` | `project-launcher` | Pick project-launcher if in portable-kit world; buildr if in Buildr world. Never both. |
| `seo-article-audit` | `market-intelligence-report` for a pure build project | Neither — these belong on content projects, not build projects. |
| `gsd:*` | This launcher's phase plan | Pick one phase system; mixing creates conflicting state. |
| `agent-framework` (`.agent/` folder) | This launcher's workspace | Same — pick one. |

## Approval checkpoint

Before compose, present the user:

```
Project: <name>
Type: <project_type>
Skills selected (N total):
  Core: 200k-prompt-engineering, showcase-presenter, code-review-checklist, test-driven-development
  Type-specific: [list]
  Conditional: [list]

Approve? (edit / remove / add / confirm)
```

If user removes a core skill, warn but allow — respect explicit override. If user adds a skill, verify it exists in `knowledge/meta-skills/` OR `skill-engine/explicit-skills.md` before adding.
