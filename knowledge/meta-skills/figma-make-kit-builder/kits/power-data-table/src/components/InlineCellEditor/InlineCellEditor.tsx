import { useRef, useEffect, useState } from "react";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import type { FieldSpec } from "../types";

type InlineCellEditorProps = {
  value: unknown;
  field: FieldSpec;
  onCommit: (v: unknown) => void;
  onCancel: () => void;
  validateOnChange?: boolean;
};

export function InlineCellEditor({
  value,
  field,
  onCommit,
  onCancel,
  validateOnChange = false,
}: InlineCellEditorProps) {
  const [draft, setDraft] = useState<string>(formatInitial(value, field));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (inputRef.current instanceof HTMLInputElement) {
      inputRef.current.select();
    }
  }, []);

  useKeyboardShortcut({ key: "Escape" }, () => onCancel());
  useKeyboardShortcut({ key: "Enter" }, () => handleCommit());

  function validate(raw: string): string | null {
    if (field.type === "number" || field.type === "currency") {
      const n = Number(raw);
      if (isNaN(n)) return "Must be a number";
      if (field.min !== undefined && n < field.min)
        return `Minimum ${field.min}`;
      if (field.max !== undefined && n > field.max)
        return `Maximum ${field.max}`;
    }
    if (field.type === "text" && field.maxLength && raw.length > field.maxLength) {
      return `Max ${field.maxLength} characters`;
    }
    return null;
  }

  function handleChange(raw: string) {
    setDraft(raw);
    if (validateOnChange) {
      setError(validate(raw));
    }
  }

  function handleCommit() {
    const err = validate(draft);
    if (err) {
      setError(err);
      return;
    }
    onCommit(coerce(draft, field));
  }

  function handleBlur() {
    handleCommit();
  }

  const baseInputStyle: React.CSSProperties = {
    fontSize: "var(--text-sm)",
    color: "var(--color-text-primary)",
    background: "var(--color-surface-base)",
    border: `1px solid ${error ? "var(--color-danger)" : "var(--color-accent-default)"}`,
    borderRadius: "var(--radius-sm)",
    padding: "var(--space-4) var(--space-8)",
    outline: "none",
    width: "100%",
    fontFamily: "var(--font-sans)",
    boxShadow: "var(--elev-1)",
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {field.type === "select" ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          style={baseInputStyle}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={inputType(field)}
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          style={baseInputStyle}
          aria-invalid={error !== null}
          aria-describedby={error ? "cell-error" : undefined}
        />
      )}
      {error && (
        <div
          id="cell-error"
          role="alert"
          style={{
            position: "absolute",
            top: "calc(100% + var(--space-4))",
            left: 0,
            fontSize: "var(--text-xs)",
            color: "var(--color-danger)",
            background: "var(--color-surface-overlay)",
            border: "1px solid var(--color-danger)",
            borderRadius: "var(--radius-sm)",
            padding: "var(--space-4) var(--space-8)",
            boxShadow: "var(--elev-2)",
            zIndex: "var(--z-dropdown)",
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// --- Helpers ---

function formatInitial(value: unknown, field: FieldSpec): string {
  if (value === null || value === undefined) return "";
  if (field.type === "currency" && typeof value === "number") {
    return String(value);
  }
  return String(value);
}

function inputType(field: FieldSpec): string {
  switch (field.type) {
    case "number":
    case "currency":
      return "number";
    case "date":
      return "date";
    default:
      return "text";
  }
}

function coerce(raw: string, field: FieldSpec): unknown {
  switch (field.type) {
    case "number":
    case "currency":
      return Number(raw);
    default:
      return raw;
  }
}
