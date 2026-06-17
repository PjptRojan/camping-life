/**
 * Modal.tsx
 * -----------------------------------------------------------------------------
 * Lightweight dialog primitives for the admin dashboard. `Modal` is a centered
 * card over a dimmed backdrop with a title bar; `ConfirmDialog` builds on it for
 * destructive confirmations (e.g. delete). Both close on backdrop click and on
 * Escape, and lock body scroll while open.
 */

import { useEffect, type ReactNode } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Optional max-width override; defaults to a comfortable form width. */
  widthClassName?: string;
}

/** A controlled, accessible modal dialog. */
export function Modal({
  open,
  title,
  onClose,
  children,
  widthClassName = 'max-w-2xl',
}: ModalProps): JSX.Element | null {
  // Close on Escape and lock background scroll while mounted.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          'animate-scale-in my-auto w-full rounded-2xl bg-white shadow-xl ring-1 ring-stone-200',
          widthClassName,
        ].join(' ')}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-extrabold tracking-tight text-emerald-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-stone-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  /** Shows a spinner and disables the confirm button while true. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A destructive-action confirmation built on {@link Modal}. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): JSX.Element | null {
  return (
    <Modal open={open} title={title} onClose={onCancel} widthClassName="max-w-md">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="text-sm text-slate-600">{message}</div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-stone-100 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
