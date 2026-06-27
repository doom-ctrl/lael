/**
 * crons — Convex scheduled tasks.
 *
 * One job for now: `sendDailyReminders` at 13:00 UTC. That's
 * 8am ET / 5am PT / 9pm SGT — no single time is perfect for a
 * global user base, but 13:00 UTC is a reasonable "morning" for
 * the largest concentration of users. Adjust the hour as the
 * audience grows.
 *
 * To add more jobs, push another entry into `crons.daily()` /
 * `crons.hourly()` / `crons.cron(...)` — see
 * https://docs.convex.dev/scheduling/cron-jobs.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily at 13:00 UTC — sends the due-soon digest to opted-in users.
crons.daily(
  "send-daily-reminders",
  { hourUTC: 13, minuteUTC: 0 },
  internal.internal.reminders.sendDailyReminders,
);

export default crons;
