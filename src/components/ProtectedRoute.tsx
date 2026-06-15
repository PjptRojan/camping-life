/**
 * ProtectedRoute.tsx
 * -----------------------------------------------------------------------------
 * Route guard for members-only pages. Reads auth state from Redux: if there's
 * no signed-in user it bounces to /signin (remembering where they were headed
 * so we can send them back after login); otherwise it renders the route.
 *
 * Usage — wrap a route element:
 *   <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { selectIsAuthenticated } from '@/store/selectors';

interface ProtectedRouteProps {
  /** The protected page to render once we've confirmed the user is signed in. */
  children: ReactNode;
}

/** Renders `children` only when authenticated; otherwise redirects to sign-in. */
export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // `replace` so the guarded URL doesn't linger in history; `state.from`
    // lets the sign-in page send the user back where they intended to go.
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
