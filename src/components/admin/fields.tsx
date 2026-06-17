/**
 * fields.tsx
 * -----------------------------------------------------------------------------
 * Formik-wired form controls for the admin CRUD forms. Each is driven by
 * `useField`, shows its validation error once touched, and shares the emerald
 * focus-ring theme used across the app. Kept separate from the auth
 * `components/form/TextField` since those are icon-led and login-specific.
 */

import { useField } from 'formik';
import { useState, type ReactNode } from 'react';
import { AlertCircle, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const baseInput = (invalid: boolean): string =>
  [
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-4',
    invalid
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-stone-200 focus:border-emerald-400 focus:ring-emerald-100',
  ].join(' ');

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-slate-700"
    >
      {children}
    </label>
  );
}

function FieldError({ id, error }: { id: string; error: string }): JSX.Element {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {error}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Text / number input                                                 */
/* ------------------------------------------------------------------ */

interface TextInputProps {
  name: string;
  label: string;
  type?: 'text' | 'number';
  placeholder?: string;
  disabled?: boolean;
  /** Optional hint shown under the label. */
  hint?: string;
  /** id of a <datalist> to attach for autocomplete suggestions. */
  list?: string;
}

export function TextInput({
  name,
  label,
  type = 'text',
  placeholder,
  disabled,
  hint,
  list,
}: TextInputProps): JSX.Element {
  const [field, meta] = useField(name);
  const invalid = Boolean(meta.touched && meta.error);
  const errorId = `${name}-error`;

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <input
        {...field}
        value={field.value ?? ''}
        id={name}
        type={type}
        inputMode={type === 'number' ? 'decimal' : undefined}
        placeholder={placeholder}
        disabled={disabled}
        list={list}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        className={[baseInput(invalid), disabled ? 'cursor-not-allowed opacity-60' : ''].join(' ')}
      />
      {hint && !invalid && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {invalid && <FieldError id={errorId} error={meta.error as string} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Textarea                                                            */
/* ------------------------------------------------------------------ */

export function TextArea({
  name,
  label,
  placeholder,
  rows = 3,
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
}): JSX.Element {
  const [field, meta] = useField(name);
  const invalid = Boolean(meta.touched && meta.error);
  const errorId = `${name}-error`;

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <textarea
        {...field}
        value={field.value ?? ''}
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        className={baseInput(invalid)}
      />
      {invalid && <FieldError id={errorId} error={meta.error as string} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Select                                                              */
/* ------------------------------------------------------------------ */

export function SelectInput({
  name,
  label,
  options,
  placeholder = 'Select…',
}: {
  name: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
}): JSX.Element {
  const [field, meta] = useField(name);
  const invalid = Boolean(meta.touched && meta.error);
  const errorId = `${name}-error`;

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <select
        {...field}
        value={field.value ?? ''}
        id={name}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        className={baseInput(invalid)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {invalid && <FieldError id={errorId} error={meta.error as string} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkbox group (string[])                                           */
/* ------------------------------------------------------------------ */

export function CheckboxGroup({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}): JSX.Element {
  const [field, meta, helpers] = useField<string[]>(name);
  const invalid = Boolean(meta.touched && meta.error);
  const errorId = `${name}-error`;
  const value = field.value ?? [];

  const toggle = (opt: string): void => {
    helpers.setTouched(true);
    helpers.setValue(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt],
    );
  };

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={checked}
              onClick={() => toggle(opt)}
              className={[
                'rounded-full px-3.5 py-1.5 text-sm font-semibold transition',
                checked
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-stone-200 hover:bg-stone-50',
              ].join(' ')}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {invalid && <FieldError id={errorId} error={meta.error as string} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tags input (string[]) — free-form chips                             */
/* ------------------------------------------------------------------ */

export function TagsInput({
  name,
  label,
  placeholder = 'Type and press Enter…',
  hint,
}: {
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
}): JSX.Element {
  const [field, meta, helpers] = useField<string[]>(name);
  const invalid = Boolean(meta.touched && meta.error);
  const errorId = `${name}-error`;
  const value = field.value ?? [];
  const [draft, setDraft] = useState('');

  const commit = (): void => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      helpers.setValue([...value, trimmed]);
    }
    setDraft('');
  };

  const remove = (tag: string): void => {
    helpers.setValue(value.filter((v) => v !== tag));
  };

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div
        className={[
          'flex flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2.5 py-2 transition focus-within:ring-4',
          invalid
            ? 'border-red-300 focus-within:border-red-400 focus-within:ring-red-100'
            : 'border-stone-200 focus-within:border-emerald-400 focus-within:ring-emerald-100',
        ].join(' ')}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-emerald-700"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => remove(tag)}
              className="rounded-full p-0.5 text-emerald-500 transition hover:bg-emerald-100 hover:text-emerald-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={name}
          value={draft}
          placeholder={value.length === 0 ? placeholder : ''}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            commit();
            helpers.setTouched(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
              remove(value[value.length - 1]);
            }
          }}
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
      </div>
      {hint && !invalid && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {invalid && <FieldError id={errorId} error={meta.error as string} />}
    </div>
  );
}
