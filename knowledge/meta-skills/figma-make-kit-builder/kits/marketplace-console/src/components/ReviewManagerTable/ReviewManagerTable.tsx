import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import { DataTable } from "../_shared/DataTable";
import type { ColumnDef } from "../_shared/DataTable";
import { StarRating, ReviewStatusBadge, FlagReasonPicker } from "./ReviewWidgets";
import type { Review, ReviewFilters } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

type ReviewManagerTableProps = {
  reviews: Review[];
  filters?: ReviewFilters;
  onRespond: (id: string) => void;
  onFlag: (id: string, reason: string) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewManagerTable({
  reviews,
  filters = {},
  onRespond,
  onFlag
}: ReviewManagerTableProps) {
  const [localFilters, setLocalFilters] = useState<ReviewFilters>(filters);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);

  // Apply filters
  const visible = reviews.filter((r) => {
    if (localFilters.rating && !localFilters.rating.includes(r.rating)) return false;
    if (localFilters.respondedTo === false && r.respondedAt) return false;
    if (localFilters.respondedTo === true && !r.respondedAt) return false;
    if (localFilters.status && r.status !== localFilters.status) return false;
    if (localFilters.dateFrom && r.submittedAt < localFilters.dateFrom) return false;
    return true;
  });

  const columns: ColumnDef<Review>[] = [
    {
      key: "rating", header: "Rating", width: "120px",
      render: (row) => <StarRating rating={row.rating} />
    },
    {
      key: "author", header: "Author", width: "140px",
      render: (row) => (
        <Stack gap={4}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{row.authorName}</span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {row.submittedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </Stack>
      )
    },
    {
      key: "listing", header: "Listing", width: "180px",
      render: (row) => (
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: 160 }}>
          {row.listingTitle}
        </span>
      )
    },
    {
      key: "text", header: "Review",
      render: (row) => (
        <Stack gap={4}>
          <span style={{ fontSize: "var(--text-sm)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, textOverflow: "ellipsis" }}>
            {row.text}
          </span>
          {row.response && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-accent)" }}>Responded ✓</span>}
        </Stack>
      )
    },
    {
      key: "status", header: "Status", width: "100px",
      render: (row) => <ReviewStatusBadge status={row.status} />
    },
    {
      key: "actions", header: "", width: "120px",
      render: (row) => (
        <Inline gap={8}>
          <button
            onClick={() => onRespond(row.id)}
            style={{ padding: "var(--space-4) var(--space-8)", fontSize: "var(--text-xs)", fontWeight: 500, borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-default)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", cursor: "pointer" }}
          >
            Respond
          </button>
          {row.status !== "flagged" && (
            <button
              onClick={() => setFlaggingId(row.id)}
              style={{ padding: "var(--space-4) var(--space-8)", fontSize: "var(--text-xs)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-danger)", background: "transparent", color: "var(--color-danger)", cursor: "pointer" }}
            >
              Flag
            </button>
          )}
        </Inline>
      )
    }
  ];

  const ratingButtons: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

  return (
    <>
      <Stack gap={0} style={{ height: "100%", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "var(--space-12) var(--space-16)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)" }}>
          <Inline gap={8} justify="between" align="center">
            <Inline gap={8} wrap={false}>
              {ratingButtons.map((r) => {
                const active = localFilters.rating?.includes(r) ?? false;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      const prev = localFilters.rating ?? [];
                      const next = active ? prev.filter((x) => x !== r) : [...prev, r];
                      setLocalFilters({ ...localFilters, rating: next.length ? next : undefined });
                    }}
                    style={{
                      padding: "var(--space-4) var(--space-8)", fontSize: "var(--text-xs)", fontWeight: active ? 600 : 400,
                      borderRadius: "var(--radius-pill)", border: `1px solid ${active ? "var(--color-warning)" : "var(--color-border-default)"}`,
                      background: active ? "var(--color-surface-sunken)" : "transparent", color: active ? "var(--color-warning)" : "var(--color-text-secondary)", cursor: "pointer"
                    }}
                  >
                    {"★".repeat(r)}
                  </button>
                );
              })}
              <button
                onClick={() => setLocalFilters({ ...localFilters, respondedTo: localFilters.respondedTo === false ? undefined : false })}
                style={{
                  padding: "var(--space-4) var(--space-12)", fontSize: "var(--text-xs)", fontWeight: localFilters.respondedTo === false ? 600 : 400,
                  borderRadius: "var(--radius-pill)", border: `1px solid ${localFilters.respondedTo === false ? "var(--color-accent-default)" : "var(--color-border-default)"}`,
                  background: localFilters.respondedTo === false ? "var(--color-accent-subtle)" : "transparent",
                  color: localFilters.respondedTo === false ? "var(--color-text-accent)" : "var(--color-text-secondary)", cursor: "pointer", whiteSpace: "nowrap"
                }}
              >
                Needs response
              </button>
            </Inline>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
              {visible.length} review{visible.length !== 1 ? "s" : ""}
            </span>
          </Inline>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <DataTable rows={visible} columns={columns} keyExtractor={(r) => r.id} emptyMessage="No reviews match these filters." />
        </div>
      </Stack>

      {flaggingId && (
        <FlagReasonPicker reviewId={flaggingId} onFlag={onFlag} onClose={() => setFlaggingId(null)} />
      )}
    </>
  );
}
