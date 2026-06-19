/**
 * Lael — Utility helpers.
 * `cn()` is the standard Tailwind class merger (clsx + tailwind-merge).
 * The rest are date helpers used across row/card/modal components.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* ─── Date helpers ───────────────────────────────────────────────────────── */

/** Reference "today" used for demo data. Phase 3+ will swap to `new Date()`. */
export const DEMO_TODAY = new Date(2026, 5, 14); // June 14, 2026 (local time)

/** "JUN" / "15" — the month/day pair shown in the date badge. */
export function formatDateBadge(
  dueDateStr: string,
  _today: Date = DEMO_TODAY,
): { month: string; day: number } {
  // Parse as local date to avoid UTC timezone off-by-one errors
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const monthStr = d.toLocaleString('en', { month: 'short' }).toUpperCase();
  const dayNum = d.getDate();
  return { month: monthStr, day: dayNum };
}

/** "Today" / "Tomorrow" / "In 3 days" / "Yesterday" / "2 days ago" / etc. */
export function daysUntil(
  dueDateStr: string,
  today: Date = DEMO_TODAY,
): string {
  // Parse as local date to avoid UTC timezone off-by-one errors
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const due = new Date(year, month - 1, day);

  // Normalize both dates to local midnight for accurate day difference
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueMidnight = new Date(year, month - 1, day);

  const diff = Math.round(
    (dueMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  if (diff < 7) return `In ${diff} days`;
  if (diff < 14) return 'In 1 week';
  return `In ${Math.floor(diff / 7)} weeks`;
}

export function isOverdue(
  dueDateStr: string,
  status: string,
  today: Date = DEMO_TODAY,
): boolean {
  if (status === 'overdue') return true;
  if (status === 'completed') return false;
  // Parse as local date to avoid UTC timezone off-by-one errors
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const dueMidnight = new Date(year, month - 1, day);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dueMidnight < todayMidnight;
}

/** Long, friendly date for headers: "Sunday, June 14". */
export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Time-of-day greeting. */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── Initials helper ────────────────────────────────────────────────────── */

export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}
