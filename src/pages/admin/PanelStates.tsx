/**
 * PanelStates.tsx
 * -----------------------------------------------------------------------------
 * The shared loading / error / empty placeholders the admin panels render
 * before their table. Returns null once there's data to show (the panel renders
 * its own table in that case).
 */

import { Loader2, RotateCw } from 'lucide-react';
import type { RequestStatus } from '@/store/destinationsSlice';

interface PanelStatesProps {
  status: RequestStatus;
  error: string | null;
  isEmpty: boolean;
  emptyLabel: string;
  onRetry: () => void;
}

export function PanelStates({
  status,
  error,
  isEmpty,
  emptyLabel,
  onRetry,
}: PanelStatesProps): JSX.Element | null {
  if (status === 'loading' && isEmpty) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-16 text-slate-500 ring-1 ring-stone-200">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    );
  }

  if (status === 'failed' && isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-center ring-1 ring-stone-200">
        <p className="text-sm text-slate-500">{error ?? 'Something went wrong.'}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <RotateCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  if (status === 'succeeded' && isEmpty) {
    return (
      <div className="rounded-2xl bg-white py-16 text-center text-sm text-slate-400 ring-1 ring-stone-200">
        {emptyLabel}
      </div>
    );
  }

  return null;
}
