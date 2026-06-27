/**
 * Reminders — internal Convex action that sends the daily digest
 * email to every opted-in user via Brevo.
 *
 * Wire shape:
 *   - Schedule lives in `convex/crons.ts` (daily, 13:00 UTC).
 *   - This file owns the work: read opted-in users, build per-user
 *     digests, hand the rendered email to the shared `sendEmail`
 *     helper in `./email.ts` (one HTTP call to Brevo per user).
 *
 * The user.email lookup uses the Better Auth component's adapter
 * (`components.betterAuth.adapter.findOne`). If that returns no
 * document, we log and skip — better to under-send than to crash
 * the whole batch because one user's record is malformed.
 *
 * Ponytail note: the digest HTML is intentionally minimal (one
 * inline-styled table). Add a React Email template later when the
 * shape needs more polish; right now this ships in ~one screen.
 */

import { v } from "convex/values";
import { internalAction, internalQuery } from "../_generated/server";
import { components, internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { escapeHtml, sendEmail } from "./email";

// How far ahead to look for "due-soon" items, in milliseconds.
// 24h matches the default `reminderTiming: "1day"` setting.
const DEFAULT_LOOKAHEAD_MS = 24 * 60 * 60 * 1000;

/**
 * Internal query: every user who has opted into email notifications,
 * plus their `reminderTiming` window. Runs as system (no auth).
 */
export const listOptedInUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    // userPreferences is app-owned, so we can read it directly.
    // `emailNotifications` defaults to `true` per the Settings UI
    // (we only set `false` when the user explicitly opts out).
    // We treat `undefined` as opted-IN for the MVP — a user who
    // never visited Settings should still get reminders they
    // didn't ask us to stop. Flip this to `=== true` once the
    // Settings toggle writes an explicit value on first save.
    const prefs = await ctx.db.query("userPreferences").collect();
    return prefs
      .filter((p) => p.emailNotifications !== false)
      .map((p) => ({
        userId: p.userId,
        lookaheadMs: timingToMs(p.reminderTiming) ?? DEFAULT_LOOKAHEAD_MS,
      }));
  },
});

/**
 * Internal query: a user's due-soon assessments (pending or
 * in_progress, dueDate within the next `lookaheadMs`).
 */
export const dueItemsForUser = internalQuery({
  args: {
    userId: v.string(),
    lookaheadMs: v.number(),
  },
  handler: async (ctx, { userId, lookaheadMs }) => {
    const now = Date.now();
    const horizon = now + lookaheadMs;
    const items = await ctx.db
      .query("assessments")
      .withIndex("by_user_dueDate", (q) =>
        q.eq("userId", userId).gte("dueDate", now).lte("dueDate", horizon),
      )
      .collect();
    return items
      .filter((a) => a.status !== "completed")
      .map((a) => ({
        id: a._id,
        title: a.title,
        subject: a.subject,
        type: a.type,
        priority: a.priority,
        dueDate: a.dueDate,
      }));
  },
});

/**
 * Daily action — iterates opted-in users, sends a digest email to
 * each. Failures are caught per-user so one bad address doesn't
 * take down the whole batch.
 */
export const sendDailyReminders = internalAction({
  args: {},
  handler: async (ctx): Promise<{
    sent: number;
    skippedNoItems?: number;
    skippedNoEmail?: number;
    total: number;
    skipped?: string;
  }> => {
    // Missing-env short-circuit. `sendEmail` would also short-circuit
    // per-call, but checking once up-front saves a round-trip per
    // user and lets us tag the whole batch as skipped.
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_FROM_EMAIL) {
      console.warn(
        "[reminders] BREVO_API_KEY / BREVO_FROM_EMAIL not set — skipping daily batch.",
      );
      return { sent: 0, total: 0, skipped: "missing-env" };
    }

    const optedIn = await ctx.runQuery(internal.internal.reminders.listOptedInUsers);
    let sent = 0;
    let skippedNoItems = 0;
    let skippedNoEmail = 0;

    for (const { userId, lookaheadMs } of optedIn) {
      try {
        // Look up the user (name + email) via the Better Auth
        // component's adapter. `findOne` is generic — we pass the
        // table name and a field filter.
        const userRecord = (await ctx.runQuery(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (components.betterAuth.adapter as any).findOne,
          { table: "user", where: { field: "_id", value: userId } },
        )) as { name: string; email: string } | null;

        if (!userRecord?.email) {
          skippedNoEmail++;
          continue;
        }

        const items = await ctx.runQuery(
          internal.internal.reminders.dueItemsForUser,
          { userId, lookaheadMs },
        );

        if (items.length === 0) {
          skippedNoItems++;
          continue;
        }

        const html = renderDigestHtml({
          name: userRecord.name,
          items,
        });
        const text = renderDigestText({ name: userRecord.name, items });

        const result = await sendEmail({
          to: userRecord.email,
          toName: userRecord.name,
          subject: `Lael — ${items.length} item${items.length === 1 ? "" : "s"} due soon`,
          html,
          text,
        });

        if (!result.ok) {
          console.error(
            `[reminders] email failed for ${userRecord.email}:`,
            result.error,
          );
          continue;
        }
        sent++;
      } catch (err) {
        // Per-user error isolation — one bad address can't poison
        // the whole batch.
        console.error(`[reminders] failed for userId=${userId}:`, err);
      }
    }

    return { sent, skippedNoItems, skippedNoEmail, total: optedIn.length };
  },
});

/* ─── Helpers ──────────────────────────────────────────────────────────── */

/** Map the `reminderTiming` enum to a millisecond lookahead window. */
function timingToMs(timing: Doc<"userPreferences">["reminderTiming"]): number | null {
  switch (timing) {
    case "1hour": return 60 * 60 * 1000;
    case "3hours": return 3 * 60 * 60 * 1000;
    case "1day": return 24 * 60 * 60 * 1000;
    case "3days": return 3 * 24 * 60 * 60 * 1000;
    case "1week": return 7 * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

interface DigestItem {
  id: Id<"assessments">;
  title: string;
  subject: string;
  type: string;
  priority: string;
  dueDate: number;
}

function renderDigestText({ name, items }: { name: string; items: DigestItem[] }): string {
  const first = (name ?? "there").split(" ")[0] || "there";
  const lines = [
    `Hi ${first},`,
    "",
    `You have ${items.length} item${items.length === 1 ? "" : "s"} due soon:`,
    "",
    ...items.map((it) => {
      const d = new Date(it.dueDate);
      return `  • ${it.title} — ${it.subject} (${it.type}, ${d.toDateString()})`;
    }),
    "",
    "Open Lael to review.",
  ];
  return lines.join("\n");
}

function renderDigestHtml({ name, items }: { name: string; items: DigestItem[] }): string {
  const first = (name ?? "there").split(" ")[0] || "there";
  const rows = items
    .map((it) => {
      const d = new Date(it.dueDate).toDateString();
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #E2DAD0;font-family:Inter,system-ui,sans-serif;font-size:14px;color:#1C1917;">${escapeHtml(it.title)}</td><td style="padding:8px 12px;border-bottom:1px solid #E2DAD0;font-family:Inter,system-ui,sans-serif;font-size:13px;color:#78716C;">${escapeHtml(it.subject)}</td><td style="padding:8px 12px;border-bottom:1px solid #E2DAD0;font-family:Inter,system-ui,sans-serif;font-size:12px;color:#A8A29E;">${d}</td></tr>`;
    })
    .join("");

  return `<!doctype html><html><body style="margin:0;padding:0;background:#FBF8F3;font-family:Inter,system-ui,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:24px;color:#1C1917;margin:0 0 4px 0;">Lael</h1>
  <p style="color:#1C1917;font-size:15px;line-height:1.55;margin:16px 0 8px 0;">Hi ${escapeHtml(first)},</p>
  <p style="color:#78716C;font-size:14px;line-height:1.55;margin:0 0 20px 0;">You have ${items.length} item${items.length === 1 ? "" : "s"} due soon:</p>
  <table style="width:100%;border-collapse:collapse;background:#FFFEFA;border:1px solid #E2DAD0;border-radius:8px;overflow:hidden;">
    <thead><tr style="background:#F5F0E8;"><th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#A8A29E;font-weight:600;">Title</th><th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#A8A29E;font-weight:600;">Subject</th><th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#A8A29E;font-weight:600;">Due</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin:24px 0 0 0;"><a href="${process.env.SITE_URL ?? "http://localhost:5173"}" style="background:#166534;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block;">Open Lael</a></p>
</div>
</body></html>`;
}
