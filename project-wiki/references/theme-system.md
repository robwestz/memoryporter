# Theme System

> **When to read this:** when you want to add a new theme, tweak colors, or understand why theme switching is instant.

## How themes work

Themes are pure CSS variable overrides scoped under `[data-theme="<name>"]`. The `<html>` element carries the `data-theme` attribute, which `store.js` updates whenever the user picks a theme in the settings modal. Because every component uses CSS variables, switching themes is just a single attribute change — no JavaScript runs to recolor anything.

## Token list

All tokens live in `css/tokens.css`. Themes only override the **color tokens**.

| Token | Purpose |
|-------|---------|
| `--bg` | Page background |
| `--bg-elevated` | Card / sidebar / topbar background |
| `--bg-overlay` | Hover / nested-card background |
| `--bg-glass` | Glassmorphism overlay (used on topbar with backdrop-filter) |
| `--border` | Subtle borders |
| `--border-strong` | Hover-state borders |
| `--text` | Primary text |
| `--text-muted` | Secondary text |
| `--text-faint` | Captions, labels, disabled |
| `--accent` | Primary brand color |
| `--accent-soft` | Hover/active variants of accent |
| `--accent-translucent` | rgba() variant for backgrounds and glow shadows |
| `--accent-2` | Secondary accent (used in gradients with --accent) |
| `--success` | Success state |
| `--warning` | Warning state |
| `--danger` | Error state |

Other tokens (typography, spacing, radii, motion, shadows) are theme-independent.

## Adding a new theme

1. Create `assets/wiki-template/css/themes/<name>.css`:

```css
[data-theme="forest"] {
  --bg:           #0a1410;
  --bg-elevated:  #11201a;
  --bg-overlay:   #1a2e25;
  --bg-glass:     rgba(17, 32, 26, 0.72);
  --border:       #1f3a2e;
  --border-strong:#2a4d3d;
  --text:         #f0f5f3;
  --text-muted:   #94c4ad;
  --text-faint:   #5a8a73;
  --accent:       #34d399;
  --accent-soft:  #6ee7b7;
  --accent-translucent: rgba(52, 211, 153, 0.35);
  --accent-2:     #fbbf24;
  --success:      #84cc16;
  --warning:      #f59e0b;
  --danger:       #ef4444;
}
```

2. Add a `<link>` in `assets/wiki-template/index.html` after the existing themes:

```html
<link rel="stylesheet" href="css/themes/forest.css" />
```

3. Add an entry to the `THEMES` array in `js/settings.js`:

```javascript
const THEMES = [
  // ... existing
  { id: "forest", label: "Forest", swatch: "linear-gradient(135deg, #0a1410 0%, #34d399 50%, #fbbf24 100%)" },
];
```

That's it. The theme appears in the settings modal and persists across visits.

## Testing contrast

For each theme, the body text (`--text` against `--bg-elevated`) and muted text (`--text-muted` against `--bg-elevated`) should hit at least 4.5:1 contrast. Use https://webaim.org/resources/contrastchecker/ to verify.
