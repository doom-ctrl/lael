import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { AssessmentsPage } from '@/pages/AssessmentsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { GlobalShortcuts } from '@/components/providers/GlobalShortcuts';
import { CommandPaletteProvider } from '@/components/providers/CommandPaletteProvider';
import { AddAssessmentDialogProvider } from '@/components/modals/AddAssessmentDialogProvider';

/**
 * Router. The protected subtree (`/`, `/assessments`, `/calendar`,
 * `/settings`) is wrapped in `<ProtectedRoute />`, which redirects to
 * `/sign-in` if the user is not authenticated. The sign-in / sign-up
 * pages live outside that wrapper so anonymous users can reach them.
 *
 * The root layout route mounts `<GlobalShortcuts />` once for the
 * whole app. It registers the `Cmd+K` / `N` / `/` keydown listeners
 * (see `useGlobalShortcuts`) and renders the matched child route via
 * `<Outlet />`.
 *
 * Each page renders its own `Navbar` + `PageContainer`, and the
 * global providers (ErrorBoundary, AddAssessmentDialogProvider, etc.)
 * are mounted in `App`, which wraps `AppRouter` once.
 */
const router = createBrowserRouter([
  {
    element: (
      <AddAssessmentDialogProvider>
        <CommandPaletteProvider>
          <GlobalShortcuts />
          <Outlet />
        </CommandPaletteProvider>
      </AddAssessmentDialogProvider>
    ),
    children: [
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/sign-up', element: <SignUpPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'assessments', element: <AssessmentsPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
