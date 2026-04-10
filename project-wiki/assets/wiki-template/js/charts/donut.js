// donut.js — language breakdown as an SVG donut with hover + legend.
// Reads CSS variables for theme awareness. Pure function — no globals.

import { escapeHtml, formatNumber } from "../utils.js";

const DONUT_SIZE = 320;
const DONUT_CX = 160;
const DONUT_CY = 160;
const DONUT_R_OUTER = 140;
const DONUT_R_INNER = 84;

export function drawDonut(container, items) {
  if (!container) return;
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `<p class="muted">No data</p>`;
    return;
  }

  const total = items.reduce((s, x) => s + (x.loc || 0), 0);
  if (total === 0) {
    container.innerHTML = `<p class="muted">No data</p>`;
    return;
  }

  let angle = -Math.PI / 2; // start at 12 o'clock
  const slices = items.map((it, idx) => {
    const portion = (it.loc || 0) / total;
    const start = angle;
    angle += portion * Math.PI * 2;
    const end = angle;
    return { ...it, start, end, portion, idx };
  });

  container.classList.add("with-legend");
  container.innerHTML = `
    <svg viewBox="0 0 ${DONUT_SIZE} ${DONUT_SIZE}" role="img" aria-label="Language breakdown donut chart" class="chart-svg donut-svg">
      <g class="donut-slices">
        ${slices.map(s => `
          <path d="${arcPath(DONUT_CX, DONUT_CY, DONUT_R_OUTER, DONUT_R_INNER, s.start, s.end)}"
                fill="${s.color}"
                data-idx="${s.idx}"
                data-name="${escapeHtml(s.name)}"
                data-pct="${(s.portion * 100).toFixed(1)}"
                data-loc="${s.loc}"
                tabindex="0"
                aria-label="${escapeHtml(s.name)}: ${(s.portion * 100).toFixed(1)} percent, ${formatNumber(s.loc)} lines">
          </path>
        `).join("")}
      </g>
      <text x="${DONUT_CX}" y="${DONUT_CY - 6}" text-anchor="middle" class="donut-center-num">${formatNumber(total)}</text>
      <text x="${DONUT_CX}" y="${DONUT_CY + 18}" text-anchor="middle" class="donut-center-label">lines</text>
    </svg>
    <ul class="legend" role="list">
      ${slices.map(s => `
        <li class="legend-item" data-idx="${s.idx}">
          <span class="legend-swatch" style="background: ${s.color}"></span>
          <span class="legend-name">${escapeHtml(s.name)}</span>
          <span class="legend-value">${(s.portion * 100).toFixed(1)}%</span>
        </li>
      `).join("")}
    </ul>
  `;

  bindHover(container);
}

function arcPath(cx, cy, rOuter, rInner, start, end) {
  const large = end - start > Math.PI ? 1 : 0;
  const x1 = cx + rOuter * Math.cos(start);
  const y1 = cy + rOuter * Math.sin(start);
  const x2 = cx + rOuter * Math.cos(end);
  const y2 = cy + rOuter * Math.sin(end);
  const x3 = cx + rInner * Math.cos(end);
  const y3 = cy + rInner * Math.sin(end);
  const x4 = cx + rInner * Math.cos(start);
  const y4 = cy + rInner * Math.sin(start);
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    `Z`,
  ].join(" ");
}

function bindHover(container) {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.style.opacity = "0";
  container.appendChild(tooltip);

  container.querySelectorAll(".donut-slices path").forEach(p => {
    const show = (e) => {
      tooltip.textContent = `${p.dataset.name}: ${p.dataset.pct}% (${formatNumber(+p.dataset.loc)} LOC)`;
      tooltip.style.opacity = "1";
      p.style.transform = "scale(1.03)";
      p.style.transformOrigin = "center";
    };
    const move = (e) => {
      const rect = container.getBoundingClientRect();
      tooltip.style.left = `${e.clientX - rect.left + 12}px`;
      tooltip.style.top = `${e.clientY - rect.top + 12}px`;
    };
    const hide = () => {
      tooltip.style.opacity = "0";
      p.style.transform = "";
    };
    p.addEventListener("mouseenter", show);
    p.addEventListener("mousemove", move);
    p.addEventListener("mouseleave", hide);
    p.addEventListener("focus", show);
    p.addEventListener("blur", hide);
  });
}
