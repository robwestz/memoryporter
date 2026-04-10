---
name: brand-voice-check
description: |
  Verify that written content matches a brand's voice and tone guidelines. Use
  when reviewing copy, blog posts, marketing material, or any customer-facing text
  for brand consistency. Trigger on: "check brand voice", "does this match our tone",
  "review for brand consistency", or when editing content that represents the brand.
author: Example Author
version: 1.0.0
---

# Brand Voice Check

## Purpose

Ensure every piece of customer-facing content sounds like it came from the same
brand — regardless of who wrote it or which agent produced it.

## When to Use

- Reviewing marketing copy, blog posts, or landing pages
- Editing AI-generated content before publication
- Onboarding a new writer to the brand's voice

## When NOT to Use

- Internal documentation (brand voice doesn't apply)
- Technical API docs (clarity over personality)
- Legal/compliance text (precision over tone)

## Process

### Step 1: Load the Brand Profile

Read the brand's voice guidelines. If none exist, ask for:

| Element | What to capture | Example |
|---------|----------------|---------|
| Personality | 3-5 adjectives that describe the brand | "Confident, warm, direct" |
| Tone range | When tone shifts (support vs. marketing) | "Empathetic in support, bold in ads" |
| Vocabulary | Words the brand uses / avoids | Uses "build" not "leverage" |
| Sentence style | Long/short, formal/casual | "Short sentences. No jargon." |

### Step 2: Scan the Content

Read the content fully. For each paragraph, check:

- [ ] Does it match the personality adjectives?
- [ ] Is the tone appropriate for the context?
- [ ] Are any banned words or phrases present?
- [ ] Does sentence length match the brand's style?

### Step 3: Flag and Fix

| Finding | Action |
|---------|--------|
| Wrong tone (too formal/casual) | Rewrite to match tone range |
| Banned vocabulary | Replace with brand-approved alternative |
| Inconsistent style | Align sentence structure to brand standard |
| On-brand content | Confirm — no changes needed |

**Anti-pattern:** Do not rewrite content that is already on-brand just to add flair.
The goal is consistency, not creativity.

### Step 4: Verify

Re-read the edited content as if you were a customer encountering the brand for
the first time. Does it feel like one voice throughout?

## Output

Deliver: corrected content + a brief change summary (what was off-brand and why).

## Notes

- Brand voice is subjective — when in doubt, ask the user
- This skill checks voice/tone, not factual accuracy or grammar
- For brands without written guidelines, the Step 1 interview IS the deliverable
