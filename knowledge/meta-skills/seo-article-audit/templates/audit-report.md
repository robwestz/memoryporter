<!-- [FIXED] Header — never change structure -->
# Article Audit Report

<!-- [VARIABLE] Job identification -->
**Article:** [title or first 8 words]
**Anchor:** [anchor_text] → [target_url]
**Publisher:** [publisher_domain]
**Audited:** [YYYY-MM-DD]

---

<!-- [FIXED] Layer 1 section header -->
## Layer 1 — Mechanical Checks

<!-- [VARIABLE] Results table — fill all 11 rows -->
| # | Check | Status | Value | Expected | Note |
|---|-------|--------|-------|----------|------|
| 1 | Word count | PASS/FAIL | [n] words | 750–900 | |
| 2 | Anchor present | PASS/FAIL | [n] found | ≥ 1 | |
| 3 | Anchor count | PASS/FAIL | [n] | exactly 1 | |
| 4 | Anchor position | PASS/FAIL | word [n] | 250–550 | |
| 5 | Trust links | PASS/FAIL | [n] valid | 1–2 | [issues if any] |
| 6 | No bullets | PASS/FAIL | [n] found | 0 | |
| 7 | Headings | PASS/FAIL | [n] found | ≤ 1 | |
| 8 | Forbidden phrases | PASS/FAIL | [n] found | 0 | [phrase(s) if any] |
| 9 | Language | PASS/FAIL | [detected] | [expected] | |
| 10 | SERP entities | PASS/FAIL/SKIP | [n] of [total] | ≥ 4 | [missing if any] |
| 11 | Paragraphs | PASS/FAIL | [n] | ≥ 4 | |

<!-- [VARIABLE] Layer 1 verdict — list ALL failing checks if rejected -->
**Layer 1 Result:** [n]/11 PASS — [APPROVED / REJECTED: checks [#] failed]

---

<!-- [FIXED] Layer 2 section header -->
## Layer 2 — Editorial Quality

<!-- [FIXED] Rating legend -->
> Rating: **Strong** (3) | **Adequate** (2) | **Weak** (1) | **Failing** (0)

---

<!-- [VARIABLE] Fill each block below with findings -->

### E1: Hook Quality — [Rating]

**Evidence:** "[quoted first sentence from article]"

**Diagnosis:** [What specifically is wrong or right, in one sentence]

**Fix:** [If Weak/Failing: exact instruction for what to rewrite. If Strong/Adequate: omit or note what works.]

---

### E2: Thesis Clarity — [Rating]

**Argument summary:** "[Auditor's one-sentence version of the article's claim, or "Not extractable"]"

**Diagnosis:** [What specifically is wrong or right]

**Fix:** [If Weak/Failing: what the thesis should be or how to sharpen it. If Strong/Adequate: omit.]

---

### E3: Entity Integration — [Rating]

**Strong deployment:** "[example sentence where entity is natural]" *(or "none found")*

**Weak deployment:** "[example sentence where entity is forced/listed]" *(or "none found")*

**Entity count visible:** [n] unique SERP entities found in text

**Diagnosis:** [Distribution, naturalness, gaps]

**Fix:** [If Weak/Failing: which entities to redeploy and how. If Strong/Adequate: omit.]

---

### E4: Trustlink Integration — [Rating]

**Trustlink 1:** "[quoted trustlink sentence]"
→ [Diagnosis: specific finding present? / generic citation?]

**Trustlink 2:** "[quoted trustlink sentence]" *(or "not found")*
→ [Diagnosis]

**Fix:** [If Weak/Failing: exact rewrite instruction per trustlink. If Strong/Adequate: omit.]

---

### E5: Anchor Naturalness — [Rating]

**Anchor sentence:** "[quoted sentence containing anchor]"

**Remove-link test:** [Does the sentence work without the link? Yes/No + explanation]

**Diagnosis:** [Is this the strongest paragraph? Does context contain SERP entities?]

**Fix:** [If Weak/Failing: how to rebuild the anchor context. If Strong/Adequate: omit.]

---

### E6: Red Thread — [Rating]

**Weakest transition:**
- Close of P[n]: "[quoted closing sentence]"
- Open of P[n+1]: "[quoted opening sentence]"
- Issue: [what's broken]

**Thread summary:** [One sentence describing how well the argument develops across paragraphs]

**Fix:** [If Weak/Failing: which transition to rewrite and how to bridge it. If Strong/Adequate: omit.]

---

### E7: Closing Quality — [Rating]

**Final sentence:** "[quoted last sentence of article]"

**Diagnosis:** [New insight / implication / forward-look — or restatement / summary?]

**Fix:** [If Weak/Failing: what the close should do and concrete direction. If Strong/Adequate: omit.]

---

### E8: AI Smell — [Rating]

**Patterns detected:** [n] of 10

<!-- [VARIABLE] List each detected pattern with quoted evidence. Omit section if 0 patterns. -->
| Pattern | Evidence |
|---------|---------|
| [pattern name] | "[quoted text]" |

**Diagnosis:** [Overall assessment of mechanical/generic feel]

**Fix:** [If Weak/Failing: top 1–2 most damaging patterns to fix first. If Strong/Adequate: omit.]

---

<!-- [FIXED] Summary section -->
## Summary

<!-- [VARIABLE] -->
**Layer 1:** [n]/11 PASS
**Layer 2:** [total]/24 — Strong: [n], Adequate: [n], Weak: [n], Failing: [n]

<!-- [FIXED] Verdict logic — apply thresholds exactly -->
**Verdict:** [PUBLISH-READY / REVISE-THEN-PUBLISH / REWRITE-REQUIRED]

| Verdict | Condition |
|---------|-----------|
| PUBLISH-READY | Layer 1: 11/11 AND Layer 2: 0 Failing, ≤ 2 Weak |
| REVISE-THEN-PUBLISH | Layer 1: 11/11 AND Layer 2: 1 Failing OR 3+ Weak |
| REWRITE-REQUIRED | Layer 1: any FAIL OR Layer 2: 2+ Failing |

<!-- [VARIABLE] Max 3 actions, ordered by impact -->
**Priority Actions:**
1. [Most critical fix — name the dimension and the specific change]
2. [Second fix]
3. [Third fix if applicable]
