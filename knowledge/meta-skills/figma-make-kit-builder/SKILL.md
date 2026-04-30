---
name: figma-make-kit-builder
description: |
  Genererar custom-kits för Figma Make (funktionen "Create a kit" / "Publish kit")
  på CMS-komplexitetsnivå — inga generiska SaaS-landing pages eller
  standardprissättningstabeller. Två lägen: (1) full-project kit med hel
  foundation + komponentbibliotek för en domän, (2) single-component kit som
  plockas in i ett befintligt projekt utan att bryta foundation. Alla kit delar
  samma tokens, type scale, spacing-system och layout-primitiver så komponenter
  kan cuttas mellan kits obrutet. Åtta färdiga seeds ingår (cms-admin-shell,
  workflow-builder, multi-tenant-workspace, analytics-composer, power-data-table,
  marketplace-console, ai-search-chat-shell, creator-lms). Stack: Tailwind + Vite
  (matchar Figmas starter).
  Use when the user wants to build something for Figma Make, upload a custom kit,
  publish a kit, or produce reusable component kits. Trigger on: "figma make kit",
  "build a figma kit", "component kit for figma", "figma make component",
  "publish kit", "create a kit", "figma make starter", "designsystem for figma
  make", "custom kit figma", "kit för figma make", "bygg kit".
  Do NOT use for: generic landing pages, marketing sites, one-off prototypes,
  or Figma design files (not Make). For those, use ui-ux-pro-max or
  standard Figma skills.
author: Robin Westerlund
version: 1.0.0
---

# Figma Make Kit Builder

> Produce Figma Make custom kits at CMS-complexity level where the foundation
> is locked and components are cuttable across kits.

## What this produces

A complete, publishable Figma Make kit — the artifact you upload via
**Create a kit → Publish kit**. Exact file structure mandated by Figma:

```
guidelines/
  components.md       ← Per-component usage/semantics/API/examples
  Guidelines.md       ← Project rules, foundation-lock invariants
  setup.md            ← How Make should install/run the kit
  styles.md           ← Visual language — colors, shadows, radii
  tokens.md           ← Canonical design tokens (shared across kits)
src/
  app/
    App.tsx           ← Entry, composition, routing shell
    styles/
      fonts.css
      index.css
      tailwind.css
ATTRIBUTIONS.md
package.json
postcss.config.mjs
vite.config.ts
```

Reference: https://developers.figma.com/docs/code/write-design-system-guidelines/#components-component-guidelines

## Audience

- **Primary:** Robin — producing advanced Figma Make kits that seed real projects
- **Secondary:** Any agent (or Figma Make itself reading the kit) that needs to
  reason about components at CMS complexity

## When to Use

- User says "bygg ett figma make kit", "publish kit", "create a kit for figma"
- User points at Figma Make and wants a reusable starter at advanced complexity
- User wants to cut a single component out of a kit for a new project
- User wants to extend the shared foundation with a 9th kit

## When Not to Use

| If the situation is… | Use instead | Why |
|----------------------|-------------|-----|
| Generic landing page or pricing table | `ui-ux-pro-max` | Already covered — not this skill's job |
| Designing in Figma (not Make) | Figma MCP tools | Make kits are code, Figma files are not |
| One-off prototype, no reuse intent | Direct build | Kit overhead not worth it |
| Non-monetization focus (portfolio, blog) | Other Figma skills | Complexity gate will reject it |

## Required Context

Before starting, confirm:

- **Mode:** full-project kit, single-component kit, or extend-existing kit
- **Target kit:** which of the 8 seeds, or a new 9th kit
- **Foundation source:** always `templates/kit-scaffold/guidelines/tokens.md`
  — never invent new tokens, never drift the type scale
- **Output path:** where the finished kit should land (default: `./kits/<kit-slug>/`)

## Process

```
INTAKE → SELECT SEED → SCAFFOLD → COMPOSE COMPONENTS → FOUNDATION CHECK → PUBLISH
```

### Step 1: INTAKE

**Action:** Capture the mode and target kit as a one-line spec.
**Inputs:** User request.
**Outputs:** Spec like `mode=single-component, kit=cms-admin-shell, component=block-editor, output=./kits/cms-block-editor/`.

| If user says… | Mode | Next step |
|---------------|------|-----------|
| "Build the full marketplace kit" | full-project | Step 2 → copy full `templates/kits/marketplace-console/` |
| "Give me the node canvas from workflow-builder" | single-component | Step 2 → copy only that component + shared foundation |
| "New kit for [domain]" | extend | Step 2 → copy scaffold only, apply complexity gate |

**Do NOT:** Start writing code before the spec is one line. Ambiguity at
INTAKE becomes architectural drift downstream.

### Step 2: SELECT SEED

**Action:** Pick from the 8 seeds, or confirm a new 9th kit passes the complexity gate.

| Kit slug | Domain | Headline components |
|----------|--------|---------------------|
| `cms-admin-shell` | Headless CMS admin | Collection schema editor, block-based rich-text, media library, draft/publish, version history |
| `workflow-builder` | Automation (Zapier-style) | Node canvas, trigger/action panels, run logs, retry/error viewer |
| `multi-tenant-workspace` | SaaS org/team/user | Workspace switcher, RBAC UI, invites flow, billing-per-workspace |
| `analytics-composer` | Dashboard builder | Drag-drop widget grid, metric builder, filter composer, saved views |
| `power-data-table` | Data-power-user UI | Virtualized rows, inline edit, bulk actions, saved filter sets, column config |
| `marketplace-console` | Seller/operator ops | Listings manager, orders, disputes, payouts, reviews |
| `ai-search-chat-shell` | AI product shell | Streaming answer pane, citation cards, follow-ups, source browser |
| `creator-lms` | Course/LMS | Curriculum tree, lesson player, quiz builder, progress tracking |

**If proposing a 9th kit:** read `references/complexity-gate.md` and prove
it passes. If it's "landing page with pricing tiers" — reject it.

**Do NOT:** Ship a 9th kit without the complexity gate. The whole point of
this skill is that the 50 existing landing-page kits already exist.

### Step 3: SCAFFOLD

**Action:** Copy `templates/kit-scaffold/` into the output path, then overlay
the selected kit's files from `templates/kits/<kit-slug>/`.

**Inputs:** Spec from Step 1, kit slug from Step 2.
**Outputs:** Directory matching Figma Make's exact structure.

```
1. Copy templates/kit-scaffold/* → <output-path>/
2. Overlay templates/kits/<kit-slug>/guidelines/components.md → guidelines/components.md
3. Overlay templates/kits/<kit-slug>/src/* → src/ (merge, don't clobber App.tsx without review)
4. Update package.json name field to match kit-slug
```

**Do NOT:** Replace `tokens.md` with a kit-specific version. Tokens are
shared across all kits — that's the foundation-lock.

### Step 4: COMPOSE COMPONENTS

**Action:** For each component in the kit, write its spec in `guidelines/components.md`
using Figma's prescribed schema: Usage, Semantic purpose, Examples, API.

**Inputs:** Kit's headline components from Step 2 table.
**Outputs:** `guidelines/components.md` with one section per component.

Required per component:

```markdown
## <ComponentName>

**Usage** — when this component is the right choice, and which other
components it's commonly composed with.
**Semantic purpose** — what it means (not what it looks like).
**Examples** — at least one correct usage + at least one incorrect usage
(common mistake with annotation on why it's wrong).
**API** — props table: name | type | required | default | description.
```

**Do NOT:** Describe visual style here — that belongs in `styles.md`.
Components.md is about *behavior and meaning*.

### Step 5: FOUNDATION CHECK

**Action:** Verify the kit doesn't break foundation-lock. Read
`references/foundation-lock.md` for the invariants.

Hard invariants (any violation = fail):

- [ ] `tokens.md` is **byte-identical** to `templates/kit-scaffold/guidelines/tokens.md`
- [ ] Type scale uses only the 7 sizes defined in tokens
- [ ] Spacing uses only the 4px-base scale (4, 8, 12, 16, 24, 32, 48, 64)
- [ ] Colors reference token names (`--color-surface-raised`) not hex values
- [ ] Layout primitives (`Stack`, `Inline`, `Grid`, `Split`) are imported from
      the shared module, not redefined per kit

**Do NOT:** Let a kit "almost" share foundation. Almost = drift = kits can't
be combined = the whole architecture fails.

### Step 6: PUBLISH

**Action:** Package for upload to Figma Make.

1. Run `npm install` in the output directory — confirm no errors
2. Run `npm run build` if `vite.config.ts` has a build target — confirm no errors
3. Zip or point the user at the directory path
4. Remind: upload via **Create a kit → Publish kit** in Figma Make

**Do NOT:** Claim "kit ready" without at least the install check. A kit that
doesn't install is worse than no kit.

## Output

- A directory matching Figma Make's mandated kit structure
- All 5 `guidelines/*.md` files populated
- `src/app/App.tsx` composing the kit's headline components
- `package.json` with correct dependencies (React, Tailwind, component libs)
- Foundation-lock verified against `tokens.md`

## Example

**Request:** "Build the cms-admin-shell kit, output to `./kits/my-cms/`."

1. **INTAKE:** `mode=full-project, kit=cms-admin-shell, output=./kits/my-cms/`
2. **SELECT SEED:** `cms-admin-shell` — components: Collection schema editor,
   Block rich-text, Media library, Draft/publish, Version history
3. **SCAFFOLD:** Copy scaffold + overlay kit files → `./kits/my-cms/`
4. **COMPOSE COMPONENTS:** Write `guidelines/components.md` with 5 component
   sections following Usage/Semantic/Examples/API schema
5. **FOUNDATION CHECK:** `tokens.md` matches scaffold byte-for-byte ✓,
   type scale uses 7 sizes ✓, colors reference tokens ✓
6. **PUBLISH:** `npm install` clean → tell user: "Upload `./kits/my-cms/` via
   Figma Make → Create a kit → Publish kit."

## Works Well With

- `ui-ux-pro-max` — for visual style decisions *within* the foundation
- `figma-make` Figma MCP tools — for reading existing Figma files to inform
  component design
- `harness-engineering` — if the kit output needs to become a long-term repo

## Notes

- **Foundation-lock is non-negotiable.** If a kit "needs" a different token
  scale, it's a new design system, not a new kit. Spin up a separate skill.
- This skill does NOT execute inside Figma Make — it produces the artifact
  Figma Make consumes.
- English output for marketplace distribution; internal comments may be Swedish.
- Version history: 1.0.0 ships with 8 seeds. Additions bump minor version.
