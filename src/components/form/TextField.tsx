/**
 * TextField.tsx
 * -----------------------------------------------------------------------------
 * Shared, themed form controls used by the auth screens (SignUp / SignIn).
 * `TextField` is a Formik-wired input with a leading icon, an emerald focus
 * ring, and an inline error that appears only after the field is touched.
 * `PasswordToggle` is the small show/hide button rendered inside password
 * inputs.
 */

import { useField } from 'formik';
import type { ReactNode } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface TextFieldProps {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  /** Leading icon shown inside the input. */
  icon: ReactNode;
  /** Optional trailing control (e.g. a show/hide password button). */
  trailing?: ReactNode;
}

/**
 * A themed text input wired to Formik via `useField`. Shows the validation
 * error only after the field has been touched, with an emerald focus ring and
 * a red state when invalid.
 */
export function TextField({
  name,
  label,
  type,
  placeholder,
  autoComplete,
  icon,
  trailing,
}: TextFieldProps): JSX.Element {
  const [field, meta] = useField(name);
  const invalid = Boolean(meta.touched && meta.error);
  const errorId = `${name}-error`;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          {icon}
        </span>

        <input
          {...field}
          id={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className={[
            'w-full rounded-xl border bg-white py-2.5 pl-10 text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-4',
            trailing ? 'pr-11' : 'pr-3.5',
            invalid
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-stone-200 focus:border-emerald-400 focus:ring-emerald-100',
          ].join(' ')}
        />

        {trailing && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            {trailing}
          </span>
        )}
      </div>

      {invalid && (
        <p
          id={errorId}
          className="mt-1.5 flex items-center gap-1 text-sm text-red-600"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {meta.error}
        </p>
      )}
    </div>
  );
}

interface PasswordToggleProps {
  shown: boolean;
  onToggle: () => void;
}

/** Small in-input button that toggles password visibility. */
export function PasswordToggle({ shown, onToggle }: PasswordToggleProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="rounded-lg p-2 text-slate-400 transition hover:bg-stone-100 hover:text-slate-600"
    >
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}
