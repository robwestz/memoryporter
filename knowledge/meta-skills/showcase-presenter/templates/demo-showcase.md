<!-- [FIXED] Demo showcase output format — do not modify structure or section order -->
---
generated: <!-- [VARIABLE: ISO timestamp, e.g. 2026-04-13T14:32:00Z] -->
mode: demo-showcase
verdict: <!-- [VARIABLE: DEMO-READY | DEMO-WITH-CAVEATS | INVENTORY-ONLY] -->
project: <!-- [VARIABLE: project name] -->
capabilities_total: <!-- [VARIABLE: integer] -->
capabilities_ready: <!-- [VARIABLE: integer] -->
audience: <!-- [VARIABLE: user | developer | evaluator] -->
---

# <!-- [VARIABLE: Project Name] --> — Capability Demo

<!-- [FIXED] Verdict badge -->
**Status:** `<!-- [VARIABLE: DEMO-READY | DEMO-WITH-CAVEATS | INVENTORY-ONLY] -->`

<!-- [FIXED] One-sentence value proposition — what this project enables a user to DO -->
> <!-- [VARIABLE: Active voice. Specific outcome. No hedging. What can a user accomplish with this?] -->

---

<!-- [FIXED] Capability inventory always appears first -->
## Capability Inventory

<!-- [VARIABLE: One row per capability audited. Order: READY → UNTESTED → INCOMPLETE → BROKEN] -->
| Capability | Description | Status | Invoke With |
|------------|-------------|--------|-------------|
| <!-- [VARIABLE: name] --> | <!-- [VARIABLE: one-line description] --> | `[READY]` | <!-- [VARIABLE: trigger phrase] --> |
| <!-- [VARIABLE: name] --> | <!-- [VARIABLE: one-line description] --> | `[UNTESTED]` | <!-- [VARIABLE: trigger phrase] --> |
| <!-- [VARIABLE: name] --> | <!-- [VARIABLE: one-line description] --> | `[INCOMPLETE]` | <!-- [VARIABLE: trigger phrase or "see SKILL.md"] --> |
| <!-- [VARIABLE: name] --> | <!-- [VARIABLE: one-line description] --> | `[BROKEN]` | — |

<!-- [FIXED] Summary line below the inventory table -->
**<!-- [VARIABLE: N] --> of <!-- [VARIABLE: total] --> capabilities ready to demo.**

---

<!-- [FIXED] Per-capability sections — one capability-card.md per READY item -->
<!-- BROKEN items appear in inventory only — no capability card -->
## Capabilities

<!-- [VARIABLE: Insert completed capability-card.md content for each READY capability here] -->
<!-- Order matches inventory: READY first, UNTESTED second, INCOMPLETE last -->
<!-- See templates/capability-card.md for the card format -->

---

<!-- [FIXED] Integration demos — include this section ONLY if include_chains=true or natural chains exist -->
<!-- Remove this entire section if no chains exist -->
## Integration Demos

<!-- [VARIABLE: 2-3 pipeline demos showing capabilities chained — show handoff artifacts] -->

### Chain: <!-- [VARIABLE: Chain name, e.g. "Report → Showcase → Wiki"] -->

<!-- [VARIABLE: One numbered step per capability in the chain] -->
1. **<!-- [VARIABLE: Capability name] -->** — <!-- [VARIABLE: what it does in this chain] -->
   Input: `<!-- [VARIABLE: input artifact with path] -->`
   Output: `<!-- [VARIABLE: output artifact with path and size] -->`

2. **<!-- [VARIABLE: Capability name] -->** — <!-- [VARIABLE: what it does in this chain] -->
   Input: the output above
   Output: `<!-- [VARIABLE: output artifact with path and size] -->`

**Total time:** <!-- [VARIABLE: measured or estimated — mark ESTIMATED if not measured] -->

---

<!-- [FIXED] Documentation audit always last -->
## Documentation Audit

<!-- [VARIABLE: Paste completed audit-checklist.md content here] -->

**Verdict:** `<!-- [VARIABLE: DEMO-READY | DEMO-WITH-CAVEATS | INVENTORY-ONLY] -->`
