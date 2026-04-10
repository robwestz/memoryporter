// treemap.js — squarified treemap for file sizes

import { escapeHtml, formatBytes } from "../utils.js";

const TM_PAD = 1;
const TM_MIN_LABEL_W = 60;
const TM_MIN_LABEL_H = 18;

export function drawTreemap(container, root, opts = {}) {
  if (!container) return;
  const items = flatten(root);
  if (items.length === 0) {
    container.innerHTML = `<p class="muted">No data</p>`;
    return;
  }

  const w = container.clientWidth || 720;
  const h = opts.height || 480;
  items.sort((a, b) => b.size - a.size);
  const total = items.reduce((s, i) => s + i.size, 0);
  const rects = squarify(items, { x: 0, y: 0, w, h, total });

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="chart-svg treemap-svg" role="img" aria-label="File size treemap" preserveAspectRatio="xMinYMin meet">
      ${rects.map(r => {
        const tip = `${r.path} — ${formatBytes(r.size)}`;
        return `
          <g class="tm-cell" tabindex="0" aria-label="${escapeHtml(tip)}">
            <title>${escapeHtml(tip)}</title>
            <rect x="${r.x + TM_PAD}" y="${r.y + TM_PAD}"
                  width="${Math.max(r.w - TM_PAD * 2, 0)}" height="${Math.max(r.h - TM_PAD * 2, 0)}"
                  rx="3" fill="${colorByLanguage(r.language)}" />
            ${r.w > TM_MIN_LABEL_W && r.h > TM_MIN_LABEL_H ? `<text x="${r.x + 6}" y="${r.y + 14}" class="tm-label">${escapeHtml(truncate(r.name, 16))}</text>` : ""}
          </g>
        `;
      }).join("")}
    </svg>
  `;
}

function flatten(node, prefix = "") {
  const out = [];
  if (!node) return out;
  if (node.type === "file") {
    out.push({
      name: node.name,
      path: prefix + node.name,
      size: Math.max(node.size || 0, 1),
      language: node.language,
    });
    return out;
  }
  for (const child of node.children || []) {
    out.push(...flatten(child, prefix + node.name + "/"));
  }
  return out;
}

// Squarified treemap algorithm — Bruls/Huijing/van Wijk 2000
function squarify(items, rect) {
  const result = [];
  const remaining = items.slice();
  let r = { ...rect };
  while (remaining.length) {
    const row = [];
    let rowSize = 0;
    let bestRatio = Infinity;
    while (remaining.length) {
      const next = remaining[0];
      const trialSize = rowSize + next.size;
      const trialRow = row.concat(next);
      const ratio = worstRatio(trialRow, trialSize, Math.min(r.w, r.h), r.total, r.w * r.h);
      if (ratio > bestRatio && row.length > 0) break;
      row.push(remaining.shift());
      rowSize = trialSize;
      bestRatio = ratio;
    }
    layoutRow(row, rowSize, r, r.total, r.w * r.h, result);
  }
  return result;
}

function worstRatio(row, rowSize, side, totalSize, totalArea) {
  if (rowSize === 0) return Infinity;
  const rowArea = (rowSize / totalSize) * totalArea;
  const rowSide = rowArea / side;
  let worst = 0;
  for (const it of row) {
    const itArea = (it.size / rowSize) * rowArea;
    const itSide = itArea / rowSide;
    const ratio = Math.max(rowSide / itSide, itSide / rowSide);
    if (ratio > worst) worst = ratio;
  }
  return worst;
}

function layoutRow(row, rowSize, r, totalSize, totalArea, result) {
  const rowArea = (rowSize / totalSize) * totalArea;
  if (r.w >= r.h) {
    const rowW = rowArea / r.h;
    let y = r.y;
    for (const it of row) {
      const itH = (it.size / rowSize) * r.h;
      result.push({ ...it, x: r.x, y, w: rowW, h: itH });
      y += itH;
    }
    r.x += rowW;
    r.w -= rowW;
  } else {
    const rowH = rowArea / r.w;
    let x = r.x;
    for (const it of row) {
      const itW = (it.size / rowSize) * r.w;
      result.push({ ...it, x, y: r.y, w: itW, h: rowH });
      x += itW;
    }
    r.y += rowH;
    r.h -= rowH;
  }
  r.total -= rowSize;
}

function colorByLanguage(lang) {
  // Pull from accent palette deterministically by hashing the language name
  if (!lang) return "var(--bg-overlay)";
  const palette = [
    "#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
  ];
  let h = 0;
  for (let i = 0; i < lang.length; i++) h = (h * 31 + lang.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function truncate(s, n) {
  s = String(s);
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
