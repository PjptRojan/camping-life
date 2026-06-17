/**
 * DestinationsPanel.tsx
 * -----------------------------------------------------------------------------
 * Admin CRUD for the Nepal-trek destination catalog — the richest of the three
 * forms (enums, season multi-select, permit tags, duration range). The `id` is
 * an author-chosen slug: editable on create, locked on edit.
 */

import { useEffect, useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  DIFFICULTIES,
  SEASONS,
  TREK_REGIONS,
  type Destination,
  type Difficulty,
  type Season,
  type TrekRegion,
} from '@/types/booking';
import type { DestinationInput } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  createDestination,
  deleteDestination,
  loadDestinations,
  updateDestination,
} from '@/store/destinationsSlice';
import {
  formatCurrency,
  selectDestinations,
  selectDestinationsError,
  selectDestinationsStatus,
} from '@/store/selectors';
import { Modal, ConfirmDialog } from '@/components/admin/Modal';
import {
  CheckboxGroup,
  SelectInput,
  TagsInput,
  TextArea,
  TextInput,
} from '@/components/admin/fields';
import { PanelStates } from './PanelStates';
import { FormActions } from './GearPanel';

interface DestinationFormValues {
  id: string;
  name: string;
  region: string;
  description: string;
  location: string;
  emoji: string;
  startPoint: string;
  difficulty: string;
  pricePerNight: string;
  maxAltitudeMeters: string;
  durationDaysMin: string;
  durationDaysMax: string;
  bestSeasons: string[];
  permitsRequired: string[];
}

const posInt = (msg: string) =>
  Yup.number()
    .transform((v, o) => (o === '' ? undefined : v))
    .typeError('Must be a number.')
    .integer('Must be a whole number.')
    .positive('Must be greater than 0.')
    .required(msg);

const DestinationSchema = Yup.object({
  id: Yup.string()
    .trim()
    .matches(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only.')
    .required('ID slug is required.'),
  name: Yup.string().trim().required('Name is required.'),
  region: Yup.string().oneOf(TREK_REGIONS, 'Pick a region.').required('Region is required.'),
  description: Yup.string().trim().required('Description is required.'),
  location: Yup.string().trim().required('Location is required.'),
  emoji: Yup.string().trim().required('Emoji is required.'),
  startPoint: Yup.string().trim().required('Start point is required.'),
  difficulty: Yup.string()
    .oneOf(DIFFICULTIES, 'Pick a difficulty.')
    .required('Difficulty is required.'),
  pricePerNight: posInt('Price is required.'),
  maxAltitudeMeters: posInt('Max altitude is required.'),
  durationDaysMin: posInt('Min duration is required.'),
  durationDaysMax: posInt('Max duration is required.').min(
    Yup.ref('durationDaysMin'),
    'Max must be ≥ min.',
  ),
  bestSeasons: Yup.array().of(Yup.string()).min(1, 'Pick at least one season.'),
  permitsRequired: Yup.array().of(Yup.string()),
});

const emptyValues: DestinationFormValues = {
  id: '',
  name: '',
  region: '',
  description: '',
  location: '',
  emoji: '',
  startPoint: '',
  difficulty: '',
  pricePerNight: '',
  maxAltitudeMeters: '',
  durationDaysMin: '',
  durationDaysMax: '',
  bestSeasons: [],
  permitsRequired: [],
};

const toFormValues = (d: Destination): DestinationFormValues => ({
  id: d.id,
  name: d.name,
  region: d.region,
  description: d.description,
  location: d.location,
  emoji: d.emoji,
  startPoint: d.startPoint,
  difficulty: d.difficulty,
  pricePerNight: String(d.pricePerNight),
  maxAltitudeMeters: String(d.maxAltitudeMeters),
  durationDaysMin: String(d.durationDaysMin),
  durationDaysMax: String(d.durationDaysMax),
  bestSeasons: [...d.bestSeasons],
  permitsRequired: [...d.permitsRequired],
});

export function DestinationsPanel(): JSX.Element {
  const dispatch = useAppDispatch();
  const destinations = useAppSelector(selectDestinations);
  const status = useAppSelector(selectDestinationsStatus);
  const error = useAppSelector(selectDestinationsError);

  const [editing, setEditing] = useState<Destination | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Destination | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(loadDestinations());
  }, [status, dispatch]);

  const isEdit = editing !== null && editing !== 'new';

  const handleSubmit = async (
    values: DestinationFormValues,
    helpers: FormikHelpers<DestinationFormValues>,
  ): Promise<void> => {
    const payload: DestinationInput = {
      id: values.id.trim(),
      name: values.name.trim(),
      region: values.region as TrekRegion,
      description: values.description.trim(),
      location: values.location.trim(),
      emoji: values.emoji.trim(),
      startPoint: values.startPoint.trim(),
      difficulty: values.difficulty as Difficulty,
      pricePerNight: Number(values.pricePerNight),
      maxAltitudeMeters: Number(values.maxAltitudeMeters),
      durationDaysMin: Number(values.durationDaysMin),
      durationDaysMax: Number(values.durationDaysMax),
      bestSeasons: values.bestSeasons as Season[],
      permitsRequired: values.permitsRequired,
    };
    try {
      if (isEdit) {
        await dispatch(
          updateDestination({ id: editing.id, data: payload }),
        ).unwrap();
        toast.success(`Updated “${payload.name}”.`);
      } else {
        await dispatch(createDestination(payload)).unwrap();
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
      await dispatch(deleteDestination(deleting.id)).unwrap();
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
          {destinations.length} trek{destinations.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" />
          New trek
        </button>
      </div>

      <PanelStates
        status={status}
        error={error}
        isEmpty={destinations.length === 0}
        emptyLabel="No treks yet."
        onRetry={() => dispatch(loadDestinations())}
      />

      {destinations.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Trek</th>
                <th className="px-4 py-3 font-bold">Region</th>
                <th className="px-4 py-3 font-bold">Difficulty</th>
                <th className="px-4 py-3 text-right font-bold">Price/day</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {destinations.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/60">
                  <td className="px-4 py-3">
                    <span className="mr-2" aria-hidden>
                      {item.emoji}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.name}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">{item.id}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.region}</td>
                  <td className="px-4 py-3 text-slate-500">{item.difficulty}</td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatCurrency(item.pricePerNight)}
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
        title={isEdit ? 'Edit trek' : 'New trek'}
        onClose={() => setEditing(null)}
        widthClassName="max-w-3xl"
      >
        <Formik
          initialValues={isEdit ? toFormValues(editing) : emptyValues}
          validationSchema={DestinationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInput
                  name="id"
                  label="ID slug"
                  placeholder="ebc"
                  disabled={isEdit}
                  hint={isEdit ? 'The slug is fixed once created.' : 'e.g. "ebc", "abc".'}
                />
                <TextInput name="name" label="Name" placeholder="Everest Base Camp" />
                <SelectInput name="region" label="Region" options={TREK_REGIONS} />
                <SelectInput name="difficulty" label="Difficulty" options={DIFFICULTIES} />
                <TextInput name="location" label="Location" placeholder="Khumbu, Nepal" />
                <TextInput name="startPoint" label="Start point" placeholder="Lukla" />
              </div>

              <TextArea
                name="description"
                label="Description"
                placeholder="Short, evocative marketing line."
              />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <TextInput name="emoji" label="Emoji" placeholder="🏔️" />
                <TextInput name="pricePerNight" label="Price / day (USD)" type="number" />
                <TextInput name="durationDaysMin" label="Min days" type="number" />
                <TextInput name="durationDaysMax" label="Max days" type="number" />
              </div>

              <TextInput
                name="maxAltitudeMeters"
                label="Max altitude (metres)"
                type="number"
              />

              <CheckboxGroup name="bestSeasons" label="Best seasons" options={SEASONS} />

              <TagsInput
                name="permitsRequired"
                label="Permits required"
                placeholder="Type a permit and press Enter…"
                hint="Optional — leave empty if none."
              />

              <FormActions isSubmitting={isSubmitting} onCancel={() => setEditing(null)} />
            </Form>
          )}
        </Formik>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete trek"
        busy={deleteBusy}
        message={
          <>
            Delete <strong>{deleting?.name}</strong>? This can&rsquo;t be undone, and
            may be blocked if bookings reference it.
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
