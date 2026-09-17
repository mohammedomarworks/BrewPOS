import { useEffect } from "react";

/**
 * Hook to handle closing modals or drawers when the Escape key is pressed.
 */
export function useModalEscape(isOpen: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
}
