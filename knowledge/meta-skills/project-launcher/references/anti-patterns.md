# Project-Launcher Anti-Patterns

> Classic mistakes when composing a workspace. Each one has been seen in
> practice and has a specific failure mode.

## Intake anti-patterns

| Don't | What happens | Instead |
|-------|--------------|---------|
| Ask 10 questions before starting | User gets frustrated, gives up | Max 3 questions, infer the rest |
| Accept "build an app" as concept | Workspace is useless, blueprint is vague | Require one specific sentence with a noun + verb + outcome |
| Skip `target_path` | Workspace lands wherever, gets lost | Always ask for absolute path |
| Accept `autonomous` for first-time users | Agent runs amok, burns tokens, produces rubbish | Default to `supervised` unless user specifies |

## Blueprint anti-patterns

| Don't | What happens | Instead |
|-------|--------------|---------|
| Forge a new blueprint when user provided one | Two architectures, divergent | Copy theirs; forge only if missing |
| Copy blueprint AND re-invoke `/200k-blueprint` on top | Double work, context pollution | Pick one source |
| Use a generic template as fallback | Agent builds generic project | If no blueprint, STOP and ask — don't guess architecture |

## Skill selection anti-patterns

| Don't | What happens | Instead |
|-------|--------------|---------|
| Dump every skill "just in case" | Workspace bloats, agent triggers wrong skills | Rubric-based selection + explicit user approval |
| Skip `showcase-presenter` | No honest audit, silent failures | Always include — it's core |
| Include `seo-article-audit` for a pure build | Triggers on "content" keyword | Check rubric's anti-combinations |
| Omit `test-driven-development` because "small project" | Untested code ships | Always include; TDD scales down |
| Add skills without checking they exist | Compose script fails mid-copy | Verify against `knowledge/meta-skills/` before writing selection list |

## Compose anti-patterns

| Don't | What happens | Instead |
|-------|--------------|---------|
| Overwrite an existing target directory | Destroys user's prior work | Refuse if target exists and is non-empty; require `--force` |
| Create target inside portable-kit | Workspace gets tracked in wrong repo | Refuse if target path is inside portable-kit; require path outside |
| Symlink skills on Windows | Symlinks break on git / zip / clone | Copy, not symlink, by default |
| Forget to copy protocols | Agent executes without quality gates | Always copy `small-model-premium.md` + `agent-orchestration.md` |
| Leave `[VARIABLE]` in committed templates | Agent reads placeholders as real instructions | Fail the verification step if placeholders remain |

## Phase plan anti-patterns

| Don't | What happens | Instead |
|-------|--------------|---------|
| Create 10 phases for a simple project | Agent loses thread, repeats work | 3-5 default; 2-3 for autonomous |
| Write phase 1 as "understand the problem" | Not executable | Phase 1 produces an artifact — scaffold, not reading |
| Skip phase dependencies | Later phases assume things that don't exist | Explicit `Prerequisites` section per phase |
| Put verify inline in phase file | Verify gets skipped | Separate `verify/phase-NN.sh` — executable |
| Make every phase mandatory | User can't reorder or skip | Mark optional phases as `[OPTIONAL]` |

## Handoff anti-patterns

| Don't | What happens | Instead |
|-------|--------------|---------|
| Return "workspace is ready" with no next step | User stares at folder, doesn't know what to do | Deliver exact startup prompt + path to AGENT.md |
| Claim "autonomous" when human gates exist | User expects hands-off, gets interrupted | Match handoff language to actual autonomy_level |
| Omit the time estimate | User kicks off at 11pm expecting 10 mins, takes 4 hours | Include `time_budget` from intake in the handoff |
| Skip the showcase audit guidance | Agent finishes but doesn't prove success | Tell user to run showcase-presenter at end |

## Systemic anti-patterns

| Don't | What happens | Instead |
|-------|--------------|---------|
| Use this launcher for a skill package build | Wrong tool — use `skill-forge` / `200k-pipeline` | Project-launcher is for product/codebase builds |
| Use this launcher for a research task | No code to build | Use a research skill + output to markdown |
| Launch a project before the blueprint has been reviewed | Architecture flaws get baked in | Gate: no compose until user approves ARCHITECTURE.md |
| Run this on a project that's already started | Overwrites user's work or creates confusion | Use `buildr-rescue` for existing projects; this launcher is fresh-start only |
