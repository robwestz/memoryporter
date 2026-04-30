# Foundation-Lock

> **When to read this:** Before adding a new kit, before modifying any kit's
> `tokens.md`, or when verifying that a kit passes Step 5 (FOUNDATION CHECK).

## Why this exists

The entire value of this skill is that components from kit A can be pasted into
a project built from kit B without breaking. That only works if every kit sits
on the same foundation. If one kit drifts its type scale by even one step, the
architecture fails — components look "almost right" which is worse than clearly
wrong because it ships anyway.

## The invariants

These are byte-level constraints. Any violation is a rewrite, not a fix.

### 1. Tokens are shared verbatim

`guidelines/tokens.md` must be **byte-identical** across all kits. The canonical
source is `templates/kit-scaffold/guidelines/tokens.md`. A kit never owns tokens;
it only consumes them.

To verify:

```bash
diff -q templates/kit-scaffold/guidelines/tokens.md \
        templates/kits/<kit-slug>/guidelines/tokens.md
# Empty output = pass. Any output = fail.
```

If a kit "needs" a new token, add it to the scaffold's `tokens.md` and
propagate to all kits. There is no middle path.

### 2. Type scale: 7 sizes, no more

| Token | Size | Line-height | Use |
|-------|------|-------------|-----|
| `--text-xs` | 12px | 16px | Labels, meta, badges |
| `--text-sm` | 14px | 20px | Body secondary, controls |
| `--text-base` | 16px | 24px | Body primary |
| `--text-lg` | 18px | 28px | Emphasis, section lead |
| `--text-xl` | 20px | 28px | Card titles, modal headers |
| `--text-2xl` | 24px | 32px | Page section headings |
| `--text-3xl` | 32px | 40px | Page titles |

No `--text-4xl`, no display sizes, no per-kit sizes. If a design calls for
larger, it's a marketing page — this skill is for admin/app surfaces.

### 3. Spacing: 4px-base scale

Allowed values: `4, 8, 12, 16, 24, 32, 48, 64`. That's it.

```css
/* Allowed */
padding: var(--space-16);
gap: var(--space-8);

/* Banned */
padding: 13px;     /* arbitrary */
gap: 0.5rem;       /* off-scale */
margin-top: 20px;  /* not on 4px scale */
```

### 4. Color: tokens, not hex

Every color reference uses a semantic token, never a hex or rgb literal:

```css
/* Allowed */
background: var(--color-surface-raised);
border: 1px solid var(--color-border-subtle);
color: var(--color-text-primary);

/* Banned */
background: #1a1a1a;
border: 1px solid rgb(64, 64, 64);
color: white;
```

Semantic token names (surface, border, text, accent, state) decouple kits from
palette. A light/dark switch or a brand reskin is a token swap, not a kit edit.

### 5. Layout primitives: shared module

Every kit imports layout primitives from the same place:

```tsx
import { Stack, Inline, Grid, Split, Center } from "@/lib/layout";
```

Primitives available (defined in scaffold):

| Primitive | Purpose |
|-----------|---------|
| `Stack` | Vertical rhythm — gap from spacing scale only |
| `Inline` | Horizontal group, wraps — gap from spacing scale |
| `Grid` | Template grid — columns from 12-col system |
| `Split` | Two-pane with fixed/flex ratio |
| `Center` | Centered content with max-width clamp |

Kits do NOT redefine these. A kit that needs `Sidebar`, `PanelGroup`, or
`CanvasFrame` extends the primitives as a kit-local component — but built
*from* them, not around them.

## Verification checklist

Run these before declaring a kit foundation-locked:

- [ ] `diff -q` scaffold tokens.md vs kit tokens.md → empty
- [ ] `grep -RE '[0-9]+px' src/` → only in tokens.md and primitive definitions
- [ ] `grep -RE '#[0-9a-fA-F]{3,6}' src/` → zero hits (except icon SVGs)
- [ ] `grep -R 'const Stack' src/` → zero hits in kit code (only in shared module)
- [ ] Type-scale audit: every `font-size` or `--text-*` usage matches one of
      the 7 allowed tokens

## When foundation-lock seems to hurt

Sometimes a kit "needs" something foundation-lock disallows. Three resolutions:

| Situation | Resolution |
|-----------|-----------|
| Need a token that doesn't exist | Add to scaffold, propagate to all kits, bump minor version |
| Need a primitive that doesn't exist | Same — extend the shared layout module, not the kit |
| Need a different token *value* for this kit | Stop — this is a new design system, not a new kit |

The third case is the one that tempts you to drift. Don't. A fork-the-foundation
kit is worth less than no kit, because it poisons the contract.

## Related

- `templates/kit-scaffold/guidelines/tokens.md` — canonical tokens source
- `templates/kit-scaffold/guidelines/styles.md` — visual language built on tokens
- `references/complexity-gate.md` — decides whether a proposed kit qualifies
