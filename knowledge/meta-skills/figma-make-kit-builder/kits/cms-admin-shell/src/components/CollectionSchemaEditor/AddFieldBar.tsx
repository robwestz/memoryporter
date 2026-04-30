import { useState } from "react";
import { Inline } from "@/lib/layout";
import type { Field, FieldType } from "../types";

const FIELD_TYPES: FieldType[] = [
  "text", "rich-text", "number", "boolean",
  "date", "image", "reference", "select", "json",
];

export type AddFieldBarProps = { onAdd: (f: Field) => void };

export function AddFieldBar({ onAdd }: AddFieldBarProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<FieldType>("text");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ id: `field-${Date.now()}`, name: name.trim(), type, required: false } as Field);
    setName("");
  };

  return (
    <Inline gap={8} align="center" wrap={false}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="field_name"
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        style={{
          flex: 1,
          padding: "var(--space-8) var(--space-12)",
          fontSize: "var(--text-sm)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface-base)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-mono)",
          minWidth: 0,
        }}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as FieldType)}
        style={{
          padding: "var(--space-8) var(--space-12)",
          fontSize: "var(--text-sm)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface-base)",
          color: "var(--color-text-primary)",
        }}
      >
        {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <button
        onClick={handleAdd}
        style={{
          padding: "var(--space-8) var(--space-16)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          background: "var(--color-accent-default)",
          color: "var(--color-text-inverted)",
          border: "none",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        + Add field
      </button>
    </Inline>
  );
}
