import * as React from 'react';
import { cn, isOverdue } from '@/lib/utils';
import {
  ASSESSMENT_TYPE_STYLES,
  type Assessment,
  type WeekStart,
} from '@/lib/design-tokens';

const DAYS_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  /** Items to show on the grid — only those in `month`/`year` will be displayed. */
  items: Assessment[];
  /** Reference "today" — used for highlight + overdue computation. */
  today?: Date;
  onDayClick?: (day: number) => void;
  /** Click handler for a specific assessment pill — typically opens
   *  the edit dialog. */
  onItemClick?: (item: Assessment) => void;
  selectedDay?: number | null;
  /** First day of the calendar week. Defaults to `sunday` (US
   *  convention); pass `'monday'` for ISO / European style. */
  weekStart?: WeekStart;
  className?: string;
}

interface DayCell {
  day: number;
  /** Which calendar month this cell belongs to. */
  month: number;
  year: number;
  isCurrentMonth: boolean;
  items: Assessment[];
}

/**
 * Reorder the 7-day header based on the user's `weekStart` choice.
 * `weekStart === 'sunday'` returns the canonical Sun-first order;
 * `'monday'` rotates so Monday lands at index 0.
 */
function dayHeaders(weekStart: WeekStart): string[] {
  if (weekStart === 'sunday') return [...DAYS_FULL];
  return [...DAYS_FULL.slice(1), DAYS_FULL[0]];
}

/** Same rotation, but the short form for tight layouts. */
function dayHeadersShort(weekStart: WeekStart): string[] {
  if (weekStart === 'sunday') return [...DAYS_SHORT];
  return [...DAYS_SHORT.slice(1), DAYS_SHORT[0]];
}

/**
 * CalendarGrid — full 6-week month view.
 * Fills its parent vertically; designed for fit-in-viewport pages.
 *
 * The grid is built around JavaScript's `getDay()` convention
 * (0 = Sunday, 6 = Saturday). When `weekStart === 'monday'` we
 * remap the leading-blank count and the post-rotation cell
 * indexing so Monday is always the leftmost column.
 */
export function CalendarGrid({
  year,
  month,
  items,
  today = new Date(),
  onDayClick,
  onItemClick,
  selectedDay = null,
  weekStart = 'sunday',
  className,
}: CalendarGridProps) {
  // Bucket items by (y, m, d) — we use this rather than just day-of-
  // month so trailing/leading cells of adjacent months don't grab
  // items that don't belong to them visually.
  const itemsByDay = React.useMemo(() => {
    const map = new Map<number, Assessment[]>();
    items.forEach((item) => {
      const d = new Date(item.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const arr = map.get(day) ?? [];
        arr.push(item);
        map.set(day, arr);
      }
    });
    return map;
  }, [items, year, month]);

  // Build a 6×7 grid (always 6 weeks to keep height stable).
  // The first column is whichever day the user has chosen as
  // week-start, but the underlying calendar math is the same.
  const rows: DayCell[][] = React.useMemo(() => {
    // `jsDow` is 0 (Sun) … 6 (Sat). Convert to the user's grid
    // index: 0 = leftmost column.
    const jsFirstDow = new Date(year, month, 1).getDay();
    const leadingBlanks =
      weekStart === 'sunday' ? jsFirstDow : (jsFirstDow + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    const cells: DayCell[] = [];
    // Leading days from previous month.
    for (let i = leadingBlanks - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        items: [],
      });
    }
    // Current month.
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        month,
        year,
        isCurrentMonth: true,
        items: itemsByDay.get(d) ?? [],
      });
    }
    // Trailing days from next month.
    let next = 1;
    while (cells.length < 42) {
      cells.push({
        day: next++,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        items: [],
      });
    }

    return Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  }, [year, month, itemsByDay, weekStart]);

  const headers = dayHeaders(weekStart);
  const isSameDay = (cell: DayCell) =>
    cell.isCurrentMonth &&
    cell.year === today.getFullYear() &&
    cell.month === today.getMonth() &&
    cell.day === today.getDate();

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl',
        'border border-border bg-surface shadow-soft',
        className,
      )}
    >
      {/* Day-of-week header */}
      <div className="grid flex-shrink-0 grid-cols-7 border-b border-border bg-bg-warm">
        {headers.map((d, i) => {
          // Highlight weekend columns only when the week starts on
          // Sunday (Sat/Sun are at the ends). For Mon-start grids
          // the ends are Mon/Sun, not Sat/Sun, so the styling
          // follows the actual day-of-week, not the column index.
          const isWeekendLabel =
            weekStart === 'sunday'
              ? i === 0 || i === 6
              : d === 'Sunday' || d === 'Saturday';
          return (
            <div
              key={d}
              className={cn(
                'py-3 text-center text-[10.5px] font-semibold uppercase tracking-[0.12em]',
                isWeekendLabel ? 'text-text-tertiary' : 'text-text-secondary',
                i < 6 && 'border-r border-border-light',
              )}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* 6-week grid */}
      <div className="flex min-h-0 flex-1 flex-col">
        {rows.map((week, weekIdx) => (
          <div
            key={weekIdx}
            className={cn(
              'grid min-h-0 flex-1 grid-cols-7',
              weekIdx < 5 && 'border-b border-border-light',
            )}
          >
            {week.map((cell, dowIdx) => {
              const isToday = isSameDay(cell);
              const isSelected =
                selectedDay !== null &&
                cell.isCurrentMonth &&
                cell.day === selectedDay;
              const hasItems = cell.items.length > 0;
              const hasOverdue = cell.items.some((i) =>
                isOverdue(i.dueDate, i.status, today),
              );

              return (
                <div
                  key={dowIdx}
                  onClick={() =>
                    cell.isCurrentMonth && onDayClick?.(cell.day)
                  }
                  className={cn(
                    'cal-cell group flex cursor-pointer flex-col overflow-hidden p-[10px] transition-all duration-150',
                    'border-r border-border-light last:border-r-0',
                    cell.isCurrentMonth
                      ? 'bg-surface hover:bg-surface-alt hover:border-accent-border'
                      : 'bg-bg-warm text-text-tertiary hover:bg-border-light',
                    isToday &&
                      'bg-accent-light border-2 border-accent shadow-[inset_0_0_0_1px_var(--color-accent)] hover:bg-[#DCFCE7]',
                    isSelected && !isToday && 'shadow-[inset_0_0_0_2px_var(--color-accent)]',
                    hasOverdue && 'border-l-[3px] border-l-danger',
                  )}
                  style={{ borderRightWidth: dowIdx < 6 ? 1 : 0 }}
                >
                  {/* Day number header */}
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={cn(
                        'font-display text-[19px] leading-none',
                        isToday
                          ? 'font-semibold text-accent'
                          : cell.isCurrentMonth
                            ? 'font-normal text-text-primary'
                            : 'font-normal text-text-tertiary',
                      )}
                    >
                      {cell.day}
                    </span>
                    {isToday && (
                      <span
                        className={cn(
                          'rounded-[10px] bg-accent-border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-accent',
                        )}
                      >
                        TODAY
                      </span>
                    )}
                    {!isToday && hasItems && cell.isCurrentMonth && (
                      <span className="text-[9px] font-medium text-text-tertiary">
                        {cell.items.length}{' '}
                        {cell.items.length === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>

                  {/* Assessment pills */}
                  {hasItems && cell.isCurrentMonth && (
                    <div className="flex min-h-0 flex-col gap-1 overflow-hidden">
                      {cell.items.slice(0, 3).map((item) => {
                        const typeStyle = ASSESSMENT_TYPE_STYLES[item.type];
                        const isCompleted = item.status === 'completed';
                        return (
                          <div
                            key={item.id}
                            role={onItemClick ? 'button' : undefined}
                            tabIndex={onItemClick ? 0 : undefined}
                            onClick={() => onItemClick?.(item)}
                            onKeyDown={(e) => {
                              if (!onItemClick) return;
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onItemClick(item);
                              }
                            }}
                            className={cn(
                              'truncate rounded-[5px] px-2 py-1 text-[11px] font-medium',
                              'border-l-2',
                              isCompleted && 'text-decoration-line-through opacity-60',
                              onItemClick && 'cursor-pointer transition-opacity hover:opacity-80',
                            )}
                            style={{
                              background: typeStyle.bg,
                              color: typeStyle.color,
                              borderLeftColor: typeStyle.color,
                            }}
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        );
                      })}
                      {cell.items.length > 3 && (
                        <div className="pl-0.5 font-display text-[10.5px] italic text-text-tertiary">
                          +{cell.items.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export { MONTHS, dayHeadersShort };
