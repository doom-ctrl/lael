import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_TYPES,
  type AssessmentType,
  type Status,
} from '@/lib/design-tokens';

interface AssessmentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterType: AssessmentType | 'all';
  onFilterTypeChange: (value: AssessmentType | 'all') => void;
  filterStatus: Status | 'all';
  onFilterStatusChange: (value: Status | 'all') => void;
  typeCounts: Record<AssessmentType | 'all', number>;
  /** Whether to render the sticky variant (used inside the assessments page). */
  sticky?: boolean;
  className?: string;
}

const STATUS_FILTERS: Array<{ key: Status | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
];

/** Pill-shaped filter chip with optional count badge. */
function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-[11px] py-[5px] text-[12px] font-medium',
        'border transition-all duration-150',
        active
          ? 'border-[var(--color-accent-btn)] bg-[var(--color-accent-btn)] text-white shadow-[0_2px_8px_var(--color-accent-btn-shadow)]'
          : 'border-border bg-surface text-text-secondary hover:border-text-tertiary/50 hover:text-text-primary',
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'text-[10px] font-semibold',
            active ? 'text-white/80' : 'text-text-tertiary',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
      {children}
    </span>
  );
}

/**
 * AssessmentFilters — single-row filter bar (search + type + status chips).
 * When `sticky` is true, the bar pins below the navbar with a blur backdrop.
 */
export function AssessmentFilters({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  typeCounts,
  sticky = false,
  className,
}: AssessmentFiltersProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!sticky) return;
    const onScroll = () => {
      // Mirror the prototype: scrolled state activates once page scrolls past navbar (64px).
      setScrolled(window.scrollY > 64);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sticky]);

  const content = (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap items-center gap-4',
        sticky && [
          'sticky top-16 z-40 -mx-8 px-8 py-3.5',
          'bg-[var(--color-navbar-bg)] backdrop-blur-md',
          'transition-colors duration-200',
          scrolled ? 'border-b border-border' : 'border-b border-transparent',
        ],
        className,
      )}
    >
      {/* Search */}
      <div className="relative min-w-[240px] max-w-[480px] flex-1 basis-[320px]">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary"
          strokeWidth={1.4}
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or subject…"
          className="pl-9 pr-9 text-[12.5px]"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-tertiary hover:bg-bg-warm hover:text-text-primary"
          >
            <X className="h-3 w-3" strokeWidth={1.6} />
          </button>
        )}
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <GroupLabel>Type</GroupLabel>
        <FilterChip
          active={filterType === 'all'}
          onClick={() => onFilterTypeChange('all')}
          count={typeCounts.all}
        >
          All
        </FilterChip>
        {ASSESSMENT_TYPES.map((t) => (
          <FilterChip
            key={t}
            active={filterType === t}
            onClick={() => onFilterTypeChange(t)}
            count={typeCounts[t]}
          >
            {ASSESSMENT_TYPE_LABELS[t]}s
          </FilterChip>
        ))}
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <GroupLabel>Status</GroupLabel>
        {STATUS_FILTERS.map((s) => (
          <FilterChip
            key={s.key}
            active={filterStatus === s.key}
            onClick={() => onFilterStatusChange(s.key)}
          >
            {s.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );

  return content;
}
