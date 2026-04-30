import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import type { Course, UserProgress, CurriculumNode } from "../types";

export interface ProgressTrackerProps {
  course: Course;
  userProgress: UserProgress;
  onLessonJump: (lessonId: string) => void;
  showCertificateOn?: "completion" | "threshold" | "never";
}

function collectLessons(nodes: CurriculumNode[]): CurriculumNode[] {
  return nodes.flatMap((n) => n.kind === "lesson" ? [n] : collectLessons(n.children ?? []));
}

function lessonStatus(id: string, up: UserProgress) {
  for (const m of up.modules) { const s = m.lessonStatuses[id]; if (s) return s; }
  return "available" as const;
}

const DOT: Record<string, string> = {
  locked: "var(--color-border-default)", available: "var(--color-border-strong)",
  "in-progress": "var(--color-info)", completed: "var(--color-success)",
};

function ModuleSection({ module, userProgress, currentLessonId, onLessonJump }: {
  module: CurriculumNode; userProgress: UserProgress;
  currentLessonId: string | null; onLessonJump: (id: string) => void;
}) {
  const modProg = userProgress.modules.find((m) => m.moduleId === module.id);
  const pct = modProg && modProg.totalCount > 0 ? Math.round((modProg.completedCount / modProg.totalCount) * 100) : 0;
  const lessons = collectLessons(module.children ?? []);

  return (
    <Stack gap={8}>
      <Inline gap={8} align="center" justify="between">
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-primary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{module.title}</span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{pct}%</span>
      </Inline>
      <div style={{ height: 4, background: "var(--color-surface-sunken)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--color-success)" : "var(--color-accent-default)", borderRadius: "var(--radius-pill)", transition: `width var(--motion-base)` }} />
      </div>
      <Stack gap={4}>
        {lessons.map((lesson) => {
          const status = lessonStatus(lesson.id, userProgress);
          const isCurrent = lesson.id === currentLessonId;
          const isLocked = status === "locked";
          return (
            <button key={lesson.id} onClick={() => !isLocked && onLessonJump(lesson.id)} disabled={isLocked}
              style={{ display: "flex", alignItems: "center", gap: "var(--space-8)", padding: `var(--space-8) var(--space-8)`, borderRadius: "var(--radius-sm)", background: isCurrent ? "var(--color-accent-subtle)" : "transparent", border: "none", cursor: isLocked ? "not-allowed" : "pointer", textAlign: "left", opacity: isLocked ? 0.5 : 1 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: DOT[status], flexShrink: 0, border: isCurrent ? `2px solid var(--color-accent-default)` : "none" }} />
              <span style={{ fontSize: "var(--text-xs)", color: isCurrent ? "var(--color-text-accent)" : "var(--color-text-secondary)", fontWeight: isCurrent ? 500 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {lesson.title}
              </span>
              {lesson.durationMin && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", flexShrink: 0 }}>{lesson.durationMin}m</span>}
            </button>
          );
        })}
      </Stack>
    </Stack>
  );
}

export function ProgressTracker({ course, userProgress, onLessonJump, showCertificateOn = "completion" }: ProgressTrackerProps) {
  const pct = Math.round(userProgress.overallPercent);
  const showCert = (showCertificateOn === "completion" && userProgress.certificateEarned) || (showCertificateOn === "threshold" && pct >= 80);

  return (
    <Stack gap={16} style={{ background: "var(--color-surface-raised)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-lg)", padding: "var(--space-16)", height: "100%", overflowY: "auto" }}>
      <Stack gap={8}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>{course.title}</div>
        <Inline gap={8} align="center">
          <div style={{ flex: 1, height: 6, background: "var(--color-surface-sunken)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--color-success)" : "var(--color-accent-default)", borderRadius: "var(--radius-pill)", transition: `width var(--motion-slow)` }} />
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", flexShrink: 0 }}>{pct}%</span>
        </Inline>
      </Stack>

      {showCert && (
        <div style={{ padding: "var(--space-12)", borderRadius: "var(--radius-md)", background: "var(--color-success)", color: "var(--color-text-inverted)", fontSize: "var(--text-sm)", fontWeight: 600, textAlign: "center" }}>
          Certificate earned
        </div>
      )}

      <Stack gap={16}>
        {course.modules.map((mod) => (
          <ModuleSection key={mod.id} module={mod} userProgress={userProgress} currentLessonId={userProgress.currentLessonId} onLessonJump={onLessonJump} />
        ))}
      </Stack>
    </Stack>
  );
}
