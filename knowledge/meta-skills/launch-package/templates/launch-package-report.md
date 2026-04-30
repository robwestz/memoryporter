# Launch Package QA Report

<!-- [FIXED] Template version: 1.0.0 — Master QA output for a completed launch package -->
<!-- [FIXED] Fill after completing all 6 deliverables. Both layers always run. -->
<!-- [FIXED] A Layer 1 pass does not mean assets are good — Layer 2 always follows. -->

---

## Package Summary

| Field | Value |
|-------|-------|
| Product | [PRODUCT NAME] |
| ICP | [ICP ONE-LINER] |
| Launch date | [LAUNCH DATE or "relative dates (no launch_date provided)"] |
| Unique mechanism | [UNIQUE MECHANISM — 1 sentence] |
| QA date | [DATE] |
| Verdict | [LAUNCH-READY / REVISE-THEN-LAUNCH / REWORK-REQUIRED] |

---

## Narrative Spine (confirmed before generation)

```yaml
hook_statement: "[HOOK STATEMENT]"
problem_in_customer_language: "[PROBLEM]"
why_now: "[WHY NOW]"
solution_promise: "[SOLUTION PROMISE]"
unique_mechanism: "[UNIQUE MECHANISM]"
proof_signals:
  - "[PROOF 1 — or TRACTION NEEDED]"
  - "[PROOF 2 — or TESTIMONIAL NEEDED]"
canonical_cta: "[CANONICAL CTA]"
voice_adjectives: ["[ADJ 1]", "[ADJ 2]", "[ADJ 3]"]
icp_one_liner: "[ICP ONE LINER]"
```

*Spine confirmed by user: [YES / NO — if NO, note what changed]*

---

## Layer 1 — Structural Checks

<!-- [FIXED] Record all 12. Do not stop at the first failure. -->

| # | Check | Result | Notes |
|---|-------|--------|-------|
| L1-1 | Landing page hero complete | [PASS / FAIL] | [notes if fail] |
| L1-2 | Landing page benefit sections (3×3) | [PASS / FAIL] | [e.g., "found 2 sections"] |
| L1-3 | Landing page FAQ (3–5 pairs) | [PASS / FAIL] | [notes] |
| L1-4 | Pitch deck slide count (12) | [PASS / FAIL] | [notes] |
| L1-5 | Pitch deck slide completeness | [PASS / FAIL] | [list any incomplete slides] |
| L1-6 | Email count (5) | [PASS / FAIL] | [notes] |
| L1-7 | Email completeness (all fields) | [PASS / FAIL] | [list incomplete emails] |
| L1-8 | Product Hunt character limits | [PASS / FAIL] | [tagline: X/60, description: X/260] |
| L1-9 | Social calendar count (30 ±1) | [PASS / FAIL] | [actual count] |
| L1-10 | Social calendar completeness | [PASS / FAIL] | [posts missing visual descriptor: list] |
| L1-11 | Social content mix (≤9 promotional) | [PASS / FAIL] | [promotional count: X/30] |
| L1-12 | Demo script word count (375–525) | [PASS / FAIL] | [actual word count: X words] |

**Layer 1 result:** [X/12 PASS]

<!-- [FIXED] If any Layer 1 FAIL → verdict is REWORK-REQUIRED regardless of Layer 2 -->

---

## Layer 2 — Narrative Quality

<!-- [FIXED] Rating: Strong (3) | Adequate (2) | Weak (1) | Failing (0) -->
<!-- [FIXED] For every Weak or Failing: quote the offending line + write the specific fix. -->
<!-- [FIXED] "This section could be stronger" is not permitted feedback. -->

| Dim | Name | Score | Score label |
|-----|------|-------|-------------|
| N1 | Voice Consistency | [0–3] | [Strong/Adequate/Weak/Failing] |
| N2 | Problem-First Framing | [0–3] | [Strong/Adequate/Weak/Failing] |
| N3 | Differentiation Clarity | [0–3] | [Strong/Adequate/Weak/Failing] |
| N4 | Social Proof Placement | [0–3] | [Strong/Adequate/Weak/Failing] |
| N5 | CTA Coherence | [0–3] | [Strong/Adequate/Weak/Failing] |
| N6 | Narrative Thread | [0–3] | [Strong/Adequate/Weak/Failing] |
| N7 | ICP Specificity | [0–3] | [Strong/Adequate/Weak/Failing] |
| N8 | Generic Language | [0–3] | [Strong/Adequate/Weak/Failing] |

**Layer 2 total:** [X/24]
**Failing dimensions:** [count]
**Weak dimensions:** [count]

### Dimension Notes (Weak and Failing only)

<!-- [FIXED] For each Weak or Failing dimension: quote + fix. Skip Strong and Adequate. -->

**N[X] — [Name]: [Score/Label]**
> Offending line: "[exact quote]" *(Deliverable: [name], Location: [section])*
> Fix: [specific rewrite or instruction — not "improve this"]

*(Repeat for each Weak or Failing dimension)*

---

## Narrative Thread

<!-- [FIXED] State the thread explicitly — one sentence per asset. -->

1. **Landing Page** opens with: [what problem / hook]
2. **Pitch Deck** proves: [what market or traction point]
3. **Email Sequence** reveals: [problem → product → proof → launch arc]
4. **Product Hunt** tagline says: [what it does for whom]
5. **Social Calendar** builds: [what arc over 30 days]
6. **Demo Script** shows: [what mechanism / wow moment]

*Thread coherent: [YES / PARTIALLY / NO]*
*If PARTIALLY or NO: which asset breaks the thread and why.*

---

## Placeholders Requiring User Input

<!-- [FIXED] List all [TRACTION NEEDED], [TESTIMONIAL NEEDED], [RAISE AMOUNT NEEDED], etc. -->
<!-- [FIXED] These must be resolved before publishing. -->

| Placeholder | Deliverable | Location | What's needed |
|------------|------------|----------|---------------|
| [TRACTION NEEDED] | [deliverable] | [section] | Real user count, revenue, or growth rate |
| [TESTIMONIAL NEEDED] | [deliverable] | [section] | Specific outcome + named person + company |
| [RAISE AMOUNT NEEDED] | Pitch Deck | Slide 11 | Funding amount and round type |
| [TEAM BIOS NEEDED] | Pitch Deck | Slide 9 | Name + role + one past win per person |
| *(add more as found)* | | | |

---

## Verdict

<!-- [FIXED] Verdict logic:
  LAUNCH-READY: L1 12/12 AND L2 0 Failing, ≤2 Weak
  REVISE-THEN-LAUNCH: L1 12/12 AND L2 1 Failing OR 3+ Weak
  REWORK-REQUIRED: L1 any FAIL OR L2 2+ Failing
-->

**Verdict: [LAUNCH-READY / REVISE-THEN-LAUNCH / REWORK-REQUIRED]**

*Reason: [1–2 sentence explanation of why this verdict.]*

---

## Priority Fixes (Top 3, ordered by conversion impact)

<!-- [FIXED] Order by impact on whether someone signs up — not by QA dimension number. -->
<!-- [FIXED] Each fix must be specific: name the deliverable, quote the problem, write the solution. -->

**Fix 1 (Highest impact):**
- **Issue:** [specific problem — quote the line]
- **Location:** [deliverable + section]
- **Fix:** [specific rewrite or instruction]
- **Why this first:** [why this fix matters most to conversion]

**Fix 2:**
- **Issue:** [specific problem]
- **Location:** [deliverable + section]
- **Fix:** [specific rewrite or instruction]

**Fix 3:**
- **Issue:** [specific problem]
- **Location:** [deliverable + section]
- **Fix:** [specific rewrite or instruction]

---

## What Was NOT Verified

<!-- [FIXED] Honest about gaps. List things the QA process cannot check. -->

- [ ] Traction numbers accuracy (require user-provided data)
- [ ] Testimonial authenticity (require user confirmation)
- [ ] Email deliverability (requires ESP testing)
- [ ] Product Hunt tagline character count (run validate-lengths.py to confirm)
- [ ] Demo script timing in actual recording (word count proxy only)
- [ ] Social calendar images (descriptors provided; design not produced)
- [ ] Legal/compliance review of any claims made in copy
- [add any additional gaps specific to this package]
