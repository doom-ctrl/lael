import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  disabled?: boolean;
  className?: string;
}

/**
 * SegmentedControl — pill-shaped segmented control.
 * Smaller than ViewToggle (for inline use inside setting rows).
 */
export function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'flex items-center gap-px rounded-md border border-border bg-bg-warm p-[2px]',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      {options.map((o) => {
        const isActive = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-[5px] border-none px-[11px] py-[4px] text-[11px] font-medium',
              'transition-all duration-150',
              isActive
                ? 'bg-surface text-accent shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                : 'bg-transparent text-text-secondary hover:text-text-primary',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
