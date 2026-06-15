/**
 * Assessments — CRUD + dashboard helpers.
 *
 * All functions call `authComponent.getAuthUser(ctx)` first to pull the
 * current user, then scope every read/write to that user's `userId`.
 * This means a query can't accidentally leak another user's data, and
 * a mutation will throw a 401-equivalent if called anonymously.
 *
 * The wire shape (what the client sees) differs from the storage shape
 * in two small ways:
 *   - `_id` is renamed to `id` (string) for client ergonomics.
 *   - `dueDate` is converted from a Unix timestamp to a `YYYY-MM-DD`
 *     string, which is what the existing `Assessment` type and
 *     `lib/utils.ts` helpers (formatDateBadge, daysUntil, isOverdue)
 *     already expect.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { authComponent } from "./auth";

/* ─── Field validators shared by every function ─────────────────────────── */

const typeV = v.union(
  v.literal("exam"),
  v.literal("quiz"),
  v.literal("assignment"),
  v.literal("project"),
  v.literal("other"),
);
const priorityV = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent"),
);
const statusV = v.union(
  v.literal("pending"),
  v.literal("in_progress"),
  v.literal("completed"),
);

/* ─── Helpers ──────────────────────────────────────────────────────────── */

/**
 * Resolve the current Better Auth user document. Throws "Unauthorized"
 * if no session is present, which the client surfaces as a generic
 * auth error.
 *
 * The `user` table lives in the Better Auth component's namespace, not
 * in our app's DataModel — so it doesn't have a typed `Doc<"user">`
 * entry on our side. We just need the `_id` for foreign-key checks in
 * the queries below, so we narrow to that.
 */
async function requireUser(ctx: {
  auth: { getUserIdentity: () => Promise<unknown> };
}): Promise<{ _id: string }> {
  const user = (await authComponent.getAuthUser(
    ctx as Parameters<typeof authComponent.getAuthUser>[0],
  )) as unknown as { _id: string };
  return user;
}

/** `YYYY-MM-DD` → Unix ms at midnight UTC. Stable across timezones. */
function dateStrToTimestamp(s: string): number {
  return Date.UTC(
    Number(s.slice(0, 4)),
    Number(s.slice(5, 7)) - 1,
    Number(s.slice(8, 10)),
  );
}

/** Unix ms → `YYYY-MM-DD` (UTC). */
function timestampToDateStr(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Storage → wire shape. */
function toClient(doc: Doc<"assessments">) {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    subject: doc.subject,
    type: doc.type,
    priority: doc.priority,
    status: doc.status,
    dueDate: timestampToDateStr(doc.dueDate),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    completedAt: doc.completedAt,
  };
}

/* ─── Queries ───────────────────────────────────────────────────────────── */

/** All assessments for the current user, newest-first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    let user: { _id: string } | null = null;
    try { user = await requireUser(ctx); } catch { return []; }
    const docs = await ctx.db
      .query("assessments")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    return docs.map(toClient);
  },
});

/**
 * Assessments in a given month (0-indexed month, full year). Used by
 * the calendar page. Returns ascending by due date so the calendar
 * pills render in order.
 */
export const listByMonth = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, { year, month }) => {
    let user: { _id: string } | null = null;
    try { user = await requireUser(ctx); } catch { return []; }
    const start = Date.UTC(year, month, 1);
    const end = Date.UTC(year, month + 1, 1);
    const docs = await ctx.db
      .query("assessments")
      .withIndex("by_user_dueDate", (q) =>
        q.eq("userId", user._id).gte("dueDate", start).lt("dueDate", end),
      )
      .collect();
    return docs.map(toClient).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },
});

/** Single assessment by id. Returns `null` if not found or not owned. */
export const get = query({
  args: { id: v.id("assessments") },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== user._id) return null;
    return toClient(doc);
  },
});

/* ─── Mutations ─────────────────────────────────────────────────────────── */

const writeFields = {
  title: v.string(),
  description: v.optional(v.string()),
  subject: v.string(),
  type: typeV,
  priority: priorityV,
  status: statusV,
  dueDate: v.string(), // `YYYY-MM-DD`
};

/** Create a new assessment for the current user. */
export const create = mutation({
  args: writeFields,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    return ctx.db.insert("assessments", {
      userId: user._id,
      title: args.title,
      description: args.description,
      subject: args.subject,
      type: args.type,
      priority: args.priority,
      status: args.status,
      dueDate: dateStrToTimestamp(args.dueDate),
      createdAt: now,
      updatedAt: now,
      completedAt: args.status === "completed" ? now : undefined,
    });
  },
});

/** Patch an existing assessment. `dueDate` is re-converted from string. */
export const update = mutation({
  args: {
    id: v.id("assessments"),
    ...writeFields,
  },
  handler: async (ctx, { id, ...patch }) => {
    const user = await requireUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== user._id) {
      throw new Error("Assessment not found");
    }
    const now = Date.now();
    const wasCompleted = doc.status === "completed";
    const isCompleted = patch.status === "completed";
    await ctx.db.patch(id, {
      title: patch.title,
      description: patch.description,
      subject: patch.subject,
      type: patch.type,
      priority: patch.priority,
      status: patch.status,
      dueDate: dateStrToTimestamp(patch.dueDate),
      updatedAt: now,
      // Track completion transition timestamps so we can show
      // "Completed 2h ago" etc. in Phase 5.
      completedAt: !wasCompleted && isCompleted
        ? now
        : wasCompleted && !isCompleted
          ? undefined
          : doc.completedAt,
    });
  },
});

/**
 * Toggle the completed state of an assessment without re-submitting the
 * whole form. Used by the row's checkbox.
 */
export const markComplete = mutation({
  args: {
    id: v.id("assessments"),
    completed: v.boolean(),
  },
  handler: async (ctx, { id, completed }) => {
    const user = await requireUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== user._id) {
      throw new Error("Assessment not found");
    }
    const now = Date.now();
    await ctx.db.patch(id, {
      status: completed ? "completed" : "pending",
      completedAt: completed ? now : undefined,
      updatedAt: now,
    });
  },
});

/** Delete an assessment. Idempotent (no-op if not found / not owned). */
export const remove = mutation({
  args: { id: v.id("assessments") },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== user._id) {
      throw new Error("Assessment not found");
    }
    await ctx.db.delete(id);
  },
});

/* ─── Convenience: total counts (for the dashboard "Total" tile) ───────── */

export const counts = query({
  args: {},
  handler: async (ctx) => {
    let user: { _id: string } | null = null;
    try { user = await requireUser(ctx); } catch { return { total: 0, completed: 0, pending: 0, inProgress: 0 }; }
    const all = await ctx.db
      .query("assessments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const total = all.length;
    const completed = all.filter((a) => a.status === "completed").length;
    const pending = total - completed;
    const inProgress = all.filter((a) => a.status === "in_progress").length;
    return { total, completed, pending, inProgress };
  },
});

// Type re-export for the client (avoids importing the Convex generated
// type at the call site).
export type AssessmentId = Id<"assessments">;
