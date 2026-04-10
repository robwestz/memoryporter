// pages/files.js — file explorer with filterable list + viewer

import { escapeHtml, formatNumber, formatBytes } from "../utils.js";

export function renderFiles(main, state) {
  const { data } = state;
  const files = (data.file_index?.files || []).slice().sort((a, b) => a.path.localeCompare(b.path));

  if (files.length === 0) {
    main.innerHTML = `<div class="card"><h1>Files</h1><p class="muted">No files indexed.</p></div>`;
    return;
  }

  let activePath = files[0].path;

  main.innerHTML = `
    <h1>Files</h1>
    <p class="muted" style="margin-bottom: var(--sp-5);">${formatNumber(files.length)} files indexed</p>
    <div class="files-layout">
      <aside class="card files-list" aria-label="File list">
        <input type="text" class="files-filter" id="files-filter" placeholder="Filter files…" autocomplete="off" />
        <ul class="files-ul" id="files-ul">
          ${files.slice(0, 800).map(f => `
            <li>
              <button class="file-item ${f.path === activePath ? "is-active" : ""}" data-path="${escapeHtml(f.path)}" type="button">
                <span class="file-name">${escapeHtml(f.path)}</span>
                <span class="file-meta">${f.loc || 0}</span>
              </button>
            </li>
          `).join("")}
        </ul>
      </aside>
      <section class="card files-viewer" id="files-viewer">
        <p class="muted">Select a file</p>
      </section>
    </div>
  `;

  const viewer = document.getElementById("files-viewer");

  const fileNotes = state.data.sidecar?.annotations?.files || {};

  function renderFile(path) {
    const file = files.find(f => f.path === path);
    if (!file) return;
    main.querySelectorAll(".file-item").forEach(el => {
      el.classList.toggle("is-active", el.dataset.path === path);
    });
    const note = fileNotes[path];
    const noteHtml = note
      ? `<div class="card markdown-body file-note" style="margin-bottom: var(--sp-3);">${(window.__md ? window.__md(note) : escapeHtml(note))}</div>`
      : "";
    if (!file.preview) {
      viewer.innerHTML = `
        ${noteHtml}
        <header class="viewer-head">
          <h3>${escapeHtml(file.path)}</h3>
          <div class="badge">${escapeHtml(file.language || "binary")}</div>
        </header>
        <p class="muted">No preview available — file is binary or empty (${formatBytes(file.size)}).</p>
      `;
      return;
    }
    viewer.innerHTML = `
      ${noteHtml}
      <header class="viewer-head">
        <h3>${escapeHtml(file.path)}</h3>
        <div class="viewer-meta">
          <span class="badge">${escapeHtml(file.language || "text")}</span>
          <span class="muted">${formatNumber(file.loc)} lines · ${formatBytes(file.size)}</span>
        </div>
      </header>
      <pre class="viewer-pre"><code class="language-${(file.language || "text").toLowerCase()}">${highlightOrEscape(file.preview, file.language)}</code></pre>
      ${file.truncated ? `<p class="muted" style="margin-top: var(--sp-2);">…truncated to first 600 lines.</p>` : ""}
    `;
  }

  function highlightOrEscape(text, language) {
    // Prism module is loaded lazily; if available, use it. Otherwise escape.
    try {
      // Synchronous fallback — prism.js is bundled in single-file mode and adjacent in folder mode
      // We'll inject highlight() at runtime via a known global if available
      if (window.__prism_highlight) {
        return window.__prism_highlight(text, language);
      }
    } catch {}
    return escapeHtml(text);
  }

  // Prism is loaded statically by app.js — window.__prism_highlight is already set
  renderFile(activePath);

  main.querySelectorAll(".file-item").forEach(el => {
    el.addEventListener("click", () => renderFile(el.dataset.path));
  });

  document.getElementById("files-filter")?.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    main.querySelectorAll("#files-ul li").forEach(li => {
      li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}
