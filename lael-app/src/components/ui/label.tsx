import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<'label'>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'block text-[11.5px] font-medium text-text-primary tracking-[0.01em]',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    )}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
