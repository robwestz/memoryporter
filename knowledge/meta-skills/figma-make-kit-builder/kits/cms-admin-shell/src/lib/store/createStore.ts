import { useSyncExternalStore } from "react";

type Listener = () => void;

export type Store<S> = {
  getState: () => S;
  setState: (updater: Partial<S> | ((prev: S) => Partial<S>)) => void;
  subscribe: (listener: Listener) => () => void;
  use: <T>(selector: (state: S) => T) => T;
};

/**
 * Minimal store for kit-level shared state. No external dependency.
 * Swap to Zustand or similar if a kit needs devtools, persistence, or
 * middleware — the API is intentionally compatible.
 *
 * Kits MAY create multiple stores for unrelated slices (e.g., one for
 * canvas state, one for selection). Do NOT combine unrelated slices into
 * a single store — it forces unnecessary re-renders.
 */
export function createStore<S>(initial: S): Store<S> {
  let state = initial;
  const listeners = new Set<Listener>();

  const getState = () => state;

  const setState: Store<S>["setState"] = (updater) => {
    const patch = typeof updater === "function" ? updater(state) : updater;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  };

  const subscribe: Store<S>["subscribe"] = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const use: Store<S>["use"] = (selector) =>
    useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state)
    );

  return { getState, setState, subscribe, use };
}
