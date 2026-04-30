import { useState } from "react";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import { Split } from "@/lib/layout/Split";

import { CurriculumTree } from "../components/CurriculumTree";
import { LessonPlayer } from "../components/LessonPlayer";
import { QuizBuilder } from "../components/QuizBuilder";
import { ProgressTracker } from "../components/ProgressTracker";
import { StudentRoster } from "../components/StudentRoster";
import { lmsStore } from "../lib/lmsStore";

import type {
  CurriculumNode,
  NodeAction,
  ReorderOp,
  Course,
  Lesson,
  Block,
  ProgressState,
  UserProgress,
  Quiz,
  QuestionType,
  EnrolledStudent,
  StudentAction,
} from "../components/types";

// ── Stub data ─────────────────────────────────────────────────────────────────

const STUB_TREE: CurriculumNode[] = [
  {
    id: "mod-1",
    kind: "module",
    title: "Getting Started",
    publishState: "published",
    gated: false,
    durationMin: 25,
    children: [
      { id: "les-1", kind: "lesson", title: "Welcome & overview", publishState: "published", gated: false, durationMin: 5 },
      { id: "les-2", kind: "lesson", title: "Setting up your environment", publishState: "published", gated: false, durationMin: 12 },
      { id: "les-3", kind: "lesson", title: "Your first project", publishState: "draft", gated: false, durationMin: 8 },
    ],
  },
  {
    id: "mod-2",
    kind: "module",
    title: "Core Concepts",
    publishState: "published",
    gated: true,
    durationMin: 60,
    children: [
      { id: "les-4", kind: "lesson", title: "Understanding the fundamentals", publishState: "published", gated: true, durationMin: 20 },
      { id: "les-5", kind: "lesson", title: "Advanced patterns", publishState: "published", gated: true, durationMin: 30 },
      { id: "quiz-1", kind: "resource", title: "Module quiz", publishState: "published", gated: true },
    ],
  },
];

const STUB_COURSE: Course = {
  id: "course-1",
  title: "Build Better Software",
  description: "A practical course for modern developers.",
  modules: STUB_TREE,
};

const STUB_LESSON: Lesson = {
  id: "les-1",
  title: "Welcome & overview",
  durationMin: 5,
  blocks: [
    {
      type: "video",
      id: "blk-1",
      src: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      poster: undefined,
    },
    {
      type: "text",
      id: "blk-2",
      markdown: "## Welcome!\n\nIn this lesson you'll get a bird's-eye view of what we're building together throughout this course.",
    },
  ],
};

const STUB_PROGRESS: ProgressState = {
  lessonId: "les-1",
  completedBlocks: [],
  completed: false,
};

const STUB_USER_PROGRESS: UserProgress = {
  courseId: "course-1",
  currentLessonId: "les-1",
  modules: [
    {
      moduleId: "mod-1",
      lessonStatuses: {
        "les-1": "in-progress",
        "les-2": "available",
        "les-3": "available",
      },
      completedCount: 0,
      totalCount: 3,
    },
    {
      moduleId: "mod-2",
      lessonStatuses: {
        "les-4": "locked",
        "les-5": "locked",
        "quiz-1": "locked",
      },
      completedCount: 0,
      totalCount: 3,
    },
  ],
  overallPercent: 0,
  certificateEarned: false,
};

const STUB_QUIZ: Quiz = {
  id: "quiz-draft-1",
  title: "Module 1 Quiz",
  passThreshold: 0.7,
  questions: [
    {
      type: "mcq",
      id: "q-stub-1",
      prompt: "What is the primary goal of this course?",
      options: ["Build better software", "Learn CSS", "Manage a team", "Write faster code"],
      correctIndex: 0,
      points: 10,
    },
  ],
};

const STUB_STUDENTS: EnrolledStudent[] = [
  { id: "s1", name: "Alice Martin", email: "alice@example.com", enrolledAt: new Date(Date.now() - 86400000 * 30), lastActiveAt: new Date(Date.now() - 3600000 * 2), progressPercent: 45, status: "active" },
  { id: "s2", name: "Bob Chen", email: "bob@example.com", enrolledAt: new Date(Date.now() - 86400000 * 20), lastActiveAt: new Date(Date.now() - 86400000 * 12), progressPercent: 20, status: "stuck" },
  { id: "s3", name: "Clara Svensson", email: "clara@example.com", enrolledAt: new Date(Date.now() - 86400000 * 60), lastActiveAt: new Date(Date.now() - 86400000 * 1), progressPercent: 100, status: "completed" },
];

const QUESTION_TYPES: QuestionType[] = ["mcq", "true-false", "short-answer", "code"];

// ── View type ─────────────────────────────────────────────────────────────────

type ViewMode = "creator" | "learner";
type CreatorTab = "curriculum" | "quiz" | "roster";

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderBlock(block: Block) {
  if (block.type === "text") {
    // Minimal markdown rendering without library — just pre-format for demo
    return (
      <div
        style={{
          fontSize: "var(--text-base)",
          lineHeight: "var(--lh-base)",
          color: "var(--color-text-primary)",
          whiteSpace: "pre-wrap",
        }}
      >
        {block.markdown}
      </div>
    );
  }
  if (block.type === "embed") {
    return (
      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
        Embed: {block.url}
      </div>
    );
  }
  if (block.type === "file") {
    return (
      <a
        href={block.url}
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-accent)",
          textDecoration: "underline",
        }}
      >
        {block.name}
      </a>
    );
  }
  return (
    <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
      Unsupported block type: {block.type}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("learner");
  const [creatorTab, setCreatorTab] = useState<CreatorTab>("curriculum");
  const [progress, setProgress] = useState<ProgressState>(STUB_PROGRESS);
  const [quiz, setQuiz] = useState<Quiz>(STUB_QUIZ);

  const activeView = lmsStore.use((s) => s.activeView);

  function handleNodeAction(action: NodeAction) {
    console.log("Node action:", action);
  }

  function handleReorder(moves: ReorderOp[]) {
    console.log("Reorder:", moves);
  }

  function handleStudentAction(action: StudentAction) {
    console.log("Student action:", action);
  }

  function handleLessonJump(lessonId: string) {
    lmsStore.setState({ currentLessonId: lessonId });
  }

  function handleProgress(p: ProgressState) {
    setProgress(p);
  }

  function handleComplete() {
    setProgress((prev) => ({ ...prev, completed: true }));
    console.log("Lesson complete");
  }

  async function handleSaveQuiz(q: Quiz) {
    console.log("Saving quiz:", q);
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-surface-base)",
      }}
    >
      {/* Top bar */}
      <Inline
        gap={16}
        align="center"
        justify="between"
        style={{
          padding: `var(--space-12) var(--space-24)`,
          borderBottom: `1px solid var(--color-border-subtle)`,
          background: "var(--color-surface-raised)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <Inline gap={8} align="center">
          <span style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Creator LMS
          </span>
          <span
            style={{
              fontSize: "var(--text-xs)",
              background: "var(--color-surface-sunken)",
              color: "var(--color-text-secondary)",
              padding: `var(--space-4) var(--space-8)`,
              borderRadius: "var(--radius-pill)",
            }}
          >
            {STUB_COURSE.title}
          </span>
        </Inline>

        {/* View toggle */}
        <Inline gap={4} align="center">
          {(["learner", "creator"] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: viewMode === m ? 600 : 400,
                padding: `var(--space-4) var(--space-12)`,
                borderRadius: "var(--radius-md)",
                border: "none",
                background: viewMode === m ? "var(--color-accent-subtle)" : "transparent",
                color: viewMode === m ? "var(--color-text-accent)" : "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              {m === "learner" ? "Learner view" : "Creator view"}
            </button>
          ))}
        </Inline>

        {/* Monetization: content gating signal (pattern #7) */}
        <Inline gap={8} align="center">
          <span
            style={{
              fontSize: "var(--text-xs)",
              padding: `var(--space-4) var(--space-8)`,
              borderRadius: "var(--radius-pill)",
              background: "var(--color-warning)",
              color: "var(--color-text-inverted)",
              fontWeight: 500,
            }}
          >
            1 module gated
          </span>
          <button
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              padding: `var(--space-4) var(--space-8)`,
              borderRadius: "var(--radius-sm)",
              border: `1px solid var(--color-accent-default)`,
              background: "transparent",
              color: "var(--color-text-accent)",
              cursor: "pointer",
            }}
          >
            Configure paywall
          </button>
        </Inline>
      </Inline>

      {/* ── Learner view ── */}
      {viewMode === "learner" && (
        <Split
          direction="horizontal"
          secondarySize="280px"
          style={{ flex: 1, minHeight: 0 }}
          primary={
            <LessonPlayer
              lesson={STUB_LESSON}
              progress={progress}
              onProgress={handleProgress}
              onComplete={handleComplete}
              renderBlock={renderBlock}
              playbackRateOptions={[0.75, 1, 1.25, 1.5, 2]}
            />
          }
          secondary={
            <div
              style={{
                borderLeft: `1px solid var(--color-border-subtle)`,
                height: "100%",
                overflowY: "auto",
              }}
            >
              <ProgressTracker
                course={STUB_COURSE}
                userProgress={STUB_USER_PROGRESS}
                onLessonJump={handleLessonJump}
                showCertificateOn="completion"
              />
            </div>
          }
        />
      )}

      {/* ── Creator view ── */}
      {viewMode === "creator" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Creator tab bar */}
          <Inline
            gap={0}
            align="center"
            style={{
              padding: `0 var(--space-24)`,
              borderBottom: `1px solid var(--color-border-subtle)`,
              background: "var(--color-surface-raised)",
            }}
          >
            {(["curriculum", "quiz", "roster"] as CreatorTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setCreatorTab(tab)}
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: creatorTab === tab ? 600 : 400,
                  padding: `var(--space-12) var(--space-16)`,
                  border: "none",
                  borderBottom:
                    creatorTab === tab
                      ? `2px solid var(--color-text-accent)`
                      : `2px solid transparent`,
                  color:
                    creatorTab === tab
                      ? "var(--color-text-accent)"
                      : "var(--color-text-secondary)",
                  background: "none",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  marginBottom: "-1px",
                }}
              >
                {tab === "curriculum" ? "Curriculum" : tab === "quiz" ? "Quiz Builder" : "Students"}
              </button>
            ))}
          </Inline>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-24)" }}>
            {creatorTab === "curriculum" && (
              <Split
                direction="horizontal"
                primarySize="400px"
                style={{ height: "100%" }}
                primary={
                  <CurriculumTree
                    courseId="course-1"
                    tree={STUB_TREE}
                    onReorder={handleReorder}
                    onNodeAction={handleNodeAction}
                    canGatePerNode
                  />
                }
                secondary={
                  <div style={{ paddingLeft: "var(--space-24)" }}>
                    <Stack gap={8}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                        Course stats
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
                        {STUB_STUDENTS.length} enrolled · {STUB_STUDENTS.filter(s => s.status === "completed").length} completed
                      </div>
                    </Stack>
                  </div>
                }
              />
            )}

            {creatorTab === "quiz" && (
              <QuizBuilder
                quiz={quiz}
                questionTypes={QUESTION_TYPES}
                onChange={setQuiz}
                onSave={handleSaveQuiz}
                passThreshold={0.7}
              />
            )}

            {creatorTab === "roster" && (
              <StudentRoster
                courseId="course-1"
                students={STUB_STUDENTS}
                filters={{ status: undefined }}
                onStudentAction={handleStudentAction}
                bulkActions={["message", "remind", "export"]}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
