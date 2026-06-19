import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { query } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";
import authConfig from "./auth.config";

/**
 * Convex auth backend.
 *
 * - `authComponent` is the Better Auth client wired to the `betterAuth`
 *   component's tables (user / session / account / verification).
 * - `createAuth(ctx)` builds a Better Auth instance bound to the current
 *   Convex request context — used by `convex/http.ts` to handle auth
 *   requests.
 * - `getCurrentUser` is a public query the client uses to read the signed-in
 *   user (returns `null` when unauthenticated).
 *
 * The `crossDomain` plugin is required for client-side SPAs (Vite) because
 * the auth API is served from a different origin (the Convex site URL) than
 * the app itself (Vite dev server / production host).
 *
 * The `convex` plugin wires up JWT issuance so that Convex functions can
 * authenticate the request via the `auth.config.ts` provider above.
 */

const siteUrl = process.env.SITE_URL!;

// Additional production origins — add new Vercel/deployment URLs here
const additionalOrigins = [
  "https://lael-one.vercel.app",
  "https://lael-ten.vercel.app",
];

export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * trustedOrigins must include the actual Vite dev origin. Vite will pick
 * 5173 by default, but if anything else is holding that port it falls
 * back to 5174, 5175, etc. — and the Better Auth client will fail CORS
 * preflight for any port we haven't whitelisted.
 *
 * The request that comes in here is the one hitting the Convex site
 * (target = the Convex site URL), so the *caller*'s origin is in the
 * `Origin` header, not in `request.url`. We always include `SITE_URL` so
 * production is locked down, and additionally accept any `localhost` /
 * `127.0.0.1` origin (any port) so dev works without port-whitelisting.
 */
const trustedOrigins = (request?: Request): string[] => {
  const origins = new Set<string>();
  if (siteUrl) origins.add(siteUrl);
  additionalOrigins.forEach((o) => origins.add(o));
  if (request) {
    const callerOrigin = request.headers.get("origin");
    if (
      callerOrigin &&
      (callerOrigin.startsWith("http://localhost:") ||
        callerOrigin.startsWith("http://127.0.0.1:") ||
        callerOrigin === "http://localhost" ||
        callerOrigin === "http://127.0.0.1")
    ) {
      origins.add(callerOrigin);
    }
  }
  return Array.from(origins);
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    appName: "Lael",
    baseURL: process.env.CONVEX_SITE_URL,
    trustedOrigins,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
    },
    // Session configuration: 30-day expiry, refresh every 7 days
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
      updateAge: 60 * 60 * 24 * 7, // update session every 7 days
    },
    plugins: [crossDomain({ siteUrl }), convex({ authConfig })],
  } satisfies BetterAuthOptions);
};

/**
 * Returns the currently signed-in user (Better Auth `user` document), or
 * `null` if no valid session is present. Used by client hooks for greeting,
 * avatar initials, sign-out, etc.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.safeGetAuthUser(ctx);
  },
});
