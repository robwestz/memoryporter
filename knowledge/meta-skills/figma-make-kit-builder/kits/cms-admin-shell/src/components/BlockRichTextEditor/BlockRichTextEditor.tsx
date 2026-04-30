import { useCallback } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { Block, BlockRegistry, BlockType, Collaborator } from "../types";
import { BlockToolbar } from "./BlockToolbar";
import { BlockCard } from "./BlockCard";

function CollaboratorAvatars({ collaborators }: { collaborators: Collaborator[] }) {
  if (collaborators.length === 0) return null;
  return (
    <Inline gap={4} align="center">
      {collaborators.slice(0, 5).map((c) => (
        <div
          key={c.id}
          title={c.name}
          style={{
            width: "var(--space-24)",
            height: "var(--space-24)",
            borderRadius: "var(--radius-pill)",
            background: c.color,
            border: "2px solid var(--color-surface-base)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-inverted)",
            fontWeight: 600,
          }}
        >
          {c.name[0]?.toUpperCase()}
        </div>
      ))}
      {collaborators.length > 5 && (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
          +{collaborators.length - 5}
        </span>
      )}
    </Inline>
  );
}

export type BlockRichTextEditorProps = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  blockRegistry: BlockRegistry;
  collaborators?: Collaborator[];
  allowedBlockTypes?: string[];
  readonly?: boolean;
};

export function BlockRichTextEditor({
  blocks,
  onChange,
  blockRegistry,
  collaborators = [],
  allowedBlockTypes,
  readonly = false,
}: BlockRichTextEditorProps) {
  const allowed = allowedBlockTypes ?? Object.keys(blockRegistry);

  const insertBlock = useCallback(
    (type: BlockType) => {
      const entry = blockRegistry[type];
      if (!entry) return;
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        type,
        content: { ...entry.defaultContent },
      };
      onChange([...blocks, newBlock]);
    },
    [blocks, blockRegistry, onChange]
  );

  const moveBlock = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= blocks.length) return;
      const next = [...blocks];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      onChange(next);
    },
    [blocks, onChange]
  );

  const deleteBlock = useCallback(
    (id: string) => onChange(blocks.filter((b) => b.id !== id)),
    [blocks, onChange]
  );

  return (
    <Stack gap={0} style={{ height: "100%", minHeight: 0 }}>
      <div
        style={{
          padding: "var(--space-8) var(--space-16)",
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-surface-raised)",
        }}
      >
        <Inline justify="between" align="center">
          {!readonly && (
            <BlockToolbar allowedTypes={allowed} registry={blockRegistry} onInsert={insertBlock} />
          )}
          <CollaboratorAvatars collaborators={collaborators} />
        </Inline>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-24) var(--space-32)" }}>
        {blocks.length === 0 ? (
          <div
            style={{
              padding: "var(--space-64)",
              textAlign: "center",
              color: "var(--color-text-tertiary)",
              fontSize: "var(--text-sm)",
              border: "2px dashed var(--color-border-subtle)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            {readonly ? "No content yet." : "Start by inserting a block from the toolbar above."}
          </div>
        ) : (
          <Stack gap={4}>
            {blocks.map((block, i) => (
              <BlockCard
                key={block.id}
                block={block}
                registry={blockRegistry}
                index={i}
                total={blocks.length}
                onMove={moveBlock}
                onDelete={deleteBlock}
                readonly={readonly}
              />
            ))}
          </Stack>
        )}
      </div>
    </Stack>
  );
}
