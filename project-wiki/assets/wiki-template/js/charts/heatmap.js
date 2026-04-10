// heatmap.js — GitHub-style activity heatmap (53 weeks × 7 days)

import { escapeHtml } from "../utils.js";

const CELL = 12;
const GAP = 3;
const WEEKS = 53;
const DAYS = 7;
const PAD_L = 28;
const PAD_T = 18;

export function drawHeatmap(container, commits, opts = {}) {
  if (!container) return;
  if (!Array.isArray(commits) || commits.length === 0) {
    container.innerHTML = `<p class="muted">No commit history</p>`;
    return;
  }

  // Bucket commits by day (UTC midnight)
  const now = opts.endDate ? new Date(opts.endDate) : new Date();
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - (WEEKS * 7 - 1));
  start.setUTCHours(0, 0, 0, 0);

  const buckets = new Map(); // dayKey → count
  for (const c of commits) {
    const d = new Date((c.ts || 0) * 1000);
    if (d < start) continue;
    d.setUTCHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const max = Math.max(...buckets.values(), 1);
  const w = WEEKS * (CELL + GAP) + PAD_L + 8;
  const h = DAYS * (CELL + GAP) + PAD_T + 8;

  let cellsHtml = "";
  for (let week = 0; week < WEEKS; week++) {
    for (let day = 0; day < DAYS; day++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + week * 7 + day);
      if (date > now) continue;
      const key = date.toISOString().slice(0, 10);
      const count = buckets.get(key) || 0;
      const intensity = count === 0 ? 0 : Math.min(count / max, 1);
      const x = PAD_L + week * (CELL + GAP);
      const y = PAD_T + day * (CELL + GAP);
      const color = colorFor(intensity);
      const tip = count
        ? `${key}: ${count} commit${count > 1 ? "s" : ""}`
        : `${key}: no activity`;
      cellsHtml += `
        <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2"
              fill="${color}" class="hm-cell" tabindex="${count ? "0" : "-1"}"
              aria-label="${escapeHtml(tip)}">
          <title>${escapeHtml(tip)}</title>
        </rect>
      `;
    }
  }

  // Day-of-week labels (Mon, Wed, Fri)
  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];
  const dayLabelsHtml = dayLabels
    .map((lbl, d) =>
      lbl
        ? `<text x="${PAD_L - 6}" y="${PAD_T + d * (CELL + GAP) + 9}" text-anchor="end" class="hm-label">${lbl}</text>`
        : ""
    )
    .join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="chart-svg heatmap-svg" role="img" aria-label="Git activity heatmap" preserveAspectRatio="xMinYMin meet">
      ${dayLabelsHtml}
      ${cellsHtml}
    </svg>
    <div class="hm-legend">
      <span class="muted">Less</span>
      ${[0, 0.25, 0.5, 0.75, 1].map(i => `<span class="hm-swatch" style="background: ${colorFor(i)}"></span>`).join("")}
      <span class="muted">More</span>
    </div>
  `;
}

function colorFor(intensity) {
  if (intensity === 0) return "var(--bg-overlay)";
  // Blend accent over the elevated bg by intensity
  const a = Math.round(intensity * 255).toString(16).padStart(2, "0");
  return `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, var(--bg-overlay))`;
}
