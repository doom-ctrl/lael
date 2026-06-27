import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateFieldProps {
  /** `YYYY-MM-DD` (the format `<input type="date">` speaks). */
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  /** Optional aria-invalid styling. */
  invalid?: boolean;
  /** Disallow past dates when true (defaults to false — users can
   *  still backfill an old assessment they forgot to log). */
  disallowPast?: boolean;
  /** Show the quick-set chip row. Defaults to true. */
  showQuickSet?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

/**
 * DateField — a polished wrapper around the native `<input
 * type="date">`. Adds:
 *
 *   1. A calendar icon prefix for visual affordance
 *   2. An optional `min` constraint (no past dates)
 *   3. A row of "Today / Tomorrow / +1w / +1mo" quick-set chips so
 *      common cases are one tap instead of three clicks through
 *      the native date picker
 *
 * No third-party date library — the native picker is good enough,
 * and the chips cover the 80% case.
 */
export function DateField({
  value,
  onChange,
  onBlur,
  invalid,
  disallowPast = false,
  showQuickSet = true,
  className,
  id,
  name,
}: DateFieldProps) {
  const today = React.useMemo(() => toDateStr(new Date()), []);
  const min = disallowPast ? today : undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="relative">
        <CalendarIcon
          className={cn(
            'pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2',
            invalid ? 'text-danger' : 'text-text-tertiary',
          )}
          strokeWidth={1.5}
        />
        <Input
          id={id}
          name={name}
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid || undefined}
          // Extra left padding for the icon. Native date pickers vary
          // by browser — `pl-8` keeps the visual offset consistent.
          className="pl-8"
        />
      </div>

      {showQuickSet && (
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SETS.map((q) => {
            const target = offsetDate(new Date(), q.offsetDays);
            const targetStr = toDateStr(target);
            const active = value === targetStr;
            return (
              <button
                key={q.label}
                type="button"
                onClick={() => onChange(targetStr)}
                className={cn(
                  'rounded-md border px-2 py-[3px] text-[10.5px] font-medium',
                  'transition-colors duration-150',
                  active
                    ? 'border-accent-border bg-accent-light text-accent'
                    : 'border-border bg-surface text-text-secondary hover:border-accent-border hover:bg-accent-light hover:text-accent',
                )}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

const QUICK_SETS: Array<{ label: string; offsetDays: number }> = [
  { label: 'Today', offsetDays: 0 },
  { label: 'Tomorrow', offsetDays: 1 },
  { label: 'In a week', offsetDays: 7 },
  { label: 'In a month', offsetDays: 30 },
];

/** Local `Date` → `YYYY-MM-DD`. */
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function offsetDate(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
