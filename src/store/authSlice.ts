/**
 * authSlice.ts
 * -----------------------------------------------------------------------------
 * Owns the authenticated session — the bearer token and the signed-in user.
 * This replaces the old localStorage wrapper: Redux is now the single source of
 * truth the axios interceptor reads from and the auth pages write to.
 *
 * Note: state lives in memory only, so a full page refresh signs the user out.
 * If you need the session to survive reloads, hydrate `initialState.token` from
 * storage here (or add redux-persist) — but keep this slice as the source of
 * truth everything else talks to.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/services/api';

/** The session: a token + user when signed in, both null when signed out. */
export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

/** Payload for a successful sign-in / sign-up. */
export interface Credentials {
  token: string;
  user: AuthUser;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Store the token + user after a successful sign-in / sign-up. */
    setCredentials(state, action: PayloadAction<Credentials>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },

    /** Drop the session (logout, or after a 401 from the server). */
    clearCredentials() {
      return initialState;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;
