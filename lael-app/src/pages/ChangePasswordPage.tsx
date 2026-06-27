import { useNavigate } from 'react-router-dom';
import { SecurityCardLayout } from '@/components/layout/SecurityCardLayout';
import { ChangePasswordForm } from '@/features/auth/ChangePasswordForm';

/**
 * ChangePasswordPage — authenticated route at `/settings/change-password`.
 *
 * Renders the password-rotation card. On success the form's
 * `onSuccess` redirects back to Settings so the user lands where they
 * started. The "revoke other sessions" toggle is hard-coded inside
 * `ChangePasswordForm` (it's the secure default — not user-toggleable
 * to avoid the "I'll do it later" footgun).
 */
export function ChangePasswordPage() {
  const navigate = useNavigate();
  return (
    <SecurityCardLayout
      title="Change your password"
      description="Pick a new password. You'll stay signed in on this device only."
    >
      <ChangePasswordForm onSuccess={() => navigate('/settings')} />
    </SecurityCardLayout>
  );
}
