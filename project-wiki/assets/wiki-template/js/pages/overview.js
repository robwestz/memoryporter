// pages/overview.js — hero, stats, language donut, README

import { md } from "../markdown.js";
import { drawDonut } from "../charts/donut.js";
import { escapeHtml, formatBytes, formatNumber } from "../utils.js";

export function render(main, state) {
  const { data, settings } = state;
  const stats = data.stats || {};
  const languages = data.languages || { breakdown: [] };
  const readme = data.readme || { found: false, raw: "" };
  const meta = data.meta || {};

  main.innerHTML = `
    <section class="hero">
      <h1>${escapeHtml(meta.repo_name || "Project")}</h1>
      <p class="hero-sub">
        ${formatNumber(stats.file_count)} files
        · ${formatNumber(stats.total_loc)} lines
        · ${formatBytes(stats.total_bytes)}
      </p>
    </section>

    ${settings.showStats ? `
      <section class="grid grid-3" style="margin-bottom: var(--sp-7);">
        <div class="card stat">
          <span class="stat-label">Files</span>
          <span class="stat-value">${formatNumber(stats.file_count)}</span>
        </div>
        <div class="card stat">
          <span class="stat-label">Lines of code</span>
          <span class="stat-value">${formatNumber(stats.total_loc)}</span>
        </div>
        <div class="card stat">
          <span class="stat-label">Languages</span>
          <span class="stat-value">${formatNumber(languages.breakdown.length)}</span>
        </div>
      </section>
    ` : ""}

    ${settings.showLanguages && settings.showCharts && languages.breakdown.length ? `
      <section class="card" style="margin-bottom: var(--sp-6);">
        <header class="card-head">
          <h2>Languages</h2>
          <p class="muted">Breakdown by lines of code</p>
        </header>
        <div id="overview-donut" class="chart-container"></div>
      </section>
    ` : ""}

    ${readme.found ? `
      <section class="card markdown-body">
        ${md(readme.raw)}
      </section>
    ` : `
      <section class="card">
        <h2>No README found</h2>
        <p class="muted">Add a README.md to the repo root to see it rendered here.</p>
      </section>
    `}
  `;

  if (settings.showLanguages && settings.showCharts) {
    drawDonut(document.getElementById("overview-donut"), languages.breakdown);
  }
}
