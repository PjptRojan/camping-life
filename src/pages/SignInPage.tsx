/**
 * SignInPage.tsx
 * -----------------------------------------------------------------------------
 * Route-level wrapper around the <SignIn> presentational component. Calls the
 * sign-in API and, on success, redirects to the dashboard. Submit errors are
 * thrown so <SignIn> can show them in its banner (the API layer also toasts).
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { SignIn } from '@/components';
import { signIn, type SignInPayload } from '@/services/api';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';

export default function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Where the protected route wanted to send them, if anything.
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const handleSignIn = async (payload: SignInPayload): Promise<void> => {
    const { token, user } = await signIn(payload);
    // Store in Redux so the axios interceptor authorizes later calls.
    dispatch(setCredentials({ token, user }));
    // Send them back where they were headed (or the dashboard by default).
    navigate(from, { replace: true });
  };

  return <SignIn onSubmit={handleSignIn} />;
}
