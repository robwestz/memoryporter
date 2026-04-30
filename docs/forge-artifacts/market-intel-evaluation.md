# Skill Evaluation: market-intelligence-report
## Test run: Swedish developer tools / code intelligence market (RepoBrain)

**Date:** 2026-04-13
**Evaluator:** Claude (Sonnet 4.6) — honest self-assessment
**Test niche:** AI-powered codebase documentation and intelligence tools, Sweden

---

## The Core Question

> Would Robin pay 100,000 SEK for this report from a consultant?
> Is it specific enough to make business decisions from?

**Short verdict: No to 100k SEK. Yes to making decisions.**

A more honest price point: this report as produced is worth **20,000–35,000 SEK** from a consultant — above a well-researched blog post, below a primary-research engagement. Here is why, in detail.

---

## What the Skill Did Well

### 1. Scope and Framing Were Correct

The skill correctly identified that "Swedish developer tools / code intelligence" was too broad and immediately narrowed to "AI-powered codebase documentation and intelligence tools" — tools that generate wikis and knowledge bases from repos. This is the right niche.

The scope decision to exclude general AI coding assistants (Copilot, Cursor) was the correct call. A less disciplined run would have mixed them in, producing a report about a $12B market where RepoBrain has zero relevance.

This is the most important judgment the skill had to make, and it made it correctly.

### 2. Competitor Discovery Was Substantive

The skill surfaced five competitors that matter:
- **DeepWiki** — the most directly relevant, launched April 2025
- **Google Code Wiki** — the most threatening, launched November 2025
- **Kodesage** — the closest enterprise analog
- **Bloop** — correctly identified as pivoting away from the space
- **Sourcegraph** — correctly classified as Tier 2

Critically: the skill identified that **no Tier 1 competitor is local-first** and that **RepoBrain's positioning map quadrant is empty**. That is a genuinely useful competitive insight that Robin can build strategy from.

### 3. The Single Most Actionable Insight Is Correct

> "The combination of local-first + rich visualization + free for private repos + single-file portable is occupied by RepoBrain alone. The addition of local LLM Q&A via Ollama would create a position Google and Cognition structurally cannot match."

This insight is:
- Specific (names the capability gap: Ollama Q&A)
- Names the competitors it counters (Google, Cognition)
- Explains why they cannot match it (cloud-only architecture is structural, not a feature choice)
- Gives Robin a concrete next engineering priority

This is the output of real competitive analysis, not generic "differentiate on quality" advice.

### 4. The Market Sizing Honesty Is Valuable

The skill correctly computed that Sweden's commercial TAM for this niche is ~$1.4M — small — and explicitly said so. It then explained what this means strategically: Sweden is a validation market and reference customer source, not a self-sufficient business.

A lesser analysis would have found a $12.8B global figure, applied some percentages, and declared the opportunity large. The skill's bottom-up discipline surfaced an uncomfortable truth that a founder actually needs to know.

### 5. The Positioning Map Is Correct and Useful

The X axis (cloud-only → local-first) and Y axis (text output → rich visualization) were chosen specifically for this niche, not pulled from a template. Robin can look at the map and verify from domain knowledge that every named competitor is correctly placed.

---

## Where the Skill Fell Short of 100k SEK

### 1. No Primary Research — This Is the Biggest Gap

A 100k SEK consulting report on the Swedish developer tools market would include:
- 5–10 interviews with Swedish engineering leads at banks, telecoms, and tech scaleups about their current codebase documentation pain
- Mystery shopping of Sourcegraph's enterprise sales process (what's the actual contract structure, the discount patterns, the objections)
- Win/loss style interviews: what would make teams actually pay for a codebase wiki rather than using DeepWiki free?

The skill's Phase 2 DISCOVER is entirely search-based. It found what is publicly visible. The question "would a Swedish CTO at Swedbank actually pay for RepoBrain, and what does their procurement process look like?" — that is unanswered.

**What this costs in practice:** The recommendations (build Ollama Q&A, get enterprise reference customer) may be correct in direction but lack validated demand signal. Robin cannot be certain GDPR is a purchase trigger vs. a nice-to-have until someone says "yes, I would have paid you for this."

### 2. Swedish Market Data Is Proxy-Based, Not Primary

The estimate of "~110,000 Swedish software developers" is inferred from a "400,000 tech sector workers, ~25-30% are developers" proxy. The actual figure might be 80,000 or 140,000 — a difference that changes the bottom-up TAM significantly.

A real consulting engagement would use Statistics Sweden (SCB) ICT occupational data, which gives exact headcount for "software and systems developers" in Sweden annually. That would replace the estimate with a citable number.

**Impact on report credibility:** Low — the strategic direction does not change if the number is 90k vs 120k. But it would not survive a CFO's scrutiny.

### 3. Competitor Profiles Are Missing Financial-Grade Data

The Kodesage profile says "estimated $15K–$80K ACV based on enterprise positioning" — this is inferred, not sourced. The Bloop funding ($7.43M) is sourced but the current product direction comes from a search snippet, not a read of their current website.

A premium report would have:
- Actual Kodesage pricing from a sales conversation
- Bloop's current positioning directly from their website
- Sourcegraph's actual churn data or revenue signals (available in press releases, employee LinkedIn posts, Glassdoor)

### 4. No Customer Voice Beyond Two Citations

The skill has two customer quotes and both are paraphrases ("inferred from," "reader comment"). A premium report would have 20–30 G2, Capterra, or Reddit quotes analyzed systematically for theme clustering: what do buyers praise, what do they complain about, how often does privacy appear as a concern vs. a complaint about documentation quality?

G2 does have reviews for Sourcegraph, GitHub Copilot, and Cursor. The skill did not mine them systematically.

### 5. Porter's Forces Are Evidence-Backed But Not Sweden-Specific

The Porter analysis is correct at a global level. But "threat of new entrants" in Sweden specifically might differ: are Swedish developers more likely to buy from a Swedish vendor? Is there a procurement preference for GDPR-native tools that would raise the effective barrier for non-EU entrants?

This nuance is absent because there was no primary research to surface it.

---

## Decision-Usefulness Assessment

The report IS specific enough to make these decisions:

| Decision | Can you make it from this report? |
|---------|----------------------------------|
| Should I add Ollama LLM Q&A as next priority? | **Yes** — whitespace is clearly identified and capability gap is specific |
| Is Sweden's commercial market large enough to sustain the business? | **Yes** — the answer is "no, not alone" and the report says why |
| Who should I talk to for a reference customer? | **Yes** — Swedish banking, defense, or telecom; Ericsson, Saab, Swedbank named |
| How should I reframe RepoBrain's positioning? | **Yes** — "private codebase wiki" leading with GDPR/privacy, not features |
| Should I worry about Google Code Wiki? | **Yes** — 6–12 month window is explicitly stated with evidence |
| What is RepoBrain's exact pricing model? | **No** — this required primary research (customer willingness to pay interviews) |
| Will GDPR actually drive purchase decisions or is it just marketing? | **No** — needs buyer interviews to validate |
| What is Kodesage's actual sales process and contract structure? | **No** — requires mystery shopping |

**5 out of 8 major decisions are addressable from this report. That is a pass for strategic orientation, not for financial-grade investment decisions.**

---

## Skill Self-Assessment

### What the skill did right (process)

- Followed all 7 phases in order
- Did not write the Executive Summary first
- Called out the scope problem (too broad) before searching
- Ran 7+ distinct searches covering different dimensions
- Distinguished between what was sourced and what was estimated
- The quality gate at the bottom is honest: STRENGTHEN-THEN-DELIVER, not DELIVERY-READY

### What the skill did wrong or could not do

- Phase 2 DISCOVER: should have fetched competitor product pages directly (not just search snippets). The skill fetched deepwiki.com and cursor.com — should also have fetched bloop.ai and kodesage.ai directly.
- Phase 3 MAP: could not mystery-shop Kodesage or Sourcegraph to get real pricing. A real analyst would send a sales inquiry and record the conversation.
- Phase 4 SIZE: bottom-up developer count used proxy arithmetic rather than a named official source. SCB data would fix this.
- The report is text-heavy where it could have used more tables for quick scanning (the Porter analysis table is good; the SWOT narrative is harder to use quickly).

### Anti-pattern compliance

| Anti-pattern | Did the skill avoid it? |
|-------------|----------------------|
| Too-broad niche | ✓ Narrowed immediately |
| Starting without scope brief | ✓ Phase 1 completed before discovery |
| Single-source TAM | ✓ Both methods shown |
| Porter forces without evidence | ✓ Named evidence for each |
| Unsourced pricing | Partial — Kodesage pricing is estimated, not sourced |
| Executive Summary written first | ✓ Written last |
| Generic recommendations | ✓ All recommendations are specific |
| Layer 1 pass = delivery ready | ✓ Acknowledged STRENGTHEN verdict honestly |
| More than 5 recommendations | ✓ 3 recommendations |
| Vague Layer 2 feedback | ✓ Specific deficiencies named |

---

## Verdict

**Price range for this report as produced:** 20,000–35,000 SEK

**Why not 100k:** Missing primary research (buyer interviews, mystery shopping) and official Swedish market data. The strategic direction is sound; the evidence base is thin.

**Why useful anyway:** The four most actionable insights — empty positioning map quadrant, Ollama Q&A as the right next build, Google's 6-12 month window, and Sweden-as-beachhead — are all correct and specific enough to act on today.

**What 100k SEK would add:** 8–12 buyer interviews with Swedish engineering leads. Actual Kodesage and Sourcegraph pricing from sales conversations. SCB occupational data for developer headcount. G2 review theme analysis. One mystery shop of Google Code Wiki's enterprise pipeline.

**Is the skill worth using for a founder validating a market before building?** Yes. It produces the right questions even when it cannot fully answer them. The skill correctly identified that "does GDPR actually drive purchase decisions?" is the most important question this report cannot answer — and it said so explicitly. That intellectual honesty is more valuable than a confident answer built on weak evidence.

---

## Recommendations for Skill Improvement

| Gap | Fix |
|----|-----|
| No G2/Capterra systematic review mining | Add to Phase 2 DISCOVER: explicit step to fetch G2 category page and extract top 20 reviews for theme coding |
| Proxy-based developer headcount | Add to Phase 4 SIZE: explicit instruction to search for official government statistics before using proxies |
| No product page fetches | Phase 3 MAP: for each Tier 1 competitor, fetch their homepage and pricing page directly (not just search snippets) |
| Porter forces lack Sweden-specific nuance | Phase 5: add a step to consider market-specific forces (local procurement preferences, national champions, regulatory environment) |
| Market sizing cross-validation threshold is 20% | For nascent markets with free-tier dominance, a tighter standard (10%) or a third validation method is warranted |
