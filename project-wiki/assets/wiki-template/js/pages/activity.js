// pages/activity.js — git activity heatmap + timeline + author list

import { drawHeatmap } from "../charts/heatmap.js";
import { drawTimeline } from "../charts/timeline.js";
import { escapeHtml, formatNumber, formatRelativeTime } from "../utils.js";

export function render(main, state) {
  const { data, settings } = state;
  const git = data.git || { available: false };

  if (!git.available) {
    main.innerHTML = `
      <div class="card" style="text-align: center; padding: var(--sp-7);">
        <h1>Activity</h1>
        <p class="muted" style="margin-top: var(--sp-3);">No git history available.</p>
        <p class="muted">Initialize a git repo and make some commits to see activity here.</p>
      </div>
    `;
    return;
  }

  const summary = git.summary || {};
  const commits = git.commits || [];

  main.innerHTML = `
    <h1>Activity</h1>
    <p class="muted" style="margin-bottom: var(--sp-5);">
      ${formatNumber(summary.total)} commits
      ${summary.last_ts ? "· last " + formatRelativeTime(summary.last_ts) : ""}
    </p>

    <section class="grid grid-3" style="margin-bottom: var(--sp-6);">
      <div class="card stat">
        <span class="stat-label">Commits</span>
        <span class="stat-value">${formatNumber(summary.total)}</span>
      </div>
      <div class="card stat">
        <span class="stat-label">Authors</span>
        <span class="stat-value">${formatNumber((summary.authors || []).length)}</span>
      </div>
      <div class="card stat">
        <span class="stat-label">First commit</span>
        <span class="stat-value" style="font-size: var(--fs-18);">${summary.first_ts ? formatRelativeTime(summary.first_ts) : "—"}</span>
      </div>
    </section>

    ${settings.showCharts ? `
      <section class="card" style="margin-bottom: var(--sp-5);">
        <header class="card-head">
          <h2>Activity heatmap</h2>
          <p class="muted">Last 53 weeks of commits.</p>
        </header>
        <div id="hm-chart" class="chart-container" style="margin-top: var(--sp-4);"></div>
      </section>

      <section class="card" style="margin-bottom: var(--sp-5);">
        <header class="card-head">
          <h2>Timeline</h2>
          <p class="muted">Most recent ${Math.min(commits.length, 60)} commits.</p>
        </header>
        <div id="tl-chart" class="chart-container" style="margin-top: var(--sp-4);"></div>
      </section>
    ` : ""}

    <section class="card" style="margin-bottom: var(--sp-5);">
      <header class="card-head"><h2>Top authors</h2></header>
      <ul class="entry-list">
        ${(summary.authors || []).slice(0, 10).map(a => `
          <li class="entry-row">
            <span class="entry-name">${escapeHtml(a.name)}</span>
            <span class="entry-meta">${formatNumber(a.commits)} commits</span>
          </li>
        `).join("")}
      </ul>
    </section>

    <section class="card">
      <header class="card-head"><h2>Recent commits</h2></header>
      <ul class="commit-list">
        ${commits.slice(0, 20).map(c => `
          <li class="commit-row">
            <code class="commit-hash">${escapeHtml(c.short || "")}</code>
            <span class="commit-subject">${escapeHtml(c.subject || "")}</span>
            <span class="commit-meta">${escapeHtml(c.author || "")} · ${formatRelativeTime(c.ts)}</span>
          </li>
        `).join("")}
      </ul>
    </section>
  `;

  if (settings.showCharts) {
    drawHeatmap(document.getElementById("hm-chart"), commits);
    drawTimeline(document.getElementById("tl-chart"), commits, { max: 60 });
  }
}
