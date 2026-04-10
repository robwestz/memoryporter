// search.js — Cmd+K palette with fuzzy match

import * as store from "./store.js";
import { escapeHtml } from "./utils.js";

let searchIndex = null;
let searchModalEl = null;
let searchActiveIdx = 0;

function buildIndex(data) {
  const items = [];

  // Files
  for (const f of data.file_index?.files || []) {
    items.push({
      kind: "file",
      label: f.path,
      sub: `${f.loc || 0} lines`,
      target: `#/files`,
    });
  }

  // Symbols
  for (const [path, syms] of Object.entries(data.symbols?.by_file || {})) {
    for (const s of syms) {
      items.push({
        kind: s.kind,
        label: s.name,
        sub: `${path}:${s.line}`,
        target: `#/files`,
      });
    }
  }

  // README headings
  for (const h of data.readme?.headings || []) {
    items.push({
      kind: "heading",
      label: h.text,
      sub: `h${h.level}`,
      target: `#/overview`,
    });
  }

  // Pages
  ["overview", "structure", "files", "modules", "deps", "activity"].forEach(p => {
    items.push({ kind: "page", label: p, sub: "navigate", target: `#/${p}` });
  });

  return items;
}

function fuzzy(query, label) {
  query = query.toLowerCase();
  label = label.toLowerCase();
  let qi = 0;
  let score = 0;
  let lastMatch = -2;
  for (let i = 0; i < label.length && qi < query.length; i++) {
    if (label[i] === query[qi]) {
      score += 1 - i / label.length;
      if (lastMatch === i - 1) score += 0.5; // contiguous bonus
      lastMatch = i;
      qi++;
    }
  }
  return qi === query.length ? score : 0;
}

export function initSearch() {
  searchIndex = buildIndex(store.get().data);
  document.addEventListener("keydown", handleGlobalKey);
}

function handleGlobalKey(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openSearch();
  }
  if (searchModalEl) {
    if (e.key === "Escape") closeSearch();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    }
    if (e.key === "Enter") {
      const active = searchModalEl.querySelector(".search-result.is-active");
      if (active) {
        window.location.hash = active.getAttribute("href");
        closeSearch();
      }
    }
  }
}

export function openSearch() {
  if (searchModalEl) return;
  if (!searchIndex) searchIndex = buildIndex(store.get().data);

  searchModalEl = document.createElement("div");
  searchModalEl.className = "modal-backdrop search-modal-bd";
  searchModalEl.innerHTML = `
    <div class="modal search-modal" role="dialog" aria-modal="true" aria-label="Search">
      <input type="text" class="search-input" placeholder="Search files, symbols, headings, pages…" autofocus aria-label="Search query" />
      <ul class="search-results" id="search-results" role="listbox"></ul>
      <div class="search-footer">
        <span class="muted"><kbd>↑↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>esc</kbd> close</span>
      </div>
    </div>
  `;
  searchModalEl.addEventListener("click", e => {
    if (e.target === searchModalEl) closeSearch();
  });
  document.getElementById("modal-root").appendChild(searchModalEl);

  const input = searchModalEl.querySelector(".search-input");
  const list = searchModalEl.querySelector("#search-results");

  function performSearch() {
    const q = input.value.trim();
    if (!q) {
      list.innerHTML = "";
      return;
    }
    const scored = searchIndex
      .map(it => ({ it, score: fuzzy(q, it.label) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);
    list.innerHTML = scored
      .map(({ it }, i) => `
        <li>
          <a class="search-result ${i === 0 ? "is-active" : ""}" href="${it.target}" data-kind="${it.kind}" role="option">
            <span class="badge">${escapeHtml(it.kind)}</span>
            <span class="search-result-label">${escapeHtml(it.label)}</span>
            <span class="search-result-sub">${escapeHtml(it.sub || "")}</span>
          </a>
        </li>
      `).join("");
    searchActiveIdx = 0;
    list.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => closeSearch());
    });
  }

  input.addEventListener("input", performSearch);
}

function moveActive(delta) {
  const items = searchModalEl.querySelectorAll(".search-result");
  if (items.length === 0) return;
  items[searchActiveIdx]?.classList.remove("is-active");
  searchActiveIdx = (searchActiveIdx + delta + items.length) % items.length;
  items[searchActiveIdx].classList.add("is-active");
  items[searchActiveIdx].scrollIntoView({ block: "nearest" });
}

export function closeSearch() {
  searchModalEl?.remove();
  searchModalEl = null;
  searchActiveIdx = 0;
}
