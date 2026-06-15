/**
 * Dashboard.tsx
 * -----------------------------------------------------------------------------
 * The main booking screen: the dashboard shell wraps a two-column layout — the
 * build flow (destinations → gear → services) on the left, and the sticky
 * booking summary sidebar on the right.
 */

import {
  BookingSummarySidebar,
  DashboardLayout,
  DestinationSelector,
  GearMarketplace,
  PremiumServices,
} from '@/components';

export default function Dashboard(): JSX.Element {
  return (
    <DashboardLayout>
      {/* Hero strip */}
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-700 p-8 text-white shadow-card sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
          Camping, curated
        </p>
        <h1 className="mt-1 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
          Design your perfect escape — destination, gear and luxury service in
          one place.
        </h1>
        <p className="mt-2 max-w-xl text-emerald-100">
          Build your trip below and watch your live receipt update in real time.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Build flow */}
        <div>
          <DestinationSelector />
          <GearMarketplace />
          <PremiumServices />
        </div>

        {/* Live receipt */}
        <BookingSummarySidebar />
      </div>
    </DashboardLayout>
  );
}
