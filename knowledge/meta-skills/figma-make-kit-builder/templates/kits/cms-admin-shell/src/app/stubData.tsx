/**
 * stubData.tsx — Realistic preview data for Figma Make / local dev.
 * Replace with real API calls in production.
 */
import type { Field, Block, BlockRegistry, Version } from "../components/types";

export const INITIAL_FIELDS: Field[] = [
  { id: "f1", name: "title", type: "text", required: true },
  { id: "f2", name: "slug", type: "text", required: true, unique: true },
  { id: "f3", name: "body", type: "rich-text", required: false },
  { id: "f4", name: "published_at", type: "date", required: false },
  { id: "f5", name: "featured_image", type: "image", required: false },
];

export const INITIAL_BLOCKS: Block[] = [
  { id: "b1", type: "heading", content: { level: 1, text: "Welcome to the CMS Admin Shell" } },
  { id: "b2", type: "paragraph", content: { text: "This is a block-based rich text editor. Blocks are typed, reorderable, and independently validatable." } },
  { id: "b3", type: "callout", content: { emoji: "💡", text: "Double-click a block to edit its content." } },
];

export const BLOCK_REGISTRY: BlockRegistry = {
  paragraph: {
    label: "Paragraph", icon: "¶",
    defaultContent: { text: "" },
    render: (block) => (
      <p style={{ margin: 0, fontSize: "var(--text-base)", color: "var(--color-text-primary)" }}>
        {String(block.content.text ?? "")}
      </p>
    ),
  },
  heading: {
    label: "Heading", icon: "H",
    defaultContent: { level: 2, text: "New heading" },
    render: (block) => {
      const level = Number(block.content.level ?? 2);
      const sizeMap: Record<number, string> = { 1: "var(--text-3xl)", 2: "var(--text-2xl)", 3: "var(--text-xl)" };
      return (
        <div style={{ fontSize: sizeMap[level] ?? "var(--text-xl)", fontWeight: 700, color: "var(--color-text-primary)" }}>
          {String(block.content.text ?? "")}
        </div>
      );
    },
  },
  callout: {
    label: "Callout", icon: "📣",
    defaultContent: { emoji: "💡", text: "Add a callout" },
    render: (block) => (
      <div style={{ display: "flex", gap: "var(--space-12)", padding: "var(--space-16)", background: "var(--color-accent-subtle)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-subtle)" }}>
        <span style={{ fontSize: "var(--text-lg)" }}>{String(block.content.emoji ?? "💡")}</span>
        <span style={{ fontSize: "var(--text-base)", color: "var(--color-text-primary)" }}>{String(block.content.text ?? "")}</span>
      </div>
    ),
  },
  image: {
    label: "Image", icon: "🖼",
    defaultContent: { src: "", alt: "" },
    render: (block) => (
      <div style={{ padding: "var(--space-24)", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-lg)", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "var(--text-sm)" }}>
        {block.content.src ? `Image: ${String(block.content.src)}` : "No image selected"}
      </div>
    ),
  },
};

export const INITIAL_VERSIONS: Version[] = [
  { id: "v3", contentId: "article-1", blocks: INITIAL_BLOCKS, createdAt: new Date(), createdBy: "alice@example.com", isCurrent: true, label: "Added callout block" },
  { id: "v2", contentId: "article-1", blocks: INITIAL_BLOCKS.slice(0, 2), createdAt: new Date(Date.now() - 3600000), createdBy: "bob@example.com", isCurrent: false, label: "First draft" },
  { id: "v1", contentId: "article-1", blocks: INITIAL_BLOCKS.slice(0, 1), createdAt: new Date(Date.now() - 7200000), createdBy: "alice@example.com", isCurrent: false },
];
