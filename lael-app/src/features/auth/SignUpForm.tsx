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
  name: z.string().min(1, 'Name is required').max(60),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export type SignUpValues = z.infer<typeof schema>;

interface SignUpFormProps {
  /** Optional override for where to navigate after successful sign-up. */
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
 * SignUpForm — name + email + password form wired to Better Auth.
 *
 * Better Auth defaults to `autoSignIn: true`, so a successful sign-up
 * returns an authenticated session in the same call — we just bounce the
 * user to the dashboard (or wherever they were heading).
 */
export function SignUpForm({ onSuccess }: SignUpFormProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const [serverError, setServerError] = React.useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (error) {
      setServerError(
        error.message ?? 'Could not create your account. Please try again.',
      );
      toast.error('Sign-up failed');
      return;
    }
    toast.success('Account created');
    if (onSuccess) {
      onSuccess(from);
    } else {
      navigate(from && from !== '/sign-in' && from !== '/sign-up' ? from : '/', {
        replace: true,
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Léo"
          className={inputClass}
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <span className="text-[11px] text-danger">{errors.name.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
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
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}
