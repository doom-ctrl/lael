import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary',
        'placeholder:text-text-tertiary',
        'transition-[border-color,box-shadow] duration-150',
        'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/10',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'resize-none',
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
