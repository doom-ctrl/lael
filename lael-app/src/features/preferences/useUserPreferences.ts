import { useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  resolvePreferences,
  type UserPreferences,
} from '@/lib/design-tokens';

/**
 * UserPreferences wire type — the exact shape returned by
 * `api.userPreferences.getMyPreferences` (or `null` when no doc
 * exists). Mirrors the storage shape.
 */
export type UserPreferencesDoc = UserPreferences | null;

/**
 * useUserPreferences — single source of truth for the current user's
 * UI / notification settings.
 *
 * Returns:
 *   - `prefs`     — the merged preferences (server values fall back
 *                   to `DEFAULT_PREFERENCES` for any missing field).
 *                   `null` if we have no data yet AND no user is
 *                   signed in.
 *   - `raw`       — the raw doc as returned by Convex (`null` if
 *                   nothing stored yet). Useful when you need to
 *                   know "did the user explicitly set X".
 *   - `update`    — fire-and-forget partial patch. The mutation
 *                   auto-creates the doc on first call, so the
 *                   Settings page can call this on every change
 *                   without separate "create" / "edit" modes.
 *   - `isLoading` — true while the initial query is in-flight.
 *
 * The hook is safe to call from any component — it re-renders
 * automatically when the user signs in / out (the query is gated by
 * the auth provider).
 */
export function useUserPreferences() {
  const raw = useQuery(api.userPreferences.getMyPreferences) as
    | UserPreferencesDoc
    | undefined;
  const updateMutation = useMutation(api.userPreferences.updateMyPreferences);

  return useMemo(() => {
    // `undefined` = still loading; `null` = signed in, no doc yet.
    // We surface both as `isLoading: true` for callers that want
    // to show a spinner, but the resolved `prefs` is always
    // populated from the defaults so the UI can render immediately.
    const isLoading = raw === undefined;
    const prefs = resolvePreferences(raw ?? null);

    return {
      prefs,
      raw: raw ?? null,
      isLoading,
      update: updateMutation,
    };
  }, [raw, updateMutation]);
}

/**
 * useDefaultView — read the user's preferred Assessments page view
 * and project a setter that only touches the `defaultView` field.
 * Used by `AssessmentsPage` to start in the right view.
 */
export function useDefaultView() {
  const { prefs, update, isLoading } = useUserPreferences();
  return {
    value: prefs.defaultView,
    isLoading,
    set: (defaultView: UserPreferences['defaultView']) =>
      update({ defaultView }),
  };
}

/**
 * useWeekStart — read the user's preferred week-start day and project
 * a setter for just that field. Used by `CalendarPage` / `CalendarGrid`.
 */
export function useWeekStart() {
  const { prefs, update, isLoading } = useUserPreferences();
  return {
    value: prefs.weekStart,
    isLoading,
    set: (weekStart: UserPreferences['weekStart']) => update({ weekStart }),
  };
}

/**
 * useThemePreference — read the theme preference and project a setter
 * for just the `theme` field. Used by `useTheme()` to wire the
 * `html.dark` class.
 */
export function useThemePreference() {
  const { prefs, update, isLoading } = useUserPreferences();
  return {
    value: prefs.theme,
    isLoading,
    set: (theme: UserPreferences['theme']) => update({ theme }),
  };
}
