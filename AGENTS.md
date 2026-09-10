# AGENTS.md

React/Vite site for Karnes en su Jugo Tijuana. Spanish language content. No TypeScript.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- No test, lint, or typecheck configured

## Architecture

- `src/App.jsx` — route table; all routes nested under `MainLayout`
- `src/layouts/MainLayout.jsx` — renders `Navbar` + `<Outlet/>` + `Footer` around every page
- `src/pages/` — 7 pages. **Route paths are Spanish and do not match filenames**: `/reservaciones`→`Reservaciones.jsx`, `/sucursales`→`Locations.jsx`, `/historia`→`About.jsx`, `/contacto`→`Contact.jsx`, `/menu`→`Menu.jsx`, `/promociones`→`Promotions.jsx`, `/`→`Home.jsx`
- `src/components/` — reusable UI (Navbar, Footer, MenuCard, LocationCard, ReservationForm, SectionTitle, PageHero)
- `src/data/siteData.js` — all content, images, and locations sourced from the live site
- `src/styles/global.css` — single CSS file with CSS custom properties
- `src/images/logo-top-portal.png` — local logo asset
- No `vite.config.js` — Vite 8+ auto-detects `@vitejs/plugin-react`

## Key constraints

- **Do not invent restaurant data.** All prices, locations, phone numbers, and menu items come from `siteData.js` or the live site (https://karnesensujugotijuana.com/).
- Menu images are remote URLs from the live site; local logo is the only local image asset.
- Dependencies use `latest` versions in `package.json` — no pinned versions.
- Skills installed: `enhance-prompt` (Google Stitch), `frontend-design` (Anthropic).
