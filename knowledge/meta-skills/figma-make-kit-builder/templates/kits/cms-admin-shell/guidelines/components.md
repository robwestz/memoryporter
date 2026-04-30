# Components — cms-admin-shell

Headless CMS admin console. Target user: content operators managing 100+
articles across multiple publications or brands. Surfaces the operator sits
in for hours, not the reader-facing site.

## CollectionSchemaEditor

**Usage** — Top-level admin surface for defining content types (a "Collection"
= a type like `Article`, `Product`, `Landing Page`). Used alongside
`FieldTypeRegistry` and `ValidationRuleBuilder`. One per route: `/schemas/:id`.

**Semantic purpose** — The contract between content operators and developers.
Changing a schema is a versioned, audited event, not a casual edit.

**Examples**

Correct:

```tsx
<CollectionSchemaEditor
  collectionId="articles"
  fields={fields}
  onFieldAdd={addField}
  onFieldReorder={reorderFields}
  versionStrategy="breaking-bumps-major"
/>
```

Incorrect:

```tsx
<CollectionSchemaEditor collectionId="articles" fields={fields} />
```

*Why wrong:* Missing `versionStrategy` means schema changes appear silent —
no migration prompt, no audit entry. Content operators will break downstream
consumers without realizing.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `collectionId` | `string` | yes | — | Slug of the collection |
| `fields` | `Field[]` | yes | — | Current field definitions |
| `onFieldAdd` | `(f: Field) => void` | yes | — | Adds a field |
| `onFieldReorder` | `(from: number, to: number) => void` | yes | — | Reorders |
| `versionStrategy` | `"breaking-bumps-major" \| "all-minor"` | yes | — | Semver policy |
| `readonly` | `boolean` | no | `false` | Viewer mode |

---

## BlockRichTextEditor

**Usage** — Primary content authoring surface. Blocks (paragraph, heading,
image, embed, custom) are reorderable and each has its own inline toolbar.
Pairs with `MediaLibraryPicker` (for image/embed blocks) and
`CollaborativeCursor` (when multi-user editing is enabled).

**Semantic purpose** — Content as a tree of semantic blocks, not a flat HTML
string. Each block is addressable, typed, and validatable independently.

**Examples**

Correct:

```tsx
<BlockRichTextEditor
  blocks={blocks}
  onChange={setBlocks}
  blockRegistry={blockRegistry}
  collaborators={activeCollaborators}
  allowedBlockTypes={["paragraph", "heading", "image", "embed", "callout"]}
/>
```

Incorrect:

```tsx
<BlockRichTextEditor value={htmlString} onChange={setHtmlString} />
```

*Why wrong:* Treating content as HTML string forfeits block-level validation,
targeted translation, structured search, and future format migration.
The rich-text editor's whole value is the typed block tree.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `blocks` | `Block[]` | yes | — | Current block tree |
| `onChange` | `(blocks: Block[]) => void` | yes | — | Block tree setter |
| `blockRegistry` | `BlockRegistry` | yes | — | Available block types + renderers |
| `collaborators` | `Collaborator[]` | no | `[]` | Other editors' cursors |
| `allowedBlockTypes` | `string[]` | no | all | Restrict picker |
| `readonly` | `boolean` | no | `false` | Viewer mode |

---

## MediaLibrary

**Usage** — Browse, upload, search, and organize media assets across the
account. Paired with `MediaLibraryPicker` (the modal version used from inside
blocks) and `AssetUsageMap` (showing where an asset appears).

**Semantic purpose** — Assets as first-class resources with metadata,
permissions, and usage tracking — not file uploads.

**Examples**

Correct:

```tsx
<MediaLibrary
  folderId={currentFolder}
  onSelect={onAssetSelect}
  view="grid"
  filters={{ type: "image", uploadedAfter: thirtyDaysAgo }}
  bulkActions={["move", "tag", "delete"]}
/>
```

Incorrect:

```tsx
<MediaLibrary onSelect={onAssetSelect} />
```

*Why wrong:* No folder, no filters, no bulk actions — just a flat picker.
Operators with 10k+ assets need structure, not a list.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `folderId` | `string \| null` | yes | — | Current folder, null = root |
| `onSelect` | `(asset: Asset) => void` | yes | — | Selection handler |
| `view` | `"grid" \| "list"` | no | `"grid"` | Layout |
| `filters` | `AssetFilters` | no | `{}` | Type/date/tag filters |
| `bulkActions` | `BulkAction[]` | no | `[]` | Enabled multi-select actions |

---

## DraftPublishBar

**Usage** — Persistent footer bar on content detail pages. Shows current state
(draft/scheduled/published), last save time, and primary action (save,
schedule, publish). Includes `ConflictResolver` if two editors overlap.

**Semantic purpose** — Publish state is a user-visible, auditable transition.
Never silent; always staged (draft → review → schedule → publish).

**Examples**

Correct:

```tsx
<DraftPublishBar
  state={currentState}
  lastSavedAt={lastSaved}
  nextAction={canPublish ? "publish" : "request-review"}
  onAction={handleStateTransition}
  scheduleEnabled={planTier !== "free"}
/>
```

Incorrect:

```tsx
<DraftPublishBar onSave={onSave} onPublish={onPublish} />
```

*Why wrong:* Two buttons with no state awareness — no indication of whether
publishing requires review, no schedule option, no gating for the paid tier.
Misses the state-machine nature of the publish lifecycle.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `state` | `"draft" \| "review" \| "scheduled" \| "published"` | yes | — | Current state |
| `lastSavedAt` | `Date` | yes | — | For "Saved 2m ago" |
| `nextAction` | `Action` | yes | — | Primary button action |
| `onAction` | `(a: Action) => void` | yes | — | Handles the transition |
| `scheduleEnabled` | `boolean` | no | `true` | Gate scheduling by tier |

---

## VersionHistoryDrawer

**Usage** — Right-side drawer on content pages. Lists every save as a version;
clicking shows a diff; restoring creates a new version (never destructive).
Pairs with `DiffViewer`.

**Semantic purpose** — History is additive. Restoring is creating a new
version with old content. Never overwrite.

**Examples**

Correct:

```tsx
<VersionHistoryDrawer
  contentId={contentId}
  versions={versions}
  onRestore={(versionId) => restoreAsNewVersion(versionId)}
  renderDiff={(a, b) => <DiffViewer a={a} b={b} />}
/>
```

Incorrect:

```tsx
<VersionHistoryDrawer
  onRestore={(versionId) => overwriteCurrentWith(versionId)}
/>
```

*Why wrong:* Overwrite = data loss. The "restore" action in a CMS must
always produce a new version that can itself be reverted.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `contentId` | `string` | yes | — | Which content's history |
| `versions` | `Version[]` | yes | — | Chronological, newest first |
| `onRestore` | `(id: string) => void` | yes | — | Must create new version |
| `renderDiff` | `(a: Version, b: Version) => ReactNode` | yes | — | Diff renderer |

---

## Monetization patterns enforced

- **Seat/role expansion** — `InviteMemberModal` + `RoleAssignPicker` on
  `/settings/team`
- **Content gating** — `PaywallConfigurator` per content piece, `LockedPreview`
  for unauthenticated visitors
- **API/webhook access** — `ApiKeyManager` at `/settings/api`, webhook events
  for `content.published`, `content.updated`
- **Advanced-mode toggles** — `ProFeatureCallout` on `VersionHistoryDrawer`
  (unlimited history is paid), on `CollaborativeCursor` (multi-user is paid),
  on `BlockRichTextEditor` custom block types
