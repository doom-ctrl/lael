import { useNavigate } from 'react-router-dom';
import { SecurityCardLayout } from '@/components/layout/SecurityCardLayout';
import { ChangeEmailForm } from '@/features/auth/ChangeEmailForm';
import { useAuth } from '@/features/auth/useAuth';
import { FullPageSpinner } from '@/components/common/FullPageSpinner';

/**
 * ChangeEmailPage — authenticated route at `/settings/change-email`.
 *
 * Re-authentication is required (Better Auth's `changeEmail` accepts
 * the current password implicitly via the session cookie + the form's
 * own password field). The form blocks "change to the same value"
 * and surfaces a "check your inbox" state after Better Auth sends
 * the verification email.
 */
export function ChangeEmailPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;

  return (
    <SecurityCardLayout
      title="Change your email"
      description="We'll send a verification link to your new address."
    >
      <ChangeEmailForm
        currentEmail={user?.email}
        onSuccess={() => navigate('/settings')}
      />
    </SecurityCardLayout>
  );
}
