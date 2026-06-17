/**
 * catalog.ts
 * -----------------------------------------------------------------------------
 * Static, non-catalog reference values. The gear and service catalogs used to
 * live here but now come from the backend (see `gearSlice` / `servicesSlice`);
 * only platform-wide constants that aren't server-owned remain.
 */

/** Flat fee, in USD, added when Accidental Damage Insurance is enabled. */
export const INSURANCE_FEE = 15;
