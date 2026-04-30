# Setup

How Figma Make should install and run this kit.

## Install

```bash
npm install
```

## Dev

```bash
npm run dev
```

Vite serves on `http://localhost:5173`. Hot reload is on by default.

## Build

```bash
npm run build
```

Outputs to `dist/`.

## Type-check

```bash
npm run typecheck
```

## Dependencies (pinned to minor)

- `react` ^18
- `react-dom` ^18
- `typescript` ^5
- `vite` ^5
- `tailwindcss` ^3
- `postcss` ^8
- `autoprefixer` ^10

Component-specific dependencies are listed in the kit's own `components.md`.

## File layout

```
guidelines/         ← You are reading this
  components.md     ← Per-component spec (Usage / Semantic / Examples / API)
  Guidelines.md     ← Project rules, foundation-lock, monetization patterns
  setup.md          ← This file
  styles.md         ← Visual language built on tokens
  tokens.md         ← Canonical design tokens (shared across all kits)

src/
  app/
    App.tsx         ← Entry, composition, routing shell
    styles/
      fonts.css     ← Font-face declarations
      index.css     ← Global resets, token mount
      tailwind.css  ← Tailwind directives

  lib/
    layout/         ← Stack, Inline, Grid, Split, Center (shared primitives)
    hooks/          ← Kit-specific hooks
    store/          ← State store (Zustand or similar)

  components/       ← Kit-specific components
    <ComponentName>/
      index.tsx
      <ComponentName>.tsx
      <ComponentName>.test.tsx (optional)

  pages/            ← Route-level compositions (if kit has routing)

ATTRIBUTIONS.md     ← Licenses for 3rd-party code/assets
package.json
postcss.config.mjs
vite.config.ts
```

## How Figma Make reads this

When you publish this kit via **Create a kit → Publish kit**, Figma Make:

1. Reads `guidelines/*.md` to learn component behavior
2. Reads `components/` to learn component APIs
3. Uses `tokens.md` to understand your design tokens
4. Treats `App.tsx` as the composition example

Keep `components.md` accurate — it's Make's primary context for the kit.
