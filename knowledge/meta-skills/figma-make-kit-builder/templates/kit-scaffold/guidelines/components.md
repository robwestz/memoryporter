# Components

Per-component specs. Figma Make reads this to learn how components are used.

Each component documented as:

- **Usage** — when this component is the right choice, and which other
  components it commonly pairs with
- **Semantic purpose** — what it means (not what it looks like)
- **Examples** — at least one correct usage + at least one incorrect usage
  (common mistake) with note on why the incorrect one is wrong
- **API** — props table: name | type | required | default | description

Reference: https://developers.figma.com/docs/code/write-design-system-guidelines/#components-component-guidelines

<!-- [VARIABLE] Per-kit component specs go below. Replace this placeholder
     with one section per headline component. Keep the four-part structure
     (Usage / Semantic purpose / Examples / API) for every one. -->

## ExampleComponent

**Usage** — Replace this placeholder section with a real component. Typically
used alongside `AnotherComponent` inside a `Stack` layout.

**Semantic purpose** — Describes meaning, not appearance. E.g., "Displays a
pending approval state requiring operator action" rather than "orange box".

**Examples**

Correct:

```tsx
<ExampleComponent state="pending" onResolve={() => {}} />
```

Incorrect (common mistake):

```tsx
<ExampleComponent state="orange" />
```

*Why wrong:* State is a semantic value (`pending | active | resolved`), not
a color. Colors come from tokens based on state.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `state` | `"pending" \| "active" \| "resolved"` | yes | — | Current lifecycle state |
| `onResolve` | `() => void` | no | noop | Fires when operator resolves |
| `density` | `"compact" \| "default" \| "comfortable"` | no | `"default"` | Row density |
