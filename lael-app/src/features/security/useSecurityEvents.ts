import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

/**
 * useSecurityEvents — recent security events for the current user.
 *
 * Returns the newest-first list (capped server-side at 50). The
 * `undefined` state means "still loading"; consumers should render a
 * skeleton or hide the section.
 *
 * Used by Settings → Account to render the "Recent security
 * activity" feed.
 */
export function useSecurityEvents(limit: number = 5) {
  return useQuery(api.userSecurity.listMySecurityEvents, { limit });
}
