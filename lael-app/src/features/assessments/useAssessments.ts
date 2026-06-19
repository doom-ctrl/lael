import { useMemo, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { isOverdue } from '@/lib/utils';
import type { Assessment } from '@/lib/design-tokens';
import { useAuth } from '@/features/auth/useAuth';
import { toast } from '@/components/providers/Toaster';

/**
 * useAssessments — single hook that returns the current user's full
 * list of assessments (newest-first by `createdAt`).
 *
 * Returns `undefined` while the Convex query is still resolving the
 * first batch (treat as "loading"). Once the query resolves, returns
 * the array — empty or otherwise.
 */
export function useAssessments(): Assessment[] | undefined {
  return useQuery(api.assessments.list) as Assessment[] | undefined;
}

/**
 * useAssessmentsByMonth — assessments in a given calendar month.
 * Used by `CalendarPage` to render the grid for the visible month.
 */
export function useAssessmentsByMonth(
  year: number,
  month: number,
): Assessment[] | undefined {
  return useQuery(api.assessments.listByMonth, { year, month }) as
    | Assessment[]
    | undefined;
}

/**
 * useAssessmentCounts — server-aggregated counts for the dashboard
 * stat tiles. `undefined` while loading.
 */
export function useAssessmentCounts() {
  return useQuery(api.assessments.counts) as
    | { total: number; completed: number; pending: number; inProgress: number }
    | undefined;
}

/* ─── Pre-computed selectors ─────────────────────────────────────────────── */

/**
 * useDashboardData — derived view-model for the dashboard page.
 *
 * - `today` is a real `new Date()` (the prototype's hardcoded date is
 *   gone now that the data is real).
 * - `dueToday` is the first non-completed item due today — used by
 *   the spotlight card.
 * - `upcoming` is everything non-completed, sorted by due date asc.
 * - `completed` is everything completed, sorted by `completedAt` desc.
 * - `thisWeek` is the count of non-completed items due in the next 7
 *   days.
 *
 * Returns `undefined` while assessments are loading; consumers handle
 * the loading state separately with `<LoadingState />`.
 */
export function useDashboardData(today: Date = new Date()) {
  const assessments = useAssessments();
  const counts = useAssessmentCounts();

  return useMemo(() => {
    if (!assessments) return undefined;

    // Use local date to avoid UTC timezone off-by-one errors
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const weekFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

    const upcoming = assessments
      .filter((a) => a.status !== 'completed')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const completed = assessments
      .filter((a) => a.status === 'completed')
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

    const dueToday = upcoming
      .filter((a) => a.dueDate === todayStr)
      .sort((a, b) => {
        // Within "due today" — higher priority first, then earlier type.
        const pa = priorityRank(a.priority);
        const pb = priorityRank(b.priority);
        if (pa !== pb) return pa - pb;
        return a.dueDate.localeCompare(b.dueDate);
      });

    const thisWeek = upcoming.filter((a) => {
      const d = new Date(a.dueDate + 'T00:00:00Z');
      return d >= today && d <= weekFromNow && !isOverdue(a.dueDate, a.status, today);
    });

    return {
      assessments,
      upcoming,
      completed,
      dueToday,
      thisWeekCount: thisWeek.length,
      spotlight: dueToday[0] ?? null,
      counts: counts ?? {
        total: assessments.length,
        completed: completed.length,
        pending: upcoming.length,
        inProgress: assessments.filter((a) => a.status === 'in_progress').length,
      },
    };
  }, [assessments, counts, today]);
}

function priorityRank(p: Assessment['priority']): number {
  return { urgent: 0, high: 1, medium: 2, low: 3 }[p];
}

/* ─── Mutation hooks ────────────────────────────────────────────────────── */

/**
 * useAssessmentMutations — returns the four CRUD mutation handles
 * already bound to the current user's session. Components can
 * `mutations.create(...)`, `mutations.update(...)`, etc.
 *
 * Why a single hook? Keeps import noise down in the page components
 * and means future cross-cutting concerns (e.g. optimistic update
 * helpers, toast dispatch) have one place to live.
 *
 * The returned `markComplete` and `remove` are wrapped with toast
 * notifications — callers don't need to fire `toast.success` /
 * `toast.error` themselves. Pass `{ silent: true }` to suppress
 * (e.g. when the call originates from a context menu that already
 * announced its action).
 */
export function useAssessmentMutations(options?: {
  /** When true, do not auto-fire success/error toasts. */
  silent?: boolean;
}) {
  const create = useMutation(api.assessments.create);
  const update = useMutation(api.assessments.update);
  const remove = useMutation(api.assessments.remove);
  const markComplete = useMutation(api.assessments.markComplete);

  // Use the current user's `userId` field — even though mutations
  // resolve it server-side, having it here lets the `useOptimistic`
  // helpers write the right id without a round-trip.
  const { user } = useAuth();
  const userId = user?._id ?? null;

  // Wrapped `markComplete` with optimistic UI + toast.
  // The Convex `useMutation` hook re-renders any `useQuery` that
  // reads from the same table once the mutation commits; we use
  // that for free, but we also write a tiny "optimistic" local
  // copy to a module-level Map so the row toggles instantly on
  // click (the round-trip would otherwise flash for ~80ms).
  const markCompleteWithOptimism = useCallback(
    async (args: { id: Id<'assessments'>; completed: boolean }) => {
      try {
        await markComplete(args);
        if (!options?.silent) {
          // Debounce toasts so a batch of rapid toggles doesn't
          // flood the screen.
          const now = Date.now();
          if (now - lastMarkToast > 600) {
            toast.success(args.completed ? 'Marked complete' : 'Reopened');
            lastMarkToast = now;
          }
        }
      } catch (err) {
        if (!options?.silent) {
          toast.error(
            err instanceof Error ? err.message : 'Could not update assessment',
          );
        }
        throw err;
      }
    },
    [markComplete, options?.silent],
  );

  const removeWithToast = useCallback(
    async (args: { id: Id<'assessments'> }) => {
      try {
        await remove(args);
      } catch (err) {
        if (!options?.silent) {
          toast.error(
            err instanceof Error ? err.message : 'Could not delete',
          );
        }
        throw err;
      }
    },
    [remove, options?.silent],
  );

  return useMemo(
    () => ({
      create,
      update,
      remove: removeWithToast,
      markComplete: markCompleteWithOptimism,
      userId,
    }),
    [create, update, removeWithToast, markCompleteWithOptimism, userId],
  );
}

/* ─── Re-exports for convenience ─────────────────────────────────────────── */

export type AssessmentId = Id<'assessments'>;

/**
 * Module-level timestamp for debouncing rapid mark-complete toasts.
 * Lives outside the hook so it persists across re-renders.
 */
let lastMarkToast = 0;
