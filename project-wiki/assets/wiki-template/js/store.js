// store.js — central state with pub/sub + localStorage persistence

const listeners = new Set();
let state = {
  data: null,
  page: "overview",
  theme: "midnight",
  settings: {
    showStats: true,
    showLanguages: true,
    showStructure: true,
    showFiles: true,
    showModules: true,
    showDeps: true,
    showActivity: true,
    showSymbols: true,
    showCharts: true,
    showAIExplanations: false,
    density: "comfortable",
  },
  search: { query: "", results: [] },
};

const SETTINGS_KEY = "project-wiki:settings:v1";
const THEME_KEY = "project-wiki:theme:v1";
const VISITED_KEY = "project-wiki:visited:v1";

export function init(initialData) {
  state.data = initialData;

  // Apply sidecar config defaults BEFORE reading user overrides from localStorage,
  // so user choices still win.
  const sidecarCfg = initialData?.sidecar?.config || {};
  if (sidecarCfg.theme?.preset) {
    state.theme = sidecarCfg.theme.preset;
  }
  if (sidecarCfg.pages) {
    for (const [key, val] of Object.entries(sidecarCfg.pages)) {
      const settingKey = "show" + key.charAt(0).toUpperCase() + key.slice(1);
      if (typeof val === "boolean" && settingKey in state.settings) {
        state.settings[settingKey] = val;
      }
    }
  }
  if (sidecarCfg.extras) {
    if ("charts" in sidecarCfg.extras) state.settings.showCharts = !!sidecarCfg.extras.charts;
    if ("ai_explanations" in sidecarCfg.extras) state.settings.showAIExplanations = !!sidecarCfg.extras.ai_explanations;
  }

  // User overrides — these always win
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) state.settings = { ...state.settings, ...JSON.parse(raw) };
    const theme = localStorage.getItem(THEME_KEY);
    if (theme) state.theme = theme;
  } catch {}

  document.documentElement.dataset.theme = state.theme;
}

export function get() {
  return state;
}

export function set(patch) {
  state = { ...state, ...patch };
  if (patch.theme) {
    document.documentElement.dataset.theme = patch.theme;
    try { localStorage.setItem(THEME_KEY, patch.theme); } catch {}
  }
  notify();
}

export function setSettings(partial) {
  state = { ...state, settings: { ...state.settings, ...partial } };
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); } catch {}
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) {
    try { fn(state); } catch (err) { console.error("listener error", err); }
  }
}

export function isFirstVisit() {
  try { return !localStorage.getItem(VISITED_KEY); } catch { return false; }
}

export function markVisited() {
  try { localStorage.setItem(VISITED_KEY, "1"); } catch {}
}
