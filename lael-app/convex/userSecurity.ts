/**
 * Security events — append-only audit log for sensitive account
 * actions (password change, email change request, avatar swap, etc).
 *
 * Drives the "Recent security activity" feed in Settings → Account
 * so the user can spot unauthorized changes.
 *
 * Events are written from the client right after the Better Auth
 * call succeeds. That's deliberately lightweight — server-side
 * `databaseHooks` could enforce ground-truth later, but for an MVP
 * the client-driven log captures the same flows we already prompt
 * the user through, with no extra infrastructure.
 *
 * Read path (`listMySecurityEvents`) returns the most recent N
 * events for the current user — Settings renders the top 5.
 */

import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { authComponent } from "./auth";
import { renderPasswordChangedAlert, sendEmail } from "./internal/email";

const ALLOWED_TYPES = [
  "password_changed",
  "email_change_requested",
  "email_changed",
  "avatar_changed",
  "avatar_removed",
  "signed_in",
] as const;
type SecurityEventType = (typeof ALLOWED_TYPES)[number];

async function requireUser(ctx: {
  auth: { getUserIdentity: () => Promise<unknown> };
}): Promise<{ _id: string }> {
  const user = (await authComponent.getAuthUser(
    ctx as Parameters<typeof authComponent.getAuthUser>[0],
  )) as unknown as { _id: string };
  return user;
}

/**
 * Append a security event for the current user. Allowed types are
 * pinned to a literal union so the client can't write arbitrary
 * strings (which would let a compromised client fabricate a log).
 * Metadata is `any` but never trusted for auth decisions — it's
 * display-only.
 */
export const logSecurityEvent = mutation({
  args: {
    type: v.union(...ALLOWED_TYPES.map((t) => v.literal(t))),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { type, metadata }) => {
    const user = await requireUser(ctx);
    await ctx.db.insert("securityEvents", {
      userId: user._id,
      type: type as SecurityEventType,
      metadata,
      createdAt: Date.now(),
    });
  },
});

/**
 * Most recent N security events for the current user (newest first).
 * `limit` is clamped to 50 server-side so a misbehaving client can't
 * pull the entire history.
 */
export const listMySecurityEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const user = await requireUser(ctx);
    const cap = Math.min(Math.max(limit ?? 20, 1), 50);
    return await ctx.db
      .query("securityEvents")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(cap);
  },
});

/**
 * Send the "your password was changed" alert email to the current
 * user's email. Client calls this right after `authClient.changePassword`
 * succeeds so the user gets notified even if they didn't initiate
 * the change.
 *
 * No-op (with a warning) if the user can't be resolved or Brevo isn't
 * configured — the password change itself already succeeded; this is
 * a best-effort alert.
 */
export const sendPasswordChangedAlert = action({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.auth.getCurrentUser);
    if (!user?.email) {
      console.warn("[security] password alert skipped: no current user");
      return { ok: false as const, error: "no-user" };
    }
    const { html, text, subject } = renderPasswordChangedAlert({
      name: user.name,
    });
    const result = await sendEmail({
      to: user.email,
      toName: user.name ?? undefined,
      subject,
      html,
      text,
    });
    if (!result.ok) {
      console.warn("[security] password alert email failed:", result.error);
    }
    return result;
  },
});
