import { Inline } from "@/lib/layout";
import type { Asset, AssetFilters, BulkAction, AssetType } from "../types";

// ---- FilterBar -------------------------------------------------------------

export type FilterBarProps = {
  filters: AssetFilters;
  onFiltersChange: (f: AssetFilters) => void;
};

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const types: Array<AssetType | "all"> = ["all", "image", "video", "document", "audio"];
  return (
    <Inline gap={8} align="center">
      {types.map((t) => (
        <button
          key={t}
          onClick={() => onFiltersChange({ ...filters, type: t === "all" ? undefined : t })}
          style={{
            padding: "var(--space-4) var(--space-12)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-pill)",
            background: (t === "all" && !filters.type) || filters.type === t ? "var(--color-accent-subtle)" : "var(--color-surface-raised)",
            color: (t === "all" && !filters.type) || filters.type === t ? "var(--color-text-accent)" : "var(--color-text-secondary)",
            cursor: "pointer",
          }}
        >
          {t}
        </button>
      ))}
      <input
        value={filters.search ?? ""}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        placeholder="Search assets…"
        style={{
          padding: "var(--space-4) var(--space-12)",
          fontSize: "var(--text-sm)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface-base)",
          color: "var(--color-text-primary)",
          flex: 1,
          minWidth: 0,
        }}
      />
    </Inline>
  );
}

// ---- AssetCard -------------------------------------------------------------

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export type AssetCardProps = {
  asset: Asset;
  selected: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onPick: (asset: Asset) => void;
};

export function AssetCard({ asset, selected, onSelect, onPick }: AssetCardProps) {
  return (
    <div
      onClick={(e) => onSelect(asset.id, e.metaKey || e.ctrlKey)}
      onDoubleClick={() => onPick(asset)}
      style={{
        borderRadius: "var(--radius-lg)",
        border: `2px solid ${selected ? "var(--color-accent-default)" : "var(--color-border-subtle)"}`,
        overflow: "hidden",
        cursor: "pointer",
        background: "var(--color-surface-raised)",
        transition: `border-color var(--motion-fast)`,
      }}
    >
      <div
        style={{
          aspectRatio: "4/3",
          background: "var(--color-surface-sunken)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {asset.thumbnailUrl ? (
          <img src={asset.thumbnailUrl} alt={asset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "var(--text-2xl)", color: "var(--color-text-tertiary)" }}>
            {asset.type === "image" ? "🖼" : asset.type === "video" ? "▶" : "📄"}
          </span>
        )}
        {selected && (
          <div
            style={{
              position: "absolute",
              top: "var(--space-8)",
              right: "var(--space-8)",
              width: "var(--space-16)",
              height: "var(--space-16)",
              borderRadius: "var(--radius-pill)",
              background: "var(--color-accent-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-inverted)",
              fontWeight: 700,
            }}
          >
            ✓
          </div>
        )}
      </div>
      <div style={{ padding: "var(--space-8) var(--space-12)" }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {asset.name}
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-4)" }}>
          {formatBytes(asset.size)}{asset.usageCount > 0 && ` · used ${asset.usageCount}×`}
        </div>
      </div>
    </div>
  );
}

// ---- BulkActionBar ---------------------------------------------------------

export type BulkActionBarProps = {
  selected: string[];
  actions: BulkAction[];
  onAction: (action: BulkAction, ids: string[]) => void;
  onClear: () => void;
};

export function BulkActionBar({ selected, actions, onAction, onClear }: BulkActionBarProps) {
  if (selected.length === 0) return null;
  return (
    <div style={{ padding: "var(--space-8) var(--space-16)", background: "var(--color-accent-subtle)", borderBottom: "1px solid var(--color-border-subtle)" }}>
      <Inline gap={8} align="center">
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-accent)" }}>
          {selected.length} selected
        </span>
        {actions.map((a) => (
          <button
            key={a}
            onClick={() => onAction(a, selected)}
            style={{
              padding: "var(--space-4) var(--space-12)",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-surface-overlay)",
              color: a === "delete" ? "var(--color-danger)" : "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            {a}
          </button>
        ))}
        <button onClick={onClear} style={{ marginLeft: "auto", fontSize: "var(--text-xs)", border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
          Clear
        </button>
      </Inline>
    </div>
  );
}
