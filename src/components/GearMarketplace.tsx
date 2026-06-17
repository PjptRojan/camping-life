/**
 * GearMarketplace.tsx
 * -----------------------------------------------------------------------------
 * Interactive rent/buy catalog split into category tabs. Each card shows a
 * quantity stepper and — once added — a Rent⇄Buy toggle. All mutations flow
 * through the booking slice so the sidebar receipt stays in lockstep.
 */

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Minus, Plus, RotateCw } from 'lucide-react';
import type { CartGearItem, GearItem } from '@/types/booking';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  addGearItem,
  removeGearItem,
  toggleGearItemMode,
} from '@/store/bookingSlice';
import { loadGear } from '@/store/gearSlice';
import {
  formatCurrency,
  selectGear,
  selectGearError,
  selectGearStatus,
} from '@/store/selectors';

export function GearMarketplace(): JSX.Element {
  const dispatch = useAppDispatch();
  const cartGear = useAppSelector((state) => state.booking.cartGear);
  const gear = useAppSelector(selectGear);
  const status = useAppSelector(selectGearStatus);
  const error = useAppSelector(selectGearError);

  // Fetch the catalog once on mount (only while idle so we don't refetch on
  // every navigation back to the dashboard).
  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadGear());
    }
  }, [status, dispatch]);

  // Tabs are derived from whatever categories the fetched data contains, in
  // first-seen order — the backend stores `category` as a free-form string.
  const categories = useMemo<string[]>(() => {
    const seen: string[] = [];
    for (const item of gear) {
      if (!seen.includes(item.category)) seen.push(item.category);
    }
    return seen;
  }, [gear]);

  // Local UI state: the currently open category tab. Falls back to the first
  // available category once data loads.
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const effectiveTab = activeTab ?? categories[0] ?? null;

  // Index cart lines by gearId for O(1) lookups while rendering cards.
  const cartByGearId = useMemo<Record<string, CartGearItem>>(
    () => Object.fromEntries(cartGear.map((line) => [line.gearId, line])),
    [cartGear],
  );

  const itemsForTab = useMemo(
    () => gear.filter((item) => item.category === effectiveTab),
    [gear, effectiveTab],
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

      {/* Loading — first fetch with nothing cached yet. */}
      {status === 'loading' && gear.length === 0 && (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-16 text-slate-500 ring-1 ring-stone-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading gear…</span>
        </div>
      )}

      {/* Error — fetch failed and we have nothing to show. Offer a retry. */}
      {status === 'failed' && gear.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-center ring-1 ring-stone-200">
          <p className="text-sm text-slate-500">
            {error ?? 'We couldn’t load gear.'}
          </p>
          <button
            type="button"
            onClick={() => dispatch(loadGear())}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            <RotateCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {/* Empty — fetch succeeded but the catalog is empty. */}
      {status === 'succeeded' && gear.length === 0 && (
        <div className="rounded-2xl bg-white py-16 text-center text-sm text-slate-400 ring-1 ring-stone-200">
          No gear available yet.
        </div>
      )}

      {gear.length > 0 && (
        <>
          {/* Category tabs */}
          <div
            role="tablist"
            aria-label="Gear categories"
            className="mb-5 inline-flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1"
          >
            {categories.map((category) => {
              const isActive = category === effectiveTab;
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
        </>
      )}
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
            {formatCurrency(item.rentPrice)}
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
