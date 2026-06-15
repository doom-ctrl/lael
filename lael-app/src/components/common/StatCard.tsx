import { cn } from '@/lib/utils';

export interface StatCardData {
  label: string;
  value: number | string;
  /** Top accent line + value text color. */
  color: string;
  /** Optional secondary line of text under the value. */
  hint?: string;
}

interface StatCardProps extends StatCardData {
  className?: string;
}

/**
 * StatCard — compact metric tile with a 2px top accent line.
 * Matches the prototype's dashboard inline stat card (12-14px padding,
 * 30px italic serif value, 2px accent). Used in the dashboard spotlight row.
 */
export function StatCard({ label, value, color, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-1 flex-col overflow-hidden rounded-xl',
        'border border-border-light bg-surface px-[14px] py-3 shadow-soft',
        className,
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: color }}
      />
      <div
        className="mb-1.5 mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-text-tertiary"
      >
        {label}
      </div>
      <div
        className="font-display text-[30px] font-normal italic leading-none tracking-[-0.02em]"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
