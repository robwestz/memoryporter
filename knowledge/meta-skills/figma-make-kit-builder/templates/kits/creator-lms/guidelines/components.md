# Components — creator-lms

Learning management system for creators (course builder + delivery). Target
user: creators building paid courses; learners consuming them. Two-sided:
creator admin surfaces + learner player surfaces share this kit.

## CurriculumTree

**Usage** — Creator-side. Hierarchical tree of modules → lessons → resources.
Drag-reorder, nested rearrangement, bulk actions (duplicate, publish,
gate-by-tier).

**Semantic purpose** — A course is a tree, not a flat list. Modules group
lessons; lessons group resources. The tree is the primary structure creators
author.

**Examples**

Correct:

```tsx
<CurriculumTree
  courseId={courseId}
  tree={curriculumTree}
  onReorder={persistReorder}
  onNodeAction={handleNodeAction}
  canGatePerNode
/>
```

Incorrect:

```tsx
<CurriculumTree lessons={flatLessonList} />
```

*Why wrong:* Flat lessons lose the module grouping and publishing semantics.
Creators think in modules; the data must match.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `courseId` | `string` | yes | — | Scope |
| `tree` | `CurriculumNode[]` | yes | — | Nested structure |
| `onReorder` | `(moves: ReorderOp[]) => void` | yes | — | Persist |
| `onNodeAction` | `(a: NodeAction) => void` | yes | — | Per-node actions |
| `canGatePerNode` | `boolean` | no | `false` | Show per-node paywall config |

---

## LessonPlayer

**Usage** — Learner-side. Main viewing surface. Supports video, text, embeds,
quizzes. Persistent player controls (bottom), progress bar, sidebar with
lesson list + notes. Paired with `ProgressTracker` and `LessonNotes`.

**Semantic purpose** — Media-agnostic lesson rendering with persistent
progress state. The lesson is a mixed-media unit; the player handles the
composition.

**Examples**

Correct:

```tsx
<LessonPlayer
  lesson={currentLesson}
  progress={progressState}
  onProgress={persistProgress}
  onComplete={markComplete}
  renderBlock={(b) => <LessonBlockRenderer block={b} />}
  playbackRateOptions={[0.75, 1, 1.25, 1.5, 2]}
/>
```

Incorrect:

```tsx
<LessonPlayer lessonId={id} />
```

*Why wrong:* No progress persistence = learners start over each session.
No block renderer = plain text/video only, no quizzes or embeds.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `lesson` | `Lesson` | yes | — | Full lesson with blocks |
| `progress` | `ProgressState` | yes | — | Resume position |
| `onProgress` | `(p: ProgressState) => void` | yes | — | Persist |
| `onComplete` | `() => void` | yes | — | Marks lesson done |
| `renderBlock` | `(b: Block) => ReactNode` | yes | — | Block-type renderer |
| `playbackRateOptions` | `number[]` | no | `[1]` | For video blocks |

---

## QuizBuilder

**Usage** — Creator-side. Form for authoring quizzes: question types (MCQ,
true/false, short-answer, code), points, feedback per answer, pass threshold.
Paired with `QuizPlayer` on learner side.

**Semantic purpose** — A quiz is a typed, validatable structure. Each question
has a type, correct answer(s), and feedback. The builder enforces that; free-
form text fields do not.

**Examples**

Correct:

```tsx
<QuizBuilder
  quiz={draftQuiz}
  questionTypes={["mcq", "true-false", "short-answer", "code"]}
  onChange={updateDraft}
  onSave={saveQuiz}
  passThreshold={0.7}
/>
```

Incorrect:

```tsx
<QuizBuilder questions={questionsAsText} />
```

*Why wrong:* Text-based questions can't auto-grade. The builder's value is
the typed structure that enables instant feedback.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `quiz` | `Quiz` | yes | — | Draft or existing |
| `questionTypes` | `QuestionType[]` | yes | — | Allowed types |
| `onChange` | `(q: Quiz) => void` | yes | — | Draft updates |
| `onSave` | `(q: Quiz) => Promise<void>` | yes | — | Persist |
| `passThreshold` | `number` | no | `0.7` | Completion threshold (0–1) |

---

## ProgressTracker

**Usage** — Learner-side sidebar or header. Shows progress through the current
course: completed lessons, current lesson, upcoming. Percentage bar + per-module
breakdown.

**Semantic purpose** — Motivation + navigation. Learners see how far they've
come and jump ahead/back quickly.

**Examples**

Correct:

```tsx
<ProgressTracker
  course={course}
  userProgress={userProgress}
  onLessonJump={navigateToLesson}
  showCertificateOn="completion"
/>
```

Incorrect:

```tsx
<ProgressTracker percent={45} />
```

*Why wrong:* A number without structure = no jump affordance, no per-module
context. Learners need the tree mirror, not just the aggregate.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `course` | `Course` | yes | — | Full tree for breakdown |
| `userProgress` | `UserProgress` | yes | — | Completions + current |
| `onLessonJump` | `(lessonId: string) => void` | yes | — | Navigation |
| `showCertificateOn` | `"completion" \| "threshold" \| "never"` | no | `"completion"` | Certificate gate |

---

## StudentRoster

**Usage** — Creator-side at `/courses/:id/students`. Table of enrolled
students with enrollment date, progress %, last active, and per-row actions
(message, remove, mark completed). Uses `DataTable` primitives.

**Semantic purpose** — The engagement view. Which students are progressing,
which are stuck, which dropped off.

**Examples**

Correct:

```tsx
<StudentRoster
  courseId={courseId}
  students={enrolledStudents}
  filters={{ status: "stuck", lastActiveBefore: sevenDaysAgo }}
  onStudentAction={handleAction}
  bulkActions={["message", "remind", "export"]}
/>
```

Incorrect:

```tsx
<StudentRoster students={students} />
```

*Why wrong:* No filters = can't triage. Creators specifically want "who is
stuck?" and "who is inactive?" — those are the filter defaults that matter.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `courseId` | `string` | yes | — | Scope |
| `students` | `EnrolledStudent[]` | yes | — | Full list |
| `filters` | `StudentFilters` | no | `{}` | Status, activity, cohort |
| `onStudentAction` | `(a: StudentAction) => void` | yes | — | Handler |
| `bulkActions` | `BulkAction[]` | no | `[]` | Multi-select ops |

---

## Monetization patterns enforced

- **Content gating** — `PaywallConfigurator` per course or per module,
  `LockedPreview` on gated lessons for non-enrolled visitors
- **Seat/role expansion** — team/organization enrollments (bulk seats for
  B2B training buyers)
- **Social/trust signals** — `RatingAggregateCard` on course listing,
  `ReviewManagerTable` for creator to respond
- **Abandoned-state rescue** — `ResumeWizard` on re-login pointing to the
  last incomplete lesson
