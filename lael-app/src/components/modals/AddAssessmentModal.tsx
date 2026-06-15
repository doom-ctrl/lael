import * as React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_TYPE_STYLES,
  ASSESSMENT_TYPES,
  PRIORITIES,
  PRIORITY_STYLES,
  STATUSES,
  STATUS_STYLES,
  type Assessment,
  type AssessmentType,
  type Priority,
  type Status,
} from '@/lib/design-tokens';
import type { Id } from '@/../convex/_generated/dataModel';
import { useAssessmentMutations } from '@/features/assessments/useAssessments';
import { toast } from '@/components/providers/Toaster';

export type AddAssessmentMode =
  | { kind: 'create' }
  | { kind: 'edit'; item: Assessment };

interface AddAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional Phase 1 save hook — called after a successful submit. */
  onSave?: (values: AddAssessmentFormValues) => void;
  /** Which mode the dialog is in. Defaults to "create". */
  mode?: AddAssessmentMode;
}

export interface AddAssessmentFormValues {
  title: string;
  subject: string;
  type: AssessmentType;
  dueDate: string;
  priority: Priority;
  /** Mirrors the stored `status` enum: `overdue` is a derived view
   *  state, not a stored value, so the form never produces it. */
  status: Exclude<Status, 'overdue'>;
  notes: string;
}

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function itemToFormValues(item: Assessment): AddAssessmentFormValues {
  return {
    title: item.title,
    subject: item.subject,
    type: item.type,
    dueDate: item.dueDate,
    priority: item.priority,
    // The form never lets the user pick `overdue`; if an item is already
    // completed we pre-fill `pending` so the user can decide whether to
    // re-open or save with `completed` as-is.
    status:
      item.status === 'completed'
        ? 'pending'
        : (item.status as Exclude<Status, 'overdue'>),
    notes: item.description ?? '',
  };
}

/* ─── Validation ────────────────────────────────────────────────────────── */

/**
 * Zod schema for the Add Assessment form.
 *
 * Validated on submit (full form) and on field blur (single field,
 * to give immediate feedback as the user types). The schema rejects
 * empty titles, unrealistic due dates, and whitespace-only input.
 *
 * `dueDate` is checked to be a real ISO `YYYY-MM-DD` string AND a
 * valid calendar date — `2026-02-31` would be rejected.
 */
const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Keep the title under 120 characters'),
  subject: z
    .string()
    .trim()
    .max(80, 'Subject is too long')
    .optional()
    .or(z.literal('')),
  type: z.enum(['exam', 'quiz', 'assignment', 'project', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed']),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s), 'Use the date picker')
    .refine((s) => {
      const d = new Date(s);
      return !Number.isNaN(d.getTime());
    }, 'That date is not real')
    .refine((s) => {
      // Don't allow due dates that are > 10 years in the future
      // — it's almost certainly a typo (e.g. 2126 instead of 2026).
      const d = new Date(s);
      const tenYearsOut = new Date();
      tenYearsOut.setFullYear(tenYearsOut.getFullYear() + 10);
      return d <= tenYearsOut;
    }, 'Date is too far in the future'),
  notes: z
    .string()
    .max(2000, 'Notes are too long (max 2000 chars)')
    .optional()
    .or(z.literal('')),
});

type FormErrors = Partial<Record<keyof AddAssessmentFormValues, string>>;

/**
 * Validate just one field — used for inline blur-time validation
 * without re-running the whole schema.
 */
function validateField<K extends keyof AddAssessmentFormValues>(
  key: K,
  value: AddAssessmentFormValues[K],
): string | null {
  // Build a single-key shape and let Zod narrow the result.
  const shape = { [key]: formSchema.shape[key as keyof typeof formSchema.shape] };
  const result = z
    .object(shape as never)
    .safeParse({ [key]: value } as never);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? 'Invalid value';
}

function Field({
  label,
  required,
  children,
  fullWidth,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
  error?: string;
}) {
  return (
    <div className={cn('mb-3', fullWidth && 'col-span-full')}>
      <Label className="mb-1">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Label>
      {children}
      {error && (
        <p
          role="alert"
          className="mt-1 flex items-center gap-1 text-[11px] text-danger"
        >
          <span
            aria-hidden="true"
            className="inline-block h-1 w-1 rounded-full bg-danger"
          />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * AddAssessmentModal — 2-column form with type/priority button groups.
 * Used for both "create" and "edit" — the `mode` prop switches.
 *
 * Validation:
 *   - Each field is checked on blur via `validateField`; errors are
 *     rendered inline below the field.
 *   - The whole form is re-validated on submit; if any field is
 *     invalid the submit is blocked and the first error becomes a
 *     toast so the user knows why.
 *   - `serverError` shows the Convex error message if the mutation
 *     throws.
 *
 * On success:
 *   - create mode → `mutations.create({...})` → success toast
 *   - edit mode   → `mutations.update({ id, ... })` → success toast
 *
 * On error:
 *   - Convex errors surface in the inline alert + a toast
 */
export function AddAssessmentModal({
  open,
  onOpenChange,
  onSave,
  mode = { kind: 'create' },
}: AddAssessmentModalProps) {
  const mutations = useAssessmentMutations();
  const isEdit = mode.kind === 'edit';

  const [values, setValues] = React.useState<AddAssessmentFormValues>(() =>
    isEdit ? itemToFormValues(mode.item) : defaults(),
  );
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<
    Partial<Record<keyof AddAssessmentFormValues, boolean>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Reset form when the mode changes (e.g. opening a different item).
  React.useEffect(() => {
    if (open) {
      setValues(isEdit ? itemToFormValues(mode.item) : defaults());
      setErrors({});
      setTouched({});
      setServerError(null);
    }
  }, [open, isEdit, mode.kind === 'edit' ? mode.item.id : null]);

  const setField = <K extends keyof AddAssessmentFormValues>(
    key: K,
    value: AddAssessmentFormValues[K],
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
    // If the user has already been shown an error for this field,
    // re-validate it as they type so the error clears when fixed.
    if (touched[key]) {
      const next = validateField(key, value);
      setErrors((prev) => ({ ...prev, [key]: next ?? undefined }));
    }
  };

  const touchField = (key: keyof AddAssessmentFormValues) => {
    setTouched((t) => ({ ...t, [key]: true }));
    const err = validateField(key, values[key]);
    setErrors((prev) => ({ ...prev, [key]: err ?? undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setServerError(null);

    // Run the whole schema and surface every error.
    const result = formSchema.safeParse({
      ...values,
      subject: values.subject.trim() || undefined,
      notes: values.notes.trim() || undefined,
    });
    if (!result.success) {
      const next: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof AddAssessmentFormValues | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      // Mark all failed fields as touched so the inline errors
      // don't disappear on the next re-render.
      setTouched(
        Object.keys(next).reduce(
          (acc, k) => ({ ...acc, [k]: true }),
          { ...touched },
        ),
      );
      toast.error(next.title ?? 'Please fix the highlighted fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: values.title.trim(),
        subject: values.subject.trim(),
        type: values.type,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate,
        description: values.notes.trim() || undefined,
      };
      if (isEdit) {
        await mutations.update({
          id: mode.item.id as Id<'assessments'>,
          ...payload,
        });
        toast.success('Assessment updated');
      } else {
        await mutations.create(payload);
        toast.success('Assessment added');
      }
      onSave?.(values);
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Try again.';
      setServerError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || deleting) return;
    if (!window.confirm(`Delete "${values.title}"? This can't be undone.`)) {
      return;
    }
    setDeleting(true);
    setServerError(null);
    try {
      await mutations.remove({ id: mode.item.id as Id<'assessments'> });
      toast.success('Assessment deleted');
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not delete. Try again.';
      setServerError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const canSave =
    values.title.trim().length > 0 && values.dueDate.length > 0 && !submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Assessment' : 'Add Assessment'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="grid grid-cols-2 gap-x-3">
              <Field label="Title" required fullWidth error={errors.title}>
                <Input
                  value={values.title}
                  onChange={(e) => setField('title', e.target.value)}
                  onBlur={() => touchField('title')}
                  placeholder="e.g., Calculus II — Midterm Exam"
                  autoFocus
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? 'title-error' : undefined}
                />
              </Field>

              <Field label="Subject / Course" fullWidth error={errors.subject}>
                <Input
                  value={values.subject}
                  onChange={(e) => setField('subject', e.target.value)}
                  onBlur={() => touchField('subject')}
                  placeholder="e.g., Mathematics"
                  aria-invalid={!!errors.subject}
                />
              </Field>

              <Field label="Type" required fullWidth>
                <div className="grid grid-cols-5 gap-[5px]">
                  {ASSESSMENT_TYPES.map((t) => {
                    const style = ASSESSMENT_TYPE_STYLES[t];
                    const selected = values.type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setField('type', t)}
                        className={cn(
                          'rounded-md px-1 py-[7px] text-center text-[9.5px] font-semibold uppercase tracking-[0.04em]',
                          'border-[1.5px] transition-all duration-150',
                          selected
                            ? 'border-accent bg-accent-light text-accent'
                            : 'border-border bg-surface text-text-secondary hover:border-accent',
                        )}
                      >
                        <span
                          style={{
                            color: selected ? undefined : style.color,
                          }}
                        >
                          {ASSESSMENT_TYPE_LABELS[t]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Due Date" required error={errors.dueDate}>
                <Input
                  type="date"
                  value={values.dueDate}
                  onChange={(e) => setField('dueDate', e.target.value)}
                  onBlur={() => touchField('dueDate')}
                  aria-invalid={!!errors.dueDate}
                />
              </Field>

              <Field label="Priority" required>
                <div className="grid grid-cols-2 gap-[5px]">
                  {PRIORITIES.map((p) => {
                    const style = PRIORITY_STYLES[p];
                    const selected = values.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setField('priority', p)}
                        className={cn(
                          'flex items-center justify-center gap-[5px] rounded-md px-2 py-[7px]',
                          'border-[1.5px] transition-all duration-150',
                          selected
                            ? 'border-[color:var(--p)]'
                            : 'border-border bg-surface',
                        )}
                        style={
                          {
                            background: selected ? style.bg : undefined,
                            '--p': style.color,
                          } as React.CSSProperties
                        }
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: style.color }}
                        />
                        <span
                          className={cn(
                            'text-[11.5px] font-medium',
                            selected ? '' : 'text-text-secondary',
                          )}
                          style={selected ? { color: style.color } : undefined}
                        >
                          {style.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Status" fullWidth>
                <select
                  value={values.status}
                  onChange={(e) =>
                    setField(
                      'status',
                      e.target.value as Exclude<Status, 'overdue'>,
                    )
                  }
                  className={cn(
                    'flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary',
                    'transition-[border-color,box-shadow] duration-150',
                    'focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/10',
                    'cursor-pointer',
                  )}
                >
                  {STATUSES.filter((s) => s !== 'overdue').map((s) => (
                    <option key={s} value={s}>
                      {STATUS_STYLES[s].label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Notes" fullWidth error={errors.notes}>
                <Textarea
                  value={values.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  onBlur={() => touchField('notes')}
                  placeholder="Optional notes — chapters, requirements, anything to remember"
                  rows={2}
                  className="leading-relaxed"
                  aria-invalid={!!errors.notes}
                />
              </Field>

              {serverError && (
                <div
                  role="alert"
                  className={cn(
                    'col-span-full rounded-md border border-danger-border bg-danger-light px-3 py-2',
                    'text-[12px] text-danger',
                  )}
                >
                  {serverError}
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            {isEdit ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="mr-auto gap-1.5 text-danger hover:bg-danger-light hover:text-danger"
              >
                {deleting ? (
                  <Loader2
                    className="h-3 w-3 animate-spin"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="h-3 w-3" strokeWidth={1.6} />
                )}
                Delete
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {submitting ? (
                <>
                  <Loader2
                    className="h-3 w-3 animate-spin"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  {isEdit ? 'Saving…' : 'Adding…'}
                </>
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Save Assessment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(): AddAssessmentFormValues {
  return {
    title: '',
    subject: '',
    type: 'exam',
    dueDate: todayDateStr(),
    priority: 'medium',
    status: 'pending',
    notes: '',
  };
}
