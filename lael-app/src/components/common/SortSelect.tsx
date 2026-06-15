import { cn } from '@/lib/utils';

export type SortKey = 'due' | 'priority' | 'title';

const SORT_LABELS: Record<SortKey, string> = {
  due: 'Due Date',
  priority: 'Priority',
  title: 'A–Z',
};

interface SortSelectProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
  className?: string;
}

/**
 * SortSelect — compact native <select> styled to match the prototype.
 * Triggered with the leading "Sort:" prefix baked in for clarity.
 */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      className={cn(
        'h-8 cursor-pointer rounded-lg border border-border bg-surface px-2.5 text-[12px] text-text-primary',
        'transition-[border-color,box-shadow] duration-150',
        'focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/10',
        className,
      )}
    >
      <option value="due">Sort: {SORT_LABELS.due}</option>
      <option value="priority">Sort: {SORT_LABELS.priority}</option>
      <option value="title">Sort: {SORT_LABELS.title}</option>
    </select>
  );
}

export { SORT_LABELS };
