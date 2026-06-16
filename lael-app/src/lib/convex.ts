import { ConvexReactClient } from "convex/react";

/**
 * Convex client singleton.
 *
 * `expectAuth: true` pauses every Convex query until a JWT is available, so
 * UI doesn't briefly render an unauthenticated state before the auth flow
 * resolves. The actual auth token is supplied by `ConvexBetterAuthProvider`
 * via `setAuth` (see `src/components/providers/ConvexAuthProvider.tsx`).
 */
const url = import.meta.env.VITE_CONVEX_URL;
if (!url) {
  throw new Error(
    'Missing VITE_CONVEX_URL — make sure `.env.local` is configured and the dev server has been restarted.',
  );
}

export const convex = new ConvexReactClient(url, { expectAuth: false });
