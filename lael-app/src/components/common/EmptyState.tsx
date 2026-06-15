import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Dashed-bordered illustration panel used when there's no data
 * (e.g. no assessments yet, no completed items, etc.).
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel = 'Add Assessment',
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-[14px] border-[1.5px] border-dashed border-border',
        'bg-surface px-8 py-[60px] text-center',
        className,
      )}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-text-tertiary opacity-60">
        {icon}
      </div>
      <h3 className="mb-2 font-display text-xl italic text-text-primary tracking-[-0.01em]">
        {title}
      </h3>
      <p className="mx-auto mb-6 max-w-[400px] text-[13.5px] text-text-secondary">
        {description}
      </p>
      {onAction && (
        <Button onClick={onAction}>
          <Plus className="h-3 w-3" strokeWidth={1.8} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
