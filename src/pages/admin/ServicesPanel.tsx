/**
 * ServicesPanel.tsx
 * -----------------------------------------------------------------------------
 * Admin CRUD for the on-site services catalog. Mirrors GearPanel but for the
 * single flat-fee `price` field.
 */

import { useEffect, useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { OnSiteService } from '@/types/booking';
import type { ServiceInput } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  createService,
  deleteService,
  loadServices,
  updateService,
} from '@/store/servicesSlice';
import {
  formatCurrency,
  selectServices,
  selectServicesError,
  selectServicesStatus,
} from '@/store/selectors';
import { Modal, ConfirmDialog } from '@/components/admin/Modal';
import { TextInput, TextArea } from '@/components/admin/fields';
import { PanelStates } from './PanelStates';
import { FormActions } from './GearPanel';

interface ServiceFormValues {
  name: string;
  category: string;
  description: string;
  emoji: string;
  price: string;
}

const ServiceSchema = Yup.object({
  name: Yup.string().trim().required('Name is required.'),
  category: Yup.string().trim().required('Category is required.'),
  description: Yup.string(),
  emoji: Yup.string(),
  price: Yup.number()
    .transform((v, o) => (o === '' ? undefined : v))
    .typeError('Must be a number.')
    .min(0, 'Must be 0 or more.')
    .required('Price is required.'),
});

const emptyValues: ServiceFormValues = {
  name: '',
  category: '',
  description: '',
  emoji: '',
  price: '',
};

const toFormValues = (s: OnSiteService): ServiceFormValues => ({
  name: s.name,
  category: s.category,
  description: s.description,
  emoji: s.emoji,
  price: String(s.price),
});

export function ServicesPanel(): JSX.Element {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectServices);
  const status = useAppSelector(selectServicesStatus);
  const error = useAppSelector(selectServicesError);

  const [editing, setEditing] = useState<OnSiteService | 'new' | null>(null);
  const [deleting, setDeleting] = useState<OnSiteService | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(loadServices());
  }, [status, dispatch]);

  const categoryList = Array.from(new Set(services.map((s) => s.category)));

  const handleSubmit = async (
    values: ServiceFormValues,
    helpers: FormikHelpers<ServiceFormValues>,
  ): Promise<void> => {
    const payload: ServiceInput = {
      name: values.name.trim(),
      category: values.category.trim(),
      description: values.description.trim(),
      emoji: values.emoji.trim(),
      price: Number(values.price),
    };
    try {
      if (editing && editing !== 'new') {
        await dispatch(updateService({ id: editing.id, data: payload })).unwrap();
        toast.success(`Updated “${payload.name}”.`);
      } else {
        await dispatch(createService(payload)).unwrap();
        toast.success(`Created “${payload.name}”.`);
      }
      setEditing(null);
    } catch {
      /* interceptor toasts; keep form open */
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await dispatch(deleteService(deleting.id)).unwrap();
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
          {services.length} service{services.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" />
          New service
        </button>
      </div>

      <PanelStates
        status={status}
        error={error}
        isEmpty={services.length === 0}
        emptyLabel="No services yet."
        onRetry={() => dispatch(loadServices())}
      />

      {services.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Service</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 text-right font-bold">Price</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {services.map((item) => (
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
                    {formatCurrency(item.price)}
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

      <Modal
        open={editing !== null}
        title={editing && editing !== 'new' ? 'Edit service' : 'New service'}
        onClose={() => setEditing(null)}
      >
        <datalist id="service-category-suggestions">
          {categoryList.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Formik
          initialValues={
            editing && editing !== 'new' ? toFormValues(editing) : emptyValues
          }
          validationSchema={ServiceSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4" noValidate>
              <TextInput name="name" label="Name" placeholder="Private Campfire Chef" />
              <TextInput
                name="category"
                label="Category"
                placeholder="On-Site Staff"
                list="service-category-suggestions"
                hint="Reuse an existing category or type a new one."
              />
              <TextArea
                name="description"
                label="Description"
                placeholder="Short explanation of the add-on."
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInput name="emoji" label="Emoji" placeholder="👨‍🍳" />
                <TextInput name="price" label="Price (USD)" type="number" />
              </div>

              <FormActions isSubmitting={isSubmitting} onCancel={() => setEditing(null)} />
            </Form>
          )}
        </Formik>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete service"
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
