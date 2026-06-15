import { useEffect, useState } from 'react';
import { useThemePreference } from '@/features/preferences/useUserPreferences';
import type { Theme } from '@/lib/design-tokens';

/**
 * useTheme — applies the current user's theme preference to the
 * `<html>` element via the `dark` class (Tailwind v4 dark: variant
 * hook, and our own `html.dark` token overrides in `index.css`).
 *
 * - `theme === 'light'`  → `<html>` has no `dark` class
 * - `theme === 'dark'`   → `<html>` gets the `dark` class
 * - `theme === 'auto'`   → follows `prefers-color-scheme` and adds
 *                          / removes the class live as the user
 *                          toggles their OS setting
 *
 * A short CSS transition class (`html.theme-animating`) is added for
 * ~200ms when the theme actually changes so color shifts are smooth
 * rather than jarring. `prefers-reduced-motion` disables it via CSS.
 *
 * The hook is a no-op when no user is signed in — we don't touch
 * the DOM if there's nothing to apply.
 */
export function useTheme() {
  const { value: theme, isLoading } = useThemePreference();
  // Track OS scheme for the `'auto'` mode so re-renders pick up a
  // change to `prefers-color-scheme` (e.g. user toggled dark mode
  // in their system preferences mid-session).
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  // Watch the OS color scheme and update `systemDark` when it flips.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Resolve the effective theme: explicit choice wins; `'auto'`
  // defers to the OS scheme.
  const effectiveDark: boolean = (() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return systemDark; // 'auto'
  })();

  // Apply (or remove) the `dark` class on `<html>`. We also briefly
  // tag `theme-animating` so the global transition kicks in.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const prev = root.classList.contains('dark');
    if (effectiveDark === prev) return; // no-op if state didn't change

    root.classList.add('theme-animating');
    if (effectiveDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const t = window.setTimeout(() => {
      root.classList.remove('theme-animating');
    }, 220);
    return () => window.clearTimeout(t);
  }, [effectiveDark]);

  return {
    /** Effective theme currently applied to the DOM. */
    effective: effectiveDark ? 'dark' : 'light',
    /** User's stored preference — may be `'auto'`. */
    preference: theme as Theme,
    /** True while the prefs doc is still loading. */
    isLoading,
  };
}
