import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * AuthLayout — the shared shell for `/sign-in` and `/sign-up` pages.
 *
 * Renders a centered card on the warm cream background, with the Lael logo
 * above the card so the brand is visible without competing with the form.
 * Pages slot their title / form / footer link into the `children` slot.
 */
export function AuthLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10">
      {/* Logo */}
      <Link
        to="/"
        className="mb-6 flex items-center gap-2.5 text-text-primary no-underline"
        aria-label="Lael home"
      >
        <img src="/logo.svg" alt="" aria-hidden="true" className="h-9 w-9" />
        <span className="font-display text-2xl font-normal italic tracking-[-0.02em]">
          Lael
        </span>
      </Link>

      {/* Card */}
      <div
        className={cn(
          'w-full max-w-[420px] rounded-xl border border-border bg-surface p-7',
          'shadow-[0_12px_40px_rgba(28,25,23,0.08)]',
          className,
        )}
      >
        {children}
      </div>

      <p className="mt-5 text-[11px] text-text-tertiary">
        Assessments, organized. {new Date().getFullYear()}.
      </p>
    </div>
  );
}
