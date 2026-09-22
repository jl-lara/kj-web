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
const adminEmail = `p5-admin-${unique}@example.com`;
const editorEmail = `p5-editor-${unique}@example.com`;
const adminPassword = 'Admin123!';
const editorPassword = 'Editor123!';

before(async () => {
  const { createApp } = await import('../src/app');
  app = createApp();

  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, editorEmail] } } });

  await prisma.user.create({
    data: {
      name: 'P5 Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: UserRole.ADMIN,
      active: true,
    },
  });
  await prisma.user.create({
    data: {
      name: 'P5 Editor',
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
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, editorEmail] } } });
  await prisma.promotion.deleteMany({ where: { title: { startsWith: 'TEST-' } } });
  await prisma.gallery.deleteMany({ where: { title: { startsWith: 'TEST-' } } });
  await prisma.$disconnect();
});

test('promoción con precio: crear, obtener y editar', async () => {
  const created = await request(app)
    .post('/api/promotions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: `TEST-PromoPrecio-${unique}`, description: 'desc', price: 165 });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.price, 165);
  const id = created.body.data.id;

  const got = await request(app).get(`/api/promotions/${id}`);
  assert.equal(got.status, 200);
  assert.equal(got.body.data.price, 165);

  const updated = await request(app)
    .put(`/api/promotions/${id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ price: 195.5 });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.price, 195.5);

  await request(app)
    .delete(`/api/promotions/${id}`)
    .set('Authorization', `Bearer ${adminToken}`);
});

test('promoción sin precio devuelve null', async () => {
  const created = await request(app)
    .post('/api/promotions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: `TEST-PromoSinPrecio-${unique}` });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.price, null);
  const id = created.body.data.id;

  const got = await request(app).get(`/api/promotions/${id}`);
  assert.equal(got.status, 200);
  assert.equal(got.body.data.price, null);

  await request(app)
    .delete(`/api/promotions/${id}`)
    .set('Authorization', `Bearer ${adminToken}`);
});

test('precio inválido devuelve 422', async () => {
  const res = await request(app)
    .post('/api/promotions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: `TEST-PromoPrecioInv-${unique}`, price: -5 });
  assert.equal(res.status, 422);
});

test('galería pública solo devuelve elementos activos', async () => {
  const active = await request(app)
    .post('/api/gallery')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ imageUrl: 'https://example.com/active.jpg', title: `TEST-GalActive-${unique}`, active: true });
  assert.equal(active.status, 201);
  const activeId = active.body.data.id;

  const inactive = await request(app)
    .post('/api/gallery')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ imageUrl: 'https://example.com/inactive.jpg', title: `TEST-GalInactive-${unique}`, active: false });
  assert.equal(inactive.status, 201);
  const inactiveId = inactive.body.data.id;

  const list = await request(app).get('/api/gallery?limit=100');
  assert.equal(list.status, 200);
  const ids = list.body.data.map((item: { id: string }) => item.id);
  assert.ok(ids.includes(activeId));
  assert.ok(!ids.includes(inactiveId));

  await request(app)
    .delete(`/api/gallery/${activeId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  await request(app)
    .delete(`/api/gallery/${inactiveId}`)
    .set('Authorization', `Bearer ${adminToken}`);
});

test('settings faviconUrl se guarda, se lee y admite ausencia', async () => {
  const before = await request(app).get('/api/settings');
  const original = before.body.data?.faviconUrl ?? null;

  const favicon = 'https://example.com/favicon.png';
  const patched = await request(app)
    .patch('/api/settings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ faviconUrl: favicon });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.data.faviconUrl, favicon);

  const got = await request(app).get('/api/settings');
  assert.equal(got.body.data.faviconUrl, favicon);

  const cleared = await request(app)
    .patch('/api/settings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ faviconUrl: null });
  assert.equal(cleared.status, 200);
  assert.equal(cleared.body.data.faviconUrl, null);

  await request(app)
    .patch('/api/settings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ faviconUrl: original });
});

test('editor no puede modificar settings (favicon)', async () => {
  const res = await request(app)
    .patch('/api/settings')
    .set('Authorization', `Bearer ${editorToken}`)
    .send({ faviconUrl: 'https://example.com/hack.png' });
  assert.equal(res.status, 403);
});
