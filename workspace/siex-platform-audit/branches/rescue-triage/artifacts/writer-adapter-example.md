# WriterAdapter — Example Output

**Date:** 2026-04-15
**Adapter:** `D:/sie_x/adapters/writer.py`
**Prompts:** `D:/sie_x/prompts/writer_guest_post.md`, `writer_long_form_essay.md`, `writer_product_announcement.md`

Mock input: 12 keywords extracted from a healthcare-AI text
(`machine learning`, `healthcare diagnostics`, `OpenAI`, `diagnostic accuracy`,
`deep learning`, `radiology`, `FDA approval`, `patient outcomes`, `Google Health`,
`neural networks`, `clinical trials`, `false positive rate`)

---

## Genre: guest-post

**Domain:** `writer-guest-post`
**Constraint fields:** 10 (6 base + 4 writer-specific)
**Length guidance:** min 1200 / target 1500 / max 1800 words

### genre_conventions (8 keys)

```json
{
  "hook_structure": "Open with a counter-intuitive claim, a concrete number, or a scene-setting anecdote in the first 40 words. Do NOT open with 'Have you ever...', 'In today's world...', or any variation that names the topic before earning attention.",
  "authority_signals": "Establish author authority in the second paragraph via exactly one of: (a) a specific data point the practitioner knows from direct experience, (b) a named methodology with a measurable outcome, or (c) a result with specific numbers. Avoid credential-listing — results, not biography.",
  "cta_placement": "Place the primary CTA in the final paragraph only. Secondary CTAs (soft suggestions) may appear once after the midpoint section. CTAs must be action-anchored with an immediate result. Never open or close a section with a CTA.",
  "link_context_rules": "Every outbound link requires a reason-for-linking sentence immediately before the anchor. Test: remove the anchor text; the sentence must still read naturally. Max density: 1 external link per 300 words.",
  "section_count": "5–7 sections",
  "ideal_word_count": "1200–1800",
  "editorial_voice": "Match the editorial voice of the target publication, not the author's blog.",
  "opening_banned_phrases": ["In today's fast-paced world", "Have you ever wondered", "In this article, I will", "It's no secret that", "We are excited to share"]
}
```

### anti_detection_rules (7 rules: 5 base + 2 guest-post specific)

| Rule | Instruction (summary) |
|------|----------------------|
| `sentence_length_variation` | Mix 6–10 word sentences with 20–28 word sentences per paragraph. No more than 2 sentences in the same length band. |
| `domain_jargon_anchoring` | Use semantic_keywords terms; no generic filler like 'utilize', 'leverage', 'impactful'. |
| `source_grounded_facts` | Every factual claim traces to `source_grounding.must_cite` or is labeled as author interpretation. |
| `banned_chatgptisms` | Never use: "delve", "landscape", "in conclusion", "game-changer", "ever-evolving", "dive deep", "in today's world", and 11 others. |
| `paragraph_opening_variety` | No more than 2 paragraphs per section may open with "The", "This", or "It". |
| `link_naturalness_test` | *(guest-post only)* Remove anchor text — sentence must still read naturally. Over-engineered link sentences signal AI to editors. |
| `practitioner_specificity` | *(guest-post only)* Include 2 first-person observations specific to a practitioner's experience. Fabricated specificity reads more human than accurate generality. |

### source_grounding

**must_cite** (STAT/FINDING/STUDY/CLAIM — require real source URLs):
- `diagnostic accuracy`, `FDA approval`, `clinical trials`, `false positive rate`

**verify_before_publish** (ORG/PRODUCT/PERSON — grounded in input but unverified):
- `OpenAI`, `Google Health`

**Mechanism:** Keywords of type `STAT`, `CLAIM`, `FINDING`, `STUDY` with confidence >= 0.60 go to `must_cite`. Keywords of type `ORG`, `PRODUCT`, `PERSON` with confidence >= 0.65 go to `verify_before_publish`. This is derived directly from PipelineResult keyword tags — no external lookup required.

### structural_scaffolding (6 sections)

| # | Title | Words | Cite? | Keyword cluster |
|---|-------|-------|-------|-----------------|
| 1 | Hook + Problem Statement | ~150 | No | OpenAI, Google Health, machine learning |
| 2 | Authority + Context | ~200 | Yes | healthcare diagnostics, deep learning |
| 3 | Core Argument — Part 1 | ~300 | Yes | radiology, neural networks |
| 4 | Core Argument — Part 2 | ~300 | No | FDA approval, diagnostic accuracy |
| 5 | Practical Implications | ~250 | No | patient outcomes, clinical trials |
| 6 | Conclusion + CTA | ~150 | No | (synthesize, no new keywords) |

---

## Genre: long-form-essay

**Domain:** `writer-long-form-essay`
**Constraint fields:** 10
**Length guidance:** min 2000 / target 2600 / max 3500 words

### genre_conventions (8 keys, different from guest-post)

```json
{
  "thesis_construction": "The thesis must appear in the final sentence of the opening paragraph. It must be falsifiable. Format: 'X is true because Y, which means Z for the reader.' The reader should be able to argue against it.",
  "evidence_integration": "Each body section follows claim → evidence → analysis → implication. Evidence must be sourced. Analysis must be the author's interpretation, not a restatement of the evidence.",
  "section_depth_requirements": "Each section requires minimum 300 words, at least one citation anchor, at least one concrete example with specifics (names, numbers, dates), at least one sentence acknowledging complexity.",
  "citation_density": "Minimum 1 citation per 400 words in body sections. Inline-style (Author, Year) or hyperlinked — one format, maintained throughout. Never cite Wikipedia as primary.",
  "conclusion_rule": "Conclusion must synthesize, not summarize. One forward-looking implication. Final sentence echoes thesis without repeating it word-for-word.",
  "counterargument_requirement": "Include at least one counterargument and rebut it with evidence. Place after the second body section. Steelman the objection — AI-generated essays rarely include genuine counterarguments.",
  "section_count": "3–5 long sections",
  "ideal_word_count": "2000–3500"
}
```

### anti_detection_rules (7 rules: 5 base + 2 essay-specific)

| Rule | Instruction (summary) |
|------|----------------------|
| (5 base rules — same as guest-post above) | |
| `authentic_transitions` | *(essay only)* Transitions must reference specific content from the previous section, not generic connectors. "That gap in the longitudinal data..." |
| `sentence_fragment_use` | *(essay only)* Exactly one intentional sentence fragment per essay for rhetorical effect. AI models rarely produce these; they signal prose control. |

### source_grounding (same mechanism, same result — keywords are identical)

**must_cite:** `diagnostic accuracy`, `FDA approval`, `clinical trials`, `false positive rate`
**verify_before_publish:** `OpenAI`, `Google Health`

**Difference from guest-post:** Essay requires minimum 4 citations (vs 2 for guest-post). The `citation_density` convention enforces 1 citation per 400 words. For a 2600-word essay that means ~6–7 citations, with `must_cite` as the required floor.

### structural_scaffolding (5 sections — deeper per section)

| # | Title | Words | Cite? |
|---|-------|-------|-------|
| 1 | Opening + Thesis | ~350 | No |
| 2 | Primary Evidence | ~700 | Yes (min 2) |
| 3 | Counterargument | ~600 | Yes |
| 4 | Synthesis | ~600 | No |
| 5 | Conclusion + Implication | ~350 | No |

---

## Genre: product-announcement

**Domain:** `writer-product-announcement`
**Constraint fields:** 10
**Length guidance:** min 400 / target 550 / max 700 words

### genre_conventions (7 keys)

```json
{
  "problem_framing": "Open with the problem, not the product. First paragraph uses a concrete number or named scenario. Product name appears no earlier than paragraph 2. 'We are excited to announce' is forbidden.",
  "feature_benefit_mapping": "Each feature maps to exactly one benefit: '[Feature] eliminates [Problem]' or '[Feature] means [Customer Outcome]'. Benefits are outcomes, not capabilities. Max 3 features without a bridging sentence.",
  "proof_construction": "Social proof after solution mapping, before CTA. Named customer + measured result, or verifiable benchmark. Never generic ('It changed how we work').",
  "cta_placement": "Single CTA in the final paragraph. Format: action + immediate result. End with a verb, not a noun.",
  "tone_rule": "Confident, not hypey. No superlatives without substantiation. Let proof carry persuasion. No em-dashes — use short sentences.",
  "section_count": "4 short sections",
  "ideal_word_count": "400–700"
}
```

### anti_detection_rules (7 rules: 5 base + 2 announcement-specific)

| Rule | Instruction (summary) |
|------|----------------------|
| (5 base rules — same as above) | |
| `concrete_quantification` | *(announcement only)* Replace all vague quantifiers with specific numbers. Not "saves time" but "saves 4 hours per week". Numbers signal research; vague quantifiers signal AI marketing copy. |
| `active_present_tense` | *(announcement only)* Present tense for all capabilities: "you can now X", not "X will allow you to". Future tense signals vaporware; present tense signals a shipped product. |

### source_grounding (key difference from other genres)

**must_cite:** `diagnostic accuracy`, `FDA approval`, `clinical trials`, `false positive rate`
**verify_before_publish:** `OpenAI`, `Google Health`

**Difference from other genres:** Product announcements set `required_citations = 0`. The `source_grounding.must_cite` list still exists — if the writer chooses to use any of these claims, they need a source. But the template explicitly instructs: prefer internal data, beta customer quotes, and benchmark results over external research requiring verification.

### structural_scaffolding (4 sections)

| # | Title | Words | Cite? | Notes |
|---|-------|-------|-------|-------|
| 1 | Problem (Before State) | ~100 | No | No product mention. Forbidden opener: "We are excited to announce". |
| 2 | Solution (The Product) | ~150 | No | Feature → outcome mapping. Max 3 features. |
| 3 | Proof | ~150 | Yes | Named customer + measured result. Skip if no specific proof exists. |
| 4 | CTA | ~80 | No | One CTA. End with a verb. No fluff after CTA sentence. |

---

## Rendered prompt excerpt — guest-post (first 800 chars)

```
# Guest Post Prompt Template

> Filled by `WriterAdapter(genre="guest-post").render_prompt()`.
> Placeholders use `{{VARIABLE}}` syntax. Do not edit placeholder names.

---

## Your task

Write a **guest post** about **machine learning** for an audience of
**informed professional**. Target length: **1500** words
(min 1200, max 1800).

---

## Genre conventions (follow all of these)

- hook_structure: Open with a counter-intuitive claim, a concrete number, or a
  scene-setting anecdote in the first 40 words. Do NOT open with 'Have you ever...',
  'In today's world...', or any variation that names the topic before earning attention.
- authority_signals: Establish author authority in the second paragraph via exactly one
  of: (a) a specific data point the practitioner knows from direct experience, ...
```

---

## anti_detection_rules vs source_grounding — how they differ by genre

| Dimension | guest-post | long-form-essay | product-announcement |
|-----------|-----------|-----------------|----------------------|
| Base rules | 5 (shared) | 5 (shared) | 5 (shared) |
| Genre-specific rules | 2: link_naturalness_test, practitioner_specificity | 2: authentic_transitions, sentence_fragment_use | 2: concrete_quantification, active_present_tense |
| Total anti-detection rules | 7 | 7 | 7 |
| required_citations | 2 | 4 | 0 |
| must_cite mechanism | STAT/FINDING/STUDY/CLAIM, confidence >= 0.60 | same | same (but not enforced) |
| verify_before_publish | ORG/PRODUCT/PERSON, confidence >= 0.65 | same | same |
| Proof type expected | external research, expert interview | academic paper, primary data | internal data, named customer quote |
| Source grounding orientation | avoid hallucinated stats (AI detection signal) | minimum density enforced by citation_density convention | prefer internal proof over external claims |

## Import verification

```python
import sys
sys.path.insert(0, "D:/")

from sie_x.adapters.writer import WriterAdapter
print(WriterAdapter("guest-post").get_domain())
# → 'writer-guest-post'

from sie_x.adapters.base import AdapterRegistry
import sie_x.adapters.writer  # trigger registration
print([d for d in AdapterRegistry.list_domains() if d.startswith("writer-")])
# → ['writer-general', 'writer-guest-post', 'writer-long-form-essay', 'writer-product-announcement']
```
