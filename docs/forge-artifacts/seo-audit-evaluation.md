# SEO Audit Skill — Live Test Evaluation

> Test article: job_07.md (Mattor/Rusta)
> Audit result: seo-audit-test-result.md
> Evaluator: Claude Sonnet 4.6
> Date: 2026-04-13

---

## Verdict on the Skill

**Worth paying for: Yes, conditional on use case.**

The mechanical layer (L1) is table stakes — any agency running >10 articles/month should already have this automated. The script works correctly and catches all 11 checks. That's not the differentiator.

The editorial layer (L2) is the actual product. Whether it's worth money depends entirely on how specific and non-obvious the feedback is. Testing it against a reference-quality article (job_07 is explicitly cited as a good example in the design doc) is the right stress test — the risk was that it would call everything Strong and provide nothing useful.

It didn't do that. Here's what it got right:

---

## What the Audit Got Right (Non-Obvious Findings)

### 1. The P3 Problem (E2 + E6)

The audit correctly identified that paragraph 3 — which covers practical rug sizing, material-room matching, and color guidance — is the article's weakest structural element. This is not obvious. P3 passes every mechanical check, sounds professional, and contains accurate information. But it's doing something different from the rest of the article: it's providing interior design advice rather than advancing a cultural argument about material as statement.

The diagnosis is sharp: "P3's practical content is the article's most detachable section — it could be moved or significantly reduced without breaking the cultural argument." This is the kind of observation an editor makes after reading deeply, not a reviewer who skims for errors.

The fix instruction — "reframe by connecting size/color choices explicitly to the values-as-statement thesis" — is specific and actionable. A writer knows exactly what's being asked.

### 2. The Trustlink Statistic Gap (E4)

The audit rated E4 Adequate (2/3) rather than Strong. The difference between Adequate and Strong for trustlinks is: does it contain a specific number, or just a trend characterization? The fabricoeur.se trustlink says "en av årets starkaste rörelser" — a directional claim, not a quantified one. The audit correctly identifies this as the gap and prescribes exactly what to add ("one percentage, count, or named data point from the source").

Most QA reviewers would pass this trustlink. The specific standard — *a number, not just a direction* — is the right standard and the audit applies it correctly.

### 3. Uniform Paragraph Length (E8)

All five paragraphs cluster within 142–161 words. The audit surfaces this as an AI-smell indicator. This is a correct and non-obvious observation. The article reads competent but doesn't vary its rhythm — every paragraph is the same "weight." Allowing one short paragraph (the audit suggests 50–70 words) would change the reading experience.

This observation is worth money. A writer won't notice this without a structured checklist.

### 4. The P2→P3 Transition (E6)

The audit identifies the P2→P3 joint as the weakest transition. P2 ends on "biologiskt nedbrytbar... belasta... miljön i stort" (sustainability) and P3 opens with "I praktiken handlar valet av matta om mer än fiber" — an abrupt gear-change. The fix prescription (rewrite P2's final sentence to plant the practical question P3 will answer) is specific and would work.

---

## What the Audit Got Wrong or Missed

### 1. The "mattor" Anchor is Weak as an Anchor Text

The audit rated E5 Strong (3) — and mechanically, it's correct. The sentence works without the link, SERP entities are present, and the paragraph is concrete.

But the audit didn't flag that the anchor text itself — "mattor" — is a single generic noun. Compare this to the job_08 anchor approach where the link text is a more specific, descriptive phrase. "Mattor" as link text gives zero hint about what's on the other side of the link. An audit at the premium standard should surface this. The E5 assessment procedure asks "does the link feel like a natural resource" — but doesn't separately assess the link text quality.

**Gap in the skill:** The E5 rubric should include a check on anchor text descriptiveness — not just sentence-level naturalness.

### 2. The Word Count Buffer Warning is Soft

761 words is only 11 words above the 750 floor. The audit notes "Close to lower bound — limited margin" in the L1 note, but this doesn't propagate into the priority actions or E-layer feedback. Any subsequent edit that cuts 11+ words (reasonable given E8 recommends cutting P3 by ~30%) would fail L1. This is a critical dependency the audit doesn't surface clearly.

**Gap in the skill:** When word count is within 20 words of either boundary, the audit should flag it as a priority constraint that must be checked after implementing any recommended edits.

### 3. The "rumsavdelare" Miss isn't Fully Analyzed

The audit notes that "rumsavdelare" doesn't appear in the text (Check 10, 4/5 entities), and E3 mentions it. But it doesn't connect this to the Rusta target URL. Rusta's matte page likely targets "rumsavdelare" as a keyword — an entity that appears in SERP research but is absent from the article represents a missed semantic bridge opportunity. The audit should explain *why* this matters strategically, not just note its absence.

---

## Is the Feedback Specific Enough to Act On?

**Yes — with one exception.**

| Feedback item | Actionable? | Verdict |
|--------------|-------------|---------|
| Add a statistic from fabricoeur.se | Yes — writer knows exactly what to find and where to put it | Excellent |
| Reframe P3 to serve the thesis | Yes — example direction given, specific sentence prescription provided | Good |
| Break paragraph rhythm with a 50–70 word paragraph | Yes — specific word count, specific location | Good |
| Rewrite P2's final sentence to plant P3's question | Yes — example given | Good |
| E2 thesis sharpen earlier | Somewhat — the diagnosis is right but "seed it earlier" isn't specific enough without identifying which paragraph or sentence | Needs more precision |

---

## Would an SEO Professional Find This Useful?

**Two types of SEO professionals; two different answers:**

**Content quality manager at an SEO agency:** Yes, immediately useful. This person reviews 20–50 articles/month against a quality standard. The structured L1 table saves 5 minutes per article. The L2 framework gives a consistent rubric that all reviewers apply the same way. The specific feedback (E4 statistic gap, E6 P2→P3 transition, E8 paragraph length) surfaces problems that inconsistent human review misses. The PUBLISH-READY verdict with improvement suggestions is exactly the output a manager needs to give a writer: "approved, but here's what would make it premium."

**Technical SEO specialist focused on rankings, backlinks, and keyword data:** Marginally useful. This person cares about L1 (anchor position, trust link validity, entity coverage) but won't be running editorial quality audits. The E-layer rubric is foreign to their workflow. Layer 1 as a standalone CLI script is the right tool for them, not the full audit.

---

## Skill Calibration Against the Test Case

The test article (job_07) is described in the foundation document as a reference example of good quality. The audit correctly concluded:
- PUBLISH-READY (not REVISE-THEN-PUBLISH)
- 4 Strongs, 4 Adequates, 0 Weak, 0 Failing
- 3 improvement suggestions that would elevate it further without rejecting it

This calibration is right. The skill didn't over-flag a good article. It found real (if minor) gaps in a good article — which is exactly what a useful quality standard should do.

If tested against a poor-quality article (generic hooks, summary closing, footnote trustlinks), the skill would correctly produce Failing ratings on E1/E4/E7 and a REWRITE-REQUIRED verdict. The rubric is calibrated to distinguish between the two.

---

## Changes the Skill Needs

| Gap | Fix |
|-----|-----|
| E5 rubric missing anchor text quality check | Add: "Is the anchor text descriptive of what's on the target page, or is it a generic noun/verb?" as a sub-check |
| Word count boundary warning doesn't propagate | Add to SKILL.md: if word count is within 20 words of boundary, flag as priority constraint in the Priority Actions section |
| E10 entity miss doesn't connect to strategic implication | Add to quality-standard.md Part 2 E3: when an entity from the list is missing entirely, note which semantic territory it represented and what was lost |
| E2 fix prescription is sometimes under-specified | The rubric should require the auditor to name a specific paragraph where the thesis should be seeded, not just say "seed it earlier" |

---

## Bottom Line

The skill produces audit reports that are:
- **Structured enough** to be consistent across reviewers and batches
- **Specific enough** to be actionable (quoted evidence, prescriptive fixes)
- **Calibrated correctly** — doesn't reject good articles, doesn't pass bad ones
- **Non-obvious in its best findings** — the P3 argument disruption, the trustlink statistic gap, and the uniform paragraph length are all things a skilled editor would notice but a standard QA reviewer would miss

The four gaps identified above are real but fixable without redesigning the skill. The most important is the anchor text quality check in E5 — it's a missing dimension in an otherwise complete rubric.

**Fit for production use:** Yes, for content agencies running structured backlink article programs. Not for one-off use or technical SEO work where L1 alone is sufficient.
