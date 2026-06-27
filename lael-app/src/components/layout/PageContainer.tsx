import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: number;
  /** When true, the container fills the viewport height (e.g. for the calendar). */
  fillHeight?: boolean;
}

/**
 * PageContainer — the standard 1500px-wide wrapper used by every page.
 * Provides consistent horizontal padding and vertical rhythm.
 */
export function PageContainer({
  children,
  className,
  maxWidth = 1500,
  fillHeight = false,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 pt-[14px] pb-10 sm:px-6 sm:pt-[18px] sm:pb-[60px] md:px-8',
        fillHeight && 'flex min-h-0 flex-1 flex-col',
        className,
      )}
      style={{ maxWidth }}
      {...props}
    >
      {children}
    </div>
  );
}
