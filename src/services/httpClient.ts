/**
 * httpClient.ts
 * -----------------------------------------------------------------------------
 * The single axios instance every API call goes through. Two interceptors do
 * the cross-cutting work so individual request functions stay tiny:
 *
 *   • Request  — attaches the bearer token (when signed in).
 *   • Response — on success passes the response straight through; on failure it
 *                normalizes the error, surfaces it as a toast, and on a 401
 *                clears the stale token and bounces the user to /signin.
 *
 * Callers can still `try/catch` to handle errors locally (e.g. a form banner) —
 * the interceptor only adds global behavior and re-throws.
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { store } from '@/store';
import { clearCredentials } from '@/store/authSlice';

/** Shape of the JSON error body our backend returns. All fields optional. */
interface ApiErrorBody {
  message?: string;
  error?: string;
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/* ------------------------------------------------------------------ */
/* Request: attach the auth token                                      */
/* ------------------------------------------------------------------ */

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = store.getState().auth;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ------------------------------------------------------------------ */
/* Response: normalize + surface errors                                */
/* ------------------------------------------------------------------ */

/** Pull the most useful human-readable message out of an axios error. */
function resolveErrorMessage(error: AxiosError<ApiErrorBody>): string {
  if (error.response) {
    // Server responded with a non-2xx status.
    return (
      error.response.data?.message ??
      error.response.data?.error ??
      `Request failed (${error.response.status}). Please try again.`
    );
  }
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please check your connection and try again.';
  }
  if (error.request) {
    // Request was made but no response came back (server down / CORS / offline).
    return 'Unable to reach the server. Please check your connection.';
  }
  return error.message || 'Something went wrong. Please try again.';
}

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const message = resolveErrorMessage(error);
    toast.error(message);

    // Session expired / invalid token → clear it and send to sign-in,
    // unless we're already there (avoids a redirect loop on a bad login).
    if (error.response?.status === 401) {
      store.dispatch(clearCredentials());
      if (window.location.pathname !== '/signin') {
        window.location.assign('/signin');
      }
    }

    // Re-throw a clean Error so callers' catch blocks get a sensible message.
    return Promise.reject(new Error(message));
  },
);
