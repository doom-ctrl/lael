import * as React from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { CalendarGrid, MONTHS } from '@/features/calendar/CalendarGrid';
import { useAssessmentsByMonth } from '@/features/assessments/useAssessments';
import { useAddAssessmentDialog } from '@/components/modals/AddAssessmentDialogProvider';
import { useUserPreferences } from '@/features/preferences/useUserPreferences';
import { cn, daysUntil, formatDateBadge, isOverdue } from '@/lib/utils';
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_TYPE_STYLES,
  PRIORITY_STYLES,
  STATUS_STYLES,
  type Assessment,
} from '@/lib/design-tokens';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { QueryError } from '@/components/common/QueryError';

/**
 * CalendarPage — full 6-week month view with a per-day side panel.
 *
 * Layout:
 *   ┌──────────────┬────────────────────────┐
 *   │  Day panel   │   Calendar grid        │  (lg+)
 *   │  (320px)     │   (flex-1)             │
 *   └──────────────┴────────────────────────┘
 *   On small screens the panel collapses to a drawer below the
 *   header so the grid stays the primary surface.
 *
 * State:
 *   - `month` / `year` — visible month in the grid
 *   - `selectedDay`    — the day highlighted in the grid AND shown
 *                        in the side panel. Defaults to today on
 *                        first mount.
 *
 * The `weekStart` preference is read from the user's saved prefs
 * and forwarded to the grid; column reordering happens there.
 */
export function CalendarPage() {
  // `today` is a stable reference for the lifetime of the page —
  // wrapping in useMemo keeps `selectedItems`'s dep array clean
  // (a fresh Date() on every render would invalidate the memo).
  // For "live" today tracking, use a setInterval or page-visibility
  // listener — out of scope for this phase.
  const today = React.useMemo(() => new Date(), []);
  const dialog = useAddAssessmentDialog();
  const { prefs } = useUserPreferences();

  const [month, setMonth] = React.useState(today.getMonth());
  const [year, setYear] = React.useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = React.useState<number | null>(
    today.getDate(),
  );

  const itemsInMonth = useAssessmentsByMonth(year, month);
  // Wrap the (loading | data) result in a memo so downstream memos
  // (e.g. `selectedItems`) don't get invalidated on every render
  // when Convex returns `undefined` for one tick.
  const itemsForRender = React.useMemo(
    () => itemsInMonth ?? [],
    [itemsInMonth],
  );

  const goToPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const goToNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setMonth(today.getMonth());
    setYear(today.getFullYear());
    setSelectedDay(today.getDate());
  };

  const pendingCount = itemsForRender.filter(
    (a) => a.status !== 'completed',
  ).length;
  const completedCount = itemsForRender.filter(
    (a) => a.status === 'completed',
  ).length;

  // Build the items for the selected day from the month's query
  // result. We re-read from `itemsForRender` rather than firing a
  // second Convex query so the panel is in sync with the grid.
  const selectedItems = React.useMemo(() => {
    if (selectedDay === null) return [];
    return itemsForRender
      .filter((it) => {
        const d = new Date(it.dueDate);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() === selectedDay
        );
      })
      .sort((a, b) => {
        // Overdue first, then by priority rank, then by title.
        const aOver = isOverdue(a.dueDate, a.status, today) ? 0 : 1;
        const bOver = isOverdue(b.dueDate, b.status, today) ? 0 : 1;
        if (aOver !== bOver) return aOver - bOver;
        const pr = { urgent: 0, high: 1, medium: 2, low: 3 };
        const pa = pr[a.priority] ?? 99;
        const pb = pr[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.title.localeCompare(b.title);
      });
  }, [itemsForRender, selectedDay, year, month, today]);

  return (
    <PageTransition className="flex h-dvh flex-col bg-bg text-text-primary">
      <Navbar />

      <PageContainer fillHeight className="pb-5">
        <PageHeader
          title={`${MONTHS[month]} ${year}`}
          subtitle={
            <span className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                />
                <span className="text-text-secondary">
                  <strong className="font-medium text-text-primary">
                    {pendingCount}
                  </strong>{' '}
                  pending
                </span>
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--color-success)' }}
                />
                <span className="text-text-secondary">
                  <strong className="font-medium text-text-primary">
                    {completedCount}
                  </strong>{' '}
                  completed
                </span>
              </span>
            </span>
          }
          actions={
            <>
              <button
                type="button"
                onClick={goToToday}
                className={cn(
                  'h-8 rounded-md border border-border bg-transparent px-3 text-[11px] font-medium',
                  'uppercase tracking-[0.08em] text-accent',
                  'transition-colors duration-150',
                  'hover:bg-accent-light hover:border-accent-border',
                )}
              >
                Today
              </button>
              <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-[2px]">
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label="Previous month"
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-transparent transition-colors hover:bg-bg-warm"
                >
                  <ChevronLeft
                    className="h-3 w-3 text-text-secondary"
                    strokeWidth={1.6}
                  />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next month"
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-transparent transition-colors hover:bg-bg-warm"
                >
                  <ChevronRight
                    className="h-3 w-3 text-text-secondary"
                    strokeWidth={1.6}
                  />
                </button>
              </div>
            </>
          }
        />

        <div className="mt-2 flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
          <ErrorBoundary
            fallback={({ error, reset }) => (
              <QueryError error={error} onRetry={reset} className="flex-1" />
            )}
          >
          {/* ─── Day-detail side panel ─────────────────────────────── */}
          <DayDetailPanel
            year={year}
            month={month}
            selectedDay={selectedDay}
            items={selectedItems}
            today={today}
            onAdd={() => dialog.open()}
            onItemClick={(it) => dialog.openEdit(it)}
            onClose={() => setSelectedDay(null)}
          />

          {/* ─── Calendar grid ─────────────────────────────────────── */}
          <CalendarGrid
            year={year}
            month={month}
            items={itemsForRender}
            today={today}
            selectedDay={selectedDay}
            onDayClick={setSelectedDay}
            onItemClick={(it) => dialog.openEdit(it)}
            weekStart={prefs.weekStart}
            className="lg:flex-1"
          />
          </ErrorBoundary>
        </div>
      </PageContainer>
    </PageTransition>
  );
}

/* ─── Day detail panel ──────────────────────────────────────────────────── */

interface DayDetailPanelProps {
  year: number;
  month: number;
  selectedDay: number | null;
  items: Assessment[];
  today: Date;
  onAdd: () => void;
  onItemClick: (item: Assessment) => void;
  onClose: () => void;
}

/**
 * Side panel showing the assessments for the currently selected day.
 * Renders nothing useful when no day is selected (an empty-state
 * prompt to click a day).
 */
function DayDetailPanel({
  year,
  month,
  selectedDay,
  items,
  today,
  onAdd,
  onItemClick,
  onClose,
}: DayDetailPanelProps) {
  if (selectedDay === null) {
    return (
      <aside
        className={cn(
          'flex w-full flex-shrink-0 flex-col overflow-hidden rounded-2xl',
          'border border-border bg-surface shadow-soft lg:w-[320px]',
        )}
      >
        <PanelHeader
          title="No day selected"
          subtitle="Click a day in the calendar to see what's due."
          onClose={null}
        />
        <div className="flex flex-1 items-center justify-center px-5 py-10 text-center">
          <div>
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg-warm text-text-tertiary">
              <Clock className="h-4 w-4" strokeWidth={1.4} />
            </div>
            <p className="font-display text-[14px] italic text-text-secondary">
              Pick a day to view its items.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const date = new Date(year, month, selectedDay);
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
    selectedDay,
  ).padStart(2, '0')}`;

  return (
    <aside
      className={cn(
        'flex w-full flex-shrink-0 flex-col overflow-hidden rounded-2xl',
        'border border-border bg-surface shadow-soft lg:w-[320px]',
      )}
    >
      <PanelHeader
        title={date.toLocaleDateString('en', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
        subtitle={
          isToday
            ? 'Today'
            : daysUntil(dateStr, today)
        }
        onClose={onClose}
        highlight={isToday}
      />

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {items.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="mb-3 font-display text-[14px] italic text-text-secondary">
              Nothing scheduled.
            </p>
            <button
              type="button"
              onClick={onAdd}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md',
                'border border-border bg-surface px-3 py-1.5',
                'text-[11px] font-medium text-text-secondary',
                'transition-colors hover:bg-bg-warm hover:text-text-primary',
              )}
            >
              <Plus className="h-3 w-3" strokeWidth={1.6} />
              Add for this day
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <DayItemCard
                key={item.id}
                item={item}
                onClick={() => onItemClick(item)}
                today={today}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer — Add for this day */}
      {items.length > 0 && (
        <div className="border-t border-border-light px-3 py-2.5">
          <button
            type="button"
            onClick={onAdd}
            className={cn(
              'flex w-full items-center justify-center gap-1.5 rounded-md',
              'border border-border bg-surface py-1.5',
              'text-[11px] font-medium text-text-secondary',
              'transition-colors hover:bg-bg-warm hover:text-text-primary',
            )}
          >
            <Plus className="h-3 w-3" strokeWidth={1.6} />
            Add assessment
          </button>
        </div>
      )}
    </aside>
  );
}

function PanelHeader({
  title,
  subtitle,
  onClose,
  highlight = false,
}: {
  title: string;
  subtitle?: string;
  onClose: (() => void) | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-2 border-b border-border-light px-4 py-3',
        highlight && 'bg-accent-light',
      )}
    >
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'truncate font-display text-[15px] font-normal italic tracking-[-0.01em]',
            highlight ? 'text-accent' : 'text-text-primary',
          )}
        >
          {title}
        </div>
        {subtitle && (
          <div className="mt-0.5 text-[10.5px] uppercase tracking-[0.08em] text-text-tertiary">
            {subtitle}
          </div>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close day panel"
          className={cn(
            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md',
            'bg-transparent text-text-tertiary',
            'transition-colors hover:bg-bg-warm hover:text-text-primary',
          )}
        >
          <X className="h-3 w-3" strokeWidth={1.6} />
        </button>
      )}
    </div>
  );
}

/* ─── Day item card ─────────────────────────────────────────────────────── */

function DayItemCard({
  item,
  onClick,
  today,
}: {
  item: Assessment;
  onClick: () => void;
  today: Date;
}) {
  const typeStyle = ASSESSMENT_TYPE_STYLES[item.type];
  const priorityStyle = PRIORITY_STYLES[item.priority];
  const overdue = isOverdue(item.dueDate, item.status, today);
  const completed = item.status === 'completed';
  const status = overdue ? 'overdue' : item.status;
  const statusStyle = STATUS_STYLES[status];

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'group flex w-full items-start gap-2.5 rounded-[9px] border p-2.5 text-left',
          'border-border-light bg-surface',
          'transition-all duration-150',
          'hover:border-accent-border hover:bg-surface-alt hover:shadow-soft',
          completed && 'opacity-60',
        )}
      >
        {/* Date badge — day number in a small square */}
        <div
          className={cn(
            'flex h-9 w-9 flex-shrink-0 flex-col items-center justify-center rounded-md border',
            overdue ? 'border-danger-border bg-danger-light' : 'border-border-light bg-bg-warm',
          )}
        >
          <span
            className={cn(
              'text-[7.5px] font-bold uppercase leading-[1.2] tracking-[0.08em]',
              overdue ? 'text-danger' : 'text-text-tertiary',
            )}
          >
            {formatDateBadge(item.dueDate).month}
          </span>
          <span
            className={cn(
              'font-display text-[14px] font-normal leading-[1.1]',
              overdue ? 'text-danger' : 'text-text-primary',
            )}
          >
            {formatDateBadge(item.dueDate).day}
          </span>
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="mb-1 flex items-center gap-1.5">
            <span
              className={cn(
                'rounded-full px-[6px] py-[1px] text-[8.5px] font-semibold uppercase tracking-[0.06em]',
                'border',
              )}
              style={{
                background: typeStyle.bg,
                color: typeStyle.color,
                borderColor: typeStyle.border,
              }}
            >
              {ASSESSMENT_TYPE_LABELS[item.type]}
            </span>
            <span
              className="rounded-full px-[6px] py-[1px] text-[8.5px] font-semibold uppercase tracking-[0.06em]"
              style={{ background: priorityStyle.bg, color: priorityStyle.color }}
            >
              {priorityStyle.label}
            </span>
          </div>
          <div
            className={cn(
              'truncate font-display text-[13px] italic text-text-primary',
              completed && 'text-decoration-line-through opacity-60',
            )}
            title={item.title}
          >
            {item.title}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-text-tertiary">
            <MapPin className="h-2.5 w-2.5" strokeWidth={1.4} />
            <span className="truncate">{item.subject}</span>
          </div>
        </div>

        {/* Status badge */}
        <span
          className="flex-shrink-0 whitespace-nowrap rounded-full border px-[7px] py-[1px] text-[9.5px] font-medium"
          style={{
            background: statusStyle.bg,
            color: statusStyle.color,
            borderColor: statusStyle.border,
          }}
        >
          {statusStyle.label}
        </span>
      </button>
    </li>
  );
}
