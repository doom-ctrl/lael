import { createAuthClient } from "better-auth/react";
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";

/**
 * Better Auth client for the browser.
 *
 * `baseURL` points at the Convex site URL because the auth API is hosted
 * there (see `convex/http.ts`). Sign-in / sign-up / sign-out / getSession
 * all POST/GET to `<VITE_CONVEX_SITE_URL>/api/auth/*`.
 *
 * `convexClient()` augments the client with a `convex.token()` method that
 * the `ConvexBetterAuthProvider` uses to fetch a JWT for Convex queries.
 *
 * `crossDomainClient()` is required for client-side SPAs (Vite) where the
 * auth origin differs from the app origin — it handles the session/cookie
 * bridging that the `crossDomain` server plugin sets up.
 *
 * The `as never` cast on `crossDomainClient()` is a workaround for a known
 * type incompatibility between the plugin's `getActions` signature and
 * Better Auth's `BetterAuthClientPlugin` constraint — the runtime shape
 * matches, only the type-level inference is off.
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_CONVEX_SITE_URL,
  plugins: [convexClient(), crossDomainClient() as never],
});
