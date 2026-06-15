import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

/**
 * Convex app config — registers the Better Auth component.
 * This gives us `components.betterAuth` to reference from `convex/auth.ts`,
 * which is where we read/write the user/session/account tables.
 */
const app = defineApp();
app.use(betterAuth);

export default app;
