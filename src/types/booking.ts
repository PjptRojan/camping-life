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

/** The three terrains a guest can pick between. Used for catalog filtering. */
export type DestinationType = 'Mountain' | 'Lakeside' | 'Forest';

/** A bookable campsite shown in the {@link DestinationSelector}. */
export interface Destination {
  readonly id: string;
  readonly name: string;
  readonly type: DestinationType;
  /** Short, evocative marketing line. */
  readonly description: string;
  /** Human-readable region, e.g. "Banff, Alberta". */
  readonly location: string;
  /** Base nightly site fee in USD. */
  readonly pricePerNight: number;
  /** Emoji used as a lightweight, dependency-free hero visual. */
  readonly emoji: string;
}

/* ------------------------------------------------------------------ */
/* Gear                                                                */
/* ------------------------------------------------------------------ */

/** Tabs the gear marketplace is divided into. */
export type GearCategory = 'Tents & Bedding' | 'Cooking' | 'Comfort';

/**
 * Whether a given gear line item is being rented (priced per night) or bought
 * outright (one-off price). Toggled per cart line via `toggleGearItemMode`.
 */
export type GearMode = 'rent' | 'buy';

/** A catalog gear product. Immutable reference data — never mutated at runtime. */
export interface GearItem {
  readonly id: string;
  readonly name: string;
  readonly category: GearCategory;
  readonly description: string;
  /** Cost to rent for a single night, in USD. */
  readonly rentPricePerNight: number;
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

/** Grouping for the on-site add-on checklist. */
export type ServiceCategory = 'On-Site Staff' | 'Experiences';

/** A luxury add-on toggled on/off in {@link PremiumServices}. Flat one-off fee. */
export interface OnSiteService {
  readonly id: string;
  readonly name: string;
  readonly category: ServiceCategory;
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
