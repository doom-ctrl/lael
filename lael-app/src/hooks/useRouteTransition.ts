import { useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

/**
 * `useRouteTransition` — fades content in on route change.
 *
 * Returns a CSS class to apply to a page wrapper. When the route
 * changes, the class briefly becomes `route-enter` (which animates
 * opacity from 0 → 1 over 200ms) and then reverts to a no-op class.
 *
 * Why: a gentle fade-in makes navigation feel like a smooth
 * transition rather than a hard cut. We keep the duration very
 * short (200ms) and disable the animation entirely when the user
 * prefers reduced motion (via CSS).
 *
 * The hook is intentionally a no-op on first render so the initial
 * page load doesn't flash. The fade kicks in only on subsequent
 * navigations.
 */
export function useRouteTransition(): string {
  const location = useLocation();
  const [phase, setPhase] = useState<'idle' | 'enter' | 'idle-2'>('idle');
  const lastPath = useRef(location.pathname);
  const isFirst = useRef(true);

  useEffect(() => {
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setPhase('enter');
    const t = window.setTimeout(() => setPhase('idle-2'), 220);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  return phase === 'enter' ? 'route-enter' : '';
}
