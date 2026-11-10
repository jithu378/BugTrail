# BugTrail — Project Context

> Living document. Update after each development phase.
> Last updated: 2026-11-10

## 1. Purpose

BugTrail is a full-stack MERN application for developers to log bugs and preserve the debugging trail: reproduction steps, expected vs actual behaviour, investigation notes and the final fix. Reports are private to the signed-in user.

## 2. Architecture

```
React 19 + Vite (SPA)
  │  fetch, credentials: include
  ▼
Express 5 API (/api)
  │  JWT httpOnly cookie → protect middleware → controllers
  ▼
MongoDB via Mongoose 8
   ├── users  (name, email, bcrypt hash)
   └── bugs   (report fields, createdBy → User, timestamps)
```

### Key decisions

| Decision | Rationale |
| --- | --- |
| JWT stored in an **httpOnly SameSite=Lax cookie** | Keeps the token out of JS/localStorage; Vite proxies `/api` so cookies remain first-party in dev. Bearer header accepted for tooling. |
| **User-scoped data** on every bug query | Multi-user isolation; cross-user IDs return 404 rather than leaking existence. |
| **Full-document PUT** updates | The form always submits all fields; simpler predictable semantics than partial patches. |
| **Custom validation** (`utils/validation.js`) | Mirrors client-side rules without adding a validator dependency. |
| **Custom CSS design system** | One tokenized stylesheet, no UI framework; teal/slate palette, no purple/violet. |
| **Dashboard aggregate endpoint** | Five counts/aggregations computed server-side in one request. |
| **Cookie auth + `credentials: 'include'`** | Frontend never reads or stores the JWT (secrets stay server-side). |
| **Zero-dependency dev runner** | `scripts/dev.js` starts both servers; no `concurrently` dependency. |

### API modules

- `POST /api/auth/register`, `login`, `logout`; `GET /me`
- `GET/POST /api/bugs`; `GET /stats`, `GET /projects`; `GET/PUT/DELETE /:id`
- Validation errors: `422` with `{ message, errors }`. Auth: `401`. Missing: `404`. Duplicate email: `409`.

### Data model

**User**: `name` (2–60), `email` (unique, lowercase), `password` (bcrypt, select:false), timestamps.
**Bug**: `title` (3–140), `description` (10–5000), `project` (2–80), `severity` (Low/Medium/High/Critical), `status` (Open/In Progress/Resolved), `reproductionSteps`, `expectedResult`, `actualResult`, `debuggingNotes`, `solution`, `resolvedAt`, `createdBy`, timestamps. Compound indexes on owner + createdAt/status/severity/project.

## 3. Frontend map

- **Contexts**: `AuthContext` (bootstrap via `/auth/me`, login/register/logout, 401 event), `ThemeContext` (localStorage + system preference, dark/light), `ToastContext` (auto-dismiss notifications).
- **Guards**: `ProtectedRoute`, `PublicOnlyRoute` with redirect-back (`state.from`).
- **Layout**: `AppLayout` (fixed sidebar, mobile drawer + scrim, sticky topbar), `Sidebar`, `Topbar`, `ThemeToggle`.
- **Pages**: `LoginPage`, `RegisterPage`, `DashboardPage`, `BugsPage`, `BugFormPage` (create/edit), `BugDetailPage`, `NotFoundPage`.
- **Reusable UI**: `BugForm` (3 sections + client validation), `BugList` (desktop table / mobile cards), `BugFilters`, `Pagination`, `ConfirmDialog`, `StatCard`, `Badges`, `States`, `Loading` skeletons, `PasswordInput`, `Icons` (inline SVG, no icon dependency).
- **Styling**: `src/index.css` — tokenized dark/light themes, responsive breakpoints (1180 / 1024 / 900 / 860 / 640 / 420), reduced-motion support.

## 4. Status

### Completed

- [x] Project scaffold, docs, `.env.example`, `.gitignore`, setup/dev scripts
- [x] MongoDB connection, User/Bug models, indexes
- [x] Auth API with bcrypt hashing, JWT cookie, rate limiting, validation
- [x] Bug CRUD, search/filter/sort/pagination, stats + projects endpoints
- [x] Error handling, 404s, ownership checks
- [x] Backend integration suite — **17/17 passing**
- [x] React foundation: API client, auth/theme/toast contexts, guards, routing
- [x] Layout, sidebar/topbar, dark/light theme toggle
- [x] Auth screens with inline validation
- [x] Dashboard with stat cards, donut, severity bars, recent reports, projects
- [x] Bug list with URL-synced search/filters, pagination, delete confirmation
- [x] Bug create/edit form with all requested fields
- [x] Bug detail view with all journal sections
- [x] Responsive mobile-first CSS, loading/empty/error states
- [x] Production build verified (`vite build`)
- [x] End-to-end browser verification (register → create → filter → edit → resolve → delete → theme → logout → deep links → 404)
- [x] Desktop (1440×900) and mobile (390×844) visual verification via headless Chromium
- [x] Fixed same-tick filter race (React Router `setSearchParams` stale closure) with a synchronously merged params ref
- [x] Scroll to top on route change
- [x] Fixed mobile filter column height blowout (`flex-basis` acting as height)

### Pending / optional next steps

- [ ] Deploy (e.g. Render/Railway + MongoDB Atlas) and document live URL
- [ ] Refresh-token rotation / server-side token revocation (current logout clears the cookie only)
- [ ] Account profile editing and password change
- [ ] Attachments/screenshots on reports
- [ ] Team workspaces / shared projects (current design is single-user journal)
- [ ] Toast/notification preferences

## 5. Environment & operations

- `backend/.env` is generated by `npm run setup` with a random 96-hex-char JWT secret; never commit it.
- `npm run dev` (root) runs API on `:5000` and Vite on `:5173`; Vite proxies `/api`.
- `npm test` uses `bugtrail_test` DB, `NODE_ENV=test`, bcrypt rounds 4, rate limiter disabled.
- `npm run build` outputs `frontend/dist`; `npm start` serves API + SPA from Express when `dist` exists.
- Local MongoDB service: `MongoDB` (localhost:27017). Native Windows rollup binary required a reinstall once due to an Application Control policy; build works now.

## 6. Known constraints

- Logout is client/cookie-side; an already-issued JWT remains valid until expiry (stateless JWT).
- Forgot-password/email verification are out of scope.
- No file uploads.
- Search is a case-insensitive title regex (fine at journal scale); switch to Atlas Search if it grows.
- Single-user ownership model; no team sharing yet.

## 7. Verification log

| Check | Result |
| --- | --- |
| `node --test` backend suite | 17 passed, 0 failed |
| `vite build` | success (75 modules, ~98.6 kB gzip JS) |
| E2E: auth | register, logout, protected redirect, login redirect-back — pass |
| E2E: bug CRUD | create (full journal), edit → resolve (resolvedAt), list delete, detail delete — pass |
| E2E: search/filters | title search, severity/status/project, combined same-tick updates, empty state, clear filters, deep-linked URL — pass |
| E2E: validation & errors | empty form shows field errors, focuses first error; 404 route — pass |
| E2E: states | throttled API shows list skeleton; blocked API shows retryable error; Try again recovers — pass |
| E2E: theme | dark ↔ light toggles, computed tokens and `localStorage` persist — pass |
| Responsive | 390×844 (stacked cards, drawer, compact filters) and 1440×900 (sidebar, table layout) — pass |
| Console | clean while signed in (only expected 401 from `/auth/me` when signed out) |
