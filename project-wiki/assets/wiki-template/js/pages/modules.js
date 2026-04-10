// pages/modules.js — top-level directories as cards

import { md } from "../markdown.js";
import { escapeHtml, formatBytes, formatNumber } from "../utils.js";

export function renderModules(main, state) {
  const { data, settings } = state;
  const root = data.structure;
  const modules = (root?.children || []).filter(c => c.type === "dir");
  const sidecarMods = data.sidecar?.annotations?.modules || {};
  const aiMods = data.sidecar?.ai_explanations || {};

  if (modules.length === 0) {
    main.innerHTML = `<div class="card"><h1>Modules</h1><p class="muted">No top-level modules found.</p></div>`;
    return;
  }

  main.innerHTML = `
    <h1>Modules</h1>
    <p class="muted" style="margin-bottom: var(--sp-5);">${modules.length} top-level directories</p>
    <div class="grid grid-2">
      ${modules.map(m => {
        const note = sidecarMods[m.name] || (settings.showAIExplanations ? aiMods[m.name] : null);
        const topFiles = (m.children || [])
          .filter(c => c.type === "file")
          .slice(0, 5)
          .map(c => escapeHtml(c.name));
        const subDirs = (m.children || [])
          .filter(c => c.type === "dir")
          .slice(0, 6)
          .map(c => escapeHtml(c.name));
        return `
          <section class="card module-card">
            <header class="card-head">
              <h2>${escapeHtml(m.name)}</h2>
              <p class="muted">${formatNumber(m.file_count)} files · ${formatBytes(m.size)}</p>
            </header>
            ${subDirs.length ? `
              <div class="module-subdirs">
                ${subDirs.map(d => `<span class="badge">📁 ${d}</span>`).join("")}
              </div>
            ` : ""}
            ${topFiles.length ? `
              <div class="module-files">
                <p class="muted" style="margin-bottom: 4px;">Top files:</p>
                <ul>${topFiles.map(f => `<li>📄 ${f}</li>`).join("")}</ul>
              </div>
            ` : ""}
            ${note ? `<div class="module-note markdown-body">${md(note)}</div>` : ""}
          </section>
        `;
      }).join("")}
    </div>
  `;
}
