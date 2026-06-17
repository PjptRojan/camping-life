/**
 * api.ts
 * -----------------------------------------------------------------------------
 * Thin, typed wrappers around the backend endpoints. All cross-cutting concerns
 * — base URL, auth header, timeouts, error toasts and 401 handling — live in
 * the shared axios instance (`httpClient`), so each function here is just the
 * endpoint, the payload type and the returned data.
 */

import { http } from './httpClient';
import type { Destination, GearItem, OnSiteService } from '@/types/booking';

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */

/** Fetch the bookable trek catalog from the backend. */
export async function fetchTravelDestination(): Promise<Destination[]> {
  const { data } = await http.get<Destination[]>('/destinations');
  return data;
}

/**
 * Admin payload for creating/updating a destination. Mirrors the backend's
 * `validateDestination` contract. The `id` is an author-chosen slug, required
 * on create and taken from the URL on update.
 */
export type DestinationInput = Omit<Destination, 'id'> & { id?: string };

/** Create a destination (admin only). The server enforces the auth boundary. */
export async function createDestination(
  payload: DestinationInput,
): Promise<Destination> {
  const { data } = await http.post<Destination>('/destinations', payload);
  return data;
}

/** Update an existing destination by id (admin only). */
export async function updateDestination(
  id: string,
  payload: DestinationInput,
): Promise<Destination> {
  const { data } = await http.put<Destination>(`/destinations/${id}`, payload);
  return data;
}

/** Delete a destination by id (admin only). */
export async function deleteDestination(id: string): Promise<void> {
  await http.delete(`/destinations/${id}`);
}

/* ------------------------------------------------------------------ */
/* Gear                                                                */
/* ------------------------------------------------------------------ */

/** Fetch the rent/buy gear catalog from the backend. */
export async function fetchGear(): Promise<GearItem[]> {
  const { data } = await http.get<GearItem[]>('/gear');
  return data;
}

/** Admin payload for creating/updating gear. The server generates the id. */
export type GearInput = Omit<GearItem, 'id'>;

/** Create a gear item (admin only). */
export async function createGear(payload: GearInput): Promise<GearItem> {
  const { data } = await http.post<GearItem>('/gear', payload);
  return data;
}

/** Update a gear item by id (admin only). */
export async function updateGear(
  id: string,
  payload: GearInput,
): Promise<GearItem> {
  const { data } = await http.put<GearItem>(`/gear/${id}`, payload);
  return data;
}

/** Delete a gear item by id (admin only). */
export async function deleteGear(id: string): Promise<void> {
  await http.delete(`/gear/${id}`);
}

/* ------------------------------------------------------------------ */
/* On-site services                                                    */
/* ------------------------------------------------------------------ */

/** Fetch the premium on-site services catalog from the backend. */
export async function fetchServices(): Promise<OnSiteService[]> {
  const { data } = await http.get<OnSiteService[]>('/services');
  return data;
}

/** Admin payload for creating/updating a service. The server generates the id. */
export type ServiceInput = Omit<OnSiteService, 'id'>;

/** Create a service (admin only). */
export async function createService(
  payload: ServiceInput,
): Promise<OnSiteService> {
  const { data } = await http.post<OnSiteService>('/services', payload);
  return data;
}

/** Update a service by id (admin only). */
export async function updateService(
  id: string,
  payload: ServiceInput,
): Promise<OnSiteService> {
  const { data } = await http.put<OnSiteService>(`/services/${id}`, payload);
  return data;
}

/** Delete a service by id (admin only). */
export async function deleteService(id: string): Promise<void> {
  await http.delete(`/services/${id}`);
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

/** A user's authorization level. Mirrors the backend `Role` enum. */
export type Role = 'USER' | 'ADMIN';

/** The authenticated user as returned by the backend (no password field). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  /** Drives admin-dashboard access on the client; enforced server-side too. */
  role: Role;
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
