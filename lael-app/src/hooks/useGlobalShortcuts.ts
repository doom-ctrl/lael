import * as React from 'react';
import { useCommandPalette, useCommandPaletteHotkey } from '@/components/providers/CommandPaletteProvider';
import { useAddAssessmentDialog } from '@/components/modals/AddAssessmentDialogProvider';

/**
 * `useGlobalShortcuts` — registers app-wide keyboard shortcuts.
 * Mounted once near the app root.
 *
 * Currently bound:
 *   - `Cmd+K` / `Ctrl+K` → toggle command palette (handled by
 *      `useCommandPaletteHotkey`)
 *   - `N` (when not in an input) → open the Add Assessment dialog
 *   - `/` (when not in an input) → open the command palette with
 *      focus on the search input (mirrors GitHub/Slack convention)
 *   - `Escape` → close any open dialog (handled per-dialog)
 *
 * The `N` and `/` shortcuts are skipped when the user is typing in
 * an `<input>`, `<textarea>`, or `[contenteditable]` element — so
 * they don't hijack text entry in the Add Assessment form, settings
 * inputs, etc.
 */
export function useGlobalShortcuts() {
  // Cmd+K / Ctrl+K — must be registered once for the whole app.
  useCommandPaletteHotkey();

  const { open: openPalette } = useCommandPalette();
  const dialog = useAddAssessmentDialog();

  React.useEffect(() => {
    const isTypingTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (target.isContentEditable) return true;
      return false;
    };

    const onKey = (e: KeyboardEvent) => {
      // Don't fire shortcuts while the user is typing in a form
      // control or when a modifier (other than Shift) is held.
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // `N` — open the Add Assessment modal.
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        dialog.open();
        return;
      }

      // `/` — open the command palette (focus the search input).
      if (e.key === '/') {
        e.preventDefault();
        openPalette();
        return;
      }

      // `G` followed by another key would normally do "go to" in
      // GitHub-style palettes, but we keep things simple for v1.
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPalette, dialog]);
}
