/**
 * PremiumServices.tsx
 * -----------------------------------------------------------------------------
 * Checklist of luxury add-ons grouped into "On-Site Staff" and "Experiences".
 * Each row is a toggle backed by `selectedServiceIds` in Redux, so checking an
 * item instantly flows into the receipt and cart count.
 */

import { useMemo } from 'react';
import { Check } from 'lucide-react';
import type { OnSiteService, ServiceCategory } from '@/types/booking';
import { ON_SITE_SERVICES } from '@/data/catalog';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleService } from '@/store/bookingSlice';
import { formatCurrency } from '@/store/selectors';

const GROUPS: readonly ServiceCategory[] = ['On-Site Staff', 'Experiences'];

export function PremiumServices(): JSX.Element {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector((state) => state.booking.selectedServiceIds);

  // Membership set for O(1) "is this toggled on?" checks during render.
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <section aria-labelledby="services-heading" className="mt-10">
      <header className="mb-4">
        <h2
          id="services-heading"
          className="text-xl font-extrabold tracking-tight text-emerald-900"
        >
          Add a touch of luxury
        </h2>
        <p className="text-sm text-slate-500">
          Optional staff and experiences to elevate your stay.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {GROUPS.map((group) => (
          <div
            key={group}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
          >
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-600">
              {group}
            </h3>

            <ul className="space-y-2">
              {ON_SITE_SERVICES.filter((svc) => svc.category === group).map((svc) => (
                <ServiceRow
                  key={svc.id}
                  service={svc}
                  checked={selectedSet.has(svc.id)}
                  onToggle={() => dispatch(toggleService(svc.id))}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Row sub-component                                                   */
/* ------------------------------------------------------------------ */

interface ServiceRowProps {
  service: OnSiteService;
  checked: boolean;
  onToggle: () => void;
}

/** A single toggleable add-on row with a custom animated checkbox. */
function ServiceRow({ service, checked, onToggle }: ServiceRowProps): JSX.Element {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className={[
          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200',
          checked
            ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
            : 'border-stone-200 bg-white hover:border-emerald-200 hover:bg-stone-50',
        ].join(' ')}
      >
        {/* Custom checkbox */}
        <span
          className={[
            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition',
            checked
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-stone-300 bg-white',
          ].join(' ')}
        >
          {checked && <Check className="h-4 w-4 animate-scale-in" />}
        </span>

        <span className="text-2xl" aria-hidden>
          {service.emoji}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-slate-800">{service.name}</span>
          <span className="block truncate text-xs text-slate-500">
            {service.description}
          </span>
        </span>

        <span className="flex-shrink-0 font-bold text-emerald-800">
          {formatCurrency(service.price)}
        </span>
      </button>
    </li>
  );
}
