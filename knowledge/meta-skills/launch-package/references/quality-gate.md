# Quality Gate

> **When to read this:** When running the QA phase — full Layer 1 (12 structural checks) and Layer 2 (8 narrative dimensions) rubrics with scoring, verdict logic, and guidance on how to write actionable feedback.

---

## Layer 1 — Structural Checks (12 checks, deterministic)

All 12 must pass. Record all results before writing the report — do not stop at the first failure.

| # | Check | How to verify | Threshold | On Fail |
|---|-------|---------------|-----------|---------|
| L1-1 | Landing page hero complete | Present: headline + subheadline + CTA + social proof hook | All 4 present | Note missing element(s) |
| L1-2 | Landing page benefit sections | Count sections and rows | Exactly 3 sections × 3 rows = 9 benefits | Correct count |
| L1-3 | Landing page FAQ | Count Q&A pairs | 3–5 pairs | Add or remove |
| L1-4 | Pitch deck slide count | Count slides | Exactly 12 | Correct count |
| L1-5 | Pitch deck slide completeness | Each slide: title + bullets + speaker note | All 12 slides complete | Identify incomplete slides |
| L1-6 | Email count | Count emails | Exactly 5 | Correct count |
| L1-7 | Email completeness | Each email: subject + preview text + body + CTA | All 5 complete | Identify missing fields |
| L1-8 | Product Hunt character limits | Run validate-lengths.py or manual count | Tagline ≤ 60, Description ≤ 260 | Trim to fit |
| L1-9 | Social calendar post count | Count posts | 30 ± 1 | Correct count |
| L1-10 | Social calendar post completeness | Each post: platform + copy + visual descriptor | All 30 complete | Identify posts missing visual descriptors |
| L1-11 | Social content mix | Count promotional posts | ≤ 9 of 30 (30%) | Reclassify or rewrite |
| L1-12 | Demo script word count | Run validate-lengths.py or word count | 375–525 words | Trim or expand |

**Recording format:**
```
L1-1: PASS
L1-2: FAIL — Found 2 sections (6 benefits). Missing third section.
L1-3: PASS
...
```

All 12 must be recorded. A partial Layer 1 is not valid.

---

## Layer 2 — Narrative Dimensions (8 dimensions, judgment)

**Rating scale:** Strong (3) | Adequate (2) | Weak (1) | Failing (0)

Run after Layer 1. A Layer 1 pass does not mean assets are good — Layer 2 always runs.

### N1 — Voice Consistency

**Key question:** Does the same person seem to have written all 6 deliverables?

**Test:** Read the landing page headline, then E1 email subject, then the Product Hunt tagline. Do they sound like the same brand voice?

| Score | Condition |
|-------|-----------|
| Strong (3) | Tone adjectives from the blueprint are perceptible in all 6. The landing page and email could be adjacent pages of the same document. |
| Adequate (2) | 4–5 deliverables match voice; 1–2 are noticeably different in register |
| Weak (1) | Voice inconsistency is obvious in 3+ deliverables — some formal, some casual |
| Failing (0) | No discernible shared voice — the package reads like 6 different tools wrote it |

**On Weak or Failing:** Quote the mismatched line. Name the deliverable. Write the fix.

---

### N2 — Problem-First Framing

**Key question:** Do all top-of-funnel assets open on the problem, not the product?

**Assets to check:** LP hero headline, E1 subject line, first social post (T-21), PH tagline.

| Score | Condition |
|-------|-----------|
| Strong (3) | All 4 top-of-funnel assets open on the problem or a problem-adjacent hook. Product name absent from E1 and E2. |
| Adequate (2) | 3 of 4 open on problem; one leads with product name or feature |
| Weak (1) | 2 of 4 open on problem |
| Failing (0) | All top-of-funnel assets lead with the product or feature — no problem framing |

**On Weak or Failing:** Quote the offending line. Rewrite it problem-first.

---

### N3 — Differentiation Clarity

**Key question:** Is the unique_mechanism stated once crisply and referenced (not repeated verbatim) in each deliverable?

| Score | Condition |
|-------|-----------|
| Strong (3) | Mechanism stated clearly in LP (one crisp sentence), referenced in adapted form in each other deliverable |
| Adequate (2) | Mechanism present in most deliverables; one deliverable omits or buries it |
| Weak (1) | Mechanism either copied verbatim everywhere (no adaptation) or absent from 2+ deliverables |
| Failing (0) | Mechanism absent from most deliverables, or still generic ("faster", "better") |

**On Weak or Failing:** Identify which deliverables omit or repeat verbatim. Write the adapted form for each.

---

### N4 — Social Proof Placement

**Key question:** Does proof appear before every ask?

**Checkpoints:**
- LP: testimonials section before Final CTA
- Email E4: testimonial quote before reserve CTA
- Demo script: social proof bridge before final CTA
- Pitch deck: traction slide (slide 6) before ask slide (slide 11)

| Score | Condition |
|-------|-----------|
| Strong (3) | Proof precedes every ask in all 4 checkpoints |
| Adequate (2) | Proof precedes ask in 3 of 4 checkpoints |
| Weak (1) | Proof precedes ask in 2 of 4 checkpoints |
| Failing (0) | Ask appears before proof in majority of checkpoints |

---

### N5 — CTA Coherence

**Key question:** Do all CTAs point to the same action and use outcome language?

**Flag any:** "Sign up", "Learn more", "Try it", "Click here", "Get started" (without outcome specificity)

| Score | Condition |
|-------|-----------|
| Strong (3) | All CTAs use outcome language and point to the same primary action. Zero generic CTAs. |
| Adequate (2) | Most CTAs outcome-specific; 1–2 generic CTAs present |
| Weak (1) | 3+ generic CTAs; or CTAs point to conflicting actions |
| Failing (0) | No CTAs use outcome language; or no CTA in one or more required locations |

**On Weak or Failing:** List each generic CTA, its location, and the rewrite.

---

### N6 — Narrative Thread

**Key question:** Can you trace Problem → Insight → Solution → Proof → Action through all 6 assets in sequence?

**Procedure:** State the thread explicitly as a sentence per asset:
1. LP opens with: [what problem]
2. Pitch deck proves: [what market/traction]
3. Email sequence reveals: [problem → product → proof → launch]
4. PH tagline says: [what it does]
5. Social calendar builds: [what arc]
6. Demo shows: [what mechanism]

| Score | Condition |
|-------|-----------|
| Strong (3) | Thread is traceable; each asset advances the same story |
| Adequate (2) | Thread present in 5 of 6; one asset is disconnected |
| Weak (1) | Thread present in 3–4 of 6; noticeable breaks |
| Failing (0) | No traceable thread; assets feel independent |

---

### N7 — ICP Specificity

**Key question:** Does copy speak to one specific person or to everyone?

**Flag any sentence** that addresses: "businesses", "teams", "companies", "users", "people", "anyone", "everyone"

| Score | Condition |
|-------|-----------|
| Strong (3) | Zero generic audience references. ICP role appears in headline and in 4+ deliverables. |
| Adequate (2) | 1–2 generic references; ICP specific in most places |
| Weak (1) | 3–5 generic references; copy often speaks to "teams" or "businesses" |
| Failing (0) | ICP never named specifically; copy addresses a generic universal audience |

**On Weak or Failing:** Quote each generic reference with the deliverable and line. Write the ICP-specific replacement.

---

### N8 — Generic Language

**Key question:** How many banned phrases appear across all 6 deliverables?

**Banned phrases:** "revolutionary", "game-changing", "seamless", "robust", "powerful", "AI-powered", "best-in-class", "cutting-edge", "next-generation", "innovative", "disrupting", "state-of-the-art"

**Also flag:** Feature-not-benefit statements (describes what the product has, not what the user gets)

| Score | Condition |
|-------|-----------|
| Strong (3) | Zero banned phrases. All statements are benefit-framed. |
| Adequate (2) | 1–2 banned phrases total |
| Weak (1) | 3–5 banned phrases total, or multiple feature-not-benefit statements |
| Failing (0) | 6+ banned phrases, or a deliverable is primarily feature-framed |

**On Weak or Failing:** List each banned phrase with location. Write the specific outcome-language replacement.

---

## Verdict Logic

| Verdict | Condition |
|---------|-----------|
| **LAUNCH-READY** | Layer 1: 12/12 AND Layer 2: 0 Failing, ≤ 2 Weak |
| **REVISE-THEN-LAUNCH** | Layer 1: 12/12 AND Layer 2: exactly 1 Failing OR 3+ Weak |
| **REWORK-REQUIRED** | Layer 1: any FAIL OR Layer 2: 2+ Failing |

---

## Writing QA Feedback

**The standard for feedback:** Quote the specific offending line. Name the fix. "This section could be stronger" is not permitted.

**Template for each Weak or Failing dimension:**
```
N[X] — [Name]: [Score]
Offending line: "[exact quote from deliverable]" (Deliverable: [name], Location: [section])
Fix: [specific rewrite or instruction — not "improve this"]
```

**Priority ordering in the report:** Order the 3 priority fixes by impact on conversion, not by QA dimension number. The fix that most affects whether someone signs up comes first.
