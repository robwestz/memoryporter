import { useState } from "react";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import type { CurriculumNode, NodeAction, PublishState } from "../types";

const KIND_ICONS: Record<CurriculumNode["kind"], string> = {
  module: "📁", lesson: "📄", resource: "📎",
};
const PUBLISH_COLOR: Record<PublishState, string> = {
  draft: "var(--color-text-tertiary)", published: "var(--color-success)",
  scheduled: "var(--color-warning)", archived: "var(--color-danger)",
};

const MENU_ITEMS = (node: CurriculumNode, canGatePerNode: boolean, onAction: (a: NodeAction) => void, close: () => void) => [
  { label: "Duplicate", fn: () => { onAction({ type: "duplicate", nodeId: node.id }); close(); } },
  { label: "Publish", fn: () => { onAction({ type: "publish", nodeId: node.id }); close(); } },
  ...(canGatePerNode ? [{ label: node.gated ? "Remove gate" : "Add gate", fn: () => { onAction({ type: "gate", nodeId: node.id, gated: !node.gated }); close(); } }] : []),
  { label: "Archive", fn: () => { onAction({ type: "archive", nodeId: node.id }); close(); } },
  { label: "Delete", fn: () => { onAction({ type: "delete", nodeId: node.id }); close(); }, danger: true },
];

export function TreeNode({ node, depth, onAction, canGatePerNode, isSelected, onSelect }: {
  node: CurriculumNode; depth: number; onAction: (a: NodeAction) => void;
  canGatePerNode: boolean; isSelected: boolean; onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Stack gap={0}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-8)", padding: `var(--space-8) var(--space-12)`, paddingLeft: `calc(var(--space-12) + ${depth * 20}px)`, background: isSelected ? "var(--color-accent-subtle)" : "transparent", borderLeft: isSelected ? `3px solid var(--color-accent-default)` : `3px solid transparent`, cursor: "pointer", position: "relative" }} onClick={() => onSelect(node.id)}>
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} style={{ fontSize: "var(--text-xs)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", padding: 0, width: 16 }}>
            {expanded ? "▾" : "▸"}
          </button>
        ) : <span style={{ width: 16, display: "inline-block" }} />}

        <span style={{ fontSize: "var(--text-sm)" }}>{KIND_ICONS[node.kind]}</span>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: node.kind === "module" ? 600 : 400, color: "var(--color-text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.title}
        </span>
        {node.durationMin && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{node.durationMin}m</span>}
        {canGatePerNode && node.gated && (
          <span style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-pill)", background: "var(--color-surface-sunken)", color: "var(--color-warning)", border: `1px solid var(--color-warning)` }}>Gated</span>
        )}
        <span style={{ fontSize: "var(--text-xs)", color: PUBLISH_COLOR[node.publishState] }}>{node.publishState}</span>

        <div style={{ position: "relative" }}>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} style={{ fontSize: "var(--text-sm)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", padding: `0 var(--space-4)` }}>⋯</button>
          {menuOpen && (
            <div style={{ position: "absolute", right: 0, top: "100%", background: "var(--color-surface-overlay)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-md)", boxShadow: "var(--elev-2)", zIndex: "var(--z-dropdown)", minWidth: 160 }}>
              {MENU_ITEMS(node, canGatePerNode, onAction, () => setMenuOpen(false)).map((item) => (
                <button key={item.label} onClick={(e) => { e.stopPropagation(); item.fn(); }}
                  style={{ display: "block", width: "100%", textAlign: "left", fontSize: "var(--text-sm)", padding: `var(--space-8) var(--space-12)`, background: "none", border: "none", cursor: "pointer", color: item.danger ? "var(--color-danger)" : "var(--color-text-primary)" }}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <Stack gap={0}>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onAction={onAction} canGatePerNode={canGatePerNode} isSelected={false} onSelect={onSelect} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
