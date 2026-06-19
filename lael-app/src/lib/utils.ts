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

/** "JUN" / "15" — the month/day pair shown in the date badge. */
export function formatDateBadge(dueDateStr: string): { month: string; day: number } {
  // Use T00:00:00 to force local time parsing (not UTC)
  const d = new Date(dueDateStr + 'T00:00:00');
  const monthStr = d.toLocaleString('en', { month: 'short' }).toUpperCase();
  const dayNum = d.getDate();
  return { month: monthStr, day: dayNum };
}

/** "Today" / "Tomorrow" / "In 3 days" / "Yesterday" / "2 days ago" / etc. */
export function daysUntil(dueDateStr: string, today: Date = new Date()): string {
  // Use T00:00:00 to force local time parsing (not UTC)
  const due = new Date(dueDateStr + 'T00:00:00');
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Get date strings (YYYY-MM-DD) for clean comparison
  const dueDateStr2 = due.toISOString().slice(0, 10);
  const todayDateStr2 = todayDate.toISOString().slice(0, 10);

  // Compare date strings directly (lexicographic works for ISO dates)
  if (dueDateStr2 < todayDateStr2) {
    const diff = Math.ceil((todayDate.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  }
  if (dueDateStr2 === todayDateStr2) return 'Today';

  const diff = Math.ceil((due.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return `In ${diff} days`;
  if (diff < 14) return 'In 1 week';
  return `In ${Math.floor(diff / 7)} weeks`;
}

export function isOverdue(
  dueDateStr: string,
  status: string,
  today: Date = new Date(),
): boolean {
  if (status === 'overdue') return true;
  if (status === 'completed') return false;
  // Use T00:00:00 to force local time parsing (not UTC)
  const due = new Date(dueDateStr + 'T00:00:00');
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDateStr2 = due.toISOString().slice(0, 10);
  const todayDateStr2 = todayDate.toISOString().slice(0, 10);
  return dueDateStr2 < todayDateStr2;
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
