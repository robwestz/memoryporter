import { useEffect } from "react";

type Shortcut = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

/**
 * Attach a keyboard shortcut. Handler fires on keydown when the combo matches.
 * Power-user surfaces rely on this — don't inline keyboard logic, use this hook.
 */
export function useKeyboardShortcut(
  shortcut: Shortcut,
  handler: (e: KeyboardEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const metaMatch = !!shortcut.meta === e.metaKey;
      const ctrlMatch = !!shortcut.ctrl === e.ctrlKey;
      const shiftMatch = !!shortcut.shift === e.shiftKey;
      const altMatch = !!shortcut.alt === e.altKey;

      if (keyMatch && metaMatch && ctrlMatch && shiftMatch && altMatch) {
        handler(e);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut.key, shortcut.meta, shortcut.ctrl, shortcut.shift, shortcut.alt, handler, enabled]);
}
