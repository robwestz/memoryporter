# Chart Catalog

> **When to read this:** when you're picking a chart for new data or building one yourself.

## The shared contract

Every chart is a single JS file in `assets/wiki-template/js/charts/<name>.js` that exports a function:

```javascript
import { escapeHtml } from "../utils.js";

export function drawX(container, data, opts = {}) {
  // renders into container
}
```

Constraints every chart obeys:

- Pure SVG (no canvas, no Chart.js, no D3)
- Reads colors from CSS variables (`var(--accent)`, etc.) so theme switching is free
- `role="img"` and a descriptive `aria-label` on the SVG
- Tooltip on hover/focus, ≥44px touch targets where applicable
- Respects `prefers-reduced-motion` (no animations on init when set)

## The eight charts

| Chart | File | Use case | Data source | LOC |
|-------|------|----------|-------------|-----|
| **donut** | `donut.js` | Categorical proportions (language breakdown) | `languages.breakdown` | ~140 |
| **bar** | `bar.js` | Top-N comparison (top files by LOC) | `stats.top_files_by_loc` | ~50 |
| **sunburst** | `sunburst.js` | Nested folder structure | `structure` (recursive) | ~110 |
| **treemap** | `treemap.js` | File-size visualization | flattened `structure` | ~110 |
| **force-graph** | `force-graph.js` | Dependency relationships | transformed `dependencies.manifests` | ~150 |
| **heatmap** | `heatmap.js` | Time-series density (commits per day) | `git.commits` bucketed | ~95 |
| **timeline** | `timeline.js` | Sparse events on a timeline | `git.commits` sorted | ~60 |
| **sparkline** | `sparkline.js` | Tiny inline metrics | any number array | ~30 |

## When to use which

| Need | Reach for |
|------|-----------|
| Compare proportions of a small set | donut |
| Top-N anything | bar |
| Hierarchical structure with shape | sunburst |
| Hierarchical structure with proportional area | treemap |
| Network of relationships | force-graph |
| Density over time (calendar grid) | heatmap |
| Sparse events on a continuous axis | timeline |
| Inline metric in a table row | sparkline |

## Accessibility checklist

- [ ] Top-level SVG has `role="img"` and a descriptive `aria-label`
- [ ] Interactive elements have `tabindex="0"` and per-element `aria-label`
- [ ] Tooltip is keyboard-reachable via focus
- [ ] Hover effects also trigger on focus
- [ ] Color is not the only signal (use shape, position, or label)
- [ ] Animations check `prefers-reduced-motion: reduce` and skip if set

## Reference template: donut

When building a new chart, copy `donut.js` and adapt. It demonstrates the full pattern:

1. Top of file: `import { escapeHtml, formatNumber } from "../utils.js";`
2. Constants for size/coordinates
3. Public function: `export function drawX(container, items, opts)`
4. Empty-state guard
5. Data transform (compute angles / scales / positions)
6. SVG via template literal with `role`, `aria-label`, per-element `tabindex` and ARIA labels
7. Hover/focus binding for tooltip
