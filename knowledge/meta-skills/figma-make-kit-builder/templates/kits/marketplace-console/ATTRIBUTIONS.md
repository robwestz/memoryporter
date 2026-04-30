# Attributions — marketplace-console

## Kit authorship

Built by Agent B2 as part of the figma-make-kit-builder multi-agent run.
Version 1.0.0 — April 2026.

## Dependencies

| Package | License | Notes |
|---------|---------|-------|
| React 18 | MIT | UI runtime |
| TypeScript | Apache-2.0 | Type safety |
| Vite 5 | MIT | Build tool |
| Tailwind CSS 3 | MIT | Utility classes (via postcss) |

## Shared primitives (foundation-locked)

- Layout: `Stack`, `Inline`, `Grid`, `Split`, `Center` — from `@/lib/layout`
- Store: `createStore` — from `@/lib/store/createStore`
- Hook: `useKeyboardShortcut` — from `@/lib/hooks/useKeyboardShortcut`
- CSS tokens: `@/app/styles/index.css` — shared across all kits

## Phase-2 swaps pending

- `DataTable` in `_shared/DataTable.tsx` — inline placeholder;
  swap to `@/kits/power-data-table/src/components/DataTable` once Agent A2's kit is published.
  Affected files:
  - `src/components/ListingsManager/ListingsManager.tsx`
  - `src/components/PayoutsLedger/PayoutsLedger.tsx`

## Design references

No third-party designs incorporated. All component APIs defined in
`guidelines/components.md` by Robin Westerlund.
