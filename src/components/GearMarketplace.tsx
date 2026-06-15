/**
 * GearMarketplace.tsx
 * -----------------------------------------------------------------------------
 * Interactive rent/buy catalog split into category tabs. Each card shows a
 * quantity stepper and — once added — a Rent⇄Buy toggle. All mutations flow
 * through the booking slice so the sidebar receipt stays in lockstep.
 */

import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { CartGearItem, GearCategory, GearItem } from '@/types/booking';
import { GEAR_ITEMS } from '@/data/catalog';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  addGearItem,
  removeGearItem,
  toggleGearItemMode,
} from '@/store/bookingSlice';
import { formatCurrency } from '@/store/selectors';

const CATEGORIES: readonly GearCategory[] = [
  'Tents & Bedding',
  'Cooking',
  'Comfort',
];

export function GearMarketplace(): JSX.Element {
  const dispatch = useAppDispatch();
  const cartGear = useAppSelector((state) => state.booking.cartGear);

  // Local UI state: the currently open category tab.
  const [activeTab, setActiveTab] = useState<GearCategory>(CATEGORIES[0]);

  // Index cart lines by gearId for O(1) lookups while rendering cards.
  const cartByGearId = useMemo<Record<string, CartGearItem>>(
    () => Object.fromEntries(cartGear.map((line) => [line.gearId, line])),
    [cartGear],
  );

  const itemsForTab = useMemo(
    () => GEAR_ITEMS.filter((item) => item.category === activeTab),
    [activeTab],
  );

  return (
    <section aria-labelledby="gear-heading" className="mt-10">
      <header className="mb-4">
        <h2
          id="gear-heading"
          className="text-xl font-extrabold tracking-tight text-emerald-900"
        >
          Outfit your trip
        </h2>
        <p className="text-sm text-slate-500">
          Rent per night or buy outright — switch any item with one tap.
        </p>
      </header>

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Gear categories"
        className="mb-5 inline-flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1"
      >
        {CATEGORIES.map((category) => {
          const isActive = category === activeTab;
          return (
            <button
              key={category}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(category)}
              className={[
                'rounded-lg px-4 py-2 text-sm font-semibold transition',
                isActive
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {itemsForTab.map((item) => (
          <GearCard
            key={item.id}
            item={item}
            cartLine={cartByGearId[item.id]}
            onAdd={() => dispatch(addGearItem(item.id))}
            onRemove={() => dispatch(removeGearItem(item.id))}
            onToggleMode={() => dispatch(toggleGearItemMode(item.id))}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Card sub-component                                                  */
/* ------------------------------------------------------------------ */

interface GearCardProps {
  item: GearItem;
  /** The matching cart line, or `undefined` if the item isn't in the cart. */
  cartLine: CartGearItem | undefined;
  onAdd: () => void;
  onRemove: () => void;
  onToggleMode: () => void;
}

function GearCard({
  item,
  cartLine,
  onAdd,
  onRemove,
  onToggleMode,
}: GearCardProps): JSX.Element {
  const quantity = cartLine?.quantity ?? 0;
  const inCart = quantity > 0;
  const mode = cartLine?.mode ?? 'rent';

  return (
    <article
      className={[
        'flex flex-col rounded-2xl bg-white p-5 transition-all duration-200',
        inCart
          ? 'shadow-card ring-2 ring-emerald-400'
          : 'shadow-sm ring-1 ring-stone-200 hover:shadow-card',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl" aria-hidden>
          {item.emoji}
        </span>

        {/* Pricing — emphasizes whichever mode is currently active. */}
        <div className="text-right">
          <p
            className={[
              'text-sm font-bold',
              mode === 'rent' ? 'text-emerald-800' : 'text-slate-400',
            ].join(' ')}
          >
            {formatCurrency(item.rentPricePerNight)}
            <span className="font-medium text-slate-400">/night</span>
          </p>
          <p
            className={[
              'text-sm font-bold',
              mode === 'buy' ? 'text-emerald-800' : 'text-slate-400',
            ].join(' ')}
          >
            {formatCurrency(item.buyPrice)}
            <span className="font-medium text-slate-400"> buy</span>
          </p>
        </div>
      </div>

      <h3 className="mt-3 font-bold text-slate-800">{item.name}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-500">{item.description}</p>

      {/* Rent ⇄ Buy toggle — only meaningful once the item is in the cart. */}
      {inCart && (
        <div
          role="group"
          aria-label="Pricing mode"
          className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-stone-100 p-1"
        >
          <button
            type="button"
            aria-pressed={mode === 'rent'}
            onClick={() => mode !== 'rent' && onToggleMode()}
            className={[
              'rounded-md py-1.5 text-xs font-bold transition',
              mode === 'rent'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            Rent / night
          </button>
          <button
            type="button"
            aria-pressed={mode === 'buy'}
            onClick={() => mode !== 'buy' && onToggleMode()}
            className={[
              'rounded-md py-1.5 text-xs font-bold transition',
              mode === 'buy'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            Buy outright
          </button>
        </div>
      )}

      {/* Add button OR quantity stepper */}
      <div className="mt-4">
        {inCart ? (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-1">
            <button
              type="button"
              aria-label={`Remove one ${item.name}`}
              onClick={onRemove}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-100 active:scale-95"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-emerald-900">
              {quantity} in trip
            </span>
            <button
              type="button"
              aria-label={`Add one ${item.name}`}
              onClick={onAdd}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-100 active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            Add to trip
          </button>
        )}
      </div>
    </article>
  );
}
