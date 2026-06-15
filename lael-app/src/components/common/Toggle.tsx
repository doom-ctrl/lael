import { cn } from '@/lib/utils';

interface ToggleProps {
  on: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Toggle — iOS-style pill switch.
 * 32px wide, 18px tall, 14px circle that slides 14px when on.
 * Track color: `border` when off, `accent` when on.
 */
export function Toggle({
  on,
  onChange,
  disabled = false,
  ariaLabel,
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn(
        'relative h-[18px] w-8 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200',
        on ? 'bg-accent' : 'bg-border',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] left-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)]',
          'transition-transform duration-200',
          on && 'translate-x-[14px]',
        )}
      />
    </button>
  );
}
