---
name: launch-package
description: >
  Use when a user wants to create a product launch package, build launch assets, write launch copy,
  prepare for a product launch, or generate multiple launch deliverables at once. Trigger on:
  "create a launch package", "build launch assets", "write my launch copy", "prepare for launch",
  "generate pitch deck + landing page", "full launch kit", "launch my product", "pre-launch content".
  Also use when a user needs any combination of: landing page copy, pitch deck, email sequence,
  Product Hunt listing, social media calendar, or demo script — and wants them consistent with each other.
  Produces 6 launch deliverables in a single session, all sharing a Narrative Spine for consistency.
author: Robin Westerlund
version: 1.0.0
shape: Production
---

# launch-package

Generates 6 narrative-consistent launch deliverables from a product blueprint. All assets share a
Narrative Spine — derived before any template is touched — so the landing page, emails, pitch deck,
and demo all tell the same story.

---

## Quick Reference

```
INTAKE → SPINE → GENERATE (×6) → QA → REPORT
```

| Phase | What happens | Gate |
|-------|-------------|------|
| INTAKE | Parse blueprint, validate required fields | Halt if unique_mechanism is weak or missing |
| SPINE | Derive Narrative Spine, state it to user | Wait for confirmation before generating |
| GENERATE | Fill 6 templates in canonical order | No invention of facts — use [PLACEHOLDER] if data absent |
| QA | Layer 1 (structural) + Layer 2 (narrative) | Both always run — L1 pass ≠ quality |
| REPORT | Fill launch-package-report.md | State verdict + 3 priority fixes |

---

## Phase 0: INTAKE

Parse the product blueprint. Build the input context object. Validate all required fields.

**Required fields:**

| Field | Type | Halt condition |
|-------|------|---------------|
| `product_name` | string | Empty |
| `icp` | string | Generic — "businesses", "users", "teams" without qualifier |
| `problem` | string 1–3 sentences | Feature-framed (describes missing features, not customer pain) |
| `solution` | string 1–3 sentences | Empty |
| `unique_mechanism` | string | Generic: "faster", "easier", "AI-powered", or a single adjective |
| `pricing` | string | Empty |
| `tone` | string[] 2–4 items | Fewer than 2 items |
| `launch_date` | YYYY-MM-DD | If absent: use relative dates, note limitation |

Do not invent product facts. If required fields are missing: list them, ask, wait.
Read `references/input-spec.md` for full validation rules and optional fields.

**Anti-pattern:** Proceeding past INTAKE with a weak `unique_mechanism`. This field propagates to every deliverable — a generic mechanism produces 6 deliverables of generic copy. Halt. Ask the user to sharpen it.

---

## Phase 1: SPINE

Derive the Narrative Spine before generating any deliverable.

**Derivation formulas:**

| Field | Formula |
|-------|---------|
| `hook_statement` | `[ICP] spend [X] on [problem] — and it doesn't have to be that way.` |
| `solution_promise` | `[Outcome] for [ICP] without [Obstacle]` |
| `canonical_cta` | `[Outcome verb] + [what they receive] + [optional qualifier]` — NOT "Sign up" |
| `why_now` | Use verbatim if provided; derive from category if not |

Read `references/narrative-spine.md` for full derivation rules, strong vs. weak examples, and common mistakes.

**Gate:** State the spine explicitly before generating. Ask for confirmation. Wait.

The spine is the single point of failure. A wrong spine = 6 wrong deliverables.

---

## Phase 2: GENERATE

Produce all 6 deliverables in canonical order. Copy flows forward — never backward.

**Generation order:**

| Order | Deliverable | Template | Why this position |
|-------|------------|----------|------------------|
| 1 | Landing page copy | `templates/landing-page.md` | Establishes all canonical language — longest form |
| 2 | Pitch deck outline | `templates/pitch-deck.md` | Adapts LP language to investor context |
| 3 | Email sequence | `templates/email-sequence.md` | Adapts LP language to conversation format |
| 4 | Product Hunt listing | `templates/product-hunt.md` | Distills canonical language to tightest limits |
| 5 | Social calendar | `templates/social-calendar.md` | Derives pillars from LP headlines + email subjects |
| 6 | Demo script | `templates/demo-script.md` | Uses canonical language; builds to wow moment |

**For each deliverable:**
1. Read the matching template from `templates/`
2. Fill all `[VARIABLE]` zones from the spine + input context
3. Preserve all `[FIXED]` zones exactly
4. If a data point is unavailable: mark `[TRACTION NEEDED]`, `[TESTIMONIAL NEEDED]`, etc. — never invent

Read `references/deliverable-constraints.md` for hard rules (char limits, word counts, format rules).

---

## Phase 3: QA

Run both layers. Record all results before writing the report.

### Layer 1 — Structural (12 checks, all must pass)

| # | Check | Threshold |
|---|-------|-----------|
| L1-1 | LP hero complete | headline + subheadline + CTA + social proof hook |
| L1-2 | LP benefit sections | exactly 3 sections × 3 rows |
| L1-3 | LP FAQ | 3–5 Q&A pairs |
| L1-4 | Pitch deck slides | exactly 12 |
| L1-5 | Pitch deck completeness | each slide: title + bullets + speaker note |
| L1-6 | Email count | exactly 5 |
| L1-7 | Email completeness | each email: subject + preview + body + CTA |
| L1-8 | PH character limits | tagline ≤ 60, description ≤ 260 |
| L1-9 | Social post count | 30 ± 1 |
| L1-10 | Social completeness | each post: platform + copy + visual descriptor |
| L1-11 | Social content mix | promotional posts ≤ 9 of 30 |
| L1-12 | Demo script word count | 375–525 words |

Run `scripts/validate-lengths.py --all [package-dir]` to automate L1-8, L1-11, L1-12.

### Layer 2 — Narrative (8 dimensions, judgment)

**Rating:** Strong (3) | Adequate (2) | Weak (1) | Failing (0)

| Dim | Name | Key question |
|-----|------|-------------|
| N1 | Voice Consistency | Does the same person seem to have written all 6? |
| N2 | Problem-First Framing | Do all top-of-funnel assets open on the problem, not the product? |
| N3 | Differentiation Clarity | Is unique_mechanism stated crisply and referenced (not repeated) in each deliverable? |
| N4 | Social Proof Placement | Does proof appear before every ask? |
| N5 | CTA Coherence | Do all CTAs use outcome language and point to the same action? |
| N6 | Narrative Thread | Can you trace Problem → Insight → Solution → Proof → Action through all 6? |
| N7 | ICP Specificity | Does copy speak to one specific person or to everyone? |
| N8 | Generic Language | Count: "revolutionary", "game-changing", "seamless", "robust", "powerful", "AI-powered" across all 6 |

**For every Weak or Failing dimension:** quote the specific offending line and write the specific fix. "This section could be stronger" is not permitted.

Read `references/quality-gate.md` for the full rubric with scoring guidance and examples.

---

## Phase 4: REPORT

Fill `templates/launch-package-report.md`. Include:
- Narrative Spine as confirmed
- Layer 1 table (all 12 results)
- Layer 2 table (all 8 scores + notes for Weak/Failing)
- Narrative thread (one sentence per asset)
- Placeholder inventory
- Verdict
- 3 priority fixes ordered by conversion impact

**Verdict logic:**

| Verdict | Condition |
|---------|-----------|
| LAUNCH-READY | L1: 12/12 AND L2: 0 Failing, ≤ 2 Weak |
| REVISE-THEN-LAUNCH | L1: 12/12 AND L2: 1 Failing OR 3+ Weak |
| REWORK-REQUIRED | L1: any FAIL OR L2: 2+ Failing |

---

## Anti-Patterns

| Do NOT | Instead |
|--------|---------|
| Generate deliverables without stating the spine | Derive spine, show it, get confirmation |
| Use generic copy without ICP-specific language | Every headline names the ICP's problem in their language |
| Invent traction numbers when traction field is empty | Mark `[TRACTION NEEDED]`, flag in QA report |
| Skip Layer 2 because Layer 1 passed | Both layers always run |
| Write vague QA feedback ("feels generic") | Quote specific line, name specific fix |
| Make 30 social posts that are product variations | Derive distinct content pillars from LP + email structure |
| Use "revolutionary", "game-changing", "seamless" | Flag and rewrite with specific outcomes |
| Write the demo script as a pitch | It's a narration — outcome language, show don't tell |
| Treat unique_mechanism as optional | If weak, halt at SPINE and ask user to sharpen it |
| Run GENERATE before spine is confirmed | The spine is the single point of failure |

---

## Files Reference

| File | When to read |
|------|-------------|
| `references/input-spec.md` | Validating a blueprint — required vs optional fields, validation rules |
| `references/narrative-spine.md` | Deriving the spine — formulas, examples, common mistakes |
| `references/deliverable-constraints.md` | Char limits, word counts, format rules per deliverable |
| `references/quality-gate.md` | Full Layer 1 + Layer 2 rubric with examples |
| `templates/landing-page.md` | Fixed/Variable zones for LP copy |
| `templates/pitch-deck.md` | 12-slide structure with speaker notes |
| `templates/email-sequence.md` | 5-email drip with timing, constraints, anti-patterns |
| `templates/product-hunt.md` | Tagline, description, first comment, maker comment |
| `templates/social-calendar.md` | 30-post calendar anchored to launch_date |
| `templates/demo-script.md` | 3-minute narration with Fixed structure |
| `templates/launch-package-report.md` | QA report — fill in REPORT phase |
| `scripts/validate-lengths.py` | Automate L1-8, L1-12, char limit checks |
| `evals/evals.json` | 2 regression test cases (B2B SaaS + consumer app) |
