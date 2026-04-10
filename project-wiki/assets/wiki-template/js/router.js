// router.js — page renderer + registry
// Static imports so the bundler can topo-sort everything into one JS payload.

import * as store from "./store.js";
import { renderOverview } from "./pages/overview.js";
import { renderStructure } from "./pages/structure.js";
import { renderFiles } from "./pages/files.js";
import { renderModules } from "./pages/modules.js";
import { renderDeps } from "./pages/deps.js";
import { renderActivity } from "./pages/activity.js";
import { renderSearchResults } from "./pages/search-results.js";

const PAGES = {
  overview: renderOverview,
  structure: renderStructure,
  files: renderFiles,
  modules: renderModules,
  deps: renderDeps,
  activity: renderActivity,
  search: renderSearchResults,
};

let currentPage = null;

export function renderPage(page) {
  currentPage = page;
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.scrollTo?.({ top: 0 });
  const fn = PAGES[page] || PAGES.overview;

  try {
    fn(main, store.get());
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      main.querySelectorAll(".card, .stat, .chart-container").forEach((el, i) => {
        el.style.animation = `fadeUp 350ms ${i * 30}ms cubic-bezier(0.2,0.8,0.2,1) both`;
      });
    }
  } catch (err) {
    main.innerHTML = `
      <div class="card">
        <h2>Page failed to render</h2>
        <pre style="margin-top: 12px; color: var(--text-muted); white-space: pre-wrap;">${String(err)}\n\n${err.stack || ""}</pre>
      </div>
    `;
    console.error("router.renderPage error:", err);
  }
}
