/**
 * selectors.ts
 * -----------------------------------------------------------------------------
 * Derived/computed state. Keeping the cost math here (rather than inside the
 * sidebar component) means the receipt logic is unit-testable in isolation and
 * the UI stays purely presentational.
 *
 * Pricing rules:
 *  - Destination site fee  = pricePerNight * nights
 *  - Gear in "rent" mode   = rentPrice * quantity * nights
 *  - Gear in "buy"  mode   = buyPrice * quantity            (one-off, no nights)
 *  - Services              = flat price each                (one-off)
 *  - Insurance             = flat INSURANCE_FEE when enabled
 */

import type { GearItem, GearMode, OnSiteService } from '@/types/booking';
import { INSURANCE_FEE } from '@/data/catalog';
import type { RootState } from './index';

/** A single, display-ready line on the receipt. */
export interface ReceiptLineItem {
  readonly id: string;
  readonly label: string;
  /** Optional secondary text, e.g. "$45/night × 2 × 3 nights". */
  readonly detail?: string;
  readonly amount: number;
}

/** The fully itemized receipt the sidebar renders. */
export interface ReceiptBreakdown {
  readonly destination: ReceiptLineItem | null;
  readonly gear: readonly ReceiptLineItem[];
  readonly services: readonly ReceiptLineItem[];
  readonly insurance: ReceiptLineItem | null;
  readonly total: number;
  /** Count used by the nav cart badge: gear units + services (+ insurance). */
  readonly itemCount: number;
}

/** Format a number as a clean USD string, e.g. 1240 → "$1,240". */
export const formatCurrency = (value: number): string =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

/** Compute the cost of a single gear line given its mode and the night count. */
const gearLineCost = (
  rentPrice: number,
  buyPrice: number,
  mode: GearMode,
  quantity: number,
  nights: number,
): number =>
  mode === 'rent' ? rentPrice * quantity * nights : buyPrice * quantity;

/**
 * The primary selector: joins the user's selections against the static catalog
 * and produces a complete, itemized {@link ReceiptBreakdown}.
 */
export const selectReceipt = (state: RootState): ReceiptBreakdown => {
  const { activeDestinationId, nights, cartGear, selectedServiceIds, insuranceEnabled } =
    state.booking;

  // Catalog data is server-sourced now; build id → entity maps for O(1) joins.
  const gearById: Record<string, GearItem> = Object.fromEntries(
    state.gear.items.map((g) => [g.id, g]),
  );
  const serviceById: Record<string, OnSiteService> = Object.fromEntries(
    state.services.items.map((s) => [s.id, s]),
  );

  // --- Destination line ---
  const destination = (() => {
    if (!activeDestinationId) return null;
    // Destinations now come from the server-backed slice, not static data.
    const dest = state.destinations.items.find((d) => d.id === activeDestinationId);
    if (!dest) return null;
    return {
      id: dest.id,
      label: dest.name,
      detail: `${formatCurrency(dest.pricePerNight)}/night × ${nights} ${
        nights === 1 ? 'night' : 'nights'
      }`,
      amount: dest.pricePerNight * nights,
    } satisfies ReceiptLineItem;
  })();

  // --- Gear lines ---
  const gear: ReceiptLineItem[] = cartGear.flatMap((line) => {
    const item = gearById[line.gearId];
    if (!item) return [];

    const amount = gearLineCost(
      item.rentPrice,
      item.buyPrice,
      line.mode,
      line.quantity,
      nights,
    );

    const detail =
      line.mode === 'rent'
        ? `${formatCurrency(item.rentPrice)}/night × ${line.quantity} × ${nights}n`
        : `${formatCurrency(item.buyPrice)} × ${line.quantity} (buy)`;

    return [{ id: item.id, label: `${item.name} ×${line.quantity}`, detail, amount }];
  });

  // --- Service lines ---
  const services: ReceiptLineItem[] = selectedServiceIds.flatMap((id) => {
    const svc = serviceById[id];
    if (!svc) return [];
    return [{ id: svc.id, label: svc.name, detail: 'Flat fee', amount: svc.price }];
  });

  // --- Insurance line ---
  const insurance: ReceiptLineItem | null = insuranceEnabled
    ? {
        id: 'insurance',
        label: 'Accidental Damage Insurance',
        detail: 'Flat fee',
        amount: INSURANCE_FEE,
      }
    : null;

  // --- Total ---
  const total =
    (destination?.amount ?? 0) +
    gear.reduce((sum, line) => sum + line.amount, 0) +
    services.reduce((sum, line) => sum + line.amount, 0) +
    (insurance?.amount ?? 0);

  // --- Cart badge count: total gear units + selected services ---
  const gearUnits = cartGear.reduce((sum, line) => sum + line.quantity, 0);
  const itemCount = gearUnits + selectedServiceIds.length;

  return { destination, gear, services, insurance, total, itemCount };
};

/** Convenience selector for the nav badge — avoids recomputing the full receipt. */
export const selectCartCount = (state: RootState): number => {
  const gearUnits = state.booking.cartGear.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  return gearUnits + state.booking.selectedServiceIds.length;
};

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

/** The current bearer token, or null when signed out. */
export const selectToken = (state: RootState): string | null => state.auth.token;

/** The signed-in user, or null when signed out. */
export const selectUser = (state: RootState) => state.auth.user;

/** Whether a user is currently signed in (has a token). */
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.token !== null;

/** Whether the signed-in user is an admin (drives dashboard access). */
export const selectIsAdmin = (state: RootState): boolean =>
  state.auth.user?.role === 'ADMIN';

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */

/** The server-fetched destination catalog. */
export const selectDestinations = (state: RootState) => state.destinations.items;

/** Lifecycle of the destinations fetch — drives loading / error UI. */
export const selectDestinationsStatus = (state: RootState) =>
  state.destinations.status;

/** Error message from the last failed destinations fetch, or null. */
export const selectDestinationsError = (state: RootState) =>
  state.destinations.error;

/* ------------------------------------------------------------------ */
/* Gear                                                                */
/* ------------------------------------------------------------------ */

/** The server-fetched gear catalog. */
export const selectGear = (state: RootState) => state.gear.items;

/** Lifecycle of the gear fetch — drives loading / error UI. */
export const selectGearStatus = (state: RootState) => state.gear.status;

/** Error message from the last failed gear fetch, or null. */
export const selectGearError = (state: RootState) => state.gear.error;

/* ------------------------------------------------------------------ */
/* On-site services                                                    */
/* ------------------------------------------------------------------ */

/** The server-fetched services catalog. */
export const selectServices = (state: RootState) => state.services.items;

/** Lifecycle of the services fetch — drives loading / error UI. */
export const selectServicesStatus = (state: RootState) => state.services.status;

/** Error message from the last failed services fetch, or null. */
export const selectServicesError = (state: RootState) => state.services.error;
