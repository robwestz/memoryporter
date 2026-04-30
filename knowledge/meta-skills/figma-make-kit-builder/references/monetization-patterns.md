# Monetization Patterns

> **When to read this:** When composing a kit's components, to ensure
> revenue-critical affordances exist in the right places. Also when deciding
> whether a proposed kit qualifies under complexity-gate check #4.

## Why this is a constraint, not a suggestion

The complaint behind this skill: "all AI-generated kits are landing pages and
pricing tables". Those sit *outside* the product where a user decides to buy.
The kits in this skill sit *inside* the product where a user decides to stay.
Retention is worth more than acquisition, and the surfaces that drive retention
are admin/operator/power-user tools.

Every kit in this package must expose — visibly in its component manifest —
at least 3 of the monetization patterns below. If fewer, the kit is an
acquisition tool in disguise and belongs elsewhere.

## The patterns

### 1. Usage-visible billing

Where: multi-tenant-workspace, marketplace-console, ai-search-chat-shell.

Users need to see their consumption before they need to buy more. Show
usage-to-limit bars, cost-so-far tiles, and "upgrade to raise limit" prompts
*at the moment of hitting limits*, not buried in settings.

Components: `UsageMeter`, `LimitBar`, `BillingPeriodCard`, `UpgradePromptInline`.

### 2. Seat/role expansion

Where: multi-tenant-workspace, cms-admin-shell, creator-lms.

Inviting a teammate is a monetization event (+1 seat). The invite flow should
never feel punishing — surface the seat cost, but make the add-seat action one
click from the invite modal.

Components: `InviteMemberModal`, `SeatCostPreview`, `RoleAssignPicker`.

### 3. Workspace/brand-per-customer

Where: multi-tenant-workspace, cms-admin-shell, marketplace-console.

White-label → tier upsell. Custom domain → tier upsell. Brand kit upload →
tier upsell. Every brand-extension surface is a paid upgrade path.

Components: `WhiteLabelConfigPanel`, `CustomDomainSetup`, `BrandAssetUploader`.

### 4. Advanced-mode toggles

Where: analytics-composer, workflow-builder, power-data-table, cms-admin-shell.

"Pro features" gate. Free-tier users see the toggle, see what it does in a
preview, can click it to start a paid trial. Never hide the toggle — showing
it *without access* is the conversion moment.

Components: `ProFeatureCallout`, `GatedToggle`, `TrialStartBanner`.

### 5. Data export / portability

Where: analytics-composer, power-data-table, marketplace-console.

Export is a retention tool (users trust that their data isn't trapped) AND a
tier gate (CSV on free, Excel/API on paid). Always surface the export affordance;
gate by format/volume.

Components: `ExportMenu`, `ExportFormatPicker`, `ExportHistoryList`.

### 6. API/webhook access

Where: workflow-builder, cms-admin-shell, marketplace-console, ai-search-chat-shell.

Programmatic access is a high-tier gate and a stickiness tool. API key
management, rate-limit visibility, and webhook status belong in the kit.

Components: `ApiKeyManager`, `RateLimitMeter`, `WebhookEventLog`.

### 7. Content gating

Where: creator-lms, cms-admin-shell, marketplace-console.

Paid content needs a paywall affordance that the creator can configure per
piece. Payment state drives UI state (locked preview → payment → unlocked).

Components: `PaywallConfigurator`, `LockedPreview`, `UnlockFlowStepper`.

### 8. Social/trust signals as conversion surface

Where: marketplace-console, creator-lms, ai-search-chat-shell.

Reviews, ratings, badges, verification marks — not decoration, conversion
levers. Admin side: the console for managing/responding. User side: the
surfaces that display them.

Components: `ReviewManagerTable`, `VerificationBadge`, `RatingAggregateCard`,
`ReviewResponseEditor`.

### 9. Abandoned-state rescue

Where: ai-search-chat-shell, marketplace-console, workflow-builder.

When a user starts something and stops — a half-built workflow, an incomplete
listing, an unfinished chat — surface it on return. Completion = retention =
continued payment.

Components: `IncompleteDraftsPanel`, `ResumeWizard`, `AbandonedStateTile`.

### 10. Tier-aware empty states

Where: all kits.

Empty states are the most-viewed screen in a new account. Make them tier-aware:
show what's unlocked now, what's gated, and the most valuable next action.

Components: `TierAwareEmptyState`, `UpgradeTeaser`, `FirstActionCTA`.

## How to apply

When composing a kit's `guidelines/components.md`:

1. List the kit's headline components from SKILL.md Step 2
2. Cross-reference against the patterns above — which 3+ does this kit
   naturally carry?
3. For each matching pattern, include the relevant Components: in the kit's
   component manifest
4. In `guidelines/Guidelines.md`, list which patterns this kit enforces and
   where

## Anti-patterns

| Do NOT | Why | Instead |
|--------|-----|---------|
| Hide gated features | Removes the conversion moment | Show with a clear gate affordance |
| Make limit-hit a hard error | Users bounce | Soft-limit with upgrade prompt inline |
| Bury billing in settings | No one visits settings | Surface usage in the work surface |
| Charge for exports without preview | Users refuse | Show export preview free, gate volume/format |
| Put monetization on public pages only | That's a landing page kit | This skill is for *inside* the product |

## Related

- `complexity-gate.md` — gate check #4 (revenue path) references this file
- `foundation-lock.md` — these components use shared primitives, no drift
