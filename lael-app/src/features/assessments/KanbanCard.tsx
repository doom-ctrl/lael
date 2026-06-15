import { cn, daysUntil, isOverdue } from '@/lib/utils';
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_TYPE_STYLES,
  PRIORITY_STYLES,
  type Assessment,
} from '@/lib/design-tokens';

interface KanbanCardProps {
  item: Assessment;
  onClick?: (item: Assessment) => void;
  className?: string;
}

/**
 * KanbanCard — the more compact card used inside kanban columns.
 * Shows a priority dot + type label on top, then the title + meta.
 */
export function KanbanCard({
  item,
  onClick,
  className,
}: KanbanCardProps) {
  const typeStyle = ASSESSMENT_TYPE_STYLES[item.type];
  const priorityStyle = PRIORITY_STYLES[item.priority];
  const overdue = isOverdue(item.dueDate, item.status);

  return (
    <div
      onClick={() => onClick?.(item)}
      className={cn(
        'mb-1.5 cursor-pointer rounded-lg border border-border-light bg-surface p-[10px] last:mb-0',
        'transition-all duration-150 hover:bg-surface-alt hover:border-border',
        className,
      )}
    >
      {/* Top row: priority dot + type label */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
          style={{ background: priorityStyle.color }}
        />
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.05em]"
          style={{ color: typeStyle.color }}
        >
          {ASSESSMENT_TYPE_LABELS[item.type]}
        </span>
      </div>

      {/* Title */}
      <h4 className="m-0 font-display text-[13px] font-normal italic leading-[1.3] text-text-primary">
        {item.title}
      </h4>

      {/* Meta */}
      <div
        className={cn(
          'mt-1 text-[10.5px]',
          overdue ? 'font-medium text-danger' : 'text-text-tertiary',
        )}
      >
        {item.subject} · {daysUntil(item.dueDate)}
      </div>
    </div>
  );
}
