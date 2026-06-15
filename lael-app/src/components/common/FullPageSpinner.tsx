import { cn } from '@/lib/utils';

/**
 * FullPageSpinner — calm, branded loading state used while auth state
 * resolves on first render / page refresh.
 *
 * Renders the Lael wordmark in italic display serif (matching the navbar
 * logo) so the user sees a familiar face instead of a generic spinner.
 * The rotating ring is a subtle `border-t-accent` spinner — minimal, not
 * loud.
 */
export function FullPageSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center bg-bg',
        'text-text-primary',
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent"
          aria-hidden="true"
        />
        <span className="font-display text-lg font-normal italic tracking-[-0.02em] text-text-secondary">
          Lael
        </span>
      </div>
    </div>
  );
}
