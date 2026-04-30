---
name: 200k-prompt-engineering
description: |
  The engineering skill behind every 200k-class output. Three layers:
  prompt engineering (writing instructions), context engineering (designing
  what agents know), and agentic workflow engineering (designing how agents
  work autonomously). Use when writing system prompts, SKILL.md files,
  CLAUDE.md files, agent instructions, MCP configurations, Archon workflows,
  or any artifact that controls agent behavior. Trigger on: "write a prompt",
  "design the context", "create a workflow", "improve this skill",
  "optimize the instructions", "agent architecture", "context window design",
  "prompt engineering", "how should the agent think about this".
author: Robin Westerlund
version: 1.0.0
---

# 200k Prompt Engineering

> The skill that makes other skills work. Write prompts that produce
> consistent, measurable, 200k-class output — every time, any agent.

## Purpose

After blueprint (what to build) and pipeline (how to create skills), this
is the third pillar: **how to engineer the instructions that control agents.**

Three layers, one decision tree:

```
What are you engineering?
│
├── The WORDS an agent reads?
│   └── Layer 1: PROMPT ENGINEERING
│       System prompts, SKILL.md, CLAUDE.md, user instructions
│
├── The KNOWLEDGE an agent has access to?
│   └── Layer 2: CONTEXT ENGINEERING
│       Memory tiers, boot sequences, tool pools, knowledge bases
│
└── The STEPS an agent executes autonomously?
    └── Layer 3: AGENTIC WORKFLOW ENGINEERING
        DAG design, node types, approval gates, error recovery
```

Most tasks touch all three layers. The decision tree determines where to START.

---

## Layer 1: PROMPT ENGINEERING

**What you're controlling:** The literal text an agent reads before acting.

### The 7 Rules

| # | Rule | Why | Anti-pattern |
|---|------|-----|-------------|
| 1 | **Imperative form** | "Read the file" not "You should read the file" | Passive voice adds words without adding clarity |
| 2 | **Tables over prose** | 3+ parallel items with shared attributes → table | Paragraphs listing options are 10x slower to parse |
| 3 | **Front-loaded value** | Most important content first in every section | Burying the key insight in paragraph 3 |
| 4 | **Anti-patterns stated** | Every major section: what NOT to do | Describing only the happy path |
| 5 | **Decision tables** | If/Then/Because for every choice point | "Use your best judgment" |
| 6 | **Testable rules** | "Produce a 3-step outline before code" | "Think carefully about structure" |
| 7 | **Progressive disclosure** | Metadata ~100 words, body < 500 lines, refs unlimited | Dumping everything in one file |

### Trigger Optimization

The `description` field in SKILL.md frontmatter is the PRIMARY triggering mechanism.

| Pattern | Effect | Example |
|---------|--------|---------|
| Include action verbs | Agent recognizes intent faster | "Use when reviewing PRs, auditing code, checking quality" |
| Be "pushy" | Agent triggers when it SHOULD, not just when explicitly asked | "Also use when the user mentions code quality, even without saying 'review'" |
| List trigger phrases | Direct keyword matching | "Trigger on: 'review', 'audit', 'check', 'PR'" |
| State negative triggers | Prevents false activation | "NOT for: general questions, architecture design" |

**Anti-pattern:** A description that only says what the skill IS without saying WHEN to use it.

### Fixed/Variable Zone Pattern

Every template, every SKILL.md section, every output format:

```markdown
<!-- [FIXED] This structure never changes -->
# [VARIABLE: Title]

> [VARIABLE: One-liner]

<!-- [VARIABLE] Content sections below -->

<!-- [FIXED] Verification section always last -->
## Verification
```

FIXED zones = consistency between uses. VARIABLE zones = customization per use.
An agent reading the template knows EXACTLY what to keep and what to replace.

### Prompt Quality Gate (from skill-forge)

Before shipping any prompt/skill/instruction:

- [ ] Description >= 50 chars with trigger phrases
- [ ] Imperative form throughout (0 instances of "you should")
- [ ] Tables used where 3+ parallel items exist
- [ ] At least 1 anti-pattern per major section
- [ ] First section delivers standalone value
- [ ] Every decision point has a decision table
- [ ] < 500 lines (references for depth)

---

## Layer 2: CONTEXT ENGINEERING

**What you're controlling:** What the agent knows and when it knows it.

### The Memory Tier Model

| Tier | What | Size | When loaded | Source |
|------|------|------|-------------|--------|
| **L0** | Identity | ~50 tokens | Always | `identity.txt`, CLAUDE.md first line |
| **L1** | Critical facts | ~120 tokens | Always | Auto-generated from palace/project |
| **L2** | Topic recall | On demand | When topic surfaces | MemPalace search, file reads |
| **L3** | Deep search | Unlimited | Explicit query | Semantic search, web search |

**Rule:** Load L0+L1 at boot (~170 tokens). Search L2-L3 only when needed.
A context window stuffed with L3 data from boot is SLOWER than one that searches on demand.

### Staged Boot Sequence

```
Session start
│
├── 1. Read CLAUDE.md (L0+L1 — who am I, what project is this)
├── 2. Read AGENTS.md (verify commands, stack, rules)
├── 3. Call mempalace_status (L1 — palace overview + protocol)
├── 4. Scan INDEX.md (L2 — what knowledge exists)
├── 5. Check .skills/ (L2 — what project-local skills are available)
├── 6. Check active tasks (L2 — is there ongoing work?)
│
└── READY — agent has enough context to route any request
    L3 is searched only when a specific question requires it
```

### Tool Pool Assembly

| Principle | Rule |
|-----------|------|
| **Minimum viable tools** | Load only tools needed for the current task |
| **MCP server selection** | Connect servers relevant to the project, not all available |
| **Progressive tool loading** | Start with read-only tools, escalate to write when needed |
| **Tool descriptions matter** | Agent uses tool descriptions to decide when to call them |

**Anti-pattern:** Loading 50 MCP tools at session start "just in case." Each tool
description consumes context tokens and adds decision overhead.

### Knowledge Base Design

| If the knowledge is... | Store it as... | Load it when... |
|------------------------|---------------|-----------------|
| Always needed (identity, rules) | CLAUDE.md / L0-L1 | Every session |
| Sometimes needed (domain facts) | knowledge/ markdown files | Topic surfaces |
| Rarely needed (deep reference) | MemPalace drawers / web | Explicit query |
| Generated per session | .tmp/ or docs/ | Never pre-load |

---

## Layer 3: AGENTIC WORKFLOW ENGINEERING

**What you're controlling:** How an agent executes multi-step work autonomously.

### DAG Design (Archon Format)

```yaml
name: my-workflow
description: What this workflow does
provider: claude
model: sonnet

nodes:
  - id: first-node
    prompt: "Inline AI prompt"

  - id: parallel-a
    depends_on: [first-node]
    prompt: "Runs alongside parallel-b"

  - id: parallel-b
    depends_on: [first-node]
    bash: "echo 'deterministic step'"

  - id: join
    depends_on: [parallel-a, parallel-b]
    loop:
      prompt: "Iterate until done: <promise>COMPLETE</promise>"
      until: COMPLETE
      max_iterations: 5
      fresh_context: true
```

### Node Type Decision Table

| If the step... | Use node type... | Because... |
|---------------|-----------------|------------|
| Requires AI reasoning | `prompt:` | AI fills in intelligence |
| Is purely mechanical (git, build, test) | `bash:` | Deterministic, no AI cost |
| Requires iteration until success | `loop:` | Agent retries with context |
| Loads a pre-written instruction file | `command:` | Separates prompt from workflow |
| Requires human approval | `loop: { interactive: true }` | Pauses for input |

### Key Design Decisions

| Decision | Options | Recommendation |
|----------|---------|---------------|
| **fresh_context per iteration** | `true` (clean slate) vs `false` (carry forward) | `true` for long loops — prevents context pollution |
| **Parallel vs sequential** | Nodes without deps run concurrently | Parallelize independent work (research + scaffold) |
| **Human gates** | `interactive: true` on loop nodes | Add before irreversible actions (push, deploy, publish) |
| **Error recovery** | `trigger_rule: all_done` on join nodes | Continue even if one branch fails |
| **Model selection** | `model: sonnet` vs `opus` vs `haiku` | Sonnet for most; Haiku for classification; Opus for complex reasoning |

### Workflow Quality Checklist

- [ ] Every node has a clear single responsibility
- [ ] No node exceeds 3 paragraphs of prompt (use `command:` files for long prompts)
- [ ] Independent nodes are parallel (no false dependencies)
- [ ] At least one verification node after any build/write step
- [ ] `max_iterations` set on all loop nodes (prevent infinite loops)
- [ ] `bash:` nodes have `timeout:` (prevent hung processes)
- [ ] Human approval gate before pushing to remote or deploying

### Anti-patterns

| Do NOT | What happens | Instead |
|--------|-------------|---------|
| Put all logic in one giant prompt node | Agent loses focus after 3 paragraphs | Split into focused nodes with `depends_on` |
| Use `prompt:` for deterministic steps | Wastes tokens, introduces variance | Use `bash:` for build/test/git operations |
| Skip `fresh_context: true` on long loops | Context accumulates garbage from prior iterations | Fresh context = clean reasoning each time |
| Omit `max_iterations` | Loop runs forever on stuck tasks | Always cap: 5 for build, 10 for implement, 3 for review |
| Depend on output format from AI nodes | AI output varies between runs | Use `output_format:` (JSON schema) for structured data |
| Skip verification after build steps | Broken code propagates to downstream nodes | Add `bash: "npm run build"` or equivalent between steps |

---

## The Decision Tree — What Kind of Engineering?

```
You need to improve agent output quality.
│
├── The output FORMAT is wrong (inconsistent, unstructured)?
│   └── Layer 1: Fix the PROMPT
│       Add Fixed/Variable zones. Add output templates. Add decision tables.
│
├── The agent DOESN'T KNOW enough (missing facts, wrong assumptions)?
│   └── Layer 2: Fix the CONTEXT
│       Add to L1 boot. Create knowledge files. Configure MemPalace search.
│
├── The agent STOPS or FAILS mid-task (loses focus, forgets steps)?
│   └── Layer 3: Fix the WORKFLOW
│       Split into DAG nodes. Add fresh_context. Add verification steps.
│
├── The output is MEDIOCRE (correct but not impressive)?
│   └── All three layers:
│       L1: Add anti-patterns + quality markers to prompt
│       L2: Add domain expertise to context (examples, reference articles)
│       L3: Add review/polish node to workflow
│
└── Not sure what's wrong?
    └── Read the output. Find the FIRST point where quality drops.
        That point tells you which layer to fix.
```

---

## Integration with 200k System

| Component | How this skill connects |
|-----------|----------------------|
| **skill-forge** | This skill's Layer 1 rules are WHAT skill-forge enforces during AUTHOR |
| **200k-blueprint** | Blueprint output feeds into Layer 3 (workflow design for the product) |
| **quality-gate** | The 66-item checklist IS a Layer 1 artifact — produced by prompt engineering |
| **MemPalace** | Layer 2's memory tier model IS MemPalace's architecture (L0-L3) |
| **Archon** | Layer 3's DAG format IS Archon's workflow format |
| **knowledge/gamechangers/** | Layer 2 domain knowledge — 15 architecture insights |
| **skill-engine** | Layer 1 trigger optimization feeds the resolver's ranking model |

---

## Quick Reference

```
LAYER 1 (Prompt):    Imperative form · Tables > prose · Front-loaded value
                     Anti-patterns stated · Decision tables · Testable rules
                     Progressive disclosure · Fixed/Variable zones

LAYER 2 (Context):   L0-L3 memory tiers · Staged boot · Minimum tools
                     Knowledge base design · Search > preload

LAYER 3 (Workflow):  DAG nodes · prompt/bash/loop/command types
                     fresh_context on loops · Parallel independents
                     Human gates · Verification after build · max_iterations

DECISION:            Wrong format? → Fix prompt
                     Missing knowledge? → Fix context
                     Stops/fails? → Fix workflow
                     Mediocre? → Fix all three
```

---

## Notes

- This skill is the ENGINEERING discipline behind the 200k system
- It does not replace skill-forge (which handles packaging) or 200k-blueprint (which handles product design)
- It is the quality layer that makes both of those produce better output
- Apply Layer 1 rules to EVERY prompt you write, even quick ones
- Apply Layer 2 design to EVERY project CLAUDE.md
- Apply Layer 3 patterns to any task with more than 3 steps
