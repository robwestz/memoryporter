/**
 * types.ts — shared domain types for cms-admin-shell
 * Used by: CollectionSchemaEditor, BlockRichTextEditor, MediaLibrary,
 *           DraftPublishBar, VersionHistoryDrawer
 */

// ---- Fields & Schema -------------------------------------------------------

export type FieldType =
  | "text"
  | "rich-text"
  | "number"
  | "boolean"
  | "date"
  | "image"
  | "reference"
  | "select"
  | "json";

export type Field = {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  unique?: boolean;
  localized?: boolean;
  validations?: ValidationRule[];
  meta?: Record<string, unknown>;
};

export type ValidationRule = {
  type: "min" | "max" | "regex" | "presence";
  value?: string | number;
  message?: string;
};

export type VersionStrategy = "breaking-bumps-major" | "all-minor";

// ---- Blocks & Rich Text ----------------------------------------------------

export type BlockType =
  | "paragraph"
  | "heading"
  | "image"
  | "embed"
  | "callout"
  | "code"
  | "divider"
  | "list";

export type Block = {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export type BlockRenderer = (block: Block) => React.ReactNode;

export type BlockRegistry = {
  [K in BlockType]?: {
    label: string;
    icon: string;
    render: BlockRenderer;
    defaultContent: Record<string, unknown>;
  };
};

export type Collaborator = {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string;
  cursor?: { blockId: string; offset: number };
};

// ---- Media -----------------------------------------------------------------

export type AssetType = "image" | "video" | "document" | "audio" | "other";

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  thumbnailUrl?: string;
  size: number; // bytes
  width?: number;
  height?: number;
  tags: string[];
  folderId: string | null;
  uploadedAt: Date;
  usageCount: number;
};

export type AssetFilters = {
  type?: AssetType;
  uploadedAfter?: Date;
  tags?: string[];
  search?: string;
};

export type BulkAction = "move" | "tag" | "delete" | "download";

// ---- Publish lifecycle -----------------------------------------------------

export type PublishState = "draft" | "review" | "scheduled" | "published";

export type Action =
  | "save"
  | "request-review"
  | "approve"
  | "schedule"
  | "publish"
  | "unpublish";

// ---- Versions --------------------------------------------------------------

export type Version = {
  id: string;
  contentId: string;
  blocks: Block[];
  createdAt: Date;
  createdBy: string;
  label?: string; // e.g. "Restored from v3"
  isCurrent: boolean;
};
