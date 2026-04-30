---
name: session-launcher
description: |
  The conductor skill — takes a task or project intent and produces a complete,
  copy-pasteable startup prompt for a new Codex session. Six-step process:
  INTAKE, SCAN, MATCH, GAP, COMPOSE, DELIVER. The output is a structured prompt
  block that loads the right skills, reads the right files, queues the right
  workflows, and defines quality gates — so the new session starts sharp instead
  of fumbling through discovery. Use when: starting a new Codex session for
  a known task, preparing a handoff prompt for another agent, planning which skills
  a project needs before building, or auditing whether existing skills cover a task.
  Trigger on: "launch session for", "prepare a session", "session launcher",
  "startup prompt for", "what skills do I need for", "plan a session",
  "handoff prompt", "set up a session for", "which skills should I load".
author: Robin Westerlund
version: 1.0.0
---

# Session Launcher

> Takes a task intent and produces a complete startup prompt for a new Codex
> session — right skills, right files, right workflows, right quality gates.

---

## Purpose

Without this skill, every new Codex session starts the same way: the agent
reads AGENTS.md, guesses which skills might be relevant, loads too many or too few,
and spends the first 10 messages figuring out context it should have had from the
start. Session Launcher front-loads that discovery into a structured prompt that
makes the new session productive from message one.

The output is not a plan. It is a **launch configuration** — the exact set of
instructions, skill references, file reads, and quality gates that a fresh session
needs to execute a specific task well.

---

## Audience

| Role | Use case |
|------|----------|
| Developer | Starting a focused session for a known task (build, audit, research) |
| Orchestrator agent | Preparing handoff prompts for sub-agents |
| Project lead | Auditing whether existing skills cover a task before committing |

---

## When to Use

- Starting a new Codex session for a specific task
- Preparing a handoff prompt for another agent or session
- Planning which skills a project needs before building
- Auditing skill coverage for a task category
- Setting up a multi-session workflow where each session needs different skills

## When Not to Use

| If the situation is... | Use instead | Why |
|------------------------|-------------|-----|
| The task is a single-file edit or trivial fix | Direct execution | No session setup needed for 30-second tasks |
| You need to create a new skill that doesn't exist | `skill-forge` | Forge the skill first, then launch a session using it |
| You need a full project workspace with waves | `buildr-operator` | Operator produces execution workspaces, not session prompts |
| You need to research before knowing the task | `buildr-scout` | Scout first, then launch with findings |

---

## Required Context

Gather or confirm before starting:

- **Task intent** — what does the user want to accomplish? (1-3 sentences minimum)
- **Project path** — where will the session work? (existing repo, new project, or general)
- **Constraint hints** — any known constraints (language, framework, timeline, budget)

---

## Process

### Step 1: INTAKE

**Action:** Classify the task intent and extract structured parameters.

**Task categories** (select the primary one):

| Category | Signal phrases | Typical session shape |
|----------|---------------|----------------------|
| **Build** | "build", "create", "implement", "make", "add feature" | Skills + scaffold + quality gates |
| **Audit** | "review", "audit", "check", "assess", "evaluate" | Analysis skills + checklists + report template |
| **Research** | "research", "investigate", "explore", "understand", "analyze" | Scout skills + search tools + note format |
| **Launch** | "deploy", "ship", "publish", "release", "go live" | Ops skills + verification + rollback plan |
| **Rescue** | "fix", "debug", "broken", "stuck", "rescue", "unstick" | Diagnostic skills + triage workflow |
| **Present** | "showcase", "demo", "present", "report on", "summarize" | Presentation skills + artifact gathering |

**Extract these parameters:**

```yaml
intent:
  category: build | audit | research | launch | rescue | present
  summary: "One sentence — what the user wants"
  success_criteria:
    - "Criterion 1 — how we know it's done"
    - "Criterion 2"
  anti_goals:
    - "What this session should NOT do"
  project_path: "/path/to/project"  # or "new" or "general"
  constraints:
    stack: ""        # language, framework, runtime
    timeline: ""     # urgency level
    scope: ""        # narrow, medium, broad
```

**Gate:** Do not proceed without at least: category, summary, one success criterion.
If unclear, ask the user. Do not guess intent.

---

### Step 2: SCAN

**Action:** Inventory all available skills from both locations.

**Run the scan:**

```bash
bash knowledge/meta-skills/session-launcher/scripts/scan-skills.sh
```

If the script is not available, scan manually:

1. List `~/.codex/skills/*/` — read each SKILL.md first line of description
2. List `knowledge/meta-skills/*/` — read each SKILL.md first line of description
3. List `.skills/*/` in the project directory (if it exists) — project-local skills

**Build a working catalog** with these columns:

| Skill | Location | Category | Trigger match? |
|-------|----------|----------|----------------|

Categorize each skill:

| Skill category | Description |
|----------------|-------------|
| **builder** | Creates code, projects, scaffolds |
| **analyzer** | Reviews, audits, evaluates existing work |
| **researcher** | Fetches, extracts, synthesizes external knowledge |
| **orchestrator** | Coordinates multi-step or multi-agent workflows |
| **formatter** | Produces documents, reports, presentations |
| **infra** | Deployment, hosting, CI/CD, security |
| **meta** | Creates or manages other skills |
| **context** | Memory, compression, optimization of agent context |

**Gate:** The scan must find at least 5 skills. If fewer, the skill directories
may be misconfigured — warn the user and check paths.

---

### Step 3: MATCH

**Action:** Map task needs to available skills using trigger-phrase matching.

For each skill in the catalog:

1. Read the skill's `description` field from YAML frontmatter
2. Extract its trigger phrases (the quoted phrases after "Trigger on:" or "Use when:")
3. Score relevance to the INTAKE parameters:

| Score | Meaning | Action |
|-------|---------|--------|
| **3** | Direct match — skill trigger phrases match the task | Include in prompt |
| **2** | Supporting — skill adds value but isn't the primary tool | Include if scope allows |
| **1** | Tangential — could help but not clearly needed | Omit unless gap analysis shows need |
| **0** | Irrelevant — no connection to this task | Omit |

**Selection rules:**
- Include all score-3 skills (hard requirement)
- Include score-2 skills up to a maximum of 3 additional skills
- Never include more than 6 skills total (diminishing returns past this)
- Prefer meta-skills over global skills when both cover the same capability

**Output:** Ordered list of selected skills with justification.

**Anti-pattern:** Do NOT include a skill just because it sounds useful. Every
included skill costs context window budget. If you cannot articulate why the
session needs it in one sentence, drop it.

---

### Step 4: GAP

**Action:** Identify capabilities the task needs but no existing skill provides.

Compare the task's success criteria against what the matched skills cover:

```
For each success criterion:
  - Which matched skill addresses this? → Covered
  - No skill addresses this? → GAP
  - A skill partially addresses this? → PARTIAL (note what's missing)
```

**Gap categories:**

| Gap type | Description | Resolution |
|----------|-------------|------------|
| **Forgeable** | A skill could be created for this | Include forge prompt in session startup |
| **Ad-hoc** | One-time need, not worth a skill | Include manual instructions in prompt |
| **External** | Requires a tool/API/service not available | Flag as blocker, suggest alternatives |
| **Human** | Requires human judgment or access | Flag as checkpoint, define handoff point |

**Document each gap** using `templates/gap-analysis.md`.

**Gate:** If more than 2 gaps are type "External" or "Human", warn the user that
the session may stall. Suggest breaking the task into sub-sessions.

**Anti-pattern:** Do NOT skip this step. Unknown gaps are the most dangerous —
they surface mid-session when context is already loaded and pivoting is expensive.

---

### Step 5: COMPOSE

**Action:** Build the startup prompt using `templates/startup-prompt.md`.

The prompt has these sections (all required):

#### 5a. Identity Block
State what the session is for in one sentence. Set the task category.

#### 5b. Skills to Load
List exact skill invocation commands:
```
Use /skill-name for each skill that should be loaded.
```

Only list skills that exist and were matched in Step 3. Never reference
skills you haven't confirmed exist on disk.

#### 5c. Files to Read First
List files the session should read before starting work:

| Always include | When to include |
|----------------|-----------------|
| `AGENTS.md` (project root or nearest applicable scope) | If it exists |
| Relevant `README.md` files | If working in a specific subdirectory |
| Config files (package.json, Cargo.toml, etc.) | If the task involves the project stack |

Add task-specific files based on the category:

| Category | Also read |
|----------|-----------|
| Build | Architecture docs, existing similar code, test files |
| Audit | The code/PR being audited, previous audit reports |
| Research | Previous research notes, knowledge base index |
| Rescue | Build output, error logs, CI configuration |

Maximum 8 files. Prioritize by information density.

#### 5d. Archon Workflows
If the task maps to an existing Archon workflow in `.archon/workflows/`:
```
Queue: archon run <workflow-name>
```

Only include if the workflow exists. Check `.archon/workflows/` first.

#### 5e. Skills to Forge
For each "Forgeable" gap from Step 4, include a forge prompt:
```
Before starting the main task, forge a skill for: [gap description]
Use /200k-pipeline with intent: "[one-line forge intent]"
```

Keep forge prompts minimal — the forge skill knows what to do.

#### 5f. Quality Gates
Define 2-5 verification criteria for "done":

```
Quality gates:
- [ ] [Criterion from INTAKE success_criteria]
- [ ] [Verification command or check]
```

Every gate must be verifiable — either a command that passes or a file that exists.

#### 5g. Memory/Context
If MemPalace or other memory systems are available:
```
Load context: mempalace_search "[relevant topic]"
```

If previous session notes exist:
```
Read: [path to previous session notes or handoff document]
```

**Composition rules:**
- Total prompt must be under 500 words (the reader will not read longer prompts)
- Use imperative mood ("Read X", "Load Y", "Run Z") — not suggestions
- No explanations of why — only what to do
- Skills listed by exact invocation name, not description

---

### Step 6: DELIVER

**Action:** Output the completed prompt as a copy-pasteable block.

**Format:**

```markdown
---
session: [task summary]
category: [build|audit|research|launch|rescue|present]
generated: [ISO date]
skills: [count]
gaps: [count]
---

[The composed prompt from Step 5, inside a single fenced code block]
```

**Post-delivery checklist:**
- [ ] Every referenced skill exists on disk
- [ ] Every referenced file exists on disk
- [ ] No skill appears that wasn't matched in Step 3
- [ ] Prompt is under 500 words
- [ ] At least one quality gate is defined
- [ ] Gaps are documented (even if zero)

**If the user asks for a gap report**, also output the full gap analysis from
`templates/gap-analysis.md`.

**If the user asks for a skill audit**, output the catalog from Step 2 using
`templates/skill-audit.md`.

---

## Anti-Patterns

| Anti-pattern | Why it's dangerous | What to do instead |
|--------------|-------------------|-------------------|
| Suggesting skills that don't exist | Session fails immediately on first /skill command | Verify every skill on disk before including |
| Skipping the GAP step | Unknown gaps surface mid-session, wasting context | Always run gap analysis, even if you expect zero gaps |
| Prompts over 500 words | The reader (human or agent) won't read them | Cut explanations, keep only imperatives |
| Including irrelevant skills | Each skill costs 2-8K tokens of context budget | If you can't justify it in one sentence, drop it |
| Hardcoding skill paths | Skills move between global and project-local | Use skill names, not file paths, in the prompt |
| Assuming Archon workflows exist | Not every project has .archon configured | Check disk before referencing any workflow |

---

## Output Examples

### Example: Build session

```
---
session: Build a REST API for user authentication
category: build
generated: 2026-04-13
skills: 3
gaps: 0
---
```

```
You are starting a build session for a REST API with user authentication.

Read first:
- AGENTS.md
- src/lib/auth/ (existing auth code)
- package.json

Load skills:
- /test-driven-development
- /harness-engineering
- /supabase-postgres-best-practices

Workflow: None queued.

Quality gates:
- [ ] All endpoints return correct status codes (run test suite)
- [ ] Auth middleware rejects invalid tokens (run: npm test -- --grep auth)
- [ ] Migration runs cleanly on fresh database (run: npm run db:migrate)
- [ ] AGENTS.md updated with new endpoints

No capability gaps identified.
```

### Example: Rescue session with gaps

```
---
session: Fix broken CI pipeline for Rust monorepo
category: rescue
generated: 2026-04-13
skills: 2
gaps: 1
---
```

```
You are starting a rescue session for a broken Rust monorepo CI pipeline.

Read first:
- AGENTS.md
- .github/workflows/ci.yml
- Cargo.toml (workspace root)
- Build error log (CI run #847)

Load skills:
- /repo-rescue
- /harness-engineering

Forge first:
- Forge a skill for CI pipeline debugging (GitHub Actions + Rust).
  Use /200k-pipeline with intent: "Diagnose and fix GitHub Actions CI
  for Rust workspaces — common failure modes, caching, cross-platform."

Quality gates:
- [ ] cargo build --workspace succeeds locally
- [ ] cargo test --workspace passes
- [ ] CI pipeline passes on push (verify via gh run watch)

Gap: No existing skill for GitHub Actions CI debugging (forge queued above).
```

---

## Verification

After delivering the prompt, verify:

1. **Skill existence** — For each skill listed, confirm the directory exists:
   ```bash
   ls ~/.codex/skills/[name]/SKILL.md 2>/dev/null || \
   ls ~/.claude/skills/[name]/SKILL.md 2>/dev/null || \
   ls knowledge/meta-skills/[name]/SKILL.md 2>/dev/null || \
   echo "MISSING: [name]"
   ```

2. **File existence** — For each file listed, confirm it exists:
   ```bash
   ls [path] 2>/dev/null || echo "MISSING: [path]"
   ```

3. **Word count** — Prompt body must be under 500 words:
   ```bash
   echo "[prompt]" | wc -w
   ```

If any check fails, fix the prompt before delivering.
