/**
 * GearPanel.tsx
 * -----------------------------------------------------------------------------
 * Admin CRUD for the gear catalog: a table of items with edit/delete actions
 * and a Formik+Yup create/edit form in a modal. Mutations dispatch the gear
 * slice's thunks, which fold results back into the same `items` the public
 * marketplace reads — so edits show up everywhere without a refetch.
 */

import { useEffect, useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import type { GearItem } from '@/types/booking';
import type { GearInput } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  createGear,
  deleteGear,
  loadGear,
  updateGear,
} from '@/store/gearSlice';
import {
  formatCurrency,
  selectGear,
  selectGearError,
  selectGearStatus,
} from '@/store/selectors';
import { Modal, ConfirmDialog } from '@/components/admin/Modal';
import { TextInput, TextArea } from '@/components/admin/fields';
import { PanelStates } from './PanelStates';

interface GearFormValues {
  name: string;
  category: string;
  description: string;
  emoji: string;
  rentPrice: string;
  buyPrice: string;
}

const GearSchema = Yup.object({
  name: Yup.string().trim().required('Name is required.'),
  category: Yup.string().trim().required('Category is required.'),
  description: Yup.string(),
  emoji: Yup.string(),
  rentPrice: Yup.number()
    .transform((v, o) => (o === '' ? undefined : v))
    .typeError('Must be a number.')
    .min(0, 'Must be 0 or more.')
    .required('Rent price is required.'),
  buyPrice: Yup.number()
    .transform((v, o) => (o === '' ? undefined : v))
    .typeError('Must be a number.')
    .min(0, 'Must be 0 or more.')
    .required('Buy price is required.'),
});

const emptyValues: GearFormValues = {
  name: '',
  category: '',
  description: '',
  emoji: '',
  rentPrice: '',
  buyPrice: '',
};

const toFormValues = (g: GearItem): GearFormValues => ({
  name: g.name,
  category: g.category,
  description: g.description,
  emoji: g.emoji,
  rentPrice: String(g.rentPrice),
  buyPrice: String(g.buyPrice),
});

export function GearPanel(): JSX.Element {
  const dispatch = useAppDispatch();
  const gear = useAppSelector(selectGear);
  const status = useAppSelector(selectGearStatus);
  const error = useAppSelector(selectGearError);

  // null → no form open; a GearItem → editing it; 'new' → creating.
  const [editing, setEditing] = useState<GearItem | 'new' | null>(null);
  const [deleting, setDeleting] = useState<GearItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(loadGear());
  }, [status, dispatch]);

  // Suggest existing categories for quick reuse without locking the field.
  const categoryList = Array.from(new Set(gear.map((g) => g.category)));

  const handleSubmit = async (
    values: GearFormValues,
    helpers: FormikHelpers<GearFormValues>,
  ): Promise<void> => {
    const payload: GearInput = {
      name: values.name.trim(),
      category: values.category.trim(),
      description: values.description.trim(),
      emoji: values.emoji.trim(),
      rentPrice: Number(values.rentPrice),
      buyPrice: Number(values.buyPrice),
    };
    try {
      if (editing && editing !== 'new') {
        await dispatch(updateGear({ id: editing.id, data: payload })).unwrap();
        toast.success(`Updated “${payload.name}”.`);
      } else {
        await dispatch(createGear(payload)).unwrap();
        toast.success(`Created “${payload.name}”.`);
      }
      setEditing(null);
    } catch {
      // The httpClient interceptor already surfaced the error toast; keep the
      // form open so the admin can correct and retry.
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await dispatch(deleteGear(deleting.id)).unwrap();
      toast.success(`Deleted “${deleting.name}”.`);
      setDeleting(null);
    } catch {
      /* interceptor toasts */
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {gear.length} item{gear.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" />
          New gear
        </button>
      </div>

      <PanelStates
        status={status}
        error={error}
        isEmpty={gear.length === 0}
        emptyLabel="No gear yet."
        onRetry={() => dispatch(loadGear())}
      />

      {gear.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Item</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 text-right font-bold">Rent/night</th>
                <th className="px-4 py-3 text-right font-bold">Buy</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {gear.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/60">
                  <td className="px-4 py-3">
                    <span className="mr-2" aria-hidden>
                      {item.emoji}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.category}</td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatCurrency(item.rentPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatCurrency(item.buyPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => setEditing(item)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => setDeleting(item)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / edit form */}
      <Modal
        open={editing !== null}
        title={editing && editing !== 'new' ? 'Edit gear' : 'New gear'}
        onClose={() => setEditing(null)}
      >
        <datalist id="gear-category-suggestions">
          {categoryList.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Formik
          initialValues={
            editing && editing !== 'new' ? toFormValues(editing) : emptyValues
          }
          validationSchema={GearSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4" noValidate>
              <TextInput name="name" label="Name" placeholder="Luxury Bell Tent" />
              <TextInput
                name="category"
                label="Category"
                placeholder="Tents & Bedding"
                list="gear-category-suggestions"
                hint="Reuse an existing category or type a new one."
              />
              <TextArea
                name="description"
                label="Description"
                placeholder="Short marketing line shown on the product card."
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <TextInput name="emoji" label="Emoji" placeholder="⛺" />
                <TextInput name="rentPrice" label="Rent / night (USD)" type="number" />
                <TextInput name="buyPrice" label="Buy price (USD)" type="number" />
              </div>

              <FormActions isSubmitting={isSubmitting} onCancel={() => setEditing(null)} />
            </Form>
          )}
        </Formik>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete gear"
        busy={deleteBusy}
        message={
          <>
            Delete <strong>{deleting?.name}</strong>? This can&rsquo;t be undone.
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/* Shared submit/cancel footer for the admin forms. */
export function FormActions({
  isSubmitting,
  onCancel,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
}): JSX.Element {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-stone-100"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Save
      </button>
    </div>
  );
}
