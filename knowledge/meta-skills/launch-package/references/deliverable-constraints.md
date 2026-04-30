# Deliverable Constraints

> **When to read this:** When generating any deliverable — hard rules on character limits, word counts, format requirements, and per-field constraints. Reference validate-lengths.py for automated enforcement.

---

## Landing Page Copy

| Element | Constraint | Notes |
|---------|------------|-------|
| Headline | ≤ 12 words | Formula: Verb + Outcome + Qualifier |
| Subheadline | ≤ 25 words | One sentence. Must include a number or outcome. |
| Social proof hook | ≤ 8 words | "Trusted by 4,200+ teams" or star rating + count |
| CTA button text | 2–5 words | Outcome language, action verb. No "Sign up" or "Learn more". |
| Each benefit statement | ≤ 12 words | Lead with outcome, not feature name |
| FAQ answers | 2–4 sentences each | Answer the objection directly before explaining |
| Benefit sections | Exactly 3 sections, 3 rows each | 9 benefits total — three clusters of value |
| FAQ count | 3–5 Q&A pairs | Q1 pricing, Q2 security/trust, Q3 fit; Q4–5 optional |

**Anti-patterns:**
- Headline that names the product: "Introducing Acme for teams" — headlines name outcomes, not products
- Subheadline that repeats the headline in different words — it must add specificity
- CTA that uses friction language: "Request a demo", "Contact sales" — for self-serve products

---

## Pitch Deck Outline

| Element | Constraint | Notes |
|---------|------------|-------|
| Slide count | Exactly 12 | See slide structure in SKILL.md §2 |
| Per-slide bullets | 3–5 bullet points | One idea per bullet. No full sentences. |
| Per-slide speaker note | ≤ 3 sentences | The key insight — what the audience should take away |
| Competition axes | Must derive from unique_mechanism | Not "price vs. features" — name the actual dimensions |
| Traction numbers | No invention | If traction field empty, mark `[TRACTION NEEDED]` explicitly |
| Raise amount | Investor-grade format | "$X seed / pre-seed for [milestone 1], [milestone 2], [milestone 3]" |
| Vision statement | ≤ 10 words | The 10-year ambition — not the product benefit |

**Anti-patterns:**
- Generic competition axes: "easy vs. hard", "cheap vs. expensive" — define the game by the mechanism
- Traction slide with invented numbers — mark placeholder, flag in QA
- Problem slide that describes the product category rather than customer pain

---

## Email Launch Sequence

| Email | Timing | Subject line | Preview text | Body | CTA |
|-------|--------|--------------|--------------|------|-----|
| E1 — Teaser | T-14 days | ≤ 40 chars; no product name | ≤ 90 chars | 150–300 words | 2–5 words |
| E2 — Agitation | T-10 days | ≤ 40 chars; no product name | ≤ 90 chars | 150–300 words | 2–5 words |
| E3 — Reveal | T-7 days | ≤ 40 chars | ≤ 90 chars | 150–300 words | 2–5 words |
| E4 — Proof | T-3 days | ≤ 40 chars | ≤ 90 chars | 150–300 words | 2–5 words |
| E5 — Launch | T-0 | ≤ 40 chars | ≤ 90 chars | 150–300 words | 2–5 words |

**Per-email rules:**

| Rule | Details |
|------|---------|
| Opening line | Cannot start with "I" or the product name |
| E1 and E2 | Product name must NOT appear anywhere |
| E4 | Must include a quoted testimonial — if none available, mark `[TESTIMONIAL NEEDED]` |
| E5 | Early-bird offer must have explicit expiry — "until Friday, May 3" not "limited time" |
| All CTAs | Outcome language — "Get your first X" not "Sign up" |
| P.S. line | Optional but recommended for E1, E3, E5 |

**Validated by `scripts/validate-lengths.py`:**
- Subject line ≤ 40 characters
- Preview text ≤ 90 characters

---

## Product Hunt Listing

| Element | Constraint | Notes |
|---------|------------|-------|
| Tagline | ≤ 60 characters | Validated by validate-lengths.py |
| Description | ≤ 260 characters | Validated by validate-lengths.py |
| First comment | 150–250 words | Conversational, first-person, no marketing speak |
| Maker comment | 2–3 sentences | Thank-you + one specific question — not generic "thanks!" |

**Tagline formula:** `[Outcome verb] [what] for [ICP] without [friction]`

**Anti-patterns (flag and rewrite if found):**
- Tagline starts with product name
- Tagline contains: "AI-powered", "revolutionary", "game-changing", "seamless", "robust"
- Description misses the unique_mechanism
- First comment reads like a press release — must be personal, founder-voice

---

## Social Media Calendar

| Metric | Constraint | Notes |
|--------|------------|-------|
| Total posts | 30 ± 1 | 10 pre-launch, 5 launch week, 15 post-launch |
| Content mix | ≤ 9 posts promotional (30%) | >9 = Layer 1 structural fail |
| Value posts | ≥ 21 posts (70%) | Problem, education, story, result, behind-scenes |
| Each post | platform + copy + visual descriptor | All three required |

**Platform copy constraints:**

| Platform | Copy length | Format rules |
|----------|-------------|--------------|
| Twitter/X | ≤ 280 chars single; 7-tweet thread | Hook tweet must stand alone; each tweet must make sense without the others |
| LinkedIn | 150–300 words | No bullet points in first 3 lines (hidden by "see more") |
| Instagram | Caption 100–150 words | Visual descriptor required; copy is secondary |
| YouTube | No length limit | Used for 3–10 min walkthrough posts only |

**Visual descriptor rule:** Every post must include a visual descriptor — what the image or video should show. This is not a design prompt; it is a content descriptor. Example: "Screen recording showing the 3-step onboarding, ending on the dashboard with populated data."

---

## Demo Script

| Element | Constraint | Notes |
|---------|------------|-------|
| Total duration | 2:30–3:30 (target 3:00) | At 150 wpm average narration pace |
| Word count | 375–525 words | Validated by validate-lengths.py |
| Wow moment | Must demonstrate unique_mechanism | Not UI polish — the mechanism itself |
| Opening | Names the problem in ≤ 1 sentence | Cannot start with "Hi, I'm..." or product name |
| Narration style | Outcome language throughout | "You now have X" not "The system processes Y" |
| Social proof bridge | Must appear before final CTA | Specific outcome + named user + timeframe |

**Anti-patterns:**
- Demo script that reads like a pitch — no superlatives, no "revolutionary", no "we're excited"
- Wow moment shows UI polish instead of mechanism — "look how clean this interface is" ≠ wow
- Script that describes slides rather than narrating screen actions
- Ending without a CTA — every demo must close with canonical_cta from the spine
