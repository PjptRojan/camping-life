/**
 * destinationsSlice.ts
 * -----------------------------------------------------------------------------
 * Server-sourced trek catalog. Unlike the `booking` slice (which holds the
 * user's mutable selections), this slice caches the read-only destination list
 * fetched from the backend, plus the request lifecycle so the UI can show
 * loading / error / empty states.
 *
 * The public catalog is loaded via `loadDestinations`. Admin mutations
 * (`createDestination` / `updateDestination` / `deleteDestination`) fold their
 * results straight into `items`, so the public pages reflect edits without a
 * refetch.
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Destination } from '@/types/booking';
import * as api from '@/services/api';
import type { DestinationInput } from '@/services/api';

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
  async () => api.fetchTravelDestination(),
);

/** Create a destination (admin). Returns the persisted entity. */
export const createDestination = createAsyncThunk<Destination, DestinationInput>(
  'destinations/create',
  async (payload) => api.createDestination(payload),
);

/** Update a destination by id (admin). Returns the persisted entity. */
export const updateDestination = createAsyncThunk<
  Destination,
  { id: string; data: DestinationInput }
>('destinations/update', async ({ id, data }) =>
  api.updateDestination(id, data),
);

/** Delete a destination by id (admin). Returns the deleted id. */
export const deleteDestination = createAsyncThunk<string, string>(
  'destinations/delete',
  async (id) => {
    await api.deleteDestination(id);
    return id;
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
      })
      .addCase(createDestination.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateDestination.fulfilled, (state, action) => {
        const idx = state.items.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteDestination.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d.id !== action.payload);
      });
  },
});

export default destinationsSlice.reducer;
