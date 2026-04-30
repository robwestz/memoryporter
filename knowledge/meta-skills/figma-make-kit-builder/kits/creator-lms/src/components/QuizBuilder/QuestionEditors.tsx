import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import type { McqQuestion, TrueFalseQuestion, ShortAnswerQuestion, CodeQuestion } from "../types";

export function McqEditor({ q, onChange }: { q: McqQuestion; onChange: (u: McqQuestion) => void }) {
  function setOption(idx: number, value: string) {
    const options = [...q.options]; options[idx] = value; onChange({ ...q, options });
  }
  function addOption() { onChange({ ...q, options: [...q.options, ""] }); }
  function removeOption(idx: number) {
    const options = q.options.filter((_, i) => i !== idx);
    const correctIndex = Math.max(0, q.correctIndex >= options.length ? options.length - 1 : q.correctIndex);
    onChange({ ...q, options, correctIndex });
  }
  return (
    <Stack gap={8}>
      <Stack gap={4}>
        {q.options.map((opt, idx) => (
          <Inline key={idx} gap={8} align="center">
            <input type="radio" name={`c-${q.id}`} checked={q.correctIndex === idx} onChange={() => onChange({ ...q, correctIndex: idx })} style={{ accentColor: "var(--color-accent-default)" }} />
            <input value={opt} onChange={(e) => setOption(idx, e.target.value)} placeholder={`Option ${idx + 1}`}
              style={{ flex: 1, fontSize: "var(--text-sm)", padding: `var(--space-4) var(--space-8)`, border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-sm)", background: "var(--color-surface-base)", color: "var(--color-text-primary)" }} />
            {q.options.length > 2 && <button onClick={() => removeOption(idx)} style={{ fontSize: "var(--text-xs)", background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)" }}>✕</button>}
          </Inline>
        ))}
      </Stack>
      <button onClick={addOption} disabled={q.options.length >= 6}
        style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, border: `1px dashed var(--color-border-default)`, borderRadius: "var(--radius-sm)", background: "transparent", cursor: q.options.length >= 6 ? "not-allowed" : "pointer", color: "var(--color-text-secondary)" }}>
        + Add option
      </button>
    </Stack>
  );
}

export function TrueFalseEditor({ q, onChange }: { q: TrueFalseQuestion; onChange: (u: TrueFalseQuestion) => void }) {
  return (
    <Inline gap={16} align="center">
      {([true, false] as const).map((val) => (
        <label key={String(val)} style={{ display: "flex", gap: "var(--space-8)", alignItems: "center", cursor: "pointer" }}>
          <input type="radio" checked={q.correct === val} onChange={() => onChange({ ...q, correct: val })} style={{ accentColor: "var(--color-accent-default)" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>{val ? "True" : "False"}</span>
        </label>
      ))}
    </Inline>
  );
}

export function ShortAnswerEditor({ q, onChange }: { q: ShortAnswerQuestion; onChange: (u: ShortAnswerQuestion) => void }) {
  return (
    <Stack gap={4}>
      <label style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Sample answer (shown after submission)</label>
      <textarea value={q.sampleAnswer ?? ""} onChange={(e) => onChange({ ...q, sampleAnswer: e.target.value })} rows={3}
        style={{ fontSize: "var(--text-sm)", padding: "var(--space-8)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-sm)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", resize: "vertical", fontFamily: "var(--font-sans)" }} />
    </Stack>
  );
}

export function CodeEditor({ q, onChange }: { q: CodeQuestion; onChange: (u: CodeQuestion) => void }) {
  const langs = ["javascript", "typescript", "python", "rust", "go"];
  return (
    <Stack gap={8}>
      <Inline gap={8} align="center">
        <label style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Language:</label>
        <select value={q.language} onChange={(e) => onChange({ ...q, language: e.target.value })}
          style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-sm)", background: "var(--color-surface-base)", color: "var(--color-text-primary)" }}>
          {langs.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </Inline>
      <Stack gap={4}>
        <label style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Starter code</label>
        <textarea value={q.starterCode ?? ""} onChange={(e) => onChange({ ...q, starterCode: e.target.value })} rows={5}
          style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", padding: "var(--space-8)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-sm)", background: "var(--color-surface-sunken)", color: "var(--color-text-primary)", resize: "vertical" }} />
      </Stack>
    </Stack>
  );
}
