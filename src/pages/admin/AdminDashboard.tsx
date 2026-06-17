/**
 * AdminDashboard.tsx
 * -----------------------------------------------------------------------------
 * The admin dashboard shell: a tabbed surface for managing the three catalogs
 * (Treks, Gear, Services). Reuses the app's DashboardLayout so the nav,
 * logout and branding stay consistent. Access is gated by `AdminRoute`.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mountain, ShoppingBag, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components';
import { DestinationsPanel } from './DestinationsPanel';
import { GearPanel } from './GearPanel';
import { ServicesPanel } from './ServicesPanel';

type TabKey = 'destinations' | 'gear' | 'services';

const TABS: { key: TabKey; label: string; icon: JSX.Element }[] = [
  { key: 'destinations', label: 'Treks', icon: <Mountain className="h-4 w-4" /> },
  { key: 'gear', label: 'Gear', icon: <ShoppingBag className="h-4 w-4" /> },
  { key: 'services', label: 'Services', icon: <Sparkles className="h-4 w-4" /> },
];

export default function AdminDashboard(): JSX.Element {
  const [tab, setTab] = useState<TabKey>('destinations');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to booking
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-900">
          Admin dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Create, edit and remove the catalogs guests build their trips from.
        </p>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Catalog sections"
        className="mb-6 inline-flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1"
      >
        {TABS.map(({ key, label, icon }) => {
          const isActive = key === tab;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setTab(key)}
              className={[
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
                isActive
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>

      {tab === 'destinations' && <DestinationsPanel />}
      {tab === 'gear' && <GearPanel />}
      {tab === 'services' && <ServicesPanel />}
    </DashboardLayout>
  );
}
