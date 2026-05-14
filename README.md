# VM Console — Gestor de máquinas virtuales (Frontend)

SPA en **Angular 21** para administrar VMs frente a un backend reactivo (p. ej. Spring WebFlux). Incluye **autenticación con cookies HttpOnly**, **estado con Signals**, **UI optimista**, **WebSocket en tiempo real**, **Material 3** y **pruebas unitarias con Vitest**.

---

## Estructura de carpetas

La organización sigue **Clean Architecture / feature-based**: lo que es transversal al producto vive en **`core/`** y **`shared/`**; lo que es pantalla de negocio en **`features/`**; el marco autenticado en **`layout/`**; el estado global en **`store/`**. Así se puede explicar el repo en una sola diapositiva y ubicar cualquier cambio en segundos.

### Árbol principal (`src/`)

```
src/
├── app/
│   ├── core/                          # Infraestructura: sin dependencias de features
│   │   ├── config/                    # APP_CONFIG, resolveVmWebSocketUrl, etc.
│   │   ├── constants/                 # OS permitidos, metadatos de estado VM
│   │   ├── guards/                    # auth.guard, role.guard (CanActivateFn)
│   │   ├── interceptors/              # credentials, error (global)
│   │   ├── models/                    # User, VM, VmEvent (contratos TS)
│   │   ├── services/                  # Auth, Vm, WebSocket, Theme, Notification
│   │   ├── utils/                     # p. ej. unwrap de respuestas API (vm-api-response)
│   │   └── http-context.ts            # tokens de contexto HTTP (p. ej. probe de sesión)
│   │
│   ├── shared/                        # UI y utilidades reutilizables (dumb components)
│   │   ├── components/                # stat-card, vm-card, skeleton, empty-state, …
│   │   ├── directives/              # (reservado / extensiones futuras)
│   │   ├── pipes/                     # storage-size, relative-time
│   │   └── utils/                     # (reservado)
│   │
│   ├── features/                      # Dominio por vertical + lazy loading
│   │   ├── auth/
│   │   │   └── pages/login/           # Login, formulario reactivo
│   │   ├── dashboard/
│   │   │   ├── dashboard.routes.ts
│   │   │   └── pages/dashboard/       # KPIs, gráficos
│   │   └── vms/
│   │       ├── vms.routes.ts
│   │       ├── components/vm-filters/ # Filtros del listado
│   │       └── pages/
│   │           ├── vm-list/           # Listado, acciones ADMIN
│   │           └── vm-form/           # Alta / edición
│   │
│   ├── layout/                        # Shell de la zona autenticada
│   │   ├── shell/                     # Sidebar + topbar + router-outlet hijo
│   │   └── components/
│   │       ├── sidebar/
│   │       └── topbar/
│   │
│   ├── store/                         # Estado global (Angular Signals)
│   │   ├── auth.store.ts
│   │   └── vm.store.ts
│   │
│   ├── app.config.ts                  # Providers: Zone, Router, Http, Charts, app initializer
│   ├── app.routes.ts                  # Rutas raíz, guards, lazy
│   ├── app.ts / app.html / app.scss   # Raíz de la aplicación
│   └── *.spec.ts                      # Tests junto al código que prueban
│
├── styles/                            # SCSS global: Material theme, tokens, global
├── styles.scss                        # Punto de entrada de estilos
├── testing/                           # Utilidades compartidas de tests (p. ej. fixtures)
├── index.html
└── main.ts                            # bootstrap + zone.js
```

### Raíz del repositorio (referencia)

```
vitest.config.ts          # Umbrales y reporters de cobertura Vitest
angular.json              # build, serve, unit-test → vitest.config.ts
package.json
```

### Qué va en cada capa

| Carpeta | Responsabilidad | No debe |
|---------|-------------------|---------|
| **`core/`** | HTTP, seguridad, modelos, reglas de transporte | Importar desde `features/*` |
| **`store/`** | Estado y comandos que orquestan servicios | Contener plantillas HTML de página |
| **`features/`** | Páginas y rutas de un flujo de usuario | Duplicar lógica que ya está en `core` |
| **`shared/`** | Componentes/pipes presentacionales | Conocer rutas o stores salvo inputs |
| **`layout/`** | Composición del shell (navegación global) | Sustituir a `features` en lógica de negocio |

### Convenciones rápidas

- **Un componente por carpeta**: `*.ts`, `*.html`, `*.scss`, opcionalmente `*.spec.ts`.
- **Rutas lazy**: `loadComponent` / `loadChildren` desde `app.routes.ts` y `*.routes.ts` en features.
- **Tests**: mismo árbol que el código (`*.spec.ts` al lado del fichero o en la misma feature).

---

## Tabla de contenidos

1. [Estructura de carpetas](#estructura-de-carpetas) — mapa del repo (arriba)
2. [Requisitos y arranque](#requisitos-y-arranque)
3. [Scripts útiles](#scripts-útiles)
4. [Pruebas unitarias](#pruebas-unitarias)
5. [Cómo presentar el proyecto (guía)](#cómo-presentar-el-proyecto-guía)
6. [Stack técnico](#stack-técnico)
7. [Arquitectura y decisiones](#arquitectura-y-decisiones)
8. [Estado (Signals)](#estado-signals)
9. [UI optimista](#ui-optimista)
10. [Autenticación HttpOnly](#autenticación-httponly)
11. [WebSocket](#websocket)
12. [Rutas, guards y lazy loading](#rutas-guards-y-lazy-loading)
13. [UI, temas y validación](#ui-temas-y-validación)
14. [Roles ADMIN / CLIENT](#roles-admin--client)
15. [Contrato API (resumen)](#contrato-api-resumen)

---

## Requisitos y arranque

| Requisito | Versión / nota |
|-----------|------------------|
| Node.js | 20+ |
| npm | 10+ |
| Backend | `http://localhost:8080` (CORS con credenciales hacia `http://localhost:4200`) |

```bash
npm install
npm start          # http://localhost:4200
```

**Cuentas de demo** (también en chips en la pantalla de login):

| Rol    | Email              | Contraseña |
|--------|--------------------|------------|
| ADMIN  | admin@test.com     | 123456     |
| CLIENT | client@test.com   | client123  |

```bash
npm run build      # producción → dist/vm-manager
npm run watch      # build dev incremental
```

---

## Scripts útiles

| Comando | Uso |
|---------|-----|
| `npm start` | Servidor de desarrollo en el puerto 4200. |
| `npm run build` | Artefacto de producción. |
| `npm run watch` | Build en modo watch. |
| `npm test` | Pruebas unitarias en **watch** (Vitest vía Angular CLI). |
| `npm run test:ci` | Una sola pasada + **cobertura** (`--watch=false --coverage`). |

---

## Pruebas unitarias

El proyecto usa el builder **`@angular/build:unit-test`** con **Vitest** y **`jsdom`**. La configuración de cobertura y umbrales está en **`vitest.config.ts`** (reporter `text`, `text-summary`, `html`; umbrales ~80% líneas/funciones y 75% ramas).

### Ejecutar

```bash
npm test              # desarrollo: re-ejecuta al cambiar archivos
npm run test:ci       # CI: una pasada + informe de cobertura
```

Tras `npm run test:ci`, Vitest genera cobertura bajo **`coverage/vm-manager/`** (entre otros, un **`index.html`** que puedes abrir en el navegador para una vista tabular). Los umbrales mínimos están en `vitest.config.ts`; en un estado reciente del repo la cobertura global ronda **~93% líneas** (varía al añadir código).

### Qué está cubierto (por capas)

Los ficheros `*.spec.ts` siguen al código bajo `src/app/`:

| Área | Ejemplos de `*.spec.ts` |
|------|-------------------------|
| **Bootstrap** | `app.spec.ts`, `app.config.spec.ts`, `app.routes.spec.ts` |
| **Core** | Guards (`auth`, `role`), interceptors (`credentials`, `error`), servicios (`auth`, `vm`, `websocket`, `theme`, `notification`), utilidades (`vm-api-response`, `http-context`, constantes, `app.config`) |
| **Store** | `auth.store.spec.ts`, `vm.store.spec.ts` |
| **Features** | Login, dashboard, listado/formulario de VMs, filtros, rutas de feature |
| **Layout** | `shell`, `sidebar`, `topbar` |
| **Shared** | `vm-card`, `stat-card`, `confirm-dialog`, `empty-state`, `skeleton`, `loading-spinner`, `vm-status-badge`, pipes |

Las pruebas permiten demostrar en una entrevista o revisión que la **lógica sensible** (guards, stores, interceptors, parseo de API) está verificada sin depender siempre del backend en vivo.

---

## Cómo presentar el proyecto (guía)

1. **Mapa del repo (~30 s):** Abre [Estructura de carpetas](#estructura-de-carpetas): `core` → `store` → `features` → `layout` → `shared`.
2. **Seguridad (~45 s):** Cookie HttpOnly, `withCredentials`, rol CLIENT sin botones de mutación.
3. **Estado (~45 s):** `auth.store` / `vm.store`, Signals y comandos que llaman a servicios.
4. **Optimistic UI (~60 s):** Crear o editar VM; rollback si falla la API.
5. **Tiempo real (~30 s):** WebSocket y `VmStore.applyServerEvent`.
6. **Calidad (~30 s):** `npm run test:ci` o recorrido de `*.spec.ts` y `vitest.config.ts`.

---

## Stack técnico

- **Angular 21** — componentes **standalone**, control flow (`@if`, `@for`), **`inject()`**, **OnPush**.
- **Zone.js** — `provideZoneChangeDetection` para un **Router** y Material estables.
- **Angular Signals** — estado global en stores; sin NgRx.
- **RxJS** — HTTP, efectos secundarios, rollback en UI optimista.
- **Angular Material 3** + **CDK**.
- **Chart.js** + **ng2-charts** — dashboard.
- **WebSocket** nativo — eventos de VMs (ruta configurable desde `APP_CONFIG`).
- **TypeScript estricto** + **SCSS** (tokens, modo claro/oscuro).
- **Vitest** — unit tests (`ng test` / `vitest.config.ts`).

---

## Arquitectura y decisiones

Resumen; el **desglose de carpetas y convenciones** está en [Estructura de carpetas](#estructura-de-carpetas).

- **Core** no depende de **features**; encapsula API, seguridad y modelos.
- **Store** orquesta lecturas/escrituras y expone señales de solo lectura donde aplica.
- **Features** son contenedores/páginas que consumen stores y servicios.
- **Shared** son piezas UI presentacionales reutilizables.
- **Lazy loading** de rutas y componentes para reducir el bundle inicial.
- **`withComponentInputBinding()`** en el router para inputs tipados desde rutas.

---

## Estado (Signals)

### `AuthStore` (`store/auth.store.ts`)

- Señales: usuario, `loading`, `isAuthenticated`, rol, iniciales.
- `login` / `logout`; **`hydrateSession()`** valida la cookie con **`GET /vms`** al arranque (mismo contrato que el backend; sin endpoint `/me`).
- Perfil en `localStorage` solo para UX; la sesión real es la **cookie HttpOnly**.

### `VmStore` (`store/vm.store.ts`)

- Lista de VMs, filtros, KPIs derivados con **`computed`**, operaciones **optimistas**, `applyServerEvent` para WebSocket.

---

## UI optimista

En crear / actualizar / eliminar VM: primero se actualiza el estado local (Signals), luego la petición HTTP; en error **`catchError`** revierte y muestra mensaje amigable.

---

## Autenticación HttpOnly

- Interceptor **`credentials`**: `withCredentials: true` hacia el origen del API.
- **`POST /login`** establece cookie; **`POST /logout`** la invalida.
- **`errorInterceptor`**: en **401** limpia usuario caché y redirige a login; trata **0** (red/CORS) en llamadas al API.

---

## WebSocket

Servicio de WebSocket nativo: conexión al host del API, parseo de JSON a **`VmEvent`**, reconexión ante cierre anormal. El **shell** suscribe y delega en **`VmStore.applyServerEvent`**.

---

## Rutas, guards y lazy loading

Flujo actual (`app.routes.ts`):

```
/                    → redirect a /login
/login               → guestGuard → LoginPage (lazy)
''                   → authGuard → Shell (lazy)
  ├── ''             → redirect a /dashboard
  ├── dashboard      → lazy
  └── vms            → lazy (+ create/edit con roleGuard ADMIN)
**                   → redirect a login
```

La primera ruta `path: ''` con `pathMatch: 'full'` solo coincide con **`/`** y redirige a login; la segunda `path: ''` es el **shell** para el resto de URLs bajo la raíz autenticada (`/dashboard`, `/vms`, …).

- **`authGuard`**: exige usuario en store (tras hidratar sesión con cookie válida).
- **`guestGuard`**: si ya hay sesión válida en cliente, redirige al dashboard.
- **`roleGuard(['ADMIN'])`**: rutas de creación/edición solo administradores.

---

## UI, temas y validación

- Tema Material 3 + tokens en `styles/`; modo claro/oscuro (`ThemeService`).
- Formularios reactivos en login y formulario de VM con validaciones alineadas al contrato del backend.
- Toasts globales vía **`MatSnackBar`** + interceptor de errores.

---

## Roles ADMIN / CLIENT

- **`auth.isAdmin()`** en plantillas: botones de crear/editar/eliminar **no se renderizan** para CLIENT.
- **`roleGuard`** en rutas sensibles.

---

## Contrato API (resumen)

Base: **`http://localhost:8080`** (ver `src/app/core/config/app.config.ts`).

| Método | Ruta | Notas |
|--------|------|--------|
| POST | `/login` | Cookie de sesión + cuerpo usuario |
| POST | `/logout` | Invalida sesión |
| GET/POST/PUT/DELETE | `/vms`, `/vms/:id` | CRUD; respuestas pueden ir envueltas; el **`VmService`** normaliza con `vm-api-response`. |
| WS | ruta configurable (p. ej. `/ws/vms`) | Eventos `VM_CREATED` / `VM_UPDATED` / `VM_DELETED` |

---

## Licencia y créditos

Yeison Rua - prueba técnica — **VM Console**: Angular · Signals · Material 3 · Vitest.
