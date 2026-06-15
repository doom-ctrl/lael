import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { FullPageSpinner } from '@/components/common/FullPageSpinner';

/**
 * ProtectedRoute — wraps a subtree of routes that require authentication.
 *
 * - While the session / user query is loading: show a full-page spinner so
 *   we don't briefly flash the sign-in page on every refresh.
 * - When unauthenticated: redirect to `/sign-in`, preserving the originally
 *   requested path in router state so the sign-in flow can bounce the user
 *   back after they authenticate.
 * - When authenticated: render the child routes via `<Outlet />`.
 */
export function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) {
    return (
      <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
