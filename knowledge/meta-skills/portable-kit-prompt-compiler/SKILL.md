---
name: portable-kit-prompt-compiler
description: |
  Meta-skill for briefing external LLMs (GPT-5, Gemini, Codex, etc.) on how to
  write prompts that activate the portable-kit system optimally and produce
  200k+ output. Outputs a copy-pasteable template + rubric that the external
  LLM fills in with the user's specific task. Use when: a prompt needs to be
  drafted for another model; handing off work to a non-Claude-Code agent;
  asking "how should I phrase this to get the best result"; or when you want
  a prompt that leverages parallelism, verify-iterate, and compounding
  artifacts rather than single-shot output.
  Trigger on: "write a prompt for another LLM", "brief Codex", "handoff to
  GPT", "prompt compiler", "how do I phrase this for Claude Code", "template
  for agent instructions", "cross-LLM prompt", "external agent prompt".
author: Robin Westerlund
version: 1.0.0
---

# Portable-Kit Prompt Compiler

> Produce prompts that an external LLM gives to Claude Code. The output
> activates portable-kit skills, runs parallel where possible, verifies
> itself, and produces artifacts future sessions can reuse.

## Purpose

Portable-kit is powerful, but a naive prompt ("build X") wastes most of it —
the agent fumbles through discovery, misses parallelism, skips verification,
and produces output nothing can reuse. This skill compiles prompts that
short-circuit the fumble.

Two use cases:

| Scenario | What this skill produces |
|----------|--------------------------|
| You're drafting a prompt for another LLM (Codex, GPT, Gemini) to hand to Claude Code later | A **filled template** with the task plugged in |
| Another LLM needs to know how to write prompts to Claude Code in portable-kit | The **template + rubric** as reference material it can read |

## The three levers

Claude Code produces 200k-class output when the prompt activates all three
layers. Beyond 200k requires two more levers stacked on top.

| Layer / Lever | What it does | Where in the template |
|---------------|--------------|------------------------|
| **L1 — Prompt** | Imperative, testable, anti-patterns stated | `INTENT` + `CONSTRAINTS` |
| **L2 — Context** | Staged boot, minimum viable tools | `CONTEXT TO LOAD` + `SKILLS TO ACTIVATE` |
| **L3 — Workflow** | DAG shape, parallelism, gates | `WORKFLOW SHAPE` |
| **+ Verify-iterate** | Adversarial pass, showcase audit | `QUALITY GATES` |
| **+ Compounding** | Each run produces reusable artifact | `COMPOUNDING` |

Drop any one lever → output drops a tier. All five stacked → output exceeds
what a single 200k-class run can do, because future sessions inherit the work.

## How to use (as Claude Code)

1. Read the user's actual task
2. Open `templates/meta-prompt-template.md` and `templates/rubric.md`
3. Fill every `[VARIABLE]` based on the rubric — specific, testable, named
4. Deliver the filled template to the user as a code block they can copy

Anti-patterns:

| Do NOT | Why it fails |
|--------|--------------|
| Leave `[VARIABLE]` placeholders in the output | User has to guess what you meant |
| Invent skills that don't exist | Prompt fails on first routing step |
| Use "parallel" when branches share state | False parallelism = worse than sequential |
| Skip `COMPOUNDING` because task seems one-shot | Misses the 200k+ lever |
| Pad `Anti-goals` with generic "don't do bad work" | Only concrete anti-goals prevent drift |

## How to use (as external LLM)

Another LLM reads this skill and the two template files to learn how to
write prompts that Claude Code in portable-kit executes well. The rubric
in `templates/rubric.md` defines exactly what counts as a valid field value.

## Decision table — when to deploy which workflow shape

| Task characteristic | Shape | Template value |
|---------------------|-------|----------------|
| Single agent, sequential steps | `linear` | Most tasks |
| 2-4 independent research branches → synthesis | `parallel fan-out` | Research-heavy |
| Long-running autonomous build with no human mid-loop | `Archon DAG` | Night project |
| Iterative refinement to a quality bar | `self-looping` | Forge a skill |

## Testable success criteria for the compiled prompt

Before delivering, verify:

- [ ] Every `[VARIABLE]` filled with a concrete value
- [ ] `Success looks like` lists 3 artifacts-on-disk or runnable commands
- [ ] `SKILLS TO ACTIVATE` names exist in portable-kit (check `knowledge/meta-skills/` or `skill-engine/explicit-skills.md`)
- [ ] `WORKFLOW SHAPE` matches the decision table above
- [ ] `COMPOUNDING` names one specific reusable artifact
- [ ] All three quality gates present — adversarial + audit + delta

## Files in this skill

| File | Role |
|------|------|
| `SKILL.md` | This file — the spec |
| `templates/meta-prompt-template.md` | The raw template with `[VARIABLE]` slots |
| `templates/rubric.md` | Fill-in rules for each field |
| `references/why-this-works.md` | The prompt-engineering theory behind the levers |
| `README.md` | External-facing one-page explanation |

## Integration

| Skill | Relationship |
|-------|--------------|
| `200k-prompt-engineering` | Defines L1/L2/L3 layers — this skill APPLIES them |
| `session-launcher` | Sibling: session-launcher produces startup prompts for Claude Code to use on itself; this skill produces prompts for OTHER LLMs to hand to Claude Code |
| `showcase-presenter` | Invoked by the `QUALITY GATES` step in compiled prompts |
| `200k-pipeline` / `skill-forge` | Often the target of compiled prompts (when task is "build a new skill") |
