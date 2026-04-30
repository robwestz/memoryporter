import { Inline } from "@/lib/layout";
import type { BlockRegistry, BlockType } from "../types";

export type BlockToolbarProps = {
  allowedTypes: string[];
  registry: BlockRegistry;
  onInsert: (type: BlockType) => void;
};

export function BlockToolbar({ allowedTypes, registry, onInsert }: BlockToolbarProps) {
  return (
    <Inline gap={4} align="center" wrap={false} style={{ overflowX: "auto" }}>
      {allowedTypes.map((type) => {
        const entry = registry[type as BlockType];
        return (
          <button
            key={type}
            onClick={() => onInsert(type as BlockType)}
            title={`Insert ${type}`}
            style={{
              padding: "var(--space-4) var(--space-12)",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-pill)",
              background: "var(--color-surface-raised)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {entry?.icon ?? "+"} {entry?.label ?? type}
          </button>
        );
      })}
    </Inline>
  );
}
