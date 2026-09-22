# Karnes en su Jugo Tijuana

Plataforma web de **Karnes en su Jugo Tijuana**. Repositorio monorepo con tres aplicaciones independientes.

```
kj-web/
├── web/       # Sitio web público (React + Vite)
├── admin/     # Panel administrativo / CMS (React + Vite)
└── backend/   # API REST (Node.js + Express + TypeScript + Prisma)
```

## Arquitectura

```
                    KARNES EN SU JUGO
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          WEB           ADMIN         BACKEND
       React/Vite     React/Vite    Node/Express
                                      TypeScript
                                          │
                                          ▼
                                       Prisma
                                          │
                                          ▼
                                      PostgreSQL
                                          │
                                          ▼
                                      Supabase
```

- **`web/`** — Sitio público orientado al cliente (menú, sucursales, promociones, historia, contacto, reservaciones).
- **`admin/`** — Panel administrativo para gestionar productos, categorías, sucursales, promociones, galería y usuarios.
- **`backend/`** — API REST. Los clientes React **nunca** se conectan directamente a PostgreSQL; siempre lo hacen a través de la API.

## Requisitos

- Node.js 22+
- Docker (para PostgreSQL local)

## Web

```bash
cd web
npm install
npm run dev        # desarrollo
npm run build      # producción
```

## Admin

```bash
cd admin
npm install
npm run dev        # desarrollo
npm run build      # producción
```

## Backend

```bash
cd backend
npm install
docker compose up -d              # levanta PostgreSQL local (puerto 5432)
npx prisma migrate dev            # aplica migraciones (desarrollo)
npm run dev                       # desarrollo (tsx watch)
npm run build && npm start        # producción
```

Comandos Prisma:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma studio
```

### Health check

```http
GET /api/health
```

Respuesta:

```json
{
  "success": true,
  "message": "API is running",
  "database": "connected"
}
```

## Variables de entorno

Cada aplicación maneja sus propias variables. El backend requiere un archivo `.env` (ver `backend/.env.example`):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/karnes_db?schema=public
CORS_ORIGIN=*
```

Nunca subir `.env` a GitHub.

## Despliegue

- **`web/`** → Cloudflare Pages
- **`admin/`** → Cloudflare Pages
- **`backend/`** → Render (Dockerfile) + Supabase PostgreSQL

## Modelos de datos (Prisma)

`User`, `Category`, `Product`, `Location`, `Promotion`, `Gallery`. Ver `backend/prisma/schema.prisma`.
