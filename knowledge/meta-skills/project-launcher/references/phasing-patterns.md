# Phasing Patterns

> Structure the phases in `<target>/phases/`. Bad phase structure = agent
> loses thread between phases, repeats work, or skips verification.

## Phase-file anatomy

Each phase gets one file: `phases/phase-NN-<name>.md`. The file is a
self-contained executable plan — an agent should be able to resume the
project by reading only the current phase file plus AGENT.md.

Use `templates/phase-template.md` as the shape.

## Default shapes by autonomy level

### Assisted (3-5 phases, human gate between)

```
phase-01-foundation.md       Stack, scaffold, CI, env
phase-02-core-domain.md      Primary domain logic + tests
phase-03-integration.md      External APIs, DB, auth
phase-04-ui.md               UI / CLI / API surface
phase-05-ship.md             Polish, audit, deploy
```

Human reviews at each phase boundary. Good for unfamiliar or high-risk domains.

### Supervised (3-5 phases, agent continues but reports)

Same shape as assisted, but agent continues to next phase after writing a
report. No human gate; showcase-presenter at end of each phase catches drift.

### Autonomous (2-3 wide phases)

```
phase-01-build.md            Full build — scaffold + domain + surface
phase-02-verify.md           All tests, audit, deploy
```

Or three phases if deploy is complex:

```
phase-01-build.md
phase-02-integrate.md        External dependencies + integration tests
phase-03-deploy.md           Deploy + post-deploy verification
```

Fewer, wider phases because inter-phase context-switch is expensive.

## Naming convention

`phase-NN-<slug>.md` where:
- `NN` = two-digit zero-padded (`01`, `02`, ..., `12`)
- `<slug>` = 1-3 words, kebab-case, describes the phase deliverable

Good: `phase-02-auth-and-sessions.md`
Bad: `phase-02.md`, `phase-2-stuff.md`, `phase-02-phase-two.md`

## What goes in each phase file

Every phase file must answer:

| Section | Content |
|---------|---------|
| **Goal** | One imperative sentence — what deliverable exists at end |
| **Prerequisites** | Explicit list of prior phases + files that must exist |
| **Tasks** | Ordered list, each task = one agent turn ideally |
| **Verify** | Exact commands/checks that prove phase is done |
| **On failure** | What to do if Verify fails — don't leave the agent guessing |
| **Handoff to next phase** | What the next phase can assume |

## Task granularity

| Task size | Example | Right when |
|-----------|---------|-----------|
| Too small | "Create the `User` class" | Burns phase file on trivia |
| Right | "Implement user auth: signup, login, logout, session cookies, tests" | One coherent deliverable |
| Too large | "Build the entire backend" | No agent will finish this in one turn — split |

Rule: each task should produce ONE coherent deliverable verifiable in ONE `verify` command.

## Dependencies between phases

Later phases assume earlier phase output. Make the assumption explicit:

```markdown
## Prerequisites
- [Phase 01] `db/schema.sql` exists and applies cleanly
- [Phase 01] `.env.example` lists all required variables
- [Phase 02] `src/auth/*.ts` exports `signIn`, `signOut`, `session`
```

If phase N depends on something not produced by phases 1..N-1, that's a
planning bug — fix the phase plan, don't paper over it in the phase file.

## Parallelism within a phase

A phase can have parallel tasks IF:
- Tasks touch non-overlapping files
- No task reads another task's output

Mark with:

```markdown
## Tasks (can run in parallel)
  A. Implement user model (src/models/user.ts)
  B. Implement session model (src/models/session.ts)
  C. Implement auth middleware (src/middleware/auth.ts)

## Tasks (sequential after A-C)
  D. Wire models into auth flow (src/auth/index.ts)
  E. Add integration tests (tests/auth.test.ts)
```

## Verification pattern

Every phase ends with a `verify/phase-NN.sh` script. Template:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Phase NN verification
echo "=== Phase NN: <name> ==="

# Check files exist
for f in [list]; do
  [ -f "$f" ] || { echo "MISSING: $f"; exit 1; }
done

# Run phase-specific checks
[commands]

# Showcase audit
echo "=== Running showcase audit ==="
# (agent invokes showcase-presenter and captures result)

echo "=== Phase NN complete ==="
```

If verify fails, the phase is NOT done. No exceptions.

## Anti-patterns

| Don't | Why |
|-------|-----|
| Make phase 1 "plan the project" | Planning belongs in ARCHITECTURE.md, not in executable phases |
| Write phase files as narratives | Agent needs structure, not prose — use headings |
| Omit the `On failure` section | Agent gets stuck without it |
| Make phases overlap in responsibility | Creates "whose job is this" ambiguity |
| Ship verify scripts that always pass | Worse than no verify — false confidence |
