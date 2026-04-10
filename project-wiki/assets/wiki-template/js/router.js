// router.js — page renderer + registry
// Folder mode uses dynamic imports for lazy loading.
// Task 35.5 refactors this to static imports for the single-file bundle.

import * as store from "./store.js";

const PAGES = {
  overview:  () => import("./pages/overview.js").then(m => m.render),
  structure: () => import("./pages/structure.js").then(m => m.render),
  files:     () => import("./pages/files.js").then(m => m.render),
  modules:   () => import("./pages/modules.js").then(m => m.render),
  deps:      () => import("./pages/deps.js").then(m => m.render),
  activity:  () => import("./pages/activity.js").then(m => m.render),
  search:    () => import("./pages/search-results.js").then(m => m.render),
};

let currentPage = null;

export async function renderPage(page) {
  currentPage = page;
  const main = document.getElementById("main");
  main.innerHTML = `<div class="page-loading">Loading…</div>`;
  const loader = PAGES[page] || PAGES.overview;

  try {
    const renderFn = await loader();
    if (currentPage !== page) return; // race protection
    main.innerHTML = "";
    main.scrollTo?.({ top: 0 });
    renderFn(main, store.get());

    // Stagger fade-in for cards (skip if reduced motion)
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
