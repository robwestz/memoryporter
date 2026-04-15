# Failure mode atlas - writer-tool-commit

Tag each bullet with an evidence class (`[OBSERVED]`, `[DERIVED]`,
`[ASSUMED]`, `[OPEN-RISK]`).

## Likely failure modes
- [OBSERVED] Robin builds infrastructure (skill-forge upgrades, template tools) instead of shipping first skill-template end-to-end — build-vs-ship pattern documented in memory
- [ASSUMED] First skill-template passes Robin's read but fails a real editor's blind test; credibility collapses
- [ASSUMED] AI-detection tools improve faster than source-grounding defenses; trust collapses at a different seam
- [OPEN-RISK] Bacowr and writer-tool drift into two codebases solving overlapping problems; attention splits; neither ships
- [OPEN-RISK] Skill-template authoring turns out to be slow craft work that does not parallelize; catalog moat never materializes
- [ASSUMED] "Content pros who already use AI" segment turns out smaller or more price-sensitive than blueprint assumed

## Existing safeguards
- [OBSERVED] Blueprint explicitly chose Bacowr as first niche — avoids generic-scope trap
- [OBSERVED] Launch-package skill means go-to-market assets exist without new-build cost
- [OBSERVED] Portable-kit has skill-forge + showcase-presenter + audit tools — quality gating is mechanical, not vibes
- [OBSERVED] repo-strategy-orchestrator (this skill) forces stop-for-options before any build — prevents premature commitment

## Missing safeguards
- [OPEN-RISK] No editor-blind-test protocol defined — subjective quality = no proof
- [OPEN-RISK] No explicit kill-criteria — under what result does Robin table writer-tool AGAIN? Without a trigger, the loop repeats
- [OPEN-RISK] No rule for when a second skill-template may be added (depth before breadth)

## Verification ideas
- Pre-write a blind-test protocol BEFORE first template ships — 3 real editors, masked comparison, 10 pieces each
- Pre-write kill-criteria in the branch charter — e.g., "if 0/3 editors pass the first template, writer-tool pauses for 30 days"
- Track Bacowr revenue weekly; if writer-tool pulls attention from a Bacowr customer win, re-evaluate

## False positive improvements to watch for
- [ASSUMED] "Output looks much better with this new prompt architecture" — Robin's own read, not an editor's
- [ASSUMED] "We got 500 PH signups!" — signups without week-2 retention mean nothing
- [ASSUMED] "AI-detection tools pass it" — detection passing is necessary but not sufficient; editors are the real bar
