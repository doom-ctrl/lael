import * as React from 'react';
import { useTheme } from '@/features/preferences/useTheme';

/**
 * ThemeProvider — runs `useTheme()` so the `dark` class on `<html>`
 * is kept in sync with the user's stored preference. Renders no UI.
 *
 * Mounted once at the app root, above the router, so theme is
 * applied before any page renders (avoids a flash of the wrong
 * palette on first paint).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}
