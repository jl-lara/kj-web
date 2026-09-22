import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { Express } from 'express';

process.env.NODE_ENV = 'test';

const prisma = new PrismaClient();

let app: Express;
let adminToken: string;
let editorToken: string;

const unique = Date.now().toString();
const adminEmail = `admin-${unique}@example.com`;
const editorEmail = `editor-${unique}@example.com`;
const adminPassword = 'Admin123!';
const editorPassword = 'Editor123!';

function extractCookie(res: { headers: Record<string, unknown> }, name: string): string | undefined {
  const raw = res.headers['set-cookie'] as unknown as string | string[] | undefined;
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const found = arr.find((c) => c.startsWith(`${name}=`));
  return found ? found.split(';')[0] : undefined;
}

before(async () => {
  const { createApp } = await import('../src/app');
  app = createApp();

  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, editorEmail] } } });

  await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: UserRole.ADMIN,
      active: true,
    },
  });
  await prisma.user.create({
    data: {
      name: 'Test Editor',
      email: editorEmail,
      passwordHash: await bcrypt.hash(editorPassword, 10),
      role: UserRole.EDITOR,
      active: true,
    },
  });

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: adminPassword });
  adminToken = adminRes.body.data.accessToken;

  const editorRes = await request(app)
    .post('/api/auth/login')
    .send({ email: editorEmail, password: editorPassword });
  editorToken = editorRes.body.data.accessToken;
});

after(async () => {
  await prisma.product.deleteMany({ where: { name: { startsWith: 'TEST-' } } });
  await prisma.category.deleteMany({ where: { name: { startsWith: 'TEST-' } } });
  await prisma.location.deleteMany({ where: { name: { startsWith: 'TEST-' } } });
  await prisma.promotion.deleteMany({ where: { title: { startsWith: 'TEST-' } } });
  await prisma.gallery.deleteMany({ where: { title: { startsWith: 'TEST-' } } });
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, editorEmail] } } });
  await prisma.$disconnect();
});

test('health check responde correctamente', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.database, 'connected');
});

test('login válido devuelve accessToken y usuario sin passwordHash', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: adminPassword });
  assert.equal(res.status, 200);
  assert.ok(res.body.data.accessToken);
  assert.ok(res.body.data.user);
  assert.equal(res.body.data.user.passwordHash, undefined);
});

test('login inválido devuelve 401 sin revelar existencia del email', async () => {
  const wrong = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: 'WrongPass123!' });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.error.code, 'INVALID_CREDENTIALS');

  const unknown = await request(app)
    .post('/api/auth/login')
    .send({ email: `nobody-${unique}@example.com`, password: 'Whatever123!' });
  assert.equal(unknown.status, 401);
  assert.equal(unknown.body.error.code, 'INVALID_CREDENTIALS');
});

test('me autenticado devuelve el usuario', async () => {
  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.data.email, adminEmail);
});

test('me sin token devuelve 401', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
});

test('refresh devuelve un nuevo accessToken', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: adminPassword });
  const cookie = extractCookie(login, 'refreshToken');
  assert.ok(cookie);

  const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie!);
  assert.equal(res.status, 200);
  assert.ok(res.body.data.accessToken);
});

test('logout invalida el refresh token', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: adminPassword });
  const cookie = extractCookie(login, 'refreshToken');
  assert.ok(cookie);

  const logout = await request(app).post('/api/auth/logout').set('Cookie', cookie!);
  assert.equal(logout.status, 200);

  const refresh = await request(app).post('/api/auth/refresh').set('Cookie', cookie!);
  assert.equal(refresh.status, 401);
});

test('ruta protegida sin token devuelve 401', async () => {
  const res = await request(app).get('/api/users');
  assert.equal(res.status, 401);
});

test('ruta protegida con rol incorrecto devuelve 403', async () => {
  const res = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${editorToken}`);
  assert.equal(res.status, 403);
});

test('CRUD de categorías', async () => {
  const created = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `TEST-Categoria-${unique}` });
  assert.equal(created.status, 201);
  const id = created.body.data.id;

  const list = await request(app).get('/api/categories');
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.body.data));

  const got = await request(app).get(`/api/categories/${id}`);
  assert.equal(got.status, 200);

  const updated = await request(app)
    .put(`/api/categories/${id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ description: 'actualizada' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.description, 'actualizada');

  const deactivated = await request(app)
    .patch(`/api/categories/${id}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ active: false });
  assert.equal(deactivated.status, 200);
  assert.equal(deactivated.body.data.active, false);

  const deleted = await request(app)
    .delete(`/api/categories/${id}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deleted.status, 204);
});

test('crear categoría con nombre inválido devuelve 422', async () => {
  const res = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: '' });
  assert.equal(res.status, 422);
});

test('CRUD de productos y validación de categoría', async () => {
  const category = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `TEST-CatProd-${unique}` });
  const categoryId = category.body.data.id;

  const invalidCategory = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ categoryId: '00000000-0000-0000-0000-000000000000', name: 'X', price: 10 });
  assert.equal(invalidCategory.status, 404);
  assert.equal(invalidCategory.body.error.code, 'CATEGORY_NOT_FOUND');

  const negativePrice = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ categoryId, name: 'X', price: -1 });
  assert.equal(negativePrice.status, 422);

  const created = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ categoryId, name: `TEST-Producto-${unique}`, price: 245 });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.price, 245);
  const id = created.body.data.id;

  const list = await request(app).get('/api/products');
  assert.equal(list.status, 200);

  const updated = await request(app)
    .put(`/api/products/${id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ price: 260.5 });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.price, 260.5);

  const status = await request(app)
    .patch(`/api/products/${id}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ active: false });
  assert.equal(status.status, 200);

  const editorDelete = await request(app)
    .delete(`/api/products/${id}`)
    .set('Authorization', `Bearer ${editorToken}`);
  assert.equal(editorDelete.status, 403);

  const deleted = await request(app)
    .delete(`/api/products/${id}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deleted.status, 204);

  const cleanup = await request(app)
    .delete(`/api/categories/${categoryId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(cleanup.status, 204);
});

test('no se puede eliminar una categoría con productos', async () => {
  const category = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `TEST-CatBlock-${unique}` });
  const categoryId = category.body.data.id;

  const product = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ categoryId, name: `TEST-ProdBlock-${unique}`, price: 10 });
  const productId = product.body.data.id;

  const res = await request(app)
    .delete(`/api/categories/${categoryId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, 'CATEGORY_HAS_PRODUCTS');

  await request(app)
    .delete(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  await request(app)
    .delete(`/api/categories/${categoryId}`)
    .set('Authorization', `Bearer ${adminToken}`);
});

test('CRUD de sucursales', async () => {
  const created = await request(app)
    .post('/api/locations')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `TEST-Sucursal-${unique}`, address: 'Calle 123', latitude: 32.5, longitude: -117.0 });
  assert.equal(created.status, 201);
  const id = created.body.data.id;

  const got = await request(app).get(`/api/locations/${id}`);
  assert.equal(got.status, 200);

  const updated = await request(app)
    .put(`/api/locations/${id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ phone: '664-000-0000' });
  assert.equal(updated.status, 200);

  const deleted = await request(app)
    .delete(`/api/locations/${id}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deleted.status, 204);
});

test('sucursal con coordenada inválida devuelve 422', async () => {
  const res = await request(app)
    .post('/api/locations')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'X', address: 'Y', latitude: 200 });
  assert.equal(res.status, 422);
});

test('CRUD de promociones', async () => {
  const created = await request(app)
    .post('/api/promotions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: `TEST-Promo-${unique}`, description: 'desc' });
  assert.equal(created.status, 201);
  const id = created.body.data.id;

  const list = await request(app).get('/api/promotions');
  assert.equal(list.status, 200);

  const updated = await request(app)
    .put(`/api/promotions/${id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ description: 'nueva' });
  assert.equal(updated.status, 200);

  const deleted = await request(app)
    .delete(`/api/promotions/${id}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deleted.status, 204);
});

test('CRUD de galería', async () => {
  const created = await request(app)
    .post('/api/gallery')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ imageUrl: 'https://example.com/a.jpg', title: `TEST-Gal-${unique}` });
  assert.equal(created.status, 201);
  const id = created.body.data.id;

  const got = await request(app).get(`/api/gallery/${id}`);
  assert.equal(got.status, 200);

  const updated = await request(app)
    .put(`/api/gallery/${id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ altText: 'alt' });
  assert.equal(updated.status, 200);

  const deleted = await request(app)
    .delete(`/api/gallery/${id}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deleted.status, 204);
});

test('gestión de usuarios (ADMIN)', async () => {
  const created = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Nuevo', email: `new-${unique}@example.com`, password: 'Password123!', role: 'EDITOR' });
  assert.equal(created.status, 201);
  const id = created.body.data.id;

  const list = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(list.status, 200);

  const got = await request(app)
    .get(`/api/users/${id}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(got.status, 200);
  assert.equal(got.body.data.passwordHash, undefined);

  const updated = await request(app)
    .patch(`/api/users/${id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Renombrado' });
  assert.equal(updated.status, 200);

  const deactivated = await request(app)
    .patch(`/api/users/${id}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ active: false });
  assert.equal(deactivated.status, 200);
  assert.equal(deactivated.body.data.active, false);

  await prisma.user.delete({ where: { id } });
});

test('editor no puede gestionar usuarios (403)', async () => {
  const res = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${editorToken}`)
    .send({ name: 'X', email: `x-${unique}@example.com`, password: 'Password123!' });
  assert.equal(res.status, 403);
});

test('no se puede desactivar al último administrador activo', async () => {
  const admins = await prisma.user.findMany({ where: { role: UserRole.ADMIN, active: true } });
  const testAdmin = admins.find((a) => a.email === adminEmail);
  assert.ok(testAdmin);

  try {
    for (const a of admins) {
      if (a.id !== testAdmin.id) {
        await prisma.user.update({ where: { id: a.id }, data: { active: false } });
      }
    }

    const res = await request(app)
      .patch(`/api/users/${testAdmin.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ active: false });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'LAST_ADMIN');
  } finally {
    for (const a of admins) {
      if (a.id !== testAdmin.id) {
        await prisma.user.update({ where: { id: a.id }, data: { active: true } });
      }
    }
  }
});
