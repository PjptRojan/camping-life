/**
 * BookingSummarySidebar.tsx
 * -----------------------------------------------------------------------------
 * A sticky, real-time receipt. It subscribes to the derived `selectReceipt`
 * selector, so every itemized line and the grand total recompute automatically
 * whenever the store changes. Houses the nights stepper, the custom Accidental
 * Damage Insurance toggle, and the checkout button that fires the success modal.
 */

import { useState } from 'react';
import { Minus, Plus, ShieldCheck, ShoppingBag } from 'lucide-react';
import { INSURANCE_FEE } from '@/data/catalog';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  resetBooking,
  setNights,
  toggleInsurance,
} from '@/store/bookingSlice';
import { formatCurrency, selectReceipt } from '@/store/selectors';
import type { ReceiptLineItem } from '@/store/selectors';
import { SuccessModal } from './SuccessModal';

export function BookingSummarySidebar(): JSX.Element {
  const dispatch = useAppDispatch();

  // Pull the fully computed receipt + the raw fields the controls need.
  const receipt = useAppSelector(selectReceipt);
  const nights = useAppSelector((state) => state.booking.nights);
  const insuranceEnabled = useAppSelector((state) => state.booking.insuranceEnabled);
  const activeDestinationId = useAppSelector(
    (state) => state.booking.activeDestinationId,
  );

  // Local UI state for the post-checkout confirmation modal.
  const [showSuccess, setShowSuccess] = useState(false);

  // The receipt already resolves the destination name (joined from the slice).
  const destinationName = receipt.destination?.label ?? null;

  // Checkout is only meaningful once a destination is chosen.
  const canCheckout = activeDestinationId !== null && receipt.total > 0;

  const handleBookAnother = (): void => {
    dispatch(resetBooking());
    setShowSuccess(false);
  };

  return (
    <>
      <aside className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-stone-200">
          {/* Header */}
          <div className="bg-emerald-900 px-5 py-4 text-white">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <ShoppingBag className="h-5 w-5 text-amber-400" />
              Trip Summary
            </h2>
            <p className="text-xs text-emerald-200">
              {receipt.itemCount} item{receipt.itemCount === 1 ? '' : 's'} ·{' '}
              {nights} night{nights === 1 ? '' : 's'}
            </p>
          </div>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5 scrollbar-thin">
            {/* Nights stepper */}
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3">
              <span className="text-sm font-semibold text-slate-700">Nights</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="One fewer night"
                  onClick={() => dispatch(setNights(nights - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-95"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-bold text-slate-800">
                  {nights}
                </span>
                <button
                  type="button"
                  aria-label="One more night"
                  onClick={() => dispatch(setNights(nights + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Empty state */}
            {receipt.total === 0 && !receipt.destination && (
              <p className="py-6 text-center text-sm text-slate-400">
                Pick a destination and add gear to build your trip.
              </p>
            )}

            {/* Destination */}
            {receipt.destination && (
              <ReceiptSection title="Destination">
                <ReceiptRow line={receipt.destination} />
              </ReceiptSection>
            )}

            {/* Gear */}
            {receipt.gear.length > 0 && (
              <ReceiptSection title="Gear">
                {receipt.gear.map((line) => (
                  <ReceiptRow key={line.id} line={line} />
                ))}
              </ReceiptSection>
            )}

            {/* Services */}
            {receipt.services.length > 0 && (
              <ReceiptSection title="Premium services">
                {receipt.services.map((line) => (
                  <ReceiptRow key={line.id} line={line} />
                ))}
              </ReceiptSection>
            )}

            {/* Insurance toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={insuranceEnabled}
              onClick={() => dispatch(toggleInsurance())}
              className={[
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200',
                insuranceEnabled
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-stone-200 bg-white hover:bg-stone-50',
              ].join(' ')}
            >
              <ShieldCheck
                className={[
                  'h-5 w-5 flex-shrink-0 transition',
                  insuranceEnabled ? 'text-emerald-600' : 'text-slate-400',
                ].join(' ')}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  Accidental Damage Insurance
                </span>
                <span className="block text-xs text-slate-500">
                  Flat {formatCurrency(INSURANCE_FEE)} — covers all rented gear
                </span>
              </span>

              {/* Track + knob */}
              <span
                className={[
                  'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
                  insuranceEnabled ? 'bg-emerald-600' : 'bg-stone-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    insuranceEnabled ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
                  ].join(' ')}
                />
              </span>
            </button>
          </div>

          {/* Total + checkout */}
          <div className="border-t border-stone-200 bg-stone-50 p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Total
              </span>
              <span className="text-3xl font-extrabold text-emerald-900">
                {formatCurrency(receipt.total)}
              </span>
            </div>

            <button
              type="button"
              disabled={!canCheckout}
              onClick={() => setShowSuccess(true)}
              className={[
                'w-full rounded-xl py-3 font-bold text-white transition',
                canCheckout
                  ? 'bg-amber-500 shadow-sm hover:bg-amber-600 active:scale-[0.99]'
                  : 'cursor-not-allowed bg-stone-300',
              ].join(' ')}
            >
              {canCheckout ? 'Confirm & Book' : 'Select a destination'}
            </button>
          </div>
        </div>
      </aside>

      <SuccessModal
        open={showSuccess}
        total={receipt.total}
        destinationName={destinationName}
        onClose={() => setShowSuccess(false)}
        onBookAnother={handleBookAnother}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Receipt sub-components                                              */
/* ------------------------------------------------------------------ */

interface ReceiptSectionProps {
  title: string;
  children: React.ReactNode;
}

/** A labeled group of receipt rows. */
function ReceiptSection({ title, children }: ReceiptSectionProps): JSX.Element {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

/** A single itemized line: label + optional detail on the left, amount right. */
function ReceiptRow({ line }: { line: ReceiptLineItem }): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3 text-sm animate-fade-in">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-700">{line.label}</p>
        {line.detail && <p className="text-xs text-slate-400">{line.detail}</p>}
      </div>
      <p className="flex-shrink-0 font-semibold text-slate-800">
        {formatCurrency(line.amount)}
      </p>
    </div>
  );
}
