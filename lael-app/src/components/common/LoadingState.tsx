import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'badge' | 'card' | 'row';
}

function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  const variantClass = {
    text: 'h-3.5 w-full',
    badge: 'h-5 w-16',
    card: 'h-32 w-full',
    row: 'h-14 w-full',
  }[variant];

  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-bg-warm',
        variantClass,
        className,
      )}
      {...props}
    />
  );
}

/**
 * LoadingState — skeleton loaders matching the row + card layout.
 * Use the `rows` variant for list views and the `cards` variant for grids.
 */
export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="row" />
      ))}
    </div>
  );
}

export function LoadingCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}

export { Skeleton };
