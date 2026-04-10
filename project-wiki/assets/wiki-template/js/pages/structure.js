// pages/structure.js — sunburst + treemap of folder tree

import { drawSunburst } from "../charts/sunburst.js";
import { drawTreemap } from "../charts/treemap.js";
import { escapeHtml, formatBytes, formatNumber } from "../utils.js";

export function renderStructure(main, state) {
  const { data, settings } = state;
  const root = data.structure;
  const meta = data.meta || {};

  main.innerHTML = `
    <h1>Structure</h1>
    <p class="muted" style="margin-bottom: var(--sp-6);">
      Folder breakdown of <strong>${escapeHtml(meta.repo_name || "this repo")}</strong>
      — ${formatNumber(root?.file_count || 0)} files, ${formatBytes(root?.size || 0)}
    </p>

    ${settings.showCharts ? `
      <div class="grid grid-2-uneven">
        <section class="card">
          <header class="card-head">
            <h2>Sunburst</h2>
            <p class="muted">Each ring is a directory level. Hover for details.</p>
          </header>
          <div id="sb-chart" class="chart-container" style="margin-top: var(--sp-4);"></div>
        </section>
        <section class="card">
          <header class="card-head">
            <h2>Treemap</h2>
            <p class="muted">Sized by file bytes, colored by language.</p>
          </header>
          <div id="tm-chart" class="chart-container" style="margin-top: var(--sp-4);"></div>
        </section>
      </div>
    ` : ""}

    <section class="card" style="margin-top: var(--sp-5);">
      <header class="card-head"><h2>Top-level entries</h2></header>
      <ul class="entry-list">
        ${(root?.children || []).slice(0, 20).map(c => `
          <li class="entry-row">
            <span class="entry-name">${c.type === "dir" ? "📁" : "📄"} ${escapeHtml(c.name)}</span>
            <span class="entry-meta">${c.type === "dir" ? formatNumber(c.file_count) + " files" : escapeHtml(c.language || "text")}</span>
            <span class="entry-size">${formatBytes(c.size)}</span>
          </li>
        `).join("")}
      </ul>
    </section>
  `;

  if (settings.showCharts && root) {
    drawSunburst(document.getElementById("sb-chart"), root);
    drawTreemap(document.getElementById("tm-chart"), root, { height: 480 });
  }
}
