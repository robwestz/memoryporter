# SEO Article Audit — Skill Verification Report

> Source: knowledge/meta-skills/skill-forge/references/quality-gate.md
> Package: knowledge/meta-skills/seo-article-audit/
> Verified: 2026-04-13

---

## Overall Result

| Category | MUST | SHOULD | CHECK |
|----------|------|--------|-------|
| 1. Structural Integrity | 13/13 PASS | — | 5/5 evaluated (2 N/A) |
| 2. Content Quality | — | 14/14 PASS | — |
| 3. Progressive Disclosure | — | 10/10 PASS | 1 N/A |
| 4. Compatibility | 3/3 PASS | 6/6 PASS | 3 N/A |
| 5. Marketplace Readiness | — | 5/6 PASS (1 FAIL) | 5/5 evaluated (1 N/A) |
| **Total** | **16/16** | **34/35 (97%)** | **All evaluated** |

**Gate result: PASS** — 16/16 MUST, 97% SHOULD (threshold 80%), all applicable CHECKs evaluated.

One SHOULD failure: `5.10` — `metadata.json` name field is machine-readable kebab-case, not a human-readable display name.

---

## Category 1: Structural Integrity — Full Detail

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|---------|
| 1.1 | MUST | SKILL.md exists at package root | PASS | Present |
| 1.2 | MUST | SKILL.md has valid YAML frontmatter | PASS | Parsed cleanly |
| 1.3 | MUST | Frontmatter has `name` | PASS | "seo-article-audit" |
| 1.4 | MUST | Frontmatter has `description` | PASS | 77 words, 523 chars |
| 1.5 | MUST | Frontmatter has `author` | PASS | "Robin Westerlund" |
| 1.6 | MUST | Frontmatter has `version` | PASS | "1.0.0" |
| 1.7 | MUST | `name` is lowercase-kebab-case | PASS | Matches `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` |
| 1.8 | MUST | `description` >= 50 chars | PASS | 523 chars |
| 1.9 | MUST | SKILL.md body < 500 lines | PASS | 183 total lines, ~169 body |
| 1.10 | MUST | All SKILL.md file references exist | PASS | 5 references, all present |
| 1.11 | MUST | No hardcoded absolute paths | PASS | No `/Users/`, `C:\`, `/home/` |
| 1.12 | MUST | No API keys or secrets | PASS | None found |
| 1.13 | MUST | Directory matches declared shape | PASS | Production: SKILL.md + README + metadata + templates/ + references/ + scripts/ |
| 1.14 | CHECK | metadata.json is valid JSON | PASS | Parsed cleanly |
| 1.15 | CHECK | metadata.json `name` matches SKILL.md `name` | PASS | Both "seo-article-audit" |
| 1.16 | CHECK | templates/ has ≥ 1 .md file | PASS | audit-report.md, feedback-card.md |
| 1.17 | CHECK | examples/ has ≥ 1 complete example | N/A | No examples/ directory (not required by spec) |
| 1.18 | CHECK | Scripts have usage comment in first 10 lines | PASS | Usage block lines 3–12 |
| 1.19 | CHECK | evals.json valid with ≥ 3 test cases | N/A | No evals/ directory |

**Note:** `scripts/__pycache__/` was created by the test run. Not a packaging concern — exclude from distribution.

---

## Category 2: Content Quality — Full Detail

| # | Check | Result | Evidence |
|---|-------|--------|---------|
| 2.1 | First section delivers standalone value | PASS | Quick Start: inputs + invocation example + output description in one screenful |
| 2.2 | Tables for 3+ parallel items | PASS | Input table, Layer 1 check table, Layer 2 dimension table, verdict table, anti-pattern table, reference table |
| 2.3 | Anti-pattern per major section | PASS | 18 anti-pattern markers across SKILL.md; explicit Anti-patterns (Auditor) section |
| 2.4 | Decision tables for choices | PASS | Verdict logic is a strict if/then table; Layer 1 check table; Layer 2 dimension table |
| 2.5 | Imperative form throughout | PASS | "Run", "Read", "Never stop", "Record", "Use" — no "you should" or passive voice |
| 2.6 | Examples for ambiguous rules | PASS | quality-standard.md has failure signals + pass signals + quoted examples per dimension |
| 2.7 | No "be smart" or vague directives | PASS | None found |
| 2.8 | Key insight in first paragraph of each section | PASS | Every section opens with its core instruction |
| 2.9 | Verification steps are testable | PASS | All Layer 1 checks have exact numeric thresholds; Layer 2 ratings have 0–3 scale with defined criteria |
| 2.10 | Code examples syntactically valid | PASS | CLI invocation example is syntactically valid bash |
| 2.11 | Templates have Fixed/Variable annotations | PASS | Both templates use `<!-- [FIXED] -->` and `<!-- [VARIABLE] -->` throughout |
| 2.12 | Worked examples are real, not stubs | PASS | Templates produce a complete, fillable audit report |
| 2.13 | No orphan references | PASS | All 5 cross-references in SKILL.md point to existing files |
| 2.14 | Consistent terminology | PASS | "Layer 1/Layer 2" and "mechanical/editorial" used consistently throughout |

---

## Category 5 Failure: 5.10 Display Name

**Check:** `metadata.json` display name should be human-readable, not kebab-case.

**Current:** `"name": "seo-article-audit"`

**Required:** `"name": "SEO Article Audit"`

This is a SHOULD failure. The machine-readable key in SKILL.md frontmatter (`name: seo-article-audit`) is correct as kebab-case. The `metadata.json` `name` field is intended as the display name for marketplace listings and should read as "SEO Article Audit".

**Fix:**

```json
"name": "SEO Article Audit",
```

---

## Script Comparison: mechanical-audit.py vs article_validator.py

Both scripts run against job_07.md with identical inputs and produce identical results on all 11 checks:

| Check | BACOWR result | Skill result | Match |
|-------|--------------|--------------|-------|
| 1 Word count | 761 PASS | 761 PASS | ✓ |
| 2 Anchor present | 1 PASS | 1 PASS | ✓ |
| 3 Anchor count | 1 PASS | 1 PASS | ✓ |
| 4 Anchor position | 469 PASS | 469 PASS | ✓ |
| 5 Trust links | 1 PASS | 1 PASS | ✓ |
| 6 No bullets | 0 PASS | 0 PASS | ✓ |
| 7 Headings | 1 PASS | 1 PASS | ✓ |
| 8 Forbidden phrases | 0 PASS | 0 PASS | ✓ |
| 9 Language | sv PASS | sv PASS | ✓ |
| 10 SERP entities | 4/5 PASS | 4/5 PASS | ✓ |
| 11 Paragraphs | 5 PASS | 5 PASS | ✓ |

### Divergences (do not affect job_07, matter for edge cases)

**Divergence 1 — Subdomain trust links (Check 5)**

BACOWR uses exact domain equality: `domain == target_domain`
Skill uses `is_subdomain_of()`: `domain == parent or domain.endswith("." + parent)`

Effect: A link to `blog.rusta.com` when target domain is `rusta.com`:
- BACOWR → counts as valid trustlink (PASSES)
- Skill → rejects it, marks as "links to target domain" (FAILS)

**Verdict: Skill is more correct.** The standard says "Domain ≠ target domain" — this should include subdomains, since `blog.rusta.com` shares equity with `rusta.com`. BACOWR has a gap here.

**Divergence 2 — Blockquote word count (Check 1)**

BACOWR does not strip `>` blockquote markers before counting. Each `>` at line start adds 1 word.
Skill strips `>` markers before counting.

Effect: An article with 3 blockquote lines would count 3 words higher in BACOWR.

On job_07 (no blockquotes): no difference.

**Verdict: Skill is more correct.** Blockquote markers are not content words. For a typical 800-word article with 2–3 blockquoted lines, the difference is 2–3 words — within noise for the 750–900 window but worth being consistent.

**Divergence 3 — Language stop word coverage (Check 9)**

BACOWR stop word sets are larger: includes `i, vi, ska, vara, bli, nya, mer, hos, eller, men, hur, vad, var, alla, från, utan, detta, dessa, här, efter, under, vid` (Swedish) vs the skill's smaller set.

On job_07: both detect `sv` correctly (BACOWR: SV:31 EN:0, Skill: similar).

**Verdict: BACOWR is more robust** for sparse or mixed-language text. The skill's sets are adequate for normal Swedish articles but could misfire on a 100-word excerpt or a heavily entity-dense text with few function words.

**Divergence 4 — Anchor search method (Check 2/3/4)**

BACOWR uses `text.count(pattern)` and `text.find(pattern)` — literal string search.
Skill uses `re.escape(pattern)` with `re.findall()` / `re.search()` — regex after escaping.

Effect: Functionally identical for standard anchor text. The skill is marginally more robust if the anchor text contains characters that are special in string search contexts (unlikely in practice).

**Verdict: Equivalent in practice.** No impact on real articles.

---

## Forbidden Phrases — Completeness Check

Both `references/forbidden-phrases.md` and `scripts/mechanical-audit.py` contain exactly 23 phrases, in identical order, matching `article_validator.py` verbatim.

| Verified | Count | Match |
|----------|-------|-------|
| forbidden-phrases.md | 23 ✓ | Matches BACOWR exactly |
| mechanical-audit.py | 23 ✓ | Matches BACOWR exactly |

---

## Editorial Checks — Specificity Assessment

**Are the editorial checks specific enough (not just "good/bad")?**

The quality-standard.md rubric provides for each of the 8 dimensions:
- Exact assessment procedure (numbered steps)
- Explicit failure signals with example phrasings
- Explicit pass signals with reference examples (job_07/08)
- Required output format (what the auditor must produce)

Testing against job_07 confirms specificity:

| Dimension | Evidence of specificity |
|-----------|------------------------|
| E1 Hook | Quoted "Formex visade i januari..." — specific diagnosis that "inte synts sedan sjuttiotalet" creates uniqueness |
| E2 Thesis | Auditor-written one-sentence summary produced; specific identified P3 as the disrupting paragraph |
| E3 Entities | Specific example of strong deployment (Pantone sentence); entity count reported (8+) |
| E4 Trustlink | Quoted trustlink sentence; identified absence of specific statistic as the gap |
| E5 Anchor | Remove-link test performed and reported; specific SERP entity density noted |
| E6 Red Thread | Weakest transition quoted (both closing and opening sentences); specific fix prescribed |
| E7 Closing | Final sentence quoted; diagnosis distinguishes reframing vs recap |
| E8 AI Smell | Two patterns cited with evidence: P3 encyclopedic content + uniform 142–161 word band |

**Assessment: Specific enough.** Every finding in the test audit includes quoted evidence and a named fix. No "could be stronger" vagueness in the output.

---

## Verdict Calibration Check

**Question: Does a BACOWR reference article (job_07) score appropriately?**

Result: PUBLISH-READY (20/24 Layer 2, 11/11 Layer 1, 0 Failing, 0 Weak)

This is the correct tier for job_07. The design documentation explicitly lists it as a reference example of good quality. The audit found real but minor improvement areas (E4 missing statistic, E6 P2→P3 transition, E8 paragraph rhythm) without failing any dimension — consistent with a publishable article that could be made premium with targeted edits.

**Verdict naming divergence:** The user's request specified four tiers (Reject / Revise / Acceptable / Premium). The skill implements three tiers (REWRITE-REQUIRED / REVISE-THEN-PUBLISH / PUBLISH-READY), matching the design specification (seo-audit-design.md §6). The mapping is:

| User request tier | Skill tier |
|-------------------|-----------|
| Reject | REWRITE-REQUIRED |
| Revise | REVISE-THEN-PUBLISH |
| Acceptable | PUBLISH-READY |
| Premium | (not distinguished from Acceptable) |

The "Premium" tier from the request has no equivalent in the skill — there is no distinction between a 20/24 and a 24/24 article beyond the PUBLISH-READY verdict. This is a minor gap if the system is used to grade articles on a quality curve. Low-impact for most use cases.

---

## Required Fix

**5.10 — metadata.json display name** (SHOULD)

```diff
- "name": "seo-article-audit",
+ "name": "SEO Article Audit",
```

---

## Recommended Improvements (from earlier evaluation)

These are not quality gate failures — they are skill improvements identified during live testing:

1. **E5 rubric missing anchor text quality check** — add a sub-check: "Is the anchor text descriptive of the target page content, or is it a generic noun/verb?" The current rubric checks sentence naturalness but not link text quality.

2. **Word count boundary warning not propagated** — when L1 Check 1 reports a word count within 20 words of 750 or 900, the Priority Actions section should flag this as a constraint that must be re-verified after implementing any recommended edits.

3. **Missing entity → strategic implication** — when a SERP entity is missing from the text (Check 10), quality-standard.md should prompt the auditor to note *which semantic territory* that entity represented, not just that it was absent.

4. **4-tier vs 3-tier verdict** — if the workflow needs to distinguish Acceptable from Premium, add a PREMIUM tier: Layer 1: 11/11 AND Layer 2: ≥ 5 Strong, 0 Weak/Failing.
