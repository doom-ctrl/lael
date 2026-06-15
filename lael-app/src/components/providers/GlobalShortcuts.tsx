import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

/**
 * `GlobalShortcuts` — mount-once component that registers the app's
 * keyboard shortcuts via `useGlobalShortcuts`. Renders no UI.
 *
 * Mounted as the element of a parent route in the router so it
 * lives exactly once for the whole app. Doesn't take children —
 * the parent route uses an `<Outlet />` next to it to render the
 * matched child.
 */
export function GlobalShortcuts() {
  useGlobalShortcuts();
  return null;
}
