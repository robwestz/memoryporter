# Narrative Spine

> **When to read this:** When deriving the spine from a validated blueprint — formulas, derivation rules, examples of strong vs weak, and common mistakes that produce six wrong deliverables.

---

## Why the Spine Exists

Most AI-generated launch packages fail because deliverables are generated independently. The landing page uses different language than the email sequence, which differs from the pitch deck. There is no story — just content. The Narrative Spine is the fix: derive it once, inject it into all 6 templates.

**The spine is the single point of failure.** A wrong spine produces 6 wrong deliverables. State it explicitly before generating anything. Get user confirmation.

---

## Spine Structure

```yaml
# Narrative Spine (derived from blueprint — shown to user before GENERATE)

hook_statement: >
  [ICP] spend [time/money/effort] on [problem] — and it doesn't have to be that way.

problem_in_customer_language: >
  [The pain as the customer would say it — not how the founder describes it.
   Mirror vocabulary from reviews, support tickets, interviews if provided.]

why_now: >
  [The tailwind that makes this solvable today — tech shift, regulatory change,
   market timing, platform emergence. If provided by user, use verbatim.]

solution_promise: >
  [Outcome] for [ICP] without [obstacle]
  Formula: "[Verb] [Outcome] [Time Frame or Qualifier]"

unique_mechanism: >
  [The one thing the product does that competitors cannot honestly claim.
   Must be stated crisply — 1 sentence. Referenced in all 6 deliverables.]

proof_signals:
  - [Traction datum 1 — users, revenue, MoM growth, notable customer]
  - [Traction datum 2 — if available]
  - [Testimonial quote — specific outcome + named person + company]

canonical_cta: >
  [Outcome verb] + [what they receive] + [optional qualifier]
  Formula: "Get your first [X]" / "Ship your [X] in [timeframe]" — NOT "Sign up"

voice_adjectives:
  - [e.g., direct]
  - [e.g., technical]
  - [e.g., no-fluff]

icp_one_liner: >
  [Role] at [company type/size] who [specific behavior or struggle]
```

---

## Field Derivation Rules

### `hook_statement`

**Formula:** `[ICP] spend [X] on [problem] — and it doesn't have to be that way.`

| Ingredient | Source | Notes |
|-----------|--------|-------|
| ICP | `icp` field | Use the role, not the company type |
| X | `problem` field | Quantify: time, money, headcount, or effort |
| problem | `problem` field | Use customer language, not founder language |

**Strong:** "Growth-stage founders spend 4 days writing launch copy that still sounds inconsistent across channels — and it doesn't have to be that way."
**Weak:** "Teams struggle with marketing — and it doesn't have to be that way."

### `problem_in_customer_language`

The problem as the customer would describe it in a support ticket, forum post, or interview. Not a feature gap. A felt consequence.

**Strong:** "We'd write the landing page, then the email sequence, and they'd sound like different companies. The pitch deck was a third voice. By launch, nobody could quote what we stood for."
**Weak:** "Lack of consistent messaging across channels."

### `why_now`

The external tailwind. Look for: AI tooling shift, remote/distributed team growth, new platform (API, regulation, infrastructure), market saturation of old approach.

If the user provided `why_now`, use it verbatim. If not, derive from the product category. If genuinely unclear, mark `[WHY NOW — DERIVE OR PROVIDE]` and ask.

**Strong:** "LLMs can now generate coherent copy — but without a consistent narrative layer, they produce content without story. The tooling exists; the framework didn't."
**Weak:** "AI is becoming more important."

### `solution_promise`

**Formula:** `[Outcome] for [ICP] without [Obstacle]`

| Ingredient | Source | Constraint |
|-----------|--------|------------|
| Outcome | `solution` field | Must be a result the ICP cares about, not a feature |
| ICP | `icp` field | Shortened to role only in headline form |
| Obstacle | `problem` field | The friction the product removes |

**Strong:** "Launch-ready copy for solo founders — without the 4-day content sprint."
**Weak:** "A better way to write marketing copy."

### `unique_mechanism`

Direct copy from blueprint `unique_mechanism` field. If it reads generic ("faster", "AI-powered"), halt and ask before proceeding.

The mechanism propagates verbatim (or in adapted form) to:
- Landing page: stated in hero subheadline or How It Works
- Pitch deck: Slide 3 (Solution) and Slide 8 (Competition axes)
- Email sequence: E3 reveal body
- Product Hunt: description (plain language)
- Social calendar: feature reveal posts
- Demo script: Wow moment narration

### `proof_signals`

Populate from `traction` and `testimonials` fields. If both are absent, mark:
```
proof_signals:
  - "[TRACTION NEEDED — users, revenue, or growth rate]"
  - "[TESTIMONIAL NEEDED — specific outcome + named person + company]"
```

**Strong testimonial:** "Cut our launch prep from 4 days to 4 hours — Alex Chen, Head of Marketing, Linktree"
**Weak testimonial:** "Really helpful tool" — [user]

### `canonical_cta`

**Formula:** Outcome verb + what they receive + optional qualifier

| Pattern | Example | Anti-pattern |
|---------|---------|-------------|
| Get your first X | "Get your first launch package" | "Sign up" |
| Ship your X in Y | "Ship your launch copy in 4 hours" | "Learn more" |
| Start [outcome] today | "Start launching with confidence" | "Try it" |

The canonical CTA propagates to: LP final CTA, E5 primary CTA, PH first comment CTA, demo script CTA. All must match or be close variants.

---

## Canonical Language Flow

Once the spine is confirmed, language flows forward — never backward.

```
Spine
  └─► Landing Page (longest form — establishes all canonical phrasing)
        └─► Pitch Deck (adapts LP language to investor context; adds market/financials)
              └─► Email Sequence (adapts LP language to conversation format; drip reveals)
                    └─► Product Hunt (distills canonical language to tight char limits)
                          └─► Social Calendar (derives content pillars from LP headlines + email subjects)
                                └─► Demo Script (uses canonical language; builds to wow moment)
```

Copy flows forward. If a later deliverable needs a phrase, look upstream — do not invent new language.

---

## Common Spine Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Unique mechanism is an adjective ("faster") | Competition slide is meaningless; differentiation absent from all 6 deliverables | Halt. Ask for a mechanism — a how, not a what |
| Problem stated in feature language | Hook sounds like a product brief; no emotional resonance | Restate: what does the ICP lose, suffer, or waste? |
| CTA uses "Sign up" | Clicks are 2x lower; no specificity about what the user gets | Use outcome verb: "Get your first X" |
| Why now is vague ("AI is growing") | Pitch deck Why Now slide carries no weight | Name the specific shift: which platform, which year, which capability change |
| ICP too broad ("B2B companies") | All copy addresses no one specifically | One sentence: role + company type + one behavior |
| Spine shown but not confirmed | User may intend different mechanism; generating 6 assets on wrong foundation | Always state spine, ask for confirmation, wait |
