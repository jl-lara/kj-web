# AGENTS.md

Monorepo for Karnes en su Jugo Tijuana. Spanish language content.

```
kj-web/
├── web/       # Sitio web público (React + Vite) — no TypeScript
├── admin/     # Panel administrativo / CMS (React + Vite) — no TypeScript (aún no conectado a la API)
└── backend/   # API REST (Node.js + Express + TypeScript + Prisma + PostgreSQL)
```

## Commands

Run each app from its own directory.

```bash
# web / admin
cd web && npm run dev        # o npm run build
cd admin && npm run dev      # o npm run build

# backend (order matters: Postgres must be up before migrate/seed/test)
cd backend
docker compose up -d         # PostgreSQL local, puerto 5432 (karnes_db)
npx prisma migrate dev       # aplica migraciones + genera cliente
npm run seed                 # datos de desarrollo (ADMIN/EDITOR + contenido)
npm run dev                  # tsx watch
npm run build && npm start   # producción (tsc → node dist/server.js)
npm test                     # integración (requiere Postgres corriendo)
```

Backend has no lint/format config. Typecheck = `npm run build` (tsc).

## Architecture (web/)

- `web/src/App.jsx` — route table; all routes nested under `MainLayout` (`HashRouter` in `main.jsx`).
- `web/src/pages/` — 7 pages. **Route paths are Spanish and do not match filenames**: `/reservaciones`→`Reservaciones.jsx`, `/sucursales`→`Locations.jsx`, `/historia`→`About.jsx`, `/contacto`→`Contact.jsx`, `/menu`→`Menu.jsx`, `/promociones`→`Promotions.jsx`, `/`→`Home.jsx`.
- `web/src/data/siteData.js` — single source of content/images/locations (from the live site).
- `web/vite.config.js` sets `base: './'`; only local image is `web/src/images/logo-top-portal.png` (menu images are remote URLs).

## Architecture (backend/)

- `backend/src/app.ts` — Express config; `backend/src/server.ts` — listens on `process.env.PORT` at `0.0.0.0` (Render-ready).
- Strict layering (do not put business logic in routes): `routes/` → `controllers/` → `services/` → `repositories/` → Prisma.
- `middleware/` — `authenticate`, `authenticateOptional` (public vs. admin read), `authorize(...roles)`, `validate` (zod), `errorHandler` (maps Prisma P2002→409, P2025→404, P2003→409), `rateLimiter`.
- `validators/` — zod schemas per resource (shared helpers in `common.ts`).
- `prisma/schema.prisma` — User, RefreshToken, Category, Product, Location, Promotion, Gallery. IDs are UUID.

### Auth & roles

- Access token JWT (`Authorization: Bearer`); refresh token JWT in `HttpOnly` cookie (`refreshToken`), stored hashed (SHA-256) so logout can revoke it. Never put tokens in `localStorage`.
- Roles: `ADMIN` (full, incl. users) / `EDITOR` (content only). `/api/users/*` is ADMIN-only; product `DELETE` is ADMIN-only.
- Auth errors are generic (`INVALID_CREDENTIALS`) and must not reveal whether an email exists.

### API conventions

- Success: `{ "success": true, "data": ... }`. Lists add `"meta": { page, limit, total }`. Error: `{ "success": false, "error": { message, code } }`.
- Public `GET`s return only `active=true`; authenticated reads can see inactive. `promotions` public list also filters to currently valid dates.
- Health: `GET /api/health`.

## Gotchas

- **Do not invent restaurant data.** Prices/locations/phones/menu come from `web/src/data/siteData.js` or the live site (https://karnesensujugotijuana.com/).
- **Never commit `.env`.** Copy `backend/.env.example`; it's gitignored. Secrets (JWT, DATABASE_URL) come only from env.
- `backend/package.json` has an `overrides` entry forcing `deepmerge-ts@^8` to fix a transitive CVE via `prisma → @prisma/config`. Don't remove it casually.
- `package.json#prisma.seed` is deprecated (Prisma 6 warns). Keep it until the Prisma 7 upgrade; don't migrate to `prisma.config.ts` yet.
- Backend tests are integration tests hitting the real local Postgres (Docker) and set `NODE_ENV=test` (skips morgan + rate limiting). Run `docker compose up -d` first.
- `web/` and `admin/` pin deps to `latest` in `package.json`; `backend/` pins exact-ish semver ranges.
- CI (`.github/workflows/deploy.yml`) deploys `web/` to GitHub Pages; the npm cache path is `web/package-lock.json`.
