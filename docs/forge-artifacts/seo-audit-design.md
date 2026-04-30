# SEO Article Audit Skill — Design Specification

> Input: seo-audit-foundation.md + skill-forge/SKILL.md packaging standards
> Output: Complete specification for the `seo-article-audit` skill package
> Date: 2026-04-13

---

## 1. Skill Identity

| Field | Value |
|-------|-------|
| **Name** | `seo-article-audit` |
| **Trigger phrases** | "audit this article", "check this backlink article", "review seo article quality", "is this article ready", "QA this article" |
| **Input** | Markdown article text + metadata (anchor_text, target_url, publisher_domain, optional: serp_entities[], expected_language) |
| **Output** | Structured two-layer audit report with pass/fail + actionable per-dimension feedback |
| **Shape** | **Production** (SKILL.md + README + metadata + templates/ + references/ + scripts/) |
| **Version** | 1.0.0 |

### Why Production shape

- Layer 1 is fully deterministic — worth a runnable script (`run_layer1.py`)
- The audit report has predictable repeating structure → output template needed
- References for the two rubrics are too long for the main SKILL.md body
- Others will install and run this against batch jobs, not just one-offs

---

## 2. Package File Manifest

```
seo-article-audit/
├── SKILL.md                        ← Main skill instruction (agent reads this)
├── README.md                       ← Installation + usage guide
├── metadata.json                   ← Package metadata
│
├── templates/
│   └── audit-report.md             ← Output format template (Fixed/Variable zones)
│
├── references/
│   ├── mechanical-checks.md        ← All 11 checks with exact thresholds + edge cases
│   └── editorial-rubric.md         ← 8 editorial dimensions with scoring criteria
│
└── scripts/
    └── run_layer1.py               ← CLI: runs 11 mechanical checks, prints report
```

---

## 3. SKILL.md — Content Design

### Frontmatter

```yaml
---
name: seo-article-audit
description: |
  Audits a backlink SEO article in two layers: mechanical QA (11 deterministic
  checks) and editorial quality (8 judgment-based dimensions). Use when reviewing
  a finished article before publishing, diagnosing why an article feels "off",
  grading a batch of articles against the BACOWR quality standard, or training a
  writer on what separates premium from mediocre SEO content. Trigger on: "audit
  this article", "check this backlink article", "is this article ready to publish",
  "QA this SEO article", "review article quality".
author: Robin Westerlund
version: 1.0.0
---
```

### Body sections (in order)

**1. Quick Start** — Inputs required, single invocation example, what the output looks like.

**2. Inputs** — Table:

| Input | Required | Type | Notes |
|-------|----------|------|-------|
| article_text | Yes | markdown string | Full article including title |
| anchor_text | Yes | string | Exact anchor text from job spec |
| target_url | Yes | string | Full URL of anchor destination |
| publisher_domain | Yes | string | Domain of publisher site (no www) |
| serp_entities | No | string[] | Entity list from SERP probes. Check 10 skipped if omitted |
| expected_language | No | "sv" / "en" | Defaults to "sv" |

**3. The Two-Layer Model** — Brief explanation of why two layers exist and what each produces.

**4. Layer 1: Mechanical Checks** — Overview only. Point to `references/mechanical-checks.md` for thresholds. Key instruction: run `scripts/run_layer1.py` if Python is available; otherwise perform checks manually in order. If any check fails → report it and continue (do not stop at first failure).

**5. Layer 2: Editorial Audit** — The 8 dimensions. For each: what to assess, what to quote, how to rate. See Section 5 of this design doc for full rubric.

**6. Output Format** — Instruction to use `templates/audit-report.md` as the output structure. NEVER produce a narrative blob — always use the structured template.

**7. Anti-patterns** — What the auditor must NOT do:
- Do not conflate Layer 1 and Layer 2. A 11/11 mechanical pass does not mean the article is good.
- Do not produce vague feedback ("could be stronger"). Every finding must quote the specific text and name the specific fix.
- Do not invent SERP entity failures if no entities were provided — skip Check 10.
- Do not re-write the article in the audit. Diagnose, prescribe, stop.
- Do not merge multiple Layer 2 issues into one finding. Each dimension is separate.

**8. Quick Reference** — Compact reminder table of all 11+8 checks for scanning.

---

## 4. Layer 1 — Mechanical Checks Reference Design

File: `references/mechanical-checks.md`

Header: "Read this when performing manual Layer 1 checks or when a Layer 1 failure needs deeper diagnosis."

### Content for each of the 11 checks

Each check entry contains:
- **Threshold** (exact value from article_validator.py)
- **How to measure** (manual procedure if no script)
- **Pass example** (quoted fragment)
- **Fail example** (quoted fragment)
- **Edge case** (the non-obvious case that trips reviewers)

#### Check-specific edge cases to document

| Check | Key edge case |
|-------|--------------|
| 1 Word count | Markdown stripped before counting — link text counts, URLs do not |
| 2 Anchor present | Exact string match including parentheses — partial match fails |
| 3 Anchor count | Two occurrences of same anchor = fail even if one is in different context |
| 4 Anchor position | Position measured in stripped-text words, not raw character offset |
| 5 Trust links | A link after the anchor that would otherwise qualify still fails — position is absolute |
| 5 Trust links | A link to a subdomain of target/publisher domain also fails |
| 6 No bullets | A dash at line start in flowing prose (em-dash fragment) is NOT a bullet — but check the pattern |
| 7 Headings | The article title itself is the 1 allowed heading. Any body heading = fail |
| 8 Forbidden phrases | "sammanfattningsvis" alone triggers — it is listed separately from the longer variant |
| 9 Language | If article mixes languages significantly, heuristic may misfire — manual verify |
| 10 SERP entities | Entities matched case-insensitively. Plural/singular variants may not match |
| 11 Paragraphs | A heading followed by no text on same line = heading-only block, excluded from count |

---

## 5. Layer 2 — Editorial Rubric Design

File: `references/editorial-rubric.md`

Header: "Read this when performing Layer 2. Each dimension has a rating scale (Strong/Adequate/Weak/Failing), assessment procedure, and required output format."

### Rating scale

| Rating | Score | Meaning |
|--------|-------|---------|
| **Strong** | 3 | Exceeds standard — positive example for the writer |
| **Adequate** | 2 | Meets standard — no action needed |
| **Weak** | 1 | Below standard — fixable with specific rewrite |
| **Failing** | 0 | Major issue — must be fixed before publishing |

### The 8 Editorial Dimensions

---

#### E1: Hook Quality

**What to assess:** Does the opening paragraph lead with a specific observation/datapunkt/counter-intuitive claim — or does it open with background, definition, or helicopter perspective?

**Assessment procedure:**
1. Read only the first paragraph.
2. Ask: Does this opening only work for THIS article, or could it introduce any article in this topic area?
3. Ask: Is the first sentence a claim/observation, or a setup/context?

**Failure signals (→ Failing/Weak):**
- Starts with historical background ("Sedan länge har X...")
- Starts with broad definition ("X definieras som...")
- Starts with helicopter observation ("Allt fler X..." or "X har blivit allt viktigare...")
- First paragraph is interchangeable with any article on this topic

**Pass signals (→ Adequate/Strong):**
- Opens with a specific event, datapunkt, or named source
- First sentence makes a claim that requires reading on to verify
- Hook is uniquely tied to this article's thesis — not generic to the topic

**Required output:** Rating + quoted first sentence + specific diagnosis.

---

#### E2: Thesis Clarity

**What to assess:** Can the auditor distill the article's central argument into one sentence? Does the article actually argue something, or does it just describe?

**Assessment procedure:**
1. After reading the full article, write one sentence summarizing the argument.
2. Ask: Does the article take a position, or does it survey a topic?
3. Ask: Would a specialist react with "hmm, is that true?" — or with "yes, obviously"?

**Failure signals:**
- Article is a tour of a topic with no central claim
- Every paragraph introduces a new point with no throughline
- The "argument" is a truism ("good lighting improves a room")
- Auditor cannot write the one-sentence summary

**Pass signals:**
- Clear position that a reader could agree or disagree with
- Specific claim supported by named entities/data from SERP research
- Paragraphs circle back to and develop the same argument

**Required output:** Rating + auditor's one-sentence summary of the argument (if extractable) + diagnosis.

---

#### E3: Entity Integration

**What to assess:** Are SERP entities (core, cluster, LSI) used with precision as natural vocabulary — or are they listed/forced/introduced as concepts?

**Assessment procedure:**
1. Identify where SERP entities appear in the text.
2. For each occurrence, ask: Is the entity the natural word choice here, or is it dropped in?
3. Count entities used. If < 4 unique → feeds back to Layer 1 Check 10.

**Failure signals:**
- "Ett begrepp som blivit aktuellt är [entity]" — introducing instead of deploying
- Entity appears in a list or enumeration rather than embedded in argument
- Entity appears in only one paragraph (clustering vs. distribution)
- Generic terms used where a SERP entity would be more precise

**Pass signals:**
- Entity is the natural word choice in its sentence — removing it would weaken precision
- Entities distributed across multiple paragraphs
- LSI terms appear naturally in context without announcement

**Required output:** Rating + one example of good deployment (if any) + one example of weak deployment (if any) + entity count visible in the text.

---

#### E4: Trustlink Integration

**What to assess:** Are trustlinks woven into the argument as evidence — or dropped as citations/footnotes?

**Assessment procedure:**
1. Find each trustlink in the text.
2. For each: Does the surrounding sentence introduce a specific finding/number/claim from the linked source?
3. Ask: Does the link make the reader think "I want to read more of that" — or "okay, source noted"?

**Failure signals:**
- "Enligt [källa] är X viktigt." — generic citation without substance
- Link anchor is a generic descriptor ("klicka här", "läs mer", "enligt denna källa")
- Trustlink appears in a sentence that would say the same thing without it
- No concrete claim from the source in the surrounding text

**Pass signals (model from job_07/08):**
- Specific statistic or finding from the source introduced before/around the link
- The linked claim advances the article's argument — not just supports it
- Anchor text is descriptive of the actual content (e.g., "en kartläggning av textiltrenderna för 2025")

**Required output:** Rating + quoted trustlink sentence + diagnosis for each trustlink found.

---

#### E5: Anchor Naturalness

**What to assess:** Does the anchor link feel like the natural practical destination of the argument at that point — or does it feel like a commercial interruption?

**Assessment procedure:**
1. Find the anchor paragraph.
2. Read the paragraph WITHOUT the hyperlink. Does the sentence work standalone?
3. Read WITH the link. Does the linked resource feel like the natural next step?
4. Ask: Is this the strongest, most concrete paragraph in the article?

**Failure signals:**
- Sentence doesn't work without the link (grammatical or logical dependency on the link text)
- Paragraph feels like it exists only to host the link
- Anchor paragraph is weaker than surrounding paragraphs
- Link anchor uses CTA language ("läs mer", "klicka här")
- Anchor context does not contain core SERP entities

**Pass signals:**
- Paragraph is the most concrete/specific in the article
- Sentence works without the link — link adds a resource, not a grammatical dependency
- Surrounding text contains SERP entities relevant to the anchor's target topic

**Required output:** Rating + quoted anchor sentence + result of the "remove-link test" + specific diagnosis.

---

#### E6: Red Thread

**What to assess:** Does each paragraph continue the argument from the previous one, advancing/complicating/deepening the thesis — or does the article restart topics paragraph by paragraph?

**Assessment procedure:**
1. For each paragraph transition (P1→P2, P2→P3, etc.): Does the opening of the next paragraph pick up the thread from the close of the previous?
2. For each paragraph: Does it underpin, complicate, or deepen the thesis — or does it just introduce new information?
3. Ask the "and then what?" test: Does each paragraph's conclusion naturally open the door to the next?

**Failure signals:**
- Two consecutive paragraphs on entirely different sub-topics with no bridging
- A paragraph that could be moved anywhere in the article without breaking flow
- Closing sentence of a paragraph does not open onto anything — it just ends
- Article feels like a collection of paragraphs rather than a developing argument

**Pass signals:**
- Each paragraph's last sentence creates a question or implication that the next paragraph answers
- The argument is traceable: P1 → P2 → P3 as a logical sequence
- No paragraph is detachable without breaking something

**Required output:** Rating + identification of weakest transition (quote the closing + opening sentences) + overall thread summary.

---

#### E7: Closing Quality

**What to assess:** Does the final paragraph end with a genuine insight, implication, or forward-look — or does it summarize what was already said?

**Assessment procedure:**
1. Read only the last paragraph.
2. Ask: Is there anything here the reader didn't have after reading the previous paragraphs?
3. Ask: Does the final sentence stay with the reader?
4. Ask: If the article ended one paragraph earlier, would anything of value be lost?

**Failure signals:**
- Last paragraph begins with "Sammanfattningsvis", "Sammantaget", "Kort sagt", or equivalent
- Last paragraph is a restatement of the opening thesis without development
- Last sentence is a generic wrap-up ("Oavsett val finns det alternativ för alla behov")
- The close could be from any article on this topic

**Pass signals (model from job_07/08):**
- Final paragraph introduces a new angle, consequence, or cultural/structural observation
- Last sentence makes a claim that resonates beyond the immediate topic
- Close could not work as the close to any other article — it's specific to this one's argument

**Required output:** Rating + quoted final sentence + diagnosis.

---

#### E8: AI Smell

**What to assess:** Does the article exhibit any of the 10 mediocrity patterns from editorial-overlay's anti-pattern table — the signals that reveal the text as mechanical, generic, or AI-generated?

**Assessment procedure:** Scan for each pattern explicitly:

| Pattern | Check |
|---------|-------|
| Opens with history/background | Check first paragraph |
| "X är viktigt eftersom..." phrasing | Grep for "viktigt" + "eftersom/för att" patterns |
| Descriptive paragraphs (no argument) | Check each paragraph: describe vs. argue |
| Trustlinks as footnotes | Covered by E4, surface here if relevant |
| Anchor as interruption | Covered by E5, surface here if relevant |
| Summary-style closing | Covered by E7, surface here if relevant |
| Generic observations not grounded in SERP data | Check for sentences that could appear in any topic article |
| Uniform paragraph length | Visual scan — all paragraphs ≈ same word count? |
| Uniform sentence structure | Are all sentences Subject-Verb-Object? Any variation? |
| Filler and padding | Are there sentences that can be removed with zero information loss? |

**Required output:** Rating + list of detected patterns with quoted evidence for each + count of patterns found.

Note: 0 patterns = Strong. 1–2 patterns = Adequate/Weak depending on severity. 3+ patterns = Failing.

---

## 6. Audit Report Template Design

File: `templates/audit-report.md`

### Template structure (Fixed/Variable zones)

```markdown
<!-- [FIXED] Header — never change structure -->
# Article Audit Report

<!-- [VARIABLE] Job identification -->
**Article:** [title or first 8 words]
**Anchor:** [anchor_text] → [target_url]
**Publisher:** [publisher_domain]
**Audited:** [date]

---

<!-- [FIXED] Layer 1 section header -->
## Layer 1 — Mechanical Checks

<!-- [VARIABLE] Results table — fill all 11 rows -->
| # | Check | Status | Value | Expected | Note |
|---|-------|--------|-------|----------|------|
| 1 | Word count | PASS/FAIL | [n] words | 750-900 | |
| 2 | Anchor present | PASS/FAIL | [n] found | ≥1 | |
| 3 | Anchor count | PASS/FAIL | [n] | exactly 1 | |
| 4 | Anchor position | PASS/FAIL | word [n] | 250-550 | |
| 5 | Trust links | PASS/FAIL | [n] valid | 1-2 | [issues if any] |
| 6 | No bullets | PASS/FAIL | [n] found | 0 | |
| 7 | Headings | PASS/FAIL | [n] found | ≤1 | |
| 8 | Forbidden phrases | PASS/FAIL | [n] found | 0 | [phrases if any] |
| 9 | Language | PASS/FAIL | [detected] | [expected] | |
| 10 | SERP entities | PASS/FAIL/SKIP | [n] of [total] | ≥4 | [missing if any] |
| 11 | Paragraphs | PASS/FAIL | [n] | ≥4 | |

<!-- [VARIABLE] Layer 1 verdict -->
**Layer 1 Result:** [n]/11 PASS — [APPROVED / REJECTED — list failing checks]

---

<!-- [FIXED] Layer 2 section header -->
## Layer 2 — Editorial Quality

<!-- [FIXED] Rating legend -->
> Rating: **Strong** (3) | **Adequate** (2) | **Weak** (1) | **Failing** (0)

<!-- [VARIABLE] Repeat this block for each of the 8 dimensions -->
### E1: Hook Quality — [Rating]

**Evidence:** "[quoted text from article]"

**Diagnosis:** [What specifically is wrong or right, in one sentence]

**Fix:** [If Weak/Failing: exact instruction for what to rewrite. If Strong/Adequate: omit or note what works.]

---
[repeat E2–E8]

<!-- [FIXED] Summary section -->
## Summary

<!-- [VARIABLE] -->
**Layer 1:** [n]/11 PASS
**Layer 2:** [total score]/24 — [Strong: n, Adequate: n, Weak: n, Failing: n]

**Verdict:** [PUBLISH-READY / REVISE-THEN-PUBLISH / REWRITE-REQUIRED]

| Verdict | Condition |
|---------|-----------|
| PUBLISH-READY | Layer 1: 11/11 AND Layer 2: no Failing, ≤2 Weak |
| REVISE-THEN-PUBLISH | Layer 1: 11/11 AND Layer 2: 1 Failing or 3+ Weak |
| REWRITE-REQUIRED | Layer 1: any FAIL OR Layer 2: 2+ Failing |

**Priority Actions (max 3, ordered by impact):**
1. [Most critical fix]
2. [Second fix]
3. [Third fix if applicable]
```

---

## 7. Script Design

File: `scripts/run_layer1.py`

### Purpose

Standalone CLI that runs Layer 1's 11 mechanical checks against an article file. Wraps the same logic as `article_validator.py` from BACOWR. Useful for batch QA without agent invocation.

### Interface

```
Usage:
  python run_layer1.py <article_file> \
    --anchor "anchor text here" \
    --target "https://target.com/page" \
    --publisher "publisherdomain.com" \
    [--language sv|en] \
    [--entities "entity1,entity2,entity3,entity4"]

Output:
  Prints Layer 1 table to stdout.
  Exits 0 if all 11 pass, 1 if any fail.
```

### Implementation notes

- Accepts `--entities` as comma-separated string, splits internally
- Prints table in the same format as the audit-report.md template
- Does NOT require article_validator.py — reimplements the checks inline so the script is self-contained
- At the bottom of each FAIL line, prints the fix hint (e.g., "word count 712, need 750–900: add ~38 words")
- Handles missing file gracefully with a clear error message

### What the script does NOT do

- Layer 2 — that requires LLM judgment
- Fetch or verify trustlink URLs — only checks structural rules
- Fix the article — diagnose only

---

## 8. README.md Design

### Required sections

1. **Title + one-liner** — "seo-article-audit — Two-layer quality audit for backlink SEO articles"
2. **What it does** — 3 sentences: Layer 1 (11 mechanical checks), Layer 2 (8 editorial dimensions), output format.
3. **Supported clients** — Claude Code, any Claude agent with file-read access
4. **Prerequisites** — Python 3.9+ for `scripts/run_layer1.py`. No dependencies for agent-only use.
5. **Installation** — Drop the folder into `.skills/` or reference from skill-engine.
6. **Trigger conditions** — Bullet list of phrases
7. **Expected outcome** — A completed audit-report.md with Layer 1 table + 8 editorial findings + verdict + 3 priority actions
8. **Files table** — All 8 files with one-line purpose
9. **Troubleshooting** — Min 2 entries:
   - "Layer 1 passes but article still feels wrong" → That is what Layer 2 is for. Run the full audit.
   - "Check 10 always skips" → Pass `serp_entities` from the BACOWR engine's probe output.
   - "Script fails with permission error" → `chmod +x scripts/run_layer1.py` or run with `python scripts/run_layer1.py`

---

## 9. metadata.json Design

```json
{
  "name": "seo-article-audit",
  "description": "Two-layer audit for backlink SEO articles. Layer 1: 11 deterministic mechanical checks (word count, anchor placement, trustlinks, forbidden phrases, etc.). Layer 2: 8 editorial quality dimensions (hook, thesis, entity integration, red thread, closing). Produces structured report with ratings, quoted evidence, and actionable fixes.",
  "category": "skills",
  "author": {
    "name": "Robin Westerlund",
    "github": "robinwesterlund"
  },
  "version": "1.0.0",
  "requires": {
    "open_brain": false,
    "services": [],
    "tools": ["read", "write"]
  },
  "tags": ["seo", "content-audit", "backlink", "qa", "editorial", "writing-quality"],
  "difficulty": "intermediate",
  "estimated_time": "5-10 minutes per article",
  "created": "2026-04-13",
  "updated": "2026-04-13"
}
```

---

## 10. Skill Workflow (agent invocation sequence)

```
INVOKE
  │
  ├─ Read SKILL.md (agent does this on activation)
  ├─ Read references/mechanical-checks.md
  ├─ Read references/editorial-rubric.md
  │
  ▼
LAYER 1 — Mechanical (11 checks)
  │
  Option A: Python available → run scripts/run_layer1.py → parse output
  Option B: No Python → perform checks manually using references/mechanical-checks.md
  │
  ├─ Any FAIL? → note it, continue (do not stop)
  ├─ Record all 11 results
  │
  ▼
LAYER 2 — Editorial (8 dimensions)
  │
  ├─ Read article fully before scoring any dimension
  ├─ Score E1–E8 using references/editorial-rubric.md
  ├─ For each dimension: produce Rating + quoted evidence + diagnosis + fix (if Weak/Failing)
  │
  ▼
REPORT
  │
  ├─ Copy templates/audit-report.md
  ├─ Fill all Variable zones with Layer 1 + Layer 2 results
  ├─ Compute verdict (PUBLISH-READY / REVISE-THEN-PUBLISH / REWRITE-REQUIRED)
  ├─ Write 3 priority actions ordered by impact
  │
  ▼
OUTPUT
  └─ Return completed audit report (or write to file if path provided)
```

---

## 11. Key Design Decisions and Rationale

| Decision | Rationale |
|----------|-----------|
| Layer 1 and Layer 2 always both run, even if L1 fails | A L1-failing article may still have editorial lessons; partial feedback is better than nothing |
| Layer 2 rating scale is 0–3 per dimension (not pass/fail) | Editorial quality is a spectrum; binary would lose diagnostic value |
| Verdict thresholds are defined in the template, not left to judgment | Prevents inconsistent verdicts across auditors and batches |
| Script is self-contained (no import from article_validator.py) | Ensures script works standalone without BACOWR installation |
| E8 (AI smell) surfaces evidence from other dimensions if relevant | Some anti-patterns overlap with E4/E5/E7; allow surfacing at the summary level without double-counting |
| Priority actions capped at 3 | Forces the auditor to rank, prevents overwhelming the writer |
| Quoted evidence required for every Layer 2 finding | Vague feedback ("could be stronger") is disallowed by design — the template enforces specificity |

---

## 12. Forge Execution Plan

When forging this skill, write files in this order:

1. `references/mechanical-checks.md` — most content, least judgment
2. `references/editorial-rubric.md` — core rubric, drives SKILL.md content
3. `templates/audit-report.md` — output shape before the agent instructions
4. `SKILL.md` — references the above three; write last so it can link accurately
5. `scripts/run_layer1.py` — mechanical implementation of Layer 1
6. `README.md` — written last once all files are stable
7. `metadata.json` — written last, purely declarative

Verify after each file: does it follow the Fixed/Variable zone pattern? Does SKILL.md body stay under 500 lines? Do all cross-references point to files that exist?
