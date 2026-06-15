import * as React from 'react';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { convex } from '@/lib/convex';
import { authClient } from '@/lib/auth-client';

/**
 * Top-level provider stack: Convex client + Better Auth session bridge.
 *
 * - `convex` is the singleton ConvexReactClient (see `src/lib/convex.ts`).
 * - `authClient` is the Better Auth client (see `src/lib/auth-client.ts`).
 *
 * The provider reads the Better Auth session and pipes a JWT to the Convex
 * client on every query, so calls like `useQuery(api.auth.getCurrentUser)`
 * always see the latest auth state.
 */
export function ConvexAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
