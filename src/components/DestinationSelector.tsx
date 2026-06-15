/**
 * DestinationSelector.tsx
 * -----------------------------------------------------------------------------
 * Visual campsite catalog with terrain filters (Mountain / Lakeside / Forest).
 * The active card is highlighted via Redux state and clicking a card dispatches
 * `setDestination` for instant, app-wide selection feedback.
 */

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, MapPin, RotateCw } from "lucide-react";
import type { Destination, DestinationType } from "@/types/booking";
import { useAppDispatch, useAppSelector } from "@/store";
import { setDestination } from "@/store/bookingSlice";
import { loadDestinations } from "@/store/destinationsSlice";
import {
  formatCurrency,
  selectDestinations,
  selectDestinationsError,
  selectDestinationsStatus,
} from "@/store/selectors";

/** "All" plus every terrain type — the filter pills shown above the grid. */
type FilterValue = "All" | DestinationType;
const FILTERS: readonly FilterValue[] = [
  "All",
  "Mountain",
  "Lakeside",
  "Forest",
];

export function DestinationSelector(): JSX.Element {
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((state) => state.booking.activeDestinationId);
  const destinations = useAppSelector(selectDestinations);
  const status = useAppSelector(selectDestinationsStatus);
  const error = useAppSelector(selectDestinationsError);

  // Local UI-only state: which terrain filter is active. Not global concern.
  const [filter, setFilter] = useState<FilterValue>("All");

  // Fetch the catalog once on mount (only while still idle so we don't refetch
  // on every navigation back to the dashboard).
  useEffect(() => {
    if (status === "idle") {
      dispatch(loadDestinations());
    }
  }, [status, dispatch]);

  // Recompute the visible list only when the data or filter changes.
  const visible = useMemo<readonly Destination[]>(
    () =>
      filter === "All"
        ? destinations
        : destinations.filter((dest) => dest.type === filter),
    [destinations, filter],
  );

  return (
    <section aria-labelledby="destinations-heading">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="destinations-heading"
            className="text-xl font-extrabold tracking-tight text-emerald-900"
          >
            Choose your destination
          </h2>
          <p className="text-sm text-slate-500">
            Hand-picked sites across mountains, lakes and forests.
          </p>
        </div>

        {/* Terrain filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((value) => {
            const isActive = filter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={[
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-stone-200 hover:bg-stone-50",
                ].join(" ")}
              >
                {value}
              </button>
            );
          })}
        </div>
      </header>

      {/* Loading — first fetch with nothing cached yet. */}
      {status === "loading" && destinations.length === 0 && (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-16 text-slate-500 ring-1 ring-stone-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading destinations…</span>
        </div>
      )}

      {/* Error — fetch failed and we have nothing to show. Offer a retry. */}
      {status === "failed" && destinations.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-center ring-1 ring-stone-200">
          <p className="text-sm text-slate-500">
            {error ?? "We couldn’t load destinations."}
          </p>
          <button
            type="button"
            onClick={() => dispatch(loadDestinations())}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            <RotateCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {/* Empty — fetch succeeded but the catalog is empty (or filtered to none). */}
      {status === "succeeded" && visible.length === 0 && (
        <div className="rounded-2xl bg-white py-16 text-center text-sm text-slate-400 ring-1 ring-stone-200">
          No destinations match this filter.
        </div>
      )}

      {/* Results */}
      {visible.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              isActive={dest.id === activeId}
              onSelect={() => dispatch(setDestination(dest.id))}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Card sub-component                                                  */
/* ------------------------------------------------------------------ */

interface DestinationCardProps {
  destination: Destination;
  isActive: boolean;
  onSelect: () => void;
}

/** A single selectable campsite tile. Glows when it is the active selection. */
function DestinationCard({
  destination,
  isActive,
  onSelect,
}: DestinationCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white p-5 text-left transition-all duration-200",
        isActive
          ? "shadow-card ring-2 ring-emerald-500"
          : "shadow-sm ring-1 ring-stone-200 hover:-translate-y-0.5 hover:shadow-card hover:ring-emerald-200",
      ].join(" ")}
    >
      {/* Active checkmark */}
      {isActive && (
        <span className="absolute right-4 top-4 flex h-7 w-7 animate-scale-in items-center justify-center rounded-full bg-emerald-600 text-white shadow">
          <Check className="h-4 w-4" />
        </span>
      )}

      <span className="text-4xl" aria-hidden>
        {destination.emoji}
      </span>

      <span className="mt-3 inline-flex w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700">
        {destination.type}
      </span>

      <h3 className="mt-2 text-lg font-bold text-slate-800">
        {destination.name}
      </h3>

      <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
        <MapPin className="h-3.5 w-3.5" />
        {destination.location}
      </p>

      <p className="mt-2 flex-1 text-sm text-slate-600">
        {destination.description}
      </p>

      <p className="mt-4 text-sm">
        <span className="text-xl font-extrabold text-emerald-800">
          {formatCurrency(destination.pricePerNight)}
        </span>
        <span className="text-slate-400"> / night</span>
      </p>
    </button>
  );
}
