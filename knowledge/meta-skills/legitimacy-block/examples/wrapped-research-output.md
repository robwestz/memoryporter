# Example: legitimacy-block wrapping a systematic-research output

> This is a worked example. The upstream skill is `systematic-research`; the
> legitimacy-block is everything below the `---` divider near the bottom.

---

# [Upstream research output starts here]

# Research: Should we use Karpathy's Obsidian wiki or a vector DB for the aOS memory layer?

## Executive answer

For personal-to-SMB scale (≤ 10k documents, no sub-second query requirement),
Karpathy's Obsidian wiki pattern is preferred — zero infra, human-readable,
Claude reads markdown natively. At production scale or multi-tenant deployments,
vector DB remains necessary.

## Key findings

| Claim | Status | Confidence | Sources |
|-------|--------|------------|---------|
| Markdown vault beats vector DB at personal scale | Verified | High | Karpathy gist, VentureBeat, Mejba, Chase AI |
| Vector DB still wins at >10k docs | Supported | Medium | OpenMetadata patterns, SBOM tooling assumes index |
| Obsidian Local REST API enables PATCH on heading/block | Verified | High | coddingtonbear plugin docs, MCP server docs |

*(... full research report continues ...)*

[Upstream output ends here]

---

## Legitimacy Block

### Claims

| ID | Claim | Status | Confidence | Sources | Critical? |
|----|-------|--------|------------|---------|-----------|
| C1 | Markdown vault beats vector DB at personal/SMB scale | Verified | High | S2, S3, S4, S1 | yes |
| C2 | Vector DB still wins at >10k docs | Supported | Medium | S15, S16 (analogue) | yes |
| C3 | Obsidian Local REST API plugin enables surgical PATCH | Verified | High | S10, S11 | no |
| C4 | "Carpathy/Karpathy RAG" in video refers to the LLM Wiki pattern | Supported | High | S1 transcript + S2 canonical gist | no |
| C5 | Claude reads markdown natively, no parsing infra needed | Verified | High | Anthropic docs (canonical) | no |
| C6 | A `CLAUDE.md` at vault root is the single highest-leverage artifact | Supported | Medium | S1 (video assertion), echoed by S2 | no |
| C7 | Skills should be granular and composed via orchestrator-skills | Disputed | Medium | S6 (many small) vs S7 (orchestrator) | yes |
| C8 | "No RAG needed" generalizes to all scales | Unverified | Low | implicit in S1, but S15/S16 contradict at corpus scale | yes |

### Disputes

| Topic | Position A | Position B | Verdict |
|-------|-----------|-----------|---------|
| Skill granularity (C7) | "Many small skills" (S6) | "Few orchestrator-skills calling sub-skills" (S7) | Both true at different scopes — operationally use both: many small + a small set of orchestrator-skills (matches existing skill-engine pattern) |
| "No RAG needed" generalization (C8) | Personal-scale wins markdown (S1, S4) | Corpus-scale needs structured index (S15, S16) | Both true at different scales — markdown for ≤ 10k docs, vector for above |

### Gaps

- Did not measure actual query latency on a 10k-doc markdown vault. Could matter because the "scale threshold" is asserted, not benchmarked. Closes by running a real benchmark against a populated vault.
- Did not verify concurrency behavior of `obsidian-local-rest-api` under simultaneous Claude + human edits. Could matter because aOS automation will write while user is open. Closes by a 1-hour stress test.
- Did not check Karpathy gist's update history — pattern may have evolved since first publication. Closes by re-reading the gist with focus on dated revisions.
- Did not evaluate non-Obsidian markdown editors (Logseq, Foam). Could matter if Robin switches tools. Closes by a 30-min comparison pass.

### Grade

```yaml
grade:
  coverage: 85               # 8/8 claims classified; 2 critical claims (C7, C8) are Disputed/Unverified
  confidence: 0.78           # critical claims: C1=1.0 high, C2=0.6 med, C7=0.6 med (disputed), C8=0.3 low -> avg 0.625; non-critical pull average up
  critical_unverified: 1     # C8 is critical and Unverified
  loop_backs_used: 0
  source_diversity: "5 / 3"  # video, gist/canonical, articles, repo-docs, standards-authority
  gaps:
    - "Did not benchmark query latency on 10k-doc markdown vault"
    - "Did not stress-test obsidian-local-rest-api concurrency"
    - "Did not check Karpathy gist's revision history"
    - "Did not evaluate non-Obsidian markdown editors"
  verdict: needs-more-research
```

**Delta:**
- **Assumptions:** Personal-scale = ≤ 10k docs (asserted, not measured). Robin's vault is currently below this threshold (assumed from session context).
- **Risks / edge cases:** If Robin's vault grows past 10k via automated capture, the markdown-pattern degrades silently — no alert. Add a vault-size monitor in the doctor pattern.
- **What I did NOT verify:** Actual latency numbers; concurrent-edit behavior; pattern evolution since Karpathy's original gist; non-Obsidian alternatives.

---

## Notes on how this example was produced

This wrap took ~5 minutes after the upstream `systematic-research` output was
complete:

1. **INVENTORY (1 min):** Walked the research report, extracted 8 claims.
2. **CLASSIFY (2 min):** Assigned Status + Confidence + Sources by reading the research's source registry.
3. **DISPUTES (1 min):** Carried over the disputes table from the upstream output, reformatted.
4. **GAPS (1 min):** Listed what wasn't checked (most were already noted in the research report's gap section; some new ones surfaced during CLASSIFY).
5. **GRADE (30 sec):** Computed coverage, weighted confidence, counted critical_unverified.
6. **DELTA (30 sec):** Three bullets in portable-kit standard form.

The skill is mechanical, not creative. The thinking is in the upstream research.
