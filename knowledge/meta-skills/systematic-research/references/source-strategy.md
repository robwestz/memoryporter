# Source Strategy

> **When to read this:** When Step 2 (SOURCE) gate fails — you can't find
> enough sources, or enough source types.

## The problem with naive search

Most agents search once, take the first 3 results, and declare "research
done." This fails because:

- Google ranks by popularity, not by accuracy
- First-page results are often SEO-optimized, not evidence-rich
- A single query frames the question one way — you miss alternative framings
- Without contrarian search, you get confirmation bias

## Query formulation strategy

For any question, run at least 5 search queries across 3 categories:

### Category 1: Direct (2 queries)

- `"[topic] best practices 2025"` — current state of the art
- `"[topic] guide"` or `"[topic] documentation"` — official/canonical

### Category 2: Comparative (2 queries)

- `"[topic] vs [alternative]"` — forces contrast
- `"[topic] comparison [year]"` — dated comparisons reveal evolution

### Category 3: Contrarian (1+ queries)

- `"[topic] problems"` or `"[topic] criticism"` or `"why not [topic]"`
- `"[topic] migration away from"` — people who left know the weaknesses

## Source type diversity

The pipeline requires multiple source *types* because each type has
different reliability characteristics:

| Type | Strength | Weakness | When to trust |
|------|----------|----------|---------------|
| **Official docs** | Accurate for current version | Silent about problems | For "how it works" |
| **Peer-reviewed paper** | Rigorous methodology | May be outdated | For "this was measured" |
| **Code repository** | Ground truth of implementation | No context for decisions | For "what they actually did" |
| **Long-form article** | Explains reasoning | May reflect one person's experience | For "why someone chose this" |
| **Community discussion** | Multiple perspectives | Anecdotal, tribal | For "what people experience in practice" |
| **Conference talk** | Expert synthesis | May be aspirational not practical | For "where experts think this is going" |
| **Case study** | Real-world application | Selection bias (only successes published) | For "what happened when X tried this" |

## When you can't find enough sources

If `source_minimum` is not met after 3 rounds of query widening:

1. **Try different languages** — technical content in Chinese, German, or
   Japanese often isn't indexed in English search
2. **Try different platforms** — GitHub Discussions, HN (via algolia),
   Reddit (via search), Stack Overflow, Dev.to
3. **Try academic search** — Google Scholar, arXiv, Semantic Scholar
4. **Try the wayback machine** — removed content sometimes has the best info
5. **Ask if the question is too narrow** — maybe the SCOPE needs widening

If still failing: proceed with what you have, but:
- Flag the source gap in Step 5 (SYNTHESIZE) under Gaps
- Downgrade the GRADE verdict (coverage will be lower)
- Be explicit: "Only [N] sources found. Conclusions are tentative."

## Quality rating heuristics

| Signal | Suggests | Rating |
|--------|----------|--------|
| Published by the project/company that built it | Official | A |
| Has a methodology section | Rigorous | A |
| Cites its own sources | Accountable | A-B |
| Undated | Possibly stale | C |
| Written by someone selling the product | Biased | C |
| "10 Best X for Y" listicle | SEO fodder | C |
| Personal blog with production experience | Valuable but anecdotal | B |
| GitHub issue with maintainer response | Ground truth | A-B |

## The contrarian source requirement

The pipeline requires at least 1 contrarian source per research. This is
the most commonly skipped requirement and the one most responsible for
producing biased research.

A contrarian source is one that:
- Explicitly argues *against* the topic/tool/approach
- Documents problems, failures, or limitations
- Represents someone who tried it and switched away
- Offers a competing approach with reasoning

If you genuinely cannot find contrarian content after 3 search rounds,
document that in the source registry as a finding: "No public criticism
found despite [N] searches. This could mean: (a) the topic is too new for
criticism to exist, (b) the topic is uncontroversial, or (c) criticism
exists in spaces I can't access."

Never interpret absence of criticism as endorsement.
