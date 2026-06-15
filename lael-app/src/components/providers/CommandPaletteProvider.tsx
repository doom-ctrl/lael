import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  FileText,
  LayoutDashboard,
  ListChecks,
  Moon,
  Plus,
  Settings,
  Sun,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useUserPreferences } from '@/features/preferences/useUserPreferences';
import { useAssessments, useAssessmentMutations } from '@/features/assessments/useAssessments';
import { useAddAssessmentDialog } from '@/components/modals/AddAssessmentDialogProvider';
import { ASSESSMENT_TYPE_LABELS } from '@/lib/design-tokens';
import type { Assessment } from '@/lib/design-tokens';
import { toast } from '@/components/providers/Toaster';
import { cn } from '@/lib/utils';

/* ─── Context ──────────────────────────────────────────────────────────── */

interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CommandPaletteContext =
  React.createContext<CommandPaletteContextValue | null>(null);

/**
 * Provider — mounts the global Cmd+K palette once at the app root.
 * Any component can call `open()` from the context to show it. The
 * keyboard shortcut is registered in `useCommandPaletteHotkey` below.
 */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const value = React.useMemo<CommandPaletteContextValue>(
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((o) => !o),
      isOpen,
    }),
    [isOpen],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPaletteDialog open={isOpen} onOpenChange={setIsOpen} />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = React.useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      'useCommandPalette must be used within CommandPaletteProvider',
    );
  }
  return ctx;
}

/* ─── Hotkey hook ──────────────────────────────────────────────────────── */

/**
 * `useCommandPaletteHotkey` — registers the global `Cmd+K` / `Ctrl+K`
 * shortcut. Mount this once near the app root.
 *
 * The keydown listener is added to `window` and ignores events that
 * originate inside a text input / textarea / contenteditable so it
 * doesn't fight with the user typing in a form.
 */
export function useCommandPaletteHotkey() {
  const { toggle, close } = useCommandPalette();
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isModK) {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === 'Escape') {
        // `Esc` also closes the palette when it's open — but
        // don't interfere with other Esc handlers (the modal has
        // its own). The Dialog component handles this for us when
        // focused, so this is just a belt-and-braces fallback.
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, close]);
}

/* ─── Dialog ───────────────────────────────────────────────────────────── */

/**
 * CommandPaletteDialog — the actual modal. Routes user queries into
 * three groups: Quick actions, Navigate, and Assessments.
 *
 * Searching by assessment title or subject filters the Assessments
 * group in real time. Pressing Enter on an item runs its action
 * (edit a specific assessment, navigate, toggle theme, etc.) and
 * closes the palette.
 */
function CommandPaletteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const dialog = useAddAssessmentDialog();
  const assessments = useAssessments();
  const { markComplete, remove } = useAssessmentMutations();
  const { prefs, update } = useUserPreferences();

  // Reset selection when the dialog opens/closes.
  React.useEffect(() => {
    if (!open) {
      // no state to reset currently, but hook is here for future
      // expansion (recent items, search history, etc.)
    }
  }, [open]);

  const closeAnd = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  const handleToggleTheme = () => {
    const next = prefs.theme === 'dark' ? 'light' : 'dark';
    void update({ theme: next });
    toast.success(`Switched to ${next} theme`);
  };

  const handleComplete = (item: Assessment) => {
    const next = item.status !== 'completed';
    void markComplete({ id: item.id as never, completed: next });
    toast.success(next ? 'Marked complete' : 'Reopened');
  };

  const handleDelete = (item: Assessment) => {
    // The palette doesn't show a confirm — the user has to type and
    // press enter, which is its own commitment. Still, we don't
    // want accidental deletes; keep it explicit in the label.
    void remove({ id: item.id as never });
    toast.success(`Deleted "${item.title}"`);
  };

  const items = assessments ?? [];
  const pending = items.filter((a) => a.status !== 'completed');
  const completed = items.filter((a) => a.status === 'completed');

  // Stats shown in the footer-ish empty state — gives a sense of
  // scale when the user opens the palette on a fresh account.
  const totalCount = items.length;
  const pendingCount = pending.length;
  const completedCount = completed.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="max-w-[600px] gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command shouldFilter>
          <CommandInput placeholder="Search assessments or type a command…" />
          <CommandList>
            <CommandEmpty>
              <p className="mb-1 font-display text-[15px] italic text-text-secondary">
                Nothing found.
              </p>
              <p className="text-[11.5px] text-text-tertiary">
                Try "add", "settings", or the start of an assessment title.
              </p>
            </CommandEmpty>

            {/* Quick actions */}
            <CommandGroup heading="Quick actions">
              <CommandItem
                icon={<Plus className="h-3.5 w-3.5" strokeWidth={1.6} />}
                onSelect={() => closeAnd(() => dialog.open())}
                value="add new assessment create"
              >
                Add assessment
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>
              <CommandItem
                icon={
                  prefs.theme === 'dark' ? (
                    <Sun className="h-3.5 w-3.5" strokeWidth={1.6} />
                  ) : (
                    <Moon className="h-3.5 w-3.5" strokeWidth={1.6} />
                  )
                }
                onSelect={() => closeAnd(handleToggleTheme)}
                value={`toggle theme ${prefs.theme === 'dark' ? 'light' : 'dark'}`}
              >
                Switch to {prefs.theme === 'dark' ? 'light' : 'dark'} theme
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Navigate */}
            <CommandGroup heading="Navigate">
              <CommandItem
                icon={<LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.6} />}
                onSelect={() => closeAnd(() => navigate('/'))}
                value="dashboard home"
              >
                Dashboard
              </CommandItem>
              <CommandItem
                icon={<ListChecks className="h-3.5 w-3.5" strokeWidth={1.6} />}
                onSelect={() => closeAnd(() => navigate('/assessments'))}
                value="assessments list all"
              >
                Assessments
              </CommandItem>
              <CommandItem
                icon={<Calendar className="h-3.5 w-3.5" strokeWidth={1.6} />}
                onSelect={() => closeAnd(() => navigate('/calendar'))}
                value="calendar month schedule"
              >
                Calendar
              </CommandItem>
              <CommandItem
                icon={<Settings className="h-3.5 w-3.5" strokeWidth={1.6} />}
                onSelect={() => closeAnd(() => navigate('/settings'))}
                value="settings preferences"
              >
                Settings
              </CommandItem>
            </CommandGroup>

            {/* Pending assessments — hidden when there are none, so
                the palette stays tight for new users. */}
            {pending.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading={`Pending (${pending.length})`}>
                  {pending.slice(0, 8).map((item) => (
                    <CommandItem
                      key={item.id}
                      icon={
                        <FileText
                          className="h-3.5 w-3.5"
                          strokeWidth={1.6}
                        />
                      }
                      onSelect={() =>
                        closeAnd(() => dialog.openEdit(item))
                      }
                      value={`${item.title} ${item.subject} ${ASSESSMENT_TYPE_LABELS[item.type]}`}
                    >
                      <span className="truncate">{item.title}</span>
                      <span
                        className={cn(
                          'ml-1 flex-shrink-0 text-[10.5px] text-text-tertiary',
                        )}
                      >
                        {item.subject}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAnd(() => handleComplete(item));
                        }}
                        title="Mark complete"
                        aria-label="Mark complete"
                        className={cn(
                          'ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md',
                          'bg-transparent text-text-tertiary',
                          'transition-colors hover:bg-bg-warm hover:text-success',
                        )}
                      >
                        <CheckSquare
                          className="h-3 w-3"
                          strokeWidth={1.6}
                        />
                      </button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Recently completed — same treatment, with a delete
                affordance for cleanup. */}
            {completed.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading={`Recently completed (${completedCount})`}>
                  {completed.slice(0, 5).map((item) => (
                    <CommandItem
                      key={item.id}
                      icon={
                        <CheckSquare
                          className="h-3.5 w-3.5 opacity-60"
                          strokeWidth={1.6}
                        />
                      }
                      onSelect={() =>
                        closeAnd(() => dialog.openEdit(item))
                      }
                      value={`${item.title} ${item.subject} ${ASSESSMENT_TYPE_LABELS[item.type]}`}
                      className="opacity-70"
                    >
                      <span className="truncate text-decoration-line-through">
                        {item.title}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeAnd(() => handleDelete(item));
                        }}
                        title="Delete"
                        aria-label="Delete"
                        className={cn(
                          'ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md',
                          'bg-transparent text-text-tertiary',
                          'transition-colors hover:bg-danger-light hover:text-danger',
                        )}
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={1.6} />
                      </button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Bottom hint when the user has zero assessments. */}
            {totalCount === 0 && (
              <>
                <CommandSeparator />
                <div className="px-3 py-6 text-center">
                  <p className="font-display text-[14px] italic text-text-secondary">
                    Your space is empty.
                  </p>
                  <p className="mt-1 text-[11.5px] text-text-tertiary">
                    Press{' '}
                    <kbd className="rounded border border-border-light bg-bg-warm px-1.5 py-0.5 text-[10px] font-medium font-mono">
                      N
                    </kbd>{' '}
                    to add your first assessment.
                  </p>
                </div>
              </>
            )}

            {/* Bottom-of-list footer with counts (when there's data) */}
            {totalCount > 0 && (
              <>
                <CommandSeparator />
                <div className="flex items-center justify-between px-3 py-2 text-[10.5px] text-text-tertiary">
                  <span>
                    {pendingCount} pending · {completedCount} completed
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border-light bg-bg-warm px-1 py-0.5 text-[9px] font-mono">↑</kbd>
                      <kbd className="rounded border border-border-light bg-bg-warm px-1 py-0.5 text-[9px] font-mono">↓</kbd>
                      navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border-light bg-bg-warm px-1 py-0.5 text-[9px] font-mono">↵</kbd>
                      select
                    </span>
                  </span>
                </div>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
