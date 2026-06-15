import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

/**
 * Convex auth config — registers Better Auth as the JWT issuer.
 * This file is referenced by `convex/auth.ts` (passes to the `convex()` plugin)
 * and is automatically picked up by Convex at deploy time.
 */
export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
