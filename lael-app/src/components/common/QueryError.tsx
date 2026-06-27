import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueryErrorProps {
  /** The error thrown by the query — its message is shown to the user. */
  error: Error | null;
  /**
   * Optional retry callback. If omitted, "Try again" does a hard
   * page reload (the only way to actually re-run a Convex query that
   * the React tree cached in error state).
   */
  onRetry?: () => void;
  /** Title override. */
  title?: string;
  className?: string;
}

/**
 * QueryError — small, calm error fallback for a single query.
 *
 * Used inside a page to recover from a thrown Convex query without
 * unmounting the whole app. The Retry button calls `onRetry` if
 * provided, otherwise falls back to `location.reload()` which is
 * the only reliable way to clear Convex's error cache.
 *
 * For mutation errors we use sonner's `action` button on the toast
 * — see `useAssessments.ts`.
 */
export function QueryError({
  error,
  onRetry,
  title = 'Couldn’t load this',
  className,
}: QueryErrorProps) {
  const handleClick = () => {
    if (onRetry) onRetry();
    else window.location.reload();
  };

  return (
    <div
      className={
        'flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-10 text-center ' +
        (className ?? '')
      }
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-danger-light text-danger">
        <AlertTriangle className="h-4 w-4" strokeWidth={1.6} />
      </div>
      <h3 className="mb-1.5 font-display text-[18px] italic text-text-primary tracking-[-0.01em]">
        {title}
      </h3>
      <p className="mb-4 max-w-[420px] text-[12.5px] text-text-secondary">
        {error?.message ?? 'An unexpected error occurred.'}
      </p>
      <Button variant="outline" onClick={handleClick}>
        <RotateCw className="h-3 w-3" strokeWidth={1.6} />
        Try again
      </Button>
    </div>
  );
}
