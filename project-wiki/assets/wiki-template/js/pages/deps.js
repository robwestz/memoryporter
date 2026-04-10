// pages/deps.js — dependency manifests + force-directed graph

import { drawForceGraph } from "../charts/force-graph.js";
import { escapeHtml, formatNumber } from "../utils.js";

export function renderDeps(main, state) {
  const { data, settings } = state;
  const manifests = data.dependencies?.manifests || [];

  if (manifests.length === 0) {
    main.innerHTML = `<div class="card"><h1>Dependencies</h1><p class="muted">No dependency manifests found.</p></div>`;
    return;
  }

  const totalPkgs = manifests.reduce((s, m) => s + m.packages.length, 0);
  const ecosystems = [...new Set(manifests.map(m => m.ecosystem))];

  main.innerHTML = `
    <h1>Dependencies</h1>
    <p class="muted" style="margin-bottom: var(--sp-5);">
      ${formatNumber(manifests.length)} manifests · ${formatNumber(totalPkgs)} packages · ${ecosystems.length} ecosystems
    </p>

    <section class="grid grid-3" style="margin-bottom: var(--sp-6);">
      <div class="card stat">
        <span class="stat-label">Manifests</span>
        <span class="stat-value">${formatNumber(manifests.length)}</span>
      </div>
      <div class="card stat">
        <span class="stat-label">Packages</span>
        <span class="stat-value">${formatNumber(totalPkgs)}</span>
      </div>
      <div class="card stat">
        <span class="stat-label">Ecosystems</span>
        <span class="stat-value">${ecosystems.length}</span>
      </div>
    </section>

    ${settings.showCharts && manifests.length ? `
      <section class="card" style="margin-bottom: var(--sp-6);">
        <header class="card-head">
          <h2>Dependency graph</h2>
          <p class="muted">Drag the nodes. Manifests in the center, packages around them.</p>
        </header>
        <div id="deps-graph" class="chart-container"></div>
      </section>
    ` : ""}

    ${manifests.map(m => `
      <section class="card" style="margin-bottom: var(--sp-4);">
        <header class="card-head">
          <h2>${escapeHtml(m.manifest_path)}</h2>
          <p class="muted">${escapeHtml(m.ecosystem)} · ${m.project_name ? escapeHtml(m.project_name) + " · " : ""}${m.packages.length} packages</p>
        </header>
        ${m.packages.length ? `
          <table class="dep-table">
            <thead>
              <tr><th>Package</th><th>Version</th><th>Kind</th></tr>
            </thead>
            <tbody>
              ${m.packages.map(p => `
                <tr>
                  <td><code>${escapeHtml(p.name)}</code></td>
                  <td><code>${escapeHtml(p.version)}</code></td>
                  <td><span class="badge">${escapeHtml(p.kind)}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : `<p class="muted">No packages parsed for this manifest.</p>`}
      </section>
    `).join("")}
  `;

  if (settings.showCharts && manifests.length) {
    const nodes = [];
    const edges = [];
    manifests.forEach((m, mi) => {
      const mNode = nodes.length;
      nodes.push({
        id: `m${mi}`,
        label: m.project_name || m.manifest_path,
        weight: 6,
        color: "var(--accent-2)",
      });
      m.packages.slice(0, 25).forEach(pkg => {
        const pIdx = nodes.length;
        nodes.push({ id: `p${mi}-${pIdx}`, label: pkg.name, weight: 1 });
        edges.push({ source: mNode, target: pIdx });
      });
    });
    drawForceGraph(document.getElementById("deps-graph"), { nodes, edges }, { height: 540 });
  }
}
