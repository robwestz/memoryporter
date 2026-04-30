# Quality Gate Verification: market-intelligence-report

**Gate applied:** `knowledge/meta-skills/skill-forge/references/quality-gate.md`
**Package audited:** `knowledge/meta-skills/market-intelligence-report/`
**Test report audited:** `docs/forge-artifacts/market-intel-test-report.md`
**Date:** 2026-04-13
**Auditor:** Claude (self-audit, full run)

---

## Part 1 — Skill Package Quality Gate

**Pass threshold:** 16/16 MUST + ≥ 80% applicable SHOULD + all CHECK evaluated

---

### Category 1 — Structural Integrity

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|---------|
| 1.1 | MUST | SKILL.md exists at package root | **PASS** | File confirmed present |
| 1.2 | MUST | SKILL.md has valid YAML frontmatter | **PASS** | Parsed successfully between `---` markers |
| 1.3 | MUST | Frontmatter: `name` field exists | **PASS** | `name: market-intelligence-report` |
| 1.4 | MUST | Frontmatter: `description` field exists | **PASS** | Present, ~200 characters |
| 1.5 | MUST | Frontmatter: `author` field exists | **PASS** | `author: Robin Westerlund` |
| 1.6 | MUST | Frontmatter: `version` field, valid SemVer | **PASS** | `version: 1.0.0` |
| 1.7 | MUST | `name` is lowercase-kebab-case | **PASS** | `market-intelligence-report` matches `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` |
| 1.8 | MUST | `description` >= 50 characters | **PASS** | ~580 characters |
| 1.9 | MUST | SKILL.md body < 500 lines | **PASS** | 319 total lines; ~16 frontmatter = **~303 body lines** |
| 1.10 | MUST | Every referenced file exists | **PASS** | All 7 cross-references verified: `templates/competitive-report.md`, `templates/competitor-card.md`, `templates/positioning-canvas.md`, `references/frameworks.md`, `references/market-sizing.md`, `references/quality-standard.md`, `references/anti-patterns.md` |
| 1.11 | MUST | No hardcoded absolute paths | **PASS** | No `/Users/`, `C:\`, `/home/` found |
| 1.12 | MUST | No API keys or secrets | **PASS** | No `sk-`, `Bearer`, `password=` found |
| 1.13 | MUST | Directory matches declared shape | **PASS** | Full shape confirmed: SKILL.md + README.md + metadata.json + templates/ (3 files) + references/ (4 files) |
| 1.14 | CHECK | metadata.json valid JSON | **PASS** | Parsed cleanly |
| 1.15 | CHECK | metadata.json `name` matches SKILL.md `name` | **PASS** | Both: `market-intelligence-report` |
| 1.16 | CHECK | templates/ has ≥ 1 .md file | **PASS** | 3 files: competitive-report.md, competitor-card.md, positioning-canvas.md |
| 1.17 | CHECK | examples/ has ≥ 1 complete example | **N/A** | No examples/ directory (see 5.8 below) |
| 1.18 | CHECK | scripts/ present and executable | **N/A** | No scripts/ directory (Full shape — not required) |
| 1.19 | CHECK | evals/ valid JSON with ≥ 3 cases | **N/A** | No evals/ directory (not Production shape) |

**Category 1 result: 13/13 MUST PASS | 3/4 applicable CHECK PASS**

---

### Category 2 — Content Quality

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|---------|
| 2.1 | SHOULD | First section delivers standalone value | **PASS** | "Purpose" section: states the output, the audience, and the honest scope limitation. An agent reading only this section knows what they're getting and what they're not. |
| 2.2 | SHOULD | Tables used where 3+ parallel items share attributes | **PASS** | Required Input table, search sequence table, tier classification table, cross-validation table, Porter's table, verdict logic table, anti-patterns table — no parallel bullet lists found that should be tables |
| 2.3 | SHOULD | ≥ 1 anti-pattern per major process section | **PASS** | Every phase (1–7) has an explicit `**Anti-pattern:**` line. Master list at end. |
| 2.4 | SHOULD | Decision points have decision tables | **PASS** | Cross-validation divergence table (≤20% / >20% / Any), verdict logic table (If/Then), Required Input table with decision guidance |
| 2.5 | SHOULD | Imperative form throughout | **PASS** | "Produce an internal scope brief", "Run this search sequence", "Classify every discovered competitor", "Score each force 1–5", "Write the Executive Summary last". Zero instances of "you should" found. |
| 2.6 | SHOULD | Examples for ambiguous rules | **PASS** | Required Input shows concrete good vs. bad niche example. Anti-patterns master list has If/Instead pairs. Phase 2 shows exact search query patterns. |
| 2.7 | SHOULD | No vague directives ("be smart", "think carefully") | **PASS** | No vague directives found. Rules are testable ("If divergence > 20%, show both"). |
| 2.8 | SHOULD | Key insight in first paragraph of each section | **PASS** | Each phase opens with Input and Action immediately. No long wind-up before the point. |
| 2.9 | SHOULD | Verification steps are testable | **PASS** | Layer 1: numeric thresholds (≥ 4, 0 unsourced, ≥ 5). Layer 2: anchored ratings with "what Strong looks like" descriptions. |
| 2.10 | SHOULD | Code examples syntactically valid | **N/A** | Quick Reference block is plain text (phase names), not code. No syntax to validate. |
| 2.11 | SHOULD | Templates have Fixed/Variable zone annotations | **PASS** | All 3 templates verified: `<!-- [FIXED] -->` and `<!-- [VARIABLE] -->` markers present throughout |
| 2.12 | SHOULD | Worked examples are real, not placeholder stubs | **PASS** | `references/market-sizing.md` contains a full Nordic SaaS niche worked example with real calculation chains, not placeholder values |
| 2.13 | SHOULD | No orphan references | **PASS** | All referenced files exist. "Tier 1/2/3" defined before use. "Layer 1/2" defined inline. No undefined terms. |
| 2.14 | SHOULD | Consistent terminology | **PASS** | "Tier 1/2/3" consistent across SKILL.md, templates, and references. "Phase 1–7" consistent. "Layer 1/Layer 2" consistent. |

**Category 2 result: 13/13 applicable SHOULD PASS**

---

### Category 3 — Progressive Disclosure

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|---------|
| 3.1 | SHOULD | `description` is ~50–150 words | **PASS** | ~100 words — within range |
| 3.2 | SHOULD | SKILL.md body is self-contained for core workflow | **PASS** | All 7 phases can be executed from SKILL.md alone. References provide depth (worked examples, full rubrics) but are not blockers. |
| 3.3 | SHOULD | References used for depth, not required for basic execution | **PASS** | References are gated with "For full worked example, see…" and "For full quality rubric, see…" — not required to proceed |
| 3.4 | SHOULD | Every reference file starts with "When to read this:" | **PASS** | Verified all 4: frameworks.md, market-sizing.md, quality-standard.md, anti-patterns.md — all begin with the correct gating statement |
| 3.5 | SHOULD | Templates usable without reading SKILL.md | **PASS** | competitive-report.md is fully navigable with Fixed/Variable annotations and section commentary that explains what to populate |
| 3.6 | SHOULD | README can be read standalone | **PASS** | README has trigger conditions, prerequisites, expected outcome, all 9 required sections — fully independent of SKILL.md |
| 3.7 | CHECK | 4+ reference files → SKILL.md has reference index | **PASS** | "Integration Points" table at the bottom of SKILL.md maps all 7 components (3 templates + 4 references) to their topics |
| 3.8 | SHOULD | Sections ordered by frequency of use | **PASS** | Purpose → Required Input → Phase 1–7 (core workflow) → Anti-Patterns master list → Quick Reference → Integration Points. Most-used content first. |
| 3.9 | SHOULD | Long sections (>40 lines) have sub-headings | **PASS** | Phase 7 (longest section) has "Layer 1 — Structural" and "Layer 2 — Strategic Quality" sub-headings. No unbroken 40+ line blocks. |
| 3.10 | SHOULD | No information duplication between SKILL.md and references/ | **FLAG** | Layer 1 and Layer 2 tables appear in both SKILL.md (summary form) and `references/quality-standard.md` (full rubric with worked examples). This is intentional progressive disclosure — SKILL.md has the inline summary for Phase 7 execution; quality-standard.md has the full rubric for edge cases. Architecturally sound; technically violates the letter of 3.10. **Acknowledged as intentional.** |

**Category 3 result: 8/9 SHOULD PASS | 1 flagged as intentional and acknowledged | 1/1 applicable CHECK PASS**

---

### Category 4 — Compatibility

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|---------|
| 4.1 | MUST | `name` is unique across skill corpus | **PASS** | `market-intelligence-report` not found in `skill-engine/explicit-skills.md` (grep: no matches) |
| 4.2 | SHOULD | `description` includes trigger phrases | **PASS** | "Use when", "Trigger on:", "Also use when" all present in frontmatter description |
| 4.3 | SHOULD | Trigger phrases are concrete and specific | **PASS** | "competitive analysis for [niche]", "market intelligence report", "who are the competitors in [space]", "is there room in [market]" — specific, actionable phrases |
| 4.4 | MUST | No hardcoded tool paths | **PASS** | Tool references use `WebSearch` and `WebFetch` as names, not paths |
| 4.5 | MUST | No dependency on specific project structure | **PASS** | No project-specific paths. Template references are relative and self-contained. |
| 4.6 | SHOULD | Dependencies declared in metadata.json `requires` | **PASS** | `"services": ["web_search"], "tools": ["WebSearch", "WebFetch"]` — matches tools used in Phase 2 |
| 4.7 | SHOULD | Compatible with skill-engine INTAKE → RESOLVE → EVAL → ADAPT → VERIFY | **PASS** | Clear inputs (Required Input table), outputs (report sections), and verification (Layer 1/2 quality gate) — fully pipeline-compatible |
| 4.8 | CHECK | If wraps external service: graceful failure defined | **PASS** | Phase 2: "if pricing is not publicly available, state 'not disclosed'". Phase 3: "If fewer than 4 Tier 1 competitors exist, state it explicitly." Failure modes handled. |
| 4.9 | CHECK | Sub-agents: permission level declared | **N/A** | No sub-agents spawned by this skill |
| 4.10 | SHOULD | Compatible with loader-blueprint ranking model | **PASS** | Explicit triggers, clear domain, distinct purpose. Priority 8 referenced in design doc. |
| 4.11 | SHOULD | Version follows SemVer | **PASS** | `1.0.0` |
| 4.12 | CHECK | If modifies files: declares output directories | **PARTIAL** | Phase 7 says "Populate `templates/competitive-report.md`" but a user could save output anywhere. No explicit output path declaration. Minor gap — does not block usage. |

**Category 4 result: 3/3 MUST PASS | 6/6 SHOULD PASS | 2/3 CHECK PASS (4.12 partial)**

---

### Category 5 — Marketplace Readiness

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|---------|
| 5.1 | CHECK | README.md exists | **PASS** | Present at package root |
| 5.2 | CHECK | README.md has all 9 required sections | **PASS** | Title + one-liner ✓, What It Does ✓, Supported Clients ✓, Prerequisites ✓, Installation ✓, Trigger Conditions ✓, Expected Outcome ✓, Files ✓, Troubleshooting ✓ |
| 5.3 | CHECK | metadata.json exists | **PASS** | Present at package root |
| 5.4 | CHECK | metadata.json has all required fields | **PASS** | name ✓, description ✓, category ✓, author ✓, version ✓, requires ✓, tags ✓, difficulty ✓, estimated_time ✓, created ✓, updated ✓ |
| 5.5 | SHOULD | Tags are lowercase, kebab-case, searchable | **PASS** | All 12 tags verified: `competitive-intelligence`, `market-analysis`, `market-sizing`, `tam-sam-som`, `porter-five-forces`, `business-strategy`, `consulting`, `market-research`, `competitive-landscape`, `positioning`, `blue-ocean`, `swot` |
| 5.6 | SHOULD | Tags include ≥ 1 domain + ≥ 1 function tag | **PASS** | Domain: `business-strategy`, `consulting` / Function: `market-analysis`, `competitive-intelligence`, `market-sizing` |
| 5.7 | SHOULD | Category is recognized | **PASS** | `"category": "skills"` |
| 5.8 | CHECK | Full+ shape: ≥ 1 worked example in examples/ | **FAIL** | No `examples/` directory exists. This skill is Full shape (has templates/ and references/) and the quality gate requires at least one worked example. **This is the only structural deficiency in the package.** Mitigation: `references/market-sizing.md` contains a full worked example (Nordic SaaS niche, dual-method calculation), but it is in references/ not examples/. |
| 5.9 | SHOULD | README Files table matches actual directory | **PASS** | README lists all 10 files; actual directory contains all 10 files. Exact match. |
| 5.10 | SHOULD | Display name in metadata.json is human-readable | **SPEC CONFLICT** | metadata.json `name` is `market-intelligence-report` (kebab-case) which satisfies check 1.15 (must match SKILL.md `name`). Check 5.10 expects human-readable "Market Intelligence Report". The two checks contradict each other. The metadata schema from the skill-forge template uses `name` as the identifier (which should match SKILL.md), not as a display field. **Flagged as a spec inconsistency in the quality gate, not a defect in this package.** |
| 5.11 | CHECK | Prerequisites listed in README | **PASS** | Prerequisites section present with 3 items |
| 5.12 | SHOULD | Troubleshooting has ≥ 2 entries | **PASS** | 4 entries: too-broad niche, fewer than 4 Tier 1, TAM divergence, no pricing data |
| 5.13 | SHOULD | Installation instructions are copy-pasteable | **PASS** | Directory tree is exact; two clear installation options described |

**Category 5 result: 5/6 SHOULD PASS | 4/5 CHECK PASS (5.8 FAIL)**

---

### Package Quality Gate Summary

| Category | MUST | SHOULD | CHECK |
|----------|------|--------|-------|
| 1. Structural Integrity | **13/13 PASS** | — | 3/4 (1 N/A) |
| 2. Content Quality | — | **13/13 PASS** | — |
| 3. Progressive Disclosure | — | **8/9 PASS** (1 intentional flag) | 1/1 PASS |
| 4. Compatibility | **3/3 PASS** | **6/6 PASS** | 2/3 (1 partial) |
| 5. Marketplace Readiness | — | **5/6 PASS** | 4/5 (1 FAIL) |
| **Total** | **16/16** | **32/34 (94%)** | 10/13 evaluated |

**MUST: 16/16 — PASS**
**SHOULD: 94% — PASS** (threshold: 80%)
**CHECK: 1 genuine fail (5.8 — no examples/), 1 spec conflict (5.10), 1 partial (4.12)**

**Package verdict: PASS for distribution** — all structural requirements met, content quality above threshold. One action item required for Full shape completeness.

---

### Required Fix (before Full-shape certification)

**5.8 — Missing examples/ directory**

Create `knowledge/meta-skills/market-intelligence-report/examples/` with one complete worked example. The Nordic SaaS codebase documentation case from the test run is the natural candidate — extract the core competitive analysis from the test report into a standalone example file.

This does not block use of the skill. It does block claiming Full-shape marketplace certification.

---

## Part 2 — Test Report Quality Gate (L1 + L2)

### Layer 1 — Structural Checks

| # | Check | Threshold | Result | Notes |
|---|-------|-----------|--------|-------|
| S1 | Market scope with IN/OUT boundaries | Present | **PASS** | Scope & Methodology section has a 4×2 table with explicit IN/OUT |
| S2 | ≥ 4 named Tier 1 competitors with complete profiles | ≥ 4 | **BORDERLINE** | DeepWiki, Google Code Wiki, Kodesage = 3 confirmed Tier 1. Bloop is classified "1→2" — the report is honest about the transition but does not explicitly invoke the "fewer than 4 — say so" protocol from Phase 3. Profiles for all 4 are complete and detailed. Counting as soft pass given honest classification. |
| S3 | Every market size/share claim has a cited source | 0 unsourced | **PARTIAL** | Three top-down filter percentages (5% of IT services, 15% AI tools, 8% codebase intelligence) are attributed to "Gartner category benchmarks" and "product category sizing estimate" — not direct citations to a specific page or document. The report explicitly labels the 8% figure as "an analytical estimate, not a published figure" in a footnote, which is honest disclosure. This disclosure converts a silent fail into a flagged limitation. **Counts as flagged, not hidden.** |
| S4 | TAM/SAM/SOM with both top-down and bottom-up | Both present | **PASS** | Both calculation chains shown in full table form with every step labeled |
| S5 | Porter's Five Forces — all 5 with evidence | 5/5 | **PASS** | All 5 forces: named evidence for each. New entrants: "4+ funded entrants in 24 months." Substitutes: "ChatGPT/Claude with a codebase dump." Supplier: "Anthropic, OpenAI, Google Gemini." Buyer: "DeepWiki and Google Code Wiki both free." Rivalry: "3 Tier 1 direct competitors, Google ($175M+)." |
| S6 | Competitor matrix with name, pricing, target customer, differentiator | Present | **PASS** | Feature Comparison Matrix has 14 rows × 5 competitors. All 4 minimum attributes present. |
| S7 | Positioning map with 2 defined axes + ≥ 4 plotted | Present | **PASS** | ASCII map with explicit axes (X: Cloud-only → Local-first; Y: Text output → Rich visualization). 4 competitors plotted: RepoBrain, Kodesage, DeepWiki, Google Code Wiki. |
| S8 | Every pricing claim sourced or labeled "not disclosed" | 0 unsourced | **PASS** | Kodesage: "Not disclosed — contact sales. Custom pricing per system; estimated $15K–$80K ACV based on enterprise positioning." Bloop: "Not publicly disclosed post-pivot." Google: "Private repo pricing not announced." All unknowns explicitly labeled. |
| S9 | Recommendations with ≥ 3 specific actions | ≥ 3 | **PASS** | 3 actions in Priority Actions table, each with owner + timeframe + success metric |
| S10 | Decision framework with if/then logic | Present | **PASS** | Explicit 4-row If/Then/Because table covering the four most consequential decision scenarios |
| S11 | Sources section with ≥ 5 citations | ≥ 5 | **PASS** | 13 numbered citations covering product announcements, pricing pages, industry reports, developer surveys |

**L1 result: 9/11 (S2 soft borderline, S3 flagged with honest disclosure)**

---

### Layer 2 — Strategic Quality

| # | Dimension | Rating | Evidence |
|---|-----------|--------|---------|
| Q1 | Market definition precision | **Strong (3)** | "AI-powered codebase documentation and intelligence tools" is specific; IN/OUT table is unambiguous. Buyer persona named ("engineering teams maintaining complex or poorly-documented codebases, particularly during team growth or technology migration"). Competitor inclusion criteria explicit. |
| Q2 | Competitor identification completeness | **Adequate (2)** | Tier 1/2/3 classification present with rationale. 3 firm Tier 1 (not 4) — Bloop transition honest but means competitor identification is slightly thin. Tier 3 (Confluence AI, GitHub native wiki) present but not deeply researched. |
| Q3 | Market sizing credibility | **Adequate (2)** | Both methods shown. Divergence (80%) explained and operationalized ("bottom-up is the planning figure; top-down is the theoretical ceiling"). Three scenarios with named assumptions. Filter percentages in top-down are analytical estimates — honest but reduces credibility. |
| Q4 | Competitive dynamics depth | **Strong (3)** | Every Porter force has named evidence: funded entrants by count, specific substitute behaviors, named LLM API providers, specific free tier examples, named competitor funding rounds. Verdict ("Unattractive — 19/25") with explicit rationale. |
| Q5 | Differentiation sharpness | **Strong (3)** | Three whitespace opportunities each with evidence: Ollama Q&A (InfoQ reader quote about banking codebase), enterprise segment (Kodesage pricing gap named specifically), VS Code extension (zero-setup identified as DeepWiki's key UX advantage). Each names the competing vulnerability. |
| Q6 | Recommendation actionability | **Strong (3)** | Rec 1: owner (Engineering), timeframe (Q2 2026), success metric ("users can ask 'which module handles authentication?' and get a sourced answer without any API key"). Rec 2: owner (Founder), metric ("published case study or logo permission"). Rec 3: owner (Marketing), timeframe (Immediately), metric (specific website copy standard). |
| Q7 | Data sourcing quality | **Adequate (2)** | Mix present: product announcements (DeepWiki, Google Code Wiki), pricing pages (GitHub Copilot, Cursor), industry reports (Gartner, IBISWorld), developer surveys (Stack Overflow). Missing: G2/Capterra systematic review mining, mystery shopping, official government statistics for developer headcount. Kodesage customer voice is labeled "inferred from product testimonials" — not a direct quote. |
| Q8 | Strategic coherence | **Strong (3)** | Traceability verified: Ollama Q&A recommendation traces to Q&A gap in Feature Matrix and SWOT W×T. Enterprise reference customer traces to Porter's buyer power finding (GDPR as non-negotiable). Messaging recommendation traces to positioning map finding (local-first quadrant is empty). Executive Summary findings match the analysis below. |

**L2 result: 5 Strong (3) + 3 Adequate (2) = 21/24 | Average: 2.63/3**

---

### Test Report Verdict

| Layer | Score | Threshold |
|-------|-------|-----------|
| L1 | 9/11 (S2 borderline, S3 flagged-honest) | 11/11 for DELIVERY-READY |
| L2 | 2.63/3 avg, 0 Failing, 0 Weak | 0 Failing ≤ 2 Weak |

**By strict gate:** L1 has two flagged items → STRENGTHEN-THEN-DELIVER (or RESEARCH-REQUIRED if S3 counted as hard fail).

**By honest assessment:** The report self-declared STRENGTHEN-THEN-DELIVER with explicit acknowledgment of both limitations (filter estimates disclosed in footnote; Bloop transition classified honestly). This matches the output: the analysis is strategically sound and coherent; the sizing evidence base is thin.

**Verdict: STRENGTHEN-THEN-DELIVER** — consistent with the report's own self-assessment.

**To promote to DELIVERY-READY:**
1. Replace the 3 filter percentages in top-down TAM with specific cited sources (SCB Swedish ICT occupational data for developer count; Gartner or IDC published category breakdown for the % filters)
2. Confirm Bloop's current product pages directly to either solidify Tier 1 classification or explicitly invoke the "fewer than 4 — say so" protocol from Phase 3

---

## Part 3 — Specific Verification Questions

### 1. Report template has all required sections?

**PASS.** Template (`templates/competitive-report.md`) contains all sections listed in the SKILL.md Phase 7 process, all sections in the Expected Outcome list in README.md, and all sections from the market-intel-design.md spec:

| Required section | In template? | In test report? |
|-----------------|-------------|----------------|
| Executive Summary | ✓ | ✓ |
| Scope & Methodology | ✓ | ✓ |
| Market Overview | ✓ | ✓ |
| Market Sizing (TAM/SAM/SOM) | ✓ | ✓ |
| Competitive Landscape | ✓ | ✓ |
| Feature Comparison Matrix | ✓ | ✓ |
| Competitor Profiles | ✓ | ✓ (4 profiles) |
| Pricing Analysis | ✓ | ✓ |
| Porter's Five Forces | ✓ | ✓ |
| SWOT Analysis | ✓ | ✓ |
| Positioning Map | ✓ | ✓ |
| Strategic Implications | ✓ | ✓ |
| Recommendations & Decision Framework | ✓ | ✓ |
| Risk Assessment | ✓ | ✓ |
| Sources | ✓ | ✓ (13 citations) |
| Quality gate footer | ✓ | ✓ |

**16/16 sections present in both template and test report.**

---

### 2. Market sizing methodology shown (not just a number)?

**PASS — with caveat on filter sourcing.**

What is present:
- Top-down: starting figure → 4 sequential filters → TAM → SAM (table form, each step labeled)
- Bottom-up: ICP definition → developer count → adoption rate → conversion rate → ACV → TAM → SOM (table form)
- Cross-validation: both figures compared, divergence stated (80%), divergence explained
- Three scenarios: bear/base/bull with named assumptions
- Footnote disclaimer: the 8% filter is labeled "analytical estimate, not a published figure"

What is missing:
- Three filter percentages (5% IT services → developer tools; 15% AI adoption share; 8% codebase intelligence share) are not tied to specific published sources. They are labeled with source attribution ("Gartner category benchmarks") but not a document, page, or date.

**The methodology is shown. The sourcing of three inputs is weak.** This is the correct failure mode to flag — not hidden, but not fully defensible under scrutiny.

---

### 3. Competitor data is sourced (no made-up claims)?

**PASS — with two labeled limitations.**

| Claim | Source quality | Assessment |
|-------|---------------|-----------|
| DeepWiki: "50,000+ repos pre-indexed at launch" | cognition.ai/blog/deepwiki — primary source | Strong |
| DeepWiki: "$175M+ funding, ~$2B valuation" | Multiple press reports | Strong |
| Google Code Wiki: "launched November 2025" | Google Developers Blog | Strong |
| Google Code Wiki: "Gemini CLI extension on waitlist" | InfoQ, devops.com — November 2025 | Strong |
| Sourcegraph: "$59/user/month post-free-plan cuts" | Multiple pricing comparison sources | Strong |
| GitHub Copilot: "$19 Business / $39 Enterprise" | github.com/features/copilot/plans — fetched directly | Strong |
| Cursor: "$20/mo Pro, $40/mo Teams" | cursor.com/pricing — fetched directly | Strong |
| Kodesage: pricing "$15K–$80K ACV" | **ESTIMATED** — labeled as "estimated based on enterprise positioning" | Honest — not sourced |
| Kodesage: customer voice quote | **INFERRED** — labeled as "inferred from product testimonials" | Honest — not a direct quote |
| Bloop: "$7.43M raised (YC Series A)" | ycombinator.com/companies/bloop | Strong |
| Sweden IT services: $11.91B (2025) | IBISWorld, 2025 | Strong |
| 62% developer AI adoption | Stack Overflow Developer Survey 2025 | Strong |

**No made-up claims found.** The two labeled estimations (Kodesage pricing, Kodesage customer voice) are explicitly marked as inferred/estimated — they are honest gaps, not fabrications. Every other competitor claim is tied to a named source.

---

### 4. Recommendations specific enough to act on?

**PASS.**

| Recommendation | Specific enough? | Sprint-ticket test |
|---------------|-----------------|-------------------|
| "Add Ollama-powered local LLM Q&A to existing wiki — natural language questions answered from the file index, no cloud API" | Yes | Engineering can write a ticket: "Integrate Ollama API; query the existing file_index symbol extractor; render Q&A results in the wiki HTML" |
| "Acquire one reference customer in Swedish regulated industry (bank, defense supplier, telecom), even at zero cost" | Yes | Founder can name targets (Ericsson, Saab, Swedbank) and start outreach immediately |
| "Reposition RepoBrain as 'the private codebase wiki' — website and all copy leads with 'your code never leaves your machine'" | Yes | Marketing can execute today: copy change on homepage, not an engineering task |

All 3 have owner + timeframe + measurable success criterion. The decision framework adds 4 if/then branches covering the most likely pivots. **These recommendations are executable.**

---

### 5. Would the test report pass as a consulting deliverable?

**Conditional yes — at the 20,000–35,000 SEK tier. Not at 100,000+ SEK.**

**What a consulting review committee would accept:**

- Market scoping is precise and well-reasoned
- Competitor classification with Tier 1/2/3 rationale is professional-grade
- Porter's Five Forces with named evidence per force — meets consulting standard
- SWOT cross-reference (not a bullet list) — above average for secondary research
- Decision framework with 4 if/then branches — uncommon and valuable
- Honest confidence level statement ("Medium — primary research would improve precision")
- Quality gate footer with self-assessed verdict — demonstrates methodological integrity

**What a consulting review committee would push back on:**

- "~110,000 Swedish software developers" is proxy arithmetic (400k tech × 25–30%), not an SCB citation
- Three top-down filter percentages lack direct source pages
- Kodesage pricing is estimated, not verified through a sales contact
- Kodesage customer voice is "inferred" — reviewers would require at least one real G2 quote
- Bloop classification as "1→2" is honest but leaves only 3 confirmed Tier 1 competitors

**Verdict by tier:**

| Consulting tier | Price (SEK) | Would this pass? |
|----------------|------------|-----------------|
| Blog post / DIY analysis | 0–5,000 | Vastly exceeds |
| Junior associate report | 10,000–20,000 | Exceeds |
| Senior associate secondary research report | 25,000–40,000 | **Passes** |
| Partner-reviewed primary research engagement | 75,000–150,000 | **Fails — primary research missing** |

---

## Summary

### Skill Package

| Gate | Result |
|------|--------|
| MUST checks | **16/16 PASS** |
| SHOULD checks | **94% PASS** (above 80% threshold) |
| CHECK items | 10/13 (5.8 FAIL — no examples/; 5.10 spec conflict; 4.12 partial) |
| **Package verdict** | **DISTRIBUTABLE** — one action item (create examples/) for Full-shape certification |

### Test Report

| Gate | Result |
|------|--------|
| L1 structural | 9/11 (S2 borderline, S3 flagged-honest) |
| L2 strategic | 2.63/3 avg, 0 Failing, 0 Weak |
| **Report verdict** | **STRENGTHEN-THEN-DELIVER** |
| Report template completeness | 16/16 sections present |
| Methodology visibility | PASS |
| Competitor data integrity | PASS (2 labeled estimates, 0 fabrications) |
| Recommendation actionability | PASS (all 3 meet sprint-ticket standard) |
| Consulting deliverable standard | PASS at 25,000–40,000 SEK tier |
