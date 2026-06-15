import * as React from 'react';
import {
  AddAssessmentModal,
  type AddAssessmentFormValues,
} from '@/components/modals/AddAssessmentModal';
import type { Assessment } from '@/lib/design-tokens';

type DialogState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; item: Assessment };

interface AddAssessmentDialogContextValue {
  /** Open the dialog in "create" mode (empty form). */
  open: () => void;
  /** Open the dialog in "edit" mode with the given item pre-filled. */
  openEdit: (item: Assessment) => void;
  /** Close the dialog. */
  close: () => void;
  /** @deprecated retained for Phase-1 callers. The modal now owns its
   *  own mutation calls, so pages no longer need a save handler. */
  onSave: (handler: (values: AddAssessmentFormValues) => void) => () => void;
  /** The current dialog state — read by the modal to know which mode. */
  state: DialogState;
}

const AddAssessmentDialogContext =
  React.createContext<AddAssessmentDialogContextValue | null>(null);

/**
 * Provider — mounts the global Add/Edit Assessment dialog once at the
 * app root. Any component can call `open()` (create) or `openEdit(item)`
 * (edit) from the context to show it. The dialog itself calls the
 * Convex mutations — no page-level save handler is required.
 */
export function AddAssessmentDialogProvider({
  children,
}: {
  children: React.ReactNode;
  /** @deprecated kept for the Phase 1 API; ignored at runtime. */
  onSaved?: (values: AddAssessmentFormValues) => void;
}) {
  const [state, setState] = React.useState<DialogState>({ kind: 'closed' });
  const handlerRef = React.useRef<((v: AddAssessmentFormValues) => void) | null>(
    null,
  );

  const value = React.useMemo<AddAssessmentDialogContextValue>(
    () => ({
      open: () => setState({ kind: 'create' }),
      openEdit: (item) => setState({ kind: 'edit', item }),
      close: () => setState({ kind: 'closed' }),
      onSave: (handler) => {
        handlerRef.current = handler;
        return () => {
          if (handlerRef.current === handler) handlerRef.current = null;
        };
      },
      state,
    }),
    [state],
  );

  return (
    <AddAssessmentDialogContext.Provider value={value}>
      {children}
      <AddAssessmentModal
        open={state.kind !== 'closed'}
        onOpenChange={(open) => {
          if (!open) setState({ kind: 'closed' });
        }}
        mode={
          state.kind === 'edit' ? { kind: 'edit', item: state.item } : { kind: 'create' }
        }
        onSave={(v) => {
          handlerRef.current?.(v);
        }}
      />
    </AddAssessmentDialogContext.Provider>
  );
}

export function useAddAssessmentDialog(): AddAssessmentDialogContextValue {
  const ctx = React.useContext(AddAssessmentDialogContext);
  if (!ctx) {
    throw new Error(
      'useAddAssessmentDialog must be used within AddAssessmentDialogProvider',
    );
  }
  return ctx;
}
