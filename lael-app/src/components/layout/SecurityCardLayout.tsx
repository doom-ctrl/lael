import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';

/**
 * SecurityCardLayout — centered card for authenticated security flows
 * (change password, change email, etc).
 *
 * Mirrors the `AuthLayout` look (centered card on the warm cream
 * background) but with the `Navbar` instead of the brand logo, and a
 * back link to Settings at the top of the card so the user always
 * knows how to bail.
 *
 * The card uses the same max-width as `AuthLayout` so the visual
 * language matches the sign-in / sign-up screens — the user has just
 * done a sensitive action and we don't want the page to feel like a
 * different product.
 */
interface SecurityCardLayoutProps {
  /** Card title shown as the italic-serif header inside the card. */
  title: string;
  /** Short description under the title. */
  description?: string;
  /** Path to navigate to from the back link (defaults to `/settings`). */
  backTo?: string;
  /** Back-link label. Defaults to "Settings". */
  backLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function SecurityCardLayout({
  title,
  description,
  backTo = '/settings',
  backLabel = 'Settings',
  children,
  className,
}: SecurityCardLayoutProps) {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center px-4 pb-10 pt-12 sm:pt-16">
        <div
          className={cn(
            'w-full max-w-[420px] rounded-xl border border-border bg-surface p-7',
            'shadow-[0_12px_40px_rgba(28,25,23,0.08)]',
            className,
          )}
        >
          <Link
            to={backTo}
            className="mb-4 inline-flex items-center gap-1 text-[11.5px] text-text-tertiary no-underline hover:text-text-secondary"
          >
            <ChevronLeft className="h-3 w-3" strokeWidth={1.6} />
            Back to {backLabel}
          </Link>
          <header className="mb-5 text-center">
            <h1 className="mb-1 font-display text-[24px] font-normal italic leading-tight tracking-[-0.02em] text-text-primary">
              {title}
            </h1>
            {description && (
              <p className="text-[12.5px] text-text-secondary">{description}</p>
            )}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
