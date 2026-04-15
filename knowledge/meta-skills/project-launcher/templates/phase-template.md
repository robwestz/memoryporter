# Phase [VARIABLE: NN] — [VARIABLE: PHASE_NAME]

> [VARIABLE: ONE_LINE_PHASE_PURPOSE]

---

## Goal

[VARIABLE: ONE_IMPERATIVE_SENTENCE — what deliverable exists when this phase is done]

Example: "Ship a working user authentication flow with signup, login, logout, and session persistence."

---

## Prerequisites

Must exist before starting this phase:

- [VARIABLE: LIST files / phases / conditions]

Example:
- [Phase 01] `package.json` exists with dependencies installed
- [Phase 01] `db/schema.sql` applies cleanly
- Environment variable `DATABASE_URL` is set

If any prerequisite is missing, do NOT start this phase. Go back to the phase that should have produced it.

---

## Tasks

### Ordered (sequential)

[VARIABLE: ORDERED_TASKS — each task = one coherent deliverable]

Example shape:
1. **Add auth models** — `src/models/user.ts`, `src/models/session.ts` with CRUD + tests
2. **Build auth endpoints** — `POST /signup`, `POST /login`, `POST /logout` in `src/api/auth.ts` with tests
3. **Add session middleware** — `src/middleware/auth.ts` attaches user to request, tests cover authenticated + unauthenticated paths
4. **Wire into app** — auth routes registered, middleware applied to protected routes

### Parallel (can run concurrently)

[VARIABLE: PARALLEL_TASKS or "none"]

Parallel only if tasks touch non-overlapping files AND don't read each other's output.

---

## Skills to invoke for this phase

[VARIABLE: SKILL_LIST — from selected skills, the ones most relevant here]

Example:
- `/test-driven-development` — for every new function
- `/code-review-checklist` — before marking a task done
- `/harness-engineering` — if structural changes

---

## Protocols

Follow `protocols/small-model-premium.md`:
- Phase 0 (silent): restate the goal + list constraints
- Phase 1: decompose into 3-7 verifiable steps
- Phase 2: execute each step with concrete artifacts
- Phase 3 (mandatory): adversarial pass
- Phase 4 (always visible): delta summary

If parallel tasks, also follow `protocols/agent-orchestration.md`.

---

## Verify

Run at end of phase:

```bash
bash verify/phase-[VARIABLE: NN].sh
```

The script must exit 0. If it fails, the phase is not done.

Additionally, invoke `/showcase-presenter` in REPORT mode on this phase:

```
/showcase-presenter report phase-[VARIABLE: NN]
```

Every capability must have an artifact on disk. `[BROKEN]` badges surface to the user.

---

## On failure

If a task fails:

1. Read the full error
2. Identify root cause (not symptom)
3. Fix in the smallest scope possible
4. Re-run the failing test/command to confirm
5. Log to `docs/discoveries.md` if the failure reveals something non-obvious

If stuck for >15 minutes of real work:

1. Write current state to `docs/sessions/session-YYYY-MM-DD-HH.md`
2. Stop
3. Report to human with: what you tried, what failed, what you think is needed

Do NOT paper over failures to make verify pass. An honest `[BROKEN]` badge is better than a false `[READY]`.

---

## Handoff to next phase

When this phase passes verify:

Next phase ([VARIABLE: NEXT_PHASE_NN]) can assume:

[VARIABLE: HANDOFF_CONTRACT — what files, interfaces, data exist]

Example:
- `src/auth/` exports `signUp`, `signIn`, `signOut`, `getSession`
- Database has `users` and `sessions` tables with seeded test data
- `docs/auth-api.md` documents the public interface

---

## Time estimate

[VARIABLE: TIME_ESTIMATE]

If the phase takes more than 2× the estimate, stop and reassess — either the phase is mis-sized (split it) or the approach is wrong (re-plan).
