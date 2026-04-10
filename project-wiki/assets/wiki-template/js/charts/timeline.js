// timeline.js — horizontal commit timeline with dots + tooltips

import { escapeHtml, formatRelativeTime } from "../utils.js";

const TL_H = 120;
const TL_PAD = 32;
const TL_DOT_R = 5;

export function drawTimeline(container, commits, opts = {}) {
  if (!container) return;
  if (!Array.isArray(commits) || commits.length === 0) {
    container.innerHTML = `<p class="muted">No commit history</p>`;
    return;
  }

  const items = commits.slice(0, opts.max || 60);
  const ts = items.map(c => c.ts).filter(Boolean);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const span = Math.max(tMax - tMin, 1);
  const w = container.clientWidth || 720;
  const innerW = w - TL_PAD * 2;

  const xFor = (t) => TL_PAD + ((t - tMin) / span) * innerW;

  // Stagger Y to reduce overlap on dense ranges
  const yLane = (i) => TL_PAD + (i % 4) * 18;

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${TL_H}" class="chart-svg timeline-svg" role="img" aria-label="Commit timeline" preserveAspectRatio="xMinYMin meet">
      <line x1="${TL_PAD}" y1="${TL_H / 2}" x2="${w - TL_PAD}" y2="${TL_H / 2}" stroke="var(--border)" stroke-width="2" />
      ${items.map((c, i) => {
        const x = xFor(c.ts);
        const y = yLane(i);
        const tip = `${c.short || ""} ${c.author || ""} — ${escapeHtml(c.subject || "")} (${formatRelativeTime(c.ts)})`;
        return `
          <g class="tl-dot" tabindex="0" aria-label="${escapeHtml(tip)}">
            <line x1="${x}" y1="${y}" x2="${x}" y2="${TL_H / 2}" stroke="var(--border-strong)" stroke-width="1" />
            <circle cx="${x}" cy="${y}" r="${TL_DOT_R}" fill="var(--accent)" stroke="var(--bg)" stroke-width="2" />
            <title>${escapeHtml(tip)}</title>
          </g>
        `;
      }).join("")}
      <text x="${TL_PAD}" y="${TL_H - 8}" class="tl-label">${formatRelativeTime(tMin)}</text>
      <text x="${w - TL_PAD}" y="${TL_H - 8}" class="tl-label" text-anchor="end">${formatRelativeTime(tMax)}</text>
    </svg>
  `;
}
