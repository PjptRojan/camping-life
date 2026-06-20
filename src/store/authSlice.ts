/**
 * authSlice.ts
 * -----------------------------------------------------------------------------
 * Owns the authenticated session — the bearer token and the signed-in user.
 * Redux is the single source of truth the axios interceptor reads from and the
 * auth pages write to.
 *
 * The session is mirrored to `localStorage` so it survives a full page refresh:
 * `initialState` is hydrated from storage on startup, `setCredentials` writes
 * through, and `clearCredentials` wipes it. Keep this slice as the source of
 * truth everything else talks to — storage is just the persistence layer.
 *
 * Security note: `localStorage` is readable by any JS on the page, so the JWT is
 * exposed to XSS. This is the pragmatic SPA default for now; the plan is to move
 * to an httpOnly refresh-token cookie later.
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

/** localStorage key holding the serialized session. */
const STORAGE_KEY = 'campinglife.auth';

/** Read the persisted session, tolerating missing/corrupt data. */
function loadPersistedState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (typeof parsed?.token === 'string' && parsed.user) {
      return { token: parsed.token, user: parsed.user };
    }
  } catch {
    // Corrupt or unavailable storage — fall through to a signed-out session.
  }
  return { token: null, user: null };
}

const initialState: AuthState = loadPersistedState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Store the token + user after a successful sign-in / sign-up. */
    setCredentials(state, action: PayloadAction<Credentials>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      } catch {
        // Storage full/unavailable — session still works in-memory this load.
      }
    },

    /** Drop the session (logout, or after a 401 from the server). */
    clearCredentials() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore — nothing useful to do if storage is unavailable.
      }
      return { token: null, user: null };
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;
