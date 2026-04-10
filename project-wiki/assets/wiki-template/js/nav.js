// nav.js — sidebar navigation

import * as store from "./store.js";
import { icon } from "./icons.js";
import { escapeHtml } from "./utils.js";
import { openSettings } from "./settings.js";

const ALL_PAGES = [
  { id: "overview",  label: "Overview",     icon: "home",        setting: null },
  { id: "structure", label: "Structure",    icon: "folder-tree", setting: "showStructure" },
  { id: "files",     label: "Files",        icon: "file-code",   setting: "showFiles" },
  { id: "modules",   label: "Modules",      icon: "boxes",       setting: "showModules" },
  { id: "deps",      label: "Dependencies", icon: "package",     setting: "showDeps" },
  { id: "activity",  label: "Activity",     icon: "git-commit",  setting: "showActivity" },
];

function getCurrentPage() {
  return (window.location.hash.replace(/^#\/?/, "") || "overview");
}

export function renderNav() {
  const { data, settings } = store.get();
  const sidebar = document.getElementById("sidebar");
  const visible = ALL_PAGES.filter(p => p.setting === null || settings[p.setting]);
  const current = getCurrentPage();

  sidebar.innerHTML = `
    <div class="brand">
      <div class="brand-icon">${icon("book", 22)}</div>
      <div>
        <div class="brand-title">${escapeHtml(data?.meta?.repo_name || "Project")}</div>
        <div class="brand-sub">project wiki</div>
      </div>
    </div>
    <nav class="nav-list" role="navigation" aria-label="Sections">
      ${visible.map(p => `
        <a href="#/${p.id}" class="nav-item ${current === p.id ? "is-active" : ""}" data-page="${p.id}">
          <span class="nav-icon">${icon(p.icon, 18)}</span>
          <span class="nav-label">${escapeHtml(p.label)}</span>
        </a>
      `).join("")}
    </nav>
    <div class="nav-footer">
      <button class="btn btn-ghost" id="nav-open-settings" aria-label="Configure wiki">
        ${icon("settings", 18)} <span>Configure</span>
      </button>
    </div>
  `;

  document.getElementById("nav-open-settings")?.addEventListener("click", () => {
    openSettings();
  });
}
