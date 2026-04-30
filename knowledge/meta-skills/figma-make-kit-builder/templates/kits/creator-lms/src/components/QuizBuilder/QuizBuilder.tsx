import { useState } from "react";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import { McqEditor, TrueFalseEditor, ShortAnswerEditor, CodeEditor } from "./QuestionEditors";
import type { Quiz, Question, QuestionType, McqQuestion, TrueFalseQuestion, ShortAnswerQuestion, CodeQuestion } from "../types";

export interface QuizBuilderProps {
  quiz: Quiz;
  questionTypes: QuestionType[];
  onChange: (q: Quiz) => void;
  onSave: (q: Quiz) => Promise<void>;
  passThreshold?: number;
}

let _id = 0;
function uid() { return `q-${++_id}-${Date.now()}`; }

function makeQuestion(type: QuestionType): Question {
  const base = { id: uid(), prompt: "", points: 10 };
  switch (type) {
    case "mcq": return { ...base, type, options: ["", ""], correctIndex: 0 };
    case "true-false": return { ...base, type, correct: true };
    case "short-answer": return { ...base, type };
    case "code": return { ...base, type, language: "javascript" };
  }
}

function QuestionCard({ question, index, onUpdate, onRemove }: { question: Question; index: number; onUpdate: (q: Question) => void; onRemove: () => void }) {
  function prompt(p: string) { onUpdate({ ...question, prompt: p } as Question); }
  function pts(n: number) { onUpdate({ ...question, points: n } as Question); }

  return (
    <Stack gap={12} style={{ background: "var(--color-surface-raised)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-lg)", padding: "var(--space-16)" }}>
      <Inline gap={8} align="center" justify="between">
        <span style={{ fontSize: "var(--text-xs)", background: "var(--color-surface-sunken)", color: "var(--color-text-secondary)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-pill)" }}>
          Q{index + 1} · {question.type}
        </span>
        <Inline gap={8} align="center">
          <label style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Points:</label>
          <input type="number" min={1} max={100} value={question.points} onChange={(e) => pts(Number(e.target.value))}
            style={{ width: 56, fontSize: "var(--text-sm)", padding: `var(--space-4) var(--space-8)`, border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-sm)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", textAlign: "center" }} />
          <button onClick={onRemove} style={{ fontSize: "var(--text-xs)", background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)" }}>Remove</button>
        </Inline>
      </Inline>

      <textarea value={question.prompt} onChange={(e) => prompt(e.target.value)} placeholder="Enter question prompt…" rows={2}
        style={{ fontSize: "var(--text-sm)", padding: "var(--space-8)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-sm)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", resize: "vertical", fontFamily: "var(--font-sans)" }} />

      {question.type === "mcq" && <McqEditor q={question as McqQuestion} onChange={(u) => onUpdate(u)} />}
      {question.type === "true-false" && <TrueFalseEditor q={question as TrueFalseQuestion} onChange={(u) => onUpdate(u)} />}
      {question.type === "short-answer" && <ShortAnswerEditor q={question as ShortAnswerQuestion} onChange={(u) => onUpdate(u)} />}
      {question.type === "code" && <CodeEditor q={question as CodeQuestion} onChange={(u) => onUpdate(u)} />}
    </Stack>
  );
}

export function QuizBuilder({ quiz, questionTypes, onChange, onSave, passThreshold = 0.7 }: QuizBuilderProps) {
  const [saving, setSaving] = useState(false);

  function add(type: QuestionType) { onChange({ ...quiz, questions: [...quiz.questions, makeQuestion(type)] }); }
  function update(idx: number, q: Question) { const qs = [...quiz.questions]; qs[idx] = q; onChange({ ...quiz, questions: qs }); }
  function remove(idx: number) { onChange({ ...quiz, questions: quiz.questions.filter((_, i) => i !== idx) }); }

  async function save() { setSaving(true); try { await onSave(quiz); } finally { setSaving(false); } }

  const total = quiz.questions.reduce((s, q) => s + q.points, 0);

  return (
    <Stack gap={16}>
      <Inline gap={16} align="center" justify="between">
        <Stack gap={4}>
          <input value={quiz.title} onChange={(e) => onChange({ ...quiz, title: e.target.value })} placeholder="Quiz title…"
            style={{ fontSize: "var(--text-xl)", fontWeight: 600, border: "none", borderBottom: `2px solid var(--color-border-default)`, background: "transparent", color: "var(--color-text-primary)", padding: `0 0 var(--space-4) 0`, outline: "none" }} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""} · {total} pts · Pass at {Math.round(passThreshold * 100)}%
          </span>
        </Stack>
        <button onClick={save} disabled={saving}
          style={{ fontSize: "var(--text-sm)", fontWeight: 600, padding: `var(--space-8) var(--space-24)`, borderRadius: "var(--radius-md)", border: "none", background: saving ? "var(--color-surface-sunken)" : "var(--color-accent-default)", color: saving ? "var(--color-text-tertiary)" : "var(--color-text-inverted)", cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Saving…" : "Save quiz"}
        </button>
      </Inline>

      <Stack gap={12}>
        {quiz.questions.map((q, idx) => (
          <QuestionCard key={q.id} question={q} index={idx} onUpdate={(u) => update(idx, u)} onRemove={() => remove(idx)} />
        ))}
        {quiz.questions.length === 0 && (
          <div style={{ padding: "var(--space-32)", textAlign: "center", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", border: `1px dashed var(--color-border-default)`, borderRadius: "var(--radius-lg)" }}>
            No questions yet. Add one below.
          </div>
        )}
      </Stack>

      <Inline gap={8} align="center">
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Add question:</span>
        {questionTypes.map((type) => (
          <button key={type} onClick={() => add(type)}
            style={{ fontSize: "var(--text-xs)", fontWeight: 500, padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-sm)", border: `1px solid var(--color-border-default)`, background: "var(--color-surface-raised)", color: "var(--color-text-secondary)", cursor: "pointer" }}>
            + {type}
          </button>
        ))}
      </Inline>
    </Stack>
  );
}
