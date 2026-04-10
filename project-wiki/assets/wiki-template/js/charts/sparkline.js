// sparkline.js — tiny inline polyline for per-row metrics

import { escapeHtml } from "../utils.js";

export function drawSparkline(values, opts = {}) {
  const w = opts.width || 80;
  const h = opts.height || 24;
  if (!values || values.length === 0) return "";

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const step = w / Math.max(values.length - 1, 1);

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const label = opts.label ? escapeHtml(opts.label) : "Sparkline";

  return `
    <svg width="${w}" height="${h}" class="sparkline-svg" role="img" aria-label="${label}" viewBox="0 0 ${w} ${h}">
      <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}
