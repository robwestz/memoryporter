// topbar.js — top bar with mobile menu, crumbs, search trigger, settings button

import * as store from "./store.js";
import { icon } from "./icons.js";
import { escapeHtml } from "./utils.js";
import { openSearch } from "./search.js";
import { openSettings } from "./settings.js";

export function renderTopbar() {
  const { data } = store.get();
  const top = document.getElementById("topbar");
  top.innerHTML = `
    <button class="btn btn-icon btn-ghost mobile-menu-btn" id="topbar-menu" aria-label="Open menu">
      ${icon("menu", 20)}
    </button>
    <div class="crumbs">
      <span class="crumb-root">${escapeHtml(data?.meta?.repo_name || "Project")}</span>
    </div>
    <div class="topbar-spacer"></div>
    <button class="btn search-trigger" id="topbar-search" aria-label="Open search">
      ${icon("search", 16)}
      <span>Search</span>
      <kbd>⌘K</kbd>
    </button>
    <button class="btn btn-icon btn-ghost" id="topbar-settings" aria-label="Settings">
      ${icon("settings", 18)}
    </button>
  `;

  document.getElementById("topbar-menu")?.addEventListener("click", () => {
    const sb = document.getElementById("sidebar");
    sb.dataset.open = sb.dataset.open === "true" ? "false" : "true";
  });

  document.getElementById("topbar-search")?.addEventListener("click", () => {
    openSearch();
  });

  document.getElementById("topbar-settings")?.addEventListener("click", () => {
    openSettings();
  });
}
