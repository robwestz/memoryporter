# Claims table — template

Copy this skeleton into the upstream output's appended legitimacy-block.

## Claims

| ID | Claim | Status | Confidence | Sources | Critical? |
|----|-------|--------|------------|---------|-----------|
| C1 | <one-sentence assertion> | Verified | High | S1, S2, S3 | yes |
| C2 | <one-sentence assertion> | Supported | Medium | S4, S5 | yes |
| C3 | <one-sentence assertion> | Unverified | Low | internal-reasoning | no |
| C4 | <one-sentence assertion> | Disputed | Medium | S6 vs S7 | yes |

## Field reference

### Status (count-based)

| Status | Rule |
|--------|------|
| Verified | ≥ 3 independent sources, 0 dissent; OR direct measurement; OR canonical authority |
| Supported | 2 independent sources, 0 dissent; OR strong inference from one A-rated source |
| Unverified | 1 source; OR pure reasoning |
| Disputed | Sources actively disagree |

### Confidence (quality-based)

| Level | When |
|-------|------|
| High | Empirical data, reproducible, official docs |
| Medium | Expert opinion + reasoning, multiple anecdotes |
| Low | Single anecdote, undated content, marketing copy |

### Sources

- Format: `S1, S2, S3` matching the upstream document's source registry
- Special values: `internal-reasoning`, `direct-measurement`, `canonical-authority`
- If multiple sources from the same domain: count as 1 unless they are independent (different authors / different evidence).

### Critical?

- `yes` if any conclusion, recommendation, or next-step depends on this claim being true
- `no` otherwise
- Count of `yes` + `Unverified` rows becomes `critical_unverified` in the Grade block.

## Anti-patterns

- Do not paraphrase claims so heavily they change meaning
- Do not assign High confidence to consensus without data
- Do not upgrade Status because the source is A-rated — quality goes in Confidence
- Do not mark Status without naming a source — if you can't name one, it's Unverified
