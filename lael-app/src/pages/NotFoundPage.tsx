import { Link } from 'react-router-dom';

/**
 * NotFoundPage — calm 404. Lives outside the protected route group so it's
 * reachable from any path; uses the same warm cream surface as the rest of
 * the app for visual consistency.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
      <div className="text-center">
        <p className="mb-1 font-display text-[64px] font-normal italic leading-none tracking-[-0.04em] text-text-tertiary">
          404
        </p>
        <h1 className="mb-2 font-display text-2xl font-normal italic tracking-[-0.02em] text-text-primary">
          Page not found
        </h1>
        <p className="mb-5 text-[13px] text-text-secondary">
          The page you were looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 text-[13px] font-medium text-white no-underline shadow-[0_2px_8px_rgba(22,101,52,0.25)] transition-colors hover:bg-accent-hover"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
