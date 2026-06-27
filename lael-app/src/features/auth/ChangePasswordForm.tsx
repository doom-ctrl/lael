import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/components/providers/Toaster';

/**
 * ChangePasswordForm — secure password rotation.
 *
 * Security model:
 *   - Re-authentication via current password. Without it, a
 *     session-hijacker on a stolen device could lock the user out.
 *   - New password must be at least 8 characters (matches the sign-up
 *     floor — server enforces the same).
 *   - Confirm field catches typos before the request goes out.
 *   - On success, other sessions are revoked (Better Auth default via
 *     `revokeOtherSessions: true`) — a stolen-cookie session loses
 *     access the moment the legitimate user rotates the password.
 *
 * Error UX:
 *   - We do NOT distinguish "current password is wrong" from "new
 *     password rejected by server" in the toast — both surface as a
 *     generic "Couldn't update your password" with the actual server
 *     message shown in the inline alert. Keeping the server detail
 *     visible (just not in the toast) helps the user without leaking
 *     account-enumeration signal to anyone watching the toast queue.
 *   - Inline error uses `role="alert"` so screen readers announce it.
 */
const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Re-enter your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match",
  })
  // Reject "new password equals current" client-side as well — the
  // server would reject it, but doing it here gives a friendlier
  // message and saves a round-trip.
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  });

export type ChangePasswordValues = z.infer<typeof schema>;

const inputClass = cn(
  'h-10 rounded-md border border-border bg-surface px-3 text-[13.5px] text-text-primary',
  'placeholder:text-text-tertiary',
  'transition-[border-color,box-shadow] duration-150',
  'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/10',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'pr-10', // room for the show/hide toggle
);

interface ChangePasswordFormProps {
  /** Called after a successful password change. */
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps = {}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const [serverError, setServerError] = React.useState<string | null>(null);
  // Independent visibility toggles — show-hide is a per-field affordance
  // so the user can compare the new password while typing the
  // confirmation without revealing the current one.
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  // Security-audit hooks. Best-effort: the password change itself
  // already succeeded by the time we call these. Failures here log
  // to the action's console + the security events table just gets a
  // missing row — never block the user-visible success path on them.
  const logSecurityEvent = useMutation(api.userSecurity.logSecurityEvent);
  const sendPasswordAlert = useAction(api.userSecurity.sendPasswordChangedAlert);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      // Revoke every other active session — the only one that stays
      // alive is the one making this request. Better Auth signs the
      // user back in on this device via the response cookie.
      revokeOtherSessions: true,
    });
    if (error) {
      // Don't surface the raw Better Auth message in the toast —
      // it's verbose ("invalid_password") and inconsistent across
      // versions. Show it inline so the user can read it; toast just
      // signals "something went wrong".
      setServerError(
        error.message ?? 'Could not update your password. Please try again.',
      );
      toast.error("Couldn't update your password");
      return;
    }
    // Wipe the form so a back-nav doesn't leave credentials in the
    // DOM (React unmounts on navigation, but this is belt-and-braces
    // for HMR / fast-refresh cases).
    reset();
    // Log the change for the "Recent security activity" feed. We
    // also fire a server-side alert email to the current address —
    // if an attacker did this, the user finds out from their inbox.
    // Both are fire-and-forget — never block the success UX on them.
    void logSecurityEvent({ type: 'password_changed' }).catch(() => {});
    void sendPasswordAlert({}).catch(() => {});
    toast.success('Password updated');
    onSuccess?.();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <div className="relative">
          <Input
            id="current-password"
            type={showCurrent ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass}
            aria-invalid={!!errors.currentPassword}
            {...register('currentPassword')}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
            aria-pressed={showCurrent}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-text-tertiary hover:text-text-secondary"
          >
            {showCurrent ? (
              <EyeOff className="h-3.5 w-3.5" strokeWidth={1.6} />
            ) : (
              <Eye className="h-3.5 w-3.5" strokeWidth={1.6} />
            )}
          </button>
        </div>
        {errors.currentPassword && (
          <span className="text-[11px] text-danger">
            {errors.currentPassword.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={inputClass}
            aria-invalid={!!errors.newPassword}
            {...register('newPassword')}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            aria-label={showNew ? 'Hide new password' : 'Show new password'}
            aria-pressed={showNew}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-text-tertiary hover:text-text-secondary"
          >
            {showNew ? (
              <EyeOff className="h-3.5 w-3.5" strokeWidth={1.6} />
            ) : (
              <Eye className="h-3.5 w-3.5" strokeWidth={1.6} />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <span className="text-[11px] text-danger">
            {errors.newPassword.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type={showNew ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter new password"
          className={inputClass}
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <span className="text-[11px] text-danger">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className={cn(
            'rounded-md border border-danger-border bg-danger-light px-3 py-2',
            'text-[12px] text-danger',
          )}
        >
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-10 w-full text-[13.5px]"
      >
        {isSubmitting ? (
          <>
            <Loader2
              className="h-3.5 w-3.5 animate-spin"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            Updating password…
          </>
        ) : (
          'Update password'
        )}
      </Button>

      <p className="text-[11px] text-text-tertiary">
        Updating your password will sign you out of every other device.
      </p>
    </form>
  );
}
