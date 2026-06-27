/**
 * Convex schema.
 *
 * Better Auth's `user` / `session` / `account` / `verification` tables
 * live in the `betterAuth` component's namespace and are managed
 * automatically — see `convex/auth.ts` for `authComponent`.
 *
 * App tables:
 *
 * - `assessments` — primary domain data. `userId` is the Better Auth
 *   user document's Convex `_id` (cast to string) — every query/mutation
 *   pulls the current user from the auth component and scopes writes to
 *   that user, so no one can read or write another user's assessments.
 *   - `dueDate` is stored as a Unix timestamp at midnight UTC of the
 *     intended day. The client converts to/from `YYYY-MM-DD` strings
 *     at the API boundary; storage stays timezone-stable.
 *   - `status` deliberately omits `'overdue'` — overdue is a *derived*
 *     state (computed in the client from `dueDate` + `new Date()`), not
 *     a stored value, so we don't have to keep it in sync.
 *
 * - `userPreferences` — per-user UI / notification settings. One
 *   document per user, keyed by `userId`. Created lazily the first
 *   time the user opens Settings (see `convex/userPreferences.ts`).
 *   Every field is optional so we can add new ones without a
 *   migration — absent = use the client-side default.
 *
 *   Storage shape is `string | undefined` only; the wire layer in
 *   `userPreferences.ts` enforces the actual enums via Convex
 *   validators and applies defaults when fields are missing.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assessments: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    subject: v.string(),
    type: v.union(
      v.literal("exam"),
      v.literal("quiz"),
      v.literal("assignment"),
      v.literal("project"),
      v.literal("other"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
    dueDate: v.number(), // Unix ms at midnight UTC of the due day
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_dueDate", ["userId", "dueDate"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_created", ["userId", "createdAt"]),

  userPreferences: defineTable({
    userId: v.string(),

    // Appearance
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("auto")),
    ),
    defaultView: v.optional(
      v.union(v.literal("list"), v.literal("grid"), v.literal("kanban")),
    ),
    density: v.optional(
      v.union(v.literal("compact"), v.literal("comfortable")),
    ),

    // Calendar
    weekStart: v.optional(
      v.union(v.literal("sunday"), v.literal("monday")),
    ),
    showWeekNumbers: v.optional(v.boolean()),
    timezone: v.optional(v.string()),

    // Notifications
    emailNotifications: v.optional(v.boolean()),
    reminderTiming: v.optional(
      v.union(
        v.literal("1hour"),
        v.literal("3hours"),
        v.literal("1day"),
        v.literal("3days"),
        v.literal("1week"),
      ),
    ),
    dailyDigest: v.optional(v.boolean()),

    // Data
    autoBackup: v.optional(v.boolean()),

    // Audit
    createdAt: v.number(),
    updatedAt: v.number(),

    // Profile picture — ID into Convex's `_storage` table. Resolved
    // to a fresh URL by `userImage.getMyImageUrl`. Absent = show
    // initials avatar everywhere.
    imageStorageId: v.optional(v.id("_storage")),
  }).index("by_user", ["userId"]),

  // Append-only audit log of security-relevant actions on the user's
  // account (password change, email change request, etc). Drives the
  // "Recent security activity" feed in Settings → Account. We log from
  // the client right after the Better Auth call succeeds — good enough
  // for an MVP; server-side hooks via Better Auth `databaseHooks` can
  // add ground truth later.
  securityEvents: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("password_changed"),
      v.literal("email_change_requested"),
      v.literal("email_changed"),
      v.literal("avatar_changed"),
      v.literal("avatar_removed"),
      v.literal("signed_in"),
    ),
    // Free-form context for the event. Used for "new email is X" on
    // an email change, etc. Never trust client values for auth —
    // this is display-only.
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),
});
