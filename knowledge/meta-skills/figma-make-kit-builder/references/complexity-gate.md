# Complexity Gate

> **When to read this:** Before proposing a 9th kit, before accepting a user
> request that "feels too simple", or when an AI-generated kit suggestion
> needs to be filtered.

## Why this gate exists

Robin already has ~50 kits covering SaaS landing pages, pricing tables, and
generic marketing surfaces. Those are solved. This skill exists for the
*opposite* of that: surfaces where the structure itself is the value — admin
consoles, builders, data-heavy UIs, workflow engines.

A kit that an AI can build from scratch in one prompt has no place here. If
`"Landing page for a SaaS product"` would produce a usable result in 60
seconds, the kit isn't earning its slot.

## The gate — a kit passes only if ALL of these are true

| Check | What it means | Pass if… |
|-------|---------------|----------|
| **1. Structural depth** | Multiple interacting sub-regions with their own state | ≥ 3 panels/panes that communicate |
| **2. Stateful interaction** | State transitions drive UI, not just toggling classes | Has draft/publish, pending/active, or node-edge graph logic |
| **3. Power-user affordances** | Shortcuts, bulk ops, saved views, inline edits | ≥ 2 features built for users who use the tool daily |
| **4. Revenue path** | Tied to a surface users pay for (admin, operator, member) | Not a public marketing page |
| **5. Prompt-resistance** | Hard to build correctly from a one-shot prompt | Would take 200k+ tokens of context to get right |

## Examples

### Passes the gate

| Kit | Why it passes |
|-----|---------------|
| cms-admin-shell | Schema + block editor + media + draft/publish interact; stateful; power-user shortcuts; admin = paid surface; prompts produce toys, not kits |
| workflow-builder | Node canvas, panel state, run logs; stateful graph; power-user heavy; automation = paid; canvas interaction is hard to prompt |
| analytics-composer | Widget grid + metric builder + filter composer + saved views; state galore; power-user default; paid dashboards; too much to one-shot |

### Fails the gate

| Proposal | Why it fails | Redirect |
|----------|-------------|----------|
| "SaaS landing page kit" | All 5 checks fail — no structural depth, no state, no power-user affordances, marketing not paid, AI builds in a minute | Use one of the existing 50 landing kits |
| "Blog template" | Fails 1, 2, 3, 5 | Use a static site generator, not a kit |
| "Portfolio site" | Fails 1, 2, 3, 4, 5 | Not this skill |
| "Pricing table component" | Fails 1, 2, 3, 5 | Already covered by existing kits |
| "Newsletter signup flow" | Fails 1, 3, 5 | Too shallow |
| "Contact form with validation" | Fails 1, 2, 3, 5 | Trivial |
| "Dashboard with 3 KPI cards and a chart" | Fails 1, 2, 3 | That's a dashboard, not a dashboard *builder* |

## The "builder not result" rule

Notice the pattern in the passing examples: they're all **tools for producing
content**, not the content itself.

- Not a *dashboard* — a dashboard *composer*
- Not a *course* — a course *builder*
- Not an *article* — a CMS that produces articles
- Not a *store* — a marketplace *operator console*

If a proposed kit produces *end-user content*, it's probably a landing page in
disguise. If it produces *power-user output*, it likely passes.

## Judgment call framework

When unsure, ask these in order:

1. **Who is the user?** Operators, admins, creators, analysts → likely passes.
   Visitors, readers, shoppers → likely fails.
2. **What do they do for hours?** Build, configure, administrate, analyze →
   passes. Read, scroll, click CTA → fails.
3. **Does the kit get more valuable over time?** (More data → more useful,
   more config → more tailored) → passes. Static content → fails.
4. **Could Figma Make build it in one prompt?** Yes → fails. No → passes.

## If a proposal is borderline

Write the one-liner spec and run it through the 5 checks honestly. If 4/5 pass,
probably fine. If 3/5, reject. The gate is deliberately strict — the 8 seeds
already cover a lot of ground, and a weak 9th kit dilutes the set.

## Related

- `foundation-lock.md` — the invariants every new kit must preserve
- `monetization-patterns.md` — why "revenue path" is check #4
