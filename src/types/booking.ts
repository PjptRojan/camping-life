/**
 * booking.ts
 * -----------------------------------------------------------------------------
 * Single source of truth for every domain type used across the CampingLife
 * Camping-as-a-Service platform. These types are intentionally strict — no
 * implicit `any`, all unions are closed, and catalog entities are kept separate
 * from the user's mutable selections so the Redux store stays lean.
 */

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */

/**
 * The Himalayan regions a trek can belong to. Mirrors the backend `TrekRegion`
 * enum and is the source of truth — keep these in sync with Prisma.
 */
export const TREK_REGIONS = [
  'Everest',
  'Annapurna',
  'Langtang',
  'Manaslu',
  'Mustang',
  'Kanchenjunga',
] as const;
export type TrekRegion = (typeof TREK_REGIONS)[number];

/** How demanding a trek is. Mirrors the backend `Difficulty` enum. */
export const DIFFICULTIES = [
  'Easy',
  'Moderate',
  'Challenging',
  'Strenuous',
] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** The seasons a trek is best attempted in. Mirrors the backend `Season` enum. */
export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;
export type Season = (typeof SEASONS)[number];

/**
 * A bookable trek shown in the {@link DestinationSelector}. Matches the backend
 * Nepal-trek model (the agreed source of truth) field-for-field.
 */
export interface Destination {
  /** Stable slug, e.g. "ebc", "abc". Author-assigned, not auto-generated. */
  readonly id: string;
  readonly name: string;
  /** Himalayan region the trek sits in. */
  readonly region: TrekRegion;
  /** Short, evocative marketing line. */
  readonly description: string;
  /** Human-readable locale, e.g. "Khumbu, Nepal". */
  readonly location: string;
  /** Base per-day price in USD. */
  readonly pricePerNight: number;
  /** Emoji used as a lightweight, dependency-free hero visual. */
  readonly emoji: string;
  /** Highest point reached on the trek, in metres. */
  readonly maxAltitudeMeters: number;
  readonly difficulty: Difficulty;
  /** Shortest and longest typical itinerary, in days. */
  readonly durationDaysMin: number;
  readonly durationDaysMax: number;
  /** Seasons the trek is recommended in. */
  readonly bestSeasons: Season[];
  /** Town/airstrip the trek departs from, e.g. "Lukla". */
  readonly startPoint: string;
  /** Permits a trekker must carry, e.g. ["TIMS", "Sagarmatha NP"]. */
  readonly permitsRequired: string[];
}

/* ------------------------------------------------------------------ */
/* Gear                                                                */
/* ------------------------------------------------------------------ */

/**
 * Whether a given gear line item is being rented (priced per night) or bought
 * outright (one-off price). Toggled per cart line via `toggleGearItemMode`.
 */
export type GearMode = 'rent' | 'buy';

/**
 * A catalog gear product, fetched from the backend. `category` is a free-form
 * string server-side — the marketplace derives its tabs from whatever values
 * are present rather than a fixed union.
 */
export interface GearItem {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  /** Cost to rent for a single night, in USD. */
  readonly rentPrice: number;
  /** Cost to purchase outright, in USD. */
  readonly buyPrice: number;
  /** Emoji icon for the product card. */
  readonly emoji: string;
}

/**
 * A user's selection of a {@link GearItem}. Stored in the cart as a thin record
 * referencing the catalog by id, plus the per-line quantity and rent/buy mode.
 */
export interface CartGearItem {
  readonly gearId: string;
  /** Always >= 1 while present in the cart; removed entirely when it hits 0. */
  quantity: number;
  mode: GearMode;
}

/* ------------------------------------------------------------------ */
/* Premium services                                                    */
/* ------------------------------------------------------------------ */

/**
 * A luxury add-on toggled on/off in {@link PremiumServices}. Flat one-off fee.
 * `category` is a free-form string server-side; the checklist groups rows by
 * whatever categories the fetched data contains.
 */
export interface OnSiteService {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  /** Flat fee for the stay, in USD. */
  readonly price: number;
  readonly emoji: string;
}

/* ------------------------------------------------------------------ */
/* Global booking state                                                */
/* ------------------------------------------------------------------ */

/**
 * The complete shape of the `booking` slice. Holds only the user's mutable
 * selections — catalog data lives in `/data/catalog.ts` and is joined in by id
 * at render/calculation time.
 */
export interface BookingState {
  /** Currently selected destination, or `null` before the user picks one. */
  activeDestinationId: string | null;
  /** Number of nights for the stay. Drives all per-night rent calculations. */
  nights: number;
  /** Gear lines the user has added to their trip. */
  cartGear: CartGearItem[];
  /** Ids of the premium services that are currently toggled on. */
  selectedServiceIds: string[];
  /** Whether the flat $15 Accidental Damage Insurance is applied. */
  insuranceEnabled: boolean;
}
