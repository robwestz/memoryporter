# Input Specification

> **When to read this:** When validating a product blueprint before running the skill — required vs optional field details, validation rules, and what to do when fields are missing.

---

## Required Fields

All required fields must be present before SPINE derivation begins. If any are missing, ask for them. Do not invent product facts.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `product_name` | string | The product's name | Non-empty |
| `icp` | string | Ideal Customer Profile — role, industry, company size. Be specific: "growth-stage B2B SaaS founders with 1–5 person teams" not "businesses" | Must include role + at least one qualifier (industry or size) |
| `problem` | string (1–3 sentences) | The pain in customer language — not how the founder describes it | Must describe consequences, not just the situation |
| `solution` | string (1–3 sentences) | What the product does — the mechanism, not the pitch | Non-empty |
| `unique_mechanism` | string | The one differentiator competitors cannot honestly claim | Cannot be "faster", "easier", "better". Must be specific. If weak, halt at SPINE and ask to sharpen. |
| `pricing` | string | Model + entry price — "freemium, $29/mo Pro" | Must include model type |
| `tone` | string[] | 2–4 voice adjectives — "direct, warm, no-jargon" | 2–4 items |
| `launch_date` | date (YYYY-MM-DD) | T-0, used to anchor the social calendar | ISO date format |

---

## Optional Fields

Each improves output quality in specific deliverables. More complete blueprints produce launch-ready output; sparse blueprints produce placeholder-heavy output.

| Field | Type | Used By | What improves |
|-------|------|---------|---------------|
| `tagline` | string | Product Hunt (starting point), Landing page hero | Reduces hallucination risk; use as anchor if provided |
| `traction` | string | Landing page social proof, Pitch deck traction slide, Email E4, Demo script | Without this, all proof sections are `[TRACTION NEEDED]` |
| `testimonials` | string[] | Landing page social proof, Email E4, Social calendar, Demo script | Specific outcome + named person beats generic quotes |
| `competitor_names` | string[] | Pitch deck competition slide | Used to populate quadrant; if absent, note "competitors not named" |
| `team_bios` | string[] | Pitch deck team slide | Format: Name, Role, one past win |
| `raise_amount` | string | Pitch deck ask slide | If absent, note `[RAISE AMOUNT NEEDED]` |
| `why_now` | string | Narrative spine, Pitch deck Why Now slide | If provided, use verbatim; otherwise derive from category context |

---

## Validation Rules

Run these checks after parsing the blueprint, before SPINE derivation.

| Check | Condition | Action |
|-------|-----------|--------|
| Unique mechanism is weak | Value is "faster", "easier", "better", "AI-powered", or a single adjective | Halt. Ask: "What does [Product] do that a direct competitor cannot honestly claim?" |
| Unique mechanism is absent | Field is empty or missing | Halt. This field propagates everywhere; without it the spine is undefined. |
| Launch date is missing | Field absent or null | Default social calendar to relative dates (T-21, T-14...). Note: "launch_date not provided — calendar uses relative dates" |
| Traction is empty | Field absent or empty | Flag in QA report: "Proof sections use `[TRACTION NEEDED]` placeholders. Replace before publishing." |
| ICP is generic | Value is "businesses", "companies", "teams", "users", or any term without a qualifier | Halt. Ask: "Who specifically experiences this problem — what role, at what type of company, and at what stage?" |
| Problem is feature-framed | Describes what the product lacks rather than what the customer suffers | Reframe: problem must describe consequences, not missing features |

---

## Blueprint Format

The skill accepts a product blueprint in any of these formats:

**YAML (preferred):**
```yaml
product_name: Acme
icp: "Growth-stage SaaS founders with 1–5 person marketing teams"
problem: "Writing launch copy takes 3–5 days and still comes out inconsistent across channels."
solution: "Acme generates a complete, narrative-consistent launch package — 6 deliverables — from a 10-field product brief."
unique_mechanism: "Narrative Spine derivation — all 6 assets share canonical language before generation begins"
pricing: "freemium, $79/mo Pro"
tone: ["direct", "no-jargon", "confident"]
launch_date: "2026-05-01"
traction: "320 beta users, 38% 7-day retention"
testimonials:
  - "Cut our launch prep from 4 days to 4 hours — Alex Chen, Head of Marketing, Linktree"
```

**Prose (acceptable):**
Free-form product description. Parse it, extract fields, and show the parsed context object before proceeding. Ask to confirm before SPINE.

**Partial input:**
If required fields are missing, list them explicitly: "To proceed, I need: [field list]. Can you fill these in?"
