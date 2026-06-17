/**
 * store/index.ts
 * -----------------------------------------------------------------------------
 * Configures the Redux Toolkit store and exports app-wide typed hooks. Always
 * import `useAppDispatch` / `useAppSelector` from here rather than the raw
 * react-redux hooks so every consumer gets full type inference for free.
 */

import { configureStore } from '@reduxjs/toolkit';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';
import bookingReducer from './bookingSlice';
import authReducer from './authSlice';
import destinationsReducer from './destinationsSlice';
import gearReducer from './gearSlice';
import servicesReducer from './servicesSlice';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    auth: authReducer,
    destinations: destinationsReducer,
    gear: gearReducer,
    services: servicesReducer,
  },
});

/** The complete state tree type, inferred from the configured reducers. */
export type RootState = ReturnType<typeof store.getState>;

/** The store's dispatch type, including thunk/middleware-aware overloads. */
export type AppDispatch = typeof store.dispatch;

/** Typed `useDispatch` — returns the app's `AppDispatch`. */
export const useAppDispatch: () => AppDispatch = useDispatch;

/** Typed `useSelector` — selector callbacks are typed against `RootState`. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
