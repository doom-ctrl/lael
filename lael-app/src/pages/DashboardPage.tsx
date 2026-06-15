import { ArrowRight, Calendar } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { AssessmentRow } from '@/features/assessments/AssessmentRow';
import {
  useDashboardData,
  useAssessmentMutations,
} from '@/features/assessments/useAssessments';
import { useAuth } from '@/features/auth/useAuth';
import { useAddAssessmentDialog } from '@/components/modals/AddAssessmentDialogProvider';
import { formatLongDate, getGreeting } from '@/lib/utils';

/**
 * DashboardPage — greeting header, Due Today spotlight + 4 stat tiles,
 * then a two-column "Upcoming" / "Completed" split.
 *
 * All data comes from Convex via `useDashboardData` (which wraps the
 * `assessments.list` + `assessments.counts` queries). Marking a row
 * complete calls `mutations.markComplete`, which round-trips through
 * Convex and the row re-renders.
 */
export function DashboardPage() {
  const { user } = useAuth();
  const dialog = useAddAssessmentDialog();
  const data = useDashboardData();
  const { markComplete } = useAssessmentMutations();

  // Show first name (or "there" as a fallback) for the greeting.
  const firstName = (user?.name ?? '').split(' ')[0] || 'there';
  const today = new Date();

  if (!data) {
    return (
      <PageTransition className="min-h-screen bg-bg text-text-primary">
        <Navbar />
        <PageContainer>
          <PageHeader
            title={`${getGreeting(today)}, ${firstName}`}
            subtitle={formatLongDate(today)}
          />
          <LoadingState />
        </PageContainer>
      </PageTransition>
    );
  }

  const {
    upcoming,
    completed,
    spotlight,
    thisWeekCount,
    counts,
  } = data;
  const completionRate =
    counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  return (
    <PageTransition className="min-h-screen bg-bg text-text-primary">
      <Navbar />

      <PageContainer>
        <PageHeader
          title={`${getGreeting(today)}, ${firstName}`}
          subtitle={formatLongDate(today)}
          actions={
            <a
              href="/calendar"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-[7px] text-[12px] text-text-primary no-underline"
            >
              <Calendar
                className="h-3 w-3 text-text-secondary"
                strokeWidth={1.4}
              />
              Calendar
            </a>
          }
        />

        {/* Empty state: no assessments at all. CTA to add the first one. */}
        {counts.total === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="6"
                    y="9"
                    width="28"
                    height="22"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    className="text-border"
                  />
                  <path
                    d="M6 16h28"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    className="text-border"
                  />
                  <path
                    d="M14 6v6M26 6v6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    className="text-border"
                  />
                </svg>
              }
              title="No assessments yet"
              description="Add your first exam, quiz, or assignment to get started."
              actionLabel="Add Assessment"
              onAction={dialog.open}
            />
          </div>
        ) : (
          <>
            {/* Spotlight + stats row */}
            <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.6fr]">
              {/* Spotlight */}
              <div
                className="relative overflow-hidden rounded-xl border px-[18px] py-[14px] shadow-soft"
                style={{
                  background: spotlight
                    ? 'linear-gradient(135deg, var(--color-accent-light) 0%, var(--color-bg-warm) 100%)'
                    : 'var(--color-surface)',
                  borderColor: spotlight
                    ? 'var(--color-accent-border)'
                    : 'var(--color-border)',
                }}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-md"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="7" cy="7" r="3" fill="white" />
                      <path
                        d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M2.5 11.5l1-1M10.5 3.5l1-1"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-accent">
                    {spotlight ? 'Due Today' : 'All Clear Today'}
                  </div>
                </div>
                {spotlight ? (
                  <>
                    <div className="mb-1 font-display text-[22px] font-normal italic leading-tight tracking-[-0.01em] text-text-primary">
                      {spotlight.title}
                    </div>
                    <div className="text-[11.5px] text-text-secondary">
                      {spotlight.subject} · {spotlight.type}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-1 font-display text-[22px] font-normal italic leading-tight tracking-[-0.01em] text-text-primary">
                      Nothing due today
                    </div>
                    <div className="text-[11.5px] text-text-secondary">
                      Enjoy the breathing room.
                    </div>
                  </>
                )}
              </div>

              {/* 4 stat cards */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <StatCard
                  label="Pending"
                  value={counts.pending}
                  color="var(--color-warning)"
                />
                <StatCard
                  label="This Week"
                  value={thisWeekCount}
                  color="var(--color-info)"
                />
                <StatCard
                  label="Completed"
                  value={counts.completed}
                  color="var(--color-success)"
                />
                <StatCard
                  label="Total"
                  value={counts.total}
                  color="var(--color-accent)"
                />
              </div>
            </div>

            {/* Two-column: Upcoming + Completed */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
              {/* Upcoming */}
              <div>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <div>
                    <h2 className="mb-0.5 font-display text-[22px] font-normal italic leading-none tracking-[-0.01em] text-text-primary">
                      Upcoming
                    </h2>
                    <p className="text-[11.5px] text-text-tertiary">
                      {upcoming.length === 0
                        ? 'All caught up — nothing pending.'
                        : `${upcoming.length} pending ${upcoming.length === 1 ? 'item' : 'items'}, sorted by due date`}
                    </p>
                  </div>
                  {upcoming.length > 0 && (
                    <a
                      href="/assessments"
                      className="flex items-center gap-1 text-[12px] font-medium text-accent no-underline hover:underline"
                    >
                      View all {upcoming.length}
                      <ArrowRight className="h-2.5 w-2.5" strokeWidth={1.4} />
                    </a>
                  )}
                </div>
                {upcoming.length === 0 ? (
                  <div className="rounded-[10px] border border-border-light bg-surface px-4 py-6 text-center text-[12px] text-text-tertiary">
                    You're all caught up. Add something new to plan ahead.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {upcoming.slice(0, 6).map((item) => (
                      <AssessmentRow
                        key={item.id}
                        item={item}
                        onToggleComplete={(_, completed) =>
                          markComplete({ id: item.id as never, completed })
                        }
                        onEdit={(it) => dialog.openEdit(it)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Completed */}
              <div>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <div>
                    <h2 className="mb-0.5 font-display text-[22px] font-normal italic leading-none tracking-[-0.01em] text-text-primary">
                      Completed
                    </h2>
                    <p className="text-[11.5px] text-text-tertiary">
                      {counts.total > 0
                        ? `${completionRate}% completion rate`
                        : 'No completions yet'}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {counts.total > 0 && (
                  <div className="mb-2.5 rounded-[10px] border border-border-light bg-surface px-[14px] py-3 shadow-soft">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
                        Progress
                      </span>
                      <span className="text-[11px] font-medium text-text-primary">
                        {counts.completed} / {counts.total}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-[3px] bg-bg-warm">
                      <div
                        className="h-full rounded-[3px] transition-all duration-500"
                        style={{
                          width: `${completionRate}%`,
                          background: 'linear-gradient(90deg, var(--color-success) 0%, var(--color-accent) 100%)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {completed.length === 0 ? (
                  <div className="rounded-[10px] border border-border-light bg-surface px-4 py-6 text-center text-[12px] text-text-tertiary">
                    Complete an assessment to see it here.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {completed.slice(0, 4).map((item) => (
                      <AssessmentRow
                        key={item.id}
                        item={item}
                        onToggleComplete={(_, completed) =>
                          markComplete({ id: item.id as never, completed })
                        }
                        onEdit={(it) => dialog.openEdit(it)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </PageContainer>
    </PageTransition>
  );
}
