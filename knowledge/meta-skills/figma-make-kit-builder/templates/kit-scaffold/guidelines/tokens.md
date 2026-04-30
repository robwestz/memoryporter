# Design Tokens — Canonical Source

This file is **byte-identical across all kits**. Never modify per-kit. See
`references/foundation-lock.md` in the parent skill for the invariants.

## Typography scale

| Token | Size | Line-height | Weight guidance |
|-------|------|-------------|-----------------|
| `--text-xs` | 12px | 16px | 500 for labels, 400 for meta |
| `--text-sm` | 14px | 20px | 400 body, 500 UI controls |
| `--text-base` | 16px | 24px | 400 body, 500 emphasized UI |
| `--text-lg` | 18px | 28px | 500 section leads |
| `--text-xl` | 20px | 28px | 600 card/modal titles |
| `--text-2xl` | 24px | 32px | 600 page section heads |
| `--text-3xl` | 32px | 40px | 700 page titles |

No `--text-4xl`. No display sizes. If it feels too small, it isn't — it's
admin-density, not marketing-density.

## Spacing scale (4px base)

| Token | Value |
|-------|-------|
| `--space-4` | 4px |
| `--space-8` | 8px |
| `--space-12` | 12px |
| `--space-16` | 16px |
| `--space-24` | 24px |
| `--space-32` | 32px |
| `--space-48` | 48px |
| `--space-64` | 64px |

## Radii

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Inputs, badges |
| `--radius-md` | 6px | Buttons, inline tags |
| `--radius-lg` | 8px | Cards, panels |
| `--radius-xl` | 12px | Modals, feature tiles |
| `--radius-pill` | 9999px | Status chips |

## Elevation (box-shadow)

| Token | Use |
|-------|-----|
| `--elev-0` | none — flat surfaces, tables |
| `--elev-1` | subtle — cards sitting on page |
| `--elev-2` | popovers, menus, tooltips |
| `--elev-3` | modals, drawers |
| `--elev-4` | drag-in-progress, floating panels |

## Color — semantic tokens only

Never use hex literals in kit code. Always reference:

### Surface

| Token | Role |
|-------|------|
| `--color-surface-base` | Page background |
| `--color-surface-raised` | Cards, panels on base |
| `--color-surface-sunken` | Nested regions, code blocks |
| `--color-surface-overlay` | Modals, drawers |
| `--color-surface-inverted` | Tooltips on dark |

### Border

| Token | Role |
|-------|------|
| `--color-border-subtle` | Default divider |
| `--color-border-default` | Standard outline |
| `--color-border-strong` | Emphasized outline, focus ring |

### Text

| Token | Role |
|-------|------|
| `--color-text-primary` | Body, headings |
| `--color-text-secondary` | Meta, helpers |
| `--color-text-tertiary` | Disabled, timestamps |
| `--color-text-inverted` | On inverted surface |
| `--color-text-accent` | Links, active nav |

### Accent (brand-swappable)

| Token | Role |
|-------|------|
| `--color-accent-default` | Primary action |
| `--color-accent-hover` | Hover state |
| `--color-accent-active` | Pressed state |
| `--color-accent-subtle` | Tinted background |

### State

| Token | Role |
|-------|------|
| `--color-success` | Success, positive delta |
| `--color-warning` | Warning, pending |
| `--color-danger` | Error, destructive |
| `--color-info` | Neutral informational |

## Animation / motion

| Token | Duration | Use |
|-------|----------|-----|
| `--motion-instant` | 0ms | State swaps (no animation) |
| `--motion-fast` | 120ms | Hover, small state changes |
| `--motion-base` | 200ms | Menus, toggles, drawer open |
| `--motion-slow` | 320ms | Modal open, canvas transitions |

Easing: `cubic-bezier(0.2, 0, 0, 1)` for entries, `cubic-bezier(0.4, 0, 1, 1)` for exits.

## Z-index scale

| Token | Value | Use |
|-------|-------|-----|
| `--z-base` | 0 | Flow |
| `--z-sticky` | 10 | Sticky headers, toolbars |
| `--z-dropdown` | 20 | Menus, popovers |
| `--z-drawer` | 30 | Side drawers |
| `--z-modal` | 40 | Modal dialogs |
| `--z-toast` | 50 | Toasts, transient notifications |
| `--z-tooltip` | 60 | Always-on-top |

## Typography families

| Token | Stack |
|-------|-------|
| `--font-sans` | `"Inter", system-ui, sans-serif` |
| `--font-mono` | `"JetBrains Mono", "SF Mono", Consolas, monospace` |

## Grid

12-column, `--space-16` gutter, max-width `1440px` for app shells,
`960px` for reading surfaces, `640px` for forms.
