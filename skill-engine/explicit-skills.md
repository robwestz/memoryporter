# Explicit Skills

```yaml
---
name: batch
kind: explicit
triggers: ["batch", "bulk", "multiple", "run all"]
priority: 7
source_evidence: ["skills/bundled/batch.ts"]
---
Use when multiple similar operations need to be executed efficiently.

Rules:
- Validate inputs before starting the batch.
- Execute sequentially when dependencies exist.
- Stop and report on the first critical failure.
```

```yaml
---
name: claude-api
kind: explicit
triggers: ["api call", "external request", "claude endpoint"]
priority: 8
source_evidence: ["skills/bundled/claudeApi.ts"]
---
Use when making direct model API calls.

Rules:
- Keep the request surface minimal and explicit.
- Include structured error handling.
- Record token and latency signals when available.
```

```yaml
---
name: claude-api-content
kind: explicit
triggers: ["payload", "content blocks", "api structure"]
priority: 7
source_evidence: ["skills/bundled/claudeApiContent.ts"]
---
Use when formatting or parsing API content payloads.

Rules:
- Follow the required schema strictly.
- Sanitize inputs before wrapping them.
- Validate outputs before parsing them.
```

```yaml
---
name: claude-in-chrome
kind: explicit
triggers: ["browser", "chrome", "web testing", "ui test"]
priority: 6
source_evidence: ["skills/bundled/claudeInChrome.ts"]
---
Use when a browser environment is part of the task.

Rules:
- Prefer DOM inspection over blind clicking.
- Wait for stable selectors or network idle before acting.
- Handle popups and dialogs defensively.
```

```yaml
---
name: debug
kind: explicit
triggers: ["error", "bug", "trace", "exception", "failing"]
priority: 9
source_evidence: ["skills/bundled/debug.ts"]
---
Use when an error needs isolation and reproduction.

Rules:
- Stop feature work and switch to reproduction mode.
- Isolate the smallest failing case.
- Verify the fix against the isolated case before continuing.
```

```yaml
---
name: keybindings
kind: explicit
triggers: ["shortcut", "hotkey", "terminal speed"]
priority: 5
source_evidence: ["skills/bundled/keybindings.ts"]
---
Use when optimizing user interaction in terminal or UI surfaces.

Rules:
- Respect platform conventions.
- Avoid overriding critical system bindings.
- Show clear feedback when a binding fires.
```

```yaml
---
name: loop
kind: explicit
triggers: ["iterate", "repeat", "poll", "wait for"]
priority: 8
source_evidence: ["skills/bundled/loop.ts"]
---
Use when repeated checks or incremental refinement are required.

Rules:
- Define a clear exit condition before starting.
- Set a hard iteration cap.
- Add backoff when polling external systems.
```

```yaml
---
name: lorem-ipsum
kind: explicit
triggers: ["placeholder", "mock data", "filler text"]
priority: 4
source_evidence: ["skills/bundled/loremIpsum.ts"]
---
Use when generating placeholder content.

Rules:
- Never use sensitive or real domain data as filler.
- Mark mock content clearly.
- Match target types and rough shape.
```

```yaml
---
name: remember
kind: explicit
triggers: ["save", "note", "remember this", "keep in mind"]
priority: 9
source_evidence: ["skills/bundled/remember.ts"]
---
Use when a decision or constraint should persist.

Rules:
- Save to the correct memory scope.
- Keep the note concise and contextual.
- Make it clear what was saved.
```

```yaml
---
name: schedule-remote-agents
kind: explicit
triggers: ["deploy worker", "remote agent", "background task"]
priority: 7
source_evidence: ["skills/bundled/scheduleRemoteAgents.ts"]
---
Use when offloading work to remote or background agents.

Rules:
- Define a strict input and output contract.
- Keep the main thread non-blocking.
- Handle timeout and disconnect states cleanly.
```

```yaml
---
name: simplify
kind: explicit
triggers: ["refactor", "too complex", "reduce", "simplify"]
priority: 8
source_evidence: ["skills/bundled/simplify.ts"]
---
Use when the current solution is more complex than necessary.

Rules:
- Remove unnecessary moving parts first.
- Break large units into single-purpose pieces.
- Re-run tests before and after simplification.
```

```yaml
---
name: skillify
kind: explicit
triggers: ["save as skill", "make this a skill", "reusable"]
priority: 9
source_evidence: ["skills/bundled/skillify.ts"]
---
Use when turning a successful workflow into a reusable skill.

Rules:
- Remove project-specific hardcoding.
- Define triggers and intent explicitly.
- Attach a validation step for the new skill.
```

```yaml
---
name: stuck
kind: explicit
triggers: ["stuck", "failing again", "not working", "help"]
priority: 10
source_evidence: ["skills/bundled/stuck.ts"]
---
Use when repeated attempts are not producing progress.

Rules:
- Stop the current approach immediately.
- Summarize what failed and why.
- Propose at least two alternative strategies.
```

```yaml
---
name: update-config
kind: explicit
triggers: ["change settings", "configure", "update config"]
priority: 8
source_evidence: ["skills/bundled/updateConfig.ts"]
---
Use when modifying project or system configuration.

Rules:
- Snapshot the current state first.
- Make the minimum change that solves the task.
- Validate syntax and behavior after editing.
```

```yaml
---
name: verify
kind: explicit
triggers: ["check", "test", "verify", "are you sure"]
priority: 9
source_evidence: ["skills/bundled/verify.ts"]
---
Use when asserting that an outcome or claim is correct.

Rules:
- Run the real command or verification path.
- Check for side effects as well as the main result.
- Record the verification outcome explicitly.
```

```yaml
---
name: verify-content
kind: explicit
triggers: ["check text", "validate output", "proofread"]
priority: 7
source_evidence: ["skills/bundled/verifyContent.ts"]
---
Use when generated content must match a format or constraint.

Rules:
- Check format, shape, and length.
- Remove hallucinated or unsupported details.
- Fix minor issues directly and surface major ones.
```

```yaml
---
name: bundled-skills
kind: explicit
triggers: ["list skills", "what can you do", "bundled"]
priority: 6
source_evidence: ["skills/bundledSkills.ts"]
---
Use when the system needs a bundled capability catalog.

Rules:
- Treat bundled skills as the first registry surface.
- Do not invent missing skills.
- Expose triggers clearly when listing them.
```

```yaml
---
name: load-skills-dir
kind: explicit
triggers: ["local skills", "custom skills", "load directory"]
priority: 8
source_evidence: ["skills/loadSkillsDir.ts"]
---
Use when scanning and loading user-defined local skills.

Rules:
- Validate schema before loading.
- Let local skills override bundled ones on name collision.
- Fail softly and log invalid entries.
```

```yaml
---
name: mcp-skill-builders
kind: explicit
triggers: ["mcp", "external tools", "connect server"]
priority: 9
source_evidence: ["skills/mcpSkillBuilders.ts"]
---
Use when turning MCP capabilities into usable skills.

Rules:
- Map resources to context skills.
- Map tools to action skills.
- Verify connection state before activation.
```

```yaml
---
name: skills-index
kind: explicit
triggers: ["index", "registry", "all skills"]
priority: 5
source_evidence: ["skills/bundled/index.ts"]
---
Use when a master index of active skills is needed.

Rules:
- Keep the index sorted and deduplicated.
- Use it as the merge point for bundled and local skills.
- Refresh it after skill discovery or reload.
```

