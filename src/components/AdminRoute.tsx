/**
 * AdminRoute.tsx
 * -----------------------------------------------------------------------------
 * Route guard for the admin dashboard. Layers on top of the same auth check
 * `ProtectedRoute` uses: an unauthenticated visitor is bounced to /signin
 * (remembering where they were headed), while a signed-in but non-admin user is
 * sent back to the booking dashboard. The server enforces the same boundary —
 * this guard is purely to keep the UI honest.
 */

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { selectIsAdmin, selectIsAuthenticated } from '@/store/selectors';

interface AdminRouteProps {
  /** The admin-only page to render once access is confirmed. */
  children: ReactNode;
}

/** Renders `children` only for signed-in admins; otherwise redirects. */
export function AdminRoute({ children }: AdminRouteProps): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    // Signed in but lacking the role — send them to the regular dashboard.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
