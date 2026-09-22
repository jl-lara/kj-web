import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development data...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const editorPassword = await bcrypt.hash('Editor123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      name: 'Editor',
      email: 'editor@example.com',
      passwordHash: editorPassword,
      role: UserRole.EDITOR,
      active: true,
    },
  });

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.gallery.deleteMany();

  const especialidades = await prisma.category.create({
    data: { name: 'Especialidades', description: 'Platillos principales de la casa', displayOrder: 1 },
  });
  const desayuno = await prisma.category.create({
    data: { name: 'Desayuno', description: 'Platillos para empezar el día', displayOrder: 2 },
  });
  const comida = await prisma.category.create({
    data: { name: 'Comida', description: 'Platillos para la comida', displayOrder: 3 },
  });

  await prisma.product.createMany({
    data: [
      {
        categoryId: especialidades.id,
        name: 'Karnes en su Jugo',
        description: 'Platillo principal de la casa',
        price: '245.00',
        displayOrder: 1,
      },
      {
        categoryId: especialidades.id,
        name: 'Rib Eye',
        description: 'Rib Eye 300 g con vegetales',
        price: '480.00',
        displayOrder: 2,
      },
      {
        categoryId: desayuno.id,
        name: 'Chilaquiles KJ',
        description: 'Chilaquiles con carne en su jugo',
        price: '280.00',
        displayOrder: 1,
      },
      {
        categoryId: comida.id,
        name: 'Quesadilla KJ',
        description: 'Quesadilla con carne en su jugo',
        price: '80.00',
        displayOrder: 1,
      },
    ],
  });

  await prisma.location.createMany({
    data: [
      {
        name: 'Zona Río',
        address: 'Av. Padre Kino #10101 Zona Río, Tijuana, B.C.',
        phone: '664-682-3161',
        displayOrder: 1,
      },
      {
        name: 'Centro',
        address: '4ta #8350-8 y Madero, Zona Centro, Tijuana, B.C.',
        phone: '664-660-7771',
        displayOrder: 2,
      },
    ],
  });

  const now = new Date();
  await prisma.promotion.createMany({
    data: [
      {
        title: 'Especial Desayuno',
        description: 'Lunes a viernes de 8 a 12 pm',
        startsAt: now,
        endsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        active: true,
      },
      {
        title: 'Menú Ejecutivo',
        description: 'Lunes a viernes de 12 a 4 pm',
        active: true,
      },
    ],
  });

  await prisma.gallery.createMany({
    data: [
      { imageUrl: 'https://example.com/img/1.jpg', title: 'Platillo principal', altText: 'Karnes en su jugo', displayOrder: 1 },
      { imageUrl: 'https://example.com/img/2.jpg', title: 'Sucursal', altText: 'Interior de sucursal', displayOrder: 2 },
    ],
  });

  console.log('Seed complete.');
  console.log('Admin: admin@example.com / Admin123!');
  console.log('Editor: editor@example.com / Editor123!');
  console.log('WARNING: These are development-only credentials. Change them before production.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
