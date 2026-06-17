/**
 * gearSlice.ts
 * -----------------------------------------------------------------------------
 * Server-sourced gear catalog. Mirrors `destinationsSlice`: a cached list plus
 * the fetch lifecycle, and admin CRUD thunks that fold their results into
 * `items` so the marketplace updates without a refetch.
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { GearItem } from '@/types/booking';
import * as api from '@/services/api';
import type { GearInput } from '@/services/api';
import type { RequestStatus } from './destinationsSlice';

export interface GearState {
  items: GearItem[];
  status: RequestStatus;
  error: string | null;
}

const initialState: GearState = {
  items: [],
  status: 'idle',
  error: null,
};

/** Load the gear catalog from the backend. */
export const loadGear = createAsyncThunk<GearItem[]>('gear/load', async () =>
  api.fetchGear(),
);

/** Create a gear item (admin). */
export const createGear = createAsyncThunk<GearItem, GearInput>(
  'gear/create',
  async (payload) => api.createGear(payload),
);

/** Update a gear item by id (admin). */
export const updateGear = createAsyncThunk<
  GearItem,
  { id: string; data: GearInput }
>('gear/update', async ({ id, data }) => api.updateGear(id, data));

/** Delete a gear item by id (admin). Returns the deleted id. */
export const deleteGear = createAsyncThunk<string, string>(
  'gear/delete',
  async (id) => {
    await api.deleteGear(id);
    return id;
  },
);

const gearSlice = createSlice({
  name: 'gear',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadGear.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadGear.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadGear.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load gear.';
      })
      .addCase(createGear.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateGear.fulfilled, (state, action) => {
        const idx = state.items.findIndex((g) => g.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteGear.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g.id !== action.payload);
      });
  },
});

export default gearSlice.reducer;
