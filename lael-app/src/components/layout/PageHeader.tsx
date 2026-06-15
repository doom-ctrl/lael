import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader — italic serif title, optional subtitle, right-aligned actions.
 * No page kicker label (those were removed in the design).
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-5',
        className,
      )}
    >
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="truncate whitespace-nowrap font-display text-[30px] font-normal italic text-text-primary tracking-[-0.02em] leading-[1.1]">
          {title}
        </h1>
        {subtitle && (
          <span className="pt-[3px] text-[13px] text-text-secondary">
            {subtitle}
          </span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
