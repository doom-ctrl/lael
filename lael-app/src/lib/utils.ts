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
export const DEMO_TODAY = new Date('2026-06-14');

/** "JUN" / "15" — the month/day pair shown in the date badge. */
export function formatDateBadge(
  dueDateStr: string,
  _today: Date = DEMO_TODAY,
): { month: string; day: number } {
  const d = new Date(dueDateStr);
  const month = d.toLocaleString('en', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  return { month, day };
}

/** "Today" / "Tomorrow" / "In 3 days" / "Yesterday" / "2 days ago" / etc. */
export function daysUntil(
  dueDateStr: string,
  today: Date = DEMO_TODAY,
): string {
  const due = new Date(dueDateStr);
  const diff = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
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
  return new Date(dueDateStr) < today;
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
