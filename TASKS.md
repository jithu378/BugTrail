# BugTrail — Development Tasks

> Status tracker. `[x]` done · `[~]` in progress · `[ ]` pending.
> Last updated: 2026-11-10

## Phase 0 — Discovery & scaffold

- [x] Inspect workspace and confirm Node/MongoDB availability
- [x] Create `bugtrail/` without touching existing workspace files
- [x] Frontend/backend folder structure
- [x] `.gitignore`, `backend/.env.example`, `frontend/.env.example`
- [x] Root `package.json`, `scripts/setup.js`, `scripts/dev.js`
- [x] Install dependencies (0 vulnerabilities)

## Phase 1 — Backend foundation

- [x] Environment config with required-secret checks
- [x] MongoDB connection module
- [x] `User` model (bcrypt pre-save hook, `select:false` password, public serializer)
- [x] `Bug` model (enums, limits, ownership, compound indexes)
- [x] Shared validation utilities
- [x] JWT sign/verify + cookie options
- [x] Auth middleware (cookie or Bearer)
- [x] Central error handler + 404 handler

## Phase 2 — Backend API

- [x] Register / login / logout / me
- [x] Auth rate limiting
- [x] Bug create / list / get / update / delete
- [x] Title search, severity/status/project filters, sort, pagination
- [x] Dashboard stats endpoint (counts, severity, projects, recent)
- [x] Distinct projects endpoint
- [x] Ownership enforcement on every query
- [x] Auto `resolvedAt` stamping
- [x] Helmet, CORS, JSON body limit, production SPA serving

## Phase 3 — Backend tests

- [x] Health, validation, register/login/logout, duplicate email, wrong password
- [x] Auth guard and httpOnly cookie assertions
- [x] Bug create/read/update/delete
- [x] Search + all filters
- [x] Stats/projects shape
- [x] Cross-user isolation
- [x] `17/17` tests passing

## Phase 4 — Frontend foundation

- [x] Vite config with `/api` proxy
- [x] Fetch API client with `ApiError`, credentials, 401 event
- [x] `AuthContext`, `ThemeContext`, `ToastContext`
- [x] Route guards and redirect-back behaviour
- [x] Reusable SVG icon set (no icon dependency)
- [x] Formatters (relative time, dates, initials)
- [x] Design tokens: dark/light, teal/slate palette (no purple/violet)

## Phase 5 — Frontend features

- [x] Login and registration screens (show/hide password, live password hints)
- [x] App layout: sidebar, mobile drawer, topbar, theme toggle, logout
- [x] Dashboard: total/open/in-progress/resolved stat cards
- [x] Dashboard: status donut, severity bars, recent reports, top projects
- [x] Bug list: desktop table + mobile cards
- [x] Search with 350 ms debounce, URL-synced filters, clear filters
- [x] Pagination
- [x] Delete confirmation dialog + toast
- [x] Bug form: all fields, three sections, mirrored validation, error focus
- [x] Bug detail: badges, metadata, all journal sections, empty placeholders
- [x] Edit flow with prefilled values
- [x] 404 page
- [x] Loading skeletons, empty states, retryable error states
- [x] Same-tick filter updates merge safely (params ref instead of stale router closure)
- [x] Scroll to top when the route changes

## Phase 6 — Responsive & polish

- [x] Mobile-first breakpoints for all layouts
- [x] Sidebar scrim + Escape handling + body scroll lock
- [x] Accessible labels, focus styles, aria attributes, skip link
- [x] Reduced-motion support
- [x] Light/dark persistence + system preference
- [x] Production build (`vite build`) passes
- [x] Mobile 390×844 verified (stacked stats, card list, drawer, compact filter panel)
- [x] Desktop 1440×900 verified (fixed sidebar, task table, two-column detail)

## Phase 7 — End-to-end verification

- [x] Backend + Vite dev servers start cleanly
- [x] Register a new account in the browser
- [x] Dashboard empty state renders correctly
- [x] Create bug with full journal details
- [x] Detail view shows all fields
- [x] Search/filter by severity, status, project
- [x] Combined filters fired in a single tick persist all params
- [x] Empty filter state + Clear filters restores every report
- [x] Deep-linked filter URL restores search and all select values
- [x] Client-side validation blocks empty submissions and focuses first error
- [x] 404 route renders with recovery links
- [x] Edit and resolve a bug (resolvedAt stamped)
- [x] Delete from list and from detail, with confirmation + toast
- [x] Theme toggle (dark → light → persisted) and mobile viewport check
- [x] Logout and protected-route redirect, then login redirect-back to the requested page
- [x] Desktop 1440×900 and mobile 390×844 captures
- [x] Console clean while signed in

## Phase 8 — Documentation

- [x] `README.md` (setup, structure, API, security, production)
- [x] `PROJECT_CONTEXT.md` (architecture, decisions, status, constraints)
- [x] `TASKS.md` (this file)
- [x] Final review pass for consistency and dead code

## Future / backlog

- [ ] Deployment guide + live demo
- [ ] Refresh-token rotation / logout invalidation
- [ ] Password reset + email verification
- [ ] Attachments on bug reports
- [ ] Team/workspace sharing
- [ ] Export journal (Markdown/JSON)
