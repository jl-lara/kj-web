# AGENTS.md

Monorepo for Karnes en su Jugo Tijuana. Spanish language content.

```
kj-web/
├── web/       # Sitio web público (React + Vite) — no TypeScript
├── admin/     # Panel administrativo / CMS (React + Vite) — no TypeScript
└── backend/   # API REST (Node.js + Express + TypeScript + Prisma + PostgreSQL)
```

## Commands

- `web/` — `npm run dev`, `npm run build`
- `admin/` — `npm run dev`, `npm run build`
- `backend/` — `npm run dev` (tsx watch), `npm run build` (tsc), `npm start`
- `backend/` Prisma — `npx prisma generate`, `npx prisma migrate dev`, `npx prisma studio`

## Architecture (web/)

- `web/src/App.jsx` — route table; all routes nested under `MainLayout`
- `web/src/layouts/MainLayout.jsx` — renders `Navbar` + `<Outlet/>` + `Footer` around every page
- `web/src/pages/` — 7 pages. **Route paths are Spanish and do not match filenames**: `/reservaciones`→`Reservaciones.jsx`, `/sucursales`→`Locations.jsx`, `/historia`→`About.jsx`, `/contacto`→`Contact.jsx`, `/menu`→`Menu.jsx`, `/promociones`→`Promotions.jsx`, `/`→`Home.jsx`
- `web/src/components/` — reusable UI (Navbar, Footer, MenuCard, LocationCard, ReservationForm, SectionTitle, PageHero)
- `web/src/data/siteData.js` — all content, images, and locations sourced from the live site
- `web/src/styles/global.css` — single CSS file with CSS custom properties
- `web/src/images/logo-top-portal.png` — local logo asset

## Architecture (backend/)

- `backend/src/app.ts` — Express config; `backend/src/server.ts` — server bootstrap
- Layers: `routes/` → `controllers/` → `services/` → `repositories/` → Prisma
- `backend/prisma/schema.prisma` — models (User, Category, Product, Location, Promotion, Gallery)

## Key constraints

- **Do not invent restaurant data.** All prices, locations, phone numbers, and menu items come from `siteData.js` or the live site (https://karnesensujugotijuana.com/).
- Menu images are remote URLs from the live site; local logo is the only local image asset.
- `web/` and `admin/` dependencies use `latest` versions in `package.json` — no pinned versions. `backend/` pins its versions.
- Skills installed: `enhance-prompt` (Google Stitch), `frontend-design` (Anthropic).
