import * as React from 'react';
import { useRouteTransition } from '@/hooks/useRouteTransition';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * `PageTransition` — wraps a page's content and applies a brief
 * fade-in animation on route change. Uses `useRouteTransition` to
 * determine when to apply the `.route-enter` class.
 *
 * No-op on initial page load (the fade only fires when the user
 * navigates between pages). Disabled when the user prefers reduced
 * motion — see the CSS class definition in `index.css`.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const animClass = useRouteTransition();
  return <div className={cn(animClass, className)}>{children}</div>;
}
