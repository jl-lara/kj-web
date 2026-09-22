import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

const base = 'https://karnesensujugotijuana.com/';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run the development seed in production.');
    process.exit(1);
  }

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
        description: 'Acompañado de consomé de Karne en su Jugo, tostaditas, rábanos, cebollas asadas, frijoles refritos con elote y tortillas de maíz hechas a mano.',
        price: '245.00',
        imageUrl: `${base}img/grande/1646802472.jpg`,
        displayOrder: 1,
      },
      {
        categoryId: especialidades.id,
        name: 'Rib Eye',
        description: 'Rib Eye 300 g con vegetales, papa al horno y consomé de Karnes en su Jugo.',
        price: '480.00',
        imageUrl: `${base}img/chica/1608092714.jpg`,
        displayOrder: 2,
      },
      {
        categoryId: especialidades.id,
        name: 'Parrillada de la Casa',
        description: 'Arrachera, pechuga de pollo, chistorra, panela, rajas, cebollas, frijoles, tortillas y 2 consomés.',
        price: '750.00',
        imageUrl: `${base}img/chica/1608094122.jpg`,
        displayOrder: 3,
      },
      {
        categoryId: desayuno.id,
        name: 'Los Clásicos',
        description: '2 huevos al gusto con nopales, chorizo, jamón, tocino o salchicha.',
        price: '180.00',
        imageUrl: `${base}img/chica/1608178818.jpg`,
        displayOrder: 1,
      },
      {
        categoryId: desayuno.id,
        name: 'Rancheros',
        description: '2 huevos estrellados en salsa ranchera con papas sazonadas, frijol y tortillas hechas a mano.',
        price: '180.00',
        imageUrl: `${base}img/chica/1608354365.jpg`,
        displayOrder: 2,
      },
      {
        categoryId: desayuno.id,
        name: 'Chilaquiles KJ',
        description: 'Chilaquiles con Karne en su Jugo, frijol de olla, cebolla, cilantro y tocino.',
        price: '280.00',
        imageUrl: `${base}img/chica/1614743851.jpg`,
        displayOrder: 3,
      },
      {
        categoryId: comida.id,
        name: 'Quesadilla KJ',
        description: 'Quesadilla con Karnes en su Jugo, frijol de olla, tortilla hecha a mano, cebolla y cilantro.',
        price: '80.00',
        imageUrl: `${base}img/chica/1608352549.jpg`,
        displayOrder: 1,
      },
      {
        categoryId: comida.id,
        name: 'Guacamole',
        description: 'Tradicional guacamole con tomate, cebolla y chile. Servido con tostaditas.',
        price: '130.00',
        imageUrl: `${base}img/chica/1468818894.jpg`,
        displayOrder: 2,
      },
      {
        categoryId: comida.id,
        name: 'Molcajete Del Patrón',
        description: 'Molcajete con pescado, camarón, pulpo, nopal, cebolla asada, panela y salsa roja.',
        price: '440.00',
        imageUrl: `${base}img/chica/1616033526.png`,
        displayOrder: 3,
      },
    ],
  });

  await prisma.location.createMany({
    data: [
      {
        name: 'Karnes en su Jugo Tijuana - Zona Río',
        address: 'Av. Padre Kino #10101 Zona Río, Tijuana Baja California, México C.P. 22010',
        phone: '664-682-3161',
        whatsapp: '+526646823161',
        imageUrl: `${base}img/ubicacion_1_karnes_en_su_jugo_tj.jpg`,
        mapsUrl: 'https://www.google.com/maps/place/KJ+Karnes+en+su+Jugo/@32.5344027,-117.0176291,18.75z/data=!4m5!3m4!1s0x0:0x43f066ed3349d51!8m2!3d32.534416!4d-117.0165637',
        displayOrder: 1,
      },
      {
        name: 'Karnes en su Jugo sucursal 3ra Etapa del Río',
        address: 'Ruta Independencia 16702-local 9, Zona Río 3ra Etapa, Tijuana Baja California, México C.P. 22226',
        phone: '664-647-9400',
        whatsapp: '+526646479400',
        imageUrl: `${base}img/ubicacion_5_karnes_en_su_jugo_tj.jpg`,
        mapsUrl: 'https://www.google.com/maps/place/Karnes+en+su+Jugo+sucursal+3ra+Etapa+del+R%C3%ADo/@32.4922369,-116.9331966,17z/data=!3m1!4b1!4m5!3m4!1s0x80d93976b435e9bd:0x8289bd19f7312484!8m2!3d32.4922324!4d-116.9310079',
        displayOrder: 2,
      },
      {
        name: 'Karnes en su Jugo Tijuana - Boulevard',
        address: 'Blvd. Aguacaliente #1252 Esquina con Río Yaqui, Tijuana Baja California, México',
        phone: '664-524-9887',
        whatsapp: '+526645249887',
        imageUrl: `${base}img/ubicacion_3_karnes_en_su_jugo_tj.jpg`,
        displayOrder: 3,
      },
      {
        name: 'Karnes en su Jugo Tijuana - Centro',
        address: '4ta #8350-8 y Madero, Zona Centro C.P. 22000, Tijuana, B.C., México',
        phone: '664-660-7771',
        whatsapp: '+526646607771',
        imageUrl: `${base}img/ubicacion_4_karnes_en_su_jugo_tj.jpg`,
        mapsUrl: 'https://www.google.com/maps/place/KJ+Karnes+en+su+Jugo+sucursal+Centro/@32.5334567,-117.0349397,15z/data=!4m5!3m4!1s0x0:0x40984d5994ce6e08!8m2!3d32.5334567!4d-117.0349397?hl=es-US',
        displayOrder: 4,
      },
      {
        name: 'Karnes en su Jugo Playas de Tijuana',
        address: 'Paseo Estrella del Mar 359 Local 8 y 9, Sección Coronado, Playas de Tijuana, Tijuana, B.C., México C.P. 22504',
        phone: '664-207-6896',
        whatsapp: '+526642076896',
        imageUrl: `${base}img/ubicacion_4_karnes_en_su_jugo_playas.jpg`,
        mapsUrl: 'https://www.google.com/maps/@32.5316678,-117.1126159,19.89z?hl=es-US',
        displayOrder: 5,
      },
    ],
  });

  await prisma.promotion.createMany({
    data: [
      {
        title: 'Especial Desayuno',
        description: 'Lunes a Viernes de 8 am a 12 pm. Incluye café americano con refil, platillo y tortillas de maíz hechas a mano.',
        imageUrl: `${base}img/chica/1608354111.jpg`,
        price: '165.00',
        active: true,
      },
      {
        title: 'Menú Ejecutivo',
        description: 'Lunes a Viernes de 12 a 4 pm. Incluye consomé, platillo del día, tortillas de maíz hechas a mano o pan y una soda de sabor.',
        imageUrl: `${base}img/chica/1608353892.jpg`,
        price: '195.00',
        active: true,
      },
      {
        title: 'Servicio a Domicilio',
        description: 'Ya nos puedes encontrar en la App de Uber Eats, lleva KJ a tu mesa.',
        imageUrl: `${base}img/chica/1547256963.jpg`,
        active: true,
      },
    ],
  });

  await prisma.gallery.createMany({
    data: [
      { imageUrl: `${base}img/grande/1646802472.jpg`, title: 'Platillo principal', altText: 'Karnes en su jugo', displayOrder: 1 },
      { imageUrl: `${base}img/chica/1608354111.jpg`, title: 'Especial desayuno', altText: 'Desayuno de la casa', displayOrder: 2 },
      { imageUrl: `${base}img/ubicacion_1_karnes_en_su_jugo_tj.jpg`, title: 'Sucursal Zona Río', altText: 'Interior de sucursal', displayOrder: 3 },
    ],
  });

  await prisma.siteSettings.upsert({
    where: { singleton: 1 },
    update: {},
    create: {
      singleton: 1,
      siteName: 'Karnes en su Jugo Tijuana',
      description: 'Carnes en su jugo, platillos tradicionales y desayunos.',
      phone: '664-682-3161',
      whatsapp: '+526646823161',
      email: 'contacto@karnesensujugotijuana.com',
      address: 'Av. Padre Kino #10101 Zona Río, Tijuana, B.C.',
      facebook: 'https://www.facebook.com/karnesensujugotijuana',
      instagram: '',
      tiktok: '',
      openingHours: 'Lunes a domingo 8:00 - 22:00',
      logoUrl: '',
      faviconUrl: '',
    },
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
