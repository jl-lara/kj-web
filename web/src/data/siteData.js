const base = 'https://karnesensujugotijuana.com/';

export const images = {
  hero: `${base}img/dsc03348.jpg?v=3`,
  logo: `${base}img/logo-para-pagina.png`,
  signature: `${base}img/grande/1646802472.jpg`,
  history: `${base}img/carnes_en_su_jugo_2.jpg`,
};

export const navItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Menú', path: '/menu' },
  { label: 'Reservaciones', path: '/reservaciones' },
  { label: 'Sucursales', path: '/sucursales' },
  { label: 'Nuestra historia', path: '/historia' },
  { label: 'Promociones', path: '/promociones' },
  { label: 'Contacto', path: '/contacto' },
];

export const storyParagraphs = [
  'En 1973 el Sr. Eladio Pérez Gómez inicia un negocio en Culiacán, Sinaloa, teniendo como emblema un platillo típico de Guadalajara, Jalisco: las hoy muy conocidas carnes en su jugo.',
  'En 1975, el Sr. Flavio Pérez Gómez y su esposa Lolita inician la expansión al mudarse al noroeste del país y abrir su primera sucursal en Tijuana. Para 1981 abren una segunda sucursal en Chula Vista, C.A.',
  'Es hasta el 2011 que la segunda generación, los hijos de Don Flavio Pérez, toman las riendas del negocio familiar y reabren en la ciudad de Tijuana, B.C.',
  'En 2015 implementan cambios al concepto, creciendo en servicio y menú con el fin de mantener interesado el paladar de sus comensales.',
];

export const timeline = [
  { year: '1973', title: 'Inicio en Culiacán', text: 'Eladio Pérez Gómez inicia el negocio con carnes en su jugo como emblema.' },
  { year: '1975', title: 'Llegada a Tijuana', text: 'Flavio Pérez Gómez y Lolita abren la primera sucursal en Tijuana.' },
  { year: '1981', title: 'Expansión familiar', text: 'La familia abre una segunda sucursal en Chula Vista, C.A.' },
  { year: '2011', title: 'Segunda generación', text: 'Los hijos de Don Flavio reabren Karnes en su Jugo Tijuana.' },
  { year: '2015', title: 'Nuevo concepto', text: 'El servicio y el menú evolucionan manteniendo la receta familiar.' },
];

export const locations = [
  {
    name: 'Karnes en su Jugo Tijuana - Zona Río',
    address: 'Av. Padre Kino #10101 Zona Río, Tijuana Baja California, México C.P. 22010',
    phone: '664-682-3161',
    tel: '+526646823161',
    image: `${base}img/ubicacion_1_karnes_en_su_jugo_tj.jpg`,
    map: 'https://www.google.com/maps/place/KJ+Karnes+en+su+Jugo/@32.5344027,-117.0176291,18.75z/data=!4m5!3m4!1s0x0:0x43f066ed3349d51!8m2!3d32.534416!4d-117.0165637',
  },
  {
    name: 'Karnes en su Jugo sucursal 3ra Etapa del Río',
    address: 'Ruta Independencia 16702-local 9, Zona Río 3ra Etapa, Tijuana Baja California, México C.P. 22226',
    phone: '664-647-9400',
    tel: '+526646479400',
    image: `${base}img/ubicacion_5_karnes_en_su_jugo_tj.jpg`,
    map: 'https://www.google.com/maps/place/Karnes+en+su+Jugo+sucursal+3ra+Etapa+del+R%C3%ADo/@32.4922369,-116.9331966,17z/data=!3m1!4b1!4m5!3m4!1s0x80d93976b435e9bd:0x8289bd19f7312484!8m2!3d32.4922324!4d-116.9310079',
  },
  {
    name: 'Karnes en su Jugo Tijuana - Boulevard',
    address: 'Blvd. Aguacaliente #1252 Esquina con Río Yaqui, Tijuana Baja California, México',
    phone: '664-524-9887',
    tel: '+526645249887',
    image: `${base}img/ubicacion_3_karnes_en_su_jugo_tj.jpg`,
  },
  {
    name: 'Karnes en su Jugo Tijuana - Centro',
    address: '4ta #8350-8 y Madero, Zona Centro C.P. 22000, Tijuana, B.C., México',
    phone: '664-660-7771',
    tel: '+526646607771',
    image: `${base}img/ubicacion_4_karnes_en_su_jugo_tj.jpg`,
    map: 'https://www.google.com/maps/place/KJ+Karnes+en+su+Jugo+sucursal+Centro/@32.5334567,-117.0349397,15z/data=!4m5!3m4!1s0x0:0x40984d5994ce6e08!8m2!3d32.5334567!4d-117.0349397?hl=es-US',
  },
  {
    name: 'Karnes en su Jugo Playas de Tijuana',
    address: 'Paseo Estrella del Mar 359 Local 8 y 9, Sección Coronado, Playas de Tijuana, Tijuana, B.C., México C.P. 22504',
    phone: '664-207-6896',
    tel: '+526642076896',
    image: `${base}img/ubicacion_4_karnes_en_su_jugo_playas.jpg`,
    map: 'https://www.google.com/maps/@32.5316678,-117.1126159,19.89z?hl=es-US',
  },
];

export const menuCategories = [
  {
    id: 'especialidades',
    label: 'Especialidades',
    items: [
      {
        name: 'Karnes en su Jugo',
        description: 'Acompañado de consomé de Karne en su Jugo, tostaditas, rábanos, cebollas asadas, frijoles refritos con elote y tortillas de maíz hechas a mano.',
        price: '$245.00 pesos',
        image: `${base}img/grande/1646802472.jpg`,
        featured: true,
      },
      { name: 'Rib Eye', description: 'Rib Eye 300 g con vegetales, papa al horno y consomé de Karnes en su Jugo.', price: '$480.00 pesos', image: `${base}img/chica/1608092714.jpg` },
      { name: 'Parrillada de la Casa', description: 'Arrachera, pechuga de pollo, chistorra, panela, rajas, cebollas, frijoles, tortillas y 2 consomés.', price: '$750.00 pesos', image: `${base}img/chica/1608094122.jpg` },
    ],
  },
  {
    id: 'desayuno',
    label: 'Desayuno',
    items: [
      { name: 'Los Clásicos', description: '2 huevos al gusto con nopales, chorizo, jamón, tocino o salchicha.', price: '$180.00 pesos', image: `${base}img/chica/1608178818.jpg` },
      { name: 'Rancheros', description: '2 huevos estrellados en salsa ranchera con papas sazonadas, frijol y tortillas hechas a mano.', price: '$180.00 pesos', image: `${base}img/chica/1608354365.jpg` },
      { name: 'Chilaquiles KJ', description: 'Chilaquiles con Karne en su Jugo, frijol de olla, cebolla, cilantro y tocino.', price: '$280.00 pesos', image: `${base}img/chica/1614743851.jpg` },
    ],
  },
  {
    id: 'comida',
    label: 'Comida',
    items: [
      { name: 'Quesadilla KJ', description: 'Quesadilla con Karnes en su Jugo, frijol de olla, tortilla hecha a mano, cebolla y cilantro.', price: '$80.00 pesos', image: `${base}img/chica/1608352549.jpg` },
      { name: 'Guacamole', description: 'Tradicional guacamole con tomate, cebolla y chile. Servido con tostaditas.', price: '$130.00 pesos', image: `${base}img/chica/1468818894.jpg` },
      { name: 'Molcajete Del Patrón', description: 'Molcajete con pescado, camarón, pulpo, nopal, cebolla asada, panela y salsa roja.', price: '$440.00 pesos', image: `${base}img/chica/1616033526.png` },
    ],
  },
];

export const promotions = [
  { name: 'Especial Desayuno', description: 'Lunes a Viernes de 8 am a 12 pm. Incluye café americano con refil, platillo y tortillas de maíz hechas a mano.', price: '$165.00 pesos', image: `${base}img/chica/1608354111.jpg` },
  { name: 'Menú Ejecutivo', description: 'Lunes a Viernes de 12 a 4 pm. Incluye consomé, platillo del día, tortillas de maíz hechas a mano o pan y una soda de sabor.', price: '$195.00 pesos', image: `${base}img/chica/1608353892.jpg` },
  { name: 'Servicio a Domicilio', description: 'Ya nos puedes encontrar en la App de Uber Eats, lleva KJ a tu mesa.', image: `${base}img/chica/1547256963.jpg` },
];

export const social = {
  facebook: 'https://www.facebook.com/karnesensujugotijuana',
};
