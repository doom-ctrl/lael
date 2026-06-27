/**
 * User profile image — Convex file storage for the avatar.
 *
 * Flow (the standard Convex upload dance):
 *   1. Client calls `generateUploadUrl` → gets a one-shot upload URL.
 *   2. Client `POST`s the file blob to that URL → gets a `_storage`
 *      document ID back.
 *   3. Client calls `setMyImage({ storageId })` → we patch the user's
 *      `userPreferences` doc to point at the new ID, deleting the
 *      previous one if any (so we don't leak storage).
 *
 * Removal is symmetric: `removeMyImage()` deletes the storage doc
 * and clears the field.
 *
 * Resolution (`getMyImageUrl`) is a separate query that returns the
 * current signed URL for the stored file. Convex storage URLs are
 * short-lived, so the query re-runs whenever the client re-subscribes
 * (e.g. after a navigation).
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

/**
 * Mirror `requireUser` from `userPreferences.ts` — kept duplicated
 * (not extracted) so this file reads top-to-bottom without a jump.
 * Returns the Better Auth user doc (we only need `_id`).
 */
async function requireUser(ctx: {
  auth: { getUserIdentity: () => Promise<unknown> };
}): Promise<{ _id: string }> {
  const user = (await authComponent.getAuthUser(
    ctx as Parameters<typeof authComponent.getAuthUser>[0],
  )) as unknown as { _id: string };
  return user;
}

/**
 * One-shot upload URL. Client `fetch(POST)`s the file blob to this
 * URL — Convex stores it and returns the storage ID in the response.
 * Requires an authenticated session.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Set the current user's avatar to the given storage ID. Deletes the
 * old one if present so we don't pile up orphaned blobs. Creates the
 * `userPreferences` doc if this is the user's first write (the rest
 * of the doc stays empty — defaults fill in client-side).
 */
export const setMyImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!existing) {
      await ctx.db.insert("userPreferences", {
        userId: user._id,
        imageStorageId: storageId,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    // Reap the previous blob before swapping the pointer.
    if (existing.imageStorageId && existing.imageStorageId !== storageId) {
      await ctx.storage.delete(existing.imageStorageId);
    }

    await ctx.db.patch(existing._id, {
      imageStorageId: storageId,
      updatedAt: now,
    });
  },
});

/**
 * Remove the current user's avatar (clears the field + deletes the
 * stored blob). No-op if there's no image.
 */
export const removeMyImage = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (!existing?.imageStorageId) return;

    await ctx.storage.delete(existing.imageStorageId);
    await ctx.db.patch(existing._id, {
      imageStorageId: undefined,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Resolve the current user's avatar to a fresh signed URL, or `null`
 * if they haven't set one. Returned URL is short-lived — re-fetch on
 * navigation / re-mount.
 */
export const getMyImageUrl = query({
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
    if (!doc?.imageStorageId) return null;
    return await ctx.storage.getUrl(doc.imageStorageId);
  },
});
