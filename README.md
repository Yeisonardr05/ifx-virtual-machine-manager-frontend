# VM Console — Virtual Machine Manager (Frontend)

A premium, production-grade **Angular 21** single-page application for managing virtual
machines. Built on **standalone components**, **Angular Signals**, **RxJS**, **native
WebSockets**, and **Angular Material 3**, it consumes a reactive **Spring**-style
backend that authenticates via **HttpOnly cookies**.

The UI was designed to feel like a real SaaS cloud console (Vercel / DigitalOcean / AWS
inspired), with native **dark + light mode**, **glassmorphism**, smooth animations,
**optimistic UI**, real-time updates, and a fully responsive layout.

---

## Table of Contents

1. [Quick start](#quick-start)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Architecture & technical decisions](#architecture--technical-decisions)
5. [State management with Signals](#state-management-with-signals)
6. [Optimistic UI](#optimistic-ui)
7. [HttpOnly cookie authentication](#httponly-cookie-authentication)
8. [WebSocket flow (native JSON)](#websocket-flow-native-json)
9. [Routing, guards & lazy loading](#routing-guards--lazy-loading)
10. [Theming, dark mode & UI system](#theming-dark-mode--ui-system)
11. [Validation & error handling](#validation--error-handling)
12. [Roles & permissions (ADMIN vs CLIENT)](#roles--permissions-admin-vs-client)
13. [Backend contract](#backend-contract)
14. [Available scripts](#available-scripts)

---

## Quick start

### Prerequisites
- Node.js **20+**
- npm **10+** (or pnpm)
- A running Spring Boot backend exposed at `http://localhost:8080`

### Install & run

```bash
npm install
npm start              # http://localhost:4200
```

### Build

```bash
npm run build                              # production build
npm run watch                              # incremental dev build
```

### Demo accounts

| Role   | Email             | Password   |
|--------|-------------------|------------|
| ADMIN  | admin@test.com    | 123456     |
| CLIENT | client@test.com   | client123  |

The login page exposes one-click chips that pre-fill these credentials.

---

## Tech stack

- **Angular 21** (Zone.js change detection for stable Router/Material; Signals remain the state layer) — standalone components, `inject()`, new
  control flow (`@if`, `@for`, `@switch`)
- **Angular Signals** — `signal`, `computed`, `effect`, `linkedSignal`-friendly stores
- **RxJS 7** — HTTP, WebSocket bridge, optimistic-UI rollback flows
- **Angular Material 3** + **Angular CDK** — accessible UI primitives, M3 theming
- **Chart.js + ng2-charts** — interactive dashboard charts
- **Native WebSocket** — JSON `VmEvent` stream from the API host (`resolveVmWebSocketUrl()`)
- **TypeScript (strict)** + **SCSS** with design tokens
- **Lazy-loaded** route bundles, **OnPush** components everywhere

---

## Project structure

```
src/
├── app/
│   ├── core/                          # Cross-cutting concerns
│   │   ├── config/                    # API base URL, WebSocket path helper, app constants
│   │   ├── constants/                 # OS list, VM status metadata
│   │   ├── guards/                    # auth.guard, role.guard (CanActivateFn)
│   │   ├── interceptors/              # credentials + global error handling
│   │   ├── models/                    # User, VM, WebSocket event TS contracts
│   │   └── services/                  # Auth, VM, Notification, WebSocket, Theme
│   │
│   ├── shared/                        # Reusable, presentational pieces
│   │   ├── components/                # toast, skeleton, empty-state, confirm-dialog,
│   │   │                              # loading-spinner, vm-card, stat-card,
│   │   │                              # vm-status-badge
│   │   ├── pipes/                     # relativeTime, storageSize
│   │   └── utils/                     # (reserved)
│   │
│   ├── features/                      # Feature modules (lazy)
│   │   ├── auth/                      # /login page, reactive forms
│   │   ├── dashboard/                 # KPIs + ng2-charts
│   │   └── vms/                       # list, filters, create, edit
│   │
│   ├── layout/                        # Authenticated app shell
│   │   ├── components/sidebar
│   │   ├── components/topbar
│   │   └── shell                      # Composes sidebar + topbar + <router-outlet>
│   │
│   ├── store/                         # Signal-based global state
│   │   ├── auth.store.ts
│   │   └── vm.store.ts
│   │
│   ├── app.config.ts                  # Providers (HttpClient, Router, Animations, Charts)
│   ├── app.routes.ts                  # Top-level routes & lazy loading
│   ├── app.ts                         # Root component
│   └── app.html / app.scss
│
├── styles/                            # Global SCSS
│   ├── theme.scss                     # Material 3 theme + tokens
│   ├── tokens.scss                    # Design tokens (dark / light)
│   └── global.scss                    # Resets + Material overrides
│
├── styles.scss                        # Stylesheet entry point
├── index.html                         # Fonts + Material icons
└── main.ts                            # bootstrapApplication(App, appConfig)
```

---

## Architecture & technical decisions

The app follows a layered **Clean Architecture** approach:

- **Core layer** owns infrastructure (HTTP, WS, models, interceptors, guards). It
  never depends on features.
- **Store layer** owns state and orchestrates writes. Stores expose **read-only
  signals** + thin command methods (`createVm`, `updateVm`, etc.) so components stay
  presentational.
- **Shared layer** holds dumb/presentational, reusable UI building blocks.
- **Layout layer** composes the authenticated shell.
- **Features layer** holds smart container pages that consume stores. Each feature has
  its own `*.routes.ts` and lazy-loaded standalone components.

Other key decisions:

- **Standalone everywhere** — zero NgModules. Each component imports exactly what it
  needs.
- **`inject()`** instead of constructor injection for ergonomics and tree-shaking.
- **`ChangeDetectionStrategy.OnPush`** is enabled on every component.
- **Zone.js change detection** (`provideZoneChangeDetection` + `import 'zone.js'` in `main.ts`)
  — ensures the router outlet and Material update reliably after navigation while Signals
  still drive application state.
- **Lazy loaded feature routes** (`loadChildren`) and **lazy components**
  (`loadComponent`) to keep the initial bundle small.
- **`withComponentInputBinding()`** is enabled so route params become typed inputs.

---

## State management with Signals

> **NgRx is intentionally not used.** Angular Signals plus a few `@Injectable({
> providedIn: 'root' })` stores give us a small, reactive, fully type-safe state model
> with zero boilerplate.

### `AuthStore` — `src/app/store/auth.store.ts`
- `user`, `loading`, `isAuthenticated`, `role`, `isAdmin`, `initials` — all `signal`
  / `computed`.
- `login(payload)`, `logout()`, `hydrateFromServer()`, `clearUser()`.
- Persists only **non-secret user metadata** (id, name, email, role) so the UI can
  hydrate instantly. The real session lives in the **HttpOnly cookie** managed by the
  backend (we never store a JWT).

### `VmStore` — `src/app/store/vm.store.ts`
- `vms`, `loading`, `error`, `highlightedId`, `filters` — primitive signals.
- Derived computed signals: `totalCount`, `runningCount`, `pausedCount`,
  `stoppedCount`, `totalCores`, `totalRam`, `totalDisk`, `statusBreakdown`,
  `osBreakdown`, `availableOs`, `filteredVms`. The dashboard charts and the VM list
  are pure projections of these.
- Commands: `loadVms()`, `createVm()`, `updateVm()`, `deleteVm()`, plus filter setters
  (`setSearch`, `setStatusFilter`, `setOsFilter`, `clearFilters`).
- `applyServerEvent(event)` — bridge for WebSocket JSON events.

---

## Optimistic UI

`VmStore.createVm`, `updateVm`, and `deleteVm` all apply changes **synchronously to
the signal** before the HTTP call returns:

1. Build an optimistic snapshot (temp negative id for creates, copy-and-merge for
   updates, filter-out for deletes).
2. Update `_vms` signal → templates re-render instantly thanks to OnPush + signal
   subscriptions.
3. Subscribe to the HTTP `Observable`:
   - on `next` → replace the optimistic record with the canonical server payload,
     flash a highlight via `highlightedId`, and show a success toast.
   - on `error` → **roll back** the signal to its previous value and surface a
     friendly toast: *"Failed to create VM. Changes were rolled back."*

Because rollback is data-driven (signals), the UI reverts atomically with no manual DOM
manipulation. Real-time WebSocket events are reconciled by id too, so optimistic creations
get reconciled cleanly when the server confirms them.

---

## HttpOnly cookie authentication

There is **no client-side JWT storage**.

- `credentialsInterceptor` (`src/app/core/interceptors/credentials.interceptor.ts`)
  adds `withCredentials: true` to **every** request hitting the API base URL. This
  causes the browser to attach the backend's `Set-Cookie` (HttpOnly, SameSite) to
  every call, including the WebSocket handshake.
- `POST /login` sets the cookie server-side; the response body returns the user
  profile, which we store **only for UI hydration** (no token).
- `POST /logout` clears the cookie server-side; the store wipes its local copy of the
  profile and routes the user back to `/login`.
- The `errorInterceptor` intercepts `401` responses and routes the user to `/login`
  with a `redirect` query param so they return to the page they came from.

> **CORS reminder for the backend**: it must respond with
> `Access-Control-Allow-Credentials: true` and an explicit
> `Access-Control-Allow-Origin: http://localhost:4200` (not `*`).

---

## WebSocket flow (native JSON)

`WebsocketService` (`src/app/core/services/websocket.service.ts`) opens a **standard
`WebSocket`** to `resolveVmWebSocketUrl()` (from `APP_CONFIG.apiBaseUrl`: `http` → `ws`,
`https` → `wss`, path **`/ws/vms`**). It exposes a `Subject<VmEvent>` and a `status`
signal for the topbar pill (`connecting`, `connected`, `disconnected`, `error`).

1. On shell mount, `ShellComponent` calls `ws.connect()` after the first render.
2. Each `message` is `JSON.parse(event.data)` and pushed to `vmEvents$` if it matches
   the `VmEvent` shape.
3. The shell forwards every event to `VmStore.applyServerEvent(event)`:
   - `VM_CREATED` → push (or upsert) into `_vms`, flash the new card.
   - `VM_UPDATED` / `VM_STATUS_CHANGED` → patch-merge the matching VM, flash the card.
   - `VM_DELETED` → remove by id.
4. On abnormal close, the client reconnects after **4 s** (manual `disconnect()` does
   not reconnect).

The browser sends the same **HttpOnly** session cookies on the WebSocket handshake as
for `fetch`/`XHR` when the connection is same-site / credentialed per your backend
configuration.

---

## Routing, guards & lazy loading

```ts
// src/app/app.routes.ts
'' → '/dashboard'

/login                            (guestGuard, lazy → LoginPage)

/                                 (authGuard, ShellComponent)
  ├── /dashboard                  (lazy → DASHBOARD_ROUTES)
  └── /vms                        (lazy → VMS_ROUTES)
      ├── /vms/create             (roleGuard(['ADMIN']))
      └── /vms/edit/:id           (roleGuard(['ADMIN']))

**                               → '/dashboard'
```

- `authGuard` — blocks unauthenticated traffic from the shell, preserving the
  attempted URL via `?redirect=`.
- `guestGuard` — bounces authenticated users away from `/login`.
- `roleGuard(['ADMIN'])` — protects mutation routes. CLIENT users can still read.
- Every feature is registered with `loadChildren` / `loadComponent` for **route-level
  code splitting**.

---

## Theming, dark mode & UI system

- **Material 3 theme** via the new `mat.theme()` API, palette: `mat.$violet-palette`
  (primary) + `mat.$blue-palette` (tertiary), density `-1`.
- **Native dark mode**: the `ThemeService` initializes from `localStorage`, falls
  back to `prefers-color-scheme`, and applies `theme-dark` / `theme-light` classes on
  `<html>`. Toggling the moon icon in the topbar instantly re-themes the entire app.
- **Design tokens** live in `src/styles/tokens.scss` (surfaces, borders, brand colors,
  shadows, radii, fonts) and are scoped per theme via the `html.theme-*` selectors.
- **Glassmorphism** is applied to cards/panels via `backdrop-filter: blur(...)` over
  semi-transparent surfaces.
- **Typography**: Inter (UI) + JetBrains Mono (ids / counters), loaded from
  Google Fonts.
- **Animations** are kept short (180–220 ms) using `cubic-bezier(.4, 0, .2, 1)` for a
  premium feel. The VM card has a `vm-flash` keyframe used by the optimistic /
  WebSocket highlight animation.

---

## Validation & error handling

### Reactive forms with real-time validation

- `LoginPage` — typed form with `email`, `password`. Validators: `required`, `email`,
  `minLength(6)`. Field-level errors update on touch.
- `VmFormPage` — typed form with all VM fields and constraints aligned with the backend:
  - `name`: required, min **2**, max **100** characters
  - `os`: required (curated list), max **100** characters
  - `status`: edit only — required, pattern **RUNNING \| STOPPED \| PAUSED** (create omits `status`; API defaults to STOPPED)
  - `cores`: required, min **1** (no upper bound in API contract)
  - `ram`: required, min **1**, max **64** (GB)
  - `disk`: required, min **1** GB (no upper bound in API contract)

Helper methods (`errorOf(...)`, `emailError()`, `passwordError()`) translate validator
errors into user-friendly copy that renders inside the Material `<mat-error>` slots.

### Global error visualization (`errorInterceptor`)

| Status | Behavior |
|--------|----------|
| 0      | "Network error. Unable to reach the server." toast |
| 400    | Generic / backend message toast |
| 401    | Warn toast + auto-redirect to `/login` |
| 403    | Error toast (kept in current page) |
| 404    | Friendly "Not found" toast |
| 422    | "The submitted data is invalid." (with backend message if present) |
| 5xx    | "Internal server error / service unavailable" toast |

All toasts are emitted via the `NotificationService` (Angular Material `MatSnackBar`
with custom panel classes for `success`, `error`, `info`, `warn`).

The store-level rollback messages take priority over generic interceptor messages
when an optimistic operation fails.

---

## Roles & permissions (ADMIN vs CLIENT)

- The `AuthStore` exposes `isAdmin = computed(() => role() === 'ADMIN')`.
- **Buttons are not just disabled — they are removed from the DOM.** Every "create",
  "edit", and "delete" affordance lives under `@if (auth.isAdmin()) { ... }`.
- The `vm-card` only renders its "more actions" menu when `[canManage]="auth.isAdmin()"`.
- Route-level enforcement happens in `roleGuard(['ADMIN'])` so even direct URL access
  to `/vms/create` and `/vms/edit/:id` is rejected for CLIENT users.

---

## Backend contract

Base URL — `http://localhost:8080` (configurable in
`src/app/core/config/app.config.ts`).

| Method | Path           | Body                                 | Notes                                          |
|--------|----------------|--------------------------------------|------------------------------------------------|
| POST   | `/login`       | `{ email, password }`                | Sets HttpOnly cookie, returns `User`            |
| POST   | `/logout`      | —                                    | Clears HttpOnly cookie                          |
| GET    | `/vms`         | —                                    | Returns `VirtualMachine[]`                      |
| GET    | `/vms/{id}`    | —                                    | Returns one `VirtualMachine`                    |
| POST   | `/vms`         | `CreateVmPayload` (no `status`; server defaults to STOPPED) | Returns the created `VirtualMachine`            |
| PUT    | `/vms/{id}`    | Full update body (`name`, `os`, `status`, `cores`, `ram`, `disk`); UI may send partial `UpdateVmPayload` — the store merges with the current VM before PUT | Returns the updated `VirtualMachine`            |
| DELETE | `/vms/{id}`    | —                                    | 204 / void                                      |
| WS     | `ws(s)://<host>/ws/vms` (native JSON) | —                          | Pushes `{ event, data }` (`VmEvent`) in real time |

### TypeScript contracts

```ts
type UserRole = 'ADMIN' | 'CLIENT';

interface User {
  id: number; name: string; email: string; role: UserRole;
}

type VmStatus = 'RUNNING' | 'STOPPED' | 'PAUSED';

interface VirtualMachine {
  id: number;
  name: string;
  cores: number; ram: number; disk: number;
  os: string;
  status: VmStatus;
  createdAt: string; updatedAt: string;
}

interface VmEvent {
  event: 'VM_CREATED' | 'VM_UPDATED' | 'VM_DELETED';
  data: VirtualMachine | { id: number };
}
```

---

## Available scripts

| Command           | What it does                                    |
|-------------------|-------------------------------------------------|
| `npm start`       | Serves the app on http://localhost:4200          |
| `npm run build`   | Production build (`dist/vm-manager`)             |
| `npm run watch`   | Incremental development build                    |

---

Crafted to feel like a real production cloud console — Angular Signals · WebSockets ·
Material 3 · Glassmorphism · Dark Mode.
