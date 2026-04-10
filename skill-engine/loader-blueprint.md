# Skill Loader Blueprint

This is the recommended behavior for the first version of a short-skill loader.

## Goal

Load a compact skill bundle, rank the most relevant candidates for a task, and return a small active set that a later agent can expand into full behavior.

## Inputs

- short explicit skills
- short implicit skills
- current task text
- optional project context tags
- optional memory signals

## Output

Return at most 3 active skills:

```json
{
  "selected": [
    {
      "name": "plan-mode",
      "kind": "implicit",
      "score": 17,
      "matched_triggers": ["plan", "architecture"]
    }
  ],
  "suppressed": ["loop", "lorem-ipsum"]
}
```

## Ranking Model

Start with:

- `priority` as the base score

Add:

- `+3` for each exact trigger match
- `+1` for each fuzzy trigger match
- `+2` if project context confirms the same domain
- `+2` if another selected skill references the same workflow family

Subtract:

- `-3` if the skill conflicts with a higher-scoring skill
- `-2` if the task looks read-only and the skill implies mutation

## Selection Rules

1. Select at most 3 skills.
2. Always keep one safety-oriented skill if one scored highly.
3. Prefer one workflow skill, one execution skill, and one verification or memory skill.
4. Avoid selecting overlapping skills with near-identical intent.

## Recommended Families

Treat these as families during deduplication:

- planning: `plan-mode`, `exit-plan-mode`, `plan-agent`
- review: `review-mode`, `security-review`, `verification-agent`, `verify`
- memory: `remember`, `memory-routing`, `session-memory`, `compact-and-continue`
- tools: `tool-selection`, `tool-permissions`, `pre-tool-hook`, `post-tool-hook`
- remote and agents: `agent-spawn`, `explore-agent`, `multi-agent`, `schedule-remote-agents`
- external capability: `mcp-discovery`, `mcp-resource-read`, `mcp-skill-builders`

## Fastest Build Order

If an agent is going to build the loader, this is the fastest useful path:

1. Parse both markdown catalogs into normalized skill records.
2. Match task text against `triggers`.
3. Rank with the simple scoring model above.
4. Return top 3 plus a short reason string.
5. Add family deduplication.
6. Add project tags and memory hints later.

## Expansion Agent Handoff

Once the loader consistently selects good short skills, a later agent should:

1. expand each high-frequency skill into a permanent full skill
2. add examples and anti-patterns
3. tighten trigger lists
4. add validation rules for conflicts and prerequisites

