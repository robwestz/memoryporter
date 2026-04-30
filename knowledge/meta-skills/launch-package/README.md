# launch-package

Generate a complete, narrative-consistent product launch package — 6 deliverables, one session.

All assets share a **Narrative Spine** derived before any template is touched. Landing page, pitch deck, emails, Product Hunt listing, social calendar, and demo script all tell the same story.

---

## What It Does

Produces 6 launch deliverables from a 10-field product blueprint:

1. **Landing page copy** — hero, 9 benefits, social proof, FAQ, CTA
2. **Pitch deck outline** — 12 slides with speaker notes (YC-style)
3. **Email launch sequence** — 5-email drip from T-14 to launch day
4. **Product Hunt listing** — tagline, description, maker first comment
5. **Social media calendar** — 30-day plan anchored to launch date
6. **Demo script** — 3-minute walkthrough with Fixed structure

Then runs a two-layer QA check (structural + narrative) and produces a report with a verdict and 3 priority fixes.

---

## Supported Clients

- Claude Code (recommended)
- Claude.ai (claude.ai/code)
- Any Claude-compatible agent with file read access to this skill

---

## Prerequisites

- An `ANTHROPIC_API_KEY` in the environment (if running programmatically)
- Python 3.9+ (for `scripts/validate-lengths.py`)
- A product blueprint with at minimum: product_name, icp, problem, solution, unique_mechanism, pricing, tone, launch_date

---

## Installation

Copy the `launch-package/` directory into your project's `.skills/` folder or add a reference in your skill engine's resolver index.

No external dependencies required beyond the Python standard library.

---

## Trigger Conditions

Use this skill when the user says any of:

- "create a launch package"
- "build launch assets"
- "write my launch copy"
- "prepare for launch"
- "generate pitch deck + landing page"
- "full launch kit"
- "I need [landing page / email sequence / pitch deck] for my product launch"
- Any request for 2+ launch deliverables at once

---

## Expected Outcome

After running the skill, the user has:

- A confirmed Narrative Spine (visible before generation begins)
- 6 completed launch deliverables, all consistent with each other
- A QA report with Layer 1 (structural) + Layer 2 (narrative) scores
- A verdict: LAUNCH-READY / REVISE-THEN-LAUNCH / REWORK-REQUIRED
- 3 priority fixes ordered by conversion impact
- A placeholder inventory listing any `[TRACTION NEEDED]` or `[TESTIMONIAL NEEDED]` items to resolve before publishing

---

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main protocol — workflow, quality gate, anti-patterns |
| `README.md` | This file — installation and usage guide |
| `metadata.json` | Marketplace metadata |
| `templates/landing-page.md` | Fixed/Variable landing page template |
| `templates/pitch-deck.md` | 12-slide pitch deck with speaker notes |
| `templates/email-sequence.md` | 5-email drip (subject, preview, body, CTA per email) |
| `templates/product-hunt.md` | Tagline, description, first comment, maker comment |
| `templates/social-calendar.md` | 30-day social calendar with per-post fields |
| `templates/demo-script.md` | 3-minute narration with timed sections |
| `templates/launch-package-report.md` | QA report — filled in Phase 4 |
| `references/input-spec.md` | Required + optional blueprint fields, validation rules |
| `references/narrative-spine.md` | Spine derivation formulas, examples, common mistakes |
| `references/deliverable-constraints.md` | Hard limits per deliverable (chars, words, formats) |
| `references/quality-gate.md` | Full Layer 1 + Layer 2 rubric |
| `scripts/validate-lengths.py` | Automated length checker (PH limits, email subjects, demo) |
| `evals/evals.json` | 2 regression test cases: B2B SaaS + consumer app |

---

## Troubleshooting

**The skill halted at INTAKE asking about `unique_mechanism`.**
This is correct behavior. A weak mechanism ("faster", "AI-powered") produces uniformly weak copy across all 6 deliverables. Answer: "What does [Product] do that a direct competitor cannot honestly claim?"

**The QA report shows REVISE-THEN-LAUNCH instead of LAUNCH-READY.**
Check the Layer 2 notes. The most common causes: (1) generic language in LP hero or email subjects, (2) CTAs using "Sign up" instead of outcome language, (3) proof sections with placeholders. Fix the 3 priority items listed in the report.

**`validate-lengths.py` reports no subject lines found.**
The script looks for lines matching `Subject line:` followed by content on the next line. Ensure email subjects are formatted as: `**Subject line:**\n[subject text]` in the generated email sequence file.

**Product Hunt tagline exceeds 60 characters.**
Run: `python scripts/validate-lengths.py --file templates/product-hunt.md --type product-hunt`
Trim by removing qualifiers. Keep the outcome verb + what + for whom. Drop "without [friction]" if needed.

**Social calendar shows >9 promotional posts (L1-11 FAIL).**
Count posts with `Post type: reveal` or `Post type: promotional`. Reclassify feature-spotlight posts as `feature` type and company announcements as `result` type where appropriate.
