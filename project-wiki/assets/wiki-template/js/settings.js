// settings.js — the in-wiki configurator modal

import * as store from "./store.js";
import { escapeHtml } from "./utils.js";
import { icon } from "./icons.js";

const SECTIONS = [
  { type: "theme", title: "Theme" },
  {
    title: "Pages",
    items: [
      { key: "showStructure", label: "Structure (sunburst + treemap)" },
      { key: "showFiles", label: "Files explorer with viewer" },
      { key: "showModules", label: "Modules breakdown" },
      { key: "showDeps", label: "Dependencies + force graph" },
      { key: "showActivity", label: "Git activity (heatmap + timeline)" },
    ],
  },
  {
    title: "Visualizations & extras",
    items: [
      { key: "showStats", label: "Stat tiles on overview" },
      { key: "showLanguages", label: "Language donut on overview" },
      { key: "showCharts", label: "All charts (sunburst, treemap, force graph, heatmap, timeline)" },
      { key: "showSymbols", label: "Symbol index in search" },
      { key: "showAIExplanations", label: "Show AI explanation slot (modules page)" },
    ],
  },
  { type: "density", title: "Density" },
];

const THEMES = [
  { id: "midnight", label: "Midnight", swatch: "linear-gradient(135deg, #0a0e1a 0%, #7c3aed 50%, #06b6d4 100%)" },
  { id: "aurora",   label: "Aurora",   swatch: "linear-gradient(135deg, #0d0a1f 0%, #c084fc 50%, #2dd4bf 100%)" },
  { id: "solar",    label: "Solar",    swatch: "linear-gradient(135deg, #18120d 0%, #fb923c 50%, #f472b6 100%)" },
];

let settingsModalEl = null;

export function openSettings({ firstVisit = false } = {}) {
  if (settingsModalEl) return;
  const { settings, theme } = store.get();

  settingsModalEl = document.createElement("div");
  settingsModalEl.className = "modal-backdrop";
  settingsModalEl.innerHTML = `
    <div class="modal settings-modal" role="dialog" aria-modal="true" aria-label="Configure wiki">
      ${firstVisit ? `<div class="settings-welcome">Welcome — pick what you'd like to see. Settings persist across visits.</div>` : ""}
      <header class="settings-head">
        <h2>Configure your wiki</h2>
        <button class="btn btn-icon btn-ghost" id="settings-close" aria-label="Close">${icon("x", 16)}</button>
      </header>

      ${SECTIONS.map(section => renderSection(section, settings, theme)).join("")}

      <footer class="settings-foot">
        <button class="btn btn-primary" id="settings-apply">${firstVisit ? "Save & explore" : "Done"}</button>
      </footer>
    </div>
  `;

  settingsModalEl.addEventListener("click", e => {
    if (e.target === settingsModalEl) close();
  });
  settingsModalEl.querySelector("#settings-close").addEventListener("click", close);

  settingsModalEl.querySelectorAll(".theme-card").forEach(el => {
    el.addEventListener("click", () => {
      store.set({ theme: el.dataset.theme });
      settingsModalEl.querySelectorAll(".theme-card").forEach(c => c.classList.toggle("is-active", c === el));
    });
  });

  settingsModalEl.querySelectorAll("[data-density]").forEach(el => {
    el.addEventListener("click", () => {
      store.setSettings({ density: el.dataset.density });
      settingsModalEl.querySelectorAll("[data-density]").forEach(b => {
        b.classList.toggle("btn-primary", b === el);
        b.classList.toggle("btn", true);
      });
    });
  });

  settingsModalEl.querySelectorAll("input[type=checkbox][data-key]").forEach(el => {
    el.addEventListener("change", () => store.setSettings({ [el.dataset.key]: el.checked }));
  });

  settingsModalEl.querySelector("#settings-apply").addEventListener("click", () => {
    store.markVisited();
    close();
  });

  document.getElementById("modal-root").appendChild(settingsModalEl);

  // Focus the first interactive element for keyboard accessibility
  setTimeout(() => settingsModalEl.querySelector("button, [tabindex]")?.focus(), 50);
}

function renderSection(section, settings, theme) {
  if (section.type === "theme") {
    return `
      <section class="settings-section">
        <h3>${escapeHtml(section.title)}</h3>
        <div class="theme-grid">
          ${THEMES.map(t => `
            <button class="theme-card ${theme === t.id ? "is-active" : ""}" data-theme="${t.id}" type="button">
              <span class="theme-swatch" style="background: ${t.swatch}"></span>
              <span class="theme-name">${escapeHtml(t.label)}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }
  if (section.type === "density") {
    return `
      <section class="settings-section">
        <h3>${escapeHtml(section.title)}</h3>
        <div class="density-row">
          <button class="btn ${settings.density === "comfortable" ? "btn-primary" : ""}" data-density="comfortable" type="button">Comfortable</button>
          <button class="btn ${settings.density === "compact" ? "btn-primary" : ""}" data-density="compact" type="button">Compact</button>
        </div>
      </section>
    `;
  }
  return `
    <section class="settings-section">
      <h3>${escapeHtml(section.title)}</h3>
      <ul class="toggle-list">
        ${section.items.map(it => `
          <li class="toggle-row">
            <label class="toggle">
              <input type="checkbox" data-key="${it.key}" ${settings[it.key] ? "checked" : ""} />
              <span class="toggle-track" aria-hidden="true"></span>
              <span class="toggle-label">${escapeHtml(it.label)}</span>
            </label>
          </li>
        `).join("")}
      </ul>
    </section>
  `;
}

function close() {
  settingsModalEl?.remove();
  settingsModalEl = null;
}
