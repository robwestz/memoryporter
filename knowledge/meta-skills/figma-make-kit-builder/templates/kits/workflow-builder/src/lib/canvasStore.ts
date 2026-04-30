import { createStore } from "@/lib/store/createStore";

interface CanvasState {
  selectedNodeId: string | null;
  focusedRunId: string | null;
  focusedStepId: string | null;
}

export const canvasStore = createStore<CanvasState>({
  selectedNodeId: null,
  focusedRunId: null,
  focusedStepId: null,
});
