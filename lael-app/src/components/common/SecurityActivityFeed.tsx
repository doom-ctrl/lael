import * as React from 'react';
import { KeyRound, Mail, Image as ImageIcon, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSecurityEvents } from '@/features/security/useSecurityEvents';

/**
 * SecurityActivityFeed — most-recent security events for the current
 * user. Rendered in Settings → Account so the user can spot
 * unauthorized changes at a glance.
 *
 * `undefined` = still loading (we render an empty section rather
 * than a spinner — Settings page is already busy).
 *
 * Each event type gets a label + icon + relative timestamp. The
 * `metadata` blob is humanized for the two cases we actually log
 * with content (email change: show from→to; avatar: just say
 * "changed").
 */
const TYPE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
> = {
  password_changed: { label: 'Password changed', icon: KeyRound },
  email_change_requested: { label: 'Email change requested', icon: Mail },
  email_changed: { label: 'Email changed', icon: Mail },
  avatar_changed: { label: 'Profile photo updated', icon: ImageIcon },
  avatar_removed: { label: 'Profile photo removed', icon: ImageIcon },
  signed_in: { label: 'Signed in', icon: LogIn },
};

function formatRelative(ts: number, now: number = Date.now()): string {
  const diffMs = now - ts;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  return new Date(ts).toLocaleDateString();
}

function describeMetadata(
  type: string,
  metadata: unknown,
): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const m = metadata as Record<string, unknown>;
  if (type === 'email_change_requested') {
    if (typeof m.fromEmail === 'string' && typeof m.toEmail === 'string') {
      return `${m.fromEmail} → ${m.toEmail}`;
    }
  }
  return null;
}

interface SecurityActivityFeedProps {
  /** How many events to fetch. Defaults to 5. */
  limit?: number;
  className?: string;
}

export function SecurityActivityFeed({
  limit = 5,
  className,
}: SecurityActivityFeedProps) {
  const events = useSecurityEvents(limit);

  if (events === undefined) return null; // still loading — render nothing
  if (events.length === 0) {
    return (
      <p className={cn('text-[11px] text-text-tertiary', className)}>
        No security events yet — they'll appear here after your first
        sign-in or settings change.
      </p>
    );
  }

  return (
    <ul className={cn('flex flex-col', className)}>
      {events.map((ev) => {
        const meta = TYPE_META[ev.type] ?? {
          label: ev.type,
          icon: KeyRound,
        };
        const Icon = meta.icon;
        const detail = describeMetadata(ev.type, ev.metadata);
        return (
          <li
            key={ev._id}
            className="flex items-start gap-2.5 border-b border-border-light py-2 last:border-b-0"
          >
            <span
              className={cn(
                'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                'bg-bg-warm text-text-secondary',
              )}
            >
              <Icon className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-text-primary">{meta.label}</div>
              {detail && (
                <div className="truncate text-[10.5px] text-text-tertiary">
                  {detail}
                </div>
              )}
            </div>
            <time
              dateTime={new Date(ev.createdAt).toISOString()}
              className="flex-shrink-0 text-[10.5px] text-text-tertiary"
            >
              {formatRelative(ev.createdAt)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
