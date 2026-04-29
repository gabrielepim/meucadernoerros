import { useEffect } from "react";

interface Shortcuts {
  onSpace?: () => void;
  onCtrlEnter?: () => void;
}

/** Global shortcuts. Ignored when typing in inputs/textareas/contenteditable. */
export function useKeyboardShortcuts({ onSpace, onCtrlEnter }: Shortcuts) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editable = target?.isContentEditable;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || editable;

      if (e.code === "Space" && !inField && onSpace) {
        e.preventDefault();
        onSpace();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && onCtrlEnter) {
        e.preventDefault();
        onCtrlEnter();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSpace, onCtrlEnter]);
}