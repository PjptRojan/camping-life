/**
 * servicesSlice.ts
 * -----------------------------------------------------------------------------
 * Server-sourced on-site services catalog. Mirrors `gearSlice`: a cached list
 * plus the fetch lifecycle, and admin CRUD thunks that fold their results into
 * `items` so the premium-services checklist updates without a refetch.
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { OnSiteService } from '@/types/booking';
import * as api from '@/services/api';
import type { ServiceInput } from '@/services/api';
import type { RequestStatus } from './destinationsSlice';

export interface ServicesState {
  items: OnSiteService[];
  status: RequestStatus;
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  status: 'idle',
  error: null,
};

/** Load the on-site services catalog from the backend. */
export const loadServices = createAsyncThunk<OnSiteService[]>(
  'services/load',
  async () => api.fetchServices(),
);

/** Create a service (admin). */
export const createService = createAsyncThunk<OnSiteService, ServiceInput>(
  'services/create',
  async (payload) => api.createService(payload),
);

/** Update a service by id (admin). */
export const updateService = createAsyncThunk<
  OnSiteService,
  { id: string; data: ServiceInput }
>('services/update', async ({ id, data }) => api.updateService(id, data));

/** Delete a service by id (admin). Returns the deleted id. */
export const deleteService = createAsyncThunk<string, string>(
  'services/delete',
  async (id) => {
    await api.deleteService(id);
    return id;
  },
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadServices.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load services.';
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      });
  },
});

export default servicesSlice.reducer;
