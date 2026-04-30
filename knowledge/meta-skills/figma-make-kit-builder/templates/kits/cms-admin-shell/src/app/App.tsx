import "./styles/tailwind.css";
import "./styles/index.css";
import "./styles/fonts.css";
import { useState } from "react";
import { Split, Stack, Inline } from "@/lib/layout";
import { CollectionSchemaEditor } from "../components/CollectionSchemaEditor";
import { BlockRichTextEditor } from "../components/BlockRichTextEditor";
import { MediaLibrary } from "../components/MediaLibrary";
import { DraftPublishBar } from "../components/DraftPublishBar";
import { VersionHistoryDrawer } from "../components/VersionHistoryDrawer";
import type { Field, Block, PublishState, Action, Asset } from "../components/types";
import { INITIAL_FIELDS, INITIAL_BLOCKS, BLOCK_REGISTRY, INITIAL_VERSIONS } from "./stubData";

type Tab = "schema" | "editor" | "media";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "schema", label: "Schema" },
  { id: "editor", label: "Content" },
  { id: "media", label: "Media" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const [fields, setFields] = useState<Field[]>(INITIAL_FIELDS);
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [publishState, setPublishState] = useState<PublishState>("draft");
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [versions] = useState(INITIAL_VERSIONS);

  const handleAction = (action: Action) => {
    if (action === "save") setLastSaved(new Date());
    else if (action === "request-review") setPublishState("review");
    else if (action === "approve" || action === "publish") setPublishState("published");
    else if (action === "schedule") setPublishState("scheduled");
    else if (action === "unpublish") setPublishState("draft");
    setLastSaved(new Date());
  };

  const nextAction: Action =
    publishState === "draft" ? "request-review"
    : publishState === "review" ? "approve"
    : publishState === "scheduled" ? "publish"
    : "unpublish";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--color-surface-base)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>
      {/* Top bar */}
      <div style={{ padding: "0 var(--space-24)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)", display: "flex", alignItems: "center", gap: "var(--space-24)", flexShrink: 0 }}>
        <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)", padding: "var(--space-16) 0" }}>
          CMS Admin
        </div>
        <Inline gap={0} align="center" style={{ flex: 1 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ padding: "var(--space-16) var(--space-24)", fontSize: "var(--text-sm)", fontWeight: 500, border: "none", borderBottom: `2px solid ${activeTab === tab.id ? "var(--color-accent-default)" : "transparent"}`, background: "transparent", color: activeTab === tab.id ? "var(--color-text-accent)" : "var(--color-text-secondary)", cursor: "pointer" }}
            >
              {tab.label}
            </button>
          ))}
        </Inline>
        <button
          onClick={() => setShowHistory((v) => !v)}
          style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", fontWeight: 500, border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", background: showHistory ? "var(--color-accent-subtle)" : "var(--color-surface-base)", color: showHistory ? "var(--color-text-accent)" : "var(--color-text-secondary)", cursor: "pointer" }}
        >
          History
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            {activeTab === "schema" && (
              <CollectionSchemaEditor
                collectionId="articles"
                fields={fields}
                onFieldAdd={(f) => setFields((prev) => [...prev, f])}
                onFieldReorder={(from, to) => {
                  setFields((prev) => { const next = [...prev]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; });
                }}
                versionStrategy="breaking-bumps-major"
              />
            )}
            {activeTab === "editor" && (
              <BlockRichTextEditor
                blocks={blocks}
                onChange={setBlocks}
                blockRegistry={BLOCK_REGISTRY}
                collaborators={[
                  { id: "c1", name: "Alice", color: "var(--color-accent-default)" },
                  { id: "c2", name: "Bob", color: "var(--color-success)" },
                ]}
                allowedBlockTypes={["paragraph", "heading", "callout", "image"]}
              />
            )}
            {activeTab === "media" && (
              <MediaLibrary folderId={null} onSelect={(asset: Asset) => void asset} view="grid" filters={{}} bulkActions={["move", "tag", "delete"]} />
            )}
          </div>
          <DraftPublishBar state={publishState} lastSavedAt={lastSaved} nextAction={nextAction} onAction={handleAction} scheduleEnabled />
        </div>

        {showHistory && (
          <VersionHistoryDrawer
            contentId="article-1"
            versions={versions}
            onRestore={(id) => { void id; setShowHistory(false); }}
            renderDiff={(a, b) => (
              <Stack gap={16}>
                <div style={{ padding: "var(--space-12)", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-lg)", fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
                  Comparing v{a.id} → v{b.id}<br />
                  {a.blocks.length} blocks → {b.blocks.length} blocks
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                  Full diff renderer would show block-level changes here.
                </div>
              </Stack>
            )}
          />
        )}
      </div>
    </div>
  );
}
