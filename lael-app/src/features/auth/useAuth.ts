import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { authClient } from '@/lib/auth-client';

/**
 * useAuth — single source of truth for the current user / session.
 *
 * Combines two things:
 *   - `authClient.useSession()` — reactive Better Auth session state. Tells
 *     us if there's a session at all (and the `isPending` flag for the
 *     initial cookie-driven load).
 *   - `useQuery(api.auth.getCurrentUser)` — the user document from Convex.
 *     Returns `undefined` while loading, `null` if no session, or the user
 *     object when signed in.
 *
 * The unified return shape is shaped so callers can render three states:
 *   - `isLoading: true`            → show full-page spinner
 *   - `user === null`              → unauthenticated, redirect to /sign-in
 *   - `user` populated             → render protected UI
 */
export function useAuth() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const user = useQuery(api.auth.getCurrentUser);

  const isLoading = isSessionPending || user === undefined;
  const isAuthenticated = !!session && !!user;

  return {
    isLoading,
    isAuthenticated,
    user: user ?? null,
    session: session ?? null,
  } as const;
}
