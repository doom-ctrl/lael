import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/components/providers/Toaster';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInValues = z.infer<typeof schema>;

interface SignInFormProps {
  /**
   * Called after a successful sign-in. Receives the path the user was
   * originally trying to visit (from router state) so the caller can
   * decide where to send them — typically the dashboard.
   */
  onSuccess?: (from?: string) => void;
}

const inputClass = cn(
  'h-10 rounded-md border border-border bg-surface px-3 text-[13.5px] text-text-primary',
  'placeholder:text-text-tertiary',
  'transition-[border-color,box-shadow] duration-150',
  'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/10',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

/**
 * SignInForm — controlled email + password form wired to Better Auth.
 *
 * Errors from Better Auth (`USER_NOT_FOUND`, `INVALID_EMAIL_OR_PASSWORD`,
 * etc.) are surfaced as a single inline error above the submit button —
 * we don't leak which field is wrong, just like the prototype's calm tone.
 */
export function SignInForm({ onSuccess }: SignInFormProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const [serverError, setServerError] = React.useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setServerError(
        error.message ?? 'Invalid email or password. Please try again.',
      );
      toast.error('Couldn’t sign you in');
      return;
    }
    toast.success('Welcome back');
    if (onSuccess) {
      onSuccess(from);
    } else {
      navigate(from && from !== '/sign-in' ? from : '/', { replace: true });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <span className="text-[11px] text-danger">{errors.email.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <span className="text-[11px] text-danger">
            {errors.password.message}
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
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}
