/**
 * api.ts
 * -----------------------------------------------------------------------------
 * Thin, typed wrappers around the backend endpoints. All cross-cutting concerns
 * — base URL, auth header, timeouts, error toasts and 401 handling — live in
 * the shared axios instance (`httpClient`), so each function here is just the
 * endpoint, the payload type and the returned data.
 */

import { http } from './httpClient';
import type { Destination } from '@/types/booking';

/** Fetch the bookable campsite catalog from the backend. */
export async function fetchTravelDestination(): Promise<Destination[]> {
  const { data } = await http.get<Destination[]>('/destinations');
  return data;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

/** Payload sent to the sign-up endpoint — mirrors the backend `User` model. */
export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

/** Credentials sent to the sign-in endpoint. */
export interface SignInPayload {
  email: string;
  password: string;
}

/** The authenticated user as returned by the backend (no password field). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

/** Standard auth response: the signed-in user plus a bearer token. */
export interface AuthResponse {
  user: AuthUser;
  token: string;
}

/** Create a new user account. */
export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/signup', payload);
  return data;
}

/** Authenticate an existing user. */
export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/login', payload);
  return data;
}
