import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import request from 'supertest';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { Express } from 'express';

process.env.NODE_ENV = 'test';
process.env.UPLOAD_DIR = path.join(process.cwd(), 'uploads-test');

const prisma = new PrismaClient();

let app: Express;
let adminToken: string;
let editorToken: string;

const unique = Date.now().toString();
const adminEmail = `p4-admin-${unique}@example.com`;
const editorEmail = `p4-editor-${unique}@example.com`;
const adminPassword = 'Admin123!';
const editorPassword = 'Editor123!';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const fakePng = Buffer.concat([PNG_SIGNATURE, Buffer.alloc(128)]);
const notAnImage = Buffer.from('esto no es una imagen');

function uploadDir() {
  return path.join(process.cwd(), 'uploads-test');
}

before(async () => {
  const { createApp } = await import('../src/app');
  app = createApp();

  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, editorEmail] } } });

  await prisma.user.create({
    data: {
      name: 'P4 Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: UserRole.ADMIN,
      active: true,
    },
  });
  await prisma.user.create({
    data: {
      name: 'P4 Editor',
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
  await prisma.product.deleteMany({ where: { name: { startsWith: 'TEST-' } } });
  await prisma.gallery.deleteMany({ where: { title: { startsWith: 'TEST-' } } });
  await prisma.$disconnect();
  await fs.rm(uploadDir(), { recursive: true, force: true });
});

function attachImage(req: request.Test, buffer: Buffer, contentType: string) {
  return req.attach('image', buffer, { filename: 'test.png', contentType });
}

test('upload requiere autenticación', async () => {
  const res = await attachImage(request(app).post('/api/uploads/image'), fakePng, 'image/png');
  assert.equal(res.status, 401);
});

test('upload rechaza MIME no permitido', async () => {
  const res = await attachImage(
    request(app).post('/api/uploads/image').set('Authorization', `Bearer ${adminToken}`),
    fakePng,
    'image/gif',
  );
  assert.equal(res.status, 415);
  assert.equal(res.body.error.code, 'UNSUPPORTED_MEDIA_TYPE');
});

test('upload rechaza contenido que no es imagen', async () => {
  const res = await attachImage(
    request(app).post('/api/uploads/image').set('Authorization', `Bearer ${adminToken}`),
    notAnImage,
    'image/png',
  );
  assert.equal(res.status, 415);
  assert.equal(res.body.error.code, 'INVALID_IMAGE');
});

test('upload rechaza archivo demasiado grande', async () => {
  const big = Buffer.concat([PNG_SIGNATURE, Buffer.alloc(5 * 1024 * 1024)]);
  const res = await attachImage(
    request(app).post('/api/uploads/image').set('Authorization', `Bearer ${adminToken}`),
    big,
    'image/png',
  );
  assert.equal(res.status, 413);
  assert.equal(res.body.error.code, 'FILE_TOO_LARGE');
});

test('upload exitoso devuelve url y key', async () => {
  const res = await attachImage(
    request(app).post('/api/uploads/image').set('Authorization', `Bearer ${adminToken}`),
    fakePng,
    'image/png',
  );
  assert.equal(res.status, 201);
  assert.ok(res.body.data.url);
  assert.ok(res.body.data.key);
  assert.match(res.body.data.url, /\/uploads\//);
});

test('GET settings público funciona', async () => {
  const res = await request(app).get('/api/settings');
  assert.equal(res.status, 200);
  assert.ok(res.body.success);
});

test('ADMIN puede modificar settings', async () => {
  const res = await request(app)
    .patch('/api/settings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ siteName: `TEST-Settings-${unique}` });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.siteName, `TEST-Settings-${unique}`);

  const restored = await request(app)
    .patch('/api/settings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ siteName: 'Karnes en su Jugo' });
  assert.equal(restored.status, 200);
});

test('EDITOR no puede modificar settings (403)', async () => {
  const res = await request(app)
    .patch('/api/settings')
    .set('Authorization', `Bearer ${editorToken}`)
    .send({ siteName: 'hack' });
  assert.equal(res.status, 403);
});

test('obtener y actualizar perfil', async () => {
  const me = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(me.status, 200);
  assert.equal(me.body.data.email, adminEmail);
  assert.equal(me.body.data.passwordHash, undefined);

  const updated = await request(app)
    .patch('/api/auth/me')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'P4 Admin Renombrado' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.name, 'P4 Admin Renombrado');

  await request(app)
    .patch('/api/auth/me')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'P4 Admin' });
});

test('cambio de contraseña: actual incorrecta devuelve 400', async () => {
  const res = await request(app)
    .patch('/api/auth/password')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ currentPassword: 'Wrong123!', newPassword: 'Nueva123!', confirmPassword: 'Nueva123!' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'CURRENT_PASSWORD_INCORRECT');
});

test('cambio de contraseña: nueva muy corta devuelve 422', async () => {
  const res = await request(app)
    .patch('/api/auth/password')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ currentPassword: adminPassword, newPassword: 'corta', confirmPassword: 'corta' });
  assert.equal(res.status, 422);
});

test('cambio de contraseña exitoso invalida sesión anterior', async () => {
  const newPassword = 'NuevaPassword123!';
  const res = await request(app)
    .patch('/api/auth/password')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ currentPassword: adminPassword, newPassword, confirmPassword: newPassword });
  assert.equal(res.status, 200);

  const oldLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: adminPassword });
  assert.equal(oldLogin.status, 401);

  const newLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: newPassword });
  assert.equal(newLogin.status, 200);

  // restaurar contraseña original
  await request(app)
    .patch('/api/auth/password')
    .set('Authorization', `Bearer ${newLogin.body.data.accessToken}`)
    .send({ currentPassword: newPassword, newPassword: adminPassword, confirmPassword: adminPassword });
});

test('producto con imagen: crear y eliminar archivo asociado', async () => {
  const category = await prisma.category.create({
    data: { name: `TEST-CatImg-${unique}` },
  });

  const upload = await attachImage(
    request(app).post('/api/uploads/image').set('Authorization', `Bearer ${adminToken}`),
    fakePng,
    'image/png',
  );
  const url = upload.body.data.url as string;
  const key = url.split('/').pop() as string;
  assert.ok((await fs.readdir(uploadDir())).includes(key));

  const created = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ categoryId: category.id, name: `TEST-ProdImg-${unique}`, price: 100, imageUrl: url });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.imageUrl, url);
  const productId = created.body.data.id;

  await request(app)
    .delete(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  await new Promise((r) => setTimeout(r, 50));
  assert.ok(!(await fs.readdir(uploadDir())).includes(key));

  await prisma.category.delete({ where: { id: category.id } });
});

test('galería con imagen: reemplazo y eliminación de archivo', async () => {
  const upload1 = await attachImage(
    request(app).post('/api/uploads/image').set('Authorization', `Bearer ${adminToken}`),
    fakePng,
    'image/png',
  );
  const url1 = upload1.body.data.url as string;
  const key1 = url1.split('/').pop() as string;

  const created = await request(app)
    .post('/api/gallery')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ imageUrl: url1, title: `TEST-GalImg-${unique}` });
  assert.equal(created.status, 201);
  const galleryId = created.body.data.id;

  const upload2 = await attachImage(
    request(app).post('/api/uploads/image').set('Authorization', `Bearer ${adminToken}`),
    fakePng,
    'image/png',
  );
  const url2 = upload2.body.data.url as string;

  const updated = await request(app)
    .put(`/api/gallery/${galleryId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ imageUrl: url2 });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.imageUrl, url2);

  await new Promise((r) => setTimeout(r, 50));
  assert.ok(!(await fs.readdir(uploadDir())).includes(key1));

  await request(app)
    .delete(`/api/gallery/${galleryId}`)
    .set('Authorization', `Bearer ${adminToken}`);
});
