import { useState, useMemo } from "react";
import { Stack, Grid } from "@/lib/layout";
import type { Asset, AssetFilters, BulkAction } from "../types";
import { FilterBar, AssetCard, BulkActionBar, formatBytes } from "./MediaLibraryParts";

const STUB_ASSETS: Asset[] = [
  { id: "1", name: "hero-banner.jpg", type: "image", url: "", thumbnailUrl: undefined, size: 248000, tags: [], folderId: null, uploadedAt: new Date(), usageCount: 3 },
  { id: "2", name: "team-photo.png", type: "image", url: "", thumbnailUrl: undefined, size: 512000, tags: ["team"], folderId: null, uploadedAt: new Date(), usageCount: 1 },
  { id: "3", name: "product-demo.mp4", type: "video", url: "", thumbnailUrl: undefined, size: 12400000, tags: [], folderId: null, uploadedAt: new Date(), usageCount: 0 },
  { id: "4", name: "press-kit.pdf", type: "document", url: "", thumbnailUrl: undefined, size: 2048000, tags: ["press"], folderId: null, uploadedAt: new Date(), usageCount: 5 },
  { id: "5", name: "logo-light.svg", type: "image", url: "", thumbnailUrl: undefined, size: 8000, tags: ["brand"], folderId: null, uploadedAt: new Date(), usageCount: 12 },
  { id: "6", name: "favicon.png", type: "image", url: "", thumbnailUrl: undefined, size: 4000, tags: ["brand"], folderId: null, uploadedAt: new Date(), usageCount: 8 },
];

export type MediaLibraryProps = {
  folderId: string | null;
  onSelect: (asset: Asset) => void;
  view?: "grid" | "list";
  filters?: AssetFilters;
  bulkActions?: BulkAction[];
};

export function MediaLibrary({
  folderId,
  onSelect,
  view = "grid",
  filters = {},
  bulkActions = [],
}: MediaLibraryProps) {
  const [localFilters, setLocalFilters] = useState<AssetFilters>(filters);
  const [selected, setSelected] = useState<string[]>([]);

  void folderId; // Consumed by parent routing in production

  const assets = useMemo(() => {
    return STUB_ASSETS.filter((a) => {
      if (localFilters.type && a.type !== localFilters.type) return false;
      if (localFilters.search && !a.name.toLowerCase().includes(localFilters.search.toLowerCase())) return false;
      return true;
    });
  }, [localFilters]);

  const handleSelect = (id: string, multi: boolean) => {
    if (multi) {
      setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    } else {
      setSelected([id]);
    }
  };

  return (
    <Stack gap={0} style={{ height: "100%" }}>
      <div style={{ padding: "var(--space-12) var(--space-16)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)" }}>
        <FilterBar filters={localFilters} onFiltersChange={setLocalFilters} />
      </div>

      <BulkActionBar
        selected={selected}
        actions={bulkActions}
        onAction={() => setSelected([])}
        onClear={() => setSelected([])}
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-16)" }}>
        {assets.length === 0 ? (
          <div style={{ padding: "var(--space-64)", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "var(--text-sm)" }}>
            No assets found. Upload files to get started.
          </div>
        ) : view === "grid" ? (
          <Grid columns={4} gap={16}>
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} selected={selected.includes(asset.id)} onSelect={handleSelect} onPick={onSelect} />
            ))}
          </Grid>
        ) : (
          <Stack gap={4}>
            {assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => onSelect(asset)}
                style={{
                  padding: "var(--space-12) var(--space-16)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-surface-raised)",
                  cursor: "pointer",
                  display: "flex",
                  gap: "var(--space-12)",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "var(--text-lg)" }}>
                  {asset.type === "image" ? "🖼" : asset.type === "video" ? "▶" : "📄"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>{asset.name}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
                    {formatBytes(asset.size)} · {asset.type}
                  </div>
                </div>
              </div>
            ))}
          </Stack>
        )}
      </div>
    </Stack>
  );
}
