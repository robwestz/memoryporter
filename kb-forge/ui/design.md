# KB-Forge UI Design Document

## 1. Overview

KB-Forge är en single-page web application för knowledge base-hantering. Appen tillåter användare att:
- **Scrape**: Extrahera innehåll från URLs och lagra i KB
- **Query**: Söka i befintliga knowledge bases med semantisk sökning
- **Build**: Autonoma byggen baserade på specifikationer
- **Settings**: Konfigurera systeminställningar

### Arkitektur
- **Typ**: Single-Page Application (SPA)
- **Tema**: Mörkt (default), med stöd för ljust
- **Layout**: Flexbox-baserad, responsiv
- **Inga externa CSS-ramverk**: All CSS är custom

---

## 2. Color Scheme

### CSS Variables

```css
:root {
  /* Primary Colors */
  --color-primary: #6366f1;           /* Indigo 500 */
  --color-primary-hover: #4f46e5;     /* Indigo 600 */
  --color-primary-light: #818cf8;     /* Indigo 400 */
  
  /* Background Colors */
  --color-bg-primary: #0f172a;       /* Slate 900 */
  --color-bg-secondary: #1e293b;      /* Slate 800 */
  --color-bg-tertiary: #334155;      /* Slate 700 */
  --color-bg-elevated: #475569;      /* Slate 600 */
  
  /* Text Colors */
  --color-text-primary: #f8fafc;     /* Slate 50 */
  --color-text-secondary: #94a3b8;   /* Slate 400 */
  --color-text-muted: #64748b;       /* Slate 500 */
  
  /* Accent Colors */
  --color-success: #10b981;           /* Emerald 500 */
  --color-warning: #f59e0b;           /* Amber 500 */
  --color-error: #ef4444;             /* Red 500 */
  --color-info: #3b82f6;              /* Blue 500 */
  
  /* Border & Shadow */
  --color-border: #334155;            /* Slate 700 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
  
  /* Spacing */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  
  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
}
```

### Light Theme (Optional)

```css
[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-border: #e2e8f0;
}
```

---

## 3. Layout Grid

### App Container

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (fixed, 64px height)                             │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  SIDEBAR   │           MAIN CONTENT AREA                │
│  (280px)   │           (flex: 1, scrollable)            │
│            │                                            │
│  - KB List │           View content based on tab        │
│            │                                            │
├────────────┴────────────────────────────────────────────┤
│  FOOTER (optional status bar)                           │
└─────────────────────────────────────────────────────────┘
```

### Layout Specs

```css
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}
```

---

## 4. Komponenter

### 4.1 Header/Nav

```
┌────────────────────────────────────────────────────────────────────┐
│  [KB-Forge]    Scrape  |  Query  |  Build  |  Settings      [⚙️] │
└────────────────────────────────────────────────────────────────────┘
```

**Spec:**
- **Height**: 64px
- **Background**: `var(--color-bg-secondary)`
- **Border-bottom**: 1px `var(--color-border)`
- **Padding**: 0 `var(--space-lg)`

**Komponenter:**
- **Logo**: "KB-Forge" text, font-weight 700, `var(--color-primary)`
- **Tabs**: Horisontell lista med 4 tabbar
  - Aktiv tab: `var(--color-primary)` underline + `var(--color-text-primary)`
  - Inaktiv tab: `var(--color-text-secondary)`
  - Hover: `var(--color-text-primary)`

```css
.nav-tabs {
  display: flex;
  gap: var(--space-sm);
}

.nav-tab {
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.nav-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.nav-tab:hover {
  color: var(--color-text-primary);
}
```

---

### 4.2 Scrape View

```
┌────────────────────────────────────────────────────────────┐
│  Scrape                                                    │
│  ──────────────────────────────────────────────────────   │
│                                                            │
│  URL                                                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ https://docs.devin.ai                              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  Storage Backend          Scraping Depth                   │
│  ┌──────────────────┐    ○ Single page                     │
│  │ 📝 markdown    ▼ │    ◉ Section (default)               │
│  └──────────────────┘    ○ Full site                       │
│                                                            │
│  KB Name                                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ devin-docs                                         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  [Start Scraping]                                          │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ⚡ Scraping... 45%                                 │   │
│  │ ████████████████████░░░░░░░░░░░░░░░░░░░░░░         │   │
│  │ Found: 23 pages | Indexed: 10                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Form Elements:**

```css
.form-group {
  margin-bottom: var(--space-lg);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  font-size: var(--text-base);
  transition: border-color 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-select {
  /* Same as input but with custom dropdown arrow */
  appearance: none;
  background-image: url("data:image/svg+xml,...");
  cursor: pointer;
}

.radio-group {
  display: flex;
  gap: var(--space-md);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
}

.radio-input {
  accent-color: var(--color-primary);
}
```

**Progress Status:**

```css
.status-card {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-md);
  margin-top: var(--space-lg);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-elevated);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.status-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
```

---

### 4.3 Query View

```
┌────────────────────────────────────────────────────────────┐
│  Query                                                     │
│  ──────────────────────────────────────────────────────   │
│                                                            │
│  Knowledge Base                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔍 chroma    │  devin-docs                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  Your Question                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │ How do I set up a custom MCP server?               │   │
│  │                                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  [Search Knowledge Base]                                   │
│                                                            │
│  ──────────── Results (3) ─────────────────────────────   │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 0.95                                              │   │
│  │ To set up a custom MCP server, create a file...    │   │
│  │ Source: docs.devin.ai/mcp-setup             [↗]   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 0.87                                              │   │
│  │ MCP servers can be configured with tools and...    │   │
│  │ Source: docs.devin.ai/configuration         [↗]   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 0.72                                              │   │
│  │ The server requires a valid configuration file...  │   │
│  │ Source: docs.devin.ai/advanced-setup        [↗]   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Result Card:**

```css
.result-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  transition: border-color 0.15s ease;
}

.result-card:hover {
  border-color: var(--color-primary);
}

.score-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-success);
  color: white;
  font-size: var(--text-sm);
  font-weight: 600;
  border-radius: 4px;
  margin-bottom: var(--space-sm);
}

.result-snippet {
  color: var(--color-text-primary);
  font-size: var(--text-base);
  line-height: 1.5;
  margin-bottom: var(--space-sm);
}

.result-source {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.source-link {
  color: var(--color-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.source-link:hover {
  text-decoration: underline;
}
```

---

### 4.4 Build View

```
┌────────────────────────────────────────────────────────────┐
│  Autonomous Build                                          │
│  ──────────────────────────────────────────────────────   │
│                                                            │
│  Specification                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Build a Python CLI tool that:                      │   │
│  │ - Takes a URL argument                             │   │
│  │ - Scrapes the page                                 │   │
│  │ - Extracts all links                             │   │
│  │ - Outputs to JSON                                │   │
│  │                                                    │   │
│  │ Context: Devin docs from https://docs.devin.ai     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  [Start Autonomous Build]                                  │
│                                                            │
│  ─────────── Active Jobs ──────────────────────────────   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🔄 Building: link-scraper-cli                      │ │
│  │    Phase: Testing (3/5)                            │ │
│  │    Started: 2 min ago                              │ │
│  │    [View Logs] [Cancel]                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Job Status Card:**

```css
.job-card {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-md);
}

.job-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.job-icon {
  font-size: var(--text-lg);
}

.job-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.job-meta {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.job-actions {
  display: flex;
  gap: var(--space-sm);
}

.btn-secondary {
  padding: var(--space-xs) var(--space-md);
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--text-sm);
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-text-primary);
}
```

---

### 4.5 KB List (Sidebar)

```
┌──────────────┐
│  KB-Forge    │
├──────────────┤
│              │
│ Knowledge    │
│ Bases        │
│ ───────────  │
│              │
│ ┌──────────┐ │
│ │ 📝       │ │
│ │ my-docs  │ │
│ │ markdown │ │
│ │ 2d ago   │ │
│ │ [Q] [🗑] │ │
│ └──────────┘ │
│              │
│ ┌──────────┐ │
│ │ 🔍       │ │
│ │ devin    │ │
│ │ chroma   │ │
│ │ 5h ago   │ │
│ │ [Q] [🗑] │ │
│ └──────────┘ │
│              │
│ ┌──────────┐ │
│ │ ⚡       │ │
│ │ notes    │ │
│ │ hybrid   │ │
│ │ 1w ago   │ │
│ │ [Q] [🗑] │ │
│ └──────────┘ │
│              │
│ [+ New KB]   │
│              │
└──────────────┘
```

**KB Card:**

```css
.kb-list {
  padding: var(--space-md);
}

.kb-section-title {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.kb-card {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  transition: all 0.15s ease;
}

.kb-card:hover {
  border-color: var(--color-primary);
}

.kb-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.kb-icon {
  font-size: var(--text-xl);
}

.kb-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.kb-type {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  margin-bottom: var(--space-sm);
}

.kb-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.kb-actions {
  display: flex;
  gap: var(--space-xs);
}

.kb-btn {
  padding: var(--space-xs);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.kb-btn:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.kb-btn.delete:hover {
  color: var(--color-error);
}
```

**KB Type Icons:**
- `📝` markdown
- `🏛️` obsidian
- `🔍` chroma
- `⚡` hybrid

---

### 4.6 Buttons

**Primary Button:**

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--text-base);
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Button Sizes:**
- Small: `padding: var(--space-xs) var(--space-md)`
- Medium (default): `padding: var(--space-sm) var(--space-lg)`
- Large: `padding: var(--space-md) var(--space-xl)`

---

## 5. Interactions

### Tab Navigation

| Event | Action |
|-------|--------|
| Click tab | Switch to view, update URL hash |
| Load app | Read URL hash, set active tab |

### Scrape View

| Event | Action |
|-------|--------|
| URL input blur | Auto-generate KB name from URL |
| "Start Scraping" click | Validate form, start job, show progress |
| Progress update | Animate progress bar, update status text |
| Job complete | Show success state, add KB to list |

### Query View

| Event | Action |
|-------|--------|
| KB selector change | Update search context |
| "Search" click | Submit query, show loading state |
| Result click | Expand full text (optional) |
| Source link click | Open in new tab |

### Build View

| Event | Action |
|-------|--------|
| "Start Build" click | Create job, show in status list |
| "View Logs" click | Expand/collapse log output |
| "Cancel" click | Confirm, terminate job |

### KB List

| Event | Action |
|-------|--------|
| Click KB card | Select (highlight) |
| "Q" button click | Navigate to Query with KB pre-selected |
| Delete button click | Confirm modal, then remove |
| "+ New KB" click | Navigate to Scrape view |

---

## 6. Responsive Rules

### Breakpoints

```css
/* Mobile: < 768px */
@media (max-width: 767px) {
  .sidebar {
    display: none; /* Or slide-out drawer */
  }
  
  .nav-tabs {
    font-size: var(--text-sm);
  }
  
  .main-content {
    padding: var(--space-md);
  }
  
  .radio-group {
    flex-direction: column;
    gap: var(--space-sm);
  }
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 240px;
  }
}

/* Desktop: >= 1024px */
@media (min-width: 1024px) {
  .sidebar {
    width: 280px;
  }
}
```

### Mobile Adaptations

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Sidebar | Fixed left | Hidden / Drawer |
| Nav tabs | Horizontal | Horizontal scroll |
| Form layout | 2-col grid | Single column |
| KB list | Sidebar | Main view toggle |
| Results | Full width | Full width |

### Touch Optimizations

- Minimum touch target: 44px
- Button padding increased on mobile
- Form inputs: 48px minimum height
- Card tap areas full width

---

## 7. Animation & Transitions

### Standard Transitions

```css
/* Quick feedback */
--transition-fast: 0.15s ease;

/* Content changes */
--transition-base: 0.3s ease;

/* Page/major transitions */
--transition-slow: 0.5s ease;
```

### Recommended Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Tab switch | Fade content | 0.2s |
| Progress bar | Width transition | 0.3s |
| Card hover | Border color + shadow | 0.15s |
| Button hover | Background color | 0.15s |
| Sidebar toggle | Translate X | 0.3s |
| Result appear | Fade up + stagger | 0.2s |

---

## 8. Accessibility

### Requirements

- **Keyboard navigation**: All interactive elements focusable
- **Focus indicators**: Visible outline on focus
- **ARIA labels**: Form inputs have associated labels
- **Color contrast**: Minimum 4.5:1 for text
- **Screen reader**: Logical heading hierarchy

### Focus Styles

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## Appendix: File Structure

```
kb-forge/ui/
├── design.md           # This document
├── wireframes/
│   └── overview.txt    # ASCII wireframes
├── styles.css          # Implementation (future)
└── components/         # Component files (future)
```
