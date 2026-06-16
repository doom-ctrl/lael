import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

/**
 * HTTP router — mounts the Better Auth handlers on the Convex site URL.
 * Client sign-in / sign-up / sign-out / getSession requests hit
 * `<CONVEX_SITE_URL>/api/auth/*` and are routed here.
 *
 * CORS is required because the auth API lives on a different origin
 * (`*.convex.site`) than the SPA (Vite dev server / production host).
 *
 * `allowedOrigins` is the explicit CORS allowlist. The dynamic
 * `trustedOrigins` resolver in `convex/auth.ts` already accepts any
 * localhost / 127.0.0.1 origin on any port, so this list only needs to
 * cover production. Update it (or switch to a regex) when you deploy.
 */
const http = httpRouter();

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [
      process.env.SITE_URL ?? "http://localhost:5173",
      "http://localhost",
      "http://localhost:80",
      "https://lael-one.vercel.app",
      "https://lael-ten.vercel.app",
    ],
  },
});

export default http;
