# backend — Karnes en su Jugo Tijuana (API REST)

API REST para el CMS de Karnes en su Jugo Tijuana.

Stack: Node.js + Express + TypeScript + Prisma + PostgreSQL.

## Requisitos

- Node.js 22+
- Docker (para PostgreSQL local)

## Instalación y ejecución local

```bash
cd backend
npm install
docker compose up -d          # PostgreSQL local en el puerto 5432
npx prisma migrate dev         # aplica migraciones y genera el cliente
npm run seed                   # datos de desarrollo
npm run dev                    # servidor en modo watch (tsx)
```

Producción:

```bash
npm run build
npm start
```

Prisma:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma studio
npx prisma db seed
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar valores. Nunca subir `.env` a Git.

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/karnes_db?schema=public
CORS_ORIGIN=*

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
REFRESH_COOKIE_NAME=refreshToken
```

En producción configurar `CORS_ORIGIN` con los orígenes permitidos separados por coma.

## Docker

- `docker-compose.yml` levanta PostgreSQL con volumen persistente.
- `Dockerfile` (multi-stage) compila y ejecuta la API. El contenedor ejecuta `prisma migrate deploy` y luego `node dist/server.js`. El servidor escucha en `process.env.PORT` sobre `0.0.0.0`.

## Seed (desarrollo)

```bash
npm run seed
```

Crea un ADMIN, un EDITOR, categorías, productos, sucursales, promociones y galería.

- **ADMIN**: `admin@example.com` / `Admin123!`
- **EDITOR**: `editor@example.com` / `Editor123!`

> **ADVERTENCIA**: credenciales solo para desarrollo. Cambiarlas o eliminarlas antes de producción.

## Autenticación

- Contraseñas con `bcryptjs` (nunca en texto plano).
- Access token JWT (`Authorization: Bearer <token>`).
- Refresh token JWT en cookie `HttpOnly` (`SameSite=Lax`, `Secure` en producción), almacenado (hash SHA-256) en base de datos para poder revocarlo en el logout.

Endpoints:

| Método | Ruta              | Descripción                          |
| ------ | ----------------- | ------------------------------------ |
| POST   | `/api/auth/login` | Inicia sesión (devuelve access token + usuario) |
| POST   | `/api/auth/refresh` | Renueva el access token usando la cookie |
| POST   | `/api/auth/logout` | Revoca el refresh token y limpia la cookie |
| GET    | `/api/auth/me`    | Usuario autenticado actual           |

## Roles

- `ADMIN`: acceso total, incluye gestión de usuarios.
- `EDITOR`: lectura y escritura de contenido (productos, categorías, sucursales, promociones, galería). No gestiona usuarios.

## Endpoints

Formato de éxito: `{ "success": true, "data": ... }`. Listas: `{ "success": true, "data": [...], "meta": { page, limit, total } }`.
Formato de error: `{ "success": false, "error": { message, code } }`.

Leyenda: 🔓 público · 🔒 requiere token.

### Auth

- 🔒 `POST /api/auth/login`
- 🔒 `POST /api/auth/refresh`
- 🔒 `POST /api/auth/logout`
- 🔒 `GET /api/auth/me`

### Usuarios (solo `ADMIN`)

- 🔒 `GET /api/users`
- 🔒 `GET /api/users/:id`
- 🔒 `POST /api/users`
- 🔒 `PATCH /api/users/:id`
- 🔒 `PATCH /api/users/:id/status`

### Categorías

- 🔓 `GET /api/categories` (solo activas)
- 🔓 `GET /api/categories/:id`
- 🔒 `POST /api/categories` (`ADMIN`/`EDITOR`)
- 🔒 `PUT /api/categories/:id`
- 🔒 `PATCH /api/categories/:id/status`
- 🔒 `DELETE /api/categories/:id`

### Productos

- 🔓 `GET /api/products` (solo activos; filtros `categoryId`, `search`, orden/paginación)
- 🔓 `GET /api/products/:id`
- 🔒 `POST /api/products` (`ADMIN`/`EDITOR`)
- 🔒 `PUT /api/products/:id`
- 🔒 `PATCH /api/products/:id/status`
- 🔒 `DELETE /api/products/:id` (solo `ADMIN`)

### Sucursales

- 🔓 `GET /api/locations`
- 🔓 `GET /api/locations/:id`
- 🔒 `POST /api/locations`
- 🔒 `PUT /api/locations/:id`
- 🔒 `PATCH /api/locations/:id/status`
- 🔒 `DELETE /api/locations/:id`

### Promociones

- 🔓 `GET /api/promotions` (solo activas y vigentes)
- 🔓 `GET /api/promotions/:id`
- 🔒 `POST /api/promotions`
- 🔒 `PUT /api/promotions/:id`
- 🔒 `PATCH /api/promotions/:id/status`
- 🔒 `DELETE /api/promotions/:id`

### Galería

- 🔓 `GET /api/gallery`
- 🔓 `GET /api/gallery/:id`
- 🔒 `POST /api/gallery`
- 🔒 `PUT /api/gallery/:id`
- 🔒 `PATCH /api/gallery/:id/status`
- 🔒 `DELETE /api/gallery/:id`

### Health

- 🔓 `GET /api/health`

## Ejemplos de requests

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

Crear producto:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"<uuid>","name":"Karnes en su Jugo","price":245}'
```

## Tests

```bash
npm test
```

Tests de integración con `node:test` + `supertest` (requiere PostgreSQL local levantado).

## Arquitectura

```
routes → controllers → services → repositories → Prisma → PostgreSQL
```

- `src/config` — entorno y cliente Prisma
- `src/middleware` — authenticate, authorize, validate (zod), errorHandler, rate limiting
- `src/validators` — esquemas zod
- `src/utils` — JWT, bcrypt, cookies, respuestas, errores
- `prisma/schema.prisma` — modelos: User, RefreshToken, Category, Product, Location, Promotion, Gallery
