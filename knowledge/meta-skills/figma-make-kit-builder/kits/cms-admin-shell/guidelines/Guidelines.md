# Project Guidelines

> Read this file first. Every rule here is enforced; violations are rejections.

## Foundation-lock

This kit inherits from a shared foundation. Specifically:

- `tokens.md` is **byte-identical** to the canonical scaffold. Do not edit.
- Type scale is limited to the 7 sizes in `tokens.md`. No display sizes.
- Spacing uses the 4px scale only (4, 8, 12, 16, 24, 32, 48, 64).
- Colors reference semantic tokens, never hex literals.
- Layout primitives (`Stack`, `Inline`, `Grid`, `Split`, `Center`) are imported
  from `@/lib/layout`. Never redefine.

If a component *needs* something foundation-lock disallows, it's not a bug
in foundation-lock — it's the wrong component for this kit.

## What this kit is for

<!-- [VARIABLE] One paragraph describing the kit's domain and target user.
     Example: "A headless CMS admin console. Target user: content operators
     managing 100+ articles across multiple publications." -->

## What this kit is NOT for

<!-- [VARIABLE] Explicit scope boundaries. Example: "Not for end-user reading
     surfaces. Not for public marketing pages. Not for single-author blogs." -->

## Complexity commitment

This kit ships at CMS-admin-level complexity. Components have:

- Multiple interacting sub-regions with their own state
- Stateful transitions that drive UI (not just class toggles)
- Power-user affordances (shortcuts, bulk ops, saved views)
- A clear revenue-path tie-in (admin, operator, or power-user surface)

If you're tempted to add a landing-page component here, stop — that's a
different kit.

## Monetization patterns enforced

<!-- [VARIABLE] List which 3+ patterns from references/monetization-patterns.md
     this kit carries, and where. Example:
     - Usage-visible billing → header `UsageMeter`
     - Advanced-mode toggles → `ProFeatureCallout` on analytics widgets
     - Data export → `ExportMenu` on every table -->

## Composition rules

- Components compose top-down: shell → region → panel → widget.
- A widget never knows about its parent shell — parents inject props.
- State that affects more than one panel lives in a shared store
  (e.g., Zustand slice), never in sibling props.
- Keyboard: every power-user surface has shortcuts documented in
  `components.md` under that component's Usage section.

## When modifying this kit

1. Read `components.md` for the component you're touching
2. Confirm the change doesn't violate foundation-lock
3. If adding a component, add it to `components.md` before writing code
4. If changing behavior that other kits' components rely on, treat it as a
   breaking change and bump the foundation minor version

## Getting help

Figma Make's component-guidelines reference:
https://developers.figma.com/docs/code/write-design-system-guidelines/#components-component-guidelines
