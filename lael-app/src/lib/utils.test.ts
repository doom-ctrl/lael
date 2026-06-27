import { describe, it, expect } from 'vitest';
import {
  cn,
  daysUntil,
  isOverdue,
  formatDateBadge,
  formatLongDate,
  getGreeting,
  getInitials,
} from './utils';

/**
 * Unit tests for the pure date/string helpers in `utils.ts`. These
 * functions are the foundation of every row, badge, and header in
 * the app — a single off-by-one here cascades into every date badge
 * in the UI, so they earn a test.
 *
 * Kept as one file by intent (Ponytail): add more only if/when a
 * helper has non-trivial branching that breaks in production.
 */
describe('utils', () => {
  // Anchor "today" at noon local time so timezone tests are stable.
  const today = new Date(2026, 5, 19, 12, 0, 0); // Fri Jun 19 2026

  describe('cn', () => {
    it('merges Tailwind classes and resolves conflicts', () => {
      // twMerge should drop the conflicting `px-4` in favor of the
      // later `px-2`.
      expect(cn('px-4 text-red-500', 'px-2')).toBe('text-red-500 px-2');
    });

    it('skips falsy values', () => {
      expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar');
    });
  });

  describe('daysUntil', () => {
    it('returns "Today" when the date matches', () => {
      const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      expect(daysUntil(todayStr, today)).toBe('Today');
    });

    it('returns "Tomorrow" / "Yesterday" for ±1 day', () => {
      expect(daysUntil('2026-06-20', today)).toBe('Tomorrow');
      expect(daysUntil('2026-06-18', today)).toBe('Yesterday');
    });

    it('returns "In N days" for the rest of the week', () => {
      expect(daysUntil('2026-06-22', today)).toBe('In 3 days');
      expect(daysUntil('2026-06-25', today)).toBe('In 6 days');
    });

    it('collapses to "In 1 week" at the 7-day mark', () => {
      expect(daysUntil('2026-06-26', today)).toBe('In 1 week');
    });

    it('returns weeks beyond 14 days', () => {
      expect(daysUntil('2026-07-17', today)).toBe('In 4 weeks');
    });

    it('returns "N days ago" for past dates', () => {
      expect(daysUntil('2026-06-15', today)).toBe('4 days ago');
    });
  });

  describe('isOverdue', () => {
    it('is overdue for past dates that are not completed', () => {
      expect(isOverdue('2026-06-15', 'pending', today)).toBe(true);
      expect(isOverdue('2026-06-15', 'in_progress', today)).toBe(true);
    });

    it('is not overdue for today or future dates', () => {
      const todayStr = '2026-06-19';
      expect(isOverdue(todayStr, 'pending', today)).toBe(false);
      expect(isOverdue('2026-07-01', 'pending', today)).toBe(false);
    });

    it('is never overdue for completed items', () => {
      expect(isOverdue('2026-06-15', 'completed', today)).toBe(false);
    });

    it('treats the synthetic "overdue" status as overdue', () => {
      expect(isOverdue('2026-07-01', 'overdue', today)).toBe(true);
    });
  });

  describe('formatDateBadge', () => {
    it('returns uppercase 3-letter month and numeric day', () => {
      expect(formatDateBadge('2026-06-14')).toEqual({ month: 'JUN', day: 14 });
      expect(formatDateBadge('2026-01-05')).toEqual({ month: 'JAN', day: 5 });
    });
  });

  describe('formatLongDate', () => {
    it('returns "Weekday, Month Day"', () => {
      // Friday, June 19
      expect(formatLongDate(today)).toBe('Friday, June 19');
    });
  });

  describe('getGreeting', () => {
    it('picks the right greeting for the hour of day', () => {
      expect(getGreeting(new Date(2026, 5, 19, 7))).toBe('Good morning');
      expect(getGreeting(new Date(2026, 5, 19, 12))).toBe('Good afternoon');
      expect(getGreeting(new Date(2026, 5, 19, 18))).toBe('Good evening');
    });
  });

  describe('getInitials', () => {
    it('uppercases the first character of a name', () => {
      expect(getInitials('alice')).toBe('A');
      expect(getInitials('  Bob  ')).toBe('B');
    });

    it('returns "?" for empty or whitespace input', () => {
      expect(getInitials('')).toBe('?');
      expect(getInitials('   ')).toBe('?');
    });
  });
});

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
