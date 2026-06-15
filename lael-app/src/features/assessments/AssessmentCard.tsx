import * as React from 'react';
import { cn, daysUntil, formatDateBadge, isOverdue } from '@/lib/utils';
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_TYPE_STYLES,
  PRIORITY_STYLES,
  type Assessment,
} from '@/lib/design-tokens';

interface AssessmentCardProps {
  item: Assessment;
  onClick?: (item: Assessment) => void;
  className?: string;
}

/**
 * AssessmentCard — the grid-view card.
 * Visually anchored by a 3px top accent line in the priority color.
 */
export function AssessmentCard({
  item,
  onClick,
  className,
}: AssessmentCardProps) {
  const [hovered, setHovered] = React.useState(false);

  const dateBadge = formatDateBadge(item.dueDate);
  const overdue = isOverdue(item.dueDate, item.status);
  const completed = item.status === 'completed';

  const typeStyle = ASSESSMENT_TYPE_STYLES[item.type];
  const priorityStyle = PRIORITY_STYLES[item.priority];

  const badgeBg = completed
    ? 'bg-success-light'
    : overdue
      ? 'bg-danger-light'
      : 'bg-accent-light';
  const badgeBorder = overdue ? 'border-danger-border' : 'border-accent-border';
  const badgeColor = completed
    ? 'text-success'
    : overdue
      ? 'text-danger'
      : 'text-accent';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(item)}
      className={cn(
        'relative flex cursor-pointer flex-col gap-2.5 overflow-hidden rounded-[10px] border bg-surface p-[14px]',
        'transition-all duration-200',
        hovered
          ? 'border-border bg-surface-alt shadow-soft'
          : 'border-border-light',
        completed && 'opacity-60',
        className,
      )}
    >
      {/* Top priority accent line */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: priorityStyle.color }}
      />

      {/* Date badge + priority pill row */}
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 flex-col items-center justify-center rounded-[9px] border',
            badgeBg,
            badgeBorder,
          )}
        >
          <span
            className={cn(
              'text-[8px] font-bold uppercase leading-[1.2] tracking-[0.08em]',
              badgeColor,
            )}
          >
            {dateBadge.month}
          </span>
          <span
            className={cn(
              'font-display text-[17px] font-normal leading-[1.1]',
              badgeColor,
            )}
          >
            {dateBadge.day}
          </span>
        </div>
        <span
          className="rounded-full px-[7px] py-[2px] text-[9px] font-semibold uppercase tracking-[0.06em]"
          style={{ background: priorityStyle.bg, color: priorityStyle.color }}
        >
          {priorityStyle.label}
        </span>
      </div>

      {/* Title */}
      <h3
        className={cn(
          'm-0 font-display text-[15px] font-normal italic leading-[1.3] tracking-[-0.01em] text-text-primary',
          completed && 'text-decoration-line-through opacity-60',
        )}
      >
        {item.title}
      </h3>

      {/* Type pill + due */}
      <div className="flex items-center gap-[6px] text-[11px] text-text-tertiary">
        <span
          className="rounded-full px-[7px] py-[1px] text-[9px] font-semibold uppercase tracking-[0.05em]"
          style={{ background: typeStyle.bg, color: typeStyle.color }}
        >
          {ASSESSMENT_TYPE_LABELS[item.type]}
        </span>
        <span
          className={cn(overdue ? 'font-medium text-danger' : 'text-text-tertiary')}
        >
          {daysUntil(item.dueDate)}
        </span>
      </div>
    </div>
  );
}
