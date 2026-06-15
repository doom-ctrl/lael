import * as React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { ViewToggle, type ViewMode } from '@/components/common/ViewToggle';
import { SortSelect, type SortKey } from '@/components/common/SortSelect';
import { AssessmentRow } from '@/features/assessments/AssessmentRow';
import { AssessmentCard } from '@/features/assessments/AssessmentCard';
import { KanbanCard } from '@/features/assessments/KanbanCard';
import { AssessmentFilters } from '@/features/assessments/AssessmentFilters';
import {
  useAssessments,
  useAssessmentMutations,
} from '@/features/assessments/useAssessments';
import { useAddAssessmentDialog } from '@/components/modals/AddAssessmentDialogProvider';
import { useUserPreferences } from '@/features/preferences/useUserPreferences';
import { isOverdue } from '@/lib/utils';
import {
  type Assessment,
  type AssessmentType,
  type Status,
} from '@/lib/design-tokens';

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const KANBAN_COLUMNS: Array<{
  key: Status;
  label: string;
  color: string;
  /** Filter predicate: returns true if the item belongs in this column. */
  match: (item: Assessment) => boolean;
}> = [
  {
    key: 'pending',
    label: 'Pending',
    color: 'var(--color-text-secondary)',
    match: (i) => i.status === 'pending' && !isOverdue(i.dueDate, i.status),
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    color: 'var(--color-info)',
    match: (i) => i.status === 'in_progress',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    color: 'var(--color-danger)',
    match: (i) => isOverdue(i.dueDate, i.status) && i.status !== 'completed',
  },
  {
    key: 'completed',
    label: 'Completed',
    color: 'var(--color-success)',
    match: (i) => i.status === 'completed',
  },
];

/**
 * AssessmentsPage — the all-assessments view.
 * Three display modes (List/Grid/Kanban), search, type + status filters,
 * and sort. Data is loaded from Convex; row checkbox + edit/delete all
 * round-trip through the Convex mutations.
 */
export function AssessmentsPage() {
  const assessments = useAssessments();
  const { markComplete } = useAssessmentMutations();
  const dialog = useAddAssessmentDialog();
  const { prefs } = useUserPreferences();

  // The view starts in the user's preferred mode from Settings, but
  // `setView` is a normal local-state setter — changing the view on
  // this page doesn't write back to preferences (the segmented
  // control is "session-local" while Settings writes the default).
  // Only the Settings page's SegmentedControl persists.
  const [view, setView] = React.useState<ViewMode>(prefs.defaultView);
  const [filterType, setFilterType] = React.useState<AssessmentType | 'all'>(
    'all',
  );
  const [filterStatus, setFilterStatus] = React.useState<Status | 'all'>(
    'all',
  );
  const [search, setSearch] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortKey>('due');

  // If the user changes their preferred default in Settings while
  // they're on this page, snap the current view to match. We only
  // do this on a real change (not the initial render) so a quick
  // re-mount doesn't fight the user's in-session choice.
  const lastDefaultRef = React.useRef<ViewMode>(prefs.defaultView);
  React.useEffect(() => {
    if (
      prefs.defaultView !== lastDefaultRef.current &&
      // Only auto-jump if the user hasn't moved off the default.
      view === lastDefaultRef.current
    ) {
      setView(prefs.defaultView);
    }
    lastDefaultRef.current = prefs.defaultView;
  }, [prefs.defaultView, view]);

  // Counts per type — used for chip badges.
  const typeCounts = React.useMemo(() => {
    const counts: Record<AssessmentType | 'all', number> = {
      all: assessments?.length ?? 0,
      exam: 0,
      quiz: 0,
      assignment: 0,
      project: 0,
      other: 0,
    };
    assessments?.forEach((a) => {
      counts[a.type]++;
    });
    return counts;
  }, [assessments]);

  // Apply filters.
  const filtered = React.useMemo(() => {
    if (!assessments) return [];
    const term = search.trim().toLowerCase();
    return assessments.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (filterStatus !== 'all') {
        if (filterStatus === 'overdue') {
          if (!isOverdue(item.dueDate, item.status)) return false;
        } else if (item.status !== filterStatus) {
          return false;
        }
      }
      if (term) {
        const inTitle = item.title.toLowerCase().includes(term);
        const inSubject = item.subject.toLowerCase().includes(term);
        if (!inTitle && !inSubject) return false;
      }
      return true;
    });
  }, [assessments, filterType, filterStatus, search]);

  // Apply sort.
  const sorted = React.useMemo(() => {
    const items = [...filtered];
    if (sortBy === 'due') {
      items.sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
    } else if (sortBy === 'priority') {
      items.sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority] ?? 99) -
          (PRIORITY_ORDER[b.priority] ?? 99),
      );
    } else if (sortBy === 'title') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }
    return items;
  }, [filtered, sortBy]);

  if (assessments === undefined) {
    return (
      <PageTransition className="min-h-screen bg-bg text-text-primary">
        <Navbar />
        <PageContainer>
          <PageHeader title="Loading…" />
          <LoadingState />
        </PageContainer>
      </PageTransition>
    );
  }

  const totalCount = assessments.length;
  const handleToggle = (item: Assessment, completed: boolean) =>
    markComplete({ id: item.id as never, completed });

  return (
    <PageTransition className="min-h-screen bg-bg text-text-primary">
      <Navbar />

      <PageContainer>
        <PageHeader
          title={`${sorted.length} item${sorted.length === 1 ? '' : 's'}`}
          subtitle={
            sorted.length === totalCount
              ? `of ${totalCount} total`
              : `${sorted.length} of ${totalCount}`
          }
          actions={
            <>
              <SortSelect value={sortBy} onChange={setSortBy} />
              <ViewToggle value={view} onChange={setView} />
            </>
          }
        />

        {/* Sticky filter bar */}
        <AssessmentFilters
          sticky
          search={search}
          onSearchChange={setSearch}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          typeCounts={typeCounts}
        />

        {/* Content */}
        <div className="mt-4">
          {totalCount === 0 ? (
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
            />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    className="text-border"
                  />
                </svg>
              }
              title="No assessments match"
              description="Try adjusting your filters or search to find what you're looking for."
            />
          ) : view === 'list' ? (
            <div className="flex flex-col gap-1.5">
              {sorted.map((item) => (
                <AssessmentRow
                  key={item.id}
                  item={item}
                  onToggleComplete={handleToggle}
                  onEdit={(it) => dialog.openEdit(it)}
                />
              ))}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
              {sorted.map((item) => (
                <AssessmentCard
                  key={item.id}
                  item={item}
                  onClick={(it) => dialog.openEdit(it)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {KANBAN_COLUMNS.map((col) => {
                const items = sorted.filter((i) => col.match(i));
                return (
                  <div
                    key={col.key}
                    className="flex min-h-[200px] flex-col rounded-xl border border-border bg-surface p-[14px]"
                  >
                    <div className="mb-3 flex items-center justify-between border-b border-border-light pb-2.5">
                      <h3 className="m-0 flex items-center gap-1.5 font-display text-[13px] font-medium italic tracking-[-0.01em] text-text-primary">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: col.color }}
                        />
                        {col.label}
                      </h3>
                      <span className="rounded-[10px] bg-surface-alt px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
                        {items.length}
                      </span>
                    </div>
                    <div className="flex-1">
                      {items.length === 0 ? (
                        <div className="px-2.5 py-5 text-center font-display text-[11px] italic text-text-tertiary">
                          Nothing here
                        </div>
                      ) : (
                        items.map((item) => (
                          <KanbanCard
                            key={item.id}
                            item={item}
                            onClick={(it) => dialog.openEdit(it)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </PageTransition>
  );
}
