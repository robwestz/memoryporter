# Stage 2: Resolve — Find or Create the Right Skill

**Input:** Intent Document (from intake)
**Output:** Candidate Skill + Resolution Decision
**Gate:** A candidate skill must exist — either found, modified, or created

## Purpose

Given a clear intent, find the skill most likely to produce correct output. The resolver searches three skill corpuses in order, scores candidates, and decides: use as-is, modify, or create new.

## Search Order

```
1. Short skills     (skill-engine/explicit-skills.md + implicit-skills.md)
     ↓ no match
2. Knowledge skills (knowledge/skills/)
     ↓ no match
3. Create new       (using skill-creator workflow)
```

Short skills are checked first because they're fast to match and cover common cases. Knowledge skills are deeper — they have implementation steps, code templates, and verification checklists. Creating new is the last resort.

## Step 1: Parse Intent into Search Terms

Extract from the Intent Document:
- **Primary triggers** — keywords from the goal (verbs + nouns)
- **Domain tags** — from project_context.stack and language
- **Constraint signals** — from anti_goals (e.g., "no new dependencies" → prefer built-in skills)
- **Complexity signal** — simple tasks need short skills, compound tasks may need knowledge skills

Example:
```
Goal: "Add a /ws endpoint to claw-gateway..."
Primary triggers: ["websocket", "endpoint", "gateway", "auth"]
Domain tags: ["rust", "axum"]
Constraint signals: ["no new deps"]
Complexity: simple
```

## Step 2: Score Short Skills

For each short skill in the corpus, compute:

```
score = priority (base)
      + 3 × exact_trigger_matches
      + 1 × fuzzy_trigger_matches
      + 2 × domain_context_match
      + 2 × workflow_family_bonus
      - 3 × conflict_with_higher_scorer
      - 2 × mutation_mismatch       (read-only task + write skill, or vice versa)
```

**Trigger matching:**
- Exact: intent trigger appears verbatim in skill's trigger list
- Fuzzy: intent trigger is a substring or synonym of a skill trigger

**Domain context:** skill's source_evidence references the same stack/framework as project_context

**Workflow family bonus:** if another already-selected skill is in the same family (planning, review, memory, tools, agents, external), +2 to related skills

**Family deduplication:** max 1 skill per family unless the intent explicitly requires multiple (e.g., "plan then verify" → planning + review)

## Step 3: Score Knowledge Skills

If no short skill scores > 12, or if complexity is compound/orchestration, also search knowledge skills:

For each knowledge skill (`knowledge/skills/skill_*.md`):
- Read the `trigger` field from frontmatter
- Read the `When to Use` section
- Score based on semantic match to the intent's goal and success criteria
- Bonus: +5 if the skill's verification checklist overlaps with intent's success criteria

Knowledge skills have deeper implementation guidance but are heavier to adapt. Prefer short skills for simple tasks.

## Step 4: Make the Resolution Decision

| Condition | Decision | What happens |
|-----------|----------|-------------|
| Top scorer > 15 and coverage looks complete | **USE_EXISTING** | Skill goes directly to eval |
| Top scorer 8-15, partial match | **MODIFY_EXISTING** | Skill goes to eval with modification notes |
| Top scorer < 8 or no match | **CREATE_NEW** | Create via skill-creator workflow |
| Improvement map from failed eval | **RESOLVE_WITH_CONTEXT** | Re-score with improvement map as additional signal |

### USE_EXISTING

```yaml
resolution:
  decision: USE_EXISTING
  candidate:
    name: "skill-name"
    source: "short-skill | knowledge-skill"
    score: 17
    matched_triggers: ["websocket", "endpoint"]
  reason: "Exact trigger match on 2 terms, domain context confirmed"
```

### MODIFY_EXISTING

```yaml
resolution:
  decision: MODIFY_EXISTING
  candidate:
    name: "skill-name"
    source: "knowledge-skill"
    score: 11
    matched_triggers: ["endpoint"]
  modifications_needed:
    - "Add WebSocket-specific steps (skill covers REST only)"
    - "Add auth verification step (skill has no auth coverage)"
  reason: "Good base pattern but missing WebSocket and auth specifics"
```

### CREATE_NEW

```yaml
resolution:
  decision: CREATE_NEW
  closest_candidates:
    - { name: "skill-name", score: 5, gap: "entirely different domain" }
  intent_summary: "Need a skill for WebSocket endpoint with auth on axum"
  suggested_references:
    - "gc_generic_runtime.md — trait patterns"
    - "gc_session_snapshot.md — connection state"
  reason: "No existing skill covers WebSocket server implementation"
```

### RESOLVE_WITH_CONTEXT (from eval loop-back)

When the eval stage returns a failed verdict with an improvement map, the resolver receives it as additional context:

```yaml
resolution:
  decision: RESOLVE_WITH_CONTEXT
  previous_candidate: "skill-name"
  improvement_map:
    - gap: "No auth step"
      severity: "critical"
      suggestion: "Add query-param extraction before upgrade"
  action: "Re-search with 'auth' + 'query param' as mandatory triggers"
```

The resolver then re-runs scoring with the improvement map's suggestions weighted +5 each.

## Step 5: Create New Skill (when needed)

If decision is CREATE_NEW, follow this abbreviated creation flow (full workflow in `../skill-creator/SKILL.md`):

1. **Name:** kebab-case from intent goal keywords
2. **Triggers:** extract 3-5 from intent primary triggers
3. **Priority:** 7 (default for new task-specific skills)
4. **Kind:** explicit (it's being deliberately created)
5. **Rules:** derive from intent success criteria — each criterion becomes an imperative rule
6. **Source evidence:** point to the Intent Document

Format as short skill first (per `skill-spec.md`). The eval stage will determine if it needs expansion into a full skill.

```yaml
---
name: websocket-gateway-endpoint
kind: explicit
triggers: ["websocket", "ws endpoint", "realtime", "gateway ws"]
priority: 7
source_evidence: ["intent-document: Add /ws endpoint to claw-gateway"]
---
Use when adding WebSocket support to an HTTP gateway.

Rules:
- Implement upgrade handler with authentication before connection.
- Use JSON message protocol with typed message enums.
- Clean up connection state on disconnect.
- Add integration tests for connect, auth-fail, and message exchange.
```

## Output

The resolver produces:
1. **Resolution Decision** (YAML block above)
2. **Candidate Skill** (either a reference to an existing skill, or a newly written short skill)
3. **Suppressed Skills** (skills that scored well but were deduplicated or conflict-removed)

All three are passed to the eval stage.
