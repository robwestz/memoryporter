import { useState } from "react";
import { Inline } from "@/lib/layout";
import type { Block, BlockRegistry } from "../types";

const microBtnStyle: React.CSSProperties = {
  padding: "var(--space-4) var(--space-8)",
  fontSize: "var(--text-xs)",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-surface-overlay)",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
  boxShadow: "var(--elev-2)",
};

export type BlockCardProps = {
  block: Block;
  registry: BlockRegistry;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onDelete: (id: string) => void;
  readonly: boolean;
};

export function BlockCard({ block, registry, index, total, onMove, onDelete, readonly }: BlockCardProps) {
  const [hovered, setHovered] = useState(false);
  const entry = registry[block.type];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${hovered && !readonly ? "var(--color-border-default)" : "transparent"}`,
        padding: "var(--space-12) var(--space-16)",
        background: hovered && !readonly ? "var(--color-surface-raised)" : "transparent",
        transition: `border-color var(--motion-fast), background var(--motion-fast)`,
      }}
    >
      <div
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-tertiary)",
          fontWeight: 500,
          marginBottom: "var(--space-8)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {entry?.label ?? block.type}
      </div>

      <div style={{ color: "var(--color-text-primary)", fontSize: "var(--text-base)" }}>
        {entry?.render(block) ?? (
          <pre
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              background: "var(--color-surface-sunken)",
              padding: "var(--space-8)",
              borderRadius: "var(--radius-sm)",
              overflow: "auto",
            }}
          >
            {JSON.stringify(block.content, null, 2)}
          </pre>
        )}
      </div>

      {hovered && !readonly && (
        <div style={{ position: "absolute", top: "var(--space-8)", right: "var(--space-8)" }}>
          <Inline gap={4}>
            <button onClick={() => onMove(index, index - 1)} disabled={index === 0} style={microBtnStyle} aria-label="Move block up">↑</button>
            <button onClick={() => onMove(index, index + 1)} disabled={index === total - 1} style={microBtnStyle} aria-label="Move block down">↓</button>
            <button onClick={() => onDelete(block.id)} style={{ ...microBtnStyle, color: "var(--color-danger)" }} aria-label="Delete block">✕</button>
          </Inline>
        </div>
      )}
    </div>
  );
}
