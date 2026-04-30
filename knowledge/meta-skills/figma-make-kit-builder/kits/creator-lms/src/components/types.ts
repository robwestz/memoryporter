// Domain types — creator-lms kit

// ── Curriculum tree ────────────────────────────────────────────────────────────

export type NodeKind = "module" | "lesson" | "resource";
export type PublishState = "draft" | "published" | "scheduled" | "archived";

export interface CurriculumNode {
  id: string;
  kind: NodeKind;
  title: string;
  publishState: PublishState;
  gated: boolean; // paywall gate
  children?: CurriculumNode[]; // modules and lessons can nest
  durationMin?: number;
}

export interface ReorderOp {
  nodeId: string;
  newParentId: string | null;
  newIndex: number;
}

export type NodeAction =
  | { type: "duplicate"; nodeId: string }
  | { type: "publish"; nodeId: string }
  | { type: "archive"; nodeId: string }
  | { type: "gate"; nodeId: string; gated: boolean }
  | { type: "delete"; nodeId: string };

// ── Lesson + blocks ───────────────────────────────────────────────────────────

export type BlockType = "video" | "text" | "quiz" | "embed" | "file";

export interface VideoBlock {
  type: "video";
  id: string;
  src: string; // URL to video file
  poster?: string;
  captionsSrc?: string;
  durationSec?: number;
}

export interface TextBlock {
  type: "text";
  id: string;
  markdown: string;
}

export interface QuizBlock {
  type: "quiz";
  id: string;
  quizId: string; // references a Quiz
}

export interface EmbedBlock {
  type: "embed";
  id: string;
  url: string;
  title?: string;
}

export interface FileBlock {
  type: "file";
  id: string;
  name: string;
  url: string;
  sizeBytes?: number;
}

export type Block = VideoBlock | TextBlock | QuizBlock | EmbedBlock | FileBlock;

export interface Lesson {
  id: string;
  title: string;
  blocks: Block[];
  durationMin?: number;
}

// ── Progress ───────────────────────────────────────────────────────────────────

export interface ProgressState {
  lessonId: string;
  completedBlocks: string[]; // block IDs
  videoPositionSec?: number; // resume point for video blocks
  completed: boolean;
  lastAccessedAt?: Date;
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export type QuestionType = "mcq" | "true-false" | "short-answer" | "code";

export interface McqQuestion {
  type: "mcq";
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  feedback?: Record<number, string>; // per-option feedback
  points: number;
}

export interface TrueFalseQuestion {
  type: "true-false";
  id: string;
  prompt: string;
  correct: boolean;
  feedbackTrue?: string;
  feedbackFalse?: string;
  points: number;
}

export interface ShortAnswerQuestion {
  type: "short-answer";
  id: string;
  prompt: string;
  sampleAnswer?: string;
  points: number;
}

export interface CodeQuestion {
  type: "code";
  id: string;
  prompt: string;
  starterCode?: string;
  language: string;
  points: number;
}

export type Question =
  | McqQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | CodeQuestion;

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  passThreshold: number; // 0–1
  randomizeOrder?: boolean;
}

// ── Course + progress ──────────────────────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  description?: string;
  modules: CurriculumNode[]; // top-level tree
}

export type LessonStatus = "locked" | "available" | "in-progress" | "completed";

export interface ModuleProgress {
  moduleId: string;
  lessonStatuses: Record<string, LessonStatus>;
  completedCount: number;
  totalCount: number;
}

export interface UserProgress {
  courseId: string;
  currentLessonId: string | null;
  modules: ModuleProgress[];
  overallPercent: number;
  certificateEarned: boolean;
}

// ── Students ──────────────────────────────────────────────────────────────────

export type StudentStatus = "active" | "stuck" | "completed" | "dropped";

export interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  enrolledAt: Date;
  lastActiveAt?: Date;
  progressPercent: number;
  status: StudentStatus;
}

export interface StudentFilters {
  status?: StudentStatus;
  lastActiveBefore?: Date;
  cohort?: string;
}

export type StudentAction =
  | { type: "message"; studentId: string }
  | { type: "remind"; studentId: string }
  | { type: "mark-completed"; studentId: string }
  | { type: "remove"; studentId: string }
  | { type: "export" };

export type BulkAction = "message" | "remind" | "export" | "remove";
