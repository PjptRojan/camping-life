/**
 * SuccessModal.tsx
 * -----------------------------------------------------------------------------
 * Confirmation dialog shown after a successful checkout. Presentational only —
 * the parent owns open/close state and the "book another trip" reset.
 */

import { CheckCircle2, X } from 'lucide-react';
import { formatCurrency } from '@/store/selectors';

interface SuccessModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Grand total that was "charged", shown for reassurance. */
  total: number;
  /** Name of the booked destination, if any. */
  destinationName: string | null;
  /** Close without resetting (e.g. the X button). */
  onClose: () => void;
  /** Clear the cart and start a fresh trip. */
  onBookAnother: () => void;
}

/** A centered, animated success dialog over a dimmed backdrop. */
export function SuccessModal({
  open,
  total,
  destinationName,
  onClose,
  onBookAnother,
}: SuccessModalProps): JSX.Element | null {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md animate-scale-in rounded-2xl bg-white p-8 text-center shadow-card"
        // Stop backdrop clicks from bubbling up and closing the modal.
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-stone-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>

        <h2 id="success-title" className="text-2xl font-extrabold text-emerald-900">
          You&rsquo;re all set!
        </h2>

        <p className="mt-2 text-slate-600">
          {destinationName
            ? `Your escape to ${destinationName} is booked.`
            : 'Your camping adventure is booked.'}{' '}
          A confirmation is on its way to your inbox.
        </p>

        <div className="mt-6 rounded-xl bg-stone-50 p-4">
          <p className="text-sm font-medium text-slate-500">Total charged</p>
          <p className="text-3xl font-extrabold text-emerald-800">
            {formatCurrency(total)}
          </p>
        </div>

        <button
          type="button"
          onClick={onBookAnother}
          className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]"
        >
          Book another trip
        </button>
      </div>
    </div>
  );
}
