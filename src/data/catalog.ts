/**
 * catalog.ts
 * -----------------------------------------------------------------------------
 * Static reference data for the platform. Kept deliberately separate from Redux
 * state: the store only tracks *selections* (ids, quantities, toggles), while
 * these immutable catalogs supply names, pricing and copy. Components join the
 * two together by id at render time via the lookup maps exported below.
 */

import type {
  GearItem,
  OnSiteService,
} from '@/types/booking';

/** Flat fee, in USD, added when Accidental Damage Insurance is enabled. */
export const INSURANCE_FEE = 15;

/* ------------------------------------------------------------------ */
/* Gear                                                                */
/* ------------------------------------------------------------------ */

export const GEAR_ITEMS: readonly GearItem[] = [
  // --- Tents & Bedding ---
  {
    id: 'gear-bell-tent',
    name: 'Luxury Bell Tent',
    category: 'Tents & Bedding',
    description: 'Insulated 5m canvas tent that sleeps four in real comfort.',
    rentPricePerNight: 45,
    buyPrice: 690,
    emoji: '⛺',
  },
  {
    id: 'gear-down-sleeping-bag',
    name: 'Arctic Down Sleeping Bag',
    category: 'Tents & Bedding',
    description: '800-fill down, rated to -15°C for fearless cold nights.',
    rentPricePerNight: 12,
    buyPrice: 220,
    emoji: '🛏️',
  },
  {
    id: 'gear-air-mattress',
    name: 'Self-Inflating Air Mattress',
    category: 'Tents & Bedding',
    description: 'Plush 10cm memory-foam pad — no rocks, just rest.',
    rentPricePerNight: 8,
    buyPrice: 130,
    emoji: '🧱',
  },

  // --- Cooking ---
  {
    id: 'gear-camp-stove',
    name: 'Dual-Burner Camp Stove',
    category: 'Cooking',
    description: 'Restaurant-grade flame control for proper backcountry meals.',
    rentPricePerNight: 10,
    buyPrice: 160,
    emoji: '🔥',
  },
  {
    id: 'gear-cookset',
    name: 'Titanium Cook Set',
    category: 'Cooking',
    description: 'Featherweight pots, pans and utensils that nest together.',
    rentPricePerNight: 7,
    buyPrice: 95,
    emoji: '🍳',
  },
  {
    id: 'gear-cooler',
    name: 'Roto-Molded Cooler',
    category: 'Cooking',
    description: 'Holds ice for five days — drinks stay frosty all trip.',
    rentPricePerNight: 9,
    buyPrice: 280,
    emoji: '🧊',
  },

  // --- Comfort ---
  {
    id: 'gear-camp-chair',
    name: 'Reclining Camp Chair',
    category: 'Comfort',
    description: 'Padded recliner with a built-in cup holder and footrest.',
    rentPricePerNight: 5,
    buyPrice: 85,
    emoji: '🪑',
  },
  {
    id: 'gear-firepit',
    name: 'Portable Fire Pit',
    category: 'Comfort',
    description: 'Smokeless steel pit — instant ambiance, easy cleanup.',
    rentPricePerNight: 11,
    buyPrice: 240,
    emoji: '🪵',
  },
  {
    id: 'gear-lantern',
    name: 'Rechargeable Lantern Set',
    category: 'Comfort',
    description: 'Warm dimmable glow with 200 hours of runtime per charge.',
    rentPricePerNight: 4,
    buyPrice: 60,
    emoji: '🏮',
  },
];

/* ------------------------------------------------------------------ */
/* Premium services                                                    */
/* ------------------------------------------------------------------ */

export const ON_SITE_SERVICES: readonly OnSiteService[] = [
  // --- On-Site Staff ---
  {
    id: 'svc-setup-crew',
    name: 'Setup & Takedown Crew',
    category: 'On-Site Staff',
    description: 'Arrive to a fully pitched camp; we handle the teardown too.',
    price: 180,
    emoji: '🛠️',
  },
  {
    id: 'svc-private-chef',
    name: 'Private Campfire Chef',
    category: 'On-Site Staff',
    description: 'A personal chef crafting open-flame dinners each evening.',
    price: 420,
    emoji: '👨‍🍳',
  },
  {
    id: 'svc-concierge',
    name: 'Trail Concierge',
    category: 'On-Site Staff',
    description: 'A local guide to plan hikes and stock the cooler daily.',
    price: 250,
    emoji: '🧭',
  },

  // --- Experiences ---
  {
    id: 'svc-outdoor-cinema',
    name: 'Outdoor Cinema Night',
    category: 'Experiences',
    description: 'Giant inflatable screen, projector and surround sound.',
    price: 160,
    emoji: '🎬',
  },
  {
    id: 'svc-stargazing',
    name: 'Guided Stargazing',
    category: 'Experiences',
    description: 'An astronomer, a telescope, and a tour of the night sky.',
    price: 140,
    emoji: '🔭',
  },
  {
    id: 'svc-hot-tub',
    name: 'Wood-Fired Hot Tub',
    category: 'Experiences',
    description: 'A cedar soaking tub heated under the stars.',
    price: 310,
    emoji: '♨️',
  },
];

/* ------------------------------------------------------------------ */
/* Lookup maps — O(1) id → entity joins for the summary calculator      */
/* ------------------------------------------------------------------ */

export const GEAR_BY_ID: Readonly<Record<string, GearItem>> =
  Object.fromEntries(GEAR_ITEMS.map((g) => [g.id, g]));

export const SERVICE_BY_ID: Readonly<Record<string, OnSiteService>> =
  Object.fromEntries(ON_SITE_SERVICES.map((s) => [s.id, s]));
