// bar.js — horizontal bar chart for top files by LOC etc.

import { escapeHtml, formatNumber } from "../utils.js";

const BAR_H = 22;
const GAP = 8;
const LABEL_W = 240;
const VALUE_W = 60;
const PAD_R = 16;

export function drawBar(container, items, opts = {}) {
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<p class="muted">No data</p>`;
    return;
  }

  const max = Math.max(...items.map(x => x.value || 0), 1);
  const w = container.clientWidth || 720;
  const innerW = Math.max(w - LABEL_W - VALUE_W - PAD_R, 80);
  const totalH = items.length * (BAR_H + GAP);

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${totalH}" class="chart-svg bar-svg" role="img" aria-label="${escapeHtml(opts.label || "Bar chart")}" preserveAspectRatio="xMinYMin meet">
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--accent)" />
          <stop offset="100%" stop-color="var(--accent-2)" />
        </linearGradient>
      </defs>
      ${items.map((it, i) => {
        const y = i * (BAR_H + GAP);
        const bw = ((it.value || 0) / max) * innerW;
        const tip = `${escapeHtml(it.label)}: ${formatNumber(it.value)}`;
        return `
          <g class="bar-row" tabindex="0" aria-label="${tip}">
            <title>${tip}</title>
            <text x="${LABEL_W - 12}" y="${y + BAR_H / 2 + 4}" text-anchor="end" class="bar-label">${escapeHtml(truncate(it.label, 36))}</text>
            <rect x="${LABEL_W}" y="${y}" width="${bw}" height="${BAR_H}" rx="6" fill="url(#bar-grad)" class="bar-rect" />
            <text x="${LABEL_W + bw + 8}" y="${y + BAR_H / 2 + 4}" class="bar-value">${formatNumber(it.value)}</text>
          </g>
        `;
      }).join("")}
    </svg>
  `;
}

function truncate(s, n) {
  s = String(s);
  if (s.length <= n) return s;
  return "…" + s.slice(-(n - 1));
}
