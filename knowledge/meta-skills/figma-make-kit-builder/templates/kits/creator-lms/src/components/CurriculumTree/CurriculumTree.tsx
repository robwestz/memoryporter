import { useState } from "react";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { TreeNode } from "./TreeNode";
import type { CurriculumNode, NodeAction, ReorderOp } from "../types";

export interface CurriculumTreeProps {
  courseId: string;
  tree: CurriculumNode[];
  onReorder: (moves: ReorderOp[]) => void;
  onNodeAction: (a: NodeAction) => void;
  canGatePerNode?: boolean;
}

export function CurriculumTree({ courseId: _courseId, tree, onReorder: _onReorder, onNodeAction, canGatePerNode = false }: CurriculumTreeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useKeyboardShortcut({ key: "Escape" }, () => setSelectedId(null), selectedId !== null);

  return (
    <div style={{ background: "var(--color-surface-raised)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <Inline gap={8} align="center" justify="between" style={{ padding: `var(--space-12) var(--space-16)`, borderBottom: `1px solid var(--color-border-subtle)`, background: "var(--color-surface-sunken)" }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>Curriculum</span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{tree.length} module{tree.length !== 1 ? "s" : ""}</span>
      </Inline>

      <Stack gap={0}>
        {tree.map((node) => (
          <TreeNode key={node.id} node={node} depth={0} onAction={onNodeAction} canGatePerNode={canGatePerNode} isSelected={node.id === selectedId} onSelect={setSelectedId} />
        ))}
        {tree.length === 0 && (
          <div style={{ padding: "var(--space-48)", textAlign: "center", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
            No modules yet. Add your first module to get started.
          </div>
        )}
      </Stack>
    </div>
  );
}
