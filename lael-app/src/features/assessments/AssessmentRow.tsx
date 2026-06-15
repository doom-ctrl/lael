import * as React from 'react';
import { Check, MoreHorizontal, Pencil } from 'lucide-react';
import { cn, daysUntil, formatDateBadge, isOverdue } from '@/lib/utils';
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_TYPE_STYLES,
  PRIORITY_STYLES,
  STATUS_STYLES,
  type Assessment,
} from '@/lib/design-tokens';

interface AssessmentRowProps {
  item: Assessment;
  onToggleComplete?: (item: Assessment, completed: boolean) => void;
  onEdit?: (item: Assessment) => void;
  className?: string;
}

/**
 * AssessmentRow — the compact list-view row.
 * Layout: checkbox · date badge · title+meta · status pill · hover actions.
 */
export function AssessmentRow({
  item,
  onToggleComplete,
  onEdit,
  className,
}: AssessmentRowProps) {
  const [hovered, setHovered] = React.useState(false);
  const [checked, setChecked] = React.useState(item.status === 'completed');

  const dateBadge = formatDateBadge(item.dueDate);
  const overdue = isOverdue(item.dueDate, item.status);
  const completed = item.status === 'completed' || checked;

  const typeStyle = ASSESSMENT_TYPE_STYLES[item.type];
  const priorityStyle = PRIORITY_STYLES[item.priority];
  const statusStyle = STATUS_STYLES[overdue ? 'overdue' : item.status];

  // Visual hue of the date badge + accent text color.
  const badgeBg = completed
    ? 'bg-success-light'
    : overdue
      ? 'bg-danger-light'
      : 'bg-accent-light';
  const badgeBorder = completed
    ? 'border-accent-border'
    : overdue
      ? 'border-danger-border'
      : 'border-accent-border';
  const badgeColor = completed
    ? 'text-success'
    : overdue
      ? 'text-danger'
      : 'text-accent';

  const handleCheckToggle: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    const next = !checked;
    setChecked(next);
    onToggleComplete?.(item, next);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group flex items-center gap-4 rounded-[10px] px-[14px] py-[9px] cursor-pointer',
        'border transition-all duration-200',
        hovered
          ? 'border-border bg-surface-alt shadow-soft'
          : 'border-border-light bg-surface',
        completed && 'opacity-60',
        className,
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleCheckToggle}
        aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
        className={cn(
          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md',
          'border-[1.5px] transition-all duration-150',
          checked
            ? 'border-accent bg-accent'
            : 'border-border bg-transparent hover:border-text-tertiary',
        )}
      >
        {checked && (
          <Check className="h-3 w-3 text-white" strokeWidth={2.4} />
        )}
      </button>

      {/* Date badge */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-[9px] border',
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

      {/* Title + meta */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="mb-[2px] flex items-center gap-2">
          <span
            className={cn(
              'truncate whitespace-nowrap font-display text-[14px] italic text-text-primary',
              completed && 'text-decoration-line-through opacity-50',
            )}
          >
            {item.title}
          </span>
          <span
            className="flex-shrink-0 rounded-full px-[7px] py-[1px] text-[9px] font-semibold uppercase tracking-[0.06em]"
            style={{ background: priorityStyle.bg, color: priorityStyle.color }}
          >
            {priorityStyle.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
          <span
            className="rounded-full px-[7px] py-[1px] text-[9px] font-semibold uppercase tracking-[0.05em]"
            style={{ background: typeStyle.bg, color: typeStyle.color }}
          >
            {ASSESSMENT_TYPE_LABELS[item.type]}
          </span>
          <span className="text-border">·</span>
          <span>{item.subject}</span>
          <span className="text-border">·</span>
          <span
            className={cn(
              overdue ? 'font-medium text-danger' : 'text-text-tertiary',
            )}
          >
            {daysUntil(item.dueDate)}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <span
        className="flex-shrink-0 whitespace-nowrap rounded-full border px-[10px] py-[3px] text-[10.5px] font-medium"
        style={{
          background: statusStyle.bg,
          color: statusStyle.color,
          borderColor: statusStyle.border,
        }}
      >
        {statusStyle.label}
      </span>

      {/* Hover actions */}
      <div
        className={cn(
          'flex flex-shrink-0 gap-1 transition-opacity duration-150',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
      >
        <button
          type="button"
          title="Edit"
          aria-label="Edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(item);
          }}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md',
            'border border-border bg-surface text-text-secondary',
            'transition-colors hover:bg-bg-warm',
          )}
        >
          <Pencil className="h-[11px] w-[11px]" strokeWidth={1.2} />
        </button>
        <button
          type="button"
          title="More actions"
          aria-label="More actions"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md',
            'border border-border bg-surface text-text-tertiary',
            'transition-colors hover:bg-bg-warm',
          )}
        >
          <MoreHorizontal className="h-3 w-3" strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
