/**
 * destinationsSlice.ts
 * -----------------------------------------------------------------------------
 * Server-sourced campsite catalog. Unlike the `booking` slice (which holds the
 * user's mutable selections), this slice caches the read-only destination list
 * fetched from the backend, plus the request lifecycle so the UI can show
 * loading / error / empty states.
 *
 * The fetch is exposed as a `createAsyncThunk`; dispatch `loadDestinations()`
 * once on mount and the extraReducers below fold the result into state.
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Destination } from '@/types/booking';
import { fetchTravelDestination } from '@/services/api';

/** Request lifecycle for the destinations fetch. */
export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface DestinationsState {
  items: Destination[];
  status: RequestStatus;
  /** Human-readable error message when the fetch fails, else null. */
  error: string | null;
}

const initialState: DestinationsState = {
  items: [],
  status: 'idle',
  error: null,
};

/**
 * Load the destination catalog from the backend. The httpClient interceptor
 * already surfaces a toast on failure; here we additionally keep the message in
 * state so the selector grid can render an inline error + retry.
 */
export const loadDestinations = createAsyncThunk<Destination[]>(
  'destinations/load',
  async () => {
    return fetchTravelDestination();
  },
);

const destinationsSlice = createSlice({
  name: 'destinations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDestinations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadDestinations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadDestinations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load destinations.';
      });
  },
});

export default destinationsSlice.reducer;
