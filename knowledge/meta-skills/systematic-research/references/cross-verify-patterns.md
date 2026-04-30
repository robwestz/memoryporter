# Cross-Verification Patterns

> **When to read this:** During Step 4 (CROSS-VERIFY), especially when
> claims are hard to categorize or disputes are subtle.

## The verification matrix

For each claim, ask three questions:

1. **How many independent sources support this claim?**
   - Independent = different authors, different organizations, different
     time periods. Two blog posts by the same author = 1 source.

2. **What kind of evidence backs each supporting source?**
   - Empirical (data) beats authority (expert opinion) beats consensus
     (everyone says so) beats anecdotal (one person's experience).

3. **Does any source actively contradict this claim?**
   - Contradiction is not "didn't mention it" — it's "explicitly disagrees."

## Status assignment rules

| Sources supporting | Sources contradicting | Strongest evidence | Status |
|--------------------|----------------------|-------------------|--------|
| ≥3 | 0 | any | **Verified** |
| 2 | 0 | any | **Supported** |
| 1 | 0 | any | **Unverified** |
| ≥1 | ≥1 | any | **Disputed** |

## Handling disputes

When sources disagree, don't resolve it — document it:

1. State Side A's position with their evidence
2. State Side B's position with their evidence
3. Note the evidence *types* on each side (empirical vs anecdotal matters)
4. Note if the dispute might be contextual (true for scale X, false for
   scale Y; true in 2023, fixed in 2024)
5. Present to the user as a finding, not a problem

Disputes are **the most valuable findings** in a research report. They
reveal where the user's decision actually matters — if everything agreed,
there'd be nothing to decide.

## Common cross-verification mistakes

| Mistake | Why it's wrong | Fix |
|---------|---------------|-----|
| Counting agreement by number of sources | 3 blog posts copying each other ≠ 3 independent sources | Trace claims to their origin |
| Treating official docs as infallible | Docs describe intent, not reality (bugs, limitations undocumented) | Cross-reference with community experience |
| Downgrading claims because they're contrarian | Contrarian ≠ wrong; it might be the only honest source | Judge by evidence quality, not popularity |
| Assuming newer = more correct | Older source might have data; newer might be opinion | Check evidence type, not date |
| "Everyone says X" = verified | Consensus without data is still medium confidence | Note evidence type as "consensus", not "empirical" |

## When to trigger a SOURCE loop-back

A loop-back is expensive (returns to Step 2). Only trigger when:

- A **critical** claim is **unverified** (only 1 source)
- That claim directly affects a **success criterion**
- You have **not already looped back** for this claim

The loop-back search should be targeted:
- Search specifically for "[claim] evidence" or "[claim] benchmark"
- Try the claim in a different context ("does X also apply to Y?")
- Look for the original source the claim might be referencing

If the loop-back finds supporting evidence → upgrade to "supported."
If it finds contradicting evidence → change to "disputed."
If it finds nothing → stay "unverified" and flag in GRADE.

## Confidence aggregation for GRADE

When computing the weighted average confidence for the GRADE:

```
confidence_score = sum(claim_weight * claim_confidence) / sum(claim_weight)

where:
  claim_weight = 2.0 if critical, 1.0 if not
  claim_confidence = 1.0 (high), 0.6 (medium), 0.3 (low)
```

This weights critical claims higher in the overall confidence score.
A research with all-high-confidence non-critical claims but one
low-confidence critical claim will score lower than it "looks."
