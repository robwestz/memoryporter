# Product Hunt Listing Template

<!-- [FIXED] Template version: 1.0.0 — 4 components: tagline, description, first comment, maker comment -->
<!-- [FIXED] Validated by: scripts/validate-lengths.py (tagline ≤ 60, description ≤ 260) -->
<!-- Generation source: Narrative Spine → Landing Page → Product Hunt (most constrained distillation) -->

---

<!-- [FIXED] Anti-patterns to flag and rewrite immediately:
  - Tagline starts with the product name
  - Any use of: "AI-powered", "revolutionary", "game-changing", "seamless", "robust", "powerful"
  - Description misses the unique_mechanism
  - First comment reads like marketing copy or a press release
  - Maker comment is generic: "Thanks for the support!" without a specific question
-->

---

<!-- [FIXED] ══════════════════════════════════════ -->
<!-- [FIXED] COMPONENT 1: TAGLINE                  -->
<!-- [FIXED] What appears under the product name   -->
<!-- [FIXED] ══════════════════════════════════════ -->

## Tagline

<!-- [VARIABLE] ≤ 60 characters — validated by validate-lengths.py -->
<!-- [VARIABLE] Formula: [Outcome verb] [what] for [ICP] without [friction] -->
<!-- [VARIABLE] Must not start with product name -->
<!-- [VARIABLE] No banned phrases: "AI-powered", "revolutionary", etc. -->

[TAGLINE]

*Character count check: [X]/60*

**Derivation notes:**
- Outcome verb from: `canonical_cta` in Narrative Spine
- ICP from: `icp_one_liner` (shortened to role only)
- Friction from: `problem` field (the obstacle removed)

**Examples:**
- Strong: "Ship launch-ready copy in hours — not days" (42 chars)
- Strong: "6 consistent launch assets from one brief" (41 chars)
- Weak: "AI-powered launch copy generator for startups" — banned phrase + generic ICP

---

<!-- [FIXED] ══════════════════════════════════════ -->
<!-- [FIXED] COMPONENT 2: DESCRIPTION              -->
<!-- [FIXED] The 2-sentence body under the tagline -->
<!-- [FIXED] ══════════════════════════════════════ -->

## Description

<!-- [VARIABLE] ≤ 260 characters — validated by validate-lengths.py -->
<!-- [VARIABLE] 2 sentences: (1) what it does, (2) why now / the mechanism -->
<!-- [VARIABLE] Must include unique_mechanism in plain language -->

[DESCRIPTION]

*Character count check: [X]/260*

**Sentence 1 formula:** [Product] [verb] [what it produces] [for ICP] [outcome].
**Sentence 2 formula:** [How it works — unique mechanism] [result or differentiation].

**Example:**
> "Acme generates a complete launch package — landing page, pitch deck, 5-email sequence, Product Hunt listing, 30-day social calendar, and demo script — from a 10-field product brief. All 6 assets share a Narrative Spine so your story is consistent from hero headline to demo close."

*Example count: 258/260*

---

<!-- [FIXED] ══════════════════════════════════════════════════════════ -->
<!-- [FIXED] COMPONENT 3: FIRST COMMENT (maker intro — posted at launch) -->
<!-- [FIXED] Structure: 3 paragraphs + CTA, 150–250 words total          -->
<!-- [FIXED] Tone: conversational, first-person, no marketing speak       -->
<!-- [FIXED] ══════════════════════════════════════════════════════════ -->

## First Comment (Maker Intro)

<!-- [FIXED] Paragraph 1: Personal story — why this problem matters to you specifically -->
<!-- [VARIABLE] Not a product pitch. A real story about encountering the problem. -->

[PARAGRAPH 1 — Personal story. e.g., "Three years ago I launched my first SaaS product. We had a landing page, an email sequence, and a pitch deck — all written separately, by different people, over two weeks. On launch day a journalist asked me to describe what we built in one sentence and I gave a different answer than my co-founder. We didn't have a story. We had content."]

<!-- [FIXED] Paragraph 2: What you built and the unique mechanism — in plain language, not marketing speak -->
<!-- [VARIABLE] Name the product. Describe the mechanism as if explaining to a friend. -->

[PARAGRAPH 2 — What you built. e.g., "Acme fixes this by deriving a Narrative Spine before generating anything — a shared context object all 6 deliverables draw from. Your landing page headline and your email subject line and your pitch deck punchline are different expressions of the same sentence. That's it. That's the mechanism."]

<!-- [FIXED] Paragraph 3: What you're looking for — be specific -->
<!-- [VARIABLE] Not "we'd love your feedback." Ask for a specific user type or use case. -->

[PARAGRAPH 3 — Specific ask. e.g., "Today I'm especially looking for: founders in the 4–12 week pre-launch window, and anyone who's experienced the 'three different voices' problem. If that's you, I'd genuinely love to know if the output lands."]

<!-- [FIXED] CTA: link + early-bird offer -->
<!-- [VARIABLE] Outcome language. Explicit early-bird expiry if applicable. -->

[CTA — e.g., "[Product link] — founding price of $49/mo is live until [DATE]. Happy to answer anything in the comments."]

*Word count check: [X] words (target: 150–250)*

---

<!-- [FIXED] ══════════════════════════════════════════════════════════ -->
<!-- [FIXED] COMPONENT 4: MAKER COMMENT (response template)           -->
<!-- [FIXED] Used when replying to upvoters and commenters             -->
<!-- [FIXED] ══════════════════════════════════════════════════════════ -->

## Maker Comment (Response Template)

<!-- [VARIABLE] 2–3 sentences: genuine thank-you + one specific question -->
<!-- [VARIABLE] Anti-pattern: "Thanks for the support!" with no follow-up question -->
<!-- [VARIABLE] The question should be product-relevant and invite a real response -->

[MAKER COMMENT — e.g., "Thank you — that means a lot. Quick question: what's the deliverable you'd trust AI to produce the least for a real launch? We've found pitch decks are where most people draw the line, and I'm curious if that matches your instinct."]

**Variants for different upvoter types:**

*For founders:*
[VARIANT — e.g., "Thank you! Are you pre-launch or post? I'd love to know if there's a specific deliverable that would save you the most time."]

*For investors/press:*
[VARIANT — e.g., "Thank you — appreciate it. Curious: does the 'narrative consistency' angle resonate with what you see in early-stage launches? Would love your honest read."]

*For competitors/skeptics:*
[VARIANT — e.g., "Thank you. I'd genuinely love to know: what's the weakest part in your view? We have specific opinions but external critique is how we improve."]
