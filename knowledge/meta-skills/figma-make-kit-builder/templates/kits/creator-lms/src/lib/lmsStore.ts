import { createStore } from "@/lib/store/createStore";

interface LmsState {
  currentLessonId: string | null;
  activeView: "curriculum" | "player" | "quiz" | "roster";
}

export const lmsStore = createStore<LmsState>({
  currentLessonId: null,
  activeView: "curriculum",
});
