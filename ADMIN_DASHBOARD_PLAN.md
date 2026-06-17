# Admin Dashboard — Implementation Plan

**Goal:** Add an admin dashboard where an admin can **create, update, and delete**
Destinations, Gear, and On-Site Services. Regular users keep their existing
read-only booking experience.

**Two repos involved (separate Git repos, same machine):**
- Frontend — `C:\Users\User\Desktop\Personal\CampingLife` (React + Vite + TS, Redux, axios)
- Backend  — `C:\Users\User\Desktop\Personal\camping-backend` (Express 5 + Prisma + Postgres, JWT)

**Build order:** Backend first (auth boundary + endpoints), then Frontend.
Reason: an admin dashboard persists data, so the store + secured endpoints must
exist before the UI has anything real (and safe) to talk to.

---

## Phase 0 — Settle the API contract (DO THIS FIRST)

The FE types and BE Prisma models currently disagree. Pick the source of truth
for each entity, then make both sides match. Until this is fixed, admin forms
can't be built because the field list is undefined.

### Destination mismatch
- FE `Destination`: `type: 'Mountain' | 'Lakeside' | 'Forest'`, + `description, location, pricePerNight, emoji`.
- BE `Destination`: `region: TrekRegion (Everest/Annapurna/...)`, + `maxAltitudeMeters, difficulty, durationDaysMin/Max, bestSeasons[], startPoint, permitsRequired[]`.
- **Decision needed:** Is the product generic campsites (FE) or Nepal treks (BE)?
  - Recommendation: pick the BE (trek) model as truth — it's richer and already
    seeded — and update the FE `Destination` type + UI to match. OR simplify the
    BE model down to the FE shape if treks were a leftover experiment.

### GearItem mismatch
- FE: `description, emoji, rentPricePerNight, buyPrice, category union`.
- BE: `rentPrice, buyPrice, category: string` — no `description`, no `emoji`.
- **Decision:** add `description` + `emoji` columns to BE `GearItem` and rename
  `rentPrice` → `rentPricePerNight` (or map it in the API layer).

### OnSiteService mismatch
- FE: `description, emoji, category: 'On-Site Staff' | 'Experiences'`.
- BE: `name, category: string, price` — no `description`, no `emoji`.
- **Decision:** add `description` + `emoji` columns to BE `OnSiteService`.

**Deliverable:** one agreed JSON shape per entity, reflected in both the Prisma
schema and the FE `src/types/booking.ts`.

---

## Phase 1 — Backend: auth boundary (security first)

Currently `auth.ts` ISSUES JWTs but nothing VERIFIES them, and `User` has no role.
Without this, any CRUD endpoint would be world-writable.

1. **Add role to the data model** — `prisma/schema.prisma`:
   ```prisma
   enum Role { USER ADMIN }
   model User { ... role Role @default(USER) }
   ```
   Run `prisma migrate dev`.
2. **Auth middleware** — new `src/middleware/auth.ts`:
   - `authenticate`: read `Authorization: Bearer <token>`, `jwt.verify`, attach
     `req.user = { id, role }`. Reject with 401 if missing/invalid.
   - `requireAdmin`: 403 unless `req.user.role === 'ADMIN'`.
3. **Include role in the JWT + auth responses** — update `auth.ts` so the token
   payload and the returned `user` object carry `role`.
4. **Promote an admin** — add a one-off seed/script (or documented SQL) to set
   your own user's `role = 'ADMIN'`.

---

## Phase 2 — Backend: CRUD endpoints

Refactor routes out of `server.ts` into routers (`src/routes/destinations.ts`,
`gear.ts`, `services.ts`). For each entity add, all admin routes behind
`authenticate, requireAdmin`:

| Method | Route | Access |
|---|---|---|
| GET | `/api/destinations` (+ `/gear`, `/services`) | public (exists for destinations/gear) |
| POST | `/api/destinations` | admin |
| PUT | `/api/destinations/:id` | admin |
| DELETE | `/api/destinations/:id` | admin |

- Add the missing `GET /api/services` (OnSiteService has no endpoint yet).
- **Validation:** validate request bodies (required fields, types, enum values)
  and return 400 with a clear `message` on bad input.
- Consider FK safety: deleting a Destination referenced by a Booking should be
  blocked or soft-handled.

---

## Phase 3 — Frontend: types, API client, state

1. **Types** — update `src/types/booking.ts` to the Phase 0 contract. Add `role`
   to `AuthUser` (in `src/services/api.ts`).
2. **API functions** — extend `src/services/api.ts` with create/update/delete for
   each entity (the axios `httpClient` already attaches the bearer token).
3. **Gear from API** — switch `GearMarketplace` to read gear from `/api/gear`
   (new `gearSlice`) instead of the static `src/data/catalog.ts`. Same for
   services if they're static today.
4. **Admin slices** — either reuse the entity slices with admin thunks, or a
   dedicated `adminSlice` for the dashboard's create/update/delete lifecycles.

---

## Phase 4 — Frontend: admin UI

1. **Role-gated route** — extend `ProtectedRoute` (or add `AdminRoute`) to require
   `user.role === 'ADMIN'`; redirect others.
2. **Dashboard shell** — `src/pages/admin/` with tabs/sections: Destinations,
   Gear, Services.
3. **Per entity:** a table/list (with edit + delete actions) and a create/edit
   form (Formik + Yup are already dependencies). Confirm-on-delete.
4. **UX:** optimistic or refetch-on-success, toasts (react-toastify is wired),
   loading/empty/error states (mirror the existing destinations slice pattern).

---

## Phase 5 — Verify & ship

1. Run BE (`yarn dev` in camping-backend) + FE (`yarn dev` in CampingLife).
2. Manually verify: non-admin is blocked (UI + direct API call → 403); admin can
   CRUD all three entities and changes persist + show on the public pages.
3. Commit each repo separately to its own GitHub remote (FE → `PjptRojan`,
   BE → wherever its remote points).

---

## Locked decisions (2026-06-15)
1. **Destination model: keep the richer BE Nepal-trek model** as the source of
   truth. Phase 0 = update the FE `Destination` type + UI to match the trek
   fields (region, difficulty, altitude, durations, seasons, startPoint,
   permits), NOT the other way around.
2. **Admin scope: one hardcoded admin is enough.** No user-management UI for now
   — promote a single user to `ADMIN` via seed/SQL.
3. **Session persistence: leave as-is** (in-memory). Refresh logs out; do NOT add
   localStorage/redux-persist in this work.
