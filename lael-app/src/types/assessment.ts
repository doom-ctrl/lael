/**
 * Assessment domain type — the canonical shape used across the app.
 * In Phase 3 this will become a generated Convex type.
 */

import type {
  AssessmentType,
  Priority,
  Status,
} from '@/lib/design-tokens';

export type { AssessmentType, Priority, Status };

/** A user-created or sample assessment. */
export interface Assessment {
  id: number | string;
  title: string;
  type: AssessmentType;
  /** ISO date string (YYYY-MM-DD). */
  dueDate: string;
  priority: Priority;
  status: Exclude<Status, 'overdue'>;
  subject: string;
  description?: string;
}

/** New assessment shape (no `id` yet — the store assigns it). */
export type NewAssessment = Omit<Assessment, 'id'>;
