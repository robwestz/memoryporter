import { useState } from "react";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { RosterFilterBar, RosterBulkBar } from "./StudentRosterBars";
import type { EnrolledStudent, StudentFilters, StudentAction, StudentStatus, BulkAction } from "../types";

export interface StudentRosterProps {
  courseId: string;
  students: EnrolledStudent[];
  filters?: StudentFilters;
  onStudentAction: (a: StudentAction) => void;
  bulkActions?: BulkAction[];
}

const STATUS_COLOR: Record<StudentStatus, string> = {
  active: "var(--color-success)", stuck: "var(--color-warning)",
  completed: "var(--color-info)", dropped: "var(--color-danger)",
};
const STATUS_LABEL: Record<StudentStatus, string> = {
  active: "Active", stuck: "Stuck", completed: "Completed", dropped: "Dropped",
};

function fmt(d: Date) { return d.toLocaleDateString(undefined, { dateStyle: "short" }); }
function rel(d?: Date) {
  if (!d) return "Never";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
}

const COL = "24px 1fr 120px 80px 100px 100px 96px";

export function StudentRoster({ courseId: _cid, students, filters: init = {}, onStudentAction, bulkActions = [] }: StudentRosterProps) {
  const [filters, setFilters] = useState<StudentFilters>(init);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useKeyboardShortcut({ key: "Escape" }, () => setSelected(new Set()), selected.size > 0);

  function toggle(id: string) { setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  const filtered = students.filter((s) => !filters.status || s.status === filters.status);
  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <Stack gap={0} style={{ background: "var(--color-surface-raised)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <RosterFilterBar filters={filters} onChange={setFilters} />
      <RosterBulkBar selectedIds={selected} actions={bulkActions}
        onAction={(a) => {
          if (a === "export") { onStudentAction({ type: "export" }); }
          else { selected.forEach((id) => onStudentAction({ type: a as "message" | "remind" | "remove", studentId: id })); }
          setSelected(new Set());
        }}
        onClear={() => setSelected(new Set())} />

      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: COL, gap: "var(--space-12)", padding: `var(--space-8) var(--space-16)`, background: "var(--color-surface-sunken)", borderTop: `1px solid var(--color-border-subtle)`, borderBottom: `1px solid var(--color-border-subtle)` }}>
        <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(filtered.map((s) => s.id)))} style={{ accentColor: "var(--color-accent-default)", cursor: "pointer" }} />
        {["Name", "Status", "Progress", "Enrolled", "Last active", "Actions"].map((col) => (
          <div key={col} style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col}</div>
        ))}
      </div>

      {filtered.map((student) => (
        <div key={student.id} style={{ display: "grid", gridTemplateColumns: COL, gap: "var(--space-12)", padding: `var(--space-12) var(--space-16)`, alignItems: "center", borderBottom: `1px solid var(--color-border-subtle)`, background: selected.has(student.id) ? "var(--color-accent-subtle)" : "transparent" }}>
          <input type="checkbox" checked={selected.has(student.id)} onChange={() => toggle(student.id)} style={{ accentColor: "var(--color-accent-default)", cursor: "pointer" }} />

          <Stack gap={4}>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>{student.name}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{student.email}</div>
          </Stack>

          <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: STATUS_COLOR[student.status] }}>{STATUS_LABEL[student.status]}</span>

          <div>
            <div style={{ height: 4, background: "var(--color-surface-sunken)", borderRadius: "var(--radius-pill)", overflow: "hidden", marginBottom: "var(--space-4)" }}>
              <div style={{ height: "100%", width: `${student.progressPercent}%`, background: student.progressPercent === 100 ? "var(--color-success)" : "var(--color-accent-default)", borderRadius: "var(--radius-pill)" }} />
            </div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{Math.round(student.progressPercent)}%</span>
          </div>

          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>{fmt(student.enrolledAt)}</span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>{rel(student.lastActiveAt)}</span>

          <Inline gap={4} align="center">
            <button onClick={() => onStudentAction({ type: "message", studentId: student.id })} style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-sm)", border: `1px solid var(--color-border-default)`, background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>Msg</button>
            <button onClick={() => onStudentAction({ type: "remind", studentId: student.id })} style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-sm)", border: `1px solid var(--color-border-default)`, background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>Remind</button>
          </Inline>
        </div>
      ))}

      {filtered.length === 0 && <div style={{ padding: "var(--space-48)", textAlign: "center", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>No students match the current filters.</div>}

      <div style={{ padding: `var(--space-8) var(--space-16)`, fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", borderTop: `1px solid var(--color-border-subtle)` }}>
        {filtered.length} of {students.length} students
      </div>
    </Stack>
  );
}
