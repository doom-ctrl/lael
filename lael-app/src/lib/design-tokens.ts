/**
 * Lael — Design Tokens
 * Direction B: Warm Editorial
 *
 * Mirrors the palette/typography from design-demos/shared.js.
 * Use these tokens in components for type safety. CSS variables
 * (in index.css) provide the Tailwind theme — these constants
 * are for cases where we need a value directly (e.g. inline styles,
 * dynamic className composition, or shared prop types).
 */

export const PALETTE = {
  // Backgrounds
  bg: '#FBF8F3',
  bgWarm: '#F5F0E8',
  surface: '#FFFEFA',
  surfaceAlt: '#F5F0E8',

  // Borders
  border: '#E2DAD0',
  borderLight: '#EDE6DC',

  // Text
  textPrimary: '#1C1917',
  textSecondary: '#78716C',
  textTertiary: '#A8A29E',

  // Accent
  accent: '#166534',
  accentHover: '#14532D',
  accentLight: '#F0FDF4',
  accentBorder: '#BBF7D0',

  // Status
  success: '#15803D',
  successLight: '#F0FDF4',
  warning: '#B45309',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',
  danger: '#B91C1C',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',
  info: '#1D4ED8',
  infoLight: '#EFF6FF',
  infoBorder: '#BFDBFE',
  purple: '#7C3AED',
  purpleLight: '#FAF5FF',
  purpleBorder: '#E9D5FF',

  // Navbar translucent backgrounds
  navbarBg: 'rgba(251,248,243,0.88)',
  navbarBgSolid: 'rgba(251,248,243,0.96)',

  // Shadows
  shadow: '0 1px 4px rgba(28,25,23,0.05)',
  shadowMd: '0 4px 16px rgba(28,25,23,0.08)',
  shadowLg: '0 12px 40px rgba(28,25,23,0.10)',
  shadowXl: '0 20px 60px rgba(28,25,23,0.12)',
} as const;

export const TYPOGRAPHY = {
  display: "'Newsreader', Georgia, serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
} as const;

/* ─── Domain enums + per-key UI configs ──────────────────────────────────── */

export const ASSESSMENT_TYPES = [
  'exam',
  'quiz',
  'assignment',
  'project',
  'other',
] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  exam: 'Exam',
  quiz: 'Quiz',
  assignment: 'Assignment',
  project: 'Project',
  other: 'Other',
};

/** Per-type color trio (bg, text, border). */
export interface TypeStyle {
  bg: string;
  color: string;
  border: string;
}

export const ASSESSMENT_TYPE_STYLES: Record<AssessmentType, TypeStyle> = {
  exam: {
    bg: 'var(--color-danger-light)',
    color: 'var(--color-danger)',
    border: 'var(--color-danger-border)',
  },
  quiz: {
    bg: 'var(--color-warning-light)',
    color: 'var(--color-warning)',
    border: 'var(--color-warning-border)',
  },
  assignment: {
    bg: 'var(--color-info-light)',
    color: 'var(--color-info)',
    border: 'var(--color-info-border)',
  },
  project: {
    bg: 'var(--color-purple-light)',
    color: 'var(--color-purple)',
    border: 'var(--color-purple-border)',
  },
  other: {
    bg: 'var(--color-bg-warm)',
    color: 'var(--color-text-secondary)',
    border: 'var(--color-border)',
  },
};

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface PriorityStyle {
  label: string;
  color: string;
  bg: string;
}

export const PRIORITY_STYLES: Record<Priority, PriorityStyle> = {
  low: { label: 'Low', color: 'var(--color-info)', bg: 'var(--color-info-light)' },
  medium: { label: 'Medium', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  high: { label: 'High', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
  urgent: { label: 'Urgent', color: 'var(--color-purple)', bg: 'var(--color-purple-light)' },
};

export const STATUSES = [
  'pending',
  'in_progress',
  'completed',
  'overdue',
] as const;
export type Status = (typeof STATUSES)[number];

export interface StatusStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const STATUS_STYLES: Record<Status, StatusStyle> = {
  pending: {
    label: 'Pending',
    color: 'var(--color-text-secondary)',
    bg: 'var(--color-bg-warm)',
    border: 'var(--color-border)',
  },
  in_progress: {
    label: 'In Progress',
    color: 'var(--color-info)',
    bg: 'var(--color-info-light)',
    border: 'var(--color-info-border)',
  },
  completed: {
    label: 'Completed',
    color: 'var(--color-success)',
    bg: 'var(--color-success-light)',
    border: 'var(--color-accent-border)',
  },
  overdue: {
    label: 'Overdue',
    color: 'var(--color-danger)',
    bg: 'var(--color-danger-light)',
    border: 'var(--color-danger-border)',
  },
};

/* ─── Domain types ───────────────────────────────────────────────────────── */

export interface Assessment {
  /** Convex `Id<"assessments">` (serialized as a string on the wire). */
  id: string;
  title: string;
  type: AssessmentType;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  priority: Priority;
  status: Exclude<Status, 'overdue'>;
  subject: string;
  description?: string;
  /** Unix ms — set by the server on insert. */
  createdAt?: number;
  /** Unix ms — bumped on every patch. */
  updatedAt?: number;
  /** Unix ms — only present when the item is completed. */
  completedAt?: number;
}

/* ─── User preferences ──────────────────────────────────────────────────── */

/**
 * View mode for the Assessments page. The view toggle component
 * imports it from here so we have a single type source — feature
 * modules and `UserPreferences` both reach for this file.
 */
export type ViewMode = 'list' | 'grid' | 'kanban';

/** Theme mode. `auto` follows the OS `prefers-color-scheme` at apply-time. */
export type Theme = 'light' | 'dark' | 'auto';

/** How dense the assessment rows are in list view. */
export type Density = 'compact' | 'comfortable';

/** Which day starts the calendar week. */
export type WeekStart = 'sunday' | 'monday';

/** When to send the reminder email before the due date. */
export type ReminderTiming = '1hour' | '3hours' | '1day' | '3days' | '1week';

export const REMINDER_LABELS: Record<ReminderTiming, string> = {
  '1hour': '1 hour before',
  '3hours': '3 hours before',
  '1day': '1 day before',
  '3days': '3 days before',
  '1week': '1 week before',
};

export const REMINDER_TIMINGS: ReminderTiming[] = [
  '1hour',
  '3hours',
  '1day',
  '3days',
  '1week',
];

/**
 * User preferences — mirrors the optional fields on
 * `convex/userPreferences.ts` (storage shape == wire shape). Every
 * field is optional; the client falls back to the defaults below when
 * a value is missing.
 */
export interface UserPreferences {
  theme?: Theme;
  defaultView?: ViewMode;
  density?: Density;
  weekStart?: WeekStart;
  showWeekNumbers?: boolean;
  timezone?: string;
  emailNotifications?: boolean;
  reminderTiming?: ReminderTiming;
  dailyDigest?: boolean;
  autoBackup?: boolean;
}

/** Bundled defaults — used when no doc exists yet (first-run). */
export const DEFAULT_PREFERENCES: Required<UserPreferences> = {
  theme: 'light',
  defaultView: 'list',
  density: 'comfortable',
  weekStart: 'sunday',
  showWeekNumbers: false,
  timezone: 'auto',
  emailNotifications: true,
  reminderTiming: '1day',
  dailyDigest: false,
  autoBackup: true,
};

/**
 * Merge a possibly-incomplete prefs doc with the bundled defaults.
 * Re-exported as a helper so the same fallback applies everywhere
 * (Settings page, useTheme, useWeekStart, etc.).
 */
export function resolvePreferences(
  raw: UserPreferences | null | undefined,
): Required<UserPreferences> {
  return { ...DEFAULT_PREFERENCES, ...(raw ?? {}) };
}
