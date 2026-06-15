/**
 * bookingSlice.ts
 * -----------------------------------------------------------------------------
 * All mutation logic for the user's trip lives here. Reducers use Immer (built
 * into Redux Toolkit) so we can write "mutating" code that is actually applied
 * immutably. Every action is strongly typed via PayloadAction<T>.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BookingState, GearMode } from '@/types/booking';

/** A fresh trip: nothing selected, two nights by default, insurance off. */
const initialState: BookingState = {
  activeDestinationId: null,
  nights: 2,
  cartGear: [],
  selectedServiceIds: [],
  insuranceEnabled: false,
};

/** Clamp helper so `nights` can never drop below a single night. */
const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    /** Select (or re-select) the active campsite. */
    setDestination(state, action: PayloadAction<string>) {
      state.activeDestinationId = action.payload;
    },

    /** Adjust the length of the stay, clamped to a sensible range. */
    setNights(state, action: PayloadAction<number>) {
      const next = Math.round(action.payload);
      state.nights = Math.min(MAX_NIGHTS, Math.max(MIN_NIGHTS, next));
    },

    /**
     * Add one unit of a gear item. If the line already exists we simply bump
     * its quantity; otherwise we create a new line defaulting to "rent" mode.
     */
    addGearItem(state, action: PayloadAction<string>) {
      const gearId = action.payload;
      const existing = state.cartGear.find((line) => line.gearId === gearId);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.cartGear.push({ gearId, quantity: 1, mode: 'rent' });
      }
    },

    /**
     * Remove one unit of a gear item. When the quantity reaches zero the entire
     * line is dropped from the cart so it no longer renders as "selected".
     */
    removeGearItem(state, action: PayloadAction<string>) {
      const gearId = action.payload;
      const line = state.cartGear.find((item) => item.gearId === gearId);
      if (!line) return;

      line.quantity -= 1;
      if (line.quantity <= 0) {
        state.cartGear = state.cartGear.filter((item) => item.gearId !== gearId);
      }
    },

    /** Flip a single cart line between renting per night and buying outright. */
    toggleGearItemMode(state, action: PayloadAction<string>) {
      const line = state.cartGear.find((item) => item.gearId === action.payload);
      if (!line) return;

      const nextMode: GearMode = line.mode === 'rent' ? 'buy' : 'rent';
      line.mode = nextMode;
    },

    /** Add or remove a premium service from the selection (checkbox behavior). */
    toggleService(state, action: PayloadAction<string>) {
      const serviceId = action.payload;
      const isSelected = state.selectedServiceIds.includes(serviceId);

      state.selectedServiceIds = isSelected
        ? state.selectedServiceIds.filter((id) => id !== serviceId)
        : [...state.selectedServiceIds, serviceId];
    },

    /** Toggle the flat Accidental Damage Insurance fee on or off. */
    toggleInsurance(state) {
      state.insuranceEnabled = !state.insuranceEnabled;
    },

    /** Reset the entire trip back to defaults (used after checkout). */
    resetBooking() {
      return initialState;
    },
  },
});

export const {
  setDestination,
  setNights,
  addGearItem,
  removeGearItem,
  toggleGearItemMode,
  toggleService,
  toggleInsurance,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
