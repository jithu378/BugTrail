# BugTrail

**Developer Bug Tracking & Debugging Journal** — a full-stack MERN application for capturing bug reports and the debugging trail behind each fix.

![Stack](https://img.shields.io/badge/stack-MERN-0d9488) ![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-149eca) ![Backend](https://img.shields.io/badge/backend-Express%205-0d9488)

## Features

- **Authentication** — register, login, logout. Passwords hashed with bcrypt; sessions via JWT stored in an httpOnly cookie.
- **Dashboard** — total, open, in-progress and resolved counts, status donut, severity breakdown, top projects, and the five most recent reports.
- **Bug management** — create, view, edit and delete bug reports. Everything is scoped to the signed-in user.
- **Rich reports** — title, description, project, severity, status, reproduction steps, expected/actual result, debugging notes, solution, and timestamps.
- **Search & filtering** — title search plus severity, status and project filters, all reflected in the URL.
- **UI/UX** — custom design system with light/dark themes, responsive sidebar navigation, skeleton loaders, empty/error states, toasts, and accessible dialogs. Teal/slate palette with no purple or violet.
- **Validation & errors** — mirrored client/server validation, structured API errors, rate-limited auth endpoints, Helmet security headers.

## Tech stack

| Layer     | Tech                                                        |
| --------- | ----------------------------------------------------------- |
| Frontend  | React 19, Vite 7, React Router 7, custom CSS                 |
| Backend   | Node.js, Express 5, Mongoose 8                               |
| Database  | MongoDB                                                      |
| Auth      | JSON Web Tokens (`jsonwebtoken`), bcrypt, httpOnly cookie    |
| Tooling   | npm, Node's built-in test runner (`node:test`), Vite build   |

## Project structure

```
bugtrail/
├── backend/
│   ├── src/
│   │   ├── config/        # env + MongoDB connection
│   │   ├── controllers/   # authController, bugController
│   │   ├── middleware/    # JWT auth guard, error handler
│   │   ├── models/        # User, Bug (Mongoose schemas)
│   │   ├── routes/        # /api/auth, /api/bugs
│   │   ├── utils/         # validation, token helpers
│   │   ├── app.js         # Express app
│   │   └── server.js      # DB connect + HTTP server
│   ├── tests/api.test.js  # integration tests
│   └── .env.example
├── frontend/
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── api/           # fetch wrapper + endpoint helpers
│   │   ├── components/    # reusable UI, layout, bug views
│   │   ├── context/       # Auth, Theme, Toast
│   │   ├── hooks/         # debounce, document title
│   │   ├── pages/         # auth, dashboard, bugs, 404
│   │   ├── utils/         # constants, formatters
│   │   ├── App.jsx, main.jsx
│   │   └── index.css      # design system
│   └── vite.config.js
├── scripts/               # setup + zero-dependency dev runner
├── PROJECT_CONTEXT.md
├── TASKS.md
└── package.json
```

## Quick start

### Prerequisites

- Node.js **20+** (developed on Node 24)
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Install

From the `bugtrail` folder:

```bash
npm run setup
```

This installs backend/frontend dependencies and creates `backend/.env` with a generated JWT secret.

> Prefer manual setup? `npm install --prefix backend && npm install --prefix frontend`, then copy `backend/.env.example` to `backend/.env` and set `JWT_SECRET`.

### 2. Run

```bash
npm run dev
```

- App: <http://localhost:5173>
- API: <http://localhost:5000>

The Vite dev server proxies `/api` to the backend, so cookies stay first-party.

### 3. Tests

```bash
npm test
```

Runs the backend integration suite against the local `bugtrail_test` database (dropped before and after).

## Environment variables

### Backend (`backend/.env`)

| Variable         | Default                                  | Purpose                                      |
| ---------------- | ---------------------------------------- | -------------------------------------------- |
| `PORT`           | `5000`                                   | API port                                     |
| `NODE_ENV`       | `development`                            | `production` enables secure cookies/Helmet   |
| `MONGODB_URI`    | `mongodb://127.0.0.1:27017/bugtrail`     | MongoDB connection string                    |
| `JWT_SECRET`     | — (required)                             | Signing secret for JWTs                      |
| `JWT_EXPIRES_IN` | `7d`                                     | Token/cookie lifetime                        |
| `BCRYPT_ROUNDS`  | `12`                                     | Password hashing cost                        |
| `CLIENT_URL`     | `http://localhost:5173`                  | Allowed CORS origin                          |

### Frontend (`frontend/.env`)

| Variable            | Default | Purpose                                        |
| ------------------- | ------- | ---------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`  | API base; use a full URL if hosted separately |

Never put secrets in frontend env vars — Vite inlines `VITE_*` values into the client bundle.

## API reference

All bug endpoints require authentication. Auth uses an httpOnly cookie (`bugtrail_token`); an `Authorization: Bearer <token>` header is also accepted.

| Method | Endpoint              | Description                                     |
| ------ | --------------------- | ----------------------------------------------- |
| GET    | `/api/health`         | Service health                                  |
| POST   | `/api/auth/register`  | Create account + session                        |
| POST   | `/api/auth/login`     | Sign in                                         |
| POST   | `/api/auth/logout`    | Clear session cookie                            |
| GET    | `/api/auth/me`        | Current user                                    |
| GET    | `/api/bugs`           | List/search (`search`, `severity`, `status`, `project`, `sort`, `page`, `limit`) |
| POST   | `/api/bugs`           | Create bug report                               |
| GET    | `/api/bugs/stats`     | Dashboard counts, severity/project aggregates, recent |
| GET    | `/api/bugs/projects`  | Distinct project names                          |
| GET    | `/api/bugs/:id`       | Bug details                                     |
| PUT    | `/api/bugs/:id`       | Update bug report (full payload)                |
| DELETE | `/api/bugs/:id`       | Delete bug report                               |

Errors use `{ "message": string, "errors"?: { field: message } }`.

## Production build

```bash
npm run build   # builds frontend/dist
npm start       # Express serves the API and the built SPA on PORT
```

Set `NODE_ENV=production`, a strong `JWT_SECRET`, and your MongoDB URI on the server. With `NODE_ENV=production`, cookies are `Secure` — serve over HTTPS.

## Security notes

- Passwords are never returned by the API (`password` is `select: false`).
- JWT lives in an httpOnly, SameSite=Lax cookie to keep it out of JavaScript.
- All bug queries include `createdBy: req.user._id`; cross-user access returns 404.
- Auth routes are rate limited (30 attempts / 15 minutes).
- Request bodies are capped at 100 kB and validated server-side.
- Helmet sets security headers; CORS is restricted to `CLIENT_URL`.

## License

MIT — built as a learning/full-stack portfolio project.
