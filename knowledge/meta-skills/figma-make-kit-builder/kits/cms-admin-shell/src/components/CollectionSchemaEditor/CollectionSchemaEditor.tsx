import { Stack, Inline } from "@/lib/layout";
import type { Field, VersionStrategy } from "../types";
import { FieldRow } from "./FieldRow";
import { AddFieldBar } from "./AddFieldBar";

export type CollectionSchemaEditorProps = {
  collectionId: string;
  fields: Field[];
  onFieldAdd: (f: Field) => void;
  onFieldReorder: (from: number, to: number) => void;
  versionStrategy: VersionStrategy;
  readonly?: boolean;
};

export function CollectionSchemaEditor({
  collectionId,
  fields,
  onFieldAdd,
  onFieldReorder,
  versionStrategy,
  readonly = false,
}: CollectionSchemaEditorProps) {
  return (
    <Stack gap={0} style={{ height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "var(--space-16) var(--space-24)",
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-surface-raised)",
        }}
      >
        <Inline justify="between" align="center">
          <div>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {collectionId}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-4)" }}>
              {fields.length} fields &middot; version strategy:{" "}
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--color-surface-sunken)",
                  padding: "0 var(--space-4)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {versionStrategy}
              </code>
            </div>
          </div>
          {readonly && (
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                padding: "var(--space-4) var(--space-8)",
                borderRadius: "var(--radius-pill)",
                background: "var(--color-surface-sunken)",
                color: "var(--color-text-secondary)",
              }}
            >
              VIEW ONLY
            </span>
          )}
        </Inline>
      </div>

      {/* Field list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-16) var(--space-24)" }}>
        <Stack gap={8}>
          {fields.length === 0 ? (
            <div
              style={{
                padding: "var(--space-48)",
                textAlign: "center",
                color: "var(--color-text-tertiary)",
                fontSize: "var(--text-sm)",
                border: "2px dashed var(--color-border-subtle)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              No fields yet. Add a field below to define the schema.
            </div>
          ) : (
            fields.map((field, i) => (
              <FieldRow
                key={field.id}
                field={field}
                index={i}
                total={fields.length}
                onReorder={onFieldReorder}
                readonly={readonly}
              />
            ))
          )}
        </Stack>
      </div>

      {/* Add field bar */}
      {!readonly && (
        <div
          style={{
            padding: "var(--space-16) var(--space-24)",
            borderTop: "1px solid var(--color-border-subtle)",
            background: "var(--color-surface-base)",
          }}
        >
          <AddFieldBar onAdd={onFieldAdd} />
        </div>
      )}
    </Stack>
  );
}
