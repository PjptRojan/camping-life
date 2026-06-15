# CampingLife — Premium Camping-as-a-Service

A premium "Camping-as-a-Service" web app where guests choose a destination, rent
or buy gear, and add luxury on-site services — all with a live, itemized receipt.

Built with **React + TypeScript (strict)**, **Redux Toolkit**, **Tailwind CSS**,
and **Lucide React** icons.

## Getting started

```bash
npm install
npm run dev      # start the Vite dev server (http://localhost:5173)
npm run build    # type-check + production build
npm run lint     # type-check only (tsc --noEmit)
```

## Architecture

Strict separation of concerns — state logic, types, data, and presentation each
live in their own module:

```
src/
├── types/
│   └── booking.ts            # All domain interfaces & unions (strict types)
├── data/
│   └── catalog.ts            # Immutable reference data + O(1) id lookup maps
├── store/
│   ├── bookingSlice.ts       # Redux Toolkit slice — all mutation logic
│   ├── selectors.ts          # Derived state: itemized receipt + cost math
│   └── index.ts              # Store config + typed useAppDispatch/useAppSelector
├── components/
│   ├── DashboardLayout.tsx   # Nav shell: brand, live cart badge, profile
│   ├── DestinationSelector.tsx # Filterable campsite catalog (Mountain/Lake/Forest)
│   ├── GearMarketplace.tsx   # Tabbed rent/buy catalog with quantity steppers
│   ├── PremiumServices.tsx   # Grouped add-on checklist (Staff / Experiences)
│   ├── BookingSummarySidebar.tsx # Sticky real-time receipt + insurance + checkout
│   └── SuccessModal.tsx      # Post-checkout confirmation dialog
├── App.tsx                   # Page composition
└── main.tsx                  # Entry point + Redux <Provider>
```

### State model

The store tracks only the user's **selections** (ids, quantities, toggles).
Names, copy and pricing live in `data/catalog.ts` and are joined in by id at
calculation time in `store/selectors.ts`. This keeps the store lean and the
receipt math testable in isolation.

### Pricing rules

| Item        | Formula                                    |
| ----------- | ------------------------------------------ |
| Destination | `pricePerNight × nights`                   |
| Gear (rent) | `rentPricePerNight × quantity × nights`    |
| Gear (buy)  | `buyPrice × quantity` (one-off)            |
| Service     | flat `price` each                          |
| Insurance   | flat `$15` when enabled                    |
