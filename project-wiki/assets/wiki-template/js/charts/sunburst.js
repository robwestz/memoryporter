// sunburst.js — folder-structure visualization. Showpiece chart.

import { escapeHtml, formatBytes, formatNumber } from "../utils.js";

const SB_SIZE = 480;
const SB_CX = 240;
const SB_CY = 240;
const SB_MAX_R = 220;
const SB_RING_W = SB_MAX_R / 5;
const SB_CENTER_R = 30;

export function drawSunburst(container, root) {
  if (!container || !root) {
    container?.appendChild(emptyState());
    return;
  }

  const slices = [];
  function recurse(node, depth, a0, a1) {
    if (depth > 5 || !node) return;
    if (depth > 0) {
      slices.push({
        node,
        depth,
        rIn: (depth - 1) * SB_RING_W + SB_CENTER_R,
        rOut: depth * SB_RING_W + SB_CENTER_R,
        a0,
        a1,
      });
    }
    if (!node.children || !node.children.length) return;
    const total = node.children.reduce(
      (s, c) => s + Math.max(c.size || c.file_count || 1, 1),
      0
    );
    let cur = a0;
    for (const child of node.children) {
      const portion = Math.max(child.size || child.file_count || 1, 1) / total;
      const span = (a1 - a0) * portion;
      recurse(child, depth + 1, cur, cur + span);
      cur += span;
    }
  }
  recurse(root, 0, -Math.PI / 2, Math.PI * 1.5);

  const colorFor = (s) => {
    const hue = ((s.a0 + Math.PI / 2) / (Math.PI * 2)) * 360;
    const lightness = 60 - s.depth * 5;
    if (s.node.type === "file") return `hsl(${hue}, 55%, ${lightness}%)`;
    return `hsl(${hue}, 65%, ${lightness}%)`;
  };

  container.innerHTML = `
    <svg viewBox="0 0 ${SB_SIZE} ${SB_SIZE}" class="chart-svg sunburst-svg" role="img" aria-label="Folder structure sunburst">
      <g>
        ${slices.map(s => {
          const tip = `${s.node.name} — ${s.node.type === "file" ? formatBytes(s.node.size) : `${formatNumber(s.node.file_count)} files`}`;
          return `
            <path d="${arcPath(SB_CX, SB_CY, s.rOut, s.rIn, s.a0, s.a1)}"
                  fill="${colorFor(s)}"
                  stroke="var(--bg)"
                  stroke-width="1"
                  data-name="${escapeHtml(s.node.name)}"
                  data-type="${s.node.type}"
                  tabindex="0"
                  class="sb-slice"
                  aria-label="${escapeHtml(tip)}">
              <title>${escapeHtml(tip)}</title>
            </path>
          `;
        }).join("")}
        <circle cx="${SB_CX}" cy="${SB_CY}" r="${SB_CENTER_R - 2}" fill="var(--bg-elevated)" stroke="var(--border)" />
        <text x="${SB_CX}" y="${SB_CY + 4}" text-anchor="middle" class="sb-center">${escapeHtml(truncate(root.name, 12))}</text>
      </g>
    </svg>
  `;
  bindHover(container);
}

function arcPath(cx, cy, rO, rI, s, e) {
  const l = e - s > Math.PI ? 1 : 0;
  const x1 = cx + rO * Math.cos(s);
  const y1 = cy + rO * Math.sin(s);
  const x2 = cx + rO * Math.cos(e);
  const y2 = cy + rO * Math.sin(e);
  const x3 = cx + rI * Math.cos(e);
  const y3 = cy + rI * Math.sin(e);
  const x4 = cx + rI * Math.cos(s);
  const y4 = cy + rI * Math.sin(s);
  return `M ${x1} ${y1} A ${rO} ${rO} 0 ${l} 1 ${x2} ${y2} L ${x3} ${y3} A ${rI} ${rI} 0 ${l} 0 ${x4} ${y4} Z`;
}

function bindHover(container) {
  const tip = document.createElement("div");
  tip.className = "tooltip";
  tip.style.opacity = "0";
  container.appendChild(tip);

  container.querySelectorAll(".sb-slice").forEach(p => {
    const show = () => {
      tip.textContent = p.getAttribute("aria-label");
      tip.style.opacity = "1";
    };
    const move = (e) => {
      const rect = container.getBoundingClientRect();
      tip.style.left = `${e.clientX - rect.left + 12}px`;
      tip.style.top = `${e.clientY - rect.top + 12}px`;
    };
    p.addEventListener("mouseenter", show);
    p.addEventListener("mousemove", move);
    p.addEventListener("mouseleave", () => (tip.style.opacity = "0"));
    p.addEventListener("focus", show);
    p.addEventListener("blur", () => (tip.style.opacity = "0"));
  });
}

function emptyState() {
  const p = document.createElement("p");
  p.className = "muted";
  p.textContent = "No structure data";
  return p;
}

function truncate(s, n) {
  s = String(s);
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
