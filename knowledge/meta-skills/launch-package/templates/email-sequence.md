# Email Launch Sequence Template

<!-- [FIXED] Template version: 1.0.0 — 5-email pre-launch drip structure -->
<!-- [FIXED] Timing: start T-14 days before launch, last email on launch day -->
<!-- Generation source: Narrative Spine → Landing Page → Email Sequence -->
<!-- Validated by: scripts/validate-lengths.py (subject ≤ 40 chars, preview ≤ 90 chars) -->

---

<!-- [FIXED] Anti-patterns to avoid across all 5 emails:
  - Opening line cannot start with "I" or the product name
  - CTAs must use outcome language — not "Sign up", "Learn more", "Click here"
  - E1 and E2: product name must NOT appear anywhere in subject or body
  - Generic CTAs lose clicks — "Get your first [X]" outperforms "Sign up" by ~150bps
-->

---

<!-- [FIXED] ═════════════════════════════════════════════════════════ -->
<!-- [FIXED] EMAIL 1: TEASER                                          -->
<!-- [FIXED] Purpose: Open a curiosity loop. No product name.         -->
<!-- [FIXED] Timing: T-14 days                                        -->
<!-- [FIXED] ═════════════════════════════════════════════════════════ -->

## Email 1 — Teaser (T-14 days)

**Subject line:**
<!-- [VARIABLE] ≤ 40 characters. Curiosity gap. NO product name. -->
<!-- [VARIABLE] Formulas: "Something's coming" / "Keep your eyes open" / "Are you ready for this?" -->
[SUBJECT — e.g., "Something we've been hiding"]

**Preview text:**
<!-- [VARIABLE] ≤ 90 characters. Extends subject line intrigue. -->
[PREVIEW TEXT — e.g., "We've been working on something for the last 6 months. You're going to want to see this."]

**Opening line:**
<!-- [VARIABLE] Cannot start with "I" or the product name. Opens on the problem. -->
[OPENING — e.g., "There's a problem every founder we know has hit at least once."]

**Body:**
<!-- [VARIABLE] 150–300 words. Problem story — no solution revealed. Focus on the pain. -->
<!-- [VARIABLE] End with: "Stay tuned — more soon." -->
[BODY PARAGRAPH 1 — describe the pain in the ICP's own language. Be specific about what it costs them.]

[BODY PARAGRAPH 2 — hint that you've been building something. Do not name it. Create anticipation.]

[CLOSING LINE — e.g., "Stay tuned — more soon. Something's almost ready."]

**CTA:**
<!-- [VARIABLE] 2–5 words. Outcome language. No hard CTA in E1 — keep it soft. -->
[SOFT CTA — e.g., "Hit reply if this sounds familiar" or "Save the date: [launch date]"]

**P.S. line:**
<!-- [VARIABLE] Recommended for E1. Adds a personal hook or teaser detail. -->
[P.S. — e.g., "P.S. — We've been testing this with 40 founders for 8 weeks. The results surprised us."]

---

<!-- [FIXED] ═════════════════════════════════════════════════════════ -->
<!-- [FIXED] EMAIL 2: PROBLEM AGITATION                               -->
<!-- [FIXED] Purpose: Build urgency around the problem. Still no name. -->
<!-- [FIXED] Timing: T-10 days                                        -->
<!-- [FIXED] ═════════════════════════════════════════════════════════ -->

## Email 2 — Problem Agitation (T-10 days)

**Subject line:**
<!-- [VARIABLE] ≤ 40 characters. NO product name. Formula: "The [pain] problem is worse than you think" -->
[SUBJECT — e.g., "The launch copy problem is real"]

**Preview text:**
<!-- [VARIABLE] ≤ 90 characters. Extends problem framing. -->
[PREVIEW TEXT — e.g., "We found data on this. The numbers are worse than we expected."]

**Opening line:**
<!-- [VARIABLE] Cannot start with "I" or product name. Opens on the pain story or data point. -->
[OPENING — e.g., "Here's a number that stopped us cold:"]

**Body:**
<!-- [VARIABLE] 150–300 words. Data point + specific customer story + hint at solution. -->
<!-- [VARIABLE] Include: one data point, one specific story (real or representative), one blurred screenshot hint. -->
<!-- [VARIABLE] Product name must NOT appear. -->
[BODY — data point: e.g., "The average SaaS launch requires 3–5 days of dedicated copy work. That's before you discover your landing page and email sequence sound like different companies."]

[STORY — e.g., "One founder told us: 'We had our landing page, the email sequence, and the pitch deck written by three different people over two weeks. By launch day, we couldn't agree on what problem we were solving.'"]

[SCREENSHOT HINT — e.g., "We've been building something to fix this. Here's a blurred preview: [insert blurred screenshot descriptor]. More in 4 days."]

**CTA:**
<!-- [VARIABLE] 2–5 words. Soft CTA — waitlist or "stay tuned". -->
[CTA — e.g., "Join the waitlist early"]

---

<!-- [FIXED] ═════════════════════════════════════════════════════════ -->
<!-- [FIXED] EMAIL 3: THE REVEAL                                       -->
<!-- [FIXED] Purpose: Name the product. Show what it does. Open access. -->
<!-- [FIXED] Timing: T-7 days                                          -->
<!-- [FIXED] ═════════════════════════════════════════════════════════ -->

## Email 3 — The Reveal (T-7 days)

**Subject line:**
<!-- [VARIABLE] ≤ 40 characters. Formula: "Here's what we've been building" / "Introducing [Product]" -->
[SUBJECT — e.g., "Here's what we've been building"]

**Preview text:**
<!-- [VARIABLE] ≤ 90 characters. First mention of product name OK here. -->
[PREVIEW TEXT — e.g., "Introducing Acme — 6 launch deliverables, one brief, consistent story."]

**Opening line:**
<!-- [VARIABLE] Cannot start with "I" or product name. Opens with the problem bridge. -->
[OPENING — e.g., "The problem we described last week? We built the fix."]

**Body:**
<!-- [VARIABLE] 150–300 words. Name the product. 1–2 sentence description. Demo GIF or video. Unique mechanism. Waitlist/early access CTA. -->
[BODY PARAGRAPH 1 — name the product + solution_promise from spine]

[BODY PARAGRAPH 2 — unique mechanism in plain language. What makes it different from existing tools.]

[DEMO DESCRIPTOR — e.g., "Watch the 90-second walkthrough: [link or embedded GIF descriptor showing 3-step flow]"]

[BODY PARAGRAPH 3 — early access framing. What early users get. How to get access.]

**CTA:**
<!-- [VARIABLE] Primary CTA — outcome language. Matches canonical_cta from spine. -->
[CTA — e.g., "Get early access →"]

**P.S. line:**
<!-- [VARIABLE] Recommended. Add scarcity seed for E4. -->
[P.S. — e.g., "P.S. — Early access slots are limited. We're opening 100 spots before the public launch on [date]. You're first in line."]

---

<!-- [FIXED] ═════════════════════════════════════════════════════════ -->
<!-- [FIXED] EMAIL 4: SOCIAL PROOF + SCARCITY                         -->
<!-- [FIXED] Purpose: Reduce risk. Create urgency. Proof before ask.  -->
<!-- [FIXED] Timing: T-3 days                                         -->
<!-- [FIXED] ═════════════════════════════════════════════════════════ -->

## Email 4 — Proof + Scarcity (T-3 days)

**Subject line:**
<!-- [VARIABLE] ≤ 40 characters. Formula: "[Beta tester] said something that surprised us" -->
[SUBJECT — e.g., "What 320 beta users told us"]

**Preview text:**
<!-- [VARIABLE] ≤ 90 characters. Proof hook. -->
[PREVIEW TEXT — e.g., "One quote stopped us mid-review. Here's what they said about [Product]."]

**Opening line:**
<!-- [VARIABLE] Cannot start with "I". Opens on the user result, not the product. -->
[OPENING — e.g., "One of our beta users sent us a message we didn't expect."]

**Body:**
<!-- [VARIABLE] 150–300 words. Must include: quoted testimonial, scarcity signal, CTA. -->
<!-- [VARIABLE] REQUIRED: a quoted testimonial. If no real testimonials: [TESTIMONIAL NEEDED]. Do not invent. -->
[TESTIMONIAL QUOTE — full quote, specific outcome, named person + company. e.g., "'Cut our launch prep from 4 days to 4 hours.' — Alex Chen, Head of Marketing, Linktree"]

[BODY — reinforce the unique value prop. 1–2 sentences.]

[SCARCITY SIGNAL — e.g., "We have 43 early-bird Pro slots remaining at the founding price of $49/mo (regular: $79/mo). After [DATE], the founding price goes away."]

[CTA FRAMING — e.g., "This is your last nudge before launch day. If you want the founding price:"]

**CTA:**
<!-- [VARIABLE] 2–5 words. Outcome language. Scarcity-adjacent. -->
[CTA — e.g., "Reserve your founding spot →"]

---

<!-- [FIXED] ═════════════════════════════════════════════════════════ -->
<!-- [FIXED] EMAIL 5: LAUNCH DAY                                       -->
<!-- [FIXED] Purpose: Convert. It's live. Primary CTA. Early-bird.     -->
<!-- [FIXED] Timing: T-0 (launch day, morning send)                    -->
<!-- [FIXED] ═════════════════════════════════════════════════════════ -->

## Email 5 — Launch Day (T-0)

**Subject line:**
<!-- [VARIABLE] ≤ 40 characters. Formula: "We're live" / "[Product] is open" / "Today's the day" -->
[SUBJECT — e.g., "We're live — [Product] is open"]

**Preview text:**
<!-- [VARIABLE] ≤ 90 characters. The announcement + urgency signal. -->
[PREVIEW TEXT — e.g., "Acme is officially open. Founding price ends in 48 hours."]

**Opening line:**
<!-- [VARIABLE] Cannot start with "I". Opens with the announcement. -->
[OPENING — e.g., "Today is the day."]

**Body:**
<!-- [VARIABLE] 150–300 words. Live announcement + value prop recap + early-bird offer with explicit expiry + optional founder personal note. -->
[ANNOUNCEMENT — [Product] is live. Link.]

[VALUE PROP RECAP — 1–2 sentences. Restate the solution_promise from spine.]

[EARLY-BIRD OFFER — explicit expiry required: "until [DAY DATE], [TIME TIMEZONE]" not "limited time". e.g., "The founding price of $49/mo ends at midnight on [DATE]. After that, it's $79/mo."]

[FOUNDER NOTE — optional. Personal 2–3 sentence note from the founder about why this matters. Humanizes the email. Recommended for E5.]

**CTA:**
<!-- [VARIABLE] Primary CTA. Outcome language. Must match canonical_cta from spine. -->
[CTA — e.g., "Get your first launch package →"]

**P.S. line:**
<!-- [VARIABLE] Recommended for E5. Repeat the early-bird expiry or add a secondary CTA. -->
[P.S. — e.g., "P.S. — We're also launching on Product Hunt today. If you find [Product] useful, an upvote helps a lot: [PH link]"]
