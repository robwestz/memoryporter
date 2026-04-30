// Domain types — ai-search-chat-shell
// Shared across the 5 headline components.

// ─── Source ───────────────────────────────────────────────────────────────────

export type SourceType = "web" | "doc" | "file" | "database" | "api";

export type Source = {
  id: string;
  url: string;
  title: string;
  domain: string;
  type: SourceType;
  excerpt: string;
  confidence: number; // 0–1
  retrievedAt: Date;
  favicon?: string;
  fullContent?: string; // available after source is opened
};

// ─── Answer ───────────────────────────────────────────────────────────────────

export type ToolCallStatus = "running" | "completed" | "failed";

export type ToolCall = {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: ToolCallStatus;
  durationMs?: number;
};

export type CodeBlock = {
  language: string;
  code: string;
  filename?: string;
};

export type AnswerStatus = "streaming" | "complete" | "error";

export type Answer = {
  id: string;
  threadId: string;
  text: string; // Markdown, may be partial if streaming
  status: AnswerStatus;
  sourceIds: string[]; // Ordered references
  toolCalls: ToolCall[];
  codeBlocks: CodeBlock[];
  createdAt: Date;
  completedAt?: Date;
  tokenCount?: number;
  model?: string;
  errorMessage?: string;
};

// ─── Thread ───────────────────────────────────────────────────────────────────

export type Thread = {
  id: string;
  title: string;
  lastActivity: Date;
  pinned: boolean;
  queryCount: number;
  preview: string; // First user query or auto-title
};

export type ThreadFilters = {
  pinned?: boolean;
  dateRange?: "today" | "this-week" | "older";
  search?: string;
};

// ─── Follow-up ────────────────────────────────────────────────────────────────

export type RefineMode = "more-detail" | "shorter" | "different-angle" | "simpler" | "examples";

export type Suggestion = {
  id: string;
  text: string;
};
