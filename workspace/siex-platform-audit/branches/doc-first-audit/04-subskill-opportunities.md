# Subskill opportunities - doc-first-audit

## Repeatable pattern
**Audit-for-LLM-readability on a codebase the author does not fully
understand.** Input: codebase + any existing arch doc + author's direct
answers on known gaps. Output: grounded SKILL.md + capability map +
gap list + drift report + fresh-LLM-probe result. Applicable to any
growing codebase where the author relies on LLM assistance for extension.

This is explicitly NOT the same as "write documentation" — the quality
bar is mechanical (fresh-LLM probe), the structure is evidence-tagged
(no claim without a tag), and the output is a compounding artifact
(every future session reads from it).

## Candidate subskills
- **`codebase-skillpackage-forge`** — consumes (repo + arch doc + author notes), produces a SKILL.md that meets `200k-prompt-engineering` Layer 1 rules. Reuses skill-forge's authoring voice but adds capability-card + gap-list + drift-report outputs. Right size for promotion if the doc-first-audit branch pattern repeats across ≥2 codebases.
- **`codebase-gap-diagnostician`** — given a codebase + a goal, names the missing core/engine/pipeline files needed to reach the goal. Complements blueprint (which produces new products) by finding the assets an EXISTING product is missing. Would own the gap-list format.
- **`fragment-import-drift-measurer`** — quantifies divergence between a master repo and a consumer that copied fragments. Output: file-level drift classification, executive drift summary, recommended re-sync strategy. Generalizes from SIE-X-vs-Bacowr to any fork/consumer situation.
- **`fresh-llm-probe`** — automates the 60-minute "can a new LLM extend this" test. Inputs: skill-package + codebase + task spec. Output: recorded probe session with outcome + artifacts. Generalizes to any skill-package or repo that claims LLM-readability.

## Shared assets
- **Capability-card template** (fixed-zone markdown section): `## [Path]` with fields: Purpose, Inputs, Outputs, Dependencies, Status, Example usage, Known limitations. Reusable across any codebase audit.
- **Gap-list entry template**: `## [Gap name]` with fields: Expected capability, Where it would live, Inputs needed, Outputs produced, What it unlocks, Priority ([GAMECHANGER] / [QUALITY-OF-LIFE] / [NICE-TO-HAVE]).
- **Drift-classification rubric**: identical / minor (<20 lines diff) / major (≥20 lines diff) / diverged (>50% diff) / fork (no longer updatable without manual merge).
- **Fresh-LLM-probe protocol**: starting prompt, timebox, pass criteria (working adapter OR gap-list-predicted diagnostic failure), artifact collection, outcome template.

## Deferred opportunities
- **Skill-catalog audit pattern** — applying the same audit shape to `portable-kit/knowledge/meta-skills/` itself (USAGE-PATTERN #6 from repo-strategy-orchestrator). Would surface overlap, dead skills, missing skills. Defer until doc-first-audit proves the pattern on SIE-X first.
- **Continuous drift monitor** — a weekly job that re-runs the drift measurement and alerts when SIE-X-master vs Bacowr-merged divergence crosses a threshold. Defer until at least one drift report has been produced manually and reviewed.
- **LLM-readability benchmark** — average fresh-LLM-probe time-to-working-adapter across N codebases as a metric. Interesting but requires multiple audited codebases first.
- **Integration with `showcase-presenter`** — feed the capability-map and gap-list directly into a showcase for external consumption (pitch decks, investor materials, hiring docs). Natural next step AFTER the audit has proven its internal value.
- **Bacowr fork-promotion decision** — if drift report shows Bacowr is effectively a fork, author a separate case to decide whether to re-merge or formally split. That is a strategic choice, not a subskill.
