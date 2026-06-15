/**
 * User preferences — per-user UI / notification settings.
 *
 * - `getMyPreferences` returns the current user's preferences doc, or
 *   `null` if none has been created yet. The client applies its own
 *   defaults so the UI works on first render.
 *
 * - `updateMyPreferences` does a partial patch (`undefined` fields
 *   are *not* touched) and creates the document on first call. This
 *   means the Settings page can fire-and-forget a single mutation
 *   whenever the user changes any toggle / segmented control /
 *   select — no need to "Save".
 *
 * Wire shape (returned to the client) is identical to the storage
 * shape — the client mirrors the same optional fields.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

/* ─── Field validators shared by every function ─────────────────────────── */

const themeV = v.optional(
  v.union(v.literal("light"), v.literal("dark"), v.literal("auto")),
);
const defaultViewV = v.optional(
  v.union(v.literal("list"), v.literal("grid"), v.literal("kanban")),
);
const densityV = v.optional(
  v.union(v.literal("compact"), v.literal("comfortable")),
);
const weekStartV = v.optional(
  v.union(v.literal("sunday"), v.literal("monday")),
);
const reminderTimingV = v.optional(
  v.union(
    v.literal("1hour"),
    v.literal("3hours"),
    v.literal("1day"),
    v.literal("3days"),
    v.literal("1week"),
  ),
);

/**
 * Resolve the current Better Auth user document. Throws "Unauthorized"
 * if no session is present. Mirrors `requireUser` in `assessments.ts`
 * — kept duplicated (not extracted) so each module reads top-to-bottom
 * without cross-file jumping.
 */
async function requireUser(ctx: {
  auth: { getUserIdentity: () => Promise<unknown> };
}): Promise<{ _id: string }> {
  const user = (await authComponent.getAuthUser(
    ctx as Parameters<typeof authComponent.getAuthUser>[0],
  )) as unknown as { _id: string };
  return user;
}

/* ─── Queries ───────────────────────────────────────────────────────────── */

/**
 * Current user's preferences, or `null` if they haven't been touched
 * yet. The client merges with its own defaults — no document means
 * "use the bundled defaults", not "no preferences exist".
 */
export const getMyPreferences = query({
  args: {},
  handler: async (ctx) => {
    let user: { _id: string } | null = null;
    try {
      user = await requireUser(ctx);
    } catch {
      return null;
    }
    const doc = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    return doc ?? null;
  },
});

/* ─── Mutations ─────────────────────────────────────────────────────────── */

/**
 * Patch the current user's preferences.
 *
 * Only the fields explicitly set in `patch` are written — `undefined`
 * means "leave alone". The document is created on the first call
 * (e.g. when the user toggles any setting for the first time), with
 * every unset field staying absent so the next read returns `null`
 * for those keys, allowing the client's defaults to fill in.
 *
 * Returns the stored doc (post-patch) so the client can update its
 * local state without a separate `getMyPreferences` round-trip.
 */
export const updateMyPreferences = mutation({
  args: {
    theme: themeV,
    defaultView: defaultViewV,
    density: densityV,
    weekStart: weekStartV,
    showWeekNumbers: v.optional(v.boolean()),
    timezone: v.optional(v.string()),
    emailNotifications: v.optional(v.boolean()),
    reminderTiming: reminderTimingV,
    dailyDigest: v.optional(v.boolean()),
    autoBackup: v.optional(v.boolean()),
  },
  handler: async (ctx, patch) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Strip `undefined` entries so we don't accidentally clobber
    // existing values with `undefined` (Convex `patch` keeps absent
    // keys; passing `undefined` would still patch them to undefined,
    // which is the same here, but filtering makes intent explicit).
    const cleanPatch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) cleanPatch[k] = v;
    }

    if (!existing) {
      // First-time save — seed the doc with the patch fields plus
      // the audit timestamps. Keys left absent in `patch` stay
      // absent in storage (no client-default leakage).
      const id = await ctx.db.insert("userPreferences", {
        userId: user._id,
        ...cleanPatch,
        createdAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(id);
    }

    await ctx.db.patch(existing._id, {
      ...cleanPatch,
      updatedAt: now,
    });
    return await ctx.db.get(existing._id);
  },
});
