/**
 * SignUpPage.tsx
 * -----------------------------------------------------------------------------
 * Route-level wrapper around the <SignUp> presentational component. Owns the
 * side effects: calls the sign-up API and, on success, redirects to the
 * dashboard. Submit errors are thrown so <SignUp> can show them in its banner.
 */

import { useNavigate } from 'react-router-dom';
import { SignUp } from '@/components';
import { signUp, type SignUpPayload } from '@/services/api';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';

export default function SignUpPage(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSignUp = async (payload: SignUpPayload): Promise<void> => {
    const { token, user } = await signUp(payload);
    // Store in Redux so the axios interceptor authorizes later calls.
    dispatch(setCredentials({ token, user }));
    // On success, send the new member to the dashboard.
    navigate('/');
  };

  return <SignUp onSubmit={handleSignUp} />;
}
