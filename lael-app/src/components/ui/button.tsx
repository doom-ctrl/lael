import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

/**
 * Button — shadcn-style variant system.
 * Variants mirror the prototype's "primary forest green CTA" + ghost/outline.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md text-sm font-medium',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--color-accent-btn)] text-white',
          'hover:bg-accent-hover',
          'shadow-[0_2px_8px_var(--color-accent-btn-shadow)]',
        ].join(' '),
        destructive:
          'bg-danger text-white hover:bg-danger/90 shadow-[0_2px_8px_rgba(185,28,28,0.25)]',
        outline: [
          'border border-border bg-surface text-text-primary',
          'hover:bg-bg-warm hover:border-text-tertiary/40',
        ].join(' '),
        secondary: 'bg-bg-warm text-text-primary hover:bg-border/60',
        ghost: 'bg-transparent text-text-secondary hover:bg-bg-warm hover:text-text-primary',
        link: 'bg-transparent text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6 text-[15px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
