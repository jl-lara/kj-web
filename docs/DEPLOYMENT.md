# Despliegue y producción — Karnes en su Jugo Tijuana

Guía de preparación de producción. Este documento describe la arquitectura objetivo,
el orden de despliegue y los procedimientos de respaldo/rollback. **No contiene secretos.**

## Arquitectura

```
Cloudflare Pages ── web (sitio público)   ──┐
Cloudflare Pages ── admin (CMS)           ──┼──▶ Render (backend) ──▶ Supabase PostgreSQL
                                                │
                                                └──▶ Supabase Storage (imágenes)
```

- **WEB**: Cloudflare Pages (sitio público).
- **ADMIN**: Cloudflare Pages (panel administrativo).
- **API**: Render (Dockerfile) → `https://<render>.onrender.com/api`.
- **DB**: Supabase PostgreSQL (proyecto gestionado).
- **Storage**: Supabase Storage (bucket público `images`).

## Dominio (pendiente de definición)

No hay dominio final definido. Al definirlo, se requerirá:

| Servicio | DNS recomendado |
| -------- | --------------- |
| WEB      | `www` + `@` → CNAME a `*.pages.dev` |
| ADMIN    | `admin` → CNAME a `*.pages.dev` |
| API      | `api` → CNAME a `*.onrender.com` |

No modificar DNS sin autorización explícita. HTTPS lo gestionan Cloudflare y Render
(Let's Encrypt) automáticamente.

## Orden de despliegue

1. Supabase: crear proyecto → base PostgreSQL.
2. Supabase: crear bucket `images` (público).
3. Render: crear servicio web desde `backend/Dockerfile` (o blueprint `render.yaml`).
4. Aplicar migraciones en Render: `npx prisma migrate deploy` (el Dockerfile lo ejecuta).
5. Smoke test de API (`GET /api/health`).
6. Cloudflare Pages: desplegar `admin` con `VITE_API_URL=https://<render>.onrender.com/api`.
7. Smoke test de admin (login, CRUD, upload).
8. Cloudflare Pages: desplegar `web` con `VITE_API_URL=https://<render>.onrender.com/api`.
9. Smoke test de integración (editar en admin → ver en web).
10. Dominio/DNS (solo con autorización).

## Variables de entorno (nombres únicamente)

### Backend (Render / Supabase)

`NODE_ENV`, `PORT`, `DATABASE_URL`, `CORS_ORIGIN`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`,
`REFRESH_COOKIE_NAME`, `STORAGE_PROVIDER`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `PUBLIC_BASE_URL`.

> `SUPABASE_SERVICE_ROLE_KEY`, `JWT_*` y `DATABASE_URL` son secretos de backend y
> **nunca** se exponen al frontend.

### Frontend (Cloudflare Pages)

Solo variables públicas `VITE_*`:

- `admin`: `VITE_API_URL`
- `web`: `VITE_API_URL`

## Build settings (Cloudflare Pages)

| Proyecto | Build command | Output |
| -------- | ------------- | ------ |
| web      | `npm run build` | `web/dist` (o `dist` si el root es `web/`) |
| admin    | `npm run build` | `admin/dist` (o `dist` si el root es `admin/`) |

> `web` y `admin` usan `HashRouter`, por lo que **no se requiere** SPA fallback /
> rewrite (todas las rutas se sirven desde `/` con hash `#/...`). Si en el futuro se
> migra a `BrowserRouter`, añadir un `_redirects` con `/* /index.html 200`.

## Supabase

- **PostgreSQL**: usar la cadena de conexión de Supabase (pooler/transaction o directo)
  con `?sslmode=require`. Configurar `DATABASE_URL` en Render.
- **Migraciones**: solo `npx prisma migrate deploy` contra producción (nunca `migrate dev`).
- **Storage**: bucket **público** `images` (el CMS guarda URLs públicas en DB; los
  buckets privados requieren URLs firmadas y no son compatibles con el flujo actual).
- **Seed**: el seed es solo para desarrollo y se niega a ejecutarse en producción
  (`NODE_ENV=production`).
- Las imágenes locales existentes en `./uploads` **no** se migran automáticamente a
  Supabase; si se requiere, es una tarea separada.

## CORS y cookies

- Producción requiere `CORS_ORIGIN` explícito (web + admin). El backend rechaza
  arrancar en producción con `CORS_ORIGIN=*`.
- Refresh cookie: `HttpOnly`, `Secure` y `SameSite=None` en producción (los frontends
  están en orígenes distintos al API). Path `/api/auth`.

## Respaldo y rollback

- **DB**: backups gestionados por Supabase (configurar los backups/retention del
  proyecto). Para recuperación puntual: `pg_dump` del proyecto Supabase.
- **Storage**: el bucket `images` de Supabase es el único storage de imágenes.
- **Rollback backend**: Render permite redeploy del commit anterior; las migraciones
  son forward-only (no aplicar migraciones destructivas manualmente).
- **Rollback frontend**: Cloudflare Pages permite "Rollback to previous deployment".

## Observabilidad mínima

`GET /api/health` → `{ success, message, database }` (no revela secretos ni conexiones).
