import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { SignInForm } from '@/features/auth/SignInForm';
import { useAuth } from '@/features/auth/useAuth';
import { FullPageSpinner } from '@/components/common/FullPageSpinner';
import * as React from 'react';

/**
 * SignInPage — entry point for existing users.
 *
 * If the user is already signed in (e.g. they hit the back button after
 * logging in), we redirect them straight to the dashboard so they don't
 * see a useless sign-in form.
 */
export function SignInPage() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) return <FullPageSpinner />;

  return (
    <AuthLayout>
      <header className="mb-5 text-center">
        <h1 className="mb-1 font-display text-[26px] font-normal italic leading-tight tracking-[-0.02em] text-text-primary">
          Welcome back
        </h1>
        <p className="text-[12.5px] text-text-secondary">
          Sign in to keep your assessments in order.
        </p>
      </header>

      <SignInForm />

      <p className="mt-5 text-center text-[12px] text-text-secondary">
        Don't have an account?{' '}
        <Link
          to="/sign-up"
          className="font-medium text-accent no-underline hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
