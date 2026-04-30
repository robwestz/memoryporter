# Gap Analysis Template

> Document capabilities the task needs but no existing skill provides.
> One entry per gap. Fill during Step 4 (GAP) of the session-launcher process.

---

## Gap Report

**Task:** {{TASK_SUMMARY}}
**Date:** {{ISO_DATE}}
**Total gaps found:** {{GAP_COUNT}}

---

### Gap {{N}}: {{GAP_TITLE}}

| Field | Value |
|-------|-------|
| **Success criterion affected** | Which INTAKE criterion this gap blocks |
| **Gap type** | Forgeable / Ad-hoc / External / Human |
| **Description** | What capability is missing (1-2 sentences) |
| **Impact if unresolved** | What happens if the session hits this gap mid-execution |
| **Resolution** | What to do about it (see table below) |

---

## Resolution by Gap Type

| Gap type | Resolution action | Include in prompt? |
|----------|-------------------|-------------------|
| **Forgeable** | Add forge prompt to startup: "Forge a skill for [X]. Use /200k-pipeline with intent: [Y]" | Yes — in "Forge first" section |
| **Ad-hoc** | Write manual instructions directly into the prompt body (max 3 sentences) | Yes — inline in identity block |
| **External** | Flag as blocker. List alternatives if any exist. Suggest the user resolves before starting. | Yes — as warning at top of prompt |
| **Human** | Define the handoff point: what the session does before handing off, what the human does, how the session resumes. | Yes — as checkpoint in quality gates |

---

## Examples

### Forgeable gap

| Field | Value |
|-------|-------|
| **Success criterion affected** | "CI pipeline passes on push" |
| **Gap type** | Forgeable |
| **Description** | No skill for GitHub Actions CI debugging with Rust workspaces |
| **Impact if unresolved** | Session will improvise CI fixes without structured methodology |
| **Resolution** | Forge prompt: "Diagnose and fix GitHub Actions CI for Rust workspaces" |

### External gap

| Field | Value |
|-------|-------|
| **Success criterion affected** | "Production deployment verified" |
| **Gap type** | External |
| **Description** | Deployment requires AWS credentials not available in this environment |
| **Impact if unresolved** | Session cannot verify deployment — all other work is untestable |
| **Resolution** | User must configure AWS credentials before starting session |

### Human gap

| Field | Value |
|-------|-------|
| **Success criterion affected** | "Design approved by stakeholder" |
| **Gap type** | Human |
| **Description** | Design approval requires human review — cannot be automated |
| **Impact if unresolved** | Session may build to a design that gets rejected |
| **Resolution** | Checkpoint: session produces design mockup, pauses for approval, then implements |
