// app.js — bootstraps the wiki

import * as store from "./store.js";
import { renderNav } from "./nav.js";
import { renderTopbar } from "./topbar.js";
import { renderPage } from "./router.js";
import { initSearch } from "./search.js";
import { openSettings } from "./settings.js";
// Static-import prism so files page can call window.__prism_highlight synchronously
import { highlight as prismHighlight } from "./prism.js";
window.__prism_highlight = prismHighlight;

function readData() {
  const tag = document.getElementById("wiki-data");
  if (!tag) throw new Error("Missing #wiki-data script tag");
  const text = tag.textContent || "{}";
  return JSON.parse(text);
}

function getPageFromHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  return h || "overview";
}

function bootstrap() {
  let data;
  try {
    data = readData();
  } catch (err) {
    document.getElementById("main").innerHTML = `
      <div class="card" style="margin: 64px auto; max-width: 480px;">
        <h2>Failed to load wiki data</h2>
        <p style="color: var(--text-muted); margin-top: 8px;">${String(err)}</p>
      </div>
    `;
    return;
  }

  store.init(data);
  renderNav();
  renderTopbar();
  renderPage(getPageFromHash());
  initSearch();

  window.addEventListener("hashchange", () => renderPage(getPageFromHash()));
  store.subscribe(() => {
    renderNav();
    renderPage(getPageFromHash());
  });

  if (store.isFirstVisit()) {
    setTimeout(() => openSettings({ firstVisit: true }), 600);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
