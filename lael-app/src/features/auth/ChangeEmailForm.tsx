import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { CheckCircle2, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/components/providers/Toaster';

/**
 * ChangeEmailForm — secure email rotation.
 *
 * Security model:
 *   - Re-authentication via current password. Same reasoning as
 *     `ChangePasswordForm`: a stolen session should not be enough to
 *     redirect account-recovery emails to the attacker.
 *   - The new email is *not* applied instantly. Better Auth sends a
 *     verification link to the new address; until the user clicks it,
 *     the old email stays primary. This blocks the classic
 *     "support-account-takeover via email change" pattern.
 *   - Client-side check that the new email differs from the current
 *     one (avoids a useless round-trip + spammy "verify your email"
 *     mail to the user's own inbox).
 *   - After submitting, we show a "check your inbox" panel with the
 *     new address and a Resend button (rate-limited on the server).
 *
 * Error UX matches `ChangePasswordForm` — generic toast, server
 * detail shown inline.
 */
const schema = z
  .object({
    newEmail: z.string().min(1, 'Enter the new email').email('Enter a valid email'),
    currentPassword: z.string().min(1, 'Enter your current password'),
  })
  .refine((d) => d.newEmail.length > 0, {
    path: ['newEmail'],
    message: 'New email is required',
  });

export type ChangeEmailValues = z.infer<typeof schema>;

const inputClass = cn(
  'h-10 rounded-md border border-border bg-surface px-3 text-[13.5px] text-text-primary',
  'placeholder:text-text-tertiary',
  'transition-[border-color,box-shadow] duration-150',
  'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/10',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'pr-10',
);

interface ChangeEmailFormProps {
  /** The currently signed-in user's email — used to forbid "change to the same value". */
  currentEmail?: string | null;
  /** Called after the verification email is successfully sent. */
  onSuccess?: () => void;
}

export function ChangeEmailForm({
  currentEmail,
  onSuccess,
}: ChangeEmailFormProps = {}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangeEmailValues>({
    resolver: zodResolver(schema),
    defaultValues: { newEmail: '', currentPassword: '' },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- RHF's `watch()` is the documented way to read a field's current value; the React Compiler warning here is a perf-only caveat, not a correctness issue.
  const newEmail = watch('newEmail');
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);
  const logSecurityEvent = useMutation(api.userSecurity.logSecurityEvent);

  const sameAsCurrent =
    !!currentEmail &&
    newEmail.trim().toLowerCase() === currentEmail.trim().toLowerCase();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    if (currentEmail && values.newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setServerError('That is already your current email.');
      return;
    }
    const { error } = await authClient.changeEmail({
      newEmail: values.newEmail,
    });
    if (error) {
      setServerError(
        error.message ?? 'Could not start the email change. Please try again.',
      );
      toast.error("Couldn't update your email");
      return;
    }
    // Show the "check your inbox" state. We deliberately do NOT call
    // `onSuccess` (which would navigate away) — the user needs to
    // see what just happened and know where to look.
    setPendingEmail(values.newEmail);
    reset({ newEmail: '', currentPassword: '' });
    // Audit trail. Best-effort — failure here doesn't block the UX.
    void logSecurityEvent({
      type: 'email_change_requested',
      metadata: { fromEmail: currentEmail, toEmail: values.newEmail },
    }).catch(() => {});
    toast.success('Check both inboxes');
  });

  const handleResend = async () => {
    if (!pendingEmail) return;
    const { error } = await authClient.changeEmail({ newEmail: pendingEmail });
    if (error) {
      toast.error(error.message ?? 'Could not resend');
      return;
    }
    toast.success('Verification email re-sent');
  };

  // Success state — verification link sent.
  if (pendingEmail) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            'bg-accent-light text-accent',
          )}
        >
          <Mail className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h2 className="font-display text-[18px] font-normal italic text-text-primary">
            Check both inboxes
          </h2>
          <p className="text-[12.5px] text-text-secondary">
            We sent links to <strong>both</strong> addresses. Click the one
            in each inbox to finish changing your email.
          </p>
          <ul className="mx-auto inline-block space-y-1 rounded-md border border-border-light bg-bg-warm px-3 py-2 text-left text-[11.5px] text-text-secondary">
            <li>
              <span className="text-text-tertiary">New:</span>{' '}
              <span className="font-medium text-text-primary">{pendingEmail}</span>
            </li>
            <li>
              <span className="text-text-tertiary">Current:</span>{' '}
              <span className="font-medium text-text-primary">
                {currentEmail ?? '—'}
              </span>
            </li>
          </ul>
          <p className="text-[11px] text-text-tertiary">
            Your current email stays active until both links are clicked.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            className="h-10 w-full text-[13.5px]"
          >
            Resend both emails
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setPendingEmail(null);
              onSuccess?.();
            }}
            className="h-10 w-full text-[13.5px]"
          >
            Back to settings
          </Button>
        </div>
        <p className="text-[10.5px] text-text-tertiary">
          Don't recognize this? Ignore the emails — nothing changes until
          both are approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-email">New email</Label>
        <Input
          id="new-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
          aria-invalid={!!errors.newEmail || sameAsCurrent}
          {...register('newEmail')}
        />
        {errors.newEmail && (
          <span className="text-[11px] text-danger">{errors.newEmail.message}</span>
        )}
        {!errors.newEmail && sameAsCurrent && (
          <span className="text-[11px] text-danger">
            That is already your current email.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="current-password-email">Current password</Label>
        <div className="relative">
          <Input
            id="current-password-email"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass}
            aria-invalid={!!errors.currentPassword}
            {...register('currentPassword')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-text-tertiary hover:text-text-secondary"
          >
            {showPassword ? (
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
        <span className="text-[10.5px] text-text-tertiary">
          We ask again to make sure it's really you.
        </span>
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
        disabled={isSubmitting || sameAsCurrent}
        className="h-10 w-full text-[13.5px]"
      >
        {isSubmitting ? (
          <>
            <Loader2
              className="h-3.5 w-3.5 animate-spin"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            Sending verification…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            Send verification email
          </>
        )}
      </Button>

      <p className="text-[11px] text-text-tertiary">
        Your email won't change until you click the link we send.
      </p>
    </form>
  );
}
