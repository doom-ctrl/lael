import { Link, useNavigate } from 'react-router-dom';
import * as React from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { SignUpForm } from '@/features/auth/SignUpForm';
import { useAuth } from '@/features/auth/useAuth';
import { FullPageSpinner } from '@/components/common/FullPageSpinner';

/**
 * SignUpPage — entry point for new users.
 *
 * If a session is already present (e.g. they refreshed the page after
 * sign-up), we bounce them to the dashboard so they don't see the form
 * again.
 */
export function SignUpPage() {
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
          Create your account
        </h1>
        <p className="text-[12.5px] text-text-secondary">
          A calmer way to track what's due.
        </p>
      </header>

      <SignUpForm />

      <p className="mt-5 text-center text-[12px] text-text-secondary">
        Already have an account?{' '}
        <Link
          to="/sign-in"
          className="font-medium text-accent no-underline hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
