# Components — multi-tenant-workspace

SaaS workspace shell: org → team → user hierarchy, RBAC, invites, billing
per workspace. Target user: admins switching between client/customer
workspaces, managing access, paying per seat.

## WorkspaceSwitcher

**Usage** — Top-left of the app shell. Shows current workspace, lets user
switch to another, opens a create-workspace flow. Often with a keyboard
shortcut (Cmd+K or Cmd+O).

**Semantic purpose** — The boundary between tenants. Every page in the app
is scoped to the active workspace; switching is a routing event, not a filter.

**Examples**

Correct:

```tsx
<WorkspaceSwitcher
  current={activeWorkspace}
  available={userWorkspaces}
  onSwitch={(wsId) => navigateToWorkspace(wsId)}
  onCreateNew={openCreateFlow}
  shortcut="cmd+k"
  recentFirst
/>
```

Incorrect:

```tsx
<WorkspaceSwitcher
  onSwitch={(wsId) => setWorkspaceFilter(wsId)}
/>
```

*Why wrong:* Setting a filter instead of routing = stale URLs, no deep
linking, no browser history. Switching workspaces must change the URL.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `current` | `Workspace` | yes | — | Active workspace |
| `available` | `Workspace[]` | yes | — | User's workspaces |
| `onSwitch` | `(id: string) => void` | yes | — | Must navigate, not filter |
| `onCreateNew` | `() => void` | yes | — | Opens create flow |
| `shortcut` | `string` | no | `undefined` | Keyboard binding |
| `recentFirst` | `boolean` | no | `true` | Sort by last accessed |

---

## InviteMemberModal

**Usage** — Opened from team settings or a "+ Invite" button in the member
list. Email + role + (optional) team assignment. Shows seat-cost preview if
the invite will push the workspace over a tier limit.

**Semantic purpose** — An invitation is a future seat commitment. The cost
must be visible *before* the invite is sent, not after the user accepts.

**Examples**

Correct:

```tsx
<InviteMemberModal
  currentSeatCount={8}
  planLimit={10}
  costPerExtraSeat={15}
  availableRoles={["admin", "editor", "viewer"]}
  onSend={sendInvite}
/>
```

Incorrect:

```tsx
<InviteMemberModal onSend={sendInvite} />
```

*Why wrong:* No seat-count context = user invites 5 people, then discovers
mid-onboarding they're being charged. Surprise billing = churn.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentSeatCount` | `number` | yes | — | For "8 of 10 used" |
| `planLimit` | `number` | yes | — | For seat-cost preview |
| `costPerExtraSeat` | `number` | yes | — | For transparency |
| `availableRoles` | `Role[]` | yes | — | Role picker options |
| `onSend` | `(invite: Invite) => Promise<void>` | yes | — | Sender |

---

## RBACPermissionsMatrix

**Usage** — At `/settings/roles/:roleId`. Grid of resources × actions; click
to toggle. Saved as a role definition that members inherit. Paired with
`RoleAssignPicker` (where members are given a role).

**Semantic purpose** — The explicit mapping from role → capabilities. Not a
UI; the authoritative access contract. Changes are audited events.

**Examples**

Correct:

```tsx
<RBACPermissionsMatrix
  role={editingRole}
  resources={allResources}
  actions={["read", "write", "delete", "share"]}
  onChange={updateRoleDraft}
  onSave={saveWithAudit}
  dirty={hasUnsavedChanges}
/>
```

Incorrect:

```tsx
<RBACPermissionsMatrix permissions={flatPermsList} />
```

*Why wrong:* A flat list doesn't expose the resource × action structure users
think in. It also makes "grant this role all read access" impossible to
express in one interaction.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `role` | `Role` | yes | — | Role being edited |
| `resources` | `Resource[]` | yes | — | Grid rows |
| `actions` | `Action[]` | yes | — | Grid columns |
| `onChange` | `(role: Role) => void` | yes | — | Draft updates |
| `onSave` | `(role: Role) => Promise<void>` | yes | — | Must audit |
| `dirty` | `boolean` | yes | — | Enables save button |

---

## BillingPerWorkspacePanel

**Usage** — At `/settings/billing`. Shows current plan, usage vs limits, next
invoice date + amount, and payment method. One billing context per workspace.
Pairs with `UpgradePromptInline` (appears when limits are approached).

**Semantic purpose** — Financial truth. What the workspace is paying for, when,
and how much. Users check this to verify charges; it must be accurate, not
marketing-y.

**Examples**

Correct:

```tsx
<BillingPerWorkspacePanel
  workspace={activeWorkspace}
  currentPlan={plan}
  usage={usage}
  limits={limits}
  nextInvoice={nextInvoice}
  paymentMethod={paymentMethod}
  onUpgrade={openUpgradeFlow}
  onDowngrade={openDowngradeFlow}
/>
```

Incorrect:

```tsx
<BillingPerWorkspacePanel plan="Pro" price="$49/mo" />
```

*Why wrong:* Hardcoded display, no usage data, no upgrade/downgrade paths.
Users can't verify what they're paying for or change it.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `workspace` | `Workspace` | yes | — | For name/ID header |
| `currentPlan` | `Plan` | yes | — | Full plan object, not string |
| `usage` | `UsageMetrics` | yes | — | Current-period consumption |
| `limits` | `Limits` | yes | — | Plan's limits |
| `nextInvoice` | `Invoice` | yes | — | Date + amount preview |
| `paymentMethod` | `PaymentMethod` | yes | — | Last 4 + type |
| `onUpgrade` | `() => void` | yes | — | Opens flow |
| `onDowngrade` | `() => void` | yes | — | Opens flow with warnings |

---

## TeamListTable

**Usage** — At `/settings/team`. Virtualized member table with role, status
(active/invited/suspended), last login, and per-row actions (change role,
remove, resend invite).

**Semantic purpose** — Roster. Who has access, in what role, and are they
actively using it.

**Examples**

Correct:

```tsx
<TeamListTable
  members={members}
  filters={{ role: "all", status: "active" }}
  bulkActions={["change-role", "remove", "export"]}
  onMemberAction={handleMemberAction}
/>
```

Incorrect:

```tsx
<TeamListTable members={members} />
```

*Why wrong:* No filters, no bulk actions — unusable past ~20 members. Team
tables with 200+ need the full data-table affordances.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `members` | `Member[]` | yes | — | Full list |
| `filters` | `MemberFilters` | no | `{}` | Role/status/team |
| `bulkActions` | `BulkAction[]` | no | `[]` | Multi-select ops |
| `onMemberAction` | `(a: MemberAction) => void` | yes | — | Per-row + bulk |

---

## Monetization patterns enforced

- **Seat/role expansion** — `InviteMemberModal` with `SeatCostPreview` inline
- **Workspace/brand-per-customer** — `WhiteLabelConfigPanel`,
  `CustomDomainSetup`, `BrandAssetUploader` in `/settings/branding`
- **Usage-visible billing** — `BillingPerWorkspacePanel` + `UsageMeter` in
  app header
- **Tier-aware empty states** — new-workspace empty state shows paid features
  as previews
