import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  Download,
  Edit,
  KeyRound,
  LogOut,
  Mail,
  Trash2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import {
  SettingsRow,
  SettingsSection,
} from '@/components/common/SettingsSection';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Toggle } from '@/components/common/Toggle';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/features/auth/useAuth';
import { authClient } from '@/lib/auth-client';
import { useUserPreferences } from '@/features/preferences/useUserPreferences';
import { useAssessments } from '@/features/assessments/useAssessments';
import { useUserImage } from '@/features/profile/useUserImage';
import { SecurityActivityFeed } from '@/components/common/SecurityActivityFeed';
import {
  cn,
} from '@/lib/utils';
import {
  DEFAULT_PREFERENCES,
  REMINDER_LABELS,
  REMINDER_TIMINGS,
  type Assessment,
  type Density,
  type ReminderTiming,
  type Theme,
  type WeekStart,
} from '@/lib/design-tokens';
import type { ViewMode } from '@/components/common/ViewToggle';

const inputClass = cn(
  'h-8 rounded-md border border-border bg-surface px-2.5 text-[12px] text-text-primary',
  'transition-[border-color,box-shadow] duration-150',
  'focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/10',
);

const buttonClass = cn(
  'h-8 rounded-md border border-border bg-surface px-3 text-[11px] font-medium text-text-primary',
  'transition-colors duration-150',
  'hover:bg-bg-warm',
  'inline-flex items-center gap-1.5',
);

const dangerButtonClass = cn(
  'h-8 rounded-md border border-danger-border bg-danger-light px-3 text-[11px] font-medium text-danger',
  'transition-colors duration-150',
  'hover:bg-danger hover:text-white',
  'inline-flex items-center gap-1.5',
);

/* ─── Data export helpers ───────────────────────────────────────────────── */

/**
 * Build a filename like `lael-export-2026-06-15.json`.
 */
function exportFilename(ext: 'json' | 'csv'): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `lael-export-${yyyy}-${mm}-${dd}.${ext}`;
}

/**
 * Serialize a single assessment to the JSON export payload. The shape
 * is the same as the client `Assessment` type, so users can re-import
 * later (Phase 5) without translation.
 */
function assessmentToJSON(a: Assessment) {
  return {
    id: a.id,
    title: a.title,
    subject: a.subject,
    type: a.type,
    priority: a.priority,
    status: a.status,
    dueDate: a.dueDate,
    description: a.description ?? '',
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    completedAt: a.completedAt,
  };
}

/**
 * CSV cell escaping per RFC 4180: wrap in double-quotes if the value
 * contains a comma, double-quote, or newline; double-up any embedded
 * double-quotes.
 */
function csvCell(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Assessment → flat CSV row. Columns mirror `assessmentToJSON`. */
function assessmentToCSVRow(a: Assessment): string {
  return [
    csvCell(a.id),
    csvCell(a.title),
    csvCell(a.subject),
    csvCell(a.type),
    csvCell(a.priority),
    csvCell(a.status),
    csvCell(a.dueDate),
    csvCell(a.description ?? ''),
    csvCell(a.createdAt ?? ''),
    csvCell(a.updatedAt ?? ''),
    csvCell(a.completedAt ?? ''),
  ].join(',');
}

const CSV_HEADER = [
  'id',
  'title',
  'subject',
  'type',
  'priority',
  'status',
  'dueDate',
  'description',
  'createdAt',
  'updatedAt',
  'completedAt',
];

/**
 * Trigger a browser download of the given content. Works for
 * reasonably-sized payloads (an end user with thousands of
 * assessments should still be fine; we'd stream anything larger).
 */
function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Defer revoke so the browser has a chance to start the download
  // — `setTimeout(..., 0)` would race some browsers; 100ms is safe.
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function buildJSONExport(items: Assessment[], user: { name?: string; email?: string } | null) {
  return JSON.stringify(
    {
      app: 'Lael',
      version: 1,
      exportedAt: new Date().toISOString(),
      user: user
        ? { name: user.name ?? null, email: user.email ?? null }
        : null,
      count: items.length,
      assessments: items.map(assessmentToJSON),
    },
    null,
    2,
  );
}

function buildCSVExport(items: Assessment[]): string {
  const lines = [CSV_HEADER.join(',')];
  for (const item of items) {
    lines.push(assessmentToCSVRow(item));
  }
  // CSV "should" end with a newline. Spreadsheet apps handle either.
  return lines.join('\n') + '\n';
}

/* ─── SettingsPage ──────────────────────────────────────────────────────── */

/**
 * SettingsPage — 2-column grid of 6 settings sections, all wired to
 * the persistent `userPreferences` Convex table.
 *
 * Each control updates the underlying prefs doc via a partial patch
 * (see `convex/userPreferences.ts`); there is no "Save" button —
 * the Settings page is a live mirror of what the user has chosen,
 * and the change is reflected everywhere else the moment Convex
 * propagates the new value (typically < 100ms).
 *
 * Data export pulls from the real `useAssessments` query — no
 * sample / hard-coded data.
 */
export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { prefs, raw, update } = useUserPreferences();
  const assessments = useAssessments();
  const { imageUrl, isUploading, upload, remove: removeImage } = useUserImage();
  const [editingProfile, setEditingProfile] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Revoke object URLs on unmount / when replaced so we don't leak
  // a blob per upload.
  React.useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // `prefs` is the merged view (defaults fill missing fields).
  // `raw`  is the on-disk doc, used to know whether the user has any
  // explicit prefs set (and thus whether to show the "Reset to
  // defaults" button at the top of the page).
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate('/sign-in', { replace: true }),
      },
    });
  };

  const handleExportJSON = () => {
    const items = assessments ?? [];
    if (items.length === 0) return;
    downloadFile(
      exportFilename('json'),
      buildJSONExport(items, user),
      'application/json',
    );
  };

  const handleExportCSV = () => {
    const items = assessments ?? [];
    if (items.length === 0) return;
    downloadFile(
      exportFilename('csv'),
      buildCSVExport(items),
      'text/csv;charset=utf-8',
    );
  };

  const handleResetPreferences = () => {
    // Re-send only the fields we know about, all set to defaults.
    // The mutation only patches fields that aren't `undefined`, so
    // we re-set every key to its default. The doc remains in place
    // (audit trail + future fields).
    void update({
      theme: DEFAULT_PREFERENCES.theme,
      defaultView: DEFAULT_PREFERENCES.defaultView,
      density: DEFAULT_PREFERENCES.density,
      weekStart: DEFAULT_PREFERENCES.weekStart,
      showWeekNumbers: DEFAULT_PREFERENCES.showWeekNumbers,
      emailNotifications: DEFAULT_PREFERENCES.emailNotifications,
      reminderTiming: DEFAULT_PREFERENCES.reminderTiming,
      dailyDigest: DEFAULT_PREFERENCES.dailyDigest,
      autoBackup: DEFAULT_PREFERENCES.autoBackup,
    });
  };

  const assessmentCount = assessments?.length ?? 0;

  return (
    <PageTransition className="min-h-screen bg-bg text-text-primary">
      <Navbar />

      <PageContainer>
        <PageHeader
          title="Preferences"
          subtitle="Customize Lael to fit how you work"
          actions={
            raw ? (
              <button
                type="button"
                onClick={handleResetPreferences}
                className={cn(buttonClass, 'text-text-secondary')}
                title="Reset all preferences to defaults"
              >
                Reset to defaults
              </button>
            ) : null
          }
        />

        {/* Two-column grid of compact sections */}
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {/* ─── Profile ────────────────────────────────────────────── */}
          <SettingsSection title="Profile">
            <div className="flex items-center gap-3.5 py-2.5">
              {/* Avatar — clickable while editing to open the file picker. */}
              <button
                type="button"
                onClick={() => {
                  if (editingProfile && !isUploading) fileInputRef.current?.click();
                }}
                disabled={!editingProfile || isUploading}
                title={editingProfile ? 'Choose a new photo' : undefined}
                aria-label={editingProfile ? 'Change profile photo' : undefined}
                className={cn(
                  'relative flex-shrink-0 rounded-full',
                  editingProfile && !isUploading
                    ? 'cursor-pointer hover:opacity-90'
                    : 'cursor-default',
                  isUploading && 'cursor-wait opacity-70',
                )}
              >
                <Avatar
                  src={previewUrl ?? imageUrl}
                  name={user?.name}
                  email={user?.email}
                  size={48}
                />
                {editingProfile && !isUploading && (
                  <span
                    className={cn(
                      'absolute inset-0 flex items-center justify-center rounded-full',
                      'bg-black/35 text-white opacity-0 transition-opacity',
                      'hover:opacity-100 focus-visible:opacity-100',
                    )}
                    aria-hidden="true"
                  >
                    <Camera className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                )}
                {isUploading && (
                  <span
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40"
                    aria-hidden="true"
                  >
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </span>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-text-primary">
                  {user?.name ?? 'Signed-in user'}
                </div>
                <div className="text-[11px] text-text-tertiary">
                  {user?.email ?? 'No email on file'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfile((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md border-none bg-transparent p-0"
                aria-expanded={editingProfile}
              >
                <Edit className="h-3 w-3 text-accent" strokeWidth={1.6} />
                <span className="text-[11px] font-medium text-accent">
                  {editingProfile ? 'Close' : 'Edit'}
                </span>
              </button>
            </div>

            {editingProfile ? (
              <>
                {/* Hidden file picker — driven by the avatar button + the
                    explicit "Upload photo" button. Accepts images only. */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    // Always clear the input so the same file can be
                    // re-selected after a failure.
                    e.target.value = '';
                    if (!file) return;
                    // Local preview while the upload runs.
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    const localUrl = URL.createObjectURL(file);
                    setPreviewUrl(localUrl);
                    try {
                      await upload(file);
                      // Server has the file now — drop the local preview
                      // so the avatar component renders the real URL.
                      URL.revokeObjectURL(localUrl);
                      setPreviewUrl(null);
                    } catch {
                      // Toast already shown; clear the local preview.
                      URL.revokeObjectURL(localUrl);
                      setPreviewUrl(null);
                    }
                  }}
                />

                <SettingsRow
                  label="Profile photo"
                  description={
                    isUploading
                      ? 'Uploading…'
                      : imageUrl
                        ? 'Shown in the navbar and anywhere your avatar appears.'
                        : 'Add a photo to personalize your account.'
                  }
                  control={
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={cn(
                          buttonClass,
                          isUploading && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        <Camera className="h-3 w-3" strokeWidth={1.6} />
                        {imageUrl ? 'Change' : 'Upload'}
                      </button>
                      {imageUrl && !isUploading && (
                        <button
                          type="button"
                          onClick={() => void removeImage()}
                          className={cn(dangerButtonClass)}
                          title="Remove profile photo"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={1.6} />
                          Remove
                        </button>
                      )}
                    </div>
                  }
                />
                <SettingsRow
                  label="Name"
                  description="Display name shown in the greeting and avatar."
                  control={
                    <input
                      type="text"
                      defaultValue={user?.name ?? ''}
                      // Profile name lives in the Better Auth user record,
                      // not the preferences table. Editing requires a
                      // server mutation we haven't wired yet — for now
                      // we surface the value but disable the input.
                      disabled
                      className={cn(
                        inputClass,
                        'w-[200px] cursor-not-allowed opacity-60 text-right',
                      )}
                    />
                  }
                />
                <SettingsRow
                  label="Email"
                  description="Email is set during sign-up. Contact support to change it."
                  control={
                    <input
                      type="email"
                      defaultValue={user?.email ?? ''}
                      disabled
                      className={cn(
                        inputClass,
                        'w-[200px] cursor-not-allowed opacity-60 text-right',
                      )}
                    />
                  }
                />
                <p className="mt-1 text-[10.5px] text-text-tertiary">
                  Name and email are managed by your sign-in account
                  and cannot be changed here.
                </p>
              </>
            ) : (
              <p className="text-[11px] text-text-tertiary">
                Your name and email are read from your sign-in account.
                Click <span className="font-medium text-text-secondary">Edit</span>{' '}
                to add a profile photo.
              </p>
            )}
          </SettingsSection>

          {/* ─── Appearance ─────────────────────────────────────────── */}
          <SettingsSection title="Appearance">
            <SettingsRow
              label="Theme"
              description={
                prefs.theme === 'auto'
                  ? 'Follows your system preference.'
                  : prefs.theme === 'dark'
                    ? 'Warm dark palette.'
                    : 'Warm cream palette.'
              }
              control={
                <SegmentedControl<Theme>
                  value={prefs.theme}
                  onChange={(theme) => update({ theme })}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto' },
                  ]}
                />
              }
            />
            <SettingsRow
              label="Default view"
              description="Which view the Assessments page opens with."
              control={
                <SegmentedControl<ViewMode>
                  value={prefs.defaultView}
                  onChange={(defaultView) => update({ defaultView })}
                  options={[
                    { value: 'list', label: 'List' },
                    { value: 'grid', label: 'Grid' },
                    { value: 'kanban', label: 'Kanban' },
                  ]}
                />
              }
            />
            <SettingsRow
              label="Density"
              description="Row padding in the list view (Phase 5)."
              control={
                <SegmentedControl<Density>
                  value={prefs.density}
                  onChange={(density) => update({ density })}
                  options={[
                    { value: 'compact', label: 'Compact' },
                    { value: 'comfortable', label: 'Comfy' },
                  ]}
                />
              }
            />
          </SettingsSection>

          {/* ─── Calendar ───────────────────────────────────────────── */}
          <SettingsSection title="Calendar">
            <SettingsRow
              label="Week starts on"
              description="First column in the calendar grid."
              control={
                <SegmentedControl<WeekStart>
                  value={prefs.weekStart}
                  onChange={(weekStart) => update({ weekStart })}
                  options={[
                    { value: 'sunday', label: 'Sunday' },
                    { value: 'monday', label: 'Monday' },
                  ]}
                />
              }
            />
            <SettingsRow
              label="Show week numbers"
              description="ISO-8601 week numbers in a left gutter (Phase 5)."
              control={
                <Toggle
                  on={prefs.showWeekNumbers}
                  onChange={(showWeekNumbers) => update({ showWeekNumbers })}
                  ariaLabel="Show week numbers"
                  disabled
                />
              }
            />
          </SettingsSection>

          {/* ─── Notifications ──────────────────────────────────────── */}
          <SettingsSection title="Notifications">
            <SettingsRow
              label="Email reminders"
              description="Receive an email before each due date."
              control={
                <Toggle
                  on={prefs.emailNotifications}
                  onChange={(emailNotifications) =>
                    update({ emailNotifications })
                  }
                  ariaLabel="Email reminders"
                />
              }
            />
            <SettingsRow
              label="Reminder timing"
              description={
                prefs.emailNotifications
                  ? 'How far ahead of the due date to send.'
                  : 'Enable email reminders to set a timing.'
              }
              className={cn(!prefs.emailNotifications && 'opacity-50')}
              control={
                <select
                  value={prefs.reminderTiming}
                  onChange={(e) =>
                    update({
                      reminderTiming: e.target.value as ReminderTiming,
                    })
                  }
                  disabled={!prefs.emailNotifications}
                  className={cn(
                    inputClass,
                    'w-[160px] cursor-pointer',
                    !prefs.emailNotifications && 'cursor-not-allowed',
                  )}
                >
                  {REMINDER_TIMINGS.map((t) => (
                    <option key={t} value={t}>
                      {REMINDER_LABELS[t]}
                    </option>
                  ))}
                </select>
              }
            />
            <SettingsRow
              label="Daily digest"
              description="Morning summary of what's due that day (Phase 6)."
              control={
                <Toggle
                  on={prefs.dailyDigest}
                  onChange={(dailyDigest) => update({ dailyDigest })}
                  ariaLabel="Daily digest"
                  disabled
                />
              }
            />
          </SettingsSection>

          {/* ─── Data ───────────────────────────────────────────────── */}
          <SettingsSection title="Your data">
            <SettingsRow
              label="Export"
              description={
                assessmentCount === 0
                  ? 'Nothing to export yet.'
                  : `Download all ${assessmentCount} ${
                      assessmentCount === 1 ? 'item' : 'items'
                    } as a file.`
              }
              control={
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    disabled={assessmentCount === 0}
                    className={cn(
                      buttonClass,
                      assessmentCount === 0 && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <Download className="h-3 w-3" strokeWidth={1.6} />
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={assessmentCount === 0}
                    className={cn(
                      buttonClass,
                      assessmentCount === 0 && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <Download className="h-3 w-3" strokeWidth={1.6} />
                    CSV
                  </button>
                </div>
              }
            />
            <SettingsRow
              label="Import from backup"
              description="Re-import a previously-exported JSON file (Phase 5)."
              control={
                <button
                  type="button"
                  disabled
                  className={cn(buttonClass, 'w-[110px] cursor-not-allowed opacity-50')}
                >
                  Choose file…
                </button>
              }
            />
            <SettingsRow
              label="Auto-backup"
              description="Save a snapshot to cloud storage nightly (Phase 6)."
              control={
                <Toggle
                  on={prefs.autoBackup}
                  onChange={(autoBackup) => update({ autoBackup })}
                  ariaLabel="Auto-backup"
                  disabled
                />
              }
            />
          </SettingsSection>

          {/* ─── Account ────────────────────────────────────────────── */}
          <SettingsSection title="Account">
            <SettingsRow
              label="Signed in as"
              description={user?.email ?? '—'}
              control={
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={dangerButtonClass}
                >
                  <LogOut className="h-3 w-3" strokeWidth={1.6} />
                  Sign out
                </button>
              }
            />
            <SettingsRow
              label="Change email"
              description="We'll send a verification link to the new address."
              control={
                <Link
                  to="/settings/change-email"
                  className={cn(buttonClass, 'no-underline')}
                >
                  <Mail className="h-3 w-3" strokeWidth={1.6} />
                  Change
                </Link>
              }
            />
            <SettingsRow
              label="Change password"
              description="You'll stay signed in on this device only."
              control={
                <Link
                  to="/settings/change-password"
                  className={cn(buttonClass, 'no-underline')}
                >
                  <KeyRound className="h-3 w-3" strokeWidth={1.6} />
                  Change
                </Link>
              }
            />
            <SettingsRow
              label="Two-factor auth"
              description="Add an extra layer of security (Phase 6)."
              control={
                <button
                  type="button"
                  disabled
                  className={cn(buttonClass, 'cursor-not-allowed opacity-50')}
                >
                  Enable
                </button>
              }
            />
            <SettingsRow
              label="Delete account"
              description="Permanently delete your data. This cannot be undone."
              control={
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed bg-transparent text-[11px] font-medium text-danger opacity-50 transition-opacity hover:opacity-50"
                >
                  Delete…
                </button>
              }
            />

            {/* Recent security activity — surfaces password / email /
                avatar changes so the user can spot unauthorized ones. */}
            <div className="mt-3 border-t border-border-light pt-3">
              <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
                Recent security activity
              </div>
              <SecurityActivityFeed limit={5} />
            </div>
          </SettingsSection>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-6 text-center">
          <p className="text-[11px] text-text-tertiary">
            Lael · v0.1.0 ·{' '}
            <a
              href="#"
              className="text-text-tertiary underline hover:text-text-secondary"
            >
              Privacy
            </a>{' '}
            ·{' '}
            <a
              href="#"
              className="text-text-tertiary underline hover:text-text-secondary"
            >
              Terms
            </a>
          </p>
        </div>
      </PageContainer>
    </PageTransition>
  );
}
