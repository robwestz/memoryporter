# Portable-Kit Prompt Compiler

Meta-skill for briefing external LLMs on writing prompts that activate the
portable-kit system optimally.

## What it is

A template + rubric that another LLM (Codex, GPT, Gemini, etc.) uses to
compile a prompt you paste into Claude Code. The compiled prompt:

- Activates the correct portable-kit skills directly (no discovery fumble)
- Specifies success in testable form (artifacts, commands, behaviors)
- Plans parallelism only where branches are genuinely independent
- Mandates an adversarial pass + showcase audit + delta summary
- Produces one reusable artifact per run (skill / blueprint / workflow / memory)

## Use cases

| You want | Do this |
|----------|---------|
| A prompt you'll paste into Claude Code, drafted by GPT or another LLM | Give the other LLM `templates/meta-prompt-template.md` + `templates/rubric.md` + your task. It hands back a filled prompt. |
| Handoff instructions for a teammate running their own agent | Same — the compiled prompt travels. |
| Documentation for "how to ask Claude Code for good work" | Read `SKILL.md` and `references/why-this-works.md`. |

## Files

```
portable-kit-prompt-compiler/
├── SKILL.md                              — main spec with frontmatter
├── README.md                             — this file
├── metadata.json                         — package manifest
├── templates/
│   ├── meta-prompt-template.md           — the template with [VARIABLE] slots
│   └── rubric.md                         — fill-in rules for each field
└── references/
    └── why-this-works.md                 — the prompt-engineering theory
```

## Quick start

1. Identify the task you want Claude Code to execute.
2. Open a second LLM (any model with a reasonable context window).
3. Paste:
   - `templates/meta-prompt-template.md`
   - `templates/rubric.md`
   - Your task description (what you want Claude Code to do)
4. Ask the other LLM: *"Compile a filled prompt for Claude Code in
   portable-kit using this template and rubric. Validate every field
   against the rubric before returning."*
5. Paste the filled prompt into Claude Code.

## Why bother

See `references/why-this-works.md` for the full argument. Short version:
each template section removes a specific failure mode (discovery fumble,
routing guess, under-specification, ship-without-verify, one-shot exhaust)
that naive prompts reliably trigger.

## Relationship to other skills

| Skill | How it relates |
|-------|----------------|
| `200k-prompt-engineering` | Defines the three-layer theory this skill applies |
| `session-launcher` | Sibling — it compiles startup prompts for Claude Code sessions (self-directed). This skill compiles prompts for OTHER LLMs to deliver. |
| `showcase-presenter` | Invoked by the `QUALITY GATES` section of every compiled prompt |
| `200k-pipeline` / `skill-forge` | Common targets of compiled prompts when the task is "build a new skill or product" |
