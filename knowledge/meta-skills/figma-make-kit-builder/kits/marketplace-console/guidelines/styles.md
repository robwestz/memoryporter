# Visual Language

How tokens express as look-and-feel. Tokens are the API; this file is how that
API is played.

## Density: admin, not marketing

These kits target power users spending hours in the tool. Optimize for:

- High information density per viewport
- Predictable row heights (compact: 32px, default: 40px, comfortable: 48px)
- Minimal decorative space — use `--space-8` / `--space-12` as default gaps,
  not `--space-24`

Landing-page density (huge headlines, generous margins) is the wrong mode.

## Color application

| Surface | Token | Examples |
|---------|-------|----------|
| Page | `--color-surface-base` | App shell background |
| Card / panel | `--color-surface-raised` | Data cards, sidebars |
| Nested region | `--color-surface-sunken` | Code blocks, form groups |
| Modal / drawer | `--color-surface-overlay` | Dialogs, side drawers |
| Tooltip | `--color-surface-inverted` | Always-on-top hints |

## Borders and dividers

Admin UIs use borders as primary structure, not shadows.

- Tables, lists: 1px `--color-border-subtle` between rows
- Card boundaries: 1px `--color-border-default`
- Focus ring: 2px `--color-border-strong` offset 1px

Shadows (`--elev-*`) are for things that *leave the flow* — menus, drawers,
modals, drag previews. Cards in-flow use borders, not shadows.

## Interactive states — the full matrix

Every interactive element should handle:

| State | What changes |
|-------|-------------|
| Default | Base color/surface |
| Hover | +4% luminance OR `--color-accent-subtle` overlay |
| Focus-visible | `--color-border-strong` 2px ring, offset 1px |
| Active (pressed) | -4% luminance OR `--color-accent-active` |
| Disabled | `--color-text-tertiary`, cursor-not-allowed, opacity 0.5 |
| Loading | skeleton OR spinner in-place, never layout shift |
| Error | `--color-danger` border + message below, never via tooltip only |

## Data visualization

Charts use a small palette — 6 colors max, all semantic-token-derived:

| Index | Token | Use |
|-------|-------|-----|
| 0 | `--color-accent-default` | Primary series |
| 1 | `--color-info` | Secondary series |
| 2 | `--color-success` | Positive delta |
| 3 | `--color-warning` | Neutral-negative |
| 4 | `--color-danger` | Strongly negative |
| 5 | `--color-text-tertiary` | Benchmark / baseline |

No rainbow palettes. No decorative gradient fills. Charts are data, not art.

## Iconography

- Size: 16px for inline, 20px for buttons, 24px for nav
- Stroke: 1.5px for 16-20px icons, 2px for 24px+
- Use line icons by default; filled icons only for selected/active states
- Color: inherits `currentColor` (follows text color)

## Motion — restrained

Admin UIs feel professional when motion is *minimal*. Defaults:

- Hover: 120ms (`--motion-fast`), opacity/background only
- Menu / popover: 200ms (`--motion-base`), fade + 4px translate
- Modal open: 320ms (`--motion-slow`), fade + scale 0.98→1.0
- Page transitions: none (hard swap) unless the product explicitly brands on it

Never animate layout properties (width/height/margin) unless the whole UI
is designed around it (e.g., collapsing sidebars).

## What not to do

| Don't | Why | Instead |
|-------|-----|---------|
| Add gradients to backgrounds | Marketing tell | Flat surface tokens |
| Add drop shadows to cards in-flow | Looks floaty | 1px border |
| Mix border-radius values within a section | Inconsistent | Stick to one radius per region |
| Use icon-only buttons without labels | A11y fail | Label or aria-label |
| Animate icons decoratively | Distracting | Reserve motion for meaning |
